// /integration/remix — Remix / React Router 7 integration landing page.
// SERP target: "remix mcp", "add ai tools to remix", "remix claude integration",
// "remix agent api", "react router 7 mcp".

export function integrationRemixHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Remix / React Router 7 MCP Integration — Loaders &amp; Actions as Agent Tools | wmcp.sh</title>
<meta name="description" content="Expose Remix loaders and actions (now React Router 7) as MCP tools agents can call. Keep your handlers; wmcp.sh ingests an OpenAPI spec and emits the Model Context Protocol server." />
<link rel="canonical" href="${origin}/integration/remix" />
<meta property="og:title" content="Remix MCP Integration — Loaders &amp; Actions as Agent Tools" />
<meta property="og:description" content="Remix / React Router 7 loaders + actions to MCP tools via wmcp.sh. Spec-driven; no rewrite." />
<meta property="og:url" content="${origin}/integration/remix" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Remix MCP Integration" />
<meta name="twitter:description" content="loader/action → MCP tools without rewriting your handlers." />
<meta name="twitter:image" content="${origin}/og.png" />
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article","headline":"Remix / React Router 7 MCP Integration — Loaders and Actions as Agent Tools","description":"How to expose Remix loaders and actions as Model Context Protocol tools, including the React Router 7 migration nuance.","author":{"@type":"Organization","name":"WebMCP Anything"},"publisher":{"@type":"Organization","name":"WebMCP Anything","url":"https://wmcp.sh"},"datePublished":"2026-05-28","dateModified":"2026-05-28","mainEntityOfPage":"${origin}/integration/remix"}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
  {"@type":"Question","name":"Is Remix still a thing or is it React Router 7 now?","acceptedAnswer":{"@type":"Answer","text":"Remix has merged into React Router 7 — the framework features (loaders, actions, file-based routing, server bundles) are now shipped under the react-router package as 'React Router framework mode' or 'React Router v7'. Existing Remix v2 apps still work and have a documented migration path. For new projects, follow the React Router 7 docs. wmcp.sh treats both the same way: it ingests OpenAPI describing whichever URL serves your loader or action."}},
  {"@type":"Question","name":"Do loaders and actions both become MCP tools?","acceptedAnswer":{"@type":"Answer","text":"Yes — they're both server handlers reachable over HTTP. Loaders serve GET (idempotent reads). Actions serve POST/PUT/PATCH/DELETE (mutations). In your OpenAPI spec, describe the route paths and methods you want exposed. wmcp.sh generates an MCP tool per operation. Action handlers that accept FormData need a small JSON-accepting wrapper or content-type branching, since most MCP clients send JSON."}},
  {"@type":"Question","name":"How do resource routes fit in?","acceptedAnswer":{"@type":"Answer","text":"Resource routes (routes that export only loader/action without a default component) are the cleanest mapping to MCP tools — they already act like API endpoints. If you have UI routes that also expose loaders fetched as data, you can include those URLs in the OpenAPI spec too, but resource routes are the canonical shape."}},
  {"@type":"Question","name":"How do I generate an OpenAPI spec from Remix?","acceptedAnswer":{"@type":"Answer","text":"There's no first-party generator. Common patterns: (1) Use Zod schemas for loader/action inputs and outputs, then convert with @asteasolutions/zod-to-openapi at build time. (2) Hand-write a static openapi.json and serve it from a resource route. (3) Factor handlers into a Hono or tRPC sub-app and use its built-in generator."}},
  {"@type":"Question","name":"What about deployment — Vercel, Cloudflare, Node?",
    "acceptedAnswer":{"@type":"Answer","text":"All work. Remix / React Router 7 ships official adapters for Node, Cloudflare Workers/Pages, Vercel, AWS, and Deno. wmcp.sh proxies to whatever HTTPS URL your spec advertises, regardless of adapter."}}
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
  <div class="badge"><span class="dot"></span> integration &middot; Remix / RR7</div>
  <h1>Remix MCP integration.</h1>
  <p class="sub">Your Remix app already routes everything through <code>loader</code> + <code>action</code> handlers — the cleanest server primitives in any React framework. Here's how to expose them as MCP tools without breaking the model.</p>
  <p class="hint">wmcp.sh is not affiliated with Remix Software, Shopify, or Anthropic. Remix and React Router are open-source projects.</p>
</header>

<section id="wedge">
  <div class="section-label">Migration note</div>
  <h2>Remix is now React Router 7. Both work here.</h2>
  <p class="section-sub" style="max-width:760px">As of late 2024, Remix's framework features merged into React Router v7 — the new "framework mode" ships loaders, actions, file-based routing, and SSR under the <code>react-router</code> package. Existing Remix v2 apps still work and have a documented migration path. wmcp.sh treats both identically: it consumes the OpenAPI doc describing whichever URLs serve your loaders and actions.</p>
  <div class="wins-grid">
    <div class="wins-card">
      <h3>Remix v2 today</h3>
      <p style="color:var(--muted);margin:0 0 12px;font-size:.95rem;line-height:1.65">Routes export <code>loader</code> (GET) and <code>action</code> (mutations). Resource routes skip the default component to act as pure API endpoints.</p>
    </div>
    <div class="wins-card us">
      <h3>React Router 7 tomorrow</h3>
      <p style="color:var(--muted);margin:0 0 12px;font-size:.95rem;line-height:1.65">Same primitives, new package: <code>react-router</code> framework mode. Migration is mostly imports + config. MCP exposure model doesn't change.</p>
    </div>
  </div>
</section>

<section id="code">
  <div class="section-label">The wiring</div>
  <h2>A resource route, exposed as a tool.</h2>
  <p class="section-sub">Plain Remix v2; the OpenAPI bit is what wmcp.sh ingests.</p>
  <pre><code><span class="c">// app/routes/api.orders.$id.ts — Remix v2 resource route</span>
<span class="k">import</span> { json } <span class="k">from</span> <span class="s">'@remix-run/node'</span>;
<span class="k">import</span> <span class="k">type</span> { LoaderFunctionArgs, ActionFunctionArgs } <span class="k">from</span> <span class="s">'@remix-run/node'</span>;
<span class="k">import</span> { z } <span class="k">from</span> <span class="s">'zod'</span>;

<span class="k">export async function</span> <span class="k">loader</span>({ params }: LoaderFunctionArgs) {
  <span class="k">const</span> id = z.string().min(<span class="s">1</span>).<span class="k">parse</span>(params.id);
  <span class="k">const</span> order = <span class="k">await</span> <span class="k">getOrder</span>(id);
  <span class="k">if</span> (!order) <span class="k">throw</span> <span class="k">new</span> Response(<span class="s">'not found'</span>, { status: <span class="s">404</span> });
  <span class="k">return</span> <span class="k">json</span>(order);
}

<span class="k">export async function</span> <span class="k">action</span>({ request, params }: ActionFunctionArgs) {
  <span class="k">if</span> (request.method !== <span class="s">'PATCH'</span>) <span class="k">throw</span> <span class="k">new</span> Response(<span class="s">null</span>, { status: <span class="s">405</span> });
  <span class="k">const</span> body = z.object({ status: z.enum([<span class="s">'open'</span>, <span class="s">'paid'</span>, <span class="s">'shipped'</span>]) }).<span class="k">parse</span>(<span class="k">await</span> request.<span class="k">json</span>());
  <span class="k">const</span> id = z.string().<span class="k">parse</span>(params.id);
  <span class="k">return</span> <span class="k">json</span>(<span class="k">await</span> <span class="k">updateOrderStatus</span>(id, body.status));
}

<span class="c">// Publish OpenAPI at /api/openapi (hand-written or generated from Zod).
// Register: curl '${origin}/api/v1/tools?url=https://acme.example.com/api/openapi'</span></code></pre>
</section>

<section id="capabilities">
  <div class="section-label">Side-by-side</div>
  <h2>Hand-rolled MCP server vs wmcp.sh on Remix.</h2>
  <table>
    <thead>
      <tr><th>Capability</th><th>Hand-rolled</th><th>wmcp.sh + Remix OpenAPI</th></tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>loader + action mapped to MCP tools</strong></td>
        <td>⚠️ You write a tool-per-route bridge</td>
        <td class="ours">✅ Each operation in OpenAPI becomes one MCP tool automatically</td>
      </tr>
      <tr>
        <td><strong>FormData action handlers</strong></td>
        <td>⚠️ Manual JSON branching in every action</td>
        <td class="ours">✅ Wrapper pattern documented; spec it once</td>
      </tr>
      <tr>
        <td><strong>MCP transport (Streamable HTTP, SSE)</strong></td>
        <td>⚠️ You implement the spec server</td>
        <td class="ours">✅ Served at <code>${origin}/mcp/&lt;your-id&gt;</code></td>
      </tr>
      <tr>
        <td><strong>Adapter portability</strong></td>
        <td>⚠️ Tied to one runtime</td>
        <td class="ours">✅ Node, Cloudflare, Vercel, AWS, Deno — all work</td>
      </tr>
      <tr>
        <td><strong>React Router 7 migration</strong></td>
        <td>⚠️ Touches every tool definition</td>
        <td class="ours">✅ Update spec URL; rest is unchanged</td>
      </tr>
      <tr>
        <td><strong>Auth forwarding</strong></td>
        <td>⚠️ Per-handler middleware</td>
        <td class="ours">✅ Bearer / API-key / OAuth 2.1 declared in spec</td>
      </tr>
    </tbody>
  </table>
</section>

<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions from Remix &amp; React Router 7 teams.</h2>
  <details><summary>Is Remix dead?</summary><div class="answer">No — the framework features merged into React Router v7. Remix v2 apps still ship and have a clear migration path to React Router 7's framework mode. wmcp.sh treats both identically.</div></details>
  <details><summary>Do loaders and actions both become MCP tools?</summary><div class="answer">Yes. Loaders serve GET (reads). Actions serve mutations. In your OpenAPI spec, describe each route + method you want exposed and wmcp.sh emits one MCP tool per operation. FormData actions need a small JSON-accepting branch since most MCP clients send JSON.</div></details>
  <details><summary>What about resource routes?</summary><div class="answer">Resource routes (loader/action without a default component) are the cleanest MCP mapping — they already act like pure API endpoints. Mix UI routes in too if their loaders return data agents need.</div></details>
  <details><summary>How do I generate an OpenAPI spec?</summary><div class="answer">No first-party generator. Use Zod + <code>@asteasolutions/zod-to-openapi</code>, hand-write a static spec at a resource route, or factor handlers into a Hono / tRPC sub-app.</div></details>
  <details><summary>Deployment targets?</summary><div class="answer">All work. Node, Cloudflare Workers/Pages, Vercel, AWS, and Deno adapters all expose the same Request/Response shape. wmcp.sh proxies whatever URL the spec lists.</div></details>
  <details><summary>How does auth work?</summary><div class="answer">Bearer pass-through, OAuth 2.1 DCR proxy at <code>/mcp/&lt;provider&gt;</code>, or per-tool API keys declared in your spec's <code>securitySchemes</code>.</div></details>
</section>

<section id="related">
  <div class="section-label">Related integrations</div>
  <h2>Other frameworks.</h2>
  <p class="section-sub">
    <a href="/integration/nextjs" style="color:var(--accent2);text-decoration:none">/integration/nextjs</a> &middot;
    <a href="/integration/astro" style="color:var(--accent2);text-decoration:none">/integration/astro</a> &middot;
    <a href="/integration/svelte" style="color:var(--accent2);text-decoration:none">/integration/svelte</a> &middot;
    <a href="/integration/express" style="color:var(--accent2);text-decoration:none">/integration/express</a> &middot;
    <a href="/integration/openapi" style="color:var(--accent2);text-decoration:none">/integration/openapi</a> &middot;
    <a href="/agent-ready/api" style="color:var(--accent2);text-decoration:none">/agent-ready/api</a> &middot;
    <a href="/use-case/agent-commerce" style="color:var(--accent2);text-decoration:none">/use-case/agent-commerce</a>
  </p>
</section>

<section id="upgrade" style="margin-top:36px;background:linear-gradient(135deg,var(--card),rgba(124,92,255,0.08));border:1px solid rgba(124,92,255,0.35);border-radius:16px;padding:22px 26px">
  <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;justify-content:space-between">
    <div style="flex:1;min-width:240px">
      <div style="font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent2);font-weight:700;margin-bottom:6px">Need this done for you?</div>
      <h3 style="margin:0 0 4px;font-size:1.05rem;color:var(--text)">Skip the wiring — we ship the OpenAPI + MCP for your Remix or React Router 7 app.</h3>
      <p style="color:var(--muted);margin:0;font-size:.92rem">Audit your loaders + actions, emit a typed spec, deploy MCP at <code>mcp.yourbrand.com</code>. <strong style="color:var(--text)">Starter $499 one-time setup</strong>; Pro $999/mo for ongoing maintenance; Enterprise $4,999+/mo for SLA + private deploy.</p>
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
