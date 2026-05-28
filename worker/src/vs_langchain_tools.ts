// /vs/langchain-tools — head-to-head with LangChain tools.
// SERP target family: "wmcp.sh vs langchain", "langchain mcp",
// "langchain tool calling", "langchain tools vs mcp", "best mcp client
// for langchain". Angle is COMPLEMENTARY, not adversarial — LangChain
// is a code-side agent framework, wmcp.sh is a runtime tool gateway.
// They stack.
//
// wmcp.sh is not affiliated with LangChain. All comparative claims are
// based on LangChain's public documentation; we cite no specific pricing
// numbers because LangChain (the OSS framework) is free and LangSmith
// (the hosted product) changes pricing — readers should check the
// vendor's site for current numbers.

export function vsLangchainToolsHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>wmcp.sh vs LangChain tools — runtime gateway meets agent framework | wmcp.sh</title>
<meta name="description" content="LangChain tools are code-defined @tool functions inside your agent. wmcp.sh is a runtime MCP gateway. They're orthogonal — use wmcp.sh tools INSIDE a LangChain agent. Honest comparison + code." />
<link rel="canonical" href="${origin}/vs/langchain-tools" />
<meta property="og:title" content="wmcp.sh vs LangChain tools — they stack, not compete" />
<meta property="og:description" content="LangChain tools live in your Python/TS code. wmcp.sh tools live behind an MCP endpoint. Use both: LangChain for orchestration, wmcp.sh for tool surface." />
<meta property="og:url" content="${origin}/vs/langchain-tools" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="wmcp.sh vs LangChain tools" />
<meta name="twitter:description" content="They stack. LangChain orchestrates; wmcp.sh supplies tools." />
<meta name="twitter:image" content="${origin}/og.png" />
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "wmcp.sh vs LangChain tools — runtime gateway meets agent framework",
  "description": "Honest comparison: LangChain tools are code-defined; wmcp.sh tools are runtime-resolved over MCP. Use them together.",
  "author": { "@type": "Organization", "name": "WebMCP Anything" },
  "publisher": { "@type": "Organization", "name": "WebMCP Anything", "url": "https://wmcp.sh" },
  "datePublished": "2026-05-28",
  "dateModified": "2026-05-28",
  "mainEntityOfPage": "${origin}/vs/langchain-tools"
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Are LangChain tools and wmcp.sh competitors?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No — they sit at different layers. LangChain is an agent framework: you write Python/TypeScript code that defines tools with the @tool decorator, builds chains, and orchestrates LLM calls. wmcp.sh is a runtime gateway: it exposes any public URL or OpenAPI spec as MCP tools over an HTTP endpoint. The natural pattern is to use wmcp.sh as a tool source INSIDE a LangChain agent — point LangChain's MCP client at wmcp.sh, and your agent gets hundreds of tools without you writing each one by hand."
      }
    },
    {
      "@type": "Question",
      "name": "Do I still need LangChain if I use wmcp.sh?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, if you need agent orchestration: memory, multi-step planning, tool routing logic, evaluation, tracing. LangChain (and LangGraph) handle the control flow of your agent. wmcp.sh handles the tool surface area. They are complementary."
      }
    },
    {
      "@type": "Question",
      "name": "How do I use wmcp.sh inside a LangChain agent?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "LangChain has first-party MCP client adapters (langchain-mcp-adapters in Python, @langchain/mcp-adapters in TypeScript). Point the MCP client at your wmcp.sh endpoint (for example, https://wmcp.sh/mcp/openapi?url=...) and the adapter pulls tool schemas into LangChain Tool objects. From there, your existing AgentExecutor or LangGraph graph calls them like any other tool."
      }
    },
    {
      "@type": "Question",
      "name": "When does pure LangChain (no wmcp.sh) win?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "When your tools are bespoke business logic that lives in your own codebase — querying your internal database, calling private microservices, running custom data transforms. Writing those as @tool functions and keeping them in-process is faster than putting them behind an MCP gateway. wmcp.sh shines when the tool surface is a public URL, a partner OpenAPI spec, or an OAuth-gated MCP server."
      }
    },
    {
      "@type": "Question",
      "name": "Is LangChain free and is wmcp.sh free?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The LangChain framework itself is open-source (MIT) and free to use. LangSmith (the hosted observability product) and LangGraph Platform have paid tiers — check LangChain's website for current pricing. wmcp.sh has a free anonymous read tier (100 reads/day, no signup) and paid managed tiers starting at $499 one-time for done-for-you setup; full details at /managed."
      }
    },
    {
      "@type": "Question",
      "name": "Can wmcp.sh tools call my LangChain agent?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Indirectly — yes. Wrap your LangChain agent behind an HTTP endpoint (FastAPI, Express, anything), describe it with an OpenAPI spec, and feed that spec to wmcp.sh. Now any MCP-compatible client (Claude.ai, Cursor, your other agents) can call your LangChain agent as a tool. This is a useful pattern for agent-to-agent composition."
      }
    },
    {
      "@type": "Question",
      "name": "Is wmcp.sh affiliated with LangChain?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. wmcp.sh is an independent project and is not affiliated with, endorsed by, or sponsored by LangChain, Inc. All comparative claims on this page are based on LangChain's public documentation."
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
  pre .k { color: var(--accent2); } pre .s { color: var(--pink); } pre .c { color: var(--dim); } pre .y { color: var(--gold); }
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
  <div class="badge"><span class="dot"></span> competitor &middot; langchain tools</div>
  <h1>wmcp.sh vs LangChain tools.</h1>
  <p class="sub">LangChain tools are <strong>code-side</strong> — Python or TypeScript functions decorated with <code>@tool</code>, living inside your agent process. wmcp.sh is <strong>runtime-side</strong> — an MCP gateway that exposes any public URL or OpenAPI spec as tools your agent fetches over HTTP. They aren't competitors. They stack.</p>
  <p class="hint">Most teams that adopt both use wmcp.sh for breadth (Stripe, GitHub, Shopify, OpenAPI ingest) and LangChain for orchestration (memory, planning, evaluation).</p>
  <p class="disclaim">wmcp.sh is not affiliated with, endorsed by, or sponsored by LangChain, Inc. All comparative claims below are based on LangChain's public documentation.</p>
</header>

<!-- ========== THE WEDGE ========== -->
<section id="wedge">
  <div class="section-label">The shape difference</div>
  <h2>One sentence each.</h2>
  <div class="wins-grid">
    <div class="wins-card">
      <h3>LangChain tools</h3>
      <p style="color:var(--muted);margin:0 0 12px;font-size:.95rem;line-height:1.65">An open-source agent framework where developers define tools as <strong>code</strong> — Python or TypeScript functions wrapped with the <code>@tool</code> decorator — and orchestrate LLM calls, memory, and multi-step plans (often via LangGraph) inside their own process.</p>
    </div>
    <div class="wins-card us">
      <h3>wmcp.sh</h3>
      <p style="color:var(--muted);margin:0 0 12px;font-size:.95rem;line-height:1.65">A hosted MCP gateway: point it at a public URL, OpenAPI spec, or OAuth-gated upstream and it returns ready-to-call MCP tools. Your LangChain agent (or Claude.ai, Cursor, custom client) consumes those tools over the MCP wire protocol.</p>
    </div>
  </div>
</section>

<!-- ========== THE STACK ========== -->
<section id="stack">
  <div class="section-label">How they fit together</div>
  <h2>Use wmcp.sh tools INSIDE a LangChain agent.</h2>
  <p class="section-sub">LangChain ships first-party MCP client adapters (<code>langchain-mcp-adapters</code> in Python, <code>@langchain/mcp-adapters</code> in TypeScript). Wire them to wmcp.sh once and your agent gets hundreds of tools.</p>
  <pre><code><span class="c"># Python — pull wmcp.sh tools into a LangGraph ReAct agent</span>
<span class="k">from</span> langchain_mcp_adapters.client <span class="k">import</span> MultiServerMCPClient
<span class="k">from</span> langgraph.prebuilt <span class="k">import</span> create_react_agent
<span class="k">from</span> langchain_anthropic <span class="k">import</span> ChatAnthropic

client = MultiServerMCPClient({
  <span class="s">"stripe"</span>: {
    <span class="s">"url"</span>: <span class="s">"${origin}/mcp/openapi?url=https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.json&amp;tag=customers"</span>,
    <span class="s">"transport"</span>: <span class="s">"streamable_http"</span>,
  },
  <span class="s">"shopify"</span>: {
    <span class="s">"url"</span>: <span class="s">"${origin}/mcp/shopify?store=allbirds.com"</span>,
    <span class="s">"transport"</span>: <span class="s">"streamable_http"</span>,
  },
})

tools = <span class="k">await</span> client.get_tools()
agent = create_react_agent(ChatAnthropic(model=<span class="s">"claude-sonnet-4-5"</span>), tools)
result = <span class="k">await</span> agent.ainvoke({<span class="s">"messages"</span>: [<span class="s">"Find a customer named Acme and list their recent invoices"</span>]})</code></pre>
  <p class="hint">LangChain handles plan + memory + tracing. wmcp.sh handles tool surface. Each does the part it's good at.</p>
</section>

<!-- ========== CAPABILITY TABLE ========== -->
<section id="capabilities">
  <div class="section-label">Side-by-side</div>
  <h2>The capability matrix.</h2>
  <table>
    <thead>
      <tr><th>Capability</th><th>LangChain tools</th><th>wmcp.sh</th></tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Layer</strong></td>
        <td>Code-side agent framework (in-process)</td>
        <td class="ours">Runtime tool gateway (HTTP/MCP)</td>
      </tr>
      <tr>
        <td><strong>Tool definition</strong></td>
        <td><code>@tool</code> decorator on Python/TS functions you write</td>
        <td class="ours">Auto-generated from URL, OpenAPI spec, or upstream MCP server</td>
      </tr>
      <tr>
        <td><strong>Where tools execute</strong></td>
        <td>In your agent process</td>
        <td class="ours">On wmcp.sh edge (Cloudflare Workers, 300+ POPs)</td>
      </tr>
      <tr>
        <td><strong>OpenAPI spec ingest</strong></td>
        <td>Manual — wrap each endpoint as a tool</td>
        <td class="ours">Automatic — drop in a spec URL, get every endpoint as MCP tools</td>
      </tr>
      <tr>
        <td><strong>OAuth-proxy for upstream MCP</strong></td>
        <td>Bring your own (write OAuth code yourself)</td>
        <td class="ours"><code>wmcp.sh/mcp/&lt;provider&gt;</code> proxies RFC 7591 / PKCE flows</td>
      </tr>
      <tr>
        <td><strong>Agent orchestration</strong><br /><small style="color:var(--dim)">memory, planning, tracing, evals</small></td>
        <td>✅ Core competency (chains, LangGraph, LangSmith)</td>
        <td class="ours">❌ Out of scope — use LangChain / LangGraph alongside</td>
      </tr>
      <tr>
        <td><strong>MCP-native</strong></td>
        <td>Via adapter (langchain-mcp-adapters)</td>
        <td class="ours">Native — MCP is the wire format</td>
      </tr>
      <tr>
        <td><strong>Language</strong></td>
        <td>Python, TypeScript</td>
        <td class="ours">Any client that speaks MCP (Claude, Cursor, LangChain, custom)</td>
      </tr>
      <tr>
        <td><strong>License (framework)</strong></td>
        <td>MIT (open-source)</td>
        <td class="ours">MIT (worker + adapters public)</td>
      </tr>
      <tr>
        <td><strong>Pricing</strong></td>
        <td>Framework free; LangSmith / LangGraph Platform paid — see LangChain site</td>
        <td class="ours">100 reads/day free anonymous; managed setup from $499 one-time</td>
      </tr>
    </tbody>
  </table>
  <p class="disclaim">Pricing and feature claims are subject to change. Check each vendor's site for current details.</p>
</section>

<!-- ========== WINS PER SIDE ========== -->
<section id="wins">
  <div class="section-label">Where each wins</div>
  <h2>When pure-LangChain wins. When you should add wmcp.sh.</h2>
  <div class="wins-grid">
    <div class="wins-card">
      <h3>LangChain alone wins when:</h3>
      <ul>
        <li>Your tools are bespoke business logic in your own codebase (internal DB queries, custom transforms, private microservices)</li>
        <li>You need rich multi-step orchestration with conditional graphs (LangGraph)</li>
        <li>You want LangSmith for observability + evaluation in one place</li>
        <li>You're shipping a closed-loop agent where every tool is hand-written and tested</li>
        <li>You don't need to call OAuth-gated public APIs or third-party MCP servers</li>
      </ul>
    </div>
    <div class="wins-card us">
      <h3>Add wmcp.sh when:</h3>
      <ul>
        <li>You want Stripe's full surface area or GitHub's full surface area as tools without hand-writing each one</li>
        <li>Your agent needs to act on systems your user doesn't own (shopper-side Shopify, DefiLlama, CoinGecko)</li>
        <li>You need an OAuth-proxy MCP server (so your agent doesn't drive PKCE flows itself)</li>
        <li>You want tool execution at the edge instead of in your Python process</li>
        <li>You want to expose your own LangChain agent as an MCP tool (wrap in HTTP + OpenAPI, feed to wmcp.sh)</li>
      </ul>
    </div>
  </div>
</section>

<!-- ========== ARCHITECTURE DIAGRAM ========== -->
<section id="arch">
  <div class="section-label">Architecture (text)</div>
  <h2>Where wmcp.sh sits in a LangChain stack.</h2>
  <pre><code><span class="c">┌──────────────────────────────────────────────────────────┐</span>
<span class="c">│  Your app / API                                          │</span>
<span class="c">│                                                          │</span>
<span class="c">│  ┌────────────────────────────────────────────────────┐  │</span>
<span class="c">│  │  LangGraph / LangChain agent                       │  │</span>
<span class="c">│  │    • memory, planning, retries, tracing            │  │</span>
<span class="c">│  │    • chooses which tool to call                    │  │</span>
<span class="c">│  └────────────────────────────────────────────────────┘  │</span>
<span class="c">│                       │                                  │</span>
<span class="c">│                       ▼ tool call                        │</span>
<span class="c">│  ┌────────────────────────────────────────────────────┐  │</span>
<span class="c">│  │  langchain-mcp-adapters (MCP client)               │  │</span>
<span class="c">│  └────────────────────────────────────────────────────┘  │</span>
<span class="c">└──────────────────────│───────────────────────────────────┘</span>
<span class="c">                       │ MCP (Streamable HTTP)</span>
<span class="c">                       ▼</span>
<span class="c">┌──────────────────────────────────────────────────────────┐</span>
<span class="c">│  wmcp.sh edge worker (Cloudflare, 300+ POPs)             │</span>
<span class="c">│    • OpenAPI ingest (Stripe, GitHub, your spec)          │</span>
<span class="c">│    • shopper-side adapters (Shopify, etc.)               │</span>
<span class="c">│    • OAuth proxy for upstream MCP servers                │</span>
<span class="c">│    • price-data / oracle adapters                        │</span>
<span class="c">└──────────────────────────────────────────────────────────┘</span></code></pre>
</section>

<!-- ========== FAQ ========== -->
<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions from people comparing these.</h2>

  <details><summary>Are LangChain tools and wmcp.sh competitors?</summary>
  <div class="answer">No — they sit at different layers. LangChain is an agent framework (in-process, code-defined tools). wmcp.sh is a runtime gateway (out-of-process, MCP-served tools). The natural pattern is to use wmcp.sh as a tool source <em>inside</em> a LangChain agent.</div>
  </details>

  <details><summary>Do I still need LangChain if I use wmcp.sh?</summary>
  <div class="answer">Yes — if you need orchestration, memory, planning, tracing. wmcp.sh doesn't replace the agent framework; it expands the tool surface.</div>
  </details>

  <details><summary>How do I wire wmcp.sh into a LangChain agent?</summary>
  <div class="answer">Use <code>langchain-mcp-adapters</code> (Python) or <code>@langchain/mcp-adapters</code> (TypeScript). Point at <code>${origin}/mcp/openapi?url=...</code> or any other wmcp.sh MCP endpoint, and the adapter pulls tool schemas into LangChain Tool objects.</div>
  </details>

  <details><summary>When does pure LangChain (no wmcp.sh) win?</summary>
  <div class="answer">When tools are bespoke business logic in your own codebase. Wrapping internal-DB queries in <code>@tool</code> functions is faster than putting them behind an MCP gateway. wmcp.sh shines for public surface — partner OpenAPI specs, OAuth-gated MCP servers, shopper-side adapters.</div>
  </details>

  <details><summary>Is everything open source?</summary>
  <div class="answer">LangChain framework: MIT. wmcp.sh worker + adapters: MIT (public repo). LangSmith and LangGraph Platform are LangChain's paid hosted products — see their site for current pricing.</div>
  </details>

  <details><summary>Can wmcp.sh call my LangChain agent?</summary>
  <div class="answer">Yes — wrap your agent behind an HTTP endpoint (FastAPI / Express), publish an OpenAPI spec, feed the spec to wmcp.sh. Now any MCP client (Claude.ai, Cursor, other agents) can call your LangChain agent as a tool.</div>
  </details>

  <details><summary>Is wmcp.sh affiliated with LangChain?</summary>
  <div class="answer">No. wmcp.sh is independent and not affiliated with, endorsed by, or sponsored by LangChain, Inc.</div>
  </details>
</section>

<!-- ========== UPGRADE CTA ========== -->
<section id="upgrade" style="margin-top:36px;background:linear-gradient(135deg,var(--card),rgba(124,92,255,0.08));border:1px solid rgba(124,92,255,0.35);border-radius:16px;padding:22px 26px">
  <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;justify-content:space-between">
    <div style="flex:1;min-width:240px">
      <div style="font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent2);font-weight:700;margin-bottom:6px">Need this picked / built for you?</div>
      <h3 style="margin:0 0 4px;font-size:1.05rem;color:var(--text)">We'll wire wmcp.sh into your LangChain stack.</h3>
      <p style="color:var(--muted);margin:0;font-size:.92rem">Custom MCP adapter for your APIs + hosted endpoint at <code>mcp.yourbrand.com</code> + LangChain integration tested end-to-end. From <strong style="color:var(--text)">$499 one-time setup</strong>; Pro retainer <strong style="color:var(--text)">$999/mo</strong>; Enterprise <strong style="color:var(--text)">$4,999+/mo</strong>.</p>
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
    <a href="/vs/mcp-toolkit" style="color:var(--accent2);text-decoration:none">/vs/mcp-toolkit</a> &middot;
    <a href="/vs/anthropic-skills" style="color:var(--accent2);text-decoration:none">/vs/anthropic-skills</a> &middot;
    <a href="/roundup/agent-frameworks" style="color:var(--accent2);text-decoration:none">/roundup/agent-frameworks</a> &middot;
    <a href="/integration/openapi" style="color:var(--accent2);text-decoration:none">/integration/openapi</a>
  </p>
</section>

</div>

<footer>
  <a href="/">Home</a> · <a href="/agent-ready">Agent-ready</a> · <a href="/managed">Done for you</a> · <a href="/directory">Directory</a> · <a href="/directory/submit">Submit</a> · <a href="/blog">Blog</a> · <a href="/roundup/agent-frameworks">Frameworks roundup</a>
</footer>

</body>
</html>`;
}
