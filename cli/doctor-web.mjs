import { compareToolFingerprints, digest, fingerprintSurface } from "./doctor.mjs";
import { inspectMcpEndpoint, validateEndpoint } from "./mcp-read.mjs";
import { scanWebMcp } from "./webmcp-browser.mjs";

const VERSION = "wmcp-doctor-web/v1";
const HASH = /^[a-f0-9]{64}$/;
const safe = (value) => String(value).replace(/[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/gu, " ").slice(0, 200);

export function validateWebPage(value) {
  try { return validateEndpoint(value); }
  catch { throw Error("Web page must use HTTPS (HTTP is allowed on localhost) without credentials, query parameters or fragments"); }
}

function pairDifferences(browserTools, endpointTools) {
  const browser = new Map(browserTools.map((tool) => [tool.name, tool]));
  const worker = new Map(endpointTools.map((tool) => [tool.name, tool]));
  const differences = [];
  for (const name of [...new Set([...browser.keys(), ...worker.keys()])].sort()) {
    const native = browser.get(name);
    const remote = worker.get(name);
    if (!native || !remote) {
      differences.push({ name, kind: native ? "browser-only" : "mcp-only" });
      continue;
    }
    const fields = ["inputSchema", "outputSchema"].filter((field) => native[field] != null && remote[field] != null);
    for (const field of fields) {
      const browserHash = digest(native[field]);
      const mcpHash = digest(remote[field]);
      if (browserHash !== mcpHash) differences.push({ name, kind: field, browserHash, mcpHash });
    }
  }
  return differences;
}

function validateBaseline(baseline, page, endpoint, allowPreviewOrigin) {
  if (baseline?.schemaVersion !== VERSION || baseline.complete !== true || !Array.isArray(baseline.toolFingerprints) ||
    !baseline.toolFingerprints.length || baseline.toolFingerprints.length > 2000 ||
    baseline.toolFingerprints.some((tool) => typeof tool?.name !== "string" || !HASH.test(tool.sha256)) ||
    new Set(baseline.toolFingerprints.map((tool) => tool.name)).size !== baseline.toolFingerprints.length) {
    throw Error(`Baseline must be a complete ${VERSION} report with at least one recorded tool`);
  }
  validateWebPage(baseline.observedPage);
  const prior = new URL(validateWebPage(baseline.page));
  const current = new URL(page);
  if (prior.pathname !== current.pathname || (!allowPreviewOrigin && prior.origin !== current.origin)) {
    throw Error("Baseline belongs to a different page. Use --allow-preview-origin for the same path on a preview deployment.");
  }
  if (baseline.pair || endpoint) {
    if (!endpoint || baseline.pair?.endpoint !== endpoint || !Array.isArray(baseline.pair.differences)) {
      throw Error("Baseline and current check must use the same paired MCP endpoint");
    }
  }
}

export async function doctorWeb(page, { chrome, waitMs, baseline, endpoint, allowPreviewOrigin,
  scan = scanWebMcp, request = fetch } = {}) {
  page = validateWebPage(page);
  if (endpoint) endpoint = validateEndpoint(endpoint);
  if (baseline) validateBaseline(baseline, page, endpoint, allowPreviewOrigin);
  const browser = await scan(page, { chrome, waitMs });
  const tools = browser.tools.filter((tool) => typeof tool.name === "string" && tool.name.length > 0);
  const surface = fingerprintSurface(tools);
  const findings = [];
  const complete = tools.length === browser.tools.length && new Set(tools.map((tool) => tool.name)).size === tools.length;
  if (!complete) findings.push("The browser returned missing or duplicate tool names. The report is incomplete.");
  else if (!tools.length) findings.push("Chrome observed zero top-level WebMCP tools during the observation window.");
  const drift = baseline && complete ? compareToolFingerprints(surface.toolFingerprints, baseline.toolFingerprints) : null;
  if (drift?.changedAny) findings.push("Browser tool definitions changed since the baseline.");
  if (baseline && new URL(browser.page).pathname !== new URL(baseline.observedPage).pathname) {
    findings.push("Chrome landed on a different path than the reviewed baseline.");
  }
  let pair = null;
  if (endpoint && complete) {
    const remote = await inspectMcpEndpoint(endpoint, { request });
    if (remote.truncated || remote.tools.some((tool) => !tool || typeof tool.name !== "string" || !tool.name) ||
      new Set(remote.tools.map((tool) => tool.name)).size !== remote.tools.length) {
      throw Error("Paired MCP endpoint returned an incomplete or ambiguous tool list");
    }
    const differences = pairDifferences(tools, remote.tools);
    const previous = new Set((baseline?.pair.differences ?? []).map(digest));
    const current = new Set(differences.map(digest));
    const unexpected = baseline ? differences.filter((item) => !previous.has(digest(item))) : [];
    const resolved = baseline ? baseline.pair.differences.filter((item) => !current.has(digest(item))) : [];
    pair = { endpoint, toolCount: remote.tools.length, differences, unexpected, resolved };
    if (unexpected.length || resolved.length) findings.push("Browser/MCP pairing differs from the reviewed baseline.");
  }
  return { schemaVersion: VERSION, page, observedPage: browser.page, browser: browser.browser,
    waitMs: waitMs ?? 1000, complete, status: findings.length ? "fail" : "pass", toolCount: tools.length,
    ...surface, drift, pair, findings };
}

export function formatDoctorWeb(report) {
  const lines = [`WMCP Doctor (WebMCP)  •  ${report.status.toUpperCase()}`,
    `Page: ${safe(report.observedPage)}`, `Browser: ${safe(report.browser)}`, `Tools: ${report.toolCount}`];
  for (const tool of report.toolFingerprints.slice(0, 40)) lines.push(`  ${safe(tool.name)}`);
  if (report.toolCount > 40) lines.push("  … use --json for the full list");
  if (report.drift) {
    for (const kind of ["added", "removed", "changed"]) {
      for (const name of report.drift[kind].slice(0, 40)) lines.push(`  ${kind}: ${safe(name)}`);
    }
  }
  if (report.pair) {
    lines.push(`Paired MCP: ${safe(report.pair.endpoint)} (${report.pair.toolCount} tools)`);
    const unexpected = new Set(report.pair.unexpected.map(digest));
    for (const item of report.pair.differences.slice(0, 40)) {
      const status = report.drift ? unexpected.has(digest(item)) ? "new" : "expected" : "observed";
      lines.push(`  ${status} ${item.kind}: ${safe(item.name)}`);
    }
    for (const item of report.pair.resolved.slice(0, 40)) lines.push(`  resolved ${safe(item.kind)}: ${safe(item.name)}`);
  }
  for (const finding of report.findings) lines.push(`  ${finding}`);
  return lines.join("\n");
}
