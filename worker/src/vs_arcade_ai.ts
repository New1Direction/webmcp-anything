// /vs/arcade-ai — head-to-head with Arcade.dev.
// SERP target family: "arcade.dev alternative", "arcade ai mcp",
// "wmcp.sh vs arcade", "open source arcade alternative". Arcade is the
// closest direct competitor — they ship hosted OAuth + managed
// integrations for AI agents. We cover overlapping ground but extend
// into shopper-side scraping and OpenAPI ingest.
//
// Arcade is a real, well-funded company with real strengths (managed
// OAuth UX). Be factual. No specific pricing numbers — Arcade's
// pricing page is canonical and changes; readers check their site.
//
// wmcp.sh is not affiliated with Arcade AI, Inc.

export function vsArcadeAiHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>wmcp.sh vs Arcade.dev — managed OAuth vs runtime tool gateway | wmcp.sh</title>
<meta name="description" content="Arcade.dev is managed OAuth-connected tool calling for AI agents — strong UX, curated SaaS catalog. wmcp.sh is broader: shopper-side scraping, OpenAPI ingest, MCP-native. Honest comparison + when each wins." />
<link rel="canonical" href="${origin}/vs/arcade-ai" />
<meta property="og:title" content="wmcp.sh vs Arcade.dev — when each wins" />
<meta property="og:description" content="Arcade does owner-side OAuth tool calling beautifully. wmcp.sh adds shopper-side and OpenAPI ingest. Different shapes, different wedges." />
<meta property="og:url" content="${origin}/vs/arcade-ai" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="wmcp.sh vs Arcade.dev" />
<meta name="twitter:description" content="Honest head-to-head. Arcade for owner-side OAuth polish; wmcp.sh for breadth." />
<meta name="twitter:image" content="${origin}/og.png" />
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "wmcp.sh vs Arcade.dev — managed OAuth vs runtime gateway",
  "description": "Side-by-side: Arcade.dev and wmcp.sh compared on shape, auth, coverage, MCP-nativity, pricing.",
  "author": { "@type": "Organization", "name": "WebMCP Anything" },
  "publisher": { "@type": "Organization", "name": "WebMCP Anything", "url": "https://wmcp.sh" },
  "datePublished": "2026-05-28",
  "dateModified": "2026-05-28",
  "mainEntityOfPage": "${origin}/vs/arcade-ai"
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What's the fundamental difference between wmcp.sh and Arcade.dev?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Arcade.dev is a managed tool-calling platform that gives developers polished OAuth flows for their end users to connect SaaS accounts (Gmail, Slack, GitHub, Linear) so an agent can act on each user's behalf. wmcp.sh is a runtime MCP gateway that ALSO handles OAuth but covers a wider surface — shopper-side adapters (Shopify storefronts the user doesn't own), automatic OpenAPI spec ingest, and oracle/price-data sources. They overlap on owner-side SaaS; they diverge on shopper-side and OpenAPI ingest."
      }
    },
    {
      "@type": "Question",
      "name": "When should I pick Arcade over wmcp.sh?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Pick Arcade when (1) you're building an owner-side AI app where end users need to authorize SaaS accounts (Gmail / Slack / GitHub) and you want their per-customer OAuth UX out of the box, (2) you prefer a curated tool catalog with hand-tuned per-provider polish, (3) you're OK paying for the managed platform and want zero infra to run. Arcade's OAuth UX is genuinely good — that's their core competence."
      }
    },
    {
      "@type": "Question",
      "name": "When should I pick wmcp.sh over Arcade?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Pick wmcp.sh when (1) your agent acts on systems the user doesn't own — shopper buying from any Shopify store, agent querying DefiLlama or CoinGecko, (2) you want any OpenAPI spec automatically ingested as MCP tools (Stripe's 400 endpoints, GitHub's 900), (3) you need price-data / DeFi oracle adapters (Arcade doesn't ship these), (4) you want a free anonymous tier (100 reads/day, no signup), (5) you want a fully MCP-native wire format with an OAuth-proxy MCP server pattern for upstream MCP providers."
      }
    },
    {
      "@type": "Question",
      "name": "Are they both MCP-spec compliant?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Both expose tools that AI agents can call. wmcp.sh is fully MCP-native — its primary wire format is the Model Context Protocol over Streamable HTTP, and it ships an OAuth-proxy MCP server (wmcp.sh/mcp/<provider>) that bridges agents which can't drive arbitrary OAuth flows to OAuth-gated MCP upstreams. Arcade exposes its tools to MCP-compatible clients too; check Arcade's docs for the specific client patterns they support."
      }
    },
    {
      "@type": "Question",
      "name": "Can I use both?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Many teams pair Arcade for the owner-side SaaS connectors that need polished per-customer OAuth, and wmcp.sh for the broader surface — shopper-side scraping, OpenAPI ingest, oracle/price-data, and OAuth-proxy MCP. They're not zero-sum."
      }
    },
    {
      "@type": "Question",
      "name": "Pricing comparison?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Arcade's current pricing is published on their website (arcade.dev/pricing) — see their site for the canonical tier breakdown. wmcp.sh has a free anonymous tier (100 reads/day, no signup); managed agent-readiness consulting starts at $499 one-time setup, with Managed Retainer at $999/mo and Enterprise from $4,999/mo. Free wmcp.sh tier exists for read-heavy workloads."
      }
    },
    {
      "@type": "Question",
      "name": "Is wmcp.sh affiliated with Arcade?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. wmcp.sh is an independent project and is not affiliated with, endorsed by, or sponsored by Arcade AI, Inc."
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
  <div class="badge"><span class="dot"></span> competitor &middot; arcade.dev</div>
  <h1>wmcp.sh vs Arcade.dev.</h1>
  <p class="sub">Arcade.dev is a managed tool-calling platform with polished OAuth UX for owner-side SaaS connectors. wmcp.sh covers the same ground PLUS shopper-side adapters, automatic OpenAPI ingest, and oracle/price-data. Closest direct comparison we have. Here's the honest version.</p>
  <p class="hint">Arcade's OAuth flows for Gmail / Slack / GitHub are well-engineered. We aren't claiming to beat them at the curated-OAuth game — we're playing a broader game.</p>
  <p class="disclaim">wmcp.sh is not affiliated with, endorsed by, or sponsored by Arcade AI, Inc. All claims about Arcade are based on their public documentation; pricing and feature details are subject to change — see arcade.dev for canonical info.</p>
</header>

<!-- ========== THE WEDGE ========== -->
<section id="wedge">
  <div class="section-label">The shape difference</div>
  <h2>One sentence each.</h2>
  <div class="wins-grid">
    <div class="wins-card">
      <h3>Arcade.dev</h3>
      <p style="color:var(--muted);margin:0 0 12px;font-size:.95rem;line-height:1.65">A managed platform for AI agent tool calling — strong on per-customer OAuth UX for owner-side SaaS connectors (Gmail, Slack, GitHub, Linear, etc.) with curated, hand-tuned integrations and a hosted runtime.</p>
    </div>
    <div class="wins-card us">
      <h3>wmcp.sh</h3>
      <p style="color:var(--muted);margin:0 0 12px;font-size:.95rem;line-height:1.65">A runtime MCP gateway: point it at any public URL, OpenAPI spec, or upstream MCP server. Shopper-side adapters (Shopify), automatic OpenAPI ingest (Stripe, GitHub), and an OAuth-proxy MCP server for OAuth-gated MCP upstreams.</p>
    </div>
  </div>
</section>

<!-- ========== CAPABILITY TABLE ========== -->
<section id="capabilities">
  <div class="section-label">Side-by-side</div>
  <h2>The capability matrix.</h2>
  <table>
    <thead>
      <tr><th>Capability</th><th>Arcade.dev</th><th>wmcp.sh</th></tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Owner-side SaaS connectors</strong><br /><small style="color:var(--dim)">end user authorizes their Gmail/Slack/Linear</small></td>
        <td>✅ Hand-tuned, curated catalog</td>
        <td class="ours">⚠️ Available via OpenAPI ingest; Arcade's per-provider polish is real</td>
      </tr>
      <tr>
        <td><strong>Shopper-side commerce adapters</strong><br /><small style="color:var(--dim)">agent buys from stores the user doesn't own</small></td>
        <td>Not core scope</td>
        <td class="ours">✅ Shopify storefronts (~4M+ public)</td>
      </tr>
      <tr>
        <td><strong>OpenAPI spec ingest</strong></td>
        <td>Provider-specific curation</td>
        <td class="ours">✅ Any OpenAPI 3 spec URL → MCP tools automatically</td>
      </tr>
      <tr>
        <td><strong>Oracle / DeFi / price-data</strong></td>
        <td>Not core scope</td>
        <td class="ours">✅ CoinGecko + DefiLlama + Pyth + Chainlink + DexScreener</td>
      </tr>
      <tr>
        <td><strong>OAuth-proxy MCP server</strong><br /><small style="color:var(--dim)">bearer-injecting proxy for upstream MCP</small></td>
        <td>Different model — see Arcade docs</td>
        <td class="ours">✅ <code>wmcp.sh/mcp/&lt;provider&gt;</code> — RFC 7591 / PKCE compatible</td>
      </tr>
      <tr>
        <td><strong>MCP-native wire format</strong></td>
        <td>Supports MCP clients</td>
        <td class="ours">✅ Streamable HTTP MCP + OAuth 2.1 DCR</td>
      </tr>
      <tr>
        <td><strong>Free anonymous tier</strong></td>
        <td>See arcade.dev/pricing</td>
        <td class="ours">100 reads/day, no signup</td>
      </tr>
      <tr>
        <td><strong>Edge / multi-region</strong></td>
        <td>Hosted platform</td>
        <td class="ours">Cloudflare Workers — 300+ POPs</td>
      </tr>
      <tr>
        <td><strong>Open source</strong></td>
        <td>SDKs / clients open; check repos for current status</td>
        <td class="ours">Worker + adapters MIT (public)</td>
      </tr>
      <tr>
        <td><strong>Managed agent-readiness consulting</strong><br /><small style="color:var(--dim)">we ship the JSON-LD + MCP server for your site</small></td>
        <td>Not the same product shape</td>
        <td class="ours">✅ From $499 one-time — see <a href="/managed" style="color:var(--accent2);text-decoration:none">/managed</a></td>
      </tr>
    </tbody>
  </table>
  <p class="disclaim">Feature and pricing claims for Arcade are based on their public documentation and subject to change. See arcade.dev for canonical, current information.</p>
</section>

<!-- ========== WINS PER SIDE ========== -->
<section id="wins">
  <div class="section-label">When they win — honestly</div>
  <h2>Arcade is a real product. Here's where it's the right pick.</h2>
  <div class="wins-grid">
    <div class="wins-card">
      <h3>Arcade wins when:</h3>
      <ul>
        <li>Your end users need to authorize their own Gmail / Slack / GitHub / Linear and you want that flow to "just work" with zero plumbing</li>
        <li>You want a curated catalog where each provider is hand-tuned and tested</li>
        <li>You're shipping an owner-side AI product and OAuth polish is a top customer-perceived feature</li>
        <li>You prefer a managed runtime over running your own gateway</li>
        <li>You don't need shopper-side scraping, oracle data, or OpenAPI ingest of arbitrary specs</li>
      </ul>
    </div>
    <div class="wins-card us">
      <h3>wmcp.sh wins when:</h3>
      <ul>
        <li>Your agent acts on systems your user doesn't own (Shopify shopper-side, DeFi data, public APIs without consumer accounts)</li>
        <li>You want every endpoint in Stripe's or GitHub's OpenAPI spec exposed as MCP tools without per-endpoint curation</li>
        <li>You need oracle / DeFi / price-data MCP adapters (CoinGecko, DefiLlama, Pyth, Chainlink, DexScreener)</li>
        <li>You want a free 100/day anonymous tier with no signup</li>
        <li>You want an MCP-native OAuth-proxy server so Claude.ai / Cursor users access OAuth-gated MCP upstreams without driving PKCE themselves</li>
        <li>You want managed agent-readiness for YOUR own site (we ship JSON-LD + MCP server + verified badge)</li>
      </ul>
    </div>
  </div>
</section>

<!-- ========== LIVE DEMO ========== -->
<section id="live">
  <div class="section-label">Try wmcp.sh in 30 seconds</div>
  <h2>One curl.</h2>
  <p class="section-sub">Drop any Shopify product URL, any OpenAPI spec URL, or any of the price-data sources. Free tier, no signup for the first 100 reads/day.</p>
  <pre><code><span class="c"># Shopify product → MCP tools (price, availability, add-to-cart, ...)</span>
<span class="k">curl</span> <span class="s">'${origin}/api/v1/tools?url=https://www.allbirds.com/products/mens-wool-runners'</span>

<span class="c"># Stripe OpenAPI → 400+ MCP tools, with tag filter:</span>
<span class="k">curl</span> <span class="s">'${origin}/api/v1/tools?url=https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.json&amp;tag=customers'</span>

<span class="c"># DefiLlama → MCP tools for TVL, yields, stables, ETFs</span>
<span class="k">curl</span> <span class="s">'${origin}/api/v1/tools?url=https://api.llama.fi/protocols'</span></code></pre>
</section>

<!-- ========== FAQ ========== -->
<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions.</h2>

  <details><summary>What's the fundamental difference?</summary>
  <div class="answer">Arcade is a managed tool-calling platform with polished per-customer OAuth for owner-side SaaS. wmcp.sh is a runtime MCP gateway that covers owner-side OAuth AND shopper-side scraping, automatic OpenAPI ingest, and oracle / price-data sources.</div>
  </details>

  <details><summary>When should I pick Arcade?</summary>
  <div class="answer">When per-customer OAuth UX for the top SaaS providers (Gmail, Slack, GitHub, Linear) is the centerpiece of your product, and you want a managed runtime with hand-tuned connectors. Arcade's curation is real.</div>
  </details>

  <details><summary>When should I pick wmcp.sh?</summary>
  <div class="answer">When you need broader surface — shopper-side adapters, automatic OpenAPI ingest of any spec, oracle / price-data, or an OAuth-proxy MCP server pattern for upstream MCP providers.</div>
  </details>

  <details><summary>Can I use both?</summary>
  <div class="answer">Yes. Many teams use Arcade for polished owner-side OAuth on a curated set and wmcp.sh for everything else.</div>
  </details>

  <details><summary>Pricing?</summary>
  <div class="answer">Arcade publishes current pricing at arcade.dev/pricing — see their site. wmcp.sh: 100 reads/day free anonymous; managed setup from $499 one-time, Managed Retainer $999/mo, Enterprise $4,999+/mo.</div>
  </details>

  <details><summary>Is wmcp.sh affiliated with Arcade?</summary>
  <div class="answer">No. wmcp.sh is independent and not affiliated with, endorsed by, or sponsored by Arcade AI, Inc.</div>
  </details>
</section>

<!-- ========== UPGRADE CTA ========== -->
<section id="upgrade" style="margin-top:36px;background:linear-gradient(135deg,var(--card),rgba(124,92,255,0.08));border:1px solid rgba(124,92,255,0.35);border-radius:16px;padding:22px 26px">
  <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;justify-content:space-between">
    <div style="flex:1;min-width:240px">
      <div style="font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent2);font-weight:700;margin-bottom:6px">Need this picked / built for you?</div>
      <h3 style="margin:0 0 4px;font-size:1.05rem;color:var(--text)">We'll set up your tool gateway end-to-end.</h3>
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
    <a href="/vs/langchain-tools" style="color:var(--accent2);text-decoration:none">/vs/langchain-tools</a> &middot;
    <a href="/vs/mcp-toolkit" style="color:var(--accent2);text-decoration:none">/vs/mcp-toolkit</a> &middot;
    <a href="/vs/anthropic-skills" style="color:var(--accent2);text-decoration:none">/vs/anthropic-skills</a> &middot;
    <a href="/roundup/oauth-providers-mcp" style="color:var(--accent2);text-decoration:none">/roundup/oauth-providers-mcp</a> &middot;
    <a href="/integration/openapi" style="color:var(--accent2);text-decoration:none">/integration/openapi</a>
  </p>
</section>

</div>

<footer>
  <a href="/">Home</a> · <a href="/agent-ready">Agent-ready</a> · <a href="/managed">Done for you</a> · <a href="/directory">Directory</a> · <a href="/directory/submit">Submit</a> · <a href="/blog">Blog</a> · <a href="/roundup/oauth-providers-mcp">OAuth providers roundup</a>
</footer>

</body>
</html>`;
}
