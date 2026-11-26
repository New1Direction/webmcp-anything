import { textHash } from "./capability-ontology.mjs";
import { localReference, pointerPart, record } from "./compile-schema.mjs";

export const METHODS = ["lexical", "embedding", "graph"];
const EFFECTS = ["read", "write", "navigate"];
const STOP = new Set("a an and for from i in is it me my of on or please that the this to with you".split(" "));
const MAX_RESULTS = 50;
const compareIds = (left, right) => left < right ? -1 : left === right ? 0 : 1;

function tokens(text) {
  return (text.normalize("NFKC").toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [])
    .filter((token) => !STOP.has(token))
    .map((token) => token.length > 3 && token.endsWith("s") && !token.endsWith("ss") ? token.slice(0, -1) : token);
}

function bm25(capabilities) {
  const documents = new Map();
  const frequencies = new Map();
  let words = 0;
  for (const { id, searchText } of capabilities) {
    const text = tokens(searchText);
    const counts = new Map();
    for (const word of text) counts.set(word, (counts.get(word) ?? 0) + 1);
    for (const word of counts.keys()) frequencies.set(word, (frequencies.get(word) ?? 0) + 1);
    documents.set(id, { counts, length: text.length });
    words += text.length;
  }
  const average = words / capabilities.length || 1;
  return (query) => {
    const terms = [...new Set(tokens(query))].map((word) => {
      const frequency = frequencies.get(word) ?? 0;
      return [word, Math.log(1 + (capabilities.length - frequency + 0.5) / (frequency + 0.5))];
    });
    return (id) => {
      const { counts, length } = documents.get(id);
      const lengthPenalty = 1.2 * (0.25 + 0.75 * length / average);
      return terms.reduce((score, [word, idf]) => {
        const count = counts.get(word) ?? 0;
        return score + idf * (count * 2.2) / (count + lengthPenalty);
      }, 0);
    };
  };
}

function indexVectors(store) {
  if (store?.schemaVersion !== "wmcp-embeddings/v1" || typeof store.model !== "string" || !store.model ||
      !Number.isInteger(store.dimensions) || store.dimensions < 1 || store.dimensions > 4096 || !record(store.vectors)) {
    throw Error("A wmcp-embeddings/v1 vector file is required for embedding retrieval");
  }
  const vectors = new Map();
  for (const [hash, vector] of Object.entries(store.vectors)) {
    if (!/^[a-f0-9]{64}$/.test(hash) || !Array.isArray(vector) || vector.length !== store.dimensions ||
        vector.some((value) => !Number.isFinite(value))) throw Error("Invalid embedding vector");
    const norm = Math.hypot(...vector);
    if (!(norm > 0) || !Number.isFinite(norm)) throw Error("Invalid embedding vector norm");
    vectors.set(hash, vector.map((value) => value / norm));
  }
  return vectors;
}

function vectorScorer(index, capabilities) {
  const lookup = (text) => {
    const vector = index.get(textHash(text));
    if (!vector) throw Error("Missing embedding for a capability or query. Regenerate vectors using the current ontology and exact query.");
    return vector;
  };
  const documents = new Map(capabilities.map(({ id, searchText }) => [id, lookup(searchText)]));
  return (goal) => {
    const query = lookup(goal);
    return (id) => documents.get(id).reduce((score, value, i) => score + value * query[i], 0);
  };
}

function graphScorer(ontology) {
  const terms = ontology.concepts.map(({ id, label, aliases }) =>
    [id, [label, ...aliases].map((text) => tokens(text).join(" ")).filter(Boolean)]);
  const relations = ontology.edges.filter(({ kind }) => kind === "is-a" || kind === "related-to");
  return (query) => {
    const phrase = " " + tokens(query).join(" ") + " ";
    const seeds = new Set(terms.filter(([, aliases]) => aliases.some((alias) => phrase.includes(" " + alias + " "))).map(([id]) => id));
    const matches = new Map([...seeds].map((id) => [id, { score: 1, kind: "outcome", concept: id }]));
    const add = (id, seed, relation, score) => {
      if (!seeds.has(seed) || (matches.get(id)?.score ?? 0) >= score) return;
      matches.set(id, { kind: "related-outcome", concept: id, via: seed, relation, score });
    };
    for (const { kind, from, to } of relations) {
      add(from, to, kind, kind === "is-a" ? 0.6 : 0.3);
      add(to, from, kind, 0.3);
    }
    return (capability) => {
      const best = capability.outcomes.map((outcome) => matches.get(outcome))
        .filter(Boolean).sort((a, b) => b.score - a.score || compareIds(a.concept, b.concept))[0];
      if (!best) return { score: 0, evidence: [] };
      const { score, ...evidence } = best;
      return { score, evidence: [evidence] };
    };
  };
}

function normalizeContext(context, ontology) {
  if (!record(context)) throw Error("Discovery context must be an object");
  const sources = new Map(ontology.sources.map((source) => [source.id, source]));
  const types = new Set(ontology.types.map(({ id }) => id));
  const choose = (values, valid, label) => {
    if (!Array.isArray(values) || values.some((value) => !valid(value))) throw Error("Invalid context " + label);
    return new Set(values);
  };
  const { effects = EFFECTS, sourceIds = [...sources.keys()], states = {}, publicOnly = false, outputType } = context;
  if (typeof publicOnly !== "boolean" || !record(states) ||
      (outputType !== undefined && !types.has(outputType))) throw Error("Invalid discovery context");
  for (const [source, state] of Object.entries(states)) {
    if (!sources.get(source)?.states.some(({ id }) => id === state)) throw Error("Unknown context state for " + source);
  }
  return { publicOnly, states, outputType,
    effects: choose(effects, (effect) => EFFECTS.includes(effect), "effects"),
    sources: choose(sourceIds, (source) => sources.has(source), "sourceIds"),
    available: context.availableTypes === undefined ? null : choose(context.availableTypes, (type) => types.has(type), "availableTypes"),
  };
}

function uncoveredInputs(capability) {
  const covered = new Set(capability.inputs.map(({ pointer }) => pointer));
  const root = capability.inputSchema;
  const missing = [];
  const visit = (schema, path, seen) => {
    if (covered.has(path)) return;
    if (!record(schema)) {
      missing.push(path);
      return;
    }
    if (Object.hasOwn(schema, "$ref") && Object.keys(schema).every((key) => ["$ref", "$defs", "description", "title"].includes(key))) {
      if (seen.has(schema)) {
        missing.push(path);
        return;
      }
      visit(localReference(root, schema.$ref), path, new Set(seen).add(schema));
      return;
    }
    if (schema.type !== "object" || ["oneOf", "anyOf", "allOf", "not", "if", "dependentRequired",
      "dependentSchemas", "minProperties"].some((key) => Object.hasOwn(schema, key))) {
      missing.push(path);
      return;
    }
    for (const name of schema.required ?? []) visit(schema.properties?.[name], path + "/" + pointerPart(name), seen);
  };
  visit(root, "", new Set());
  return missing;
}

function authentication(capability) {
  const requirements = capability.preconditions.filter(({ kind }) => kind === "authentication");
  if (requirements.length !== 1 || !Array.isArray(requirements[0].anyOf) || !requirements[0].anyOf.length ||
      requirements[0].anyOf.some((option) => !Array.isArray(option?.allOf))) return "unknown";
  const options = requirements[0].anyOf;
  if (options.every(({ allOf }) => !allOf.length)) return "public";
  return options.some(({ allOf }) => !allOf.length) ? "public-option" : "required";
}

function capabilitiesFor(ontology) {
  return new Map(ontology.capabilities.map((capability) => {
    const from = capability.preconditions.find(({ kind }) => kind === "state")?.state;
    const to = capability.postconditions.find(({ kind }) => kind === "state")?.state;
    const requiredTypes = [...new Set(capability.inputs.filter(({ required }) => required).map(({ type }) => type))];
    return [capability.id, {
      capability, from, to, requiredTypes, unboundRequiredInputs: uncoveredInputs(capability),
      auth: authentication(capability),
      userAuthorization: capability.effect === "write" ? "always" :
        capability.preconditions.find(({ kind }) => kind === "user-authorization")?.when ?? "unknown",
    }];
  }));
}

function applicable(node, context) {
  const { capability, from, requiredTypes, unboundRequiredInputs, auth, userAuthorization } = node;
  const current = Object.hasOwn(context.states, capability.sourceId) ? context.states[capability.sourceId] : null;
  const state = from === undefined ? "not-required" : current === null ? "unknown" : current === from ? "matches" : "different";
  return {
    state,
    missingTypes: requiredTypes.length && context.available === null ? null : requiredTypes.filter((type) => !context.available?.has(type)),
    unboundRequiredInputs, authentication: auth, userAuthorization,
  };
}

function allowed(node, context) {
  const { capability, auth } = node;
  return context.sources.has(capability.sourceId) && context.effects.has(capability.effect) &&
    (!context.publicOnly || ["public", "public-option"].includes(auth));
}

function knownInputs(status) {
  return status.missingTypes?.length === 0 && !status.unboundRequiredInputs.length;
}

function planningOrigin(binding) {
  if (binding.kind === "webmcp") return binding.origin;
  if (binding.kind !== "http" || !Array.isArray(binding.servers) || !binding.servers.length) return null;
  const origins = new Set();
  for (const server of binding.servers) {
    try {
      if (typeof server !== "string" || /^[^/]+:\/\/[^/]*[{}]/u.test(server)) return null;
      origins.add(new URL(server).origin);
    } catch {
      return null;
    }
  }
  return origins.size === 1 ? [...origins][0] : null;
}

function planFor(target, status, nodes, context) {
  if (status.missingTypes === null || status.unboundRequiredInputs.length ||
      status.state === "unknown" || (knownInputs(status) && status.state !== "different")) return null;
  const goal = target.capability;
  const origin = planningOrigin(goal.interface);
  if (!origin) return null;
  let plan = null;
  for (const node of nodes) {
    const first = node.capability;
    if (first.id === goal.id || first.sourceId !== goal.sourceId || first.effect === "write" ||
        planningOrigin(first.interface) !== origin) continue;
    const initial = applicable(node, context);
    if (!knownInputs(initial) || !["matches", "not-required"].includes(initial.state)) continue;
    const bindings = [];
    for (const input of goal.inputs.filter(({ required, type }) => required && status.missingTypes.includes(type))) {
      const outputs = first.outputs.filter(({ type }) => type === input.type);
      if (outputs.length === 1) bindings.push({ type: input.type, from: outputs[0].pointer, to: input.pointer });
    }
    const resolved = goal.inputs.every(({ required, type, pointer }) =>
      !required || !status.missingTypes.includes(type) || bindings.some(({ to }) => to === pointer));
    if (!resolved) continue;
    const stateAfter = node.to ?? (Object.hasOwn(context.states, goal.sourceId) ? context.states[goal.sourceId] : null);
    if (target.from !== undefined && stateAfter !== target.from) continue;
    if (plan) return null;
    plan = {
      mode: "candidate-only",
      steps: [node, target].map(({ capability, auth, userAuthorization }) => ({
        id: capability.id, preconditions: capability.preconditions, postconditions: capability.postconditions,
        authentication: auth, userAuthorization,
      })),
      bindings,
      ...(node.to !== undefined && node.to !== node.from ? { transition: { from: node.from, to: node.to } } : {}),
    };
  }
  return plan;
}

export function createDiscovery(ontology, { embeddings } = {}) {
  const lexical = bm25(ontology.capabilities);
  const graph = graphScorer(ontology);
  const embedding = embeddings === undefined ? null : vectorScorer(indexVectors(embeddings), ontology.capabilities);
  const index = capabilitiesFor(ontology);
  return (goal, { method = "graph", context = {}, limit = 5 } = {}) => {
    if (typeof goal !== "string" || !goal.trim() || goal.length > 2048) throw Error("Expected a goal of 1–2048 characters");
    if (!METHODS.includes(method) || !Number.isInteger(limit) || limit < 1 || limit > MAX_RESULTS) {
      throw Error("Invalid discovery method or result limit");
    }
    if (method === "embedding" && !embedding) throw Error("Embedding retrieval requires an embeddings file");
    const constraints = normalizeContext(context, ontology);
    const candidates = [...index.values()].filter((node) => allowed(node, constraints));
    const termScore = lexical(goal);
    const semanticScore = method === "embedding" ? embedding(goal) : null;
    const conceptScore = graph(goal);
    const result = [];
    for (const node of candidates) {
      const capability = node.capability;
      if (constraints.outputType && !capability.outputs.some(({ type }) => type === constraints.outputType)) continue;
      const lexicalScore = termScore(capability.id);
      const match = method === "graph" ? conceptScore(capability) : { score: 0, evidence: [] };
      let score = method === "embedding" ? semanticScore(capability.id) : lexicalScore;
      if (method === "graph") score = 0.55 * lexicalScore / (lexicalScore + 3) + 0.85 * match.score;
      if (score <= 0) continue;
      const applicability = applicable(node, constraints);
      const plan = method === "graph" ? planFor(node, applicability, candidates, constraints) : null;
      if (plan) score += 0.15;
      const blocked = applicability.state === "different" || (applicability.missingTypes?.length ?? 0) > 0;
      result.push({ capability, score, applicability, evidence: match.evidence, plan, blocked: blocked && !plan });
    }
    result.sort((a, b) => Number(a.blocked) - Number(b.blocked) || b.score - a.score || compareIds(a.capability.id, b.capability.id));
    return {
      schemaVersion: "wmcp-capability-discovery/v1", goal, method, mode: "discovery-only",
      ...(method === "embedding" ? { model: embeddings.model } : {}),
      results: result.slice(0, limit).map(({ score, ...entry }) => ({ ...entry, score: Number(score.toFixed(6)) })),
    };
  };
}
