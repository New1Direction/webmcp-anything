// /use-case/customer-support — use-case page. SERP target: "how to build a customer support agent",
// "ai customer support agent mcp", "zendesk intercom ai agent tools", "support triage llm".

export function useCaseCustomerSupportHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>How to Build an AI Customer Support Agent with MCP Tools — wmcp.sh</title>
<meta name="description" content="Build an AI customer support agent that triages, drafts, and escalates. Wire Zendesk, Intercom, Notion, Linear, and Slack as MCP tools in minutes — no glue code." />
<link rel="canonical" href="${origin}/use-case/customer-support" />
<meta property="og:title" content="How to Build an AI Customer Support Agent with MCP Tools" />
<meta property="og:description" content="Turn helpdesks, knowledge bases, and ticket trackers into agent-ready MCP tools. Triage, draft, escalate — without hand-rolled API glue." />
<meta property="og:url" content="${origin}/use-case/customer-support" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="How to Build an AI Customer Support Agent with MCP Tools" />
<meta name="twitter:description" content="Wire Zendesk, Intercom, Notion, Linear, and Slack as MCP tools. Triage → draft → escalate, in one loop." />
<meta name="twitter:image" content="${origin}/og.png" />
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article","headline":"How to Build an AI Customer Support Agent with MCP Tools","description":"Wire helpdesk, knowledge base, escalation, and handoff systems as MCP tools for a triage-draft-escalate support agent loop.","author":{"@type":"Organization","name":"WebMCP Anything"},"publisher":{"@type":"Organization","name":"WebMCP Anything","url":"https://wmcp.sh"},"datePublished":"2026-05-28","dateModified":"2026-05-28","mainEntityOfPage":"${origin}/use-case/customer-support"}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
  {"@type":"Question","name":"What tools does an AI customer support agent actually need?","acceptedAnswer":{"@type":"Answer","text":"A useful support agent needs four classes of tool: a helpdesk (Zendesk or Intercom) for reading and updating tickets, a knowledge base (Notion or a docs site) for grounded answers, an escalation tracker (Linear or Jira) to file engineering bugs, and a handoff channel (Slack or email) to loop in humans on edge cases."}},
  {"@type":"Question","name":"Can the agent draft replies without sending them?","acceptedAnswer":{"@type":"Answer","text":"Yes. The standard pattern is draft-only mode: the agent uses a read-only Zendesk or Intercom tool to fetch the ticket, calls a Notion search tool for relevant docs, and writes its proposed reply into a private internal note. A human reviews and clicks send. wmcp.sh exposes both read and write methods as separate MCP tools so you can scope agent permissions tightly."}},
  {"@type":"Question","name":"How do you stop a support agent from hallucinating refund policies?","acceptedAnswer":{"@type":"Answer","text":"Ground every answer in retrieved knowledge-base content. The agent should call a Notion search tool before drafting, include the retrieved passages in its context window, and cite the source page in its draft. If no relevant doc is found, the agent should escalate rather than guess."}},
  {"@type":"Question","name":"Is this better than Zendesk Answer Bot or Intercom Fin?","acceptedAnswer":{"@type":"Answer","text":"Different shape. Vendor bots run inside the vendor product on their model. A custom MCP-backed agent runs on your model of choice (Claude, GPT, or open-weights), sees across multiple systems in one loop (helpdesk + KB + Linear + Slack), and is portable. wmcp.sh is not affiliated with Zendesk or Intercom."}},
  {"@type":"Question","name":"How long does it take to wire up?","acceptedAnswer":{"@type":"Answer","text":"If your helpdesk exposes an OpenAPI spec, you can point /api/v1/tools at it and the agent has structured methods in seconds. For Notion and Slack, use the listed integration pages. End-to-end a working triage loop is typically a few hours of prompt and policy work, not weeks of plumbing."}}
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
  <div class="badge"><span class="dot"></span> Use Case &middot; customer-support</div>
  <h1>How to build an AI customer support agent.</h1>
  <p class="sub">Tier-1 support is mostly the same five questions read from three systems and answered from one wiki. The hard part isn&rsquo;t the model — it&rsquo;s wiring the helpdesk, the knowledge base, the bug tracker, and the human handoff channel into one coherent agent loop without writing four SDK adapters by hand.</p>
</header>

<section id="wedge">
  <div class="section-label">The gap</div>
  <h2>The integration tax kills support bots.</h2>
  <p class="section-sub">Every support team rebuilds the same plumbing: a Zendesk client, an Intercom client, a Notion search wrapper, a Slack notifier, retries, rate-limit handling, schemas the model can call. By the time you ship, you&rsquo;ve built more glue than agent. The reply quality you wanted got buried under a half-finished integration backlog.</p>
  <p class="section-sub">The shape of the work is identical across teams. What changes is which helpdesk, which wiki, which paging channel. That&rsquo;s exactly what a Model Context Protocol gateway is for: hand it a vendor URL or OpenAPI spec, get back schema-valid tools the agent can call.</p>
  <p class="section-sub">wmcp.sh is that gateway. It turns Zendesk, Intercom, Notion, Linear, and Slack endpoints into MCP-shaped tools your Claude or GPT agent can invoke directly — so you can spend the week on policy and prompts, not SDK wrappers. wmcp.sh is not affiliated with Zendesk, Intercom, Notion, Linear, or Slack.</p>
</section>

<section id="architecture">
  <div class="section-label">Architecture</div>
  <h2>Four components, one loop.</h2>
  <div class="arch">
    <p style="margin:0 0 10px"><strong>1. Inbox listener.</strong> A webhook on your helpdesk fires whenever a new ticket lands. The listener forwards the ticket ID into a queue (Cloudflare Queues, SQS, or any task runner) so each ticket gets its own agent run.</p>
    <p style="margin:0 0 10px"><strong>2. Tool gateway (wmcp.sh).</strong> The agent calls <code>${origin}/api/v1/tools?url=...</code> once at boot to materialize tool schemas for the helpdesk, the knowledge base, the bug tracker, and the handoff channel. The agent receives a unified MCP tool list.</p>
    <p style="margin:0 0 10px"><strong>3. Reasoning loop.</strong> The model (Claude Sonnet works well; wmcp.sh is not affiliated with Anthropic) reads the ticket, searches the KB, drafts a reply into the ticket as a private note, and decides whether to file a Linear escalation or page #support-eng in Slack.</p>
    <p style="margin:0"><strong>4. Human gate.</strong> A support engineer reviews the draft, edits, and clicks send. The agent never closes a ticket on its own; it only proposes. Audit logs land in your warehouse via /managed.</p>
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
      <tr><td><strong>Read &amp; update tickets</strong></td><td>Zendesk / Intercom</td><td class="ours">✅ Point <a href="/integration/openapi" style="color:var(--accent2)">/integration/openapi</a> at the vendor OpenAPI spec</td></tr>
      <tr><td><strong>Search policy / KB</strong></td><td>Notion</td><td class="ours">✅ Native adapter at <a href="/integration/notion" style="color:var(--accent2)">/integration/notion</a></td></tr>
      <tr><td><strong>File escalation ticket</strong></td><td>Linear</td><td class="ours">✅ OpenAPI adapter, scoped to <code>issues.create</code></td></tr>
      <tr><td><strong>Page on-call human</strong></td><td>Slack</td><td class="ours">✅ Native adapter at <a href="/integration/slack" style="color:var(--accent2)">/integration/slack</a></td></tr>
      <tr><td><strong>Scrape a status page</strong></td><td>Any public URL</td><td class="ours">✅ Generic web extraction via <code>/api/v1/tools?url=...</code></td></tr>
      <tr><td><strong>Audit log + replay</strong></td><td>Your warehouse</td><td class="ours">✅ Included on <a href="/managed" style="color:var(--accent2)">/managed</a></td></tr>
    </tbody>
  </table>
</section>

<section id="code">
  <div class="section-label">Code</div>
  <h2>Triage → draft → escalate.</h2>
  <p class="section-sub">Minimal Python loop using the Anthropic Messages API and wmcp.sh tool extraction. Drops your ticket ID in, gets a draft reply and an escalation decision out.</p>
  <pre><code><span class="k">import</span> os, httpx
<span class="k">from</span> anthropic <span class="k">import</span> Anthropic

client = Anthropic()
WMCP = <span class="s">"${origin}"</span>

<span class="c"># 1. Materialize MCP tools for each connected system</span>
<span class="k">def</span> tools_for(url):
    r = httpx.get(<span class="s">f"{WMCP}/api/v1/tools"</span>, params={<span class="s">"url"</span>: url})
    <span class="k">return</span> r.json()[<span class="s">"tools"</span>]

tools = (
    tools_for(<span class="s">"https://acme.zendesk.com/api/v2"</span>)
    + tools_for(<span class="s">"https://www.notion.so/acme-handbook"</span>)
    + tools_for(<span class="s">"https://api.linear.app"</span>)
    + tools_for(<span class="s">"https://slack.com/api"</span>)
)

<span class="c"># 2. Triage a single ticket</span>
ticket_id = os.environ[<span class="s">"TICKET_ID"</span>]
msg = client.messages.create(
    model=<span class="s">"claude-sonnet-4-5"</span>,
    max_tokens=2048,
    tools=tools,
    messages=[{<span class="s">"role"</span>: <span class="s">"user"</span>,
        <span class="s">"content"</span>: <span class="s">f"Triage ticket {ticket_id}. Search the handbook before drafting. "</span>
                   <span class="s">"Post the draft as a private internal note. If it's a bug, file a Linear "</span>
                   <span class="s">"issue and page #support-eng in Slack. Never close the ticket."</span>}],
)

<span class="k">print</span>(msg.content)  <span class="c"># tool_use blocks + final text</span></code></pre>
</section>

<section id="wins">
  <div class="section-label">Where we win</div>
  <h2>Hand-rolled vs MCP gateway.</h2>
  <div class="wins-grid">
    <div class="wins-card">
      <h3>Hand-rolled SDK glue:</h3>
      <ul>
        <li>Four vendor SDKs, four rate limit handlers</li>
        <li>Schemas drift every time a vendor adds a field</li>
        <li>Each new connector is a week of integration work</li>
        <li>No standard tool shape — the model has to be re-prompted per system</li>
      </ul>
    </div>
    <div class="wins-card us">
      <h3>wmcp.sh tool gateway:</h3>
      <ul>
        <li>One <code>/api/v1/tools</code> call returns schema-valid MCP tools</li>
        <li>Edge cached so tool listing is sub-50ms globally</li>
        <li>OpenAPI specs auto-translate to MCP tool definitions</li>
        <li>Add a fifth system by adding a fifth URL — no new SDK</li>
      </ul>
    </div>
  </div>
</section>

<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions.</h2>
  <details><summary>What tools does an AI customer support agent actually need?</summary><div class="answer">Helpdesk read/write, knowledge-base search, an escalation tracker, and a human handoff channel. Anything more is premature; anything less hallucinates.</div></details>
  <details><summary>Can the agent draft replies without sending them?</summary><div class="answer">Yes — keep the agent on read + internal-note write only, and let a human click send. wmcp.sh exposes read and write as separate MCP tools so you can scope permissions tightly.</div></details>
  <details><summary>How do you stop hallucinated refund policies?</summary><div class="answer">Ground every answer in a Notion search call. If no relevant page is returned, the agent should escalate, not guess.</div></details>
  <details><summary>Is this better than Zendesk Answer Bot or Intercom Fin?</summary><div class="answer">Different shape — vendor bots run on their model, inside their product. A custom MCP agent runs on your model and reads across systems in one loop. Pick the one that matches your audit and policy needs.</div></details>
  <details><summary>How long does it take to wire up?</summary><div class="answer">Hours, not weeks, if your helpdesk has an OpenAPI spec. The work that remains is prompt design, policy, and review UX.</div></details>
</section>

<section id="related">
  <div class="section-label">Related</div>
  <h2>Keep exploring.</h2>
  <p class="section-sub">
    <a href="/agent-ready" style="color:var(--accent2);text-decoration:none">/agent-ready</a> &middot;
    <a href="/integration/openapi" style="color:var(--accent2);text-decoration:none">/integration/openapi</a> &middot;
    <a href="/integration/notion" style="color:var(--accent2);text-decoration:none">/integration/notion</a> &middot;
    <a href="/integration/slack" style="color:var(--accent2);text-decoration:none">/integration/slack</a> &middot;
    <a href="/use-case/personal-assistant" style="color:var(--accent2);text-decoration:none">/use-case/personal-assistant</a>
  </p>
</section>

</div>

<section id="upgrade" style="margin-top:36px;background:linear-gradient(135deg,var(--card),rgba(124,92,255,0.08));border:1px solid rgba(124,92,255,0.35);border-radius:16px;padding:22px 26px">
  <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;justify-content:space-between">
    <div style="flex:1;min-width:240px">
      <div style="font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent2);font-weight:700;margin-bottom:6px">Need this built for you?</div>
      <h3 style="margin:0 0 4px;font-size:1.05rem;color:var(--text)">We wire the helpdesk, KB, and escalation paths.</h3>
      <p style="color:var(--muted);margin:0;font-size:.92rem">Custom adapter + hosted MCP at <code>mcp.yourbrand.com</code> + verified badge. <strong style="color:var(--text)">Starter $499 one-time</strong> · Managed Retainer $999/mo · Enterprise $4,999+/mo.</p>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <a href="/managed" style="display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#7c5cff,#00e5ff);color:#0c0c14;padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:700;font-size:.9rem">See /managed →</a>
      <a href="/directory/submit" style="display:inline-flex;align-items:center;gap:6px;background:#11111c;border:1px solid #26263a;color:var(--text);padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:600;font-size:.9rem">Submit (free)</a>
    </div>
  </div>
</section>

<footer>
  <a href="/">Home</a> · <a href="/agent-ready">Agent-ready</a> · <a href="/managed">Done for you</a> · <a href="/directory">Directory</a> · <a href="/directory/submit">Submit</a> · <a href="/blog">Blog</a> · <a href="/use-case/research-agent">Research</a> · <a href="/use-case/sales-assistant">Sales</a> · <a href="/use-case/code-review-bot">Code review</a> · <a href="/use-case/personal-assistant">Personal assistant</a>
</footer>

</body>
</html>`;
}
