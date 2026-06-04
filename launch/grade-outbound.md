# Trust-Grade Outbound — the money engine

**Play:** you've publicly + independently graded 6,771 MCP servers. **2,580 score D or F.** The *commercial* ones with a public F have a real, urgent problem (anyone evaluating their server sees the grade) and the budget to fix it. Sell them the fix: **Deep Audit** (one-time) + **Continuous Monitoring** ($/mo). Snyk model — find the real problem, sell remediation.

**The one rule (non-negotiable):** grades stay 100% honest — independent rubric, never fudged to force a sale. That's the moat *and* what makes this legit instead of a shakedown. Within that line it's clean security sales.

**The CTA mechanic:** every server already has a live public report at `wmcp.sh/mcp/grade/<host>` with the **Deep Audit** + **Watch (Monitoring)** buttons on it. Outreach just surfaces the report + the specific failing finding and points them there. (Confirm the $ shown on the report page before quoting.)

**Contact channels (you supply):** founder on X / LinkedIn (search "<company> founder"), `security@`/`hello@<domain>`, or a GitHub issue if it's a public repo. Funded startups → founder DM converts fastest.

---

## 🔥 Hot leads (real findings, ready to send)

| Server | Grade | Report | The hook (real finding) |
|---|---|---|---|
| **mcp.viridis-security.com** | F 45 | /mcp/grade/mcp.viridis-security.com | A *security* vendor — its own `detect_injection` tool description contains prompt-injection markup (OWASP MCP01). |
| **api.agentrapay.ai** | F 45 | /mcp/grade/api.agentrapay.ai | Payments — `agentra_authorize_payment` & `create_wallet` flagged for secret-exfiltration surface (MCP08). |
| **crossfin.dev** | F 45 | /mcp/grade/crossfin.dev | Finance — `call_paid_service` / `find_optimal_route` exfiltration surface (MCP08). |
| **mcp.payram.com** | F 45 | /mcp/grade/mcp.payram.com | Payments — connection/env-template tools exfiltration surface (MCP08). |
| **mcp.bitrise.io** | F 45 | /mcp/grade/mcp.bitrise.io | Funded CI co — `register_ssh_key` exfiltration surface (MCP08). |
| **api.dialogbrain.com** | F 45 | /mcp/grade/api.dialogbrain.com | 154 tools; 4+ tool descriptions contain prompt-injection markup (MCP01). |

> Skip false positives like `sqladmin.googleapis.com` (Google infra, not an operator to sell to).

---

## Outreach templates

### Cold email (general)
```
Subject: {host} scored F on the independent MCP trust leaderboard

Hi {name},

I run wmcp.sh — an independent leaderboard that grades MCP servers A–F on
security, spec conformance, reliability, and transparency. It's public and
indexed, so anyone evaluating {company}'s MCP server can see the grade.

{host} currently scores F (45/100). Public report: {report_url}
Flagged: {finding} (OWASP MCP {code}).

Two ways to fix it:
• Deep Audit (one-time) — the full breakdown + exactly what to change to pass.
• Continuous Monitoring (/mo) — we re-grade you, prove the fix to your users,
  and alert you the moment it regresses.

The grade is free and identical whether or not you pay — happy to walk you
through the report either way. Want the audit?

— {you}, wmcp.sh
```

### Payments / finance angle (agentrapay, crossfin, payram, payperbyte, merx)
```
Subject: your payment MCP tool is flagged for a secret-exfiltration surface

{name} — your {host} MCP server scores F on the independent trust leaderboard,
and the specific flag is the scary one for a payments product: {tool} is marked
for a secret-exfiltration surface (OWASP MCP08). Public report: {report_url}.

Your customers' security teams will run this check before they connect. The
Deep Audit maps the exact fix; Monitoring re-grades you and proves it's clean.
Worth 15 minutes?
```

### Security-vendor angle (viridis-security)
```
Subject: heads up — viridis-security's MCP server scores F on security

{name} — friendly heads up from one security-adjacent shop to another. Your
{host} MCP server scores F on the independent MCP trust leaderboard, and the
flag is awkward given what you do: detect_injection's own tool description
contains prompt-injection markup (MCP01). Public report: {report_url}.

Better you hear it from me than a prospect. Happy to walk you through the audit
(and the badge once you're passing).
```

### X / LinkedIn DM (short)
```
your MCP server {host} scores F on the independent MCP trust leaderboard
(security) — {finding}. public report: {report_url}. it's the first thing a
careful dev checks before connecting. we do the audit + ongoing monitoring if
you want to fix + prove it. (grade's free either way.)
```

### Mirror play — the A-graded (sell Verified, easy yes)
1,187 servers score A/A+/A-. DM them: *"your MCP server scored A on the independent trust leaderboard — grab the verified badge to show it on your README/site"* → the Verified SKU. Vanity + trust, low-friction.

---

## Full target list (32 commercial F-graders, finance → dev → other)
crossfin.dev · api.agentrapay.ai · api.dialogbrain.com (154t) · api.delx.ai (143t) · www.ia-qa.com (139t) · mcp.trenchfu.com (94t) · mcp.bitrise.io (81t) · emc2ai.io (69t) · mcp.valuein.biz · merx.exchange · payments.wiselyenterprisesllc.com · www.heista.co · mcp-data.tunnelmind.ai · mcp.payram.com · sats4ai.com · api.butterbase.ai · x711.io · syenite.ai · mcp.realopen.app · mcp.usecoal.xyz · api.octodamus.com · amalgix.io · mcp.frogeye.ai · www.licium.ai · tools.cipherhub.cloud · kapoost.humanmcp.net · mcp.payperbyte.io · qasper.ai · mcp.viridis-security.com

Each report: `wmcp.sh/mcp/grade/<host>`. Pull a target's exact findings from its report page before you send.
