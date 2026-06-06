// test/quickcatch.test.ts — the $12/mo consumer QuickCatch tier.
// License-key SKU (gates the browser extension), isolated from API plans.
import { describe, it, expect, vi, afterEach } from "vitest";
vi.mock("../src/metrics", () => ({ track: () => {} }));

import { createQuickCatchCheckout, verifyQuickCatch, stripeWebhook } from "../src/stripe";
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

describe("QuickCatch checkout ($12/mo consumer SKU)", () => {
  it("400 without a valid email", async () => {
    const env = envMock({ STRIPE_SECRET_KEY: "sk", STRIPE_PRICE_QUICKCATCH: "price_qc" });
    expect((await createQuickCatchCheckout(makeCtx({ env, body: {} }))).status).toBe(400);
    expect((await createQuickCatchCheckout(makeCtx({ env, body: { email: "nope" } }))).status).toBe(400);
  });
  it("503 fail-closed when the price is unset", async () => {
    const env = envMock({ STRIPE_SECRET_KEY: "sk" });
    const res = await createQuickCatchCheckout(makeCtx({ env, body: { email: "a@b.com" } }));
    expect(res.status).toBe(503);
    expect(res.body.error).toBe("quickcatch_not_configured");
  });
  it("creates a subscription quickcatch checkout carrying the email", async () => {
    const env = envMock({ STRIPE_SECRET_KEY: "sk", STRIPE_PRICE_QUICKCATCH: "price_qc" });
    const sent = stubStripe();
    const res = await createQuickCatchCheckout(makeCtx({ env, body: { email: "a@b.com" } }));
    expect(res.body.url).toContain("stripe");
    const d = decodeURIComponent(sent());
    expect(d).toContain("mode=subscription");
    expect(d).toContain("metadata[kind]=quickcatch");
    expect(d).toContain("subscription_data[metadata][kind]=quickcatch");
    expect(d).toContain("line_items[0][price]=price_qc");
  });
  it("threads the attribution source into Stripe (client_reference_id + metadata), defaulting to 'direct'", async () => {
    const env = envMock({ STRIPE_SECRET_KEY: "sk", STRIPE_PRICE_QUICKCATCH: "price_qc" });
    const sent = stubStripe();
    await createQuickCatchCheckout(makeCtx({ env, body: { email: "a@b.com", source: "ext_paywall" } }));
    let d = decodeURIComponent(sent());
    expect(d).toContain("client_reference_id=ext_paywall");
    expect(d).toContain("metadata[source]=ext_paywall");
    // default when no source supplied
    await createQuickCatchCheckout(makeCtx({ env, body: { email: "a@b.com" } }));
    expect(decodeURIComponent(sent())).toContain("metadata[source]=direct");
  });
});

describe("quickCatchPage (/quickcatch buy page — fixes the in-extension 404)", () => {
  it("renders the $12 buy page with a self-canonical and the source threaded into checkout", async () => {
    const { quickCatchPage } = await import("../src/stripe");
    const html = quickCatchPage(makeCtx({ env: envMock({}), method: "GET", query: { source: "ext_banner" } })).body as string;
    expect(html).toContain("$12");
    expect(html).toContain('rel="canonical" href="https://wmcp.sh/quickcatch"');
    expect(html).toContain('"ext_banner"'); // source baked into the page's checkout call
    expect(html).not.toContain("canceled — no charge");
  });
  it("shows the canceled note after an abandoned checkout", async () => {
    const { quickCatchPage } = await import("../src/stripe");
    const html = quickCatchPage(makeCtx({ env: envMock({}), method: "GET", query: { canceled: "1" } })).body as string;
    expect(html).toContain("canceled — no charge");
  });
});

describe("QuickCatch license: webhook issues it, verify gates on it (never a key)", () => {
  it("checkout webhook activates a license keyed to the buyer's email — no API key", async () => {
    const env = envMock({ STRIPE_WEBHOOK_SECRET: WHSEC });
    const raw = checkoutCompleted({ kind: "quickcatch", email: "buyer@example.com" });
    const c = makeCtx({ env, body: raw, headers: { "stripe-signature": signStripe(raw, WHSEC) } });
    const res = await stripeWebhook(c);
    expect(res.body.action).toBe("quickcatch_active");
    expect(env.KEYS.__keys("qcemail:").length).toBe(1);
    expect(env.KEYS.__keys("qclic:").length).toBe(1);
    expect(env.KEYS.__keys("key:").length).toBe(0); // isolated from the API plan ladder
  });

  it("verify is fail-closed: unknown key inactive, issued key active, cancelled key inactive", async () => {
    const env = envMock({ STRIPE_WEBHOOK_SECRET: WHSEC });
    // unknown
    expect((await verifyQuickCatch(makeCtx({ env, query: { key: "qc_does_not_exist" } }))).body.active).toBe(false);
    expect((await verifyQuickCatch(makeCtx({ env, query: { key: "not_even_a_qc_key" }}))).body.active).toBe(false);

    // issue via webhook, then read the key from the email map and verify active
    const raw = checkoutCompleted({ kind: "quickcatch", email: "buyer@example.com" }, { subscription: "sub_qc_1" });
    await stripeWebhook(makeCtx({ env, body: raw, headers: { "stripe-signature": signStripe(raw, WHSEC) } }));
    const key = await env.KEYS.get("qcemail:buyer@example.com");
    expect(key).toMatch(/^qc_/);
    expect((await verifyQuickCatch(makeCtx({ env, query: { key: key! } }))).body.active).toBe(true);

    // cancel the subscription → license deactivates → verify inactive
    const del = JSON.stringify({ type: "customer.subscription.deleted", data: { object: { id: "sub_qc_1", customer: "cus_1", status: "canceled", metadata: { kind: "quickcatch", email: "buyer@example.com" } } } });
    const delRes = await stripeWebhook(makeCtx({ env, body: del, headers: { "stripe-signature": signStripe(del, WHSEC) } }));
    expect(delRes.body.action).toBe("quickcatch_deactivated");
    expect((await verifyQuickCatch(makeCtx({ env, query: { key: key! } }))).body.active).toBe(false);
  });
});
