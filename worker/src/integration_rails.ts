// /integration/rails — Ruby on Rails integration landing page.
// SERP target: "rails mcp", "add ai tools to rails", "rails claude integration",
// "rails agent api", "rswag mcp", "ruby on rails openapi".

export function integrationRailsHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Rails MCP Integration — Controller Actions as Agent Tools | wmcp.sh</title>
<meta name="description" content="Expose Rails 7+ JSON API controller actions as MCP tools agents can call. Use rswag to emit OpenAPI from request specs and let wmcp.sh ship your Model Context Protocol server." />
<link rel="canonical" href="${origin}/integration/rails" />
<meta property="og:title" content="Rails MCP Integration — Controller Actions as Agent Tools" />
<meta property="og:description" content="Rails 7 JSON API + rswag + wmcp.sh = MCP server. Spec-driven, no rewrite." />
<meta property="og:url" content="${origin}/integration/rails" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Rails MCP Integration" />
<meta name="twitter:description" content="Controller actions → MCP tools without rewriting Rails." />
<meta name="twitter:image" content="${origin}/og.png" />
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article","headline":"Rails MCP Integration — Controller Actions as Agent Tools","description":"How to expose Rails 7+ JSON API controllers as Model Context Protocol tools using rswag for OpenAPI generation.","author":{"@type":"Organization","name":"WebMCP Anything"},"publisher":{"@type":"Organization","name":"WebMCP Anything","url":"https://wmcp.sh"},"datePublished":"2026-05-28","dateModified":"2026-05-28","mainEntityOfPage":"${origin}/integration/rails"}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
  {"@type":"Question","name":"Does this work with Rails-as-API or full-stack Rails?","acceptedAnswer":{"@type":"Answer","text":"Both. The MCP exposure layer only needs controller actions that respond with JSON and a routes.rb that maps them to stable URLs. Full-stack Rails apps with HTML views and turbo work fine; the agent-callable subset lives under app/controllers/api/ (or wherever your JSON namespace is) and the rest of your views stay untouched."}},
  {"@type":"Question","name":"Why rswag specifically?","acceptedAnswer":{"@type":"Answer","text":"Rails has no first-party OpenAPI generator. rswag is the most-used Ruby gem for emitting OpenAPI 3 specs because it derives them from RSpec request specs — meaning your tests double as the schema source. Alternatives include grape-swagger (if you use Grape), rspec-openapi, and hand-writing a static spec. wmcp.sh ingests any of them; rswag is the recommendation because the schema stays accurate as your test suite evolves."}},
  {"@type":"Question","name":"How is authentication handled?","acceptedAnswer":{"@type":"Answer","text":"Declare your auth scheme in rswag's swagger_helper (bearerAuth, apiKey, oauth2) and it lands in the OpenAPI spec. wmcp.sh reads securitySchemes and forwards credentials accordingly. Common Rails patterns — Devise's API tokens, JWT via devise-jwt, OAuth via Doorkeeper — all map onto standard OpenAPI securitySchemes."}},
  {"@type":"Question","name":"What about Rails strong parameters and Active Model validations?","acceptedAnswer":{"@type":"Answer","text":"Strong parameters and validations stay inside the controller; nothing changes. The OpenAPI spec describes the request body shape that the controller will accept, and the controller is still responsible for permitting + validating before persisting. The spec is a contract, not a replacement."}},
  {"@type":"Question","name":"Can I expose only a subset of controller actions?","acceptedAnswer":{"@type":"Answer","text":"Yes. rswag operations are explicit — you describe each endpoint you want in the spec. Anything you don't describe is invisible to MCP clients. For finer control, tag operations and pass &tag=agent to the wmcp.sh ingest URL."}}
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
  <div class="badge"><span class="dot"></span> integration &middot; Rails</div>
  <h1>Rails MCP integration.</h1>
  <p class="sub">Your Rails 7+ app already routes JSON traffic through controller actions backed by strong parameters and Active Model validations. Here's how to expose those actions as MCP tools an agent can call — without abandoning Rails conventions.</p>
  <p class="hint">wmcp.sh is not affiliated with 37signals, the Rails Foundation, or Anthropic. Rails and rswag are open-source projects.</p>
</header>

<section id="wedge">
  <div class="section-label">The gap</div>
  <h2>Rails has no first-party OpenAPI. rswag closes the gap.</h2>
  <div class="wins-grid">
    <div class="wins-card">
      <h3>What you have today</h3>
      <p style="color:var(--muted);margin:0 0 12px;font-size:.95rem;line-height:1.65">Controllers under <code>app/controllers/api/</code>, routes mapped in <code>config/routes.rb</code>, request specs in <code>spec/requests/</code> exercising every endpoint. Devise + Doorkeeper or a JWT scheme on top.</p>
    </div>
    <div class="wins-card us">
      <h3>What agents need</h3>
      <p style="color:var(--muted);margin:0 0 12px;font-size:.95rem;line-height:1.65">A Model Context Protocol server with typed tool schemas. rswag generates OpenAPI 3 from your request specs; wmcp.sh ingests it and emits MCP at <code>${origin}/mcp/&lt;your-id&gt;</code>. Controllers untouched.</p>
    </div>
  </div>
</section>

<section id="code">
  <div class="section-label">The wiring</div>
  <h2>A controller action, exposed as a tool.</h2>
  <p class="section-sub">Standard Rails 7 JSON API controller plus an rswag spec emitting OpenAPI.</p>
  <pre><code><span class="c"># app/controllers/api/v1/orders_controller.rb</span>
<span class="k">module</span> Api::V1
  <span class="k">class</span> OrdersController &lt; ApplicationController
    before_action :authenticate_user!

    <span class="k">def</span> update
      order = Order.find(params[:id])
      <span class="k">if</span> order.update(order_params)
        render json: order, status: :ok
      <span class="k">else</span>
        render json: { errors: order.errors }, status: :unprocessable_entity
      <span class="k">end</span>
    <span class="k">end</span>

    <span class="k">private</span>
    <span class="k">def</span> order_params
      params.require(:order).permit(:status, :tracking_number)
    <span class="k">end</span>
  <span class="k">end</span>
<span class="k">end</span>

<span class="c"># spec/requests/api/v1/orders_spec.rb — rswag emits OpenAPI from this</span>
<span class="k">require</span> <span class="s">'swagger_helper'</span>
RSpec.describe <span class="s">'Orders API'</span>, type: :request <span class="k">do</span>
  path <span class="s">'/api/v1/orders/{id}'</span> <span class="k">do</span>
    patch <span class="s">'Update order status'</span> <span class="k">do</span>
      tags <span class="s">'Orders'</span>, <span class="s">'agent'</span>
      consumes <span class="s">'application/json'</span>
      parameter name: :id, in: :path, type: :string
      parameter name: :order, in: :body, schema: { type: <span class="s">:object</span>, properties: { status: { type: <span class="s">:string</span> } } }
      response <span class="s">'200'</span>, <span class="s">'updated'</span> <span class="k">do</span> run_test! <span class="k">end</span>
    <span class="k">end</span>
  <span class="k">end</span>
<span class="k">end</span>

<span class="c"># rake rswag:specs:swaggerize publishes swagger/v1/swagger.yaml at /api-docs/v1/swagger.yaml
# curl '${origin}/api/v1/tools?url=https://acme.example.com/api-docs/v1/swagger.yaml&amp;tag=agent'</span></code></pre>
</section>

<section id="capabilities">
  <div class="section-label">Side-by-side</div>
  <h2>Hand-rolled MCP server vs wmcp.sh on Rails.</h2>
  <table>
    <thead>
      <tr><th>Capability</th><th>Hand-rolled</th><th>wmcp.sh + rswag</th></tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Tool schemas tied to tests</strong></td>
        <td>⚠️ Schema and tests drift independently</td>
        <td class="ours">✅ rswag derives spec from request specs — tests <em>are</em> the schema</td>
      </tr>
      <tr>
        <td><strong>Strong params + validations</strong></td>
        <td>✅ Untouched (server-side concern)</td>
        <td class="ours">✅ Untouched; spec documents the wire shape, controller enforces</td>
      </tr>
      <tr>
        <td><strong>Authentication</strong></td>
        <td>⚠️ Re-implement Devise/Doorkeeper at the MCP layer</td>
        <td class="ours">✅ securitySchemes declared in swagger_helper flow through</td>
      </tr>
      <tr>
        <td><strong>MCP transport (Streamable HTTP, SSE)</strong></td>
        <td>⚠️ You build it</td>
        <td class="ours">✅ Served at <code>${origin}/mcp/&lt;your-id&gt;</code></td>
      </tr>
      <tr>
        <td><strong>Per-action gating</strong></td>
        <td>⚠️ Manual</td>
        <td class="ours">✅ Tag rswag operations + <code>&amp;tag=agent</code> ingest filter</td>
      </tr>
      <tr>
        <td><strong>CI integration</strong></td>
        <td>⚠️ Separate sync step</td>
        <td class="ours">✅ <code>rake rswag:specs:swaggerize</code> + re-ingest in CI</td>
      </tr>
    </tbody>
  </table>
</section>

<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions from Rails teams.</h2>
  <details><summary>Rails-as-API or full-stack Rails?</summary><div class="answer">Both work. wmcp.sh only needs JSON controller actions with stable routes. The HTML view side of your app is irrelevant to MCP exposure.</div></details>
  <details><summary>Why rswag?</summary><div class="answer">Rails has no first-party OpenAPI generator. rswag derives OpenAPI 3 from RSpec request specs so the spec stays accurate as your tests evolve. Alternatives: grape-swagger, rspec-openapi, or hand-writing a static spec. wmcp.sh ingests any of them.</div></details>
  <details><summary>How does Devise / Doorkeeper / JWT plug in?</summary><div class="answer">Declare your auth scheme as <code>securitySchemes</code> in <code>swagger_helper.rb</code>. wmcp.sh reads the spec and forwards credentials. Devise API tokens map to <code>apiKey</code>, Doorkeeper to <code>oauth2</code>, JWT to <code>bearerAuth</code>.</div></details>
  <details><summary>Will strong params or validations be affected?</summary><div class="answer">No. The spec describes what the controller accepts; the controller still permits and validates before persisting. Spec is a contract, not a replacement.</div></details>
  <details><summary>Can I expose only some actions?</summary><div class="answer">Yes. rswag operations are explicit. Anything not described in <code>spec/requests/</code> is invisible to MCP clients. Tag and filter for finer control.</div></details>
  <details><summary>Ruby and Rails versions?</summary><div class="answer">Rails 7.0+ recommended; Rails 6 LTS works. Ruby 3.1+. rswag 2.13+ supports OpenAPI 3.0; for OpenAPI 3.1 features stick with hand-written specs or rspec-openapi.</div></details>
</section>

<section id="related">
  <div class="section-label">Related integrations</div>
  <h2>Other frameworks.</h2>
  <p class="section-sub">
    <a href="/integration/django" style="color:var(--accent2);text-decoration:none">/integration/django</a> &middot;
    <a href="/integration/fastapi" style="color:var(--accent2);text-decoration:none">/integration/fastapi</a> &middot;
    <a href="/integration/express" style="color:var(--accent2);text-decoration:none">/integration/express</a> &middot;
    <a href="/integration/nextjs" style="color:var(--accent2);text-decoration:none">/integration/nextjs</a> &middot;
    <a href="/integration/openapi" style="color:var(--accent2);text-decoration:none">/integration/openapi</a> &middot;
    <a href="/agent-ready/saas" style="color:var(--accent2);text-decoration:none">/agent-ready/saas</a> &middot;
    <a href="/use-case/agent-commerce" style="color:var(--accent2);text-decoration:none">/use-case/agent-commerce</a>
  </p>
</section>

<section id="upgrade" style="margin-top:36px;background:linear-gradient(135deg,var(--card),rgba(255,158,44,0.08));border:1px solid rgba(255,158,44,0.35);border-radius:16px;padding:22px 26px">
  <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;justify-content:space-between">
    <div style="flex:1;min-width:240px">
      <div style="font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent2);font-weight:700;margin-bottom:6px">Need this done for you?</div>
      <h3 style="margin:0 0 4px;font-size:1.05rem;color:var(--text)">Skip the wiring — we ship the OpenAPI + MCP for your Rails app.</h3>
      <p style="color:var(--muted);margin:0;font-size:.92rem">Audit your controllers, wire up rswag, deploy MCP at <code>mcp.yourbrand.com</code>. <strong style="color:var(--text)">Starter $499 one-time setup</strong>; Managed Retainer $999/mo for ongoing maintenance; Enterprise $4,999+/mo for SLA + private deploy.</p>
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
