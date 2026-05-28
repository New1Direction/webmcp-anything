// /vs/composio — head-to-head comparison page.
// SERP target family: "composio alternative", "best composio alternative",
// "wmcp.sh vs composio", "composio competitors", "composio mcp", "open
// source composio". Composio gets ~3-5k branded searches per month —
// being the canonical "alternative" page captures a meaningful slice of
// that traffic.
//
// Honest framing: where Composio wins (curation, OAuth UX for popular
// SaaS), where wmcp.sh wins (shopper-side, OpenAPI ingest, MCP-native,
// price-data + oracle adapters). Don't lie about either side.

export function vsComposioHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>wmcp.sh vs Composio — when each wins, honest comparison | wmcp.sh</title>
<meta name="description" content="Honest side-by-side of wmcp.sh and Composio. Composio is owner-side SaaS connectors with strong OAuth UX. wmcp.sh is shopper-side + OpenAPI ingest + MCP-native + oracle/price-data. Different shapes; here's when each wins." />
<link rel="canonical" href="${origin}/vs/composio" />
<meta property="og:title" content="wmcp.sh vs Composio — honest head-to-head" />
<meta property="og:description" content="Composio is curated owner-side SaaS connectors. wmcp.sh is shopper-side + OpenAPI ingest + price-data + MCP-native proxy. When each wins." />
<meta property="og:url" content="${origin}/vs/composio" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="wmcp.sh vs Composio" />
<meta name="twitter:description" content="Honest head-to-head. Different shapes — here's when each wins." />
<meta name="twitter:image" content="${origin}/og.png" />
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "wmcp.sh vs Composio — honest head-to-head",
  "description": "Side-by-side: wmcp.sh and Composio compared on shape, auth, coverage, pricing, MCP-nativity.",
  "author": { "@type": "Organization", "name": "WebMCP Anything" },
  "publisher": { "@type": "Organization", "name": "WebMCP Anything", "url": "https://wmcp.sh" },
  "datePublished": "2026-05-28",
  "dateModified": "2026-05-28",
  "mainEntityOfPage": "${origin}/vs/composio"
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What's the fundamental difference between wmcp.sh and Composio?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Composio is owner-side: it gives a developer's customers OAuth-connected SaaS tools (Slack, Notion, Linear) that their agent can call on the customer's behalf. wmcp.sh is shopper-side + data-side: it exposes any public URL as MCP tools — Shopify storefronts, OpenAPI specs, oracle/price-data endpoints — without the user owning the upstream system. They overlap on a few SaaS providers but the wedges are different."
      }
    },
    {
      "@type": "Question",
      "name": "When should I pick Composio over wmcp.sh?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Pick Composio when (1) you're building an owner-side SaaS app where your end users have their own Slack/Notion/Linear accounts and you want polished per-customer OAuth UX, (2) you want curated, manually-maintained connectors for the top 100 SaaS, (3) you're OK with the platform tier pricing and want managed updates. Composio's curation is real — they hand-tune popular connectors. wmcp.sh's OpenAPI ingest is broader but less polished per-provider."
      }
    },
    {
      "@type": "Question",
      "name": "When should I pick wmcp.sh over Composio?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Pick wmcp.sh when (1) your agent needs to act on systems your user doesn't own — shopper buying from any Shopify store, agent reading DefiLlama TVL, agent querying CoinGecko prices, (2) the upstream publishes an OpenAPI spec and you want every endpoint as MCP tools automatically (Stripe's 400 endpoints, GitHub's ~900), (3) you need oracle / price-data / DeFi adapters (Composio doesn't ship these), (4) you want the free tier to actually work (100 reads/day anonymously, no signup), (5) you want MCP-native — wmcp.sh exposes everything via the MCP spec, not via Composio's proprietary tool shape."
      }
    },
    {
      "@type": "Question",
      "name": "Can I use both?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, and most teams that grow past a single product will. Use Composio for the owner-side SaaS connectors that need polished OAuth flows. Use wmcp.sh for shopper-side, OpenAPI-ingested APIs, and oracle/price-data. They're not zero-sum — they cover different shapes."
      }
    },
    {
      "@type": "Question",
      "name": "Pricing comparison?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Composio: free tier (limited), then $39/mo per developer + usage. Per-end-user OAuth tokens are managed by Composio. wmcp.sh: free 100 reads/day anonymous, $29/mo Pro for 10k/day reads + executes. Managed agent-readiness consulting from $499 one-time. wmcp.sh's free tier is materially larger for read-heavy workloads; Composio's value-add is in the curated SaaS connectors which justify the price for teams that need those specific integrations polished."
      }
    },
    {
      "@type": "Question",
      "name": "Is wmcp.sh MCP-spec compliant in a way Composio isn't?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Both ship MCP-spec tool shapes. The difference: wmcp.sh ALSO ships an OAuth-proxy MCP server (https://wmcp.sh/mcp/<provider>) for OAuth-gated upstreams like DefiLlama. wmcp.sh acts as a bearer-injecting proxy so agents that can't drive arbitrary OAuth flows (Claude.ai connectors, Cursor remote MCP) can still access OAuth-gated MCP servers. Composio handles per-customer OAuth differently — through their managed platform, not as a transparent proxy."
      }
    },
    {
      "@type": "Question",
      "name": "What about reliability + uptime?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Composio has had repeated platform outages reported in 2025-2026 (dashboard + SDK incidents tracked in their status updates). wmcp.sh runs on Cloudflare Workers globally — every request hits the nearest edge, no central platform to fail. Different architectures: Composio has more managed surface area which means more things can break; wmcp.sh has less managed surface area but covers a different shape of work."
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
    <a href="/price-data">Price data</a>
    <a href="/integration/openapi">OpenAPI</a>
    <a href="/directory">Directory</a>
  </div>
  <a class="cta" href="/dashboard">Dashboard →</a>
</nav>

<div class="wrap">

<header class="hero">
  <div class="badge"><span class="dot"></span> head-to-head &middot; honest framing</div>
  <h1>wmcp.sh vs Composio.</h1>
  <p class="sub">Composio is the established player for owner-side SaaS connectors with managed OAuth. wmcp.sh is a different shape — shopper-side, OpenAPI ingest, MCP-native proxy, oracle/price-data adapters. Not a feature-by-feature dunk; here's when each one wins.</p>
  <p class="hint">Both written by people on the wmcp.sh team. We tried to be fair. If Composio's team wants to publish a counter-page, we'll link to it.</p>
</header>

<!-- ========== THE WEDGE ========== -->
<section id="wedge">
  <div class="section-label">The shape difference</div>
  <h2>One sentence each.</h2>
  <div class="wins-grid">
    <div class="wins-card">
      <h3>Composio</h3>
      <p style="color:var(--muted);margin:0 0 12px;font-size:.95rem;line-height:1.65">A platform for developers building owner-side AI apps to connect their <strong>customers'</strong> SaaS accounts (Slack / Notion / Linear / GitHub) via managed OAuth, with curated connectors and per-user token storage.</p>
    </div>
    <div class="wins-card us">
      <h3>wmcp.sh</h3>
      <p style="color:var(--muted);margin:0 0 12px;font-size:.95rem;line-height:1.65">A worker that turns any <strong>public URL</strong> — Shopify storefronts, OpenAPI specs, oracle/price-data endpoints, OAuth-gated MCP servers — into MCP tools an agent can call. Shopper-side, broader, less curated.</p>
    </div>
  </div>
</section>

<!-- ========== CAPABILITY TABLE ========== -->
<section id="capabilities">
  <div class="section-label">Side-by-side</div>
  <h2>The capability matrix.</h2>
  <table>
    <thead>
      <tr>
        <th>Capability</th>
        <th>Composio</th>
        <th>wmcp.sh</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Owner-side SaaS connectors</strong><br /><small style="color:var(--dim)">user connects their own Slack / Notion / Linear</small></td>
        <td>✅ Polished, curated, 100+ providers</td>
        <td class="ours">⚠️ Available via OpenAPI ingest, but Composio's per-provider polish is real</td>
      </tr>
      <tr>
        <td><strong>Shopper-side commerce</strong><br /><small style="color:var(--dim)">agent buys from stores the user doesn't own</small></td>
        <td>❌ Not in scope</td>
        <td class="ours">✅ Shopify adapter on 4M+ public storefronts</td>
      </tr>
      <tr>
        <td><strong>OpenAPI spec ingest</strong></td>
        <td>⚠️ Some providers, hand-curated</td>
        <td class="ours">✅ Any OpenAPI 3 spec URL → MCP tools automatically (Stripe ~400, GitHub ~900)</td>
      </tr>
      <tr>
        <td><strong>Oracle / price-data adapters</strong><br /><small style="color:var(--dim)">CoinGecko, Pyth, Chainlink, DefiLlama</small></td>
        <td>❌ Not in scope</td>
        <td class="ours">✅ 5 adapters live at <a href="/price-data" style="color:var(--accent2);text-decoration:none">/price-data</a></td>
      </tr>
      <tr>
        <td><strong>OAuth-proxy for MCP servers</strong><br /><small style="color:var(--dim)">e.g. DefiLlama MCP for Claude.ai users</small></td>
        <td>⚠️ Different model (per-customer)</td>
        <td class="ours">✅ <code>wmcp.sh/mcp/&lt;provider&gt;</code> proxies any RFC 7591 / PKCE MCP server</td>
      </tr>
      <tr>
        <td><strong>Free tier</strong></td>
        <td>Limited free tier</td>
        <td class="ours">100 reads/day anonymous, no signup</td>
      </tr>
      <tr>
        <td><strong>Pricing (developer tier)</strong></td>
        <td>$39+/mo + usage</td>
        <td class="ours">$29/mo Pro</td>
      </tr>
      <tr>
        <td><strong>MCP-spec native</strong></td>
        <td>✅ MCP tool shape</td>
        <td class="ours">✅ MCP tool shape + Streamable HTTP proxy + OAuth 2.1 DCR</td>
      </tr>
      <tr>
        <td><strong>Open source</strong></td>
        <td>Partial (clients only)</td>
        <td class="ours">Worker + adapters public (MIT)</td>
      </tr>
      <tr>
        <td><strong>Multi-region / edge</strong></td>
        <td>Centralized platform</td>
        <td class="ours">Cloudflare Workers, 300+ POPs</td>
      </tr>
      <tr>
        <td><strong>Managed agent-readiness consulting</strong><br /><small style="color:var(--dim)">we ship JSON-LD, OpenAPI, MCP server for your site</small></td>
        <td>❌ Not offered</td>
        <td class="ours">✅ From $499 one-time — see <a href="/managed" style="color:var(--accent2);text-decoration:none">/managed</a></td>
      </tr>
    </tbody>
  </table>
</section>

<!-- ========== WINS PER SIDE ========== -->
<section id="wins">
  <div class="section-label">Where each wins</div>
  <h2>The honest version.</h2>
  <div class="wins-grid">
    <div class="wins-card">
      <h3>Composio wins when:</h3>
      <ul>
        <li>Your end-users have their own Slack/Notion/Linear and you need polished per-user OAuth that "just works" in production</li>
        <li>You want hand-curated connectors that won't break when a vendor changes their API</li>
        <li>Enterprise-grade SaaS tooling is the primary need; you're OK paying for the polish</li>
        <li>You don't need shopper-side, oracle, or price-data surface</li>
      </ul>
    </div>
    <div class="wins-card us">
      <h3>wmcp.sh wins when:</h3>
      <ul>
        <li>Your agent acts on systems the user doesn't own (shopper at Shopify stores, reader of DefiLlama, caller of public APIs)</li>
        <li>You need OpenAPI ingest — Stripe's 400 endpoints or GitHub's 900 as MCP tools, no per-endpoint curation</li>
        <li>You need oracle / DeFi / price-data (CoinGecko + Pyth + Chainlink + DefiLlama + DexScreener live)</li>
        <li>You want OAuth-proxy for MCP servers (so Claude.ai / Cursor users get DefiLlama MCP without driving OAuth flows themselves)</li>
        <li>You want a 100/day free tier with no signup</li>
        <li>You want managed agent-readiness consulting (we ship the JSON-LD + MCP server for your site)</li>
      </ul>
    </div>
  </div>
</section>

<!-- ========== LIVE DEMO ========== -->
<section id="live">
  <div class="section-label">Try wmcp.sh in 30 seconds</div>
  <h2>One curl, see for yourself.</h2>
  <p class="section-sub">Drop any Shopify product URL, any OpenAPI spec URL, or any of the price-data sources. Free tier, no signup for the first 100 reads/day.</p>
  <pre><code><span class="c"># Shopify product → 5 MCP tools (price, availability, add-to-cart, ...)</span>
<span class="k">curl</span> <span class="s">'${origin}/api/v1/tools?url=https://www.allbirds.com/products/mens-wool-runners'</span>

<span class="c"># Stripe OpenAPI → 400+ MCP tools, with tag-filter:</span>
<span class="k">curl</span> <span class="s">'${origin}/api/v1/tools?url=https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.json&amp;tag=customers'</span>

<span class="c"># DefiLlama → 6 MCP tools for TVL, yields, stables, ETFs</span>
<span class="k">curl</span> <span class="s">'${origin}/api/v1/tools?url=https://api.llama.fi/protocols'</span></code></pre>
</section>

<!-- ========== FAQ ========== -->
<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions from people comparing these two.</h2>

  <details><summary>What's the fundamental difference?</summary>
  <div class="answer">Composio is owner-side: it gives developers' customers OAuth-connected SaaS tools their agent can call on the customer's behalf. wmcp.sh is shopper-side + data-side: it exposes any public URL as MCP tools — Shopify storefronts, OpenAPI specs, oracle/price-data endpoints — without the user owning the upstream system. They overlap on a few SaaS providers but the wedges are different.</div>
  </details>

  <details><summary>When should I pick Composio?</summary>
  <div class="answer">When you're building an owner-side SaaS app where your end users have their own Slack / Notion / Linear, you want polished per-customer OAuth UX, and you want curated managed connectors for the top 100 SaaS. Composio's curation is real.</div>
  </details>

  <details><summary>When should I pick wmcp.sh?</summary>
  <div class="answer">When (a) your agent acts on systems your user doesn't own, (b) the upstream publishes an OpenAPI spec and you want every endpoint as MCP tools automatically, (c) you need oracle / price-data / DeFi adapters (Composio doesn't ship these), (d) you want a 100/day anonymous free tier, (e) you want MCP-native + OAuth-proxy for OAuth-gated MCP servers.</div>
  </details>

  <details><summary>Can I use both?</summary>
  <div class="answer">Yes — most teams growing past a single product will. Composio for owner-side SaaS connectors that need polished OAuth. wmcp.sh for shopper-side, OpenAPI-ingested APIs, and oracle/price-data. Not zero-sum.</div>
  </details>

  <details><summary>Pricing?</summary>
  <div class="answer">Composio: free tier (limited), then $39/mo per dev + usage. wmcp.sh: free 100 reads/day anonymous, $29/mo Pro for 10k/day reads + executes. Managed consulting from $499 one-time. wmcp.sh's free tier is materially larger for read-heavy workloads.</div>
  </details>

  <details><summary>What about reliability?</summary>
  <div class="answer">Composio has had repeated platform outages reported in 2025-2026. wmcp.sh runs on Cloudflare Workers globally — every request hits the nearest edge, no central platform to fail. Different architectures, different failure modes.</div>
  </details>

  <details><summary>Is wmcp.sh open source?</summary>
  <div class="answer">Worker + all 5 oracle adapters are MIT-licensed. Composio's clients are open, server is closed. If you need to self-host, wmcp.sh is the lower-friction path.</div>
  </details>
</section>

<!-- ========== RELATED ========== -->
<section id="related">
  <div class="section-label">Related comparisons</div>
  <h2>Other tools people compare us to.</h2>
  <p class="section-sub">
    <a href="/vs/pipedream" style="color:var(--accent2);text-decoration:none">/vs/pipedream</a> &middot;
    <a href="/vs/zapier" style="color:var(--accent2);text-decoration:none">/vs/zapier</a> &middot;
    <a href="/agent-ready" style="color:var(--accent2);text-decoration:none">/agent-ready</a> (the cornerstone — make your site agent-callable) &middot;
    <a href="/integration/openapi" style="color:var(--accent2);text-decoration:none">/integration/openapi</a> &middot;
    <a href="/managed" style="color:var(--accent2);text-decoration:none">/managed</a> (we do it for you)
  </p>
</section>

</div>

<footer>
  <a href="/">Home</a> · <a href="/agent-ready">Agent-ready</a> · <a href="/managed">Done for you</a> · <a href="/price-data">Price data</a> · <a href="/integration/openapi">OpenAPI</a> · <a href="/directory">Directory</a> · <a href="https://github.com/New1Direction/webmcp-anything">GitHub</a>
</footer>

</body>
</html>`;
}
