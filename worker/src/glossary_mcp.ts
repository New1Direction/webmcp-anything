export function glossaryMcpHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Model Context Protocol (MCP) Definition | wmcp.sh</title>
<meta name="description" content="A complete glossary definition of the Model Context Protocol (MCP), covering tools vs resources, transport options, and low-latency API integration." />
<link rel="canonical" href="${origin}/glossary/mcp" />
<meta property="og:title" content="Model Context Protocol (MCP) Definition | wmcp.sh" />
<meta property="og:description" content="A complete glossary definition of the Model Context Protocol (MCP), covering tools vs resources, transport options, and low-latency API integration." />
<meta property="og:url" content="${origin}/glossary/mcp" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Model Context Protocol (MCP) Definition | wmcp.sh" />
<meta name="twitter:description" content="A complete glossary definition of the Model Context Protocol (MCP), covering tools vs resources, transport options, and low-latency API integration." />
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article","headline":"Model Context Protocol (MCP) Definition | wmcp.sh","description":"A complete glossary definition of the Model Context Protocol (MCP), covering tools vs resources, transport options, and low-latency API integration.","author":{"@type":"Organization","name":"WebMCP Anything"},"publisher":{"@type":"Organization","name":"WebMCP Anything","url":"https://wmcp.sh"},"datePublished":"2026-05-28","dateModified":"2026-05-28","mainEntityOfPage":"${origin}/glossary/mcp"}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
  {"@type":"Question","name":"What is the Model Context Protocol (MCP)?","acceptedAnswer":{"@type":"Answer","text":"The Model Context Protocol (MCP) is an open standard introduced by Anthropic that standardizes how AI models access data and tools from external systems. It replaces bespoke integrations with a universal client-server architecture."}},
  {"@type":"Question","name":"What is the difference between tools and resources in MCP?","acceptedAnswer":{"@type":"Answer","text":"Resources provide static context (like reading a file or database row), whereas tools are executable actions the model can invoke (like writing data or calling an external API). Prompts are reusable templated instructions."}},
  {"@type":"Question","name":"How does latency impact MCP performance?","acceptedAnswer":{"@type":"Answer","text":"Because AI models await context injection synchronously, slow MCP servers cause visible lag. Utilizing caching with a short TTL (~1s) and edge-hosted gateways like wmcp.sh ensures sub-100ms response times."}},
  {"@type":"Question","name":"How do I secure sensitive API keys using MCP?","acceptedAnswer":{"@type":"Answer","text":"Never pass raw API keys within the context window. Instead, use an encrypted credentials vault for static keys to inject authorization out-of-band during the tool execution phase."}}
]}
</script>
<style>
  :root { --bg:#07070d;--card:#16161f;--bg2:#11111c;--border:#26263a;--text:#ececf5;--muted:#8a8aa8;--dim:#6a6a88;--accent:#ff9e2c;--accent2:#ffcf7a;--green:#4ade80;--red:#f87171;--pink:#ffb86b;--gold:#fbbf24; }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin:0;min-height:100vh;color:var(--text);background:var(--bg);font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif;line-height:1.6;background-image:radial-gradient(ellipse 900px 600px at 10% -5%,rgba(255,158,44,.18),transparent 60%),radial-gradient(ellipse 700px 500px at 95% 10%,rgba(255,176,0,.10),transparent 60%); }
  .wrap { max-width: 920px; margin: 0 auto; padding: 0 24px; }
  nav { display:flex;justify-content:space-between;align-items:center;padding:22px 24px;max-width:1080px;margin:0 auto; }
  nav .brand { font-weight: 800; letter-spacing: -.02em; font-size: 1.05rem; }
  nav .brand a { color: inherit; text-decoration: none; }
  nav .brand span { color: var(--accent2); }
  nav .links { display: flex; gap: 22px; font-size: .9rem; }
  nav .links a { color: var(--muted); text-decoration: none; }
  nav .cta { background: var(--bg2); border: 1px solid var(--border); padding: 7px 14px; border-radius: 8px; font-size: .85rem; color: var(--text); text-decoration: none; font-weight: 600; }
  header.hero { padding: 50px 0 30px; }
  .badge { display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;font-size:.7rem;letter-spacing:.15em;text-transform:uppercase;font-weight:700;background:linear-gradient(90deg,rgba(255,158,44,.18),rgba(255,176,0,.18));border:1px solid rgba(255,158,44,.35);margin-bottom:18px; }
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
  td.ours { background: rgba(255,158,44,0.05); }
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
  <div class="badge"><span class="dot"></span> GLOSSARY &middot; /GLOSSARY/MCP</div>
  <h1>Model Context Protocol (MCP)</h1>
  <p class="sub">Integrating AI agents across disparate internal systems creates fragmentation, fragile point-to-point connections, and severe context delays. The Model Context Protocol (MCP) solves this by standardizing the tool interface, enabling dynamic extraction at runtime through platforms like wmcp.sh.</p>
</header>

<section id="wedge">
  <div class="section-label">the gap</div>
  <h2>Why developers need a unified context protocol</h2>
  <p class="section-sub">Before the introduction of MCP by Anthropic, developers connecting large language models to data had to write custom glue code for every API integration. An enterprise application for Acme Corp might require five different authentication strategies to pull logs, database records, and CRM notes.</p>
  <p class="section-sub">The Model Context Protocol changes this by defining a universal client-server architecture. An MCP server wraps existing systems (via stdio, Server-Sent Events, or HTTP streams) and exposes three primitives: <strong>Resources</strong> (static context), <strong>Tools</strong> (executable functions), and <strong>Prompts</strong> (reusable workflows). Instead of brittle scripts, the agent queries the server for its capabilities dynamically. <em>(Note: wmcp.sh is not affiliated with Anthropic or OpenAI.)</em></p>
</section>

<section id="how">
  <div class="section-label">the architecture</div>
  <h2>How to connect an MCP server</h2>
  <pre><code><span class="k">import</span> <span class="s">{ Client }</span> <span class="k">from</span> <span class="s">"@modelcontextprotocol/sdk/client/index.js"</span>;
<span class="k">import</span> <span class="s">{ SSEClientTransport }</span> <span class="k">from</span> <span class="s">"@modelcontextprotocol/sdk/client/sse.js"</span>;

<span class="c">// wmcp.sh provides a low-latency, edge-optimized MCP transport</span>
<span class="k">const</span> transport <span class="k">=</span> <span class="k">new</span> <span class="s">SSEClientTransport</span>(<span class="k">new</span> URL(<span class="s">"https://api.wmcp.sh/v1/mcp"</span>));

<span class="k">const</span> client <span class="k">=</span> <span class="k">new</span> <span class="s">Client</span>(
  { name: <span class="s">"example-client"</span>, version: <span class="s">"1.0.0"</span> },
  { capabilities: {} }
);

<span class="k">await</span> client.connect(transport);

<span class="c">// Dynamically list tools extracted from an OpenAPI spec</span>
<span class="k">const</span> tools <span class="k">=</span> <span class="k">await</span> client.listTools();
console.log(<span class="s">"Available tools:"</span>, tools);</code></pre>
</section>

<section id="capabilities">
  <div class="section-label">capability</div>
  <h2>MCP vs Point-to-Point Integration</h2>
  <table>
    <thead><tr><th>Capability</th><th>Without wmcp.sh (Bespoke)</th><th>With wmcp.sh (Managed MCP)</th></tr></thead>
    <tbody>
      <tr><td><strong>Standardized Tool Schemas</strong></td><td>⚠️ Requires manual parsing logic per API.</td><td class="ours">✅ Automatically translates OpenAPI/JSON-LD into MCP tools.</td></tr>
      <tr><td><strong>Latency Optimization</strong></td><td>❌ Cold starts can introduce seconds of lag.</td><td class="ours">✅ Edge-hosted for sub-100ms response times.</td></tr>
      <tr><td><strong>State Caching</strong></td><td>❌ Expensive duplicate requests to backends.</td><td class="ours">✅ Intelligent caching (short TTL, ~1s) built-in.</td></tr>
      <tr><td><strong>Secure Credential Storage</strong></td><td>⚠️ Prone to API keys leaking in prompts.</td><td class="ours">✅ Secure encrypted credentials vault out-of-band.</td></tr>
      <tr><td><strong>Multi-Agent Discoverability</strong></td><td>❌ Isolated to a single app environment.</td><td class="ours">✅ Globablly addressable via standard transport.</td></tr>
    </tbody>
  </table>
</section>

<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions.</h2>
  <details><summary>What transport layers does MCP support?</summary><p class="answer">The protocol defines multiple transport mechanisms including stdio (for local, sidecar processes) and SSE (Server-Sent Events) over HTTP for remote servers. wmcp.sh optimizes the remote HTTP flow for sub-100ms execution.</p></details>
  <details><summary>Is MCP specific to Claude?</summary><p class="answer">While the spec was open-sourced by Anthropic, it is model-agnostic. Tools built with MCP can be consumed by OpenAI models, local OSS models, and various developer environments. (Note: wmcp.sh is not affiliated with Anthropic or OpenAI).</p></details>
  <details><summary>How should caching work with MCP?</summary><p class="answer">Because agents often poll for context repeatedly during reasoning loops, caching is critical. We recommend a short TTL (~1s) or per-request bypass option to ensure fresh data without overwhelming backend systems.</p></details>
  <details><summary>Are API keys secure over MCP?</summary><p class="answer">To prevent token leaks, never include static keys in the tool invocation payload. Employ an encrypted credentials vault where the gateway injects the credentials server-side before calling the origin API.</p></details>
</section>

<section id="upgrade" style="margin-top:36px;background:linear-gradient(135deg,var(--card),rgba(255,158,44,0.08));border:1px solid rgba(255,158,44,0.35);border-radius:16px;padding:22px 26px">
  <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;justify-content:space-between">
    <div style="flex:1;min-width:240px">
      <div style="font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent2);font-weight:700;margin-bottom:6px">Need this done for you?</div>
      <h3 style="margin:0 0 4px;font-size:1.05rem;color:var(--text)">Skip the wiring — we build, deploy, and monitor.</h3>
      <p style="color:var(--muted);margin:0;font-size:.92rem">Custom adapter + hosted MCP at <code>mcp.yourbrand.com</code> + verified badge. Pricing: <strong style="color:var(--text)">Starter $499 one-time</strong>, <strong>Managed Retainer $999/mo</strong>, or <strong>Enterprise $4,999+/mo</strong>.</p>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <a href="/managed" style="display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#ff9e2c,#ffcf7a);color:#0c0c14;padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:700;font-size:.9rem">See /managed &rarr;</a>
      <a href="/directory/submit" style="display:inline-flex;align-items:center;gap:6px;background:#11111c;border:1px solid #26263a;color:var(--text);padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:600;font-size:.9rem">Submit (free)</a>
    </div>
  </div>
</section>

</div>

<footer>
  <a href="/">Home</a> &middot; <a href="/agent-ready">Agent-ready</a> &middot; <a href="/managed">Done for you</a> &middot; <a href="/blog">Blog</a> &middot; <a href="/directory">Directory</a> &middot; <a href="/directory/submit">Submit</a> &middot; <a href="/glossary/tool-use">Tool Use</a> &middot; <a href="/glossary/function-calling">Function Calling</a> &middot; <a href="https://github.com/New1Direction/webmcp-anything">GitHub</a>
</footer>
</body>
</html>`;
}
