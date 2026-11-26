const $ = (id) => document.getElementById(id);
const evidenceLabel = { documented: "Documented", inferred: "Inferred", "policy-checked": "Policy-checked" };
const kindLabel = { cluster: "Cluster", service: "Service", capability: "Capability", overlap: "Overlap", gap: "Integration gap", composition: "Composition" };
const reasons = {
  "no-producer": "No producer in scope", "boundary-mapping": "Boundary mapping needed",
  "schema-gap": "Schema compatibility gap", "unverified-wiring": "Wiring unverified",
  "write-prerequisite": "Only write prerequisites",
};
const state = { data: null, selected: null, layer: "all", scope: null, match: null, goal: null, searching: false };
let nodes = new Map();
let painter;
const el = (tag, cls = "", text) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
};
const count = (number, unit) => number + " " + unit + (number === 1 ? "" : "s");
const pill = (evidence) => el("span", "pill " + evidence, evidenceLabel[evidence]);

function control(cls, text, event) {
  const button = el("button", cls, text);
  button.type = "button";
  button.addEventListener("click", event);
  return button;
}

function select(id, drill = false, keepFocus = true) {
  const node = nodes.get(id);
  if (!node) return;
  state.selected = id;
  if (drill && node.kind === "service") state.scope = id;
  if (node.kind === "capability") state.scope = node.service;
  if (node.kind === "cluster") state.scope = null;
  history.replaceState(null, "", "#" + encodeURIComponent(id));
  render();
  if (!keepFocus) return;
  const focus = [...document.querySelectorAll("[data-node-id]")].find((item) => item.dataset.nodeId === id);
  (focus ?? $("inspect-title")).focus({ preventScroll: true });
}

function metric(label, amount, tone) {
  const node = el("div", "metric");
  if (tone) node.dataset.tone = tone;
  node.append(el("dt", "", label), el("dd", "", amount));
  return node;
}

function metrics() {
  const { clusters, services, capabilities, findings } = state.data;
  $("metrics").replaceChildren(
    metric("Documented capabilities", capabilities.length, "documented"),
    metric("Services", services.length), metric("Capability clusters", clusters.length),
    metric("Shared service coverage", findings.filter(({ kind }) => kind === "overlap").length, "inferred"),
    metric("Integration gaps", findings.filter(({ kind }) => kind === "gap").length, "inferred"),
  );
}

function activeFindings() {
  return state.data.findings.filter(({ kind }) => state.layer === "all" || kind === state.layer);
}

function relatedTo(id) {
  const node = nodes.get(id);
  if (node.kind === "cluster") return state.data.findings.filter(({ services }) => services.some((service) => node.services.includes(service)));
  return state.data.findings.filter(({ services, capabilities }) => services.includes(id) || capabilities.includes(id));
}

function isMatch(node) {
  return state.match?.results.some((result) => result.id === node.id ||
    (node.kind === "service" && (result.service === node.id || nodes.get(result.id)?.services?.includes(node.id)))) ?? false;
}

function mapNode(node, placed) {
  const button = control("node", undefined, () => select(node.id, true));
  button.dataset.nodeId = node.id;
  button.dataset.selected = String(state.selected === node.id);
  button.dataset.match = String(isMatch(node));
  button.setAttribute("aria-pressed", String(state.selected === node.id));
  button.append(el("strong", "", node.label), el("small", "", node.kind === "service"
    ? node.capabilities.length + (node.capabilities.length === 1 ? " capability" : " capabilities")
    : "Documented · " + node.effect));
  placed.set(node.id, button);
  return button;
}

function clusterCard(cluster, placed) {
  const card = el("section", "cluster");
  card.dataset.active = String(cluster.id === state.selected || cluster.services.includes(state.selected));
  const head = el("div", "cluster-head");
  const title = control("cluster-title", cluster.label, () => select(cluster.id));
  title.dataset.nodeId = cluster.id;
  title.setAttribute("aria-pressed", String(state.selected === cluster.id));
  head.append(title, el("span", "cluster-count", count(cluster.services.length, "service")));
  const services = el("div", "service-grid");
  for (const id of cluster.services) services.append(mapNode(nodes.get(id), placed));
  card.append(head, services);
  const findings = activeFindings().filter(({ services }) => services.some((id) => cluster.services.includes(id)));
  if (findings.length) {
    const signals = el("div", "cluster-signals");
    const groups = [
      ["Overlap", findings.filter(({ kind }) => kind === "overlap")],
      ["Gap", findings.filter(({ kind }) => kind === "gap")],
      ["Policy-checked", findings.filter(({ evidence }) => evidence === "policy-checked")],
      ["Candidate", findings.filter(({ kind, evidence }) => kind === "composition" && evidence === "inferred")],
    ];
    for (const [label, list] of groups) {
      if (!list.length) continue;
      const signal = control("signal" + (label === "Policy-checked" ? " checked" : ""), label + " · " + list.length,
        () => select(list[0].id));
      signal.dataset.nodeId = list[0].id;
      signals.append(signal);
    }
    card.append(signals);
  }
  return card;
}

function arrows(canvas, placed, links) {
  const box = $("stage").getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(box.width * ratio);
  canvas.height = Math.round(box.height * ratio);
  canvas.style.width = box.width + "px";
  canvas.style.height = box.height + "px";
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(ratio, ratio);
  ctx.lineWidth = 2;
  const duplicates = new Map();
  for (const { from, to, kind, evidence } of links) {
    const a = placed.get(from).getBoundingClientRect();
    const b = placed.get(to).getBoundingClientRect();
    const key = [from, to].sort().join("|");
    const offset = (duplicates.get(key) ?? 0) * 8;
    duplicates.set(key, offset / 8 + 1);
    const horizontal = Math.abs(b.x - a.x) >= Math.abs(b.y - a.y);
    const forward = horizontal ? b.x >= a.x : b.y >= a.y;
    const x = (horizontal ? (forward ? a.right : a.left) : a.x + a.width / 2 + offset) - box.left;
    const y = (horizontal ? a.y + a.height / 2 + offset : (forward ? a.bottom : a.top)) - box.top;
    const ex = (horizontal ? (forward ? b.left : b.right) : b.x + b.width / 2 + offset) - box.left;
    const ey = (horizontal ? b.y + b.height / 2 + offset : (forward ? b.top : b.bottom)) - box.top;
    ctx.strokeStyle = evidence === "policy-checked" ? "#9ae7ac" : kind === "overlap" ? "#b7a9ff" : "#f4c48a";
    ctx.setLineDash(evidence === "policy-checked" ? [] : [4, 3]);
    ctx.beginPath();
    ctx.moveTo(x, y);
    const midX = (x + ex) / 2;
    const midY = (y + ey) / 2;
    if (horizontal) ctx.bezierCurveTo(midX, y, midX, ey, ex, ey);
    else ctx.bezierCurveTo(x, midY, ex, midY, ex, ey);
    ctx.stroke();
  }
}

function stage() {
  if (painter) painter.disconnect();
  const placed = new Map();
  const canvas = el("canvas");
  canvas.setAttribute("aria-hidden", "true");
  const service = nodes.get(state.scope);
  const grid = el("div", service ? "cap-grid" : "cluster-grid");
  if (service) {
    if (!service.capabilities.length) grid.append(el("p", "empty", "This service has no documented capabilities."));
    for (const id of service.capabilities) grid.append(mapNode(nodes.get(id), placed));
  } else {
    for (const cluster of state.data.clusters) grid.append(clusterCard(cluster, placed));
  }
  const links = activeFindings().flatMap((finding) => {
    const [from, to] = service ? finding.capabilities : finding.services;
    if (!from || !to || from === to || !placed.has(from) || !placed.has(to)) return [];
    return [{ from, to, kind: finding.kind, evidence: finding.evidence }];
  });
  $("stage").replaceChildren(canvas, grid);
  $("back").hidden = !service;
  $("map-subtitle").textContent = service ? service.label + " · " + service.capabilities.length + " documented" :
    count(state.data.clusters.length, "cluster") + " · " + count(state.data.services.length, "service");
  $("map-footer").textContent = service
    ? (links.length ? count(links.length, "visible connection") + " · Select a capability to inspect its contract." :
      "Select a capability to inspect its documented contract.")
    : "Select a service to explore its capabilities. Connections and findings include their evidence level.";
  painter = new ResizeObserver(() => arrows(canvas, placed, links));
  painter.observe($("stage"));
}

function section(root, title) {
  const block = el("section", "detail-block");
  block.append(el("h4", "", title));
  root.append(block);
  return block;
}

function references(root, title, ids) {
  const choices = [...new Set(ids)].map((id) => nodes.get(id)).filter(Boolean);
  if (!choices.length) return;
  const block = section(root, title);
  const list = el("ul", "links");
  for (const node of choices) {
    const row = el("li");
    const entry = control("link-node", node.label, () => select(node.id, true));
    entry.dataset.nodeId = node.id;
    row.append(entry);
    list.append(row);
  }
  block.append(list);
}

function dataSection(root, label, value) {
  const details = el("details");
  details.append(el("summary", "", label), el("pre", "", JSON.stringify(value, null, 2)));
  root.append(details);
}

function inspect() {
  const node = nodes.get(state.selected);
  if (!node) return el("p", "empty", "Select a node to see its evidence and related tools.");
  $("inspect-subtitle").textContent = kindLabel[node.kind];
  const root = el("div", "inspect-body");
  root.append(pill(node.evidence), el("h3", "", node.label));
  if (node.description) root.append(el("p", "", node.description));
  if (node.kind === "cluster") {
    root.append(el("p", "", "Grouped by shared top-level outcomes in the catalog."));
    references(root, "Services", node.services);
  } else if (node.kind === "service") {
    root.append(el("p", "", node.interface === "site" ? "WebMCP site contract" : "OpenAPI source"));
    if (node.origin) root.append(el("p", "", node.origin));
    references(root, "Documented capabilities", node.capabilities);
  } else if (node.kind === "capability") {
    root.append(el("p", "", "Declared effect · " + node.effect));
    if (node.outcomes.length) root.append(el("p", "", node.outcomes.join(" · ")));
    const contracts = section(root, "Capability contract");
    contracts.append(el("p", "", node.provenance.source + " " + (node.provenance.pointer ?? "")));
    dataSection(contracts, "Inputs and outputs", { inputs: node.inputs, outputs: node.outputs,
      inputSchema: node.inputSchema, outputSchemas: node.outputSchemas });
    dataSection(contracts, "Requirements and outcomes", { preconditions: node.preconditions, postconditions: node.postconditions });
    references(root, "Source service", [node.service]);
  } else {
    if (node.kind === "overlap") {
      const shared = section(root, "Shared declared outcomes");
      for (const pair of node.shared) shared.append(el("p", "", pair.label + " · " + pair.effect + " · " +
        (pair.samePayloadSchemas ? "Matching payload schemas" : "Payload schemas differ") +
        (pair.samePreconditions ? "" : " · Preconditions differ")));
    }
    if (node.kind === "gap") {
      const scope = section(root, reasons[node.reason]);
      scope.append(el("p", "", node.type + " → " + node.input));
      if (node.boundaryUnverified) scope.append(el("p", "", "Resource identity and authorization across the service boundary remain unverified."));
      if (node.candidates.length) dataSection(scope, "Candidate producer evidence", node.candidates);
    }
    if (node.binding) {
      const flow = section(root, "Typed handoff");
      flow.append(el("p", "", node.binding.type + " · " + node.binding.from + " → " + node.binding.to));
      flow.append(el("p", "", "Other required inputs, state and permissions still apply."));
    }
    if (node.policies) {
      const proof = section(root, "Local policy evidence");
      proof.append(el("p", "", "Contract checks covered this workflow. Live authorization and execution remain separate."));
      dataSection(proof, "Checked workflow", node.policies);
    }
    references(root, "Related capabilities", node.capabilities);
    references(root, "Services", node.services);
  }
  references(root, "Related findings", ["cluster", "service", "capability"].includes(node.kind)
    ? relatedTo(node.id).map(({ id }) => id) : []);
  return root;
}

function findings() {
  const isSearch = state.match !== null;
  $("findings-title").textContent = isSearch ? "Search results" : "Findings";
  const result = isSearch ? state.match.results.map(({ id }) => nodes.get(id)).filter(Boolean) : activeFindings();
  $("findings-subtitle").textContent = isSearch ? count(result.length, "result") + " for “" + state.goal + "”" :
    "Evidence across the catalog";
  const root = el("div");
  if (isSearch) {
    const toolbar = el("div", "map-toolbar");
    const clear = control("button quiet", "Clear search", () => {
      state.match = null;
      state.goal = null;
      $("goal").value = "";
      $("status").textContent = "";
      render();
      $("goal").focus();
    });
    toolbar.append(clear);
    root.append(toolbar);
  }
  if (!result.length) root.append(el("p", "empty", isSearch ? "No nodes matched this outcome and scope." : "No findings are visible in this layer."));
  for (const node of result) {
    const button = control("finding", undefined, () => select(node.id, true));
    button.dataset.nodeId = node.id;
    button.setAttribute("aria-pressed", String(node.id === state.selected));
    const label = el("span");
    label.append(el("strong", "", node.label), el("small", "", kindLabel[node.kind] +
      (node.description ? " · " + node.description : "")));
    button.append(label, pill(node.evidence));
    root.append(button);
  }
  return root;
}

function render() {
  if (!state.data) return;
  stage();
  $("inspect").replaceChildren(inspect());
  $("findings").replaceChildren(findings());
}

async function query(event) {
  event.preventDefault();
  if (!state.data || state.searching || !$("goal").value.trim()) return;
  state.searching = true;
  const submit = $("search").querySelector("button");
  submit.disabled = true;
  const goal = $("goal").value.trim();
  $("status").textContent = "";
  try {
    const response = await fetch("/api/query", { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ goal, kind: $("kind").value }) });
    if (!response.ok) throw Error("Search failed");
    state.match = await response.json();
    state.goal = goal;
    const first = state.match.results[0];
    if (first) select(first.id, false, false);
    else render();
    $("status").textContent = count(state.match.results.length, "result") + " found.";
  } catch {
    $("status").textContent = "Search could not be completed.";
  } finally {
    state.searching = false;
    submit.disabled = false;
  }
}

function hashNode() {
  try { return decodeURIComponent(location.hash.slice(1)); }
  catch { return null; }
}

async function start() {
  $("inspect-title").tabIndex = -1;
  $("search").addEventListener("submit", query);
  $("back").addEventListener("click", () => {
    state.scope = null;
    render();
    $("layer").focus();
  });
  $("layer").addEventListener("change", () => {
    state.layer = $("layer").value;
    render();
  });
  try {
    const response = await fetch("/api/map");
    if (!response.ok) throw Error("Catalog could not be loaded");
    state.data = await response.json();
    nodes = new Map([...state.data.clusters, ...state.data.services, ...state.data.capabilities, ...state.data.findings]
      .map((node) => [node.id, node]));
    metrics();
    const initial = hashNode();
    select(nodes.has(initial) ? initial : state.data.clusters[0]?.id, nodes.has(initial), false);
    window.addEventListener("hashchange", () => select(hashNode(), true, false));
  } catch {
    $("status").textContent = "The local catalog could not be loaded.";
  }
}

start();
