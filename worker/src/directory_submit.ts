// /directory/submit — page where site owners submit their URL to the
// wmcp.sh directory. Free basic listing; upgrade path to /managed for
// verified badge + featured placement + custom MCP server.
//
// The form posts to /api/v1/directory/submit which:
//   1. Validates the URL
//   2. Hits /api/v1/tools to see if wmcp.sh's adapter chain extracts tools
//   3. Saves the submission to KV with metadata
//   4. Returns confirmation + the listing URL
//   5. (If "interested in /managed" → also files a lead via lead_capture)

export function directorySubmitHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Submit your site to wmcp.sh directory — free listing + verified badge | wmcp.sh</title>
<meta name="description" content="Free directory listing for AI-agent-discoverable sites. Submit your URL → we extract MCP tools → your site appears at wmcp.sh/directory + a /u/<slug> landing page Google indexes. Upgrade to verified badge + featured placement via /managed." />
<link rel="canonical" href="${origin}/directory/submit" />
<meta property="og:title" content="Get listed in the wmcp.sh directory" />
<meta property="og:description" content="Free listing. Verified badge available via /managed. Agent-discoverable in minutes." />
<meta property="og:url" content="${origin}/directory/submit" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Submit to wmcp.sh directory" />
<meta name="twitter:description" content="Free listing. Verified badge upgrade available." />
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article","headline":"Submit your site to the wmcp.sh directory","description":"Free agent-discoverable listing for sites with structured data or OpenAPI. Verified badge available via /managed.","author":{"@type":"Organization","name":"WebMCP Anything"},"publisher":{"@type":"Organization","name":"WebMCP Anything","url":"https://wmcp.sh"},"datePublished":"2026-05-28","dateModified":"2026-05-28","mainEntityOfPage":"${origin}/directory/submit"}
</script>
<style>
  :root { --bg:#07070d;--card:#16161f;--bg2:#11111c;--border:#26263a;--text:#ececf5;--muted:#8a8aa8;--dim:#6a6a88;--accent:#7c5cff;--accent2:#00e5ff;--green:#4ade80;--red:#f87171;--pink:#f0abfc;--gold:#fbbf24; }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin:0;min-height:100vh;color:var(--text);background:var(--bg);font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif;line-height:1.6;background-image:radial-gradient(ellipse 900px 600px at 10% -5%,rgba(124,92,255,.18),transparent 60%),radial-gradient(ellipse 700px 500px at 95% 10%,rgba(0,229,255,.10),transparent 60%); }
  .wrap { max-width: 820px; margin: 0 auto; padding: 0 24px; }
  nav { display:flex;justify-content:space-between;align-items:center;padding:22px 24px;max-width:1080px;margin:0 auto; }
  nav .brand { font-weight: 800; letter-spacing: -.02em; font-size: 1.05rem; }
  nav .brand span { color: var(--accent2); }
  nav .links { display: flex; gap: 22px; font-size: .9rem; }
  nav .links a { color: var(--muted); text-decoration: none; }
  nav .cta { background: var(--bg2); border: 1px solid var(--border); padding: 7px 14px; border-radius: 8px; font-size: .85rem; color: var(--text); text-decoration: none; font-weight: 600; }
  header.hero { padding: 50px 0 30px; }
  .badge { display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;font-size:.7rem;letter-spacing:.15em;text-transform:uppercase;font-weight:700;background:linear-gradient(90deg,rgba(124,92,255,.18),rgba(0,229,255,.18));border:1px solid rgba(124,92,255,.35);margin-bottom:18px; }
  .dot { width:6px;height:6px;background:var(--accent2);border-radius:50%;box-shadow:0 0 8px var(--accent2); }
  h1 { font-size:clamp(2rem,4.5vw,3rem);margin:0 0 18px;background:linear-gradient(135deg,#fff 30%,var(--accent2) 100%);-webkit-background-clip:text;background-clip:text;color:transparent;line-height:1.05;font-weight:800;letter-spacing:-.025em; }
  .sub { color: var(--muted); font-size: 1.05rem; max-width: 660px; margin: 0 0 24px; }
  section { padding: 32px 0; }
  .section-label { display:inline-block;font-size:.72rem;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--accent2);margin-bottom:10px; }
  h2 { font-size:clamp(1.4rem,3vw,1.9rem);margin:0 0 12px;font-weight:700;letter-spacing:-.02em; }
  h3 { font-size:1.05rem;margin:0 0 8px;font-weight:700; }
  .section-sub { color: var(--muted); max-width: 640px; margin: 0 0 20px; }
  code { font-family: "SF Mono", Menlo, monospace; background: var(--bg2); padding: 1px 6px; border-radius: 4px; font-size: .85em; }

  /* Form */
  .form-wrap { background: linear-gradient(180deg, var(--card), var(--bg2)); border: 1px solid var(--border); border-radius: 18px; padding: 30px; margin-top: 22px; }
  .form-row { display: grid; gap: 14px; grid-template-columns: 1fr 1fr; margin-bottom: 14px; }
  @media (max-width: 580px) { .form-row { grid-template-columns: 1fr; } }
  label { display: block; font-size: .8rem; font-weight: 700; color: var(--muted); margin-bottom: 6px; letter-spacing: .03em; }
  input, select, textarea { width: 100%; background: var(--bg); border: 1px solid var(--border); border-radius: 10px; padding: 12px 14px; color: var(--text); font-family: inherit; font-size: .95rem; }
  input:focus, select:focus, textarea:focus { outline: none; border-color: var(--accent); }
  textarea { min-height: 80px; resize: vertical; }
  .checkbox-row { display: flex; align-items: flex-start; gap: 10px; margin: 18px 0; }
  .checkbox-row input { width: 18px; height: 18px; margin-top: 3px; }
  .checkbox-row label { font-size: .9rem; color: var(--text); margin: 0; letter-spacing: normal; font-weight: normal; }
  .checkbox-row label strong { color: var(--accent2); }
  .form-cta { display: block; background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%); color: white; padding: 14px 22px; border-radius: 10px; text-decoration: none; font-weight: 700; text-align: center; font-size: 1rem; border: none; cursor: pointer; width: 100%; margin-top: 8px; }
  .hp { position: absolute; left: -9999px; }

  .success { display: none; background: linear-gradient(135deg, rgba(74,222,128,.15), rgba(0,229,255,.08)); border: 1px solid var(--green); border-radius: 12px; padding: 22px; }
  .success.show { display: block; }
  .success h3 { color: var(--green); margin: 0 0 6px; }
  .success a { color: var(--accent2); }
  .error { display: none; background: rgba(248,113,113,.1); border: 1px solid var(--red); border-radius: 10px; padding: 14px; color: var(--red); font-size: .9rem; margin-top: 14px; }
  .error.show { display: block; }

  /* Tier comparison strip */
  .tiers { display: grid; gap: 16px; grid-template-columns: 1fr 1fr; margin-top: 22px; }
  @media (max-width: 700px) { .tiers { grid-template-columns: 1fr; } }
  .tier { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 22px; }
  .tier.featured { background: linear-gradient(135deg, var(--card), rgba(124,92,255,0.08)); border-color: var(--accent); }
  .tier h3 { color: var(--text); }
  .tier .price { color: var(--accent2); font-weight: 700; font-size: .95rem; margin: 6px 0 12px; }
  .tier ul { color: var(--muted); padding-left: 20px; font-size: .9rem; line-height: 1.7; margin: 0; }
  .tier ul li { margin-bottom: 4px; }
  .tier .upgrade-cta { display: inline-block; margin-top: 14px; color: var(--accent2); text-decoration: none; font-weight: 600; font-size: .9rem; }

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
  </div>
  <a class="cta" href="/dashboard">Dashboard →</a>
</nav>

<div class="wrap">

<header class="hero">
  <div class="badge"><span class="dot"></span> directory &middot; submit</div>
  <h1>Get listed in the wmcp.sh directory.</h1>
  <p class="sub">Free basic listing — submit your URL, we extract MCP tools via the public adapter chain, your site appears at <code>/directory</code> + a permanent <code>/u/&lt;slug&gt;</code> landing page Google can index. Agents looking for sites with your kind of tools find you.</p>
</header>

<!-- ========== Form ========== -->
<section id="submit">
  <div class="section-label">1 · submit</div>
  <h2>Submit your site (free).</h2>
  <p class="section-sub">Takes 30 seconds. We'll email you the listing URL within ~5 minutes if tools extract cleanly, or a note explaining what's missing.</p>

  <div class="form-wrap">
    <div id="ds-success" class="success">
      <h3>Submitted.</h3>
      <p style="color:var(--muted);font-size:.95rem;margin:8px 0 0">We're processing your URL. If wmcp.sh can extract tools, your listing goes live within ~5 min at <code id="ds-listing-url"></code>. We'll email confirmation either way. Watch <code>audit@wmcp.sh</code> in your inbox.</p>
    </div>
    <div id="ds-error" class="error"></div>

    <form id="ds-form" onsubmit="return submitDirectory(event)">
      <input type="text" name="company_email" class="hp" tabindex="-1" autocomplete="off" />

      <div class="form-row">
        <div>
          <label for="ds-name">Your name</label>
          <input id="ds-name" name="name" type="text" required maxlength="100" />
        </div>
        <div>
          <label for="ds-email">Email</label>
          <input id="ds-email" name="email" type="email" required maxlength="200" />
        </div>
      </div>

      <div style="margin-bottom: 14px">
        <label for="ds-url">Site URL (the page or API you want listed)</label>
        <input id="ds-url" name="site_url" type="url" required maxlength="500"
               placeholder="https://yourstore.com/products/your-product OR https://api.yoursite.com/openapi.json" />
      </div>

      <div style="margin-bottom: 14px">
        <label for="ds-category">Best-fit category</label>
        <select id="ds-category" name="category">
          <option value="ecommerce">E-commerce / Shopify-style storefront</option>
          <option value="api">SaaS API (OpenAPI spec)</option>
          <option value="docs">Documentation site</option>
          <option value="data">Data source / oracle / feeds</option>
          <option value="ai-tools">AI / ML tools</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label for="ds-blurb">One-line description (optional)</label>
        <textarea id="ds-blurb" name="blurb" maxlength="280" placeholder="What does your site do? Agents read this when deciding to call your tools."></textarea>
      </div>

      <div class="checkbox-row">
        <input id="ds-managed" name="managed_interest" type="checkbox" />
        <label for="ds-managed">
          I'm interested in <strong>/managed</strong> — verified badge, featured directory placement, custom MCP server hosting. (Starts at $499 setup. We'll follow up with specifics.)
        </label>
      </div>

      <button type="submit" class="form-cta">Submit free listing →</button>
    </form>
  </div>
</section>

<!-- ========== What you get ========== -->
<section id="tiers">
  <div class="section-label">2 · listings</div>
  <h2>Free vs verified.</h2>
  <div class="tiers">
    <div class="tier">
      <h3>Free listing</h3>
      <div class="price">$0 · self-submitted</div>
      <ul>
        <li>Appears at wmcp.sh/directory</li>
        <li>Permanent <code>/u/&lt;slug&gt;</code> page Google indexes</li>
        <li>Auto-extracted MCP tools (5-tier adapter chain)</li>
        <li>Searchable by category + provider name</li>
        <li>Submit-only — we don't claim ownership</li>
      </ul>
    </div>

    <div class="tier featured">
      <h3>Verified listing</h3>
      <div class="price">self-serve — prove ownership, then subscribe</div>
      <ul>
        <li>Everything in Free</li>
        <li><strong style="color:var(--text)">"Agent-ready Verified" badge</strong> — embed on your site as an SVG</li>
        <li><strong style="color:var(--text)">Self-serve:</strong> prove you control the domain (a one-line <code>&lt;meta&gt;</code> tag), then subscribe — no sales call</li>
        <li>Re-tested on a cadence — reverts to "Indexed" if your tools stop resolving</li>
        <li>Priority directory rank</li>
        <li>Want it done for you (custom adapter, white-label MCP at <code>mcp.yourbrand.com</code>)? See <a href="/managed">/managed</a></li>
      </ul>
      <a class="upgrade-cta" href="/directory/claim">Get verified → claim your site</a>
    </div>
  </div>
</section>

<!-- ========== How it works ========== -->
<section id="how">
  <div class="section-label">3 · what happens after you submit</div>
  <h2>The pipeline.</h2>
  <ol style="color:var(--muted);font-size:.95rem;line-height:1.75;padding-left:22px">
    <li>We hit <code>${origin}/api/v1/tools?url=&lt;your URL&gt;</code> to see what the 5-tier adapter chain extracts.</li>
    <li>If it extracts cleanly: your listing goes live. You get an email with the URL.</li>
    <li>If it can't extract: you get an email explaining the gap (e.g. "no JSON-LD found, no OpenAPI spec, CF blocked the fetch") + a free audit suggesting the fix.</li>
    <li>Either way: you can upgrade to <a href="/managed">/managed</a> for hands-on work + the verified badge.</li>
  </ol>
</section>

</div>

<footer>
  <a href="/">Home</a> · <a href="/agent-ready">Agent-ready</a> · <a href="/managed">Done for you</a> · <a href="/price-data">Price data</a> · <a href="/directory">Directory</a> · <a href="https://github.com/New1Direction/webmcp-anything">GitHub</a>
</footer>

<script>
async function submitDirectory(ev) {
  ev.preventDefault();
  const form = ev.target;
  const errEl = document.getElementById('ds-error');
  const okEl = document.getElementById('ds-success');
  errEl.classList.remove('show');
  errEl.textContent = '';
  const body = {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    site_url: form.site_url.value.trim(),
    category: form.category.value,
    blurb: form.blurb.value.trim(),
    managed_interest: form.managed_interest.checked,
    hp: form.company_email.value,
  };
  if (body.hp) return false;
  try {
    const res = await fetch('/api/v1/directory/submit', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Submit failed (' + res.status + ')');
    }
    const data = await res.json();
    form.style.display = 'none';
    document.getElementById('ds-listing-url').textContent = data.listing_url || (location.origin + '/directory');
    okEl.classList.add('show');
    okEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (err) {
    errEl.textContent = err.message || 'Submit failed. Try again or email audit@wmcp.sh.';
    errEl.classList.add('show');
  }
  return false;
}
</script>
</body>
</html>`;
}
