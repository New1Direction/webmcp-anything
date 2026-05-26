// LangChain JS adapter for @wmcp/sdk.
//
// Produces an array of `DynamicStructuredTool` objects that LangChain agents
// can consume directly. Lazy-imports `@langchain/core`.

import type { Tool, WmcpClient } from "./index";

export async function toLangchainTools(
  client: WmcpClient,
  url: string,
  opts: { fresh?: boolean; tools?: Tool[] } = {}
): Promise<any[]> {
  // @ts-ignore — peer dep
  const mod: any = await import("@langchain/core/tools").catch(() => null);
  if (!mod || !mod.DynamicStructuredTool) {
    throw new Error(
      "toLangchainTools requires @langchain/core. Install: npm install @langchain/core"
    );
  }
  const { DynamicStructuredTool } = mod;

  const wmcpTools = opts.tools || (await client.tools(url, { fresh: opts.fresh }));

  return wmcpTools.map(
    (t: Tool) =>
      new DynamicStructuredTool({
        name: t.name,
        description: t.description,
        schema: t.inputSchema || { type: "object", properties: {} },
        func: async (args: Record<string, any>) => {
          const res = await client.execute(url, t.name, args);
          return JSON.stringify(res.value ?? res);
        },
      })
  );
}
