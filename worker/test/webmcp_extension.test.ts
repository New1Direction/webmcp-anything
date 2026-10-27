// Tests browser WebMCP registration without a Chrome runtime.
import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";

const injected = readFileSync(new URL("../../extension/injected.js", import.meta.url), "utf8");
const contentScript = readFileSync(new URL("../../extension/content.js", import.meta.url), "utf8");
const popupScript = readFileSync(new URL("../../extension/popup.js", import.meta.url), "utf8");
const extensionManifest = JSON.parse(readFileSync(new URL("../../extension/manifest.json", import.meta.url), "utf8"));
const SITE = "https://www.allbirds.com/products/x";

function boot(modern?: any, legacy?: any) {
  const listeners: Record<string, (event: any) => void> = {};
  const sent: any[] = [];
  const win: any = {
    addEventListener(type: string, handler: (event: any) => void) { listeners[type] = handler; },
    postMessage(message: any) { sent.push(message); },
  };
  const doc: any = { modelContext: modern };
  const nav: any = { modelContext: legacy };
  const log = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
  new Function(
    "document", "navigator", "window", "location", "crypto",
    "AbortController", "setTimeout", "console", injected,
  )(doc, nav, win, { href: SITE, origin: "https://www.allbirds.com" },
    { randomUUID: () => "id-123" }, AbortController, () => 1, log);
  function emit(type: string, payload: any) {
    listeners.message({ data: { source: "WEBMCP_ANYTHING", dir: "bridge->page", type, payload } });
  }
  return { win, doc, nav, sent, log, emit };
}

const read = { name: "get_price", description: "Get price", result: { price: 99 } };
const live = { name: "add_to_cart", description: "Add item", action: { kind: "add_to_cart" } };

async function drain() {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
}

describe("extension's WebMCP registration", () => {
  it("uses document.modelContext and preserves site-owned tools", async () => {
    const inserted: any[] = [];
    const modelContext = {
      getTools: vi.fn(async () => [{ name: "get_price" }]),
      registerTool: vi.fn(async (tool: any, opts: any) => inserted.push({ tool, opts })),
    };
    const legacy = { registerTool: vi.fn() };
    const page = boot(modelContext, legacy);
    page.emit("REGISTER_TOOLS", { tools: [read, live] });
    await drain();
    expect(modelContext.getTools).toHaveBeenCalled();
    expect(inserted.map((i) => i.tool.name)).toEqual(["add_to_cart"]);
    expect(inserted[0].tool.annotations.consequentialHint).toBe(true);
    expect(legacy.registerTool).not.toHaveBeenCalled();
    const firstSignal = inserted[0].opts.signal;
    page.emit("REGISTER_TOOLS", { tools: [live] });
    await drain();
    expect(firstSignal.aborted).toBe(true);
    expect(inserted[1].opts.signal.aborted).toBe(false);
  });

  it("does not impersonate a native API when the browser lacks WebMCP", async () => {
    const page = boot();
    page.emit("REGISTER_TOOLS", { tools: [read] });
    await drain();
    expect(page.doc.modelContext).toBeUndefined();
    expect(page.nav.modelContext).toBeUndefined();
    expect((await page.win.webmcp.getTools()).map((t: any) => t.name)).toEqual(["get_price"]);
    expect(await page.win.webmcp.call("get_price")).toContain("99");
    page.emit("REGISTER_TOOLS", { tools: [] });
    await drain();
    expect(await page.win.webmcp.getTools()).toEqual([]);
  });

  it("discovers site-authored tools locally and invokes their real registered handle", async () => {
    const siteTool = {
      name: "search_orders",
      description: "Find orders",
      origin: "https://www.allbirds.com",
      inputSchema: { type: "object", properties: { query: { type: "string" } } },
      annotations: { readOnlyHint: true },
    };
    const executeTool = vi.fn(async (tool: any, args: any) => {
      expect(tool).toBe(siteTool);
      expect(args).toEqual({ query: "test" });
      return "found 2 orders";
    });
    const page = boot({
      getTools: async () => [siteTool],
      executeTool,
      registerTool: async () => {},
    });
    await drain();
    const discovery = page.sent.find((msg) => msg.type === "NATIVE_TOOLS");
    expect(discovery.payload.url).toBe(SITE);
    expect(discovery.payload.tools).toEqual([expect.objectContaining({
      name: "search_orders", source: "native",
      annotations: { readOnlyHint: true, consequentialHint: false },
    })]);
    page.emit("INVOKE_NATIVE", {
      requestId: "native-1", name: "search_orders", args: { query: "test" },
    });
    await drain();
    expect(executeTool).toHaveBeenCalledTimes(1);
    const result = page.sent.find((msg) => msg.type === "NATIVE_RESULT");
    expect(result.payload).toMatchObject({ requestId: "native-1", ok: true, value: "found 2 orders" });
  });

  it("rejects a native tool whose definition changed after discovery", async () => {
    const siteTool = {
      name: "order", description: "Preview order",
      origin: "https://www.allbirds.com",
      inputSchema: { type: "object", properties: {} },
    };
    const executeTool = vi.fn();
    const page = boot({
      getTools: async () => [siteTool], executeTool,
      registerTool: async () => {},
    });
    await drain();
    siteTool.description = "Purchase order";
    page.emit("INVOKE_NATIVE", { requestId: "native-drift", name: "order", args: {} });
    await drain();
    expect(executeTool).not.toHaveBeenCalled();
    const result = page.sent.find((msg) => msg.type === "NATIVE_RESULT");
    expect(result.payload).toMatchObject({ requestId: "native-drift", ok: false });
    expect(result.payload.error).toContain("changed since discovery");
  });

  it("does not expose foreign-origin tools or execute unknown names", async () => {
    const executeTool = vi.fn();
    const page = boot({
      getTools: async () => [
        { name: "foreign", origin: "https://third-party.example" },
      ],
      executeTool, registerTool: async () => {},
    });
    await drain();
    const discovery = page.sent.find((msg) => msg.type === "NATIVE_TOOLS");
    expect(discovery.payload.tools).toEqual([]);
    page.emit("INVOKE_NATIVE", { requestId: "native-2", name: "foreign", args: {} });
    await drain();
    expect(executeTool).not.toHaveBeenCalled();
    expect(page.sent.find((msg) => msg.type === "NATIVE_RESULT").payload.ok).toBe(false);
  });

  it("forwards only the registered tool name and arguments, not arbitrary actions", async () => {
    const registrations: any[] = [];
    const page = boot({ registerTool: async (tool: any) => { registrations.push(tool); } });
    page.emit("REGISTER_TOOLS", { tools: [live] });
    await drain();
    const pending = registrations[0].execute({ quantity: 2 });
    const msg = page.sent.find((message) => message.type === "EXECUTE");
    expect(msg.payload.name).toBe("add_to_cart");
    expect(msg.payload.args).toEqual({ quantity: 2 });
    expect(msg.payload.action).toBeUndefined();
    page.emit("EXECUTE_RESULT", { requestId: msg.payload.requestId, ok: true, value: "done" });
    expect(await pending).toBe("done");
  });
});


describe("extension content relay — browser-local native calls", () => {
  function bootContent() {
    const windowListeners: Record<string, (event: any) => void> = {};
    const chromeListeners: Array<(message: any, sender: any, response: (value: any) => void) => boolean | void> = [];
    const posted: any[] = [];
    const url = SITE;
    const windowMock = {
      addEventListener: (name: string, fn: (event: any) => void) => { windowListeners[name] = fn; },
      postMessage: (message: any) => { posted.push(message); },
    };
    const documentMock = {
      readyState: "loading",
      createElement: () => ({ remove() {} }),
      head: { appendChild() {} },
      addEventListener() {},
    };
    const chromeMock = {
      runtime: {
        getURL: (path: string) => path,
        sendMessage: async () => ({ ok: true, hosts: {} }),
        onMessage: { addListener: (fn: any) => chromeListeners.push(fn) },
      },
    };
    const locationMock = { href: url, origin: "https://www.allbirds.com" };
    new Function("window", "document", "chrome", "location", "crypto", "setInterval", "setTimeout", "clearTimeout", "console", contentScript)(
      windowMock, documentMock, chromeMock, locationMock,
      { randomUUID: () => "native-call-1" }, () => 0, () => 0, () => {}, { warn: () => {} },
    );
    const receivePageMessage = (type: string, payload: any, origin = locationMock.origin) =>
      windowListeners.message({
        source: windowMock, origin,
        data: { source: "WEBMCP_ANYTHING", dir: "page->bridge", type, payload },
      });
    return { receivePageMessage, chromeListeners, posted, locationMock };
  }

  it("only forwards a current-tab native tool call and its answer", async () => {
    const p = bootContent();
    p.receivePageMessage("NATIVE_TOOLS", {
      url: SITE,
      tools: [{ name: "search_orders", source: "native", description: "Orders", annotations: { readOnlyHint: true } }],
    });
    let answer: any = null;
    const ret = p.chromeListeners[0](
      { type: "EXECUTE_NATIVE_TOOL", name: "search_orders", args: { query: "hello" } },
      {}, (value) => { answer = value; });
    expect(ret).toBe(true);
    const request = p.posted.find((m) => m.type === "INVOKE_NATIVE");
    expect(request.payload).toEqual({ requestId: "native-call-1", name: "search_orders", args: { query: "hello" } });
    p.receivePageMessage("NATIVE_RESULT", { requestId: "native-call-1", ok: true, value: "2 orders" });
    await Promise.resolve();
    expect(answer).toEqual({ ok: true, value: "2 orders" });
  });

  it("rejects unregistered names and ignores cross-origin discovery", () => {
    const p = bootContent();
    p.receivePageMessage("NATIVE_TOOLS", {
      url: SITE, tools: [{ name: "fake", source: "native" }],
    }, "https://attacker.example");
    let response: any = null;
    p.chromeListeners[0]({ type: "EXECUTE_NATIVE_TOOL", name: "fake", args: {} }, {}, (r) => { response = r; });
    expect(response).toEqual({ ok: false, error: expect.stringContaining("unavailable") });
    expect(p.posted.some((message) => message.type === "INVOKE_NATIVE")).toBe(false);
  });
});


describe("opt-in active-tab WebMCP activation", () => {
  it("injects only into the clicked tab without broad host permissions", async () => {
    expect(extensionManifest.permissions).toContain("activeTab");
    expect(extensionManifest.permissions).toContain("scripting");
    expect(extensionManifest.host_permissions).not.toContain("<all_urls>");
    const start = popupScript.indexOf("function initWebmcp(tab) {");
    const end = popupScript.indexOf("function render(", start);
    expect(start).toBeGreaterThan(0);
    expect(end).toBeGreaterThan(start);
    const definition = popupScript.slice(start, end);
    const actions: Array<{ target: any; world: string; files?: string[]; func?: any }> = [];
    let onClick: () => Promise<void> = async () => {};
    const button = { disabled: false, textContent: "", addEventListener: (_: string, fn: any) => { onClick = fn; } };
    const note = { textContent: "" };
    const doc = { getElementById: (id: string) => id === "wmcp-enable" ? button : note };
    const chrome = {
      tabs: { sendMessage: async () => { throw Error("not installed yet"); } },
      scripting: { executeScript: async (spec: any) => { actions.push(spec); return []; } },
    };
    const refresh = vi.fn(async () => {});
    const init = new Function("document", "chrome", "refreshCurrentTools", definition + "return initWebmcp;")(doc, chrome, refresh);
    init({ id: 14, url: SITE });
    await onClick();
    expect(actions).toHaveLength(3);
    expect(actions.every((action) => action.target.tabId === 14)).toBe(true);
    expect(actions.map((action) => action.world)).toEqual(["ISOLATED", "ISOLATED", "MAIN"]);
    expect(actions[1].files).toEqual(["content.js"]);
    expect(actions[2].files).toEqual(["injected.js"]);
    expect(refresh).toHaveBeenCalledOnce();
  });
});
