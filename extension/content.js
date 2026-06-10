// content.js — runs in the isolated world. Three jobs:
//   1) Inject injected.js into the page's MAIN world so it can call
//      navigator.modelContext.registerTool().
//   2) Ask the background service worker to extract WebMCP tools for this URL.
//   3) Relay execute() calls between the page and the service worker.

const NS = "WEBMCP_ANYTHING";

// 1. Inject the page-world script
function injectPageScript() {
  const s = document.createElement("script");
  s.src = chrome.runtime.getURL("injected.js");
  s.async = false;
  s.onload = () => s.remove();
  (document.head || document.documentElement).appendChild(s);
}

injectPageScript();

// 2. Ask background to extract tools as soon as the page is ready
let lastToolList = [];

function collectJsonLd() {
  const out = [];
  for (const el of document.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      const parsed = JSON.parse(el.textContent.trim());
      if (Array.isArray(parsed)) out.push(...parsed);
      else if (parsed["@graph"]) out.push(...parsed["@graph"]);
      else out.push(parsed);
    } catch { /* malformed JSON-LD, skip */ }
  }
  return out;
}

function collectMeta() {
  const meta = {};
  for (const m of document.querySelectorAll("meta[property], meta[name]")) {
    const k = m.getAttribute("property") || m.getAttribute("name");
    if (k && (k.startsWith("og:") || k.startsWith("product:") || k.startsWith("twitter:"))) {
      meta[k] = m.getAttribute("content");
    }
  }
  return meta;
}

async function requestTools() {
  try {
    const html = document.documentElement?.outerHTML?.slice(0, 50_000) || "";
    const jsonld = collectJsonLd();
    const meta = collectMeta();
    const title = document.title || "";
    const resp = await chrome.runtime.sendMessage({
      type: "EXTRACT_TOOLS",
      url: location.href,
      html,
      jsonld,
      meta,
      title,
    });
    if (resp?.ok && Array.isArray(resp.tools) && resp.tools.length) {
      lastToolList = resp.tools;
      window.postMessage(
        { source: NS, dir: "bridge->page", type: "REGISTER_TOOLS", payload: { tools: resp.tools } },
        "*"
      );
      // Cache for popup
      chrome.runtime.sendMessage({ type: "CACHE_TOOLS_FOR_TAB", tools: resp.tools, url: location.href });
    }
  } catch (err) {
    console.warn("[WebMCP Anything] extract failed:", err);
  }
}

// Kick off extraction as soon as the DOM is parsed (don't wait for PAGE_READY,
// which only fires when WebMCP API is present).
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => requestTools(), { once: true });
} else {
  requestTools();
}

window.addEventListener("message", async (event) => {
  const msg = event.data;
  if (!msg || msg.source !== NS) return;

  if (msg.dir === "page->bridge" && msg.type === "PAGE_READY") {
    // also retry once when page script is ready, in case earlier attempt raced
    requestTools();
  }

  if (msg.dir === "page->bridge" && msg.type === "EXECUTE") {
    const { requestId, action, args, name } = msg.payload;
    try {
      const resp = await chrome.runtime.sendMessage({
        type: "EXECUTE_TOOL",
        action,
        args,
        name,
        url: location.href,
      });
      window.postMessage(
        {
          source: NS,
          dir: "bridge->page",
          type: "EXECUTE_RESULT",
          payload: { requestId, ok: resp?.ok, value: resp?.value, error: resp?.error },
        },
        "*"
      );
    } catch (err) {
      window.postMessage(
        {
          source: NS,
          dir: "bridge->page",
          type: "EXECUTE_RESULT",
          payload: { requestId, ok: false, error: String(err?.message || err) },
        },
        "*"
      );
    }
  }
});

// 3. Re-extract on SPA navigations
let lastUrl = location.href;
setInterval(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    requestTools();
  }
}, 1500);

// ---- "Watch this drop" — restock monitor + auto add-to-cart ----
// Arm it on a product page. While armed, the tab refreshes on an interval; on
// each load we look for an enabled add-to-cart control. When one appears (the
// restock), we click it and fire a notification. Refresh-based so it works on
// client-rendered stores too. State lives in storage so it survives reloads.
const QC_KEY = "qc_watches";
const QC_ADD_RE = /\b(add to cart|add to bag|add to basket|pre-?order|buy now)\b/i;
// Keyed by bare domain; matched against location.hostname so www and other
// subdomains both work. Ordered most-specific first. These reflect current
// store markup and may drift — the generic text match below is the safety net.
const QC_HOST_SELECTORS = {
  "amazon.com": ['#add-to-cart-button', '#nav-assist-add-to-cart', 'input#add-to-cart-button', 'input[name="submit.add-to-cart"]', '#buy-now-button'],
  "walmart.com": ['button[data-automation-id="atc"]', '[data-seo-id="add-to-cart"]', 'button[data-testid="add-to-cart-section"] button'],
  "target.com": ['button[data-test="addToCartButton"]', 'button[data-test="orderPickupButton"]', 'button[data-test="shippingButton"]'],
  "bestbuy.com": ['button.add-to-cart-button', 'button[data-button-state="ADD_TO_CART"]'],
  "samsclub.com": ['button[data-testid="add-to-cart"]', 'button[aria-label*="Add to cart" i]'],
  "pokemoncenter.com": ['button[class*="add-to-cart-button" i]', 'button[data-testid="add-to-cart"]', 'button[aria-label*="Add to Cart" i]'],
  "gamestop.com": ['button.add-to-cart', '#add-to-cart', 'button[data-id*="addToCart" i]'],
  "costco.com": ['#add-to-cart-btn', 'input[id*="add-to-cart" i]', 'button[automation-id="addToCartButton"]'],
  "tcgplayer.com": ['button[data-testid*="add-to-cart" i]', 'button.add-to-cart', 'a[href*="add-to-cart" i]'],
};
// QC_HOST_SELECTORS is the offline fallback. At runtime we merge the
// server-driven config over it (background fetches /api/v1/selectors), so a
// store that changes its markup is fixed by editing the server, not by a new
// extension release.
let QC_SELECTORS = QC_HOST_SELECTORS;
function qcHostSelectors() {
  const h = location.hostname;
  for (const domain in QC_SELECTORS) {
    if (h === domain || h.endsWith("." + domain)) return QC_SELECTORS[domain];
  }
  return [];
}
async function qcRefreshSelectors() {
  try {
    const r = await chrome.runtime.sendMessage({ type: "GET_SELECTORS" });
    if (r && r.hosts && typeof r.hosts === "object") QC_SELECTORS = { ...QC_HOST_SELECTORS, ...r.hosts };
  } catch { /* offline → keep bundled defaults */ }
}
qcRefreshSelectors();
function qcNorm(u) { try { const x = new URL(u); return x.origin + x.pathname; } catch { return u; } }
// Visible + enabled. Rect-based (not offsetParent, which is null inside the
// position:fixed/sticky buy boxes retail sites use). A 0x0 / display:none
// control means the buy button is gated (e.g. pick a size first) — skip it.
function qcVisible(el) {
  if (!el || el.disabled || el.getAttribute("aria-disabled") === "true") return false;
  const r = el.getBoundingClientRect();
  if (r.width <= 0 || r.height <= 0) return false;
  const st = getComputedStyle(el);
  return !(st.visibility === "hidden" || st.display === "none" || +st.opacity === 0);
}
function qcAddButton(root) {
  root = root || document;
  // 1) per-store selectors (server-driven, merged over bundled defaults)
  for (const sel of qcHostSelectors()) {
    let el = null;
    try { el = root.querySelector(sel); } catch { continue; }
    if (qcVisible(el)) return el;
  }
  // 2) Shopify-style cart submit — covers most independent storefronts
  let sh = null;
  try { sh = root.querySelector('form[action*="/cart" i] [type="submit"], button[name="add"]'); } catch {}
  if (qcVisible(sh)) return sh;
  // 3) generic: any visible, enabled control whose text says add-to-cart
  const cands = Array.from(root.querySelectorAll('button,[role="button"],input[type="submit"],a[class*="add"]'));
  return cands.find((el) =>
    QC_ADD_RE.test((el.innerText || el.value || el.getAttribute("aria-label") || "").trim()) && qcVisible(el)
  ) || null;
}
function qcInStock(root) { return !!qcAddButton(root); }
async function qcGetWatch() { const all = (await chrome.storage.local.get(QC_KEY))[QC_KEY] || {}; return all[qcNorm(location.href)]; }
function qcWaitForBuyBox(maxMs) {
  return new Promise((resolve) => {
    const start = Date.now();
    (function poll() {
      if (qcInStock() || Date.now() - start >= maxMs) return resolve();
      setTimeout(poll, 500);
    })();
  });
}
// The background engine does the watching/polling. The content script only acts
// when it lands on a page that's being watched AND is in stock — i.e. the tab
// the background just opened on a restock. It carts it and tells the background.
async function qcResume() {
  const w = await qcGetWatch();
  if (!w || !w.active || w.caught) return;
  await qcRefreshSelectors();
  await qcWaitForBuyBox(9000); // let client-rendered stores paint the buy box
  if (!qcInStock()) return;    // not actually buyable yet — background keeps polling
  // Auto-add-to-cart is the paid QuickCatch ($12/mo) feature. Free tier gets the
  // restock alert (notification + this opened tab) and carts manually.
  let paid = false;
  try { const r = await chrome.runtime.sendMessage({ type: "QC_IS_PAID" }); paid = !!(r && r.paid); } catch {}
  if (paid) {
    const btn = qcAddButton();
    if (btn) { try { btn.scrollIntoView({ block: "center" }); btn.click(); } catch {} }
  } else {
    qcUpgradeBanner();
  }
  try { chrome.runtime.sendMessage({ type: "WATCH_CAUGHT", url: location.href }); } catch {}
}
// Free-tier nudge shown on the opened restock tab: it's back, you were alerted,
// and auto-cart is one upgrade away. Non-blocking, dismissable, no layout shift.
function qcUpgradeBanner() {
  try {
    if (document.getElementById("qc-upgrade")) return;
    const d = document.createElement("div");
    d.id = "qc-upgrade";
    d.style.cssText = "position:fixed;z-index:2147483647;left:50%;top:14px;transform:translateX(-50%);max-width:92vw;background:#13131a;color:#ececf5;border:1px solid rgba(255,158,44,.5);border-radius:12px;padding:12px 16px;font:600 14px/1.4 -apple-system,system-ui,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.45)";
    d.innerHTML = '🎯 It’s back in stock! You were alerted. <a href="https://wmcp.sh/quickcatch?source=ext_banner" target="_blank" rel="noopener" style="color:#ffcf7a;text-decoration:underline">Upgrade to QuickCatch ($12/mo)</a> and we’ll auto-add it to your cart next time. <span id="qc-x" style="cursor:pointer;color:#8a8aa8;margin-left:8px">✕</span>';
    document.documentElement.appendChild(d);
    const x = d.querySelector("#qc-x"); if (x) x.addEventListener("click", () => d.remove());
    setTimeout(() => d.remove(), 15000);
  } catch {}
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => qcResume(), { once: true });
else qcResume();

// Tool queries for the popup (watch start/stop is owned by the background).
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "GET_TOOLS_FOR_PAGE") { sendResponse({ ok: true, tools: lastToolList, url: location.href }); return; }
});
