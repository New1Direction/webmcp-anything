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

  /* Governance panel — the control plane made visible. */
  .gov-head { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
  .pill.live { background: rgba(74,222,128,.15); color: var(--green); }
  .pill.killed { background: rgba(248,113,113,.18); color: var(--red); }
  .gov-actions { display:flex; gap:10px; flex-wrap:wrap; margin-top:14px; align-items:flex-end; }
  .gov-field { display:flex; flex-direction:column; gap:6px; }
  .gov-field label { color: var(--muted); font-size:.74rem; text-transform:uppercase; letter-spacing:.08em; }
  .gov-field input { width:140px; }
  .kill-btn {
    border:1px solid var(--red); color:var(--red); background:rgba(248,113,113,.08);
    padding:11px 18px; border-radius:10px; font-weight:700; cursor:pointer; font-family:inherit; font-size:.85rem;
    transition: all .15s;
  }
  .kill-btn:hover { background: var(--red); color:#1a0000; }
  .kill-btn.revive { border-color: var(--green); color: var(--green); background: rgba(74,222,128,.08); }
  .kill-btn.revive:hover { background: var(--green); color:#002200; }
  .audit { width:100%; border-collapse:collapse; margin-top:14px; font-size:.82rem; }
  .audit th { text-align:left; color:var(--muted); font-weight:600; font-size:.72rem; text-transform:uppercase; letter-spacing:.06em; padding:6px 10px; border-bottom:1px solid var(--border); }
  .audit td { padding:6px 10px; border-bottom:1px solid var(--bg2); font-family:"SF Mono",Menlo,monospace; }
  .audit .ok { color: var(--green); } .audit .bad { color: var(--red); }
  .audit-empty { color: var(--muted); font-size:.85rem; padding:14px 0; }

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
  .plan.current { border-color: var(--green); }
  .plan .upgrade:disabled { opacity: .6; cursor: default; transform: none; }
  .notice { margin-top: 14px; border-radius: 12px; padding: 14px 16px; font-size: .9rem; }
  .notice.warn { background: rgba(248,113,113,.08); border: 1px solid var(--red); color: #fecaca; }
  .notice.info { background: rgba(255,158,44,.08); border: 1px solid rgba(255,158,44,.5); color: var(--accent2); }
  .notice.ok { background: rgba(74,222,128,.08); border: 1px solid var(--green); color: #bbf7d0; }
  #upgrade-banner { display: none; margin: 0 0 18px; background: linear-gradient(135deg,rgba(255,158,44,.14),rgba(255,207,122,.06)); border: 1px solid var(--accent); border-radius: 16px; padding: 18px 20px; }
  #upgrade-banner .row { display: flex; gap: 14px; align-items: center; justify-content: space-between; flex-wrap: wrap; }
  #billing-msg { min-height: 1em; }
  a { color: var(--accent2); text-decoration: none; }
  a:hover { text-decoration: underline; }
</style>
</head>
<body>
<div class="wrap">
<header>
  <h1>Get your key &amp; go live</h1>
  <p class="muted">Pick a plan to unlock live <code>execute</code>, or paste an existing key to see plan + usage. Already paid? Recover your key by email below.</p>
  <a class="input-btn" style="display:inline-block" href="/start">Resume URL setup →</a>
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

<div id="govern-area" class="key-box" style="display:none">
  <div class="gov-head">
    <strong>Agent controls</strong>
    <span class="pill" id="govern-status">—</span>
  </div>
  <p class="muted" style="margin:6px 0 0;font-size:.88rem">
    One kill switch and one audit trail across <strong>every</strong> provider you've connected — the thing the raw
    first-party servers can't do. Flip the switch and this agent's tool access stops everywhere, instantly.
  </p>
  <div class="usage-grid" id="govern-usage" style="margin-top:16px"></div>
  <div class="gov-actions">
    <button class="kill-btn" id="kill-toggle">Kill all tool access</button>
    <div class="gov-field">
      <label for="cap-input">Daily call cap</label>
      <input type="number" id="cap-input" min="0" placeholder="none" />
    </div>
    <button class="input-btn" id="cap-save">Set cap</button>
    <span class="muted" id="govern-msg" style="font-size:.82rem"></span>
  </div>
  <div style="margin-top:18px">
    <strong style="font-size:.9rem">Recent tool calls</strong>
    <div id="audit-wrap"></div>
  </div>
</div>

<hr/>

<h2 id="plans" style="margin-bottom:6px">Plans</h2>
<p class="muted" style="margin-top:0">Upgrade unlocks live <code>execute</code> on Shopify, higher quotas, and (soon) headless browser support for bot-protected sites. Cancel or switch anytime — switches are prorated.</p>

<div id="upgrade-banner" role="status">
  <div class="row">
    <div>
      <strong id="upgrade-title">Unlock this call</strong>
      <div class="muted" id="upgrade-detail" style="font-size:.9rem;margin-top:2px"></div>
    </div>
    <button class="input-btn" id="upgrade-go" style="background:linear-gradient(135deg,var(--accent),var(--accent2));color:#1a1a1a;border:none;font-weight:700">Upgrade</button>
  </div>
</div>

<div class="plans">
  <div class="plan" data-plan-card="free">
    <h3>Free</h3>
    <div class="price">$0<small>/mo</small></div>
    <ul>
      <li>100 reads/day</li>
      <li>50 cache pushes/day</li>
      <li>No execute</li>
      <li>Best-effort cache</li>
    </ul>
    <a class="upgrade muted-btn" id="free-plan-btn" href="#">Current</a>
  </div>
  <div class="plan featured" data-plan-card="builder">
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
  <div class="plan" data-plan-card="pro">
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
  <div class="plan" data-plan-card="reseller">
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
  <p class="muted" style="margin:6px 0 14px;font-size:.88rem">Enter your email — your API key will be tied to it so you can recover it later. <a href="${origin}/api/v1/auth/github/start?redirect_to=/dashboard%23plans">Sign in with GitHub</a> instead to put the plan on your account.</p>
  <div class="key-row">
    <input type="email" id="checkout-email" placeholder="you@company.com" style="font-family:inherit" />
    <button class="input-btn" id="checkout-go">Continue →</button>
  </div>
  <div id="checkout-error" class="muted" style="margin-top:10px;color:var(--red);font-size:.85rem"></div>
</div>

<div id="success-banner" style="display:none;margin-top:20px;background:linear-gradient(135deg,rgba(74,222,128,.12),rgba(255,176,0,.08));border:1px solid var(--green);border-radius:16px;padding:24px">
  <strong style="color:var(--green)" id="success-title">Payment received — your key is ready</strong>
  <p class="muted" style="margin:6px 0 12px;font-size:.88rem" id="success-note">Save this somewhere safe. Existing keys on this account were upgraded too — no need to swap keys in your agents.</p>
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
<p class="muted" style="margin-top:0">Enter the email you paid with and we'll email your key to that inbox. Or sign in with GitHub using the same verified email.</p>
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
      await loadBilling();
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
      <div id="billing" style="margin:6px 0 16px;padding:14px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border)"></div>
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
    await loadBilling();

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

    // Pre-fill the manual lookup box if we have a key, and show the governance
    // panel straight away (the control plane is the headline, not a hidden API).
    if (lastKey && !inp.value) inp.value = lastKey;
    if (inp.value) loadGovernance(inp.value);

    // Connections area only shown when signed in
    await loadConnections();

    // Deeplink from the public /connect hub: ?connect=<provider> auto-starts that
    // provider's connect flow (or scrolls to the grid if it needs a modal/sub).
    const wantConnect = new URLSearchParams(window.location.search).get("connect");
    if (wantConnect) {
      const el = connGrid.querySelector('[data-connect="' + wantConnect + '"]')
              || connGrid.querySelector('[data-subscribe="' + wantConnect + '"]')
              || connGrid.querySelector('[data-apikey="' + wantConnect + '"]');
      if (el) {
        connectionsArea.scrollIntoView({ behavior: "smooth", block: "start" });
        el.style.outline = "2px solid var(--accent)";
        el.style.outlineOffset = "3px";
      }
    }
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

// --- Checkout / upgrade flow ---
const modal = document.getElementById("checkout-modal");
const checkoutEmail = document.getElementById("checkout-email");
const checkoutGo = document.getElementById("checkout-go");
const checkoutError = document.getElementById("checkout-error");
const PARAMS = new URLSearchParams(window.location.search);
const SOURCE = (PARAMS.get("source") || PARAMS.get("utm_source") || "dashboard").replace(/[^a-z0-9_.:-]/gi, "").slice(0, 40) || "dashboard";
const PLAN_LABEL = { free: "Free", builder: "Builder", pro: "Pro", reseller: "Reseller" };
const PLAN_PRICE = { builder: "$39/mo", pro: "$99/mo", reseller: "$299/mo" };
const PLAN_RANK = { free: 0, builder: 1, pro: 2, reseller: 3 };
let selectedPlan = "builder";
let BILLING = null;

document.querySelectorAll("button.upgrade[data-plan]").forEach((b) => {
  b.addEventListener("click", () => startUpgrade(b.dataset.plan, b));
});

checkoutGo.addEventListener("click", () => startCheckout(checkoutEmail.value.trim()));
checkoutEmail.addEventListener("keydown", (e) => { if (e.key === "Enter") startCheckout(checkoutEmail.value.trim()); });

// One entry point for every upgrade button: in-place switch for subscribers,
// one-click checkout when signed in, email checkout when anonymous.
async function startUpgrade(plan, btn) {
  selectedPlan = plan;
  checkoutError.textContent = "";
  if (BILLING && BILLING.can_change_plan) return changePlan(plan, btn);
  if (BILLING && BILLING.signed_in) return startCheckout("", btn);
  modal.style.display = "block";
  checkoutEmail.focus();
  modal.scrollIntoView({ behavior: "smooth", block: "center" });
}

async function startCheckout(email, btn) {
  const signedIn = !!(BILLING && BILLING.signed_in);
  if (!signedIn && (!email || !email.includes("@"))) {
    checkoutError.textContent = "Enter a valid email.";
    return;
  }
  const button = btn || checkoutGo;
  const label = button.textContent;
  button.disabled = true;
  button.textContent = "Loading…";
  try {
    const r = await fetch(ORIGIN + "/api/v1/stripe/checkout", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: email || undefined, plan: selectedPlan, source: SOURCE }),
    });
    const d = await r.json().catch(() => ({}));
    if (r.ok && d.url) { window.location.href = d.url; return; }
    showCheckoutError(r.status, d, signedIn);
  } catch (e) {
    showCheckoutError(0, {}, signedIn);
  }
  button.disabled = false;
  button.textContent = label;
}

function showCheckoutError(status, d, signedIn) {
  const msg =
    d.error === "already_subscribed" ? "You already have a plan — switch it from Billing above." :
    status === 503 ? "Checkout isn't switched on yet — try again shortly." :
    d.error === "invalid_email" ? "Enter a valid email." :
    status === 0 ? "Network error — try again." :
    "Checkout failed (" + (d.error || status) + ").";
  if (signedIn) setBillingMsg(msg, "warn"); else checkoutError.textContent = msg;
  if (d.error === "already_subscribed") document.getElementById("billing")?.scrollIntoView({ behavior: "smooth", block: "center" });
}

async function changePlan(plan, btn) {
  const cur = BILLING.plan;
  const verb = PLAN_RANK[plan] > PLAN_RANK[cur] ? "Upgrade" : "Downgrade";
  const note = verb === "Upgrade"
    ? "The prorated difference is charged now to your card on file."
    : "The unused time is credited to your next invoice.";
  if (!confirm(verb + " from " + PLAN_LABEL[cur] + " to " + PLAN_LABEL[plan] + " (" + PLAN_PRICE[plan] + ")? " + note)) return;
  if (btn) { btn.disabled = true; btn.textContent = "Switching…"; }
  try {
    const r = await fetch(ORIGIN + "/api/v1/billing/change-plan", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const d = await r.json().catch(() => ({}));
    if (r.ok) {
      setBillingMsg("You're on " + PLAN_LABEL[d.plan] + " now. Your existing keys picked up the new limits.", "ok");
      await loadBilling();
    } else {
      setBillingMsg(d.hint || ("Could not switch plan (" + (d.error || r.status) + ")."), "warn");
    }
  } catch (e) {
    setBillingMsg("Network error — try again.", "warn");
  }
  renderPlanCards();
}

async function openPortal(btn) {
  btn.disabled = true;
  btn.textContent = "Opening…";
  try {
    const r = await fetch(ORIGIN + "/api/v1/billing/portal", { method: "POST", credentials: "include" });
    const d = await r.json().catch(() => ({}));
    if (r.ok && d.url) { window.location.href = d.url; return; }
    setBillingMsg(d.hint || ("Billing portal unavailable (" + (d.error || r.status) + ")."), "warn");
  } catch (e) {
    setBillingMsg("Network error — try again.", "warn");
  }
  btn.disabled = false;
  btn.textContent = "Manage billing";
}

function setBillingMsg(text, tone) {
  const el = document.getElementById("billing-msg");
  if (!el) { alert(text); return; }
  el.className = "notice " + tone;
  el.textContent = text;
  el.style.display = "block";
}

async function loadBilling() {
  try {
    const r = await fetch(ORIGIN + "/api/v1/billing", { credentials: "include" });
    BILLING = await r.json();
  } catch (e) {
    BILLING = null;
  }
  renderBillingPanel();
  renderPlanCards();
  return BILLING;
}

function fmtDate(unix) {
  try { return new Date(unix * 1000).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }); } catch (e) { return ""; }
}

function renderBillingPanel() {
  const el = document.getElementById("billing");
  if (!el || !BILLING || !BILLING.signed_in) return;
  const b = BILLING.billing || {};
  const plan = BILLING.plan || "free";
  const lim = BILLING.limits || {};
  let status = "";
  if (b.status === "past_due") {
    status = '<div class="notice warn">Your last payment failed. Update your card in <b>Manage billing</b> to keep ' + PLAN_LABEL[plan] + ' — Stripe retries automatically.</div>';
  } else if (b.cancel_at_period_end && b.current_period_end) {
    status = '<div class="notice info">' + PLAN_LABEL[plan] + ' ends on ' + fmtDate(b.current_period_end) + ' — then it drops to Free. Resume anytime in <b>Manage billing</b>.</div>';
  } else if (b.status === "incomplete") {
    status = '<div class="notice info">Payment is still processing — your plan unlocks as soon as it clears.</div>';
  }
  const renew = (b.current_period_end && !b.cancel_at_period_end && plan !== "free") ? ' · renews ' + fmtDate(b.current_period_end) : '';
  const up = BILLING.upgrade;
  el.innerHTML =
    '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">' +
      '<div><strong>Billing</strong> <span class="pill ' + plan + '" style="margin-left:6px">' + PLAN_LABEL[plan] + '</span>' +
      '<div class="muted" style="font-size:.85rem">' + (lim.reads_per_day || 0).toLocaleString() + ' reads · ' + (lim.executes_per_day || 0).toLocaleString() + ' live executes / day' + renew + '</div></div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        (up ? '<button class="input-btn" id="billing-up" data-plan="' + up.plan + '">' + (plan === "free" ? "Upgrade to " : "Switch to ") + PLAN_LABEL[up.plan] + ' — ' + up.price + '</button>' : '') +
        (BILLING.can_manage ? '<button class="input-btn" id="billing-portal">Manage billing</button>' : '') +
      '</div>' +
    '</div>' + status + '<div id="billing-msg" class="notice" style="display:none"></div>';
  document.getElementById("billing-portal")?.addEventListener("click", (e) => openPortal(e.currentTarget));
  document.getElementById("billing-up")?.addEventListener("click", (e) => startUpgrade(e.currentTarget.dataset.plan, e.currentTarget));
  if (PARAMS.get("billing") === "updated") setBillingMsg("Billing updated. Changes can take a few seconds to show.", "ok");
}

function renderPlanCards() {
  const plan = (BILLING && BILLING.plan) || "free";
  document.querySelectorAll("[data-plan-card]").forEach((card) => {
    const p = card.dataset.planCard;
    card.classList.toggle("current", p === plan);
    const btn = card.querySelector("button.upgrade[data-plan]");
    if (!btn) return;
    if (p === plan) { btn.textContent = "Current plan"; btn.disabled = true; return; }
    btn.disabled = false;
    if (BILLING && BILLING.can_change_plan) btn.textContent = (PLAN_RANK[p] > PLAN_RANK[plan] ? "Upgrade to " : "Switch to ") + PLAN_LABEL[p];
    else btn.textContent = "Upgrade";
  });
  const free = document.getElementById("free-plan-btn");
  if (free) {
    const onFree = plan === "free";
    free.textContent = onFree ? "Current" : (BILLING && BILLING.can_manage ? "Cancel in billing" : "Free");
    free.onclick = (e) => {
      e.preventDefault();
      if (!onFree && BILLING && BILLING.can_manage) openPortal(document.getElementById("billing-portal") || free);
    };
  }
}

// Arrived from a paywall (402/429 upgrade_url): say what was blocked and
// pre-select the plan that unlocks it.
(function upgradeIntent() {
  const want = PARAMS.get("upgrade");
  if (!PLAN_PRICE[want] || PARAMS.get("session_id")) return;
  const reasons = {
    execute_required: "Live tool calls (execute) need a paid plan.",
    free_tier_exhausted: "This agent used today's free tool calls.",
    quota_reads: "You hit today's read limit.",
    quota_executes: "You hit today's live-execute limit.",
    quota_push: "You hit today's cache-push limit.",
  };
  const why = reasons[PARAMS.get("reason")] || (PARAMS.get("canceled") === "1" ? "Checkout canceled — no charge made." : "");
  document.getElementById("upgrade-title").textContent = (why ? why + " " : "") + PLAN_LABEL[want] + " unlocks it.";
  const lim = { builder: "2,000 reads + 200 live executes / day", pro: "10,000 reads + 1,000 live executes / day", reseller: "100,000 reads + 50,000 executes / day" };
  document.getElementById("upgrade-detail").textContent = PLAN_PRICE[want] + " · " + lim[want] + " · cancel anytime";
  const go = document.getElementById("upgrade-go");
  go.textContent = "Upgrade to " + PLAN_LABEL[want] + " — " + PLAN_PRICE[want];
  go.addEventListener("click", () => startUpgrade(want, go));
  document.getElementById("upgrade-banner").style.display = "block";
  document.querySelector('[data-plan-card="' + want + '"]')?.classList.add("featured");
  if (location.hash === "#plans") setTimeout(() => document.getElementById("plans").scrollIntoView({ block: "start" }), 50);
})();

// --- Post-checkout / cancel banners ---
(async function handleReturn() {
  if (PARAMS.get("canceled") === "1") {
    if (!PLAN_PRICE[PARAMS.get("upgrade")]) document.getElementById("cancel-banner").style.display = "block";
    return;
  }
  const sid = PARAMS.get("session_id");
  if (!sid) return;
  const banner = document.getElementById("success-banner");
  const keyEl = document.getElementById("success-key");
  banner.style.display = "block";
  keyEl.textContent = "Loading…";
  // Poll briefly to absorb webhook race.
  for (let i = 0; i < 8; i++) {
    const r = await fetch(ORIGIN + "/api/v1/keys/by-checkout?session_id=" + encodeURIComponent(sid), { credentials: "include" });
    const d = await r.json();
    if (d.sign_in_required) {
      document.getElementById("success-title").textContent = "Payment received — plan active";
      keyEl.textContent = "Sign in with the account you upgraded to see your key.";
      return;
    }
    if (d.key) {
      keyEl.textContent = d.key;
      document.getElementById("success-title").textContent = "Payment received — you're on " + (PLAN_LABEL[d.plan] || d.plan);
      // Auto-fill the key-check box too.
      inp.value = d.key;
      loadBilling();
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
  keyEl.textContent = "Took too long — refresh in a minute, or use the recovery form below.";
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
    const p = document.createElement("p");
    p.className = "muted";
    p.textContent = d.message || "Check your inbox.";
    out.appendChild(p);
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
    // The control plane, made visible: load this agent's governance panel.
    loadGovernance(key);
  } catch (e) {
    result.innerHTML = '<span style="color:var(--red)">' + String(e) + '</span>';
    result.style.display = "block";
  }
}

// ----- Agent controls (governance: usage + kill switch + cap + audit) -----
async function loadGovernance(key) {
  const area = document.getElementById("govern-area");
  if (!key) { area.style.display = "none"; return; }
  const H = { "authorization": "Bearer " + key };
  try {
    const [uRes, aRes] = await Promise.all([
      fetch(ORIGIN + "/api/v1/agent/usage", { headers: H }),
      fetch(ORIGIN + "/api/v1/agent/audit?limit=25", { headers: H }),
    ]);
    if (uRes.status === 401) { area.style.display = "none"; return; } // anon/invalid key
    const u = await uRes.json();
    const a = await aRes.json().catch(() => ({ entries: [] }));
    renderGovernance(u, a.entries || []);
    area.style.display = "block";
  } catch { area.style.display = "none"; }
}

function renderGovernance(u, entries) {
  const killed = !!u.killed;
  const cap = u.daily_cap;          // null = no cap
  const used = u.used_today || 0;
  const pct = cap ? Math.min(100, Math.round((used / cap) * 100)) : 0;

  const status = document.getElementById("govern-status");
  status.textContent = killed ? "KILLED" : "Live";
  status.className = "pill " + (killed ? "killed" : "live");

  document.getElementById("govern-usage").innerHTML = \`
    <div class="usage-card">
      <div class="label">Calls today</div>
      <div class="val">\${used}\${cap != null ? " / " + cap : ""}</div>
      \${cap != null
        ? \`<div class="bar"><div class="fill" style="width:\${pct}%"></div></div>\`
        : \`<div class="label" style="margin-top:4px;text-transform:none">no cap set</div>\`}
    </div>
    <div class="usage-card">
      <div class="label">Remaining</div>
      <div class="val">\${cap != null ? Math.max(0, cap - used) : "∞"}</div>
    </div>
    <div class="usage-card">
      <div class="label">Tool access</div>
      <div class="val" style="font-size:1.1rem;color:\${killed ? "var(--red)" : "var(--green)"}">\${killed ? "Paused" : "Active"}</div>
    </div>\`;

  const kb = document.getElementById("kill-toggle");
  kb.textContent = killed ? "Re-enable tool access" : "Kill all tool access";
  kb.className = "kill-btn" + (killed ? " revive" : "");
  kb.dataset.killed = killed ? "1" : "0";

  const ci = document.getElementById("cap-input");
  if (document.activeElement !== ci) ci.value = cap != null ? cap : "";

  const wrap = document.getElementById("audit-wrap");
  if (!entries.length) {
    wrap.innerHTML = '<div class="audit-empty">No tool calls yet. Once your agent calls a connected provider through wmcp, every call is logged here.</div>';
    return;
  }
  const esc = (s) => String(s == null ? "—" : s).replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
  const rows = entries.map((e) => {
    const when = (() => { try { return new Date(e.ts).toLocaleString(); } catch { return "—"; } })();
    const cls = e.ok ? "ok" : "bad";
    return \`<tr><td>\${esc(when)}</td><td>\${esc(e.provider)}</td><td>\${esc(e.tool)}</td><td class="\${cls}">\${esc(e.status)}</td></tr>\`;
  }).join("");
  wrap.innerHTML = \`<table class="audit"><thead><tr><th>When</th><th>Provider</th><th>Tool</th><th>Status</th></tr></thead><tbody>\${rows}</tbody></table>\`;
}

async function postControl(body) {
  const key = inp.value.trim();
  if (!key) return;
  const msg = document.getElementById("govern-msg");
  msg.textContent = "Saving…";
  try {
    const r = await fetch(ORIGIN + "/api/v1/agent/control", {
      method: "POST",
      headers: { "authorization": "Bearer " + key, "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || d.error) { msg.textContent = "Error: " + (d.error || r.status); return; }
    msg.textContent = "Saved.";
    setTimeout(() => { msg.textContent = ""; }, 2000);
    loadGovernance(key);
  } catch { msg.textContent = "Network error."; }
}

document.getElementById("kill-toggle")?.addEventListener("click", () => {
  const killed = document.getElementById("kill-toggle").dataset.killed === "1";
  if (!killed && !confirm("Kill ALL tool access for this agent, across every connected provider? Calls will be refused (403) until you re-enable.")) return;
  postControl({ killed: !killed });
});
document.getElementById("cap-save")?.addEventListener("click", () => {
  const v = document.getElementById("cap-input").value.trim();
  postControl({ daily_cap: v === "" ? null : parseInt(v, 10) });
});
</script>
</body>
</html>`;
}
