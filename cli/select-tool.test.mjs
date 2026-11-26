import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { selectTool } from "./select-tool.mjs";
import { lowerRate, upperP95 } from "./selection-stats.mjs";
import { execute, parseArgs } from "./wmcp.mjs";
import {
  buildSelectionEvidence, loadSelectionTask, runSelectionExamples, taskPath,
} from "../examples/tool-selection/evaluate.mjs";

const find = (collection, id) => collection.candidates.find((candidate) => candidate.id === id);
const codes = (report, id) => find(report, id).reasons.map(({ code }) => code);

test("computes one-sided exact rate bounds including analytical endpoints", () => {
  assert.deepEqual(lowerRate(0, 0, 0.05), { successes: 0, trials: 0, estimate: null, lower: null });
  assert.equal(lowerRate(0, 2, 0.05).lower, 0);
  assert.ok(Math.abs(lowerRate(2, 2, 0.05).lower - Math.sqrt(0.05)) < 1e-12);
  assert.ok(Math.abs(lowerRate(1, 2, 0.05).lower - (1 - Math.sqrt(0.95))) < 1e-12);
});

test("places the p95 upper bound at a defensible rank and reports infinite mass separately", () => {
  const latencies = Array.from({ length: 59 }, (_, index) => index + 1).reverse();
  assert.equal(upperP95(latencies.slice(1), 0.05).status, "insufficient-sample");
  assert.deepEqual(upperP95(latencies, 0.05), { estimateMs: 57, upperMs: 59, rank: 59, status: "bounded" });
  latencies[0] = Infinity;
  assert.deepEqual(upperP95(latencies, 0.05), { estimateMs: 57, upperMs: null, rank: 59, status: "unbounded" });
});

test("finds every feasible trade-off and drops a strictly dominated candidate", () => {
  const report = selectTool(loadSelectionTask(), buildSelectionEvidence());
  assert.equal(report.selected, "fast-verified");
  assert.deepEqual(report.paretoFrontier, ["fast-verified", "balanced-verified", "budget-verified"]);
  assert.equal(find(report, "dominated-verified").eligible, true);
  assert.deepEqual(runSelectionExamples().map(({ selected }) => selected),
    ["fast-verified", "budget-verified", "balanced-verified", "budget-verified", null]);
});

test("ranks optional outcome checks only after hard constraints pass", () => {
  const task = loadSelectionTask();
  task.limits.maxSpendMicros = 9000;
  task.prefer = ["suitability", "price"];
  const report = selectTool(task, buildSelectionEvidence());
  assert.equal(report.selected, "balanced-verified");
  assert.ok(find(report, "balanced-verified").metrics.suitability.lower > find(report, "budget-verified").metrics.suitability.lower);
  assert.equal(report.preferenceOrder[0], "suitability");
});

test("rejects failed and missing required checks even with perfect routine accuracy and no alternative", () => {
  const task = loadSelectionTask();
  task.limits.maxSpendMicros = 1000;
  const evidence = buildSelectionEvidence();
  const preview = find(evidence, "quick-preview");
  let report = selectTool(task, evidence);
  assert.equal(report.status, "no-feasible-tool");
  assert.equal(find(report, preview.id).metrics.correctness.estimate, 1);
  assert.deepEqual(find(report, preview.id).reasons, [{ code: "required-check-fail", check: "handles-refunds" }]);
  delete preview.conformance["handles-refunds"];
  report = selectTool(task, evidence);
  assert.equal(report.selected, null);
  assert.deepEqual(find(report, preview.id).reasons, [{ code: "required-check-unknown", check: "handles-refunds" }]);
});

test("requires confidence bounds to meet SLOs even when point estimates appear sufficient", () => {
  const task = loadSelectionTask();
  const evidence = buildSelectionEvidence();
  const candidate = find(evidence, "quick-preview");
  candidate.conformance["handles-refunds"] = true;
  for (const trial of candidate.trials.slice(0, 8)) trial.checks["exact-total"] = false;
  const report = selectTool(task, evidence);
  const { estimate, lower } = find(report, candidate.id).metrics.correctness;
  assert.ok(estimate > task.limits.minCorrectness && lower < task.limits.minCorrectness);
  assert.deepEqual(codes(report, candidate.id), ["correctness-slo"]);
  assert.deepEqual(codes(report, "unstable-saver"), ["correctness-slo", "reliability-slo", "latency-slo"]);
  assert.deepEqual(codes(report, "sparse-perfect"), ["insufficient-trials", "correctness-slo", "reliability-slo", "latency-slo"]);
  const one = selectTool(task, { ...evidence, candidates: [candidate] });
  assert.ok(one.uncertainty.boundAlpha > report.uncertainty.boundAlpha);
  assert.ok(one.candidates[0].metrics.correctness.lower > lower);
});

test("rejects incompatible or unknown output and validates the task input against each candidate", () => {
  const task = loadSelectionTask();
  const evidence = buildSelectionEvidence();
  find(evidence, "fast-verified").contract.inputSchema = { type: "string" };
  find(evidence, "balanced-verified").contract.outputSchema = { type: "object", properties: { totalCents: { type: "string" } }, required: ["totalCents"] };
  find(evidence, "budget-verified").contract.outputSchema = null;
  const report = selectTool(task, evidence);
  assert.deepEqual(codes(report, "fast-verified"), ["input-invalid"]);
  assert.deepEqual(codes(report, "balanced-verified"), ["output-incompatible"]);
  assert.deepEqual(codes(report, "budget-verified"), ["output-unverified"]);
  assert.equal(report.selected, "dominated-verified");
});

test("requires a same-currency ceiling and rejects cost observations above it", () => {
  const task = loadSelectionTask();
  const evidence = buildSelectionEvidence();
  find(evidence, "budget-verified").quote.currency = "CAD";
  find(evidence, "fast-verified").trials[0].costMicros += 1;
  const report = selectTool(task, evidence);
  assert.deepEqual(codes(report, "unbounded-meter"), ["no-price-ceiling"]);
  assert.deepEqual(codes(report, "budget-verified"), ["currency-mismatch"]);
  assert.deepEqual(codes(report, "fast-verified"), ["price-ceiling-breached"]);
  assert.equal(report.selected, "balanced-verified");
});

test("requires evidence for the exact task profile and rejects ambiguous candidate identities", () => {
  const task = loadSelectionTask();
  const evidence = buildSelectionEvidence();
  assert.throws(() => selectTool(task, { ...evidence, profile: "other/v1" }), /exact task profile/);
  assert.throws(() => selectTool(task, { ...evidence, candidates: [evidence.candidates[0], evidence.candidates[0]] }), /duplicate candidate/);
  assert.throws(() => selectTool({ ...task, requiredChecks: [] }, evidence), /required checks/);
  const empty = selectTool(task, { ...evidence, candidates: [] });
  assert.equal(empty.status, "no-feasible-tool");
  assert.equal(empty.uncertainty.boundAlpha, null);
});

test("uses local command inputs and returns a machine-readable abstention with exit code 2", async (t) => {
  const dir = mkdtempSync(join(tmpdir(), "wmcp-selection-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const evidencePath = join(dir, "evidence.json");
  writeFileSync(evidencePath, JSON.stringify(buildSelectionEvidence()));
  const request = () => assert.fail("Selection must stay offline.");
  const chosen = await execute(parseArgs(["select", taskPath, evidencePath]), { request });
  assert.equal(chosen.selected, "fast-verified");
  const constrainedPath = join(dir, "task.json");
  const task = loadSelectionTask();
  task.limits.maxSpendMicros = 1000;
  writeFileSync(constrainedPath, JSON.stringify(task));
  const cli = fileURLToPath(new URL("./wmcp.mjs", import.meta.url));
  const result = spawnSync(process.execPath, [cli, "select", constrainedPath, evidencePath], { encoding: "utf8" });
  assert.equal(result.status, 2, result.stderr);
  assert.equal(JSON.parse(result.stdout).status, "no-feasible-tool");
});
