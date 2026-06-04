import { integrationPageHtml } from "./integration_template";

export function integrationGoogleHtml(origin: string): string {
  return integrationPageHtml({
    origin,
    provider_id: "google",
    provider_name: "Google Workspace",
    title: "Google Workspace MCP — Gmail, Calendar, Drive, Sheets for Claude | wmcp.sh",
    description:
      "Hosted MCP server for Google Workspace. Gmail, Calendar, Drive, Sheets, Docs — all exposed as MCP tools via Google's published discovery docs. Connect Google once in wmcp.sh; tokens auto-inject.",
    h1: "Google Workspace — every API, one OAuth.",
    sub:
      "Google publishes machine-readable discovery docs for every Workspace API. wmcp.sh ingests them and your agent can read Gmail, schedule Calendar events, edit Sheets, search Drive — all from one Google sign-in. No SDKs to wrangle, no per-API token plumbing.",
    article_headline: "Google Workspace MCP via wmcp.sh",
    article_description: "Hosted MCP server for Gmail, Calendar, Drive, Sheets, Docs. One OAuth, all APIs.",
    comparison_headers: ["Capability", "Google API client libs", "Pipedream", "wmcp.sh"],
    comparison_rows: [
      ["Setup time", "Install client lib per API + OAuth dance", "Pipedream account + per-workflow auth", "Sign in once with Google"],
      ["APIs covered", "One lib per API", "Manual workflow per API", "Gmail + Cal + Drive + Sheets + Docs — one client"],
      ["MCP shape", "Wrap each call yourself", "Per-workflow", "Native MCP tools"],
      ["Token refresh", "You handle it", "Pipedream handles it", "Worker handles it (encrypted vault)"],
      ["Multi-user", "You wire per-user OAuth", "Per-account workflow", "Connected vault per wmcp user"],
      ["Cost", "Free libs", "Free tier + paid workflows", "Free 100/day + $99/mo Pro"],
    ],
    tools: [
      { name: "gmail.users.messages.list", type: "Live action", returns: "Inbox listing" },
      { name: "gmail.users.messages.send", type: "Live action", returns: "Sent message ID" },
      { name: "calendar.events.list", type: "Live action", returns: "Events in a date range" },
      { name: "calendar.events.insert", type: "Live action", returns: "Created event" },
      { name: "drive.files.list", type: "Live action", returns: "File metadata + IDs" },
      { name: "drive.files.get (export)", type: "Live action", returns: "File content" },
      { name: "sheets.spreadsheets.values.get", type: "Live action", returns: "Cell range values" },
      { name: "sheets.spreadsheets.values.update", type: "Live action", returns: "Updated range" },
    ],
    code_example: {
      lang: "TypeScript — agent schedules a calendar event",
      code_html: `<span class="k">import</span> { WmcpClient } <span class="k">from</span> <span class="s">"@wmcp/sdk"</span>;
<span class="k">import</span> { toAnthropicTools, executeToolUse } <span class="k">from</span> <span class="s">"@wmcp/sdk/anthropic"</span>;
<span class="k">import</span> Anthropic <span class="k">from</span> <span class="s">"@anthropic-ai/sdk"</span>;

<span class="k">const</span> client = <span class="k">new</span> WmcpClient({ apiKey: process.env.WMCP_API_KEY });
<span class="k">const</span> spec   = <span class="s">"https://calendar-json.googleapis.com/$discovery/rest?version=v3"</span>;
<span class="k">const</span> tools  = (<span class="k">await</span> client.tools(spec))
  .filter(t =&gt; t.name.includes(<span class="s">"events"</span>));

<span class="k">const</span> anthropic = <span class="k">new</span> Anthropic();
<span class="k">const</span> msg = <span class="k">await</span> anthropic.messages.create({
  model: <span class="s">"claude-opus-4-7"</span>,
  max_tokens: 1024,
  tools: toAnthropicTools(tools),
  messages: [{ role: <span class="s">"user"</span>, content: <span class="s">"Book 'sync w/ alex' tomorrow 2-3pm PT in my primary calendar."</span> }],
});

<span class="k">for</span> (<span class="k">const</span> block <span class="k">of</span> msg.content) {
  <span class="k">if</span> (block.type === <span class="s">"tool_use"</span>) {
    <span class="c">// Worker auto-injects your connected Google OAuth token</span>
    <span class="k">const</span> result = <span class="k">await</span> executeToolUse(client, spec, block);
    console.log(result);
  }
}`,
    },
    faqs: [
      {
        q: "Which Google APIs are covered?",
        a_html:
          "All Google APIs that publish a discovery doc — that's effectively every Workspace + Cloud API. Common ones: Gmail, Calendar, Drive, Sheets, Docs, People, Tasks, Forms, Chat. Cloud APIs (Storage, BigQuery, Compute) work too via their own discovery URLs.",
      },
      {
        q: "What scopes does wmcp.sh request on Google sign-in?",
        a_html:
          "<code>openid email profile</code> plus <code>gmail.modify</code>, <code>calendar</code>, <code>drive</code>, <code>spreadsheets</code>. Broad enough to cover most agent use cases without re-OAuth. Reduce in Google Cloud Console if you want tighter scope per integration.",
      },
      {
        q: "How is the OAuth refresh token stored?",
        a_html:
          "Encrypted with AES-GCM-256 in Cloudflare KV, keyed off your wmcp user ID. The encryption key is a worker secret you control (<code>TOKEN_ENC_KEY</code>). The refresh token's used internally by the worker — your agent code never sees it.",
      },
      {
        q: "Is Google's API rate-limiting a concern?",
        a_html:
          "Yes — Google enforces per-project + per-user quotas. wmcp.sh respects 429 responses and surfaces them to your agent. Sustained heavy use should be on Google's paid quota tier on your own Cloud project.",
      },
      {
        q: "Verification status (testing vs production)?",
        a_html:
          "Until wmcp.sh's Google Cloud project is verified (sensitive scopes like Gmail need verification), the OAuth consent screen stays in Testing mode — capped at 100 users. We've started the verification process; production-eligible by mid-2026.",
      },
    ],
  });
}
