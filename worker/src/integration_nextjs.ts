// /integration/nextjs — Next.js integration landing page.
// SERP target: "nextjs mcp", "add ai tools to nextjs", "nextjs claude integration",
// "nextjs agent api", "next.js model context protocol".

export function integrationNextjsHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Next.js MCP Integration — Expose Route Handlers as Agent Tools | wmcp.sh</title>
<meta name="description" content="Turn Next.js 15 App Router API routes into MCP tools agents can call. Keep your existing handlers, get an OpenAPI spec + MCP server in one wmcp.sh request — no rewrite." />
<link rel="canonical" href="${origin}/integration/nextjs" />
<meta property="og:title" content="Next.js MCP Integration — Route Handlers as Agent Tools" />
<meta property="og:description" content="Expose Next.js 15 App Router API routes as MCP tools via wmcp.sh. Keep your handlers; we ingest the OpenAPI spec." />
<meta property="og:url" content="${origin}/integration/nextjs" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Next.js MCP Integration" />
<meta name="twitter:description" content="Route Handlers → MCP tools without rewriting your Next.js app." />
<meta name="twitter:image" content="${origin}/og.png" />
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article","headline":"Next.js MCP Integration — Expose Route Handlers as Agent Tools","description":"How to turn Next.js 15 App Router API routes into Model Context Protocol tools without rewriting your handlers.","author":{"@type":"Organization","name":"WebMCP Anything"},"publisher":{"@type":"Organization","name":"WebMCP Anything","url":"https://wmcp.sh"},"datePublished":"2026-05-28","dateModified":"2026-05-28","mainEntityOfPage":"${origin}/integration/nextjs"}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
  {"@type":"Question","name":"Do I need to rewrite my Next.js API routes to expose them as MCP tools?","acceptedAnswer":{"@type":"Answer","text":"No. wmcp.sh ingests an OpenAPI 3 spec describing your Route Handlers and generates MCP tool definitions automatically. Your existing GET/POST/PATCH handlers in app/api/**/route.ts stay untouched. The only required change is to publish an OpenAPI document at a public URL — most teams generate this with next-rest-framework or by hand-writing a tiny static spec."}},
  {"@type":"Question","name":"Does this work with Next.js App Router and Edge Runtime?","acceptedAnswer":{"@type":"Answer","text":"Yes. wmcp.sh is transport-agnostic at the spec level — it doesn't care whether your handler runs on Node, the Vercel Edge Runtime, or as a static export with a separate API backend. As long as the handler responds at the URL in the OpenAPI spec, MCP clients can invoke it via the wmcp.sh proxy."}},
  {"@type":"Question","name":"How do I authenticate agent traffic into my Next.js app?","acceptedAnswer":{"@type":"Answer","text":"Three patterns work today: (1) Pass-through bearer tokens — wmcp.sh forwards the Authorization header from the MCP client to your handler. (2) OAuth proxy via /mcp/<provider> — if your app uses OAuth 2.1 with Dynamic Client Registration, wmcp.sh can act as a transparent proxy for MCP clients that can't drive OAuth flows themselves. (3) Per-tool API keys — declare them as securitySchemes in your OpenAPI spec and wmcp.sh prompts the agent at registration time."}},
  {"@type":"Question","name":"Can wmcp.sh call server actions or only Route Handlers?","acceptedAnswer":{"@type":"Answer","text":"Server actions are RPC over POST, but they don't have a stable public URL or schema — they're an internal Next.js mechanism. For MCP exposure, wrap the same business logic in a Route Handler with a stable path and typed inputs. The function body can be one line that calls the existing server action."}},
  {"@type":"Question","name":"What about rate limiting and cost control?","acceptedAnswer":{"@type":"Answer","text":"wmcp.sh applies its own per-token rate limits at the edge before traffic reaches your origin. For finer control, return standard 429 responses from your Route Handler with Retry-After headers and wmcp.sh surfaces them to the calling agent as MCP error responses."}}
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
  <div class="badge"><span class="dot"></span> integration &middot; Next.js</div>
  <h1>Next.js MCP integration.</h1>
  <p class="sub">Your Next.js 15 app already has API routes; here's how to expose them as MCP tools without rewriting a single handler. Publish an OpenAPI spec, point wmcp.sh at it, and any MCP-compatible agent (Claude Desktop, Cursor, Codex) gets typed tools.</p>
  <p class="hint">wmcp.sh is not affiliated with Vercel or Anthropic. App Router and Route Handlers are Next.js features.</p>
</header>

<section id="wedge">
  <div class="section-label">The gap</div>
  <h2>You have the API. You don't have the MCP server.</h2>
  <div class="wins-grid">
    <div class="wins-card">
      <h3>What you have today</h3>
      <p style="color:var(--muted);margin:0 0 12px;font-size:.95rem;line-height:1.65">Route Handlers under <code>app/api/**/route.ts</code> serving your web app, with typed inputs (Zod, valibot, or hand-rolled), Vercel deployment, and probably some Zod-to-OpenAPI generator emitting a spec.</p>
    </div>
    <div class="wins-card us">
      <h3>What agents need</h3>
      <p style="color:var(--muted);margin:0 0 12px;font-size:.95rem;line-height:1.65">A Model Context Protocol server exposing each route as a tool with JSON Schema inputs and structured outputs. wmcp.sh generates it from your existing OpenAPI doc — no new handler, no new framework.</p>
    </div>
  </div>
</section>

<section id="code">
  <div class="section-label">The wiring</div>
  <h2>One Route Handler, exposed as a tool.</h2>
  <p class="section-sub">A real, runnable example. The handler is plain Next.js 15; the OpenAPI bit is what wmcp.sh ingests.</p>
  <pre><code><span class="c">// app/api/quotes/route.ts — Next.js 15 App Router</span>
<span class="k">import</span> { NextResponse } <span class="k">from</span> <span class="s">'next/server'</span>;
<span class="k">import</span> { z } <span class="k">from</span> <span class="s">'zod'</span>;

<span class="k">export const</span> runtime = <span class="s">'edge'</span>;

<span class="k">const</span> QuoteInput = z.object({
  symbol: z.string().min(<span class="s">1</span>).max(<span class="s">12</span>),
  size: z.number().positive(),
});

<span class="k">export async function</span> <span class="k">POST</span>(req: Request) {
  <span class="k">const</span> body = QuoteInput.<span class="k">parse</span>(<span class="k">await</span> req.<span class="k">json</span>());
  <span class="k">const</span> mid = <span class="k">await</span> <span class="k">fetchMid</span>(body.symbol);
  <span class="k">return</span> NextResponse.<span class="k">json</span>({
    symbol: body.symbol,
    bid: mid * <span class="s">0.999</span>,
    ask: mid * <span class="s">1.001</span>,
    size: body.size,
    issued_at: <span class="k">new</span> Date().<span class="k">toISOString</span>(),
  });
}

<span class="c">// Publish OpenAPI at /api/openapi (next-rest-framework, zod-to-openapi, or hand-rolled).
// Then point wmcp.sh at https://acme.example.com/api/openapi and every route
// becomes an MCP tool the agent can call.</span></code></pre>
  <p style="color:var(--muted);font-size:.92rem;margin-top:6px">Once the spec is live, register it once: <code>curl '${origin}/api/v1/tools?url=https://acme.example.com/api/openapi'</code>. See <a href="/integration/openapi" style="color:var(--accent2);text-decoration:none">/integration/openapi</a> for the full spec-ingest contract.</p>
</section>

<section id="capabilities">
  <div class="section-label">Side-by-side</div>
  <h2>Hand-rolled MCP server vs wmcp.sh ingest.</h2>
  <table>
    <thead>
      <tr><th>Capability</th><th>Hand-rolled MCP server</th><th>wmcp.sh + Next.js OpenAPI</th></tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Tool schema generation</strong></td>
        <td>⚠️ You write a tools.ts and keep it in sync with Route Handlers</td>
        <td class="ours">✅ Auto-generated from the OpenAPI spec your build already emits</td>
      </tr>
      <tr>
        <td><strong>Streamable HTTP transport</strong></td>
        <td>⚠️ You implement the MCP spec server yourself</td>
        <td class="ours">✅ Served at <code>${origin}/mcp/&lt;your-id&gt;</code> with SSE + HTTP fallback</td>
      </tr>
      <tr>
        <td><strong>Authentication forwarding</strong></td>
        <td>⚠️ Custom middleware in every Route Handler</td>
        <td class="ours">✅ Bearer / OAuth 2.1 / API-key passthrough configured per spec</td>
      </tr>
      <tr>
        <td><strong>Edge Runtime support</strong></td>
        <td>✅ Yes, if you keep the MCP server edge-compatible</td>
        <td class="ours">✅ wmcp.sh runs on Cloudflare Workers; your origin can be Edge or Node</td>
      </tr>
      <tr>
        <td><strong>Per-tool rate limit</strong></td>
        <td>⚠️ Manual</td>
        <td class="ours">✅ Token-bucket per MCP client at the proxy edge</td>
      </tr>
      <tr>
        <td><strong>Spec drift detection</strong></td>
        <td>❌ Silent breakage when handler diverges from tools.ts</td>
        <td class="ours">✅ Spec is the source of truth; re-ingest on deploy</td>
      </tr>
    </tbody>
  </table>
</section>

<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions from Next.js teams.</h2>
  <details><summary>Do I need to rewrite my Route Handlers?</summary><div class="answer">No. Your <code>app/api/**/route.ts</code> files stay as-is. wmcp.sh consumes an OpenAPI document describing them and generates MCP tool definitions. Most teams generate the spec with a Zod-to-OpenAPI library or hand-write a small static file.</div></details>
  <details><summary>Does this work with Edge Runtime and Vercel?</summary><div class="answer">Yes. The wmcp.sh proxy doesn't care whether your origin runs on the Vercel Edge Runtime, Node, or a static export with a separate backend. If the URL responds, MCP clients can call it.</div></details>
  <details><summary>How does authentication work?</summary><div class="answer">Three patterns: pass-through bearer (wmcp.sh forwards <code>Authorization</code>), OAuth 2.1 proxy at <code>/mcp/&lt;provider&gt;</code> for DCR-compliant origins, or per-tool API keys declared in your spec's <code>securitySchemes</code>.</div></details>
  <details><summary>What about Server Actions?</summary><div class="answer">Server Actions are RPC over POST without a stable public URL or schema. For MCP exposure, wrap the same logic in a Route Handler with a typed input. The handler can be one line that calls the action.</div></details>
  <details><summary>Can I gate which routes become tools?</summary><div class="answer">Yes — tag operations in your OpenAPI spec and pass <code>&amp;tag=public</code> to the ingest URL. Untagged or excluded operations stay invisible to MCP clients.</div></details>
  <details><summary>What versions of Next.js are supported?</summary><div class="answer">Next 13.4+ App Router works the same way (Route Handlers shipped GA in 13.4). The example targets Next 15 because that's current. Pages Router API routes work too if you can publish an OpenAPI spec for them.</div></details>
</section>

<section id="related">
  <div class="section-label">Related integrations</div>
  <h2>Other frameworks.</h2>
  <p class="section-sub">
    <a href="/integration/remix" style="color:var(--accent2);text-decoration:none">/integration/remix</a> &middot;
    <a href="/integration/astro" style="color:var(--accent2);text-decoration:none">/integration/astro</a> &middot;
    <a href="/integration/svelte" style="color:var(--accent2);text-decoration:none">/integration/svelte</a> &middot;
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
      <h3 style="margin:0 0 4px;font-size:1.05rem;color:var(--text)">Skip the wiring — we ship the OpenAPI + MCP for your Next.js app.</h3>
      <p style="color:var(--muted);margin:0;font-size:.92rem">Audit your Route Handlers, emit a typed spec, deploy a hosted MCP at <code>mcp.yourbrand.com</code>. <strong style="color:var(--text)">Starter $499 one-time setup</strong>; Managed Retainer $999/mo for ongoing maintenance; Enterprise $4,999+/mo for SLA + private deploy.</p>
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
