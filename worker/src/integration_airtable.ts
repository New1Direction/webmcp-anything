import { integrationPageHtml } from "./integration_template";

export function integrationAirtableHtml(origin: string): string {
  return integrationPageHtml({
    origin,
    provider_id: "airtable",
    provider_name: "Airtable",
    title: "Airtable MCP — Connect Claude & AI Agents to Airtable API | wmcp.sh",
    description:
      "Expose Airtable's bases, tables, records, and fields as standardized Model Context Protocol tools via wmcp.sh. Zero-codegen OpenAPI integration with auto-injected tokens.",
    h1: "Claude + Airtable — manage no-code databases natively.",
    sub:
      "Expose Airtable's developer API—including base schema lookups, record creation, page listings, and cell edits—directly to Cursor, Claude Desktop, or LangChain agents via the open MCP standard.",
    article_headline: "Airtable MCP — Exposing Base and Table Tools to Claude",
    article_description:
      "Hosted MCP server mapping Airtable spec definitions to standardized tools.",
    comparison_headers: ["Capability", "Airtable SDK", "Composio Airtable", "wmcp.sh"],
    comparison_rows: [
      ["Setup time", "Install SDK + token wiring", "Platform auth configurations", "Sign in & provide Personal Access Token — done"],
      ["Interoperability", "Locked into Airtable client", "Custom wrapper", "Standard MCP — works with Claude/Cursor"],
      ["Spec updates", "Wait for SDK release", "Wait for platform update", "Instant spec resolution at the edge"],
      ["Latency", "80-200ms SDK bootstrap", "Platform router delays", "Sub-50ms Edge proxy resolution"],
      ["Tool Coverage", "Manual method mapping", "Curated subset", "Every public endpoint out-of-the-box"],
    ],
    tools: [
      { name: "bases/list", type: "Live action", returns: "Retrieve a list of accessible Airtable bases" },
      { name: "records/create", type: "Live action", returns: "Insert a new row/record into a table" },
      { name: "records/list", type: "Live action", returns: "Retrieve paginated table rows with filters" },
      { name: "records/update", type: "Live action", returns: "Modify cell values inside an existing record" },
    ],
    code_example: {
      lang: "Python — Claude adding a record to Airtable through wmcp.sh",
      code_html: `<span class="k">from</span> wmcp <span class="k">import</span> WmcpClient
<span class="k">from</span> wmcp.anthropic <span class="k">import</span> to_anthropic_tools, execute_tool_use
<span class="k">from</span> anthropic <span class="k">import</span> Anthropic

client = WmcpClient(api_key=<span class="s">"webmcp_live_…"</span>)
spec   = <span class="s">"https://airtable.com/developers/web/api/introduction"</span>  <span class="c"># or your base's spec URL</span>
tools  = client.tools(spec)

<span class="c"># Filter to record tools</span>
rec_tools = [t <span class="k">for</span> t <span class="k">in</span> tools <span class="k">if</span> t.name.startswith(<span class="s">"records"</span>)]

anthropic = Anthropic()
msg = anthropic.messages.create(
    model=<span class="s">"claude-3-5-sonnet-20241022"</span>,
    max_tokens=1024,
    tools=to_anthropic_tools(rec_tools),
    messages=[{<span class="s">"role"</span>: <span class="s">"user"</span>,
               <span class="s">"content"</span>: <span class="s">"Add a row to base 'app123' table 'Clients' with Name='Acme Corp'."</span>}],
)

<span class="k">for</span> block <span class="k">in</span> msg.content:
    <span class="k">if</span> block.type == <span class="s">"tool_use"</span>:
        result = execute_tool_use(client, spec, block.model_dump())
        <span class="k">print</span>(result)`,
    },
    faqs: [
      {
        q: "Do I need an Airtable Personal Access Token?",
        a_html:
          "Yes. You provide your own Airtable PAT in your secure client header or vault. wmcp.sh routes requests securely.",
      },
      {
        q: "How does this differ from the official Airtable SDK?",
        a_html:
          "The SDK requires locking your codebase into Airtable's client library. wmcp.sh maps the Airtable OpenAPI spec to the universal MCP standard, letting Claude Desktop, Claude Code, and other editors run Airtable actions natively.",
      },
      {
        q: "Are my API tokens secure?",
        a_html:
          "Yes. wmcp.sh routes all requests through our secure PKCE credentials proxy. Your keys are encrypted out-of-band and never exposed in the LLM context.",
      },
    ],
  });
}
