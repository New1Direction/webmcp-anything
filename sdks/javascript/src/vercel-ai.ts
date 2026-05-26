// Vercel AI SDK adapter for @wmcp/sdk.
//
// Produces a `tools` object matching the shape expected by `generateText`,
// `streamText`, etc. Lazy-imports `tool()` from `ai` so the dep stays optional.
//
// @example
//   import { generateText } from "ai";
//   import { WmcpClient } from "@wmcp/sdk";
//   import { toVercelAITools } from "@wmcp/sdk/vercel-ai";
//
//   const client = new WmcpClient();
//   const tools = await toVercelAITools(client, "https://allbirds.com/products/mens-wool-runners");
//
//   const r = await generateText({ model: openai("gpt-4o"), tools, prompt: "…" });

import type { Tool, WmcpClient } from "./index";

/**
 * Returns an object keyed by tool name where each value is a Vercel AI SDK `tool({…})`.
 * Requires `ai` (the Vercel AI SDK) to be installed in the host project.
 */
export async function toVercelAITools(
  client: WmcpClient,
  url: string,
  opts: { fresh?: boolean; tools?: Tool[] } = {}
): Promise<Record<string, any>> {
  // @ts-ignore — peer dep, lazy
  const aiModule = await import("ai").catch(() => null);
  if (!aiModule || !aiModule.tool) {
    throw new Error(
      "toVercelAITools requires the 'ai' package. Install with: npm install ai"
    );
  }
  const { tool } = aiModule;

  const wmcpTools = opts.tools || (await client.tools(url, { fresh: opts.fresh }));
  const out: Record<string, any> = {};

  for (const t of wmcpTools) {
    out[t.name] = tool({
      description: t.description,
      // Vercel AI SDK accepts a JSON Schema parameters object via `parameters`
      parameters: t.inputSchema as any || { type: "object", properties: {} },
      execute: async (args: Record<string, any>) => {
        const res = await client.execute(url, t.name, args);
        return res.value ?? res;
      },
    });
  }

  return out;
}
