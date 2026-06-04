// ui.ts — one shared design system for the secondary pages (leaderboard, webmcp
// hub, connect, tools). Same tokens + spacing scale + components so everything
// lines up and matches the homepage instead of each page rolling its own CSS.

export function uiCss(maxWidth = 900): string {
  return `
  :root{
    --bg:#07070d; --card:#16161f; --bg2:#11111c; --border:#26263a;
    --text:#ececf5; --muted:#9a9ab0; --dim:#6a6a88;
    --accent:#ff9e2c; --accent2:#ffcf7a; --green:#4ade80; --red:#ff5470;
    --r:14px; --maxw:${maxWidth}px;
  }
  *{box-sizing:border-box}
  html{scroll-behavior:smooth}
  body{
    margin:0; color:var(--text); background:var(--bg);
    font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif;
    line-height:1.6; font-size:16px;
    background-image:radial-gradient(ellipse 900px 600px at 12% -5%,rgba(255,158,44,.13),transparent 60%);
    -webkit-font-smoothing:antialiased;
  }
  a{color:var(--accent2)}
  .wrap{max-width:var(--maxw); margin:0 auto; padding:0 24px}
  /* top nav */
  nav.bar{display:flex; justify-content:space-between; align-items:center; gap:16px;
    max-width:1120px; margin:0 auto; padding:18px 24px}
  nav.bar .brand{display:flex; align-items:center; gap:9px; font-weight:800; color:var(--text); text-decoration:none; font-size:1rem}
  nav.bar .nl{color:var(--muted); text-decoration:none; font-size:.9rem}
  nav.bar .nl:hover{color:var(--text)}
  nav.bar .get{background:linear-gradient(135deg,var(--accent),var(--accent2)); color:#2a1500; padding:9px 16px; border-radius:10px; font-weight:800; text-decoration:none; font-size:.9rem; white-space:nowrap}
  nav.bar .right{display:flex; align-items:center; gap:16px}
  nav.bar .navtog{display:none}
  nav.bar .hamb{display:none; cursor:pointer; flex-direction:column; gap:5px; padding:8px; margin:-8px}
  nav.bar .hamb span{display:block; width:22px; height:2px; background:var(--muted); border-radius:2px}
  @media(max-width:640px){
    nav.bar{position:relative; flex-wrap:wrap}
    nav.bar .hamb{display:flex}
    nav.bar .right{display:none; position:absolute; top:calc(100% - 2px); right:0; left:0; flex-direction:column; gap:0; align-items:stretch; background:var(--card); border:1px solid var(--border); border-radius:12px; padding:8px; z-index:60; box-shadow:0 14px 40px rgba(0,0,0,.45)}
    nav.bar .navtog:checked ~ .right{display:flex}
    nav.bar .right .nl{display:block; padding:12px; border-radius:8px}
    nav.bar .right .nl:hover{background:var(--bg2)}
    nav.bar .right .get{text-align:center; margin-top:4px}
  }
  /* hero */
  header.hero{padding:40px 0 8px}
  h1{font-size:clamp(2rem,4.4vw,2.7rem); line-height:1.08; letter-spacing:-.022em; margin:0 0 14px}
  h2{font-size:1.45rem; letter-spacing:-.01em; margin:34px 0 14px}
  h3{font-size:1.05rem; margin:0 0 6px}
  .lede{color:var(--muted); font-size:1.12rem; max-width:680px; margin:0 0 22px}
  p{margin:0 0 14px}
  .muted{color:var(--muted)} .dim{color:var(--dim)}
  /* breadcrumb + small navs */
  .crumbs{color:var(--muted); font-size:.85rem; padding-top:6px}
  .crumbs a{color:var(--accent2); text-decoration:none}
  .crumbs .sep{opacity:.5; margin:0 2px}
  section{padding:24px 0}
  /* buttons */
  .row{display:flex; gap:12px; flex-wrap:wrap; align-items:center}
  .btn{display:inline-flex; align-items:center; gap:8px; padding:12px 19px; border-radius:11px;
    font-weight:800; font-size:.94rem; text-decoration:none; border:none; cursor:pointer; font-family:inherit; line-height:1; white-space:nowrap}
  .btn-primary{background:linear-gradient(135deg,var(--accent),var(--accent2)); color:#2a1500}
  .btn-ghost{background:var(--bg2); color:var(--text); border:1px solid var(--border)}
  .btn-primary:hover{filter:brightness(1.05)} .btn-ghost:hover{border-color:var(--accent)}
  /* pill row (consistent quick-nav) */
  .pillrow{display:flex; gap:10px; flex-wrap:wrap; margin:18px 0 6px}
  .pill{display:inline-flex; align-items:center; gap:7px; background:var(--bg2); border:1px solid var(--border);
    border-radius:10px; padding:9px 14px; color:var(--text); text-decoration:none; font-weight:700; font-size:.9rem}
  .pill:hover{border-color:var(--accent); color:var(--text)}
  .pill.cur{border-color:var(--accent); color:var(--accent2)}
  /* cards + grids */
  .card{background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:20px}
  .grid{display:grid; gap:14px}
  .grid.c2{grid-template-columns:repeat(2,1fr)}
  .grid.c3{grid-template-columns:repeat(3,1fr)}
  .grid.c4{grid-template-columns:repeat(4,1fr)}
  @media(max-width:640px){ .grid.c2,.grid.c3,.grid.c4{grid-template-columns:1fr} }
  .step b,.step .n{color:var(--accent2); font-weight:800; font-size:.78rem; letter-spacing:.08em; text-transform:uppercase}
  .step p{margin:6px 0 0; color:var(--muted); font-size:.92rem}
  /* table */
  table.tbl{width:100%; border-collapse:collapse; background:var(--card); border:1px solid var(--border); border-radius:var(--r); overflow:hidden}
  table.tbl th,table.tbl td{text-align:left; padding:12px 14px; border-bottom:1px solid var(--border); font-size:.93rem; vertical-align:middle}
  table.tbl thead th{background:rgba(255,158,44,.07); font-size:.72rem; text-transform:uppercase; letter-spacing:.06em; color:var(--accent2); font-weight:700}
  table.tbl tbody tr:last-child td{border-bottom:none}
  table.tbl tbody tr:hover{background:rgba(255,255,255,.02)}
  table.tbl td.num{text-align:right; font-variant-numeric:tabular-nums}
  table.tbl td.rank{color:var(--dim); width:42px; text-align:right; font-variant-numeric:tabular-nums}
  /* form inputs */
  label.fld{display:flex; flex-direction:column; gap:6px; font-size:.78rem; text-transform:uppercase; letter-spacing:.05em; color:var(--dim)}
  input,select{background:var(--bg2); border:1px solid var(--border); color:var(--text); border-radius:10px; padding:12px 14px; font-size:1rem; font-family:inherit; width:100%}
  input:focus,select:focus{outline:none; border-color:var(--accent)}
  /* code snippet */
  .snip{background:var(--bg2); border:1px solid var(--border); border-radius:10px; padding:12px 14px;
    font-family:"SF Mono",Menlo,monospace; font-size:.82rem; line-height:1.5; overflow-x:auto;
    white-space:pre-wrap; word-break:break-all; margin:0; color:var(--text)}
  details{background:var(--card); border:1px solid var(--border); border-radius:12px; padding:15px 18px; margin-bottom:10px}
  details summary{font-weight:700; cursor:pointer; list-style:none}
  details .a{color:var(--muted); margin-top:10px}
  /* footer */
  footer{margin-top:44px; padding:22px 0 40px; border-top:1px solid var(--border); color:var(--dim); font-size:.85rem}
  footer a{color:var(--accent2); text-decoration:none; margin-right:14px}`;
}

const STORE_URL = "https://chromewebstore.google.com/detail/quickcatch/bglmmkpaofofjnpkabfneeemgnjpjejl";

// Consistent top nav for every secondary page.
// Drop-in email-capture block (self-contained styles + script) → POST /api/v1/leads.
// Turns high-traffic dev pages into a list (the asset that monetizes: drift-alert
// Monitor SKU + a paid report). Self-wires at parse time.
export function emailCapture(label: string, sublabel: string, pkg: string): string {
  return `<div class="ecap" style="background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:18px 20px;margin:28px 0">
  <div style="font-weight:800;font-size:1.05rem">${label}</div>
  <div style="color:var(--muted);font-size:.9rem;margin:4px 0 12px">${sublabel}</div>
  <div style="display:flex;gap:8px;flex-wrap:wrap;max-width:480px">
    <input type="email" class="ecap-e" placeholder="you@company.com" style="flex:1;min-width:220px;background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:10px;padding:11px 14px;font-size:.92rem"/>
    <button class="btn btn-primary ecap-b" type="button">Notify me</button>
  </div>
  <div class="ecap-m" style="font-size:.85rem;margin-top:8px;min-height:1em"></div>
</div>
<script>(function(){var s=document.currentScript,w=s.previousElementSibling;var e=w.querySelector('.ecap-e'),b=w.querySelector('.ecap-b'),m=w.querySelector('.ecap-m');function go(){var v=(e.value||'').trim();if(v.indexOf('@')<1){m.style.color='#ff5c7c';m.textContent='Enter a valid email.';return;}b.disabled=true;b.textContent='…';fetch('/api/v1/leads',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:v,package:${JSON.stringify(pkg)},use_case:location.pathname})}).then(function(){m.style.color='#4ade80';m.textContent='Got it — you are on the list.';e.value='';b.textContent='Done';}).catch(function(){m.style.color='#ff5c7c';m.textContent='Try again.';b.disabled=false;b.textContent='Notify me';});}b.addEventListener('click',go);e.addEventListener('keydown',function(ev){if(ev.key==='Enter')go();});})();</script>`;
}

// Paid continuous-monitoring upsell band. Self-wiring (mirrors emailCapture):
// URL + email inline, optional Slack/webhook via prompt → POSTs the live
// /api/v1/mcp/monitor/checkout and redirects to Stripe. Grades stay free; this
// sells the live watch on a specific connection. 503 = STRIPE_PRICE_MONITOR unset.
export function monitorUpsell(origin: string): string {
  return `<div class="mupsell" style="background:rgba(255,158,44,.06);border:1px solid rgba(255,158,44,.35);border-radius:14px;padding:18px 20px;margin:24px 0">
  <div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap">
    <span style="font-weight:800;font-size:1.06rem">Rug-pull insurance for a server your agent depends on</span>
    <span style="color:var(--muted);font-size:.82rem">paid · webhook + email · cancel anytime</span>
  </div>
  <div style="color:var(--muted);font-size:.9rem;margin:5px 0 12px;max-width:640px">Pick one server and we re-grade it continuously — the instant its tools change or its grade drops we fire a Slack/webhook alert <b>and</b> email you, before your agent calls a tool that wasn't there yesterday. The grade itself is always free; this is the live watch on a connection you can't afford to have rug-pulled.</div>
  <div style="display:flex;gap:8px;flex-wrap:wrap;max-width:640px">
    <input type="url" class="mu-u" placeholder="https://mcp.example.com/mcp" style="flex:2;min-width:240px;background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:10px;padding:11px 14px;font-size:.92rem"/>
    <input type="email" class="mu-e" placeholder="you@company.com" style="flex:1;min-width:180px;background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:10px;padding:11px 14px;font-size:.92rem"/>
    <button class="btn btn-primary mu-b" type="button">Start monitoring →</button>
  </div>
  <div class="mu-m" style="font-size:.85rem;margin-top:8px;min-height:1em"></div>
</div>
<script>(function(){var s=document.currentScript,w=s.previousElementSibling;var u=w.querySelector('.mu-u'),e=w.querySelector('.mu-e'),b=w.querySelector('.mu-b'),m=w.querySelector('.mu-m');function go(){var v=(u.value||'').trim(),em=(e.value||'').trim();if(!/^https?:\\/\\//.test(v)){m.style.color='#ff5c7c';m.textContent='Enter the server URL (https://…).';u.focus();return;}if(em.indexOf('@')<1){m.style.color='#ff5c7c';m.textContent='Enter a valid email for the receipt.';e.focus();return;}var wh=(prompt('Optional https Slack-compatible webhook for instant alerts (blank = email only):')||'').trim();if(wh&&!/^https:\\/\\//.test(wh)){m.style.color='#ff5c7c';m.textContent='Webhook must be an https URL — try again.';return;}b.disabled=true;b.textContent='…';var body={url:v,email:em};if(wh)body.alert_url=wh;fetch('/api/v1/mcp/monitor/checkout',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)}).then(function(r){return r.json().catch(function(){return{};}).then(function(d){return{s:r.status,d:d};});}).then(function(x){if(x.d&&x.d.url){location.href=x.d.url;return;}b.disabled=false;b.textContent='Start monitoring →';m.style.color='#ff5c7c';m.textContent=x.s===503?'Not switched on yet — check back soon.':('Could not start checkout: '+((x.d&&x.d.error)||x.s));}).catch(function(){b.disabled=false;b.textContent='Start monitoring →';m.style.color='#ff5c7c';m.textContent='Network error — try again.';});}b.addEventListener('click',go);e.addEventListener('keydown',function(ev){if(ev.key==='Enter')go();});u.addEventListener('keydown',function(ev){if(ev.key==='Enter')go();});})();</script>`;
}

export function uiNav(origin: string, opts: { get?: boolean } = {}): string {
  const get = opts.get === false
    ? ""
    : `<a class="get" href="${origin}/dashboard">Dashboard →</a>`;
  return `<nav class="bar">
  <a class="brand" href="${origin}/"><svg viewBox="0 0 24 24" fill="#ff9e2c" width="20" height="20" aria-hidden="true" style="flex:none"><path d="M12 1Q12.6 11.4 23 12Q12.6 12.6 12 23Q11.4 12.6 1 12Q11.4 11.4 12 1Z"/></svg>wmcp.sh</a>
  <input type="checkbox" id="wnavtog" class="navtog" aria-hidden="true" />
  <label for="wnavtog" class="hamb" aria-label="Toggle menu"><span></span><span></span><span></span></label>
  <div class="right">
    <a class="nl" href="${origin}/directory">Directory</a>
    <a class="nl" href="${origin}/mcp/leaderboard">Leaderboard</a>
    <a class="nl" href="${origin}/webmcp">WebMCP</a>
    <a class="nl" href="${origin}/#pricing">Pricing</a>
    ${get}
  </div>
</nav>`;
}
