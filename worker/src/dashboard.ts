export function dashboardHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>WebMCP Anything — Dashboard</title>
<style>
  :root {
    --bg: #07070d; --card: #16161f; --bg2: #11111c; --border: #26263a;
    --text: #ececf5; --muted: #8a8aa8;
    --accent: #ff9e2c; --accent2: #ffcf7a; --green: #4ade80;
    --yellow: #fbbf24; --red: #f87171;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh; color: var(--text); background: var(--bg);
    font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
    line-height: 1.6;
    background-image:
      radial-gradient(ellipse 800px 600px at 0% 0%, rgba(255,158,44,.15), transparent),
      radial-gradient(ellipse 600px 500px at 100% 30%, rgba(255,176,0,.08), transparent);
  }
  .wrap { max-width: 900px; margin: 0 auto; padding: 50px 24px; }
  header { margin-bottom: 32px; }
  h1 {
    font-size: 2rem; margin: 0 0 6px;
    background: linear-gradient(90deg, #fff, var(--accent2));
    -webkit-background-clip: text; background-clip: text; color: transparent;
  }
  .muted { color: var(--muted); }
  .key-box {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 16px; padding: 24px; margin-bottom: 16px;
  }
  .key-row {
    display: flex; gap: 8px; align-items: center; margin-top: 10px;
  }
  .key-display {
    flex: 1;
    background: var(--bg2); border: 1px solid var(--border);
    padding: 12px 16px; border-radius: 10px;
    font-family: "SF Mono", Menlo, monospace;
    font-size: .9rem; color: var(--accent2);
    overflow-x: auto; white-space: nowrap;
  }
  .copy-btn, .input-btn {
    background: var(--bg2); color: var(--text); border: 1px solid var(--border);
    padding: 12px 16px; border-radius: 10px; font-weight: 600;
    cursor: pointer; font-family: inherit; font-size: .85rem;
    transition: all .15s;
  }
  .copy-btn:hover, .input-btn:hover { border-color: var(--accent); }
  input[type=text], input[type=password] {
    background: var(--bg2); color: var(--text); border: 1px solid var(--border);
    padding: 11px 14px; border-radius: 10px; font-family: "SF Mono", Menlo, monospace;
    font-size: .85rem; flex: 1;
  }
  input:focus { outline: none; border-color: var(--accent); }
  .pill {
    display: inline-block; padding: 3px 10px;
    border-radius: 999px; font-size: .72rem; font-weight: 700;
    letter-spacing: .06em; text-transform: uppercase;
  }
  .pill.free { background: rgba(138,138,168,.18); color: var(--muted); }
  .pill.pro { background: rgba(255,176,0,.15); color: var(--accent2); }
  .pill.reseller { background: linear-gradient(90deg, rgba(255,158,44,.3), rgba(255,77,141,.3)); color: white; }
  .usage-grid {
    display: grid; gap: 12px;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    margin-top: 14px;
  }
  .usage-card {
    background: var(--bg2); border: 1px solid var(--border);
    border-radius: 10px; padding: 14px;
  }
  .usage-card .label { color: var(--muted); font-size: .78rem; text-transform: uppercase; letter-spacing: .08em; }
  .usage-card .val { font-size: 1.4rem; font-weight: 700; margin: 4px 0; }
  .usage-card .bar { background: var(--border); height: 4px; border-radius: 999px; overflow: hidden; }
  .usage-card .fill { background: linear-gradient(90deg, var(--accent), var(--accent2)); height: 100%; border-radius: 999px; }

  .plans {
    display: grid; gap: 16px; margin-top: 32px;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }
  .plan {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 16px; padding: 22px;
    display: flex; flex-direction: column;
    transition: all .15s;
  }
  .plan:hover { border-color: var(--accent); transform: translateY(-2px); }
  .plan.featured {
    background: linear-gradient(135deg, var(--card), rgba(255,158,44,.1));
    border-color: var(--accent);
  }
  .plan h3 { margin: 0; font-size: 1.1rem; }
  .plan .price { font-size: 2rem; font-weight: 800; margin: 8px 0 4px; }
  .plan .price small { font-size: .9rem; color: var(--muted); font-weight: 500; }
  .plan ul { padding-left: 18px; color: var(--muted); margin: 12px 0; font-size: .9rem; line-height: 1.7; flex: 1; }
  .plan ul li::marker { color: var(--accent2); }
  .plan .upgrade {
    display: block; text-align: center; text-decoration: none;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    color: white; padding: 11px; border-radius: 10px; font-weight: 700;
    transition: transform .1s;
  }
  .plan .upgrade:hover { transform: scale(1.02); }
  .plan .upgrade.muted-btn {
    background: var(--bg2); color: var(--muted); border: 1px solid var(--border);
  }

  pre {
    background: var(--bg); border: 1px solid var(--border);
    border-radius: 10px; padding: 14px; overflow-x: auto;
    font-size: .82rem; color: var(--green); margin: 12px 0;
    font-family: "SF Mono", Menlo, monospace;
  }
  pre .k { color: var(--accent2); } pre .s { color: #ffb86b; }
  .note { color: var(--muted); font-size: .85rem; }
  hr { border: none; border-top: 1px solid var(--border); margin: 40px 0; }
  a { color: var(--accent2); text-decoration: none; }
  a:hover { text-decoration: underline; }
</style>
</head>
<body>
<div class="wrap">
<header>
  <h1>Dashboard</h1>
  <p class="muted">Manage your API key and usage. Save your key in the extension at chrome-extension://&lt;id&gt;/options.html.</p>
</header>

<div id="auth-area" class="key-box" style="display:none">
  <!-- populated by JS — either sign-in CTA or signed-in account view -->
</div>

<div id="connections-area" class="key-box" style="display:none">
  <strong>Connections</strong>
  <p class="muted" style="margin:6px 0 14px;font-size:.88rem">
    Connect a service once. Your agents can then call tools on it via wmcp.sh —
    no API keys in tool args. <span style="color:var(--accent2)">Experimental</span> providers are research previews.
  </p>
  <div id="connections-grid" style="display:grid;gap:8px"></div>
  <div id="apikey-modal" style="display:none;margin-top:14px;padding:16px;border:1px solid var(--accent);border-radius:10px;background:var(--bg2)">
    <strong id="apikey-title">Add API key</strong>
    <p class="muted" style="margin:6px 0;font-size:.85rem" id="apikey-hint"></p>
    <div class="key-row">
      <input type="password" id="apikey-input" placeholder="sk-…" style="font-family:'SF Mono',monospace" />
      <button class="input-btn" id="apikey-save">Save</button>
      <button class="input-btn" id="apikey-cancel">Cancel</button>
    </div>
    <div id="apikey-result" class="muted" style="margin-top:8px;font-size:.82rem"></div>
  </div>

  <div id="anthropic-modal" style="display:none;margin-top:14px;padding:16px;border:1px solid var(--accent);border-radius:10px;background:var(--bg2)">
    <strong>Connect Anthropic (Claude Code + Max)</strong>
    <p class="muted" style="margin:6px 0 12px;font-size:.85rem">
      Two-step flow because Anthropic doesn't expose per-app redirect URIs for third parties.
    </p>
    <ol style="font-size:.88rem;line-height:1.7;color:var(--muted);margin:0 0 12px;padding-left:20px">
      <li><a id="anthropic-link" href="#" target="_blank" style="color:var(--accent2)">Click here to authorize on claude.ai</a> (opens new tab). Approve.</li>
      <li>Anthropic shows a code on its callback page — copy the whole string (it may contain a <code style="color:var(--accent2)">#</code> followed by a state suffix).</li>
      <li>Paste it below.</li>
    </ol>
    <div class="key-row">
      <input type="text" id="anthropic-code" placeholder="paste code here" style="font-family:'SF Mono',monospace" />
      <button class="input-btn" id="anthropic-submit">Submit</button>
      <button class="input-btn" id="anthropic-cancel">Cancel</button>
    </div>
    <div id="anthropic-result" class="muted" style="margin-top:8px;font-size:.82rem"></div>
  </div>
</div>

<div class="key-box">
  <strong>Your API key</strong>
  <p class="muted" style="margin:6px 0 0;font-size:.88rem">Paste a key to see plan + usage. Don't have one? Use <code style="color:var(--accent2)">webmcp_dev_local_anything</code> in local dev or upgrade below.</p>
  <div class="key-row">
    <input type="password" id="key" placeholder="webmcp_live_..." />
    <button class="input-btn" id="lookup">Check</button>
  </div>
  <div id="result" style="margin-top: 18px; display: none;">
    <div class="key-row">
      <span class="pill" id="planPill">—</span>
      <span class="muted" id="userId">—</span>
    </div>
    <div class="usage-grid" id="usage"></div>
  </div>
</div>

<hr/>

<h2 style="margin-bottom:6px">Plans</h2>
<p class="muted" style="margin-top:0">Upgrade unlocks live <code>execute</code> on Shopify, higher quotas, and (soon) headless browser support for bot-protected sites.</p>

<div class="plans">
  <div class="plan">
    <h3>Free</h3>
    <div class="price">$0<small>/mo</small></div>
    <ul>
      <li>100 reads/day</li>
      <li>50 cache pushes/day</li>
      <li>No execute</li>
      <li>Best-effort cache</li>
    </ul>
    <a class="upgrade muted-btn" href="#">Current</a>
  </div>
  <div class="plan featured">
    <h3>Builder</h3>
    <div class="price">$39<small>/mo</small></div>
    <ul>
      <li>2,000 reads/day</li>
      <li>200 live executes/day</li>
      <li>1,000 cache pushes/day</li>
      <li>Shopify add_to_cart</li>
      <li>Live execute — the jump from free</li>
    </ul>
    <button class="upgrade" data-plan="builder">Upgrade</button>
  </div>
  <div class="plan">
    <h3>Pro</h3>
    <div class="price">$99<small>/mo</small></div>
    <ul>
      <li>10,000 reads/day</li>
      <li>5,000 cache pushes/day</li>
      <li>1,000 live executes/day</li>
      <li>Shopify add_to_cart</li>
      <li>Priority cache freshness</li>
    </ul>
    <button class="upgrade" data-plan="pro">Upgrade</button>
  </div>
  <div class="plan">
    <h3>Reseller</h3>
    <div class="price">$299<small>/mo</small></div>
    <ul>
      <li>100,000 reads/day</li>
      <li>50,000 executes/day</li>
      <li>Restock webhooks (coming)</li>
      <li>Headless tier (coming)</li>
      <li>Email support</li>
    </ul>
    <button class="upgrade" data-plan="reseller">Upgrade</button>
  </div>
</div>

<div id="checkout-modal" style="display:none;margin-top:20px;background:var(--card);border:1px solid var(--accent);border-radius:16px;padding:24px">
  <strong>Continue to checkout</strong>
  <p class="muted" style="margin:6px 0 14px;font-size:.88rem">Enter your email — your API key will be tied to it so you can recover it later.</p>
  <div class="key-row">
    <input type="email" id="checkout-email" placeholder="you@company.com" style="font-family:inherit" />
    <button class="input-btn" id="checkout-go">Continue →</button>
  </div>
  <div id="checkout-error" class="muted" style="margin-top:10px;color:var(--red);font-size:.85rem"></div>
</div>

<div id="success-banner" style="display:none;margin-top:20px;background:linear-gradient(135deg,rgba(74,222,128,.12),rgba(255,176,0,.08));border:1px solid var(--green);border-radius:16px;padding:24px">
  <strong style="color:var(--green)">Payment received — your key is ready</strong>
  <p class="muted" style="margin:6px 0 12px;font-size:.88rem">Save this somewhere safe. You can also recover it via email below.</p>
  <div class="key-row">
    <div class="key-display" id="success-key">—</div>
    <button class="copy-btn" id="success-copy">Copy</button>
  </div>
</div>

<div id="cancel-banner" style="display:none;margin-top:20px;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px;color:var(--muted)">
  Checkout was canceled — no charge made.
</div>

<hr/>

<h2 style="margin-bottom:6px">Lost your key?</h2>
<p class="muted" style="margin-top:0">Enter the email you paid with and we'll show your key.</p>
<div class="key-row" style="max-width:520px">
  <input type="email" id="recover-email" placeholder="you@company.com" style="font-family:inherit" />
  <button class="input-btn" id="recover-go">Recover</button>
</div>
<div id="recover-result" style="margin-top:12px"></div>

<hr/>

<h2>How to use your key</h2>
<pre><span class="k">curl</span> -H <span class="s">"Authorization: Bearer YOUR_KEY"</span> \\
  <span class="s">'${origin}/api/v1/tools?url=https://www.allbirds.com/products/mens-wool-runners'</span></pre>
<pre><span class="k">// JavaScript</span>
<span class="k">const</span> r = <span class="k">await</span> fetch(<span class="s">'${origin}/api/v1/tools/execute'</span>, {
  method: <span class="s">'POST'</span>,
  headers: { <span class="s">'authorization'</span>: <span class="s">'Bearer YOUR_KEY'</span>, <span class="s">'content-type'</span>: <span class="s">'application/json'</span> },
  body: JSON.stringify({ url: <span class="s">'...'</span>, tool: <span class="s">'get_price'</span> })
});</pre>

<p class="note">Rate limits returned in <code>x-webmcp-remaining</code> and <code>x-webmcp-limit</code> headers.</p>

</div>

<script>
const ORIGIN = ${JSON.stringify(origin)};
const inp = document.getElementById("key");
const lookupBtn = document.getElementById("lookup");
const result = document.getElementById("result");
const authArea = document.getElementById("auth-area");
const connectionsArea = document.getElementById("connections-area");
const connGrid = document.getElementById("connections-grid");
let activeApiKeyProvider = null;

// ----- auth area (GitHub sign-in OR signed-in account view) -----
(async function loadAuth() {
  try {
    const r = await fetch(ORIGIN + "/api/v1/me", { credentials: "include" });
    const d = await r.json();
    if (!d.authenticated) {
      authArea.innerHTML = \`
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
          <div>
            <strong>Sign in for an account</strong>
            <p class="muted" style="margin:4px 0 0;font-size:.88rem">Get a key, see your usage, and (soon) connect Stripe/GitHub/Google to give your agents real powers.</p>
          </div>
          <a class="input-btn" style="background:#24292f;color:#fff;border:none;display:inline-flex;align-items:center;gap:8px;padding:11px 18px;text-decoration:none" href="\${ORIGIN}/api/v1/auth/github/start?redirect_to=/dashboard">
            <svg height="18" viewBox="0 0 16 16" width="18" fill="currentColor"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"/></svg>
            Sign in with GitHub
          </a>
        </div>\`;
      authArea.style.display = "block";
      return;
    }

    // Signed in: show identity + plan + keys + actions
    const keys = (d.keys || []).filter(Boolean);
    const lastKey = keys[keys.length - 1];
    authArea.innerHTML = \`
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
        <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent2));display:grid;place-items:center;color:white;font-weight:700">\${(d.github_login || d.email || "U")[0].toUpperCase()}</div>
        <div style="flex:1">
          <strong>@\${d.github_login || d.email || "you"}</strong>
          <span class="pill \${d.plan}" style="margin-left:8px">\${d.plan}</span>
          <div class="muted" style="font-size:.82rem">\${d.user_id}</div>
        </div>
        <button class="input-btn" id="signout">Sign out</button>
      </div>
      <div style="margin-top:8px">
        <strong>Your keys</strong>
        \${keys.length ? \`
          <div class="key-row" style="margin-top:8px">
            <div class="key-display">\${lastKey}</div>
            <button class="copy-btn" id="copy-key">Copy</button>
          </div>
          <p class="muted" style="font-size:.82rem;margin:6px 0 0">\${keys.length} key\${keys.length===1?"":"s"} total. Use any of them as <code style="color:var(--accent2)">Authorization: Bearer …</code> on /api/v1/* calls.</p>
        \` : \`
          <p class="muted" style="font-size:.88rem;margin:6px 0 12px">You don't have a key yet. Issue one for the free tier:</p>
          <button class="input-btn" id="issue-key">Issue free-tier key</button>
        \`}
      </div>
    \`;
    authArea.style.display = "block";

    // Wire up signed-in actions
    document.getElementById("signout")?.addEventListener("click", async () => {
      await fetch(ORIGIN + "/api/v1/auth/logout", { method: "POST", credentials: "include" });
      window.location.reload();
    });
    document.getElementById("copy-key")?.addEventListener("click", () => {
      navigator.clipboard.writeText(lastKey);
    });
    document.getElementById("issue-key")?.addEventListener("click", async () => {
      const r = await fetch(ORIGIN + "/api/v1/me/keys", { method: "POST", credentials: "include" });
      const d = await r.json();
      if (d.key) { inp.value = d.key; loadAuth(); }
    });

    // Pre-fill the manual lookup box if we have a key
    if (lastKey && !inp.value) inp.value = lastKey;

    // Connections area only shown when signed in
    await loadConnections();
  } catch {}
})();

// ----- connections (Phase B) -----
async function loadConnections() {
  try {
    const [provRes, connRes, mgdRes] = await Promise.all([
      fetch(ORIGIN + "/api/v1/providers"),
      fetch(ORIGIN + "/api/v1/me/connections", { credentials: "include" }),
      fetch(ORIGIN + "/api/v1/connections", { credentials: "include" }),
    ]);
    const provs = (await provRes.json()).providers || [];
    const conn = await connRes.json();
    if (conn.error) return; // not authenticated, skip
    const active = new Map((conn.connections || []).map(c => [c.provider_id, c]));
    const mgd = await mgdRes.json().catch(() => ({}));
    const managed = new Set((mgd.connections || []).map(c => c.provider));
    const catLabel = {
      auth: "Identity", comms: "Comms", billing: "Billing",
      dev: "Dev tools", ai: "AI providers", productivity: "Productivity",
    };
    connGrid.innerHTML = provs.map(p => {
      const a = active.get(p.id);
      const statusPill = p.status === "experimental"
        ? '<span style="color:var(--accent2);font-size:.7rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:2px 6px;border:1px solid var(--accent2);border-radius:999px;margin-left:6px">EXPERIMENTAL</span>'
        : '';
      const btn = a
        ? \`<button class="input-btn" data-disconnect="\${p.id}" style="background:var(--bg2);color:var(--red);border-color:var(--border)">Disconnect</button>\`
        : p.authType === "api_key"
          ? \`<button class="input-btn" data-apikey="\${p.id}">Add API key</button>\`
          : \`<button class="input-btn" data-connect="\${p.id}" style="background:linear-gradient(135deg,var(--accent),var(--accent2));color:white;border:none">Connect</button>\`;
      return \`
        <div style="display:flex;align-items:center;gap:14px;padding:12px;background:var(--bg2);border:1px solid var(--border);border-radius:10px">
          <div style="width:36px;height:36px;border-radius:8px;background:var(--bg);display:grid;place-items:center;font-weight:800;color:var(--accent2)">\${p.name[0]}</div>
          <div style="flex:1;min-width:0">
            <div><strong>\${p.name}</strong>\${statusPill}
              <span style="color:var(--dim);font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;margin-left:8px">\${catLabel[p.category]||p.category}</span>
            </div>
            <div class="muted" style="font-size:.82rem;margin-top:2px">\${p.description}</div>
            \${a ? \`<div style="color:var(--green);font-size:.76rem;margin-top:4px">✓ Connected\${a.account_name?\` as <strong>\${a.account_name}</strong>\`:""}</div>\`:""}
            \${p.mcpProxy ? (managed.has(p.id)
              ? \`<div style="color:var(--green);font-size:.76rem;margin-top:4px">✓ Managed connection active</div>\`
              : \`<button class="input-btn" data-subscribe="\${p.id}" style="margin-top:6px;background:linear-gradient(135deg,#ff9120,#f25e00);color:#2a1500;border:none;font-weight:700;cursor:pointer">Subscribe — managed proxy</button>\`) : ""}
          </div>
          \${btn}
        </div>\`;
    }).join("");
    connectionsArea.style.display = "block";

    // Wire connect/disconnect/api-key
    connGrid.querySelectorAll("[data-connect]").forEach(b => {
      b.addEventListener("click", async () => {
        const pid = b.dataset.connect;
        if (pid === "anthropic") {
          // Send user to the dedicated full-page connect flow instead of a modal —
          // the OOB paste step is too easy to miss in a tab-switching dance.
          window.location.href = ORIGIN + "/connect/anthropic";
          return;
        }
        window.location.href = ORIGIN + "/api/v1/providers/" + pid + "/start";
      });
    });
    connGrid.querySelectorAll("[data-disconnect]").forEach(b => {
      b.addEventListener("click", async () => {
        if (!confirm("Disconnect " + b.dataset.disconnect + "?")) return;
        await fetch(ORIGIN + "/api/v1/providers/" + b.dataset.disconnect + "/disconnect", { method: "POST", credentials: "include" });
        loadConnections();
      });
    });
    connGrid.querySelectorAll("[data-apikey]").forEach(b => {
      b.addEventListener("click", async () => {
        activeApiKeyProvider = b.dataset.apikey;
        const meta = provs.find(p => p.id === activeApiKeyProvider);
        document.getElementById("apikey-title").textContent = "Add " + meta.name + " API key";
        document.getElementById("apikey-hint").innerHTML = "Get it from <a href='" + (meta.apiKeyDocsUrl||"#") + "' target='_blank' style='color:var(--accent2)'>" + (meta.apiKeyDocsUrl||"the provider") + "</a>. Stored encrypted at rest.";
        document.getElementById("apikey-input").value = "";
        document.getElementById("apikey-result").textContent = "";
        document.getElementById("apikey-modal").style.display = "block";
      });
    });
    // Managed-connection subscribe (per-connection OAuth-proxy billing)
    connGrid.querySelectorAll("[data-subscribe]").forEach(b => {
      b.addEventListener("click", async () => {
        const pid = b.dataset.subscribe;
        b.disabled = true; b.textContent = "…";
        try {
          const r = await fetch(ORIGIN + "/api/v1/connections/checkout", {
            method: "POST", headers: { "content-type": "application/json" },
            credentials: "include", body: JSON.stringify({ provider: pid }),
          });
          const d = await r.json().catch(() => ({}));
          if (d.url) { window.location.href = d.url; return; }
          if (r.status === 401) alert("Sign in first to subscribe to a managed connection.");
          else if (r.status === 503) alert("Managed-connection billing isn't switched on yet.");
          else alert("Could not start checkout: " + (d.error || r.status));
        } catch (e) { alert("Network error starting checkout."); }
        b.disabled = false; b.textContent = "Subscribe — managed proxy";
      });
    });
  } catch {}
}

// API-key modal handlers
document.getElementById("apikey-cancel")?.addEventListener("click", () => {
  document.getElementById("apikey-modal").style.display = "none";
});

document.getElementById("anthropic-cancel")?.addEventListener("click", () => {
  document.getElementById("anthropic-modal").style.display = "none";
});
document.getElementById("anthropic-submit")?.addEventListener("click", async () => {
  const code = document.getElementById("anthropic-code").value.trim();
  if (!code) return;
  const resultEl = document.getElementById("anthropic-result");
  resultEl.textContent = "Exchanging…";
  const r = await fetch(ORIGIN + "/api/v1/providers/anthropic/exchange", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ code, state: window.anthropicState }),
  });
  const d = await r.json();
  if (d.ok) {
    document.getElementById("anthropic-modal").style.display = "none";
    loadConnections();
  } else {
    resultEl.textContent = "Error: " + (d.error || "exchange failed") + (d.detail ? " — " + JSON.stringify(d.detail).slice(0,200) : "");
  }
});
document.getElementById("apikey-save")?.addEventListener("click", async () => {
  if (!activeApiKeyProvider) return;
  const key = document.getElementById("apikey-input").value.trim();
  if (!key) return;
  const resultEl = document.getElementById("apikey-result");
  resultEl.textContent = "Saving…";
  const r = await fetch(ORIGIN + "/api/v1/providers/" + activeApiKeyProvider + "/api-key", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ api_key: key }),
  });
  const d = await r.json();
  if (d.ok) {
    document.getElementById("apikey-modal").style.display = "none";
    loadConnections();
  } else {
    resultEl.textContent = "Error: " + (d.error || "failed");
  }
});

lookupBtn.addEventListener("click", check);
inp.addEventListener("keydown", e => { if (e.key === "Enter") check(); });

// --- Checkout flow ---
const modal = document.getElementById("checkout-modal");
const checkoutEmail = document.getElementById("checkout-email");
const checkoutGo = document.getElementById("checkout-go");
const checkoutError = document.getElementById("checkout-error");
let selectedPlan = "pro";

document.querySelectorAll("button.upgrade[data-plan]").forEach((b) => {
  b.addEventListener("click", () => {
    selectedPlan = b.dataset.plan;
    modal.style.display = "block";
    checkoutEmail.focus();
    modal.scrollIntoView({ behavior: "smooth", block: "center" });
  });
});

checkoutGo.addEventListener("click", startCheckout);
checkoutEmail.addEventListener("keydown", (e) => { if (e.key === "Enter") startCheckout(); });

async function startCheckout() {
  const email = checkoutEmail.value.trim();
  checkoutError.textContent = "";
  if (!email || !email.includes("@")) {
    checkoutError.textContent = "Enter a valid email.";
    return;
  }
  checkoutGo.disabled = true;
  checkoutGo.textContent = "Loading…";
  try {
    const r = await fetch(ORIGIN + "/api/v1/stripe/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, plan: selectedPlan, origin: ORIGIN }),
    });
    const d = await r.json();
    if (!r.ok || !d.url) {
      checkoutError.textContent = d.error || "Checkout failed.";
      checkoutGo.disabled = false;
      checkoutGo.textContent = "Continue →";
      return;
    }
    window.location.href = d.url;
  } catch (e) {
    checkoutError.textContent = String(e);
    checkoutGo.disabled = false;
    checkoutGo.textContent = "Continue →";
  }
}

// --- Post-checkout / cancel banners ---
(async function handleReturn() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("canceled") === "1") {
    document.getElementById("cancel-banner").style.display = "block";
    return;
  }
  const sid = params.get("session_id");
  if (!sid) return;
  const banner = document.getElementById("success-banner");
  const keyEl = document.getElementById("success-key");
  banner.style.display = "block";
  keyEl.textContent = "Loading…";
  // Poll briefly to absorb webhook race.
  for (let i = 0; i < 8; i++) {
    const r = await fetch(ORIGIN + "/api/v1/keys/by-checkout?session_id=" + encodeURIComponent(sid));
    const d = await r.json();
    if (d.key) {
      keyEl.textContent = d.key;
      // Auto-fill the key-check box too.
      inp.value = d.key;
      return;
    }
    if (d.pending) {
      keyEl.textContent = "Waiting for payment to settle…";
    } else if (d.error) {
      keyEl.textContent = "Error: " + d.error;
      return;
    }
    await new Promise((res) => setTimeout(res, 1500));
  }
  keyEl.textContent = "Took too long — try the recovery form below with your email.";
})();

document.getElementById("success-copy")?.addEventListener("click", () => {
  const t = document.getElementById("success-key").textContent;
  navigator.clipboard.writeText(t);
});

// --- Recovery ---
document.getElementById("recover-go").addEventListener("click", recover);
document.getElementById("recover-email").addEventListener("keydown", (e) => { if (e.key === "Enter") recover(); });

async function recover() {
  const email = document.getElementById("recover-email").value.trim();
  const out = document.getElementById("recover-result");
  out.innerHTML = "";
  if (!email) return;
  try {
    const r = await fetch(ORIGIN + "/api/v1/keys/recover", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const d = await r.json();
    if (!r.ok) {
      out.innerHTML = '<span class="muted" style="color:var(--red)">' + (d.error || "Not found") + '</span>';
      return;
    }
    out.innerHTML = '<div class="key-display" style="max-width:520px">' + (d.keys?.[d.keys.length - 1] || "—") + '</div>';
  } catch (e) {
    out.innerHTML = '<span style="color:var(--red)">' + String(e) + '</span>';
  }
}

async function check() {
  const key = inp.value.trim();
  result.style.display = "none";
  try {
    const r = await fetch(ORIGIN + "/api/v1/keys/me", {
      headers: key ? { "authorization": "Bearer " + key } : {}
    });
    const d = await r.json();
    document.getElementById("planPill").textContent = d.plan;
    document.getElementById("planPill").className = "pill " + d.plan;
    document.getElementById("userId").textContent =
      d.anonymous ? "anonymous (rate-limited by IP)" : d.user_id;

    // Fetch usage indirectly: do a tools call so the response headers tell us
    const t = await fetch(ORIGIN + "/api/v1/tools?url=https://www.allbirds.com/products/mens-wool-runners", {
      headers: key ? { "authorization": "Bearer " + key } : {}
    });
    const limit = parseInt(t.headers.get("x-webmcp-limit") || "0", 10);
    const remaining = parseInt(t.headers.get("x-webmcp-remaining") || "0", 10);
    const used = limit - remaining;
    const pct = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;

    document.getElementById("usage").innerHTML = \`
      <div class="usage-card">
        <div class="label">Reads today</div>
        <div class="val">\${used} / \${limit}</div>
        <div class="bar"><div class="fill" style="width:\${pct}%"></div></div>
      </div>
      <div class="usage-card">
        <div class="label">Plan</div>
        <div class="val" style="font-size:1.1rem;text-transform:capitalize">\${d.plan}</div>
      </div>
    \`;
    result.style.display = "block";
  } catch (e) {
    result.innerHTML = '<span style="color:var(--red)">' + String(e) + '</span>';
    result.style.display = "block";
  }
}
</script>
</body>
</html>`;
}
