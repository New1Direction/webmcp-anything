// Real Chrome MV3 acceptance. Loads a temporary localhost-permissioned copy
// of the shipping extension, tests isolation and chrome.tabs messaging.
// The native document.modelContext is simulated because CI Chromium may not
// include the gated WebMCP origin trial. Never enable broad hosts in production.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { cpSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

test("MV3 extension: actual isolated-world discovery and browser-native tab-local execution", { timeout: 90_000 }, async () => {
  const source = fileURLToPath(new URL("../../extension/", import.meta.url));
  const scratch = mkdtempSync(join(tmpdir(), "wmcp-mv3-acceptance-"));
  const extPath = join(scratch, "extension");
  cpSync(source, extPath, { recursive: true });
  const manifestPath = join(extPath, "manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const match = "http://127.0.0.1/*";
  manifest.content_scripts[0].matches = [match];
  manifest.web_accessible_resources[0].matches = [match];
  manifest.host_permissions.push(match);
  writeFileSync(manifestPath, JSON.stringify(manifest));
  const server = createServer((_req, res) => {
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.end("<!doctype html><html><head><title>MV3 acceptance</title></head><body><div id=\"state\">ready</div></body></html>");
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  let context;
  try {
    const origin = "http://127.0.0.1:" + server.address().port;
    context = await chromium.launchPersistentContext(join(scratch, "profile"), {
      headless: true,
      channel: "chromium",
      args: [
        "--disable-extensions-except=" + extPath,
        "--load-extension=" + extPath,
      ],
    });
    let sw = context.serviceWorkers()[0];
    if (!sw) sw = await context.waitForEvent("serviceworker", { timeout: 25000 });
    assert.match(sw.url(), /^chrome-extension:\/\//);
    const page = await context.newPage();
    await page.addInitScript(() => {
      window.__nativeCalls = [];
      window.__siteTools = [{
        name: "set_note", origin: location.origin,
        description: "Change the visible note on the page",
        inputSchema: { type: "object", properties: { note: { type: "string" } } },
        annotations: { readOnlyHint: false },
      }];
      window.__browserRegistered = [];
      const listeners = new Map();
      Object.defineProperty(document, "modelContext", {
        configurable: true,
        value: {
          async getTools() { return [...window.__siteTools, ...window.__browserRegistered]; },
          async registerTool(tool, { signal } = {}) {
            window.__browserRegistered.push(tool);
            signal?.addEventListener("abort", () => {
              const i = window.__browserRegistered.indexOf(tool);
              if (i >= 0) window.__browserRegistered.splice(i, 1);
            }, { once: true });
          },
          async executeTool(tool, args) {
            if (!window.__siteTools.includes(tool)) throw Error("native tool handle not registered");
            window.__nativeCalls.push({ name: tool.name, args });
            document.getElementById("state").textContent = args.note;
            return JSON.stringify({ changed: true, note: args.note });
          },
          addEventListener(type, cb) { listeners.set(type, cb); },
        },
      });
    });
    await page.goto(origin + "/", { waitUntil: "load" });

    async function message(name, extra = {}) {
      return sw.evaluate(async ({ origin, name, extra }) => {
        const tabs = await chrome.tabs.query({});
        const tab = tabs.find(t => t.url && t.url.startsWith(origin));
        if (!tab) throw Error("No matching browser tab");
        return chrome.tabs.sendMessage(tab.id, { type: name, ...extra });
      }, { origin, name, extra });
    }

    let tools = null;
    for (let i = 0; i < 25; i++) {
      try {
        const response = await message("GET_TOOLS_FOR_PAGE");
        if (response.ok && response.tools?.some(t => t.name === "set_note")) {
          tools = response.tools; break;
        }
      } catch { /* content script may still be loading */ }
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    assert.ok(tools, "Native site tool should be discovered through the packaged MV3 extension");
    assert.equal(tools.find(t => t.name === "set_note").source, "native");

    const result = await message("EXECUTE_NATIVE_TOOL", {
      name: "set_note", args: { note: "Real MV3 bridge worked" },
    });
    assert.equal(result.ok, true, JSON.stringify(result));
    assert.equal(await page.locator("#state").textContent(), "Real MV3 bridge worked");
    assert.equal((await page.evaluate(() => window.__nativeCalls)).length, 1);

    // Any page script can fake a window.postMessage sender: it must NEVER be
    // sufficient to trigger a privileged background write.
    await page.evaluate(() => {
      window.postMessage({
        source: "WEBMCP_ANYTHING", dir: "page->bridge", type: "EXECUTE",
        payload: { name: "add_to_cart", args: { amount: 1000 }, requestId: "forged" },
      }, location.origin);
    });
    await new Promise(resolve => setTimeout(resolve, 150));
    assert.equal((await page.evaluate(() => window.__nativeCalls)).length, 1);

    await page.evaluate(() => {
      window.__siteTools = [];
      history.pushState({}, "", "/new-route");
    });
    await new Promise(resolve => setTimeout(resolve, 1800));
    const stale = await message("EXECUTE_NATIVE_TOOL", {
      name: "set_note", args: { note: "Stale write" },
    });
    assert.equal(stale.ok, false);
    assert.equal(await page.locator("#state").textContent(), "Real MV3 bridge worked");
  } finally {
    if (context) await context.close();
    await new Promise((resolve) => server.close(resolve));
    rmSync(scratch, { recursive: true, force: true });
  }
});
