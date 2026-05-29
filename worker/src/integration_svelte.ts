// /integration/svelte — SvelteKit integration landing page.
// SERP target: "sveltekit mcp", "add ai tools to sveltekit", "svelte claude integration",
// "svelte agent api", "sveltekit model context protocol".

export function integrationSvelteHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>SvelteKit MCP Integration — Turn +server.ts Routes into Agent Tools | wmcp.sh</title>
<meta name="description" content="Expose SvelteKit 2 +server.ts route handlers and form actions as MCP tools agents can call. Keep your handlers; wmcp.sh ingests your OpenAPI spec and emits the MCP server." />
<link rel="canonical" href="${origin}/integration/svelte" />
<meta property="og:title" content="SvelteKit MCP Integration — +server.ts as Agent Tools" />
<meta property="og:description" content="SvelteKit 2 routes to MCP tools via wmcp.sh. No rewrite; spec-driven." />
<meta property="og:url" content="${origin}/integration/svelte" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="SvelteKit MCP Integration" />
<meta name="twitter:description" content="+server.ts → MCP tools without rewriting your routes." />
<meta name="twitter:image" content="${origin}/og.png" />
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article","headline":"SvelteKit MCP Integration — Turn +server.ts Routes into Agent Tools","description":"How to expose SvelteKit 2 +server.ts handlers and form actions as Model Context Protocol tools without rewriting them.","author":{"@type":"Organization","name":"WebMCP Anything"},"publisher":{"@type":"Organization","name":"WebMCP Anything","url":"https://wmcp.sh"},"datePublished":"2026-05-28","dateModified":"2026-05-28","mainEntityOfPage":"${origin}/integration/svelte"}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
  {"@type":"Question","name":"Do form actions become MCP tools too?","acceptedAnswer":{"@type":"Answer","text":"Form actions are server-side functions invoked via POST from progressively-enhanced forms — they work over HTTP, but the input shape is FormData rather than JSON. To expose them cleanly as MCP tools, wrap each action in a sibling +server.ts handler that accepts JSON and calls the same underlying function. The action keeps serving your UI; the +server.ts handler serves agents."}},
  {"@type":"Question","name":"Which SvelteKit adapter should I use?","acceptedAnswer":{"@type":"Answer","text":"Any of them. wmcp.sh proxies to whatever URL your OpenAPI spec advertises. SvelteKit's adapter-node, adapter-cloudflare, adapter-vercel, and adapter-netlify all serve the same Request/Response handler shape, so your +server.ts code runs identically. Pick the adapter that fits your hosting; wmcp.sh doesn't care."}},
  {"@type":"Question","name":"How do I generate an OpenAPI spec from SvelteKit routes?","acceptedAnswer":{"@type":"Answer","text":"SvelteKit has no built-in generator. Common approaches: (1) Hand-write a static spec at src/routes/openapi.json/+server.ts. (2) Use Zod schemas in your handlers and convert them with @asteasolutions/zod-to-openapi at build time. (3) For complex APIs, factor handlers into a Hono sub-app mounted under SvelteKit, which auto-emits a spec."}},
  {"@type":"Question","name":"Does CSRF protection break agent calls?","acceptedAnswer":{"@type":"Answer","text":"SvelteKit's built-in CSRF protection blocks cross-origin POSTs with non-form content types by default. For agent traffic, either (a) disable the check for specific routes via the handle hook, (b) move agent-callable handlers to a path the CSRF check skips, or (c) configure wmcp.sh to forward an Origin header matching your domain. Production-grade auth should still gate the endpoint."}},
  {"@type":"Question","name":"Can I use SvelteKit's load functions as MCP read-only tools?","acceptedAnswer":{"@type":"Answer","text":"Not directly. Load functions return data to pages/layouts, not standalone HTTP responses. For read-only MCP tools, mirror the load logic in a GET handler in +server.ts and reference both from the page and your OpenAPI spec."}}
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
  <div class="badge"><span class="dot"></span> integration &middot; SvelteKit</div>
  <h1>SvelteKit MCP integration.</h1>
  <p class="sub">Your SvelteKit 2 app already has <code>+server.ts</code> routes and form actions handling JSON traffic; here's how to expose them as MCP tools an agent can call, without writing a parallel API layer.</p>
  <p class="hint">wmcp.sh is not affiliated with the Svelte project or Anthropic. SvelteKit and +server.ts are Svelte project features.</p>
</header>

<section id="wedge">
  <div class="section-label">The gap</div>
  <h2>Your +server.ts routes already answer JSON. They just don't ship a schema.</h2>
  <div class="wins-grid">
    <div class="wins-card">
      <h3>What you have today</h3>
      <p style="color:var(--muted);margin:0 0 12px;font-size:.95rem;line-height:1.65">Route files at <code>src/routes/**/+server.ts</code> exporting <code>GET</code> / <code>POST</code> / <code>PATCH</code> handlers, plus form actions at <code>+page.server.ts</code>. Running under adapter-node, adapter-cloudflare, adapter-vercel, or adapter-netlify.</p>
    </div>
    <div class="wins-card us">
      <h3>What agents need</h3>
      <p style="color:var(--muted);margin:0 0 12px;font-size:.95rem;line-height:1.65">A Model Context Protocol server with typed tool schemas. wmcp.sh reads an OpenAPI 3 document describing your routes and emits the MCP server at <code>${origin}/mcp/&lt;your-id&gt;</code>.</p>
    </div>
  </div>
</section>

<section id="code">
  <div class="section-label">The wiring</div>
  <h2>A +server.ts route, exposed as a tool.</h2>
  <p class="section-sub">Plain SvelteKit 2; the OpenAPI bit is what wmcp.sh ingests.</p>
  <pre><code><span class="c">// src/routes/api/inventory/+server.ts — SvelteKit 2</span>
<span class="k">import</span> { json, error } <span class="k">from</span> <span class="s">'@sveltejs/kit'</span>;
<span class="k">import</span> { z } <span class="k">from</span> <span class="s">'zod'</span>;
<span class="k">import</span> <span class="k">type</span> { RequestHandler } <span class="k">from</span> <span class="s">'./$types'</span>;

<span class="k">const</span> Body = z.object({
  sku: z.string().min(<span class="s">1</span>),
  warehouse: z.string().optional(),
});

<span class="k">export const</span> POST: RequestHandler = <span class="k">async</span> ({ request }) =&gt; {
  <span class="k">const</span> parsed = Body.<span class="k">safeParse</span>(<span class="k">await</span> request.<span class="k">json</span>());
  <span class="k">if</span> (!parsed.success) <span class="k">throw</span> <span class="k">error</span>(<span class="s">400</span>, <span class="s">'invalid body'</span>);
  <span class="k">const</span> { sku, warehouse } = parsed.data;
  <span class="k">const</span> row = <span class="k">await</span> <span class="k">lookupInventory</span>(sku, warehouse);
  <span class="k">return</span> <span class="k">json</span>({ sku, warehouse: warehouse ?? <span class="s">'default'</span>, on_hand: row.qty });
};

<span class="c">// Publish OpenAPI at /openapi.json (hand-written or generated from Zod).
// Register: curl '${origin}/api/v1/tools?url=https://acme.example.com/openapi.json'</span></code></pre>
</section>

<section id="capabilities">
  <div class="section-label">Side-by-side</div>
  <h2>Hand-rolled MCP server vs wmcp.sh on SvelteKit.</h2>
  <table>
    <thead>
      <tr><th>Capability</th><th>Hand-rolled</th><th>wmcp.sh + SvelteKit OpenAPI</th></tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Tool schemas in sync with routes</strong></td>
        <td>⚠️ Manual; drifts on every refactor</td>
        <td class="ours">✅ Spec is source of truth; one re-ingest on deploy</td>
      </tr>
      <tr>
        <td><strong>Form actions exposed</strong></td>
        <td>⚠️ Possible via FormData → JSON wrapper</td>
        <td class="ours">✅ Same wrapper; spec it once, agents see it</td>
      </tr>
      <tr>
        <td><strong>SSE / Streamable HTTP transport</strong></td>
        <td>⚠️ You build it on top of +server.ts</td>
        <td class="ours">✅ MCP transport served at <code>${origin}/mcp/&lt;your-id&gt;</code></td>
      </tr>
      <tr>
        <td><strong>Multi-adapter portability</strong></td>
        <td>⚠️ Tied to one runtime</td>
        <td class="ours">✅ wmcp.sh proxies any HTTPS origin</td>
      </tr>
      <tr>
        <td><strong>CSRF handling</strong></td>
        <td>⚠️ You configure handle hooks per route</td>
        <td class="ours">✅ Configurable per-spec; or wmcp.sh forwards a matching Origin</td>
      </tr>
      <tr>
        <td><strong>Per-tool auth</strong></td>
        <td>⚠️ Custom middleware</td>
        <td class="ours">✅ Bearer / API-key / OAuth 2.1 declared in securitySchemes</td>
      </tr>
    </tbody>
  </table>
</section>

<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions from SvelteKit teams.</h2>
  <details><summary>Do form actions become MCP tools?</summary><div class="answer">Form actions accept FormData, not JSON. Wrap each action in a sibling +server.ts JSON handler that calls the same underlying function. The action keeps serving your UI; the +server.ts version serves agents.</div></details>
  <details><summary>Which adapter should I use?</summary><div class="answer">Any. wmcp.sh proxies to whatever URL your OpenAPI spec advertises. adapter-node, adapter-cloudflare, adapter-vercel, and adapter-netlify all work identically.</div></details>
  <details><summary>How do I generate the OpenAPI spec?</summary><div class="answer">SvelteKit has no built-in generator. Hand-write a small spec at <code>src/routes/openapi.json/+server.ts</code>, convert your Zod schemas with <code>@asteasolutions/zod-to-openapi</code>, or factor handlers into a Hono sub-app and use its generator.</div></details>
  <details><summary>Does SvelteKit's CSRF protection block agent traffic?</summary><div class="answer">It can. SvelteKit blocks cross-origin POSTs with non-form content types by default. Either disable for specific paths in your handle hook, route agent traffic through a path that's exempt, or have wmcp.sh forward a matching Origin header. Always keep production auth on the endpoint.</div></details>
  <details><summary>Can I use load functions as MCP read-only tools?</summary><div class="answer">No — load functions return data to pages, not standalone responses. Mirror the load logic in a +server.ts GET handler and let the page import the same underlying function.</div></details>
  <details><summary>Versions supported?</summary><div class="answer">Example targets SvelteKit 2. SvelteKit 1.x with the same <code>+server.ts</code> RequestHandler shape works identically.</div></details>
</section>

<section id="related">
  <div class="section-label">Related integrations</div>
  <h2>Other frameworks.</h2>
  <p class="section-sub">
    <a href="/integration/nextjs" style="color:var(--accent2);text-decoration:none">/integration/nextjs</a> &middot;
    <a href="/integration/astro" style="color:var(--accent2);text-decoration:none">/integration/astro</a> &middot;
    <a href="/integration/remix" style="color:var(--accent2);text-decoration:none">/integration/remix</a> &middot;
    <a href="/integration/express" style="color:var(--accent2);text-decoration:none">/integration/express</a> &middot;
    <a href="/integration/openapi" style="color:var(--accent2);text-decoration:none">/integration/openapi</a> &middot;
    <a href="/agent-ready/api" style="color:var(--accent2);text-decoration:none">/agent-ready/api</a> &middot;
    <a href="/use-case/agent-commerce" style="color:var(--accent2);text-decoration:none">/use-case/agent-commerce</a>
  </p>
</section>

<section id="upgrade" style="margin-top:36px;background:linear-gradient(135deg,var(--card),rgba(255,158,44,0.08));border:1px solid rgba(255,158,44,0.35);border-radius:16px;padding:22px 26px">
  <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;justify-content:space-between">
    <div style="flex:1;min-width:240px">
      <div style="font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent2);font-weight:700;margin-bottom:6px">Need this done for you?</div>
      <h3 style="margin:0 0 4px;font-size:1.05rem;color:var(--text)">Skip the wiring — we ship the OpenAPI + MCP for your SvelteKit app.</h3>
      <p style="color:var(--muted);margin:0;font-size:.92rem">Audit your +server.ts routes, emit a typed spec, deploy MCP at <code>mcp.yourbrand.com</code>. <strong style="color:var(--text)">Starter $499 one-time setup</strong>; Managed Retainer $999/mo for ongoing maintenance; Enterprise $4,999+/mo for SLA + private deploy.</p>
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
