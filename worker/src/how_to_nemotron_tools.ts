// how_to_nemotron_tools.ts — NEWSJACK. NVIDIA Nemotron 3 Ultra launched at
// Computex 2026-06-03 — a 500B MoE model built for long-running, tool-using
// agents. SEO target while the search spike is hot: "nemotron 3 ultra tool
// calling / function calling / agents / web tools / mcp". A model is only as
// useful as the tools it can call — wmcp turns any site/API into those tools.
// Routes to /connect + the dev funnel.
import { uiCss, uiNav } from "./ui";

export function howToNemotronToolsHtml(origin: string): string {
  const canonical = `${origin}/how-to/give-nemotron-3-ultra-tools`;
  const esc = (s: string) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" } as any)[c]);
  const faqs: Array<[string, string]> = [
    ["Does NVIDIA Nemotron 3 Ultra support tool calling / function calling?", "Yes — Nemotron 3 Ultra is built for long-running agents that reason, keep context, and call tools. But the model only decides which tool to call; you still have to supply the tools. wmcp.sh turns any website or API into agent-callable tools so Nemotron has something real to call."],
    ["How do I give Nemotron 3 Ultra access to a website?", "Hand the URL to wmcp.sh — it returns a typed list of tools (get_price, add_to_cart, search, etc.) as function-calling / MCP JSON. Pass those to Nemotron's OpenAI-compatible endpoint as the tools array; when it calls one, wmcp resolves it against the live site and returns real data. About three lines of glue."],
    ["Is this safe to connect to my agent?", "Check the server first: wmcp.sh grades every MCP server A–F for security and watches for rug-pulls. Connect graded, governed tools rather than wiring raw endpoints into a model that can act."],
  ];
  const ld = [
    { "@context": "https://schema.org", "@type": "HowTo", name: "Give NVIDIA Nemotron 3 Ultra tools for any website", description: "Turn any site or API into agent-callable tools for Nemotron 3 Ultra in ~3 lines with wmcp.sh.", url: canonical, publisher: { "@type": "Organization", name: "wmcp.sh", url: origin } },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
  ];
  const code = `# Nemotron 3 Ultra calls real web tools — wmcp.sh supplies them.
import requests
from openai import OpenAI

# 1. Ask wmcp.sh for tools for any URL (Shopify, JSON-LD, or OpenAPI site)
tools = requests.get("${origin}/api/v1/tools",
                     params={"url": "https://www.allbirds.com/products/mens-wool-runners"}).json()["tools"]

# 2. Hand them to Nemotron 3 Ultra (NVIDIA's OpenAI-compatible endpoint)
client = OpenAI(base_url="https://integrate.api.nvidia.com/v1", api_key="$NVIDIA_API_KEY")
resp = client.chat.completions.create(
    model="nvidia/nemotron-3-ultra",          # use the exact model id from NVIDIA
    messages=[{"role": "user", "content": "What's the price and is it in stock?"}],
    tools=tools,                                # ← wmcp's function-calling schema
)
# 3. Nemotron picks a tool; resolve the call back through wmcp and feed the result.`;
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>How to give NVIDIA Nemotron 3 Ultra tools for any website (MCP + function calling) | wmcp.sh</title>
<meta name="description" content="NVIDIA Nemotron 3 Ultra is built for tool-using agents — but it needs tools to call. Turn any website or API into agent-callable MCP / function-calling tools for Nemotron 3 Ultra in ~3 lines with wmcp.sh."/>
<link rel="canonical" href="${canonical}"/>
<meta property="og:title" content="Give Nemotron 3 Ultra tools for any website | wmcp.sh"/>
<meta property="og:image" content="${origin}/og.png"/>
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<style>${uiCss(900)}
  pre.code{background:#0d0d14;border:1px solid var(--border);border-radius:12px;padding:16px;overflow:auto;font-size:.83rem;line-height:1.5}
  .faq h3{margin:16px 0 4px;font-size:1rem} .faq p{color:var(--muted);margin:0}
</style></head><body>
${uiNav(origin)}
<div class="wrap">
  <header class="hero">
    <p class="crumbs"><a href="${origin}/connect">The MCP hub</a> <span class="sep">›</span> How-to <span class="sep">›</span> Nemotron 3 Ultra</p>
    <h1>Give NVIDIA Nemotron 3 Ultra tools for any website</h1>
    <p class="lede">NVIDIA's <strong>Nemotron 3 Ultra</strong> (launched at Computex, June 2026) is a 500B-parameter MoE model built for long-running agents that reason, keep context, and <strong>call tools</strong>. But a model only <em>decides</em> which tool to call — you still have to give it real ones. That's what <a href="${origin}/connect">wmcp.sh</a> does: hand it any URL and it returns typed, function-calling-ready tools, so Nemotron can check a price, compare variants, or add to a cart — on sites you never wrote an integration for.</p>
    <div class="row">
      <a class="btn btn-primary" href="${origin}/connect">Connect tools to your agent →</a>
      <a class="btn btn-ghost" href="${origin}/mcp/leaderboard">Grade an MCP server first</a>
    </div>
  </header>
  <section style="padding-top:8px">
    <h2>~3 lines: Nemotron 3 Ultra + real web tools</h2>
    <pre class="code">${esc(code)}</pre>
    <p class="muted" style="font-size:.9rem">wmcp.sh returns OpenAI-/MCP-compatible tool schemas, so it drops into Nemotron's tool-calling loop (or Claude, OpenAI, LangChain, Cursor) the same way. The reads are free; live execution + credential-handling run through the governed proxy.</p>
    <h2>Connect tools you can trust</h2>
    <p class="muted" style="font-size:.92rem">An agent that can act is only as safe as the tools you give it. Before you wire a server into Nemotron, check its <a href="${origin}/mcp/leaderboard">independent trust grade</a> — wmcp grades every MCP server A–F and watches for rug-pulls.</p>
  </section>
  <section class="faq"><h2>FAQ</h2>${faqs.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join("")}</section>
  <footer>Built on the same any-URL→tools layer as <a href="${origin}/webmcp">WebMCP</a> · <a href="${origin}/connect">connect an agent</a> · <a href="${origin}/mcp/leaderboard">trust leaderboard</a>.</footer>
</div></body></html>`;
}
