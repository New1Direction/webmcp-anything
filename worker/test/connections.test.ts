// test/connections.test.ts — the per-connection managed OAuth-proxy SKU
// (the moat's revenue model): checkout, fail-closed webhook fulfillment,
// cancellation, and the proxy entitlement gate.
import { describe, it, expect, vi, afterEach } from "vitest";

vi.mock("../src/metrics", () => ({ track: () => {} }));

import { createManagedConnectionCheckout, stripeWebhook } from "../src/stripe";
import { listManagedConnections, hasManagedConnection, connKey } from "../src/connections";
import { mcpProxyHandler } from "../src/mcp_proxy";
import { issueKey } from "../src/auth";
import { envMock, makeCtx, signStripe, checkoutCompleted } from "./helpers";

const WHSEC = "whsec_test_secret";

afterEach(() => vi.unstubAllGlobals());

function subDeleted(metadata: Record<string, string>) {
  return JSON.stringify({
    type: "customer.subscription.deleted",
    data: { object: { id: "sub_x", customer: "cus_x", status: "canceled", metadata } },
  });
}

// ───────────────────────── checkout creator ─────────────────────────────────
describe("createManagedConnectionCheckout", () => {
  it("401 for anonymous", async () => {
    const env = envMock({ STRIPE_SECRET_KEY: "sk", STRIPE_PRICE_CONNECTION: "price_c" });
    const c = makeCtx({ env, body: { provider: "sentry" } });
    const res = await createManagedConnectionCheckout(c);
    expect(res.status).toBe(401);
  });

  it("400 when provider missing", async () => {
    const env = envMock({ STRIPE_SECRET_KEY: "sk", STRIPE_PRICE_CONNECTION: "price_c" });
    const key = await issueKey(env, "u1", "pro");
    const c = makeCtx({ env, headers: { authorization: `Bearer ${key}` }, body: {} });
    const res = await createManagedConnectionCheckout(c);
    expect(res.status).toBe(400);
  });

  it("404 for unknown or non-proxied provider", async () => {
    const env = envMock({ STRIPE_SECRET_KEY: "sk", STRIPE_PRICE_CONNECTION: "price_c" });
    const key = await issueKey(env, "u1", "pro");
    for (const provider of ["nope", "openai" /* registered but not mcpProxy */]) {
      const c = makeCtx({ env, headers: { authorization: `Bearer ${key}` }, body: { provider } });
      const res = await createManagedConnectionCheckout(c);
      expect(res.status).toBe(404);
    }
  });

  it("503 when STRIPE_PRICE_CONNECTION unset", async () => {
    const env = envMock({ STRIPE_SECRET_KEY: "sk" }); // no connection price
    const key = await issueKey(env, "u1", "pro");
    const c = makeCtx({ env, headers: { authorization: `Bearer ${key}` }, body: { provider: "sentry" } });
    const res = await createManagedConnectionCheckout(c);
    expect(res.status).toBe(503);
    expect(res.body.error).toBe("connection_sku_not_configured");
  });

  it("creates a recurring managed_connection checkout with the right metadata", async () => {
    const env = envMock({ STRIPE_SECRET_KEY: "sk", STRIPE_PRICE_CONNECTION: "price_conn_1" });
    const key = await issueKey(env, "u1", "pro");
    let sent = "";
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_u: string, init: any) => {
        sent = init.body;
        return { ok: true, json: async () => ({ url: "https://stripe/c", id: "cs_c" }) };
      })
    );
    const c = makeCtx({ env, headers: { authorization: `Bearer ${key}` }, body: { provider: "sentry" } });
    const res = await createManagedConnectionCheckout(c);
    expect(res.body.url).toContain("stripe");
    const decoded = decodeURIComponent(sent);
    expect(decoded).toContain("price_conn_1");
    expect(decoded).toContain("metadata[kind]=managed_connection");
    expect(decoded).toContain("metadata[provider]=sentry");
    expect(decoded).toContain("mode=subscription");
  });
});

// ───────────────────────── webhook fulfillment / cancel ─────────────────────
describe("managed_connection webhook — entitlement, never a key", () => {
  async function fire(raw: string) {
    const env = envMock({ STRIPE_WEBHOOK_SECRET: WHSEC });
    const c = makeCtx({ env, body: raw, headers: { "stripe-signature": signStripe(raw, WHSEC) } });
    const res = await stripeWebhook(c);
    return { env, res };
  }

  it("checkout.session.completed → conn:<user>:<provider> active, mints no key", async () => {
    const { env, res } = await fire(
      checkoutCompleted({ kind: "managed_connection", provider: "sentry", user_id: "u1" })
    );
    expect(res.status).toBe(200);
    expect(res.body.action).toBe("connection_active");
    expect(await hasManagedConnection(env, "u1", "sentry")).toBe(true);
    expect(await hasManagedConnection(env, "u1", "defillama")).toBe(false);
    expect(env.KEYS.__keys("key:").length).toBe(0);
  });

  it("subscription.deleted → entitlement removed", async () => {
    const env = envMock({ STRIPE_WEBHOOK_SECRET: WHSEC });
    await env.KEYS.put(connKey("u1", "sentry"), JSON.stringify({ status: "active" }));
    const raw = subDeleted({ kind: "managed_connection", provider: "sentry", user_id: "u1" });
    const c = makeCtx({ env, body: raw, headers: { "stripe-signature": signStripe(raw, WHSEC) } });
    const res = await stripeWebhook(c);
    expect(res.body.action).toBe("connection_removed");
    expect(await hasManagedConnection(env, "u1", "sentry")).toBe(false);
  });
});

// ───────────────────────── proxy entitlement gate ───────────────────────────
describe("/mcp/:provider gate — enforced only once billing is configured", () => {
  const auth = { user_id: "u1", anonymous: false };

  it("anonymous → 401 (before any billing check)", async () => {
    const env = envMock({ STRIPE_PRICE_CONNECTION: "price_c" });
    const c = makeCtx({
      env, params: { provider: "sentry" }, auth: { user_id: "anon", anonymous: true },
      url: "https://wmcp.sh/mcp/sentry",
    });
    const res = await mcpProxyHandler(c as any);
    expect(res.status).toBe(401);
  });

  it("billing configured + no entitlement → 402 connection_subscription_required", async () => {
    const env = envMock({ STRIPE_PRICE_CONNECTION: "price_c" });
    const c = makeCtx({ env, params: { provider: "sentry" }, auth, url: "https://wmcp.sh/mcp/sentry" });
    const res = await mcpProxyHandler(c as any);
    expect(res.status).toBe(402);
    expect(res.body.error).toBe("connection_subscription_required");
  });

  it("billing configured + entitlement present → passes gate (412 not_connected, no token yet)", async () => {
    const env = envMock({ STRIPE_PRICE_CONNECTION: "price_c" });
    await env.KEYS.put(connKey("u1", "sentry"), JSON.stringify({ status: "active" }));
    const c = makeCtx({ env, params: { provider: "sentry" }, auth, url: "https://wmcp.sh/mcp/sentry" });
    const res = await mcpProxyHandler(c as any);
    expect(res.status).toBe(412);
    expect(res.body.error).toBe("provider_not_connected");
  });

  it("billing NOT configured → gate skipped (412 not_connected), nobody locked out", async () => {
    const env = envMock(); // no STRIPE_PRICE_CONNECTION
    const c = makeCtx({ env, params: { provider: "sentry" }, auth, url: "https://wmcp.sh/mcp/sentry" });
    const res = await mcpProxyHandler(c as any);
    expect(res.status).toBe(412);
    expect(res.body.error).toBe("provider_not_connected");
  });
});

// ───────────────────────── list endpoint ────────────────────────────────────
describe("GET /api/v1/connections", () => {
  it("lists the caller's active managed connections", async () => {
    const env = envMock();
    const key = await issueKey(env, "u1", "pro");
    await env.KEYS.put(connKey("u1", "sentry"), JSON.stringify({ status: "active", since: 123 }));
    await env.KEYS.put(connKey("u1", "defillama"), JSON.stringify({ status: "active", since: 456 }));
    const c = makeCtx({ env, headers: { authorization: `Bearer ${key}` } });
    const res = await listManagedConnections(c);
    const providers = res.body.connections.map((x: any) => x.provider).sort();
    expect(providers).toEqual(["defillama", "sentry"]);
  });

  it("401 for anonymous", async () => {
    const env = envMock();
    const c = makeCtx({ env });
    const res = await listManagedConnections(c);
    expect(res.status).toBe(401);
  });
});
