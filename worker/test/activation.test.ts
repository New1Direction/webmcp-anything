import { afterEach, describe, expect, it, vi } from "vitest";
import worker from "../src/index";
import { envMock, kvMock, makeCtx, signStripe } from "./helpers";
import { previewActivation } from "../src/activation";
import { activationHtml } from "../src/activation_page";
import { createOauthState } from "../src/session";
import { loadProviderToken } from "../src/token_vault";

const source = "https://api.acmelabs.io/openapi.json";
const spec = { openapi: "3.0.0", info: { title: "Acme", version: "1" }, servers: [{ url: "https://api.acmelabs.io" }], paths: {
  "/widgets": { get: { operationId: "listWidgets", summary: "List widgets", responses: { "200": { description: "OK" } } }, post: { operationId: "createWidget", responses: { "200": { description: "OK" } } } },
} };
const session = { cookie: "wmcp_session=activation-session" };
const origin = "https://wmcp.sh";

function setup() {
  const env = envMock({ CACHE: kvMock(), STRIPE_SECRET_KEY: "stripe-test", STRIPE_WEBHOOK_SECRET: "webhook-test", STRIPE_PRICE_TO_PLAN: JSON.stringify({ price_builder: "builder" }) });
  const waited: Promise<unknown>[] = [];
  const ctx = { waitUntil: (p: Promise<unknown>) => waited.push(p), passThroughOnException() {} };
  async function request(path: string, body?: unknown, headers: Record<string, string> = {}) {
    const response = await worker.fetch(new Request(origin + path, { method: body === undefined ? "GET" : "POST", headers: { "content-type": "application/json", ...headers }, body: body === undefined ? undefined : JSON.stringify(body) }), env, ctx as any);
    await Promise.all(waited.splice(0));
    return response;
  }
  async function login() {
    await env.KEYS.put("session:activation-session", JSON.stringify({ user_id: "gh:77" }));
    await env.KEYS.put("user:gh:77", JSON.stringify({ plan: "free", keys: [], email: "support@example.com" }));
  }
  return { env, request, login };
}

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

describe("self-serve activation", () => {
  it("previews real OpenAPI tools, issues a session-owned key, verifies discovery and preserves the endpoint/key across Stripe upgrade", async () => {
    const { env, request, login } = setup();
    vi.stubGlobal("fetch", vi.fn(async (url: string, init?: RequestInit) => {
      if (url === source) return Response.json(spec);
      if (url === "https://api.stripe.com/v1/checkout/sessions") {
        const form = new URLSearchParams(String(init?.body));
        expect(form.get("metadata[user_id]")).toBe("gh:77");
        expect(form.get("metadata[source]")).toBe("activation");
        return Response.json({ id: "cs_activation", url: "https://checkout.stripe.com/test" });
      }
      throw new Error("Unexpected external request: " + url);
    }));
    const previewResponse = await request("/api/v1/activation/preview", { url: source, public: true });
    expect(previewResponse.status).toBe(200);
    expect(previewResponse.headers.get("cache-control")).toBe("no-store");
    const preview = await previewResponse.json() as any;
    expect(preview.count).toBe(2);
    expect(preview.tools.map((t: any) => t.name)).toEqual(["listWidgets", "createWidget"]);
    expect(preview.endpoint).not.toContain("?");
    await login();
    const issued = await request("/api/v1/me/keys", {}, { ...session, origin });
    const { key } = await issued.json() as any;
    expect(key).toMatch(/^webmcp_live_/);
    const rpcPath = new URL(preview.endpoint).pathname;
    const rpc = { jsonrpc: "2.0", id: 1, method: "tools/list" };
    const listed = await (await request(rpcPath, rpc, { authorization: "Bearer " + key })).json() as any;
    expect(listed.result.tools.map((t: any) => t.name)).toEqual(["listWidgets", "createWidget"]);
    const call = { ...rpc, method: "tools/call", params: { name: "createWidget", arguments: {} } };
    const gated = await (await request(rpcPath, call, { authorization: "Bearer " + key })).json() as any;
    expect(gated.error.data.upgrade_info.recommended_plan).toBe("builder");
    expect((await request("/api/v1/stripe/checkout", { plan: "builder", source: "activation" }, session)).status).toBe(200);
    const event = { type: "checkout.session.completed", data: { object: { id: "cs_activation", customer: "cus_activation", subscription: "sub_activation", payment_status: "paid", metadata: { kind: "plan", plan: "builder", user_id: "gh:77", source: "activation" } } } };
    const raw = JSON.stringify(event);
    expect((await request("/api/v1/stripe/webhook", event, { "stripe-signature": signStripe(raw, "webhook-test") })).status).toBe(200);
    const me = await (await request("/api/v1/me", undefined, session)).json() as any;
    expect(me.plan).toBe("builder");
    expect(me.keys).toContain(key);
    expect(JSON.parse(await env.KEYS.get("key:" + key)).plan).toBe("builder");
    const again = await (await request(rpcPath, rpc, { authorization: "Bearer " + key })).json() as any;
    expect(again.result.tools).toEqual(listed.result.tools);
    const counters = env.USAGE.__keys().filter((k: string) => /^(metric|conv):/.test(k));
    expect(counters.some((k: string) => k.includes("discovery_verified"))).toBe(true);
    expect(counters.join()).not.toMatch(/acmelabs|support@|webmcp_live|gh:77/);
  });

  it("rejects private, credential-bearing and non-consented URLs before extraction without reflecting them", async () => {
    const { request } = setup();
    const network = vi.fn(() => { throw new Error("must not fetch"); });
    vi.stubGlobal("fetch", network);
    for (const url of ["https://name:secret@acmelabs.io", "https://acmelabs.io?token=secret", "https://acmelabs.io#secret", "https://127.0.0.1", "https://[::1]", "http://acmelabs.io", "file:///tmp/secret"]) {
      const r = await request("/api/v1/activation/preview", { url, public: true });
      expect(r.status).toBe(400);
      expect(await r.text()).not.toContain(url);
    }
    expect((await request("/api/v1/activation/preview", { url: source })).status).toBe(400);
    expect(network).not.toHaveBeenCalled();
  });

  it("returns actionable empty/failed discovery, bounds preview size, and respects DNT/GPC", async () => {
    const { env, request } = setup();
    await env.CACHE.put("v1:" + source, JSON.stringify({ ts: Date.now(), payload: { adapter: "openapi", tools: [] } }));
    const empty = await request("/api/v1/activation/preview", { url: source, public: true }, { dnt: "1" });
    expect(empty.status).toBe(422);
    expect((await empty.json() as any).hint).toContain("direct OpenAPI");
    await env.CACHE.put("v1:" + source, JSON.stringify({ ts: Date.now(), payload: { adapter: "openapi", tools: Array.from({ length: 80 }, (_, i) => ({ name: "tool" + i, description: "x".repeat(10000) })) } }));
    const ready = await request("/api/v1/activation/preview", { url: source, public: true }, { "sec-gpc": "1" });
    const json = await ready.json() as any;
    expect(json.count).toBe(80);
    expect(json.tools).toHaveLength(50);
    expect(JSON.stringify(json).length).toBeLessThan(35000);
    expect(env.USAGE.__keys("metric:activation_preview")).toEqual([]);
  });

  it("bounds a hanging preview at 12s and never reports it as ready", async () => {
    vi.useFakeTimers();
    const { env } = setup();
    vi.stubGlobal("fetch", () => new Promise(() => {}));
    const c = makeCtx({ env, url: origin + "/api/v1/activation/preview", body: { url: source, public: true } });
    const response = previewActivation(c);
    await vi.advanceTimersByTimeAsync(12000);
    const result = await response as any;
    expect(result.status).toBe(504);
    expect(result.body.error).toBe("preview_timeout");
  });

  it("requires same-origin session key issuance and rejects revoked keys rather than verifying anonymous discovery", async () => {
    const { request, login, env } = setup();
    await login();
    expect((await request("/api/v1/me/keys", {}, { ...session, origin: "https://evil.invalid" })).status).toBe(403);
    expect((await request("/api/v1/me/keys", {}, { origin })).status).toBe(401);
    const { key } = await (await request("/api/v1/me/keys", {}, { ...session, origin })).json() as any;
    await env.KEYS.put("key:" + key, JSON.stringify({ user_id: "gh:77", plan: "free", status: "revoked" }));
    const me = await request("/api/v1/me", undefined, session);
    expect(me.headers.get("cache-control")).toBe("no-store");
    expect((await me.json() as any).keys).toEqual([]);
    for (const headers of [{ authorization: "Bearer " + key }, { ...session, authorization: "Bearer " + key }]) {
      const result = await (await request("/mcp/u/" + btoa(source).replace(/=/g, ""), { jsonrpc: "2.0", id: 2, method: "tools/list" }, headers)).json() as any;
      expect(result.error.code).toBe(-32001);
    }
    expect(env.USAGE.__keys("metric:discovery_verified")).toEqual([]);
    const day = new Date().toISOString().slice(0, 10);
    await env.USAGE.put(`usage:anon:anon:reads:${day}`, "100");
    const exhausted = await request("/api/v1/activation/preview", { url: source, public: true });
    expect(exhausted.status).toBe(429);
    expect((await exhausted.json() as any).upgrade_url).toContain("upgrade=builder");
  });

  it("keeps initial HTML under 16 KiB with valid executable JavaScript", () => {
    const html = activationHtml();
    expect(Buffer.byteLength(html)).toBeLessThan(16384);
    const script = html.match(/<script>([\s\S]*?)<\/script>/)![1];
    expect(() => new Function(script)).not.toThrow();
    expect(html).not.toContain('<script src=');
  });
});

describe("activation sign-in security", () => {
  it.each([false, true])("does not link by checkout email; preserves an existing GitHub mapping (%s)", async (existing) => {
    const { env, request } = setup();
    Object.assign(env, { GITHUB_CLIENT_ID: "test-client", GITHUB_CLIENT_SECRET: "test-secret", TOKEN_ENC_KEY: "test-encryption-key" });
    await env.KEYS.put("email:support@example.com", "cust:other");
    await env.KEYS.put("user:cust:other", JSON.stringify({ plan: "pro", keys: [] }));
    if (existing) await env.KEYS.put("gh_user:77", "cust:other");
    vi.stubGlobal("fetch", async (url: string) => {
      if (url.endsWith("/access_token")) return Response.json({ access_token: "github-test-token" });
      if (url.endsWith("/user/emails")) return Response.json([{ email: "support@example.com", primary: true, verified: true }]);
      return Response.json({ id: 77, login: "acme", email: "support@example.com" });
    });
    const state = await createOauthState(env, { provider: "github", redirect_to: existing ? "//evil.invalid" : "/start" });
    const response = await request("/api/v1/auth/github/callback?code=test&state=" + state);
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(existing ? "/dashboard" : "/start");
    const expected = existing ? "cust:other" : "gh:77";
    expect(await env.KEYS.get("gh_user:77")).toBe(expected);
    expect(await env.KEYS.get("email:support@example.com")).toBe("cust:other");
    expect((await loadProviderToken(env, expected, "github"))?.access_token).toBe("github-test-token");
    expect([...env.KEYS.__map.values()].map((entry: any) => entry.value).join()).not.toContain("github-test-token");
  });
});
