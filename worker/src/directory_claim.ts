// directory_claim.ts — prove control of a hostname before selling a Verified
// badge for it. This is the hard precondition for the self-serve Verified SKU
// (stripe.ts createDirectoryVerifiedCheckout): without it, anyone could buy a
// trust badge for a brand they don't own — a trademark/integrity landmine.
//
// Model (same as Google Search Console's meta-tag method):
//   1. GET  /api/v1/directory/claim/start?url=<site>  → returns a signed,
//      stateless challenge token + the <meta> tag to embed. No KV write.
//   2. Owner adds  <meta name="wmcp-verify" content="<token>">  to their page.
//   3. POST /api/v1/directory/claim/verify { url } → we fetch the page, find a
//      valid token for that host, and record owner:host:<hostname> in KEYS.
//
// Ownership is HOST-scoped (owner:host:<hostname>), never path-scoped, so a
// meta tag on one Shopify/Substack page can't be used to claim a sibling path
// the claimer doesn't control.

import type { Context } from "hono";
import { resolveAuth } from "./auth";

type Env = {
  KEYS: KVNamespace;
  USAGE: KVNamespace;
  ENVIRONMENT: string;
  TOKEN_ENC_KEY?: string;
};

const CLAIM_TTL_MS = 24 * 3600 * 1000; // token valid 24h
const FETCH_TIMEOUT_MS = 8000;
const UA =
  "Mozilla/5.0 (compatible; wmcp.sh-verify/1.0; +https://wmcp.sh/directory)";

// ---- tiny self-contained crypto (mirrors session.ts; kept local to avoid
// widening that module's export surface) ----

function b64urlEncode(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlDecode(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const bin = atob((s + pad).replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
async function hmac(secret: string, data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data))
  );
}
function ctEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function mintToken(secret: string, hostname: string): Promise<string> {
  const payload = b64urlEncode(
    new TextEncoder().encode(JSON.stringify({ h: hostname, exp: Date.now() + CLAIM_TTL_MS }))
  );
  const sig = b64urlEncode(await hmac(secret, payload));
  return `wmcp1.${payload}.${sig}`;
}

async function tokenMatches(
  secret: string,
  token: string,
  hostname: string
): Promise<boolean> {
  if (!token.startsWith("wmcp1.")) return false;
  const rest = token.slice("wmcp1.".length);
  const dot = rest.lastIndexOf(".");
  if (dot <= 0) return false;
  const payload = rest.slice(0, dot);
  const sigB64 = rest.slice(dot + 1);
  let provided: Uint8Array;
  try {
    provided = b64urlDecode(sigB64);
  } catch {
    return false;
  }
  const expected = await hmac(secret, payload);
  if (!ctEqual(expected, provided)) return false;
  let inner: { h?: string; exp?: number };
  try {
    inner = JSON.parse(new TextDecoder().decode(b64urlDecode(payload)));
  } catch {
    return false;
  }
  return inner.h === hostname && typeof inner.exp === "number" && inner.exp > Date.now();
}

function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

// GET /api/v1/directory/claim/start?url=<site>
export async function claimStart(c: Context<{ Bindings: Env }>) {
  const auth = await resolveAuth(c as any);
  if (auth.anonymous) {
    return c.json({ error: "sign_in_required", hint: "Sign in at /dashboard, then claim." }, 401);
  }
  const url = c.req.query("url");
  if (!url) return c.json({ error: "url_required" }, 400);
  const hostname = hostnameOf(url);
  if (!hostname) return c.json({ error: "invalid_url" }, 400);
  if (!c.env.TOKEN_ENC_KEY) return c.json({ error: "claim_not_configured" }, 503);

  // Already owned? Tell the caller (so the UI can skip straight to purchase).
  const ownerRaw = await c.env.KEYS.get(`owner:host:${hostname}`);
  if (ownerRaw) {
    const owner = JSON.parse(ownerRaw);
    if (owner.user_id === auth.user_id) {
      return c.json({ ok: true, already_owner: true, hostname });
    }
    return c.json({ error: "already_claimed", hostname, hint: "This host is claimed by another account. Contact support@example.com to dispute." }, 409);
  }

  const token = await mintToken(c.env.TOKEN_ENC_KEY, hostname);
  return c.json({
    ok: true,
    hostname,
    token,
    meta_tag: `<meta name="wmcp-verify" content="${token}">`,
    instructions:
      `Add this <meta> tag to the <head> of https://${hostname}/ (or any page on that host), then POST /api/v1/directory/claim/verify { "url": "https://${hostname}/" }. Token valid 24h.`,
    expires_in_ms: CLAIM_TTL_MS,
  });
}

function extractVerifyTokens(html: string): string[] {
  const out: string[] = [];
  const metas = html.match(/<meta\b[^>]*>/gi) || [];
  for (const m of metas) {
    if (!/name=["']wmcp-verify["']/i.test(m)) continue;
    const cm = m.match(/content=["']([^"']+)["']/i);
    if (cm) out.push(cm[1]);
  }
  return out;
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "user-agent": UA, accept: "text/html" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      redirect: "follow",
    });
    if (!res.ok) return null;
    return (await res.text()).slice(0, 512 * 1024); // cap to 512KB
  } catch {
    return null;
  }
}

// POST /api/v1/directory/claim/verify  { url }
export async function claimVerify(c: Context<{ Bindings: Env }>) {
  const auth = await resolveAuth(c as any);
  if (auth.anonymous) return c.json({ error: "sign_in_required" }, 401);
  const body = await c.req.json<{ url?: string }>().catch(() => null);
  if (!body?.url) return c.json({ error: "url_required" }, 400);
  const hostname = hostnameOf(body.url);
  if (!hostname) return c.json({ error: "invalid_url" }, 400);
  if (!c.env.TOKEN_ENC_KEY) return c.json({ error: "claim_not_configured" }, 503);

  // Don't let someone re-claim a host owned by another account.
  const ownerRaw = await c.env.KEYS.get(`owner:host:${hostname}`);
  if (ownerRaw) {
    const owner = JSON.parse(ownerRaw);
    if (owner.user_id !== auth.user_id) {
      return c.json({ error: "already_claimed", hostname }, 409);
    }
  }

  // Check the submitted URL first, then the host root.
  const candidates = [body.url, `https://${hostname}/`];
  const seen = new Set<string>();
  let matched = false;
  for (const u of candidates) {
    if (seen.has(u)) continue;
    seen.add(u);
    const html = await fetchHtml(u);
    if (!html) continue;
    const tokens = extractVerifyTokens(html);
    for (const t of tokens) {
      if (await tokenMatches(c.env.TOKEN_ENC_KEY, t, hostname)) {
        matched = true;
        break;
      }
    }
    if (matched) break;
  }

  if (!matched) {
    return c.json(
      {
        error: "verification_failed",
        hostname,
        hint: `Couldn't find a valid <meta name="wmcp-verify"> for ${hostname}. Add the tag from /claim/start, wait for your CDN cache to clear, then retry.`,
      },
      422
    );
  }

  await c.env.KEYS.put(
    `owner:host:${hostname}`,
    JSON.stringify({ user_id: auth.user_id, verified_at: Date.now(), method: "meta" })
  );
  return c.json({
    ok: true,
    hostname,
    owner: auth.user_id,
    next: "POST /api/v1/directory/verified/checkout { url } to buy the Verified badge.",
  });
}
