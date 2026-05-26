# Deployment Guide

Everything below is the **human-only** parts — account creation, login flows, domain setup. The code is ready.

---

## TL;DR — three commands

```bash
cd worker
./deploy.sh        # walks you through login + KV creation + deploy
```

That's it for a worker.dev URL. Custom domain + Stripe are optional steps below.

---

## Step 1 — Cloudflare account (~2 min)

1. Go to https://dash.cloudflare.com/sign-up — free tier is enough
2. No credit card required for Workers (free plan: 100k requests/day)
3. That's it. `./deploy.sh` will run `wrangler login` which pops a browser window to authorize

You get a free `*.workers.dev` subdomain automatically:
```
https://webmcp-anything.<your-handle>.workers.dev
```

---

## Step 2 — Custom domain (optional, ~10 min)

If you want `wmcp.sh` instead of `webmcp-anything.your-handle.workers.dev`:

### A) Buy the domain
- `wmcp.sh` on [Cloudflare Registrar](https://dash.cloudflare.com/?to=/:account/registrar) — at-cost pricing (~$50/yr for `.sh`)
- Or any registrar; you'll transfer DNS to Cloudflare

### B) Add it as a zone
1. Cloudflare dashboard → Add a Site → `wmcp.sh`
2. Free plan is fine
3. Update nameservers at your registrar to point to Cloudflare's

### C) Bind the worker to the domain
After your zone is active:
```bash
cd worker
./node_modules/.bin/wrangler triggers deploy
# then in dashboard: Workers & Pages → webmcp-anything → Settings → Triggers
# Add custom domain → wmcp.sh
```

Or add `routes` to `wrangler.toml`:
```toml
routes = [
  { pattern = "wmcp.sh/*", custom_domain = true },
  { pattern = "www.wmcp.sh/*", custom_domain = true }
]
```

---

## Step 3 — Stripe (optional, ~15 min)

Required only if you want real subscription billing. Without this the worker still works on the free tier + your dev/admin keys.

### A) Create a Stripe account
- https://dashboard.stripe.com/register
- Activate it (real bank details required for live payments — use test mode while developing)

### B) Create products + prices
- Stripe dashboard → Products → + Add product
- Create: **WebMCP Pro $29/mo** and **WebMCP Reseller $99/mo**
- Note each Price ID (format: `price_1ABCdef...`)

### C) Configure the webhook
- Stripe dashboard → Developers → Webhooks → + Add endpoint
- Endpoint URL: `https://wmcp.sh/api/v1/stripe/webhook`
- Events to send:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- Reveal the **Signing secret** (starts with `whsec_`)

### D) Set the secrets
```bash
cd worker
echo 'whsec_your_real_secret' | ./node_modules/.bin/wrangler secret put STRIPE_WEBHOOK_SECRET
echo '{"price_1ABC":"pro","price_1XYZ":"reseller"}' | ./node_modules/.bin/wrangler secret put STRIPE_PRICE_TO_PLAN
echo 'a-strong-random-string' | ./node_modules/.bin/wrangler secret put ADMIN_TOKEN
```

### E) Replace placeholders in the dashboard
- Edit `src/dashboard.ts` and change `REPLACE_PRO_LINK` / `REPLACE_RESELLER_LINK` to your Stripe Payment Links (or use Stripe Checkout sessions)
- Redeploy: `./deploy.sh`

### F) Test mode
Use Stripe's test mode + the [test card 4242 4242 4242 4242](https://docs.stripe.com/testing) to verify the flow without real charges. Stripe sends test webhooks to your endpoint — watch your Stripe dashboard's webhook log for delivery success.

---

## Step 4 — Point the extension at your deployment

1. Right-click the WebMCP Anything extension icon → **Options**
2. Set **Worker API endpoint** to `https://wmcp.sh` (or your workers.dev URL)
3. Optionally enable **Share extracted schemas** to grow the cache
4. Paste your API key (get one from `/dashboard`)
5. Save

---

## Verifying after deploy

```bash
# 1. Health
curl https://wmcp.sh/api/v1/health
# {"ok":true,"version":"0.1.0","env":"production"}

# 2. Free anonymous request
curl 'https://wmcp.sh/api/v1/tools?url=https://www.allbirds.com/products/mens-wool-runners' | jq

# 3. With API key (gets pro plan limits)
curl -H 'authorization: Bearer YOUR_KEY' \
  'https://wmcp.sh/api/v1/tools?url=https://www.allbirds.com/products/mens-wool-runners' | jq

# 4. Live execute (requires paid plan)
curl -X POST -H 'authorization: Bearer YOUR_KEY' \
  -H 'content-type: application/json' \
  -d '{"url":"https://www.allbirds.com/products/mens-wool-runners","tool":"get_price"}' \
  https://wmcp.sh/api/v1/tools/execute | jq
```

---

## Rollback

If a deploy breaks something:
```bash
./node_modules/.bin/wrangler rollback
```
Lists previous deployments — pick one to revert to. Zero downtime.

---

## Cost estimate (real numbers)

| Item | Free tier | When you'd exceed |
|---|---|---|
| Cloudflare Workers | 100k req/day | ~10k DAU |
| KV reads | 100k/day | ~10k DAU |
| KV writes | 1k/day | Once you have real user growth — bump to $5/mo Workers Paid plan |
| Domain (wmcp.sh) | — | ~$50/yr |
| Stripe | — | 2.9% + $0.30 per charge |

For v0, you'll run inside free tier indefinitely.
