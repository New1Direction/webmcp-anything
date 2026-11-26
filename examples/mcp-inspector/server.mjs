import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { FIXTURES, fixtureReport, handleFixture } from "./fixtures.mjs";

const ASSETS = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/style.css", ["style.css", "text/css; charset=utf-8"]],
  ["/schemas.mjs", ["../../cli/json-schema-check.mjs", "text/javascript; charset=utf-8"]],
  ...["app", "trace", "redact"].map((name) => ["/" + name + ".mjs", [name + ".mjs", "text/javascript; charset=utf-8"]]),
]);

export function inspectorServer() {
  const server = createServer(async (request, response) => {
    const address = server.address();
    const host = "127.0.0.1:" + address.port;
    if (request.headers.host !== host && request.headers.host !== "localhost:" + address.port) {
      response.writeHead(421).end();
      return;
    }
    response.setHeader("cache-control", "no-store");
    response.setHeader("x-content-type-options", "nosniff");
    response.setHeader("content-security-policy",
      "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self'; base-uri 'none'; frame-ancestors 'none'");
    response.setHeader("referrer-policy", "no-referrer");
    try {
      const report = /^\/api\/fixture\/([a-z]+)$/.exec(request.url);
      const endpoint = /^\/fixtures\/([a-z]+)\/mcp$/.exec(request.url);
      if (request.method === "GET" && report && Object.hasOwn(FIXTURES, report[1])) {
        const data = await fixtureReport("http://" + host, report[1]);
        response.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify(data));
      } else if (endpoint && Object.hasOwn(FIXTURES, endpoint[1])) {
        await handleFixture(request, response, endpoint[1]);
      } else if (request.method === "GET" && ASSETS.has(request.url)) {
        const [file, type] = ASSETS.get(request.url);
        const content = await readFile(new URL(file, import.meta.url));
        response.writeHead(200, { "content-type": type }).end(content);
      } else {
        response.writeHead(404).end("Not found.");
      }
    } catch {
      if (!response.headersSent) response.writeHead(500).end("Inspector request failed.");
      else response.destroy();
    }
  });
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.argv[2] ?? 8788);
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw Error("Expected a valid local port.");
  const server = inspectorServer();
  server.listen(port, "127.0.0.1", () => console.log("MCP Inspector · http://127.0.0.1:" + server.address().port));
}
