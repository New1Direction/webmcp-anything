#!/usr/bin/env bash
# Honest local verification gate. The point of this file: a previous bug let a
# RED `tsc` (exit 2) read as green locally because the exit code was masked by a
# pipe ($PIPESTATUS). On a control plane — code whose value is reliably doing
# what it says — a verification layer that can lie is the most dangerous bug.
#
# `set -euo pipefail` + `npm run verify` (which is `tsc --noEmit && vitest run`)
# means: any non-zero exit anywhere aborts with a non-zero exit. Never pipe this
# into grep/head — read its exit code directly. Run before every merge.
set -euo pipefail

cd "$(dirname "$0")/../worker"

echo "→ npm run verify (tsc --noEmit && vitest run)"
npm run verify

echo "✓ verify passed — safe to merge"
