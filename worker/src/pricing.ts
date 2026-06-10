// pricing.ts — standalone /pricing page.
//
// Why this exists: "wmcp pricing" / "mcp proxy pricing" is a high-intent query
// and /pricing is the URL people type, link, and point ads/outreach at. Before
// this, pricing lived only at /#pricing (a homepage anchor) so /pricing 404'd.
//
// TWO locked ladders, kept visually separate (never conflated — see AGENTS.md):
//   (a) Self-serve API plans: Free / Builder $39 / Pro $99 / Reseller $299  (→ Stripe checkout)
//   (b) Done-for-you /managed: Starter $499 one-time / Managed Retainer $999/mo / Enterprise $4,999+/mo
// The behavioral A–F trust grade is and stays FREE — never priced here.

import { uiCss, uiNav } from "./ui";

interface Plan {
  name: string;
  price: string;
  per?: string;
  blurb: string;
  feats: string[];
  cta: string;
  plan?: string;   // data-plan → inline Stripe checkout
  href?: string;   // static link instead of checkout
  featured?: boolean;
}

const SELF_SERVE: Plan[] = [
  { name: "Free", price: "$0", per: "/mo", blurb: "Read any site's tools + the shared cache.", feats: ["100 reads / day", "50 cache pushes / day", "No live execute", "Open-source adapters"], cta: "Use anonymously →", href: "/dashboard" },
  { name: "Builder", price: "$39", per: "/mo", blurb: "The jump from free — live execute.", feats: ["2,000 reads / day", "200 live executes / day", "1,000 cache pushes / day", "Shopify add_to_cart"], cta: "Start building →", plan: "builder", featured: true },
  { name: "Pro", price: "$99", per: "/mo", blurb: "For agents in production.", feats: ["10,000 reads / day", "1,000 live executes / day", "5,000 cache pushes / day", "Priority cache freshness"], cta: "Upgrade →", plan: "pro" },
  { name: "Reseller", price: "$299", per: "/mo", blurb: "High volume + headless.", feats: ["100,000 reads / day", "50,000 executes / day", "Restock webhooks (coming)", "Email support"], cta: "Upgrade →", plan: "reseller" },
];

const MANAGED: Plan[] = [
  { name: "Starter", price: "$499", per: " one-time", blurb: "We make one site agent-ready for you.", feats: ["Adapter built + deployed", "Verified on a live agent", "Handover docs"], cta: "Start a project →", href: "/managed" },
  { name: "Managed Retainer", price: "$999", per: "/mo", blurb: "We run + watch your connections.", feats: ["Ongoing adapters + fixes", "Drift & rug-pull monitoring", "Priority support"], cta: "Talk to us →", href: "/managed", featured: true },
  { name: "Enterprise", price: "$4,999+", per: "/mo", blurb: "Custom scope, SLA, security review.", feats: ["Dedicated build capacity", "SLA + security review", "Private deployment options"], cta: "Contact →", href: "/managed" },
];

function card(p: Plan): string {
  const btn = p.href
    ? `<a class="btn ${p.featured ? "btn-primary" : "btn-ghost"}" href="${p.href}">${p.cta}</a>`
    : `<button class="btn ${p.featured ? "btn-primary" : "btn-ghost"} pick" data-plan="${p.plan}">${p.cta}</button>`;
  return `<div class="pcard${p.featured ? " featured" : ""}">
    <h3>${p.name}</h3>
    <div class="pprice">${p.price}<small>${p.per || ""}</small></div>
    <div class="pblurb">${p.blurb}</div>
    <ul>${p.feats.map((f) => `<li>${f}</li>`).join("")}</ul>
    ${btn}
  </div>`;
}

export function pricingPageHtml(origin: string): string {
  const offers = [...SELF_SERVE, ...MANAGED]
    .filter((p) => p.price !== "$0")
    .map((p) => ({ "@type": "Offer", name: `wmcp.sh ${p.name}`, price: p.price.replace(/[$,+]/g, ""), priceCurrency: "USD", url: `${origin}/pricing` }));
  const jsonld = JSON.stringify({
    "@context": "https://schema.org", "@type": "Product",
    name: "wmcp.sh — agent-callable tools for any website",
    description: "Turn any URL into agent-callable MCP tools. Self-serve API plans and a done-for-you managed service. The independent A–F MCP trust grade is free.",
    brand: { "@type": "Organization", name: "wmcp.sh" },
    offers,
  }).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");

  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Pricing — wmcp.sh | self-serve API plans + managed service</title>
<meta name="description" content="wmcp.sh pricing: self-serve API plans (Free, Builder $39/mo, Pro $99/mo, Reseller $299/mo) plus a done-for-you managed service from $499. The independent A–F MCP trust grade is always free."/>
<link rel="canonical" href="${origin}/pricing"/>
<meta property="og:title" content="wmcp.sh pricing"/>
<meta property="og:description" content="Self-serve API plans + done-for-you managed service. The independent MCP trust grade is free."/>
<meta property="og:url" content="${origin}/pricing"/>
<meta property="og:image" content="${origin}/og.svg"/>
<meta name="twitter:card" content="summary_large_image"/>
<script type="application/ld+json">${jsonld}</script>
<style>${uiCss(1040)}
  .lead{color:var(--muted);font-size:1.12rem;max-width:680px;margin:6px 0 8px}
  .ladder{margin:30px 0 8px}
  .ladder-h{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;margin-bottom:4px}
  .ladder-h h2{margin:0;font-size:1.3rem}
  .ladder-h .tag{color:var(--dim);font-size:.85rem}
  .pgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-top:16px}
  .pcard{background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:20px 18px;display:flex;flex-direction:column}
  .pcard.featured{border-color:rgba(255,158,44,.55);box-shadow:0 0 0 1px rgba(255,158,44,.25)}
  .pcard h3{margin:0 0 2px;font-size:1.06rem}
  .pprice{font-size:1.9rem;font-weight:800;letter-spacing:-.02em}.pprice small{font-size:.8rem;font-weight:500;color:var(--muted)}
  .pblurb{color:var(--muted);font-size:.88rem;margin:4px 0 10px}
  .pcard ul{list-style:none;margin:0 0 16px;padding:0;flex:1}
  .pcard li{color:var(--muted);font-size:.88rem;padding:5px 0 5px 20px;position:relative}
  .pcard li:before{content:"✓";position:absolute;left:0;color:var(--green);font-weight:800}
  .pcard .btn{width:100%;justify-content:center}
  .btn-primary{background:linear-gradient(135deg,var(--accent),var(--accent2));color:#2a1500}
  .btn-ghost{background:var(--bg2);color:var(--text);border:1px solid var(--border)}
  .freebox{background:rgba(74,222,128,.07);border:1px solid rgba(74,222,128,.3);border-radius:var(--r);padding:16px 18px;margin:26px 0;color:#bdf0cd;font-size:.92rem}
  #co{display:none;background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:18px 20px;margin:22px 0;max-width:520px}
  #co.show{display:block}
  #co .crow{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
  #co input{flex:1;min-width:220px;background:var(--bg2);border:1px solid var(--border);color:var(--text);border-radius:10px;padding:11px 14px;font-size:.92rem}
  #co-err{color:var(--red);font-size:.85rem;margin-top:8px;min-height:1em}
  footer{border-top:1px solid var(--border);margin-top:40px;padding:22px 0 60px;color:var(--muted);font-size:.88rem}
  footer a{color:var(--accent2)}
</style></head><body>
${uiNav(origin)}
<div class="wrap">
  <header style="padding:30px 0 4px">
    <h1>Pricing</h1>
    <p class="lead">Turn any website into agent-callable tools. Start free; pay to run live tool calls at scale — or have us build and run it for you.</p>
  </header>

  <div class="freebox">★ The independent A–F <a href="/mcp/grade">MCP trust grade</a> is free and identical whether or not you pay — we never charge for the grade. Paid plans are for using the API; the managed tiers are for done-for-you work.</div>

  <section class="ladder">
    <div class="ladder-h"><h2>Self-serve API</h2><span class="tag">pay as you scale · cancel anytime · API key tied to your email</span></div>
    <div class="pgrid">${SELF_SERVE.map(card).join("")}</div>
  </section>

  <div id="co">
    <strong id="co-title">Continue to checkout</strong>
    <p style="color:var(--muted);font-size:.86rem;margin:6px 0 0">Enter your email — your API key is tied to it so you can recover it anytime. No password.</p>
    <div class="crow">
      <input id="co-email" type="email" placeholder="you@company.com" />
      <button class="btn btn-primary" id="co-go">Continue →</button>
    </div>
    <div id="co-err"></div>
  </div>

  <section class="ladder">
    <div class="ladder-h"><h2>Done-for-you (managed)</h2><span class="tag">we build + run it · <a href="/managed">/managed</a></span></div>
    <div class="pgrid">${MANAGED.map(card).join("")}</div>
  </section>

  <footer>
    Questions? See the <a href="/managed">managed service</a> · <a href="/directory/submit">list your site free</a> · <a href="/mcp/leaderboard">MCP trust leaderboard</a>. wmcp.sh is not affiliated with Anthropic, OpenAI, Google, or Cloudflare.
  </footer>
</div>
<script>
var ORIGIN=${JSON.stringify(origin)};
(function(){
  var box=document.getElementById("co"),title=document.getElementById("co-title"),email=document.getElementById("co-email"),go=document.getElementById("co-go"),err=document.getElementById("co-err");
  var plan="builder",labels={builder:"Builder — $39/mo",pro:"Pro — $99/mo",reseller:"Reseller — $299/mo"};
  document.querySelectorAll("button.pick[data-plan]").forEach(function(b){
    b.addEventListener("click",function(){
      plan=b.getAttribute("data-plan");
      title.textContent="Continue to checkout · "+(labels[plan]||plan);
      box.classList.add("show");err.textContent="";
      box.scrollIntoView({behavior:"smooth",block:"center"});email.focus();
    });
  });
  function start(){
    var addr=(email.value||"").trim();err.textContent="";
    if(!addr||addr.indexOf("@")<0){err.textContent="Enter a valid email.";return;}
    go.disabled=true;go.textContent="Loading…";
    fetch(ORIGIN+"/api/v1/stripe/checkout",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({email:addr,plan:plan,origin:ORIGIN})})
      .then(function(r){return r.json().catch(function(){return{};}).then(function(d){return{ok:r.ok,d:d};});})
      .then(function(x){if(!x.ok||!x.d.url){err.textContent=(x.d&&x.d.error)||"Checkout failed.";go.disabled=false;go.textContent="Continue →";return;}window.location.href=x.d.url;})
      .catch(function(){err.textContent="Network error — try again.";go.disabled=false;go.textContent="Continue →";});
  }
  go.addEventListener("click",start);
  email.addEventListener("keydown",function(e){if(e.key==="Enter")start();});
})();
</script>
</body></html>`;
}
