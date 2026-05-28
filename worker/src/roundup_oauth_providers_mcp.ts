// /roundup/oauth-providers-mcp — comparison of OAuth-enabled MCP providers.
// SERP target: "mcp oauth", "oauth mcp providers", "mcp slack oauth",
// "google oauth mcp", "mcp authentication".
//
// We list providers that publicly support OAuth 2.0 / 2.1 flows for
// their APIs (and where applicable, MCP servers). Scopes and token
// lifetimes change — we describe shape, not specific scope strings,
// and link to vendor docs as authoritative.
//
// wmcp.sh is not affiliated with any of the providers listed.

export function roundupOauthProvidersMcpHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>OAuth-enabled MCP providers — comparison & setup guide 2026 | wmcp.sh</title>
<meta name="description" content="Which providers support OAuth flows for MCP — Google, GitHub, Slack, Stripe, Notion, Linear, Discord. Compare scopes, token storage, integration effort. wmcp.sh as a centralized OAuth vault." />
<link rel="canonical" href="${origin}/roundup/oauth-providers-mcp" />
<meta property="og:title" content="OAuth-enabled MCP providers — comparison 2026" />
<meta property="og:description" content="Compare OAuth flows + scopes + token storage across Google, GitHub, Slack, Stripe, Notion, Linear, Discord — plus setup tips." />
<meta property="og:url" content="${origin}/roundup/oauth-providers-mcp" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="OAuth-enabled MCP providers comparison" />
<meta name="twitter:description" content="Compare OAuth + scopes + storage across major providers. Setup guide included." />
<meta name="twitter:image" content="${origin}/og.png" />
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "OAuth-enabled MCP providers — comparison & setup guide 2026",
  "description": "Comparison of OAuth flows, scopes, token storage models, and integration effort across major MCP-capable providers.",
  "author": { "@type": "Organization", "name": "WebMCP Anything" },
  "publisher": { "@type": "Organization", "name": "WebMCP Anything", "url": "https://wmcp.sh" },
  "datePublished": "2026-05-28",
  "dateModified": "2026-05-28",
  "mainEntityOfPage": "${origin}/roundup/oauth-providers-mcp"
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Why does OAuth matter for MCP?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Most useful tool surfaces in 2026 are gated by OAuth — Google APIs, GitHub repos, Slack workspaces, Stripe customers' data, Notion databases. For an AI agent to act on a user's behalf at any of these, it needs a valid access token. The MCP spec supports OAuth 2.1 (RFC 6749/9700, with PKCE and Dynamic Client Registration / RFC 7591), so MCP servers and clients can negotiate auth without bespoke flows per provider."
      }
    },
    {
      "@type": "Question",
      "name": "What's the difference between owner-side and shopper-side OAuth?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Owner-side: the end user authorizes their own SaaS accounts (their Gmail, their GitHub, their Slack workspace). The agent calls APIs as that user. Shopper-side: the user doesn't own the upstream system — they're acting against a public surface (a Shopify storefront, a public DefiLlama endpoint). Owner-side typically needs full OAuth flow per user; shopper-side often doesn't need OAuth at all, or uses a shared API key."
      }
    },
    {
      "@type": "Question",
      "name": "Where do MCP tokens live?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Three common patterns: (1) Local — the client (Claude Desktop, Cursor) stores tokens on the user's machine. (2) Managed vault — a hosted service (Composio, Arcade, wmcp.sh OAuth proxy, etc.) stores tokens server-side and proxies API calls. (3) Per-call — the agent receives a short-lived token from another part of the system. Each has different security tradeoffs."
      }
    },
    {
      "@type": "Question",
      "name": "How does wmcp.sh handle OAuth?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "wmcp.sh acts as a bearer-injecting OAuth proxy for upstream MCP servers. Pattern: an agent connects to wmcp.sh/mcp/<provider> using RFC 7591 Dynamic Client Registration + PKCE. wmcp.sh handles the upstream OAuth dance on the agent's behalf and forwards tool calls with the right bearer token. Useful for agents (like Claude.ai connectors) that can connect to one MCP server but can't drive arbitrary OAuth flows themselves."
      }
    },
    {
      "@type": "Question",
      "name": "Which providers have official MCP servers with OAuth in 2026?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "At time of writing, providers with publicly-documented official MCP support and OAuth include Linear, GitHub, Slack, and several others — plus community-maintained MCP servers for Google APIs (Gmail, Calendar, Drive), Notion, Discord, Stripe, and more. The list is moving — check each vendor's docs for canonical info, or browse /directory for community submissions."
      }
    }
  ]
}
</script>
<style>
  :root { --bg:#07070d;--card:#16161f;--bg2:#11111c;--border:#26263a;--text:#ececf5;--muted:#8a8aa8;--dim:#6a6a88;--accent:#7c5cff;--accent2:#00e5ff;--green:#4ade80;--red:#f87171;--pink:#f0abfc;--gold:#fbbf24; }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin:0;min-height:100vh;color:var(--text);background:var(--bg);font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif;line-height:1.6;background-image:radial-gradient(ellipse 900px 600px at 10% -5%,rgba(124,92,255,.18),transparent 60%),radial-gradient(ellipse 700px 500px at 95% 10%,rgba(0,229,255,.10),transparent 60%); }
  .wrap { max-width: 980px; margin: 0 auto; padding: 0 24px; }
  nav { display:flex;justify-content:space-between;align-items:center;padding:22px 24px;max-width:1120px;margin:0 auto; }
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
  .sub { color: var(--muted); font-size: 1.05rem; max-width: 720px; margin: 0 0 24px; }
  .hint { color: var(--dim); font-size: .85rem; margin-top: 8px; }
  .disclaim { color: var(--dim); font-size: .75rem; margin-top: 14px; font-style: italic; }
  section { padding: 36px 0; }
  .section-label { display:inline-block;font-size:.72rem;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--accent2);margin-bottom:10px; }
  h2 { font-size:clamp(1.4rem,3vw,1.9rem);margin:0 0 12px;font-weight:700;letter-spacing:-.02em; }
  h3 { font-size:1.1rem;margin:0 0 8px;font-weight:700; }
  .section-sub { color: var(--muted); max-width: 680px; margin: 0 0 24px; }
  pre { background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px 18px;overflow-x:auto;font-size:.82rem;color:var(--green);font-family:"SF Mono",Menlo,monospace;line-height:1.5;margin:14px 0; }
  pre .k { color: var(--accent2); } pre .s { color: var(--pink); } pre .c { color: var(--dim); }
  code { font-family: "SF Mono", Menlo, monospace; background: var(--bg2); padding: 1px 6px; border-radius: 4px; font-size: .85em; }
  table { width: 100%; border-collapse: collapse; text-align: left; font-size: .87rem; margin-top: 16px; }
  th, td { padding: 12px 14px; border-bottom: 1px solid var(--border); vertical-align: top; }
  th { background: var(--bg2); font-weight: 700; color: var(--accent2); font-size: .8rem; }
  td strong { color: var(--text); }
  td.ours { background: rgba(124,92,255,0.05); }
  .grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin-top:18px; }
  .card { background:var(--card);border:1px solid var(--border);border-radius:14px;padding:18px 20px; }
  .card.us { border-color:var(--accent);background:linear-gradient(135deg,var(--card),rgba(124,92,255,0.06)); }
  .card h3 { color: var(--text); margin: 0 0 6px; font-size: 1rem; }
  .card .tag { display:inline-block;font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent2);font-weight:700;margin-bottom:8px; }
  .card p { color:var(--muted);font-size:.88rem;margin:0 0 8px;line-height:1.55; }
  details { background:var(--card);border:1px solid var(--border);border-radius:12px;padding:18px 20px;margin-bottom:12px; }
  details summary { font-weight: 700; font-size: 1rem; color: var(--text); cursor: pointer; list-style: none; }
  details[open] summary { margin-bottom: 12px; }
  details .answer { color: var(--muted); font-size: .92rem; line-height: 1.65; }
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
    <a href="/directory">Directory</a>
    <a href="/blog">Blog</a>
  </div>
  <a class="cta" href="/dashboard">Dashboard →</a>
</nav>

<div class="wrap">

<header class="hero">
  <div class="badge"><span class="dot"></span> roundup &middot; oauth + mcp 2026</div>
  <h1>OAuth-enabled MCP providers.</h1>
  <p class="sub">Comparison + setup guide for the major OAuth-gated providers that ship MCP servers (official or community): Google, GitHub, Slack, Stripe, Notion, Linear, Discord. Shape of OAuth flow, scope model, token storage, integration effort — and where wmcp.sh fits as a centralized OAuth proxy.</p>
  <p class="hint">MCP supports OAuth 2.1 (RFC 6749 / 9700) with PKCE and Dynamic Client Registration (RFC 7591). Most providers below implement standard OAuth 2.0 + PKCE.</p>
  <p class="disclaim">All claims are based on each provider's public documentation as of 2026-05-28. Scopes, flows, and token TTLs change frequently — always check the vendor's docs before implementing. We are not affiliated with the providers listed.</p>
</header>

<!-- ========== PROVIDER CARDS ========== -->
<section id="providers">
  <div class="section-label">The lineup</div>
  <h2>Seven providers worth knowing.</h2>
  <div class="grid">
    <div class="card">
      <div class="tag">comms · large scope set</div>
      <h3>Google (Gmail / Calendar / Drive)</h3>
      <p>OAuth 2.0 with PKCE; very fine-grained scopes per Google API surface. MCP servers (community + emerging vendor support) typically run as hosted or local with per-user token storage. Refresh tokens supported.</p>
    </div>
    <div class="card">
      <div class="tag">devops</div>
      <h3>GitHub</h3>
      <p>OAuth 2.0 + GitHub Apps (preferred for scoped fine-grained access). Official MCP server ships with both PAT and OAuth flows; community variants exist. Per-installation scope model is well-suited to agents.</p>
    </div>
    <div class="card">
      <div class="tag">comms</div>
      <h3>Slack</h3>
      <p>OAuth 2.0 with bot tokens + user tokens. Granular scope model (channels:read, chat:write, im:history). Official + community MCP servers available. Workspace-level tokens vs per-user differ in capability.</p>
    </div>
    <div class="card">
      <div class="tag">payments</div>
      <h3>Stripe</h3>
      <p>Stripe Connect uses OAuth for platform-on-merchant access; direct API uses restricted API keys (not OAuth) for first-party use. Official MCP server exists. Match the auth pattern to your agent's role (platform vs merchant).</p>
    </div>
    <div class="card">
      <div class="tag">workspace · large scope</div>
      <h3>Notion</h3>
      <p>OAuth 2.0; per-integration scope is bound to specific pages/databases the user shares with the integration — a useful safety property for agents. Community + emerging vendor MCP servers.</p>
    </div>
    <div class="card">
      <div class="tag">issues · clean flow</div>
      <h3>Linear</h3>
      <p>OAuth 2.0 with PKCE; relatively small, sensible scope set (read/write across issues, projects, cycles). Vendor-published MCP server. Often cited as the cleanest OAuth onboarding among comms-class tools.</p>
    </div>
    <div class="card">
      <div class="tag">comms · bot model</div>
      <h3>Discord</h3>
      <p>OAuth 2.0 for user tokens; separate bot-token model for server-side automation. Community MCP servers in both flavors. Choose based on whether the agent acts as a user or as a bot account.</p>
    </div>
    <div class="card us">
      <div class="tag">meta · oauth proxy</div>
      <h3>wmcp.sh OAuth proxy</h3>
      <p>One endpoint (<code>wmcp.sh/mcp/&lt;provider&gt;</code>) that handles RFC 7591 DCR + PKCE upstream against any of the providers above, so an agent that can connect to one MCP server but can't drive arbitrary OAuth flows still works.</p>
    </div>
  </div>
</section>

<!-- ========== COMPARISON TABLE ========== -->
<section id="compare">
  <div class="section-label">At-a-glance</div>
  <h2>OAuth shape per provider.</h2>
  <table>
    <thead>
      <tr>
        <th>Provider</th>
        <th>Flow</th>
        <th>Scope granularity</th>
        <th>Token storage (typical)</th>
        <th>Integration effort</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Google</strong></td>
        <td>OAuth 2.0 + PKCE</td>
        <td>Very fine</td>
        <td>Per-user, refresh-token</td>
        <td>Moderate (scope review, consent screen)</td>
      </tr>
      <tr>
        <td><strong>GitHub</strong></td>
        <td>OAuth 2.0 / GitHub App</td>
        <td>Fine (Apps even finer)</td>
        <td>Per-user or per-installation</td>
        <td>Low (App model is clean)</td>
      </tr>
      <tr>
        <td><strong>Slack</strong></td>
        <td>OAuth 2.0</td>
        <td>Fine (bot vs user)</td>
        <td>Per-workspace + per-user</td>
        <td>Low–moderate</td>
      </tr>
      <tr>
        <td><strong>Stripe</strong></td>
        <td>Connect OAuth / API keys</td>
        <td>Restricted-key roles</td>
        <td>Per-account</td>
        <td>Low for direct; moderate for Connect</td>
      </tr>
      <tr>
        <td><strong>Notion</strong></td>
        <td>OAuth 2.0</td>
        <td>Page/DB-bound</td>
        <td>Per-integration</td>
        <td>Low</td>
      </tr>
      <tr>
        <td><strong>Linear</strong></td>
        <td>OAuth 2.0 + PKCE</td>
        <td>Small + clean</td>
        <td>Per-user</td>
        <td>Low</td>
      </tr>
      <tr>
        <td><strong>Discord</strong></td>
        <td>OAuth 2.0 / bot tokens</td>
        <td>Moderate</td>
        <td>Per-user / per-bot</td>
        <td>Low (bot) / Moderate (user)</td>
      </tr>
      <tr>
        <td class="ours"><strong>wmcp.sh proxy</strong></td>
        <td class="ours">RFC 7591 DCR + PKCE</td>
        <td class="ours">Passed through</td>
        <td class="ours">Server-side vault</td>
        <td class="ours">Lowest — single endpoint for many upstreams</td>
      </tr>
    </tbody>
  </table>
  <p class="disclaim">Cells reflect typical/default usage per each provider's documentation. Specific scopes, token TTLs, and refresh policies change — check the vendor's docs before implementing.</p>
</section>

<!-- ========== SETUP GUIDE ========== -->
<section id="setup">
  <div class="section-label">Setup</div>
  <h2>The five-step pattern.</h2>
  <p class="section-sub">Almost every OAuth-MCP integration follows the same shape. Use this as your template.</p>
  <pre><code><span class="c"># 1. Register your client with the provider (or use RFC 7591 DCR)</span>
<span class="c">#    → get client_id / client_secret OR rely on dynamic registration.</span>

<span class="c"># 2. Decide token storage:</span>
<span class="c">#    a) Local (Claude Desktop / Cursor stores per-user)</span>
<span class="c">#    b) Server-side vault (Composio / Arcade / wmcp.sh proxy)</span>
<span class="c">#    c) Per-call short-lived (your backend mints)</span>

<span class="c"># 3. Run the OAuth flow with PKCE:</span>
<span class="c">#    GET /authorize → user consents → callback → exchange code for token.</span>

<span class="c"># 4. Connect the MCP client to the provider's MCP endpoint:</span>
<span class="k">curl</span> -H <span class="s">"Authorization: Bearer $TOKEN"</span> <span class="s">'https://&lt;provider&gt;/mcp'</span>

<span class="c"># 5. Or — let wmcp.sh handle steps 1-3:</span>
<span class="k">curl</span> <span class="s">'${origin}/mcp/&lt;provider&gt;'</span>
<span class="c">#    wmcp.sh runs DCR + PKCE upstream and injects bearer on every tool call.</span></code></pre>
</section>

<!-- ========== WMCP OAUTH PROXY ========== -->
<section id="wmcp-proxy">
  <div class="section-label">wmcp.sh OAuth proxy</div>
  <h2>One endpoint, many upstreams.</h2>
  <p class="section-sub">The shape: an agent (Claude.ai connector, Cursor remote MCP, web agent) connects once to <code>wmcp.sh/mcp/&lt;provider&gt;</code> using standard OAuth 2.1 + PKCE + Dynamic Client Registration. wmcp.sh handles the dance with the upstream provider, stores the refresh token server-side, and forwards every tool call with the right bearer. The agent doesn't have to know provider-specific OAuth shapes.</p>
  <div class="grid">
    <div class="card us">
      <div class="tag">why it helps</div>
      <h3>For agents that can't drive arbitrary OAuth</h3>
      <p>Claude.ai connectors and other hosted clients can only connect to one MCP server at a time — they can't run the OAuth dance against twelve different providers. wmcp.sh consolidates.</p>
    </div>
    <div class="card us">
      <div class="tag">why it helps</div>
      <h3>For dev teams that want one vault</h3>
      <p>Instead of building per-provider token storage in your app, use wmcp.sh's vault. Tokens never touch your servers; calls go agent → wmcp.sh → upstream.</p>
    </div>
  </div>
</section>

<!-- ========== FAQ ========== -->
<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions.</h2>
  <details><summary>Why does OAuth matter for MCP?</summary><div class="answer">Most useful tool surfaces are gated by OAuth. The MCP spec supports OAuth 2.1 with PKCE and Dynamic Client Registration, so clients and servers negotiate auth without bespoke flows per provider.</div></details>
  <details><summary>Owner-side vs shopper-side OAuth?</summary><div class="answer">Owner-side: end user authorizes their own SaaS. Shopper-side: agent acts on a public surface the user doesn't own. Owner-side needs OAuth per user; shopper-side often doesn't.</div></details>
  <details><summary>Where do tokens live?</summary><div class="answer">Local (client device), managed vault (server-side proxy), or per-call (short-lived). Each has tradeoffs. wmcp.sh implements the managed-vault pattern.</div></details>
  <details><summary>How does wmcp.sh's OAuth proxy work?</summary><div class="answer">Agent connects to wmcp.sh/mcp/&lt;provider&gt; via DCR + PKCE. wmcp.sh runs the upstream OAuth flow, stores refresh tokens, injects bearers on every call. Agent doesn't see provider-specific OAuth.</div></details>
  <details><summary>Which providers have official MCP with OAuth?</summary><div class="answer">A growing list — Linear, GitHub, Slack, and several others with vendor-published servers, plus community MCP for Google, Notion, Discord, Stripe, etc. Check each vendor's docs and /directory.</div></details>
</section>

<!-- ========== UPGRADE CTA ========== -->
<section id="upgrade" style="margin-top:36px;background:linear-gradient(135deg,var(--card),rgba(124,92,255,0.08));border:1px solid rgba(124,92,255,0.35);border-radius:16px;padding:22px 26px">
  <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;justify-content:space-between">
    <div style="flex:1;min-width:240px">
      <div style="font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent2);font-weight:700;margin-bottom:6px">Need this picked / built for you?</div>
      <h3 style="margin:0 0 4px;font-size:1.05rem;color:var(--text)">We'll set up your OAuth-MCP stack.</h3>
      <p style="color:var(--muted);margin:0;font-size:.92rem">Provider OAuth registration + token vault + MCP at <code>mcp.yourbrand.com</code> + verified badge. From <strong style="color:var(--text)">$499 one-time setup</strong>; Pro retainer <strong style="color:var(--text)">$999/mo</strong>; Enterprise <strong style="color:var(--text)">$4,999+/mo</strong>.</p>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <a href="/managed" style="display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#7c5cff,#00e5ff);color:#0c0c14;padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:700;font-size:.9rem">See /managed →</a>
      <a href="/directory/submit" style="display:inline-flex;align-items:center;gap:6px;background:#11111c;border:1px solid #26263a;color:var(--text);padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:600;font-size:.9rem">Submit (free)</a>
    </div>
  </div>
</section>

<!-- ========== RELATED ========== -->
<section id="related">
  <div class="section-label">Related</div>
  <h2>More on the MCP stack.</h2>
  <p class="section-sub">
    <a href="/roundup/mcp-servers-2026" style="color:var(--accent2);text-decoration:none">/roundup/mcp-servers-2026</a> &middot;
    <a href="/roundup/agent-frameworks" style="color:var(--accent2);text-decoration:none">/roundup/agent-frameworks</a> &middot;
    <a href="/vs/composio" style="color:var(--accent2);text-decoration:none">/vs/composio</a> &middot;
    <a href="/vs/arcade-ai" style="color:var(--accent2);text-decoration:none">/vs/arcade-ai</a> &middot;
    <a href="/integration/google" style="color:var(--accent2);text-decoration:none">/integration/google</a> &middot;
    <a href="/integration/github" style="color:var(--accent2);text-decoration:none">/integration/github</a> &middot;
    <a href="/integration/slack" style="color:var(--accent2);text-decoration:none">/integration/slack</a> &middot;
    <a href="/integration/linear" style="color:var(--accent2);text-decoration:none">/integration/linear</a>
  </p>
</section>

</div>

<footer>
  <a href="/">Home</a> · <a href="/agent-ready">Agent-ready</a> · <a href="/managed">Done for you</a> · <a href="/directory">Directory</a> · <a href="/directory/submit">Submit</a> · <a href="/blog">Blog</a> · <a href="/roundup/mcp-servers-2026">MCP servers roundup</a> · <a href="/roundup/agent-frameworks">Frameworks roundup</a>
</footer>

</body>
</html>`;
}
