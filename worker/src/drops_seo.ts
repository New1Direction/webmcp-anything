// drops_seo.ts — programmatic SEO pages for Pokémon drop/restock intent.
// One template + a data list. Every page carries the same conversion funnel:
//   1. Install QuickCatch (free)        → Chrome Web Store
//   2. Free restock alerts (email)      → POST /api/v1/leads  (your leads list)
//   3. QuickCatch Pro (founding)        → Stripe Payment Link (set PRO_URL)
// No page ships without a way to capture or sell.

const STORE_URL = "https://chromewebstore.google.com/detail/quickcatch/dgbaaeengmgmkefpocdckkiahilbfdlk";
// Paste a Stripe Payment Link here to turn the Pro button into a real sale.
// Until then the Pro button falls back to the founding-email capture.
const PRO_URL = "";

export interface DropPage {
  slug: string;
  title: string;       // <title> / SERP
  desc: string;        // meta description
  h1: string;
  lede: string;        // one-paragraph intro
  topic: string;       // used in the alert label ("alerts for X")
  product?: { name: string; price: string; store: string };
  faqs: Array<{ q: string; a: string }>;
}

export const DROP_PAGES: DropPage[] = [
  {
    slug: "pokemon-restock-tracker",
    title: "Pokémon Restock Tracker — Catch Drops With AI | QuickCatch",
    desc: "QuickCatch watches Pokémon product pages and adds the item to your cart the second it restocks, in your own browser, even on sites that block bots.",
    h1: "A Pokémon restock tracker that actually grabs it",
    lede: "Restock alerts tell you it is back. By the time you tap through, it is gone. QuickCatch watches the page for you and adds the item to your cart the moment it restocks, so you are not racing the whole internet to the buy button.",
    topic: "Pokémon restocks",
    faqs: [
      { q: "How is this different from a restock alert?", a: "An alert pings you and leaves the rest to you. QuickCatch adds the item to your cart on the restock, then you check out. You skip the part where everyone refreshes at once." },
      { q: "Does it work on sites that block bots?", a: "Yes. QuickCatch runs in your own browser and your own logged-in session, so it reaches the same pages you do. That is why it works where server-side bots get blocked." },
      { q: "Is it free?", a: "Installing QuickCatch is free. Watching a page and adding to cart is included. Pro adds auto-cop on more items at once." },
    ],
  },
  {
    slug: "prismatic-evolutions-restock",
    title: "Prismatic Evolutions Restock Alert & Auto-Cart | QuickCatch",
    desc: "Catch the Prismatic Evolutions Elite Trainer Box restock. QuickCatch watches the page and adds it to your cart the instant it is back in stock.",
    h1: "Catch the Prismatic Evolutions restock",
    lede: "The Prismatic Evolutions Elite Trainer Box sells out in seconds and resells for several times retail. QuickCatch watches the product page and adds it to your cart the moment it restocks, so you pay retail instead of scalper prices.",
    topic: "Prismatic Evolutions restocks",
    product: { name: "Prismatic Evolutions Elite Trainer Box", price: "$49.99 retail", store: "Pokémon Center, Walmart, Target" },
    faqs: [
      { q: "Where does the Prismatic Evolutions ETB restock?", a: "Pokémon Center, Walmart, Target, Best Buy and Sam's Club all carry it. QuickCatch works on any product page that shows price and stock." },
      { q: "What does retail cost vs resale?", a: "Retail is about $49.99. Resale runs well above that during shortages, which is why catching it at retail matters." },
      { q: "Can it buy more than one?", a: "Most stores limit one per customer. QuickCatch respects the page, adds to your cart, and you complete checkout." },
    ],
  },
  {
    slug: "151-ultra-premium-restock",
    title: "151 Ultra-Premium Collection Restock | QuickCatch",
    desc: "Catch the Scarlet & Violet 151 Ultra-Premium Collection restock. QuickCatch watches the page and carts it the instant it is back.",
    h1: "Catch the 151 Ultra-Premium Collection restock",
    lede: "The Scarlet and Violet 151 Ultra-Premium Collection is one of the hardest sets to buy at retail. QuickCatch watches the page and adds it to your cart the moment stock flips, so you are not stuck paying a reseller.",
    topic: "151 Ultra-Premium restocks",
    product: { name: "Scarlet & Violet 151 Ultra-Premium Collection", price: "$119.99 retail", store: "Pokémon Center, Walmart" },
    faqs: [
      { q: "What is the retail price of the 151 UPC?", a: "About $119.99. Resellers list it far higher when it is out of stock." },
      { q: "Which stores should I watch?", a: "Pokémon Center and Walmart are the main ones. Open the product page on the store where you want to buy, then arm QuickCatch." },
      { q: "Do I have to sit on the page?", a: "No. Arm it before the drop and leave it running. QuickCatch watches so you do not have to." },
    ],
  },
  {
    slug: "pokemon-center-restock",
    title: "Pokémon Center Restock — Catch It With AI | QuickCatch",
    desc: "Pokémon Center sells out in seconds. QuickCatch watches the product page and adds the item to your cart the moment it restocks.",
    h1: "Catch a Pokémon Center restock",
    lede: "Pokémon Center marks the hottest sets unavailable within minutes. QuickCatch watches the product page in your own browser and adds the item to your cart the instant it comes back, so you check out before it sells out again.",
    topic: "Pokémon Center restocks",
    faqs: [
      { q: "Does QuickCatch work on pokemoncenter.com?", a: "Yes. It reads the product page you are on and adds the item to your cart when stock returns. You complete checkout in your own account." },
      { q: "Will it get my account flagged?", a: "QuickCatch acts as you, in your own session, on the page you opened. It does not create accounts or run in the background." },
      { q: "What about the purchase limit?", a: "It follows the page. If the limit is one, it carts one." },
    ],
  },
  {
    slug: "walmart-pokemon-restock",
    title: "Walmart Pokémon Restock Tracker | QuickCatch",
    desc: "Catch Walmart Pokémon restocks. QuickCatch watches the listing and adds the card box to your cart the second it is back in stock.",
    h1: "Catch a Walmart Pokémon restock",
    lede: "Walmart restocks Pokémon boxes in waves and they vanish fast. QuickCatch watches the listing and adds it to your cart the moment it flips back to in stock, so you are first in line instead of refreshing.",
    topic: "Walmart Pokémon restocks",
    faqs: [
      { q: "Does it work with Walmart pickup and delivery?", a: "QuickCatch carts the item. You pick your fulfillment and finish checkout the way you normally would." },
      { q: "Third-party sellers vs Walmart?", a: "QuickCatch reads whichever listing you open. Open the seller you want to buy from, then arm it." },
      { q: "Is there a fee?", a: "Installing and watching is free. Pro adds watching several items at once." },
    ],
  },
  {
    slug: "pokemon-30th-anniversary-drops",
    title: "Pokémon 30th Anniversary Drops — Catch Them | QuickCatch",
    desc: "The Pokémon 30th anniversary brings the year's biggest drops. QuickCatch watches the page and carts the set the instant it restocks.",
    h1: "Catch the Pokémon 30th anniversary drops",
    lede: "The 30th anniversary brings the biggest Pokémon releases of the year, and demand is brutal. QuickCatch watches the product page and adds the set to your cart the moment it restocks, so the anniversary box ends up in your collection instead of a reseller's.",
    topic: "Pokémon 30th anniversary drops",
    faqs: [
      { q: "Which anniversary sets should I watch?", a: "Open the product page for any anniversary set or special collection on your store of choice and arm QuickCatch. It works on any page that shows price and stock." },
      { q: "When do anniversary sets restock?", a: "Restocks land without warning. That is the point of QuickCatch: arm it before the drop and it watches around the clock so you do not miss the window." },
      { q: "Does it cost anything?", a: "Free to install and watch. Pro adds auto-cop across several items at once." },
    ],
  },
  {
    slug: "how-to-catch-pokemon-drops",
    title: "How to Catch Pokémon Drops With AI | QuickCatch",
    desc: "A simple way to catch Pokémon drops: install QuickCatch, arm the product page, and let your AI add it to your cart the moment it restocks.",
    h1: "How to catch Pokémon drops with AI",
    lede: "You do not need a scalper setup to catch a drop. Install QuickCatch, open the product page before the drop, and let it watch the page and add the item to your cart the second stock returns.",
    topic: "Pokémon drops",
    faqs: [
      { q: "Do I need any technical setup?", a: "No. Add the extension, open the product page, and tap Watch this drop. That is the whole setup." },
      { q: "Can I close my laptop?", a: "Keep the tab open so QuickCatch can watch the page. You can do anything else in the meantime." },
      { q: "Is this against the rules?", a: "QuickCatch runs in your own browser and your own session, on the page you opened. It acts as you, the way a shopping assistant does." },
    ],
  },
  {
    slug: "pokemon-restock-bot-alternative",
    title: "Pokémon Restock Bot Alternative That Works | QuickCatch",
    desc: "Restock bots get blocked and banned. QuickCatch runs in your own browser instead, so it reaches the pages bots cannot and carts the item for you.",
    h1: "A Pokémon restock bot alternative that actually works",
    lede: "Server-side restock bots get blocked, flagged and banned, because stores detect them. QuickCatch takes the opposite approach: it runs in your own browser and your own session, so it reaches the same pages you do and adds the item to your cart on the restock.",
    topic: "Pokémon restocks",
    faqs: [
      { q: "Why do restock bots get blocked?", a: "Stores detect datacenter traffic and automated checkout, then block or ban it. A bot running from a server stands out." },
      { q: "Why does QuickCatch get through?", a: "It is not a server. It runs in your browser, in your logged-in session, on the page you opened. To the store it looks like you, because it is you." },
      { q: "Is it safe to use?", a: "It only acts on the page you point it at, and you complete checkout yourself. It does not store your payment details or run in the background." },
    ],
  },
];

export const DROP_SLUGS = DROP_PAGES.map((p) => p.slug);

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function shell(origin: string, head: string, body: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
${head}
<style>
  :root { --bg:#07070d;--card:#16161f;--bg2:#11111c;--border:#26263a;--text:#ececf5;--muted:#9a9ab0;--accent:#ff9e2c;--accent2:#ffcf7a;--green:#4ade80;--red:#ff5470; }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin:0; color:var(--text); background:var(--bg); font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif; line-height:1.6;
    background-image:radial-gradient(ellipse 900px 600px at 12% -5%,rgba(255,158,44,.16),transparent 60%); }
  .wrap { max-width: 820px; margin: 0 auto; padding: 0 22px; }
  nav { display:flex; justify-content:space-between; align-items:center; padding:20px 22px; max-width:1080px; margin:0 auto; }
  nav .brand { font-weight:800; display:flex; align-items:center; gap:8px; text-decoration:none; color:var(--text); }
  nav .coin { width:22px;height:22px;border-radius:50%;background:#f97316;border:2px solid #2a1500;position:relative; }
  nav .coin::after{content:"$";position:absolute;inset:0;display:grid;place-items:center;color:#2a1500;font-size:11px;font-weight:900;}
  nav .get { background:linear-gradient(135deg,var(--accent),var(--accent2)); color:#2a1500; padding:8px 15px; border-radius:9px; font-weight:800; text-decoration:none; font-size:.9rem; }
  header.hero { padding: 40px 0 14px; }
  h1 { font-size:clamp(2rem,4.4vw,2.9rem); margin:0 0 14px; line-height:1.08; letter-spacing:-.02em; }
  .lede { color:var(--muted); font-size:1.12rem; margin:0 0 22px; }
  section { padding: 26px 0; }
  h2 { font-size:1.5rem; margin:0 0 14px; letter-spacing:-.01em; }
  h3 { font-size:1.05rem; margin:0 0 6px; }
  .steps { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
  @media (max-width:680px){ .steps{ grid-template-columns:1fr; } }
  .stepc { background:var(--card); border:1px solid var(--border); border-radius:14px; padding:18px; }
  .stepc .n { color:var(--accent2); font-weight:800; font-size:.8rem; letter-spacing:.1em; }
  details { background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px 18px; margin-bottom:10px; }
  details summary { font-weight:700; cursor:pointer; list-style:none; }
  details .a { color:var(--muted); margin-top:10px; }
  /* conversion block */
  .cta { background:linear-gradient(135deg,var(--card),rgba(255,158,44,.07)); border:1px solid var(--accent); border-radius:18px; padding:24px; margin:14px 0; }
  .cta h2 { margin:0 0 6px; }
  .cta p { color:var(--muted); margin:0 0 16px; }
  .row { display:flex; gap:10px; flex-wrap:wrap; }
  .btn { display:inline-flex; align-items:center; gap:8px; padding:13px 20px; border-radius:11px; font-weight:800; text-decoration:none; border:none; cursor:pointer; font-size:.95rem; font-family:inherit; }
  .btn-primary { background:linear-gradient(135deg,var(--accent),var(--accent2)); color:#2a1500; }
  .btn-ghost { background:var(--bg2); color:var(--text); border:1px solid var(--border); }
  .capture { margin-top:16px; }
  .capture .f { display:flex; gap:8px; flex-wrap:wrap; }
  .capture input { flex:1; min-width:200px; background:var(--bg2); border:1px solid var(--border); color:var(--text); border-radius:10px; padding:12px 14px; font-family:inherit; font-size:.95rem; }
  .capture .hp { position:absolute; left:-9999px; }
  .capture .msg { color:var(--green); font-size:.9rem; margin-top:8px; min-height:1em; }
  .related a { color:var(--accent2); text-decoration:none; }
  footer { border-top:1px solid var(--border); margin-top:34px; padding:26px 0; color:var(--muted); font-size:.85rem; }
  footer a { color:var(--accent2); text-decoration:none; }
</style>
</head>
<body>
<nav>
  <a class="brand" href="${origin}/"><span class="coin"></span> QuickCatch</a>
  <a class="get" href="${STORE_URL}" target="_blank" rel="noopener">Get QuickCatch — free</a>
</nav>
<div class="wrap">
${body}
</div>
<script>
(function(){
  var STORE = ${JSON.stringify(STORE_URL)};
  var PRO = ${JSON.stringify(PRO_URL)};
  document.querySelectorAll("form.lead").forEach(function(f){
    f.addEventListener("submit", async function(e){
      e.preventDefault();
      var email = f.querySelector("input[type=email]").value.trim();
      var topic = f.getAttribute("data-topic") || "Pokémon restocks";
      var pkg = f.getAttribute("data-pkg") || "alerts";
      var msg = f.querySelector(".msg");
      if (!email || email.indexOf("@") < 0) { msg.style.color="#ff5470"; msg.textContent="Enter a valid email."; return; }
      if (f.querySelector(".hp").value) { msg.textContent="Thanks!"; return; }
      try {
        var r = await fetch("/api/v1/leads", { method:"POST", headers:{"content-type":"application/json"},
          body: JSON.stringify({ name: email.split("@")[0], email: email, site_url: location.href, package: pkg, use_case: "QuickCatch "+pkg+" · "+topic }) });
        if (r.ok) { msg.style.color="#4ade80"; msg.textContent = pkg==="pro" ? "You're on the founding list. We'll email you to lock it in." : "Done. We'll alert you on the next "+topic+" drop."; f.querySelector("input[type=email]").value=""; }
        else { msg.style.color="#ff5470"; msg.textContent="Try again in a minute."; }
      } catch(err){ msg.style.color="#ff5470"; msg.textContent="Network error — try again."; }
    });
  });
  document.querySelectorAll("a.pro").forEach(function(a){ if (PRO) { a.setAttribute("href", PRO); a.setAttribute("target","_blank"); } });
})();
</script>
</body>
</html>`;
}

function conversionBlock(p: DropPage): string {
  return `
  <div class="cta">
    <h2>Catch the next ${esc(p.topic)} drop</h2>
    <p>Install free, arm the product page before the drop, and QuickCatch carts it the moment it restocks.</p>
    <div class="row">
      <a class="btn btn-primary" href="${STORE_URL}" target="_blank" rel="noopener">🛒 Get QuickCatch — free</a>
      <a class="btn btn-ghost pro" href="#alerts">⚡ QuickCatch Pro — auto-cop</a>
    </div>
    <form class="lead capture" id="alerts" data-topic="${esc(p.topic)}" data-pkg="alerts">
      <p style="color:var(--muted);margin:16px 0 8px">Not ready to install? Get a free heads-up the next time it restocks.</p>
      <div class="f">
        <input type="email" placeholder="you@email.com" aria-label="email" />
        <input class="hp" tabindex="-1" autocomplete="off" aria-hidden="true" />
        <button class="btn btn-primary" type="submit">Get free alerts</button>
      </div>
      <div class="msg"></div>
    </form>
  </div>`;
}

export function dropPageHtml(origin: string, p: DropPage): string {
  const url = `${origin}/drops/${p.slug}`;
  const faqLd = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: p.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const artLd = {
    "@context": "https://schema.org", "@type": "Article", headline: p.h1, description: p.desc,
    author: { "@type": "Organization", name: "QuickCatch" }, publisher: { "@type": "Organization", name: "QuickCatch", url: origin },
    datePublished: "2026-06-02", dateModified: "2026-06-02", mainEntityOfPage: url,
  };
  const head = `<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.desc)}" />
<link rel="canonical" href="${url}" />
<meta property="og:title" content="${esc(p.h1)}" />
<meta property="og:description" content="${esc(p.desc)}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${origin}/og.png" />
<meta name="twitter:card" content="summary_large_image" />
<script type="application/ld+json">${JSON.stringify(artLd)}</script>
<script type="application/ld+json">${JSON.stringify(faqLd)}</script>`;

  const productCallout = p.product
    ? `<section><div class="stepc"><h3>${esc(p.product.name)}</h3><p style="color:var(--muted);margin:6px 0 0">Retail: ${esc(p.product.price)} · Watch it at: ${esc(p.product.store)}</p></div></section>`
    : "";

  const related = DROP_PAGES.filter((x) => x.slug !== p.slug).slice(0, 4)
    .map((x) => `<a href="${origin}/drops/${x.slug}">${esc(x.h1)}</a>`).join(" · ");

  const body = `
  <header class="hero">
    <h1>${esc(p.h1)}</h1>
    <p class="lede">${esc(p.lede)}</p>
  </header>

  ${conversionBlock(p)}

  <section>
    <h2>How QuickCatch works</h2>
    <div class="steps">
      <div class="stepc"><div class="n">STEP 1</div><h3>Add it free</h3><p style="color:var(--muted)">One click in Chrome.</p></div>
      <div class="stepc"><div class="n">STEP 2</div><h3>Arm the page</h3><p style="color:var(--muted)">Open the product page and tap Watch this drop.</p></div>
      <div class="stepc"><div class="n">STEP 3</div><h3>It carts it</h3><p style="color:var(--muted)">On the restock, your AI adds it. You check out.</p></div>
    </div>
  </section>

  ${productCallout}

  <section>
    <h2>Why it beats refreshing</h2>
    <p>Stores that carry the hottest sets block bots, so a normal AI assistant cannot reach the page when stock returns. QuickCatch runs in your own browser and your own logged-in session, so it reaches the same pages you do. It watches the page you opened and adds the item to your cart the second stock flips, which is the part everyone else loses the race on.</p>
  </section>

  <section>
    <h2>FAQ</h2>
    ${p.faqs.map((f) => `<details><summary>${esc(f.q)}</summary><div class="a">${esc(f.a)}</div></details>`).join("\n    ")}
  </section>

  ${conversionBlock(p)}

  <footer>
    <p class="related">More: ${related}</p>
    <p><a href="${origin}/">QuickCatch</a> · <a href="${origin}/drops">All drop guides</a> · <a href="${origin}/privacy">Privacy</a></p>
  </footer>`;

  return shell(origin, head, body);
}

export function dropsIndexHtml(origin: string): string {
  const head = `<title>Pokémon Drop & Restock Guides | QuickCatch</title>
<meta name="description" content="Catch every Pokémon drop and restock. Guides for Pokémon Center, Walmart, Sam's Club, the hottest sets, and the 30th anniversary releases." />
<link rel="canonical" href="${origin}/drops" />
<meta property="og:title" content="Pokémon Drop & Restock Guides" />
<meta property="og:image" content="${origin}/og.png" />`;
  const cards = DROP_PAGES.map((p) =>
    `<a class="stepc" style="text-decoration:none;color:inherit;display:block;margin-bottom:12px" href="${origin}/drops/${p.slug}"><h3 style="color:var(--accent2)">${esc(p.h1)}</h3><p style="color:var(--muted);margin:6px 0 0">${esc(p.desc)}</p></a>`
  ).join("\n    ");
  const body = `
  <header class="hero">
    <h1>Pokémon drop &amp; restock guides</h1>
    <p class="lede">Catch the sets that sell out in seconds. Install QuickCatch, arm the page, and it carts the item the moment it restocks.</p>
    <div class="row"><a class="btn btn-primary" href="${STORE_URL}" target="_blank" rel="noopener">🛒 Get QuickCatch — free</a></div>
  </header>
  <section>
    ${cards}
  </section>
  <footer><p><a href="${origin}/">QuickCatch</a> · <a href="${origin}/privacy">Privacy</a></p></footer>`;
  return shell(origin, head, body);
}
