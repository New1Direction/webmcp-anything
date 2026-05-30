// test/behavior_grade.test.ts — behavioral overlay is applied by recordGrade.
import { describe, it, expect } from "vitest";
import { recordToolCall } from "../src/behavior";
import { recordGrade, readGrade, type GradeResult } from "../src/mcp_grade";

function kv() {
  const store = new Map<string, string>();
  return {
    store,
    async get(k: string) { return store.has(k) ? store.get(k)! : null; },
    async put(k: string, v: string, _o?: any) { store.set(k, v); },
    async delete(k: string) { store.delete(k); },
    async list({ prefix = "" } = {}) { return { keys: [...store.keys()].filter((k) => k.startsWith(prefix)).map((name) => ({ name })) }; },
  };
}

const HOST = "mcp.example.com";
function baseGrade(): GradeResult {
  return {
    url: `https://${HOST}/mcp`, host: HOST, checked_at: Date.now(), reachable: true, auth_required: false,
    grade: "B", score: 84, tools_count: 2,
    sub: {
      spec: { score: 100, weight: 20, notes: [] },
      security: { score: 100, weight: 30, notes: [] },
      reliability: { score: 80, weight: 20, notes: ["single-probe latency 500ms (PRELIMINARY)"] },
      hygiene: { score: 70, weight: 15, notes: [] },
      transparency: { score: 70, weight: 15, notes: [] },
    },
    findings: [], tool_sigs: { a: "1", b: "2" },
  };
}

describe("recordGrade behavioral overlay (v2)", () => {
  it("leaves the grade untouched when no traffic has been observed", async () => {
    const env = { CACHE: kv() } as any;
    await recordGrade(env, baseGrade());
    const g = await readGrade(env, HOST);
    expect(g!.behavioral).toBeUndefined();
    expect(g!.sub.reliability.notes[0]).toContain("PRELIMINARY");
  });

  it("replaces single-probe reliability with OBSERVED reliability once traffic exists", async () => {
    const env = { CACHE: kv() } as any;
    // 6 clean fast calls → observed reliability should be ~100.
    for (let i = 0; i < 6; i++) await recordToolCall(env, HOST, { tool: "get_price", ok: true, latency_ms: 120 });
    await recordGrade(env, baseGrade());
    const g = await readGrade(env, HOST);
    expect(g!.behavioral).toBeTruthy();
    expect(g!.behavioral!.observed_calls).toBe(6);
    expect(g!.sub.reliability.score).toBe(100);          // observed, not the 80 probe
    expect(g!.sub.reliability.notes[0]).toContain("OBSERVED");
    // composite re-scores from the sub-scores with observed reliability=100:
    // (spec100·20 + sec100·30 + rel100·20 + hyg70·15 + trans70·15)/100 = 91.
    expect(g!.score).toBe(91);
  });

  it("surfaces a flaky tool as a behavioral finding and lowers reliability", async () => {
    const env = { CACHE: kv() } as any;
    for (let i = 0; i < 8; i++) await recordToolCall(env, HOST, { tool: "add_to_cart", ok: i % 2 === 0, latency_ms: 300 });
    await recordGrade(env, baseGrade());
    const g = await readGrade(env, HOST);
    expect(g!.sub.reliability.score).toBeLessThan(80);
    expect(g!.findings.some((f) => f.id === "flaky_tool" && f.detail.includes("add_to_cart"))).toBe(true);
  });
});
