// /verify/:slug — embed-snippet page for site owners with a verified
// listing. Renders a live preview of the badge + copy-paste HTML / Markdown
// / React snippets. Linking back from their site to wmcp.sh/u/<slug> is a
// trust signal and an SEO backlink.
//
// Page renders even for unverified slugs (so /managed leads can preview
// what they'd get) — gates on the live "Verified" wording.

import type { Context } from "hono";

type Env = { KEYS: KVNamespace };

export async function verifyEmbedHandler(c: Context<{ Bindings: Env }>) {
  const slug = (c.req.param("slug") || "").toLowerCase();
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return c.text("Bad slug", 400);

  let verified = false;
  let featuredRank: number | null = null;
  try {
    const [v, f] = await Promise.all([
      c.env.KEYS.get(`verified:${slug}`),
      c.env.KEYS.get(`featured:${slug}`),
    ]);
    verified = v === "1";
    if (f) featuredRank = parseInt(f, 10);
  } catch {}

  const origin = new URL(c.req.url).origin;
  const html = embedHtml(origin, slug, verified, featuredRank);
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=120, s-maxage=120",
    },
  });
}

function embedHtml(origin: string, slug: string, verified: boolean, rank: number | null): string {
  const badgeUrl = `${origin}/badge/${slug}.svg`;
  const badgeUrlMini = `${origin}/badge/${slug}-mini.svg`;
  const listingUrl = `${origin}/u/${slug}`;
  const stateWord = verified ? "verified" : "indexed";
  const stateLabel = verified ? "Agent-ready Verified" : "Indexed by wmcp.sh";

  const htmlSnippet = `<a href="${listingUrl}" target="_blank" rel="noopener">
  <img src="${badgeUrl}" alt="${stateLabel}" width="232" height="44" />
</a>`;

  const mdSnippet = `[![${stateLabel}](${badgeUrl})](${listingUrl})`;

  const reactSnippet = `<a href="${listingUrl}" target="_blank" rel="noopener">
  <img src="${badgeUrl}" alt="${stateLabel}" width={232} height={44} />
</a>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${verified ? "Verified" : "Listing"}: ${slug} — embed your badge | wmcp.sh</title>
<meta name="description" content="Embed the wmcp.sh ${stateWord} badge on your site. Copy-paste HTML, Markdown, or JSX." />
<link rel="canonical" href="${origin}/verify/${slug}" />
<meta name="robots" content="noindex,follow" />
<style>
  :root { --bg:#07070d;--card:#16161f;--bg2:#11111c;--border:#26263a;--text:#ececf5;--muted:#8a8aa8;--dim:#6a6a88;--accent:#7c5cff;--accent2:#00e5ff;--green:#4ade80;--gold:#fbbf24; }
  * { box-sizing: border-box; }
  body { margin:0;min-height:100vh;color:var(--text);background:var(--bg);font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif;line-height:1.6;background-image:radial-gradient(ellipse 900px 600px at 10% -5%,rgba(124,92,255,.18),transparent 60%); }
  .wrap { max-width: 780px; margin: 0 auto; padding: 40px 24px 80px; }
  nav { display:flex;justify-content:space-between;padding:18px 24px;font-size:.9rem;color:var(--muted) }
  nav a { color:var(--muted);text-decoration:none;margin-right:14px } nav a:hover{color:var(--text)}
  nav .brand { color: var(--text); font-weight: 800; }
  nav .brand span { color: var(--accent2); }
  h1 { font-size:clamp(1.6rem,3.5vw,2.2rem);margin:0 0 8px;font-weight:800;letter-spacing:-.02em;background:linear-gradient(135deg,#fff 30%,var(--accent2));-webkit-background-clip:text;background-clip:text;color:transparent; }
  h2 { font-size: 1.05rem; margin: 32px 0 10px; font-weight: 700; }
  .state { display:inline-flex;align-items:center;gap:8px;padding:5px 12px;border-radius:999px;font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;font-weight:700;border:1px solid; }
  .state.verified { background:linear-gradient(90deg,rgba(124,92,255,.18),rgba(0,229,255,.18));border-color:rgba(124,92,255,.5);color:var(--accent2); }
  .state.indexed { background:#11111c;border-color:var(--border);color:var(--muted); }
  .state.featured { background:rgba(251,191,36,.12);border-color:rgba(251,191,36,.4);color:var(--gold); }
  .muted { color: var(--muted); }
  .preview { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 30px; text-align: center; margin: 16px 0 24px; }
  .preview img { display: block; margin: 0 auto; }
  .preview .pair { display: flex; gap: 24px; justify-content: center; align-items: center; flex-wrap: wrap; }
  pre { background: #0a0a12; border: 1px solid var(--border); border-radius: 10px; padding: 16px; overflow-x: auto; font-family: "SF Mono", Menlo, monospace; font-size: .82rem; color: var(--green); line-height: 1.5; position: relative; }
  pre .copy-btn { position: absolute; top: 8px; right: 8px; background: var(--bg2); border: 1px solid var(--border); color: var(--muted); padding: 4px 10px; border-radius: 6px; font-size: .72rem; cursor: pointer; font-family: inherit; }
  pre .copy-btn:hover { color: var(--text); border-color: var(--accent); }
  pre .copy-btn.copied { color: var(--green); border-color: var(--green); }
  .tabs { display:flex;gap:0;margin-bottom:0;border-bottom:1px solid var(--border) }
  .tab { background:transparent;border:none;color:var(--muted);padding:10px 16px;font-family:inherit;font-size:.85rem;font-weight:600;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px }
  .tab.on { color:var(--text); border-bottom-color: var(--accent2); }
  .tabpane { display:none; padding-top: 14px; } .tabpane.on { display:block; }
  .cta-row { display: flex; gap: 12px; margin-top: 30px; flex-wrap: wrap; }
  .cta { display:inline-block;padding:11px 18px;border-radius:9px;text-decoration:none;font-weight:700;font-size:.9rem }
  .cta.primary { background:linear-gradient(135deg,var(--accent),var(--accent2));color:#0c0c14 }
  .cta.ghost { background:var(--bg2);border:1px solid var(--border);color:var(--text) }
  .upsell { margin-top: 32px; background: linear-gradient(135deg, var(--card), rgba(124,92,255,.06)); border: 1px solid rgba(124,92,255,.3); border-radius: 14px; padding: 22px; }
  .upsell h3 { margin: 0 0 6px; }
</style>
</head>
<body>

<nav>
  <a class="brand" href="/">wmcp<span>.sh</span></a>
  <div><a href="/directory">Directory</a><a href="/managed">/managed</a><a href="/dashboard">Dashboard</a></div>
</nav>

<div class="wrap">

<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px">
  <span class="state ${verified ? "verified" : "indexed"}">${verified ? "✓ Verified" : "○ Indexed"}</span>
  ${rank != null ? `<span class="state featured">★ Featured #${rank}</span>` : ""}
  <span class="muted" style="font-size:.85rem">slug: <code>${slug}</code></span>
</div>

<h1>Embed your ${stateWord} badge.</h1>
<p class="muted">Show agents — and humans — that your site is callable via wmcp.sh. Each badge is an SVG hosted on wmcp.sh; we update the styling automatically when you upgrade or change status.</p>

<h2>Preview</h2>
<div class="preview">
  <div class="pair">
    <a href="${listingUrl}" target="_blank" rel="noopener"><img src="${badgeUrl}" alt="${stateLabel}" width="232" height="44" /></a>
    <a href="${listingUrl}" target="_blank" rel="noopener"><img src="${badgeUrlMini}" alt="${stateLabel}" width="44" height="44" /></a>
  </div>
</div>

<h2>Copy-paste</h2>
<div class="tabs">
  <button class="tab on" data-tab="html">HTML</button>
  <button class="tab" data-tab="md">Markdown</button>
  <button class="tab" data-tab="jsx">JSX / React</button>
  <button class="tab" data-tab="url">Just the URL</button>
</div>

<div id="pane-html" class="tabpane on">
  <pre id="snippet-html"><button class="copy-btn" data-target="snippet-html">copy</button><code>${escapeHtml(htmlSnippet)}</code></pre>
  <p class="muted" style="font-size:.85rem;margin-top:6px">Paste anywhere on your site — footer is the conventional spot.</p>
</div>
<div id="pane-md" class="tabpane">
  <pre id="snippet-md"><button class="copy-btn" data-target="snippet-md">copy</button><code>${escapeHtml(mdSnippet)}</code></pre>
  <p class="muted" style="font-size:.85rem;margin-top:6px">For README badges, blog posts, or any Markdown surface.</p>
</div>
<div id="pane-jsx" class="tabpane">
  <pre id="snippet-jsx"><button class="copy-btn" data-target="snippet-jsx">copy</button><code>${escapeHtml(reactSnippet)}</code></pre>
  <p class="muted" style="font-size:.85rem;margin-top:6px">JSX-camelCased. Drop into any React / Next.js / Remix component.</p>
</div>
<div id="pane-url" class="tabpane">
  <pre id="snippet-url"><button class="copy-btn" data-target="snippet-url">copy</button><code>${escapeHtml(badgeUrl)}</code></pre>
  <p class="muted" style="font-size:.85rem;margin-top:6px">Direct SVG URL. Use this with Shields-style services, custom layouts, or anywhere that just wants an image src.</p>
</div>

${
  !verified
    ? `<div class="upsell">
  <h3 style="color:var(--accent2)">This slug isn't verified yet.</h3>
  <p class="muted" style="margin:6px 0 0">The embed will render the neutral "Indexed" style until you upgrade. Verified gets the gradient pill + featured directory placement.</p>
  <a class="cta primary" style="margin-top:14px" href="/managed">Get verified → /managed</a>
</div>`
    : ""
}

<h2 style="margin-top:34px">What the badge proves</h2>
<ul class="muted" style="font-size:.92rem;line-height:1.8;padding-left:22px">
  <li><strong style="color:var(--text)">Live MCP tools</strong> — wmcp.sh extracts callable tools from <code>${slug}</code> on every fetch.</li>
  <li><strong style="color:var(--text)">No spec required</strong> — we use a 5-tier adapter chain (Shopify → JSON-LD → OpenAPI → LLM → fallback).</li>
  <li><strong style="color:var(--text)">${verified ? "Verified" : "Indexed"} by wmcp.sh</strong> — ${verified ? "an operator confirmed your listing." : "auto-indexed; upgrade to verified via /managed."}</li>
  <li>Clicking the badge takes the user to <code>${listingUrl}</code> — the canonical agent landing page.</li>
</ul>

<div class="cta-row">
  <a class="cta primary" href="${listingUrl}">View listing →</a>
  <a class="cta ghost" href="/managed">Upgrade / claim</a>
  <a class="cta ghost" href="/directory/submit">Submit another site</a>
</div>

</div>

<script>
document.querySelectorAll('.tab').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach(x => x.classList.remove('on'));
  document.querySelectorAll('.tabpane').forEach(x => x.classList.remove('on'));
  b.classList.add('on');
  document.getElementById('pane-' + b.dataset.tab).classList.add('on');
}));
document.querySelectorAll('.copy-btn').forEach(b => b.addEventListener('click', async (e) => {
  e.stopPropagation();
  const t = document.getElementById(b.dataset.target);
  const code = t.querySelector('code').innerText;
  try {
    await navigator.clipboard.writeText(code);
    b.textContent = 'copied ✓'; b.classList.add('copied');
    setTimeout(() => { b.textContent = 'copy'; b.classList.remove('copied'); }, 1400);
  } catch {}
}));
</script>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" } as any)[c]
  );
}
