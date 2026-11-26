import { test } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { fileURLToPath } from "node:url";
import { loadOntology } from "./capability-ontology.mjs";
import { readLocalJson } from "./compile.mjs";
import { indexEcosystem, openEcosystem } from "./ecosystem.mjs";
import { inspectMcpEndpoint } from "./mcp-read.mjs";
import { ecosystemServer } from "../examples/ecosystem-map/server.mjs";

const local = (path) => fileURLToPath(new URL(path, import.meta.url));
const catalog = local("../examples/capability-discovery/catalog.json");
const config = local("../examples/ecosystem-map/config.json");
const policy = readLocalJson(local("../examples/workflows/queue-policy.json"));
const ecosystem = openEcosystem(catalog, config);

test("uses documented provenance for tools and derives task clusters from the outcome hierarchy", () => {
  const { map } = ecosystem;
  assert.equal(map.capabilities.length, 26);
  assert.equal(map.clusters.length, 4);
  assert.deepEqual(map.clusters.find(({ label }) => label === "Manage tasks").services, ["service:taskboard", "service:work"]);
  const { node, relationships } = ecosystem.inspect("capability:taskboard:complete_task");
  assert.equal(node.evidence, "documented");
  assert.equal(node.provenance.interface.kind, "webmcp");
  assert.match(node.provenance.pointer, /actions/);
  assert.ok(node.preconditions.some(({ kind, when }) => kind === "user-authorization" && when === "always"));
  assert.ok(relationships.some(({ relation, from }) => relation === "declares" && from === "service:taskboard"));
});

test("flags shared outcomes as inferred and identifies differing contracts", () => {
  const overlaps = ecosystem.map.findings.filter(({ kind }) => kind === "overlap");
  assert.equal(overlaps.length, 1);
  assert.equal(overlaps[0].evidence, "inferred");
  assert.deepEqual(overlaps[0].shared.map(({ outcome, effect }) => [outcome, effect]), [
    ["view-work", "read"], ["finish-work", "write"],
  ]);
  assert.ok(overlaps[0].shared.every(({ samePreconditions }) => !samePreconditions));
});

test("uses explicit integration needs and distinguishes absent producers from schema and identity problems", () => {
  const { node: alert } = ecosystem.inspect("gap:lookup-alert-id");
  assert.equal(alert.reason, "no-producer");
  assert.equal(alert.type, "alert-id");
  const { node: bridge, relationships } = ecosystem.inspect("gap:queue-task-bridge");
  assert.equal(bridge.reason, "schema-gap");
  assert.equal(bridge.boundaryUnverified, true);
  assert.ok(bridge.candidates.some(({ producer, sharedBoundary, schema }) =>
    producer === "work:find_by_title" && sharedBoundary === false && schema === "different"));
  assert.ok(relationships.some(({ relation, to }) => relation === "requires integration" && to === bridge.id));
  assert.equal(openEcosystem(catalog).map.findings.filter(({ kind }) => kind === "gap").length, 0);
});

test("policy checking distinguishes complete workflow drafts from individual typed handoffs", () => {
  const { map } = ecosystem;
  const checked = map.findings.filter(({ evidence }) => evidence === "policy-checked");
  assert.equal(checked.length, 3);
  assert.ok(checked.every(({ policies }) => policies[0].workflow.steps.length === 2));
  const candidate = map.findings.find(({ label }) => label === "catalog_lookup → item_availability");
  assert.equal(candidate.evidence, "inferred");
  assert.equal(candidate.binding.type, "sku");
  assert.equal(candidate.binding.sharedBoundary, true);
  assert.ok(!map.findings.some(({ binding }) => binding?.producer === "work:complete_queue_item"));

  const ontology = loadOntology(catalog);
  const options = { needs: [{ id: "task-id", label: "Resolve queue item ID", consumer: "work:complete_queue_item",
    input: "/itemId", producerSource: "work" }] };
  assert.ok(indexEcosystem(ontology, options).inspect("gap:task-id"));
  assert.equal(indexEcosystem(ontology, { ...options, policies: [policy] }).inspect("gap:task-id"), null);
});

test("compatible types across origins remain an inferred connector requirement", () => {
  const ontology = loadOntology(catalog);
  const producer = ontology.capabilities.find(({ id }) => id === "work:find_by_title");
  Object.assign(producer.outputSchemas[0].schema.properties.itemId, { minimum: 1, maximum: Number.MAX_SAFE_INTEGER });
  const scoped = indexEcosystem(ontology, {
    needs: [{ id: "bridge", label: "Connect queue and taskboard", consumer: "taskboard:complete_task",
      input: "/id", producerSource: "work" }],
    policies: [policy],
  });
  assert.equal(scoped.inspect("gap:bridge").node.reason, "boundary-mapping");
  const candidate = scoped.map.findings.find(({ capabilities, binding }) =>
    binding && capabilities.join() === "capability:work:find_by_title,capability:taskboard:complete_task");
  assert.equal(candidate.evidence, "inferred");
  assert.equal(candidate.binding.sharedBoundary, false);
});

test("semantic search returns evidence levels and navigable references without requiring exact tool names", () => {
  const result = ecosystem.query({ goal: "cross off a task", kind: "capabilities", limit: 2 });
  assert.deepEqual(result.results.map(({ id }) => id), ["capability:taskboard:complete_task", "capability:work:complete_queue_item"]);
  assert.ok(result.results.every(({ evidence, matching }) => evidence === "documented" && matching.length));
  const { results } = ecosystem.query({ goal: "lookup alert id", kind: "gaps", limit: 1 });
  assert.equal(results[0].id, "gap:lookup-alert-id");
  assert.equal(results[0].evidence, "inferred");
  assert.equal(ecosystem.query({ goal: "qzx nonmeaningful" }).results.length, 0);
  assert.throws(() => ecosystem.query({ goal: "", kind: "gaps" }));
});

test("serves the map and semantic navigation on loopback with two read-only MCP tools", async () => {
  const server = ecosystemServer(ecosystem);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    const origin = "http://127.0.0.1:" + server.address().port;
    const endpoint = origin + "/mcp";
    const snapshot = await inspectMcpEndpoint(endpoint);
    assert.deepEqual(snapshot.tools.map(({ name }) => name), ["search_ecosystem", "inspect_map_node"]);
    assert.ok(snapshot.tools.every(({ annotations }) => annotations.readOnlyHint));
    const fetchJson = async (path, payload) => {
      const response = await fetch(origin + path, payload ? {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload),
      } : {});
      assert.equal(response.status, 200);
      return response.json();
    };
    const rpc = (id, name, args) => fetchJson("/mcp", { jsonrpc: "2.0", id, method: "tools/call",
      params: { name, arguments: args } });
    const input = { goal: "cross off a task", kind: "capabilities", limit: 1 };
    const ui = await fetchJson("/api/query", input);
    const machine = await rpc(10, "search_ecosystem", input);
    assert.deepEqual(machine.result.structuredContent, ui);
    const inspect = await rpc(11, "inspect_map_node", { id: ui.results[0].id });
    assert.equal(inspect.result.structuredContent.node.id, ui.results[0].id);
    assert.ok(inspect.result.structuredContent.related.length);
    assert.equal((await rpc(12, "complete_task", { id: 1 })).error.code, -32602);
    assert.equal((await fetch(origin + "/api/map", { headers: { origin: "https://other.example" } })).status, 403);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
});
