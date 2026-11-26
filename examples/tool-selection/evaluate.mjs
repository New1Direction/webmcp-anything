import assert from "node:assert/strict";
import { fileURLToPath, pathToFileURL } from "node:url";
import { readLocalJson } from "../../cli/compile.mjs";
import { compositionSchema, matches } from "../../cli/composition-schema.mjs";
import { selectTool } from "../../cli/select-tool.mjs";

export const taskPath = fileURLToPath(new URL("./task.json", import.meta.url));
export const loadSelectionTask = () => readLocalJson(taskPath);
const task = loadSelectionTask();
const expected = compositionSchema(task.outputSchema);
const count = { type: "integer", minimum: 0 };

const inputSchema = {
  type: "object",
  properties: {
    entries: {
      type: "array",
      items: {
        type: "object",
        properties: { amountCents: { type: "integer" }, settled: { type: "boolean" } },
        required: ["amountCents", "settled"],
        additionalProperties: false,
      },
    },
  },
  required: ["entries"],
  additionalProperties: false,
};

function contract(name) {
  return {
    schemaVersion: "wmcp-tool-contract/v1",
    name,
    inputSchema,
    outputSchema: {
      ...task.outputSchema,
      properties: {
        ...task.outputSchema.properties,
        breakdown: { type: "object", properties: { settled: count, pending: count }, required: ["settled", "pending"] },
      },
      additionalProperties: false,
    },
    authorization: { anyOf: [[]], confirmation: "never" },
    sideEffects: [],
    idempotency: { mode: "idempotent" },
    failures: { timeout: { effects: "not-applied", recovery: "stop" } },
  };
}

function calculate(input, { ignoresRefunds, breakdownEvery }, trial = 0) {
  const settled = input.entries.filter(({ settled }) => settled);
  const included = ignoresRefunds ? settled.filter(({ amountCents }) => amountCents >= 0) : settled;
  const totalCents = included.reduce((total, { amountCents }) => total + amountCents, 0);
  const output = { totalCents };
  if (breakdownEvery && trial % breakdownEvery === 0) {
    output.breakdown = { settled: settled.length, pending: input.entries.length - settled.length };
  }
  return output;
}

function outputChecks(input, output) {
  let sum = 0n;
  let settled = 0;
  let pending = 0;
  let hasRefund = false;
  for (const entry of input.entries) {
    if (entry.settled) {
      sum += BigInt(entry.amountCents);
      hasRefund ||= entry.amountCents < 0;
      settled++;
    } else pending++;
  }
  const exact = matches(expected, output) && BigInt(output.totalCents) === sum;
  return {
    "exact-total": exact,
    "handles-refunds": !hasRefund || exact,
    "includes-breakdown": output.breakdown?.settled === settled && output.breakdown?.pending === pending,
  };
}

const candidates = [
  { id: "quick-preview", ceiling: 800, latency: 13, jitter: 5, ignoresRefunds: true },
  { id: "unstable-saver", ceiling: 2500, latency: 20, jitter: 8, timeoutEvery: 8 },
  { id: "budget-verified", ceiling: 6000, latency: 65, jitter: 27 },
  { id: "balanced-verified", ceiling: 8000, latency: 50, jitter: 16, breakdownEvery: 2 },
  { id: "fast-verified", ceiling: 11000, latency: 30, jitter: 16, breakdownEvery: 1 },
  { id: "dominated-verified", ceiling: 10500, latency: 70, jitter: 22, breakdownEvery: 2 },
  { id: "sparse-perfect", ceiling: 1800, latency: 18, jitter: 7, trials: 10 },
  { id: "unbounded-meter", ceiling: null, latency: 12, jitter: 5, breakdownEvery: 1 },
];

function routineInput(index) {
  return {
    entries: Array.from({ length: 4 + index % 7 }, (_, offset) => ({
      amountCents: 1 + (index * 131 + offset * 53) % 1000,
      settled: (index + offset) % 3 !== 0,
    })),
  };
}

export function buildSelectionEvidence() {
  return {
    schemaVersion: "wmcp-selection-evidence/v1",
    profile: task.profile,
    candidates: candidates.map((config) => {
      const { id, ceiling, latency, jitter, timeoutEvery, trials = 520 } = config;
      const ordinary = routineInput(0);
      const refund = task.input;
      const refundCheck = outputChecks(refund, calculate(refund, config))["handles-refunds"];
      return {
        id,
        contract: contract(id),
        quote: ceiling === null ? null : { currency: "USD", maxMicros: ceiling },
        conformance: {
          "exact-total": outputChecks(ordinary, calculate(ordinary, config))["exact-total"],
          "handles-refunds": refundCheck,
        },
        trials: Array.from({ length: trials }, (_, index) => {
          const latencyMs = latency + (index * 17) % jitter;
          const costMicros = (ceiling ?? 400) - (index % 47);
          if (timeoutEvery && index % timeoutEvery === 0) return { status: "timeout", latencyMs: 250, costMicros };
          const input = routineInput(index);
          const checks = outputChecks(input, calculate(input, config, index));
          return { status: "completed", latencyMs, costMicros, checks };
        }),
      };
    }),
  };
}

export function runSelectionExamples() {
  const evidence = buildSelectionEvidence();
  const scenarios = [
    { budget: 12000, first: "latency", expected: "fast-verified" },
    { budget: 12000, first: "price", expected: "budget-verified" },
    { budget: 9000, first: "latency", expected: "balanced-verified" },
    { budget: 7000, first: "latency", expected: "budget-verified" },
    { budget: 1000, first: "price", expected: null },
  ];
  return scenarios.map(({ budget, first, expected: selected }) => {
    const report = selectTool({ ...task, prefer: [first], limits: { ...task.limits, maxSpendMicros: budget } }, evidence);
    assert.equal(report.selected, selected);
    const preview = report.candidates.find(({ id }) => id === "quick-preview");
    assert.equal(preview.metrics.correctness.estimate, 1);
    assert.deepEqual(preview.reasons, [{ code: "required-check-fail", check: "handles-refunds" }]);
    return { budgetMicros: budget, firstPreference: first, selected, paretoFrontier: report.paretoFrontier };
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = process.argv[2] === "--evidence" ? buildSelectionEvidence() : runSelectionExamples();
  console.log(JSON.stringify(result, null, 2));
}
