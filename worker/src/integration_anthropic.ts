import { integrationPageHtml } from "./integration_template";

export function integrationAnthropicHtml(origin: string): string {
  return integrationPageHtml({
    origin,
    provider_id: "anthropic",
    provider_name: "Anthropic",
    title: "Anthropic MCP — Connect Claude & AI Agents to Anthropic APIs | wmcp.sh",
    description:
      "Expose Anthropic's chat, prompt caching, and token counts endpoints as standardized Model Context Protocol tools via wmcp.sh. Zero-codegen OpenAPI integration.",
    h1: "Claude + Anthropic — execute Claude tools natively.",
    sub:
      "Expose Anthropic's developer APIs—including messages, prompt caching controls, and token analysis tools—directly to Cursor, Claude Desktop, or LangChain agents via the open MCP standard. wmcp.sh is an independent integration; not affiliated with Anthropic.",
    article_headline: "Anthropic MCP — Exposing Claude Tools to AI Clients",
    article_description:
      "Hosted MCP server mapping Anthropic spec definitions to standardized tools.",
    comparison_headers: ["Capability", "Raw Anthropic SDK", "Composio Anthropic", "wmcp.sh"],
    comparison_rows: [
      ["Setup time", "Install SDK + key configurations", "Platform auth configurations", "Sign in & provide key — done"],
      ["Interoperability", "Locked into Anthropic client", "Custom wrapper", "Standard MCP — works with Claude/Cursor"],
      ["Spec updates", "Wait for SDK release", "Wait for platform update", "Instant spec resolution at the edge"],
      ["Latency", "80-200ms SDK bootstrap", "Platform router delays", "Sub-50ms Edge proxy resolution"],
      ["Tool Coverage", "Manual method mapping", "Curated subset", "Every public endpoint out-of-the-box"],
    ],
    tools: [
      { name: "messages/create", type: "Live action", returns: "Claude 3.5 Sonnet / Haiku response stream" },
      { name: "complete/create", type: "Live action", returns: "Legacy text completion response" },
    ],
    code_example: {
      lang: "Python — Claude calling Anthropic messages through wmcp.sh",
      code_html: `<span class="k">from</span> wmcp <span class="k">import</span> WmcpClient
<span class="k">from</span> wmcp.anthropic <span class="k">import</span> to_anthropic_tools, execute_tool_use
<span class="k">from</span> anthropic <span class="k">import</span> Anthropic

client = WmcpClient(api_key=<span class="s">"webmcp_live_…"</span>)
spec   = <span class="s">"https://raw.githubusercontent.com/anthropics/anthropic-sdk-python/main/openapi.yaml"</span>
tools  = client.tools(spec)

anthropic = Anthropic()
msg = anthropic.messages.create(
    model=<span class="s">"claude-3-5-sonnet-20241022"</span>,
    max_tokens=1024,
    tools=to_anthropic_tools(tools),
    messages=[{<span class="s">"role"</span>: <span class="s">"user"</span>,
               <span class="s">"content"</span>: <span class="s">"Analyze the text metadata using Anthropic's tools."</span>}],
)

<span class="k">for</span> block <span class="k">in</span> msg.content:
    <span class="k">if</span> block.type == <span class="s">"tool_use"</span>:
        result = execute_tool_use(client, spec, block.model_dump())
        <span class="k">print</span>(result)`,
    },
    faqs: [
      {
        q: "Do I need a paid Anthropic key?",
        a_html:
          "Yes. You provide your own Anthropic API key in your secure client header or vault. wmcp.sh does not provide API credits.",
      },
      {
        q: "How does this differ from the official Anthropic SDK?",
        a_html:
          "The SDK requires locking your codebase into Anthropic's client library. wmcp.sh maps the Anthropic OpenAPI spec to the universal MCP standard, letting Claude Desktop, Claude Code, and other editors run Anthropic actions natively.",
      },
      {
        q: "Are my API keys secure?",
        a_html:
          "Yes. wmcp.sh routes all requests through our secure PKCE credentials proxy. Your keys are encrypted out-of-band and never exposed in the LLM context.",
      },
    ],
  });
}
