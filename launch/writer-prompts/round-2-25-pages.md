# Writer prompt — round 2: 25 more SEO pages for wmcp.sh

**How to use:** paste this entire file to a writer agent (Gemini, Claude, GPT-4 — model-agnostic). It produces 25 TypeScript modules ready to wire into `worker/src/index.ts`. Audit-friendly: every page follows the same head/body shape and the same constraint set as the 30 pages shipped on 2026-05-28 (see commit `b0b46d4`).

When the writer is done you'll need a 15-min audit + wire pass: drop the files into `worker/src/`, add 25 `app.get(...)` blocks to `index.ts`, add 25 `<url>` entries to `worker/src/u.ts`, run `npx tsc --noEmit`, `./node_modules/.bin/wrangler deploy`, smoke-test, commit.

---

## Mission

Write 25 standalone HTML SEO landing pages as `.ts` modules for the public site **wmcp.sh** (a hosted MCP gateway — extracts callable agent tools from any URL).

Each page targets a long-tail query nobody in the MCP space owns yet. The headline grouping below maps each file to a route and a primary search intent.

---

## 🔴 PRIOR MISTAKES — read this BEFORE writing anything

The 2026-05-28 audit on your previous SEO drop (11 files: `vs_make_com`, `vs_n8n`, `vs_smithery`, `alternatives_composio`, `alternatives_pipedream`, `integration_{airtable,anthropic,discord,openai}`, `use_case_{agent_commerce,yield_watcher}`) caught 12 specific mistakes. **Every single one of these will get the new page rejected and re-queued.**

1. **PII in code examples.** `integration_airtable.ts:50` used `Name='Alex Hearts'` — recognizably derived from the repo owner's username. **Forbidden tokens anywhere in any file:** `Alex Hearts`, `alexhearts`, `connordochuk99`, `/Users/alexhearts/`. Use `Acme Corp`, `Sample User`, `support@example.com`, `<repo>` instead.

2. **Libel.** `alternatives_composio.ts:126` claimed Composio stores tokens "in plain-text" — false + defamatory. **Forbidden comparative claims:** "X is broken / insecure / dying / dead / steals data / charges hidden fees." Use neutral factual phrasing: "X is a curated catalog with platform-managed OAuth; wmcp.sh extracts dynamically at runtime."

3. **Fabricated URLs.** `integration_airtable.ts:37` cited `Airtable/airtable-openapi` (does not exist). `integration_anthropic.ts:36` cited `anthropic/anthropic-openapi` (wrong org — correct is `anthropics/anthropic-sdk-python` with the S). **Before citing any third-party URL, WebFetch it.** If unverifiable, omit the link and reference the tool by name only.

4. **Wrong PKCE terminology.** `integration_discord.ts:72` called the bot-token storage "our PKCE credentials proxy." PKCE is an OAuth 2.1 flow extension — it does NOT apply to static API keys or Discord bot tokens. **Use** "encrypted credentials vault" / "out-of-band proxy" for static keys; **reserve** "OAuth 2.1 PKCE proxy" for actual interactive OAuth flows (Google, GitHub, Slack, Notion, Linear, Discord OAuth — NOT Discord bot tokens).

5. **`/managed` body CTA missing.** All 11 prior files mentioned `/managed` only in the footer or FAQ. The visible CTA section at the bottom (with the literal text `$499 one-time setup`) is REQUIRED — see the template I include below.

6. **`/directory/submit` cross-link missing.** Every page footer must link to `/directory/submit`. The 11 prior files all missed this.

7. **`VERTICAL_BY_PROVIDER` map gap.** When you write a new `/integration/<provider>` page that uses `integrationPageHtml(...)`, the `see-also` block is silently empty unless `worker/src/integration_template.ts § VERTICAL_BY_PROVIDER` ALSO gets an entry for the new provider. None of `airtable/anthropic/discord/openai` had entries — silently killed the `/managed ($499+)` upsell on every integration page. **For each integration page you write, output the recommended map update.**

8. **Smithery latency framing.** `vs_smithery.ts:130` said "Local Docker starts (500ms - 1.5s)" — Smithery is a registry/installer, not a per-call runtime. Docker cold-start only happens once. **Either drop the per-call latency row or scope it: "cold-start 2-30s first launch, then warm."**

9. **n8n latency.** `vs_n8n.ts:128` said "800ms - 2s" — n8n self-hosted warm execution is typically 50-300ms. Either cite a real benchmark or qualify: "cold-start can hit hundreds of ms to seconds."

10. **Inconsistent listings.** `use_case_yield_watcher.ts` FAQ mentioned DexScreener but the capability table didn't include it. **Every named provider/tool must appear in EVERY relevant table on the same page.** Read your own draft top-to-bottom before submitting.

11. **Caching claims missing TTL.** `use_case_yield_watcher.ts:126` said Pyth "cached" without a TTL — DeFi stale prices cause real losses. Always qualify: "(short TTL, ~1s)", "(24h cache)", "(per-request bypass option)."

12. **Affiliation disclaimers.** `integration_anthropic.ts` was missing "not affiliated with Anthropic" — the page self-references Claude calling Anthropic's own API through wmcp.sh and a reasonable reader might assume official affiliation. **Every page that names Anthropic / OpenAI / Google / Apple / Microsoft / Vercel / Cloudflare / Stripe / Slack / Notion / Linear / Discord / GitHub / a major platform with its own org must include "wmcp.sh is not affiliated with <Org>"** in hero subtitle or FAQ.

**Pricing constraint (LOCKED — listed again because it's the #1 rejection):**
Only quote Starter $499 one-time / Pro $999/mo / Enterprise $4,999+/mo. **NEVER invent** `$9/mo`, `$19/mo`, `$29/mo`, `$49/mo`, `$99/mo`, free trial, "first month free", or any other tier. If you write any of these the page is rejected and re-queued.

**Self-audit checklist — run these greps on your own output before submitting:**

```bash
# PII — must return empty
grep -lEi "alex ?hearts|alexhearts|connordochuk99|/Users/alexhearts/" worker/src/<your-new-files>

# Forbidden pricing — must return empty
grep -nE '\$(9|19|29|49|99)/mo|\$(9|19|49) one-time|first month free|freemium' worker/src/<your-new-files>

# Required body CTA — every file must match
for f in worker/src/<your-new-files>; do grep -q 'Need this done for you' "$f" || echo "MISSING CTA: $f"; done

# Required /directory/submit footer link
for f in worker/src/<your-new-files>; do grep -q '/directory/submit' "$f" || echo "MISSING: $f"; done

# Required canonical
for f in worker/src/<your-new-files>; do grep -q '<link rel="canonical"' "$f" || echo "MISSING canonical: $f"; done

# Required JSON-LD
for f in worker/src/<your-new-files>; do grep -q 'application/ld+json' "$f" || echo "MISSING JSON-LD: $f"; done
```

Any non-empty output → fix the file before submitting. The auditor runs these same greps on receipt; failing pages are rejected.

---

---

## Files to create (exact paths, exact slugs)

### Industry vertical pages (7) — `/for/<vertical>`

1. `worker/src/for_healthcare.ts` → `/for/healthcare` — "MCP for healthcare AI agents"
2. `worker/src/for_fintech.ts` → `/for/fintech` — "MCP for fintech AI agents"
3. `worker/src/for_legal.ts` → `/for/legal` — "MCP for legal AI agents"
4. `worker/src/for_real_estate.ts` → `/for/real-estate` — "MCP for real-estate AI agents"
5. `worker/src/for_media.ts` → `/for/media` — "MCP for media/newsroom AI agents"
6. `worker/src/for_marketing.ts` → `/for/marketing` — "MCP for marketing AI agents"
7. `worker/src/for_hr.ts` → `/for/hr` — "MCP for HR / people-ops AI agents"

### How-to tutorial pages (8) — `/how-to/<task>`

8. `worker/src/how_to_install_claude_desktop_mcp.ts` → `/how-to/install-claude-desktop-mcp`
9. `worker/src/how_to_expose_shopify_mcp.ts` → `/how-to/expose-shopify-as-mcp`
10. `worker/src/how_to_build_stripe_agent.ts` → `/how-to/build-stripe-mcp-agent`
11. `worker/src/how_to_secure_mcp_oauth.ts` → `/how-to/secure-mcp-oauth`
12. `worker/src/how_to_debug_mcp_tool_calls.ts` → `/how-to/debug-mcp-tool-calls`
13. `worker/src/how_to_deploy_mcp_cloudflare.ts` → `/how-to/deploy-mcp-on-cloudflare-workers`
14. `worker/src/how_to_test_mcp_tools_locally.ts` → `/how-to/test-mcp-tools-locally`
15. `worker/src/how_to_claim_verified_badge.ts` → `/how-to/claim-verified-mcp-badge`

### Glossary pages (6) — `/glossary/<term>`

16. `worker/src/glossary_mcp.ts` → `/glossary/mcp`
17. `worker/src/glossary_tool_use.ts` → `/glossary/tool-use`
18. `worker/src/glossary_function_calling.ts` → `/glossary/function-calling`
19. `worker/src/glossary_json_ld.ts` → `/glossary/json-ld`
20. `worker/src/glossary_oauth_pkce.ts` → `/glossary/oauth-pkce`
21. `worker/src/glossary_openapi_spec.ts` → `/glossary/openapi-spec`

### Framework integrations (4 more) — `/integration/<framework>`

22. `worker/src/integration_laravel.ts` → `/integration/laravel`
23. `worker/src/integration_springboot.ts` → `/integration/spring-boot`
24. `worker/src/integration_nestjs.ts` → `/integration/nestjs`
25. `worker/src/integration_hono.ts` → `/integration/hono`

---

## Mandatory per-file structure

Every `.ts` file:

```typescript
// /<route> — <primary search query>
//
// SERP target: <2-3 keywords>

export function <camelCaseName>Html(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
... (see head template below)
</head>
<body>
... (see body template below)
</body>
</html>`;
}
```

Function naming: derive from file name. `for_healthcare.ts` → `forHealthcareHtml`. `how_to_install_claude_desktop_mcp.ts` → `howToInstallClaudeDesktopMcpHtml`. `glossary_mcp.ts` → `glossaryMcpHtml`. `integration_laravel.ts` → `integrationLaravelHtml`.

### `<head>` template (per page)

```html
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title><Page-specific 50-60 char SEO title — wmcp.sh</title>
<meta name="description" content="<155-160 char description>" />
<link rel="canonical" href="${origin}<route>" />
<meta property="og:title" content="<og title>" />
<meta property="og:description" content="<og description>" />
<meta property="og:url" content="${origin}<route>" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="<title>" />
<meta name="twitter:description" content="<description>" />
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article","headline":"<title>","description":"<description>","author":{"@type":"Organization","name":"WebMCP Anything"},"publisher":{"@type":"Organization","name":"WebMCP Anything","url":"https://wmcp.sh"},"datePublished":"2026-05-28","dateModified":"2026-05-28","mainEntityOfPage":"${origin}<route>"}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
  {"@type":"Question","name":"<Q1>","acceptedAnswer":{"@type":"Answer","text":"<A1>"}},
  {"@type":"Question","name":"<Q2>","acceptedAnswer":{"@type":"Answer","text":"<A2>"}},
  {"@type":"Question","name":"<Q3>","acceptedAnswer":{"@type":"Answer","text":"<A3>"}},
  {"@type":"Question","name":"<Q4>","acceptedAnswer":{"@type":"Answer","text":"<A4>"}}
]}
</script>
<style>
  :root { --bg:#07070d;--card:#16161f;--bg2:#11111c;--border:#26263a;--text:#ececf5;--muted:#8a8aa8;--dim:#6a6a88;--accent:#7c5cff;--accent2:#00e5ff;--green:#4ade80;--red:#f87171;--pink:#f0abfc;--gold:#fbbf24; }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin:0;min-height:100vh;color:var(--text);background:var(--bg);font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif;line-height:1.6;background-image:radial-gradient(ellipse 900px 600px at 10% -5%,rgba(124,92,255,.18),transparent 60%),radial-gradient(ellipse 700px 500px at 95% 10%,rgba(0,229,255,.10),transparent 60%); }
  .wrap { max-width: 920px; margin: 0 auto; padding: 0 24px; }
  nav { display:flex;justify-content:space-between;align-items:center;padding:22px 24px;max-width:1080px;margin:0 auto; }
  nav .brand { font-weight: 800; letter-spacing: -.02em; font-size: 1.05rem; }
  nav .brand a { color: inherit; text-decoration: none; }
  nav .brand span { color: var(--accent2); }
  nav .links { display: flex; gap: 22px; font-size: .9rem; }
  nav .links a { color: var(--muted); text-decoration: none; }
  nav .cta { background: var(--bg2); border: 1px solid var(--border); padding: 7px 14px; border-radius: 8px; font-size: .85rem; color: var(--text); text-decoration: none; font-weight: 600; }
  header.hero { padding: 50px 0 30px; }
  .badge { display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;font-size:.7rem;letter-spacing:.15em;text-transform:uppercase;font-weight:700;background:linear-gradient(90deg,rgba(124,92,255,.18),rgba(0,229,255,.18));border:1px solid rgba(124,92,255,.35);margin-bottom:18px; }
  .dot { width:6px;height:6px;background:var(--accent2);border-radius:50%;box-shadow:0 0 8px var(--accent2); }
  h1 { font-size:clamp(2.1rem,4.8vw,3.2rem);margin:0 0 18px;background:linear-gradient(135deg,#fff 30%,var(--accent2) 100%);-webkit-background-clip:text;background-clip:text;color:transparent;line-height:1.05;font-weight:800;letter-spacing:-.025em; }
  .sub { color: var(--muted); font-size: 1.05rem; max-width: 700px; margin: 0 0 24px; }
  section { padding: 36px 0; }
  .section-label { display:inline-block;font-size:.72rem;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--accent2);margin-bottom:10px; }
  h2 { font-size:clamp(1.4rem,3vw,1.9rem);margin:0 0 12px;font-weight:700;letter-spacing:-.02em; }
  h3 { font-size:1.1rem;margin:0 0 8px;font-weight:700; }
  .section-sub { color: var(--muted); max-width: 640px; margin: 0 0 24px; }
  pre { background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px 18px;overflow-x:auto;font-size:.82rem;color:var(--green);font-family:"SF Mono",Menlo,monospace;line-height:1.5;margin:14px 0; }
  pre .k { color: var(--accent2); } pre .s { color: var(--pink); } pre .c { color: var(--dim); }
  code { font-family: "SF Mono", Menlo, monospace; background: var(--bg2); padding: 1px 6px; border-radius: 4px; font-size: .85em; }
  table { width: 100%; border-collapse: collapse; text-align: left; font-size: .9rem; margin-top: 16px; }
  th, td { padding: 14px 16px; border-bottom: 1px solid var(--border); vertical-align: top; }
  th { background: var(--bg2); font-weight: 700; color: var(--accent2); }
  tr:last-child td { border-bottom: none; }
  td strong { color: var(--text); }
  td.ours { background: rgba(124,92,255,0.05); }
  details { background:var(--card);border:1px solid var(--border);border-radius:12px;padding:18px 20px;margin-bottom:12px; }
  details summary { font-weight: 700; font-size: 1rem; color: var(--text); cursor: pointer; list-style: none; }
  details[open] summary { margin-bottom: 12px; }
  details .answer { color: var(--muted); font-size: .92rem; line-height: 1.65; }
  footer { border-top:1px solid var(--border);margin-top:40px;padding:30px 0;text-align:center;color:var(--muted);font-size:.85rem; }
  footer a { color: var(--accent2); text-decoration: none; margin: 0 8px; }
</style>
```

### `<body>` template (per page)

```html
<nav>
  <div class="brand"><a href="/">wmcp<span>.sh</span></a></div>
  <div class="links">
    <a href="/agent-ready">Agent-ready</a>
    <a href="/managed">Done for you</a>
    <a href="/price-data">Price data</a>
    <a href="/blog">Blog</a>
    <a href="/directory">Directory</a>
  </div>
  <a class="cta" href="/dashboard">Dashboard →</a>
</nav>

<div class="wrap">

<header class="hero">
  <div class="badge"><span class="dot"></span> <CATEGORY> &middot; <SLUG></div>
  <h1><PAGE H1></h1>
  <p class="sub"><1-2 sentence hook leading with the reader's PROBLEM, not the product. Mention wmcp.sh only at the end of the second sentence.></p>
</header>

<section id="wedge">
  <div class="section-label">the gap</div>
  <h2><WHO this is for and WHY THEY CARE></h2>
  <p class="section-sub"><150-200 words framing the problem space.></p>
</section>

<section id="how">
  <div class="section-label"><relevant verb — "the flow" / "the steps" / "the architecture"></div>
  <h2><WHAT this looks like in practice></h2>
  <pre><code><A REAL, RUNNABLE 20-30 LINE CODE EXAMPLE — Python OR TypeScript OR shell. Use real APIs (anthropic.Anthropic(), wmcp.sh /api/v1/tools, OpenAI chat completions, etc.). NO PSEUDOCODE.></code></pre>
</section>

<section id="capabilities">
  <div class="section-label">capability</div>
  <h2><Concrete capabilities table heading></h2>
  <table>
    <thead><tr><th>Capability</th><th>Without wmcp.sh</th><th>With wmcp.sh</th></tr></thead>
    <tbody>
      <tr><td><strong>X1</strong></td><td>⚠️ ...</td><td class="ours">✅ ...</td></tr>
      <tr><td><strong>X2</strong></td><td>❌ ...</td><td class="ours">✅ ...</td></tr>
      <tr><td><strong>X3</strong></td><td>⚠️ ...</td><td class="ours">✅ ...</td></tr>
      <tr><td><strong>X4</strong></td><td>❌ ...</td><td class="ours">✅ ...</td></tr>
      <tr><td><strong>X5</strong></td><td>⚠️ ...</td><td class="ours">✅ ...</td></tr>
    </tbody>
  </table>
</section>

<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions.</h2>
  <details><summary>Q1?</summary><p class="answer">A1 (3-5 sentences).</p></details>
  <details><summary>Q2?</summary><p class="answer">A2.</p></details>
  <details><summary>Q3?</summary><p class="answer">A3.</p></details>
  <details><summary>Q4?</summary><p class="answer">A4.</p></details>
</section>

<section id="upgrade" style="margin-top:36px;background:linear-gradient(135deg,var(--card),rgba(124,92,255,0.08));border:1px solid rgba(124,92,255,0.35);border-radius:16px;padding:22px 26px">
  <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;justify-content:space-between">
    <div style="flex:1;min-width:240px">
      <div style="font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent2);font-weight:700;margin-bottom:6px">Need this done for you?</div>
      <h3 style="margin:0 0 4px;font-size:1.05rem;color:var(--text)">Skip the wiring — we build, deploy, and monitor.</h3>
      <p style="color:var(--muted);margin:0;font-size:.92rem">Custom adapter + hosted MCP at <code>mcp.yourbrand.com</code> + verified badge. From <strong style="color:var(--text)">$499 one-time setup</strong>.</p>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <a href="/managed" style="display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#7c5cff,#00e5ff);color:#0c0c14;padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:700;font-size:.9rem">See /managed →</a>
      <a href="/directory/submit" style="display:inline-flex;align-items:center;gap:6px;background:#11111c;border:1px solid #26263a;color:var(--text);padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:600;font-size:.9rem">Submit (free)</a>
    </div>
  </div>
</section>

</div>

<footer>
  <a href="/">Home</a> · <a href="/agent-ready">Agent-ready</a> · <a href="/managed">Done for you</a> · <a href="/blog">Blog</a> · <a href="/directory">Directory</a> · <a href="/directory/submit">Submit</a> · <a href="<at least 2 SIBLING ROUTES from the same cluster>">…</a> · <a href="https://github.com/New1Direction/webmcp-anything">GitHub</a>
</footer>
```

---

## Constraints (NON-NEGOTIABLE)

### Pricing
Only mention pricing if you reference `/managed`, and only as:
**Starter $499 one-time / Pro $999/mo / Enterprise $4,999+/mo**.

**Do NOT invent any of:** $9/mo, $19/mo, $29/mo, $49/mo, $99/mo, free trial, "first month free". These don't exist. If you write them the page gets rejected.

### Personal info
**Never use:** "Alex Hearts", "alexhearts", "connordochuk99", any real person's name, any real email. Use placeholders: "Acme Corp", "support@example.com", "Dr. Sample".

### Libel / defamation
Comparative claims must be factual. **Do NOT write:**
- "X is broken" / "X is dying" / "X is insecure" / "X is dead"
- "X steals your data"
- "X charges hidden fees"

**Do write:**
- "X requires Y; wmcp.sh handles Y at the edge"
- "X is a workflow builder; wmcp.sh is a tool gateway — different shapes"

### URLs
- **No fabricated URLs.** If you cite a third-party docs URL, repo URL, or pricing page URL, verify it with WebFetch before including. If unverifiable, link to the vendor's homepage or omit the link entirely (mention the tool by name only).
- Internal links to wmcp.sh routes are always safe — use them liberally.

### Affiliation disclaimers
For any third-party org named (Anthropic, OpenAI, Google, Apple, Microsoft, Vercel, Cloudflare, Stripe, etc.), include a one-line disclaimer somewhere on the page: "wmcp.sh is not affiliated with <Org>."

### Internal cross-linking
Each page must link to ≥5 of these in the body or footer:
`/`, `/agent-ready`, `/managed`, `/directory`, `/directory/submit`, `/blog`, `/price-data`, sibling routes from the same cluster (e.g. all `/for/*` pages link to 2-3 other `/for/*`).

---

## Per-page guidance (what each page is actually about)

### `/for/healthcare`
HIPAA, EHR integrations (Epic/Cerner), patient-facing chatbots. Tools: Epic FHIR API via /integration/openapi, scheduling via Calendly OpenAPI, secure messaging. Note: not legal advice; wmcp.sh is not a HIPAA BAA-covered entity by default but can be made so via /managed.

### `/for/fintech`
PCI scope, Plaid + Stripe + Modern Treasury, transaction triage agents. Tools: /integration/stripe + Plaid OpenAPI + bank statement scrapers. Disclaimer about not being a regulated FI.

### `/for/legal`
Discovery review agents, contract redlining, citation lookup. Tools: PACER (via OpenAPI), case-law search, Notion clauses library. Disclaimer about not being legal advice.

### `/for/real-estate`
MLS lookup, comp analysis, document automation. Tools: Zillow/Realtor scrapers via /api/v1/tools, DocuSign API, Notion CRM. Mention multi-broker compliance.

### `/for/media`
Wire-service ingestion, story drafting agents with citations, archive search. Tools: AP/Reuters APIs via OpenAPI, /blog as content surface, JSON-LD Article schema for cite-back. Mention attribution.

### `/for/marketing`
Multi-channel campaign agents, attribution, copy generation. Tools: HubSpot/Salesforce CRM via OpenAPI, Mailchimp/SendGrid, Stripe revenue link.

### `/for/hr`
ATS integrations, candidate screening, employee onboarding. Tools: Greenhouse/Lever OpenAPI, Notion docs, Calendar. Disclaimer about not being an EEOC-compliant decisionmaker.

### `/how-to/install-claude-desktop-mcp`
Step-by-step: open Claude Desktop → Settings → Developer → edit `claude_desktop_config.json` → add wmcp.sh remote MCP entry → restart. Show the exact JSON config. ~600 words.

### `/how-to/expose-shopify-as-mcp`
Step-by-step: take any Shopify storefront URL → curl `/api/v1/tools?url=<url>` → get tool list → connect to Claude/Cursor. ~700 words. Reference Shopify's ~4M storefronts. Mention shopper-side vs merchant-side.

### `/how-to/build-stripe-mcp-agent`
Build a Python agent in 50 lines that lists invoices via Stripe MCP through wmcp.sh. Code-heavy: ~50 lines runnable Python with `anthropic.Anthropic()` + `httpx` calling `/api/v1/tools?url=https://api.stripe.com/openapi.yaml`. Disclaim "wmcp.sh is not affiliated with Stripe".

### `/how-to/secure-mcp-oauth`
OAuth 2.1 + PKCE explanation for MCP tools. When to use PKCE (interactive OAuth flows) vs vault-stored static tokens (bot tokens, API keys). 800 words. Reference wmcp.sh's token vault model.

### `/how-to/debug-mcp-tool-calls`
Debugging recipe: enable verbose logging, inspect tool_use blocks, common errors (schema mismatch, auth, rate limit), how to use wmcp.sh's /api/v1/tools endpoint to inspect tool schemas. 800 words.

### `/how-to/deploy-mcp-on-cloudflare-workers`
Step-by-step: wmcp.sh is built on CF Workers. Show how to fork the repo, configure wrangler.toml, deploy your own instance. Reference the public repo. ~900 words.

### `/how-to/test-mcp-tools-locally`
Step-by-step: `npx wrangler dev` + Claude Desktop pointing at localhost. Or use Anthropic's MCP Inspector tool. ~600 words.

### `/how-to/claim-verified-mcp-badge`
Step-by-step: submit your site at /directory/submit → upgrade via /managed → get verified badge → embed `<img src="https://wmcp.sh/badge/<slug>.svg">` on your site. 600 words.

### `/glossary/mcp`
Define MCP (Model Context Protocol). 400 words. Cover: the spec, who runs it (Anthropic + community), tools vs resources vs prompts, transport options (stdio, SSE, streamable-http). Link to spec at modelcontextprotocol.io if URL verifies.

### `/glossary/tool-use`
Define "tool use" — Anthropic's term for function calling. Cover: how Claude returns tool_use blocks, how the agent loop iterates, how it differs from OpenAI's function_call shape. 400 words.

### `/glossary/function-calling`
Define "function calling" — OpenAI's term. Cover: chat completions with tools array, tool_choice, parallel tool calls. Compare to Anthropic's tool_use shape. 400 words.

### `/glossary/json-ld`
Define JSON-LD. Cover: structured data on the web, schema.org vocabulary, Product / Article / Recipe / FAQPage common shapes. Mention how wmcp.sh extracts agent tools from JSON-LD. 400 words.

### `/glossary/oauth-pkce`
Define OAuth 2.1 PKCE flow. Cover: code_verifier, code_challenge, why PKCE for SPAs and native apps, how it differs from client_secret flows. Mention wmcp.sh uses PKCE for interactive OAuth providers (Google, GitHub, Slack, Notion, Linear). 500 words.

### `/glossary/openapi-spec`
Define OpenAPI specification. Cover: v3 schema, paths, components, security schemes. Show how wmcp.sh compiles OpenAPI specs into MCP tools dynamically. 500 words.

### `/integration/laravel`
PHP framework. Cover: Laravel routes → wmcp.sh ingest, l5-swagger for OpenAPI generation, php-mcp/server as an alternative. Real Laravel controller + spec example.

### `/integration/spring-boot`
Java framework. Cover: Spring Boot REST controllers, springdoc-openapi for OpenAPI generation, spring-ai-mcp project as an alternative. Real Spring controller + @Operation annotation example.

### `/integration/nestjs`
Node.js framework. Cover: NestJS controllers with @ApiOperation decorators, @nestjs/swagger for OpenAPI, multi-module apps. Real controller example.

### `/integration/hono`
Hono (the framework wmcp.sh itself uses). Cover: Hono routes, @hono/zod-openapi for OpenAPI generation, deploying on CF Workers. Real route example.

---

## Output

Write all 25 `.ts` files directly to the paths above. Do NOT wire routes in `worker/src/index.ts` — that's the wiring pass after audit.

Return a punch-list summary (cap ~400 words):
- Files written (25 paths)
- Total approximate lines
- Any URL you had to omit because WebFetch couldn't verify (with the URL)
- Any cross-cutting concerns the auditor should know about (e.g. "all 7 vertical pages reference Anthropic the same way — flag if global change needed")
- A flat list of the 25 `app.get(...)` route blocks to drop into `worker/src/index.ts` (the auditor will paste them)

---

## Reference files in this repo (read them if your model supports it)

- `worker/src/vs_composio.ts` — the canonical /vs/* page (full standalone, brand-styled, JSON-LD, FAQ, CTA)
- `worker/src/use_case_yield_watcher.ts` — the canonical /use-case/* page
- `worker/src/integration_template.ts` — the integration page renderer + VERTICAL_BY_PROVIDER map
- `worker/src/blog.ts` + `worker/src/blog_posts.ts` — long-form blog rendering
- `worker/src/managed.ts` — paid services landing
- `worker/src/llms.txt` is at https://wmcp.sh/llms.txt — read the live page for the full sitemap context

---

## Audit checklist (the human will run this after the writer is done)

```bash
ls worker/src/{for_,how_to_,glossary_,integration_laravel,integration_springboot,integration_nestjs,integration_hono}*.ts | wc -l
# expect: 25

# PII
git ls-files | xargs grep -lEi "alex ?hearts|alexhearts|connordochuk99"
# expect: empty

# Lower-tier pricing
xargs -a <(ls worker/src/{for_,how_to_,glossary_,integration_laravel,integration_springboot,integration_nestjs,integration_hono}*.ts) /usr/bin/grep -nE '\$(9|19|29|49|99)/mo|\$(9|19|49) one-time'
# expect: empty

# Exports + JSON-LD + canonical + /managed + /directory/submit
# (one-liner that loops; see commit b0b46d4 audit pass)

npx tsc --noEmit
# expect: clean
```

That's the prompt.
