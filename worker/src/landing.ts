export function landingHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<title>WebMCP Anything — Hosted MCP Server for any URL + Shopify storefronts</title>
<meta name="description" content="Hosted shopper-side MCP server. Turn any product URL or OpenAPI spec into agent-callable tools — Shopify storefronts, JSON-LD retailers, Claude Code, LangChain, OpenAI." />
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "WebMCP Anything",
  "url": "https://wmcp.sh",
  "description": "Hosted shopper-side MCP server that turns any URL into agent-callable tools."
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How does WebMCP differ from Shopify's AI Toolkit (dev-mcp)?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Shopify's dev-mcp is owner-side — it connects to the Shopify Admin API for store management and requires admin credentials. WebMCP is shopper-side — it runs on public storefronts using Shopify's storefront JSON, schema.org JSON-LD, or an LLM fallback, so AI shopping agents can fetch prices, list variants, and trigger add_to_cart without merchant credentials."
      }
    },
    {
      "@type": "Question",
      "name": "How does WebMCP differ from Composio?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Composio is an enterprise integration proxy for owner-side admin APIs. WebMCP is purpose-built for shopper-side transactional flows — product lookup, variant comparison, add_to_cart — and caches schemas in a shared global cache that serves under 100ms. WebMCP also supports OpenAPI ingestion: point it at any spec URL and you get an MCP tool list."
      }
    },
    {
      "@type": "Question",
      "name": "Can WebMCP turn an OpenAPI spec into MCP tools?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Hand any JSON OpenAPI 3.x or Swagger 2.0 spec URL to WebMCP and the adapter walks every paths × methods, resolves $refs against #/components/schemas/, and emits a fully typed tool list ready for Claude tool_use, OpenAI function-calling, or LangChain. Try it: curl 'https://wmcp.sh/api/v1/tools?url=https://petstore3.swagger.io/api/v3/openapi.json'."
      }
    },
    {
      "@type": "Question",
      "name": "Which AI agent frameworks does WebMCP work with?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Drop-in SDKs for Anthropic SDK (Claude tool_use), OpenAI (function-calling), LangChain (StructuredTool), and Vercel AI SDK. Python: pip install wmcp. JavaScript/TypeScript: npm install @wmcp/sdk. Anything else that consumes MCP-shaped tools — Cursor, Cline, Claude Code, Gemini CLI — works directly with the public REST API."
      }
    }
  ]
}
</script>
<meta property="og:title" content="WebMCP Anything — Hosted MCP Server for any URL" />
<meta property="og:description" content="Shopper-side MCP server. Turn any product URL or OpenAPI spec into agent-callable tools. Works with Claude, OpenAI, LangChain." />
<meta property="og:url" content="https://wmcp.sh" />
<meta property="og:image" content="https://wmcp.sh/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="WebMCP Anything — Hosted MCP Server for any URL" />
<meta name="twitter:description" content="Shopper-side MCP server. Turn any product URL or OpenAPI spec into agent-callable tools. Works with Claude, OpenAI, LangChain." />
<meta name="twitter:image" content="https://wmcp.sh/og.png" />
<style>
  :root {
    --bg: #07070d; --card: #16161f; --bg2: #11111c; --border: #26263a;
    --text: #ececf5; --muted: #8a8aa8; --dim: #6a6a88;
    --accent: #7c5cff; --accent2: #00e5ff; --green: #4ade80; --red: #f87171;
    --pink: #f0abfc;
  }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    margin: 0; min-height: 100vh; color: var(--text); background: var(--bg);
    font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
    line-height: 1.6;
    background-image:
      radial-gradient(ellipse 900px 600px at 10% -5%, rgba(124,92,255,.20), transparent 60%),
      radial-gradient(ellipse 700px 500px at 95% 10%, rgba(0,229,255,.12), transparent 60%),
      radial-gradient(ellipse 600px 400px at 50% 110%, rgba(240,171,252,.06), transparent 60%);
  }
  .wrap { max-width: 1080px; margin: 0 auto; padding: 0 24px; }

  /* ---- nav ---- */
  nav {
    display: flex; justify-content: space-between; align-items: center;
    padding: 22px 24px; max-width: 1080px; margin: 0 auto;
  }
  nav .brand { font-weight: 800; letter-spacing: -.02em; font-size: 1.05rem; }
  nav .brand span { color: var(--accent2); }
  nav .links { display: flex; gap: 22px; font-size: .9rem; }
  nav .links a {
    color: var(--muted); text-decoration: none; transition: color .15s;
  }
  nav .links a:hover { color: var(--text); }
  nav .cta {
    background: var(--bg2); border: 1px solid var(--border);
    padding: 7px 14px; border-radius: 8px; font-size: .85rem;
    color: var(--text); text-decoration: none; font-weight: 600;
  }
  nav .cta:hover { border-color: var(--accent); }

  /* ---- hero ---- */
  .hero {
    display: grid; grid-template-columns: 1.1fr .9fr; gap: 48px;
    align-items: center; padding: 50px 0 70px;
  }
  .hero-text .badge {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 6px 14px; border-radius: 999px; font-size: .7rem;
    letter-spacing: .15em; text-transform: uppercase; font-weight: 700;
    background: linear-gradient(90deg, rgba(124,92,255,.18), rgba(0,229,255,.18));
    border: 1px solid rgba(124,92,255,.35); margin-bottom: 22px;
  }
  .dot { width: 6px; height: 6px; background: var(--accent2); border-radius: 50%;
    box-shadow: 0 0 8px var(--accent2); animation: pulse 2s infinite; }
  @keyframes pulse { 50% { opacity: .3 } }
  h1 {
    font-size: clamp(2.2rem, 5vw, 3.6rem); margin: 0 0 18px;
    background: linear-gradient(135deg, #fff 25%, var(--accent2) 100%);
    -webkit-background-clip: text; background-clip: text; color: transparent;
    line-height: 1.04; font-weight: 800; letter-spacing: -.02em;
  }
  h1 .accent { background: linear-gradient(135deg, var(--accent), var(--pink));
    -webkit-background-clip: text; background-clip: text; color: transparent; }
  .sub { color: var(--muted); font-size: 1.08rem; max-width: 460px; margin: 0 0 28px; }
  .hero-ctas { display: flex; gap: 12px; margin-bottom: 18px; }
  .btn-primary, .btn-secondary {
    display: inline-flex; align-items: center; gap: 8px; cursor: pointer;
    padding: 13px 22px; border-radius: 10px; font-weight: 700;
    text-decoration: none; font-size: .92rem; font-family: inherit;
    transition: transform .1s, box-shadow .2s; border: none;
  }
  .btn-primary {
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    color: white; box-shadow: 0 6px 24px rgba(124,92,255,.25);
  }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 10px 30px rgba(124,92,255,.35); }
  .btn-secondary {
    background: var(--bg2); color: var(--text); border: 1px solid var(--border);
  }
  .btn-secondary:hover { border-color: var(--accent); }
  .hero-stat { color: var(--dim); font-size: .82rem; margin-top: 4px; }
  .hero-stat #cache-stat { color: var(--accent2); font-weight: 700; }

  /* ---- hero terminal ---- */
  .hero-3d { position: relative; max-width: 500px; margin: 0 auto; width: 100%; }
  .hero-3d::before {
    content: ""; position: absolute; inset: -16% -8%; z-index: -1; pointer-events: none;
    background: radial-gradient(circle at 60% 40%, rgba(124,92,255,.28), transparent 62%);
    filter: blur(46px);
  }
  .term {
    position: relative; background: linear-gradient(180deg, #0d0d18, #090911);
    border: 1px solid var(--border); border-radius: 14px; overflow: hidden;
    font-family: "SF Mono", Menlo, monospace;
    box-shadow: 0 32px 70px -24px rgba(124,92,255,.45), inset 0 1px 0 rgba(255,255,255,.05);
  }
  .term-bar {
    display: flex; align-items: center; gap: 7px; padding: 11px 14px;
    border-bottom: 1px solid var(--border); background: rgba(255,255,255,.025);
  }
  .term-bar .d { width: 11px; height: 11px; border-radius: 50%; }
  .term-bar .d.r { background: #ff5f57; } .term-bar .d.y { background: #febc2e; } .term-bar .d.g { background: #28c840; }
  .term-bar .t { margin-left: 8px; color: var(--dim); font-size: .76rem; letter-spacing: .02em; }
  .term-body {
    padding: 18px; font-size: .8rem; line-height: 1.85;
    white-space: pre; overflow-x: auto; color: var(--muted);
  }
  .term-body .pn { color: var(--dim); }
  .term-body .cmd { color: var(--text); font-weight: 600; }
  .term-body .ar { color: var(--accent2); }
  .term-body .tn { color: var(--pink); }
  .term-body .lv { color: var(--accent); font-weight: 700; }
  .term-body .ok { color: var(--green); }
  .term-cur { display: inline-block; width: 7px; height: .95em; background: var(--accent2);
    vertical-align: -1px; margin-left: 2px; animation: pulse 1.1s steps(2) infinite; }

  /* ---- demo ---- */
  section { padding: 60px 0; }
  .section-label {
    display: inline-block; font-size: .72rem; font-weight: 700;
    letter-spacing: .15em; text-transform: uppercase;
    color: var(--accent2); margin-bottom: 10px;
  }
  .section-h2 {
    font-size: clamp(1.6rem, 3vw, 2.2rem); margin: 0 0 14px; font-weight: 700;
    letter-spacing: -.02em;
  }
  .section-sub { color: var(--muted); max-width: 600px; margin: 0 0 36px; }

  .demo-box {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 20px; padding: 26px;
  }
  .row { display: flex; gap: 8px; flex-wrap: wrap; }
  input[type=text], input[type=url] {
    flex: 1; min-width: 240px; background: var(--bg2); border: 1px solid var(--border);
    color: var(--text); border-radius: 10px; padding: 13px 16px;
    font-family: "SF Mono", Menlo, monospace; font-size: .9rem;
  }
  input:focus { outline: none; border-color: var(--accent); }
  button.go {
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    color: white; border: none; border-radius: 10px;
    padding: 13px 22px; font-weight: 700; cursor: pointer; font-family: inherit;
    transition: transform .1s;
  }
  button.go:hover { transform: scale(1.02); }
  button.go:disabled { opacity: .5; cursor: wait; }
  .chips { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 14px; }
  .chip {
    background: var(--bg2); border: 1px solid var(--border);
    padding: 6px 12px; border-radius: 999px; font-size: .78rem;
    color: var(--muted); cursor: pointer; transition: all .15s;
  }
  .chip:hover { color: var(--text); border-color: var(--accent); }
  pre {
    margin: 18px 0 0; background: var(--bg); border: 1px solid var(--border);
    border-radius: 12px; padding: 18px; overflow-x: auto;
    font-size: .82rem; color: var(--green); min-height: 180px;
    font-family: "SF Mono", Menlo, monospace; line-height: 1.5;
  }
  pre .k { color: var(--accent2); } pre .s { color: var(--pink); } pre .c { color: var(--dim); }

  /* ---- agent demo ---- */
  .agent {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 20px; padding: 30px;
    display: grid; grid-template-columns: 1fr 1fr; gap: 26px;
    align-items: stretch;
  }
  .chat-window {
    background: var(--bg2); border: 1px solid var(--border);
    border-radius: 14px; padding: 18px; display: flex; flex-direction: column; gap: 12px;
    min-height: 260px;
  }
  .msg {
    padding: 10px 14px; border-radius: 12px; font-size: .9rem;
    max-width: 85%; line-height: 1.5;
    opacity: 0; transform: translateY(6px);
    animation: msgIn .4s forwards;
  }
  @keyframes msgIn { to { opacity: 1; transform: none; } }
  .msg.user { align-self: flex-end; background: rgba(124,92,255,.18); border: 1px solid rgba(124,92,255,.35); }
  .msg.agent { align-self: flex-start; background: var(--bg); border: 1px solid var(--border); }
  .msg.tool {
    align-self: flex-start; background: var(--bg); border: 1px dashed rgba(0,229,255,.35);
    font-family: "SF Mono", Menlo, monospace; font-size: .78rem; color: var(--accent2);
  }
  .msg .tag {
    display: inline-block; font-size: .65rem; font-weight: 700;
    letter-spacing: .1em; text-transform: uppercase; color: var(--dim);
    margin-right: 8px;
  }
  .agent-side h3 { margin: 0 0 8px; font-size: 1.15rem; }
  .agent-side p { color: var(--muted); margin: 0 0 14px; font-size: .92rem; }
  .agent-side ul { color: var(--muted); padding-left: 18px; margin: 0; font-size: .9rem; line-height: 1.85; }
  .agent-side ul li::marker { color: var(--accent2); }
  .agent-side code { color: var(--accent2); background: var(--bg); padding: 1px 6px; border-radius: 4px; font-size: .8rem; }

  /* ---- code snippets / tabs ---- */
  .tabs-wrap {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 16px; overflow: hidden;
  }
  .tabs {
    display: flex; gap: 0; border-bottom: 1px solid var(--border); background: var(--bg2);
    overflow-x: auto;
  }
  .tab {
    background: transparent; border: none; color: var(--muted);
    padding: 14px 20px; cursor: pointer; font-family: inherit; font-weight: 600;
    font-size: .88rem; border-bottom: 2px solid transparent;
    transition: all .15s; white-space: nowrap;
  }
  .tab:hover { color: var(--text); }
  .tab.on { color: var(--text); border-bottom-color: var(--accent2); }
  .tab-body { padding: 22px; }
  .tab-body pre { margin: 0; min-height: auto; }

  /* ---- pricing ---- */
  .plans {
    display: grid; gap: 16px;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }
  .plan {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 18px; padding: 26px;
    display: flex; flex-direction: column;
    transition: all .15s;
  }
  .plan:hover { border-color: var(--accent); transform: translateY(-2px); }
  .plan.featured {
    background: linear-gradient(135deg, var(--card), rgba(124,92,255,.08));
    border-color: var(--accent);
    position: relative;
  }
  .plan.featured::before {
    content: "Most popular"; position: absolute; top: -10px; right: 18px;
    background: linear-gradient(135deg, var(--accent), var(--accent2)); color: white;
    font-size: .65rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
    padding: 4px 10px; border-radius: 999px;
  }
  .plan h3 { margin: 0; font-size: 1.1rem; }
  .plan .price { font-size: 2.2rem; font-weight: 800; margin: 10px 0 6px; letter-spacing: -.02em; }
  .plan .price small { font-size: .9rem; color: var(--muted); font-weight: 500; }
  .plan ul { padding-left: 18px; color: var(--muted); margin: 14px 0; font-size: .9rem; line-height: 1.85; flex: 1; }
  .plan ul li::marker { color: var(--accent2); }
  .plan .pick {
    display: block; text-align: center; text-decoration: none;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    color: white; padding: 11px; border-radius: 10px; font-weight: 700;
  }
  .plan .pick.muted-btn {
    background: var(--bg2); color: var(--muted); border: 1px solid var(--border);
  }

  /* ---- flywheel ---- */
  .flywheel {
    display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center;
  }
  .flywheel-3d {
    position: relative; aspect-ratio: 1; max-width: 380px; margin: 0 auto;
    display: flex; align-items: center; justify-content: center;
  }
  .flywheel-3d .rings {
    position: relative; width: 80%; height: 80%;
  }
  .flywheel-3d .ring {
    position: absolute; border-radius: 50%; border: 1px solid;
  }
  .flywheel-3d .ring.r1 {
    inset: 0; border-color: rgba(124,92,255,.75);
    animation: rot 30s linear infinite;
    background: radial-gradient(circle at 30% 30%, rgba(124,92,255,.18), transparent 60%);
    box-shadow: 0 0 30px -6px rgba(124,92,255,.5);
  }
  .flywheel-3d .ring.r2 {
    inset: 15%; border-color: rgba(0,229,255,.8);
    animation: rot 18s linear infinite reverse;
    background: radial-gradient(circle at 70% 40%, rgba(0,229,255,.2), transparent 60%);
    box-shadow: 0 0 30px -6px rgba(0,229,255,.5);
  }
  .flywheel-3d .ring.r3 {
    inset: 30%; border-color: rgba(240,171,252,.8);
    animation: rot 10s linear infinite;
    background: radial-gradient(circle at 50% 70%, rgba(240,171,252,.2), transparent 60%);
    box-shadow: 0 0 30px -6px rgba(240,171,252,.5);
  }
  .flywheel-3d .ring::before {
    content: ""; position: absolute; width: 10px; height: 10px;
    background: currentColor; border-radius: 50%; top: -5px; left: 50%;
    box-shadow: 0 0 12px currentColor;
  }
  .flywheel-3d .ring.r1::before { color: var(--accent); }
  .flywheel-3d .ring.r2::before { color: var(--accent2); }
  .flywheel-3d .ring.r3::before { color: var(--pink); }
  @keyframes rot { to { transform: rotate(360deg); } }
  .flywheel-text ol { padding-left: 22px; color: var(--muted); line-height: 1.85; font-size: .95rem; }
  .flywheel-text ol li::marker { color: var(--accent2); font-weight: 700; }
  .flywheel-text strong { color: var(--text); }

  /* ---- ascii constellation globe (network-effect viz) ---- */
  .globe-scope {
    position: relative; max-width: 440px; width: 100%; margin: 0 auto;
    background: linear-gradient(180deg, #0d0d18, #090911);
    border: 1px solid var(--border); border-radius: 14px; overflow: hidden;
    box-shadow: 0 24px 60px -28px rgba(0,229,255,.35), inset 0 1px 0 rgba(255,255,255,.04);
  }
  .globe-bar { display: flex; align-items: center; gap: 7px; padding: 10px 13px;
    border-bottom: 1px solid var(--border); background: rgba(255,255,255,.02); }
  .globe-bar .gd { width: 10px; height: 10px; border-radius: 50%; }
  .globe-bar .r { background: #ff5f57; } .globe-bar .y { background: #febc2e; } .globe-bar .g { background: #28c840; }
  .globe-bar .gt { margin-left: 8px; color: var(--dim); font-size: .72rem; font-family: "SF Mono", Menlo, monospace; }
  #globe { margin: 0; padding: 14px 8px 16px; font-family: "SF Mono", Menlo, monospace;
    font-size: 10px; line-height: 10px; color: var(--accent2);
    text-shadow: 0 0 6px rgba(0,229,255,.4); white-space: pre; text-align: center; min-height: 330px; }

  /* ---- about ---- */
  .about {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 18px; padding: 28px;
    display: flex; gap: 18px; align-items: flex-start;
  }
  .about-avatar {
    width: 52px; height: 52px; border-radius: 50%; flex-shrink: 0;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    display: grid; place-items: center; font-weight: 800; font-size: 1.2rem; color: white;
  }
  .about-body { flex: 1; }
  .about-body p { margin: 0 0 8px; }
  .about-body a { color: var(--accent2); text-decoration: none; font-weight: 600; }
  .about-body a:hover { text-decoration: underline; }

  /* ---- footer ---- */
  footer {
    border-top: 1px solid var(--border); margin-top: 40px;
    padding: 30px 0; text-align: center; color: var(--muted); font-size: .85rem;
  }
  footer a { color: var(--accent2); text-decoration: none; margin: 0 8px; }
  footer a:hover { text-decoration: underline; }

  /* ---- responsive ---- */
  @media (max-width: 820px) {
    .hero { grid-template-columns: 1fr; gap: 30px; padding: 30px 0 40px; text-align: center; }
    .hero-text .badge { margin: 0 auto 18px; }
    .sub, .hero-ctas { margin-left: auto; margin-right: auto; justify-content: center; }
    .agent { grid-template-columns: 1fr; }
    .flywheel { grid-template-columns: 1fr; gap: 24px; }
    nav .links { display: none; }
  }
</style>
</head>
<body>

<nav>
  <div class="brand">wmcp<span>.sh</span></div>
  <div class="links">
    <a href="#demo">Demo</a>
    <a href="/integration/shopify">Shopify</a>
    <a href="/integration/openapi">OpenAPI</a>
    <a href="/integration/stripe">Stripe</a>
    <a href="#pricing">Pricing</a>
    <a href="#faq">FAQ</a>
    <a href="/directory">Directory</a>
    <a href="https://github.com/New1Direction/webmcp-anything">GitHub</a>
  </div>
  <a class="cta" href="/dashboard">Dashboard →</a>
</nav>

<div class="wrap">

<!-- ========== HERO ========== -->
<section class="hero">
  <div class="hero-text">
    <div class="badge"><span class="dot"></span> live · real MCP server</div>
    <h1>Turn any URL into<br/><span class="accent">agent-callable tools.</span></h1>
    <p class="sub">A real, hosted MCP server. Paste any URL to get agent-callable tools — or connect it to <strong style="color:var(--text)">Claude, Cursor, and Codex in one line</strong>. Shopify, OpenAPI, JSON-LD, and growing. Open-source adapters.</p>
    <div class="hero-ctas">
      <a class="btn-primary" href="#demo">⚡ Try the demo</a>
      <a class="btn-secondary" href="https://github.com/New1Direction/webmcp-anything" target="_blank">★ GitHub</a>
    </div>
    <div class="hero-stat">
      <span id="cache-stat">·</span> <span>URLs cached by the community · grows with every install</span>
    </div>
  </div>
  <div class="hero-3d">
    <div class="term">
      <div class="term-bar"><span class="d r"></span><span class="d y"></span><span class="d g"></span><span class="t">claude · cursor · codex — mcp</span></div>
      <div class="term-body"><span class="pn">$</span> <span class="cmd">connect</span> wmcp.sh/mcp/u/&lt;any-url&gt;
<span class="ar">→ initialize</span>   <span class="pn">protocol 2025-06-18 ✓</span>
<span class="ar">→ tools/list</span>
   <span class="tn">get_price</span>       <span class="pn">static</span>
   <span class="tn">list_variants</span>   <span class="pn">static</span>
   <span class="tn">add_to_cart</span>     <span class="lv">live</span>
<span class="ar">→ tools/call</span> add_to_cart <span class="pn">{ variant: 41 }</span>
   <span class="ok">✓ added — cart total $98</span><span class="term-cur"></span></div>
    </div>
  </div>
</section>

<!-- ========== LIVE DEMO ========== -->
<section id="demo">
  <div class="section-label">Live demo</div>
  <h2 class="section-h2">Paste a URL, get the tools.</h2>
  <p class="section-sub">No signup. No key. Free tier handles 100 reads/day per IP.</p>
  <div class="demo-box">
    <div class="row">
      <input id="u" type="url" placeholder="https://www.allbirds.com/products/mens-wool-runners" />
      <button class="go" id="go">⚡ Get tools</button>
    </div>
    <div class="chips">
      <span style="color:var(--muted);font-size:.78rem;align-self:center">try:</span>
      <span class="chip" data-u="https://www.allbirds.com/products/mens-wool-runners">allbirds (shopify)</span>
      <span class="chip" data-u="https://www.everlane.com/products/mens-organic-cotton-crew-tee-white">everlane (shopify)</span>
      <span class="chip" data-u="https://outdoorvoices.com/products/exercise-dress">outdoor voices (jsonld)</span>
    </div>
    <pre id="out"><span class="c">// Paste a URL and click Get tools.</span></pre>
  </div>
</section>

<!-- ========== POSITIONING / COMPARISON ========== -->
<section id="comparison">
  <div class="section-label">Positioning</div>
  <h2 class="section-h2">Shopper-side MCP vs. owner-side admin tools.</h2>
  <p class="section-sub">Most existing "AI for e-commerce" tools target the merchant. wmcp.sh targets the shopper — public storefronts, no admin credentials, every store.</p>

  <div style="overflow-x:auto;margin-top:24px;border:1px solid var(--border);border-radius:14px;background:var(--card)">
    <table style="width:100%;border-collapse:collapse;text-align:left;font-size:.9rem">
      <thead>
        <tr>
          <th style="padding:14px 18px;border-bottom:1px solid var(--border);background:var(--bg2);font-weight:700;color:var(--accent2)">Capability</th>
          <th style="padding:14px 18px;border-bottom:1px solid var(--border);background:var(--bg2);font-weight:700;color:var(--accent2)">Shopify dev-mcp</th>
          <th style="padding:14px 18px;border-bottom:1px solid var(--border);background:var(--bg2);font-weight:700;color:var(--accent2)">Composio</th>
          <th style="padding:14px 18px;border-bottom:1px solid var(--border);background:var(--bg2);font-weight:700;color:var(--accent2)">wmcp.sh</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding:14px 18px;border-bottom:1px solid var(--border)"><strong style="color:var(--text)">Built for</strong></td>
          <td style="padding:14px 18px;border-bottom:1px solid var(--border);color:var(--muted)">Merchants &amp; devs (owner)</td>
          <td style="padding:14px 18px;border-bottom:1px solid var(--border);color:var(--muted)">Enterprise integrations (owner)</td>
          <td style="padding:14px 18px;border-bottom:1px solid var(--border)"><strong style="color:var(--text)">AI shopping agents (shopper)</strong></td>
        </tr>
        <tr>
          <td style="padding:14px 18px;border-bottom:1px solid var(--border)"><strong style="color:var(--text)">API surface</strong></td>
          <td style="padding:14px 18px;border-bottom:1px solid var(--border);color:var(--muted)">Admin API + GraphQL</td>
          <td style="padding:14px 18px;border-bottom:1px solid var(--border);color:var(--muted)">Admin APIs + webhooks</td>
          <td style="padding:14px 18px;border-bottom:1px solid var(--border)"><strong style="color:var(--text)">Storefront + JSON-LD + LLM</strong></td>
        </tr>
        <tr>
          <td style="padding:14px 18px;border-bottom:1px solid var(--border)"><strong style="color:var(--text)">Auth required</strong></td>
          <td style="padding:14px 18px;border-bottom:1px solid var(--border);color:var(--muted)">Yes — admin token</td>
          <td style="padding:14px 18px;border-bottom:1px solid var(--border);color:var(--muted)">Yes — OAuth / API key</td>
          <td style="padding:14px 18px;border-bottom:1px solid var(--border)"><strong style="color:var(--green)">No — public endpoints</strong></td>
        </tr>
        <tr>
          <td style="padding:14px 18px;border-bottom:1px solid var(--border)"><strong style="color:var(--text)">Stores covered</strong></td>
          <td style="padding:14px 18px;border-bottom:1px solid var(--border);color:var(--muted)">The one you connect</td>
          <td style="padding:14px 18px;border-bottom:1px solid var(--border);color:var(--muted)">Each user connects each one</td>
          <td style="padding:14px 18px;border-bottom:1px solid var(--border)"><strong style="color:var(--text)">All 4M+ Shopify stores + JSON-LD retailers</strong></td>
        </tr>
        <tr>
          <td style="padding:14px 18px;border-bottom:1px solid var(--border)"><strong style="color:var(--text)">Transactional tools</strong></td>
          <td style="padding:14px 18px;border-bottom:1px solid var(--border);color:var(--muted)">Docs + schema lookup</td>
          <td style="padding:14px 18px;border-bottom:1px solid var(--border);color:var(--muted)">CRUD on the store you own</td>
          <td style="padding:14px 18px;border-bottom:1px solid var(--border)"><strong style="color:var(--text)">get_price · check_stock · add_to_cart</strong></td>
        </tr>
        <tr>
          <td style="padding:14px 18px;border-bottom:1px solid var(--border)"><strong style="color:var(--text)">OpenAPI &rarr; tools</strong></td>
          <td style="padding:14px 18px;border-bottom:1px solid var(--border);color:var(--red)">✗</td>
          <td style="padding:14px 18px;border-bottom:1px solid var(--border);color:var(--muted)">Partial</td>
          <td style="padding:14px 18px;border-bottom:1px solid var(--border)"><strong style="color:var(--green)">✓ any 3.x / Swagger 2.0 spec</strong></td>
        </tr>
        <tr>
          <td style="padding:14px 18px"><strong style="color:var(--text)">Cache</strong></td>
          <td style="padding:14px 18px;color:var(--muted)">Per-store realtime</td>
          <td style="padding:14px 18px;color:var(--muted)">Proxy latency</td>
          <td style="padding:14px 18px"><strong style="color:var(--text)">Shared global · &lt;100ms hits</strong></td>
        </tr>
      </tbody>
    </table>
  </div>
</section>

<!-- ========== AGENT DEMO ========== -->
<section id="agent">
  <div class="section-label">In the loop</div>
  <h2 class="section-h2">What it looks like from your agent's side.</h2>
  <p class="section-sub">An LLM gets the tools, decides which to call, and the call returns real data. That's the whole loop — no per-site adapter code in your app.</p>
  <div class="agent">
    <div class="chat-window" id="chat"></div>
    <div class="agent-side">
      <h3>Drop-in for any agent framework.</h3>
      <p>The schema is MCP-shaped, so your agent doesn't care whether it's Shopify or JSON-LD under the hood. You ship the URL — wmcp.sh ships the tools.</p>
      <ul>
        <li><strong>Static tools</strong> like <code>get_price</code> return immediately</li>
        <li><strong>Live actions</strong> like <code>add_to_cart</code> hit real endpoints</li>
        <li>Cached schemas serve in under <strong>100ms</strong></li>
        <li>Headers tell you your remaining quota</li>
      </ul>
    </div>
  </div>
</section>

<!-- ========== CODE SNIPPETS ========== -->
<section id="code">
  <div class="section-label">Integrate</div>
  <h2 class="section-h2">One line of config — or three lines of code.</h2>
  <p class="section-sub">Connect wmcp.sh as a native MCP server, or call the REST API from any framework. Copy. Done.</p>

  <div class="tabs-wrap">
    <div class="tabs">
      <button class="tab on" data-tab="mcp">MCP · Claude/Cursor</button>
      <button class="tab" data-tab="curl">cURL</button>
      <button class="tab" data-tab="js">JavaScript</button>
      <button class="tab" data-tab="claude">Claude tool_use</button>
      <button class="tab" data-tab="langchain">LangChain</button>
      <button class="tab" data-tab="openai">OpenAI</button>
    </div>
    <div class="tab-body">
      <pre data-body="mcp"><span class="c">// wmcp.sh is a real MCP server — add it to Claude Code / Cursor / Codex / VS Code.</span>
{
  <span class="s">"mcpServers"</span>: {
    <span class="s">"wmcp"</span>: {
      <span class="s">"type"</span>: <span class="s">"http"</span>,
      <span class="s">"url"</span>: <span class="s">"${origin}/mcp/u/&lt;base64url-of-your-url&gt;"</span>
    }
  }
}
<span class="c">// One site → /mcp/u/&lt;b64url&gt;   ·   compose many → /mcp/url?url=a&amp;url=b</span>
<span class="c">// tools/list is free; live tools/call uses your Bearer key.</span></pre>
      <pre data-body="curl" style="display:none"><span class="k">curl</span> <span class="s">'${origin}/api/v1/tools?url=https://www.allbirds.com/products/mens-wool-runners'</span></pre>
      <pre data-body="js" style="display:none"><span class="c">// Plain fetch — works everywhere.</span>
<span class="k">const</span> r = <span class="k">await</span> fetch(
  <span class="s">\`${origin}/api/v1/tools?url=\${encodeURIComponent(url)}\`</span>,
  { headers: { authorization: <span class="s">\`Bearer \${API_KEY}\`</span> } }
);
<span class="k">const</span> { tools } = <span class="k">await</span> r.json();</pre>
      <pre data-body="claude" style="display:none"><span class="c">// Pass wmcp tools straight into Anthropic SDK.</span>
<span class="k">const</span> tools = (<span class="k">await</span> fetch(<span class="s">\`${origin}/api/v1/tools?url=\${url}\`</span>).then(r =&gt; r.json())).tools;
<span class="k">const</span> msg = <span class="k">await</span> anthropic.messages.create({
  model: <span class="s">"claude-opus-4-8"</span>,
  tools: tools.map(t =&gt; ({
    name: t.name,
    description: t.description,
    input_schema: t.inputSchema || { type: <span class="s">"object"</span> }
  })),
  messages: [{ role: <span class="s">"user"</span>, content: <span class="s">"Add the size 10 to my cart."</span> }]
});</pre>
      <pre data-body="langchain" style="display:none"><span class="c"># LangChain — wrap each wmcp tool as a StructuredTool.</span>
<span class="k">from</span> langchain.tools <span class="k">import</span> StructuredTool
<span class="k">import</span> requests

data = requests.get(<span class="s">f"${origin}/api/v1/tools?url={url}"</span>).json()
tools = [
  StructuredTool.from_function(
    func=<span class="k">lambda</span> args, t=t: call_wmcp(t[<span class="s">"name"</span>], args, url),
    name=t[<span class="s">"name"</span>],
    description=t[<span class="s">"description"</span>],
  )
  <span class="k">for</span> t <span class="k">in</span> data[<span class="s">"tools"</span>]
]</pre>
      <pre data-body="openai" style="display:none"><span class="c">// OpenAI function-calling format.</span>
<span class="k">const</span> { tools } = <span class="k">await</span> (<span class="k">await</span> fetch(<span class="s">\`${origin}/api/v1/tools?url=\${url}\`</span>)).json();
<span class="k">const</span> completion = <span class="k">await</span> openai.chat.completions.create({
  model: <span class="s">"gpt-4o"</span>,
  tools: tools.map(t =&gt; ({
    type: <span class="s">"function"</span>,
    function: {
      name: t.name,
      description: t.description,
      parameters: t.inputSchema || { type: <span class="s">"object"</span>, properties: {} }
    }
  })),
  messages: [{ role: <span class="s">"user"</span>, content: <span class="s">"Find the cheapest variant."</span> }]
});</pre>
    </div>
  </div>
</section>

<!-- ========== PRICING ========== -->
<section id="pricing">
  <div class="section-label">Pricing</div>
  <h2 class="section-h2">Free to try. Paid to scale.</h2>
  <p class="section-sub">Every plan includes the open-source adapters and the shared cache. Paid unlocks live execute + higher quotas.</p>
  <div class="plans">
    <div class="plan">
      <h3>Free</h3>
      <div class="price">$0<small>/mo</small></div>
      <ul>
        <li>100 reads / day</li>
        <li>50 cache pushes / day</li>
        <li>No live execute</li>
        <li>Best-effort cache</li>
      </ul>
      <a class="pick muted-btn" href="/dashboard">Use anonymously →</a>
    </div>
    <div class="plan featured">
      <h3>Pro</h3>
      <div class="price">$29<small>/mo</small></div>
      <ul>
        <li>10,000 reads / day</li>
        <li>5,000 cache pushes / day</li>
        <li>1,000 live executes / day</li>
        <li>Shopify <code style="color:var(--accent2)">add_to_cart</code></li>
        <li>Priority cache freshness</li>
      </ul>
      <a class="pick" href="/dashboard#pricing">Upgrade →</a>
    </div>
    <div class="plan">
      <h3>Reseller</h3>
      <div class="price">$99<small>/mo</small></div>
      <ul>
        <li>100,000 reads / day</li>
        <li>50,000 executes / day</li>
        <li>Restock webhooks (coming)</li>
        <li>Headless tier (coming)</li>
        <li>Email support</li>
      </ul>
      <a class="pick" href="/dashboard#pricing">Upgrade →</a>
    </div>
  </div>
</section>

<!-- ========== FLYWHEEL ========== -->
<section id="flywheel">
  <div class="section-label">Network effect</div>
  <div class="flywheel">
    <div class="globe-scope">
      <div class="globe-bar"><span class="gd r"></span><span class="gd y"></span><span class="gd g"></span><span class="gt">mcp://constellation — live</span></div>
      <pre id="globe" aria-hidden="true"></pre>
    </div>
    <div class="flywheel-text">
      <h2 class="section-h2">It gets faster the more people use it.</h2>
      <ol>
        <li><strong>You hit a URL.</strong> If we've seen it, you get cached tools in &lt;100ms.</li>
        <li><strong>If not, an adapter runs.</strong> Shopify, JSON-LD, or — for protected sites — the Chrome extension extracts client-side.</li>
        <li><strong>The schema gets pushed back to the shared cache.</strong> Next person who asks gets it instantly. Without ever installing anything.</li>
      </ol>
      <p style="color:var(--muted);margin-top:18px;font-size:.92rem">Every install of the extension makes the hosted API better for everyone — including users who never install it. <a href="/directory" style="color:var(--accent2);text-decoration:none">See what's already cached →</a></p>
    </div>
  </div>
</section>

<!-- ========== FAQ ========== -->
<section id="faq">
  <div class="section-label">FAQ</div>
  <h2 class="section-h2">Frequently asked questions</h2>
  <p class="section-sub">What we get asked most. Schema-marked-up so Google can show these as rich snippets.</p>

  <div style="display:flex;flex-direction:column;gap:12px;margin-top:24px">
    <details style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:18px 20px">
      <summary style="font-weight:700;font-size:1rem;color:var(--text);cursor:pointer;list-style:none">How does wmcp.sh differ from Shopify's AI Toolkit (dev-mcp)?</summary>
      <div style="color:var(--muted);font-size:.92rem;margin-top:12px;line-height:1.65">
        Shopify's <code style="color:var(--accent2)">dev-mcp</code> is <strong style="color:var(--text)">owner-side</strong> — it connects to the Shopify Admin API for store management and requires admin credentials. wmcp.sh is <strong style="color:var(--text)">shopper-side</strong> — it operates on public storefronts using Shopify's storefront JSON, schema.org JSON-LD, or an LLM fallback, so AI shopping agents can fetch prices, list variants, and trigger <code style="color:var(--accent2)">add_to_cart</code> without merchant credentials.
      </div>
    </details>

    <details style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:18px 20px">
      <summary style="font-weight:700;font-size:1rem;color:var(--text);cursor:pointer;list-style:none">How does wmcp.sh differ from Composio?</summary>
      <div style="color:var(--muted);font-size:.92rem;margin-top:12px;line-height:1.65">
        Composio is an enterprise integration proxy aimed at owner-side admin APIs (Stripe, GitHub, Slack, Shopify Admin). wmcp.sh is purpose-built for shopper-side transactional flows — product lookup, variant comparison, <code style="color:var(--accent2)">add_to_cart</code> — and caches schemas in a shared global cache that serves under 100ms. wmcp.sh also ingests any OpenAPI spec; Composio handles each integration separately.
      </div>
    </details>

    <details style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:18px 20px">
      <summary style="font-weight:700;font-size:1rem;color:var(--text);cursor:pointer;list-style:none">Can wmcp.sh turn an OpenAPI spec into MCP tools?</summary>
      <div style="color:var(--muted);font-size:.92rem;margin-top:12px;line-height:1.65">
        Yes. Hand any JSON OpenAPI 3.x or Swagger 2.0 spec URL to wmcp.sh and the adapter walks every path × method, resolves <code style="color:var(--accent2)">$ref</code>s against <code style="color:var(--accent2)">#/components/schemas/</code>, and emits a typed tool list ready for Claude tool_use, OpenAI function-calling, or LangChain. Try it:
        <pre style="margin-top:12px"><code><span class="k">curl</span> <span class="s">'https://wmcp.sh/api/v1/tools?url=https://petstore3.swagger.io/api/v3/openapi.json'</span></code></pre>
      </div>
    </details>

    <details style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:18px 20px">
      <summary style="font-weight:700;font-size:1rem;color:var(--text);cursor:pointer;list-style:none">Which AI agent frameworks does wmcp.sh work with?</summary>
      <div style="color:var(--muted);font-size:.92rem;margin-top:12px;line-height:1.65">
        Drop-in SDKs for <strong style="color:var(--text)">Anthropic SDK</strong> (Claude tool_use), <strong style="color:var(--text)">OpenAI</strong> (function-calling), <strong style="color:var(--text)">LangChain</strong> (StructuredTool), and <strong style="color:var(--text)">Vercel AI SDK</strong>. Install: <code style="color:var(--accent2)">pip install wmcp</code> or <code style="color:var(--accent2)">npm install @wmcp/sdk</code>. Anything else that consumes MCP-shaped tools — Cursor, Cline, Claude Code, Gemini CLI — works directly with the public REST API.
      </div>
    </details>

    <details style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:18px 20px">
      <summary style="font-weight:700;font-size:1rem;color:var(--text);cursor:pointer;list-style:none">What happens when a site blocks bot traffic?</summary>
      <div style="color:var(--muted);font-size:.92rem;margin-top:12px;line-height:1.65">
        Sites behind Akamai or Incapsula (Amazon, Nike) block server-side fetches. For these, the wmcp.sh Chrome extension extracts schemas client-side in your real browser and pushes them back to the shared cache. The next time anyone — any user, any agent — asks wmcp.sh for that URL, the cached schema is served server-side instantly.
      </div>
    </details>
  </div>
</section>

<!-- ========== ABOUT ========== -->
<section id="about">
  <div class="about">
    <div class="about-avatar">W</div>
    <div class="about-body">
      <p style="color:var(--muted)"><strong style="color:var(--text)">Why this exists.</strong> LLM agents can talk to ChatGPT but not to Allbirds. Every framework reinvents per-site scrapers and the same Shopify cart endpoint gets rediscovered weekly. wmcp.sh is the open layer that solves it once.</p>
      <p style="color:var(--muted)">Built in the open. Adapters are MIT-licensed. PRs accepted. Last updated 2026-05-27. <a href="https://github.com/New1Direction/webmcp-anything">github.com/New1Direction/webmcp-anything</a> · <a href="/directory">directory</a></p>
    </div>
  </div>
</section>

</div>

<footer>
  <a href="/">Home</a> · <a href="/directory">Directory</a> · <a href="/dashboard">Dashboard</a> · <a href="https://github.com/New1Direction/webmcp-anything">GitHub</a> · <a href="https://developer.chrome.com/docs/ai/webmcp">WebMCP spec ↗</a>
</footer>

<script>
const ORIGIN = ${JSON.stringify(origin)};

// ---- live cache counter ----
(async function loadStat() {
  try {
    const r = await fetch(ORIGIN + "/api/v1/stats/public");
    const d = await r.json();
    const target = d.cached_urls | 0;
    const el = document.getElementById("cache-stat");
    if (target <= 0) { el.textContent = "Just"; return; }
    const start = performance.now();
    const dur = 1400;
    function tick(t) {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(target * eased).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  } catch {}
})();

// ---- live demo ----
const out = document.getElementById("out");
const inp = document.getElementById("u");
const btn = document.getElementById("go");

document.querySelectorAll(".chip").forEach(c => {
  c.addEventListener("click", () => { inp.value = c.dataset.u; runDemo(); });
});
btn.addEventListener("click", runDemo);
inp.addEventListener("keydown", e => { if (e.key === "Enter") runDemo(); });

async function runDemo() {
  const url = inp.value.trim();
  if (!url) return;
  btn.disabled = true; btn.textContent = "…";
  out.innerHTML = '<span class="c">// fetching ' + escapeHtml(url) + '…</span>';
  try {
    const r = await fetch(ORIGIN + "/api/v1/tools?url=" + encodeURIComponent(url));
    const data = await r.json();
    out.innerHTML = colorize(JSON.stringify(data, null, 2));
  } catch (e) {
    out.innerHTML = '<span style="color:var(--red)">' + escapeHtml(String(e)) + '</span>';
  } finally {
    btn.disabled = false; btn.textContent = "⚡ Get tools";
  }
}

function escapeHtml(s) {
  return s.replace(/[&<>]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;"})[c]);
}
function colorize(json) {
  return escapeHtml(json)
    .replace(/&quot;([^&]+?)&quot;:/g, '<span class="k">"$1"</span>:')
    .replace(/: &quot;([^&]*?)&quot;/g, ': <span class="s">"$1"</span>');
}

// ---- code tabs ----
document.querySelectorAll(".tab").forEach(t => {
  t.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(x => x.classList.remove("on"));
    t.classList.add("on");
    const which = t.dataset.tab;
    document.querySelectorAll("[data-body]").forEach(p => {
      p.style.display = p.dataset.body === which ? "" : "none";
    });
  });
});

// ---- looping chat demo ----
const chat = document.getElementById("chat");
const script = [
  { type: "user",  text: "Add the size 10 Allbirds Wool Runners to my cart." },
  { type: "agent", text: "Looking that up via wmcp.sh…" },
  { type: "tool",  text: "→ GET /api/v1/tools?url=allbirds.com/products/mens-wool-runners" },
  { type: "tool",  text: "← 12 tools · get_price · add_to_cart · list_variants…" },
  { type: "tool",  text: "→ POST /tools/execute { tool: \\"add_to_cart\\", args: { variant_id: 47291, qty: 1 } }" },
  { type: "tool",  text: "← { ok: true, cart_count: 1 }" },
  { type: "agent", text: "Done — Wool Runner in size 10 is in your cart." },
];

function renderChat() {
  chat.innerHTML = "";
  let delay = 0;
  for (const m of script) {
    const el = document.createElement("div");
    el.className = "msg " + m.type;
    el.style.animationDelay = delay + "ms";
    const tag = m.type === "user" ? "you" : m.type === "agent" ? "agent" : "wmcp";
    el.innerHTML = '<span class="tag">' + tag + '</span>' + escapeHtml(m.text);
    chat.appendChild(el);
    delay += 700;
  }
  // Restart the loop after the script finishes + a pause.
  setTimeout(renderChat, delay + 3500);
}
renderChat();
</script>
<script>
(function(){
  var el = document.getElementById('globe'); if (!el) return;
  var COLS = 58, ROWS = 30, N = 170, RAMP = " .·:-=+*oO#@";
  var pts = [];
  for (var i = 0; i < N; i++){ var y = 1-(i/(N-1))*2; var r = Math.sqrt(Math.max(0,1-y*y)); var th = i*2.399963229; pts.push([Math.cos(th)*r, y, Math.sin(th)*r]); }
  var edges = []; for (var k = 0; k < 12; k++){ var a = (k*13+5)%N; var b = (a+7+((k*5)%9))%N; edges.push([a,b]); }
  var ang = 0, raf, reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function inb(x,y){ return x>=0 && x<COLS && y>=0 && y<ROWS; }
  function proj(p,cosA,sinA,cosT,sinT){
    var x = p[0]*cosA - p[2]*sinA, z = p[0]*sinA + p[2]*cosA, yy = p[1];
    var y2 = yy*cosT - z*sinT, z2 = yy*sinT + z*cosT, f = 1.6/(3.4 - z2);
    return { sx: Math.round(COLS/2 + x*f*COLS*0.50), sy: Math.round(ROWS/2 - y2*f*ROWS*0.52), depth: z2 };
  }
  function frame(){
    ang += 0.011;
    var cosA = Math.cos(ang), sinA = Math.sin(ang), cosT = Math.cos(0.5), sinT = Math.sin(0.5);
    var grid = [], zb = [];
    for (var y = 0; y < ROWS; y++){ grid.push(new Array(COLS).fill(' ')); zb.push(new Array(COLS).fill(-1e9)); }
    var pulse = (Math.sin(ang*1.7)+1)/2;
    for (var e = 0; e < edges.length; e++){
      var pa = pts[edges[e][0]], pb = pts[edges[e][1]], S = 16, bright = (e%4===0) && pulse>0.6;
      for (var s = 0; s <= S; s++){ var t = s/S; var m = [pa[0]+(pb[0]-pa[0])*t, pa[1]+(pb[1]-pa[1])*t, pa[2]+(pb[2]-pa[2])*t];
        var P = proj(m,cosA,sinA,cosT,sinT);
        if (inb(P.sx,P.sy) && P.depth>zb[P.sy][P.sx]){ grid[P.sy][P.sx] = bright?'+':'·'; zb[P.sy][P.sx] = P.depth-0.002; } }
    }
    for (var n = 0; n < pts.length; n++){ var Q = proj(pts[n],cosA,sinA,cosT,sinT); if (!inb(Q.sx,Q.sy)) continue;
      if (Q.depth>zb[Q.sy][Q.sx]){ var bb = (Q.depth+1)/2; var idx = Math.max(0,Math.min(RAMP.length-1,Math.round(bb*(RAMP.length-1)))); grid[Q.sy][Q.sx] = RAMP[idx]; zb[Q.sy][Q.sx] = Q.depth; } }
    var out = ''; for (var ry = 0; ry < ROWS; ry++){ out += grid[ry].join('') + '\\n'; }
    el.textContent = out;
    if (!reduce) raf = requestAnimationFrame(frame);
  }
  // Lazy: only animate once the section scrolls into view.
  if ('IntersectionObserver' in window){ var io = new IntersectionObserver(function(es){ es.forEach(function(en){ if (en.isIntersecting){ frame(); io.disconnect(); } }); }); io.observe(el); }
  else { frame(); }
})();
</script>
</body>
</html>`;
}
