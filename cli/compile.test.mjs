import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { compileCapabilities } from "./compile.mjs";

const ORIGIN = "https://tasks.example";
const taskSchemaRef = { $ref: "#/components/schemas/Task~1Node" };

function apiDocument() {
  const cookie = { name: "session", in: "cookie", schema: { type: "string" } };
  return {
    openapi: "3.1.2",
    info: { title: "Tasks" },
    security: [{ oauth: ["tasks:write"], session: [] }, { token: [] }],
    servers: [{ url: ORIGIN + "/v1" }],
    components: {
      securitySchemes: {
        oauth: { type: "oauth2", flows: {} },
        session: { type: "apiKey", name: "session", in: "cookie" },
        token: { type: "apiKey", name: "X-Task-Token", in: "header" },
      },
      schemas: {
        "Task/Node": {
          type: "object",
          required: ["text"],
          properties: {
            text: { type: "string", minLength: 1, default: "ignore-default", examples: ["ignore-example"] },
            child: taskSchemaRef,
          },
        },
      },
      parameters: { Id: { name: "id", in: "path", required: true, schema: { type: "integer" } } },
    },
    paths: {
      "/tasks/{id}": {
        parameters: [
          { $ref: "#/components/parameters/Id" },
          { name: "id", in: "query", schema: { type: "boolean" } },
        ],
        patch: {
          operationId: "change_task",
          tags: ["tasks"],
          parameters: [
            { name: "id", in: "query", required: true, schema: { type: "integer" } },
            { name: "X-Task-Token", in: "header", schema: { type: "string", default: "ignore-secret" } },
            cookie,
          ],
          requestBody: { required: true, content: {
            "application/json": { schema: taskSchemaRef },
            "text/plain": { schema: { type: "string", maxLength: 120 } },
          } },
          responses: {
            "200": { description: "Task", content: { "application/json": { schema: taskSchemaRef } } },
            "2XX": { description: "Acknowledged" },
            "400": { description: "Invalid" },
            default: { description: "Unexpected" },
          },
        },
        get: {
          operationId: "view_task",
          security: [],
          parameters: [{ name: "x-task-token", in: "header", schema: { type: "string" } }],
          responses: { "204": { description: "Success" } },
        },
      },
    },
  };
}

function siteDocument() {
  return {
    schemaVersion: "wmcp-site/v1",
    site: { title: "Tasks", origin: ORIGIN, entryState: "home" },
    states: [
      { id: "home", title: "Home", path: "/", access: "public",
        landmarks: [{ role: "main" }, { role: "navigation", name: "Primary" }],
        links: [{ label: "Open board", to: "board" }] },
      { id: "board", title: "Board", path: "/board", access: "session", marker: "#board" },
    ],
    actions: [{
      name: "open_board", description: "Open the taskboard", state: "home", access: "session",
      permissions: ["tasks:read"], effect: "navigate",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      preconditions: [{ kind: "visible", selector: "#board-link" }],
      postconditions: [{ kind: "state", state: "board" }, { kind: "dom-visible", selector: "#board" }],
    }],
  };
}

describe("WMCP capability compiler", () => {
  it("retains OpenAPI parameter locations, schema refs, auth alternatives and success evidence", () => {
    const compiled = compileCapabilities(apiDocument());
    assert.equal(compiled.schemaVersion, "wmcp-capabilities/v1");
    assert.equal(compiled.execution, "specification-only");
    assert.equal(compiled.complete, true);
    assert.deepEqual(compiled.diagnostics, []);
    const [read, write] = compiled.tools;
    assert.equal(read.name, "view_task");
    assert.deepEqual(read.preconditions[1].anyOf, [{ allOf: [] }]);
    assert.deepEqual(read.inputSchema.required, ["path"]);
    assert.equal(read.inputSchema.properties.header, undefined);
    assert.equal(write.name, "change_task");
    assert.equal(write.source, "#/paths/~1tasks~1{id}/patch");
    assert.deepEqual(write.tags, ["tasks"]);
    assert.deepEqual(write.interface.servers, [ORIGIN + "/v1"]);
    assert.deepEqual(write.interface.parameters, [{ in: "path", name: "id" }, { in: "query", name: "id" }]);
    assert.deepEqual(write.inputSchema.required, ["path", "query", "body"]);
    assert.equal(write.inputSchema.properties.query.properties.id.type, "integer");
    assert.equal(write.inputSchema.properties.body.oneOf[0].properties.value.$ref, "#/$defs/schema0");
    assert.equal(write.inputSchema.$defs.schema0.properties.child.$ref, "#/$defs/schema0");
    assert.equal(write.inputSchema.properties.body.oneOf[1].properties.value.maxLength, 120);
    assert.deepEqual(write.preconditions[1], {
      kind: "authentication", boundary: "trusted-server-origin",
      anyOf: [
        { allOf: [{ scheme: "oauth", type: "oauth2", scopes: ["tasks:write"] },
          { scheme: "session", type: "apiKey", scopes: [], location: "cookie", parameter: "session" }] },
        { allOf: [{ scheme: "token", type: "apiKey", scopes: [], location: "header", parameter: "X-Task-Token" }] },
      ],
    });
    assert.equal(write.preconditions[2].when, "always");
    assert.deepEqual(write.postconditions[0].alternatives.map(({ status }) => status), ["200", "2XX"]);
    assert.deepEqual(write.postconditions[0].alternatives[1].exceptStatuses, ["200"]);
    assert.equal(write.postconditions[0].alternatives[0].media[0].schema.$defs.schema0.required[0], "text");
    assert.doesNotMatch(JSON.stringify(compiled), /ignore-default|ignore-example|ignore-secret/);
    assert.deepEqual(compileCapabilities(apiDocument()), compiled);
  });

  it("converts OpenAPI 3.0 nullable and exclusive bounds to JSON Schema", () => {
    const result = compileCapabilities({
      openapi: "3.0.4", info: { title: "Tasks" }, paths: {
        "/tasks": { get: {
          parameters: [{ name: "limit", in: "query", schema: {
            type: "integer", nullable: true, minimum: 0, exclusiveMinimum: true, maximum: 100,
          } }],
          responses: { "200": { description: "Success" } },
        } },
      },
    });
    assert.deepEqual(result.tools[0].inputSchema.properties.query.properties.limit, {
      type: ["integer", "null"], exclusiveMinimum: 0, maximum: 100,
    });
  });

  it("omits ambiguous or undocumented operations and reports an incomplete compilation", () => {
    const document = apiDocument();
    document.paths["/a"] = { get: { operationId: "ambiguous", responses: { 200: {} } } };
    document.paths["/b"] = { get: { operationId: "ambiguous", responses: { 200: {} } } };
    document.paths["/unknown"] = { get: { security: [{ unknown: [] }], responses: { 200: {} } } };
    document.paths["/hidden"] = { get: { security: [], parameters: [{ in: "cookie", name: "session", required: true,
      schema: { type: "string" } }], responses: { 200: {} } } };
    document.paths["/external"] = { $ref: "https://external.example/paths.json#/a" };
    document.paths["/schema"] = { post: { requestBody: { content: { "application/json": { schema: {
      $ref: "https://external.example/schema.json",
    } } } }, responses: { 200: {} } } };
    document.paths["/missing"] = { get: { responses: { default: {} } } };
    const result = compileCapabilities(document);
    assert.deepEqual(result.tools.map(({ name }) => name), ["view_task", "change_task"]);
    assert.equal(result.complete, false);
    const reasons = Object.fromEntries(result.diagnostics.map(({ source, reason }) => [source, reason]));
    assert.match(reasons["#/paths/~1hidden/get"], /credential/);
    assert.match(reasons["#/paths/~1unknown/get"], /security scheme/);
    assert.match(reasons["#/paths/~1external"], /Only local/);
    assert.match(reasons["#/paths/~1schema/post"], /Only local/);
    assert.match(reasons["#/paths/~1missing/get"], /2xx/);
    assert.match(reasons["#/paths/~1a/get"], /Ambiguous/);
    assert.match(reasons["#/paths/~1b/get"], /Ambiguous/);
  });

  it("builds a navigation graph and binds actions to an origin, state and session permissions", () => {
    const result = compileCapabilities(siteDocument());
    assert.equal(result.entryState, "home");
    assert.deepEqual(result.states[0].landmarks, [{ role: "main" }, { role: "navigation", name: "Primary" }]);
    assert.deepEqual(result.navigation, [{ from: "home", to: "board", label: "Open board" }]);
    assert.equal(result.states[1].marker, "#board");
    assert.equal(result.states[1].access, "session");
    const [navigate] = result.tools;
    assert.deepEqual(navigate.interface, { kind: "webmcp", origin: ORIGIN, name: "open_board" });
    assert.deepEqual(navigate.preconditions, [
      { kind: "input-schema" },
      { kind: "state", state: "home" },
      { kind: "authentication", boundary: ORIGIN, anyOf: [{ allOf: [{ type: "site-session", permissions: ["tasks:read"] }] }] },
      { kind: "user-authorization", when: "authenticated-use", scope: "this-capability-and-input" },
      { kind: "dom-visible", selector: "#board-link" },
    ]);
    assert.deepEqual(navigate.postconditions, [{ kind: "state", state: "board" }, { kind: "dom-visible", selector: "#board" }]);
  });

  it("rejects a public action targeting a session state, an external link, and missing postconditions", () => {
    const document = siteDocument();
    document.actions[0].access = "public";
    document.actions[0].permissions = [];
    assert.throws(() => compileCapabilities(document), /public access to a session state/);
    document.actions[0].access = "session";
    document.states[0].links[0].to = "https://other.example/board";
    assert.throws(() => compileCapabilities(document), /documented destination/);
    document.states[0].links[0].to = "board";
    document.states[1].path = "//other.example/board";
    assert.throws(() => compileCapabilities(document), /same-origin path/);
    document.states[1].path = "/board";
    document.actions[0].postconditions = [];
    assert.throws(() => compileCapabilities(document), /observable postcondition/);
  });

  it("compiles local files through the normal CLI and reports partial results with exit code 2", () => {
    const cli = new URL("./wmcp.mjs", import.meta.url);
    const demo = new URL("../examples/browser-demo/capabilities.json", import.meta.url);
    const args = [fileURLToPath(cli), "compile"];
    const run = (...arguments_) => spawnSync(process.execPath, [...args, ...arguments_], { encoding: "utf8" });
    const success = run(fileURLToPath(demo), "--json");
    assert.equal(success.status, 0, success.stderr);
    assert.equal(JSON.parse(success.stdout).tools.length, 3);

    const dir = mkdtempSync(join(tmpdir(), "wmcp-compile-"));
    try {
      const file = join(dir, "api.json");
      const spec = apiDocument();
      spec.paths["/bad"] = { get: { responses: {} } };
      writeFileSync(file, JSON.stringify(spec));
      const partial = run(file);
      assert.equal(partial.status, 2, partial.stderr);
      assert.match(JSON.parse(partial.stdout).diagnostics[0].reason, /2xx/);
      writeFileSync(file, "not json");
      assert.equal(run(file).status, 1);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
