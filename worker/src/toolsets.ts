// toolsets.ts — saved, shareable "toolsets": a named bundle of URLs (and/or
// proxied providers) a user composes ONCE and connects to as a single MCP
// server at /mcp/set/<id>. This is the monetizable composability unit:
// CREATING a toolset is a paid (Pro/Reseller) feature; the served MCP endpoint
// reuses mcp_server.ts (host-namespaced tools across all sources).
//
// KV (KEYS namespace):
//   toolset:<id>        -> { id, owner_user_id, name, urls[], created_at }
//   tsidx:<user_id>     -> JSON array of the user's toolset ids (newest last)

import type { Context } from "hono";
import { resolveAuth, PLAN_LIMITS, type AuthCtx } from "./auth";

type Env = {
  KEYS: KVNamespace;
  USAGE: KVNamespace;
  ENVIRONMENT: string;
};

const MAX_URLS = 20;
const MAX_TOOLSETS_PER_USER = 50;

function randId(bytes = 8): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(bytes)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
function validUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
function sanitizeName(s: unknown): string {
  return typeof s === "string" ? s.slice(0, 80).replace(/[\x00-\x1f]/g, "").trim() : "";
}

async function ownerIndex(env: Env, user_id: string): Promise<string[]> {
  const raw = await env.KEYS.get(`tsidx:${user_id}`);
  if (!raw) return [];
  try {
    const a = JSON.parse(raw);
    return Array.isArray(a) ? a : [];
  } catch {
    return [];
  }
}

// POST /api/v1/toolsets  { name, urls: [] }  — paid feature.
export async function createToolset(c: Context<{ Bindings: Env }>) {
  const auth = await resolveAuth(c as any);
  if (auth.anonymous) return c.json({ error: "sign_in_or_key_required" }, 401);
  if (!PLAN_LIMITS[auth.plan].can_execute_paid) {
    return c.json(
      { error: "payment_required", hint: "Saved toolsets are a Pro feature. Upgrade at /dashboard.", plan: auth.plan },
      402
    );
  }
  const body = await c.req.json<{ name?: string; urls?: string[] }>().catch(() => null);
  if (!body) return c.json({ error: "invalid_body" }, 400);
  const name = sanitizeName(body.name) || "My toolset";
  const urls = Array.isArray(body.urls) ? body.urls.filter((u) => typeof u === "string").map((u) => u.trim()) : [];
  if (!urls.length) return c.json({ error: "urls_required" }, 400);
  if (urls.length > MAX_URLS) return c.json({ error: "too_many_urls", max: MAX_URLS }, 400);
  const bad = urls.find((u) => !validUrl(u));
  if (bad) return c.json({ error: "invalid_url", url: bad }, 400);

  const existing = await ownerIndex(c.env, auth.user_id);
  if (existing.length >= MAX_TOOLSETS_PER_USER) {
    return c.json({ error: "toolset_limit_reached", max: MAX_TOOLSETS_PER_USER }, 400);
  }

  const id = randId(8);
  const now = Date.now();
  await c.env.KEYS.put(
    `toolset:${id}`,
    JSON.stringify({ id, owner_user_id: auth.user_id, name, urls, created_at: now })
  );
  await c.env.KEYS.put(`tsidx:${auth.user_id}`, JSON.stringify([...existing, id]));

  const origin = new URL(c.req.url).origin;
  return c.json({ ok: true, id, name, urls, mcp_url: `${origin}/mcp/set/${id}` });
}

// GET /api/v1/toolsets — list mine.
export async function listToolsets(c: Context<{ Bindings: Env }>) {
  const auth = await resolveAuth(c as any);
  if (auth.anonymous) return c.json({ error: "sign_in_or_key_required" }, 401);
  const ids = await ownerIndex(c.env, auth.user_id);
  const origin = new URL(c.req.url).origin;
  const toolsets = (
    await Promise.all(
      ids.map(async (id) => {
        const raw = await c.env.KEYS.get(`toolset:${id}`);
        if (!raw) return null;
        try {
          const ts = JSON.parse(raw);
          return { id: ts.id, name: ts.name, urls: ts.urls, created_at: ts.created_at, mcp_url: `${origin}/mcp/set/${id}` };
        } catch {
          return null;
        }
      })
    )
  ).filter(Boolean);
  return c.json({ toolsets });
}

// DELETE /api/v1/toolsets/:id — owner only.
export async function deleteToolset(c: Context<{ Bindings: Env }>) {
  const auth = await resolveAuth(c as any);
  if (auth.anonymous) return c.json({ error: "sign_in_or_key_required" }, 401);
  const id = c.req.param("id");
  const raw = await c.env.KEYS.get(`toolset:${id}`);
  if (!raw) return c.json({ error: "not_found" }, 404);
  let ts: any;
  try {
    ts = JSON.parse(raw);
  } catch {
    return c.json({ error: "not_found" }, 404);
  }
  if (ts.owner_user_id !== auth.user_id) return c.json({ error: "forbidden" }, 403);
  await c.env.KEYS.delete(`toolset:${id}`);
  const idx = await ownerIndex(c.env, auth.user_id);
  await c.env.KEYS.put(`tsidx:${auth.user_id}`, JSON.stringify(idx.filter((x) => x !== id)));
  return c.json({ ok: true, deleted: id });
}

// Used by the MCP server (mcp_server.ts targetUrls) to resolve /mcp/set/:id.
export async function loadToolsetUrls(env: Env, id: string): Promise<string[] | null> {
  const raw = await env.KEYS.get(`toolset:${id}`);
  if (!raw) return null;
  try {
    const ts = JSON.parse(raw);
    return Array.isArray(ts.urls) && ts.urls.length ? ts.urls : null;
  } catch {
    return null;
  }
}
