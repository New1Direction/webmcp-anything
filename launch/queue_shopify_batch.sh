#!/bin/bash
# Queue a Shopify seed batch to wmcp.sh
# Usage: ADMIN_TOKEN=xxx ./launch/queue_shopify_batch.sh [path/to/hosts.json]
set -euo pipefail
ADMIN_TOKEN=${ADMIN_TOKEN:-}
BATCH=${1:-/Users/alexhearts/webmcp-anything/launch/shopify_good_hosts.json}
if [ -z "$ADMIN_TOKEN" ]; then
  echo "ERROR: export ADMIN_TOKEN=... first (same secret as for grade-servers)"
  exit 1
fi
if [ ! -f "$BATCH" ]; then
  echo "ERROR: batch file not found: $BATCH"
  exit 1
fi
echo "Queuing $(jq 'length' "$BATCH") hosts from $BATCH ..."
curl -sS -X POST https://wmcp.sh/api/v1/admin/seed-stores \
  -H "x-admin-token: $ADMIN_TOKEN" -H "content-type: application/json" \
  -d "{\"stores\": $(cat "$BATCH")}" | jq .
