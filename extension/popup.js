// popup.js — one-click tool runner. No console needed.

const TOOL_META = {
  get_product:      { icon: "📦", label: "Get product info" },
  get_price:        { icon: "💰", label: "Get price" },
  check_stock:      { icon: "✅", label: "Check stock" },
  list_variants:    { icon: "🎨", label: "List variants" },
  add_to_cart:      { icon: "🛒", label: "Add to cart" },
  view_product:     { icon: "🔗", label: "Open product" },
  get_recipe:       { icon: "🍳", label: "Get recipe" },
  get_article:      { icon: "📰", label: "Get article" },
  get_title:        { icon: "🎬", label: "Get title info" },
  get_job:          { icon: "💼", label: "Get job posting" },
  get_event:        { icon: "🎟️", label: "Get event" },
  get_business:     { icon: "📍", label: "Get business" },
  get_organization: { icon: "🏢", label: "Get organization" },
  get_person:       { icon: "👤", label: "Get person" },
  get_info:         { icon: "ℹ️", label: "Get page info" },
  view_page:        { icon: "🔗", label: "Open page" },
};

let currentTab = null;
let currentTools = [];

async function load() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTab = tab;
  if (!tab) return render([]);

  try {
    document.getElementById("url-tag").textContent = new URL(tab.url).hostname;
  } catch {}

  initWatch(tab);
  initCapture(tab);

  const bg = await chrome.runtime.sendMessage({ type: "GET_TAB_TOOLS", tabId: tab.id });
  if (bg?.tools?.length) {
    currentTools = bg.tools;
    return render(bg.tools);
  }

  try {
    const cs = await chrome.tabs.sendMessage(tab.id, { type: "GET_TOOLS_FOR_PAGE" });
    currentTools = cs?.tools || [];
    render(currentTools, cs?.tools?.length ? null : "no tools detected");
  } catch {
    render([], "reload the page after installing the extension");
  }
}

function render(tools, errorMsg) {
  const main = document.getElementById("main");
  const dot = document.getElementById("dot");
  const status = document.getElementById("status-text");

  if (!tools.length) {
    dot.classList.remove("ok");
    status.textContent = "no tools";
    main.innerHTML = `
      <div class="empty">
        <strong>No tools on this page yet</strong>
        ${errorMsg ? `<div style="color:#f87171;margin-bottom:8px">${errorMsg}</div>` : ""}
        We currently support Shopify product pages.<br/>
        Try: <span style="color:var(--accent2)">allbirds.com/products/...</span>
      </div>`;
    return;
  }

  dot.classList.add("ok");
  status.textContent = `${tools.length} tools live`;

  const adapter = tools[0]?.action?.kind?.split("_")[0] || "auto";
  main.innerHTML =
    `<div class="adapter-tag">${escapeHtml(adapter)} adapter</div>` +
    tools.map((t, i) => toolCard(t, i)).join("");

  // Wire up run buttons
  document.querySelectorAll(".tool").forEach((el) => {
    const idx = parseInt(el.dataset.idx, 10);
    el.querySelector(".run-btn").addEventListener("click", () => runTool(idx));
  });
}

function toolCard(tool, idx) {
  const meta = TOOL_META[tool.name] || { icon: "🔧", label: tool.name };
  const inputs = buildInputs(tool.inputSchema, idx);
  return `
    <div class="tool" data-idx="${idx}">
      <div class="tool-head">
        <span class="icon">${meta.icon}</span>
        <div class="label">${escapeHtml(meta.label)}</div>
        <button class="run-btn">▶ Run</button>
      </div>
      <div class="desc">${escapeHtml(tool.description || "")}</div>
      ${inputs}
      <div class="result" id="result-${idx}"></div>
    </div>`;
}

function buildInputs(schema, idx) {
  if (!schema?.properties || !Object.keys(schema.properties).length) return "";
  const fields = Object.entries(schema.properties).map(([key, spec]) => {
    if (spec.enum && spec.enum.length) {
      return `
        <label>${escapeHtml(key)}
          <select data-input="${escapeHtml(key)}">
            <option value="">— any —</option>
            ${spec.enum.map((v) => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join("")}
          </select>
        </label>`;
    }
    const type = spec.type === "integer" || spec.type === "number" ? "number" : "text";
    const placeholder = spec.default !== undefined ? `default: ${spec.default}` : "";
    return `
      <label>${escapeHtml(key)}
        <input type="${type}" data-input="${escapeHtml(key)}" placeholder="${escapeHtml(placeholder)}" />
      </label>`;
  });
  return `<div class="inputs" data-idx="${idx}">${fields.join("")}</div>`;
}

async function runTool(idx) {
  const tool = currentTools[idx];
  if (!tool) return;
  const card = document.querySelector(`.tool[data-idx="${idx}"]`);
  const btn = card.querySelector(".run-btn");
  const resultEl = card.querySelector(".result");

  // Gather inputs
  const args = {};
  card.querySelectorAll("[data-input]").forEach((el) => {
    const key = el.dataset.input;
    const v = el.value?.trim();
    if (!v) return;
    const isNum = el.type === "number";
    args[key] = isNum ? Number(v) : v;
  });

  btn.disabled = true;
  btn.textContent = "…";
  resultEl.classList.remove("show", "error");

  try {
    let value;
    if (tool.result !== undefined) {
      value = tool.result;
    } else {
      const resp = await chrome.runtime.sendMessage({
        type: "EXECUTE_TOOL",
        action: tool.action,
        args,
        name: tool.name,
        url: currentTab?.url,
      });
      if (!resp?.ok) throw new Error(resp?.error || "unknown error");
      value = resp.value;
    }
    showResult(resultEl, value);
  } catch (err) {
    resultEl.classList.add("show", "error");
    resultEl.textContent = `❌ ${err.message || err}`;
  } finally {
    btn.disabled = false;
    btn.textContent = "▶ Run";
  }
}

function showResult(el, value) {
  el.classList.add("show");
  el.classList.remove("error");

  // Special UI for add_to_cart
  if (value && typeof value === "object" && value.checkout_url) {
    el.innerHTML = `
      <div style="color:var(--text);margin-bottom:6px">Added <strong>${escapeHtml(value.variant || "")}</strong> × ${value.quantity || 1}</div>
      <a class="cart-btn" href="${escapeHtml(value.checkout_url)}" target="_blank" rel="noopener">🛒 Open cart →</a>`;
    return;
  }

  // Pretty-print JSON
  if (typeof value === "object") {
    el.innerHTML = highlight(JSON.stringify(value, null, 2));
  } else {
    el.textContent = String(value);
  }
}

function highlight(json) {
  return escapeHtml(json)
    .replace(/&quot;([^&]+?)&quot;:/g, '<span class="key">"$1"</span>:')
    .replace(/: &quot;([^&]*?)&quot;/g, ': <span class="str">"$1"</span>');
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// "Watch this drop" control. Talks to the content script's watch engine.
async function initWatch(tab) {
  const btn = document.getElementById("watch-btn");
  const note = document.getElementById("watch-note");
  if (!btn) return;

  function renderWatch(st) {
    btn.classList.remove("on", "caught");
    if (st && st.caught) {
      btn.classList.add("caught");
      btn.textContent = "✓ Caught — check your cart";
      note.textContent = "It restocked and we added it to your cart.";
    } else if (st && st.watching) {
      btn.classList.add("on");
      btn.textContent = "👀 Watching… tap to stop";
      note.textContent = "Watching in the background. Close this tab if you want — just keep Chrome open.";
    } else {
      btn.textContent = "⚡ Watch this drop";
      note.textContent = "We watch it in the background and add it to your cart when it restocks. No need to keep the tab open — just keep Chrome running.";
    }
  }

  // Watch state lives in the background engine, keyed by URL.
  const url = tab.url, title = tab.title;
  async function refresh() {
    let st = null;
    try { st = await chrome.runtime.sendMessage({ type: "WATCH_STATUS", url }); } catch {}
    renderWatch(st);
  }

  btn.addEventListener("click", async () => {
    let st = null;
    try { st = await chrome.runtime.sendMessage({ type: "WATCH_STATUS", url }); } catch {}
    try {
      if (st && st.watching) await chrome.runtime.sendMessage({ type: "WATCH_STOP", url });
      else await chrome.runtime.sendMessage({ type: "WATCH_START", url, title });
    } catch {
      note.textContent = "Couldn't reach the watcher — reload the extension.";
      return;
    }
    refresh();
  });

  refresh();
}

// ---- API Capture: observe this tab's fetch/XHR → wmcp synthesizes OpenAPI tools.
// Injected into the page's MAIN world. Self-contained (executeScript serializes it),
// redacts auth-like fields, keeps only JSON bodies, buffers in-page until "Build".
function wmcpInstallCapture() {
  if (window.__wmcpCap) return "already";
  window.__wmcpCap = true;
  window.__wmcpFlows = [];
  var MAX = 400, BODY = 16000;
  var SECRET = /pass|token|secret|auth|cookie|api[_-]?key|bearer|session|ssn|\bcard\b|cvv|\botp\b|credential/i;
  function redact(v, d) {
    d = d || 0;
    if (d > 6 || v == null) return v;
    if (Array.isArray(v)) return v.slice(0, 50).map(function (x) { return redact(x, d + 1); });
    if (typeof v === "object") { var o = {}; for (var k in v) { if (!Object.prototype.hasOwnProperty.call(v, k)) continue; o[k] = SECRET.test(k) ? "[redacted]" : redact(v[k], d + 1); } return o; }
    return v;
  }
  function clean(text) { // keep only JSON bodies, redacted + truncated
    if (text == null) return undefined;
    try { return JSON.stringify(redact(JSON.parse(String(text).slice(0, BODY)))).slice(0, BODY); } catch (e) { return undefined; }
  }
  function cleanUrl(u) { try { var x = new URL(u, location.href); x.searchParams.forEach(function (val, key) { if (SECRET.test(key)) x.searchParams.set(key, "x"); }); return x.href; } catch (e) { return u; } }
  function looksApi(url, ct) { return /json/i.test(ct || "") || /\/api\/|\/v\d+\/|graphql|\.json(\?|$)/i.test(url); }
  function push(f) { if (window.__wmcpFlows.length < MAX) window.__wmcpFlows.push(f); }
  var of = window.fetch;
  if (of) window.fetch = function () {
    var args = arguments, req = args[0], init = args[1] || {};
    var url = (typeof req === "string" ? req : (req && req.url)) || "";
    var method = String(init.method || (typeof req === "object" && req && req.method) || "GET").toUpperCase();
    var reqBody = typeof init.body === "string" ? init.body : undefined;
    return of.apply(this, args).then(function (res) {
      try {
        var ct = res.headers.get("content-type") || "";
        if (looksApi(url, ct)) res.clone().text().then(function (t) { push({ method: method, url: cleanUrl(url), status: res.status, requestBody: clean(reqBody), responseBody: clean(t) }); }).catch(function () {});
      } catch (e) {}
      return res;
    });
  };
  var ox = XMLHttpRequest.prototype.open, os = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (m, u) { this.__wm = { method: String(m || "GET").toUpperCase(), url: u }; return ox.apply(this, arguments); };
  XMLHttpRequest.prototype.send = function (body) {
    var xhr = this;
    try {
      xhr.addEventListener("load", function () {
        try {
          var ct = xhr.getResponseHeader("content-type") || "";
          if (xhr.__wm && looksApi(xhr.__wm.url, ct)) push({ method: xhr.__wm.method, url: cleanUrl(xhr.__wm.url), status: xhr.status, requestBody: clean(typeof body === "string" ? body : undefined), responseBody: clean(xhr.responseText) });
        } catch (e) {}
      });
    } catch (e) {}
    return os.apply(this, arguments);
  };
  return "installed";
}

async function initCapture(tab) {
  const capBtn = document.getElementById("cap-btn");
  const buildBtn = document.getElementById("cap-build");
  const note = document.getElementById("cap-note");
  const result = document.getElementById("cap-result");
  const countEl = document.getElementById("cap-count");
  if (!capBtn || !tab) return;
  if (!/^https?:/.test(tab.url || "")) { capBtn.disabled = true; capBtn.style.opacity = ".5"; note.textContent = "Open a website to capture its API."; return; }

  async function read(fn) {
    try { const [res] = await chrome.scripting.executeScript({ target: { tabId: tab.id }, world: "MAIN", func: fn }); return res ? res.result : null; }
    catch (e) { return undefined; }
  }
  async function refreshCount() {
    const n = await read(function () { return (typeof window.__wmcpCap === "undefined") ? null : (window.__wmcpFlows || []).length; });
    if (typeof n === "number") { buildBtn.style.display = "block"; countEl.textContent = n; capBtn.textContent = "🎯 Capturing — interact with the site"; capBtn.style.background = "#2a1500"; capBtn.style.color = "var(--accent2)"; }
  }

  capBtn.addEventListener("click", async () => {
    const r = await read(wmcpInstallCapture);
    if (r === undefined) { note.textContent = "Couldn't start capture on this page."; return; }
    note.textContent = "Capturing this tab's API calls. Browse/click around the site, then hit Build. Nothing is sent until you do.";
    refreshCount();
  });

  buildBtn.addEventListener("click", async () => {
    buildBtn.disabled = true; buildBtn.textContent = "⚙ Building…";
    try {
      const flows = await read(function () { return window.__wmcpFlows || []; });
      if (!flows || !flows.length) { result.className = "result show error"; result.textContent = "No API calls captured yet — interact with the site first."; return; }
      let origin = ""; try { origin = new URL(tab.url).origin; } catch (e) {}
      const resp = await fetch("https://wmcp.sh/api/v1/flows", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ flows: flows, origin: origin }) });
      const d = await resp.json();
      if (!resp.ok) throw new Error(d.error || "failed");
      const tools = d.tools || [];
      result.className = "result show";
      result.innerHTML = "<b style=\"color:var(--accent2)\">" + tools.length + " tools</b> from " + d.stats.flows + " calls · " + d.stats.paths + " endpoints<br>" + tools.slice(0, 12).map(function (t) { return "• " + escapeHtml(t.name); }).join("<br>") + (tools.length > 12 ? "<br>…" : "");
    } catch (e) {
      result.className = "result show error"; result.textContent = "❌ " + (e.message || e);
    } finally { buildBtn.disabled = false; buildBtn.textContent = "⚙ Build agent tools"; }
  });

  refreshCount();
}

load();
