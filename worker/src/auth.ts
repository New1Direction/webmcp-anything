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
