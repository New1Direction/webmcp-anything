// background.js — service worker. Dispatches to adapters, owns network,
// caches schemas per URL.

import * as shopify from "../adapters/shopify.js";
import * as jsonld from "../adapters/jsonld.js";

// Order matters: most specific first, jsonld is the broad fallback.
const ADAPTERS = [shopify, jsonld];
const ACTION_HANDLERS = Object.assign({}, ...ADAPTERS.map((a) => a.actions || {}));

// In-memory cache (per service worker lifetime). chrome.storage.session would
// persist across restarts but service workers can already be killed mid-flight.
const cache = new Map(); // url -> { tools, ts }
const CACHE_TTL = 60 * 1000; // 60s for stock/price freshness

const tabTools = new Map(); // tabId -> { url, tools }

// Server-driven add-to-cart selectors. The content script asks for these and
// merges them over its bundled defaults, so a store that changes its markup is
// fixed by editing worker src/selectors.ts + deploying — no Web Store update.
// Selectors are CSS strings (data used in querySelector), never executed code.
const QC_SEL_URL = "https://wmcp.sh/api/v1/selectors";
const QC_SEL_TTL = 6 * 60 * 60 * 1000;
let qcSelCache = null;
function qcValidHosts(h) {
  if (!h || typeof h !== "object") return null;
  const out = {};
  for (const k in h) {
    if (Array.isArray(h[k])) {
      const arr = h[k].filter((s) => typeof s === "string" && s.length < 200).slice(0, 12);
      if (arr.length) out[k] = arr;
    }
  }
  return Object.keys(out).length ? out : null;
}
async function qcGetSelectors() {
  if (qcSelCache && Date.now() - qcSelCache.ts < QC_SEL_TTL) return qcSelCache.hosts;
  try {
    const stored = (await chrome.storage.local.get("qc_selectors")).qc_selectors;
    if (stored && Date.now() - stored.ts < QC_SEL_TTL) { qcSelCache = stored; return stored.hosts; }
  } catch {}
  try {
    const cfg = await fetch(QC_SEL_URL).then((r) => (r.ok ? r.json() : null));
    const hosts = qcValidHosts(cfg && cfg.hosts);
    if (hosts) { qcSelCache = { ts: Date.now(), hosts }; chrome.storage.local.set({ qc_selectors: qcSelCache }); return hosts; }
  } catch {}
  try { const stored = (await chrome.storage.local.get("qc_selectors")).qc_selectors; if (stored) return stored.hosts; } catch {}
  return null;
}

// ---- background watch engine ----------------------------------------------
// No tab to babysit: chrome.alarms polls each watched URL via fetch (with the
// user's own cookies), parses stock from the page source, and on a restock
// opens the product + fires a notification; the content script then carts it.
// You only need Chrome running, not the tab open.
const QC_W_KEY = "qc_watches";
const QC_ALARM = "qc-poll";
const QC_POLL_MIN = 1; // minutes — gentle enough not to trip store bot-walls
function qcNorm(u) { try { const x = new URL(u); return x.origin + x.pathname; } catch { return u; } }
async function qcWatches() { return (await chrome.storage.local.get(QC_W_KEY))[QC_W_KEY] || {}; }
async function qcSaveWatch(url, w) {
  const all = await qcWatches(); const k = qcNorm(url);
  if (w) all[k] = w; else delete all[k];
  await chrome.storage.local.set({ [QC_W_KEY]: all });
}
async function qcEnsureAlarm() {
  const all = await qcWatches();
  if (Object.values(all).some((w) => w && w.active && !w.caught)) chrome.alarms.create(QC_ALARM, { periodInMinutes: QC_POLL_MIN });
  else chrome.alarms.clear(QC_ALARM);
}
function qcAvailInStock(node, depth) {
  if (!node || typeof node !== "object" || depth > 6) return false;
  const a = node.availability || (node.offers && node.offers.availability);
  if (typeof a === "string" && /InStock/i.test(a) && !/OutOfStock|SoldOut|PreOrder|BackOrder|Discontinued/i.test(a)) return true;
  for (const k in node) {
    const v = node[k];
    if (v && typeof v === "object") {
      if (Array.isArray(v)) { for (const it of v) if (qcAvailInStock(it, depth + 1)) return true; }
      else if (qcAvailInStock(v, depth + 1)) return true;
    }
  }
  return false;
}
// Parse stock from raw page source (no DOM in a service worker). Returns
// true / false / null(unknown). null never triggers a false buy.
function qcHtmlInStock(html) {
  const blocks = html.match(/<script[^>]+application\/ld\+json[^>]*>[\s\S]*?<\/script>/gi) || [];
  for (const b of blocks) {
    const j = b.replace(/^<script[^>]*>/i, "").replace(/<\/script>\s*$/i, "");
    try { if (qcAvailInStock(JSON.parse(j), 0)) return true; } catch {}
  }
  if (/"availability"\s*:\s*"[^"]*\bInStock\b"/i.test(html)) return true;
  if (/"availability"\s*:\s*"[^"]*\b(OutOfStock|SoldOut|PreOrder|BackOrder)\b"/i.test(html)) return false;
  if (/\b(out of stock|sold out|currently unavailable|notify me when|email me when)\b/i.test(html)) return false;
  return null;
}
async function qcPoll() {
  const all = await qcWatches();
  const active = Object.entries(all).filter(([, w]) => w && w.active && !w.caught);
  if (!active.length) { chrome.alarms.clear(QC_ALARM); return; }
  for (const [url, w] of active) {
    if (w.opened && Date.now() - (w.openedAt || 0) < 90000) continue; // gave it a tab; let content cart
    let html = null;
    try { html = await fetch(url, { credentials: "include", cache: "no-store" }).then((r) => (r.ok ? r.text() : null)); } catch {}
    if (!html) continue;
    if (qcHtmlInStock(html) === true) {
      await qcSaveWatch(url, { ...w, opened: true, openedAt: Date.now() });
      try {
        chrome.notifications?.create("qc-" + Date.now(), {
          type: "basic", iconUrl: chrome.runtime.getURL("icons/icon128.png"), priority: 2,
          title: "QuickCatch — back in stock!",
          message: (w.title ? String(w.title).slice(0, 70) : "Your watched item") + " just restocked. Opening it and adding to your cart.",
        });
      } catch {}
      try { const tab = await chrome.tabs.create({ url, active: true }); if (tab.windowId != null) chrome.windows.update(tab.windowId, { focused: true }); } catch {}
    }
  }
}
chrome.alarms.onAlarm.addListener((a) => { if (a.name === QC_ALARM) qcPoll(); });
if (chrome.runtime.onStartup) chrome.runtime.onStartup.addListener(() => qcEnsureAlarm());

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    try {
      if (msg?.type === "EXTRACT_TOOLS") {
        const out = await extractTools({
          url: msg.url,
          html: msg.html,
          jsonld: msg.jsonld,
          meta: msg.meta,
          title: msg.title,
        });
        sendResponse({ ok: true, tools: out.tools || [], adapter: out.adapter || null });
        return;
      }
      if (msg?.type === "EXECUTE_TOOL") {
        const handler = ACTION_HANDLERS[msg.action?.kind];
        if (!handler) throw new Error(`No handler for action ${msg.action?.kind}`);
        const value = await handler({ ...msg.action, args: msg.args });
        sendResponse({ ok: true, value });
        return;
      }
      if (msg?.type === "CACHE_TOOLS_FOR_TAB") {
        if (sender.tab?.id != null) {
          tabTools.set(sender.tab.id, { url: msg.url, tools: msg.tools });
        }
        sendResponse({ ok: true });
        return;
      }
      if (msg?.type === "GET_TAB_TOOLS") {
        const entry = tabTools.get(msg.tabId);
        sendResponse({ ok: true, ...(entry || { url: null, tools: [] }) });
        return;
      }
      if (msg?.type === "GET_SELECTORS") {
        sendResponse({ ok: true, hosts: await qcGetSelectors() });
        return;
      }
      if (msg?.type === "WATCH_START") {
        await qcSaveWatch(msg.url, { active: true, caught: false, opened: false, title: msg.title || "", startedAt: Date.now() });
        await qcEnsureAlarm();
        qcPoll(); // check immediately in case it's already in stock
        sendResponse({ ok: true, watching: true });
        return;
      }
      if (msg?.type === "WATCH_STOP") {
        await qcSaveWatch(msg.url, null);
        await qcEnsureAlarm();
        sendResponse({ ok: true, watching: false });
        return;
      }
      if (msg?.type === "WATCH_STATUS") {
        const w = (await qcWatches())[qcNorm(msg.url)];
        sendResponse({ ok: true, watching: !!(w && w.active && !w.caught), caught: !!(w && w.caught) });
        return;
      }
      if (msg?.type === "WATCH_CAUGHT") {
        // content script carted it on the opened tab — close out the watch
        const w = (await qcWatches())[qcNorm(msg.url)];
        if (w) { await qcSaveWatch(msg.url, { ...w, active: false, caught: true, caughtAt: Date.now() }); await qcEnsureAlarm(); }
        sendResponse({ ok: true });
        return;
      }
      sendResponse({ ok: false, error: "unknown message" });
    } catch (err) {
      console.error("[WebMCP Anything bg]", err);
      sendResponse({ ok: false, error: String(err?.message || err) });
    }
  })();
  return true; // async sendResponse
});

chrome.tabs.onRemoved.addListener((tabId) => tabTools.delete(tabId));

async function extractTools(ctx) {
  const { url } = ctx;
  const now = Date.now();
  const hit = cache.get(url);
  if (hit && now - hit.ts < CACHE_TTL) return hit.payload;

  for (const adapter of ADAPTERS) {
    const detected = adapter.detect(ctx);
    if (!detected) continue;
    try {
      const data = await adapter.extract(detected);
      const payload = { adapter: adapter.ID, tools: data.tools, meta: data.product };
      cache.set(url, { payload, ts: now });
      // Fire-and-forget push to hosted worker (if user opted in)
      pushToWorker(url, payload).catch(() => {});
      return payload;
    } catch (err) {
      console.warn(`[WebMCP Anything] ${adapter.ID} extract failed:`, err);
    }
  }
  return { adapter: null, tools: [] };
}

async function pushToWorker(url, payload) {
  const { pushToCache, endpoint, apiKey } = await chrome.storage.local.get([
    "pushToCache",
    "endpoint",
    "apiKey",
  ]);
  if (!pushToCache || !endpoint) return;
  const headers = { "content-type": "application/json" };
  if (apiKey) headers["authorization"] = `Bearer ${apiKey}`;
  try {
    await fetch(`${endpoint.replace(/\/$/, "")}/api/v1/cache`, {
      method: "POST",
      headers,
      body: JSON.stringify({ url, payload }),
      keepalive: true,
    });
  } catch (err) {
    // network/CORS failures are non-fatal — extension keeps working
    console.debug("[WebMCP Anything] push failed:", err);
  }
}
