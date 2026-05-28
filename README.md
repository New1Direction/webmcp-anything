# wmcp.sh — turn any URL into agent-callable MCP tools

[![Live](https://img.shields.io/badge/live-wmcp.sh-7c5cff)](https://wmcp.sh)
[![MIT License](https://img.shields.io/badge/license-MIT-4ade80)](./LICENSE)
[![MCP](https://img.shields.io/badge/MCP-compatible-00e5ff)](https://modelcontextprotocol.io)

A hosted Cloudflare Worker that extracts agent-callable MCP tools from any URL: Shopify product pages, OpenAPI specs, JSON-LD-tagged pages, or anything in between. Free public tier; verified directory listings + custom adapters via [/managed](https://wmcp.sh/managed).

```bash
curl 'https://wmcp.sh/api/v1/tools?url=https://www.allbirds.com/products/mens-wool-runners'
```

Returns a JSON tool list in the [Claude `tool_use`](https://docs.anthropic.com/en/docs/build-with-claude/tool-use) / OpenAI `function_call` / MCP shape — `get_price`, `add_to_cart`, `list_variants` — that any agent can invoke.

**Live now:** [wmcp.sh](https://wmcp.sh) · [Directory](https://wmcp.sh/directory) · [Blog](https://wmcp.sh/blog) · [`/llms.txt`](https://wmcp.sh/llms.txt)

---

## Why it exists

LLM agents are great at producing tokens. They're bad at acting on the actual web — every framework reinvents per-site scrapers, and `Agent → Allbirds add-to-cart` is still a multi-day project nobody wants to repeat.

[MCP](https://modelcontextprotocol.io) (the Anthropic protocol) and [WebMCP](https://developer.chrome.com/docs/ai/webmcp) (the Chrome standard) solve the plumbing. They don't solve the per-site adapter problem.

**wmcp.sh is the open layer that does.** A 5-tier adapter chain turns most URLs into tools without any per-site work; the rest get an LLM-fallback that produces best-effort tools and caches the result.

---

## The 5-tier adapter chain

```
┌─────────────────────────────────────────────────┐
│  URL in →                                       │
│    1. Shopify       (~4M storefronts, <50ms)    │
│    2. JSON-LD       (schema.org Product, etc.)  │
│    3. OpenAPI       (any spec → compiled tools) │
│    4. Provider      (Stripe, GitHub, Slack…)    │
│    5. LLM-fallback  (Claude 3.5 Haiku, cached)  │
│  → MCP tools out                                │
└─────────────────────────────────────────────────┘
```

Cached on Cloudflare KV. Sub-50ms on cache hit. See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

---

## Quick start

### 1. Use the hosted API (no setup)

```bash
# any URL → MCP tools
curl 'https://wmcp.sh/api/v1/tools?url=<your-url>'

# OpenAPI spec → MCP tools
curl 'https://wmcp.sh/api/v1/tools?url=https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.json'

# directory listing of every URL the community has indexed
curl 'https://wmcp.sh/api/v1/directory?limit=10'
```

### 2. Use it from Claude Desktop / Cursor / Codex (native MCP)

wmcp.sh is a real MCP server (JSON-RPC 2.0 over Streamable HTTP). Point any MCP client at a **per-URL** endpoint — `/mcp/u/<base64url-of-your-url>` — and it exposes that page's extracted tools natively (`tools/list` + `tools/call`):

```json
{
  "mcpServers": {
    "allbirds": {
      "type": "http",
      "url": "https://wmcp.sh/mcp/u/aHR0cHM6Ly93d3cuYWxsYmlyZHMuY29tL3Byb2R1Y3RzL21lbnMtd29vbC1ydW5uZXJz"
    }
  }
}
```

That base64url string decodes to `https://www.allbirds.com/products/mens-wool-runners`. Encode your own:

```bash
node -e "process.stdout.write(Buffer.from('https://your-url.example').toString('base64url'))"
```

**Compose multiple sites into one MCP server** — repeat the `url` param; tool names are namespaced per host (`site_a__add_to_cart`):

```json
{ "mcpServers": { "wmcp": { "type": "http", "url": "https://wmcp.sh/mcp/url?url=https://site-a.example&url=https://site-b.example" } } }
```

`tools/list` (discovery) is free; `tools/call` (live execution) needs a paid key, passed as a header:

```json
{ "mcpServers": { "wmcp": { "type": "http", "url": "https://wmcp.sh/mcp/u/<base64url>", "headers": { "Authorization": "Bearer webmcp_live_…" } } } }
```

`type` may be `"http"` or `"streamable-http"` (same transport). For Claude Desktop builds without remote-MCP support, bridge with `npx mcp-remote <url>`.

Or proxy a specific OAuth-protected provider (upstream auth handled by the wmcp.sh credential vault):

```json
{
  "mcpServers": {
    "stripe-via-wmcp": {
      "type": "http",
      "url": "https://wmcp.sh/mcp/stripe"
    }
  }
}
```

Full step-by-step at [`/how-to/install-claude-desktop-mcp`](https://wmcp.sh/how-to/install-claude-desktop-mcp).

### 3. Submit your site to the directory (free)

[wmcp.sh/directory/submit](https://wmcp.sh/directory/submit) — basic listing, embeddable badge available via [/managed](https://wmcp.sh/managed).

---

## What's in the repo

```
.
├── adapters/                Shared adapter library (worker + extension import the same files)
│   ├── shopify.js           ~4M storefronts, read + add_to_cart
│   ├── jsonld.js            generic schema.org Product
│   ├── openapi.js           any OpenAPI 3.x / Swagger 2.0 → tools
│   ├── llm.js               Claude 3.5 Haiku fallback
│   ├── CONTRACT.md          the detect() / extract() / actions interface
│   ├── _template/           starter scaffold for new adapters
│   ├── _fixtures/           captured pages for offline tests
│   └── _test/run.mjs        node:test harness, zero deps
│
├── worker/                  Hosted API at wmcp.sh
│   ├── src/                 Hono routes, OAuth, billing, SEO pages, token vault
│   ├── wrangler.toml        CF Worker config + KV bindings
│   └── public/              Static assets (demo videos, IndexNow key)
│
├── extension/               Chrome MV3 extension (cache-back path for SPA / auth-walled sites)
│
├── sdks/
│   ├── python/wmcp/         pip install wmcp
│   └── javascript/src/      @wmcp/sdk
│
├── docs/
│   ├── QUICKSTART.md        5-min integration
│   ├── ARCHITECTURE.md      5-tier adapter chain, OAuth vault, KV layout
│   ├── API.md               every endpoint, request/response shapes
│   └── SELF_HOSTING.md      fork-and-deploy your own wmcp.sh
│
├── launch/                  Launch artifacts (HN draft, registry submissions, demo videos)
│   └── registry/SUBMISSION_PLAYBOOK.md   18-step registry rollout
│
├── scripts/seed_directory.py  Pre-cache URLs to populate /u/* SEO pages
│
├── README.md                you are here
├── AGENTS.md                rules for AI coding agents working on this repo
├── CONTRIBUTING.md          how to send a PR
├── ADAPTERS_WANTED.md       open targets, ranked by difficulty
└── LICENSE                  MIT
```

---

## Two delivery paths

| Path | When | How |
|---|---|---|
| **Hosted API** ([`worker/`](./worker)) | Site is publicly fetchable (most Shopify, most retailers with JSON-LD, most public OpenAPI specs) | One HTTPS call, no install |
| **Chrome extension** ([`extension/`](./extension)) | Site blocks bot fetches (Akamai/Incapsula) or hydrates client-side from authed APIs | Runs in your browser, pushes cached schemas back to the hosted API for everyone |

Both paths import from the same [`adapters/`](./adapters) directory.

---

## Pricing

| Tier | Cost | What you get |
|---|---|---|
| **Public API** | Free with rate limits | `/api/v1/tools?url=...` open to anyone, IP-rate-limited |
| **Pro** (self-serve at [/dashboard](https://wmcp.sh/dashboard)) | $999/mo | Higher rate limits, OAuth-vault for personal tokens, priority cache, stored tool extractions |
| **Managed** ([/managed](https://wmcp.sh/managed)) | From $499 one-time setup | Custom adapter built for your site + verified directory badge + featured listing + white-label MCP at `mcp.yourbrand.com` |
| **Enterprise** | From $4,999+/mo | Self-hosted deployment + SLA + dedicated support |

---

## Contributing

We accept new adapters via PR. Read [CONTRIBUTING.md](./CONTRIBUTING.md) and the [adapter contract](./adapters/CONTRACT.md). Open issues for targets in [ADAPTERS_WANTED.md](./ADAPTERS_WANTED.md).

If you're an AI coding agent working on this repo, read [AGENTS.md](./AGENTS.md) first.

```bash
git clone https://github.com/New1Direction/webmcp-anything
cd webmcp-anything
cp -r adapters/_template adapters/mysite
# edit adapters/mysite/adapter.js — implement detect() + extract()
node adapters/_test/run.mjs
```

---

## Featured pages

- **For developers:** [/agent-ready/api](https://wmcp.sh/agent-ready/api) · [/agent-ready/docs](https://wmcp.sh/agent-ready/docs) · [/agent-ready/saas](https://wmcp.sh/agent-ready/saas)
- **Vertical guides:** [/for/healthcare](https://wmcp.sh/for/healthcare) · [/for/fintech](https://wmcp.sh/for/fintech) · [/for/legal](https://wmcp.sh/for/legal) · [/for/real-estate](https://wmcp.sh/for/real-estate) · [/for/media](https://wmcp.sh/for/media) · [/for/marketing](https://wmcp.sh/for/marketing) · [/for/hr](https://wmcp.sh/for/hr)
- **How-to tutorials:** [/how-to/install-claude-desktop-mcp](https://wmcp.sh/how-to/install-claude-desktop-mcp) · [/how-to/expose-shopify-as-mcp](https://wmcp.sh/how-to/expose-shopify-as-mcp) · [/how-to/build-stripe-mcp-agent](https://wmcp.sh/how-to/build-stripe-mcp-agent) · [/how-to/secure-mcp-oauth](https://wmcp.sh/how-to/secure-mcp-oauth)
- **Glossary:** [/glossary/mcp](https://wmcp.sh/glossary/mcp) · [/glossary/tool-use](https://wmcp.sh/glossary/tool-use) · [/glossary/function-calling](https://wmcp.sh/glossary/function-calling) · [/glossary/oauth-pkce](https://wmcp.sh/glossary/oauth-pkce)
- **Framework integrations:** [/integration/nextjs](https://wmcp.sh/integration/nextjs) · [/integration/django](https://wmcp.sh/integration/django) · [/integration/fastapi](https://wmcp.sh/integration/fastapi) · [/integration/laravel](https://wmcp.sh/integration/laravel) · [/integration/spring-boot](https://wmcp.sh/integration/spring-boot) · [/integration/hono](https://wmcp.sh/integration/hono)
- **Tool-specific MCP servers:** [/mcp-server/postgres](https://wmcp.sh/mcp-server/postgres) · [/mcp-server/redis](https://wmcp.sh/mcp-server/redis) · [/mcp-server/snowflake](https://wmcp.sh/mcp-server/snowflake) · [/mcp-server/cloudflare](https://wmcp.sh/mcp-server/cloudflare) · [/mcp-server/vercel](https://wmcp.sh/mcp-server/vercel)
- **Comparisons:** [/vs/composio](https://wmcp.sh/vs/composio) · [/vs/zapier](https://wmcp.sh/vs/zapier) · [/vs/langchain-tools](https://wmcp.sh/vs/langchain-tools) · [/vs/anthropic-skills](https://wmcp.sh/vs/anthropic-skills) · [/vs/mcp-toolkit](https://wmcp.sh/vs/mcp-toolkit)
- **Roundups:** [/roundup/mcp-servers-2026](https://wmcp.sh/roundup/mcp-servers-2026) · [/roundup/agent-frameworks](https://wmcp.sh/roundup/agent-frameworks) · [/roundup/oauth-providers-mcp](https://wmcp.sh/roundup/oauth-providers-mcp)
- **Long-form:** [/blog](https://wmcp.sh/blog) (24 engineering posts) · [/llms-full.txt](https://wmcp.sh/llms-full.txt) (full corpus, ~190KB)

**99 SEO surfaces total.** Site map: [/sitemap.xml](https://wmcp.sh/sitemap.xml). AI-readable index: [/llms.txt](https://wmcp.sh/llms.txt) + [/llms-full.txt](https://wmcp.sh/llms-full.txt).

---

## License

MIT. See [LICENSE](./LICENSE).

---

## Status

- ✅ Production at wmcp.sh (Cloudflare Workers + KV)
- ✅ 5 oracle / price-data adapters (CoinGecko, DefiLlama, DexScreener, Pyth, Chainlink)
- ✅ OAuth proxy for 8+ providers (Google, GitHub, Slack, Notion, Linear, Discord, Stripe, Anthropic)
- ✅ Directory monetization (submit, badge, verified/featured, admin inbox)
- ✅ 99 SEO pages live (8 verticals, 8 how-tos, 6 glossary entries, 12 framework integrations, 8 tool-specific MCP servers, 7 vs/alternatives competitor pages, 3 roundups, 24 blog posts, /llms.txt + /llms-full.txt)
- 🟡 Stripe billing wired but not yet self-serve in dashboard
- 🟡 Registry submissions in progress — see [`launch/registry/SUBMISSION_PLAYBOOK.md`](./launch/registry/SUBMISSION_PLAYBOOK.md)

Found a bug? [Open an issue](https://github.com/New1Direction/webmcp-anything/issues). Have a site we should support? [ADAPTERS_WANTED.md](./ADAPTERS_WANTED.md).
