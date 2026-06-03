// u.ts — SEO-friendly server-rendered page per cached URL.
//
// Route: /u/<base64url-encoded-source-url>
//
// Why this exists: Google indexes server-rendered HTML, not JS-fetched JSON.
// Every URL in our directory becomes a discoverable page with proper meta
// tags + schema.org markup. People searching "[product name] MCP tools" or
// "[brand] agent API" land here. Pure organic acquisition.

// Static import — blog post map is part of the worker bundle. Used by
// /llms.txt, /llms-full.txt, and sitemapXml below.
import { BLOG_POSTS, BLOG_SLUGS } from "./blog_posts";
import { DROP_SLUGS, LOCALIZABLE_SLUGS, LOCALIZED_LANGS } from "./drops_seo";
import { ARTICLE_SLUGS } from "./articles";

const PROVIDER_BADGE: Record<string, { color: string; label: string }> = {
  shopify: { color: "#4ade80", label: "Shopify" },
  jsonld: { color: "#ffcf7a", label: "JSON-LD" },
  openapi: { color: "#ffb86b", label: "OpenAPI" },
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

<section style="margin-top:36px;background:linear-gradient(135deg,#16161f,rgba(255,158,44,0.08));border:1px solid #26263a;border-radius:16px;padding:22px 24px">
  <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;justify-content:space-between">
    <div style="flex:1;min-width:240px">
      <h2 style="margin:0 0 6px;font-size:1.05rem;color:var(--text)">Own this site?</h2>
      <p class="muted" style="margin:0;font-size:.9rem">Claim the listing — get a <strong style="color:var(--accent2)">verified badge</strong>, featured placement, and an MCP server you control. Or just submit a new URL for free.</p>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <a href="/directory/claim" style="display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#ff9e2c,#ffcf7a);color:#0c0c14;padding:9px 16px;border-radius:8px;text-decoration:none;font-weight:700;font-size:.88rem">Claim this listing →</a>
      <a href="/directory/submit" style="display:inline-flex;align-items:center;gap:6px;background:#11111c;border:1px solid #26263a;color:var(--text);padding:9px 16px;border-radius:8px;text-decoration:none;font-weight:600;font-size:.88rem">Submit (free)</a>
    </div>
  </div>
</section>

<footer>
  <a href="/">wmcp.sh</a> · <a href="/directory">Directory</a> · <a href="/directory/submit">Submit</a> · <a href="/managed">Get verified</a> · <a href="/dashboard">Get a key</a> · <a href="https://github.com/New1Direction/webmcp-anything">GitHub</a>
</footer>
</div>
</body>
</html>`;
}

function baseCss(): string {
  return `:root {
    --bg: #07070d; --card: #16161f; --bg2: #11111c; --border: #26263a;
    --text: #ececf5; --muted: #8a8aa8; --dim: #6a6a88;
    --accent: #ff9e2c; --accent2: #ffcf7a; --green: #4ade80; --pink: #ffb86b;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh; color: var(--text); background: var(--bg);
    font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
    line-height: 1.6;
    background-image: radial-gradient(ellipse 800px 500px at 20% 0%, rgba(255,158,44,.12), transparent);
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
  return `# wmcp.sh — robots policy
#
# We're explicit about which AI crawlers are welcome and which aren't.
# AI agents indexing our content is a feature, not abuse — agent-ready
# is literally the product. Generic SEO scrapers don't get the same
# pass: we already publish a sitemap + llms.txt, so re-crawling the
# whole site every hour is just bandwidth waste.

# --- AI crawlers (explicit allow) ---

User-agent: Claude-Web
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: GoogleOther
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

User-agent: cohere-ai
Allow: /

User-agent: Cohere-AI
Allow: /

User-agent: Bytespider
Allow: /

User-agent: Diffbot
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Meta-ExternalAgent
Allow: /

User-agent: FacebookBot
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: YouBot
Allow: /

User-agent: Bingbot
Allow: /

# --- Aggressive SEO crawlers (rate-limit by disallowing) ---

User-agent: AhrefsBot
Crawl-delay: 60

User-agent: SemrushBot
Crawl-delay: 60

User-agent: MJ12bot
Crawl-delay: 60

User-agent: DotBot
Crawl-delay: 60

User-agent: BLEXBot
Disallow: /

# --- Default ---

User-agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard
# Block the auth-gated proxy + oracle endpoints, but KEEP the public
# content under /mcp indexable (these Allow rules win by longest-match):
Disallow: /mcp/
Allow: /mcp/grade
Allow: /mcp/leaderboard
Allow: /connect

Sitemap: ${origin}/sitemap.xml

# LLM ingestion files (llmstxt.org convention)
# /llms.txt       — curated navigation index for AI agents
# /llms-full.txt  — full reading material (blog + cornerstones) as one doc
`;
}

// llmsTxt — agent-readable index at /llms.txt.
//
// Convention from llmstxt.org: a curated map of the site's priority
// resources for AI agents. Same role as robots.txt, but pointed at
// what's important, not just what's allowed.
//
// We're the agent-readiness company — eating our own dog food is
// table stakes.
export function llmsTxt(origin: string): string {
  // Build blog entries dynamically from the auto-generated post map so
  // every new draft appears without a manual edit. Imported lazily inside
  // the function to keep cold-start cost low for routes that don't need it.
  // (Top-level import is fine here since this module is already loaded
  // on every request; we keep require()-style awaitless via static import
  // at the file's top.) Implemented inline below.
  const blogCount = BLOG_SLUGS.length;
  const blogLines = BLOG_SLUGS.map((slug) => {
    const p = BLOG_POSTS[slug];
    return `- [${p.title}](${origin}/blog/${slug}): ${p.description}`;
  }).join("\n");

  return `# wmcp.sh

> wmcp.sh turns any URL into agent-callable MCP tools. Drop a URL in,
> get a JSON tool list (Claude / OpenAI / MCP-compatible) describing
> the page's actions (read price, add to cart, call API, etc.). Free
> public tier + paid Pro + managed agent-readiness consulting.
>
> This file follows the llmstxt.org convention. The companion file
> [/llms-full.txt](${origin}/llms-full.txt) contains the full reading
> material (every blog post + cornerstone landing page) as one document
> for ingestion into an LLM context window.

## Start here

- [Homepage](${origin}/): one-paragraph pitch + live demo
- [The MCP hub](${origin}/connect): connect (OAuth-vaulted), grade, and build MCP servers in one place
- [MCP Trust Leaderboard](${origin}/mcp/leaderboard): independent A–F trust grades for MCP servers, continuously watched for drift
- [WebMCP](${origin}/webmcp): one line makes any site agent-ready via navigator.modelContext (dual-emits as MCP)
- [Agent-ready (cornerstone)](${origin}/agent-ready): canonical guide on making your site work with AI agents
- [Engineering blog](${origin}/blog): ${blogCount} long-form posts on MCP, edge architecture, OAuth, e-commerce parsing, oracle adapters
- [Directory](${origin}/directory): every URL the community has turned into MCP tools — ${blogCount > 0 ? "verified badges + featured placement available" : "open submission"}
- [Submit your site](${origin}/directory/submit): free listing form for site owners
- [Price-data adapters](${origin}/price-data): 5 oracle / price-data sources (CoinGecko, Pyth, Chainlink, DefiLlama, DexScreener)

## QuickCatch — Pokémon & TCG drop catcher (consumer app)

QuickCatch is wmcp.sh's consumer Chrome extension built on the same engine: it
watches a Pokémon/TCG product page in your own browser and adds the item to your
cart the moment it restocks, even on sites that block server-side bots. Free
install, no proxies, no server.

- [All drop & restock guides](${origin}/drops): index of 120+ English guides — TCG sets, every major store, QuickCatch vs sneaker bots, and sniping how-tos
- [Pokémon restock tracker](${origin}/drops/pokemon-restock-tracker): the cornerstone explainer
- [Pokémon restock bot alternative](${origin}/drops/pokemon-restock-bot-alternative): why a browser catcher beats a server bot
- [QuickCatch vs sneaker bots](${origin}/drops/quickcatch-vs-sneaker-bots): comparison vs Valor/Cybersole/Kodai-style AIO bots
- [How to snipe a Pokémon drop](${origin}/drops/how-to-snipe-pokemon-drops): step-by-step
- [Free Pokémon tools](${origin}/tools): incl. the [retail vs resale calculator](${origin}/tools/pokemon-resale-calculator)
- [Pokémon buying guides](${origin}/guides): in-depth articles on what's worth buying (booster boxes, sealed vs singles, spotting fakes, what holds value)
- Localized in 11 languages at \`${origin}/drops/<lang>/<slug>\` — es, fr, de, pt, it, nl, pl, ja, ko, zh, zh-Hant (with hreflang; all URLs in /sitemap.xml)
- Chrome Web Store: https://chromewebstore.google.com/detail/quickcatch/dgbaaeengmgmkefpocdckkiahilbfdlk

## Vertical-specific agent-readiness guides

- [Shopify](${origin}/agent-ready/shopify): variants, add-to-cart, multi-locale, shopper-side MCP
- [API / SaaS APIs](${origin}/agent-ready/api): OpenAPI publishing, tagging, MCP-spec OAuth, agent-friendly rate limits
- [Documentation sites](${origin}/agent-ready/docs): llms.txt template, code-example metadata, docs MCP servers
- [SaaS founders](${origin}/agent-ready/saas): be recommendable, signupable, usable

## Use-case narratives

- [Agent commerce](${origin}/use-case/agent-commerce): autonomous shopping agents end-to-end
- [DeFi yield watcher](${origin}/use-case/yield-watcher): DefiLlama + CoinGecko + Pyth + Chainlink + DexScreener as MCP

## Integration pages (wmcp.sh ↔ third-party services)

- [OpenAPI → MCP](${origin}/integration/openapi): canonical method for any API-backed site
- [Shopify](${origin}/integration/shopify): shopper-side MCP for 4M+ stores
- [Stripe](${origin}/integration/stripe): full Stripe API as MCP via OpenAPI
- [GitHub](${origin}/integration/github): repos, issues, gists
- [Google Workspace](${origin}/integration/google): Gmail, Calendar, Drive, Sheets, Docs
- [Notion](${origin}/integration/notion): pages and databases
- [Linear](${origin}/integration/linear): issues, projects, comments
- [Slack](${origin}/integration/slack): post, react, manage channels
- [Airtable](${origin}/integration/airtable): bases, tables, records
- [Discord](${origin}/integration/discord): channels, messages, bot tokens (vault-stored)
- [OpenAI](${origin}/integration/openai): chat completions through MCP for multi-model orchestration
- [Anthropic](${origin}/integration/anthropic): Messages API as MCP (independent integration; not affiliated with Anthropic)

## Competitor / alternative comparisons

- [vs Composio](${origin}/vs/composio) · [Composio alternative](${origin}/alternatives/composio)
- [vs Pipedream](${origin}/vs/pipedream) · [Pipedream alternative](${origin}/alternatives/pipedream)
- [vs Zapier](${origin}/vs/zapier)
- [vs Make.com](${origin}/vs/make-com)
- [vs n8n](${origin}/vs/n8n)
- [vs Smithery](${origin}/vs/smithery)

## Engineering blog (${blogCount} posts)

${blogLines}

## API reference

- [GET /api/v1/tools?url=...](${origin}/api/v1/tools?url=https://www.allbirds.com/products/mens-wool-runners): live example
- [Full API docs](${origin}/integration/openapi): all endpoints + auth + plan limits
- [Sitemap](${origin}/sitemap.xml): every public URL on wmcp.sh
- [Blog RSS](${origin}/blog/rss.xml): subscribe to new posts
- [GitHub repo](https://github.com/New1Direction/webmcp-anything): adapters + worker source

## Paid services + verified listings

- [Managed agent-readiness](${origin}/managed): Starter $499 one-time / Managed Retainer $999/mo / Enterprise $4,999+/mo white-label MCP
- [Verified directory badge](${origin}/directory/submit): comes with /managed — embeddable SVG at /badge/&lt;slug&gt;.svg

## What NOT to use

- Anything under \`/dashboard\` — user-specific, requires auth
- Anything under \`/api/v1/providers/*/start\` — OAuth flow endpoints
- Anything under \`/mcp/*\` — proxy endpoints, require valid wmcp.sh API key
- \`/connect/*\` — interactive OAuth pages
- \`/api/v1/admin/*\` — admin-token gated; do not crawl

## Conventions

- All public pages ship JSON-LD (Article + BlogPosting + FAQPage where applicable) — agents reading the page get structured metadata
- Tool listings returned from \`/api/v1/tools\` follow the Claude tool_use / OpenAI function_call shape interchangeably
- Caching: page HTML 15 min CDN, tool extractions 60s–24h depending on source volatility
- Long-form content (the blog) is stable and safe to ingest — re-fetch monthly
`;
}

// llmsFullTxt — full reading material companion to /llms.txt.
//
// Concatenates every blog post + cornerstone landing-page summary as one
// continuous markdown document. Designed to be slurped into an LLM context
// window in a single fetch by tools like ChatGPT, Perplexity, or Claude
// with web search. See https://llmstxt.org/#format for the convention.
export function llmsFullTxt(origin: string): string {
  // Strip HTML tags to recover the original markdown-ish prose. We can't
  // fully invert marked.parse, but for ingestion purposes plain text is
  // what LLMs want — fluffy tags hurt the signal-to-noise ratio.
  const stripTags = (html: string) =>
    html
      .replace(/<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/g, "\n```\n$1\n```\n")
      .replace(/<code>([^<]+)<\/code>/g, "`$1`")
      .replace(/<strong>([^<]+)<\/strong>/g, "**$1**")
      .replace(/<em>([^<]+)<\/em>/g, "*$1*")
      .replace(/<h2[^>]*>([^<]+)<\/h2>/g, "\n\n## $1\n")
      .replace(/<h3[^>]*>([^<]+)<\/h3>/g, "\n\n### $1\n")
      .replace(/<li>([\s\S]*?)<\/li>/g, "- $1")
      .replace(/<\/?(p|ul|ol|table|thead|tbody|tr|th|td|hr|br|blockquote)[^>]*>/g, "\n")
      .replace(/<a [^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g, "$2 ($1)")
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

  const header = `# wmcp.sh — full reading material

> Generated from the canonical content at ${origin}. This file concatenates
> the long-form engineering blog plus the cornerstone agent-readiness
> guides into one document suitable for slurping into an LLM context
> window. For the navigation index, see ${origin}/llms.txt.
>
> Last refreshed at request time. Cached for 15 minutes at the edge.

---

## About wmcp.sh

wmcp.sh turns any URL into agent-callable MCP (Model Context Protocol)
tools. Drop a URL in, get a JSON tool list (Claude tool_use / OpenAI
function_call / MCP-compatible) describing the page's actions: read
price, add to cart, call API, fetch oracle data, etc.

Free public tier with rate limits + paid Pro plans + managed
agent-readiness consulting ($499–$4,999+). The directory at
${origin}/directory has every URL the community has turned into MCP
tools, with verified badges available via ${origin}/managed.

---
`;

  const blogBody = BLOG_SLUGS.map((slug) => {
    const p = BLOG_POSTS[slug];
    if (!p) return "";
    return `## [${p.title}](${origin}/blog/${slug})

*${p.date}${p.primary_query ? ` · targets: ${p.primary_query}` : ""}*

${p.subtitle ? "**" + p.subtitle + "**\n\n" : ""}${stripTags(p.html)}

---
`;
  }).join("\n");

  return header + "\n# Engineering blog (" + BLOG_SLUGS.length + " posts)\n\n" + blogBody;
}

export async function sitemapXml(env: any, origin: string): Promise<string> {
  // Iterate all seen: entries and emit one URL per cached page.
  // KV.list returns up to 1000 keys per page; we don't paginate beyond that
  // for v0 since we're nowhere near the limit.
  // Paginate ALL seen: entries (one cached /u page each) — not just the first 1000.
  const seenKeys: any[] = [];
  {
    let cursor: string | undefined, pages = 0;
    do {
      const r: any = await env.CACHE.list({ prefix: "seen:", limit: 1000, cursor });
      seenKeys.push(...r.keys);
      cursor = r.list_complete ? undefined : r.cursor; pages++;
    } while (cursor && pages < 8);
  }
  const entries: Array<{ url: string; ts: number }> = seenKeys
    .map((k: any) => k.metadata)
    .filter((m: any) => m && m.url)
    .map((m: any) => ({ url: m.url, ts: m.ts || 0 }));

  // Every graded MCP server is a real, unique trust-report page → index them all.
  const gradeHosts: string[] = [];
  {
    let cursor: string | undefined, pages = 0;
    do {
      const r: any = await env.CACHE.list({ prefix: "grade:", limit: 1000, cursor });
      for (const k of r.keys) gradeHosts.push(k.name.slice("grade:".length));
      cursor = r.list_complete ? undefined : r.cursor; pages++;
    } while (cursor && pages < 8);
  }
  const gradeUrlsXml = gradeHosts.map((h) => `  <url>
    <loc>${origin}/mcp/grade/${encodeURIComponent(h)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join("\n");

  // Blog posts (auto-generated; 24 at time of writing).
  const blogUrlsXml = BLOG_SLUGS.map((slug) => {
    const p = BLOG_POSTS[slug];
    const lastmod = p?.date || new Date().toISOString().slice(0, 10);
    return `  <url>
    <loc>${origin}/blog/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.75</priority>
  </url>`;
  }).join("\n");

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
    <loc>${origin}/directory/submit</loc>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>${origin}/blog</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${origin}/agent-ready</loc>
    <changefreq>weekly</changefreq>
    <priority>0.95</priority>
  </url>
  <url>
    <loc>${origin}/agent-ready/fix</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${origin}/managed</loc>
    <changefreq>weekly</changefreq>
    <priority>0.95</priority>
  </url>
  <url>
    <loc>${origin}/connect</loc>
    <changefreq>weekly</changefreq>
    <priority>0.95</priority>
  </url>
  <url>
    <loc>${origin}/mcp/grade</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${origin}/mcp/leaderboard</loc>
    <changefreq>daily</changefreq>
    <priority>0.95</priority>
  </url>
  <url>
    <loc>${origin}/webmcp</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${origin}/agent-ready/shopify</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${origin}/agent-ready/api</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${origin}/agent-ready/docs</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${origin}/agent-ready/saas</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${origin}/vs/composio</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${origin}/vs/pipedream</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${origin}/vs/zapier</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${origin}/vs/make-com</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${origin}/vs/n8n</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${origin}/vs/smithery</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${origin}/alternatives/composio</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${origin}/alternatives/pipedream</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${origin}/integration/airtable</loc>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>${origin}/integration/anthropic</loc>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>${origin}/integration/discord</loc>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>${origin}/integration/openai</loc>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>${origin}/use-case/agent-commerce</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${origin}/use-case/yield-watcher</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <!-- 30-page SEO drop -->
  <url><loc>${origin}/integration/nextjs</loc><changefreq>weekly</changefreq><priority>0.85</priority></url>
  <url><loc>${origin}/integration/astro</loc><changefreq>weekly</changefreq><priority>0.85</priority></url>
  <url><loc>${origin}/integration/svelte</loc><changefreq>weekly</changefreq><priority>0.85</priority></url>
  <url><loc>${origin}/integration/remix</loc><changefreq>weekly</changefreq><priority>0.85</priority></url>
  <url><loc>${origin}/integration/django</loc><changefreq>weekly</changefreq><priority>0.85</priority></url>
  <url><loc>${origin}/integration/rails</loc><changefreq>weekly</changefreq><priority>0.85</priority></url>
  <url><loc>${origin}/integration/fastapi</loc><changefreq>weekly</changefreq><priority>0.85</priority></url>
  <url><loc>${origin}/integration/express</loc><changefreq>weekly</changefreq><priority>0.85</priority></url>
  <url><loc>${origin}/use-case/customer-support</loc><changefreq>weekly</changefreq><priority>0.85</priority></url>
  <url><loc>${origin}/use-case/research-agent</loc><changefreq>weekly</changefreq><priority>0.85</priority></url>
  <url><loc>${origin}/use-case/sales-assistant</loc><changefreq>weekly</changefreq><priority>0.85</priority></url>
  <url><loc>${origin}/use-case/code-review-bot</loc><changefreq>weekly</changefreq><priority>0.85</priority></url>
  <url><loc>${origin}/use-case/data-pipeline</loc><changefreq>weekly</changefreq><priority>0.85</priority></url>
  <url><loc>${origin}/use-case/content-moderation</loc><changefreq>weekly</changefreq><priority>0.85</priority></url>
  <url><loc>${origin}/use-case/personal-assistant</loc><changefreq>weekly</changefreq><priority>0.85</priority></url>
  <url><loc>${origin}/mcp-server/postgres</loc><changefreq>weekly</changefreq><priority>0.85</priority></url>
  <url><loc>${origin}/mcp-server/redis</loc><changefreq>weekly</changefreq><priority>0.85</priority></url>
  <url><loc>${origin}/mcp-server/elasticsearch</loc><changefreq>weekly</changefreq><priority>0.85</priority></url>
  <url><loc>${origin}/mcp-server/snowflake</loc><changefreq>weekly</changefreq><priority>0.85</priority></url>
  <url><loc>${origin}/mcp-server/sentry</loc><changefreq>weekly</changefreq><priority>0.85</priority></url>
  <url><loc>${origin}/mcp-server/datadog</loc><changefreq>weekly</changefreq><priority>0.85</priority></url>
  <url><loc>${origin}/mcp-server/cloudflare</loc><changefreq>weekly</changefreq><priority>0.85</priority></url>
  <url><loc>${origin}/mcp-server/vercel</loc><changefreq>weekly</changefreq><priority>0.85</priority></url>
  <url><loc>${origin}/vs/langchain-tools</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>${origin}/vs/arcade-ai</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>${origin}/vs/mcp-toolkit</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>${origin}/vs/anthropic-skills</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>${origin}/roundup/mcp-servers-2026</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>${origin}/roundup/agent-frameworks</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>${origin}/roundup/oauth-providers-mcp</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <!-- 25-page round-2 SEO drop -->
  <url><loc>${origin}/for/healthcare</loc><changefreq>weekly</changefreq><priority>0.85</priority></url>
  <url><loc>${origin}/for/fintech</loc><changefreq>weekly</changefreq><priority>0.85</priority></url>
  <url><loc>${origin}/for/legal</loc><changefreq>weekly</changefreq><priority>0.85</priority></url>
  <url><loc>${origin}/for/real-estate</loc><changefreq>weekly</changefreq><priority>0.85</priority></url>
  <url><loc>${origin}/for/media</loc><changefreq>weekly</changefreq><priority>0.85</priority></url>
  <url><loc>${origin}/for/marketing</loc><changefreq>weekly</changefreq><priority>0.85</priority></url>
  <url><loc>${origin}/for/hr</loc><changefreq>weekly</changefreq><priority>0.85</priority></url>
  <url><loc>${origin}/how-to/install-claude-desktop-mcp</loc><changefreq>monthly</changefreq><priority>0.85</priority></url>
  <url><loc>${origin}/how-to/expose-shopify-as-mcp</loc><changefreq>monthly</changefreq><priority>0.85</priority></url>
  <url><loc>${origin}/how-to/build-stripe-mcp-agent</loc><changefreq>monthly</changefreq><priority>0.85</priority></url>
  <url><loc>${origin}/how-to/secure-mcp-oauth</loc><changefreq>monthly</changefreq><priority>0.85</priority></url>
  <url><loc>${origin}/how-to/debug-mcp-tool-calls</loc><changefreq>monthly</changefreq><priority>0.85</priority></url>
  <url><loc>${origin}/how-to/deploy-mcp-on-cloudflare-workers</loc><changefreq>monthly</changefreq><priority>0.85</priority></url>
  <url><loc>${origin}/how-to/test-mcp-tools-locally</loc><changefreq>monthly</changefreq><priority>0.85</priority></url>
  <url><loc>${origin}/how-to/claim-verified-mcp-badge</loc><changefreq>monthly</changefreq><priority>0.85</priority></url>
  <url><loc>${origin}/glossary/mcp</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>${origin}/glossary/tool-use</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>${origin}/glossary/function-calling</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>${origin}/glossary/json-ld</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>${origin}/glossary/oauth-pkce</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>${origin}/glossary/openapi-spec</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>${origin}/integration/laravel</loc><changefreq>weekly</changefreq><priority>0.85</priority></url>
  <url><loc>${origin}/integration/spring-boot</loc><changefreq>weekly</changefreq><priority>0.85</priority></url>
  <url><loc>${origin}/integration/nestjs</loc><changefreq>weekly</changefreq><priority>0.85</priority></url>
  <url><loc>${origin}/integration/hono</loc><changefreq>weekly</changefreq><priority>0.85</priority></url>
  <url>
    <loc>${origin}/price-data</loc>
    <changefreq>weekly</changefreq>
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
    <loc>${origin}/drops</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${origin}/tools</loc>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>${origin}/guides</loc>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
${ARTICLE_SLUGS.map((slug) => `  <url>
    <loc>${origin}/guides/${slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join("\n")}
  <url>
    <loc>${origin}/tools/pokemon-resale-calculator</loc>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>${origin}/tools/pokemon-grading-calculator</loc>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
${LOCALIZED_LANGS.map((lang) => `  <url>
    <loc>${origin}/tools/${lang}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${origin}/tools/${lang}/pokemon-resale-calculator</loc>
    <changefreq>weekly</changefreq>
    <priority>0.75</priority>
  </url>`).join("\n")}
${DROP_SLUGS.map((slug) => `  <url>
    <loc>${origin}/drops/${slug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.85</priority>
  </url>`).join("\n")}
${LOCALIZED_LANGS.map((lang) => `  <url>
    <loc>${origin}/drops/${lang}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
${LOCALIZABLE_SLUGS.map((slug) => `  <url>
    <loc>${origin}/drops/${lang}/${slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.65</priority>
  </url>`).join("\n")}`).join("\n")}
${blogUrlsXml}
${gradeUrlsXml}
${urlsXml}
</urlset>
`;
}
