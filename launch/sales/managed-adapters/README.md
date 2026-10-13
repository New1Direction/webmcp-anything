# Managed-adapter sales pipeline

Outbound for the `/managed` service, aimed at companies with a public API but no official MCP server (or a weak one). This is separate from the trust-grade outbound (`launch/grade-outbound.md`, `launch/verified-pitch.md`), which targets companies that *already* run an MCP server.

| File | What it is |
|---|---|
| [`leads.md`](./leads.md) | Wave 1: 11 ranked, evidence-linked leads, each with a buyer role, adapter tool design, package, and outreach drafts. Also a watchlist (7), a disqualified list routed to the grade play (14), and a wave-2 pool. |
| [`offer.md`](./offer.md) | How to frame Starter $499 / Managed Retainer $999/mo for an API company: positioning, "why not DIY", which package to lead with, and claims we must not make. |
| [`playbook.md`](./playbook.md) | The repeatable loop: 5-point qualification gate, scoring, research steps, message structure, follow-up cadence, compliance, objection handling. |
| [`tracker.csv`](./tracker.csv) | Outreach tracker seeded with wave 1 (stage `ready` / `researched`, 0 touches). Import into a sheet or CRM. Person-level contact details go there, never into git. |
| [`tool_preview.mjs`](./tool_preview.mjs) | Offline spec preview using the same `adapters/openapi.js` the worker uses: operation count, undocumented ops, bad base URLs, sample tool names. It does not call wmcp.sh, so no public `/u/*` page is created for a prospect. |

```bash
node launch/sales/managed-adapters/tool_preview.mjs <openapi-json-url-or-file> [--json]
```

**Ground rules:** nothing here has been sent. A human picks the channel, reviews the draft, and sends it. Prices are the locked `/managed` ladder (AGENTS.md §3.7.2). The $999 tier is "Managed Retainer", never "Pro".

**Wave 1 order of work:** Toggl Track → Lob → Lever → Copper → EasyPost → Discogs, then the rest. Re-verify MCP status on the day you send. Four of the 32 screened companies shipped or went GA with official servers since September 2026 (Freshdesk, FreshBooks, Capsule, Front).
