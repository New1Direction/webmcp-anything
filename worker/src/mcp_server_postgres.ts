// /mcp-server/postgres — SEO page targeting "Postgres MCP server" searches.
//
// Standalone page. Wired separately at /mcp-server/postgres. Do NOT confuse
// with /mcp/<slug> which is reserved for the live OAuth-proxy runtime.

export function mcpServerPostgresHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Postgres MCP Server — connect Claude/Cursor/Codex to Postgres via wmcp.sh</title>
<meta name="description" content="Route Postgres MCP traffic through wmcp.sh. Per-user connection-string vault, edge query routing, row-level audit log. Read-only queries, schema introspection, parameterized SQL. Works with Claude, Cursor, Codex." />
<link rel="canonical" href="${origin}/mcp-server/postgres" />
<meta property="og:title" content="Postgres MCP Server — wmcp.sh" />
<meta property="og:description" content="Per-user credential vault, edge routing, audit log. Read-only Postgres for Claude / Cursor / Codex without self-hosting." />
<meta property="og:url" content="${origin}/mcp-server/postgres" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Postgres MCP Server — wmcp.sh" />
<meta name="twitter:description" content="Per-user credential vault, edge routing, audit log. Read-only Postgres for agents." />
<meta name="twitter:image" content="${origin}/og.png" />
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Postgres MCP Server — routed through wmcp.sh",
  "description": "How to expose Postgres as MCP tools to Claude, Cursor, and Codex without standing up an internal MCP server.",
  "author": { "@type": "Organization", "name": "WebMCP Anything" },
  "publisher": { "@type": "Organization", "name": "WebMCP Anything", "url": "https://wmcp.sh" },
  "datePublished": "2026-05-28",
  "dateModified": "2026-05-28",
  "mainEntityOfPage": "${origin}/mcp-server/postgres"
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is there an official Postgres MCP server?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A reference Postgres MCP server existed in the modelcontextprotocol/servers repository and was moved to the archived-servers repo. It still functions as reference code but is no longer actively maintained by the steering group. Several community Postgres MCP servers exist and work fine for single-tenant local use. wmcp.sh is not affiliated with PostgreSQL or any community server; it is a hosted alternative that adds per-user credential isolation, edge routing, and audit logging."
      }
    },
    {
      "@type": "Question",
      "name": "Does wmcp.sh store my database password?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Connection strings are stored encrypted in a per-user vault scoped to your wmcp.sh account. Each query call decrypts in-memory at the edge, runs against your Postgres, and the plaintext is never logged. You can rotate or revoke a connection string from the dashboard at any time without redeploying."
      }
    },
    {
      "@type": "Question",
      "name": "Can agents write to my database?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "By default the Postgres MCP tools wmcp.sh exposes are read-only. The query tool rejects DDL and DML statements (CREATE / INSERT / UPDATE / DELETE / ALTER / DROP / TRUNCATE) at the parser layer before they reach your database. Write access is opt-in per connection and requires explicit role configuration."
      }
    },
    {
      "@type": "Question",
      "name": "How does pricing work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Free tier covers 100 reads/day anonymously. For production usage, Starter is $499 one-time for setup + audit (see /managed), Managed Retainer is $999/mo, Enterprise starts at $4,999/mo. No per-query metering surprises."
      }
    },
    {
      "@type": "Question",
      "name": "Does the audit log capture parameter values?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Every query call writes a row containing: timestamp, calling client (Claude / Cursor / agent id), SQL statement, parameter values, row count returned, and execution time. The log is exportable from the dashboard and retained 30 days on Pro, 1 year on Enterprise."
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
  <div class="badge"><span class="dot"></span> mcp server &middot; postgres</div>
  <h1>Postgres MCP server, without the self-hosting tax.</h1>
  <p class="sub">Route Claude, Cursor, Codex, and any MCP client to your Postgres through wmcp.sh. Per-user credential vault, edge query routing, row-level audit log, parameterized read-only queries by default. wmcp.sh is not affiliated with PostgreSQL or the PostgreSQL Global Development Group.</p>
  <p class="hint">Connect at <code>${origin}/mcp/postgres</code> · setup ~3 minutes · free tier covers 100 reads/day</p>
</header>

<!-- ========== WHY ROUTE ========== -->
<section id="why">
  <div class="section-label">The wedge</div>
  <h2>Why route through wmcp.sh instead of running the official server.</h2>
  <div class="wedge">
    <p><strong>The reference Postgres MCP server</strong> (originally shipped in the modelcontextprotocol/servers repo) was moved to the archived-servers repository in 2025 and is no longer actively maintained by the steering group. Community forks exist but are typically single-tenant: one binary, one connection string baked into config.</p>
    <p><strong>That's fine for local dev.</strong> It breaks the moment you want (a) more than one developer hitting the same DB, (b) credentials that aren't checked into a shared config, (c) an audit trail of which agent called which query, (d) Claude.ai / Cursor remote-MCP integration that needs an HTTPS endpoint, not stdio.</p>
    <p><strong>wmcp.sh adds the multi-tenant layer</strong>: encrypted per-user connection strings, an HTTPS endpoint with OAuth, automatic parameterized-query enforcement, and a row-level audit log. No Docker, no VPC, no on-call rotation for a database proxy.</p>
  </div>
</section>

<!-- ========== TOOLS WE EXPOSE ========== -->
<section id="tools">
  <div class="section-label">What your agent gets</div>
  <h2>Postgres tools, MCP-shaped.</h2>
  <p class="section-sub">Eight tools, ready for Claude tool_use, OpenAI function-calling, or any MCP client.</p>
  <ul class="tools-list">
    <li><code>postgres.query</code><span>Run a parameterized SELECT. Rejects DDL/DML at the parser.</span></li>
    <li><code>postgres.list_schemas</code><span>List non-system schemas in the connected database.</span></li>
    <li><code>postgres.list_tables</code><span>List tables in a schema with row count estimates.</span></li>
    <li><code>postgres.describe_table</code><span>Columns, types, nullability, defaults, indexes.</span></li>
    <li><code>postgres.list_indexes</code><span>Indexes for a table including the SQL definition.</span></li>
    <li><code>postgres.explain</code><span>Run EXPLAIN (FORMAT JSON) on a candidate query — no execution.</span></li>
    <li><code>postgres.list_foreign_keys</code><span>FK relationships for graph-style schema discovery.</span></li>
    <li><code>postgres.list_extensions</code><span>Installed extensions (pgvector, postgis, timescaledb, etc.).</span></li>
  </ul>
</section>

<!-- ========== CODE EXAMPLE ========== -->
<section id="code">
  <div class="section-label">Wire it up</div>
  <h2>Python — call Postgres MCP from a Claude agent.</h2>
  <pre><code><span class="c"># pip install anthropic mcp</span>
<span class="k">import</span> os
<span class="k">from</span> anthropic <span class="k">import</span> Anthropic
<span class="k">from</span> mcp <span class="k">import</span> ClientSession
<span class="k">from</span> mcp.client.streamable_http <span class="k">import</span> streamablehttp_client

WMCP = <span class="s">"${origin}/mcp/postgres"</span>
TOKEN = os.environ[<span class="s">"WMCP_TOKEN"</span>]  <span class="c"># grab from /dashboard</span>

<span class="k">async def</span> ask(question: str):
    <span class="k">async with</span> streamablehttp_client(WMCP, headers={<span class="s">"Authorization"</span>: <span class="s">f"Bearer {TOKEN}"</span>}) <span class="k">as</span> (r, w, _):
        <span class="k">async with</span> ClientSession(r, w) <span class="k">as</span> session:
            <span class="k">await</span> session.initialize()
            tools = (<span class="k">await</span> session.list_tools()).tools
            client = Anthropic()
            msg = client.messages.create(
                model=<span class="s">"claude-opus-4-5"</span>,
                max_tokens=1024,
                tools=[{<span class="s">"name"</span>: t.name, <span class="s">"description"</span>: t.description, <span class="s">"input_schema"</span>: t.inputSchema} <span class="k">for</span> t <span class="k">in</span> tools],
                messages=[{<span class="s">"role"</span>: <span class="s">"user"</span>, <span class="s">"content"</span>: question}],
            )
            <span class="c"># dispatch tool_use blocks back to session.call_tool(...) — standard MCP loop</span>
            <span class="k">return</span> msg

<span class="c"># &gt; await ask("How many orders did we ship last week, grouped by region?")</span></code></pre>
</section>

<!-- ========== COMPARISON ========== -->
<section id="compare">
  <div class="section-label">Side by side</div>
  <h2>Self-hosted Postgres MCP server vs wmcp.sh-routed.</h2>
  <table>
    <thead>
      <tr><th>Capability</th><th>Self-hosted reference / community server</th><th>wmcp.sh-routed</th></tr>
    </thead>
    <tbody>
      <tr><td><strong>Transport</strong></td><td>stdio (local only)</td><td class="ours">Streamable HTTP + OAuth, remote-MCP friendly</td></tr>
      <tr><td><strong>Multi-user credential isolation</strong></td><td>Single conn-string in config</td><td class="ours">Per-user encrypted vault, rotatable</td></tr>
      <tr><td><strong>Audit log</strong></td><td>None (you'd build it)</td><td class="ours">Row-level: who, when, statement, params, rows, ms</td></tr>
      <tr><td><strong>Read-only enforcement</strong></td><td>Manual role config</td><td class="ours">Parser-layer rejection of DDL/DML + role-side belt</td></tr>
      <tr><td><strong>Schema introspection</strong></td><td>Basic list_tables</td><td class="ours">Schemas, tables, columns, FKs, indexes, extensions</td></tr>
      <tr><td><strong>Works with Claude.ai connectors</strong></td><td>No (stdio)</td><td class="ours">Yes (HTTPS + OAuth 2.1 DCR)</td></tr>
      <tr><td><strong>Setup time</strong></td><td>30–90 min (Docker, network, secrets)</td><td class="ours">~3 minutes — paste conn-string, copy URL</td></tr>
      <tr><td><strong>Maintenance burden</strong></td><td>You own it</td><td class="ours">We run it on Cloudflare's edge</td></tr>
    </tbody>
  </table>
</section>

<!-- ========== FAQ ========== -->
<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions.</h2>
  <details><summary>Is there an official Postgres MCP server?</summary><div class="answer">A reference implementation existed in the modelcontextprotocol/servers repo and was moved to the archived-servers repo in 2025. Community Postgres MCP servers exist on GitHub and work for single-tenant local use. wmcp.sh is not affiliated with any of them — we're a hosted alternative that adds multi-tenant credential isolation, audit logging, and an HTTPS endpoint.</div></details>
  <details><summary>Does wmcp.sh store my database password?</summary><div class="answer">Connection strings live in a per-user encrypted vault scoped to your wmcp.sh account. Plaintext is decrypted in-memory at the edge per request and never logged. Rotate or revoke at any time from /dashboard.</div></details>
  <details><summary>Can agents write to my database?</summary><div class="answer">Default is read-only. <code>postgres.query</code> rejects DDL and DML at the parser before any traffic reaches your DB. Write access is opt-in per connection and recommended only for service-role connections.</div></details>
  <details><summary>What about pgvector / pgvector queries?</summary><div class="answer">Yes — the query tool runs any valid read SQL, including vector similarity (<code>&lt;-&gt;</code>, <code>&lt;=&gt;</code>) operators. <code>postgres.list_extensions</code> reports whether pgvector is installed so your agent can plan accordingly.</div></details>
  <details><summary>Does the audit log capture parameter values?</summary><div class="answer">Yes — timestamp, client identity, statement, parameter values, row count, execution time. Retention is 30 days on Pro, 1 year on Enterprise.</div></details>
  <details><summary>Pricing?</summary><div class="answer">Free 100 reads/day anonymous. Managed Starter $499 one-time for setup + audit, Managed Retainer $999/mo, Enterprise $4,999+/mo. See <a href="/managed" style="color:var(--accent2)">/managed</a>.</div></details>
</section>

<!-- ========== UPGRADE CTA ========== -->
<section id="upgrade" style="margin-top:36px;background:linear-gradient(135deg,var(--card),rgba(124,92,255,0.08));border:1px solid rgba(124,92,255,0.35);border-radius:16px;padding:22px 26px">
  <div class="section-label">For production</div>
  <h2 style="margin-top:0">Need this in production?</h2>
  <p style="color:var(--muted);max-width:640px">If you're past the prototype stage and want a routed Postgres MCP endpoint with audit logs, SSO, and a configured read-only role on your DB, we'll set it up end-to-end. $499 one-time for Starter (setup + audit + one connection), Managed Retainer $999/mo for ongoing, Enterprise $4,999+/mo for VPC peering + dedicated support.</p>
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
    <a href="/mcp-server/redis" style="color:var(--accent2);text-decoration:none">/mcp-server/redis</a> &middot;
    <a href="/mcp-server/elasticsearch" style="color:var(--accent2);text-decoration:none">/mcp-server/elasticsearch</a> &middot;
    <a href="/mcp-server/snowflake" style="color:var(--accent2);text-decoration:none">/mcp-server/snowflake</a> &middot;
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
