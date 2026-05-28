// /vs/zapier — comparison page. SERP target: "zapier alternative",
// "zapier mcp", "zapier ai agent", "zapier for ai".

export function vsZapierHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>wmcp.sh vs Zapier — when each wins, honest comparison | wmcp.sh</title>
<meta name="description" content="Zapier is the no-code workflow incumbent with 6000+ apps. wmcp.sh is URL→MCP for AI agents. Different shapes, different jobs. Honest matrix." />
<link rel="canonical" href="${origin}/vs/zapier" />
<meta property="og:title" content="wmcp.sh vs Zapier — honest head-to-head" />
<meta property="og:description" content="Zapier is the incumbent no-code workflow tool. wmcp.sh is MCP-native URL→tools. Different jobs." />
<meta property="og:url" content="${origin}/vs/zapier" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="wmcp.sh vs Zapier" />
<meta name="twitter:description" content="Zapier is the no-code workflow incumbent. wmcp.sh is MCP-native for agents." />
<meta name="twitter:image" content="${origin}/og.png" />
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article","headline":"wmcp.sh vs Zapier — honest head-to-head","description":"Zapier is the no-code workflow incumbent. wmcp.sh is MCP-native for AI agents.","author":{"@type":"Organization","name":"WebMCP Anything"},"publisher":{"@type":"Organization","name":"WebMCP Anything","url":"https://wmcp.sh"},"datePublished":"2026-05-28","dateModified":"2026-05-28","mainEntityOfPage":"${origin}/vs/zapier"}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
  {"@type":"Question","name":"Why would I compare these — they're so different?","acceptedAnswer":{"@type":"Answer","text":"Two reasons people end up googling this: (1) they want their AI agent to do what they used to do in Zapier, and they're trying to figure out if Zapier's new AI features replace MCP, or if they should use both; (2) they hear 'Zapier alternative' and assume it includes AI-agent infrastructure. wmcp.sh isn't a Zapier replacement — it's the agent-facing tool layer. If you have a Zapier Zap doing 'when Slack message, create Notion page', wmcp.sh doesn't replace that. But if you have an AI agent that needs to call Notion to create pages when asked, that's wmcp.sh's job."}},
  {"@type":"Question","name":"When should I pick Zapier?","acceptedAnswer":{"@type":"Answer","text":"For traditional no-code workflow automation: triggers, multi-step Zaps, 6000+ apps, polished UX for non-technical users. Zapier is mature, reliable, and pays for itself fast in any team that needs cross-app automation without code. Their AI features are real but optional — the core product is workflows."}},
  {"@type":"Question","name":"When should I pick wmcp.sh?","acceptedAnswer":{"@type":"Answer","text":"When you're building an AI agent — Claude.ai connector, Cursor MCP server, Codex tool — that needs to call external systems dynamically. wmcp.sh exposes any URL as MCP tools the agent can decide to call at runtime. Zapier's workflows are human-defined; wmcp.sh's tools are agent-discoverable."}},
  {"@type":"Question","name":"Does Zapier do MCP?","acceptedAnswer":{"@type":"Answer","text":"Zapier has launched 'Zapier MCP' which exposes some Zapier actions as MCP tools — but it's a thin wrapper on their existing platform, scoped to apps they curate. wmcp.sh is MCP-native: every URL output is shaped for MCP from the start, with 5 oracle/price-data adapters and full OpenAPI ingest (Stripe, GitHub, Linear, etc.) that Zapier doesn't ship."}},
  {"@type":"Question","name":"Pricing?","acceptedAnswer":{"@type":"Answer","text":"Zapier: free 100 tasks/mo, then $20+/mo for higher tiers. wmcp.sh: free 100 reads/day anonymous (3000/mo), $29/mo Pro for 10k/day. Different metering. Zapier's value is in the curated app library + UX; wmcp.sh's is in the MCP-native + OpenAPI breadth."}},
  {"@type":"Question","name":"Can I use both?","acceptedAnswer":{"@type":"Answer","text":"Yes. Zapier for traditional cross-app workflows your humans + business users build. wmcp.sh as the agent-facing tool layer for AI assistants. Many teams use Zapier to ingest events (e.g. Stripe → Slack notifications) AND wmcp.sh to expose data + actions to their AI agents."}}
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
  <h1>wmcp.sh vs Zapier.</h1>
  <p class="sub">Zapier is the no-code workflow incumbent — 6000+ apps, mature UX, the original "when X, do Y." wmcp.sh is the agent-facing tool layer — Claude / Cursor / Codex call MCP tools, not pre-defined Zaps. Different jobs, often complementary.</p>
</header>

<section id="wedge">
  <div class="section-label">The shape difference</div>
  <h2>One sentence each.</h2>
  <div class="wins-grid">
    <div class="wins-card">
      <h3>Zapier</h3>
      <p style="color:var(--muted);margin:0 0 12px;font-size:.95rem;line-height:1.65">No-code workflow automation. Trigger + multi-step Zap. 6000+ apps. The incumbent for cross-app automation since 2011.</p>
    </div>
    <div class="wins-card us">
      <h3>wmcp.sh</h3>
      <p style="color:var(--muted);margin:0 0 12px;font-size:.95rem;line-height:1.65">URL → MCP tools for AI agents. Agent picks which tool to call at runtime. Shopper-side + OpenAPI + oracle/DeFi adapters.</p>
    </div>
  </div>
</section>

<section id="capabilities">
  <div class="section-label">Side-by-side</div>
  <h2>The capability matrix.</h2>
  <table>
    <thead>
      <tr><th>Capability</th><th>Zapier</th><th>wmcp.sh</th></tr>
    </thead>
    <tbody>
      <tr><td><strong>No-code workflow builder</strong></td><td>✅ Industry standard</td><td class="ours">❌ Not the goal</td></tr>
      <tr><td><strong>SaaS app library</strong></td><td>✅ 6000+ apps</td><td class="ours">⚠️ Anything with an OpenAPI spec, but no curated UX per app</td></tr>
      <tr><td><strong>AI agent tool_use shape</strong><br /><small style="color:var(--dim)">Claude / OpenAI / MCP</small></td><td>⚠️ "Zapier MCP" wraps some actions; thin layer</td><td class="ours">✅ MCP-native from day 1</td></tr>
      <tr><td><strong>Shopper-side commerce</strong></td><td>❌ Not in scope</td><td class="ours">✅ Shopify storefronts (4M+ stores)</td></tr>
      <tr><td><strong>Oracle / price-data</strong></td><td>❌ Not in scope</td><td class="ours">✅ 5 adapters: CoinGecko, Pyth, Chainlink, DefiLlama, DexScreener</td></tr>
      <tr><td><strong>OAuth-proxy for MCP servers</strong></td><td>❌ Not in scope</td><td class="ours">✅ RFC 7591 DCR + PKCE</td></tr>
      <tr><td><strong>Free tier</strong></td><td>100 tasks/mo</td><td class="ours">100 reads/day anonymous (3000/mo)</td></tr>
      <tr><td><strong>Open source</strong></td><td>❌ Closed</td><td class="ours">Worker + adapters MIT</td></tr>
      <tr><td><strong>Built for non-technical users</strong></td><td>✅ Polished UX</td><td class="ours">❌ Developer + AI-builder audience</td></tr>
    </tbody>
  </table>
</section>

<section id="wins">
  <div class="section-label">Where each wins</div>
  <h2>The honest version.</h2>
  <div class="wins-grid">
    <div class="wins-card">
      <h3>Zapier wins when:</h3>
      <ul>
        <li>You're a non-technical team automating cross-app workflows</li>
        <li>You need 6000+ pre-built apps with hand-curated UX</li>
        <li>Trigger-based automation is the job (not agent tool-use)</li>
        <li>You want the most mature, reliable no-code workflow platform</li>
      </ul>
    </div>
    <div class="wins-card us">
      <h3>wmcp.sh wins when:</h3>
      <ul>
        <li>You're building an AI agent that needs MCP tools (Claude.ai connector, Cursor, Codex)</li>
        <li>You need MCP-native — Zapier MCP is a thin wrapper; wmcp.sh is built for it</li>
        <li>You need shopper-side, oracle, or DeFi (Zapier doesn't ship these)</li>
        <li>You want a 100/day anonymous free tier with no signup</li>
        <li>You want OAuth-proxy for OAuth-gated MCP servers</li>
      </ul>
    </div>
  </div>
</section>

<section id="live">
  <div class="section-label">Try wmcp.sh</div>
  <h2>One curl, no Zap builder.</h2>
  <pre><code><span class="k">curl</span> <span class="s">'${origin}/api/v1/tools?url=https://api.llama.fi/protocols'</span>
<span class="c"># 6 DeFi MCP tools, ready for Claude / Cursor / Codex.</span></code></pre>
</section>

<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions.</h2>
  <details><summary>Why compare these — they're so different?</summary><div class="answer">People ask if Zapier's AI features replace MCP, or if they should use both. wmcp.sh isn't a Zapier replacement. If you have a Zap doing "when Slack message, create Notion page", wmcp.sh doesn't replace that. wmcp.sh's job is the agent-facing tool layer.</div></details>
  <details><summary>When pick Zapier?</summary><div class="answer">Traditional no-code workflow automation. 6000+ apps. Non-technical users.</div></details>
  <details><summary>When pick wmcp.sh?</summary><div class="answer">AI agent building. MCP-native. Shopper-side + OpenAPI + oracle/DeFi.</div></details>
  <details><summary>Does Zapier do MCP?</summary><div class="answer">Zapier launched "Zapier MCP" — a thin wrapper on their existing actions, scoped to curated apps. wmcp.sh is MCP-native from day 1, with 5 oracle adapters + full OpenAPI ingest Zapier doesn't ship.</div></details>
  <details><summary>Pricing?</summary><div class="answer">Zapier: free 100 tasks/mo, $20+/mo higher tiers. wmcp.sh: free 100/day anonymous, $29/mo Pro.</div></details>
  <details><summary>Can I use both?</summary><div class="answer">Yes — Zapier for cross-app workflows, wmcp.sh for AI agent tool layer. Common stack.</div></details>
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

<footer>
  <a href="/">Home</a> · <a href="/agent-ready">Agent-ready</a> · <a href="/managed">Done for you</a> · <a href="/price-data">Price data</a> · <a href="/integration/openapi">OpenAPI</a> · <a href="/directory">Directory</a> · <a href="https://github.com/New1Direction/webmcp-anything">GitHub</a>
</footer>

</body>
</html>`;
}
