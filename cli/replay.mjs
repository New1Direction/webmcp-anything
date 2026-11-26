import { isDeepStrictEqual } from "node:util";
import { record } from "./compile-schema.mjs";
import { keysAt, valueAt } from "./composition-contract.mjs";
import { matches } from "./composition-schema.mjs";

function referenceValue(reference, input, results) {
  return Object.hasOwn(reference, "input") ? input[reference.input] : valueAt(results.get(reference.step), reference.pointer);
}

export function assembleArguments(bindings, input, results) {
  const args = {};
  for (const { from, to } of bindings) {
    const value = referenceValue(from, input, results);
    if (value === undefined) throw Error("Required binding is missing");
    const parts = keysAt(to);
    if (!parts.length) return structuredClone(value);
    let node = args;
    for (const key of parts.slice(0, -1)) {
      if (!Object.hasOwn(node, key)) Object.defineProperty(node, key, { value: {}, enumerable: true });
      node = node[key];
    }
    Object.defineProperty(node, parts.at(-1), { value: structuredClone(value), enumerable: true });
  }
  return args;
}

function contextMatches(observation, plan, state, subject) {
  if (!record(observation) || observation.origin !== plan.origin || observation.state !== state) return false;
  return plan.access === "session" ? record(observation.session) && observation.session.subject === subject :
    observation.session === undefined || observation.session === null;
}

function hasMarker(observation, kind, selector) {
  const markers = observation[kind];
  return Array.isArray(markers) && markers.includes(selector);
}

function holds(condition, before, after, args, result, schema) {
  switch (condition.kind) {
    case "result-schema": return matches(schema, result);
    case "result-equals": {
      const value = valueAt(result, condition.pointer);
      return value !== undefined && isDeepStrictEqual(value, condition.value);
    }
    case "result-matches-input": {
      const value = valueAt(result, condition.pointer);
      return value !== undefined && isDeepStrictEqual(value, valueAt(args, condition.inputPointer));
    }
    case "dom-visible": return hasMarker(after, "visible", condition.selector);
    case "dom-count-increased": {
      const counts = [before, after].map(({ counts }) => record(counts) && Object.hasOwn(counts, condition.selector)
        ? counts[condition.selector] : undefined);
      return counts.every((count) => Number.isSafeInteger(count) && count >= 0) && counts[1] - counts[0] === condition.by;
    }
    case "state": return after.state === condition.state;
    default: return false;
  }
}

export function replayWorkflow(plan, scenario) {
  const trace = [];
  const results = new Map();
  const response = (status, error) => ({
    schemaVersion: "wmcp-workflow-replay/v1", workflow: plan.id, mode: "fixture-replay",
    status, trace,
    ...(error === undefined ? {} : { error }),
  });
  const stop = (code, step, effectStatus, condition) => response("stopped", {
    code, ...(step ? { step: step.id } : {}), effectStatus,
    ...(condition === undefined ? {} : { condition }),
  });
  if (scenario?.schemaVersion !== "wmcp-workflow-fixture/v1" || !record(scenario.input) || !record(scenario.observations)) {
    return stop("invalid_fixture", null, "not-attempted");
  }
  const { input, observations, subject } = scenario;
  if ((plan.access === "session" && (typeof subject !== "string" || !subject.trim())) ||
      (plan.access === "public" && subject !== undefined)) return stop("invalid_fixture", null, "not-attempted");
  const names = Object.keys(plan.inputs);
  if (Object.keys(input).length !== names.length || names.some((name) =>
    !Object.hasOwn(input, name) || !matches(plan.inputs[name].schema, input[name]))) {
    return stop("invalid_input", null, "not-attempted");
  }
  const stepIds = new Set(plan.steps.map(({ id }) => id));
  if (Object.keys(observations).some((id) => !stepIds.has(id))) return stop("invalid_fixture", null, "not-attempted");

  for (const step of plan.steps) {
    let args;
    try { args = assembleArguments(step.bindings, input, results); }
    catch { return stop("invalid_binding", step, "not-attempted"); }
    if (!matches(step.inputSchema, args)) return stop("invalid_binding", step, "not-attempted");

    const observation = Object.hasOwn(observations, step.id) ? observations[step.id] : null;
    if (!record(observation)) return stop("missing_observation", step, "not-attempted");
    const { before, after, result, status, approval } = observation;
    if (!contextMatches(before, plan, step.fromState, subject)) return stop("precondition_failed", step, "not-attempted", "origin-state-session");
    if (plan.access === "session" && (!Array.isArray(before.session.permissions) ||
        step.permissions.some((permission) => !before.session.permissions.includes(permission)))) {
      return stop("authorization_denied", step, "not-attempted", "session-permissions");
    }
    for (const { kind, selector } of step.preconditions) {
      if ((kind === "dom-visible" && !hasMarker(before, "visible", selector)) ||
          (kind === "dom-enabled" && !hasMarker(before, "enabled", selector))) {
        return stop("precondition_failed", step, "not-attempted", kind);
      }
    }
    if (step.confirmationRequired && !isDeepStrictEqual(approval, {
      workflow: plan.id, step: step.id, capability: step.capability, origin: plan.origin,
      subject: subject ?? null, input: args,
    })) return stop("approval_required", step, "not-attempted");
    const unverified = step.sideEffect.kind === "none" ? "none-declared" : "unknown";
    if (!["ok", "error"].includes(status)) return stop("missing_outcome", step, unverified);
    if (status === "error") return stop("tool_error", step, unverified);
    if (!contextMatches(after, plan, step.toState, subject)) return stop("postcondition_failed", step, unverified, "origin-state-session");
    for (const condition of step.postconditions) {
      if (!holds(condition, before, after, args, result, step.resultSchema)) {
        return stop("postcondition_failed", step, unverified, condition.kind);
      }
    }
    results.set(step.id, result);
    trace.push({ step: step.id, tool: step.capability, effectStatus: step.sideEffect.kind === "none" ? "none-declared" : "confirmed" });
  }
  const outputs = Object.fromEntries(Object.entries(plan.outputs).map(([name, { from }]) => [name, referenceValue(from, input, results)]));
  return { ...response("completed"), outputs };
}
