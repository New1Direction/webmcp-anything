#!/usr/bin/env bash
set -euo pipefail

cd "$GITHUB_WORKSPACE"
if [[ ! -f "$JOURNEY_CONFIG" ]]; then
  echo "Set config to a journey JSON file in the checked-out repository." >&2
  exit 2
fi
args=(--journey-config "$JOURNEY_CONFIG")
if [[ -n "$JOURNEY_URL" && -z "$JOURNEY_SITE" ]]; then
  args+=(--url "$JOURNEY_URL")
elif [[ -z "$JOURNEY_URL" && -d "$JOURNEY_SITE" ]]; then
  args+=(--demo-dir "$JOURNEY_SITE")
else
  echo "Supply either url for a running test app or site-dir for a static directory." >&2
  exit 2
fi
if [[ -n "$JOURNEY_CHROME" ]]; then args+=(--chrome "$JOURNEY_CHROME"); fi
if [[ -n "$JOURNEY_POLYFILL" ]]; then args+=(--polyfill "$JOURNEY_POLYFILL"); fi

environment=$(mktemp -d "$RUNNER_TEMP/webmcp-journey.XXXXXXXX")
trap 'rm -rf -- "$environment"' EXIT
python3 -m venv "$environment"
"$environment/bin/python" -m pip install --disable-pip-version-check --quiet playwright==1.62.0
"$environment/bin/python" "$GITHUB_ACTION_PATH/../../scripts/test-taskboard-affordances.py" "${args[@]}"
