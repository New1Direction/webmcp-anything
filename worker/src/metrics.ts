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

// ---------------------------------------------------------------------------
// Landing-page + traffic-source dimensions.
//
// The event funnel above answers "what did people DO"; these answer "where did
// they LAND and where did they come FROM" — the questions you can't answer when
// a traffic spike shows up with zero signups. Separate key prefixes so the
// funnel rollup stays clean:
//   land:<bucket>:<YYYY-MM-DD> -> count   (arrival page)
//   ref:<source>:<YYYY-MM-DD>  -> count   (referrer / utm_source, or "bot")
const DIM_TTL_DAYS = 60;

function bumpDaily(
  env: { USAGE: KVNamespace },
  ctx: { waitUntil(p: Promise<unknown>): void },
  key: string
): void {
  try {
    ctx.waitUntil(
      (async () => {
        const cur = await env.USAGE.get(key);
        const n = cur ? parseInt(cur, 10) : 0;
        await env.USAGE.put(key, String(n + 1), {
          expirationTtl: DIM_TTL_DAYS * 86400,
        });
      })()
    );
  } catch {
    /* never break a request */
  }
}

// Obvious crawlers/automation — so the source rollup separates real humans from
// the bot share of a "25k visitors" number.
function isBot(ua: string): boolean {
  return /bot\b|crawl|spider|slurp|bingpreview|facebookexternalhit|headless|phantom|python-requests|curl\/|wget|axios|go-http|java\/|okhttp|scrapy|semrush|ahrefs|dataforseo|mj12|dotbot|gptbot|claudebot|ccbot|amazonbot|bytespider|google-extended|petalbot|applebot/i.test(
    ua
  );
}

// Coarse landing-page label for a request path. Returns null for assets / API /
// machine endpoints (don't pollute the page funnel).
export function pageBucket(path: string): string | null {
  if (path === "/") return "home";
  if (/^\/(api|static|assets|_)\//.test(path)) return null;
  if (/\.(js|css|png|jpe?g|gif|svg|ico|txt|xml|json|webp|woff2?|map|wasm)$/i.test(path)) return null;
  if (["/favicon.ico", "/robots.txt", "/sitemap.xml", "/llms.txt"].includes(path)) return null;
  if (path.startsWith("/u/")) return "u";
  if (path.startsWith("/drops")) return "drops";
  if (path.startsWith("/guides")) return "guides";
  if (path.startsWith("/blog")) return "blog";
  if (path.startsWith("/directory")) return "directory";
  if (path.startsWith("/mcp/leaderboard")) return "leaderboard";
  if (path.startsWith("/mcp/grade")) return "grade";
  if (path.startsWith("/mcp")) return "mcp";
  if (path.startsWith("/pricing")) return "pricing";
  if (path.startsWith("/tools")) return "tools";
  if (path.startsWith("/quickcatch")) return "quickcatch";
  if (path.startsWith("/connect")) return "connect";
  if (path.startsWith("/webmcp")) return "webmcp";
  if (path.startsWith("/dashboard")) return "dashboard";
  return "other";
}

// Traffic source from utm_source/source override, then Referer host, then bot
// UA, else "direct".
export function sourceBucket(
  referer: string | undefined,
  url: URL,
  ua: string
): string {
  const tagged = (url.searchParams.get("utm_source") || url.searchParams.get("source") || "")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 24);
  if (tagged) return tagged.startsWith("ext") ? "extension" : tagged;
  if (ua && isBot(ua)) return "bot";
  if (!referer) return "direct";
  let host = "";
  try {
    host = new URL(referer).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "direct";
  }
  if (!host) return "direct";
  if (host.endsWith("wmcp.sh")) return "internal";
  const map: [RegExp, string][] = [
    [/google\./, "google"], [/bing\./, "bing"], [/duckduckgo\./, "duckduckgo"],
    [/yandex\./, "yandex"], [/reddit\.|redd\.it/, "reddit"],
    [/twitter\.com|x\.com|t\.co$/, "x"], [/tiktok\./, "tiktok"],
    [/youtube\.|youtu\.be/, "youtube"], [/facebook\.|fb\./, "facebook"],
    [/instagram\./, "instagram"], [/linkedin\.|lnkd\.in/, "linkedin"],
    [/github\./, "github"], [/ycombinator|hckrnews/, "hackernews"],
    [/chatgpt\.|openai\./, "chatgpt"], [/perplexity\./, "perplexity"],
    [/claude\.|anthropic\./, "claude"], [/producthunt\./, "producthunt"],
    [/discord\.|discordapp/, "discord"], [/t\.me|telegram/, "telegram"],
  ];
  for (const [re, name] of map) if (re.test(host)) return name;
  // Unknown referrer: keep the eTLD+1 so we can actually see where it came from.
  return host.split(".").slice(-2).join(".").slice(0, 24);
}

// Fire-and-forget: record arrival page + source for a page view. No-ops on
// assets/API. Call from a GET middleware.
export function trackView(
  env: { USAGE: KVNamespace },
  ctx: { waitUntil(p: Promise<unknown>): void },
  path: string,
  referer: string | undefined,
  url: URL,
  ua: string
): void {
  try {
    const bucket = pageBucket(path);
    if (!bucket) return;
    const day = new Date().toISOString().slice(0, 10);
    bumpDaily(env, ctx, `land:${bucket}:${day}`);
    bumpDaily(env, ctx, `ref:${sourceBucket(referer, url, ua)}:${day}`);
  } catch {
    /* never break a request */
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

  // Landing-page + traffic-source rollups (where the visitors land / come from).
  const landing: Record<string, number> = {};
  const sources: Record<string, number> = {};
  for (const [prefix, acc] of [["land:", landing], ["ref:", sources]] as const) {
    try {
      const l = await c.env.USAGE.list({ prefix, limit: 1000 });
      await Promise.all(
        l.keys.map(async (k) => {
          const parts = k.name.split(":"); // <prefix><bucket>:<day> (bucket may hold a dot, not a colon)
          const day = parts[parts.length - 1];
          const bucket = parts.slice(1, -1).join(":");
          if (!bucket || !day) return;
          const raw = await c.env.USAGE.get(k.name);
          acc[bucket] = (acc[bucket] || 0) + (raw ? parseInt(raw, 10) : 0);
        })
      );
    } catch {}
  }
  const topN = (o: Record<string, number>, n = 25) =>
    Object.fromEntries(Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n));

  return c.json({
    events: EVENTS,
    totals,
    funnel,
    byDay,
    assets,
    landing: topN(landing),
    sources: topN(sources),
  });
}
