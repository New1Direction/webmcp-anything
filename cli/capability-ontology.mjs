import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { compileCapabilities, readLocalJson } from "./compile.mjs";
import { localReference, record, toolName } from "./compile-schema.mjs";

const CATALOG_VERSION = "wmcp-discovery-catalog/v1";
const ONTOLOGY_VERSION = "wmcp-capability-ontology/v1";
const JSON_TYPES = ["boolean", "number", "integer", "string", "object", "array", "null"];
const POINTER = /^(?:\/(?:[^/~]|~[01])*)*$/;
const text = (value) => typeof value === "string" && value.trim().length > 0;
export const textHash = (value) => createHash("sha256").update(value).digest("hex");

function array(value, label) {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw Error(label + " must be an array");
  return value;
}

function byId(list, label, normalize) {
  const map = new Map();
  for (const item of array(list, label)) {
    if (!record(item) || !toolName(item.id) || map.has(item.id)) throw Error("Invalid or duplicate " + label + " id");
    map.set(item.id, normalize(item));
  }
  return map;
}

function inspectPointer(root, pointer) {
  let schema = root;
  let required = true;
  const dereference = () => {
    const seen = new Set();
    while (record(schema) && Object.hasOwn(schema, "$ref")) {
      if (seen.has(schema) || Object.keys(schema).some((key) => !["$ref", "$defs", "description", "title"].includes(key))) return null;
      seen.add(schema);
      schema = localReference(root, schema.$ref);
    }
    return schema;
  };
  for (const part of pointer ? pointer.slice(1).split("/") : []) {
    schema = dereference();
    const key = part.replace(/~1/g, "/").replace(/~0/g, "~");
    if (schema?.type !== "object" || !record(schema.properties) || !Object.hasOwn(schema.properties, key)) return null;
    required &&= Array.isArray(schema.required) && schema.required.includes(key);
    schema = schema.properties[key];
  }
  return { type: dereference()?.type, required };
}

function outputSchemas(tool) {
  const result = [];
  for (const condition of tool.postconditions) {
    if (condition.kind === "result-schema") result.push({ schema: condition.schema });
    if (condition.kind !== "http-response") continue;
    for (const response of condition.alternatives ?? []) {
      if (!response.media?.length) result.push({ status: response.status, schema: null });
      for (const media of response.media ?? []) {
        result.push({ status: response.status, contentType: media.contentType, schema: media.schema ?? null });
      }
    }
  }
  return result;
}

function bindings(items, schemas, types, label, output = false) {
  const seen = new Set();
  return array(items, label).map((item) => {
    if (!record(item) || !types.has(item.type) || typeof item.pointer !== "string" ||
        !POINTER.test(item.pointer) || seen.has(item.pointer)) throw Error(label + " has an invalid or duplicate data binding");
    seen.add(item.pointer);
    const fields = schemas.map((schema) => inspectPointer(schema, item.pointer));
    if (!fields.length || fields.some((field) => field?.type !== types.get(item.type).jsonType || (output && !field.required))) {
      throw Error(label + " binding is not guaranteed by the documented schema at " + item.pointer);
    }
    return { type: item.type, pointer: item.pointer, required: fields.every((field) => field.required) };
  });
}

function contractOf(document) {
  const spec = document?.schemaVersion === "wmcp-capabilities/v1" ? document : compileCapabilities(document);
  if (spec.complete !== true || spec.execution !== "specification-only" || !Array.isArray(spec.tools) ||
      !record(spec.source) || !text(spec.source.title) || !Array.isArray(spec.states)) {
    throw Error("Discovery requires a complete WMCP capability specification");
  }
  return spec;
}

function normalizeTool(sourceId, tool, annotations, concepts, types, states) {
  if (!record(tool) || !toolName(tool.name) || !text(tool.description) ||
      !["read", "write", "navigate"].includes(tool.effect) || !record(tool.inputSchema) ||
      !Array.isArray(tool.preconditions) || !Array.isArray(tool.postconditions) || !record(tool.interface) ||
      [...tool.preconditions, ...tool.postconditions].some((condition) => !record(condition))) {
    throw Error("Invalid capability in " + sourceId);
  }
  const id = sourceId + ":" + tool.name;
  const referencedStates = [...tool.preconditions, ...tool.postconditions].filter(({ kind }) => kind === "state");
  for (const { state } of referencedStates) {
    if (!states.has(state)) throw Error("Unknown documented state for " + id);
    if (states.get(state).access === "session" && tool.preconditions.some(({ kind, anyOf }) =>
      kind === "authentication" && Array.isArray(anyOf) && anyOf.some((option) => option?.allOf?.length === 0))) {
      throw Error("Public authentication alternative conflicts with a session state for " + id);
    }
  }
  const annotation = Object.hasOwn(annotations, id) ? annotations[id] : {};
  if (!record(annotation)) throw Error("Invalid annotation for " + id);
  const outcomes = array(annotation.outcomes, "Outcomes for " + id);
  if (outcomes.some((outcome) => !concepts.has(outcome)) || new Set(outcomes).size !== outcomes.length) {
    throw Error("Invalid outcome for " + id);
  }
  const outputs = outputSchemas(tool);
  const searchText = [tool.name.replace(/[_.-]+/g, " "), tool.description, ...array(tool.tags, "Tool tags")]
    .filter(text).join(" ");
  return {
    id, sourceId, name: tool.name, ...(text(tool.title) ? { title: tool.title } : {}),
    description: tool.description, effect: tool.effect,
    interface: tool.interface, source: tool.source, outcomes, searchText,
    ...(Object.hasOwn(tool, "sideEffect") ? { sideEffect: tool.sideEffect } : {}),
    inputSchema: tool.inputSchema, outputSchemas: outputs,
    inputs: bindings(annotation.inputs, [tool.inputSchema], types, id + " input"),
    outputs: bindings(annotation.outputs, outputs.map(({ schema }) => schema), types, id + " output", true),
    preconditions: tool.preconditions, postconditions: tool.postconditions,
  };
}

function assertTaxonomy(concepts, edges) {
  const pending = new Map([...concepts.keys()].map((id) => [id, 0]));
  const children = new Map();
  for (const { kind, from, to } of edges) {
    if (kind !== "is-a") continue;
    pending.set(from, pending.get(from) + 1);
    if (!children.has(to)) children.set(to, []);
    children.get(to).push(from);
  }
  const roots = [...pending].filter(([, parents]) => parents === 0).map(([id]) => id);
  for (let i = 0; i < roots.length; i++) {
    for (const child of children.get(roots[i]) ?? []) {
      pending.set(child, pending.get(child) - 1);
      if (pending.get(child) === 0) roots.push(child);
    }
  }
  if (roots.length !== concepts.size) throw Error("Concept hierarchy contains a cycle");
}

export function buildOntology(catalog, load) {
  if (catalog?.schemaVersion !== CATALOG_VERSION || !Array.isArray(catalog.sources) || !catalog.sources.length) {
    throw Error("Expected " + CATALOG_VERSION + " with at least one source");
  }
  const concepts = byId(catalog.concepts, "concept", ({ id, label, aliases, broader, related }) => {
    if (!text(label) || array(aliases, "Concept aliases").some((term) => !text(term))) throw Error("Invalid label or alias for concept " + id);
    return { id, label, aliases: aliases ?? [], broader: array(broader, "Broader concepts"), related: array(related, "Related concepts") };
  });
  const types = byId(catalog.types, "data type", ({ id, jsonType }) => {
    if (!JSON_TYPES.includes(jsonType)) throw Error("Invalid JSON type for " + id);
    return { id, jsonType };
  });
  const annotations = catalog.capabilities ?? {};
  if (!record(annotations)) throw Error("Capability annotations must be an object");
  const capabilities = new Map();
  const sources = byId(catalog.sources, "source", ({ id, file }) => {
    if (!text(file)) throw Error("Source " + id + " requires a local file");
    const spec = contractOf(load(file));
    const states = byId(spec.states, "state", (state) => {
      if (!["public", "session"].includes(state.access)) throw Error("Invalid documented access for state " + state.id);
      return state;
    });
    for (const tool of spec.tools) {
      const capability = normalizeTool(id, tool, annotations, concepts, types, states);
      if (capabilities.has(capability.id)) throw Error("Duplicate capability " + capability.id);
      capabilities.set(capability.id, capability);
    }
    return { ...spec.source, id, states: spec.states, navigation: spec.navigation ?? [] };
  });
  for (const id of Object.keys(annotations)) {
    if (!capabilities.has(id)) throw Error("Annotation names an unknown capability " + id);
  }

  const edges = [];
  for (const concept of concepts.values()) {
    for (const [kind, neighbors] of [["is-a", concept.broader], ["related-to", concept.related]]) {
      for (const target of new Set(neighbors)) {
        if (target === concept.id || !concepts.has(target)) throw Error("Invalid concept relation from " + concept.id);
        edges.push({ kind, from: concept.id, to: target });
      }
    }
  }
  assertTaxonomy(concepts, edges);
  const stateId = (source, state) => "state:" + source + ":" + state;
  for (const source of sources.values()) {
    for (const { from, to, label } of source.navigation) {
      edges.push({ kind: "navigates-to", from: stateId(source.id, from), to: stateId(source.id, to), label });
    }
  }
  for (const capability of capabilities.values()) {
    for (const outcome of capability.outcomes) edges.push({ kind: "achieves", from: capability.id, to: outcome });
    for (const [kind, conditions] of [["requires-state", capability.preconditions], ["enters-state", capability.postconditions]]) {
      for (const { state } of conditions.filter(({ kind }) => kind === "state")) {
        edges.push({ kind, from: capability.id, to: stateId(capability.sourceId, state) });
      }
    }
    for (const [kind, list] of [["consumes", capability.inputs], ["produces", capability.outputs]]) {
      for (const { type, pointer } of list) edges.push({ kind, from: capability.id, to: type, pointer });
    }
  }
  return {
    schemaVersion: ONTOLOGY_VERSION,
    sources: [...sources.values()], concepts: [...concepts.values()], types: [...types.values()],
    capabilities: [...capabilities.values()], edges,
  };
}

export function loadOntology(path) {
  const catalog = readLocalJson(path, "Discovery catalog");
  return buildOntology(catalog, (file) => readLocalJson(resolve(dirname(path), file), "Capability source"));
}
