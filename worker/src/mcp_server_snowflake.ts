// /mcp-server/snowflake — SEO page targeting "Snowflake MCP server" searches.

export function mcpServerSnowflakeHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Snowflake MCP Server — connect Claude/Cursor/Codex to Snowflake via wmcp.sh</title>
<meta name="description" content="Route Snowflake MCP traffic through wmcp.sh. Query cost preview before execution (avoid the Snowflake billing trap), role-based access, warehouse info, vault-stored credentials. Works with Claude, Cursor, Codex." />
<link rel="canonical" href="${origin}/mcp-server/snowflake" />
<meta property="og:title" content="Snowflake MCP Server — wmcp.sh" />
<meta property="og:description" content="Query cost preview before execution, role-based access, vault credentials. Snowflake for agents without billing surprises." />
<meta property="og:url" content="${origin}/mcp-server/snowflake" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Snowflake MCP Server — wmcp.sh" />
<meta name="twitter:description" content="Query cost preview, role-based access, vault credentials." />
<meta name="twitter:image" content="${origin}/og.png" />
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Snowflake MCP Server — routed through wmcp.sh",
  "description": "How to expose Snowflake as MCP tools with query cost preview to avoid agent-driven billing surprises.",
  "author": { "@type": "Organization", "name": "WebMCP Anything" },
  "publisher": { "@type": "Organization", "name": "WebMCP Anything", "url": "https://wmcp.sh" },
  "datePublished": "2026-05-28",
  "dateModified": "2026-05-28",
  "mainEntityOfPage": "${origin}/mcp-server/snowflake"
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is there an official Snowflake MCP server?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Snowflake-Labs/mcp on GitHub was an early community-style project; its README now marks it deprecated and directs users to the officially-supported Snowflake MCP Server. wmcp.sh is not affiliated with Snowflake Inc.; we offer a hosted alternative that adds query cost preview and warehouse-aware routing."
      }
    },
    {
      "@type": "Question",
      "name": "What's the 'query cost preview'?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Before any query runs, wmcp.sh runs EXPLAIN and surfaces the estimated bytes scanned, partitions hit, and warehouse credit estimate to the agent. The agent can choose to abort, re-scope (add a date filter), or proceed. This prevents the common failure mode where an agent runs SELECT * on a multi-TB table and burns thousands of credits."
      }
    },
    {
      "@type": "Question",
      "name": "Does wmcp.sh support key-pair auth?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes — and recommends it over password auth for Snowflake. Private keys are stored encrypted in the per-user vault and decrypted in memory at the edge per request. PAT (Programmatic Access Token) auth is also supported."
      }
    },
    {
      "@type": "Question",
      "name": "Can the agent switch warehouses?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes — list_warehouses returns size and status, and the query tool accepts a warehouse parameter per call. You can also pin a default warehouse per connection and require explicit override."
      }
    },
    {
      "@type": "Question",
      "name": "Pricing?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "wmcp.sh: free 100 reads/day anonymous, Managed Starter $499 one-time, Pro $999/mo, Enterprise $4,999+/mo. Snowflake credits are billed by Snowflake directly — wmcp.sh helps you avoid surprises, but does not bill credits."
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
  <div class="badge"><span class="dot"></span> mcp server &middot; snowflake</div>
  <h1>Snowflake MCP server with query cost preview.</h1>
  <p class="sub">Route Claude, Cursor, and Codex to Snowflake through wmcp.sh. Every query gets an EXPLAIN-driven cost preview before it runs — bytes scanned, partitions hit, warehouse credit estimate — so an agent's accidental <code>SELECT *</code> doesn't surprise you on the next invoice. wmcp.sh is not affiliated with Snowflake Inc.</p>
  <p class="hint">Connect at <code>${origin}/mcp/snowflake</code> · key-pair + PAT auth · cost preview default-on</p>
</header>

<!-- ========== WHY ========== -->
<section id="why">
  <div class="section-label">The wedge</div>
  <h2>Why route through wmcp.sh instead of running the official server.</h2>
  <div class="wedge">
    <p><strong>Snowflake bills by warehouse-credit consumption.</strong> A single naïve query on a multi-terabyte table can chew through hours of warehouse time and tens to hundreds of dollars in credits. That's a known footgun for human operators — it gets worse the moment you put a tool-calling agent on the other side.</p>
    <p><strong>The community Snowflake-Labs/mcp project</strong> is now marked deprecated and directs users to the officially-supported Snowflake MCP Server. Both expose query and warehouse tools; neither, by default, surfaces cost estimates to the calling agent.</p>
    <p><strong>wmcp.sh adds a pre-execution cost preview</strong>: every query goes through EXPLAIN first, the result (bytes-scanned, partitions, credit estimate) is returned to the agent, and queries above a configurable threshold can be auto-blocked. Plus encrypted vault for key-pair / PAT credentials, role-based access, and per-call audit logs.</p>
  </div>
</section>

<!-- ========== TOOLS ========== -->
<section id="tools">
  <div class="section-label">What your agent gets</div>
  <h2>Snowflake tools, MCP-shaped.</h2>
  <p class="section-sub">Nine tools designed for read-heavy analytical agents.</p>
  <ul class="tools-list">
    <li><code>snowflake.query</code><span>Run a SELECT with auto cost-preview gate.</span></li>
    <li><code>snowflake.explain_cost</code><span>Standalone: bytes scanned, partitions, credit estimate.</span></li>
    <li><code>snowflake.list_warehouses</code><span>Name, size (XS–6XL), state, auto-suspend.</span></li>
    <li><code>snowflake.list_databases</code><span>Databases visible to the active role.</span></li>
    <li><code>snowflake.list_schemas</code><span>Schemas in a database.</span></li>
    <li><code>snowflake.describe_table</code><span>Columns, types, clustering keys, row count.</span></li>
    <li><code>snowflake.list_roles</code><span>Roles granted to the auth principal.</span></li>
    <li><code>snowflake.current_session</code><span>Active role, warehouse, database, schema.</span></li>
    <li><code>snowflake.query_history</code><span>Recent queries with credits-used (24h window).</span></li>
  </ul>
</section>

<!-- ========== CODE ========== -->
<section id="code">
  <div class="section-label">Wire it up</div>
  <h2>Python — Claude with cost-aware Snowflake access.</h2>
  <pre><code><span class="c"># pip install anthropic mcp</span>
<span class="k">import</span> os, asyncio
<span class="k">from</span> anthropic <span class="k">import</span> Anthropic
<span class="k">from</span> mcp <span class="k">import</span> ClientSession
<span class="k">from</span> mcp.client.streamable_http <span class="k">import</span> streamablehttp_client

WMCP = <span class="s">"${origin}/mcp/snowflake"</span>
TOKEN = os.environ[<span class="s">"WMCP_TOKEN"</span>]  <span class="c"># /dashboard</span>

<span class="k">async def</span> run():
    <span class="k">async with</span> streamablehttp_client(WMCP, headers={<span class="s">"Authorization"</span>: <span class="s">f"Bearer {TOKEN}"</span>}) <span class="k">as</span> (r, w, _):
        <span class="k">async with</span> ClientSession(r, w) <span class="k">as</span> s:
            <span class="k">await</span> s.initialize()
            tools = (<span class="k">await</span> s.list_tools()).tools
            anthropic = Anthropic()
            <span class="c"># Tell Claude: always explain_cost first, abort if &gt; 1 credit.</span>
            msg = anthropic.messages.create(
                model=<span class="s">"claude-opus-4-5"</span>,
                max_tokens=2048,
                system=<span class="s">"Always call snowflake.explain_cost first. Abort if credits_estimate &gt; 1.0."</span>,
                tools=[{<span class="s">"name"</span>: t.name, <span class="s">"description"</span>: t.description, <span class="s">"input_schema"</span>: t.inputSchema} <span class="k">for</span> t <span class="k">in</span> tools],
                messages=[{<span class="s">"role"</span>: <span class="s">"user"</span>, <span class="s">"content"</span>: <span class="s">"What was our daily active users for the last 7 days?"</span>}],
            )
            <span class="k">return</span> msg

asyncio.run(run())</code></pre>
</section>

<!-- ========== COMPARE ========== -->
<section id="compare">
  <div class="section-label">Side by side</div>
  <h2>Self-hosted Snowflake MCP server vs wmcp.sh-routed.</h2>
  <table>
    <thead><tr><th>Capability</th><th>Self-hosted official / community</th><th>wmcp.sh-routed</th></tr></thead>
    <tbody>
      <tr><td><strong>Pre-execution cost preview</strong></td><td>Not exposed as a tool</td><td class="ours">EXPLAIN-driven cost preview, threshold gate</td></tr>
      <tr><td><strong>Key-pair auth</strong></td><td>Supported via config</td><td class="ours">Supported, key encrypted in per-user vault</td></tr>
      <tr><td><strong>PAT (Programmatic Access Token)</strong></td><td>Supported</td><td class="ours">Supported + per-token TTL enforcement</td></tr>
      <tr><td><strong>Role-based access surfacing</strong></td><td>You inspect roles manually</td><td class="ours">list_roles + current_session built-in</td></tr>
      <tr><td><strong>Query history with credits</strong></td><td>Optional QUERY_HISTORY view</td><td class="ours">Tool-level, 24h rolling window</td></tr>
      <tr><td><strong>Audit log</strong></td><td>Snowflake-side only</td><td class="ours">Per-call wmcp audit + Snowflake-side trail</td></tr>
      <tr><td><strong>Works with Claude.ai connectors</strong></td><td>Stdio only / partial</td><td class="ours">Streamable HTTP + OAuth 2.1</td></tr>
    </tbody>
  </table>
</section>

<!-- ========== FAQ ========== -->
<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions.</h2>
  <details><summary>Is there an official Snowflake MCP server?</summary><div class="answer">The community Snowflake-Labs/mcp project is marked deprecated and directs users to Snowflake's officially-supported MCP Server. wmcp.sh is not affiliated with Snowflake Inc. — we are a hosted alternative that adds query cost preview, encrypted credential vault, and audit logging.</div></details>
  <details><summary>What's the query cost preview?</summary><div class="answer">Before any query runs, wmcp.sh runs EXPLAIN, derives bytes-scanned and estimated warehouse-credit consumption, and surfaces it to the agent. You can configure a threshold — queries above N credits get blocked unless the agent confirms. Closes the loop on the most common Snowflake agent-billing trap.</div></details>
  <details><summary>Key-pair auth?</summary><div class="answer">Yes and recommended over password. Private key lives encrypted in the per-user vault, decrypted in memory at the edge per request, never logged. PAT auth also supported.</div></details>
  <details><summary>Can the agent switch warehouses?</summary><div class="answer">Yes — list_warehouses returns size/state, the query tool accepts an explicit warehouse parameter. You can pin a default per connection and require explicit override.</div></details>
  <details><summary>Pricing?</summary><div class="answer">wmcp.sh: free 100 reads/day anonymous, Managed Starter $499 one-time, Pro $999/mo, Enterprise $4,999+/mo. Snowflake credits billed by Snowflake. See <a href="/managed" style="color:var(--accent2)">/managed</a>.</div></details>
</section>

<!-- ========== UPGRADE ========== -->
<section id="upgrade" style="margin-top:36px;background:linear-gradient(135deg,var(--card),rgba(124,92,255,0.08));border:1px solid rgba(124,92,255,0.35);border-radius:16px;padding:22px 26px">
  <div class="section-label">For production</div>
  <h2 style="margin-top:0">Need this in production?</h2>
  <p style="color:var(--muted);max-width:640px">Production Snowflake MCP includes a read-only role with row-access policies, cost-threshold tuning, audit retention, SSO, and PrivateLink for Enterprise. Starter $499 one-time, Pro $999/mo, Enterprise $4,999+/mo.</p>
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
    <a href="/mcp-server/postgres" style="color:var(--accent2);text-decoration:none">/mcp-server/postgres</a> &middot;
    <a href="/mcp-server/elasticsearch" style="color:var(--accent2);text-decoration:none">/mcp-server/elasticsearch</a> &middot;
    <a href="/mcp-server/datadog" style="color:var(--accent2);text-decoration:none">/mcp-server/datadog</a> &middot;
    <a href="/agent-ready" style="color:var(--accent2);text-decoration:none">/agent-ready</a> &middot;
    <a href="/managed" style="color:var(--accent2);text-decoration:none">/managed</a> &middot;
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
