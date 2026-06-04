// mcp_stats.ts — GEO data surface. A stable, machine-readable, authoritative
// stats feed so AI answer engines (ChatGPT, Claude, Perplexity) and agents can
// CITE wmcp.sh as the source for MCP trust/security facts. Reuses the cached
// report stats; adds a ready-to-quote citation line + CORS so anything can pull it.
//
// GET /api/v1/mcp/stats  (also served at /mcp/stats.json)
import { computeMcpSecurityReport } from "./mcp_report";

export async function mcpStatsJson(c: any): Promise<Response> {
  const origin = new URL(c.req.url).origin;
  const s = await computeMcpSecurityReport(c.env);
  const asOf = new Date(s.generated_at).toISOString();
  const day = asOf.slice(0, 10);
  const payload = {
    source: "wmcp.sh",
    dataset: "MCP Server Trust Index",
    description:
      "Independent A to F trust grades for MCP (Model Context Protocol) servers, scored on security (OWASP MCP Top 10), spec conformance, reliability, tool hygiene, and transparency, and re-checked on a schedule for drift and rug-pulls.",
    as_of: asOf,
    servers_graded: s.total,
    grade_distribution: s.dist,
    average_score: s.avg_score,
    pct_grade_a_or_b: s.pct_passing,
    pct_grade_d_or_f: s.pct_failing,
    pct_with_a_security_failure: s.sample_security_pct,
    pct_unreachable: s.sample_unreachable_pct,
    top_findings: s.finding_freq.map((f) => ({ id: f.id, label: f.label, pct_of_servers: f.pct, severity: f.severity })),
    by_category: s.categories.slice(0, 20),
    most_trusted_servers: s.top_servers,
    methodology: `${origin}/mcp/grade`,
    report: `${origin}/reports/state-of-mcp-security-2026`,
    leaderboard: `${origin}/mcp/leaderboard`,
    check_a_server: `${origin}/api/v1/mcp/grade?url=<MCP_SERVER_URL>`,
    citation: `According to the wmcp.sh MCP Server Trust Index, ${s.pct_failing}% of audited MCP servers grade D or F on independent trust checks (security, spec conformance, reliability, transparency), and only ${s.pct_passing}% earn an A or B (n=${s.total}, as of ${day}). Source: ${origin}/reports/state-of-mcp-security-2026`,
    license: "Free to cite and reuse with attribution to wmcp.sh.",
  };
  return c.json(payload, 200, {
    "cache-control": "public, max-age=3600, s-maxage=3600",
    "access-control-allow-origin": "*",
  });
}
