import { integrationPageHtml } from "./integration_template";

export function integrationSlackHtml(origin: string): string {
  return integrationPageHtml({
    origin,
    provider_id: "slack",
    provider_name: "Slack",
    title: "Slack MCP — Claude + Slack via OAuth, post messages, manage channels | wmcp.sh",
    description:
      "Hosted MCP server for Slack. Post messages, react, list channels, manage conversations from any AI agent. Connect Slack once in wmcp.sh; tokens auto-inject.",
    h1: "Claude + Slack — drop-in bot, no boilerplate.",
    sub:
      "Slack's Web API is hundreds of methods spread across docs. wmcp.sh ingests them and your agent gets clean MCP tools — <code>chat.postMessage</code>, <code>conversations.history</code>, <code>users.lookupByEmail</code>, all the standard surface. Connect once at the dashboard; the worker handles OAuth refresh and token injection.",
    article_headline: "Slack MCP via wmcp.sh",
    article_description: "Hosted MCP server for the Slack Web API with OAuth auto-injection.",
    comparison_headers: ["Capability", "@slack/bolt SDK", "Composio Slack", "wmcp.sh"],
    comparison_rows: [
      ["Setup time", "Install bolt + manage tokens", "Composio platform + per-customer OAuth", "Sign in to Slack once"],
      ["Method coverage", "Reflects current SDK version", "Curated common methods", "Every Web API method"],
      ["Multi-workspace", "You wire installation flow", "Composio manages", "Per-wmcp-user OAuth in vault"],
      ["MCP shape", "Wrap each method yourself", "Auto-mapped", "Native MCP tools"],
      ["Realtime / RTM", "Yes (sockets)", "Webhook → workflow", "Webhook in roadmap; not v0"],
      ["Cost", "Free SDK + your hosting", "Platform tier", "Free 100/day + $99/mo Pro"],
    ],
    tools: [
      { name: "chat.postMessage", type: "Live action", returns: "Message ts + channel" },
      { name: "chat.update", type: "Live action", returns: "Updated message" },
      { name: "conversations.list", type: "Live action", returns: "Channel list (public + private)" },
      { name: "conversations.history", type: "Live action", returns: "Channel message history" },
      { name: "conversations.create", type: "Live action", returns: "New channel" },
      { name: "users.list", type: "Live action", returns: "Workspace user directory" },
      { name: "users.lookupByEmail", type: "Live action", returns: "User by email" },
      { name: "reactions.add", type: "Live action", returns: "OK + reaction" },
    ],
    code_example: {
      lang: "Python — Slack bot powered by Claude",
      code_html: `<span class="k">from</span> wmcp <span class="k">import</span> WmcpClient
<span class="k">from</span> wmcp.anthropic <span class="k">import</span> to_anthropic_tools, execute_tool_use
<span class="k">from</span> anthropic <span class="k">import</span> Anthropic

client = WmcpClient(api_key=<span class="s">"webmcp_live_…"</span>)
spec   = <span class="s">"https://api.slack.com/specs/openapi/v2/slack_web.json"</span>
tools  = [t <span class="k">for</span> t <span class="k">in</span> client.tools(spec)
          <span class="k">if</span> t.name <span class="k">in</span> {<span class="s">"chat_postMessage"</span>, <span class="s">"conversations_list"</span>, <span class="s">"users_lookupByEmail"</span>}]

anthropic = Anthropic()
msg = anthropic.messages.create(
    model=<span class="s">"claude-opus-4-7"</span>,
    max_tokens=1024,
    tools=to_anthropic_tools(tools),
    messages=[{<span class="s">"role"</span>: <span class="s">"user"</span>,
               <span class="s">"content"</span>: <span class="s">"DM the #eng channel: 'deploy starting at 3pm PT'."</span>}],
)

<span class="k">for</span> block <span class="k">in</span> msg.content:
    <span class="k">if</span> block.type == <span class="s">"tool_use"</span>:
        <span class="c"># Worker injects your connected Slack OAuth token</span>
        result = execute_tool_use(client, spec, block.model_dump())
        <span class="k">print</span>(result)`,
    },
    faqs: [
      {
        q: "Which Slack scopes does wmcp.sh request?",
        a_html:
          "<code>chat:write</code>, <code>channels:read</code>, <code>channels:history</code>, <code>users:read</code>. Sufficient for posting, reading public channel history, and looking up users. Configure your own Slack app for tighter or broader scope.",
      },
      {
        q: "Can it post into private channels?",
        a_html:
          "Yes, but the bot/user has to be a member of that channel — Slack permission model. Default scopes don't include <code>groups:write</code>; add it in your Slack app config and re-OAuth if needed.",
      },
      {
        q: "How are Slack webhooks (event subscriptions) handled?",
        a_html:
          "Out of scope for v0. wmcp.sh covers the request-side API. If you need to receive Slack events, set up a separate Cloudflare Worker or Pipedream flow and have it call wmcp.sh tools in response. Native event handling is on the roadmap.",
      },
      {
        q: "Multi-workspace support?",
        a_html:
          "Yes — each wmcp.sh user connects their own Slack workspace via the dashboard. The worker stores tokens per (wmcp_user_id, provider_id) so an agent acting on behalf of user A vs user B hits the right workspace automatically.",
      },
      {
        q: "Slack rate limits?",
        a_html:
          "Slack rate-limits per method tier (Tier 1: ~1/min, Tier 4: ~100/min). wmcp.sh respects 429 responses and surfaces them to your agent without retrying — you decide back-off strategy per use case.",
      },
    ],
  });
}
