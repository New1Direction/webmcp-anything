// metrics_page.ts — /dashboard/metrics : the operator command center.
//
// One screen for the whole machine: live asset counts (cached URLs, directory
// sites, graded MCP servers, agent grade-queue depth), the conversion funnel,
// recent leads, and per-day counters. Reads GET /api/v1/admin/metrics and
// /api/v1/admin/leads with the x-admin-token saved in localStorage. noindex.
// Backtick-free JS (it lives inside this template literal).

import { uiCss } from "./ui";

export function metricsPageHtml(origin: string): string {
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8" />
<title>Command center · wmcp.sh</title>
<meta name="robots" content="noindex" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>${uiCss(980)}
  .tokbar{display:flex;gap:10px;margin:14px 0 26px;max-width:520px}
  .tokbar input{flex:1}
  .err{color:#ff5c7c;margin:10px 0;min-height:1em}
  .statgrid{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));margin:6px 0 8px}
  .stat .v{font-size:1.95rem;font-weight:900;color:var(--accent2);letter-spacing:-.02em;line-height:1.1}
  .stat .l{color:var(--muted);font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;margin-top:4px}
  .fnl{display:flex;gap:14px;flex-wrap:wrap}
  .fnl .f{flex:1;min-width:140px;background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:14px 16px}
  .fnl .pct{font-size:1.5rem;font-weight:900;color:var(--green)}
  .fnl .lab{color:var(--muted);font-size:.8rem;margin-top:2px}
  .crumbs a{color:var(--accent2)}
</style></head><body>
<div class="wrap" style="padding-top:30px">
  <p class="crumbs"><a href="/dashboard">← Dashboard</a></p>
  <h1>Command center</h1>
  <p class="lede">Live state of the whole machine — assets, funnel, leads. Admin token required (saved locally).</p>
  <div class="tokbar">
    <input id="token" type="password" placeholder="x-admin-token" />
    <button class="btn btn-primary" id="load">Load</button>
  </div>
  <div id="err" class="err"></div>

  <div id="assets" class="statgrid"></div>

  <section><h2>Revenue readiness</h2><p class="muted">Configuration checks only. Passing does not confirm a successful live payment or Stripe webhook.</p><div id="readiness" class="card"><span class="muted">Load to view.</span></div></section>
  <section><h2>Conversion funnel</h2><div id="funnel" class="card fnl"><span class="muted">Load to view.</span></div></section>
  <section><h2>Paid fulfillment <span id="ordercount" class="muted"></span></h2><p class="muted">Only mark a paid fix complete after delivering it and recording an HTTPS evidence link. Verification is never granted at checkout.</p><div id="paid-orders" class="card"><span class="muted">Load to view.</span></div></section>
  <section><h2>Recent leads <span id="leadcount" class="muted" style="font-weight:400"></span></h2><div id="leadsWrap"><span class="muted">Load to view.</span></div></section>
  <section><h2>By day</h2><div id="byday"><span class="muted">Load to view.</span></div></section>

  <footer><a href="/mcp/leaderboard">Leaderboard</a><a href="/directory">Directory</a><a href="/">wmcp.sh</a></footer>
</div>

<script>
(function(){
  var ORIGIN=${JSON.stringify(origin)}, KEY="wmcp_admin_token";
  function $(id){return document.getElementById(id);}
  function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
  function n(x){return (x||0).toLocaleString();}
  function rel(ts){ if(!ts) return "—"; var s=(Date.now()-ts)/1000; if(s<60) return "just now"; if(s<3600) return Math.floor(s/60)+"m"; if(s<86400) return Math.floor(s/3600)+"h"; return Math.floor(s/86400)+"d"; }
  $("token").value=localStorage.getItem(KEY)||"";

  function statCard(v,l){ return '<div class="card stat"><div class="v">'+v+'</div><div class="l">'+l+'</div></div>'; }

  var paidOrders=[];
  function load(){
    var t=$("token").value.trim(); localStorage.setItem(KEY,t); $("err").textContent="";
    var h={headers:{"x-admin-token":t}};
    Promise.all([
      fetch(ORIGIN+"/api/v1/admin/metrics",h).then(function(r){return r.json().then(function(d){return{s:r.status,d:d};});}),
      fetch(ORIGIN+"/api/v1/admin/leads",h).then(function(r){return r.json().then(function(d){return{s:r.status,d:d};});}).catch(function(){return{s:0,d:{}};}),
      fetch(ORIGIN+"/api/v1/admin/revenue-readiness",h).then(function(r){return r.json().then(function(d){return{s:r.status,d:d};});}).catch(function(){return{s:0,d:{}};}),
      fetch(ORIGIN+"/api/v1/admin/paid-orders",h).then(function(r){return r.json().then(function(d){return{s:r.status,d:d};});}).catch(function(){return{s:0,d:{}};})
    ]).then(function(res){
      var mr=res[0], lr=res[1], rr=res[2], or=res[3];
      if(mr.s!==200){ $("err").textContent=(mr.d&&mr.d.error)||("Failed ("+mr.s+")"); return; }
      var m=mr.d, a=m.assets||{}, totals=m.totals||{}, funnel=m.funnel||{}, byDay=m.byDay||{};
      var leads=(lr.d&&lr.d.leads)||[], hot=(lr.d&&lr.d.hot)||0;

      // Secret-free, config-only sales preflight.
      if(rr.s===200 && rr.d && rr.d.checks){
        var checks=Object.keys(rr.d.checks).map(function(k){
          return '<div style="display:flex;justify-content:space-between;gap:12px;margin:5px 0"><span>'+esc(k.replace(/_/g," "))+'</span><strong style="color:'+(rr.d.checks[k]?'var(--green)':'var(--red)')+'">'+(rr.d.checks[k]?'set':'missing')+'</strong></div>';
        }).join("");
        var warnings=(rr.d.warnings||[]).map(function(w){return '<li>'+esc(w)+'</li>';}).join("");
        $("readiness").innerHTML='<p><strong>Subscriptions:</strong> '+(rr.d.subscriptions_configured?'configured':'incomplete')+' · <strong>Fix orders:</strong> '+(rr.d.agent_ready_fix_configured?'configured':'incomplete')+'</p>'+checks+(warnings?'<ul>'+warnings+'</ul>':'<p class="muted">No missing settings detected. Test a real checkout before launch.</p>');
      } else {
        $("readiness").textContent="Could not load readiness checks. Confirm the admin token and endpoint.";
      }

      // Paid order queue (trusted operator access only).
      paidOrders=or.s===200 ? (or.d.orders||[]) : [];
      $("ordercount").textContent=or.s===200?"("+or.d.pending_count+" pending)":"";
      if(or.s!==200) $("paid-orders").textContent="Could not load orders.";
      else if(!paidOrders.length) $("paid-orders").textContent="No paid fulfillment orders found.";
      else {
        var rows=paidOrders.slice(0,25).map(function(o,i){
          var pending=o.kind==="agent_ready_fix"&&o.status==="paid_pending_fulfillment";
          return "<tr><td>"+esc(o.kind)+"</td><td>"+esc(o.site_url)+"</td><td>"+esc(o.email)+"</td><td>"+esc(o.status)+"</td><td>"+(pending?'<button class="btn btn-ghost" data-complete="'+i+'">Mark delivered</button>':"—")+"</td></tr>";
        }).join("");
        $("paid-orders").innerHTML='<table class="tbl"><thead><tr><th>Kind</th><th>Site</th><th>Email</th><th>Status</th><th>Fulfillment</th></tr></thead><tbody>'+rows+'</tbody></table>';
      }

      // asset + headline cards
      $("assets").innerHTML=
        statCard(n(a.cached_urls),"URLs cached")+
        statCard(n(a.directory_sites),"Directory sites")+
        statCard(n(a.graded_servers),"MCP servers graded")+
        statCard(n(a.grade_queue),"Grade queue")+
        statCard(n(leads.length),"Leads captured")+
        statCard(n(hot),"Hot leads")+
        statCard(n(totals.checkout_started),"Checkouts")+
        statCard(n(totals.paid),"Paid");

      // funnel
      function pct(v){return v==null?"—":v+"%";}
      $("funnel").innerHTML=
        '<div class="f"><div class="pct">'+pct(funnel.probe_to_activated_pct)+'</div><div class="lab">probe → activated</div></div>'+
        '<div class="f"><div class="pct">'+pct(funnel.activated_to_checkout_pct)+'</div><div class="lab">activated → checkout</div></div>'+
        '<div class="f"><div class="pct">'+pct(funnel.checkout_to_paid_pct)+'</div><div class="lab">checkout → paid</div></div>'+
        '<div class="f"><div class="pct">'+pct(funnel.probe_to_checkout_pct)+'</div><div class="lab">probe → checkout</div></div>';

      // leads
      $("leadcount").textContent=leads.length?("("+leads.length+", "+hot+" hot)"):"";
      if(!leads.length){ $("leadsWrap").innerHTML='<div class="card muted">No leads captured yet.</div>'; }
      else {
        var rows=leads.slice(0,30).map(function(l){
          return "<tr><td class=\\"dim\\">"+rel(l.ts)+"</td><td>"+esc(l.email)+"</td><td class=\\"dim\\">"+esc(l.package||"")+"</td><td>"+esc(l.use_case||l.site_url||"")+"</td><td class=\\"num\\">"+(l.score||0)+"</td></tr>";
        }).join("");
        $("leadsWrap").innerHTML='<table class="tbl"><thead><tr><th>When</th><th>Email</th><th>Plan</th><th>Context</th><th class="num">Score</th></tr></thead><tbody>'+rows+'</tbody></table>';
      }

      // by day
      var days=Object.keys(byDay).sort().reverse();
      if(!days.length){ $("byday").innerHTML='<div class="card muted">No events yet.</div>'; }
      else {
        var trs=days.map(function(day){ var r=byDay[day]||{}; return "<tr><td>"+day+"</td><td class=\\"num\\">"+(r.u_view||0)+"</td><td class=\\"num\\">"+(r.directory_view||0)+"</td><td class=\\"num\\">"+(r.probe_run||0)+"</td><td class=\\"num\\">"+(r.activated||0)+"</td><td class=\\"num\\">"+(r.checkout_started||0)+"</td><td class=\\"num\\">"+(r.paid||0)+"</td></tr>"; }).join("");
        $("byday").innerHTML='<table class="tbl"><thead><tr><th>Day</th><th class="num">/u</th><th class="num">/dir</th><th class="num">probe</th><th class="num">activated</th><th class="num">checkout</th><th class="num">paid</th></tr></thead><tbody>'+trs+'</tbody></table>';
      }
    }).catch(function(e){ $("err").textContent=String(e); });
  }
  $("paid-orders").addEventListener("click",function(ev){
    var button=ev.target.closest("button[data-complete]");
    if(!button)return;
    var o=paidOrders[Number(button.getAttribute("data-complete"))];
    if(!o||o.kind!=="agent_ready_fix"||o.status!=="paid_pending_fulfillment")return;
    var proof=prompt("HTTPS link to the delivered integration, PR, or handoff evidence:");
    if(!proof)return;
    if(!/^https:\/\//i.test(proof)){alert("An HTTPS evidence URL is required.");return;}
    if(!confirm("Confirm the work is delivered to this customer. This will mark the site Verified."))return;
    button.disabled=true;
    fetch(ORIGIN+"/api/v1/admin/paid-fixes/complete",{
      method:"POST",headers:{"content-type":"application/json","x-admin-token":$("token").value.trim()},
      body:JSON.stringify({order_key:o.order_key,evidence_url:proof})
    }).then(function(r){return r.json().then(function(d){if(!r.ok)throw Error(d.error||"Fulfillment failed");return d;});})
      .then(function(){load();}).catch(function(e){alert(e.message);button.disabled=false;});
  });
  $("load").addEventListener("click",load);
  if($("token").value) load();
})();
</script>
</body></html>`;
}
