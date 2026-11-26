import { setTimeout as delay } from "node:timers/promises";
import { REQUESTED_PROTOCOL } from "../../cli/mcp-read.mjs";
import { analyzeTrace, TRACE_VERSION } from "./trace.mjs";

export const FIXTURES = Object.freeze({
  lifecycle: "Tool lifecycle",
  failures: "Failure states",
  schemas: "Schema validation",
});
const field = (type) => ({ type });
const shape = (properties) => ({ type: "object", properties, required: Object.keys(properties), additionalProperties: false });
const tools = [
  { name: "search_runbooks", inputSchema: shape({ query: field("string") }), outputSchema: shape({ matches: field("integer") }) },
  { name: "get_runbook", inputSchema: shape({ runbookId: field("string") }), outputSchema: shape({
    runbookId: field("string"), sections: { type: "array", items: field("string") },
  }) },
  { name: "summarize_runbook", inputSchema: shape({ runbookId: field("string") }), outputSchema: shape({ wordCount: field("integer") }) },
  { name: "export_runbook", inputSchema: shape({ runbookId: field("string") }), outputSchema: shape({ ready: field("boolean") }) },
];
const rpc = (id, result) => ({ jsonrpc: "2.0", id, result });
const error = (id, code, message) => ({ jsonrpc: "2.0", id, error: { code, message } });
const body = (value) => JSON.stringify(value);
const result = (structuredContent) => ({ content: [{ type: "text", text: "Synthetic fixture result" }], structuredContent });
const session = "fixture-session-7c34";
const SESSION_HEADER = "mcp-session-id";

function reply(response, message, headers = {}) {
  response.writeHead(200, { "content-type": "application/json", ...headers }).end(body(message));
}

async function progressReply(response, message, output) {
  response.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-cache" });
  response.flushHeaders();
  const frame = (item) => "data: " + body(item) + "\n\n";
  for (const progress of [1, 2, 3]) {
    await delay(70);
    if (response.destroyed) return;
    response.write(frame({ jsonrpc: "2.0", method: "notifications/progress", params: {
      progressToken: message.params._meta.progressToken, progress, total: 3,
    } }));
  }
  await delay(35);
  if (!response.destroyed) response.end(frame(output));
}

export async function handleFixture(request, response, scenario) {
  if (request.method !== "POST") { response.writeHead(405).end(); return; }
  if (!request.headers["content-type"]?.startsWith("application/json")) {
    response.writeHead(415).end();
    return;
  }
  let text = "";
  for await (const chunk of request) {
    text += chunk;
    if (text.length > 32_000) { response.writeHead(413).end(); return; }
  }
  let message;
  try { message = JSON.parse(text); }
  catch { reply(response, error(null, -32700, "Invalid JSON.")); return; }
  if (!message || message.jsonrpc !== "2.0") { reply(response, error(null, -32600, "Invalid request.")); return; }
  const { id, method, params } = message;
  if (method === "initialize") {
    await delay(38);
    reply(response, rpc(id, {
      protocolVersion: REQUESTED_PROTOCOL, capabilities: { tools: {} },
      serverInfo: { name: "wmcp-demo", version: "1.0.0" },
    }), { [SESSION_HEADER]: session });
    return;
  }
  if (request.headers[SESSION_HEADER] !== session || request.headers["mcp-protocol-version"] !== REQUESTED_PROTOCOL) {
    response.writeHead(400).end();
    return;
  }
  if (method === "notifications/initialized") { response.writeHead(202).end(); return; }
  if (method === "tools/list") {
    await delay(params?.cursor ? 30 : 55);
    if (params?.cursor && params.cursor !== "next-page") { reply(response, error(id, -32602, "Invalid fixture cursor.")); return; }
    const definitions = scenario === "schemas"
      ? [...tools, { name: "validate_slug", inputSchema: shape({ slug: { type: "string", pattern: "^[a-z-]+$" } }) }]
      : tools;
    reply(response, rpc(id, params?.cursor ? { tools: definitions.slice(2) } :
      { tools: definitions.slice(0, 2), nextCursor: "next-page" }));
    return;
  }
  if (method !== "tools/call") { reply(response, error(id, -32601, "Unknown method.")); return; }
  const { name, arguments: args, _meta } = params ?? {};
  if (scenario === "failures" && args?.runbookId === "offline") {
    await delay(35);
    response.writeHead(503).end();
    return;
  }
  if (scenario === "failures" && args?.runbookId === "slow") {
    await delay(400);
    if (!response.destroyed) reply(response, rpc(id, result({ ready: true })));
    return;
  }
  if (name === "search_runbooks" && typeof args?.query === "string" && (typeof _meta?.progressToken === "string" || Number.isSafeInteger(_meta?.progressToken))) {
    await progressReply(response, message, rpc(id, result({ matches: 2 })));
    return;
  }
  await delay(name === "summarize_runbook" ? 76 : 43);
  if (name === "validate_slug" && scenario === "schemas" && typeof args?.slug === "string") {
    reply(response, rpc(id, result({ accepted: true })));
  } else if (name === "get_runbook" && typeof args?.runbookId === "string") {
    reply(response, rpc(id, result({ runbookId: args.runbookId, sections: ["Overview", "Checklist"] })));
  } else if (name === "summarize_runbook" && typeof args?.runbookId === "string") {
    reply(response, rpc(id, result({ wordCount: scenario === "schemas" ? "incorrect-type" : 68 })));
  } else if (name === "export_runbook" && typeof args?.runbookId === "string") {
    reply(response, rpc(id, args.runbookId === "locked"
      ? { isError: true, content: [{ type: "text", text: "The fixture record is locked." }] }
      : result({ ready: true })));
  } else {
    reply(response, error(id, -32602, "Expected typed fixture arguments."));
  }
}

async function streamMessages(response, recordMessage) {
  let buffer = "";
  const decoder = new TextDecoder();
  for await (const chunk of response.body) {
    buffer += decoder.decode(chunk, { stream: true });
    let boundary;
    while ((boundary = /\r?\n\r?\n/.exec(buffer))) {
      const block = buffer.slice(0, boundary.index);
      buffer = buffer.slice(boundary.index + boundary[0].length);
      const data = block.split(/\r?\n/).filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trimStart());
      if (data.length) recordMessage(JSON.parse(data.join("\n")));
    }
  }
  if (buffer.trim()) throw Error("Incomplete SSE message");
}

export async function collectFixture(origin, scenario) {
  if (!Object.hasOwn(FIXTURES, scenario)) throw Error("Unknown fixture.");
  const endpoint = origin + "/fixtures/" + scenario + "/mcp";
  const started = performance.now();
  const events = [];
  const recordEvent = (direction, fields) => events.push({ atMs: performance.now() - started, direction, ...fields });
  const headers = { "content-type": "application/json", accept: "application/json, text/event-stream",
    authorization: "Bearer fixture-only-canary" };
  let sequence = 0;
  async function exchange(method, params, { notify = false, timeout = 2000, dependsOn } = {}) {
    const message = { jsonrpc: "2.0", ...(notify ? {} : { id: ++sequence }), method, ...(params ? { params } : {}) };
    recordEvent("send", { message, headers: { ...headers }, ...(dependsOn ? { dependsOn } : {}) });
    let response;
    try {
      response = await fetch(endpoint, { method: "POST", headers, body: body(message),
        redirect: "error", signal: AbortSignal.timeout(timeout) });
    } catch (failure) {
      recordEvent("local", { kind: failure.name === "TimeoutError" ? "timeout" : "transport", requestId: message.id });
      return { id: message.id };
    }
    const responseHeaders = Object.fromEntries(response.headers);
    const wire = { httpStatus: response.status, headers: responseHeaders };
    if (!response.ok) {
      recordEvent("local", { kind: "http", requestId: message.id, ...wire });
      return { id: message.id };
    }
    if (notify) { recordEvent("local", { kind: "accepted", ...wire }); return {}; }
    let observed;
    const receive = (message) => {
      if (Object.hasOwn(message, "result")) observed = message.result;
      recordEvent("receive", { message, ...wire });
    };
    try {
      if (response.headers.get("content-type")?.startsWith("text/event-stream")) await streamMessages(response, receive);
      else receive(await response.json());
    } catch (failure) {
      recordEvent("local", { kind: failure.name === "TimeoutError" || failure.name === "AbortError" ? "timeout" : "malformed",
        requestId: message.id, ...wire });
    }
    return { id: message.id, result: observed, session: response.headers.get(SESSION_HEADER) };
  }

  const initialized = await exchange("initialize", { protocolVersion: REQUESTED_PROTOCOL, capabilities: {},
    clientInfo: { name: "wmcp-inspector-fixture", version: "1.0.0" } });
  if (!initialized.result || !initialized.session) return { schemaVersion: TRACE_VERSION, events };
  headers[SESSION_HEADER] = initialized.session;
  headers["mcp-protocol-version"] = initialized.result.protocolVersion;
  await exchange("notifications/initialized", null, { notify: true });
  const first = await exchange("tools/list", {});
  if (first.result?.nextCursor) await exchange("tools/list", { cursor: first.result.nextCursor });

  const call = (name, args, options) => exchange("tools/call", { name, arguments: args,
    ...(name === "search_runbooks" ? { _meta: { progressToken: "fixture-progress" } } : {}) }, options);
  if (scenario === "lifecycle") {
    const search = await call("search_runbooks", { query: "service handover" });
    const read = await call("get_runbook", { runbookId: "rb-104" }, { dependsOn: [search.id] });
    await call("summarize_runbook", { runbookId: "rb-104" }, { dependsOn: [read.id] });
    await call("export_runbook", { runbookId: "locked" });
  } else if (scenario === "failures") {
    await call("get_runbook", { runbookId: 104 });
    await call("export_runbook", { runbookId: "locked" });
    await call("export_runbook", { runbookId: "offline" });
    await call("export_runbook", { runbookId: "slow" }, { timeout: 110 });
  } else {
    await call("get_runbook", { runbookId: "rb-104" });
    await call("get_runbook", { runbookId: 104 });
    await call("summarize_runbook", { runbookId: "rb-104" });
    await call("validate_slug", { slug: "fixture" });
  }
  return { schemaVersion: TRACE_VERSION, events };
}

export async function fixtureReport(origin, name) {
  return analyzeTrace(await collectFixture(origin, name), FIXTURES[name]);
}
