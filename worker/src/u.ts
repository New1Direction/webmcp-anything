// u.ts — SEO-friendly server-rendered page per cached URL.
//
// Route: /u/<base64url-encoded-source-url>
//
// Why this exists: Google indexes server-rendered HTML, not JS-fetched JSON.
// Every URL in our directory becomes a discoverable page with proper meta
// tags + schema.org markup. People searching "[product name] MCP tools" or
// "[brand] agent API" land here. Pure organic acquisition.

const PROVIDER_BADGE: Record<string, { color: string; label: string }> = {
  shopify: { color: "#4ade80", label: "Shopify" },
  jsonld: { color: "#00e5ff", label: "JSON-LD" },
  openapi: { color: "#f0abfc", label: "OpenAPI" },
  llm: { color: "#fbbf24", label: "LLM-extracted" },
};

export function base64urlEncode(s: string): string {
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function base64urlDecode(s: string): string {
  // Restore padding
  const pad = s.length % 4 === 0 ? 0 : 4 - (s.length % 4);
  const padded = s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat(pad);
  return atob(padded);
}

interface CacheEntry {
  payload: {
    adapter: string;
    tools: any[];
    product?: { title?: string; name?: string; description?: string; version?: string };
    variants?: any[];
  };
  ts: number;
}

export function notFoundHtml(sourceUrl: string, origin: string): string {
  const safeUrl = escapeHtml(sourceUrl);
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8" />
<title>Not yet cached · wmcp.sh</title>
<meta name="robots" content="noindex" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>${baseCss()}</style>
</head><body><div class="wrap">
<a class="back" href="/directory">← Directory</a>
<h1 style="margin-top:14px">Not in the directory yet</h1>
<p class="muted">No one's asked wmcp.sh for tools at <code>${safeUrl}</code> yet, so we haven't extracted a schema. Hit the live API to populate it:</p>
<pre style="margin-top:14px"><code>curl '${origin}/api/v1/tools?url=${encodeURIComponent(sourceUrl)}'</code></pre>
<p class="muted" style="margin-top:14px">Then refresh this page.</p>
</div></body></html>`;
}

export function uHtml(sourceUrl: string, entry: CacheEntry, origin: string): string {
  const p = entry.payload;
  const adapter = p.adapter || "other";
  const badge = PROVIDER_BADGE[adapter] || { color: "#8a8aa8", label: adapter };
  const title = p.product?.title || p.product?.name || hostnameOf(sourceUrl);
  const description = p.product?.description || `${p.tools?.length || 0} agent-callable tools for ${title}.`;
  const ago = relTime(entry.ts);
  const toolCount = p.tools?.length || 0;
  const variantCount = p.variants?.length || 0;

  const pageTitle = `${title} — agent tools | wmcp.sh`;
  const pageDesc = (description || "").slice(0, 160);

  // Schema.org markup so Google parses it as a product page (when applicable)
  const ldJson: any = {
    "@context": "https://schema.org",
    "@type": adapter === "openapi" ? "WebAPI" : "Product",
    name: title,
    description: pageDesc,
    url: sourceUrl,
  };
  if (p.product?.version) ldJson.version = p.product.version;

  const safeTools = (p.tools || []).slice(0, 50);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(pageTitle)}</title>
<meta name="description" content="${escapeHtml(pageDesc)}" />
<link rel="canonical" href="${origin}/u/${base64urlEncode(sourceUrl)}" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta property="og:title" content="${escapeHtml(title)} — agent tools" />
<meta property="og:description" content="${escapeHtml(pageDesc)}" />
<meta property="og:url" content="${origin}/u/${base64urlEncode(sourceUrl)}" />
<meta property="og:image" content="${origin}/og.svg" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(title)} — agent tools" />
<meta name="twitter:description" content="${escapeHtml(pageDesc)}" />
<meta name="twitter:image" content="${origin}/og.svg" />
<script type="application/ld+json">${JSON.stringify(ldJson)}</script>
<style>${baseCss()}</style>
</head>
<body>
<div class="wrap">
<a class="back" href="/directory">← Directory</a>

<header style="margin-top:14px">
  <span class="badge" style="background:${badge.color}22;color:${badge.color};border:1px solid ${badge.color}55">${badge.label}</span>
  <h1>${escapeHtml(title)}</h1>
  <p class="muted">${escapeHtml(pageDesc)}</p>
  <p class="hint">
    <span style="color:var(--accent2)">${toolCount}</span> agent-callable tool${toolCount === 1 ? "" : "s"}
    ${variantCount ? ` · <span style="color:var(--accent2)">${variantCount}</span> variants` : ""}
    · indexed ${escapeHtml(ago)}
    · source: <a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener">${escapeHtml(hostnameOf(sourceUrl))}</a>
  </p>
</header>

<section>
  <h2>Use it</h2>
  <pre><code><span class="k">curl</span> <span class="s">'${origin}/api/v1/tools?url=${escapeHtml(encodeURIComponent(sourceUrl))}'</span></code></pre>
  <pre><code><span class="c">// JavaScript</span>
<span class="k">const</span> { tools } = <span class="k">await</span> (<span class="k">await</span> fetch(
  <span class="s">'${origin}/api/v1/tools?url=${escapeHtml(encodeURIComponent(sourceUrl))}'</span>
)).json();
<span class="c">// hand the tools to Claude / LangChain / OpenAI / any MCP-aware agent</span></code></pre>
</section>

<section>
  <h2>Available tools</h2>
  <div class="tools">
    ${safeTools.map((t: any) => `
      <div class="tool">
        <div class="tool-h">
          <code class="tool-name">${escapeHtml(t.name || "")}</code>
          ${t.action ? '<span class="tool-tag live">live</span>' : '<span class="tool-tag static">static</span>'}
        </div>
        <div class="tool-desc">${escapeHtml((t.description || "").slice(0, 240))}</div>
        ${t.result !== undefined ? `<div class="tool-result"><span class="muted">result:</span> <code>${escapeHtml(String(t.result).slice(0, 120))}</code></div>` : ""}
      </div>`).join("")}
  </div>
  ${p.tools && p.tools.length > 50 ? `<p class="muted" style="text-align:center;margin-top:14px">+ ${p.tools.length - 50} more — hit the API to see them all.</p>` : ""}
</section>

<footer>
  <a href="/">wmcp.sh</a> · <a href="/directory">Directory</a> · <a href="/dashboard">Get a key</a> · <a href="https://github.com/New1Direction/webmcp-anything">GitHub</a>
</footer>
</div>
</body>
</html>`;
}

function baseCss(): string {
  return `:root {
    --bg: #07070d; --card: #16161f; --bg2: #11111c; --border: #26263a;
    --text: #ececf5; --muted: #8a8aa8; --dim: #6a6a88;
    --accent: #7c5cff; --accent2: #00e5ff; --green: #4ade80; --pink: #f0abfc;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh; color: var(--text); background: var(--bg);
    font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
    line-height: 1.6;
    background-image: radial-gradient(ellipse 800px 500px at 20% 0%, rgba(124,92,255,.12), transparent);
  }
  .wrap { max-width: 880px; margin: 0 auto; padding: 40px 24px; }
  a.back { color: var(--muted); text-decoration: none; font-size: .85rem; }
  a.back:hover { color: var(--text); }
  h1 {
    font-size: clamp(1.7rem, 4vw, 2.4rem); margin: 12px 0 8px; font-weight: 800; letter-spacing: -.02em;
    background: linear-gradient(135deg, #fff 30%, var(--accent2) 100%);
    -webkit-background-clip: text; background-clip: text; color: transparent;
  }
  h2 { font-size: 1.2rem; margin: 32px 0 12px; }
  .muted { color: var(--muted); }
  .hint { color: var(--dim); font-size: .85rem; }
  .badge { display: inline-block; padding: 4px 10px; border-radius: 999px;
    font-size: .7rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
  pre {
    background: var(--card); border: 1px solid var(--border); border-radius: 12px;
    padding: 16px; overflow-x: auto; font-size: .82rem; color: var(--green);
    font-family: "SF Mono", Menlo, monospace; line-height: 1.5; margin: 12px 0;
  }
  pre .k { color: var(--accent2); } pre .s { color: var(--pink); } pre .c { color: var(--dim); }
  code { font-family: "SF Mono", Menlo, monospace; }
  .tools { display: grid; gap: 8px; }
  .tool { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px; }
  .tool:hover { border-color: var(--accent); }
  .tool-h { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
  .tool-name { color: var(--accent2); font-size: .92rem; font-weight: 700; }
  .tool-tag { font-size: .65rem; font-weight: 700; letter-spacing: .08em;
    text-transform: uppercase; padding: 2px 8px; border-radius: 999px; }
  .tool-tag.live { background: rgba(74,222,128,.18); color: var(--green); }
  .tool-tag.static { background: rgba(138,138,168,.18); color: var(--muted); }
  .tool-desc { color: var(--muted); font-size: .88rem; margin-top: 2px; }
  .tool-result { margin-top: 6px; font-size: .78rem; font-family: "SF Mono", Menlo, monospace; }
  footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid var(--border);
    color: var(--muted); font-size: .82rem; text-align: center; }
  footer a { color: var(--accent2); text-decoration: none; margin: 0 8px; }
  section { margin-top: 24px; }`;
}

function escapeHtml(s: string): string {
  return String(s).replace(/[&<>"]/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"} as any)[c]);
}

function hostnameOf(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
}

function relTime(ts: number): string {
  const s = (Date.now() - ts) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return Math.floor(s / 60) + " min ago";
  if (s < 86400) return Math.floor(s / 3600) + " hr ago";
  return Math.floor(s / 86400) + " days ago";
}

// ---------- sitemap + robots ----------

export function robotsTxt(origin: string): string {
  return `User-agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard
Disallow: /connect/
Sitemap: ${origin}/sitemap.xml
`;
}

export async function sitemapXml(env: any, origin: string): Promise<string> {
  // Iterate all seen: entries and emit one URL per cached page.
  // KV.list returns up to 1000 keys per page; we don't paginate beyond that
  // for v0 since we're nowhere near the limit.
  const list = await env.CACHE.list({ prefix: "seen:", limit: 1000 });
  const entries: Array<{ url: string; ts: number }> = list.keys
    .map((k: any) => k.metadata)
    .filter((m: any) => m && m.url)
    .map((m: any) => ({ url: m.url, ts: m.ts || 0 }));

  const urlsXml = entries
    .map((e) => {
      const lastmod = new Date(e.ts || Date.now()).toISOString().slice(0, 10);
      return `  <url>
    <loc>${origin}/u/${base64urlEncode(e.url)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${origin}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${origin}/directory</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${origin}/integration/openapi</loc>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>${origin}/integration/shopify</loc>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>${origin}/integration/stripe</loc>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>${origin}/integration/github</loc>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>${origin}/integration/google</loc>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>${origin}/integration/slack</loc>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>${origin}/integration/notion</loc>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>${origin}/integration/linear</loc>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>${origin}/dashboard</loc>
    <priority>0.5</priority>
  </url>
${urlsXml}
</urlset>
`;
}
