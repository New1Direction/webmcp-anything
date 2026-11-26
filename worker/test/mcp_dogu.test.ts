import { execFile } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { expect, it, vi } from "vitest";
import worker from "../src/index";
import { cacheKey } from "../src/engine";
import { fetchAndParse } from "../src/html";
import { envMock, kvMock } from "./helpers";

vi.mock("../src/html", () => ({ fetchAndParse: vi.fn() }));

const run = promisify(execFile);
const cli = fileURLToPath(new URL("../../cli/wmcp.mjs", import.meta.url));
const dogu = process.env.WMCP_DOGU_TEST_BIN;
const source = "https://wmcp-fixture.example/guides";
const route = "/mcp/u/" + Buffer.from(source).toString("base64url");
const headline = "Guide to browser tool contracts";
const fixtureKey = "local-dogu-test";

async function fixture() {
  const env = envMock({ CACHE: kvMock() });
  await env.KEYS.put("key:" + fixtureKey, JSON.stringify({
    status: "active", plan: "builder", user_id: "fixture:dogu",
  }));
  await env.CACHE.put(cacheKey(source), JSON.stringify({
    ts: Date.now(),
    payload: {
      adapter: "jsonld",
      tools: [
        { name: "get_article", description: "Read the guide", result: { headline } },
        { name: "get_score", description: "Read a saved score", result: 0 },
        { name: "change_article", description: "Update the guide", action: { kind: "fixture_write" },
          annotations: { readOnlyHint: true } },
        { name: "ambiguous", result: {}, action: { kind: "fixture_write" } },
        { name: "unknown" },
      ],
    },
  }));
  vi.mocked(fetchAndParse).mockImplementation(async (url) => {
    expect(url).toBe(source);
    return {
      jsonld: [{ "@type": "Article", headline }],
      meta: {}, title: headline, finalUrl: url, status: 200,
    };
  });
  return async (request: Request) => {
    const pending: Promise<unknown>[] = [];
    const response = await worker.fetch(request, env, {
      waitUntil: (promise: Promise<unknown>) => pending.push(promise),
      passThroughOnException() {},
    } as ExecutionContext);
    await Promise.all(pending);
    return response;
  };
}

it("publishes read-only hints for result-only tools and leaves live tool hints unset", async () => {
  const fetchWorker = await fixture();
  const response = await fetchWorker(new Request("https://wmcp.sh" + route, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
  }));
  const { result } = await response.json() as {
    result: { tools: Array<{ name: string; annotations?: { readOnlyHint?: boolean } }> }
  };
  expect(result.tools.filter(({ annotations }) => annotations?.readOnlyHint).map(({ name }) => name))
    .toEqual(["get_article", "get_score"]);
  expect(result.tools.every((tool) => !("result" in tool))).toBe(true);
});

it.skipIf(!dogu)("syncs the Worker over HTTP and runs its static read in Dogu", async () => {
  const directory = await mkdtemp(join(tmpdir(), "wmcp-dogu-"));
  const folder = join(directory, "tools");
  const configPath = join(directory, "mcp.json");
  const doguEnv = { ...process.env, DOGU_AUTH_FILE: join(directory, "auth.json"), DOGU_WARM: "0" };
  const fetchWorker = await fixture();
  const calls: string[] = [];
  let origin = "";
  const server = createServer(async (request, response) => {
    try {
      if (request.url !== route) {
        response.writeHead(404).end();
        return;
      }
      let body = "";
      for await (const chunk of request) {
        body += String(chunk);
        if (body.length > 16_384) {
          response.writeHead(413).end();
          return;
        }
      }
      if (body) {
        const rpc = JSON.parse(body);
        if (rpc.method === "tools/call") {
          calls.push(rpc.params.name);
          if (rpc.params.name !== "get_article") {
            response.writeHead(400).end();
            return;
          }
        }
      }
      const result = await fetchWorker(new Request(origin + route, {
        method: request.method,
        headers: request.headers as Record<string, string>,
        body: body || undefined,
      }));
      response.writeHead(result.status, Object.fromEntries(result.headers));
      response.end(Buffer.from(await result.arrayBuffer()));
    } catch {
      response.writeHead(500).end("Fixture request failed");
    }
  });
  server.listen(0, "127.0.0.1");
  try {
    await once(server, "listening");
    const address = server.address();
    if (!address || typeof address === "string") throw Error("Missing fixture server address");
    origin = `http://127.0.0.1:${address.port}`;

    const { stdout } = await run(process.execPath, [cli, "config", source, "--base", origin], { timeout: 10_000 });
    const config = JSON.parse(stdout);
    expect(config.mcpServers.wmcp.url).toBe(origin + route);
    config.mcpServers.wmcp.headers = { Authorization: "Bearer " + fixtureKey };
    await writeFile(configPath, JSON.stringify(config), { mode: 0o600 });

    const sync = await run(dogu!, ["sync", "--config", configPath, "--out", folder, "--read-only"],
      { env: doguEnv, timeout: 12_000 });
    expect(sync.stdout).toContain("2 tools");
    const commands = await readdir(join(folder, "wmcp"));
    expect(commands).toEqual(expect.arrayContaining(["get_article", "get_score"]));
    expect(commands).not.toEqual(expect.arrayContaining(["change_article"]));
    expect(commands).not.toEqual(expect.arrayContaining(["ambiguous"]));
    expect(commands).not.toEqual(expect.arrayContaining(["unknown"]));
    expect(calls).toEqual([]);

    const command = join(folder, "wmcp", "get_article");
    const result = await run(command, ["--json"], { env: doguEnv, timeout: 12_000 });
    expect(JSON.parse(result.stdout)).toMatchObject({ headline });

    const code = 'const article = await tools.wmcp.get_article({}); console.log(JSON.stringify({headline: article.headline}));';
    const program = await run(dogu!, ["run", "--root", folder, "--allow", "wmcp/get_article",
      "--timeout", "10", "-e", code], { env: doguEnv, timeout: 12_000 });
    expect(JSON.parse(program.stdout)).toEqual({ headline });
    expect(calls).toEqual(["get_article", "get_article"]);
    console.log("Dogu synced two snapshot tools, omitted three unlabeled tools, and read the article as JSON in both modes.");
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await rm(directory, { recursive: true, force: true });
  }
}, 45_000);
