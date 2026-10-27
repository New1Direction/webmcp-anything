// Explicitly scoped diagnostics for read-only MCP server interoperability.
// This is not a formal certification, a full JSON Schema validator, or a
// security audit. Trust grade is an independent product, not this report.
import { inspectMcpEndpoint, validateEndpoint } from "./mcp-read.mjs";
import { createHash } from "node:crypto";

const NAME = /^[A-Za-z0-9_.-]{1,128}$/;

export function diagnoseMcp(snapshot) {
  const findings = [];
  const add = (severity, code, message, tool = null) =>
    findings.push({ severity, code, message, ...(tool ? { tool } : {}) });
  if (!snapshot || !Array.isArray(snapshot.tools)) {
    add("error", "missing_tools", "No MCP tools/list snapshot available");
    return { status: "fail", findings, toolCount: 0 };
  }
  if (!snapshot.capabilities || typeof snapshot.capabilities.tools !== "object")
    add("warning", "tools_capability", "Server did not declare the tools capability in initialize");
  if (snapshot.truncated)
    add("warning", "incomplete_listing", "Tool listing reached its page or tool limit; results are incomplete");
  if (snapshot.protocolVersion !== snapshot.requestedProtocol)
    add("warning", "protocol_negotiation", "Server chose a different protocol version; confirm your client supports " + snapshot.protocolVersion);
  if (snapshot.tools.length === 0)
    add("warning", "no_tools", "No tools were returned; this may be intentional for a restricted account");
  const seen = new Set();
  for (const tool of snapshot.tools) {
    if (!tool || typeof tool !== "object") {
      add("error", "invalid_tool", "Tool entry is not an object");
      continue;
    }
    const name = typeof tool.name === "string" ? tool.name : "";
    if (!NAME.test(name)) {
      add("warning", "invalid_name", "Tool name should be 1–128 ASCII letters, digits, underscores, dashes or dots", name || "(unnamed)");
    }
    if (name && seen.has(name))
      add("error", "duplicate_name", "Tool name appears more than once in the returned tool list", name);
    if (name) seen.add(name);
    if (typeof tool.description !== "string" || !tool.description.trim())
      add("warning", "missing_description", "No useful tool description; agents may struggle to use it", name);
    if (tool.inputSchema === null || typeof tool.inputSchema !== "object" || Array.isArray(tool.inputSchema))
      add("error", "invalid_input_schema", "inputSchema must be a JSON Schema object", name);
    else {
      const schema = tool.inputSchema;
      if (schema.type !== undefined && schema.type !== "object")
        add("warning", "nonobject_arguments", "Expected tool arguments to be a JSON object", name);
      if (schema.properties !== undefined &&
          (!schema.properties || typeof schema.properties !== "object" || Array.isArray(schema.properties)))
        add("error", "invalid_properties", "inputSchema.properties must be an object", name);
      if (schema.required !== undefined &&
          (!Array.isArray(schema.required) || schema.required.some((key) => typeof key !== "string")))
        add("error", "invalid_required", "inputSchema.required must be an array of strings", name);
    }
    if (tool.outputSchema !== undefined &&
        (!tool.outputSchema || typeof tool.outputSchema !== "object" || Array.isArray(tool.outputSchema)))
      add("error", "invalid_output_schema", "outputSchema must be a JSON Schema object", name);
  }
  const errors = findings.filter((f) => f.severity === "error").length;
  const warnings = findings.filter((f) => f.severity === "warning").length;
  return {
    status: errors ? "fail" : warnings ? "warning" : "pass",
    findings, toolCount: snapshot.tools.length,
    errors, warnings,
  };
}

// Stable contract fingerprints expose names + hashes, not untrusted tool bodies.
// Sorting JSON object keys avoids false drift due to serialization order.
function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    const obj = {};
    for (const key of Object.keys(value).sort()) obj[key] = stable(value[key]);
    return obj;
  }
  return value;
}
function digest(value) {
  return createHash("sha256").update(JSON.stringify(stable(value))).digest("hex");
}
export function fingerprintSurface(tools) {
  const toolFingerprints = tools.filter((tool) => tool && typeof tool.name === "string")
    .map((tool) => ({
      name: tool.name,
      sha256: digest({
        name: tool.name, title: tool.title, description: tool.description,
        inputSchema: tool.inputSchema, outputSchema: tool.outputSchema,
        annotations: tool.annotations, execution: tool.execution,
      }),
    })).sort((a, b) => a.name.localeCompare(b.name));
  return { toolFingerprints, surfaceHash: digest(toolFingerprints) };
}

export function diffSurface(current, previous) {
  if (!previous || previous.schemaVersion !== "wmcp-doctor/v1" ||
      !Array.isArray(previous.toolFingerprints)) {
    throw Error("Baseline must be a wmcp-doctor/v1 JSON report with toolFingerprints");
  }
  if (previous.endpoint !== current.endpoint)
    throw Error("Baseline belongs to a different MCP endpoint");
  if (previous.complete === false || current.complete === false)
    throw Error("Cannot compare incomplete tool listings; increase limits or fix pagination");
  const older = new Map(previous.toolFingerprints.map((t) => [t.name, t.sha256]));
  const newer = new Map(current.toolFingerprints.map((t) => [t.name, t.sha256]));
  const added = [...newer.keys()].filter((name) => !older.has(name)).sort();
  const removed = [...older.keys()].filter((name) => !newer.has(name)).sort();
  const changed = [...newer.keys()].filter((name) =>
    older.has(name) && older.get(name) !== newer.get(name)).sort();
  return { added, removed, changed, changedAny: added.length + removed.length + changed.length > 0 };
}

export async function doctorMcp(endpoint, options = {}) {
  endpoint = validateEndpoint(endpoint);
  const snapshot = await inspectMcpEndpoint(endpoint, options);
  const diagnosis = diagnoseMcp(snapshot);
  const surface = fingerprintSurface(snapshot.tools);
  const report = { schemaVersion: "wmcp-doctor/v1", endpoint,
    complete: !snapshot.truncated, ...surface };
  let drift = null;
  if (options.baseline) {
    drift = diffSurface(report, options.baseline);
    if (drift.changedAny) {
      diagnosis.findings.push({
        severity: "warning", code: "tool_surface_changed",
        message: "Tool definitions changed since the supplied baseline. Review the added/removed/changed names.",
      });
      diagnosis.warnings++;
      if (diagnosis.status === "pass") diagnosis.status = "warning";
    }
  }
  // Tool descriptions are not emitted by default; they are untrusted data
  // and may contain instructions for an agent that reads machine reports.
  return {
    ...report,
    server: snapshot.server,
    protocolVersion: snapshot.protocolVersion,
    requestedProtocol: snapshot.requestedProtocol,
    elapsedMs: snapshot.elapsedMs,
    transport: snapshot.transport,
    sessionUsed: snapshot.sessionUsed,
    toolCount: snapshot.tools.length,
    pages: snapshot.pages,
    complete: !snapshot.truncated,
    status: diagnosis.status,
    errors: diagnosis.errors,
    warnings: diagnosis.warnings,
    findings: diagnosis.findings,
    drift,
    limitations: [
      "Read-only probe: does not execute tools/call or test permissions.",
      "Basic structural checks only; no full JSON Schema validation or security certification.",
      "Tool descriptions and annotations supplied by servers are untrusted.",
    ],
  };
}

export function formatDoctor(report) {
  const lines = [
    "WMCP Doctor  •  " + String(report.status).toUpperCase(),
    "Server: " + report.server,
    "Endpoint: " + report.endpoint,
    "Protocol: " + report.protocolVersion + " (requested " + report.requestedProtocol + ")",
    "Tools: " + report.toolCount + " across " + report.pages + " page(s)" +
      (report.complete ? "" : " [INCOMPLETE]"),
    "Findings: " + report.errors + " error(s), " + report.warnings + " warning(s)",
    "Contract SHA-256: " + report.surfaceHash,
  ];
  for (const finding of report.findings.slice(0, 50)) {
    lines.push("  [" + finding.severity.toUpperCase() + "] " + finding.code +
      (finding.tool ? " (" + finding.tool + ")" : "") + ": " + finding.message);
  }
  if (report.findings.length > 50) lines.push("  … " + (report.findings.length - 50) + " more; use --json");
  if (report.drift) {
    lines.push("Drift: " + report.drift.added.length + " added, " +
      report.drift.removed.length + " removed, " + report.drift.changed.length + " changed");
    for (const key of ["added", "removed", "changed"]) {
      for (const name of report.drift[key].slice(0, 20)) lines.push("  " + key + ": " + name);
    }
  }
  lines.push("Read-only diagnostics, NOT proof of security, permission or executable tools.");
  return lines.join("\n");
}
