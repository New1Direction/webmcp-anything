# MCP directory listings — wmcp.sh trust oracle + OAuth vault

Copy-paste listing content for each directory. **The single highest-leverage move is publishing to the official MCP registry** (`mcp-publisher publish`), which cascades to Glama / PulseMCP / mcp.so via their auto-ingest. Do that first; only hand-submit where a directory hasn't picked it up.

Two ready-to-publish registry entries live in this folder:
- `server.json` — the main "URL→MCP tools" listing (existing).
- `server.trust-oracle.json` — the trust oracle as a standalone remote MCP server (new).

`name` uses the GitHub-OAuth namespace `io.github.New1Direction/...` (≈2 min, no DNS). To use the brand namespace `sh.wmcp/...` instead, switch `name` and run `mcp-publisher login dns` (needs an Ed25519 key + TXT record at the wmcp.sh Cloudflare zone — see SUBMISSION_PLAYBOOK.md). Either is valid; only the verification method differs. The registry is in public preview — re-check the schema date with `mcp-publisher init` before publishing.

---

## Glama
**Title:** wmcp.sh Trust Oracle
**One-liner:** Independent, continuously-watched A–F trust grade for any MCP server, callable by your agent before it connects.
**Description:** A remote (streamable-http) MCP server that grades any other MCP server A–F across spec conformance (20%), security/OWASP MCP Top 10 (30%), reliability (20%), tool hygiene (15%), and transparency (15%). Tools `grade_mcp_server`, `check_mcp_drift`, and `verify_before_execute` let an agent gate a connection on the grade before executing. Unlike a one-shot static scanner, it is continuously watched for tool-surface drift and rug-pulls (the CVE-2025-54136 class). Endpoint `https://wmcp.sh/mcp/trust`, live on Cloudflare Workers; the grade is free and never for sale.
**Tags:** trust, security, verification, drift-detection, owasp, remote, streamable-http
**Submit:** https://glama.ai/mcp/servers — Glama auto-indexes the official registry + public GitHub MCP repos; use "Add server", then claim the listing for edit access + score badge. *(account)*

## Smithery
**Title:** wmcp.sh Trust Oracle
**One-liner:** Gate any MCP connection on an independent A–F trust grade before your agent executes.
**Description:** A hosted remote MCP server that returns an independent trust grade for any MCP server: spec conformance, security per the OWASP MCP Top 10, reliability, tool hygiene, and transparency. Exposes `grade_mcp_server`, `check_mcp_drift`, and `verify_before_execute` so agents verify before they connect, plus a REST endpoint at `GET https://wmcp.sh/api/v1/mcp/verify?url=<server>`. Continuous drift monitoring catches tool-surface changes and rug-pulls after a server is already trusted. Endpoint `https://wmcp.sh/mcp/trust`.
**Tags:** security, trust, verification, monitoring, remote, owasp
**Submit:** https://smithery.ai — CLI: `smithery mcp publish https://wmcp.sh/mcp/trust -n new1direction/trust-oracle` after `smithery auth login`; confirm namespace claim in the web dashboard. *(account)*

## PulseMCP
**Title:** wmcp.sh — MCP Trust Oracle + OAuth Vault
**One-liner:** Moody's for the long tail of MCP servers, plus a one-time OAuth vault for 7 providers.
**Description:** wmcp.sh is a trust layer for the Model Context Protocol: an independent A–F grade for any MCP server (spec conformance, security/OWASP MCP Top 10, reliability, tool hygiene, transparency) with an embeddable SVG badge per host at `/mcp/grade/<host>`. The agent-callable oracle at `https://wmcp.sh/mcp/trust` exposes `grade_mcp_server`, `check_mcp_drift`, and `verify_before_execute`, and is continuously watched for drift and rug-pulls. The same service runs an OAuth vault: connect Linear, Notion, Atlassian (Jira+Confluence), Asana, PayPal, Sentry, or DefiLlama once at `/connect` via RFC 7591 DCR + PKCE, and any agent calls them at `/mcp/<provider>` with the token injected and auto-refreshed. Live on Cloudflare Workers.
**Tags:** trust, oauth, security, vault, remote, linear, notion, atlassian, sentry
**Submit:** https://www.pulsemcp.com/submit — auto-pulls from the official registry daily; only submit the form (or email support@pulsemcp.com) if absent ~1 week after the registry publish. *(usually automatic)*

## mcp.so
**Title:** wmcp.sh Trust Oracle
**One-liner:** Independent, continuously-watched A–F trust grade for any MCP server.
**Description:** A remote MCP server (streamable-http) that grades any MCP server A–F on spec conformance, security (OWASP MCP Top 10), reliability, tool hygiene, and transparency. Agents call `grade_mcp_server`, `check_mcp_drift`, and `verify_before_execute` to gate a connection before executing, or hit `GET https://wmcp.sh/api/v1/mcp/verify?url=<server>`. Unlike a static scanner, it continuously watches for tool-surface drift and rug-pulls after trust is established. Endpoint `https://wmcp.sh/mcp/trust`; the grade is free.
**Tags:** trust, security, verification, drift, remote, streamable-http
**Submit:** https://mcp.so/submit — auto-pulls from the GitHub repo + official registry (~24h); the form may return anti-bot to scripts, so open it in a browser. *(account/click likely)*

---

*Submission URLs are best-known public entry points as of 2026-05-30; these directories change UIs frequently — confirm at submit time.*
