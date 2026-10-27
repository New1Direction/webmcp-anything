import { describe, expect, it } from "vitest";
import { paidOrderQueue, completePaidFix } from "../src/paid_orders";
import { envMock, makeCtx } from "./helpers";

const orderKey = "fix:9005460908765432:deadbeef";
const base = {
  status: "paid_pending_fulfillment",
  received_at: Date.now(),
  slug: "foo-com",
  site_url: "https://foo.com",
  email: "buyer@example.com",
  checkout_session_id: "cs_test",
};

function ctx(env: any, headers: any = {}, body: any = {}) {
  return makeCtx({ env, headers, body });
}

describe("paid fulfillment operations", () => {
  it("requires the operator token for both reads and fulfillment", async () => {
    const env = envMock({ ADMIN_TOKEN: "admin123" });
    await env.KEYS.put(orderKey, JSON.stringify(base));
    expect((await paidOrderQueue(ctx(env) as any)).status).toBe(401);
    expect((await completePaidFix(ctx(env, {}, { order_key: orderKey, evidence_url: "https://github.com/proof" }) as any)).status).toBe(401);
    expect(env.KEYS.__keys("verified:")).toHaveLength(0);
  });

  it("lists paid work and verifies only after delivery evidence and approval", async () => {
    const env = envMock({ ADMIN_TOKEN: "admin123" });
    const headers = { "x-admin-token": "admin123" };
    await env.KEYS.put(orderKey, JSON.stringify(base));
    const q = await paidOrderQueue(ctx(env, headers) as any);
    expect(q.body.pending_count).toBe(1);
    expect(q.body.orders[0]).toMatchObject({ order_key: orderKey, kind: "agent_ready_fix" });
    expect(env.KEYS.__keys("verified:")).toHaveLength(0);

    const missing = await completePaidFix(ctx(env, headers, { order_key: orderKey }) as any);
    expect(missing.status).toBe(400);
    const invalid = await completePaidFix(ctx(env, headers, {
      order_key: orderKey, evidence_url: "http://insecure.example",
    }) as any);
    expect(invalid.status).toBe(400);
    expect(env.KEYS.__keys("verified:")).toHaveLength(0);

    const approved = await completePaidFix(ctx(env, headers, {
      order_key: orderKey, evidence_url: "https://github.com/org/repo/pull/1",
    }) as any);
    expect(approved.body).toMatchObject({ ok: true, action: "fulfilled", slug: "foo-com", verified: true });
    expect(await env.KEYS.get("verified:foo-com")).toBe("1");
    expect(JSON.parse(await env.KEYS.get(orderKey))).toMatchObject({
      status: "fulfilled", evidence_url: "https://github.com/org/repo/pull/1",
    });
    const replay = await completePaidFix(ctx(env, headers, {
      order_key: orderKey, evidence_url: "https://github.com/proof",
    }) as any);
    expect(replay.body.action).toBe("already_fulfilled");
  });

  it("rejects arbitrary KV keys and unpaid orders", async () => {
    const env = envMock({ ADMIN_TOKEN: "admin123" });
    const headers = { "x-admin-token": "admin123" };
    await env.KEYS.put(orderKey, JSON.stringify({ ...base, status: "unpaid" }));
    const bad = await completePaidFix(ctx(env, headers, {
      order_key: "verified:another-site", evidence_url: "https://github.com/proof",
    }) as any);
    expect(bad.status).toBe(400);
    const unpaid = await completePaidFix(ctx(env, headers, {
      order_key: orderKey, evidence_url: "https://github.com/proof",
    }) as any);
    expect(unpaid.status).toBe(409);
    expect(env.KEYS.__keys("verified:")).toHaveLength(0);
  });
});
