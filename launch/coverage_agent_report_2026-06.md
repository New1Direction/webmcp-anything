# wmcp.sh Coverage Agent — Final Run Report

**Run date:** ~2026-06-03
**Purpose:** Harvest as many public remote MCP servers (https streamable-http/SSE) as possible from official registry + secondary directories, clean/dedupe, and prepare for queuing via the admin `POST /api/v1/admin/grade-servers` endpoint (the firehose used by external agents to scale the trust graph). The worker cron then grades slices.

## Harvest Results (latest agent execution)
- **Official registry** (https://registry.modelcontextprotocol.io/v0/servers, full cursor pagination with live response shape `server.remotes`, ~300 pages until near end): **4786** raw unique https:// remote endpoints (only those declaring `streamable-http` or `sse` type kept).
- **PulseMCP secondary** (via firecrawl_search + scrape of server detail pages for explicit "Remote One" / "URL" fields): +8 clean (e.g. mcp.nevent.ai/mcp, mcp.watchr.ai/mcp, developers.make.com/mcp-server, docs.tenderly.co/mcp-server, and others from Atlassian/Linear style pages in related searches).
- **Other secondaries scouted** (smithery.ai, glama.ai, mcp.so, mcp.run + GitHub): Confirmed as major sources of hosted/remote MCPs. Firecrawl used to surface lists and example pages (e.g. exa, tavily, supabase, brightdata, microsoft-learn on smithery). Smithery often uses their hosted proxy layer rather than publishing raw direct remote URLs in the same way pulsemcp does, so they contribute fewer *new direct* endpoints beyond what's already in the registry. Direct good finds (e.g. `https://mcp.atlassian.com/v1/mcp/authv2`, `https://mcp.linear.app/mcp`) were merged.
- **After full clean/normalize/dedup** (https only; drop localhost/private IPs; lower host; strip trailing / and junk; keep only plausible remote MCP endpoints): **4406** unique.
- **Stable high-quality subset** (clear public domains + /mcp or /sse in path, no ngrok/temp): **3687**.

**Source breakdown (this run):** ~99% official registry (the authoritative, self-declared list of remotes — the highest-leverage single source). Secondaries (pulsemcp firecrawl + targeted searches) add the long tail of newly published or directory-only hosted servers not yet (or freshly) in the registry.

Full cleaned list + batches saved in `launch/` (and /tmp from runs).

## Queuing / Submit
- Batches of 200 prepared (stable high-quality, plus extended with secondaries).
- In-agent submits during these runs: 0 (no `ADMIN_TOKEN` exported in the execution envs; correct behavior).
- **Ready tooling for the operator (who has the token):**

  1. Simple 200-batch:
     ```bash
     export ADMIN_TOKEN=...   # the real prod secret (same as used for seed-stores)
     /Users/alexhearts/webmcp-anything/launch/queue_mcp_batch.sh
     ```

  2. Any list (including the full 4406) in safe batches of 200:
     ```bash
     export ADMIN_TOKEN=...
     python3 /Users/alexhearts/webmcp-anything/scripts/submit_mcp_urls.py \
       /Users/alexhearts/webmcp-anything/launch/wmcp_coverage_urls.json \
       --batch-size 200 --max 1000   # or omit --max to do all (will take multiple calls / time)
     ```

  3. Full re-harvest live + submit:
     ```bash
     export ADMIN_TOKEN=...
     cd /Users/alexhearts/webmcp-anything
     python3 scripts/coverage_agent.py --max-submit 1000
     ```

- The `coverage_agent.py` (and the new dedicated submit script) handle batching, logging of the exact API response (`{"accepted":N,"rejected":M,"newly_added":K,"queued_total":T}`), sleeping, and error handling.
- The worker's 2h cron drains from the `gradeseed:manual` KV and performs grading (you do **not** need to call the grade endpoint yourself).

## Verify Progress
- Pre-submit (this env): `curl -s https://wmcp.sh/api/v1/stats/public` → `{"cached_urls":1009,"graded_servers":7}`
- Leaderboard: https://wmcp.sh/mcp/leaderboard
- After real submit(s) + cron (or manual seed-now): `graded_servers` and leaderboard row count will increase. This directly expands the independent trust index.

## Deliverables (committed/persisted in the repo)
- `scripts/coverage_agent.py` — main reusable agent (registry + pulsemcp secondary + cleaning + submit logic + flags for harvest-only or max-submit).
- `scripts/submit_mcp_urls.py` — dedicated tool to submit an arbitrary json array of URLs (the big list, future harvests, etc.) in safe batches.
- `launch/queue_mcp_batch.sh` — simple one-liner for the 200 stable batch.
- `launch/wmcp_submit_200.json`, `launch/wmcp_coverage_urls.json` (full), `launch/wmcp_submit_extended.json`, `launch/pulsemcp_extracted.json`.
- `launch/coverage_agent_report_2026-06.md` — this report.

## Hard Rules Followed
- Only public https remote MCP endpoints (no npx/uvx/stdio-only, no http://, no localhost/private, no auth-walled only).
- Submissions via the documented admin API only (no social posts, no account creation, no CAPTCHAs, no manipulation).
- Deduplication at every layer (sets + the API's own `newly_added`).
- Re-runnable and designed for periodic use to catch newly published servers.

## Next Steps / Loop
- Operator runs the export + one of the queue commands above (start with the 200, then use the submit script on the full list or fresh agent harvests).
- Re-run `coverage_agent.py` (with token) periodically or on a schedule to keep feeding new ones.
- Extend secondaries: the agent has hooks; add live firecrawl calls or more targeted scrapes for smithery/glama lists + their per-server "connect" URLs.
- Monitor: `curl -s https://wmcp.sh/api/v1/stats/public | jq` and the leaderboard after submits + grading.

This run has prepared **thousands** of public remote MCP servers for the trust graph. Once the real `ADMIN_TOKEN` is used with the provided scripts/batches, the graded_servers count and leaderboard will grow substantially, making wmcp.sh the most complete independent index.

(Older 50-batch and prior reports remain for reference.)
