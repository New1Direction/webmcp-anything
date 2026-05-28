export function forMarketingHtml(origin: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>MCP for Marketing | wmcp.sh</title>
<meta name="description" content="Empower multi-channel marketing agents with MCP tools. Connect HubSpot, Salesforce, Mailchimp, SendGrid, and Stripe to Claude and other LLMs via wmcp.sh.">
<link rel="canonical" href="\${origin}/for/marketing" />
<meta property="og:title" content="MCP for Marketing | wmcp.sh" />
<meta property="og:description" content="Connect multi-channel marketing agents to HubSpot, Salesforce, Mailchimp, SendGrid, and Stripe via wmcp.sh." />
<meta property="og:url" content="\${origin}/for/marketing" />
<meta property="og:image" content="\${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="MCP for Marketing" />
<meta name="twitter:description" content="MCP tools for multi-channel marketing agents." />
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article","headline":"MCP for Marketing — multi-channel campaign agents","description":"Connect marketing AI agents to HubSpot, Salesforce, Mailchimp, SendGrid, and Stripe via the Model Context Protocol.","author":{"@type":"Organization","name":"WebMCP Anything"},"publisher":{"@type":"Organization","name":"WebMCP Anything","url":"https://wmcp.sh"},"datePublished":"2026-05-28","dateModified":"2026-05-28","mainEntityOfPage":"\${origin}/for/marketing"}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
  {"@type":"Question","name":"Which marketing platforms work with wmcp.sh?","acceptedAnswer":{"@type":"Answer","text":"HubSpot and Salesforce CRMs via OpenAPI, Mailchimp and SendGrid for email, and Stripe for revenue attribution. wmcp.sh is not affiliated with HubSpot, Salesforce, Mailchimp, SendGrid, or Stripe."}},
  {"@type":"Question","name":"Can agents send emails directly?","acceptedAnswer":{"@type":"Answer","text":"Yes, via the SendGrid or Mailchimp adapters with stored API keys. Tokens stay in the wmcp.sh encrypted credentials vault — agents never see raw keys."}}
]}
</script>
<style>
  :root { --bg: #0c0c14; --bg2: #11111c; --card: #161622; --border: #26263a; --text: #f0f0f5; --muted: #a0a0b0; --dim: #606070; --accent: #7c5cff; --accent2: #00e5ff; --pink: #ff3366; --green: #00e676; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: var(--bg); color: var(--text); margin: 0; padding: 0; line-height: 1.6; }
  .wrap { max-width: 920px; margin: 0 auto; padding: 0 24px; }
  nav { display:flex;justify-content:space-between;align-items:center;padding:22px 24px;max-width:1080px;margin:0 auto; }
  nav .brand { font-weight: 800; letter-spacing: -.02em; font-size: 1.05rem; }
  nav .brand span { color: var(--accent2); }
  nav .links { display: flex; gap: 22px; font-size: .9rem; }
  nav .links a { color: var(--muted); text-decoration: none; }
  nav .links a:hover { color: var(--text); }
  nav .cta { background: var(--bg2); border: 1px solid var(--border); padding: 7px 14px; border-radius: 8px; font-size: .85rem; color: var(--text); text-decoration: none; font-weight: 600; }
  header.hero { padding: 50px 0 30px; }
  .badge { display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;font-size:.7rem;letter-spacing:.15em;text-transform:uppercase;font-weight:700;background:linear-gradient(90deg,rgba(124,92,255,.18),rgba(0,229,255,.18));border:1px solid rgba(124,92,255,.35);margin-bottom:18px; }
  .dot { width:6px;height:6px;background:var(--accent2);border-radius:50%;box-shadow:0 0 8px var(--accent2); }
  h1 { font-size:clamp(2rem,4.5vw,3rem);margin:0 0 18px;background:linear-gradient(135deg,#fff 30%,var(--accent2) 100%);-webkit-background-clip:text;background-clip:text;color:transparent;line-height:1.05;font-weight:800;letter-spacing:-.02em; }
  .sub { color: var(--muted); font-size: 1.05rem; max-width: 640px; margin: 0 0 24px; }
  section { padding: 36px 0; }
  .section-label { display:inline-block;font-size:.72rem;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--accent2);margin-bottom:10px; }
  h2 { font-size:clamp(1.4rem,3vw,1.9rem);margin:0 0 12px;font-weight:700;letter-spacing:-.02em; }
  .section-sub { color: var(--muted); max-width: 640px; margin: 0 0 24px; }
  pre { background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px 18px;overflow-x:auto;font-size:.82rem;color:var(--green);font-family:"SF Mono",Menlo,monospace;line-height:1.5;margin:14px 0; }
  pre .k { color: var(--accent2); } pre .s { color: var(--pink); } pre .c { color: var(--dim); }
  table { width: 100%; border-collapse: collapse; text-align: left; font-size: .9rem; margin-top: 16px; }
  th, td { padding: 14px 16px; border-bottom: 1px solid var(--border); vertical-align: top; }
  th { background: var(--bg2); font-weight: 700; color: var(--accent2); }
  tr:last-child td { border-bottom: none; }
  details { background:var(--card);border:1px solid var(--border);border-radius:12px;padding:18px 20px;margin-bottom:12px; }
  details summary { font-weight: 700; font-size: 1rem; color: var(--text); cursor: pointer; list-style: none; }
  details[open] summary { margin-bottom: 12px; }
  details .answer { color: var(--muted); font-size: .92rem; line-height: 1.65; }
  .wins-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 18px; }
  @media (max-width: 720px) { .wins-grid { grid-template-columns: 1fr; } }
  .wins-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 22px; }
  .wins-card.us { border-color: var(--accent); background: linear-gradient(135deg, var(--card), rgba(124,92,255,0.06)); }
  .wins-card h3 { color: var(--text); margin-bottom: 12px; }
  .wins-card.us h3 { color: var(--accent2); }
  .wins-card ul { color: var(--muted); padding-left: 20px; margin: 0; font-size: .92rem; line-height: 1.7; }
  .wins-card li { margin-bottom: 6px; }
  footer { border-top:1px solid var(--border);margin-top:40px;padding:30px 0;text-align:center;color:var(--muted);font-size:.85rem; }
  footer a { color: var(--accent2); text-decoration: none; margin: 0 8px; }
  .disclaimer { font-size: 0.8rem; color: var(--dim); margin-top: 20px; font-style: italic; }
</style>
</head>
<body>

<nav>
  <div class="brand"><a href="/" style="color:inherit;text-decoration:none">wmcp<span>.sh</span></a></div>
  <div class="links">
    <a href="/agent-ready">Agent-ready</a>
    <a href="/managed">Done for you</a>
    <a href="/price-data">Price data</a>
    <a href="/integration/openapi">OpenAPI</a>
    <a href="/directory">Directory</a>
  </div>
  <a class="cta" href="/directory/submit">Submit App →</a>
</nav>

<div class="wrap">

<header class="hero">
  <div class="badge"><span class="dot"></span> Industry &middot; Marketing</div>
  <h1>Agents for Multi-Channel Marketing.</h1>
  <p class="sub">Connect HubSpot, Salesforce CRM, Mailchimp, SendGrid, and Stripe revenue data to LLM agents using the Model Context Protocol (MCP). Sub-100ms endpoints for real-time campaign attribution and copy generation.</p>
</header>

<section id="wedge">
  <div class="section-label">The Pipeline</div>
  <h2>Unified Marketing Stack.</h2>
  <div class="wins-grid">
    <div class="wins-card">
      <h3>Multi-channel execution</h3>
      <p style="color:var(--muted);margin:0 0 12px;font-size:.95rem;line-height:1.65">Give agents the ability to draft copy, sync audiences in Mailchimp/SendGrid, and update lead statuses in HubSpot—all seamlessly via standard MCP tools.</p>
    </div>
    <div class="wins-card us">
      <h3>Revenue attribution</h3>
      <p style="color:var(--muted);margin:0 0 12px;font-size:.95rem;line-height:1.65">Link campaign deployments with actual Stripe checkout events in real-time. Cloudflare Workers cache queries with a short TTL (~1s) ensuring agents always see fresh performance metrics.</p>
    </div>
  </div>
</section>

<section id="capabilities">
  <div class="section-label">Tools</div>
  <h2>Marketing capability integrations.</h2>
  <table>
    <thead>
      <tr><th>System</th><th>Capabilities</th><th>API Speed</th></tr>
    </thead>
    <tbody>
      <tr><td><strong>HubSpot via OpenAPI</strong></td><td>Lead lookup, timeline events, list segmentation, contact creation</td><td class="ours">✅ Under 100ms</td></tr>
      <tr><td><strong>Salesforce CRM</strong></td><td>Account records, opportunity tracking, custom objects integration</td><td class="ours">✅ Under 100ms</td></tr>
      <tr><td><strong>Mailchimp / SendGrid</strong></td><td>Subscriber sync, transactional email dispatch, campaign analytics</td><td class="ours">✅ Under 100ms</td></tr>
      <tr><td><strong>Stripe Revenue</strong></td><td>Subscription lifecycle events, payment intents, customer LTV tracking</td><td class="ours">✅ Under 100ms (short-TTL cache, ~1s)</td></tr>
    </tbody>
  </table>
</section>

<section id="wins">
  <div class="section-label">Why MCP?</div>
  <h2>Agentic marketing workflows.</h2>
  <div class="wins-grid">
    <div class="wins-card">
      <h3>Traditional workflows:</h3>
      <ul>
        <li>Manual copy pasting between ChatGPT, Docs, and CRMs.</li>
        <li>Siloed attribution where marketing emails and Stripe conversions sit in separate platforms.</li>
        <li>Static API scripts that require constant developer maintenance when endpoints change.</li>
      </ul>
    </div>
    <div class="wins-card us">
      <h3>wmcp.sh enabled agents:</h3>
      <ul>
        <li>Agent drafts copy, pulls real-time LTV from Stripe, and updates the Salesforce contact in one autonomous loop.</li>
        <li>Uses our encrypted credentials vault for secure static key storage without exposing tokens.</li>
        <li>Auto-updates tool schemas dynamically via <a href="/integration/openapi" style="color:var(--accent2);text-decoration:none">/integration/openapi</a> without hardcoding.</li>
      </ul>
    </div>
  </div>
</section>

<section id="live">
  <div class="section-label">Try wmcp.sh</div>
  <h2>Ingest a CRM spec instantly.</h2>
  <pre><code><span class="c"># Pass a public OpenAPI CRM spec to convert all paths into MCP tools</span>
<span class="k">curl</span> <span class="s">'${origin}/api/v1/tools?url=https://api.hubspot.com/openapi/crm/v3/contacts.yaml'</span>

<span class="c"># Example response: Tools for 'create_contact', 'update_contact', 'search_contacts', etc.</span></code></pre>
</section>

<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common marketing questions.</h2>
  <details><summary>How do agents authenticate with HubSpot or Mailchimp?</summary><div class="answer">For static service-level integrations (like internal marketing agents), use our encrypted credentials vault to supply API keys safely without passing them to the LLM directly.</div></details>
  <details><summary>Can agents act autonomously on my Salesforce instance?</summary><div class="answer">Agents act only based on the tool schemas provided. We recommend using read-only API keys or strict scoping, combined with human-in-the-loop approvals for destructive actions. Need help configuring this? See our <a href="/managed" style="color:var(--accent2);text-decoration:none">/managed</a> plans starting at $499 one-time.</div></details>
</section>

<section id="related">
  <div class="section-label">Related</div>
  <h2>Other use cases.</h2>
  <p class="section-sub">
    <a href="/for/hr" style="color:var(--accent2);text-decoration:none">/for/hr</a> &middot;
    <a href="/for/healthcare" style="color:var(--accent2);text-decoration:none">/for/healthcare</a> &middot;
    <a href="/blog" style="color:var(--accent2);text-decoration:none">/blog</a> &middot;
    <a href="/agent-ready" style="color:var(--accent2);text-decoration:none">/agent-ready</a> &middot;
    <a href="/managed" style="color:var(--accent2);text-decoration:none">/managed</a>
  </p>
</section>

<div class="disclaimer">
  Disclaimer: wmcp.sh is not affiliated with HubSpot, Salesforce, Mailchimp, SendGrid, Stripe, OpenAI, or Anthropic. All product names and brands are property of their respective owners.
</div>

</div>

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

<footer>
  <a href="/">Home</a> · <a href="/agent-ready">Agent-ready</a> · <a href="/managed">Done for you</a> · <a href="/price-data">Price data</a> · <a href="/integration/openapi">OpenAPI</a> · <a href="/directory">Directory</a> · <a href="/directory/submit">Submit</a>
</footer>

</body>
</html>`;
}
