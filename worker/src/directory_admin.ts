// directory_admin.ts — verify, feature, unverify, list submissions.
//
// All gated by x-admin-token (matches existing /api/v1/keys pattern).
//
// KV state:
//   verified:<slug>     -> "1"             (presence = verified)
//   featured:<slug>     -> "<rank>"        (lower = higher; sorted ascending)
//   dirsub:<reverse-ts>:<rand>             (submission records)

import type { Context } from "hono";
import { slugFromUrl } from "./slug";

type Env = {
  KEYS: KVNamespace;
  ADMIN_TOKEN?: string;
  ENVIRONMENT?: string;
};

function checkAdmin(c: Context<{ Bindings: Env }>): boolean {
  const header = c.req.header("x-admin-token");
  const want =
    c.env.ADMIN_TOKEN ||
    (c.env.ENVIRONMENT === "development" ? "devadmin" : null);
  return !!want && header === want;
}

function deriveSlug(body: { slug?: string; site_url?: string }): string | null {
  if (body.slug && /^[a-z0-9-]{1,80}$/i.test(body.slug)) return body.slug.toLowerCase();
  if (body.site_url) return slugFromUrl(body.site_url);
  return null;
}

// POST /api/v1/admin/directory/verify
// Body: { slug?, site_url?, featured_rank? }
//   - sets verified:<slug>=1
//   - if featured_rank provided, also sets featured:<slug>=<rank>
export async function verifyListing(c: Context<{ Bindings: Env }>) {
  if (!checkAdmin(c)) return c.json({ error: "admin only" }, 401);
  const body = await c.req
    .json<{ slug?: string; site_url?: string; featured_rank?: number }>()
    .catch(() => null);
  if (!body) return c.json({ error: "invalid_body" }, 400);
  const slug = deriveSlug(body);
  if (!slug) return c.json({ error: "slug_or_site_url_required" }, 400);

  await c.env.KEYS.put(`verified:${slug}`, "1", { metadata: { ts: Date.now() } });
  let featured: number | null = null;
  if (typeof body.featured_rank === "number" && Number.isFinite(body.featured_rank)) {
    const rank = Math.max(0, Math.min(9999, Math.floor(body.featured_rank)));
    await c.env.KEYS.put(`featured:${slug}`, String(rank), { metadata: { ts: Date.now() } });
    featured = rank;
  }
  return c.json({ ok: true, slug, verified: true, featured_rank: featured });
}

// POST /api/v1/admin/directory/unverify
// Body: { slug?, site_url? }
//   - removes verified:<slug> and featured:<slug>
export async function unverifyListing(c: Context<{ Bindings: Env }>) {
  if (!checkAdmin(c)) return c.json({ error: "admin only" }, 401);
  const body = await c.req.json<{ slug?: string; site_url?: string }>().catch(() => null);
  if (!body) return c.json({ error: "invalid_body" }, 400);
  const slug = deriveSlug(body);
  if (!slug) return c.json({ error: "slug_or_site_url_required" }, 400);
  await c.env.KEYS.delete(`verified:${slug}`);
  await c.env.KEYS.delete(`featured:${slug}`);
  return c.json({ ok: true, slug, verified: false });
}

// POST /api/v1/admin/directory/feature
// Body: { slug?, site_url?, rank }
//   - sets featured:<slug>=<rank> (does NOT imply verified)
export async function featureListing(c: Context<{ Bindings: Env }>) {
  if (!checkAdmin(c)) return c.json({ error: "admin only" }, 401);
  const body = await c.req
    .json<{ slug?: string; site_url?: string; rank?: number }>()
    .catch(() => null);
  if (!body) return c.json({ error: "invalid_body" }, 400);
  const slug = deriveSlug(body);
  if (!slug) return c.json({ error: "slug_or_site_url_required" }, 400);
  if (typeof body.rank !== "number") return c.json({ error: "rank_required" }, 400);
  const rank = Math.max(0, Math.min(9999, Math.floor(body.rank)));
  await c.env.KEYS.put(`featured:${slug}`, String(rank), { metadata: { ts: Date.now() } });
  return c.json({ ok: true, slug, featured_rank: rank });
}

// POST /api/v1/admin/directory/unfeature
export async function unfeatureListing(c: Context<{ Bindings: Env }>) {
  if (!checkAdmin(c)) return c.json({ error: "admin only" }, 401);
  const body = await c.req.json<{ slug?: string; site_url?: string }>().catch(() => null);
  if (!body) return c.json({ error: "invalid_body" }, 400);
  const slug = deriveSlug(body);
  if (!slug) return c.json({ error: "slug_or_site_url_required" }, 400);
  await c.env.KEYS.delete(`featured:${slug}`);
  return c.json({ ok: true, slug });
}

// GET /api/v1/admin/directory/submissions?limit=100&cursor=...
//   - lists dirsub:* keys with metadata + hydrates full record
//   - reverse-ts means newest first naturally
export async function listSubmissions(c: Context<{ Bindings: Env }>) {
  if (!checkAdmin(c)) return c.json({ error: "admin only" }, 401);
  const limit = Math.min(200, parseInt(c.req.query("limit") || "50", 10));
  const cursor = c.req.query("cursor") || undefined;
  const list = await c.env.KEYS.list({ prefix: "dirsub:", limit, cursor });

  const records = await Promise.all(
    list.keys.map(async (k) => {
      try {
        const raw = await c.env.KEYS.get(k.name);
        if (!raw) return null;
        const rec = JSON.parse(raw);
        const slug: string = rec.slug || slugFromUrl(rec.site_url || "");
        // Check current verify/feature state
        const [v, f] = await Promise.all([
          c.env.KEYS.get(`verified:${slug}`),
          c.env.KEYS.get(`featured:${slug}`),
        ]);
        return {
          key: k.name,
          ...rec,
          verified: v === "1",
          featured_rank: f ? parseInt(f, 10) : null,
        };
      } catch {
        return null;
      }
    })
  );

  return c.json({
    entries: records.filter(Boolean),
    cursor: (list as any).cursor || null,
    list_complete: list.list_complete,
  });
}

// GET /api/v1/admin/directory/state
//   - dumps the current verified + featured sets (for debugging / sync to UI)
export async function getDirectoryState(c: Context<{ Bindings: Env }>) {
  if (!checkAdmin(c)) return c.json({ error: "admin only" }, 401);
  const [vList, fList] = await Promise.all([
    c.env.KEYS.list({ prefix: "verified:", limit: 1000 }),
    c.env.KEYS.list({ prefix: "featured:", limit: 1000 }),
  ]);
  const verified = vList.keys.map((k) => k.name.slice("verified:".length));
  const featured: Record<string, number> = {};
  await Promise.all(
    fList.keys.map(async (k) => {
      const slug = k.name.slice("featured:".length);
      const v = await c.env.KEYS.get(k.name);
      if (v) featured[slug] = parseInt(v, 10);
    })
  );
  return c.json({ verified, featured });
}
