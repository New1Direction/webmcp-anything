// /agent-ready/docs — SERP target: "ai-readable docs", "claude docs",
// "mintlify ai", "docusaurus ai", "ai friendly documentation",
// "make my docs ai ready", "docs mcp", "llm-friendly docs".

import { agentReadyVerticalHtml } from "./agent_ready_chrome";

export function agentReadyDocsHtml(origin: string): string {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do AI agents discover and use documentation today?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Three main paths. (1) Cursor's Composer pulls docs into context when a developer asks about a library — Cursor crawls the docs site at integration time. (2) Claude / ChatGPT use web-fetch tools when asked about a specific URL or library. (3) Pre-indexed: some agents have trained representations of popular docs (Stripe, Stripe-style), but most niche docs aren't pre-indexed. Path (1) and (2) need your docs to be fetchable as static HTML or structured markdown — not a JS-rendered shell.",
        },
      },
      {
        "@type": "Question",
        name: "What's the simplest thing I can ship today?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "An llms.txt file at your domain root, modeled after robots.txt. The convention is emerging — points agents at the canonical structure of your docs, the priority pages, and key examples. Companies like Anthropic and Cloudflare ship one. Five lines of markdown, ten minutes of work. It dramatically improves how Cursor / Claude pull your docs into context.",
        },
      },
      {
        "@type": "Question",
        name: "I use Mintlify / Docusaurus / Nextra / GitBook — are these agent-ready?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Partially. All four generate static HTML, which is the main hurdle cleared. Mintlify has the best out-of-box agent support — they ship structured JSON for each page that agents can directly consume. Docusaurus and Nextra need an additional plugin (or a /llms.txt sidecar). GitBook locks structured content behind their API. If you're choosing today and care about agent traffic, Mintlify > Nextra > Docusaurus > GitBook in agent-readiness order.",
        },
      },
      {
        "@type": "Question",
        name: "What's a docs MCP server and do I need one?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A docs MCP server exposes tools like search_docs(query), get_code_example(language, topic), and get_version_diff(from_version, to_version). Instead of agents scraping your docs and inferring structure, they call typed tools. Cloudflare ships one for their docs at docs.cloudflare.com — agents asking 'how do I set up Workers KV' get a structured answer with code, not a markdown blob. We can ship one for your docs via the managed service.",
        },
      },
      {
        "@type": "Question",
        name: "How do I make code examples agent-friendly?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Three things: (1) wrap each example in a <pre><code class='language-LANG' data-runnable='true'> with explicit language hints — agents extract this reliably; (2) include the imports / setup — agents copy-paste, snippets with missing imports cause silent failures; (3) test each example against the current API version and mark stale ones — agents trust your examples; trust degrades fast when they don't work.",
        },
      },
      {
        "@type": "Question",
        name: "Should I ship a vector embedding API for my docs?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Probably not directly. Agents already have their own embedding stacks (OpenAI, Voyage, Cohere). What helps more: ship structured search via your own /search endpoint that returns relevant doc chunks as JSON. Or use the managed wmcp.sh docs adapter — we generate embeddings on ingestion, expose a search_docs MCP tool, and agents query it like any other tool.",
        },
      },
      {
        "@type": "Question",
        name: "What about versioning? Agents see stale docs all the time.",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Big problem. Agents cache aggressively; users hit v3 of your API but agents reference v2 docs. Fix: include version metadata in every page's structured data (datePublished, softwareVersion). Maintain a /docs/changelog.json that lists API surface changes by version. Tag deprecated examples. And mark v2 docs with explicit 'this is an older version, current is v3 at /docs/v3' callouts that agents pick up.",
        },
      },
    ],
  };

  const bodyHtml = `
<!-- ========== Why ========== -->
<section id="why">
  <div class="section-label">Why docs matter for agents</div>
  <h2>Docs are the integration layer.</h2>
  <p class="section-sub">Cursor pulls docs into context. Claude reads URLs developers paste. ChatGPT scrapes the page when asked. Every meaningful integration starts with someone asking an agent "how do I use X?" and the agent quoting your docs. If your docs site is a JS-rendered shell, the agent gets nothing — and the integration goes to a competitor whose docs render.</p>
</section>

<!-- ========== Diagnosis ========== -->
<section id="diagnosis">
  <div class="section-label">5 things docs sites miss</div>
  <h2>The docs agent-readiness diagnostic.</h2>

  <div class="reason-card">
    <span class="num">1</span>
    <h3>JS-rendered docs return blank HTML to agents</h3>
    <p>Custom React/Vue docs that hydrate on the client return <code>&lt;div id="root"&gt;&lt;/div&gt;</code> to anything not running JS. Cursor and Claude's fetcher get nothing.</p>
    <p class="verdict">→ Agent fetches your URL: blank shell. Hallucinates the API surface from prior training.</p>
    <p class="fix"><strong>Fix:</strong> SSR / SSG (Next.js, Astro, Mintlify, Docusaurus). At minimum, output a static <code>&lt;noscript&gt;</code> block with the page's text content + structured frontmatter so agents have something to read.</p>
  </div>

  <div class="reason-card">
    <span class="num">2</span>
    <h3>No llms.txt — agents don't know what's important</h3>
    <p>Your docs have 500 pages. Which 20 should an agent prioritize? Without an <code>llms.txt</code> sitemap-for-agents at your domain root, the agent picks random pages or — worse — uses an LLM-generated guess.</p>
    <p class="verdict">→ Agent pulls /docs/changelog/2019-04 instead of /docs/quickstart.</p>
    <p class="fix"><strong>Fix:</strong> Ship <code>/llms.txt</code> with curated priority pages, key examples, and structural hints. Anthropic and Cloudflare both publish one — copy their structure. Ten minutes of work, dramatic context-quality improvement.</p>
  </div>

  <div class="reason-card">
    <span class="num">3</span>
    <h3>Code examples without runnable metadata</h3>
    <p>Code blocks rendered as <code>&lt;pre&gt;text&lt;/pre&gt;</code> without language hints, imports, or test status. Agents copy-paste, hit "ReferenceError: stripe is not defined", and the user blames your docs.</p>
    <p class="verdict">→ Agent's generated code uses your API correctly but missing imports. User sees error, distrusts the integration.</p>
    <p class="fix"><strong>Fix:</strong> Every code block: explicit <code>class="language-python"</code>, include imports, mark with <code>data-runnable="true"</code> if it runs as-is. Test each example in CI against the current API version. Stale examples kill agent trust.</p>
  </div>

  <div class="reason-card">
    <span class="num">4</span>
    <h3>No versioning signals — agents pull stale docs</h3>
    <p>You shipped v3, but agents trained on web crawls from 6 months ago still reference v2 endpoints. Without explicit version metadata + "older version" callouts on v2 pages, the agent doesn't know it's looking at stale content.</p>
    <p class="verdict">→ Agent writes integration against deprecated v2 API. Production silently breaks.</p>
    <p class="fix"><strong>Fix:</strong> Add <code>datePublished</code> + <code>softwareVersion</code> in JSON-LD on every page. Mark older versions with a banner ("v2 — current is v3"). Ship <code>/docs/changelog.json</code> with structured version-by-version changes. Agents parse all three.</p>
  </div>

  <div class="reason-card">
    <span class="num">5</span>
    <h3>No structured search — agents scrape</h3>
    <p>Your docs site has a search box that returns HTML results. Agents extract from HTML, miss context, hallucinate. A structured search endpoint that returns relevant chunks as JSON would let agents query "how do I authenticate?" and get a clean snippet.</p>
    <p class="verdict">→ Agent makes 5 requests to your docs site, parses each, mostly guesses.</p>
    <p class="fix"><strong>Fix:</strong> Expose <code>GET /search.json?q=…</code> returning <code>{ chunks: [{ title, content, url, version }] }</code>. Or expose a docs MCP server with <code>search_docs</code>, <code>get_code_example</code>, <code>list_endpoints</code> tools — the wmcp.sh managed service ships this for you.</p>
  </div>
</section>

<!-- ========== Fix ========== -->
<section id="fix">
  <div class="section-label">The fix in priority order</div>
  <h2>Four things, escalating value.</h2>

  <div class="fix-grid">
    <div class="fix-card">
      <h3>1. Static HTML</h3>
      <p class="body">SSR / SSG. Mintlify and Docusaurus do this out of box. The floor — without it, nothing else matters.</p>
    </div>
    <div class="fix-card">
      <h3>2. llms.txt</h3>
      <p class="body">Ten minutes of work. Maps agents to your priority pages. Massive context-quality lift.</p>
    </div>
    <div class="fix-card">
      <h3>3. Code-example metadata</h3>
      <p class="body">Language hints + imports + runnable flag. Stale examples kill agent trust faster than missing pages.</p>
    </div>
    <div class="fix-card">
      <h3>4. Docs MCP server</h3>
      <p class="body">Structured search + code examples + version diffs as tools. Top tier — separates Stripe-tier docs from the rest.</p>
    </div>
  </div>

  <div class="checklist">
    <h3>10-minute docs checklist</h3>
    <div class="row"><span class="mark">→</span><span><code>curl -A 'wmcp-check' https://your-docs.com/quickstart | grep -c "&lt;p&gt;"</code>. Returns &gt;0? Static HTML. Returns 0? JS-rendered — fix #1.</span></div>
    <div class="row"><span class="mark">→</span><span><code>curl -I https://your-docs.com/llms.txt</code>. 200? Good. 404? Ship one — 10 lines of markdown.</span></div>
    <div class="row"><span class="mark">→</span><span>Open your top quickstart page in Chrome. View source. Confirm <code>&lt;pre&gt;&lt;code class="language-…"&gt;</code> on every code block. If missing, fix #3.</span></div>
    <div class="row"><span class="mark">→</span><span>Try asking Cursor / Claude "how do I authenticate with &lt;your-product&gt;?". Does it cite your current docs? If it cites old version or hallucinates, you need #4 or #5.</span></div>
  </div>
</section>

<!-- ========== llms.txt example ========== -->
<section id="llmstxt">
  <div class="section-label">Sample llms.txt</div>
  <h2>The simplest agent-readiness ship.</h2>
  <p class="section-sub">Copy this template, adjust paths, host at <code>https://your-domain.com/llms.txt</code>.</p>

  <pre><code><span class="c"># YourProduct Documentation</span>

<span class="s">&gt;</span> <span class="c">A short one-paragraph description of what your product does.
&gt; Agents read this first. Keep it factual + specific.</span>

<span class="c">## Priority pages — start here</span>

- [Quickstart](https://your-docs.com/quickstart): 5-minute integration
- [Authentication](https://your-docs.com/auth): API keys + OAuth 2.1 + PKCE
- [Concepts](https://your-docs.com/concepts): customers, charges, refunds

<span class="c">## API reference</span>

- [Full reference](https://your-docs.com/reference)
- [OpenAPI spec](https://your-docs.com/openapi.json)
- [Postman collection](https://your-docs.com/postman.json)

<span class="c">## Code examples</span>

- [Python](https://your-docs.com/examples/python)
- [TypeScript](https://your-docs.com/examples/typescript)
- [cURL](https://your-docs.com/examples/curl)

<span class="c">## Changelog + versioning</span>

- [Changelog](https://your-docs.com/changelog)
- [v3 migration](https://your-docs.com/v3-migration)

<span class="c">## Optional — what NOT to use</span>

- ❌ <span class="s">/docs/v2</span> (deprecated, use <span class="s">/docs/v3</span>)
- ❌ <span class="s">/internal</span> (employee-only)</code></pre>
</section>

<!-- ========== Two paths ========== -->
<section id="paths">
  <div class="section-label">Two ways forward</div>

  <div class="path-grid">
    <div class="path diy">
      <div class="price">Free · ~30 min</div>
      <h3>DIY: ship llms.txt + metadata</h3>
      <p class="desc">Static HTML, llms.txt, language hints on code blocks. Most modern docs frameworks do most of this — you mostly check + ship the gaps.</p>
      <ul>
        <li>Add /llms.txt (the template above)</li>
        <li>Fix language hints in code blocks</li>
        <li>Add JSON-LD <code>Article</code> + <code>softwareVersion</code> per page</li>
        <li>Run wmcp.sh adapter chain against your docs URL — it surfaces what's missing</li>
      </ul>
      <a class="cta" href="/dashboard">Start free →</a>
    </div>

    <div class="path featured">
      <div class="price">$999/mo · ongoing</div>
      <h3>Managed: docs MCP server</h3>
      <p class="desc">We ingest your docs into a structured index + ship a docs MCP server with search, code-example retrieval, version-diff tools. White-label option at <code>docs-mcp.yourbrand.com</code>.</p>
      <ul>
        <li>Continuous indexing as you ship doc updates</li>
        <li>Tools: <code>search_docs</code>, <code>get_code_example</code>, <code>get_endpoint</code>, <code>get_version_diff</code></li>
        <li>Agent traffic analytics (which queries hit your docs)</li>
        <li>Stale-example detection — CI integration with your repo</li>
        <li>Optional white-label MCP subdomain</li>
      </ul>
      <a class="cta" href="/managed#contact">Get audit →</a>
    </div>
  </div>
</section>

<!-- ========== FAQ ========== -->
<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions from docs teams.</h2>

  <details><summary>How do AI agents discover and use documentation today?</summary>
  <div class="answer">Three paths: (1) Cursor's Composer pulls docs into context during integration tasks. (2) Claude / ChatGPT use web-fetch tools when given a URL. (3) Pre-indexed in training data (mostly only Stripe-tier well-known docs). Paths (1) and (2) need static-HTML or structured-markdown — not a JS-rendered shell.</div>
  </details>

  <details><summary>What's the simplest thing I can ship today?</summary>
  <div class="answer">An <code>llms.txt</code> file at your domain root, modeled after robots.txt. Convention is emerging — Anthropic, Cloudflare ship one. Five lines of markdown, ten minutes of work, dramatically improves Cursor / Claude context.</div>
  </details>

  <details><summary>Mintlify / Docusaurus / Nextra / GitBook — agent-ready?</summary>
  <div class="answer">Partially. All four generate static HTML (main hurdle cleared). Mintlify has best out-of-box agent support (structured JSON per page). Docusaurus + Nextra need a plugin or /llms.txt sidecar. GitBook locks structured content behind their API. Choosing today: Mintlify &gt; Nextra &gt; Docusaurus &gt; GitBook.</div>
  </details>

  <details><summary>What's a docs MCP server and do I need one?</summary>
  <div class="answer">An MCP server exposing <code>search_docs(query)</code>, <code>get_code_example(language, topic)</code>, <code>get_version_diff(from, to)</code> as tools. Instead of agents scraping, they call typed tools. Cloudflare ships one for docs.cloudflare.com. Worth shipping if developer adoption matters — separates top-tier docs from the rest.</div>
  </details>

  <details><summary>How do I make code examples agent-friendly?</summary>
  <div class="answer">Three things: explicit <code>class="language-LANG"</code>; include imports / setup; test against current API version in CI and mark stale examples. Stale examples kill agent trust fast.</div>
  </details>

  <details><summary>Should I ship a vector embedding API for my docs?</summary>
  <div class="answer">Probably not directly. Agents have their own embedding stacks. More useful: ship structured search via <code>/search.json?q=</code> returning chunked JSON. Or use the managed wmcp.sh docs adapter.</div>
  </details>

  <details><summary>What about versioning? Agents see stale docs all the time.</summary>
  <div class="answer">Add <code>datePublished</code> + <code>softwareVersion</code> in JSON-LD per page. Maintain <code>/docs/changelog.json</code> with version-by-version changes. Mark deprecated examples. Add "older version" banners — agents parse them.</div>
  </details>
</section>

<!-- ========== Docs-adjacent integrations ========== -->
<section id="live-integrations">
  <div class="section-label">Docs-adjacent on wmcp.sh</div>
  <h2>Live integrations for content-heavy products.</h2>
  <p class="section-sub">If your docs live in Notion, or your docs ARE your product (knowledge base, wiki), these wmcp.sh integrations are the closest match:</p>
  <div class="fix-grid">
    <a href="/integration/notion" class="fix-card" style="text-decoration:none;color:inherit;display:block">
      <h3>→ Notion integration</h3>
      <p class="body">Pages and databases as agent-callable tools. Same pattern works for docs-as-Notion-pages.</p>
    </a>
    <a href="/integration/openapi" class="fix-card" style="text-decoration:none;color:inherit;display:block">
      <h3>→ OpenAPI (if your docs are an API surface)</h3>
      <p class="body">Documentation often references an OpenAPI spec. wmcp.sh ingests the spec directly — your docs become the index, the spec is the tool surface.</p>
    </a>
  </div>
</section>

<!-- ========== Related ========== -->
<section id="related">
  <div class="section-label">More verticals</div>
  <h2>Other agent-readiness guides.</h2>
  <p class="section-sub">
    <a href="/agent-ready" style="color:var(--accent2);text-decoration:none">/agent-ready</a> (cornerstone) ·
    <a href="/agent-ready/shopify" style="color:var(--accent2);text-decoration:none">/agent-ready/shopify</a> ·
    <a href="/agent-ready/api" style="color:var(--accent2);text-decoration:none">/agent-ready/api</a> ·
    <a href="/agent-ready/saas" style="color:var(--accent2);text-decoration:none">/agent-ready/saas</a> ·
    <a href="/managed" style="color:var(--accent2);text-decoration:none">/managed</a>
  </p>
</section>
`;

  return agentReadyVerticalHtml({
    origin,
    pageTitle: "Make your documentation AI-readable — llms.txt + docs MCP | wmcp.sh",
    metaDescription:
      "Why Cursor, Claude, and ChatGPT can't find your docs — and the 5 fixes. llms.txt, code-example metadata, version signals, structured search, docs MCP server.",
    canonicalPath: "/agent-ready/docs",
    ogTitle: "Make your docs AI-readable — llms.txt + docs MCP server",
    ogDescription: "5 reasons agents miss your docs + the fixes. Mintlify / Docusaurus / Nextra / GitBook comparison.",
    twitterTitle: "Docs agent-readiness — wmcp.sh",
    twitterDescription: "llms.txt + structured code + docs MCP. The 5 things docs sites miss.",
    articleHeadline: "How to make your documentation AI-readable",
    articleDescription:
      "Five reasons most docs sites are invisible to AI agents, with the priority-ordered fix and an llms.txt template you can ship in 10 minutes.",
    faqJsonLd,
    heroBadge: "agent-ready · documentation",
    heroH1: "Make your docs readable by Cursor, Claude, and ChatGPT.",
    heroSubtitle:
      "Every integration starts with a developer asking an agent 'how do I use X?'. If your docs are a JS-rendered shell, return blank HTML to non-JS clients, or scatter code examples without language hints, the agent guesses — and the integration goes to a competitor whose docs render. Five things to ship, starting with a ten-minute llms.txt file.",
    heroHint: "Mintlify / Docusaurus / Nextra users: most of this works out of the box. Ten minutes of polish gets you the rest.",
    bodyHtml,
  });
}
