// /use-case/content-moderation — use-case page. SERP target: "how to build an ai content moderation agent",
// "discord moderation bot ai", "slack ai moderation", "ai trust safety agent mcp".

export function useCaseContentModerationHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>How to Build an AI Content Moderation Agent — Platform & Storage Tools — wmcp.sh</title>
<meta name="description" content="Build an AI content moderation agent that flags, classifies, and actions posts across Discord and Slack. Wire platform APIs, policy docs, and storage as MCP tools." />
<link rel="canonical" href="${origin}/use-case/content-moderation" />
<meta property="og:title" content="How to Build an AI Content Moderation Agent" />
<meta property="og:description" content="A flag → classify → action loop over Discord, Slack, and Notion policy. Schema-valid MCP tools, no SDK glue." />
<meta property="og:url" content="${origin}/use-case/content-moderation" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="How to Build an AI Content Moderation Agent" />
<meta name="twitter:description" content="Flag, classify, action. Discord + Slack + Notion policy + image URL fetch — as MCP tools." />
<meta name="twitter:image" content="${origin}/og.png" />
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article","headline":"How to Build an AI Content Moderation Agent with Platform and Storage Tools","description":"Wire Discord, Slack, Notion policy, and image fetching into a flag-classify-action moderation loop using MCP tools.","author":{"@type":"Organization","name":"WebMCP Anything"},"publisher":{"@type":"Organization","name":"WebMCP Anything","url":"https://wmcp.sh"},"datePublished":"2026-05-28","dateModified":"2026-05-28","mainEntityOfPage":"${origin}/use-case/content-moderation"}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
  {"@type":"Question","name":"What does an AI content moderation agent do?","acceptedAnswer":{"@type":"Answer","text":"It watches messages on a platform (Discord channel, Slack workspace), classifies them against your policy, and proposes an action: leave alone, soft-warn, hide, escalate to a human. The agent reads the policy doc directly so when the rules change, the agent adapts without retraining."}},
  {"@type":"Question","name":"Should an AI agent take moderation actions on its own?","acceptedAnswer":{"@type":"Answer","text":"For low-stakes actions (adding a soft-warn reaction, hiding spam links) — yes, with audit. For high-stakes actions (bans, public removals) — no, route to a human queue. wmcp.sh exposes high-stakes and low-stakes methods as separate MCP tools so you can scope agent permissions tightly."}},
  {"@type":"Question","name":"How does it read images and links?","acceptedAnswer":{"@type":"Answer","text":"Discord and Slack messages embed URLs. The agent calls a generic /api/v1/tools?url=... fetcher to retrieve and inspect the destination — page text, OpenGraph metadata, image hashes. For multimodal classification of images themselves, pair with a vision-capable model."}},
  {"@type":"Question","name":"How do you avoid biased false positives?","acceptedAnswer":{"@type":"Answer","text":"Ground every decision in your written policy (stored in Notion or a wiki), require the agent to cite the specific policy clause for each action, and put any borderline call (confidence below a threshold) into a human review queue. Log everything to a warehouse for audit. wmcp.sh /managed bundles this audit layer."}},
  {"@type":"Question","name":"Which platforms are supported?","acceptedAnswer":{"@type":"Answer","text":"Discord via /integration/discord, Slack via /integration/slack, Notion for policy via /integration/notion, plus generic URL fetching. Anything with an OpenAPI spec — Reddit, Mastodon, Matrix — works through /integration/openapi. wmcp.sh is not affiliated with Discord, Slack, or Notion."}}
]}
</script>
<style>
  :root { --bg:#07070d;--card:#16161f;--bg2:#11111c;--border:#26263a;--text:#ececf5;--muted:#8a8aa8;--dim:#6a6a88;--accent:#ff9e2c;--accent2:#ffcf7a;--green:#4ade80;--red:#f87171;--pink:#ffb86b;--gold:#fbbf24; }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin:0;min-height:100vh;color:var(--text);background:var(--bg);font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif;line-height:1.6;background-image:radial-gradient(ellipse 900px 600px at 10% -5%,rgba(255,158,44,.18),transparent 60%),radial-gradient(ellipse 700px 500px at 95% 10%,rgba(255,176,0,.10),transparent 60%); }
  .wrap { max-width: 920px; margin: 0 auto; padding: 0 24px; }
  nav { display:flex;justify-content:space-between;align-items:center;padding:22px 24px;max-width:1080px;margin:0 auto; }
  nav .brand { font-weight: 800; letter-spacing: -.02em; font-size: 1.05rem; }
  nav .brand span { color: var(--accent2); }
  nav .links { display: flex; gap: 22px; font-size: .9rem; }
  nav .links a { color: var(--muted); text-decoration: none; }
  nav .cta { background: var(--bg2); border: 1px solid var(--border); padding: 7px 14px; border-radius: 8px; font-size: .85rem; color: var(--text); text-decoration: none; font-weight: 600; }
  header.hero { padding: 50px 0 30px; }
  .badge { display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;font-size:.7rem;letter-spacing:.15em;text-transform:uppercase;font-weight:700;background:linear-gradient(90deg,rgba(255,158,44,.18),rgba(255,176,0,.18));border:1px solid rgba(255,158,44,.35);margin-bottom:18px; }
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
  td.ours { background: rgba(255,158,44,0.05); }
  details { background:var(--card);border:1px solid var(--border);border-radius:12px;padding:18px 20px;margin-bottom:12px; }
  details summary { font-weight: 700; font-size: 1rem; color: var(--text); cursor: pointer; list-style: none; }
  details[open] summary { margin-bottom: 12px; }
  details .answer { color: var(--muted); font-size: .92rem; line-height: 1.65; }
  .wins-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 18px; }
  @media (max-width: 720px) { .wins-grid { grid-template-columns: 1fr; } }
  .wins-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 22px; }
  .wins-card.us { border-color: var(--accent); background: linear-gradient(135deg, var(--card), rgba(255,158,44,0.06)); }
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
  <div class="badge"><span class="dot"></span> Use Case &middot; content-moderation</div>
  <h1>How to build an AI content moderation agent.</h1>
  <p class="sub">Trust &amp; safety teams are drowning in the same triage pattern: a message lands, a moderator skims it, checks the policy wiki, takes one of five actions. That sequence is a tool-using loop. The hard part isn&rsquo;t getting a model to classify text — it&rsquo;s wiring the platform API, the policy doc, and the action surface into a clean, auditable loop a human can actually trust.</p>
</header>

<section id="wedge">
  <div class="section-label">The gap</div>
  <h2>Classification without grounding is just guessing.</h2>
  <p class="section-sub">Most moderation prototypes start with a model and a hardcoded prompt: &ldquo;flag if hateful, spam, or NSFW.&rdquo; That works for a week, until policy changes. Then someone has to redeploy. Then you discover the bot never looked at the linked URL, just the message text. Then it flags a benign meme as a slur because the prompt drifted.</p>
  <p class="section-sub">The shape that survives contact with real moderators: the agent reads your written policy on every decision, fetches and inspects any embedded URLs, classifies, and either acts (low stakes) or escalates (high stakes) — with a citation back to the policy clause in every log entry.</p>
  <p class="section-sub">wmcp.sh wires this in: <a href="/integration/discord" style="color:var(--accent2)">/integration/discord</a> and <a href="/integration/slack" style="color:var(--accent2)">/integration/slack</a> for the platform, <a href="/integration/notion" style="color:var(--accent2)">/integration/notion</a> for the policy doc, and the generic URL fetcher for any link in a message. wmcp.sh is not affiliated with Discord, Slack, or Notion.</p>
</section>

<section id="architecture">
  <div class="section-label">Architecture</div>
  <h2>Flag → classify → action.</h2>
  <div class="arch">
    <p style="margin:0 0 10px"><strong>1. Event source.</strong> A Discord bot or Slack app subscribes to messages in moderated channels and forwards the message ID into a queue. Each event gets its own bounded agent run.</p>
    <p style="margin:0 0 10px"><strong>2. Tool gateway (wmcp.sh).</strong> The agent boots with platform tools (Discord or Slack), a Notion search for policy, and a generic URL fetcher for any links in the message.</p>
    <p style="margin:0 0 10px"><strong>3. Reasoning loop.</strong> The agent fetches the full message, expands any URLs (page text + OpenGraph), searches the policy doc for relevant clauses, classifies, and either acts (e.g. add reaction, hide) or files an item in the human review queue.</p>
    <p style="margin:0"><strong>4. Audit.</strong> Every decision is logged with policy clause, confidence, and action taken. Reviewers can override and the override feeds back into prompt tuning.</p>
  </div>
</section>

<section id="capabilities">
  <div class="section-label">Tools the agent needs</div>
  <h2>What wmcp.sh provides.</h2>
  <table>
    <thead>
      <tr><th>Capability</th><th>System</th><th>How wmcp.sh wires it</th></tr>
    </thead>
    <tbody>
      <tr><td><strong>Read channel messages</strong></td><td>Discord</td><td class="ours">✅ <a href="/integration/discord" style="color:var(--accent2)">/integration/discord</a></td></tr>
      <tr><td><strong>Read channel messages</strong></td><td>Slack</td><td class="ours">✅ <a href="/integration/slack" style="color:var(--accent2)">/integration/slack</a></td></tr>
      <tr><td><strong>Search policy doc</strong></td><td>Notion</td><td class="ours">✅ <a href="/integration/notion" style="color:var(--accent2)">/integration/notion</a></td></tr>
      <tr><td><strong>Inspect linked URL / image</strong></td><td>Any URL</td><td class="ours">✅ Generic <code>/api/v1/tools?url=...</code> — text + OG metadata</td></tr>
      <tr><td><strong>Soft action (react / hide)</strong></td><td>Discord / Slack</td><td class="ours">✅ Scoped to low-stakes methods only</td></tr>
      <tr><td><strong>Escalate to human queue</strong></td><td>Linear / your queue</td><td class="ours">✅ OpenAPI adapter via <a href="/integration/openapi" style="color:var(--accent2)">/integration/openapi</a></td></tr>
    </tbody>
  </table>
</section>

<section id="code">
  <div class="section-label">Code</div>
  <h2>A grounded moderation pass.</h2>
  <p class="section-sub">Python sketch. Receives a message ID; emits a classification + action, always citing the relevant policy clause.</p>
  <pre><code><span class="k">import</span> os, httpx
<span class="k">from</span> anthropic <span class="k">import</span> Anthropic

client = Anthropic()
WMCP = <span class="s">"${origin}"</span>

<span class="k">def</span> tools_for(url):
    <span class="k">return</span> httpx.get(<span class="s">f"{WMCP}/api/v1/tools"</span>, params={<span class="s">"url"</span>: url}).json()[<span class="s">"tools"</span>]

tools = (
    tools_for(<span class="s">"https://discord.com/api"</span>)
    + tools_for(<span class="s">"https://www.notion.so/acme-policy"</span>)
    + tools_for(<span class="s">"about:fetch"</span>)
)

msg_id = os.environ[<span class="s">"MESSAGE_ID"</span>]

resp = client.messages.create(
    model=<span class="s">"claude-sonnet-4-5"</span>,
    max_tokens=1024,
    tools=tools,
    messages=[{<span class="s">"role"</span>: <span class="s">"user"</span>,
        <span class="s">"content"</span>: <span class="s">f"Message {msg_id}. Fetch full content, expand any URLs, search the "</span>
                   <span class="s">"policy doc for relevant clauses, classify, and propose one action: "</span>
                   <span class="s">"none / soft-warn / hide / escalate. Cite the policy clause."</span>}],
)

<span class="k">print</span>(resp.content)</code></pre>
</section>

<section id="wins">
  <div class="section-label">Where we win</div>
  <h2>Hardcoded classifier vs grounded agent.</h2>
  <div class="wins-grid">
    <div class="wins-card">
      <h3>Static classifier:</h3>
      <ul>
        <li>Policy lives in the prompt — redeploy on every change</li>
        <li>Never inspects linked content</li>
        <li>No citation, no audit trail</li>
        <li>Bias is invisible until a bad action ships</li>
      </ul>
    </div>
    <div class="wins-card us">
      <h3>wmcp.sh grounded loop:</h3>
      <ul>
        <li>Policy is fetched live from Notion on every call</li>
        <li>URLs get expanded and inspected</li>
        <li>Every decision cites a clause; everything is logged</li>
        <li>Scope soft and hard actions as separate MCP tools</li>
      </ul>
    </div>
  </div>
</section>

<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions.</h2>
  <details><summary>What does an AI content moderation agent do?</summary><div class="answer">Watches messages, grounds in your policy doc, classifies, and either acts (low stakes) or escalates (high stakes).</div></details>
  <details><summary>Should it act on its own?</summary><div class="answer">Low-stakes actions, yes with audit. High-stakes actions — bans, public removals — route to a human queue.</div></details>
  <details><summary>How does it read images and links?</summary><div class="answer">Via the generic <code>/api/v1/tools?url=...</code> fetcher; multimodal classification needs a vision model.</div></details>
  <details><summary>How do you avoid biased false positives?</summary><div class="answer">Cite the policy clause for every action, gate borderline calls into human review, log everything.</div></details>
  <details><summary>Which platforms are supported?</summary><div class="answer">Discord and Slack natively; anything with an OpenAPI spec (Reddit, Mastodon, Matrix) via <a href="/integration/openapi" style="color:var(--accent2)">/integration/openapi</a>.</div></details>
</section>

<section id="related">
  <div class="section-label">Related</div>
  <h2>Keep exploring.</h2>
  <p class="section-sub">
    <a href="/integration/discord" style="color:var(--accent2);text-decoration:none">/integration/discord</a> &middot;
    <a href="/integration/slack" style="color:var(--accent2);text-decoration:none">/integration/slack</a> &middot;
    <a href="/integration/notion" style="color:var(--accent2);text-decoration:none">/integration/notion</a> &middot;
    <a href="/use-case/customer-support" style="color:var(--accent2);text-decoration:none">/use-case/customer-support</a> &middot;
    <a href="/managed" style="color:var(--accent2);text-decoration:none">/managed</a>
  </p>
</section>

</div>

<section id="upgrade" style="margin-top:36px;background:linear-gradient(135deg,var(--card),rgba(255,158,44,0.08));border:1px solid rgba(255,158,44,0.35);border-radius:16px;padding:22px 26px">
  <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;justify-content:space-between">
    <div style="flex:1;min-width:240px">
      <div style="font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent2);font-weight:700;margin-bottom:6px">Need this built for you?</div>
      <h3 style="margin:0 0 4px;font-size:1.05rem;color:var(--text)">Hosted moderation loop with audit + override.</h3>
      <p style="color:var(--muted);margin:0;font-size:.92rem">Custom platform adapter + hosted MCP at <code>mcp.yourbrand.com</code> + verified badge. <strong style="color:var(--text)">Starter $499 one-time</strong> · Managed Retainer $999/mo · Enterprise $4,999+/mo.</p>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <a href="/managed" style="display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#ff9e2c,#ffcf7a);color:#0c0c14;padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:700;font-size:.9rem">See /managed →</a>
      <a href="/directory/submit" style="display:inline-flex;align-items:center;gap:6px;background:#11111c;border:1px solid #26263a;color:var(--text);padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:600;font-size:.9rem">Submit (free)</a>
    </div>
  </div>
</section>

<footer>
  <a href="/">Home</a> · <a href="/agent-ready">Agent-ready</a> · <a href="/managed">Done for you</a> · <a href="/directory">Directory</a> · <a href="/directory/submit">Submit</a> · <a href="/blog">Blog</a> · <a href="/use-case/customer-support">Support</a> · <a href="/use-case/research-agent">Research</a> · <a href="/use-case/code-review-bot">Code review</a> · <a href="/use-case/data-pipeline">Data pipeline</a>
</footer>

</body>
</html>`;
}
