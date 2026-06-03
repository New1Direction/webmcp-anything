// webmcp_bridge.ts — the dual-emit MCP↔WebMCP bridge.
//
// From ONE extraction (resolveTools) we serve BOTH:
//   - the server-side MCP config (already shipped at /mcp/u/<b64url>), and
//   - a drop-in WebMCP shim (/webmcp/<b64url>.js) that loops the same
//     {name,description,inputSchema} tools into navigator.modelContext
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
  return `/* wmcp.sh WebMCP shim — exposes ${t.length} agent-callable tool(s) for ${siteUrl}
   to in-browser agents via navigator.modelContext (Chrome WebMCP origin trial).
   One line: <script src="${origin}/webmcp/${base64urlEncode(siteUrl)}.js" async></script>
   Read tools resolve instantly; live actions run through wmcp.sh (graded + metered). */
(function () {
  if (typeof navigator === "undefined" || !navigator.modelContext || typeof navigator.modelContext.registerTool !== "function") return;
  var WMCP = ${JSON.stringify(origin)};
  var SITE = ${JSON.stringify(siteUrl)};
  var TOOLS = ${JSON.stringify(t)};
  TOOLS.forEach(function (tool) {
    try {
      navigator.modelContext.registerTool({
        name: tool.name,
        description: tool.description || tool.name,
        inputSchema: tool.inputSchema,
        execute: async function (args) {
          if (tool.result !== undefined) {
            return { content: [{ type: "text", text: typeof tool.result === "string" ? tool.result : JSON.stringify(tool.result) }] };
          }
          try {
            var res = await fetch(WMCP + "/api/v1/tools/execute", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ url: SITE, tool: tool.name, args: args || {} }),
            });
            var data = await res.json();
            if (!res.ok || (data && data.error)) {
              var hint = res.status === 402 ? " (live actions need a wmcp.sh plan or x402 payment)" : "";
              return { content: [{ type: "text", text: "wmcp.sh: " + ((data && data.error) || res.status) + hint }], isError: true };
            }
            return { content: [{ type: "text", text: typeof data.value === "string" ? data.value : JSON.stringify(data.value) }] };
          } catch (e) {
            return { content: [{ type: "text", text: "wmcp.sh tool error: " + String(e) }], isError: true };
          }
        },
      });
    } catch (e) { /* one bad tool shouldn't break the rest */ }
  });
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
      note: "Drop into your page <head>. In-browser agents (Chrome WebMCP origin trial) get these tools via navigator.modelContext — no backend changes.",
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
    "@context": "https://schema.org", "@type": "SoftwareApplication", name: "WebMCP shim by wmcp.sh",
    applicationCategory: "DeveloperApplication", operatingSystem: "Any", url: `${origin}/webmcp`,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, publisher: { "@type": "Organization", name: "wmcp.sh", url: origin },
  };
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>WebMCP — make any website agent-ready in one line | wmcp.sh</title>
<meta name="description" content="WebMCP exposes a website's tools to in-browser AI agents via navigator.modelContext. Drop in one script tag and any site becomes agent-ready — the same tools also emit as a server-side MCP endpoint. Free."/>
<link rel="canonical" href="${origin}/webmcp"/>
<meta property="og:title" content="WebMCP — make any website agent-ready in one line | wmcp.sh"/>
<meta property="og:description" content="One script tag turns any site into agent-callable tools via navigator.modelContext. Dual-emits as MCP too."/>
<meta property="og:image" content="${origin}/og.png"/>
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<style>${uiCss(820)}
  .gen-lbl{font-size:.78rem;text-transform:uppercase;letter-spacing:.05em;color:var(--dim);margin:0 0 6px}
</style></head><body>
${uiNav(origin)}
<div class="wrap">
  <header class="hero">
    <p class="crumbs"><a href="${origin}/connect">The MCP hub</a> <span class="sep">›</span> WebMCP</p>
    <h1>Make any website agent-ready in one line</h1>
    <p class="lede">WebMCP exposes a site's tools to in-browser AI agents through <code>navigator.modelContext</code>. Drop in one script tag and your pages become agent-callable. The same extraction also emits a server-side MCP endpoint, so you cover both protocols from one source.</p>
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
      <div class="muted" style="font-size:.8rem;margin-top:10px">Read tools resolve instantly from the embedded extraction. Live actions route through wmcp.sh's graded, metered execute path.</div>
    </div>
  </section>

  <section>
    <h2>How it works</h2>
    <div class="grid c3">
      <div class="card step"><div class="n">1 · One extraction</div><p>wmcp.sh reads your page (JSON-LD, OpenAPI, Shopify, and more) and turns it into tools.</p></div>
      <div class="card step"><div class="n">2 · Dual-emit</div><p>The same tools serve as a WebMCP shim for in-browser agents and a server-side MCP endpoint for Claude, Cursor, and Codex.</p></div>
      <div class="card step"><div class="n">3 · Governed actions</div><p>Reads are free and instant. Live actions flow through the metered, graded execute path with kill switch and audit.</p></div>
    </div>
  </section>

  <section>
    <h2>Why WebMCP</h2>
    <p class="muted" style="max-width:680px">Browser agents are arriving, and they look for tools on the page via <code>navigator.modelContext</code>. Sites that expose tools get used by those agents; sites that don't are invisible to them. This is the cheapest way to be on the right side of that shift, and it doubles as a server-side MCP endpoint.</p>
    <div class="row" style="margin-top:18px"><a class="btn btn-primary" href="${origin}/connect">Grade, connect and build at the MCP hub →</a></div>
  </section>

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
