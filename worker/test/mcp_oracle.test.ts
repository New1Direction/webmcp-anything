// test/mcp_oracle.test.ts — the agent-callable trust oracle + registry seed.
import { describe, it, expect, vi, afterEach } from "vitest";
import { oracleHandler } from "../src/mcp_oracle";
import { seedRegistryGrades, readGrade } from "../src/mcp_grade";
import { kvMock, makeCtx } from "./helpers";

afterEach(() => vi.unstubAllGlobals());

const reply = (obj: any, status = 200) => ({
  status, ok: status < 400, headers: new Headers({ "content-type": "application/json" }),
  text: async () => JSON.stringify(obj), json: async () => obj,
});
// Mock that answers both the MCP handshake (any server URL) and the registry API.
function mockWorld(opts: { registry?: any; tools?: any[] } = {}) {
  const tools = opts.tools ?? [{ name: "do_thing", description: "Does a thing.", inputSchema: { type: "object", properties: { x: { type: "string" } } } }];
  vi.stubGlobal("fetch", vi.fn(async (url: any, init: any) => {
    const u = String(url);
    if (u.includes("registry.modelcontextprotocol.io")) return reply(opts.registry ?? { servers: [], metadata: {} });
    if (u.includes("/.well-known/")) return { ok: false, status: 404, headers: new Headers(), text: async () => "{}" };
    const body = init?.body ? JSON.parse(init.body) : {};
    if (body.method === "initialize") return reply({ jsonrpc: "2.0", id: 1, result: { protocolVersion: "2025-06-18", capabilities: {} } });
    if (body.method === "tools/list") return reply({ jsonrpc: "2.0", id: 2, result: { tools } });
    return reply({ jsonrpc: "2.0", id: body.id, error: { code: -32601, message: "nope" } });
  }));
}
const post = (env: any, msg: any) => makeCtx({ env, method: "POST", body: msg });

describe("trust oracle (MCP server)", () => {
  it("initialize echoes a supported protocol version + advertises tools", async () => {
    const env: any = { CACHE: kvMock() };
    const res = await oracleHandler(post(env, { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18" } }));
    expect(res.body.result.protocolVersion).toBe("2025-06-18");
    expect(res.body.result.capabilities.tools).toBeDefined();
  });

  it("tools/list returns grade + drift + verify tools", async () => {
    const env: any = { CACHE: kvMock() };
    const res = await oracleHandler(post(env, { jsonrpc: "2.0", id: 2, method: "tools/list" }));
    const names = res.body.result.tools.map((t: any) => t.name);
    expect(names).toEqual(["grade_mcp_server", "check_mcp_drift", "verify_before_execute"]);
  });

  it("verify_before_execute returns a verdict from the cached grade (no probe)", async () => {
    const env: any = { CACHE: kvMock() };
    await env.CACHE.put("grade:mcp.cached.com", JSON.stringify({
      url: "https://mcp.cached.com/mcp", host: "mcp.cached.com", checked_at: Date.now(),
      reachable: true, auth_required: false, grade: "A", score: 95, sub: {}, findings: [],
      tools_count: 2, tool_sigs: { a: "1", b: "2" }, tools_hash_since: Date.now() - 5 * 86400000, drift_count: 0,
    }));
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("should not probe when cached"); }));
    const res = await oracleHandler(post(env, { jsonrpc: "2.0", id: 9, method: "tools/call", params: { name: "verify_before_execute", arguments: { url: "https://mcp.cached.com/mcp" } } }));
    const out = JSON.parse(res.body.result.content[0].text);
    expect(out.host).toBe("mcp.cached.com");
    expect(out.verdict).toBe("ok");
    expect(out.methodology).toContain("wmcp.sh/mcp/grade");
  });

  it("notifications (no id) → 202", async () => {
    const env: any = { CACHE: kvMock() };
    const res = await oracleHandler(post(env, { jsonrpc: "2.0", method: "notifications/initialized" }));
    expect(res.status).toBe(202);
  });

  it("GET → 405", async () => {
    const env: any = { CACHE: kvMock() };
    const res = await oracleHandler(makeCtx({ env, method: "GET" }));
    expect(res.status).toBe(405);
  });

  it("tools/call grade_mcp_server returns a grade + recommendation", async () => {
    mockWorld();
    const env: any = { CACHE: kvMock() };
    const res = await oracleHandler(post(env, { jsonrpc: "2.0", id: 5, method: "tools/call", params: { name: "grade_mcp_server", arguments: { url: "https://mcp.acmelabs.io/mcp" } } }));
    const out = JSON.parse(res.body.result.content[0].text);
    expect(out.grade).toBeTruthy();
    expect(["ok", "caution", "avoid"]).toContain(out.recommendation);
    expect(out.report_url).toContain("/mcp/grade/");
    // it persisted (and registered the watch)
    expect(await env.CACHE.get("gradewatch:mcp.acmelabs.io")).toBeTruthy();
  });

  it("tools/call with missing url → -32602", async () => {
    const env: any = { CACHE: kvMock() };
    const res = await oracleHandler(post(env, { jsonrpc: "2.0", id: 6, method: "tools/call", params: { name: "grade_mcp_server", arguments: {} } }));
    expect(res.body.error.code).toBe(-32602);
  });

  it("unknown method → -32601", async () => {
    const env: any = { CACHE: kvMock() };
    const res = await oracleHandler(post(env, { jsonrpc: "2.0", id: 7, method: "resources/list" }));
    expect(res.body.error.code).toBe(-32601);
  });

  it("check_mcp_drift returns stability info", async () => {
    mockWorld();
    const env: any = { CACHE: kvMock() };
    const res = await oracleHandler(post(env, { jsonrpc: "2.0", id: 8, method: "tools/call", params: { name: "check_mcp_drift", arguments: { url: "https://mcp.acmelabs.io/mcp" } } }));
    const out = JSON.parse(res.body.result.content[0].text);
    expect(out).toHaveProperty("drift_count");
    expect(out).toHaveProperty("tool_surface_stable_days");
  });
});

describe("seedRegistryGrades — coverage land-grab", () => {
  it("walks the registry, grades remote servers, advances the cursor", async () => {
    mockWorld({
      registry: {
        servers: [
          { name: "a/x", remotes: [{ type: "streamable-http", url: "https://a.acmelabs.io/mcp" }] },
          { name: "b/y", remotes: [{ type: "sse", url: "https://b.acmelabs.io/sse" }] },
          { name: "c/local", packages: [{}] }, // no remotes → skipped
        ],
        metadata: { nextCursor: "CURSOR2" },
      },
    });
    const env: any = { CACHE: kvMock() };
    const out = await seedRegistryGrades(env);
    expect(out.seeded).toBe(2);
    expect(out.nextCursor).toBe("CURSOR2");
    expect(await env.CACHE.get("gradeseed:cursor")).toBe("CURSOR2");
    expect(await readGrade(env, "a.acmelabs.io")).toBeTruthy();
    expect(await env.CACHE.get("gradewatch:a.acmelabs.io")).toBeTruthy();
  });
});
