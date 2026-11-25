# Catch browser WebMCP regressions in CI

WMCP Doctor opens a page in a fresh, WebMCP-enabled Chrome profile and reads the browser’s own top-level tool registrations through the Chrome DevTools Protocol. It reports the tool names and fingerprints their contracts. It never invokes browser tools or remote MCP tools.

## Create and enforce a baseline

Use Node.js 18+ and install a Chrome build with the experimental WebMCP DevTools domain. Set `WMCP_CHROME` or pass `--chrome /path/to/chrome` if Chrome is outside the default location. Chrome for Testing 160.0.8183.0 was used for the native regression fixture.

~~~sh
# Record and review the tool list on your known-good deployment.
node cli/wmcp.mjs doctor web https://site.example/tools --strict --json > webmcp-baseline.json

# Check the same path on a preview origin against your reviewed report.
node cli/wmcp.mjs doctor web https://preview.example/tools \
  --allow-preview-origin --baseline webmcp-baseline.json --strict
~~~

On the first command, commit the baseline only after the command succeeds and you verify the tool names. Use the same Chrome build and `--wait-ms` setting when comparing runs. The default observation window is 1,000 ms after document load, and `--wait-ms` accepts 0–10,000 ms. The check observes the anonymous page as loaded, including registrations made during that window. The report includes the Chrome build, observed path, and window used.

If the page also has a remote MCP endpoint, append `--pair https://site.example/mcp` to both commands. The pairing lists browser-only and MCP-only tools by name and compares input/output schemas where both surfaces publish them. When a baseline is present, repeated differences are expected and new or resolved differences fail strict mode. Pairing only uses public, unauthenticated MCP discovery. To check an authenticated remote endpoint separately, use [MCP Doctor](MCP_DOCTOR.md).

### GitHub Actions

Start with a preview job that builds or deploys your page. In that job, check out your repo so the baseline is available, and ensure the runner has a WebMCP-capable Chrome installation. On a GitHub-hosted Ubuntu runner the action looks for `google-chrome` by default. Use the `chrome` input to select a specific build on your runner.

~~~yaml
- uses: actions/checkout@v4
- uses: New1Direction/webmcp-anything/actions/mcp-doctor@REVIEWED_COMMIT_SHA
  with:
    page: https://preview.example/tools
    baseline: webmcp-baseline.json
    allow-preview-origin: "true"
    strict: "true"
~~~

Pin `REVIEWED_COMMIT_SHA` to a commit that contains `doctor web`. In the preview workflow, use the deployed URL as the `page` input. Optional inputs include `paired-endpoint`, `chrome`, and `wait-ms`.

| Exit | Meaning |
| --- | --- |
| `0` | A report was produced. With `--strict`, its checks passed. |
| `1` | Chrome, navigation, the paired endpoint, or supplied inputs prevented a valid report. |
| `2` | `--strict` detected zero tools, ambiguous browser registrations, browser contract drift, or a change in reviewed browser/MCP differences. |

Run the check for pages you are authorized to load. Chrome runs the page’s normal scripts on navigation in an anonymous profile. The probe covers the top-level page during a bounded observation window, so authenticated states, iframe-only tools, and tools requiring UI interaction are outside this check.

## Reproduce the regression

~~~sh
cd worker
npm ci
WMCP_CHROME=/path/to/chrome npm test -- test/webmcp_native.test.ts
~~~

The test loads the existing native taskboard and confirms its three registrations. It then checks that the legacy WMCP shim removes `list_tasks` from a reviewed preview baseline and exits `2`. Restoring the fixed shim restores `list_tasks` and exits `0`. The [demo page](../worker/public/demo/webmcp-doctor.html) presents the recorded result and runs as a standalone HTML file without a login or WebMCP-capable browser.
