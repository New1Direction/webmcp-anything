# Self-hosting wmcp.sh

Fork the repo and run your own instance on Cloudflare Workers — either as your team's private MCP gateway, or as a fully-branded fork. Both worker code (TypeScript) and adapters (ES modules) are MIT-licensed.

This guide assumes you've already got a Cloudflare account and `wrangler` CLI logged in.

## 1. Fork + clone

```bash
gh repo fork New1Direction/webmcp-anything --clone
cd webmcp-anything/worker
npm install
```

## 2. Create your KV namespaces

```bash
./node_modules/.bin/wrangler kv:namespace create CACHE
./node_modules/.bin/wrangler kv:namespace create KEYS
./node_modules/.bin/wrangler kv:namespace create USAGE
```

Each command prints the new namespace ID. Update `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "CACHE"
id = "<your-CACHE-id>"

[[kv_namespaces]]
binding = "KEYS"
id = "<your-KEYS-id>"

[[kv_namespaces]]
binding = "USAGE"
id = "<your-USAGE-id>"
```

## 3. Set secrets

```bash
# Required
echo "<random 64-hex>" | ./node_modules/.bin/wrangler secret put ADMIN_TOKEN
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" | ./node_modules/.bin/wrangler secret put TOKEN_ENC_KEY

# OAuth providers you want to support
echo "<gh-client-id>"     | ./node_modules/.bin/wrangler secret put GITHUB_CLIENT_ID
echo "<gh-client-secret>" | ./node_modules/.bin/wrangler secret put GITHUB_CLIENT_SECRET
# ...repeat for GOOGLE_*, SLACK_*, NOTION_*, LINEAR_*, DISCORD_*, STRIPE_*, ANTHROPIC_API_KEY (for the LLM-fallback adapter), etc.
```

The full secret list lives in `worker/src/env.d.ts`.

⚠️ **If you lose `TOKEN_ENC_KEY`, every stored OAuth token in KV becomes unreadable.** Treat it like a database backup key — store in 1Password or your KMS.

## 4. Optional: set your own domain

```bash
./node_modules/.bin/wrangler deploy
# By default this deploys to <worker-name>.<account>.workers.dev

# Then add a custom domain (Cloudflare dashboard):
#   Workers & Pages → your worker → Settings → Triggers → Custom Domains → Add Custom Domain
#   Enter: yourbrand.com
```

Cloudflare provisions the cert + DNS automatically. Custom Domain is preferred over Worker Route — Routes don't auto-provision certs and have gotchas with caching.

## 5. Customize branding

The brand identity is intentionally light-touch — change these to make it yours:

| File | What |
|---|---|
| `worker/src/landing.ts` | Homepage hero, copy, CTAs |
| `worker/src/og.ts` | OG image SVG generator |
| `worker/public/og.png` | Static fallback OG image (1200×630) |
| `worker/src/blog.ts` `BRAND_CSS` | Blog brand colors (default: dark purple/cyan) |
| `worker/src/u.ts` `llmsTxt()` | /llms.txt navigation copy |

CSS variable names are consistent across pages — change one set and it propagates:

```css
:root {
  --bg:      #07070d;
  --card:    #16161f;
  --bg2:     #11111c;
  --border:  #26263a;
  --text:    #ececf5;
  --muted:   #8a8aa8;
  --accent:  #7c5cff;  /* primary brand */
  --accent2: #00e5ff;  /* secondary brand */
}
```

## 6. Optional: customize adapters

The `adapters/` directory is the shared adapter library — same files run in both the worker and the Chrome extension. To add an adapter for a site we don't yet support:

```bash
cp -r adapters/_template adapters/yoursite
# edit adapters/yoursite/adapter.js — implement detect() + extract()
node adapters/_test/run.mjs
```

See [`adapters/CONTRACT.md`](../adapters/CONTRACT.md) for the interface.

## 7. Deploy

```bash
./node_modules/.bin/wrangler deploy
```

A typical full-deploy is ~5 seconds — CF builds, uploads (~1.2 MB compressed), and rotates traffic.

To deploy in stages, use `--env staging` (you'll need a `[env.staging]` section in wrangler.toml).

## 8. Cron

The default `wrangler.toml` ships with `cron: 0 */2 * * *` — re-seeds the directory + refreshes stale tool caches every 2 hours. The handler is at `worker/src/cron.ts`. You can change the schedule or remove the cron block entirely.

## 9. Optional: GitHub OAuth for /dashboard sign-in

If you want users to sign in to your fork via GitHub:

1. https://github.com/settings/developers → New OAuth App
2. Homepage URL: `https://yourbrand.com`
3. Authorization callback URL: `https://yourbrand.com/api/v1/auth/github/callback`
4. Copy Client ID + secret into wrangler secrets (`GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`)

Repeat the same pattern for each provider in `worker/src/providers.ts`.

## 10. Optional: Stripe billing

If you want self-serve Pro/Enterprise billing:

1. Stripe dashboard → create products + prices ($999/mo Pro, $4,999/mo Enterprise — or your own pricing)
2. Add Price IDs to `worker/src/stripe.ts`
3. Create a webhook endpoint pointing at `https://yourbrand.com/api/v1/stripe/webhook`
4. Set secrets: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_ENTERPRISE`

## What you get for free

- Sub-50ms edge response anywhere in the world (CF's ~300 POPs)
- KV-backed caching with no extra cost for the first 100K reads/day
- Auto SSL + DDoS via CF
- 1.2 MB worker bundle ships in <2s deploys
- 5-tier adapter chain works out of the box for ~4M+ Shopify storefronts + every site with JSON-LD or OpenAPI

## What you have to bring

- An Anthropic API key (`ANTHROPIC_API_KEY` secret) if you want the LLM-fallback adapter active
- OAuth app credentials per provider (the worker won't proxy a provider without its client_id + secret)
- A domain (optional but recommended — *.workers.dev URLs look weird in MCP configs)

## What you should NOT change without thinking

- `TOKEN_ENC_KEY` after launch — every stored OAuth token in KV becomes unreadable
- The KV key prefix patterns in `worker/src/directory_capture.ts` / `directory_admin.ts` — `dirsub:`, `lead:`, `verified:`, `featured:` are load-bearing across the admin endpoints
- The reverse-ts sort pattern — switching to forward-ts breaks the newest-first guarantee on `KV.list({prefix})`

---

Questions? Open an issue at [github.com/New1Direction/webmcp-anything/issues](https://github.com/New1Direction/webmcp-anything/issues) or check the original deployment at [wmcp.sh](https://wmcp.sh).
