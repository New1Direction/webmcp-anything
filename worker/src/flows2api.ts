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

import { uiCss, uiNav } from "./ui";

// Developer landing for API Capture — with a live, in-browser demo.
export function captureLandingHtml(origin: string): string {
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>API Capture — turn any website's hidden API into agent tools | wmcp.sh</title>
<meta name="description" content="Most websites have no MCP server and no docs — just an internal REST API their app calls. API Capture observes that traffic and synthesizes an OpenAPI spec + agent-callable tools an AI can actually run. The third connection type." />
<link rel="canonical" href="${origin}/capture"/>
<meta property="og:title" content="API Capture — any website's hidden API → agent tools"/>
<meta property="og:description" content="Reverse-engineer any site's internal REST API into executable agent tools. No MCP server, no docs needed."/>
<style>${uiCss(840)}
  .steps{display:grid;gap:14px;grid-template-columns:repeat(3,1fr);margin:8px 0}
  @media(max-width:640px){.steps{grid-template-columns:1fr}}
  .stepc{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:16px 18px}
  .stepc .n{color:var(--accent2);font-weight:800;font-size:.78rem;letter-spacing:.06em}
  textarea{width:100%;min-height:150px;background:var(--bg2);border:1px solid var(--border);color:var(--text);border-radius:10px;padding:12px 14px;font-family:"SF Mono",Menlo,monospace;font-size:.8rem;line-height:1.5}
  pre.out{background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:14px;white-space:pre-wrap;word-break:break-word;font-family:"SF Mono",Menlo,monospace;font-size:.8rem;color:var(--green);min-height:40px;margin:12px 0 0}
</style></head><body>
${uiNav(origin)}
<div class="wrap" style="padding-top:26px">
  <nav class="crumbs"><a href="/connect">The MCP hub</a> <span class="sep">›</span> API Capture</nav>
  <header class="hero">
    <h1>Turn any website's hidden API into agent tools</h1>
    <p class="lede">Most sites have no MCP server, no WebMCP, no OpenAPI — just an internal REST API their own app calls. <b>API Capture</b> observes that traffic and synthesizes an OpenAPI spec + tools an AI agent can actually run. The third connection type, alongside MCP and WebMCP.</p>
    <div class="row"><a class="btn btn-primary" href="#demo">Try the live demo ↓</a><a class="btn btn-ghost" href="/connect">The MCP hub →</a></div>
  </header>

  <section>
    <h2>How it works</h2>
    <div class="steps">
      <div class="stepc"><div class="n">1 · OBSERVE</div><h3>Capture traffic</h3><p class="muted" style="margin:6px 0 0">The QuickCatch extension (opt-in, per-site) records a page's fetch/XHR calls — or POST them yourself.</p></div>
      <div class="stepc"><div class="n">2 · SYNTHESIZE</div><h3>Build the spec</h3><p class="muted" style="margin:6px 0 0">We collapse id-like paths into params, infer request/response schemas, and emit a clean OpenAPI 3 spec.</p></div>
      <div class="stepc"><div class="n">3 · EXECUTE</div><h3>Agent-callable</h3><p class="muted" style="margin:6px 0 0">Each operation becomes a tool an agent can call — wmcp runs the real upstream request.</p></div>
    </div>
  </section>

  <section id="demo">
    <h2>Live demo</h2>
    <p class="muted">Paste observed HTTP exchanges (or use the prefilled sample) and synthesize tools in your browser.</p>
    <textarea id="flows" spellcheck="false"></textarea>
    <div class="row" style="margin-top:10px"><button class="btn btn-primary" id="synth">⚙ Synthesize tools</button></div>
    <pre class="out" id="out">Tools appear here…</pre>
  </section>

  <section>
    <h2>Two ways to capture</h2>
    <div class="grid c2">
      <div class="card"><h3>Browser extension</h3><p class="muted" style="margin:6px 0 0">One click on any site — opt-in, current-tab only, auth fields redacted. <a href="/">Get QuickCatch</a>.</p></div>
      <div class="card"><h3>Developer API</h3><p class="muted" style="margin:6px 0 0">POST your captured exchanges directly:</p><pre class="snip" style="margin-top:8px">curl -X POST ${origin}/api/v1/flows \\
  -H "content-type: application/json" \\
  -d '{"flows":[{"method":"GET","url":"…"}]}'</pre></div>
    </div>
    <p class="muted" style="font-size:.9rem;margin-top:14px"><b>Synthesis is free</b> (read tier). <b>Executing</b> the captured tools against the real API is the paid tier — <a href="/dashboard">get a key</a>.</p>
  </section>

  <footer>
    <a href="/connect">The MCP hub</a> · <a href="/mcp/leaderboard">Leaderboard</a> · <a href="/webmcp">WebMCP</a> · <a href="/directory">Directory</a> · <a href="/">wmcp.sh</a>
  </footer>
</div>
<script>
(function(){
  var sample={flows:[
    {method:"GET",url:"https://shop.example.com/api/products?category=cards&limit=20",status:200,responseBody:{products:[{id:1,name:"Booster Box",price:159.99,in_stock:true}],total:42}},
    {method:"GET",url:"https://shop.example.com/api/products/123",status:200,responseBody:{id:123,name:"Elite Trainer Box",price:49.99}},
    {method:"POST",url:"https://shop.example.com/api/cart",status:201,requestBody:{product_id:123,qty:1},responseBody:{cart_id:"abc",items:1}}
  ]};
  var ta=document.getElementById('flows'); ta.value=JSON.stringify(sample,null,2);
  document.getElementById('synth').addEventListener('click',function(){
    var out=document.getElementById('out'); out.textContent='Synthesizing…';
    var body; try{ body=JSON.parse(ta.value); }catch(e){ out.textContent='Invalid JSON.'; return; }
    fetch('/api/v1/flows',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)})
      .then(function(r){return r.json();})
      .then(function(d){
        if(d.error){ out.textContent=d.error; return; }
        var lines=(d.tools||[]).map(function(t){return '• '+t.name+'  —  '+t.description;});
        out.textContent=d.stats.flows+' calls → '+d.stats.operations+' tools across '+d.stats.paths+' endpoints\\n\\n'+lines.join('\\n')+'\\n\\nAgent-callable spec:\\n'+(d.openapi_url||'');
      }).catch(function(e){ out.textContent=String(e); });
  });
})();
</script>
</body></html>`;
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
