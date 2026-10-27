// webmcp_bridge.ts — the dual-emit MCP↔WebMCP bridge.
//
// From ONE extraction (resolveTools) we serve BOTH:
//   - the server-side MCP config (already shipped at /mcp/u/<b64url>), and
//   - a drop-in WebMCP shim (/webmcp/<b64url>.js) that loops the same
//     {name,description,inputSchema} tools into document.modelContext
//     .registerTool() — closing the MCP↔WebMCP gap from a single source.
//
// Strategy: this is the distribution wedge for the durable take-rates. Every
// emitted shim is a site whose agent tool-calls flow through wmcp's graded /
// vaulted / metered execute path. Read tools resolve from the embedded
// extraction (free, instant); live actions POST to /api/v1/tools/execute
// (where the grade + payment gate live). Origin-trial land-grab: be the default
// "one line → your site is WebMCP-ready" supplier.
import { base64urlEncode } from "./u";
import { uiCss, uiNav } from "./ui";
import { adSlot } from "./ads";

interface SlimTool { name: string; description?: string; inputSchema?: any; result?: any }

function slim(tools: any[]): SlimTool[] {
  return (tools || []).map((t) => {
    const s: SlimTool = { name: t.name, description: t.description, inputSchema: t.inputSchema || { type: "object", properties: {} } };
    if (t.result !== undefined) s.result = t.result; // read tools carry their value
    return s;
  });
}

/** The drop-in WebMCP shim served at /webmcp/<b64url>.js (content-type JS). */
export function webmcpShimJs(siteUrl: string, tools: any[], origin: string): string {
  const t = slim(tools);
  return `/* wmcp.sh WebMCP shim — exposes ${t.length} agent-callable tool(s).
   to in-browser agents via document.modelContext (Chrome WebMCP origin trial).
   One line: <script src="${origin}/webmcp/${base64urlEncode(siteUrl)}.js" async></script>
   Read tools are embedded snapshots. Live actions require authenticated integration. */
(function () {
  // Prefer the October 2026 W3C Community Group draft; retain legacy preview support.
  var MC = typeof document !== "undefined" && document.modelContext && typeof document.modelContext.registerTool === "function"
    ? document.modelContext
    : typeof navigator !== "undefined" && navigator.modelContext && typeof navigator.modelContext.registerTool === "function"
      ? navigator.modelContext : null;
  if (!MC) return;
  var WMCP = ${JSON.stringify(origin)};
  var SITE = ${JSON.stringify(siteUrl)};
  var TOOLS = ${JSON.stringify(t)};
  // The embed is only valid on its intended site's origin.
  if (new URL(SITE).origin !== location.origin) return;
  // Re-initialization removes only registrations owned by this shim.
  if (window.__wmcpBridgeController && typeof window.__wmcpBridgeController.abort === "function") window.__wmcpBridgeController.abort();
  var ctl = new AbortController();
  window.__wmcpBridgeController = ctl;
  (async function registerTools() {
    // Prefer tools explicitly authored by the website over inferred duplicates.
    var existing = [];
    try {
      if (typeof MC.getTools === "function") existing = await MC.getTools();
    } catch (e) { /* some previews do not expose getTools */ }
    if (ctl.signal.aborted) return;
    var nativeNames = new Set((existing || []).map(function (item) { return item.name; }));
    TOOLS.filter(function (tool) { return !nativeNames.has(tool.name); }).forEach(async function (tool) {
    try {
      await MC.registerTool({
        name: tool.name,
        description: tool.description || tool.name,
        inputSchema: tool.inputSchema,
        execute: async function (args, options) {
          if (tool.result !== undefined) {
            return { content: [{ type: "text", text: typeof tool.result === "string" ? tool.result : JSON.stringify(tool.result) }] };
          }
          try {
            var res = await fetch(WMCP + "/api/v1/tools/execute", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ url: SITE, tool: tool.name, args: args || {} }),
              signal: options && options.signal,
            });
            var data = await res.json();
            if (!res.ok || (data && data.error)) {
              var hint = res.status === 402 ? " (live browser actions require an authenticated backend integration; see https://wmcp.sh/managed)" : "";
              return { content: [{ type: "text", text: "wmcp.sh: " + ((data && data.error) || res.status) + hint }], isError: true };
            }
            return { content: [{ type: "text", text: typeof data.value === "string" ? data.value : JSON.stringify(data.value) }] };
          } catch (e) {
            return { content: [{ type: "text", text: "wmcp.sh tool error: " + String(e) }], isError: true };
          }
        },
        annotations: tool.result !== undefined ? { readOnlyHint: true } : { consequentialHint: true },
      }, { signal: ctl.signal });
    } catch (e) {
      if (!ctl.signal.aborted) console.warn("[wmcp.sh] WebMCP tool registration failed:", tool.name, e);
    }
    });
  })();
})();
`;
}

/** The dual-emit descriptor served at GET /api/v1/webmcp?url= — both protocols. */
export function bridgeDescriptor(siteUrl: string, tools: any[], origin: string) {
  let host = siteUrl;
  try { host = new URL(siteUrl).host.toLowerCase(); } catch {}
  const b64 = base64urlEncode(siteUrl);
  const eh = encodeURIComponent(host);
  return {
    site: siteUrl,
    host,
    tools_count: (tools || []).length,
    mcp: {
      url: `${origin}/mcp/u/${b64}`,
      transport: "streamable-http",
      note: "Point any MCP client (Claude / Cursor / Codex) at this URL — server-side MCP.",
    },
    webmcp: {
      script_url: `${origin}/webmcp/${b64}.js`,
      snippet: `<script src="${origin}/webmcp/${b64}.js" async></script>`,
      note: "Drop into a page you control for read-only tool snapshots. Authenticated live actions require a separate backend integration; a paid API plan does not automatically authenticate this script.",
    },
    grade: {
      report: `${origin}/mcp/grade/${eh}`,
      badge: `${origin}/mcp/grade/${eh}/badge.svg`,
    },
    tools: (tools || []).map((t) => ({ name: t.name, description: t.description, live: t.result === undefined })),
  };
}

// ---- The WebMCP hub: land-grab the in-browser side of the standard ----------
// Markets the one-line shim ("any site → agent tools via navigator.modelContext")
// with a live generator, and frames wmcp.sh as the default WebMCP supplier +
// directory. Pairs with /connect (the MCP hub) and /mcp/leaderboard (trust).
export function webmcpHubHtml(origin: string): string {
  const esc = (s: string) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" } as any)[c]);
  const example = "https://www.allbirds.com/products/mens-wool-runners";
  const exampleShim = `${origin}/webmcp/${base64urlEncode(example)}.js`;
  const ld = {
    "@context": "https://schema.org", "@type": "SoftwareApplication", name: "WebMCP read-tool shim by wmcp.sh",
    applicationCategory: "DeveloperApplication", operatingSystem: "Any", url: `${origin}/webmcp`,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, publisher: { "@type": "Organization", name: "wmcp.sh", url: origin },
  };
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>WebMCP — generate browser tool previews + MCP endpoints | wmcp.sh</title>
<meta name="description" content="Generate a read-tool WebMCP preview for a website you control and a server-side MCP endpoint. Authenticated live actions require an additional integration."/>
<link rel="canonical" href="${origin}/webmcp"/>
<meta property="og:title" content="WebMCP — make any website agent-ready in one line | wmcp.sh"/>
<meta property="og:description" content="One extraction produces a WebMCP read preview and an MCP endpoint. Paid live actions require authenticated integration."/>
<meta property="og:image" content="${origin}/og.png"/>
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<style>${uiCss(820)}
  .gen-lbl{font-size:.78rem;text-transform:uppercase;letter-spacing:.05em;color:var(--dim);margin:0 0 6px}
</style></head><body>
${uiNav(origin)}
<div class="wrap">
  <header class="hero">
    <p class="crumbs"><a href="${origin}/connect">The MCP hub</a> <span class="sep">›</span> WebMCP</p>
    <h1>Preview website tools in one line</h1>
    <p class="lede">WebMCP exposes a site's tools to in-browser AI agents through <code>document.modelContext</code>. Add the script to a page you control to expose read-tool snapshots. The same extraction emits a remote MCP endpoint. For live transactions, connect an authenticated backend instead of putting API keys in browser JavaScript.</p>
    <div class="pillrow">
      <a class="pill" href="${origin}/connect">🔌 The MCP hub</a>
      <a class="pill" href="${origin}/mcp/leaderboard">🛡️ Trust leaderboard</a>
      <a class="pill" href="${origin}/directory">📚 Directory</a>
    </div>
  </header>

  <section>
    <h2>Generate your shim</h2>
    <div class="card">
      <div class="gen-lbl">Your product / page URL</div>
      <input id="u" type="url" placeholder="https://yourstore.com/products/thing" value="${esc(example)}" />
      <div class="muted" style="font-size:.82rem;margin-top:14px">Paste this one line into your page &lt;head&gt;:</div>
      <pre class="snip" id="out" style="margin-top:8px">&lt;script src="${esc(exampleShim)}" defer&gt;&lt;/script&gt;</pre>
      <div class="muted" style="font-size:.8rem;margin-top:10px">Read tools use an embedded snapshot. This script alone does not authorize write actions. Never embed an API key in publicly served JavaScript.</div>
    </div>
  </section>

  <section>
    <h2>How it works</h2>
    <div class="grid c3">
      <div class="card step"><div class="n">1 · One extraction</div><p>wmcp.sh reads your page (JSON-LD, OpenAPI, Shopify, and more) and turns it into tools.</p></div>
      <div class="card step"><div class="n">2 · Dual-emit</div><p>The same tools serve as a WebMCP shim for in-browser agents and a server-side MCP endpoint for Claude, Cursor, and Codex.</p></div>
      <div class="card step"><div class="n">3 · Live integration</div><p>For purchases or other write actions, connect a server-side MCP client with a paid account, or request a custom integration.</p></div>
    </div>
  </section>

  <section>
    <h2>Why WebMCP</h2>
    <p class="muted" style="max-width:680px">WebMCP lets browser agents discover site-authored tools through <code>document.modelContext</code>. WMCP adds an adapter-based fallback for read discovery. Actual API calls remain governed by their own authentication and browser permissions.</p>
    <div class="row" style="margin-top:18px"><a class="btn btn-primary" href="${origin}/managed?source=webmcp">Get an agent-ready integration · from $499 →</a> <a class="btn" href="${origin}/pricing?source=webmcp">Self-serve API plans →</a></div>
  </section>

  ${adSlot()}

  <footer>
    <a href="${origin}/connect">The MCP hub</a><a href="${origin}/mcp/leaderboard">Trust leaderboard</a><a href="${origin}/directory">Directory</a><a href="${origin}/">wmcp.sh</a>
  </footer>
</div>
<script>
(function(){
  var u=document.getElementById("u"), out=document.getElementById("out"), origin=${JSON.stringify(origin)};
  function b64url(s){ try{ return btoa(unescape(encodeURIComponent(s))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""); }catch(e){ return ""; } }
  function render(){
    var v=(u.value||"").trim();
    try{ new URL(v); }catch(e){ out.textContent='<script src="'+origin+'/webmcp/<your-url>.js" defer><\\/script>'; return; }
    out.textContent='<script src="'+origin+'/webmcp/'+b64url(v)+'.js" defer><\\/script>';
  }
  u.addEventListener("input", render); render();
})();
</script>
</body></html>`;
}
