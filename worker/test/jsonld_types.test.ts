// test/jsonld_types.test.ts — the JSON-LD read tier must handle the schema.org
// types big sites actually ship, not just Product. The WebMCP extension reads
// this from the rendered page client-side, so broad type coverage is what makes
// "big sites work like a charm." Product path is asserted unchanged (regression).
import { describe, it, expect } from "vitest";
import * as jsonld from "../../adapters/jsonld.js";

async function run(items: any[], url = "https://example.com/x", meta: any = {}) {
  const ctx = jsonld.detect({ jsonld: items, meta, url, title: "T" });
  expect(ctx, "detect should match").toBeTruthy();
  const out = await jsonld.extract(ctx);
  return { names: out.tools.map((t: any) => t.name), tools: out.tools, info: out.product };
}

describe("jsonld adapter — schema.org type coverage", () => {
  it("Product still yields commerce tools (regression)", async () => {
    const { names, tools } = await run([{
      "@type": "Product", name: "Wool Runner", brand: { name: "Allbirds" },
      offers: { "@type": "Offer", price: "98", priceCurrency: "USD", availability: "https://schema.org/InStock" },
    }]);
    expect(names).toEqual(expect.arrayContaining(["get_product", "get_price", "check_stock"]));
    const price = tools.find((t: any) => t.name === "get_price");
    expect(price.result).toMatchObject({ price: "98", currency: "USD" });
  });

  it("NewsArticle → get_article with author + headline", async () => {
    const { names, info } = await run([{
      "@type": "NewsArticle", headline: "AI agents arrive",
      author: { "@type": "Person", name: "Jane Doe" }, datePublished: "2026-01-01",
      articleBody: "Long body ".repeat(2000),
    }]);
    expect(names).toContain("get_article");
    expect(info.headline).toBe("AI agents arrive");
    expect(info.author).toEqual(["Jane Doe"]);
    expect(info.body.length).toBeLessThan(4100); // clipped
  });

  it("Recipe → get_recipe with ingredients + steps", async () => {
    const { names, info } = await run([{
      "@type": "Recipe", name: "Chili", recipeIngredient: ["beans", "tomato"],
      recipeInstructions: [{ "@type": "HowToStep", text: "cook" }, "serve"],
    }]);
    expect(names).toContain("get_recipe");
    expect(info.ingredients).toEqual(["beans", "tomato"]);
    expect(info.instructions).toEqual(["cook", "serve"]);
  });

  it("Movie → get_title with cast + rating", async () => {
    const { names, info } = await run([{
      "@type": "Movie", name: "The Shawshank Redemption", datePublished: "1994-09-23",
      actor: [{ name: "Tim Robbins" }, { name: "Morgan Freeman" }],
      aggregateRating: { ratingValue: 9.3, ratingCount: 2800000 },
    }]);
    expect(names).toContain("get_title");
    expect(info.year).toBe("1994");
    expect(info.cast).toEqual(["Tim Robbins", "Morgan Freeman"]);
    expect(info.rating).toMatchObject({ value: "9.3" });
  });

  it("JobPosting → get_job with company + salary", async () => {
    const { names, info } = await run([{
      "@type": "JobPosting", title: "Staff Engineer",
      hiringOrganization: { name: "Acme" },
      baseSalary: { "@type": "MonetaryAmount", currency: "USD", value: { value: 220000, unitText: "YEAR" } },
      jobLocation: { address: { addressLocality: "SF", addressRegion: "CA" } },
    }]);
    expect(names).toContain("get_job");
    expect(info.company).toBe("Acme");
    expect(info.salary).toMatchObject({ amount: "220000", currency: "USD" });
    expect(info.location).toContain("SF");
  });

  it("Event → get_event with date + offers", async () => {
    const { names, info } = await run([{
      "@type": "MusicEvent", name: "Show", startDate: "2026-07-01T20:00",
      location: { "@type": "Place", name: "The Fillmore", address: "SF, CA" },
      offers: { "@type": "Offer", price: "45", priceCurrency: "USD", url: "https://tix" },
    }]);
    expect(names).toContain("get_event");
    expect(info.start_date).toBe("2026-07-01T20:00");
    expect(info.offers[0]).toMatchObject({ price: "45", currency: "USD" });
  });

  it("Restaurant (address-bearing) → get_business", async () => {
    const { names, info } = await run([{
      "@type": "Restaurant", name: "Gary Danko", telephone: "+1-415",
      address: { streetAddress: "800 N Point St", addressLocality: "SF" },
      servesCuisine: ["French"], aggregateRating: { ratingValue: 4.5 },
    }]);
    expect(names).toContain("get_business");
    expect(info.address).toContain("800 N Point St");
    expect(info.cuisine).toEqual(["French"]);
  });

  it("falls through (null) when there is no JSON-LD and no product meta", () => {
    expect(jsonld.detect({ jsonld: [], meta: {}, url: "https://x", title: "T" })).toBeNull();
  });
});
