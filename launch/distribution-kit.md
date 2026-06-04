# Distribution kit — State of MCP Security (canonical, 2026-06-03)

**This supersedes the numbers in `state-of-mcp-security-posts.md`** (the corpus grew from 3,108 → 6,762 once npm/pypi package scanning landed, which shifted every figure). Use the numbers below.

## Accurate current figures (live: /reports/state-of-mcp-security-2026)
- **6,762 MCP servers audited** — the largest independent audit (remote servers + npm + pypi packages via static source analysis)
- **42%** earn an A or B · **38%** score D or F
- **13%** are unreachable / dead (registry rot)
- Confirmed security issues are **rare (~1%)** — prompt-injection markup / secret-exfil patterns in tool descriptions
- **Developer tooling dominates** the ecosystem: Developer Tools 1,020, Finance & Crypto 581, AI & ML 408, Database 396, Cloud & DevOps 372, Commerce 287, Search 278, Maps & Geo 248
- Tools mutate silently post-launch (CVE-2025-54136 "rug-pull" class) — we hash tool sets + monitor drift

**The honest hook:** *the first real map of the MCP ecosystem + the trust gap nobody's filling.* Not "everything's on fire" — the security news is mostly good; the gap is **vettability** (can an agent trust a server before connecting?) and **rot** (13% dead).

Links: report `https://wmcp.sh/reports/state-of-mcp-security-2026` · leaderboard `https://wmcp.sh/mcp/leaderboard` · grade-your-own `https://wmcp.sh/mcp/grade`

---

## 1) Long-form article — dev.to / Medium / Hashnode (parasite SEO; ranks fast, links back)

**Title:** I audited 6,762 MCP servers. Here's the state of the ecosystem — and the trust gap nobody's filling.

> *(Publish on dev.to + Medium + Hashnode. Put a single line at the top: "Originally published with live data at https://wmcp.sh/reports/state-of-mcp-security-2026" — that's the canonical + the backlink.)*

The Model Context Protocol exploded this year. Claude, Cursor, Codex, and a wave of agents now discover and **auto-connect** to MCP servers. Which raises a question nobody's answering: who's checking those servers are safe, reachable, and well-behaved before an agent hands them tool-call access?

The official MCP registry deliberately doesn't. It authenticates namespaces and stores metadata, then explicitly delegates security and curation to "downstream aggregators." So trust in MCP is *structurally unowned*.

I built an independent grader and ran it across **6,762 servers** — the largest audit of the ecosystem I'm aware of. Here's what's there.

### The method
An open, OWASP-MCP-aligned A–F rubric across five dimensions: spec conformance, security, reliability, tool hygiene, and transparency. It covers remote servers (by connecting and inspecting their real MCP surface) **and** stdio servers distributed as npm/pypi packages (by statically analyzing their published source). Grades are free and identical whether or not the operator pays — that independence is the whole point.

### What's actually out there
**MCP is overwhelmingly developer infrastructure.** Developer Tools is the largest category by 2× (1,020 servers), followed by Finance & Crypto (581), AI & ML (408), Databases (396), and Cloud & DevOps (372). Consumer-facing categories are thin. If you're building for agents, you're mostly building for developers right now.

**42% earn an A or B; 38% land at D or F.** The security news is better than the headlines suggest — only ~1% of servers exposed a *confirmed* problem (prompt-injection / hidden-instruction markup or secret-exfiltration file paths embedded in tool descriptions — text an agent reads and may act on).

**The real gap is vettability and rot.** 13% of registry-listed servers are simply unreachable — dead or unmaintained. And of the live ones, many can't be vetted from the outside at all: no OAuth resource metadata (RFC 9728), untyped tool schemas. An agent has no safe way to know what a server will do before connecting.

**And tools mutate silently after launch** — the CVE-2025-54136 "rug-pull" class. A server you vetted last week can ship a renamed or malicious tool today. Static scans miss this entirely; it needs continuous re-verification. (We hash each server's tool set and re-check on a schedule.)

### Why this matters
As agents move from "suggest" to "act," "trust before connect" stops being optional. The ecosystem needs an independent, continuous, cross-client trust layer — the FICO/SSL-Labs of MCP — not a one-time scan and not a registry that punts.

That's what I'm building at wmcp.sh: a free A–F trust grade for every MCP server, continuously watched for drift, plus the same idea extended to two more connection types — **WebMCP** (in-browser agents) and **captured REST** (turn any site's undocumented internal API into agent tools).

If you run an MCP server: [grade it free](https://wmcp.sh/mcp/grade), make sure it's reachable and transparent, and embed the badge so users know you're audited. The full report (live data): https://wmcp.sh/reports/state-of-mcp-security-2026

---

## 2) LinkedIn

> We ran the largest independent security audit of Model Context Protocol servers to date — **6,762 of them**.
>
> The takeaway isn't "everything's vulnerable." Only ~1% had a confirmed security issue. The real findings:
> • MCP is overwhelmingly developer tooling (Dev Tools outnumber every other category 2:1)
> • 13% of registered servers are already dead/unreachable
> • 42% earn an A/B grade; most of the rest simply can't be vetted from the outside
> • Tools mutate silently after launch (the "rug-pull" class) — static scans miss it
>
> As agents move from suggesting to *acting*, "trust before connect" stops being optional — and right now nobody owns that layer. Full report (live, independent, free): https://wmcp.sh/reports/state-of-mcp-security-2026

---

## 3) Reddit — r/mcp, r/LocalLLaMA, r/AI_Agents (check each sub's self-promo rules; disclose)

**Title:** I audited 6,762 MCP servers — the largest independent audit yet. Here's what the ecosystem actually looks like.

> Disclosure: I build wmcp.sh (an independent MCP trust grader). Sharing the aggregate because the data's genuinely interesting and I'd like the methodology critiqued.
>
> Open OWASP-MCP-aligned A–F rubric over 6,762 servers (remotes + npm/pypi via static analysis):
> - **42% grade A/B, 38% D/F.** Confirmed security issues are rare (~1%) — the bigger gap is vettability + rot (13% are dead/unreachable).
> - **MCP is mostly dev tooling** — Dev Tools (1,020) dwarf every other category; Finance/Crypto (581) and AI/ML (408) next.
> - Tools mutate silently post-launch (CVE-2025-54136 class), which we monitor via drift detection.
>
> Grades are free + identical regardless of payment. Report + grade-your-own: [link]. Where's the rubric wrong?

---

## 4) awesome-mcp PR (the backlink that compounds)

**Target repos:** `punkpeye/awesome-mcp-servers` and `wong2/awesome-mcp-servers` (the two biggest lists).

**PR title:** Add wmcp.sh — independent trust grades + agent-callable trust oracle

**Entry markdown (add under a "Tools / Discovery" or "Frameworks/Utilities" section):**
```markdown
- [wmcp.sh](https://wmcp.sh/mcp/leaderboard) — Independent A–F trust grades for MCP servers (security, reliability, transparency), continuously watched for tool drift / rug-pulls. Free leaderboard + an agent-callable trust oracle (`grade_mcp_server`) at `https://wmcp.sh/mcp/trust`.
```

**PR description:**
> Adds wmcp.sh, an independent (free, not pay-to-rank) trust-grading layer for MCP servers — the "is this server safe to connect?" check the registry leaves to downstream aggregators. Includes a public leaderboard of 6,762 graded servers, per-server report pages, an embeddable badge, and an agent-callable trust oracle so an agent can gate connections on a server's grade. Happy to adjust placement/wording.

---

## 5) MCP registry submission (appear in the registry you grade)

Publish wmcp.sh's **trust oracle** (the agent-callable MCP server at `https://wmcp.sh/mcp/trust`, tools `grade_mcp_server` / `check_mcp_drift`) to the official registry at `registry.modelcontextprotocol.io` via the publish flow (`mcp-publisher` CLI / their docs). This:
- Gets wmcp into the registry's discovery surface (and our own cron then grades it).
- Lets agents find a trust oracle natively.
Name suggestion: `sh.wmcp/trust-oracle`. Description: "Independent A–F trust grade + drift check for any MCP server."

---

## Launch sequence (fire in ~20 min)
1. **Publish the long-form article** on dev.to → cross-post to Medium + Hashnode (canonical link = the report). *Highest-leverage: ranks + 3 backlinks.*
2. **LinkedIn post** (above).
3. **Open the two awesome-mcp PRs** (above).
4. **Submit the trust oracle** to the MCP registry.
5. **X thread + Show HN** — use the threads in `state-of-mcp-security-posts.md` but swap to the numbers at the top of this file (6,762 / 42% A-B / 13% dead / ~1% security).
6. **Reddit** (above) — after HN, one post per sub, disclose.
7. **Email the dev newsletters** (TLDR, Bytes, AI Tidbits, Console) — pitch in `state-of-mcp-security-posts.md`, updated numbers.

Rules that still apply: post once per community, no upvote rings (blacklists the domain), disclose you built it, be ready to defend the methodology in comments.
