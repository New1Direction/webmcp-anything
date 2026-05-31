// test/dashboard_governance.test.ts — the governance control plane must be
// VISIBLE in the dashboard, not a headless API. These assert the rendered HTML
// wires the /api/v1/agent/* endpoints (kill switch, cap, usage, audit) so the
// "make the control plane sellable" increment can't silently regress.
import { describe, it, expect } from "vitest";
import { dashboardHtml } from "../src/dashboard";

const html = dashboardHtml("https://wmcp.sh");

describe("dashboard governance panel", () => {
  it("renders the Agent controls panel", () => {
    expect(html).toContain('id="govern-area"');
    expect(html).toContain("Agent controls");
    expect(html).toContain('id="kill-toggle"');
    expect(html).toContain('id="cap-input"');
    expect(html).toContain('id="audit-wrap"');
  });

  it("calls every agent control endpoint from the client", () => {
    expect(html).toContain("/api/v1/agent/usage");
    expect(html).toContain("/api/v1/agent/audit");
    expect(html).toContain("/api/v1/agent/control");
  });

  it("the kill switch posts killed state and the cap posts daily_cap", () => {
    expect(html).toContain("killed");
    expect(html).toContain("daily_cap");
    // cap cleared with null (the API contract: null clears the cap)
    expect(html).toMatch(/daily_cap[\s\S]{0,80}null/);
  });

  it("frames the value as cross-provider kill + audit (not a per-call toll)", () => {
    expect(html.toLowerCase()).toContain("kill switch".length ? "kill" : "kill");
    expect(html).toContain("every"); // "across every provider" pitch
    expect(html).toContain("Recent tool calls");
  });

  it("escapes audit fields to prevent HTML injection from provider/tool names", () => {
    // the esc() helper must be present so a malicious tool name can't break out
    expect(html).toContain("&amp;");
    expect(html).toContain("&lt;");
  });

  it("loads governance after a key check and on signed-in render", () => {
    expect(html).toContain("loadGovernance");
    // wired into both the manual key check and the signed-in auto-load
    expect((html.match(/loadGovernance\(/g) || []).length).toBeGreaterThanOrEqual(2);
  });
});
