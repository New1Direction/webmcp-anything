// /agent-ready/api — SERP target: "openapi to mcp", "make my api ai-ready",
// "api agent integration", "saas mcp", "ship openapi spec", "ai-callable api".

import { agentReadyVerticalHtml } from "./agent_ready_chrome";

export function agentReadyApiHtml(origin: string): string {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "I already publish an OpenAPI spec — what else do I need?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You're 80% done. Three remaining steps: (1) host the spec at a stable, cacheable URL like /openapi.json that doesn't require auth to fetch, (2) tag operations so agents can filter (e.g. agents listing 'customer' operations on Stripe shouldn't see 400 tools, just the 30 relevant ones), (3) make auth agent-friendly — OAuth 2.1 with PKCE + Dynamic Client Registration if you serve consumer agents. wmcp.sh's OpenAPI adapter handles the ingestion + filtering + auth-injection automatically.",
        },
      },
      {
        "@type": "Question",
        name: "We don't have an OpenAPI spec. How do we ship one?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Depends on your framework. FastAPI, Hono, NestJS, ASP.NET Core, Spring Boot, Laravel all generate OpenAPI 3 from route annotations — usually one config flip. Express/Koa need a generator like swagger-jsdoc or a TypeBox / Zod-to-OpenAPI bridge. Worst case: GPT can scaffold a spec from your route handlers in an afternoon. Once it exists, host at /openapi.json and you're done for agents.",
        },
      },
      {
        "@type": "Question",
        name: "What's the right auth flow for an API serving AI agents?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Three options: (a) API keys — simplest, works with every agent framework via _auth pseudo-arg; (b) OAuth 2.1 + PKCE — needed for consumer agents (Claude.ai, Cursor) where the user is upstream, not the agent operator; (c) MCP-spec OAuth — same as (b) plus RFC 7591 Dynamic Client Registration so wmcp.sh-style proxies can self-register. DefiLlama's MCP is the canonical (c) example. If you're choosing today, build (c) — every modern MCP client supports it.",
        },
      },
      {
        "@type": "Question",
        name: "Stripe has 400 endpoints. Won't that flood the agent?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes — most agent frameworks struggle past 50 tools. Solutions: (1) tag your operations so the agent fetches a subset (Stripe's spec is tagged by domain — customers, charges, invoices, etc.); (2) ship a curated /openapi/agent-subset.json with only the high-value operations; (3) expose a meta-tool 'list_capabilities' that returns short descriptions, and let the agent pull full schemas on demand. wmcp.sh's OpenAPI ingester respects tags so callers can request /api/v1/tools?url=...&tag=customers and get just that slice.",
        },
      },
      {
        "@type": "Question",
        name: "How do I make my rate limits agent-friendly without losing protection?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Two things: (1) issue API keys with explicit per-key quotas instead of IP-based limits — agents share IPs and IP limits break legitimate use; (2) expose your rate limit state via response headers (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset) so agents can throttle themselves before getting 429'd. Anthropic does this perfectly on the Messages API — agents read the headers and back off. Don't return rate-limit info in the body only.",
        },
      },
      {
        "@type": "Question",
        name: "What if my API requires user OAuth that agents can't drive?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Two paths: (a) build the MCP spec OAuth (RFC 7591 DCR + PKCE) — Claude.ai / Cursor / Codex natively drive this; (b) use wmcp.sh's OAuth-proxy pattern — your customers authenticate once at wmcp.sh, then their agents call wmcp.sh/mcp/yourapi with a bearer token and we inject their stored OAuth credential transparently. Path (a) is the right long-term move; path (b) is the faster ship if you can't change your auth surface today.",
        },
      },
      {
        "@type": "Question",
        name: "Do agents pull my docs into context when developers ask Claude / Cursor about my API?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes — and this is a free distribution channel most API companies miss. Cursor's Composer pulls API docs into context when developers ask 'how do I integrate X'. If your docs site is JS-rendered with no static HTML, you're invisible to that flow. See /agent-ready/docs for the docs-side fixes.",
        },
      },
    ],
  };

  const bodyHtml = `
<!-- ========== Why APIs ========== -->
<section id="why">
  <div class="section-label">Why your API needs to be agent-callable</div>
  <h2>Every API is now a tool surface.</h2>
  <p class="section-sub">When a developer asks Cursor "integrate Stripe", Cursor pulls Stripe's OpenAPI spec + docs into context and generates working code in 30 seconds. When the same developer asks about a competitor's API and it's not agent-callable, they don't get an integration — they get hand-rolled HTTP calls or move on. Same dynamic at the consumer-agent level: Claude calls APIs through MCP tools; APIs without MCP exposure don't get called.</p>
</section>

<!-- ========== Diagnosis ========== -->
<section id="diagnosis">
  <div class="section-label">5 things API providers miss</div>
  <h2>The API agent-readiness diagnostic.</h2>

  <div class="reason-card">
    <span class="num">1</span>
    <h3>No OpenAPI spec, or spec exists but isn't published</h3>
    <p>Internal API docs in Confluence, Notion, or a custom docs site — usable by humans, invisible to agents. Without a machine-readable spec at a stable URL, every integration is hand-built.</p>
    <p class="verdict">→ Agent says: "I don't know how to call this API." Falls back to scraping docs (slow, lossy).</p>
    <p class="fix"><strong>Fix:</strong> Generate OpenAPI 3 from your framework's route annotations (FastAPI, Hono, NestJS, ASP.NET, Spring Boot — all one-line config). Host at <code>/openapi.json</code> at a stable URL. wmcp.sh ingests it and emits one MCP tool per operation.</p>
  </div>

  <div class="reason-card">
    <span class="num">2</span>
    <h3>Tool count blows past model limits — no tagging or filtering</h3>
    <p>Stripe's spec is 400+ endpoints. Most agent frameworks struggle past 50 tools (context burn, decision paralysis). Without tags or curation, the agent gets overwhelmed and picks wrong.</p>
    <p class="verdict">→ Agent ingests 400 tools, asks for an answer about customer billing, can't disambiguate.</p>
    <p class="fix"><strong>Fix:</strong> Tag your operations by domain (customers / charges / subscriptions / etc.). wmcp.sh respects OpenAPI <code>tags</code> — callers fetch <code>?tag=customers</code> and get the 30 relevant tools, not 400.</p>
  </div>

  <div class="reason-card">
    <span class="num">3</span>
    <h3>Auth flow not agent-driveable</h3>
    <p>"Sign in with our SDK" or "go to dashboard and create an API key" works for human integrators. It doesn't work when an AI agent is the integrator on the user's behalf.</p>
    <p class="verdict">→ Agent hits 401, can't progress, escalates to user. Friction.</p>
    <p class="fix"><strong>Fix:</strong> Ship OAuth 2.1 + PKCE + Dynamic Client Registration (RFC 7591). Claude.ai, Cursor, Codex, MCP-spec clients natively drive this. Alternative: support a <code>_auth</code> pseudo-arg where the user provides their key via the agent's UI. wmcp.sh handles both patterns.</p>
  </div>

  <div class="reason-card">
    <span class="num">4</span>
    <h3>Rate limits hostile to agents (IP-based, no headers)</h3>
    <p>Agents share IPs (Cloudflare workers, AWS Lambda, residential proxies). IP-based rate limits cause legit agents to share quotas with bots. Plus: rate limit info only in 429 response body means agents discover the limit by being rate-limited, not by self-throttling.</p>
    <p class="verdict">→ Agent gets 429 mid-task. No retry-after-friendly headers. Tool call fails.</p>
    <p class="fix"><strong>Fix:</strong> Per-API-key rate limits (not per-IP). Always emit <code>X-RateLimit-Remaining</code> + <code>X-RateLimit-Reset</code> + <code>Retry-After</code> headers. Anthropic's Messages API is the gold standard — agents read those headers and self-throttle.</p>
  </div>

  <div class="reason-card">
    <span class="num">5</span>
    <h3>No SDK, no examples, no usage patterns</h3>
    <p>Even with an OpenAPI spec, an agent generating code from your API benefits massively from idiomatic examples ("how do you usually create a customer?"). Without them, agents construct technically-correct-but-awkward calls.</p>
    <p class="verdict">→ Agent generates code that compiles but does the obvious-wrong thing.</p>
    <p class="fix"><strong>Fix:</strong> In your OpenAPI spec, add <code>x-codeSamples</code> on key operations with idiomatic curl + Python + TypeScript snippets. Or expose a <code>/openapi/cookbook</code> sidecar — wmcp.sh will surface it to agents.</p>
  </div>
</section>

<!-- ========== Fix ========== -->
<section id="fix">
  <div class="section-label">The fix</div>
  <h2>4 things, in this order.</h2>

  <div class="fix-grid">
    <div class="fix-card">
      <h3>1. Publish OpenAPI</h3>
      <p class="body">Generate from your framework's annotations. Host at <code>/openapi.json</code>. Stable URL, no auth to fetch.</p>
    </div>
    <div class="fix-card">
      <h3>2. Tag operations</h3>
      <p class="body">Group by domain (customers, billing, etc.) so agents can fetch subsets. Keeps tool counts &lt;50.</p>
    </div>
    <div class="fix-card">
      <h3>3. Ship MCP-spec OAuth</h3>
      <p class="body">PKCE + DCR (RFC 7591). DefiLlama's MCP is the canonical example. wmcp.sh proxies it transparently if you can't ship today.</p>
    </div>
    <div class="fix-card">
      <h3>4. Rate-limit headers</h3>
      <p class="body">Per-key (not per-IP) + <code>X-RateLimit-*</code> headers so agents self-throttle. Anthropic-style.</p>
    </div>
  </div>

  <div class="checklist">
    <h3>10-minute API checklist</h3>
    <div class="row"><span class="mark">→</span><span><code>curl -I https://your-api.com/openapi.json</code>. Returns 200 + <code>application/json</code>? Good. If 404, fix step 1.</span></div>
    <div class="row"><span class="mark">→</span><span>Count operations in your spec. &gt;50? Make sure they're tagged. Run: <code>curl 'https://wmcp.sh/api/v1/tools?url=https://your-api.com/openapi.json'</code> and count <code>tools[]</code>.</span></div>
    <div class="row"><span class="mark">→</span><span>Hit a 429 from a test client. Are <code>X-RateLimit-*</code> headers present? If not, add them at your API gateway / framework level.</span></div>
    <div class="row"><span class="mark">→</span><span>Add yourself to <a href="/directory" style="color:var(--accent2);text-decoration:none">wmcp.sh/directory</a> as an API-side entry — agents discover you when developers ask "what APIs do you know for X?"</span></div>
  </div>
</section>

<!-- ========== Demo ========== -->
<section id="demo">
  <div class="section-label">What it looks like</div>
  <h2>Drop your spec, get MCP tools.</h2>
  <p class="section-sub">No code changes on your API. Just point wmcp.sh at your spec URL.</p>

  <pre><code><span class="c"># Example: Stripe ships their spec at a public URL</span>
<span class="k">curl</span> <span class="s">'${origin}/api/v1/tools?url=https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.json'</span>

<span class="c"># Returns ~400 MCP tools, fully typed. Or with tag filter:</span>
<span class="k">curl</span> <span class="s">'${origin}/api/v1/tools?url=...spec3.json&tag=customers'</span>
<span class="c"># Returns only ~30 customer-related tools — fits in any agent's tool budget.</span>

<span class="c"># Or for your API specifically:</span>
<span class="k">curl</span> <span class="s">'${origin}/api/v1/tools?url=https://YOUR-API.com/openapi.json'</span>
<span class="c"># Each operation in your spec becomes:</span>
{
  <span class="s">"name"</span>: <span class="s">"create_customer"</span>,
  <span class="s">"description"</span>: <span class="s">"Create a new customer"</span>,
  <span class="s">"inputSchema"</span>: { ... }, <span class="c">// derived from your operation params</span>
  <span class="s">"action"</span>: { <span class="s">"kind"</span>: <span class="s">"openapi_request"</span>, ... }
}</code></pre>
</section>

<!-- ========== Two paths ========== -->
<section id="paths">
  <div class="section-label">Two ways forward</div>
  <h2>Self-serve or done-for-you.</h2>

  <div class="path-grid">
    <div class="path diy">
      <div class="price">Free · works in 5 min</div>
      <h3>DIY: ingest your spec</h3>
      <p class="desc">If you already have an OpenAPI spec, you're done. Point any agent at <code>${origin}/api/v1/tools?url=&lt;your-spec-url&gt;</code>.</p>
      <ul>
        <li>Free 100 reads/day.</li>
        <li>Tag-filter support: <code>?tag=customers</code></li>
        <li>OAuth auto-injection if user has connected the provider via wmcp.sh dashboard</li>
        <li>Listed in /directory automatically when traffic builds</li>
      </ul>
      <a class="cta" href="/integration/openapi">See OpenAPI guide →</a>
    </div>

    <div class="path featured">
      <div class="price">$499+ · 5-day delivery</div>
      <h3>Managed: we ship your spec + MCP server</h3>
      <p class="desc">No OpenAPI yet? We generate one from your codebase + ship MCP-spec OAuth + write the agent cookbook. White-label at <code>mcp.yourapi.com</code> available.</p>
      <ul>
        <li>OpenAPI spec generated from your routes (FastAPI / Express / NestJS / Spring / etc.)</li>
        <li>Operation tagging + x-codeSamples</li>
        <li>MCP-spec OAuth (PKCE + DCR) implementation</li>
        <li>Optional white-label MCP server on your domain</li>
        <li>Agent SDK template (Python + TS) for your customers' integrators</li>
      </ul>
      <a class="cta" href="/managed#contact">Get audit →</a>
    </div>
  </div>
</section>

<!-- ========== FAQ ========== -->
<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions from API teams.</h2>

  <details><summary>I already publish an OpenAPI spec — what else do I need?</summary>
  <div class="answer">You're 80% done. Three remaining steps: (1) stable cacheable URL like <code>/openapi.json</code> with no auth required to fetch, (2) tag operations so agents can filter, (3) agent-friendly auth — OAuth 2.1 with PKCE + DCR for consumer agents. wmcp.sh handles ingestion + filtering + auth-injection automatically.</div>
  </details>

  <details><summary>We don't have an OpenAPI spec. How do we ship one?</summary>
  <div class="answer">FastAPI, Hono, NestJS, ASP.NET Core, Spring Boot, Laravel all generate OpenAPI 3 from route annotations — one config flip. Express/Koa need swagger-jsdoc or Zod-to-OpenAPI. Worst case: an LLM can scaffold a spec from your route handlers in an afternoon.</div>
  </details>

  <details><summary>What's the right auth flow for an API serving AI agents?</summary>
  <div class="answer">Three options: (a) API keys via <code>_auth</code> arg — simplest; (b) OAuth 2.1 + PKCE — needed for consumer agents (Claude.ai, Cursor); (c) MCP-spec OAuth — PKCE + DCR + discovery endpoint. DefiLlama's MCP is the canonical (c) example. Build (c) if starting today — every modern MCP client supports it.</div>
  </details>

  <details><summary>Stripe has 400 endpoints. Won't that flood the agent?</summary>
  <div class="answer">Yes. Solutions: tag your operations (Stripe does); ship a curated <code>/openapi/agent-subset.json</code>; expose a meta-tool <code>list_capabilities</code> that returns short descriptions. wmcp.sh respects tags — callers fetch <code>?tag=customers</code> and get the slice they need.</div>
  </details>

  <details><summary>How do I make rate limits agent-friendly?</summary>
  <div class="answer">Per-API-key quotas (not per-IP — agents share IPs). Emit <code>X-RateLimit-*</code> + <code>Retry-After</code> headers. Anthropic Messages API is the gold standard.</div>
  </details>

  <details><summary>What if my API requires user OAuth that agents can't drive?</summary>
  <div class="answer">Either ship MCP-spec OAuth (RFC 7591 DCR + PKCE — Claude.ai / Cursor / Codex drive this natively), or use wmcp.sh's OAuth-proxy: your customers authenticate once at wmcp.sh, then their agents call wmcp.sh/mcp/yourapi and we inject their token.</div>
  </details>

  <details><summary>Do agents pull my docs into context when developers ask Claude / Cursor?</summary>
  <div class="answer">Yes — and this is a free distribution channel. Cursor's Composer pulls API docs into context for integration tasks. If your docs are JS-rendered with no static HTML, you're invisible. See <a href="/agent-ready/docs" style="color:var(--accent2);text-decoration:none">/agent-ready/docs</a> for docs-side fixes.</div>
  </details>
</section>

<!-- ========== Live integrations ========== -->
<section id="live-integrations">
  <div class="section-label">API integrations live on wmcp.sh</div>
  <h2>Real examples of API → MCP.</h2>
  <p class="section-sub">Each of these takes a published OpenAPI spec and turns it into agent-callable tools. Same pattern works for your API:</p>
  <div class="fix-grid">
    <a href="/integration/openapi" class="fix-card" style="text-decoration:none;color:inherit;display:block">
      <h3>→ OpenAPI ingestion</h3>
      <p class="body">The general-purpose adapter. Drop any OpenAPI spec URL, get MCP tools.</p>
    </a>
    <a href="/integration/stripe" class="fix-card" style="text-decoration:none;color:inherit;display:block">
      <h3>→ Stripe (400+ tools)</h3>
      <p class="body">Stripe ships the canonical OpenAPI. wmcp.sh's Stripe integration as the worked example.</p>
    </a>
    <a href="/integration/github" class="fix-card" style="text-decoration:none;color:inherit;display:block">
      <h3>→ GitHub (~900 tools)</h3>
      <p class="body">GitHub's published OpenAPI + OAuth — repos, issues, PRs, gists, workflows as MCP.</p>
    </a>
    <a href="/integration/linear" class="fix-card" style="text-decoration:none;color:inherit;display:block">
      <h3>→ Linear</h3>
      <p class="body">GraphQL + OAuth — issues, projects, comments as agent-callable tools.</p>
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
    <a href="/agent-ready/docs" style="color:var(--accent2);text-decoration:none">/agent-ready/docs</a> ·
    <a href="/agent-ready/saas" style="color:var(--accent2);text-decoration:none">/agent-ready/saas</a> ·
    <a href="/managed" style="color:var(--accent2);text-decoration:none">/managed</a>
  </p>
</section>
`;

  return agentReadyVerticalHtml({
    origin,
    pageTitle: "Make your API agent-callable — OpenAPI to MCP in 5 minutes | wmcp.sh",
    metaDescription:
      "Ship OpenAPI 3, tag operations, add MCP-spec OAuth, agent-friendly rate limits. The 5 things API providers miss + the wmcp.sh free tier that converts your spec to MCP tools.",
    canonicalPath: "/agent-ready/api",
    ogTitle: "Make your API agent-callable — OpenAPI to MCP",
    ogDescription: "5-step checklist + free wmcp.sh adapter. Stripe / Linear / Notion-grade agent-readiness.",
    twitterTitle: "API agent-readiness — wmcp.sh",
    twitterDescription: "OpenAPI to MCP, tag-filtering, MCP-spec OAuth. The 5 things API teams miss.",
    articleHeadline: "How to make your API agent-callable",
    articleDescription:
      "Five reasons most APIs aren't fully agent-callable, the 4-step fix, and how wmcp.sh's free OpenAPI adapter ships you to first agent traffic in 5 minutes.",
    faqJsonLd,
    heroBadge: "agent-ready · api / saas",
    heroH1: "Make your API agent-callable.",
    heroSubtitle:
      "Every API is now a tool surface. Cursor pulls OpenAPI specs into context during integration tasks. Claude.ai calls MCP tools natively. Codex generates code from tagged operation lists. If your API isn't agent-readable, you don't get the integration — competitors do. Five things to ship: a stable OpenAPI URL, tagged operations, MCP-spec OAuth, agent-friendly rate limits, idiomatic code samples.",
    heroHint: "Already publishing OpenAPI? Free with wmcp.sh, 5 min. No spec yet? We ship one for $499.",
    bodyHtml,
  });
}
