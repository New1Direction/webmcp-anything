# Quickstart — wmcp.sh in 5 minutes

You have an AI agent (Claude Desktop, Cursor, Codex, OpenAI's Agents SDK, or a custom Python/TypeScript loop). You want it to call tools on real websites. This is the fastest path.

## 30-second test (no install)

```bash
curl 'https://wmcp.sh/api/v1/tools?url=https://www.allbirds.com/products/mens-wool-runners' | jq '.tools[] | .name'
```

You should see something like:

```
"get_price"
"list_variants"
"add_to_cart"
"get_inventory"
```

That's a live Shopify storefront, compiled to MCP tools at the edge in under 50ms. No API key, no install, no per-site adapter you have to write.

## Connect Claude Desktop in 60 seconds

1. Open Claude Desktop → **Settings** → **Developer** → **Edit Config**.
2. Add to your `mcpServers`:

   ```json
   {
     "mcpServers": {
       "wmcp": {
         "type": "streamable-http",
         "url": "https://wmcp.sh/api/v1/tools"
       }
     }
   }
   ```
3. Restart Claude Desktop. The tools appear under the wrench icon in the chat input.
4. Try a prompt:
   > "Get the price of https://www.allbirds.com/products/mens-wool-runners"

The agent calls `get_price` against the cached tool extraction and returns the result.

Full step-by-step screenshots at [wmcp.sh/how-to/install-claude-desktop-mcp](https://wmcp.sh/how-to/install-claude-desktop-mcp).

## Connect Cursor

Cursor reads the same `mcpServers` config shape. Open `~/.cursor/mcp.json` and add the wmcp entry above. Restart Cursor.

## Connect Codex CLI

`~/.codex/config.toml`:

```toml
[mcp_servers.wmcp]
type = "streamable-http"
url = "https://wmcp.sh/api/v1/tools"
```

## Connect a custom agent (Python)

```python
import httpx, anthropic

WMCP = "https://wmcp.sh/api/v1/tools"

# 1. Fetch tools for a URL
tools = httpx.get(WMCP, params={"url": "https://www.allbirds.com/products/mens-wool-runners"}).json()["tools"]

# 2. Hand them to Claude
client = anthropic.Anthropic()
msg = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    tools=tools,
    messages=[{"role": "user", "content": "What's the price of the wool runners?"}],
)

# 3. Iterate the tool_use → tool_result loop
for block in msg.content:
    if block.type == "tool_use":
        # ... call wmcp.sh execute endpoint with block.input, return result ...
        pass
```

Code-complete version with the execute loop: [wmcp.sh/blog/claude-code-mcp-integration-tutorial](https://wmcp.sh/blog/claude-code-mcp-integration-tutorial).

## Connect a custom agent (TypeScript)

```bash
npm install @wmcp/sdk @anthropic-ai/sdk
```

```typescript
import { WmcpClient } from "@wmcp/sdk";
import Anthropic from "@anthropic-ai/sdk";

const wmcp = new WmcpClient();
const { tools } = await wmcp.tools("https://api.stripe.com/openapi.yaml");

const anthropic = new Anthropic();
const msg = await anthropic.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 1024,
  tools,
  messages: [{ role: "user", content: "List my last 5 Stripe invoices." }],
});
// → handle msg.content tool_use blocks
```

## What can I point wmcp.sh at?

| URL shape | Adapter tier | Latency |
|---|---|---|
| `https://yourshop.myshopify.com/products/...` | Shopify (~4M storefronts) | <50ms |
| `https://store.com/product/...` with `<script type="application/ld+json">` | JSON-LD | <50ms |
| `https://api.example.com/openapi.yaml` (or `.json`) | OpenAPI compiler | 100-300ms first call, <50ms cached |
| `https://api.stripe.com`, `https://api.github.com`, etc. (known providers) | Provider adapter | <50ms |
| Anything else | LLM-fallback (Claude 3.5 Haiku) | 1-3s first call, <50ms cached |

## Need auth?

Many APIs require OAuth or API keys. wmcp.sh ships an OAuth 2.1 PKCE proxy + encrypted credential vault.

1. Open [wmcp.sh/dashboard](https://wmcp.sh/dashboard)
2. Sign in with GitHub
3. Connect the providers you need (Stripe, Slack, Notion, Linear, Discord, Google, etc.)
4. Use the provider-specific MCP endpoint:

   ```
   https://wmcp.sh/mcp/stripe
   https://wmcp.sh/mcp/slack
   https://wmcp.sh/mcp/notion
   ```

   The worker injects your stored bearer token; your agent context never sees raw credentials.

See [docs/ARCHITECTURE.md](./ARCHITECTURE.md#oauth-vault) for the security model.

## Next steps

- [docs/API.md](./API.md) — every endpoint, request/response shapes
- [docs/ARCHITECTURE.md](./ARCHITECTURE.md) — how the 5-tier chain + OAuth vault + edge runtime fit together
- [docs/SELF_HOSTING.md](./SELF_HOSTING.md) — fork and deploy your own wmcp.sh instance
- [wmcp.sh/blog](https://wmcp.sh/blog) — 24 long-form posts on the engineering decisions
- [ADAPTERS_WANTED.md](../ADAPTERS_WANTED.md) — sites we want PRs for
