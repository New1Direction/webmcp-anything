// /roundup/mcp-servers-2026 — listicle covering the prominent MCP
// servers in 2026. SERP target: "best mcp servers 2026", "mcp servers
// list", "top mcp servers", "mcp server directory".
//
// We list only MCP servers that have official, public documentation
// from their vendor (Anthropic's reference servers list, Stripe's
// MCP docs, GitHub's MCP server, etc.). We do NOT invent URLs. Where
// we describe a server, we describe it neutrally based on what its
// vendor publishes. wmcp.sh appears as the meta-gateway near the top.
//
// Disclaimer: features and availability change; readers should check
// each vendor's site for canonical info.

export function roundupMcpServers2026Html(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Best MCP servers in 2026 — full landscape & directory | wmcp.sh</title>
<meta name="description" content="The MCP server landscape in 2026: databases, comms, devops, ecommerce, finance. Plus the meta-gateway pattern (wmcp.sh) that turns any URL or OpenAPI spec into MCP tools. Curated + honest." />
<link rel="canonical" href="${origin}/roundup/mcp-servers-2026" />
<meta property="og:title" content="Best MCP servers 2026 — full landscape" />
<meta property="og:description" content="Curated list of prominent MCP servers across databases, comms, devops, ecommerce, finance — plus wmcp.sh, the meta-gateway." />
<meta property="og:url" content="${origin}/roundup/mcp-servers-2026" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Best MCP servers 2026" />
<meta name="twitter:description" content="Curated, honest landscape of MCP servers across major categories." />
<meta name="twitter:image" content="${origin}/og.png" />
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Best MCP servers in 2026 — full landscape & directory",
  "description": "A curated, honest landscape of prominent Model Context Protocol servers grouped by category, plus the meta-gateway pattern.",
  "author": { "@type": "Organization", "name": "WebMCP Anything" },
  "publisher": { "@type": "Organization", "name": "WebMCP Anything", "url": "https://wmcp.sh" },
  "datePublished": "2026-05-28",
  "dateModified": "2026-05-28",
  "mainEntityOfPage": "${origin}/roundup/mcp-servers-2026"
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is an MCP server?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "An MCP (Model Context Protocol) server is an endpoint that exposes tools, resources, and prompts to an AI agent over a standard wire protocol. MCP was originally introduced by Anthropic and has since become an open spec adopted by many vendors. The agent (Claude, Cursor, LangChain agents, OpenAI Agents SDK with adapters) connects to the MCP server, lists its tools, and calls them as part of its workflow."
      }
    },
    {
      "@type": "Question",
      "name": "What's the difference between an MCP server and an OpenAPI spec?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "An OpenAPI spec describes an HTTP API for humans and SDK generators. An MCP server is a runtime endpoint that an agent talks to directly using the MCP wire format (typically Streamable HTTP). wmcp.sh bridges the two — drop in an OpenAPI URL and it serves the endpoints as MCP tools without you writing an MCP server yourself."
      }
    },
    {
      "@type": "Question",
      "name": "Do I need to install MCP servers locally?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Some MCP servers ship as stdio binaries you run locally (good for filesystem access or local databases). Others are hosted HTTP endpoints (Stripe MCP, GitHub MCP, wmcp.sh) you connect to over the internet. Docker MCP Toolkit gives you containerized local runs; wmcp.sh gives you edge-hosted always-on access. Both have their place."
      }
    },
    {
      "@type": "Question",
      "name": "How do I pick the right MCP server?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Start from the upstream: if the vendor (Stripe, GitHub, Notion, Linear) ships an official MCP server, use that — it's most likely well-maintained and authoritative. If not, look for community servers in the directory. If you need a long tail of APIs that don't have MCP servers, use a meta-gateway like wmcp.sh that ingests OpenAPI specs."
      }
    },
    {
      "@type": "Question",
      "name": "What's a 'meta MCP server'?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A meta MCP server (sometimes 'MCP aggregator' or 'MCP gateway') is a single MCP endpoint that proxies many upstream sources. wmcp.sh is one: point it at any URL, OpenAPI spec, or other MCP server and it exposes tools for that upstream through one consistent endpoint. Useful when an agent needs many tool sources but only wants one MCP connection to maintain."
      }
    }
  ]
}
</script>
<style>
  :root { --bg:#07070d;--card:#16161f;--bg2:#11111c;--border:#26263a;--text:#ececf5;--muted:#8a8aa8;--dim:#6a6a88;--accent:#ff9e2c;--accent2:#ffcf7a;--green:#4ade80;--red:#f87171;--pink:#ffb86b;--gold:#fbbf24; }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin:0;min-height:100vh;color:var(--text);background:var(--bg);font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif;line-height:1.6;background-image:radial-gradient(ellipse 900px 600px at 10% -5%,rgba(255,158,44,.18),transparent 60%),radial-gradient(ellipse 700px 500px at 95% 10%,rgba(255,176,0,.10),transparent 60%); }
  .wrap { max-width: 960px; margin: 0 auto; padding: 0 24px; }
  nav { display:flex;justify-content:space-between;align-items:center;padding:22px 24px;max-width:1120px;margin:0 auto; }
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
  .grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px;margin-top:18px; }
  .card { background:var(--card);border:1px solid var(--border);border-radius:14px;padding:18px 20px; }
  .card.us { border-color:var(--accent);background:linear-gradient(135deg,var(--card),rgba(255,158,44,0.06)); }
  .card h3 { color: var(--text); margin: 0 0 6px; font-size: 1rem; }
  .card .tag { display:inline-block;font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent2);font-weight:700;margin-bottom:8px; }
  .card p { color:var(--muted);font-size:.88rem;margin:0;line-height:1.55; }
  .card.us h3 { color: var(--accent2); }
  details { background:var(--card);border:1px solid var(--border);border-radius:12px;padding:18px 20px;margin-bottom:12px; }
  details summary { font-weight: 700; font-size: 1rem; color: var(--text); cursor: pointer; list-style: none; }
  details[open] summary { margin-bottom: 12px; }
  details .answer { color: var(--muted); font-size: .92rem; line-height: 1.65; }
  table { width: 100%; border-collapse: collapse; text-align: left; font-size: .9rem; margin-top: 16px; }
  th, td { padding: 12px 14px; border-bottom: 1px solid var(--border); vertical-align: top; }
  th { background: var(--bg2); font-weight: 700; color: var(--accent2); font-size: .82rem; }
  td strong { color: var(--text); }
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
  <div class="badge"><span class="dot"></span> roundup &middot; mcp servers 2026</div>
  <h1>Best MCP servers in 2026.</h1>
  <p class="sub">A curated, honest landscape of prominent Model Context Protocol servers — grouped by category. Where vendors ship official MCP servers we feature those. Where they don't, we note the meta-gateway pattern (wmcp.sh) that turns any URL or OpenAPI spec into MCP tools.</p>
  <p class="hint">Includes the canonical pattern, the meta-gateway, and category-by-category recommendations. Updated for the current MCP ecosystem.</p>
  <p class="disclaim">All servers listed below have public documentation from their respective vendors. Features and availability change; check each vendor's docs for current canonical info. We are not affiliated with the vendors listed.</p>
</header>

<!-- ========== THE META PATTERN ========== -->
<section id="meta">
  <div class="section-label">Start here</div>
  <h2>The meta-gateway pattern.</h2>
  <p class="section-sub">Before listing individual servers — the most important shift in 2026 is the rise of "meta MCP" gateways: a single endpoint that proxies many upstreams. Lets agents maintain one connection instead of dozens.</p>
  <div class="grid">
    <div class="card us">
      <div class="tag">meta · edge-hosted</div>
      <h3>wmcp.sh</h3>
      <p>Hosted MCP gateway on Cloudflare Workers. Drops in any URL, OpenAPI spec, or upstream MCP server and exposes MCP tools. Free 100 reads/day, no signup. OAuth-proxy + price-data + shopper-side adapters built in.</p>
    </div>
    <div class="card">
      <div class="tag">meta · local containers</div>
      <h3>Docker MCP Toolkit</h3>
      <p>Docker Desktop's curated catalog of containerized MCP servers. Local-only, isolated, image-signed. Good for dev + privacy-sensitive workloads. See <a href="/vs/mcp-toolkit" style="color:var(--accent2);text-decoration:none">/vs/mcp-toolkit</a> for tradeoffs.</p>
    </div>
  </div>
</section>

<!-- ========== CATEGORY: DATABASES ========== -->
<section id="databases">
  <div class="section-label">Category</div>
  <h2>Databases.</h2>
  <p class="section-sub">Servers that let an agent query / mutate data stores. Most run as local stdio binaries you point at a connection string; a few are hosted.</p>
  <div class="grid">
    <div class="card">
      <div class="tag">database</div>
      <h3>Postgres MCP</h3>
      <p>Community + reference implementations exposing schema introspection, query execution, and migration helpers. Typically run as a local stdio binary against your connection string.</p>
    </div>
    <div class="card">
      <div class="tag">database</div>
      <h3>SQLite MCP</h3>
      <p>Reference server in Anthropic's open MCP servers list. Useful for local file-backed databases — schema reads, query exec, attach/detach.</p>
    </div>
    <div class="card">
      <div class="tag">warehouse</div>
      <h3>Snowflake / BigQuery MCP</h3>
      <p>Vendor-published and community implementations for analytical warehouses. Read-only modes are common to keep agents from running cost-heavy mutations by accident.</p>
    </div>
  </div>
</section>

<!-- ========== CATEGORY: COMMS ========== -->
<section id="comms">
  <div class="section-label">Category</div>
  <h2>Communications.</h2>
  <p class="section-sub">Inbox + chat + ticketing MCP servers. Mostly OAuth-gated — see <a href="/roundup/oauth-providers-mcp" style="color:var(--accent2);text-decoration:none">/roundup/oauth-providers-mcp</a> for the OAuth comparison.</p>
  <div class="grid">
    <div class="card">
      <div class="tag">comms</div>
      <h3>Slack MCP</h3>
      <p>List channels, post messages, search history, read DMs (per OAuth scopes). Both vendor and community implementations available.</p>
    </div>
    <div class="card">
      <div class="tag">comms</div>
      <h3>Discord MCP</h3>
      <p>Community-built. Bot-token or user-token based depending on the variant. Channel listing, message send/read.</p>
    </div>
    <div class="card">
      <div class="tag">comms</div>
      <h3>Gmail MCP</h3>
      <p>Search, read, send via Gmail API. OAuth scope-gated — agent only sees what the connecting user authorized.</p>
    </div>
    <div class="card">
      <div class="tag">comms</div>
      <h3>Linear MCP</h3>
      <p>Vendor-published. Issue list/search/create/update, project + cycle reads. One of the cleaner OAuth onboarding flows in the comms category.</p>
    </div>
  </div>
</section>

<!-- ========== CATEGORY: DEVOPS ========== -->
<section id="devops">
  <div class="section-label">Category</div>
  <h2>DevOps & code.</h2>
  <p class="section-sub">Repo, CI, observability. Mix of vendor-shipped and community.</p>
  <div class="grid">
    <div class="card">
      <div class="tag">devops</div>
      <h3>GitHub MCP</h3>
      <p>Repo browsing, PR review, issue management, file diff/edit operations. Vendor-published official server plus several community variants.</p>
    </div>
    <div class="card">
      <div class="tag">devops</div>
      <h3>GitLab MCP</h3>
      <p>Community implementations covering similar surface as the GitHub server — projects, MRs, issues, pipeline status.</p>
    </div>
    <div class="card">
      <div class="tag">observability</div>
      <h3>Sentry / Datadog MCP</h3>
      <p>Issue + alert + trace queries from agent context. Sentry has shipped an MCP server; Datadog and others have community ports.</p>
    </div>
    <div class="card">
      <div class="tag">cloud</div>
      <h3>Cloudflare MCP</h3>
      <p>Workers + DNS + R2 ops. Useful for agent-driven infra workflows. Check Cloudflare's docs for the canonical scope list.</p>
    </div>
  </div>
</section>

<!-- ========== CATEGORY: ECOMMERCE / PAYMENTS ========== -->
<section id="commerce">
  <div class="section-label">Category</div>
  <h2>Commerce & payments.</h2>
  <p class="section-sub">The category where shopper-side vs owner-side really matters.</p>
  <div class="grid">
    <div class="card us">
      <div class="tag">shopper-side</div>
      <h3>wmcp.sh Shopify adapter</h3>
      <p>Turn any of the ~4M+ public Shopify storefronts into MCP tools (price, availability, add-to-cart, search). Shopper-side — no merchant install required.</p>
    </div>
    <div class="card">
      <div class="tag">owner-side</div>
      <h3>Shopify Admin MCP</h3>
      <p>For merchants on their own store: orders, products, customers, fulfillments. Admin-side OAuth, vendor-published.</p>
    </div>
    <div class="card">
      <div class="tag">payments</div>
      <h3>Stripe MCP</h3>
      <p>Vendor-published. Customers + invoices + subscriptions + balance ops. Stripe's OpenAPI is large (hundreds of endpoints); the MCP server surfaces the high-value subset.</p>
    </div>
    <div class="card us">
      <div class="tag">openapi ingest</div>
      <h3>wmcp.sh OpenAPI bridge</h3>
      <p>Drop any OpenAPI 3 spec URL and get every endpoint as MCP tools. Useful when the vendor publishes a spec but no MCP server.</p>
    </div>
  </div>
</section>

<!-- ========== CATEGORY: FINANCE / DEFI ========== -->
<section id="finance">
  <div class="section-label">Category</div>
  <h2>Finance & DeFi data.</h2>
  <p class="section-sub">Read-only price feeds, oracle data, on-chain analytics. Largely free upstream APIs surfaced as MCP.</p>
  <div class="grid">
    <div class="card us">
      <div class="tag">oracle</div>
      <h3>wmcp.sh price-data</h3>
      <p>Native adapters for CoinGecko, DefiLlama, Pyth, Chainlink, DexScreener. See <a href="/price-data" style="color:var(--accent2);text-decoration:none">/price-data</a>.</p>
    </div>
    <div class="card">
      <div class="tag">defi</div>
      <h3>DefiLlama MCP</h3>
      <p>Protocol TVL, pools, yields, stablecoins, ETF flows. wmcp.sh proxies the OAuth-gated tier transparently.</p>
    </div>
    <div class="card">
      <div class="tag">market data</div>
      <h3>CoinGecko MCP</h3>
      <p>Spot prices, market caps, trending pairs. Free tier is generous; paid tier for higher rate limits.</p>
    </div>
  </div>
</section>

<!-- ========== HOW TO USE ========== -->
<section id="howto">
  <div class="section-label">How to use any of these</div>
  <h2>Connect from your agent.</h2>
  <p class="section-sub">Most modern agents (Claude.ai, Cursor, LangChain via mcp-adapters, OpenAI Agents SDK via community adapters) accept a Streamable HTTP MCP endpoint. The pattern is identical for any server in this list:</p>
  <pre><code><span class="c"># Example: connect to a wmcp.sh-served MCP endpoint (no signup):</span>
<span class="k">curl</span> <span class="s">'${origin}/mcp/openapi?url=https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.json'</span>

<span class="c"># In Claude Desktop / Cursor config, add as a remote MCP server.</span>
<span class="c"># In LangChain, use langchain-mcp-adapters; in OpenAI Agents SDK, use a community MCP adapter.</span></code></pre>
</section>

<!-- ========== COMPARISON TABLE ========== -->
<section id="compare">
  <div class="section-label">Quick comparison</div>
  <h2>At-a-glance.</h2>
  <table>
    <thead>
      <tr><th>Server</th><th>Category</th><th>Runtime</th><th>Auth model</th></tr>
    </thead>
    <tbody>
      <tr><td><strong>wmcp.sh</strong></td><td>Meta-gateway</td><td>Edge (Cloudflare)</td><td>Anon free tier; OAuth-proxy for upstream</td></tr>
      <tr><td>Docker MCP Toolkit</td><td>Meta / local catalog</td><td>Local container</td><td>Per-image</td></tr>
      <tr><td>GitHub MCP</td><td>DevOps</td><td>Hosted + local options</td><td>OAuth / PAT</td></tr>
      <tr><td>Stripe MCP</td><td>Payments</td><td>Hosted</td><td>API key</td></tr>
      <tr><td>Linear MCP</td><td>Comms</td><td>Hosted</td><td>OAuth</td></tr>
      <tr><td>Slack MCP</td><td>Comms</td><td>Hosted / local</td><td>OAuth bot/user</td></tr>
      <tr><td>Postgres MCP</td><td>Database</td><td>Local stdio</td><td>Conn string</td></tr>
      <tr><td>Sentry MCP</td><td>Observability</td><td>Hosted</td><td>Token</td></tr>
      <tr><td>CoinGecko MCP</td><td>Market data</td><td>Hosted</td><td>API key (free tier)</td></tr>
      <tr><td>DefiLlama MCP</td><td>DeFi</td><td>Hosted</td><td>Free / OAuth tier via wmcp.sh proxy</td></tr>
    </tbody>
  </table>
  <p class="disclaim">Runtime + auth models reflect the typical/default deployment of each server per its vendor's public docs. Always confirm with the vendor before production use.</p>
</section>

<!-- ========== FAQ ========== -->
<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions.</h2>
  <details><summary>What is an MCP server?</summary><div class="answer">An endpoint that exposes tools, resources, and prompts to an AI agent over the Model Context Protocol wire format. Originated with Anthropic; widely adopted.</div></details>
  <details><summary>Difference between MCP server and OpenAPI?</summary><div class="answer">OpenAPI describes an HTTP API for SDK generators. MCP is a runtime wire protocol an agent speaks directly. wmcp.sh bridges the two.</div></details>
  <details><summary>Do I install these locally?</summary><div class="answer">Some are local stdio binaries (Postgres MCP, SQLite MCP). Others are hosted (Stripe MCP, GitHub MCP, wmcp.sh). Docker MCP Toolkit gives containerized local runs.</div></details>
  <details><summary>How do I pick the right MCP server?</summary><div class="answer">Vendor-official first. Community next. Use a meta-gateway like wmcp.sh for the long tail of APIs that don't have dedicated MCP servers.</div></details>
  <details><summary>What's a meta MCP server?</summary><div class="answer">A single MCP endpoint that proxies many upstream sources. wmcp.sh is one — one endpoint, dozens of upstreams (OpenAPI ingest, OAuth-proxy, shopper-side adapters, oracle data).</div></details>
</section>

<!-- ========== UPGRADE CTA ========== -->
<section id="upgrade" style="margin-top:36px;background:linear-gradient(135deg,var(--card),rgba(255,158,44,0.08));border:1px solid rgba(255,158,44,0.35);border-radius:16px;padding:22px 26px">
  <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;justify-content:space-between">
    <div style="flex:1;min-width:240px">
      <div style="font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent2);font-weight:700;margin-bottom:6px">Need this picked / built for you?</div>
      <h3 style="margin:0 0 4px;font-size:1.05rem;color:var(--text)">We'll pick the right MCP servers + wire them up.</h3>
      <p style="color:var(--muted);margin:0;font-size:.92rem">Hosted MCP at <code>mcp.yourbrand.com</code> + verified badge + tested agent flow. From <strong style="color:var(--text)">$499 one-time setup</strong>; Managed Retainer <strong style="color:var(--text)">$999/mo</strong>; Enterprise <strong style="color:var(--text)">$4,999+/mo</strong>.</p>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <a href="/managed" style="display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#ff9e2c,#ffcf7a);color:#0c0c14;padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:700;font-size:.9rem">See /managed →</a>
      <a href="/directory/submit" style="display:inline-flex;align-items:center;gap:6px;background:#11111c;border:1px solid #26263a;color:var(--text);padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:600;font-size:.9rem">Submit your server (free)</a>
    </div>
  </div>
</section>

<!-- ========== RELATED ========== -->
<section id="related">
  <div class="section-label">Related</div>
  <h2>More on the MCP landscape.</h2>
  <p class="section-sub">
    <a href="/roundup/agent-frameworks" style="color:var(--accent2);text-decoration:none">/roundup/agent-frameworks</a> &middot;
    <a href="/roundup/oauth-providers-mcp" style="color:var(--accent2);text-decoration:none">/roundup/oauth-providers-mcp</a> &middot;
    <a href="/vs/mcp-toolkit" style="color:var(--accent2);text-decoration:none">/vs/mcp-toolkit</a> &middot;
    <a href="/vs/anthropic-skills" style="color:var(--accent2);text-decoration:none">/vs/anthropic-skills</a> &middot;
    <a href="/directory" style="color:var(--accent2);text-decoration:none">/directory</a> &middot;
    <a href="/integration/openapi" style="color:var(--accent2);text-decoration:none">/integration/openapi</a>
  </p>
</section>

</div>

<footer>
  <a href="/">Home</a> · <a href="/agent-ready">Agent-ready</a> · <a href="/managed">Done for you</a> · <a href="/directory">Directory</a> · <a href="/directory/submit">Submit</a> · <a href="/blog">Blog</a> · <a href="/roundup/agent-frameworks">Frameworks roundup</a> · <a href="/roundup/oauth-providers-mcp">OAuth roundup</a>
</footer>

</body>
</html>`;
}
