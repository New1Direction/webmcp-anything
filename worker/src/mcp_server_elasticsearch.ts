// /mcp-server/elasticsearch — SEO page targeting "Elasticsearch MCP server" searches.

export function mcpServerElasticsearchHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Elasticsearch MCP Server — connect Claude/Cursor/Codex to Elasticsearch via wmcp.sh</title>
<meta name="description" content="Route Elasticsearch MCP traffic through wmcp.sh. Dynamic mapping discovery, search/index/aggregations, per-user API-key vault, edge routing. No need to pin your agent to a specific index schema in advance." />
<link rel="canonical" href="${origin}/mcp-server/elasticsearch" />
<meta property="og:title" content="Elasticsearch MCP Server — wmcp.sh" />
<meta property="og:description" content="Dynamic mapping discovery, search + aggregations, vault-stored API keys. Elasticsearch for agents without schema pre-pinning." />
<meta property="og:url" content="${origin}/mcp-server/elasticsearch" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Elasticsearch MCP Server — wmcp.sh" />
<meta name="twitter:description" content="Dynamic mapping discovery, vault-stored keys, search + aggregations." />
<meta name="twitter:image" content="${origin}/og.png" />
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Elasticsearch MCP Server — routed through wmcp.sh",
  "description": "How to expose Elasticsearch as MCP tools to Claude, Cursor, and Codex with dynamic mapping discovery.",
  "author": { "@type": "Organization", "name": "WebMCP Anything" },
  "publisher": { "@type": "Organization", "name": "WebMCP Anything", "url": "https://wmcp.sh" },
  "datePublished": "2026-05-28",
  "dateModified": "2026-05-28",
  "mainEntityOfPage": "${origin}/mcp-server/elasticsearch"
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is there an official Elasticsearch MCP server?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Elastic maintains an MCP server at elastic/mcp-server-elasticsearch. As of 2026 the project documentation marks it as deprecated and indicates it will only receive critical security updates going forward. Elastic recommends migrating to the Elastic Agent Builder MCP endpoint shipped with Elasticsearch 9.2.0 and Elasticsearch Serverless. wmcp.sh is not affiliated with Elastic; we offer a hosted alternative with dynamic mapping discovery for agents that don't know the index schema in advance."
      }
    },
    {
      "@type": "Question",
      "name": "What is 'dynamic mapping discovery'?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Most Elasticsearch MCP servers require the agent to know index names and field names ahead of time. wmcp.sh exposes a discover_mapping tool that returns a flattened schema for the index — field names, types, analyzers, whether the field is keyword-aggregatable — so the agent can plan a search or aggregation without prior context. Useful when wiring Claude up to a previously-unknown ES cluster."
      }
    },
    {
      "@type": "Question",
      "name": "Can agents delete documents or change mappings?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "By default no. Index-write and mapping-change operations are blocked at the wmcp.sh layer. The default tool surface is read-only: search, count, aggregations, mapping introspection, and cluster info. Write access is opt-in per connection."
      }
    },
    {
      "@type": "Question",
      "name": "Does this work with OpenSearch?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. OpenSearch's REST API is compatible with the Elasticsearch search and aggregation tools wmcp.sh exposes. Some advanced features (ELSER, semantic_text) are Elastic-specific and won't work on OpenSearch — wmcp.sh detects the cluster type at connect time and hides incompatible tools."
      }
    },
    {
      "@type": "Question",
      "name": "Pricing?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Free 100 reads/day anonymous. Managed Starter $499 one-time, Managed Retainer $999/mo, Enterprise $4,999+/mo. See /managed."
      }
    }
  ]
}
</script>
<style>
  :root { --bg:#07070d;--card:#16161f;--bg2:#11111c;--border:#26263a;--text:#ececf5;--muted:#8a8aa8;--dim:#6a6a88;--accent:#ff9e2c;--accent2:#ffcf7a;--green:#4ade80;--pink:#ffb86b;--gold:#fbbf24; }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin:0;min-height:100vh;color:var(--text);background:var(--bg);font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif;line-height:1.6;background-image:radial-gradient(ellipse 900px 600px at 10% -5%,rgba(255,158,44,.18),transparent 60%),radial-gradient(ellipse 700px 500px at 95% 10%,rgba(255,176,0,.10),transparent 60%); }
  .wrap { max-width: 920px; margin: 0 auto; padding: 0 24px; }
  nav { display:flex;justify-content:space-between;align-items:center;padding:22px 24px;max-width:1080px;margin:0 auto; }
  nav .brand { font-weight: 800; letter-spacing: -.02em; font-size: 1.05rem; }
  nav .brand span { color: var(--accent2); }
  nav .links { display: flex; gap: 22px; font-size: .9rem; }
  nav .links a { color: var(--muted); text-decoration: none; }
  nav .links a:hover { color: var(--text); }
  nav .cta { background: var(--bg2); border: 1px solid var(--border); padding: 7px 14px; border-radius: 8px; font-size: .85rem; color: var(--text); text-decoration: none; font-weight: 600; }
  header.hero { padding: 50px 0 30px; }
  .badge { display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;font-size:.7rem;letter-spacing:.15em;text-transform:uppercase;font-weight:700;background:linear-gradient(90deg,rgba(255,158,44,.18),rgba(255,176,0,.18));border:1px solid rgba(255,158,44,.35);margin-bottom:18px; }
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
  td.ours { background: rgba(255,158,44,0.05); }
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
  <div class="badge"><span class="dot"></span> mcp server &middot; elasticsearch</div>
  <h1>Elasticsearch MCP server with dynamic mapping discovery.</h1>
  <p class="sub">Point Claude, Cursor, or any MCP client at Elasticsearch through wmcp.sh. The agent doesn't need to know your index schema up front — <code>discover_mapping</code> returns a flattened, agent-readable schema on demand. wmcp.sh is not affiliated with Elastic NV.</p>
  <p class="hint">Connect at <code>${origin}/mcp/elasticsearch</code> · works with Elasticsearch 7.x / 8.x / 9.x and OpenSearch</p>
</header>

<!-- ========== WHY ========== -->
<section id="why">
  <div class="section-label">The wedge</div>
  <h2>Why route through wmcp.sh instead of running the official server.</h2>
  <div class="wedge">
    <p><strong>Elastic ships an official MCP server</strong> at <code>elastic/mcp-server-elasticsearch</code>. As of 2026 that project's README marks it deprecated — it will only receive critical security patches. Elastic now recommends the Agent Builder MCP endpoint that ships with Elasticsearch 9.2.0+ and Elasticsearch Serverless. If you're on 8.x or older, you're between two stories.</p>
    <p><strong>Both approaches have the same agent UX gap</strong>: the agent needs to know index names and field names before it can write a query. That's fine for one-off "search my docs" demos. It breaks when an agent is exploring an unfamiliar cluster — every interaction starts with "what indices exist? what fields?".</p>
    <p><strong>wmcp.sh adds dynamic mapping discovery</strong>: <code>list_indices</code> + <code>discover_mapping</code> return a flattened, prompt-friendly schema (field name, type, analyzer, aggregatable?) so the agent can plan a search in one shot. Plus per-user encrypted API-key vault, query timeout caps, and audit logging.</p>
  </div>
</section>

<!-- ========== TOOLS ========== -->
<section id="tools">
  <div class="section-label">What your agent gets</div>
  <h2>Elasticsearch tools, MCP-shaped.</h2>
  <p class="section-sub">Nine read-focused tools that work across ES 7.x, 8.x, 9.x, and OpenSearch.</p>
  <ul class="tools-list">
    <li><code>elasticsearch.list_indices</code><span>Indices visible to the API key with doc count + size.</span></li>
    <li><code>elasticsearch.discover_mapping</code><span>Flattened field map: name, type, analyzer, aggregatable.</span></li>
    <li><code>elasticsearch.search</code><span>Run a DSL query. Returns hits + highlight + total.</span></li>
    <li><code>elasticsearch.count</code><span>Document count matching a query (no hits).</span></li>
    <li><code>elasticsearch.aggregate</code><span>Run aggregations (terms / date_histogram / metrics / nested).</span></li>
    <li><code>elasticsearch.esql</code><span>Run an ES|QL query (Elasticsearch 8.11+).</span></li>
    <li><code>elasticsearch.get_document</code><span>GET _doc/{id} from a specific index.</span></li>
    <li><code>elasticsearch.cluster_health</code><span>Cluster status / shard counts / pending tasks.</span></li>
    <li><code>elasticsearch.cat_nodes</code><span>Node roles, JVM heap, disk for cluster planning.</span></li>
  </ul>
</section>

<!-- ========== CODE ========== -->
<section id="code">
  <div class="section-label">Wire it up</div>
  <h2>Python — agent discovers schema then queries.</h2>
  <pre><code><span class="c"># pip install anthropic mcp</span>
<span class="k">import</span> os, asyncio
<span class="k">from</span> anthropic <span class="k">import</span> Anthropic
<span class="k">from</span> mcp <span class="k">import</span> ClientSession
<span class="k">from</span> mcp.client.streamable_http <span class="k">import</span> streamablehttp_client

WMCP = <span class="s">"${origin}/mcp/elasticsearch"</span>
TOKEN = os.environ[<span class="s">"WMCP_TOKEN"</span>]

<span class="k">async def</span> run():
    <span class="k">async with</span> streamablehttp_client(WMCP, headers={<span class="s">"Authorization"</span>: <span class="s">f"Bearer {TOKEN}"</span>}) <span class="k">as</span> (r, w, _):
        <span class="k">async with</span> ClientSession(r, w) <span class="k">as</span> session:
            <span class="k">await</span> session.initialize()
            tools = (<span class="k">await</span> session.list_tools()).tools
            anthropic = Anthropic()
            <span class="c"># Claude will call discover_mapping then search, two-step.</span>
            msg = anthropic.messages.create(
                model=<span class="s">"claude-opus-4-5"</span>,
                max_tokens=2048,
                tools=[{<span class="s">"name"</span>: t.name, <span class="s">"description"</span>: t.description, <span class="s">"input_schema"</span>: t.inputSchema} <span class="k">for</span> t <span class="k">in</span> tools],
                messages=[{<span class="s">"role"</span>: <span class="s">"user"</span>, <span class="s">"content"</span>: <span class="s">"Find the top 5 error_codes from the 'logs-app' index in the last 24h"</span>}],
            )
            <span class="k">return</span> msg

asyncio.run(run())</code></pre>
</section>

<!-- ========== COMPARE ========== -->
<section id="compare">
  <div class="section-label">Side by side</div>
  <h2>Self-hosted Elasticsearch MCP server vs wmcp.sh-routed.</h2>
  <table>
    <thead><tr><th>Capability</th><th>Self-hosted / official deprecated server</th><th>wmcp.sh-routed</th></tr></thead>
    <tbody>
      <tr><td><strong>Maintenance status</strong></td><td>Official server marked deprecated, security-only</td><td class="ours">Actively developed, free + paid tiers</td></tr>
      <tr><td><strong>Dynamic mapping discovery</strong></td><td>Basic get_mappings</td><td class="ours">Flattened, prompt-friendly schema in one call</td></tr>
      <tr><td><strong>ES|QL support</strong></td><td>Yes</td><td class="ours">Yes + auto-detects cluster version</td></tr>
      <tr><td><strong>Credential storage</strong></td><td>Plaintext env var</td><td class="ours">Encrypted per-user vault, rotatable</td></tr>
      <tr><td><strong>OpenSearch compatibility</strong></td><td>Partial / unofficial</td><td class="ours">Detected + incompatible tools hidden</td></tr>
      <tr><td><strong>Audit log</strong></td><td>None</td><td class="ours">Per-call: who, when, query, latency, hit count</td></tr>
      <tr><td><strong>Works with Claude.ai connectors</strong></td><td>Stdio only</td><td class="ours">Streamable HTTP + OAuth 2.1</td></tr>
    </tbody>
  </table>
</section>

<!-- ========== FAQ ========== -->
<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions.</h2>
  <details><summary>Is there an official Elasticsearch MCP server?</summary><div class="answer">Yes — Elastic ships <code>elastic/mcp-server-elasticsearch</code>. The project README marks it deprecated as of 2026 with critical-security-only updates; Elastic recommends migrating to the Agent Builder MCP endpoint in Elasticsearch 9.2.0+ and Elasticsearch Serverless. wmcp.sh is not affiliated with Elastic and provides a hosted alternative.</div></details>
  <details><summary>What's "dynamic mapping discovery"?</summary><div class="answer">A tool that returns a flattened, prompt-readable schema for an index — field name, type, analyzer, aggregatable — so the agent can plan a search without prior knowledge of your indices. Helpful for exploration and cross-cluster work.</div></details>
  <details><summary>Can the agent write to my cluster?</summary><div class="answer">Default is read-only. Index, update, delete, and mapping-change operations are blocked at the wmcp.sh layer. Write tools are opt-in per connection.</div></details>
  <details><summary>OpenSearch?</summary><div class="answer">Yes. wmcp.sh detects the cluster type at connect time and hides Elastic-specific tools (ELSER, semantic_text) when talking to OpenSearch.</div></details>
  <details><summary>Pricing?</summary><div class="answer">Free 100 reads/day anonymous. Managed Starter $499 one-time, Managed Retainer $999/mo, Enterprise $4,999+/mo. See <a href="/managed" style="color:var(--accent2)">/managed</a>.</div></details>
</section>

<!-- ========== UPGRADE ========== -->
<section id="upgrade" style="margin-top:36px;background:linear-gradient(135deg,var(--card),rgba(255,158,44,0.08));border:1px solid rgba(255,158,44,0.35);border-radius:16px;padding:22px 26px">
  <div class="section-label">For production</div>
  <h2 style="margin-top:0">Need this in production?</h2>
  <p style="color:var(--muted);max-width:640px">Production setup includes a read-only Elasticsearch API key with index-pattern restrictions, audit retention, multi-cluster routing, and SSO. Starter $499 one-time, Managed Retainer $999/mo, Enterprise $4,999+/mo.</p>
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
    <a href="/mcp-server/snowflake" style="color:var(--accent2);text-decoration:none">/mcp-server/snowflake</a> &middot;
    <a href="/mcp-server/datadog" style="color:var(--accent2);text-decoration:none">/mcp-server/datadog</a> &middot;
    <a href="/agent-ready/api" style="color:var(--accent2);text-decoration:none">/agent-ready/api</a> &middot;
    <a href="/integration/openapi" style="color:var(--accent2);text-decoration:none">/integration/openapi</a> &middot;
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
