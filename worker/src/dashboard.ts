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
    --accent: #7c5cff; --accent2: #00e5ff; --green: #4ade80;
    --yellow: #fbbf24; --red: #f87171;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh; color: var(--text); background: var(--bg);
    font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
    line-height: 1.6;
    background-image:
      radial-gradient(ellipse 800px 600px at 0% 0%, rgba(124,92,255,.15), transparent),
      radial-gradient(ellipse 600px 500px at 100% 30%, rgba(0,229,255,.08), transparent);
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
  .pill.pro { background: rgba(0,229,255,.15); color: var(--accent2); }
  .pill.reseller { background: linear-gradient(90deg, rgba(124,92,255,.3), rgba(255,77,141,.3)); color: white; }
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
    background: linear-gradient(135deg, var(--card), rgba(124,92,255,.1));
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
  pre .k { color: var(--accent2); } pre .s { color: #f0abfc; }
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
    <h3>Pro</h3>
    <div class="price">$29<small>/mo</small></div>
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
    <div class="price">$99<small>/mo</small></div>
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

<div id="success-banner" style="display:none;margin-top:20px;background:linear-gradient(135deg,rgba(74,222,128,.12),rgba(0,229,255,.08));border:1px solid var(--green);border-radius:16px;padding:24px">
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
