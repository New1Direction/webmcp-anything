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

type Env = { KEYS: KVNamespace };

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

// CSRF state — short-lived random string stored against the session-to-be.
// Verified on callback to prevent CSRF on the OAuth flow.
const STATE_TTL = 600; // 10 min

export async function createOauthState(
  env: Env,
  payload: { provider: string; redirect_to?: string }
): Promise<string> {
  const state = randomId(16);
  await env.KEYS.put(`oauth_state:${state}`, JSON.stringify(payload), {
    expirationTtl: STATE_TTL,
  });
  return state;
}

export async function consumeOauthState(
  env: Env,
  state: string
): Promise<{ provider: string; redirect_to?: string } | null> {
  const raw = await env.KEYS.get(`oauth_state:${state}`);
  if (!raw) return null;
  // Single-use: delete after read.
  await env.KEYS.delete(`oauth_state:${state}`);
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
