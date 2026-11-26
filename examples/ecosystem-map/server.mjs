import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { pathToFileURL, fileURLToPath } from "node:url";
import { KINDS, openEcosystem } from "../../cli/ecosystem.mjs";
import { record } from "../../cli/compile-schema.mjs";
import { REQUESTED_PROTOCOL } from "../../cli/mcp-read.mjs";

const ASSETS = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/style.css", ["style.css", "text/css; charset=utf-8"]],
  ["/app.mjs", ["app.mjs", "text/javascript; charset=utf-8"]],
]);
const CATALOG = fileURLToPath(new URL("../capability-discovery/catalog.json", import.meta.url));
const CONFIG = fileURLToPath(new URL("./config.json", import.meta.url));
const SEARCH = {
  name: "search_ecosystem",
  title: "Search ecosystem map",
  description: "Find documented capabilities, candidate service overlaps, integration gaps and workflow opportunities by outcome.",
  annotations: { readOnlyHint: true },
  inputSchema: { type: "object", properties: {
    goal: { type: "string", minLength: 1, maxLength: 600 },
    kind: { type: "string", enum: KINDS, default: "all" },
    limit: { type: "integer", minimum: 1, maximum: 30, default: 12 },
  }, required: ["goal"], additionalProperties: false },
};
const INSPECT = {
  name: "inspect_map_node",
  title: "Inspect map node",
  description: "Get one map node’s evidence, relationships and stable IDs for related nodes.",
  annotations: { readOnlyHint: true },
  inputSchema: { type: "object", properties: { id: { type: "string", minLength: 1, maxLength: 600 } },
    required: ["id"], additionalProperties: false },
};

function apiJSON(response, status, value) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" }).end(JSON.stringify(value));
}

async function readJSON(request) {
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers["content-type"] ?? "")) throw Error("Expected application/json.");
  const parts = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 24_000) throw Error("Request body is too large.");
    parts.push(chunk);
  }
  return JSON.parse(Buffer.concat(parts).toString("utf8"));
}

function allowedFields(value, names) {
  return record(value) && Object.keys(value).every((key) => names.includes(key));
}

function search(map, args) {
  if (!allowedFields(args, ["goal", "kind", "limit"])) throw Error("Unexpected search argument.");
  return map.query(args);
}

function inspect(map, args) {
  if (!allowedFields(args, ["id"]) || typeof args.id !== "string" || !args.id || args.id.length > 600) throw Error("Invalid map node ID.");
  return map.inspect(args.id);
}

function rpc(map, message, response) {
  if (!record(message) || message.jsonrpc !== "2.0" || typeof message.method !== "string") {
    apiJSON(response, 400, { jsonrpc: "2.0", id: null, error: { code: -32600, message: "Invalid request." } });
    return;
  }
  if (!Object.hasOwn(message, "id")) {
    response.writeHead(202).end();
    return;
  }
  if (typeof message.id !== "string" && !Number.isSafeInteger(message.id)) {
    apiJSON(response, 400, { jsonrpc: "2.0", id: null, error: { code: -32600, message: "Invalid request ID." } });
    return;
  }
  const envelope = { jsonrpc: "2.0", id: message.id };
  const answer = (result) => apiJSON(response, 200, { ...envelope, result });
  const error = (code, text) => apiJSON(response, 200, { ...envelope, error: { code, message: text } });
  if (message.method === "initialize") return answer({
    protocolVersion: REQUESTED_PROTOCOL, capabilities: { tools: {} },
    serverInfo: { name: "wmcp-ecosystem-map", version: "1.0.0" },
  });
  if (message.method === "ping") return answer({});
  if (message.method === "tools/list") return answer({ tools: [SEARCH, INSPECT] });
  if (message.method !== "tools/call") return error(-32601, "Unknown method.");
  const { name, arguments: args } = message.params ?? {};
  if (name !== SEARCH.name && name !== INSPECT.name) return error(-32602, "Unknown map tool.");
  let result;
  try { result = name === SEARCH.name ? search(map, args) : inspect(map, args); }
  catch { return error(-32602, "Invalid map arguments."); }
  if (!result) return answer({ isError: true, content: [{ type: "text", text: "Map node was not found." }] });
  return answer({ structuredContent: result, content: [{ type: "text", text: JSON.stringify(result) }] });
}

export function ecosystemServer(map = openEcosystem(CATALOG, CONFIG)) {
  const server = createServer(async (request, response) => {
    const port = server.address().port;
    const host = request.headers.host;
    if (![("127.0.0.1:" + port), ("localhost:" + port)].includes(host) ||
        (request.headers.origin && request.headers.origin !== "http://" + host)) {
      response.writeHead(403).end();
      return;
    }
    response.setHeader("cache-control", "no-store");
    response.setHeader("x-content-type-options", "nosniff");
    response.setHeader("content-security-policy",
      "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self'; base-uri 'none'; frame-ancestors 'none'");
    response.setHeader("referrer-policy", "no-referrer");
    try {
      const url = new URL(request.url, "http://" + host);
      if (request.method === "GET" && url.pathname === "/api/map") return apiJSON(response, 200, map.map);
      if (request.method === "GET" && url.pathname === "/api/node") {
        const node = inspect(map, { id: url.searchParams.get("id") });
        return apiJSON(response, node ? 200 : 404, node ?? { error: "Map node was not found." });
      }
      if (request.method === "POST" && url.pathname === "/api/query") return apiJSON(response, 200, search(map, await readJSON(request)));
      if (request.method === "POST" && url.pathname === "/mcp") {
        const version = request.headers["mcp-protocol-version"];
        if (version && version !== REQUESTED_PROTOCOL) return apiJSON(response, 400, { error: "Unsupported MCP protocol version." });
        return rpc(map, await readJSON(request), response);
      }
      if (request.method === "GET" && ASSETS.has(url.pathname)) {
        const [file, type] = ASSETS.get(url.pathname);
        const content = await readFile(new URL(file, import.meta.url));
        response.writeHead(200, { "content-type": type }).end(content);
        return;
      }
      response.writeHead(url.pathname === "/mcp" ? 405 : 404).end();
    } catch {
      if (!response.headersSent) apiJSON(response, 400, { error: "Check the request and try again." });
      else response.destroy();
    }
  });
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { values } = parseArgs({ options: { catalog: { type: "string" }, config: { type: "string" }, port: { type: "string" } } });
  const port = Number(values.port ?? 8790);
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw Error("Expected a valid local port.");
  const map = openEcosystem(values.catalog ?? CATALOG, values.config ?? (values.catalog ? undefined : CONFIG));
  const server = ecosystemServer(map);
  server.listen(port, "127.0.0.1", () => console.log("Ecosystem map · http://127.0.0.1:" + server.address().port));
}
