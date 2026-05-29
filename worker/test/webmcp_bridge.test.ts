// test/webmcp_bridge.test.ts — the dual-emit MCP↔WebMCP bridge.
import { describe, it, expect } from "vitest";
import { webmcpShimJs, bridgeDescriptor } from "../src/webmcp_bridge";
import { base64urlEncode } from "../src/u";

const SITE = "https://www.allbirds.com/products/x";
const tools = [
  { name: "get_price", description: "Get the price", inputSchema: { type: "object", properties: {} }, result: { price: "$98" } },
  { name: "add_to_cart", description: "Add to cart", inputSchema: { type: "object", properties: { variant: { type: "number" } } }, action: { kind: "add_to_cart" } },
];

describe("bridgeDescriptor — one extraction, both protocols", () => {
  it("emits the MCP url, the WebMCP shim url+snippet, and the grade", () => {
    const d = bridgeDescriptor(SITE, tools, "https://wmcp.sh");
    const b64 = base64urlEncode(SITE);
    expect(d.mcp.url).toBe(`https://wmcp.sh/mcp/u/${b64}`);
    expect(d.webmcp.script_url).toBe(`https://wmcp.sh/webmcp/${b64}.js`);
    expect(d.webmcp.snippet).toContain(`<script src="https://wmcp.sh/webmcp/${b64}.js"`);
    expect(d.host).toBe("www.allbirds.com");
    expect(d.grade.badge).toBe("https://wmcp.sh/mcp/grade/www.allbirds.com/badge.svg");
    expect(d.tools_count).toBe(2);
    expect(d.tools.find((t: any) => t.name === "get_price")!.live).toBe(false); // has static result
    expect(d.tools.find((t: any) => t.name === "add_to_cart")!.live).toBe(true); // live action
  });
});

describe("webmcpShimJs", () => {
  it("targets navigator.modelContext + the execute path + embeds the site", () => {
    const js = webmcpShimJs(SITE, tools, "https://wmcp.sh");
    expect(js).toContain("navigator.modelContext.registerTool");
    expect(js).toContain('"get_price"');
    expect(js).toContain('"add_to_cart"');
    expect(js).toContain("/api/v1/tools/execute");
    expect(js).toContain(SITE);
    expect(js).toContain('typeof navigator === "undefined"'); // SSR/no-WebMCP guard
  });

  it("actually runs: registers every tool, and a read-tool handler returns the embedded result with no fetch", async () => {
    const js = webmcpShimJs(SITE, tools, "https://wmcp.sh");
    const registered: any[] = [];
    const fakeNavigator = { modelContext: { registerTool: (t: any) => registered.push(t) } };
    // Execute the shim IIFE with our fake navigator in scope.
    new Function("navigator", js)(fakeNavigator);
    expect(registered.map((t) => t.name).sort()).toEqual(["add_to_cart", "get_price"]);

    const getPrice = registered.find((t) => t.name === "get_price");
    const out = await getPrice.execute({});
    expect(out.isError).toBeFalsy();
    expect(out.content[0].text).toContain("$98"); // embedded read result, no network
  });

  it("does nothing when navigator.modelContext is absent (no throw)", () => {
    const js = webmcpShimJs(SITE, tools, "https://wmcp.sh");
    expect(() => new Function("navigator", js)({})).not.toThrow();
  });
});
