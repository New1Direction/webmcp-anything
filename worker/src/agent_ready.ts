// agent_ready.ts — /agent-ready cornerstone SEO page.
//
// SERP target query family: "ai ready website", "make site ai ready",
// "agent economy", "ai agent ready", "agent commerce", "ai shopping
// integration", "claude agent website", "openai agents commerce".
//
// Strategy: be the canonical resource for the "how do I make my site
// work with AI agents" question. Position wmcp.sh as both the self-serve
// answer (free) AND the managed-service answer (paid via /managed).
//
// SERP analysis 2026-05-27: top results are blog posts and theoretical
// pieces with little actionable content. We win by being concrete:
// "here are the 5 things, here's how to ship them, here's the tool."

export function agentReadyHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>How to make your website AI-ready (and why it matters now) | wmcp.sh</title>
<meta name="description" content="The 5 reasons AI agents like Claude, ChatGPT, and Gemini can't read your website — and the 4-step fix. Concrete checklist, no fluff. Self-serve with wmcp.sh free, or have us do it for you." />
<link rel="canonical" href="${origin}/agent-ready" />
<meta property="og:title" content="Make your website AI-ready — wmcp.sh" />
<meta property="og:description" content="5 reasons agents can't see your site, and the 4-step fix. The new SEO is being agent-ready." />
<meta property="og:url" content="${origin}/agent-ready" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Make your website AI-ready" />
<meta name="twitter:description" content="The 5 reasons AI agents can't read your site + the 4-step fix." />
<meta name="twitter:image" content="${origin}/og.png" />
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "How to make your website AI-ready",
  "description": "The 5 reasons AI agents can't read your website and the 4-step fix.",
  "author": { "@type": "Organization", "name": "WebMCP Anything" },
  "publisher": { "@type": "Organization", "name": "WebMCP Anything", "url": "https://wmcp.sh" },
  "datePublished": "2026-05-27",
  "dateModified": "2026-05-27",
  "mainEntityOfPage": "${origin}/agent-ready"
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Why does being AI-ready matter now?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Anthropic, OpenAI, Google, and Cursor are shipping agents that browse, buy, book, and research on behalf of humans. By 2027 a meaningful percentage of e-commerce traffic will be agent-driven. Sites without structured data and an MCP endpoint are invisible to these agents — like sites without mobile-friendly markup were invisible to mobile-first search in 2014. The window to be early is now."
      }
    },
    {
      "@type": "Question",
      "name": "Is this just SEO with a new name?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. SEO optimizes for what a search crawler renders. AI-readiness optimizes for what an agent can act on — read structured data, call your APIs, execute transactions. SEO is read-only ranking. Agent-readiness is read + write + transact. Different stack, partially overlapping (both benefit from JSON-LD), but different goal."
      }
    },
    {
      "@type": "Question",
      "name": "What's the minimum to be agent-ready?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Three things: (1) JSON-LD Product schema on every product page, (2) a published OpenAPI spec if you have an API, (3) an MCP endpoint that exposes your site's actions (add-to-cart, search, book, etc.) as agent-callable tools. wmcp.sh can give you (3) for free by ingesting (1) or (2), with no code changes on your site."
      }
    },
    {
      "@type": "Question",
      "name": "What's WebMCP?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "WebMCP is the emerging standard for marking up web pages with agent-callable actions, similar to how JSON-LD marks up structured data. wmcp.sh's name comes from the fact that we expose any URL as a WebMCP-compatible tool schema, which the Model Context Protocol (MCP) clients (Claude.ai, Cursor, Codex, etc.) can directly consume."
      }
    },
    {
      "@type": "Question",
      "name": "Do I need both JSON-LD and an MCP server?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Strictly speaking no — but together they make agents far more reliable. JSON-LD lets agents READ your data (price, availability, reviews) without scraping. The MCP server lets agents ACT on your site (add to cart, submit forms, book). One without the other works partially; both make your site fully agent-native."
      }
    },
    {
      "@type": "Question",
      "name": "Will AI agents replace search?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Not replace — augment. People will still Google, but for transactional intent ('buy size 10 running shoes under $80'), agents are increasingly the interface. The 'top of funnel' moves from a search results page to an agent's tool call. If your site isn't a tool an agent can call, you don't appear in that funnel."
      }
    },
    {
      "@type": "Question",
      "name": "How do I check if my site is currently AI-readable?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Run: curl 'https://wmcp.sh/api/v1/tools?url=YOUR_SITE_URL'. If it returns tools, agents can already work with your site via wmcp.sh. If it returns 'no_tools_extracted', the page lacks structured data and doesn't match any of our adapter patterns — that's the work to do. The /managed service includes a free audit."
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
  h1 { font-size:clamp(2.2rem,5vw,3.4rem);margin:0 0 18px;background:linear-gradient(135deg,#fff 30%,var(--accent2) 100%);-webkit-background-clip:text;background-clip:text;color:transparent;line-height:1.05;font-weight:800;letter-spacing:-.025em; }
  .sub { color: var(--muted); font-size: 1.1rem; max-width: 720px; margin: 0 0 24px; }
  .hint { color: var(--dim); font-size: .85rem; margin-top: 8px; }
  section { padding: 36px 0; }
  .section-label { display:inline-block;font-size:.72rem;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--accent2);margin-bottom:10px; }
  h2 { font-size:clamp(1.5rem,3.2vw,2.1rem);margin:0 0 12px;font-weight:700;letter-spacing:-.02em; }
  h3 { font-size:1.1rem;margin:0 0 8px;font-weight:700; }
  .section-sub { color: var(--muted); max-width: 700px; margin: 0 0 24px; }
  pre { background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px 18px;overflow-x:auto;font-size:.82rem;color:var(--green);font-family:"SF Mono",Menlo,monospace;line-height:1.5;margin:14px 0; }
  pre .k { color: var(--accent2); } pre .s { color: var(--pink); } pre .c { color: var(--dim); }
  code { font-family: "SF Mono", Menlo, monospace; background: var(--bg2); padding: 1px 6px; border-radius: 4px; font-size: .85em; }
  .reason-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 22px 24px; margin-bottom: 16px; position: relative; }
  .reason-card .num { position: absolute; top: 18px; right: 22px; font-size: 2rem; font-weight: 800; color: var(--border); letter-spacing: -.04em; }
  .reason-card h3 { color: var(--text); padding-right: 50px; }
  .reason-card .verdict { color: var(--red); font-size: .85rem; margin-top: 6px; font-weight: 600; }
  .reason-card .fix { color: var(--muted); margin-top: 10px; font-size: .92rem; }
  .reason-card .fix strong { color: var(--green); }
  .fix-grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-top: 22px; }
  .fix-card { background: linear-gradient(180deg, var(--card), var(--bg2)); border: 1px solid var(--border); border-radius: 14px; padding: 20px; }
  .fix-card h3 { color: var(--accent2); }
  .fix-card .body { color: var(--muted); font-size: .9rem; margin: 8px 0 0; }
  .path-grid { display: grid; gap: 18px; grid-template-columns: 1fr 1fr; margin-top: 22px; }
  @media (max-width: 720px) { .path-grid { grid-template-columns: 1fr; } }
  .path { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 26px; display: flex; flex-direction: column; }
  .path.featured { background: linear-gradient(135deg, var(--card), rgba(124,92,255,.08)); border-color: var(--accent); }
  .path .price { color: var(--accent2); font-weight: 700; font-size: 1rem; margin-bottom: 6px; }
  .path h3 { font-size: 1.3rem; }
  .path .desc { color: var(--muted); font-size: .92rem; margin: 8px 0 16px; flex: 1; }
  .path ul { color: var(--muted); font-size: .9rem; line-height: 1.7; padding-left: 18px; margin: 0 0 18px; }
  .path .cta { display: inline-block; background: var(--accent); color: white; padding: 12px 22px; border-radius: 10px; text-decoration: none; font-weight: 700; text-align: center; font-size: .95rem; }
  .path.featured .cta { background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%); }
  .path.diy .cta { background: var(--bg2); color: var(--text); border: 1px solid var(--border); }
  table { width: 100%; border-collapse: collapse; text-align: left; font-size: .9rem; margin-top: 16px; }
  th, td { padding: 14px 16px; border-bottom: 1px solid var(--border); vertical-align: top; }
  th { background: var(--bg2); font-weight: 700; color: var(--accent2); }
  tr:last-child td { border-bottom: none; }
  td strong { color: var(--text); }
  details { background:var(--card);border:1px solid var(--border);border-radius:12px;padding:18px 20px;margin-bottom:12px; }
  details summary { font-weight: 700; font-size: 1rem; color: var(--text); cursor: pointer; list-style: none; }
  details[open] summary { margin-bottom: 12px; }
  details .answer { color: var(--muted); font-size: .92rem; line-height: 1.65; }
  .checklist { background: linear-gradient(135deg, rgba(74,222,128,.06), rgba(0,229,255,.04)); border: 1px solid rgba(74,222,128,.25); border-radius: 14px; padding: 26px; margin-top: 22px; }
  .checklist h3 { margin-top: 0; color: var(--green); }
  .checklist .row { display: flex; gap: 12px; padding: 8px 0; border-bottom: 1px dashed var(--border); font-size: .92rem; }
  .checklist .row:last-child { border-bottom: none; }
  .checklist .mark { color: var(--green); font-weight: 700; flex-shrink: 0; }
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
    <a href="/directory">Directory</a>
    <a href="https://github.com/New1Direction/webmcp-anything">GitHub</a>
  </div>
  <a class="cta" href="/dashboard">Dashboard →</a>
</nav>

<div class="wrap">

<header class="hero">
  <div class="badge"><span class="dot"></span> the new SEO &middot; for the agent economy</div>
  <h1>Make your website AI-ready.</h1>
  <p class="sub">Your site ranks on Google. Does it show up when someone asks Claude where to buy something? In 2026 a growing share of buying, booking, and researching is done by agents acting for humans. If agents can't read, query, or call your site, you don't exist in that funnel. Here's the diagnosis &mdash; and the fix.</p>
  <p class="hint">Concrete checklist, no fluff. Use the free tier of wmcp.sh to ship most of it in 10 minutes. Or have us do it for you &mdash; see <a href="/managed" style="color:var(--accent2);text-decoration:none">/managed</a>.</p>
</header>

<!-- ========== WHY NOW ========== -->
<section id="why">
  <div class="section-label">Timing</div>
  <h2>Why this matters in 2026, not 2028.</h2>
  <p class="section-sub">Three things shipped this year that flipped the equation: Claude's Computer Use, OpenAI's Operator/Agents API, and Cursor's autonomous mode. All three can drive a browser, call APIs, and execute purchases. Stripe reported &gt;$80M in agent-driven transactions in their first measured quarter. This is real volume, not a demo.</p>
  <p class="section-sub">"Agent commerce" / "agentic retail" is at the same point mobile commerce was in 2014: invisible to most operators, exploding for the ones who saw it coming. Making your site agent-ready now is the equivalent of adding <code>viewport meta</code> and responsive CSS then.</p>
</section>

<!-- ========== DIAGNOSIS ========== -->
<section id="diagnosis">
  <div class="section-label">Diagnosis</div>
  <h2>5 reasons agents can't read your site.</h2>
  <p class="section-sub">Pull up an agent (Claude, ChatGPT, Gemini, Cursor) and ask it to interact with your URL. If it fails, it's almost always one of these five.</p>

  <div class="reason-card">
    <span class="num">1</span>
    <h3>No structured data on product pages</h3>
    <p>Most sites render product info as HTML <em>only</em> &mdash; no <code>application/ld+json</code> block, no schema.org markup. Agents have to scrape, guess, or hallucinate the price, name, and availability.</p>
    <p class="verdict">→ Agent sees: a blob of text. Confidence: low.</p>
    <p class="fix"><strong>Fix:</strong> Add a JSON-LD <code>Product</code> + <code>Offer</code> block on every product page. Five lines of HTML. Shopify, BigCommerce, Magento, and most CMSes have a setting or plugin that ships this automatically.</p>
  </div>

  <div class="reason-card">
    <span class="num">2</span>
    <h3>No public API or OpenAPI spec</h3>
    <p>If you have an API, is it documented at a stable URL with an OpenAPI 3 spec? Probably not. Stripe, GitHub, Linear, Notion, Shopify all publish theirs. Most companies don't.</p>
    <p class="verdict">→ Agent sees: locked door. Cannot call programmatically.</p>
    <p class="fix"><strong>Fix:</strong> Publish your OpenAPI spec at a known URL (e.g. <code>/openapi.json</code>). Take 1 hour. wmcp.sh's <a href="/integration/openapi" style="color:var(--accent2);text-decoration:none">OpenAPI adapter</a> then auto-converts every operation into an MCP tool your customers' agents can call.</p>
  </div>

  <div class="reason-card">
    <span class="num">3</span>
    <h3>Cloudflare / bot protection blocks server-side fetches</h3>
    <p>Cloudflare Turnstile, PerimeterX, Akamai Bot Manager &mdash; defending against scrapers, but they also defend against legitimate AI agents. Even with perfect JSON-LD, the agent never reaches your page.</p>
    <p class="verdict">→ Agent sees: HTTP 403. No content extracted.</p>
    <p class="fix"><strong>Fix:</strong> Allowlist verified agent user-agents (Anthropic's <code>Claude-User</code>, OpenAI's <code>ChatGPT-User</code>) at the WAF level. Or expose key endpoints through a public read-only API that bypasses the WAF for known shapes.</p>
  </div>

  <div class="reason-card">
    <span class="num">4</span>
    <h3>JS-rendered pages with no static HTML</h3>
    <p>React/Vue SPAs that return <code>&lt;div id="root"&gt;&lt;/div&gt;</code> to anything that doesn't run JavaScript. Agents that fetch your URL see a blank shell, not your content.</p>
    <p class="verdict">→ Agent sees: empty document. Hydration required.</p>
    <p class="fix"><strong>Fix:</strong> Server-side render (Next.js, Remix, Astro), or use a hybrid renderer that pre-builds key routes (Vite SSG). At minimum, output a static <code>&lt;noscript&gt;</code> block with the essential product/article data + JSON-LD.</p>
  </div>

  <div class="reason-card">
    <span class="num">5</span>
    <h3>No MCP endpoint &mdash; agents can read but can't act</h3>
    <p>Reading is half the job. The other half is doing: add-to-cart, search, book, submit, subscribe. Without an MCP server exposing your site's actions as tools, agents are stuck in read-only mode &mdash; useful for research, useless for transactions.</p>
    <p class="verdict">→ Agent sees: data only. Cannot complete a task.</p>
    <p class="fix"><strong>Fix:</strong> Expose an MCP server. wmcp.sh's free tier does this automatically by ingesting your URL + structured data + OpenAPI spec, and serving the resulting tools at <code>${origin}/u/&lt;your-url-hash&gt;</code>.</p>
  </div>
</section>

<!-- ========== THE FIX ========== -->
<section id="fix">
  <div class="section-label">The fix</div>
  <h2>4 things, in this order.</h2>
  <p class="section-sub">If you ship these, agents can read and act on your site within hours.</p>

  <div class="fix-grid">
    <div class="fix-card">
      <h3>1. JSON-LD on every page</h3>
      <p class="body">Product, Offer, FAQPage, Article, BreadcrumbList. The schema.org vocabulary is the de-facto agent-readable format. Five lines per page type.</p>
    </div>
    <div class="fix-card">
      <h3>2. Publish your OpenAPI spec</h3>
      <p class="body">If you have an API: ship <code>/openapi.json</code> at a stable URL. wmcp.sh ingests it &mdash; every operation becomes an agent-callable tool with typed inputs.</p>
    </div>
    <div class="fix-card">
      <h3>3. Allowlist agents in your WAF</h3>
      <p class="body">Whitelist Anthropic <code>Claude-User</code> + OpenAI <code>ChatGPT-User</code> user-agents at the Cloudflare / firewall layer. Verified, low-volume, legitimate.</p>
    </div>
    <div class="fix-card">
      <h3>4. Expose an MCP server</h3>
      <p class="body">wmcp.sh does this for free if you have JSON-LD or an OpenAPI spec. No code on your site &mdash; agents point at <code>wmcp.sh/u/&lt;hash&gt;</code> and get your tools.</p>
    </div>
  </div>

  <div class="checklist">
    <h3>The 10-minute checklist</h3>
    <div class="row"><span class="mark">→</span><span>Open your product page in Chrome → View source → search for <code>application/ld+json</code>. If you see Product/Offer schema, you're good on #1.</span></div>
    <div class="row"><span class="mark">→</span><span>Curl your site with <code>User-Agent: ChatGPT-User</code>. If you get 200 + real HTML, your WAF isn't blocking. If you get 403, fix #3.</span></div>
    <div class="row"><span class="mark">→</span><span>Run <code>curl 'https://wmcp.sh/api/v1/tools?url=YOUR_PAGE_URL'</code>. If it returns tools, agents can already work with you. If it returns <code>no_tools_extracted</code>, your site needs #1 or #4.</span></div>
    <div class="row"><span class="mark">→</span><span>Check if you have an OpenAPI spec at <code>/openapi.json</code>, <code>/swagger.json</code>, or <code>/api-docs</code>. If yes → free win. If no → either ship one or skip #2.</span></div>
  </div>
</section>

<!-- ========== VERTICAL GUIDES ========== -->
<section id="verticals">
  <div class="section-label">Pick your stack</div>
  <h2>Vertical-specific guides.</h2>
  <p class="section-sub">The cornerstone above covers any site. These dig into the specific gotchas + checklists for each stack:</p>

  <div class="fix-grid">
    <a href="/agent-ready/shopify" class="fix-card" style="text-decoration:none;color:inherit;display:block">
      <h3>→ Shopify</h3>
      <p class="body">Variants, add-to-cart, inventory, Shopify Plus WAF. Most stores need zero code changes — wmcp.sh adapter works out of the box.</p>
    </a>
    <a href="/agent-ready/api" class="fix-card" style="text-decoration:none;color:inherit;display:block">
      <h3>→ API / SaaS APIs</h3>
      <p class="body">OpenAPI publishing, operation tagging, MCP-spec OAuth, agent-friendly rate limits. The 5 things API teams miss.</p>
    </a>
    <a href="/agent-ready/docs" class="fix-card" style="text-decoration:none;color:inherit;display:block">
      <h3>→ Documentation sites</h3>
      <p class="body">llms.txt template, code-example metadata, version signals, docs MCP servers. Mintlify / Docusaurus / Nextra compared.</p>
    </a>
    <a href="/agent-ready/saas" class="fix-card" style="text-decoration:none;color:inherit;display:block">
      <h3>→ SaaS founders / GTM</h3>
      <p class="body">Be recommendable when Claude picks tools for your buyer. Six non-technical moves any founder can ship in half a day.</p>
    </a>
  </div>
</section>

<!-- ========== TWO PATHS ========== -->
<section id="paths">
  <div class="section-label">Two ways forward</div>
  <h2>Ship it yourself, or have us do it.</h2>
  <p class="section-sub">Both paths end in the same place: agents like Claude / Cursor / Codex / OpenAI Agents can call your site's tools natively.</p>

  <div class="path-grid">
    <div class="path diy">
      <div class="price">Free · self-serve</div>
      <h3>Do it yourself</h3>
      <p class="desc">You ship JSON-LD + OpenAPI on your site. wmcp.sh exposes your URL as MCP tools, free, no signup. Works for product pages, blogs, documentation, public APIs.</p>
      <ul>
        <li>Drop your URL: <code>curl 'wmcp.sh/api/v1/tools?url=…'</code></li>
        <li>Get back agent-callable tools (Claude / OpenAI / MCP shapes)</li>
        <li>Free 100 reads/day. $29/mo Pro for 10k+/day.</li>
        <li>Use it as-is &mdash; no code changes on your site needed if you already have JSON-LD or OpenAPI</li>
      </ul>
      <a class="cta" href="/dashboard">Start free →</a>
    </div>

    <div class="path featured">
      <div class="price">$499+ &middot; done for you</div>
      <h3>We make your site agent-ready</h3>
      <p class="desc">JSON-LD audit, WebMCP markup on your top pages, OpenAPI spec from scratch if needed, custom MCP server hosted on your domain or ours, monitoring dashboard. 5-day turnaround for the starter package.</p>
      <ul>
        <li>Site audit + actionable report</li>
        <li>Schema.org markup deployed on 5-50 pages</li>
        <li>Custom adapter built if your stack is non-standard</li>
        <li>Submission to the wmcp.sh directory (SEO + agent discovery)</li>
        <li>Optional white-label MCP server at <code>mcp.yourbrand.com</code></li>
      </ul>
      <a class="cta" href="/managed">See packages →</a>
    </div>
  </div>
</section>

<!-- ========== POSITIONING ========== -->
<section id="vs">
  <div class="section-label">Where wmcp.sh fits</div>
  <h2>The plumbing for the agent economy.</h2>

  <table>
    <thead>
      <tr>
        <th>Approach</th>
        <th>What it costs</th>
        <th>Trade-off</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>DIY full custom MCP server</strong></td>
        <td>2-6 weeks of engineering</td>
        <td>Most control. Most maintenance. Most opportunity cost.</td>
      </tr>
      <tr>
        <td><strong>SaaS connectors</strong> (Composio, Zapier, Pipedream)</td>
        <td>$50-500/mo per team + per-customer auth</td>
        <td>Curated. Owner-side only. Your customers connect their accounts, not yours.</td>
      </tr>
      <tr>
        <td><strong>wmcp.sh self-serve</strong></td>
        <td>Free / $29 Pro / mo</td>
        <td>Auto-generated from your URL. Works for shopper-side use cases. Some non-standard sites won't be covered.</td>
      </tr>
      <tr>
        <td><strong>wmcp.sh managed</strong></td>
        <td>$499 setup / $999+ /mo</td>
        <td>Handles the long tail and custom integration. White-label option lets you publish under your own brand.</td>
      </tr>
    </tbody>
  </table>
</section>

<!-- ========== FAQ ========== -->
<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions.</h2>

  <details><summary>Why does being AI-ready matter NOW, not in two years?</summary>
  <div class="answer">Anthropic ships Claude Computer Use + agent runtimes, OpenAI ships Operator + Agents API, Cursor ships autonomous mode. All three drive browsers and call APIs to complete tasks. Stripe disclosed &gt;$80M in agent-driven transactions in their first measured quarter. The infrastructure exists, agent volume is increasing fast, and the operators who set up agent-readability now ride the wave when traffic shifts. The 2014-mobile parallel is precise: most companies didn't move until they saw competitors winning on it.</div>
  </details>

  <details><summary>Is this just SEO with a new name?</summary>
  <div class="answer">No. SEO optimizes for a crawler that wants to <em>render and rank</em> your content. Agent-readiness optimizes for an actor that wants to <em>read your data and call your actions</em>. SEO's output is a ranked link. Agent-readiness's output is a completed transaction or task. They share infrastructure (JSON-LD helps both) but the goal and behavior differ.</div>
  </details>

  <details><summary>What's the minimum to be agent-ready?</summary>
  <div class="answer">Three things: JSON-LD <code>Product</code> schema on product pages, a published OpenAPI spec if you have an API, and an MCP endpoint that exposes your actions as tools. wmcp.sh gives you the MCP endpoint for free as long as you have one of the first two.</div>
  </details>

  <details><summary>What's WebMCP?</summary>
  <div class="answer">An emerging standard for marking web pages with agent-callable actions, similar to how JSON-LD marks structured data. wmcp.sh's name reflects that it exposes any URL in a WebMCP-compatible shape that the Model Context Protocol (MCP) client ecosystem (Claude.ai, Cursor, Codex, OpenCode) can directly consume.</div>
  </details>

  <details><summary>Do I need both JSON-LD and an MCP server?</summary>
  <div class="answer">Strictly no, but together they make agents far more reliable. JSON-LD lets agents <em>read</em> your data (price, availability, reviews) without scraping. The MCP server lets agents <em>act</em> on your site (add to cart, submit forms, book). One without the other is partial; both make your site fully agent-native.</div>
  </details>

  <details><summary>How do I check if my site is currently agent-readable?</summary>
  <div class="answer">Run: <code>curl 'https://wmcp.sh/api/v1/tools?url=YOUR_SITE_URL'</code>. If tools come back, agents can already work with you via wmcp.sh. If you get <code>no_tools_extracted</code>, the page lacks structured data and no adapter matched &mdash; that's the work. <a href="/managed" style="color:var(--accent2);text-decoration:none">/managed</a> includes a free audit.</div>
  </details>

  <details><summary>Will AI agents replace search?</summary>
  <div class="answer">Not replace &mdash; augment. People will still Google. But for transactional intent ("buy size 10 running shoes under $80"), agents are increasingly the interface. The top of funnel moves from a search-results page to an agent's tool call. If your site isn't a tool an agent can call, you don't appear in that funnel.</div>
  </details>

  <details><summary>What if my site is behind Cloudflare Turnstile?</summary>
  <div class="answer">You're partly blocked from agent traffic. The fix: allowlist verified AI user-agents (<code>Claude-User</code>, <code>ChatGPT-User</code>) at the Cloudflare WAF rules level, OR expose a separate read-only public API that doesn't go through the Turnstile gate. Our <a href="/managed" style="color:var(--accent2);text-decoration:none">managed service</a> handles this configuration.</div>
  </details>

  <details><summary>I'm a SaaS founder, not e-commerce. Does this matter?</summary>
  <div class="answer">Yes &mdash; possibly more. Agents are buying SaaS subscriptions on behalf of teams (e.g. an agent comparing CRM tools and signing up for one). They're also pulling your docs into context when developers ask Claude / Cursor how to integrate. SaaS that ships a clean OpenAPI spec + structured docs + an MCP server gets recommended; SaaS without gets skipped.</div>
  </details>

  <details><summary>How long until agents are a meaningful share of my traffic?</summary>
  <div class="answer">For e-commerce: 12-24 months for 1-5% of conversions to be agent-mediated. For SaaS sign-ups: agents are already a measurable share in dev-tools and infrastructure. For research/docs: agents likely already pull from your site if you have any developer audience. The honest answer is "you can't measure agent traffic clearly today" because user-agents are often spoofed &mdash; which itself is a signal that agent-readability is undervalued right now.</div>
  </details>
</section>

<!-- ========== CTA ========== -->
<section id="cta">
  <div class="section-label">Ship it</div>
  <h2>Pick the path that fits this week.</h2>

  <div class="path-grid">
    <div class="path diy">
      <div class="price">Free · ~10 min</div>
      <h3>Try wmcp.sh now</h3>
      <p class="desc">Drop your URL, see what tools your site already exposes. Free, no signup for the first 100 reads.</p>
      <a class="cta" href="/dashboard">Open dashboard →</a>
    </div>

    <div class="path featured">
      <div class="price">$499+ · 5-day delivery</div>
      <h3>Book a free audit</h3>
      <p class="desc">We look at your site, identify what's missing, and quote a fixed price to get it shipped.</p>
      <a class="cta" href="/managed#contact">Get audit →</a>
    </div>
  </div>
</section>

<footer>
  <a href="/">Home</a> &middot; <a href="/agent-ready">Agent-ready</a> &middot; <a href="/managed">Done for you</a> &middot; <a href="/price-data">Price data</a> &middot; <a href="/integration/openapi">OpenAPI</a> &middot; <a href="/directory">Directory</a> &middot; <a href="https://github.com/New1Direction/webmcp-anything">GitHub</a>
</footer>

</div>
</body>
</html>`;
}
