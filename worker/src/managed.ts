// managed.ts — /managed paid-service landing page.
//
// SERP target: "ai integration consultant", "agent economy consulting",
// "make my site work with claude", "schema markup service",
// "openapi development", "shopify ai agent setup".
//
// Three packages: Starter ($499 one-time), Pro ($999/mo), Enterprise
// ($4999/mo+setup). Form posts to /api/v1/leads (POST, KV-backed).

export function managedHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Done-for-you AI-readiness — Starter $499 to Enterprise white-label | wmcp.sh</title>
<meta name="description" content="We make your website agent-ready so Claude, ChatGPT, Cursor, and the agent economy can find and transact with you. JSON-LD audit, WebMCP markup, custom MCP server, monitoring. From $499 setup." />
<link rel="canonical" href="${origin}/managed" />
<meta property="og:title" content="Done-for-you AI-readiness — wmcp.sh managed" />
<meta property="og:description" content="3 packages: Starter $499 setup, Pro $999/mo, Enterprise white-label. We ship the markup, the MCP server, and the monitoring." />
<meta property="og:url" content="${origin}/managed" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Done-for-you AI-readiness" />
<meta name="twitter:description" content="From $499 setup. JSON-LD + MCP + monitoring." />
<meta name="twitter:image" content="${origin}/og.png" />
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "AI agent integration consulting",
  "provider": {
    "@type": "Organization",
    "name": "WebMCP Anything",
    "url": "https://wmcp.sh"
  },
  "description": "Make your website agent-ready: JSON-LD markup, OpenAPI spec, hosted MCP server, monitoring. Starter $499 setup, Pro $999/mo, Enterprise white-label MCP from $4,999/mo.",
  "areaServed": "Worldwide",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "wmcp.sh managed packages",
    "itemListElement": [
      {
        "@type": "Offer",
        "name": "Starter",
        "price": "499",
        "priceCurrency": "USD",
        "description": "One-time setup. JSON-LD audit + markup on 5 pages + directory submission + 30-day support."
      },
      {
        "@type": "Offer",
        "name": "Pro",
        "price": "999",
        "priceCurrency": "USD",
        "description": "Monthly retainer. Everything in Starter + custom adapter + traffic monitoring + quarterly review."
      },
      {
        "@type": "Offer",
        "name": "Enterprise",
        "price": "4999",
        "priceCurrency": "USD",
        "description": "White-label MCP server on your domain + custom tool design + SLA. Setup + monthly."
      }
    ]
  }
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What's the difference between wmcp.sh self-serve and managed?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Self-serve is the free tool: you drop your URL into our API, we return agent-callable tools by parsing whatever structured data you already have. Managed is the human work: we audit your site, ship the JSON-LD markup, build custom adapters if your stack is non-standard, host an MCP server on your domain, and monitor agent traffic. Self-serve works for sites that already have JSON-LD or OpenAPI. Managed covers the long tail where they don't."
      }
    },
    {
      "@type": "Question",
      "name": "How long does Starter take?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "5 business days from kickoff. Day 1-2: audit + spec. Day 3-4: implementation (we deploy schema markup to your top 5 pages via your CMS or as a PR to your repo). Day 5: validation + handoff + 30-day support window opens."
      }
    },
    {
      "@type": "Question",
      "name": "Do you need access to my codebase?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Depends. For Shopify / BigCommerce / WordPress / Wix sites, we work entirely through the CMS — no repo access needed. For custom React/Next.js codebases, we ship a PR against your repo with the changes, you review and merge. Enterprise white-label means we run the MCP server entirely on our infrastructure under your subdomain, no code changes on your end."
      }
    },
    {
      "@type": "Question",
      "name": "Can you sign an NDA?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes for Pro and Enterprise engagements. Starter is a fixed-scope one-time engagement and we use a standard mutual confidentiality clause in the contract."
      }
    },
    {
      "@type": "Question",
      "name": "What if my site is behind Cloudflare or another bot-protection layer?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Part of the engagement is configuring your WAF to allow verified AI agent traffic (Claude-User, ChatGPT-User) while still blocking real bots. We have the rule templates for Cloudflare, Akamai, and AWS WAF."
      }
    }
  ]
}
</script>
<style>
  :root { --bg:#07070d;--card:#16161f;--bg2:#11111c;--border:#26263a;--text:#ececf5;--muted:#8a8aa8;--dim:#6a6a88;--accent:#7c5cff;--accent2:#00e5ff;--green:#4ade80;--red:#f87171;--pink:#f0abfc;--gold:#fbbf24; }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin:0;min-height:100vh;color:var(--text);background:var(--bg);font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif;line-height:1.6;background-image:radial-gradient(ellipse 900px 600px at 10% -5%,rgba(124,92,255,.18),transparent 60%),radial-gradient(ellipse 700px 500px at 95% 10%,rgba(0,229,255,.10),transparent 60%); }
  .wrap { max-width: 1020px; margin: 0 auto; padding: 0 24px; }
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
  h1 { font-size:clamp(2.2rem,5vw,3.3rem);margin:0 0 18px;background:linear-gradient(135deg,#fff 30%,var(--accent2) 100%);-webkit-background-clip:text;background-clip:text;color:transparent;line-height:1.05;font-weight:800;letter-spacing:-.025em; }
  .sub { color: var(--muted); font-size: 1.1rem; max-width: 720px; margin: 0 0 24px; }
  .hint { color: var(--dim); font-size: .85rem; margin-top: 8px; }
  section { padding: 36px 0; }
  .section-label { display:inline-block;font-size:.72rem;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--accent2);margin-bottom:10px; }
  h2 { font-size:clamp(1.5rem,3.2vw,2.1rem);margin:0 0 12px;font-weight:700;letter-spacing:-.02em; }
  .section-sub { color: var(--muted); max-width: 700px; margin: 0 0 24px; }
  .tier-grid { display: grid; gap: 18px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); margin-top: 22px; }
  .tier { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 30px 26px; display: flex; flex-direction: column; position: relative; }
  .tier.featured { background: linear-gradient(135deg, var(--card), rgba(124,92,255,.08)); border-color: var(--accent); }
  .tier.featured::after { content: "Most popular"; position: absolute; top: -10px; right: 20px; background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%); color: white; font-size: .65rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; padding: 4px 12px; border-radius: 999px; }
  .tier h3 { font-size: 1.4rem; margin: 0 0 4px; color: var(--text); }
  .tier .price { font-size: 2.2rem; font-weight: 800; color: var(--accent2); margin: 8px 0 6px; letter-spacing: -.03em; }
  .tier .price small { font-size: .8rem; color: var(--muted); font-weight: 500; letter-spacing: normal; }
  .tier .tagline { color: var(--muted); font-size: .92rem; margin: 0 0 18px; }
  .tier ul { color: var(--text); font-size: .9rem; line-height: 1.7; padding-left: 22px; margin: 0 0 22px; flex: 1; }
  .tier ul li { margin-bottom: 4px; }
  .tier .cta { display: block; background: var(--accent); color: white; padding: 14px 22px; border-radius: 10px; text-decoration: none; font-weight: 700; text-align: center; font-size: .95rem; }
  .tier.featured .cta { background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%); }
  .tier.enterprise .cta { background: var(--bg2); color: var(--text); border: 1px solid var(--border); }
  .process-grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-top: 20px; }
  .step { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 20px; position: relative; }
  .step .num { position: absolute; top: 14px; right: 18px; font-size: 1.8rem; font-weight: 800; color: var(--border); letter-spacing: -.04em; }
  .step h4 { margin: 0 0 6px; color: var(--accent2); font-size: 1rem; padding-right: 36px; }
  .step p { color: var(--muted); font-size: .87rem; margin: 0; line-height: 1.5; }
  .form-wrap { background: linear-gradient(180deg, var(--card), var(--bg2)); border: 1px solid var(--border); border-radius: 18px; padding: 30px; margin-top: 22px; }
  .form-wrap h3 { margin: 0 0 8px; }
  .form-wrap .form-sub { color: var(--muted); font-size: .92rem; margin: 0 0 22px; }
  .form-row { display: grid; gap: 14px; grid-template-columns: 1fr 1fr; margin-bottom: 14px; }
  @media (max-width: 580px) { .form-row { grid-template-columns: 1fr; } }
  label { display: block; font-size: .8rem; font-weight: 700; color: var(--muted); margin-bottom: 6px; letter-spacing: .03em; }
  input, select, textarea { width: 100%; background: var(--bg); border: 1px solid var(--border); border-radius: 10px; padding: 12px 14px; color: var(--text); font-family: inherit; font-size: .95rem; }
  input:focus, select:focus, textarea:focus { outline: none; border-color: var(--accent); }
  textarea { min-height: 90px; resize: vertical; }
  .form-cta { display: block; background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%); color: white; padding: 14px 22px; border-radius: 10px; text-decoration: none; font-weight: 700; text-align: center; font-size: 1rem; border: none; cursor: pointer; width: 100%; margin-top: 8px; }
  .form-cta:hover { transform: translateY(-1px); }
  .hp { position: absolute; left: -9999px; }
  table { width: 100%; border-collapse: collapse; text-align: left; font-size: .9rem; margin-top: 16px; }
  th, td { padding: 14px 16px; border-bottom: 1px solid var(--border); vertical-align: top; }
  th { background: var(--bg2); font-weight: 700; color: var(--accent2); }
  tr:last-child td { border-bottom: none; }
  td strong { color: var(--text); }
  .checkmark { color: var(--green); font-weight: 700; }
  .dash { color: var(--dim); }
  details { background:var(--card);border:1px solid var(--border);border-radius:12px;padding:18px 20px;margin-bottom:12px; }
  details summary { font-weight: 700; font-size: 1rem; color: var(--text); cursor: pointer; list-style: none; }
  details[open] summary { margin-bottom: 12px; }
  details .answer { color: var(--muted); font-size: .92rem; line-height: 1.65; }
  .success { display: none; background: linear-gradient(135deg, rgba(74,222,128,.15), rgba(0,229,255,.08)); border: 1px solid var(--green); border-radius: 12px; padding: 22px; text-align: center; }
  .success.show { display: block; }
  .success h3 { color: var(--green); margin: 0 0 6px; }
  .error { display: none; background: rgba(248,113,113,.1); border: 1px solid var(--red); border-radius: 10px; padding: 14px; color: var(--red); font-size: .9rem; margin-top: 14px; }
  .error.show { display: block; }
  code { font-family: "SF Mono", Menlo, monospace; background: var(--bg2); padding: 1px 6px; border-radius: 4px; font-size: .85em; }
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
    <a href="/price-data">Price data</a>
    <a href="/directory">Directory</a>
    <a href="https://github.com/New1Direction/webmcp-anything">GitHub</a>
  </div>
  <a class="cta" href="#contact">Book audit →</a>
</nav>

<div class="wrap">

<header class="hero">
  <div class="badge"><span class="dot"></span> done for you &middot; ai-readiness</div>
  <h1>We make your site agent-ready. You ship product.</h1>
  <p class="sub">JSON-LD audit, WebMCP markup, OpenAPI spec, custom MCP server, monitoring. Configurable from a 5-day starter package to a white-label MCP service on your own subdomain. Real engineering, not a SaaS form-builder.</p>
  <p class="hint">Built on the same wmcp.sh open-source stack &mdash; we host the result, you own the configuration.</p>
</header>

<!-- ========== PACKAGES ========== -->
<section id="packages">
  <div class="section-label">Packages</div>
  <h2>Three tiers. Fixed scope. Real outcomes.</h2>
  <p class="section-sub">All three include the wmcp.sh Pro plan ($29/mo value) and a 30-day satisfaction guarantee on the deliverables. Pay via Stripe invoice or card.</p>

  <div class="tier-grid">
    <div class="tier">
      <h3>Starter</h3>
      <div class="price">$499 <small>one-time</small></div>
      <p class="tagline">Get your site agent-readable in 5 days. Best for small e-commerce and SaaS docs.</p>
      <ul>
        <li>Audit of current AI-readability (delivered as a PDF report)</li>
        <li>JSON-LD <code>Product</code> / <code>Offer</code> / <code>FAQPage</code> schema deployed on your top 5 pages</li>
        <li>WebMCP action markers on cart / search / contact forms</li>
        <li>OpenAPI spec ingestion + tool generation if you have an API</li>
        <li>Listing in the <a href="/directory" style="color:var(--accent2);text-decoration:none">/directory</a> for agent discovery</li>
        <li>30-day support window</li>
        <li>wmcp.sh Pro plan included for 3 months</li>
      </ul>
      <a class="cta" href="#contact">Get started →</a>
    </div>

    <div class="tier featured">
      <h3>Pro</h3>
      <div class="price">$999 <small>/ month</small></div>
      <p class="tagline">Continuous AI-readability + custom adapter + agent traffic analytics. For brands actively investing in the agent economy.</p>
      <ul>
        <li>Everything in Starter</li>
        <li>Custom adapter built for your stack (non-standard CMS, internal API, etc.)</li>
        <li>Monitoring dashboard: agent traffic by source (Claude / OpenAI / etc.)</li>
        <li>Schema markup maintained across new product pages automatically</li>
        <li>Quarterly review + new MCP capabilities as the standard evolves</li>
        <li>Priority Slack support (response within 4 business hours)</li>
        <li>wmcp.sh Pro plan + 10k reads/day included</li>
      </ul>
      <a class="cta" href="#contact">Talk to us →</a>
    </div>

    <div class="tier enterprise">
      <h3>Enterprise</h3>
      <div class="price">$4,999<small>+ /mo &amp; setup</small></div>
      <p class="tagline">White-label MCP server on your own subdomain. For platforms exposing their own customers' data as an agent surface.</p>
      <ul>
        <li>Everything in Pro</li>
        <li>White-label MCP server at <code>mcp.yourbrand.com</code></li>
        <li>Custom OAuth flow under your branding</li>
        <li>SLA: 99.9% uptime, 1-hour incident response</li>
        <li>Custom tool design (your domain experts + our agent-design experience)</li>
        <li>Direct integration with your existing auth (OAuth2, SAML, JWT)</li>
        <li>Quarterly executive review + roadmap input</li>
      </ul>
      <a class="cta" href="#contact">Schedule call →</a>
    </div>
  </div>
</section>

<!-- ========== COMPARISON ========== -->
<section id="compare">
  <div class="section-label">What's in each</div>
  <h2>Detailed comparison.</h2>

  <table>
    <thead>
      <tr>
        <th>Capability</th>
        <th>Starter</th>
        <th>Pro</th>
        <th>Enterprise</th>
      </tr>
    </thead>
    <tbody>
      <tr><td><strong>JSON-LD audit + deployment</strong></td><td class="checkmark">✓ 5 pages</td><td class="checkmark">✓ all pages</td><td class="checkmark">✓ all pages</td></tr>
      <tr><td><strong>WebMCP action markup</strong></td><td class="checkmark">✓ basic</td><td class="checkmark">✓ all forms</td><td class="checkmark">✓ custom</td></tr>
      <tr><td><strong>OpenAPI spec ingestion</strong></td><td class="checkmark">✓ if exists</td><td class="checkmark">✓ + we ship one if missing</td><td class="checkmark">✓ + we ship one if missing</td></tr>
      <tr><td><strong>Custom adapter</strong></td><td class="dash">—</td><td class="checkmark">✓</td><td class="checkmark">✓</td></tr>
      <tr><td><strong>Cloudflare/WAF allowlist config</strong></td><td class="dash">—</td><td class="checkmark">✓</td><td class="checkmark">✓</td></tr>
      <tr><td><strong>Agent traffic monitoring</strong></td><td class="dash">—</td><td class="checkmark">✓</td><td class="checkmark">✓</td></tr>
      <tr><td><strong>White-label MCP subdomain</strong></td><td class="dash">—</td><td class="dash">—</td><td class="checkmark">✓</td></tr>
      <tr><td><strong>Custom OAuth flow</strong></td><td class="dash">—</td><td class="dash">—</td><td class="checkmark">✓</td></tr>
      <tr><td><strong>SLA + incident response</strong></td><td class="dash">—</td><td class="dash">—</td><td class="checkmark">✓ 99.9% / 1h</td></tr>
      <tr><td><strong>Support</strong></td><td>Email, 30 days</td><td>Slack, ongoing</td><td>Slack + phone, ongoing</td></tr>
      <tr><td><strong>Turnaround (initial)</strong></td><td>5 business days</td><td>2-3 weeks ramp</td><td>4-6 weeks</td></tr>
    </tbody>
  </table>
</section>

<!-- ========== PROCESS ========== -->
<section id="process">
  <div class="section-label">How it works</div>
  <h2>Five steps from quote to live.</h2>

  <div class="process-grid">
    <div class="step"><span class="num">1</span><h4>Audit</h4><p>You fill in the form below. We pull your URL, run the full diagnostic, and send back a written audit within 48 hours.</p></div>
    <div class="step"><span class="num">2</span><h4>Quote</h4><p>Fixed-price quote based on scope. No surprises. Approve via email + Stripe invoice.</p></div>
    <div class="step"><span class="num">3</span><h4>Kickoff</h4><p>30-min call to align on tech stack, access, and brand voice. Slack channel opened.</p></div>
    <div class="step"><span class="num">4</span><h4>Ship</h4><p>We deploy schema markup, build the adapter, configure the MCP server. Daily updates in Slack.</p></div>
    <div class="step"><span class="num">5</span><h4>Validate</h4><p>End-to-end test from Claude / Cursor / OpenAI. Handoff documentation. Support window opens.</p></div>
  </div>
</section>

<!-- ========== CONTACT FORM ========== -->
<section id="contact">
  <div class="section-label">Get started</div>
  <h2>Free audit. 48-hour turnaround.</h2>
  <p class="section-sub">Tell us about your site. We'll run the full AI-readability diagnostic, send a written report, and quote a fixed price for the work. No commitment, no sales call required.</p>

  <div class="form-wrap">
    <h3>Request your free AI-readability audit</h3>
    <p class="form-sub">Reply within 48 business hours from <code>audit@wmcp.sh</code>.</p>

    <div id="lead-success" class="success">
      <h3>Thanks &mdash; received.</h3>
      <p>We'll send your audit + quote to the email you provided within 48 business hours. Look for <code>audit@wmcp.sh</code> &mdash; sometimes lands in Promotions.</p>
    </div>
    <div id="lead-error" class="error"></div>

    <form id="lead-form" onsubmit="return submitLead(event)">
      <!-- Honeypot for bots -->
      <input type="text" name="company_email" class="hp" tabindex="-1" autocomplete="off" />

      <div class="form-row">
        <div>
          <label for="name">Your name</label>
          <input id="name" name="name" type="text" required maxlength="100" />
        </div>
        <div>
          <label for="email">Email</label>
          <input id="email" name="email" type="email" required maxlength="200" />
        </div>
      </div>
      <div class="form-row">
        <div>
          <label for="site_url">Your site URL</label>
          <input id="site_url" name="site_url" type="url" required maxlength="500" placeholder="https://yourstore.com" />
        </div>
        <div>
          <label for="package">Package of interest</label>
          <select id="package" name="package">
            <option value="audit_only">Free audit only</option>
            <option value="starter">Starter ($499 one-time)</option>
            <option value="pro">Pro ($999/mo)</option>
            <option value="enterprise">Enterprise ($4,999+/mo)</option>
            <option value="unsure">Not sure yet</option>
          </select>
        </div>
      </div>
      <div>
        <label for="use_case">What are you trying to achieve?</label>
        <textarea id="use_case" name="use_case" maxlength="2000" placeholder="e.g. 'I want Claude / Cursor users to be able to buy from my Shopify store directly through their agent.' or 'I need our OpenAPI spec to show up as MCP tools so agents can integrate.'"></textarea>
      </div>
      <button type="submit" class="form-cta">Request audit →</button>
    </form>
  </div>
</section>

<!-- ========== FAQ ========== -->
<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions.</h2>

  <details><summary>What's the difference between wmcp.sh self-serve and managed?</summary>
  <div class="answer">Self-serve = the free tool: drop your URL into our API, we return agent-callable tools by parsing whatever structured data you already have. Managed = the human work: we audit your site, ship the JSON-LD markup, build custom adapters if your stack is non-standard, host an MCP server on your domain, and monitor agent traffic. Self-serve works for sites that already have JSON-LD or OpenAPI. Managed covers the long tail where they don't.</div>
  </details>

  <details><summary>How long does the Starter package take?</summary>
  <div class="answer">5 business days from kickoff. Days 1-2: audit + spec. Days 3-4: implementation (schema markup deployed via your CMS or as a PR to your repo). Day 5: validation + handoff + 30-day support window opens.</div>
  </details>

  <details><summary>Do you need access to my codebase?</summary>
  <div class="answer">Depends on stack. For Shopify / BigCommerce / WordPress / Wix sites, we work entirely through the CMS &mdash; no repo access needed. For custom React/Next.js codebases, we ship a PR against your repo with the changes, you review and merge. Enterprise white-label means we run the MCP server entirely on our infrastructure under your subdomain, no code changes on your end.</div>
  </details>

  <details><summary>Can you sign an NDA?</summary>
  <div class="answer">Yes for Pro and Enterprise engagements. Starter is a fixed-scope one-time engagement and we use a standard mutual confidentiality clause in the contract.</div>
  </details>

  <details><summary>What if my site is behind Cloudflare or another bot-protection layer?</summary>
  <div class="answer">Part of the Pro and Enterprise engagement is configuring your WAF to allow verified AI agent traffic (<code>Claude-User</code>, <code>ChatGPT-User</code>) while still blocking real bots. We have the rule templates for Cloudflare, Akamai, and AWS WAF.</div>
  </details>

  <details><summary>Do you offer hourly / one-off engagements?</summary>
  <div class="answer">Not currently. Starter is our smallest fixed-scope engagement. If you need something smaller (e.g. "review my JSON-LD"), use the free <code>curl 'wmcp.sh/api/v1/tools?url=…'</code> + our written documentation at <a href="/agent-ready" style="color:var(--accent2);text-decoration:none">/agent-ready</a> &mdash; that covers most DIY work.</div>
  </details>

  <details><summary>What payment methods do you accept?</summary>
  <div class="answer">Stripe invoice (card or ACH) for all packages. Wire / international ACH for Enterprise. Net-15 terms by default; Net-30 available on request for Enterprise contracts.</div>
  </details>

  <details><summary>Refunds?</summary>
  <div class="answer">30-day satisfaction guarantee on Starter and Pro &mdash; if the deliverables don't meet the scope as agreed, we refund pro-rata. Enterprise refunds are governed by the SLA terms in the contract (typically pro-rata for missed SLA, no refund for cancellation without cause).</div>
  </details>
</section>

</div>

<footer>
  <a href="/">Home</a> &middot; <a href="/agent-ready">Agent-ready</a> &middot; <a href="/managed">Done for you</a> &middot; <a href="/price-data">Price data</a> &middot; <a href="/directory">Directory</a> &middot; <a href="https://github.com/New1Direction/webmcp-anything">GitHub</a>
</footer>

<script>
async function submitLead(ev) {
  ev.preventDefault();
  const form = ev.target;
  const errEl = document.getElementById('lead-error');
  const okEl = document.getElementById('lead-success');
  errEl.classList.remove('show');
  errEl.textContent = '';
  const body = {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    site_url: form.site_url.value.trim(),
    package: form.package.value,
    use_case: form.use_case.value.trim(),
    hp: form.company_email.value, // honeypot — must be empty
  };
  if (body.hp) { return false; } // silently drop bot submission
  try {
    const res = await fetch('/api/v1/leads', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Submit failed (' + res.status + ')');
    }
    form.style.display = 'none';
    okEl.classList.add('show');
    okEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (err) {
    errEl.textContent = err.message || 'Submit failed. Try again or email audit@wmcp.sh directly.';
    errEl.classList.add('show');
  }
  return false;
}
</script>
</body>
</html>`;
}
