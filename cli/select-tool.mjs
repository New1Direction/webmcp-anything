import { readLocalJson } from "./compile.mjs";
import { record, toolName } from "./compile-schema.mjs";
import { compositionSchema, preserves } from "./composition-schema.mjs";
import { auditContract, checkToolValue } from "./tool-contract.mjs";
import { statsBatch } from "./selection-stats.mjs";

const TASK = "wmcp-selection-task/v1";
const EVIDENCE = "wmcp-selection-evidence/v1";
const DIMENSIONS = ["price", "latency", "reliability", "suitability", "correctness"];
const units = (amount) => Number.isSafeInteger(amount) && amount >= 0;
const probability = (rate) => typeof rate === "number" && rate >= 0 && rate <= 1;
const unique = (items, predicate) => Array.isArray(items) && items.every(predicate) && new Set(items).size === items.length;
const text = (value) => typeof value === "string" && value.length <= 256 && !!value.trim();

function taskSettings(task) {
  const required = task?.requiredChecks;
  const preferred = task?.preferredChecks ?? [];
  const limits = task?.limits;
  const prefer = task?.prefer ?? DIMENSIONS;
  if (task?.schemaVersion !== TASK || !text(task.profile) || !Object.hasOwn(task, "input") ||
      !record(task.outputSchema) || !unique(required, toolName) || !required.length ||
      !unique(preferred, toolName) || preferred.some((check) => required.includes(check)) ||
      !unique(prefer, (dimension) => DIMENSIONS.includes(dimension)) ||
      !record(limits) || typeof limits.currency !== "string" || !/^[A-Z]{3}$/.test(limits.currency) ||
      !units(limits.maxSpendMicros) || !units(limits.maxP95LatencyMs) || !units(limits.minTrials) || limits.minTrials < 1 ||
      !probability(limits.minCorrectness) || !limits.minCorrectness || !probability(limits.minReliability) || !limits.minReliability ||
      !probability(limits.confidence) || limits.confidence <= 0 || limits.confidence >= 1) {
    throw Error("Expected a task profile with input, output, required checks, spending limit and service objectives.");
  }
  const expected = compositionSchema(task.outputSchema);
  return { required, preferred, limits, expected, order: [...prefer, ...DIMENSIONS.filter((name) => !prefer.includes(name))] };
}

function validateEvidence(evidence, profile) {
  if (evidence?.schemaVersion !== EVIDENCE || evidence.profile !== profile ||
      !Array.isArray(evidence.candidates)) {
    throw Error("Expected candidate evidence from the exact task profile.");
  }
  const ids = new Set();
  for (const candidate of evidence.candidates) {
    if (!record(candidate) || !toolName(candidate.id) || ids.has(candidate.id) ||
        !record(candidate.conformance) || !Object.values(candidate.conformance).every((value) => typeof value === "boolean") ||
        !Array.isArray(candidate.trials)) throw Error("Invalid or duplicate candidate evidence.");
    ids.add(candidate.id);
    for (const trial of candidate.trials) {
      if (!record(trial) || !["completed", "failed", "timeout"].includes(trial.status) ||
          !units(trial.latencyMs) || !units(trial.costMicros) ||
          (trial.status === "completed" && (!record(trial.checks) || !Object.values(trial.checks).every((value) => typeof value === "boolean")))) {
        throw Error("Invalid trial in candidate " + candidate.id + ".");
      }
    }
  }
}

function measureAll(candidates, { required, preferred }, alpha) {
  return statsBatch(candidates.map(({ trials }) => ({ op: "trials", alpha, trials, required, preferred })));
}

function assess(candidate, task, settings, metrics) {
  const { required, limits, expected } = settings;
  const reasons = [];
  const conformance = Object.fromEntries(required.map((check) => [check,
    candidate.conformance[check] === true ? "pass" : candidate.conformance[check] === false ? "fail" : "unknown"]));
  for (const [check, outcome] of Object.entries(conformance)) {
    if (outcome !== "pass") reasons.push({ code: "required-check-" + outcome, check });
  }
  const audit = auditContract(candidate.contract);
  if (!audit.valid) reasons.push({ code: "invalid-contract" });
  else {
    const input = checkToolValue(candidate.contract, "inputSchema", task.input);
    if (input.status !== "valid") reasons.push({ code: "input-" + input.status });
    try {
      if (!preserves(compositionSchema(candidate.contract.outputSchema), expected)) reasons.push({ code: "output-incompatible" });
    } catch {
      reasons.push({ code: "output-unverified" });
    }
  }

  const quote = candidate.quote;
  let price = null;
  if (!record(quote) || !units(quote.maxMicros)) reasons.push({ code: "no-price-ceiling" });
  else if (quote.currency !== limits.currency) reasons.push({ code: "currency-mismatch" });
  else {
    price = quote.maxMicros;
    if (price > limits.maxSpendMicros) reasons.push({ code: "over-budget" });
    if (candidate.trials.some(({ costMicros }) => costMicros > price)) reasons.push({ code: "price-ceiling-breached" });
  }

  if (metrics.attempts < limits.minTrials) reasons.push({ code: "insufficient-trials" });
  if (metrics.correctness.lower === null || metrics.correctness.lower < limits.minCorrectness) reasons.push({ code: "correctness-slo" });
  if (metrics.reliability.lower === null || metrics.reliability.lower < limits.minReliability) reasons.push({ code: "reliability-slo" });
  if (metrics.latency.upperMs === null || metrics.latency.upperMs > limits.maxP95LatencyMs) reasons.push({ code: "latency-slo" });
  return {
    id: candidate.id, priceCeilingMicros: price, conformance, metrics, eligible: reasons.length === 0, reasons,
    ...(audit.valid ? { authorization: candidate.contract.authorization } : {}),
  };
}

function objective(candidate, dimension) {
  switch (dimension) {
    case "price": return candidate.priceCeilingMicros;
    case "latency": return candidate.metrics.latency.upperMs;
    case "suitability": return -Number(candidate.metrics.suitability?.lower ?? 0);
    default: return -candidate.metrics[dimension].lower;
  }
}

function compare(a, b, dimensions) {
  for (const dimension of dimensions) {
    const difference = objective(a, dimension) - objective(b, dimension);
    if (difference) return difference;
  }
  if (a.id === b.id) return 0;
  return a.id < b.id ? -1 : 1;
}

function dominates(a, b) {
  return DIMENSIONS.every((dimension) => objective(a, dimension) <= objective(b, dimension)) &&
    DIMENSIONS.some((dimension) => objective(a, dimension) < objective(b, dimension));
}

export function selectTool(task, evidence) {
  const settings = taskSettings(task);
  validateEvidence(evidence, task.profile);
  const metricsPerCandidate = settings.preferred.length ? 4 : 3;
  const boundCount = metricsPerCandidate * evidence.candidates.length;
  const alpha = boundCount ? (1 - settings.limits.confidence) / boundCount : null;
  const measured = measureAll(evidence.candidates, settings, alpha);
  const candidates = evidence.candidates.map((candidate, index) => assess(candidate, task, settings, measured[index]));
  const eligible = candidates.filter(({ eligible }) => eligible);
  const frontier = eligible.filter((candidate) => !eligible.some((other) => dominates(other, candidate)))
    .sort((a, b) => compare(a, b, settings.order));
  return {
    schemaVersion: "wmcp-tool-selection/v1", profile: task.profile, scope: "single-attempt-planning",
    status: frontier.length ? "selected" : "no-feasible-tool",
    selected: frontier[0]?.id ?? null,
    paretoFrontier: frontier.map(({ id }) => id),
    preferenceOrder: settings.order,
    objectives: settings.limits,
    uncertainty: { confidence: settings.limits.confidence, boundAlpha: alpha,
      rate: "one-sided-exact-binomial", latency: "one-sided-order-statistic", correction: "bonferroni" },
    candidates,
  };
}

export function selectToolFiles(taskPath, evidencePath) {
  return selectTool(readLocalJson(taskPath, "Selection task"), readLocalJson(evidencePath, "Selection evidence", 16_000_000));
}
