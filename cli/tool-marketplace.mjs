import { randomUUID } from "node:crypto";
import { digest } from "./doctor.mjs";
import { record } from "./compile-schema.mjs";
import { compositionSchema, preserves } from "./composition-schema.mjs";
import { validateValue } from "./json-schema-check.mjs";
import { auditContract } from "./tool-contract.mjs";

const OFFER_VERSION = "wmcp-tool-offer/v1";
const DAY_MS = 24 * 60 * 60 * 1000;
const units = (value) => Number.isSafeInteger(value) && value >= 0 && value <= 1_000_000_000;
const basisPoints = (value) => units(value) && value <= 10_000;
const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const searchText = (text) => text.normalize("NFKC").toLowerCase().match(/[\p{L}\p{N}]+/gu)?.join(" ") ?? "";
const valid = (schema, value) => validateValue(schema, value).status === "valid";

export function maintenanceEstimate(maintenance, developerCredits) {
  const { monthlyFixedCredits, costPerAttemptCredits, estimatedSuccessBps, forecastMonthlyAttempts } = maintenance;
  const contributionBps = developerCredits * estimatedSuccessBps - costPerAttemptCredits * 10_000;
  return {
    ...maintenance,
    expectedContributionPerAttemptCredits: contributionBps / 10_000,
    breakEvenMonthlyAttempts: contributionBps > 0 ? Math.ceil(monthlyFixedCredits * 10_000 / contributionBps) : null,
    forecastMonthlyNetCredits: forecastMonthlyAttempts * (contributionBps / 10_000) - monthlyFixedCredits,
  };
}

function inspectOffer(offer, outcome) {
  const { server, contract, priceCredits, maintainer } = offer;
  const maintenance = offer.maintenance;
  if (offer.schemaVersion !== OFFER_VERSION ||
      !record(server) || typeof server.name !== "string" ||
      server.name.length > 200 || !/^[A-Za-z0-9.-]+\/[A-Za-z0-9._-]+$/.test(server.name) ||
      typeof server.version !== "string" || !/^[A-Za-z0-9][A-Za-z0-9_.+-]{0,254}$/.test(server.version) ||
      typeof server.description !== "string" || !server.description.trim() ||
      typeof maintainer?.supportUrl !== "string" || !/^https:\/\/[^\s]+$/.test(maintainer.supportUrl) ||
      !Number.isSafeInteger(maintainer.supportUntilMs) || !units(priceCredits) || !outcome ||
      !record(maintenance) || !units(maintenance.monthlyFixedCredits) ||
      !units(maintenance.costPerAttemptCredits) || !basisPoints(maintenance.estimatedSuccessBps) ||
      !units(maintenance.forecastMonthlyAttempts) || !auditContract(contract).valid) {
    throw Error("Invalid offer. Supply a versioned server, tool contract, outcome, price and maintenance terms.");
  }
  if (!Array.isArray(contract.sideEffects) || contract.sideEffects.length || contract.authorization.confirmation !== "never" ||
      !contract.authorization.anyOf?.some((requirements) => !requirements.length)) {
    throw Error("Only public tools with no declared external effects are supported in the local marketplace.");
  }
  if (!preserves(compositionSchema(outcome.inputSchema), compositionSchema(contract.inputSchema)) ||
      !preserves(compositionSchema(contract.outputSchema), compositionSchema(outcome.outputSchema))) {
    throw Error("Tool contract is incompatible with the advertised outcome.");
  }
  return server.name + "@" + server.version + "#" + contract.name;
}

export function createToolMarketplace({
  namespaces, outcomes, implementations, buyerCredits, clock = Date.now,
  feeBps = 1000, proofTtlMs = 7 * DAY_MS,
}) {
  if (!basisPoints(feeBps) || !Number.isSafeInteger(proofTtlMs) || proofTtlMs < 1 ||
      Object.values(buyerCredits).some((value) => !units(value))) throw Error("Invalid marketplace configuration.");
  const releases = new Map();
  const quotes = new Map();
  const balances = new Map(Object.entries(buyerCredits));
  const quoteTtlMs = 60_000;

  function active(release) {
    return !release.retired && clock() < release.expiresAtMs;
  }

  function certify(offer, outcome, run) {
    if (!outcome.probes.length || !outcome.probes.every((input) => perform(offer, outcome, run, input).status === "fulfilled")) {
      throw Error("Independent outcome probes failed.");
    }
    const checkedAtMs = clock();
    return { checkedAtMs, expiresAtMs: Math.min(checkedAtMs + proofTtlMs, offer.maintainer.supportUntilMs) };
  }

  function publish(publisher, submitted) {
    const offer = structuredClone(submitted);
    const outcome = Object.hasOwn(outcomes, offer?.outcome) ? outcomes[offer.outcome] : undefined;
    const releaseId = inspectOffer(offer ?? {}, outcome);
    const namespace = offer.server.name.split("/")[0];
    if (!Object.hasOwn(namespaces, namespace) || namespaces[namespace] !== publisher) throw Error("Publisher does not own this namespace.");
    if (releases.has(releaseId)) throw Error("Release already exists. Publish a new version for term or contract changes.");
    const implementation = Object.hasOwn(implementations, releaseId) ? implementations[releaseId] : undefined;
    if (typeof implementation !== "function") throw Error("No operator-bound local implementation for this release.");
    if (offer.maintainer.supportUntilMs <= clock()) throw Error("Release support has expired.");
    const proof = certify(offer, outcome, implementation);
    const developerCredits = offer.priceCredits - Math.floor(offer.priceCredits * feeBps / 10_000);
    const release = { ...proof, offer, publisher, releaseId, developerCredits, feeBps,
      platformCredits: offer.priceCredits - developerCredits, offerDigest: digest(offer), implementation, outcome };
    releases.set(releaseId, release);
    return listing(release);
  }

  function search(goal, { maxCredits = Infinity } = {}) {
    if (typeof goal !== "string" || goal.length > 512 || (maxCredits !== Infinity && !units(maxCredits))) {
      throw Error("Expected an outcome query and optional credit ceiling.");
    }
    const phrase = " " + searchText(goal) + " ";
    return [...releases.values()].filter((release) =>
      active(release) && release.offer.priceCredits <= maxCredits &&
      (goal === release.offer.outcome || [release.outcome.label, ...release.outcome.aliases].some((term) =>
        phrase.includes(" " + searchText(term) + " "))),
    ).map(listing).sort((a, b) => a.priceCredits - b.priceCredits || compare(a.releaseId, b.releaseId));
  }

  function retire(publisher, releaseId) {
    const release = releases.get(releaseId);
    if (!release || release.publisher !== publisher) throw Error("Release does not belong to publisher.");
    release.retired = true;
  }

  function refresh(publisher, releaseId) {
    const release = releases.get(releaseId);
    if (!release || release.publisher !== publisher) throw Error("Release does not belong to publisher.");
    if (release.retired || release.offer.maintainer.supportUntilMs <= clock()) throw Error("Release support has expired or ended.");
    release.expiresAtMs = clock();
    Object.assign(release, certify(release.offer, release.outcome, release.implementation));
    return listing(release);
  }

  function quote(buyer, releaseId, input) {
    const release = releases.get(releaseId);
    if (!balances.has(buyer) || !release || !active(release)) throw Error("Buyer or active release is unavailable.");
    if (!acceptsInput(release.offer, release.outcome, input)) {
      throw Error("Input is incompatible with the advertised outcome.");
    }
    const snapshot = structuredClone(input);
    const id = randomUUID();
    const terms = {
      quoteId: id, releaseId, offerDigest: release.offerDigest, inputDigest: digest(snapshot),
      unit: "test-credits", priceCredits: release.offer.priceCredits, developerCredits: release.developerCredits,
      platformCredits: release.platformCredits, feeBps: release.feeBps,
      expiresAtMs: Math.min(clock() + quoteTtlMs, release.expiresAtMs),
    };
    quotes.set(id, { buyer, release, terms, input: snapshot });
    return structuredClone(terms);
  }

  function purchase(buyer, quoteId, maxCredits) {
    const purchase = quotes.get(quoteId);
    if (!purchase || buyer !== purchase.buyer) throw Error("Quote does not belong to buyer.");
    if (purchase.receipt) return structuredClone(purchase.receipt);
    const { terms, release } = purchase;
    if (clock() >= terms.expiresAtMs || !active(release)) throw Error("Quote expired or release retired.");
    if (!units(maxCredits) || terms.priceCredits > maxCredits || terms.priceCredits > balances.get(buyer)) {
      throw Error("Price exceeds the approved spending ceiling or available credits.");
    }
    const result = perform(release.offer, release.outcome, release.implementation, purchase.input);
    const fulfilled = result.status === "fulfilled";
    const chargedCredits = fulfilled ? terms.priceCredits : 0;
    balances.set(buyer, balances.get(buyer) - chargedCredits);
    purchase.receipt = {
      schemaVersion: "wmcp-marketplace-receipt/v1", quoteId, releaseId: terms.releaseId,
      offerDigest: terms.offerDigest, inputDigest: terms.inputDigest, unit: terms.unit,
      recordedAtMs: clock(),
      quotedCredits: terms.priceCredits, chargedCredits, developerCredits: fulfilled ? terms.developerCredits : 0,
      platformCredits: fulfilled ? terms.platformCredits : 0, feeBps: terms.feeBps, ...result,
    };
    return structuredClone(purchase.receipt);
  }

  function statement(publisher) {
    const receipts = [...quotes.values()].filter((item) => item.release.publisher === publisher && item.receipt)
      .map(({ receipt }) => {
        const { quoteId, releaseId, status, recordedAtMs, chargedCredits, developerCredits, platformCredits } = receipt;
        return { quoteId, releaseId, status, recordedAtMs, chargedCredits, developerCredits, platformCredits };
      });
    return {
      unit: "test-credits", receipts,
      developerCredits: receipts.reduce((total, row) => total + row.developerCredits, 0),
      releases: [...releases.values()].filter((release) => release.publisher === publisher)
        .map(({ releaseId, offer, developerCredits }) => ({
          releaseId, estimate: maintenanceEstimate(offer.maintenance, developerCredits),
        })),
    };
  }

  return { publish, search, refresh, retire, quote, purchase, statement };
}

function listing(release) {
  const { offer, releaseId, offerDigest, checkedAtMs, expiresAtMs, platformCredits, developerCredits, feeBps } = release;
  const { server, contract, outcome, priceCredits, maintainer } = offer;
  return structuredClone({
    releaseId, server, contract, outcome, offerDigest, checkedAtMs, expiresAtMs, maintainer, unit: "test-credits",
    priceCredits, developerCredits, platformCredits, feeBps, evidence: "independent-local-probes",
  });
}

function perform(offer, outcome, run, input) {
  try {
    if (!acceptsInput(offer, outcome, input)) return { status: "failed", failure: "input-incompatible" };
    const output = run(structuredClone(input));
    const compatible = valid(offer.contract.outputSchema, output) && valid(outcome.outputSchema, output);
    if (!compatible || !outcome.accepts(input, output)) return { status: "failed", failure: "outcome-unverified" };
    return { status: "fulfilled", output: structuredClone(output), outputDigest: digest(output) };
  } catch {
    return { status: "failed", failure: "tool-error" };
  }
}

function acceptsInput(offer, outcome, input) {
  return valid(outcome.inputSchema, input) && valid(offer.contract.inputSchema, input) &&
    (!outcome.acceptsInput || outcome.acceptsInput(input));
}
