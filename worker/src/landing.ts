export function landingHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>WebMCP Anything — turn any URL into agent tools</title>
<style>
  :root {
    --bg: #07070d; --card: #16161f; --bg2: #11111c; --border: #26263a;
    --text: #ececf5; --muted: #8a8aa8;
    --accent: #7c5cff; --accent2: #00e5ff; --green: #4ade80; --red: #f87171;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh; color: var(--text); background: var(--bg);
    font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
    line-height: 1.6;
    background-image:
      radial-gradient(ellipse 700px 500px at 10% 0%, rgba(124,92,255,.18), transparent),
      radial-gradient(ellipse 600px 400px at 90% 20%, rgba(0,229,255,.10), transparent);
  }
  .wrap { max-width: 920px; margin: 0 auto; padding: 60px 24px; }
  header { text-align: center; margin-bottom: 40px; }
  .badge {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 6px 14px; border-radius: 999px; font-size: .72rem;
    letter-spacing: .15em; text-transform: uppercase; font-weight: 700;
    background: linear-gradient(90deg, rgba(124,92,255,.2), rgba(0,229,255,.2));
    border: 1px solid rgba(124,92,255,.4); margin-bottom: 18px;
  }
  .dot { width: 6px; height: 6px; background: var(--accent2); border-radius: 50%;
    box-shadow: 0 0 8px var(--accent2); animation: p 2s infinite; }
  @keyframes p { 50% { opacity: .3 } }
  h1 {
    font-size: clamp(2rem, 5vw, 3.4rem); margin: 0 0 12px;
    background: linear-gradient(135deg, #fff 30%, var(--accent2) 100%);
    -webkit-background-clip: text; background-clip: text; color: transparent;
    line-height: 1.05; font-weight: 800;
  }
  .sub { color: var(--muted); max-width: 600px; margin: 0 auto; }
  .demo {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 20px; padding: 28px; margin-top: 32px;
  }
  .row { display: flex; gap: 8px; flex-wrap: wrap; }
  input {
    flex: 1; min-width: 240px; background: var(--bg2); border: 1px solid var(--border);
    color: var(--text); border-radius: 10px; padding: 13px 16px;
    font-family: "SF Mono", Menlo, monospace; font-size: .9rem;
  }
  input:focus { outline: none; border-color: var(--accent); }
  button {
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    color: white; border: none; border-radius: 10px;
    padding: 13px 22px; font-weight: 700; cursor: pointer; font-family: inherit;
    transition: transform .1s;
  }
  button:hover { transform: scale(1.03); }
  button:disabled { opacity: .5; cursor: wait; }
  .chips { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 14px; }
  .chip {
    background: var(--bg2); border: 1px solid var(--border);
    padding: 6px 12px; border-radius: 999px; font-size: .78rem;
    color: var(--muted); cursor: pointer;
  }
  .chip:hover { color: var(--text); border-color: var(--accent); }
  pre {
    margin: 18px 0 0; background: var(--bg); border: 1px solid var(--border);
    border-radius: 12px; padding: 18px; overflow-x: auto;
    font-size: .82rem; color: var(--green); min-height: 180px;
    font-family: "SF Mono", Menlo, monospace; line-height: 1.5;
  }
  pre .k { color: var(--accent2); } pre .s { color: #f0abfc; } pre .c { color: var(--muted); }
  .docs {
    margin-top: 48px; display: grid; gap: 16px;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  }
  .doc-card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 14px; padding: 20px;
  }
  .doc-card code {
    background: var(--bg); padding: 2px 8px; border-radius: 6px;
    color: var(--accent2); font-size: .82rem;
  }
  .doc-card h3 { margin: 0 0 8px; font-size: 1rem; }
  .doc-card p { margin: 6px 0 0; color: var(--muted); font-size: .88rem; }
  footer { margin-top: 40px; text-align: center; color: var(--muted); font-size: .82rem; }
  footer a { color: var(--accent2); text-decoration: none; }
</style>
</head>
<body>
<div class="wrap">
<header>
  <div class="badge"><span class="dot"></span> live API · v0.1</div>
  <h1>Turn any URL into<br/>agent-callable tools.</h1>
  <p class="sub">A hosted WebMCP schema generator. Paste a product URL, get a tool list any AI agent can call.</p>
  <p class="sub" style="margin-top:14px;font-size:.85rem">
    <span style="color:var(--accent2);font-weight:700" id="cache-stat">·</span>
    <span style="color:var(--muted)">URLs cached by the community</span>
  </p>
</header>

<div class="demo">
  <div class="row">
    <input id="u" placeholder="https://www.allbirds.com/products/mens-wool-runners" />
    <button id="go">⚡ Get tools</button>
  </div>
  <div class="chips">
    <span style="color:var(--muted);font-size:.78rem;align-self:center">try:</span>
    <span class="chip" data-u="https://www.allbirds.com/products/mens-wool-runners">allbirds (shopify)</span>
    <span class="chip" data-u="https://shop.tesla.com/product/men_s-cybertruck-graphic-tee">tesla shop</span>
    <span class="chip" data-u="https://www.bestbuy.com/site/sony-wh1000xm5/6505728.p">bestbuy (jsonld)</span>
  </div>
  <pre id="out"><span class="c">// Paste a URL and click Get tools.</span></pre>
</div>

<div class="docs">
  <div class="doc-card">
    <h3>GET /api/v1/tools</h3>
    <code>?url=&lt;product-url&gt;</code>
    <p>Returns a WebMCP-compatible tool schema. Cached 60s.</p>
  </div>
  <div class="doc-card">
    <h3>POST /api/v1/tools/execute</h3>
    <code>{ url, tool, args }</code>
    <p>Run a tool live (Shopify supports actions; JSON-LD returns snapshots).</p>
  </div>
  <div class="doc-card">
    <h3>POST /api/v1/cache</h3>
    <code>{ url, payload }</code>
    <p>Extension pushes pre-extracted schemas for bot-protected sites.</p>
  </div>
</div>

<div style="text-align:center;margin:50px 0 20px;">
  <a href="/dashboard" style="display:inline-block;padding:12px 24px;border-radius:10px;background:var(--bg2);border:1px solid var(--border);color:var(--text);text-decoration:none;font-weight:600;">View pricing & get API key →</a>
</div>

<footer>WebMCP Anything · <a href="/directory">Directory</a> · <a href="/dashboard">Dashboard</a> · <a href="https://developer.chrome.com/docs/ai/webmcp">Chrome WebMCP docs ↗</a></footer>
</div>

<script>
const ORIGIN = ${JSON.stringify(origin)};
const out = document.getElementById("out");
const inp = document.getElementById("u");
const btn = document.getElementById("go");

// --- Public cache counter ---
(async function loadStat() {
  try {
    const r = await fetch(ORIGIN + "/api/v1/stats/public");
    const d = await r.json();
    const target = d.cached_urls | 0;
    const el = document.getElementById("cache-stat");
    if (target <= 0) {
      el.parentElement.style.display = "none";
      return;
    }
    const start = performance.now();
    const dur = 1200;
    function tick(t) {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(target * eased).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  } catch {}
})();

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
