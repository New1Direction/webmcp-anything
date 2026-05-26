// Anthropic SDK adapter for @wmcp/sdk.
import type { Tool } from "./index";

export interface AnthropicTool {
  name: string;
  description: string;
  input_schema: { type: "object"; properties: Record<string, any>; required?: string[] };
}

export function toAnthropicTools(tools: Tool[]): AnthropicTool[] {
  return tools.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema:
      (t.inputSchema as AnthropicTool["input_schema"]) || {
        type: "object",
        properties: {},
      },
  }));
}

/**
 * Convenience runner — pass a `tool_use` block from Claude's response, get
 * wmcp.sh to execute it. Pass a WmcpClient instance and the URL.
 *
 * @example
 *   const msg = await anthropic.messages.create({ tools: toAnthropicTools(tools), … });
 *   for (const block of msg.content) {
 *     if (block.type === "tool_use") {
 *       const result = await executeToolUse(client, url, block);
 *     }
 *   }
 */
export async function executeToolUse(
  client: { execute: (url: string, tool: string, args: any) => Promise<any> },
  url: string,
  toolUse: { name: string; input?: any }
) {
  return client.execute(url, toolUse.name, toolUse.input || {});
}
