// /blog (index) + /blog/<slug> (post) — long-form content surface.
//
// Posts live in blog_posts.ts (auto-generated from Gemini-daemon markdown
// drafts). Re-run `node scripts/build_blog_posts.mjs` after the daemon
// emits new ones, then redeploy.

import { BLOG_POSTS, BLOG_SLUGS } from "./blog_posts";
import type { BlogPost } from "./blog_posts";
import { adSlot } from "./ads";

const BRAND_CSS = `
:root { --bg:#07070d;--card:#16161f;--bg2:#11111c;--border:#26263a;--text:#ececf5;--muted:#8a8aa8;--dim:#6a6a88;--accent:#ff9e2c;--accent2:#ffcf7a;--green:#4ade80;--pink:#ffb86b;--gold:#fbbf24; }
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin:0;min-height:100vh;color:var(--text);background:var(--bg);font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif;line-height:1.7;background-image:radial-gradient(ellipse 900px 600px at 10% -5%,rgba(255,158,44,.16),transparent 60%); }
nav { display:flex;justify-content:space-between;align-items:center;padding:22px 24px;max-width:1080px;margin:0 auto; }
nav .brand { font-weight: 800; letter-spacing: -.02em; font-size: 1.05rem; }
nav .brand a { color: inherit; text-decoration: none; }
nav .brand span { color: var(--accent2); }
nav .links { display: flex; gap: 22px; font-size: .9rem; }
nav .links a { color: var(--muted); text-decoration: none; }
nav .links a:hover { color: var(--text); }
nav .cta { background: var(--bg2); border: 1px solid var(--border); padding: 7px 14px; border-radius: 8px; font-size: .85rem; color: var(--text); text-decoration: none; font-weight: 600; }
.wrap { max-width: 760px; margin: 0 auto; padding: 0 24px 60px; }
footer { border-top:1px solid var(--border);margin-top:60px;padding:30px 0;text-align:center;color:var(--muted);font-size:.85rem; }
footer a { color: var(--accent2); text-decoration: none; margin: 0 8px; }
`;

function navHtml(): string {
  return `<nav>
  <div class="brand"><a href="/">wmcp<span>.sh</span></a></div>
  <div class="links">
    <a href="/agent-ready">Agent-ready</a>
    <a href="/managed">Done for you</a>
    <a href="/price-data">Price data</a>
    <a href="/blog">Blog</a>
    <a href="/directory">Directory</a>
  </div>
  <a class="cta" href="/dashboard">Dashboard →</a>
</nav>`;
}

function footerHtml(): string {
  return `<footer>
  <a href="/">Home</a> · <a href="/agent-ready">Agent-ready</a> · <a href="/managed">Done for you</a> · <a href="/blog">Blog</a> · <a href="/directory">Directory</a> · <a href="/directory/submit">Submit</a> · <a href="https://github.com/New1Direction/webmcp-anything">GitHub</a>
</footer>`;
}

function escapeHtml(s: string): string {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" } as any)[c]
  );
}

function escapeJson(s: string): string {
  // Safe inside <script type="application/ld+json"> — escape forward slashes
  // in </script> sequences only.
  return s.replace(/<\/script/gi, "<\\/script");
}

// ---------- /blog (index) ----------

export function blogIndexHtml(origin: string): string {
  const posts = BLOG_SLUGS.map((s) => BLOG_POSTS[s]).filter(Boolean);

  const ldJson = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "wmcp.sh — engineering notes",
    url: `${origin}/blog`,
    description: "Long-form engineering notes from the wmcp.sh team — MCP, agents, edge architecture, OAuth, e-commerce parsing, oracle adapters.",
    blogPost: posts.slice(0, 10).map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${origin}/blog/${p.slug}`,
      datePublished: p.date,
      description: p.description,
    })),
  };

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Engineering notes — wmcp.sh blog</title>
<meta name="description" content="Long-form notes from the wmcp.sh team — MCP, edge architecture, OAuth proxy patterns, e-commerce parsing, oracle adapters, agent commerce." />
<link rel="canonical" href="${origin}/blog" />
<link rel="alternate" type="application/rss+xml" title="wmcp.sh blog RSS" href="${origin}/blog/rss.xml" />
<meta property="og:title" content="wmcp.sh — engineering notes" />
<meta property="og:description" content="Long-form notes on MCP, agents, edge architecture, and shipping fast." />
<meta property="og:url" content="${origin}/blog" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
<script type="application/ld+json">${escapeJson(JSON.stringify(ldJson))}</script>
<style>
  ${BRAND_CSS}
  header.hero { padding: 48px 0 24px; }
  .badge { display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;font-size:.7rem;letter-spacing:.15em;text-transform:uppercase;font-weight:700;background:linear-gradient(90deg,rgba(255,158,44,.18),rgba(255,176,0,.18));border:1px solid rgba(255,158,44,.35);margin-bottom:18px; }
  .dot { width:6px;height:6px;background:var(--accent2);border-radius:50%;box-shadow:0 0 8px var(--accent2); }
  h1 { font-size:clamp(2rem,4.5vw,2.8rem);margin:0 0 14px;background:linear-gradient(135deg,#fff 30%,var(--accent2) 100%);-webkit-background-clip:text;background-clip:text;color:transparent;line-height:1.05;font-weight:800;letter-spacing:-.025em; }
  .sub { color: var(--muted); font-size: 1.05rem; max-width: 620px; margin: 0 0 18px; }
  .post-list { display: grid; gap: 14px; margin-top: 26px; }
  .post-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 20px 24px; transition: border-color .15s; }
  .post-card:hover { border-color: var(--accent); }
  .post-card a.title { display: block; color: var(--text); text-decoration: none; font-weight: 700; font-size: 1.1rem; margin-bottom: 6px; letter-spacing: -.01em; line-height: 1.35; }
  .post-card a.title:hover { color: var(--accent2); }
  .post-card .desc { color: var(--muted); font-size: .92rem; line-height: 1.55; margin: 6px 0 10px; }
  .post-card .meta { font-size: .75rem; color: var(--dim); letter-spacing: .04em; }
  .post-card .meta .q { color: var(--accent2); }
</style>
</head>
<body>

${navHtml()}

<div class="wrap">

<header class="hero">
  <div class="badge"><span class="dot"></span> engineering notes</div>
  <h1>Notes on shipping MCP at the edge.</h1>
  <p class="sub">Long-form pieces from the team building wmcp.sh — architecture decisions, adapter postmortems, OAuth patterns, e-commerce parsing economics, and the occasional rant about why "MCP server for X" doesn't scale.</p>
</header>

<div class="post-list">
${posts
  .map(
    (p) => `<div class="post-card">
  <a class="title" href="/blog/${p.slug}">${escapeHtml(p.title)}</a>
  <div class="desc">${escapeHtml(p.description)}</div>
  <div class="meta">${escapeHtml(p.date)}${p.primary_query ? ` &middot; targets <span class="q">${escapeHtml(p.primary_query)}</span>` : ""}</div>
</div>`
  )
  .join("\n")}
</div>

</div>

${footerHtml()}
</body>
</html>`;
}

// ---------- /blog/<slug> (single post) ----------

export function blogPostHtml(origin: string, post: BlogPost): string {
  const ldJson = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Organization", name: "WebMCP Anything" },
    publisher: {
      "@type": "Organization",
      name: "WebMCP Anything",
      url: "https://wmcp.sh",
      logo: { "@type": "ImageObject", url: `${origin}/og.png` },
    },
    mainEntityOfPage: `${origin}/blog/${post.slug}`,
    image: `${origin}/og.png`,
  };

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(post.title)} — wmcp.sh</title>
<meta name="description" content="${escapeHtml(post.description)}" />
<link rel="canonical" href="${origin}/blog/${post.slug}" />
<meta property="og:title" content="${escapeHtml(post.title)}" />
<meta property="og:description" content="${escapeHtml(post.description)}" />
<meta property="og:url" content="${origin}/blog/${post.slug}" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:type" content="article" />
<meta property="article:published_time" content="${escapeHtml(post.date)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(post.title)}" />
<meta name="twitter:description" content="${escapeHtml(post.description)}" />
<script type="application/ld+json">${escapeJson(JSON.stringify(ldJson))}</script>
<style>
  ${BRAND_CSS}
  article { padding: 30px 0 20px; }
  .back { color: var(--muted); text-decoration: none; font-size: .85rem; }
  .back:hover { color: var(--text); }
  .meta { color: var(--dim); font-size: .82rem; letter-spacing: .04em; margin: 12px 0 18px; }
  .meta .q { color: var(--accent2); }
  h1.headline { font-size:clamp(1.8rem,4.2vw,2.6rem);margin:14px 0 8px;font-weight:800;letter-spacing:-.025em;line-height:1.15;background:linear-gradient(135deg,#fff 25%,var(--accent2) 110%);-webkit-background-clip:text;background-clip:text;color:transparent; }
  .subtitle { color: var(--muted); font-size: 1.06rem; margin: 0 0 18px; line-height: 1.55; }
  article h2 { font-size: 1.45rem; margin: 36px 0 12px; font-weight: 700; letter-spacing: -.01em; color: var(--text); }
  article h3 { font-size: 1.15rem; margin: 26px 0 8px; font-weight: 700; color: var(--text); }
  article p { color: #d0d0e0; font-size: 1rem; margin: 14px 0; }
  article a { color: var(--accent2); text-decoration: none; }
  article a:hover { text-decoration: underline; }
  article ul, article ol { color: #d0d0e0; padding-left: 22px; margin: 14px 0; }
  article li { margin: 6px 0; }
  article strong { color: var(--text); }
  article code { font-family: "SF Mono", Menlo, monospace; background: var(--bg2); padding: 2px 6px; border-radius: 4px; font-size: .85em; color: var(--pink); }
  article pre { background: #0a0a12; border: 1px solid var(--border); border-radius: 10px; padding: 16px 18px; overflow-x: auto; margin: 16px 0; }
  article pre code { background: transparent; padding: 0; color: var(--green); font-size: .82rem; line-height: 1.55; }
  article blockquote { border-left: 3px solid var(--accent); padding: 4px 16px; margin: 18px 0; color: var(--muted); background: var(--card); border-radius: 0 8px 8px 0; }
  article hr { border: none; border-top: 1px solid var(--border); margin: 30px 0; }
  article table { width: 100%; border-collapse: collapse; margin: 18px 0; font-size: .92rem; }
  article th, article td { padding: 10px 14px; border-bottom: 1px solid var(--border); text-align: left; }
  article th { color: var(--accent2); background: var(--bg2); font-weight: 700; }
  .post-cta { margin: 36px 0 0; background: linear-gradient(135deg, var(--card), rgba(255,158,44,0.08)); border: 1px solid rgba(255,158,44,0.35); border-radius: 14px; padding: 22px 24px; display: flex; gap: 18px; align-items: center; flex-wrap: wrap; }
  .post-cta .l { flex: 1; min-width: 220px; }
  .post-cta .l strong { color: var(--text); display: block; margin-bottom: 4px; font-size: 1rem; }
  .post-cta .l span { color: var(--muted); font-size: .9rem; }
  .post-cta a { display: inline-block; padding: 10px 18px; border-radius: 9px; text-decoration: none; font-weight: 700; font-size: .9rem; }
  .post-cta a.primary { background: linear-gradient(135deg, var(--accent), var(--accent2)); color: #0c0c14; }
  .post-cta a.ghost { background: #11111c; border: 1px solid var(--border); color: var(--text); }
</style>
</head>
<body>

${navHtml()}

<div class="wrap">

<article>
  <a class="back" href="/blog">← All posts</a>

  <h1 class="headline">${escapeHtml(post.title)}</h1>
  ${post.subtitle ? `<p class="subtitle">${escapeHtml(post.subtitle)}</p>` : ""}
  <div class="meta">${escapeHtml(post.date)}${post.primary_query ? ` &middot; targets <span class="q">${escapeHtml(post.primary_query)}</span>` : ""}</div>

  ${post.html}

  ${adSlot()}

  <div class="post-cta">
    <div class="l">
      <strong>Want this implemented on your stack?</strong>
      <span>Custom adapter + hosted MCP + verified directory listing. From $499 one-time setup.</span>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <a class="primary" href="/managed">See /managed →</a>
      <a class="ghost" href="/directory/submit">Submit (free)</a>
    </div>
  </div>
</article>

</div>

${footerHtml()}
</body>
</html>`;
}

// ---------- RSS ----------

export function blogRssXml(origin: string): string {
  const posts = BLOG_SLUGS.map((s) => BLOG_POSTS[s]).filter(Boolean).slice(0, 30);
  const items = posts
    .map(
      (p) => `  <item>
    <title>${escapeHtml(p.title)}</title>
    <link>${origin}/blog/${p.slug}</link>
    <guid>${origin}/blog/${p.slug}</guid>
    <pubDate>${new Date(p.date).toUTCString()}</pubDate>
    <description>${escapeHtml(p.description)}</description>
  </item>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>wmcp.sh — engineering notes</title>
  <link>${origin}/blog</link>
  <description>Long-form notes from the wmcp.sh team — MCP, agents, edge architecture.</description>
  <language>en-us</language>
${items}
</channel>
</rss>`;
}
