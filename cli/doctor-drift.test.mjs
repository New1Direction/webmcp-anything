import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { fingerprintSurface, diffSurface, doctorMcp } from "./doctor.mjs";
import { main } from "./wmcp.mjs";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe("MCP doctor baseline drift", () => {
  it("normalizes object key order and detects added, removed and changed contracts", () => {
    const a = { name: "get_A", description: "Fetch A", inputSchema: { type: "object", properties: { id: { type: "integer" } } } };
    const b = { name: "get_B", description: "Fetch B", inputSchema: { type: "object" } };
    const endpoint = "https://example.com/mcp";
    const first = fingerprintSurface([a, b]);
    const same = fingerprintSurface([b, { ...a, inputSchema: { properties: { id: { type: "integer" } }, type: "object" } }]);
    assert.equal(first.surfaceHash, same.surfaceHash);
    const baseline = { schemaVersion: "wmcp-doctor/v1", endpoint, complete: true, ...first };
    const current = { schemaVersion: "wmcp-doctor/v1", endpoint, complete: true,
      ...fingerprintSurface([{ ...a, description: "Changed A" }, { ...b, name: "get_C" }]) };
    const diff = diffSurface(current, baseline);
    assert.deepEqual(diff.added, ["get_C"]);
    assert.deepEqual(diff.removed, ["get_B"]);
    assert.deepEqual(diff.changed, ["get_A"]);
    assert.equal(diff.changedAny, true);
    assert.throws(() => diffSurface({ ...current, endpoint: "https://other.example/mcp" }, baseline), /different MCP endpoint/);
    assert.throws(() => diffSurface({ ...current, complete: false }, baseline), /incomplete/);
  });

  it("loads a reviewed local JSON baseline through the actual CLI and exits 2 for drift", async () => {
    const dir = mkdtempSync(join(tmpdir(), "wmcp-doctor-"));
    const baselineFile = join(dir, "baseline.json");
    const endpoint = "https://example.com/mcp";
    writeFileSync(baselineFile, JSON.stringify({
      schemaVersion: "wmcp-doctor/v1", endpoint, complete: true,
      ...fingerprintSurface([{ name: "get_status", description: "Original", inputSchema: { type: "object" } }]),
    }));
    const stdout = [];
    const origLog = console.log;
    console.log = (v) => stdout.push(v);
    try {
      const request = async (_url, opts) => {
        const msg = JSON.parse(opts.body);
        if (msg.method === "initialize") return new Response(JSON.stringify({
          jsonrpc: "2.0", id: 1,
          result: { protocolVersion: "2025-11-25", capabilities: { tools: {} }, serverInfo: { name: "demo" } },
        }), { headers: { "content-type": "application/json" } });
        if (msg.method === "notifications/initialized") return new Response(null, { status: 202 });
        return new Response(JSON.stringify({
          jsonrpc: "2.0", id: msg.id,
          result: { tools: [{ name: "get_status", description: "Changed", inputSchema: { type: "object" } }] },
        }), { headers: { "content-type": "application/json" } });
      };
      const exit = await main(["doctor", endpoint, "--baseline", baselineFile, "--json", "--strict"], { request });
      assert.equal(exit, 2);
      const report = JSON.parse(stdout.at(-1));
      assert.deepEqual(report.drift.changed, ["get_status"]);
      assert.equal(report.status, "warning");
    } finally {
      console.log = origLog;
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("reports schema drift as a warning without exposing raw descriptions", async () => {
    const endpoint = "https://example.com/mcp";
    const before = { name: "status", description: "Show status", inputSchema: { type: "object" } };
    const baseline = { schemaVersion: "wmcp-doctor/v1", endpoint, complete: true, ...fingerprintSurface([before]) };
    const request = async (_url, opts) => {
      const m = JSON.parse(opts.body);
      if (m.method === "initialize") return new Response(JSON.stringify({ jsonrpc: "2.0", id: 1,
        result: { protocolVersion: "2025-11-25", capabilities: { tools: {} }, serverInfo: { name: "local" } } }),
        { headers: { "content-type": "application/json" } });
      if (m.method === "notifications/initialized") return new Response(null, { status: 202 });
      return new Response(JSON.stringify({ jsonrpc: "2.0", id: m.id,
        result: { tools: [{ ...before, description: "A NEW UNSAFE UNTRUSTED VALUE" }] } }),
        { headers: { "content-type": "application/json" } });
    };
    const report = await doctorMcp(endpoint, { request, baseline });
    assert.equal(report.status, "warning");
    assert.deepEqual(report.drift.changed, ["status"]);
    assert.equal(report.findings.at(-1).code, "tool_surface_changed");
    assert.ok(!JSON.stringify(report).includes("UNSAFE UNTRUSTED VALUE"));
  });
});
