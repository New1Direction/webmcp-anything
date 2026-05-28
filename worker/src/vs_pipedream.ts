// /vs/pipedream — comparison page. SERP target: "pipedream alternative",
// "wmcp.sh vs pipedream", "pipedream mcp", "pipedream competitor".

export function vsPipedreamHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>wmcp.sh vs Pipedream — when each wins, honest comparison | wmcp.sh</title>
<meta name="description" content="Pipedream is a serverless workflow + integration platform with 2000+ connectors. wmcp.sh is shopper-side + OpenAPI ingest + MCP-native. Different shapes; here's the honest matrix." />
<link rel="canonical" href="${origin}/vs/pipedream" />
<meta property="og:title" content="wmcp.sh vs Pipedream — honest head-to-head" />
<meta property="og:description" content="Pipedream is workflow automation with massive connector library. wmcp.sh is URL→MCP-tools for agents." />
<meta property="og:url" content="${origin}/vs/pipedream" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="wmcp.sh vs Pipedream" />
<meta name="twitter:description" content="Honest head-to-head. Workflow automation vs URL→MCP for agents." />
<meta name="twitter:image" content="${origin}/og.png" />
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article","headline":"wmcp.sh vs Pipedream — honest head-to-head","description":"Pipedream is workflow automation. wmcp.sh is URL→MCP-tools for agents. Different shapes.","author":{"@type":"Organization","name":"WebMCP Anything"},"publisher":{"@type":"Organization","name":"WebMCP Anything","url":"https://wmcp.sh"},"datePublished":"2026-05-28","dateModified":"2026-05-28","mainEntityOfPage":"${origin}/vs/pipedream"}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
  {"@type":"Question","name":"What's the difference between wmcp.sh and Pipedream?","acceptedAnswer":{"@type":"Answer","text":"Pipedream is a workflow automation platform — you build multi-step flows triggered by events (webhooks, schedules, queues), each step calls one of 2000+ pre-built integrations. wmcp.sh exposes any URL as MCP tools your AI agent can call directly. Pipedream is about chaining steps; wmcp.sh is about exposing surface for agents to drive. They serve different jobs."}},
  {"@type":"Question","name":"When should I pick Pipedream?","acceptedAnswer":{"@type":"Answer","text":"When you're building backend workflows: 'when X happens, do Y then Z'. Their 2000+ integrations cover almost every SaaS. Their visual builder + free tier are excellent for non-agent flows. Pick Pipedream if you're triggering automations from events, not letting an agent reason about which tool to call next."}},
  {"@type":"Question","name":"When should I pick wmcp.sh?","acceptedAnswer":{"@type":"Answer","text":"When you're building an AI agent that needs to call tools dynamically — Claude / Cursor / Codex deciding which MCP tool to invoke. wmcp.sh exposes ANY URL as MCP tools an agent can choose from. Pipedream's connectors are designed for human-defined workflows; they don't translate cleanly to agent tool_use."}},
  {"@type":"Question","name":"Can I use both?","acceptedAnswer":{"@type":"Answer","text":"Yes. Use Pipedream for backend event-driven workflows. Use wmcp.sh for the agent-facing tool layer. Many teams use Pipedream as a webhook receiver that feeds wmcp.sh-exposed APIs an agent then queries."}},
  {"@type":"Question","name":"Pricing comparison?","acceptedAnswer":{"@type":"Answer","text":"Pipedream: free 10k invocations/mo, then $19/mo for 1M invocations. wmcp.sh: free 100 reads/day anonymous, $29/mo Pro for 10k/day reads+executes. Different metering — Pipedream charges per workflow execution, wmcp.sh charges per tool call."}},
  {"@type":"Question","name":"Does Pipedream do MCP?","acceptedAnswer":{"@type":"Answer","text":"Not as a primary product. They have some agent-related features but their core surface is workflow steps, not MCP tool_use shapes. wmcp.sh is MCP-native: every URL output is shaped for MCP clients (Claude.ai, Cursor, Codex, OpenCode, mcp-remote) directly."}}
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
  <div class="badge"><span class="dot"></span> head-to-head &middot; honest framing</div>
  <h1>wmcp.sh vs Pipedream.</h1>
  <p class="sub">Pipedream is a serverless workflow + integration platform with 2000+ connectors — built for backend event-driven automations. wmcp.sh is a different shape: URL → MCP tools for AI agents to call. Both legit, different jobs.</p>
</header>

<section id="wedge">
  <div class="section-label">The shape difference</div>
  <h2>One sentence each.</h2>
  <div class="wins-grid">
    <div class="wins-card">
      <h3>Pipedream</h3>
      <p style="color:var(--muted);margin:0 0 12px;font-size:.95rem;line-height:1.65">A workflow automation platform — visual + code-first multi-step flows triggered by events (webhooks, schedules, queues). 2000+ pre-built integrations, generous free tier, mature platform.</p>
    </div>
    <div class="wins-card us">
      <h3>wmcp.sh</h3>
      <p style="color:var(--muted);margin:0 0 12px;font-size:.95rem;line-height:1.65">A worker that turns any URL into MCP tools an AI agent can call dynamically. Agent-first surface — Claude / Cursor / Codex decide which tool to invoke at runtime.</p>
    </div>
  </div>
</section>

<section id="capabilities">
  <div class="section-label">Side-by-side</div>
  <h2>The capability matrix.</h2>
  <table>
    <thead>
      <tr><th>Capability</th><th>Pipedream</th><th>wmcp.sh</th></tr>
    </thead>
    <tbody>
      <tr><td><strong>Trigger-based workflows</strong><br /><small style="color:var(--dim)">"when X event happens, do Y"</small></td><td>✅ Core feature, mature</td><td class="ours">❌ Not the goal — wmcp.sh is request/response, not event-driven</td></tr>
      <tr><td><strong>Pre-built SaaS connectors</strong></td><td>✅ 2000+ curated</td><td class="ours">⚠️ Covers via OpenAPI ingest, but no per-provider hand-tuning</td></tr>
      <tr><td><strong>Agent tool_use shape</strong><br /><small style="color:var(--dim)">Claude / OpenAI function_call / MCP</small></td><td>⚠️ Some agent features; not MCP-native</td><td class="ours">✅ MCP / tool_use / function_call shapes, native</td></tr>
      <tr><td><strong>Shopper-side commerce</strong></td><td>❌ Not in scope</td><td class="ours">✅ Shopify storefronts (4M+ stores) out of the box</td></tr>
      <tr><td><strong>Oracle / price-data</strong><br /><small style="color:var(--dim)">CoinGecko, Pyth, Chainlink, DefiLlama</small></td><td>❌ Not in scope</td><td class="ours">✅ 5 adapters at <a href="/price-data" style="color:var(--accent2);text-decoration:none">/price-data</a></td></tr>
      <tr><td><strong>OAuth-proxy for MCP servers</strong></td><td>❌ Not in scope</td><td class="ours">✅ RFC 7591 DCR + PKCE proxy at /mcp/&lt;provider&gt;</td></tr>
      <tr><td><strong>Free tier</strong></td><td>10k invocations/mo</td><td class="ours">100 reads/day anonymous, no signup</td></tr>
      <tr><td><strong>Open source</strong></td><td>Components open, platform closed</td><td class="ours">Worker + adapters MIT</td></tr>
      <tr><td><strong>Run on the edge</strong></td><td>Centralized</td><td class="ours">Cloudflare Workers, 300+ POPs</td></tr>
    </tbody>
  </table>
</section>

<section id="wins">
  <div class="section-label">Where each wins</div>
  <h2>The honest version.</h2>
  <div class="wins-grid">
    <div class="wins-card">
      <h3>Pipedream wins when:</h3>
      <ul>
        <li>You're building event-driven backend automations (webhook → process → forward)</li>
        <li>You need 2000+ SaaS connectors hand-curated for stability</li>
        <li>You want a generous free tier for non-agent workflow execution</li>
        <li>You need a visual builder for non-technical operators</li>
      </ul>
    </div>
    <div class="wins-card us">
      <h3>wmcp.sh wins when:</h3>
      <ul>
        <li>You're building an AI agent that decides which tool to call (vs. fixed workflow steps)</li>
        <li>You need MCP-native — Claude.ai / Cursor / Codex / OpenCode plug into wmcp.sh directly</li>
        <li>You need shopper-side, oracle, or DeFi adapters (Pipedream doesn't ship these)</li>
        <li>You want OAuth-proxy so OAuth-gated MCP servers (DefiLlama, etc.) work in agents that can't drive OAuth themselves</li>
      </ul>
    </div>
  </div>
</section>

<section id="live">
  <div class="section-label">Try wmcp.sh</div>
  <h2>One curl.</h2>
  <pre><code><span class="k">curl</span> <span class="s">'${origin}/api/v1/tools?url=https://api.llama.fi/protocols'</span>
<span class="c"># 6 DeFi MCP tools, agent-ready. No signup, no workflow builder.</span></code></pre>
</section>

<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions.</h2>
  <details><summary>What's the difference?</summary><div class="answer">Pipedream chains pre-defined workflow steps triggered by events. wmcp.sh exposes URLs as MCP tools an agent calls dynamically. Different jobs.</div></details>
  <details><summary>When pick Pipedream?</summary><div class="answer">Event-driven backend flows. 2000+ connectors. Generous free tier.</div></details>
  <details><summary>When pick wmcp.sh?</summary><div class="answer">Agent-facing tool layer. MCP-native. Shopper-side + OpenAPI ingest + oracle/DeFi.</div></details>
  <details><summary>Can I use both?</summary><div class="answer">Yes. Pipedream for backend automations + wmcp.sh as the agent-facing tool layer.</div></details>
  <details><summary>Pricing?</summary><div class="answer">Pipedream: free 10k invocations/mo, $19/mo for 1M. wmcp.sh: free 100/day anonymous, $29/mo Pro for 10k/day.</div></details>
  <details><summary>Does Pipedream do MCP?</summary><div class="answer">Not as a primary product. wmcp.sh is MCP-native: every URL output is shaped for MCP clients directly.</div></details>
</section>

<section id="related">
  <div class="section-label">Related</div>
  <h2>Other comparisons.</h2>
  <p class="section-sub">
    <a href="/vs/composio" style="color:var(--accent2);text-decoration:none">/vs/composio</a> &middot;
    <a href="/vs/zapier" style="color:var(--accent2);text-decoration:none">/vs/zapier</a> &middot;
    <a href="/agent-ready" style="color:var(--accent2);text-decoration:none">/agent-ready</a> &middot;
    <a href="/managed" style="color:var(--accent2);text-decoration:none">/managed</a>
  </p>
</section>

</div>

<footer>
  <a href="/">Home</a> · <a href="/agent-ready">Agent-ready</a> · <a href="/managed">Done for you</a> · <a href="/price-data">Price data</a> · <a href="/integration/openapi">OpenAPI</a> · <a href="/directory">Directory</a> · <a href="https://github.com/New1Direction/webmcp-anything">GitHub</a>
</footer>

</body>
</html>`;
}
