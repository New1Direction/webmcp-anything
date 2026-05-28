// /vs/mcp-toolkit — head-to-head with Docker MCP Toolkit.
// SERP target family: "docker mcp toolkit alternative", "docker mcp",
// "mcp toolkit vs hosted", "local mcp servers vs cloud". Docker shipped
// the MCP Toolkit as a local catalog of containerized MCP servers
// inside Docker Desktop — different shape from a hosted edge gateway.
//
// wmcp.sh is not affiliated with Docker, Inc.

export function vsMcpToolkitHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>wmcp.sh vs Docker MCP Toolkit — hosted edge vs local container catalog | wmcp.sh</title>
<meta name="description" content="Docker MCP Toolkit ships MCP servers as containers inside Docker Desktop. wmcp.sh is hosted edge. Different shapes — local privacy/dev ergonomics vs multi-tenant cold-start. Honest comparison." />
<link rel="canonical" href="${origin}/vs/mcp-toolkit" />
<meta property="og:title" content="wmcp.sh vs Docker MCP Toolkit — hosted edge vs local containers" />
<meta property="og:description" content="Docker MCP Toolkit runs MCP servers in local containers. wmcp.sh runs them on global edge. When each wins." />
<meta property="og:url" content="${origin}/vs/mcp-toolkit" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="wmcp.sh vs Docker MCP Toolkit" />
<meta name="twitter:description" content="Local container catalog vs hosted edge gateway. Honest head-to-head." />
<meta name="twitter:image" content="${origin}/og.png" />
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "wmcp.sh vs Docker MCP Toolkit — hosted edge vs local containers",
  "description": "Side-by-side comparison: local containerized MCP servers (Docker MCP Toolkit) and hosted edge MCP gateway (wmcp.sh).",
  "author": { "@type": "Organization", "name": "WebMCP Anything" },
  "publisher": { "@type": "Organization", "name": "WebMCP Anything", "url": "https://wmcp.sh" },
  "datePublished": "2026-05-28",
  "dateModified": "2026-05-28",
  "mainEntityOfPage": "${origin}/vs/mcp-toolkit"
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What's the difference between Docker MCP Toolkit and wmcp.sh?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Docker MCP Toolkit is a feature of Docker Desktop that runs MCP servers as local containers on the developer's machine — a curated catalog you pull and run locally, isolated by Docker's sandbox. wmcp.sh is a hosted multi-tenant gateway that exposes MCP tools over an HTTPS endpoint on Cloudflare's edge. Docker MCP Toolkit favors local dev ergonomics and privacy; wmcp.sh favors discoverability, multi-tenant agents, and cold-start-free always-on access."
      }
    },
    {
      "@type": "Question",
      "name": "When should I pick Docker MCP Toolkit?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Pick Docker MCP Toolkit when (1) you're a developer using Docker Desktop and want to try MCP servers locally with one click, (2) privacy matters and the server should never see the public internet, (3) you want container-level isolation and signature verification on each MCP server image, (4) you're prototyping inside Claude Desktop / Cursor and want zero-config local servers."
      }
    },
    {
      "@type": "Question",
      "name": "When should I pick wmcp.sh?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Pick wmcp.sh when (1) you need MCP tools to be reachable from a hosted agent that doesn't have a local container runtime (Claude.ai, Cursor remote MCP, web-based agents), (2) you want multi-tenant access without each user installing Docker, (3) you want OpenAPI ingest of arbitrary specs, shopper-side adapters, or oracle/price-data, (4) you want zero cold-start (Cloudflare Workers spin up in milliseconds), (5) you need an OAuth-proxy MCP server for upstream OAuth-gated providers."
      }
    },
    {
      "@type": "Question",
      "name": "Can I use both?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, and many developers do. Use Docker MCP Toolkit for local-only servers (filesystem access, local databases, anything that shouldn't leave the laptop). Use wmcp.sh for hosted reach — partner OpenAPI specs, shopper-side adapters, OAuth-proxy MCP servers. They cover different surfaces of the same MCP ecosystem."
      }
    },
    {
      "@type": "Question",
      "name": "Is Docker MCP Toolkit free? Is wmcp.sh free?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Docker MCP Toolkit ships inside Docker Desktop — Docker Desktop's licensing applies (free for personal / small-business; paid for larger orgs per Docker's terms). wmcp.sh has a free anonymous tier (100 reads/day, no signup); managed setup starts at $499 one-time. See each vendor's site for current licensing details."
      }
    },
    {
      "@type": "Question",
      "name": "What about cold-start latency?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Local Docker containers have first-start time (pull image + start container) but warm calls are fast. wmcp.sh runs on Cloudflare Workers, which spin up in milliseconds at the edge nearest the user, with no container pulls. For agents that make sporadic tool calls from anywhere on the internet, edge-hosted is typically lower-latency end-to-end."
      }
    },
    {
      "@type": "Question",
      "name": "Is wmcp.sh affiliated with Docker?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. wmcp.sh is an independent project and is not affiliated with, endorsed by, or sponsored by Docker, Inc."
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
  .disclaim { color: var(--dim); font-size: .75rem; margin-top: 14px; font-style: italic; }
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
  .wins-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 18px; }
  @media (max-width: 720px) { .wins-grid { grid-template-columns: 1fr; } }
  .wins-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 22px; }
  .wins-card.us { border-color: var(--accent); background: linear-gradient(135deg, var(--card), rgba(124,92,255,0.06)); }
  .wins-card h3 { color: var(--text); margin-bottom: 12px; }
  .wins-card.us h3 { color: var(--accent2); }
  .wins-card ul { color: var(--muted); padding-left: 20px; margin: 0; font-size: .92rem; line-height: 1.7; }
  .wins-card li { margin-bottom: 6px; }
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
  <div class="badge"><span class="dot"></span> competitor &middot; docker mcp toolkit</div>
  <h1>wmcp.sh vs Docker MCP Toolkit.</h1>
  <p class="sub">Docker shipped the MCP Toolkit as a local catalog of <strong>containerized</strong> MCP servers inside Docker Desktop. wmcp.sh runs MCP tools on <strong>Cloudflare's global edge</strong>. Different shapes — local privacy & dev ergonomics vs. multi-tenant always-on. Here's when each fits.</p>
  <p class="hint">Most developers will use both eventually: Docker MCP Toolkit for local-only servers, wmcp.sh for hosted reach.</p>
  <p class="disclaim">wmcp.sh is not affiliated with, endorsed by, or sponsored by Docker, Inc. All claims about Docker MCP Toolkit are based on Docker's public documentation and subject to change.</p>
</header>

<!-- ========== THE WEDGE ========== -->
<section id="wedge">
  <div class="section-label">The shape difference</div>
  <h2>One sentence each.</h2>
  <div class="wins-grid">
    <div class="wins-card">
      <h3>Docker MCP Toolkit</h3>
      <p style="color:var(--muted);margin:0 0 12px;font-size:.95rem;line-height:1.65">A Docker Desktop feature that ships a curated catalog of MCP servers packaged as <strong>local containers</strong>. Pull, run, and connect from Claude Desktop / Cursor on your machine. Container-level isolation, image signing, never leaves your laptop.</p>
    </div>
    <div class="wins-card us">
      <h3>wmcp.sh</h3>
      <p style="color:var(--muted);margin:0 0 12px;font-size:.95rem;line-height:1.65">A hosted MCP gateway on Cloudflare Workers. Any agent on the public internet can call wmcp.sh's tools over HTTPS without installing anything. OpenAPI ingest, shopper-side adapters, OAuth-proxy MCP, oracle/price-data.</p>
    </div>
  </div>
</section>

<!-- ========== CAPABILITY TABLE ========== -->
<section id="capabilities">
  <div class="section-label">Side-by-side</div>
  <h2>The capability matrix.</h2>
  <table>
    <thead>
      <tr><th>Capability</th><th>Docker MCP Toolkit</th><th>wmcp.sh</th></tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Runtime location</strong></td>
        <td>Local containers on developer's machine</td>
        <td class="ours">Cloudflare Workers edge — 300+ POPs</td>
      </tr>
      <tr>
        <td><strong>Requires Docker Desktop</strong></td>
        <td>Yes</td>
        <td class="ours">No — anything that speaks HTTPS can call</td>
      </tr>
      <tr>
        <td><strong>Cold-start</strong></td>
        <td>Container start time (after first pull)</td>
        <td class="ours">Millisecond Workers warm-up; no image pulls</td>
      </tr>
      <tr>
        <td><strong>Privacy</strong><br /><small style="color:var(--dim)">does the server see public traffic?</small></td>
        <td>✅ Local — never touches internet</td>
        <td class="ours">Hosted — traffic crosses Cloudflare edge</td>
      </tr>
      <tr>
        <td><strong>Image signing / supply chain</strong></td>
        <td>✅ Docker signs catalog images</td>
        <td class="ours">Source code public (MIT); deployed worker is wmcp.sh's responsibility</td>
      </tr>
      <tr>
        <td><strong>Multi-tenant agent access</strong><br /><small style="color:var(--dim)">non-local clients (Claude.ai web)</small></td>
        <td>❌ Local-only by design</td>
        <td class="ours">✅ Any client over HTTPS, including hosted agents</td>
      </tr>
      <tr>
        <td><strong>OpenAPI spec ingest</strong></td>
        <td>Some servers, varies per image</td>
        <td class="ours">✅ Any OpenAPI 3 spec → MCP tools automatically</td>
      </tr>
      <tr>
        <td><strong>Shopper-side adapters</strong><br /><small style="color:var(--dim)">e.g. any Shopify storefront</small></td>
        <td>Out of scope</td>
        <td class="ours">✅ Shopify adapter on ~4M+ stores</td>
      </tr>
      <tr>
        <td><strong>OAuth-proxy MCP server</strong></td>
        <td>Per-image; varies</td>
        <td class="ours">✅ <code>wmcp.sh/mcp/&lt;provider&gt;</code> — RFC 7591 / PKCE</td>
      </tr>
      <tr>
        <td><strong>Price-data / oracle adapters</strong></td>
        <td>Some images available; varies</td>
        <td class="ours">✅ Native: CoinGecko + DefiLlama + Pyth + Chainlink + DexScreener</td>
      </tr>
      <tr>
        <td><strong>Pricing</strong></td>
        <td>Docker Desktop license applies (see Docker site)</td>
        <td class="ours">100 reads/day free anonymous; managed from $499 one-time</td>
      </tr>
    </tbody>
  </table>
  <p class="disclaim">Feature and pricing details for Docker MCP Toolkit are based on Docker's public documentation and subject to change. See docs.docker.com for canonical info.</p>
</section>

<!-- ========== WINS PER SIDE ========== -->
<section id="wins">
  <div class="section-label">When they win — honestly</div>
  <h2>Docker MCP Toolkit is the right pick for a real set of jobs.</h2>
  <div class="wins-grid">
    <div class="wins-card">
      <h3>Docker MCP Toolkit wins when:</h3>
      <ul>
        <li>You're a developer using Docker Desktop already and want one-click local MCP servers</li>
        <li>The server should never touch the public internet (filesystem access, local database, secrets)</li>
        <li>You want container-level isolation and Docker's image-signing supply chain</li>
        <li>You're prototyping with Claude Desktop / Cursor and want zero-config local-only tools</li>
        <li>Latency from a local container is acceptable and privacy outweighs reachability</li>
      </ul>
    </div>
    <div class="wins-card us">
      <h3>wmcp.sh wins when:</h3>
      <ul>
        <li>Your MCP tools must be reachable from hosted agents (Claude.ai, Cursor remote MCP, web apps) that have no local Docker runtime</li>
        <li>You're serving multi-tenant — many users / agents, no per-user Docker install</li>
        <li>You want OpenAPI ingest of arbitrary specs without packaging each as a container</li>
        <li>You need shopper-side adapters (Shopify) or oracle / price-data MCP</li>
        <li>You want edge-hosted cold-start-free always-on access</li>
        <li>You want managed agent-readiness for your own brand (we ship the JSON-LD + MCP server + verified badge)</li>
      </ul>
    </div>
  </div>
</section>

<!-- ========== ARCHITECTURE DIAGRAM ========== -->
<section id="arch">
  <div class="section-label">Architecture (text)</div>
  <h2>Two very different runtime shapes.</h2>
  <pre><code><span class="c">Docker MCP Toolkit:</span>
<span class="c">┌──────────────────────────────────┐</span>
<span class="c">│  Developer's machine             │</span>
<span class="c">│   ┌──────────┐  ┌──────────┐    │</span>
<span class="c">│   │ Claude   │→ │ Docker   │    │</span>
<span class="c">│   │ Desktop  │  │ Desktop  │    │</span>
<span class="c">│   └──────────┘  └────┬─────┘    │</span>
<span class="c">│                       │           │</span>
<span class="c">│                  ┌────▼─────┐    │</span>
<span class="c">│                  │ Container│    │</span>
<span class="c">│                  │ MCP svr  │    │</span>
<span class="c">│                  └──────────┘    │</span>
<span class="c">└──────────────────────────────────┘</span>

<span class="c">wmcp.sh:</span>
<span class="c">┌──────────────────────────────┐         ┌────────────────────────────┐</span>
<span class="c">│  Any agent, anywhere         │   HTTPS │  Cloudflare edge (300 POPs)│</span>
<span class="c">│  Claude.ai / Cursor / Web    │ ──────→ │  wmcp.sh worker            │</span>
<span class="c">│  LangChain / OpenAI Agents   │         │   • OpenAPI ingest          │</span>
<span class="c">│                              │         │   • Shopify / OAuth proxy   │</span>
<span class="c">└──────────────────────────────┘         └────────────────────────────┘</span></code></pre>
</section>

<!-- ========== LIVE DEMO ========== -->
<section id="live">
  <div class="section-label">Try wmcp.sh</div>
  <h2>One curl, no install.</h2>
  <pre><code><span class="c"># Hit it from any machine, no Docker required:</span>
<span class="k">curl</span> <span class="s">'${origin}/api/v1/tools?url=https://api.llama.fi/protocols'</span></code></pre>
</section>

<!-- ========== FAQ ========== -->
<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions.</h2>

  <details><summary>What's the difference between Docker MCP Toolkit and wmcp.sh?</summary>
  <div class="answer">Docker MCP Toolkit runs MCP servers in local containers inside Docker Desktop — local-only, privacy-preserving. wmcp.sh is hosted on Cloudflare's edge — reachable from anywhere on the internet, no local runtime needed.</div>
  </details>

  <details><summary>When should I pick Docker MCP Toolkit?</summary>
  <div class="answer">Developer-local workflows, privacy-critical servers, prototyping in Claude Desktop / Cursor, anything where the server shouldn't see the public internet.</div>
  </details>

  <details><summary>When should I pick wmcp.sh?</summary>
  <div class="answer">Hosted agents (Claude.ai, Cursor remote MCP), multi-tenant access, OpenAPI ingest of arbitrary specs, shopper-side adapters, oracle / price-data, OAuth-proxy upstream MCP.</div>
  </details>

  <details><summary>Can I use both?</summary>
  <div class="answer">Yes. Local-only tools via Docker MCP Toolkit; hosted reach via wmcp.sh. They cover different surfaces of the same MCP ecosystem.</div>
  </details>

  <details><summary>Pricing?</summary>
  <div class="answer">Docker Desktop's licensing applies for Docker MCP Toolkit (see Docker's site for current terms). wmcp.sh: 100 reads/day free anonymous; managed setup from $499 one-time, Managed Retainer $999/mo, Enterprise $4,999+/mo.</div>
  </details>

  <details><summary>Is wmcp.sh affiliated with Docker?</summary>
  <div class="answer">No. wmcp.sh is independent and not affiliated with, endorsed by, or sponsored by Docker, Inc.</div>
  </details>
</section>

<!-- ========== UPGRADE CTA ========== -->
<section id="upgrade" style="margin-top:36px;background:linear-gradient(135deg,var(--card),rgba(124,92,255,0.08));border:1px solid rgba(124,92,255,0.35);border-radius:16px;padding:22px 26px">
  <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;justify-content:space-between">
    <div style="flex:1;min-width:240px">
      <div style="font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent2);font-weight:700;margin-bottom:6px">Need this picked / built for you?</div>
      <h3 style="margin:0 0 4px;font-size:1.05rem;color:var(--text)">Skip the wiring — we host your MCP at the edge.</h3>
      <p style="color:var(--muted);margin:0;font-size:.92rem">Custom MCP adapter + hosted endpoint at <code>mcp.yourbrand.com</code> + verified badge. From <strong style="color:var(--text)">$499 one-time setup</strong>; Managed Retainer <strong style="color:var(--text)">$999/mo</strong>; Enterprise <strong style="color:var(--text)">$4,999+/mo</strong>.</p>
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
  <h2>Other tools people compare us to.</h2>
  <p class="section-sub">
    <a href="/vs/composio" style="color:var(--accent2);text-decoration:none">/vs/composio</a> &middot;
    <a href="/vs/arcade-ai" style="color:var(--accent2);text-decoration:none">/vs/arcade-ai</a> &middot;
    <a href="/vs/langchain-tools" style="color:var(--accent2);text-decoration:none">/vs/langchain-tools</a> &middot;
    <a href="/vs/anthropic-skills" style="color:var(--accent2);text-decoration:none">/vs/anthropic-skills</a> &middot;
    <a href="/roundup/mcp-servers-2026" style="color:var(--accent2);text-decoration:none">/roundup/mcp-servers-2026</a> &middot;
    <a href="/integration/openapi" style="color:var(--accent2);text-decoration:none">/integration/openapi</a>
  </p>
</section>

</div>

<footer>
  <a href="/">Home</a> · <a href="/agent-ready">Agent-ready</a> · <a href="/managed">Done for you</a> · <a href="/directory">Directory</a> · <a href="/directory/submit">Submit</a> · <a href="/blog">Blog</a> · <a href="/roundup/mcp-servers-2026">MCP servers roundup</a>
</footer>

</body>
</html>`;
}
