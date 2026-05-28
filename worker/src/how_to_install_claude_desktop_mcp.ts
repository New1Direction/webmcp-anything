export function howToInstallClaudeDesktopMcpHtml(origin: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>How to Install Claude Desktop MCP | wmcp.sh</title>
<meta name="description" content="Step-by-step guide to installing remote MCP servers in Claude Desktop using claude_desktop_config.json. Connect wmcp.sh to Anthropic's Claude.">
<link rel="canonical" href="\${origin}/how-to/install-claude-desktop-mcp" />
<meta property="og:title" content="How to Install Claude Desktop MCP | wmcp.sh" />
<meta property="og:description" content="Step-by-step: install remote MCP servers in Claude Desktop by editing claude_desktop_config.json. Connect wmcp.sh in 60 seconds." />
<meta property="og:url" content="\${origin}/how-to/install-claude-desktop-mcp" />
<meta property="og:image" content="\${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="How to Install Claude Desktop MCP" />
<meta name="twitter:description" content="Step-by-step Claude Desktop MCP setup." />
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article","headline":"How to Install Claude Desktop MCP","description":"Step-by-step guide to installing remote MCP servers in Claude Desktop via claude_desktop_config.json.","author":{"@type":"Organization","name":"WebMCP Anything"},"publisher":{"@type":"Organization","name":"WebMCP Anything","url":"https://wmcp.sh"},"datePublished":"2026-05-28","dateModified":"2026-05-28","mainEntityOfPage":"\${origin}/how-to/install-claude-desktop-mcp"}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
  {"@type":"Question","name":"Where does Claude Desktop store its MCP config?","acceptedAnswer":{"@type":"Answer","text":"On macOS: ~/Library/Application Support/Claude/claude_desktop_config.json. On Windows: %APPDATA%/Claude/claude_desktop_config.json. wmcp.sh is not affiliated with Anthropic."}},
  {"@type":"Question","name":"Do I need an API key to use wmcp.sh from Claude Desktop?","acceptedAnswer":{"@type":"Answer","text":"No. The public /api/v1/tools endpoint is free with rate limits. For higher limits or OAuth-vault access to providers like Stripe and Slack, sign in at wmcp.sh/dashboard."}}
]}
</script>
<style>
  :root { --bg: #0c0c14; --bg2: #11111c; --card: #161622; --border: #26263a; --text: #f0f0f5; --muted: #a0a0b0; --dim: #606070; --accent: #7c5cff; --accent2: #00e5ff; --pink: #ff3366; --green: #00e676; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: var(--bg); color: var(--text); margin: 0; padding: 0; line-height: 1.6; }
  .wrap { max-width: 920px; margin: 0 auto; padding: 0 24px; }
  nav { display:flex;justify-content:space-between;align-items:center;padding:22px 24px;max-width:1080px;margin:0 auto; }
  nav .brand { font-weight: 800; letter-spacing: -.02em; font-size: 1.05rem; }
  nav .brand span { color: var(--accent2); }
  nav .links { display: flex; gap: 22px; font-size: .9rem; }
  nav .links a { color: var(--muted); text-decoration: none; }
  nav .links a:hover { color: var(--text); }
  nav .cta { background: var(--bg2); border: 1px solid var(--border); padding: 7px 14px; border-radius: 8px; font-size: .85rem; color: var(--text); text-decoration: none; font-weight: 600; }
  header.hero { padding: 50px 0 30px; }
  .badge { display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;font-size:.7rem;letter-spacing:.15em;text-transform:uppercase;font-weight:700;background:linear-gradient(90deg,rgba(124,92,255,.18),rgba(0,229,255,.18));border:1px solid rgba(124,92,255,.35);margin-bottom:18px; }
  .dot { width:6px;height:6px;background:var(--accent2);border-radius:50%;box-shadow:0 0 8px var(--accent2); }
  h1 { font-size:clamp(2rem,4.5vw,3rem);margin:0 0 18px;background:linear-gradient(135deg,#fff 30%,var(--accent2) 100%);-webkit-background-clip:text;background-clip:text;color:transparent;line-height:1.05;font-weight:800;letter-spacing:-.02em; }
  .sub { color: var(--muted); font-size: 1.05rem; max-width: 640px; margin: 0 0 24px; }
  section { padding: 36px 0; }
  .section-label { display:inline-block;font-size:.72rem;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--accent2);margin-bottom:10px; }
  h2 { font-size:clamp(1.4rem,3vw,1.9rem);margin:0 0 12px;font-weight:700;letter-spacing:-.02em; }
  .section-sub { color: var(--muted); max-width: 640px; margin: 0 0 24px; }
  pre { background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px 18px;overflow-x:auto;font-size:.82rem;color:var(--green);font-family:"SF Mono",Menlo,monospace;line-height:1.5;margin:14px 0; }
  pre .k { color: var(--accent2); } pre .s { color: var(--pink); } pre .c { color: var(--dim); }
  ol { color: var(--muted); padding-left: 20px; font-size: 1rem; line-height: 1.8; }
  ol li { margin-bottom: 12px; }
  ol li strong { color: var(--text); }
  footer { border-top:1px solid var(--border);margin-top:40px;padding:30px 0;text-align:center;color:var(--muted);font-size:.85rem; }
  footer a { color: var(--accent2); text-decoration: none; margin: 0 8px; }
  .disclaimer { font-size: 0.8rem; color: var(--dim); margin-top: 20px; font-style: italic; }
</style>
</head>
<body>

<nav>
  <div class="brand"><a href="/" style="color:inherit;text-decoration:none">wmcp<span>.sh</span></a></div>
  <div class="links">
    <a href="/agent-ready">Agent-ready</a>
    <a href="/managed">Done for you</a>
    <a href="/price-data">Price data</a>
    <a href="/integration/openapi">OpenAPI</a>
    <a href="/directory">Directory</a>
  </div>
  <a class="cta" href="/directory/submit">Submit App →</a>
</nav>

<div class="wrap">

<header class="hero">
  <div class="badge"><span class="dot"></span> Guide &middot; Setup</div>
  <h1>How to install Claude Desktop MCP.</h1>
  <p class="sub">Extend Anthropic's Claude Desktop app with custom tools via the Model Context Protocol (MCP). In this guide, you'll learn how to modify your <code>claude_desktop_config.json</code> to attach wmcp.sh as a remote MCP server.</p>
</header>

<section id="intro">
  <p style="color:var(--muted);font-size:1.05rem;line-height:1.7;">The Model Context Protocol (MCP) allows Large Language Models to interact securely with external tools. While developers often use MCP inside custom python or node applications, you can also plug MCP servers directly into the official <strong>Claude Desktop</strong> app. This gives your local Claude client the ability to browse OpenAPI specs, fetch <a href="/price-data" style="color:var(--accent2);text-decoration:none">/price-data</a> in under 100ms, and interact with the web through <a href="/" style="color:var(--accent2);text-decoration:none">wmcp.sh</a>.</p>
</section>

<section id="step-by-step">
  <div class="section-label">Tutorial</div>
  <h2>Step-by-step configuration.</h2>
  <ol>
    <li><strong>Open Claude Desktop.</strong> Ensure you have the latest version of the Claude Desktop application installed on your Mac or Windows machine.</li>
    <li><strong>Navigate to Settings.</strong> Click on your profile or use the application menu to open the Settings pane.</li>
    <li><strong>Open Developer Settings.</strong> Go to the Developer tab. Here you will find an option to edit your MCP configuration.</li>
    <li><strong>Edit the Config File.</strong> Click the button to open <code>claude_desktop_config.json</code> in your default text editor. If the file doesn't exist yet, it will be created in your app data directory (e.g., <code>~/Library/Application Support/Claude/claude_desktop_config.json</code> on macOS).</li>
    <li><strong>Add the wmcp.sh Remote Server.</strong> We will use the standard <code>npx</code> command to run a lightweight local bridge that connects Claude Desktop to the remote <code>wmcp.sh</code> server over Server-Sent Events (SSE) or stdio. Anthropic provides an <code>@modelcontextprotocol/inspector</code>, but to connect a remote URL as an MCP server, you typically use a small node script or the provided npx runner.</li>
    <li><strong>Save and Restart.</strong> Save the <code>claude_desktop_config.json</code> file and restart Claude Desktop. The application will read the configuration and initialize the new MCP tools.</li>
  </ol>
</section>

<section id="config-code">
  <div class="section-label">Configuration</div>
  <h2>The exact JSON config.</h2>
  <p class="section-sub">Copy this JSON block into your <code>claude_desktop_config.json</code> file. This configuration uses a node script to proxy the remote streamable HTTP server from wmcp.sh into the local stdio transport Claude expects.</p>
  <pre><code>{
  "mcpServers": {
    "wmcp-sh-public": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-sse-client",
        "${origin}/api/v1/mcp/sse"
      ]
    }
  }
}</code></pre>
  <p style="color:var(--muted);font-size:.9rem;line-height:1.6;margin-top:16px;">Once you restart Claude Desktop, you will see a new "hammer" icon or tool indicator showing that the <code>wmcp-sh-public</code> server is active. You can then ask Claude things like: <em>"Use wmcp to fetch the OpenAPI spec for https://api.stripe.com/openapi.yaml and summarize the tools."</em></p>
</section>

<section id="troubleshooting">
  <div class="section-label">Help</div>
  <h2>Troubleshooting.</h2>
  <ul style="color:var(--muted);line-height:1.8;padding-left:20px;">
    <li><strong>Syntax Errors:</strong> Ensure your JSON is perfectly valid. Missing commas or unmatched braces will cause Claude Desktop to silently fail to load the tools.</li>
    <li><strong>Node.js Missing:</strong> The configuration above relies on <code>npx</code>, which means you must have Node.js installed on your machine and available in your system's PATH.</li>
    <li><strong>Network Latency:</strong> wmcp.sh is globally distributed on Cloudflare Workers, providing sub-100ms latency to the edge. However, the final connection speed depends on your local internet connection. Responses are returned from a short-TTL cache (~1s) where applicable.</li>
  </ul>
</section>

<section id="related">
  <div class="section-label">Related</div>
  <h2>Keep reading.</h2>
  <p class="section-sub">
    <a href="/how-to/expose-shopify-mcp" style="color:var(--accent2);text-decoration:none">/how-to/expose-shopify-mcp</a> &middot;
    <a href="/agent-ready" style="color:var(--accent2);text-decoration:none">/agent-ready</a> &middot;
    <a href="/managed" style="color:var(--accent2);text-decoration:none">/managed</a> &middot;
    <a href="/blog" style="color:var(--accent2);text-decoration:none">/blog</a> &middot;
    <a href="/directory" style="color:var(--accent2);text-decoration:none">/directory</a>
  </p>
</section>

<div class="disclaimer">
  Disclaimer: wmcp.sh is not affiliated with Anthropic. Claude and Claude Desktop are trademarks of Anthropic. All product names and brands are property of their respective owners.
</div>

</div>

<section id="upgrade" style="margin-top:36px;background:linear-gradient(135deg,var(--card),rgba(124,92,255,0.08));border:1px solid rgba(124,92,255,0.35);border-radius:16px;padding:22px 26px;max-width:920px;margin-left:auto;margin-right:auto;">
  <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;justify-content:space-between">
    <div style="flex:1;min-width:240px">
      <div style="font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent2);font-weight:700;margin-bottom:6px">Need this done for you?</div>
      <h3 style="margin:0 0 4px;font-size:1.05rem;color:var(--text)">Skip the wiring — we build, deploy, and monitor.</h3>
      <p style="color:var(--muted);margin:0;font-size:.92rem">Custom adapter + hosted MCP at <code>mcp.yourbrand.com</code> + verified badge. From <strong style="color:var(--text)">$499 one-time setup</strong>.</p>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <a href="/managed" style="display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#7c5cff,#00e5ff);color:#0c0c14;padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:700;font-size:.9rem">See /managed →</a>
      <a href="/directory/submit" style="display:inline-flex;align-items:center;gap:6px;background:#11111c;border:1px solid #26263a;color:var(--text);padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:600;font-size:.9rem">Submit (free)</a>
    </div>
  </div>
</section>

<footer>
  <a href="/">Home</a> · <a href="/agent-ready">Agent-ready</a> · <a href="/managed">Done for you</a> · <a href="/price-data">Price data</a> · <a href="/integration/openapi">OpenAPI</a> · <a href="/directory">Directory</a> · <a href="/directory/submit">Submit</a>
</footer>

</body>
</html>`;
}
