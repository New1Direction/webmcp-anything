// digital.ts — one-time, no-install, instant-unlock impulse products.
//
// The consumer SEO traffic is mostly MOBILE and multilingual; a Chrome
// extension (QuickCatch) or a subscription can't convert it. These products are
// the opposite: $1-7, one-time (mode=payment), zero install, delivered on the
// page the instant Stripe confirms payment. Same engine for every product —
// add a row to PRODUCTS + a Stripe price id and it's sellable.
//
// Flow: buy button → POST /api/v1/<product>/checkout → Stripe Checkout (collects
// card + email, no pre-form) → success_url /<product>/unlock?session_id=… →
// verify payment_status==="paid" → render content + mint a re-access token
// (KV dlg:<token>, 1y) so the buyer can reopen it from /<product>/read?t=… .

import type { Context } from "hono";
import { STRIPE_API, createSessionResponse } from "./stripe";

type Env = {
  KEYS: KVNamespace;
  STRIPE_SECRET_KEY?: string;
  STRIPE_PRICE_GUIDE?: string;
  STRIPE_PRICE_CALCPRO?: string;
};

type ProductId = "guide" | "calcpro";

interface ProductDef {
  priceEnv: keyof Env;
  price: string; // display only
  title: string;
  tagline: string; // sales-page sub-headline
  bullets: string[]; // "what's inside"
  render: () => string; // the gated content (HTML body)
}

const PRODUCTS: Record<ProductId, ProductDef> = {
  guide: {
    priceEnv: "STRIPE_PRICE_GUIDE",
    price: "$2.99",
    title: "The Pokémon Drop-Day Playbook",
    tagline: "Stop paying resellers. The exact restock-day checklist to land Pokémon sealed product at retail — on your phone, no app, no subscription.",
    bullets: [
      "The 90-second pre-drop checklist",
      "Store-by-store setup (Pokémon Center, Walmart, Target, Best Buy)",
      "Retail-vs-resale margin math (skip the markup)",
      "Is-it-worth-grading decision framework",
      "Restock timing + scalper-trap avoidance",
    ],
    render: () => GUIDE_HTML,
  },
  calcpro: {
    priceEnv: "STRIPE_PRICE_CALCPRO",
    price: "$4.99",
    title: "Pro Portfolio Calculator",
    tagline: "The free calculator does one item. This does your whole collection — track every sealed box and card, see your total savings and resale profit at a glance. Saves on your device, no account.",
    bullets: [
      "Add unlimited items — your whole binder/haul",
      "Running totals: spend, savings, resale profit, blended margin",
      "Saves to your device automatically (no login)",
      "Print or screenshot a clean summary",
      "Works on mobile, reopen anytime from your private link",
    ],
    render: () => CALCPRO_HTML,
  },
};

const esc = (s: string) =>
  String(s).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" } as any)[ch]);

const TOKEN_TTL_DAYS = 365;
function newToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Mobile-first shell in the amber/dark identity.
function shell(title: string, body: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<style>
:root{--bg:#13131a;--card:#1b1b24;--amber:#ff9e2c;--ink:#ececf1;--mut:#9a9aae}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);
font:16px/1.6 ui-sans-serif,system-ui,-apple-system,sans-serif}
.wrap{max-width:680px;margin:0 auto;padding:28px 20px 64px}
h1{font-size:1.7rem;line-height:1.25;margin:.2em 0 .4em}
h2{font-size:1.2rem;margin:1.6em 0 .4em;color:var(--amber)}
a{color:var(--amber)}.mut{color:var(--mut)}
.card{background:var(--card);border:1px solid #2a2a36;border-radius:14px;padding:20px;margin:18px 0}
.buy{display:block;width:100%;background:var(--amber);color:#1a1206;border:0;border-radius:12px;
padding:16px 18px;font-size:1.12rem;font-weight:700;cursor:pointer;text-align:center;text-decoration:none}
.buy:disabled{opacity:.6}.price{font-size:2rem;font-weight:800}
ul{padding-left:1.1em}li{margin:.3em 0}
.ck{list-style:none;padding:0}.ck li{padding:.35em 0 .35em 1.7em;position:relative}
.ck li:before{content:"✓";position:absolute;left:0;color:var(--amber);font-weight:700}
@media print{body{background:#fff;color:#111}.noprint{display:none}.card{border-color:#ddd}}
</style></head><body><div class="wrap">${body}</div></body></html>`;
}

// ----------------------------- the product ------------------------------
// Real, actionable playbook assembled from genuine shopper practice — no
// invented dates or prices (those move; the method doesn't).
const GUIDE_HTML = `
<h1>The Pokémon Drop-Day Playbook</h1>
<p class="mut">Land sealed product at retail instead of paying a reseller. A tight, do-this checklist for restock day — works on any store, on your phone.</p>

<h2>1 · The 90-second pre-drop checklist</h2>
<ul class="ck">
<li>Logged into the store account you'll buy from (not just browsing).</li>
<li>Payment method + shipping address saved for one-tap checkout.</li>
<li>The <b>exact product page</b> open — not the search results, the product itself.</li>
<li>Store app installed with notifications on (apps often get stock before web).</li>
<li>Your <b>max price</b> decided in advance, so you don't hesitate or overpay.</li>
</ul>

<h2>2 · Store-by-store setup</h2>
<p><b>Pokémon Center</b> — the hardest, because demand is global and exclusives sell out in seconds. Log in early, save payment, keep the product tab open, and expect a queue on big drops; don't refresh frantically — that can bounce you back.</p>
<p><b>Walmart</b> — the app beats the website on most drops. Be signed in with a saved card; the "Add to cart" button appears the instant stock flips, so have the page ready.</p>
<p><b>Target</b> — in-store pickup often shows stock before shipping does; set your store and check pickup availability, not just ship-to-home.</p>
<p><b>Best Buy</b> — account + saved payment, and watch for "available soon"→"add to cart" on the product page during the window.</p>

<h2>3 · Retail vs resale — the 10-second math</h2>
<p>Before you pay a reseller, do the margin check. Resale gets eaten by fees and shipping:</p>
<div class="card"><b>Keep cost</b> = resale price − (resale × ~12-15% marketplace fee) − shipping.<br>
If that number is close to retail, just buy retail and skip the markup. If a sealed item is far above retail resale, it's usually worth grabbing at retail to flip — but only if you can actually land it.</div>
<p class="mut">A free calculator that does this for you: <a href="/tools/pokemon-resale-calculator">/tools/pokemon-resale-calculator</a></p>

<h2>4 · Is it worth grading?</h2>
<p>Grading pays off when a top grade <i>multiplies</i> value — modern alt arts and special-illustration rares of popular Pokémon, vintage holos in clean condition, key chase cards from hyped sets. It rarely pays on bulk or already-cheap cards once you count the grading fee and the weeks of turnaround.</p>
<ul>
<li><b>Grade if:</b> the card is a chase card, condition is near-mint or better, and the PSA-10/raw price gap clearly beats the grading cost.</li>
<li><b>Skip if:</b> it's common, visibly off-center/whitened, or the graded premium is thin.</li>
</ul>

<h2>5 · Timing + avoiding traps</h2>
<ul>
<li>Restocks cluster early morning and mid-week; turn on alerts rather than guessing.</li>
<li>Big restocks come in <b>waves</b> — if you miss the first, keep the page armed for the next few minutes.</li>
<li>Resale prices fall after a restock. Don't panic-buy at the peak; buy what you'll actually keep or play.</li>
</ul>

<div class="card"><b>That's the whole method.</b> Save this page or print it (your browser's Share → Print). You can reopen it anytime from the link below.</div>
`;

// Calculator Pro — a self-contained multi-item portfolio tool. Lives entirely on
// the unlock page (the free /tools calculator is untouched). State persists in
// localStorage, so it works with no account and survives reloads.
const CALCPRO_HTML = `
<style>
.cp-in{width:100%;background:#11111a;border:1px solid #34343f;border-radius:9px;color:#ececf1;padding:11px 12px;font-size:1rem}
.cp-grid{display:grid;grid-template-columns:1fr 1fr 1fr .7fr;gap:8px;margin:10px 0}
.cp-grid label{font-size:.78rem;color:#9a9aae;display:block;margin:0 0 3px}
.cp-add{margin-top:10px}
table.cp{width:100%;border-collapse:collapse;font-size:.92rem;margin-top:6px}
table.cp th,table.cp td{text-align:right;padding:8px 6px;border-bottom:1px solid #26262f}
table.cp th:first-child,table.cp td:first-child{text-align:left}
.cp-x{background:none;border:0;color:#ff7a7a;cursor:pointer;font-size:1rem}
.cp-tot{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dashed #2a2a36}
.cp-tot b{font-size:1.15rem}
.pos{color:#7fdca0}.neg{color:#ff7a7a}
.cp-row{display:flex;gap:10px;margin-top:14px}
.cp-row button{flex:1;background:#22222c;color:#ececf1;border:1px solid #34343f;border-radius:10px;padding:11px;cursor:pointer}
@media(max-width:520px){.cp-grid{grid-template-columns:1fr 1fr}}
</style>
<h1>Pro Portfolio Calculator</h1>
<p class="mut">Add every sealed box and card you're tracking. It keeps a running tally of what you'd spend at retail, what you save versus resale, and your profit if you flip — saved right on this device.</p>

<div class="card">
<div class="cp-grid">
<div style="grid-column:1/-1"><label>Item (optional)</label><input class="cp-in" id="cp-name" placeholder="e.g. Prismatic Evolutions ETB"></div>
<div><label>Retail $</label><input class="cp-in" id="cp-retail" type="number" inputmode="decimal" min="0" step="0.01"></div>
<div><label>Resale $</label><input class="cp-in" id="cp-resale" type="number" inputmode="decimal" min="0" step="0.01"></div>
<div><label>Qty</label><input class="cp-in" id="cp-qty" type="number" inputmode="numeric" min="1" step="1" value="1"></div>
<div style="align-self:end"><button class="buy cp-add" id="cp-addbtn" style="padding:11px">Add</button></div>
</div>
</div>

<div class="card" id="cp-listcard" style="display:none">
<table class="cp"><thead><tr><th>Item</th><th>Qty</th><th>Spend</th><th>Save/Profit</th><th></th></tr></thead><tbody id="cp-rows"></tbody></table>
</div>

<div class="card" id="cp-totcard" style="display:none">
<div class="cp-tot"><span>Items</span><b id="cp-count">0</b></div>
<div class="cp-tot"><span>Total retail spend</span><b id="cp-spend">$0.00</b></div>
<div class="cp-tot"><span>Total saved (collecting)</span><b class="pos" id="cp-save">$0.00</b></div>
<div class="cp-tot"><span>Total profit (reselling)</span><b class="pos" id="cp-profit">$0.00</b></div>
<div class="cp-tot" style="border:0"><span>Blended margin</span><b id="cp-margin">—</b></div>
<div class="cp-row noprint"><button id="cp-print">Print / screenshot</button><button id="cp-clear">Clear all</button></div>
</div>
<p class="mut" id="cp-empty">No items yet — add your first above. Savings/profit = (resale − retail) × qty. Resale prices move, so update them as you go.</p>

<script>
(function(){
  var KEY='calcpro_items', items=[];
  try{ items=JSON.parse(localStorage.getItem(KEY)||'[]')||[]; }catch(e){ items=[]; }
  var $=function(id){return document.getElementById(id);};
  var money=function(n){return '$'+(Math.round(n*100)/100).toFixed(2);};
  function save(){ try{ localStorage.setItem(KEY, JSON.stringify(items)); }catch(e){} }
  function render(){
    var rows='', spend=0, save_=0;
    items.forEach(function(it,i){
      var s=(it.retail*it.qty), sv=((it.resale-it.retail)*it.qty);
      spend+=s; save_+=sv;
      rows+='<tr><td>'+(it.name?String(it.name).replace(/[<>&]/g,''):'Item')+'</td><td>'+it.qty+'</td><td>'+money(s)+'</td><td class="'+(sv>=0?'pos':'neg')+'">'+money(sv)+'</td><td><button class="cp-x" data-i="'+i+'">✕</button></td></tr>';
    });
    $('cp-rows').innerHTML=rows;
    $('cp-count').textContent=items.length;
    $('cp-spend').textContent=money(spend);
    $('cp-save').textContent=money(save_);
    $('cp-profit').textContent=money(save_);
    $('cp-margin').textContent= spend>0 ? (Math.round((save_/spend)*1000)/10)+'%' : '—';
    var has=items.length>0;
    $('cp-listcard').style.display=has?'block':'none';
    $('cp-totcard').style.display=has?'block':'none';
    $('cp-empty').style.display=has?'none':'block';
  }
  $('cp-addbtn').addEventListener('click',function(){
    var r=parseFloat($('cp-retail').value), p=parseFloat($('cp-resale').value), q=parseInt($('cp-qty').value,10)||1;
    if(!(r>0)||!(p>=0)){ $('cp-retail').focus(); return; }
    items.push({name:$('cp-name').value.slice(0,40), retail:r, resale:p, qty:Math.max(1,q)});
    save(); render();
    $('cp-name').value=''; $('cp-retail').value=''; $('cp-resale').value=''; $('cp-qty').value='1'; $('cp-name').focus();
  });
  $('cp-rows').addEventListener('click',function(e){
    var b=e.target.closest('.cp-x'); if(!b) return;
    items.splice(parseInt(b.dataset.i,10),1); save(); render();
  });
  $('cp-clear').addEventListener('click',function(){ if(confirm('Clear your whole list?')){ items=[]; save(); render(); } });
  $('cp-print').addEventListener('click',function(){ window.print(); });
  render();
})();
</script>
`;

// ------------------------------- handlers -------------------------------

// POST /api/v1/<product>/checkout — no email pre-form (Stripe collects it);
// lowest-friction impulse path. 503 until the price id is set (fail-closed).
export async function createDigitalCheckout(c: Context<{ Bindings: Env }>, product: ProductId) {
  const def = PRODUCTS[product];
  if (!def) return c.json({ error: "unknown_product" }, 404);
  const price = c.env[def.priceEnv] as string | undefined;
  if (!c.env.STRIPE_SECRET_KEY || !price) {
    return c.json({ error: `${product}_not_configured` }, 503);
  }
  const origin = new URL(c.req.url).origin;
  const source = String(c.req.query("source") || c.req.query("utm_source") || "")
    .slice(0, 40).replace(/[^a-z0-9_.:-]/gi, "") || "direct";
  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("line_items[0][price]", price);
  form.set("line_items[0][quantity]", "1");
  form.set("allow_promotion_codes", "true");
  form.set("client_reference_id", source);
  form.set("metadata[kind]", `digital:${product}`);
  form.set("metadata[source]", source);
  form.set("success_url", `${origin}/${product}/unlock?session_id={CHECKOUT_SESSION_ID}`);
  form.set("cancel_url", `${origin}/${product}?canceled=1`);
  return await createSessionResponse(c as any, form);
}

// GET /<product>/unlock?session_id=… — verify paid, mint a re-access token,
// deliver the content. Idempotent: refreshing re-verifies and re-shows.
export async function digitalUnlock(c: Context<{ Bindings: Env }>, product: ProductId) {
  const def = PRODUCTS[product];
  if (!def) return c.notFound();
  const session_id = c.req.query("session_id");
  if (!session_id) return c.html(shell(def.title, `<h1>${esc(def.title)}</h1><p>Missing session. <a href="/${product}">Back</a></p>`), 400);
  if (!c.env.STRIPE_SECRET_KEY) return c.html(shell(def.title, `<h1>Almost there</h1><p class="mut">Billing isn't switched on yet — your payment is safe; email support and we'll send it.</p>`));
  const sRes = await fetch(`${STRIPE_API}/checkout/sessions/${encodeURIComponent(session_id)}`, {
    headers: { authorization: `Bearer ${c.env.STRIPE_SECRET_KEY}` },
  });
  const session: any = await sRes.json().catch(() => null);
  if (!sRes.ok || !session) return c.html(shell(def.title, `<h1>Hmm</h1><p class="mut">Couldn't confirm that checkout. Email support with your receipt.</p>`));
  if (session.payment_status !== "paid") {
    return c.html(shell(def.title, `<h1>Processing…</h1><p class="mut">Payment status: ${esc(session.payment_status || "pending")}. Refresh in a moment.</p>`));
  }
  // Mint a stable re-access token keyed to this session (idempotent per session).
  const tokKey = `dlgsess:${session_id}`;
  let token = await c.env.KEYS.get(tokKey);
  if (!token) {
    token = newToken();
    await c.env.KEYS.put(tokKey, token, { expirationTtl: TOKEN_TTL_DAYS * 86400 });
    await c.env.KEYS.put(`dlg:${token}`, JSON.stringify({ product, ts: Date.now() }), { expirationTtl: TOKEN_TTL_DAYS * 86400 });
  }
  return c.html(renderUnlocked(def, product, token));
}

// GET /<product>/read?t=… — re-access via the token (no account).
export async function digitalRead(c: Context<{ Bindings: Env }>, product: ProductId) {
  const def = PRODUCTS[product];
  if (!def) return c.notFound();
  const t = c.req.query("t") || "";
  const raw = t ? await c.env.KEYS.get(`dlg:${t}`) : null;
  let ok = false;
  try { ok = !!raw && JSON.parse(raw).product === product; } catch {}
  if (!ok) return c.html(shell(def.title, `<h1>${esc(def.title)}</h1><p class="mut">That access link isn't valid. <a href="/${product}">Get ${esc(def.title)}</a></p>`), 403);
  return c.html(renderUnlocked(def, product, t));
}

function renderUnlocked(def: ProductDef, product: ProductId, token: string): string {
  return shell(def.title, `${def.render()}
<p class="noprint mut" style="margin-top:24px">Reopen anytime: <a href="/${product}/read?t=${esc(token)}">your private access link</a> — bookmark it.</p>`);
}

// GET /<product> — the mobile-first sales page.
export function digitalSalesHtml(origin: string, product: ProductId, canceled: boolean): string {
  const def = PRODUCTS[product];
  if (!def) return shell("Not found", "<h1>Not found</h1>");
  const body = `
<h1>${esc(def.title)}</h1>
<p class="mut">${esc(def.tagline)}</p>
${canceled ? `<div class="card noprint">No worries — checkout was canceled. It's still here when you want it.</div>` : ""}
<div class="card">
<h2 style="margin-top:0">What's inside</h2>
<ul class="ck">
${def.bullets.map((b) => `<li>${esc(b)}</li>`).join("\n")}
</ul>
</div>
<div class="card" style="text-align:center">
<div class="price">${esc(def.price)}</div>
<p class="mut" style="margin:.2em 0 16px">one-time · instant access · no signup · no app</p>
<button class="buy" id="buy" data-product="${esc(product)}">Get instant access — ${esc(def.price)}</button>
<p class="mut" style="font-size:.85rem;margin:14px 0 0">Secure checkout by Stripe. Works on mobile. Reopen anytime from your access link.</p>
</div>
<script>
document.getElementById('buy').addEventListener('click', async function(){
  var b=this; var orig=b.textContent; b.disabled=true; b.textContent='…';
  try{
    var r=await fetch('/api/v1/'+b.dataset.product+'/checkout',{method:'POST',headers:{'content-type':'application/json'},body:'{}'});
    var j=await r.json();
    if(j&&j.url){location.href=j.url;return;}
    throw new Error((j&&j.error)||'err');
  }catch(e){ b.disabled=false; b.textContent=orig; alert('Checkout is warming up — try again in a moment.'); }
});
</script>`;
  return shell(def.title, body);
}
