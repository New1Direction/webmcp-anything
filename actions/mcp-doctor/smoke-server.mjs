// Local CI-only MCP endpoint for exercising the *actual* composite action.
// Intentionally implements just initialize, initialized, tools/list.
import { createServer } from "node:http";
const port = Number(process.env.WMCP_DOCTOR_SMOKE_PORT || 8765);
const tools = [{
  name: "read_example",
  description: "Return public example data",
  inputSchema: { type: "object", properties: {} },
  annotations: { readOnlyHint: true },
}];
const server = createServer(async (req, res) => {
  if (req.url === "/health" && req.method === "GET") {
    res.writeHead(200, { "content-type": "text/plain" });
    res.end("ok"); return;
  }
  if (req.url !== "/mcp" || req.method !== "POST") {
    res.writeHead(404); res.end(); return;
  }
  let raw = "";
  for await (const chunk of req) {
    raw += chunk.toString("utf8");
    if (raw.length > 128_000) { res.writeHead(413); res.end(); return; }
  }
  let payload;
  try { payload = JSON.parse(raw); } catch { res.writeHead(400); res.end(); return; }
  if (payload.method === "notifications/initialized") {
    res.writeHead(202); res.end(); return;
  }
  let result;
  if (payload.method === "initialize") {
    result = {
      protocolVersion: "2025-11-25",
      capabilities: { tools: { listChanged: false } },
      serverInfo: { name: "wmcp-doctor-ci-smoke", version: "1.0" },
    };
  } else if (payload.method === "tools/list") result = { tools };
  else {
    res.writeHead(400);
    res.end("Only read-only MCP operations supported");
    return;
  }
  res.writeHead(200, { "content-type": "application/json" });
  res.end(JSON.stringify({ jsonrpc: "2.0", id: payload.id, result }));
});
server.listen(port, "127.0.0.1", () => {
  console.log("MCP smoke endpoint ready on port " + port);
});
