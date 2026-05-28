// /mcp-server/datadog — SEO page targeting "Datadog MCP server" searches.

export function mcpServerDatadogHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Datadog MCP Server — connect Claude/Cursor/Codex to Datadog via wmcp.sh</title>
<meta name="description" content="Route Datadog MCP traffic through wmcp.sh. Natural-language → DQL translation, query metrics, list monitors, alert state. Vault-stored API/APP keys, edge routing, audit log. Works with Claude, Cursor, Codex." />
<link rel="canonical" href="${origin}/mcp-server/datadog" />
<meta property="og:title" content="Datadog MCP Server — wmcp.sh" />
<meta property="og:description" content="Natural-language → DQL translation, monitors, alert state, vault-stored keys. Datadog for agents without DQL fluency required." />
<meta property="og:url" content="${origin}/mcp-server/datadog" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Datadog MCP Server — wmcp.sh" />
<meta name="twitter:description" content="NL → DQL translation, monitors, alert state, vault keys." />
<meta name="twitter:image" content="${origin}/og.png" />
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Datadog MCP Server — routed through wmcp.sh",
  "description": "How to expose Datadog metrics, monitors, and alert state to Claude, Cursor, and Codex without forcing the agent to write raw DQL.",
  "author": { "@type": "Organization", "name": "WebMCP Anything" },
  "publisher": { "@type": "Organization", "name": "WebMCP Anything", "url": "https://wmcp.sh" },
  "datePublished": "2026-05-28",
  "dateModified": "2026-05-28",
  "mainEntityOfPage": "${origin}/mcp-server/datadog"
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is there an official Datadog MCP server?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Datadog has shipped MCP-related capabilities under its Bits AI product. There is no broadly-installed open-source 'official' Datadog MCP server in the modelcontextprotocol/servers registry as of this writing. Several community Datadog MCP servers exist on GitHub. wmcp.sh is not affiliated with Datadog Inc.; we offer a hosted alternative with NL-to-DQL translation."
      }
    },
    {
      "@type": "Question",
      "name": "What is 'NL to DQL translation'?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Datadog Query Language has a specific grammar — aggregations, tags, rollups, arithmetic. Most agents fumble it. wmcp.sh exposes a query_metrics tool that accepts natural language ('p95 request latency for the api service over 1h') and translates to DQL before execution. The agent gets both the rendered DQL and the time series, so it can iterate."
      }
    },
    {
      "@type": "Question",
      "name": "Where are my API/APP keys stored?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "In the per-user encrypted vault scoped to your wmcp.sh account. Decrypted in memory at the edge per request, never logged. Rotatable from the dashboard at any time."
      }
    },
    {
      "@type": "Question",
      "name": "Can the agent mute monitors or create incidents?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Mute / unmute and incident-create are exposed as write tools but are opt-in per connection. Default mode is read-only — list monitors, alert state, metric queries, dashboards. All write calls land in the wmcp.sh audit log."
      }
    },
    {
      "@type": "Question",
      "name": "Pricing?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "wmcp.sh: free 100 reads/day anonymous, Managed Starter $499 one-time, Pro $999/mo, Enterprise $4,999+/mo. Datadog billing is handled by Datadog directly."
      }
    }
  ]
}
</script>
<style>
  :root { --bg:#07070d;--card:#16161f;--bg2:#11111c;--border:#26263a;--text:#ececf5;--muted:#8a8aa8;--dim:#6a6a88;--accent:#7c5cff;--accent2:#00e5ff;--green:#4ade80;--pink:#f0abfc;--gold:#fbbf24; }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin:0;min-height:100vh;color:var(--text);background:var(--bg);font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif;line-height:1.6;background-image:radial-gradient(ellipse 900px 600px at 10% -5%,rgba(124,92,255,.18),transparent 60%),radial-gradient(ellipse 700px 500px at 95% 10%,rgba(0,229,255,.10),transparent 60%); }
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
  h1 { font-size:clamp(2.1rem,4.8vw,3.2rem);margin:0 0 18px;background:linear-gradient(135deg,#fff 30%,var(--accent2) 100%);-webkit-background-clip:text;background-clip:text;color:transparent;line-height:1.05;font-weight:800;letter-spacing:-.025em; }
  .sub { color: var(--muted); font-size: 1.05rem; max-width: 700px; margin: 0 0 24px; }
  .hint { color: var(--dim); font-size: .85rem; margin-top: 8px; }
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
  .wedge { background:var(--card);border:1px solid var(--border);border-left:3px solid var(--accent);border-radius:12px;padding:20px 24px;margin:18px 0; }
  .wedge p { margin: 0 0 10px; color: var(--muted); font-size:.95rem; }
  .wedge p:last-child { margin-bottom: 0; }
  ul.tools-list { list-style: none; padding: 0; }
  ul.tools-list li { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 12px 16px; margin-bottom: 8px; }
  ul.tools-list code { color: var(--accent2); background: transparent; padding: 0; font-weight: 600; }
  ul.tools-list span { color: var(--muted); font-size: .9rem; margin-left: 8px; }
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
    <a href="/integration/openapi">OpenAPI</a>
    <a href="/directory">Directory</a>
    <a href="/blog">Blog</a>
  </div>
  <a class="cta" href="/dashboard">Dashboard →</a>
</nav>

<div class="wrap">

<header class="hero">
  <div class="badge"><span class="dot"></span> mcp server &middot; datadog</div>
  <h1>Datadog MCP server — natural language in, metrics out.</h1>
  <p class="sub">Route Claude, Cursor, and Codex to Datadog through wmcp.sh. The query tool translates plain English ("p95 latency for api service last hour") to DQL before execution. Vault-stored API + APP keys, edge routing, audit log. wmcp.sh is not affiliated with Datadog Inc.</p>
  <p class="hint">Connect at <code>${origin}/mcp/datadog</code> · supports US1 / US3 / US5 / EU1 / AP1 sites · default read-only</p>
</header>

<!-- ========== WHY ========== -->
<section id="why">
  <div class="section-label">The wedge</div>
  <h2>Why route through wmcp.sh instead of running an existing Datadog MCP server.</h2>
  <div class="wedge">
    <p><strong>Datadog Query Language has a specific grammar</strong> — aggregations, tags, rollups, arithmetic, function composition. Agents that haven't seen thousands of DQL examples get it wrong, retry, and waste tokens. The few existing Datadog MCP servers expose the raw query endpoint and leave the agent to write DQL itself.</p>
    <p><strong>The other pain point is key management.</strong> Datadog requires both an API key (for ingestion + read) and an APP key (per-user, finer-grained scopes). Most self-hosted servers ask you to drop both in env vars. Rotating means redeploying.</p>
    <p><strong>wmcp.sh fixes both</strong>: a <code>query_metrics</code> tool that accepts natural language and outputs the rendered DQL alongside the time series (so the agent can iterate), plus an encrypted per-user vault for API + APP keys with one-click rotation, plus a Datadog-site selector (US1 / US3 / US5 / EU1 / AP1) so multi-region orgs don't need separate connections.</p>
  </div>
</section>

<!-- ========== TOOLS ========== -->
<section id="tools">
  <div class="section-label">What your agent gets</div>
  <h2>Datadog tools, MCP-shaped.</h2>
  <p class="section-sub">Nine read-focused tools across metrics, monitors, dashboards, and logs.</p>
  <ul class="tools-list">
    <li><code>datadog.query_metrics</code><span>Natural language → DQL → time series. Returns both.</span></li>
    <li><code>datadog.query_dql</code><span>Run a raw DQL query if you already know it.</span></li>
    <li><code>datadog.list_monitors</code><span>Monitors with state (OK / Alert / Warn / No Data).</span></li>
    <li><code>datadog.get_monitor</code><span>Full monitor config including thresholds + tags.</span></li>
    <li><code>datadog.list_dashboards</code><span>Dashboards with title + author + last-modified.</span></li>
    <li><code>datadog.list_alerts</code><span>Currently-triggered alerts org-wide.</span></li>
    <li><code>datadog.search_logs</code><span>Log search with query + time window + facets.</span></li>
    <li><code>datadog.list_services</code><span>APM services visible to the APP key.</span></li>
    <li><code>datadog.list_slos</code><span>SLOs with status + burn rate.</span></li>
  </ul>
</section>

<!-- ========== CODE ========== -->
<section id="code">
  <div class="section-label">Wire it up</div>
  <h2>Python — NL question to Datadog metric answer.</h2>
  <pre><code><span class="c"># pip install anthropic mcp</span>
<span class="k">import</span> os, asyncio
<span class="k">from</span> anthropic <span class="k">import</span> Anthropic
<span class="k">from</span> mcp <span class="k">import</span> ClientSession
<span class="k">from</span> mcp.client.streamable_http <span class="k">import</span> streamablehttp_client

WMCP = <span class="s">"${origin}/mcp/datadog"</span>
TOKEN = os.environ[<span class="s">"WMCP_TOKEN"</span>]

<span class="k">async def</span> ask():
    <span class="k">async with</span> streamablehttp_client(WMCP, headers={<span class="s">"Authorization"</span>: <span class="s">f"Bearer {TOKEN}"</span>}) <span class="k">as</span> (r, w, _):
        <span class="k">async with</span> ClientSession(r, w) <span class="k">as</span> s:
            <span class="k">await</span> s.initialize()
            tools = (<span class="k">await</span> s.list_tools()).tools
            anthropic = Anthropic()
            msg = anthropic.messages.create(
                model=<span class="s">"claude-opus-4-5"</span>,
                max_tokens=2048,
                tools=[{<span class="s">"name"</span>: t.name, <span class="s">"description"</span>: t.description, <span class="s">"input_schema"</span>: t.inputSchema} <span class="k">for</span> t <span class="k">in</span> tools],
                messages=[{<span class="s">"role"</span>: <span class="s">"user"</span>, <span class="s">"content"</span>: <span class="s">"Show me p95 request latency for the checkout service in production over the last 6 hours."</span>}],
            )
            <span class="k">return</span> msg

asyncio.run(ask())</code></pre>
</section>

<!-- ========== COMPARE ========== -->
<section id="compare">
  <div class="section-label">Side by side</div>
  <h2>Self-hosted Datadog MCP server vs wmcp.sh-routed.</h2>
  <table>
    <thead><tr><th>Capability</th><th>Self-hosted / community server</th><th>wmcp.sh-routed</th></tr></thead>
    <tbody>
      <tr><td><strong>NL → DQL translation</strong></td><td>Agent writes DQL itself</td><td class="ours">Built-in translator, returns both DQL + data</td></tr>
      <tr><td><strong>Multi-site (US1/EU1/etc.)</strong></td><td>One server per site</td><td class="ours">Site selector per connection</td></tr>
      <tr><td><strong>API + APP key storage</strong></td><td>Plaintext env vars</td><td class="ours">Encrypted vault, rotatable</td></tr>
      <tr><td><strong>Monitor + alert visibility</strong></td><td>Subset / per-server</td><td class="ours">Org-wide via APP key scopes</td></tr>
      <tr><td><strong>Log search</strong></td><td>Sometimes omitted</td><td class="ours">Built-in with facets</td></tr>
      <tr><td><strong>Default mode</strong></td><td>Read-write</td><td class="ours">Read-only; writes opt-in</td></tr>
      <tr><td><strong>Audit log</strong></td><td>None</td><td class="ours">Per-call: who, when, tool, args, latency</td></tr>
    </tbody>
  </table>
</section>

<!-- ========== FAQ ========== -->
<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions.</h2>
  <details><summary>Is there an official Datadog MCP server?</summary><div class="answer">Datadog has shipped MCP capabilities under its Bits AI product line. There is no broadly-installed open-source server in the official MCP registry as of this writing. wmcp.sh is not affiliated with Datadog Inc. and offers a hosted alternative.</div></details>
  <details><summary>NL → DQL — how good is it?</summary><div class="answer">The translator handles the common patterns (rate, average, percentile, by-tag grouping, time windows, arithmetic across metrics) reliably. Edge cases get returned verbatim with a "couldn't translate, falling back to raw query" flag so the agent can decide. Both the rendered DQL and the result are returned, so the agent learns by example.</div></details>
  <details><summary>Where are my API/APP keys stored?</summary><div class="answer">Encrypted per-user vault. Decrypted in memory per request, never logged. Rotate from /dashboard.</div></details>
  <details><summary>Can agents mute monitors or create incidents?</summary><div class="answer">Yes — mute / unmute / incident-create exist as write tools, opt-in per connection. Default is read-only.</div></details>
  <details><summary>Pricing?</summary><div class="answer">Free 100 reads/day anonymous. Managed Starter $499 one-time, Pro $999/mo, Enterprise $4,999+/mo. See <a href="/managed" style="color:var(--accent2)">/managed</a>.</div></details>
</section>

<!-- ========== UPGRADE ========== -->
<section id="upgrade" style="margin-top:36px;background:linear-gradient(135deg,var(--card),rgba(124,92,255,0.08));border:1px solid rgba(124,92,255,0.35);border-radius:16px;padding:22px 26px">
  <div class="section-label">For production</div>
  <h2 style="margin-top:0">Need this in production?</h2>
  <p style="color:var(--muted);max-width:640px">Production Datadog MCP: scoped APP key with metric/log read perms only, NL-DQL tuning for your service taxonomy, audit retention, SSO, on-call escalation suppression flags. Starter $499 one-time, Pro $999/mo, Enterprise $4,999+/mo.</p>
  <p style="margin-top:16px">
    <a href="/managed" style="display:inline-block;background:var(--accent);color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:700;margin-right:10px">→ Managed setup ($499)</a>
    <a href="/directory/submit" style="display:inline-block;background:var(--bg2);border:1px solid var(--border);color:var(--text);padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600">Submit your MCP server (free)</a>
  </p>
</section>

<!-- ========== RELATED ========== -->
<section id="related">
  <div class="section-label">See also</div>
  <h2>Related pages.</h2>
  <p class="section-sub">
    <a href="/mcp-server/sentry" style="color:var(--accent2);text-decoration:none">/mcp-server/sentry</a> &middot;
    <a href="/mcp-server/elasticsearch" style="color:var(--accent2);text-decoration:none">/mcp-server/elasticsearch</a> &middot;
    <a href="/mcp-server/cloudflare" style="color:var(--accent2);text-decoration:none">/mcp-server/cloudflare</a> &middot;
    <a href="/agent-ready" style="color:var(--accent2);text-decoration:none">/agent-ready</a> &middot;
    <a href="/agent-ready/api" style="color:var(--accent2);text-decoration:none">/agent-ready/api</a> &middot;
    <a href="/directory" style="color:var(--accent2);text-decoration:none">/directory</a>
  </p>
</section>

</div>

<footer>
  <a href="/">Home</a> · <a href="/agent-ready">Agent-ready</a> · <a href="/managed">Done for you</a> · <a href="/integration/openapi">OpenAPI</a> · <a href="/directory">Directory</a> · <a href="/directory/submit">Submit</a> · <a href="/blog">Blog</a>
</footer>

</body>
</html>`;
}
