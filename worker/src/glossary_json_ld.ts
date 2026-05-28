export function glossaryJsonLdHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>JSON-LD for AI Agents: Glossary Definition | wmcp.sh</title>
<meta name="description" content="Define JSON-LD. Learn how schema.org vocabulary like Article, FAQPage, and Product power structured web data and how wmcp.sh extracts agent tools from it." />
<link rel="canonical" href="${origin}/glossary/json-ld" />
<meta property="og:title" content="JSON-LD for AI Agents: Glossary Definition | wmcp.sh" />
<meta property="og:description" content="Define JSON-LD. Learn how schema.org vocabulary like Article, FAQPage, and Product power structured web data and how wmcp.sh extracts agent tools from it." />
<meta property="og:url" content="${origin}/glossary/json-ld" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="JSON-LD for AI Agents: Glossary Definition | wmcp.sh" />
<meta name="twitter:description" content="Define JSON-LD. Learn how schema.org vocabulary like Article, FAQPage, and Product power structured web data and how wmcp.sh extracts agent tools from it." />
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article","headline":"JSON-LD for AI Agents: Glossary Definition | wmcp.sh","description":"Define JSON-LD. Learn how schema.org vocabulary like Article, FAQPage, and Product power structured web data and how wmcp.sh extracts agent tools from it.","author":{"@type":"Organization","name":"WebMCP Anything"},"publisher":{"@type":"Organization","name":"WebMCP Anything","url":"https://wmcp.sh"},"datePublished":"2026-05-28","dateModified":"2026-05-28","mainEntityOfPage":"${origin}/glossary/json-ld"}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
  {"@type":"Question","name":"What is JSON-LD?","acceptedAnswer":{"@type":"Answer","text":"JSON-LD (JavaScript Object Notation for Linked Data) is a method of encoding linked data using JSON. It allows websites to inject structured semantic context into HTML without altering the visual page."}},
  {"@type":"Question","name":"Why is JSON-LD important for AI agents?","acceptedAnswer":{"@type":"Answer","text":"Historically, JSON-LD was used for SEO rich snippets. Today, AI agents use it to understand web pages deterministically. wmcp.sh can ingest JSON-LD schemas and convert them into callable agent tools instantly."}},
  {"@type":"Question","name":"What are the most common schema.org types?","acceptedAnswer":{"@type":"Answer","text":"The most common vocabulary schemas include Article, Product, Recipe, and FAQPage. These define standard properties like price, author, or step-by-step instructions."}},
  {"@type":"Question","name":"Can JSON-LD power real-time interactions?","acceptedAnswer":{"@type":"Answer","text":"Yes, when coupled with a sub-100ms gateway like wmcp.sh, JSON-LD endpoints can serve as dynamic configuration files that update model context and available tools in real-time."}}
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
  nav .brand a { color: inherit; text-decoration: none; }
  nav .brand span { color: var(--accent2); }
  nav .links { display: flex; gap: 22px; font-size: .9rem; }
  nav .links a { color: var(--muted); text-decoration: none; }
  nav .cta { background: var(--bg2); border: 1px solid var(--border); padding: 7px 14px; border-radius: 8px; font-size: .85rem; color: var(--text); text-decoration: none; font-weight: 600; }
  header.hero { padding: 50px 0 30px; }
  .badge { display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;font-size:.7rem;letter-spacing:.15em;text-transform:uppercase;font-weight:700;background:linear-gradient(90deg,rgba(124,92,255,.18),rgba(0,229,255,.18));border:1px solid rgba(124,92,255,.35);margin-bottom:18px; }
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
  td.ours { background: rgba(124,92,255,0.05); }
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
  <a class="cta" href="/dashboard">Dashboard &rarr;</a>
</nav>

<div class="wrap">

<header class="hero">
  <div class="badge"><span class="dot"></span> GLOSSARY &middot; /GLOSSARY/JSON-LD</div>
  <h1>JSON-LD (Linked Data)</h1>
  <p class="sub">AI agents struggle to parse unstructured HTML. JSON-LD allows you to embed machine-readable semantics directly into your pages. wmcp.sh leverages this structured data to instantly convert any webpage into a callable tool.</p>
</header>

<section id="wedge">
  <div class="section-label">the gap</div>
  <h2>Bridging the gap between content and execution</h2>
  <p class="section-sub">Originally designed for Google SEO rich snippets, the schema.org vocabulary provides standard structures for things like <code>Product</code>, <code>Article</code>, <code>Recipe</code>, and <code>FAQPage</code>. Traditionally, these were static declarations.</p>
  <p class="section-sub">However, with the rise of autonomous agents, JSON-LD has a new purpose. Instead of merely indexing content, an AI model can read a JSON-LD payload to understand the exact structure of a page, its price variables, or available actions. wmcp.sh acts as a bridge, parsing JSON-LD on the fly and serving it back to agents as executable, sub-100ms tool schemas. <em>(Note: wmcp.sh is not affiliated with Google or schema.org.)</em></p>
</section>

<section id="how">
  <div class="section-label">the implementation</div>
  <h2>How to structure JSON-LD for AI extraction</h2>
  <pre><code><span class="c">&lt;!-- Example embedded in the head of your HTML --&gt;</span>
&lt;script type=<span class="s">"application/ld+json"</span>&gt;
{
  <span class="s">"@context"</span>: <span class="s">"https://schema.org"</span>,
  <span class="s">"@type"</span>: <span class="s">"Product"</span>,
  <span class="s">"name"</span>: <span class="s">"Acme Corp Enterprise License"</span>,
  <span class="s">"description"</span>: <span class="s">"Software license for support@example.com environments."</span>,
  <span class="s">"offers"</span>: {
    <span class="s">"@type"</span>: <span class="s">"Offer"</span>,
    <span class="s">"price"</span>: <span class="s">"999.00"</span>,
    <span class="s">"priceCurrency"</span>: <span class="s">"USD"</span>,
    <span class="s">"availability"</span>: <span class="s">"https://schema.org/InStock"</span>
  }
}
&lt;/script&gt;
<span class="c">&lt;!-- wmcp.sh automatically extracts this block via its agent API --&gt;</span></code></pre>
</section>

<section id="capabilities">
  <div class="section-label">capability</div>
  <h2>Why JSON-LD matters for agents</h2>
  <table>
    <thead><tr><th>Capability</th><th>Without Structured Data</th><th>With JSON-LD & wmcp.sh</th></tr></thead>
    <tbody>
      <tr><td><strong>Content Extraction</strong></td><td>⚠️ Requires brittle CSS selector scraping.</td><td class="ours">✅ Perfect determinism via schema.org.</td></tr>
      <tr><td><strong>Execution Latency</strong></td><td>❌ Scraping HTML DOMs takes 1-3 seconds.</td><td class="ours">✅ Extracted at the edge in sub-100ms.</td></tr>
      <tr><td><strong>Dynamic State</strong></td><td>❌ Stale agent context.</td><td class="ours">✅ Micro-cached (short TTL, ~1s) payloads.</td></tr>
      <tr><td><strong>Authentication Requirements</strong></td><td>⚠️ Hard to pass tokens to scraping bots.</td><td class="ours">✅ Processed via encrypted credentials vault.</td></tr>
    </tbody>
  </table>
</section>

<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions.</h2>
  <details><summary>Does JSON-LD replace OpenAPI?</summary><p class="answer">No. JSON-LD is excellent for descriptive entities (like a Product catalog or a Recipe), while OpenAPI is required for complex state mutations (like POST requests). wmcp.sh supports both paradigms interchangeably.</p></details>
  <details><summary>What is schema.org?</summary><p class="answer">It is a collaborative, community activity whose mission is to create, maintain, and promote schemas for structured data on the Internet. It is the vocabulary most commonly used within JSON-LD payloads.</p></details>
  <details><summary>How do agents use FAQPage schema?</summary><p class="answer">By extracting FAQPage JSON-LD, an agent can instantly inject vetted Q&A pairs into its context window, preventing hallucinations and reducing the need to hallucinate answers based on unstructured text.</p></details>
</section>

<section id="upgrade" style="margin-top:36px;background:linear-gradient(135deg,var(--card),rgba(124,92,255,0.08));border:1px solid rgba(124,92,255,0.35);border-radius:16px;padding:22px 26px">
  <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;justify-content:space-between">
    <div style="flex:1;min-width:240px">
      <div style="font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent2);font-weight:700;margin-bottom:6px">Need this done for you?</div>
      <h3 style="margin:0 0 4px;font-size:1.05rem;color:var(--text)">Skip the wiring — we build, deploy, and monitor.</h3>
      <p style="color:var(--muted);margin:0;font-size:.92rem">Custom adapter + hosted MCP at <code>mcp.yourbrand.com</code> + verified badge. Pricing: <strong style="color:var(--text)">Starter $499 one-time</strong>, <strong>Pro $999/mo</strong>, or <strong>Enterprise $4,999+/mo</strong>.</p>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <a href="/managed" style="display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#7c5cff,#00e5ff);color:#0c0c14;padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:700;font-size:.9rem">See /managed &rarr;</a>
      <a href="/directory/submit" style="display:inline-flex;align-items:center;gap:6px;background:#11111c;border:1px solid #26263a;color:var(--text);padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:600;font-size:.9rem">Submit (free)</a>
    </div>
  </div>
</section>

</div>

<footer>
  <a href="/">Home</a> &middot; <a href="/agent-ready">Agent-ready</a> &middot; <a href="/managed">Done for you</a> &middot; <a href="/blog">Blog</a> &middot; <a href="/directory">Directory</a> &middot; <a href="/directory/submit">Submit</a> &middot; <a href="/glossary/openapi-spec">OpenAPI Spec</a> &middot; <a href="/glossary/mcp">MCP</a> &middot; <a href="https://github.com/New1Direction/webmcp-anything">GitHub</a>
</footer>
</body>
</html>`;
}
