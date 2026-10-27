import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { actionArgs, actionRun } from "./run.mjs";

const ENDPOINT = "https://mcp.example.org/mcp";
describe("GitHub Action: MCP Doctor", () => {
  it("defaults to strict, read-only doctor against the explicit endpoint", () => {
    assert.deepEqual(actionArgs({ WMCP_DOCTOR_ENDPOINT: ENDPOINT }), ["doctor", ENDPOINT, "--strict"]);
  });

  it("accepts a reviewed baseline and permits deliberate non-strict audits", () => {
    assert.deepEqual(actionArgs({
      WMCP_DOCTOR_ENDPOINT: ENDPOINT,
      WMCP_DOCTOR_STRICT: "FALSE",
      WMCP_DOCTOR_BASELINE: "./mcp-baseline.json",
    }), ["doctor", ENDPOINT, "--baseline", "./mcp-baseline.json"]);
  });

  it("refuses invalid input and never emits a bearer token as an argument", () => {
    assert.throws(() => actionArgs({}), /endpoint/);
    assert.throws(() => actionArgs({ WMCP_DOCTOR_ENDPOINT: ENDPOINT, WMCP_DOCTOR_STRICT: "sometimes" }), /true or false/);
    const token = "private_wmcp_token_NEVER_IN_ARGV";
    const args = actionArgs({ WMCP_DOCTOR_ENDPOINT: ENDPOINT, WMCP_API_KEY: token });
    assert.ok(!JSON.stringify(args).includes(token));
    assert.ok(!JSON.stringify(args).includes("tools/call"));
  });

  it("forwards the private credential only through the CLI interface", async () => {
    const token = "private_wmcp_token_NEVER_IN_ARGV";
    const calls = [];
    const rc = await actionRun({
      WMCP_DOCTOR_ENDPOINT: ENDPOINT, WMCP_DOCTOR_STRICT: "false", WMCP_API_KEY: token,
    }, async (args, opts) => {
      calls.push({ args, opts });
      return 0;
    });
    assert.equal(rc, 0);
    assert.equal(calls[0].opts.apiKey, token);
    assert.deepEqual(calls[0].args, ["doctor", ENDPOINT]);
  });

  it("preserves CI failure exit codes from Doctor", async () => {
    const env = { WMCP_DOCTOR_ENDPOINT: ENDPOINT, WMCP_DOCTOR_STRICT: "true" };
    assert.equal(await actionRun(env, async () => 2), 2);
    assert.equal(await actionRun(env, async () => 1), 1);
  });

  it("is a composite action with explicit Node 22 and environment-bound inputs", () => {
    const manifest = readFileSync(new URL("./action.yml", import.meta.url), "utf8");
    for (const required of ['using: composite', 'node-version: "22"', 'WMCP_DOCTOR_ENDPOINT:', 'WMCP_DOCTOR_STRICT:', 'WMCP_DOCTOR_BASELINE:', 'WMCP_API_KEY:', 'github.action_path', 'uses: actions/setup-node@v4']) {
      assert.ok(manifest.includes(required), required);
    }
    assert.ok(!manifest.includes("curl | bash"));
    assert.ok(!manifest.includes("tools/call"));
  });
});
