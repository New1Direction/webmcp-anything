// test/outreach.test.ts — the grade-graph → campaign generator.
import { describe, it, expect } from "vitest";
import { kvMock } from "./helpers";
import { generateOutreach } from "../src/outreach";

const ORIGIN = "https://wmcp.sh";

function seed() {
  const CACHE = kvMock();
  const put = (host: string, grade: string, score: number, cat: string, tc: number, findings: any[]) =>
    CACHE.put(`grade:${host}`, JSON.stringify({ grade, score, findings }), { metadata: { grade, score, category: cat, tools_count: tc } });
  put("mcp.payram.com", "F", 45, "Developer Tools", 49, [{ severity: "fail", owasp: "MCP08", detail: "Tool test_payram_connection references sensitive file paths / secrets (exfiltration surface)." }]);
  put("api.agentrapay.ai", "F", 45, "Finance & Crypto", 6, [{ severity: "fail", owasp: "MCP08", detail: "Tool agentra_authorize_payment references sensitive file paths / secrets (exfiltration surface)." }]);
  put("mcp.gapup.io", "A", 88, "Developer Tools", 271, [{ severity: "info", detail: "No blocking issues." }]);
  put("throwaway.vercel.app", "F", 40, "Developer Tools", 5, [{ severity: "fail", owasp: "MCP01", detail: "x" }]); // must be excluded
  return { CACHE } as any;
}

const noDashes = (s: string) => !/[—–]/.test(s); // no em-dash or en-dash

describe("outreach generator", () => {
  it("audit segment: low-grade commercial servers, real finding, no AI dashes", async () => {
    const out = await generateOutreach(seed(), "audit", 30, ORIGIN);
    expect(out.segment).toBe("audit");
    const hosts = out.rows.map((r) => r.host);
    expect(hosts).toContain("mcp.payram.com");
    expect(hosts).toContain("api.agentrapay.ai");
    expect(hosts).not.toContain("throwaway.vercel.app"); // throwaway excluded
    expect(hosts).not.toContain("mcp.gapup.io");          // A-grade not in audit
    for (const r of out.rows) {
      expect(noDashes(r.subject), `dash in subject: ${r.subject}`).toBe(true);
      expect(noDashes(r.body), `dash in body: ${r.host}`).toBe(true);
      expect(r.body).toContain(r.report_url);
      expect(r.report_url).toContain("/mcp/grade/");
      expect(r.finding.length).toBeGreaterThan(0);
    }
    // payments lead gets the payments-specific framing
    const pay = out.rows.find((r) => r.host === "api.agentrapay.ai")!;
    expect(pay.subject.toLowerCase()).toContain("payment");
  });

  it("verified segment: A-tier only, percentile + free-badge copy, no dashes", async () => {
    const out = await generateOutreach(seed(), "verified", 30, ORIGIN);
    const hosts = out.rows.map((r) => r.host);
    expect(hosts).toContain("mcp.gapup.io");
    expect(hosts).not.toContain("mcp.payram.com"); // F not in verified
    const g = out.rows.find((r) => r.host === "mcp.gapup.io")!;
    expect(noDashes(g.subject)).toBe(true);
    expect(noDashes(g.body)).toBe(true);
    expect(g.body.toLowerCase()).toContain("top ");      // percentile framing
    expect(g.body.toLowerCase()).toContain("free");       // free badge hook
    expect(g.subject).toContain("passed");
  });

  it("uses 'A to F' not 'A–F' (dash hygiene on the boilerplate)", async () => {
    const out = await generateOutreach(seed(), "verified", 5, ORIGIN);
    expect(out.rows[0].body).toContain("A to F");
    expect(out.rows[0].body).not.toContain("A–F");
  });
});
