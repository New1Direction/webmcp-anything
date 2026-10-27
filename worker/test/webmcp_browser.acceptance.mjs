// Browser-DOM acceptance of the actual injected.js + content.js bridge.
// Runs in real headless Chromium with a simulated native WebMCP API.
// Does not assert Chrome origin-trial support or MV3 isolated-world permissions.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const injected = readFileSync(new URL("../../extension/injected.js", import.meta.url), "utf8");
const content = readFileSync(new URL("../../extension/content.js", import.meta.url), "utf8");

async function harness(task) {
  const server = createServer((req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    if (req.url?.startsWith("/injected.js")) {
      res.setHeader("Content-Type", "application/javascript");
      res.end(injected); return;
    }
    res.end('<!doctype html><html><head><title>WMCP Browser Acceptance</title></head><body><h1 id="state">initial</h1></body></html>');
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  let browser;
  try {
    const origin = "http://127.0.0.1:" + server.address().port;
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.addInitScript(() => {
      window.__registered = [];
      window.__calls = [];
      window.__siteTools = [{
        name: "set_title",
        description: "Set the visible title",
        origin: location.origin,
        inputSchema: { type: "object", properties: { title: { type: "string" } } },
        annotations: { consequentialHint: true },
      }];
      const events = new Map();
      const modelContext = {
        async getTools() {
          return [...window.__siteTools, ...window.__registered];
        },
        async registerTool(tool, { signal } = {}) {
          window.__registered.push(tool);
          if (signal) signal.addEventListener("abort", () => {
            const index = window.__registered.indexOf(tool);
            if (index !== -1) window.__registered.splice(index, 1);
          }, { once: true });
        },
        async executeTool(tool, args) {
          if (!window.__siteTools.includes(tool)) throw Error("untrusted tool handle");
          window.__calls.push({ name: tool.name, args });
          document.getElementById("state").textContent = args.title;
          return JSON.stringify({ title: args.title });
        },
        addEventListener(type, fn) {
          events.set(type, fn);
        },
      };
      Object.defineProperty(document, "modelContext", {
        configurable: true, value: modelContext,
      });
      window.__extensionMessages = [];
      window.chrome = {
        runtime: {
          getURL(file) { return location.origin + "/" + file; },
          onMessage: { addListener(fn) { window.__contentListener = fn; } },
          async sendMessage(message) {
            window.__extensionMessages.push(message);
            if (message.type === "EXTRACT_TOOLS") return {
              ok: true,
              tools: [
                { name: "get_price", description: "Read price", result: { price: 100 } },
                { name: "add_to_cart", description: "Potential write", action: { kind: "add_to_cart" } },
              ],
            };
            if (message.type === "GET_SELECTORS") return { hosts: {} };
            if (message.type === "EXECUTE_TOOL") throw Error("Forged privileged call reached extension background!");
            return { ok: true };
          },
        },
        storage: { local: { async get() { return {}; } } },
      };
    });
    await page.goto(origin + "/", { waitUntil: "load" });
    await page.addScriptTag({ content });
    await page.waitForFunction(() => {
      return window.__registered.some(t => t.name === "get_price") &&
        typeof window.__contentListener === "function" &&
        window.__siteTools.length === 1;
    }, { timeout: 15000 });
    await task(page, origin);
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

test("in-browser discovery, tab-local execution, stale navigation cleanup, and forged write prevention", async () => {
  await harness(async (page, origin) => {
    const result = await page.evaluate(async () => {
      function popup(message) {
        return new Promise((resolve) => {
          const pending = window.__contentListener(message, {}, resolve);
          if (pending !== true) setTimeout(() => resolve({ ok: false, error: "listener was not async" }), 0);
        });
      }
      const before = await popup({ type: "GET_TOOLS_FOR_PAGE" });
      const names = before.tools.map(t => t.name).sort();
      const nativeResult = await popup({ type: "EXECUTE_NATIVE_TOOL", name: "set_title", args: { title: "Changed by native WebMCP" } });
      const visible = document.getElementById("state").textContent;
      window.postMessage({
        source: "WEBMCP_ANYTHING", dir: "page->bridge", type: "EXECUTE",
        payload: { requestId: "malicious", name: "add_to_cart", args: { quantity: 500 } },
      }, location.origin);
      await new Promise(resolve => setTimeout(resolve, 70));
      const resultBlocked = window.__extensionMessages.every(m => m.type !== "EXECUTE_TOOL");
      // SPA route no longer owns the previously registered site-native tool.
      window.__siteTools = [];
      history.pushState({}, "", "/new-path");
      await new Promise(resolve => setTimeout(resolve, 1650));
      const stale = await popup({ type: "EXECUTE_NATIVE_TOOL", name: "set_title", args: { title: "Should be denied" } });
      return { names, nativeResult, visible, resultBlocked, stale, value: document.getElementById("state").textContent };
    });
    assert.deepEqual(result.names, ["add_to_cart", "get_price", "set_title"]);
    assert.equal(result.nativeResult.ok, true);
    assert.equal(result.visible, "Changed by native WebMCP");
    assert.equal(result.resultBlocked, true);
    assert.equal(result.stale.ok, false);
    assert.equal(result.value, "Changed by native WebMCP");
    const registered = await page.evaluate(() => window.__registered.map(t => t.name));
    assert.deepEqual(registered, ["get_price"]);
  });
});
