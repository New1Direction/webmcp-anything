# adapters/

Adapters are the heart of WebMCP Anything. Each adapter knows how to look at a URL (and optionally its HTML/structured data) and produce a list of agent-callable tools.

The same files in this directory are used in two places:

- **Hosted worker** (`worker/`) — calls `detect()` then `extract()` server-side.
- **Chrome extension** (`extension/`) — calls the same functions in the page context for sites that can't be fetched server-side (bot protection, SPAs that hydrate from authed APIs, etc.).

If your adapter works in both contexts, the worker can serve every user instantly. If it only works in the extension, users with the extension installed push the cached schema back so the worker can serve it to everyone else.

## What's here today

| File | What it does | Coverage |
|---|---|---|
| `shopify.js` | Detects `/products/<slug>` URLs, fetches the public `.json`, extracts variants + adds a live `add_to_cart` action. | ~4M stores |
| `jsonld.js` | Parses `schema.org` `Product` JSON-LD blocks from any HTML page. | Most non-Shopify e-commerce, plus news/review sites |

## Want to add one?

Read **[../CONTRIBUTING.md](../CONTRIBUTING.md)** for the PR process and **[CONTRACT.md](./CONTRACT.md)** for the exact interface. Then copy `_template/` and start.

A good list of sites we'd love coverage for is in **[../ADAPTERS_WANTED.md](../ADAPTERS_WANTED.md)**.

## Files in this directory

```
adapters/
├── shopify.js       canonical Shopify adapter
├── jsonld.js        generic schema.org / JSON-LD adapter
├── CONTRACT.md      the detect()/extract() interface
├── _template/       copy this to start a new adapter
├── _fixtures/       captured pages used by the test harness
└── _test/           the test harness (Node, no deps)
```
