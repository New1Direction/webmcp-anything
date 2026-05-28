// /integration/express — Express integration landing page.
// SERP target: "express mcp", "add ai tools to express", "express claude integration",
// "express agent api", "express openapi mcp", "swagger-jsdoc mcp".

export function integrationExpressHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Express MCP Integration — Route Handlers as Agent Tools | wmcp.sh</title>
<meta name="description" content="Expose Express route handlers as MCP tools agents can call. Generate OpenAPI with swagger-jsdoc or zod-to-openapi, point wmcp.sh at the spec, ship a Model Context Protocol server." />
<link rel="canonical" href="${origin}/integration/express" />
<meta property="og:title" content="Express MCP Integration — Routes as Agent Tools" />
<meta property="og:description" content="Express + OpenAPI + wmcp.sh = MCP server. No rewrite; spec-driven." />
<meta property="og:url" content="${origin}/integration/express" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Express MCP Integration" />
<meta name="twitter:description" content="Express routes → MCP tools, no rewriting." />
<meta name="twitter:image" content="${origin}/og.png" />
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article","headline":"Express MCP Integration — Route Handlers as Agent Tools","description":"How to expose Express route handlers as Model Context Protocol tools using swagger-jsdoc or @asteasolutions/zod-to-openapi.","author":{"@type":"Organization","name":"WebMCP Anything"},"publisher":{"@type":"Organization","name":"WebMCP Anything","url":"https://wmcp.sh"},"datePublished":"2026-05-28","dateModified":"2026-05-28","mainEntityOfPage":"${origin}/integration/express"}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
  {"@type":"Question","name":"Express has no built-in OpenAPI. What are my options?","acceptedAnswer":{"@type":"Answer","text":"Three solid paths today: (1) swagger-jsdoc — annotate route handlers with JSDoc @openapi blocks; the build assembles them into a spec. (2) @asteasolutions/zod-to-openapi — define Zod schemas for inputs and outputs, then convert them; recommended if your codebase is TypeScript-first. (3) express-openapi-validator — write the OpenAPI spec by hand, then attach it as request-validation middleware so the spec and runtime stay in sync. wmcp.sh ingests any of them."}},
  {"@type":"Question","name":"Node version?","acceptedAnswer":{"@type":"Answer","text":"Node 22 LTS is the recommended target — it ships native fetch, ESM by default in many configs, and the most stable AbortController behavior. Node 20 LTS works identically. Express 4.x and 5.x both work; the example uses Express 4 because it's still the more common production version, but Express 5 (released GA in 2024) has identical route handler shape."}},
  {"@type":"Question","name":"How does authentication flow through?","acceptedAnswer":{"@type":"Answer","text":"Declare your auth scheme in the OpenAPI spec under securitySchemes — bearerAuth, apiKey, oauth2 are all standard. wmcp.sh reads it and forwards credentials. For OAuth 2.1 with Dynamic Client Registration upstreams, the /mcp/<provider> proxy handles the full flow on behalf of MCP clients that can't drive it themselves. Common Express middleware (passport-jwt, express-jwt, helmet) is unaffected."}},
  {"@type":"Question","name":"What about Fastify, Koa, Hapi, or Hono?","acceptedAnswer":{"@type":"Answer","text":"All work the same way — wmcp.sh consumes OpenAPI, not framework-specific shapes. Fastify ships an official OpenAPI plugin (@fastify/swagger). Hono has @hono/zod-openapi. Koa works with koa-swagger. The integration model is identical: emit a spec, point wmcp.sh at it. Pick whichever Node framework you prefer; the MCP exposure path doesn't change."}},
  {"@type":"Question","name":"Can I gate which Express routes become MCP tools?","acceptedAnswer":{"@type":"Answer","text":"Yes. In your OpenAPI spec, tag each operation; the agent-callable ones get a 'agent' tag. Pass &tag=agent to wmcp.sh's ingest URL. Internal admin routes that aren't in the spec stay invisible to MCP clients."}}
]}
</script>
<style>
  :root { --bg:#07070d;--card:#16161f;--bg2:#11111c;--border:#26263a;--text:#ececf5;--muted:#8a8aa8;--dim:#6a6a88;--accent:#7c5cff;--accent2:#00e5ff;--green:#4ade80;--red:#f87171;--pink:#f0abfc;--gold:#fbbf24; }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin:0;min-height:100vh;color:var(--text);background:var(--bg);font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif;line-height:1.6;background-image:radial-gradient(ellipse 900px 600px at 10% -5%,rgba(124,92,255,.18),transparent 60%),radial-gradient(ellipse 700px 500px at 95% 10%,rgba(0,229,255,.10),transparent 60%); }
  .wrap { max-width: 920px; margin: 0 auto; padding: 0 24px; }
  nav { display:flex;justify-content:space-between;align-items:center;padding:22px 24px;max-width:1080px;margin:0 auto; }
  nav .brand { font-weight: 800; letter-spacing: -.02em; font-size: 1.05rem; }
  nav .brand span { color: var(--accent2); }
  nav .links { display: flex; gap: 22px; font-size: .9rem; }
  nav .links a { color: var(--muted); text-decoration: none; }
  nav .cta { background: var(--bg2); border: 1px solid var(--border); padding: 7px 14px; border-radius: 8px; font-size: .85rem; color: var(--text); text-decoration: none; font-weight: 600; }
  header.hero { padding: 50px 0 30px; }
  .badge { display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;font-size:.7rem;letter-spacing:.15em;text-transform:uppercase;font-weight:700;background:linear-gradient(90deg,rgba(124,92,255,.18),rgba(0,229,255,.18));border:1px solid rgba(124,92,255,.35);margin-bottom:18px; }
  .dot { width:6px;height:6px;background:var(--accent2);border-radius:50%;box-shadow:0 0 8px var(--accent2); }
  h1 { font-size:clamp(2.1rem,4.8vw,3.2rem);margin:0 0 18px;background:linear-gradient(135deg,#fff 30%,var(--accent2) 100%);-webkit-background-clip:text;background-clip:text;color:transparent;line-height:1.05;font-weight:800;letter-spacing:-.025em; }
  .sub { color: var(--muted); font-size: 1.05rem; max-width: 700px; margin: 0 0 24px; }
  .hint { color: var(--dim); font-size: .85rem; margin-top: 8px; }
  section { padding: 36px 0; }
  .section-label { display:inline-block;font-size:.72rem;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--accent2);margin-bottom:10px; }
  h2 { font-size:clamp(1.4rem,3vw,1.9rem);margin:0 0 12px;font-weight:700;letter-spacing:-.02em; }
  h3 { font-size:1.1rem;margin:0 0 8px;font-weight:700; }
  .section-sub { color: var(--muted); max-width: 640px; margin: 0 0 24px; }
  pre { background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px 18px;overflow-x:auto;font-size:.82rem;color:var(--green);font-family:"SF Mono",Menlo,monospace;line-height:1.5;margin:14px 0; }
  pre .k { color: var(--accent2); } pre .s { color: var(--pink); } pre .c { color: var(--dim); }
  code { font-family: "SF Mono", Menlo, monospace; background: var(--bg2); padding: 1px 6px; border-radius: 4px; font-size: .85em; }
  table { width: 100%; border-collapse: collapse; text-align: left; font-size: .9rem; margin-top: 16px; }
  th, td { padding: 14px 16px; border-bottom: 1px solid var(--border); vertical-align: top; }
  th { background: var(--bg2); font-weight: 700; color: var(--accent2); }
  tr:last-child td { border-bottom: none; }
  td strong { color: var(--text); }
  td.ours { background: rgba(124,92,255,0.05); }
  details { background:var(--card);border:1px solid var(--border);border-radius:12px;padding:18px 20px;margin-bottom:12px; }
  details summary { font-weight: 700; font-size: 1rem; color: var(--text); cursor: pointer; list-style: none; }
  details[open] summary { margin-bottom: 12px; }
  details .answer { color: var(--muted); font-size: .92rem; line-height: 1.65; }
  .wins-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 18px; }
  @media (max-width: 720px) { .wins-grid { grid-template-columns: 1fr; } }
  .wins-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 22px; }
  .wins-card.us { border-color: var(--accent); background: linear-gradient(135deg, var(--card), rgba(124,92,255,0.06)); }
  .wins-card h3 { color: var(--text); margin-bottom: 12px; }
  .wins-card.us h3 { color: var(--accent2); }
  .wins-card ul { color: var(--muted); padding-left: 20px; margin: 0; font-size: .92rem; line-height: 1.7; }
  .wins-card li { margin-bottom: 6px; }
  footer { border-top:1px solid var(--border);margin-top:40px;padding:30px 0;text-align:center;color:var(--muted);font-size:.85rem; }
  footer a { color: var(--accent2); text-decoration: none; margin: 0 8px; }
</style>
</head>
<body>

<nav>
  <div class="brand"><a href="/" style="color:inherit;text-decoration:none">wmcp<span>.sh</span></a></div>
  <div class="links">
    <a href="/agent-ready">Agent-ready</a>
    <a href="/managed">Done for you</a>
    <a href="/integration/openapi">OpenAPI</a>
    <a href="/directory">Directory</a>
    <a href="/blog">Blog</a>
  </div>
  <a class="cta" href="/dashboard">Dashboard →</a>
</nav>

<div class="wrap">

<header class="hero">
  <div class="badge"><span class="dot"></span> integration &middot; Express</div>
  <h1>Express MCP integration.</h1>
  <p class="sub">Your Express app already handles JSON traffic across <code>app.get</code> / <code>app.post</code> / <code>router.use</code>; here's how to expose those routes as MCP tools an agent can call — without trading Express for a "modern" framework.</p>
  <p class="hint">wmcp.sh is not affiliated with the OpenJS Foundation or Anthropic. Express, swagger-jsdoc, and zod-to-openapi are open-source projects.</p>
</header>

<section id="wedge">
  <div class="section-label">The gap</div>
  <h2>Express has no built-in OpenAPI. Pick a generator; we handle the rest.</h2>
  <div class="wins-grid">
    <div class="wins-card">
      <h3>What you have today</h3>
      <p style="color:var(--muted);margin:0 0 12px;font-size:.95rem;line-height:1.65">Express 4 or 5 with route handlers, middleware (helmet, cors, express-jwt), and either JSDoc or Zod schemas inside the handlers. Running on Node 20 or 22 LTS.</p>
    </div>
    <div class="wins-card us">
      <h3>What agents need</h3>
      <p style="color:var(--muted);margin:0 0 12px;font-size:.95rem;line-height:1.65">A Model Context Protocol server with typed tool schemas. wmcp.sh consumes OpenAPI 3 from <code>swagger-jsdoc</code>, <code>@asteasolutions/zod-to-openapi</code>, or a hand-written spec — and emits MCP at <code>${origin}/mcp/&lt;your-id&gt;</code>.</p>
    </div>
  </div>
</section>

<section id="code">
  <div class="section-label">The wiring</div>
  <h2>An Express route, exposed as a tool.</h2>
  <p class="section-sub">TypeScript Express + Zod + @asteasolutions/zod-to-openapi. Node 22.</p>
  <pre><code><span class="c">// server.ts — Express 4 + Zod, Node 22 LTS</span>
<span class="k">import</span> express, { Request, Response } <span class="k">from</span> <span class="s">'express'</span>;
<span class="k">import</span> { z } <span class="k">from</span> <span class="s">'zod'</span>;
<span class="k">import</span> { OpenAPIRegistry, OpenApiGeneratorV3 } <span class="k">from</span> <span class="s">'@asteasolutions/zod-to-openapi'</span>;

<span class="k">const</span> app = <span class="k">express</span>();
app.<span class="k">use</span>(express.<span class="k">json</span>());
<span class="k">const</span> registry = <span class="k">new</span> OpenAPIRegistry();

<span class="k">const</span> CreateOrder = z.object({
  sku: z.string().min(<span class="s">1</span>),
  qty: z.number().int().positive(),
});

registry.<span class="k">registerPath</span>({
  method: <span class="s">'post'</span>, path: <span class="s">'/orders'</span>, tags: [<span class="s">'agent'</span>],
  request: { body: { content: { <span class="s">'application/json'</span>: { schema: CreateOrder } } } },
  responses: { <span class="s">201</span>: { description: <span class="s">'created'</span> } },
});

app.<span class="k">post</span>(<span class="s">'/orders'</span>, <span class="k">async</span> (req: Request, res: Response) =&gt; {
  <span class="k">const</span> body = CreateOrder.<span class="k">parse</span>(req.body);
  <span class="k">const</span> order = <span class="k">await</span> <span class="k">createOrder</span>(body);
  res.<span class="k">status</span>(<span class="s">201</span>).<span class="k">json</span>(order);
});

<span class="k">const</span> spec = <span class="k">new</span> <span class="k">OpenApiGeneratorV3</span>(registry.definitions).<span class="k">generateDocument</span>({
  openapi: <span class="s">'3.0.0'</span>, info: { title: <span class="s">'Acme Inventory'</span>, version: <span class="s">'1.0.0'</span> },
});
app.<span class="k">get</span>(<span class="s">'/openapi.json'</span>, (_req, res) =&gt; res.<span class="k">json</span>(spec));
app.<span class="k">listen</span>(<span class="s">3000</span>);

<span class="c">// curl '${origin}/api/v1/tools?url=https://acme.example.com/openapi.json&amp;tag=agent'</span></code></pre>
</section>

<section id="capabilities">
  <div class="section-label">Side-by-side</div>
  <h2>Hand-rolled MCP server vs wmcp.sh on Express.</h2>
  <table>
    <thead>
      <tr><th>Capability</th><th>Hand-rolled</th><th>wmcp.sh + OpenAPI</th></tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Spec generator choice</strong></td>
        <td>⚠️ N/A; you redo schemas</td>
        <td class="ours">✅ swagger-jsdoc, zod-to-openapi, or hand-written — all ingestible</td>
      </tr>
      <tr>
        <td><strong>Existing middleware preserved</strong></td>
        <td>⚠️ Re-implement at MCP layer</td>
        <td class="ours">✅ helmet, cors, express-jwt, passport — all still run on the origin</td>
      </tr>
      <tr>
        <td><strong>MCP transport (Streamable HTTP, SSE)</strong></td>
        <td>⚠️ You build it</td>
        <td class="ours">✅ Served at <code>${origin}/mcp/&lt;your-id&gt;</code></td>
      </tr>
      <tr>
        <td><strong>Auth forwarding</strong></td>
        <td>⚠️ Per-route adapter</td>
        <td class="ours">✅ Bearer / API-key / OAuth 2.1 declared in spec</td>
      </tr>
      <tr>
        <td><strong>Per-route gating</strong></td>
        <td>⚠️ Manual allowlist</td>
        <td class="ours">✅ Tag operations; <code>&amp;tag=agent</code> at ingest</td>
      </tr>
      <tr>
        <td><strong>Spec drift detection</strong></td>
        <td>❌ Silent</td>
        <td class="ours">✅ Re-ingest in CI; mismatches surface immediately</td>
      </tr>
    </tbody>
  </table>
</section>

<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions from Node / Express teams.</h2>
  <details><summary>Express has no built-in OpenAPI — what should I use?</summary><div class="answer">Three solid paths: (1) <code>swagger-jsdoc</code> for JSDoc-annotated routes. (2) <code>@asteasolutions/zod-to-openapi</code> for TypeScript-first codebases — recommended. (3) <code>express-openapi-validator</code> if you'd rather hand-write the spec and validate at runtime. wmcp.sh ingests all three.</div></details>
  <details><summary>Node and Express versions?</summary><div class="answer">Node 22 LTS recommended; Node 20 LTS works. Express 4.x and 5.x both work — same route-handler shape.</div></details>
  <details><summary>How does auth flow through?</summary><div class="answer">Declare <code>securitySchemes</code> in the spec — bearerAuth, apiKey, or oauth2. wmcp.sh forwards credentials. Common middleware (passport-jwt, express-jwt, helmet) is unaffected because it runs on your origin.</div></details>
  <details><summary>Fastify, Koa, Hono, Hapi?</summary><div class="answer">All work the same way. <code>@fastify/swagger</code>, <code>koa-swagger</code>, <code>@hono/zod-openapi</code> — emit a spec, point wmcp.sh at it. Pick the framework you prefer; MCP exposure is identical.</div></details>
  <details><summary>Can I gate routes?</summary><div class="answer">Yes. Tag agent-callable operations in the spec and pass <code>&amp;tag=agent</code> at ingest. Untagged or undescribed routes stay invisible.</div></details>
  <details><summary>What about CommonJS vs ESM?</summary><div class="answer">Either works on the origin — wmcp.sh only talks HTTP. The example is ESM-style imports but CJS Express apps emit identical OpenAPI specs.</div></details>
</section>

<section id="related">
  <div class="section-label">Related integrations</div>
  <h2>Other frameworks.</h2>
  <p class="section-sub">
    <a href="/integration/fastapi" style="color:var(--accent2);text-decoration:none">/integration/fastapi</a> &middot;
    <a href="/integration/nextjs" style="color:var(--accent2);text-decoration:none">/integration/nextjs</a> &middot;
    <a href="/integration/django" style="color:var(--accent2);text-decoration:none">/integration/django</a> &middot;
    <a href="/integration/rails" style="color:var(--accent2);text-decoration:none">/integration/rails</a> &middot;
    <a href="/integration/openapi" style="color:var(--accent2);text-decoration:none">/integration/openapi</a> &middot;
    <a href="/agent-ready/api" style="color:var(--accent2);text-decoration:none">/agent-ready/api</a> &middot;
    <a href="/use-case/agent-commerce" style="color:var(--accent2);text-decoration:none">/use-case/agent-commerce</a>
  </p>
</section>

<section id="upgrade" style="margin-top:36px;background:linear-gradient(135deg,var(--card),rgba(124,92,255,0.08));border:1px solid rgba(124,92,255,0.35);border-radius:16px;padding:22px 26px">
  <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;justify-content:space-between">
    <div style="flex:1;min-width:240px">
      <div style="font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent2);font-weight:700;margin-bottom:6px">Need this done for you?</div>
      <h3 style="margin:0 0 4px;font-size:1.05rem;color:var(--text)">Skip the wiring — we ship the OpenAPI + MCP for your Express app.</h3>
      <p style="color:var(--muted);margin:0;font-size:.92rem">Audit your routes, wire up swagger-jsdoc or zod-to-openapi, deploy MCP at <code>mcp.yourbrand.com</code>. <strong style="color:var(--text)">Starter $499 one-time setup</strong>; Pro $999/mo for ongoing maintenance; Enterprise $4,999+/mo for SLA + private deploy.</p>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <a href="/managed" style="display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#7c5cff,#00e5ff);color:#0c0c14;padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:700;font-size:.9rem">See /managed →</a>
      <a href="/directory/submit" style="display:inline-flex;align-items:center;gap:6px;background:#11111c;border:1px solid #26263a;color:var(--text);padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:600;font-size:.9rem">Submit (free)</a>
    </div>
  </div>
</section>

</div>

<footer>
  <a href="/">Home</a> · <a href="/agent-ready">Agent-ready</a> · <a href="/managed">Done for you</a> · <a href="/integration/openapi">OpenAPI</a> · <a href="/directory">Directory</a> · <a href="/directory/submit">Submit</a> · <a href="/blog">Blog</a> · <a href="https://github.com/New1Direction/webmcp-anything">GitHub</a>
</footer>

</body>
</html>`;
}
