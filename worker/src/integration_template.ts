// integration_template.ts — shared scaffold for /integration/<provider> pages.
//
// Reduces 5 nearly-identical pages from ~2000 LoC to ~1000. Each page passes
// a config object; this returns the full HTML. CSS + nav + footer + JSON-LD
// boilerplate live here; pages provide their own copy, comparison rows, code
// samples, and FAQ.

export interface IntegrationPageConfig {
  origin: string;
  provider_id: string;        // "github", "google", "slack", "notion", "linear"
  provider_name: string;      // "GitHub", "Google Workspace", ...

  // SEO
  title: string;              // <title> + og:title
  description: string;        // meta description
  h1: string;                 // hero H1
  sub: string;                // hero subtitle
  badge_label?: string;       // small uppercase badge at top of hero (default: "integration · <id>")

  // Article schema
  article_headline: string;
  article_description: string;

  // FAQ schema + visible accordion (same items, mirrored)
  faqs: Array<{ q: string; a_html: string }>;

  // Comparison table: 4 columns (Capability, Alt 1, Alt 2, wmcp.sh)
  comparison_headers: [string, string, string, string]; // e.g. ["Capability", "Stripe SDK", "Composio", "wmcp.sh"]
  comparison_rows: Array<[string, string, string, string]>; // each row 4 cells

  // Tools list (provider's top tools)
  tools: Array<{ name: string; type: "Static" | "Live action"; returns: string }>;

  // Code example — language label + code
  code_example: { lang: string; code_html: string };
}

function escapeAttr(s: string): string {
  return s.replace(/"/g, "&quot;").replace(/&/g, "&amp;");
}

// Provider → matching agent-readiness vertical. Drives the "see also"
// section and cross-link copy at the bottom of each integration page.
const VERTICAL_BY_PROVIDER: Record<string, { slug: string; label: string; hook: string }> = {
  github: {
    slug: "api",
    label: "API agent-readiness",
    hook: "GitHub's the canonical OpenAPI-as-MCP example. If you're building your own API, see how to ship a clean spec + agent-friendly auth.",
  },
  google: {
    slug: "saas",
    label: "SaaS agent-readiness",
    hook: "Google Workspace OAuth is the example. If you're a SaaS founder thinking about agent traffic, see the founder-level checklist.",
  },
  slack: {
    slug: "saas",
    label: "SaaS agent-readiness",
    hook: "Slack-as-an-integration is the SaaS pattern at scale. If you're a SaaS founder, see how to be recommendable, signupable, and usable to agents.",
  },
  notion: {
    slug: "docs",
    label: "Docs agent-readiness",
    hook: "Notion overlaps with docs sites — same agent-discovery dynamics. See the docs-site guide for llms.txt + structured search.",
  },
  linear: {
    slug: "api",
    label: "API agent-readiness",
    hook: "Linear's GraphQL + OAuth is a model for shipping an API agents can drive. See the API-side checklist.",
  },
};

export function integrationPageHtml(c: IntegrationPageConfig): string {
  const badge = c.badge_label || `integration · ${c.provider_id}`;
  const vertical = VERTICAL_BY_PROVIDER[c.provider_id];
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        // Strip HTML for schema text — Google prefers plain text in FAQPage
        text: f.a_html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim(),
      },
    })),
  };
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: c.article_headline,
    description: c.article_description,
    author: { "@type": "Organization", name: "WebMCP Anything" },
    publisher: { "@type": "Organization", name: "WebMCP Anything", url: "https://wmcp.sh" },
    datePublished: "2026-05-27",
    dateModified: "2026-05-27",
    mainEntityOfPage: `${c.origin}/integration/${c.provider_id}`,
  };

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${c.title}</title>
<meta name="description" content="${escapeAttr(c.description)}" />
<link rel="canonical" href="${c.origin}/integration/${c.provider_id}" />
<meta property="og:title" content="${escapeAttr(c.title)}" />
<meta property="og:description" content="${escapeAttr(c.description)}" />
<meta property="og:url" content="${c.origin}/integration/${c.provider_id}" />
<meta property="og:image" content="${c.origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeAttr(c.title)}" />
<meta name="twitter:description" content="${escapeAttr(c.description)}" />
<meta name="twitter:image" content="${c.origin}/og.png" />
<script type="application/ld+json">${JSON.stringify(articleSchema)}</script>
<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>
<style>
  :root { --bg:#07070d;--card:#16161f;--bg2:#11111c;--border:#26263a;--text:#ececf5;--muted:#8a8aa8;--dim:#6a6a88;--accent:#7c5cff;--accent2:#00e5ff;--green:#4ade80;--red:#f87171;--pink:#f0abfc; }
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
    <a href="/integration/openapi">OpenAPI</a>
    <a href="/price-data">Price data</a>
    <a href="/directory">Directory</a>
  </div>
  <a class="cta" href="/dashboard">Dashboard →</a>
</nav>

<div class="wrap">

<header class="hero">
  <div class="badge"><span class="dot"></span> ${badge}</div>
  <h1>${c.h1}</h1>
  <p class="sub">${c.sub}</p>
  <p class="hint">Last updated 2026-05-27 · works with Claude, OpenAI, LangChain, and any MCP client</p>
</header>

<section id="vs">
  <div class="section-label">Positioning</div>
  <h2>vs. the alternatives</h2>
  <table>
    <thead>
      <tr>${c.comparison_headers.map((h) => `<th>${h}</th>`).join("")}</tr>
    </thead>
    <tbody>
      ${c.comparison_rows
        .map(
          (r) =>
            `<tr><td><strong>${r[0]}</strong></td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`
        )
        .join("")}
    </tbody>
  </table>
</section>

<section id="tools">
  <div class="section-label">What you get</div>
  <h2>Tools your agent calls</h2>
  <p class="section-sub">All MCP-shaped — consumed directly by Claude tool_use, OpenAI function-calling, or LangChain.</p>
  <table>
    <thead><tr><th>Tool</th><th>Type</th><th>Returns</th></tr></thead>
    <tbody>
      ${c.tools
        .map(
          (t) =>
            `<tr><td><code>${t.name}</code></td><td>${t.type}</td><td>${t.returns}</td></tr>`
        )
        .join("")}
    </tbody>
  </table>
</section>

<section id="code">
  <div class="section-label">Integrate</div>
  <h2>${c.code_example.lang}</h2>
  <pre><code>${c.code_example.code_html}</code></pre>
</section>

<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Frequently asked</h2>
  ${c.faqs
    .map(
      (f) =>
        `<details><summary>${f.q}</summary><div class="answer">${f.a_html}</div></details>`
    )
    .join("\n  ")}
</section>

${vertical ? `<section id="see-also">
  <div class="section-label">See also</div>
  <h2>${vertical.label}</h2>
  <p style="color:var(--muted);margin-bottom:14px">${vertical.hook}</p>
  <p><a href="/agent-ready/${vertical.slug}" style="color:var(--accent2);text-decoration:none;font-weight:600">→ /agent-ready/${vertical.slug}</a> &nbsp;·&nbsp; <a href="/agent-ready" style="color:var(--accent2);text-decoration:none">cornerstone</a> &nbsp;·&nbsp; <a href="/managed" style="color:var(--accent2);text-decoration:none">done-for-you ($499+)</a></p>
</section>` : ""}

<footer>
  <a href="/">Home</a> · <a href="/agent-ready">Agent-ready</a> · <a href="/managed">Done for you</a> · <a href="/price-data">Price data</a> · <a href="/integration/openapi">OpenAPI</a> · <a href="/integration/shopify">Shopify</a> · <a href="/integration/stripe">Stripe</a> · <a href="/integration/github">GitHub</a> · <a href="/integration/google">Google</a> · <a href="/integration/slack">Slack</a> · <a href="/integration/notion">Notion</a> · <a href="/integration/linear">Linear</a> · <a href="/directory">Directory</a>
</footer>

</div>
</body>
</html>`;
}
