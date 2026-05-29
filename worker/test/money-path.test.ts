// test/money-path.test.ts — locks down the revenue/security-critical paths so
// Stripe can be switched on without trusting untested logic with real cards.
import { describe, it, expect, vi, afterEach } from "vitest";

// metrics.track fires waitUntil writes we don't care about here.
vi.mock("../src/metrics", () => ({ track: () => {} }));

import {
  stripeWebhook,
  createCheckout,
  keyByCheckout,
  createDirectoryVerifiedCheckout,
  createFixCheckout,
} from "../src/stripe";
import {
  issueKey,
  revokeKey,
  resolveAuth,
  consume,
  gate,
  PLAN_LIMITS,
  type AuthCtx,
} from "../src/auth";
import { envMock, makeCtx, signStripe, checkoutCompleted } from "./helpers";

const WHSEC = "whsec_test_secret";

afterEach(() => {
  vi.unstubAllGlobals();
});

// ───────────────────────── webhook: signature / fail-closed ─────────────────
describe("stripeWebhook — signature & fail-closed", () => {
  it("production + no webhook secret → 503 and mints NO key", async () => {
    const env = envMock({ ENVIRONMENT: "production" }); // STRIPE_WEBHOOK_SECRET unset
    const raw = checkoutCompleted({ kind: "plan", plan: "pro" });
    const c = makeCtx({ env, body: raw, headers: { "stripe-signature": "t=1,v1=x" } });
    const res = await stripeWebhook(c);
    expect(res.status).toBe(503);
    expect(res.body.error).toBe("webhook_not_configured");
    expect(env.KEYS.__keys("key:").length).toBe(0);
  });

  it("secret set + missing signature header → 400", async () => {
    const env = envMock({ STRIPE_WEBHOOK_SECRET: WHSEC });
    const raw = checkoutCompleted({ kind: "plan", plan: "pro" });
    const c = makeCtx({ env, body: raw }); // no stripe-signature
    const res = await stripeWebhook(c);
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/signature/i);
    expect(env.KEYS.__keys("key:").length).toBe(0);
  });

  it("secret set + tampered/forged signature → 400 and mints NO key", async () => {
    const env = envMock({ STRIPE_WEBHOOK_SECRET: WHSEC });
    const raw = checkoutCompleted({ kind: "plan", plan: "pro" });
    // signed with the WRONG secret — a forger who doesn't know whsec
    const c = makeCtx({ env, body: raw, headers: { "stripe-signature": signStripe(raw, "whsec_attacker") } });
    const res = await stripeWebhook(c);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("invalid signature");
    expect(env.KEYS.__keys("key:").length).toBe(0);
  });

  it("secret set + stale timestamp (>300s) → rejected", async () => {
    const env = envMock({ STRIPE_WEBHOOK_SECRET: WHSEC });
    const raw = checkoutCompleted({ kind: "plan", plan: "pro" });
    const stale = Math.floor(Date.now() / 1000) - 9999;
    const c = makeCtx({ env, body: raw, headers: { "stripe-signature": signStripe(raw, WHSEC, stale) } });
    const res = await stripeWebhook(c);
    expect(res.status).toBe(400);
    expect(env.KEYS.__keys("key:").length).toBe(0);
  });

  it("dev env + no secret → accepts unsigned (does NOT 503)", async () => {
    const env = envMock({ ENVIRONMENT: "development" }); // no secret
    const raw = checkoutCompleted({ kind: "plan", plan: "pro" });
    const c = makeCtx({ env, body: raw });
    const res = await stripeWebhook(c);
    expect(res.status).toBe(200);
    expect(res.body.action).toBe("key_issued");
  });
});

// ───────────────────────── webhook: non-plan SKU guard ──────────────────────
// The audit's headline risk: a $129 badge / one-time fix silently minting a
// free Pro API key via the plan="pro" fallthrough.
describe("stripeWebhook — non-plan SKUs NEVER mint an API key", () => {
  async function fireSigned(metadata: Record<string, string>, extra: any = {}) {
    const env = envMock({ STRIPE_WEBHOOK_SECRET: WHSEC });
    const raw = checkoutCompleted(metadata, extra);
    const c = makeCtx({ env, body: raw, headers: { "stripe-signature": signStripe(raw, WHSEC) } });
    const res = await stripeWebhook(c);
    return { env, res };
  }

  it("directory_verified → sets verified:<slug>, mints no key", async () => {
    const { env, res } = await fireSigned({ kind: "directory_verified", slug: "allbirds-com" });
    expect(res.status).toBe(200);
    expect(res.body.action).toBe("verified_set");
    expect(env.KEYS.__map.has("verified:allbirds-com")).toBe(true);
    expect(env.KEYS.__keys("key:").length).toBe(0);
    expect(env.KEYS.__keys("user:").length).toBe(0);
  });

  it("agent_ready_fix → records a fix job + verified, mints no key", async () => {
    const { env, res } = await fireSigned({
      kind: "agent_ready_fix",
      slug: "foo-com",
      site_url: "https://foo.com",
    });
    expect(res.status).toBe(200);
    expect(res.body.action).toBe("fix_recorded");
    expect(env.KEYS.__keys("fix:").length).toBe(1);
    expect(env.KEYS.__map.has("verified:foo-com")).toBe(true);
    expect(env.KEYS.__keys("key:").length).toBe(0);
  });

  it("unknown kind → provisions NOTHING", async () => {
    const { env, res } = await fireSigned({ kind: "totally_new_sku", slug: "x-com" });
    expect(res.status).toBe(200);
    expect(res.body.ignored_kind).toBe("totally_new_sku");
    expect(env.KEYS.__keys("key:").length).toBe(0);
    expect(env.KEYS.__keys("verified:").length).toBe(0);
    expect(env.KEYS.__keys("fix:").length).toBe(0);
  });

  it("control: kind=plan DOES mint a key", async () => {
    const { env, res } = await fireSigned({ kind: "plan", plan: "pro" });
    expect(res.status).toBe(200);
    expect(res.body.action).toBe("key_issued");
    expect(env.KEYS.__keys("key:").length).toBe(1);
  });
});

// ───────────────────────── keyByCheckout fail-closed ────────────────────────
describe("keyByCheckout — non-plan session returns null key", () => {
  it("a paid directory_verified session does not mint a key when polled", async () => {
    const env = envMock({ STRIPE_SECRET_KEY: "sk_test_x" });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ payment_status: "paid", metadata: { kind: "directory_verified" } }),
      }))
    );
    const c = makeCtx({ env, query: { session_id: "cs_test_1" } });
    const res = await keyByCheckout(c);
    expect(res.body.key).toBeNull();
    expect(res.body.kind).toBe("directory_verified");
    expect(env.KEYS.__keys("key:").length).toBe(0);
  });
});

// ───────────────────────── checkout creators: 503 / guards ──────────────────
describe("checkout creators — fail-closed when unconfigured / unauthorized", () => {
  it("createCheckout → 503 when STRIPE_SECRET_KEY unset", async () => {
    const env = envMock();
    const c = makeCtx({ env, body: { email: "a@b.com", plan: "pro" } });
    const res = await createCheckout(c);
    expect(res.status).toBe(503);
    expect(res.body.error).toBe("stripe_not_configured");
  });

  it("createCheckout → 400 when email/plan missing", async () => {
    const env = envMock();
    const c = makeCtx({ env, body: {} });
    const res = await createCheckout(c);
    expect(res.status).toBe(400);
  });

  it("createDirectoryVerifiedCheckout → 401 for anonymous", async () => {
    const env = envMock({ STRIPE_SECRET_KEY: "sk", STRIPE_PRICE_VERIFIED: "price_v" });
    const c = makeCtx({ env, body: { url: "https://allbirds.com" } });
    const res = await createDirectoryVerifiedCheckout(c);
    expect(res.status).toBe(401);
  });

  it("createDirectoryVerifiedCheckout → 503 when price unset (signed in)", async () => {
    const env = envMock({ STRIPE_SECRET_KEY: "sk" }); // no STRIPE_PRICE_VERIFIED
    const key = await issueKey(env, "u1", "pro");
    const c = makeCtx({ env, headers: { authorization: `Bearer ${key}` }, body: { url: "https://allbirds.com" } });
    const res = await createDirectoryVerifiedCheckout(c);
    expect(res.status).toBe(503);
    expect(res.body.error).toBe("verified_sku_not_configured");
  });

  it("createDirectoryVerifiedCheckout → 403 when caller does not own the host", async () => {
    const env = envMock({ STRIPE_SECRET_KEY: "sk", STRIPE_PRICE_VERIFIED: "price_v" });
    const key = await issueKey(env, "u1", "pro");
    // no owner:host record → not the owner
    const c = makeCtx({ env, headers: { authorization: `Bearer ${key}` }, body: { url: "https://allbirds.com" } });
    const res = await createDirectoryVerifiedCheckout(c);
    expect(res.status).toBe(403);
    expect(res.body.error).toBe("ownership_required");
  });

  it("createFixCheckout → 400 on invalid email", async () => {
    const env = envMock({ STRIPE_SECRET_KEY: "sk", STRIPE_PRICE_FIX: "price_f" });
    const c = makeCtx({ env, body: { url: "https://x.com", email: "not-an-email" } });
    const res = await createFixCheckout(c);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("invalid_email");
  });

  it("createFixCheckout → 503 when price unset", async () => {
    const env = envMock({ STRIPE_SECRET_KEY: "sk" }); // no STRIPE_PRICE_FIX
    const c = makeCtx({ env, body: { url: "https://x.com", email: "a@b.com" } });
    const res = await createFixCheckout(c);
    expect(res.status).toBe(503);
    expect(res.body.error).toBe("fix_sku_not_configured");
  });
});

// ───────────────────────── auth: issuance, gating, dev-key ──────────────────
describe("auth — key issuance, plan gating, dev-key safety", () => {
  it("issueKey creates an active key + user index; prod keys are webmcp_live_", async () => {
    const env = envMock({ ENVIRONMENT: "production" });
    const key = await issueKey(env, "u1", "pro", "sub_1");
    expect(key.startsWith("webmcp_live_")).toBe(true);
    const rec = JSON.parse((await env.KEYS.get(`key:${key}`))!);
    expect(rec.status).toBe("active");
    expect(rec.plan).toBe("pro");
    const user = JSON.parse((await env.KEYS.get("user:u1"))!);
    expect(user.keys).toContain(key);
  });

  it("resolveAuth: active key resolves to its plan; revoked key falls back to anon", async () => {
    const env = envMock();
    const key = await issueKey(env, "u1", "pro");
    let c = makeCtx({ env, headers: { authorization: `Bearer ${key}` }, ip: "1.2.3.4" });
    let auth = await resolveAuth(c);
    expect(auth.plan).toBe("pro");
    expect(auth.anonymous).toBe(false);

    await revokeKey(env, key);
    c = makeCtx({ env, headers: { authorization: `Bearer ${key}` }, ip: "1.2.3.4" });
    auth = await resolveAuth(c);
    expect(auth.anonymous).toBe(true);
    expect(auth.plan).toBe("free");
  });

  it("the dev convenience key does NOT elevate in production", async () => {
    const env = envMock({ ENVIRONMENT: "production" });
    const c = makeCtx({ env, headers: { authorization: "Bearer webmcp_dev_local_anything" }, ip: "9.9.9.9" });
    const auth = await resolveAuth(c);
    expect(auth.plan).toBe("free");
    expect(auth.anonymous).toBe(true);
  });

  it("consume: free plan allows reads (100/day) but blocks executes (0/day)", async () => {
    const env = envMock();
    const auth: AuthCtx = { key: "anon:1.2.3.4", plan: "free", user_id: "anon:1.2.3.4", anonymous: true };
    const c = makeCtx({ env });
    const reads = await consume(c, auth, "reads");
    expect(reads.allowed).toBe(true);
    expect(reads.limit).toBe(PLAN_LIMITS.free.reads_per_day);
    const exec = await consume(c, auth, "executes");
    expect(exec.allowed).toBe(false);
    expect(exec.limit).toBe(0);
  });

  it("gate('execute') returns 402 for a free plan and does not call next", async () => {
    const env = envMock();
    const c = makeCtx({ env, ip: "1.2.3.4" }); // anonymous → free
    let nexted = false;
    const res: any = await gate("execute")(c as any, async () => {
      nexted = true;
    });
    expect(res.status).toBe(402);
    expect(res.body.error).toBe("payment_required");
    expect(nexted).toBe(false);
  });
});

// ───────────────────────── Builder mid-tier ($39) ──────────────────────────
describe("Builder tier — $39 conversion bridge enables live execute", () => {
  it("PLAN_LIMITS.builder sits strictly between free and pro and CAN execute", () => {
    expect(PLAN_LIMITS.builder).toEqual({
      reads_per_day: 2000,
      executes_per_day: 200,
      push_per_day: 1000,
      can_execute_paid: true,
    });
    expect(PLAN_LIMITS.free.executes_per_day).toBe(0);
    expect(PLAN_LIMITS.builder.executes_per_day).toBeGreaterThan(PLAN_LIMITS.free.executes_per_day);
    expect(PLAN_LIMITS.builder.executes_per_day).toBeLessThan(PLAN_LIMITS.pro.executes_per_day);
    expect(PLAN_LIMITS.builder.reads_per_day).toBeGreaterThan(PLAN_LIMITS.free.reads_per_day);
    expect(PLAN_LIMITS.builder.reads_per_day).toBeLessThan(PLAN_LIMITS.pro.reads_per_day);
  });

  it("gate('execute') ALLOWS a builder caller (where free gets 402)", async () => {
    const env = envMock();
    const key = await issueKey(env, "u_builder", "builder");
    const c = makeCtx({ env, headers: { authorization: `Bearer ${key}` }, ip: "5.5.5.5" });
    let nexted = false;
    const res: any = await gate("execute")(c as any, async () => {
      nexted = true;
    });
    expect(nexted).toBe(true);
    expect(res).toBeUndefined();
  });

  it("consume: builder allows executes up to 200/day", async () => {
    const env = envMock();
    const auth: AuthCtx = { key: "k_b", plan: "builder", user_id: "u_b", anonymous: false };
    const c = makeCtx({ env });
    const exec = await consume(c, auth, "executes");
    expect(exec.allowed).toBe(true);
    expect(exec.limit).toBe(200);
  });

  it("createCheckout maps a builder price from STRIPE_PRICE_TO_PLAN", async () => {
    const env = envMock({
      STRIPE_SECRET_KEY: "sk_test_x",
      STRIPE_PRICE_TO_PLAN: JSON.stringify({ price_builder123: "builder" }),
    });
    let sentBody = "";
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init: any) => {
        sentBody = init.body;
        return { ok: true, json: async () => ({ url: "https://stripe/checkout", id: "cs_b" }) };
      })
    );
    const c = makeCtx({ env, body: { email: "a@b.com", plan: "builder" } });
    const res = await createCheckout(c);
    expect(res.body.url).toContain("stripe");
    expect(decodeURIComponent(sentBody)).toContain("price_builder123");
    expect(decodeURIComponent(sentBody)).toContain("metadata[plan]=builder");
  });
});
