// leads_page.ts — operator-only view of the buyer-finding funnel.
//
// Server-rendered shell + a sprinkle of JS that calls /api/v1/admin/leads with
// the admin token from a prompt(). Not linked anywhere public; visit
// /dashboard/leads and paste the token. This is the "who do I email first" view:
// real accounts ranked by warmth (proxy traffic + governance intent + breadth).
export function leadsPageHtml(): string {
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<title>wmcp — leads</title>
<style>
  :root { --bg:#07070d; --card:#16161f; --bg2:#11111c; --border:#26263a; --text:#ececf5; --muted:#8a8aa8; --accent:#ff9e2c; --green:#4ade80; --red:#f87171; }
  *{box-sizing:border-box} body{margin:0;background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif;line-height:1.5}
  .wrap{max-width:1000px;margin:0 auto;padding:40px 24px}
  h1{font-size:1.6rem;margin:0 0 4px;background:linear-gradient(90deg,#fff,var(--accent));-webkit-background-clip:text;background-clip:text;color:transparent}
  .muted{color:var(--muted)}
  .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin:18px 0}
  .card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px}
  .card .label{color:var(--muted);font-size:.72rem;text-transform:uppercase;letter-spacing:.08em}
  .card .val{font-size:1.6rem;font-weight:800;margin-top:4px}
  table{width:100%;border-collapse:collapse;margin-top:8px;font-size:.84rem}
  th{text-align:left;color:var(--muted);font-weight:600;font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;padding:8px 10px;border-bottom:1px solid var(--border)}
  td{padding:8px 10px;border-bottom:1px solid var(--bg2);vertical-align:top}
  .mono{font-family:"SF Mono",Menlo,monospace}
  .score{font-weight:800}
  .hot{color:var(--green)} .warm{color:var(--accent)} .cold{color:var(--muted)}
  .why{color:var(--muted);font-size:.78rem}
  .pill{display:inline-block;padding:2px 8px;border-radius:999px;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;background:rgba(255,158,44,.15);color:var(--accent)}
  .pill.free{background:rgba(138,138,168,.18);color:var(--muted)}
  a{color:var(--accent)}
</style></head>
<body><div class="wrap">
<h1>Leads</h1>
<p class="muted">Real accounts ranked by warmth — proxy traffic, governance intent, tool breadth. The people to talk to first. Operator-only.</p>
<div class="cards" id="cards" style="display:none"></div>
<div id="status" class="muted">Loading… (you'll be asked for the admin token)</div>
<table id="tbl" style="display:none"><thead><tr>
  <th>Score</th><th>Account</th><th>Email</th><th>Plan</th><th>Calls (14d)</th><th>Tools</th><th>Signals</th>
</tr></thead><tbody id="rows"></tbody></table>
<script>
var $=function(id){return document.getElementById(id)};
function cls(s){ return s>=30?"hot":s>=10?"warm":"cold" }
function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(m){return ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[m]}) }
(function(){
  var tok = sessionStorage.getItem("wmcp_admin") || prompt("Admin token");
  if(!tok){ $("status").textContent="No token — reload to retry."; return; }
  sessionStorage.setItem("wmcp_admin", tok);
  fetch("/api/v1/admin/leads?window=14", { headers: { "x-admin-token": tok } })
    .then(function(r){ if(r.status===401){ sessionStorage.removeItem("wmcp_admin"); throw new Error("Bad admin token — reload to retry."); } return r.json(); })
    .then(function(d){
      var leads = d.leads||[];
      $("cards").style.display="grid";
      $("cards").innerHTML =
        card("Accounts", d.scanned||0) +
        card("Active (calls>0)", d.active||0) +
        card("Hot (score≥30)", d.hot||0) +
        card("Window", (d.window_days||14)+"d");
      if(!leads.length){ $("status").textContent="No accounts yet."; return; }
      $("status").style.display="none";
      $("tbl").style.display="table";
      $("rows").innerHTML = leads.map(function(l){
        return "<tr>"+
          "<td class='score "+cls(l.score)+"'>"+l.score+"</td>"+
          "<td class='mono'>"+esc(l.user_id)+"</td>"+
          "<td class='mono'>"+(l.email?("<a href='mailto:"+esc(l.email)+"'>"+esc(l.email)+"</a>"):"<span class='cold'>—</span>")+"</td>"+
          "<td><span class='pill "+(l.plan==='free'?'free':'')+"'>"+esc(l.plan)+"</span></td>"+
          "<td>"+l.calls_recent+(l.active_days?(" <span class='why'>/"+l.active_days+"d</span>"):"")+"</td>"+
          "<td>"+(l.connections&&l.connections.length?esc(l.connections.join(", ")):"<span class='cold'>—</span>")+"</td>"+
          "<td class='why'>"+esc((l.why||[]).join(" · "))+"</td>"+
        "</tr>";
      }).join("");
    })
    .catch(function(e){ $("status").textContent=String(e.message||e); });
  function card(label,val){ return "<div class='card'><div class='label'>"+label+"</div><div class='val'>"+val+"</div></div>" }
})();
</script>
</div></body></html>`;
}
