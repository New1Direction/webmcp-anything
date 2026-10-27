# WMCP — turn websites into tools for AI agents

**One URL → discover tools → connect an MCP client → evaluate trust.**

[![CI](https://github.com/New1Direction/webmcp-anything/actions/workflows/ci.yml/badge.svg)](https://github.com/New1Direction/webmcp-anything/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-56cda0)](LICENSE)
[![Node.js 18+](https://img.shields.io/badge/CLI-Node.js%2018%2B-239a73)](cli/README.md)
[![Open MCP](https://img.shields.io/badge/protocol-MCP-4da6dc)](https://modelcontextprotocol.io)

**[Try WMCP](https://wmcp.sh/start)** · **[MCP Doctor](docs/MCP_DOCTOR.md)** · **[Read-only CLI](cli/README.md)** · **[Native browser demo](examples/browser-demo/README.md)** · **[MCP Trust Leaderboard](https://wmcp.sh/mcp/leaderboard)** · **[API docs](docs/API.md)**

WMCP is a hosted **URL-to-MCP gateway** for Claude, Cursor, Codex and custom AI agents. It extracts candidate tools from public pages, structured data and documented APIs; exposes them over MCP; and offers separate trust grading for MCP servers. You can use the public service or self-host the Worker.

Not every website is compatible. Discovery is best-effort, and a discovered tool is **not** proof that an action can actually run, that the site permits it, or that it is safe. Authenticated live actions require authorization and applicable plan entitlements.

## Try it in 30 seconds

**Option 1: browser, no install.** Paste a public URL into [wmcp.sh/start](https://wmcp.sh/start), review the inferred tools, then choose whether to connect an MCP client.

**Option 2: terminal, no dependencies.** Node.js 18+ is sufficient after cloning:

~~~sh
git clone https://github.com/New1Direction/webmcp-anything.git
cd webmcp-anything

# Discover candidate tools using the hosted REST API.
node cli/wmcp.mjs inspect https://petstore3.swagger.io/api/v3/openapi.json

# Negotiate actual MCP and request tools/list (never tools/call).
node cli/wmcp.mjs mcp https://petstore3.swagger.io/api/v3/openapi.json

# Print a copyable MCP client configuration (no keys included).
node cli/wmcp.mjs config https://petstore3.swagger.io/api/v3/openapi.json
~~~

The CLI performs **read-only** requests. It does not install another agent, make purchases, or call any tool. Run the Node test command below to execute its tests and the browser demo smoke tests.

**Option 3: cURL, no clone:**

~~~sh
curl -sS 'https://wmcp.sh/api/v1/tools?url=https://petstore3.swagger.io/api/v3/openapi.json'
~~~

Only submit **public** URLs. The hosted service may fetch, cache, or index submitted sources; do not send credentials, signed query parameters, private files or sensitive customer data.

## Connect an MCP client

WMCP provides a **real MCP endpoint**, not merely JSON that looks like a tool schema. Encode the URL as base64url, then use the per-URL address format:

    https://wmcp.sh/mcp/u/<base64url-encoded-URL>

Generate a client configuration for a real URL:

~~~sh
node cli/wmcp.mjs config https://petstore3.swagger.io/api/v3/openapi.json
~~~

The generated JSON has this shape:

~~~json
{
  "mcpServers": {
    "wmcp": {
      "type": "http",
      "url": "https://wmcp.sh/mcp/u/<base64url-encoded-URL>"
    }
  }
}
~~~

Replace the example URL placeholder with the actual CLI output. The endpoint implements JSON-RPC initialize, tools/list and authorized tools/call. Discovery reads are free within rate limits. **Live execution requires authorization**, and not every inferred action is executable. Pass paid-plan keys using your MCP client's Authorization header support—never place keys in URL parameters or commit them to Git.

Multiple public URLs may be composed through the /mcp/url endpoint. See the [API reference](docs/API.md), [architecture](docs/ARCHITECTURE.md), and [self-hosting guide](docs/SELF_HOSTING.md).

## How the gateway works

~~~text
Public URL
   |
   +-- Shopify storefront/product adapter
   +-- OpenAPI / Swagger compiler
   +-- Crypto/data adapters for supported sources
   +-- Structured JSON-LD extraction
   +-- Best-effort LLM fallback, when configured
   |
   v
Schema + tools ---> Hosted MCP endpoint or JSON REST response
                           |
                      Client approval, auth & execution
~~~

Detection depends on each site's metadata, network accessibility and authentication. Client-side applications may require a separately installed browser integration.

**WebMCP is not the same as backend MCP.** The [WebMCP draft](https://webmachinelearning.github.io/webmcp/) uses document.modelContext to expose site-owned JavaScript tools in the browser. WMCP's current hosted product is primarily a backend URL adapter and MCP gateway. [Native browser interoperability is being developed in PR #75](https://github.com/New1Direction/webmcp-anything/pull/75); do not assume a remote MCP endpoint can execute browser-session tools without a consented session bridge.

## Diagnose MCP servers in CI

WMCP Doctor checks a direct MCP HTTP endpoint without calling tools. It handles protocol initialization, session IDs, tool pagination, and basic input-schema hygiene. Use it as a lightweight CI preflight, not a formal audit or replacement for the official MCP Inspector.

~~~sh
node cli/wmcp.mjs doctor https://YOUR_MCP_HOST.example/mcp --json --strict
~~~

You can also save `doctor --json` output as a reviewed baseline, then use `--baseline path --strict` to flag MCP tool-contract changes in CI.

The endpoint is an example placeholder. Read [the Doctor guide](docs/MCP_DOCTOR.md) for supported checks, limits, and exit codes.

**Run the same check in another repository with the [WMCP Doctor GitHub Action](actions/mcp-doctor/):**

~~~yaml
- uses: New1Direction/webmcp-anything/actions/mcp-doctor@main
  with:
    endpoint: https://your-mcp.example/mcp
    strict: "true"
    # Optional: a reviewed report file from your repository:
    # baseline: .github/mcp-baseline.json
~~~

For production, replace `@main` with a reviewed **full commit SHA**. The action only calls MCP initialize and tools/list; it does not invoke tools or certify security. See [usage and credential guidance](docs/MCP_DOCTOR.md#github-actions-integration).

## Live browser-native example

This repository also includes a small WebMCP taskboard with real, in-page state—three tools (list, add, complete) and a UI that updates when a tool runs.

~~~sh
cd examples/browser-demo
python3 -m http.server 8000
~~~

Open http://localhost:8000. In a supported Chrome/Edge build with WebMCP enabled, compatible browser agents can discover the page's registered tools. On unsupported browsers, the taskboard still works and reports that the native API is unavailable.

[View the runnable example and instructions](examples/browser-demo/README.md).

## Independent MCP trust reports

The [free MCP Trust Leaderboard](https://wmcp.sh/mcp/leaderboard) examines supported MCP endpoints and publishes an A–F report covering observable protocol, tool and security signals. The trust system can detect changes in discovered tool definitions over time.

Trust grades are risk indicators, not security certifications. They do not imply an audit of every executable behavior or authorize an agent to act. Free grades are not sold; separate products offer deeper assessment and monitoring.

~~~sh
node cli/wmcp.mjs grade https://example.com/mcp
~~~

## Developer integrations

| Surface | Function | Docs |
|---|---|---|
| URL discovery | Best-effort extraction through public HTML and known adapters | [REST API](docs/API.md) |
| Remote MCP | Connect compatible clients to URL-addressed tools | [MCP quickstart](docs/QUICKSTART.md) |
| Native WebMCP demo | Site-authored tools using document.modelContext | [Taskboard demo](examples/browser-demo/) |
| Trust grading | Inspect observable MCP server signals | [Leaderboard](https://wmcp.sh/mcp/leaderboard) |
| Python SDK | Programmatic API client | [Python](sdks/python/) |
| JavaScript SDK | Programmatic API client / model adapters | [JavaScript](sdks/javascript/) |
| Browser extension | Retail-scoped browser extraction and QuickCatch flows | [Extension](extension/) |

The installed extension's existing site coverage is **not** blanket all-site permission. A broader opt-in integration is proposed in [PR #75](https://github.com/New1Direction/webmcp-anything/pull/75).

## Pricing and hosting

The open-source code is MIT-licensed. The hosted API has an anonymous free-read tier plus [Builder ($39/mo), Pro ($99/mo), and Reseller ($299/mo)](https://wmcp.sh/pricing). Scoped agent-readiness services are offered via [Managed](https://wmcp.sh/managed), starting at $499 for setup; ongoing work is quoted separately.

See [self-hosting](docs/SELF_HOSTING.md) for a deployment you control. Hosted service entitlements and provider OAuth connections are separate from the open-source license.

## Contribute

We want **working integrations and tests**, not unsubstantiated claims that a site is agent-ready. Good first contributions include read-only public-format adapters with fixtures; browser compatibility examples; protocol edge-case tests; and better errors, security or accessibility.

Start with [CONTRIBUTING.md](CONTRIBUTING.md), the [adapter contract](adapters/CONTRACT.md), or the [adapter wish list](ADAPTERS_WANTED.md). Pull requests should include an executable test or reproduction wherever possible.

~~~sh
node adapters/_test/run.mjs
cd worker && npm install && npm run verify
# From the repository root:
node --test cli/*.test.mjs
~~~

Questions or bugs? [Open an issue](https://github.com/New1Direction/webmcp-anything/issues). If the toolkit saves you time, starring the repository helps more developers find it.

**License:** [MIT](LICENSE). Not affiliated with browser vendors or the companies whose APIs are referenced.
