# MCP registry submission kit — get listed where acquirers look

Goal: show up as the MCP hub in every registry agents + acquirers browse. Lead
with the **Trust Oracle** — it's the unique, attention-grabbing listing (an MCP
server that grades other MCP servers). Then the hub + the vaulted proxies.

Source of truth for endpoints: `https://wmcp.sh/.well-known/mcp` (keep these in
sync with it).

> Note: each registry's exact submit flow changes often. The paste-copy below is
> registry-agnostic; the per-registry steps are the best-known path. Don't
> copy-paste the *same* description everywhere — variants are provided.

---

## Canonical assets

- **Name:** wmcp.sh
- **Homepage:** https://wmcp.sh
- **Hub:** https://wmcp.sh/connect
- **Manifest:** https://wmcp.sh/.well-known/mcp
- **Leaderboard:** https://wmcp.sh/mcp/leaderboard
- **Repo (if asked):** https://github.com/New1Direction/webmcp-anything
- **Categories/tags:** MCP, AI agents, security, trust, OAuth, developer-tools, registry
- **Logo:** orange coin mark (export 256×256 + SVG from extension/icons)

### The servers to list
| Server | Connect URL | Transport | Auth | What it does |
|---|---|---|---|---|
| **Trust Oracle** | `https://wmcp.sh/mcp/trust` | streamable-http | none | Grades any MCP server (A–F), drift/rug-pull watch, verify-before-execute |
| **Universal adapter** | `https://wmcp.sh/mcp/url` | streamable-http (JSON-RPC) | none | Turn any URL into MCP tools |
| **Vaulted proxies** | `https://wmcp.sh/mcp/<provider>` | streamable-http | oauth-vault | OAuth-handled MCP for Notion, Linear, Atlassian, Asana, PayPal, Sentry, DefiLlama |

---

## Descriptions (vary by surface)

**Trust Oracle — short (≤140):**
```
An MCP server that grades other MCP servers: independent A–F trust score,
drift/rug-pull monitoring, and a verify-before-execute gate for agents. Free.
```

**Trust Oracle — long:**
```
The wmcp.sh Trust Oracle is an MCP server that audits other MCP servers. Point it
at any server URL and it returns an independent A–F trust grade scored on spec
conformance, OWASP MCP Top 10 security, reliability, tool hygiene, and
transparency. It keeps watching graded servers for drift and rug-pulls, and
exposes a verify-before-execute gate so an agent can check a server is safe
before it connects. Tools: grade_mcp_server, check_mcp_drift,
verify_before_execute. The grade is free and identical whether or not the
operator pays — independence is the point. Add it at https://wmcp.sh/mcp/trust
or browse the leaderboard at https://wmcp.sh/mcp/leaderboard.
```

**wmcp.sh hub — short:**
```
The MCP hub: connect any MCP server with OAuth vaulted and an independent A–F
trust grade, or turn any URL into agent-callable MCP tools. No server to build.
```

**wmcp.sh hub — long:**
```
wmcp.sh is a hub for the Model Context Protocol. Connect an MCP server once with
one OAuth click — the token is vaulted (encrypted, never in tool args) and
auto-refreshed — then any agent (Claude, Cursor, Codex) calls it at
wmcp.sh/mcp/<provider>. Every connection carries an independent A–F trust grade
that's continuously watched for drift and rug-pulls. You can also turn any URL
into agent-callable MCP tools with no server to build, and dual-emit the same
tools as in-browser WebMCP. Free read/grade tier; governed paid actions (kill
switch, spend caps, audit). Built on Cloudflare Workers.
```

---

## Per-registry steps

### 1. Smithery — smithery.ai  (highest intent)
- Go to smithery.ai → "Add server" / "Submit". Smithery lists remote
  (streamable-http) servers — add `https://wmcp.sh/mcp/trust` as a remote server.
- Name: `wmcp.sh Trust Oracle` · Category: Security / Tools.
- Paste the Trust Oracle short description.
- Then add a second listing for the hub (`https://wmcp.sh/connect`) if it allows
  a platform/aggregator entry.

### 2. mcp.so — mcp.so
- "Submit" (GitHub-backed). Submit the Trust Oracle + the hub.
- Use the long Trust Oracle description; tag MCP / security / trust.

### 3. Glama — glama.ai/mcp/servers
- Glama crawls + lets you add/claim. Add `https://wmcp.sh/mcp/trust` and claim
  the wmcp.sh listing. Paste hub short description.

### 4. PulseMCP — pulsemcp.com
- "Submit a server / news". Submit the Trust Oracle (it's genuinely novel, good
  for their news feed) + the hub. Long description.

### 5. punkpeye/awesome-mcp-servers (the big community list) — GitHub PR
Fork → add under the most fitting category (Security / Monitoring, or a Tools
section), keep alphabetical, follow their emoji legend in CONTRIBUTING. Entry:
```
- [wmcp.sh Trust Oracle](https://wmcp.sh/mcp/trust) ☁️ - An MCP server that grades other MCP servers: independent A–F trust score, drift/rug-pull monitoring, and a verify-before-execute gate for agents. Free. Leaderboard at https://wmcp.sh/mcp/leaderboard
```
(☁️ = hosted/remote service. Add the correct legend emojis per their README.)

### 6. modelcontextprotocol/servers (official) — GitHub PR
If they accept community/third-party entries, add the same line in their format
under the community section, following CONTRIBUTING. If not, skip — the awesome
list above carries the weight.

### 7. Bonus directories (same copy)
- mcpservers.org / mcp.run / Cline MCP Marketplace / Cursor directory / MCPHub /
  AImcp.co — submit the Trust Oracle + hub with the short descriptions.

---

## Order of operations (today)
1. Smithery + mcp.so + Glama + PulseMCP (forms, ~10 min each).
2. The awesome-mcp-servers PR (highest long-term SEO + discovery weight).
3. Bonus directories as time allows.
4. Re-check `https://wmcp.sh/.well-known/mcp` after any server change so listings stay accurate.

## Tracker
| Date | Registry | Listing(s) | Status | Backlink? | Notes |
|---|---|---|---|---|---|
| | Smithery | Trust Oracle + hub | todo | | |
| | mcp.so | Trust Oracle + hub | todo | | |
| | Glama | Trust Oracle + hub | todo | | |
| | PulseMCP | Trust Oracle + hub | todo | | |
| | awesome-mcp-servers | Trust Oracle (PR) | todo | | |
| | modelcontextprotocol/servers | Trust Oracle (PR) | todo | | |

## Why the Trust Oracle leads
It's the one listing nobody else has — "an MCP server that grades MCP servers."
That's what gets reshared, what AI engines cite for "is this MCP server safe?",
and what an acquirer notices. The vaulted proxies and adapter are supporting
cast; the oracle + leaderboard are the hook.
