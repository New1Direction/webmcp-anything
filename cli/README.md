# WMCP developer CLI (read-only)

No installation needed after cloning this repository. Requires Node.js 18+.

From the repository root:

    node cli/wmcp.mjs inspect https://petstore3.swagger.io/api/v3/openapi.json
    node cli/wmcp.mjs mcp https://petstore3.swagger.io/api/v3/openapi.json
    node cli/wmcp.mjs config https://petstore3.swagger.io/api/v3/openapi.json
    node cli/wmcp.mjs grade https://example.com/mcp

- **inspect** — calls the WMCP REST discovery API and prints extracted tools.
- **mcp** — sends actual JSON-RPC initialize and tools/list to WMCP's URL-specific MCP endpoint. It never executes tools/call.
- **config** — prints a copyable MCP client configuration with no secrets embedded.
- **grade** — reads the independent A–F MCP trust report. This is a risk indicator, not proof of safety.

Use --json for raw output, and --base http://localhost:8787 to try your local Worker. Authenticated *reads* can use the WMCP_API_KEY environment variable. The CLI does not echo the key or run paid tool actions.

**Privacy:** Supply PUBLIC HTTPS URLs only. The hosted service may fetch, cache, or index them. The CLI refuses URL credentials, query strings and fragments to reduce accidental sharing of signed/private URLs. For local/private systems run your own controlled deployment and do not submit secrets to the public service.

This CLI is included in source; we are not claiming an npm package is published. Do not recommend npx wmcp until it is actually released.

Tests (zero dependencies):

    node --test cli/*.test.mjs

Read the platform guide: ../docs/QUICKSTART.md
