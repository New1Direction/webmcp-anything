// /mcp-server/cloudflare — SEO page targeting "Cloudflare MCP server" searches.

export function mcpServerCloudflareHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Cloudflare MCP Server — connect Claude/Cursor/Codex to Cloudflare via wmcp.sh</title>
<meta name="description" content="Route Cloudflare MCP traffic through wmcp.sh. Cross-account routing for agencies, list zones / DNS / Worker scripts / R2 buckets, scoped API-token vault, audit log. Works with Claude, Cursor, Codex." />
<link rel="canonical" href="${origin}/mcp-server/cloudflare" />
<meta property="og:title" content="Cloudflare MCP Server — wmcp.sh" />
<meta property="og:description" content="Cross-account routing for agencies, list zones / DNS / Workers / R2, scoped token vault, audit log." />
<meta property="og:url" content="${origin}/mcp-server/cloudflare" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Cloudflare MCP Server — wmcp.sh" />
<meta name="twitter:description" content="Cross-account routing for agencies, scoped token vault." />
<meta name="twitter:image" content="${origin}/og.png" />
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Cloudflare MCP Server — routed through wmcp.sh",
  "description": "How to expose Cloudflare zones, DNS, Workers, and R2 to Claude, Cursor, and Codex — with cross-account routing for agencies.",
  "author": { "@type": "Organization", "name": "WebMCP Anything" },
  "publisher": { "@type": "Organization", "name": "WebMCP Anything", "url": "https://wmcp.sh" },
  "datePublished": "2026-05-28",
  "dateModified": "2026-05-28",
  "mainEntityOfPage": "${origin}/mcp-server/cloudflare"
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is there an official Cloudflare MCP server?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Cloudflare maintains cloudflare/mcp-server-cloudflare on GitHub — actively developed with multiple sub-servers (Workers, R2, DNS, Browser Rendering, AutoRAG, etc.). It's the right answer for a single-account developer. wmcp.sh is not affiliated with Cloudflare Inc.; we offer a hosted alternative with cross-account routing for agencies and consultancies that manage many client accounts."
      }
    },
    {
      "@type": "Question",
      "name": "What is 'cross-account routing for agencies'?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Agencies typically have access to multiple Cloudflare accounts via the Tenant API or per-client API tokens. The official MCP server is configured per-account. wmcp.sh lets you register N accounts under one connection profile and routes each tool call to the right account based on the zone or account-id argument. One MCP endpoint, many client accounts."
      }
    },
    {
      "@type": "Question",
      "name": "Where are my API tokens stored?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Encrypted per-user vault, scoped per account. Each token is namespaced to its Cloudflare account id and decrypted in memory at the edge per request. Rotate or revoke from /dashboard at any time."
      }
    },
    {
      "@type": "Question",
      "name": "Can the agent deploy a Worker or change DNS?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Write tools (deploy Worker, create / update DNS, create R2 bucket, purge cache) are exposed but opt-in per connection. Default is read-only — list zones, list DNS records, list Worker scripts, list R2 buckets, view analytics. All writes audit-logged."
      }
    },
    {
      "@type": "Question",
      "name": "Pricing?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Free 100 reads/day anonymous. Managed Starter $499 one-time, Pro $999/mo, Enterprise $4,999+/mo. See /managed. Cloudflare billing is handled by Cloudflare."
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
  <div class="badge"><span class="dot"></span> mcp server &middot; cloudflare</div>
  <h1>Cloudflare MCP server with cross-account routing.</h1>
  <p class="sub">Manage many Cloudflare accounts from one MCP connection. Built for agencies, consultancies, and platforms that operate dozens of client accounts. Vault-stored scoped API tokens, default read-only, audit log per call. wmcp.sh is not affiliated with Cloudflare Inc.</p>
  <p class="hint">Connect at <code>${origin}/mcp/cloudflare</code> · register many accounts per connection · default read-only</p>
</header>

<!-- ========== WHY ========== -->
<section id="why">
  <div class="section-label">The wedge</div>
  <h2>Why route through wmcp.sh instead of running the official server.</h2>
  <div class="wedge">
    <p><strong>Cloudflare ships an excellent official MCP server</strong> at <code>cloudflare/mcp-server-cloudflare</code> — actively developed with sub-servers for Workers, R2, DNS, Browser Rendering, AutoRAG and more. For a single developer with one Cloudflare account, that's the right answer.</p>
    <p><strong>The gap is multi-account.</strong> Agencies, consultancies, and platforms that operate Cloudflare on behalf of multiple clients end up running N copies of the official server — one per client account — and switching between them in the IDE. The agent has no way to reason about "do this on client A's account, that on client B's".</p>
    <p><strong>wmcp.sh adds the multi-account layer</strong>: register many Cloudflare accounts (each with its own scoped API token) under one connection profile. Every tool call accepts an <code>account_id</code> parameter, and wmcp.sh routes to the matching token. One MCP endpoint, N client accounts, default read-only, full audit log.</p>
  </div>
</section>

<!-- ========== TOOLS ========== -->
<section id="tools">
  <div class="section-label">What your agent gets</div>
  <h2>Cloudflare tools, MCP-shaped.</h2>
  <p class="section-sub">Ten read-focused tools spanning zones, DNS, Workers, R2, and analytics.</p>
  <ul class="tools-list">
    <li><code>cloudflare.list_accounts</code><span>All accounts registered to this wmcp.sh connection.</span></li>
    <li><code>cloudflare.list_zones</code><span>Zones for an account, with plan + status.</span></li>
    <li><code>cloudflare.list_dns_records</code><span>DNS records for a zone with type + content + proxied flag.</span></li>
    <li><code>cloudflare.list_workers</code><span>Worker scripts for an account.</span></li>
    <li><code>cloudflare.get_worker</code><span>Worker metadata: routes, bindings, last-deployed.</span></li>
    <li><code>cloudflare.list_r2_buckets</code><span>R2 buckets with location + creation date.</span></li>
    <li><code>cloudflare.list_kv_namespaces</code><span>KV namespaces with id + title.</span></li>
    <li><code>cloudflare.list_d1_databases</code><span>D1 databases with size + version.</span></li>
    <li><code>cloudflare.zone_analytics</code><span>Requests / bandwidth / threat counts for a zone.</span></li>
    <li><code>cloudflare.list_page_rules</code><span>Page rules for a zone (active + paused).</span></li>
  </ul>
</section>

<!-- ========== CODE ========== -->
<section id="code">
  <div class="section-label">Wire it up</div>
  <h2>Node — list zones across all client accounts.</h2>
  <pre><code><span class="c">// npm i @modelcontextprotocol/sdk @anthropic-ai/sdk</span>
<span class="k">import</span> Anthropic <span class="k">from</span> <span class="s">"@anthropic-ai/sdk"</span>;
<span class="k">import</span> { Client } <span class="k">from</span> <span class="s">"@modelcontextprotocol/sdk/client/index.js"</span>;
<span class="k">import</span> { StreamableHTTPClientTransport } <span class="k">from</span> <span class="s">"@modelcontextprotocol/sdk/client/streamableHttp.js"</span>;

<span class="k">const</span> WMCP = <span class="s">"${origin}/mcp/cloudflare"</span>;
<span class="k">const</span> token = process.env.WMCP_TOKEN!;

<span class="k">const</span> mcp = <span class="k">new</span> Client({ name: <span class="s">"cf-agency"</span>, version: <span class="s">"1.0"</span> });
<span class="k">await</span> mcp.connect(<span class="k">new</span> StreamableHTTPClientTransport(<span class="k">new</span> URL(WMCP), {
  requestInit: { headers: { Authorization: <span class="s">\`Bearer \${token}\`</span> } }
}));

<span class="k">const</span> { tools } = <span class="k">await</span> mcp.listTools();
<span class="k">const</span> anthropic = <span class="k">new</span> Anthropic();

<span class="k">const</span> msg = <span class="k">await</span> anthropic.messages.create({
  model: <span class="s">"claude-opus-4-5"</span>,
  max_tokens: 2048,
  tools: tools.map(t =&gt; ({ name: t.name, description: t.description, input_schema: t.inputSchema })),
  messages: [{ role: <span class="s">"user"</span>, content: <span class="s">"For every account I have, list zones with their plan and SSL mode."</span> }],
});
<span class="c">// agent calls list_accounts first, then loops list_zones per account_id</span></code></pre>
</section>

<!-- ========== COMPARE ========== -->
<section id="compare">
  <div class="section-label">Side by side</div>
  <h2>Official Cloudflare MCP server vs wmcp.sh-routed.</h2>
  <table>
    <thead><tr><th>Capability</th><th>cloudflare/mcp-server-cloudflare</th><th>wmcp.sh-routed</th></tr></thead>
    <tbody>
      <tr><td><strong>Single-account flow</strong></td><td>Excellent</td><td class="ours">Equivalent</td></tr>
      <tr><td><strong>Cross-account routing</strong></td><td>Run one server per account</td><td class="ours">N accounts in one connection, account_id per call</td></tr>
      <tr><td><strong>API token storage</strong></td><td>OAuth / env var</td><td class="ours">Encrypted vault, per-account namespacing</td></tr>
      <tr><td><strong>Default mode</strong></td><td>Read + write</td><td class="ours">Read-only; writes opt-in</td></tr>
      <tr><td><strong>Audit log</strong></td><td>Cloudflare-side</td><td class="ours">wmcp.sh per-call + Cloudflare-side preserved</td></tr>
      <tr><td><strong>Worker / R2 / KV / D1 coverage</strong></td><td>Full</td><td class="ours">Read-only subset, common 80%</td></tr>
      <tr><td><strong>Transport</strong></td><td>Streamable HTTP + OAuth</td><td class="ours">Streamable HTTP + OAuth 2.1</td></tr>
    </tbody>
  </table>
</section>

<!-- ========== FAQ ========== -->
<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions.</h2>
  <details><summary>Is there an official Cloudflare MCP server?</summary><div class="answer">Yes — <code>cloudflare/mcp-server-cloudflare</code>, actively developed with multiple sub-servers. For a single-account dev that's the right answer. wmcp.sh is not affiliated with Cloudflare and offers a hosted alternative with cross-account routing for agencies.</div></details>
  <details><summary>What's cross-account routing?</summary><div class="answer">Register multiple Cloudflare accounts in one wmcp.sh connection profile. Tools take an <code>account_id</code> parameter, and wmcp.sh routes to the right scoped API token. One endpoint, many client accounts.</div></details>
  <details><summary>Where are tokens stored?</summary><div class="answer">Encrypted per-user vault, namespaced per account id. Decrypted in memory per request, never logged.</div></details>
  <details><summary>Can the agent deploy Workers?</summary><div class="answer">Write tools (deploy Worker, edit DNS, create R2, purge cache) are opt-in per connection. Default is read-only.</div></details>
  <details><summary>Pricing?</summary><div class="answer">Free 100 reads/day anonymous. Managed Starter $499 one-time, Pro $999/mo, Enterprise $4,999+/mo. See <a href="/managed" style="color:var(--accent2)">/managed</a>.</div></details>
</section>

<!-- ========== UPGRADE ========== -->
<section id="upgrade" style="margin-top:36px;background:linear-gradient(135deg,var(--card),rgba(124,92,255,0.08));border:1px solid rgba(124,92,255,0.35);border-radius:16px;padding:22px 26px">
  <div class="section-label">For production</div>
  <h2 style="margin-top:0">Need this in production?</h2>
  <p style="color:var(--muted);max-width:640px">Production multi-account Cloudflare MCP: scoped API tokens per client with read-only or fine-grained write perms, audit retention, SSO, per-account billing tagging in your dashboard. Starter $499 one-time, Pro $999/mo, Enterprise $4,999+/mo.</p>
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
    <a href="/mcp-server/vercel" style="color:var(--accent2);text-decoration:none">/mcp-server/vercel</a> &middot;
    <a href="/mcp-server/datadog" style="color:var(--accent2);text-decoration:none">/mcp-server/datadog</a> &middot;
    <a href="/mcp-server/sentry" style="color:var(--accent2);text-decoration:none">/mcp-server/sentry</a> &middot;
    <a href="/agent-ready" style="color:var(--accent2);text-decoration:none">/agent-ready</a> &middot;
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
