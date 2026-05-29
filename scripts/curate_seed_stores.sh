#!/usr/bin/env bash
# curate_seed_stores.sh — clean up the /directory corpus.
#
# Symptom: the directory was dominated by country-TLD variants of a few brands
# (allbirds.ca/.co.nz/.co.uk/…, 100percentpure.ca/.com/.eu/…). Those came from
# the runtime KV key `seed_stores:list`, which the cron MERGES with the curated
# DEFAULT_STORES in worker/src/scheduled.ts.
#
# Step 1 (safe) resets the runtime list so the cron seeds only the diverse
# DEFAULT_STORES going forward. Steps 2-3 are optional. Run from the repo root.
#
# Requires: wrangler logged in to the production account (aisle9angel@gmail.com).
set -euo pipefail
cd "$(dirname "$0")/../worker"
WR="./node_modules/.bin/wrangler"

echo "→ [1/1] Dropping the polluted seed_stores:list (cron falls back to DEFAULT_STORES)…"
$WR kv key delete --binding=CACHE "seed_stores:list" || true
echo "✓ Done. The 2h cron will now seed the curated, diverse DEFAULT_STORES set."

# ── optional ─────────────────────────────────────────────────────────────────
# (a) Seed immediately instead of waiting for the cron (needs ADMIN_TOKEN):
#       curl -X POST https://wmcp.sh/api/v1/admin/seed-now -H "x-admin-token: $ADMIN_TOKEN"
#
# (b) Remove EXISTING country-TLD entries already cached. They live as permanent
#     `seen:` keys (no TTL), so they won't age out on their own. Review first:
#       $WR kv key list --binding=CACHE --prefix="seen:" > /tmp/seen.json
#     Then delete the unwanted hostnames (edit the grep to taste), e.g.:
#       for k in $(jq -r '.[].name' /tmp/seen.json \
#                  | grep -E '(allbirds|100percentpure)\.(ca|co\.|com\.au|eu)'); do
#         $WR kv key delete --binding=CACHE "$k"
#       done
