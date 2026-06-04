// metrics.ts — minimal, zero-infra funnel counters in the USAGE namespace.
//
// The worker had no analytics at all, so traffic→activation→revenue was
// unmeasurable. These KV daily counters are eventually-consistent and lose
// some increments under high concurrency, but they turn a blind funnel into a
// directionally-correct one with no new bindings or external config. Upgrade
// to Cloudflare Analytics Engine later if precision matters.
//
// Key shape (USAGE namespace): metric:<event>:<YYYY-MM-DD> -> count (90d TTL)
// Read via GET /api/v1/admin/metrics (x-admin-token gated).

import type { Context } from "hono";

export type FunnelEvent =
  | "u_view"
  | "directory_view"
  | "probe_run"
  | "activated"          // a live tools/call execute succeeded — the real activation
  | "checkout_started"
  | "paid";

const EVENTS: FunnelEvent[] = [
  "u_view",
  "directory_view",
  "probe_run",
  "activated",
  "checkout_started",
  "paid",
];
const TTL_DAYS = 90;

// Fire-and-forget increment. Takes only the pieces it needs (not the full Hono
// Context) so it composes cleanly across modules with different Bindings types.
// Must never throw into the request path.
export function track(
  env: { USAGE: KVNamespace },
  ctx: { waitUntil(p: Promise<unknown>): void },
  event: FunnelEvent
): void {
  try {
    const day = new Date().toISOString().slice(0, 10);
    const key = `metric:${event}:${day}`;
    ctx.waitUntil(
      (async () => {
        const cur = await env.USAGE.get(key);
        const n = cur ? parseInt(cur, 10) : 0;
        await env.USAGE.put(key, String(n + 1), {
          expirationTtl: TTL_DAYS * 86400,
        });
      })()
    );
  } catch {
    // metrics must never break a request
  }
}

type MetricsEnv = {
  USAGE: KVNamespace;
  CACHE?: KVNamespace;
  ADMIN_TOKEN?: string;
  ENVIRONMENT?: string;
};

// GET /api/v1/admin/metrics — admin-gated funnel rollup (totals + per-day).
export async function getMetrics(c: Context<{ Bindings: MetricsEnv }>) {
  const header = c.req.header("x-admin-token");
  const want =
    c.env.ADMIN_TOKEN ||
    (c.env.ENVIRONMENT === "development" ? "devadmin" : null);
  if (!want || header !== want) return c.json({ error: "admin only" }, 401);

  const totals: Record<string, number> = {};
  const byDay: Record<string, Record<string, number>> = {};
  for (const e of EVENTS) totals[e] = 0;

  // 5 events * 90 days = 450 keys max — one list + reads is cheap.
  const list = await c.env.USAGE.list({ prefix: "metric:", limit: 1000 });
  await Promise.all(
    list.keys.map(async (k) => {
      const parts = k.name.split(":"); // metric:<event>:<day>
      const event = parts[1];
      const day = parts[2];
      if (!event || !day) return;
      const raw = await c.env.USAGE.get(k.name);
      const n = raw ? parseInt(raw, 10) : 0;
      totals[event] = (totals[event] || 0) + n;
      (byDay[day] = byDay[day] || {})[event] = n;
    })
  );

  // Simple funnel conversion read-outs (guard divide-by-zero).
  const rate = (num: number, den: number) =>
    den > 0 ? +((100 * num) / den).toFixed(2) : null;
  const funnel = {
    // The funnel that matters: probe (read) → activated (live execute) → checkout → paid.
    probe_to_activated_pct: rate(totals.activated, totals.probe_run),
    probe_to_checkout_pct: rate(totals.checkout_started, totals.probe_run),
    activated_to_checkout_pct: rate(totals.checkout_started, totals.activated),
    checkout_to_paid_pct: rate(totals.paid, totals.checkout_started),
  };

  // Live asset counts for the command center (admin-only, so list cost is fine):
  // cached URLs + distinct directory sites, graded MCP servers, and the agent
  // grade-queue depth.
  let cached_urls = 0, graded_servers = 0, grade_queue = 0;
  const sites = new Set<string>();
  if (c.env.CACHE) {
    try {
      let cursor: string | undefined, pages = 0;
      do {
        const r: any = await c.env.CACHE.list({ prefix: "seen:", limit: 1000, cursor });
        cached_urls += r.keys.length;
        for (const k of r.keys) {
          const u = k.metadata && (k.metadata as any).url;
          if (u) { try { sites.add(new URL(u).hostname.replace(/^www\./, "")); } catch {} }
        }
        cursor = r.list_complete ? undefined : r.cursor; pages++;
      } while (cursor && pages < 8);
    } catch {}
    try {
      let cursor: string | undefined, pages = 0;
      do {
        const r: any = await c.env.CACHE.list({ prefix: "grade:", limit: 1000, cursor });
        graded_servers += r.keys.length;
        cursor = r.list_complete ? undefined : r.cursor; pages++;
      } while (cursor && pages < 8);
    } catch {}
    try { const raw = await c.env.CACHE.get("gradeseed:manual"); if (raw) { const a = JSON.parse(raw); if (Array.isArray(a)) grade_queue = a.length; } } catch {}
  }
  const assets = { cached_urls, directory_sites: sites.size, graded_servers, grade_queue };

  return c.json({ events: EVENTS, totals, funnel, byDay, assets });
}
