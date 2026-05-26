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
