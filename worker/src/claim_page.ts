// claim_page.ts — /directory/claim
//
// Customer-facing UI for the self-serve "Agent-Ready Verified" badge:
//   1. sign in (GitHub) → 2. enter your site URL → 3. copy a <meta> tag and
//   add it to your site → 4. Verify → 5. subscribe (Stripe Checkout).
//
// Calls the backend wired in directory_claim.ts + stripe.ts:
//   GET  /api/v1/directory/claim/start?url=
//   POST /api/v1/directory/claim/verify
//   POST /api/v1/directory/verified/checkout
//
// Embedded JS avoids backticks (would close the outer template literal — see
// AGENTS.md §6) and uses string concatenation throughout.

export function claimPageHtml(origin: string): string {
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8" />
<title>Claim & verify your listing · wmcp.sh</title>
<meta name="robots" content="noindex" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  :root{--bg:#0a0a0f;--card:#16161f;--border:#26263a;--text:#e8e8f0;--muted:#9a9ab0;--accent:#7c5cff;--accent2:#00e5ff;--green:#4ade80;--red:#ff5c7c}
  *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:16px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif}
  .wrap{max-width:680px;margin:0 auto;padding:48px 22px}
  a{color:var(--accent2);text-decoration:none}a:hover{text-decoration:underline}
  h1{font-size:1.8rem;letter-spacing:-.02em;margin:0 0 6px}
  .lede{color:var(--muted);margin:0 0 26px}
  .step{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:20px 22px;margin:14px 0;opacity:.5;transition:opacity .2s}
  .step.active{opacity:1;border-color:var(--accent)}
  .step.done{opacity:1;border-color:var(--green)}
  .step h3{margin:0 0 10px;font-size:1.05rem}
  .step .n{display:inline-block;width:24px;height:24px;border-radius:50%;background:var(--accent);color:#0c0c14;text-align:center;line-height:24px;font-weight:800;font-size:.8rem;margin-right:8px}
  input[type=text]{width:100%;padding:11px 13px;border-radius:9px;border:1px solid var(--border);background:#0f0f18;color:var(--text);font:inherit}
  button{cursor:pointer;border:0;border-radius:9px;padding:11px 18px;font:inherit;font-weight:700;background:linear-gradient(135deg,var(--accent),var(--accent2));color:#0c0c14;margin-top:12px}
  button:disabled{opacity:.5;cursor:default}
  pre{background:#0f0f18;border:1px solid var(--border);border-radius:9px;padding:12px;overflow:auto;font-size:.82rem;color:var(--accent2);white-space:pre-wrap;word-break:break-all}
  .msg{margin-top:10px;font-size:.9rem}
  .err{color:var(--red)}.ok{color:var(--green)}
  .back{color:var(--muted);font-size:.85rem}
</style></head><body><div class="wrap">
<a class="back" href="/directory">← Directory</a>
<h1>Get the Agent-Ready Verified badge</h1>
<p class="lede">Prove you control your domain, then subscribe. The badge auto-reverts to "Indexed" if your tools stop resolving — so it means something.</p>

<div id="signin" class="step" style="display:none">
  <h3>Sign in</h3>
  <p class="muted">You need an account to prove ownership.</p>
  <a href="/api/v1/auth/github/start"><button>Sign in with GitHub</button></a>
</div>

<div id="s1" class="step active">
  <h3><span class="n">1</span>Your site</h3>
  <input id="url" type="text" placeholder="https://yourbrand.com" autocomplete="off" />
  <button id="startBtn">Get my verification tag →</button>
  <div id="m1" class="msg"></div>
</div>

<div id="s2" class="step">
  <h3><span class="n">2</span>Add this tag to your site &lt;head&gt;</h3>
  <pre id="metaTag"></pre>
  <p class="muted" style="font-size:.85rem">Add it to your homepage (or any page on that domain), deploy, then click Verify. Token valid 24h.</p>
  <button id="verifyBtn">I've added it — Verify ownership</button>
  <div id="m2" class="msg"></div>
</div>

<div id="s3" class="step">
  <h3><span class="n">3</span>Get verified</h3>
  <p class="muted">Ownership confirmed. Subscribe to flip your listing to <strong style="color:var(--green)">Verified</strong>.</p>
  <button id="buyBtn">Get the Verified badge →</button>
  <div id="m3" class="msg"></div>
</div>

<script>
var ORIGIN = ${JSON.stringify(origin)};
function $(id){return document.getElementById(id);}
function setMsg(id,text,cls){var e=$(id);e.textContent=text||"";e.className="msg "+(cls||"");}
function activate(stepId){
  ["s1","s2","s3"].forEach(function(s){var el=$(s);if(s===stepId){el.className="step active";}});
}
function markDone(stepId){$(stepId).className="step done";}

// Show sign-in prompt if not authenticated.
fetch(ORIGIN+"/api/v1/me",{credentials:"include"}).then(function(r){return r.json();}).then(function(d){
  if(!d || d.error || d.anonymous || (!d.user_id && !d.signed_in)){ $("signin").style.display="block"; }
}).catch(function(){});

var currentUrl="";

$("startBtn").addEventListener("click",function(){
  var url=$("url").value.trim();
  if(!url){setMsg("m1","Enter your site URL.","err");return;}
  currentUrl=url;
  $("startBtn").disabled=true;setMsg("m1","Checking…","");
  fetch(ORIGIN+"/api/v1/directory/claim/start?url="+encodeURIComponent(url),{credentials:"include"})
    .then(function(r){return r.json().then(function(d){return {status:r.status,d:d};});})
    .then(function(res){
      $("startBtn").disabled=false;
      var d=res.d;
      if(res.status===401){ $("signin").style.display="block"; setMsg("m1","Sign in first, then try again.","err"); return; }
      if(res.status===409){ setMsg("m1",d.hint||"This domain is already claimed by another account.","err"); return; }
      if(d.already_owner){ setMsg("m1","You already own "+d.hostname+".","ok"); markDone("s1"); activate("s3"); return; }
      if(!d.meta_tag){ setMsg("m1",d.error||"Couldn't start the claim.","err"); return; }
      $("metaTag").textContent=d.meta_tag;
      setMsg("m1","Verification tag ready for "+d.hostname+".","ok");
      markDone("s1"); activate("s2");
    }).catch(function(e){$("startBtn").disabled=false;setMsg("m1",String(e),"err");});
});

$("verifyBtn").addEventListener("click",function(){
  $("verifyBtn").disabled=true;setMsg("m2","Fetching your site and checking the tag…","");
  fetch(ORIGIN+"/api/v1/directory/claim/verify",{
    method:"POST",credentials:"include",
    headers:{"content-type":"application/json"},
    body:JSON.stringify({url:currentUrl})
  }).then(function(r){return r.json().then(function(d){return {status:r.status,d:d};});})
    .then(function(res){
      $("verifyBtn").disabled=false;
      if(res.status===200 && res.d.ok){ setMsg("m2","Ownership verified ✓","ok"); markDone("s2"); activate("s3"); return; }
      setMsg("m2",res.d.hint||res.d.error||"Verification failed. Make sure the tag is live and retry.","err");
    }).catch(function(e){$("verifyBtn").disabled=false;setMsg("m2",String(e),"err");});
});

$("buyBtn").addEventListener("click",function(){
  $("buyBtn").disabled=true;setMsg("m3","Opening checkout…","");
  fetch(ORIGIN+"/api/v1/directory/verified/checkout",{
    method:"POST",credentials:"include",
    headers:{"content-type":"application/json"},
    body:JSON.stringify({url:currentUrl})
  }).then(function(r){return r.json().then(function(d){return {status:r.status,d:d};});})
    .then(function(res){
      if(res.d && res.d.url){ window.location.href=res.d.url; return; }
      $("buyBtn").disabled=false;
      if(res.status===503){ setMsg("m3","Self-serve checkout isn't switched on yet — email support or see /managed.","err"); return; }
      setMsg("m3",res.d.hint||res.d.error||"Couldn't start checkout.","err");
    }).catch(function(e){$("buyBtn").disabled=false;setMsg("m3",String(e),"err");});
});
</script>
</div></body></html>`;
}
