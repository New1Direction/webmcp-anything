// /agent-ready/shopify — SERP target: "shopify ai agent", "shopify mcp",
// "shopify claude integration", "shopify openai agent", "make shopify
// store ai-ready", "agent commerce shopify", "shopify chatgpt".

import { agentReadyVerticalHtml } from "./agent_ready_chrome";

export function agentReadyShopifyHtml(origin: string): string {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "I'm on Shopify — isn't my store already AI-ready out of the box?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Partly. Shopify ships JSON-LD Product schema on most themes by default, which is the foundation. But three pieces are still missing: (1) WebMCP action markup on cart/checkout buttons, (2) variant-aware tool exposure (so agents can pick size/color), (3) inventory-real-time tools. Plus Shopify's official MCP server (dev-mcp) is OWNER-side — for store operators, not shoppers. wmcp.sh's Shopify adapter fills the shopper-side gap by reading your products.json + variants and exposing add-to-cart actions agents can call.",
        },
      },
      {
        "@type": "Question",
        name: "Does this work with Shopify Plus, Basic, Advanced, custom themes?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "All Shopify plans. The wmcp.sh adapter hits the public /products.json endpoint that every store exposes regardless of plan or theme. Custom themes only break things if they disable products.json entirely (rare — usually only on Plus stores with strict B2B configurations). Headless Shopify storefronts (Hydrogen, custom React) are fully supported because we pull from Admin API endpoints that are theme-agnostic.",
        },
      },
      {
        "@type": "Question",
        name: "How is this different from Shopify's official dev-mcp?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Shopify's dev-mcp is built for store OPERATORS — it exposes Admin API operations (create discount, list orders, update inventory) for someone managing their own store. wmcp.sh is built for SHOPPERS and their agents — it exposes the public storefront (search products, add to cart, find variants, check availability) for someone buying across many stores they don't own. Both are MCP servers, complementary, not competitive.",
        },
      },
      {
        "@type": "Question",
        name: "Can agents actually complete a purchase, or just browse?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Today: add to cart works on every public Shopify store via the /cart/add.js endpoint. Checkout requires the agent to drive a browser session (Computer Use, Browser Use, etc.) because Shopify Checkout is JS-heavy and not API-exposed for non-merchants. We have a 'checkout assist' tier coming that returns a pre-filled checkout URL the agent can hand back to the human or drive autonomously. Most agent commerce flows today complete add-to-cart via wmcp.sh and hand off the final checkout to the human.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need to add code to my Shopify theme?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No code changes for the basic adapter — wmcp.sh works on any public Shopify storefront URL. Optional improvements: (1) add a metafield with your brand voice / agent instructions so agents represent your products correctly, (2) ship a static OpenAPI spec at /openapi.json describing your custom endpoints (for storefronts with custom apps), (3) enable Shopify's Storefront API if you want richer tools (we can ingest both legacy /products.json AND modern Storefront GraphQL).",
        },
      },
      {
        "@type": "Question",
        name: "What about Cloudflare bot-protection my Shopify Plus store uses?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Server-side fetches by AI agents sometimes get caught by Shopify Plus's Cloudflare enterprise rules. Fix at the Shopify Plus level: whitelist verified AI user-agents (Claude-User, ChatGPT-User, GoogleOther) in your Shopify Plus Cloudflare config. Or use wmcp.sh's extension-mode (Chrome side-loader) which scrapes from the browser context where the user is already authenticated past bot challenges.",
        },
      },
      {
        "@type": "Question",
        name: "Does this affect my SEO?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Positively. JSON-LD that's good for agents is also good for Google's Shopping rich results, Bing Shopping, and the new AI Overviews. Most of the schema markup we encourage is already what Shopify SEO consultants recommend — we're just naming the second audience (agents).",
        },
      },
    ],
  };

  const bodyHtml = `
<!-- ========== Why Shopify ========== -->
<section id="why-shopify">
  <div class="section-label">Why Shopify specifically</div>
  <h2>You're already 60% agent-ready. Here's the other 40%.</h2>
  <p class="section-sub">Shopify ships JSON-LD <code>Product</code> schema on most themes by default — that's the floor. The remaining work is variants, cart actions, and bridging Shopify's owner-side dev-mcp with the shopper-side stack agents like Claude / OpenAI / Cursor actually use when buying.</p>
</section>

<!-- ========== Diagnosis ========== -->
<section id="diagnosis">
  <div class="section-label">5 things Shopify stores miss</div>
  <h2>The agent-readiness diagnostic for Shopify.</h2>

  <div class="reason-card">
    <span class="num">1</span>
    <h3>Variants aren't exposed as separate agent-callable choices</h3>
    <p>Most Shopify themes render variants as a JS-driven dropdown. JSON-LD <code>Product</code> schema lists the parent product, but the actual sellable SKUs (size 10 in red, size 11 in blue) are buried in a JS array agents can't reliably parse.</p>
    <p class="verdict">→ Agent says: "I want Wool Runners size 10." Result: clicks add-to-cart on the default variant. Wrong SKU.</p>
    <p class="fix"><strong>Fix:</strong> wmcp.sh's Shopify adapter pulls <code>/products/&lt;handle&gt;.json</code> which always returns the full variants array — every (id, title, price, available, options) tuple. Each variant becomes a callable tool the agent picks deterministically.</p>
  </div>

  <div class="reason-card">
    <span class="num">2</span>
    <h3>No add-to-cart action exposed to agents</h3>
    <p>Shopify's public storefront has <code>/cart/add.js</code> but no MCP wrapper. Agents have to either drive a browser session (slow, fragile) or you don't get the purchase.</p>
    <p class="verdict">→ Agent reads price + availability but can't act.</p>
    <p class="fix"><strong>Fix:</strong> wmcp.sh exposes <code>add_to_cart</code> as an actionable tool for every Shopify store automatically. The agent calls it with <code>{variant_id, quantity}</code> and gets back the updated cart token, no browser required.</p>
  </div>

  <div class="reason-card">
    <span class="num">3</span>
    <h3>Inventory state changes aren't agent-discoverable</h3>
    <p>When a product is back in stock or a variant sells out, there's no webhook agents can subscribe to. Agents have to re-query, get stale data, or surface "in stock" to users when it isn't.</p>
    <p class="verdict">→ Agent recommends a product that just sold out 30 seconds ago. Trust degraded.</p>
    <p class="fix"><strong>Fix:</strong> wmcp.sh caches with a short TTL (60s) for live queries and listens to <code>/products.json?updated_at_min=…</code> for backfill. For high-volume stores, we can wire a Shopify webhook on the store's side that pushes invalidations directly into our cache.</p>
  </div>

  <div class="reason-card">
    <span class="num">4</span>
    <h3>Multi-currency / multi-locale isn't agent-aware</h3>
    <p>Shopify Markets serves different prices, currencies, and product availability to different geos. Agents fetching server-side see the default locale, not the shopper's intent.</p>
    <p class="verdict">→ A UK shopper's agent gets USD prices because the request originated from a US-region serverless edge.</p>
    <p class="fix"><strong>Fix:</strong> Pass <code>locale</code> + <code>country</code> hints in the agent's tool call. wmcp.sh forwards them as Shopify Markets headers so the response reflects the shopper's actual market.</p>
  </div>

  <div class="reason-card">
    <span class="num">5</span>
    <h3>No shopper-side MCP server (Shopify's dev-mcp is owner-side only)</h3>
    <p>Shopify shipped dev-mcp in 2026 — but it's for store operators managing their OWN store. The shopper agent calling <code>add_to_cart</code> across many stores has no first-party MCP from Shopify and isn't on their roadmap.</p>
    <p class="verdict">→ Every store needs its own integration, none of which scale.</p>
    <p class="fix"><strong>Fix:</strong> wmcp.sh is the shopper-side MCP for the entire Shopify ecosystem. One URL: <code>${origin}/api/v1/tools?url=&lt;your-product-page&gt;</code>. Works on 4M+ Shopify stores without store-by-store integration.</p>
  </div>
</section>

<!-- ========== Fix ========== -->
<section id="fix">
  <div class="section-label">The fix in 10 minutes</div>
  <h2>Validate, then ship.</h2>
  <p class="section-sub">Most Shopify stores need zero code changes. wmcp.sh works on top of what your theme already outputs.</p>

  <div class="checklist">
    <h3>10-minute Shopify checklist</h3>
    <div class="row"><span class="mark">→</span><span>Run <code>curl 'https://wmcp.sh/api/v1/tools?url=https://YOUR-STORE.com/products/SOME-HANDLE'</code>. You should see a tools array with <code>get_price</code>, <code>get_availability</code>, <code>add_to_cart</code>, and one tool per variant.</span></div>
    <div class="row"><span class="mark">→</span><span>View source on the same product page. Confirm JSON-LD <code>application/ld+json</code> with <code>"@type": "Product"</code> is present. (Most themes ship this — Dawn, Sense, Refresh, Crave all do.)</span></div>
    <div class="row"><span class="mark">→</span><span>Confirm <code>/products/&lt;handle&gt;.json</code> returns 200 (not blocked by your Plus Cloudflare rules). If 403, allowlist <code>Claude-User</code> + <code>ChatGPT-User</code> at your WAF.</span></div>
    <div class="row"><span class="mark">→</span><span>Submit your store to <a href="/directory" style="color:var(--accent2);text-decoration:none">wmcp.sh/directory</a> — appears as an agent-discoverable store in our public list, drives indirect traffic from agents looking for shoppable inventory.</span></div>
    <div class="row"><span class="mark">→</span><span>Hand the wmcp.sh URL to a Claude / Cursor / Codex user and watch them buy. That's the proof.</span></div>
  </div>
</section>

<!-- ========== Demo ========== -->
<section id="demo">
  <div class="section-label">What it looks like</div>
  <h2>Live example.</h2>
  <p class="section-sub">Drop any Shopify product URL into wmcp.sh and you get back agent-callable tools. Here's a working example with Allbirds:</p>

  <pre><code><span class="c"># Get tools for a Shopify product page</span>
<span class="k">curl</span> <span class="s">'${origin}/api/v1/tools?url=https://www.allbirds.com/products/mens-wool-runners'</span>

<span class="c"># Response — agent sees:</span>
{
  <span class="s">"adapter"</span>: <span class="s">"shopify"</span>,
  <span class="s">"product"</span>: { <span class="s">"title"</span>: <span class="s">"Men's Wool Runners"</span>, <span class="s">"vendor"</span>: <span class="s">"Allbirds"</span> },
  <span class="s">"variants"</span>: [
    { <span class="s">"id"</span>: <span class="s">"39427184461330"</span>, <span class="s">"title"</span>: <span class="s">"US 10 / Natural Grey"</span>, <span class="s">"available"</span>: true },
    <span class="c">// ... +24 more variants</span>
  ],
  <span class="s">"tools"</span>: [
    { <span class="s">"name"</span>: <span class="s">"get_price"</span>, <span class="s">"result"</span>: <span class="s">"$110.00"</span> },
    { <span class="s">"name"</span>: <span class="s">"get_availability"</span>, <span class="s">"result"</span>: <span class="s">"in_stock"</span> },
    { <span class="s">"name"</span>: <span class="s">"add_to_cart"</span>,
      <span class="s">"action"</span>: { <span class="s">"kind"</span>: <span class="s">"shopify_add_to_cart"</span> },
      <span class="s">"description"</span>: <span class="s">"Add this product (default variant) to the cart."</span> },
    <span class="c">// One add_to_cart_variant_X tool per variant</span>
  ]
}</code></pre>
</section>

<!-- ========== Two paths ========== -->
<section id="paths">
  <div class="section-label">Two ways forward</div>
  <h2>Ship it yourself, or have us do it.</h2>

  <div class="path-grid">
    <div class="path diy">
      <div class="price">Free · ~5 min</div>
      <h3>DIY: works out of the box</h3>
      <p class="desc">Most Shopify stores need zero code changes. Point any agent at your store's products via wmcp.sh, free.</p>
      <ul>
        <li>Free 100 reads/day. $29/mo Pro for 10k+/day.</li>
        <li>Submit your store to /directory (agent-discoverable).</li>
        <li>Hand the URL to any MCP-capable agent — works immediately.</li>
      </ul>
      <a class="cta" href="/dashboard">Try it free →</a>
    </div>

    <div class="path featured">
      <div class="price">$499+ · 5-day delivery</div>
      <h3>Managed: agent-optimized Shopify</h3>
      <p class="desc">We audit your store, ship JSON-LD enhancements, configure WAF allowlists, build custom adapters for your apps, monitor agent traffic.</p>
      <ul>
        <li>Cloudflare Plus WAF allowlist configured</li>
        <li>Multi-currency / multi-locale agent routing</li>
        <li>Custom adapter if you have headless / Hydrogen / non-standard setup</li>
        <li>Listed in wmcp.sh /directory with brand placement</li>
      </ul>
      <a class="cta" href="/managed#contact">Get audit →</a>
    </div>
  </div>
</section>

<!-- ========== FAQ ========== -->
<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions from Shopify operators.</h2>

  <details><summary>I'm on Shopify — isn't my store already AI-ready out of the box?</summary>
  <div class="answer">Partly. Shopify ships JSON-LD <code>Product</code> schema on most themes by default — that's the foundation. Three pieces are still missing: WebMCP action markup on cart/checkout buttons, variant-aware tool exposure (agents pick size/color), inventory-real-time tools. Plus Shopify's official MCP server (dev-mcp) is OWNER-side. wmcp.sh fills the shopper-side gap by reading your products.json + variants and exposing add-to-cart actions agents can call.</div>
  </details>

  <details><summary>Does this work with Shopify Plus, Basic, Advanced, custom themes?</summary>
  <div class="answer">All Shopify plans. The adapter hits public <code>/products.json</code> which every store exposes regardless of plan. Custom themes only break things if they disable products.json (rare). Headless Shopify (Hydrogen, custom React) is fully supported via theme-agnostic endpoints.</div>
  </details>

  <details><summary>How is this different from Shopify's official dev-mcp?</summary>
  <div class="answer">dev-mcp is for store OPERATORS managing their own store (Admin API operations). wmcp.sh is for SHOPPERS and their agents (public storefront across many stores they don't own). Complementary, not competitive.</div>
  </details>

  <details><summary>Can agents actually complete a purchase?</summary>
  <div class="answer">Add to cart: yes, every public store, via <code>/cart/add.js</code>. Final checkout: requires agent to drive a browser session (Computer Use, Browser Use) because Shopify Checkout is JS-heavy. We're shipping a 'checkout assist' tier that returns a pre-filled checkout URL the agent can hand to the human.</div>
  </details>

  <details><summary>Do I need to add code to my Shopify theme?</summary>
  <div class="answer">No code changes for the basic adapter. Optional improvements: metafield with brand voice, static OpenAPI spec for custom apps, Storefront API for richer tools.</div>
  </details>

  <details><summary>What about Cloudflare bot-protection on my Shopify Plus store?</summary>
  <div class="answer">Whitelist <code>Claude-User</code>, <code>ChatGPT-User</code>, <code>GoogleOther</code> in your Plus Cloudflare config. Or use wmcp.sh extension-mode which scrapes from a logged-in browser context.</div>
  </details>

  <details><summary>Does this affect my SEO?</summary>
  <div class="answer">Positively. The same JSON-LD that's good for agents is good for Google Shopping rich results, Bing Shopping, AI Overviews.</div>
  </details>
</section>

<!-- ========== Related ========== -->
<section id="related">
  <div class="section-label">More verticals</div>
  <h2>Other agent-readiness guides.</h2>
  <p class="section-sub">
    <a href="/agent-ready" style="color:var(--accent2);text-decoration:none">/agent-ready</a> (cornerstone) ·
    <a href="/agent-ready/api" style="color:var(--accent2);text-decoration:none">/agent-ready/api</a> (SaaS APIs) ·
    <a href="/agent-ready/docs" style="color:var(--accent2);text-decoration:none">/agent-ready/docs</a> (documentation sites) ·
    <a href="/agent-ready/saas" style="color:var(--accent2);text-decoration:none">/agent-ready/saas</a> (SaaS founders) ·
    <a href="/managed" style="color:var(--accent2);text-decoration:none">/managed</a> (done for you)
  </p>
</section>
`;

  return agentReadyVerticalHtml({
    origin,
    pageTitle: "Shopify + AI agents — make your store buyable by Claude, ChatGPT, Cursor | wmcp.sh",
    metaDescription:
      "How to make your Shopify store agent-ready: variants exposed, add-to-cart actions, inventory awareness, WAF allowlist. Free with wmcp.sh's Shopify adapter — works on 4M+ stores out of the box.",
    canonicalPath: "/agent-ready/shopify",
    ogTitle: "Shopify agent-readiness — make your store buyable by AI agents",
    ogDescription: "Variants, add-to-cart, inventory. Free with wmcp.sh, no theme changes for most stores.",
    twitterTitle: "Shopify + AI agents — wmcp.sh",
    twitterDescription: "Make your Shopify store buyable by Claude, Cursor, ChatGPT. Free adapter, 5 min.",
    articleHeadline: "How to make your Shopify store agent-ready",
    articleDescription:
      "Five reasons most Shopify stores aren't fully agent-callable, and the 10-minute fix using wmcp.sh's free shopper-side adapter.",
    faqJsonLd,
    heroBadge: "agent-ready · shopify",
    heroH1: "Make your Shopify store buyable by Claude, ChatGPT, Cursor.",
    heroSubtitle:
      "Shopify ships you 60% of the way — JSON-LD on most themes, structured products.json, public cart API. The remaining 40% is variant-aware tool exposure, add-to-cart actions agents can call, inventory-state awareness, and shopper-side MCP that scales across all 4M+ Shopify stores. Most of it requires zero code changes to your theme.",
    heroHint: "Free wmcp.sh adapter works on every public Shopify store. Or have us audit yours for $499.",
    bodyHtml,
  });
}
