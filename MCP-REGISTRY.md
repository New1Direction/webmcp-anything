# Publishing wmcp to the official MCP registry

`server.json` (repo root) is the manifest for the **official MCP registry**
(`registry.modelcontextprotocol.io`) — the upstream that **Smithery, Glama,
PulseMCP and most MCP directories sync from**. One publish cascades to them.

The listed remote `https://wmcp.sh/mcp/trust` is **auth `none`** and stable, so the
registry's validator can connect, `initialize`, and `tools/list` without credentials.

## Publish (one-time, ~2 min)

```sh
# 1. Install the publisher CLI
brew install mcp-publisher           # or: see github.com/modelcontextprotocol/registry releases

# 2. Authenticate — this proves you own the io.github.New1Direction/* namespace
#    via your GitHub login (the namespace must match your GitHub username).
mcp-publisher login github

# 3. Validate + publish server.json from the repo root
mcp-publisher publish
```

If the namespace is rejected, lowercase it: `io.github.new1direction/webmcp-anything`
(GitHub usernames are case-insensitive; the registry may expect lowercase).

To update later, bump `version` in `server.json` and re-run `mcp-publisher publish`.

## Why no `smithery.yaml`

`smithery.yaml` is for servers Smithery **builds/deploys** (TypeScript runtime or a
container with a `startCommand`). wmcp is an **already-hosted remote** server, so a
`smithery.yaml` is the wrong artifact. Smithery reaches wmcp via (a) the official
registry sync above, or (b) "Add Server" → remote URL on smithery.ai. The repo's
GitHub topics (`mcp`, `model-context-protocol`, `mcp-server`, `mcp-security`) also
let Glama and others auto-index it.
