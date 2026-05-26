// injected.js — runs in the page's MAIN world.
//
// Two paths:
//   1) If Chrome's native navigator.modelContext.registerTool exists (origin
//      trial / flag enabled), use it directly.
//   2) Otherwise, install a lightweight POLYFILL so the same API works today.
//      Tools register into window.webmcp.tools and can be called from the
//      console or by any agent that reads our shim.

(() => {
  const NS = "WEBMCP_ANYTHING";
  const pending = new Map(); // requestId -> {resolve, reject}
  let registered = [];

  // ---------- Polyfill ----------
  const POLYFILL_FLAG = "__webmcpAnythingPolyfill";

  function installPolyfill() {
    if (navigator[POLYFILL_FLAG]) return; // already installed
    const tools = [];
    const api = {
      registerTool(tool /*, options */) {
        const existing = tools.findIndex((t) => t.name === tool.name);
        if (existing >= 0) tools.splice(existing, 1);
        tools.push(tool);
        return { name: tool.name, unregister: () => {
          const i = tools.findIndex((t) => t.name === tool.name);
          if (i >= 0) tools.splice(i, 1);
        }};
      },
      get tools() { return tools.slice(); },
      async call(name, args = {}) {
        const t = tools.find((x) => x.name === name);
        if (!t) throw new Error(`No WebMCP tool registered: ${name}`);
        return t.execute(args);
      },
    };
    try {
      Object.defineProperty(navigator, "modelContext", {
        value: api,
        configurable: true,
        writable: false,
      });
    } catch {
      // If a read-only modelContext already exists, skip
    }
    // Convenience global for humans
    window.webmcp = api;
    navigator[POLYFILL_FLAG] = true;
    console.info(
      "[WebMCP Anything] Polyfill installed. Native Chrome WebMCP not detected. " +
      "Call tools from the console with: await navigator.modelContext.call('get_price')"
    );
  }

  const hasNative =
    "modelContext" in navigator &&
    typeof navigator.modelContext.registerTool === "function" &&
    !navigator[POLYFILL_FLAG];

  if (!hasNative) installPolyfill();

  // ---------- Bridge ----------
  function sendToContent(type, payload) {
    window.postMessage({ source: NS, dir: "page->bridge", type, payload }, "*");
  }

  function registerAll(tools) {
    registered = tools;
    for (const tool of tools) {
      try {
        navigator.modelContext.registerTool({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema || { type: "object", properties: {} },
          execute: async (args) => {
            if (tool.result !== undefined) return formatResult(tool.result);
            const requestId = crypto.randomUUID();
            return new Promise((resolve, reject) => {
              pending.set(requestId, { resolve, reject });
              sendToContent("EXECUTE", { requestId, name: tool.name, action: tool.action, args });
              setTimeout(() => {
                if (pending.has(requestId)) {
                  pending.delete(requestId);
                  reject(new Error("WebMCP Anything: tool execution timed out"));
                }
              }, 15000);
            });
          },
        });
      } catch (err) {
        console.error("[WebMCP Anything] registerTool failed for", tool.name, err);
      }
    }
    const mode = hasNative ? "native" : "polyfill";
    console.info(`[WebMCP Anything] Registered ${tools.length} WebMCP tools (${mode}).`);
    if (!hasNative && tools.length) {
      console.info(
        "[WebMCP Anything] Try it:\n" +
        tools.map((t) => `  await navigator.modelContext.call(${JSON.stringify(t.name)})`).join("\n")
      );
    }
  }

  function formatResult(r) {
    if (typeof r === "string") return r;
    try { return JSON.stringify(r); } catch { return String(r); }
  }

  window.addEventListener("message", (event) => {
    const msg = event.data;
    if (!msg || msg.source !== NS) return;
    if (msg.dir !== "bridge->page") return;

    if (msg.type === "REGISTER_TOOLS") {
      registerAll(msg.payload.tools || []);
    } else if (msg.type === "EXECUTE_RESULT") {
      const { requestId, ok, value, error } = msg.payload;
      const p = pending.get(requestId);
      if (!p) return;
      pending.delete(requestId);
      ok ? p.resolve(formatResult(value)) : p.reject(new Error(error || "tool failed"));
    }
  });

  // Tell content script we're ready (always — even on polyfill)
  sendToContent("PAGE_READY", { url: location.href });
})();
