// test/control.test.ts — the per-agent control plane (meter + cap + kill + audit).
import { describe, it, expect } from "vitest";
import {
  checkAgentAllowed,
  recordProxyCall,
  setControl,
  getControl,
  getUsage,
  readAudit,
} from "../src/control";

function kv() {
  const store = new Map<string, string>();
  return {
    store,
    async get(k: string) { return store.has(k) ? store.get(k)! : null; },
    async put(k: string, v: string, _o?: any) { store.set(k, v); },
    async delete(k: string) { store.delete(k); },
  };
}
const U = "cust:abc";

describe("agent control plane", () => {
  it("is a no-op when no control is set (non-breaking)", async () => {
    const env = { KEYS: kv() } as any;
    const v = await checkAgentAllowed(env, U);
    expect(v.allowed).toBe(true);
  });

  it("kill switch → 403 across the board", async () => {
    const env = { KEYS: kv() } as any;
    await setControl(env, U, { killed: true });
    const v = await checkAgentAllowed(env, U);
    expect(v.allowed).toBe(false);
    if (!v.allowed) {
      expect(v.status).toBe(403);
      expect(v.body.error).toBe("agent_killed");
    }
  });

  it("unkill restores access", async () => {
    const env = { KEYS: kv() } as any;
    await setControl(env, U, { killed: true });
    await setControl(env, U, { killed: false });
    expect((await checkAgentAllowed(env, U)).allowed).toBe(true);
  });

  it("budget cap → 429 once the daily meter hits it", async () => {
    const env = { KEYS: kv() } as any;
    await setControl(env, U, { daily_cap: 3 });
    for (let i = 0; i < 3; i++) {
      expect((await checkAgentAllowed(env, U)).allowed).toBe(true);
      await recordProxyCall(env, U, { provider: "stripe_mcp", tool: "list_charges", status: 200 });
    }
    const v = await checkAgentAllowed(env, U);
    expect(v.allowed).toBe(false);
    if (!v.allowed) {
      expect(v.status).toBe(429);
      expect(v.body.error).toBe("budget_exceeded");
      expect(v.body.used).toBe(3);
      expect(v.body.daily_cap).toBe(3);
    }
  });

  it("daily_cap:null clears the cap", async () => {
    const env = { KEYS: kv() } as any;
    await setControl(env, U, { daily_cap: 1 });
    await recordProxyCall(env, U, { provider: "p", status: 200 });
    expect((await checkAgentAllowed(env, U)).allowed).toBe(false);
    await setControl(env, U, { daily_cap: 0 }); // 0/null clears
    expect((await getControl(env, U))!.daily_cap).toBeUndefined();
    expect((await checkAgentAllowed(env, U)).allowed).toBe(true);
  });

  it("records the meter + a capped, newest-first audit log", async () => {
    const env = { KEYS: kv() } as any;
    for (let i = 0; i < 4; i++) {
      await recordProxyCall(env, U, { provider: "neon", tool: `t${i}`, status: i === 3 ? 500 : 200 });
    }
    const usage = await getUsage(env, U);
    expect(usage.used_today).toBe(4);
    expect(usage.killed).toBe(false);
    expect(usage.daily_cap).toBeNull();
    const audit = await readAudit(env, U, 50);
    expect(audit.length).toBe(4);
    expect(audit[0].tool).toBe("t3");      // newest first
    expect(audit[0].ok).toBe(false);       // status 500
    expect(audit[3].tool).toBe("t0");
    expect(audit[3].ok).toBe(true);
  });

  it("audit log is capped at 100 entries", async () => {
    const env = { KEYS: kv() } as any;
    for (let i = 0; i < 130; i++) await recordProxyCall(env, U, { provider: "p", status: 200 });
    const audit = await readAudit(env, U, 1000);
    expect(audit.length).toBeLessThanOrEqual(100);
    const usage = await getUsage(env, U);
    expect(usage.used_today).toBe(130); // counter keeps counting beyond the audit cap
  });

  it("getUsage reports remaining against a cap", async () => {
    const env = { KEYS: kv() } as any;
    await setControl(env, U, { daily_cap: 10 });
    for (let i = 0; i < 4; i++) await recordProxyCall(env, U, { provider: "p", status: 200 });
    const usage = await getUsage(env, U);
    expect(usage.remaining).toBe(6);
  });

  it("a KV failure is swallowed — control never throws into the proxy", async () => {
    const env = { KEYS: { get: async () => { throw new Error("down"); }, put: async () => { throw new Error("down"); } } } as any;
    await expect(recordProxyCall(env, U, { provider: "p", status: 200 })).resolves.toBeUndefined();
    // checkAgentAllowed fails OPEN on a read error (spend control, not a security boundary).
    expect((await checkAgentAllowed(env, U)).allowed).toBe(true);
  });
});
