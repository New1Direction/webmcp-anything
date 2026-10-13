// billing.ts — self-serve API-plan billing: entitlement sync from Stripe,
// customer portal, in-app plan switching, and the billing status the dashboard
// renders. Checkout creation + the webhook router stay in stripe.ts.
//
// Entitlement model (KEYS namespace):
//   user:<user_id>            → { plan, keys[], email?, billing?: BillingState }
//   key:<key>                 → { user_id, plan, status, ... }  (plan mirrored)
//   stripecust:<cus_…>        → user_id   (customer → account, for portal +
//                                          subscription events that carry no
//                                          user metadata)
// `user.plan` is the EFFECTIVE plan (what gates enforce); billing.plan is the
// plan the subscription is for, which may differ while it's not entitled.

import type { Context } from "hono";
import { issueKey, resolveAuth, PLAN_LIMITS, type Plan } from "./auth";
import { readSessionCookie } from "./session";
import { track } from "./metrics";
import { isPaidPlan, planRank, nextPlan, PLAN_PRICE_USD, requestOrigin } from "./paywall";

export const STRIPE_API = "https://api.stripe.com/v1";

export type BillingEnv = {
  KEYS: KVNamespace;
  USAGE: KVNamespace;
  ENVIRONMENT: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_PRICE_TO_PLAN?: string;
};

export interface BillingState {
  customer_id?: string;
  sub_id?: string;
  status?: string;
  plan?: Plan;
  current_period_end?: number;
  cancel_at_period_end?: boolean;
  // Stripe event.created (unix s) of the last applied change — older events
  // arriving late must not roll the entitlement back.
  event_ts?: number;
  updated_at?: number;
}

// past_due keeps access while Stripe retries the card (dunning grace);
// canceled / unpaid / incomplete / incomplete_expired / paused do not.
const ENTITLED_STATUSES = new Set(["active", "trialing", "past_due"]);

export function isEntitled(status?: string): boolean {
  return !!status && ENTITLED_STATUSES.has(status);
}

export function parsePriceMap(s?: string): Record<string, Plan> {
  try {
    return JSON.parse(s || "{}");
  } catch {
    return {};
  }
}

export function invertPriceMap(s?: string): Partial<Record<Plan, string>> {
  const out: Partial<Record<Plan, string>> = {};
  for (const [price, plan] of Object.entries(parsePriceMap(s))) out[plan] = price;
  return out;
}

async function readUser(env: BillingEnv, user_id: string): Promise<any | null> {
  const raw = await env.KEYS.get(`user:${user_id}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Which wmcp account does a Stripe object belong to? Explicit metadata (set by
// our own account-bound checkout) wins, then the customer index, then the
// legacy anonymous-checkout ids. Never matched by email alone: Stripe doesn't
// verify checkout emails, so email matching would let a buyer attach a plan +
// key to someone else's account (and its vaulted provider tokens).
export async function resolveBillingUser(
  env: BillingEnv,
  o: { metaUserId?: string; customerId?: string; email?: string; fallbackId?: string }
): Promise<string> {
  if (o.metaUserId) return o.metaUserId;
  if (o.customerId) {
    const mapped = await env.KEYS.get(`stripecust:${o.customerId}`);
    return mapped || `cust:${o.customerId}`;
  }
  if (o.email) return `email:${o.email}`;
  return `sub:${o.fallbackId || "unknown"}`;
}

export interface EntitlementUpdate {
  plan: Plan;
  status: string;
  customer_id?: string;
  sub_id?: string;
  current_period_end?: number;
  cancel_at_period_end?: boolean;
  event_ts?: number;
  email?: string;
}

export interface SyncResult {
  action: "key_issued" | "plan_updated" | "downgraded" | "stale_ignored" | "other_subscription_ignored";
  plan: Plan;
  user_id: string;
  key?: string;
}

// The single writer of plan entitlement. Idempotent: replaying the same update
// leaves the same state (and never mints a second key).
export async function syncEntitlement(
  env: BillingEnv,
  ctx: { waitUntil(p: Promise<unknown>): void },
  user_id: string,
  u: EntitlementUpdate
): Promise<SyncResult> {
  const user = (await readUser(env, user_id)) || { keys: [], plan: "free" };
  const prev: BillingState = user.billing || {};
  const prevPlan: Plan = user.plan || "free";

  if (prev.event_ts && u.event_ts && u.event_ts < prev.event_ts) {
    return { action: "stale_ignored", plan: prevPlan, user_id };
  }
  // A late event about an older/abandoned subscription must not cancel access
  // granted by the account's current one.
  if (prev.sub_id && u.sub_id && prev.sub_id !== u.sub_id && isEntitled(prev.status) && !isEntitled(u.status)) {
    return { action: "other_subscription_ignored", plan: prevPlan, user_id };
  }

  const entitled = isEntitled(u.status) && isPaidPlan(u.plan);
  const effective: Plan = entitled ? u.plan : "free";

  user.keys = Array.isArray(user.keys) ? user.keys : [];
  user.plan = effective;
  if (u.email && !user.email) user.email = u.email;
  user.billing = {
    customer_id: u.customer_id || prev.customer_id,
    sub_id: u.sub_id || prev.sub_id,
    status: u.status,
    plan: u.plan,
    current_period_end: u.current_period_end ?? prev.current_period_end,
    cancel_at_period_end: u.cancel_at_period_end ?? false,
    event_ts: u.event_ts ?? prev.event_ts,
    updated_at: Date.now(),
  } satisfies BillingState;
  await env.KEYS.put(`user:${user_id}`, JSON.stringify(user));

  for (const k of user.keys) {
    const krRaw = await env.KEYS.get(`key:${k}`);
    if (!krRaw) continue;
    const kr = JSON.parse(krRaw);
    kr.plan = effective;
    // Paying again restores keys a previous cancellation revoked (legacy).
    if (entitled) kr.status = "active";
    if (u.sub_id) kr.stripe_sub_id = u.sub_id;
    await env.KEYS.put(`key:${k}`, JSON.stringify(kr));
  }

  if (u.customer_id) await env.KEYS.put(`stripecust:${u.customer_id}`, user_id);
  if (u.email) await env.KEYS.put(`email:${u.email.toLowerCase()}`, user_id);

  if (isPaidPlan(prevPlan) && effective === "free") {
    track(env, ctx, "subscription_ended", { plan: prevPlan, status: u.status });
  } else if (isPaidPlan(prevPlan) && effective !== prevPlan) {
    track(env, ctx, "plan_changed", {
      change: planRank(effective) > planRank(prevPlan) ? "upgrade" : "downgrade",
      to: effective,
    });
  }

  if (entitled && user.keys.length === 0) {
    const key = await issueKey(env as any, user_id, effective, u.sub_id);
    return { action: "key_issued", plan: effective, user_id, key };
  }
  return { action: effective === "free" && isPaidPlan(prevPlan) ? "downgraded" : "plan_updated", plan: effective, user_id };
}

// Map a Stripe Subscription object onto an entitlement update. The PRICE is
// authoritative: plan switches (portal or /billing/change-plan) change the
// price but leave the creation-time metadata.plan behind.
export function updateFromSubscription(env: BillingEnv, sub: any, event_ts?: number): EntitlementUpdate & { known: boolean } {
  const price_id: string | undefined = sub.items?.data?.[0]?.price?.id;
  const byPrice = price_id ? parsePriceMap(env.STRIPE_PRICE_TO_PLAN)[price_id] : undefined;
  const byMeta = sub.metadata?.plan as Plan | undefined;
  const plan = (isPaidPlan(byPrice) ? byPrice : isPaidPlan(byMeta) ? byMeta : undefined) as Plan | undefined;
  return {
    known: !!plan,
    plan: plan || "pro",
    status: String(sub.status || "active"),
    customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer?.id,
    sub_id: sub.id,
    current_period_end: sub.current_period_end ?? sub.items?.data?.[0]?.current_period_end,
    cancel_at_period_end: !!sub.cancel_at_period_end,
    event_ts,
  };
}

async function stripeFetch(env: BillingEnv, path: string, form?: URLSearchParams): Promise<{ ok: boolean; status: number; j: any }> {
  const res = await fetch(`${STRIPE_API}${path}`, {
    method: form ? "POST" : "GET",
    headers: {
      authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      ...(form ? { "content-type": "application/x-www-form-urlencoded" } : {}),
    },
    ...(form ? { body: form.toString() } : {}),
  });
  const j: any = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, j };
}

// Billing-changing actions need a signed-in HUMAN (session cookie). API keys
// are handed to agents; a leaked agent key must not be able to open the
// portal (cancel / change card) or switch plans.
async function sessionUser(c: Context<{ Bindings: BillingEnv }>): Promise<{ user_id: string; email?: string } | null> {
  const sid = readSessionCookie(c);
  if (!sid) return null;
  const raw = await c.env.KEYS.get(`session:${sid}`);
  if (!raw) return null;
  try {
    const s = JSON.parse(raw);
    return s.user_id ? { user_id: s.user_id, email: s.email } : null;
  } catch {
    return null;
  }
}

// Belt-and-braces CSRF guard on top of SameSite=Lax: a browser POST that
// declares a foreign Origin is refused.
function crossOrigin(c: Context): boolean {
  const o = c.req.header("origin");
  return !!o && o !== requestOrigin(c.req.url);
}

function customerIdFor(user_id: string, user: any): string | undefined {
  return user?.billing?.customer_id || (user_id.startsWith("cust:") ? user_id.slice(5) : undefined);
}

// GET /api/v1/billing — what the dashboard renders: effective plan, limits,
// subscription status, and the next plan up. Session or API key (read-only).
export async function billingStatus(c: Context<{ Bindings: BillingEnv }>) {
  const auth = await resolveAuth(c as any);
  if (auth.anonymous) {
    return c.json({ signed_in: false, plan: "free", limits: PLAN_LIMITS.free, upgrade: upgradeOption("free") });
  }
  const user = await readUser(c.env, auth.user_id);
  const b: BillingState = user?.billing || {};
  const viaSession = auth.key.startsWith("session:");
  const customer = customerIdFor(auth.user_id, user);
  return c.json({
    signed_in: viaSession,
    plan: auth.plan,
    limits: PLAN_LIMITS[auth.plan],
    billing: {
      status: b.status || (isPaidPlan(auth.plan) ? "active" : null),
      plan: b.plan || null,
      current_period_end: b.current_period_end || null,
      cancel_at_period_end: !!b.cancel_at_period_end,
      has_customer: !!customer,
    },
    can_manage: viaSession && !!customer,
    can_change_plan: viaSession && !!b.sub_id && isEntitled(b.status),
    upgrade: upgradeOption(auth.plan),
  });
}

function upgradeOption(plan: Plan) {
  const next = nextPlan(plan);
  return next ? { plan: next, price: `$${PLAN_PRICE_USD[next]}/mo` } : null;
}

// POST /api/v1/billing/portal — Stripe customer portal (invoices, card,
// cancel). Session-only.
export async function billingPortal(c: Context<{ Bindings: BillingEnv }>) {
  if (crossOrigin(c)) return c.json({ error: "cross_origin_forbidden" }, 403);
  const s = await sessionUser(c);
  if (!s) return c.json({ error: "sign_in_required", hint: "Sign in with GitHub on /dashboard to manage billing." }, 401);
  if (!c.env.STRIPE_SECRET_KEY) return c.json({ error: "stripe_not_configured" }, 503);
  const user = await readUser(c.env, s.user_id);
  const customer = customerIdFor(s.user_id, user);
  if (!customer) {
    return c.json({ error: "no_billing_account", hint: "No paid plan on this account yet — pick one on /dashboard." }, 404);
  }
  const form = new URLSearchParams();
  form.set("customer", customer);
  form.set("return_url", `${requestOrigin(c.req.url)}/dashboard?billing=updated#billing`);
  const r = await stripeFetch(c.env, "/billing_portal/sessions", form);
  if (!r.ok) return c.json({ error: "stripe_error", detail: r.j?.error?.message || null }, 502);
  track(c.env, c.executionCtx, "portal_opened", { plan: user?.plan || "free" });
  return c.json({ url: r.j.url });
}

// POST /api/v1/billing/change-plan { plan } — switch an active subscription
// between paid plans in place (no second subscription). Upgrades invoice the
// prorated difference immediately and only take effect once that payment
// succeeds (pending_if_incomplete); downgrades credit the next invoice.
export async function changePlan(c: Context<{ Bindings: BillingEnv }>) {
  if (crossOrigin(c)) return c.json({ error: "cross_origin_forbidden" }, 403);
  const s = await sessionUser(c);
  if (!s) return c.json({ error: "sign_in_required", hint: "Sign in with GitHub on /dashboard to change plans." }, 401);
  const body = await c.req.json<{ plan?: string }>().catch(() => null);
  const target = body?.plan;
  if (!isPaidPlan(target)) return c.json({ error: "invalid_plan", hint: "plan must be builder, pro or reseller. To cancel, use Manage billing." }, 400);
  if (!c.env.STRIPE_SECRET_KEY) return c.json({ error: "stripe_not_configured" }, 503);
  const price = invertPriceMap(c.env.STRIPE_PRICE_TO_PLAN)[target];
  if (!price) return c.json({ error: "no_price_for_plan", plan: target }, 400);

  const user = await readUser(c.env, s.user_id);
  const b: BillingState = user?.billing || {};
  if (!b.sub_id || !isEntitled(b.status)) {
    return c.json({ error: "no_active_subscription", hint: "Start a plan with checkout first." }, 409);
  }
  if (user.plan === target) return c.json({ error: "already_on_plan", plan: target }, 409);

  const cur = await stripeFetch(c.env, `/subscriptions/${encodeURIComponent(b.sub_id)}`);
  if (!cur.ok) return c.json({ error: "stripe_error", detail: cur.j?.error?.message || null }, 502);
  const item = cur.j.items?.data?.[0]?.id;
  if (!item) return c.json({ error: "subscription_has_no_items" }, 502);

  const upgrading = planRank(target) > planRank(user.plan || "free");
  const form = new URLSearchParams();
  form.set("items[0][id]", item);
  form.set("items[0][price]", price);
  if (upgrading) {
    form.set("proration_behavior", "always_invoice");
    form.set("payment_behavior", "pending_if_incomplete");
  } else {
    form.set("proration_behavior", "create_prorations");
  }
  const upd = await stripeFetch(c.env, `/subscriptions/${encodeURIComponent(b.sub_id)}`, form);
  if (!upd.ok) return c.json({ error: "stripe_error", detail: upd.j?.error?.message || null }, 502);
  if (upd.j.pending_update) {
    return c.json(
      { error: "payment_incomplete", hint: "The prorated charge needs attention (card declined or 3-D Secure). Open Manage billing to finish — your current plan is unchanged." },
      402
    );
  }
  const u = updateFromSubscription(c.env, upd.j, Math.floor(Date.now() / 1000));
  const r = await syncEntitlement(c.env, c.executionCtx, s.user_id, u);
  return c.json({ ok: true, plan: r.plan, action: r.action });
}
