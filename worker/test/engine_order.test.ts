import { afterEach, describe, expect, it, vi } from "vitest";
import { executeTool, resolveTools } from "../src/engine";
import { kvMock } from "./helpers";

const OVERLAP_URL = "https://example.com/api-docs/llms.txt";
const OPENAPI_SPEC = {
  openapi: "3.0.0",
  info: { title: "Overlap API", version: "1.0.0" },
  servers: [{ url: "https://api.example.com" }],
  paths: {
    "/ping": {
      get: {
        operationId: "ping",
        summary: "Ping the API",
        responses: {},
      },
    },
  },
};

describe("engine adapter order", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("executes with the same adapter precedence used by resolveTools", async () => {
    globalThis.fetch = vi.fn(async (url: any) => {
      const href = String(url);
      if (href === OVERLAP_URL) return new Response(JSON.stringify(OPENAPI_SPEC), { status: 200 });
      if (href === "https://api.example.com/ping") return new Response(JSON.stringify({ ok: true }), { status: 200 });
      return new Response("not found", { status: 404 });
    }) as any;

    const env = { CACHE: kvMock(), KEYS: kvMock() } as any;
    const ctx = { waitUntil: (_promise: Promise<unknown>) => {} };

    const resolved = await resolveTools(env, ctx, OVERLAP_URL, { fresh: true });
    expect(resolved.ok).toBe(true);
    if (!resolved.ok) return;
    expect(resolved.payload.adapter).toBe("openapi");
    expect(resolved.payload.tools.map((tool: any) => tool.name)).toContain("ping");

    const executed = await executeTool(env, { url: OVERLAP_URL, tool: "ping" });
    expect(executed.ok).toBe(true);
    if (!executed.ok) return;
    expect(executed.value.status).toBe(200);
    expect(executed.value.data).toEqual({ ok: true });
  });
});
