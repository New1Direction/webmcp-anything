const DEFAULTS = {
  pushToCache: false,
  endpoint: "https://wmcp.sh",
  apiKey: "",
};

async function load() {
  const s = { ...DEFAULTS, ...(await chrome.storage.local.get(Object.keys(DEFAULTS))) };
  document.getElementById("push").checked = !!s.pushToCache;
  document.getElementById("endpoint").value = s.endpoint;
  document.getElementById("apikey").value = s.apiKey;
  document.getElementById("dashlink").href = (s.endpoint || DEFAULTS.endpoint) + "/dashboard";
}

async function save() {
  const settings = {
    pushToCache: document.getElementById("push").checked,
    endpoint: document.getElementById("endpoint").value.trim().replace(/\/$/, "") || DEFAULTS.endpoint,
    apiKey: document.getElementById("apikey").value.trim(),
  };
  await chrome.storage.local.set(settings);
  const s = document.getElementById("status");
  s.classList.add("show");
  setTimeout(() => s.classList.remove("show"), 1500);
  document.getElementById("dashlink").href = settings.endpoint + "/dashboard";
}

document.getElementById("save").addEventListener("click", save);
document.getElementById("endpoint").addEventListener("input", (e) => {
  document.getElementById("dashlink").href = (e.target.value || DEFAULTS.endpoint) + "/dashboard";
});
load();
