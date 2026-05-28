# API reference

Every public endpoint exposed by wmcp.sh. Base URL: `https://wmcp.sh`.

Routes prefixed `/api/v1/admin/*` require `x-admin-token` header.
Routes prefixed `/mcp/*` and `/api/v1/keys/me` require `Authorization: Bearer <api-key>` from the key issued at `/dashboard`.
All other routes are public.

## Tool extraction

### `GET /api/v1/tools`

Extract MCP tools from any URL.

**Query params**
- `url` (required) — the source URL to extract tools from
- `force_refresh` (optional, default `false`) — bypass the cache layer

**Response (200)**
```json
{
  "source_url": "https://www.allbirds.com/products/mens-wool-runners",
  "adapter": "shopify",
  "cached_at": 1779898000,
  "ttl_remaining_s": 600,
  "tools": [
    {
      "name": "get_price",
      "description": "Get current price for this product.",
      "input_schema": { "type": "object", "properties": {}, "required": [] }
    },
    {
      "name": "add_to_cart",
      "description": "Add this product (default variant) to cart.",
      "input_schema": {
        "type": "object",
        "properties": {
          "variant_id": { "type": "string" },
          "quantity":   { "type": "integer", "minimum": 1 }
        },
        "required": ["variant_id"]
      }
    }
  ],
  "product": {
    "title": "Wool Runner Mizzles",
    "vendor": "Allbirds",
    "variants": [...]
  }
}
```

**Errors**
- `400 invalid_url` — URL fails `new URL(s)` parse
- `403 blocked_host` — host is on the wmcp.sh denylist
- `429 rate_limited` — per-IP or per-key rate limit hit
- `502 upstream_fetch_failed` — origin returned 5xx or timed out
- `503 no_adapter_matched` — none of the 5 tiers produced tools (rare; usually upstream blocking)

**Cache behavior**
- Cache key: `tools:<normalized-url>` in KV (`CACHE` namespace)
- TTL: 60s for live-data adapters (Pyth, oracle feeds), 1h for Shopify, 24h for OpenAPI/LLM extractions
- `Cache-Control: public, max-age=900, s-maxage=900` on the response

### `POST /api/v1/cache`

Push a pre-extracted tool list (used by the Chrome extension to share schemas for auth-walled sites).

**Auth**: `Authorization: Bearer <push-tier-key>`

**Body**
```json
{
  "url": "https://example.com/products/foo",
  "payload": {
    "tools": [...],
    "adapter": "extension-jsonld",
    "product": {...}
  }
}
```

**Response**
```json
{ "ok": true, "key": "tools:example.com/products/foo", "pushed_by": "user_123" }
```

## Directory

### `GET /api/v1/directory`

List indexed URLs, newest-first with featured entries pinned to the top.

**Query params**
- `limit` (optional, default 200, max 500)

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
  "list_complete": false
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
5. Refreshes the token if 401 + retry transparently

The agent context never sees the raw provider token.

**Providers supported (as of 2026-05-28)**
`stripe`, `github`, `google`, `slack`, `notion`, `linear`, `discord`, `anthropic`, `airtable`, `openai`

### `GET /mcp`

List the proxies available for the calling user (which providers they've connected). Gated like the proxy itself.

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
| `POST /api/v1/stripe/checkout` | Create a Checkout session for Pro tier |
| `GET /api/v1/keys/by-checkout?session_id=` | Recover key after successful checkout |
| `POST /api/v1/keys/recover` | Email-based key recovery |

## Stats

### `GET /api/v1/stats/public`

Public counter — total URLs cached. Used by the landing page.

```json
{ "cached_urls": 12847 }
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

Anonymous: 60 req/min per IP on `/api/v1/tools`. Authed: 600 req/min per key on the Pro plan, higher on /managed.

Other endpoints have their own limits — see `worker/src/auth.ts` and per-endpoint `gate(...)` middleware.
