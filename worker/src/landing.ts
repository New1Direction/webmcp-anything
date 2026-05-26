export function landingHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>WebMCP Anything — turn any URL into agent tools</title>
<meta name="description" content="Hosted MCP server that turns any product URL into agent-callable tools. Live demo, free tier, open-source adapters." />
<meta property="og:title" content="WebMCP Anything" />
<meta property="og:description" content="Turn any URL into agent-callable MCP tools." />
<meta property="og:url" content="https://wmcp.sh" />
<script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js"></script>
<style>
  :root {
    --bg: #07070d; --card: #16161f; --bg2: #11111c; --border: #26263a;
    --text: #ececf5; --muted: #8a8aa8; --dim: #6a6a88;
    --accent: #7c5cff; --accent2: #00e5ff; --green: #4ade80; --red: #f87171;
    --pink: #f0abfc;
  }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    margin: 0; min-height: 100vh; color: var(--text); background: var(--bg);
    font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
    line-height: 1.6;
    background-image:
      radial-gradient(ellipse 900px 600px at 10% -5%, rgba(124,92,255,.20), transparent 60%),
      radial-gradient(ellipse 700px 500px at 95% 10%, rgba(0,229,255,.12), transparent 60%),
      radial-gradient(ellipse 600px 400px at 50% 110%, rgba(240,171,252,.06), transparent 60%);
  }
  .wrap { max-width: 1080px; margin: 0 auto; padding: 0 24px; }

  /* ---- nav ---- */
  nav {
    display: flex; justify-content: space-between; align-items: center;
    padding: 22px 24px; max-width: 1080px; margin: 0 auto;
  }
  nav .brand { font-weight: 800; letter-spacing: -.02em; font-size: 1.05rem; }
  nav .brand span { color: var(--accent2); }
  nav .links { display: flex; gap: 22px; font-size: .9rem; }
  nav .links a {
    color: var(--muted); text-decoration: none; transition: color .15s;
  }
  nav .links a:hover { color: var(--text); }
  nav .cta {
    background: var(--bg2); border: 1px solid var(--border);
    padding: 7px 14px; border-radius: 8px; font-size: .85rem;
    color: var(--text); text-decoration: none; font-weight: 600;
  }
  nav .cta:hover { border-color: var(--accent); }

  /* ---- hero ---- */
  .hero {
    display: grid; grid-template-columns: 1.1fr .9fr; gap: 48px;
    align-items: center; padding: 50px 0 70px;
  }
  .hero-text .badge {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 6px 14px; border-radius: 999px; font-size: .7rem;
    letter-spacing: .15em; text-transform: uppercase; font-weight: 700;
    background: linear-gradient(90deg, rgba(124,92,255,.18), rgba(0,229,255,.18));
    border: 1px solid rgba(124,92,255,.35); margin-bottom: 22px;
  }
  .dot { width: 6px; height: 6px; background: var(--accent2); border-radius: 50%;
    box-shadow: 0 0 8px var(--accent2); animation: pulse 2s infinite; }
  @keyframes pulse { 50% { opacity: .3 } }
  h1 {
    font-size: clamp(2.2rem, 5vw, 3.6rem); margin: 0 0 18px;
    background: linear-gradient(135deg, #fff 25%, var(--accent2) 100%);
    -webkit-background-clip: text; background-clip: text; color: transparent;
    line-height: 1.04; font-weight: 800; letter-spacing: -.02em;
  }
  h1 .accent { background: linear-gradient(135deg, var(--accent), var(--pink));
    -webkit-background-clip: text; background-clip: text; color: transparent; }
  .sub { color: var(--muted); font-size: 1.08rem; max-width: 460px; margin: 0 0 28px; }
  .hero-ctas { display: flex; gap: 12px; margin-bottom: 18px; }
  .btn-primary, .btn-secondary {
    display: inline-flex; align-items: center; gap: 8px; cursor: pointer;
    padding: 13px 22px; border-radius: 10px; font-weight: 700;
    text-decoration: none; font-size: .92rem; font-family: inherit;
    transition: transform .1s, box-shadow .2s; border: none;
  }
  .btn-primary {
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    color: white; box-shadow: 0 6px 24px rgba(124,92,255,.25);
  }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 10px 30px rgba(124,92,255,.35); }
  .btn-secondary {
    background: var(--bg2); color: var(--text); border: 1px solid var(--border);
  }
  .btn-secondary:hover { border-color: var(--accent); }
  .hero-stat { color: var(--dim); font-size: .82rem; margin-top: 4px; }
  .hero-stat #cache-stat { color: var(--accent2); font-weight: 700; }

  /* ---- hero 3D / model slot ---- */
  .hero-3d {
    position: relative; aspect-ratio: 1; max-width: 480px; margin: 0 auto;
    display: flex; align-items: center; justify-content: center;
  }
  .hero-3d model-viewer {
    width: 100%; height: 100%; background: transparent;
    --poster-color: transparent;
  }
  /* CSS fallback that looks intentional until a real .glb is dropped in */
  .hero-3d .placeholder {
    width: 80%; height: 80%; position: relative;
    perspective: 1200px;
  }
  .hero-3d .cube {
    width: 100%; height: 100%; position: relative;
    transform-style: preserve-3d;
    animation: spin 22s linear infinite;
  }
  @keyframes spin {
    from { transform: rotateY(0) rotateX(-15deg); }
    to   { transform: rotateY(360deg) rotateX(-15deg); }
  }
  .hero-3d .face {
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(124,92,255,.18), rgba(0,229,255,.08));
    border: 1px solid rgba(124,92,255,.35);
    border-radius: 24px;
    backdrop-filter: blur(2px);
    box-shadow: inset 0 0 60px rgba(0,229,255,.08);
  }
  .hero-3d .face.f1 { transform: translateZ(140px); }
  .hero-3d .face.f2 { transform: rotateY(90deg) translateZ(140px); }
  .hero-3d .face.f3 { transform: rotateY(180deg) translateZ(140px); }
  .hero-3d .face.f4 { transform: rotateY(-90deg) translateZ(140px); }
  .hero-3d .face.f5 { transform: rotateX(90deg) translateZ(140px); }
  .hero-3d .face.f6 { transform: rotateX(-90deg) translateZ(140px); }
  .hero-3d .glow {
    position: absolute; inset: -10%; pointer-events: none;
    background: radial-gradient(circle at center, rgba(124,92,255,.25), transparent 60%);
    filter: blur(40px);
    z-index: -1;
  }

  /* ---- demo ---- */
  section { padding: 60px 0; }
  .section-label {
    display: inline-block; font-size: .72rem; font-weight: 700;
    letter-spacing: .15em; text-transform: uppercase;
    color: var(--accent2); margin-bottom: 10px;
  }
  .section-h2 {
    font-size: clamp(1.6rem, 3vw, 2.2rem); margin: 0 0 14px; font-weight: 700;
    letter-spacing: -.02em;
  }
  .section-sub { color: var(--muted); max-width: 600px; margin: 0 0 36px; }

  .demo-box {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 20px; padding: 26px;
  }
  .row { display: flex; gap: 8px; flex-wrap: wrap; }
  input[type=text], input[type=url] {
    flex: 1; min-width: 240px; background: var(--bg2); border: 1px solid var(--border);
    color: var(--text); border-radius: 10px; padding: 13px 16px;
    font-family: "SF Mono", Menlo, monospace; font-size: .9rem;
  }
  input:focus { outline: none; border-color: var(--accent); }
  button.go {
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    color: white; border: none; border-radius: 10px;
    padding: 13px 22px; font-weight: 700; cursor: pointer; font-family: inherit;
    transition: transform .1s;
  }
  button.go:hover { transform: scale(1.02); }
  button.go:disabled { opacity: .5; cursor: wait; }
  .chips { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 14px; }
  .chip {
    background: var(--bg2); border: 1px solid var(--border);
    padding: 6px 12px; border-radius: 999px; font-size: .78rem;
    color: var(--muted); cursor: pointer; transition: all .15s;
  }
  .chip:hover { color: var(--text); border-color: var(--accent); }
  pre {
    margin: 18px 0 0; background: var(--bg); border: 1px solid var(--border);
    border-radius: 12px; padding: 18px; overflow-x: auto;
    font-size: .82rem; color: var(--green); min-height: 180px;
    font-family: "SF Mono", Menlo, monospace; line-height: 1.5;
  }
  pre .k { color: var(--accent2); } pre .s { color: var(--pink); } pre .c { color: var(--dim); }

  /* ---- agent demo ---- */
  .agent {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 20px; padding: 30px;
    display: grid; grid-template-columns: 1fr 1fr; gap: 26px;
    align-items: stretch;
  }
  .chat-window {
    background: var(--bg2); border: 1px solid var(--border);
    border-radius: 14px; padding: 18px; display: flex; flex-direction: column; gap: 12px;
    min-height: 260px;
  }
  .msg {
    padding: 10px 14px; border-radius: 12px; font-size: .9rem;
    max-width: 85%; line-height: 1.5;
    opacity: 0; transform: translateY(6px);
    animation: msgIn .4s forwards;
  }
  @keyframes msgIn { to { opacity: 1; transform: none; } }
  .msg.user { align-self: flex-end; background: rgba(124,92,255,.18); border: 1px solid rgba(124,92,255,.35); }
  .msg.agent { align-self: flex-start; background: var(--bg); border: 1px solid var(--border); }
  .msg.tool {
    align-self: flex-start; background: var(--bg); border: 1px dashed rgba(0,229,255,.35);
    font-family: "SF Mono", Menlo, monospace; font-size: .78rem; color: var(--accent2);
  }
  .msg .tag {
    display: inline-block; font-size: .65rem; font-weight: 700;
    letter-spacing: .1em; text-transform: uppercase; color: var(--dim);
    margin-right: 8px;
  }
  .agent-side h3 { margin: 0 0 8px; font-size: 1.15rem; }
  .agent-side p { color: var(--muted); margin: 0 0 14px; font-size: .92rem; }
  .agent-side ul { color: var(--muted); padding-left: 18px; margin: 0; font-size: .9rem; line-height: 1.85; }
  .agent-side ul li::marker { color: var(--accent2); }
  .agent-side code { color: var(--accent2); background: var(--bg); padding: 1px 6px; border-radius: 4px; font-size: .8rem; }

  /* ---- code snippets / tabs ---- */
  .tabs-wrap {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 16px; overflow: hidden;
  }
  .tabs {
    display: flex; gap: 0; border-bottom: 1px solid var(--border); background: var(--bg2);
    overflow-x: auto;
  }
  .tab {
    background: transparent; border: none; color: var(--muted);
    padding: 14px 20px; cursor: pointer; font-family: inherit; font-weight: 600;
    font-size: .88rem; border-bottom: 2px solid transparent;
    transition: all .15s; white-space: nowrap;
  }
  .tab:hover { color: var(--text); }
  .tab.on { color: var(--text); border-bottom-color: var(--accent2); }
  .tab-body { padding: 22px; }
  .tab-body pre { margin: 0; min-height: auto; }

  /* ---- pricing ---- */
  .plans {
    display: grid; gap: 16px;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }
  .plan {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 18px; padding: 26px;
    display: flex; flex-direction: column;
    transition: all .15s;
  }
  .plan:hover { border-color: var(--accent); transform: translateY(-2px); }
  .plan.featured {
    background: linear-gradient(135deg, var(--card), rgba(124,92,255,.08));
    border-color: var(--accent);
    position: relative;
  }
  .plan.featured::before {
    content: "Most popular"; position: absolute; top: -10px; right: 18px;
    background: linear-gradient(135deg, var(--accent), var(--accent2)); color: white;
    font-size: .65rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
    padding: 4px 10px; border-radius: 999px;
  }
  .plan h3 { margin: 0; font-size: 1.1rem; }
  .plan .price { font-size: 2.2rem; font-weight: 800; margin: 10px 0 6px; letter-spacing: -.02em; }
  .plan .price small { font-size: .9rem; color: var(--muted); font-weight: 500; }
  .plan ul { padding-left: 18px; color: var(--muted); margin: 14px 0; font-size: .9rem; line-height: 1.85; flex: 1; }
  .plan ul li::marker { color: var(--accent2); }
  .plan .pick {
    display: block; text-align: center; text-decoration: none;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    color: white; padding: 11px; border-radius: 10px; font-weight: 700;
  }
  .plan .pick.muted-btn {
    background: var(--bg2); color: var(--muted); border: 1px solid var(--border);
  }

  /* ---- flywheel ---- */
  .flywheel {
    display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center;
  }
  .flywheel-3d {
    position: relative; aspect-ratio: 1; max-width: 380px; margin: 0 auto;
    display: flex; align-items: center; justify-content: center;
  }
  .flywheel-3d .rings {
    position: relative; width: 80%; height: 80%;
  }
  .flywheel-3d .ring {
    position: absolute; border-radius: 50%; border: 1px solid;
  }
  .flywheel-3d .ring.r1 {
    inset: 0; border-color: rgba(124,92,255,.4);
    animation: rot 30s linear infinite;
    background: radial-gradient(circle at 30% 30%, rgba(124,92,255,.08), transparent 60%);
  }
  .flywheel-3d .ring.r2 {
    inset: 15%; border-color: rgba(0,229,255,.45);
    animation: rot 18s linear infinite reverse;
    background: radial-gradient(circle at 70% 40%, rgba(0,229,255,.10), transparent 60%);
  }
  .flywheel-3d .ring.r3 {
    inset: 30%; border-color: rgba(240,171,252,.5);
    animation: rot 10s linear infinite;
    background: radial-gradient(circle at 50% 70%, rgba(240,171,252,.10), transparent 60%);
  }
  .flywheel-3d .ring::before {
    content: ""; position: absolute; width: 10px; height: 10px;
    background: currentColor; border-radius: 50%; top: -5px; left: 50%;
    box-shadow: 0 0 12px currentColor;
  }
  .flywheel-3d .ring.r1::before { color: var(--accent); }
  .flywheel-3d .ring.r2::before { color: var(--accent2); }
  .flywheel-3d .ring.r3::before { color: var(--pink); }
  @keyframes rot { to { transform: rotate(360deg); } }
  .flywheel-text ol { padding-left: 22px; color: var(--muted); line-height: 1.85; font-size: .95rem; }
  .flywheel-text ol li::marker { color: var(--accent2); font-weight: 700; }
  .flywheel-text strong { color: var(--text); }

  /* ---- about ---- */
  .about {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 18px; padding: 28px;
    display: flex; gap: 18px; align-items: flex-start;
  }
  .about-avatar {
    width: 52px; height: 52px; border-radius: 50%; flex-shrink: 0;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    display: grid; place-items: center; font-weight: 800; font-size: 1.2rem; color: white;
  }
  .about-body { flex: 1; }
  .about-body p { margin: 0 0 8px; }
  .about-body a { color: var(--accent2); text-decoration: none; font-weight: 600; }
  .about-body a:hover { text-decoration: underline; }

  /* ---- footer ---- */
  footer {
    border-top: 1px solid var(--border); margin-top: 40px;
    padding: 30px 0; text-align: center; color: var(--muted); font-size: .85rem;
  }
  footer a { color: var(--accent2); text-decoration: none; margin: 0 8px; }
  footer a:hover { text-decoration: underline; }

  /* ---- responsive ---- */
  @media (max-width: 820px) {
    .hero { grid-template-columns: 1fr; gap: 30px; padding: 30px 0 40px; text-align: center; }
    .hero-text .badge { margin: 0 auto 18px; }
    .sub, .hero-ctas { margin-left: auto; margin-right: auto; justify-content: center; }
    .agent { grid-template-columns: 1fr; }
    .flywheel { grid-template-columns: 1fr; gap: 24px; }
    nav .links { display: none; }
  }
</style>
</head>
<body>

<nav>
  <div class="brand">wmcp<span>.sh</span></div>
  <div class="links">
    <a href="#demo">Demo</a>
    <a href="#code">Integrate</a>
    <a href="#pricing">Pricing</a>
    <a href="/directory">Directory</a>
    <a href="https://github.com/New1Direction/webmcp-anything">GitHub</a>
  </div>
  <a class="cta" href="/dashboard">Dashboard →</a>
</nav>

<div class="wrap">

<!-- ========== HERO ========== -->
<section class="hero">
  <div class="hero-text">
    <div class="badge"><span class="dot"></span> live · MCP-compatible</div>
    <h1>Turn any URL into<br/><span class="accent">agent-callable tools.</span></h1>
    <p class="sub">A hosted MCP server. Paste a product URL, get a tool list every AI agent can call — Shopify, JSON-LD sites, and growing. Open-source adapters.</p>
    <div class="hero-ctas">
      <a class="btn-primary" href="#demo">⚡ Try the demo</a>
      <a class="btn-secondary" href="https://github.com/New1Direction/webmcp-anything" target="_blank">★ GitHub</a>
    </div>
    <div class="hero-stat">
      <span id="cache-stat">·</span> <span>URLs cached by the community · grows with every install</span>
    </div>
  </div>
  <div class="hero-3d">
    <!-- Drop a .glb here when ready:
         <model-viewer src="/cube.glb" auto-rotate camera-controls disable-zoom interaction-prompt="none" exposure="1.1" environment-image="neutral"></model-viewer>
    -->
    <div class="placeholder">
      <div class="glow"></div>
      <div class="cube">
        <div class="face f1"></div>
        <div class="face f2"></div>
        <div class="face f3"></div>
        <div class="face f4"></div>
        <div class="face f5"></div>
        <div class="face f6"></div>
      </div>
    </div>
  </div>
</section>

<!-- ========== LIVE DEMO ========== -->
<section id="demo">
  <div class="section-label">Live demo</div>
  <h2 class="section-h2">Paste a URL, get the tools.</h2>
  <p class="section-sub">No signup. No key. Free tier handles 100 reads/day per IP.</p>
  <div class="demo-box">
    <div class="row">
      <input id="u" type="url" placeholder="https://www.allbirds.com/products/mens-wool-runners" />
      <button class="go" id="go">⚡ Get tools</button>
    </div>
    <div class="chips">
      <span style="color:var(--muted);font-size:.78rem;align-self:center">try:</span>
      <span class="chip" data-u="https://www.allbirds.com/products/mens-wool-runners">allbirds (shopify)</span>
      <span class="chip" data-u="https://www.everlane.com/products/mens-organic-cotton-crew-tee-white">everlane (shopify)</span>
      <span class="chip" data-u="https://outdoorvoices.com/products/exercise-dress">outdoor voices (jsonld)</span>
    </div>
    <pre id="out"><span class="c">// Paste a URL and click Get tools.</span></pre>
  </div>
</section>

<!-- ========== AGENT DEMO ========== -->
<section id="agent">
  <div class="section-label">In the loop</div>
  <h2 class="section-h2">What it looks like from your agent's side.</h2>
  <p class="section-sub">An LLM gets the tools, decides which to call, and the call returns real data. That's the whole loop — no per-site adapter code in your app.</p>
  <div class="agent">
    <div class="chat-window" id="chat"></div>
    <div class="agent-side">
      <h3>Drop-in for any agent framework.</h3>
      <p>The schema is MCP-shaped, so your agent doesn't care whether it's Shopify or JSON-LD under the hood. You ship the URL — wmcp.sh ships the tools.</p>
      <ul>
        <li><strong>Static tools</strong> like <code>get_price</code> return immediately</li>
        <li><strong>Live actions</strong> like <code>add_to_cart</code> hit real endpoints</li>
        <li>Cached schemas serve in under <strong>100ms</strong></li>
        <li>Headers tell you your remaining quota</li>
      </ul>
    </div>
  </div>
</section>

<!-- ========== CODE SNIPPETS ========== -->
<section id="code">
  <div class="section-label">Integrate</div>
  <h2 class="section-h2">Three lines into your stack.</h2>
  <p class="section-sub">Pick your framework. Copy. Done.</p>

  <div class="tabs-wrap">
    <div class="tabs">
      <button class="tab on" data-tab="curl">cURL</button>
      <button class="tab" data-tab="js">JavaScript</button>
      <button class="tab" data-tab="claude">Claude tool_use</button>
      <button class="tab" data-tab="langchain">LangChain</button>
      <button class="tab" data-tab="openai">OpenAI</button>
    </div>
    <div class="tab-body">
      <pre data-body="curl"><span class="k">curl</span> <span class="s">'${origin}/api/v1/tools?url=https://www.allbirds.com/products/mens-wool-runners'</span></pre>
      <pre data-body="js" style="display:none"><span class="c">// Plain fetch — works everywhere.</span>
<span class="k">const</span> r = <span class="k">await</span> fetch(
  <span class="s">\`${origin}/api/v1/tools?url=\${encodeURIComponent(url)}\`</span>,
  { headers: { authorization: <span class="s">\`Bearer \${API_KEY}\`</span> } }
);
<span class="k">const</span> { tools } = <span class="k">await</span> r.json();</pre>
      <pre data-body="claude" style="display:none"><span class="c">// Pass wmcp tools straight into Anthropic SDK.</span>
<span class="k">const</span> tools = (<span class="k">await</span> fetch(<span class="s">\`${origin}/api/v1/tools?url=\${url}\`</span>).then(r =&gt; r.json())).tools;
<span class="k">const</span> msg = <span class="k">await</span> anthropic.messages.create({
  model: <span class="s">"claude-opus-4-7"</span>,
  tools: tools.map(t =&gt; ({
    name: t.name,
    description: t.description,
    input_schema: t.inputSchema || { type: <span class="s">"object"</span> }
  })),
  messages: [{ role: <span class="s">"user"</span>, content: <span class="s">"Add the size 10 to my cart."</span> }]
});</pre>
      <pre data-body="langchain" style="display:none"><span class="c"># LangChain — wrap each wmcp tool as a StructuredTool.</span>
<span class="k">from</span> langchain.tools <span class="k">import</span> StructuredTool
<span class="k">import</span> requests

data = requests.get(<span class="s">f"${origin}/api/v1/tools?url={url}"</span>).json()
tools = [
  StructuredTool.from_function(
    func=<span class="k">lambda</span> args, t=t: call_wmcp(t[<span class="s">"name"</span>], args, url),
    name=t[<span class="s">"name"</span>],
    description=t[<span class="s">"description"</span>],
  )
  <span class="k">for</span> t <span class="k">in</span> data[<span class="s">"tools"</span>]
]</pre>
      <pre data-body="openai" style="display:none"><span class="c">// OpenAI function-calling format.</span>
<span class="k">const</span> { tools } = <span class="k">await</span> (<span class="k">await</span> fetch(<span class="s">\`${origin}/api/v1/tools?url=\${url}\`</span>)).json();
<span class="k">const</span> completion = <span class="k">await</span> openai.chat.completions.create({
  model: <span class="s">"gpt-4o"</span>,
  tools: tools.map(t =&gt; ({
    type: <span class="s">"function"</span>,
    function: {
      name: t.name,
      description: t.description,
      parameters: t.inputSchema || { type: <span class="s">"object"</span>, properties: {} }
    }
  })),
  messages: [{ role: <span class="s">"user"</span>, content: <span class="s">"Find the cheapest variant."</span> }]
});</pre>
    </div>
  </div>
</section>

<!-- ========== PRICING ========== -->
<section id="pricing">
  <div class="section-label">Pricing</div>
  <h2 class="section-h2">Free to try. Paid to scale.</h2>
  <p class="section-sub">Every plan includes the open-source adapters and the shared cache. Paid unlocks live execute + higher quotas.</p>
  <div class="plans">
    <div class="plan">
      <h3>Free</h3>
      <div class="price">$0<small>/mo</small></div>
      <ul>
        <li>100 reads / day</li>
        <li>50 cache pushes / day</li>
        <li>No live execute</li>
        <li>Best-effort cache</li>
      </ul>
      <a class="pick muted-btn" href="/dashboard">Use anonymously →</a>
    </div>
    <div class="plan featured">
      <h3>Pro</h3>
      <div class="price">$29<small>/mo</small></div>
      <ul>
        <li>10,000 reads / day</li>
        <li>5,000 cache pushes / day</li>
        <li>1,000 live executes / day</li>
        <li>Shopify <code style="color:var(--accent2)">add_to_cart</code></li>
        <li>Priority cache freshness</li>
      </ul>
      <a class="pick" href="/dashboard#pricing">Upgrade →</a>
    </div>
    <div class="plan">
      <h3>Reseller</h3>
      <div class="price">$99<small>/mo</small></div>
      <ul>
        <li>100,000 reads / day</li>
        <li>50,000 executes / day</li>
        <li>Restock webhooks (coming)</li>
        <li>Headless tier (coming)</li>
        <li>Email support</li>
      </ul>
      <a class="pick" href="/dashboard#pricing">Upgrade →</a>
    </div>
  </div>
</section>

<!-- ========== FLYWHEEL ========== -->
<section id="flywheel">
  <div class="section-label">Network effect</div>
  <div class="flywheel">
    <div class="flywheel-3d">
      <div class="rings">
        <div class="ring r1"></div>
        <div class="ring r2"></div>
        <div class="ring r3"></div>
      </div>
    </div>
    <div class="flywheel-text">
      <h2 class="section-h2">It gets faster the more people use it.</h2>
      <ol>
        <li><strong>You hit a URL.</strong> If we've seen it, you get cached tools in &lt;100ms.</li>
        <li><strong>If not, an adapter runs.</strong> Shopify, JSON-LD, or — for protected sites — the Chrome extension extracts client-side.</li>
        <li><strong>The schema gets pushed back to the shared cache.</strong> Next person who asks gets it instantly. Without ever installing anything.</li>
      </ol>
      <p style="color:var(--muted);margin-top:18px;font-size:.92rem">Every install of the extension makes the hosted API better for everyone — including users who never install it. <a href="/directory" style="color:var(--accent2);text-decoration:none">See what's already cached →</a></p>
    </div>
  </div>
</section>

<!-- ========== ABOUT ========== -->
<section id="about">
  <div class="about">
    <div class="about-avatar">W</div>
    <div class="about-body">
      <p style="color:var(--muted)"><strong style="color:var(--text)">Why this exists.</strong> LLM agents can talk to ChatGPT but not to Allbirds. Every framework reinvents per-site scrapers and the same Shopify cart endpoint gets rediscovered weekly. wmcp.sh is the open layer that solves it once.</p>
      <p style="color:var(--muted)">Built in the open. Adapters are MIT-licensed. PRs accepted. <a href="https://github.com/New1Direction/webmcp-anything">github.com/New1Direction/webmcp-anything</a> · <a href="/directory">directory</a></p>
    </div>
  </div>
</section>

</div>

<footer>
  <a href="/">Home</a> · <a href="/directory">Directory</a> · <a href="/dashboard">Dashboard</a> · <a href="https://github.com/New1Direction/webmcp-anything">GitHub</a> · <a href="https://developer.chrome.com/docs/ai/webmcp">WebMCP spec ↗</a>
</footer>

<script>
const ORIGIN = ${JSON.stringify(origin)};

// ---- live cache counter ----
(async function loadStat() {
  try {
    const r = await fetch(ORIGIN + "/api/v1/stats/public");
    const d = await r.json();
    const target = d.cached_urls | 0;
    const el = document.getElementById("cache-stat");
    if (target <= 0) { el.textContent = "Just"; return; }
    const start = performance.now();
    const dur = 1400;
    function tick(t) {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(target * eased).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  } catch {}
})();

// ---- live demo ----
const out = document.getElementById("out");
const inp = document.getElementById("u");
const btn = document.getElementById("go");

document.querySelectorAll(".chip").forEach(c => {
  c.addEventListener("click", () => { inp.value = c.dataset.u; runDemo(); });
});
btn.addEventListener("click", runDemo);
inp.addEventListener("keydown", e => { if (e.key === "Enter") runDemo(); });

async function runDemo() {
  const url = inp.value.trim();
  if (!url) return;
  btn.disabled = true; btn.textContent = "…";
  out.innerHTML = '<span class="c">// fetching ' + escapeHtml(url) + '…</span>';
  try {
    const r = await fetch(ORIGIN + "/api/v1/tools?url=" + encodeURIComponent(url));
    const data = await r.json();
    out.innerHTML = colorize(JSON.stringify(data, null, 2));
  } catch (e) {
    out.innerHTML = '<span style="color:var(--red)">' + escapeHtml(String(e)) + '</span>';
  } finally {
    btn.disabled = false; btn.textContent = "⚡ Get tools";
  }
}

function escapeHtml(s) {
  return s.replace(/[&<>]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;"})[c]);
}
function colorize(json) {
  return escapeHtml(json)
    .replace(/&quot;([^&]+?)&quot;:/g, '<span class="k">"$1"</span>:')
    .replace(/: &quot;([^&]*?)&quot;/g, ': <span class="s">"$1"</span>');
}

// ---- code tabs ----
document.querySelectorAll(".tab").forEach(t => {
  t.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(x => x.classList.remove("on"));
    t.classList.add("on");
    const which = t.dataset.tab;
    document.querySelectorAll("[data-body]").forEach(p => {
      p.style.display = p.dataset.body === which ? "" : "none";
    });
  });
});

// ---- looping chat demo ----
const chat = document.getElementById("chat");
const script = [
  { type: "user",  text: "Add the size 10 Allbirds Wool Runners to my cart." },
  { type: "agent", text: "Looking that up via wmcp.sh…" },
  { type: "tool",  text: "→ GET /api/v1/tools?url=allbirds.com/products/mens-wool-runners" },
  { type: "tool",  text: "← 12 tools · get_price · add_to_cart · list_variants…" },
  { type: "tool",  text: "→ POST /tools/execute { tool: \\"add_to_cart\\", args: { variant_id: 47291, qty: 1 } }" },
  { type: "tool",  text: "← { ok: true, cart_count: 1 }" },
  { type: "agent", text: "Done — Wool Runner in size 10 is in your cart." },
];

function renderChat() {
  chat.innerHTML = "";
  let delay = 0;
  for (const m of script) {
    const el = document.createElement("div");
    el.className = "msg " + m.type;
    el.style.animationDelay = delay + "ms";
    const tag = m.type === "user" ? "you" : m.type === "agent" ? "agent" : "wmcp";
    el.innerHTML = '<span class="tag">' + tag + '</span>' + escapeHtml(m.text);
    chat.appendChild(el);
    delay += 700;
  }
  // Restart the loop after the script finishes + a pause.
  setTimeout(renderChat, delay + 3500);
}
renderChat();
</script>
</body>
</html>`;
}
