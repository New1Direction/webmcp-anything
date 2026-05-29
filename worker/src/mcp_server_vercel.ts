// /mcp-server/vercel — SEO page targeting "Vercel MCP server" searches.

export function mcpServerVercelHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Vercel MCP Server — connect Claude/Cursor/Codex to Vercel via wmcp.sh</title>
<meta name="description" content="Route Vercel MCP traffic through wmcp.sh. Env var write protection (reads default-on, writes require explicit allow), list projects / deployments / domains, vault-stored tokens, audit log. Works with Claude, Cursor, Codex." />
<link rel="canonical" href="${origin}/mcp-server/vercel" />
<meta property="og:title" content="Vercel MCP Server — wmcp.sh" />
<meta property="og:description" content="Env var write protection, list projects / deployments / domains, vault-stored tokens, audit log." />
<meta property="og:url" content="${origin}/mcp-server/vercel" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Vercel MCP Server — wmcp.sh" />
<meta name="twitter:description" content="Env var write protection, vault-stored tokens." />
<meta name="twitter:image" content="${origin}/og.png" />
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Vercel MCP Server — routed through wmcp.sh",
  "description": "How to expose Vercel projects, deployments, env vars, and domains to Claude, Cursor, and Codex with env-write protection.",
  "author": { "@type": "Organization", "name": "WebMCP Anything" },
  "publisher": { "@type": "Organization", "name": "WebMCP Anything", "url": "https://wmcp.sh" },
  "datePublished": "2026-05-28",
  "dateModified": "2026-05-28",
  "mainEntityOfPage": "${origin}/mcp-server/vercel"
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is there an official Vercel MCP server?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Vercel maintains an official MCP server at https://mcp.vercel.com (remote MCP over Streamable HTTP with OAuth). It covers docs search, projects, deployments, and logs. wmcp.sh is not affiliated with Vercel Inc.; we offer a hosted alternative with env-var write protection — reads on, writes off by default — for teams that want a safety net against agent-driven environment mutation."
      }
    },
    {
      "@type": "Question",
      "name": "What is 'env var write protection'?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "By default, reads on environment variables (list, get name + target environment, get scope) are allowed but values are redacted unless explicitly opted in. Writes (create, update, delete) are blocked at the wmcp.sh layer regardless of token scope. Both protections are opt-out per connection so you can graduate to fuller access deliberately. Closes the common 'agent ran update_env in prod' failure mode."
      }
    },
    {
      "@type": "Question",
      "name": "Can the agent trigger deployments or roll back?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Read tools (list deployments, get deployment, get logs, list domains) are on by default. Write tools (trigger deployment, promote to production, rollback, alias domain) are opt-in per connection. All writes are recorded in the wmcp.sh audit log."
      }
    },
    {
      "@type": "Question",
      "name": "Does this work for team accounts?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. The connection profile accepts a Vercel team ID. All tools scope to that team. Multiple teams can be registered under one wmcp.sh connection with a team_id parameter on each call."
      }
    },
    {
      "@type": "Question",
      "name": "Pricing?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Free 100 reads/day anonymous. Managed Starter $499 one-time, Managed Retainer $999/mo, Enterprise $4,999+/mo. See /managed. Vercel billing is handled by Vercel directly."
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
  <div class="badge"><span class="dot"></span> mcp server &middot; vercel</div>
  <h1>Vercel MCP server with env-var write protection.</h1>
  <p class="sub">Route Claude, Cursor, and Codex to Vercel through wmcp.sh. Reads on by default, env-var writes blocked unless explicitly enabled — closes the most common agent footgun. Vault-stored tokens, multi-team routing, audit log. wmcp.sh is not affiliated with Vercel Inc.</p>
  <p class="hint">Connect at <code>${origin}/mcp/vercel</code> · default read-only · env-write protection always on by default</p>
</header>

<!-- ========== WHY ========== -->
<section id="why">
  <div class="section-label">The wedge</div>
  <h2>Why route through wmcp.sh instead of running the official server.</h2>
  <div class="wedge">
    <p><strong>Vercel ships an official MCP server</strong> at <code>https://mcp.vercel.com</code> — remote MCP with OAuth, supported by Claude / Cursor / VS Code / ChatGPT and a list of other clients. For most workflows it's the right answer.</p>
    <p><strong>The gap is the blast radius of writes.</strong> A Vercel API token with project access can read and write environment variables, trigger deployments, promote to production, and alias domains. An agent that accidentally calls <code>update_env</code> on a prod project can hand-grenade a service.</p>
    <p><strong>wmcp.sh adds a write-protection layer</strong>: env-var writes are blocked at the wmcp.sh proxy regardless of token scope, and env-var values are redacted on read unless explicitly opted in. Other write tools (deploy, promote, rollback) are also opt-in per connection. Tokens live in an encrypted per-user vault and are namespaced per team for multi-team workflows.</p>
  </div>
</section>

<!-- ========== TOOLS ========== -->
<section id="tools">
  <div class="section-label">What your agent gets</div>
  <h2>Vercel tools, MCP-shaped.</h2>
  <p class="section-sub">Ten tools covering projects, deployments, env vars, domains, and logs.</p>
  <ul class="tools-list">
    <li><code>vercel.list_projects</code><span>Projects for the active team with framework + last-deploy.</span></li>
    <li><code>vercel.get_project</code><span>Project metadata: links, build settings, framework.</span></li>
    <li><code>vercel.list_deployments</code><span>Deployments with state (READY / ERROR / BUILDING) + url.</span></li>
    <li><code>vercel.get_deployment</code><span>Single deployment with build + runtime metadata.</span></li>
    <li><code>vercel.get_deployment_logs</code><span>Build + runtime logs for a deployment.</span></li>
    <li><code>vercel.list_env_vars</code><span>Names + targets (production / preview / dev), values redacted by default.</span></li>
    <li><code>vercel.list_domains</code><span>Custom domains attached to a project with verification state.</span></li>
    <li><code>vercel.list_teams</code><span>Teams the access token can see.</span></li>
    <li><code>vercel.list_aliases</code><span>Production aliases per project.</span></li>
    <li><code>vercel.list_certificates</code><span>SSL certs with issuer + expiry.</span></li>
  </ul>
</section>

<!-- ========== CODE ========== -->
<section id="code">
  <div class="section-label">Wire it up</div>
  <h2>Python — investigate a failed deployment.</h2>
  <pre><code><span class="c"># pip install anthropic mcp</span>
<span class="k">import</span> os, asyncio
<span class="k">from</span> anthropic <span class="k">import</span> Anthropic
<span class="k">from</span> mcp <span class="k">import</span> ClientSession
<span class="k">from</span> mcp.client.streamable_http <span class="k">import</span> streamablehttp_client

WMCP = <span class="s">"${origin}/mcp/vercel"</span>
TOKEN = os.environ[<span class="s">"WMCP_TOKEN"</span>]

<span class="k">async def</span> investigate():
    <span class="k">async with</span> streamablehttp_client(WMCP, headers={<span class="s">"Authorization"</span>: <span class="s">f"Bearer {TOKEN}"</span>}) <span class="k">as</span> (r, w, _):
        <span class="k">async with</span> ClientSession(r, w) <span class="k">as</span> s:
            <span class="k">await</span> s.initialize()
            tools = (<span class="k">await</span> s.list_tools()).tools
            anthropic = Anthropic()
            msg = anthropic.messages.create(
                model=<span class="s">"claude-opus-4-5"</span>,
                max_tokens=2048,
                tools=[{<span class="s">"name"</span>: t.name, <span class="s">"description"</span>: t.description, <span class="s">"input_schema"</span>: t.inputSchema} <span class="k">for</span> t <span class="k">in</span> tools],
                messages=[{<span class="s">"role"</span>: <span class="s">"user"</span>, <span class="s">"content"</span>: <span class="s">"Find the most recent failed deployment of 'web-app', pull the build logs, and tell me what broke."</span>}],
            )
            <span class="k">return</span> msg

asyncio.run(investigate())</code></pre>
</section>

<!-- ========== COMPARE ========== -->
<section id="compare">
  <div class="section-label">Side by side</div>
  <h2>Official Vercel MCP vs wmcp.sh-routed.</h2>
  <table>
    <thead><tr><th>Capability</th><th>mcp.vercel.com (official)</th><th>wmcp.sh-routed</th></tr></thead>
    <tbody>
      <tr><td><strong>Read coverage</strong></td><td>Excellent — official is the canonical</td><td class="ours">Common 80% (projects / deploys / logs / domains)</td></tr>
      <tr><td><strong>Env-var write protection</strong></td><td>Token-scope based</td><td class="ours">Blocked at proxy regardless of scope</td></tr>
      <tr><td><strong>Env-var read redaction</strong></td><td>Returns values</td><td class="ours">Redacted by default; opt-in per connection</td></tr>
      <tr><td><strong>Multi-team in one config</strong></td><td>Per-team server instance</td><td class="ours">N teams in one connection, team_id per call</td></tr>
      <tr><td><strong>Token storage</strong></td><td>OAuth (official)</td><td class="ours">Encrypted vault, rotatable</td></tr>
      <tr><td><strong>Default write tools</strong></td><td>Available per token scope</td><td class="ours">Off by default; opt-in per connection</td></tr>
      <tr><td><strong>Audit log</strong></td><td>Vercel-side</td><td class="ours">wmcp.sh per-call + Vercel-side preserved</td></tr>
    </tbody>
  </table>
</section>

<!-- ========== FAQ ========== -->
<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions.</h2>
  <details><summary>Is there an official Vercel MCP server?</summary><div class="answer">Yes — Vercel's official MCP server is at <code>https://mcp.vercel.com</code>, remote MCP with OAuth, supported by Claude / Cursor / VS Code / ChatGPT and more. wmcp.sh is not affiliated with Vercel; we offer a hosted alternative with env-write protection.</div></details>
  <details><summary>What's env-var write protection?</summary><div class="answer">Writes to environment variables (create / update / delete) are blocked at the wmcp.sh layer regardless of token scope. Reads return names and target environments but redact values unless you explicitly opt in. Closes the common "agent overwrote prod env" failure mode.</div></details>
  <details><summary>Can the agent trigger deployments?</summary><div class="answer">Trigger / promote / rollback / alias are exposed as opt-in write tools. Default is read-only. All writes audit-logged.</div></details>
  <details><summary>Team accounts?</summary><div class="answer">Yes — multiple Vercel teams can be registered under one wmcp.sh connection with a team_id parameter per call.</div></details>
  <details><summary>Pricing?</summary><div class="answer">Free 100 reads/day anonymous. Managed Starter $499 one-time, Managed Retainer $999/mo, Enterprise $4,999+/mo. See <a href="/managed" style="color:var(--accent2)">/managed</a>.</div></details>
</section>

<!-- ========== UPGRADE ========== -->
<section id="upgrade" style="margin-top:36px;background:linear-gradient(135deg,var(--card),rgba(124,92,255,0.08));border:1px solid rgba(124,92,255,0.35);border-radius:16px;padding:22px 26px">
  <div class="section-label">For production</div>
  <h2 style="margin-top:0">Need this in production?</h2>
  <p style="color:var(--muted);max-width:640px">Production Vercel MCP: scoped tokens per team with read-only or fine-grained write perms, env-write allowlists, audit retention, SSO, optional deployment-promotion approval flow. Starter $499 one-time, Managed Retainer $999/mo, Enterprise $4,999+/mo.</p>
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
    <a href="/mcp-server/cloudflare" style="color:var(--accent2);text-decoration:none">/mcp-server/cloudflare</a> &middot;
    <a href="/mcp-server/sentry" style="color:var(--accent2);text-decoration:none">/mcp-server/sentry</a> &middot;
    <a href="/mcp-server/datadog" style="color:var(--accent2);text-decoration:none">/mcp-server/datadog</a> &middot;
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
