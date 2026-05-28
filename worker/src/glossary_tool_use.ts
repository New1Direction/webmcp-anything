export function glossaryToolUseHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Tool Use (Anthropic) Definition & Glossary | wmcp.sh</title>
<meta name="description" content="Define tool use — Anthropic's paradigm for function calling. Learn how Claude iterates with tool_use blocks and how to optimize tool latency." />
<link rel="canonical" href="${origin}/glossary/tool-use" />
<meta property="og:title" content="Tool Use (Anthropic) Definition & Glossary | wmcp.sh" />
<meta property="og:description" content="Define tool use — Anthropic's paradigm for function calling. Learn how Claude iterates with tool_use blocks and how to optimize tool latency." />
<meta property="og:url" content="${origin}/glossary/tool-use" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Tool Use (Anthropic) Definition & Glossary | wmcp.sh" />
<meta name="twitter:description" content="Define tool use — Anthropic's paradigm for function calling. Learn how Claude iterates with tool_use blocks and how to optimize tool latency." />
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article","headline":"Tool Use (Anthropic) Definition & Glossary | wmcp.sh","description":"Define tool use — Anthropic's paradigm for function calling. Learn how Claude iterates with tool_use blocks and how to optimize tool latency.","author":{"@type":"Organization","name":"WebMCP Anything"},"publisher":{"@type":"Organization","name":"WebMCP Anything","url":"https://wmcp.sh"},"datePublished":"2026-05-28","dateModified":"2026-05-28","mainEntityOfPage":"${origin}/glossary/tool-use"}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
  {"@type":"Question","name":"What is 'tool use' in the context of LLMs?","acceptedAnswer":{"@type":"Answer","text":"'Tool use' is Anthropic's terminology for allowing a large language model (like Claude) to interact with external systems. The model responds with a 'tool_use' block, pausing text generation while the host application executes the tool and returns a 'tool_result'."}},
  {"@type":"Question","name":"How does tool use differ from OpenAI's function calling?","acceptedAnswer":{"@type":"Answer","text":"While conceptually similar, the JSON schema differs. Anthropic uses 'tool_use' and 'tool_result' block types embedded in a single content array, whereas OpenAI historically used dedicated 'function_call' and 'tool_calls' attributes on the message object."}},
  {"@type":"Question","name":"How important is latency for tool use?","acceptedAnswer":{"@type":"Answer","text":"Extremely important. An agentic loop may require multiple sequential tool calls. If each call takes 1 second, a 5-step loop takes 5 seconds of dead time. Platforms like wmcp.sh provide sub-100ms execution to keep reasoning loops fast."}},
  {"@type":"Question","name":"How do I secure credentials during tool use?","acceptedAnswer":{"@type":"Answer","text":"Never include raw API keys in the tool schema sent to the model. An encrypted credentials vault should intercept the tool request server-side and inject the necessary authentication before hitting the target system."}}
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
  <div class="badge"><span class="dot"></span> GLOSSARY &middot; /GLOSSARY/TOOL-USE</div>
  <h1>Tool Use (Anthropic)</h1>
  <p class="sub">When a language model hits the limit of its static training data, it needs to look up facts, run calculations, or mutate state. "Tool use" is the mechanism that allows it to pause generation and request execution, driving modern AI workflows.</p>
</header>

<section id="wedge">
  <div class="section-label">the gap</div>
  <h2>Why agents need specialized execution environments</h2>
  <p class="section-sub">In Anthropic's ecosystem, when Claude determines it needs external data—for instance, to fetch a customer profile for support@example.com at Acme Corp—it emits a <code>tool_use</code> block instead of standard text. The client application must halt, execute the requested tool, and append a <code>tool_result</code> back to the message history.</p>
  <p class="section-sub">However, this agentic loop is fragile. If the host environment is slow, the model waits. If authentication fails, the context window fills with error tracebacks. wmcp.sh abstracts this execution layer, ensuring that when Claude asks for data, it receives a normalized, sub-100ms response. <em>(Note: wmcp.sh is not affiliated with Anthropic, OpenAI, or any model provider.)</em></p>
</section>

<section id="how">
  <div class="section-label">the architecture</div>
  <h2>How tool use looks in practice</h2>
  <pre><code><span class="k">import</span> <span class="s">Anthropic</span> <span class="k">from</span> <span class="s">"@anthropic-ai/sdk"</span>;

<span class="k">const</span> anthropic <span class="k">=</span> <span class="k">new</span> <span class="s">Anthropic</span>({ apiKey: process.env.ANTHROPIC_API_KEY });

<span class="c">// Fetch pre-formatted tool schemas from wmcp.sh</span>
<span class="k">const</span> toolSchemas <span class="k">=</span> <span class="k">await</span> fetch(<span class="s">"https://api.wmcp.sh/v1/tools?url=..."</span>).then(r => r.json());

<span class="k">const</span> msg <span class="k">=</span> <span class="k">await</span> anthropic.messages.create({
  model: <span class="s">"claude-3-7-sonnet-20250219"</span>,
  max_tokens: <span class="s">1024</span>,
  tools: toolSchemas,
  messages: [{ role: <span class="s">"user"</span>, content: <span class="s">"What is Acme Corp's MRR?"</span> }]
});

<span class="c">// Model returns a tool_use block</span>
<span class="k">if</span> (msg.stop_reason <span class="k">===</span> <span class="s">"tool_use"</span>) {
  <span class="k">const</span> toolBlock <span class="k">=</span> msg.content.find(c => c.type <span class="k">===</span> <span class="s">"tool_use"</span>);
  console.log(<span class="s">"Executing tool:"</span>, toolBlock.name, toolBlock.input);
  <span class="c">// wmcp.sh executes this securely via its credentials vault</span>
}</code></pre>
</section>

<section id="capabilities">
  <div class="section-label">capability</div>
  <h2>Optimizing Tool Use Loops</h2>
  <table>
    <thead><tr><th>Capability</th><th>Standard Architecture</th><th>With wmcp.sh</th></tr></thead>
    <tbody>
      <tr><td><strong>Execution Latency</strong></td><td>⚠️ 500ms - 2s typical for serverless stacks.</td><td class="ours">✅ Sub-100ms at the edge.</td></tr>
      <tr><td><strong>Caching Strategy</strong></td><td>❌ Non-existent or manual Redis wiring.</td><td class="ours">✅ Built-in short TTL (~1s) micro-caching.</td></tr>
      <tr><td><strong>Credential Safety</strong></td><td>❌ API keys passed directly in <code>tool_use</code> input.</td><td class="ours">✅ Encrypted credentials vault handles keys.</td></tr>
      <tr><td><strong>Schema Alignment</strong></td><td>⚠️ Needs manual translation from OpenAPI to Anthropic JSON.</td><td class="ours">✅ Zero-config schema bridging.</td></tr>
    </tbody>
  </table>
</section>

<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions.</h2>
  <details><summary>Is tool use the same as function calling?</summary><p class="answer">Conceptually yes. "Tool use" is Anthropic's terminology, while "function calling" is traditionally associated with OpenAI. Their JSON payload structures differ, but both enable the LLM to trigger external code. wmcp.sh normalizes both.</p></details>
  <details><summary>Why does latency matter for tool use?</summary><p class="answer">A complex agentic task may require 10 sequential tool calls. If your tools take 2 seconds each to resolve, the user stares at a spinner for 20 seconds. Sub-100ms latency ensures the reasoning loop remains fluid and real-time.</p></details>
  <details><summary>Can a model call multiple tools at once?</summary><p class="answer">Yes, Claude supports parallel tool use. It can emit multiple <code>tool_use</code> blocks in a single turn, which wmcp.sh can then execute concurrently to drastically reduce total time-to-completion.</p></details>
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
  <a href="/">Home</a> &middot; <a href="/agent-ready">Agent-ready</a> &middot; <a href="/managed">Done for you</a> &middot; <a href="/blog">Blog</a> &middot; <a href="/directory">Directory</a> &middot; <a href="/directory/submit">Submit</a> &middot; <a href="/glossary/mcp">MCP</a> &middot; <a href="/glossary/function-calling">Function Calling</a> &middot; <a href="https://github.com/New1Direction/webmcp-anything">GitHub</a>
</footer>
</body>
</html>`;
}
