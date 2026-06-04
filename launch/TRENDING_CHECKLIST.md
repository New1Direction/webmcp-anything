# Trending-repo launch checklist

A concrete, checkbox punch-list to give `New1Direction/webmcp-anything` the best honest shot at GitHub Trending + an HN/Reddit/X wave.

**How the surfaces actually rank (2026):** GitHub Trending is driven by **star *velocity*** (stars gained in a rolling window), not total stars — and Trending is *downstream* of HN/Reddit/X, not a substitute for them. You chart because a wave sent you. So: the repo must be launch-ready *before* any traffic, then the traffic is pointed at it in one tight window. The real win condition isn't stars — it's `tools/call` activations + adapter PRs.

Pricing to state consistently everywhere: self-serve **Free / Builder $39/mo / Pro $99/mo / Reseller $299/mo**; managed **Starter $499 one-time / Managed Retainer $999/mo / Enterprise $4,999+/mo**.

---

## Phase 0 — Repo hygiene (do BEFORE any traffic)

- [ ] **About blurb** (repo top-right): "Turn any URL into agent-callable MCP tools — add any website to Claude/Cursor in one line." + `https://wmcp.sh`.
- [ ] **Topics/tags** (add via the gear next to About): `mcp`, `model-context-protocol`, `claude`, `cursor`, `ai-agents`, `llm-tools`, `tool-use`, `function-calling`, `cloudflare-workers`, `shopify`, `openapi`, `agentic`, `anthropic`, `mcp-server`, `web-agents`, `typescript`. (Lead with `mcp` + `model-context-protocol`.)
- [ ] **Social preview image** (Settings → Social preview, 1280×640): the terminal-hero look — headline + the `/mcp/u/<url>` connect line. Verify it renders via opengraph.xyz before launch.
- [ ] **Hero demo GIF** at the top of the README (replace the `<!-- TODO -->` line): screen-record "paste URL → tools callable in Claude → add_to_cart". This is the single highest-leverage asset — it does the selling.
- [ ] **Badges** present (live / MIT / MCP-compatible / TypeScript) — already in the README.
- [ ] `LICENSE` (MIT ✓), `CONTRIBUTING.md` ✓, `AGENTS.md` ✓, add a short `CODE_OF_CONDUCT.md`.
- [ ] **5–8 "good first issues"** sourced from `ADAPTERS_WANTED.md` (one adapter each), labeled `good first issue` + `help wanted`.
- [ ] **Pin** 2–3 issues (the adapter bounty + "what should we index next?").
- [ ] Cut a **`v0.1.0`** git tag + GitHub Release with concise notes.
- [ ] Confirm the live demo works on a fresh machine (the Allbirds `/mcp/u/…` endpoint in the README) and `/privacy` + `/terms` resolve (Anthropic connector review needs them).

## Phase 1 — Star velocity (organic only)

- [ ] Let the **demo do the selling** — never ask "please star." A single tasteful "if this is useful, a ⭐ helps others find it" line at the end of the HN/README is the ceiling.
- [ ] Stand up an **adapter bounty** (the legit multiplier): "PR an adapter, get a featured directory listing" — turns interest into contributions + stars.
- [ ] Be present for **comment velocity**: answer every HN/Reddit/X reply fast and substantively in the first 3 hours (early engagement is what the algorithms weight).
- [ ] **Do NOT** buy stars, run star rings, or ask groups to star — GitHub strips vote rings and can suppress the repo. Non-negotiable.

## Phase 2 — Launch sequence + timing

- [ ] **Tue or Wed**, single tight morning window. No pre-announcing (it splits the wave).
- [ ] **HN (keystone):** `Show HN` ~**8–10am ET**. Title + body in `launch/show-hn.md`. Repo + live demo URL in the body, not a marketing site.
- [ ] **X/Twitter:** post the thread (`launch/twitter-thread.md`) with the **demo GIF native on tweet 1**; put the repo link in a *reply*, not tweet 1.
- [ ] **Reddit:** native (non-cross-) posts, **one subreddit at a time**, spaced out: r/mcp, r/LocalLLaMA, r/ClaudeAI, r/Anthropic. Tailor the title per sub; no copy-paste.
- [ ] **Discords:** MCP, Cursor, Cline communities — share in the #showcase/#projects channels.
- [ ] **Newsletters:** submit to TLDR, Console.dev, Bytes, Changelog, Hacker Newsletter.
- [ ] **GitHub-native discovery (do in parallel — see `launch/registry/SUBMISSION_PLAYBOOK.md`):** publish to the official MCP Registry (cascades to Glama/PulseMCP/mcp.so), PR the two `awesome-mcp-servers` lists, submit to Smithery + Cursor Directory.

## Phase 3 — Launch week, day by day

- [ ] **Mon:** finish Phase 0; pre-write HN answers (pricing, "how is this different from one-off MCP servers", security/auth, limits).
- [ ] **Tue (launch):** HN at the window → X thread → first Reddit post. Live in comments for 3–4h.
- [ ] **Wed/Thu:** convert the daily-chart spike into a weekly-chart presence — second Reddit sub, the registry PRs landing, reply to newsletter pickups.
- [ ] **Fri:** taper; capture signups/leads; thank contributors; open the next batch of good-first-issues.
- [ ] **Following week:** a legit second beat (a new adapter, a "we got X stars + here's what people built" recap).

## Anti-patterns (will backfire)

- [ ] ❌ Bought/ringed stars · ❌ copy-pasted multi-sub spam · ❌ marketing-speak ("revolutionary", "game-changer") · ❌ pre-announcing · ❌ defensive replies to criticism · ❌ fabricated badges/benchmarks · ❌ leading with the paywall (lead with the free demo).

## Success criteria (honest)

Stars are a vanity proxy. Track the real funnel (live at `/api/v1/admin/metrics`): **probe runs → `tools/call` activations → paid keys**, plus **adapter PRs** and **directory submissions**. A trending week that produces zero activations is a miss; 50 activations + 5 adapter PRs with modest stars is a win.

_Cross-references: `launch/show-hn.md`, `launch/twitter-thread.md`, `launch/demo-script.md`, `launch/registry/SUBMISSION_PLAYBOOK.md`._
