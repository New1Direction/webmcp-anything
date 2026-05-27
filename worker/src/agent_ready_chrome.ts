// agent_ready_chrome.ts — shared HTML shell for /agent-ready vertical pages.
//
// Each vertical (shopify, api, docs, saas) supplies its own <head> metadata
// + body content. This module owns the rest (style, nav, footer) so the four
// pages stay visually identical without duplicating ~100 lines of CSS each.

export interface VerticalChromeOpts {
  origin: string;
  pageTitle: string;
  metaDescription: string;
  canonicalPath: string; // e.g. "/agent-ready/shopify"
  ogTitle: string;
  ogDescription: string;
  twitterTitle: string;
  twitterDescription: string;
  articleHeadline: string;
  articleDescription: string;
  faqJsonLd: any; // raw schema.org FAQPage object
  bodyHtml: string; // the inner content (everything between </header> and <footer>)
  heroBadge: string; // small label, e.g. "vertical · shopify"
  heroH1: string;
  heroSubtitle: string;
  heroHint?: string;
}

export function agentReadyVerticalHtml(opts: VerticalChromeOpts): string {
  const canonical = `${opts.origin}${opts.canonicalPath}`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${opts.pageTitle}</title>
<meta name="description" content="${opts.metaDescription}" />
<link rel="canonical" href="${canonical}" />
<meta property="og:title" content="${opts.ogTitle}" />
<meta property="og:description" content="${opts.ogDescription}" />
<meta property="og:url" content="${canonical}" />
<meta property="og:image" content="${opts.origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${opts.twitterTitle}" />
<meta name="twitter:description" content="${opts.twitterDescription}" />
<meta name="twitter:image" content="${opts.origin}/og.png" />
<script type="application/ld+json">
${JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: opts.articleHeadline,
  description: opts.articleDescription,
  author: { "@type": "Organization", name: "WebMCP Anything" },
  publisher: { "@type": "Organization", name: "WebMCP Anything", url: "https://wmcp.sh" },
  datePublished: "2026-05-27",
  dateModified: "2026-05-27",
  mainEntityOfPage: canonical,
})}
</script>
<script type="application/ld+json">
${JSON.stringify(opts.faqJsonLd)}
</script>
${SHARED_STYLE}
</head>
<body>

${SHARED_NAV}

<div class="wrap">

<header class="hero">
  <div class="badge"><span class="dot"></span> ${opts.heroBadge}</div>
  <h1>${opts.heroH1}</h1>
  <p class="sub">${opts.heroSubtitle}</p>
  ${opts.heroHint ? `<p class="hint">${opts.heroHint}</p>` : ""}
</header>

${opts.bodyHtml}

</div>

${SHARED_FOOTER}

</body>
</html>`;
}

// ---------- shared chunks ----------

const SHARED_STYLE = `<style>
  :root { --bg:#07070d;--card:#16161f;--bg2:#11111c;--border:#26263a;--text:#ececf5;--muted:#8a8aa8;--dim:#6a6a88;--accent:#7c5cff;--accent2:#00e5ff;--green:#4ade80;--red:#f87171;--pink:#f0abfc;--gold:#fbbf24; }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin:0;min-height:100vh;color:var(--text);background:var(--bg);font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif;line-height:1.6;background-image:radial-gradient(ellipse 900px 600px at 10% -5%,rgba(124,92,255,.18),transparent 60%),radial-gradient(ellipse 700px 500px at 95% 10%,rgba(0,229,255,.10),transparent 60%); }
  .wrap { max-width: 980px; margin: 0 auto; padding: 0 24px; }
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
  .sub { color: var(--muted); font-size: 1.05rem; max-width: 720px; margin: 0 0 24px; }
  .hint { color: var(--dim); font-size: .85rem; margin-top: 8px; }
  section { padding: 36px 0; }
  .section-label { display:inline-block;font-size:.72rem;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--accent2);margin-bottom:10px; }
  h2 { font-size:clamp(1.45rem,3.2vw,2rem);margin:0 0 12px;font-weight:700;letter-spacing:-.02em; }
  h3 { font-size:1.1rem;margin:0 0 8px;font-weight:700; }
  .section-sub { color: var(--muted); max-width: 700px; margin: 0 0 24px; }
  pre { background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px 18px;overflow-x:auto;font-size:.82rem;color:var(--green);font-family:"SF Mono",Menlo,monospace;line-height:1.5;margin:14px 0; }
  pre .k { color: var(--accent2); } pre .s { color: var(--pink); } pre .c { color: var(--dim); }
  code { font-family: "SF Mono", Menlo, monospace; background: var(--bg2); padding: 1px 6px; border-radius: 4px; font-size: .85em; }
  .reason-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 22px 24px; margin-bottom: 16px; position: relative; }
  .reason-card .num { position: absolute; top: 18px; right: 22px; font-size: 2rem; font-weight: 800; color: var(--border); letter-spacing: -.04em; }
  .reason-card h3 { color: var(--text); padding-right: 50px; }
  .reason-card .verdict { color: var(--red); font-size: .85rem; margin-top: 6px; font-weight: 600; }
  .reason-card .fix { color: var(--muted); margin-top: 10px; font-size: .92rem; }
  .reason-card .fix strong { color: var(--green); }
  .fix-grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-top: 22px; }
  .fix-card { background: linear-gradient(180deg, var(--card), var(--bg2)); border: 1px solid var(--border); border-radius: 14px; padding: 20px; }
  .fix-card h3 { color: var(--accent2); }
  .fix-card .body { color: var(--muted); font-size: .9rem; margin: 8px 0 0; }
  .path-grid { display: grid; gap: 18px; grid-template-columns: 1fr 1fr; margin-top: 22px; }
  @media (max-width: 720px) { .path-grid { grid-template-columns: 1fr; } }
  .path { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 26px; display: flex; flex-direction: column; }
  .path.featured { background: linear-gradient(135deg, var(--card), rgba(124,92,255,.08)); border-color: var(--accent); }
  .path .price { color: var(--accent2); font-weight: 700; font-size: 1rem; margin-bottom: 6px; }
  .path h3 { font-size: 1.3rem; }
  .path .desc { color: var(--muted); font-size: .92rem; margin: 8px 0 16px; flex: 1; }
  .path ul { color: var(--muted); font-size: .9rem; line-height: 1.7; padding-left: 18px; margin: 0 0 18px; }
  .path .cta { display: inline-block; background: var(--accent); color: white; padding: 12px 22px; border-radius: 10px; text-decoration: none; font-weight: 700; text-align: center; font-size: .95rem; }
  .path.featured .cta { background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%); }
  .path.diy .cta { background: var(--bg2); color: var(--text); border: 1px solid var(--border); }
  table { width: 100%; border-collapse: collapse; text-align: left; font-size: .9rem; margin-top: 16px; }
  th, td { padding: 14px 16px; border-bottom: 1px solid var(--border); vertical-align: top; }
  th { background: var(--bg2); font-weight: 700; color: var(--accent2); }
  tr:last-child td { border-bottom: none; }
  td strong { color: var(--text); }
  details { background:var(--card);border:1px solid var(--border);border-radius:12px;padding:18px 20px;margin-bottom:12px; }
  details summary { font-weight: 700; font-size: 1rem; color: var(--text); cursor: pointer; list-style: none; }
  details[open] summary { margin-bottom: 12px; }
  details .answer { color: var(--muted); font-size: .92rem; line-height: 1.65; }
  .checklist { background: linear-gradient(135deg, rgba(74,222,128,.06), rgba(0,229,255,.04)); border: 1px solid rgba(74,222,128,.25); border-radius: 14px; padding: 26px; margin-top: 22px; }
  .checklist h3 { margin-top: 0; color: var(--green); }
  .checklist .row { display: flex; gap: 12px; padding: 8px 0; border-bottom: 1px dashed var(--border); font-size: .92rem; }
  .checklist .row:last-child { border-bottom: none; }
  .checklist .mark { color: var(--green); font-weight: 700; flex-shrink: 0; }
  footer { border-top:1px solid var(--border);margin-top:40px;padding:30px 0;text-align:center;color:var(--muted);font-size:.85rem; }
  footer a { color: var(--accent2); text-decoration: none; margin: 0 8px; }
</style>`;

const SHARED_NAV = `<nav>
  <div class="brand"><a href="/" style="color:inherit;text-decoration:none">wmcp<span>.sh</span></a></div>
  <div class="links">
    <a href="/agent-ready">Agent-ready</a>
    <a href="/managed">Done for you</a>
    <a href="/price-data">Price data</a>
    <a href="/directory">Directory</a>
    <a href="https://github.com/New1Direction/webmcp-anything">GitHub</a>
  </div>
  <a class="cta" href="/dashboard">Dashboard →</a>
</nav>`;

const SHARED_FOOTER = `<footer>
  <a href="/">Home</a> · <a href="/agent-ready">Agent-ready</a> · <a href="/agent-ready/shopify">Shopify</a> · <a href="/agent-ready/api">API</a> · <a href="/agent-ready/docs">Docs</a> · <a href="/agent-ready/saas">SaaS</a> · <a href="/managed">Done for you</a> · <a href="/price-data">Price data</a> · <a href="https://github.com/New1Direction/webmcp-anything">GitHub</a>
</footer>`;
