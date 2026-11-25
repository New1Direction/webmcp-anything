import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const MAX_MESSAGE = 4_000_000;
const MAX_TOOLS = 2000;
const toolKey = (tool) => tool.toolId || JSON.stringify([tool.frameId, tool.name]);
const BROWSER_TIMEOUT = 30_000;

function chromePipe(child) {
  const input = child.stdio[3];
  const output = child.stdio[4];
  const pending = new Map();
  const listeners = new Set();
  let sequence = 0;
  let buffer = "";
  const abort = new AbortController();
  let startupError = "";
  const fail = (error) => {
    if (abort.signal.aborted) return;
    abort.abort(error);
    for (const { reject } of pending.values()) reject(error);
    pending.clear();
  };
  const timer = setTimeout(() => fail(Error("Chrome scan timed out after 30 seconds")), BROWSER_TIMEOUT);
  child.stderr.on("data", (chunk) => {
    if (startupError.length < 500) startupError += String(chunk).slice(0, 500 - startupError.length);
  });
  child.on("error", (error) => fail(Error(`Could not start Chrome (${error.code || "spawn failed"}). Set WMCP_CHROME to a Chrome executable.`)));
  child.on("close", () => fail(Error("Chrome exited before the scan completed" +
    (startupError ? ": " + startupError.replace(/[\x00-\x1f\x7f]/g, " ").trim() : ""))));
  input.on("error", () => fail(Error("Chrome closed the DevTools command pipe")));
  output.on("error", () => fail(Error("Chrome closed the DevTools response pipe")));
  output.setEncoding("utf8");
  output.on("data", (chunk) => {
    buffer += chunk;
    let end;
    while (!abort.signal.aborted && (end = buffer.indexOf("\0")) !== -1) {
      if (end > MAX_MESSAGE) return fail(Error("Chrome DevTools message exceeds the scan limit"));
      const raw = buffer.slice(0, end);
      buffer = buffer.slice(end + 1);
      try {
        const message = JSON.parse(raw);
        if (message.id !== undefined) {
          const waiting = pending.get(message.id);
          pending.delete(message.id);
          if (message.error) waiting?.reject(Error(`${waiting.method}: ${message.error.message}`));
          else waiting?.resolve(message.result);
        } else {
          for (const listener of listeners) listener(message);
        }
      } catch (error) { fail(error); }
    }
    if (buffer.length > MAX_MESSAGE) fail(Error("Chrome DevTools message exceeds the scan limit"));
  });
  return {
    signal: abort.signal,
    onEvent: (listener) => listeners.add(listener),
    send(method, params = {}, sessionId) {
      abort.signal.throwIfAborted();
      return new Promise((resolve, reject) => {
        const id = ++sequence;
        pending.set(id, { method, resolve, reject });
        input.write(JSON.stringify({ id, method, params, sessionId }) + "\0");
      });
    },
    close() {
      clearTimeout(timer);
      fail(Error("Chrome scan closed"));
      input.end();
      child.kill();
    },
  };
}

function jsonSchema(value) {
  if (typeof value !== "string") return value;
  try { return JSON.parse(value); } catch { return value; }
}

export async function scanWebMcp(page, { chrome, waitMs = 1000 } = {}) {
  const executable = chrome || process.env.WMCP_CHROME || (process.platform === "darwin"
    ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" : "google-chrome");
  const profile = await mkdtemp(join(tmpdir(), "wmcp-chrome-"));
  const child = spawn(executable, ["--headless", "--remote-debugging-pipe", `--user-data-dir=${profile}`,
    "--no-first-run", "--no-default-browser-check", "--disable-background-networking",
    "--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport", "about:blank"],
  { stdio: ["ignore", "ignore", "pipe", "pipe", "pipe"] });
  const closed = new Promise((resolve) => child.once("close", resolve));
  const cdp = chromePipe(child);
  try {
    const version = await cdp.send("Browser.getVersion");
    const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
    const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
    const send = (method, params) => cdp.send(method, params, sessionId);
    const loaded = new Set();
    const responses = new Map();
    const tools = new Map();
    cdp.onEvent(({ method, params, sessionId: source }) => {
      if (source !== sessionId) return;
      if (method === "Page.lifecycleEvent" && params.name === "load") loaded.add(params.loaderId);
      if (method === "Network.responseReceived" && params.type === "Document") {
        responses.set(params.loaderId, params.response.status);
      }
      if (method === "WebMCP.toolsAdded") {
        for (const tool of params.tools) tools.set(toolKey(tool), tool);
        if (tools.size > MAX_TOOLS) throw Error("Browser registered more than 2000 tools; listing is incomplete");
      }
      if (method === "WebMCP.toolsRemoved") {
        for (const tool of params.tools) tools.delete(toolKey(tool));
      }
    });
    await send("Page.enable");
    await send("Page.setLifecycleEventsEnabled", { enabled: true });
    await send("Network.enable");
    try { await send("WebMCP.enable"); }
    catch (error) {
      if (cdp.signal.aborted) throw error;
      throw Error(`${version.product} does not expose the WebMCP DevTools domain. Use a WebMCP-capable Chrome build.`);
    }
    const navigation = await send("Page.navigate", { url: page });
    if (navigation.errorText || navigation.isDownload || !navigation.loaderId) {
      throw Error(`Chrome could not load the page (${navigation.errorText || "no document"})`);
    }
    const { frameId, loaderId } = navigation;
    while (!loaded.has(loaderId)) await delay(25, null, { signal: cdp.signal });
    const status = responses.get(loaderId);
    if (!status || status >= 400) throw Error(`Chrome did not receive a successful document response (HTTP ${status || "unknown"})`);
    await delay(waitMs, null, { signal: cdp.signal });
    const { frameTree: { frame } } = await send("Page.getFrameTree");
    if (frame.loaderId !== loaderId) throw Error("The page navigated again during observation. Use its final URL.");
    if (new URL(frame.url).origin !== new URL(page).origin) {
      throw Error("The page redirected to another origin. Use its final URL.");
    }
    return {
      browser: version.product,
      page: new URL(frame.url).origin + new URL(frame.url).pathname,
      tools: [...tools.values()].filter((tool) => tool.frameId === frameId).map((tool) => ({
        name: tool.name, title: tool.title, description: tool.description,
        inputSchema: jsonSchema(tool.inputSchema), outputSchema: jsonSchema(tool.outputSchema),
        annotations: tool.annotations,
      })),
    };
  } catch (error) {
    if (cdp.signal.aborted) throw cdp.signal.reason;
    throw error;
  } finally {
    cdp.close();
    const force = setTimeout(() => child.kill("SIGKILL"), 1000);
    await closed;
    clearTimeout(force);
    await rm(profile, { recursive: true, force: true, maxRetries: 3 });
  }
}
