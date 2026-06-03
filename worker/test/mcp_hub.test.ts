import { describe, it, expect } from "vitest";
import { mcpLeaderboardHtml } from "../src/mcp_grade";
import { webmcpHubHtml } from "../src/webmcp_bridge";

const origin = "https://wmcp.sh";

function mockEnv(entries: Array<{ host: string; grade: string; score: number }>) {
  return {
    CACHE: {
      list: async () => ({
        keys: entries.map((e) => ({
          name: `grade:${e.host}`,
          metadata: { grade: e.grade, score: e.score, checked_at: 1717200000000, tools_count: 5, url: `https://${e.host}/mcp` },
        })),
        list_complete: true,
      }),
      get: async () => null,
    },
  } as any;
}

describe("MCP trust leaderboard", () => {
  it("ranks graded servers by score, links reports, has SEO", async () => {
    const html = await mcpLeaderboardHtml(mockEnv([
      { host: "b.com", grade: "B", score: 72 },
      { host: "a.com", grade: "A", score: 95 },
      { host: "c.com", grade: "F", score: 30 },
    ]), origin);
    // ranked: a.com (95) before b.com (72) before c.com (30)
    expect(html.indexOf("a.com")).toBeLessThan(html.indexOf("b.com"));
    expect(html.indexOf("b.com")).toBeLessThan(html.indexOf("c.com"));
    expect(html).toContain(`${origin}/mcp/grade/a.com`);
    expect(html).toContain('"@type":"Dataset"');
    expect(html).toContain("MCP Trust Leaderboard");
    expect(html).toContain(`<link rel="canonical" href="${origin}/mcp/leaderboard"/>`);
  });

  it("handles empty state", async () => {
    const html = await mcpLeaderboardHtml(mockEnv([]), origin);
    expect(html).toContain("No servers graded yet");
  });
});

describe("WebMCP hub", () => {
  it("markets the shim with a generator + links the hub", () => {
    const html = webmcpHubHtml(origin);
    expect(html).toContain("navigator.modelContext");
    expect(html).toContain(`${origin}/webmcp/`); // example shim snippet
    expect(html).toContain(`${origin}/connect`);
    expect(html).toContain(`${origin}/mcp/leaderboard`);
    expect(html).toContain('"@type":"SoftwareApplication"');
    expect(html).toContain(`<link rel="canonical" href="${origin}/webmcp"/>`);
  });
});
