// scheduled.ts — Cloudflare Worker Cron trigger.
//
// Auto-seeds the /directory + /u/<hash> SEO pages every 6h. No laptop, no
// Claude, no Gemini in the loop — the worker discovers new product URLs
// from a curated store list and caches the ones it hasn't seen before.
//
// Store list:
//   - Hardcoded default (DEFAULT_STORES) ships with the deploy
//   - Augmentable at runtime via KV key `seed_stores:list` (JSON array)
//     → `wrangler kv:key put --binding=CACHE seed_stores:list '["www.foo.com"]'`
//
// Cron schedule (wrangler.toml):
//   `triggers.crons = ["0 */6 * * *"]`  → every 6h at :00
//
// Per run: pick up to MAX_STORES_PER_RUN stores, fetch their /products.json,
// for each handle NOT already in our seen: index → run shopify.extract + cache.
// Skips stores that 4xx/5xx/timeout. Logs results to CF Tail.

import * as shopify from "../../adapters/shopify.js";
import { regradeWatched, seedRegistryGrades, scoreMcpServer, recordGrade, seedBehaviorBatch, addBehaviorSeedHosts, readBehaviorSeedList } from "./mcp_grade";
import { fireAlert } from "./alerts";
import { DROP_SLUGS, LOCALIZABLE_SLUGS, LOCALIZED_LANGS } from "./drops_seo";
import { ARTICLE_SLUGS } from "./articles";

type Env = {
  CACHE: KVNamespace;
  KEYS: KVNamespace;
  USAGE: KVNamespace;
  ENVIRONMENT: string;
  ADMIN_TOKEN?: string;
  LEAD_ALERT_WEBHOOK?: string;
  BEHAVIOR_SEED?: string;
};

// Diverse, single-domain (no country-TLD duplicates) well-known Shopify
// storefronts. Non-Shopify / 4xx entries are skipped gracefully by seedStore,
// so a few misses are harmless. Kept varied across categories so the directory
// doesn't read as one brand cloned across TLDs.
const DEFAULT_STORES = [
  "www.allbirds.com",
  "www.everlane.com",
  "www.brooklinen.com",
  "www.glossier.com",
  "www.huel.com",
  "www.tenthousand.cc",
  "www.partakefoods.com",
  "outdoorvoices.com",
  "www.ruggable.com",
  "www.bombas.com",
  "www.drsquatch.com",
  "www.chubbiesshorts.com",
  "www.deathwishcoffee.com",
  "www.gymshark.com",
  "www.aloyoga.com",
  "www.vuoriclothing.com",
  "www.rothys.com",
  "magicspoon.com",
  "www.carawayhome.com",
  "thursdayboots.com",
  "www.tentree.com",
  "www.kith.com",
  "drinkolipop.com",
  "hellotushy.com",
];

// Tuned for a ~2500-store registry harvested across the day.
// 30 stores × 20 products = 600 subrequests/run. Workers Bundled plan
// allows 1000 subrequests per invocation. Stores fan out in parallel
// (Promise.all) so the run finishes inside the 30s wall-clock budget.
const MAX_STORES_PER_RUN = 30;
const PRODUCTS_PER_STORE = 20;
const FETCH_TIMEOUT_MS = 8000;
const SHOPIFY_TTL_SEC = 3600; // matches index.ts shopify cache TTL

// IndexNow — fast-index freshly cached /u pages with Bing/Yandex/Seznam/etc.
// The key file is already served as a static asset at /<key>.txt (see
// launch/registry/SUBMISSION_PLAYBOOK.md). Cron has no request origin, so the
// production host is hardcoded; dev runs are skipped (guarded on ENVIRONMENT).
const INDEXNOW_KEY = "210a4c52878584d7ea9f50b95f8f58cd";
const SITE_HOST = "wmcp.sh";
const SITE_ORIGIN = "https://wmcp.sh";

// Mirror u.ts base64urlEncode + the /u route: encode the NORMALIZED source URL
// (the sitemap does the same), so the submitted URL resolves to a real page.
function uUrlFor(srcUrl: string): string {
  const b64 = btoa(normalizeUrl(srcUrl))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `${SITE_ORIGIN}/u/${b64}`;
}

async function pingIndexNow(urls: string[]): Promise<number> {
  if (!urls.length) return 0;
  const urlList = urls.slice(0, 10000);
  try {
    const res = await fetch("https://api.indexnow.org/IndexNow", {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: SITE_HOST,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_ORIGIN}/${INDEXNOW_KEY}.txt`,
        urlList,
      }),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    console.log(`[indexnow] submitted ${urlList.length} urls → ${res.status}`);
  } catch (e: any) {
    console.log(`[indexnow] failed: ${e?.message || e}`);
  }
  return urlList.length;
}

// The full drops + tools SEO URL set (English + 11 localized + indexes). These
// are static pages, so instead of re-submitting all ~2,600 every run, the cron
// pushes a rotating batch via a KV cursor — the whole set cycles to IndexNow
// roughly once per day. Keeps Bing/Naver/Yandex crawling without spamming.
function seoUrls(): string[] {
  const out: string[] = [];
  out.push(`${SITE_ORIGIN}/drops`);
  for (const slug of DROP_SLUGS) out.push(`${SITE_ORIGIN}/drops/${slug}`);
  for (const lang of LOCALIZED_LANGS) {
    out.push(`${SITE_ORIGIN}/drops/${lang}`);
    for (const slug of LOCALIZABLE_SLUGS) out.push(`${SITE_ORIGIN}/drops/${lang}/${slug}`);
  }
  out.push(`${SITE_ORIGIN}/tools`, `${SITE_ORIGIN}/tools/pokemon-resale-calculator`);
  for (const lang of LOCALIZED_LANGS) {
    out.push(`${SITE_ORIGIN}/tools/${lang}`, `${SITE_ORIGIN}/tools/${lang}/pokemon-resale-calculator`);
  }
  out.push(`${SITE_ORIGIN}/guides`);
  for (const slug of ARTICLE_SLUGS) out.push(`${SITE_ORIGIN}/guides/${slug}`);
  return out;
}

const SEO_CURSOR_KEY = "indexnow:seo:cursor";
const SEO_BATCH = 300; // ~2,600 urls / 300 ≈ 9 runs ≈ full set every ~18h

async function submitSeoBatch(env: Env): Promise<number> {
  const all = seoUrls();
  let cursor = 0;
  try { cursor = parseInt((await env.CACHE.get(SEO_CURSOR_KEY)) || "0", 10) || 0; } catch {}
  if (cursor >= all.length) cursor = 0;
  const batch = all.slice(cursor, cursor + SEO_BATCH);
  await pingIndexNow(batch);
  const next = cursor + SEO_BATCH >= all.length ? 0 : cursor + SEO_BATCH;
  try { await env.CACHE.put(SEO_CURSOR_KEY, String(next)); } catch {}
  console.log(`[indexnow] seo batch: ${batch.length} urls (cursor ${cursor}→${next} of ${all.length})`);
  return batch.length;
}

// Agent-fed MCP grading firehose. External agents POST a big list of MCP server
// URLs to /api/v1/admin/grade-servers; the cron grades a slice each run and they
// land on /mcp/leaderboard + enter the continuous drift watch. This is how the
// trust-graph moat scales without per-call rate limits — agents dump, cron eats.
const GRADE_SEED_KEY = "gradeseed:manual";

async function gradeManualSeed(env: Env, max = 18): Promise<{ graded: number; remaining: number }> {
  let list: string[] = [];
  try { const raw = await env.CACHE.get(GRADE_SEED_KEY); list = raw ? JSON.parse(raw) : []; } catch {}
  if (!Array.isArray(list) || !list.length) return { graded: 0, remaining: 0 };
  const batch = list.slice(0, max);
  const rest = list.slice(max);
  let graded = 0;
  await Promise.all(batch.map(async (url) => {
    try { const r = await scoreMcpServer(url); await recordGrade(env as any, r); graded++; } catch { /* unreachable / non-MCP — drop */ }
  }));
  try { await env.CACHE.put(GRADE_SEED_KEY, JSON.stringify(rest)); } catch {}
  return { graded, remaining: rest.length };
}

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36";

function normalizeUrl(u: string): string {
  try {
    const x = new URL(u);
    for (const p of [...x.searchParams.keys()]) {
      if (/^(utm_|gclid|fbclid|mc_|ref|source)/i.test(p)) x.searchParams.delete(p);
    }
    return x.toString().replace(/\/$/, "");
  } catch {
    return u;
  }
}

const cacheKey = (u: string) => `v1:${normalizeUrl(u)}`;

async function writeCache(
  env: Env,
  url: string,
  payload: any,
  ttlSec: number
): Promise<void> {
  await env.CACHE.put(
    cacheKey(url),
    JSON.stringify({ payload, ts: Date.now() }),
    { expirationTtl: ttlSec }
  );
  const normalized = normalizeUrl(url);
  const seenKey = `seen:${normalized}`;
  const already = await env.CACHE.get(seenKey);
  const adapter = payload?.adapter || "other";
  const title = payload?.product?.title || payload?.product?.name || undefined;
  await env.CACHE.put(seenKey, normalized, {
    metadata: { url: normalized, adapter, ts: Date.now(), title },
  });
  if (!already) {
    const raw = await env.CACHE.get("stats:total_cached");
    const n = raw ? parseInt(raw, 10) || 0 : 0;
    await env.CACHE.put("stats:total_cached", String(n + 1));
  }
}

/**
 * Pick up to N stores from (defaults ∪ KV list) to process this run.
 * Rotates by hour so different stores get attention across runs.
 */
async function pickStores(env: Env): Promise<string[]> {
  let stores: string[] = [...DEFAULT_STORES];
  try {
    const raw = await env.CACHE.get("seed_stores:list");
    if (raw) {
      const extra = JSON.parse(raw);
      if (Array.isArray(extra)) {
        stores = [...new Set([...stores, ...extra])];
      }
    }
  } catch {}

  // Rotate the slice based on hour-of-day so a 24h window covers more stores.
  const offset = (new Date().getUTCHours() % stores.length);
  const rotated = [...stores.slice(offset), ...stores.slice(0, offset)];
  return rotated.slice(0, MAX_STORES_PER_RUN);
}

interface StoreReport {
  store: string;
  fetched: number;
  new_cached: number;
  skipped_existing: number;
  errors: string[];
  new_urls: string[];
}

async function seedStore(env: Env, store: string): Promise<StoreReport> {
  const report: StoreReport = {
    store,
    fetched: 0,
    new_cached: 0,
    skipped_existing: 0,
    errors: [],
    new_urls: [],
  };
  let products: any[] = [];
  try {
    const res = await fetch(
      `https://${store}/products.json?limit=${PRODUCTS_PER_STORE}`,
      {
        headers: { "user-agent": UA, accept: "application/json" },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      }
    );
    if (!res.ok) {
      report.errors.push(`products.json ${res.status}`);
      return report;
    }
    const data: any = await res.json();
    products = Array.isArray(data?.products) ? data.products : [];
    report.fetched = products.length;
  } catch (e: any) {
    report.errors.push(`fetch: ${e?.message || e}`);
    return report;
  }

  for (const p of products) {
    if (!p?.handle) continue;
    const url = `https://${store}/products/${p.handle}`;
    const seenKey = `seen:${normalizeUrl(url)}`;
    const exists = await env.CACHE.get(seenKey);
    if (exists) {
      report.skipped_existing++;
      continue;
    }

    try {
      const ctx = shopify.detect({ url, html: "" });
      if (!ctx) continue;
      const data = await shopify.extract(ctx);
      const payload = {
        adapter: "shopify",
        tools: data.tools,
        product: data.product,
        variants: data.variants,
      };
      await writeCache(env, url, payload, SHOPIFY_TTL_SEC);
      report.new_cached++;
      report.new_urls.push(url);
    } catch (e: any) {
      report.errors.push(`${p.handle}: ${(e?.message || e).slice(0, 60)}`);
    }
  }
  return report;
}

/**
 * Cloudflare Workers `scheduled` handler — called by cron triggers.
 */
export async function scheduledHandler(
  controller: any,
  env: Env,
  ctx: any
): Promise<void> {
  const started = Date.now();
  const stores = await pickStores(env);
  console.log(`[cron] starting; ${stores.length} stores`);

  // Stores in parallel — each store's internal handle loop stays sequential
  // to avoid per-store rate-limiting. 30 stores × ~2s = ~6s wall-clock,
  // well under the 30s worker budget.
  const reports = await Promise.all(stores.map((s) => seedStore(env, s)));

  for (const r of reports) {
    console.log(
      `[cron] ${r.store}: fetched=${r.fetched} new=${r.new_cached} ` +
        `skip=${r.skipped_existing}` +
        (r.errors.length ? ` errors=${r.errors.length}` : "")
    );
  }

  const total_new = reports.reduce((s, r) => s + r.new_cached, 0);
  const total_skip = reports.reduce((s, r) => s + r.skipped_existing, 0);
  const elapsed_ms = Date.now() - started;
  console.log(
    `[cron] done: ${total_new} new urls cached, ${total_skip} skipped, ${elapsed_ms}ms`
  );

  // Fast-index the freshly cached pages. Production only (cron has no request
  // origin); best-effort via waitUntil so it never eats the worker budget.
  if (env.ENVIRONMENT === "production") {
    const freshUrls = reports.flatMap((r) => r.new_urls).map(uUrlFor);
    if (freshUrls.length) ctx.waitUntil(pingIndexNow(freshUrls));
    // Rotating batch of the static drops/tools SEO pages → IndexNow.
    ctx.waitUntil(submitSeoBatch(env).catch((e) => console.log("[indexnow] seo batch error", String(e))));
  }

  // Re-verify watched MCP servers: rug-pull / schema-drift / grade-drop +
  // alerts. This continuously-re-verified attestation is the trust-authority
  // wedge a one-shot static scanner can't produce.
  ctx.waitUntil(
    regradeWatched(env as any, ctx, fireAlert)
      .then((d) => console.log(`[cron] regrade: checked=${d.checked} drifted=${d.drifted} dropped=${d.dropped}`))
      .catch((e) => console.log("[cron] regrade error", String(e)))
  );

  // Coverage land-grab: auto-grade a slice of the official MCP Registry each
  // run (cursor advances → whole-ecosystem coverage over time). Every graded
  // server enters the drift watch set above.
  ctx.waitUntil(
    seedRegistryGrades(env as any)
      .then((d) => console.log(`[cron] registry-seed: seeded=${d.seeded} nextCursor=${d.nextCursor || "(start)"}`))
      .catch((e) => console.log("[cron] registry-seed error", String(e)))
  );

  // Agent-fed grading firehose: grade a slice of the manually-seeded MCP server
  // URLs (POSTed by external agents to /api/v1/admin/grade-servers).
  ctx.waitUntil(
    gradeManualSeed(env)
      .then((d) => console.log(`[cron] grade-seed: graded=${d.graded} remaining=${d.remaining}`))
      .catch((e) => console.log("[cron] grade-seed error", String(e)))
  );

  // Behavioral seeding (default OFF — set BEHAVIOR_SEED="1"). Exercise a small
  // curated set of public, no-auth servers' READ-ONLY tools ourselves so the
  // behavioral overlay lights up without waiting for user proxy traffic — turns
  // the uncopyable moat into a live "✓ verified" signal on the board. Safe by
  // construction (read-only, no-arg tools only); bounded fan-out.
  if (env.BEHAVIOR_SEED === "1") {
    ctx.waitUntil(
      seedBehaviorBatch(env as any)
        .then((d) => console.log(`[cron] behavior-seed: hosts=${d.hosts} calls=${d.calls} targets=${d.targets}`))
        .catch((e) => console.log("[cron] behavior-seed error", String(e)))
    );
  }

  // Keep the public security report + GEO stats feed (/reports + /api/v1/mcp/stats)
  // fresh on their own — recompute every 6h so nobody has to hit ?refresh=1.
  if (new Date().getUTCHours() % 6 === 0) {
    ctx.waitUntil(
      import("./mcp_report")
        .then(({ computeMcpSecurityReport }) => computeMcpSecurityReport(env as any, true))
        .then((s) => console.log(`[cron] report-refresh: ${s.total} graded, ${s.pct_failing}% D/F`))
        .catch((e) => console.log("[cron] report-refresh error", String(e)))
    );
  }
}

const STORE_HOSTNAME_RE = /^[a-z0-9]([a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/i;

/**
 * Admin-gated. POST /api/v1/admin/seed-stores with
 * { stores: ["www.foo.com", "shop.bar.com", ...] }
 * Merges new hostnames into the `seed_stores:list` KV array. Cron picks
 * them up on its next run automatically. Used by external agents (Gemini,
 * Hermes) to expand wmcp.sh's coverage without redeploying.
 */
export async function addSeedStores(c: any): Promise<Response> {
  const env: Env = c.env;
  const token = c.req.header("x-admin-token");
  if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) {
    return c.json({ error: "admin only" }, 401);
  }
  const body: { stores?: string[] } | null = await c.req
    .json()
    .catch(() => null);
  if (!body || !Array.isArray(body.stores)) {
    return c.json({ error: "stores array required" }, 400);
  }

  const cleaned: string[] = body.stores
    .map((s) => String(s).trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, ""))
    .filter((s) => STORE_HOSTNAME_RE.test(s));

  const existingRaw = await env.CACHE.get("seed_stores:list");
  let existing: string[] = [];
  if (existingRaw) {
    try {
      const parsed = JSON.parse(existingRaw);
      if (Array.isArray(parsed)) existing = parsed;
    } catch {}
  }
  const before = new Set(existing);
  const merged = [...new Set([...existing, ...cleaned])];
  const newly_added = merged.filter((s) => !before.has(s));

  await env.CACHE.put("seed_stores:list", JSON.stringify(merged));

  return c.json({
    ok: true,
    accepted: cleaned.length,
    rejected: body.stores.length - cleaned.length,
    newly_added: newly_added.length,
    total_stores_in_list: merged.length,
  });
}

/**
 * Admin-gated. POST /api/v1/admin/grade-servers with
 * { urls: ["https://server.com/mcp", ...] }
 * Queues MCP server URLs into `gradeseed:manual`; the cron grades a slice each
 * run → they appear on /mcp/leaderboard and enter the continuous drift watch.
 * The firehose external agents use to scale the trust-graph moat.
 */
export async function addGradeServers(c: any): Promise<Response> {
  const env: Env = c.env;
  const token = c.req.header("x-admin-token");
  if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) {
    return c.json({ error: "admin only" }, 401);
  }
  const body: { urls?: string[] } | null = await c.req.json().catch(() => null);
  if (!body || !Array.isArray(body.urls)) {
    return c.json({ error: "urls array required" }, 400);
  }
  const cleaned = body.urls
    .map((u) => String(u).trim())
    .filter((u) => { try { return new URL(u).protocol === "https:"; } catch { return false; } });

  let existing: string[] = [];
  try { const raw = await env.CACHE.get(GRADE_SEED_KEY); if (raw) { const p = JSON.parse(raw); if (Array.isArray(p)) existing = p; } } catch {}
  const before = new Set(existing);
  const merged = [...new Set([...existing, ...cleaned])].slice(0, 20000);
  const newly_added = merged.filter((u) => !before.has(u)).length;
  await env.CACHE.put(GRADE_SEED_KEY, JSON.stringify(merged));

  return c.json({
    ok: true,
    accepted: cleaned.length,
    rejected: body.urls.length - cleaned.length,
    newly_added,
    queued_total: merged.length,
  });
}

/**
 * Admin-gated. POST /api/v1/admin/seed-behavior with `x-admin-token`.
 * Curate the behavioral-seed flagship list and/or run a batch now.
 *   body { hosts?: string[] }  → add hosts to the curated list (public-only, capped)
 *   ?run=1                     → also run a seed batch immediately (handy for testing)
 *   ?max=N&tools=M             → batch sizing
 * Seeding itself only runs from cron when BEHAVIOR_SEED="1"; this endpoint lets
 * the operator curate which flagship servers get "✓ verified" and trigger a run.
 */
export async function seedBehaviorAdmin(c: any): Promise<Response> {
  const env: Env = c.env;
  const token = c.req.header("x-admin-token");
  if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) return c.json({ error: "admin only" }, 401);
  const body: { hosts?: string[] } | null = await c.req.json().catch(() => null);
  let list = await readBehaviorSeedList(env as any);
  if (body && Array.isArray(body.hosts) && body.hosts.length) {
    list = await addBehaviorSeedHosts(env as any, body.hosts);
  }
  let batch: any = null;
  if (c.req.query("run") === "1") {
    const max = parseInt(c.req.query("max") || "6", 10) || 6;
    const maxToolsPerHost = parseInt(c.req.query("tools") || "2", 10) || 2;
    batch = await seedBehaviorBatch(env as any, { max, maxToolsPerHost });
  }
  return c.json({ ok: true, seed_list: list, seed_list_size: list.length, batch });
}

/**
 * Admin-gated. POST /api/v1/admin/seo-indexnow with `x-admin-token`.
 * Submits the ENTIRE drops/tools SEO URL set to IndexNow in one shot
 * (Bing/Naver/Yandex/Seznam) — the instant full backfill. The cron also
 * rotates through the set automatically; this is for "index everything now".
 */
export async function submitSeoIndexNow(c: any): Promise<Response> {
  const env: Env = c.env;
  const token = c.req.header("x-admin-token");
  if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) {
    return c.json({ error: "admin only" }, 401);
  }
  const all = seoUrls();
  all.push(`${SITE_ORIGIN}/mcp/leaderboard`, `${SITE_ORIGIN}/webmcp`, `${SITE_ORIGIN}/connect`, `${SITE_ORIGIN}/directory`, `${SITE_ORIGIN}/reports/state-of-mcp-security-2026`, `${SITE_ORIGIN}/mcp/badges`);
  // Include every graded MCP-server report page (the moat content) in IndexNow.
  try {
    let cursor: string | undefined, pages = 0;
    do {
      const r: any = await env.CACHE.list({ prefix: "grade:", limit: 1000, cursor });
      for (const k of r.keys) all.push(`${SITE_ORIGIN}/mcp/grade/${encodeURIComponent(k.name.slice("grade:".length))}`);
      cursor = r.list_complete ? undefined : r.cursor; pages++;
    } while (cursor && pages < 8);
  } catch {}
  let submitted = 0;
  for (let i = 0; i < all.length; i += 10000) {
    const chunk = all.slice(i, i + 10000);
    await pingIndexNow(chunk);
    submitted += chunk.length;
  }
  return c.json({ ok: true, submitted, host: SITE_HOST });
}

/**
 * Admin-gated BULK corpus re-grade. POST /api/v1/admin/regrade-corpus
 * `x-admin-token` + ?n=<batch>&cursor=<kv-cursor>. Re-grades one cursor page of
 * the gradewatch: set in parallel (fast probe) and returns the next cursor, so a
 * caller can loop the whole corpus through the improved grader without the 2-week
 * cron wait. Bounded per call (subrequests + wall-clock) by the batch size.
 */
export async function regradeCorpus(c: any): Promise<Response> {
  const env: Env = c.env;
  const token = c.req.header("x-admin-token");
  if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) {
    return c.json({ error: "admin only" }, 401);
  }
  const n = Math.min(Math.max(parseInt(c.req.query("n") || "20", 10) || 20, 1), 40);
  const cursor = c.req.query("cursor") || undefined;
  const fast = c.req.query("fast") === "1"; // default = accurate (full-timeout) probe
  const list: any = await env.CACHE.list({ prefix: "gradewatch:", limit: n, cursor });
  const hosts: string[] = list.keys.map((k: any) => k.name.slice("gradewatch:".length));

  let regraded = 0, failed = 0, reachable = 0, improved = 0;
  await Promise.all(hosts.map(async (h) => {
    const url = (await env.CACHE.get(`gradewatch:${h}`)) || `https://${h}/mcp`;
    let prev: number | undefined;
    try { const p = await env.CACHE.get(`grade:${h}`); if (p) prev = JSON.parse(p).score; } catch {}
    try {
      const fresh = await scoreMcpServer(url, { fast });
      await recordGrade(env, fresh);
      regraded++;
      if (fresh.reachable) reachable++;
      if (typeof prev === "number" && fresh.score > prev) improved++;
    } catch { failed++; }
  }));

  return c.json({
    ok: true,
    batch: hosts.length,
    regraded, failed, reachable, improved,
    next_cursor: list.list_complete ? null : list.cursor,
    done: !!list.list_complete,
  });
}

/**
 * Admin-gated bulk registry drain. POST /api/v1/admin/seed-registry?n=<page>
 * Pulls one cursor page from the official MCP registry and grades its remote
 * servers (advancing the persistent cursor), so a caller can loop it to cover
 * the whole registry now instead of the slow 10/run cron. Returns seeded count.
 */
export async function seedRegistry(c: any): Promise<Response> {
  const env: Env = c.env;
  const token = c.req.header("x-admin-token");
  if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) {
    return c.json({ error: "admin only" }, 401);
  }
  if (c.req.query("reset") === "1") await env.CACHE.delete("gradeseed:cursor");
  const n = Math.min(Math.max(parseInt(c.req.query("n") || "30", 10) || 30, 1), 50);
  const before = (await env.CACHE.get("gradeseed:cursor")) || "";
  const r = await seedRegistryGrades(env, n);
  return c.json({ ok: true, seeded: r.seeded, cursor_before: before, cursor_after: r.nextCursor, wrapped: !r.nextCursor });
}

/**
 * Admin-gated STATIC package scan seeding. POST /api/v1/admin/seed-packages?n=<count>
 * Walks the registry for npm-package (stdio) servers and statically grades them —
 * growing the corpus past the remotely-reachable set. Loop it to cover the registry.
 */
export async function seedPackages(c: any): Promise<Response> {
  const env: Env = c.env;
  const token = c.req.header("x-admin-token");
  if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) {
    return c.json({ error: "admin only" }, 401);
  }
  if (c.req.query("reset") === "1") await env.CACHE.delete("pkgseed:cursor");
  const n = Math.min(Math.max(parseInt(c.req.query("n") || "12", 10) || 12, 1), 20);
  const { seedRegistryPackages } = await import("./mcp_pkg");
  const r = await seedRegistryPackages(env, n);
  return c.json({ ok: true, scanned: r.scanned, seeded: r.seeded, next_cursor: r.nextCursor, done: !r.nextCursor });
}

/**
 * Admin-gated manual trigger. POST /api/v1/admin/seed-now with
 * `x-admin-token: <ADMIN_TOKEN>`. Runs the same logic as the cron and
 * returns the per-store report as JSON for quick verification.
 */
export async function runSeedNow(c: any): Promise<Response> {
  const env = c.env;
  const token = c.req.header("x-admin-token");
  if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) {
    return c.json({ error: "admin only" }, 401);
  }

  // On-demand drain of the agent-fed grade queue. ?grade_only=1 skips the store
  // seed for a fast grade-only run; ?grade=N sets the batch (capped).
  const gradeN = Math.min(30, parseInt(c.req.query("grade") || "15", 10) || 15);
  const grade_seed = await gradeManualSeed(env, gradeN);
  if (c.req.query("grade_only") === "1") {
    return c.json({ ok: true, grade_seed });
  }

  const stores = await pickStores(env);
  const reports = await Promise.all(stores.map((s) => seedStore(env, s)));
  const total_new = reports.reduce((s, r) => s + r.new_cached, 0);

  let indexnow_submitted = 0;
  if (env.ENVIRONMENT === "production") {
    const freshUrls = reports.flatMap((r) => r.new_urls).map(uUrlFor);
    indexnow_submitted = freshUrls.length;
    if (freshUrls.length) c.executionCtx.waitUntil(pingIndexNow(freshUrls));
  }
  return c.json({ ok: true, total_new, indexnow_submitted, grade_seed, stores: reports });
}
