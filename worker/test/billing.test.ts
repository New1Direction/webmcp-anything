// test/billing.test.ts — self-serve billing: account-bound checkout,
// entitlement sync (price-first, stale/foreign events, dunning), portal +
// in-place plan switch (session-only), key recovery that never leaks keys,
// and the actionable paywall.
import { describe, it, expect, vi, afterEach } from "vitest";
import { stripeWebhook, createCheckout, keyByCheckout, recoverByEmail } from "../src/stripe";
import { billingPortal, changePlan, billingStatus } from "../src/billing";
import { issueKey, resolveAuth, gate } from "../src/auth";
import { envMock, makeCtx, signStripe } from "./helpers";

const WHSEC = "whsec_test_secret";
const PRICES = JSON.stringify({ price_b: "builder", price_p: "pro", price_r: "reseller" });

afterEach(() => vi.unstubAllGlobals());

function env(over: Record<string, any> = {}) {
  return envMock({ STRIPE_WEBHOOK_SECRET: WHSEC, STRIPE_SECRET_KEY: "sk_test_x", STRIPE_PRICE_TO_PLAN: PRICES, ...over });
}

async function signIn(e: any, user_id: string, sid = "sid_" + user_id.replace(/\W/g, "")) {
  await e.KEYS.put(`session:${sid}`, JSON.stringify({ user_id, email: "dev@example.com", created_at: Date.now() }));
  return { cookie: `wmcp_session=${sid}` };
}

async function fire(e: any, type: string, object: any, created = Math.floor(Date.now() / 1000)) {
  const raw = JSON.stringify({ id: "evt_" + created, type, created, data: { object } });
  const c = makeCtx({ env: e, body: raw, headers: { "stripe-signature": signStripe(raw, WHSEC) } });
  const res = await stripeWebhook(c);
  await Promise.all(c.__waited);
  return res;
}

function sub(over: any = {}) {
  return {
    id: "sub_1",
    customer: "cus_1",
    status: "active",
    current_period_end: 1893456000,
    cancel_at_period_end: false,
    metadata: { kind: "plan", plan: "builder", user_id: "gh:1" },
    items: { data: [{ id: "si_1", price: { id: "price_b" } }] },
    ...over,
  };
}

const user = async (e: any, id: string) => JSON.parse((await e.KEYS.get(`user:${id}`))!);
const keyRec = async (e: any, k: string) => JSON.parse((await e.KEYS.get(`key:${k}`))!);

describe("checkout — bound to the signed-in account", () => {
  it("binds metadata.user_id, reuses the Stripe customer, ignores a caller-supplied origin", async () => {
    const e = env();
    const { cookie } = await signIn(e, "gh:1");
    await e.KEYS.put("user:gh:1", JSON.stringify({ plan: "free", keys: [], billing: { customer_id: "cus_old", status: "canceled" } }));
    let sent = "";
    vi.stubGlobal("fetch", vi.fn(async (_u: string, init: any) => {
      sent = decodeURIComponent(init.body);
      return { ok: true, json: async () => ({ url: "https://checkout.stripe.com/x", id: "cs_1" }) };
    }));
    const c = makeCtx({ env: e, url: "https://wmcp.sh/api/v1/stripe/checkout", headers: { cookie }, body: { plan: "pro", origin: "https://evil.example", source: "paywall_execute_required" } });
    const res = await createCheckout(c);
    expect(res.body.url).toContain("stripe");
    expect(sent).toContain("metadata[user_id]=gh:1");
    expect(sent).toContain("subscription_data[metadata][user_id]=gh:1");
    expect(sent).toContain("customer=cus_old");
    expect(sent).not.toContain("customer_email");
    expect(sent).toContain("success_url=https://wmcp.sh/dashboard");
    expect(sent).not.toContain("evil.example");
    expect(sent).toContain("metadata[source]=paywall_execute_required");
  });

  it("refuses a second subscription for an already-entitled account (409)", async () => {
    const e = env();
    const { cookie } = await signIn(e, "gh:1");
    await e.KEYS.put("user:gh:1", JSON.stringify({ plan: "builder", keys: [], billing: { sub_id: "sub_1", status: "active" } }));
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const res = await createCheckout(makeCtx({ env: e, headers: { cookie }, body: { plan: "pro" } }));
    expect(res.status).toBe(409);
    expect(res.body.error).toBe("already_subscribed");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("rejects a non-paid plan name", async () => {
    const res = await createCheckout(makeCtx({ env: env(), body: { plan: "free", email: "a@b.co" } }));
    expect(res.status).toBe(400);
  });
});

describe("webhook — entitlement sync", () => {
  it("account-bound checkout upgrades the signed-in account and its existing key (no detached cust: account)", async () => {
    const e = env();
    const key = await issueKey(e, "gh:1", "free");
    const res = await fire(e, "checkout.session.completed", {
      id: "cs_1", customer: "cus_1", subscription: "sub_1", payment_status: "paid",
      metadata: { kind: "plan", plan: "builder", user_id: "gh:1" },
    });
    expect(res.body.user_id).toBe("gh:1");
    expect((await user(e, "gh:1")).plan).toBe("builder");
    expect((await keyRec(e, key)).plan).toBe("builder");
    expect(e.KEYS.__keys("key:").length).toBe(1);
    expect(e.KEYS.__map.has("user:cust:cus_1")).toBe(false);
    expect(await e.KEYS.get("stripecust:cus_1")).toBe("gh:1");

    const { cookie } = await signIn(e, "gh:1");
    expect((await resolveAuth(makeCtx({ env: e, headers: { cookie } }))).plan).toBe("builder");
  });

  it("a plan switch changes the PRICE but not metadata.plan — the price wins", async () => {
    const e = env();
    await fire(e, "customer.subscription.created", sub(), 100);
    const res = await fire(e, "customer.subscription.updated", sub({ items: { data: [{ id: "si_1", price: { id: "price_p" } }] } }), 200);
    expect(res.body.plan).toBe("pro");
    expect((await user(e, "gh:1")).plan).toBe("pro");
  });

  it("subscription events without user metadata find the account via the customer index", async () => {
    const e = env();
    await fire(e, "customer.subscription.created", sub(), 100);
    await fire(e, "customer.subscription.updated", sub({ metadata: {}, items: { data: [{ id: "si_1", price: { id: "price_r" } }] } }), 200);
    expect((await user(e, "gh:1")).plan).toBe("reseller");
    expect(e.KEYS.__map.has("user:cust:cus_1")).toBe(false);
  });

  it("an older event delivered late does not roll the entitlement back", async () => {
    const e = env();
    await fire(e, "customer.subscription.updated", sub({ items: { data: [{ id: "si_1", price: { id: "price_p" } }] } }), 200);
    const res = await fire(e, "customer.subscription.updated", sub({ status: "canceled" }), 150);
    expect(res.body.action).toBe("stale_ignored");
    expect((await user(e, "gh:1")).plan).toBe("pro");
  });

  it("past_due keeps the plan (dunning grace); unpaid drops to free", async () => {
    const e = env();
    await fire(e, "customer.subscription.created", sub(), 100);
    await fire(e, "customer.subscription.updated", sub({ status: "past_due" }), 200);
    expect((await user(e, "gh:1")).plan).toBe("builder");
    await fire(e, "customer.subscription.updated", sub({ status: "unpaid" }), 300);
    expect((await user(e, "gh:1")).plan).toBe("free");
  });

  it("cancellation downgrades to free: the key keeps working on the free tier and execute 402s with an upgrade path", async () => {
    const e = env();
    await fire(e, "customer.subscription.created", sub(), 100);
    const key = (await user(e, "gh:1")).keys[0];
    const res = await fire(e, "customer.subscription.deleted", sub(), 200);
    expect(res.body.action).toBe("downgraded");
    const kr = await keyRec(e, key);
    expect(kr).toMatchObject({ status: "active", plan: "free" });

    const c = makeCtx({ env: e, url: "https://wmcp.sh/api/v1/tools/execute", headers: { authorization: `Bearer ${key}` } });
    const r: any = await gate("execute")(c as any, async () => {});
    expect(r.status).toBe(402);
    expect(r.body.upgrade.recommended_plan).toBe("builder");
    expect(r.body.upgrade_url).toBe("https://wmcp.sh/dashboard?upgrade=builder&reason=execute_required&source=paywall_execute_required#plans");
    expect(r.body.hint).toContain("$39/mo");
  });

  it("deleting an OLD subscription does not cancel the account's current one", async () => {
    const e = env();
    await fire(e, "customer.subscription.created", sub({ id: "sub_new" }), 100);
    const res = await fire(e, "customer.subscription.deleted", sub({ id: "sub_old" }), 200);
    expect(res.body.action).toBe("other_subscription_ignored");
    expect((await user(e, "gh:1")).plan).toBe("builder");
  });

  it("a cancelled non-plan subscription (digital:*) never touches the API plan", async () => {
    const e = env();
    await fire(e, "customer.subscription.created", sub(), 100);
    const res = await fire(e, "customer.subscription.deleted", sub({ id: "sub_d", metadata: { kind: "digital:calcpro" } }), 200);
    expect(res.body.ignored_kind).toBe("digital:calcpro");
    expect((await user(e, "gh:1")).plan).toBe("builder");
  });
});

describe("keyByCheckout — account-bound sessions", () => {
  const session = { payment_status: "paid", customer: "cus_1", subscription: "sub_1", metadata: { kind: "plan", plan: "pro", user_id: "gh:1" } };

  it("does not reveal the account's key to someone else holding the success URL", async () => {
    const e = env();
    await issueKey(e, "gh:1", "free");
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => session })));
    const res = await keyByCheckout(makeCtx({ env: e, query: { session_id: "cs_1" }, ip: "6.6.6.6" }));
    expect(res.body.key).toBeNull();
    expect(res.body.sign_in_required).toBe(true);
  });

  it("does not re-grant a subscription the webhook already recorded as canceled", async () => {
    const e = env();
    await fire(e, "customer.subscription.created", sub(), 100);
    await fire(e, "customer.subscription.deleted", sub(), 200);
    const { cookie } = await signIn(e, "gh:1");
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => session })));
    const res = await keyByCheckout(makeCtx({ env: e, query: { session_id: "cs_1" }, headers: { cookie } }));
    expect(res.body.plan).toBe("free");
  });
});

describe("portal + plan switch — signed-in humans only", () => {
  it("an API key alone cannot open the billing portal", async () => {
    const e = env();
    const key = await issueKey(e, "gh:1", "pro");
    const res = await billingPortal(makeCtx({ env: e, headers: { authorization: `Bearer ${key}` } }));
    expect(res.status).toBe(401);
  });

  it("a foreign Origin is refused even with a valid session", async () => {
    const e = env();
    const { cookie } = await signIn(e, "gh:1");
    const res = await billingPortal(makeCtx({ env: e, url: "https://wmcp.sh/api/v1/billing/portal", headers: { cookie, origin: "https://evil.example" } }));
    expect(res.status).toBe(403);
  });

  it("opens the portal for the account's own customer", async () => {
    const e = env();
    const { cookie } = await signIn(e, "gh:1");
    await fire(e, "customer.subscription.created", sub(), 100);
    let sent = "";
    vi.stubGlobal("fetch", vi.fn(async (_u: string, init: any) => {
      sent = decodeURIComponent(init.body);
      return { ok: true, json: async () => ({ url: "https://billing.stripe.com/p/session" }) };
    }));
    const res = await billingPortal(makeCtx({ env: e, url: "https://wmcp.sh/api/v1/billing/portal", headers: { cookie, origin: "https://wmcp.sh" } }));
    expect(res.body.url).toContain("billing.stripe.com");
    expect(sent).toContain("customer=cus_1");
  });

  it("upgrade switches the price in place with immediate proration, then syncs the plan", async () => {
    const e = env();
    const { cookie } = await signIn(e, "gh:1");
    await fire(e, "customer.subscription.created", sub(), 100);
    const calls: { url: string; body?: string }[] = [];
    vi.stubGlobal("fetch", vi.fn(async (url: string, init: any) => {
      calls.push({ url, body: init?.body && decodeURIComponent(init.body) });
      if (!init?.body) return { ok: true, json: async () => sub() };
      return { ok: true, json: async () => sub({ items: { data: [{ id: "si_1", price: { id: "price_p" } }] } }) };
    }));
    const res = await changePlan(makeCtx({ env: e, headers: { cookie }, body: { plan: "pro" } }));
    expect(res.body).toMatchObject({ ok: true, plan: "pro" });
    const upd = calls.find((x) => x.body)!;
    expect(upd.url).toContain("/subscriptions/sub_1");
    expect(upd.body).toContain("items[0][id]=si_1");
    expect(upd.body).toContain("items[0][price]=price_p");
    expect(upd.body).toContain("proration_behavior=always_invoice");
    expect(upd.body).toContain("payment_behavior=pending_if_incomplete");
    expect((await user(e, "gh:1")).plan).toBe("pro");
  });

  it("an upgrade whose payment is still pending leaves the plan unchanged", async () => {
    const e = env();
    const { cookie } = await signIn(e, "gh:1");
    await fire(e, "customer.subscription.created", sub(), 100);
    vi.stubGlobal("fetch", vi.fn(async (_u: string, init: any) => ({
      ok: true,
      json: async () => (init?.body ? sub({ pending_update: { subscription_items: [] } }) : sub()),
    })));
    const res = await changePlan(makeCtx({ env: e, headers: { cookie }, body: { plan: "reseller" } }));
    expect(res.status).toBe(402);
    expect((await user(e, "gh:1")).plan).toBe("builder");
  });

  it("billing status reports manageability only to the signed-in session", async () => {
    const e = env();
    await fire(e, "customer.subscription.created", sub(), 100);
    const { cookie } = await signIn(e, "gh:1");
    const viaSession = await billingStatus(makeCtx({ env: e, headers: { cookie } }));
    expect(viaSession.body).toMatchObject({ plan: "builder", can_manage: true, can_change_plan: true, upgrade: { plan: "pro", price: "$99/mo" } });
    const key = (await user(e, "gh:1")).keys[0];
    const viaKey = await billingStatus(makeCtx({ env: e, headers: { authorization: `Bearer ${key}` } }));
    expect(viaKey.body.can_manage).toBe(false);
  });
});

describe("key recovery never returns keys in the response", () => {
  it("emails the key to the address on file; response is identical for unknown emails", async () => {
    const e = env({ RESEND_API_KEY: "re_x" });
    const key = await issueKey(e, "cust:cus_9", "pro");
    await e.KEYS.put("email:paid@example.com", "cust:cus_9");
    const mails: any[] = [];
    vi.stubGlobal("fetch", vi.fn(async (_u: string, init: any) => {
      mails.push(JSON.parse(init.body));
      return { ok: true, json: async () => ({}) };
    }));
    const known = await recoverByEmail(makeCtx({ env: e, body: { email: "Paid@Example.com" } }));
    const unknown = await recoverByEmail(makeCtx({ env: e, body: { email: "nobody@example.com" } }));
    expect(JSON.stringify(known.body)).not.toContain(key);
    expect(known.body).toEqual(unknown.body);
    expect(mails).toHaveLength(1);
    expect(mails[0].to).toEqual(["paid@example.com"]);
    expect(mails[0].html).toContain(key);
  });
});

describe("conversion instrumentation", () => {
  it("a paywall hit is counted by reason + plan with no identity in any counter key", async () => {
    const e = env();
    const c = makeCtx({ env: e, url: "https://wmcp.sh/api/v1/tools/execute", ip: "203.0.113.7" });
    await gate("execute")(c as any, async () => {});
    await Promise.all(c.__waited);
    const day = new Date().toISOString().slice(0, 10);
    expect(await e.USAGE.get(`metric:paywall_hit:${day}`)).toBe("1");
    expect(await e.USAGE.get(`conv:paywall_hit:reason.execute_required:${day}`)).toBe("1");
    expect(await e.USAGE.get(`conv:paywall_hit:plan.free:${day}`)).toBe("1");
    expect(e.USAGE.__keys().some((k: string) => k.includes("203.0.113.7"))).toBe(false);
  });
});
