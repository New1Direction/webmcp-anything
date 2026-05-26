// anthropic_oauth.ts — PKCE + OOB OAuth flow for Anthropic (Claude Code + Max).
//
// Anthropic's third-party-client OAuth flow doesn't use a per-app redirect URI.
// Instead, the user authorizes on claude.ai, Anthropic redirects to its own
// /oauth/code/callback which displays the code, and the user copies + pastes
// it back into the calling app. This is the same out-of-band (OOB) pattern
// Claude Code, OpenCode, pi-ai, and Hermes all use.
//
// We override the generic OAuth route for the `anthropic` provider because:
//   1. No client_secret — PKCE replaces it (S256)
//   2. Redirect URI is Anthropic's, not ours — user paste-back happens out of band
//   3. Token exchange requires JSON body + a claude-cli User-Agent

import type { Context } from "hono";
import { saveProviderToken } from "./token_vault";
import { readSessionCookie } from "./session";

type Env = {
  KEYS: KVNamespace;
  TOKEN_ENC_KEY?: string;
};

// Public Claude Code OAuth client_id. Used by Claude Code, OpenCode, pi-ai,
// Hermes. Anthropic could revoke at any time — ToS gray area for third parties.
const CLAUDE_CODE_CLIENT_ID = "9d1c250a-e61b-44d9-88ed-5944d1962f5e";
const AUTHORIZE_URL = "https://claude.ai/oauth/authorize";
const TOKEN_URL = "https://console.anthropic.com/v1/oauth/token";
const OOB_REDIRECT = "https://console.anthropic.com/oauth/code/callback";
const SCOPES = "org:create_api_key user:profile user:inference";

// ---------- PKCE helpers ----------

function bytesToBase64Url(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function generatePkce(): Promise<{ verifier: string; challenge: string }> {
  const verifierBytes = new Uint8Array(32);
  crypto.getRandomValues(verifierBytes);
  const verifier = bytesToBase64Url(verifierBytes);
  const challengeBytes = new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier))
  );
  const challenge = bytesToBase64Url(challengeBytes);
  return { verifier, challenge };
}

function randomState(): string {
  const b = new Uint8Array(24);
  crypto.getRandomValues(b);
  return bytesToBase64Url(b);
}

// ---------- session helper ----------

async function requireUser(c: Context<{ Bindings: Env }>): Promise<string | null> {
  const sid = readSessionCookie(c);
  if (!sid) return null;
  const raw = await c.env.KEYS.get(`session:${sid}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw).user_id || null;
  } catch {
    return null;
  }
}

// ---------- handlers ----------

/**
 * GET /api/v1/providers/anthropic/start
 * Generates PKCE + state, stashes verifier in KV keyed by state, returns the
 * authorize URL the user opens in their browser. Frontend shows the URL +
 * a paste form for the code that Anthropic's callback page will display.
 */
export async function anthropicStart(c: Context<{ Bindings: Env }>) {
  const user_id = await requireUser(c);
  if (!user_id) return c.json({ error: "not_authenticated" }, 401);

  const { verifier, challenge } = await generatePkce();
  const state = randomState();

  // Stash verifier so the exchange handler can recover it.
  // 10 min TTL — user shouldn't need longer to paste the code back.
  await c.env.KEYS.put(
    `anthropic_oauth:${state}`,
    JSON.stringify({ verifier, user_id, created_at: Date.now() }),
    { expirationTtl: 600 }
  );

  const params = new URLSearchParams({
    code: "true",
    client_id: CLAUDE_CODE_CLIENT_ID,
    response_type: "code",
    redirect_uri: OOB_REDIRECT,
    scope: SCOPES,
    code_challenge: challenge,
    code_challenge_method: "S256",
    state,
  });

  return c.json({
    provider: "anthropic",
    authType: "oauth2_oob",
    authorize_url: `${AUTHORIZE_URL}?${params.toString()}`,
    state,
    instructions:
      "Open authorize_url, approve. Anthropic's page will show a code — " +
      "paste it (including any #state suffix) into POST /api/v1/providers/anthropic/exchange.",
    paste_endpoint: "/api/v1/providers/anthropic/exchange",
  });
}

/**
 * POST /api/v1/providers/anthropic/exchange
 * Body: { code, state? }
 * Exchanges the pasted code (+ stored verifier) with Anthropic and persists
 * the token in the vault.
 */
export async function anthropicExchange(c: Context<{ Bindings: Env }>) {
  const user_id = await requireUser(c);
  if (!user_id) return c.json({ error: "not_authenticated" }, 401);

  const body = await c.req.json<{ code: string; state?: string }>().catch(() => null);
  if (!body?.code) return c.json({ error: "code_required" }, 400);

  // Code may come pasted with a "#<state>" suffix that Anthropic's OOB page
  // includes. Split it apart.
  const codeRaw = body.code.trim();
  const [code, pastedState] = codeRaw.split("#");

  const state = body.state || pastedState;
  if (!state) return c.json({ error: "state_required" }, 400);

  const stash = await c.env.KEYS.get(`anthropic_oauth:${state}`);
  if (!stash) return c.json({ error: "invalid_or_expired_state" }, 400);
  let stashed: { verifier: string; user_id: string };
  try {
    stashed = JSON.parse(stash);
  } catch {
    return c.json({ error: "invalid_state_payload" }, 400);
  }
  if (stashed.user_id !== user_id) {
    return c.json({ error: "state_user_mismatch" }, 400);
  }

  // Single-use
  await c.env.KEYS.delete(`anthropic_oauth:${state}`);

  // Exchange. Anthropic wants JSON body + claude-cli User-Agent.
  const exchangeRes = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      "user-agent": "claude-cli/2.1.149 (external, cli)",
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: CLAUDE_CODE_CLIENT_ID,
      code,
      state,
      redirect_uri: OOB_REDIRECT,
      code_verifier: stashed.verifier,
    }),
  });

  if (!exchangeRes.ok) {
    const err = await exchangeRes.text();
    return c.json(
      { error: "token_exchange_failed", status: exchangeRes.status, detail: err.slice(0, 400) },
      502
    );
  }
  const td = (await exchangeRes.json()) as any;
  if (!td.access_token) {
    return c.json({ error: "no_access_token", detail: td }, 502);
  }

  await saveProviderToken(c.env, user_id, "anthropic", {
    access_token: td.access_token,
    refresh_token: td.refresh_token,
    token_type: td.token_type,
    scope: td.scope || SCOPES,
    expires_in: typeof td.expires_in === "number" ? td.expires_in : undefined,
    metadata: {
      account_name: "Anthropic (Claude Code + Max)",
      flow: "pkce_oob",
    },
  });

  return c.json({ ok: true, provider: "anthropic" });
}
