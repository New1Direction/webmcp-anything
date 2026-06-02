// tools.ts — free lead-gen tools (engineering-as-marketing). A useful free
// calculator that earns links + captures emails, with the QuickCatch funnel:
// free install + email capture (/api/v1/leads) + live Stripe Pro/Reseller
// (/api/v1/stripe/checkout). Routes: /tools and /tools/pokemon-resale-calculator.

const STORE_URL = "https://chromewebstore.google.com/detail/quickcatch/dgbaaeengmgmkefpocdckkiahilbfdlk";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const TOOLS = [
  {
    slug: "pokemon-resale-calculator",
    title: "Pokémon Retail vs Resale Calculator | QuickCatch",
    h1: "Pokémon retail vs resale calculator",
    blurb: "See what you save buying at retail, or what you profit reselling. Then catch the next restock at retail with QuickCatch.",
  },
];

function css(): string {
  return `
  :root { --bg:#07070d;--card:#16161f;--bg2:#11111c;--border:#26263a;--text:#ececf5;--muted:#9a9ab0;--accent:#ff9e2c;--accent2:#ffcf7a;--green:#4ade80;--red:#ff5470; }
  * { box-sizing:border-box; }
  html { scroll-behavior:smooth; }
  body { margin:0; color:var(--text); background:var(--bg); line-height:1.6;
    font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif;
    background-image:radial-gradient(ellipse 900px 600px at 12% -5%,rgba(255,158,44,.16),transparent 60%); }
  .wrap { max-width:760px; margin:0 auto; padding:0 22px; }
  nav { display:flex; justify-content:space-between; align-items:center; padding:20px 22px; max-width:1080px; margin:0 auto; }
  nav .brand { font-weight:800; display:flex; align-items:center; gap:8px; text-decoration:none; color:var(--text); }
  nav .coin { width:22px;height:22px;border-radius:50%;background:#f97316;border:2px solid #2a1500;position:relative; }
  nav .coin::after{content:"$";position:absolute;inset:0;display:grid;place-items:center;color:#2a1500;font-size:11px;font-weight:900;}
  nav .get { background:linear-gradient(135deg,var(--accent),var(--accent2)); color:#2a1500; padding:8px 15px; border-radius:9px; font-weight:800; text-decoration:none; font-size:.9rem; }
  .crumbs { padding-top:10px; color:var(--muted); font-size:.85rem; } .crumbs a { color:var(--accent2); text-decoration:none; }
  header.hero { padding:34px 0 10px; }
  h1 { font-size:clamp(1.9rem,4.2vw,2.6rem); margin:0 0 12px; line-height:1.1; letter-spacing:-.02em; }
  .lede { color:var(--muted); font-size:1.1rem; margin:0 0 20px; }
  section { padding:22px 0; }
  h2 { font-size:1.4rem; margin:0 0 14px; }
  .calc { background:var(--card); border:1px solid var(--border); border-radius:18px; padding:22px; }
  .grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  @media (max-width:560px){ .grid{ grid-template-columns:1fr; } }
  label { display:flex; flex-direction:column; gap:5px; font-size:.85rem; color:var(--muted); }
  input, select { background:var(--bg2); border:1px solid var(--border); color:var(--text); border-radius:10px; padding:12px 14px; font-size:1rem; font-family:inherit; }
  input:focus, select:focus { outline:none; border-color:var(--accent); }
  .out { margin-top:18px; display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  @media (max-width:560px){ .out{ grid-template-columns:1fr; } }
  .stat { background:var(--bg2); border:1px solid var(--border); border-radius:14px; padding:16px; }
  .stat .k { color:var(--muted); font-size:.8rem; text-transform:uppercase; letter-spacing:.06em; }
  .stat .v { font-size:1.7rem; font-weight:900; letter-spacing:-.02em; margin-top:4px; }
  .stat.good .v { color:var(--green); }
  .stat.accent .v { color:var(--accent2); }
  .row { display:flex; gap:10px; flex-wrap:wrap; }
  .btn { display:inline-flex; align-items:center; gap:8px; padding:13px 20px; border-radius:11px; font-weight:800; text-decoration:none; border:none; cursor:pointer; font-size:.95rem; font-family:inherit; }
  .btn-primary { background:linear-gradient(135deg,var(--accent),var(--accent2)); color:#2a1500; }
  .btn-ghost { background:var(--bg2); color:var(--text); border:1px solid var(--border); }
  .cta { background:linear-gradient(135deg,var(--card),rgba(255,158,44,.07)); border:1px solid var(--accent); border-radius:18px; padding:24px; margin:14px 0; }
  .cta h2 { margin:0 0 6px; } .cta p { color:var(--muted); margin:0 0 16px; }
  .capture .f { display:flex; gap:8px; flex-wrap:wrap; margin-top:8px; }
  .capture input { flex:1; min-width:200px; }
  .capture .hp { position:absolute; left:-9999px; }
  .msg { color:var(--green); font-size:.9rem; margin-top:8px; min-height:1em; }
  .plans { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-top:6px; }
  @media (max-width:560px){ .plans{ grid-template-columns:1fr; } }
  .plan { position:relative; background:var(--card); border:1px solid var(--border); border-radius:16px; padding:20px; display:flex; flex-direction:column; gap:8px; }
  .plan.featured { border-color:var(--accent); box-shadow:0 0 0 1px var(--accent) inset; }
  .plan .pname { font-weight:800; } .plan .pprice { font-size:2rem; font-weight:900; } .plan .pprice span { font-size:.9rem; color:var(--muted); font-weight:600; }
  .plan .pdesc { color:var(--muted); font-size:.92rem; flex:1; margin:0; }
  .plan .buy { width:100%; justify-content:center; }
  .plan .badge2 { position:absolute; top:-10px; right:14px; background:linear-gradient(135deg,var(--accent),var(--accent2)); color:#2a1500; font-size:.7rem; font-weight:800; padding:3px 10px; border-radius:999px; text-transform:uppercase; letter-spacing:.06em; }
  details { background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px 18px; margin-bottom:10px; }
  details summary { font-weight:700; cursor:pointer; list-style:none; } details .a { color:var(--muted); margin-top:10px; }
  footer { border-top:1px solid var(--border); margin-top:34px; padding:26px 0; color:var(--muted); font-size:.85rem; }
  footer a { color:var(--accent2); text-decoration:none; }`;
}

function funnelScript(): string {
  return `<script>
(function(){
  function buy(plan){
    var ein = document.querySelector("input[type=email]");
    var email = (ein && ein.value.trim()) || "";
    if (!email || email.indexOf("@") < 0) { email = (window.prompt("Enter your email to start checkout:") || "").trim(); }
    if (!email || email.indexOf("@") < 0) return;
    fetch("/api/v1/stripe/checkout", { method:"POST", headers:{"content-type":"application/json"},
      body: JSON.stringify({ email: email, plan: plan, origin: location.origin }) })
      .then(function(r){ return r.json(); })
      .then(function(j){ if (j && j.url) location.href = j.url; else alert("Couldn't start checkout — try again."); })
      .catch(function(){ alert("Couldn't start checkout — try again."); });
  }
  document.querySelectorAll("button.buy").forEach(function(b){ b.addEventListener("click", function(){ buy(b.getAttribute("data-plan")); }); });
  document.querySelectorAll("form.lead").forEach(function(f){
    f.addEventListener("submit", async function(e){
      e.preventDefault();
      var email = f.querySelector("input[type=email]").value.trim();
      var msg = f.querySelector(".msg");
      if (!email || email.indexOf("@") < 0) { msg.style.color="#ff5470"; msg.textContent="Enter a valid email."; return; }
      if (f.querySelector(".hp") && f.querySelector(".hp").value) { msg.textContent="Thanks!"; return; }
      try {
        var r = await fetch("/api/v1/leads", { method:"POST", headers:{"content-type":"application/json"},
          body: JSON.stringify({ name: email.split("@")[0], email: email, site_url: location.href, package: "alerts", use_case: "QuickCatch resale calculator" }) });
        if (r.ok) { msg.style.color="#4ade80"; msg.textContent="Done. We'll alert you when these restock at retail."; f.querySelector("input[type=email]").value=""; }
        else { msg.style.color="#ff5470"; msg.textContent="Try again in a minute."; }
      } catch(err){ msg.style.color="#ff5470"; msg.textContent="Network error — try again."; }
    });
  });
})();
</script>`;
}

function pricingBlock(): string {
  return `
  <section id="pro">
    <h2>Catch them at retail on autopilot</h2>
    <div class="plans">
      <div class="plan featured">
        <div class="badge2">Most popular</div>
        <div class="pname">QuickCatch Pro</div>
        <div class="pprice">$99<span>/mo</span></div>
        <p class="pdesc">Auto-cop several drops at once, with priority watching.</p>
        <button class="btn btn-primary buy" type="button" data-plan="pro">Get Pro</button>
      </div>
      <div class="plan">
        <div class="pname">QuickCatch Reseller</div>
        <div class="pprice">$299<span>/mo</span></div>
        <p class="pdesc">For resellers: the most items watched at once, top priority, highest limits.</p>
        <button class="btn btn-primary buy" type="button" data-plan="reseller">Go Reseller</button>
      </div>
    </div>
    <p style="color:var(--muted);font-size:.82rem;margin-top:10px;text-align:center">Cancel anytime. Secure checkout by Stripe.</p>
  </section>`;
}

function shell(origin: string, head: string, body: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
${head}
<style>${css()}</style>
</head>
<body>
<nav>
  <a class="brand" href="${origin}/"><span class="coin"></span> QuickCatch</a>
  <a class="get" href="${STORE_URL}" target="_blank" rel="noopener">Get QuickCatch — free</a>
</nav>
<div class="wrap">
${body}
</div>
${funnelScript()}
</body>
</html>`;
}

export function resaleCalculatorHtml(origin: string): string {
  const url = `${origin}/tools/pokemon-resale-calculator`;
  const faqs = [
    { q: "How does the calculator work?", a: "Pick a product or enter a retail price, add a resale price and quantity, and it shows your savings if you collect or your profit if you resell, plus the margin." },
    { q: "Where do the resale numbers come from?", a: "Resale prices move daily, so the presets are rough starting points. Edit the resale field with the real number you see on a marketplace for an accurate result." },
    { q: "How do I actually buy at retail?", a: "Install QuickCatch, open the product page before the drop, and it adds the item to your cart the moment it restocks, at retail." },
  ];
  const faqLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  const appLd = {
    "@context": "https://schema.org", "@type": "WebApplication", name: "Pokémon Retail vs Resale Calculator",
    applicationCategory: "FinanceApplication", operatingSystem: "Any", url, browserRequirements: "Requires JavaScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, publisher: { "@type": "Organization", name: "QuickCatch", url: origin },
  };
  const crumbLd = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "QuickCatch", item: `${origin}/` },
    { "@type": "ListItem", position: 2, name: "Free tools", item: `${origin}/tools` },
    { "@type": "ListItem", position: 3, name: "Retail vs resale calculator", item: url },
  ] };
  const head = `<title>Pokémon Retail vs Resale Calculator | QuickCatch</title>
<meta name="description" content="Free calculator: see what you save buying Pokémon at retail, or what you profit reselling. Then catch the restock at retail with QuickCatch." />
<link rel="canonical" href="${url}" />
<meta property="og:title" content="Pokémon Retail vs Resale Calculator" />
<meta property="og:description" content="See your savings at retail or your resale profit, then catch the next restock." />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${origin}/og.png" />
<meta name="twitter:card" content="summary_large_image" />
<script type="application/ld+json">${JSON.stringify(appLd)}</script>
<script type="application/ld+json">${JSON.stringify(faqLd)}</script>
<script type="application/ld+json">${JSON.stringify(crumbLd)}</script>`;

  // Presets: real retail MSRPs; resale is an editable rough starting point.
  const presets = [
    { name: "Prismatic Evolutions ETB", retail: 49.99, resale: 120 },
    { name: "Scarlet & Violet 151 UPC", retail: 119.99, resale: 250 },
    { name: "Surging Sparks ETB", retail: 59.99, resale: 90 },
    { name: "Charizard ex Super Premium Collection", retail: 119.99, resale: 200 },
    { name: "Booster Box", retail: 161.99, resale: 260 },
  ];

  const body = `
  <nav class="crumbs"><a href="${origin}/">QuickCatch</a> › <a href="${origin}/tools">Free tools</a> › <span style="color:var(--accent2)">Retail vs resale</span></nav>
  <header class="hero">
    <h1>Pokémon retail vs resale calculator</h1>
    <p class="lede">See what you save buying at retail, or what you profit reselling. Then catch the next restock at retail with QuickCatch.</p>
  </header>

  <section>
    <div class="calc">
      <div class="grid">
        <label>Product (optional)
          <select id="preset">
            <option value="">— Custom —</option>
            ${presets.map((p, i) => `<option value="${i}">${esc(p.name)}</option>`).join("")}
          </select>
        </label>
        <label>Quantity
          <input id="qty" type="number" min="1" value="1" />
        </label>
        <label>Retail price ($)
          <input id="retail" type="number" min="0" step="0.01" value="49.99" />
        </label>
        <label>Resale price ($) <span style="color:var(--accent2)">— edit to today's number</span>
          <input id="resale" type="number" min="0" step="0.01" value="120" />
        </label>
      </div>
      <div class="out">
        <div class="stat good"><div class="k">You save (collecting)</div><div class="v" id="o-save">$70.01</div></div>
        <div class="stat accent"><div class="k">Profit (reselling)</div><div class="v" id="o-profit">$70.01</div></div>
        <div class="stat"><div class="k">Margin</div><div class="v" id="o-margin">140%</div></div>
        <div class="stat"><div class="k">Retail spend</div><div class="v" id="o-spend">$49.99</div></div>
      </div>
      <p style="color:var(--muted);font-size:.82rem;margin-top:12px">Savings = (resale − retail) × qty, the markup you skip by catching it at retail. Profit assumes you resell at the resale price. Resale prices move daily — edit the field for an accurate result.</p>
    </div>
  </section>

  <div class="cta">
    <h2>Want these at retail?</h2>
    <p>Install QuickCatch free and it carts the item the moment it restocks, at retail. Or get a free heads-up by email.</p>
    <div class="row">
      <a class="btn btn-primary" href="${STORE_URL}" target="_blank" rel="noopener">🛒 Get QuickCatch — free</a>
      <a class="btn btn-ghost" href="#pro">⚡ QuickCatch Pro — auto-cop</a>
    </div>
    <form class="lead capture" id="alerts">
      <p style="color:var(--muted);margin:14px 0 0">Not ready to install? Get a free alert when these restock at retail.</p>
      <div class="f">
        <input type="email" placeholder="you@email.com" aria-label="email" />
        <input class="hp" tabindex="-1" autocomplete="off" aria-hidden="true" />
        <button class="btn btn-primary" type="submit">Get free alerts</button>
      </div>
      <div class="msg"></div>
    </form>
  </div>

  ${pricingBlock()}

  <section>
    <h2>FAQ</h2>
    ${faqs.map((f) => `<details><summary>${esc(f.q)}</summary><div class="a">${esc(f.a)}</div></details>`).join("\n    ")}
  </section>

  <footer>
    <p><a href="${origin}/tools">All free tools</a> · <a href="${origin}/drops">Drop guides</a> · <a href="${origin}/">QuickCatch</a> · <a href="${origin}/privacy">Privacy</a></p>
  </footer>

  <script>
  (function(){
    var PRESETS = ${JSON.stringify(presets)};
    var preset = document.getElementById("preset"), qty = document.getElementById("qty"),
        retail = document.getElementById("retail"), resale = document.getElementById("resale");
    function money(n){ return "$" + (Math.round(n*100)/100).toLocaleString("en-US", {minimumFractionDigits:2, maximumFractionDigits:2}); }
    function calc(){
      var r = parseFloat(retail.value)||0, s = parseFloat(resale.value)||0, q = Math.max(1, parseInt(qty.value)||1);
      var per = s - r, save = per * q;
      document.getElementById("o-save").textContent = money(save);
      document.getElementById("o-profit").textContent = money(save);
      document.getElementById("o-margin").textContent = r > 0 ? Math.round((per/r)*100) + "%" : "—";
      document.getElementById("o-spend").textContent = money(r * q);
    }
    preset.addEventListener("change", function(){
      var p = PRESETS[preset.value]; if (p){ retail.value = p.retail; resale.value = p.resale; } calc();
    });
    [qty, retail, resale].forEach(function(el){ el.addEventListener("input", calc); });
    calc();
  })();
  </script>`;

  return shell(origin, head, body);
}

export function toolsIndexHtml(origin: string): string {
  const head = `<title>Free Pokémon & TCG Tools | QuickCatch</title>
<meta name="description" content="Free tools for Pokémon and TCG collectors and resellers — starting with the retail vs resale value calculator." />
<link rel="canonical" href="${origin}/tools" />
<meta property="og:title" content="Free Pokémon & TCG Tools" />
<meta property="og:image" content="${origin}/og.png" />`;
  const cards = TOOLS.map((t) =>
    `<a class="plan" style="text-decoration:none;color:inherit;display:block" href="${origin}/tools/${t.slug}"><div class="pname" style="color:var(--accent2)">${esc(t.h1)}</div><p class="pdesc" style="margin-top:6px">${esc(t.blurb)}</p></a>`
  ).join("\n    ");
  const body = `
  <header class="hero">
    <h1>Free Pokémon &amp; TCG tools</h1>
    <p class="lede">Useful, free, no signup. Built by QuickCatch — the extension that catches restocks at retail.</p>
    <div class="row"><a class="btn btn-primary" href="${STORE_URL}" target="_blank" rel="noopener">🛒 Get QuickCatch — free</a></div>
  </header>
  <section><div class="plans">
    ${cards}
  </div></section>
  <footer><p><a href="${origin}/drops">Drop guides</a> · <a href="${origin}/">QuickCatch</a> · <a href="${origin}/privacy">Privacy</a></p></footer>`;
  return shell(origin, head, body);
}

export const TOOL_SLUGS = TOOLS.map((t) => t.slug);
