# wmcp.sh Verified — outreach to A-graded MCP servers

The easy-yes companion to the audit/monitoring outbound (`grade-outbound.md`). Where
F-graders get "here's how to fix it," A-graders get "you earned this — make it
provable." Lower friction, recurring revenue, and every embed is a backlink.

**Tone bar: independent-auditor professional.** Think Anthropic / Snyk / Stripe, not
growth-hack. Factual, specific, measured. Lead with *their* achievement, not our
product. No superlatives ("revolutionary"), no false urgency, no dark patterns. The
credibility of the grade is the entire asset — the outreach has to sound like it.

## The offer (accurate — don't overpromise)
- **Free, today:** the live A–F trust badge on every report page (`wmcp.sh/mcp/grade/<host>`). It re-verifies itself, so it shows the *current* grade, not a screenshot. Anyone can embed it.
- **wmcp.sh Verified (paid, recurring):**
  - **Claimed ownership** (DNS/meta-tag) + the **Verified mark** — proof the server is really theirs, not a look-alike.
  - **Continuous monitoring** — re-audited on a schedule, with an alert the moment anything regresses (a dependency bump, a tool change, a silent rug-pull). Their A stays *true*, and they're never blindsided by a quiet drop.
  - A "verified current as of <date>" attestation a static badge can't give.

The grade is free and independent whether or not they verify — say so plainly. That honesty is the pitch.

## Scarcity (use the real numbers)
Of 6,771 graded servers: **A+ ≈ 0.2% · A-or-better ≈ 7% · A-tier (incl. A-) ≈ 18%.** Most servers do not pass cleanly. Quote the percentile that matches their grade.

---

## Email — A-graded operator
```
Subject: {host} passed the independent MCP trust audit (grade {grade})

Hi {name},

wmcp.sh runs an independent trust audit for MCP servers — security (mapped to the
OWASP MCP Top 10), spec conformance, reliability, tool hygiene, and transparency,
scored A–F and re-checked on a schedule.

{host} scored {grade}. That's in the top ~{percentile} of the 6,771 servers we've
graded — most don't pass cleanly, so it's worth surfacing to the developers
evaluating whether to connect you.

You can embed the live trust badge today, free — it re-verifies itself, so it shows
your current grade rather than a screenshot:
  {report_url}

If it's useful, wmcp.sh Verified adds the two things serious operators ask for:
  • Claimed ownership (DNS/meta) + the Verified mark — proof it's really your server.
  • Continuous monitoring — we re-audit on a schedule and alert you the moment
    anything regresses, so your grade stays true and you're never caught out by a
    silent drop.

The grade itself is free and independent — that doesn't change whether you verify.
Report and badge: {report_url}. Glad to answer anything.

— {name}, wmcp.sh
```

## DM — X / LinkedIn (short, same register)
```
{host} scored {grade} on the independent wmcp.sh MCP trust audit — top ~{percentile}
of 6,771 graded. You can embed the live badge free ({report_url}); Verified adds
claimed ownership + continuous monitoring so it stays provably current. Independent
either way — nice work shipping a clean server.
```

## Power-operator note (caseyjhand.com)
One operator runs **12 A+ servers**. Single outreach, highest yield: offer Verified
across the whole fleet (claim once, monitor all) — they clearly care about doing it
right, and 12 verified badges = 12 backlinks.

---

## A-grade targets (commercial, real products)
mcp.gapup.io (A · 271t) · api.domainkits.com (A · 38t) · chat.curie.app (A · 35t) ·
mcp.axint.ai (A · 35t) · toolora.dev (A · 34t) · www.cyclesite.co.uk (A · 33t) ·
toofi.app (A · 32t) · dynamoi.com (A · 22t) · the caseyjhand.com A+ fleet (12 servers:
usaspending, gbif-biodiversity, secedgar, fcc-broadband, openfda, open-meteo,
clinicaltrials, noaa-cdo, nominatim, pentest, arxiv, cdc).

Skip cloud infra graded incidentally (compute.googleapis.com, container.googleapis.com) —
not operators to sell to. Pull each target's exact grade + percentile from its report
page before sending.

## Do / don't (keeps it at the bar)
- **Do** lead with their grade, name the real percentile, link the public report, and state the grade is free + independent.
- **Don't** invent features (no "featured placement" unless it's live), no urgency tricks, no "limited spots," no flattery that isn't backed by the score.
