import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { loadOntology, buildOntology } from "./capability-ontology.mjs";
import { composeWorkflow, findCompositions } from "./compose.mjs";
import { compositionSchema, preserves } from "./composition-schema.mjs";
import { assembleArguments, replayWorkflow } from "./replay.mjs";

const catalog = new URL("../examples/capability-discovery/catalog.json", import.meta.url);
const examples = new URL("../examples/workflows/", import.meta.url);
const read = (name, base = examples) => JSON.parse(readFileSync(new URL(name, base), "utf8"));
const ontology = loadOntology(fileURLToPath(catalog));
const workflow = () => read("complete-by-title.json");
const policy = () => read("queue-policy.json");
const fixture = () => read("complete-by-title-fixture.json");
const compose = (recipe = workflow(), grant = policy()) => composeWorkflow(ontology, recipe, grant);
const code = (fn, expected) => assert.throws(fn, { code: expected });

describe("WMCP workflow composition", () => {
  it("proves typed data flow and a documented transition through the reusable example", () => {
    const plan = compose();
    assert.equal(plan.initialState, "overview");
    assert.equal(plan.finalState, "queue");
    assert.deepEqual(plan.steps.map(({ fromState, toState }) => [fromState, toState]), [
      ["overview", "queue"], ["queue", "queue"], ["queue", "queue"],
    ]);
    assert.deepEqual(plan.steps[2].bindings, [{
      from: { step: "find", pointer: "/itemId" }, transform: "identity", to: "/itemId", type: "task-id",
    }]);
    assert.equal(plan.steps[2].confirmationRequired, true);
    const run = replayWorkflow(plan, fixture());
    assert.equal(run.status, "completed");
    assert.deepEqual(run.outputs, { completedItem: 42 });
    assert.deepEqual(run.trace.map(({ effectStatus }) => effectStatus), ["confirmed", "none-declared", "confirmed"]);
  });

  it("identifies only policy-covered pairs and emits reusable workflow drafts", () => {
    const grant = policy();
    grant.tools["work:archive_completed"] = { permissions: [], sideEffect: { kind: "none" } };
    const report = findCompositions(ontology, grant);
    assert.equal(report.truncated, false);
    assert.ok(report.excluded.some(({ capability, code }) => capability === "work:archive_completed" && code === "undocumented_effect"));
    assert.ok(report.pairs.every(({ capabilities, workflow }) => {
      const plan = compose(workflow, grant);
      return capabilities.every((id, index) => plan.steps[index].capability === id);
    }));
    const pair = report.pairs.find(({ capabilities }) => capabilities.join() === "work:find_by_title,work:complete_queue_item");
    assert.ok(pair);
    assert.deepEqual(Object.keys(pair.workflow.inputs), ["first-input-1"]);
    assert.deepEqual(pair.workflow.steps[1].bindings[0].from, { step: "first", pointer: "/itemId" });
  });

  it("rejects semantic mismatches, narrowed types and unbound inputs", () => {
    const recipe = workflow();
    recipe.inputs.title.type = "comment-query";
    code(() => compose(recipe), "type_mismatch");
    recipe.inputs.title.type = "task-title";
    recipe.steps[1].bindings = [];
    code(() => compose(recipe), "unbound_input");
    recipe.steps[1].bindings = workflow().steps[1].bindings;
    recipe.steps[2].bindings[0].from.step = "complete";
    code(() => compose(recipe), "invalid_reference");
    recipe.steps[2].bindings[0].from.step = "find";

    const source = read("work.json", catalog);
    source.actions.find(({ name }) => name === "complete_queue_item").inputSchema.properties.itemId.minimum = 1;
    const narrow = buildOntology(read("catalog.json", catalog), (file) => file === "work.json" ? source : read(file, catalog));
    code(() => composeWorkflow(narrow, recipe, policy()), "type_mismatch");
  });

  it("preserves nested values through exact projection and checks structural subsumption", () => {
    const string = (maxLength) => compositionSchema({ type: "string", maxLength });
    assert.equal(preserves(string(5), string(10)), true);
    assert.equal(preserves(string(20), string(10)), false);
    const closed = compositionSchema({ type: "object", properties: { text: { type: "string" } },
      required: ["text"], additionalProperties: false });
    const open = { ...closed, additionalProperties: true };
    assert.equal(preserves(closed, open), true);
    assert.equal(preserves(open, closed), false);
    const original = { label: "exact text", tags: ["one", "two"] };
    const value = assembleArguments([{ from: { step: "first", pointer: "/nested" }, to: "/request/target" }],
      {}, new Map([["first", { nested: original }]]));
    assert.deepEqual(value, { request: { target: original } });
    assert.notEqual(value.request.target, original);
  });

  it("rejects missing grants, unsupported transformations, undocumented effects, and wrong state", () => {
    const grant = policy();
    grant.tools["work:complete_queue_item"].sideEffect.operation = "archive";
    code(() => compose(workflow(), grant), "effect_not_authorized");
    delete grant.tools["work:complete_queue_item"];
    code(() => compose(workflow(), grant), "permission_denied");

    const recipe = workflow();
    recipe.steps[2].bindings[0].transform = "stringify";
    code(() => compose(recipe), "unsupported_transformation");
    recipe.steps[2] = { id: "archive", tool: "work:archive_completed", bindings: [] };
    grant.tools["work:archive_completed"] = { permissions: [], sideEffect: { kind: "none" } };
    code(() => compose(recipe, grant), "undocumented_effect");
    recipe.steps[0] = { id: "find-first", tool: "work:find_by_title", bindings: [] };
    code(() => compose(recipe, grant), "state_mismatch");
  });

  it("rejects an approval for a different bound input before the write", () => {
    const scenario = fixture();
    scenario.observations.complete.approval.input.itemId = 43;
    const run = replayWorkflow(compose(), scenario);
    assert.deepEqual(run.error, { code: "approval_required", step: "complete", effectStatus: "not-attempted" });
    assert.deepEqual(run.trace.map(({ step }) => step), ["open", "find"]);
    assert.equal(run.outputs, undefined);
  });

  it("stops on earlier failure and treats an unverified write outcome as unknown", () => {
    const scenario = fixture();
    scenario.observations.find.result.itemId = "42";
    assert.deepEqual(replayWorkflow(compose(), scenario).error, {
      code: "postcondition_failed", step: "find", effectStatus: "none-declared", condition: "result-schema",
    });
    scenario.observations.find.result.itemId = 42;
    scenario.observations.complete.result.itemId = 43;
    assert.deepEqual(replayWorkflow(compose(), scenario).error, {
      code: "postcondition_failed", step: "complete", effectStatus: "unknown", condition: "result-matches-input",
    });
    delete scenario.observations.complete.status;
    assert.deepEqual(replayWorkflow(compose(), scenario).error, {
      code: "missing_outcome", step: "complete", effectStatus: "unknown",
    });
    scenario.observations.complete.status = "error";
    const recipe = workflow();
    recipe.steps.push({ ...recipe.steps[1], id: "read-after" });
    assert.deepEqual(replayWorkflow(compose(recipe), scenario).error, {
      code: "tool_error", step: "complete", effectStatus: "unknown",
    });
  });

  it("preserves prior confirmed effects when a later primitive cannot proceed", () => {
    const recipe = workflow();
    recipe.steps.push({ ...recipe.steps[1], id: "read-after" });
    const run = replayWorkflow(compose(recipe), fixture());
    assert.deepEqual(run.trace.at(-1), { step: "complete", tool: "work:complete_queue_item", effectStatus: "confirmed" });
    assert.deepEqual(run.error, { code: "missing_observation", step: "read-after", effectStatus: "not-attempted" });
  });

  it("binds session permissions, approval and observations to one subject", () => {
    const recipe = workflow();
    recipe.id = "read-comments";
    recipe.initialState = "queue";
    recipe.inputs = { query: { type: "comment-query", schema: { type: "string" } } };
    recipe.steps = [{ id: "read", tool: "work:search_comments", bindings: [
      { from: { input: "query" }, transform: "identity", to: "/query" },
    ] }];
    recipe.outputs = { comments: { step: "read", pointer: "/comments" } };
    const grant = policy();
    grant.access = "session";
    grant.tools = { "work:search_comments": { permissions: ["comments:read", "comments:admin"], sideEffect: { kind: "none" } } };
    code(() => compose(recipe, grant), "permission_denied");
    grant.tools["work:search_comments"].permissions.pop();
    const plan = compose(recipe, grant);
    const scenario = fixture();
    scenario.subject = "demo-user";
    scenario.input = { query: "modem" };
    const state = { origin: grant.origin, state: "queue", session: { subject: scenario.subject, permissions: [] } };
    scenario.observations = { read: { status: "ok", before: state, after: structuredClone(state), result: { comments: [] } } };
    assert.equal(replayWorkflow(plan, scenario).error.code, "authorization_denied");
    state.session.permissions = ["comments:read"];
    assert.equal(replayWorkflow(plan, scenario).error.code, "approval_required");
    scenario.observations.read.approval = {
      workflow: recipe.id, step: "read", capability: "work:search_comments", origin: grant.origin,
      subject: scenario.subject, input: scenario.input,
    };
    assert.equal(replayWorkflow(plan, scenario).status, "completed");
    scenario.observations.read.after.session.subject = "another-user";
    assert.equal(replayWorkflow(plan, scenario).error.code, "postcondition_failed");
  });

  it("exposes compose and offline replay through the normal CLI", () => {
    const cli = fileURLToPath(new URL("./wmcp.mjs", import.meta.url));
    const file = (name) => fileURLToPath(new URL(name, examples));
    const run = (scenario) => spawnSync(process.execPath, [cli, "replay", fileURLToPath(catalog),
      file("complete-by-title.json"), scenario, "--policy", file("queue-policy.json")], { encoding: "utf8" });
    const result = run(file("complete-by-title-fixture.json"));
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout).outputs, { completedItem: 42 });
    const dir = mkdtempSync(join(tmpdir(), "wmcp-compose-"));
    try {
      const scenario = fixture();
      delete scenario.observations.complete.approval;
      const filename = join(dir, "missing-approval.json");
      writeFileSync(filename, JSON.stringify(scenario));
      const rejection = run(filename);
      assert.equal(rejection.status, 2, rejection.stderr);
      assert.equal(JSON.parse(rejection.stdout).error.code, "approval_required");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
