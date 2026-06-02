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
async function qcSetWatch(w) {
  const all = (await chrome.storage.local.get(QC_KEY))[QC_KEY] || {};
  const k = qcNorm(location.href);
  if (w) all[k] = w; else delete all[k];
  await chrome.storage.local.set({ [QC_KEY]: all });
}
let qcTimer = null;
function qcWaitForBuyBox(maxMs) {
  return new Promise((resolve) => {
    const start = Date.now();
    (function poll() {
      if (qcInStock() || Date.now() - start >= maxMs) return resolve();
      setTimeout(poll, 500);
    })();
  });
}
async function qcResume() {
  const w = await qcGetWatch();
  if (!w || !w.active || w.caught) return;
  await qcWaitForBuyBox(9000); // let client-rendered stores paint the buy box
  if (qcInStock()) { await qcOnRestock(w); return; }
  const ms = (w.intervalSec || 14) * 1000;
  qcTimer = setTimeout(() => location.reload(), Math.round(ms * (0.85 + Math.random() * 0.3)));
}
async function qcOnRestock(w) {
  await qcSetWatch({ ...w, active: false, caught: true, caughtAt: Date.now() });
  try { chrome.runtime.sendMessage({ type: "RESTOCK_DETECTED", url: location.href, title: document.title }); } catch {}
  const btn = qcAddButton();
  if (btn) { try { btn.scrollIntoView({ block: "center" }); btn.click(); } catch {} }
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => qcResume(), { once: true });
else qcResume();

// Popup control + tool queries (async-safe)
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  (async () => {
    if (msg?.type === "GET_TOOLS_FOR_PAGE") { sendResponse({ ok: true, tools: lastToolList, url: location.href }); return; }
    if (msg?.type === "START_WATCH") {
      if (qcTimer) clearTimeout(qcTimer);
      await qcRefreshSelectors(); // get the latest server config before arming
      await qcSetWatch({ active: true, caught: false, intervalSec: msg.intervalSec || 14, startedAt: Date.now() });
      qcResume();
      sendResponse({ ok: true, watching: true });
      return;
    }
    if (msg?.type === "STOP_WATCH") { if (qcTimer) clearTimeout(qcTimer); await qcSetWatch(null); sendResponse({ ok: true, watching: false }); return; }
    if (msg?.type === "GET_WATCH") {
      const w = await qcGetWatch();
      sendResponse({ ok: true, watching: !!(w && w.active), caught: !!(w && w.caught), inStock: qcInStock() });
      return;
    }
    sendResponse({ ok: false });
  })();
  return true; // keep the channel open for async sendResponse
});
