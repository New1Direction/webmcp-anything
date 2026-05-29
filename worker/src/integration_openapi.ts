// integration_openapi.ts — /integration/openapi SEO landing page.
//
// Target query family: "openapi to mcp tools", "openapi to mcp server",
// "generate mcp from openapi", "mcp server openapi". SERP analyzed
// 2026-05-27. Dominant winners: Speakeasy (managed codegen),
// openapi-mcp-generator (CLI codegen), run-llama/fastmcp (Python library),
// agentgateway (proxy).
//
// Our differentiator: zero codegen step. Hand a spec URL to wmcp.sh,
// get back a typed tool list. No build, no host, no maintenance.

export function integrationOpenapiHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>OpenAPI to MCP — Hosted MCP server, no codegen | wmcp.sh</title>
<meta name="description" content="Turn any OpenAPI 3.x or Swagger 2.0 spec URL into agent-callable MCP tools. No codegen, no build step. Works with Claude, OpenAI, LangChain. Free tier." />
<link rel="canonical" href="${origin}/integration/openapi" />
<meta property="og:title" content="OpenAPI to MCP — no codegen, just a URL" />
<meta property="og:description" content="Hand any OpenAPI spec to wmcp.sh and get back agent-callable tools. No build step. Works with Claude, OpenAI, LangChain." />
<meta property="og:url" content="${origin}/integration/openapi" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="OpenAPI to MCP — no codegen, just a URL" />
<meta name="twitter:description" content="Hand any OpenAPI spec to wmcp.sh and get back agent-callable tools. No build step." />
<meta name="twitter:image" content="${origin}/og.png" />
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "OpenAPI to MCP — Hosted MCP server, no codegen",
  "description": "Turn any OpenAPI 3.x or Swagger 2.0 spec URL into agent-callable MCP tools. No codegen step.",
  "author": { "@type": "Organization", "name": "WebMCP Anything" },
  "publisher": { "@type": "Organization", "name": "WebMCP Anything", "url": "https://wmcp.sh" },
  "datePublished": "2026-05-27",
  "dateModified": "2026-05-27",
  "mainEntityOfPage": "${origin}/integration/openapi"
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What does the OpenAPI to MCP conversion produce?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "One MCP tool per path × method in the spec. Tool name comes from operationId (falls back to method_path). Input schema is built from parameters + requestBody, with $refs to #/components/schemas/ resolved one hop deep. Each tool has an openapi_request action so agents can execute the call directly through wmcp.sh."
      }
    },
    {
      "@type": "Question",
      "name": "How does this differ from openapi-mcp-generator or Speakeasy?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Codegen tools (openapi-mcp-generator, Speakeasy Gram, run-llama/fastmcp) require generating + hosting an MCP server you maintain. wmcp.sh is a hosted endpoint — POST a spec URL, get tools back. No code, no server, no upgrades. Trade-off: less customization. Win: instant integration."
      }
    },
    {
      "@type": "Question",
      "name": "How does authentication work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Three modes. (1) Public APIs (no auth) work directly. (2) Pass an explicit auth header via the _auth pseudo-arg in tool execute calls. (3) Connect the provider via wmcp.sh's OAuth dashboard (Stripe, GitHub, Google, Slack, Notion, Linear) — the worker auto-injects your stored token when the API host matches a connected provider."
      }
    },
    {
      "@type": "Question",
      "name": "Does it support OpenAPI 3.x and Swagger 2.0?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Both. JSON specs only in v0 (most published APIs offer JSON variants). YAML support is a small follow-up — open an issue if you need it."
      }
    },
    {
      "@type": "Question",
      "name": "What about $ref resolution?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "$refs to #/components/schemas/... in OpenAPI 3 (or #/definitions/... in Swagger 2) are resolved one hop deep. That means nested model references in parameters and request bodies get flattened so agents see real fields, not bare $ref pointers. Petstore's POST /pet correctly emits id, name, category, photoUrls, etc."
      }
    },
    {
      "@type": "Question",
      "name": "Can I execute the operations, not just see schemas?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. POST /api/v1/tools/execute with { url, tool, args }. wmcp.sh constructs the HTTP request from the operation's method + path + parameter locations (path / query / header / body) and returns the response. Live for any tool with an openapi_request action."
      }
    }
  ]
}
</script>
<style>
  :root {
    --bg: #07070d; --card: #16161f; --bg2: #11111c; --border: #26263a;
    --text: #ececf5; --muted: #8a8aa8; --dim: #6a6a88;
    --accent: #ff9e2c; --accent2: #ffcf7a; --green: #4ade80; --red: #f87171; --pink: #ffb86b;
  }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    margin: 0; min-height: 100vh; color: var(--text); background: var(--bg);
    font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
    line-height: 1.6;
    background-image:
      radial-gradient(ellipse 900px 600px at 10% -5%, rgba(255,158,44,.18), transparent 60%),
      radial-gradient(ellipse 700px 500px at 95% 10%, rgba(255,176,0,.10), transparent 60%);
  }
  .wrap { max-width: 920px; margin: 0 auto; padding: 0 24px; }
  nav { display: flex; justify-content: space-between; align-items: center; padding: 22px 24px; max-width: 1080px; margin: 0 auto; }
  nav .brand { font-weight: 800; letter-spacing: -.02em; font-size: 1.05rem; }
  nav .brand span { color: var(--accent2); }
  nav .links { display: flex; gap: 22px; font-size: .9rem; }
  nav .links a { color: var(--muted); text-decoration: none; transition: color .15s; }
  nav .links a:hover { color: var(--text); }
  nav .cta { background: var(--bg2); border: 1px solid var(--border); padding: 7px 14px; border-radius: 8px; font-size: .85rem; color: var(--text); text-decoration: none; font-weight: 600; }
  nav .cta:hover { border-color: var(--accent); }

  header.hero { padding: 50px 0 30px; }
  .badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 999px; font-size: .7rem; letter-spacing: .15em; text-transform: uppercase; font-weight: 700; background: linear-gradient(90deg, rgba(255,158,44,.18), rgba(255,176,0,.18)); border: 1px solid rgba(255,158,44,.35); margin-bottom: 18px; }
  .dot { width: 6px; height: 6px; background: var(--accent2); border-radius: 50%; box-shadow: 0 0 8px var(--accent2); }
  h1 { font-size: clamp(2rem, 4.5vw, 3rem); margin: 0 0 18px; background: linear-gradient(135deg, #fff 30%, var(--accent2) 100%); -webkit-background-clip: text; background-clip: text; color: transparent; line-height: 1.05; font-weight: 800; letter-spacing: -.02em; }
  .sub { color: var(--muted); font-size: 1.05rem; max-width: 640px; margin: 0 0 24px; }
  .hint { color: var(--dim); font-size: .85rem; margin-top: 8px; }

  section { padding: 36px 0; }
  .section-label { display: inline-block; font-size: .72rem; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; color: var(--accent2); margin-bottom: 10px; }
  h2 { font-size: clamp(1.4rem, 3vw, 1.9rem); margin: 0 0 12px; font-weight: 700; letter-spacing: -.02em; }
  .section-sub { color: var(--muted); max-width: 640px; margin: 0 0 24px; }

  pre { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 16px 18px; overflow-x: auto; font-size: .82rem; color: var(--green); font-family: "SF Mono", Menlo, monospace; line-height: 1.5; margin: 14px 0; }
  pre .k { color: var(--accent2); } pre .s { color: var(--pink); } pre .c { color: var(--dim); }
  code { font-family: "SF Mono", Menlo, monospace; }

  .demo-box { background: var(--card); border: 1px solid var(--border); border-radius: 18px; padding: 24px; margin-top: 8px; }
  .row { display: flex; gap: 8px; flex-wrap: wrap; }
  input[type=url] { flex: 1; min-width: 240px; background: var(--bg2); border: 1px solid var(--border); color: var(--text); border-radius: 10px; padding: 13px 16px; font-family: "SF Mono", Menlo, monospace; font-size: .9rem; }
  input:focus { outline: none; border-color: var(--accent); }
  button.go { background: linear-gradient(135deg, var(--accent), var(--accent2)); color: white; border: none; border-radius: 10px; padding: 13px 22px; font-weight: 700; cursor: pointer; font-family: inherit; }
  button.go:disabled { opacity: .5; cursor: wait; }
  .chips { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 14px; }
  .chip { background: var(--bg2); border: 1px solid var(--border); padding: 6px 12px; border-radius: 999px; font-size: .78rem; color: var(--muted); cursor: pointer; }
  .chip:hover { color: var(--text); border-color: var(--accent); }

  table { width: 100%; border-collapse: collapse; text-align: left; font-size: .9rem; margin-top: 16px; }
  th, td { padding: 14px 16px; border-bottom: 1px solid var(--border); vertical-align: top; }
  th { background: var(--bg2); font-weight: 700; color: var(--accent2); }
  tr:last-child td { border-bottom: none; }
  td strong { color: var(--text); }

  details { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 18px 20px; margin-bottom: 12px; }
  details summary { font-weight: 700; font-size: 1rem; color: var(--text); cursor: pointer; list-style: none; }
  details[open] summary { margin-bottom: 12px; }
  details .answer { color: var(--muted); font-size: .92rem; line-height: 1.65; }

  footer { border-top: 1px solid var(--border); margin-top: 40px; padding: 30px 0; text-align: center; color: var(--muted); font-size: .85rem; }
  footer a { color: var(--accent2); text-decoration: none; margin: 0 8px; }
  .back { color: var(--muted); text-decoration: none; font-size: .85rem; }
</style>
</head>
<body>

<nav>
  <div class="brand"><a href="/" style="color:inherit;text-decoration:none">wmcp<span>.sh</span></a></div>
  <div class="links">
    <a href="/agent-ready">Agent-ready</a>
    <a href="/agent-ready/api">API</a>
    <a href="/managed">Done for you</a>
    <a href="/price-data">Price data</a>
    <a href="/directory">Directory</a>
  </div>
  <a class="cta" href="/dashboard">Dashboard →</a>
</nav>

<div class="wrap">

<header class="hero">
  <div class="badge"><span class="dot"></span> integration · openapi</div>
  <h1>Turn any OpenAPI spec into MCP tools.</h1>
  <p class="sub">Point wmcp.sh at any OpenAPI 3.x or Swagger 2.0 spec URL. Get back agent-callable tools — typed input schemas, live execute, $ref resolution. No codegen, no build step, no server to maintain.</p>
  <p class="hint">Last updated 2026-05-27 · works with Claude, OpenAI, LangChain, and any MCP client</p>
</header>

<!-- ========== LIVE DEMO ========== -->
<section id="demo">
  <div class="section-label">Try it</div>
  <h2>Hand a spec URL, get the tools.</h2>
  <p class="section-sub">No signup. Free tier handles 100 reads/day per IP.</p>

  <div class="demo-box">
    <div class="row">
      <input id="u" type="url" placeholder="https://petstore3.swagger.io/api/v3/openapi.json" />
      <button class="go" id="go">⚡ Get tools</button>
    </div>
    <div class="chips">
      <span style="color:var(--muted);font-size:.78rem;align-self:center">try:</span>
      <span class="chip" data-u="https://petstore3.swagger.io/api/v3/openapi.json">Petstore v3</span>
      <span class="chip" data-u="https://petstore.swagger.io/v2/swagger.json">Petstore v2 (Swagger)</span>
      <span class="chip" data-u="https://api.frankfurter.app/openapi.json">Frankfurter FX</span>
    </div>
    <pre id="out"><span class="c">// Paste an OpenAPI spec URL and click Get tools.</span></pre>
  </div>
</section>

<!-- ========== HOW IT WORKS ========== -->
<section id="how">
  <div class="section-label">How it works</div>
  <h2>The mapping</h2>
  <p class="section-sub">Mechanical, deterministic, and consistent across every spec.</p>

  <table>
    <thead>
      <tr><th>OpenAPI concept</th><th>becomes</th></tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>path × method</strong> (e.g. <code>POST /pet</code>)</td>
        <td>one MCP tool</td>
      </tr>
      <tr>
        <td><strong>operationId</strong></td>
        <td>tool name (fallback: <code>method_path</code>, sanitized)</td>
      </tr>
      <tr>
        <td><strong>summary</strong> / <strong>description</strong></td>
        <td>tool description (300 char cap)</td>
      </tr>
      <tr>
        <td><strong>parameters</strong> (path / query / header)</td>
        <td>inputSchema properties, with <code>required</code> tracked</td>
      </tr>
      <tr>
        <td><strong>requestBody.content[application/json].schema</strong></td>
        <td>inputSchema properties (refs resolved one hop)</td>
      </tr>
      <tr>
        <td><strong>$ref</strong> to <code>#/components/schemas/X</code></td>
        <td>inlined from the spec root (Swagger: <code>#/definitions/X</code>)</td>
      </tr>
      <tr>
        <td><strong>servers[0].url</strong></td>
        <td>baseUrl for the openapi_request action (with relative URL resolution)</td>
      </tr>
      <tr>
        <td>everything else</td>
        <td>preserved in the action context for the execute call</td>
      </tr>
    </tbody>
  </table>
</section>

<!-- ========== COMPARISON ========== -->
<section id="vs">
  <div class="section-label">Positioning</div>
  <h2>Hosted vs. codegen</h2>
  <p class="section-sub">Three established ways to bridge OpenAPI to MCP. They make different tradeoffs.</p>

  <table>
    <thead>
      <tr>
        <th>Capability</th>
        <th>openapi-mcp-generator (CLI)</th>
        <th>Speakeasy Gram (managed)</th>
        <th>wmcp.sh (hosted)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Setup</strong></td>
        <td>Generate code, host the server</td>
        <td>Upload spec, configure platform</td>
        <td><strong>POST a URL</strong></td>
      </tr>
      <tr>
        <td><strong>You maintain</strong></td>
        <td>Generated code + runtime</td>
        <td>Platform account</td>
        <td><strong>Nothing</strong></td>
      </tr>
      <tr>
        <td><strong>Spec change</strong></td>
        <td>Re-generate + re-deploy</td>
        <td>Re-upload + republish</td>
        <td><strong>Auto-refresh (24h cache)</strong></td>
      </tr>
      <tr>
        <td><strong>Cost (free tier)</strong></td>
        <td>Self-hosted costs only</td>
        <td>Free + paid platform tiers</td>
        <td><strong>100 reads/day free</strong></td>
      </tr>
      <tr>
        <td><strong>Customization</strong></td>
        <td>Full (edit generated code)</td>
        <td>Platform-bounded</td>
        <td>Adapter-bounded (PR welcome)</td>
      </tr>
      <tr>
        <td><strong>Auth handling</strong></td>
        <td>You wire it up per service</td>
        <td>Platform manages tokens</td>
        <td><strong>OAuth vault (Stripe/GH/etc auto-injected)</strong></td>
      </tr>
      <tr>
        <td><strong>Best for</strong></td>
        <td>Deep customization, isolated infra</td>
        <td>Teams managing many specs</td>
        <td><strong>"Just give my agent access — now"</strong></td>
      </tr>
    </tbody>
  </table>
</section>

<!-- ========== AUTH ========== -->
<section id="auth">
  <div class="section-label">Authentication</div>
  <h2>The auth most people get wrong</h2>
  <p class="section-sub">Three modes, from no-auth public APIs to full OAuth via wmcp.sh's token vault.</p>

  <div style="display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));margin-top:14px">
    <div style="background:var(--card);border:1px solid var(--border);border-radius:14px;padding:18px">
      <strong style="color:var(--accent2)">1. Public APIs</strong>
      <p style="color:var(--muted);font-size:.9rem;margin-top:6px">No header required. Most "open" APIs (Petstore, Frankfurter, public NOAA endpoints) just work. Agents call <code>tools/execute</code> and the worker fires the request unauthenticated.</p>
    </div>
    <div style="background:var(--card);border:1px solid var(--border);border-radius:14px;padding:18px">
      <strong style="color:var(--accent2)">2. Explicit auth</strong>
      <p style="color:var(--muted);font-size:.9rem;margin-top:6px">Pass <code>_auth</code> in the tool args. Value goes verbatim into the <code>Authorization</code> header.</p>
      <pre style="margin-top:8px;font-size:.74rem"><code>{ <span class="k">"_auth"</span>: <span class="s">"Bearer sk_…"</span>,
  <span class="k">"customer_email"</span>: <span class="s">"…"</span> }</code></pre>
    </div>
    <div style="background:linear-gradient(135deg,var(--card),rgba(255,158,44,.08));border:1px solid var(--accent);border-radius:14px;padding:18px">
      <strong style="color:var(--accent2)">3. Connected OAuth</strong>
      <p style="color:var(--muted);font-size:.9rem;margin-top:6px">Connect Stripe / GitHub / Google / Slack / Notion / Linear once at <a href="/dashboard" style="color:var(--accent2);text-decoration:none">/dashboard</a>. When you call an OpenAPI tool whose host matches a connected provider, the worker auto-injects your encrypted token. Agents never see auth args.</p>
    </div>
  </div>
</section>

<!-- ========== SDK SNIPPETS ========== -->
<section id="snippets">
  <div class="section-label">Integrate</div>
  <h2>Three lines into any agent stack</h2>

  <p class="section-sub"><strong style="color:var(--text)">cURL</strong> — raw HTTP, drop into any pipeline.</p>
  <pre><code><span class="k">curl</span> <span class="s">'${origin}/api/v1/tools?url=https://petstore3.swagger.io/api/v3/openapi.json'</span></code></pre>

  <p class="section-sub"><strong style="color:var(--text)">Python</strong> — <code>pip install wmcp</code></p>
  <pre><code><span class="k">from</span> wmcp <span class="k">import</span> WmcpClient
<span class="k">from</span> wmcp.anthropic <span class="k">import</span> to_anthropic_tools

client = WmcpClient()
spec   = <span class="s">"https://petstore3.swagger.io/api/v3/openapi.json"</span>
tools  = client.tools(spec)               <span class="c"># wmcp Tool list</span>
anthropic_tools = to_anthropic_tools(tools)  <span class="c"># Anthropic SDK shape</span></code></pre>

  <p class="section-sub"><strong style="color:var(--text)">JavaScript / TypeScript</strong> — <code>npm install @wmcp/sdk</code></p>
  <pre><code><span class="k">import</span> { WmcpClient } <span class="k">from</span> <span class="s">"@wmcp/sdk"</span>;
<span class="k">import</span> { toOpenAITools } <span class="k">from</span> <span class="s">"@wmcp/sdk/openai"</span>;

<span class="k">const</span> client = <span class="k">new</span> WmcpClient();
<span class="k">const</span> tools  = <span class="k">await</span> client.tools(<span class="s">"https://petstore3.swagger.io/api/v3/openapi.json"</span>);
<span class="k">const</span> openaiTools = toOpenAITools(tools);</code></pre>

  <p class="section-sub"><strong style="color:var(--text)">Claude tool_use</strong> — one round trip</p>
  <pre><code><span class="k">const</span> { tools } = <span class="k">await</span> (<span class="k">await</span> fetch(
  <span class="s">\`${origin}/api/v1/tools?url=\${encodeURIComponent(specUrl)}\`</span>
)).json();
<span class="k">const</span> msg = <span class="k">await</span> anthropic.messages.create({
  model: <span class="s">"claude-opus-4-7"</span>,
  tools: tools.map(t =&gt; ({
    name: t.name,
    description: t.description,
    input_schema: t.inputSchema || { type: <span class="s">"object"</span>, properties: {} }
  })),
  messages: [{ role: <span class="s">"user"</span>, content: <span class="s">"Find a pending pet by status and return its name."</span> }]
});</code></pre>
</section>

<!-- ========== FAQ ========== -->
<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Frequently asked</h2>

  <details><summary>What does the OpenAPI → MCP conversion produce?</summary>
  <div class="answer">One MCP tool per <code>path × method</code> in the spec. Tool name from <code>operationId</code> (fallback: <code>method_path</code>, sanitized). <code>inputSchema</code> built from parameters + <code>requestBody</code>, with <code>$ref</code>s to <code>#/components/schemas/</code> resolved one hop deep. Each tool has an <code>openapi_request</code> action so agents can execute the call directly through wmcp.sh.</div>
  </details>

  <details><summary>How does this differ from openapi-mcp-generator or Speakeasy?</summary>
  <div class="answer">Codegen tools (<code>openapi-mcp-generator</code>, Speakeasy Gram, <code>run-llama/fastmcp</code>) require generating + hosting an MCP server you maintain. wmcp.sh is a hosted endpoint — POST a spec URL, get tools back. No code, no server, no upgrades. The trade-off: less customization. The win: instant integration, no build step. See the comparison table above.</div>
  </details>

  <details><summary>How does authentication work?</summary>
  <div class="answer">Three modes — public APIs need none, you can pass an explicit <code>_auth</code> header in tool args, or you can connect the provider once at <a href="/dashboard">/dashboard</a> and wmcp.sh auto-injects your stored OAuth token when calls hit that provider's API host. The vault is AES-GCM-256 encrypted at rest.</div>
  </details>

  <details><summary>OpenAPI 3.x and Swagger 2.0?</summary>
  <div class="answer">Both. JSON specs only in v0 (most published APIs offer JSON variants of any YAML). YAML support is a small follow-up — open a GitHub issue if you need it.</div>
  </details>

  <details><summary>$ref resolution depth?</summary>
  <div class="answer">One hop. Refs to <code>#/components/schemas/Pet</code> (or <code>#/definitions/Pet</code> in Swagger 2) get inlined. Nested refs inside the resolved schema stay as <code>$ref</code> — agents handle the second hop fine because the field shape is still inspectable. For Petstore's <code>POST /pet</code>, you get <code>id, name, category, photoUrls, tags, status</code> at the top level.</div>
  </details>

  <details><summary>Can I execute the operations, not just fetch schemas?</summary>
  <div class="answer">Yes. <code>POST /api/v1/tools/execute</code> with <code>{ url, tool, args }</code>. wmcp.sh constructs the HTTP request from the operation's method + path template + parameter locations (path / query / header / body) and returns the response wrapped as <code>{ ok, value: { status, data } }</code>. Live for every tool with an <code>openapi_request</code> action.</div>
  </details>

  <details><summary>How long are specs cached?</summary>
  <div class="answer">24 hours. Spec contents rarely change between versions; the 24h TTL means a single OpenAPI ingest serves many agents fast. Pass <code>?fresh=1</code> to bypass cache during development.</div>
  </details>
</section>

<section id="see-also">
  <div class="section-label">See also</div>
  <h2>Making your API agent-callable</h2>
  <p style="color:var(--muted);margin-bottom:14px">If you're shipping an API and want it to show up as MCP tools for Claude / Cursor / Codex users, the 5 things to get right are at <a href="/agent-ready/api" style="color:var(--accent2);text-decoration:none">/agent-ready/api</a>. The cornerstone diagnostic is at <a href="/agent-ready" style="color:var(--accent2);text-decoration:none">/agent-ready</a>. Or have us ship your spec + MCP server: <a href="/managed" style="color:var(--accent2);text-decoration:none">/managed</a> ($499 starter).</p>
</section>

<footer>
  <a href="/">Home</a> · <a href="/agent-ready">Agent-ready</a> · <a href="/agent-ready/api">API</a> · <a href="/managed">Done for you</a> · <a href="/price-data">Price data</a> · <a href="/directory">Directory</a> · <a href="https://github.com/New1Direction/webmcp-anything">GitHub</a>
</footer>

</div>

<script>
const ORIGIN = ${JSON.stringify(origin)};
const out = document.getElementById("out");
const inp = document.getElementById("u");
const btn = document.getElementById("go");

document.querySelectorAll(".chip").forEach(c => {
  c.addEventListener("click", () => { inp.value = c.dataset.u; run(); });
});
btn.addEventListener("click", run);
inp.addEventListener("keydown", e => { if (e.key === "Enter") run(); });

async function run() {
  const url = inp.value.trim();
  if (!url) return;
  btn.disabled = true; btn.textContent = "…";
  out.innerHTML = '<span class="c">// fetching ' + escape(url) + '…</span>';
  try {
    const r = await fetch(ORIGIN + "/api/v1/tools?url=" + encodeURIComponent(url));
    const data = await r.json();
    // Trim huge responses for readability
    if (data.tools && data.tools.length > 4) {
      const total = data.tools.length;
      data.tools = data.tools.slice(0, 4);
      data._note = '+ ' + (total - 4) + ' more tools (full payload via the API)';
    }
    out.innerHTML = colorize(JSON.stringify(data, null, 2));
  } catch (e) {
    out.innerHTML = '<span style="color:var(--red)">' + escape(String(e)) + '</span>';
  } finally {
    btn.disabled = false; btn.textContent = "⚡ Get tools";
  }
}

function escape(s) {
  return s.replace(/[&<>]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;"})[c]);
}
function colorize(json) {
  return escape(json)
    .replace(/&quot;([^&]+?)&quot;:/g, '<span class="k">"$1"</span>:')
    .replace(/: &quot;([^&]*?)&quot;/g, ': <span class="s">"$1"</span>');
}
</script>
</body>
</html>`;
}
