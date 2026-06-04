// integration_shopify.ts — /integration/shopify SEO landing page.
//
// Target query family: "claude add to cart shopify", "claude shopify integration",
// "shopify ai shopping agent", "ai agent shopify". SERP analyzed 2026-05-27.
// Dominant winners: Shopify dev-mcp (owner-side official toolkit), Composio
// Shopify (owner-side integration platform), assorted "Claude + Shopify" guides.
//
// Our angle: SHOPPER-SIDE. Every existing player serves the merchant. wmcp.sh
// works on any public Shopify storefront — no auth, no admin token, every store.

export function integrationShopifyHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Claude + Shopify (Shopper-Side) — Add to cart on any Shopify store | wmcp.sh</title>
<meta name="description" content="Give Claude, OpenAI, or any AI agent shopper-side access to every Shopify store. No admin credentials. add_to_cart, get_price, check_stock — live tools on 4M+ public storefronts." />
<link rel="canonical" href="${origin}/integration/shopify" />
<meta property="og:title" content="Claude + Shopify — Shopper-Side MCP" />
<meta property="og:description" content="Every existing Shopify-AI integration serves the merchant. wmcp.sh serves the shopper. No admin token, every store, live add_to_cart." />
<meta property="og:url" content="${origin}/integration/shopify" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Claude + Shopify — Shopper-Side MCP" />
<meta name="twitter:description" content="Shopper-side AI agents for every public Shopify store. No auth required." />
<meta name="twitter:image" content="${origin}/og.png" />
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Claude + Shopify — Shopper-Side MCP integration",
  "description": "Give AI agents access to every public Shopify storefront without admin credentials.",
  "author": { "@type": "Organization", "name": "WebMCP Anything" },
  "publisher": { "@type": "Organization", "name": "WebMCP Anything", "url": "https://wmcp.sh" },
  "datePublished": "2026-05-27",
  "dateModified": "2026-05-27",
  "mainEntityOfPage": "${origin}/integration/shopify"
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How does this differ from Shopify's official AI Toolkit (dev-mcp)?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Shopify's dev-mcp is owner-side — it connects Claude to the Shopify Admin API and requires admin credentials. It's built for merchants and devs managing their own store (querying GraphQL schemas, executing CLI ops, reading docs). wmcp.sh is shopper-side — it operates on the public storefront API of any Shopify store, no auth needed, focused on buyer flows like get_price and add_to_cart."
      }
    },
    {
      "@type": "Question",
      "name": "Which Shopify stores does it work on?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "All ~4 million public Shopify stores. Every Shopify storefront exposes /products/<handle>.json and /cart/add.js endpoints as plain JSON — that's a Shopify platform contract, not a per-store opt-in. As long as the store is publicly browsable, wmcp.sh can extract tools for it."
      }
    },
    {
      "@type": "Question",
      "name": "Can the agent actually complete a purchase?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "add_to_cart is live — it returns a real Shopify cart token + checkout URL. Final checkout (entering card details) is intentionally out of scope for v0 — that requires a session handoff with PCI implications we haven't designed yet. Watch the cart, find the right variant, fill the cart; checkout is the user's last click."
      }
    },
    {
      "@type": "Question",
      "name": "What tools does it produce per Shopify product?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Five tools by default: get_product (full product blob), get_price (current price for a specific variant), check_stock (in-stock per variant), list_variants (full variant table), add_to_cart (live action returning cart token). All shaped as MCP tools with proper input schemas Claude and OpenAI can consume directly."
      }
    },
    {
      "@type": "Question",
      "name": "What about non-Shopify retailers?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "wmcp.sh has a JSON-LD adapter that covers most non-Shopify e-commerce (Best Buy, Walmart, REI, etc.) by parsing schema.org Product markup. For sites with aggressive bot protection (Amazon, Nike), an LLM fallback adapter runs Claude Haiku against the page. Either way, the agent sees the same MCP-shaped tool list."
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
  .demo-box { background:var(--card);border:1px solid var(--border);border-radius:18px;padding:24px;margin-top:8px; }
  .row { display: flex; gap: 8px; flex-wrap: wrap; }
  input[type=url] { flex:1;min-width:240px;background:var(--bg2);border:1px solid var(--border);color:var(--text);border-radius:10px;padding:13px 16px;font-family:"SF Mono",Menlo,monospace;font-size:.9rem; }
  input:focus { outline: none; border-color: var(--accent); }
  button.go { background:linear-gradient(135deg,var(--accent),var(--accent2));color:white;border:none;border-radius:10px;padding:13px 22px;font-weight:700;cursor:pointer;font-family:inherit; }
  .chips { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 14px; }
  .chip { background:var(--bg2);border:1px solid var(--border);padding:6px 12px;border-radius:999px;font-size:.78rem;color:var(--muted);cursor:pointer; }
  .chip:hover { color: var(--text); border-color: var(--accent); }
  table { width: 100%; border-collapse: collapse; text-align: left; font-size: .9rem; margin-top: 16px; }
  th, td { padding: 14px 16px; border-bottom: 1px solid var(--border); vertical-align: top; }
  th { background: var(--bg2); font-weight: 700; color: var(--accent2); }
  tr:last-child td { border-bottom: none; }
  td strong { color: var(--text); }
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
  <div class="brand"><a href="/" style="color:inherit;text-decoration:none">wmcp<span>.sh</span></a></div>
  <div class="links">
    <a href="/agent-ready">Agent-ready</a>
    <a href="/agent-ready/shopify">Shopify</a>
    <a href="/managed">Done for you</a>
    <a href="/price-data">Price data</a>
    <a href="/directory">Directory</a>
  </div>
  <a class="cta" href="/dashboard">Dashboard →</a>
</nav>

<div class="wrap">

<header class="hero">
  <div class="badge"><span class="dot"></span> integration · shopify</div>
  <h1>Claude + Shopify — the shopper-side half.</h1>
  <p class="sub">Shopify's official AI Toolkit gives Claude admin access to <em>your</em> store. wmcp.sh gives Claude shopper access to <em>any</em> store. Live <code>add_to_cart</code>, no admin credentials, every Shopify storefront.</p>
  <p class="hint">Last updated 2026-05-27 · works on ~4M public Shopify stores</p>
</header>

<!-- ========== LIVE DEMO ========== -->
<section id="demo">
  <div class="section-label">Try it</div>
  <h2>Paste a Shopify product URL, get the tools.</h2>
  <p class="section-sub">No signup. Free tier handles 100 reads/day per IP.</p>

  <div class="demo-box">
    <div class="row">
      <input id="u" type="url" placeholder="https://www.allbirds.com/products/mens-wool-runners" />
      <button class="go" id="go">⚡ Get tools</button>
    </div>
    <div class="chips">
      <span style="color:var(--muted);font-size:.78rem;align-self:center">try:</span>
      <span class="chip" data-u="https://www.allbirds.com/products/mens-wool-runners">Allbirds Wool Runner</span>
      <span class="chip" data-u="https://www.everlane.com/products/mens-organic-cotton-crew-tee-white">Everlane Crew Tee</span>
      <span class="chip" data-u="https://www.brooklinen.com/products/classic-core-sheet-set">Brooklinen Sheet Set</span>
      <span class="chip" data-u="https://www.glossier.com/products/balm-dotcom">Glossier Balm Dotcom</span>
    </div>
    <pre id="out"><span class="c">// Paste a Shopify product URL and click Get tools.</span></pre>
  </div>
</section>

<!-- ========== POSITIONING ========== -->
<section id="vs">
  <div class="section-label">Positioning</div>
  <h2>The asymmetry nobody talks about</h2>
  <p class="section-sub">Owner-side and shopper-side look the same from a distance. They're different products serving different users.</p>

  <table>
    <thead>
      <tr>
        <th>Capability</th>
        <th>Shopify dev-mcp (AI Toolkit)</th>
        <th>Composio Shopify</th>
        <th>wmcp.sh</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>User</strong></td>
        <td>Merchant managing one store</td>
        <td>Dev integrating one merchant's store</td>
        <td><strong>Shopper browsing any store</strong></td>
      </tr>
      <tr>
        <td><strong>API surface</strong></td>
        <td>Admin API + GraphQL</td>
        <td>Admin API + webhooks</td>
        <td><strong>Storefront JSON + Cart API</strong></td>
      </tr>
      <tr>
        <td><strong>Auth</strong></td>
        <td>Admin token (your store)</td>
        <td>OAuth (each customer's store)</td>
        <td><strong>None — public endpoints</strong></td>
      </tr>
      <tr>
        <td><strong>Stores covered</strong></td>
        <td>The one you connected</td>
        <td>The ones your customers connect</td>
        <td><strong>All 4M+ public stores</strong></td>
      </tr>
      <tr>
        <td><strong>Typical use case</strong></td>
        <td>"Create a discount code"</td>
        <td>"Sync orders to my CRM"</td>
        <td><strong>"Add Allbirds size 10 to cart"</strong></td>
      </tr>
      <tr>
        <td><strong>Best for</strong></td>
        <td>Store devs &amp; operators</td>
        <td>SaaS platforms with Shopify customers</td>
        <td><strong>Shopping agents &amp; assistants</strong></td>
      </tr>
    </tbody>
  </table>

  <p style="color:var(--muted);font-size:.88rem;margin-top:18px">If you need to <em>operate</em> a Shopify store, install Shopify's AI Toolkit. If you need your agent to <em>use</em> a Shopify store like a customer, you've had no good option — until now.</p>
</section>

<!-- ========== THE TOOLS ========== -->
<section id="tools">
  <div class="section-label">What you get</div>
  <h2>Five tools per Shopify product</h2>
  <p class="section-sub">All MCP-shaped, all consumed directly by Claude tool_use, OpenAI function-calling, LangChain, or any other framework that speaks the protocol.</p>

  <table>
    <thead>
      <tr><th>Tool</th><th>Type</th><th>Returns</th></tr>
    </thead>
    <tbody>
      <tr>
        <td><code>get_product</code></td>
        <td>Static</td>
        <td>Full product blob — title, vendor, image, price, canonical URL</td>
      </tr>
      <tr>
        <td><code>get_price</code></td>
        <td>Live action</td>
        <td>Current price for a specific variant (size/color), refetched fresh</td>
      </tr>
      <tr>
        <td><code>check_stock</code></td>
        <td>Live action</td>
        <td>In-stock boolean for a specific variant</td>
      </tr>
      <tr>
        <td><code>list_variants</code></td>
        <td>Static</td>
        <td>Full variant table — IDs, titles, prices, availability</td>
      </tr>
      <tr>
        <td><code>add_to_cart</code></td>
        <td>Live action</td>
        <td>Cart token + checkout URL (real cart, ready for human handoff)</td>
      </tr>
    </tbody>
  </table>
</section>

<!-- ========== CODE ========== -->
<section id="code">
  <div class="section-label">Integrate</div>
  <h2>Drop into any agent stack in three lines</h2>

  <p class="section-sub"><strong style="color:var(--text)">Claude tool_use</strong> — full round trip</p>
  <pre><code><span class="k">import</span> Anthropic <span class="k">from</span> <span class="s">"@anthropic-ai/sdk"</span>;
<span class="k">import</span> { WmcpClient } <span class="k">from</span> <span class="s">"@wmcp/sdk"</span>;
<span class="k">import</span> { toAnthropicTools, executeToolUse } <span class="k">from</span> <span class="s">"@wmcp/sdk/anthropic"</span>;

<span class="k">const</span> client = <span class="k">new</span> WmcpClient({ apiKey: process.env.WMCP_API_KEY });
<span class="k">const</span> url    = <span class="s">"https://www.allbirds.com/products/mens-wool-runners"</span>;
<span class="k">const</span> tools  = <span class="k">await</span> client.tools(url);

<span class="k">const</span> anthropic = <span class="k">new</span> Anthropic();
<span class="k">const</span> msg = <span class="k">await</span> anthropic.messages.create({
  model: <span class="s">"claude-opus-4-7"</span>,
  max_tokens: 1024,
  tools: toAnthropicTools(tools),
  messages: [{ role: <span class="s">"user"</span>, content: <span class="s">"Add size 10 to my cart."</span> }],
});

<span class="k">for</span> (<span class="k">const</span> block <span class="k">of</span> msg.content) {
  <span class="k">if</span> (block.type === <span class="s">"tool_use"</span>) {
    <span class="k">const</span> result = <span class="k">await</span> executeToolUse(client, url, block);
    <span class="c">// result.value.checkout_url is a real cart ready for the user to complete</span>
  }
}</code></pre>

  <p class="section-sub" style="margin-top:24px"><strong style="color:var(--text)">Python</strong> — <code>pip install wmcp</code></p>
  <pre><code><span class="k">from</span> wmcp <span class="k">import</span> WmcpClient

client = WmcpClient(api_key=<span class="s">"webmcp_live_…"</span>)
result = client.execute(
    url=<span class="s">"https://www.allbirds.com/products/mens-wool-runners"</span>,
    tool=<span class="s">"add_to_cart"</span>,
    args={<span class="s">"variant"</span>: <span class="s">"10"</span>, <span class="s">"quantity"</span>: 1},
)
<span class="k">print</span>(result[<span class="s">"value"</span>][<span class="s">"checkout_url"</span>])</code></pre>
</section>

<!-- ========== FAQ ========== -->
<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Frequently asked</h2>

  <details><summary>How does this differ from Shopify's official AI Toolkit (dev-mcp)?</summary>
  <div class="answer">Shopify's <code>dev-mcp</code> is owner-side — it connects Claude to the Shopify Admin API and requires admin credentials. It's built for merchants managing their own store (GraphQL schemas, CLI ops, docs lookup). wmcp.sh is shopper-side — it operates on the public storefront of any Shopify store, no auth, focused on <code>get_price</code> / <code>check_stock</code> / <code>add_to_cart</code>. Different problem, different product.</div>
  </details>

  <details><summary>Which Shopify stores does it work on?</summary>
  <div class="answer">All ~4 million public Shopify stores. Every Shopify storefront exposes <code>/products/&lt;handle&gt;.json</code> and <code>/cart/add.js</code> as plain JSON — that's a platform contract, not a per-store opt-in. If the store is publicly browsable, wmcp.sh can extract tools for it.</div>
  </details>

  <details><summary>Can the agent actually complete a purchase?</summary>
  <div class="answer"><code>add_to_cart</code> is live — it returns a real Shopify cart token and checkout URL. Final payment is intentionally out of scope for v0 (session handoff with PCI implications we haven't designed yet). Agent fills the cart; the user clicks pay. We're working on the secure handoff for Pro tier customers.</div>
  </details>

  <details><summary>What about custom themes or non-standard Shopify stores?</summary>
  <div class="answer">Doesn't matter what theme the store uses — we hit the underlying Shopify storefront JSON, not the rendered HTML. The same endpoints work on every theme. A handful of stores disable the public <code>/products/&lt;handle&gt;.json</code> endpoint at the platform level; those fall through to the JSON-LD adapter (which still works for most of them).</div>
  </details>

  <details><summary>What about Amazon, Nike, and other bot-protected sites?</summary>
  <div class="answer">Those need the Chrome extension. Server-side fetches get blocked by Akamai/Incapsula, but the extension extracts schemas client-side in the user's real browser and pushes them to the shared cache. Once cached, the API serves them server-side instantly for all future agents.</div>
  </details>

  <details><summary>Pricing for Shopify use specifically?</summary>
  <div class="answer">Same tiered pricing as the rest of wmcp.sh — Free (100 reads/day, no live execute), Pro $99/mo (10k reads + 1k live executes/day, includes Shopify <code>add_to_cart</code>), Reseller $299/mo (100k + 50k, designed for agent platforms). Get a key at <a href="/dashboard">/dashboard</a>.</div>
  </details>
</section>

<section id="see-also">
  <div class="section-label">See also</div>
  <h2>Shopify-specific agent-readiness</h2>
  <p style="color:var(--muted);margin-bottom:14px">Most Shopify stores are 60% agent-ready out of the box — the remaining 40% (variants, add-to-cart actions, inventory awareness, Plus WAF allowlist) is covered at <a href="/agent-ready/shopify" style="color:var(--accent2);text-decoration:none">/agent-ready/shopify</a>. The cornerstone diagnostic is at <a href="/agent-ready" style="color:var(--accent2);text-decoration:none">/agent-ready</a>. Or have us audit your store: <a href="/managed" style="color:var(--accent2);text-decoration:none">/managed</a> ($499 starter).</p>
</section>

<footer>
  <a href="/">Home</a> · <a href="/agent-ready">Agent-ready</a> · <a href="/agent-ready/shopify">Shopify</a> · <a href="/managed">Done for you</a> · <a href="/price-data">Price data</a> · <a href="/integration/openapi">OpenAPI</a> · <a href="/directory">Directory</a> · <a href="https://github.com/New1Direction/webmcp-anything">GitHub</a>
</footer>

</div>

<script>
const ORIGIN = ${JSON.stringify(origin)};
const out = document.getElementById("out");
const inp = document.getElementById("u");
const btn = document.getElementById("go");
document.querySelectorAll(".chip").forEach(c => { c.addEventListener("click", () => { inp.value = c.dataset.u; run(); }); });
btn.addEventListener("click", run);
inp.addEventListener("keydown", e => { if (e.key === "Enter") run(); });

async function run() {
  const url = inp.value.trim();
  if (!url) return;
  btn.disabled = true; btn.textContent = "…";
  out.innerHTML = '<span class="c">// fetching ' + escape(url) + '…</span>';
  try {
    const r = await fetch(ORIGIN + "/api/v1/tools?url=" + encodeURIComponent(url));
    const data = await r.json();
    out.innerHTML = colorize(JSON.stringify(data, null, 2));
  } catch (e) {
    out.innerHTML = '<span style="color:var(--red)">' + escape(String(e)) + '</span>';
  } finally {
    btn.disabled = false; btn.textContent = "⚡ Get tools";
  }
}
function escape(s) { return s.replace(/[&<>]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;"})[c]); }
function colorize(json) { return escape(json).replace(/&quot;([^&]+?)&quot;:/g, '<span class="k">"$1"</span>:').replace(/: &quot;([^&]*?)&quot;/g, ': <span class="s">"$1"</span>'); }
</script>
</body>
</html>`;
}
