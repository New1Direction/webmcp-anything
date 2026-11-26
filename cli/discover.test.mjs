import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { buildOntology, loadOntology, textHash } from "./capability-ontology.mjs";
import { compileCapabilities } from "./compile.mjs";
import { createDiscovery } from "./discover.mjs";
import { execute, parseArgs, summarize } from "./wmcp.mjs";

const examples = new URL("../examples/capability-discovery/", import.meta.url);
const catalogPath = fileURLToPath(new URL("catalog.json", examples));
const load = (path) => JSON.parse(readFileSync(new URL(path, examples), "utf8"));
const ontology = loadOntology(catalogPath);
const queue = load("queue-context.json");
const search = createDiscovery(ontology);
const outcome = (result) => result.results[0]?.capability.id;

describe("WMCP capability discovery", () => {
  it("publishes typed fields, ontology relationships, and applicability evidence from source contracts", () => {
    const task = ontology.capabilities.find(({ id }) => id === "work:complete_queue_item");
    assert.deepEqual(task.inputs, [{ type: "task-id", pointer: "/itemId", required: true }]);
    assert.equal(task.inputSchema.properties.itemId.type, "integer");
    assert.equal(task.outputSchemas[0].schema.properties.completed.type, "boolean");
    assert.ok(task.preconditions.some(({ kind, when }) => kind === "user-authorization" && when === "always"));
    assert.ok(ontology.edges.some(({ kind, from, to }) =>
      kind === "achieves" && from === task.id && to === "finish-work"));
    assert.ok(ontology.edges.some(({ kind, from, to }) =>
      kind === "navigates-to" && from === "state:work:overview" && to === "state:work:queue"));
  });

  it("retrieves paraphrased outcomes and explains a typed prerequisite without treating it as authorization", () => {
    const graph = search("Cross off the queue entry called Replace modem.", { context: queue });
    assert.equal(outcome(graph), "work:complete_queue_item");
    const match = graph.results[0];
    assert.deepEqual(match.evidence, [{ kind: "outcome", concept: "finish-work" }]);
    assert.deepEqual(match.applicability.missingTypes, ["task-id"]);
    assert.equal(match.applicability.userAuthorization, "always");
    assert.deepEqual(match.plan.steps.map(({ id }) => id), ["work:find_by_title", "work:complete_queue_item"]);
    assert.deepEqual(match.plan.bindings, [{ type: "task-id", from: "/itemId", to: "/itemId" }]);
    assert.equal(match.plan.steps[1].userAuthorization, "always");
    assert.equal(graph.mode, "discovery-only");
  });

  it("composes an observed state transition and never invents one from a link label", () => {
    const goal = "Show me what needs attention in the queue.";
    const context = { sourceIds: ["work"], states: { work: "overview" }, availableTypes: [], effects: ["read", "navigate"] };
    const result = search(goal, { context });
    assert.equal(outcome(result), "work:read_queue");
    assert.deepEqual(result.results[0].plan.transition, { from: "overview", to: "queue" });
    assert.deepEqual(result.results[0].plan.steps.map(({ id }) => id), ["work:open_queue", "work:read_queue"]);

    const readOnly = search(goal, { context: { ...context, effects: ["read"] } });
    const read = readOnly.results.find(({ capability }) => capability.id === "work:read_queue");
    assert.equal(read.plan, null);
    assert.equal(read.blocked, true);
  });

  it("explains broad outcomes using a documented semantic relation", () => {
    const { results } = search("Help manage tasks", { context: { sourceIds: ["taskboard"] } });
    assert.ok(results.length >= 2);
    assert.ok(results.every(({ evidence }) => evidence[0]?.kind === "related-outcome" && evidence[0].relation === "is-a"));
  });

  it("keeps public-only, effects, and typed output filters identical across retrieval methods", () => {
    const method = "embedding";
    const goal = "Show private discussion in the work queue.";
    const vectors = Object.fromEntries([...ontology.capabilities.map(({ searchText }) => searchText), goal].map((text) =>
      [textHash(text), [1, 0]]));
    const vectorSearch = createDiscovery(ontology, { embeddings: {
      schemaVersion: "wmcp-embeddings/v1", model: "test-fixture", dimensions: 2, vectors,
    } });
    for (const name of ["lexical", method, "graph"]) {
      const context = { sourceIds: ["work"], effects: ["read"], outputType: "comment-set" };
      assert.deepEqual(vectorSearch(goal, { method: name, context: { ...context, publicOnly: true } }).results, []);
    }
    const privateMatch = vectorSearch(goal, { method, context: { outputType: "comment-set" } });
    assert.equal(outcome(privateMatch), "work:search_comments");
    assert.equal(privateMatch.results[0].applicability.authentication, "required");
  });

  it("uses vector similarity without token matches and rejects stale or missing vectors", () => {
    const goal = "xqzw";
    const vectors = Object.fromEntries(ontology.capabilities.map(({ id, searchText }) =>
      [textHash(searchText), id === "shop:start_refund" ? [0, 1] : [1, 0]]));
    vectors[textHash(goal)] = [0, 5];
    const query = createDiscovery(ontology, { embeddings: {
      schemaVersion: "wmcp-embeddings/v1", model: "test-fixture", dimensions: 2, vectors,
    } });
    assert.deepEqual(query(goal, { method: "lexical" }).results, []);
    assert.equal(outcome(query(goal, { method: "embedding" })), "shop:start_refund");
    assert.throws(() => query(goal + " updated", { method: "embedding" }), /Missing embedding/);
  });

  it("rejects a mismatched data schema and a cyclic concept hierarchy", () => {
    const catalog = load("catalog.json");
    catalog.capabilities["work:find_by_title"].outputs[0].type = "sku";
    assert.throws(() => buildOntology(catalog, load), /binding is not guaranteed/);
    catalog.capabilities["work:find_by_title"].outputs[0].type = "task-id";
    catalog.concepts.find(({ id }) => id === "manage-work").broader = ["finish-work"];
    assert.throws(() => buildOntology(catalog, load), /hierarchy contains a cycle/);
  });

  it("never proposes a typed flow across two server origins within an OpenAPI source", () => {
    const catalog = load("catalog.json");
    catalog.capabilities["shop:catalog_lookup"].inputs = [{ type: "task-title", pointer: "/query/title" }];
    const shop = load("shop.json");
    shop.paths["/cart/items/{sku}"].put.servers = [{ url: "https://checkout.example/api" }];
    const query = createDiscovery(buildOntology(catalog, (file) => file === "shop.json" ? shop : load(file)));
    const { results } = query("Put one in my basket.", { context: { sourceIds: ["shop"], availableTypes: ["task-title"] } });
    const target = results.find(({ capability }) => capability.id === "shop:cart_line_create");
    assert.equal(target.plan, null);
    assert.equal(target.blocked, true);
    delete shop.paths["/cart/items/{sku}"].put.servers;
    const sameOrigin = createDiscovery(buildOntology(catalog, (file) => file === "shop.json" ? shop : load(file)));
    assert.deepEqual(sameOrigin("Put one in my basket.", { context: { sourceIds: ["shop"], availableTypes: ["task-title"] } })
      .results[0].plan.steps.map(({ id }) => id), ["shop:catalog_lookup", "shop:cart_line_create"]);
  });

  it("rejects compiled artifacts that downgrade a referenced session state", () => {
    const source = compileCapabilities(load("work.json"));
    source.states.find(({ id }) => id === "queue").access = "session";
    assert.throws(() => buildOntology(load("catalog.json"), (file) => file === "work.json" ? source : load(file)),
      /conflicts with a session state/);
  });

  it("runs through the CLI without fetching a website or contacting an embedding service", async () => {
    const goal = "Cross off a task";
    const options = parseArgs(["discover", catalogPath, goal, "--method", "graph", "--limit", "2"]);
    const value = await execute(options, { request: () => assert.fail("unexpected remote request"), apiKey: "private-token" });
    assert.equal(value.goal, goal);
    assert.equal(value.results.length, 2);
    assert.doesNotMatch(summarize("discover", value), /private-token/);
    assert.equal((await execute(parseArgs(["ontology", catalogPath]))).schemaVersion, "wmcp-capability-ontology/v1");
  });
});
