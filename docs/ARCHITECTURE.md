# Architecture

How wmcp.sh extracts MCP tools from any URL at sub-50ms edge latency.

## TL;DR

```
                  ┌──────────────────────────────────────────┐
   Agent request  │ GET wmcp.sh/api/v1/tools?url=<URL>       │
        │        │                                          │
        ▼        │  ┌────────────────────────────────────┐  │
 ┌────────────┐  │  │  Cache layer (KV, 60s–24h TTL)     │  │
 │  Hono on   │──┤  └────────────────────────────────────┘  │
 │ CF Worker  │  │   ↓  miss                                │
 │  router    │  │  ┌────────────────────────────────────┐  │
 └─────┬──────┘  │  │  Adapter chain (5 tiers, ordered)  │  │
       │         │  │   1. Shopify                       │  │
       │  auth   │  │   2. JSON-LD                       │  │
       │  hook   │  │   3. OpenAPI compiler              │  │
       ▼         │  │   4. Provider (Stripe/GH/Slack…)   │  │
 ┌────────────┐  │  │   5. LLM-fallback (Haiku, cached)  │  │
 │ Token vault│  │  └────────────────────────────────────┘  │
 │ (KV+AES)   │  │   ↓                                      │
 └────────────┘  │  ┌────────────────────────────────────┐  │
                 │  │  MCP tool array (Claude/OpenAI/MCP │  │
                 │  │  shape — interchangeable)          │  │
                 │  └────────────────────────────────────┘  │
                 └──────────────────────────────────────────┘
```

Runtime: a single Cloudflare Worker, ~1.2 MB compressed, deployed at the edge of every CF POP. Cold start ~16ms. All state in KV (3 namespaces — see below).

---

## The 5-tier adapter chain

The chain is **ordered**. Each adapter's `detect(ctx)` runs synchronously; the first to return a non-null detection context wins, and `extract(ctx)` runs to produce tools.

### Tier 1: Shopify

`adapters/shopify.js` — detects the `Shopify` object in HTML, the `/products/<slug>.js` URL pattern, or a `meta name="generator" content="Shopify"`. Calls `<origin>/products/<slug>.js` to get structured product JSON. Emits `get_price`, `list_variants`, `get_inventory`, and (write) `add_to_cart` tools.

Coverage: ~4M live Shopify storefronts. Latency: <50ms on cache hit, ~150ms cold (one fetch).

### Tier 2: JSON-LD

`adapters/jsonld.js` — parses every `<script type="application/ld+json">` block in the HTML, looks for `@type: Product` / `@type: SoftwareApplication` / `@type: Article` shapes. Maps schema.org property names to MCP tool inputs.

Coverage: any site with schema.org structured data (most CMS-driven retailers, news sites, recipe sites, app store listings). Latency: <50ms cached.

### Tier 3: OpenAPI compiler

`adapters/openapi.js` — detects URLs that look like OpenAPI specs (`openapi.json`, `swagger.json`, `*.yaml` with `swagger:` or `openapi:` root key, or `Content-Type: application/openapi+json`). Compiles every operation in the spec to an MCP tool. Path params become tool input params; security schemes flow into the auth handshake.

Coverage: any public API with an OpenAPI 3.x or Swagger 2.0 spec. Tested with Stripe, GitHub, Linear, Discord, Anthropic, OpenAI, Slack.

### Tier 4: Provider

`worker/src/providers.ts` — a known-providers table for major SaaS that doesn't ship an OpenAPI spec or whose spec is too large to compile naively. Currently includes Slack, Notion, Google Workspace, Discord, Stripe (which DOES have OpenAPI but we curate the agent-relevant subset), Anthropic, Linear, Airtable.

Each provider has hand-tuned tools + an OAuth flow.

### Tier 5: LLM-fallback

`adapters/llm.js` — when no structured-data tier matches, calls Claude 3.5 Haiku with the page HTML and a tool-extraction prompt. Returns best-effort tools. Result is cached aggressively (24h TTL) because the LLM call is the expensive path.

Used for sites with no JSON-LD, no OpenAPI, no recognized provider — typically older retailer sites, SPA-rendered content, or custom CMSs.

---

## KV namespaces

```toml
# worker/wrangler.toml
[[kv_namespaces]]
binding = "CACHE"   # adapter outputs + sitemap state + tools caches
binding = "KEYS"    # OAuth tokens + API keys + verified/featured directory state
binding = "USAGE"   # rate-limit counters + per-user usage stats
```

| Namespace | Key pattern | Value | TTL |
|---|---|---|---|
| `CACHE` | `seen:<normalized-url>` | (metadata only) URL + adapter + ts + title | none |
| `CACHE` | `tools:<normalized-url>` | full JSON tool array | 60s–24h |
| `CACHE` | `stats:total_cached` | running counter | none |
| `KEYS` | `verified:<slug>` | `"1"` | none |
| `KEYS` | `featured:<slug>` | rank string | none |
| `KEYS` | `dirsub:<reverse-ts>:<rand>` | submission record | 1 yr |
| `KEYS` | `lead:<reverse-ts>:<rand>` | /managed lead record | 1 yr |
| `KEYS` | `oauth:<user>:<provider>` | AES-GCM-256 encrypted token | until refresh |
| `KEYS` | `key:<id>` | API key + plan + user_id | none |
| `USAGE` | `rl:<key>:<minute>` | per-minute call count | 60s |
| `USAGE` | `dirsubrl:<ip>:<hour>` | submission rate-limit | 1h |

Reverse-ts pattern (`(Number.MAX_SAFE_INTEGER - now).padStart(16, "0")`) makes `KV.list({prefix})` return newest-first naturally — no extra sort.

---

## OAuth vault

```
                       Agent
                         │
                         │  POST /mcp/stripe  { _action: "list_invoices" }
                         ▼
              ┌──────────────────────┐
              │  wmcp.sh edge worker │
              └──────────┬───────────┘
                         │
                  ┌──────┴───────┐
                  │  resolve API key from Authorization header
                  │  → load user_id
                  └──────┬───────┘
                         │
                  ┌──────┴───────┐
                  │  KEYS.get("oauth:<user>:stripe")
                  │  → decrypt with TOKEN_ENC_KEY (AES-GCM-256)
                  │  → check expiry; refresh if needed
                  └──────┬───────┘
                         │
                         │  Authorization: Bearer <decrypted token>
                         ▼
                   api.stripe.com
```

The agent's MCP context **never sees** the bearer token. Tokens are stored encrypted in KV (`TOKEN_ENC_KEY` is a wrangler secret, 32 bytes, AES-GCM); decrypted in memory only inside the worker's outbound fetch handler; never logged.

Refresh tokens follow the same pattern — when a request to a provider returns 401, the worker exchanges the refresh token, re-encrypts, and retries the original request transparently.

OAuth flow: standard 2.1 with PKCE for interactive providers (Google, GitHub, Slack, Notion, Linear, Discord), static keys for non-interactive providers (Anthropic, OpenAI, Stripe API keys). User connects once at `/dashboard`; every subsequent agent call uses the stored token.

---

## SEO + indexability surfaces

wmcp.sh is itself an agent-readable site. Every URL ships:

- Server-rendered HTML (CF Worker, not JS hydration — Googlebot indexes immediately)
- `<script type="application/ld+json">` Article + FAQPage schema where applicable
- og:title / og:description / og:image / twitter:card
- `<link rel="canonical">`
- 15-min CDN cache + 15-min edge cache (`s-maxage=900, max-age=900`)

Special routes:
- `/sitemap.xml` — dynamic, includes the static SEO pages + the directory's `/u/<base64url-encoded-url>` long tail
- `/llms.txt` — curated AI-agent navigation index (llmstxt.org convention)
- `/llms-full.txt` — full corpus (every blog post body) concatenated as one markdown doc for LLM context-window ingestion
- `/robots.txt` — explicit allow-list for AI crawlers (Claude-Web, GPTBot, PerplexityBot, etc.)

---

## Routing

`worker/src/index.ts` defines all routes via Hono. Each handler lazy-imports its page module so cold start stays under 20ms.

Top-level surfaces:

| Path | What |
|---|---|
| `/api/v1/tools` | The canonical URL→tools endpoint |
| `/api/v1/directory` | List the indexed URLs (paginated) |
| `/api/v1/directory/submit` | POST a new submission |
| `/api/v1/admin/directory/*` | Verify/feature/list (admin token gated) |
| `/mcp/<provider>` | OAuth-bearer-injecting MCP proxy |
| `/u/<base64url-url>` | Per-URL SEO landing page |
| `/blog`, `/blog/<slug>`, `/blog/rss.xml` | Long-form content |
| `/directory`, `/directory/submit` | Public directory UI |
| `/badge/<slug>.svg` | Embeddable verified badge |
| `/verify/<slug>` | Copy-paste embed snippet page for site owners |
| `/dashboard`, `/dashboard/submissions` | Authed UI (signed-in users + admin) |
| `/agent-ready[/*]`, `/managed`, `/vs/*`, `/alternatives/*`, `/integration/*`, `/use-case/*`, `/mcp-server/*`, `/for/*`, `/how-to/*`, `/glossary/*`, `/roundup/*` | Long-tail SEO landing pages (99 surfaces as of 2026-05-28) |

---

## Local dev

```bash
cd worker
npm install
npx wrangler dev
# wmcp.sh running on http://localhost:8787
```

KV namespaces: wrangler creates local SQLite-backed mocks automatically. Set `ADMIN_TOKEN=devadmin` in `.dev.vars` if you want to hit admin endpoints locally.

---

## Deployment

```bash
cd worker
./node_modules/.bin/wrangler deploy
```

CF builds the worker bundle (~1.2 MB compressed), uploads it, and rotates traffic — typical full-deploy is ~5 seconds. Static assets in `worker/public/` (IndexNow key, demo MP4s, OG image) ship in the same upload via the `[assets]` binding.

Secrets are stored in CF, not the repo:

```bash
./node_modules/.bin/wrangler secret list
# ADMIN_TOKEN, TOKEN_ENC_KEY, STRIPE_*, GITHUB_*, GOOGLE_*, etc.
```

Schedule (`0 */2 * * *`) runs the cron handler in `worker/src/cron.ts` to re-seed the directory + refresh stale tool caches.

---

## Where to read more

- [docs/QUICKSTART.md](./QUICKSTART.md) — 5-min integration
- [docs/API.md](./API.md) — every endpoint + request/response shape
- [docs/SELF_HOSTING.md](./SELF_HOSTING.md) — fork-and-deploy your own
- [adapters/CONTRACT.md](../adapters/CONTRACT.md) — write a new adapter
- [AGENTS.md](../AGENTS.md) — repo conventions for AI coding agents
- [wmcp.sh/blog](https://wmcp.sh/blog) — long-form posts on individual design decisions
