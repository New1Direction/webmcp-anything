export function forHrHtml(origin: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>MCP for HR | wmcp.sh</title>
<meta name="description" content="Empower HR and recruiting agents with MCP tools. Connect Greenhouse, Lever, Notion, and Calendar to Claude and other LLMs via wmcp.sh.">
<link rel="canonical" href="\${origin}/for/hr" />
<meta property="og:title" content="MCP for HR | wmcp.sh" />
<meta property="og:description" content="Empower HR and recruiting agents with MCP tools. Connect Greenhouse, Lever, Notion, and Calendar to Claude via wmcp.sh." />
<meta property="og:url" content="\${origin}/for/hr" />
<meta property="og:image" content="\${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="MCP for HR" />
<meta name="twitter:description" content="Empower HR and recruiting agents with MCP tools." />
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article","headline":"MCP for HR — AI agents for people-ops","description":"Connect HR AI agents to Greenhouse, Lever, Notion, and Calendar via the Model Context Protocol.","author":{"@type":"Organization","name":"WebMCP Anything"},"publisher":{"@type":"Organization","name":"WebMCP Anything","url":"https://wmcp.sh"},"datePublished":"2026-05-28","dateModified":"2026-05-28","mainEntityOfPage":"\${origin}/for/hr"}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
  {"@type":"Question","name":"Is wmcp.sh an EEOC-compliant decisionmaker?","acceptedAnswer":{"@type":"Answer","text":"No. wmcp.sh is integration infrastructure, not an automated employment decision tool. Final hiring decisions remain with humans. wmcp.sh is not affiliated with the EEOC."}},
  {"@type":"Question","name":"Which HR tools does wmcp.sh integrate with?","acceptedAnswer":{"@type":"Answer","text":"Greenhouse, Lever, Notion knowledge bases, Google/Outlook Calendar, and any ATS with a public OpenAPI specification. wmcp.sh is not affiliated with Greenhouse or Lever."}}
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
  <div class="badge"><span class="dot"></span> Industry &middot; HR</div>
  <h1>Agents for Human Resources.</h1>
  <p class="sub">Connect ATS platforms like Greenhouse and Lever, alongside Notion docs and Calendars, to LLM agents using the Model Context Protocol (MCP). Accelerate recruiting and onboarding with sub-100ms APIs.</p>
</header>

<section id="wedge">
  <div class="section-label">The Pipeline</div>
  <h2>Unified HR Stack.</h2>
  <div class="wins-grid">
    <div class="wins-card">
      <h3>Candidate screening</h3>
      <p style="color:var(--muted);margin:0 0 12px;font-size:.95rem;line-height:1.65">Empower agents to retrieve resumes, compare candidates against standard rubrics, and draft interview questions via standard ATS MCP tools.</p>
    </div>
    <div class="wins-card us">
      <h3>Employee onboarding</h3>
      <p style="color:var(--muted);margin:0 0 12px;font-size:.95rem;line-height:1.65">Coordinate multi-step onboarding: create Notion employee directories, schedule meetings via Calendar APIs, and send welcome emails, all driven by LLMs and our sub-100ms proxy.</p>
    </div>
  </div>
</section>

<section id="capabilities">
  <div class="section-label">Tools</div>
  <h2>HR capability integrations.</h2>
  <table>
    <thead>
      <tr><th>System</th><th>Capabilities</th><th>API Speed</th></tr>
    </thead>
    <tbody>
      <tr><td><strong>Greenhouse / Lever ATS</strong></td><td>Candidate lookup, interview scheduling, scorecard retrieval</td><td class="ours">✅ Under 100ms</td></tr>
      <tr><td><strong>Notion Docs</strong></td><td>Policy lookup, employee directory creation, handbook Q&A</td><td class="ours">✅ Under 100ms (cached schemas)</td></tr>
      <tr><td><strong>Calendar APIs</strong></td><td>Availability lookup, interview coordination, invite management</td><td class="ours">✅ Under 100ms</td></tr>
    </tbody>
  </table>
</section>

<section id="wins">
  <div class="section-label">Why MCP?</div>
  <h2>Agentic HR workflows.</h2>
  <div class="wins-grid">
    <div class="wins-card">
      <h3>Traditional workflows:</h3>
      <ul>
        <li>HR teams manually coordinating calendars between 4 different interviewers.</li>
        <li>Siloed onboarding where checklists live in Notion but actions happen in disparate SaaS tools.</li>
        <li>Writing repetitive internal scripts that break when an ATS updates its API.</li>
      </ul>
    </div>
    <div class="wins-card us">
      <h3>wmcp.sh enabled agents:</h3>
      <ul>
        <li>Agent coordinates the calendar, updates the Greenhouse scorecard, and creates the Notion onboarding doc autonomously.</li>
        <li>Uses our encrypted credentials vault for secure API keys.</li>
        <li>Dynamically updates tool schemas via <a href="/integration/openapi" style="color:var(--accent2);text-decoration:none">/integration/openapi</a> without hardcoding.</li>
      </ul>
    </div>
  </div>
</section>

<section id="live">
  <div class="section-label">Try wmcp.sh</div>
  <h2>Ingest an ATS spec instantly.</h2>
  <pre><code><span class="c"># Pass a public OpenAPI ATS spec to convert all paths into MCP tools</span>
<span class="k">curl</span> <span class="s">'${origin}/api/v1/tools?url=https://developers.greenhouse.io/openapi.yaml'</span>

<span class="c"># Example response: Tools for 'get_candidates', 'add_scorecard', etc.</span></code></pre>
</section>

<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common HR questions.</h2>
  <details><summary>Is an LLM agent an EEOC-compliant decisionmaker?</summary><div class="answer">No. <strong>Agents built with wmcp.sh should not be used as autonomous, unreviewed decisionmakers for hiring or firing.</strong> They are tools to assist human recruiters with scheduling, summarization, and coordination. Ensure human-in-the-loop for all final HR decisions to comply with EEOC and local labor laws.</div></details>
  <details><summary>How do agents authenticate with our ATS?</summary><div class="answer">For internal tools, you provide the API keys via our encrypted credentials vault. The LLM only receives tool definitions and results, never the raw tokens. Need an enterprise setup? See our <a href="/managed" style="color:var(--accent2);text-decoration:none">/managed</a> plans starting at $499 one-time.</div></details>
</section>

<section id="related">
  <div class="section-label">Related</div>
  <h2>Other use cases.</h2>
  <p class="section-sub">
    <a href="/for/marketing" style="color:var(--accent2);text-decoration:none">/for/marketing</a> &middot;
    <a href="/for/healthcare" style="color:var(--accent2);text-decoration:none">/for/healthcare</a> &middot;
    <a href="/blog" style="color:var(--accent2);text-decoration:none">/blog</a> &middot;
    <a href="/agent-ready" style="color:var(--accent2);text-decoration:none">/agent-ready</a> &middot;
    <a href="/managed" style="color:var(--accent2);text-decoration:none">/managed</a>
  </p>
</section>

<div class="disclaimer">
  Disclaimer: wmcp.sh is not affiliated with Greenhouse, Lever, Notion, Google, OpenAI, or Anthropic. <strong>wmcp.sh is not an EEOC-compliant decisionmaker and does not provide legal or HR advice.</strong> All product names and brands are property of their respective owners.
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
