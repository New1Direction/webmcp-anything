import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../examples/browser-demo/index.html", import.meta.url), "utf8");
const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];

class Element {
  constructor(name) {
    this.name = name;
    this.children = [];
    this.listeners = new Map();
    this.textContent = "";
    this.value = "";
    this.classes = new Set();
    this.classList = {
      add: (v) => this.classes.add(v),
      toggle: (v, on) => on ? this.classes.add(v) : this.classes.delete(v),
    };
  }
  replaceChildren() { this.children = []; }
  append(...nodes) { this.children.push(...nodes); }
  addEventListener(name, handler) { this.listeners.set(name, handler); }
}

function boot(native = true) {
  const nodes = Object.fromEntries(["list", "status", "log", "form", "task"].map((id) => [id, new Element(id)]));
  const registered = [];
  const winListeners = new Map();
  const modelContext = native ? {
    registerTool: async (tool, options) => {
      registered.push({ tool, options });
    },
  } : undefined;
  const document = {
    modelContext,
    getElementById: (id) => nodes[id],
    createElement: (tag) => new Element(tag),
  };
  const window = { addEventListener: (evt, cb) => winListeners.set(evt, cb) };
  const run = new Function("document", "window", script);
  run(document, window);
  return { nodes, registered, winListeners };
}

describe("native browser WebMCP demo", () => {
  it("ships parseable JavaScript and references the real document API", () => {
    assert.ok(script);
    assert.doesNotThrow(() => new Function("document", "window", script));
    assert.ok(script.includes("document.modelContext"));
    assert.ok(!script.includes("navigator.modelContext ="));
  });

  it("adds and completes tasks through registered tools and updates the same UI", async () => {
    const { nodes, registered, winListeners } = boot(true);
    assert.deepEqual(registered.map(({ tool }) => tool.name),
      ["list_tasks", "add_task", "complete_task"]);
    const byName = (name) => registered.find(({ tool }) => tool.name === name).tool;
    assert.equal(nodes.list.children.length, 2);
    const created = await byName("add_task").execute({ text: "Write an example" });
    assert.match(created.content[0].text, /Write an example/);
    assert.equal(nodes.list.children.length, 3);
    const listed = await byName("list_tasks").execute({});
    assert.equal(JSON.parse(listed.content[0].text).length, 3);
    await byName("complete_task").execute({ id: 1 });
    assert.ok(nodes.list.children[0].classes.has("done"));
    assert.equal(registered[0].tool.annotations.readOnlyHint, true);
    await assert.rejects(byName("add_task").execute({ text: "" }), /1–120/);
    assert.ok(!registered[0].options.signal.aborted);
    winListeners.get("pagehide")();
    assert.ok(registered[0].options.signal.aborted);
  });

  it("does not register fake tools on unsupported browsers", () => {
    const { registered, nodes } = boot(false);
    assert.equal(registered.length, 0);
    assert.equal(nodes.status.textContent, "Native API unavailable");
    assert.equal(nodes.list.children.length, 2);
  });
});
