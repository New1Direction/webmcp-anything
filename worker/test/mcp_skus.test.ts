// test/mcp_skus.test.ts — the trust-authority monetization SKUs
// (one-time deep audit + recurring continuous monitoring).
import { describe, it, expect, vi, afterEach } from "vitest";
vi.mock("../src/metrics", () => ({ track: () => {} }));

import { createDeepAuditCheckout, createMonitorCheckout, stripeWebhook } from "../src/stripe";
import { envMock, makeCtx, signStripe, checkoutCompleted } from "./helpers";

const WHSEC = "whsec_test_secret";
afterEach(() => vi.unstubAllGlobals());

function stubStripe() {
  let sent = "";
  vi.stubGlobal("fetch", vi.fn(async (_u: string, init: any) => {
    sent = init.body;
    return { ok: true, json: async () => ({ url: "https://stripe/c", id: "cs_x" }) };
  }));
  return () => sent;
}

describe("Deep Audit SKU (one-time)", () => {
  it("400 without url+email; 400 on invalid email", async () => {
    const env = envMock({ STRIPE_SECRET_KEY: "sk", STRIPE_PRICE_DEEP_AUDIT: "price_da" });
    expect((await createDeepAuditCheckout(makeCtx({ env, body: { url: "https://x.com/mcp" } }))).status).toBe(400);
    expect((await createDeepAuditCheckout(makeCtx({ env, body: { url: "https://x.com/mcp", email: "nope" } }))).status).toBe(400);
  });
  it("503 when price unset", async () => {
    const env = envMock({ STRIPE_SECRET_KEY: "sk" });
    const res = await createDeepAuditCheckout(makeCtx({ env, body: { url: "https://x.com/mcp", email: "a@b.com" } }));
    expect(res.status).toBe(503);
    expect(res.body.error).toBe("deep_audit_sku_not_configured");
  });
  it("creates a payment-mode deep_audit checkout with host metadata", async () => {
    const env = envMock({ STRIPE_SECRET_KEY: "sk", STRIPE_PRICE_DEEP_AUDIT: "price_da" });
    const sent = stubStripe();
    const res = await createDeepAuditCheckout(makeCtx({ env, body: { url: "https://mcp.x.com/mcp", email: "a@b.com" } }));
    expect(res.body.url).toContain("stripe");
    const d = decodeURIComponent(sent());
    expect(d).toContain("mode=payment");
    expect(d).toContain("metadata[kind]=deep_audit");
    expect(d).toContain("metadata[host]=mcp.x.com");
  });
});

describe("Continuous Monitoring SKU (recurring)", () => {
  it("400 without url; 400 on non-https alert_url", async () => {
    const env = envMock({ STRIPE_SECRET_KEY: "sk", STRIPE_PRICE_MONITOR: "price_m" });
    expect((await createMonitorCheckout(makeCtx({ env, body: {} }))).status).toBe(400);
    expect((await createMonitorCheckout(makeCtx({ env, body: { url: "https://x.com/mcp", alert_url: "http://insecure" } }))).status).toBe(400);
  });
  it("503 when price unset", async () => {
    const env = envMock({ STRIPE_SECRET_KEY: "sk" });
    const res = await createMonitorCheckout(makeCtx({ env, body: { url: "https://x.com/mcp" } }));
    expect(res.status).toBe(503);
    expect(res.body.error).toBe("monitor_sku_not_configured");
  });
  it("creates a subscription grade_monitor checkout carrying host + alert_url", async () => {
    const env = envMock({ STRIPE_SECRET_KEY: "sk", STRIPE_PRICE_MONITOR: "price_m" });
    const sent = stubStripe();
    const res = await createMonitorCheckout(makeCtx({ env, body: { url: "https://mcp.x.com/mcp", alert_url: "https://hooks.slack.com/x" } }));
    expect(res.body.url).toContain("stripe");
    const d = decodeURIComponent(sent());
    expect(d).toContain("mode=subscription");
    expect(d).toContain("metadata[kind]=grade_monitor");
    expect(d).toContain("metadata[host]=mcp.x.com");
    expect(d).toContain("subscription_data[metadata][kind]=grade_monitor");
  });
});

describe("trust-SKU webhooks are fail-closed (never mint a key)", () => {
  async function fire(raw: string) {
    const env = envMock({ STRIPE_WEBHOOK_SECRET: WHSEC });
    const c = makeCtx({ env, body: raw, headers: { "stripe-signature": signStripe(raw, WHSEC) } });
    return { env, res: await stripeWebhook(c) };
  }
  it("deep_audit → records a job, no key", async () => {
    const { env, res } = await fire(checkoutCompleted({ kind: "deep_audit", host: "mcp.x.com", target_url: "https://mcp.x.com/mcp" }));
    expect(res.body.action).toBe("deep_audit_recorded");
    expect(env.KEYS.__keys("deepaudit:").length).toBe(1);
    expect(env.KEYS.__keys("key:").length).toBe(0);
  });
  it("grade_monitor → writes a monitor subscription, no key", async () => {
    const { env, res } = await fire(checkoutCompleted({ kind: "grade_monitor", host: "mcp.x.com", alert_url: "https://hooks.slack.com/x" }));
    expect(res.body.action).toBe("monitor_active");
    expect(env.KEYS.__keys("monitorsub:mcp.x.com:").length).toBe(1);
    expect(env.KEYS.__keys("key:").length).toBe(0);
  });
  it("subscription.deleted grade_monitor → removes the subscription", async () => {
    const env = envMock({ STRIPE_WEBHOOK_SECRET: WHSEC });
    await env.KEYS.put("monitorsub:mcp.x.com:sub_test_1", JSON.stringify({ host: "mcp.x.com" }));
    const raw = JSON.stringify({ type: "customer.subscription.deleted", data: { object: { id: "sub_test_1", customer: "cus_1", status: "canceled", metadata: { kind: "grade_monitor", host: "mcp.x.com" } } } });
    const c = makeCtx({ env, body: raw, headers: { "stripe-signature": signStripe(raw, WHSEC) } });
    const res = await stripeWebhook(c);
    expect(res.body.action).toBe("monitor_removed");
    expect(env.KEYS.__keys("monitorsub:").length).toBe(0);
  });
});
