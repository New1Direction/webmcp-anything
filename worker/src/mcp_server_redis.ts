// /mcp-server/redis — SEO page targeting "Redis MCP server" searches.

export function mcpServerRedisHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Redis MCP Server — connect Claude/Cursor/Codex to Redis via wmcp.sh</title>
<meta name="description" content="Route Redis MCP traffic through wmcp.sh. Per-user connection-string vault, edge command routing, read-only by default. GET/SET/SCAN/INFO/TYPE/TTL/KEYS. Works with Claude, Cursor, Codex, any MCP client." />
<link rel="canonical" href="${origin}/mcp-server/redis" />
<meta property="og:title" content="Redis MCP Server — wmcp.sh" />
<meta property="og:description" content="Vault-stored Redis credentials, edge routing, read-only by default. Redis for agents without self-hosting." />
<meta property="og:url" content="${origin}/mcp-server/redis" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Redis MCP Server — wmcp.sh" />
<meta name="twitter:description" content="Vault-stored Redis credentials, edge routing, read-only by default." />
<meta name="twitter:image" content="${origin}/og.png" />
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Redis MCP Server — routed through wmcp.sh",
  "description": "How to expose Redis as MCP tools to Claude, Cursor, and Codex without a self-hosted MCP server.",
  "author": { "@type": "Organization", "name": "WebMCP Anything" },
  "publisher": { "@type": "Organization", "name": "WebMCP Anything", "url": "https://wmcp.sh" },
  "datePublished": "2026-05-28",
  "dateModified": "2026-05-28",
  "mainEntityOfPage": "${origin}/mcp-server/redis"
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is there an official Redis MCP server?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A reference Redis MCP server existed in the modelcontextprotocol/servers repository and has since been moved to the archived-servers repo. It still runs as reference code but is no longer maintained by the MCP steering group. Community Redis MCP servers are available. wmcp.sh is not affiliated with Redis Ltd. or any community server; it is a hosted alternative with credential isolation and edge routing."
      }
    },
    {
      "@type": "Question",
      "name": "Does wmcp.sh support Redis Cluster?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Cluster topology is detected at connection time. Commands are routed to the correct shard automatically. CLUSTER SLOTS is exposed as a tool for agents that want to reason about slot ownership."
      }
    },
    {
      "@type": "Question",
      "name": "Can agents run FLUSHALL or DEL?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "By default no. Destructive commands (FLUSHDB / FLUSHALL / DEL / UNLINK / RENAME / CONFIG SET) are blocked at the wmcp.sh layer regardless of your Redis ACL. You can opt into write commands per-connection from the dashboard, and we still log every call."
      }
    },
    {
      "@type": "Question",
      "name": "Does wmcp.sh support Redis Sentinel?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sentinel addresses are supported as connection inputs. wmcp.sh discovers the current primary and routes accordingly. Failover-during-call results in a single retry against the new primary before returning to the agent."
      }
    },
    {
      "@type": "Question",
      "name": "Pricing?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Free tier covers 100 reads/day anonymously. Managed Starter is $499 one-time for setup, Managed Retainer is $999/mo, Enterprise $4,999+/mo. No per-command metering."
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
  <div class="badge"><span class="dot"></span> mcp server &middot; redis</div>
  <h1>Redis MCP server, hosted on the edge.</h1>
  <p class="sub">Give Claude, Cursor, Codex, and any MCP client safe read-only access to Redis through wmcp.sh. Encrypted per-user credential vault, destructive-command blocklist, Cluster + Sentinel aware, audit log per call. wmcp.sh is not affiliated with Redis Ltd.</p>
  <p class="hint">Connect at <code>${origin}/mcp/redis</code> · setup in ~2 minutes · free tier covers 100 reads/day</p>
</header>

<!-- ========== WHY ROUTE ========== -->
<section id="why">
  <div class="section-label">The wedge</div>
  <h2>Why route through wmcp.sh instead of running the official server.</h2>
  <div class="wedge">
    <p><strong>The reference Redis MCP server</strong> originally lived in the modelcontextprotocol/servers repo and has been moved to the archived-servers repository. It still works as reference code, but it's stdio-only, single-tenant, and not maintained by the steering group.</p>
    <p><strong>Stdio is fine for local Cursor.</strong> It breaks the moment a Claude.ai connector or a remote agent needs to call your Redis — those clients only speak Streamable HTTP. Spinning up your own HTTPS wrapper means managing a process, TLS certs, and a way to keep secrets out of config.</p>
    <p><strong>wmcp.sh handles all of that</strong>: edge-deployed HTTPS endpoint at <code>${origin}/mcp/redis</code>, encrypted vault for connection strings, command-level blocklist for FLUSHALL / CONFIG SET / DEBUG, and a per-call audit log you can export.</p>
  </div>
</section>

<!-- ========== TOOLS ========== -->
<section id="tools">
  <div class="section-label">What your agent gets</div>
  <h2>Redis tools, MCP-shaped.</h2>
  <p class="section-sub">Eight read-focused tools, all parameter-validated before they hit your Redis.</p>
  <ul class="tools-list">
    <li><code>redis.get</code><span>GET a key; returns null if missing.</span></li>
    <li><code>redis.mget</code><span>MGET up to 100 keys in one call.</span></li>
    <li><code>redis.set</code><span>SET key value with optional EX / PX / NX / XX (write opt-in).</span></li>
    <li><code>redis.scan</code><span>SCAN cursor-based key iteration with MATCH + COUNT.</span></li>
    <li><code>redis.type</code><span>TYPE — string / list / hash / set / zset / stream / json.</span></li>
    <li><code>redis.ttl</code><span>TTL in seconds, or -1 / -2 sentinels.</span></li>
    <li><code>redis.info</code><span>INFO sections: server / memory / replication / stats / keyspace.</span></li>
    <li><code>redis.cluster_slots</code><span>Slot ownership map for Cluster deployments.</span></li>
  </ul>
</section>

<!-- ========== CODE ========== -->
<section id="code">
  <div class="section-label">Wire it up</div>
  <h2>Node — call Redis MCP from a tool-using agent.</h2>
  <pre><code><span class="c">// npm i @modelcontextprotocol/sdk @anthropic-ai/sdk</span>
<span class="k">import</span> Anthropic <span class="k">from</span> <span class="s">"@anthropic-ai/sdk"</span>;
<span class="k">import</span> { Client } <span class="k">from</span> <span class="s">"@modelcontextprotocol/sdk/client/index.js"</span>;
<span class="k">import</span> { StreamableHTTPClientTransport } <span class="k">from</span> <span class="s">"@modelcontextprotocol/sdk/client/streamableHttp.js"</span>;

<span class="k">const</span> WMCP = <span class="s">"${origin}/mcp/redis"</span>;
<span class="k">const</span> token = process.env.WMCP_TOKEN!;  <span class="c">// from /dashboard</span>

<span class="k">const</span> mcp = <span class="k">new</span> Client({ name: <span class="s">"redis-agent"</span>, version: <span class="s">"1.0"</span> });
<span class="k">await</span> mcp.connect(<span class="k">new</span> StreamableHTTPClientTransport(<span class="k">new</span> URL(WMCP), {
  requestInit: { headers: { Authorization: <span class="s">\`Bearer \${token}\`</span> } }
}));

<span class="k">const</span> { tools } = <span class="k">await</span> mcp.listTools();
<span class="k">const</span> anthropic = <span class="k">new</span> Anthropic();

<span class="k">const</span> msg = <span class="k">await</span> anthropic.messages.create({
  model: <span class="s">"claude-opus-4-5"</span>,
  max_tokens: 1024,
  tools: tools.map(t =&gt; ({ name: t.name, description: t.description, input_schema: t.inputSchema })),
  messages: [{ role: <span class="s">"user"</span>, content: <span class="s">"What's in the session:user:* keyspace right now?"</span> }],
});
<span class="c">// dispatch tool_use blocks back via mcp.callTool({name, arguments}) — standard MCP loop</span></code></pre>
</section>

<!-- ========== COMPARE ========== -->
<section id="compare">
  <div class="section-label">Side by side</div>
  <h2>Self-hosted Redis MCP server vs wmcp.sh-routed.</h2>
  <table>
    <thead><tr><th>Capability</th><th>Self-hosted reference / community server</th><th>wmcp.sh-routed</th></tr></thead>
    <tbody>
      <tr><td><strong>Transport</strong></td><td>stdio</td><td class="ours">Streamable HTTP + OAuth, remote-MCP friendly</td></tr>
      <tr><td><strong>Credential storage</strong></td><td>Plaintext env var or config</td><td class="ours">Encrypted per-user vault, rotatable</td></tr>
      <tr><td><strong>Destructive-command blocklist</strong></td><td>You build it</td><td class="ours">FLUSHALL / CONFIG SET / DEBUG blocked by default</td></tr>
      <tr><td><strong>Cluster + Sentinel</strong></td><td>Library dependent</td><td class="ours">Auto-detect + route + failover</td></tr>
      <tr><td><strong>Audit log</strong></td><td>None</td><td class="ours">Per-call: who, when, command, args, latency</td></tr>
      <tr><td><strong>Works with Claude.ai connectors</strong></td><td>No</td><td class="ours">Yes (OAuth 2.1 DCR)</td></tr>
      <tr><td><strong>Setup time</strong></td><td>30+ min</td><td class="ours">~2 min — paste URI</td></tr>
    </tbody>
  </table>
</section>

<!-- ========== FAQ ========== -->
<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions.</h2>
  <details><summary>Is there an official Redis MCP server?</summary><div class="answer">A reference Redis MCP server existed in modelcontextprotocol/servers and was moved to the archived-servers repo in 2025. It still works as reference code but is no longer maintained by the steering group. wmcp.sh is not affiliated with Redis Ltd. or any community fork.</div></details>
  <details><summary>Does wmcp.sh support Redis Cluster?</summary><div class="answer">Yes. Cluster topology is read at connect time, commands are routed to the correct shard, and slot maps are refreshed on MOVED responses. <code>redis.cluster_slots</code> exposes the current map for agent planning.</div></details>
  <details><summary>What about Sentinel?</summary><div class="answer">Sentinel addresses are accepted in the connection string. wmcp.sh discovers the current primary, routes to it, and retries once against the new primary on failover.</div></details>
  <details><summary>Can agents write keys?</summary><div class="answer">Write tools (SET, EXPIRE, etc.) are opt-in per connection. Destructive commands (FLUSHALL / FLUSHDB / CONFIG SET / DEBUG / SHUTDOWN) are blocked at the wmcp.sh layer regardless of opt-in.</div></details>
  <details><summary>Does it work with Upstash / Redis Cloud?</summary><div class="answer">Yes. Any Redis-protocol endpoint reachable on the public internet works, including Upstash, Redis Cloud, AWS ElastiCache (via public endpoint), and self-hosted.</div></details>
  <details><summary>Pricing?</summary><div class="answer">Free 100 reads/day anonymous. Managed Starter $499 one-time, Managed Retainer $999/mo, Enterprise $4,999+/mo. See <a href="/managed" style="color:var(--accent2)">/managed</a>.</div></details>
</section>

<!-- ========== UPGRADE ========== -->
<section id="upgrade" style="margin-top:36px;background:linear-gradient(135deg,var(--card),rgba(255,158,44,0.08));border:1px solid rgba(255,158,44,0.35);border-radius:16px;padding:22px 26px">
  <div class="section-label">For production</div>
  <h2 style="margin-top:0">Need this in production?</h2>
  <p style="color:var(--muted);max-width:640px">For production Redis MCP — read-only ACL on your DB, audit retention, SSO, and dashboards across multiple connections — we'll set it up end-to-end. Starter $499 one-time, Managed Retainer $999/mo, Enterprise $4,999+/mo for VPC peering and dedicated support.</p>
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
    <a href="/agent-ready" style="color:var(--accent2);text-decoration:none">/agent-ready</a> &middot;
    <a href="/agent-ready/api" style="color:var(--accent2);text-decoration:none">/agent-ready/api</a> &middot;
    <a href="/directory" style="color:var(--accent2);text-decoration:none">/directory</a> &middot;
    <a href="/integration/openapi" style="color:var(--accent2);text-decoration:none">/integration/openapi</a>
  </p>
</section>

</div>

<footer>
  <a href="/">Home</a> · <a href="/agent-ready">Agent-ready</a> · <a href="/managed">Done for you</a> · <a href="/integration/openapi">OpenAPI</a> · <a href="/directory">Directory</a> · <a href="/directory/submit">Submit</a> · <a href="/blog">Blog</a>
</footer>

</body>
</html>`;
}
