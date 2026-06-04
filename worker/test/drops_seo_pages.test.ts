import { describe, it, expect } from "vitest";
import {
  DROP_PAGES, DROP_SLUGS, dropPageHtml, dropsIndexHtml,
  LANGS, LOCALIZED_LANGS, LOCALIZABLE_SLUGS, isLocalizable, dropUrl,
} from "../src/drops_seo";

const origin = "https://wmcp.sh";

describe("drops SEO pages", () => {
  it("ships at least 100 pages", () => {
    expect(DROP_PAGES.length).toBeGreaterThanOrEqual(100);
  });

  it("has unique slugs", () => {
    expect(new Set(DROP_SLUGS).size).toBe(DROP_SLUGS.length);
  });

  it("every page carries the funnel: store link + lead form + Pro button", () => {
    for (const p of DROP_PAGES) {
      const html = dropPageHtml(origin, p);
      expect(html, p.slug).toContain("chromewebstore.google.com/detail/quickcatch");
      expect(html, p.slug).toContain('form class="lead capture"');
      expect(html, p.slug).toContain("/api/v1/leads");
      expect(html, p.slug).toContain('class="btn btn-ghost pro"');
    }
  });

  it("every page sells: Pro + Reseller buy buttons wired to live checkout", () => {
    for (const p of DROP_PAGES) {
      const html = dropPageHtml(origin, p);
      expect(html, p.slug).toContain('data-plan="pro"');
      expect(html, p.slug).toContain('data-plan="reseller"');
      expect(html, p.slug).toContain("/api/v1/stripe/checkout");
      expect(html, p.slug).toContain('id="pro"'); // pricing section anchor
      expect(html, p.slug).toContain("$99");
      expect(html, p.slug).toContain("$299");
    }
  });

  it("every page emits BreadcrumbList + SoftwareApplication schema + visual breadcrumbs", () => {
    for (const p of DROP_PAGES) {
      const html = dropPageHtml(origin, p);
      expect(html, p.slug).toContain('"@type":"BreadcrumbList"');
      expect(html, p.slug).toContain('"@type":"SoftwareApplication"');
      expect(html, p.slug).toContain('class="crumbs"');
    }
  });

  it("has glossary + best-of clusters", () => {
    expect(DROP_PAGES.some((p) => p.slug === "what-is-an-elite-trainer-box")).toBe(true);
    expect(DROP_PAGES.some((p) => p.slug === "best-pokemon-restock-trackers")).toBe(true);
    const best = DROP_PAGES.find((p) => p.slug === "best-pokemon-restock-trackers")!;
    expect(dropPageHtml(origin, best)).toContain('class="bestlist"');
  });

  it("every page has canonical, title, FAQ schema, and a non-trivial lede", () => {
    for (const p of DROP_PAGES) {
      const html = dropPageHtml(origin, p);
      expect(html, p.slug).toContain(`href="${origin}/drops/${p.slug}"`);
      expect(html, p.slug).toContain('"@type":"FAQPage"');
      expect(p.title.length, p.slug).toBeLessThanOrEqual(70);
      expect(p.lede.length, p.slug).toBeGreaterThan(80);
      expect(p.faqs.length, p.slug).toBeGreaterThanOrEqual(3);
    }
  });

  it("versus pages render a comparison table", () => {
    const vs = DROP_PAGES.filter((p) => p.kind === "versus");
    expect(vs.length).toBeGreaterThanOrEqual(20);
    for (const p of vs) {
      const html = dropPageHtml(origin, p);
      expect(html, p.slug).toContain('class="cmp"');
      expect(html, p.slug).toContain("QuickCatch vs");
    }
  });

  it("index lists every page and groups by category", () => {
    const idx = dropsIndexHtml(origin);
    for (const p of DROP_PAGES) {
      expect(idx, p.slug).toContain(`/drops/${p.slug}`);
    }
    for (const cat of ["TCG sets", "Stores", "vs Bots", "Guides"]) {
      expect(idx).toContain(cat);
    }
  });
});

describe("drops SEO localization", () => {
  const sample = () => {
    const pick = (kind: string) => DROP_PAGES.find((p) => p.kind === kind)!;
    return [pick("set"), pick("store"), pick("versus"), pick("combo")];
  };

  it("ships 11 localized languages plus English", () => {
    expect(LANGS).toEqual(["en", "es", "fr", "de", "pt", "it", "nl", "pl", "ja", "ko", "zh", "zh-Hant"]);
    expect(LOCALIZED_LANGS).toEqual(["es", "fr", "de", "pt", "it", "nl", "pl", "ja", "ko", "zh", "zh-Hant"]);
    expect(LOCALIZABLE_SLUGS.length).toBeGreaterThan(80);
  });

  it("localized pages: correct lang, localized URL, hreflang, funnel", () => {
    for (const lang of LOCALIZED_LANGS) {
      for (const p of sample()) {
        const html = dropPageHtml(origin, p, lang as any);
        const id = `${lang}/${p.slug}`;
        expect(html, id).toContain(`<html lang="${lang}">`);
        expect(html, id).toContain(`<link rel="canonical" href="${origin}/drops/${lang}/${p.slug}" />`);
        // hreflang for all 6 locales + x-default
        for (const l of LANGS) expect(html, id).toContain(`hreflang="${l}"`);
        expect(html, id).toContain('hreflang="x-default"');
        // funnel intact in every locale
        expect(html, id).toContain("chromewebstore.google.com/detail/quickcatch");
        expect(html, id).toContain('form class="lead capture"');
        expect(html, id).toContain("/api/v1/leads");
        expect(html, id).toContain('class="btn btn-ghost pro"');
        // FAQ schema present
        expect(html, id).toContain('"@type":"FAQPage"');
        expect(html, id).toContain(`"inLanguage":"${lang}"`);
      }
    }
  });

  it("localized text actually differs from English", () => {
    const setPage = DROP_PAGES.find((p) => p.kind === "set")!;
    const es = dropPageHtml(origin, setPage, "es" as any);
    const fr = dropPageHtml(origin, setPage, "fr" as any);
    const de = dropPageHtml(origin, setPage, "de" as any);
    expect(es).toContain("Preguntas frecuentes");
    expect(fr).toContain("Tous les guides");
    expect(de).toContain("So funktioniert QuickCatch");
  });

  it("versus pages keep the comparison table when localized", () => {
    const vs = DROP_PAGES.find((p) => p.kind === "versus")!;
    for (const lang of LOCALIZED_LANGS) {
      const html = dropPageHtml(origin, vs, lang as any);
      expect(html, lang).toContain('class="cmp"');
      expect(html, lang).toContain("QuickCatch vs");
    }
  });

  it("non-localizable guides fall back to English (no localized variant)", () => {
    const guide = DROP_PAGES.find((p) => p.kind === "guide" && !isLocalizable(p))!;
    expect(isLocalizable(guide)).toBe(false);
    const html = dropPageHtml(origin, guide, "es" as any);
    // canonical stays English, no hreflang alternates emitted
    expect(html).toContain(`<link rel="canonical" href="${origin}/drops/${guide.slug}" />`);
    expect(html).not.toContain('hreflang=');
  });

  it("localized index lists localizable pages and links localized URLs", () => {
    for (const lang of LOCALIZED_LANGS) {
      const idx = dropsIndexHtml(origin, lang as any);
      expect(idx, lang).toContain(`<html lang="${lang}">`);
      expect(idx, lang).toContain(`/drops/${lang}/`);
      // a sample localizable slug is present
      expect(idx, lang).toContain(dropUrl(lang as any, LOCALIZABLE_SLUGS[0]));
      // hreflang on the index too
      expect(idx, lang).toContain('hreflang="x-default"');
    }
  });

  it("localized pages also sell Pro + Reseller via live checkout", () => {
    const p = DROP_PAGES.find((x) => x.kind === "set")!;
    for (const lang of LOCALIZED_LANGS) {
      const html = dropPageHtml(origin, p, lang as any);
      expect(html, lang).toContain('data-plan="pro"');
      expect(html, lang).toContain('data-plan="reseller"');
      expect(html, lang).toContain("/api/v1/stripe/checkout");
      expect(html, lang).toContain("$299");
    }
  });

  it("dropUrl builds English and localized paths", () => {
    expect(dropUrl("en", "foo")).toBe("/drops/foo");
    expect(dropUrl("es", "foo")).toBe("/drops/es/foo");
  });
});
