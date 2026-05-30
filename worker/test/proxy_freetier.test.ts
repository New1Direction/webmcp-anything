// test/proxy_freetier.test.ts — the pricing flip: per-agent free-tier gate.
//
// These tests drive the REAL resolveAuth + REAL proxyExecuteGate end-to-end.
// We do NOT vi.mock resolveAuth: proxyExecuteGate calls it via an in-module
// reference, so a module mock silently no-ops (the bug that shipped a red test
// to main). Instead we seed exactly what resolveAuth reads — an Authorization:
// Bearer <key> header plus a `key:<key>` record in the KEYS KV — so the auth a
// real request would resolve is the auth the gate sees.
import { describe, it, expect } from "vitest";
import { proxyExecuteGate } from "../src/auth";

function kvWith(map: Record<string, string> = {}) {
  const store = new Map(Object.entries(map));
  return {
    store,
    async get(k: string) { return store.has(k) ? store.get(k)! : null; },
    async put(k: string, v: string) { store.set(k, v); },
  };
}

// Build an env whose KEYS KV holds an active record per (key -> plan), so the
// real resolveAuth recognises each bearer key with the right plan.
function mkEnv(opts: { keys?: Record<string, string>; free?: string; usage?: Record<string, string> }) {
  const keyMap: Record<string, string> = {};
  for (const [k, plan] of Object.entries(opts.keys || {})) {
    keyMap[`key:${k}`] = JSON.stringify({ user_id: `u_${k}`, plan, status: "active", created_at: 0 });
  }
  const env: any = {
    KEYS: kvWith(keyMap),
    USAGE: kvWith(opts.usage || {}),
    ENVIRONMENT: "production",
  };
  if (opts.free != null) env.PROXY_FREE_CALLS_PER_DAY = opts.free;
  return env;
}

// Minimal Hono-ish context. The bearer key (if any) is exposed via req.header
// exactly as a real Authorization header would be, so bearer()/resolveAuth read it.
function ctx(opts: { env: any; key?: string }) {
  const headers: Record<string, string> = {};
  const reqHeaders: Record<string, string> = {};
  if (opts.key) reqHeaders["authorization"] = `Bearer ${opts.key}`;
  let jsonBody: any = null;
  let jsonStatus = 0;
  let nexted = false;
  const c: any = {
    env: opts.env,
    req: {
      header: (name?: string) => (name ? reqHeaders[name.toLowerCase()] : undefined),
      query: () => undefined,
    },
    executionCtx: { waitUntil: (_p: Promise<unknown>) => {} },
    set: (_k: string, _v: any) => {},
    header: (k: string, v: string) => { headers[k] = v; },
    json: (b: any, s = 200) => { jsonBody = b; jsonStatus = s; return { _json: b, _status: s }; },
  };
  return {
    c,
    next: async () => { nexted = true; },
    get headers() { return headers; },
    get json() { return { body: jsonBody, status: jsonStatus }; },
    get nexted() { return nexted; },
  };
}

const DAY = new Date().toISOString().slice(0, 10);

describe("proxyExecuteGate — pricing flip (per-agent free tier)", () => {
  it("default-off: free plan still 402s (non-breaking)", async () => {
    const env = mkEnv({ keys: { agentA: "free" } }); // PROXY_FREE_CALLS_PER_DAY unset
    const t = ctx({ env, key: "agentA" });
    await proxyExecuteGate()(t.c, t.next);
    expect(t.nexted).toBe(false);
    expect(t.json.status).toBe(402);
    expect(t.json.body.error).toBe("payment_required");
  });

  it("free tier ON: free plan gets N calls then 402 free_tier_exhausted", async () => {
    const env = mkEnv({ keys: { agentA: "free" }, free: "3" });
    // 3 allowed
    for (let i = 0; i < 3; i++) {
      const t = ctx({ env, key: "agentA" });
      await proxyExecuteGate()(t.c, t.next);
      expect(t.nexted).toBe(true);
      // simulate the waitUntil increment landing (gate increments via waitUntil; force it)
      env.USAGE.store.set(`freecall:agentA:${DAY}`, String(i + 1));
    }
    // 4th blocked
    const t = ctx({ env, key: "agentA" });
    await proxyExecuteGate()(t.c, t.next);
    expect(t.nexted).toBe(false);
    expect(t.json.status).toBe(402);
    expect(t.json.body.error).toBe("free_tier_exhausted");
    expect(t.json.body.free_per_day).toBe(3);
  });

  it("PER-AGENT: a second key has its OWN free allowance (the fleet point)", async () => {
    const env = mkEnv({ keys: { agentA: "free", agentB: "free" }, free: "2" });
    // agentA exhausts its 2
    env.USAGE.store.set(`freecall:agentA:${DAY}`, "2");
    const a = ctx({ env, key: "agentA" });
    await proxyExecuteGate()(a.c, a.next);
    expect(a.nexted).toBe(false); // A is out
    // agentB is untouched — its own bucket
    const b = ctx({ env, key: "agentB" });
    await proxyExecuteGate()(b.c, b.next);
    expect(b.nexted).toBe(true); // B still has its allowance
  });

  it("paid plan: unaffected by the free tier (passes through on its own quota)", async () => {
    const env = mkEnv({ keys: { paidkey: "pro" }, free: "1" });
    const t = ctx({ env, key: "paidkey" });
    await proxyExecuteGate()(t.c, t.next);
    expect(t.nexted).toBe(true);
    expect(t.headers["x-webmcp-plan"]).toBe("pro");
  });

  it("anonymous → 401 before any metering", async () => {
    const env = mkEnv({ free: "5" }); // no keys seeded
    const t = ctx({ env }); // no bearer → resolveAuth returns anonymous
    await proxyExecuteGate()(t.c, t.next);
    expect(t.nexted).toBe(false);
    expect(t.json.status).toBe(401);
  });

  it("surfaces x-webmcp-free-remaining on an allowed free call", async () => {
    const env = mkEnv({ keys: { agentA: "free" }, free: "10" });
    const t = ctx({ env, key: "agentA" });
    await proxyExecuteGate()(t.c, t.next);
    expect(t.nexted).toBe(true);
    expect(t.headers["x-webmcp-free-remaining"]).toBe("9");
  });
});
