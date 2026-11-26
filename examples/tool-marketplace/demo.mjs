import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { readLocalJson } from "../../cli/compile.mjs";
import { compareToolFingerprints, digest, fingerprintSurface } from "../../cli/doctor.mjs";
import { createToolMarketplace } from "../../cli/tool-marketplace.mjs";

export const OUTCOME = "mcp-tool-drift/v1";
const BUYER = "release-team";
const DAY_MS = 86_400_000;
const endpoint = "https://tool-server.example/mcp";
const name = { type: "string", minLength: 1, maxLength: 128 };
const fingerprints = {
  type: "array", maxItems: 500,
  items: {
    type: "object", properties: { name, sha256: { type: "string", minLength: 64, maxLength: 64 } },
    required: ["name", "sha256"], additionalProperties: false,
  },
};
const list = { type: "array", maxItems: 500, items: name };
const inputSchema = {
  type: "object", properties: { before: fingerprints, after: fingerprints },
  required: ["before", "after"], additionalProperties: false,
};
const outputSchema = {
  type: "object", properties: { added: list, removed: list, changed: list, changedAny: { type: "boolean" } },
  required: ["added", "removed", "changed", "changedAny"], additionalProperties: false,
};

function capture(tools) {
  return { schemaVersion: "wmcp-doctor/v1", endpoint, complete: true, ...fingerprintSurface(tools) };
}

export function fixtureSnapshots() {
  const shared = { name: "list_markets", inputSchema: { type: "object" } };
  const status = { name: "get_status", description: "Show current service status", inputSchema: { type: "object" } };
  return [
    capture([shared, status, { name: "preview_report", inputSchema: { type: "object" } }]),
    capture([shared, { ...status, description: "Show status and incident details" },
      { name: "get_incident", inputSchema: { type: "object" } }]),
  ];
}

export function snapshotInput(before, after) {
  for (const snapshot of [before, after]) {
    if (snapshot?.schemaVersion !== "wmcp-doctor/v1" || snapshot.complete !== true ||
        typeof snapshot.endpoint !== "string" || !snapshot.endpoint || !Array.isArray(snapshot.toolFingerprints) ||
        digest(snapshot.toolFingerprints) !== snapshot.surfaceHash) {
      throw Error("Supply complete Doctor JSON snapshots with matching surface hashes.");
    }
  }
  if (before.endpoint !== after.endpoint) throw Error("Snapshots belong to different MCP endpoints.");
  return { before: before.toolFingerprints, after: after.toolFingerprints };
}

function byName(fingerprints) {
  return new Map(fingerprints.map(({ name, sha256 }) => [name, sha256]));
}

function acceptsInput({ before, after }) {
  return [before, after].every((snapshot) => byName(snapshot).size === snapshot.length &&
    snapshot.every(({ sha256 }) => /^[a-f0-9]{64}$/.test(sha256)));
}

function verify({ before, after }, { added, removed, changed, changedAny }) {
  const older = byName(before);
  const newer = byName(after);
  const addedSet = new Set(added);
  const removedSet = new Set(removed);
  const changedSet = new Set(changed);
  const names = new Set([...older.keys(), ...newer.keys()]);
  if (changedAny !== Boolean(added.length + removed.length + changed.length) ||
      [added, removed, changed].some((group) =>
        group.some((name, index) => !names.has(name) || (index > 0 && group[index - 1] >= name)))) return false;
  for (const name of names) {
    if (addedSet.has(name) !== !older.has(name) || removedSet.has(name) !== !newer.has(name) ||
        changedSet.has(name) !== (older.has(name) && newer.has(name) && older.get(name) !== newer.get(name))) return false;
  }
  return true;
}

function diffByName({ before, after }) {
  const earlier = Object.fromEntries(before.map(({ name, sha256 }) => [name, sha256]));
  const later = Object.fromEntries(after.map(({ name, sha256 }) => [name, sha256]));
  const added = [], removed = [], changed = [];
  const allNames = [...new Set([...Object.keys(earlier), ...Object.keys(later)])].sort();
  for (const name of allNames) {
    if (!Object.hasOwn(earlier, name)) added.push(name);
    else if (!Object.hasOwn(later, name)) removed.push(name);
    else if (earlier[name] !== later[name]) changed.push(name);
  }
  return { added, removed, changed, changedAny: Boolean(added.length + removed.length + changed.length) };
}

export function fixtureMarket({ clock = Date.now, runDriftTool = ({ before, after }) => compareToolFingerprints(after, before) } = {}) {
  const [baseline, current] = fixtureSnapshots();
  const sample = snapshotInput(baseline, current);
  const outcome = {
    label: "compare tool releases",
    aliases: ["detect MCP tool drift", "compare MCP snapshots", "review tool changes"],
    inputSchema, outputSchema, accepts: verify, acceptsInput,
    probes: [sample, { before: sample.after, after: sample.before }, { before: sample.after, after: sample.after },
      { before: [], after: sample.after }, { before: sample.after, after: [] }],
  };
  const offers = [
    ["dev.one", "com.dev-one/drift", "compare_surface", 10, 450, 2],
    ["dev.two", "com.dev-two/releases", "review_release", 20, 800, 4],
  ].map(([publisher, serverName, toolName, priceCredits, monthlyFixedCredits, costPerAttemptCredits]) => ({
    publisher, offer: {
      schemaVersion: "wmcp-tool-offer/v1",
      server: { name: serverName, description: "Produce a diff for two MCP tool surfaces.", version: "1.0.0" },
      contract: {
        schemaVersion: "wmcp-tool-contract/v1",
        name: toolName, inputSchema, outputSchema,
        authorization: { anyOf: [[]], confirmation: "never" },
        sideEffects: [],
        idempotency: { mode: "idempotent" },
        failures: {},
      },
      outcome: OUTCOME, priceCredits,
      maintainer: { supportUrl: "https://" + publisher + ".example/support", supportUntilMs: clock() + 90 * DAY_MS },
      maintenance: { monthlyFixedCredits, costPerAttemptCredits, estimatedSuccessBps: 9800, forecastMonthlyAttempts: 100 },
    },
  }));

  const releaseId = ({ server, contract }) => server.name + "@" + server.version + "#" + contract.name;
  const market = createToolMarketplace({
    namespaces: { "com.dev-one": "dev.one", "com.dev-two": "dev.two" },
    outcomes: { [OUTCOME]: outcome },
    implementations: {
      [releaseId(offers[0].offer)]: runDriftTool,
      [releaseId(offers[1].offer)]: diffByName,
    },
    buyerCredits: { [BUYER]: 50, "other-buyer": 30 },
    clock,
  });
  return { market, offers, buyer: BUYER };
}

function runDemo(argv) {
  const { values, positionals } = parseArgs({
    args: argv, options: { "max-credits": { type: "string" }, "release": { type: "string" }, "goal": { type: "string" },
      list: { type: "boolean" } },
    allowPositionals: true,
  });
  if (values.list && (values.release || positionals.length)) throw Error("Use --list with an outcome query or credit ceiling.");
  if (positionals.length !== 0 && positionals.length !== 2) {
    throw Error("Provide two local Doctor JSON snapshots or omit both for the fixture.");
  }
  const ceiling = values["max-credits"] ?? "25";
  if (!/^\d+$/.test(ceiling)) throw Error("Expected a nonnegative integer credit ceiling.");
  const maxCredits = Number(ceiling);
  const { market, offers, buyer } = fixtureMarket();
  const publishers = new Map(offers.map(({ publisher, offer }) => [market.publish(publisher, offer).releaseId, publisher]));
  const candidates = market.search(values.goal ?? "Help me compare MCP snapshots", { maxCredits });
  if (values.list) return { status: "listed", unit: "test-credits", maxCredits, candidates };
  const selected = values.release ? candidates.find(({ releaseId }) => releaseId === values.release) : candidates[0];
  const options = candidates.map(({ releaseId, priceCredits, developerCredits, platformCredits, checkedAtMs, expiresAtMs }) =>
    ({ releaseId, priceCredits, developerCredits, platformCredits, checkedAtMs, expiresAtMs }));
  if (!selected) return { status: "no-feasible-offer", unit: "test-credits", maxCredits, candidates: options };
  const snapshots = positionals.length ? positionals.map((path) => readLocalJson(path, "Doctor snapshot")) : fixtureSnapshots();
  const input = snapshotInput(...snapshots);
  const terms = market.quote(buyer, selected.releaseId, input);
  const receipt = market.purchase(buyer, terms.quoteId, maxCredits);
  return {
    status: receipt.status,
    maxCredits, candidates: options, quote: terms, receipt, developerStatement: market.statement(publishers.get(selected.releaseId)),
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const report = runDemo(process.argv.slice(2));
    console.log(JSON.stringify(report, null, 2));
    if (report.status !== "fulfilled" && report.status !== "listed") process.exitCode = 2;
  } catch (error) {
    console.error("tool marketplace:", error.message);
    process.exitCode = 1;
  }
}
