# Show HN — trust-layer positioning (2026-05-30)

> Reflects the current build: independent MCP trust grade (continuously watched for drift) + OAuth vault. Supersedes the earlier URL→tools angle in `show-hn.md` for a trust-led launch. Pricing is current: Free / Builder $39 / Pro $99 / Reseller $299.

## Title (≤80 chars)
`Show HN: wmcp.sh – independent A-F trust grade for MCP servers + OAuth vault`

## Body

wmcp.sh is a trust layer and OAuth vault for MCP (Model Context Protocol) servers, running on Cloudflare Workers. Two things are the core of it:

1) An independent A–F trust grade for any MCP server. We score across spec conformance (20%), security mapped to the OWASP MCP Top 10 (30%), reliability (20%), tool hygiene (15%), and transparency (15%). Every host gets a grade page at https://wmcp.sh/mcp/grade/<host> and an embeddable SVG badge. The grade is free and is not for sale. We don't sell A's.

The part we care about most: grades are continuously watched for drift. A server you trusted on Monday can change its tool surface on Friday (the CVE-2025-54136 class of rug-pull, where the description/behavior an agent reads shifts after you've granted trust). A one-shot static scanner structurally cannot catch that, because it never looks again. We re-check.

2) An OAuth vault that injects and refreshes tokens so agents never see a credential. You connect a provider once at https://wmcp.sh/connect, then any agent (Claude, Cursor, Codex) calls it at https://wmcp.sh/mcp/<provider> and we inject the OAuth bearer token and auto-refresh it. Credentials are encrypted at rest and never passed in tool args. 7 providers are live: Linear, Notion, Atlassian (Jira+Confluence), Asana, PayPal, Sentry, DefiLlama. All onboard via RFC 7591 Dynamic Client Registration + PKCE, so there's zero per-app client setup.

There's also an agent-callable trust oracle (itself an MCP server at https://wmcp.sh/mcp/trust) with tools grade_mcp_server, check_mcp_drift, and verify_before_execute, so an agent can gate a connection on the grade before it executes anything. If you'd rather hit REST: GET https://wmcp.sh/api/v1/mcp/verify?url=<server>.

Honest limitation: the v1 grade is built from static + spec signals gathered from a single connection to the server. It tells you what a server claims and how it's configured, not yet how it actually behaves under real traffic. The next step is behavioral annotation-truthing through the proxy: checking whether a tool's stated behavior matches what it actually does when called. That's not shipped yet.

What I'd genuinely like: grade a server you depend on at https://wmcp.sh/mcp/grade/<host> and tell me where the grade is wrong, too generous, or too harsh. And try to break the verify oracle or the vault flow. The grade is only worth anything if it survives people poking at it. Positioning, plainly: Moody's for the long tail of MCP servers, with the vault as the part that pays for it. WebMCP adoption is near zero today, which is exactly why now is the time to set the trust signal.

## Posting rules (unchanged from show-hn.md)
- No "Hi HN", no hype words. Post Tue–Thu 8–10am US Pacific. Be present the first 2 hours. Acknowledge criticism, don't get defensive.
- Submit URL: `https://wmcp.sh/connect` or `https://wmcp.sh/mcp/grade` (lead them to a verb, not the brand root).
