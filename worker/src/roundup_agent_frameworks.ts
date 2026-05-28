// /roundup/agent-frameworks — comparison of agent frameworks.
// SERP target: "agent frameworks compared 2026", "langchain vs crewai",
// "langgraph vs autogen", "best ai agent framework", "openai agents sdk
// vs langchain".
//
// All frameworks listed are publicly documented projects. We do not
// fabricate license info — we describe each by its publicly-stated
// license + the canonical home repo. wmcp.sh appears as the tool layer
// that any of these frameworks can plug into via MCP.

export function roundupAgentFrameworksHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>AI agent frameworks compared 2026 — LangChain, LangGraph, CrewAI, AutoGen, OpenAI Agents SDK | wmcp.sh</title>
<meta name="description" content="Honest comparison of the major AI agent frameworks in 2026: LangChain, LangGraph, CrewAI, Microsoft AutoGen, OpenAI Agents SDK, Anthropic Agent SDK. Capability matrix + when each wins." />
<link rel="canonical" href="${origin}/roundup/agent-frameworks" />
<meta property="og:title" content="AI agent frameworks compared 2026" />
<meta property="og:description" content="LangChain, LangGraph, CrewAI, AutoGen, OpenAI Agents SDK, Anthropic Agent SDK — capability matrix + when each fits." />
<meta property="og:url" content="${origin}/roundup/agent-frameworks" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="AI agent frameworks compared 2026" />
<meta name="twitter:description" content="Honest, factual capability matrix of the major frameworks." />
<meta name="twitter:image" content="${origin}/og.png" />
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "AI agent frameworks compared 2026",
  "description": "Capability matrix of major AI agent frameworks — LangChain, LangGraph, CrewAI, AutoGen, OpenAI Agents SDK, Anthropic Agent SDK. Plus the MCP tool layer pattern.",
  "author": { "@type": "Organization", "name": "WebMCP Anything" },
  "publisher": { "@type": "Organization", "name": "WebMCP Anything", "url": "https://wmcp.sh" },
  "datePublished": "2026-05-28",
  "dateModified": "2026-05-28",
  "mainEntityOfPage": "${origin}/roundup/agent-frameworks"
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Which agent framework should I pick in 2026?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Depends on the shape of your problem. For multi-step planning with conditional graphs, LangGraph is a strong default. For role-based multi-agent collaboration, CrewAI is purpose-built. For research-style multi-agent conversations, Microsoft AutoGen is the canonical project. For tight integration with OpenAI's tool-calling and the Responses API, the OpenAI Agents SDK is the lowest-friction. For tight integration with Claude (Anthropic), the Anthropic Agent SDKs (Python + TypeScript) are first-party. LangChain remains the broadest ecosystem and a common building block underneath several others."
      }
    },
    {
      "@type": "Question",
      "name": "Are these frameworks all open source?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "LangChain (MIT), LangGraph (MIT), CrewAI (MIT), and Microsoft AutoGen (MIT / CC) are open-source. The OpenAI Agents SDK and Anthropic Agent SDKs are open-source SDK packages but call into hosted vendor APIs. LangSmith and LangGraph Platform (LangChain's hosted observability + orchestration) are commercial. Check each project's repo for canonical license info."
      }
    },
    {
      "@type": "Question",
      "name": "How does MCP fit into these frameworks?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "MCP is an open wire protocol for tools — independent of which agent framework you use. LangChain ships first-party MCP adapters (langchain-mcp-adapters). OpenAI Agents SDK has community MCP adapters. Anthropic's SDKs and harnesses speak MCP natively. wmcp.sh exposes MCP endpoints, so you can use it as the tool layer underneath any of these frameworks."
      }
    },
    {
      "@type": "Question",
      "name": "What's the difference between LangChain and LangGraph?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "LangChain is the broader framework — chains, retrievers, prompts, integrations, agents. LangGraph is a specific library within the LangChain ecosystem for building stateful, multi-step agent workflows as graphs. Many teams use both. LangGraph is often the right pick when you need explicit control flow (cycles, branches, human-in-the-loop)."
      }
    },
    {
      "@type": "Question",
      "name": "Is wmcp.sh a framework?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No — wmcp.sh is a tool gateway, not a framework. It supplies MCP tool endpoints (OpenAPI ingest, shopper-side adapters, OAuth-proxy, oracle data). Your agent framework of choice consumes those tools. wmcp.sh + your framework is a stack, not a replacement."
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
  nav { display:flex;justify-content:space-between;align-items:center;padding:22px 24px;max-width:1120px;margin:0 auto; }
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
  table { width: 100%; border-collapse: collapse; text-align: left; font-size: .88rem; margin-top: 16px; }
  th, td { padding: 12px 14px; border-bottom: 1px solid var(--border); vertical-align: top; }
  th { background: var(--bg2); font-weight: 700; color: var(--accent2); font-size: .8rem; }
  td strong { color: var(--text); }
  .grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin-top:18px; }
  .card { background:var(--card);border:1px solid var(--border);border-radius:14px;padding:18px 20px; }
  .card.us { border-color:var(--accent);background:linear-gradient(135deg,var(--card),rgba(124,92,255,0.06)); }
  .card h3 { color: var(--text); margin: 0 0 6px; font-size: 1rem; }
  .card .tag { display:inline-block;font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent2);font-weight:700;margin-bottom:8px; }
  .card p { color:var(--muted);font-size:.88rem;margin:0 0 8px;line-height:1.55; }
  .card .meta { color: var(--dim); font-size: .78rem; font-style: italic; }
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
  <div class="badge"><span class="dot"></span> roundup &middot; agent frameworks 2026</div>
  <h1>AI agent frameworks compared.</h1>
  <p class="sub">LangChain, LangGraph, CrewAI, Microsoft AutoGen, OpenAI Agents SDK, Anthropic Agent SDK. Different shapes — multi-step graphs, role-based crews, multi-agent conversations, single-vendor harnesses. Plus how wmcp.sh sits underneath any of them as the MCP tool layer.</p>
  <p class="hint">Not a leaderboard. Different problems pick different frameworks. Honest tradeoffs below.</p>
  <p class="disclaim">All descriptions are based on each project's public documentation and source repos as of 2026-05-28. We are not affiliated with the vendors listed. Features and licensing change — always check the canonical project repo before depending on it.</p>
</header>

<!-- ========== FRAMEWORK CARDS ========== -->
<section id="frameworks">
  <div class="section-label">The lineup</div>
  <h2>The six worth knowing.</h2>
  <div class="grid">
    <div class="card">
      <div class="tag">framework · python + ts</div>
      <h3>LangChain</h3>
      <p>The broadest open-source agent framework: chains, retrievers, prompts, dozens of LLM provider integrations, tools, agents. Often the substrate other frameworks build on or interoperate with.</p>
      <div class="meta">License: MIT · Hosted offerings: LangSmith, LangGraph Platform (commercial)</div>
    </div>
    <div class="card">
      <div class="tag">framework · python + ts</div>
      <h3>LangGraph</h3>
      <p>A library inside the LangChain ecosystem for building stateful, graph-shaped agent workflows. Strong fit when you need explicit control flow — cycles, branches, human-in-the-loop, checkpointed state.</p>
      <div class="meta">License: MIT</div>
    </div>
    <div class="card">
      <div class="tag">framework · python</div>
      <h3>CrewAI</h3>
      <p>Role-based multi-agent orchestration: define agents with roles + goals + tools, compose them into a crew with a process (sequential, hierarchical). Purpose-built for "team of specialized agents" patterns.</p>
      <div class="meta">License: MIT</div>
    </div>
    <div class="card">
      <div class="tag">framework · python + .net</div>
      <h3>Microsoft AutoGen</h3>
      <p>Multi-agent conversation framework from Microsoft Research. Agents talk to each other (and to humans) to solve tasks. Often the canonical pick for research-style multi-agent setups and code-execution loops.</p>
      <div class="meta">License: see autogen repo (CC / MIT depending on subpackage)</div>
    </div>
    <div class="card">
      <div class="tag">sdk · python + ts</div>
      <h3>OpenAI Agents SDK</h3>
      <p>OpenAI's official agent SDK, tightly integrated with the Responses API, tool calling, and hosted runs. Lowest friction if your agent runs entirely on OpenAI models. Handoffs + guardrails + tracing built in.</p>
      <div class="meta">License: open-source SDK, hosted runtime via OpenAI APIs</div>
    </div>
    <div class="card">
      <div class="tag">sdk · python + ts</div>
      <h3>Anthropic Agent SDK</h3>
      <p>Anthropic's first-party Agent SDKs (Python + TypeScript) for building Claude-driven agents. MCP-native — Claude harnesses speak MCP directly, so adding MCP tools is a one-liner.</p>
      <div class="meta">License: open-source SDK, hosted runtime via Anthropic APIs</div>
    </div>
  </div>
</section>

<!-- ========== CAPABILITY MATRIX ========== -->
<section id="matrix">
  <div class="section-label">Capability matrix</div>
  <h2>At a glance.</h2>
  <table>
    <thead>
      <tr>
        <th>Capability</th>
        <th>LangChain</th>
        <th>LangGraph</th>
        <th>CrewAI</th>
        <th>AutoGen</th>
        <th>OpenAI Agents SDK</th>
        <th>Anthropic Agent SDK</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Multi-agent handoff</strong></td>
        <td>Yes (agent + tools)</td>
        <td>Yes (graphs)</td>
        <td>Yes (crew)</td>
        <td>Yes (conversations)</td>
        <td>Yes (handoffs)</td>
        <td>Yes (subagent pattern)</td>
      </tr>
      <tr>
        <td><strong>Tool calling</strong></td>
        <td>Yes (@tool)</td>
        <td>Yes</td>
        <td>Yes</td>
        <td>Yes</td>
        <td>Yes (typed tools)</td>
        <td>Yes (MCP-native)</td>
      </tr>
      <tr>
        <td><strong>MCP integration</strong></td>
        <td>First-party adapter</td>
        <td>Via langchain adapter</td>
        <td>Community adapters</td>
        <td>Community adapters</td>
        <td>Community adapters</td>
        <td>Native</td>
      </tr>
      <tr>
        <td><strong>Built-in observability</strong></td>
        <td>LangSmith (commercial)</td>
        <td>LangSmith</td>
        <td>Native traces</td>
        <td>Native traces</td>
        <td>Tracing built in</td>
        <td>Via harness</td>
      </tr>
      <tr>
        <td><strong>Cross-vendor models</strong></td>
        <td>✅ Many providers</td>
        <td>✅ Many</td>
        <td>✅ Many</td>
        <td>✅ Many</td>
        <td>⚠️ OpenAI-centric</td>
        <td>⚠️ Anthropic-centric</td>
      </tr>
      <tr>
        <td><strong>License</strong></td>
        <td>MIT</td>
        <td>MIT</td>
        <td>MIT</td>
        <td>See repo</td>
        <td>Open SDK + hosted</td>
        <td>Open SDK + hosted</td>
      </tr>
    </tbody>
  </table>
  <p class="disclaim">Cell values reflect typical patterns from each project's public docs. "First-party adapter" / "community adapters" notes the canonical MCP integration story but does not preclude other patterns.</p>
</section>

<!-- ========== WMCP.SH LAYER ========== -->
<section id="wmcp-layer">
  <div class="section-label">Where wmcp.sh fits</div>
  <h2>The tool layer underneath any of them.</h2>
  <p class="section-sub">wmcp.sh isn't a framework — it's an MCP endpoint. Any of the six frameworks above can consume wmcp.sh tools via MCP. The integration is shallow: point the framework's MCP client at wmcp.sh, get tools.</p>
  <pre><code><span class="c"># LangGraph + wmcp.sh:</span>
<span class="k">from</span> langchain_mcp_adapters.client <span class="k">import</span> MultiServerMCPClient
client = MultiServerMCPClient({
  <span class="s">"wmcp"</span>: { <span class="s">"url"</span>: <span class="s">"${origin}/mcp/openapi?url=https://..."</span>, <span class="s">"transport"</span>: <span class="s">"streamable_http"</span> }
})

<span class="c"># Anthropic Agent SDK + wmcp.sh:</span>
<span class="c"># Add ${origin}/mcp/... as an MCP server in the harness config — done.</span>

<span class="c"># OpenAI Agents SDK + wmcp.sh:</span>
<span class="c"># Use a community MCP adapter to ingest tools from wmcp.sh as Agent tools.</span></code></pre>
</section>

<!-- ========== WHEN EACH WINS ========== -->
<section id="when">
  <div class="section-label">When each wins</div>
  <h2>Decision tree.</h2>
  <div class="grid">
    <div class="card">
      <div class="tag">decision</div>
      <h3>Pick LangChain when</h3>
      <p>You want the broadest integration ecosystem, cross-vendor model support, and you're OK building your own control flow on top.</p>
    </div>
    <div class="card">
      <div class="tag">decision</div>
      <h3>Pick LangGraph when</h3>
      <p>Your agent needs explicit graphs — cycles, branches, retries, checkpointed state, human-in-the-loop. The right pick for production-grade multi-step.</p>
    </div>
    <div class="card">
      <div class="tag">decision</div>
      <h3>Pick CrewAI when</h3>
      <p>Your problem fits "team of specialized agents with roles + goals". CrewAI's process abstraction is the cleanest for that shape.</p>
    </div>
    <div class="card">
      <div class="tag">decision</div>
      <h3>Pick AutoGen when</h3>
      <p>Research-style multi-agent conversations, code-execution loops, or you want the canonical Microsoft Research multi-agent pattern.</p>
    </div>
    <div class="card">
      <div class="tag">decision</div>
      <h3>Pick OpenAI Agents SDK when</h3>
      <p>You're all-in on OpenAI models + Responses API and want the lowest-friction first-party tool calling, handoffs, and tracing.</p>
    </div>
    <div class="card">
      <div class="tag">decision</div>
      <h3>Pick Anthropic Agent SDK when</h3>
      <p>You're all-in on Claude and want first-party MCP + Skills + memory. The tightest Claude integration is the official SDK.</p>
    </div>
  </div>
</section>

<!-- ========== FAQ ========== -->
<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions.</h2>
  <details><summary>Which framework should I pick in 2026?</summary><div class="answer">Depends on shape. Graphs → LangGraph. Role-based crews → CrewAI. Multi-agent conversations → AutoGen. OpenAI-centric → Agents SDK. Claude-centric → Anthropic SDK. Broadest ecosystem → LangChain.</div></details>
  <details><summary>Are these all open source?</summary><div class="answer">LangChain, LangGraph, CrewAI, AutoGen are MIT / open. OpenAI and Anthropic SDKs are open SDKs that call hosted APIs. LangSmith is commercial.</div></details>
  <details><summary>How does MCP fit?</summary><div class="answer">MCP is an open wire protocol for tools — independent of framework. All six above interoperate with MCP either natively or via adapters. wmcp.sh is one MCP endpoint they can consume.</div></details>
  <details><summary>LangChain vs LangGraph?</summary><div class="answer">LangChain is the broad framework. LangGraph is a library inside it for stateful graph-shaped workflows. Many teams use both.</div></details>
  <details><summary>Is wmcp.sh a framework?</summary><div class="answer">No — it's an MCP tool gateway. Your framework consumes its tools. They're complementary.</div></details>
</section>

<!-- ========== UPGRADE CTA ========== -->
<section id="upgrade" style="margin-top:36px;background:linear-gradient(135deg,var(--card),rgba(124,92,255,0.08));border:1px solid rgba(124,92,255,0.35);border-radius:16px;padding:22px 26px">
  <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;justify-content:space-between">
    <div style="flex:1;min-width:240px">
      <div style="font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent2);font-weight:700;margin-bottom:6px">Need this picked / built for you?</div>
      <h3 style="margin:0 0 4px;font-size:1.05rem;color:var(--text)">We'll pick the right framework + wire wmcp.sh.</h3>
      <p style="color:var(--muted);margin:0;font-size:.92rem">Custom MCP adapter + hosted endpoint + framework integration tested end-to-end. From <strong style="color:var(--text)">$499 one-time setup</strong>; Managed Retainer <strong style="color:var(--text)">$999/mo</strong>; Enterprise <strong style="color:var(--text)">$4,999+/mo</strong>.</p>
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
  <h2>More on the agent stack.</h2>
  <p class="section-sub">
    <a href="/roundup/mcp-servers-2026" style="color:var(--accent2);text-decoration:none">/roundup/mcp-servers-2026</a> &middot;
    <a href="/roundup/oauth-providers-mcp" style="color:var(--accent2);text-decoration:none">/roundup/oauth-providers-mcp</a> &middot;
    <a href="/vs/langchain-tools" style="color:var(--accent2);text-decoration:none">/vs/langchain-tools</a> &middot;
    <a href="/vs/anthropic-skills" style="color:var(--accent2);text-decoration:none">/vs/anthropic-skills</a> &middot;
    <a href="/integration/openai" style="color:var(--accent2);text-decoration:none">/integration/openai</a> &middot;
    <a href="/integration/anthropic" style="color:var(--accent2);text-decoration:none">/integration/anthropic</a>
  </p>
</section>

</div>

<footer>
  <a href="/">Home</a> · <a href="/agent-ready">Agent-ready</a> · <a href="/managed">Done for you</a> · <a href="/directory">Directory</a> · <a href="/directory/submit">Submit</a> · <a href="/blog">Blog</a> · <a href="/roundup/mcp-servers-2026">MCP servers roundup</a> · <a href="/roundup/oauth-providers-mcp">OAuth roundup</a>
</footer>

</body>
</html>`;
}
