# Anthropic Connectors Directory — submission payload

Form URL: https://claude.com/docs/connectors/building/submission

Paste the following field-by-field. Lines marked `[verify]` need a one-time check before submitting.

---

## Required fields

**Server name**
```
wmcp.sh
```

**Server URL** (Streamable HTTP MCP endpoint)
```
https://wmcp.sh/api/v1/tools
```

**Tagline** (≤80 chars)
```
Turn any URL into agent-callable MCP tools
```

**Description** (155-160 chars, og:description-grade)
```
wmcp.sh extracts MCP tools from any URL (Shopify, OpenAPI, JSON-LD, LLM-fallback). Free public tier; verified directory listings via /managed.
```

**Long description** (~300 words — paste this whole block)
```
wmcp.sh is a hosted MCP gateway that extracts agent-callable tools from any URL at request time. Point it at a Shopify product page, an OpenAPI spec, a JSON-LD-tagged article, or any HTML page — it returns a JSON tool list in the Claude tool_use / OpenAI function_call shape, ready for agents to invoke.

How it works: a 5-tier adapter chain handles different surfaces. Shopify storefronts (~4M live) and JSON-LD-tagged commerce pages resolve in <50ms via structured-data extraction. OpenAPI specs are compiled into MCP tools dynamically — no codegen step. Pages without structured data fall back to a Claude 3.5 Haiku adapter that produces best-effort tools and caches the result.

Auth: for endpoints that require credentials (Stripe, Slack, Notion, GitHub, Google, Discord, etc.), wmcp.sh provides an OAuth 2.1 PKCE proxy. Users connect once via the wmcp.sh dashboard; the worker encrypts and stores tokens, then auto-injects them into requests. Agent context never sees raw credentials.

Surface: 25-tool live catalog (oracle/price data + commerce + dev tools). Public directory at /directory lets users browse every URL the community has turned into MCP tools, with verified-badge listings available via /managed for site owners who want featured placement.

wmcp.sh is open-source (MIT) at github.com/New1Direction/webmcp-anything. The Cloudflare Worker that powers wmcp.sh ships an OAuth-bearer-injecting MCP proxy compatible with any MCP-aware client (Claude Desktop, Claude Code, Cursor, Codex, ChatGPT custom GPT actions).
```

**Categories** (pick all that apply)
- [x] Developer Tools
- [x] E-commerce
- [x] Agent Infrastructure
- [x] APIs & Integrations

**Documentation URL**
```
https://wmcp.sh/agent-ready
```
[verify] Confirm `/agent-ready` covers usage examples + auth flow before submitting.

**Privacy policy URL**
```
https://wmcp.sh/privacy
```
[verify] This page may not exist yet — if 404, create a minimal privacy page before submitting. (See `launch/registry/draft-privacy-policy.md` for a template if needed.)

**Terms of service URL**
```
https://wmcp.sh/terms
```
[verify] Same as above.

**Repository (public)**
```
https://github.com/New1Direction/webmcp-anything
```

**License**
```
MIT
```

---

## Use cases (provide ≥3 — paste below)

**Use case 1 — Agent reads any Shopify storefront**
```
An agent receives "find me running shoes under $200" and invokes wmcp.sh on a Shopify URL. The adapter chain extracts get_product, list_variants, and add_to_cart tools from the storefront in <50ms, no merchant API key required. Used by shopper-side commerce agents.
```

**Use case 2 — Agent calls any API via OpenAPI**
```
An agent needs to file a Linear ticket. It calls wmcp.sh's /api/v1/tools?url=<openapi-spec-url> — the worker compiles the spec into MCP tools at the edge. OAuth handled by the wmcp.sh credential vault, so the agent's context never sees tokens. Tested with GitHub, Stripe, Slack, Linear, Notion, Discord, Airtable, OpenAI, Anthropic.
```

**Use case 3 — Agent reads oracle/price data**
```
A DeFi research agent needs current prices from CoinGecko, DefiLlama, Pyth, Chainlink, and DexScreener. Instead of integrating each separately, the agent calls wmcp.sh's /price-data category — sub-50ms cached, short-TTL for live feeds.
```

---

## Pre-submit checklist (do these before clicking Submit)

- [ ] Every tool returned by `/api/v1/tools` ships a `readOnlyHint:true` (get/list/fetch) or `destructiveHint:true` (write/cart) annotation. **Anthropic's #1 rejection reason.** Verify by curling a sample URL:
  ```bash
  curl 'https://wmcp.sh/api/v1/tools?url=https://www.allbirds.com/products/mens-wool-runners' | jq '.tools[] | {name, readOnlyHint, destructiveHint}'
  ```
- [ ] `/privacy` exists and explains how OAuth tokens are stored
- [ ] `/terms` exists
- [ ] Public repo is, well, public (yes, confirmed)
- [ ] Live API responds to a fresh test from a clean network (avoid cache hits in your verification)
- [ ] If user auth is required for any flow, prepare a test account credential to share with the reviewer in the form's "Reviewer access" field (some forms ask, some don't)

## ETA

Review window: ~2 weeks per Anthropic's published SLA in late 2025. Worth submitting today even if other items aren't perfect — re-submission with fixes is allowed.
