// /use-case/sales-assistant — use-case page. SERP target: "how to build a sales ai assistant",
// "ai sdr agent", "crm ai agent mcp", "salesforce ai assistant", "hubspot ai agent tools".

export function useCaseSalesAssistantHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>How to Build a Sales AI Assistant — CRM, Email, Calendar Tools — wmcp.sh</title>
<meta name="description" content="Build a sales AI assistant that qualifies leads, drafts emails, and books meetings. Wire Salesforce, HubSpot, Gmail, and Calendar as MCP tools — without per-rep glue code." />
<link rel="canonical" href="${origin}/use-case/sales-assistant" />
<meta property="og:title" content="How to Build a Sales AI Assistant with CRM + Email + Calendar Tools" />
<meta property="og:description" content="Qualify leads, draft outreach, book meetings. Salesforce, HubSpot, Gmail, and Calendar as MCP tools." />
<meta property="og:url" content="${origin}/use-case/sales-assistant" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="How to Build a Sales AI Assistant — CRM, Email, Calendar Tools" />
<meta name="twitter:description" content="A qualify → email-draft → calendar-invite flow that doesn't require six SDK wrappers." />
<meta name="twitter:image" content="${origin}/og.png" />
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article","headline":"How to Build a Sales AI Assistant with CRM, Email, and Calendar Tools","description":"Wire Salesforce, HubSpot, Gmail, and Calendar into a qualify-draft-schedule sales assistant loop using MCP tools.","author":{"@type":"Organization","name":"WebMCP Anything"},"publisher":{"@type":"Organization","name":"WebMCP Anything","url":"https://wmcp.sh"},"datePublished":"2026-05-28","dateModified":"2026-05-28","mainEntityOfPage":"${origin}/use-case/sales-assistant"}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
  {"@type":"Question","name":"What does an AI sales assistant actually do?","acceptedAnswer":{"@type":"Answer","text":"It enriches a new lead, reads CRM history, drafts an outreach email tailored to the prospect, and proposes calendar slots — all before a human SDR opens the record. The human reviews, edits, and sends. The goal is to compress the first 30 minutes of every account into 30 seconds of review."}},
  {"@type":"Question","name":"Which CRM systems are supported?","acceptedAnswer":{"@type":"Answer","text":"Anything with an OpenAPI specification works through /integration/openapi. Salesforce and HubSpot both publish OpenAPI specs; Pipedrive, Close, and Attio are similarly straightforward. wmcp.sh is not affiliated with Salesforce, HubSpot, or any CRM vendor."}},
  {"@type":"Question","name":"How does the agent draft email without sending it?","acceptedAnswer":{"@type":"Answer","text":"Wire Gmail's draft.create method (via /integration/google) rather than send. The agent writes a draft that lands in the rep's drafts folder. The rep reviews, edits, and clicks send. wmcp.sh exposes draft and send as separate MCP tools so you can scope permissions tightly."}},
  {"@type":"Question","name":"Can it actually book meetings?","acceptedAnswer":{"@type":"Answer","text":"Yes. Wire Google Calendar's freebusy.query and events.insert via /integration/google. The agent proposes slots based on the rep's availability and the lead's timezone; on confirmation it inserts a hold with a join link. Most teams put this behind a one-click human approval."}},
  {"@type":"Question","name":"How is this different from a CRM's built-in AI?","acceptedAnswer":{"@type":"Answer","text":"Built-in CRM AI lives inside one product. A custom MCP-backed agent reads across CRM, inbox, calendar, and external enrichment in a single loop, runs on the model you pick, and is portable if you migrate CRMs. Pick whichever matches your data-sovereignty and model-choice constraints."}}
]}
</script>
<style>
  :root { --bg:#07070d;--card:#16161f;--bg2:#11111c;--border:#26263a;--text:#ececf5;--muted:#8a8aa8;--dim:#6a6a88;--accent:#ff9e2c;--accent2:#ffcf7a;--green:#4ade80;--red:#f87171;--pink:#ffb86b;--gold:#fbbf24; }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin:0;min-height:100vh;color:var(--text);background:var(--bg);font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif;line-height:1.6;background-image:radial-gradient(ellipse 900px 600px at 10% -5%,rgba(255,158,44,.18),transparent 60%),radial-gradient(ellipse 700px 500px at 95% 10%,rgba(255,176,0,.10),transparent 60%); }
  .wrap { max-width: 920px; margin: 0 auto; padding: 0 24px; }
  nav { display:flex;justify-content:space-between;align-items:center;padding:22px 24px;max-width:1080px;margin:0 auto; }
  nav .brand { font-weight: 800; letter-spacing: -.02em; font-size: 1.05rem; }
  nav .brand span { color: var(--accent2); }
  nav .links { display: flex; gap: 22px; font-size: .9rem; }
  nav .links a { color: var(--muted); text-decoration: none; }
  nav .cta { background: var(--bg2); border: 1px solid var(--border); padding: 7px 14px; border-radius: 8px; font-size: .85rem; color: var(--text); text-decoration: none; font-weight: 600; }
  header.hero { padding: 50px 0 30px; }
  .badge { display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;font-size:.7rem;letter-spacing:.15em;text-transform:uppercase;font-weight:700;background:linear-gradient(90deg,rgba(255,158,44,.18),rgba(255,176,0,.18));border:1px solid rgba(255,158,44,.35);margin-bottom:18px; }
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
  td.ours { background: rgba(255,158,44,0.05); }
  details { background:var(--card);border:1px solid var(--border);border-radius:12px;padding:18px 20px;margin-bottom:12px; }
  details summary { font-weight: 700; font-size: 1rem; color: var(--text); cursor: pointer; list-style: none; }
  details[open] summary { margin-bottom: 12px; }
  details .answer { color: var(--muted); font-size: .92rem; line-height: 1.65; }
  .wins-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 18px; }
  @media (max-width: 720px) { .wins-grid { grid-template-columns: 1fr; } }
  .wins-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 22px; }
  .wins-card.us { border-color: var(--accent); background: linear-gradient(135deg, var(--card), rgba(255,158,44,0.06)); }
  .wins-card h3 { color: var(--text); margin-bottom: 12px; }
  .wins-card.us h3 { color: var(--accent2); }
  .wins-card ul { color: var(--muted); padding-left: 20px; margin: 0; font-size: .92rem; line-height: 1.7; }
  .wins-card li { margin-bottom: 6px; }
  .arch { background:var(--card);border:1px solid var(--border);border-radius:12px;padding:18px 20px;color:var(--muted);font-size:.92rem;line-height:1.65; }
  .arch strong { color: var(--text); }
  footer { border-top:1px solid var(--border);margin-top:40px;padding:30px 0;text-align:center;color:var(--muted);font-size:.85rem; }
  footer a { color: var(--accent2); text-decoration: none; margin: 0 8px; }
</style>
</head>
<body>

<nav>
  <div class="brand"><a href="/" style="color:inherit;text-decoration:none">wmcp<span>.sh</span></a></div>
  <div class="links">
    <a href="/agent-ready">Agent-ready</a>
    <a href="/managed">Done for you</a>
    <a href="/directory">Directory</a>
    <a href="/blog">Blog</a>
  </div>
  <a class="cta" href="/dashboard">Dashboard →</a>
</nav>

<div class="wrap">

<header class="hero">
  <div class="badge"><span class="dot"></span> Use Case &middot; sales-assistant</div>
  <h1>How to build a sales AI assistant.</h1>
  <p class="sub">Every SDR repeats the same five minutes per lead: open the CRM, read the activity history, skim the company site, draft a personalized opener, pull up calendar slots. That sequence is a tool-using agent loop in disguise. The hard part is wiring the CRM, the inbox, the calendar, and the enrichment fetcher into one loop the model can actually run.</p>
</header>

<section id="wedge">
  <div class="section-label">The gap</div>
  <h2>Sales tooling is a swamp of bespoke SDKs.</h2>
  <p class="section-sub">Salesforce&rsquo;s API model is not HubSpot&rsquo;s. Gmail&rsquo;s draft schema is not Outlook&rsquo;s. Calendar invites have their own RFC. Lead enrichment is six vendors with six pricing models. The minute you try to assemble all this into a single agent loop, you&rsquo;ve hired a contractor for a quarter.</p>
  <p class="section-sub">The teams that ship working SDR copilots short-circuit this: they pick a tool gateway that already speaks every shape, expose those tools through MCP, and spend their actual time on prompt design, deliverability, and the handoff UX. That&rsquo;s where most of the lift is anyway.</p>
  <p class="section-sub">wmcp.sh is that gateway. CRM OpenAPI specs, Google Workspace, public web enrichment — one <code>/api/v1/tools</code> call returns MCP-shaped methods your Claude or GPT loop can invoke. wmcp.sh is not affiliated with Salesforce, HubSpot, or Google.</p>
</section>

<section id="architecture">
  <div class="section-label">Architecture</div>
  <h2>Qualify → draft → schedule.</h2>
  <div class="arch">
    <p style="margin:0 0 10px"><strong>1. Lead trigger.</strong> A new lead lands in your CRM. A webhook drops the lead ID into a queue. Each lead gets its own bounded agent run with a fixed turn budget.</p>
    <p style="margin:0 0 10px"><strong>2. Tool gateway (wmcp.sh).</strong> The agent materializes tools for your CRM (Salesforce or HubSpot via <a href="/integration/openapi" style="color:var(--accent2)">/integration/openapi</a>), Gmail and Calendar via <a href="/integration/google" style="color:var(--accent2)">/integration/google</a>, and a generic webpage fetcher for company-site enrichment.</p>
    <p style="margin:0 0 10px"><strong>3. Reasoning loop.</strong> The model fetches CRM activity, scrapes the lead&rsquo;s company page, drafts a personalized email into the rep&rsquo;s Gmail drafts folder, and proposes two calendar slots from the rep&rsquo;s freebusy window.</p>
    <p style="margin:0"><strong>4. Human approval.</strong> The rep opens drafts, edits if needed, clicks send, and accepts a proposed slot. The agent never sends or commits to a meeting on its own.</p>
  </div>
</section>

<section id="capabilities">
  <div class="section-label">Tools the agent needs</div>
  <h2>What wmcp.sh provides.</h2>
  <table>
    <thead>
      <tr><th>Capability</th><th>Vendor</th><th>How wmcp.sh wires it</th></tr>
    </thead>
    <tbody>
      <tr><td><strong>Read &amp; update CRM records</strong></td><td>Salesforce / HubSpot</td><td class="ours">✅ Vendor OpenAPI spec via <a href="/integration/openapi" style="color:var(--accent2)">/integration/openapi</a></td></tr>
      <tr><td><strong>Create email drafts</strong></td><td>Gmail</td><td class="ours">✅ <a href="/integration/google" style="color:var(--accent2)">/integration/google</a> — <code>drafts.create</code> scoped only</td></tr>
      <tr><td><strong>Propose calendar slots</strong></td><td>Google Calendar</td><td class="ours">✅ <a href="/integration/google" style="color:var(--accent2)">/integration/google</a> — <code>freebusy.query</code> + <code>events.insert</code></td></tr>
      <tr><td><strong>Enrich a company URL</strong></td><td>Any public URL</td><td class="ours">✅ Generic <code>/api/v1/tools?url=...</code> extraction</td></tr>
      <tr><td><strong>Log the loop to CRM</strong></td><td>CRM activity API</td><td class="ours">✅ Same OpenAPI adapter, scoped to <code>activity.create</code></td></tr>
      <tr><td><strong>Approval / audit UI</strong></td><td>Your dashboard</td><td class="ours">✅ Included on <a href="/managed" style="color:var(--accent2)">/managed</a></td></tr>
    </tbody>
  </table>
</section>

<section id="code">
  <div class="section-label">Code</div>
  <h2>From new lead to draft + slot.</h2>
  <p class="section-sub">Minimal Python sketch using the Anthropic Messages API. The agent receives a lead ID and the rep&rsquo;s email, and ends by leaving a draft in Gmail plus two proposed calendar slots.</p>
  <pre><code><span class="k">import</span> os, httpx
<span class="k">from</span> anthropic <span class="k">import</span> Anthropic

client = Anthropic()
WMCP = <span class="s">"${origin}"</span>

<span class="k">def</span> tools_for(url):
    <span class="k">return</span> httpx.get(<span class="s">f"{WMCP}/api/v1/tools"</span>, params={<span class="s">"url"</span>: url}).json()[<span class="s">"tools"</span>]

tools = (
    tools_for(<span class="s">"https://acme.my.salesforce.com/services/data/v60.0"</span>)
    + tools_for(<span class="s">"https://gmail.googleapis.com"</span>)
    + tools_for(<span class="s">"https://www.googleapis.com/calendar/v3"</span>)
    + tools_for(<span class="s">"about:fetch"</span>)
)

lead_id, rep = os.environ[<span class="s">"LEAD_ID"</span>], os.environ[<span class="s">"REP_EMAIL"</span>]

msg = client.messages.create(
    model=<span class="s">"claude-sonnet-4-5"</span>,
    max_tokens=2048,
    tools=tools,
    messages=[{<span class="s">"role"</span>: <span class="s">"user"</span>,
        <span class="s">"content"</span>: <span class="s">f"Lead {lead_id}. Read CRM activity, scrape the company site, draft a "</span>
                   <span class="s">f"personalized opener into {rep}'s Gmail drafts, and propose two 30-min slots "</span>
                   <span class="s">"from their next-week freebusy. Never send. Never auto-confirm."</span>}],
)

<span class="k">print</span>(msg.content)</code></pre>
</section>

<section id="wins">
  <div class="section-label">Where we win</div>
  <h2>Glue code vs MCP gateway.</h2>
  <div class="wins-grid">
    <div class="wins-card">
      <h3>Per-vendor SDK build:</h3>
      <ul>
        <li>Salesforce, HubSpot, Gmail, Calendar — four SDKs minimum</li>
        <li>OAuth refresh handling rolled by hand for each</li>
        <li>Tool schemas drift when vendors update APIs</li>
        <li>Switching CRMs means rewriting the agent</li>
      </ul>
    </div>
    <div class="wins-card us">
      <h3>wmcp.sh tool gateway:</h3>
      <ul>
        <li>OpenAPI spec → MCP tools, one call</li>
        <li>Scope draft/send and read/write separately</li>
        <li>Edge-cached tool listings, sub-50ms</li>
        <li>Swap CRMs by swapping the spec URL</li>
      </ul>
    </div>
  </div>
</section>

<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions.</h2>
  <details><summary>What does an AI sales assistant actually do?</summary><div class="answer">Reads CRM history, enriches from the company site, drafts an opener, proposes calendar slots — all before the human SDR opens the record.</div></details>
  <details><summary>Which CRM systems are supported?</summary><div class="answer">Anything with OpenAPI: Salesforce, HubSpot, Pipedrive, Close, Attio.</div></details>
  <details><summary>How does it draft without sending?</summary><div class="answer">Scope the Gmail tool to <code>drafts.create</code> only. The rep clicks send.</div></details>
  <details><summary>Can it really book meetings?</summary><div class="answer">Yes — propose via freebusy, insert on human confirmation. Most teams gate this behind a single click.</div></details>
  <details><summary>How is this different from CRM-native AI?</summary><div class="answer">Built-in AI lives in one product. A custom MCP agent reads across CRM, inbox, calendar, and the open web in one loop and is portable across CRMs.</div></details>
</section>

<section id="related">
  <div class="section-label">Related</div>
  <h2>Keep exploring.</h2>
  <p class="section-sub">
    <a href="/integration/google" style="color:var(--accent2);text-decoration:none">/integration/google</a> &middot;
    <a href="/integration/openapi" style="color:var(--accent2);text-decoration:none">/integration/openapi</a> &middot;
    <a href="/agent-ready" style="color:var(--accent2);text-decoration:none">/agent-ready</a> &middot;
    <a href="/use-case/personal-assistant" style="color:var(--accent2);text-decoration:none">/use-case/personal-assistant</a> &middot;
    <a href="/use-case/customer-support" style="color:var(--accent2);text-decoration:none">/use-case/customer-support</a>
  </p>
</section>

</div>

<section id="upgrade" style="margin-top:36px;background:linear-gradient(135deg,var(--card),rgba(255,158,44,0.08));border:1px solid rgba(255,158,44,0.35);border-radius:16px;padding:22px 26px">
  <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;justify-content:space-between">
    <div style="flex:1;min-width:240px">
      <div style="font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent2);font-weight:700;margin-bottom:6px">Need this built for you?</div>
      <h3 style="margin:0 0 4px;font-size:1.05rem;color:var(--text)">Hosted SDR copilot, CRM-wired in days.</h3>
      <p style="color:var(--muted);margin:0;font-size:.92rem">Custom CRM + email + calendar adapter + hosted MCP at <code>mcp.yourbrand.com</code> + verified badge. <strong style="color:var(--text)">Starter $499 one-time</strong> · Managed Retainer $999/mo · Enterprise $4,999+/mo.</p>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <a href="/managed" style="display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#ff9e2c,#ffcf7a);color:#0c0c14;padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:700;font-size:.9rem">See /managed →</a>
      <a href="/directory/submit" style="display:inline-flex;align-items:center;gap:6px;background:#11111c;border:1px solid #26263a;color:var(--text);padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:600;font-size:.9rem">Submit (free)</a>
    </div>
  </div>
</section>

<footer>
  <a href="/">Home</a> · <a href="/agent-ready">Agent-ready</a> · <a href="/managed">Done for you</a> · <a href="/directory">Directory</a> · <a href="/directory/submit">Submit</a> · <a href="/blog">Blog</a> · <a href="/use-case/customer-support">Support</a> · <a href="/use-case/research-agent">Research</a> · <a href="/use-case/code-review-bot">Code review</a> · <a href="/use-case/personal-assistant">Personal assistant</a>
</footer>

</body>
</html>`;
}
