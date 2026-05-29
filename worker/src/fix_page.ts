// fix_page.ts — /agent-ready/fix
//
// The diagnostic wedge: run the free 5-tier probe live in the browser, show the
// prospect exactly what an agent can/can't do on their site today, then sell
// the one-time fix via Stripe Checkout (mode=payment).
//
// Calls /api/v1/tools?url= (the free probe) and /api/v1/agent-ready/fix/checkout
// (createFixCheckout in stripe.ts). Embedded JS is backtick-free (AGENTS.md §6).

export function fixPageHtml(origin: string): string {
  const ld = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Agent-Ready Audit + Fix",
    description:
      "Run a free agent-readiness probe on any URL, then have wmcp.sh fix the gaps so AI agents can find and act on your site.",
    provider: { "@type": "Organization", name: "WebMCP Anything", url: origin },
    areaServed: "Worldwide",
  };
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8" />
<title>Is your site agent-ready? Free probe + done-for-you fix · wmcp.sh</title>
<meta name="description" content="Paste your URL: wmcp.sh runs its 5-tier probe and shows exactly what an AI agent can and can't do on your site right now. Fix the gaps with one click." />
<link rel="canonical" href="${origin}/agent-ready/fix" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta property="og:title" content="Is your site agent-ready? Free probe + fix" />
<meta property="og:description" content="See what an agent can do on your site today, then fix the gaps." />
<meta property="og:url" content="${origin}/agent-ready/fix" />
<meta property="og:image" content="${origin}/og.svg" />
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<style>
  :root{--bg:#0a0a0f;--card:#16161f;--border:#26263a;--text:#e8e8f0;--muted:#9a9ab0;--accent:#ff9e2c;--accent2:#ffcf7a;--green:#4ade80;--amber:#ffb84d;--red:#ff5c7c}
  *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:16px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif}
  .wrap{max-width:720px;margin:0 auto;padding:48px 22px}
  a{color:var(--accent2);text-decoration:none}a:hover{text-decoration:underline}
  h1{font-size:2rem;letter-spacing:-.02em;margin:0 0 8px}
  .lede{color:var(--muted);margin:0 0 24px;max-width:620px}
  .probe{display:flex;gap:10px;flex-wrap:wrap}
  input[type=text],input[type=email]{flex:1;min-width:240px;padding:12px 14px;border-radius:10px;border:1px solid var(--border);background:#0f0f18;color:var(--text);font:inherit}
  button{cursor:pointer;border:0;border-radius:10px;padding:12px 20px;font:inherit;font-weight:700;background:linear-gradient(135deg,var(--accent),var(--accent2));color:#0c0c14}
  button:disabled{opacity:.5;cursor:default}
  .result{margin-top:22px;background:var(--card);border:1px solid var(--border);border-radius:14px;padding:22px;display:none}
  .verdict{font-size:1.1rem;font-weight:700;margin:0 0 6px}
  .tools{margin:12px 0 0;padding-left:18px;color:var(--muted);font-size:.9rem}
  .cta{margin-top:20px;background:var(--card);border:1px solid var(--accent);border-radius:14px;padding:22px;display:none}
  .cta h3{margin:0 0 8px}
  .row{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}
  .msg{margin-top:10px;font-size:.9rem}.err{color:var(--red)}.ok{color:var(--green)}.warn{color:var(--amber)}
  .muted{color:var(--muted)}.back{color:var(--muted);font-size:.85rem}
  .spin{color:var(--muted)}
</style></head><body><div class="wrap">
<a class="back" href="/agent-ready">← Agent-ready</a>
<h1>Can an AI agent actually use your site?</h1>
<p class="lede">Paste your URL. We run the same 5-tier probe agents use and show you what's callable today — then fix the gaps for you.</p>

<div class="probe">
  <input id="url" type="text" placeholder="https://yourbrand.com/products/best-seller" autocomplete="off" />
  <button id="probeBtn">Run the free probe</button>
</div>
<div id="m" class="msg"></div>

<div id="result" class="result">
  <p id="verdict" class="verdict"></p>
  <div id="detail" class="muted"></div>
  <ul id="toolList" class="tools"></ul>
</div>

<div id="cta" class="cta">
  <h3>Want us to fix this for you?</h3>
  <p class="muted">Fixed-scope audit + schema/adapter deploy so agents can find and act on your site. Delivered in ~5 business days; your listing flips to <strong style="color:var(--green)">Verified</strong> on fulfillment.</p>
  <div class="row">
    <input id="email" type="email" placeholder="you@company.com" />
    <button id="buyBtn">Fix my gaps →</button>
  </div>
  <div id="m2" class="msg"></div>
  <p class="muted" style="font-size:.82rem;margin-top:12px">Prefer to talk first? <a href="/managed">See /managed</a>.</p>
</div>

<script>
var ORIGIN = ${JSON.stringify(origin)};
function $(id){return document.getElementById(id);}
var probedUrl="";

$("probeBtn").addEventListener("click",function(){
  var url=$("url").value.trim();
  if(!url){$("m").textContent="Enter a URL.";$("m").className="msg err";return;}
  if(!/^https?:\\/\\//.test(url)){url="https://"+url;}
  probedUrl=url;
  $("probeBtn").disabled=true;$("m").textContent="Probing "+url+" …";$("m").className="msg spin";
  $("result").style.display="none";$("cta").style.display="none";
  fetch(ORIGIN+"/api/v1/tools?url="+encodeURIComponent(url))
    .then(function(r){return r.json();})
    .then(function(d){
      $("probeBtn").disabled=false;$("m").textContent="";
      var tools=(d&&d.tools)||[];
      var adapter=d&&d.adapter?d.adapter:"none";
      $("result").style.display="block";$("cta").style.display="block";
      if(tools.length>0){
        $("verdict").textContent="Partly ready — "+tools.length+" tool"+(tools.length===1?"":"s")+" found";
        $("verdict").style.color="var(--amber)";
        $("detail").innerHTML="Detected via the <strong>"+adapter+"</strong> tier. Agents can call these — but coverage, auth, and write actions are usually incomplete without a tuned adapter:";
        var ul=$("toolList");ul.innerHTML="";
        tools.slice(0,8).forEach(function(t){var li=document.createElement("li");li.textContent=(t.name||"tool")+(t.description?" — "+String(t.description).slice(0,80):"");ul.appendChild(li);});
      } else {
        $("verdict").textContent="Not agent-ready yet — 0 callable tools";
        $("verdict").style.color="var(--red)";
        $("detail").textContent="Our probe found no structured data, OpenAPI spec, or recognized provider an agent could act on. Right now an AI agent can read your page as text but can't transact.";
        $("toolList").innerHTML="";
      }
    }).catch(function(e){$("probeBtn").disabled=false;$("m").textContent=String(e);$("m").className="msg err";});
});

$("buyBtn").addEventListener("click",function(){
  var email=$("email").value.trim();
  if(!email||!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)){$("m2").textContent="Enter a valid email.";$("m2").className="msg err";return;}
  if(!probedUrl){$("m2").textContent="Run the probe first.";$("m2").className="msg err";return;}
  $("buyBtn").disabled=true;$("m2").textContent="Opening checkout…";$("m2").className="msg spin";
  fetch(ORIGIN+"/api/v1/agent-ready/fix/checkout",{
    method:"POST",headers:{"content-type":"application/json"},
    body:JSON.stringify({url:probedUrl,email:email})
  }).then(function(r){return r.json().then(function(d){return {status:r.status,d:d};});})
    .then(function(res){
      if(res.d&&res.d.url){window.location.href=res.d.url;return;}
      $("buyBtn").disabled=false;
      if(res.status===503){$("m2").textContent="Instant checkout isn't switched on yet — see /managed to get started.";$("m2").className="msg err";return;}
      $("m2").textContent=(res.d&&(res.d.hint||res.d.error))||"Couldn't start checkout.";$("m2").className="msg err";
    }).catch(function(e){$("buyBtn").disabled=false;$("m2").textContent=String(e);$("m2").className="msg err";});
});
</script>
</div></body></html>`;
}
