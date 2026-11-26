import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { compareToolFingerprints } from "../../../cli/doctor.mjs";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const fixture = (name) => fileURLToPath(new URL(`../fixtures/${name}.json`, import.meta.url));
const baseline = fixture("baseline");
const preview = fixture("preview");
const reviewed = JSON.parse(readFileSync(baseline, "utf8"));

function run(args, input) {
  const result = spawnSync(process.execPath, ["cli/wmcp.mjs", "doctor", "diff", ...args], {
    cwd: root,
    input,
    encoding: "utf8",
    timeout: 5000,
  });
  assert.ifError(result.error);
  return result;
}

test("detects removal in a saved browser report and exits 2 only in strict mode", () => {
  const args = [baseline, preview, "--allow-preview-origin", "--json"];
  const normal = run(args);
  const strict = run([...args, "--strict"]);
  assert.equal(normal.status, 0, normal.stderr);
  assert.equal(strict.status, 2, strict.stderr);
  assert.equal(normal.stdout, strict.stdout);
  assert.deepEqual(JSON.parse(strict.stdout), {
    schemaVersion: "wmcp-doctor-diff/v1",
    added: [],
    removed: ["list_tasks"],
    changed: [],
    changedAny: true,
  });
});

test("matches live Doctor classification and accepts a saved report on stdin", () => {
  const current = {
    ...reviewed,
    toolCount: 3,
    toolFingerprints: [
      { name: "\ufffd", sha256: "2".repeat(64) },
      { name: "\u{1f4cb}", sha256: "3".repeat(64) },
      { name: "list_tasks", sha256: "4".repeat(64) },
    ],
  };
  const checked = run([baseline, "-", "--json"], JSON.stringify(current));
  assert.equal(checked.status, 0, checked.stderr);
  const { schemaVersion, ...comparison } = JSON.parse(checked.stdout);
  assert.equal(schemaVersion, "wmcp-doctor-diff/v1");
  assert.deepEqual(comparison, compareToolFingerprints(current.toolFingerprints, reviewed.toolFingerprints));
  const unchanged = run([baseline, baseline, "--strict"]);
  assert.equal(unchanged.status, 0, unchanged.stderr);
  assert.match(unchanged.stdout, /0 added, 0 removed, 0 changed/);
});

test("rejects comparisons across incompatible browser observations", () => {
  const crossOrigin = run([baseline, preview]);
  assert.equal(crossOrigin.status, 1);
  assert.match(crossOrigin.stderr, /--allow-preview-origin/);
  for (const [patch, error] of [
    [{ observedPage: "https://example.com/login" }, /observed paths/],
    [{ waitMs: 2000 }, /observation window/],
    [{ complete: false }, /complete WMCP Doctor/],
    [{ toolCount: 2 }, /fingerprint for every reported tool/],
    [{ toolCount: 2, toolFingerprints: [...reviewed.toolFingerprints, ...reviewed.toolFingerprints] }, /duplicate/],
    [{ toolFingerprints: [{ name: "list_tasks", sha256: "invalid" }] }, /valid tool fingerprints/],
  ]) {
    const result = run([baseline, "-"], JSON.stringify({ ...reviewed, ...patch }));
    assert.equal(result.status, 1, result.stderr);
    assert.equal(result.stdout, "");
    assert.match(result.stderr, error);
  }
});

test("checks the endpoint and report type before comparing remote MCP snapshots", (t) => {
  const remote = {
    schemaVersion: "wmcp-doctor/v1",
    complete: true,
    endpoint: "https://example.com/mcp",
    toolCount: 1,
    toolFingerprints: reviewed.toolFingerprints,
  };
  const result = run([baseline, "-"], JSON.stringify(remote));
  assert.equal(result.status, 1);
  assert.match(result.stderr, /both be browser WebMCP reports or both be remote MCP reports/);
  const bothStdin = run(["-", "-"], JSON.stringify(remote));
  assert.equal(bothStdin.status, 1);
  assert.match(bothStdin.stderr, /at most one/);

  const directory = mkdtempSync(join(tmpdir(), "wmcp-diff-test-"));
  t.after(() => rmSync(directory, { recursive: true }));
  const remoteBaseline = join(directory, "report.json");
  writeFileSync(remoteBaseline, JSON.stringify(remote));

  const sameEndpoint = run([remoteBaseline, "-", "--strict"], JSON.stringify(remote));
  assert.equal(sameEndpoint.status, 0, sameEndpoint.stderr);
  const differentEndpoint = run([remoteBaseline, "-"], JSON.stringify({ ...remote, endpoint: "https://other.example/mcp" }));
  assert.equal(differentEndpoint.status, 1);
  assert.match(differentEndpoint.stderr, /same MCP endpoint/);
});
