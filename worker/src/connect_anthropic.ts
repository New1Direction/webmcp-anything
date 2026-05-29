// Dedicated page for the Anthropic OOB OAuth dance.
// The modal-on-dashboard UX gets lost when the new tab opens; this is a
// full page with one job — make the paste step impossible to miss.

export function connectAnthropicHtml(): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Connect Anthropic · wmcp.sh</title>
<style>
  :root {
    --bg: #07070d; --card: #16161f; --bg2: #11111c; --border: #26263a;
    --text: #ececf5; --muted: #8a8aa8;
    --accent: #ff9e2c; --accent2: #ffcf7a; --green: #4ade80; --red: #f87171;
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
  .wrap { max-width: 720px; margin: 0 auto; padding: 50px 24px; }
  h1 {
    font-size: 1.8rem; margin: 0 0 8px;
    background: linear-gradient(90deg, #fff, var(--accent2));
    -webkit-background-clip: text; background-clip: text; color: transparent;
  }
  .muted { color: var(--muted); font-size: .92rem; }
  .step {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 14px; padding: 22px 24px; margin-top: 16px;
    position: relative;
  }
  .step.active { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent) inset; }
  .step.done   { border-color: var(--green); }
  .step h2 {
    margin: 0 0 8px; font-size: 1.05rem; display: flex; align-items: center; gap: 10px;
  }
  .num {
    width: 28px; height: 28px; border-radius: 50%;
    background: var(--bg2); border: 1px solid var(--border);
    display: grid; place-items: center; font-weight: 700; font-size: .9rem;
    color: var(--muted);
  }
  .active .num { background: linear-gradient(135deg, var(--accent), var(--accent2)); color: white; border: none; }
  .done   .num { background: var(--green); color: var(--bg); border: none; }
  .done   .num::after { content: "✓"; }
  .done   .num span { display: none; }
  .btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    color: white; padding: 13px 22px; border-radius: 10px; font-weight: 700;
    text-decoration: none; cursor: pointer; border: none; font-family: inherit;
    transition: transform .1s, box-shadow .2s;
    font-size: .95rem;
  }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(255,158,44,.3); }
  .btn-secondary {
    background: var(--bg2); color: var(--text);
    border: 1px solid var(--border); padding: 11px 18px; border-radius: 8px;
    font-weight: 600; cursor: pointer; font-family: inherit; font-size: .85rem;
    text-decoration: none; display: inline-block;
  }
  .btn-secondary:hover { border-color: var(--accent); }
  input[type=text] {
    width: 100%; background: var(--bg2); border: 1px solid var(--border);
    color: var(--text); padding: 14px 16px; border-radius: 10px;
    font-family: "SF Mono", Menlo, monospace; font-size: .92rem;
    margin: 10px 0 12px;
  }
  input[type=text]:focus { outline: none; border-color: var(--accent); }
  .url-box {
    background: var(--bg2); border: 1px solid var(--border);
    border-radius: 10px; padding: 12px 14px; margin: 10px 0;
    font-family: "SF Mono", Menlo, monospace; font-size: .78rem;
    color: var(--accent2); overflow-x: auto; white-space: nowrap;
    user-select: all;
  }
  .err { color: var(--red); font-size: .88rem; margin-top: 10px; }
  .ok  { color: var(--green); font-size: .92rem; margin-top: 10px; }
  .hint { color: var(--muted); font-size: .85rem; margin-top: 6px; }
  .row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
  code { background: var(--bg); color: var(--accent2); padding: 2px 6px; border-radius: 4px; font-size: .85em; }
  a.back { color: var(--muted); text-decoration: none; font-size: .85rem; }
  a.back:hover { color: var(--text); }
</style>
</head>
<body>
<div class="wrap">

<a class="back" href="/dashboard">← Back to dashboard</a>

<h1 style="margin-top:14px">Connect Anthropic</h1>
<p class="muted">One connection covers Claude Code API key creation, profile, and Claude Pro/Max inference. Two-step OAuth because Anthropic uses an out-of-band callback for third-party apps.</p>

<div class="step active" id="step-1">
  <h2><span class="num"><span>1</span></span> Authorize on claude.ai</h2>
  <p class="muted" style="margin:0 0 12px">Click below to open Anthropic's authorize page in a new tab. Click <strong>Authorize</strong> there.</p>
  <a id="auth-link" class="btn-primary" href="#" target="_blank" rel="noopener">
    Open claude.ai/oauth/authorize ↗
  </a>
  <div class="hint" style="margin-top:12px">
    Or copy the URL manually:
    <div class="url-box" id="auth-url">loading…</div>
  </div>
</div>

<div class="step" id="step-2">
  <h2><span class="num"><span>2</span></span> Paste the code from Anthropic</h2>
  <p class="muted" style="margin:0">After you click Authorize, Anthropic's callback page shows a code that looks like:</p>
  <div class="url-box" style="color:var(--muted);user-select:none">aBcDeFgHiJkLmNoPqRsTuVwXyZ#StAtEvAlUeHeRe</div>
  <p class="muted" style="margin:14px 0 4px">Copy the <strong>whole string</strong> (including the <code>#</code> and everything after it) and paste it here:</p>
  <input type="text" id="code" placeholder="paste the code from claude.ai/anthropic's callback page" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" />
  <div class="row">
    <button class="btn-primary" id="submit">Submit code</button>
    <a class="btn-secondary" href="/dashboard">Cancel</a>
  </div>
  <div id="result"></div>
</div>

</div>

<script>
let stateValue = null;

(async function init() {
  const r = await fetch("/api/v1/providers/anthropic/start", { credentials: "include" });
  const d = await r.json();
  if (d.error) {
    document.getElementById("auth-url").textContent = "Error: " + d.error + " — try signing in first.";
    return;
  }
  document.getElementById("auth-link").href = d.authorize_url;
  document.getElementById("auth-url").textContent = d.authorize_url;
  stateValue = d.state;
})();

document.getElementById("submit").addEventListener("click", submit);
document.getElementById("code").addEventListener("keydown", e => { if (e.key === "Enter") submit(); });

async function submit() {
  const code = document.getElementById("code").value.trim();
  const resultEl = document.getElementById("result");
  resultEl.innerHTML = "";
  if (!code) { resultEl.innerHTML = '<div class="err">Paste the code first.</div>'; return; }
  if (!stateValue) { resultEl.innerHTML = '<div class="err">No active state — reload this page.</div>'; return; }

  const btn = document.getElementById("submit");
  btn.disabled = true;
  resultEl.innerHTML = '<div class="muted" style="margin-top:10px">Exchanging with Anthropic…</div>';

  try {
    const r = await fetch("/api/v1/providers/anthropic/exchange", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ code, state: stateValue }),
    });
    const d = await r.json();
    if (d.ok) {
      document.getElementById("step-2").classList.remove("active");
      document.getElementById("step-2").classList.add("done");
      resultEl.innerHTML = '<div class="ok">✓ Connected. Redirecting back to dashboard…</div>';
      setTimeout(() => { window.location.href = "/dashboard?connected=anthropic"; }, 900);
    } else {
      resultEl.innerHTML = '<div class="err">' + escapeHtml(d.error || "exchange failed") +
        (d.detail ? ' — ' + escapeHtml(typeof d.detail === "string" ? d.detail.slice(0,400) : JSON.stringify(d.detail).slice(0,400)) : '') +
        '</div>';
      btn.disabled = false;
    }
  } catch (e) {
    resultEl.innerHTML = '<div class="err">' + escapeHtml(String(e)) + '</div>';
    btn.disabled = false;
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);
}
</script>
</body>
</html>`;
}
