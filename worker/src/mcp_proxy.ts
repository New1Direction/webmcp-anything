// mcp_proxy.ts — OAuth-bearer-injecting proxy for OAuth-protected MCP servers.
//
// Agents connect to https://wmcp.sh/mcp/:provider/* instead of the upstream.
// We:
//   1. Authenticate the wmcp.sh user (session cookie or API key).
//   2. Look up their stored OAuth token for the upstream provider.
//   3. Refresh the token if expired (uses cached DCR client credentials).
//   4. Forward the request transparently — same method, body, headers,
//      query — only replacing `Authorization` with `Bearer <upstream-token>`.
//   5. Stream the response back. Preserves `mcp-session-id` so stateful
//      MCP sessions (Streamable HTTP transport) work end-to-end.
//
// Why this exists: Claude.ai / Cursor / Codex don't support pasting an OAuth
// token for arbitrary remote MCP servers. They expect the server to redirect
// them through an OAuth flow during MCP connection. wmcp.sh takes the auth
// burden — the user connects once via the wmcp.sh dashboard, then any agent
// can hit https://wmcp.sh/mcp/<provider> as if it were an unauthenticated
// server.

import type { Context } from "hono";
import { PROVIDERS, type Provider } from "./providers";
import { loadProviderToken, saveProviderToken } from "./token_vault";
import { ensureMcpClient, refreshPkceToken } from "./mcp_oauth";

type Env = {
  KEYS: KVNamespace;
  TOKEN_ENC_KEY?: string;
  // Shared-tenant override.
  //
  // When SHARED_USER_<PROVIDER_ID_UPPERCASE> is set, the proxy uses THAT
  // user's stored tokens for ALL /mcp/<provider> requests, regardless of who's
  // calling. The calling user still needs a valid wmcp.sh API key + paid plan
  // (gate("execute") in index.ts), so anonymous traffic can't ride for free —
  // but they don't need to do an upstream OAuth dance.
  //
  // Operational + legal notes for the operator (you):
  //   - Most upstream API providers' ToS prohibit single-account multi-tenant
  //     resale. Read your upstream's terms before flipping this on at scale.
  //   - All proxied requests originate from wmcp.sh worker IPs with the same
  //     Bearer token. Upstream rate limits / abuse detection apply to the
  //     single underlying account.
  //   - If upstream suspends the underlying account, ALL wmcp.sh users lose
  //     access at once. Build escalation paths accordingly.
  //
  // Set via:
  //   wrangler secret put SHARED_USER_DEFILLAMA   (paste: gh:<your-github-id>)
  [shared: `SHARED_USER_${string}`]: string | undefined;
};

// Refresh proactively when within this many ms of expiry.
const REFRESH_SKEW_MS = 60 * 1000;

// Headers we never forward (hop-by-hop or wmcp.sh-internal).
const STRIP_REQ_HEADERS = new Set([
  "host",
  "connection",
  "content-length",
  "transfer-encoding",
  "authorization", // we set our own
  "cookie", // upstream doesn't need wmcp session cookies
  "cf-connecting-ip",
  "cf-ipcountry",
  "cf-ray",
  "cf-visitor",
  "x-forwarded-for",
  "x-forwarded-proto",
  "x-real-ip",
]);

const STRIP_RES_HEADERS = new Set([
  "content-encoding", // CF re-encodes
  "content-length",
  "transfer-encoding",
  "connection",
]);

async function getFreshUpstreamToken(
  env: Env,
  user_id: string,
  provider: Provider,
  origin: string
): Promise<string | null> {
  // Shared-tenant override: if SHARED_USER_<PROVIDER> env var is set, route
  // all calls through that user's token vault entry. See Env type above for
  // the operational/legal context.
  const sharedKey = `SHARED_USER_${provider.id.toUpperCase()}` as const;
  const sharedUserId = (env as any)[sharedKey] as string | undefined;
  const effectiveUserId = sharedUserId || user_id;

  const tok = await loadProviderToken(env, effectiveUserId, provider.id);
  if (!tok) return null;

  const expiresAt = tok.record.expires_at;
  const expired =
    typeof expiresAt === "number" && expiresAt <= Date.now() + REFRESH_SKEW_MS;

  if (!expired) return tok.access_token;
  if (!tok.refresh_token) return tok.access_token; // best effort

  // Refresh via PKCE-style refresh_token grant. Uses cached DCR client.
  try {
    const clientRec = await ensureMcpClient(env, provider, origin);
    const td = await refreshPkceToken({
      tokenUrl: provider.tokenUrl!,
      refreshToken: tok.refresh_token,
      clientId: clientRec.client_id,
      clientSecret: clientRec.client_secret,
    });
    // Write back to the SAME user whose tokens we loaded — i.e. the shared
    // tenant if SHARED_USER_<provider> is set, else the calling user.
    await saveProviderToken(env, effectiveUserId, provider.id, {
      access_token: td.access_token,
      // Some providers issue rotating refresh tokens (RFC 8252 §6) — preserve
      // the new one if present, otherwise reuse the old one.
      refresh_token: td.refresh_token || tok.refresh_token,
      token_type: td.token_type,
      scope: td.scope,
      expires_in: typeof td.expires_in === "number" ? td.expires_in : undefined,
      metadata: tok.record.metadata,
    });
    return td.access_token;
  } catch (err) {
    // If refresh fails, fall back to the (likely-expired) access token —
    // upstream will return 401 and the user can re-connect.
    return tok.access_token;
  }
}

/**
 * Handler for /mcp/:provider/* — forwards to provider.mcpUrl with a Bearer
 * token from the calling user's encrypted vault.
 */
export async function mcpProxyHandler(
  c: Context<{ Bindings: Env; Variables: { auth: { user_id: string; anonymous: boolean } } }>
) {
  const providerId = c.req.param("provider");
  const provider = PROVIDERS[providerId || ""];
  if (!provider || !provider.mcpProxy || !provider.mcpUrl) {
    return c.json({ error: "unknown_or_unproxied_provider" }, 404);
  }

  // Auth: must be a real (non-anonymous) wmcp.sh user so we can find their token.
  const auth = c.var.auth;
  if (!auth || auth.anonymous) {
    return c.json(
      {
        error: "authentication_required",
        hint:
          "Get an API key at https://wmcp.sh/dashboard and pass it as Authorization: Bearer <key>. " +
          "Then connect " +
          provider.name +
          " at https://wmcp.sh/dashboard (one-time OAuth).",
      },
      401
    );
  }

  const origin = new URL(c.req.url).origin;
  const upstreamToken = await getFreshUpstreamToken(c.env, auth.user_id, provider, origin);
  if (!upstreamToken) {
    // If a shared tenant is configured for this provider but no token is
    // present, it's a wmcp.sh-side configuration issue, not a user fault.
    const sharedKey = `SHARED_USER_${provider.id.toUpperCase()}` as const;
    const sharedConfigured = (c.env as any)[sharedKey] !== undefined;
    if (sharedConfigured) {
      return c.json(
        {
          error: "shared_tenant_not_initialized",
          provider: provider.id,
          hint:
            provider.name +
            " is configured as a shared-tenant proxy but no upstream token " +
            "is stored. Operator: complete the OAuth dance once as the " +
            "shared user, then this endpoint will work for all callers.",
        },
        503
      );
    }
    return c.json(
      {
        error: "provider_not_connected",
        provider: provider.id,
        hint:
          "Connect " +
          provider.name +
          " at https://wmcp.sh/dashboard (one-time OAuth). " +
          (provider.scopeNotice || ""),
        connect_url: `${origin}/api/v1/providers/${provider.id}/start`,
      },
      412
    );
  }

  // Build upstream URL: provider.mcpUrl + any trailing path captured by the route + original query string.
  // Route is /mcp/:provider so :provider is the only param; everything else after
  // /mcp/<id> is the tail (which we concatenate raw onto the upstream URL).
  const inUrl = new URL(c.req.url);
  const tailPrefix = `/mcp/${providerId}`;
  const tail = inUrl.pathname.startsWith(tailPrefix)
    ? inUrl.pathname.slice(tailPrefix.length)
    : "";
  const upstreamUrl =
    provider.mcpUrl + tail + (inUrl.search ? inUrl.search : "");

  // Copy request headers minus the strip-list, then set our own auth.
  const upstreamHeaders = new Headers();
  c.req.raw.headers.forEach((v, k) => {
    if (!STRIP_REQ_HEADERS.has(k.toLowerCase())) upstreamHeaders.set(k, v);
  });
  upstreamHeaders.set("authorization", `Bearer ${upstreamToken}`);
  // Identify ourselves so upstream logs are useful.
  upstreamHeaders.set("x-forwarded-via", "wmcp.sh");

  let upstreamBody: ArrayBuffer | undefined;
  const method = c.req.method.toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    // Read body as ArrayBuffer to preserve binary fidelity (in practice MCP
    // is always JSON or SSE, but this is safer).
    upstreamBody = await c.req.arrayBuffer();
  }

  const upstreamRes = await fetch(upstreamUrl, {
    method,
    headers: upstreamHeaders,
    body: upstreamBody,
    // Preserve the streaming body — passes through for SSE responses.
    redirect: "manual",
    // Cloudflare-Workers-specific: don't let CF cache MCP responses (stateful).
    cf: { cacheTtl: 0, cacheEverything: false },
  } as any);

  // Pass-through response. Strip hop-by-hop headers but keep mcp-session-id
  // and any custom MCP-protocol headers verbatim.
  const outHeaders = new Headers();
  upstreamRes.headers.forEach((v, k) => {
    if (!STRIP_RES_HEADERS.has(k.toLowerCase())) outHeaders.set(k, v);
  });
  outHeaders.set("x-proxied-by", "wmcp.sh");

  return new Response(upstreamRes.body, {
    status: upstreamRes.status,
    statusText: upstreamRes.statusText,
    headers: outHeaders,
  });
}

/**
 * GET /mcp — list available proxied MCP servers.
 * Lets agents introspect what proxies wmcp.sh exposes.
 */
export async function listMcpProxies(c: Context<{ Bindings: Env }>) {
  const origin = new URL(c.req.url).origin;
  const proxies = Object.values(PROVIDERS)
    .filter((p) => p.mcpProxy && p.mcpUrl)
    .map((p) => ({
      provider_id: p.id,
      name: p.name,
      description: p.description,
      upstream_mcp_url: p.mcpUrl,
      proxied_url: `${origin}/mcp/${p.id}`,
      connect_url: `${origin}/api/v1/providers/${p.id}/start`,
      status: p.status,
      notice: p.scopeNotice,
    }));
  return c.json({ proxies });
}
