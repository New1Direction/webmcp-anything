#!/usr/bin/env bash
# Ready-to-run queue command for wmcp.sh coverage agent.
# 1. Export the real ADMIN_TOKEN (from wrangler secret or your store, same as for seed-stores).
# 2. Run this (or the python script for full harvest+loop).

set -euo pipefail

BATCH_FILE="/Users/alexhearts/webmcp-anything/launch/wmcp_submit_200.json"
if [ ! -f "$BATCH_FILE" ]; then
  echo "Batch file missing. Re-run the harvest."
  exit 1
fi

if [ -z "${ADMIN_TOKEN:-}" ]; then
  echo "ERROR: export ADMIN_TOKEN=... first (prod secret value)"
  echo "Example: export ADMIN_TOKEN=... (get from your wrangler secrets or operator store)"
  exit 1
fi

echo "Queuing $(jq length "$BATCH_FILE") URLs from $BATCH_FILE ..."

curl -sS -X POST https://wmcp.sh/api/v1/admin/grade-servers \
  -H "x-admin-token: $ADMIN_TOKEN" \
  -H "content-type: application/json" \
  -d "{\"urls\": $(cat "$BATCH_FILE")}" | jq .

echo "Done. Check https://wmcp.sh/api/v1/stats/public and the leaderboard after cron."
