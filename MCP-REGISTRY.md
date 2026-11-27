# MCP registry listing

The root `server.json` describes the hosted trust-checking endpoint at
`https://wmcp.sh/mcp/trust`. It exposes tools for grading a server, checking
tool drift, and reviewing an endpoint before execution. The page-side browser
SDK and per-URL gateway have separate [setup instructions](README.md#start-here).

## Verify the remote

From the repository root, inspect the public tool list:

```sh
node cli/wmcp.mjs doctor https://wmcp.sh/mcp/trust --json
```

Review the negotiated protocol, tool names, and findings before publishing
changes to the listing.

## Publish a registry update

Install the [official registry publisher](https://github.com/modelcontextprotocol/registry),
sign in with the GitHub account authorized for the manifest namespace, and
review the version in `server.json`. Each published update needs a new version.

```sh
mcp-publisher login github
mcp-publisher publish
```
