# API reference

Reference for the principal API routes in this repository. Base URL: `https://wmcp.sh`. For the complete current route list, see `worker/src/index.ts`.

Authentication and quotas vary by endpoint. Admin routes and the key-issuance and revocation routes check `x-admin-token`. URL-based MCP discovery and API reads support anonymous use; URL-based MCP tool calls and REST execution require a plan that permits execution. Provider proxies require a non-anonymous account and the relevant connection. Browser dashboard and provider-management routes use sessions. Send API keys in `Authorization: Bearer <api-key>` rather than URLs.

## Tool extraction

### `GET /api/v1/tools`

Extract MCP tools from any URL.

**Query params**
- `url` (required) — the source URL to extract tools from
- `fresh=1` (optional) — bypass the cache read

**Response (200)**
```json
{
  "adapter": "shopify",
  "from": "live",
  "tools": [
    {
      "name": "list_variants",
      "description": "List all available variants.",
      "inputSchema": { "type": "object", "properties": {}, "required": [] },
      "result": []
    }
  ]
}
```

This is an abbreviated illustrative response; tools and optional `product` and `variants` fields depend on the adapter. `from` is `cache`, `live`, or `llm`; cached responses can include `cached_at` in milliseconds.

**Common errors:** missing `url` returns 400; quota exhaustion returns 429; a failed page fetch can return 502 `fetch_failed`; and no extracted tools can return 404 `no_tools_extracted`. Exact failures depend on the adapter and upstream.

**Cache behavior**
- Cache key: `v1:<normalized-url>` in `CACHE`; `seen:<normalized-url>` maintains the directory index.
- Storage TTL varies by adapter: Shopify 1h, OpenAPI 24h, JSON-LD 6h, LLM 30 days, and crypto/data adapters 60s–24h. The extraction path currently accepts a cached entry up to 60 seconds old regardless of its storage TTL.

### `POST /api/v1/tools/execute`

Execute a named tool with `{ "url": "https://example.com/product", "tool": "get_price", "args": {} }`. The execute gate requires an eligible paid plan and meters execution quota. Success is `{ "ok": true, "value": ... }`; the value depends on the tool. Review the returned tool schema and site permissions before invoking an action.

### `POST /api/v1/cache`

Push a pre-extracted tool list (used by the Chrome extension to share schemas for auth-walled sites).

**Quota**: the push gate resolves an API key or session, or an anonymous free-plan identity. It meters pushes; this route is not restricted to paid keys by the gate.

**Body**
```json
{
  "url": "https://example.com/products/foo",
  "payload": {
    "tools": [],
    "adapter": "extension-jsonld",
    "product": { "title": "Example" }
  }
}
```

**Response**
```json
{ "ok": true, "key": "v1:https://example.com/products/foo", "pushed_by": "user_123" }
```

## Directory

### `GET /api/v1/directory`

List indexed URLs, newest-first with featured entries pinned to the top.

**Query params**
- `limit` (optional, default 200, max 500)
- `per_host` (optional, default 3; `0` disables the per-host cap)

**Response**
```json
{
  "entries": [
    {
      "url": "https://www.example.com/...",
      "adapter": "shopify",
      "ts": 1779897000,
      "title": "...",
      "slug": "www-example-com-...",
      "verified": true,
      "featured_rank": 10
    }
  ],
  "list_complete": false,
  "distinct_hosts": 1,
  "per_host_cap": 3
}
```

Featured entries (`featured_rank != null`) appear first, sorted ascending by rank. Non-featured entries follow, sorted by `ts` desc.

### `POST /api/v1/directory/submit`

Submit a URL for directory inclusion. Triggers an async tools-probe to warm the cache.

**Body**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "site_url": "https://example.com",
  "category": "ecommerce",
  "blurb": "Optional 280-char description",
  "managed_interest": false
}
```

**Response**
```json
{
  "ok": true,
  "submission_id": "...",
  "slug": "example-com",
  "listing_url": "https://wmcp.sh/u/example-com",
  "managed_interest_filed": false
}
```

The handler currently returns a slug-based `listing_url`; verify it against your deployment before linking to it, since the `/u/` page route expects an encoded URL.

**Errors**
- `400 missing_required_field` / `400 invalid_email` / `400 invalid_site_url`
- `429 rate_limited` — 5 submissions/hour/IP

If `managed_interest: true`, a parallel lead record is filed in the `lead:` prefix for `/managed` follow-up.

### `GET /badge/<slug>.svg`

Embeddable SVG badge for verified directory listings.

**Variants**
- `/badge/<slug>.svg` — full pill (232×44, "Agent-ready Verified · wmcp.sh")
- `/badge/<slug>-mini.svg` — compact square (44×44)

**Verified vs indexed**: gated by `KEYS.get("verified:<slug>") === "1"`. If verified: gradient pill / shield. Otherwise: neutral "Indexed" style. SVG content type, cached `max-age=600, s-maxage=3600`.

### `GET /verify/<slug>`

HTML page with copy-paste HTML/Markdown/JSX embed snippets for the badge. `noindex,follow`. See [wmcp.sh/verify/&lt;your-slug&gt;](https://wmcp.sh/verify/your-slug).

## MCP proxy

### `ALL /mcp/<provider>` and `ALL /mcp/<provider>/*`

OAuth-bearer-injecting MCP proxy for known providers. The agent points its MCP client at `https://wmcp.sh/mcp/<provider>` (e.g. `/mcp/stripe`, `/mcp/slack`, `/mcp/notion`). The worker:

1. Resolves the authenticated user from `Authorization: Bearer <wmcp-api-key>`
2. Loads the user's stored OAuth token for that provider from KV (`oauth:<user>:<provider>`)
3. Decrypts it in memory (AES-GCM-256, `TOKEN_ENC_KEY`)
4. Substitutes the token into the upstream request as `Authorization: Bearer <provider-token>`
5. Attempts refresh for an expired token when a refresh token is available

The agent context never sees the raw provider token.

The published proxy list is determined by `mcpProxy` and `mcpUrl` in `worker/src/providers.ts`; provider connection and subscription requirements vary.

### `GET /mcp`

Returns the published proxy catalog as JSON, or an HTML catalog for browsers that request HTML. It does not report the current user's connections; use `/api/v1/me/connections` for those.

### URL-based MCP server

`POST /mcp/u/<base64url-encoded-url>` serves one URL; `POST /mcp/url?url=<url>&url=<url>` composes URLs; and `POST /mcp/set/<id>` serves a saved toolset. They use stateless JSON-RPC over HTTP. `initialize` and `tools/list` work anonymously subject to quota; `tools/call` requires an eligible paid plan. GET on these three MCP endpoints returns 405, not a server-initiated SSE stream. See [Quickstart](QUICKSTART.md) for configuration.

## Keys + auth

### `POST /api/v1/keys`

Admin endpoint to issue a key. `x-admin-token: $ADMIN_TOKEN`.

**Body**
```json
{ "user_id": "user_xyz", "plan": "pro", "stripe_sub_id": "sub_..." }
```

**Response**
```json
{ "ok": true, "key": "webmcp_live_...", "plan": "pro" }
```

### `POST /api/v1/keys/revoke`

Admin only. `{ "key": "webmcp_live_..." }` → `{ "ok": true }`.

### `GET /api/v1/keys/me`

Returns the calling user's key info (plan, user_id, anonymous status).

### `POST /api/v1/me/keys`

Issue an API key for the currently-signed-in user (via GitHub OAuth at `/dashboard`).

## OAuth

### `GET /api/v1/auth/github/start` + `/callback`

GitHub OAuth for user sign-in to `/dashboard`. Standard flow.

### `GET /api/v1/providers`

List supported providers.

### `GET /api/v1/me/connections`

List the calling user's connected providers + token status.

### `GET /api/v1/providers/<id>/start` + `/callback`

OAuth flow for a specific provider. `<id>` is e.g. `stripe`, `slack`, `notion`.

### `POST /api/v1/providers/<id>/api-key`

For providers that use static API keys instead of OAuth (Stripe sk_live, OpenAI sk-, etc.). Stores the key encrypted.

### `POST /api/v1/providers/<id>/disconnect`

Wipe the stored token / key for a provider.

### `POST /api/v1/providers/anthropic/exchange`

Anthropic-specific OOB PKCE exchange (after user pastes the code from claude.ai).

## Admin (directory monetization)

All require `x-admin-token: $ADMIN_TOKEN`.

| Endpoint | Body | Action |
|---|---|---|
| `POST /api/v1/admin/directory/verify` | `{ slug, featured_rank? }` or `{ site_url, featured_rank? }` | Sets `verified:<slug>=1` |
| `POST /api/v1/admin/directory/unverify` | `{ slug }` or `{ site_url }` | Removes verified + featured |
| `POST /api/v1/admin/directory/feature` | `{ slug, rank }` (0-9999, lower = higher placement) | Sets `featured:<slug>=<rank>` |
| `POST /api/v1/admin/directory/unfeature` | `{ slug }` | Removes featured |
| `GET /api/v1/admin/directory/submissions?limit=&cursor=` | — | Lists submissions, newest first |
| `GET /api/v1/admin/directory/state` | — | Dumps the current verified + featured sets |

The UI for these lives at [/dashboard/submissions](https://wmcp.sh/dashboard/submissions) (token-gated client-side, paste into the form).

## Stripe

| Endpoint | Purpose |
|---|---|
| `POST /api/v1/stripe/webhook` | Stripe webhook receiver |
| `POST /api/v1/stripe/checkout` | Create a Checkout session for a configured paid API plan |
| `GET /api/v1/keys/by-checkout?session_id=` | Recover key after successful checkout |
| `POST /api/v1/keys/recover` | Email-based key recovery |

## Stats

### `GET /api/v1/stats/public`

Public counter — total URLs cached. Used by the landing page.

```json
{ "cached_urls": 12847, "graded_servers": 1000 }
```

### `GET /api/v1/health`

Health check.

```json
{ "ok": true, "version": "0.1.0", "env": "production" }
```

## Discovery files

| Path | Content-Type | Cache | Purpose |
|---|---|---|---|
| `/sitemap.xml` | `application/xml` | 1h | Every public URL on wmcp.sh |
| `/robots.txt` | `text/plain` | 1h | AI-crawler allowlist + Disallow list |
| `/llms.txt` | `text/markdown` | 1h | llmstxt.org navigation index |
| `/llms-full.txt` | `text/markdown` | 15min | Full reading material (every blog post body) as one document |
| `/og.png`, `/og.svg` | `image/*` | 1d | OpenGraph image (1200×630) |
| `/blog/rss.xml` | `application/rss+xml` | 10min | RSS 2.0 feed for the blog |

## Rate limits

The `gate` middleware tracks daily read, execute, and push quotas by plan, resetting at 00:00 UTC. Anonymous callers use the free plan keyed by IP. The checked-in limits are defined in `PLAN_LIMITS` in `worker/src/auth.ts`; other endpoints may impose separate limits. Provider-proxy free calls can also be configured with `PROXY_FREE_CALLS_PER_DAY`.
