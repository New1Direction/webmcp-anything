export function howToExposeShopifyMcpHtml(origin: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>How to Expose Shopify as MCP | wmcp.sh</title>
<meta name="description" content="Learn how to turn any of Shopify's ~4M storefronts into MCP tools instantly. Connect shopper-side capabilities to Claude or Cursor with wmcp.sh.">
<link rel="canonical" href="\${origin}/how-to/expose-shopify-as-mcp" />
<meta property="og:title" content="How to Expose Shopify as MCP | wmcp.sh" />
<meta property="og:description" content="Step-by-step: turn any Shopify storefront URL into MCP tools via wmcp.sh — no merchant API key required." />
<meta property="og:url" content="\${origin}/how-to/expose-shopify-as-mcp" />
<meta property="og:image" content="\${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="How to Expose Shopify as MCP" />
<meta name="twitter:description" content="Turn any Shopify storefront URL into MCP tools." />
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article","headline":"How to Expose Shopify as MCP","description":"Step-by-step guide to turning any Shopify storefront URL into agent-callable MCP tools via wmcp.sh.","author":{"@type":"Organization","name":"WebMCP Anything"},"publisher":{"@type":"Organization","name":"WebMCP Anything","url":"https://wmcp.sh"},"datePublished":"2026-05-28","dateModified":"2026-05-28","mainEntityOfPage":"\${origin}/how-to/expose-shopify-as-mcp"}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
  {"@type":"Question","name":"Do I need to be the Shopify merchant?","acceptedAnswer":{"@type":"Answer","text":"No. wmcp.sh extracts shopper-side tools (get_price, list_variants, add_to_cart) from public Shopify product pages without merchant API keys or access tokens. wmcp.sh is not affiliated with Shopify."}},
  {"@type":"Question","name":"What about checkout?","acceptedAnswer":{"@type":"Answer","text":"add_to_cart returns a permalink that the user (or their agent) opens to complete checkout in the merchant's own checkout flow. wmcp.sh does not process payments."}}
]}
</script>
<style>
  :root { --bg: #0c0c14; --bg2: #11111c; --card: #161622; --border: #26263a; --text: #f0f0f5; --muted: #a0a0b0; --dim: #606070; --accent: #7c5cff; --accent2: #00e5ff; --pink: #ff3366; --green: #00e676; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: var(--bg); color: var(--text); margin: 0; padding: 0; line-height: 1.6; }
  .wrap { max-width: 920px; margin: 0 auto; padding: 0 24px; }
  nav { display:flex;justify-content:space-between;align-items:center;padding:22px 24px;max-width:1080px;margin:0 auto; }
  nav .brand { font-weight: 800; letter-spacing: -.02em; font-size: 1.05rem; }
  nav .brand span { color: var(--accent2); }
  nav .links { display: flex; gap: 22px; font-size: .9rem; }
  nav .links a { color: var(--muted); text-decoration: none; }
  nav .links a:hover { color: var(--text); }
  nav .cta { background: var(--bg2); border: 1px solid var(--border); padding: 7px 14px; border-radius: 8px; font-size: .85rem; color: var(--text); text-decoration: none; font-weight: 600; }
  header.hero { padding: 50px 0 30px; }
  .badge { display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;font-size:.7rem;letter-spacing:.15em;text-transform:uppercase;font-weight:700;background:linear-gradient(90deg,rgba(124,92,255,.18),rgba(0,229,255,.18));border:1px solid rgba(124,92,255,.35);margin-bottom:18px; }
  .dot { width:6px;height:6px;background:var(--accent2);border-radius:50%;box-shadow:0 0 8px var(--accent2); }
  h1 { font-size:clamp(2rem,4.5vw,3rem);margin:0 0 18px;background:linear-gradient(135deg,#fff 30%,var(--accent2) 100%);-webkit-background-clip:text;background-clip:text;color:transparent;line-height:1.05;font-weight:800;letter-spacing:-.02em; }
  .sub { color: var(--muted); font-size: 1.05rem; max-width: 640px; margin: 0 0 24px; }
  section { padding: 36px 0; }
  .section-label { display:inline-block;font-size:.72rem;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--accent2);margin-bottom:10px; }
  h2 { font-size:clamp(1.4rem,3vw,1.9rem);margin:0 0 12px;font-weight:700;letter-spacing:-.02em; }
  .section-sub { color: var(--muted); max-width: 640px; margin: 0 0 24px; }
  pre { background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px 18px;overflow-x:auto;font-size:.82rem;color:var(--green);font-family:"SF Mono",Menlo,monospace;line-height:1.5;margin:14px 0; }
  pre .k { color: var(--accent2); } pre .s { color: var(--pink); } pre .c { color: var(--dim); }
  ol { color: var(--muted); padding-left: 20px; font-size: 1rem; line-height: 1.8; }
  ol li { margin-bottom: 12px; }
  ol li strong { color: var(--text); }
  footer { border-top:1px solid var(--border);margin-top:40px;padding:30px 0;text-align:center;color:var(--muted);font-size:.85rem; }
  footer a { color: var(--accent2); text-decoration: none; margin: 0 8px; }
  .disclaimer { font-size: 0.8rem; color: var(--dim); margin-top: 20px; font-style: italic; }
</style>
</head>
<body>

<nav>
  <div class="brand"><a href="/" style="color:inherit;text-decoration:none">wmcp<span>.sh</span></a></div>
  <div class="links">
    <a href="/agent-ready">Agent-ready</a>
    <a href="/managed">Done for you</a>
    <a href="/price-data">Price data</a>
    <a href="/integration/openapi">OpenAPI</a>
    <a href="/directory">Directory</a>
  </div>
  <a class="cta" href="/directory/submit">Submit App →</a>
</nav>

<div class="wrap">

<header class="hero">
  <div class="badge"><span class="dot"></span> Guide &middot; Commerce</div>
  <h1>How to expose Shopify as MCP.</h1>
  <p class="sub">Turn any of Shopify's ~4 million storefronts into agent-callable tools instantly. Learn the difference between shopper-side and merchant-side MCP interfaces and how to connect them to Claude or Cursor.</p>
</header>

<section id="intro">
  <p style="color:var(--muted);font-size:1.05rem;line-height:1.7;">The Model Context Protocol (MCP) revolutionizes how agents interact with the web. When it comes to e-commerce, Shopify powers roughly 4 million active storefronts globally. Using wmcp.sh, you can turn any public Shopify URL into an array of structured MCP tools—allowing agents to fetch product details, check inventory availability, and manage carts with zero configuration.</p>
</section>

<section id="shopper-vs-merchant">
  <div class="section-label">Architecture</div>
  <h2>Shopper-side vs. Merchant-side.</h2>
  <p style="color:var(--muted);font-size:.95rem;line-height:1.6;margin-bottom:16px;">Most integrations focus on <strong>merchant-side</strong> APIs, which require the store owner to install an app, configure OAuth, and grant permissions. While powerful, this limits agents to only stores you explicitly own or have partnered with.</p>
  <p style="color:var(--muted);font-size:.95rem;line-height:1.6;margin-bottom:16px;"><strong>Shopper-side</strong> integration, which wmcp.sh specializes in, allows agents to act exactly like a normal human visitor. By ingesting public JSON endpoints (like <code>/products.json</code>) that every Shopify store exposes, wmcp.sh dynamically compiles MCP tools for product discovery, price checking, and cart interactions without requiring the merchant to install anything. This opens up the entire Shopify ecosystem to autonomous agentic shopping.</p>
</section>

<section id="step-by-step">
  <div class="section-label">Tutorial</div>
  <h2>Exposing Shopify tools.</h2>
  <ol>
    <li><strong>Find a Shopify Storefront URL.</strong> Start with any product or collection URL from a known Shopify brand (e.g., Allbirds, Gymshark, Skims).</li>
    <li><strong>Query the wmcp.sh tools endpoint.</strong> Pass the URL to the wmcp.sh REST API. This will instantly analyze the target domain and return the available tools in standard MCP JSON format.
      <pre><code><span class="k">curl</span> <span class="s">'${origin}/api/v1/tools?url=https://www.allbirds.com/products/mens-wool-runners'</span></code></pre>
    </li>
    <li><strong>Review the Tool List.</strong> The response will include tools like <code>get_product_details</code>, <code>check_inventory</code>, and <code>add_to_cart</code>. Because wmcp.sh runs on Cloudflare Workers, this ingestion and translation happens with sub-100ms latency. The schemas are strictly typed and ready for LLM consumption.</li>
    <li><strong>Connect to Claude or Cursor.</strong> Configure your local AI assistant to point to this endpoint. If you're using Claude Desktop, follow our guide on <a href="/how-to/install-claude-desktop-mcp" style="color:var(--accent2);text-decoration:none">how to install Claude Desktop MCP</a> to bridge the wmcp.sh SSE transport to your local client.</li>
    <li><strong>Prompt the Agent.</strong> Now, you can instruct your agent: <em>"Check the price of the Men's Wool Runners in size 10 on Allbirds, and tell me if they are in stock."</em> The agent will automatically call the correct MCP tool and return the result.</li>
  </ol>
</section>

<section id="caching">
  <div class="section-label">Performance</div>
  <h2>Caching and Latency.</h2>
  <p style="color:var(--muted);font-size:.95rem;line-height:1.6;margin-bottom:16px;">To prevent overwhelming upstream storefronts and to provide agents with near-instant responses, wmcp.sh utilizes intelligent edge caching. Standard product queries leverage a short-TTL cache (~1s) ensuring that the data is both fresh and lightning fast (sub-100ms). This allows agents to confidently execute high-speed market research and price comparison sweeps across thousands of SKUs.</p>
</section>

<section id="related">
  <div class="section-label">Related</div>
  <h2>Keep reading.</h2>
  <p class="section-sub">
    <a href="/how-to/install-claude-desktop-mcp" style="color:var(--accent2);text-decoration:none">/how-to/install-claude-desktop-mcp</a> &middot;
    <a href="/agent-ready" style="color:var(--accent2);text-decoration:none">/agent-ready</a> &middot;
    <a href="/managed" style="color:var(--accent2);text-decoration:none">/managed</a> &middot;
    <a href="/directory" style="color:var(--accent2);text-decoration:none">/directory</a> &middot;
    <a href="/directory/submit" style="color:var(--accent2);text-decoration:none">/directory/submit</a>
  </p>
</section>

<div class="disclaimer">
  Disclaimer: wmcp.sh is not affiliated with Shopify, Allbirds, Gymshark, Skims, OpenAI, or Anthropic. All product names and brands are property of their respective owners.
</div>

</div>

<section id="upgrade" style="margin-top:36px;background:linear-gradient(135deg,var(--card),rgba(124,92,255,0.08));border:1px solid rgba(124,92,255,0.35);border-radius:16px;padding:22px 26px;max-width:920px;margin-left:auto;margin-right:auto;">
  <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;justify-content:space-between">
    <div style="flex:1;min-width:240px">
      <div style="font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent2);font-weight:700;margin-bottom:6px">Need this done for you?</div>
      <h3 style="margin:0 0 4px;font-size:1.05rem;color:var(--text)">Skip the wiring — we build, deploy, and monitor.</h3>
      <p style="color:var(--muted);margin:0;font-size:.92rem">Custom adapter + hosted MCP at <code>mcp.yourbrand.com</code> + verified badge. From <strong style="color:var(--text)">$499 one-time setup</strong>.</p>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <a href="/managed" style="display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#7c5cff,#00e5ff);color:#0c0c14;padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:700;font-size:.9rem">See /managed →</a>
      <a href="/directory/submit" style="display:inline-flex;align-items:center;gap:6px;background:#11111c;border:1px solid #26263a;color:var(--text);padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:600;font-size:.9rem">Submit (free)</a>
    </div>
  </div>
</section>

<footer>
  <a href="/">Home</a> · <a href="/agent-ready">Agent-ready</a> · <a href="/managed">Done for you</a> · <a href="/price-data">Price data</a> · <a href="/integration/openapi">OpenAPI</a> · <a href="/directory">Directory</a> · <a href="/directory/submit">Submit</a>
</footer>

</body>
</html>`;
}
