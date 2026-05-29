// /integration/fastapi — FastAPI integration landing page.
// SERP target: "fastapi mcp", "add ai tools to fastapi", "fastapi claude integration",
// "fastapi agent api", "fastapi model context protocol".

export function integrationFastapiHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>FastAPI MCP Integration — The Easiest Path from Type Hints to Agent Tools | wmcp.sh</title>
<meta name="description" content="FastAPI auto-generates OpenAPI from your type hints. wmcp.sh ingests that OpenAPI and emits a Model Context Protocol server. Zero schema duplication; literally the easiest MCP integration." />
<link rel="canonical" href="${origin}/integration/fastapi" />
<meta property="og:title" content="FastAPI MCP Integration — The Easiest Path to Agent Tools" />
<meta property="og:description" content="FastAPI's auto OpenAPI + wmcp.sh = MCP server in one curl. The smoothest integration of the bunch." />
<meta property="og:url" content="${origin}/integration/fastapi" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="FastAPI MCP Integration" />
<meta name="twitter:description" content="Type hints → OpenAPI → MCP tools. No extra steps." />
<meta name="twitter:image" content="${origin}/og.png" />
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article","headline":"FastAPI MCP Integration — The Easiest Path from Type Hints to Agent Tools","description":"FastAPI auto-generates OpenAPI from Python type hints; wmcp.sh ingests it and emits a Model Context Protocol server. The smoothest framework integration available.","author":{"@type":"Organization","name":"WebMCP Anything"},"publisher":{"@type":"Organization","name":"WebMCP Anything","url":"https://wmcp.sh"},"datePublished":"2026-05-28","dateModified":"2026-05-28","mainEntityOfPage":"${origin}/integration/fastapi"}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
  {"@type":"Question","name":"Why is FastAPI the easiest MCP integration?","acceptedAnswer":{"@type":"Answer","text":"FastAPI generates an OpenAPI 3 schema automatically from your Python type hints and Pydantic models — no extra library, no extra build step, no extra config. The schema is served at /openapi.json out of the box. wmcp.sh consumes OpenAPI as its primary input, which means there's literally no glue code between FastAPI and MCP exposure. Most frameworks need a converter; FastAPI doesn't."}},
  {"@type":"Question","name":"Which Python version and FastAPI version?","acceptedAnswer":{"@type":"Answer","text":"Python 3.12+ recommended (matches FastAPI's current support window). FastAPI 0.110+ is what most current docs assume, but anything from 0.95+ that ships the modern Pydantic v2 integration works identically. wmcp.sh doesn't care about FastAPI's version — only that /openapi.json is reachable."}},
  {"@type":"Question","name":"How does authentication flow through?","acceptedAnswer":{"@type":"Answer","text":"FastAPI's security dependencies (HTTPBearer, APIKeyHeader, OAuth2PasswordBearer) all emit corresponding securitySchemes in the generated OpenAPI. wmcp.sh reads those and forwards credentials automatically. For OAuth 2.1 with Dynamic Client Registration, point the MCP client at /mcp/<provider> and wmcp.sh proxies the full flow so DCR-incompatible clients (Claude.ai, Cursor remote MCP) can still authenticate."}},
  {"@type":"Question","name":"What about Pydantic v1 vs v2?","acceptedAnswer":{"@type":"Answer","text":"FastAPI 0.100+ is Pydantic v2 native. v2 produces cleaner JSON Schema (which OpenAPI 3.1 embeds directly), and wmcp.sh prefers v2 output because the schemas map 1:1 to MCP tool input schemas. If you're still on v1, the integration works but you may see less expressive types in the MCP client (no Annotated metadata, looser validation hints)."}},
  {"@type":"Question","name":"Can I gate which routes become MCP tools?","acceptedAnswer":{"@type":"Answer","text":"Yes. FastAPI supports tags on every operation; tag the agent-callable ones with 'agent' and pass &tag=agent to the wmcp.sh ingest URL. Or use FastAPI's include_in_schema=False on internal routes to keep them out of the schema entirely. Admin-only endpoints stay invisible to MCP clients."}}
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
  <div class="badge"><span class="dot"></span> integration &middot; FastAPI</div>
  <h1>FastAPI MCP integration.</h1>
  <p class="sub">FastAPI already auto-generates an OpenAPI 3 schema from your Python type hints — wmcp.sh consumes OpenAPI as input. There's literally no glue code. Of every framework on this site, FastAPI is the easiest.</p>
  <p class="hint">wmcp.sh is not affiliated with the FastAPI project or Anthropic. FastAPI is open-source software maintained by Sebastián Ramírez and contributors.</p>
</header>

<section id="wedge">
  <div class="section-label">The gap</div>
  <h2>There barely is one. FastAPI is already 95% MCP-ready.</h2>
  <div class="wins-grid">
    <div class="wins-card">
      <h3>What you have today</h3>
      <p style="color:var(--muted);margin:0 0 12px;font-size:.95rem;line-height:1.65">FastAPI routes with Pydantic v2 input/output models. <code>/openapi.json</code> already serves a fully-typed OpenAPI 3 schema. Auth via <code>HTTPBearer</code>, <code>APIKeyHeader</code>, or <code>OAuth2PasswordBearer</code>.</p>
    </div>
    <div class="wins-card us">
      <h3>What agents need</h3>
      <p style="color:var(--muted);margin:0 0 12px;font-size:.95rem;line-height:1.65">A Model Context Protocol server with typed tool schemas. wmcp.sh consumes <code>/openapi.json</code> directly and emits MCP at <code>${origin}/mcp/&lt;your-id&gt;</code>. One ingest call. Done.</p>
    </div>
  </div>
</section>

<section id="code">
  <div class="section-label">The wiring</div>
  <h2>A FastAPI route, exposed as a tool.</h2>
  <p class="section-sub">Standard FastAPI 0.110+ with Pydantic v2 — no extra libraries, no schema duplication.</p>
  <pre><code><span class="c"># main.py — FastAPI on Python 3.12+</span>
<span class="k">from</span> fastapi <span class="k">import</span> FastAPI, Depends, HTTPException
<span class="k">from</span> fastapi.security <span class="k">import</span> HTTPBearer, HTTPAuthorizationCredentials
<span class="k">from</span> pydantic <span class="k">import</span> BaseModel, Field

app = FastAPI(title=<span class="s">'Acme Inventory'</span>, version=<span class="s">'1.0.0'</span>)
bearer = HTTPBearer()

<span class="k">class</span> QuoteIn(BaseModel):
    symbol: str = Field(min_length=<span class="s">1</span>, max_length=<span class="s">12</span>)
    size: float = Field(gt=<span class="s">0</span>)

<span class="k">class</span> QuoteOut(BaseModel):
    symbol: str
    bid: float
    ask: float
    size: float

<span class="k">@app.post</span>(<span class="s">'/quotes'</span>, response_model=QuoteOut, tags=[<span class="s">'agent'</span>])
<span class="k">async def</span> get_quote(body: QuoteIn, creds: HTTPAuthorizationCredentials = Depends(bearer)) -&gt; QuoteOut:
    <span class="k">if</span> <span class="k">not</span> creds.credentials:
        <span class="k">raise</span> HTTPException(<span class="s">401</span>)
    mid = <span class="k">await</span> fetch_mid(body.symbol)
    <span class="k">return</span> QuoteOut(symbol=body.symbol, bid=mid * <span class="s">0.999</span>, ask=mid * <span class="s">1.001</span>, size=body.size)

<span class="c"># OpenAPI is served at /openapi.json automatically. That's it.
# curl '${origin}/api/v1/tools?url=https://acme.example.com/openapi.json&amp;tag=agent'</span></code></pre>
</section>

<section id="capabilities">
  <div class="section-label">Side-by-side</div>
  <h2>Hand-rolled MCP server vs wmcp.sh on FastAPI.</h2>
  <table>
    <thead>
      <tr><th>Capability</th><th>Hand-rolled</th><th>wmcp.sh + FastAPI</th></tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Schema-from-type-hints</strong></td>
        <td>⚠️ Re-derive schemas in a tools.py</td>
        <td class="ours">✅ FastAPI already emits it; one source of truth</td>
      </tr>
      <tr>
        <td><strong>Pydantic v2 JSON Schema</strong></td>
        <td>⚠️ Hand-translate to MCP shape</td>
        <td class="ours">✅ Pydantic v2 → OpenAPI 3.1 JSON Schema → MCP tool input schema, 1:1</td>
      </tr>
      <tr>
        <td><strong>Security schemes</strong></td>
        <td>⚠️ Re-implement at MCP layer</td>
        <td class="ours">✅ FastAPI's <code>Depends(...)</code> security flows through to wmcp.sh</td>
      </tr>
      <tr>
        <td><strong>MCP transport (Streamable HTTP, SSE)</strong></td>
        <td>⚠️ You build it</td>
        <td class="ours">✅ Served at <code>${origin}/mcp/&lt;your-id&gt;</code></td>
      </tr>
      <tr>
        <td><strong>Per-route gating</strong></td>
        <td>⚠️ Manual</td>
        <td class="ours">✅ FastAPI <code>tags=[...]</code> + <code>&amp;tag=agent</code> ingest filter</td>
      </tr>
      <tr>
        <td><strong>Async + streaming</strong></td>
        <td>✅ Yes</td>
        <td class="ours">✅ wmcp.sh handles both</td>
      </tr>
    </tbody>
  </table>
</section>

<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions from FastAPI teams.</h2>
  <details><summary>Why is FastAPI the easiest MCP integration?</summary><div class="answer">Because <code>/openapi.json</code> is already there. FastAPI generates it from your type hints with no extra library or config. wmcp.sh consumes OpenAPI as its primary input, so the integration is one curl call — no converter, no schema duplication.</div></details>
  <details><summary>Versions?</summary><div class="answer">Python 3.12+ recommended. FastAPI 0.110+ is what most current docs target; anything from 0.95+ (Pydantic v2 integration) works identically.</div></details>
  <details><summary>How does auth flow through?</summary><div class="answer">FastAPI's security dependencies emit corresponding <code>securitySchemes</code> in the OpenAPI output. wmcp.sh reads them and forwards credentials. For OAuth 2.1 DCR, the <code>/mcp/&lt;provider&gt;</code> proxy handles the full flow for clients that can't drive OAuth themselves.</div></details>
  <details><summary>Pydantic v1 vs v2?</summary><div class="answer">v2 is the recommended path because its JSON Schema output maps 1:1 to MCP tool input schemas. v1 works but you'll see less expressive types in the MCP client.</div></details>
  <details><summary>Can I gate routes?</summary><div class="answer">Yes. Tag operations with <code>tags=['agent']</code> and pass <code>&amp;tag=agent</code> at ingest, or set <code>include_in_schema=False</code> to keep routes out of the schema entirely.</div></details>
  <details><summary>Does Starlette / Litestar / Robyn work the same way?</summary><div class="answer">Any Python framework that emits an OpenAPI spec works. Litestar generates one automatically (similar to FastAPI). Starlette doesn't by default — you'd add <code>apispec</code> or a similar generator. Point wmcp.sh at the spec URL; the rest is identical.</div></details>
</section>

<section id="related">
  <div class="section-label">Related integrations</div>
  <h2>Other frameworks.</h2>
  <p class="section-sub">
    <a href="/integration/django" style="color:var(--accent2);text-decoration:none">/integration/django</a> &middot;
    <a href="/integration/rails" style="color:var(--accent2);text-decoration:none">/integration/rails</a> &middot;
    <a href="/integration/express" style="color:var(--accent2);text-decoration:none">/integration/express</a> &middot;
    <a href="/integration/nextjs" style="color:var(--accent2);text-decoration:none">/integration/nextjs</a> &middot;
    <a href="/integration/openapi" style="color:var(--accent2);text-decoration:none">/integration/openapi</a> &middot;
    <a href="/agent-ready/api" style="color:var(--accent2);text-decoration:none">/agent-ready/api</a> &middot;
    <a href="/use-case/yield-watcher" style="color:var(--accent2);text-decoration:none">/use-case/yield-watcher</a>
  </p>
</section>

<section id="upgrade" style="margin-top:36px;background:linear-gradient(135deg,var(--card),rgba(124,92,255,0.08));border:1px solid rgba(124,92,255,0.35);border-radius:16px;padding:22px 26px">
  <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;justify-content:space-between">
    <div style="flex:1;min-width:240px">
      <div style="font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent2);font-weight:700;margin-bottom:6px">Need this done for you?</div>
      <h3 style="margin:0 0 4px;font-size:1.05rem;color:var(--text)">Skip the wiring — we ship the MCP server for your FastAPI app.</h3>
      <p style="color:var(--muted);margin:0;font-size:.92rem">Audit your routes, tune tags + securitySchemes, deploy MCP at <code>mcp.yourbrand.com</code>. <strong style="color:var(--text)">Starter $499 one-time setup</strong>; Managed Retainer $999/mo for ongoing maintenance; Enterprise $4,999+/mo for SLA + private deploy.</p>
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
