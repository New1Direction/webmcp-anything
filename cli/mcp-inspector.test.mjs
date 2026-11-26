import { test } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { checkSchema, validateValue } from "../examples/mcp-inspector/schemas.mjs";
import { analyzeTrace, TRACE_VERSION } from "../examples/mcp-inspector/trace.mjs";
import { inspectorServer } from "../examples/mcp-inspector/server.mjs";

const send = (atMs, id, method, params = {}) =>
  ({ atMs, direction: "send", message: { jsonrpc: "2.0", id, method, params } });
const receive = (atMs, id, result) =>
  ({ atMs, direction: "receive", message: { jsonrpc: "2.0", id, result } });
const analysis = (...events) => analyzeTrace({ schemaVersion: TRACE_VERSION, events });
const schema = { type: "object", properties: { result: { $ref: "#/$defs/Count" } },
  $defs: { Count: { type: "integer", minimum: 0 } }, required: ["result"], additionalProperties: false };

test("inspector schema checks resolve local references and report unsupported syntax distinctly", () => {
  assert.equal(checkSchema(schema, { objectRoot: true }).status, "valid");
  assert.equal(validateValue(schema, { result: 3 }).status, "valid");
  assert.deepEqual(validateValue(schema, { result: "3" }), {
    status: "invalid", issues: [{ path: "/result", message: "Expected integer." }],
  });
  assert.equal(checkSchema({ type: "string" }, { objectRoot: true }).status, "invalid");
  assert.equal(checkSchema({ $ref: "https://external.example/schema" }).status, "unsupported");
  assert.equal(checkSchema({ type: "string", pattern: "x" }).status, "unsupported");
});

test("inspector validates before masking and withholds header, payload, error, ID and schema values", () => {
  const names = {
    auth: "fake-auth-canary", session: "fake-session-canary", content: "opaque-payload-canary",
    credential: "fake-password-canary", id: "fake-request-id-canary", schemaValue: "fake-enum-canary",
    error: "fake-rpc-message-canary",
  };
  const discover = send(0, 1, "tools/list");
  discover.headers = { authorization: "Bearer " + names.auth, "x-custom-secret": names.credential,
    accept: "application/json, text/event-stream" };
  const discovered = receive(1, 1, { tools: [{ name: "sample", inputSchema: { type: "object", properties: {
    text: { type: "integer" }, password: { type: "string", enum: [names.schemaValue] },
  } }, outputSchema: schema }] });
  discovered.headers = { "mcp-session-id": names.session };
  const first = send(2, names.id, "tools/call", { name: "sample", arguments: { text: names.content, password: names.credential } });
  const done = { atMs: 3, direction: "receive", message: { jsonrpc: "2.0", id: names.id,
    error: { code: -32602, message: names.error } } };
  const report = analysis(discover, discovered, first, done);
  assert.equal(report.requests[1].checks.input.status, "invalid");
  assert.equal(report.requests[1].receipt.summary, "Invalid params");
  const serialized = JSON.stringify(report);
  for (const value of Object.values(names)) assert.ok(!serialized.includes(value));
  assert.match(serialized, /\[redacted\]/);
  assert.match(serialized, /\[string\]/);
});

test("correlates direction and typed IDs and keeps the original deadline receipt for a late response", () => {
  const incoming = { atMs: 2, direction: "receive", message: { jsonrpc: "2.0", id: 1, method: "ping" } };
  const reply = { atMs: 4, direction: "send", message: { jsonrpc: "2.0", id: 1, result: {} } };
  const miss = receive(5, "1", {});
  const deadline = { direction: "local", atMs: 6, kind: "timeout", requestId: 1 };
  const report = analysis(send(1, 1, "ping"), incoming, reply, miss, deadline, receive(7, 1, {}));
  assert.deepEqual(report.requests.map(({ status }) => status), ["timeout", "success"]);
  assert.equal(report.requests[0].events.at(-1).label, "Late or duplicate response");
  assert.equal(report.diagnostics.length, 1);
});

test("invalidates old tool schemas when a list change is observed", () => {
  const given = { name: "sample", inputSchema: { type: "object" } };
  const change = { atMs: 5, direction: "receive", message: { jsonrpc: "2.0", method: "notifications/tools/list_changed" } };
  const report = analysis(send(1, 1, "tools/list"), receive(4, 1, { tools: [given] }), change,
    send(6, 2, "tools/call", { name: "sample", arguments: {} }));
  assert.equal(report.tools[0].staleAt, 4);
  assert.equal(report.requests[1].checks.input.status, "unavailable");
  assert.equal(report.requests[1].status, "pending");
});

test("the recorded import fixture distinguishes a successful tool response from an invalid output", async () => {
  const raw = await readFile(new URL("../examples/mcp-inspector/traces/schema-mismatch.json", import.meta.url), "utf8");
  const report = analyzeTrace(JSON.parse(raw));
  const request = report.requests.at(-1);
  assert.equal(request.status, "schema-error");
  assert.equal(request.receipt.reportedStatus, "success");
  assert.equal(request.checks.output.issues[0].path, "/count");
  assert.equal(request.receipt.httpStatus, 200);
});

test("reproducible loopback fixtures capture live MCP JSON, progress SSE and distinct failures", async () => {
  const server = inspectorServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    const origin = "http://127.0.0.1:" + server.address().port;
    const [life, fails, outputs] = await Promise.all(["lifecycle", "failures", "schemas"].map(async (name) => {
      const response = await fetch(origin + "/api/fixture/" + name);
      assert.equal(response.status, 200);
      const raw = await response.text();
      assert.doesNotMatch(raw, /fixture-only-canary|fixture-session-7c34|rb-104|service handover/);
      return JSON.parse(raw);
    }));
    assert.equal(life.tools.length, 4);
    assert.equal(life.requests.find(({ toolName }) => toolName === "search_runbooks").events
      .filter(({ label }) => label === "Progress update").length, 3);
    assert.ok(life.edges.some(({ type }) => type === "next discovery page"));
    assert.ok(life.edges.some(({ type }) => type === "recorded dependency"));
    assert.ok(life.edges.some(({ type }) => type === "validates output"));
    assert.deepEqual(fails.requests.slice(-4).map(({ status }) => status), ["rpc-error", "tool-error", "http-error", "timeout"]);
    assert.equal(outputs.requests.find(({ status }) => status === "schema-error").checks.output.status, "invalid");
    assert.equal(outputs.tools.find(({ name }) => name === "validate_slug").input.status, "unsupported");
    const html = await fetch(origin);
    assert.match(html.headers.get("content-security-policy"), /connect-src 'self'/);
    assert.match(await html.text(), /MCP Inspector/);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
});
