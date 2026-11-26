import { analyzeTrace, MAX_TRACE_BYTES } from "./trace.mjs";

const $ = (id) => document.getElementById(id);
const LABEL = {
  success: "Completed", pending: "Unfinished", "rpc-error": "RPC error", "tool-error": "Tool error",
  "schema-error": "Schema mismatch", "http-error": "HTTP error", timeout: "Timed out",
  "transport-error": "Transport error", "protocol-error": "Protocol error",
  valid: "Valid", invalid: "Invalid", unsupported: "Unsupported", unavailable: "Unavailable",
};
const relatedColors = {
  "declares input": "#b9a7ff", "discovers tool": "#93b5e9", "recorded dependency": "#efc184",
  "next discovery page": "#93b5e9", "session context": "#7d86ac", "produces receipt": "#75dfb0",
  "validates input": "#d8bbf7", "validates output": "#d8bbf7",
};
const state = { report: null, selected: null, cursor: 0, tab: "timeline", loading: false, playing: false, frame: 0 };
const el = (tag, classes = "", text) => {
  const node = document.createElement(tag);
  if (classes) node.className = classes;
  if (text !== undefined) node.textContent = text;
  return node;
};
const range = (value) => Math.min(100, Math.max(0, value));
const format = (ms) => Math.round(ms).toLocaleString("en-US") + " ms";
const badge = (status) => el("span", "badge tone-" + status, LABEL[status] ?? status);
const itemLabel = (request) => request.toolName ?? request.method;
const activeStatus = (request) => request.endMs !== null && request.endMs <= state.cursor ? request.status : "pending";
const shown = (request) => request.startMs <= state.cursor;
const duration = (request) => Math.max(0, Math.min(request.endMs ?? state.cursor, state.cursor) - request.startMs);

function button(classes, name, callback) {
  const node = el("button", classes, name);
  node.type = "button";
  node.addEventListener("click", callback);
  return node;
}

function select(key, focus = false) {
  state.selected = key;
  draw(focus ? key : undefined);
}

function metrics() {
  const requests = state.report.requests.filter(shown);
  const complete = requests.filter((item) => activeStatus(item) === "success").length;
  const failures = requests.filter((item) => !["pending", "success"].includes(activeStatus(item))).length;
  const values = [
    ["Tools discovered", visibleTools().length, ""], ["Requests", requests.length, ""],
    ["Completed", complete, "green"], ["Failed", failures, "red"],
  ];
  $("metrics").replaceChildren(...values.map(([label, count, tone]) => {
    const node = el("div", "metric");
    node.dataset.tone = tone;
    node.append(el("dt", "", label), el("dd", "", count));
    return node;
  }));
}

function visibleRequests() {
  const query = $("query").value.trim().toLowerCase();
  const mode = $("filter").value;
  return state.report.requests.filter((request) => {
    if (!shown(request) || ![request.method, request.toolName].some((value) => value?.toLowerCase().includes(query))) return false;
    const status = activeStatus(request);
    return mode === "all" || (mode === "calls" && request.method === "tools/call") ||
      (mode === "pending" && status === "pending") || (mode === "failures" && !["pending", "success"].includes(status));
  });
}

function visibleTools() {
  return state.report.tools.filter((tool) => {
    const request = state.report.requests.find(({ key }) => key === tool.discoveryKey);
    return request?.endMs !== null && request?.endMs <= state.cursor;
  });
}

function timeline() {
  const root = el("div");
  const axisRow = el("div", "timeline-layout");
  const axis = el("div", "axis");
  const max = Math.max(1, state.report.durationMs);
  for (let i = 0; i <= 4; i++) axis.append(el("span", "", format(max * i / 4)));
  axisRow.append(el("span", "", "Method / tool"), axis, el("span", "duration", "Elapsed"));
  root.append(axisRow);
  const items = visibleRequests();
  if (!items.length) root.append(el("p", "empty", state.cursor <= 0 ? "Move the playback position or play the trace." : "No requests match these filters."));
  for (const request of items) {
    const status = activeStatus(request);
    const row = button("trace-row", undefined, () => select(request.key, true));
    row.setAttribute("aria-pressed", String(request.key === state.selected));
    row.dataset.focusKey = request.key;
    const label = el("span", "label tone-" + status);
    const text = el("span", "label-text");
    text.append(el("span", "name", itemLabel(request)), el("span", "secondary-line",
      (request.toolName ? "tools/call · " : "") + LABEL[status]));
    label.append(el("span", "indicator"), text);
    const track = el("span", "track");
    track.setAttribute("aria-hidden", "true");
    const bar = el("span", "span tone-" + status);
    bar.style.setProperty("--start", range(request.startMs / max * 100) + "%");
    bar.style.setProperty("--width", range(duration(request) / max * 100) + "%");
    track.append(bar);
    if (state.cursor < state.report.durationMs) {
      const cursor = el("span", "cursor");
      cursor.style.setProperty("--at", range(state.cursor / max * 100) + "%");
      track.append(cursor);
    }
    row.append(label, track, el("span", "duration mono", format(duration(request))));
    root.append(row);
  }
  const notes = [
    ...state.report.notifications.map(({ atMs, label, detail }) => ({ atMs, text: label + (detail ? " · " + detail : "") })),
    ...state.report.diagnostics,
  ].filter(({ atMs }) => atMs <= state.cursor).sort((a, b) => a.atMs - b.atMs);
  if (notes.length) {
    const area = el("details", "subsection");
    area.open = $("view").querySelector(".subsection")?.open ?? false;
    const list = el("ul", "notes-list");
    for (const note of notes) {
      const line = el("li");
      line.append(el("time", "", format(note.atMs)), document.createTextNode(note.text));
      list.append(line);
    }
    area.append(el("summary", "", "Notifications and diagnostics · " + notes.length), list);
    root.append(area);
  }
  return root;
}

function toolsView() {
  const tools = visibleTools();
  if (!tools.length) return el("p", "empty", "No tool definitions have arrived at this playback position.");
  const list = el("div");
  for (const tool of tools) {
    const row = button("tool-row", undefined, () => select(tool.key, true));
    row.dataset.focusKey = tool.key;
    row.setAttribute("aria-pressed", String(tool.key === state.selected));
    const title = el("span");
    title.append(el("span", "name", tool.name),
      el("span", "secondary-line", tool.staleAt !== undefined && tool.staleAt <= state.cursor ? "Prior declaration" :
        tool.outputSchema ? "Input and output schemas" : "Input schema"));
    row.append(title, badge(tool.input.status));
    list.append(row);
  }
  return list;
}

let graphObserver;
function graphView() {
  const report = state.report;
  const nodes = new Map();
  for (const request of report.requests.filter(shown)) {
    nodes.set(request.key, { key: request.key, label: itemLabel(request), type: "Request" });
    if (request.receipt && request.endMs <= state.cursor) nodes.set(request.receipt.key, {
      key: request.receipt.key, label: LABEL[request.status], type: "Receipt", inspect: request.key,
    });
    for (const phase of ["input", "output"]) {
      const check = request.checks[phase];
      if (!check || (phase === "output" && activeStatus(request) === "pending")) continue;
      const id = phase + ":" + request.key;
      nodes.set(id, { key: id, label: LABEL[check.status], type: phase === "input" ? "Input check" : "Output check", inspect: request.key });
    }
  }
  for (const tool of visibleTools()) nodes.set(tool.key, { key: tool.key, label: tool.name, type: "Tool declaration" });
  if (!nodes.size) return el("p", "empty", "Move the playback position to see dependencies.");
  const focus = nodes.get(state.selected) ?? nodes.values().next().value;
  const relations = report.edges.filter(({ from, to }) =>
    (from === focus.key || to === focus.key) && nodes.has(from) && nodes.has(to));
  const board = el("div", "graph");
  const canvas = el("canvas");
  canvas.setAttribute("aria-hidden", "true");
  const columns = Array.from({ length: 3 }, () => el("div", "graph-column"));
  const controls = new Map();
  const makeNode = (node, col) => {
    if (controls.has(node.key)) return;
    const control = button("graph-node", undefined, () => select(node.inspect ?? node.key, true));
    control.dataset.focusKey = node.key;
    control.dataset.selected = String(node.key === focus.key);
    control.append(el("small", "", node.type), el("strong", "", node.label));
    controls.set(node.key, control);
    columns[col].append(control);
  };
  for (const { from, to } of relations) {
    if (to === focus.key) makeNode(nodes.get(from), 0);
    else makeNode(nodes.get(to), 2);
  }
  makeNode(focus, 1);
  board.append(canvas, ...columns);
  const root = el("div");
  const toolbar = el("div", "toolbar");
  const selectBox = el("select");
  selectBox.setAttribute("aria-label", "Graph focus");
  for (const node of nodes.values()) {
    if (node.inspect) continue;
    const option = el("option", "", node.type + " · " + node.label);
    option.value = node.key;
    selectBox.append(option);
  }
  selectBox.value = focus.key;
  selectBox.addEventListener("change", () => {
    select(selectBox.value);
    $("view").querySelector("select")?.focus({ preventScroll: true });
  });
  toolbar.append(el("span", "secondary-line", "Graph focus"), selectBox);
  const chunk = el("div", "graph-panel");
  chunk.append(board);
  if (relations.length) {
    const list = el("ul", "relations");
    for (const { from, to, type } of relations) {
      const line = el("li");
      line.append(el("code", "", nodes.get(from).label), el("span", "badge", type), el("code", "", nodes.get(to).label));
      list.append(line);
    }
    chunk.append(list);
  } else chunk.append(el("p", "secondary-line", "No dependencies were recorded for this item."));
  root.append(toolbar, chunk);
  function paint() {
    if (!board.isConnected) return;
    const box = board.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(board.clientWidth * ratio);
    canvas.height = Math.round(board.clientHeight * ratio);
    canvas.style.width = board.clientWidth + "px";
    canvas.style.height = board.clientHeight + "px";
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 1.6;
    for (const relation of relations) {
      const a = controls.get(relation.from).getBoundingClientRect();
      const b = controls.get(relation.to).getBoundingClientRect();
      const x = a.right - box.left;
      const y = a.top + a.height / 2 - box.top;
      const ex = b.left - box.left;
      const ey = b.top + b.height / 2 - box.top;
      const mid = (x + ex) / 2;
      ctx.strokeStyle = ctx.fillStyle = relatedColors[relation.type];
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.bezierCurveTo(mid, y, mid, ey, ex - 2, ey);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ex - 2, ey);
      ctx.lineTo(ex - 7, ey - 3);
      ctx.lineTo(ex - 7, ey + 3);
      ctx.fill();
    }
  }
  graphObserver = new ResizeObserver(paint);
  graphObserver.observe(board);
  return root;
}

function detailsSection(root, heading) {
  const section = el("section", "detail-section");
  section.append(el("h3", "", heading));
  root.append(section);
  return section;
}
function payload(title, value) {
  const view = el("details", "payload");
  view.append(el("summary", "", title), el("pre", "", JSON.stringify(value, null, 2)));
  return view;
}
function check(section, label, finding) {
  if (!finding) return;
  const row = el("div", "check");
  row.append(el("span", "", label), badge(finding.status));
  section.append(row);
  for (const { path, message } of finding.issues) {
    const line = el("p", "issue");
    if (path) line.append(el("code", "", path + " "));
    line.append(document.createTextNode(message));
    section.append(line);
  }
}
function details() {
  const report = state.report;
  const request = report.requests.find(({ key }) => key === state.selected);
  const tool = visibleTools().find(({ key }) => key === state.selected);
  $("detail-subtitle").textContent = request && shown(request) ? "Request " + request.sequence :
    tool ? "Tool discovery" : "Select a request or tool";
  if ((!request || !shown(request)) && !tool) return el("p", "empty", "Choose a request or tool visible at this playback position.");
  const root = el("div", "detail-body");
  const header = el("div", "detail-label");
  if (tool) {
    header.append(el("h3", "", tool.name), badge(tool.input.status));
    root.append(header, el("p", "detail-meta", "Discovered via tools/list."));
    const validation = detailsSection(root, "Schema declarations");
    check(validation, "Input schema", tool.input);
    if (tool.output) check(validation, "Output schema", tool.output);
    validation.append(payload("Input schema", tool.inputSchema));
    if (tool.outputSchema) validation.append(payload("Output schema", tool.outputSchema));
    return root;
  }
  const status = activeStatus(request);
  header.append(el("h3", "", itemLabel(request)), badge(status));
  root.append(header, el("p", "detail-meta", request.method + " · " +
    (request.direction === "send" ? "Client → Server" : "Server → Client")));
  const history = detailsSection(root, "Lifecycle");
  const events = el("ol", "event-list");
  for (const event of request.events.filter(({ atMs }) => atMs <= state.cursor)) {
    const entry = el("li", "event");
    const message = el("span", "", event.label);
    const note = [event.detail, event.httpStatus && "HTTP " + event.httpStatus].filter(Boolean).join(" · ");
    if (note) message.append(el("small", "", note));
    entry.append(el("time", "", format(event.atMs)), message);
    events.append(entry);
  }
  history.append(events);
  if (request.checks.input || (status !== "pending" && request.checks.output)) {
    const validation = detailsSection(root, "Schema validation");
    check(validation, "Input", request.checks.input);
    if (status !== "pending") check(validation, "Output", request.checks.output);
  }
  const receipt = detailsSection(root, "Execution receipt");
  if (status === "pending") receipt.append(el("p", "", "No terminal response observed at this position."));
  else {
    const result = request.receipt;
    receipt.append(el("p", "", [result.summary, format(result.durationMs), result.code && "RPC " + result.code]
      .filter(Boolean).join(" · ")));
    if (result.reportedStatus === "success" && result.status === "schema-error") {
      receipt.append(el("p", "", "The tool reported success. The schema check failed."));
    }
    if (result.contentBlocks !== undefined) receipt.append(el("p", "", result.contentBlocks + " content block" +
      (result.contentBlocks === 1 ? "" : "s")));
    if (result.preview) receipt.append(payload("Response shape", result.preview));
  }
  const wire = detailsSection(root, "Redacted wire data");
  wire.append(payload("Request shape", request.request));
  const headers = request.events.filter(({ atMs, headers }) => atMs <= state.cursor && Object.keys(headers).length)
    .map(({ atMs, direction, headers }) => ({ atMs, direction, headers }));
  if (headers.length) wire.append(payload("Transport headers", headers));
  return root;
}

function draw(focusKey) {
  if (!state.report) return;
  if (graphObserver) { graphObserver.disconnect(); graphObserver = undefined; }
  metrics();
  $("position").value = String(state.cursor);
  $("position-label").textContent = format(state.cursor);
  $("play").textContent = state.playing ? "Ⅱ Pause" : "▷ Replay";
  $("view").replaceChildren({ timeline, graph: graphView, tools: toolsView }[state.tab]());
  $("details").replaceChildren(details());
  if (focusKey) [...$("view").querySelectorAll("[data-focus-key]")]
    .find((node) => node.dataset.focusKey === focusKey)?.focus({ preventScroll: true });
}

function pause() {
  state.playing = false;
  cancelAnimationFrame(state.frame);
}
function setReport(report) {
  pause();
  state.report = report;
  state.cursor = report.durationMs;
  state.selected = (report.requests.find(({ toolName }) => toolName) ?? report.requests[0] ?? report.tools[0])?.key;
  $("trace-subtitle").textContent = report.label + " · " + report.eventCount + " events";
  $("protocol").textContent = report.protocol ? "MCP " + report.protocol : "MCP trace";
  $("position").max = String(Math.ceil(report.durationMs));
  $("position").disabled = !report.durationMs;
  $("play").disabled = !report.durationMs;
  $("export").disabled = false;
  $("filter").value = "all";
  $("query").value = "";
  setTab("timeline");
}

async function runFixture() {
  if (state.loading) return;
  state.loading = true;
  pause();
  $("run").disabled = true;
  $("import").disabled = true;
  $("notice").textContent = "";
  $("run").textContent = "Running…";
  try {
    const response = await fetch("/api/fixture/" + $("fixture").value);
    if (!response.ok) throw Error("Local fixture failed.");
    setReport(await response.json());
  } catch {
    $("notice").textContent = "The local fixture could not be run.";
  } finally {
    state.loading = false;
    $("run").disabled = false;
    $("import").disabled = false;
    $("run").textContent = "Run fixture";
  }
}

async function importTrace(file) {
  if (!file || state.loading) return;
  $("notice").textContent = "";
  if (file.size > MAX_TRACE_BYTES) {
    $("notice").textContent = "Trace files are limited to 2 MB.";
    return;
  }
  try {
    const report = analyzeTrace(JSON.parse(await file.text()));
    setReport(report);
  } catch {
    $("notice").textContent = "Use a valid wmcp-mcp-trace/v1 JSON file with up to 1,000 timestamped events.";
  }
}

function exportReport() {
  if (!state.report) return;
  const url = URL.createObjectURL(new Blob([JSON.stringify(state.report, null, 2) + "\n"], { type: "application/json" }));
  const anchor = el("a");
  anchor.href = url;
  anchor.download = "wmcp-inspector-redacted.json";
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const tabs = [...document.querySelectorAll("[role=tab]")];
function setTab(tab) {
  state.tab = tab;
  for (const tabButton of tabs) {
    tabButton.setAttribute("aria-selected", String(tabButton.dataset.tab === tab));
    tabButton.tabIndex = tabButton.dataset.tab === tab ? 0 : -1;
  }
  $("view").setAttribute("aria-labelledby", "tab-" + tab);
  $("toolbar").hidden = tab !== "timeline";
  draw();
}
for (const tab of tabs) {
  tab.addEventListener("click", () => setTab(tab.dataset.tab));
  tab.addEventListener("keydown", (event) => {
    const offset = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
    if (!offset) return;
    event.preventDefault();
    const next = tabs[(tabs.indexOf(tab) + offset + tabs.length) % tabs.length];
    setTab(next.dataset.tab);
    next.focus();
  });
}
$("query").addEventListener("input", () => draw());
$("filter").addEventListener("change", () => {
  if (!state.report) return;
  const first = visibleRequests()[0];
  if (first && !visibleRequests().some(({ key }) => key === state.selected)) state.selected = first.key;
  draw();
});
$("position").addEventListener("focus", () => {
  if (state.playing) { pause(); draw(); }
});
$("position").addEventListener("input", () => {
  pause();
  state.cursor = Math.min(Number($("position").value), state.report.durationMs);
  draw();
});
$("play").addEventListener("click", () => {
  if (state.playing) { pause(); draw(); return; }
  state.cursor = 0;
  state.playing = true;
  const start = performance.now();
  const rate = state.report.durationMs / Math.min(6000, Math.max(1800, state.report.durationMs));
  let last = 0;
  draw();
  function tick(now) {
    if (!state.playing) return;
    state.cursor = Math.min((now - start) * rate, state.report.durationMs);
    if (state.cursor >= state.report.durationMs) { pause(); draw(); return; }
    if (now - last > 65) { draw(); last = now; }
    state.frame = requestAnimationFrame(tick);
  }
  state.frame = requestAnimationFrame(tick);
});
$("import").addEventListener("click", () => $("file").click());
$("file").addEventListener("change", async () => {
  await importTrace($("file").files[0]);
  $("file").value = "";
});
$("export").addEventListener("click", exportReport);
$("run").addEventListener("click", runFixture);
runFixture();
