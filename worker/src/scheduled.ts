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

type Env = {
  CACHE: KVNamespace;
  KEYS: KVNamespace;
  USAGE: KVNamespace;
  ENVIRONMENT: string;
  ADMIN_TOKEN?: string;
};

const DEFAULT_STORES = [
  "www.allbirds.com",
  "www.everlane.com",
  "www.brooklinen.com",
  "www.glossier.com",
  "www.huel.com",
  "www.tenthousand.cc",
  "www.partakefoods.com",
  "us.naadam.co",
  "outdoorvoices.com",
  "us.mejuri.com",
];

const MAX_STORES_PER_RUN = 8;
const PRODUCTS_PER_STORE = 15;
const FETCH_TIMEOUT_MS = 8000;
const SHOPIFY_TTL_SEC = 3600; // matches index.ts shopify cache TTL

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
}

async function seedStore(env: Env, store: string): Promise<StoreReport> {
  const report: StoreReport = {
    store,
    fetched: 0,
    new_cached: 0,
    skipped_existing: 0,
    errors: [],
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
  console.log(`[cron] starting; ${stores.length} stores: ${stores.join(", ")}`);

  const reports: StoreReport[] = [];
  for (const store of stores) {
    const r = await seedStore(env, store);
    reports.push(r);
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

  const stores = await pickStores(env);
  const reports: StoreReport[] = [];
  for (const store of stores) {
    reports.push(await seedStore(env, store));
  }
  const total_new = reports.reduce((s, r) => s + r.new_cached, 0);
  return c.json({ ok: true, total_new, stores: reports });
}
