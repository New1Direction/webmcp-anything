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

// Expose for popup queries
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "GET_TOOLS_FOR_PAGE") {
    sendResponse({ ok: true, tools: lastToolList, url: location.href });
  }
});
