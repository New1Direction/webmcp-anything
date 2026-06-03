// connect_hub.ts — the PUBLIC connect/discovery hub at /connect.
//
// The conversion destination the launch + registries point at. Unlike the
// signed-in /dashboard connections grid, this is a public, indexable page: every
// vaulted MCP-proxy provider with its live A–F trust grade badge, a one-line
// value prop, and a Connect→subscribe path — plus the trust oracle and the
// dual-emit bridge as copy-paste snippets. One destination that shows the whole
// moat: graded + vaulted + metered.
import { PROVIDERS } from "./providers";

/**
 * Discovery manifest served at /.well-known/mcp — a flat, crawlable list of the
 * MCP servers wmcp.sh hosts (the trust oracle + every vaulted proxy), derived
 * from PROVIDERS so it can never drift from what /mcp/:provider actually serves.
 * No ratified standard exists for this path yet (the official channel is the
 * registry); this is a de-facto {name,url,description,transport,auth} list.
 */
export function wellKnownMcpManifest(origin: string) {
  const proxied = Object.values(PROVIDERS).filter((p) => p.mcpProxy && p.mcpUrl);
  return {
    name: "wmcp.sh",
    description:
      "Trust layer + OAuth vault for the Model Context Protocol. Connect a provider once at /connect, then any agent calls it at /mcp/<provider> with the OAuth bearer token injected and auto-refreshed; plus an independent, continuously-watched A–F trust grade for any MCP server.",
    homepage: origin,
    servers: [
      {
        name: "trust-oracle",
        url: `${origin}/mcp/trust`,
        description:
          "Independent MCP trust oracle. Tools: grade_mcp_server, check_mcp_drift, verify_before_execute. Continuously watched for drift / rug-pulls. REST: GET " +
          `${origin}/api/v1/mcp/verify?url=<server>. The grade is free and never for sale.`,
        transport: "streamable-http",
        auth: "none",
      },
      ...proxied.map((p) => ({
        name: p.id,
        url: `${origin}/mcp/${p.id}`,
        description: `OAuth-vault proxy to ${p.name}'s MCP. Connect once at ${origin}/connect; the bearer token is injected and auto-refreshed. Credentials encrypted at rest, never in tool args.`,
        transport: "streamable-http",
        auth: "oauth-vault",
      })),
    ],
    auth: {
      "oauth-vault": {
        description:
          "One-time connect via RFC 7591 Dynamic Client Registration + PKCE (zero per-app setup). The vault injects and auto-refreshes the provider's OAuth bearer token on every call; credentials are encrypted at rest and never passed in tool arguments.",
        connectUrl: `${origin}/connect`,
      },
    },
  };
}

const CAT_LABEL: Record<string, string> = {
  auth: "Identity", comms: "Comms", billing: "Billing & payments",
  dev: "Dev tools", ai: "AI", productivity: "Productivity", data: "Data",
};

export function connectHubHtml(origin: string): string {
  const esc = (s: string) =>
    String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // All vaulted MCP-proxy providers, derived from the registry so the page can
  // never drift from what /mcp/:provider actually serves.
  const proxied = Object.values(PROVIDERS).filter((p) => p.mcpProxy && p.mcpUrl);
  const hostOf = (u?: string) => { try { return new URL(u!).host.toLowerCase(); } catch { return ""; } };

  const cards = proxied
    .map((p) => {
      const host = hostOf(p.mcpUrl);
      const eh = encodeURIComponent(host);
      const badge = `${origin}/mcp/grade/${eh}/badge.svg`;
      const report = `${origin}/mcp/grade/${eh}`;
      const proxyUrl = `${origin}/mcp/${p.id}`;
      return `<article class="card">
  <div class="card-head">
    <div class="logo">${esc(p.name[0])}</div>
    <div class="card-title">
      <h3>${esc(p.name)}</h3>
      <span class="cat">${esc(CAT_LABEL[p.category] || p.category)}</span>
    </div>
    <a class="grade" href="${report}" title="Independent MCP trust grade — continuously watched for drift"><img src="${badge}" alt="MCP Trust Grade — ${esc(p.name)}" height="40" loading="lazy"/></a>
  </div>
  <p class="desc">${esc(p.description)}</p>
  ${p.scopeNotice ? `<p class="notice">${esc(p.scopeNotice)}</p>` : ""}
  <code class="ep">${esc(proxyUrl)}</code>
  <div class="card-cta">
    <a class="btn btn-p" href="${origin}/dashboard?connect=${encodeURIComponent(p.id)}">Connect ${esc(p.name)} →</a>
    <a class="btn btn-s" href="${report}">Trust grade</a>
  </div>
</article>`;
    })
    .join("\n");

  const ld = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "wmcp.sh connectable MCP servers — graded + vaulted",
    description:
      "Connect any of these MCP servers once via wmcp.sh; any agent (Claude, Cursor, Codex) then calls them with OAuth handled, credentials vaulted, and an independent A–F trust grade.",
    itemListElement: proxied.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.name,
      url: `${origin}/mcp/${p.id}`,
    })),
  };

  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>The MCP hub — connect, grade & build any MCP server | wmcp.sh</title>
<meta name="description" content="Connect ${proxied.length} OAuth-protected MCP servers (Linear, Notion, Atlassian, Asana, PayPal, Sentry, DefiLlama) once via wmcp.sh — then any agent calls them with the bearer token injected and refreshed, plus a free independent A–F trust grade that's continuously watched for drift & rug-pulls."/>
<link rel="canonical" href="${origin}/connect"/>
<meta property="og:title" content="The MCP hub — connect, grade & build any MCP server | wmcp.sh"/>
<meta property="og:description" content="Connect once; any agent calls it with OAuth handled, credentials vaulted, and a continuously-watched trust grade."/>
<meta property="og:url" content="${origin}/connect"/>
<meta property="og:image" content="${origin}/og.png"/>
<meta name="twitter:card" content="summary_large_image"/>
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<style>
  :root{--bg:#07070d;--card:#16161f;--bg2:#11111c;--border:#26263a;--text:#ececf5;--muted:#8a8aa8;--dim:#6a6a88;--accent:#ff9e2c;--accent2:#ffcf7a;--green:#4ade80}
  *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif;line-height:1.6;background-image:radial-gradient(ellipse 900px 620px at 12% -6%,rgba(255,158,44,.13),transparent 60%)}
  a{color:var(--accent2);text-decoration:none}a:hover{text-decoration:underline}
  .wrap{max-width:980px;margin:0 auto;padding:56px 22px 90px}
  .back{color:var(--muted);font-size:.85rem}
  h1{font-size:2.1rem;letter-spacing:-.02em;margin:14px 0 8px}
  .lede{color:var(--muted);max-width:680px;font-size:1.02rem;margin:0 0 8px}
  .sub{color:var(--dim);font-size:.9rem;margin:0 0 30px}
  .how{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px;margin:0 0 38px}
  .step{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px 16px}
  .step b{color:var(--accent2);font-size:.78rem;letter-spacing:.08em;text-transform:uppercase}
  .step p{margin:6px 0 0;font-size:.9rem;color:var(--muted)}
  .grid{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}
  .card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:20px;display:flex;flex-direction:column}
  .card-head{display:flex;align-items:center;gap:12px}
  .logo{width:38px;height:38px;border-radius:9px;background:var(--bg);display:grid;place-items:center;font-weight:800;color:var(--accent2);flex:none}
  .card-title{flex:1;min-width:0}.card-title h3{margin:0;font-size:1.12rem}
  .cat{color:var(--dim);font-size:.72rem;text-transform:uppercase;letter-spacing:.06em}
  .grade{flex:none}.grade img{display:block;border-radius:8px}
  .desc{color:var(--muted);font-size:.9rem;margin:12px 0 8px;flex:1}
  .notice{color:#ffb84d;font-size:.78rem;margin:0 0 8px}
  .ep{display:block;font-family:"SF Mono",Menlo,monospace;font-size:.78rem;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:8px 10px;color:var(--accent2);word-break:break-all;margin-bottom:12px}
  .card-cta{display:flex;gap:8px;flex-wrap:wrap}
  .btn{display:inline-block;font-weight:700;padding:10px 15px;border-radius:10px;font-size:.88rem}
  .btn-p{background:linear-gradient(135deg,#ff9120,#f25e00);color:#2a1500}
  .btn-p:hover{text-decoration:none;filter:brightness(1.05)}
  .btn-s{background:var(--bg2);color:var(--text);border:1px solid var(--border)}
  .btn-s:hover{text-decoration:none;border-color:var(--accent)}
  .section{margin-top:54px}
  .section h2{font-size:1.4rem;margin:0 0 6px}
  .section p.muted{color:var(--muted);margin:0 0 16px;max-width:720px}
  .snip{background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:13px 15px;font-family:"SF Mono",Menlo,monospace;font-size:.8rem;overflow-x:auto;white-space:pre-wrap;word-break:break-all;margin:0 0 10px;color:var(--text)}
  .two{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  @media(max-width:720px){.two{grid-template-columns:1fr}}
  .muted{color:var(--muted)}
  footer{margin-top:60px;color:var(--dim);font-size:.85rem;border-top:1px solid var(--border);padding-top:18px}
</style></head><body>
<div class="wrap">
  <a class="back" href="/">← wmcp.sh</a>
  <h1>The MCP hub</h1>
  <p class="lede">One hub for the Model Context Protocol: <strong>connect</strong> any MCP server with OAuth handled, <strong>grade</strong> any server for trust, and turn <strong>any URL</strong> into MCP tools. Any agent — Claude, Cursor, Codex — then calls it at <code>${esc(origin)}/mcp/&lt;provider&gt;</code>, bearer token injected and refreshed. No token pasting, ever.</p>
  <p class="sub">Every connection is <strong>credential-vaulted</strong> (encrypted, never in tool args), <strong>metered</strong>, and carries an <strong>independent A–F trust grade</strong> that we keep watching for drift &amp; rug-pulls.</p>
  <div style="display:flex;flex-wrap:wrap;gap:10px;margin:18px 0 6px">
    <a href="/mcp" style="background:var(--bg2);border:1px solid var(--border);border-radius:9px;padding:9px 14px;text-decoration:none;color:var(--text);font-weight:700;font-size:.9rem">🔌 Browse connectable servers</a>
    <a href="/mcp/grade" style="background:var(--bg2);border:1px solid var(--border);border-radius:9px;padding:9px 14px;text-decoration:none;color:var(--text);font-weight:700;font-size:.9rem">🛡️ Grade an MCP server</a>
    <a href="/directory" style="background:var(--bg2);border:1px solid var(--border);border-radius:9px;padding:9px 14px;text-decoration:none;color:var(--text);font-weight:700;font-size:.9rem">📚 Directory: any URL → MCP</a>
    <a href="/directory/submit" style="background:var(--bg2);border:1px solid var(--border);border-radius:9px;padding:9px 14px;text-decoration:none;color:var(--text);font-weight:700;font-size:.9rem">➕ Submit your server</a>
  </div>

  <div class="how">
    <div class="step"><b>1 · Connect</b><p>One OAuth click. wmcp.sh self-registers with the upstream (RFC 7591) — nothing to configure.</p></div>
    <div class="step"><b>2 · Vaulted</b><p>Your token is encrypted at rest and auto-refreshed. Agents never see a credential.</p></div>
    <div class="step"><b>3 · Point your agent</b><p>Use <code>${esc(origin)}/mcp/&lt;provider&gt;</code> as the MCP URL. Done.</p></div>
  </div>

  <div class="grid">
${cards || '<p class="muted">No connectable servers published yet.</p>'}
  </div>

  <div class="section">
    <h2>Agents: gate the connection on trust</h2>
    <p class="muted">Before your agent calls a third-party MCP server, ask the wmcp.sh trust oracle whether it's safe — grade, drift status, and a connect/caution/avoid verdict in one call. The grade is free and independent.</p>
    <div class="two">
      <div>
        <div class="muted" style="font-size:.8rem;margin-bottom:6px">Add the oracle as an MCP server</div>
        <pre class="snip">${esc(origin)}/mcp/trust</pre>
        <div class="muted" style="font-size:.8rem;margin:10px 0 6px">Or one HTTP call before you execute</div>
        <pre class="snip">curl "${esc(origin)}/api/v1/mcp/verify?url=&lt;server&gt;"</pre>
      </div>
      <div>
        <div class="muted" style="font-size:.8rem;margin-bottom:6px">Tools the oracle exposes</div>
        <pre class="snip">grade_mcp_server({ url })
check_mcp_drift({ url })
verify_before_execute({ url })</pre>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Make any website agent-ready</h2>
    <p class="muted">The dual-emit bridge turns one extraction into <strong>both</strong> protocols: a server-side MCP endpoint for Claude/Cursor/Codex, and a drop-in WebMCP shim that exposes the same tools to in-browser agents via <code>navigator.modelContext</code>.</p>
    <div class="two">
      <div>
        <div class="muted" style="font-size:.8rem;margin-bottom:6px">Server-side MCP (point any agent here)</div>
        <pre class="snip">${esc(origin)}/api/v1/webmcp?url=&lt;your-site&gt;</pre>
      </div>
      <div>
        <div class="muted" style="font-size:.8rem;margin-bottom:6px">In-browser WebMCP — one line in &lt;head&gt;</div>
        <pre class="snip">&lt;script src="${esc(origin)}/webmcp/&lt;b64url&gt;.js" async&gt;&lt;/script&gt;</pre>
      </div>
    </div>
  </div>

  <footer>
    Browse the full catalog: <a href="/mcp">/mcp</a> · Grade any server: <a href="/mcp/grade">/mcp/grade</a> · Pricing &amp; keys: <a href="/dashboard">/dashboard</a><br/>
    The trust grade is free and identical whether or not the operator pays — independence is the point.
  </footer>
</div>
</body></html>`;
}
