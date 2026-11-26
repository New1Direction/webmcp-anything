import { isDeepStrictEqual } from "node:util";
import { record, toolName } from "./compile-schema.mjs";
import { documentedSideEffect, isPointer } from "./composition-contract.mjs";
import { assertInputCoverage, compositionSchema, matches, preserves, schemaAt } from "./composition-schema.mjs";

const PRE = ["input-schema", "state", "authentication", "user-authorization", "dom-visible", "dom-enabled"];
const POST = ["state", "result-schema", "result-equals", "result-matches-input", "dom-visible", "dom-count-increased"];
const CONDITION_FIELDS = {
  "input-schema": [], state: ["state"], authentication: ["boundary", "anyOf"],
  "user-authorization": ["when", "scope"], "dom-visible": ["selector"], "dom-enabled": ["selector"],
  "dom-count-increased": ["selector", "by"], "result-schema": ["schema"],
  "result-equals": ["pointer", "value"], "result-matches-input": ["pointer", "inputPointer"],
};

function onlyFields(value, allowed) {
  return record(value) && Object.keys(value).every((key) => allowed.includes(key));
}

export class CompositionError extends Error {
  constructor(code, message, step) {
    super(code + (step ? " (" + step + ")" : "") + ": " + message);
    this.code = code;
    this.step = step;
  }
}

function reject(code, message, step) {
  throw new CompositionError(code, message, step);
}

function permissions(value) {
  if (!Array.isArray(value) || value.some((permission) => typeof permission !== "string" || !permission.trim()) ||
      new Set(value).size !== value.length) throw Error("Expected a unique array of documented permissions");
  return [...value].sort();
}

function single(conditions, kind, step) {
  const matches = conditions.filter((condition) => condition.kind === kind);
  if (matches.length !== 1) reject("unsupported_contract", "Expected exactly one " + kind + " precondition", step);
  return matches[0];
}

function authorizeTool(tool, policy, sideEffect, step) {
  const requirement = single(tool.preconditions, "authentication", step);
  const userAuthorization = single(tool.preconditions, "user-authorization", step);
  const allOf = Array.isArray(requirement.anyOf) && requirement.anyOf.length === 1 &&
    onlyFields(requirement.anyOf[0], ["allOf"]) ? requirement.anyOf[0].allOf : null;
  const validAccess = Array.isArray(allOf) &&
    (policy.access === "public" ? allOf.length === 0 : allOf.length === 1 && allOf[0]?.type === "site-session" &&
      Object.keys(allOf[0]).length === 2);
  const grant = Object.hasOwn(policy.tools, tool.id) ? policy.tools[tool.id] : null;
  if (!validAccess || requirement.boundary !== policy.origin || !onlyFields(grant, ["permissions", "sideEffect"])) {
    reject("permission_denied", "Tool lacks a matching origin, access mode or explicit grant", step);
  }
  if (!isDeepStrictEqual(sideEffect, grant.sideEffect)) {
    reject("effect_not_authorized", "Grant must match the complete documented side effect", step);
  }
  let required;
  try {
    required = policy.access === "public" ? [] : permissions(allOf[0].permissions);
    if (!isDeepStrictEqual(required, permissions(grant.permissions))) throw Error("Scope mismatch");
  } catch {
    reject("permission_denied", "Grant permissions must match this tool's documented permissions", step);
  }
  if (userAuthorization.when !== (tool.effect === "write" ? "always" : "authenticated-use") ||
      userAuthorization.scope !== "this-capability-and-input") {
    reject("unsupported_contract", "Tool authorization condition cannot be enforced", step);
  }
  return { permissions: required, confirmationRequired: tool.effect === "write" || policy.access === "session" };
}

function checkConditions(tool, step) {
  for (const [conditions, supported] of [[tool.preconditions, PRE], [tool.postconditions, POST]]) {
    if (!conditions.length || conditions.some(({ kind }) => !supported.includes(kind))) {
      reject("unsupported_contract", "Tool has missing or unsupported conditions", step);
    }
    for (const condition of conditions) {
      const { kind, selector, by, pointer, inputPointer } = condition;
      if (!onlyFields(condition, ["kind", ...CONDITION_FIELDS[kind]]) ||
          (kind.startsWith("dom-") && (typeof selector !== "string" || !selector.trim())) ||
          (kind === "dom-count-increased" && (!Number.isSafeInteger(by) || by < 1)) ||
          (kind === "result-matches-input" && (!isPointer(pointer) || !isPointer(inputPointer))) ||
          (kind === "result-equals" && (!isPointer(pointer) || !Object.hasOwn(condition, "value")))) {
        reject("unsupported_contract", "Malformed condition " + kind, step);
      }
    }
  }
  single(tool.preconditions, "input-schema", step);
}

function readReference(reference, inputs, previous, step) {
  if (record(reference) && Object.keys(reference).length === 1 && inputs.has(reference.input)) {
    return { ...inputs.get(reference.input), source: { input: reference.input } };
  }
  if (record(reference) && Object.keys(reference).length === 2 && isPointer(reference.pointer) && previous.has(reference.step)) {
    const origin = previous.get(reference.step);
    const binding = origin.outputs.find(({ pointer }) => pointer === reference.pointer);
    const schema = origin.resultSchema && schemaAt(origin.resultSchema, reference.pointer);
    if (binding && schema) return { type: binding.type, schema, source: { step: reference.step, pointer: reference.pointer } };
  }
  reject("invalid_reference", "Reference must name a workflow input or a typed output of an earlier step", step);
}

function bindingsFor(step, tool, inputSchema, inputs, previous) {
  if (!Array.isArray(step.bindings)) reject("invalid_workflow", "Expected a bindings array", step.id);
  const used = new Set();
  const bindings = step.bindings.map((binding) => {
    if (!onlyFields(binding, ["from", "to", "transform"]) || binding.transform !== "identity" || !isPointer(binding.to) || used.has(binding.to)) {
      reject("unsupported_transformation", "Only unique identity bindings to documented fields are supported", step.id);
    }
    used.add(binding.to);
    const target = tool.inputs.find(({ pointer }) => pointer === binding.to);
    const targetSchema = schemaAt(inputSchema, binding.to);
    const source = readReference(binding.from, inputs, previous, step.id);
    if (!target || !targetSchema || source.type !== target.type || !preserves(source.schema, targetSchema)) {
      reject("type_mismatch", "Source does not preserve the semantic type or schema at " + (binding.to || "/"), step.id);
    }
    return { transform: "identity", type: source.type, from: source.source, to: binding.to };
  });
  assertInputCoverage(inputSchema, [...used]);
  return bindings;
}

function schemasFor(tool) {
  const inputSchema = compositionSchema(tool.inputSchema);
  if (inputSchema.type !== "object") throw Error("WebMCP input must have an object schema");
  const resultChecks = tool.postconditions.filter(({ kind }) => kind === "result-schema");
  if (resultChecks.length > 1) throw Error("Composition requires at most one result schema per tool");
  const resultSchema = resultChecks.length ? compositionSchema(resultChecks[0].schema) : null;
  return { inputSchema, resultSchema };
}

function verifyWrite(sideEffect, tool, inputSchema, resultSchema, step) {
  if (sideEffect.kind !== "write") return;
  const target = tool.inputs.find(({ pointer, required }) => pointer === sideEffect.target && required);
  const output = tool.outputs.find(({ pointer }) => pointer === sideEffect.resultTarget);
  const outcomeSchema = resultSchema && schemaAt(resultSchema, sideEffect.outcome);
  const targetSchema = schemaAt(inputSchema, sideEffect.target);
  const outputSchema = resultSchema && schemaAt(resultSchema, sideEffect.resultTarget);
  if (!target || !output || target.type !== output.type || !targetSchema || !outputSchema ||
      !preserves(targetSchema, outputSchema) || !outcomeSchema || !matches(outcomeSchema, sideEffect.value)) {
    reject("undocumented_effect", "Write must confirm the typed input target and a documented observable outcome", step);
  }
}

function authorizedSource(ontology, policy) {
  const source = ontology.sources.find(({ id }) => id === policy?.source);
  if (!onlyFields(policy, ["schemaVersion", "source", "origin", "access", "tools"]) ||
      policy.schemaVersion !== "wmcp-workflow-policy/v1" || source?.kind !== "site" ||
      typeof policy.origin !== "string" || source.origin !== policy.origin ||
      !["public", "session"].includes(policy.access) || !record(policy.tools)) {
    reject("invalid_policy", "Policy must name one documented WebMCP source, origin and access mode");
  }
  return source;
}

export function composeWorkflow(ontology, workflow, policy) {
  if (!onlyFields(workflow, ["schemaVersion", "id", "inputs", "initialState", "steps", "outputs"]) ||
      workflow.schemaVersion !== "wmcp-workflow/v1" || !toolName(workflow.id) || !record(workflow.inputs) ||
      !record(workflow.outputs) || !Array.isArray(workflow.steps) || !workflow.steps.length || workflow.steps.length > 32) {
    reject("invalid_workflow", "Expected a named workflow with typed inputs, explicit outputs and 1–32 ordered steps");
  }
  const source = authorizedSource(ontology, policy);
  const stateIds = new Map(source.states.map(({ id, access }) => [id, access]));
  if (!stateIds.has(workflow.initialState)) reject("state_mismatch", "Workflow requires a documented initial state");
  if (policy.access === "public" && stateIds.get(workflow.initialState) !== "public") {
    reject("permission_denied", "Public composition cannot enter a session-only state");
  }
  const types = new Map(ontology.types.map(({ id, jsonType }) => [id, jsonType]));
  const inputs = new Map(Object.entries(workflow.inputs).map(([name, declaration]) => {
    if (!toolName(name) || !onlyFields(declaration, ["type", "schema"]) || !types.has(declaration.type)) {
      reject("invalid_workflow", "Invalid input type for " + name);
    }
    let schema;
    try { schema = compositionSchema(declaration.schema); }
    catch (error) { reject("unsupported_schema", error.message); }
    if (schema.type !== types.get(declaration.type)) reject("type_mismatch", "Input schema does not match " + declaration.type);
    return [name, { type: declaration.type, schema }];
  }));

  const capabilities = new Map(ontology.capabilities.map((tool) => [tool.id, tool]));
  const previous = new Map();
  let state = workflow.initialState;
  for (const step of workflow.steps) {
    if (!onlyFields(step, ["id", "tool", "bindings"]) || !toolName(step.id) || previous.has(step.id)) reject("invalid_workflow", "Invalid or duplicate step id");
    const tool = capabilities.get(step.tool);
    if (!tool || tool.sourceId !== source.id || tool.interface.kind !== "webmcp" || tool.interface.origin !== policy.origin) {
      reject("permission_denied", "Step must name a WebMCP tool at the authorized source and origin", step.id);
    }
    checkConditions(tool, step.id);
    const requiredState = single(tool.preconditions, "state", step.id).state;
    if (requiredState !== state) reject("state_mismatch", "Current state does not meet tool precondition", step.id);
    const declaredStates = tool.postconditions.filter(({ kind }) => kind === "state");
    if (declaredStates.length > 1) reject("unsupported_contract", "Ambiguous destination state", step.id);
    const nextState = declaredStates[0]?.state ?? state;
    if (policy.access === "public" && stateIds.get(nextState) !== "public") {
      reject("permission_denied", "Public composition cannot enter a session-only state", step.id);
    }
    let sideEffect;
    try { sideEffect = documentedSideEffect(tool.sideEffect, tool.effect, tool.postconditions); }
    catch (error) { reject("undocumented_effect", error.message, step.id); }
    if (nextState !== state && sideEffect.kind !== "navigate") {
      reject("undocumented_effect", "State change requires an explicit navigation effect", step.id);
    }
    const authorization = authorizeTool(tool, policy, sideEffect, step.id);
    let schemas;
    try { schemas = schemasFor(tool); }
    catch (error) { reject("unsupported_schema", error.message, step.id); }
    verifyWrite(sideEffect, tool, schemas.inputSchema, schemas.resultSchema, step.id);
    let bindings;
    try { bindings = bindingsFor(step, tool, schemas.inputSchema, inputs, previous); }
    catch (error) {
      if (error instanceof CompositionError) throw error;
      reject("unbound_input", error.message, step.id);
    }
    previous.set(step.id, {
      id: step.id, capability: tool.id, tool: tool.name, fromState: state, toState: nextState, sideEffect,
      ...authorization, ...schemas, bindings, outputs: tool.outputs,
      preconditions: tool.preconditions, postconditions: tool.postconditions,
    });
    state = nextState;
  }
  const outputs = Object.fromEntries(Object.entries(workflow.outputs).map(([name, reference]) => {
    if (!toolName(name)) reject("invalid_workflow", "Invalid output name");
    const { type, schema, source } = readReference(reference, inputs, previous);
    return [name, { type, schema, from: source }];
  }));
  return {
    schemaVersion: "wmcp-composed-workflow/v1", id: workflow.id, mode: "specification-only",
    source: source.id, origin: policy.origin, access: policy.access,
    initialState: workflow.initialState, finalState: state,
    inputs: Object.fromEntries(inputs), steps: [...previous.values()], outputs,
    failurePolicy: { stop: "first-failure", retries: 0, rollback: false, unverifiedWrite: "unknown" },
  };
}

function draftStep(id, tool, inputSchema) {
  const inputs = [];
  const bindings = tool.inputs.filter(({ required }) => required).map(({ type, pointer }, index) => {
    const name = id + "-input-" + (index + 1);
    inputs.push([name, { type, schema: schemaAt(inputSchema, pointer) }]);
    return { transform: "identity", from: { input: name }, to: pointer };
  });
  return { inputs, step: { id, tool: tool.id, bindings } };
}

export function findCompositions(ontology, policy) {
  authorizedSource(ontology, policy);
  const capabilities = new Map(ontology.capabilities.map((tool) => [tool.id, tool]));
  const make = (id, initialState, steps, inputs, outputs = {}) => ({
    schemaVersion: "wmcp-workflow/v1", id, initialState, steps, inputs: Object.fromEntries(inputs), outputs,
  });
  const primitives = [];
  const excluded = [];
  for (const id of Object.keys(policy.tools).sort()) {
    const tool = capabilities.get(id);
    try {
      if (!tool) reject("permission_denied", "Unknown tool");
      const draft = draftStep("first", tool, compositionSchema(tool.inputSchema));
      const state = tool.preconditions.find(({ kind }) => kind === "state")?.state;
      const workflow = make("primitive", state, [draft.step], draft.inputs);
      const { steps: [verified] } = composeWorkflow(ontology, workflow, policy);
      primitives.push({ tool, verified, first: draft, second: draftStep("second", tool, verified.inputSchema) });
    } catch (error) {
      excluded.push({ capability: id, code: error.code ?? "unsupported_schema" });
    }
  }
  const result = (truncated, pairs) => ({
    schemaVersion: "wmcp-compatible-compositions/v1", source: policy.source, origin: policy.origin,
    mode: "specification-only", pairs, excluded, truncated,
  });
  const pairs = [];
  for (const first of primitives) {
    for (const second of primitives) {
      if (first.tool.id === second.tool.id || first.verified.toState !== second.verified.fromState) continue;
      const wired = new Set();
      const bindings = second.second.step.bindings.map((binding) => {
        const target = second.tool.inputs.find(({ pointer }) => pointer === binding.to);
        const targetSchema = schemaAt(second.verified.inputSchema, binding.to);
        const matches = first.tool.outputs.filter(({ type, pointer }) =>
          type === target.type && preserves(schemaAt(first.verified.resultSchema, pointer), targetSchema));
        if (matches.length !== 1) return binding;
        wired.add(binding.from.input);
        return { ...binding, from: { step: "first", pointer: matches[0].pointer } };
      });
      if (!wired.size && first.verified.fromState === first.verified.toState) continue;
      const inputs = [...first.first.inputs, ...second.second.inputs.filter(([name]) => !wired.has(name))];
      const steps = [first.first.step, { ...second.second.step, bindings }];
      const outputs = Object.fromEntries(second.tool.outputs.map(({ pointer }, index) =>
        ["output-" + (index + 1), { step: "second", pointer }]));
      const workflow = make("composition-" + (pairs.length + 1), first.verified.fromState, steps, inputs, outputs);
      composeWorkflow(ontology, workflow, policy);
      if (pairs.length === 50) return result(true, pairs);
      pairs.push({ capabilities: [first.tool.id, second.tool.id], workflow });
    }
  }
  return result(false, pairs);
}
