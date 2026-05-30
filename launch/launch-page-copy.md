# Launch page copy — trust layer + OAuth vault (2026-05-30)

Drop-in copy for a launch/landing section. Honest, technical, no invented metrics.

## Hero
An independent trust grade for every MCP server. And an OAuth vault so your agents never touch a credential.

## Subhead
wmcp.sh grades any MCP server A–F across spec conformance, security, reliability, tool hygiene, and transparency — then keeps watching it for drift. Connect a provider once, and any agent calls it with tokens injected and auto-refreshed. Live on Cloudflare Workers.

## Sections

### A trust grade you didn't have to take on faith
Every MCP host gets a free A–F grade weighted across spec conformance (20%), security mapped to the OWASP MCP Top 10 (30%), reliability (20%), tool hygiene (15%), and transparency (15%). See it at wmcp.sh/mcp/grade/<host> and drop the SVG badge on your README. The grade is independent and never for sale — we don't sell A's.

### Rug-pulls don't happen at scan time. So we keep watching.
A server you trusted can change its tool surface after you've granted access — the CVE-2025-54136 class of drift. A one-shot static scanner structurally can't catch that, because it never looks again. wmcp.sh continuously re-checks graded servers for drift, so a trust signal that was true last week is still true today.

### An OAuth vault, so agents never see a secret
Connect a provider once at wmcp.sh/connect. After that, any agent — Claude, Cursor, Codex — calls it at wmcp.sh/mcp/<provider> and we inject the OAuth bearer token and auto-refresh it. Credentials are encrypted at rest and never passed in tool args. 7 providers live: Linear, Notion, Atlassian (Jira+Confluence), Asana, PayPal, Sentry, DefiLlama — all via RFC 7591 Dynamic Client Registration + PKCE, so there's zero per-app setup.

### Let the agent check before it executes
The trust oracle is itself an MCP server at wmcp.sh/mcp/trust, exposing grade_mcp_server, check_mcp_drift, and verify_before_execute. An agent can gate a connection on the grade before it runs a single tool. Prefer REST? GET wmcp.sh/api/v1/mcp/verify?url=<server>.

### One extraction, both worlds: MCP and WebMCP
The dual-emit bridge turns one extraction into a server-side MCP endpoint AND a drop-in WebMCP shim (navigator.modelContext) for in-browser agents. GET wmcp.sh/api/v1/webmcp?url=<site>, or load `<script src="https://wmcp.sh/webmcp/<b64url>.js">`. WebMCP adoption is near zero today — which is exactly why the trust signal for it should be set now.

### Grade Monitor: get told when a server changes
Continuous drift and rug-pull alerts delivered to Slack or a webhook. The grade itself stays free and independent — the paid layer is custody (per connection) and ongoing monitoring, never the grade. Moody's for the long tail of MCP servers.

## Reddit post (r/mcp)
**Title:** I built a free, independent A–F trust grade for MCP servers — and it keeps watching them for rug-pulls

**Body:** We keep wiring MCP servers into agents that hold our credentials and execute tools on our behalf, but there's no independent way to ask the obvious question: should I trust this server before I connect it? So I built wmcp.sh (live on Cloudflare Workers). Two parts.

**1. A free, independent trust grade.** Any MCP server gets an A–F grade weighted across spec conformance (20%), security mapped to the OWASP MCP Top 10 (30%), reliability (20%), tool hygiene (15%), and transparency (15%). Each host has a page at wmcp.sh/mcp/grade/<host> with an embeddable SVG badge. The grade is free and not for sale — the whole point is that it's independent, so we don't sell A's.

The part I think matters most: the grade is continuously watched for drift. A server you trusted can change its tool surface later — the CVE-2025-54136 class, where the description or behavior an agent reads shifts after you've already granted trust. A one-shot static scanner structurally can't catch that because it never looks again. We re-check.

Agents can also gate themselves on it: there's a trust oracle (itself an MCP server at wmcp.sh/mcp/trust) exposing grade_mcp_server, check_mcp_drift, verify_before_execute, so an agent verifies before it executes. REST version: GET wmcp.sh/api/v1/mcp/verify?url=<server>.

**2. An OAuth vault so agents never see a credential.** Connect a provider once at wmcp.sh/connect, then any agent (Claude/Cursor/Codex) calls it at wmcp.sh/mcp/<provider> with the OAuth bearer token injected and auto-refreshed. Credentials are encrypted at rest and never passed in tool args. 7 providers live: Linear, Notion, Atlassian (Jira+Confluence), Asana, PayPal, Sentry, DefiLlama — all onboarding via RFC 7591 Dynamic Client Registration + PKCE, so there's no per-app client setup.

**Honest about the limits:** the v1 grade is built from static + spec signals from a single connection. It tells you what a server claims and how it's configured, not yet how it behaves under real traffic. Behavioral annotation-truthing through the proxy — checking whether a tool's stated behavior matches what it actually does when called — is next, not shipped.

If you run or depend on an MCP server, grade it at wmcp.sh/mcp/grade/<host> and tell me where the grade is wrong, too soft, or too harsh. The grade is only worth anything if it holds up to people poking at it.
