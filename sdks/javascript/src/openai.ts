// OpenAI SDK adapter for @wmcp/sdk.
import type { Tool } from "./index";

export interface OpenAITool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: { type: "object"; properties: Record<string, any>; required?: string[] };
  };
}

export function toOpenAITools(tools: Tool[]): OpenAITool[] {
  return tools.map((t) => ({
    type: "function",
    function: {
      name: t.name,
      description: t.description,
      parameters:
        (t.inputSchema as OpenAITool["function"]["parameters"]) || {
          type: "object",
          properties: {},
        },
    },
  }));
}

/**
 * Run a `tool_calls[i].function` block from OpenAI's response via wmcp.
 */
export async function executeFunctionCall(
  client: { execute: (url: string, tool: string, args: any) => Promise<any> },
  url: string,
  functionCall: { name: string; arguments?: string | Record<string, any> }
) {
  let args: any = functionCall.arguments ?? {};
  if (typeof args === "string") {
    try {
      args = JSON.parse(args);
    } catch {
      args = {};
    }
  }
  return client.execute(url, functionCall.name, args);
}
