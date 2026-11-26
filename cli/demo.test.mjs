import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { compileCapabilities } from "./compile.mjs";

const html = readFileSync(new URL("../examples/browser-demo/index.html", import.meta.url), "utf8");
const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];

class Element {
  constructor(document, textContent = "") {
    this.document = document;
    this.textContent = textContent;
    this.children = [];
    this.listeners = new Map();
    this.attributes = new Map();
    this.value = "";
    this.open = false;
  }
  append(...nodes) {
    this.children.push(...nodes);
    for (const node of nodes) {
      if (node instanceof Element) node.parent = this;
    }
  }
  focus() { this.document.activeElement = this; }
  remove() { this.parent.children = this.parent.children.filter((child) => child !== this); }
  removeAttribute(name) { this.attributes.delete(name); }
  setAttribute(name, value) { this.attributes.set(name, value); }
  addEventListener(name, handler) { this.listeners.set(name, handler); }
  fire(name, isTrusted = true) { this.listeners.get(name)?.({ isTrusted, preventDefault() {} }); }
  showModal() { this.open = true; }
  close() { this.open = false; this.fire("close"); }
}

function boot(native = true) {
  const registered = [];
  const winListeners = new Map();
  const document = {
    modelContext: native ? {
      registerTool: async (tool, options) => { registered.push({ tool, options }); },
    } : undefined,
    getElementById: (id) => nodes[id],
    createElement: () => new Element(document),
  };
  const nodes = Object.fromEntries([
    "list", "status", "task", "feedback", "task-error", "agent-review", "review-approve",
    "review-detail", "review-cancel", "tasks-heading", "add-task", "form",
  ].map((id) => [id, new Element(document)]));
  nodes["tasks-heading"].textContent = "Tasks";
  nodes["add-task"].textContent = "Add task";
  const window = { addEventListener: (event, handler) => winListeners.set(event, handler) };
  new Function("document", "window", script)(document, window);
  return { nodes, registered, winListeners, document };
}

const decode = (result) => JSON.parse(result.content[0].text);

describe("native browser WebMCP demo", () => {
  it("ships parseable JavaScript and references the real document API", () => {
    assert.ok(script);
    assert.doesNotThrow(() => new Function("document", "window", script));
    assert.ok(script.includes("document.modelContext"));
    assert.ok(!script.includes("navigator.modelContext ="));
  });

  it("requires a separate review for each agent write and rejects synthetic approval", async () => {
    const { nodes, registered, winListeners } = boot();
    const [list, add, complete] = registered.map(({ tool }) => tool);
    assert.deepEqual([list.name, add.name, complete.name], ["list_tasks", "add_task", "complete_task"]);
    assert.equal(list.annotations.readOnlyHint, true);
    assert.equal(add.annotations.readOnlyHint, false);

    const creation = add.execute({ text: "Write an example" });
    assert.equal(nodes["agent-review"].open, true);
    assert.equal(nodes["review-approve"].textContent, "Add task");
    assert.match(nodes["review-detail"].textContent, /Write an example/);
    assert.equal(decode(await list.execute({})).length, 2);
    nodes["review-approve"].fire("click", false);
    assert.equal(nodes["agent-review"].open, true);
    await assert.rejects(add.execute({ text: "Another request" }), /awaiting a decision/);
    nodes["review-approve"].fire("click");
    const added = decode(await creation);
    assert.equal(added.text, "Write an example");
    assert.equal(nodes.list.children.length, 3);

    const rejection = complete.execute({ id: added.id });
    nodes["agent-review"].fire("cancel");
    await assert.rejects(rejection, /canceled/);
    assert.equal(decode(await list.execute({})).at(-1).done, false);
    const completion = complete.execute({ id: added.id });
    nodes["review-approve"].fire("click");
    assert.deepEqual(decode(await completion), { ...added, done: true });
    await assert.rejects(complete.execute({ id: added.id }), /already completed/);
    await assert.rejects(add.execute({ text: "" }), /Enter a task name/);

    await assert.rejects(add.execute({ text: "Unexpected argument", extra: true }), /only the text argument/);
    assert.equal(nodes["agent-review"].open, false);

    const invocation = new AbortController();
    const canceled = add.execute({ text: "Canceled" }, { signal: invocation.signal });
    invocation.abort();
    await assert.rejects(canceled, /canceled/);
    assert.equal(nodes["agent-review"].open, false);
    assert.equal(nodes.list.children.length, 3);

    const abandoned = add.execute({ text: "Abandoned" });
    winListeners.get("pagehide")();
    await assert.rejects(abandoned, /canceled/);
    assert.ok(registered[0].options.signal.aborted);
  });

  it("keeps the compiled titles, descriptions, input schema and observed effects aligned", async () => {
    const manifest = JSON.parse(readFileSync(new URL("../examples/browser-demo/capabilities.json", import.meta.url), "utf8"));
    const { tools } = compileCapabilities(manifest);
    const { nodes, registered } = boot();
    const descriptor = ({ name, title, description, inputSchema }) => ({ name, title, description, inputSchema });
    assert.deepEqual(tools.map(descriptor), registered.map(({ tool }) => descriptor(tool)));

    const [list, add, complete] = registered.map(({ tool }) => tool);
    const count = nodes.list.children.length;
    const creation = add.execute({ text: "Write a capability specification" });
    nodes["review-approve"].fire("click");
    const created = decode(await creation);
    const [increase, state] = tools[1].postconditions;
    assert.equal(nodes.list.children.length - count, increase.by);
    assert.equal(created[state.pointer.slice(1)], state.value);

    const completion = complete.execute({ id: created.id });
    nodes["review-approve"].fire("click");
    const changed = decode(await completion);
    assert.equal(changed.done, tools[2].postconditions[0].value);
    assert.equal(changed.id, created.id);
    const listed = decode(await list.execute({}));
    assert.equal(listed.length, nodes.list.children.length);
    assert.equal(listed.at(-1).done, true);
  });

  it("keeps the human controls functional on a browser without WebMCP", () => {
    const { registered, nodes, document } = boot(false);
    assert.equal(registered.length, 0);
    assert.equal(nodes.status.textContent, "Agent tools unavailable in this browser.");
    nodes.form.fire("submit");
    assert.equal(nodes["task-error"].textContent, "Enter a task name.");
    assert.equal(nodes.task.attributes.get("aria-invalid"), "true");
    nodes.task.value = "Manual task";
    nodes.form.fire("submit");
    assert.equal(nodes.task.attributes.has("aria-invalid"), false);
    assert.equal(nodes.list.children.length, 3);
    assert.equal(document.activeElement, nodes.task);
    const button = nodes.list.children[0].children[1];
    button.focus();
    button.fire("click");
    assert.equal(nodes.list.children[0].children.length, 1);
    assert.equal(document.activeElement.id, "complete-2");
  });
});
