// Read-only MCP Streamable HTTP client used by "wmcp mcp" and "wmcp doctor".
// Only sends initialize, notifications/initialized and tools/list; never tools/call.
// Intended for public HTTPS endpoints and explicitly requested local development.
export const MAX_RESPONSE_BYTES = 2_000_000;
export const MAX_PAGES = 12;
export const MAX_TOOLS = 2000;
export const REQUESTED_PROTOCOL = "2025-11-25";

export function validateEndpoint(value) {
  if (typeof value !== "string" || value.length < 1 || value.length > 2048)
    throw Error("MCP endpoint must be a nonempty URL at most 2048 characters long");
  let u;
  try { u = new URL(value); } catch { throw Error("Enter a full HTTPS MCP endpoint URL"); }
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(u.hostname);
  if (u.protocol !== "https:" && !(u.protocol === "http:" && local))
    throw Error("MCP endpoint must use HTTPS (plain HTTP is allowed only on localhost)");
  if (u.username || u.password || u.search || u.hash)
    throw Error("Remove credentials, query parameters and fragments from the MCP URL");
  return u.toString();
}

function valueHeader(headers, name) {
  return typeof headers?.get === "function" ? headers.get(name) : null;
}

// Read a bounded number of bytes, rather than allocating an unbounded
// response.text() before applying a substring limit.
async function boundedBody(response, maxBytes = MAX_RESPONSE_BYTES) {
  if (!response.body?.getReader) {
    const text = await response.text();
    if (Buffer.byteLength(text, "utf8") > maxBytes) throw Error("MCP response exceeds 2 MB limit");
    return text;
  }
  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const bytes = value instanceof Uint8Array ? value : new Uint8Array(value);
      size += bytes.byteLength;
      if (size > maxBytes) throw Error("MCP response exceeds 2 MB limit");
      chunks.push(bytes);
    }
  } finally {
    try { await reader.cancel(); } catch {}
    reader.releaseLock();
  }
  return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))).toString("utf8");
}

export function parseMcpBody(text, contentType = "", id = null) {
  if (!text.trim()) return null;
  if (!contentType.includes("text/event-stream")) {
    try { return JSON.parse(text); } catch { throw Error("MCP server returned invalid JSON"); }
  }
  // Parse SSE events (including multiline data fields); honor the event with
  // our JSON-RPC id if several protocol events arrive in one response.
  const events = text.replace(/\r\n/g, "\n").split(/\n\n+/);
  const decoded = [];
  for (const event of events) {
    const data = event.split("\n").filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trimStart()).join("\n");
    if (!data || data === "[DONE]") continue;
    try { decoded.push(JSON.parse(data)); } catch { continue; }
  }
  const matching = id === null ? decoded.at(-1) : decoded.find((message) => message?.id === id);
  if (!matching) throw Error("MCP SSE response contained no matching JSON-RPC message");
  return matching;
}

async function transmit(endpoint, request, payload, headers, expectedId, timeoutMs) {
  let response;
  try {
    response = await request(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      redirect: "manual",
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    throw Error("MCP connection failed: " + String(err?.message || err));
  }
  if (response.status >= 300 && response.status < 400)
    throw Error("MCP endpoint redirect refused; use the canonical HTTPS URL");
  if (response.status === 401 || response.status === 403)
    throw Error("MCP endpoint requires authentication (" + response.status + ")");
  if (response.status >= 400)
    throw Error("MCP HTTP " + response.status + " " + (await boundedBody(response, 512)).slice(0, 180));
  if (expectedId === null) return { response, value: null }; // initialized notification
  const body = await boundedBody(response);
  const parsed = parseMcpBody(body, valueHeader(response.headers, "content-type") || "application/json", expectedId);
  if (parsed?.jsonrpc !== "2.0" || parsed?.id !== expectedId)
    throw Error("MCP returned an invalid JSON-RPC response or mismatched request id");
  if (parsed.error)
    throw Error("MCP JSON-RPC error " + parsed.error.code + ": " + String(parsed.error.message || "unknown").slice(0, 200));
  if (!parsed.result || typeof parsed.result !== "object")
    throw Error("MCP response missing result object");
  return { response, value: parsed.result };
}

export async function inspectMcpEndpoint(endpoint, {
  request = fetch, apiKey = "", timeoutMs = 12_000, maxPages = MAX_PAGES, maxTools = MAX_TOOLS,
} = {}) {
  endpoint = validateEndpoint(endpoint);
  const basicHeaders = { "content-type": "application/json", accept: "application/json, text/event-stream" };
  if (apiKey) basicHeaders.authorization = "Bearer " + apiKey;
  const started = Date.now();
  const hello = await transmit(endpoint, request, {
    jsonrpc: "2.0", id: 1, method: "initialize", params: {
      protocolVersion: REQUESTED_PROTOCOL,
      capabilities: {},
      clientInfo: { name: "wmcp-doctor", version: "0.1.0" },
    },
  }, basicHeaders, 1, timeoutMs);
  const init = hello.value;
  if (typeof init.protocolVersion !== "string" || !init.protocolVersion)
    throw Error("MCP initialize returned no negotiated protocol version");
  const sessionId = valueHeader(hello.response.headers, "mcp-session-id");
  if (sessionId && !/^[\x21-\x7e]{1,256}$/.test(sessionId))
    throw Error("MCP server returned an invalid session identifier");
  const headers = { ...basicHeaders, "mcp-protocol-version": init.protocolVersion };
  if (sessionId) headers["mcp-session-id"] = sessionId;

  await transmit(endpoint, request, { jsonrpc: "2.0", method: "notifications/initialized" }, headers, null, timeoutMs);
  const tools = [];
  const seenCursors = new Set();
  let cursor = null;
  let pages = 0;
  let nextId = 2;
  let truncated = false;
  do {
    const params = cursor ? { cursor } : {};
    const { value } = await transmit(endpoint, request, {
      jsonrpc: "2.0", id: nextId, method: "tools/list", params,
    }, headers, nextId, timeoutMs);
    nextId++;
    if (!Array.isArray(value.tools)) throw Error("MCP tools/list response is missing a tools array");
    tools.push(...value.tools);
    pages++;
    if (tools.length > maxTools) {
      tools.length = maxTools;
      truncated = true;
      break;
    }
    const nextCursor = value.nextCursor;
    if (nextCursor === undefined || nextCursor === null || nextCursor === "") break;
    if (typeof nextCursor !== "string") throw Error("MCP tools/list returned a non-string pagination cursor");
    if (seenCursors.has(nextCursor)) throw Error("MCP tools/list repeated a pagination cursor");
    seenCursors.add(nextCursor);
    cursor = nextCursor;
    if (pages >= maxPages) {
      truncated = true;
      break;
    }
  } while (true);

  return {
    endpoint,
    requestedProtocol: REQUESTED_PROTOCOL,
    protocolVersion: init.protocolVersion,
    server: init.serverInfo?.name || "unknown",
    capabilities: init.capabilities || {},
    tools,
    pages,
    truncated,
    transport: "streamable-http",
    sessionUsed: !!sessionId, // never expose the actual identifier
    elapsedMs: Date.now() - started,
  };
}
