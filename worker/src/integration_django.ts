// /integration/django — Django + DRF integration landing page.
// SERP target: "django mcp", "add ai tools to django", "django claude integration",
// "django agent api", "django rest framework mcp", "drf-spectacular mcp".

export function integrationDjangoHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Django MCP Integration — DRF Endpoints as Agent Tools | wmcp.sh</title>
<meta name="description" content="Expose Django REST Framework endpoints as MCP tools agents can call. Use drf-spectacular for OpenAPI, point wmcp.sh at the schema, and ship a Model Context Protocol server." />
<link rel="canonical" href="${origin}/integration/django" />
<meta property="og:title" content="Django MCP Integration — DRF Endpoints as Agent Tools" />
<meta property="og:description" content="DRF + drf-spectacular + wmcp.sh = MCP server. No rewrite; spec-driven." />
<meta property="og:url" content="${origin}/integration/django" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Django MCP Integration" />
<meta name="twitter:description" content="DRF endpoints → MCP tools without rewriting views." />
<meta name="twitter:image" content="${origin}/og.png" />
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article","headline":"Django MCP Integration — DRF Endpoints as Agent Tools","description":"How to expose Django REST Framework endpoints as Model Context Protocol tools using drf-spectacular and wmcp.sh.","author":{"@type":"Organization","name":"WebMCP Anything"},"publisher":{"@type":"Organization","name":"WebMCP Anything","url":"https://wmcp.sh"},"datePublished":"2026-05-28","dateModified":"2026-05-28","mainEntityOfPage":"${origin}/integration/django"}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
  {"@type":"Question","name":"Does this require Django REST Framework, or can plain Django views work too?","acceptedAnswer":{"@type":"Answer","text":"Plain Django views work, but you'll need to hand-write an OpenAPI spec for them — DRF + drf-spectacular generates one automatically from your serializers, viewsets, and routers. If you've already chosen DRF, you're 80 percent of the way to MCP exposure. If you're on plain Django, the smoothest path is either (a) wrap a few views in DRF function-based views, or (b) hand-write a small openapi.yaml served from a view."}},
  {"@type":"Question","name":"What version of Python do I need?","acceptedAnswer":{"@type":"Answer","text":"Anything DRF supports — currently Python 3.10+. The example targets Python 3.12+ because that's what most teams are running on. Django 4.2 LTS and Django 5.x both work; DRF 3.14+ plus drf-spectacular 0.27+ are the recommended combination."}},
  {"@type":"Question","name":"How is authentication handled?",
    "acceptedAnswer":{"@type":"Answer","text":"Declare your DRF authentication scheme in drf-spectacular's settings and it lands in the OpenAPI spec automatically. wmcp.sh reads the securitySchemes block and forwards the appropriate credential — bearer tokens from the MCP client, API keys, or full OAuth 2.1 via the /mcp/<provider> proxy if your origin implements Dynamic Client Registration."}},
  {"@type":"Question","name":"Will Django sessions interfere with agent traffic?","acceptedAnswer":{"@type":"Answer","text":"DRF's SessionAuthentication is fine for browser clients but inconvenient for agents. For MCP-callable endpoints, prefer TokenAuthentication or a JWT-backed scheme like django-rest-knox or djangorestframework-simplejwt — both are easy to declare in your spec. Keep CSRF disabled or use a CSRF-exempt path for the MCP-facing routes; production-grade auth gates the endpoint either way."}},
  {"@type":"Question","name":"Can I gate which DRF endpoints become tools?","acceptedAnswer":{"@type":"Answer","text":"Yes. drf-spectacular lets you tag operations or use the @extend_schema decorator to control which endpoints land in the spec. Then pass &tag=agent to wmcp.sh's ingest URL to filter further. Internal admin endpoints stay invisible to MCP clients."}}
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
  <div class="badge"><span class="dot"></span> integration &middot; Django</div>
  <h1>Django MCP integration.</h1>
  <p class="sub">Your Django + DRF app already serializes models, validates input, and generates an OpenAPI schema via <code>drf-spectacular</code>. Here's how to point wmcp.sh at that schema and ship a Model Context Protocol server agents can call — without touching a single view.</p>
  <p class="hint">wmcp.sh is not affiliated with the Django Software Foundation or Anthropic. Django, DRF, and drf-spectacular are open-source projects.</p>
</header>

<section id="wedge">
  <div class="section-label">The gap</div>
  <h2>DRF already emits OpenAPI. You're 80% done.</h2>
  <div class="wins-grid">
    <div class="wins-card">
      <h3>What you have today</h3>
      <p style="color:var(--muted);margin:0 0 12px;font-size:.95rem;line-height:1.65">DRF viewsets and serializers in <code>views.py</code>, routed through a <code>DefaultRouter</code>, with <code>drf-spectacular</code> emitting an OpenAPI 3 schema at <code>/api/schema/</code>. Auth handled by DRF's authentication classes (Token, JWT, Session, OAuth2).</p>
    </div>
    <div class="wins-card us">
      <h3>What agents need</h3>
      <p style="color:var(--muted);margin:0 0 12px;font-size:.95rem;line-height:1.65">A Model Context Protocol server exposing each viewset action as a typed tool. wmcp.sh reads <code>/api/schema/</code> and emits the MCP server at <code>${origin}/mcp/&lt;your-id&gt;</code>. Zero changes to <code>views.py</code>.</p>
    </div>
  </div>
</section>

<section id="code">
  <div class="section-label">The wiring</div>
  <h2>A DRF viewset, exposed as MCP tools.</h2>
  <p class="section-sub">Plain Django REST Framework; drf-spectacular emits the spec; wmcp.sh ingests it.</p>
  <pre><code><span class="c"># views.py — Django 5 + DRF</span>
<span class="k">from</span> rest_framework <span class="k">import</span> viewsets, serializers
<span class="k">from</span> drf_spectacular.utils <span class="k">import</span> extend_schema
<span class="k">from</span> .models <span class="k">import</span> Order

<span class="k">class</span> OrderSerializer(serializers.ModelSerializer):
    <span class="k">class</span> Meta:
        model = Order
        fields = [<span class="s">'id'</span>, <span class="s">'sku'</span>, <span class="s">'qty'</span>, <span class="s">'status'</span>, <span class="s">'created_at'</span>]

<span class="k">class</span> OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    <span class="k">@extend_schema</span>(tags=[<span class="s">'agent'</span>], summary=<span class="s">'Update order status'</span>)
    <span class="k">def</span> partial_update(self, request, *args, **kwargs):
        <span class="k">return</span> super().partial_update(request, *args, **kwargs)

<span class="c"># urls.py — drf-spectacular publishes the schema at /api/schema/</span>
<span class="c"># Then: curl '${origin}/api/v1/tools?url=https://acme.example.com/api/schema/&amp;tag=agent'</span>
<span class="c"># Result: every tagged operation becomes an MCP tool, types inferred from your serializer.</span></code></pre>
</section>

<section id="capabilities">
  <div class="section-label">Side-by-side</div>
  <h2>Hand-rolled MCP server vs wmcp.sh on Django.</h2>
  <table>
    <thead>
      <tr><th>Capability</th><th>Hand-rolled</th><th>wmcp.sh + drf-spectacular</th></tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Tool schemas synced with serializers</strong></td>
        <td>⚠️ Manual; drifts when serializers change</td>
        <td class="ours">✅ drf-spectacular regenerates spec on every deploy</td>
      </tr>
      <tr>
        <td><strong>Authentication declared once</strong></td>
        <td>⚠️ Re-implement DRF auth at the MCP layer</td>
        <td class="ours">✅ DRF's securitySchemes flow through to wmcp.sh</td>
      </tr>
      <tr>
        <td><strong>Pagination + filtering</strong></td>
        <td>⚠️ Re-export DRF filters as MCP parameters by hand</td>
        <td class="ours">✅ Spec lists query params; wmcp.sh exposes them as tool inputs</td>
      </tr>
      <tr>
        <td><strong>MCP transport (Streamable HTTP)</strong></td>
        <td>⚠️ You build it</td>
        <td class="ours">✅ Served at <code>${origin}/mcp/&lt;your-id&gt;</code></td>
      </tr>
      <tr>
        <td><strong>Per-tool gating</strong></td>
        <td>⚠️ Manual</td>
        <td class="ours">✅ <code>@extend_schema(tags=['agent'])</code> + <code>&amp;tag=agent</code> ingest filter</td>
      </tr>
      <tr>
        <td><strong>Spec drift detection</strong></td>
        <td>❌ Silent breakage</td>
        <td class="ours">✅ Re-ingest in CI; type mismatches surface immediately</td>
      </tr>
    </tbody>
  </table>
</section>

<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions from Django teams.</h2>
  <details><summary>Does this require DRF, or can plain Django views work?</summary><div class="answer">Plain Django works but you'll hand-write the OpenAPI spec. DRF + drf-spectacular is the lowest-friction path because the spec generation is automatic from your serializers and viewsets.</div></details>
  <details><summary>Python version?</summary><div class="answer">Python 3.12+ recommended (matches current DRF support). Django 4.2 LTS or 5.x; DRF 3.14+; drf-spectacular 0.27+.</div></details>
  <details><summary>How does authentication flow through?</summary><div class="answer">Whatever DRF authentication you've declared appears as <code>securitySchemes</code> in drf-spectacular's output. wmcp.sh reads it and forwards the appropriate credential — bearer tokens, API keys, or full OAuth 2.1 via <code>/mcp/&lt;provider&gt;</code>.</div></details>
  <details><summary>Will Django sessions interfere?</summary><div class="answer">SessionAuthentication is fine for browser users but awkward for agents. For MCP-facing endpoints, prefer TokenAuthentication, django-rest-knox, or djangorestframework-simplejwt. Keep CSRF off the agent paths; production auth gates the endpoint.</div></details>
  <details><summary>Can I expose only some endpoints?</summary><div class="answer">Yes. Use <code>@extend_schema(tags=['agent'])</code> to mark MCP-callable operations, then pass <code>&amp;tag=agent</code> when ingesting. Admin and internal endpoints stay invisible.</div></details>
  <details><summary>What about Django Ninja or DRF alternatives?</summary><div class="answer">Django Ninja emits an OpenAPI spec natively — even cleaner than DRF for this use case. Point wmcp.sh at <code>/api/openapi.json</code> and it works identically. The "Django" name on this page covers any Django-rooted API framework that publishes OpenAPI.</div></details>
</section>

<section id="related">
  <div class="section-label">Related integrations</div>
  <h2>Other frameworks.</h2>
  <p class="section-sub">
    <a href="/integration/fastapi" style="color:var(--accent2);text-decoration:none">/integration/fastapi</a> &middot;
    <a href="/integration/rails" style="color:var(--accent2);text-decoration:none">/integration/rails</a> &middot;
    <a href="/integration/express" style="color:var(--accent2);text-decoration:none">/integration/express</a> &middot;
    <a href="/integration/nextjs" style="color:var(--accent2);text-decoration:none">/integration/nextjs</a> &middot;
    <a href="/integration/openapi" style="color:var(--accent2);text-decoration:none">/integration/openapi</a> &middot;
    <a href="/agent-ready/saas" style="color:var(--accent2);text-decoration:none">/agent-ready/saas</a> &middot;
    <a href="/use-case/agent-commerce" style="color:var(--accent2);text-decoration:none">/use-case/agent-commerce</a>
  </p>
</section>

<section id="upgrade" style="margin-top:36px;background:linear-gradient(135deg,var(--card),rgba(124,92,255,0.08));border:1px solid rgba(124,92,255,0.35);border-radius:16px;padding:22px 26px">
  <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;justify-content:space-between">
    <div style="flex:1;min-width:240px">
      <div style="font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent2);font-weight:700;margin-bottom:6px">Need this done for you?</div>
      <h3 style="margin:0 0 4px;font-size:1.05rem;color:var(--text)">Skip the wiring — we ship the OpenAPI + MCP for your Django app.</h3>
      <p style="color:var(--muted);margin:0;font-size:.92rem">Audit your DRF viewsets, tune drf-spectacular for agent traffic, deploy MCP at <code>mcp.yourbrand.com</code>. <strong style="color:var(--text)">Starter $499 one-time setup</strong>; Managed Retainer $999/mo for ongoing maintenance; Enterprise $4,999+/mo for SLA + private deploy.</p>
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
