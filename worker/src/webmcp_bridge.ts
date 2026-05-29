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
