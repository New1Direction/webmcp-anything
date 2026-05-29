export function integrationLaravelHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Laravel MCP Integration — Expose Routes as AI Tools | wmcp.sh</title>
<meta name="description" content="Expose Laravel routes as Model Context Protocol (MCP) tools using Scribe or L5-Swagger. No rewriting; spec-driven integration via wmcp.sh." />
<link rel="canonical" href="${origin}/integration/laravel" />
<meta property="og:title" content="Laravel MCP Integration — Expose Routes as AI Tools" />
<meta property="og:description" content="Expose Laravel routes as Model Context Protocol (MCP) tools using Scribe or L5-Swagger. No rewriting; spec-driven integration via wmcp.sh." />
<meta property="og:url" content="${origin}/integration/laravel" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Laravel MCP Integration — Expose Routes as AI Tools" />
<meta name="twitter:description" content="Expose Laravel routes as Model Context Protocol (MCP) tools using Scribe or L5-Swagger. No rewriting; spec-driven integration via wmcp.sh." />
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article","headline":"Laravel MCP Integration — Expose Routes as AI Tools","description":"Expose Laravel routes as Model Context Protocol (MCP) tools using Scribe or L5-Swagger. No rewriting; spec-driven integration via wmcp.sh.","author":{"@type":"Organization","name":"WebMCP Anything"},"publisher":{"@type":"Organization","name":"WebMCP Anything","url":"https://wmcp.sh"},"datePublished":"2026-05-28","dateModified":"2026-05-28","mainEntityOfPage":"${origin}/integration/laravel"}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
  {"@type":"Question","name":"Which OpenAPI package should I use for Laravel?","acceptedAnswer":{"@type":"Answer","text":"We recommend knuckleswtf/scribe for extracting specs from existing PHPDoc and form requests. darkaonline/l5-swagger is also fully supported if you prefer Swagger-PHP annotations."}},
  {"@type":"Question","name":"What about Laravel Sanctum or Passport auth?","acceptedAnswer":{"@type":"Answer","text":"Just declare the auth requirement in your OpenAPI spec (e.g., Bearer auth). wmcp.sh forwards the token provided by the agent. Your existing Sanctum or Passport middleware handles verification seamlessly."}},
  {"@type":"Question","name":"How do I prevent agents from calling dangerous routes?","acceptedAnswer":{"@type":"Answer","text":"Don't expose them in the spec, or use OpenAPI tags. Tag safe routes with 'agent' and pass '?tag=agent' when registering the spec URL with wmcp.sh."}},
  {"@type":"Question","name":"Are the routes slow?","acceptedAnswer":{"@type":"Answer","text":"wmcp.sh adds sub-100ms latency to proxy the call. The actual response time depends entirely on your Laravel app's performance."}}
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
  nav .brand a { color: inherit; text-decoration: none; }
  nav .brand span { color: var(--accent2); }
  nav .links { display: flex; gap: 22px; font-size: .9rem; }
  nav .links a { color: var(--muted); text-decoration: none; }
  nav .cta { background: var(--bg2); border: 1px solid var(--border); padding: 7px 14px; border-radius: 8px; font-size: .85rem; color: var(--text); text-decoration: none; font-weight: 600; }
  header.hero { padding: 50px 0 30px; }
  .badge { display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;font-size:.7rem;letter-spacing:.15em;text-transform:uppercase;font-weight:700;background:linear-gradient(90deg,rgba(255,158,44,.18),rgba(255,176,0,.18));border:1px solid rgba(255,158,44,.35);margin-bottom:18px; }
  .dot { width:6px;height:6px;background:var(--accent2);border-radius:50%;box-shadow:0 0 8px var(--accent2); }
  h1 { font-size:clamp(2.1rem,4.8vw,3.2rem);margin:0 0 18px;background:linear-gradient(135deg,#fff 30%,var(--accent2) 100%);-webkit-background-clip:text;background-clip:text;color:transparent;line-height:1.05;font-weight:800;letter-spacing:-.025em; }
  .sub { color: var(--muted); font-size: 1.05rem; max-width: 700px; margin: 0 0 24px; }
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
  footer { border-top:1px solid var(--border);margin-top:40px;padding:30px 0;text-align:center;color:var(--muted);font-size:.85rem; }
  footer a { color: var(--accent2); text-decoration: none; margin: 0 8px; }
</style>
</head>
<body>

<nav>
  <div class="brand"><a href="/">wmcp<span>.sh</span></a></div>
  <div class="links">
    <a href="/agent-ready">Agent-ready</a>
    <a href="/managed">Done for you</a>
    <a href="/price-data">Price data</a>
    <a href="/blog">Blog</a>
    <a href="/directory">Directory</a>
  </div>
  <a class="cta" href="/dashboard">Dashboard →</a>
</nav>

<div class="wrap">

<header class="hero">
  <div class="badge"><span class="dot"></span> INTEGRATION &middot; LARAVEL</div>
  <h1>Laravel routes → Agent tools</h1>
  <p class="sub">Turn your existing PHP controllers into AI-callable tools instantly. Use Scribe or L5-Swagger to generate an OpenAPI spec, feed it to wmcp.sh, and your Laravel backend becomes a native MCP server for Claude and other agent frameworks.</p>
</header>

<section id="wedge">
  <div class="section-label">the gap</div>
  <h2>Laravel APIs aren't agent-ready by default</h2>
  <p class="section-sub">If you have a Laravel backend, you already have validated requests, Eloquent models, and business logic. But exposing these to AI agents typically requires rewriting your controllers into a custom Model Context Protocol (MCP) server, dealing with transport layers and schema duplication.</p>
  <p class="section-sub">wmcp.sh eliminates this rewrite. By generating an OpenAPI spec from your existing PHP annotations, you can instantly expose your routes to agents without changing your app architecture.</p>
</section>

<section id="how">
  <div class="section-label">the flow</div>
  <h2>Generating tools from Laravel controllers</h2>
  <pre><code><span class="c">&lt;?php</span>

<span class="c">/**
 * Create Order
 *
 * Creates a new order for the authenticated user.
 *
 * @bodyParam sku string required The product SKU. Example: PROD-123
 * @bodyParam qty integer required The quantity. Example: 2
 * @response 201 { "id": 99, "status": "created" }
 */</span>
<span class="k">public function</span> store(Request $request)
{
    $validated = $request-&gt;validate([
        <span class="s">'sku'</span> =&gt; <span class="s">'required|string'</span>,
        <span class="s">'qty'</span> =&gt; <span class="s">'required|integer|min:1'</span>,
    ]);

    $order = Order::create($validated);
    <span class="k">return</span> response()-&gt;json($order, <span class="s">201</span>);
}

<span class="c"># 1. Generate spec: php artisan scribe:generate</span>
<span class="c"># 2. Extract tools via wmcp.sh API</span>
<span class="k">curl</span> -X GET <span class="s">"https://wmcp.sh/api/v1/tools?url=https://your-laravel-app.com/docs/openapi.yaml"</span></code></pre>
</section>

<section id="capabilities">
  <div class="section-label">capability</div>
  <h2>Hand-rolled MCP vs wmcp.sh on Laravel</h2>
  <table>
    <thead><tr><th>Capability</th><th>Without wmcp.sh (Hand-rolled)</th><th>With wmcp.sh</th></tr></thead>
    <tbody>
      <tr><td><strong>Setup time</strong></td><td>⚠️ Weeks of custom routing</td><td class="ours">✅ Zero — just point at spec URL</td></tr>
      <tr><td><strong>Existing middleware</strong></td><td>❌ Must rebuild in MCP server</td><td class="ours">✅ Preserved (Sanctum/Passport runs on origin)</td></tr>
      <tr><td><strong>Auth flow</strong></td><td>⚠️ Re-implement token logic</td><td class="ours">✅ Declared in spec, auto-injected</td></tr>
      <tr><td><strong>Spec generator</strong></td><td>❌ N/A</td><td class="ours">✅ Scribe, L5-Swagger, or manual</td></tr>
      <tr><td><strong>Tool Shape</strong></td><td>⚠️ Manually mapped</td><td class="ours">✅ Native MCP / tool_use generated</td></tr>
    </tbody>
  </table>
</section>

<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions.</h2>
  <details><summary>Which OpenAPI package should I use for Laravel?</summary><p class="answer">We recommend <code>knuckleswtf/scribe</code> for extracting specs from existing PHPDoc and form requests. <code>darkaonline/l5-swagger</code> is also fully supported if you prefer Swagger-PHP annotations.</p></details>
  <details><summary>What about Laravel Sanctum or Passport auth?</summary><p class="answer">Just declare the auth requirement in your OpenAPI spec (e.g., Bearer auth). wmcp.sh forwards the token provided by the agent. Your existing Sanctum or Passport middleware handles verification seamlessly.</p></details>
  <details><summary>How do I prevent agents from calling dangerous routes?</summary><p class="answer">Don't expose them in the spec, or use OpenAPI tags. Tag safe routes with <code>agent</code> and pass <code>?tag=agent</code> when registering the spec URL with wmcp.sh.</p></details>
  <details><summary>Are the routes slow?</summary><p class="answer">wmcp.sh adds sub-100ms latency to proxy the call. The actual response time depends entirely on your Laravel app's performance.</p></details>
</section>

<section id="upgrade" style="margin-top:36px;background:linear-gradient(135deg,var(--card),rgba(255,158,44,0.08));border:1px solid rgba(255,158,44,0.35);border-radius:16px;padding:22px 26px">
  <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;justify-content:space-between">
    <div style="flex:1;min-width:240px">
      <div style="font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent2);font-weight:700;margin-bottom:6px">Need this done for you?</div>
      <h3 style="margin:0 0 4px;font-size:1.05rem;color:var(--text)">Skip the wiring — we build, deploy, and monitor.</h3>
      <p style="color:var(--muted);margin:0;font-size:.92rem">Custom adapter + hosted MCP at <code>mcp.yourbrand.com</code> + verified badge. From <strong style="color:var(--text)">$499 one-time setup</strong>.</p>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <a href="/managed" style="display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#ff9e2c,#ffcf7a);color:#0c0c14;padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:700;font-size:.9rem">See /managed →</a>
      <a href="/directory/submit" style="display:inline-flex;align-items:center;gap:6px;background:#11111c;border:1px solid #26263a;color:var(--text);padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:600;font-size:.9rem">Submit (free)</a>
    </div>
  </div>
</section>

</div>

<footer>
  <a href="/">Home</a> · <a href="/agent-ready">Agent-ready</a> · <a href="/managed">Done for you</a> · <a href="/blog">Blog</a> · <a href="/directory">Directory</a> · <a href="/directory/submit">Submit</a> · <a href="/integration/springboot">Spring Boot</a> · <a href="/integration/nestjs">NestJS</a> · <a href="/integration/hono">Hono</a> · <a href="https://github.com/New1Direction/webmcp-anything">GitHub</a>
</footer>
</body>
</html>`;
}
