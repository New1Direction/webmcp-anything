// /use-case/research-agent — use-case page. SERP target: "how to build a research agent",
// "autonomous research agent", "arxiv ai agent", "deep research agent mcp", "perplexity-style agent".

export function useCaseResearchAgentHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>How to Build an Autonomous Research Agent with Web Tools — wmcp.sh</title>
<meta name="description" content="Build a research agent that searches, reads, cross-references, and cites. Wire arXiv, GitHub, and any webpage as MCP tools — schema-valid search-then-read loops." />
<link rel="canonical" href="${origin}/use-case/research-agent" />
<meta property="og:title" content="How to Build an Autonomous Research Agent with Web Tools" />
<meta property="og:description" content="Search-then-read loops over arXiv, GitHub, and arbitrary web pages. Schema-valid MCP tools, no scraping glue." />
<meta property="og:url" content="${origin}/use-case/research-agent" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="How to Build an Autonomous Research Agent with Web Tools" />
<meta name="twitter:description" content="Build search-then-read research loops over arXiv, GitHub, and any URL — without writing scrapers." />
<meta name="twitter:image" content="${origin}/og.png" />
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article","headline":"How to Build an Autonomous Research Agent with Web Tools","description":"Wire arXiv, GitHub, and generic webpage extraction into a search-then-read research loop using MCP tools.","author":{"@type":"Organization","name":"WebMCP Anything"},"publisher":{"@type":"Organization","name":"WebMCP Anything","url":"https://wmcp.sh"},"datePublished":"2026-05-28","dateModified":"2026-05-28","mainEntityOfPage":"${origin}/use-case/research-agent"}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
  {"@type":"Question","name":"What is an autonomous research agent?","acceptedAnswer":{"@type":"Answer","text":"A research agent is an LLM loop that issues queries, reads results, refines its hypothesis, and produces a synthesis with citations. It differs from one-shot RAG by repeatedly choosing what to read next — a search-then-read pattern that can run for dozens of turns over arXiv, GitHub, and arbitrary URLs."}},
  {"@type":"Question","name":"What tools should the research agent have?","acceptedAnswer":{"@type":"Answer","text":"At minimum: a search index (arXiv, Semantic Scholar, or web search), a fetcher that returns clean text from a URL, a code-search tool (GitHub repo + issue + code search), and a notes scratchpad. wmcp.sh provides all three retrieval surfaces as MCP tools."}},
  {"@type":"Question","name":"How does this compare to Perplexity or ChatGPT deep research?",  "acceptedAnswer":{"@type":"Answer","text":"Hosted deep-research products are great for general questions but opaque about which sources they crawl, run on the vendor's model, and can't be pointed at your private corpus. A custom MCP-backed research agent runs on the model you choose, uses tools you can audit, and can be extended with internal docs. wmcp.sh is not affiliated with Perplexity or OpenAI."}},
  {"@type":"Question","name":"How do you stop runaway loops?","acceptedAnswer":{"@type":"Answer","text":"Cap the agent at N search-then-read iterations, require a citation in the final answer, and use a separate verifier pass that checks each claim against retrieved text. Most production research loops bound at 8–20 turns with a hard token budget."}},
  {"@type":"Question","name":"Can the agent read PDFs and GitHub READMEs?","acceptedAnswer":{"@type":"Answer","text":"Yes. wmcp.sh resolves arbitrary URLs — arXiv abstract pages, GitHub README files, blog posts — into clean text via the /api/v1/tools endpoint. For GitHub repository structure and issue search, use the dedicated /integration/github adapter."}}
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
  .arch { background:var(--card);border:1px solid var(--border);border-radius:12px;padding:18px 20px;color:var(--muted);font-size:.92rem;line-height:1.65; }
  .arch strong { color: var(--text); }
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
    <a href="/directory">Directory</a>
    <a href="/blog">Blog</a>
  </div>
  <a class="cta" href="/dashboard">Dashboard →</a>
</nav>

<div class="wrap">

<header class="hero">
  <div class="badge"><span class="dot"></span> Use Case &middot; research-agent</div>
  <h1>How to build an autonomous research agent.</h1>
  <p class="sub">A research agent isn&rsquo;t a chatbot — it&rsquo;s a loop. It searches, reads what it finds, narrows the question, searches again, and at the end produces something cited. The model isn&rsquo;t the limiting factor anymore. The limiting factor is whether your search and fetch tools return clean, schema-shaped text the model can actually reason about.</p>
</header>

<section id="wedge">
  <div class="section-label">The gap</div>
  <h2>Search is easy. Fetch is the bottleneck.</h2>
  <p class="section-sub">Most research loops fall apart the moment the model wants to read a page. Raw HTML is noisy; PDFs need an extractor; arXiv has its own metadata schema; GitHub READMEs are buried under repo trees; rate limits punish naive crawlers. Teams end up writing five custom fetchers and a per-site sanitizer, then babysit them as the web changes underneath.</p>
  <p class="section-sub">Worse, the model can&rsquo;t reason about whether its tools succeeded or failed unless those tools return MCP-compliant JSON with consistent error shapes. Half the &ldquo;the agent gave up early&rdquo; failures trace back to a fetcher that returned a 200 with garbage.</p>
  <p class="section-sub">wmcp.sh is a tool gateway for exactly this. Point <code>/api/v1/tools?url=...</code> at an arXiv listing, a GitHub repo, a blog post, or a docs site, and get back schema-valid MCP tools your agent can call in a loop. wmcp.sh is not affiliated with arXiv, GitHub, or any cited corpus.</p>
</section>

<section id="architecture">
  <div class="section-label">Architecture</div>
  <h2>Search → read → reflect → repeat.</h2>
  <div class="arch">
    <p style="margin:0 0 10px"><strong>1. Question intake.</strong> The user supplies a research question and a hard turn budget (typically 8–20). The agent also receives a citation requirement — every claim in the final synthesis must point to a fetched URL.</p>
    <p style="margin:0 0 10px"><strong>2. Tool gateway (wmcp.sh).</strong> The agent boots with three tool clusters: an arXiv search adapter, a <a href="/integration/github" style="color:var(--accent2)">/integration/github</a> adapter for repo and issue search, and a generic fetcher via <code>${origin}/api/v1/tools?url=...</code> for any URL.</p>
    <p style="margin:0 0 10px"><strong>3. Reasoning loop.</strong> Each turn, the model picks search or fetch, reads the result, and decides whether to refine the query, follow a citation, or write a synthesis. A scratchpad tool persists notes across turns.</p>
    <p style="margin:0"><strong>4. Synthesis + verify.</strong> When the agent is ready it emits a final answer with inline citations. A second cheap-model pass verifies that each citation supports the claim — failures bounce back into the loop.</p>
  </div>
</section>

<section id="capabilities">
  <div class="section-label">Tools the agent needs</div>
  <h2>What wmcp.sh provides.</h2>
  <table>
    <thead>
      <tr><th>Capability</th><th>Source</th><th>How wmcp.sh wires it</th></tr>
    </thead>
    <tbody>
      <tr><td><strong>Academic paper search</strong></td><td>arXiv</td><td class="ours">✅ Resolve arXiv listing URLs via <code>/api/v1/tools</code>; structured JSON-LD on each abstract page</td></tr>
      <tr><td><strong>Repo + issue + code search</strong></td><td>GitHub</td><td class="ours">✅ Native adapter at <a href="/integration/github" style="color:var(--accent2)">/integration/github</a></td></tr>
      <tr><td><strong>Read a GitHub README</strong></td><td>raw.githubusercontent.com</td><td class="ours">✅ Generic URL extraction returns clean markdown</td></tr>
      <tr><td><strong>Read an arbitrary webpage</strong></td><td>Any URL</td><td class="ours">✅ <code>/api/v1/tools?url=&lt;any-url&gt;</code></td></tr>
      <tr><td><strong>Cite-and-verify a claim</strong></td><td>Second model pass</td><td class="ours">✅ Bundled into <a href="/managed" style="color:var(--accent2)">/managed</a> verifier loop</td></tr>
      <tr><td><strong>Scratchpad / notes</strong></td><td>Notion or Sheets</td><td class="ours">✅ Wire <a href="/integration/notion" style="color:var(--accent2)">/integration/notion</a> as a write target</td></tr>
    </tbody>
  </table>
</section>

<section id="code">
  <div class="section-label">Code</div>
  <h2>An iterative search-then-read loop.</h2>
  <p class="section-sub">Python sketch. The model decides each turn whether to search or read; the loop ends when it emits a final answer or the turn budget is hit.</p>
  <pre><code><span class="k">import</span> httpx
<span class="k">from</span> anthropic <span class="k">import</span> Anthropic

client = Anthropic()
WMCP = <span class="s">"${origin}"</span>

<span class="k">def</span> tools_for(url):
    <span class="k">return</span> httpx.get(<span class="s">f"{WMCP}/api/v1/tools"</span>, params={<span class="s">"url"</span>: url}).json()[<span class="s">"tools"</span>]

tools = (
    tools_for(<span class="s">"https://arxiv.org/list/cs.AI/recent"</span>)
    + tools_for(<span class="s">"https://github.com"</span>)              <span class="c"># GitHub adapter</span>
    + tools_for(<span class="s">"about:fetch"</span>)                     <span class="c"># generic page fetcher</span>
)

messages = [{<span class="s">"role"</span>: <span class="s">"user"</span>, <span class="s">"content"</span>: <span class="s">"Survey 2026 papers on speculative decoding. Cite every claim."</span>}]

<span class="k">for</span> turn <span class="k">in</span> range(20):
    resp = client.messages.create(model=<span class="s">"claude-sonnet-4-5"</span>, max_tokens=4096,
                                  tools=tools, messages=messages)
    messages.append({<span class="s">"role"</span>: <span class="s">"assistant"</span>, <span class="s">"content"</span>: resp.content})
    <span class="k">if</span> resp.stop_reason != <span class="s">"tool_use"</span>: <span class="k">break</span>
    <span class="c"># resolve each tool_use block via wmcp.sh and append tool_result</span>
    <span class="c"># (omitted for brevity — standard Anthropic tool_use protocol)</span>

<span class="k">print</span>(messages[-1])  <span class="c"># final synthesis with inline citations</span></code></pre>
</section>

<section id="wins">
  <div class="section-label">Where we win</div>
  <h2>DIY scrapers vs MCP gateway.</h2>
  <div class="wins-grid">
    <div class="wins-card">
      <h3>DIY scraper stack:</h3>
      <ul>
        <li>Per-site sanitizers that drift weekly</li>
        <li>Inconsistent error shapes confuse the model</li>
        <li>PDF, HTML, and JSON each need a different path</li>
        <li>Rate-limit handling rolled by hand</li>
      </ul>
    </div>
    <div class="wins-card us">
      <h3>wmcp.sh tool gateway:</h3>
      <ul>
        <li>One <code>/api/v1/tools</code> call returns clean MCP tools</li>
        <li>Edge cached, sub-50ms cold tool listing</li>
        <li>Uniform error envelopes the model can reason about</li>
        <li>Add a new source by passing a new URL</li>
      </ul>
    </div>
  </div>
</section>

<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions.</h2>
  <details><summary>What is an autonomous research agent?</summary><div class="answer">A loop — search, read, refine, repeat — that ends with a cited synthesis. Distinct from one-shot RAG by virtue of iteration.</div></details>
  <details><summary>What tools should it have?</summary><div class="answer">A search index, a fetcher, a code-search surface, and a notes scratchpad. wmcp.sh provides the first three; <a href="/integration/notion" style="color:var(--accent2)">/integration/notion</a> covers the fourth.</div></details>
  <details><summary>How does this compare to Perplexity or ChatGPT deep research?</summary><div class="answer">Hosted products run on a vendor model with vendor tools. A custom agent runs on the model you pick and the corpus you control.</div></details>
  <details><summary>How do you stop runaway loops?</summary><div class="answer">Hard turn budget, hard token budget, mandatory citations, and a verifier pass.</div></details>
  <details><summary>Can the agent read PDFs and READMEs?</summary><div class="answer">Yes. The generic <code>/api/v1/tools?url=...</code> path resolves both into clean text.</div></details>
</section>

<section id="related">
  <div class="section-label">Related</div>
  <h2>Keep exploring.</h2>
  <p class="section-sub">
    <a href="/agent-ready" style="color:var(--accent2);text-decoration:none">/agent-ready</a> &middot;
    <a href="/integration/github" style="color:var(--accent2);text-decoration:none">/integration/github</a> &middot;
    <a href="/integration/notion" style="color:var(--accent2);text-decoration:none">/integration/notion</a> &middot;
    <a href="/use-case/code-review-bot" style="color:var(--accent2);text-decoration:none">/use-case/code-review-bot</a> &middot;
    <a href="/managed" style="color:var(--accent2);text-decoration:none">/managed</a>
  </p>
</section>

</div>

<section id="upgrade" style="margin-top:36px;background:linear-gradient(135deg,var(--card),rgba(124,92,255,0.08));border:1px solid rgba(124,92,255,0.35);border-radius:16px;padding:22px 26px">
  <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;justify-content:space-between">
    <div style="flex:1;min-width:240px">
      <div style="font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent2);font-weight:700;margin-bottom:6px">Need this built for you?</div>
      <h3 style="margin:0 0 4px;font-size:1.05rem;color:var(--text)">Hosted research loop with verifier + citations.</h3>
      <p style="color:var(--muted);margin:0;font-size:.92rem">Custom corpus adapter + hosted MCP at <code>mcp.yourbrand.com</code> + verified badge. <strong style="color:var(--text)">Starter $499 one-time</strong> · Pro $999/mo · Enterprise $4,999+/mo.</p>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <a href="/managed" style="display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#7c5cff,#00e5ff);color:#0c0c14;padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:700;font-size:.9rem">See /managed →</a>
      <a href="/directory/submit" style="display:inline-flex;align-items:center;gap:6px;background:#11111c;border:1px solid #26263a;color:var(--text);padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:600;font-size:.9rem">Submit (free)</a>
    </div>
  </div>
</section>

<footer>
  <a href="/">Home</a> · <a href="/agent-ready">Agent-ready</a> · <a href="/managed">Done for you</a> · <a href="/directory">Directory</a> · <a href="/directory/submit">Submit</a> · <a href="/blog">Blog</a> · <a href="/use-case/customer-support">Support</a> · <a href="/use-case/sales-assistant">Sales</a> · <a href="/use-case/code-review-bot">Code review</a> · <a href="/use-case/personal-assistant">Personal assistant</a>
</footer>

</body>
</html>`;
}
