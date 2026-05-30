// auth.ts — API key auth + rate limiting.
//
// Key shape: webmcp_<env>_<32 random hex chars>     (Stripe-style)
// Stored in KV_KEYS:
//   key:webmcp_live_abc...    →  { user_id, plan, status, created_at, stripe_sub_id? }
//   user:u_xyz                →  { email, keys: [...], plan }
// Usage counters in KV_USAGE (separate namespace so it's not mixed with metadata):
//   usage:<key>:<YYYY-MM-DD>  →  request count for that day (TTL 7d)
//
// For local dev, a dev key `webmcp_dev_local_anything` always works on the
// pro plan so you don't need Stripe setup just to test execute endpoints.

import type { Context, MiddlewareHandler, Next } from "hono";
import { readSessionCookie } from "./session";

export type Plan = "free" | "builder" | "pro" | "reseller";

export interface KeyRecord {
  user_id: string;
  plan: Plan;
  status: "active" | "revoked";
  created_at: number;
  stripe_sub_id?: string;
}

export const PLAN_LIMITS: Record<Plan, {
  reads_per_day: number;
  executes_per_day: number;
  push_per_day: number;
  can_execute_paid: boolean;
}> = {
  free:     { reads_per_day: 100,   executes_per_day: 0,     push_per_day: 50,    can_execute_paid: false },
  builder:  { reads_per_day: 2000,  executes_per_day: 200,   push_per_day: 1000,  can_execute_paid: true  },
  pro:      { reads_per_day: 10000, executes_per_day: 1000,  push_per_day: 5000,  can_execute_paid: true  },
  reseller: { reads_per_day: 100000, executes_per_day: 50000, push_per_day: 100000, can_execute_paid: true },
};

// Dev convenience key — always pro plan, only works when ENVIRONMENT === "development"
const DEV_KEY = "webmcp_dev_local_anything";

type Bindings = {
  KEYS: KVNamespace;
  USAGE: KVNamespace;
  ENVIRONMENT: string;
  // Pricing flip (the funnel): when set to N>0, a FREE-plan caller gets N proxy
  // tool calls PER AGENT (per API key) per day before the paywall — so a dev can
  // run their whole fleet into the product before paying. Unset/0 → current
  // behavior (free plan 402s immediately). Operator-gated, default-off.
  PROXY_FREE_CALLS_PER_DAY?: string;
};

export type AuthCtx = {
  key: string;
  plan: Plan;
  user_id: string;
  anonymous: boolean;
};

export function bearer(c: Context): string | null {
  const h = c.req.header("authorization");
  if (h && h.toLowerCase().startsWith("bearer ")) return h.slice(7).trim();
  const q = c.req.query("key");
  if (q) return q;
  return null;
}

export async function resolveAuth(c: Context<{ Bindings: Bindings }>): Promise<AuthCtx> {
  // 1. Bearer token (API key) — highest priority.
  const key = bearer(c);
  if (key) {
    // Dev convenience key in development env only.
    if (key === DEV_KEY && c.env.ENVIRONMENT === "development") {
      return { key, plan: "pro", user_id: "dev:local", anonymous: false };
    }
    const raw = await c.env.KEYS.get(`key:${key}`);
    if (raw) {
      try {
        const rec = JSON.parse(raw) as KeyRecord;
        if (rec.status === "active") {
          return { key, plan: rec.plan, user_id: rec.user_id, anonymous: false };
        }
      } catch {
        // fall through to session/anon
      }
    }
    // Invalid/revoked key → don't elevate; fall through to session or anon.
  }

  // 2. Session cookie (browser-side auth via GitHub OAuth).
  const sid = readSessionCookie(c);
  if (sid) {
    const sessRaw = await c.env.KEYS.get(`session:${sid}`);
    if (sessRaw) {
      try {
        const sess = JSON.parse(sessRaw);
        const userRaw = await c.env.KEYS.get(`user:${sess.user_id}`);
        const plan: Plan = userRaw ? JSON.parse(userRaw).plan || "free" : "free";
        return {
          key: `session:${sid.slice(0, 8)}`,
          plan,
          user_id: sess.user_id,
          anonymous: false,
        };
      } catch {
        // fall through to anon
      }
    }
  }

  // 3. Anonymous — IP-rate-limited free tier.
  const ip = c.req.header("cf-connecting-ip") || "anon";
  return { key: `anon:${ip}`, plan: "free", user_id: `anon:${ip}`, anonymous: true };
}

/** Increment & enforce daily quota for a given action category. Returns true on allow. */
export async function consume(
  c: Context<{ Bindings: Bindings }>,
  auth: AuthCtx,
  kind: "reads" | "executes" | "push"
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const today = new Date().toISOString().slice(0, 10);
  const limits = PLAN_LIMITS[auth.plan];
  const limit =
    kind === "reads" ? limits.reads_per_day :
    kind === "executes" ? limits.executes_per_day :
    limits.push_per_day;

  if (limit === 0) return { allowed: false, remaining: 0, limit: 0 };

  const usageKey = `usage:${auth.key}:${kind}:${today}`;
  const currentRaw = await c.env.USAGE.get(usageKey);
  const current = currentRaw ? parseInt(currentRaw, 10) : 0;
  if (current >= limit) return { allowed: false, remaining: 0, limit };

  // Increment and persist (with 7-day TTL for cleanup)
  c.executionCtx.waitUntil(
    c.env.USAGE.put(usageKey, String(current + 1), { expirationTtl: 7 * 86400 })
  );
  return { allowed: true, remaining: limit - current - 1, limit };
}

export type Action = "read" | "execute" | "push";

/** Hono middleware: gate by plan + quota. Attaches auth context to c.var.auth. */
export function gate(action: Action): MiddlewareHandler<{ Bindings: Bindings; Variables: { auth: AuthCtx } }> {
  return async (c, next: Next) => {
    const auth = await resolveAuth(c as any);
    c.set("auth", auth);

    if (action === "execute" && !PLAN_LIMITS[auth.plan].can_execute_paid) {
      return c.json({
        error: "payment_required",
        hint: "Live execute requires a paid plan. Visit /dashboard to upgrade.",
        plan: auth.plan,
      }, 402);
    }

    const kind: "reads" | "executes" | "push" =
      action === "read" ? "reads" : action === "execute" ? "executes" : "push";

    const usage = await consume(c as any, auth, kind);

    c.header("x-webmcp-plan", auth.plan);
    c.header("x-webmcp-limit", String(usage.limit));
    c.header("x-webmcp-remaining", String(usage.remaining));

    if (!usage.allowed) {
      return c.json({
        error: "quota_exceeded",
        hint: `Plan "${auth.plan}" allows ${usage.limit} ${kind}/day. Upgrade at /dashboard.`,
        plan: auth.plan,
        limit: usage.limit,
        remaining: 0,
      }, 429);
    }

    await next();
  };
}

/**
 * Proxy execute gate — the pricing flip. Replaces gate("execute") ONLY on the
 * /mcp/:provider routes so free-plan agents can activate before the paywall.
 *
 * The repositioning is "pain that compounds with agent count," so the free tier
 * is metered PER AGENT (per API key), not per account: a dev running five agents
 * gets five free allowances and can run the fleet into the product before paying,
 * instead of one agent burning the bucket and 402-ing the rest. (v1: API key =
 * agent — the granularity we have today; sub-agent identity is a later refine.)
 *
 * Contract, by plan:
 *   • paid (can_execute_paid)     → existing behavior exactly: executes/day quota
 *   • free + PROXY_FREE_CALLS>0   → N free proxy calls per key/day, then 402
 *   • free + env unset/0          → 402 immediately (today's behavior; default-off)
 */
export function proxyExecuteGate(): MiddlewareHandler<{ Bindings: Bindings; Variables: { auth: AuthCtx } }> {
  return async (c, next: Next) => {
    const auth = await resolveAuth(c as any);
    c.set("auth", auth);

    // Anonymous can't proxy (no vaulted token). The handler also checks, but
    // fail fast here and skip any metering.
    if (auth.anonymous) {
      return c.json({ error: "authentication_required", hint: "Get an API key at /dashboard and pass it as Authorization: Bearer <key>." }, 401);
    }

    // Paid plans: preserve the exact current execute-quota path.
    if (PLAN_LIMITS[auth.plan].can_execute_paid) {
      const usage = await consume(c as any, auth, "executes");
      c.header("x-webmcp-plan", auth.plan);
      c.header("x-webmcp-limit", String(usage.limit));
      c.header("x-webmcp-remaining", String(usage.remaining));
      if (!usage.allowed) {
        return c.json({ error: "quota_exceeded", hint: `Plan "${auth.plan}" allows ${usage.limit} executes/day. Upgrade at /dashboard.`, plan: auth.plan, limit: usage.limit, remaining: 0 }, 429);
      }
      await next();
      return;
    }

    // Free plan: per-agent (per-key) free-tier meter, if the operator opened it.
    const freePerDay = parseInt(c.env.PROXY_FREE_CALLS_PER_DAY || "0", 10) || 0;
    if (freePerDay <= 0) {
      // Default-off → today's behavior: free plan can't execute live.
      return c.json({ error: "payment_required", hint: "Live tool calls require a paid plan. Visit /dashboard to upgrade.", plan: auth.plan }, 402);
    }
    const day = new Date().toISOString().slice(0, 10);
    const fk = `freecall:${auth.key}:${day}`;
    let used = 0;
    try { used = parseInt((await c.env.USAGE.get(fk)) || "0", 10) || 0; } catch {}
    if (used >= freePerDay) {
      return c.json({
        error: "free_tier_exhausted",
        hint: `This agent used its ${freePerDay} free tool calls today. Upgrade for unlimited at /dashboard, or wait for the daily reset (UTC).`,
        plan: auth.plan,
        free_per_day: freePerDay,
        used,
      }, 402);
    }
    c.executionCtx.waitUntil(c.env.USAGE.put(fk, String(used + 1), { expirationTtl: 2 * 86400 }));
    c.header("x-webmcp-plan", auth.plan);
    c.header("x-webmcp-free-limit", String(freePerDay));
    c.header("x-webmcp-free-remaining", String(freePerDay - used - 1));
    await next();
  };
}

/** Generate a new API key + record it in KV. */
export async function issueKey(
  env: Bindings,
  user_id: string,
  plan: Plan,
  stripe_sub_id?: string
): Promise<string> {
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const envTag = env.ENVIRONMENT === "production" ? "live" : "test";
  const key = `webmcp_${envTag}_${rand}`;
  const rec: KeyRecord = {
    user_id,
    plan,
    status: "active",
    created_at: Date.now(),
    stripe_sub_id,
  };
  await env.KEYS.put(`key:${key}`, JSON.stringify(rec));
  // Index by user for the dashboard
  const userRaw = await env.KEYS.get(`user:${user_id}`);
  const user = userRaw ? JSON.parse(userRaw) : { keys: [], plan };
  user.keys.push(key);
  user.plan = plan;
  await env.KEYS.put(`user:${user_id}`, JSON.stringify(user));
  return key;
}

export async function revokeKey(env: Bindings, key: string): Promise<boolean> {
  const raw = await env.KEYS.get(`key:${key}`);
  if (!raw) return false;
  const rec = JSON.parse(raw);
  rec.status = "revoked";
  await env.KEYS.put(`key:${key}`, JSON.stringify(rec));
  return true;
}
