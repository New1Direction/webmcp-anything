export function howToDebugMcpToolCallsHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>How to Debug MCP Tool Calls - wmcp.sh</title>
<meta name="description" content="A comprehensive guide to debugging MCP tool calls, inspecting tool_use blocks, and handling schema mismatches and rate limits." />
<link rel="canonical" href="\${origin}/how-to/debug-mcp-tool-calls" />
<meta property="og:title" content="How to Debug MCP Tool Calls" />
<meta property="og:description" content="A comprehensive guide to debugging MCP tool calls, inspecting tool_use blocks, and handling schema mismatches and rate limits." />
<meta property="og:url" content="\${origin}/how-to/debug-mcp-tool-calls" />
<meta property="og:image" content="\${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="How to Debug MCP Tool Calls" />
<meta name="twitter:description" content="A comprehensive guide to debugging MCP tool calls, inspecting tool_use blocks, and handling schema mismatches and rate limits." />
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article","headline":"How to Debug MCP Tool Calls","description":"A comprehensive guide to debugging MCP tool calls, inspecting tool_use blocks, and handling schema mismatches and rate limits.","author":{"@type":"Organization","name":"WebMCP Anything"},"publisher":{"@type":"Organization","name":"WebMCP Anything","url":"https://wmcp.sh"},"datePublished":"2026-05-28","dateModified":"2026-05-28","mainEntityOfPage":"\${origin}/how-to/debug-mcp-tool-calls"}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
  {"@type":"Question","name":"How do I inspect a tool_use block?","acceptedAnswer":{"@type":"Answer","text":"Enable verbose logging in your client to capture the raw JSON payload returned by the language model. You will see a tool_use or function_call block containing the tool name and arguments."}},
  {"@type":"Question","name":"What causes schema mismatch errors?","acceptedAnswer":{"@type":"Answer","text":"Schema mismatches occur when the LLM hallucinates arguments or formats them incorrectly based on the provided JSON schema. Ensure your descriptions are clear and concise."}},
  {"@type":"Question","name":"How do I debug rate limits?","acceptedAnswer":{"@type":"Answer","text":"Check the HTTP headers for 429 Too Many Requests. Implement short TTL caching (~1s) using wmcp.sh to deduplicate identical calls and reduce backend load."}},
  {"@type":"Question","name":"Is wmcp.sh affiliated with Anthropic or OpenAI?","acceptedAnswer":{"@type":"Answer","text":"No. wmcp.sh is an independent provider and is not affiliated with Anthropic, OpenAI, or Microsoft."}}
]}
</script>
<style>
  :root { --bg:#07070d;--card:#16161f;--bg2:#11111c;--border:#26263a;--text:#ececf5;--muted:#8a8aa8;--dim:#6a6a88;--accent:#7c5cff;--accent2:#00e5ff;--green:#4ade80;--red:#f87171;--pink:#f0abfc;--gold:#fbbf24; }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin:0;min-height:100vh;color:var(--text);background:var(--bg);font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif;line-height:1.6;background-image:radial-gradient(ellipse 900px 600px at 10% -5%,rgba(124,92,255,.18),transparent 60%),radial-gradient(ellipse 700px 500px at 95% 10%,rgba(0,229,255,.10),transparent 60%); }
  .wrap { max-width: 920px; margin: 0 auto; padding: 0 24px; }
  nav { display:flex;justify-content:space-between;align-items:center;padding:22px 24px;max-width:1080px;margin:0 auto; }
  nav .brand { font-weight: 800; letter-spacing: -.02em; font-size: 1.05rem; }
  nav .brand a { color: inherit; text-decoration: none; }
  nav .brand span { color: var(--accent2); }
  nav .links { display: flex; gap: 22px; font-size: .9rem; }
  nav .links a { color: var(--muted); text-decoration: none; }
  nav .cta { background: var(--bg2); border: 1px solid var(--border); padding: 7px 14px; border-radius: 8px; font-size: .85rem; color: var(--text); text-decoration: none; font-weight: 600; }
  header.hero { padding: 50px 0 30px; }
  .badge { display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;font-size:.7rem;letter-spacing:.15em;text-transform:uppercase;font-weight:700;background:linear-gradient(90deg,rgba(124,92,255,.18),rgba(0,229,255,.18));border:1px solid rgba(124,92,255,.35);margin-bottom:18px; }
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
  td.ours { background: rgba(124,92,255,0.05); }
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
  <div class="badge"><span class="dot"></span> HOW-TO &middot; DEBUG-MCP-TOOL-CALLS</div>
  <h1>How to Debug MCP Tool Calls</h1>
  <p class="sub">When agent tool calls fail, debugging opaque LLM outputs is frustrating. Learn how to inspect tool schemas, trace execution, and fix common MCP errors using wmcp.sh.</p>
</header>

<section id="wedge">
  <div class="section-label">the gap</div>
  <h2>Blind agents and broken schemas</h2>
  <p class="section-sub">A common hurdle when building Model Context Protocol (MCP) integrations is the language model inventing arguments or hallucinating endpoints. Without visibility into the raw tool_use blocks, debugging schema mismatches or rate limit failures is a guessing game.</p>
  <p class="section-sub" style="font-size:0.8rem"><em>Disclaimer: wmcp.sh is an independent infrastructure provider and is not affiliated with Anthropic, OpenAI, or Microsoft.</em></p>
</section>

<section id="how">
  <div class="section-label">the flow</div>
  <h2>Inspecting tool_use schemas dynamically</h2>
  <pre><code><span class="c"># 1. Fetch the exact tool schema the LLM sees</span>
<span class="k">curl</span> -s "https://wmcp.sh/api/v1/tools?url=https://acme-corp.example/openapi.yaml" | jq

<span class="c"># 2. Example output highlighting expected arguments</span>
{
  "tools": [
    {
      "name": "get_customer_data",
      "description": "Retrieve customer information",
      "input_schema": {
        "type": "object",
        "properties": {
          "customerId": { "type": "string" }
        },
        "required": ["customerId"]
      }
    }
  ]
}

<span class="c"># 3. If the LLM sends "customer_id" instead of "customerId", the call will fail.</span>
<span class="c">#    Use wmcp.sh verbose logging to catch this mismatch instantly.</span></code></pre>
</section>

<section id="capabilities">
  <div class="section-label">capability</div>
  <h2>Debugging Features</h2>
  <table>
    <thead><tr><th>Capability</th><th>Without wmcp.sh</th><th>With wmcp.sh</th></tr></thead>
    <tbody>
      <tr><td><strong>Schema Inspection</strong></td><td>❌ Manual parsing of OpenAPI specs</td><td class="ours">✅ Real-time API extraction</td></tr>
      <tr><td><strong>Sub-100ms Latency</strong></td><td>⚠️ Gateway overhead delays debugging loops</td><td class="ours">✅ Fast feedback via edge execution</td></tr>
      <tr><td><strong>Verbose Logging</strong></td><td>❌ Opaque LLM runtime errors</td><td class="ours">✅ Detailed tracing for tool_use blocks</td></tr>
      <tr><td><strong>Rate Limit Mitigation</strong></td><td>⚠️ Failures on duplicate requests</td><td class="ours">✅ Short TTL cache (~1s) deduplication</td></tr>
    </tbody>
  </table>
</section>

<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions.</h2>
  <details><summary>How do I inspect a tool_use block?</summary><p class="answer">Enable verbose logging in your client to capture the raw JSON payload returned by the language model. You will see a tool_use or function_call block containing the tool name and arguments.</p></details>
  <details><summary>What causes schema mismatch errors?</summary><p class="answer">Schema mismatches occur when the LLM hallucinates arguments or formats them incorrectly based on the provided JSON schema. Ensure your descriptions are clear and concise.</p></details>
  <details><summary>How do I debug rate limits?</summary><p class="answer">Check the HTTP headers for 429 Too Many Requests. Implement short TTL caching (~1s) using wmcp.sh to deduplicate identical calls and reduce backend load.</p></details>
  <details><summary>Is wmcp.sh affiliated with Anthropic or OpenAI?</summary><p class="answer">No. wmcp.sh is an independent provider and is not affiliated with Anthropic, OpenAI, or Microsoft.</p></details>
</section>

<section id="upgrade" style="margin-top:36px;background:linear-gradient(135deg,var(--card),rgba(124,92,255,0.08));border:1px solid rgba(124,92,255,0.35);border-radius:16px;padding:22px 26px">
  <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;justify-content:space-between">
    <div style="flex:1;min-width:240px">
      <div style="font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent2);font-weight:700;margin-bottom:6px">Need this done for you?</div>
      <h3 style="margin:0 0 4px;font-size:1.05rem;color:var(--text)">Skip the wiring — we build, deploy, and monitor.</h3>
      <p style="color:var(--muted);margin:0;font-size:.92rem">Custom adapter + hosted MCP at <code>mcp.yourbrand.com</code> + verified badge. From <strong style="color:var(--text)">$499 one-time setup</strong>. (Pro: $999/mo, Enterprise: $4,999+/mo)</p>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <a href="/managed" style="display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#7c5cff,#00e5ff);color:#0c0c14;padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:700;font-size:.9rem">See /managed →</a>
      <a href="/directory/submit" style="display:inline-flex;align-items:center;gap:6px;background:#11111c;border:1px solid #26263a;color:var(--text);padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:600;font-size:.9rem">Submit (free)</a>
    </div>
  </div>
</section>

</div>

<footer>
  <a href="/">Home</a> · <a href="/agent-ready">Agent-ready</a> · <a href="/managed">Done for you</a> · <a href="/blog">Blog</a> · <a href="/directory">Directory</a> · <a href="/directory/submit">Submit</a> · <a href="/how-to/secure-mcp-oauth">Secure OAuth</a> · <a href="/how-to/deploy-mcp-on-cloudflare-workers">Deploy on Cloudflare</a> · <a href="https://github.com/New1Direction/webmcp-anything">GitHub</a>
</footer>
</body>
</html>`;
}
