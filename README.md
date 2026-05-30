# wmcp.sh

**Add any website to Claude, Cursor, or Codex as agent-callable MCP tools — in one line of config. No per-server build, no SDK.**

[![Live](https://img.shields.io/badge/live-wmcp.sh-7c5cff)](https://wmcp.sh)
[![MIT License](https://img.shields.io/badge/license-MIT-4ade80)](./LICENSE)
[![MCP compatible](https://img.shields.io/badge/MCP-compatible-00e5ff)](https://modelcontextprotocol.io)
[![TypeScript](https://img.shields.io/badge/built%20with-TypeScript-3178c6)](#whats-in-the-repo)

<p align="center">
  <a href="https://wmcp.sh/demo/hero.mp4">
    <img src="https://wmcp.sh/og.png" alt="wmcp.sh — paste any URL, get agent-callable MCP tools in Claude/Cursor/Codex" width="640" />
  </a>
  <br/>
  <em><a href="https://wmcp.sh/demo/hero.mp4">▶ Watch the 30-sec demo</a> — paste a URL → tools appear → agent calls add_to_cart.</em>
</p>

`wmcp.sh` is a real, spec-compliant **MCP server** (JSON-RPC 2.0 over Streamable HTTP) that turns *any URL* into agent-callable tools — Shopify product pages, OpenAPI specs, JSON-LD pages, OAuth-protected APIs. Every other MCP server is one-per-service and hand-built; wmcp is one endpoint that adapts to whatever URL you point it at. Paste a config line and your agent can read prices, list variants, or call an API on a site that ships no MCP server of its own.

**Live now:** [wmcp.sh](https://wmcp.sh) · [Directory](https://wmcp.sh/directory) · [Blog](https://wmcp.sh/blog) · [`/llms.txt`](https://wmcp.sh/llms.txt)

---

## 30-second quickstart

### Connect any URL to your MCP client (the flagship)

Point any MCP client — **Claude Code, Claude Desktop, Cursor, Codex, Cline, VS Code** — at a per-URL endpoint: `/mcp/u/<base64url-of-your-url>`. That's the whole install. The server exposes that page's extracted tools natively (`tools/list` + `tools/call`):

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

**Compose several sites into one MCP server** — repeat the `url` param; tool names are namespaced per host (`site_a__add_to_cart`):

```json
{ "mcpServers": { "wmcp": { "type": "http", "url": "https://wmcp.sh/mcp/url?url=https://site-a.example&url=https://site-b.example" } } }
```

`tools/list` (discovery) is free. `tools/call` (live execution) needs a paid key, passed as a Bearer header:

```json
{ "mcpServers": { "wmcp": { "type": "http", "url": "https://wmcp.sh/mcp/u/<base64url>", "headers": { "Authorization": "Bearer webmcp_live_…" } } } }
```

`type` may be `"http"` or `"streamable-http"` (same transport). For Claude Desktop builds without remote-MCP support, bridge with `npx mcp-remote <url>`. Full walkthrough: [`/how-to/install-claude-desktop-mcp`](https://wmcp.sh/how-to/install-claude-desktop-mcp).

### Or just hit the REST API (no client, no key for reads)

```bash
# any URL → MCP-shaped tool list
curl 'https://wmcp.sh/api/v1/tools?url=https://www.allbirds.com/products/mens-wool-runners'
```

Returns a JSON tool list in the [Claude `tool_use`](https://docs.anthropic.com/en/docs/build-with-claude/tool-use) / OpenAI `function_call` / MCP shape — `get_price`, `add_to_cart`, `list_variants` — that any agent can invoke.

---

## How it works

A 5-tier extraction chain turns most URLs into tools with zero per-site work. Each tier is tried in order; the first that detects the URL wins. The last tier is an LLM fallback that produces best-effort tools and caches the result.

```
┌──────────────────────────────────────────────────┐
│  URL in →                                          │
│    1. Shopify       (~4M storefronts, <50ms)       │
│    2. JSON-LD       (schema.org Product, etc.)     │
│    3. OpenAPI       (any 3.x / Swagger 2.0 → tools)│
│    4. Provider      (Stripe, GitHub, Slack…)       │
│    5. LLM-fallback  (Claude Haiku, cached 30d)     │
│  → MCP tools out                                   │
└──────────────────────────────────────────────────┘
```

Cached on Cloudflare KV; sub-50ms on a cache hit. Discovery (`tools/list`) is free; live execution (`tools/call`) runs through the same engine and needs a paid key. For sites that block bot fetches or hydrate client-side from authed APIs, a [Chrome extension](#directory--sdks--extension) extracts schemas in your browser and pushes them back to the shared cache. Full design in [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

---

## What makes it different

Today, "an MCP server for X" means someone wrote, built, and deployed a dedicated server for service X. There are hundreds of them, each one a separate repo and a separate install.

wmcp inverts that:

| | Hand-built MCP server | wmcp.sh |
|---|---|---|
| **Coverage** | One service per server | Any URL, one endpoint |
| **Setup** | Clone, build, configure, deploy | Paste one config line |
| **New target** | Write & ship a new server | Encode the URL — done |
| **Auth'd upstreams** | Bake credentials into each server | Shared OAuth/credential vault proxy at `/mcp/<provider>` |
| **Discovery** | Find/trust each repo | Public [directory](https://wmcp.sh/directory) of what's already cached |

There's also a **saved toolset** endpoint — `/mcp/set/<id>` — that bundles a curated set of URLs behind one stable MCP server (a Pro feature). It's genuinely novel: instead of one-per-service, wmcp turns arbitrary URLs into MCP tools on demand.

---

## Directory, SDKs & extension

- **Directory** — every URL the community has indexed, browsable and searchable: [wmcp.sh/directory](https://wmcp.sh/directory). Submit your site (free): [wmcp.sh/directory/submit](https://wmcp.sh/directory/submit).
- **OAuth-vault proxy** — connect an OAuth-protected upstream once; call it as MCP from any client: `https://wmcp.sh/mcp/<provider>` (Google, GitHub, Slack, Notion, Linear, Discord, Stripe, Anthropic).
- **Python SDK** — `pip install wmcp`. Native `fetch`-style client, zero required deps.
- **JavaScript/TypeScript SDK** — `npm install @wmcp/sdk` with one-line adapters for `@wmcp/sdk/anthropic`, `@wmcp/sdk/openai`, `@wmcp/sdk/langchain`, and `@wmcp/sdk/vercel-ai`.

```ts
import { WmcpClient } from "@wmcp/sdk";
import { toAnthropicTools } from "@wmcp/sdk/anthropic";

const client = new WmcpClient(); // anonymous = 100 reads/day per IP
const tools = toAnthropicTools(await client.tools("https://www.allbirds.com/products/mens-wool-runners"));
```

- **Chrome extension** — for SPA / bot-walled / auth-walled sites. Extracts client-side, pushes cached schemas back to the hosted API so the next person gets them instantly — even if they never install it.

---

## Pricing

Two separate ladders. Self-serve API plans for anyone, and a done-for-you service if you want a custom adapter built and run for you.

**Self-serve API** (manage at [/dashboard](https://wmcp.sh/dashboard)):

| Tier | Cost | What you get |
|---|---|---|
| **Free** | $0 | `tools/list` + REST reads, IP-rate-limited, no live execute |
| **Pro** | $29/mo | Higher quotas, live `tools/call` execute, OAuth vault, priority cache |
| **Reseller** | $99/mo | High-volume quotas, email support |

**Done-for-you service** ([/managed](https://wmcp.sh/managed)):

| Tier | Cost | What you get |
|---|---|---|
| **Starter** | $499 one-time | Custom adapter built for your site + verified directory badge |
| **Managed Retainer** | $999/mo | Ongoing maintenance, featured listing, white-label MCP at `mcp.yourbrand.com` |
| **Enterprise** | $4,999+/mo | Self-hosted deployment + SLA + dedicated support |

---

## What's in the repo

```
.
├── adapters/                Shared adapter library (worker + extension import the same files)
│   ├── shopify.js           ~4M storefronts, read + add_to_cart
│   ├── jsonld.js            generic schema.org Product
│   ├── openapi.js           any OpenAPI 3.x / Swagger 2.0 → tools
│   ├── llm.js               Claude Haiku fallback
│   ├── CONTRACT.md          the detect() / extract() / actions interface
│   ├── _template/           starter scaffold for new adapters
│   └── _test/run.mjs        node:test harness, zero deps
│
├── worker/                  Hosted API + MCP server at wmcp.sh
│   └── src/                 Hono routes, mcp_server.ts, OAuth, billing, SEO pages, token vault
│
├── extension/               Chrome MV3 extension (cache-back path)
│
├── sdks/
│   ├── python/wmcp/         pip install wmcp
│   └── javascript/src/      @wmcp/sdk (+ anthropic / openai / langchain / vercel-ai adapters)
│
├── docs/                    QUICKSTART · ARCHITECTURE · API · SELF_HOSTING
├── launch/                  Launch artifacts (HN draft, registry submissions, demo)
├── AGENTS.md                rules for AI coding agents working on this repo
├── CONTRIBUTING.md          how to send a PR
├── ADAPTERS_WANTED.md       open targets, ranked by difficulty
└── LICENSE                  MIT
```

---

## Contributing

New adapters are welcome via PR. The whole point is that adding a site shouldn't mean building a new server.

```bash
git clone https://github.com/New1Direction/webmcp-anything
cd webmcp-anything
cp -r adapters/_template adapters/mysite
# edit adapters/mysite/adapter.js — implement detect() + extract()
node adapters/_test/run.mjs
```

Adapter files are **plain ES modules with zero npm deps** so the same file runs in Cloudflare Workers, Chrome MV3 service workers, and Node 18+. Read [CONTRIBUTING.md](./CONTRIBUTING.md), the [adapter contract](./adapters/CONTRACT.md), and open targets in [ADAPTERS_WANTED.md](./ADAPTERS_WANTED.md). If you're an AI coding agent, read [AGENTS.md](./AGENTS.md) first.

---

## Status

- ✅ Production at [wmcp.sh](https://wmcp.sh) (Cloudflare Workers + KV)
- ✅ Spec-compliant MCP server (JSON-RPC 2.0 over Streamable HTTP) — per-URL, multi-URL, and saved-toolset endpoints
- ✅ 5-tier extraction chain + free REST API (`/api/v1/tools`)
- ✅ OAuth-vault proxy for 8+ providers (Google, GitHub, Slack, Notion, Linear, Discord, Stripe, Anthropic)
- ✅ Public directory (submit, badge, verified/featured)
- ✅ Python (`pip install wmcp`) + JS (`@wmcp/sdk`) SDKs and a Chrome extension
- 🟡 Stripe billing wired; self-serve dashboard upgrade in progress
- 🟡 Registry submissions in progress — see [`launch/registry/SUBMISSION_PLAYBOOK.md`](./launch/registry/SUBMISSION_PLAYBOOK.md)

Found a bug? [Open an issue](https://github.com/New1Direction/webmcp-anything/issues). Have a site we should support? [ADAPTERS_WANTED.md](./ADAPTERS_WANTED.md).

---

## License

MIT. See [LICENSE](./LICENSE). Repo: [github.com/New1Direction/webmcp-anything](https://github.com/New1Direction/webmcp-anything).
