# WMCP Doctor — read-only MCP compatibility preflight

**Diagnose MCP connectivity and tool-list hygiene without executing a single tool.**

This command is a focused CI checker, not a replacement for the official [MCP Inspector](https://github.com/modelcontextprotocol/inspector) and not a security certification. The official inspector supports broader debugging, transports and interactive workflows.

## Quickstart

From the repository root, using Node.js 18+ (no dependencies):

~~~sh
node cli/wmcp.mjs doctor https://example.com/mcp
node cli/wmcp.mjs doctor https://example.com/mcp --json
node cli/wmcp.mjs doctor https://example.com/mcp --strict --json > report.json
~~~

The first example URL is a placeholder; replace it with an actual public MCP Streamable HTTP endpoint. For local development:

~~~sh
node cli/wmcp.mjs doctor http://localhost:8787/mcp
~~~

Only local HTTP is allowed. Public endpoints require HTTPS without embedded credentials, query strings or fragments; this reduces accidental leakage of API keys. Authenticated reads are supported by setting WMCP_API_KEY in the environment (never printed in reports). Be aware that the target server still receives the Authorization header—use only servers you trust.

## What it checks

1. JSON-RPC initialize (requesting MCP protocol version 2025-11-25) and the negotiated server version.
2. Session ID handling, followed by notifications/initialized.
3. tools/list with page cursors, including cycle protection, bounded pages and response size.
4. Basic tool-name uniqueness, recommended character set and length.
5. Presence of descriptions and structural sanity of inputSchema, outputSchema and required/properties.
6. Server-declared tools capability and whether the listing was complete.

The output includes a pass / warning / fail status and specific findings. It does **not** validate entire JSON Schemas, execute tools, perform OAuth, scan for vulnerabilities, compare response fingerprints over time or assert that annotations are trustworthy. A clean report is a compatibility smoke check only.

The reader limits each response body to 2 MB, list traversal to 12 pages and tool entries to 2,000, to avoid unbounded operations. Listings that hit a limit are reported as incomplete.

## Lock a tool-contract baseline

Take a snapshot of a *trusted* public endpoint and commit the JSON to your own repository after review:

~~~sh
node cli/wmcp.mjs doctor https://YOUR_MCP_HOST.example/mcp --json > mcp-baseline.json

# Fail if the current tool contract changed or structural checks warn.
node cli/wmcp.mjs doctor https://YOUR_MCP_HOST.example/mcp --baseline mcp-baseline.json --strict
~~~

Baseline reports contain tool names and stable SHA-256 fingerprints of tool titles, descriptions, input/output schemas, annotations and execution metadata. They omit the raw tool definitions and bearer/session tokens. The hash is **not an authentication proof**: a malicious service could change its behavior without changing its published contract. The comparison shows names that were added, removed, or changed and treats any drift as a warning (exit code 2 with `--strict`). JSON property-order changes alone do not trigger drift.

A baseline must be a complete `wmcp-doctor/v1` JSON report for the exact same endpoint. Review the diff before refreshing and committing it. Do not generate new baselines automatically after every failed CI run, or you will silently approve changes.

## CI exit codes

- 0 — command succeeded. With --strict, requires a clean report.
- 1 — malformed arguments, connection/protocol error or unexpected failure.
- 2 — doctor --strict produced a warning/fail report.

Use --strict in your pipeline if the team wants to block on tool-schema regressions, but don't treat a warning as a security vulnerability. Tool names/descriptions are untrusted values; read the report before copying them into prompts.

~~~yaml
name: MCP interoperability preflight
on:
  workflow_dispatch:
jobs:
  doctor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
      - run: node cli/wmcp.mjs doctor https://YOUR_MCP_HOST.example/mcp --json --strict
~~~

Substitute your own MCP endpoint. This snippet assumes it is added to the WMCP repository; other projects should vendor the CLI from a reviewed release/commit rather than running unreviewed GitHub branches.

## GitHub Actions integration

You can run Doctor in another GitHub repository using the checked-in composite
action instead of copying its JavaScript or installing npm dependencies. It
probes the **explicit endpoint** using read-only MCP operations.

After this action is published on the default branch, add a workflow:

~~~yaml
name: MCP contract
on: [workflow_dispatch, pull_request]

jobs:
  doctor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: New1Direction/webmcp-anything/actions/mcp-doctor@main
        with:
          endpoint: https://your-mcp-server.example/mcp
          strict: "true"
          # Optional: a reviewed baseline checked into YOUR repo.
          # baseline: .github/mcp-baseline.json
          # Optional: a read-only token for your trusted MCP endpoint.
          # auth-token: ${{ secrets.MCP_READ_TOKEN }}
~~~

The moving `@main` reference is for initial evaluation. For production
pipelines, **pin the action to a full reviewed commit SHA** to prevent
unexpected changes. The composite action runs Node.js 22 and propagates
Doctor's exit codes: 0 for success, 1 for errors, 2 for strict warnings/drift.
It does not call tools/call, mutate server state intentionally, or automatically
update a baseline.

Set `baseline` to a previously reviewed JSON file from your project. A
baseline mismatch is a warning and fails when strict is true. Never silently
regenerate the baseline in the same CI run; that would approve contract drift.

The optional `auth-token` is sent as a Bearer header to the supplied
MCP endpoint. Use a **short-lived, read-only secret** and only a server
you control or trust. Do not pass tokens in the endpoint URL.

### Local read-only checks

The CLI also accepts `--base` for alternative WMCP service origins. It
will not forward `WMCP_API_KEY` to custom bases by default. If you
specifically intend to authorize a self-hosted WMCP service, use
`--send-key-to-base` with a service you trust. This flag does not apply
to Doctor, which targets an explicit MCP endpoint.

## Design references

- MCP 2025-11-25 tools specification: https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/docs/specification/2025-11-25/server/tools.mdx
- Current protocol schema: https://github.com/modelcontextprotocol/modelcontextprotocol/tree/main/schema
- Official Inspector: https://github.com/modelcontextprotocol/inspector
