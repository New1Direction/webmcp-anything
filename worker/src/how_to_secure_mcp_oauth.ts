export function howToSecureMcpOauthHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>How to Secure MCP OAuth Connections - wmcp.sh</title>
<meta name="description" content="Learn how to properly secure your Model Context Protocol (MCP) integrations using OAuth 2.1 PKCE for interactive flows and encrypted credential vaults for static keys." />
<link rel="canonical" href="\${origin}/how-to/secure-mcp-oauth" />
<meta property="og:title" content="How to Secure MCP OAuth Connections" />
<meta property="og:description" content="Learn how to properly secure your Model Context Protocol (MCP) integrations using OAuth 2.1 PKCE for interactive flows and encrypted credential vaults for static keys." />
<meta property="og:url" content="\${origin}/how-to/secure-mcp-oauth" />
<meta property="og:image" content="\${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="How to Secure MCP OAuth Connections" />
<meta name="twitter:description" content="Learn how to properly secure your Model Context Protocol (MCP) integrations using OAuth 2.1 PKCE for interactive flows and encrypted credential vaults for static keys." />
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article","headline":"How to Secure MCP OAuth Connections","description":"Learn how to properly secure your Model Context Protocol (MCP) integrations using OAuth 2.1 PKCE for interactive flows and encrypted credential vaults for static keys.","author":{"@type":"Organization","name":"WebMCP Anything"},"publisher":{"@type":"Organization","name":"WebMCP Anything","url":"https://wmcp.sh"},"datePublished":"2026-05-28","dateModified":"2026-05-28","mainEntityOfPage":"\${origin}/how-to/secure-mcp-oauth"}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
  {"@type":"Question","name":"When should I use OAuth 2.1 PKCE for MCP?","acceptedAnswer":{"@type":"Answer","text":"Use OAuth 2.1 PKCE for any interactive authentication flow where a human user needs to log into a third-party platform (like Google, GitHub, Slack, Notion, or Linear) and grant scoped access to an AI agent."}},
  {"@type":"Question","name":"How should I store static API keys or bot tokens?","acceptedAnswer":{"@type":"Answer","text":"Static credentials, such as bot tokens or server-to-server API keys, should never be stored in plain text or passed via URL parameters. They must be secured in an encrypted credentials vault."}},
  {"@type":"Question","name":"Does wmcp.sh handle token rotation?","acceptedAnswer":{"@type":"Answer","text":"Yes, the platform securely manages token exchange, caching (with short TTLs), and rotation automatically."}},
  {"@type":"Question","name":"Is wmcp.sh affiliated with the platforms it connects to?","acceptedAnswer":{"@type":"Answer","text":"No. wmcp.sh is an independent gateway and is not affiliated with Google, GitHub, Slack, Notion, Linear, Anthropic, OpenAI, or Microsoft."}}
]}
</script>
<style>
  :root { --bg:#07070d;--card:#16161f;--bg2:#11111c;--border:#26263a;--text:#ececf5;--muted:#8a8aa8;--dim:#6a6a88;--accent:#7c5cff;--accent2:#00e5ff;--green:#4ade80;--red:#f87171;--pink:#f0abfc;--gold:#fbbf24; }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin:0;min-height:100vh;color:var(--text);background:var(--bg);font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif;line-height:1.6;background-image:radial-gradient(ellipse 900px 600px at 10% -5%,rgba(124,92,255,.18),transparent 60%),radial-gradient(ellipse 700px 500px at 95% 10%,rgba(0,229,255,.10),transparent 60%); }
  .wrap { max-width: 920px; margin: 0 auto; padding: 0 24px; }
  nav { display:flex;justify-content:space-between;align-items:center;padding:22px 24px;max-width:1080px;margin:0 auto; }
  nav .brand { font-weight: 800; letter-spacing: -.02em; font-size: 1.05rem; }
  nav .brand a { color: inherit; text-decoration: none; }
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
  footer { border-top:1px solid var(--border);margin-top:40px;padding:30px 0;text-align:center;color:var(--muted);font-size:.85rem; }
  footer a { color: var(--accent2); text-decoration: none; margin: 0 8px; }
</style>
</head>
<body>
<nav>
  <div class="brand"><a href="/">wmcp<span>.sh</span></a></div>
  <div class="links">
    <a href="/agent-ready">Agent-ready</a>
    <a href="/managed">Done for you</a>
    <a href="/price-data">Price data</a>
    <a href="/blog">Blog</a>
    <a href="/directory">Directory</a>
  </div>
  <a class="cta" href="/dashboard">Dashboard →</a>
</nav>

<div class="wrap">
<header class="hero">
  <div class="badge"><span class="dot"></span> HOW-TO &middot; SECURE-MCP-OAUTH</div>
  <h1>How to Secure MCP OAuth</h1>
  <p class="sub">Exposing tools to LLMs requires strict authentication models to prevent unauthorized execution. Learn how to secure your MCP gateway using OAuth 2.1 PKCE and encrypted credential vaults with wmcp.sh.</p>
</header>

<section id="wedge">
  <div class="section-label">the gap</div>
  <h2>Why naive API key storage fails</h2>
  <p class="section-sub">Passing raw access tokens or client secrets through URL parameters or plain-text headers leaves your agents vulnerable. Hardcoded tokens risk exposure in logs, while failing to distinguish between interactive user authentication (OAuth) and server-to-server static keys (bot tokens) leads to broken authorization models. Proper security requires different strategies for different token lifecycles.</p>
  <p class="section-sub" style="font-size:0.8rem"><em>Disclaimer: wmcp.sh is an independent infrastructure provider and is not affiliated with Slack, GitHub, Google, Notion, Linear, Anthropic, or OpenAI.</em></p>
</section>

<section id="how">
  <div class="section-label">the architecture</div>
  <h2>Implementing OAuth 2.1 PKCE and Vaults</h2>
  <pre><code><span class="c"># Example: Securing a connection with wmcp.sh in TypeScript</span>
<span class="k">import</span> { McpGateway } <span class="k">from</span> <span class="s">'@wmcp/sdk'</span>;

<span class="c">// For interactive human login flows (e.g., Google, Slack, Notion)</span>
<span class="k">const</span> gateway = <span class="k">new</span> McpGateway({
  authMode: <span class="s">'oauth2.1-pkce'</span>,
  clientId: process.env.OAUTH_CLIENT_ID,
  <span class="c">// Short TTL cache (~1s) for high-frequency tool calls</span>
  cacheTtl: <span class="s">'1s'</span>,
});

<span class="c">// For static server-to-server keys (e.g., Bot tokens)</span>
<span class="k">await</span> gateway.storeInVault({
  provider: <span class="s">'stripe'</span>,
  key: process.env.STRIPE_SECRET_KEY,
  vaultType: <span class="s">'encrypted-credentials-proxy'</span>
});

console.log(<span class="s">'Secure connection established.'</span>);
</code></pre>
</section>

<section id="capabilities">
  <div class="section-label">capability</div>
  <h2>Security Models Compared</h2>
  <table>
    <thead><tr><th>Capability</th><th>Without wmcp.sh</th><th>With wmcp.sh</th></tr></thead>
    <tbody>
      <tr><td><strong>OAuth 2.1 PKCE support</strong></td><td>⚠️ Requires manual state/PKCE verification logic</td><td class="ours">✅ Native PKCE for interactive flows</td></tr>
      <tr><td><strong>Encrypted Credentials Vault</strong></td><td>❌ Keys stored in plain text or app config</td><td class="ours">✅ KMS-encrypted out-of-band proxy</td></tr>
      <tr><td><strong>Short TTL Caching (~1s)</strong></td><td>⚠️ Often caches too long, risking stale token use</td><td class="ours">✅ Configurable sub-second invalidation</td></tr>
      <tr><td><strong>Sub-100ms Latency</strong></td><td>❌ Gateway proxying adds significant overhead</td><td class="ours">✅ Optimized edge routing for sub-100ms latency</td></tr>
    </tbody>
  </table>
</section>

<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions.</h2>
  <details><summary>When should I use OAuth 2.1 PKCE for MCP?</summary><p class="answer">Use OAuth 2.1 PKCE for any interactive authentication flow where a human user needs to log into a third-party platform (like Google, GitHub, Slack, Notion, or Linear) and grant scoped access to an AI agent.</p></details>
  <details><summary>How should I store static API keys or bot tokens?</summary><p class="answer">Static credentials, such as bot tokens or server-to-server API keys, should never be stored in plain text or passed via URL parameters. They must be secured in an encrypted credentials vault acting as an out-of-band proxy.</p></details>
  <details><summary>Does wmcp.sh handle token rotation?</summary><p class="answer">Yes, the platform securely manages token exchange, caching (with short TTLs), and rotation automatically without exposing secrets to the runtime agent.</p></details>
  <details><summary>Is wmcp.sh affiliated with the platforms it connects to?</summary><p class="answer">No. wmcp.sh is an independent gateway and is not affiliated with Google, GitHub, Slack, Notion, Linear, Anthropic, OpenAI, or Microsoft.</p></details>
</section>

<section id="upgrade" style="margin-top:36px;background:linear-gradient(135deg,var(--card),rgba(124,92,255,0.08));border:1px solid rgba(124,92,255,0.35);border-radius:16px;padding:22px 26px">
  <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;justify-content:space-between">
    <div style="flex:1;min-width:240px">
      <div style="font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent2);font-weight:700;margin-bottom:6px">Need this done for you?</div>
      <h3 style="margin:0 0 4px;font-size:1.05rem;color:var(--text)">Skip the wiring — we build, deploy, and monitor.</h3>
      <p style="color:var(--muted);margin:0;font-size:.92rem">Custom adapter + hosted MCP at <code>mcp.yourbrand.com</code> + verified badge. From <strong style="color:var(--text)">$499 one-time setup</strong>. (Managed Retainer: $999/mo, Enterprise: $4,999+/mo)</p>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <a href="/managed" style="display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#7c5cff,#00e5ff);color:#0c0c14;padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:700;font-size:.9rem">See /managed →</a>
      <a href="/directory/submit" style="display:inline-flex;align-items:center;gap:6px;background:#11111c;border:1px solid #26263a;color:var(--text);padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:600;font-size:.9rem">Submit (free)</a>
    </div>
  </div>
</section>

</div>

<footer>
  <a href="/">Home</a> · <a href="/agent-ready">Agent-ready</a> · <a href="/managed">Done for you</a> · <a href="/blog">Blog</a> · <a href="/directory">Directory</a> · <a href="/directory/submit">Submit</a> · <a href="/how-to/debug-mcp-tool-calls">Debug Tool Calls</a> · <a href="/how-to/deploy-mcp-on-cloudflare-workers">Deploy on Cloudflare</a> · <a href="https://github.com/New1Direction/webmcp-anything">GitHub</a>
</footer>
</body>
</html>`;
}
