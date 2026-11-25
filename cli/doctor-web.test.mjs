import assert from "node:assert/strict";
import { test } from "node:test";
import { doctorWeb, formatDoctorWeb } from "./doctor-web.mjs";
import { parseArgs } from "./wmcp.mjs";

const page = "https://example.com/preview";
const endpoint = "https://example.com/mcp";
const initial = { name: "search", description: "Find an item", inputSchema: { type: "object" } };
const next = { ...initial, inputSchema: { type: "object", required: ["query"] } };
const scan = (...tools) => async (observedPage) => ({ page: observedPage, browser: "Chrome/160", tools });

function mcpFixture(tools) {
  return async (url, options) => {
    assert.equal(url, endpoint);
    assert.equal(options.headers.authorization, undefined);
    const { id, method } = JSON.parse(options.body);
    if (method === "notifications/initialized") return new Response(null, { status: 202 });
    assert.ok(["initialize", "tools/list"].includes(method));
    const result = method === "initialize"
      ? { protocolVersion: "2025-11-25", capabilities: { tools: {} }, serverInfo: { name: "fixture" } }
      : { tools };
    return Response.json({ jsonrpc: "2.0", id, result });
  };
}

test("browser Doctor CLI routes options without changing the remote Doctor syntax", () => {
  const options = parseArgs(["doctor", "web", page, "--pair", endpoint, "--wait-ms", "100", "--strict"]);
  assert.equal(options.command, "doctor-web");
  assert.equal(options.waitMs, 100);
  assert.equal(options.endpoint, endpoint);
  assert.throws(() => parseArgs(["doctor", "web", page, "--wait-ms", "Infinity"]), /integer/);
  assert.throws(() => parseArgs(["doctor", "web", page + "?token=private"]), /query parameters/);
});

test("checks removed and changed browser tools and permits the same preview path by opt-in", async () => {
  const baseline = await doctorWeb(page, { scan: scan(initial, { ...initial, name: "list_items" }) });
  const preview = "https://pr-123.example.com/preview";
  await assert.rejects(doctorWeb(preview, { scan: scan(next), baseline }), /different page/);
  const result = await doctorWeb(preview, { scan: scan(next), baseline, allowPreviewOrigin: true });
  assert.equal(result.status, "fail");
  assert.deepEqual(result.drift.removed, ["list_items"]);
  assert.deepEqual(result.drift.changed, ["search"]);
  assert.doesNotMatch(JSON.stringify(result), /Find an item/);
});

test("zero observed tools fail and a failed zero-tool report cannot become a baseline", async () => {
  const result = await doctorWeb(page, { scan: scan() });
  assert.equal(result.status, "fail");
  assert.match(formatDoctorWeb(result), /zero top-level WebMCP tools/);
  await assert.rejects(doctorWeb(page, { scan: scan(), baseline: result }), /at least one recorded tool/);
});

test("compares schema parity and reports newly changed or resolved expected differences", async () => {
  const extra = { ...initial, name: "backend_only" };
  const baseline = await doctorWeb(page, { scan: scan(initial), endpoint, request: mcpFixture([initial, extra]) });
  assert.deepEqual(baseline.pair.differences, [{ name: "backend_only", kind: "mcp-only" }]);
  const stable = await doctorWeb(page, { scan: scan(initial), endpoint, baseline, request: mcpFixture([initial, extra]) });
  assert.equal(stable.status, "pass");
  assert.match(formatDoctorWeb(stable), /expected mcp-only: backend_only/);
  const changed = await doctorWeb(page, { scan: scan(initial), endpoint, baseline, request: mcpFixture([next]) });
  assert.equal(changed.status, "fail");
  assert.equal(changed.pair.unexpected[0].kind, "inputSchema");
  assert.equal(changed.pair.resolved[0].name, "backend_only");
});
