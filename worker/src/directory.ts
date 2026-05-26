export function directoryHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Directory · WebMCP Anything</title>
<meta name="description" content="Every URL the community has turned into agent-callable tools. Searchable directory of WebMCP schemas." />
<style>
  :root {
    --bg: #07070d; --card: #16161f; --bg2: #11111c; --border: #26263a;
    --text: #ececf5; --muted: #8a8aa8;
    --accent: #7c5cff; --accent2: #00e5ff; --green: #4ade80;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh; color: var(--text); background: var(--bg);
    font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
    line-height: 1.6;
    background-image: radial-gradient(ellipse 800px 500px at 20% 0%, rgba(124,92,255,.12), transparent);
  }
  .wrap { max-width: 1000px; margin: 0 auto; padding: 50px 24px; }
  header { margin-bottom: 32px; }
  h1 {
    font-size: 2rem; margin: 0 0 6px;
    background: linear-gradient(90deg, #fff, var(--accent2));
    -webkit-background-clip: text; background-clip: text; color: transparent;
  }
  .muted { color: var(--muted); }
  .stats {
    display: flex; gap: 24px; margin: 18px 0 28px;
    flex-wrap: wrap;
  }
  .stat {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 12px; padding: 14px 18px; min-width: 160px;
  }
  .stat .n { font-size: 1.5rem; font-weight: 800; color: var(--accent2); }
  .stat .l { font-size: .76rem; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); }
  .filter-row {
    display: flex; gap: 8px; margin-bottom: 18px; flex-wrap: wrap;
  }
  input[type=search] {
    flex: 1; min-width: 240px;
    background: var(--bg2); border: 1px solid var(--border);
    color: var(--text); border-radius: 10px; padding: 11px 14px;
    font-family: inherit; font-size: .9rem;
  }
  input[type=search]:focus { outline: none; border-color: var(--accent); }
  .pill {
    background: var(--bg2); border: 1px solid var(--border);
    color: var(--muted); padding: 8px 14px; border-radius: 999px;
    cursor: pointer; font-size: .82rem; font-weight: 600;
    transition: all .15s;
  }
  .pill.on, .pill:hover { color: var(--text); border-color: var(--accent); }
  .row {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 12px; padding: 14px 16px; margin-bottom: 8px;
    display: grid; grid-template-columns: auto 1fr auto auto; gap: 12px;
    align-items: center;
  }
  .row:hover { border-color: var(--accent); }
  .row .badge {
    font-size: .68rem; font-weight: 700; letter-spacing: .06em;
    text-transform: uppercase; padding: 3px 9px; border-radius: 999px;
  }
  .row .badge.shopify { background: rgba(74,222,128,.15); color: var(--green); }
  .row .badge.jsonld { background: rgba(0,229,255,.15); color: var(--accent2); }
  .row .badge.other { background: rgba(138,138,168,.15); color: var(--muted); }
  .row .title {
    font-size: .94rem; font-weight: 600; overflow: hidden;
    text-overflow: ellipsis; white-space: nowrap;
  }
  .row .url {
    color: var(--muted); font-size: .78rem; font-family: "SF Mono", Menlo, monospace;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .row .age { color: var(--muted); font-size: .78rem; }
  .row .open {
    background: var(--bg2); border: 1px solid var(--border); color: var(--text);
    padding: 7px 12px; border-radius: 8px; text-decoration: none;
    font-size: .78rem; font-weight: 600;
  }
  .row .open:hover { border-color: var(--accent); }
  .empty {
    text-align: center; padding: 60px 20px; color: var(--muted);
    background: var(--card); border: 1px dashed var(--border); border-radius: 14px;
  }
  footer { margin-top: 40px; text-align: center; color: var(--muted); font-size: .82rem; }
  footer a { color: var(--accent2); text-decoration: none; }
  @media (max-width: 700px) {
    .row { grid-template-columns: auto 1fr; }
    .row .url, .row .age { grid-column: 1 / -1; }
    .row .open { grid-column: 2; justify-self: end; }
  }
</style>
</head>
<body>
<div class="wrap">
<header>
  <h1>Directory</h1>
  <p class="muted">Every URL the community has turned into agent tools. Try one — they're all live.</p>
</header>

<div class="stats">
  <div class="stat"><div class="n" id="stat-total">·</div><div class="l">URLs indexed</div></div>
  <div class="stat"><div class="n" id="stat-shopify">·</div><div class="l">Shopify stores</div></div>
  <div class="stat"><div class="n" id="stat-jsonld">·</div><div class="l">JSON-LD sites</div></div>
</div>

<div class="filter-row">
  <input type="search" id="q" placeholder="search by url or title…" />
  <button class="pill on" data-filter="all">All</button>
  <button class="pill" data-filter="shopify">Shopify</button>
  <button class="pill" data-filter="jsonld">JSON-LD</button>
</div>

<div id="list"></div>

<footer>
  WebMCP Anything · <a href="/">Home</a> · <a href="/dashboard">Dashboard</a>
</footer>
</div>

<script>
const ORIGIN = ${JSON.stringify(origin)};
let entries = [];
let filter = "all";
let query = "";

const list = document.getElementById("list");
const q = document.getElementById("q");

q.addEventListener("input", () => { query = q.value.toLowerCase(); render(); });
document.querySelectorAll(".pill[data-filter]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".pill[data-filter]").forEach(b => b.classList.remove("on"));
    btn.classList.add("on");
    filter = btn.dataset.filter;
    render();
  });
});

function relTime(ts) {
  const s = (Date.now() - ts) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return Math.floor(s / 60) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago";
  return Math.floor(s / 86400) + "d ago";
}

function render() {
  const filtered = entries.filter(e => {
    if (filter !== "all" && e.adapter !== filter) return false;
    if (!query) return true;
    return (e.url + " " + (e.title || "")).toLowerCase().includes(query);
  });
  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty">No URLs match yet. Add one by hitting <code>/api/v1/tools?url=…</code></div>';
    return;
  }
  list.innerHTML = filtered.map(e => {
    const host = (() => { try { return new URL(e.url).hostname.replace(/^www\\./, ""); } catch { return e.url; } })();
    const title = e.title || host;
    const cls = e.adapter === "shopify" ? "shopify" : e.adapter === "jsonld" ? "jsonld" : "other";
    return \`<div class="row">
      <span class="badge \${cls}">\${e.adapter}</span>
      <div>
        <div class="title">\${escapeHtml(title)}</div>
        <div class="url">\${escapeHtml(e.url)}</div>
      </div>
      <span class="age">\${relTime(e.ts)}</span>
      <a class="open" href="\${ORIGIN}/api/v1/tools?url=\${encodeURIComponent(e.url)}" target="_blank">JSON →</a>
    </div>\`;
  }).join("");
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);
}

(async function load() {
  try {
    const r = await fetch(ORIGIN + "/api/v1/directory");
    const d = await r.json();
    entries = (d.entries || []).sort((a, b) => b.ts - a.ts);
    document.getElementById("stat-total").textContent = entries.length.toLocaleString();
    const hosts = new Set();
    let shop = 0, jl = 0;
    entries.forEach(e => {
      if (e.adapter === "shopify") shop++;
      if (e.adapter === "jsonld") jl++;
      try { hosts.add(new URL(e.url).hostname); } catch {}
    });
    document.getElementById("stat-shopify").textContent = shop.toLocaleString();
    document.getElementById("stat-jsonld").textContent = jl.toLocaleString();
    render();
  } catch (e) {
    list.innerHTML = '<div class="empty">Failed to load directory.</div>';
  }
})();
</script>
</body>
</html>`;
}
