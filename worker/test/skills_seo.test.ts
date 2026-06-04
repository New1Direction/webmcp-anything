// test/skills_seo.test.ts — the agent-skills SEO vertical.
import { describe, it, expect } from "vitest";
import {
  SKILL_DEFS, SKILL_SLUGS, SKILL_CATEGORIES, catSlug, skillBySlug, categoryBySlug,
  skillPageHtml, skillsIndexHtml,
} from "../src/skills_seo";

const origin = "https://wmcp.sh";

describe("agent-skills directory", () => {
  it("has unique slugs and resolvable categories", () => {
    expect(new Set(SKILL_SLUGS).size).toBe(SKILL_SLUGS.length);
    for (const c of SKILL_CATEGORIES) expect(categoryBySlug(catSlug(c))).toBe(c);
  });

  it("every skill page carries the funnel + correct SEO head", () => {
    for (const s of SKILL_DEFS) {
      const html = skillPageHtml(origin, s);
      // routes into the agent-capability stack (dev funnel)
      expect(html, s.slug).toContain("/mcp/leaderboard");
      expect(html, s.slug).toContain("/connect");
      // keyword-targeted title + canonical + schema
      expect(html, s.slug).toContain(`${s.name} — agent skill for Claude, Cursor`);
      expect(html, s.slug).toContain(`<link rel="canonical" href="${origin}/skills/${s.slug}"`);
      expect(html, s.slug).toContain('"@type":"HowTo"');
      expect(html, s.slug).toContain(`/skills/category/${catSlug(s.category)}`);
    }
  });

  it("index lists every skill + the category filter; category page filters", () => {
    const idx = skillsIndexHtml(origin);
    for (const s of SKILL_DEFS) expect(idx, s.slug).toContain(`/skills/${s.slug}`);
    expect(idx).toContain("Agent Skills directory");
    expect(idx).toContain(`<link rel="canonical" href="${origin}/skills"`);

    const cat = SKILL_CATEGORIES[0];
    const catHtml = skillsIndexHtml(origin, cat);
    const inCat = SKILL_DEFS.filter((s) => s.category === cat);
    const notInCat = SKILL_DEFS.filter((s) => s.category !== cat);
    for (const s of inCat) expect(catHtml, s.slug).toContain(`/skills/${s.slug}"`);
    // a skill from another category should not be carded on the filtered page
    if (notInCat.length) expect(catHtml).not.toContain(`/skills/${notInCat[0].slug}"`);
    expect(catHtml).toContain(`/skills/category/${catSlug(cat)}`);
  });

  it("skillBySlug round-trips", () => {
    expect(skillBySlug("docx")?.name).toBe("DOCX");
    expect(skillBySlug("nope")).toBeUndefined();
  });
});
