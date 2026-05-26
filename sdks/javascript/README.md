# @wmcp/sdk

JavaScript/TypeScript SDK for [wmcp.sh](https://wmcp.sh). One-line tool integration for any AI agent on the JS side — Claude, OpenAI, Vercel AI SDK, LangChain.

## Install

```bash
npm install @wmcp/sdk
# plus your framework of choice (peer deps, optional):
npm install @anthropic-ai/sdk
npm install openai
npm install ai            # Vercel AI SDK
npm install @langchain/core
```

Zero required dependencies — uses native `fetch`. Works in Node 18+, Bun, Deno, Cloudflare Workers, and browsers (for CORS-permitted endpoints).

## Quick start

```ts
import { WmcpClient } from "@wmcp/sdk";

const client = new WmcpClient(); // anonymous = 100 reads/day per IP

const tools = await client.tools("https://www.allbirds.com/products/mens-wool-runners");
console.log(tools.length, "tools");
```

## Claude

```ts
import Anthropic from "@anthropic-ai/sdk";
import { WmcpClient } from "@wmcp/sdk";
import { toAnthropicTools, executeToolUse } from "@wmcp/sdk/anthropic";

const client = new WmcpClient({ apiKey: process.env.WMCP_API_KEY });
const url = "https://www.allbirds.com/products/mens-wool-runners";

const anthropic = new Anthropic();
const msg = await anthropic.messages.create({
  model: "claude-opus-4-7",
  max_tokens: 1024,
  tools: toAnthropicTools(await client.tools(url)),
  messages: [{ role: "user", content: "Add size 10 to my cart." }],
});

for (const block of msg.content) {
  if (block.type === "tool_use") {
    const result = await executeToolUse(client, url, block);
    console.log(result);
  }
}
```

## OpenAI

```ts
import OpenAI from "openai";
import { WmcpClient } from "@wmcp/sdk";
import { toOpenAITools, executeFunctionCall } from "@wmcp/sdk/openai";

const client = new WmcpClient({ apiKey: process.env.WMCP_API_KEY });
const url = "https://www.allbirds.com/products/mens-wool-runners";

const openai = new OpenAI();
const resp = await openai.chat.completions.create({
  model: "gpt-4o",
  tools: toOpenAITools(await client.tools(url)),
  messages: [{ role: "user", content: "Find the cheapest size." }],
});
```

## Vercel AI SDK

```ts
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { WmcpClient } from "@wmcp/sdk";
import { toVercelAITools } from "@wmcp/sdk/vercel-ai";

const client = new WmcpClient({ apiKey: process.env.WMCP_API_KEY });
const tools = await toVercelAITools(client, "https://allbirds.com/products/mens-wool-runners");

const result = await generateText({
  model: openai("gpt-4o"),
  tools,
  prompt: "Add size 10 to my cart.",
});
```

## LangChain

```ts
import { WmcpClient } from "@wmcp/sdk";
import { toLangchainTools } from "@wmcp/sdk/langchain";

const client = new WmcpClient({ apiKey: process.env.WMCP_API_KEY });
const tools = await toLangchainTools(client, "https://allbirds.com/products/mens-wool-runners");

// Drop into any LangChain agent
```

## Direct execute

```ts
const result = await client.execute(
  "https://www.allbirds.com/products/mens-wool-runners",
  "add_to_cart",
  { variant: "10", quantity: 1 }
);
console.log(result.value.checkout_url);
```

## Free vs paid

- **Free (anonymous):** 100 reads/day per IP.
- **Pro ($29/mo):** 10k reads + 1k live executes / day.
- **Reseller ($99/mo):** 100k reads + 50k executes / day.

Get a key at [wmcp.sh/dashboard](https://wmcp.sh/dashboard).

## License

MIT.
