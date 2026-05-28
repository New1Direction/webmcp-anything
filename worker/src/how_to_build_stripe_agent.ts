export function howToBuildStripeAgentHtml(origin: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>How to Build a Stripe Agent | wmcp.sh</title>
<meta name="description" content="Build a Python agent in 50 lines that lists invoices via Stripe MCP through wmcp.sh using anthropic and httpx.">
<link rel="canonical" href="\${origin}/how-to/build-stripe-mcp-agent" />
<meta property="og:title" content="How to Build a Stripe MCP Agent | wmcp.sh" />
<meta property="og:description" content="50-line Python agent that lists Stripe invoices via MCP through wmcp.sh. anthropic + httpx + the Stripe credential vault." />
<meta property="og:url" content="\${origin}/how-to/build-stripe-mcp-agent" />
<meta property="og:image" content="\${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="How to Build a Stripe MCP Agent" />
<meta name="twitter:description" content="50-line Python agent listing Stripe invoices via MCP." />
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article","headline":"How to Build a Stripe MCP Agent in 50 Lines of Python","description":"Build a Python agent that lists Stripe invoices via MCP through wmcp.sh using the anthropic SDK and httpx.","author":{"@type":"Organization","name":"WebMCP Anything"},"publisher":{"@type":"Organization","name":"WebMCP Anything","url":"https://wmcp.sh"},"datePublished":"2026-05-28","dateModified":"2026-05-28","mainEntityOfPage":"\${origin}/how-to/build-stripe-mcp-agent"}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
  {"@type":"Question","name":"Do I need to expose my Stripe sk_live key to the agent?","acceptedAnswer":{"@type":"Answer","text":"No. Connect Stripe once at wmcp.sh/dashboard — the worker stores your sk_live encrypted (AES-GCM-256) and injects it into api.stripe.com requests on the agent's behalf. The agent context never sees raw credentials. wmcp.sh is not affiliated with Stripe."}},
  {"@type":"Question","name":"Does this work for Stripe Connect platforms?","acceptedAnswer":{"@type":"Answer","text":"Yes. The same vault model supports Stripe Connect OAuth tokens — connect once per platform user; the worker maps each call's connected-account token transparently."}}
]}
</script>
<style>
  :root { --bg: #0c0c14; --bg2: #11111c; --card: #161622; --border: #26263a; --text: #f0f0f5; --muted: #a0a0b0; --dim: #606070; --accent: #7c5cff; --accent2: #00e5ff; --pink: #ff3366; --green: #00e676; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: var(--bg); color: var(--text); margin: 0; padding: 0; line-height: 1.6; }
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
  h1 { font-size:clamp(2rem,4.5vw,3rem);margin:0 0 18px;background:linear-gradient(135deg,#fff 30%,var(--accent2) 100%);-webkit-background-clip:text;background-clip:text;color:transparent;line-height:1.05;font-weight:800;letter-spacing:-.02em; }
  .sub { color: var(--muted); font-size: 1.05rem; max-width: 640px; margin: 0 0 24px; }
  section { padding: 36px 0; }
  .section-label { display:inline-block;font-size:.72rem;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--accent2);margin-bottom:10px; }
  h2 { font-size:clamp(1.4rem,3vw,1.9rem);margin:0 0 12px;font-weight:700;letter-spacing:-.02em; }
  .section-sub { color: var(--muted); max-width: 640px; margin: 0 0 24px; }
  pre { background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px 18px;overflow-x:auto;font-size:.82rem;color:var(--green);font-family:"SF Mono",Menlo,monospace;line-height:1.5;margin:14px 0; }
  pre .k { color: var(--accent2); } pre .s { color: var(--pink); } pre .c { color: var(--dim); }
  footer { border-top:1px solid var(--border);margin-top:40px;padding:30px 0;text-align:center;color:var(--muted);font-size:.85rem; }
  footer a { color: var(--accent2); text-decoration: none; margin: 0 8px; }
  .disclaimer { font-size: 0.8rem; color: var(--dim); margin-top: 20px; font-style: italic; }
</style>
</head>
<body>

<nav>
  <div class="brand"><a href="/" style="color:inherit;text-decoration:none">wmcp<span>.sh</span></a></div>
  <div class="links">
    <a href="/agent-ready">Agent-ready</a>
    <a href="/managed">Done for you</a>
    <a href="/price-data">Price data</a>
    <a href="/integration/openapi">OpenAPI</a>
    <a href="/directory">Directory</a>
  </div>
  <a class="cta" href="/directory/submit">Submit App →</a>
</nav>

<div class="wrap">

<header class="hero">
  <div class="badge"><span class="dot"></span> Guide &middot; Code</div>
  <h1>How to build a Stripe Agent.</h1>
  <p class="sub">Write a Python agent in under 50 lines that lists invoices and customers. By piping Stripe's OpenAPI spec through wmcp.sh, Claude natively understands the Stripe API as Model Context Protocol (MCP) tools.</p>
</header>

<section id="intro">
  <p style="color:var(--muted);font-size:1.05rem;line-height:1.7;">Instead of writing custom Python wrapper classes for every Stripe endpoint, you can provide Claude with dynamically generated MCP tools. wmcp.sh ingests the public Stripe OpenAPI specification and translates it into strict MCP-compliant schemas in milliseconds.</p>
</section>

<section id="code">
  <div class="section-label">Python Agent</div>
  <h2>50 lines to agentic Stripe.</h2>
  <p class="section-sub">Using the official <code>anthropic</code> SDK and <code>httpx</code>, we first fetch the available Stripe tools from wmcp.sh. Then, we let Claude decide which tool to call based on the user's prompt.</p>
  <pre><code><span class="c">import os
import json
import httpx
from anthropic import Anthropic</span>

<span class="c"># 1. Initialize Anthropic client</span>
<span class="k">client</span> = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

<span class="c"># 2. Fetch Stripe MCP tools dynamically via wmcp.sh</span>
<span class="c"># We filter by tag "Invoices" to keep the context window small.</span>
<span class="k">wmcp_url</span> = <span class="s">"${origin}/api/v1/tools?url=https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.json&tag=Invoices"</span>
<span class="k">response</span> = httpx.get(wmcp_url)
<span class="k">tools</span> = response.json().get("tools", [])

<span class="c"># 3. Create the chat completion</span>
<span class="k">prompt</span> = <span class="s">"Please list the latest 3 invoices for customer 'cus_123'."</span>
<span class="k">messages</span> = [{"role": "user", "content": prompt}]

<span class="k">message</span> = client.messages.create(
    model="claude-3-7-sonnet-20250219",
    max_tokens=1024,
    tools=tools,
    messages=messages
)

<span class="c"># 4. Handle the tool call</span>
<span class="k">if</span> message.stop_reason == "tool_use":
    tool_use = message.content[1]
    <span class="k">print</span>(f"Agent chose tool: {tool_use.name}")
    <span class="k">print</span>(f"With arguments: {json.dumps(tool_use.input, indent=2)}")
    
    <span class="c"># In a full agent, you would now execute this against Stripe API directly:</span>
    <span class="c"># result = httpx.get("https://api.stripe.com/v1/invoices", params=tool_use.input, auth=(STRIPE_KEY, ""))</span>
    <span class="c"># Then return the tool_result back to Claude to complete the loop.</span>
</code></pre>
</section>

<section id="security">
  <div class="section-label">Security</div>
  <h2>Handling API Keys.</h2>
  <p style="color:var(--muted);font-size:.95rem;line-height:1.6;margin-bottom:16px;">Notice that we <strong>do not</strong> pass the <code>STRIPE_SECRET_KEY</code> to the LLM. The agent only knows the <em>shape</em> of the tools and decides the input parameters (like <code>customer="cus_123"</code>). The actual execution happens locally in your Python environment. Alternatively, if you use wmcp.sh as a managed gateway, you can utilize our encrypted credentials vault for secure static key storage.</p>
</section>

<section id="related">
  <div class="section-label">Related</div>
  <h2>Keep reading.</h2>
  <p class="section-sub">
    <a href="/how-to/install-claude-desktop-mcp" style="color:var(--accent2);text-decoration:none">/how-to/install-claude-desktop-mcp</a> &middot;
    <a href="/agent-ready" style="color:var(--accent2);text-decoration:none">/agent-ready</a> &middot;
    <a href="/managed" style="color:var(--accent2);text-decoration:none">/managed</a> &middot;
    <a href="/directory" style="color:var(--accent2);text-decoration:none">/directory</a> &middot;
    <a href="/directory/submit" style="color:var(--accent2);text-decoration:none">/directory/submit</a>
  </p>
</section>

<div class="disclaimer">
  Disclaimer: wmcp.sh is not affiliated with Stripe, Anthropic, or OpenAI. All product names and brands are property of their respective owners.
</div>

</div>

<section id="upgrade" style="margin-top:36px;background:linear-gradient(135deg,var(--card),rgba(124,92,255,0.08));border:1px solid rgba(124,92,255,0.35);border-radius:16px;padding:22px 26px;max-width:920px;margin-left:auto;margin-right:auto;">
  <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;justify-content:space-between">
    <div style="flex:1;min-width:240px">
      <div style="font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent2);font-weight:700;margin-bottom:6px">Need this done for you?</div>
      <h3 style="margin:0 0 4px;font-size:1.05rem;color:var(--text)">Skip the wiring — we build, deploy, and monitor.</h3>
      <p style="color:var(--muted);margin:0;font-size:.92rem">Custom adapter + hosted MCP at <code>mcp.yourbrand.com</code> + verified badge. From <strong style="color:var(--text)">$499 one-time setup</strong>.</p>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <a href="/managed" style="display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#7c5cff,#00e5ff);color:#0c0c14;padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:700;font-size:.9rem">See /managed →</a>
      <a href="/directory/submit" style="display:inline-flex;align-items:center;gap:6px;background:#11111c;border:1px solid #26263a;color:var(--text);padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:600;font-size:.9rem">Submit (free)</a>
    </div>
  </div>
</section>

<footer>
  <a href="/">Home</a> · <a href="/agent-ready">Agent-ready</a> · <a href="/managed">Done for you</a> · <a href="/price-data">Price data</a> · <a href="/integration/openapi">OpenAPI</a> · <a href="/directory">Directory</a> · <a href="/directory/submit">Submit</a>
</footer>

</body>
</html>`;
}
