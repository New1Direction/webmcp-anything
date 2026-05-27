import { integrationPageHtml } from "./integration_template";

export function integrationLinearHtml(origin: string): string {
  return integrationPageHtml({
    origin,
    provider_id: "linear",
    provider_name: "Linear",
    title: "Linear MCP — Claude + Linear issues, projects, comments | wmcp.sh",
    description:
      "Hosted MCP server for Linear. Create issues, query projects, comment, transition states — from any AI agent. Connect Linear once in wmcp.sh; tokens auto-inject.",
    h1: "Claude + Linear — issue tracking, agent-shaped.",
    sub:
      "Linear's API is GraphQL-only. wmcp.sh wraps the common operations as MCP tools so your agent can file bugs, comment on issues, move things across columns, and query projects without writing GraphQL. Connect Linear once; the worker injects your OAuth token on every call.",
    article_headline: "Linear MCP via wmcp.sh",
    article_description: "Hosted MCP server for Linear's API with OAuth auto-injection.",
    comparison_headers: ["Capability", "@linear/sdk", "Composio Linear", "wmcp.sh"],
    comparison_rows: [
      ["Setup time", "Install SDK + write GraphQL", "Platform + per-customer OAuth", "Connect Linear once"],
      ["GraphQL exposure", "Full — you write queries", "Abstracted via REST-ish methods", "Curated MCP tools (no GraphQL knowledge needed)"],
      ["Auth", "PAT or OAuth, you store", "Platform manages", "OAuth vault in wmcp.sh"],
      ["MCP shape", "Wrap each query yourself", "Auto-mapped", "Native MCP tools"],
      ["Webhooks", "Yes", "Platform → workflow", "Out of scope for v0"],
      ["Cost", "Free SDK", "Platform tier", "Free 100/day + $29/mo Pro"],
    ],
    tools: [
      { name: "issueCreate", type: "Live action", returns: "New issue with ID + URL" },
      { name: "issueUpdate", type: "Live action", returns: "Updated issue" },
      { name: "issuesByTeam", type: "Live action", returns: "Filtered issue list" },
      { name: "issueSearch", type: "Live action", returns: "Issues matching query" },
      { name: "commentCreate", type: "Live action", returns: "New comment ID" },
      { name: "projectsByTeam", type: "Live action", returns: "Project list" },
      { name: "workflowStates", type: "Live action", returns: "State machine for a team" },
      { name: "myIssues", type: "Live action", returns: "Issues assigned to current user" },
    ],
    code_example: {
      lang: "Python — agent files a bug from a deploy log",
      code_html: `<span class="k">from</span> wmcp <span class="k">import</span> WmcpClient
<span class="k">from</span> wmcp.anthropic <span class="k">import</span> to_anthropic_tools, execute_tool_use
<span class="k">from</span> anthropic <span class="k">import</span> Anthropic

client = WmcpClient(api_key=<span class="s">"webmcp_live_…"</span>)
spec   = <span class="s">"https://wmcp.sh/api/v1/curated/linear"</span>   <span class="c"># curated tool list, not raw GraphQL</span>
tools  = client.tools(spec)

anthropic = Anthropic()
msg = anthropic.messages.create(
    model=<span class="s">"claude-opus-4-7"</span>,
    max_tokens=1024,
    tools=to_anthropic_tools(tools),
    messages=[{<span class="s">"role"</span>: <span class="s">"user"</span>,
               <span class="s">"content"</span>: <span class="s">"File a P1 bug in the BACKEND team: '/u/&lt;hash&gt; 500s on cold cache when seen: metadata missing'."</span>}],
)

<span class="k">for</span> block <span class="k">in</span> msg.content:
    <span class="k">if</span> block.type == <span class="s">"tool_use"</span>:
        <span class="c"># Worker injects your connected Linear OAuth token</span>
        result = execute_tool_use(client, spec, block.model_dump())
        <span class="k">print</span>(result)`,
    },
    faqs: [
      {
        q: "Does this support arbitrary GraphQL or curated tools only?",
        a_html:
          "Both. The curated tool list (above) covers ~80% of agent use cases without exposing GraphQL. For anything else, hit Linear's GraphQL endpoint directly via the OpenAPI-style passthrough — wmcp.sh injects auth, you craft the query.",
      },
      {
        q: "Which OAuth scopes does wmcp.sh request?",
        a_html:
          "<code>read</code> + <code>write</code> — covers all standard CRUD on issues, projects, comments, and labels. Linear doesn't support more granular scoping at the OAuth App level today.",
      },
      {
        q: "Team / project scoping?",
        a_html:
          "OAuth tokens are workspace-scoped. Within a workspace, the agent can act across any team the OAuth user has access to. Pass <code>teamId</code> in tool args to scope writes to a specific team.",
      },
      {
        q: "Rate limits?",
        a_html:
          "Linear's API has both per-user and per-IP rate limits (1500 / hour typical). wmcp.sh respects 429 responses. For bulk operations, batch via Linear's native batching where supported.",
      },
      {
        q: "Webhook support?",
        a_html:
          "Not in v0. wmcp.sh covers the request-side surface. If you need to receive Linear events, set up a separate webhook endpoint and have it call wmcp.sh tools in response.",
      },
    ],
  });
}
