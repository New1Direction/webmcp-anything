import { integrationPageHtml } from "./integration_template";

export function integrationOpenaiHtml(origin: string): string {
  return integrationPageHtml({
    origin,
    provider_id: "openai",
    provider_name: "OpenAI",
    title: "OpenAI MCP — Connect Claude & AI Agents to OpenAI APIs | wmcp.sh",
    description:
      "Expose OpenAI's Assistants, GPT, and Embeddings endpoints as standardized Model Context Protocol tools via wmcp.sh. Zero-codegen OpenAPI integration with auto-injected keys.",
    h1: "Claude + OpenAI — run GPT tools natively.",
    sub:
      "Expose OpenAI's full suite of developer APIs—including chat completions, assistants, files, and vector stores—directly to your Claude Desktop, Claude Code, or LangChain agents via the open MCP standard.",
    article_headline: "OpenAI MCP — Exposing GPT Tools to Claude",
    article_description:
      "Hosted MCP server mapping OpenAI spec definitions to standardized tools.",
    comparison_headers: ["Capability", "Raw OpenAI SDK", "Composio OpenAI", "wmcp.sh"],
    comparison_rows: [
      ["Setup time", "Install SDK + key configurations", "Platform auth configurations", "Sign in & provide key — done"],
      ["Interoperability", "Locked into OpenAI client", "Custom wrapper", "Standard MCP — works with Claude/Cursor"],
      ["Spec updates", "Wait for SDK release", "Wait for platform update", "Instant spec resolution at the edge"],
      ["Latency", "80-200ms SDK bootstrap", "Platform router delays", "Sub-50ms Edge proxy resolution"],
      ["Tool Coverage", "Manual method mapping", "Curated subset", "Every public endpoint out-of-the-box"],
    ],
    tools: [
      { name: "chat/completions", type: "Live action", returns: "GPT-4o chat completions JSON response" },
      { name: "embeddings/create", type: "Live action", returns: "Text embeddings vector coordinates" },
      { name: "assistants/create", type: "Live action", returns: "New Assistant instance details" },
      { name: "threads/create", type: "Live action", returns: "Assistant thread session ID" },
      { name: "files/create", type: "Live action", returns: "Uploaded file reference metadata" },
    ],
    code_example: {
      lang: "Python — Claude calling OpenAI embeddings through wmcp.sh",
      code_html: `<span class="k">from</span> wmcp <span class="k">import</span> WmcpClient
<span class="k">from</span> wmcp.anthropic <span class="k">import</span> to_anthropic_tools, execute_tool_use
<span class="k">from</span> anthropic <span class="k">import</span> Anthropic

client = WmcpClient(api_key=<span class="s">"webmcp_live_…"</span>)
spec   = <span class="s">"https://raw.githubusercontent.com/openai/openai-openapi/master/openapi.yaml"</span>
tools  = client.tools(spec)

<span class="c"># Filter to embeddings tools</span>
embedding_tools = [t <span class="k">for</span> t <span class="k">in</span> tools <span class="k">if</span> t.name.startswith(<span class="s">"embeddings"</span>)]

anthropic = Anthropic()
msg = anthropic.messages.create(
    model=<span class="s">"claude-3-5-sonnet-20241022"</span>,
    max_tokens=1024,
    tools=to_anthropic_tools(embedding_tools),
    messages=[{<span class="s">"role"</span>: <span class="s">"user"</span>,
               <span class="s">"content"</span>: <span class="s">"Vectorize the query: 'shopper side agent stack'."</span>}],
)

<span class="k">for</span> block <span class="k">in</span> msg.content:
    <span class="k">if</span> block.type == <span class="s">"tool_use"</span>:
        result = execute_tool_use(client, spec, block.model_dump())
        <span class="k">print</span>(result)`,
    },
    faqs: [
      {
        q: "Do I need a paid OpenAI key?",
        a_html:
          "Yes. You provide your own OpenAI API key in your secure client header or vault. wmcp.sh does not provide API credits.",
      },
      {
        q: "How does this differ from the official OpenAI SDK?",
        a_html:
          "The SDK requires locking your codebase into OpenAI's client library. wmcp.sh maps the OpenAI OpenAPI spec to the universal MCP standard, letting Claude Desktop, Claude Code, and other editors run OpenAI actions natively.",
      },
      {
        q: "Are my API keys secure?",
        a_html:
          "Yes. wmcp.sh routes all requests through our secure PKCE credentials proxy. Your keys are encrypted out-of-band and never exposed in the LLM context.",
      },
    ],
  });
}
