// test/behavior.test.ts — behavioral trust v2 telemetry.
import { describe, it, expect } from "vitest";
import { recordToolCall, readBehavior, summarizeBehavior } from "../src/behavior";

function kv() {
  const store = new Map<string, string>();
  return {
    store,
    async get(k: string) { return store.has(k) ? store.get(k)! : null; },
    async put(k: string, v: string, _o?: any) { store.set(k, v); },
    async delete(k: string) { store.delete(k); },
  };
}
const HOST = "mcp.example.com";

describe("recordToolCall + summarizeBehavior", () => {
  it("aggregates calls/errors/latency per host and per tool", async () => {
    const env = { CACHE: kv() } as any;
    for (let i = 0; i < 6; i++) await recordToolCall(env, HOST, { tool: "get_price", ok: true, latency_ms: 100 + i });
    const rec = await readBehavior(env, HOST);
    expect(rec!.total_calls).toBe(6);
    expect(rec!.total_errors).toBe(0);
    expect(rec!.tools.get_price.calls).toBe(6);
    const s = summarizeBehavior(rec)!;
    expect(s.observed_calls).toBe(6);
    expect(s.tools_observed).toBe(1);
    expect(s.error_rate).toBe(0);
    expect(s.reliability_score).toBe(100); // fast + no errors
    expect(s.p50_ms).toBeGreaterThan(0);
  });

  it("returns null summary below the minimum-calls threshold (no penalty for blind spots)", async () => {
    const env = { CACHE: kv() } as any;
    for (let i = 0; i < 4; i++) await recordToolCall(env, HOST, { tool: "t", ok: true, latency_ms: 50 });
    expect(summarizeBehavior(await readBehavior(env, HOST))).toBeNull();
  });

  it("flags a flaky tool (>=25% errors over enough calls) + drops reliability", async () => {
    const env = { CACHE: kv() } as any;
    // 8 calls, 4 errors = 50% error rate.
    for (let i = 0; i < 8; i++) await recordToolCall(env, HOST, { tool: "add_to_cart", ok: i % 2 === 0, latency_ms: 200 });
    const s = summarizeBehavior(await readBehavior(env, HOST))!;
    expect(s.error_rate).toBeCloseTo(0.5, 1);
    expect(s.flaky.map((f) => f.tool)).toContain("add_to_cart");
    expect(s.reliability_score).toBeLessThan(60); // 100 - ~50 error penalty
  });

  it("penalizes slow p95 latency", async () => {
    const env = { CACHE: kv() } as any;
    for (let i = 0; i < 6; i++) await recordToolCall(env, HOST, { tool: "slow", ok: true, latency_ms: 9000 });
    const s = summarizeBehavior(await readBehavior(env, HOST))!;
    expect(s.error_rate).toBe(0);
    expect(s.reliability_score).toBeLessThanOrEqual(70); // -30 for p95 > 8s
  });

  it("caps latency samples so the KV record stays bounded", async () => {
    const env = { CACHE: kv() } as any;
    for (let i = 0; i < 50; i++) await recordToolCall(env, HOST, { tool: "x", ok: true, latency_ms: i });
    const rec = await readBehavior(env, HOST);
    expect(rec!.total_calls).toBe(50);       // counters keep counting
    expect(rec!.lat.length).toBeLessThanOrEqual(20); // but samples are capped
    expect(rec!.tools.x.lat.length).toBeLessThanOrEqual(20);
  });

  it("a KV failure is swallowed — telemetry never throws into the proxy", async () => {
    const env = { CACHE: { get: async () => { throw new Error("down"); }, put: async () => { throw new Error("down"); } } } as any;
    await expect(recordToolCall(env, HOST, { tool: "t", ok: true, latency_ms: 1 })).resolves.toBeUndefined();
  });

  it("records host-level calls even with no tool name", async () => {
    const env = { CACHE: kv() } as any;
    for (let i = 0; i < 5; i++) await recordToolCall(env, HOST, { ok: true, latency_ms: 30 });
    const s = summarizeBehavior(await readBehavior(env, HOST))!;
    expect(s.observed_calls).toBe(5);
    expect(s.tools_observed).toBe(0);
  });
});
