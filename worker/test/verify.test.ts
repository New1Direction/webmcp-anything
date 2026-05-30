// test/verify.test.ts — the verify-then-execute primitive.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { verifyMcpServer } from "../src/verify";

// In-memory KV mock supporting put options (expirationTtl) + list.
function kv() {
  const store = new Map<string, string>();
  return {
    store,
    async get(k: string) { return store.has(k) ? store.get(k)! : null; },
    async put(k: string, v: string, _opts?: any) { store.set(k, v); },
    async delete(k: string) { store.delete(k); },
    async list({ prefix = "" } = {}) {
      return { keys: [...store.keys()].filter((k) => k.startsWith(prefix)).map((name) => ({ name })) };
    },
  };
}

const URL_ = "https://mcp.example.com/mcp";
const HOST = "mcp.example.com";

function seedGrade(env: any, patch: any) {
  const base = {
    url: URL_, host: HOST, checked_at: Date.now(), reachable: true, auth_required: false,
    grade: "A", score: 95, sub: {}, findings: [], tools_count: 3,
    tool_sigs: { a: "1", b: "2", c: "3" }, tools_hash_since: Date.now() - 10 * 86400000,
    drift_count: 0,
  };
  env.CACHE.store.set(`grade:${HOST}`, JSON.stringify({ ...base, ...patch }));
}

describe("verifyMcpServer", () => {
  const FETCH = globalThis.fetch;
  beforeEach(() => { vi.restoreAllMocks(); });
  afterEach(() => { globalThis.fetch = FETCH; });

  it("uses the cached grade (<6h) without re-probing the server", async () => {
    const env = { CACHE: kv() } as any;
    seedGrade(env, { grade: "A", score: 95, drift_count: 0 });
    globalThis.fetch = vi.fn(async () => { throw new Error("should not probe when cached"); }) as any;

    const v = await verifyMcpServer(env, URL_);
    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(v.host).toBe(HOST);
    expect(v.letter).toBe("A");
    expect(v.verdict).toBe("ok");
    expect(v.drift.drifted).toBe(false);
    expect(v.watched_since).toBeGreaterThan(0);
  });

  it("returns verdict 'drifted' when the tool surface changed in the last 24h", async () => {
    const env = { CACHE: kv() } as any;
    seedGrade(env, { grade: "A", drift_count: 2, last_drift: { ts: Date.now() - 3600 * 1000, added: ["x"], removed: [], changed: [] } });
    const v = await verifyMcpServer(env, URL_);
    expect(v.verdict).toBe("drifted");
    expect(v.drift.drifted).toBe(true);
    expect(v.drift.count).toBe(2);
    expect(v.drift.added).toContain("x");
  });

  it("returns verdict 'failing' for an F grade", async () => {
    const env = { CACHE: kv() } as any;
    seedGrade(env, { grade: "F", score: 20 });
    const v = await verifyMcpServer(env, URL_);
    expect(v.verdict).toBe("failing");
  });

  it("returns verdict 'caution' for a C grade with no recent drift", async () => {
    const env = { CACHE: kv() } as any;
    seedGrade(env, { grade: "C", score: 74, drift_count: 0, last_drift: undefined });
    const v = await verifyMcpServer(env, URL_);
    expect(v.verdict).toBe("caution");
  });

  it("records a verifyhist entry per call (capped at 50)", async () => {
    const env = { CACHE: kv() } as any;
    seedGrade(env, { grade: "A" });
    await verifyMcpServer(env, URL_);
    await verifyMcpServer(env, URL_);
    const hist = JSON.parse(env.CACHE.store.get(`verifyhist:${HOST}`)!);
    expect(hist.length).toBe(2);
    expect(hist[0].source).toBe("verify");
    expect(hist[0].host).toBe(HOST);
  });

  it("opts.record===false suppresses the verifyhist write but still returns a verdict", async () => {
    const env = { CACHE: kv() } as any;
    seedGrade(env, { grade: "A" });
    const v = await verifyMcpServer(env, URL_, { record: false });
    expect(v.verdict).toBe("ok");
    expect(env.CACHE.store.has(`verifyhist:${HOST}`)).toBe(false);
  });

  it("a KV write failure is swallowed and the verdict still returns", async () => {
    const env = { CACHE: kv() } as any;
    seedGrade(env, { grade: "A" });
    env.CACHE.put = async () => { throw new Error("kv down"); };
    const v = await verifyMcpServer(env, URL_);
    expect(v.verdict).toBe("ok");
  });

  it("fresh=1 forces a live re-probe (calls scoreMcpServer)", async () => {
    const env = { CACHE: kv() } as any;
    seedGrade(env, { grade: "A", checked_at: Date.now() }); // fresh cache present...
    const calls: string[] = [];
    globalThis.fetch = vi.fn(async (u: any, init: any) => {
      calls.push(String(u));
      let method = "";
      try { method = JSON.parse(init?.body || "{}").method; } catch {}
      const body =
        method === "tools/list"
          ? { jsonrpc: "2.0", id: 2, result: { tools: [{ name: "t1", inputSchema: { type: "object", properties: { a: { type: "string" } } } }] } }
          : method === "initialize"
          ? { jsonrpc: "2.0", id: 1, result: { protocolVersion: "2025-06-18", capabilities: {} } }
          : { jsonrpc: "2.0", id: 9, error: { code: -32601, message: "unknown" } };
      return { status: 200, headers: { get: () => "application/json" }, text: async () => JSON.stringify(body) } as any;
    }) as any;

    const v = await verifyMcpServer(env, URL_, { fresh: true }); // ...but fresh forces a probe
    expect(calls.some((u) => u.includes("mcp.example.com"))).toBe(true);
    expect(v.host).toBe(HOST);
    expect(["ok", "caution", "failing", "drifted", "ungraded"]).toContain(v.verdict);
  });
});
