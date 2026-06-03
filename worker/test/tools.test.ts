import { describe, it, expect } from "vitest";
import { resaleCalculatorHtml, gradingCalculatorHtml, toolsIndexHtml, TOOL_SLUGS, LOCALIZED_LANGS } from "../src/tools";

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

  it("calculator is localized into all 11 languages with funnel + hreflang", () => {
    for (const lang of LOCALIZED_LANGS) {
      const html = resaleCalculatorHtml(origin, lang as any);
      expect(html, lang).toContain(`<html lang="${lang}">`);
      expect(html, lang).toContain(`<link rel="canonical" href="${origin}/tools/${lang}/pokemon-resale-calculator" />`);
      for (const l of LOCALIZED_LANGS) expect(html, lang).toContain(`hreflang="${l}"`);
      expect(html, lang).toContain('hreflang="x-default"');
      // calculator + funnel intact in every locale
      expect(html, lang).toContain('id="o-save"');
      expect(html, lang).toContain("/api/v1/stripe/checkout");
      expect(html, lang).toContain("/api/v1/leads");
      expect(html, lang).toContain('data-plan="reseller"');
      expect(html, lang).toContain('"inLanguage":"' + lang + '"');
    }
  });

  it("grading ROI calculator: inputs, funnel, schema", () => {
    const html = gradingCalculatorHtml(origin);
    expect(html).toContain('id="raw"');
    expect(html).toContain('id="graded"');
    expect(html).toContain('id="g-roi"');
    expect(html).toContain("/api/v1/stripe/checkout");
    expect(html).toContain("/api/v1/leads");
    expect(html).toContain('data-plan="reseller"');
    expect(html).toContain('"@type":"WebApplication"');
    expect(html).toContain(`<link rel="canonical" href="${origin}/tools/pokemon-grading-calculator" />`);
    expect(TOOL_SLUGS).toContain("pokemon-grading-calculator");
  });

  it("localized text differs from English", () => {
    expect(resaleCalculatorHtml(origin, "es" as any)).toContain("Calculadora");
    expect(resaleCalculatorHtml(origin, "ja" as any)).toContain("計算機");
  });
});

function STORE() {
  return "chromewebstore.google.com/detail/quickcatch";
}
