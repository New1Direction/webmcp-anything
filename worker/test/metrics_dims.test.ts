import { describe, it, expect } from "vitest";
import { pageBucket, sourceBucket } from "../src/metrics";

const url = (s: string) => new URL(s);

describe("pageBucket", () => {
  it("labels the key landing pages", () => {
    expect(pageBucket("/")).toBe("home");
    expect(pageBucket("/drops")).toBe("drops");
    expect(pageBucket("/drops/prismatic-evolutions-restock")).toBe("drops");
    expect(pageBucket("/guides/best-booster-boxes")).toBe("guides");
    expect(pageBucket("/mcp/leaderboard")).toBe("leaderboard");
    expect(pageBucket("/mcp/grade")).toBe("grade");
    expect(pageBucket("/pricing")).toBe("pricing");
    expect(pageBucket("/u/aHR0cHM6Ly9leA")).toBe("u");
    expect(pageBucket("/quickcatch")).toBe("quickcatch");
    expect(pageBucket("/some/unknown")).toBe("other");
  });

  it("ignores assets, API and machine endpoints", () => {
    expect(pageBucket("/api/v1/stats/public")).toBeNull();
    expect(pageBucket("/static/app.js")).toBeNull();
    expect(pageBucket("/x/logo.png")).toBeNull();
    expect(pageBucket("/robots.txt")).toBeNull();
    expect(pageBucket("/sitemap.xml")).toBeNull();
    expect(pageBucket("/favicon.ico")).toBeNull();
  });
});

describe("sourceBucket", () => {
  const u = url("https://wmcp.sh/drops");

  it("prefers an explicit utm_source/source tag", () => {
    expect(sourceBucket(undefined, url("https://wmcp.sh/?utm_source=reddit"), "")).toBe("reddit");
    expect(sourceBucket(undefined, url("https://wmcp.sh/?source=ext_paywall"), "")).toBe("extension");
  });

  it("classifies known referrers", () => {
    expect(sourceBucket("https://www.google.com/search?q=x", u, "")).toBe("google");
    expect(sourceBucket("https://www.reddit.com/r/PTCGL/", u, "")).toBe("reddit");
    expect(sourceBucket("https://t.co/abc", u, "")).toBe("x");
    expect(sourceBucket("https://news.ycombinator.com/", u, "")).toBe("hackernews");
  });

  it("separates bots from humans via user-agent", () => {
    expect(sourceBucket(undefined, u, "Mozilla/5.0 (compatible; Googlebot/2.1)")).toBe("bot");
    expect(sourceBucket(undefined, u, "GPTBot/1.0")).toBe("bot");
    expect(sourceBucket(undefined, u, "Mozilla/5.0 (Macintosh) Safari/605")).toBe("direct");
  });

  it("keeps the eTLD+1 for unknown referrers", () => {
    expect(sourceBucket("https://blog.someforum.io/thread", u, "")).toBe("someforum.io");
  });

  it("marks internal navigation", () => {
    expect(sourceBucket("https://wmcp.sh/guides", u, "")).toBe("internal");
  });
});
