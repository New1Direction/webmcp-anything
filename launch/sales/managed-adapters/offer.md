# Managed adapter offer — how to frame it

Who this is for: companies that **have a public API (or a tool-rich web app) but no official MCP server**, or only a community/beta one. Their customers are already asking "can I use you from Claude / ChatGPT / Cursor?", and the honest answer is "sort of, via someone's unmaintained GitHub repo."

This sells the **existing `/managed` ladder** at the existing prices. Don't invent tiers, discounts, trials, or "first month free" (AGENTS.md §3.7.2). If a prospect needs something off-ladder, write it down in the tracker and escalate. Don't improvise a price on a call.

| Package | Price (locked) | Sell it as |
|---|---|---|
| **Starter** | **$499 one-time** | "Your API, callable from every MCP client in 5 business days." |
| **Managed Retainer** | **$999/mo** | "We own your MCP surface: custom adapter, drift monitoring, new MCP spec versions, priority Slack." |
| Enterprise | $4,999+/mo & setup | Only when they ask for `mcp.<theirbrand>.com`, their own OAuth branding, or an SLA. |

Never call the $999 tier "Pro". Pro is the $99/mo self-serve API plan, which every package already includes.

---

## The one-line positioning

> Your API already does the work. We make it callable by agents: curated, authenticated, monitored, under your control. $499 to launch, $999/mo if you want us to run it.

## Why not "just build it yourselves"

Expect this objection first. Answer it with specifics, not hype:

1. **An auto-generated server isn't a good server.** Dumping 150 operations into an agent's context makes tool selection worse. The work is *curation*: picking the 8–15 tools agents actually need, writing descriptions an LLM can route on, collapsing multi-call workflows into one tool, and gating write operations. `tool_preview.mjs` gives the raw numbers for their spec. Use them.
2. **MCP keeps moving.** The worker already negotiates four protocol revisions (`2024-11-05` → `2025-11-25`). Keeping a server conformant is ongoing work, and nobody on their roadmap owns it.
3. **The community server is already their de facto official one.** If a stranger's repo is what their users install, that repo controls their auth story and their tool descriptions.
4. **Time-to-value.** A raw preview endpoint exists today on wmcp.sh (`/mcp/u/<encoded-spec>`). Starter turns it into something they'd put in their own docs within a week.

## What each package delivers, mapped to an API company

The `/managed` page is written for storefronts and websites. For an API company, here is how the same scope applies. All of it is on the live page, so nothing is promised that isn't already sold:

**Starter — $499 one-time (5 business days)**
- AI-readability audit of their API surface: the `tool_preview.mjs` numbers plus a written review of descriptions, naming, and auth (PDF).
- OpenAPI ingestion + tool generation, curated to a recommended tool set (≤ 15 tools) with rewritten descriptions.
- A hosted MCP endpoint on wmcp.sh for that curated set (`/mcp/u/…` or a `/mcp/set/…` toolset).
- Listing in `/directory` for agent discovery.
- 30-day support window, plus the wmcp.sh Pro API plan for 3 months.
- *Fulfilment extras (within scope, but not listed on the page; confirm capacity before promising):* a test run in two MCP clients, and copy-paste snippets for their docs ("Use <Company> from Claude / Cursor").

**Managed Retainer — $999/mo (2–3 week ramp)**
- Everything in Starter.
- **Custom adapter** where the spec isn't enough: composite workflow tools, non-OpenAPI endpoints, pagination and rate-limit handling, write-op guards.
- If they have no OpenAPI spec, we write one. (Live page: "we ship one if missing".)
- Monitoring of their MCP surface and agent traffic by source. Their spec changes; we catch the drift before their users do.
- Quarterly review + new MCP capabilities as the standard evolves.
- Priority Slack, 4-business-hour response.

**Enterprise — only on request:** a white-label `mcp.<brand>.com`, an OAuth flow under their branding, and a 99.9% / 1-hour SLA.

## Which package to lead with

| Prospect signal | Lead with |
|---|---|
| Small team, clean OpenAPI spec, mostly read workflows | Starter, mention Retainer as "if you want us to own it" |
| No spec, or a spec that clearly lags the docs | Retainer (we write the spec + adapter) |
| Lots of write ops (money, mail, shipments, hiring decisions) | Retainer: guarded writes and monitoring are the value |
| They ask about their own domain or OAuth, or have a security review | Enterprise. Book a call. Don't quote by email. |
| Already shipping an official MCP server | Not a managed lead. Hand off to the trust-grade play in `launch/grade-outbound.md`. |

## Guarantees and terms (from the live page, quote verbatim)

- 30-day satisfaction guarantee on Starter and Managed Retainer: if deliverables don't meet the agreed scope, we refund pro-rata.
- NDA available for Managed Retainer and Enterprise; Starter uses a standard mutual confidentiality clause.
- Payment by Stripe invoice or card. Intake form at `https://wmcp.sh/managed#contact`.

## Claims we must not make

- That we're affiliated with or endorsed by Anthropic, OpenAI, Google, etc. Every outbound draft that names them says "wmcp.sh is not affiliated with …" in the P.S.
- That a competitor's or a community server is "broken", "insecure", or "abandoned". Say "unofficial" or "not maintained by you", and cite the observable fact (last commit date, star count).
- Per-call latency numbers. If they ask, quote cold-start vs warm accurately.
- Customer logos or case studies we don't have.
