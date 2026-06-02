import { describe, it, expect } from "vitest";
import { resaleCalculatorHtml, toolsIndexHtml, TOOL_SLUGS } from "../src/tools";

const origin = "https://wmcp.sh";

describe("free tools", () => {
  it("calculator: inputs, live checkout, lead capture, schema", () => {
    const html = resaleCalculatorHtml(origin);
    // calculator controls
    expect(html).toContain('id="retail"');
    expect(html).toContain('id="resale"');
    expect(html).toContain('id="preset"');
    expect(html).toContain('id="o-save"');
    // funnel
    expect(html).toContain(STORE());
    expect(html).toContain("/api/v1/leads");
    expect(html).toContain("/api/v1/stripe/checkout");
    expect(html).toContain('data-plan="pro"');
    expect(html).toContain('data-plan="reseller"');
    // schema
    expect(html).toContain('"@type":"WebApplication"');
    expect(html).toContain('"@type":"FAQPage"');
    expect(html).toContain('"@type":"BreadcrumbList"');
    expect(html).toContain(`<link rel="canonical" href="${origin}/tools/pokemon-resale-calculator" />`);
  });

  it("tools index lists the calculator", () => {
    const html = toolsIndexHtml(origin);
    expect(html).toContain(`${origin}/tools/pokemon-resale-calculator`);
    expect(TOOL_SLUGS).toContain("pokemon-resale-calculator");
  });
});

function STORE() {
  return "chromewebstore.google.com/detail/quickcatch";
}
