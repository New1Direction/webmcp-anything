# Outbound wave — 2026-06 (ready to send)

All 6 hot leads **re-verified live 2026-06-09: still F (45/100)**. Report pages confirmed to carry the Deep Audit + Monitor ("Watch this") buttons → checkout (cs_live). So every link below lands on a working funnel.

**The one rule:** grades are honest and identical whether or not they pay. This is security sales, not a shakedown. Don't quote a price in the email — the report page shows the current price + buttons; let them click.

**Fill before sending:** `{name}` (founder/eng lead) and your signature. Find the contact via the channel noted per lead. Zero-PII: sign with your name/handle, send from a wmcp.sh role address (e.g. hello@wmcp.sh).

---

## 1. mcp.viridis-security.com — F 45 · *security vendor* (best opener — the irony sells itself)
**Contact (researched 2026-06-09 — WEAK):** no public footprint. WHOIS is privacy-redacted, site wouldn't load, zero search results for founder/handles. Best cold attempt: a contact form on viridis-security.com (if it loads for you) or a guessed role address `security@` / `hello@` / `contact@viridis-security.com` (unverified — may bounce). Honestly the hardest of the four; consider deprioritizing unless you can load their site.
**Report:** https://wmcp.sh/mcp/grade/mcp.viridis-security.com

```
Subject: heads up — viridis-security's MCP server scores F on security

{name} — friendly heads up from one security-adjacent shop to another. Your
mcp.viridis-security.com MCP server scores F (45/100) on the independent MCP
trust leaderboard, and the flag is awkward given what you do: detect_injection's
own tool description contains prompt-injection markup (OWASP MCP01). Public
report: https://wmcp.sh/mcp/grade/mcp.viridis-security.com

Better you hear it from me than a prospect. The Deep Audit maps the exact fix,
and Monitoring re-grades you + proves it's clean (and gets you the verified
badge once you pass). The grade's free and identical either way. Worth 15 min?

— [you], wmcp.sh
```

## 2. api.agentrapay.ai — F 45 · *payments*
**Contact (researched 2026-06-09 — MEDIUM):** privacy-conscious startup (1–10 ppl, founded 2024), no founder name or email public. Channel = **DM @agentrapay on X** (their site links x.com/agentrapay; also seen as @AgentraAI). Docs/well-known agent-card at agentrapay.ai/docs if you want a deeper hook. No `{name}` available → open with "Agentra team —".
> Note: Agentra sells "trust infrastructure / reputation scoring for agents" — they're adjacent to wmcp's trust angle, so an F on *their own* security grade is an especially sharp (if delicate) hook.
**Report:** https://wmcp.sh/mcp/grade/api.agentrapay.ai

```
Subject: your payment MCP tool is flagged for a secret-exfiltration surface

{name} — your api.agentrapay.ai MCP server scores F (45/100) on the independent
MCP trust leaderboard, and the specific flag is the scary one for a payments
product: agentra_authorize_payment and create_wallet are marked for a
secret-exfiltration surface (OWASP MCP08). Public report:
https://wmcp.sh/mcp/grade/api.agentrapay.ai

Your customers' security teams run this check before they connect. The Deep
Audit maps the exact fix; Monitoring re-grades you and proves it's clean. The
grade's free either way — happy to walk you through it. Worth 15 minutes?

— [you], wmcp.sh
```

## 3. crossfin.dev — F 45 · *finance*
**Contact (researched 2026-06-09 — LOW/anon):** indie builder, no name/email/X anywhere. The site is bare (only links to live.crossfin.dev). Only real channel = **open a GitHub issue on `github.com/bubilife1202/crossfin`** (the repo behind it) or @ that GitHub user. No `{name}` → open with "Hey —". (Note: the LinkedIn "Crossfin Holdings" is a different South-African investment firm — don't contact them.)
**Report:** https://wmcp.sh/mcp/grade/crossfin.dev

```
Subject: crossfin.dev scored F on the independent MCP trust leaderboard

{name} — crossfin.dev's MCP server scores F (45/100) on the independent MCP
trust leaderboard. For a finance product the flag matters: call_paid_service
and find_optimal_route are marked for a secret-exfiltration surface (OWASP
MCP08). Public, indexed report: https://wmcp.sh/mcp/grade/crossfin.dev

Anyone evaluating crossfin sees the grade. Deep Audit = the exact fix;
Monitoring re-grades + proves it clean to your users. Grade's free either way.
Want the audit?

— [you], wmcp.sh
```

## 4. mcp.payram.com — F 45 · *payments*
**Contact (researched 2026-06-09 — STRONG, best-equipped lead):** contact name **Krishna Raj**; direct **Telegram → t.me/krishnaxl**; email **support@payram.com**; book-a-call **calendly.com/payram-sales/payram-demo-crypto-payments**; community **t.me/PayRamChat**. Best move: DM krishnaxl on Telegram (founder/leadership, direct line) with the finding + report link. Use `{name}` = Krishna.
**Report:** https://wmcp.sh/mcp/grade/mcp.payram.com

```
Subject: your payment MCP server is flagged for a secret-exfiltration surface

{name} — mcp.payram.com scores F (45/100) on the independent MCP trust
leaderboard. The flag is the one that spooks a payments buyer: your
connection / env-template tools are marked for a secret-exfiltration surface
(OWASP MCP08). Public report: https://wmcp.sh/mcp/grade/mcp.payram.com

Customers' security teams check this before connecting. Deep Audit maps the
fix; Monitoring re-grades and proves it's clean. Grade's free either way —
worth 15 min?

— [you], wmcp.sh
```

## 5. mcp.bitrise.io — F 45 · *funded CI company* (real budget, real security org)
**Find {name}:** Bitrise is established — try security@bitrise.io, their DevRel, or a security eng on LinkedIn
**Report:** https://wmcp.sh/mcp/grade/mcp.bitrise.io

```
Subject: mcp.bitrise.io scores F on the independent MCP trust leaderboard

{name} — Bitrise's MCP server (mcp.bitrise.io) scores F (45/100) on the
independent MCP trust leaderboard. The flagged item is register_ssh_key,
marked for a secret-exfiltration surface (OWASP MCP08) — sensitive for a CI
product. Public, indexed report: https://wmcp.sh/mcp/grade/mcp.bitrise.io

Devs evaluating your MCP server will see this. The Deep Audit gives your team
the exact breakdown to pass; Monitoring re-grades on a schedule and alerts on
regressions. The grade is free and identical whether or not you engage — happy
to send the full findings. Who's the right person on your side?

— [you], wmcp.sh
```

## 6. api.dialogbrain.com — F 45 · *154 tools, big surface*
**Find {name}:** "DialogBrain founder" LinkedIn/X; or hello@dialogbrain.com
**Report:** https://wmcp.sh/mcp/grade/api.dialogbrain.com

```
Subject: api.dialogbrain.com scored F on the independent MCP trust leaderboard

{name} — api.dialogbrain.com scores F (45/100) on the independent MCP trust
leaderboard. With 154 tools you have a wide surface, and 4+ of your tool
descriptions contain prompt-injection markup (OWASP MCP01) — an agent reading
them can be steered. Public report: https://wmcp.sh/mcp/grade/api.dialogbrain.com

Deep Audit = which tools, exact fix; Monitoring re-grades and proves it clean
as you ship. Grade's free either way. Want the breakdown?

— [you], wmcp.sh
```

---

## Backups (also re-verified F 45 today, no findings written yet — pull the specific flag from each report before sending)
api.delx.ai (143 tools) · www.ia-qa.com (139t) · mcp.trenchfu.com (94t) · api.octodamus.com · mcp.payperbyte.io · merx.exchange — reports at `wmcp.sh/mcp/grade/<host>`.

## Easy-yes mirror play — A-graded (sell the Verified badge)
1,177 servers score A. Short DM: *"your MCP server scored A on the independent trust leaderboard — grab the verified badge to show it on your README/site."* → Verified SKU. Vanity + trust, low friction, fast close.

## Send mechanics
- 5–10 sends/day from a warmed inbox (don't blast — deliverability + it's targeted).
- Founder DM on X/LinkedIn for funded startups (agentrapay, crossfin, payram, dialogbrain). Email security@/hello@ for the established ones (bitrise).
- Log replies; when someone clicks the report and buys, it mints cs_live → shows in /dashboard.
