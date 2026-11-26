import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { compileCapabilities, readLocalJson } from "./compile.mjs";
import { auditContract, authorizationSummary, checkToolValue, failureOutcome, projectToolContract } from "./tool-contract.mjs";
import { execute, parseArgs } from "./wmcp.mjs";
import { runContractExamples } from "../examples/tool-contracts/evaluate.mjs";

const path = (value) => fileURLToPath(new URL(value, import.meta.url));
const read = (value) => readLocalJson(path(value));
const local = () => read("../examples/tool-contracts/stat-file.json");
const keyed = () => read("../examples/tool-contracts/publish-snapshot.json");
const creative = () => read("../examples/tool-contracts/render-dither.json");

test("supports native scalar values and ordinary schemas without requiring result wrappers", () => {
  const tool = local();
  assert.equal(auditContract(tool).valid, true);
  assert.equal(checkToolValue(tool, "inputSchema", "notes.txt").status, "valid");
  assert.equal(checkToolValue(tool, "outputSchema", 8).status, "valid");
  assert.equal(checkToolValue(tool, "outputSchema", { bytes: 8 }).status, "invalid");
  tool.outputSchema = { type: "null" };
  assert.equal(checkToolValue(tool, "outputSchema", null).status, "valid");
  tool.outputSchema = null;
  assert.equal(checkToolValue(tool, "outputSchema", null).status, "unknown");
  assert.ok(auditContract(tool).unknown.includes("/outputSchema"));
  tool.transport = "stdio";
  assert.equal(auditContract(tool).valid, false);
});

test("retains unsupported schema keywords as evidence rather than treating them as validated", () => {
  const tool = local();
  tool.inputSchema = { type: "string", pattern: "^notes" };
  assert.equal(auditContract(tool).valid, true);
  assert.equal(auditContract(tool).schemaChecks.inputSchema, "unsupported");
  assert.equal(checkToolValue(tool, "inputSchema", "anything").status, "unsupported");
  tool.inputSchema = { type: "typo" };
  assert.equal(auditContract(tool).valid, false);
});

test("validates keyed scope and timing, and rejects a pointer to a numeric input", () => {
  const tool = keyed();
  assert.equal(auditContract(tool).valid, true);
  tool.idempotency.keyPointer = "/rowCount";
  assert.ok(auditContract(tool).issues.some(({ path }) => path === "/idempotency/keyPointer"));
  tool.idempotency.keyPointer = "/requestKey";
  delete tool.idempotency.windowSeconds;
  assert.equal(auditContract(tool).valid, false);
  tool.idempotency.windowSeconds = null;
  assert.equal(auditContract(tool).valid, true);
  tool.inputSchema = null;
  assert.ok(auditContract(tool).unknown.includes("/idempotency/keyPointer"));
});

test("distinguishes public and scoped access from confirmation and preserves authorization disjunctions", () => {
  const tool = keyed();
  assert.equal(tool.authorization.anyOf[0].length, 2);
  assert.equal(authorizationSummary(tool.authorization), "requires-credentials");
  tool.authorization.anyOf.push([]);
  assert.equal(authorizationSummary(tool.authorization), "public-option");
  assert.equal(tool.authorization.confirmation, "always");
  assert.equal(auditContract(tool).valid, true);
  tool.authorization.anyOf = null;
  assert.equal(authorizationSummary(tool.authorization), "unknown");
  assert.ok(auditContract(tool).unknown.includes("/authorization/anyOf"));
});

test("rejects contradictory retry claims and reconciles unrecognized failures conservatively", () => {
  const artifact = creative();
  artifact.failures["receipt-timeout"].recovery = "retry";
  assert.ok(auditContract(artifact).issues.some(({ path }) => path === "/failures/receipt-timeout/recovery"));
  const tool = keyed();
  tool.failures["partial-commit"] = { effects: "partial", recovery: "retry" };
  assert.ok(auditContract(tool).issues.some(({ path }) => path === "/failures/partial-commit/recovery"));
  const file = local();
  file.failures["not-found"].effects = "applied";
  assert.ok(auditContract(file).issues.some(({ path }) => path === "/failures/not-found/effects"));
  assert.deepEqual(failureOutcome(file, "transport-closed"), { effects: "unknown", recovery: "reconcile" });
});

test("projects authorized WMCP tools without guessing side effects, payloads or repeat guarantees", () => {
  const original = compileCapabilities(read("../examples/browser-demo/capabilities.json"));
  const write = projectToolContract(original.tools.find(({ name }) => name === "complete_task"));
  assert.equal(write.authorization.confirmation, "always");
  assert.deepEqual(write.authorization.anyOf, [[]]);
  assert.equal(write.outputSchema, null);
  assert.equal(write.sideEffects, null);
  assert.equal(write.idempotency.mode, "unknown");
  assert.equal(write.failures, null);

  const queue = compileCapabilities(read("../examples/capability-discovery/work.json"));
  const navigate = projectToolContract(queue.tools.find(({ name }) => name === "open_queue"));
  assert.deepEqual(navigate.sideEffects, [{ kind: "browser.navigate", boundary: "https://work.example",
    target: { resource: "state:queue" } }]);
  const readTool = projectToolContract(queue.tools.find(({ name }) => name === "find_by_title"));
  assert.deepEqual(readTool.sideEffects, []);
  assert.equal(readTool.outputSchema.type, "object");
  assert.equal(readTool.idempotency.mode, "unknown");
});

test("evaluates four native tool shapes and nine representative outcome cases", () => {
  const report = runContractExamples();
  assert.deepEqual(report.tools.map(({ domain }) => domain), ["web", "local", "data", "creative"]);
  assert.equal(report.cases.length, 9);
  assert.ok(report.cases.every(({ status }) => status === "passed"));
});

test("audits and projects local contracts through the main CLI without network calls", async () => {
  const request = () => assert.fail("Contract inspection lives offline.");
  const contractPath = path("../examples/tool-contracts/stat-file.json");
  const audited = await execute(parseArgs(["contract", contractPath]), { request });
  assert.equal(audited.valid, true);
  assert.equal(audited.contract.name, "stat_file");
  const fixture = path("../examples/browser-demo/capabilities.json");
  const projected = await execute(parseArgs(["contract", fixture, "--tool", "list_tasks"]), { request });
  assert.equal(projected.valid, true);
  assert.equal(projected.contract.outputSchema.type, "array");
});
