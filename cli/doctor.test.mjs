import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { execute, parseArgs, main } from "./wmcp.mjs";
import { diagnoseMcp, doctorMcp, formatDoctor } from "./doctor.mjs";
import { validateEndpoint, parseMcpBody, inspectMcpEndpoint } from "./mcp-read.mjs";

async function withHttpServer(handler, run) {
  const server = createServer(async (req, res) => {
    try { await handler(req, res); }
    catch (e) {
      res.writeHead(500, { "content-type": "text/plain" });
      res.end(String(e));
    }
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  try { return await run("http://127.0.0.1:" + server.address().port + "/mcp"); }
  finally { await new Promise((resolve) => server.close(resolve)); }
}

const goodTool = {
  name: "search_records", description: "Find public records by term.",
  inputSchema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] },
  annotations: { readOnlyHint: true },
};

describe("MCP doctor read-only contract", () => {
  it("negotiates a stateful MCP endpoint, sends initialized, paginates and never calls tools", async () => {
    const methods = [];
    let sessionId = "";
    await withHttpServer(async (req, res) => {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const msg = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      methods.push(msg.method);
      const reply = (id, result, extra = {}) => {
        res.writeHead(200, { "content-type": "application/json", ...extra });
        res.end(JSON.stringify({ jsonrpc: "2.0", id, result }));
      };
      if (msg.method === "initialize") {
        assert.equal(req.headers["mcp-session-id"], undefined);
        sessionId = "session-test-secret";
        reply(msg.id, {
          protocolVersion: "2025-11-25",
          capabilities: { tools: { listChanged: true } },
          serverInfo: { name: "sample-mcp" },
        }, { "Mcp-Session-Id": sessionId });
        return;
      }
      assert.equal(req.headers["mcp-session-id"], sessionId);
      assert.equal(req.headers["mcp-protocol-version"], "2025-11-25");
      if (msg.method === "notifications/initialized") {
        res.writeHead(202);
        res.end();
        return;
      }
      if (msg.method === "tools/list") {
        const result = msg.params.cursor
          ? { tools: [{ name: "get_stats", description: "Public stats", inputSchema: { type: "object" } }] }
          : { tools: [goodTool], nextCursor: "next-page" };
        reply(msg.id, result);
        return;
      }
      res.writeHead(400); res.end("Only read-only methods supported");
    }, async (endpoint) => {
      const report = await doctorMcp(endpoint);
      assert.equal(report.status, "pass");
      assert.equal(report.server, "sample-mcp");
      assert.equal(report.toolCount, 2);
      assert.equal(report.pages, 2);
      assert.equal(report.sessionUsed, true);
      assert.equal(report.complete, true);
      assert.equal(report.findings.length, 0);
      assert.ok(!JSON.stringify(report).includes(sessionId));
      assert.match(formatDoctor(report), /PASS/);
    });
    assert.deepEqual(methods, [
      "initialize", "notifications/initialized", "tools/list", "tools/list",
    ]);
  });

  it("flags invalid tool schemas and duplicates as failures without running them", () => {
    const d = diagnoseMcp({
      requestedProtocol: "2025-11-25", protocolVersion: "2025-11-25",
      capabilities: { tools: {} }, truncated: false,
      tools: [
        { name: "create_account", description: "", inputSchema: { type: "string" } },
        { name: "create_account", description: "Another", inputSchema: null },
        { name: "space tool", description: "Not a compliant name", inputSchema: { type: "object" } },
      ],
    });
    assert.equal(d.status, "fail");
    assert.ok(d.findings.some((x) => x.code === "duplicate_name"));
    assert.ok(d.findings.some((x) => x.code === "invalid_input_schema"));
    assert.ok(d.findings.some((x) => x.code === "invalid_name"));
    assert.ok(d.findings.some((x) => x.code === "missing_description"));
  });

  it("warns on missing declared tool capability and truncated results", () => {
    const d = diagnoseMcp({
      requestedProtocol: "2025-11-25", protocolVersion: "2025-06-18",
      capabilities: {}, truncated: true, tools: [goodTool],
    });
    assert.equal(d.status, "warning");
    assert.ok(d.findings.some((x) => x.code === "tools_capability"));
    assert.ok(d.findings.some((x) => x.code === "incomplete_listing"));
    assert.ok(d.findings.some((x) => x.code === "protocol_negotiation"));
  });

  it("refuses signed query URLs but permits explicitly targeted localhost for development", () => {
    assert.equal(validateEndpoint("http://localhost:8787/mcp"), "http://localhost:8787/mcp");
    assert.throws(() => validateEndpoint("https://mcp.example.com/mcp?key=secret"), /query/);
    assert.throws(() => validateEndpoint("http://example.com/mcp"), /HTTPS/);
    assert.throws(() => validateEndpoint("https://user:secret@mcp.example.com/mcp"), /credentials/);
    assert.deepEqual(parseArgs(["doctor", "http://localhost:8787/mcp", "--json", "--strict"]), {
      command: "doctor", url: "http://localhost:8787/mcp",
      base: "https://wmcp.sh", json: true, strict: true,
    });
    assert.throws(() => parseArgs(["mcp", "https://example.com", "--strict"]), /only with doctor/);
  });

  it("parses multiline SSE responses and refuses incorrect JSON-RPC IDs", () => {
    const text = [
      "event: message",
      'data: {"jsonrpc":"2.0","id":2,',
      'data: "result":{"tools":[]}}',
      "",
      "",
    ].join("\n");
    assert.deepEqual(parseMcpBody(text, "text/event-stream", 2), {
      jsonrpc: "2.0", id: 2, result: { tools: [] },
    });
    assert.throws(() => parseMcpBody(text, "text/event-stream", 3), /no matching/);
  });

  it("refuses repeated pagination cursors and stops before infinite loops", async () => {
    const methods = [];
    await assert.rejects(inspectMcpEndpoint("https://example.com/mcp", {
      request: async (url, options) => {
        const msg = JSON.parse(options.body);
        methods.push(msg.method);
        if (msg.method === "initialize") {
          return new Response(JSON.stringify({
            jsonrpc: "2.0", id: 1, result: {
              protocolVersion: "2025-11-25", capabilities: { tools: {} },
            },
          }), { headers: { "content-type": "application/json" } });
        }
        if (msg.method === "notifications/initialized") return new Response(null, { status: 202 });
        return new Response(JSON.stringify({
          jsonrpc: "2.0", id: msg.id, result: { tools: [], nextCursor: "repeat" },
        }), { headers: { "content-type": "application/json" } });
      },
    }), /repeated a pagination cursor/);
    assert.deepEqual(methods, ["initialize", "notifications/initialized", "tools/list", "tools/list"]);
  });

  it("strict mode emits machine-readable findings and returns exit code 2 on warnings", async () => {
    const orig = console.log, records = [];
    console.log = (value) => records.push(value);
    try {
      const req = async (_url, options) => {
        const m = JSON.parse(options.body);
        if (m.method === "initialize") return new Response(JSON.stringify({
          jsonrpc: "2.0", id: 1,
          result: { protocolVersion: "2025-11-25", capabilities: {}, serverInfo: { name: "demo" } },
        }), { headers: { "content-type": "application/json" } });
        if (m.method === "notifications/initialized") return new Response(null, { status: 202 });
        return new Response(JSON.stringify({
          jsonrpc: "2.0", id: m.id,
          result: { tools: [{ name: "missing_description", inputSchema: { type: "object" } }] },
        }), { headers: { "content-type": "application/json" } });
      };
      const code = await main(["doctor", "https://example.com/mcp", "--json", "--strict"], { request: req });
      assert.equal(code, 2);
      const out = JSON.parse(records.at(-1));
      assert.equal(out.status, "warning");
      assert.equal(out.schemaVersion, "wmcp-doctor/v1");
    } finally { console.log = orig; }
  });
});
