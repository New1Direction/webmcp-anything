export function integrationSpringbootHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Spring Boot MCP Integration — Java AI Agents | wmcp.sh</title>
<meta name="description" content="Turn Spring Boot REST controllers into Model Context Protocol (MCP) tools using springdoc-openapi. Zero-rewrite agent integration via wmcp.sh." />
<link rel="canonical" href="${origin}/integration/spring-boot" />
<meta property="og:title" content="Spring Boot MCP Integration — Java AI Agents" />
<meta property="og:description" content="Turn Spring Boot REST controllers into Model Context Protocol (MCP) tools using springdoc-openapi. Zero-rewrite agent integration via wmcp.sh." />
<meta property="og:url" content="${origin}/integration/spring-boot" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Spring Boot MCP Integration — Java AI Agents" />
<meta name="twitter:description" content="Turn Spring Boot REST controllers into Model Context Protocol (MCP) tools using springdoc-openapi. Zero-rewrite agent integration via wmcp.sh." />
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article","headline":"Spring Boot MCP Integration — Java AI Agents","description":"Turn Spring Boot REST controllers into Model Context Protocol (MCP) tools using springdoc-openapi. Zero-rewrite agent integration via wmcp.sh.","author":{"@type":"Organization","name":"WebMCP Anything"},"publisher":{"@type":"Organization","name":"WebMCP Anything","url":"https://wmcp.sh"},"datePublished":"2026-05-28","dateModified":"2026-05-28","mainEntityOfPage":"${origin}/integration/spring-boot"}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
  {"@type":"Question","name":"How do I generate an OpenAPI spec in Spring Boot?","acceptedAnswer":{"@type":"Answer","text":"Use the springdoc-openapi-starter-webmvc-ui dependency. It automatically scans your @RestController classes and generates a Swagger UI and a machine-readable JSON/YAML spec."}},
  {"@type":"Question","name":"How does this compare to spring-ai-mcp?","acceptedAnswer":{"@type":"Answer","text":"spring-ai-mcp is a dedicated framework for building AI functionality in Java. wmcp.sh is a language-agnostic edge gateway: you keep your existing standard REST endpoints, and wmcp.sh translates them into MCP tools for any client."}},
  {"@type":"Question","name":"How are Spring Security configurations handled?","acceptedAnswer":{"@type":"Answer","text":"Add @SecurityRequirement to your OpenAPI endpoints. wmcp.sh will forward the provided credentials (like a JWT) in the Authorization header, allowing your standard Spring Security filters to validate them."}},
  {"@type":"Question","name":"Can I filter which endpoints become tools?","acceptedAnswer":{"@type":"Answer","text":"Yes. Group them by OpenAPI tags using the @Tag annotation in Spring, then pass '?tag=agent' to wmcp.sh when configuring your MCP tools."}}
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
  <div class="badge"><span class="dot"></span> INTEGRATION &middot; SPRING-BOOT</div>
  <h1>Spring Boot MCP Integration</h1>
  <p class="sub">Java enterprises have thousands of REST endpoints. Turn your Spring Boot controllers into Model Context Protocol (MCP) tools dynamically via OpenAPI and wmcp.sh, without adding heavyweight custom MCP servers.</p>
</header>

<section id="wedge">
  <div class="section-label">the gap</div>
  <h2>Bridging Java backends to AI</h2>
  <p class="section-sub">Rewriting a complex, secure, mature Spring Boot backend into an MCP-native server is a massive undertaking. Java developers often struggle with integrating modern agent frameworks seamlessly. But you don't have to rewrite your app.</p>
  <p class="section-sub">Using <code>springdoc-openapi</code>, you can extract the exact parameters, validation rules, and security contexts of your endpoints. wmcp.sh parses this spec and serves it as native MCP tools.</p>
</section>

<section id="how">
  <div class="section-label">the architecture</div>
  <h2>From @RestController to MCP tool</h2>
  <pre><code><span class="c">// Java - Spring Boot Controller</span>
<span class="k">import</span> org.springframework.web.bind.annotation.*;
<span class="k">import</span> io.swagger.v3.oas.annotations.Operation;
<span class="k">import</span> io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping(<span class="s">"/api/customers"</span>)
@Tag(name = <span class="s">"agent"</span>)
<span class="k">public class</span> CustomerController {

    @PostMapping
    @Operation(summary = <span class="s">"Create a customer"</span>, description = <span class="s">"Registers a new enterprise customer."</span>)
    <span class="k">public</span> Customer createCustomer(@RequestBody CustomerDto dto) {
        <span class="k">return</span> customerService.create(dto);
    }
}

<span class="c"># Pass the generated spec to wmcp.sh</span>
<span class="k">curl</span> -X GET <span class="s">"https://wmcp.sh/api/v1/tools?url=https://your-java-app.com/v3/api-docs&tag=agent"</span></code></pre>
</section>

<section id="capabilities">
  <div class="section-label">capability</div>
  <h2>Hand-rolled vs OpenAPI translation</h2>
  <table>
    <thead><tr><th>Capability</th><th>Custom Java MCP Server</th><th>With wmcp.sh</th></tr></thead>
    <tbody>
      <tr><td><strong>Architecture</strong></td><td>⚠️ Runs alongside or inside your app</td><td class="ours">✅ External proxy via OpenAPI</td></tr>
      <tr><td><strong>Spring Security</strong></td><td>❌ Must adapt to MCP transport</td><td class="ours">✅ HTTP Authorization headers work normally</td></tr>
      <tr><td><strong>Validation</strong></td><td>⚠️ Duplicate @Valid rules to JSON schema</td><td class="ours">✅ JSR-303 validations map to OpenAPI automatically</td></tr>
      <tr><td><strong>Integration cost</strong></td><td>⚠️ High (custom dependencies)</td><td class="ours">✅ Zero (relies entirely on REST)</td></tr>
    </tbody>
  </table>
</section>

<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions.</h2>
  <details><summary>How do I generate an OpenAPI spec in Spring Boot?</summary><p class="answer">Use the <code>springdoc-openapi-starter-webmvc-ui</code> dependency. It automatically scans your <code>@RestController</code> classes and generates a Swagger UI and a machine-readable JSON/YAML spec.</p></details>
  <details><summary>How does this compare to spring-ai-mcp?</summary><p class="answer"><code>spring-ai-mcp</code> is a dedicated framework for building AI functionality in Java. wmcp.sh is a language-agnostic edge gateway: you keep your existing standard REST endpoints, and wmcp.sh translates them into MCP tools for any client.</p></details>
  <details><summary>How are Spring Security configurations handled?</summary><p class="answer">Add <code>@SecurityRequirement</code> to your OpenAPI endpoints. wmcp.sh will forward the provided credentials (like a JWT) in the Authorization header, allowing your standard Spring Security filters to validate them.</p></details>
  <details><summary>Can I filter which endpoints become tools?</summary><p class="answer">Yes. Group them by OpenAPI tags using the <code>@Tag</code> annotation in Spring, then pass <code>?tag=agent</code> to wmcp.sh when configuring your MCP tools.</p></details>
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
  <a href="/">Home</a> · <a href="/agent-ready">Agent-ready</a> · <a href="/managed">Done for you</a> · <a href="/blog">Blog</a> · <a href="/directory">Directory</a> · <a href="/directory/submit">Submit</a> · <a href="/integration/laravel">Laravel</a> · <a href="/integration/nestjs">NestJS</a> · <a href="/integration/hono">Hono</a> · <a href="https://github.com/New1Direction/webmcp-anything">GitHub</a>
</footer>
</body>
</html>`;
}
