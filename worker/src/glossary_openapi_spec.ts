export function glossaryOpenapiSpecHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>OpenAPI Specification (Swagger) — MCP Glossary | wmcp.sh</title>
<meta name="description" content="What is the OpenAPI specification? Learn about v3 schemas, paths, and how wmcp.sh compiles OpenAPI into Model Context Protocol (MCP) tools dynamically." />
<link rel="canonical" href="${origin}/glossary/openapi-spec" />
<meta property="og:title" content="OpenAPI Specification (Swagger) — MCP Glossary" />
<meta property="og:description" content="What is the OpenAPI specification? Learn about v3 schemas, paths, and how wmcp.sh compiles OpenAPI into Model Context Protocol (MCP) tools dynamically." />
<meta property="og:url" content="${origin}/glossary/openapi-spec" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="OpenAPI Specification (Swagger) — MCP Glossary" />
<meta name="twitter:description" content="What is the OpenAPI specification? Learn about v3 schemas, paths, and how wmcp.sh compiles OpenAPI into Model Context Protocol (MCP) tools dynamically." />
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article","headline":"OpenAPI Specification (Swagger) — MCP Glossary","description":"What is the OpenAPI specification? Learn about v3 schemas, paths, and how wmcp.sh compiles OpenAPI into Model Context Protocol (MCP) tools dynamically.","author":{"@type":"Organization","name":"WebMCP Anything"},"publisher":{"@type":"Organization","name":"WebMCP Anything","url":"https://wmcp.sh"},"datePublished":"2026-05-28","dateModified":"2026-05-28","mainEntityOfPage":"${origin}/glossary/openapi-spec"}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
  {"@type":"Question","name":"What is the difference between OpenAPI and Swagger?","acceptedAnswer":{"@type":"Answer","text":"Swagger was the original name for the specification (up to version 2.0). It was donated to the Linux Foundation and renamed OpenAPI Specification (OAS) from version 3.0 onwards. Swagger now refers to the tooling ecosystem (like Swagger UI)."}},
  {"@type":"Question","name":"Why do AI agents need OpenAPI?","acceptedAnswer":{"@type":"Answer","text":"AI agents from Anthropic and OpenAI cannot read your backend source code. An OpenAPI spec provides a machine-readable map of your endpoints, inputs, and outputs, which can be translated into function calling schemas."}},
  {"@type":"Question","name":"Which OpenAPI versions does wmcp.sh support?","acceptedAnswer":{"@type":"Answer","text":"wmcp.sh primarily supports OpenAPI v3.0 and v3.1, which are the modern standards. v2.0 (Swagger) specs are usually auto-upconverted or can be easily migrated."}},
  {"@type":"Question","name":"Is OpenAPI required for the Model Context Protocol (MCP)?","acceptedAnswer":{"@type":"Answer","text":"No, MCP is protocol-agnostic. However, if you already have a REST API, providing an OpenAPI spec is the fastest way to generate an MCP server, as platforms like wmcp.sh can convert it dynamically."}}
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
  <a class="cta" href="/dashboard">Dashboard →</a>
</nav>

<div class="wrap">

<header class="hero">
  <div class="badge"><span class="dot"></span> GLOSSARY &middot; OPENAPI-SPEC</div>
  <h1>OpenAPI Specification</h1>
  <p class="sub">The standard format for defining REST APIs. AI agents cannot read code, but they can parse an OpenAPI schema to discover your backend. With wmcp.sh, you can turn any OpenAPI spec directly into native Model Context Protocol (MCP) tools.</p>
</header>

<section id="wedge">
  <div class="section-label">the gap</div>
  <h2>Bridging REST and AI agents</h2>
  <p class="section-sub">If you have an existing REST API built in Node, Python, PHP, or Java, you likely already generate an OpenAPI spec for human documentation (like Swagger UI). But modern AI frameworks like LangChain, OpenAI, and Anthropic's Claude Desktop require a specific "tool_use" or "function calling" JSON schema format to interact with external systems.</p>
  <p class="section-sub">Manually rewriting your OpenAPI paths, request bodies, and security schemes into agent-compatible tools is a massive maintenance burden. Instead of rewriting, you can bridge the gap dynamically.</p>
</section>

<section id="how">
  <div class="section-label">the architecture</div>
  <h2>Compiling OpenAPI to MCP on the fly</h2>
  <pre><code><span class="c"># Pass any valid OpenAPI v3 URL to wmcp.sh's tool extractor API</span>
<span class="k">curl</span> -X GET <span class="s">"https://wmcp.sh/api/v1/tools?url=https://api.example.com/openapi.json"</span> \\
  -H <span class="s">"Authorization: Bearer YOUR_WMCP_KEY"</span>

<span class="c"># wmcp.sh returns an array of MCP-compatible tool definitions</span>
<span class="c"># Example output:</span>
<span class="s">[
  {
    "name": "createOrder",
    "description": "Create a new order in the system",
    "inputSchema": {
      "type": "object",
      "properties": {
        "sku": { "type": "string" },
        "quantity": { "type": "integer" }
      },
      "required": ["sku", "quantity"]
    }
  }
]</span></code></pre>
</section>

<section id="capabilities">
  <div class="section-label">capability</div>
  <h2>Tool definition strategies</h2>
  <table>
    <thead><tr><th>Capability</th><th>Without wmcp.sh</th><th>With wmcp.sh</th></tr></thead>
    <tbody>
      <tr><td><strong>Tool generation</strong></td><td>⚠️ Hand-written JSON schemas</td><td class="ours">✅ Extracted directly from OpenAPI paths</td></tr>
      <tr><td><strong>Schema sync</strong></td><td>❌ Manual updates required when API changes</td><td class="ours">✅ Always matches your live OpenAPI spec</td></tr>
      <tr><td><strong>Security & Auth</strong></td><td>⚠️ Hardcoded tokens in agent logic</td><td class="ours">✅ Auto-injected via OpenAPI securitySchemes</td></tr>
      <tr><td><strong>Framework support</strong></td><td>⚠️ Write adapters for LangChain, OpenAI, etc.</td><td class="ours">✅ Native MCP protocol, compatible everywhere</td></tr>
      <tr><td><strong>Route filtering</strong></td><td>❌ All or nothing exposure</td><td class="ours">✅ Filter by OpenAPI tags (e.g. <code>?tag=agent</code>)</td></tr>
    </tbody>
  </table>
</section>

<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions.</h2>
  <details><summary>What is the difference between OpenAPI and Swagger?</summary><p class="answer">Swagger was the original name for the specification (up to version 2.0). It was donated to the Linux Foundation and renamed OpenAPI Specification (OAS) from version 3.0 onwards. Swagger now refers to the tooling ecosystem (like Swagger UI).</p></details>
  <details><summary>Why do AI agents need OpenAPI?</summary><p class="answer">AI agents from Anthropic and OpenAI cannot read your backend source code. An OpenAPI spec provides a machine-readable map of your endpoints, inputs, and outputs, which can be translated into function calling schemas.</p></details>
  <details><summary>Which OpenAPI versions does wmcp.sh support?</summary><p class="answer">wmcp.sh primarily supports OpenAPI v3.0 and v3.1, which are the modern standards. v2.0 (Swagger) specs are usually auto-upconverted or can be easily migrated.</p></details>
  <details><summary>Is OpenAPI required for the Model Context Protocol (MCP)?</summary><p class="answer">No, MCP is protocol-agnostic. However, if you already have a REST API, providing an OpenAPI spec is the fastest way to generate an MCP server, as platforms like wmcp.sh can convert it dynamically.</p></details>
</section>

<section id="upgrade" style="margin-top:36px;background:linear-gradient(135deg,var(--card),rgba(255,158,44,0.08));border:1px solid rgba(255,158,44,0.35);border-radius:16px;padding:22px 26px">
  <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;justify-content:space-between">
    <div style="flex:1;min-width:240px">
      <div style="font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent2);font-weight:700;margin-bottom:6px">Need this done for you?</div>
      <h3 style="margin:0 0 4px;font-size:1.05rem;color:var(--text)">Skip the wiring — we build, deploy, and monitor.</h3>
      <p style="color:var(--muted);margin:0;font-size:.92rem">Custom adapter + hosted MCP at <code>mcp.yourbrand.com</code> + verified badge. From <strong style="color:var(--text)">$499 one-time setup</strong>.</p>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <a href="/managed" style="display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#ff9e2c,#ffcf7a);color:#0c0c14;padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:700;font-size:.9rem">See /managed →</a>
      <a href="/directory/submit" style="display:inline-flex;align-items:center;gap:6px;background:#11111c;border:1px solid #26263a;color:var(--text);padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:600;font-size:.9rem">Submit (free)</a>
    </div>
  </div>
</section>

</div>

<footer>
  <a href="/">Home</a> · <a href="/agent-ready">Agent-ready</a> · <a href="/managed">Done for you</a> · <a href="/blog">Blog</a> · <a href="/directory">Directory</a> · <a href="/directory/submit">Submit</a> · <a href="/glossary/mcp">MCP</a> · <a href="/glossary/tool-use">Tool Use</a> · <a href="/glossary/function-calling">Function Calling</a> · <a href="/glossary/json-ld">JSON-LD</a> · <a href="https://github.com/New1Direction/webmcp-anything">GitHub</a>
</footer>
</body>
</html>`;
}
