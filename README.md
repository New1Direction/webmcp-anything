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

### 2. Use it from Claude Desktop / Cursor / Codex

Add to your client's MCP config:

```json
{
  "mcpServers": {
    "wmcp": {
      "type": "streamable-http",
      "url": "https://wmcp.sh/api/v1/tools"
    }
  }
}
```

Or use a specific provider (auth handled by the wmcp.sh credential vault):

```json
{
  "mcpServers": {
    "stripe-via-wmcp": {
      "type": "streamable-http",
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
- **Vertical guides:** [/for/healthcare](https://wmcp.sh/for/healthcare) · [/for/fintech](https://wmcp.sh/for/fintech) · [/for/marketing](https://wmcp.sh/for/marketing)
- **Comparisons:** [/vs/composio](https://wmcp.sh/vs/composio) · [/vs/zapier](https://wmcp.sh/vs/zapier) · [/vs/langchain-tools](https://wmcp.sh/vs/langchain-tools) · [/vs/anthropic-skills](https://wmcp.sh/vs/anthropic-skills)
- **Roundups:** [/roundup/mcp-servers-2026](https://wmcp.sh/roundup/mcp-servers-2026) · [/roundup/agent-frameworks](https://wmcp.sh/roundup/agent-frameworks)
- **Long-form:** [/blog](https://wmcp.sh/blog) (24 engineering posts) · [/llms-full.txt](https://wmcp.sh/llms-full.txt) (full corpus, ~190KB)

74 SEO surfaces total. Site map: [/sitemap.xml](https://wmcp.sh/sitemap.xml). AI-readable index: [/llms.txt](https://wmcp.sh/llms.txt).

---

## License

MIT. See [LICENSE](./LICENSE).

---

## Status

- ✅ Production at wmcp.sh (Cloudflare Workers + KV)
- ✅ 5 oracle / price-data adapters (CoinGecko, DefiLlama, DexScreener, Pyth, Chainlink)
- ✅ OAuth proxy for 8+ providers (Google, GitHub, Slack, Notion, Linear, Discord, Stripe, Anthropic)
- ✅ Directory monetization (submit, badge, verified/featured, admin inbox)
- ✅ 74 SEO pages live
- 🟡 Stripe billing wired but not yet self-serve in dashboard
- 🟡 Registry submissions in progress — see [`launch/registry/SUBMISSION_PLAYBOOK.md`](./launch/registry/SUBMISSION_PLAYBOOK.md)

Found a bug? [Open an issue](https://github.com/New1Direction/webmcp-anything/issues). Have a site we should support? [ADAPTERS_WANTED.md](./ADAPTERS_WANTED.md).
