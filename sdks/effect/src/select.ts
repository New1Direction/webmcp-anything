import type { WebMCP } from "webmcp-types";

type Runtime = "existing" | "core" | "w3c";
type Selection = { runtime: Runtime; context: WebMCP.ModelContext };
type Scope = "auto" | "document" | "frames";

const installed = new WeakMap<WebMCP.ModelContext, Runtime>();
let pending: Promise<Selection> | undefined;

function current(): Selection | undefined {
  if (!("modelContext" in document)) return;
  const context = document.modelContext;
  if (!context || typeof context.registerTool !== "function" ||
      typeof context.getTools !== "function" || typeof context.executeTool !== "function") {
    throw new Error("The existing WebMCP context lacks registration, discovery, or execution");
  }
  return { context, runtime: installed.get(context) ??
    (Reflect.get(context, Symbol.for("@wmcp/browser/document-only")) === true ? "core" : "existing") };
}

async function install(frames: boolean): Promise<Selection> {
  const module = frames ? await import("@w3c/webmcp-polyfill") : await import("./browser.js");
  const existing = current();
  if (existing) return existing;
  module.installWebMCP();
  const selection = current();
  if (!selection) throw new Error("WebMCP installation failed");
  const runtime = frames ? "w3c" : "core";
  installed.set(selection.context, runtime);
  return { context: selection.context, runtime };
}

/** Call before registering tools. Auto scope inspects the frame tree at selection time. */
export async function selectWebMCP({ scope = "auto" }: { scope?: Scope } = {}): Promise<Selection> {
  if (!globalThis.isSecureContext || !globalThis.document) {
    throw new Error("WebMCP requires a secure browser document");
  }
  const frames = scope === "frames" || (scope === "auto" &&
    (window.parent !== window || document.querySelector("iframe, frame") !== null));
  const selection = current() ?? await (pending ??= install(frames).finally(() => { pending = undefined; }));
  if (frames && selection.runtime === "core") {
    throw new Error("Document-only WebMCP is active. Select frame scope before registering tools.");
  }
  return selection;
}
