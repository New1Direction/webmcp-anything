import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadOntology } from "../../cli/capability-ontology.mjs";
import { readLocalJson } from "../../cli/compile.mjs";
import { composeWorkflow } from "../../cli/compose.mjs";
import { replayWorkflow } from "../../cli/replay.mjs";
import { auditContract, authorizationSummary, checkToolValue, failureOutcome, projectToolContract } from "../../cli/tool-contract.mjs";

const fixturePath = (path) => fileURLToPath(new URL(path, import.meta.url));
const read = (path) => readLocalJson(fixturePath(path));

function statFixture(root, file, canRead) {
  if (!canRead || !["notes.txt", "missing.txt"].includes(file)) return { error: "access-denied" };
  try { return { bytes: statSync(join(root, file)).size }; }
  catch (error) {
    if (error.code === "ENOENT") return { error: "not-found" };
    throw error;
  }
}

function inventoryFixture() {
  const history = [];
  const byKey = new Map();
  function publish({ requestKey, rowCount }, { seconds, datasetGrant = true, session = true, approved = true, loseReceipt = false }) {
    if (!datasetGrant || !session || !approved) return { error: "access-denied" };
    const prior = byKey.get(requestKey);
    if (prior && seconds - prior.seconds < 60) {
      if (rowCount !== prior.receipt.rowCount) return { error: "key-conflict" };
      return { receipt: prior.receipt };
    }
    const receipt = { receiptId: "snapshot-" + (history.length + 1), rowCount };
    history.push(receipt);
    byKey.set(requestKey, { receipt, seconds });
    return loseReceipt ? { error: "receipt-timeout" } : { receipt };
  }
  return { publish, writes: () => history.length };
}

function renderFixture(root, seed, { allowed = true, interrupt = false } = {}) {
  if (!allowed) return { error: "access-denied" };
  const path = "tile-" + (readdirSync(root).filter((file) => file.endsWith(".pbm")).length + 1) + ".pbm";
  const header = "P1\n8 8\n";
  let state = seed;
  const rows = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state < 2147483648 ? "0" : "1";
  }).join(" "));
  const bytes = interrupt ? header : header + rows.join("\n") + "\n";
  writeFileSync(join(root, path), bytes, { flag: "wx" });
  if (interrupt) return { error: "artifact-interrupted", path };
  return { path, mediaType: "image/x-portable-bitmap", sha256: createHash("sha256").update(bytes).digest("hex") };
}

export function runContractExamples() {
  const ontology = loadOntology(fixturePath("../capability-discovery/catalog.json"));
  const web = projectToolContract(ontology.capabilities.find(({ id }) => id === "work:complete_queue_item"));
  const local = read("./stat-file.json");
  const data = read("./publish-snapshot.json");
  const creative = read("./render-dither.json");
  const entries = [["web", web], ["local", local], ["data", data], ["creative", creative]];
  const tools = entries.map(([domain, contract]) => {
    const audit = auditContract(contract);
    assert.equal(audit.valid, true, JSON.stringify(audit.issues));
    return {
      domain, name: contract.name, input: contract.inputSchema?.type ?? "unknown",
      output: contract.outputSchema?.type ?? "unknown", authorization: authorizationSummary(contract.authorization),
      confirmation: contract.authorization.confirmation, idempotency: contract.idempotency.mode, unknown: audit.unknown,
    };
  });
  const cases = [];
  const passed = (domain, scenario) => cases.push({ domain, scenario, status: "passed" });
  const check = (contract, input, output) => {
    assert.equal(checkToolValue(contract, "inputSchema", input).status, "valid");
    assert.equal(checkToolValue(contract, "outputSchema", output).status, "valid");
  };
  const recovery = (contract, code, effects, next) => assert.deepEqual(failureOutcome(contract, code), { effects, recovery: next });
  const root = mkdtempSync(join(tmpdir(), "wmcp-tool-contracts-"));
  try {
    const workflow = read("../workflows/complete-by-title.json");
    const plan = composeWorkflow(ontology, workflow, read("../workflows/queue-policy.json"));
    const evidence = read("../workflows/complete-by-title-fixture.json");
    const webRun = replayWorkflow(plan, evidence);
    assert.equal(webRun.status, "completed");
    assert.equal(web.authorization.confirmation, "always");
    check(web, evidence.observations.complete.approval.input, evidence.observations.complete.result);
    assert.deepEqual(web.sideEffects, [{ kind: "complete-queue-item", boundary: "https://work.example", target: { inputPointer: "/itemId" } }]);
    passed("web", "Replay a typed and explicitly approved browser action");

    delete evidence.observations.complete.approval;
    assert.equal(replayWorkflow(plan, evidence).error.code, "approval_required");
    assert.equal(web.idempotency.mode, "unknown");
    recovery(web, "approval_required", "unknown", "reconcile");
    passed("web", "Preserve missing retry and failure declarations when projecting browser evidence");

    writeFileSync(join(root, "notes.txt"), "fixture\n", { flag: "wx" });
    const firstStat = statFixture(root, "notes.txt", true);
    check(local, "notes.txt", firstStat.bytes);
    assert.deepEqual(firstStat, statFixture(root, "notes.txt", true));
    writeFileSync(join(root, "notes.txt"), "fixture updated independently\n");
    const changedStat = statFixture(root, "notes.txt", true);
    check(local, "notes.txt", changedStat.bytes);
    assert.notEqual(changedStat.bytes, firstStat.bytes);
    assert.deepEqual(readdirSync(root), ["notes.txt"]);
    passed("local", "Repeat a filesystem read without assuming its result will stay the same");

    const missing = statFixture(root, "missing.txt", true);
    assert.equal(missing.error, "not-found");
    recovery(local, missing.error, "not-applied", "stop");
    const localDenied = statFixture(root, "notes.txt", false);
    assert.equal(localDenied.error, "access-denied");
    recovery(local, localDenied.error, "not-applied", "stop");
    passed("local", "Report missing data and denied access without writes");

    const inventory = inventoryFixture();
    const input = { requestKey: "inventory-7", rowCount: 14 };
    for (const denied of [{ datasetGrant: false }, { session: false }, { approved: false }]) {
      const blocked = inventory.publish(input, { seconds: 0, ...denied });
      assert.equal(blocked.error, "access-denied");
      recovery(data, blocked.error, "not-applied", "stop");
    }
    assert.equal(inventory.writes(), 0);
    passed("data", "Require both scoped grants and explicit approval before publication");

    const lost = inventory.publish(input, { seconds: 0, loseReceipt: true });
    assert.equal(lost.error, "receipt-timeout");
    assert.equal(inventory.writes(), 1);
    recovery(data, lost.error, "unknown", "retry");
    const replayed = inventory.publish(input, { seconds: 59 });
    check(data, input, replayed.receipt);
    assert.equal(replayed.receipt.receiptId, "snapshot-1");
    assert.equal(inventory.writes(), 1);
    passed("data", "Recover a receipt with the original key inside its 60-second window");

    const conflicted = inventory.publish({ ...input, rowCount: 15 }, { seconds: 59 });
    assert.equal(conflicted.error, "key-conflict");
    recovery(data, conflicted.error, "not-applied", "stop");
    assert.equal(inventory.writes(), 1);
    const expired = inventory.publish(input, { seconds: 60 });
    assert.equal(expired.receipt.receiptId, "snapshot-2");
    assert.equal(inventory.writes(), 2);
    passed("data", "Reject changed payloads and show why an expired key cannot guarantee deduplication");

    const first = renderFixture(root, 42);
    const second = renderFixture(root, 42);
    check(creative, { seed: 42 }, first);
    check(creative, { seed: 42 }, second);
    assert.equal(first.sha256, second.sha256);
    assert.notEqual(first.path, second.path);
    assert.equal(readFileSync(join(root, first.path), "utf8"), readFileSync(join(root, second.path), "utf8"));
    passed("creative", "Render identical bytes twice while creating distinct artifacts");

    const interrupted = renderFixture(root, 42, { interrupt: true });
    assert.equal(interrupted.error, "artifact-interrupted");
    assert.equal(readFileSync(join(root, interrupted.path), "utf8"), "P1\n8 8\n");
    recovery(creative, interrupted.error, "partial", "reconcile");
    recovery(creative, "receipt-timeout", "unknown", "reconcile");
    passed("creative", "Classify incomplete artifacts and uncertain receipts without retrying");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
  return { schemaVersion: "wmcp-tool-contract-evaluation/v1", tools, cases };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(JSON.stringify(runContractExamples(), null, 2));
}
