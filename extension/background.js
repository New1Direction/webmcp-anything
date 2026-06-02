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
      if (msg?.type === "RESTOCK_DETECTED") {
        // The watched page flipped back in stock. Notify, and focus the tab.
        try {
          chrome.notifications?.create("qc-" + Date.now(), {
            type: "basic",
            iconUrl: chrome.runtime.getURL("icons/icon128.png"),
            title: "QuickCatch — back in stock!",
            message: (msg.title ? String(msg.title).slice(0, 80) : "Your watched item") +
              " just restocked. Added to your cart — go check out.",
            priority: 2,
          });
        } catch (e) { /* notifications permission missing or unsupported */ }
        if (sender.tab?.id != null) {
          try { chrome.tabs.update(sender.tab.id, { active: true }); } catch (e) {}
          if (sender.tab.windowId != null) { try { chrome.windows.update(sender.tab.windowId, { focused: true }); } catch (e) {} }
        }
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
