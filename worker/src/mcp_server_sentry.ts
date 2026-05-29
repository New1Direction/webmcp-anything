// /mcp-server/sentry — SEO page targeting "Sentry MCP server" searches.

export function mcpServerSentryHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Sentry MCP Server — connect Claude/Cursor/Codex to Sentry via wmcp.sh</title>
<meta name="description" content="Route Sentry MCP traffic through wmcp.sh. Cross-project issue search (the gap in single-project Sentry MCP servers), list/assign/comment/resolve, vault-stored auth tokens, audit log. Works with Claude, Cursor, Codex." />
<link rel="canonical" href="${origin}/mcp-server/sentry" />
<meta property="og:title" content="Sentry MCP Server — wmcp.sh" />
<meta property="og:description" content="Cross-project issue search, list / assign / comment / resolve, vault-stored auth tokens. Sentry for agents." />
<meta property="og:url" content="${origin}/mcp-server/sentry" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Sentry MCP Server — wmcp.sh" />
<meta name="twitter:description" content="Cross-project issue search, vault-stored tokens." />
<meta name="twitter:image" content="${origin}/og.png" />
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Sentry MCP Server — routed through wmcp.sh",
  "description": "How to expose Sentry to Claude, Cursor, and Codex with cross-project issue search.",
  "author": { "@type": "Organization", "name": "WebMCP Anything" },
  "publisher": { "@type": "Organization", "name": "WebMCP Anything", "url": "https://wmcp.sh" },
  "datePublished": "2026-05-28",
  "dateModified": "2026-05-28",
  "mainEntityOfPage": "${origin}/mcp-server/sentry"
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is there an official Sentry MCP server?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Sentry maintains getsentry/sentry-mcp with a hosted endpoint at mcp.sentry.dev. It supports stdio for self-hosted Sentry and remote MCP for SaaS. wmcp.sh is not affiliated with Functional Software Inc. (Sentry); we offer a hosted alternative with cross-project issue search and a per-call audit log."
      }
    },
    {
      "@type": "Question",
      "name": "What's 'cross-project issue search'?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sentry's UI and API let you search issues, but only within a single project at a time unless you use the Discover/EventSearch UI. wmcp.sh exposes a single search_issues tool that fans out across all projects in your org the auth token can see and returns merged, ranked results. Useful when an agent is triaging a regression that spans frontend + backend + mobile projects."
      }
    },
    {
      "@type": "Question",
      "name": "Can the agent resolve or assign issues?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes — assign, resolve, ignore, and comment are exposed as tools but are opt-in per connection. Default is read-only (search + read details). All write calls are recorded in the wmcp.sh audit log."
      }
    },
    {
      "@type": "Question",
      "name": "Does this work with self-hosted Sentry?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. wmcp.sh accepts a base URL parameter per connection — point it at your self-hosted Sentry's API root and supply an internal-integration token. All tools work identically; SSO and ACL enforcement happens on the Sentry side."
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
  <div class="badge"><span class="dot"></span> mcp server &middot; sentry</div>
  <h1>Sentry MCP server with cross-project issue search.</h1>
  <p class="sub">Route Claude, Cursor, and Codex to Sentry through wmcp.sh. Search issues across every project in your org with one tool call — list, assign, comment, resolve. Vault-stored auth tokens, per-call audit log, works with SaaS and self-hosted Sentry. wmcp.sh is not affiliated with Functional Software Inc. (Sentry).</p>
  <p class="hint">Connect at <code>${origin}/mcp/sentry</code> · supports SaaS + self-hosted · default read-only</p>
</header>

<!-- ========== WHY ========== -->
<section id="why">
  <div class="section-label">The wedge</div>
  <h2>Why route through wmcp.sh instead of running the official server.</h2>
  <div class="wedge">
    <p><strong>Sentry ships an excellent official MCP server</strong> at <code>getsentry/sentry-mcp</code> with a hosted endpoint at <code>mcp.sentry.dev</code>. For a single-developer flow it's the right answer — run it, connect Cursor, done.</p>
    <p><strong>The gap shows up at team scale</strong>: most Sentry issue queries are scoped to a single project at a time. A regression that spans frontend, backend, and mobile turns into three sequential agent calls — list issues in project A, then B, then C — and the agent has to merge results itself.</p>
    <p><strong>wmcp.sh exposes a single <code>search_issues</code> tool</strong> that fans out across every project the auth token can see, merges + ranks, and returns one list. Plus encrypted token vault, default read-only mode, per-call audit log, and the ability to route some calls to SaaS Sentry and others to self-hosted from the same connection profile.</p>
  </div>
</section>

<!-- ========== TOOLS ========== -->
<section id="tools">
  <div class="section-label">What your agent gets</div>
  <h2>Sentry tools, MCP-shaped.</h2>
  <p class="section-sub">Nine tools — read tools always on, write tools opt-in per connection.</p>
  <ul class="tools-list">
    <li><code>sentry.search_issues</code><span>Cross-project search with merged ranking.</span></li>
    <li><code>sentry.list_issues</code><span>Single-project issue list with status / level filters.</span></li>
    <li><code>sentry.get_issue</code><span>Issue details + stack trace + breadcrumbs.</span></li>
    <li><code>sentry.list_events</code><span>Events for an issue, paginated.</span></li>
    <li><code>sentry.list_projects</code><span>All projects visible to the auth token.</span></li>
    <li><code>sentry.assign_issue</code><span>Assign to user or team (write opt-in).</span></li>
    <li><code>sentry.comment_issue</code><span>Add a comment to an issue (write opt-in).</span></li>
    <li><code>sentry.resolve_issue</code><span>Mark resolved with optional next-release gate (write opt-in).</span></li>
    <li><code>sentry.list_releases</code><span>Releases with first-seen / last-seen issue counts.</span></li>
  </ul>
</section>

<!-- ========== CODE ========== -->
<section id="code">
  <div class="section-label">Wire it up</div>
  <h2>Python — triage a regression across projects.</h2>
  <pre><code><span class="c"># pip install anthropic mcp</span>
<span class="k">import</span> os, asyncio
<span class="k">from</span> anthropic <span class="k">import</span> Anthropic
<span class="k">from</span> mcp <span class="k">import</span> ClientSession
<span class="k">from</span> mcp.client.streamable_http <span class="k">import</span> streamablehttp_client

WMCP = <span class="s">"${origin}/mcp/sentry"</span>
TOKEN = os.environ[<span class="s">"WMCP_TOKEN"</span>]

<span class="k">async def</span> triage():
    <span class="k">async with</span> streamablehttp_client(WMCP, headers={<span class="s">"Authorization"</span>: <span class="s">f"Bearer {TOKEN}"</span>}) <span class="k">as</span> (r, w, _):
        <span class="k">async with</span> ClientSession(r, w) <span class="k">as</span> s:
            <span class="k">await</span> s.initialize()
            tools = (<span class="k">await</span> s.list_tools()).tools
            anthropic = Anthropic()
            msg = anthropic.messages.create(
                model=<span class="s">"claude-opus-4-5"</span>,
                max_tokens=2048,
                tools=[{<span class="s">"name"</span>: t.name, <span class="s">"description"</span>: t.description, <span class="s">"input_schema"</span>: t.inputSchema} <span class="k">for</span> t <span class="k">in</span> tools],
                messages=[{<span class="s">"role"</span>: <span class="s">"user"</span>, <span class="s">"content"</span>: <span class="s">"Find all unresolved issues from the last release across every project, group by likely root cause."</span>}],
            )
            <span class="k">return</span> msg

asyncio.run(triage())</code></pre>
</section>

<!-- ========== COMPARE ========== -->
<section id="compare">
  <div class="section-label">Side by side</div>
  <h2>Official Sentry MCP server vs wmcp.sh-routed.</h2>
  <table>
    <thead><tr><th>Capability</th><th>getsentry/sentry-mcp (mcp.sentry.dev)</th><th>wmcp.sh-routed</th></tr></thead>
    <tbody>
      <tr><td><strong>Cross-project issue search</strong></td><td>Per-project tool calls</td><td class="ours">Single fan-out search tool</td></tr>
      <tr><td><strong>SaaS + self-hosted in one config</strong></td><td>Pick one per server instance</td><td class="ours">Mix in one connection profile</td></tr>
      <tr><td><strong>Auth token storage</strong></td><td>Env var / config file</td><td class="ours">Per-user encrypted vault, rotatable</td></tr>
      <tr><td><strong>Default mode</strong></td><td>Read-write</td><td class="ours">Read-only; writes opt-in per connection</td></tr>
      <tr><td><strong>wmcp.sh audit log</strong></td><td>—</td><td class="ours">Per-call: actor / tool / args / status</td></tr>
      <tr><td><strong>Sentry-side audit</strong></td><td>Yes (Sentry's own audit log)</td><td class="ours">Yes (preserved end-to-end)</td></tr>
      <tr><td><strong>Transport</strong></td><td>Stdio + remote MCP</td><td class="ours">Streamable HTTP + OAuth 2.1</td></tr>
    </tbody>
  </table>
</section>

<!-- ========== FAQ ========== -->
<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions.</h2>
  <details><summary>Is there an official Sentry MCP server?</summary><div class="answer">Yes — <code>getsentry/sentry-mcp</code> with a hosted endpoint at mcp.sentry.dev. It supports stdio and remote MCP. wmcp.sh is not affiliated with Sentry and provides an alternative with cross-project search and audit logging.</div></details>
  <details><summary>What is cross-project issue search?</summary><div class="answer">Most Sentry queries are scoped to one project. wmcp.sh exposes <code>search_issues</code> that fans out across every project visible to the token and merges results. Useful for cross-cutting regressions.</div></details>
  <details><summary>Can agents resolve issues?</summary><div class="answer">Yes — assign / resolve / ignore / comment are exposed but opt-in per connection. Default is read-only. All writes recorded in the wmcp.sh audit log and in Sentry's own audit log.</div></details>
  <details><summary>Self-hosted Sentry?</summary><div class="answer">Yes. Pass your Sentry API base URL and an internal-integration token. All tools work the same way; ACL enforcement happens server-side on Sentry.</div></details>
  <details><summary>Pricing?</summary><div class="answer">Free 100 reads/day anonymous. Managed Starter $499 one-time, Managed Retainer $999/mo, Enterprise $4,999+/mo. See <a href="/managed" style="color:var(--accent2)">/managed</a>.</div></details>
</section>

<!-- ========== UPGRADE ========== -->
<section id="upgrade" style="margin-top:36px;background:linear-gradient(135deg,var(--card),rgba(255,158,44,0.08));border:1px solid rgba(255,158,44,0.35);border-radius:16px;padding:22px 26px">
  <div class="section-label">For production</div>
  <h2 style="margin-top:0">Need this in production?</h2>
  <p style="color:var(--muted);max-width:640px">Production setup: scoped internal-integration token with project-level ACLs, audit retention, optional SSO, and webhook for agent-resolved issue notifications. Starter $499 one-time, Managed Retainer $999/mo, Enterprise $4,999+/mo.</p>
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
    <a href="/mcp-server/datadog" style="color:var(--accent2);text-decoration:none">/mcp-server/datadog</a> &middot;
    <a href="/mcp-server/cloudflare" style="color:var(--accent2);text-decoration:none">/mcp-server/cloudflare</a> &middot;
    <a href="/mcp-server/vercel" style="color:var(--accent2);text-decoration:none">/mcp-server/vercel</a> &middot;
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
