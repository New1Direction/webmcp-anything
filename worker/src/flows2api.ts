// flows2api.ts — turn OBSERVED HTTP traffic into an OpenAPI spec → agent tools.
//
// The third leg of "any website → tools an agent can use": most sites publish no
// MCP server, no WebMCP, and no OpenAPI — but their SPA hits an internal REST API
// (the XHR/fetch calls). The extension captures those exchanges; this synthesizes
// an OpenAPI 3 spec from them (à la mitmproxy2swagger) and derives MCP tools. So we
// cover MCP + WebMCP + *undocumented* REST. This is the premium "API Capture" path.

interface Flow {
  method?: string;
  url: string;
  status?: number;
  requestBody?: any;
  responseBody?: any;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Collapse id-like path segments to {params} so /users/123 and /users/456 unify.
function templatePath(pathname: string): { template: string; params: string[] } {
  const segs = pathname.split("/").filter(Boolean);
  const params: string[] = [];
  const out = segs.map((s, i) => {
    const decoded = decodeURIComponent(s);
    const idish = /^\d+$/.test(decoded) || UUID.test(decoded) || /^[0-9a-f]{16,}$/i.test(decoded) || /^[A-Za-z0-9_-]{20,}$/.test(decoded);
    if (idish) {
      // name the param after the preceding collection segment ("users" → userId)
      const prev = i > 0 ? segs[i - 1].replace(/[^a-zA-Z0-9]/g, "") : "id";
      let name = prev ? `${prev.replace(/s$/, "")}Id` : "id";
      if (params.includes(name)) name = `${name}${params.length}`;
      params.push(name);
      return `{${name}}`;
    }
    return s;
  });
  return { template: "/" + out.join("/"), params };
}

function inferSchema(sample: any, depth = 0): any {
  if (depth > 5 || sample === null || sample === undefined) return {};
  if (Array.isArray(sample)) return { type: "array", items: sample.length ? inferSchema(sample[0], depth + 1) : {} };
  const t = typeof sample;
  if (t === "object") {
    const props: any = {};
    for (const k of Object.keys(sample).slice(0, 40)) props[k] = inferSchema(sample[k], depth + 1);
    return { type: "object", properties: props };
  }
  if (t === "number") return { type: Number.isInteger(sample) ? "integer" : "number" };
  if (t === "boolean") return { type: "boolean" };
  return { type: "string" };
}

function safeJson(v: any): any {
  if (v == null) return null;
  if (typeof v === "string") { try { return JSON.parse(v); } catch { return null; } }
  return v;
}

export interface SynthResult { openapi: any; tools: any[]; stats: { flows: number; operations: number; paths: number; hosts: string[] } }

export function synthesizeFromFlows(flows: Flow[], originHint?: string): SynthResult {
  // group by host → method+template
  const groups = new Map<string, { method: string; template: string; params: string[]; host: string; origin: string; query: Set<string>; reqBody: any; resBody: any }>();
  const hosts = new Set<string>();
  for (const f of flows) {
    if (!f?.url) continue;
    let u: URL;
    try { u = new URL(f.url); } catch { continue; }
    if (u.protocol !== "http:" && u.protocol !== "https:") continue;
    const method = (f.method || "GET").toUpperCase();
    const { template, params } = templatePath(u.pathname);
    hosts.add(u.host);
    const key = `${u.host} ${method} ${template}`;
    let g = groups.get(key);
    if (!g) { g = { method, template, params, host: u.host, origin: u.origin, query: new Set(), reqBody: undefined, resBody: undefined }; groups.set(key, g); }
    for (const k of u.searchParams.keys()) g.query.add(k);
    const rb = safeJson(f.requestBody); if (rb && g.reqBody === undefined) g.reqBody = rb;
    const sb = safeJson(f.responseBody); if (sb && (f.status === undefined || (f.status >= 200 && f.status < 300)) && g.resBody === undefined) g.resBody = sb;
  }

  const paths: any = {};
  const tools: any[] = [];
  let operations = 0;
  for (const g of groups.values()) {
    const parameters: any[] = [];
    for (const p of g.params) parameters.push({ name: p, in: "path", required: true, schema: { type: "string" } });
    for (const q of g.query) parameters.push({ name: q, in: "query", required: false, schema: { type: "string" } });
    const opId = `${g.method.toLowerCase()}_${g.template.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "")}`.slice(0, 60);
    const op: any = { operationId: opId, summary: `${g.method} ${g.template}`, parameters, responses: { "200": { description: "observed response", ...(g.resBody !== undefined ? { content: { "application/json": { schema: inferSchema(g.resBody) } } } : {}) } } };
    if (g.reqBody !== undefined && g.method !== "GET") op.requestBody = { content: { "application/json": { schema: inferSchema(g.reqBody) } } };
    paths[g.template] = paths[g.template] || {};
    paths[g.template][g.method.toLowerCase()] = op;
    operations++;

    // derive a tool (operationId matches the spec so it executes via the openapi adapter)
    const props: any = {};
    for (const pm of parameters) props[pm.name] = { type: pm.schema?.type || "string", description: `${pm.in} parameter` };
    if (op.requestBody) props.body = { type: "object", description: "JSON request body" };
    tools.push({ name: opId, description: `${g.method} ${g.origin}${g.template}`, inputSchema: { type: "object", properties: props, required: g.params } });
  }

  const host = hosts.values().next().value || (originHint ? new URL(originHint).host : "observed");
  const origin = originHint || (groups.size ? [...groups.values()][0].origin : `https://${host}`);
  const openapi = {
    openapi: "3.0.0",
    info: { title: `${host} API (observed)`, version: "0.0.0-observed", description: "Synthesized from observed HTTP traffic by wmcp.sh — unverified; reflects only the requests seen." },
    servers: [{ url: origin }],
    paths,
  };
  return { openapi, tools, stats: { flows: flows.length, operations, paths: Object.keys(paths).length, hosts: [...hosts] } };
}
