// mcp_oauth.ts — MCP-spec OAuth helpers (RFC 7591 DCR + RFC 7636 PKCE).
//
// The MCP authorization spec mandates:
//   - Dynamic client registration (so we don't pre-register a client at every
//     MCP server in the world)
//   - PKCE with S256 (no static client secret transmitted from public clients)
//
// This module implements both. Cached client credentials live in KV under
// `mcp_client:<provider_id>` so we only register once per provider.

import type { Provider } from "./providers";

type Env = {
  KEYS: KVNamespace;
};

export interface McpClientRecord {
  client_id: string;
  // Some servers return a confidential client (with secret); MCP spec recommends
  // public clients (none-auth + PKCE) but we handle both.
  client_secret?: string;
  // Echoed metadata, used for debugging / future re-registration.
  registered_at: number;
  registration_endpoint: string;
  redirect_uris: string[];
}

// ---------- Dynamic Client Registration (RFC 7591) ----------

/**
 * Ensure we have a registered OAuth client at the provider's MCP server.
 * Cached in KV — single registration per provider, reused forever (or until
 * the server invalidates us, in which case we'll see a 4xx and need to
 * re-register; v0 doesn't handle that path automatically).
 */
export async function ensureMcpClient(
  env: Env,
  provider: Provider,
  origin: string
): Promise<McpClientRecord> {
  if (!provider.dcrRegistrationUrl) {
    throw new Error(`provider ${provider.id} is not DCR-enabled`);
  }
  const cacheKey = `mcp_client:${provider.id}`;
  const cached = await env.KEYS.get(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached) as McpClientRecord;
    } catch {
      // fall through and re-register
    }
  }
  const redirect_uri = `${origin}/api/v1/providers/${provider.id}/callback`;
  const body = {
    client_name: "wmcp.sh — URL-to-MCP gateway",
    client_uri: "https://wmcp.sh",
    logo_uri: "https://wmcp.sh/og.png",
    redirect_uris: [redirect_uri],
    grant_types: ["authorization_code", "refresh_token"],
    response_types: ["code"],
    token_endpoint_auth_method: "none", // public client + PKCE
    scope: provider.scopes || "openid",
  };
  const res = await fetch(provider.dcrRegistrationUrl, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(
      `DCR failed for ${provider.id} (${res.status}): ${txt.slice(0, 200)}`
    );
  }
  const data = (await res.json()) as any;
  const rec: McpClientRecord = {
    client_id: data.client_id,
    client_secret: data.client_secret,
    registered_at: Date.now(),
    registration_endpoint: provider.dcrRegistrationUrl,
    redirect_uris: [redirect_uri],
  };
  if (!rec.client_id) throw new Error(`DCR returned no client_id for ${provider.id}`);
  // No TTL — registrations are long-lived per MCP spec.
  await env.KEYS.put(cacheKey, JSON.stringify(rec));
  return rec;
}

// ---------- PKCE (RFC 7636) ----------

/** Base64url (no padding) of bytes. */
function b64url(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** 43-char URL-safe random verifier. */
export function generatePkceVerifier(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return b64url(bytes);
}

/** SHA-256(verifier) base64url-encoded — the S256 challenge. */
export async function pkceChallengeS256(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier)
  );
  return b64url(new Uint8Array(digest));
}

// ---------- Token exchange / refresh helpers ----------

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
}

/**
 * Exchange an authorization_code for tokens. Uses PKCE verifier and either
 * no client auth (public client) or client_secret_post.
 */
export async function exchangePkceCode(opts: {
  tokenUrl: string;
  code: string;
  codeVerifier: string;
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
}): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: opts.code,
    redirect_uri: opts.redirectUri,
    client_id: opts.clientId,
    code_verifier: opts.codeVerifier,
  });
  if (opts.clientSecret) body.set("client_secret", opts.clientSecret);

  const res = await fetch(opts.tokenUrl, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`token exchange failed (${res.status}): ${txt.slice(0, 240)}`);
  }
  return (await res.json()) as TokenResponse;
}

/** Refresh an OAuth token using the refresh_token grant. */
export async function refreshPkceToken(opts: {
  tokenUrl: string;
  refreshToken: string;
  clientId: string;
  clientSecret?: string;
}): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: opts.refreshToken,
    client_id: opts.clientId,
  });
  if (opts.clientSecret) body.set("client_secret", opts.clientSecret);

  const res = await fetch(opts.tokenUrl, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`refresh failed (${res.status}): ${txt.slice(0, 240)}`);
  }
  return (await res.json()) as TokenResponse;
}
