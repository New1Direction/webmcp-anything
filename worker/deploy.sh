#!/usr/bin/env bash
# One-command deploy for WebMCP Anything.
# Idempotent — safe to re-run after any step fails.

set -euo pipefail
cd "$(dirname "$0")"

WRANGLER="./node_modules/.bin/wrangler"
TOML="wrangler.toml"

if [ ! -x "$WRANGLER" ]; then
  echo "Installing dependencies first..."
  npm install --no-audit --no-fund --silent
fi

echo ""
echo "🔐 Step 1 / 4 — Cloudflare auth"
echo "──────────────────────────────────"
if ! $WRANGLER whoami 2>/dev/null | grep -q "@"; then
  echo "Opening browser for Cloudflare login..."
  $WRANGLER login
else
  echo "✓ already logged in as $($WRANGLER whoami | grep -oE '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' | head -1)"
fi

create_kv() {
  local binding="$1"        # CACHE, KEYS, USAGE
  local mode="$2"           # "" for prod, "--preview" for preview
  local placeholder="$3"    # exact string to substitute in wrangler.toml

  if ! grep -q "$placeholder" "$TOML"; then
    echo "  ✓ $binding $mode already configured"
    return
  fi
  echo "  Creating KV namespace: $binding $mode"
  local out
  out=$($WRANGLER kv namespace create "$binding" $mode 2>&1) || { echo "$out"; exit 1; }
  local id
  id=$(echo "$out" | grep -oE '(id|preview_id)\s*=\s*"[^"]+"' | head -1 | sed -E 's/.*"([^"]+)"$/\1/')
  if [ -z "$id" ]; then
    echo "❌ Could not parse id from wrangler output:"
    echo "$out"
    exit 1
  fi
  echo "  → $placeholder = $id"
  sed -i '' "s|$placeholder|$id|g" "$TOML"
}

echo ""
echo "🗄️  Step 2 / 4 — KV namespaces"
echo "──────────────────────────────────"
create_kv "CACHE"  ""           "__CACHE_ID__"
create_kv "CACHE"  "--preview"  "__CACHE_PREVIEW_ID__"
create_kv "KEYS"   ""           "__KEYS_ID__"
create_kv "KEYS"   "--preview"  "__KEYS_PREVIEW_ID__"
create_kv "USAGE"  ""           "__USAGE_ID__"
create_kv "USAGE"  "--preview"  "__USAGE_PREVIEW_ID__"

echo ""
echo "🔑 Step 3 / 4 — Secrets"
echo "──────────────────────────────────"
if [ -z "${STRIPE_WEBHOOK_SECRET:-}" ]; then
  echo "  ⚠ STRIPE_WEBHOOK_SECRET not set in env — skipping (Stripe webhook will accept unsigned events)"
else
  echo "$STRIPE_WEBHOOK_SECRET" | $WRANGLER secret put STRIPE_WEBHOOK_SECRET
fi
if [ -z "${STRIPE_PRICE_TO_PLAN:-}" ]; then
  echo "  ⚠ STRIPE_PRICE_TO_PLAN not set — defaulting all paid subs to 'pro'"
else
  echo "$STRIPE_PRICE_TO_PLAN" | $WRANGLER secret put STRIPE_PRICE_TO_PLAN
fi
if [ -z "${ADMIN_TOKEN:-}" ]; then
  echo "  ⚠ ADMIN_TOKEN not set — admin /api/v1/keys endpoint will require manual config"
else
  echo "$ADMIN_TOKEN" | $WRANGLER secret put ADMIN_TOKEN
fi

echo ""
echo "🚀 Step 4 / 4 — Deploy"
echo "──────────────────────────────────"
$WRANGLER deploy

echo ""
echo "✅ Done. Your worker is live."
echo ""
echo "Test it:"
echo "  curl https://webmcp-anything.<your-handle>.workers.dev/api/v1/health"
echo ""
echo "Next steps:"
echo "  1. Add a custom domain in Cloudflare dashboard (wmcp.sh)"
echo "  2. Point the Chrome extension settings at the deployed URL"
echo "  3. Set STRIPE_WEBHOOK_SECRET if you have a Stripe account (see CLOUDFLARE_SETUP.md)"
