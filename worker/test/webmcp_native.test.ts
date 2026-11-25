import { execFile } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { expect, it } from "vitest";
import { webmcpShimJs } from "../src/webmcp_bridge";

const run = promisify(execFile);
const cli = fileURLToPath(new URL("../../cli/wmcp.mjs", import.meta.url));
const taskboard = new URL("../../examples/browser-demo/index.html", import.meta.url);

it.skipIf(!process.env.WMCP_CHROME)("real Chrome detects the legacy shim regression and proves the fix", async () => {
  const fixture = await readFile(taskboard, "utf8");
  const dir = await mkdtemp(join(tmpdir(), "wmcp-native-test-"));
  const baselinePath = join(dir, "baseline.json");
  let shim = "";
  const server = createServer((request, response) => {
    if (request.url === "/shim.js") {
      response.writeHead(200, { "content-type": "text/javascript", "cache-control": "no-store" }).end(shim);
    } else if (request.url === "/taskboard") {
      response.writeHead(200, { "content-type": "text/html" }).end(fixture);
    } else if (request.url === "/preview") {
      response.writeHead(200, { "content-type": "text/html" }).end('<script src="/shim.js"></script>');
    } else {
      response.writeHead(404).end("missing");
    }
  });
  server.listen(0, "127.0.0.1");
  try {
    await once(server, "listening");
    const address = server.address();
    if (!address || typeof address === "string") throw Error("Missing fixture server address");
    const origin = `http://127.0.0.1:${address.port}`;
    const scan = (path: string, ...args: string[]) => run(process.execPath,
      [cli, "doctor", "web", origin + path, "--json", "--strict", "--wait-ms", "150", ...args]);
    const taskboardReport = JSON.parse((await scan("/taskboard")).stdout);
    expect(taskboardReport.toolFingerprints.map((tool: { name: string }) => tool.name))
      .toEqual(["add_task", "complete_task", "list_tasks"]);

    const fixedShim = webmcpShimJs(origin + "/preview", [{ name: "list_tasks", result: [] }], origin);
    shim = fixedShim;
    const baseline = JSON.parse((await scan("/preview")).stdout);
    expect(baseline.toolCount).toBe(1);
    await writeFile(baselinePath, JSON.stringify(baseline));

    shim = fixedShim.replace("native && typeof native.registerTool === \"function\" ? native : legacy", "legacy");
    const broken = await scan("/preview", "--baseline", baselinePath).then(
      () => { throw Error("The legacy shim should fail strict mode"); },
      (error) => { expect(error.code).toBe(2); return JSON.parse(error.stdout); },
    );
    expect(broken.toolCount).toBe(0);
    expect(broken.drift.removed).toEqual(["list_tasks"]);

    shim = fixedShim;
    const fixed = JSON.parse((await scan("/preview", "--baseline", baselinePath)).stdout);
    expect(fixed.status).toBe("pass");
    expect(fixed.drift.changedAny).toBe(false);
    console.log(`Native WebMCP in ${fixed.browser}: ${broken.toolCount} tools before, ${fixed.toolCount} after (${fixed.toolFingerprints[0].name}).`);
    await expect(scan("/missing")).rejects.toMatchObject({ code: 1, stderr: expect.stringContaining("HTTP 404") });
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await rm(dir, { recursive: true, force: true });
  }
}, 45_000);
