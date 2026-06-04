import { integrationPageHtml } from "./integration_template";

export function integrationGithubHtml(origin: string): string {
  return integrationPageHtml({
    origin,
    provider_id: "github",
    provider_name: "GitHub",
    title: "GitHub MCP — Claude + GitHub via OpenAPI, no SDK | wmcp.sh",
    description:
      "Give Claude or any AI agent full GitHub API access via wmcp.sh. Ingests GitHub's published OpenAPI spec, auto-injects your OAuth token. No Octokit, no codegen — every repo, issue, PR, gist, and workflow as MCP tools.",
    h1: "Claude + GitHub — full API, zero SDK.",
    sub:
      "GitHub publishes a canonical OpenAPI 3 spec covering every REST endpoint. wmcp.sh ingests it and serves you ~900 MCP tools, with your GitHub OAuth token auto-injected from the wmcp.sh sign-in. Same flow for Octokit alternatives, gh CLI scripts, and Composio replacements.",
    article_headline: "GitHub MCP — Claude + GitHub via OpenAPI",
    article_description:
      "Hosted MCP server for the GitHub API. OpenAPI ingestion + auto-injected OAuth from wmcp.sh sign-in.",
    comparison_headers: ["Capability", "Octokit / gh CLI", "Composio GitHub", "wmcp.sh"],
    comparison_rows: [
      ["Setup time", "Install SDK + token wiring", "Platform signup + auth flow", "Sign in with GitHub — done"],
      ["Coverage", "SDK reflects current GitHub API version", "Curated common ops", "Every documented endpoint (~900)"],
      ["New endpoints", "Wait for SDK release", "Wait for platform update", "Available the moment GitHub publishes"],
      ["Auth", "PAT or app token, you store it", "OAuth via Composio platform", "GitHub OAuth from wmcp.sh sign-in"],
      ["MCP shape", "Wrap each method yourself", "Auto-mapped", "Native MCP / tool_use"],
      ["Cost", "Free SDK + your hosting", "Platform tier", "Free 100/day + $99/mo Pro"],
    ],
    tools: [
      { name: "repos/getRepo", type: "Live action", returns: "Repo metadata + stats" },
      { name: "issues/createIssue", type: "Live action", returns: "Created issue with number + URL" },
      { name: "issues/listForRepo", type: "Live action", returns: "Open issue list (paginated)" },
      { name: "pulls/list", type: "Live action", returns: "PRs with state, base/head, mergeable status" },
      { name: "pulls/createPullRequest", type: "Live action", returns: "New PR with number + URL" },
      { name: "gists/createGist", type: "Live action", returns: "Gist URL" },
      { name: "actions/listWorkflowRuns", type: "Live action", returns: "CI run history" },
      { name: "search/code", type: "Live action", returns: "Code search results" },
    ],
    code_example: {
      lang: "Python — agent files an issue",
      code_html: `<span class="k">from</span> wmcp <span class="k">import</span> WmcpClient
<span class="k">from</span> wmcp.anthropic <span class="k">import</span> to_anthropic_tools, execute_tool_use
<span class="k">from</span> anthropic <span class="k">import</span> Anthropic

client = WmcpClient(api_key=<span class="s">"webmcp_live_…"</span>)
spec   = <span class="s">"https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.json"</span>
tools  = client.tools(spec)

<span class="c"># 900+ tools is too many. Filter to Issues subset.</span>
issue_tools = [t <span class="k">for</span> t <span class="k">in</span> tools <span class="k">if</span> t.name.lower().startswith(<span class="s">"issues"</span>)]

anthropic = Anthropic()
msg = anthropic.messages.create(
    model=<span class="s">"claude-opus-4-7"</span>,
    max_tokens=1024,
    tools=to_anthropic_tools(issue_tools),
    messages=[{<span class="s">"role"</span>: <span class="s">"user"</span>,
               <span class="s">"content"</span>: <span class="s">"File a bug in New1Direction/webmcp-anything: '/u/&lt;hash&gt; returns 500 on cold cache'."</span>}],
)

<span class="k">for</span> block <span class="k">in</span> msg.content:
    <span class="k">if</span> block.type == <span class="s">"tool_use"</span>:
        <span class="c"># Worker auto-injects your signed-in GitHub OAuth token. Agent passes no auth.</span>
        result = execute_tool_use(client, spec, block.model_dump())
        <span class="k">print</span>(result)`,
    },
    faqs: [
      {
        q: "Do I need a Personal Access Token?",
        a_html:
          "No. If you've signed in to wmcp.sh with GitHub OAuth (the dashboard sign-in flow), your token is already stored and auto-injected on every <code>api.github.com</code> call. PATs still work if you prefer — pass via <code>_auth</code> arg.",
      },
      {
        q: "What scopes does wmcp.sh's GitHub OAuth grant?",
        a_html:
          "Sign-in flow requests <code>read:user user:email repo gist read:org workflow</code> — covers repo CRUD, gists, org info, and workflow runs. The scope set is a union of sign-in and connector scopes so one OAuth round serves both.",
      },
      {
        q: "How does this differ from Composio's GitHub connector?",
        a_html:
          "Composio maintains a curated set of operations. wmcp.sh ingests the canonical OpenAPI spec — every endpoint available, including newly-shipped ones, with zero version lag. Composio wins on per-customer auth UX; wmcp wins on completeness.",
      },
      {
        q: "Tool count is too high (~900) — how to narrow?",
        a_html:
          "Filter client-side by name prefix or tag. <code>tools.filter(t =&gt; t.name.startsWith(\"issues\"))</code> for Issues only, etc. Most agent frameworks struggle past ~50 tools in a single message; filtering is essential.",
      },
      {
        q: "Can I use GitHub Apps instead of OAuth Apps?",
        a_html:
          "Not in v0 — wmcp.sh's GitHub provider is registered as an OAuth App. GitHub Apps (installation tokens) need their own auth flow; raise an issue if your use case needs it.",
      },
    ],
  });
}
