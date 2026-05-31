// test/leads.test.ts — the buyer-finding funnel: ranked prospect scan.
import { describe, it, expect } from "vitest";
import { scoreLead, getLeads } from "../src/leads";

function baseLead(over: Partial<Parameters<typeof scoreLead>[0]> = {}) {
  return {
    user_id: "u1", email: "a@b.com", plan: "free", keys: 1,
    connections: [], calls_recent: 0, active_days: 0,
    cap_set: false, killed: false, last_call_ts: null,
    ...over,
  };
}

describe("scoreLead — warmth ranking", () => {
  it("a signed-up-but-idle account scores low", () => {
    const { score, why } = scoreLead(baseLead());
    expect(score).toBeLessThan(10);
    expect(why.join(" ")).toContain("no activity");
  });

  it("real proxy traffic dominates the score (the hot signal)", () => {
    const idle = scoreLead(baseLead()).score;
    const active = scoreLead(baseLead({ calls_recent: 500, active_days: 5 })).score;
    expect(active).toBeGreaterThan(idle + 40);
  });

  it("a FREE account with traffic + a cap outranks a PAID idle account", () => {
    const freeActive = scoreLead(baseLead({
      plan: "free", calls_recent: 200, active_days: 3, cap_set: true, connections: ["github", "linear"],
    })).score;
    const paidIdle = scoreLead(baseLead({ plan: "pro", calls_recent: 0 })).score;
    expect(freeActive).toBeGreaterThan(paidIdle);
  });

  it("setting a spend cap is a strong governance-intent signal", () => {
    const withCap = scoreLead(baseLead({ calls_recent: 50, cap_set: true })).score;
    const without = scoreLead(baseLead({ calls_recent: 50, cap_set: false })).score;
    expect(withCap - without).toBe(20);
    expect(scoreLead(baseLead({ cap_set: true })).why.join(" ")).toContain("spend cap");
  });

  it("multi-tool breadth counts; missing email is flagged", () => {
    const broad = scoreLead(baseLead({ connections: ["a", "b", "c"] }));
    expect(broad.why.join(" ")).toContain("3 tools");
    const noEmail = scoreLead(baseLead({ email: null }));
    expect(noEmail.why.join(" ")).toContain("no email");
  });
});

// In-memory KV stub matching the subset of KVNamespace getLeads uses.
function kv(map: Record<string, string> = {}) {
  const store = new Map(Object.entries(map));
  return {
    store,
    async get(k: string) { return store.has(k) ? store.get(k)! : null; },
    async put(k: string, v: string) { store.set(k, v); },
    async list({ prefix, limit }: { prefix: string; limit?: number }) {
      const keys = [...store.keys()].filter((k) => k.startsWith(prefix)).slice(0, limit || 1000).map((name) => ({ name }));
      return { keys, list_complete: true };
    },
  };
}

describe("getLeads — account scan + ranking", () => {
  const NOW = Date.parse("2026-05-30T00:00:00Z");
  const today = "2026-05-30";

  it("ranks an active free user above an idle paid user and attaches email", async () => {
    const KEYS = kv({
      "user:u_hot": JSON.stringify({ keys: ["k1"], plan: "free" }),
      "user:u_cold": JSON.stringify({ keys: ["k2"], plan: "pro", email: "cold@co.com" }),
      "email:hot@co.com": "u_hot",
      [`agentmeter:u_hot:${today}`]: "320",
      "agentctl:u_hot": JSON.stringify({ daily_cap: 1000 }),
      "conn:u_hot:github": "1",
      "conn:u_hot:linear": "1",
    });
    const { leads, scanned, hot } = await (async () => {
      const r = await getLeads({ KEYS } as any, { nowMs: NOW });
      return { ...r, hot: r.leads.filter((l) => l.score >= 30).length };
    })();
    expect(scanned).toBe(2);
    expect(leads[0].user_id).toBe("u_hot");      // active free beats idle paid
    expect(leads[0].email).toBe("hot@co.com");   // pulled from reverse email index
    expect(leads[0].calls_recent).toBe(320);
    expect(leads[0].connections.sort()).toEqual(["github", "linear"]);
    expect(leads[0].cap_set).toBe(true);
    expect(hot).toBeGreaterThanOrEqual(1);
  });

  it("sums proxy traffic across the window and counts active days", async () => {
    const KEYS = kv({
      "user:u1": JSON.stringify({ keys: ["k"], plan: "free" }),
      [`agentmeter:u1:2026-05-30`]: "10",
      [`agentmeter:u1:2026-05-29`]: "5",
      [`agentmeter:u1:2026-05-20`]: "100", // inside 14d window
      [`agentmeter:u1:2026-05-01`]: "999", // OUTSIDE 14d window — must not count
    });
    const { leads } = await getLeads({ KEYS } as any, { nowMs: NOW, windowDays: 14 });
    expect(leads[0].calls_recent).toBe(115); // 10+5+100, not 999
    expect(leads[0].active_days).toBe(3);
  });

  it("an account with no activity still appears (as a cold lead)", async () => {
    const KEYS = kv({ "user:u_new": JSON.stringify({ keys: [], plan: "free" }) });
    const { leads } = await getLeads({ KEYS } as any, { nowMs: NOW });
    expect(leads).toHaveLength(1);
    expect(leads[0].calls_recent).toBe(0);
    expect(leads[0].why.join(" ")).toContain("no activity");
  });
});
