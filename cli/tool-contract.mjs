import { record, toolName } from "./compile-schema.mjs";
import { checkSchema, validateValue } from "./json-schema-check.mjs";
import { isPointer, keysAt } from "./composition-contract.mjs";
import { compositionSchema } from "./composition-schema.mjs";
import { compileCapabilities, readLocalJson } from "./compile.mjs";

export const CONTRACT_VERSION = "wmcp-tool-contract/v1";
const FIELDS = ["schemaVersion", "name", "inputSchema", "outputSchema", "authorization", "sideEffects", "idempotency", "failures"];
const CONFIRMATION = ["always", "authenticated-use", "never", "unknown"];
const MODES = ["idempotent", "keyed", "non-idempotent", "unknown"];
const EFFECTS = ["not-applied", "applied", "partial", "unknown"];
const RECOVERY = ["stop", "retry", "reconcile"];
const text = (value) => typeof value === "string" && value.length <= 512 && !!value.trim();
const fields = (value, allowed) => record(value) && Object.keys(value).every((key) => allowed.includes(key));
const strings = (value) => Array.isArray(value) && value.every(text) && new Set(value).size === value.length;
const publicAlternative = (alternative) => Array.isArray(alternative) && alternative.length === 0;

function inspectAuthorization(value, issue, unknown) {
  if (!fields(value, ["anyOf", "confirmation"]) || !CONFIRMATION.includes(value.confirmation)) {
    issue("/authorization", "Expected explicit alternatives and confirmation.");
    return;
  }
  if (value.confirmation === "unknown") unknown.push("/authorization/confirmation");
  if (value.anyOf === null) { unknown.push("/authorization/anyOf"); return; }
  if (!Array.isArray(value.anyOf) || !value.anyOf.length || value.anyOf.some((alternative) =>
    !Array.isArray(alternative) || alternative.some((requirement) =>
      !fields(requirement, ["scheme", "boundary", "permissions"]) || !text(requirement.scheme) ||
      !text(requirement.boundary) || !strings(requirement.permissions)))) {
    issue("/authorization/anyOf", "Expected one or more alternatives with scoped requirements. Use an empty alternative for public access.");
  }
}

function validTarget(target) {
  return (fields(target, ["inputPointer"]) && isPointer(target.inputPointer)) ||
    (fields(target, ["resource"]) && text(target.resource));
}

function inspectEffects(value, issue, unknown) {
  if (value === null) { unknown.push("/sideEffects"); return; }
  if (!Array.isArray(value) || value.some((effect) => !fields(effect, ["kind", "boundary", "target"]) ||
      !toolName(effect.kind) || !text(effect.boundary) || (Object.hasOwn(effect, "target") && !validTarget(effect.target)))) {
    issue("/sideEffects", "Expected declared effects with a kind, boundary and optional input pointer or fixed resource.");
  }
}

function keyCheck(input, keyPointer) {
  if (input === null) return "unverified";
  let schema;
  try { schema = compositionSchema(input); }
  catch { return "unverified"; }
  for (const key of keysAt(keyPointer)) {
    if (schema.type !== "object" || !Object.hasOwn(schema.properties, key)) return "invalid";
    schema = schema.properties[key];
  }
  return schema.type === "string" ? "declared" : "invalid";
}

function inspectIdempotency(value, input, issue, unknown) {
  if (!record(value) || !MODES.includes(value.mode)) {
    issue("/idempotency", "Expected an explicit idempotency mode.");
    return;
  }
  if (value.mode === "unknown") unknown.push("/idempotency");
  if (value.mode !== "keyed") {
    if (!fields(value, ["mode"])) issue("/idempotency", "Only keyed mode uses key and deduplication fields.");
    return;
  }
  if (!fields(value, ["mode", "keyPointer", "boundary", "windowSeconds"]) ||
      !isPointer(value.keyPointer) || !text(value.boundary) ||
      (value.windowSeconds !== null && (!Number.isSafeInteger(value.windowSeconds) || value.windowSeconds < 1))) {
    issue("/idempotency", "Keyed mode requires an input pointer, a deduplication boundary and a positive window or explicit no expiry.");
    return;
  }
  const key = keyCheck(input, value.keyPointer);
  if (key === "unverified") unknown.push("/idempotency/keyPointer");
  if (key === "invalid") issue("/idempotency/keyPointer", "Key pointer must name a declared string input.");
}

function inspectFailures(contract, issue, unknown) {
  if (contract.failures === null) { unknown.push("/failures"); return; }
  if (!record(contract.failures)) {
    issue("/failures", "Expected a map of failure codes.");
    return;
  }
  for (const [code, failure] of Object.entries(contract.failures)) {
    if (!toolName(code) || !fields(failure, ["effects", "recovery"]) ||
        !EFFECTS.includes(failure.effects) || !RECOVERY.includes(failure.recovery)) {
      issue("/failures", "A failure needs a stable code, effect status and recovery action.");
      continue;
    }
    const path = "/failures/" + code;
    if (Array.isArray(contract.sideEffects) && !contract.sideEffects.length && ["applied", "partial"].includes(failure.effects)) {
      issue(path + "/effects", "A no-effect contract cannot declare applied or partial side effects.");
    }
    if (failure.recovery === "retry" && (failure.effects === "partial" ||
        (failure.effects !== "not-applied" && !["idempotent", "keyed"].includes(contract.idempotency?.mode)))) {
      issue(path + "/recovery", "Retry for this effect status requires an applicable idempotency guarantee. Partial effects require reconciliation or a stop.");
    }
  }
}

export function auditContract(contract) {
  const issues = [];
  const unknown = [];
  const schemaChecks = {};
  const issue = (path, message) => issues.push({ path, message });
  if (!fields(contract, FIELDS) || contract.schemaVersion !== CONTRACT_VERSION || !toolName(contract.name)) {
    return {
      schemaVersion: "wmcp-tool-contract-audit/v1", valid: false, unknown, schemaChecks,
      issues: [{ path: "", message: "Expected a named " + CONTRACT_VERSION + " contract with the declared fields." }],
    };
  }
  for (const field of ["inputSchema", "outputSchema"]) {
    if (contract[field] === null) {
      unknown.push("/" + field);
      schemaChecks[field] = "unknown";
      continue;
    }
    const result = checkSchema(contract[field]);
    schemaChecks[field] = result.status;
    if (result.status === "unsupported") unknown.push("/" + field);
    if (result.status === "invalid") for (const { path, message } of result.issues) issue("/" + field + path, message);
  }
  inspectAuthorization(contract.authorization, issue, unknown);
  inspectEffects(contract.sideEffects, issue, unknown);
  inspectIdempotency(contract.idempotency, contract.inputSchema, issue, unknown);
  inspectFailures(contract, issue, unknown);
  return { schemaVersion: "wmcp-tool-contract-audit/v1", valid: !issues.length, unknown, schemaChecks, issues };
}

export function failureOutcome(contract, code) {
  return record(contract.failures) && Object.hasOwn(contract.failures, code) ? contract.failures[code] :
    { effects: "unknown", recovery: "reconcile" };
}

function authProjection(tool) {
  const authentication = tool.preconditions.find(({ kind }) => kind === "authentication");
  const confirmation = tool.preconditions.find(({ kind }) => kind === "user-authorization")?.when;
  const alternatives = authentication?.anyOf;
  const possible = Array.isArray(alternatives) && alternatives.length > 0 && alternatives.every((alternative) =>
    Array.isArray(alternative?.allOf) && alternative.allOf.every(record));
  return {
    anyOf: possible ? alternatives.map(({ allOf }) => allOf.map((requirement) => ({
      scheme: requirement.scheme ?? requirement.type,
      boundary: authentication.boundary,
      permissions: requirement.permissions ?? requirement.scopes ?? [],
    }))) : null,
    confirmation: CONFIRMATION.includes(confirmation) ? confirmation : "unknown",
  };
}

function projectEffects(tool) {
  const effect = tool.sideEffect;
  if (effect?.kind === "none") return [];
  const boundary = tool.interface?.origin;
  if (!effect || !boundary) return null;
  if (effect.kind === "navigate") return [{ kind: "browser.navigate", boundary, target: { resource: "state:" + effect.state } }];
  if (effect.kind === "write") return [{ kind: effect.operation, boundary, target: { inputPointer: effect.target } }];
  return null;
}

export function projectToolContract(tool) {
  const output = tool.postconditions.filter(({ kind }) => kind === "result-schema");
  return {
    schemaVersion: CONTRACT_VERSION, name: tool.name,
    inputSchema: tool.inputSchema ?? null,
    outputSchema: output.length === 1 ? output[0].schema : null,
    authorization: authProjection(tool),
    sideEffects: projectEffects(tool),
    idempotency: { mode: "unknown" },
    failures: null,
  };
}

export function inspectToolContract(path, name) {
  const input = readLocalJson(path, "Tool contract source");
  if (name === undefined) return { ...auditContract(input), contract: input };
  const specification = input?.schemaVersion === "wmcp-capabilities/v1" ? input : compileCapabilities(input);
  if (specification.complete !== true || specification.execution !== "specification-only" || !Array.isArray(specification.tools)) {
    throw Error("Contract projection requires a complete capability specification.");
  }
  const tool = specification.tools.find((tool) => tool.name === name);
  if (!tool) throw Error("The named capability was not found.");
  const contract = projectToolContract(tool);
  return { ...auditContract(contract), contract };
}

export function checkToolValue(contract, field, value) {
  if (field !== "inputSchema" && field !== "outputSchema") throw Error("Expected an input or output schema.");
  if (contract[field] === null) return { status: "unknown", issues: [] };
  return validateValue(contract[field], value);
}

export function authorizationSummary(authorization) {
  if (authorization.anyOf === null) return "unknown";
  if (authorization.anyOf.every(publicAlternative)) return "public";
  return authorization.anyOf.some(publicAlternative) ? "public-option" : "requires-credentials";
}
