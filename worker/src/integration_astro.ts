// /integration/astro — Astro integration landing page.
// SERP target: "astro mcp", "add ai tools to astro", "astro claude integration",
// "astro agent api", "astro endpoints model context protocol".

export function integrationAstroHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Astro MCP Integration — Turn Server Endpoints into Agent Tools | wmcp.sh</title>
<meta name="description" content="Expose Astro 5 server endpoints as MCP tools agents can call. Keep your .ts endpoint files, publish an OpenAPI doc, and wmcp.sh generates the Model Context Protocol server." />
<link rel="canonical" href="${origin}/integration/astro" />
<meta property="og:title" content="Astro MCP Integration — Server Endpoints as Agent Tools" />
<meta property="og:description" content="Astro 5 endpoints to MCP tools via wmcp.sh. No rewrite; we ingest your OpenAPI spec." />
<meta property="og:url" content="${origin}/integration/astro" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Astro MCP Integration" />
<meta name="twitter:description" content="Astro endpoints → MCP tools without rewriting your handlers." />
<meta name="twitter:image" content="${origin}/og.png" />
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article","headline":"Astro MCP Integration — Turn Server Endpoints into Agent Tools","description":"How to expose Astro 5 server endpoints as Model Context Protocol tools without rewriting them.","author":{"@type":"Organization","name":"WebMCP Anything"},"publisher":{"@type":"Organization","name":"WebMCP Anything","url":"https://wmcp.sh"},"datePublished":"2026-05-28","dateModified":"2026-05-28","mainEntityOfPage":"${origin}/integration/astro"}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
  {"@type":"Question","name":"Can Astro static sites expose MCP tools?","acceptedAnswer":{"@type":"Answer","text":"Only with a server adapter. Astro server endpoints (the .ts files under src/pages/api/) require output: 'server' or output: 'hybrid' in your astro.config.mjs, plus an adapter like @astrojs/node, @astrojs/cloudflare, or @astrojs/vercel. Static-only Astro sites have no runtime to call, so MCP tools require server-rendered endpoints."}},
  {"@type":"Question","name":"How do I produce an OpenAPI spec from Astro endpoints?","acceptedAnswer":{"@type":"Answer","text":"Astro doesn't ship an automatic OpenAPI generator the way FastAPI does. Three working paths today: (1) Hand-write a tiny openapi.yaml or openapi.json and serve it from src/pages/openapi.json.ts. (2) Use Zod schemas in your endpoints and a Zod-to-OpenAPI converter like @asteasolutions/zod-to-openapi at build time. (3) For larger APIs, factor route handlers into a tRPC or Hono sub-app that auto-generates a spec."}},
  {"@type":"Question","name":"Does this work with Astro's Cloudflare Pages adapter?","acceptedAnswer":{"@type":"Answer","text":"Yes. wmcp.sh itself runs on Cloudflare Workers; agent traffic hits the wmcp.sh edge, which then forwards to your Astro origin. The Astro server endpoint can run on Cloudflare Pages Functions, Workers, Node, Vercel — any adapter that responds to HTTPS works."}},
  {"@type":"Question","name":"What about Astro's experimental Actions?","acceptedAnswer":{"@type":"Answer","text":"Astro Actions (the typed RPC layer added in Astro 4.x and refined in 5.x) are great for first-party UI but they don't have stable public URLs by default. For MCP exposure, mirror the action logic in a regular server endpoint with a URL the OpenAPI spec can reference."}},
  {"@type":"Question","name":"Does wmcp.sh forward authentication to my Astro endpoint?","acceptedAnswer":{"@type":"Answer","text":"Yes. wmcp.sh forwards the Authorization header from the MCP client to your origin. For OAuth 2.1 with Dynamic Client Registration upstreams, the /mcp/<provider> proxy handles the full flow on behalf of MCP clients that can't drive OAuth themselves (e.g. Claude.ai connectors, Cursor remote MCP)."}}
]}
</script>
<style>
  :root { --bg:#07070d;--card:#16161f;--bg2:#11111c;--border:#26263a;--text:#ececf5;--muted:#8a8aa8;--dim:#6a6a88;--accent:#ff9e2c;--accent2:#ffcf7a;--green:#4ade80;--red:#f87171;--pink:#ffb86b;--gold:#fbbf24; }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin:0;min-height:100vh;color:var(--text);background:var(--bg);font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif;line-height:1.6;background-image:radial-gradient(ellipse 900px 600px at 10% -5%,rgba(255,158,44,.18),transparent 60%),radial-gradient(ellipse 700px 500px at 95% 10%,rgba(255,176,0,.10),transparent 60%); }
  .wrap { max-width: 920px; margin: 0 auto; padding: 0 24px; }
  nav { display:flex;justify-content:space-between;align-items:center;padding:22px 24px;max-width:1080px;margin:0 auto; }
  nav .brand { font-weight: 800; letter-spacing: -.02em; font-size: 1.05rem; }
  nav .brand span { color: var(--accent2); }
  nav .links { display: flex; gap: 22px; font-size: .9rem; }
  nav .links a { color: var(--muted); text-decoration: none; }
  nav .cta { background: var(--bg2); border: 1px solid var(--border); padding: 7px 14px; border-radius: 8px; font-size: .85rem; color: var(--text); text-decoration: none; font-weight: 600; }
  header.hero { padding: 50px 0 30px; }
  .badge { display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;font-size:.7rem;letter-spacing:.15em;text-transform:uppercase;font-weight:700;background:linear-gradient(90deg,rgba(255,158,44,.18),rgba(255,176,0,.18));border:1px solid rgba(255,158,44,.35);margin-bottom:18px; }
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
  td.ours { background: rgba(255,158,44,0.05); }
  details { background:var(--card);border:1px solid var(--border);border-radius:12px;padding:18px 20px;margin-bottom:12px; }
  details summary { font-weight: 700; font-size: 1rem; color: var(--text); cursor: pointer; list-style: none; }
  details[open] summary { margin-bottom: 12px; }
  details .answer { color: var(--muted); font-size: .92rem; line-height: 1.65; }
  .wins-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 18px; }
  @media (max-width: 720px) { .wins-grid { grid-template-columns: 1fr; } }
  .wins-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 22px; }
  .wins-card.us { border-color: var(--accent); background: linear-gradient(135deg, var(--card), rgba(255,158,44,0.06)); }
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
  <div class="badge"><span class="dot"></span> integration &middot; Astro</div>
  <h1>Astro MCP integration.</h1>
  <p class="sub">Your Astro 5 site already has server endpoints handling content, search, and form submissions — here's how to expose them as MCP tools an agent can call, without abandoning Astro's content-first model.</p>
  <p class="hint">wmcp.sh is not affiliated with The Astro Technology Company or Anthropic. Astro and Astro server endpoints are Astro project features.</p>
</header>

<section id="wedge">
  <div class="section-label">The gap</div>
  <h2>Astro endpoints are agent-callable. They just don't advertise it.</h2>
  <div class="wins-grid">
    <div class="wins-card">
      <h3>What you have today</h3>
      <p style="color:var(--muted);margin:0 0 12px;font-size:.95rem;line-height:1.65">Server endpoints under <code>src/pages/api/*.ts</code> exporting <code>GET</code> / <code>POST</code> handlers that take <code>Astro.request</code> and return a <code>Response</code>. They run under @astrojs/node, @astrojs/cloudflare, @astrojs/vercel, or another adapter.</p>
    </div>
    <div class="wins-card us">
      <h3>What agents need</h3>
      <p style="color:var(--muted);margin:0 0 12px;font-size:.95rem;line-height:1.65">A discoverable MCP server with tool schemas. wmcp.sh reads an OpenAPI 3 document describing your endpoints and emits the MCP server at <code>${origin}/mcp/&lt;your-id&gt;</code> — no Astro changes required.</p>
    </div>
  </div>
</section>

<section id="code">
  <div class="section-label">The wiring</div>
  <h2>An Astro endpoint, exposed as a tool.</h2>
  <p class="section-sub">Plain Astro 5; the OpenAPI bit is what wmcp.sh ingests.</p>
  <pre><code><span class="c">// src/pages/api/search.ts — Astro 5 server endpoint</span>
<span class="k">import</span> <span class="k">type</span> { APIRoute } <span class="k">from</span> <span class="s">'astro'</span>;
<span class="k">import</span> { z } <span class="k">from</span> <span class="s">'zod'</span>;

<span class="k">export const</span> prerender = <span class="s">false</span>;

<span class="k">const</span> Query = z.object({ q: z.string().min(<span class="s">2</span>), limit: z.number().int().max(<span class="s">50</span>).default(<span class="s">10</span>) });

<span class="k">export const</span> POST: APIRoute = <span class="k">async</span> ({ request }) =&gt; {
  <span class="k">const</span> input = Query.<span class="k">parse</span>(<span class="k">await</span> request.<span class="k">json</span>());
  <span class="k">const</span> results = <span class="k">await</span> <span class="k">searchContent</span>(input.q, input.limit);
  <span class="k">return</span> <span class="k">new</span> Response(JSON.<span class="k">stringify</span>({ q: input.q, results }), {
    headers: { <span class="s">'content-type'</span>: <span class="s">'application/json'</span> },
  });
};

<span class="c">// Publish OpenAPI at /openapi.json (hand-written, or generated from your Zod
// schemas with @asteasolutions/zod-to-openapi). Then point wmcp.sh at it.</span></code></pre>
  <p style="color:var(--muted);font-size:.92rem;margin-top:6px">Register the spec: <code>curl '${origin}/api/v1/tools?url=https://acme.example.com/openapi.json'</code>. Details at <a href="/integration/openapi" style="color:var(--accent2);text-decoration:none">/integration/openapi</a>.</p>
</section>

<section id="capabilities">
  <div class="section-label">Side-by-side</div>
  <h2>Roll-your-own MCP vs wmcp.sh on Astro.</h2>
  <table>
    <thead>
      <tr><th>Capability</th><th>Hand-rolled</th><th>wmcp.sh + Astro OpenAPI</th></tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Tool schemas</strong></td>
        <td>⚠️ Hand-write tools.ts, keep in sync with endpoint files</td>
        <td class="ours">✅ Generated from OpenAPI; one source of truth</td>
      </tr>
      <tr>
        <td><strong>SSE / Streamable HTTP transport</strong></td>
        <td>⚠️ You build it</td>
        <td class="ours">✅ Served at <code>${origin}/mcp/&lt;your-id&gt;</code> with full MCP spec</td>
      </tr>
      <tr>
        <td><strong>Static-site compatibility</strong></td>
        <td>❌ Needs a runtime</td>
        <td class="ours">⚠️ Still needs server endpoints — output: 'server' or 'hybrid'</td>
      </tr>
      <tr>
        <td><strong>Multi-adapter portability</strong></td>
        <td>⚠️ Tied to one adapter's runtime</td>
        <td class="ours">✅ wmcp.sh proxies any HTTPS origin — Node, CF Pages, Vercel</td>
      </tr>
      <tr>
        <td><strong>Auth forwarding</strong></td>
        <td>⚠️ Per-endpoint middleware</td>
        <td class="ours">✅ Bearer / API-key / OAuth 2.1 proxy</td>
      </tr>
      <tr>
        <td><strong>Spec drift detection</strong></td>
        <td>❌ Silent breakage</td>
        <td class="ours">✅ Re-ingest on deploy; mismatches surface immediately</td>
      </tr>
    </tbody>
  </table>
</section>

<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions from Astro teams.</h2>
  <details><summary>Can static Astro sites expose MCP tools?</summary><div class="answer">Not directly — there's no runtime to call. You need <code>output: 'server'</code> or <code>'hybrid'</code> in <code>astro.config.mjs</code> plus an adapter (Node, Cloudflare, Vercel). Static pages can still coexist; only endpoints need to be server-rendered.</div></details>
  <details><summary>How do I generate an OpenAPI spec from Astro endpoints?</summary><div class="answer">Astro has no built-in generator. Pick one: hand-write <code>src/pages/openapi.json.ts</code>, use <code>@asteasolutions/zod-to-openapi</code> at build time, or factor handlers into Hono / tRPC sub-apps with their own generators.</div></details>
  <details><summary>Does this work on Cloudflare Pages?</summary><div class="answer">Yes. wmcp.sh itself runs on Cloudflare Workers. Your Astro origin can run anywhere — Pages Functions, Workers, Node, Vercel, Netlify — as long as it answers HTTPS.</div></details>
  <details><summary>What about Astro Actions?</summary><div class="answer">Actions are a typed RPC layer for first-party UI. They don't have stable public URLs, so for MCP you mirror the action logic in a regular endpoint with a URL the OpenAPI spec references.</div></details>
  <details><summary>How does authentication work?</summary><div class="answer">Three patterns: bearer pass-through (wmcp.sh forwards <code>Authorization</code>), OAuth 2.1 DCR proxy at <code>/mcp/&lt;provider&gt;</code>, or per-tool API keys declared in your spec's <code>securitySchemes</code>.</div></details>
  <details><summary>Versions supported?</summary><div class="answer">The example targets Astro 5. Anything from Astro 3+ that ships server endpoints with the <code>APIRoute</code> shape works identically.</div></details>
</section>

<section id="related">
  <div class="section-label">Related integrations</div>
  <h2>Other frameworks.</h2>
  <p class="section-sub">
    <a href="/integration/nextjs" style="color:var(--accent2);text-decoration:none">/integration/nextjs</a> &middot;
    <a href="/integration/svelte" style="color:var(--accent2);text-decoration:none">/integration/svelte</a> &middot;
    <a href="/integration/remix" style="color:var(--accent2);text-decoration:none">/integration/remix</a> &middot;
    <a href="/integration/express" style="color:var(--accent2);text-decoration:none">/integration/express</a> &middot;
    <a href="/integration/openapi" style="color:var(--accent2);text-decoration:none">/integration/openapi</a> &middot;
    <a href="/agent-ready/saas" style="color:var(--accent2);text-decoration:none">/agent-ready/saas</a> &middot;
    <a href="/use-case/yield-watcher" style="color:var(--accent2);text-decoration:none">/use-case/yield-watcher</a>
  </p>
</section>

<section id="upgrade" style="margin-top:36px;background:linear-gradient(135deg,var(--card),rgba(255,158,44,0.08));border:1px solid rgba(255,158,44,0.35);border-radius:16px;padding:22px 26px">
  <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;justify-content:space-between">
    <div style="flex:1;min-width:240px">
      <div style="font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent2);font-weight:700;margin-bottom:6px">Need this done for you?</div>
      <h3 style="margin:0 0 4px;font-size:1.05rem;color:var(--text)">Skip the wiring — we ship the OpenAPI + MCP for your Astro site.</h3>
      <p style="color:var(--muted);margin:0;font-size:.92rem">Audit your endpoints, emit a typed spec, deploy MCP at <code>mcp.yourbrand.com</code>. <strong style="color:var(--text)">Starter $499 one-time setup</strong>; Managed Retainer $999/mo for ongoing maintenance; Enterprise $4,999+/mo for SLA + private deploy.</p>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <a href="/managed" style="display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#ff9e2c,#ffcf7a);color:#0c0c14;padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:700;font-size:.9rem">See /managed →</a>
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
