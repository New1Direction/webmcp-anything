// injected.js — runs in the page's MAIN world.
//
// Native WebMCP uses document.modelContext in the October 2026 draft.
// Retain navigator.modelContext compatibility for older browser previews.
// Without native support, expose an isolated test helper at window.webmcp;
// do NOT fake a browser-native API or pretend agents will discover it.
(() => {
  const NS = "WEBMCP_ANYTHING";
  const pending = new Map();
  let activeController = null;
  let registered = [];
  let syntheticNames = new Set();
  let nativeNames = new Set();
  let nativeSignatures = new Map();

  const nativeContext =
    (document.modelContext && typeof document.modelContext.registerTool === "function")
      ? document.modelContext
      : (navigator.modelContext && typeof navigator.modelContext.registerTool === "function")
        ? navigator.modelContext : null;
  const hasNative = !!nativeContext;

  function installPolyfill() {
    const tools = [];
    const api = {
      async registerTool(tool, options = {}) {
        if (options.signal?.aborted) throw new Error("Registration aborted");
        if (tools.some((t) => t.name === tool.name)) throw new Error("Duplicate WebMCP tool: " + tool.name);
        tools.push(tool);
        if (options.signal) {
          options.signal.addEventListener("abort", () => {
            const index = tools.indexOf(tool);
            if (index !== -1) tools.splice(index, 1);
          }, { once: true });
        }
      },
      async getTools() {
        return tools.map(({ name, title, description, inputSchema, annotations }) =>
          ({ name, title, description, inputSchema, annotations }));
      },
      async call(name, args = {}) {
        const tool = tools.find((t) => t.name === name);
        if (!tool) throw new Error("No WebMCP tool registered: " + name);
        return tool.execute(args, { signal: new AbortController().signal });
      },
    };
    window.webmcp = api;
    console.info("[WebMCP Anything] Native WebMCP unavailable. Local test helper: window.webmcp.call(name, args)");
    return api;
  }

  const context = nativeContext || installPolyfill();

  // ---------- Browser-native tool discovery (local to this tab) ----------
  // getTools() may return RegisteredTool objects with window references and
  // methods. Only copy the small structured metadata subset across contexts.
  async function nativeTools() {
    if (!hasNative || typeof context.getTools !== "function") return [];
    const all = await context.getTools();
    return (Array.isArray(all) ? all : []).filter((tool) =>
      tool && typeof tool.name === "string" &&
      !syntheticNames.has(tool.name) &&
      (!tool.origin || tool.origin === location.origin));
  }

  function nativeSignature(tool) {
    try {
      // A native tool may be replaced after a user saw its description.
      // Compare the current browser-supplied definition before executing it.
      return JSON.stringify({
        name: tool.name, description: tool.description, origin: tool.origin,
        inputSchema: tool.inputSchema, annotations: tool.annotations,
      });
    } catch { return null; }
  }

  async function publishNativeTools() {
    try {
      const found = await nativeTools();
      nativeNames = new Set(found.map((tool) => tool.name));
      nativeSignatures = new Map(found.map((tool) => [tool.name, nativeSignature(tool)]));
      const safe = found.slice(0, 64).map((tool) => {
        const entry = {
          name: tool.name.slice(0, 128),
          description: String(tool.description || "").slice(0, 2000),
          source: "native",
          annotations: {
            readOnlyHint: tool.annotations?.readOnlyHint === true,
            consequentialHint: tool.annotations?.consequentialHint === true,
          },
        };
        try {
          const schema = JSON.stringify(tool.inputSchema || { type: "object", properties: {} });
          entry.inputSchema = JSON.parse(schema.length > 12000 ? '{"type":"object","properties":{}}' : schema);
        } catch { entry.inputSchema = { type: "object", properties: {} }; }
        return entry;
      });
      sendToContent("NATIVE_TOOLS", { url: location.href, tools: safe });
    } catch (err) {
      console.warn("[WebMCP Anything] Could not discover native tools:", err);
    }
  }

  async function invokeNativeTool(payload) {
    const requestId = payload?.requestId;
    try {
      if (!hasNative || typeof context.executeTool !== "function")
        throw new Error("Native WebMCP tool execution unavailable");
      const args = payload?.args || {};
      if (typeof args !== "object" || Array.isArray(args))
        throw new Error("Native WebMCP arguments must be an object");
      const name = payload?.name;
      const found = (await nativeTools()).find((tool) => tool.name === name);
      if (!found || !nativeNames.has(name))
        throw new Error("Native WebMCP tool is not available on this page");
      const signature = nativeSignature(found);
      if (!signature || signature !== nativeSignatures.get(name))
        throw new Error("Native WebMCP tool changed since discovery; refresh tools before running");
      const result = await context.executeTool(found, args);
      // Never transfer arbitrary objects from the page realm. The spec returns
      // a string, but normalize older previews defensively.
      const safeResult = typeof result === "string" ? result : JSON.stringify(result);
      sendToContent("NATIVE_RESULT", { requestId, ok: true, value: safeResult.slice(0, 64000) });
    } catch (err) {
      sendToContent("NATIVE_RESULT", { requestId, ok: false, error: String(err?.message || err).slice(0, 300) });
    }
  }

  if (hasNative && typeof context.addEventListener === "function") {
    context.addEventListener("toolchange", () => publishNativeTools());
  }

  // ---------- Bridge ----------
  function sendToContent(type, payload) {
    window.postMessage({ source: NS, dir: "page->bridge", type, payload }, "*");
  }

  async function registerAll(tools) {
    // Detach our earlier registrations when the URL changes or extraction refreshes.
    // This never removes tools registered by the host website.
    if (activeController) activeController.abort();
    activeController = new AbortController();
    const signal = activeController.signal;
    registered = tools;
    syntheticNames = new Set();
    // Site-authored native tools take precedence; don't shadow or replace them.
    let existing = [];
    try {
      if (hasNative && typeof context.getTools === "function") existing = await context.getTools();
    } catch (err) {
      console.warn("[WebMCP Anything] Could not inspect native site tools:", err);
    }
    if (signal.aborted) return;
    const nativeNames = new Set(existing.map((t) => t.name));
    const candidates = tools.filter((t) => !nativeNames.has(t.name));
    const results = await Promise.allSettled(candidates.map(async (tool) => {
      const readOnly = tool.result !== undefined;
      await context.registerTool({
        name: tool.name,
        description: tool.description || tool.name,
        inputSchema: tool.inputSchema || { type: "object", properties: {} },
        annotations: readOnly ? { readOnlyHint: true } : { consequentialHint: true },
        execute: async (args, options = {}) => {
          if (signal.aborted) throw new Error("WebMCP registration expired");
          if (readOnly) return formatResult(tool.result);
          const requestId = crypto.randomUUID();
          return new Promise((resolve, reject) => {
            const onAbort = () => {
              pending.delete(requestId);
              reject(new Error("WebMCP tool call cancelled"));
            };
            if (options.signal?.aborted) return onAbort();
            if (options.signal) options.signal.addEventListener("abort", onAbort, { once: true });
            pending.set(requestId, { resolve, reject, cleanup: () => options.signal?.removeEventListener("abort", onAbort) });
            sendToContent("EXECUTE", { requestId, name: tool.name, args });
            setTimeout(() => {
              const p = pending.get(requestId);
              if (p) {
                pending.delete(requestId);
                p.cleanup();
                reject(new Error("WebMCP Anything: tool execution timed out"));
              }
            }, 15000);
          });
        },
      }, { signal });
    }));
    results.forEach((result, i) => {
      if (result.status === "rejected" && !signal.aborted) {
        console.warn("[WebMCP Anything] WebMCP registration failed:", candidates[i].name, result.reason);
      }
    });
    if (signal.aborted) return;
    syntheticNames = new Set(candidates.filter((_, i) => results[i].status === "fulfilled").map((t) => t.name));
    await publishNativeTools();
    console.info("[WebMCP Anything] Registered " + results.filter((r) => r.status === "fulfilled").length
      + "/" + candidates.length + " synthesized WebMCP tools (" + (hasNative ? "native" : "local test helper") + "); native site tools preserved.");
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
    } else if (msg.type === "REFRESH_NATIVE_TOOLS") {
      publishNativeTools();
    } else if (msg.type === "INVOKE_NATIVE") {
      invokeNativeTool(msg.payload);
    } else if (msg.type === "EXECUTE_RESULT") {
      const { requestId, ok, value, error } = msg.payload;
      const p = pending.get(requestId);
      if (!p) return;
      pending.delete(requestId);
      p.cleanup();
      ok ? p.resolve(formatResult(value)) : p.reject(new Error(error || "tool failed"));
    }
  });

  // Tell content script we're ready (always — even on polyfill)
  sendToContent("PAGE_READY", { url: location.href });
  // Framework apps often register their WebMCP tools after DOMContentLoaded.
  publishNativeTools();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => publishNativeTools(), { once: true });
  }
})();
