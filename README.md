# WebMCP Anything

Turn any URL into agent-callable tools. A hosted API ([wmcp.sh](https://wmcp.sh)) plus a Chrome extension, sharing one library of open-source adapters.

```bash
curl 'https://wmcp.sh/api/v1/tools?url=https://www.allbirds.com/products/mens-wool-runners'
```

Returns a [WebMCP](https://developer.chrome.com/docs/ai/webmcp)-shaped tool list any AI agent can call — `get_price`, `add_to_cart`, `list_variants`, etc. Works today for Shopify (~4M stores) and any site with schema.org `Product` JSON-LD.

## Why this exists

LLM agents are great at producing tokens. They're bad at acting on the actual web — every framework reinvents per-site scrapers, and `Agent → Allbirds add-to-cart` is still a multi-day project nobody wants to repeat. WebMCP (the Chrome standard) + MCP (the Anthropic protocol) solve the plumbing. They don't solve the per-site adapter problem.

This repo is the open layer that does. Hosted, cached, contributable.

## Two delivery paths

| Path | When | How |
|---|---|---|
| **Hosted API** ([`worker/`](./worker)) | Site is publicly fetchable (most Shopify, most retailers with JSON-LD) | One HTTPS call, no install |
| **Chrome extension** ([`extension/`](./extension)) | Site blocks bot fetches (Akamai/Incapsula) or hydrates client-side from auth'd APIs | Runs in your browser, pushes cached schemas back to the API for everyone |

Both paths import from the same [`adapters/`](./adapters) directory.

## Contributing a new adapter

Adapters are plain ES modules. Three exports, no dependencies:

```js
export const ID = "mysite";
export function detect(ctx) { /* return null OR { ...context } */ }
export async function extract(ctx) { /* return { tools, product, variants } */ }
```

Quick start:
1. `cp -r adapters/_template adapters/mysite` and rename `adapter.js`
2. Implement `detect()` + `extract()` (see [`adapters/CONTRACT.md`](./adapters/CONTRACT.md))
3. Add a test in `adapters/_test/run.mjs`
4. Run `node adapters/_test/run.mjs` — should pass
5. Open a PR

Full guide: [CONTRIBUTING.md](./CONTRIBUTING.md). Sites we'd love covered: [ADAPTERS_WANTED.md](./ADAPTERS_WANTED.md).

## Running locally

```bash
# the hosted worker
cd worker
npm install
npm run dev      # localhost:8787 with in-memory KV

# the chrome extension
# chrome://extensions → Developer mode on → Load unpacked → select extension/
```

## Architecture

```
                 ┌──────────────────────────┐
                 │  adapters/  (this repo)  │
                 │  shopify.js  jsonld.js   │
                 └────────────┬─────────────┘
                              │ import
              ┌───────────────┴────────────────┐
              ▼                                ▼
     ┌─────────────────┐              ┌─────────────────┐
     │  worker/        │              │  extension/     │
     │  Cloudflare     │              │  Chrome (MV3)   │
     │  Workers + KV   │   push       │  service worker │
     │                 │ ◀────────────┤   + content     │
     │  wmcp.sh        │  cache       │   scripts       │
     └─────────────────┘              └─────────────────┘
              │                                ▲
              │ HTTP                           │ navigator.modelContext
              ▼                                ▼
     ┌─────────────────┐              ┌─────────────────┐
     │  Any AI agent   │              │  In-page agent  │
     │  (Claude,       │              │  (Chrome built- │
     │   LangChain,    │              │   in WebMCP)    │
     │   custom)       │              │                 │
     └─────────────────┘              └─────────────────┘
```

## Roadmap

Shipped:
- [x] Shopify adapter (live `add_to_cart`)
- [x] Generic JSON-LD adapter
- [x] Hosted worker at wmcp.sh
- [x] Chrome extension + cache-back
- [x] Public directory at [wmcp.sh/directory](https://wmcp.sh/directory)
- [x] Stripe billing + API keys

Next:
- [ ] WooCommerce, BigCommerce adapters
- [ ] OpenAPI → tools generator
- [ ] LLM fallback adapter (Claude Haiku reads page → schema)
- [ ] Drop-in SDK for site owners (`<script>` that publishes your own tools)

See [ADAPTERS_WANTED.md](./ADAPTERS_WANTED.md) for the full list.

## License

MIT — see [LICENSE](./LICENSE).
