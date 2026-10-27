// Tests for the dual-emit WebMCP/MCP bridge and October 2026 browser API.
import { describe, it, expect, vi } from "vitest";
import { webmcpShimJs, bridgeDescriptor } from "../src/webmcp_bridge";
import { base64urlEncode } from "../src/u";

const SITE = "https://www.allbirds.com/products/x";
const tools = [
  { name: "get_price", description: "Get the price", inputSchema: { type: "object", properties: {} }, result: { price: "$98" } },
  { name: "add_to_cart", description: "Add to cart", inputSchema: { type: "object", properties: { variant: { type: "number" } } }, action: { kind: "add_to_cart" } },
];

function executeShim(
  js: string,
  opts: {
    modern?: any;
    legacy?: any;
    origin?: string;
    window?: Record<string, any>;
    fetcher?: any;
  } = {},
) {
  const win = opts.window || {};
  const execute = new Function("document", "navigator", "window", "location", "AbortController", "fetch", js);
  execute(
    { modelContext: opts.modern },
    { modelContext: opts.legacy },
    win,
    { origin: opts.origin || "https://www.allbirds.com" },
    AbortController,
    opts.fetcher || vi.fn(),
  );
  return win;
}

describe("bridgeDescriptor — one extraction, both protocols", () => {
  it("emits the MCP url, WebMCP snippet, and trust grade", () => {
    const d = bridgeDescriptor(SITE, tools, "https://wmcp.sh");
    const b64 = base64urlEncode(SITE);
    expect(d.mcp.url).toBe("https://wmcp.sh/mcp/u/" + b64);
    expect(d.webmcp.script_url).toBe("https://wmcp.sh/webmcp/" + b64 + ".js");
    expect(d.webmcp.snippet).toContain('<script src="https://wmcp.sh/webmcp/' + b64 + '.js"');
    expect(d.host).toBe("www.allbirds.com");
    expect(d.grade.badge).toBe("https://wmcp.sh/mcp/grade/www.allbirds.com/badge.svg");
    expect(d.tools_count).toBe(2);
    expect(d.tools.find((t: any) => t.name === "get_price")!.live).toBe(false);
    expect(d.tools.find((t: any) => t.name === "add_to_cart")!.live).toBe(true);
  });
});

describe("webmcpShimJs — current spec and compatibility", () => {
  it("prefers document.modelContext, registers async, and keeps read actions local", async () => {
    const js = webmcpShimJs(SITE, tools, "https://wmcp.sh");
    const registered: any[] = [];
    const modern = { registerTool: vi.fn(async (tool: any, options: any) => registered.push({ tool, options })) };
    const legacy = { registerTool: vi.fn(() => { throw Error("legacy should not be called"); }) };
    const fetcher = vi.fn();
    executeShim(js, { modern, legacy, fetcher });
    await Promise.resolve();
    expect(modern.registerTool).toHaveBeenCalledTimes(2);
    expect(legacy.registerTool).not.toHaveBeenCalled();
    expect(registered.map((r) => r.tool.name).sort()).toEqual(["add_to_cart", "get_price"]);
    const read = registered.find((r) => r.tool.name === "get_price");
    expect(read.tool.annotations.readOnlyHint).toBe(true);
    expect(read.options.signal).toBeInstanceOf(AbortSignal);
    const response = await read.tool.execute({});
    expect(response.content[0].text).toContain("$98");
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("retains legacy navigator.modelContext support", async () => {
    const registrations: string[] = [];
    executeShim(webmcpShimJs(SITE, tools, "https://wmcp.sh"), {
      legacy: { registerTool: async (tool: any) => { registrations.push(tool.name); } },
    });
    await Promise.resolve();
    expect(registrations).toEqual(["get_price", "add_to_cart"]);
  });

  it("does nothing on unsupported browsers or an unrelated origin", () => {
    const js = webmcpShimJs(SITE, tools, "https://wmcp.sh");
    expect(() => executeShim(js)).not.toThrow();
    const registerTool = vi.fn();
    executeShim(js, { modern: { registerTool }, origin: "https://other.example" });
    expect(registerTool).not.toHaveBeenCalled();
  });

  it("aborts earlier registrations when the shim is initialized again", async () => {
    const recorded: any[] = [];
    const context = { registerTool: async (tool: any, options: any) => { recorded.push(options.signal); } };
    const win: Record<string, any> = {};
    const js = webmcpShimJs(SITE, tools, "https://wmcp.sh");
    executeShim(js, { modern: context, window: win });
    const firstSignal = recorded[0];
    expect(firstSignal.aborted).toBe(false);
    executeShim(js, { modern: context, window: win });
    expect(firstSignal.aborted).toBe(true);
    expect(recorded[2].aborted).toBe(false);
  });

  it("does not embed untrusted site URLs in JavaScript comments", () => {
    const hostileUrl = SITE + "*/\nthrow new Error('injected');\n/*";
    const js = webmcpShimJs(hostileUrl, tools, "https://wmcp.sh");
    expect(js.slice(0, js.indexOf("(function ()"))).not.toContain(hostileUrl);
    expect(() => new Function("document", "navigator", "window", "location", "AbortController", "fetch", js)).not.toThrow();
  });

  it("does not shadow site-authored native WebMCP tools", async () => {
    const registered: string[] = [];
    const modern = {
      getTools: async () => [{ name: "get_price" }],
      registerTool: async (tool: any) => { registered.push(tool.name); },
    };
    executeShim(webmcpShimJs(SITE, tools, "https://wmcp.sh"), { modern });
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    expect(registered).toEqual(["add_to_cart"]);
  });

  it("routes live actions through the existing paid execute gate with cancellation", async () => {
    const registered: any[] = [];
    const context = { registerTool: async (tool: any) => { registered.push(tool); } };
    const fetcher = vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ value: "added" }) }));
    executeShim(webmcpShimJs(SITE, tools, "https://wmcp.sh"), { modern: context, fetcher });
    const tool = registered.find((t) => t.name === "add_to_cart");
    expect(tool.annotations.consequentialHint).toBe(true);
    const controller = new AbortController();
    const result = await tool.execute({ variant: 42 }, { signal: controller.signal });
    expect(result.content[0].text).toBe("added");
    expect(fetcher).toHaveBeenCalledWith("https://wmcp.sh/api/v1/tools/execute",
      expect.objectContaining({
        signal: controller.signal,
        body: JSON.stringify({ url: SITE, tool: "add_to_cart", args: { variant: 42 } }),
      }));
  });
});
