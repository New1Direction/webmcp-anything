import { Hono } from "hono";
import { cors } from "hono/cors";
import * as shopify from "../../adapters/shopify.js";
import * as jsonld from "../../adapters/jsonld.js";
import * as openapi from "../../adapters/openapi.js";
import { fetchAndParse } from "./html";
import { landingHtml } from "./landing";
import { dashboardHtml } from "./dashboard";
import { directoryHtml } from "./directory";
import { ogSvg } from "./og";
import { gate, issueKey, revokeKey, type AuthCtx, type Plan } from "./auth";
import {
  stripeWebhook,
  createCheckout,
  keyByCheckout,
  recoverByEmail,
} from "./stripe";

type Bindings = {
  CACHE: KVNamespace;
  KEYS: KVNamespace;
  USAGE: KVNamespace;
  ENVIRONMENT: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_PRICE_TO_PLAN?: string;
  ADMIN_TOKEN?: string;
};

type Variables = { auth: AuthCtx };

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();
app.use("*", cors({ origin: "*", allowMethods: ["GET", "POST", "OPTIONS"] }));

// --------------------- helpers ---------------------

const cacheKey = (url: string) => `v1:${normalizeUrl(url)}`;

function normalizeUrl(u: string): string {
  try {
    const x = new URL(u);
    // Drop common tracking params
    for (const p of [...x.searchParams.keys()]) {
      if (/^(utm_|gclid|fbclid|mc_|ref|source)/i.test(p)) x.searchParams.delete(p);
    }
    return x.toString().replace(/\/$/, "");
  } catch {
    return u;
  }
}

async function readCache(env: Bindings, url: string, maxAgeSec: number) {
  const raw = await env.CACHE.get(cacheKey(url));
  if (!raw) return null;
  try {
    const entry = JSON.parse(raw);
    if (Date.now() - entry.ts > maxAgeSec * 1000) return null;
    return entry;
  } catch {
    return null;
  }
}

async function writeCache(env: Bindings, url: string, payload: any, ttlSec: number) {
  await env.CACHE.put(
    cacheKey(url),
    JSON.stringify({ payload, ts: Date.now() }),
    { expirationTtl: ttlSec }
  );
  // First-time-only directory entry + counter.
  // KV metadata is returned by list(), so the /directory endpoint can render
  // without one get-per-entry.
  const normalized = normalizeUrl(url);
  const seenKey = `seen:${normalized}`;
  const already = await env.CACHE.get(seenKey);
  const adapter = payload?.adapter || "other";
  const title =
    payload?.product?.title ||
    payload?.product?.name ||
    undefined;
  // Always refresh metadata — KV consistency / earlier schema versions can
  // leave entries without metadata, which would hide them from /directory.
  await env.CACHE.put(seenKey, normalized, {
    metadata: { url: normalized, adapter, ts: Date.now(), title },
  });
  if (!already) {
    const raw = await env.CACHE.get("stats:total_cached");
    const n = raw ? parseInt(raw, 10) || 0 : 0;
    await env.CACHE.put("stats:total_cached", String(n + 1));
  }
}

// --------------------- routes ---------------------

app.get("/", (c) => c.html(landingHtml(new URL(c.req.url).origin)));

app.get("/api/v1/health", (c) =>
  c.json({ ok: true, version: "0.1.0", env: c.env.ENVIRONMENT })
);

app.get("/api/v1/stats/public", async (c) => {
  const raw = await c.env.CACHE.get("stats:total_cached");
  const cached_urls = raw ? parseInt(raw, 10) || 0 : 0;
  return c.json({ cached_urls });
});

app.get("/api/v1/directory", async (c) => {
  const limit = Math.min(500, parseInt(c.req.query("limit") || "200", 10));
  const list = await c.env.CACHE.list({ prefix: "seen:", limit });
  const entries = list.keys
    .map((k: any) => k.metadata)
    .filter((m: any) => m && m.url)
    .map((m: any) => ({
      url: m.url,
      adapter: m.adapter || "other",
      ts: m.ts || 0,
      title: m.title || null,
    }));
  return c.json({ entries, list_complete: list.list_complete });
});

app.get("/directory", (c) => c.html(directoryHtml(new URL(c.req.url).origin)));

app.get("/og.svg", (c) =>
  new Response(ogSvg(), {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  })
);

app.get("/api/v1/debug", async (c) => {
  const url = c.req.query("url") || "https://www.allbirds.com/products/mens-wool-runners";
  const result: any = { url, steps: [] };

  // 1. Imports
  result.imports = {
    shopify: typeof shopify.detect,
    jsonld: typeof jsonld.detect,
    shopify_id: shopify.ID,
    jsonld_id: jsonld.ID,
  };

  // 2. Shopify detect
  try {
    const ctx = shopify.detect({ url, html: "" });
    result.steps.push({ step: "shopify.detect", result: ctx });
    if (ctx) {
      try {
        const data = await shopify.extract(ctx);
        result.steps.push({
          step: "shopify.extract",
          ok: true,
          tools_count: data.tools.length,
          product_title: data.product?.title,
        });
      } catch (e: any) {
        result.steps.push({ step: "shopify.extract", ok: false, error: String(e?.message || e) });
      }
    }
  } catch (e: any) {
    result.steps.push({ step: "shopify.detect", error: String(e?.message || e) });
  }

  // 3. fetchAndParse
  try {
    const page = await fetchAndParse(url);
    result.steps.push({
      step: "fetchAndParse",
      status: page.status,
      jsonld_count: page.jsonld.length,
      jsonld_types: page.jsonld.map((j: any) => j["@type"]),
      jsonld_first: page.jsonld[0],
      meta_keys: Object.keys(page.meta),
      title: page.title?.slice(0, 80),
    });

    const jc = jsonld.detect({ jsonld: page.jsonld, meta: page.meta, url, title: page.title });
    result.steps.push({ step: "jsonld.detect", result: jc ? { kind: jc.kind } : null });
    if (jc) {
      try {
        const data = await jsonld.extract(jc);
        result.steps.push({
          step: "jsonld.extract",
          ok: true,
          tools_count: data.tools.length,
          product_name: data.product?.name,
        });
      } catch (e: any) {
        result.steps.push({ step: "jsonld.extract", ok: false, error: String(e?.message || e) });
      }
    }
  } catch (e: any) {
    result.steps.push({ step: "fetchAndParse", error: String(e?.message || e) });
  }

  return c.json(result);
});

/**
 * GET /api/v1/tools?url=<product-url>&fresh=1
 * Returns WebMCP-compatible tool schema for the URL.
 *
 * Routing:
 *   1. Cache hit (60s for live, 7d for pushed)
 *   2. Shopify direct API (works server-side)
 *   3. Fetch HTML + run JSON-LD adapter
 *   4. Cache miss / blocked → 404 with hint
 */
app.get("/api/v1/tools", gate("read"), async (c) => {
  const url = c.req.query("url");
  if (!url) return c.json({ error: "url query param required" }, 400);
  const fresh = c.req.query("fresh") === "1";

  // 1) cache
  if (!fresh) {
    const hit = await readCache(c.env, url, 60);
    if (hit) {
      return c.json({ ...hit.payload, from: "cache", cached_at: hit.ts });
    }
  }

  // 2) shopify direct
  const shopCtx = shopify.detect({ url, html: "" });
  if (shopCtx) {
    try {
      const data = await shopify.extract(shopCtx);
      const payload = {
        adapter: "shopify",
        tools: data.tools,
        product: data.product,
        variants: data.variants,
      };
      c.executionCtx.waitUntil(writeCache(c.env, url, payload, 60));
      return c.json({ ...payload, from: "live" });
    } catch (err: any) {
      // fall through
    }
  }

  // 2b) openapi — URL pattern: openapi.json, swagger.json, /api-docs, etc.
  const openapiCtx = openapi.detect({ url });
  if (openapiCtx) {
    try {
      const data = await openapi.extract(openapiCtx);
      const payload = {
        adapter: "openapi",
        tools: data.tools,
        product: data.product,
      };
      c.executionCtx.waitUntil(writeCache(c.env, url, payload, 3600));
      return c.json({ ...payload, from: "live" });
    } catch (err: any) {
      // fall through to jsonld
    }
  }

  // 3) html + jsonld
  try {
    const page = await fetchAndParse(url);
    const jsonldCtx = jsonld.detect({
      jsonld: page.jsonld,
      meta: page.meta,
      url: page.finalUrl || url,
      title: page.title,
    });
    if (jsonldCtx) {
      const data = await jsonld.extract(jsonldCtx);
      const payload = {
        adapter: "jsonld",
        tools: data.tools,
        product: data.product,
        variants: data.variants,
      };
      c.executionCtx.waitUntil(writeCache(c.env, url, payload, 3600));
      return c.json({ ...payload, from: "live" });
    }
  } catch (err: any) {
    return c.json(
      {
        error: "fetch_failed",
        hint: "Site likely blocks server-side fetches (Incapsula/Akamai). Install the Chrome extension to extract tools client-side.",
        url,
        message: String(err?.message || err),
      },
      502
    );
  }

  return c.json(
    {
      error: "no_tools_extracted",
      hint: "No Shopify endpoint and no JSON-LD product schema on the page. Try the Chrome extension or wait for the LLM-fallback adapter.",
      url,
    },
    404
  );
});

/**
 * POST /api/v1/tools/execute
 * { url, tool, args }
 * Currently supports live Shopify actions; jsonld returns static results.
 */
app.post("/api/v1/tools/execute", gate("execute"), async (c) => {
  const body = await c.req.json<{ url: string; tool: string; args?: any }>().catch(() => null);
  if (!body?.url || !body.tool)
    return c.json({ error: "url and tool required" }, 400);

  const ctx = shopify.detect({ url: body.url, html: "" });
  if (ctx) {
    try {
      const data = await shopify.extract(ctx);
      const tool = data.tools.find((t: any) => t.name === body.tool);
      if (!tool) return c.json({ error: `tool ${body.tool} not found` }, 404);
      if (tool.result !== undefined) return c.json({ ok: true, value: tool.result });
      const kind = tool.action?.kind;
      if (!kind) return c.json({ error: "static result tool — no action to execute" }, 400);
      const handler = (shopify.actions as any)[kind];
      if (!handler) return c.json({ error: "no action handler" }, 500);
      const value = await handler({ ...tool.action, args: body.args || {} });
      return c.json({ ok: true, value });
    } catch (err: any) {
      return c.json({ ok: false, error: String(err?.message || err) }, 500);
    }
  }

  const oaCtx = openapi.detect({ url: body.url });
  if (oaCtx) {
    try {
      const data = await openapi.extract(oaCtx);
      const tool = data.tools.find((t: any) => t.name === body.tool);
      if (!tool) return c.json({ error: `tool ${body.tool} not found` }, 404);
      const kind = tool.action?.kind;
      const handler = (openapi.actions as any)[kind];
      if (!handler) return c.json({ error: "no action handler" }, 500);
      const value = await handler({ ...tool.action, args: body.args || {} });
      return c.json({ ok: true, value });
    } catch (err: any) {
      return c.json({ ok: false, error: String(err?.message || err) }, 500);
    }
  }

  // JSON-LD path: re-fetch, find tool, return static result
  try {
    const page = await fetchAndParse(body.url);
    const jc = jsonld.detect({
      jsonld: page.jsonld,
      meta: page.meta,
      url: body.url,
      title: page.title,
    });
    if (!jc) return c.json({ error: "no tools for url" }, 404);
    const data = await jsonld.extract(jc);
    const tool = data.tools.find((t: any) => t.name === body.tool);
    if (!tool) return c.json({ error: `tool ${body.tool} not found` }, 404);
    return c.json({ ok: true, value: tool.result });
  } catch (err: any) {
    return c.json({ ok: false, error: String(err?.message || err) }, 502);
  }
});

/**
 * POST /api/v1/cache
 * { url, payload }
 * Extension pushes a pre-extracted schema for sites we can't fetch server-side.
 * v0 is unauthenticated for local dev; add a shared secret before public deploy.
 */
app.post("/api/v1/cache", gate("push"), async (c) => {
  const body = await c.req.json<{ url: string; payload: any }>().catch(() => null);
  if (!body?.url || !body.payload) return c.json({ error: "url and payload required" }, 400);
  await writeCache(c.env, body.url, body.payload, 7 * 86400);
  return c.json({ ok: true, key: cacheKey(body.url), pushed_by: c.var.auth.user_id });
});

// --------------------- key management ---------------------

/** Issue a key (admin only). For local dev use ADMIN_TOKEN=devadmin. */
app.post("/api/v1/keys", async (c) => {
  const adminHeader = c.req.header("x-admin-token");
  const adminEnv = c.env.ADMIN_TOKEN || (c.env.ENVIRONMENT === "development" ? "devadmin" : null);
  if (!adminEnv || adminHeader !== adminEnv) return c.json({ error: "admin only" }, 401);
  const body = await c.req.json<{ user_id: string; plan: Plan; stripe_sub_id?: string }>();
  if (!body?.user_id || !body.plan) return c.json({ error: "user_id and plan required" }, 400);
  const key = await issueKey(c.env, body.user_id, body.plan, body.stripe_sub_id);
  return c.json({ ok: true, key, plan: body.plan });
});

app.post("/api/v1/keys/revoke", async (c) => {
  const adminHeader = c.req.header("x-admin-token");
  const adminEnv = c.env.ADMIN_TOKEN || (c.env.ENVIRONMENT === "development" ? "devadmin" : null);
  if (!adminEnv || adminHeader !== adminEnv) return c.json({ error: "admin only" }, 401);
  const body = await c.req.json<{ key: string }>();
  const ok = await revokeKey(c.env, body.key);
  return c.json({ ok });
});

app.get("/api/v1/keys/me", gate("read"), async (c) => {
  const a = c.var.auth;
  return c.json({
    key: a.anonymous ? null : a.key,
    plan: a.plan,
    user_id: a.user_id,
    anonymous: a.anonymous,
  });
});

// --------------------- stripe ---------------------

app.post("/api/v1/stripe/webhook", async (c) => stripeWebhook(c as any));
app.post("/api/v1/stripe/checkout", async (c) => createCheckout(c as any));
app.get("/api/v1/keys/by-checkout", async (c) => keyByCheckout(c as any));
app.post("/api/v1/keys/recover", async (c) => recoverByEmail(c as any));

// --------------------- dashboard ---------------------

app.get("/dashboard", (c) => c.html(dashboardHtml(new URL(c.req.url).origin)));

export default app;
