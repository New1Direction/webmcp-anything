import { checkSchema, record, validateValue } from "./schemas.mjs";
import { headerFacts, identifier, payloadShape, safePointer, schemaShape } from "./redact.mjs";

export const TRACE_VERSION = "wmcp-mcp-trace/v1";
export const MAX_EVENTS = 1000;
export const MAX_TRACE_BYTES = 2_000_000;
const VERSION = /^20\d\d-\d\d-\d\d$/;
const FAILURES = {
  timeout: ["timeout", "Client deadline elapsed"],
  transport: ["transport-error", "Transport failed"],
  http: ["http-error", "HTTP request failed"],
  malformed: ["protocol-error", "Response could not be decoded"],
};
const ERROR_NAMES = new Map([
  [-32700, "Parse error"], [-32600, "Invalid request"], [-32601, "Method not found"],
  [-32602, "Invalid params"], [-32603, "Internal error"],
]);
const opposite = (side) => side === "send" ? "receive" : "send";
const validId = (id) => typeof id === "string" || Number.isSafeInteger(id);
const keyed = (side, id) => JSON.stringify([side, id]);
const finite = (value) => typeof value === "number" && Number.isFinite(value);
const masks = (report) => ({ status: report.status, issues: report.issues.map(({ path, message }) => ({ path: safePointer(path), message })) });
const unavailable = (message) => ({ status: "unavailable", issues: [{ path: "", message }] });

function preflight(trace) {
  if (trace?.schemaVersion !== TRACE_VERSION || !Array.isArray(trace.events) || !trace.events.length ||
      trace.events.length > MAX_EVENTS) throw Error("Expected a wmcp-mcp-trace/v1 file with 1–1,000 events.");
  for (const event of trace.events) {
    if (!record(event) || !finite(event.atMs) || event.atMs < 0 || event.atMs > 86_400_000 ||
        !["send", "receive", "local"].includes(event.direction)) {
      throw Error("An event has an invalid timestamp or direction.");
    }
  }
}

export function analyzeTrace(trace, label = "Imported trace") {
  preflight(trace);
  const events = [...trace.events].sort((a, b) => a.atMs - b.atMs);
  const zero = events[0].atMs;
  const requests = [];
  const tools = [];
  const notifications = [];
  const diagnostics = [];
  const byId = new Map();
  const progress = new Map();
  const catalog = new Map();
  const pages = new Map();
  const ready = new Map();
  const edges = [];
  let protocol = null;
  let eventCount = 0;
  const edge = (from, to, type) => edges.push({ from, to, type });
  const note = (time, text) => diagnostics.push({ atMs: time, text });
  const connect = (source, request, type) => { if (source) edge(source.key, request.key, type); };

  function end(request, time, status, summary, extra = {}) {
    request.endMs = time;
    request.status = status;
    const receipt = { key: "result:" + request.key, status, summary, atMs: time, durationMs: time - request.startMs, ...extra };
    request.receipt = receipt;
    edge(request.key, receipt.key, "produces receipt");
  }

  function inspectTool(request, message, direction) {
    const params = message.params;
    const tool = catalog.get(keyed(opposite(direction), params?.name));
    request.toolName = identifier(params?.name, "unknown-tool");
    if (!tool) {
      request.checks.input = unavailable("No current declaration was observed before this request.");
      return null;
    }
    request.toolKey = tool.entry.key;
    edge(tool.entry.key, request.key, "declares input");
    const value = record(params) && Object.hasOwn(params, "arguments") ? params.arguments : {};
    request.checks.input = masks(validateValue(tool.raw.inputSchema, value, tool.input));
    return tool;
  }

  function discovered(request, result, direction) {
    if (!Array.isArray(result.tools)) return;
    for (const raw of result.tools.slice(0, 200)) {
      if (!record(raw) || typeof raw.name !== "string" || tools.length >= 500) continue;
      const input = checkSchema(raw.inputSchema, { objectRoot: true });
      const output = Object.hasOwn(raw, "outputSchema") ? checkSchema(raw.outputSchema, { objectRoot: true }) : null;
      const entry = {
        key: "tool:" + (tools.length + 1), name: identifier(raw.name, "Tool " + (tools.length + 1)),
        discoveryKey: request.key, inputSchema: schemaShape(raw.inputSchema), input: masks(input),
        ...(output ? { outputSchema: schemaShape(raw.outputSchema), output: masks(output) } : {}),
      };
      tools.push(entry);
      edge(request.key, entry.key, "discovers tool");
      catalog.set(keyed(direction, raw.name), { raw, entry, input, output });
    }
    if (typeof result.nextCursor === "string") pages.set(keyed(opposite(direction), result.nextCursor), request);
  }

  for (const raw of events) {
    const time = Math.round((raw.atMs - zero) * 10) / 10;
    const { direction, message } = raw;
    const headers = headerFacts(raw.headers);
    const httpStatus = Number.isInteger(raw.httpStatus) && raw.httpStatus >= 100 && raw.httpStatus <= 599 ? raw.httpStatus : null;
    const item = { key: "event:" + ++eventCount, atMs: time, direction, headers, ...(httpStatus ? { httpStatus } : {}) };
    if (direction === "local") {
      const failure = Object.hasOwn(FAILURES, raw.kind) ? FAILURES[raw.kind] : null;
      const request = validId(raw.requestId) ? byId.get(keyed(raw.requestDirection === "receive" ? "receive" : "send", raw.requestId))?.entry : null;
      if (raw.kind === "accepted" && request === null) {
        notifications.push({ ...item, label: "Notification accepted", detail: "HTTP 202" });
      } else if (failure && request?.status === "pending") {
        const [status, summary] = failure;
        end(request, time, status, summary, httpStatus ? { httpStatus } : {});
        request.events.push({ ...item, label: summary });
      } else note(time, "Uncorrelated local transport event.");
      continue;
    }
    if (!record(message) || message.jsonrpc !== "2.0") {
      note(time, "Malformed JSON-RPC frame.");
      continue;
    }
    if (typeof message.method === "string") {
      if (Object.hasOwn(message, "result") || Object.hasOwn(message, "error")) {
        note(time, "A method frame also contains response fields.");
        continue;
      }
      const method = identifier(message.method, "withheld-method");
      if (!Object.hasOwn(message, "id")) {
        const p = message.params;
        let associated;
        if (message.method === "notifications/progress" && validId(p?.progressToken)) {
          const active = progress.get(keyed(opposite(direction), p.progressToken))?.filter(({ status }) => status === "pending") ?? [];
          associated = active.length === 1 ? active[0] : null;
          if (associated) associated.events.push({ ...item, label: "Progress update",
            detail: finite(p.progress) ? String(p.progress) + (finite(p.total) ? " / " + p.total : "") : "Progress received" });
        }
        if (message.method === "notifications/cancelled" && validId(p?.requestId)) {
          associated = byId.get(keyed(direction, p.requestId))?.entry;
          if (associated) associated.events.push({ ...item, label: "Cancellation requested" });
        }
        if (message.method === "notifications/tools/list_changed") {
          for (const [key, tool] of catalog) {
            if (JSON.parse(key)[0] === direction) {
              tool.entry.staleAt = time;
              catalog.delete(key);
            }
          }
          for (const key of pages.keys()) if (JSON.parse(key)[0] === opposite(direction)) pages.delete(key);
        }
        if (!associated) notifications.push({ ...item, label: method,
          detail: message.method === "notifications/progress" ? "No active request matched this progress token" : "Notification" });
        continue;
      }
      if (!validId(message.id) || byId.has(keyed(direction, message.id))) {
        note(time, "Invalid or duplicate request identifier.");
        continue;
      }
      const entry = {
        key: "request:" + (requests.length + 1), sequence: requests.length + 1, method, direction,
        startMs: time, endMs: null, status: "pending", checks: {},
        request: { jsonrpc: "2.0", method, params: payloadShape(message.params ?? {}) },
        events: [{ ...item, label: direction === "send" ? "Request sent" : "Request received" }],
      };
      requests.push(entry);
      const tool = message.method === "tools/call" ? inspectTool(entry, message, direction) : null;
      byId.set(keyed(direction, message.id), { entry, method: message.method, tool });
      if (!["initialize", "server/discover"].includes(message.method)) connect(ready.get(direction), entry, "session context");
      if (message.method === "tools/list" && typeof message.params?.cursor === "string") {
        connect(pages.get(keyed(direction, message.params.cursor)), entry, "next discovery page");
      }
      const token = message.params?._meta?.progressToken;
      if (validId(token)) {
        const tokenKey = keyed(direction, token);
        const active = progress.get(tokenKey)?.filter(({ status }) => status === "pending") ?? [];
        if (active.length) note(time, "Duplicate active progress token. Updates cannot be attributed while it is shared.");
        progress.set(tokenKey, [...active, entry]);
      }
      if (Array.isArray(raw.dependsOn)) for (const prior of new Set(raw.dependsOn.slice(0, 20))) {
        const dependency = validId(prior) ? byId.get(keyed(direction, prior))?.entry : null;
        if (dependency && dependency !== entry && dependency.status === "success" && dependency.endMs <= time) {
          connect(dependency, entry, "recorded dependency");
        } else note(time, "Recorded dependency did not reference an earlier successful request.");
      }
      continue;
    }
    const target = validId(message.id) ? byId.get(keyed(opposite(direction), message.id)) : null;
    if (!target) {
      note(time, "Response has no matching request in the opposite direction.");
      continue;
    }
    const { entry, method, tool } = target;
    if (entry.status !== "pending") {
      entry.events.push({ ...item, label: "Late or duplicate response", detail: "Original receipt retained" });
      continue;
    }
    entry.events.push({ ...item, label: direction === "receive" ? "Response received" : "Response sent" });
    if (Object.hasOwn(message, "error") && !Object.hasOwn(message, "result") &&
        record(message.error) && Number.isSafeInteger(message.error.code) && typeof message.error.message === "string") {
      const code = message.error.code;
      end(entry, time, "rpc-error", ERROR_NAMES.get(code) ?? "JSON-RPC error", { code, ...(httpStatus ? { httpStatus } : {}) });
      continue;
    }
    if (!record(message.result) || Object.hasOwn(message, "error")) {
      end(entry, time, "protocol-error", "Invalid JSON-RPC result envelope");
      continue;
    }
    const result = message.result;
    const isTool = method === "tools/call";
    const status = isTool && result.isError === true ? "tool-error" : "success";
    if (isTool && tool?.output && status === "success") {
      entry.checks.output = !Object.hasOwn(result, "structuredContent")
        ? { status: "invalid", issues: [{ path: "/structuredContent", message: "Declared structured output is missing." }] }
        : masks(validateValue(tool.raw.outputSchema, result.structuredContent, tool.output));
    }
    const invalid = Object.values(entry.checks).some(({ status }) => status === "invalid");
    const outcome = status === "success" && invalid ? "schema-error" : status;
    end(entry, time, outcome, {
      success: isTool ? "Tool returned a result" : "Response received",
      "schema-error": "Schema mismatch",
      "tool-error": "Tool reported an execution error",
    }[outcome], {
      ...(httpStatus ? { httpStatus } : {}),
      ...(isTool ? { reportedStatus: status, contentBlocks: Array.isArray(result.content) ? result.content.length : 0 } : {}),
      preview: payloadShape(result),
    });
    if (["initialize", "server/discover"].includes(method)) {
      if (typeof result.protocolVersion === "string" && VERSION.test(result.protocolVersion)) protocol = result.protocolVersion;
      ready.set(entry.direction, entry);
    }
    if (method === "tools/list") discovered(entry, result, direction);
  }
  for (const request of requests) {
    if (request.checks.input) edge(request.key, "input:" + request.key, "validates input");
    if (request.checks.output) edge(request.key, "output:" + request.key, "validates output");
  }
  return {
    schemaVersion: "wmcp-inspector-report/v1", label, protocol,
    durationMs: Math.round((events.at(-1).atMs - zero) * 10) / 10,
    eventCount, requests, tools, notifications, diagnostics, edges,
  };
}
