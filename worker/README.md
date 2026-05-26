# WebMCP Anything — Worker

Hosted Cloudflare Worker that exposes the same adapters as the Chrome extension over a public HTTP API.

## Endpoints

| Method | Path | Body / Query | Purpose |
|---|---|---|---|
| GET  | `/`                       | —                          | Interactive landing demo |
| GET  | `/api/v1/health`          | —                          | Health check |
| GET  | `/api/v1/tools`           | `?url=<product-url>&fresh=1` | Get WebMCP tool schema for any URL |
| POST | `/api/v1/tools/execute`   | `{ url, tool, args? }`     | Execute a tool (Shopify live, JSON-LD snapshot) |
| POST | `/api/v1/cache`           | `{ url, payload }`         | Extension pushes pre-extracted schemas |

## Local dev

```bash
cd worker
npm install
npm run dev          # spins up localhost:8787 with in-memory KV
```

Then visit `http://localhost:8787/` for the demo, or:

```bash
# Live Shopify
curl 'http://localhost:8787/api/v1/tools?url=https://www.allbirds.com/products/mens-wool-runners' | jq

# JSON-LD on an unprotected retailer
curl 'http://localhost:8787/api/v1/tools?url=https://www.bestbuy.com/site/sony-wh1000xm5/6505728.p' | jq

# Execute a live Shopify tool
curl -X POST http://localhost:8787/api/v1/tools/execute \
  -H 'content-type: application/json' \
  -d '{"url":"https://www.allbirds.com/products/mens-wool-runners","tool":"get_price"}' | jq
```

## Deploy

1. `npx wrangler login`
2. Create the KV namespace:
   ```bash
   npx wrangler kv:namespace create CACHE
   npx wrangler kv:namespace create CACHE --preview
   ```
3. Paste the returned IDs into `wrangler.toml` (`id` and `preview_id`).
4. `npm run deploy`

The worker will be live at `https://webmcp-anything.<your-subdomain>.workers.dev`. Add a custom domain (e.g. `wmcp.sh`) via the Cloudflare dashboard.

## Architecture

```
GET /api/v1/tools?url=...
       │
       ▼
   ┌─────────────┐
   │  KV cache   │  60s for live, 7d for pushed
   └──────┬──────┘
          │ miss
          ▼
   ┌─────────────────┐
   │ Shopify adapter │  if URL matches /products/{handle}
   └──────┬──────────┘
          │ no match / failed
          ▼
   ┌────────────────────┐
   │ fetchAndParse(url) │  HTMLRewriter extracts JSON-LD + meta
   └──────┬─────────────┘
          ▼
   ┌──────────────────┐
   │ jsonld adapter   │  parses Product schema → WebMCP tools
   └──────────────────┘
```

## Notes & limits

- Cloudflare egress IPs are often blocked by Akamai/Imperva. For sites like Pokemon Center, BestBuy, Nike, etc., the server-side fetch may fail with 403/406. That's the failure mode for which we have the Chrome extension push path (`POST /api/v1/cache`).
- The `JSON-LD` adapter returns **snapshots** — no live re-execution for non-Shopify sites yet.
- No auth on `/api/v1/cache` in v0. Add a shared secret before public deploy.
- No rate limiting yet — rely on Cloudflare's free tier defaults (10 req/s/IP) and add per-key limits when billing arrives.
