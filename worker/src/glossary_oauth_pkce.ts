export function glossaryOauthPkceHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>OAuth 2.1 PKCE Flow: Definition & Glossary | wmcp.sh</title>
<meta name="description" content="Define OAuth 2.1 PKCE flow. Cover code_verifier, code_challenge, and why PKCE is crucial for SPAs and interactive agent OAuth flows." />
<link rel="canonical" href="${origin}/glossary/oauth-pkce" />
<meta property="og:title" content="OAuth 2.1 PKCE Flow: Definition & Glossary | wmcp.sh" />
<meta property="og:description" content="Define OAuth 2.1 PKCE flow. Cover code_verifier, code_challenge, and why PKCE is crucial for SPAs and interactive agent OAuth flows." />
<meta property="og:url" content="${origin}/glossary/oauth-pkce" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="OAuth 2.1 PKCE Flow: Definition & Glossary | wmcp.sh" />
<meta name="twitter:description" content="Define OAuth 2.1 PKCE flow. Cover code_verifier, code_challenge, and why PKCE is crucial for SPAs and interactive agent OAuth flows." />
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article","headline":"OAuth 2.1 PKCE Flow: Definition & Glossary | wmcp.sh","description":"Define OAuth 2.1 PKCE flow. Cover code_verifier, code_challenge, and why PKCE is crucial for SPAs and interactive agent OAuth flows.","author":{"@type":"Organization","name":"WebMCP Anything"},"publisher":{"@type":"Organization","name":"WebMCP Anything","url":"https://wmcp.sh"},"datePublished":"2026-05-28","dateModified":"2026-05-28","mainEntityOfPage":"${origin}/glossary/oauth-pkce"}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
  {"@type":"Question","name":"What is OAuth PKCE?","acceptedAnswer":{"@type":"Answer","text":"PKCE (Proof Key for Code Exchange) is an extension to the OAuth 2.0 authorization code flow. It prevents authorization code interception attacks by requiring the client to create a secret code_verifier and send a hashed code_challenge."}},
  {"@type":"Question","name":"When should I use PKCE versus a static vault?","acceptedAnswer":{"@type":"Answer","text":"Use an OAuth 2.1 PKCE proxy for actual interactive user-driven flows (like connecting Google, GitHub, Slack, Notion, or Linear). For static keys like Discord bot tokens or API keys, always use an encrypted credentials vault instead."}},
  {"@type":"Question","name":"Why is PKCE required for SPAs?","acceptedAnswer":{"@type":"Answer","text":"Single Page Applications (SPAs) cannot securely store a client_secret because all code is exposed to the browser. PKCE replaces the need for a static client_secret with a dynamic, per-request cryptographic challenge."}},
  {"@type":"Question","name":"Does wmcp.sh support PKCE?","acceptedAnswer":{"@type":"Answer","text":"Yes, wmcp.sh acts as an OAuth 2.1 PKCE proxy for interactive flows, handling the code exchange at the edge to ensure sub-100ms latency while keeping the final tokens secure."}}
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
  <a class="cta" href="/dashboard">Dashboard &rarr;</a>
</nav>

<div class="wrap">

<header class="hero">
  <div class="badge"><span class="dot"></span> GLOSSARY &middot; /GLOSSARY/OAUTH-PKCE</div>
  <h1>OAuth 2.1 PKCE Flow</h1>
  <p class="sub">When building AI agents that act on a user's behalf, you must grant them secure access to third-party accounts. For interactive integrations, the OAuth 2.1 PKCE flow guarantees that authorization codes cannot be intercepted, keeping user data secure. wmcp.sh handles the complexity of this handshake at the edge.</p>
</header>

<section id="wedge">
  <div class="section-label">the gap</div>
  <h2>Why static keys aren't enough for interactive applications</h2>
  <p class="section-sub">Many developers mistakenly use static tokens for everything. However, a strict distinction must be drawn: for static, backend-only credentials (like a Discord bot token for Acme Corp), you should always use an encrypted credentials vault. But for user-facing, interactive OAuth flows—such as prompting a user to sign in via Google, GitHub, Slack, Notion, or Linear—you must utilize an OAuth 2.1 PKCE proxy.</p>
  <p class="section-sub">PKCE (Proof Key for Code Exchange) solves a specific vulnerability where malicious apps running on the same device intercept the authorization code. By generating a dynamic <code>code_verifier</code> and its hashed <code>code_challenge</code>, PKCE ensures that only the application that initiated the request can exchange the code for an access token. <em>(Note: wmcp.sh is not affiliated with Google, GitHub, Slack, Notion, Linear, Discord, or any other mentioned organizations.)</em></p>
</section>

<section id="how">
  <div class="section-label">the architecture</div>
  <h2>Executing the PKCE challenge</h2>
  <pre><code><span class="c">// 1. Generate a secure random string (code_verifier)</span>
<span class="k">const</span> verifier <span class="k">=</span> generateRandomString(<span class="s">43</span>);

<span class="c">// 2. Hash it with SHA-256 (code_challenge)</span>
<span class="k">const</span> challenge <span class="k">=</span> base64UrlEncode(sha256(verifier));

<span class="c">// 3. Direct user to the authorization URL (e.g., Slack or Notion)</span>
<span class="k">const</span> authUrl <span class="k">=</span> <span class="s">"https://provider.example.com/auth"</span> <span class="k">+</span>
  <span class="s">"?client_id=YOUR_CLIENT_ID"</span> <span class="k">+</span>
  <span class="s">"&response_type=code"</span> <span class="k">+</span>
  <span class="s">"&code_challenge="</span> <span class="k">+</span> challenge <span class="k">+</span>
  <span class="s">"&code_challenge_method=S256"</span>;

<span class="c">// 4. Once the code is returned, wmcp.sh proxies the token exchange</span>
<span class="c">// passing the original verifier to prove identity, ensuring sub-100ms validation.</span></code></pre>
</section>

<section id="capabilities">
  <div class="section-label">capability</div>
  <h2>Securing Agent Auth with wmcp.sh</h2>
  <table>
    <thead><tr><th>Capability</th><th>Standard Implementation</th><th>With wmcp.sh Proxy</th></tr></thead>
    <tbody>
      <tr><td><strong>Interactive OAuth Auth</strong></td><td>⚠️ Vulnerable if client_secret is exposed in SPA.</td><td class="ours">✅ True OAuth 2.1 PKCE proxy flow.</td></tr>
      <tr><td><strong>Static Key Security</strong></td><td>❌ Using PKCE incorrectly for bot tokens.</td><td class="ours">✅ Encrypted credentials vault for static keys.</td></tr>
      <tr><td><strong>Token Refresh Latency</strong></td><td>⚠️ 500ms+ roundtrips to central auth servers.</td><td class="ours">✅ Sub-100ms edge token refresh.</td></tr>
      <tr><td><strong>Context Caching</strong></td><td>❌ No caching of auth-gated schemas.</td><td class="ours">✅ Secure short TTL (~1s) schema caching.</td></tr>
    </tbody>
  </table>
</section>

<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions.</h2>
  <details><summary>Should I use PKCE for my Discord bot?</summary><p class="answer">No. Discord bot tokens are static server-to-server credentials. You should store those in an encrypted credentials vault. PKCE is designed exclusively for interactive OAuth flows where a user explicitly grants permission via a browser.</p></details>
  <details><summary>What is S256?</summary><p class="answer">S256 refers to the SHA-256 hashing algorithm. In the PKCE flow, the code_challenge is typically the SHA-256 hash of the code_verifier, Base64Url encoded. The auth server performs this same hash during the token exchange to verify identity.</p></details>
  <details><summary>Does this slow down agent execution?</summary><p class="answer">The initial auth flow happens once. Subsequent API calls use the access token. With wmcp.sh deployed at the edge, token validation and refresh cycles maintain sub-100ms latency, ensuring agent reasoning is never bottlenecked by auth.</p></details>
</section>

<section id="upgrade" style="margin-top:36px;background:linear-gradient(135deg,var(--card),rgba(124,92,255,0.08));border:1px solid rgba(124,92,255,0.35);border-radius:16px;padding:22px 26px">
  <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;justify-content:space-between">
    <div style="flex:1;min-width:240px">
      <div style="font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent2);font-weight:700;margin-bottom:6px">Need this done for you?</div>
      <h3 style="margin:0 0 4px;font-size:1.05rem;color:var(--text)">Skip the wiring — we build, deploy, and monitor.</h3>
      <p style="color:var(--muted);margin:0;font-size:.92rem">Custom adapter + hosted MCP at <code>mcp.yourbrand.com</code> + verified badge. Pricing: <strong style="color:var(--text)">Starter $499 one-time</strong>, <strong>Pro $999/mo</strong>, or <strong>Enterprise $4,999+/mo</strong>.</p>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <a href="/managed" style="display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#7c5cff,#00e5ff);color:#0c0c14;padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:700;font-size:.9rem">See /managed &rarr;</a>
      <a href="/directory/submit" style="display:inline-flex;align-items:center;gap:6px;background:#11111c;border:1px solid #26263a;color:var(--text);padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:600;font-size:.9rem">Submit (free)</a>
    </div>
  </div>
</section>

</div>

<footer>
  <a href="/">Home</a> &middot; <a href="/agent-ready">Agent-ready</a> &middot; <a href="/managed">Done for you</a> &middot; <a href="/blog">Blog</a> &middot; <a href="/directory">Directory</a> &middot; <a href="/directory/submit">Submit</a> &middot; <a href="/glossary/mcp">MCP</a> &middot; <a href="/glossary/json-ld">JSON-LD</a> &middot; <a href="https://github.com/New1Direction/webmcp-anything">GitHub</a>
</footer>
</body>
</html>`;
}
