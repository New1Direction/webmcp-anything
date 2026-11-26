# Self-hosting WMCP

The Worker runs on Cloudflare Workers with three KV bindings and the static assets in `worker/public`. This guide covers a separate deployment; it does not modify the hosted wmcp.sh service.

## Run locally

From the repository root:

```sh
cd worker
npm install
npm run dev
```

Wrangler serves the Worker locally, normally at `http://localhost:8787`, with local KV storage. In a second terminal:

```sh
curl -sS http://localhost:8787/api/v1/health
curl -sS 'http://localhost:8787/api/v1/tools?url=https://petstore3.swagger.io/api/v3/openapi.json'
```

The second request fetches an external URL. The checked-in `wrangler.toml` sets `ENVIRONMENT` to `production`; to exercise development-only behavior such as the local dev API key, override it explicitly for the local process or use a separate development configuration. Put local secrets in the ignored `worker/.dev.vars` file, not in source control. See [Cloudflare's local environment-variable guide](https://developers.cloudflare.com/workers/local-development/environment-variables/).

## Configure a separate Cloudflare deployment

1. Authenticate Wrangler for your Cloudflare account and choose a distinct Worker name.
2. **Replace the checked-in namespace IDs.** The repository's `worker/wrangler.toml` is configured for the original deployment. Create your own `CACHE`, `KEYS`, and `USAGE` namespaces, including preview namespaces if you use them. Never deploy a fork with another environment's IDs.

   ```sh
   cd worker
   npx wrangler kv namespace create CACHE
   npx wrangler kv namespace create KEYS
   npx wrangler kv namespace create USAGE
   ```

   Put the returned IDs in the matching `[[kv_namespaces]]` entries. See [Cloudflare's KV setup](https://developers.cloudflare.com/kv/get-started/).
3. Review `[vars]`, `[assets]`, and `[triggers]` in `wrangler.toml`. In particular, decide whether the scheduled jobs and `PROXY_FREE_CALLS_PER_DAY` are appropriate for your deployment. The scheduler is implemented in `worker/src/index.ts` and `worker/src/scheduled.ts`.
4. Configure secrets for the features you enable using `npx wrangler secret put <NAME>`. Admin operations use `ADMIN_TOKEN`; the provider-token vault needs `TOKEN_ENC_KEY`; the LLM fallback can use `ANTHROPIC_API_KEY`; and OAuth providers need their own client credentials. The relevant binding types and feature modules under `worker/src/` define additional settings.
5. Run `npm run verify`, then deploy with `npx wrangler deploy` when ready. Configure your own hostname through Cloudflare if needed.

The old `worker/deploy.sh` assumes placeholder namespace IDs, whereas the checked-in configuration contains populated IDs. Do not rely on that script to create or replace the bindings for a fork.

**Keep a secure backup of `TOKEN_ENC_KEY`.** Changing or losing it makes existing encrypted provider tokens unreadable; plan token migration and rotation before changing it. Treat each environment's KV bindings and secrets as separate.

## Optional integrations

- **GitHub sign-in:** register a GitHub OAuth app for your own deployment with callback `https://<your-host>/api/v1/auth/github/callback`, then configure `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`. Other providers have their own requirements in `worker/src/providers.ts` and the provider OAuth modules.
- **Stripe:** use an isolated test account first. API-plan checkout uses `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `STRIPE_PRICE_TO_PLAN`, which maps Stripe price IDs to `builder`, `pro`, or `reseller`. Other products have separate price settings; consult `worker/src/stripe.ts` and [release acceptance](RELEASE_ACCEPTANCE.md). Configure the webhook for the events used by the features you enable. Production rejects unsigned webhooks.
- **Extension:** load the extension as described in [extension/README.md](../extension/README.md), and configure its Worker endpoint if using a fork.

Review the application before exposing your deployment: published copy, links, limits, provider settings, webhook configuration, and access policies may need to be changed for your use. A self-hosted deployment does not automatically become a private network gateway.

## Customize adapters

From the repository root:

```sh
cp adapters/_template/adapter.js adapters/yoursite.js
node adapters/_test/run.mjs
```

Implement and register the adapter according to [CONTRIBUTING.md](../CONTRIBUTING.md) and [the adapter contract](../adapters/CONTRACT.md). Keep the shared adapter files compatible with the Worker and extension runtimes.
