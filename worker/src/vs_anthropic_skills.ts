// /vs/anthropic-skills — head-to-head with Anthropic Skills.
// SERP target family: "anthropic skills vs mcp", "claude skills",
// "agent skills". Anthropic Skills are capability bundles (SKILL.md
// + scripts) a Claude agent ships with. wmcp.sh is dynamic runtime
// tool extraction. Very different shapes.
//
// CRITICAL: this is the highest-libel-risk page in the batch. Anthropic
// is a major company. We must:
//   • Not claim any affiliation
//   • Not misrepresent how Skills work — stick to public Anthropic docs
//   • Not say Skills are "closed" pejoratively; describe them neutrally
//   • Explicit disclaimer at top + repeated in JSON-LD
//
// wmcp.sh is not affiliated with, endorsed by, or sponsored by
// Anthropic, PBC. "Claude" is a trademark of Anthropic, PBC.

export function vsAnthropicSkillsHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>wmcp.sh vs Anthropic Skills — dynamic tool extraction vs packaged capabilities | wmcp.sh</title>
<meta name="description" content="Anthropic Skills are packaged capability bundles a Claude agent loads (SKILL.md + scripts). wmcp.sh is a runtime MCP gateway that extracts tools from URLs / OpenAPI specs. Different shapes — when each fits." />
<link rel="canonical" href="${origin}/vs/anthropic-skills" />
<meta property="og:title" content="wmcp.sh vs Anthropic Skills — honest comparison" />
<meta property="og:description" content="Anthropic Skills package capabilities as SKILL.md + scripts. wmcp.sh extracts MCP tools dynamically from URLs and specs. Complementary patterns." />
<meta property="og:url" content="${origin}/vs/anthropic-skills" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="wmcp.sh vs Anthropic Skills" />
<meta name="twitter:description" content="Packaged Skill bundles vs dynamic MCP extraction. Honest head-to-head." />
<meta name="twitter:image" content="${origin}/og.png" />
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "wmcp.sh vs Anthropic Skills — packaged capabilities vs runtime MCP extraction",
  "description": "Side-by-side: Anthropic Skills and wmcp.sh compared on shape, distribution, runtime, and when each is the right fit. wmcp.sh is not affiliated with Anthropic.",
  "author": { "@type": "Organization", "name": "WebMCP Anything" },
  "publisher": { "@type": "Organization", "name": "WebMCP Anything", "url": "https://wmcp.sh" },
  "datePublished": "2026-05-28",
  "dateModified": "2026-05-28",
  "mainEntityOfPage": "${origin}/vs/anthropic-skills"
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What are Anthropic Skills?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Per Anthropic's public documentation, Skills (also called Agent Skills) are packaged capability bundles — typically a SKILL.md instruction file plus optional scripts and resources — that a Claude agent can load on demand. They're authored ahead of time and made available to the agent at runtime through the harness (claude.ai, Claude Code, the API). See docs.anthropic.com for the canonical, current spec."
      }
    },
    {
      "@type": "Question",
      "name": "How is wmcp.sh different from Skills?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Skills are static bundles authored ahead of time — code + instructions packaged for the agent. wmcp.sh is a runtime gateway: you point it at a URL (Shopify product, OpenAPI spec, OAuth-gated upstream) and it returns MCP tools the agent can call right now, with no packaging step. Skills are 'capabilities the agent ships with'; wmcp.sh is 'tools the agent discovers on the fly'."
      }
    },
    {
      "@type": "Question",
      "name": "Can I use both?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes — they're complementary. A Skill can include logic that calls wmcp.sh as an MCP tool source: the Skill provides workflow + instructions, wmcp.sh provides the dynamic tool surface (price-data, OpenAPI ingest, Shopify, etc.). Many teams will pair them."
      }
    },
    {
      "@type": "Question",
      "name": "When should I pick Skills over wmcp.sh?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Pick Skills when (1) you're building a specific workflow inside the Claude ecosystem (claude.ai / Claude Code) and want to ship pre-authored instructions + scripts, (2) the capability you need is more about HOW the agent should reason than WHAT external systems it should call, (3) you want one-click installation inside Claude's harness."
      }
    },
    {
      "@type": "Question",
      "name": "When should I pick wmcp.sh?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Pick wmcp.sh when (1) the tool surface is external and dynamic — Stripe's OpenAPI, Shopify stores, OAuth-gated MCP servers, DeFi oracle data, (2) you need the same tools to work across multiple agents (Claude.ai, Cursor, LangChain, OpenAI Agents SDK), not just inside Claude, (3) you want runtime extraction from URLs without authoring each capability bundle, (4) you need hosted edge runtime with multi-tenant access."
      }
    },
    {
      "@type": "Question",
      "name": "Is wmcp.sh affiliated with Anthropic?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. wmcp.sh is an independent project and is not affiliated with, endorsed by, or sponsored by Anthropic, PBC. 'Claude' is a trademark of Anthropic, PBC. All references to Skills are based on Anthropic's public documentation."
      }
    },
    {
      "@type": "Question",
      "name": "Are Skills MCP-compatible?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Skills and MCP are different mechanisms in Anthropic's stack: Skills package capabilities for a Claude agent harness; MCP is an open wire protocol for external tools. A Skill can include MCP server references — and wmcp.sh exposes MCP endpoints — so a Skill can use wmcp.sh as its tool source. See Anthropic's docs for the authoritative model."
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
  h1 { font-size:clamp(2.1rem,4.8vw,3.2rem);margin:0 0 18px;background:linear-gradient(135deg,#fff 30%,var(--accent2) 100%);-webkit-background-clip:text;background-clip:text;color:transparent;line-height:1.05;font-weight:800;letter-spacing:-.025em; }
  .sub { color: var(--muted); font-size: 1.05rem; max-width: 700px; margin: 0 0 24px; }
  .hint { color: var(--dim); font-size: .85rem; margin-top: 8px; }
  .disclaim { color: var(--dim); font-size: .75rem; margin-top: 14px; font-style: italic; }
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
  <div class="badge"><span class="dot"></span> competitor &middot; anthropic skills</div>
  <h1>wmcp.sh vs Anthropic Skills.</h1>
  <p class="sub">Anthropic Skills are <strong>packaged capability bundles</strong> — typically a <code>SKILL.md</code> plus optional scripts — that a Claude agent loads on demand. wmcp.sh is a <strong>runtime MCP gateway</strong> that extracts tools from URLs and specs on the fly. Different shapes. Often used together.</p>
  <p class="hint">Skills define <em>how</em> the agent reasons about a workflow. wmcp.sh supplies <em>what</em> external systems the agent can call.</p>
  <p class="disclaim">wmcp.sh is not affiliated with, endorsed by, or sponsored by Anthropic, PBC. "Claude" is a trademark of Anthropic, PBC. All claims about Skills are based on Anthropic's public documentation at docs.anthropic.com and subject to change.</p>
</header>

<!-- ========== THE WEDGE ========== -->
<section id="wedge">
  <div class="section-label">The shape difference</div>
  <h2>One sentence each.</h2>
  <div class="wins-grid">
    <div class="wins-card">
      <h3>Anthropic Skills</h3>
      <p style="color:var(--muted);margin:0 0 12px;font-size:.95rem;line-height:1.65">Packaged capability bundles — a SKILL.md instruction file plus optional scripts and resources — that a Claude agent harness can load when relevant. Authored ahead of time; distributed within the Anthropic ecosystem (claude.ai, Claude Code, API).</p>
    </div>
    <div class="wins-card us">
      <h3>wmcp.sh</h3>
      <p style="color:var(--muted);margin:0 0 12px;font-size:.95rem;line-height:1.65">A runtime gateway: point at any URL, OpenAPI spec, or upstream MCP server. Returns MCP tools immediately, no packaging step. Works with any MCP client — Claude, Cursor, LangChain, OpenAI Agents SDK, custom code.</p>
    </div>
  </div>
</section>

<!-- ========== CAPABILITY TABLE ========== -->
<section id="capabilities">
  <div class="section-label">Side-by-side</div>
  <h2>The capability matrix.</h2>
  <table>
    <thead>
      <tr><th>Capability</th><th>Anthropic Skills</th><th>wmcp.sh</th></tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Format</strong></td>
        <td>SKILL.md + optional scripts/resources (per Anthropic docs)</td>
        <td class="ours">MCP tool descriptors served over Streamable HTTP</td>
      </tr>
      <tr>
        <td><strong>Authoring model</strong></td>
        <td>Static — authored ahead of time, packaged</td>
        <td class="ours">Dynamic — extracted at runtime from a URL or spec</td>
      </tr>
      <tr>
        <td><strong>Runtime location</strong></td>
        <td>Anthropic's agent harness (claude.ai, Claude Code, API)</td>
        <td class="ours">Cloudflare Workers edge, callable from any MCP client</td>
      </tr>
      <tr>
        <td><strong>Cross-agent compatibility</strong></td>
        <td>Designed for the Claude ecosystem</td>
        <td class="ours">Any MCP client — Claude, Cursor, LangChain, OpenAI Agents SDK</td>
      </tr>
      <tr>
        <td><strong>Best at</strong></td>
        <td>Pre-authored workflows + reasoning patterns</td>
        <td class="ours">Surfacing external systems as tools without authoring each one</td>
      </tr>
      <tr>
        <td><strong>OpenAPI spec ingest</strong></td>
        <td>Skill author can include scripts that call APIs</td>
        <td class="ours">✅ Any OpenAPI 3 spec → MCP tools automatically</td>
      </tr>
      <tr>
        <td><strong>Shopper-side adapters</strong></td>
        <td>Author-dependent</td>
        <td class="ours">✅ Shopify storefronts (~4M+ public)</td>
      </tr>
      <tr>
        <td><strong>OAuth-proxy upstream MCP</strong></td>
        <td>Out of scope</td>
        <td class="ours">✅ <code>wmcp.sh/mcp/&lt;provider&gt;</code></td>
      </tr>
      <tr>
        <td><strong>Distribution</strong></td>
        <td>Within Anthropic ecosystem</td>
        <td class="ours">Public HTTP endpoint + /directory listing</td>
      </tr>
      <tr>
        <td><strong>Pricing</strong></td>
        <td>Per Anthropic's pricing for Claude usage — see anthropic.com</td>
        <td class="ours">100 reads/day free anonymous; managed from $499 one-time</td>
      </tr>
    </tbody>
  </table>
  <p class="disclaim">Details about Anthropic Skills are based on Anthropic's public documentation and subject to change. See docs.anthropic.com for current canonical information.</p>
</section>

<!-- ========== WINS PER SIDE ========== -->
<section id="wins">
  <div class="section-label">When they win — honestly</div>
  <h2>Skills are powerful inside the Claude ecosystem. wmcp.sh covers a different surface.</h2>
  <div class="wins-grid">
    <div class="wins-card">
      <h3>Anthropic Skills win when:</h3>
      <ul>
        <li>You're building inside the Claude ecosystem (claude.ai, Claude Code, Anthropic API) and want first-class authoring</li>
        <li>The capability is more about HOW the agent should reason than WHAT external system to call</li>
        <li>You want pre-authored, versioned, one-click-installable bundles inside the Claude harness</li>
        <li>You're shipping a reusable workflow with embedded instructions + scripts</li>
        <li>You don't need cross-agent portability today (your users are on Claude)</li>
      </ul>
    </div>
    <div class="wins-card us">
      <h3>wmcp.sh wins when:</h3>
      <ul>
        <li>The tool surface is external + dynamic — Stripe OpenAPI, Shopify stores, OAuth-gated MCP, DeFi oracle data</li>
        <li>You need the same tools available across Claude, Cursor, LangChain, OpenAI Agents SDK, and custom agents</li>
        <li>You want runtime extraction without authoring each capability bundle by hand</li>
        <li>You need hosted edge runtime with multi-tenant access from web</li>
        <li>You want managed agent-readiness for your own brand (we ship JSON-LD + MCP server + verified badge)</li>
      </ul>
    </div>
  </div>
</section>

<!-- ========== ARCHITECTURE DIAGRAM ========== -->
<section id="arch">
  <div class="section-label">Architecture (text)</div>
  <h2>Skills + wmcp.sh stacked.</h2>
  <pre><code><span class="c">┌──────────────────────────────────────────────────────────┐</span>
<span class="c">│  Claude agent (claude.ai / Claude Code / API harness)    │</span>
<span class="c">│                                                          │</span>
<span class="c">│  ┌──────────────────┐   ┌───────────────────────────┐    │</span>
<span class="c">│  │  Skill A         │   │  MCP client                │    │</span>
<span class="c">│  │  (SKILL.md +     │   │  pointed at:               │    │</span>
<span class="c">│  │   scripts)       │   │  ${origin}/mcp/...         │    │</span>
<span class="c">│  └──────────────────┘   └───────────────┬───────────┘    │</span>
<span class="c">└─────────────────────────────────────────│────────────────┘</span>
<span class="c">                                          │ MCP / HTTPS</span>
<span class="c">                                          ▼</span>
<span class="c">┌──────────────────────────────────────────────────────────┐</span>
<span class="c">│  wmcp.sh edge worker                                     │</span>
<span class="c">│    • OpenAPI ingest                                      │</span>
<span class="c">│    • shopper-side / OAuth-proxy / oracle adapters        │</span>
<span class="c">└──────────────────────────────────────────────────────────┘</span></code></pre>
  <p class="hint">Skill provides the workflow + reasoning template. wmcp.sh provides the dynamic tool surface.</p>
</section>

<!-- ========== FAQ ========== -->
<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions.</h2>

  <details><summary>What are Anthropic Skills?</summary>
  <div class="answer">Per Anthropic's public documentation, Skills are packaged capability bundles — typically a SKILL.md instruction file plus optional scripts and resources — loaded on demand by a Claude agent harness. See docs.anthropic.com for the canonical, current spec.</div>
  </details>

  <details><summary>How is wmcp.sh different?</summary>
  <div class="answer">Skills are static bundles authored ahead of time. wmcp.sh is dynamic — you point it at a URL or spec and it returns MCP tools right now, no packaging.</div>
  </details>

  <details><summary>Can I use both?</summary>
  <div class="answer">Yes. A Skill can reference wmcp.sh as an MCP tool source — the Skill provides workflow + instructions, wmcp.sh provides the live tool surface.</div>
  </details>

  <details><summary>When should I pick Skills?</summary>
  <div class="answer">When you're shipping pre-authored workflows inside the Claude ecosystem and the capability is more about reasoning than external system access.</div>
  </details>

  <details><summary>When should I pick wmcp.sh?</summary>
  <div class="answer">When the tool surface is external, dynamic, and needs to work across multiple agents (not just Claude).</div>
  </details>

  <details><summary>Is wmcp.sh affiliated with Anthropic?</summary>
  <div class="answer">No. wmcp.sh is independent. Not affiliated with, endorsed by, or sponsored by Anthropic, PBC. "Claude" is a trademark of Anthropic, PBC.</div>
  </details>
</section>

<!-- ========== UPGRADE CTA ========== -->
<section id="upgrade" style="margin-top:36px;background:linear-gradient(135deg,var(--card),rgba(124,92,255,0.08));border:1px solid rgba(124,92,255,0.35);border-radius:16px;padding:22px 26px">
  <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;justify-content:space-between">
    <div style="flex:1;min-width:240px">
      <div style="font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent2);font-weight:700;margin-bottom:6px">Need this picked / built for you?</div>
      <h3 style="margin:0 0 4px;font-size:1.05rem;color:var(--text)">We'll build the MCP layer your Skill calls.</h3>
      <p style="color:var(--muted);margin:0;font-size:.92rem">Custom MCP adapter + hosted endpoint at <code>mcp.yourbrand.com</code> + verified badge. From <strong style="color:var(--text)">$499 one-time setup</strong>; Pro retainer <strong style="color:var(--text)">$999/mo</strong>; Enterprise <strong style="color:var(--text)">$4,999+/mo</strong>.</p>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <a href="/managed" style="display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#7c5cff,#00e5ff);color:#0c0c14;padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:700;font-size:.9rem">See /managed →</a>
      <a href="/directory/submit" style="display:inline-flex;align-items:center;gap:6px;background:#11111c;border:1px solid #26263a;color:var(--text);padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:600;font-size:.9rem">Submit (free)</a>
    </div>
  </div>
</section>

<!-- ========== RELATED ========== -->
<section id="related">
  <div class="section-label">Related</div>
  <h2>Other tools people compare us to.</h2>
  <p class="section-sub">
    <a href="/vs/composio" style="color:var(--accent2);text-decoration:none">/vs/composio</a> &middot;
    <a href="/vs/arcade-ai" style="color:var(--accent2);text-decoration:none">/vs/arcade-ai</a> &middot;
    <a href="/vs/langchain-tools" style="color:var(--accent2);text-decoration:none">/vs/langchain-tools</a> &middot;
    <a href="/vs/mcp-toolkit" style="color:var(--accent2);text-decoration:none">/vs/mcp-toolkit</a> &middot;
    <a href="/roundup/mcp-servers-2026" style="color:var(--accent2);text-decoration:none">/roundup/mcp-servers-2026</a> &middot;
    <a href="/integration/anthropic" style="color:var(--accent2);text-decoration:none">/integration/anthropic</a>
  </p>
</section>

</div>

<footer>
  <a href="/">Home</a> · <a href="/agent-ready">Agent-ready</a> · <a href="/managed">Done for you</a> · <a href="/directory">Directory</a> · <a href="/directory/submit">Submit</a> · <a href="/blog">Blog</a> · <a href="/roundup/mcp-servers-2026">MCP servers roundup</a>
</footer>

</body>
</html>`;
}
