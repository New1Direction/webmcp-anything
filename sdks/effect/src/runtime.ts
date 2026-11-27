import type { WebMCP } from "webmcp-types";

type Descriptor = Omit<WebMCP.Tool, "source" | "origin">;
type Entry = { descriptor: Descriptor; execute: WebMCP.ToolExecuteCallback<object> };

type Registry = Pick<Map<string, Entry>, "get" | "has" | "set" | "delete"> & {
  values(): Iterable<Entry>;
};

export class PageContext extends EventTarget {
  get [Symbol.for("@wmcp/browser/document-only")]() { return true; }

  private discovery?: { entries: Entry[]; metadata: (object | null)[] };
  private handles = new WeakMap<WebMCP.Tool, Entry>();
  ontoolchange: WebMCP.ModelContext["ontoolchange"] = null;
  ontoolactivated: WebMCP.ModelContext["ontoolactivated"] = null;
  ontoolcancel: WebMCP.ModelContext["ontoolcancel"] = null;

  constructor(private readonly entries: Registry = new Map<string, Entry>()) {
    super();
    this.addEventListener("toolchange", event => this.ontoolchange?.(event));
    this.addEventListener("toolactivated", event => this.ontoolactivated?.(event as ToolActivatedEvent));
    this.addEventListener("toolcancel", event => this.ontoolcancel?.(event as ToolCancelEvent));
  }

  async registerTool<I extends object, O extends object>(tool: WebMCP.ModelContextToolFromSchema<I, O>, options: WebMCP.ModelContextRegisterToolOptions = {}) {
    const { name, title = "", description, execute } = tool;
    if (typeof name !== "string" || !/^[a-zA-Z0-9_.-]{1,128}$/.test(name) ||
        !description || this.entries.has(name)) {
      throw new DOMException("Invalid or duplicate tool registration", "InvalidStateError");
    }
    if (typeof execute !== "function") throw new TypeError("Expected a tool callback");
    if (options.exposedTo?.length) throw new DOMException("Frame exposure is unavailable", "NotSupportedError");
    if (options.signal?.aborted) return;
    const descriptor = structuredClone({ name, title, description, inputSchema: tool.inputSchema ?? null,
      outputSchema: tool.outputSchema ?? null, annotations: tool.annotations ?? null });
    this.entries.set(name, { descriptor, execute: execute as WebMCP.ToolExecuteCallback<object> });
    this.discovery = undefined;
    options.signal?.addEventListener("abort", () => {
      this.entries.delete(name);
      this.discovery = undefined;
      this.dispatchEvent(new Event("toolchange"));
    }, { once: true });
    this.dispatchEvent(new Event("toolchange"));
  }

  async getTools(options: WebMCP.ModelContextGetToolOptions = {}) {
    if (options.fromOrigins?.length) throw new DOMException("Frame discovery is unavailable", "NotSupportedError");
    if (!this.discovery) {
      const entries = Array.from(this.entries.values());
      const metadata = entries.flatMap(({ descriptor }) => [
        descriptor.inputSchema, descriptor.outputSchema, descriptor.annotations,
      ]);
      this.discovery = { entries, metadata };
    }
    // Copy mutable metadata in one operation while preserving aliases within each snapshot.
    const metadata = structuredClone(this.discovery.metadata);
    const origin = location.origin;
    return this.discovery.entries.map((entry, index) => {
      const { name, title, description } = entry.descriptor;
      const offset = index * 3;
      const tool = Object.freeze({
        name, title, description, inputSchema: metadata[offset], outputSchema: metadata[offset + 1],
        annotations: metadata[offset + 2], source: window, origin,
      });
      this.handles.set(tool, entry);
      return tool;
    });
  }

  async executeTool(tool: WebMCP.Tool, input: object = {}, options: WebMCP.ModelContextExecuteToolOptions = {}) {
    const entry = this.handles.get(tool);
    if (!entry || this.entries.get(entry.descriptor.name) !== entry) {
      throw new DOMException("Unknown tool registration", "NotFoundError");
    }
    options.signal?.throwIfAborted();
    const args = structuredClone(input);
    const notify = (type: string) => this.dispatchEvent(Object.assign(new Event(type), { toolName: tool.name }));
    const signal = options.signal ?? new AbortController().signal;
    let rejectAbort: (reason: unknown) => void;
    const aborted = new Promise<never>((_, reject) => { rejectAbort = reject; });
    const cancel = () => {
      rejectAbort(signal.reason);
      notify("toolcancel");
    };
    signal.addEventListener("abort", cancel, { once: true });
    try {
      const result = Promise.resolve().then(() => {
        signal.throwIfAborted();
        return entry.execute(args, { signal });
      });
      const pending = Promise.race([result, aborted]);
      notify("toolactivated");
      const json = JSON.stringify(await pending);
      if (json === undefined) throw new TypeError("Tool result must be JSON serializable");
      return json;
    } catch {
      options.signal?.throwIfAborted();
      throw new DOMException("Tool execution failed", "OperationError");
    } finally {
      signal.removeEventListener("abort", cancel);
    }
  }
}

/** Install a document-local imperative WebMCP runtime when the native API is absent. */
export function installWebMCP(): void {
  if (!globalThis.isSecureContext || !globalThis.document || "modelContext" in document) return;
  const context: WebMCP.ModelContext = new PageContext();
  Object.defineProperty(document, "modelContext", { configurable: true, value: context });
}
