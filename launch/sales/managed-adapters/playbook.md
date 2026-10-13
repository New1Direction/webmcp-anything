# Managed-adapter outbound playbook

A repeatable loop for finding, qualifying, and pitching companies that should have an MCP server but don't. Each pass takes about 2 hours for 10 leads. Run it weekly. Prospect status changes fast: a "no MCP" lead in October can ship an official server in November.

> **Nothing in this folder has been sent.** Every draft is a draft. A human chooses the channel, reviews the copy, and sends it. Log every send in `tracker.csv` the same day.

---

## 1. Qualify (the 5-point gate)

A lead goes into `leads.md` only if all five hold, each with a URL captured on the day you checked:

| # | Check | Evidence to capture |
|---|---|---|
| 1 | **Public API** with docs anyone can read | docs URL |
| 2 | **No strong official MCP server.** Acceptable: none, community-only, or official-but-limited (read-only, beta, a subset of the API) | search results + docs/changelog/GitHub org URL |
| 3 | **Agent-shaped workflows**: things a user would plausibly ask an agent to do ("log my hours", "send this letter", "move this candidate to onsite") | 5+ concrete endpoints |
| 4 | **Budget signal**: paid product, real customer base, an integrations/partner program | pricing / customers / partner page URL |
| 5 | **A reachable role channel** that the company itself publishes: partner program, developer forum, `partners@`/`developers@` on their own site, public GitHub org | URL |

**Disqualify** if they have a strong official MCP server. Move them to the trust-grade play (`launch/grade-outbound.md`) instead. Their server can be graded, and they're a Verified/Monitoring prospect.

### Scoring (out of 10)

- +3 published OpenAPI spec (JSON preferred: `tool_preview.mjs` runs on it as-is)
- +2 no official MCP at all (+1 if only community or limited official)
- +2 write workflows with real user value (send, ship, book, schedule, invoice)
- +2 partner / integrations program or marketplace (they already pay for distribution)
- +1 recent API investment (changelog entries in the last 6 months)
- −2 the API is gated behind sales or enterprise contracts (harder to demo)

Rank by score, then by how sharp the hook is.

## 2. Research a lead (≈10 min each)

1. Search `"<company>" MCP server`, `"<company>" "model context protocol"`, then check their docs search, changelog, blog, and GitHub org. Record status + URLs.
2. Find the spec. Common paths: `/openapi.json`, `/swagger.json`, `/v1/openapi`, a "Download OpenAPI" button in the docs, or `github.com/<org>/*openapi*`.
3. Run the offline preview. This runs the same adapter the worker uses, but **does not hit wmcp.sh**, so no public `/u/*` page gets created for a company that hasn't agreed to one:
   ```bash
   node launch/sales/managed-adapters/tool_preview.mjs <spec-url>
   ```
   The output gives you the hook: operation count, how many are undocumented, how many writes need guarding.
4. Pick 5–8 tools you'd actually ship, named after real endpoints.
5. Find the **role**, not the person. Typical buyers:
   - **Head of Developer Relations / Developer Experience**: owns "where devs use our API". Best first touch.
   - **Product lead for Platform / Integrations / Ecosystem**: owns the integrations marketplace. Best for Retainer.
   - **Partnerships lead**: when the company has a formal partner program; route through the program page.
   - **CTO / co-founder**: only at companies under ~100 people.
6. Write the hook: one specific, true, checkable sentence (a community repo, a changelog entry, a spec number).

**PII rule:** this repo is private but planned to go public. Store roles and public company channels only. **No personal names, personal emails, or phone numbers** in any committed file. Keep person-level contact details in the tracker you send from (CRM, a private sheet), never in git.

## 3. Write the outreach

Structure, always under 130 words:

1. **Line 1, their world:** the hook (a fact about *their* API or users).
2. **Line 2, the gap:** "There's no official MCP server, so <who> are using <workaround>."
3. **Line 3, proof we did homework:** "Your spec has N operations. I'd ship these 6 as tools: …"
4. **Line 4, offer:** the Starter or Retainer framing from `offer.md`, with the price stated once.
5. **Line 5, low-friction ask:** "Want me to send the preview endpoint?" (not "book a 30-min call").
6. **P.S.:** the affiliation disclaimer when you name Anthropic / OpenAI / Cursor / etc.

Tone: independent engineer who already did the work. No superlatives, no false urgency, no "I noticed you're not AI-ready". Never disparage a community maintainer. Many of them would be great collaborators, or want the work.

### Follow-up sequence

| Day | Touch | Content |
|---|---|---|
| 0 | First touch | The drafted message |
| 4 | Bump | One line + one new fact (e.g. the sample tool list, a screenshot of it in Claude) |
| 11 | Value drop | Send the curated tool list as a gist or PDF, free, no ask |
| 21 | Close the loop | "I'll stop here. The preview stays up if it's ever useful." Then mark `closed-no-reply`. |

Max 4 touches per lead per quarter. Stop immediately on any "not interested", and record it.

### Channel order

1. The company's partner or integrations program form (they've asked to be contacted this way)
2. Their developer forum or community, *only* if a thread is already asking for MCP. Reply helpfully and disclose that we sell this.
3. A role address published on their own site (`partners@`, `developers@`, `api@`)
4. LinkedIn / X DM to the role holder (look them up at send time; don't commit names)

Don't open GitHub issues on their repos to pitch. That's spam to their maintainers.

## 4. Compliance

- Cold B2B email: include a physical mailing address and a working opt-out line (CAN-SPAM). For EU/UK recipients (wave 1: Toggl in Estonia; watchlist: Personio, Capsule), use a role address or the company's own contact channel, cite legitimate interest, and honor opt-outs immediately.
- Footer for every cold email:
  ```
  --
  wmcp.sh · {business mailing address}
  Not relevant? Reply "no thanks" and I won't follow up.
  ```
- Send from a wmcp.sh role address (e.g. `hello@wmcp.sh`), not a personal inbox.
- One person per company at a time. No parallel blasts to several employees.

## 5. Track

`tracker.csv` columns:

| column | meaning |
|---|---|
| `rank` | from `leads.md` |
| `company`, `domain` | |
| `segment` | e.g. time-tracking, shipping, ATS |
| `mcp_status` | `none` / `community-only` / `weak-official` (re-check before every touch) |
| `spec_url` | OpenAPI URL, or blank |
| `fit_score` | 1–10 |
| `buyer_role` | role, never a name |
| `channel` | partner-form / forum / role-email / dm |
| `package` | starter / retainer / enterprise |
| `stage` | see below |
| `last_touch`, `next_touch` | ISO dates |
| `touches` | integer, max 4/quarter |
| `verified_on` | date the qualification evidence was last checked |
| `notes` | objections, replies, disqualification reason |

Stages: `researched → ready → contacted → replied → call-booked → proposal-sent → won-starter / won-retainer / lost / closed-no-reply / disqualified`

Weekly review: re-verify `mcp_status` for every lead in `ready` or `contacted`, then pipeline math: contacted → replied → call → won. Expect single-digit reply rates on cold outbound. A sharp, specific hook is what moves that number, not volume.

## 6. Objection handling

| They say | You say |
|---|---|
| "We're building our own MCP server." | "Great. Then the Starter audit is a spec review for your team: which 12 tools to ship and how to describe them. $499, 5 days, and you keep everything." |
| "There's already a community server." | "Yes, and it's what your users are installing. Do you want them depending on a repo you don't control? We can work with the maintainer, or ship one you own." (Never criticize the maintainer.) |
| "Our API isn't stable enough." | "That's the case for the Retainer: we track spec changes and update the tools, so agents don't break when you ship." |
| "Security review?" | "Credentials are stored AES-GCM encrypted. Enterprise adds your own OAuth and domain. Happy to answer your questionnaire." |
| "We'd rather wait for MCP to settle." | "The protocol has had four revisions since 2024. Waiting means rebuilding later anyway. The Retainer includes tracking new revisions." |
| "Too expensive." | Don't discount. Restate scope. Offer Starter only, or point to self-serve (`/dashboard`, Builder $39/mo) if they want to DIY. |

## 7. Refreshing the list

When a lead goes stale (official MCP ships, no reply after 4 touches), replace it from the candidate pool at the bottom of `leads.md`, or from `ADAPTERS_WANTED.md` (where the developer demand is). Re-run the gate. Commit the updated `leads.md` with a `sales:` prefixed message.
