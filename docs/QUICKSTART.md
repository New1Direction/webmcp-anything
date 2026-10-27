# Quickstart — WMCP in 5 minutes

WMCP provides (1) a REST discovery API and (2) a separate, real Model Context Protocol endpoint. **Do not use the REST /api/v1/tools URL as an MCP server URL.** This guide covers both.

## 1. Discover candidate tools, no account required

### Terminal

Clone the repository and run the dependency-free inspector (Node.js 18+):

~~~sh
git clone https://github.com/New1Direction/webmcp-anything
cd webmcp-anything
node cli/wmcp.mjs inspect https://petstore3.swagger.io/api/v3/openapi.json
~~~

Or skip the clone and make an ordinary REST request:

~~~sh
curl -sS 'https://wmcp.sh/api/v1/tools?url=https://petstore3.swagger.io/api/v3/openapi.json'
~~~

The returned schemas are discovery candidates; they are not proof of usable, safe or authorized live actions. The hosted service may fetch or cache submitted URLs. Do not send credentials or signed/private URLs.

## 2. Verify real MCP protocol support

~~~sh
node cli/wmcp.mjs mcp https://petstore3.swagger.io/api/v3/openapi.json
~~~

The CLI sends a JSON-RPC initialize request, then tools/list, to a per-URL MCP endpoint. **It never executes tools/call.** It prints discovered names, protocol version, and the endpoint.

Build a client config for the same URL:

~~~sh
node cli/wmcp.mjs config https://petstore3.swagger.io/api/v3/openapi.json
~~~

Copy the resulting URL into the remote-MCP configuration supported by your client. Its shape is:

~~~json
{
  "mcpServers": {
    "wmcp": {
      "type": "http",
      "url": "https://wmcp.sh/mcp/u/<base64url-encoded-target>"
    }
  }
}
~~~

The angle-bracket token above is a placeholder. Run the CLI to get the correctly encoded URL.

**Claude, Cursor, Codex and other clients have different configuration syntax and supported transports.** Consult the client's current documentation and adapt the generated endpoint. For clients that do not support remote Streamable HTTP directly, use a compatible transport bridge.

## 3. Want live tool execution?

Reading a tool list is free within rate limits. Calling an action needs a paid account/API key or an appropriate authenticated provider connection, plus the target site's permissions.

1. Visit [wmcp.sh/dashboard](https://wmcp.sh/dashboard), review the terms, and obtain an API key.
2. Configure your MCP client to send an Authorization: Bearer header to WMCP. Never include the key in a URL, GitHub issue, commit or chat.
3. Only call site actions you have permission to use. Confirm purchases, writes, transfers and other consequential operations.

Authenticated provider connections live under the WMCP dashboard and use separate server-side proxy routes. A browser WebMCP tool uses the site owner's browser session and **does not automatically become remotely callable** through a URL-based gateway.

## 4. Try a website's own browser-native WebMCP tools

Open the dependency-free [native taskboard demo](../examples/browser-demo/README.md):

~~~sh
cd examples/browser-demo
python3 -m http.server 8000
~~~

Visit http://localhost:8000 from a browser with native WebMCP support or the relevant experimental flag. The page registers list_tasks, add_task and complete_task via document.modelContext. An agent can invoke them and the visible UI changes. If the native API is absent, you can still use the taskboard normally.

This is not a remote MCP connection and does not require a WMCP subscription.

## 5. Build or extend WMCP

- [Adapter contract](../adapters/CONTRACT.md) — make a read-only public-site adapter
- [Contribution guide](../CONTRIBUTING.md) — fixtures, test harness, PR process
- [Architecture](ARCHITECTURE.md) — worker caching, authentication, integration
- [API reference](API.md) — routes, authentication, responses
- [Self-hosting](SELF_HOSTING.md) — run your own deployment
- [CLI guide](../cli/README.md) — local read-only commands

Run tests:

~~~sh
node --test cli/*.test.mjs
node adapters/_test/run.mjs
cd worker && npm install && npm run verify
~~~

Please report a bug if the docs don't match actual behavior—working first-run examples are a core part of the product.
