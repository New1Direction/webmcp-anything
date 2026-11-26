# Architecture

WMCP combines a Cloudflare Worker, a shared adapter library, a browser extension, and SDKs. The Worker exposes both a REST API and a URL-based MCP server. The browser-native WebMCP integration is a separate, local execution surface; see [Browser WebMCP integration](BROWSER_WEBMCP.md).

## URL extraction

`worker/src/engine.ts` is the shared extraction and execution core for REST and URL-based MCP. A request to `GET /api/v1/tools?url=...` passes through the read quota gate, then `resolveTools` tries:

1. A `v1:<normalized-url>` cache entry, unless `fresh=1` is requested.
2. The Shopify adapter, using the product URL and storefront product JSON.
3. The OpenAPI adapter for recognized specification URLs.
4. Crypto/data adapters: CoinGecko, DexScreener, Pyth, DeFiLlama, and Chainlink.
5. HTML metadata and JSON-LD extraction.
6. The LLM fallback, if an appropriate connected credential or worker key is available.

A detected adapter may fail extraction; the engine can then fall through to the next path. The provider-connection catalog and OAuth proxy are separate from this extraction chain. The extraction response contains `adapter`, `tools`, and `from`, with optional `product`, `variants`, and `cached_at`. Tool declarations can contain static `result` values or `action` descriptors. See [API reference](API.md).

## Cache and state

The Worker uses the `CACHE`, `KEYS`, and `USAGE` KV bindings defined in `worker/wrangler.toml`.

- `CACHE` stores the extraction payload under `v1:<normalized-url>`, and maintains `seen:<normalized-url>` directory metadata. Adapter storage TTLs range from 60 seconds to 30 days. The extraction read path currently checks a maximum age of 60 seconds, independent of the stored TTL. Extension-submitted payloads are stored for seven days.
- `KEYS` stores account, session, API-key, directory, billing, and encrypted provider-token records.
- `USAGE` stores quota counters and related operational state.

KV is eventually consistent. Do not treat its counters or sequential deduplication as strict transactional or exactly-once guarantees.

## REST and MCP

`worker/src/index.ts` routes HTTP requests. REST `GET /api/v1/tools` and `POST /api/v1/tools/execute` call the shared engine. The read and execute gates in `worker/src/auth.ts` enforce plan quotas; REST execution requires a plan that permits it.

`worker/src/mcp_server.ts` serves JSON-RPC over stateless HTTP at `/mcp/u/<encoded>`, `/mcp/url`, and `/mcp/set/<id>`. It supports anonymous discovery subject to read quota and gates `tools/call` by execution plan. The URL-based server responds to POST; GET returns 405 and no server-initiated SSE stream is provided. The separate `/mcp/:provider` routes proxy supported upstream MCP services with account, connection, and policy checks.

## Credentials and browser integration

Provider tokens are encrypted before storage using the token vault in `worker/src/token_vault.ts`. The vault derives its key from `TOKEN_ENC_KEY`; losing or changing that secret makes existing encrypted records unreadable. Provider-specific connection and refresh behavior is implemented in the OAuth and proxy modules rather than the extraction adapters.

The extension uses the shared adapters and can discover site-owned `document.modelContext` tools in a compatible browser. It automatically runs on the retail hosts listed in its manifest and offers explicit activation on another HTTP(S) tab. Native browser tool calls remain local to the tab and extension; they do not automatically become remotely executable through the URL-based MCP server. See [extension setup](../extension/README.md) and [Browser WebMCP integration](BROWSER_WEBMCP.md).

## Local development and deployment

From the repository root:

```sh
cd worker
npm install
npm run dev
```

Wrangler uses local KV bindings for development. The checked-in configuration includes namespace IDs and production-oriented values; before deploying a fork, create and configure your own namespaces and secrets. The scheduled entry point is in `worker/src/index.ts`, with scheduled jobs in `worker/src/scheduled.ts`. See [Self-hosting](SELF_HOSTING.md) for setup and [Contributing](../CONTRIBUTING.md) for tests.

## Related documentation

- [Quickstart](QUICKSTART.md) and [API reference](API.md)
- [Adapter contract](../adapters/CONTRACT.md)
- [MCP Doctor](MCP_DOCTOR.md) and [WebMCP Doctor](WEBMCP_DOCTOR.md)
- [Self-hosting](SELF_HOSTING.md)
