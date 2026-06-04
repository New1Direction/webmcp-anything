// alternatives_mcpservers.ts — SEO target: "mcpservers.org alternative",
// "mcp directory alternative", "awesome mcp servers alternative", "best mcp
// directory". Attacks the competitor on its weak spot: it's an undifferentiated
// list; wmcp grades every server A–F and watches for rug-pulls. Routes to the
// trust leaderboard + /connect (dev funnel).
import { uiCss, uiNav } from "./ui";

export function alternativesMcpserversHtml(origin: string): string {
  const canonical = `${origin}/alternatives/mcpservers-org`;
  const esc = (s: string) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" } as any)[c]);
  const rows: Array<[string, string, string]> = [
    ["Independent A–F trust grade per server", "✓ every server", "✗ — just a listing"],
    ["Security audit (OWASP MCP Top 10)", "✓", "✗"],
    ["Continuous rug-pull / drift watch", "✓ re-checked on a schedule", "✗ static entry"],
    ["Tells you which servers are safe to connect", "✓", "✗ you decide blind"],
    ["Browse / compare by category", "✓ ranked by trust", "✓ ranked by listing"],
    ["Connect & govern (OAuth proxy, kill-switch)", "✓ via /connect", "✗"],
    ["Turn any website into agent tools (WebMCP)", "✓", "✗ servers only"],
  ];
  const faqs: Array<[string, string]> = [
    ["What's the best mcpservers.org alternative?", "wmcp.sh. mcpservers.org is a directory — a list of MCP servers. wmcp.sh is a directory that independently grades every server A–F on security, spec conformance, reliability, and transparency, and re-checks them on a schedule for rug-pulls and tool drift. You don't just find a server, you find out whether it's safe to connect."],
    ["Is there an MCP directory that shows which servers are safe?", "Yes — the wmcp.sh trust leaderboard grades every MCP server A–F and flags rug-pulls (servers that silently change their tools after you connect). A plain directory like mcpservers.org or 'awesome MCP servers' lists servers but can't tell you which are trustworthy."],
    ["Is wmcp.sh free like mcpservers.org?", "The grades and the leaderboard are free and identical whether or not an operator pays. Paid tiers add continuous monitoring, the managed OAuth proxy, and the WebMCP API for turning any site into agent tools."],
  ];
  const ld = [
    { "@context": "https://schema.org", "@type": "Article", headline: "Best mcpservers.org alternative — the MCP directory that grades servers", description: "mcpservers.org lists MCP servers. wmcp.sh grades every one A–F for trust + safety and watches for rug-pulls.", author: { "@type": "Organization", name: "wmcp.sh" }, publisher: { "@type": "Organization", name: "wmcp.sh", url: origin }, mainEntityOfPage: canonical },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
  ];
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Best mcpservers.org Alternative — the MCP directory that grades servers | wmcp.sh</title>
<meta name="description" content="mcpservers.org and 'awesome MCP servers' lists tell you a server exists. wmcp.sh grades every MCP server A–F on security and watches for rug-pulls — so you know which are safe to connect. The MCP directory with trust built in."/>
<link rel="canonical" href="${canonical}"/>
<meta property="og:title" content="Best mcpservers.org alternative — graded, not just listed | wmcp.sh"/>
<meta property="og:image" content="${origin}/og.png"/>
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<style>${uiCss(900)}
  table.cmp{width:100%;border-collapse:collapse;margin:18px 0;font-size:.92rem}
  table.cmp th,table.cmp td{border:1px solid var(--border);padding:10px 12px;text-align:left}
  table.cmp th{background:var(--bg2)} table.cmp td:first-child{color:var(--muted)}
  table.cmp td.ours{color:var(--text);font-weight:600}
  .faq h3{margin:16px 0 4px;font-size:1rem} .faq p{color:var(--muted);margin:0}
</style></head><body>
${uiNav(origin)}
<div class="wrap">
  <header class="hero">
    <p class="crumbs"><a href="${origin}/connect">The MCP hub</a> <span class="sep">›</span> Alternatives <span class="sep">›</span> mcpservers.org</p>
    <h1>The mcpservers.org alternative that tells you which servers are <em>safe</em></h1>
    <p class="lede">mcpservers.org and the "awesome MCP servers" lists do one thing: show you a server exists. They can't tell you whether connecting it is safe — whether it'll quietly rug-pull its tools after you wire it into your agent. <a href="${origin}/mcp/leaderboard">wmcp.sh grades every MCP server A–F</a> on security, spec conformance, reliability, and transparency, and re-checks them on a schedule. A directory, plus the trust layer a list can't give you.</p>
    <div class="row">
      <a class="btn btn-primary" href="${origin}/mcp/leaderboard">Browse the trust leaderboard →</a>
      <a class="btn btn-ghost" href="${origin}/mcp/grade">Grade any server — free</a>
    </div>
  </header>
  <section style="padding-top:8px">
    <h2>wmcp.sh vs mcpservers.org</h2>
    <table class="cmp"><thead><tr><th></th><th>wmcp.sh</th><th>mcpservers.org</th></tr></thead><tbody>
    ${rows.map(([f, a, b]) => `<tr><td>${esc(f)}</td><td class="ours">${esc(a)}</td><td>${esc(b)}</td></tr>`).join("")}
    </tbody></table>
  </section>
  <section class="faq"><h2>FAQ</h2>${faqs.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join("")}</section>
  <footer>Browse the <a href="${origin}/mcp/leaderboard">trust-graded MCP directory</a> · <a href="${origin}/connect">connect &amp; govern a server</a> · turn any site into tools at <a href="${origin}/webmcp">WebMCP</a>.</footer>
</div></body></html>`;
}
