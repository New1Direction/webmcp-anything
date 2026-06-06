// test/behavior_seed.test.ts — the behavioral seeder must be SAFE: it may only
// invoke read-only, zero-argument tools, never anything mutating/destructive or
// anything that requires arguments.
import { describe, it, expect, vi, afterEach } from "vitest";
import { isReadOnlyCallable, seedBehaviorForHost } from "../src/mcp_grade";
import { kvMock } from "./helpers";
import { readBehavior } from "../src/behavior";

afterEach(() => vi.unstubAllGlobals());

describe("isReadOnlyCallable", () => {
  it("accepts explicit read-only and safe-named no-arg tools", () => {
    expect(isReadOnlyCallable({ name: "list_repos" })).toBe(true);
    expect(isReadOnlyCallable({ name: "search", inputSchema: { properties: { q: {} } } })).toBe(true); // no `required`
    expect(isReadOnlyCallable({ name: "anything", annotations: { readOnlyHint: true } })).toBe(true);
  });
  it("rejects destructive, required-arg, and unknown-intent tools", () => {
    expect(isReadOnlyCallable({ name: "delete_repo" })).toBe(false);
    expect(isReadOnlyCallable({ name: "send_email" })).toBe(false);
    expect(isReadOnlyCallable({ name: "create_order", annotations: { readOnlyHint: true } })).toBe(false); // name veto wins
    expect(isReadOnlyCallable({ name: "list_repos", inputSchema: { required: ["owner"] } })).toBe(false); // required arg
    expect(isReadOnlyCallable({ name: "get_x", annotations: { readOnlyHint: false } })).toBe(false);
    expect(isReadOnlyCallable({ name: "frobnicate" })).toBe(false); // not obviously read-only
    expect(isReadOnlyCallable({ name: "x", annotations: { destructiveHint: true } })).toBe(false);
  });
});

const reply = (obj: any, status = 200) => ({
  status, ok: status < 400, headers: new Headers({ "content-type": "application/json" }),
  text: async () => JSON.stringify(obj), json: async () => obj,
});

describe("seedBehaviorForHost", () => {
  it("invokes ONLY safe tools and records observations; never touches mutating/required-arg tools", async () => {
    const HOST = "mcp.acmelabs.io";
    const env: any = { CACHE: kvMock() };
    await env.CACHE.put(`grade:${HOST}`, JSON.stringify({
      url: `https://${HOST}/mcp`, host: HOST, checked_at: Date.now(), reachable: true,
      auth_required: false, grade: "B", score: 80, sub: {}, findings: [], tools_count: 4,
    }));

    const tools = [
      { name: "list_items" },                                              // safe → call
      { name: "delete_item" },                                             // destructive → skip
      { name: "search_things", inputSchema: { required: ["q"] } },         // required arg → skip
      { name: "send_message" },                                            // destructive verb → skip
    ];
    const called: string[] = [];
    vi.stubGlobal("fetch", vi.fn(async (_url: any, init: any) => {
      const body = init?.body ? JSON.parse(init.body) : {};
      if (body.method === "initialize") return reply({ jsonrpc: "2.0", id: 1, result: { protocolVersion: "2025-06-18", capabilities: {} } });
      if (body.method === "tools/list") return reply({ jsonrpc: "2.0", id: 2, result: { tools } });
      if (body.method === "tools/call") { called.push(body.params?.name); return reply({ jsonrpc: "2.0", id: 7, result: { content: [{ type: "text", text: "ok" }] } }); }
      return reply({ jsonrpc: "2.0", id: body.id, error: { code: -32601, message: "nope" } }, 200);
    }));

    const out = await seedBehaviorForHost(env, HOST, 5);

    // Only the one safe tool was ever invoked.
    expect(called).toEqual(["list_items"]);
    expect(called).not.toContain("delete_item");
    expect(called).not.toContain("send_message");
    expect(called).not.toContain("search_things");
    expect(out.calls).toBe(1);

    const beh = await readBehavior(env, HOST);
    expect(beh?.total_calls).toBe(1);
    expect(Object.keys(beh?.tools || {})).toEqual(["list_items"]);
  });

  it("skips auth-required and package hosts without any network calls", async () => {
    const env: any = { CACHE: kvMock() };
    await env.CACHE.put("grade:locked.acmelabs.io", JSON.stringify({ url: "https://locked.acmelabs.io/mcp", host: "locked.acmelabs.io", auth_required: true, grade: "C", score: 70, sub: {}, findings: [], checked_at: Date.now(), tools_count: 1 }));
    const fetchSpy = vi.fn(async () => reply({}));
    vi.stubGlobal("fetch", fetchSpy);
    const out = await seedBehaviorForHost(env, "locked.acmelabs.io");
    expect(out.calls).toBe(0);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
