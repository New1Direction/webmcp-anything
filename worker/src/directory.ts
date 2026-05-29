export function directoryHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<title>Directory · WebMCP Anything</title>
<meta name="description" content="Every URL the community has turned into agent-callable MCP tools. Searchable, grouped by store, with live counts." />
<style>
  :root {
    --bg: #07070d; --card: #16161f; --bg2: #11111c; --border: #26263a;
    --text: #ececf5; --muted: #8a8aa8; --dim: #6a6a88;
    --accent: #7c5cff; --accent2: #00e5ff; --green: #4ade80; --pink: #f0abfc;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh; color: var(--text); background: var(--bg);
    font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
    line-height: 1.6;
    background-image: radial-gradient(ellipse 800px 500px at 20% 0%, rgba(124,92,255,.12), transparent);
  }
  .wrap { max-width: 1080px; margin: 0 auto; padding: 50px 24px; }
  header { margin-bottom: 28px; }
  h1 {
    font-size: 2rem; margin: 0 0 6px;
    background: linear-gradient(90deg, #fff, var(--accent2));
    -webkit-background-clip: text; background-clip: text; color: transparent;
  }
  .muted { color: var(--muted); }
  a { color: var(--accent2); text-decoration: none; }

  /* ---- top stats ---- */
  .stats {
    display: grid; gap: 12px; margin: 22px 0 28px;
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  }
  .stat {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 12px; padding: 14px 18px;
  }
  .stat .n { font-size: 1.6rem; font-weight: 800; color: var(--accent2); line-height: 1.1; }
  .stat .l { font-size: .76rem; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); margin-top: 4px; }

  /* ---- controls ---- */
  .controls { display: flex; gap: 10px; margin-bottom: 18px; flex-wrap: wrap; align-items: center; }
  input[type=search] {
    flex: 1; min-width: 240px;
    background: var(--bg2); border: 1px solid var(--border);
    color: var(--text); border-radius: 10px; padding: 11px 14px;
    font-family: inherit; font-size: .9rem;
  }
  input[type=search]:focus { outline: none; border-color: var(--accent); }
  .pills { display: flex; gap: 6px; flex-wrap: wrap; }
  .pill {
    background: var(--bg2); border: 1px solid var(--border);
    color: var(--muted); padding: 8px 14px; border-radius: 999px;
    cursor: pointer; font-size: .82rem; font-weight: 600;
    transition: all .15s; font-family: inherit;
  }
  .pill.on, .pill:hover { color: var(--text); border-color: var(--accent); }
  .view-toggle { display: flex; gap: 4px; padding: 4px; background: var(--bg2); border: 1px solid var(--border); border-radius: 10px; }
  .view-toggle button {
    background: transparent; border: none; color: var(--muted);
    padding: 6px 12px; border-radius: 7px; font-size: .82rem; font-weight: 600;
    cursor: pointer; font-family: inherit;
  }
  .view-toggle button.on { background: var(--card); color: var(--text); }

  /* ---- store-grouped view ---- */
  .store-group {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 12px; margin-bottom: 10px; overflow: hidden;
  }
  .store-head {
    display: flex; flex-wrap: wrap; gap: 10px;
    align-items: center; padding: 14px 18px; cursor: pointer;
    transition: background .15s;
  }
  .store-head .name { flex: 1; min-width: 0; }
  .store-head:hover { background: var(--bg2); }
  .store-head .icon {
    width: 32px; height: 32px; border-radius: 8px;
    background: var(--bg); display: grid; place-items: center;
    color: var(--accent2); font-weight: 800; font-size: .9rem;
  }
  .store-head .name { font-weight: 700; font-size: .95rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .store-head .count {
    background: var(--bg); color: var(--accent2);
    padding: 3px 10px; border-radius: 999px;
    font-size: .72rem; font-weight: 700;
  }
  .store-head .chev {
    color: var(--muted); font-size: 1rem; transition: transform .15s;
  }
  .store-group.open .store-head .chev { transform: rotate(90deg); }
  .store-products {
    display: none; padding: 0 18px 14px;
    border-top: 1px solid var(--border);
  }
  .store-group.open .store-products { display: block; }
  .store-group.featured {
    border-color: rgba(124,92,255,.55);
    background: linear-gradient(135deg, var(--card), rgba(124,92,255,.06));
    box-shadow: 0 0 0 1px rgba(124,92,255,.18);
  }
  .store-head .verified-chip {
    display: inline-flex; align-items: center; gap: 4px;
    background: linear-gradient(135deg, rgba(124,92,255,.18), rgba(0,229,255,.18));
    border: 1px solid rgba(124,92,255,.45); color: var(--accent2);
    font-size: .62rem; font-weight: 700; letter-spacing: .08em;
    padding: 2px 7px; border-radius: 999px; text-transform: uppercase;
  }
  .store-head .featured-chip {
    background: rgba(251,191,36,.15); color: #fbbf24;
    border: 1px solid rgba(251,191,36,.35);
    font-size: .62rem; font-weight: 700; letter-spacing: .08em;
    padding: 2px 7px; border-radius: 999px; text-transform: uppercase;
  }
  .product-row .verified-tick { color: var(--accent2); font-size: .8rem; }
  .flat-row .verified-chip {
    display: inline-flex; align-items: center; gap: 4px;
    background: linear-gradient(135deg, rgba(124,92,255,.18), rgba(0,229,255,.18));
    border: 1px solid rgba(124,92,255,.45); color: var(--accent2);
    font-size: .62rem; font-weight: 700; letter-spacing: .08em;
    padding: 2px 7px; border-radius: 999px; text-transform: uppercase;
  }
  .product-row {
    display: grid; grid-template-columns: auto 1fr auto auto; gap: 12px;
    align-items: center; padding: 10px 0;
    border-bottom: 1px solid var(--border);
    font-size: .85rem;
  }
  .product-row:last-child { border-bottom: none; }
  .product-row .badge {
    font-size: .65rem; font-weight: 700; letter-spacing: .06em;
    text-transform: uppercase; padding: 2px 7px; border-radius: 999px;
  }
  .product-row .badge.shopify { background: rgba(74,222,128,.15); color: var(--green); }
  .product-row .badge.jsonld { background: rgba(0,229,255,.15); color: var(--accent2); }
  .product-row .badge.openapi { background: rgba(240,171,252,.15); color: var(--pink); }
  .product-row .badge.llm { background: rgba(251,191,36,.15); color: #fbbf24; }
  .product-row .badge.other { background: rgba(138,138,168,.15); color: var(--muted); }
  .product-row .ptitle {
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .product-row .ptitle a { color: var(--text); text-decoration: none; }
  .product-row .ptitle a:hover { color: var(--accent2); }
  .product-row .ptitle .purl {
    font-family: "SF Mono", Menlo, monospace; font-size: .72rem;
    color: var(--dim); margin-top: 2px;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    display: block;
  }
  .product-row .page-link {
    background: var(--bg2); border: 1px solid var(--border); color: var(--text);
    padding: 5px 10px; border-radius: 7px; font-size: .72rem; font-weight: 600;
    text-decoration: none;
  }
  .product-row .page-link:hover { border-color: var(--accent); }

  /* ---- flat view (legacy) ---- */
  .flat-row {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 12px; padding: 14px 16px; margin-bottom: 8px;
    display: grid; grid-template-columns: auto 1fr auto auto; gap: 12px;
    align-items: center;
  }
  .flat-row .badge {
    font-size: .68rem; font-weight: 700; letter-spacing: .06em;
    text-transform: uppercase; padding: 3px 9px; border-radius: 999px;
  }
  .flat-row .badge.shopify { background: rgba(74,222,128,.15); color: var(--green); }
  .flat-row .badge.jsonld { background: rgba(0,229,255,.15); color: var(--accent2); }
  .flat-row .badge.openapi { background: rgba(240,171,252,.15); color: var(--pink); }
  .flat-row .badge.llm { background: rgba(251,191,36,.15); color: #fbbf24; }
  .flat-row .badge.other { background: rgba(138,138,168,.15); color: var(--muted); }
  .flat-row .title {
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    font-size: .94rem; font-weight: 600;
  }
  .flat-row .url {
    color: var(--muted); font-size: .78rem; font-family: "SF Mono", Menlo, monospace;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    margin-top: 2px;
  }
  .flat-row .age { color: var(--muted); font-size: .78rem; }
  .flat-row .open-btn {
    background: var(--bg2); border: 1px solid var(--border); color: var(--text);
    padding: 7px 12px; border-radius: 8px; text-decoration: none;
    font-size: .78rem; font-weight: 600;
  }

  /* ---- pagination ---- */
  .load-more {
    display: block; width: 100%; padding: 14px;
    background: var(--card); border: 1px solid var(--border);
    color: var(--text); border-radius: 10px;
    font-weight: 600; cursor: pointer; font-family: inherit;
    margin: 18px 0; text-align: center;
  }
  .load-more:hover { border-color: var(--accent); }
  .load-more:disabled { opacity: .5; cursor: not-allowed; }

  .empty {
    text-align: center; padding: 60px 20px; color: var(--muted);
    background: var(--card); border: 1px dashed var(--border); border-radius: 14px;
  }
  footer { margin-top: 40px; text-align: center; color: var(--muted); font-size: .82rem; }
  footer a { margin: 0 8px; }
  @media (max-width: 700px) {
    .store-head { grid-template-columns: auto 1fr auto; }
    .store-head .chev { display: none; }
    .product-row { grid-template-columns: auto 1fr auto; }
    .product-row .age { display: none; }
  }
</style>
</head>
<body>
<div class="wrap">
<header>
  <h1>Directory</h1>
  <p class="muted">Every URL the community has turned into agent-callable MCP tools. Click any store to expand its products. <a href="/integration/openapi">OpenAPI</a> · <a href="/integration/shopify">Shopify</a> · <a href="/integration/stripe">Stripe</a></p>
  <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px">
    <a href="/directory/submit" style="display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#7c5cff,#00e5ff);color:#0c0c14;padding:9px 16px;border-radius:8px;text-decoration:none;font-weight:700;font-size:.9rem">+ Submit your site (free)</a>
    <a href="/directory/claim" style="display:inline-flex;align-items:center;gap:8px;background:#16161f;border:1px solid #26263a;color:#ececf5;padding:9px 16px;border-radius:8px;text-decoration:none;font-weight:600;font-size:.9rem">Get the Verified badge →</a>
  </div>
</header>

<div class="stats">
  <div class="stat"><div class="n" id="stat-products">·</div><div class="l">URLs indexed</div></div>
  <div class="stat"><div class="n" id="stat-stores">·</div><div class="l">Unique stores</div></div>
  <div class="stat"><div class="n" id="stat-shopify">·</div><div class="l">Shopify</div></div>
  <div class="stat"><div class="n" id="stat-jsonld">·</div><div class="l">JSON-LD</div></div>
  <div class="stat"><div class="n" id="stat-openapi">·</div><div class="l">OpenAPI</div></div>
  <div class="stat"><div class="n" id="stat-llm">·</div><div class="l">LLM extracted</div></div>
</div>

<div class="controls">
  <input type="search" id="q" placeholder="search by URL, title, or store…" />
  <div class="pills">
    <button class="pill on" data-filter="all">All</button>
    <button class="pill" data-filter="shopify">Shopify</button>
    <button class="pill" data-filter="jsonld">JSON-LD</button>
    <button class="pill" data-filter="openapi">OpenAPI</button>
    <button class="pill" data-filter="llm">LLM</button>
  </div>
  <div class="view-toggle">
    <button data-view="grouped" class="on">By store</button>
    <button data-view="flat">Flat</button>
  </div>
</div>

<div id="list"></div>

<footer>
  WebMCP Anything · <a href="/">Home</a> · <a href="/directory/submit">Submit your site</a> · <a href="/directory/claim">Get verified</a> · <a href="/dashboard">Dashboard</a> · <a href="https://github.com/New1Direction/webmcp-anything">GitHub</a>
</footer>
</div>

<script>
const ORIGIN = ${JSON.stringify(origin)};
const PAGE_SIZE = 30; // stores per page in grouped view; rows per page in flat view
let entries = [];
let filter = "all";
let query = "";
let view = "grouped";
let visiblePage = 1;

const list = document.getElementById("list");
const q = document.getElementById("q");

q.addEventListener("input", () => { query = q.value.toLowerCase(); visiblePage = 1; render(); });
document.querySelectorAll(".pill[data-filter]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".pill[data-filter]").forEach(b => b.classList.remove("on"));
    btn.classList.add("on");
    filter = btn.dataset.filter;
    visiblePage = 1;
    render();
  });
});
document.querySelectorAll(".view-toggle button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".view-toggle button").forEach(b => b.classList.remove("on"));
    btn.classList.add("on");
    view = btn.dataset.view;
    visiblePage = 1;
    render();
  });
});

function hostnameOf(url) {
  try { return new URL(url).hostname.replace(/^www\\./, ""); } catch { return url; }
}
function relTime(ts) {
  const s = (Date.now() - ts) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return Math.floor(s / 60) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago";
  return Math.floor(s / 86400) + "d ago";
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);
}
function b64url(s) {
  return btoa(s).replace(/\\+/g, "-").replace(/\\//g, "_").replace(/=+$/, "");
}

function applyFilters(es) {
  return es.filter(e => {
    if (filter !== "all" && e.adapter !== filter) return false;
    if (!query) return true;
    return (e.url + " " + (e.title || "")).toLowerCase().includes(query);
  });
}

function renderGrouped(filtered) {
  const byStore = new Map();
  for (const e of filtered) {
    const host = hostnameOf(e.url);
    if (!byStore.has(host)) byStore.set(host, []);
    byStore.get(host).push(e);
  }
  // Sort stores by product count desc, then alpha
  const sorted = Array.from(byStore.entries())
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));

  const totalStores = sorted.length;
  if (totalStores === 0) return { html: '<div class="empty">No URLs match your filters.</div>', more: false };

  const shown = sorted.slice(0, visiblePage * PAGE_SIZE);

  const html = shown.map(([host, products]) => {
    const initial = host[0]?.toUpperCase() || "·";
    const sample = products.slice(0, 15);
    // Aggregate store-level flags: any verified/featured product wins.
    const anyVerified = products.some(p => p.verified);
    const featuredRank = products.reduce((acc, p) => (
      p.featured_rank != null && (acc == null || p.featured_rank < acc) ? p.featured_rank : acc
    ), null);
    const productRows = sample.map(e => {
      const cls = ["shopify","jsonld","openapi","llm"].includes(e.adapter) ? e.adapter : "other";
      const title = e.title || hostnameOf(e.url);
      const tick = e.verified ? '<span class="verified-tick" title="Agent-ready Verified">●</span>' : '';
      return \`<div class="product-row">
        <span class="badge \${cls}">\${e.adapter}</span>
        <div class="ptitle">
          <a href="/u/\${b64url(e.url)}">\${tick}\${escapeHtml(title)}</a>
          <span class="purl">\${escapeHtml(e.url)}</span>
        </div>
        <span class="age">\${relTime(e.ts)}</span>
        <a class="page-link" href="/u/\${b64url(e.url)}">page →</a>
      </div>\`;
    }).join("");
    const overflow = products.length > 15
      ? \`<div style="text-align:center;padding:10px 0;color:var(--muted);font-size:.82rem">+ \${products.length - 15} more products</div>\`
      : "";
    const verifiedChip = anyVerified ? '<span class="verified-chip">✓ Verified</span>' : '';
    const featuredChip = featuredRank != null ? '<span class="featured-chip">★ Featured</span>' : '';
    const groupCls = featuredRank != null ? 'store-group featured' : 'store-group';

    return \`<div class="\${groupCls}">
      <div class="store-head" onclick="this.parentElement.classList.toggle('open')">
        <div class="icon">\${initial}</div>
        <div class="name">\${escapeHtml(host)}</div>
        \${featuredChip}
        \${verifiedChip}
        <span class="count">\${products.length}</span>
        <span class="chev">›</span>
      </div>
      <div class="store-products">\${productRows}\${overflow}</div>
    </div>\`;
  }).join("");

  const more = totalStores > shown.length;
  return { html, more, total: totalStores, shown: shown.length };
}

function renderFlat(filtered) {
  if (filtered.length === 0) return { html: '<div class="empty">No URLs match your filters.</div>', more: false };
  const shown = filtered.slice(0, visiblePage * PAGE_SIZE);
  const html = shown.map(e => {
    const cls = ["shopify","jsonld","openapi","llm"].includes(e.adapter) ? e.adapter : "other";
    const title = e.title || hostnameOf(e.url);
    const vChip = e.verified ? '<span class="verified-chip">✓ Verified</span>' : '';
    return \`<div class="flat-row">
      <span class="badge \${cls}">\${e.adapter}</span>
      <a href="/u/\${b64url(e.url)}" style="text-decoration:none;min-width:0;color:inherit;display:block">
        <div class="title">\${escapeHtml(title)} \${vChip}</div>
        <div class="url">\${escapeHtml(e.url)}</div>
      </a>
      <span class="age">\${relTime(e.ts)}</span>
      <a class="open-btn" href="/u/\${b64url(e.url)}">page →</a>
    </div>\`;
  }).join("");
  return { html, more: filtered.length > shown.length, total: filtered.length, shown: shown.length };
}

function render() {
  const filtered = applyFilters(entries);
  const r = view === "grouped" ? renderGrouped(filtered) : renderFlat(filtered);
  list.innerHTML = r.html;
  if (r.more) {
    const btn = document.createElement("button");
    btn.className = "load-more";
    btn.textContent = view === "grouped"
      ? \`Show more stores (\${r.shown} of \${r.total})\`
      : \`Show more URLs (\${r.shown} of \${r.total})\`;
    btn.addEventListener("click", () => { visiblePage++; render(); });
    list.appendChild(btn);
  }
}

(async function load() {
  try {
    const r = await fetch(ORIGIN + "/api/v1/directory");
    const d = await r.json();
    entries = (d.entries || []).sort((a, b) => b.ts - a.ts);

    document.getElementById("stat-products").textContent = entries.length.toLocaleString();
    const hosts = new Set();
    let shop = 0, jl = 0, oa = 0, llm = 0;
    entries.forEach(e => {
      if (e.adapter === "shopify") shop++;
      else if (e.adapter === "jsonld") jl++;
      else if (e.adapter === "openapi") oa++;
      else if (e.adapter === "llm") llm++;
      try { hosts.add(new URL(e.url).hostname); } catch {}
    });
    document.getElementById("stat-stores").textContent = hosts.size.toLocaleString();
    // Adapter tiles: show only non-zero categories so the row never reads as a
    // wall of zeros.
    const setStat = (id, n) => {
      const el = document.getElementById(id);
      el.textContent = n.toLocaleString();
      const tile = el.closest(".stat");
      if (tile) tile.style.display = n === 0 ? "none" : "";
    };
    setStat("stat-shopify", shop);
    setStat("stat-jsonld", jl);
    setStat("stat-openapi", oa);
    setStat("stat-llm", llm);

    render();
  } catch (e) {
    list.innerHTML = '<div class="empty">Failed to load directory.</div>';
  }
})();
</script>
</body>
</html>`;
}
