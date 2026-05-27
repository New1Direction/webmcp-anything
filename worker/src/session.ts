// session.ts — KV-backed sessions with cookie transport.
//
// Sessions live in the KEYS namespace under `session:<id>`. Cookie is HttpOnly,
// Secure, SameSite=Lax, 30-day TTL. Sessions are referenced by random 32-byte
// hex IDs (no JWT — server-side state is fine at our scale and avoids the
// "JWT revocation" footgun).

import type { Context } from "hono";

export interface Session {
  user_id: string;
  email?: string;
  github_id?: number;
  github_login?: string;
  created_at: number;
  // Track which providers the user has connected (filled in by Phase B).
  connections?: string[];
}

type Env = { KEYS: KVNamespace; TOKEN_ENC_KEY?: string };

const COOKIE_NAME = "wmcp_session";
const SESSION_TTL = 30 * 86400; // 30 days

export function randomId(bytes = 32): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createSession(
  env: Env,
  data: Omit<Session, "created_at">
): Promise<{ id: string; cookie: string }> {
  const id = randomId();
  const full: Session = { ...data, created_at: Date.now() };
  await env.KEYS.put(`session:${id}`, JSON.stringify(full), {
    expirationTtl: SESSION_TTL,
  });
  // Also index user → latest session so /logout can clear it without the cookie.
  await env.KEYS.put(`user_session:${data.user_id}`, id, {
    expirationTtl: SESSION_TTL,
  });
  return { id, cookie: cookieHeader(id) };
}

export async function getSession(
  env: Env,
  id: string | null
): Promise<Session | null> {
  if (!id) return null;
  const raw = await env.KEYS.get(`session:${id}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export async function deleteSession(env: Env, id: string): Promise<void> {
  await env.KEYS.delete(`session:${id}`);
}

export function readSessionCookie(c: Context): string | null {
  const header = c.req.header("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === COOKIE_NAME) return rest.join("=");
  }
  return null;
}

function cookieHeader(id: string): string {
  return `${COOKIE_NAME}=${id}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_TTL}`;
}

export function clearCookieHeader(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

// CSRF state for the OAuth flow.
//
// Default mode (TOKEN_ENC_KEY set): the state is a stateless HMAC-signed
// payload encoded into the `state` URL parameter — zero KV writes. Signature
// uses HMAC-SHA256 keyed by TOKEN_ENC_KEY (already in env for the token vault).
// Replay protection comes from a 10-minute embedded expiry: an attacker
// recapturing the state has at most 10min to use it, and the upstream code
// is single-use so a second exchange would already 4xx at GitHub/Google/etc.
//
// Legacy mode (no TOKEN_ENC_KEY): falls back to the original KV-stored state.
// Pre-existing in-flight OAuth flows are also accepted by consumeOauthState's
// KV lookup, so a deploy mid-flow doesn't break anyone.

const STATE_TTL_SEC = 600; // 10 min
const SIGNED_STATE_PREFIX = "v1.";

interface StatePayload {
  provider: string;
  redirect_to?: string;
  // PKCE verifier (RFC 7636) — set when the provider uses usePKCERedirect.
  // Round-trips through the OAuth state so the callback can exchange the code.
  pkce_verifier?: string;
}

interface InternalStatePayload extends StatePayload {
  exp: number; // ms epoch
}

function b64urlEncode(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = (s + pad).replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacSha256(secret: string, data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data)
  );
  return new Uint8Array(sig);
}

// Constant-time byte compare to avoid signature-timing leaks.
function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function createOauthState(
  env: Env,
  payload: StatePayload
): Promise<string> {
  const secret = env.TOKEN_ENC_KEY;
  if (secret) {
    const full: InternalStatePayload = {
      ...payload,
      exp: Date.now() + STATE_TTL_SEC * 1000,
    };
    const payloadB64 = b64urlEncode(
      new TextEncoder().encode(JSON.stringify(full))
    );
    const sig = await hmacSha256(secret, payloadB64);
    return SIGNED_STATE_PREFIX + payloadB64 + "." + b64urlEncode(sig);
  }

  // Legacy fallback: store in KV.
  const state = randomId(16);
  await env.KEYS.put(`oauth_state:${state}`, JSON.stringify(payload), {
    expirationTtl: STATE_TTL_SEC,
  });
  return state;
}

export async function consumeOauthState(
  env: Env,
  state: string
): Promise<StatePayload | null> {
  // Modern path: signed stateless payload.
  if (state.startsWith(SIGNED_STATE_PREFIX) && env.TOKEN_ENC_KEY) {
    const rest = state.slice(SIGNED_STATE_PREFIX.length);
    const dot = rest.lastIndexOf(".");
    if (dot <= 0) return null;
    const payloadB64 = rest.slice(0, dot);
    const sigB64 = rest.slice(dot + 1);
    const expectedSig = await hmacSha256(env.TOKEN_ENC_KEY, payloadB64);
    let providedSig: Uint8Array;
    try {
      providedSig = b64urlDecode(sigB64);
    } catch {
      return null;
    }
    if (!constantTimeEqual(expectedSig, providedSig)) return null;
    let inner: InternalStatePayload;
    try {
      inner = JSON.parse(new TextDecoder().decode(b64urlDecode(payloadB64)));
    } catch {
      return null;
    }
    if (typeof inner.exp !== "number" || inner.exp < Date.now()) return null;
    return {
      provider: inner.provider,
      redirect_to: inner.redirect_to,
      pkce_verifier: inner.pkce_verifier,
    };
  }

  // Legacy path: KV-stored state. Kept for in-flight flows that started
  // before this deploy. Single-use: delete after read.
  const raw = await env.KEYS.get(`oauth_state:${state}`);
  if (!raw) return null;
  await env.KEYS.delete(`oauth_state:${state}`);
  try {
    return JSON.parse(raw) as StatePayload;
  } catch {
    return null;
  }
}
