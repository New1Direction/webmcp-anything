// test/proxy_freetier.test.ts — the pricing flip: per-agent free-tier gate.
import { describe, it, expect, vi } from "vitest";
import { proxyExecuteGate } from "../src/auth";

// Minimal Hono-ish context for the middleware. Tracks header() + json() + next().
function ctx(opts: { env: any; key?: string; plan: string; anonymous?: boolean }) {
  const headers: Record<string, string> = {};
  let jsonBody: any = null;
  let jsonStatus = 0;
  let nexted = false;
  const c: any = {
    env: opts.env,
    req: { header: () => undefined, query: () => undefined },
    executionCtx: { waitUntil: (_p: Promise<unknown>) => {} },
    set: (_k: string, _v: any) => {},
    header: (k: string, v: string) => { headers[k] = v; },
    json: (b: any, s = 200) => { jsonBody = b; jsonStatus = s; return { _json: b, _status: s }; },
    // proxyExecuteGate calls resolveAuth(c) — stub it by pre-seeding the bearer.
    __auth: { key: opts.key || "webmcp_live_k", plan: opts.plan, user_id: "u", anonymous: !!opts.anonymous },
  };
  return {
    c,
    next: async () => { nexted = true; },
    get headers() { return headers; },
    get json() { return { body: jsonBody, status: jsonStatus }; },
    get nexted() { return nexted; },
  };
}

// proxyExecuteGate calls resolveAuth internally; mock the module's resolveAuth
// to return our seeded auth so we exercise the gate logic in isolation.
vi.mock("../src/auth", async (importOriginal) => {
  const mod: any = await importOriginal();
  return { ...mod, resolveAuth: async (c: any) => c.__auth };
});

function kvWith(map: Record<string, string> = {}) {
  const store = new Map(Object.entries(map));
  return {
    store,
    async get(k: string) { return store.has(k) ? store.get(k)! : null; },
    async put(k: string, v: string) { store.set(k, v); },
  };
}

describe("proxyExecuteGate — pricing flip (per-agent free tier)", () => {
  it("default-off: free plan still 402s (non-breaking)", async () => {
    const t = ctx({ env: { USAGE: kvWith() }, plan: "free" });
    await proxyExecuteGate()(t.c, t.next);
    expect(t.nexted).toBe(false);
    expect(t.json.status).toBe(402);
    expect(t.json.body.error).toBe("payment_required");
  });

  it("free tier ON: free plan gets N calls then 402 free_tier_exhausted", async () => {
    const env = { USAGE: kvWith(), PROXY_FREE_CALLS_PER_DAY: "3" };
    const day = new Date().toISOString().slice(0, 10);
    // 3 allowed
    for (let i = 0; i < 3; i++) {
      const t = ctx({ env, key: "agentA", plan: "free" });
      await proxyExecuteGate()(t.c, t.next);
      expect(t.nexted).toBe(true);
      // simulate the waitUntil increment landing (gate uses waitUntil; force it)
      env.USAGE.store.set(`freecall:agentA:${day}`, String(i + 1));
    }
    // 4th blocked
    const t = ctx({ env, key: "agentA", plan: "free" });
    await proxyExecuteGate()(t.c, t.next);
    expect(t.nexted).toBe(false);
    expect(t.json.status).toBe(402);
    expect(t.json.body.error).toBe("free_tier_exhausted");
    expect(t.json.body.free_per_day).toBe(3);
  });

  it("PER-AGENT: a second key has its OWN free allowance (the fleet point)", async () => {
    const env = { USAGE: kvWith(), PROXY_FREE_CALLS_PER_DAY: "2" };
    const day = new Date().toISOString().slice(0, 10);
    // agentA exhausts its 2
    env.USAGE.store.set(`freecall:agentA:${day}`, "2");
    const a = ctx({ env, key: "agentA", plan: "free" });
    await proxyExecuteGate()(a.c, a.next);
    expect(a.nexted).toBe(false); // A is out
    // agentB is untouched — its own bucket
    const b = ctx({ env, key: "agentB", plan: "free" });
    await proxyExecuteGate()(b.c, b.next);
    expect(b.nexted).toBe(true); // B still has its allowance
  });

  it("paid plan: unaffected by the free tier (passes through on its own quota)", async () => {
    const env = { USAGE: kvWith(), PROXY_FREE_CALLS_PER_DAY: "1" };
    const t = ctx({ env, key: "paidkey", plan: "pro" });
    await proxyExecuteGate()(t.c, t.next);
    expect(t.nexted).toBe(true);
    expect(t.headers["x-webmcp-plan"]).toBe("pro");
  });

  it("anonymous → 401 before any metering", async () => {
    const t = ctx({ env: { USAGE: kvWith(), PROXY_FREE_CALLS_PER_DAY: "5" }, plan: "free", anonymous: true });
    await proxyExecuteGate()(t.c, t.next);
    expect(t.nexted).toBe(false);
    expect(t.json.status).toBe(401);
  });

  it("surfaces x-webmcp-free-remaining on an allowed free call", async () => {
    const env = { USAGE: kvWith(), PROXY_FREE_CALLS_PER_DAY: "10" };
    const t = ctx({ env, key: "agentA", plan: "free" });
    await proxyExecuteGate()(t.c, t.next);
    expect(t.nexted).toBe(true);
    expect(t.headers["x-webmcp-free-remaining"]).toBe("9");
  });
});
