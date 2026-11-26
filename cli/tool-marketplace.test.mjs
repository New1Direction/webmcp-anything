import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { compareToolFingerprints } from "./doctor.mjs";
import { maintenanceEstimate } from "./tool-marketplace.mjs";
import { fixtureMarket, fixtureSnapshots, snapshotInput, OUTCOME } from "../examples/tool-marketplace/demo.mjs";

const input = () => snapshotInput(...fixtureSnapshots());

test("publishes independently owned immutable releases and discovers interchangeable tools by outcome", () => {
  const { market, offers, buyer } = fixtureMarket();
  assert.throws(() => market.publish(offers[0].publisher, offers[1].offer), /does not own/);
  for (const { publisher, offer } of offers) market.publish(publisher, offer);
  assert.throws(() => market.publish(offers[0].publisher, offers[0].offer), /already exists/);
  assert.deepEqual(market.search("Please detect MCP tool drift").map(({ priceCredits }) => priceCredits), [10, 20]);
  assert.deepEqual(market.search(OUTCOME, { maxCredits: 15 }).map(({ priceCredits }) => priceCredits), [10]);
  assert.deepEqual(market.search(OUTCOME, { maxCredits: 9 }), []);
  assert.deepEqual(market.search("unrelated outcome"), []);
  const first = market.search(OUTCOME);
  first[0].contract.name = "mutated";
  assert.equal(market.search(OUTCOME)[0].contract.name, "compare_surface");
  const outputs = first.map(({ releaseId, priceCredits }) => {
    const quote = market.quote(buyer, releaseId, input());
    assert.equal(quote.priceCredits, priceCredits);
    return market.purchase(buyer, quote.quoteId, priceCredits).output;
  });
  assert.deepEqual(outputs[0], outputs[1]);
  assert.deepEqual(outputs[0], { added: ["get_incident"], removed: ["preview_report"], changed: ["get_status"], changedAny: true });
});

test("rejects unsupported auth, incompatible contracts and failed publication probes", () => {
  const { market, offers } = fixtureMarket({ runDriftTool: () =>
    ({ added: [], removed: [], changed: [], changedAny: false }) });
  const { publisher, offer } = offers[0];
  const scoped = structuredClone(offer);
  scoped.contract.authorization.confirmation = "always";
  assert.throws(() => market.publish(publisher, scoped), /Only public tools/);
  const effectful = structuredClone(offer);
  effectful.contract.sideEffects = [{ kind: "write", boundary: "workspace:fixture" }];
  assert.throws(() => market.publish(publisher, effectful), /declared external effects/);
  const incompatible = structuredClone(offer);
  incompatible.contract.outputSchema = { type: "object", properties: {}, required: [] };
  assert.throws(() => market.publish(publisher, incompatible), /incompatible/);
  assert.throws(() => market.publish(publisher, offer), /outcome probes failed/);
  assert.deepEqual(market.search(OUTCOME), []);
});

test("binds quotes to buyers, immutable input, release and approved budgets with a single charge", () => {
  const { market, offers, buyer } = fixtureMarket();
  const { publisher, offer } = offers[0];
  const listing = market.publish(publisher, offer);
  const request = input();
  const terms = market.quote(buyer, listing.releaseId, request);
  request.after.length = 0;
  assert.throws(() => market.purchase("other-buyer", terms.quoteId, 30), /does not belong/);
  assert.throws(() => market.purchase(buyer, terms.quoteId, 9), /spending ceiling/);
  const receipt = market.purchase(buyer, terms.quoteId, 10);
  assert.equal(receipt.chargedCredits, 10);
  assert.equal(receipt.developerCredits, 9);
  assert.equal(receipt.platformCredits, 1);
  assert.equal(receipt.inputDigest, terms.inputDigest);
  assert.equal(receipt.offerDigest, listing.offerDigest);
  assert.deepEqual(receipt.output.added, ["get_incident"]);
  assert.deepEqual(market.purchase(buyer, terms.quoteId, 10), receipt);
  assert.equal(market.statement(publisher).receipts.length, 1);
  assert.equal(market.statement(publisher).developerCredits, 9);
  for (let i = 0; i < 4; i++) {
    const next = market.quote(buyer, listing.releaseId, input());
    market.purchase(buyer, next.quoteId, 10);
  }
  const beyondBalance = market.quote(buyer, listing.releaseId, input());
  assert.throws(() => market.purchase(buyer, beyondBalance.quoteId, 10), /available credits/);
});

test("records zero charges and payouts for a schema-valid but incorrect result", () => {
  let incorrect = false;
  const { market, offers, buyer } = fixtureMarket({ runDriftTool: ({ before, after }) =>
    incorrect ? { added: [], removed: [], changed: [], changedAny: false } : compareToolFingerprints(after, before) });
  const { publisher, offer } = offers[0];
  const { releaseId } = market.publish(publisher, offer);
  const { quoteId } = market.quote(buyer, releaseId, input());
  incorrect = true;
  const receipt = market.purchase(buyer, quoteId, 10);
  assert.equal(receipt.status, "failed");
  assert.equal(receipt.failure, "outcome-unverified");
  assert.deepEqual([receipt.chargedCredits, receipt.developerCredits, receipt.platformCredits], [0, 0, 0]);
  assert.deepEqual(market.purchase(buyer, quoteId, 10), receipt);
  assert.equal(market.statement(publisher).developerCredits, 0);
  assert.throws(() => market.refresh(publisher, releaseId), /outcome probes failed/);
  assert.deepEqual(market.search(OUTCOME), []);
});

test("expires quotes and stale evidence and preserves completed receipts after retirement", () => {
  const day = 86_400_000;
  let now = 10 * day;
  const { market, offers, buyer } = fixtureMarket({ clock: () => now });
  const { publisher, offer } = offers[0];
  const { releaseId } = market.publish(publisher, offer);
  const expired = market.quote(buyer, releaseId, input());
  now += 60_000;
  assert.throws(() => market.purchase(buyer, expired.quoteId, 10), /Quote expired/);
  now += 7 * day;
  assert.deepEqual(market.search(OUTCOME), []);
  assert.throws(() => market.refresh("not-owner", releaseId), /does not belong/);
  market.refresh(publisher, releaseId);
  assert.equal(market.search(OUTCOME).length, 1);
  const bought = market.quote(buyer, releaseId, input());
  const receipt = market.purchase(buyer, bought.quoteId, 10);
  const unspent = market.quote(buyer, releaseId, input());
  market.retire(publisher, releaseId);
  assert.deepEqual(market.search(OUTCOME), []);
  assert.throws(() => market.purchase(buyer, unspent.quoteId, 10), /retired/);
  assert.deepEqual(market.purchase(buyer, bought.quoteId, 10), receipt);
  assert.throws(() => market.refresh(publisher, releaseId), /expired or ended/);
});

test("rejects duplicate names and mismatched or incomplete snapshots before charging", () => {
  const [before, after] = fixtureSnapshots();
  assert.throws(() => snapshotInput(before, { ...after, surfaceHash: "tampered" }), /matching surface hashes/);
  assert.throws(() => snapshotInput(before, { ...after, complete: false }), /complete Doctor/);
  assert.throws(() => snapshotInput(before, { ...after, endpoint: "https://different.example/mcp" }), /different MCP endpoints/);
  const { market, offers, buyer } = fixtureMarket();
  const { publisher, offer } = offers[0];
  const { releaseId } = market.publish(publisher, offer);
  const request = input();
  request.after.push(request.after[0]);
  assert.throws(() => market.quote(buyer, releaseId, request), /incompatible/);
  assert.equal(market.statement(publisher).receipts.length, 0);
});

test("models maintenance burden from payout, attempt costs and success rate", () => {
  const maintenance = { monthlyFixedCredits: 450, costPerAttemptCredits: 2, estimatedSuccessBps: 9800, forecastMonthlyAttempts: 100 };
  const model = maintenanceEstimate(maintenance, 9);
  assert.equal(model.expectedContributionPerAttemptCredits, 6.82);
  assert.equal(model.breakEvenMonthlyAttempts, 66);
  assert.equal(model.forecastMonthlyNetCredits, 232);
  assert.equal(maintenanceEstimate({ ...maintenance, estimatedSuccessBps: 1000 }, 9).breakEvenMonthlyAttempts, null);
});

test("runs the complete local CLI and reports abstention under the minimum price", () => {
  const demo = fileURLToPath(new URL("../examples/tool-marketplace/demo.mjs", import.meta.url));
  const run = (...args) => spawnSync(process.execPath, [demo, ...args], { encoding: "utf8" });
  const catalog = run("--list", "--goal", "compare tool releases");
  assert.equal(catalog.status, 0, catalog.stderr);
  const offers = JSON.parse(catalog.stdout).candidates;
  assert.equal(offers.length, 2);
  assert.equal(offers[0].contract.outputSchema.type, "object");
  const good = run("--max-credits", "20", "--release", "com.dev-two/releases@1.0.0#review_release");
  assert.equal(good.status, 0, good.stderr);
  const paid = JSON.parse(good.stdout);
  assert.equal(paid.receipt.status, "fulfilled");
  assert.equal(paid.developerStatement.developerCredits, 18);
  const denied = run("--max-credits", "9");
  assert.equal(denied.status, 2, denied.stderr);
  assert.equal(JSON.parse(denied.stdout).status, "no-feasible-offer");
});
