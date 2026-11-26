# WMCP developer CLI (read-only)

Requires Node.js 18+. Most commands work directly after cloning. The `select` command and full CLI test suite additionally require the Rust selection engine:

    cargo build --locked --manifest-path tools/wmcp-stats/Cargo.toml

For an optimized engine, build with `--release` and set `WMCP_STATS_ENGINE` to `tools/wmcp-stats/target/release/wmcp-stats` (use an absolute path when running outside the repository root). The engine runs as a separate local process; for small inputs, process startup can take longer than the computation itself.

From the repository root:

    node cli/wmcp.mjs inspect https://petstore3.swagger.io/api/v3/openapi.json
    node cli/wmcp.mjs mcp https://petstore3.swagger.io/api/v3/openapi.json
    node cli/wmcp.mjs config https://petstore3.swagger.io/api/v3/openapi.json
    node cli/wmcp.mjs grade https://example.com/mcp
    node cli/wmcp.mjs doctor https://example.com/mcp --strict --json
    node cli/wmcp.mjs compile examples/browser-demo/capabilities.json
    node cli/wmcp.mjs ontology examples/capability-discovery/catalog.json
    node cli/wmcp.mjs discover examples/capability-discovery/catalog.json 'When is the next planned downtime?'

- **inspect** — calls the WMCP REST discovery API and prints extracted tools.
- **mcp** — sends actual JSON-RPC initialize and tools/list to WMCP's URL-specific MCP endpoint. It never executes tools/call.
- **config** — prints a copyable MCP client configuration with no secrets embedded.
- **grade** — reads WMCP's independent A–F trust report. A risk indicator, not proof of safety.
- **doctor** — connects directly to an MCP Streamable HTTP server, negotiates the protocol, follows tool-list pagination and emits compatibility findings. Use `--strict` for a CI exit code. It never calls tools. [Doctor documentation](../docs/MCP_DOCTOR.md).
- **compile** — turns a local site contract or OpenAPI 3.0/3.1 JSON file into a capability specification with typed inputs, authorization requirements and observable success checks. [Compiler documentation](../docs/capability-compiler.md).
- **contract** — audits a local tool descriptor or projects a named capability into the minimal contract. [Tool contract guide](../docs/tool-contract.md).
- **select** — checks required outcomes and service objectives, then ranks feasible tools under a spending limit. [Selection guide and fixture](../docs/tool-selection.md).
- **ontology** — exports an annotated local catalog as a typed capability graph.
- **discover** — ranks catalog capabilities by goal and reports which documented conditions apply. [Discovery usage and benchmark](../docs/capability-discovery.md).
- **compose** — finds or verifies typed, policy-covered WebMCP workflows. [Workflow composition guide](../docs/workflow-composition.md).
- **replay** — checks the inputs, approvals, state and tool outcomes of a workflow against local fixtures.

Use `doctor --json > mcp-baseline.json` followed by `doctor --baseline mcp-baseline.json --strict` to flag added, removed or changed tool definitions. This is contract-drift detection, not proof that the server's behavior is safe. See [the Doctor guide](../docs/MCP_DOCTOR.md), including the reusable GitHub Action for CI.

Use --json for raw output, and --base http://localhost:8787 to try your local Worker. Authenticated reads to wmcp.sh can use the WMCP_API_KEY environment variable. The CLI does not echo the key or run paid tool actions. **Custom --base origins never receive that API key unless you explicitly pass --send-key-to-base.** Only opt in for a server you trust. The doctor command targets the provided MCP endpoint directly and may send the supplied WMCP_API_KEY to that endpoint; review the target before using credentials.

**Privacy:** Supply PUBLIC HTTPS URLs only. The hosted service may fetch, cache, or index them. The CLI refuses URL credentials, query strings and fragments to reduce accidental sharing of signed/private URLs. For local/private systems run your own controlled deployment and do not submit secrets to the public service.

This CLI is included in source; we are not claiming an npm package is published. Do not recommend npx wmcp until it is actually released.

Tests (build the Rust selection engine first):

    node --test cli/*.test.mjs

Read the platform guide: ../docs/QUICKSTART.md

## Browser WebMCP

Run `node cli/wmcp.mjs doctor web https://site.example/tools --strict` with a WebMCP-capable Chrome build to observe native registrations. The [WebMCP Doctor guide](../docs/WEBMCP_DOCTOR.md) covers reporting, preview baselines, pairing, and CI.

`node cli/wmcp.mjs doctor diff --help` shows how to compare two saved Doctor reports entirely offline. This optional command uses Node.js 22.18+, Effect 4, and a Rust engine. See the [setup and fixture](../tools/doctor-diff/).
