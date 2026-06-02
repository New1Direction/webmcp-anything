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
const QC_HOST_SELECTORS = {
  "www.pokemoncenter.com": ['button[data-testid="add-to-cart"]', 'button[class*="addToCart"]', 'button[class*="AddToCart"]'],
  "www.walmart.com": ['button[data-automation-id="atc"]', 'button[data-testid="add-to-cart-section"] button'],
  "www.target.com": ['button[id*="addToCart"]', 'button[data-test*="addToCart"]'],
  "www.bestbuy.com": ['button.add-to-cart-button:not([disabled])'],
  "www.samsclub.com": ['button[data-testid="add-to-cart"]'],
};
function qcNorm(u) { try { const x = new URL(u); return x.origin + x.pathname; } catch { return u; } }
function qcAddButton(root) {
  root = root || document;
  for (const sel of (QC_HOST_SELECTORS[location.hostname] || [])) {
    const el = root.querySelector(sel);
    if (el && !el.disabled && el.getAttribute("aria-disabled") !== "true") return el;
  }
  const cands = Array.from(root.querySelectorAll('button,[role="button"],input[type="submit"],a[class*="add"]'));
  return cands.find((el) => {
    const t = (el.innerText || el.value || el.getAttribute("aria-label") || "").trim();
    if (!QC_ADD_RE.test(t)) return false;
    if (el.disabled || el.getAttribute("aria-disabled") === "true") return false;
    if (el.offsetParent === null) return false; // hidden
    return true;
  }) || null;
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
