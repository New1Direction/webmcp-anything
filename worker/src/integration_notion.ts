import { integrationPageHtml } from "./integration_template";

export function integrationNotionHtml(origin: string): string {
  return integrationPageHtml({
    origin,
    provider_id: "notion",
    provider_name: "Notion",
    title: "Notion MCP — Claude + Notion API, search, pages, databases | wmcp.sh",
    description:
      "Hosted MCP server for Notion. Search workspace, create pages, query databases, append blocks. Connect Notion once in wmcp.sh; OAuth tokens auto-inject into agent tool calls.",
    h1: "Claude + Notion — read, write, query.",
    sub:
      "Notion's API is REST-shaped but its data model is unusual — pages, blocks, databases, properties, all schema-flexible. wmcp.sh wraps it as clean MCP tools your agent can call without learning Notion's quirks. Connect once, the worker handles OAuth.",
    article_headline: "Notion MCP via wmcp.sh",
    article_description: "Hosted MCP server for the Notion API with OAuth auto-injection.",
    comparison_headers: ["Capability", "@notionhq/client SDK", "Composio Notion", "wmcp.sh"],
    comparison_rows: [
      ["Setup time", "Install SDK + integration token", "Composio platform + OAuth flow", "Connect Notion once in dashboard"],
      ["Workspace OAuth", "Internal-only by default", "Composio manages", "Public OAuth + token vault"],
      ["MCP shape", "Wrap each call yourself", "Auto-mapped", "Native MCP tools"],
      ["Database queries", "Raw filter/sort JSON", "Curated query helpers", "Tool args mirror Notion's filter shape"],
      ["Pagination", "You handle cursors", "Composio handles", "Cursor surfaced to agent"],
      ["Cost", "Free SDK", "Platform tier", "Free 100/day + $29/mo Pro"],
    ],
    tools: [
      { name: "search", type: "Live action", returns: "Pages + databases matching a query" },
      { name: "pages.retrieve", type: "Live action", returns: "Page properties" },
      { name: "pages.create", type: "Live action", returns: "New page ID + URL" },
      { name: "blocks.children.append", type: "Live action", returns: "Appended blocks" },
      { name: "blocks.children.list", type: "Live action", returns: "Page content (blocks)" },
      { name: "databases.query", type: "Live action", returns: "Filtered + sorted rows" },
      { name: "databases.retrieve", type: "Live action", returns: "Database schema" },
      { name: "users.me", type: "Live action", returns: "Current OAuth user" },
    ],
    code_example: {
      lang: "Python — agent files a note into a Notion database",
      code_html: `<span class="k">from</span> wmcp <span class="k">import</span> WmcpClient
<span class="k">from</span> wmcp.anthropic <span class="k">import</span> to_anthropic_tools, execute_tool_use
<span class="k">from</span> anthropic <span class="k">import</span> Anthropic

client = WmcpClient(api_key=<span class="s">"webmcp_live_…"</span>)
spec   = <span class="s">"https://api.notion.com/openapi"</span>
tools  = [t <span class="k">for</span> t <span class="k">in</span> client.tools(spec)
          <span class="k">if</span> t.name <span class="k">in</span> {<span class="s">"pages_create"</span>, <span class="s">"databases_query"</span>, <span class="s">"search"</span>}]

anthropic = Anthropic()
msg = anthropic.messages.create(
    model=<span class="s">"claude-opus-4-7"</span>,
    max_tokens=1024,
    tools=to_anthropic_tools(tools),
    messages=[{<span class="s">"role"</span>: <span class="s">"user"</span>,
               <span class="s">"content"</span>: <span class="s">"Add a note to my Inbox database: 'follow up with stripe re: Connect verification'."</span>}],
)

<span class="k">for</span> block <span class="k">in</span> msg.content:
    <span class="k">if</span> block.type == <span class="s">"tool_use"</span>:
        <span class="c"># Worker auto-injects your connected Notion OAuth token</span>
        result = execute_tool_use(client, spec, block.model_dump())
        <span class="k">print</span>(result)`,
    },
    faqs: [
      {
        q: "Internal integration vs public OAuth?",
        a_html:
          "wmcp.sh's Notion provider is registered as a <strong>Public</strong> integration with OAuth — any wmcp user can connect their own Notion workspace. Internal integrations (single-workspace, no OAuth) work via the <code>_auth</code> arg if you'd rather pass the token directly.",
      },
      {
        q: "How does Notion's odd data model affect tool shape?",
        a_html:
          "Notion's pages-have-blocks-have-children model is preserved. Each tool's input schema mirrors Notion's REST request body shape. Your agent passes the same JSON Notion's SDK would — wmcp doesn't try to flatten or simplify the model.",
      },
      {
        q: "Can it read content from an existing page?",
        a_html:
          "Yes. <code>blocks.children.list</code> returns the block tree for a page. For nested content, recursively call on child blocks. The agent can also <code>pages.retrieve</code> for property values.",
      },
      {
        q: "Database queries — how does filtering work?",
        a_html:
          "<code>databases.query</code> accepts Notion's full filter/sort JSON. Tell the agent the database schema (or have it call <code>databases.retrieve</code> first), then have it build the filter. Compound filters with <code>and</code>/<code>or</code> nest as deep as Notion supports.",
      },
      {
        q: "Rate limits?",
        a_html:
          "Notion's API: 3 requests/second average per integration. wmcp.sh doesn't add its own throttle — your agent's bursting hits Notion directly. For high-throughput use, batch operations where Notion supports it (e.g. append multiple blocks in one <code>children.append</code> call).",
      },
    ],
  });
}
