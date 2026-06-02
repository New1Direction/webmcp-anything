// privacy.ts — privacy policy. Required by the Chrome Web Store for an
// extension with host_permissions, and good practice for the hosted API.
// Written to match what the extension ACTUALLY does (verified against
// extension/background.js + content.js): local processing by default, nothing
// leaves the browser unless the user opts into the shared cache.

export function privacyHtml(origin: string): string {
  const updated = "2026-06-02";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Privacy Policy — wmcp.sh</title>
<meta name="robots" content="index,follow" />
<style>
  :root { --bg:#07070d; --card:#16161f; --border:#26263a; --text:#e8e8f0; --muted:#9a9ab0; --accent:#ff9e2c; }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--bg); color:var(--text); font:16px/1.7 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; }
  .wrap { max-width: 760px; margin: 0 auto; padding: 48px 22px 80px; }
  h1 { font-size: 1.8rem; margin: 0 0 6px; }
  h2 { font-size: 1.15rem; margin: 34px 0 8px; color: var(--accent); }
  .muted { color: var(--muted); }
  a { color: var(--accent); }
  code { background: var(--card); border: 1px solid var(--border); padding: 1px 6px; border-radius: 6px; font-size: .9em; }
  ul { padding-left: 20px; }
  li { margin: 6px 0; }
  .box { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 16px 18px; margin: 16px 0; }
  hr { border: 0; border-top: 1px solid var(--border); margin: 30px 0; }
</style>
</head>
<body>
<div class="wrap">
  <h1>Privacy Policy</h1>
  <p class="muted">wmcp.sh and the “QuickCatch” browser extension · Last updated ${updated}</p>

  <div class="box">
    <strong>The short version.</strong> The extension reads the page you’re on to
    turn it into agent-callable tools, and it does that <strong>locally in your
    browser</strong>. By default nothing about the pages you visit is sent to us.
    We don’t sell data, we don’t run ad or analytics trackers in the extension,
    and your API key stays on your device.
  </div>

  <h2>What the extension accesses</h2>
  <ul>
    <li><strong>Page content on sites you visit</strong> — structured data
      (schema.org JSON-LD), meta tags, and page text — read at the moment you’re
      on the page, solely to extract WebMCP/MCP tools for that page.</li>
    <li><strong>Local settings</strong> stored on your device via
      <code>chrome.storage.local</code>: your preferences and, if you choose to
      add one, your wmcp.sh API key.</li>
  </ul>

  <h2>What leaves your browser — and when</h2>
  <ul>
    <li><strong>By default: nothing.</strong> Extraction happens on-device; the
      extracted tools are shown to you and used locally.</li>
    <li><strong>Only if you opt in</strong> to the shared cache (a setting that is
      off until you enable it and set an endpoint), the extension sends the
      <em>extracted tool schema</em> for a URL (e.g. a product’s price/title or an
      article’s headline — the structured fields, not your browsing history) to
      that endpoint so the result can be reused. You control this in the
      extension’s options.</li>
    <li>We do <strong>not</strong> collect your browsing history, keystrokes,
      form inputs, cookies, or credentials. The extension does not read sites in
      the background — only the page you are actively viewing.</li>
  </ul>

  <h2>The hosted service (${new URL(origin).host})</h2>
  <ul>
    <li>When you call the hosted API directly, we process the URL you submit to
      return tools, and keep short-lived caches of extracted schemas.</li>
    <li>Standard request metadata (e.g. IP address) is used transiently for
      rate-limiting and abuse prevention.</li>
    <li>For paid accounts we store your email and an API key to operate billing
      and usage; payments are handled by Stripe under its own privacy policy.</li>
  </ul>

  <h2>What we don’t do</h2>
  <ul>
    <li>We don’t sell or rent your data.</li>
    <li>We don’t use your data for advertising.</li>
    <li>We don’t bundle third-party analytics or tracking SDKs in the extension.</li>
  </ul>

  <h2>Data retention &amp; your choices</h2>
  <ul>
    <li>Local settings live on your device until you remove them or uninstall.</li>
    <li>Shared-cache schemas can be removed on request.</li>
    <li>Account data: email us to access or delete it.</li>
  </ul>

  <h2>Contact</h2>
  <p>Questions or requests: <a href="mailto:hello@wmcp.sh">hello@wmcp.sh</a>.</p>

  <hr />
  <p class="muted"><a href="${origin}/">← wmcp.sh</a></p>
</div>
</body>
</html>`;
}
