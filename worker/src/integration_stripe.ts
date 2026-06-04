// integration_stripe.ts — /integration/stripe SEO landing page.
//
// Target query family: "stripe mcp", "stripe ai agent", "claude stripe integration",
// "stripe api ai tools". SERP analyzed 2026-05-27 (extrapolated from openapi
// query family pattern). Likely winners: Composio Stripe, Stripe's own dev docs,
// Pipedream Stripe+Claude, Smithery MCP servers.
//
// Our angle: OpenAPI ingestion (Stripe publishes a canonical openapi.json) +
// connected-OAuth auto-injection via Stripe Connect. No SDK to maintain, no
// codegen, the user's Stripe Connect token gets used transparently.

export function integrationStripeHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Stripe MCP — Claude + Stripe via OpenAPI, auto-auth, no SDK | wmcp.sh</title>
<meta name="description" content="Give Claude or any AI agent live access to Stripe via wmcp.sh. Reads Stripe's published OpenAPI spec, auto-injects OAuth tokens via Stripe Connect. No SDK, no codegen, no token plumbing." />
<link rel="canonical" href="${origin}/integration/stripe" />
<meta property="og:title" content="Stripe + Claude — MCP via OpenAPI" />
<meta property="og:description" content="Hosted MCP server for Stripe. OpenAPI ingestion + Stripe Connect OAuth auto-injection." />
<meta property="og:url" content="${origin}/integration/stripe" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Stripe + Claude — MCP via OpenAPI" />
<meta name="twitter:description" content="Stripe API → MCP tools, with OAuth auto-injection. No SDK." />
<meta name="twitter:image" content="${origin}/og.png" />
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Stripe MCP — Claude + Stripe via OpenAPI",
  "description": "Hosted MCP server for Stripe with OpenAPI ingestion and Stripe Connect OAuth.",
  "author": { "@type": "Organization", "name": "WebMCP Anything" },
  "publisher": { "@type": "Organization", "name": "WebMCP Anything", "url": "https://wmcp.sh" },
  "datePublished": "2026-05-27",
  "dateModified": "2026-05-27",
  "mainEntityOfPage": "${origin}/integration/stripe"
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How does this work — does wmcp.sh write a custom Stripe SDK?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No SDK and no codegen. Stripe publishes a canonical OpenAPI 3 spec. wmcp.sh ingests it once, caches the parsed tool list, and serves the resulting MCP tools to your agent. Path × method × params get mapped automatically; every Stripe endpoint becomes a callable tool with a typed input schema."
      }
    },
    {
      "@type": "Question",
      "name": "How does authentication work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Three options. (1) Pass your sk_live in the _auth pseudo-arg. (2) Connect Stripe via the wmcp.sh dashboard — the worker stores your sk_live encrypted (AES-GCM-256) and auto-injects it into Stripe API calls. (3) For platforms, use Stripe Connect OAuth — connect once, the worker maps the user's stored connected-account token into requests targeting api.stripe.com."
      }
    },
    {
      "@type": "Question",
      "name": "What tools does my agent get?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Every documented Stripe operation — createCustomer, listCharges, refundPayment, createPaymentIntent, createSubscription, every webhook event, every product/price/SKU operation. Total: 400+ tools. Use OpenAPI's tag system to filter to a subset (Customers, Subscriptions, etc.) so the agent's tool list stays under model limits."
      }
    },
    {
      "@type": "Question",
      "name": "How does this differ from Composio's Stripe connector?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Composio maintains a curated set of common Stripe operations behind a managed platform. wmcp.sh ingests the full canonical OpenAPI spec — so every Stripe API surface is available, including newly-added endpoints, the moment Stripe publishes them. Trade-off: less curation. Win: completeness + zero version lag."
      }
    },
    {
      "@type": "Question",
      "name": "Can I use this with test mode?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Stripe's API is mode-agnostic — your key determines test vs live. Pass an sk_test in the _auth arg (or connect a test-mode account in the dashboard) and every operation runs in test mode. Useful for agent development before pointing at production Stripe."
      }
    }
  ]
}
</script>
<style>
  :root { --bg:#07070d;--card:#16161f;--bg2:#11111c;--border:#26263a;--text:#ececf5;--muted:#8a8aa8;--dim:#6a6a88;--accent:#ff9e2c;--accent2:#ffcf7a;--green:#4ade80;--red:#f87171;--pink:#ffb86b; }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin:0;min-height:100vh;color:var(--text);background:var(--bg);font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif;line-height:1.6;background-image:radial-gradient(ellipse 900px 600px at 10% -5%,rgba(255,158,44,.18),transparent 60%),radial-gradient(ellipse 700px 500px at 95% 10%,rgba(255,176,0,.10),transparent 60%); }
  .wrap { max-width: 920px; margin: 0 auto; padding: 0 24px; }
  nav { display:flex;justify-content:space-between;align-items:center;padding:22px 24px;max-width:1080px;margin:0 auto; }
  nav .brand { font-weight: 800; letter-spacing: -.02em; font-size: 1.05rem; }
  nav .brand span { color: var(--accent2); }
  nav .links { display: flex; gap: 22px; font-size: .9rem; }
  nav .links a { color: var(--muted); text-decoration: none; }
  nav .links a:hover { color: var(--text); }
  nav .cta { background: var(--bg2); border: 1px solid var(--border); padding: 7px 14px; border-radius: 8px; font-size: .85rem; color: var(--text); text-decoration: none; font-weight: 600; }
  header.hero { padding: 50px 0 30px; }
  .badge { display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;font-size:.7rem;letter-spacing:.15em;text-transform:uppercase;font-weight:700;background:linear-gradient(90deg,rgba(255,158,44,.18),rgba(255,176,0,.18));border:1px solid rgba(255,158,44,.35);margin-bottom:18px; }
  .dot { width:6px;height:6px;background:var(--accent2);border-radius:50%;box-shadow:0 0 8px var(--accent2); }
  h1 { font-size:clamp(2rem,4.5vw,3rem);margin:0 0 18px;background:linear-gradient(135deg,#fff 30%,var(--accent2) 100%);-webkit-background-clip:text;background-clip:text;color:transparent;line-height:1.05;font-weight:800;letter-spacing:-.02em; }
  .sub { color: var(--muted); font-size: 1.05rem; max-width: 640px; margin: 0 0 24px; }
  .hint { color: var(--dim); font-size: .85rem; margin-top: 8px; }
  section { padding: 36px 0; }
  .section-label { display:inline-block;font-size:.72rem;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--accent2);margin-bottom:10px; }
  h2 { font-size:clamp(1.4rem,3vw,1.9rem);margin:0 0 12px;font-weight:700;letter-spacing:-.02em; }
  .section-sub { color: var(--muted); max-width: 640px; margin: 0 0 24px; }
  pre { background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px 18px;overflow-x:auto;font-size:.82rem;color:var(--green);font-family:"SF Mono",Menlo,monospace;line-height:1.5;margin:14px 0; }
  pre .k { color: var(--accent2); } pre .s { color: var(--pink); } pre .c { color: var(--dim); }
  code { font-family: "SF Mono", Menlo, monospace; }
  table { width: 100%; border-collapse: collapse; text-align: left; font-size: .9rem; margin-top: 16px; }
  th, td { padding: 14px 16px; border-bottom: 1px solid var(--border); vertical-align: top; }
  th { background: var(--bg2); font-weight: 700; color: var(--accent2); }
  tr:last-child td { border-bottom: none; }
  td strong { color: var(--text); }
  details { background:var(--card);border:1px solid var(--border);border-radius:12px;padding:18px 20px;margin-bottom:12px; }
  details summary { font-weight: 700; font-size: 1rem; color: var(--text); cursor: pointer; list-style: none; }
  details[open] summary { margin-bottom: 12px; }
  details .answer { color: var(--muted); font-size: .92rem; line-height: 1.65; }
  .auth-grid { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); margin-top: 14px; }
  .auth-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 18px; }
  .auth-card.featured { background: linear-gradient(135deg, var(--card), rgba(255,158,44,.08)); border-color: var(--accent); }
  .auth-card strong { color: var(--accent2); }
  .auth-card p { color: var(--muted); font-size: .9rem; margin-top: 6px; }
  footer { border-top:1px solid var(--border);margin-top:40px;padding:30px 0;text-align:center;color:var(--muted);font-size:.85rem; }
  footer a { color: var(--accent2); text-decoration: none; margin: 0 8px; }
</style>
</head>
<body>

<nav>
  <div class="brand"><a href="/" style="color:inherit;text-decoration:none">wmcp<span>.sh</span></a></div>
  <div class="links">
    <a href="/agent-ready">Agent-ready</a>
    <a href="/agent-ready/api">API</a>
    <a href="/managed">Done for you</a>
    <a href="/price-data">Price data</a>
    <a href="/directory">Directory</a>
  </div>
  <a class="cta" href="/dashboard">Dashboard →</a>
</nav>

<div class="wrap">

<header class="hero">
  <div class="badge"><span class="dot"></span> integration · stripe</div>
  <h1>Claude + Stripe — via OpenAPI, no SDK.</h1>
  <p class="sub">Stripe publishes a canonical OpenAPI spec. wmcp.sh ingests it once, serves you 400+ MCP tools, and auto-injects your Stripe Connect OAuth token into every call. Zero code, zero codegen, zero token plumbing.</p>
  <p class="hint">Last updated 2026-05-27 · covers every documented Stripe endpoint, automatically updated</p>
</header>

<!-- ========== HOW ========== -->
<section id="how">
  <div class="section-label">How it works</div>
  <h2>One spec URL, every Stripe operation.</h2>
  <p class="section-sub">No SDK to update. When Stripe ships a new endpoint, we have it the moment they publish the spec update.</p>

  <pre><code><span class="c"># Stripe publishes their canonical OpenAPI 3 spec</span>
<span class="k">curl</span> <span class="s">'https://wmcp.sh/api/v1/tools?url=https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.json'</span>

<span class="c"># Returns ~400 MCP tools — createCustomer, listCharges,
# createPaymentIntent, refundPayment, every webhook event...</span></code></pre>

  <p class="section-sub" style="margin-top:24px">Each tool is shaped exactly like Claude's <code>tool_use</code> schema or OpenAI's function-call format. Hand them to your agent and ask "create a customer named Alice with email alice@example.com" — Claude picks the right tool, fills the args, wmcp.sh fires the actual Stripe request.</p>
</section>

<!-- ========== AUTH ========== -->
<section id="auth">
  <div class="section-label">Authentication</div>
  <h2>Three modes — pick the one your stack needs.</h2>

  <div class="auth-grid">
    <div class="auth-card">
      <strong>1. Pass sk_live per call</strong>
      <p>Include <code>_auth: "Bearer sk_live_…"</code> in the tool execute args. Worker injects as the <code>Authorization</code> header. Stateless, no setup, agent holds the key.</p>
    </div>
    <div class="auth-card featured">
      <strong>2. Connect via dashboard</strong>
      <p>One-time setup at <a href="/dashboard" style="color:var(--accent2);text-decoration:none">/dashboard</a>: paste your <code>sk_live</code>. Worker encrypts it (AES-GCM-256) and auto-injects on every <code>api.stripe.com</code> call. Agent never sees the key.</p>
    </div>
    <div class="auth-card">
      <strong>3. Stripe Connect OAuth</strong>
      <p>For platforms with multiple Stripe-using customers. Each customer connects their Stripe account via Stripe Connect OAuth → worker stores their per-user token → agent calls automatically use the right user's account.</p>
    </div>
  </div>
</section>

<!-- ========== COMPARISON ========== -->
<section id="vs">
  <div class="section-label">Positioning</div>
  <h2>vs. SDK · vs. Composio · vs. raw API</h2>

  <table>
    <thead>
      <tr>
        <th>Capability</th>
        <th>Official Stripe SDK</th>
        <th>Composio Stripe</th>
        <th>wmcp.sh</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Setup time</strong></td>
        <td>npm install + token wiring</td>
        <td>Platform signup + per-customer auth</td>
        <td><strong>Zero — just hit the URL</strong></td>
      </tr>
      <tr>
        <td><strong>Coverage</strong></td>
        <td>SDK reflects current Stripe version</td>
        <td>Curated common operations</td>
        <td><strong>Every documented endpoint (~400)</strong></td>
      </tr>
      <tr>
        <td><strong>New endpoints</strong></td>
        <td>Wait for SDK release</td>
        <td>Wait for platform update</td>
        <td><strong>Available the moment Stripe ships the spec</strong></td>
      </tr>
      <tr>
        <td><strong>Multi-account (Connect)</strong></td>
        <td>You wire it manually</td>
        <td>Platform handles it</td>
        <td><strong>Stripe Connect OAuth in wmcp dashboard</strong></td>
      </tr>
      <tr>
        <td><strong>Tool shape for agents</strong></td>
        <td>Wrap each method yourself</td>
        <td>Auto-mapped</td>
        <td><strong>Native MCP / tool_use shape</strong></td>
      </tr>
      <tr>
        <td><strong>Cost</strong></td>
        <td>Free SDK + your hosting</td>
        <td>Platform tier</td>
        <td><strong>Free (100/day) + $99/mo Pro</strong></td>
      </tr>
    </tbody>
  </table>
</section>

<!-- ========== CODE ========== -->
<section id="code">
  <div class="section-label">Integrate</div>
  <h2>Three lines into any agent</h2>

  <p class="section-sub"><strong style="color:var(--text)">Python — agent creates a Stripe customer</strong></p>
  <pre><code><span class="k">from</span> wmcp <span class="k">import</span> WmcpClient
<span class="k">from</span> wmcp.anthropic <span class="k">import</span> to_anthropic_tools, execute_tool_use
<span class="k">from</span> anthropic <span class="k">import</span> Anthropic

client = WmcpClient(api_key=<span class="s">"webmcp_live_…"</span>)
spec   = <span class="s">"https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.json"</span>
tools  = client.tools(spec)

<span class="c"># Filter to just the Customers tools so the model doesn't see 400 options</span>
customer_tools = [t <span class="k">for</span> t <span class="k">in</span> tools <span class="k">if</span> <span class="s">"customer"</span> <span class="k">in</span> t.name.lower()]

anthropic = Anthropic()
msg = anthropic.messages.create(
    model=<span class="s">"claude-opus-4-7"</span>,
    max_tokens=1024,
    tools=to_anthropic_tools(customer_tools),
    messages=[{<span class="s">"role"</span>: <span class="s">"user"</span>, <span class="s">"content"</span>: <span class="s">"Create a customer Alice (alice@x.com)."</span>}],
)

<span class="k">for</span> block <span class="k">in</span> msg.content:
    <span class="k">if</span> block.type == <span class="s">"tool_use"</span>:
        <span class="c"># Worker auto-injects your connected Stripe token. Agent passes no auth.</span>
        result = execute_tool_use(client, spec, block.model_dump())
        <span class="k">print</span>(result)</code></pre>

  <p class="section-sub" style="margin-top:24px"><strong style="color:var(--text)">cURL — direct execute</strong></p>
  <pre><code><span class="k">curl</span> -X POST <span class="s">'${origin}/api/v1/tools/execute'</span> \\
  -H <span class="s">'authorization: Bearer YOUR_WMCP_KEY'</span> \\
  -H <span class="s">'content-type: application/json'</span> \\
  -d <span class="s">'{
    "url": "https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.json",
    "tool": "PostCustomers",
    "args": { "name": "Alice", "email": "alice@example.com" }
  }'</span></code></pre>
</section>

<!-- ========== FAQ ========== -->
<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Frequently asked</h2>

  <details><summary>Does wmcp.sh write a custom Stripe SDK?</summary>
  <div class="answer">No. Stripe publishes a canonical OpenAPI 3 spec at <code>raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.json</code>. wmcp.sh ingests it, parses path × method × params, and emits MCP tools automatically. No SDK to maintain, no codegen step.</div>
  </details>

  <details><summary>How does authentication work?</summary>
  <div class="answer">Three modes: pass <code>sk_live</code> per call via the <code>_auth</code> arg, store it once in the wmcp.sh dashboard (AES-GCM-256 encrypted at rest, auto-injected on Stripe API calls), or use Stripe Connect OAuth for multi-account platforms.</div>
  </details>

  <details><summary>Tool count is too high — how do I narrow it for the agent?</summary>
  <div class="answer">Stripe's spec produces ~400 tools. Most agent frameworks struggle past ~50. Filter by name or tag before passing to the model: <code>tools.filter(t =&gt; t.name.startsWith("Customer"))</code>. Future enhancement (open issue): pass <code>?tag=customers</code> to the wmcp.sh API and get back only the filtered set.</div>
  </details>

  <details><summary>What about test mode?</summary>
  <div class="answer">Stripe's API is mode-agnostic — your key determines test/live. Pass <code>sk_test</code> via <code>_auth</code> (or connect a test-mode account) and every operation runs in test mode. Useful for agent development before going live.</div>
  </details>

  <details><summary>Webhooks?</summary>
  <div class="answer">Out of scope for the OpenAPI ingestion path — Stripe webhooks aren't part of the spec they publish (they're a separate event API). wmcp.sh has a separate Stripe webhook handler for our own billing; if you want a "webhook-event-to-agent" pipe, that's a different shape we'd build on request.</div>
  </details>

  <details><summary>How does this compare to Composio's Stripe connector?</summary>
  <div class="answer">Composio maintains a curated set of common operations behind a managed platform. wmcp.sh ingests the full canonical OpenAPI spec — so every endpoint is available, including newly-published ones, with zero version lag. Composio's win is curation + per-customer auth UX. wmcp.sh's win is completeness + zero waiting for updates.</div>
  </details>
</section>

<section id="see-also">
  <div class="section-label">See also</div>
  <h2>API agent-readiness — Stripe is the model</h2>
  <p style="color:var(--muted);margin-bottom:14px">Stripe ships the canonical OpenAPI spec other APIs should follow. If you're building your own API and want it to be Stripe-grade agent-callable, the 5 things to ship are at <a href="/agent-ready/api" style="color:var(--accent2);text-decoration:none">/agent-ready/api</a> — OpenAPI publishing, operation tagging, MCP-spec OAuth, agent-friendly rate limits. Cornerstone: <a href="/agent-ready" style="color:var(--accent2);text-decoration:none">/agent-ready</a>. Or have us ship your spec: <a href="/managed" style="color:var(--accent2);text-decoration:none">/managed</a>.</p>
</section>

<footer>
  <a href="/">Home</a> · <a href="/agent-ready">Agent-ready</a> · <a href="/agent-ready/api">API</a> · <a href="/managed">Done for you</a> · <a href="/price-data">Price data</a> · <a href="/integration/openapi">OpenAPI</a> · <a href="/integration/shopify">Shopify</a> · <a href="/directory">Directory</a> · <a href="https://github.com/New1Direction/webmcp-anything">GitHub</a>
</footer>

</div>
</body>
</html>`;
}
