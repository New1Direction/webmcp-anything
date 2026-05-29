// /dashboard/submissions — admin inbox for directory submissions.
//
// Self-gated: the page renders, but every action requires an admin token
// stored in localStorage("wmcp_admin_token"). Lost-token recovery: paste a
// new one in the input at the top.
//
// Actions:
//   - Verify  -> POST /api/v1/admin/directory/verify   { slug }
//   - Feature -> POST /api/v1/admin/directory/feature  { slug, rank }
//   - Unverify / unfeature counterparts
//
// The page also shows whether managed_interest was ticked (= a /managed lead).

export function submissionsInboxHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Directory submissions — admin inbox | wmcp.sh</title>
<meta name="robots" content="noindex,nofollow" />
<style>
  :root { --bg:#07070d;--card:#16161f;--bg2:#11111c;--border:#26263a;--text:#ececf5;--muted:#8a8aa8;--dim:#6a6a88;--accent:#ff9e2c;--accent2:#ffcf7a;--green:#4ade80;--red:#f87171;--gold:#fbbf24; }
  * { box-sizing: border-box; }
  body { margin:0;color:var(--text);background:var(--bg);font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif;line-height:1.5; }
  nav { display:flex;justify-content:space-between;padding:18px 24px;font-size:.9rem }
  nav .brand { color: var(--text); text-decoration: none; font-weight: 800; }
  nav .brand span { color: var(--accent2); }
  nav .links a { color: var(--muted); margin-left: 18px; text-decoration: none; font-size: .85rem; }
  .wrap { max-width: 1100px; margin: 0 auto; padding: 18px 24px 60px; }
  h1 { font-size: 1.6rem; margin: 0 0 4px; font-weight: 800; }
  .muted { color: var(--muted); }
  .toolbar { display:flex;gap:10px;flex-wrap:wrap;margin:18px 0; align-items: center; }
  .toolbar input { background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 7px 12px; color: var(--text); font-family: inherit; font-size: .85rem; flex: 1; min-width: 240px; }
  .toolbar button { background: var(--bg2); border: 1px solid var(--border); color: var(--text); border-radius: 8px; padding: 7px 14px; font-family: inherit; cursor: pointer; font-size: .85rem; }
  .toolbar button:hover { border-color: var(--accent); }
  .stat { display:inline-block; background: var(--card); border: 1px solid var(--border); padding: 5px 12px; border-radius: 999px; font-size: .8rem; margin-right: 8px; }
  .stat strong { color: var(--accent2); }

  .row { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 16px 18px; margin-bottom: 12px; }
  .row.verified { border-color: rgba(255,158,44,.5); background: linear-gradient(135deg, var(--card), rgba(255,158,44,.05)); }
  .row.managed { box-shadow: 0 0 0 1px rgba(251,191,36,.3); }
  .row-h { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .pill { font-size: .65rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; padding: 2px 8px; border-radius: 999px; }
  .pill.verified { background: rgba(255,158,44,.18); color: var(--accent2); border:1px solid rgba(255,158,44,.45); }
  .pill.featured { background: rgba(251,191,36,.15); color: var(--gold); border:1px solid rgba(251,191,36,.35); }
  .pill.managed { background: rgba(251,191,36,.15); color: var(--gold); border:1px solid rgba(251,191,36,.35); }
  .pill.category { background: rgba(255,176,0,.12); color: var(--accent2); }
  .pill.pending { background: rgba(138,138,168,.15); color: var(--muted); }
  .row .name { font-weight: 700; color: var(--text); }
  .row .email { color: var(--muted); font-size: .85rem; }
  .row .site { font-family: "SF Mono", Menlo, monospace; font-size: .82rem; color: var(--accent2); word-break: break-all; }
  .row .site a { color: inherit; text-decoration: none; }
  .row .blurb { color: var(--muted); font-size: .88rem; margin-top: 6px; font-style: italic; }
  .row .meta { color: var(--dim); font-size: .76rem; margin-top: 6px; }
  .row .actions { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
  .btn { background: var(--bg2); border: 1px solid var(--border); color: var(--text); border-radius: 7px; padding: 6px 12px; font-family: inherit; cursor: pointer; font-size: .8rem; text-decoration: none; }
  .btn:hover { border-color: var(--accent); }
  .btn.primary { background: linear-gradient(135deg, var(--accent), var(--accent2)); color: #0c0c14; font-weight: 700; border: none; }
  .btn.danger { color: var(--red); border-color: rgba(248,113,113,.3); }
  .empty { text-align: center; padding: 60px 20px; color: var(--muted); background: var(--card); border: 1px dashed var(--border); border-radius: 14px; }
  .err { background: rgba(248,113,113,.1); border: 1px solid var(--red); color: var(--red); padding: 12px 14px; border-radius: 9px; margin-bottom: 14px; font-size: .88rem; display: none; }
  .err.show { display: block; }
</style>
</head>
<body>

<nav>
  <a class="brand" href="/">wmcp<span>.sh</span></a>
  <div class="links">
    <a href="/directory">Directory</a>
    <a href="/managed">/managed</a>
    <a href="/dashboard">Dashboard</a>
  </div>
</nav>

<div class="wrap">
  <h1>Directory submissions</h1>
  <p class="muted">Newest first. Verify or feature inline — actions hit <code>/api/v1/admin/directory/*</code>.</p>

  <div class="err" id="err"></div>

  <div class="toolbar">
    <input id="token" type="password" placeholder="x-admin-token (saved in localStorage)" />
    <button onclick="saveToken()">Save token</button>
    <button onclick="load()">Refresh</button>
    <span class="stat"><strong id="stat-total">·</strong> total</span>
    <span class="stat"><strong id="stat-verified">·</strong> verified</span>
    <span class="stat"><strong id="stat-managed">·</strong> wanting /managed</span>
  </div>

  <div id="list"><div class="empty">Loading…</div></div>
</div>

<script>
const ORIGIN = ${JSON.stringify(origin)};
const TOKEN_KEY = "wmcp_admin_token";

const tokenInput = document.getElementById("token");
tokenInput.value = localStorage.getItem(TOKEN_KEY) || "";

function saveToken() {
  localStorage.setItem(TOKEN_KEY, tokenInput.value);
  showErr("");
  load();
}
function token() { return tokenInput.value || localStorage.getItem(TOKEN_KEY) || ""; }
function showErr(m) {
  const el = document.getElementById("err");
  if (!m) { el.classList.remove("show"); el.textContent = ""; return; }
  el.textContent = m; el.classList.add("show");
}
function fmt(ts) {
  return new Date(ts).toISOString().replace("T", " ").slice(0, 16);
}
function escapeHtml(s) {
  return String(s || "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);
}

async function load() {
  if (!token()) { showErr("paste an admin token (env ADMIN_TOKEN) and click 'save token'"); document.getElementById("list").innerHTML = ""; return; }
  showErr("");
  try {
    const r = await fetch(ORIGIN + "/api/v1/admin/directory/submissions?limit=200", {
      headers: { "x-admin-token": token() }
    });
    if (!r.ok) {
      const txt = await r.text();
      showErr("load failed: " + r.status + " " + txt);
      document.getElementById("list").innerHTML = "";
      return;
    }
    const d = await r.json();
    render(d.entries || []);
  } catch (e) { showErr("network: " + e.message); }
}

function render(entries) {
  const list = document.getElementById("list");
  document.getElementById("stat-total").textContent = entries.length;
  document.getElementById("stat-verified").textContent = entries.filter(e => e.verified).length;
  document.getElementById("stat-managed").textContent = entries.filter(e => e.managed_interest).length;

  if (entries.length === 0) { list.innerHTML = '<div class="empty">No submissions yet.</div>'; return; }

  list.innerHTML = entries.map(e => {
    const classes = ["row"];
    if (e.verified) classes.push("verified");
    if (e.managed_interest) classes.push("managed");
    const pills = [];
    if (e.verified) pills.push('<span class="pill verified">✓ verified</span>');
    if (e.featured_rank != null) pills.push('<span class="pill featured">★ feat #' + e.featured_rank + '</span>');
    if (e.managed_interest) pills.push('<span class="pill managed">$ /managed</span>');
    if (e.category) pills.push('<span class="pill category">' + escapeHtml(e.category) + '</span>');
    if (!e.verified) pills.push('<span class="pill pending">pending</span>');

    return \`<div class="\${classes.join(" ")}" data-slug="\${escapeHtml(e.slug)}">
      <div class="row-h">
        <span class="name">\${escapeHtml(e.name)}</span>
        <span class="email">\${escapeHtml(e.email)}</span>
        \${pills.join("")}
      </div>
      <div class="site"><a href="\${escapeHtml(e.site_url)}" target="_blank" rel="noopener">\${escapeHtml(e.site_url)}</a></div>
      \${e.blurb ? '<div class="blurb">' + escapeHtml(e.blurb) + '</div>' : ''}
      <div class="meta">slug: <code>\${escapeHtml(e.slug)}</code> · received \${fmt(e.received_at)} · ip \${escapeHtml(e.ip)} \${e.referer ? '· ref ' + escapeHtml(e.referer) : ''}</div>
      <div class="actions">
        \${e.verified
          ? '<button class="btn danger" onclick="act(\\'unverify\\', \\'' + escapeHtml(e.slug) + '\\')">Unverify</button>'
          : '<button class="btn primary" onclick="act(\\'verify\\', \\'' + escapeHtml(e.slug) + '\\')">Verify</button>'
        }
        \${e.featured_rank != null
          ? '<button class="btn danger" onclick="act(\\'unfeature\\', \\'' + escapeHtml(e.slug) + '\\')">Unfeature</button>'
          : '<button class="btn" onclick="act(\\'feature\\', \\'' + escapeHtml(e.slug) + '\\')">Feature</button>'
        }
        <a class="btn" href="/u/\${encodeURIComponent(b64url(e.site_url))}" target="_blank">View /u/</a>
        <a class="btn" href="/verify/\${encodeURIComponent(e.slug)}" target="_blank">Embed page</a>
        <a class="btn" href="\${escapeHtml(e.site_url)}" target="_blank" rel="noopener">Visit site →</a>
      </div>
    </div>\`;
  }).join("");
}

function b64url(s) { try { return btoa(s).replace(/\\+/g, "-").replace(/\\//g, "_").replace(/=+$/, ""); } catch { return ""; } }

async function act(kind, slug) {
  const body = { slug };
  if (kind === "feature") {
    const r = prompt("Featured rank (lower = higher placement, 0-9999):", "10");
    if (r == null) return;
    body.rank = parseInt(r, 10);
    if (isNaN(body.rank)) { alert("rank must be a number"); return; }
  }
  try {
    const r = await fetch(ORIGIN + "/api/v1/admin/directory/" + kind, {
      method: "POST",
      headers: { "x-admin-token": token(), "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) { showErr(kind + " failed: " + r.status + " " + (await r.text())); return; }
    await load();
  } catch (e) { showErr("network: " + e.message); }
}

load();
</script>
</body>
</html>`;
}
