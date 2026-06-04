# Substack post

> SERP-Geometry audited 2026-05-27. Target query family: "Claude Shopify",
> "AI agent shopper", "MCP server shopping", "Claude add to cart".
> Repositioned away from "Claude vs. e-commerce" generic framing (already
> owned by Shopify's official AI Toolkit and Composio) into the shopper-side
> niche nobody else is targeting.

---

## Title (pick one)

1. **Your AI agent can run a Shopify store. It still can't shop at one.** ← recommended
2. The missing half of "Claude + Shopify"
3. Shopper-side MCP: the layer between AI agents and the products they want to buy

## Subtitle / preview text

> Shopify's AI Toolkit gives Claude admin access to your store. Composio
> gives developers a Shopify MCP server. Nobody ships the shopper side —
> so I did.

## Slug

`shopper-side-mcp` (not the title; shorter slugs rank better)

## Body

*Last updated: 2026-05-27 — wmcp.sh v0.1*

---

In April 2026, Shopify quietly open-sourced its [AI Toolkit](https://github.com/Shopify/dev-mcp) — an MCP server that lets Claude, Cursor, and the rest of the agentic-IDE crowd read Shopify's docs, validate GraphQL queries, and run admin operations against *your* store. A month earlier, Composio had already shipped Shopify connectors for Claude Agent SDK, Claude Code, Cursor, VS Code, and a half-dozen other frameworks. Together they did a thorough job of one thing:

**They taught AI agents how to be Shopify store owners.**

What they don't touch — and what every retail-adjacent agent product I've seen ignores — is the other half of e-commerce.

**Nobody taught AI agents how to be Shopify *shoppers*.**

## The asymmetry

Owner-side and shopper-side agents look superficially similar (both call Shopify APIs, both use OAuth-ish auth, both want to do things in carts) but they're different products serving different users:

| | **Owner-side** (Shopify AI Toolkit, Composio) | **Shopper-side** (wmcp.sh) |
|---|---|---|
| User | Merchant managing *one* store | Shopper browsing *many* stores |
| API surface | Admin API + GraphQL | Public storefront + storefront API |
| Auth | Admin token, OAuth | None — public endpoints |
| Stores covered | The one you connected | All 4M+ Shopify stores |
| Use cases | "Create a discount code", "list overdue orders", "update inventory" | "Add Allbirds Wool Runner size 10 to cart", "watch for restock", "find cheapest variant under $90" |
| Built for | Devs, store operators | End users + their agents |

If your agent needs to *operate* a Shopify store, install Shopify's toolkit. If your agent needs to *use* a Shopify store like a customer, you've had no good option — until now.

## The shopper-side problem

I asked Claude:

> *"Watch the Allbirds Wool Runners in size 10. Add them to my cart when the price drops below $90."*

Claude could write a beautiful explanation of how it would do this. It could not actually do it. The same was true for every other agent framework I tried. The Shopify Admin API doesn't help — I don't own Allbirds. The Storefront API would, but every developer who wants this has to wire it up themselves, per store. Every framework reinvents the same scraper. The same `/products/<slug>.json` endpoint gets rediscovered a thousand times a week.

I spent a weekend looking at the problem and noticed something. The "every Shopify store is its own integration" framing is wrong. There are really only **three patterns** under the shopper-side hood:

1. **Shopify storefront** — about 4 million stores. Every single one exposes `/products/<slug>.js` and `/cart/add.js` as plain JSON, no auth needed. If you know the URL, you already know the API.
2. **schema.org JSON-LD** — Best Buy, Walmart, REI, and most non-Shopify e-commerce. They embed structured product data because Google rewards it. Free for any agent to parse.
3. **Everything else** — the long tail of SPAs, bot-protected pages (Amazon, Nike), and weird bespoke stacks. A Chrome extension extracts schemas client-side, in your real browser, where bot protection doesn't fire.

Two adapters plus a fallback. That covers the majority of the consumer web that anyone has ever asked an AI agent to interact with.

## What wmcp.sh does

Hosted MCP server. Paste a product URL, get back agent-callable tools:

```bash
curl 'https://wmcp.sh/api/v1/tools?url=https://www.allbirds.com/products/mens-wool-runners'
```

```json
{
  "adapter": "shopify",
  "product": { "title": "Men's Wool Runner — Natural Grey" },
  "variants": [ { "id": "30674260033616", "size": "10", "price": "$110.00", "available": true } ],
  "tools": [
    { "name": "get_price", "description": "Current price.", "result": "$110.00" },
    { "name": "check_stock", "description": "In-stock by variant.", "action": { "kind": "shopify_stock" } },
    { "name": "add_to_cart", "description": "Add a variant to cart.", "action": { "kind": "shopify_add_to_cart" } }
  ]
}
```

Hand the `tools` array straight to Claude — it's MCP-shaped:

```python
from anthropic import Anthropic
from wmcp import WmcpClient
from wmcp.anthropic import to_anthropic_tools

client = WmcpClient()
url = "https://www.allbirds.com/products/mens-wool-runners"

anthropic = Anthropic()
msg = anthropic.messages.create(
    model="claude-opus-4-7",
    max_tokens=1024,
    tools=to_anthropic_tools(client.tools(url)),
    messages=[{"role": "user", "content": "Add size 10 to my cart."}],
)
```

Works the same in LangChain, OpenAI's tool-call format, Vercel AI SDK, anything that speaks MCP or function-calling. For Shopify, `add_to_cart` is **live** — the worker actually fires the request and your agent gets back a real cart token.

## The flywheel I'm betting on

For sites where a server-side fetch gets blocked by Akamai or Incapsula, there's a Chrome extension. It extracts the schema client-side, in your real browser, then pushes it back to the hosted API. Once cached, the next person who asks `wmcp.sh` for that URL — including a totally different developer running a totally different agent — gets the schema instantly, server-side. No extension required.

**Each install makes the API better for everyone.** Not in a fuzzy "more data = better model" way, but literally: each Chrome install adds N more sites to the shared registry. Today the [directory](https://wmcp.sh/directory) shows what's been indexed. Right now it's growing through an automated cron, ~1,500 new URLs/day. In a month I want it in the tens of thousands. In a year, hundreds of thousands — every URL any AI agent might want to act on, as a customer.

This is what neither Shopify's toolkit nor Composio is positioned to do, structurally. Shopify's toolkit needs admin auth — it doesn't even apply to stores you don't own. Composio is a per-customer integration platform — each user wires up each store. Neither one shares state across users.

## What it can't do (yet)

- **Amazon and Nike.** Bot protection on AWS-routed scrapes is brutal. The extension works because it runs in your real browser. The hosted API doesn't, today.
- **Search across stores.** You can extract tools for a specific product URL but not yet "search Allbirds for runners under $100." Adapter coming.
- **Checkout completion.** We can add to cart. Completing payment requires a session handoff I haven't designed yet.
- **OpenAPI-driven SaaS tools.** Actually — this one works. Point wmcp.sh at any OpenAPI spec and you get tools (Stripe API, Linear API, GitHub API, etc.). Different post, same engine.

## How to try it

Free tier is 100 reads/day, anonymous, no signup. Paid plans unlock live execute and higher quotas — $39 Builder, $99 Pro, $299 for resellers. Get a key at [wmcp.sh/dashboard](https://wmcp.sh/dashboard) or just hit the API:

```bash
curl 'https://wmcp.sh/api/v1/tools?url=<any-product-url>'
```

Python:

```bash
pip install wmcp
```

```python
from wmcp import WmcpClient
client = WmcpClient()
tools = client.tools("https://www.allbirds.com/products/mens-wool-runners")
```

JavaScript / TypeScript:

```bash
npm install @wmcp/sdk
```

```ts
import { WmcpClient } from "@wmcp/sdk";
const client = new WmcpClient();
const tools = await client.tools(url);
```

Adapters are MIT-licensed and accepting PRs at [github.com/New1Direction/webmcp-anything](https://github.com/New1Direction/webmcp-anything). If you want a site supported that isn't, file an issue or send a PR.

## FAQ

**Is this the same as Shopify's AI Toolkit?**
No. Shopify's toolkit gives Claude admin access to *your* store. wmcp.sh gives Claude shopper-side access to *any* store. Different APIs, different auth, different problem.

**Is this the same as Composio's Shopify integration?**
Composio is closer in spirit but still owner-side — it manages per-user Shopify auth and exposes Admin API operations. wmcp.sh requires no auth (public storefront only) and covers non-Shopify sites via the JSON-LD adapter.

**Does it work with Claude Code / Cursor / Cline / Codex?**
Yes — anything that speaks MCP or OpenAI function-calling format works. There's a one-line Python and TypeScript SDK plus framework-specific helpers for Anthropic, OpenAI, LangChain, and Vercel AI SDK.

**What about bot protection?**
Server-side, the worker handles sites that allow public fetches (most Shopify, most JSON-LD retailers). For sites with aggressive bot protection (Amazon, Nike, some SPAs), the Chrome extension extracts schemas in the user's real browser and pushes them back to the cache. Cached schemas are then served server-side instantly.

**How does this make money?**
Free tier covers ~100 reads/day to keep the lights on for hobbyists. Pro ($99/mo) is for individual builders shipping agents with live execute. Reseller ($299/mo) is for B2B usage — agent platforms, shopper-assistant products. Stripe Connect (coming) for marketplace splits.

**Open source?**
The adapter library is MIT. Worker + extension source on GitHub. The hosted service runs on Cloudflare Workers; you can self-host the adapters but the cache + dashboard are wmcp.sh-hosted.

---

The launch thread is on Hacker News this week. If you're building an agent that needs to *use* the consumer web rather than just *operate* one company's store, try it: [wmcp.sh](https://wmcp.sh).

If you've thought about the "shopper-side agent" problem from a different angle, I'd love to compare notes — leave a comment, or DM on Twitter.

*If this resonated, the next post is about the LLM-fallback adapter — what it costs (about $0.005/page) and what kinds of long-tail sites it covers.*

---

## Pre-publish checklist

- [ ] Embed the demo video at the top (above the first H2)
- [ ] Verify Allbirds wool runner price + variant ID are still accurate; refresh if drifted
- [ ] Confirm GitHub repo is flipped public before Substack publishes (otherwise the README link 404s)
- [ ] Cross-link the Hacker News thread once submitted (canonical link)
- [ ] Send draft to 3–5 friends for typo + flow review
- [ ] Schedule for Tue 10am ET (same window as HN post)
- [ ] Add subscribe CTA at the bottom (Substack default is fine)

## SEO meta

- **Slug:** `shopper-side-mcp`
- **Title tag:** `Shopper-Side MCP: Claude Shopping Agents That Actually Work | wmcp.sh` (≤60 chars after pipe)
- **Meta description:** `Shopify's AI Toolkit gives Claude admin access. wmcp.sh gives shopper access to any Shopify store + JSON-LD retailers. Open source.` (~155 chars)
- **Featured image:** demo video thumbnail or 3D cube render
- **Tags:** `AI agents`, `Claude`, `MCP`, `Model Context Protocol`, `Shopify`, `LLM tools`, `Open source`
- **Canonical:** set to Substack URL once published (Substack handles this)

## SERP-Geometry composition notes (delete before publish)

Mandatory entities present (per Phase 2 matrix vs top 10):
- ✓ MCP / Model Context Protocol — defined inline
- ✓ Claude Code / Cursor / Codex mention (multi-framework signal)
- ✓ Shopify storefront vs Admin distinction
- ✓ JSON-LD as the "everything else" pattern
- ✓ Code example (curl + python + js)
- ✓ FAQ block (Anthropic schema-style)
- ✓ "Last updated [date]" freshness
- ✓ MIT/open-source signal
- ✓ Comparison table (owner vs shopper)
- ✓ Explicit Shopify AI Toolkit + Composio competitor naming
- ✓ Internal link to /dashboard + /directory
- ✓ Outbound link to authoritative source (Shopify's GitHub)

Composition fingerprint targets: 1100-1400 words, 6-8 H2s, comparison table,
code blocks, FAQ block, ≥2 outbound links to authoritative sources,
≥2 internal links.

Re-run SERP-Geometry on this post at Day 30 — Shopify's toolkit traction
will have shifted the entity matrix.
