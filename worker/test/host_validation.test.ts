// test/host_validation.test.ts — the public-host predicate that keeps junk
// (localhost, private IPs, example.com, {template} vars) out of grade pages,
// the sitemap, and the leaderboard — plus the new /pricing page + grade-page
// conversion/GEO additions.
import { describe, it, expect } from "vitest";
import { isPublicGradableHost, isCommercialHost, gradePageHtml, type GradeResult } from "../src/mcp_grade";
import { pricingPageHtml } from "../src/pricing";

describe("isPublicGradableHost", () => {
  it("rejects loopback / private / link-local IPs", () => {
    for (const h of ["127.0.0.1", "10.77.88.99", "192.168.123.45", "172.16.0.1", "169.254.169.254", "0.0.0.0"]) {
      expect(isPublicGradableHost(h), h).toBe(false);
    }
  });
  it("rejects placeholders, reserved TLDs, and template vars", () => {
    for (const h of ["localhost", "example.com", "your-gateway.example.com", "mcp.local", "foo.internal", "{host}", "%7Bapi_host%7D", "mcp.{region}.ovhcloud.com", "{project_ref}.supabase.co", "[fd00::1234]", "::1", "single"]) {
      expect(isPublicGradableHost(h), h).toBe(false);
    }
  });
  it("accepts real public hosts and package subjects", () => {
    for (const h of ["mcp.sentry.dev", "mcp.deepwiki.com", "api.github.com", "your-company.com", "8.8.8.8", "npm:@scope/pkg", "pypi:somepkg", "gh:org/repo"]) {
      expect(isPublicGradableHost(h), h).toBe(true);
    }
  });
});

describe("isCommercialHost", () => {
  it("flags real business domains, not throwaways/packages", () => {
    expect(isCommercialHost("mcp.stripe.com")).toBe(true);
    expect(isCommercialHost("foo.vercel.app")).toBe(false);
    expect(isCommercialHost("npm:thing")).toBe(false);
  });
});

function grade(over: Partial<GradeResult>): GradeResult {
  return {
    url: "https://mcp.acmelabs.io/mcp", host: "mcp.acmelabs.io", checked_at: Date.now(),
    reachable: true, auth_required: false, grade: "A", score: 92, tools_count: 1,
    sub: { security: { score: 95, weight: 30, notes: [] } }, findings: [],
    ...over,
  };
}

describe("gradePageHtml — GEO + capture", () => {
  it("always emits a visible answer block + FAQPage schema", () => {
    const html = gradePageHtml(grade({}), "https://wmcp.sh");
    expect(html).toContain("Is the mcp.acmelabs.io MCP server safe to use?");
    expect(html).toContain('"@type":"FAQPage"');
  });
  it("shows the operator-capture block on low-graded commercial hosts only", () => {
    const low = gradePageHtml(grade({ grade: "F", score: 30, findings: [{ id: "x", severity: "fail", detail: "Tool poisoning risk" } as any] }), "https://wmcp.sh");
    expect(low).toContain("Send my findings");
    expect(low).toContain("package:'grade-audit'");
    const high = gradePageHtml(grade({ grade: "A", score: 92 }), "https://wmcp.sh");
    expect(high).not.toContain("Send my findings"); // capture block hidden on healthy grades (CSS class may still exist)
  });
});

describe("pricingPageHtml", () => {
  it("renders both locked ladders, keeps the grade free, self-canonicals", () => {
    const html = pricingPageHtml("https://wmcp.sh");
    for (const p of ["$39", "$99", "$299", "$499", "$999", "$4,999"]) expect(html, p).toContain(p);
    expect(html).toContain('rel="canonical" href="https://wmcp.sh/pricing"');
    expect(html.toLowerCase()).toContain("grade");
    expect(html).toContain('data-plan="builder"');
    // never invent prices outside the locked ladders
    for (const bad of ["$9/mo", "$19/mo", "$49/mo", "$29/mo"]) expect(html, bad).not.toContain(bad);
  });
});
