const guides = [
  {
    id: "declarative-api",
    topic: "forms",
    title: "Declare tools in HTML",
    summary: "Generate a tool schema from native form controls.",
    url: "https://developer.chrome.com/docs/ai/webmcp/declarative-api",
  },
  {
    id: "imperative-api",
    topic: "javascript",
    title: "Register tools with JavaScript",
    summary: "Define a tool callback and describe its structured output.",
    url: "https://developer.chrome.com/docs/ai/webmcp/imperative-api",
  },
  {
    id: "doctor",
    topic: "testing",
    title: "Check browser tool contracts in CI",
    summary: "Record a baseline and catch contract drift on preview builds.",
    url: "https://github.com/New1Direction/webmcp-anything/blob/main/docs/WEBMCP_DOCTOR.md",
  },
];

const form = document.getElementById("guide-search");
const list = document.getElementById("guide-results");
const status = document.getElementById("result-status");

function search(topic, query) {
  const keyword = query.trim().toLowerCase();
  const matches = guides.filter((guide) =>
    (topic === "all" || guide.topic === topic) &&
    `${guide.title} ${guide.summary}`.toLowerCase().includes(keyword));
  list.replaceChildren(...matches.map(({ id, title, summary, url }) => {
    const item = document.createElement("li");
    item.className = "guide";
    item.dataset.guide = id;
    const link = document.createElement("a");
    link.href = url;
    link.textContent = title;
    const detail = document.createElement("p");
    detail.textContent = summary;
    item.append(link, detail);
    return item;
  }));
  status.textContent = `${matches.length} ${matches.length === 1 ? "guide" : "guides"} found`;
  return { topic, query: query.trim(), guideIds: matches.map(({ id }) => id) };
}

let result = search("all", "");
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const fields = new FormData(form);
  result = search(String(fields.get("topic") ?? "all"), String(fields.get("query") ?? ""));
  if (event.agentInvoked) event.respondWith(Promise.resolve(result));
});

const modelContext = document.modelContext;
if (typeof modelContext?.registerTool === "function") {
  const ready = modelContext.registerTool({
    name: "get_guide_results",
    description: "Read the active search and matching guide identifiers.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    outputSchema: {
      type: "object",
      properties: {
        topic: { type: "string" },
        query: { type: "string" },
        guideIds: { type: "array", items: { type: "string" } },
      },
      required: ["topic", "query", "guideIds"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
    execute: () => result,
  });
  modelContext.waitForToolsUntil?.(ready);
  Promise.resolve(ready).catch((error) => console.error("Could not register get_guide_results:", error));
}
