// engine.ts — the URL→tools extraction + execution core.
//
// Single source of truth shared by the REST API (/api/v1/tools,
// /api/v1/tools/execute in index.ts) and the MCP server (mcp_server.ts), so
// both interfaces behave identically. The route handlers stay thin: they call
// resolveTools()/executeTool() and serialize the result (c.json for REST,
// JSON-RPC envelopes for MCP). Quota/auth gating lives in the callers, not
// here, so the MCP path can gate once with JSON-RPC errors instead of HTTP.

import * as shopify from "../../adapters/shopify.js";
import * as jsonld from "../../adapters/jsonld.js";
import * as openapi from "../../adapters/openapi.js";
import * as llm from "../../adapters/llm.js";
import * as coingecko from "../../adapters/coingecko.js";
import * as defillama from "../../adapters/defillama.js";
import * as dexscreener from "../../adapters/dexscreener.js";
import * as pyth from "../../adapters/pyth.js";
import * as chainlink from "../../adapters/chainlink.js";
import { fetchAndParse } from "./html";
import { resolveTokenForUrl } from "./token_resolver";
import { loadProviderToken } from "./token_vault";

export type EngineEnv = {
  CACHE: KVNamespace;
  KEYS: KVNamespace;
  TOKEN_ENC_KEY?: string;
  ANTHROPIC_API_KEY?: string;
};

// Minimal shape of what Workers' ExecutionContext gives us (waitUntil only).
type WaitCtx = { waitUntil(p: Promise<unknown>): void };

// Crypto/data adapters share the same structure: detect → extract → action.
// They sit after openapi and before the HTML fetch in the chain.
export const CRYPTO_ADAPTERS = [
  { name: "coingecko", mod: coingecko, ttl: 60 },
  { name: "dexscreener", mod: dexscreener, ttl: 60 },
  { name: "pyth", mod: pyth, ttl: 60 },
  { name: "defillama", mod: defillama, ttl: 600 },
  { name: "chainlink", mod: chainlink, ttl: 86400 },
];

// --------------------- cache helpers ---------------------

export function normalizeUrl(u: string): string {
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

export const cacheKey = (url: string) => `v1:${normalizeUrl(url)}`;

export async function readCache(env: EngineEnv, url: string, maxAgeSec: number) {
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

export async function writeCache(env: EngineEnv, url: string, payload: any, ttlSec: number) {
  await env.CACHE.put(
    cacheKey(url),
    JSON.stringify({ payload, ts: Date.now() }),
    { expirationTtl: ttlSec }
  );
  // First-time-only directory entry + counter. KV metadata is returned by
  // list(), so /directory renders without one get-per-entry.
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

// --------------------- extraction ---------------------

export type ToolsPayload = {
  adapter: string;
  tools: any[];
  product?: any;
  variants?: any;
};
export type ResolveResult =
  | { ok: true; payload: ToolsPayload; from: "cache" | "live" | "llm"; cached_at?: number }
  | { ok: false; status: number; body: any };

// The 5-tier cascade (cache → shopify → openapi → crypto → jsonld → llm).
// Mirrors what /api/v1/tools used to do inline; callers decide how to gate +
// serialize. `authUserId` lets the LLM fallback use the caller's connected
// Anthropic/Claude-Max OAuth token (shifts inference cost to their account).
export async function resolveTools(
  env: EngineEnv,
  ctx: WaitCtx,
  url: string,
  opts: { fresh?: boolean; authUserId?: string } = {}
): Promise<ResolveResult> {
  const { fresh = false, authUserId } = opts;

  if (!fresh) {
    const hit = await readCache(env, url, 60);
    if (hit) return { ok: true, payload: hit.payload, from: "cache", cached_at: hit.ts };
  }

  const shopCtx = shopify.detect({ url, html: "" });
  if (shopCtx) {
    try {
      const data = await shopify.extract(shopCtx);
      const payload: ToolsPayload = {
        adapter: "shopify",
        tools: data.tools,
        product: data.product,
        variants: data.variants,
      };
      ctx.waitUntil(writeCache(env, url, payload, 3600));
      return { ok: true, payload, from: "live" };
    } catch {
      // fall through
    }
  }

  const openapiCtx = openapi.detect({ url });
  if (openapiCtx) {
    try {
      const data = await openapi.extract(openapiCtx);
      const payload: ToolsPayload = { adapter: "openapi", tools: data.tools, product: data.product };
      ctx.waitUntil(writeCache(env, url, payload, 24 * 3600));
      return { ok: true, payload, from: "live" };
    } catch {
      // fall through to crypto/jsonld
    }
  }

  for (const { name, mod, ttl } of CRYPTO_ADAPTERS) {
    const cctx = (mod as any).detect({ url });
    if (!cctx) continue;
    try {
      const data = await (mod as any).extract(cctx);
      const payload: ToolsPayload = { adapter: name, tools: data.tools, product: data.product };
      ctx.waitUntil(writeCache(env, url, payload, ttl));
      return { ok: true, payload, from: "live" };
    } catch {
      // fall through to next adapter
    }
  }

  let page;
  try {
    page = await fetchAndParse(url);
  } catch (err: any) {
    return {
      ok: false,
      status: 502,
      body: {
        error: "fetch_failed",
        hint: "Site likely blocks server-side fetches (Incapsula/Akamai). Install the Chrome extension to extract tools client-side.",
        url,
        message: String(err?.message || err),
      },
    };
  }

  const jsonldCtx = jsonld.detect({
    jsonld: page.jsonld,
    meta: page.meta,
    url: page.finalUrl || url,
    title: page.title,
  });
  if (jsonldCtx) {
    try {
      const data = await jsonld.extract(jsonldCtx);
      const payload: ToolsPayload = {
        adapter: "jsonld",
        tools: data.tools,
        product: data.product,
        variants: data.variants,
      };
      ctx.waitUntil(writeCache(env, url, payload, 6 * 3600));
      return { ok: true, payload, from: "live" };
    } catch {
      // fall through to LLM fallback
    }
  }

  // LLM fallback — last resort. Prefer the caller's own Anthropic/Claude-Max
  // OAuth token if connected, else the worker's ANTHROPIC_API_KEY.
  let userOauthToken: string | undefined;
  if (authUserId && !authUserId.startsWith("anon:")) {
    for (const pid of ["claude_max", "anthropic"]) {
      try {
        const tok = await loadProviderToken(env, authUserId, pid);
        if (tok) {
          userOauthToken = tok.access_token;
          break;
        }
      } catch {}
    }
  }

  const llmCtx = llm.detect({
    url: page.finalUrl || url,
    title: page.title,
    meta: page.meta,
    jsonld: page.jsonld,
    llmKey: userOauthToken ? undefined : env.ANTHROPIC_API_KEY,
    oauthToken: userOauthToken,
  });
  if (llmCtx) {
    try {
      const data = await llm.extract(llmCtx);
      if (data.tools?.length) {
        const payload: ToolsPayload = { adapter: "llm", tools: data.tools, product: data.product };
        ctx.waitUntil(writeCache(env, url, payload, 30 * 86400));
        return { ok: true, payload, from: "llm" };
      }
    } catch {
      // fall through to no_tools
    }
  }

  return {
    ok: false,
    status: 404,
    body: {
      error: "no_tools_extracted",
      hint: "No matching adapter and LLM fallback couldn't extract tools. Install the Chrome extension for client-side extraction.",
      url,
    },
  };
}

// --------------------- execution ---------------------

export type ExecResult = { ok: true; value: any } | { ok: false; status: number; body: any };

// Mirrors what /api/v1/tools/execute did inline. `userId` is needed only by
// the OpenAPI branch, whose injected resolveToken authenticates against the
// caller's connected providers.
// Execute a tool from a captured/synthesized spec (parsed from KV, not fetched —
// avoids the worker looping on its own zone). Runs the real upstream API call.
export async function executeCapturedTool(specJson: string, toolName: string, args: any, specUrl: string): Promise<ExecResult> {
  let spec: any;
  try { spec = JSON.parse(specJson); } catch { return { ok: false, status: 500, body: { error: "bad spec" } }; }
  const { tools } = (openapi as any).extractFromSpec(spec, specUrl);
  const tool = tools.find((t: any) => t.name === toolName);
  if (!tool?.action) return { ok: false, status: 404, body: { error: "no such tool", available: tools.map((t: any) => t.name) } };
  try {
    const value = await (openapi.actions as any).openapi_request({ ...tool.action, args: args || {}, resolveToken: async () => null });
    return { ok: true, value };
  } catch (e: any) {
    return { ok: false, status: 502, body: { error: String(e?.message || e) } };
  }
}

export function listCapturedTools(specJson: string, specUrl: string): any[] {
  try { return (openapi as any).extractFromSpec(JSON.parse(specJson), specUrl).tools; } catch { return []; }
}

export async function executeTool(
  env: EngineEnv,
  input: { url: string; tool: string; args?: any },
  opts: { userId?: string } = {}
): Promise<ExecResult> {
  const { url, tool: toolName, args } = input;

  const ctx = shopify.detect({ url, html: "" });
  if (ctx) {
    try {
      const data = await shopify.extract(ctx);
      const tool = data.tools.find((t: any) => t.name === toolName);
      if (!tool) return { ok: false, status: 404, body: { error: `tool ${toolName} not found` } };
      if (tool.result !== undefined) return { ok: true, value: tool.result };
      const kind = tool.action?.kind;
      if (!kind) return { ok: false, status: 400, body: { error: "static result tool — no action to execute" } };
      const handler = (shopify.actions as any)[kind];
      if (!handler) return { ok: false, status: 500, body: { error: "no action handler" } };
      const value = await handler({ ...tool.action, args: args || {} });
      return { ok: true, value };
    } catch (err: any) {
      return { ok: false, status: 500, body: { ok: false, error: String(err?.message || err) } };
    }
  }

  for (const { name, mod } of CRYPTO_ADAPTERS) {
    const cctx = (mod as any).detect({ url });
    if (!cctx) continue;
    try {
      const data = await (mod as any).extract(cctx);
      const tool = data.tools.find((t: any) => t.name === toolName);
      if (!tool) return { ok: false, status: 404, body: { error: `tool ${toolName} not found` } };
      if (tool.result !== undefined) return { ok: true, value: tool.result };
      const kind = tool.action?.kind;
      if (!kind) return { ok: false, status: 400, body: { error: "static result tool — no action to execute" } };
      const handler = (mod as any).actions?.[kind];
      if (!handler) return { ok: false, status: 500, body: { error: `no action handler for ${kind}` } };
      const value = await handler({ ...tool.action, args: args || {} });
      return { ok: true, value };
    } catch (err: any) {
      return { ok: false, status: 500, body: { ok: false, error: String(err?.message || err), adapter: name } };
    }
  }

  const oaCtx = openapi.detect({ url });
  if (oaCtx) {
    try {
      const data = await openapi.extract(oaCtx);
      const tool = data.tools.find((t: any) => t.name === toolName);
      if (!tool) return { ok: false, status: 404, body: { error: `tool ${toolName} not found` } };
      const kind = tool.action?.kind;
      const handler = (openapi.actions as any)[kind];
      if (!handler) return { ok: false, status: 500, body: { error: "no action handler" } };
      const resolveToken = async (host: string) => {
        const target = `https://${host}`;
        const r = await resolveTokenForUrl(env, opts.userId, target);
        return r?.access_token || null;
      };
      const value = await handler({ ...tool.action, args: args || {}, resolveToken });
      return { ok: true, value };
    } catch (err: any) {
      return { ok: false, status: 500, body: { ok: false, error: String(err?.message || err) } };
    }
  }

  try {
    const page = await fetchAndParse(url);
    const jc = jsonld.detect({ jsonld: page.jsonld, meta: page.meta, url, title: page.title });
    if (!jc) return { ok: false, status: 404, body: { error: "no tools for url" } };
    const data = await jsonld.extract(jc);
    const tool = data.tools.find((t: any) => t.name === toolName);
    if (!tool) return { ok: false, status: 404, body: { error: `tool ${toolName} not found` } };
    return { ok: true, value: tool.result };
  } catch (err: any) {
    return { ok: false, status: 502, body: { ok: false, error: String(err?.message || err) } };
  }
}
