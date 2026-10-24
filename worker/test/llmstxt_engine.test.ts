import { afterEach, describe, expect, it, vi } from "vitest";
import { executeTool, resolveTools } from "../src/engine";
import { kvMock } from "./helpers";

const LLMS_URL = "https://example.com/llms.txt";
const QUICKSTART_URL = "https://example.com/docs/quickstart.md";
const LLMS_BODY = `# Example Agent Surface

> A compact map of agent-readable documentation and APIs.

## Docs

- [Quickstart](./docs/quickstart.md): Start here for setup.
`;

describe("llmstxt engine integration", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("resolves llms.txt tools and executes a declared fetch action", async () => {
    globalThis.fetch = vi.fn(async (url: any) => {
      const href = String(url);
      if (href === LLMS_URL) {
        return new Response(LLMS_BODY, { status: 200, headers: { "content-type": "text/plain" } });
      }
      if (href === QUICKSTART_URL) {
        return new Response("# Quickstart\n\nHello agents.", {
          status: 200,
          headers: { "content-type": "text/markdown" },
        });
      }
      return new Response("not found", { status: 404 });
    }) as any;

    const env = { CACHE: kvMock(), KEYS: kvMock() } as any;
    const waited: Promise<unknown>[] = [];
    const ctx = { waitUntil: (promise: Promise<unknown>) => waited.push(promise) };

    const resolved = await resolveTools(env, ctx, LLMS_URL, { fresh: true });
    expect(resolved.ok).toBe(true);
    if (!resolved.ok) return;
    expect(resolved.payload.adapter).toBe("llmstxt");
    expect(resolved.payload.product.title).toBe("Example Agent Surface");
    expect(resolved.payload.tools.map((tool: any) => tool.name)).toEqual([
      "list_sections",
      "get_section",
      "fetch_link",
    ]);
    await Promise.all(waited);

    const executed = await executeTool(env, {
      url: LLMS_URL,
      tool: "fetch_link",
      args: { url: QUICKSTART_URL },
    });
    expect(executed.ok).toBe(true);
    if (!executed.ok) return;
    expect(executed.value.status).toBe(200);
    expect(executed.value.body).toContain("Hello agents.");
  });
});
