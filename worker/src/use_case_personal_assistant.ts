// /use-case/personal-assistant — use-case page. SERP target: "how to build a personal ai assistant",
// "ai personal assistant mcp", "gmail calendar ai agent", "claude personal assistant", "morning briefing ai".

export function useCasePersonalAssistantHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>How to Build a Personal AI Assistant — Calendar, Email, Notes, Tasks — wmcp.sh</title>
<meta name="description" content="Build a personal AI assistant that runs a morning briefing across Gmail, Calendar, Drive, and Notion. Wire Google Workspace and Notion as MCP tools — no per-app glue." />
<link rel="canonical" href="${origin}/use-case/personal-assistant" />
<meta property="og:title" content="How to Build a Personal AI Assistant — Calendar, Email, Notes, Tasks" />
<meta property="og:description" content="The morning-briefing pattern over Gmail, Calendar, Drive, Sheets, and Notion. MCP tools, not glue code." />
<meta property="og:url" content="${origin}/use-case/personal-assistant" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="How to Build a Personal AI Assistant" />
<meta name="twitter:description" content="Morning briefing across Gmail, Calendar, Drive, Sheets, and Notion — wired as MCP tools." />
<meta name="twitter:image" content="${origin}/og.png" />
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article","headline":"How to Build a Personal AI Assistant with Calendar, Email, Notes, and Task Tools","description":"Wire Gmail, Calendar, Drive, Sheets, and Notion into a morning-briefing personal assistant loop using MCP tools.","author":{"@type":"Organization","name":"WebMCP Anything"},"publisher":{"@type":"Organization","name":"WebMCP Anything","url":"https://wmcp.sh"},"datePublished":"2026-05-28","dateModified":"2026-05-28","mainEntityOfPage":"${origin}/use-case/personal-assistant"}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
  {"@type":"Question","name":"What is a personal AI assistant?","acceptedAnswer":{"@type":"Answer","text":"A small agent loop scoped to one user that reads across their personal tooling — inbox, calendar, notes, tasks — and produces a brief, drafts, or schedule. It's the morning-briefing pattern: by 8am the assistant knows what's on the calendar, what important email landed overnight, what tasks slipped, and surfaces a one-page summary."}},
  {"@type":"Question","name":"Which tools should the assistant have?","acceptedAnswer":{"@type":"Answer","text":"Email read (Gmail), Calendar read + freebusy + draft event (Google Calendar), Drive + Sheets read (for tracking spreadsheets), and Notion read + write (for notes and tasks). All available through wmcp.sh's /integration/google and /integration/notion adapters."}},
  {"@type":"Question","name":"Is this just ChatGPT with plugins?","acceptedAnswer":{"@type":"Answer","text":"Conceptually similar, but with three differences. First, you pick the model — Claude, GPT, or open weights. Second, tool access is scoped per-method (read-only Gmail vs send) instead of all-or-nothing. Third, the assistant runs in your account on your schedule, not on a vendor cron. wmcp.sh is not affiliated with OpenAI or Anthropic."}},
  {"@type":"Question","name":"How do I keep an assistant from sending email on my behalf?","acceptedAnswer":{"@type":"Answer","text":"Scope its Gmail MCP tool to drafts.create only, never messages.send. wmcp.sh exposes each Gmail method as a separate MCP tool so the agent can write a draft to your drafts folder but cannot actually send. You review and click send manually."}},
  {"@type":"Question","name":"How is this different from Apple Intelligence or Google Gemini in Workspace?","acceptedAnswer":{"@type":"Answer","text":"Built-in vendor assistants are good but locked into their ecosystem. A custom MCP-backed assistant runs on the model you pick, sees across Google + Notion + any other system you wire, and can be self-hosted for privacy. wmcp.sh is not affiliated with Apple, Google, or Microsoft."}}
]}
</script>
<style>
  :root { --bg:#07070d;--card:#16161f;--bg2:#11111c;--border:#26263a;--text:#ececf5;--muted:#8a8aa8;--dim:#6a6a88;--accent:#7c5cff;--accent2:#00e5ff;--green:#4ade80;--red:#f87171;--pink:#f0abfc;--gold:#fbbf24; }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin:0;min-height:100vh;color:var(--text);background:var(--bg);font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif;line-height:1.6;background-image:radial-gradient(ellipse 900px 600px at 10% -5%,rgba(124,92,255,.18),transparent 60%),radial-gradient(ellipse 700px 500px at 95% 10%,rgba(0,229,255,.10),transparent 60%); }
  .wrap { max-width: 920px; margin: 0 auto; padding: 0 24px; }
  nav { display:flex;justify-content:space-between;align-items:center;padding:22px 24px;max-width:1080px;margin:0 auto; }
  nav .brand { font-weight: 800; letter-spacing: -.02em; font-size: 1.05rem; }
  nav .brand span { color: var(--accent2); }
  nav .links { display: flex; gap: 22px; font-size: .9rem; }
  nav .links a { color: var(--muted); text-decoration: none; }
  nav .cta { background: var(--bg2); border: 1px solid var(--border); padding: 7px 14px; border-radius: 8px; font-size: .85rem; color: var(--text); text-decoration: none; font-weight: 600; }
  header.hero { padding: 50px 0 30px; }
  .badge { display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;font-size:.7rem;letter-spacing:.15em;text-transform:uppercase;font-weight:700;background:linear-gradient(90deg,rgba(124,92,255,.18),rgba(0,229,255,.18));border:1px solid rgba(124,92,255,.35);margin-bottom:18px; }
  .dot { width:6px;height:6px;background:var(--accent2);border-radius:50%;box-shadow:0 0 8px var(--accent2); }
  h1 { font-size:clamp(2.1rem,4.8vw,3.2rem);margin:0 0 18px;background:linear-gradient(135deg,#fff 30%,var(--accent2) 100%);-webkit-background-clip:text;background-clip:text;color:transparent;line-height:1.05;font-weight:800;letter-spacing:-.025em; }
  .sub { color: var(--muted); font-size: 1.05rem; max-width: 700px; margin: 0 0 24px; }
  section { padding: 36px 0; }
  .section-label { display:inline-block;font-size:.72rem;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--accent2);margin-bottom:10px; }
  h2 { font-size:clamp(1.4rem,3vw,1.9rem);margin:0 0 12px;font-weight:700;letter-spacing:-.02em; }
  h3 { font-size:1.1rem;margin:0 0 8px;font-weight:700; }
  .section-sub { color: var(--muted); max-width: 640px; margin: 0 0 24px; }
  pre { background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px 18px;overflow-x:auto;font-size:.82rem;color:var(--green);font-family:"SF Mono",Menlo,monospace;line-height:1.5;margin:14px 0; }
  pre .k { color: var(--accent2); } pre .s { color: var(--pink); } pre .c { color: var(--dim); }
  code { font-family: "SF Mono", Menlo, monospace; background: var(--bg2); padding: 1px 6px; border-radius: 4px; font-size: .85em; }
  table { width: 100%; border-collapse: collapse; text-align: left; font-size: .9rem; margin-top: 16px; }
  th, td { padding: 14px 16px; border-bottom: 1px solid var(--border); vertical-align: top; }
  th { background: var(--bg2); font-weight: 700; color: var(--accent2); }
  tr:last-child td { border-bottom: none; }
  td strong { color: var(--text); }
  td.ours { background: rgba(124,92,255,0.05); }
  details { background:var(--card);border:1px solid var(--border);border-radius:12px;padding:18px 20px;margin-bottom:12px; }
  details summary { font-weight: 700; font-size: 1rem; color: var(--text); cursor: pointer; list-style: none; }
  details[open] summary { margin-bottom: 12px; }
  details .answer { color: var(--muted); font-size: .92rem; line-height: 1.65; }
  .wins-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 18px; }
  @media (max-width: 720px) { .wins-grid { grid-template-columns: 1fr; } }
  .wins-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 22px; }
  .wins-card.us { border-color: var(--accent); background: linear-gradient(135deg, var(--card), rgba(124,92,255,0.06)); }
  .wins-card h3 { color: var(--text); margin-bottom: 12px; }
  .wins-card.us h3 { color: var(--accent2); }
  .wins-card ul { color: var(--muted); padding-left: 20px; margin: 0; font-size: .92rem; line-height: 1.7; }
  .wins-card li { margin-bottom: 6px; }
  .arch { background:var(--card);border:1px solid var(--border);border-radius:12px;padding:18px 20px;color:var(--muted);font-size:.92rem;line-height:1.65; }
  .arch strong { color: var(--text); }
  footer { border-top:1px solid var(--border);margin-top:40px;padding:30px 0;text-align:center;color:var(--muted);font-size:.85rem; }
  footer a { color: var(--accent2); text-decoration: none; margin: 0 8px; }
</style>
</head>
<body>

<nav>
  <div class="brand"><a href="/" style="color:inherit;text-decoration:none">wmcp<span>.sh</span></a></div>
  <div class="links">
    <a href="/agent-ready">Agent-ready</a>
    <a href="/managed">Done for you</a>
    <a href="/directory">Directory</a>
    <a href="/blog">Blog</a>
  </div>
  <a class="cta" href="/dashboard">Dashboard →</a>
</nav>

<div class="wrap">

<header class="hero">
  <div class="badge"><span class="dot"></span> Use Case &middot; personal-assistant</div>
  <h1>How to build a personal AI assistant.</h1>
  <p class="sub">The thing most people actually want from an AI assistant is the morning briefing: a one-page summary of what&rsquo;s on the calendar, what mattered in the inbox overnight, what tasks rolled over, and what&rsquo;s still open in the notes app. That&rsquo;s a tool-using loop over four boring APIs. The hard part is wiring Gmail, Calendar, Drive, and Notion into one coherent loop the model can actually run on schedule.</p>
</header>

<section id="wedge">
  <div class="section-label">The gap</div>
  <h2>Every prototype dies on OAuth and schemas.</h2>
  <p class="section-sub">A weekend personal-assistant project starts with enthusiasm and dies at OAuth refresh tokens. Then it almost works, until the model invents a calendar method name that doesn&rsquo;t exist, because the SDK shapes don&rsquo;t map cleanly to a tool schema. Then Notion&rsquo;s blocks API turns out to need three calls to read one page. Then it&rsquo;s Sunday and you&rsquo;ve built nothing.</p>
  <p class="section-sub">The shape that works: a tool gateway that already speaks Google Workspace and Notion, exposes typed MCP methods the model can call by name, and handles auth refresh under the hood. You ship the briefing prompt in an afternoon and spend Sunday on the actual question — what should land in your morning brief.</p>
  <p class="section-sub">wmcp.sh is that gateway. <a href="/integration/google" style="color:var(--accent2)">/integration/google</a> covers Gmail, Calendar, Drive, and Sheets; <a href="/integration/notion" style="color:var(--accent2)">/integration/notion</a> covers pages and databases. wmcp.sh is not affiliated with Google or Notion.</p>
</section>

<section id="architecture">
  <div class="section-label">Architecture</div>
  <h2>Cron → read → brief.</h2>
  <div class="arch">
    <p style="margin:0 0 10px"><strong>1. Cron trigger.</strong> A scheduler — Cloudflare Cron, GitHub Actions cron, or any host — fires every weekday at your wake time and invokes the assistant runner.</p>
    <p style="margin:0 0 10px"><strong>2. Tool gateway (wmcp.sh).</strong> The runner pulls MCP tools for Gmail (read-only), Calendar (read + freebusy), Drive + Sheets (read), and Notion (read + page-write for the brief output).</p>
    <p style="margin:0 0 10px"><strong>3. Reasoning loop.</strong> The model lists today&rsquo;s calendar events, scans the last 12 hours of inbox for VIP senders and explicit asks, reads the tracking sheet for habit metrics, and pulls open tasks from Notion.</p>
    <p style="margin:0"><strong>4. Output.</strong> The assistant writes a one-page brief to a dated Notion page and (optionally) emails a plain-text version to your inbox. Nothing gets sent or scheduled on your behalf.</p>
  </div>
</section>

<section id="capabilities">
  <div class="section-label">Tools the agent needs</div>
  <h2>What wmcp.sh provides.</h2>
  <table>
    <thead>
      <tr><th>Capability</th><th>Vendor</th><th>How wmcp.sh wires it</th></tr>
    </thead>
    <tbody>
      <tr><td><strong>Read recent email</strong></td><td>Gmail</td><td class="ours">✅ <a href="/integration/google" style="color:var(--accent2)">/integration/google</a> — scoped to <code>messages.list</code> + <code>messages.get</code></td></tr>
      <tr><td><strong>List today&rsquo;s events + freebusy</strong></td><td>Google Calendar</td><td class="ours">✅ <a href="/integration/google" style="color:var(--accent2)">/integration/google</a> — <code>events.list</code> + <code>freebusy.query</code></td></tr>
      <tr><td><strong>Read tracking spreadsheet</strong></td><td>Google Sheets</td><td class="ours">✅ <a href="/integration/google" style="color:var(--accent2)">/integration/google</a> — <code>spreadsheets.values.get</code></td></tr>
      <tr><td><strong>Read + write notes / tasks</strong></td><td>Notion</td><td class="ours">✅ <a href="/integration/notion" style="color:var(--accent2)">/integration/notion</a> — pages + databases</td></tr>
      <tr><td><strong>Draft (not send) email</strong></td><td>Gmail</td><td class="ours">✅ <code>drafts.create</code> only — never <code>messages.send</code></td></tr>
      <tr><td><strong>Inspect a public URL</strong></td><td>Any URL</td><td class="ours">✅ Generic <code>/api/v1/tools?url=...</code></td></tr>
    </tbody>
  </table>
</section>

<section id="code">
  <div class="section-label">Code</div>
  <h2>The morning-briefing loop.</h2>
  <p class="section-sub">Python sketch. Runs on cron, reads across Google + Notion, writes a one-page brief to a dated Notion page. Never sends mail, never books meetings.</p>
  <pre><code><span class="k">import</span> httpx
<span class="k">from</span> datetime <span class="k">import</span> date
<span class="k">from</span> anthropic <span class="k">import</span> Anthropic

client = Anthropic()
WMCP = <span class="s">"${origin}"</span>

<span class="k">def</span> tools_for(url):
    <span class="k">return</span> httpx.get(<span class="s">f"{WMCP}/api/v1/tools"</span>, params={<span class="s">"url"</span>: url}).json()[<span class="s">"tools"</span>]

tools = (
    tools_for(<span class="s">"https://gmail.googleapis.com"</span>)
    + tools_for(<span class="s">"https://www.googleapis.com/calendar/v3"</span>)
    + tools_for(<span class="s">"https://sheets.googleapis.com"</span>)
    + tools_for(<span class="s">"https://api.notion.com/v1"</span>)
)

today = date.today().isoformat()

msg = client.messages.create(
    model=<span class="s">"claude-sonnet-4-5"</span>,
    max_tokens=2048,
    tools=tools,
    messages=[{<span class="s">"role"</span>: <span class="s">"user"</span>,
        <span class="s">"content"</span>: <span class="s">f"Morning brief for {today}. List today's calendar, summarize the last 12h "</span>
                   <span class="s">"of inbox for VIPs and explicit asks, read the habits sheet, and list open tasks "</span>
                   <span class="s">"from Notion. Write the brief to a new Notion page titled 'Brief — {today}'. "</span>
                   <span class="s">"Never send email. Never auto-schedule."</span>}],
)

<span class="k">print</span>(msg.content)</code></pre>
</section>

<section id="wins">
  <div class="section-label">Where we win</div>
  <h2>Weekend project vs MCP gateway.</h2>
  <div class="wins-grid">
    <div class="wins-card">
      <h3>Hand-rolled prototype:</h3>
      <ul>
        <li>OAuth refresh tokens, written by hand for each app</li>
        <li>Model hallucinates method names that don&rsquo;t exist</li>
        <li>Notion blocks API requires custom flattening</li>
        <li>Every new tool is another adapter weekend</li>
      </ul>
    </div>
    <div class="wins-card us">
      <h3>wmcp.sh tool gateway:</h3>
      <ul>
        <li>OAuth handled at the gateway, tokens cached</li>
        <li>Typed MCP tools — the model calls real method names</li>
        <li>Notion adapter flattens blocks for you</li>
        <li>Add a tool by adding a URL — no new adapter</li>
      </ul>
    </div>
  </div>
</section>

<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions.</h2>
  <details><summary>What is a personal AI assistant?</summary><div class="answer">A scheduled loop over your personal tools — inbox, calendar, notes — that produces a brief or drafts.</div></details>
  <details><summary>Which tools should it have?</summary><div class="answer">Gmail read, Calendar read + freebusy, Drive + Sheets read, Notion read + write.</div></details>
  <details><summary>Is this just ChatGPT with plugins?</summary><div class="answer">Similar in concept. Differences: you pick the model, tool access is per-method, and the loop runs in your account on your schedule.</div></details>
  <details><summary>How do I stop it sending email on my behalf?</summary><div class="answer">Scope Gmail to <code>drafts.create</code> only. Never wire <code>messages.send</code>.</div></details>
  <details><summary>How is this different from Apple Intelligence or Gemini in Workspace?</summary><div class="answer">Built-in assistants are locked to their ecosystems. A custom MCP agent runs on the model you pick and sees across Google + Notion + anything else you wire.</div></details>
</section>

<section id="related">
  <div class="section-label">Related</div>
  <h2>Keep exploring.</h2>
  <p class="section-sub">
    <a href="/integration/google" style="color:var(--accent2);text-decoration:none">/integration/google</a> &middot;
    <a href="/integration/notion" style="color:var(--accent2);text-decoration:none">/integration/notion</a> &middot;
    <a href="/agent-ready" style="color:var(--accent2);text-decoration:none">/agent-ready</a> &middot;
    <a href="/use-case/sales-assistant" style="color:var(--accent2);text-decoration:none">/use-case/sales-assistant</a> &middot;
    <a href="/use-case/customer-support" style="color:var(--accent2);text-decoration:none">/use-case/customer-support</a>
  </p>
</section>

</div>

<section id="upgrade" style="margin-top:36px;background:linear-gradient(135deg,var(--card),rgba(124,92,255,0.08));border:1px solid rgba(124,92,255,0.35);border-radius:16px;padding:22px 26px">
  <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;justify-content:space-between">
    <div style="flex:1;min-width:240px">
      <div style="font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent2);font-weight:700;margin-bottom:6px">Need this built for you?</div>
      <h3 style="margin:0 0 4px;font-size:1.05rem;color:var(--text)">Hosted personal assistant, OAuth + cron handled.</h3>
      <p style="color:var(--muted);margin:0;font-size:.92rem">Custom adapter + hosted MCP at <code>mcp.yourbrand.com</code> + verified badge. <strong style="color:var(--text)">Starter $499 one-time</strong> · Managed Retainer $999/mo · Enterprise $4,999+/mo.</p>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <a href="/managed" style="display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#7c5cff,#00e5ff);color:#0c0c14;padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:700;font-size:.9rem">See /managed →</a>
      <a href="/directory/submit" style="display:inline-flex;align-items:center;gap:6px;background:#11111c;border:1px solid #26263a;color:var(--text);padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:600;font-size:.9rem">Submit (free)</a>
    </div>
  </div>
</section>

<footer>
  <a href="/">Home</a> · <a href="/agent-ready">Agent-ready</a> · <a href="/managed">Done for you</a> · <a href="/directory">Directory</a> · <a href="/directory/submit">Submit</a> · <a href="/blog">Blog</a> · <a href="/use-case/customer-support">Support</a> · <a href="/use-case/research-agent">Research</a> · <a href="/use-case/sales-assistant">Sales</a> · <a href="/use-case/code-review-bot">Code review</a>
</footer>

</body>
</html>`;
}
