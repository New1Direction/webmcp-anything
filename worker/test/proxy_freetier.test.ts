// test/proxy_freetier.test.ts — the pricing flip: per-agent free-tier gate.
//
// Tested through the REAL resolveAuth (not a mock): proxyExecuteGate calls
// resolveAuth internally, so we set up genuine KV-backed key records + a bearer
// header and let auth resolve naturally. (Mocking a same-module internal call
// silently doesn't take — which is exactly the green-on-red the verify gate
// exists to catch; that's why the first cut of this file failed CI and wasn't
// merged.)
import { describe, it, expect } from "vitest";
import { proxyExecuteGate } from "../src/auth";

function kv(seed: Record<string, string> = {}) {
  const store = new Map(Object.entries(seed));
  return {
    store,
    async get(k: string) { return store.has(k) ? store.get(k)! : null; },
    async put(k: string, v: string, _o?: any) { store.set(k, v); },
    async delete(k: string) { store.delete(k); },
  };
}

const DAY = new Date().toISOString().slice(0, 10);

// Build a context whose internal resolveAuth() resolves to the given key+plan.
function ctx(opts: {
  key?: string;            // omit → no bearer → anonymous
  plan?: string;           // plan stored on the key record
  freePerDay?: string;     // PROXY_FREE_CALLS_PER_DAY
  usageSeed?: Record<string, string>;
}) {
  const KEYS = kv();
  if (opts.key) {
    KEYS.store.set(`key:${opts.key}`, JSON.stringify({
      user_id: "u", plan: opts.plan || "free", status: "active", created_at: 1,
    }));
  }
  const USAGE = kv(opts.usageSeed || {});
  const env: any = { KEYS, USAGE, ENVIRONMENT: "production" };
  if (opts.freePerDay !== undefined) env.PROXY_FREE_CALLS_PER_DAY = opts.freePerDay;

  const headers: Record<string, string> = {};
  let jsonBody: any = null, jsonStatus = 0, nexted = false;
  const c: any = {
    env,
    req: {
      header: (h: string) => (h.toLowerCase() === "authorization" && opts.key ? `Bearer ${opts.key}` : undefined),
      query: () => undefined,
      url: "https://wmcp.sh/mcp/stripe_mcp",
    },
    executionCtx: { waitUntil: (_p: Promise<unknown>) => {} },
    set: (_k: string, _v: any) => {},
    header: (k: string, v: string) => { headers[k] = v; },
    json: (b: any, s = 200) => { jsonBody = b; jsonStatus = s; return b; },
  };
  return {
    c,
    next: async () => { nexted = true; },
    get headers() { return headers; },
    get json() { return { body: jsonBody, status: jsonStatus }; },
    get nexted() { return nexted; },
  };
}

describe("proxyExecuteGate — pricing flip (per-agent free tier)", () => {
  it("default-off: free plan still 402s (non-breaking)", async () => {
    const t = ctx({ key: "agentA", plan: "free" }); // no PROXY_FREE_CALLS_PER_DAY
    await proxyExecuteGate()(t.c, t.next);
    expect(t.nexted).toBe(false);
    expect(t.json.status).toBe(402);
    expect(t.json.body.error).toBe("payment_required");
  });

  it("free tier ON: an exhausted agent gets 402 free_tier_exhausted", async () => {
    const t = ctx({ key: "agentA", plan: "free", freePerDay: "3", usageSeed: { [`freecall:agentA:${DAY}`]: "3" } });
    await proxyExecuteGate()(t.c, t.next);
    expect(t.nexted).toBe(false);
    expect(t.json.status).toBe(402);
    expect(t.json.body.error).toBe("free_tier_exhausted");
    expect(t.json.body.free_per_day).toBe(3);
  });

  it("free tier ON: an unused agent is allowed and surfaces remaining", async () => {
    const t = ctx({ key: "agentA", plan: "free", freePerDay: "10" });
    await proxyExecuteGate()(t.c, t.next);
    expect(t.nexted).toBe(true);
    expect(t.headers["x-webmcp-free-remaining"]).toBe("9");
  });

  it("PER-AGENT: one key exhausted does NOT block another key (the fleet point)", async () => {
    const a = ctx({ key: "agentA", plan: "free", freePerDay: "2", usageSeed: { [`freecall:agentA:${DAY}`]: "2" } });
    await proxyExecuteGate()(a.c, a.next);
    expect(a.nexted).toBe(false); // A is out
    const b = ctx({ key: "agentB", plan: "free", freePerDay: "2" });
    await proxyExecuteGate()(b.c, b.next);
    expect(b.nexted).toBe(true);  // B has its own allowance
  });

  it("paid plan passes through on its own quota (free tier irrelevant)", async () => {
    const t = ctx({ key: "paidkey", plan: "pro", freePerDay: "1" });
    await proxyExecuteGate()(t.c, t.next);
    expect(t.nexted).toBe(true);
    expect(t.headers["x-webmcp-plan"]).toBe("pro");
  });

  it("anonymous → 401 before any metering", async () => {
    const t = ctx({ plan: "free", freePerDay: "5" }); // no key → anon
    await proxyExecuteGate()(t.c, t.next);
    expect(t.nexted).toBe(false);
    expect(t.json.status).toBe(401);
  });
});
