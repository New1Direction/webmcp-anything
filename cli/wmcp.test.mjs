import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  validateTarget, validateBase, mcpEndpoint, parseArgs, execute, summarize,
} from "./wmcp.mjs";

const TARGET = "https://petstore3.swagger.io/api/v3/openapi.json";
const BASE = "http://localhost:8787";
function fakeResponse(value, status = 200, type = "application/json") {
  return { ok: status >= 200 && status < 300, status,
    headers: { get: () => type }, text: async () => typeof value === "string" ? value : JSON.stringify(value) };
}

describe("read-only WMCP CLI", () => {
  it("encodes canonical HTTPS target URLs into a stable MCP endpoint", () => {
    const endpoint = mcpEndpoint(TARGET);
    assert.equal(endpoint, "https://wmcp.sh/mcp/u/" + Buffer.from(TARGET).toString("base64url"));
    assert.equal(Buffer.from(endpoint.split("/").at(-1), "base64url").toString(), TARGET);
  });

  it("refuses credentials, signed queries, local targets, and invalid base origins", () => {
    for (const url of ["http://example.com", "https://user:pw@example.com/",
      "https://api.example.com?token=secret", "https://example.com/#fragment",
      "http://127.0.0.1:8000", "file:///etc/passwd", "not-a-url"]) {
      assert.throws(() => validateTarget(url), Error, url);
    }
    assert.equal(validateBase(BASE), BASE);
    assert.throws(() => validateBase("http://api.example.com"));
    assert.throws(() => validateBase("https://wmcp.sh/private"));
    assert.throws(() => validateBase("https://user:pass@wmcp.sh"));
  });

  it("parses arguments and errors on ambiguous / missing flags", () => {
    const parsed = parseArgs(["inspect", TARGET, "--json", "--base", BASE]);
    assert.deepEqual(parsed, { command: "inspect", url: TARGET, base: BASE, json: true });
    assert.equal(parseArgs(["--help"]).help, true);
    assert.throws(() => parseArgs(["execute", TARGET]));
    assert.throws(() => parseArgs(["inspect", TARGET, TARGET]));
    assert.throws(() => parseArgs(["mcp", TARGET, "--base"]));
  });

  it("returns a config without leaking even a supplied API key", async () => {
    const result = await execute({ command: "config", url: TARGET }, {
      apiKey: "webmcp_live_SECRET_DO_NOT_PRINT",
      request: async () => { throw Error("config is offline"); },
    });
    const output = summarize("config", result);
    assert.ok(output.includes("mcp/u/"));
    assert.ok(!output.includes("SECRET_DO_NOT_PRINT"));
    assert.ok(!output.includes("Authorization"));
  });

  it("inspects extracted tools without ever invoking tools/call", async () => {
    let got = "";
    const output = await execute({ command: "inspect", url: TARGET, base: BASE }, {
      request: async (url, opts) => {
        got = String(url);
        assert.equal(opts.method, undefined);
        return fakeResponse({ tools: [{ name: "get_pet", description: "Get a pet" }] });
      },
    });
    assert.ok(got.includes("/api/v1/tools?url="));
    assert.ok(summarize("inspect", output).includes("get_pet"));
    assert.ok(summarize("inspect", output).includes("does not prove"));
  });

  it("negotiates MCP initialize then tools/list; never sends tools/call", async () => {
    const messages = [];
    const result = await execute({ command: "mcp", url: TARGET, base: BASE }, {
      apiKey: "test_key",
      request: async (url, opts) => {
        assert.equal(url, mcpEndpoint(TARGET, BASE));
        assert.equal(opts.headers.authorization, "Bearer test_key");
        messages.push(JSON.parse(opts.body));
        if (messages.length === 1) return fakeResponse({ jsonrpc: "2.0", id: 1,
          result: { protocolVersion: "2025-11-25", serverInfo: { name: "wmcp.sh" } } });
        return fakeResponse({ jsonrpc: "2.0", id: 2,
          result: { tools: [{ name: "get_info", inputSchema: { type: "object", properties: {} } }] } });
      },
    });
    assert.deepEqual(messages.map((m) => m.method), ["initialize", "tools/list"]);
    assert.equal(result.tools.length, 1);
    assert.ok(summarize("mcp", result).includes("get_info"));
  });

  it("detects JSON-RPC failures, HTTP errors, and SSE tool-list responses", async () => {
    await assert.rejects(
      execute({ command: "inspect", url: TARGET }, {
        request: async () => fakeResponse({ error: "rate_limited" }, 429),
      }),
      /429.*rate_limited/,
    );
    await assert.rejects(
      execute({ command: "grade", url: TARGET }, {
        request: async () => fakeResponse({ error: { code: -32600, message: "denied" } }),
      }),
      /denied/,
    );
    const body = 'event: message\ndata: {"grade":"B","host":"example.com"}\n\n';
    const grade = await execute({ command: "grade", url: TARGET }, {
      request: async () => fakeResponse(body, 200, "text/event-stream"),
    });
    assert.equal(grade.grade, "B");
    assert.ok(summarize("grade", grade).includes("Grade") === false);
    assert.ok(summarize("grade", grade).includes("grade: B"));
  });
});
