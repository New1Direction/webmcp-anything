#!/usr/bin/env bash
# build_extension.sh — bundle the extension service worker.
#
# The service worker (extension/background.js) imports the shared adapters from
# ../adapters/*.js, which live OUTSIDE the extension folder. Chrome can't resolve
# imports outside the packed extension, so we inline them into a single
# self-contained file the manifest points at (background.bundle.js).
#
# Run this after changing background.js OR any adapter it imports
# (adapters/shopify.js, adapters/jsonld.js). Commit the resulting bundle so the
# extension loads as-is (Load unpacked → extension/).
#
#   ./scripts/build_extension.sh
set -euo pipefail
cd "$(dirname "$0")/.."

npx --yes esbuild extension/background.js \
  --bundle \
  --format=esm \
  --platform=browser \
  --outfile=extension/background.bundle.js

echo "✓ built extension/background.bundle.js"
grep -q "from \"\.\./adapters" extension/background.bundle.js \
  && { echo "✗ bundle still has external imports"; exit 1; } \
  || echo "✓ self-contained (no external imports)"
