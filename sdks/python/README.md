# wmcp — Python SDK

One-line tool integration for any AI agent. Hands [wmcp.sh](https://wmcp.sh) tool schemas to Claude, OpenAI, LangChain, or anything that speaks MCP.

## Install

```bash
pip install wmcp                    # core (no deps)
pip install 'wmcp[anthropic]'       # + Anthropic SDK
pip install 'wmcp[openai]'          # + OpenAI SDK
pip install 'wmcp[langchain]'       # + LangChain
```

## Quick start

```python
from wmcp import WmcpClient

client = WmcpClient()  # anonymous free tier — 100 reads/day per IP

tools = client.tools("https://www.allbirds.com/products/mens-wool-runners")
for t in tools:
    print(t.name, "—", t.description[:60])
```

## Claude (Anthropic SDK)

```python
from anthropic import Anthropic
from wmcp import WmcpClient
from wmcp.anthropic import to_anthropic_tools, execute_tool_use

client = WmcpClient(api_key="webmcp_live_…")
url = "https://www.allbirds.com/products/mens-wool-runners"

anthropic = Anthropic()
msg = anthropic.messages.create(
    model="claude-opus-4-7",
    max_tokens=1024,
    tools=to_anthropic_tools(client.tools(url)),
    messages=[{"role": "user", "content": "Add size 10 to my cart."}],
)

# Run any tool_use blocks Claude returned
for block in msg.content:
    if block.type == "tool_use":
        result = execute_tool_use(client, url, block.model_dump())
        print(result)
```

## OpenAI

```python
from openai import OpenAI
from wmcp import WmcpClient
from wmcp.openai import to_openai_tools, execute_function_call

client = WmcpClient(api_key="webmcp_live_…")
url = "https://www.allbirds.com/products/mens-wool-runners"

openai = OpenAI()
resp = openai.chat.completions.create(
    model="gpt-4o",
    tools=to_openai_tools(client.tools(url)),
    messages=[{"role": "user", "content": "Find the cheapest size in stock."}],
)
```

## LangChain

```python
from wmcp import WmcpClient
from wmcp.langchain import WmcpToolkit

client = WmcpClient(api_key="webmcp_live_…")
toolkit = WmcpToolkit("https://allbirds.com/products/mens-wool-runners", client=client)

# Drop into any langchain agent
tools = toolkit.get_tools()
```

## Execute tools directly

```python
result = client.execute(
    url="https://www.allbirds.com/products/mens-wool-runners",
    tool="add_to_cart",
    args={"variant": "10", "quantity": 1},
)
print(result["value"]["checkout_url"])
```

## Free vs paid

- **Free tier (anonymous):** 100 reads/day rate-limited by IP. Tool list + cached schemas.
- **Pro ($29/mo):** 10k reads/day + 1k live executes. Get a key at [wmcp.sh/dashboard](https://wmcp.sh/dashboard).
- **Reseller ($99/mo):** 100k reads + 50k executes + restock webhooks (coming).

## License

MIT — see the [project repo](https://github.com/New1Direction/webmcp-anything).
