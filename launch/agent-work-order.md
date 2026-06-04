# Agent work order — point your AI agents at the moat

You have agents ready. The highest-leverage thing they can do is **grow the trust
graph**: grade every MCP server in existence. Each graded server = a leaderboard
row + an SEO page + a badge target + an AI-citation source + a node in the
continuously-watched reputation dataset (the acquisition asset). It compounds.

Three jobs, in priority order. Jobs 1–2 are pure API (agents run them headless).
Job 3 needs browser/account access.

---

## JOB 1 — Grade every MCP server (grows the moat) ★ highest leverage

### Option A — bulk firehose (best for thousands of URLs, no rate limit)
Agents collect MCP server URLs (sources below), then POST them in batches. The
cron grades a slice every 2h; they land on `/mcp/leaderboard` and enter the
drift watch. Admin-token gated (you have it — same token as seed-stores).

```
curl -X POST https://wmcp.sh/api/v1/admin/grade-servers \
  -H "x-admin-token: $ADMIN_TOKEN" \
  -H "content-type: application/json" \
  -d '{"urls":["https://server-a.com/mcp","https://server-b.com/sse", "..."]}'
```
Returns `{accepted, rejected, newly_added, queued_total}`. Queue holds up to
20,000. Re-POST as agents find more.

### Option B — grade now (immediate leaderboard entry, needs a read key)
For instant results, grade directly (persists + watches on the spot):
```
curl "https://wmcp.sh/api/v1/mcp/grade?url=https://server.com/mcp" \
  -H "authorization: Bearer $WMCP_KEY"
```
Mint a key at https://wmcp.sh/dashboard. Free tier is 100 reads/day/IP — use
Option A for big lists, Option B for priority servers you want up immediately.

### Where agents find MCP server URLs
- Official registry: `https://registry.modelcontextprotocol.io/v0/servers` (the cron already crawls this; agents can cover the long tail)
- GitHub: topic `mcp-server`, `modelcontextprotocol`; awesome lists (punkpeye/awesome-mcp-servers, etc.)
- Other registries: smithery.ai, glama.ai/mcp/servers, mcp.so, pulsemcp.com, mcp.run
- Any `*/mcp`, `*/sse`, `*/mcp/sse` endpoint they encounter
Only **remote** (https streamable-http / sse) URLs are gradeable — skip local/stdio-only.

**Target:** every public MCP server graded. That's the leaderboard becoming the
definitive index, which is the whole "be the place" thesis.

---

## JOB 2 — Grow the directory (any URL → MCP tools)
Agents feed product/API/site URLs; each becomes an indexed `/u/<...>` page.
```
curl "https://wmcp.sh/api/v1/tools?url=https://example.com/products/x" \
  -H "authorization: Bearer $WMCP_KEY"
```
Or queue store hostnames for the cron to harvest:
```
curl -X POST https://wmcp.sh/api/v1/admin/seed-stores \
  -H "x-admin-token: $ADMIN_TOKEN" -H "content-type: application/json" \
  -d '{"stores":["shop-a.com","shop-b.com"]}'
```

---

## JOB 3 — Distribution (needs browser/account access)
Hand the agents these kits and let them work the forms (respecting each site's
rules — never spam, never fake-upvote):
- `launch/mcp-registry-submissions.md` — list the Trust Oracle + hub on Smithery, mcp.so, Glama, PulseMCP, and the awesome-mcp-servers GitHub PR.
- `launch/directory-submission-kit.md` — AI/dev directories.
- `launch/post-today.md` — the free calculators in TCG communities (genuine, value-first).
- `launch/product-hunt-launch.md` — schedule Launch B (the MCP hub).

**Hard rule for agents:** no automated posting to Reddit/Discord/forums and no
upvote manipulation. Those get the domain blacklisted. Submissions to directories
and registries that invite submissions are fine; community posting stays human.

---

## How to measure it working
- `https://wmcp.sh/api/v1/stats/public` → `graded_servers` climbs (also shown live on the homepage).
- `https://wmcp.sh/mcp/leaderboard` → more rows each day.
- `https://wmcp.sh/.well-known/mcp` → the canonical server list.

## The win condition
When `/mcp/leaderboard` has the most complete, current, independent grade of the
MCP ecosystem — and badges from it are embedded across the web — wmcp.sh *is* the
trust layer for MCP. That's the asset an acquirer can't quickly rebuild.
