// outreach_ui.ts — the sending cockpit. A page served on wmcp.sh that pulls the
// live campaign from /api/v1/admin/outreach (same-origin, so no CORS) and lays
// each lead out as a card: the personalized subject + body with copy buttons,
// the public report link, contact-finder links, and a "mark sent" tracker
// (localStorage). Paste your admin token once; it is stored in your browser only.
// The page itself is harmless without the token (no data loads).
//
// Route: GET /admin/outreach

export function outreachSenderHtml(origin: string): string {
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="robots" content="noindex"/>
<title>Outreach cockpit · wmcp.sh</title>
<style>
  :root{--bg:#0a0a12;--card:#16161f;--bg2:#11111c;--border:#26263a;--text:#ececf5;--muted:#8a8aa8;--accent:#ff9e2c;--accent2:#ffcf7a;--green:#4ade80;--red:#ff5c7c}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif;line-height:1.5;padding:28px 18px 80px}
  .wrap{max-width:820px;margin:0 auto}
  h1{font-size:1.5rem;margin:0 0 4px;background:linear-gradient(90deg,var(--accent),var(--accent2));-webkit-background-clip:text;background-clip:text;color:transparent}
  .sub{color:var(--muted);font-size:.9rem;margin:0 0 18px}
  .bar{display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:14px}
  .bar label{font-size:.72rem;color:var(--muted);display:block}
  .bar input,.bar select{display:block;margin-top:3px;background:var(--bg2);border:1px solid var(--border);color:var(--text);border-radius:8px;padding:8px 10px;font-size:.9rem;font-family:inherit}
  .bar input.tok{min-width:240px}
  .btn{background:var(--accent);color:#2a1500;border:none;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;font-family:inherit;font-size:.9rem}
  .btn.ghost{background:var(--bg2);color:var(--text);border:1px solid var(--border)}
  .prog{color:var(--muted);font-size:.85rem;margin:0 0 14px}
  .card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:15px 17px;margin:0 0 12px}
  .card.sent{opacity:.45}
  .chead{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px}
  .g{font-weight:800;border:1px solid;border-radius:6px;padding:1px 7px;font-size:.8rem}
  .host{font-weight:700} .host a{color:var(--text);text-decoration:none} .host a:hover{color:var(--accent2)}
  .cat{font-size:.74rem;color:var(--muted);background:var(--bg2);border:1px solid var(--border);border-radius:999px;padding:1px 8px}
  .find{font-size:.8rem;margin:6px 0 10px}
  .find a{color:var(--accent2);margin-right:12px;text-decoration:none}
  .blk{position:relative;background:var(--bg2);border:1px solid var(--border);border-radius:9px;padding:11px 13px;margin:8px 0;white-space:pre-wrap;word-break:break-word;font-size:.88rem}
  .blk .lbl{display:block;font-size:.68rem;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:5px}
  .copy{position:absolute;top:7px;right:7px;background:var(--accent);color:#2a1500;border:none;border-radius:6px;padding:3px 10px;font-size:.76rem;font-weight:700;cursor:pointer}
  .mark{margin-top:4px}
  .msg{color:var(--muted);font-size:.9rem;margin:10px 0}
  .msg.err{color:var(--red)}
</style></head><body>
<div class="wrap">
  <h1>Outreach cockpit</h1>
  <p class="sub">Pulls the live campaign from your grade graph. Copy each email, find the contact, send, mark it. Your token is stored in this browser only.</p>
  <div class="bar">
    <div><label>Admin token</label><input class="tok" id="tok" type="password" placeholder="ADMIN_TOKEN"/></div>
    <div><label>Segment</label><select id="seg"><option value="audit">audit (F-graders)</option><option value="verified">verified (A-graders)</option></select></div>
    <div><label>Max</label><input id="max" type="number" value="30" min="1" max="60" style="width:72px"/></div>
    <button class="btn" id="load">Load campaign</button>
  </div>
  <p class="prog" id="prog"></p>
  <div id="list"></div>
</div>
<script>
(function(){
  var $=function(id){return document.getElementById(id)};
  var tok=$("tok"); tok.value=localStorage.getItem("qc_admin_tok")||"";
  tok.addEventListener("input",function(){localStorage.setItem("qc_admin_tok",tok.value.trim())});
  var GCOLOR={"A+":"#4ade80","A":"#4ade80","A-":"#86efac","B+":"#bef264","B":"#facc15","B-":"#fbbf24","C+":"#fb923c","C":"#fb923c","C-":"#f97316","D":"#f87171","F":"#ef4444"};
  function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]})}
  function sentKey(h){return "qc_sent:"+h}
  function copyBtn(text){
    var b=document.createElement("button");b.className="copy";b.textContent="Copy";
    b.onclick=function(){navigator.clipboard.writeText(text).then(function(){b.textContent="Copied!";setTimeout(function(){b.textContent="Copy"},1200)}).catch(function(){})};
    return b;
  }
  function block(label,text){
    var d=document.createElement("div");d.className="blk";
    var l=document.createElement("span");l.className="lbl";l.textContent=label;
    var t=document.createElement("span");t.textContent=text;
    d.appendChild(copyBtn(text));d.appendChild(l);d.appendChild(t);return d;
  }
  function render(rows){
    var list=$("list");list.innerHTML="";var sent=0;
    rows.forEach(function(r){
      var isSent=localStorage.getItem(sentKey(r.host))==="1";if(isSent)sent++;
      var c=document.createElement("div");c.className="card"+(isSent?" sent":"");
      var color=GCOLOR[r.grade]||"#8a8aa8";
      var dom=r.domain||r.host;
      c.innerHTML='<div class="chead">'
        +'<span class="g" style="color:'+color+';border-color:'+color+'55">'+esc(r.grade)+'</span>'
        +'<span class="host"><a href="'+esc(r.report_url)+'" target="_blank" rel="noopener">'+esc(r.host)+'</a></span>'
        +'<span class="cat">'+esc(r.category||"")+' · '+(r.score!=null?r.score:"")+'</span></div>'
        +'<div class="find">find contact: '
        +'<a target="_blank" rel="noopener" href="https://www.google.com/search?q='+encodeURIComponent(dom+" founder OR contact email")+'">Google</a>'
        +'<a target="_blank" rel="noopener" href="https://www.linkedin.com/search/results/people/?keywords='+encodeURIComponent(dom)+'">LinkedIn</a>'
        +'<a href="mailto:hello@'+esc(dom)+'">hello@</a>'
        +'<a href="mailto:security@'+esc(dom)+'">security@</a>'
        +'<a target="_blank" rel="noopener" href="'+esc(r.report_url)+'">report</a></div>';
      c.appendChild(block("Subject",r.subject||""));
      c.appendChild(block("Body",r.body||""));
      var m=document.createElement("button");m.className="btn ghost mark";
      m.textContent=isSent?"✓ sent (undo)":"Mark sent";
      m.onclick=function(){
        var now=localStorage.getItem(sentKey(r.host))==="1";
        if(now){localStorage.removeItem(sentKey(r.host))}else{localStorage.setItem(sentKey(r.host),"1")}
        render(rows);
      };
      c.appendChild(m);
      list.appendChild(c);
    });
    $("prog").textContent=sent+" / "+rows.length+" marked sent";
  }
  $("load").addEventListener("click",function(){
    var t=tok.value.trim();if(!t){$("prog").innerHTML='<span class="err" style="color:var(--red)">Enter your admin token.</span>';return;}
    $("prog").textContent="Loading…";
    fetch("/api/v1/admin/outreach?segment="+$("seg").value+"&max="+($("max").value||30)+"&format=json",{headers:{"x-admin-token":t}})
      .then(function(res){if(res.status===401){throw new Error("Unauthorized — check the token.");}return res.json();})
      .then(function(d){var rows=d.rows||[];if(!rows.length){$("prog").textContent="No leads in this segment.";$("list").innerHTML="";return;}render(rows);})
      .catch(function(e){$("prog").innerHTML='<span style="color:var(--red)">'+esc(e.message||"Failed to load")+'</span>';});
  });
})();
</script>
</body></html>`;
}
