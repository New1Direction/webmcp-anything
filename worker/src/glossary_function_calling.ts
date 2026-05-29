export function glossaryFunctionCallingHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Function Calling (OpenAI) Definition & Glossary | wmcp.sh</title>
<meta name="description" content="Define function calling — OpenAI's standard for agentic tools. Learn about the tools array, tool_choice, parallel tool calls, and high-performance execution." />
<link rel="canonical" href="${origin}/glossary/function-calling" />
<meta property="og:title" content="Function Calling (OpenAI) Definition & Glossary | wmcp.sh" />
<meta property="og:description" content="Define function calling — OpenAI's standard for agentic tools. Learn about the tools array, tool_choice, parallel tool calls, and high-performance execution." />
<meta property="og:url" content="${origin}/glossary/function-calling" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Function Calling (OpenAI) Definition & Glossary | wmcp.sh" />
<meta name="twitter:description" content="Define function calling — OpenAI's standard for agentic tools. Learn about the tools array, tool_choice, parallel tool calls, and high-performance execution." />
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article","headline":"Function Calling (OpenAI) Definition & Glossary | wmcp.sh","description":"Define function calling — OpenAI's standard for agentic tools. Learn about the tools array, tool_choice, parallel tool calls, and high-performance execution.","author":{"@type":"Organization","name":"WebMCP Anything"},"publisher":{"@type":"Organization","name":"WebMCP Anything","url":"https://wmcp.sh"},"datePublished":"2026-05-28","dateModified":"2026-05-28","mainEntityOfPage":"${origin}/glossary/function-calling"}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
  {"@type":"Question","name":"What is function calling?","acceptedAnswer":{"@type":"Answer","text":"Function calling is a feature introduced by OpenAI that allows you to describe functions (tools) to a language model, and have the model intelligently output a JSON object containing arguments to call those functions."}},
  {"@type":"Question","name":"How does it compare to Anthropic's tool_use?","acceptedAnswer":{"@type":"Answer","text":"While the core concept is identical, the payload schemas differ. OpenAI uses a 'tools' array in the request and returns 'tool_calls', whereas Anthropic embeds 'tool_use' blocks directly into the content array."}},
  {"@type":"Question","name":"What is tool_choice?","acceptedAnswer":{"@type":"Answer","text":"The tool_choice parameter allows developers to force the model to call a specific function, force it not to call any functions, or let it decide automatically (the default behavior)."}},
  {"@type":"Question","name":"Why is fast execution important for function calling?","acceptedAnswer":{"@type":"Answer","text":"Since the model halts generation until the function result is returned, slow API connections introduce severe latency. wmcp.sh solves this with sub-100ms execution times and intelligent short TTL caching."}}
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
  <a class="cta" href="/dashboard">Dashboard &rarr;</a>
</nav>

<div class="wrap">

<header class="hero">
  <div class="badge"><span class="dot"></span> GLOSSARY &middot; /GLOSSARY/FUNCTION-CALLING</div>
  <h1>Function Calling (OpenAI)</h1>
  <p class="sub">When a chat application needs to execute code, query a database, or connect to Acme Corp's internal APIs, it uses function calling. But mapping APIs to OpenAI's strict schema by hand is tedious and error-prone. wmcp.sh dynamically compiles these schemas for you.</p>
</header>

<section id="wedge">
  <div class="section-label">the gap</div>
  <h2>The complexity of parallel function execution</h2>
  <p class="section-sub">Function calling—introduced by OpenAI—allows developers to pass an array of available tools in the <code>tools</code> array of a chat completion request. The model then intelligently decides which function to invoke, providing the necessary JSON arguments.</p>
  <p class="section-sub">However, handling the lifecycle of these calls is difficult. Models now support parallel tool calls, meaning the model might ask to execute three functions simultaneously. Your infrastructure must securely hold credentials, execute the network requests, and manage retries. wmcp.sh acts as an execution gateway that handles this automatically, utilizing an encrypted credentials vault for static keys to keep your environment secure. <em>(Note: wmcp.sh is not affiliated with OpenAI, Anthropic, or any other mentioned orgs.)</em></p>
</section>

<section id="how">
  <div class="section-label">the flow</div>
  <h2>Executing a function call with OpenAI</h2>
  <pre><code><span class="k">import</span> <span class="s">OpenAI</span> <span class="k">from</span> <span class="s">"openai"</span>;

<span class="k">const</span> openai <span class="k">=</span> <span class="k">new</span> <span class="s">OpenAI</span>({ apiKey: process.env.OPENAI_API_KEY });

<span class="c">// Fetch dynamic tool schemas from wmcp.sh rather than hardcoding</span>
<span class="k">const</span> toolSchemas <span class="k">=</span> <span class="k">await</span> fetch(<span class="s">"https://api.wmcp.sh/v1/tools?provider=openai"</span>).then(r => r.json());

<span class="k">const</span> response <span class="k">=</span> <span class="k">await</span> openai.chat.completions.create({
  model: <span class="s">"gpt-4o"</span>,
  messages: [{ role: <span class="s">"user"</span>, content: <span class="s">"Fetch the latest logs."</span> }],
  tools: toolSchemas,
  tool_choice: <span class="s">"auto"</span>
});

<span class="c">// Inspect the model's decision</span>
<span class="k">const</span> toolCalls <span class="k">=</span> response.choices[0].message.tool_calls;
<span class="k">if</span> (toolCalls) {
  <span class="k">for</span> (<span class="k">const</span> call <span class="k">of</span> toolCalls) {
    console.log(<span class="s">"OpenAI requested function:"</span>, call.function.name);
    <span class="c">// In production, wmcp.sh executes these in parallel</span>
  }
}</code></pre>
</section>

<section id="capabilities">
  <div class="section-label">capability</div>
  <h2>Managing Function Calls at Scale</h2>
  <table>
    <thead><tr><th>Capability</th><th>Without wmcp.sh</th><th>With wmcp.sh</th></tr></thead>
    <tbody>
      <tr><td><strong>Parallel Execution</strong></td><td>⚠️ Requires custom Promise.all() wiring.</td><td class="ours">✅ Handled concurrently at the edge.</td></tr>
      <tr><td><strong>Schema Generation</strong></td><td>❌ Manually written JSON Schema types.</td><td class="ours">✅ Auto-generated from OpenAPI.</td></tr>
      <tr><td><strong>Performance</strong></td><td>⚠️ Cloud provider routing overhead.</td><td class="ours">✅ Sub-100ms latency execution.</td></tr>
      <tr><td><strong>Caching</strong></td><td>❌ Duplicate queries sent to your DB.</td><td class="ours">✅ Short TTL (~1s) deduplication cache.</td></tr>
    </tbody>
  </table>
</section>

<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions.</h2>
  <details><summary>What is the difference between tools and functions?</summary><p class="answer">In the OpenAI API, "functions" are a specific type of "tool". Currently, function calling is the primary tool type, so the terms are often used interchangeably, though the API expects a wrapper object of type 'function'.</p></details>
  <details><summary>What does tool_choice do?</summary><p class="answer">It dictates behavior. 'none' disables function calling, 'auto' lets the model choose, and specifying a precise function name forces the model to generate arguments for that specific function.</p></details>
  <details><summary>How does this compare to Anthropic's implementation?</summary><p class="answer">While OpenAI relies on the 'tool_calls' array attached to the message object, Anthropic uses 'tool_use' blocks embedded directly within the message content array. Both achieve the same result. wmcp.sh normalizes both formats seamlessly.</p></details>
  <details><summary>How do I prevent rate limits during parallel calls?</summary><p class="answer">Uncached parallel function calls can quickly hit target API rate limits. wmcp.sh utilizes a short TTL caching layer (~1s) to collapse duplicate requests in the same reasoning loop.</p></details>
</section>

<section id="upgrade" style="margin-top:36px;background:linear-gradient(135deg,var(--card),rgba(124,92,255,0.08));border:1px solid rgba(124,92,255,0.35);border-radius:16px;padding:22px 26px">
  <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;justify-content:space-between">
    <div style="flex:1;min-width:240px">
      <div style="font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent2);font-weight:700;margin-bottom:6px">Need this done for you?</div>
      <h3 style="margin:0 0 4px;font-size:1.05rem;color:var(--text)">Skip the wiring — we build, deploy, and monitor.</h3>
      <p style="color:var(--muted);margin:0;font-size:.92rem">Custom adapter + hosted MCP at <code>mcp.yourbrand.com</code> + verified badge. Pricing: <strong style="color:var(--text)">Starter $499 one-time</strong>, <strong>Managed Retainer $999/mo</strong>, or <strong>Enterprise $4,999+/mo</strong>.</p>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <a href="/managed" style="display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#7c5cff,#00e5ff);color:#0c0c14;padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:700;font-size:.9rem">See /managed &rarr;</a>
      <a href="/directory/submit" style="display:inline-flex;align-items:center;gap:6px;background:#11111c;border:1px solid #26263a;color:var(--text);padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:600;font-size:.9rem">Submit (free)</a>
    </div>
  </div>
</section>

</div>

<footer>
  <a href="/">Home</a> &middot; <a href="/agent-ready">Agent-ready</a> &middot; <a href="/managed">Done for you</a> &middot; <a href="/blog">Blog</a> &middot; <a href="/directory">Directory</a> &middot; <a href="/directory/submit">Submit</a> &middot; <a href="/glossary/mcp">MCP</a> &middot; <a href="/glossary/tool-use">Tool Use</a> &middot; <a href="https://github.com/New1Direction/webmcp-anything">GitHub</a>
</footer>
</body>
</html>`;
}
