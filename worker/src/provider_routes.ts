// provider_routes.ts — generic OAuth/API-key connector routes.
//
//   GET  /api/v1/providers                       list available providers
//   GET  /api/v1/me/connections                  list user's active connections
//   GET  /api/v1/providers/:id/start             begin OAuth (or return form metadata for api_key)
//   GET  /api/v1/providers/:id/callback          handle OAuth callback, store token
//   POST /api/v1/providers/:id/api-key           save a user-pasted API key
//   POST /api/v1/providers/:id/disconnect        revoke + delete token
//
// All routes require an authenticated session cookie (Phase A) — we attach
// tokens to user_id.

import type { Context } from "hono";
import { PROVIDERS, listPublicProviders, type Provider } from "./providers";
import {
  createOauthState,
  consumeOauthState,
  readSessionCookie,
} from "./session";
import {
  saveProviderToken,
  loadProviderToken,
  deleteProviderToken,
  listUserConnections,
  type RawTokenInput,
} from "./token_vault";

type Env = {
  KEYS: KVNamespace;
  TOKEN_ENC_KEY?: string;
  // Every per-provider secret accessed via providers.ts → clientIdSecret/clientSecretSecret
  [secret: string]: any;
};

// -------- helpers --------

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

function providerOrNull(id: string): Provider | null {
  return PROVIDERS[id] || null;
}

function clientCreds(env: Env, p: Provider): { id?: string; secret?: string } {
  return {
    id: p.clientIdSecret ? env[p.clientIdSecret] : undefined,
    secret: p.clientSecretSecret ? env[p.clientSecretSecret] : undefined,
  };
}

function callbackUrl(origin: string, providerId: string): string {
  return `${origin}/api/v1/providers/${providerId}/callback`;
}

// -------- public list endpoints --------

export async function getProviders(c: Context<{ Bindings: Env }>) {
  return c.json({ providers: listPublicProviders() });
}

export async function getMyConnections(c: Context<{ Bindings: Env }>) {
  const user_id = await requireUser(c);
  if (!user_id) return c.json({ error: "not_authenticated" }, 401);
  const ids = await listUserConnections(c.env, user_id);
  // Hydrate with provider metadata
  const detail = await Promise.all(
    ids.map(async (pid) => {
      const tok = await loadProviderToken(c.env, user_id, pid);
      return {
        provider_id: pid,
        name: PROVIDERS[pid]?.name || pid,
        connected_at: tok?.record.created_at,
        scope: tok?.record.scope,
        account_name: tok?.record.metadata?.account_name,
      };
    })
  );
  return c.json({ connections: detail });
}

// -------- OAuth start --------

export async function providerStart(c: Context<{ Bindings: Env }>) {
  const id = c.req.param("id");
  const p = providerOrNull(id || "");
  if (!p) return c.json({ error: "unknown_provider" }, 404);

  const user_id = await requireUser(c);
  if (!user_id) return c.json({ error: "not_authenticated" }, 401);

  if (p.authType === "api_key") {
    return c.json({
      provider: p.id,
      authType: "api_key",
      docs_url: p.apiKeyDocsUrl,
      hint: p.apiKeyHint,
      post_url: `/api/v1/providers/${p.id}/api-key`,
    });
  }

  const { id: clientId } = clientCreds(c.env, p);
  if (!clientId) {
    return c.json(
      { error: "provider_not_configured", missing: p.clientIdSecret },
      503
    );
  }

  const origin = new URL(c.req.url).origin;
  const state = await createOauthState(c.env, {
    provider: p.id,
    redirect_to: c.req.query("redirect_to") || "/dashboard",
  });

  // Build authorize URL. Some providers need template substitution (Shopify).
  let authUrl = p.authUrl!;
  const shop = c.req.query("shop");
  if (authUrl.includes("{shop}")) {
    if (!shop) return c.json({ error: "shop_param_required" }, 400);
    authUrl = authUrl.replace("{shop}", encodeURIComponent(shop));
  }

  const sep = p.scopeSeparator || " ";
  const scopeStr =
    p.scopes && sep === ","
      ? p.scopes.split(" ").filter(Boolean).join(",")
      : p.scopes || "";

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl(origin, p.id),
    response_type: "code",
    state,
  });
  if (scopeStr) params.set("scope", scopeStr);

  // Provider-specific: GitHub allows ?allow_signup, Google needs access_type=offline + prompt=consent
  if (p.id === "github") params.set("allow_signup", "true");
  if (p.id === "google") {
    params.set("access_type", "offline");
    params.set("prompt", "consent");
  }
  if (p.id === "notion") params.set("owner", "user");

  return c.redirect(`${authUrl}?${params.toString()}`, 302);
}

// -------- OAuth callback --------

export async function providerCallback(c: Context<{ Bindings: Env }>) {
  const id = c.req.param("id");
  const p = providerOrNull(id || "");
  if (!p) return c.json({ error: "unknown_provider" }, 404);
  if (p.authType !== "oauth2") return c.json({ error: "wrong_flow" }, 400);

  const user_id = await requireUser(c);
  if (!user_id) return c.json({ error: "not_authenticated" }, 401);

  const code = c.req.query("code");
  const state = c.req.query("state");
  if (!code || !state) return c.json({ error: "missing_code_or_state" }, 400);

  const sp = await consumeOauthState(c.env, state);
  if (!sp || sp.provider !== p.id) {
    return c.json({ error: "invalid_state" }, 400);
  }

  const { id: clientId, secret: clientSecret } = clientCreds(c.env, p);
  if (!clientId || !clientSecret) {
    return c.json({ error: "provider_not_configured" }, 503);
  }

  const origin = new URL(c.req.url).origin;

  // Token exchange. Notion + a few others want auth in Basic header; rest in body.
  const tokenBody = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: callbackUrl(origin, p.id),
  });

  const headers: Record<string, string> = {
    accept: "application/json",
    "content-type": "application/x-www-form-urlencoded",
  };

  if (p.tokenAuthMethod === "header") {
    headers.authorization =
      "Basic " + btoa(`${clientId}:${clientSecret}`);
  } else {
    tokenBody.set("client_id", clientId);
    tokenBody.set("client_secret", clientSecret);
  }

  // Shopify: per-shop token endpoint
  let tokenUrl = p.tokenUrl!;
  // (Shopify shop is in state if we stored it — for v0 we punt on Shopify.)

  const tokenRes = await fetch(tokenUrl, {
    method: "POST",
    headers,
    body: tokenBody.toString(),
  });
  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    return c.json(
      { error: "token_exchange_failed", status: tokenRes.status, detail: err.slice(0, 240) },
      502
    );
  }
  const td = (await tokenRes.json()) as any;
  if (!td.access_token) {
    return c.json({ error: "no_access_token_in_response", detail: td }, 502);
  }

  // Fetch user info if we know how (best-effort, doesn't block storage)
  let metadata: any = {};
  if (p.userInfoUrl) {
    try {
      const uiRes = await fetch(p.userInfoUrl, {
        headers: {
          authorization: `Bearer ${td.access_token}`,
          accept: "application/json",
          ...(p.userInfoHeaders || {}),
        },
      });
      if (uiRes.ok) {
        const ui = (await uiRes.json()) as any;
        metadata = {
          account_id: String(ui.id ?? ui.account_id ?? ui.sub ?? ""),
          account_name:
            ui.name ||
            ui.login ||
            ui.email ||
            ui.username ||
            ui.display_name,
        };
      }
    } catch {
      // best-effort
    }
  }

  const rawInput: RawTokenInput = {
    access_token: td.access_token,
    refresh_token: td.refresh_token,
    token_type: td.token_type,
    scope: td.scope,
    expires_in: typeof td.expires_in === "number" ? td.expires_in : undefined,
    metadata,
  };

  await saveProviderToken(c.env, user_id, p.id, rawInput);

  const target = sp.redirect_to || `/dashboard?connected=${p.id}`;
  return c.redirect(target, 302);
}

// -------- API-key flow --------

export async function providerSaveApiKey(c: Context<{ Bindings: Env }>) {
  const id = c.req.param("id");
  const p = providerOrNull(id || "");
  if (!p) return c.json({ error: "unknown_provider" }, 404);
  if (p.authType !== "api_key") return c.json({ error: "wrong_flow" }, 400);

  const user_id = await requireUser(c);
  if (!user_id) return c.json({ error: "not_authenticated" }, 401);

  const body = await c.req.json<{ api_key: string; name?: string }>().catch(() => null);
  if (!body?.api_key || body.api_key.length < 8) {
    return c.json({ error: "invalid_api_key" }, 400);
  }

  await saveProviderToken(c.env, user_id, p.id, {
    access_token: body.api_key,
    metadata: { account_name: body.name || `${p.name} key` },
  });

  return c.json({ ok: true, provider: p.id });
}

// -------- Disconnect --------

export async function providerDisconnect(c: Context<{ Bindings: Env }>) {
  const id = c.req.param("id");
  const p = providerOrNull(id || "");
  if (!p) return c.json({ error: "unknown_provider" }, 404);

  const user_id = await requireUser(c);
  if (!user_id) return c.json({ error: "not_authenticated" }, 401);

  await deleteProviderToken(c.env, user_id, p.id);
  return c.json({ ok: true });
}
