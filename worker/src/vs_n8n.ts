// /vs/n8n — comparison page. SERP target: "n8n alternative",
// "wmcp.sh vs n8n", "n8n mcp", "n8n competitor".

export function vsN8nHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>wmcp.sh vs n8n — when each wins, honest comparison | wmcp.sh</title>
<meta name="description" content="n8n is an open-source, visual node-based workflow automation tool. wmcp.sh is a stateless, edge-hosted MCP gateway built for AI agents. Here's the honest comparison." />
<link rel="canonical" href="${origin}/vs/n8n" />
<meta property="og:title" content="wmcp.sh vs n8n — honest head-to-head" />
<meta property="og:description" content="n8n is open-source visual workflow automation. wmcp.sh is URL→MCP-tools for AI agents." />
<meta property="og:url" content="${origin}/vs/n8n" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="wmcp.sh vs n8n" />
<meta name="twitter:description" content="Honest head-to-head. Open-source node workflow vs URL→MCP for agents." />
<meta name="twitter:image" content="${origin}/og.png" />
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article","headline":"wmcp.sh vs n8n — honest head-to-head","description":"n8n is open-source visual workflow automation. wmcp.sh is URL→MCP-tools for agents. Different shapes.","author":{"@type":"Organization","name":"WebMCP Anything"},"publisher":{"@type":"Organization","name":"WebMCP Anything","url":"https://wmcp.sh"},"datePublished":"2026-05-28","dateModified":"2026-05-28","mainEntityOfPage":"${origin}/vs/n8n"}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
  {"@type":"Question","name":"What's the difference between wmcp.sh and n8n?","acceptedAnswer":{"@type":"Answer","text":"n8n is an open-source, node-based workflow automation platform where you construct visual multi-step flows triggered by events. wmcp.sh is a stateless edge gateway that maps public APIs and storefronts dynamically into standardized MCP tool schemas for AI agents. They serve different tasks."}},
  {"@type":"Question","name":"When should I pick n8n?","acceptedAnswer":{"@type":"Answer","text":"Choose n8n when you want a self-hosted, open-source visual workflow manager to chain cron jobs, sync databases, and route webhooks without writing heavy code. n8n is excellent for fixed multi-step automations."}},
  {"@type":"Question","name":"When should I pick wmcp.sh?","acceptedAnswer":{"@type":"Answer","text":"Pick wmcp.sh when building real-time interactive AI agents (like Claude Desktop, Claude Code, or Cursor) that need to discover and invoke tools dynamically based on raw user intent. wmcp.sh is MCP-native and resolves requests in under 50ms."}}
]}
</script>
<style>
  :root { --bg:#07070d;--card:#16161f;--bg2:#11111c;--border:#26263a;--text:#ececf5;--muted:#8a8aa8;--dim:#6a6a88;--accent:#7c5cff;--accent2:#00e5ff;--green:#4ade80;--red:#f87171;--pink:#f0abfc; }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin:0;min-height:100vh;color:var(--text);background:var(--bg);font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif;line-height:1.6;background-image:radial-gradient(ellipse 900px 600px at 10% -5%,rgba(124,92,255,.18),transparent 60%),radial-gradient(ellipse 700px 500px at 95% 10%,rgba(0,229,255,.10),transparent 60%); }
  .wrap { max-width: 920px; margin: 0 auto; padding: 0 24px; }
  nav { display:flex;justify-content:space-between;align-items:center;padding:22px 24px;max-width:1080px;margin:0 auto; }
  nav .brand { font-weight: 800; letter-spacing: -.02em; font-size: 1.05rem; }
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
  <a class="cta" href="/dashboard">Dashboard →</a>
</nav>

<div class="wrap">

<header class="hero">
  <div class="badge"><span class="dot"></span> head-to-head &middot; honest comparison</div>
  <h1>wmcp.sh vs n8n.</h1>
  <p class="sub">n8n is an open-source, visual node-based workflow automation tool with extensive database synchronizations. wmcp.sh is a stateless, edge-hosted MCP gateway designed for AI agent tool execution. Different tools; here is the honest matrix.</p>
</header>

<section id="wedge">
  <div class="section-label">The core difference</div>
  <h2>One sentence each.</h2>
  <div class="wins-grid">
    <div class="wins-card">
      <h3>n8n</h3>
      <p style="color:var(--muted);margin:0 0 12px;font-size:.95rem;line-height:1.65">An open-source workflow automation platform—visual node graphs to connect webhooks, schedules, databases, and cron tasks with local custom code execution blocks.</p>
    </div>
    <div class="wins-card us">
      <h3>wmcp.sh</h3>
      <p style="color:var(--muted);margin:0 0 12px;font-size:.95rem;line-height:1.65">A stateless edge gateway that dynamically compiles public APIs and storefronts into standardized Model Context Protocol tools, resolved in under 50ms.</p>
    </div>
  </div>
</section>

<section id="capabilities">
  <div class="section-label">Side-by-side</div>
  <h2>The capability matrix.</h2>
  <table>
    <thead>
      <tr><th>Capability</th><th>n8n</th><th>wmcp.sh</th></tr>
    </thead>
    <tbody>
      <tr><td><strong>Visual Node Editor</strong></td><td>✅ Core feature, highly mature</td><td class="ours">❌ Out of scope — wmcp.sh is spec-to-tool API mapping</td></tr>
      <tr><td><strong>Self-Hosted Community Tier</strong></td><td>✅ Native, highly active</td><td class="ours">⚠️ Open source Worker but requires Cloudflare Workers</td></tr>
      <tr><td><strong>AI Agent Tool Calling</strong></td><td>⚠️ Visual nodes triggers</td><td class="ours">✅ MCP-native, zero-codegen tools</td></tr>
      <tr><td><strong>Resolution Latency</strong></td><td>⚠️ Workflow VM execution; cold-start can hit hundreds of ms to seconds</td><td class="ours">✅ Sub-50ms edge resolution</td></tr>
      <tr><td><strong>Shopper-Side Commerce</strong></td><td>❌ Not supported</td><td class="ours">✅ Shopify storefronts (4M+ stores) resolved natively</td></tr>
      <tr><td><strong>Credentials Vault Proxy</strong></td><td>❌ Not supported</td><td class="ours">✅ Built-in PKCE token isolation proxy</td></tr>
    </tbody>
  </table>
</section>

<section id="wins">
  <div class="section-label">Where each wins</div>
  <h2>Honest evaluation.</h2>
  <div class="wins-grid">
    <div class="wins-card">
      <h3>n8n wins when:</h3>
      <ul>
        <li>You want a self-hosted, open-source workflow automation platform</li>
        <li>You are building fixed, multi-step integrations and webhook routers</li>
        <li>You prefer a visual, node-based flowchart editor</li>
      </ul>
    </div>
    <div class="wins-card us">
      <h3>wmcp.sh wins when:</h3>
      <ul>
        <li>You are building real-time interactive AI agents (Claude Desktop, Cursor, Claude Code)</li>
        <li>You require zero-codegen OpenAPI-to-MCP tool translations</li>
        <li>You require secure, out-of-band credentials proxying</li>
      </ul>
    </div>
  </div>
</section>

<section id="live">
  <div class="section-label">Try wmcp.sh</div>
  <h2>One curl.</h2>
  <pre><code><span class="k">curl</span> <span class="s">'${origin}/api/v1/tools?url=https://api.llama.fi/protocols'</span>
<span class="c"># Exposes DeFi MCP tools instantly at edge speeds. No visual nodes required.</span></code></pre>
</section>

<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions.</h2>
  <details><summary>What's the difference?</summary><div class="answer">n8n is a visual workflow builder that chains fixed steps. wmcp.sh is a stateless edge proxy that translates public specs to standard tool definitions for agents to decide what to call.</div></details>
  <details><summary>When pick n8n?</summary><div class="answer">Visual, self-hosted multi-step webhook syncs and background automations.</div></details>
  <details><summary>When pick wmcp.sh?</summary><div class="answer">Interactive chat agent tool bindings (Cursor, Claude Code) requiring sub-50ms Edge execution.</div></details>
</section>

<section id="related">
  <div class="section-label">Related</div>
  <h2>Other comparisons.</h2>
  <p class="section-sub">
    <a href="/vs/composio" style="color:var(--accent2);text-decoration:none">/vs/composio</a> &middot;
    <a href="/vs/pipedream" style="color:var(--accent2);text-decoration:none">/vs/pipedream</a> &middot;
    <a href="/agent-ready" style="color:var(--accent2);text-decoration:none">/agent-ready</a> &middot;
    <a href="/managed" style="color:var(--accent2);text-decoration:none">/managed</a>
  </p>
</section>

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
  <a href="/">Home</a> · <a href="/agent-ready">Agent-ready</a> · <a href="/managed">Done for you</a> · <a href="/price-data">Price data</a> · <a href="/integration/openapi">OpenAPI</a> · <a href="/directory">Directory</a> · <a href="/directory/submit">Submit</a> · <a href="https://github.com/New1Direction/webmcp-anything">GitHub</a>
</footer>

</body>
</html>`;
}
