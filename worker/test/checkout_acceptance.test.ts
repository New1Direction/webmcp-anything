import { describe, expect, it, vi, afterEach } from "vitest";
import { createFixCheckout, stripeWebhook } from "../src/stripe";
import { paidOrderQueue, completePaidFix } from "../src/paid_orders";
import { envMock, makeCtx, signStripe } from "./helpers";

afterEach(() => vi.unstubAllGlobals());
const SIGNING = "whsec_integration_test_only";

describe("one-time fix purchase → signed webhook → fulfillment acceptance (Stripe simulated)", () => {
  it("records a paid order exactly once, alerts the operator, and grants Verified only after evidence", async () => {
    const env = envMock({
      ENVIRONMENT: "production", STRIPE_SECRET_KEY: "sk_test_fake",
      STRIPE_WEBHOOK_SECRET: SIGNING, STRIPE_PRICE_FIX: "price_test_fix",
      ADMIN_TOKEN: "operator_token",
      LEAD_ALERT_WEBHOOK: "https://alerts.example.test/paid-orders",
    });
    let params: URLSearchParams | undefined;
    const alerts: string[] = [];
    vi.stubGlobal("fetch", vi.fn(async (url: string, init: any) => {
      if (String(url).endsWith("/checkout/sessions")) {
        expect(init.headers.authorization).toBe("Bearer sk_test_fake");
        params = new URLSearchParams(init.body);
        return { ok: true, status: 200, json: async () => ({
          id: "cs_test_acceptance", url: "https://checkout.stripe.com/test-session",
        }) };
      }
      if (String(url).includes("alerts.example.test")) {
        alerts.push(JSON.parse(init.body).text);
        return { ok: true, status: 200 };
      }
      throw Error("Unexpected outbound request during payment acceptance");
    }));
    const checkout = await createFixCheckout(makeCtx({
      env, url: "https://wmcp.sh/api/v1/agent-ready/fix/checkout",
      body: { url: "https://merchant.example/products/item", email: "buyer@example.test" },
    }) as any);
    expect(checkout.status).toBe(200);
    expect(checkout.body.url).toBe("https://checkout.stripe.com/test-session");
    expect(params?.get("mode")).toBe("payment");
    expect(params?.get("line_items[0][price]")).toBe("price_test_fix");
    expect(params?.get("metadata[kind]")).toBe("agent_ready_fix");
    expect(params?.get("success_url")).toBe("https://wmcp.sh/managed?fix=ok");
    expect(params?.get("customer_email")).toBe("buyer@example.test");

    const object = {
      id: "cs_test_acceptance", payment_status: "unpaid", amount_total: 49900,
      currency: "usd", customer_email: "buyer@example.test",
      metadata: {
        kind: params?.get("metadata[kind]"),
        slug: params?.get("metadata[slug]"),
        site_url: params?.get("metadata[site_url]"),
      },
    };
    async function deliver(type: string, status: string, signatureSecret = SIGNING) {
      const raw = JSON.stringify({
        id: "evt_test_" + type + status,
        created: Math.floor(Date.now() / 1000),
        type, data: { object: { ...object, payment_status: status } },
      });
      const c = makeCtx({ env, body: raw, headers: {
        "stripe-signature": signStripe(raw, signatureSecret),
      }});
      const result = await stripeWebhook(c as any);
      await Promise.all(c.__waited);
      return result;
    }
    const rejected = await deliver("checkout.session.completed", "paid", "wrong_secret");
    expect(rejected.status).toBe(400);
    expect(env.KEYS.__keys("fix:")).toHaveLength(0);

    const pending = await deliver("checkout.session.completed", "unpaid");
    expect(pending.body.action).toBe("payment_pending");
    expect(env.KEYS.__keys("fix:")).toHaveLength(0);
    expect(env.KEYS.__keys("verified:")).toHaveLength(0);

    const successful = await deliver("checkout.session.async_payment_succeeded", "paid");
    expect(successful.body.action).toBe("fix_recorded");
    const replay = await deliver("checkout.session.async_payment_succeeded", "paid");
    expect(replay.body.action).toBe("fix_already_recorded");
    expect(env.KEYS.__keys("fix:")).toHaveLength(1);
    expect(alerts).toHaveLength(1);
    expect(env.KEYS.__keys("key:")).toHaveLength(0);
    expect(env.KEYS.__keys("verified:")).toHaveLength(0);

    const unauthorized = await paidOrderQueue(makeCtx({ env }) as any);
    expect(unauthorized.status).toBe(401);
    const auth = { "x-admin-token": "operator_token" };
    const list = await paidOrderQueue(makeCtx({ env, headers: auth }) as any);
    expect(list.status).toBe(200);
    expect(list.body.pending_count).toBe(1);
    const key = list.body.orders[0].order_key;
    expect(list.body.orders[0].site_url).toContain("merchant.example");

    const bad = await completePaidFix(makeCtx({ env, headers: auth,
      body: { order_key: key, evidence_url: "http://not-https.test" } }) as any);
    expect(bad.status).toBe(400);
    expect(env.KEYS.__keys("verified:")).toHaveLength(0);

    const done = await completePaidFix(makeCtx({ env, headers: auth, body: {
      order_key: key, evidence_url: "https://github.com/company/customer/pull/12",
    } }) as any);
    expect(done.body).toMatchObject({ ok: true, action: "fulfilled", verified: true });
    expect(env.KEYS.__keys("verified:")).toHaveLength(1);
    expect(env.KEYS.__keys("key:")).toHaveLength(0);
    const after = await paidOrderQueue(makeCtx({ env, headers: auth }) as any);
    expect(after.body.pending_count).toBe(0);
    expect(after.body.orders[0].status).toBe("fulfilled");
  });
});
