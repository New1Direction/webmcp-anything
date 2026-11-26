import { resolve, dirname } from "node:path";
import { isDeepStrictEqual } from "node:util";
import { loadOntology, textHash } from "./capability-ontology.mjs";
import { readLocalJson } from "./compile.mjs";
import { record, toolName } from "./compile-schema.mjs";
import { createDiscovery } from "./discover.mjs";
import { findCompositions } from "./compose.mjs";
import { compositionSchema, preserves, schemaAt } from "./composition-schema.mjs";

export const KINDS = ["all", "capabilities", "clusters", "overlaps", "gaps", "compositions"];
const idFor = (kind, id) => kind + ":" + id;
const capId = (id) => idFor("capability", id);
const sourceId = (id) => idFor("service", id);
const asList = (value, label) => {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw Error(label + " must be an array.");
  return value;
};

function groups(ontology, bySource) {
  const concepts = new Map(ontology.concepts.map((concept) => [concept.id, concept]));
  const cached = new Map();
  function roots(id) {
    if (!cached.has(id)) {
      const ancestors = concepts.get(id)?.broader ?? [];
      cached.set(id, ancestors.length ? [...new Set(ancestors.flatMap(roots))] : [id]);
    }
    return cached.get(id);
  }
  const domains = new Map(ontology.sources.map(({ id }) => [
    id, new Set(bySource.get(id).flatMap(({ outcomes }) => outcomes.flatMap(roots))),
  ]));
  const remaining = new Set(domains.keys());
  const clusters = [];
  while (remaining.size) {
    const first = remaining.values().next().value;
    const members = [first];
    remaining.delete(first);
    for (let i = 0; i < members.length; i++) {
      const active = domains.get(members[i]);
      for (const candidate of remaining) {
        if ([...domains.get(candidate)].some((domain) => active.has(domain))) {
          remaining.delete(candidate);
          members.push(candidate);
        }
      }
    }
    const shared = [...domains.get(first)].filter((domain) => members.every((source) => domains.get(source).has(domain)));
    const title = ontology.sources.find(({ id }) => id === first).title;
    clusters.push({
      id: idFor("cluster", [...members].sort()[0]), kind: "cluster", evidence: "inferred",
      label: members.length === 1 ? title : shared.length === 1 ? concepts.get(shared[0]).label : members
        .map((id) => ontology.sources.find((source) => source.id === id).title).join(" + "),
      services: members.map(sourceId),
      outcomes: [...new Set(members.flatMap((id) => [...domains.get(id)]))].map((domain) => concepts.get(domain).label),
    });
  }
  return clusters;
}

function discoverOverlaps(ontology, bySource) {
  const labels = new Map(ontology.concepts.map(({ id, label }) => [id, label]));
  const findings = [];
  for (let i = 0; i < ontology.sources.length; i++) {
    const left = ontology.sources[i];
    for (const right of ontology.sources.slice(i + 1)) {
      const shared = [];
      for (const a of bySource.get(left.id)) for (const b of bySource.get(right.id)) {
        if (a.effect !== b.effect) continue;
        for (const outcome of a.outcomes.filter((id) => b.outcomes.includes(id))) {
          shared.push({
            outcome, label: labels.get(outcome), effect: a.effect, tools: [capId(a.id), capId(b.id)],
            samePayloadSchemas: isDeepStrictEqual(a.inputSchema, b.inputSchema) && isDeepStrictEqual(a.outputSchemas, b.outputSchemas),
            samePreconditions: isDeepStrictEqual(a.preconditions, b.preconditions),
          });
        }
      }
      if (!shared.length) continue;
      const outcomes = new Set(shared.map(({ outcome }) => outcome));
      findings.push({
        id: idFor("overlap", [left.id, right.id].sort().join(":")), kind: "overlap", evidence: "inferred",
        label: left.title + " ↔ " + right.title,
        description: outcomes.size + (outcomes.size === 1 ? " shared outcome. " : " shared outcomes. ") +
          "Review schemas, permissions and resource scope before substituting a service.",
        services: [sourceId(left.id), sourceId(right.id)],
        capabilities: [...new Set(shared.flatMap(({ tools }) => tools))], shared,
      });
    }
  }
  return findings;
}

function compileShapes(tool) {
  const parse = (schema) => {
    try { return compositionSchema(schema); }
    catch { return null; }
  };
  return { input: parse(tool.inputSchema), outputs: tool.outputSchemas.map(({ schema }) => parse(schema)) };
}

function interfaceOrigin(binding) {
  if (binding.kind === "webmcp") return binding.origin;
  if (binding.kind !== "http" || !binding.servers?.length) return null;
  const origins = new Set();
  for (const server of binding.servers) {
    try {
      if (/^[^/]+:\/\/[^/]*[{}]/u.test(server)) return null;
      const address = new URL(server);
      if (!["http:", "https:"].includes(address.protocol)) return null;
      origins.add(address.origin);
    } catch {
      return null;
    }
  }
  return origins.size === 1 ? [...origins][0] : null;
}

function matchBinding(producer, consumerShape, pointer) {
  const target = schemaAt(consumerShape, pointer);
  const outputs = producer.shapes.outputs.map((output) => schemaAt(output, producer.binding.pointer));
  if (!target || !outputs.length || outputs.some((schema) => !schema)) return "unknown";
  return outputs.every((output) => preserves(output, target)) ? "compatible" : "different";
}

function checkedPairs(ontology, policies, lookup) {
  const pairs = new Map();
  for (const policy of policies) {
    const report = findCompositions(ontology, policy);
    for (const { capabilities: ids, workflow } of report.pairs) {
      const [first, second] = ids.map((id) => lookup.get(id));
      const id = idFor("composition", first.id + ":" + second.id);
      const grant = { source: policy.source, origin: policy.origin, access: policy.access, workflow };
      if (pairs.has(id)) { pairs.get(id).policies.push(grant); continue; }
      pairs.set(id, {
        id, kind: "composition", evidence: "policy-checked",
        label: (first.title ?? first.name) + " → " + (second.title ?? second.name),
        description: "The workflow checker accepted this pair under the supplied local policy.",
        services: [sourceId(first.sourceId)], capabilities: ids.map(capId), policies: [grant],
      });
    }
  }
  return pairs;
}

function assessFlows(ontology, pairs) {
  const shapes = new Map(ontology.capabilities.map((tool) => [tool.id, compileShapes(tool)]));
  const byType = new Map();
  for (const tool of ontology.capabilities) {
    for (const binding of tool.outputs) {
      if (!byType.has(binding.type)) byType.set(binding.type, []);
      byType.get(binding.type).push({ tool, binding, shapes: shapes.get(tool.id) });
    }
  }
  return (consumer, input) => (byType.get(input.type) ?? [])
    .filter(({ tool }) => tool.id !== consumer.id)
    .map((entry) => {
      const { tool: producer, binding } = entry;
      const pair = pairs.get(idFor("composition", producer.id + ":" + consumer.id));
      const covered = pair?.policies.some(({ workflow }) => workflow.steps[1].bindings.some(({ from, to }) =>
        from.step === "first" && from.pointer === binding.pointer && to === input.pointer));
      const schema = matchBinding(entry, shapes.get(consumer.id).input, input.pointer);
      const origin = interfaceOrigin(producer.interface);
      const sharedBoundary = producer.sourceId === consumer.sourceId && !!origin && origin === interfaceOrigin(consumer.interface);
      return {
        producer: producer.id, source: producer.sourceId, schema, sharedBoundary, covered: covered === true,
        from: binding.pointer, to: input.pointer, type: input.type, effect: producer.effect,
      };
    });
}

function inferredFlows(ontology, lookup, assess) {
  const flows = [];
  for (const consumer of ontology.capabilities) for (const input of consumer.inputs.filter(({ required }) => required)) {
    for (const flow of assess(consumer, input)) {
      if (flow.covered || flow.schema !== "compatible" || flow.effect === "write") continue;
      const producer = lookup.get(flow.producer);
      flows.push({
        id: idFor("composition", "typed-" + textHash(JSON.stringify([producer.id, consumer.id, flow.from, flow.to])).slice(0, 20)),
        kind: "composition", evidence: "inferred",
        label: (producer.title ?? producer.name) + " → " + (consumer.title ?? consumer.name),
        description: flow.sharedBoundary
          ? "Typed fields are compatible. Check invocation permissions and application state."
          : "Typed fields match across a boundary. A connector, identifier scope and authorization need review.",
        services: [...new Set([sourceId(producer.sourceId), sourceId(consumer.sourceId)])],
        capabilities: [capId(producer.id), capId(consumer.id)], binding: flow,
      });
    }
  }
  return flows;
}

function integrationGaps(needs, lookup, sources, assess) {
  const seen = new Set();
  const problems = {
    "no-producer": "No typed producer for the requested input was found in the specified catalog scope.",
    "boundary-mapping": "A typed producer is documented. A connector and resource identity mapping across the named boundary are unverified.",
    "schema-gap": "A producer uses the declared semantic type, but its output schema is incompatible or unverified.",
    "unverified-wiring": "A compatible producer exists. The requested wiring is outside the checked workflow policies.",
    "write-prerequisite": "The available producers require a write. A read-only prerequisite or an explicitly approved workflow is needed.",
  };
  return needs.flatMap((need) => {
    if (!record(need) || !toolName(need.id) || seen.has(need.id) ||
        typeof need.label !== "string" || !need.label.trim() ||
        (need.producerSource !== undefined && !sources.has(need.producerSource))) throw Error("Invalid or duplicate integration need.");
    seen.add(need.id);
    const consumer = lookup.get(need.consumer);
    const input = consumer?.inputs.find(({ pointer }) => pointer === need.input);
    if (!input) throw Error("Integration need must name a declared typed input.");
    const candidates = assess(consumer, input).filter(({ source }) => need.producerSource === undefined || source === need.producerSource);
    if (candidates.some(({ covered }) => covered)) return [];
    const compatible = candidates.filter(({ schema }) => schema === "compatible");
    const reads = compatible.filter(({ effect }) => effect === "read");
    const reason = !candidates.length ? "no-producer" : !compatible.length ? "schema-gap" :
      compatible.every(({ effect }) => effect === "write") ? "write-prerequisite" :
        (reads.length ? reads : compatible).some(({ sharedBoundary }) => sharedBoundary) ? "unverified-wiring" : "boundary-mapping";
    return [{
      id: idFor("gap", need.id), kind: "gap", evidence: "inferred", label: need.label, description: problems[reason],
      reason, boundaryUnverified: candidates.some(({ sharedBoundary }) => !sharedBoundary),
      type: input.type, consumer: capId(consumer.id), input: input.pointer,
      services: [...new Set([consumer.sourceId, need.producerSource, ...candidates.map(({ source }) => source)]
        .filter(Boolean).map(sourceId))],
      capabilities: [capId(consumer.id), ...new Set(candidates.map(({ producer }) => capId(producer)))],
      candidates,
    }];
  });
}

export function buildEcosystem(ontology, { needs = [], policies = [] } = {}) {
  const lookup = new Map(ontology.capabilities.map((tool) => [tool.id, tool]));
  const bySource = new Map(ontology.sources.map(({ id }) => [id, ontology.capabilities.filter(({ sourceId }) => sourceId === id)]));
  const clusters = groups(ontology, bySource);
  const services = ontology.sources.map((source) => ({
    id: sourceId(source.id), sourceId: source.id, kind: "service", evidence: "documented",
    label: source.title, origin: source.origin ?? null, interface: source.kind,
    capabilities: bySource.get(source.id).map(({ id }) => capId(id)),
    cluster: clusters.find(({ services }) => services.includes(sourceId(source.id))).id,
  }));
  const outcomes = new Map(ontology.concepts.map(({ id, label }) => [id, label]));
  const capabilities = ontology.capabilities.map((tool) => ({
    id: capId(tool.id), capabilityId: tool.id, kind: "capability", evidence: "documented",
    label: tool.title ?? tool.name, name: tool.name, description: tool.description,
    service: sourceId(tool.sourceId), effect: tool.effect, outcomes: tool.outcomes.map((id) => outcomes.get(id)),
    provenance: { source: tool.sourceId, pointer: tool.source, interface: tool.interface },
    inputs: tool.inputs, outputs: tool.outputs, inputSchema: tool.inputSchema, outputSchemas: tool.outputSchemas,
    preconditions: tool.preconditions, postconditions: tool.postconditions,
  }));
  const checked = checkedPairs(ontology, policies, lookup);
  const assess = assessFlows(ontology, checked);
  const findings = [
    ...discoverOverlaps(ontology, bySource),
    ...integrationGaps(needs, lookup, bySource, assess),
    ...checked.values(),
    ...inferredFlows(ontology, lookup, assess),
  ];
  const edges = [
    ...services.map(({ id, cluster }) => ({ from: cluster, to: id, relation: "groups", evidence: "inferred" })),
    ...capabilities.map(({ id, service }) => ({ from: service, to: id, relation: "declares", evidence: "documented" })),
    ...findings.flatMap(({ id, kind, services, capabilities, evidence }) => {
      if (kind === "gap") return capabilities.map((from, i) =>
        ({ from, to: id, relation: i === 0 ? "requires integration" : "candidate producer", evidence, finding: id }));
      const [from, to] = kind === "overlap" ? services : capabilities;
      return [{ from, to, relation: kind, evidence, finding: id }];
    }),
  ];
  return { schemaVersion: "wmcp-ecosystem-map/v1", clusters, services, capabilities, findings, edges };
}

const STOP = new Set("a an and can could find for from how i in is it list me of on or show that the to tool tools what where which with would".split(" "));
const words = (text) => (text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []).map((token) =>
  token.length > 3 && token.endsWith("s") ? token.slice(0, -1) : token).filter((token) => !STOP.has(token));
const KIND = { capabilities: "capability", clusters: "cluster", overlaps: "overlap", gaps: "gap", compositions: "composition" };
const compact = ({ id, kind, label, evidence }) => ({ id, kind, label, evidence });

export function indexEcosystem(ontology, options) {
  const map = buildEcosystem(ontology, options);
  const nodes = new Map([...map.clusters, ...map.services, ...map.capabilities, ...map.findings].map((node) => [node.id, node]));
  const discover = createDiscovery(ontology);
  function inspect(id) {
    const node = nodes.get(id);
    if (!node) return null;
    const relationships = map.edges.filter((edge) => edge.from === id || edge.to === id || edge.finding === id);
    const relatedIds = new Set([
      ...relationships.flatMap(({ from, to, finding }) => [from, to, finding]),
      ...(node.services ?? []), ...(node.capabilities ?? []),
    ]);
    relatedIds.delete(id);
    return { schemaVersion: "wmcp-ecosystem-node/v1", node, relationships, related: [...relatedIds].filter((id) => nodes.has(id))
      .map((id) => compact(nodes.get(id))) };
  }

  function query({ goal, kind = "all", limit = 12 }) {
    if (typeof goal !== "string" || !goal.trim() || goal.length > 600 ||
        !KINDS.includes(kind) || !Number.isInteger(limit) || limit < 1 || limit > 30) throw Error("Invalid map query.");
    const hits = discover(goal, { limit: 50 }).results;
    const scores = new Map(hits.map((hit) => [capId(hit.capability.id), hit]));
    const terms = new Set(words(goal));
    const lexical = (node) => {
      const hints = node.kind === "gap" ? [node.type, node.reason, "missing integration connector"] :
        node.kind === "overlap" ? ["overlap redundancy equivalent", ...node.shared.map(({ label }) => label)] :
          node.kind === "composition" ? ["composition workflow connect", node.binding?.type] : (node.outcomes ?? []);
      const own = new Set(words([node.label, ...hints].filter(Boolean).join(" ")));
      return [...terms].filter((term) => own.has(term)).length;
    };
    const candidates = [...nodes.values()].filter((node) => kind === "all" || node.kind === KIND[kind]);
    const results = [];
    for (const node of candidates) {
      const direct = scores.get(node.id);
      const anchored = (node.capabilities ?? []).map((id) => scores.get(id)?.score ?? 0);
      const groupScore = node.kind === "cluster" ? node.services.reduce((best, id) =>
        Math.max(best, ...nodes.get(id).capabilities.map((capability) => scores.get(capability)?.score ?? 0)), 0) : 0;
      const named = lexical(node);
      const score = direct ? 1 + direct.score + named * 0.2 :
        0.28 * Math.max(0, groupScore, ...anchored) + named * 0.32;
      if (score <= 0) continue;
      results.push({
        ...compact(node), score: Math.round(score * 1000) / 1000,
        ...(direct ? { matching: direct.evidence, applicability: direct.applicability } : {}),
        ...(node.description ? { description: node.description } : {}),
        ...(node.service ? { service: node.service } : {}),
      });
    }
    results.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
    return { schemaVersion: "wmcp-ecosystem-query/v1", goal, kind, results: results.slice(0, limit) };
  }
  return { map, query, inspect };
}

export function openEcosystem(catalogPath, configPath) {
  const ontology = loadOntology(catalogPath);
  if (!configPath) return indexEcosystem(ontology);
  const config = readLocalJson(configPath, "Ecosystem config");
  if (config?.schemaVersion !== "wmcp-ecosystem-config/v1") throw Error("Expected a wmcp-ecosystem-config/v1 file.");
  const policies = asList(config.policies, "Policies").map((path) => {
    if (typeof path !== "string" || !path.trim()) throw Error("Expected a local policy file path.");
    return readLocalJson(resolve(dirname(configPath), path), "Workflow policy");
  });
  return indexEcosystem(ontology, { policies, needs: asList(config.needs, "Integration needs") });
}
