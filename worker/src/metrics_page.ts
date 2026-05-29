// metrics_page.ts — /dashboard/metrics
//
// Operator view of the funnel counters written by metrics.ts (track()). Reads
// GET /api/v1/admin/metrics with the x-admin-token saved in localStorage
// (same convention as /dashboard/submissions). noindex. Backtick-free JS.

export function metricsPageHtml(origin: string): string {
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8" />
<title>Funnel metrics · wmcp.sh admin</title>
<meta name="robots" content="noindex" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  :root{--bg:#0a0a0f;--card:#16161f;--border:#26263a;--text:#e8e8f0;--muted:#9a9ab0;--accent:#ff9e2c;--accent2:#ffcf7a;--green:#4ade80}
  *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:16px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif}
  .wrap{max-width:860px;margin:0 auto;padding:40px 22px}
  a{color:var(--accent2);text-decoration:none}
  h1{font-size:1.7rem;margin:0 0 4px}.muted{color:var(--muted)}
  .bar{display:flex;gap:10px;margin:18px 0}
  input{flex:1;padding:10px 13px;border-radius:9px;border:1px solid var(--border);background:#0f0f18;color:var(--text);font:inherit}
  button{cursor:pointer;border:0;border-radius:9px;padding:10px 18px;font:inherit;font-weight:700;background:linear-gradient(135deg,var(--accent),var(--accent2));color:#0c0c14}
  .cards{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));margin:20px 0}
  .card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px 18px}
  .card .v{font-size:1.8rem;font-weight:800;color:var(--accent2)}
  .card .l{color:var(--muted);font-size:.8rem;text-transform:uppercase;letter-spacing:.06em}
  .funnel{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px 18px;margin-bottom:20px}
  .funnel b{color:var(--green)}
  table{width:100%;border-collapse:collapse;font-size:.86rem}
  th,td{text-align:left;padding:8px 10px;border-bottom:1px solid var(--border)}
  th{color:var(--muted);font-size:.74rem;text-transform:uppercase}
  .err{color:#ff5c7c;margin-top:10px}
  .back{color:var(--muted);font-size:.85rem}
</style></head><body><div class="wrap">
<a class="back" href="/dashboard">← Dashboard</a>
<h1>Funnel metrics</h1>
<p class="muted">Daily counters from the live worker. Admin token required (saved locally).</p>
<div class="bar">
  <input id="token" type="password" placeholder="x-admin-token" />
  <button id="load">Load</button>
</div>
<div id="err" class="err"></div>
<div id="funnel" class="funnel" style="display:none"></div>
<div id="cards" class="cards"></div>
<div id="tableWrap" style="display:none">
  <h3 style="margin:18px 0 6px">By day</h3>
  <table><thead><tr><th>Day</th><th>/u</th><th>/directory</th><th>probe</th><th>checkout</th><th>paid</th></tr></thead><tbody id="rows"></tbody></table>
</div>

<script>
var ORIGIN=${JSON.stringify(origin)};
var KEY="wmcp_admin_token";
function $(id){return document.getElementById(id);}
$("token").value=localStorage.getItem(KEY)||"";
var EV=["u_view","directory_view","probe_run","checkout_started","paid"];
var LBL={u_view:"/u views",directory_view:"/directory",probe_run:"probes",checkout_started:"checkouts",paid:"paid"};

$("load").addEventListener("click",function(){
  var t=$("token").value.trim();
  localStorage.setItem(KEY,t);
  $("err").textContent="";
  fetch(ORIGIN+"/api/v1/admin/metrics",{headers:{"x-admin-token":t}})
    .then(function(r){return r.json().then(function(d){return {status:r.status,d:d};});})
    .then(function(res){
      if(res.status!==200){$("err").textContent=(res.d&&res.d.error)||"Failed ("+res.status+")";return;}
      var d=res.d, totals=d.totals||{}, funnel=d.funnel||{}, byDay=d.byDay||{};
      var cards=$("cards");cards.innerHTML="";
      EV.forEach(function(e){
        var c=document.createElement("div");c.className="card";
        c.innerHTML='<div class="v">'+(totals[e]||0)+'</div><div class="l">'+LBL[e]+'</div>';
        cards.appendChild(c);
      });
      var f=$("funnel");f.style.display="block";
      f.innerHTML="Probe → checkout: <b>"+(funnel.probe_to_checkout_pct==null?"—":funnel.probe_to_checkout_pct+"%")+
        "</b> &nbsp;·&nbsp; Checkout → paid: <b>"+(funnel.checkout_to_paid_pct==null?"—":funnel.checkout_to_paid_pct+"%")+"</b>";
      var days=Object.keys(byDay).sort().reverse();
      var rows=$("rows");rows.innerHTML="";
      days.forEach(function(day){
        var r=byDay[day]||{};
        var tr=document.createElement("tr");
        tr.innerHTML="<td>"+day+"</td><td>"+(r.u_view||0)+"</td><td>"+(r.directory_view||0)+"</td><td>"+(r.probe_run||0)+"</td><td>"+(r.checkout_started||0)+"</td><td>"+(r.paid||0)+"</td>";
        rows.appendChild(tr);
      });
      $("tableWrap").style.display=days.length?"block":"none";
    }).catch(function(e){$("err").textContent=String(e);});
});
if($("token").value){$("load").click();}
</script>
</div></body></html>`;
}
