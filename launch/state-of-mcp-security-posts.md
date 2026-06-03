# Launch posts — State of MCP Security 2026

Asset: https://wmcp.sh/reports/state-of-mcp-security-2026
Try-it tools: https://wmcp.sh/mcp/grade · https://wmcp.sh/mcp/badges · oracle https://wmcp.sh/mcp/trust

**Real figures (2026-06-03, recomputed live):** 3,106 servers audited · avg 69/100 · 33% A/B · 62% D/F · only 8% had an outright security failure · top weaknesses: unreachable, plaintext HTTP, secret-exfil / prompt-injection patterns in tool descriptions.

**Honesty rules for every post (this is the brand):**
- Never say "62% are insecure." Say "62% scored D or F" and explain the drivers (unreachable / auth-protected / low transparency), with "only 8% had an outright failure."
- Disclose you built it. HN/Reddit punish stealth self-promo; transparency is on-brand for a trust authority.
- Don't vote-manipulate or mass-post. One genuine post per community, then engage in the comments honestly.
- Lead with the method + the novel findings, not a scary number.

---

## 1) Hacker News — Show HN

**Title (pick one):**
- `Show HN: I graded 3,106 MCP servers for security (free, independent A–F)`
- `Show HN: An independent A–F security grader for MCP servers (3,106 graded)`

**URL:** https://wmcp.sh/reports/state-of-mcp-security-2026

**First comment (post immediately after submitting):**

> I built a free, independent security grader for Model Context Protocol (MCP) servers and ran it across 3,106 of them. The report is the aggregate; you can grade any server yourself at /mcp/grade.
>
> The rubric is open and OWASP-MCP-aligned: spec conformance, transport/auth security, tool-annotation honesty, reliability, and transparency (e.g. RFC 9728 OAuth resource metadata). Letter grades A+→F.
>
> Honest read of the data:
> - Average is 69/100; about a third earn an A or B.
> - 62% land at D or F — but to be clear, that's *mostly* servers that are unreachable, auth-protected (so I can't enumerate their tools unauthenticated), or missing transparency signals. Only ~8% had an outright security *failure*. I'm not claiming 62% are "hacked."
> - The findings that did show up are the interesting part: a minority of servers ship prompt-injection / hidden-instruction markup and secret-exfiltration file-path patterns *inside their tool descriptions* — which an agent reads and may act on.
> - Tools mutate silently after launch (the CVE-2025-54136 "MCPoison" class), so I also hash each server's tool set and re-check for drift.
>
> The grade is free and identical whether or not the operator pays — I sell depth/monitoring to people who *consume* grades (agent builders), never to the servers being graded. That independence is the whole point; happy to have the methodology torn apart.
>
> Caveats I already know: unauthenticated grading under-rates auth-protected servers, "unreachable" can mean a server that's simply down, and static signals miss runtime behavior (I'm layering behavioral signals from real proxied traffic next). Tell me where the rubric is wrong.

**Timing:** weekday, ~8–10am ET. Post once. If it doesn't catch, don't repost — engage wherever it does land.

---

## 2) X / Twitter thread

**1/**
We built an independent security grader for MCP servers and ran it on 3,106 of them.

The MCP ecosystem has a trust problem — but not the one you'd guess. 🧵

**2/**
Headline numbers:
• avg grade: 69/100 (a C)
• 1 in 3 servers earn an A or B
• 62% land at D or F

But "D or F" mostly means *can't be safely vetted from the outside* — not "hacked." Only ~8% had an outright security failure.

**3/**
The real problem is transparency. Most servers:
• aren't reachable, or
• don't expose OAuth resource metadata (RFC 9728), or
• ship untyped tool schemas

So an agent (or a human) has no safe way to know what they'll do before connecting.

**4/**
The scary findings are rarer but real: a minority of live servers embed prompt-injection / hidden-instruction markup and secret-exfiltration file paths *inside their tool descriptions* — text an agent reads and can act on.

**5/**
And tools mutate silently after launch (the CVE-2025-54136 "rug-pull" class). A server you vetted last week can ship a malicious tool today. So we hash each tool set and watch for drift continuously.

**6/**
Every grade is free and identical whether or not the operator pays. We're not the server's vendor — we're the independent check. Grade any MCP server, or add your own trust badge:

📊 https://wmcp.sh/reports/state-of-mcp-security-2026
🔎 https://wmcp.sh/mcp/grade

**7/**
If you run an MCP server: check your grade, fix the gaps, embed the badge so your users know you're audited. The whole rubric is open — tell us where it's wrong.

---

## 3) Reddit (r/mcp, r/LocalLLaMA, r/AI_Agents — check each sub's self-promo rules first)

**Title:** `We graded 3,106 MCP servers on security — here's what the ecosystem actually looks like`

**Body:**

> Disclosure: I build wmcp.sh, an independent MCP trust grader. Sharing the aggregate because the data's genuinely interesting and I'd like the methodology critiqued.
>
> We ran an open, OWASP-MCP-aligned A–F rubric (spec conformance, auth/transport, tool-annotation honesty, reliability, transparency) over 3,106 servers. Findings:
>
> - **Average: 69/100. About a third grade A/B.**
> - **62% grade D/F — but mostly because they're unreachable, auth-protected, or missing transparency signals, not because they're compromised.** Only ~8% had an outright security failure. I want to be precise about that, not alarmist.
> - **The notable issues:** some servers ship prompt-injection markup and secret-exfiltration file paths *in their tool descriptions* — which an agent reads. And tools mutate silently post-launch (CVE-2025-54136 class), so we hash + monitor for drift.
>
> Grades are free and identical regardless of whether the operator pays (we sell depth/monitoring to grade *consumers*, not subjects). Full report + grade-your-own: [link]. Where's the rubric wrong?

(Read rules; some subs require a flair or ban links in the post body — put the link in a comment if so.)

---

## 4) Dev-newsletter pitch (email to curators: TLDR, Bytes, Console, AI Tidbits, etc.)

**Subject:** Data: we audited 3,106 MCP servers for security

> Hi [name] — quick one. We built an independent A–F security grader for MCP servers and ran it across 3,106 of them. Some findings your readers might like:
>
> - Avg grade 69/100; only a third earn an A/B.
> - 62% grade D/F — mostly unreachable / auth-protected / low-transparency, with ~8% showing an outright security failure (we're careful not to overstate it).
> - A minority embed prompt-injection and secret-exfiltration patterns directly in their tool descriptions.
> - Tools mutate silently post-launch (the CVE-2025-54136 "rug-pull" class), which we monitor via drift detection.
>
> Open methodology, grades are free + independent. Report: https://wmcp.sh/reports/state-of-mcp-security-2026 — happy to share the raw distribution or a custom cut if useful.

---

## 5) LinkedIn (professional/security angle)

> We independently audited 3,106 Model Context Protocol (MCP) servers against an OWASP-aligned rubric. The takeaway isn't "everything's on fire" — it's that most MCP servers can't yet be *safely vetted from the outside*: unreachable, auth-opaque, or missing transparency signals. Only a third grade A/B.
>
> The genuine risks we found are narrower but real: prompt-injection and secret-exfiltration patterns embedded in tool descriptions, and silent post-launch tool mutation (the rug-pull class). As agents start auto-connecting to these servers, "trust before connect" stops being optional.
>
> Full report (grades are free + independent): https://wmcp.sh/reports/state-of-mcp-security-2026
