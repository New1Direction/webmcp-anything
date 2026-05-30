# X / Twitter thread — trust-layer positioning (2026-05-30)

> Current-build thread (trust grade + drift watch + OAuth vault). Supersedes the URL→tools cut in `twitter-thread.md` for a trust-led launch. Each tweet ≤275 chars. Attach a grade-page screenshot to tweet 1.

## 1/ hook
MCP servers are getting wired into agents that hold your credentials and run tools on your behalf. There's no independent way to ask: should I trust this server? We built one. wmcp.sh — a free A–F trust grade for any MCP server, plus an OAuth vault. On Cloudflare Workers.

## 2/ the grade
The grade scores 5 things: spec conformance (20%), security against the OWASP MCP Top 10 (30%), reliability (20%), tool hygiene (15%), transparency (15%). Every host gets a page at wmcp.sh/mcp/grade/<host> and an embeddable SVG badge. The grade is free and never for sale.

## 3/ the drift watch (the differentiator)
The part a static scanner can't do: we keep watching. A server you trusted can quietly change its tool surface after the fact — the CVE-2025-54136 rug-pull class. A one-shot scan never looks again. We re-check for drift, continuously.

## 4/ the vault
The second half is an OAuth vault. Connect a provider once at wmcp.sh/connect, then any agent (Claude, Cursor, Codex) calls wmcp.sh/mcp/<provider> and we inject + auto-refresh the bearer token. Credentials are encrypted at rest and never sent in tool args.

## 5/ what's live
7 providers live now: Linear, Notion, Atlassian (Jira+Confluence), Asana, PayPal, Sentry, DefiLlama. All via RFC 7591 Dynamic Client Registration + PKCE, so there's zero per-app client setup. Connect once, every agent benefits.

## 6/ agents gate themselves
Agents can gate on the grade. There's a trust oracle (an MCP server at wmcp.sh/mcp/trust) with grade_mcp_server, check_mcp_drift, verify_before_execute — so an agent checks BEFORE it executes. Or hit REST: GET wmcp.sh/api/v1/mcp/verify?url=<server>.

## 7/ honest about v1
Honest about v1: the grade uses static + spec signals from a single connection. It measures what a server claims and how it's set up, not yet how it behaves under real traffic. Behavioral annotation-truthing through the proxy is next, not shipped.

## 8/ CTA
Grade a server you depend on at wmcp.sh/mcp/grade/<host>, or connect one at wmcp.sh/connect, and tell us where we're wrong. WebMCP adoption is ~0 today — which is exactly when the trust signal for the long tail of MCP should get set.
