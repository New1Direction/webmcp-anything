// test/mcp_stats.test.ts — the GEO citable stats feed.
import { describe, it, expect } from "vitest";
import { kvMock, envMock, makeCtx } from "./helpers";
import { mcpStatsJson } from "../src/mcp_stats";

const REPORT_CACHE_KEY = "report:state-of-mcp-security:v3";

function seededEnv() {
  const CACHE = kvMock();
  // Seed the cached report so computeMcpSecurityReport returns it directly.
  CACHE.put(REPORT_CACHE_KEY, JSON.stringify({
    total: 6771, generated_at: Date.UTC(2026, 5, 4),
    dist: { A: 449, B: 1459, C: 1351, D: 1541, F: 1039 },
    avg_score: 62, pct_passing: 28, pct_failing: 38, pct_zero: 15,
    avg_tools: 12.3, pct_no_tools: 9, sample_size: 200,
    sample_unreachable_pct: 22, sample_security_pct: 41, sample_fail_pct: 70,
    categories: [{ name: "Developer Tools", count: 3200 }, { name: "Database", count: 700 }],
    finding_freq: [{ id: "tls", label: "No TLS / plaintext", pct: 30, severity: "fail" }],
    top_servers: [{ host: "usaspending.caseyjhand.com", grade: "A+", score: 96 }],
  }), {});
  return envMock({ CACHE });
}

describe("GEO stats feed", () => {
  it("emits a clean, citable JSON from the live report", async () => {
    const res = await mcpStatsJson(makeCtx({ env: seededEnv() }));
    const b = res.body;
    expect(b.source).toBe("wmcp.sh");
    expect(b.servers_graded).toBe(6771);
    expect(b.pct_grade_d_or_f).toBe(38);
    expect(b.pct_with_a_security_failure).toBe(41);
    expect(b.grade_distribution.F).toBe(1039);
    expect(Array.isArray(b.most_trusted_servers)).toBe(true);
    expect(b.methodology).toContain("/mcp/grade");
    expect(b.report).toContain("/reports/state-of-mcp-security-2026");
  });

  it("includes a ready-to-quote citation with the numbers + source", async () => {
    const res = await mcpStatsJson(makeCtx({ env: seededEnv() }));
    const cite = res.body.citation as string;
    expect(cite).toContain("41%");           // security-failure stat
    expect(cite).toContain("38%");           // D/F stat
    expect(cite).toContain("6771");          // n
    expect(cite.toLowerCase()).toContain("wmcp.sh");
    expect(cite).toContain("/reports/state-of-mcp-security-2026");
  });
});
