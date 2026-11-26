# WMCP Worker

The Cloudflare Worker exposes URL-to-tool extraction, an MCP server, provider proxies, and related public pages. REST and URL-based MCP share the extraction and execution core in `src/engine.ts`.

## Local development

```sh
cd worker
npm install
npm run dev
```

The default local address is `http://localhost:8787`. Local KV data is managed by Wrangler. The checked-in configuration sets `ENVIRONMENT = "production"`; explicitly use a development configuration or override to enable development-only behavior.

```sh
curl -sS http://localhost:8787/api/v1/health
curl -sS 'http://localhost:8787/api/v1/tools?url=https://petstore3.swagger.io/api/v3/openapi.json'
```

The tools request fetches the supplied external URL. For execution, the REST gate checks the resolved plan and quota. A development-only `webmcp_dev_local_anything` key exists only when `ENVIRONMENT` is `development`.

## Main interfaces

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/health` | Health response |
| GET | `/api/v1/tools?url=...&fresh=1` | Discover tools; `fresh=1` bypasses the cache read |
| POST | `/api/v1/tools/execute` | Execute `{ url, tool, args? }` under the execute gate |
| POST | `/api/v1/cache` | Store `{ url, payload }` under the push quota gate |
| POST | `/mcp/u/<encoded>` or `/mcp/url?url=...` | Stateless URL-based MCP JSON-RPC |
| ALL | `/mcp/<provider>` | Proxy supported connected providers |

The Worker tries cache, Shopify, OpenAPI, crypto/data adapters, JSON-LD, and the optional LLM fallback in that order. Site fetches can fail or return incomplete data. See [architecture](../docs/ARCHITECTURE.md) and the [API reference](../docs/API.md) for behavior and limits.

## Test and deploy

Run `npm run verify` in `worker/`. Before deploying a fork, replace the configured KV namespace IDs with your own and review the variables and secrets; see [self-hosting](../docs/SELF_HOSTING.md). Do not use the existing `deploy.sh` as automatic namespace provisioning for a fork: it expects placeholders that are no longer present in the checked-in configuration.
