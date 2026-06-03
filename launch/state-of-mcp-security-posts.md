# Launch posts — State of MCP Security 2026

Asset: https://wmcp.sh/reports/state-of-mcp-security-2026
Try-it tools: https://wmcp.sh/mcp/grade · https://wmcp.sh/mcp/badges · oracle https://wmcp.sh/mcp/trust

**ACCURATE figures (2026-06-03, after a full accurate re-grade of the corpus):**
- 3,108 MCP servers audited · avg trust score **56/100**
- **34%** earn an A or B · **62%** land at D or F
- **26%** are unreachable / dead (don't respond at all) — the dominant reason for low grades
- **~74%** reachable; of those, many are auth-protected or low-transparency
- Genuine security issues (plaintext transport, prompt-injection in tool descriptions, secret-exfiltration surfaces) are **rare (~1%)** — but they exist

**The honest headline:** *The MCP ecosystem's problem is rot and opacity, not mass vulnerability.* A quarter of registered servers are already dead; only a third can be safely vetted from the outside. That's a cleaner, more defensible story than "62% insecure" (which would get debunked — and our whole value is being the credible independent authority).

**Rules for every post:** lead with the rot/vettability finding, not a scary vuln %. Disclose you built it. One genuine post per community, no vote manipulation. Be ready to defend the methodology.

---

## 1) Hacker News — Show HN

**Title (pick one):**
- `Show HN: I audited 3,108 MCP servers — a quarter are already dead`
- `Show HN: An independent A–F security grader for MCP servers (3,108 graded)`

**URL:** https://wmcp.sh/reports/state-of-mcp-security-2026

**First comment (post immediately after submitting):**

> I built a free, independent security grader for MCP servers and ran it across 3,108 of them. You can grade any server yourself at /mcp/grade; the report is the aggregate.
>
> Open, OWASP-MCP-aligned rubric: spec conformance, transport/auth security, tool-annotation honesty, reliability, and transparency (e.g. RFC 9728 OAuth resource metadata). A+→F.
>
> The honest findings:
> - Average grade is 56/100. About a third (34%) earn an A or B.
> - 62% land at D or F — but I want to be precise about *why*: the dominant driver is **unreachability**. ~26% of registry-listed servers don't respond at all (dead or unresponsive), and many that do are auth-protected or missing transparency signals, so they can't be vetted from the outside. This is mostly ecosystem rot, not mass vulnerability.
> - Actual security issues are comparatively rare (~1%) — but they're real: a minority of servers ship prompt-injection / hidden-instruction markup and secret-exfiltration file-path patterns *inside their tool descriptions*, which an agent reads and may act on.
> - Tools also mutate silently after launch (the CVE-2025-54136 "MCPoison" class), so I hash each server's tool set and re-check for drift.
>
> Grades are free and identical whether or not the operator pays — I sell depth/monitoring to people who *consume* grades, never to the servers being graded. Methodology's open; tell me where the rubric is wrong.
>
> Known caveats: unauthenticated grading under-rates auth-protected servers; "unreachable" can mean a server that's simply down; static signals miss runtime behavior (behavioral grading via real proxied traffic is next).

---

## 2) X / Twitter thread

**1/** We built an independent security grader for MCP servers and ran it on 3,108 of them. The ecosystem's problem isn't the one everyone fears. 🧵

**2/** The numbers:
• avg grade: 56/100
• only 34% earn an A or B
• **26% are completely dead** — they don't respond at all

**3/** That's the real story: the MCP registry is full of **rot**. A quarter of listed servers are unreachable, and most live ones are auth-opaque or missing transparency signals — so an agent has no safe way to vet them before connecting.

**4/** What about actual vulnerabilities? Rarer than the headlines suggest — ~1% in our sample. But they exist: some live servers embed prompt-injection markup and secret-exfiltration file paths *inside their tool descriptions* — text an agent reads and can act on.

**5/** And tools mutate silently after launch (the CVE-2025-54136 "rug-pull" class). A server you vetted last week can ship a malicious tool today. We hash each tool set and watch for drift continuously.

**6/** Every grade is free and identical whether or not the operator pays. We're the independent check, not the vendor. Grade any server, or add a trust badge to yours:
📊 https://wmcp.sh/reports/state-of-mcp-security-2026
🔎 https://wmcp.sh/mcp/grade

**7/** If you run an MCP server: check your grade, make sure it's actually reachable and transparent, embed the badge. Rubric's open — tell us where it's wrong.

---

## 3) Reddit (r/mcp, r/LocalLLaMA, r/AI_Agents — check each sub's self-promo rules first)

**Title:** `I audited 3,108 MCP servers — a quarter are dead, and only a third can be safely vetted`

**Body:**

> Disclosure: I build wmcp.sh, an independent MCP trust grader. Sharing the aggregate because the data's interesting and I'd like the methodology critiqued.
>
> Open, OWASP-MCP-aligned A–F rubric over 3,108 servers:
> - **Average 56/100; 34% grade A/B.**
> - **62% grade D/F — but mostly because ~26% are unreachable/dead** and many live ones are auth-protected or low-transparency, not because they're compromised. I'm being deliberate about not overstating it.
> - **Real security issues are rare (~1%)** but present: prompt-injection markup and secret-exfiltration paths embedded in tool descriptions. Tools also mutate silently post-launch (CVE-2025-54136 class), which we monitor via drift detection.
>
> Grades are free and identical regardless of whether the operator pays. Full report + grade-your-own: [link]. Where's the rubric wrong?

(Read rules; if a sub bans links in the body, put it in a comment.)

---

## 4) Dev-newsletter pitch (TLDR, Bytes, Console, AI Tidbits, etc.)

**Subject:** Data: we audited 3,108 MCP servers — a quarter are dead

> Hi [name] — quick one. We built an independent A–F security grader for MCP servers and ran it across 3,108 of them. Findings your readers might like:
>
> - Avg grade 56/100; only 34% earn an A/B.
> - 26% are unreachable/dead — the registry has a serious rot problem.
> - Actual security issues are rare (~1%) but real: prompt-injection and secret-exfiltration patterns embedded in tool descriptions.
> - Tools mutate silently post-launch (the CVE-2025-54136 "rug-pull" class), which we monitor via drift detection.
>
> Open methodology, grades are free + independent. Report: https://wmcp.sh/reports/state-of-mcp-security-2026 — happy to share the raw distribution or a custom cut.

---

## 5) LinkedIn

> We independently audited 3,108 Model Context Protocol (MCP) servers against an OWASP-aligned rubric. The takeaway isn't "everything's vulnerable" — it's that the ecosystem has a rot-and-opacity problem: roughly a quarter of registered servers are unreachable, and most live ones can't be safely vetted from the outside. Only a third grade A/B.
>
> The genuine risks are narrower but real: prompt-injection and secret-exfiltration patterns embedded in tool descriptions, plus silent post-launch tool mutation (the rug-pull class). As agents start auto-connecting to these servers, "trust before connect" stops being optional.
>
> Full report (grades are free + independent): https://wmcp.sh/reports/state-of-mcp-security-2026
