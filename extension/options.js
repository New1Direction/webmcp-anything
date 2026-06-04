const DEFAULTS = {
  pushToCache: false,
  endpoint: "https://wmcp.sh",
  apiKey: "",
  qc_license: "",
};

async function load() {
  const s = { ...DEFAULTS, ...(await chrome.storage.local.get(Object.keys(DEFAULTS))) };
  document.getElementById("push").checked = !!s.pushToCache;
  document.getElementById("endpoint").value = s.endpoint;
  document.getElementById("apikey").value = s.apiKey;
  document.getElementById("qclicense").value = s.qc_license || "";
  document.getElementById("dashlink").href = (s.endpoint || DEFAULTS.endpoint) + "/dashboard";
  // Reflect current entitlement without re-typing the key.
  if (s.qc_license) {
    try { const r = await chrome.runtime.sendMessage({ type: "QC_LICENSE_STATUS" }); showQc(r && r.active); } catch {}
  }
}

function showQc(active) {
  const el = document.getElementById("qc-status");
  el.classList.add("show");
  el.style.color = active ? "var(--green)" : "#ff5470";
  el.textContent = active ? "✓ Active — auto-cart + unlimited watches on" : "Not active — check the key or your subscription";
}

async function activateQc() {
  const key = document.getElementById("qclicense").value.trim();
  const btn = document.getElementById("qc-activate");
  btn.disabled = true; const orig = btn.textContent; btn.textContent = "Checking…";
  try {
    const r = await chrome.runtime.sendMessage({ type: "QC_SET_LICENSE", key });
    showQc(!!(r && r.active));
  } catch {
    showQc(false);
  } finally { btn.disabled = false; btn.textContent = orig; }
}

async function save() {
  const settings = {
    pushToCache: document.getElementById("push").checked,
    endpoint: document.getElementById("endpoint").value.trim().replace(/\/$/, "") || DEFAULTS.endpoint,
    apiKey: document.getElementById("apikey").value.trim(),
    qc_license: document.getElementById("qclicense").value.trim(),
  };
  await chrome.storage.local.set(settings);
  const s = document.getElementById("status");
  s.classList.add("show");
  setTimeout(() => s.classList.remove("show"), 1500);
  document.getElementById("dashlink").href = settings.endpoint + "/dashboard";
}

document.getElementById("save").addEventListener("click", save);
document.getElementById("qc-activate").addEventListener("click", activateQc);
document.getElementById("endpoint").addEventListener("input", (e) => {
  document.getElementById("dashlink").href = (e.target.value || DEFAULTS.endpoint) + "/dashboard";
});
load();
