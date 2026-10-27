// HTTP-level acceptance against Hono's actual app.fetch, without live Stripe.
// Validates public route wiring, signature enforcement, status, fulfillment.
import { describe, it, expect, vi, afterEach } from "vitest";
import { signStripe, envMock } from "./helpers";
import worker from "../src/index";

const TEST_SECRET = "whsec_route_test_only";
const URL_BASE = "https://wmcp.sh";
afterEach(() => vi.unstubAllGlobals());

describe("Stripe HTTP route acceptance — isolated simulated Stripe", () => {
  it("accepts a signed, settled fix payment, queues fulfillment and verifies only on delivery", async () => {
    const env = envMock({
      CACHE: envMock().KEYS,
      ENVIRONMENT: "production",
      STRIPE_SECRET_KEY: "sk_test_synthetic",
      STRIPE_WEBHOOK_SECRET: TEST_SECRET,
      STRIPE_PRICE_FIX: "price_test_fix",
      ADMIN_TOKEN: "admin_only",
      LEAD_ALERT_WEBHOOK: "https://alerts.example.test/test-orders",
    });
    const formBodies: URLSearchParams[] = [];
    const notices: string[] = [];
    vi.stubGlobal("fetch", vi.fn(async (url: string, init: RequestInit) => {
      if (String(url).endsWith("/checkout/sessions")) {
        formBodies.push(new URLSearchParams(String(init.body)));
        return new Response(JSON.stringify({
          id: "cs_test_http_1", url: "https://checkout.stripe.com/test-checkout",
        }), { status: 200, headers: { "content-type": "application/json" } });
      }
      if (String(url).includes("alerts.example.test")) {
        notices.push(String(init.body));
        return new Response("", { status: 200 });
      }
      throw new Error("Unexpected external HTTP request: " + String(url));
    }));
    const waiting: Promise<unknown>[] = [];
    const ctx = { waitUntil(p: Promise<unknown>) { waiting.push(p); }, passThroughOnException() {} };
    async function call(path: string, method = "GET", body?: unknown, headers: Record<string, string> = {}) {
      const req = new Request(URL_BASE + path, {
        method,
        headers: { ...(body === undefined ? {} : { "content-type": "application/json" }), ...headers },
        ...(body === undefined ? {} : { body: typeof body === "string" ? body : JSON.stringify(body) }),
      });
      const res = await worker.fetch(req, env, ctx as any);
      const payload = await res.json().catch(() => null);
      await Promise.all(waiting.splice(0));
      return { status: res.status, payload };
    }
    const order = await call("/api/v1/agent-ready/fix/checkout", "POST", {
      url: "https://customer.example/products/widget", email: "buyer@example.com",
    });
    expect(order.status).toBe(200);
    expect(order.payload.url).toContain("checkout.stripe.com/test-checkout");
    expect(formBodies).toHaveLength(1);
    expect(formBodies[0].get("metadata[kind]")).toBe("agent_ready_fix");
    expect(formBodies[0].get("mode")).toBe("payment");

    const checkoutObj = {
      id: "cs_test_http_1", payment_status: "paid",
      customer_email: "buyer@example.com", amount_total: 49900, currency: "usd",
      metadata: {
        kind: formBodies[0].get("metadata[kind]"),
        slug: formBodies[0].get("metadata[slug]"),
        site_url: formBodies[0].get("metadata[site_url]"),
      },
    };
    const raw = JSON.stringify({
      id: "evt_http_1", created: Math.floor(Date.now() / 1000),
      type: "checkout.session.completed", data: { object: checkoutObj },
    });
    const denied = await call("/api/v1/stripe/webhook", "POST", raw, {
      "stripe-signature": signStripe(raw, "wrong-secret"),
    });
    expect(denied.status).toBe(400);
    expect(env.KEYS.__keys("fix:")).toHaveLength(0);

    const paid = await call("/api/v1/stripe/webhook", "POST", raw, {
      "stripe-signature": signStripe(raw, TEST_SECRET),
    });
    expect(paid.status).toBe(200);
    expect(paid.payload.action).toBe("fix_recorded");
    expect(env.KEYS.__keys("verified:")).toHaveLength(0);
    expect(notices).toHaveLength(1);

    const unauthorized = await call("/api/v1/admin/paid-orders");
    expect(unauthorized.status).toBe(401);
    const auth = { "x-admin-token": "admin_only" };
    const list = await call("/api/v1/admin/paid-orders", "GET", undefined, auth);
    expect(list.status).toBe(200);
    expect(list.payload.pending_count).toBe(1);
    const record = list.payload.orders[0];
    expect(record.kind).toBe("agent_ready_fix");
    const completed = await call("/api/v1/admin/paid-fixes/complete", "POST", {
      order_key: record.order_key,
      evidence_url: "https://github.com/company/integration/pull/4",
    }, auth);
    expect(completed.status).toBe(200);
    expect(completed.payload).toMatchObject({ action: "fulfilled", verified: true });
    expect(env.KEYS.__keys("key:")).toHaveLength(0);
    expect(env.KEYS.__keys("verified:")).toHaveLength(1);
    const readiness = await call("/api/v1/admin/revenue-readiness", "GET", undefined, auth);
    expect(readiness.status).toBe(200);
    expect(readiness.payload.operational_status).toBe("configuration_only");
  });
});
