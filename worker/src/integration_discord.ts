import { integrationPageHtml } from "./integration_template";

export function integrationDiscordHtml(origin: string): string {
  return integrationPageHtml({
    origin,
    provider_id: "discord",
    provider_name: "Discord",
    title: "Discord MCP — Connect Claude & AI Agents to Discord API | wmcp.sh",
    description:
      "Expose Discord's channels, messages, webhooks, and guild endpoints as standardized Model Context Protocol tools via wmcp.sh. Zero-codegen OpenAPI integration with auto-injected tokens.",
    h1: "Claude + Discord — manage servers and bots natively.",
    sub:
      "Expose Discord's full developer API—including messaging, server guild configs, bot commands, and webhooks—directly to Cursor, Claude Desktop, or LangChain agents via the open MCP standard.",
    article_headline: "Discord MCP — Exposing Guild and Channel Tools to Claude",
    article_description:
      "Hosted MCP server mapping Discord spec definitions to standardized tools.",
    comparison_headers: ["Capability", "Discord.js / Discord.py", "Composio Discord", "wmcp.sh"],
    comparison_rows: [
      ["Setup time", "Install SDK + token wiring", "Platform auth configurations", "Sign in & provide bot token — done"],
      ["Interoperability", "Locked into Discord client", "Custom wrapper", "Standard MCP — works with Claude/Cursor"],
      ["Spec updates", "Wait for SDK release", "Wait for platform update", "Instant spec resolution at the edge"],
      ["Latency", "80-200ms SDK bootstrap", "Platform router delays", "Sub-50ms Edge proxy resolution"],
      ["Tool Coverage", "Manual method mapping", "Curated subset", "Every public endpoint out-of-the-box"],
    ],
    tools: [
      { name: "channels/createMessage", type: "Live action", returns: "Send a message to a Discord channel" },
      { name: "channels/getChannel", type: "Live action", returns: "Retrieve Discord channel metadata" },
      { name: "guilds/getGuild", type: "Live action", returns: "Retrieve Discord server guild metadata" },
      { name: "webhooks/execute", type: "Live action", returns: "Post to a Discord webhook URL" },
    ],
    code_example: {
      lang: "Python — Claude posting a message to Discord through wmcp.sh",
      code_html: `<span class="k">from</span> wmcp <span class="k">import</span> WmcpClient
<span class="k">from</span> wmcp.anthropic <span class="k">import</span> to_anthropic_tools, execute_tool_use
<span class="k">from</span> anthropic <span class="k">import</span> Anthropic

client = WmcpClient(api_key=<span class="s">"webmcp_live_…"</span>)
spec   = <span class="s">"https://raw.githubusercontent.com/discord/discord-api-spec/main/openapi.json"</span>
tools  = client.tools(spec)

<span class="c"># Filter to messaging tools</span>
msg_tools = [t <span class="k">for</span> t <span class="k">in</span> tools <span class="k">if</span> t.name.startswith(<span class="s">"channels/createMessage"</span>)]

anthropic = Anthropic()
msg = anthropic.messages.create(
    model=<span class="s">"claude-3-5-sonnet-20241022"</span>,
    max_tokens=1024,
    tools=to_anthropic_tools(msg_tools),
    messages=[{<span class="s">"role"</span>: <span class="s">"user"</span>,
               <span class="s">"content"</span>: <span class="s">"Send 'Hello from Claude Code' to channel 123456789."</span>}],
)

<span class="k">for</span> block <span class="k">in</span> msg.content:
    <span class="k">if</span> block.type == <span class="s">"tool_use"</span>:
        result = execute_tool_use(client, spec, block.model_dump())
        <span class="k">print</span>(result)`,
    },
    faqs: [
      {
        q: "Do I need a Discord Bot Token?",
        a_html:
          "Yes. You provide your own Discord Bot Token or Webhook URL in your secure client header or vault. wmcp.sh routes requests securely.",
      },
      {
        q: "How does this differ from Discord.js or Discord.py?",
        a_html:
          "These SDKs require running persistent local daemons. wmcp.sh maps the Discord OpenAPI spec to the universal MCP standard, letting Claude Desktop, Claude Code, and other editors run Discord actions natively.",
      },
      {
        q: "Are my bot tokens secure?",
        a_html:
          "Yes. Bot tokens are static secrets, so wmcp.sh stores them in an encrypted credentials vault and injects them at request time — they're encrypted out-of-band and never exposed in the LLM context. (Where OAuth applies, we use the OAuth 2.1 PKCE flow.)",
      },
    ],
  });
}
