# Managed-adapter leads: wave 1 (verified 2026-10-13)

32 candidates screened against the 5-point gate in `playbook.md`: **11 qualified, 7 on a watchlist, 14 disqualified**. Most of the disqualified companies shipped an official MCP server between May and October 2026. The window for "you don't have one yet" is closing, so work this list in the next 2–3 weeks and re-check MCP status before every touch.

**Status: nothing has been sent.** Drafts only. Every email also gets the compliance footer from `playbook.md` §4. `{sender}` = your name, signed from a wmcp.sh role address. Look up the person holding the buyer role at send time and keep their name out of git (see the PII rule in `playbook.md`).

Evidence tags: **[L]** = page loaded and read on 2026-10-13. **[S]** = seen in search results only. Company-size figures are third-party estimates. Treat them as order-of-magnitude.

`preview` numbers come from `node launch/sales/managed-adapters/tool_preview.mjs <spec>`. It runs offline, so nothing is published on wmcp.sh.

---

## Ranked list

| # | Company | Segment | MCP status | Spec | Fit | Lead package | Buyer role |
|---|---|---|---|---|---|---|---|
| 1 | **Toggl Track** | time tracking | none for Track (official MCP is Toggl 2.0 only) | ✅ Swagger 2.0 | 9 | Retainer | Head of Product, Track / Platform & Integrations lead |
| 2 | **Lob** | print & mail API | community-only | ✅ OpenAPI 3.0.3 | 8 | Retainer | VP Product (Platform/API) / Head of Technology Partnerships |
| 3 | **Lever** (Employ) | ATS | community-only | ❌ Postman only | 8 | Retainer | VP Product, Platform & Integrations / Partnerships lead |
| 4 | **Copper** | CRM (Google Workspace) | community-only | ❌ Postman only | 8 | Retainer | VP Product, Platform & Integrations / Partnerships lead |
| 5 | **EasyPost** | shipping API | community/gateway-only | ❌ none found | 7 | Retainer | VP Product (API Platform) / Head of Partnerships |
| 6 | **Discogs** | music marketplace | community-only | ❌ community spec only | 7 | Starter → Retainer | VP Product / Engineering lead, Marketplace & API |
| 7 | **Harvest** (Bending Spoons) | time tracking & invoicing | community-only | ❌ Postman only | 6 | Starter | Product / Engineering lead |
| 8 | **Acuity Scheduling** (Squarespace) | scheduling | community/gateway-only | ⚠️ per-endpoint OpenAPI in docs, no file | 6 | Retainer | Product lead, Scheduling integrations |
| 9 | **FreshBooks** | accounting | weak-official (read-only, Claude-only) | ❌ Postman only | 5 | Starter (write-tool spec + other clients) | Head of Platform / Developer Ecosystem |
| 10 | **ShipStation** (Auctane) | shipping | weak-official (local MVP, docs-only hosted) | ⚠️ download listed, file unconfirmed | 5 | Enterprise-shaped: hosted remote | Director of Product, API & Developer Platform |
| 11 | **Eventbrite** (Bending Spoons) | events/ticketing | community-only | ❌ API Blueprint only | 5 | Starter | Platform / API product lead |

Tiebreaks at 8: Lob ranks above Lever and Copper because it has a published spec (a faster, more credible preview), and its write operations cost real money, which makes our guarded-write pitch concrete.

---

## 1. Toggl Track (toggl.com/track): fit 9

**Why now:** Toggl shipped an official MCP server this year, but it covers **Toggl 2.0 only**: "Both tools work with Toggl 2.0 workspaces on production" ([docs.toggl.com/toggl-mcp-and-cl](https://docs.toggl.com/toggl-mcp-and-cl) [L]). Track users asked for one on Toggl's own forum on 2026-02-17: [feature request, 34 likes, 11 replies](https://community.toggl.com/t/feature-request-official-toggl-track-mcp-server/4227) [L]. Support replied once (2026-02-20: "will share with the team"). The latest replies (2026-09-13/14) are still asking. Community servers fill the gap ([lobehub](https://lobehub.com/mcp/gpeden-lf-mcp-server-toggl) [S], [pulsemcp](https://www.pulsemcp.com/servers/souravpn-toggl-track) [S]).

**Evidence**
- API docs: [engineering.toggl.com/docs/track](https://engineering.toggl.com/docs/track/) [L]. Spec page: [/docs/track/openapi](https://engineering.toggl.com/docs/track/openapi/) [L].
- Spec: [Track API v9, Swagger 2.0](https://engineering.toggl.com/assets/files/api-fb7996e774ae61b08ea11c9c1b2f32ef.json) [L], plus a [Reports spec](https://engineering.toggl.com/assets/files/reports-c9bb77e23d0637e43ddfd60a0134437d.json) [L].
- Company: bootstrapped, Tallinn, ~120–150 staff, ~$30M+ ARR (estimates: [getlatka](https://getlatka.com/companies/toggl) [S], [tracxn](https://tracxn.com/d/companies/toggl/__dnr92TJrIv_6kkW2cBu4Lj_WhS-cRtHZbab-KcgHPS4) [S]).
- Channels: [toggl.com/track/contact](https://toggl.com/track/contact/) (linked from the docs), the community forum, [github.com/toggl](https://github.com/toggl) [S].

**Preview:** the Track spec yields **283 operations** (160 non-GET, 30 with no operationId). It declares `host: localhost:8080`, so a naive generator emits a server pointing at `https://localhost:8080/api/v9`. All 36 Reports operations are POST with no operationId. This is the curation argument made concrete.

**Adapter opportunity (8 tools)**
| Tool | Endpoint |
|---|---|
| `start_timer` | `POST /workspaces/{workspace_id}/time_entries` |
| `stop_timer` | `PATCH /workspaces/{workspace_id}/time_entries/{time_entry_id}/stop` |
| `current_timer` | `GET /me/time_entries/current` |
| `edit_entries` | `PATCH /workspaces/{workspace_id}/time_entries/{time_entry_ids}` |
| `list_projects` / `create_project` | `/workspaces/{workspace_id}/projects` |
| `list_clients` | `/workspaces/{workspace_id}/clients` |
| `summary_report` | `POST /reports/api/v3/workspace/{workspace_id}/summary/time_entries` |
| `search_entries` | `POST /reports/api/v3/workspace/{workspace_id}/search/time_entries` |

Auth: HTTP Basic with an API token. **Gotcha:** plan-based hourly quotas (Free 30/h; `/me` is 30/h on every plan), and over-quota returns **402**, not 429. The server needs caching plus a quota-aware error message. This is exactly the work a raw generator skips.

**Package:** Managed Retainer ($999/mo). They have two products, an existing Toggl 2.0 MCP to stay consistent with, and quota semantics to maintain.

**Draft: first touch (product contact form / role email)**
```
Subject: A Track MCP server, built from your own Swagger file

Hi {first_name},

Your Toggl 2.0 MCP server is out, but the Track request on your community
forum (34 likes, started Feb 17) is still open, and the newest replies from
September are still asking.

I ran your published Track v9 spec through our generator: 283 operations,
and the spec's host is localhost:8080, so a naive auto-generated server
calls localhost. The useful surface is about 8 tools: start/stop timer,
current timer, edit entries, projects, clients, summary and search reports,
with your 402 quota responses turned into messages an agent can act on.

wmcp.sh builds and runs that for you: $499 to launch, or $999/mo and we
maintain it as your API changes. Want me to send the curated tool list?

— {sender}, wmcp.sh
P.S. wmcp.sh is independent, not affiliated with Anthropic, OpenAI or Cursor.
```
**Day-4 bump:** "One more detail: your Reports spec is 36 POST operations with no operationIds, so generated tool names come out as `post__reports_api_v3_…`. That naming is the part we'd hand-write. Happy to send the list."

---

## 2. Lob (lob.com): fit 8

**Why now:** The most complete Lob MCP server today is [optimize-overseas/lob-mcp](https://github.com/optimize-overseas/lob-mcp) [L]: 78 tools, 0 stars, and its README says "not affiliated with, endorsed by, or sponsored by Lob.com". Hosted wrappers exist via Zapier, Pipedream and MCPBundles [S]. I found no MCP mention on lob.com [S].

**Evidence**
- Docs: [docs.lob.com](https://docs.lob.com/) [L]. Spec: [lob/lob-openapi `dist/lob-api-bundled.yml`](https://raw.githubusercontent.com/lob/lob-openapi/main/dist/lob-api-bundled.yml) [L] (OpenAPI 3.0.3, v1.22.0, YAML only).
- Company: Series C ($50M, 2021; [blog](https://www.lob.com/blog/series-c) [S]), ~400 staff (estimate [S]).
- Channels: [lob.com/partners](https://www.lob.com/partners) [L] (Technology partner track), [github.com/lob](https://github.com/lob) [L], and `lob-openapi@lob.com`, published on docs.lob.com [L].

**Preview** (YAML converted to JSON): **105 operations**, 61 non-GET, all with operationIds, base `https://api.lob.com/v1`. A clean spec, so a raw server works on day one. The work is choosing and guarding the writes.

**Adapter opportunity (8 tools)**
| Tool | Endpoint |
|---|---|
| `verify_address` | `POST /us_verifications` (+ `/intl_verifications`) |
| `autocomplete_address` | `POST /us_autocompletions` |
| `send_postcard` | `POST /postcards` |
| `send_letter` | `POST /letters` |
| `send_check` | `POST /checks` |
| `send_self_mailer` | `POST /self_mailers` |
| `address_book` | `/addresses` |
| `mail_status` | `GET /letters/{id}` / `GET /postcards/{id}` (tracking events) |

Auth: HTTP Basic with the API key as username. Separate `test_` and `live_` keys. **Gotcha:** every send costs real money and real postage, so we'd ship a preview → confirm two-step, idempotency keys, and test-key-by-default. The community server reached the same conclusion, which shows the need.

**Package:** Managed Retainer. The guarded-write design plus ongoing spec tracking (v1.22.0 and moving) is the value.

**Draft: first touch (partner form → Technology partner; or `lob-openapi@lob.com`)**
```
Subject: An official Lob MCP server, from your lob-openapi spec

Hi {first_name},

When someone asks Claude or ChatGPT to "send this letter through Lob"
today, the most complete MCP server they'll find is a third-party repo
that says it isn't affiliated with Lob.

Your lob-openapi v1.22.0 spec is clean (105 operations, all with
operationIds), so most of an official server already exists. The work is
the money path: verify_address → preview → confirm before
send_letter/postcard/check, test keys by default, idempotency on every
send.

wmcp.sh builds and runs that: $499 for the curated server, or $999/mo and
we track your spec and keep it current. Worth sending you the proposed
tool set?

— {sender}, wmcp.sh
P.S. wmcp.sh is independent, not affiliated with Anthropic or OpenAI.
```

---

## 3. Lever (lever.co, Employ Inc.): fit 8

**Why now:** Lever's direct competitors have official servers: Workable at `mcp.workable.com/mcp` with 94 tools ([docs](https://workable.readme.io/reference/workable-mcp-server) [L]), and Greenhouse in open beta ([setup article](https://support.greenhouse.io/hc/en-us/articles/52096319906971-Set-up-Greenhouse-MCP-with-supported-AI-tools) [L]). Lever has none: a July 2026 write-up says "Lever doesn't ship its own MCP server" ([usecarly](https://www.usecarly.com/blog/chatgpt-lever-integration/) [L]). The top community server, [stefanoamorelli/lever-mcp](https://github.com/stefanoamorelli/lever-mcp) [L], has 59 tools, 3 stars, and is "not endorsed by Lever or Employ".

**Evidence**
- Docs: [hire.lever.co/developer/documentation](https://hire.lever.co/developer/documentation) [L]. Base `https://api.lever.co/v1`, sandbox available.
- Spec: none official. A Postman collection is in [lever/integrator-resources](https://github.com/lever/integrator-resources) [L].
- Company: part of Employ (with JazzHR, Jobvite), 600+ staff [S]. [Partner program](https://www.lever.co/partners/) [L] with "Become a Partner" and a marketplace.

**Adapter opportunity (8 tools)**: `search_candidates` (`GET /opportunities`), `get_candidate` (`GET /opportunities/:id`), `add_note` (`POST /opportunities/:id/notes`), `advance_stage` (`PUT /opportunities/:id/stage`, with stage IDs from `GET /stages`), `list_postings` (`GET /postings`), `interview_feedback` (`/opportunities/:id/feedback`), `list_interviews`, `list_offers`. *Check the exact paths against the reference before sending; they were taken from the docs summary.* Auth: API key (Basic), or OAuth2 for partners. 10 req/s per key, `next`/`hasNext` pagination, signed webhooks.

**Package:** Managed Retainer. We'd write the OpenAPI spec ("we ship one if missing") plus the adapter. Mention Enterprise only if they want it under their own OAuth/brand. Their partner OAuth model suggests they might.

**Draft: first touch (partner program form)**
```
Subject: Lever is the ATS agents can't reach (yet)

Hi {first_name},

Workable now runs a 94-tool official MCP server, and Greenhouse has one in
open beta. For Lever, recruiters connecting Claude or ChatGPT today use
community repos. The most complete has 59 tools and says it isn't endorsed
by Lever.

The workflows recruiters ask agents for map cleanly onto your v1 API:
search candidates, add a note, advance a stage, pull interview feedback,
list open postings. That's an 8-tool server with stage changes gated
behind confirmation.

wmcp.sh builds and runs it. We'd also write the OpenAPI spec you don't
publish yet. $999/mo managed, or $499 for a scoped first version. Open to
seeing the tool design?

— {sender}, wmcp.sh
P.S. wmcp.sh is independent, not affiliated with Anthropic or OpenAI.
```

---

## 4. Copper (copper.com): fit 8

**Why now:** developer.copper.com has no mention of MCP or agents [L]. At least three independent `copper-mcp` repos exist, one updated 2026-10-06 ([glama: OfirOhan/copper-mcp](https://glama.ai/mcp/servers/OfirOhan/copper-mcp) [S], [hasankhadra/copper-mcp](https://glama.ai/mcp/servers/hasankhadra/copper-mcp) [S]), plus hosted wrappers [S]. Copper's position is "the CRM inside Google Workspace". Gemini and Claude users living in Gmail are exactly who would call it.

**Evidence**
- Docs: [developer.copper.com](https://developer.copper.com/) [L] (Leads, People, Companies, Opportunities, Projects, Tasks, Activities, Webhooks, …). Postman collections, no spec. A community spec is in [api-evangelist/copper](https://github.com/api-evangelist/copper) [L].
- Company: "30,000+ companies" ([partners page](https://www.copper.com/partners) [L]), Series C, GV-backed [S].
- Channels: [copper.com/partners](https://www.copper.com/partners) [L] (Integration partners track; its "Apply" buttons currently link to `#`, so use the site contact form).

**Adapter opportunity (7 tools)**: `search_opportunities` (`POST /opportunities/search`), `search_people` (`POST /people/search`), `search_companies`, `move_opportunity_stage` (`PUT /opportunities/{id}`), `create_task` / `list_tasks`, `log_activity` (Activities), `subscribe_webhook`. Auth: `X-PW-AccessToken` + `X-PW-Application: developer_api` + `X-PW-UserEmail` headers, or OAuth2. 180 req/min rolling. Search is POST with `page_number`/`page_size`.

**Package:** Managed Retainer: spec + adapter + monitoring.

**Draft: first touch (contact form, Partnerships)**
```
Subject: At least three Copper MCP servers exist. None of them is Copper's.

Hi {first_name},

There are at least three independent copper-mcp repos (one pushed Oct 6),
plus hosted wrappers. Your Workspace-native users are wiring agents into
Copper; they're just doing it through code you don't control.

Your developer API already covers what they want: search people and
opportunities, move a deal stage, log an activity, create a task. That's a
7-tool server with your three-header auth handled and writes confirmed.

wmcp.sh builds and runs it, and writes the OpenAPI spec you'd need anyway:
$999/mo managed, or $499 to launch a scoped first version. Can I send the
tool design?

— {sender}, wmcp.sh
P.S. wmcp.sh is independent, not affiliated with Google, Anthropic or OpenAI.
```

---

## 5. EasyPost (easypost.com): fit 7

**Why now:** No first-party server found ([search](https://www.pulsemcp.com/servers/pipeworx-easypost) [S]). The options are a 2-tool rates/track gateway ([pipeworx-io/mcp-easypost](https://github.com/pipeworx-io/mcp-easypost) [L]), MCPBundles (says it isn't affiliated) [S], and Pipedream [S]. Competitor Easyship launched an official MCP server on 2026-04-30 (25 tools, remote at `mcp.easyship.com`; [blog](https://www.easyship.com/blog/easyship-mcp-server) [S], [docs](https://developers.easyship.com/docs/easyship-mcp-server) [S]).

**Evidence:** docs [docs.easypost.com](https://docs.easypost.com/) [L]. No OpenAPI spec found; the GitHub org shows client libraries only [L]. Valued at $1.5B in 2021 ([sacra](https://sacra.com/c/easypost/) [S]). [Partner program](https://www.easypost.com/partners) [L] (white-label + referral), plus a sales page.

**Adapter opportunity (8 tools)**: `rate_shipment` (`POST /v2/shipments`), `buy_label` (`POST /v2/shipments/:id/buy`), `list_shipments`, `convert_label` (`GET /v2/shipments/:id/label`), `verify_address`, `track_package`, `create_batch` / `scan_form`, `schedule_pickup`. *Exact paths for the last four are unconfirmed.* Auth: Basic with the API key (free test keys). `before_id`/`after_id` pagination. `buy_label` spends money, so it needs confirm-before-buy.

**Package:** Managed Retainer (no spec, so we write one; money-moving writes).

**Draft: first touch (partners page → talk to EasyPost)**
```
Subject: Easyship has an MCP server; EasyPost's are third-party

Hi {first_name},

Easyship shipped an official MCP server in April. For EasyPost, what
exists today is third-party: a 2-tool rates-and-tracking gateway and a few
hosted wrappers that say they aren't affiliated with you.

The agent version of your API is small and valuable: rate a shipment, buy
the label (with a confirm step), track, verify an address, batch and
schedule a pickup. About 8 tools.

wmcp.sh builds and runs it, including the OpenAPI spec you don't publish
yet. $999/mo managed, or $499 for a scoped launch. Want the tool design?

— {sender}, wmcp.sh
P.S. wmcp.sh is independent, not affiliated with Anthropic or OpenAI.
```

---

## 6. Discogs (discogs.com): fit 7

**Why now:** The leading server is [cswkim/discogs-mcp-server](https://github.com/cswkim/discogs-mcp-server) [L], a personal project with 128 stars. API Evangelist counts "five plus community MCP servers" ([profile](https://github.com/api-evangelist/discogs) [S]), and a 2026-10-03 blog post covers the community server [S]. I found nothing from Discogs itself.

**Evidence:** API root [api.discogs.com](https://api.discogs.com/) [L] (v2). The developer docs returned 403 to automated fetches; open them in a browser before sending. No official spec; a community OpenAPI 3.1.1 file exists ([wyattowalsh/discogs-api-spec](https://raw.githubusercontent.com/wyattowalsh/discogs-api-spec/main/discogs.json) [L]). Zink Media, LLC, ~100–175 staff [S].

**Adapter opportunity (8 tools)**: `search_database` (`/database/search`), `get_release` (`/releases/{id}`), `master_versions` (`/masters/{id}/versions`), `artist_releases`, `marketplace_listing` (`/marketplace/listings/{id}`), `seller_inventory` (`/users/{username}/inventory`), `collection_add` / `collection_list`, `wantlist_add`. Auth: OAuth 1.0a or a personal token. A custom User-Agent is required, and rate limits are tight. The community server already dropped its page size to 5, because 50 swamps clients.

**Package:** Starter first (a curated read set plus collection/wantlist), with Retainer for marketplace writes.

**Draft: first touch (Discogs API forum / developer contact)**
```
Subject: The Discogs MCP server collectors use is a side project

Hi {first_name},

The most-used Discogs MCP server (128 stars) is a personal side project,
and several others exist. Collectors and sellers are clearly
wiring agents to your API; there just isn't an official path.

An official server would be small: search, release and master versions,
marketplace listing, seller inventory, collection and wantlist. It would
set page sizes and User-Agent handling so it stays inside your rate
limits, instead of every hobby server hitting you differently.

wmcp.sh can launch that for $499 and run it for $999/mo if you want it
maintained. Interested in the tool list?

— {sender}, wmcp.sh
P.S. wmcp.sh is independent, not affiliated with Anthropic or OpenAI.
```

---

## 7. Harvest (getharvest.com): fit 6

**Why now:** There are several unofficial servers. The most complete, [ianaleck/harvest-mcp-server](https://github.com/ianaleck/harvest-mcp-server) [L] (8 stars, ~54 tools), says it is "not affiliated with, endorsed by, or sponsored by Harvest or Forecast". Another is [southleft/harvest-mcp](https://github.com/southleft/harvest-mcp) [S].
**Evidence:** [API v2 docs](https://help.getharvest.com/api-v2/) [L]. No official spec. Acquired by Bending Spoons in July 2025 ([wikipedia](https://en.wikipedia.org/wiki/Harvest_(software)) [L]). No formal partner program found; [integrations directory](https://www.getharvest.com/integrations) [S].
**Adapter opportunity:** `log_time` (`POST /v2/time_entries`), `list_time_entries`, `restart_timer` / `stop_timer` (`PATCH /v2/time_entries/{id}/restart|stop`), `uninvoiced_report` (`GET /v2/reports/uninvoiced`), `get_project`, `list_invoices` / `create_invoice`. Gotchas: `Harvest-Account-Id` and `User-Agent` headers are required. Reports are limited to 100 requests per 15 **minutes**, against 100 per 15 seconds for everything else.
**Package:** Starter. Bending Spoons is cost-disciplined, so lead with the one-time price.
**Draft:**
```
Subject: Harvest's MCP servers are all unofficial

Hi {first_name},

Freelancers and agencies are asking Claude to "log 2 hours to the Acme
project" and "what's uninvoiced this month?" The servers that answer today
are unofficial; the most complete says it isn't affiliated with Harvest.

An official one is about 7 tools on API v2, and the details matter: your
reports endpoints allow 100 requests per 15 minutes, not 15 seconds, so an
agent hammering them needs caching.

wmcp.sh can ship that as a one-time $499 setup, hosted, with the curated
tools and a 30-day support window. Want the tool list?

— {sender}, wmcp.sh
P.S. wmcp.sh is independent, not affiliated with Anthropic or OpenAI.
```

---

## 8. Acuity Scheduling (Squarespace): fit 6

**Why now:** No vendor server. Options are a community repo ([BusyBee3333/acuity-scheduling-mcp-2026-complete](https://github.com/BusyBee3333/acuity-scheduling-mcp-2026-complete) [L], 46 tools, 0 stars), Zapier, and Pipedream [S]. Their developer hub already publishes [llms.txt](https://developers.acuityscheduling.com/llms.txt) [L], so they're investing in machine-readable docs.
**Evidence:** [developers.acuityscheduling.com](https://developers.acuityscheduling.com/) [L]. API requires the Premium plan [S]. Parent Squarespace, taken private by Permira [S]. Only channel found: the support form linked from the developer hub.
**Adapter opportunity:** the booking flow. `list_appointment_types` (`/appointment-types`) → `find_dates` (`/availability/dates`) → `find_times` (`/availability/times`) → `check_slot` (`POST /availability/check-times`) → `book` (`POST /appointments`) → `reschedule` (`PUT /appointments/:id`). Auth: Basic (user ID + key), or OAuth2.
**Package:** Retainer, but expect a corporate cycle. Low-effort first touch; if it goes nowhere, route to Squarespace partnerships.
**Draft:**
```
Subject: Letting agents book Acuity appointments, the official way

Hi {first_name},

"Book me the next open slot with my physio" is one of the most natural
things to ask an agent, and Acuity's API already does it in five calls:
appointment types → dates → times → check → book. Today agents reach it
through a community repo or generic wrappers.

You already publish an llms.txt for the developer hub. An official MCP
server is the next step: those six tools, with check-before-book built in.

wmcp.sh builds and runs it ($999/mo managed, or $499 for a scoped launch).
Who on the Scheduling team would own this?

— {sender}, wmcp.sh
P.S. wmcp.sh is independent, not affiliated with Anthropic or OpenAI.
```

---

## 9. FreshBooks: fit 5 (weak-official)

**Gap:** the official connector launched 2026-09-25 ([press](https://www.freshbooks.com/press/releases/freshbooks-anthropicmcpconnector) [L]). It is "currently read-only", with write permissions listed as coming later, and it's described only as "the FreshBooks connector in Claude" ([help article](https://support.freshbooks.com/hc/en-us/articles/47907329443597-How-does-the-FreshBooks-connector-in-Claude-work) [L]).
**Channels:** `api@freshbooks.com` ([/api/start](https://www.freshbooks.com/api/start) [L]), [developers page](https://www.freshbooks.com/developers) [L].
**Angle:** don't compete with their roadmap. Offer the **Starter as a write-tool design review**: which writes to expose first, confirmation UX for `create_invoice` / `record_payment`, and a test run in ChatGPT and Cursor. Low odds, low effort.
**Draft:**
```
Subject: Write tools for the FreshBooks connector: a second pair of hands

Hi {first_name},

Congrats on the Claude connector launch. The help article says writes are
coming. That's the hard part (invoices and payments need confirmation
design, and the accountId vs businessId split trips agents up), and it's
work we do every week.

If it's useful, wmcp.sh's $499 Starter is a fixed-scope review: proposed
write tools, confirmation flows, and a test run in other MCP clients
beyond Claude. Happy to just send notes if you'd rather.

— {sender}, wmcp.sh
P.S. wmcp.sh is independent, not affiliated with Anthropic.
```

## 10. ShipStation (Auctane): fit 5 (weak-official)

**Gap:** the official [shipstation/mcp-shipstation-api](https://github.com/shipstation/mcp-shipstation-api) [L] has 53 tools and calls itself "an MVP implementation". It runs locally (stdio/docker) and requires the Scale-Gold plan or higher. The hosted [connect-mcp](https://docs.shipstation.com/connect-mcp) is documentation-only [L]. **Angle:** run their existing server as a **hosted remote endpoint**, usable from claude.ai and ChatGPT connectors. That's Enterprise-shaped (their domain, their OAuth). Book a call; don't quote by email.
**Draft:**
```
Subject: Hosting mcp-shipstation-api as a remote endpoint

Hi {first_name},

Your mcp-shipstation-api already covers 53 tools, but it runs locally, so
merchants on claude.ai or ChatGPT connectors can't use it. The only hosted
MCP is the docs server.

We run MCP servers as hosted, authenticated remote endpoints. Hosting
yours under your own domain and OAuth is the kind of thing we scope as an
Enterprise engagement. Worth a 20-minute call to see if it fits?

— {sender}, wmcp.sh
P.S. wmcp.sh is independent, not affiliated with Anthropic or OpenAI.
```

## 11. Eventbrite (Bending Spoons): fit 5

**Gap:** community-only ([stalinyang/eventbrite-mcp-server](https://github.com/stalinyang/eventbrite-mcp-server) [L], ~85 tools, 1 star) plus commercial gateways [S]. The API docs ([platform/api](https://www.eventbrite.com/platform/api) [L]) ship an API Blueprint, not OpenAPI. Bending Spoons completed the acquisition 2026-03-10 [S], so expect cost focus. Publishing is capped at 200 calls/hour [S].
**Adapter opportunity:** `list_org_events`, `list_attendees` (with `changed_since`), `list_orders`, `ticket_classes`, `manage_discounts`, `webhooks`.
**Package:** Starter only. Lowest priority: send after 1–8 are worked.
**Draft:**
```
Subject: Eventbrite has several community MCP servers and no official one

Hi {first_name},

Organizers are connecting agents to Eventbrite through community MCP
servers; the biggest exposes ~85 tools, more than an agent can use well.
The useful set is small: events, attendees (incremental via
changed_since), orders, ticket classes, discounts.

wmcp.sh can ship that as a one-time $499 setup: curated, hosted, and kept
inside your 200/hour publish limit. Want the tool list?

— {sender}, wmcp.sh
P.S. wmcp.sh is independent, not affiliated with Anthropic or OpenAI.
```

---

## Watchlist: weak official server, revisit monthly

Official server exists but has a clear gap. Don't cold-pitch now; re-check in November.

| Company | Gap (as of 2026-10-13) | Evidence |
|---|---|---|
| Help Scout | GA 2026-07-28, "intentionally read-only"; writes on the roadmap | [blog](https://articles.helpscout.com/blog/introducing-help-scout-mcp/) [L] |
| Clockify | Help page labelled "COMING SOON"; no approvals or expenses | [help](https://clockify.me/help/integrations-and-add-ons/use-clockify-mcp-server-to-connect-to-ai-agent) [L] |
| Personio | Gated beta via Account Managers; limited write | [OpenAPI index](https://developer.personio.de/openapi) [L] |
| Capsule CRM | Remote MCP 2026-09-25: search + create only, Growth plan+ | [changelog](https://developer.capsulecrm.com/v2/overview/announcements-and-changes) [L] |
| Podio | Official beta, "intended for evaluation and testing" | [docs](https://www.progress.com/podio/documentation/using-podio/podio-mcp-server) [L] |
| BambooHR | Hosted beta, "mostly read-only" | [docs](https://documentation.bamboohr.com/docs/mcp-server) [L] |
| Greenhouse | Open beta, read-only by default with write scopes | [support](https://support.greenhouse.io/hc/en-us/articles/52096319906971-Set-up-Greenhouse-MCP-with-supported-AI-tools) [L] |

## Disqualified: strong official MCP → route to the trust-grade / Verified play

These have shipped real servers, so they're prospects for grading and Verified (`launch/grade-outbound.md`, `launch/verified-pitch.md`), not for managed adapters. Grade their server at `wmcp.sh/mcp/grade/<host>` before any outreach.

| Company | Official server | Evidence |
|---|---|---|
| Workable | `mcp.workable.com/mcp`, 94 tools | [docs](https://workable.readme.io/reference/workable-mcp-server) [L] |
| Teamwork.com | `mcp.ai.teamwork.com`, R/W | [page](https://www.teamwork.com/ai/mcp/) [L] |
| Freshdesk | GA 2026-09-10, ~40 R/W tools (metered) | [support](https://support.freshdesk.com/support/solutions/articles/50000012670-model-context-protocol-mcp-integration-in-freshdesk-eap-) [L] |
| Front | GA 2026-10-06, ~27 tools, OAuth 2.1 | [docs](https://dev.frontapp.com/docs/mcp-server) [L] |
| Gorgias | Open beta, broad R/W | [docs](https://docs.gorgias.com/en-US/connect-your-ai-assistant-to-the-gorgias-mcp-6310546) [L] |
| Storyblok | `mcp.storyblok.com/mcp`, full Management API | [docs](https://www.storyblok.com/docs/tooling/mcp-server) [L] |
| DatoCMS | `mcp.datocms.com`, OAuth | [docs](https://www.datocms.com/docs/mcp-server) [L] |
| Rebrandly | Official, with a Claude connector | [docs](https://developers.rebrandly.com/docs/mcp-server) [L] |
| Basecamp | `basecamp mcp` in the official CLI; hosted pending | [repo](https://github.com/basecamp/basecamp-cli) [L] |
| Productboard | Official, full R/W, OAuth | [page](https://www.productboard.com/integrations/mcp-server/) [L] |
| Aha! | `[domain].aha.io/api/v1/mcp`, OAuth | [KB](https://support.aha.io/kb/support/remote-mcp-server-connection~7676632615369054131) [L] |
| Typeform | `api.typeform.com/mcp`, OAuth | [docs](https://www.typeform.com/developers/mcp/) [L] |
| Ticket Tailor | `mcp.tickettailor.ai/mcp` | [docs](https://developers.tickettailor.com/docs/mcp/) [L] |
| SurveyMonkey | Listed in its own app directory | [apps](https://www.surveymonkey.com/apps/) [L] |

## Candidate pool for wave 2 (unscreened)

Pull from these when a wave-1 lead closes. Run the full gate first: several are likely to have shipped since this list was written.

- **ATS:** Teamtailor, Recruitee, Ashby, Bullhorn. All four are listed as community-only in a 2026 recruiting roundup ([herohunt](https://www.herohunt.ai/blog/best-mcps-for-recruiting-in-2026/) [S]). This is the strongest wave-2 cluster, because Workable and Greenhouse have shipped and their competitors feel it.
- **Fulfilment / commerce ops:** ShipBob, Printful, Shippo.
- **CRM / scheduling:** Insightly, Nutshell, SimplyBook.me, Setmore.
- **Events / consumer data:** Cvent, Bandsintown, Strava, Yelp Fusion.
- **Storefront platforms from `ADAPTERS_WANTED.md`:** BigCommerce, Etsy, Squarespace Commerce.
