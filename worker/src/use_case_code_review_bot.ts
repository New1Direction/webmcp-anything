// /use-case/code-review-bot — use-case page. SERP target: "how to build an ai code review bot",
// "github pr review ai", "ai code reviewer mcp", "claude code reviewer", "automated pr review bot".

export function useCaseCodeReviewBotHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>How to Build an AI Code Review Bot with GitHub MCP Tools — wmcp.sh</title>
<meta name="description" content="Build an AI code review bot that reads PRs, leaves line comments, and tracks follow-ups in Linear. Wire GitHub, Linear, and Slack as MCP tools — no webhook glue." />
<link rel="canonical" href="${origin}/use-case/code-review-bot" />
<meta property="og:title" content="How to Build an AI Code Review Bot with GitHub MCP" />
<meta property="og:description" content="Read PRs, leave line-anchored comments, track follow-ups. Schema-valid MCP tools over GitHub, Linear, and Slack." />
<meta property="og:url" content="${origin}/use-case/code-review-bot" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="How to Build an AI Code Review Bot with GitHub MCP" />
<meta name="twitter:description" content="A PR-fetch → review → comment loop using GitHub MCP tools — no SDK glue." />
<meta name="twitter:image" content="${origin}/og.png" />
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article","headline":"How to Build an AI Code Review Bot with GitHub MCP Tools","description":"Wire GitHub, Linear, and Slack into a PR-fetch, review, comment, and track loop using MCP tools.","author":{"@type":"Organization","name":"WebMCP Anything"},"publisher":{"@type":"Organization","name":"WebMCP Anything","url":"https://wmcp.sh"},"datePublished":"2026-05-28","dateModified":"2026-05-28","mainEntityOfPage":"${origin}/use-case/code-review-bot"}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
  {"@type":"Question","name":"What does an AI code review bot do?","acceptedAnswer":{"@type":"Answer","text":"It fetches a pull request diff, reads the changed files in context, and leaves line-anchored review comments. A good bot also surfaces uncovered tests, files follow-up issues in Linear or Jira for non-blocking findings, and posts a summary to Slack — without competing with the human reviewer."}},
  {"@type":"Question","name":"Does it replace human review?","acceptedAnswer":{"@type":"Answer","text":"No. The pattern that works in production is bot-first, human-final. The bot catches the obvious — null checks, missing tests, naming inconsistencies, security smells — so the human reviewer can focus on architecture and intent. wmcp.sh keeps the bot's write surface scoped to comments only, never merges."}},
  {"@type":"Question","name":"How does it leave line-anchored comments?","acceptedAnswer":{"@type":"Answer","text":"GitHub's review API supports per-line comments via the pulls.createReviewComment method. wmcp.sh exposes the GitHub OpenAPI surface through /integration/github so the agent can call this method directly with line numbers it picked while reading the diff."}},
  {"@type":"Question","name":"What about secrets and IP exposure?","acceptedAnswer":{"@type":"Answer","text":"Run the agent in your VPC or on a self-hosted runner. wmcp.sh proxies tool listings, not source code — code flows directly between your runner and the model provider. The /managed plan can deploy the entire loop in your AWS or GCP account if data residency matters."}},
  {"@type":"Question","name":"How is this different from Copilot PR review or CodeRabbit?","acceptedAnswer":{"@type":"Answer","text":"Both are good products. A custom MCP-backed reviewer lets you pick the model (Claude, GPT, open weights), read across GitHub + your internal docs + your ADR registry in one loop, and wire whatever follow-up system you use. wmcp.sh is not affiliated with GitHub, OpenAI, or any code-review SaaS."}}
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
  <div class="badge"><span class="dot"></span> Use Case &middot; code-review-bot</div>
  <h1>How to build an AI code review bot.</h1>
  <p class="sub">Every PR rots in the queue for the same reason: humans don&rsquo;t have the bandwidth to read every diff carefully. A code review bot solves the boring half — null checks, missing tests, ADR drift, secrets, unobvious naming — so the human reviewer can spend their attention on architecture and intent. The blocker isn&rsquo;t the model. It&rsquo;s wiring GitHub, your tracker, and your chat into a clean tool loop.</p>
</header>

<section id="wedge">
  <div class="section-label">The gap</div>
  <h2>GitHub&rsquo;s API surface is broad. Your bot only needs ten methods.</h2>
  <p class="section-sub">A useful reviewer needs: list PRs, read PR diff, read file content at a commit, create a review, create line comments, optionally label the PR, optionally request changes. Mapping these to a typed tool surface the model can call without inventing parameter names is the actual integration work.</p>
  <p class="section-sub">Teams that ship hand-roll a thin wrapper, watch it drift when GitHub renames a field, and end up maintaining a tiny SDK forever. None of that work is differentiated. None of it is what your reviewer policy should be optimizing for.</p>
  <p class="section-sub">wmcp.sh exposes the GitHub API as schema-valid MCP tools via <a href="/integration/github" style="color:var(--accent2)">/integration/github</a>, so your agent calls <code>pulls.get</code> and <code>pulls.createReviewComment</code> by name with typed args — and you spend your week on the review prompt instead. wmcp.sh is not affiliated with GitHub.</p>
</section>

<section id="architecture">
  <div class="section-label">Architecture</div>
  <h2>PR-open → review → comment → track.</h2>
  <div class="arch">
    <p style="margin:0 0 10px"><strong>1. PR webhook.</strong> Your GitHub App fires on <code>pull_request.opened</code> and <code>pull_request.synchronize</code>. The handler enqueues the repo + PR number with a unique correlation ID so reviews are idempotent.</p>
    <p style="margin:0 0 10px"><strong>2. Tool gateway (wmcp.sh).</strong> The runner pulls MCP tools for <a href="/integration/github" style="color:var(--accent2)">/integration/github</a> (PR + file + review methods), Linear (for non-blocking follow-ups), and Slack (for the summary post).</p>
    <p style="margin:0 0 10px"><strong>3. Reasoning loop.</strong> The agent fetches the diff, fetches related file context at the head SHA, drafts a structured review (summary + line comments + tags), and submits it as <code>COMMENT</code> review state (never <code>APPROVED</code>).</p>
    <p style="margin:0"><strong>4. Track + notify.</strong> Non-blocking findings become Linear issues with a backlink to the line. A Slack message lands in the team channel with the summary and PR link.</p>
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
      <tr><td><strong>Read PR + diff</strong></td><td>GitHub</td><td class="ours">✅ <a href="/integration/github" style="color:var(--accent2)">/integration/github</a> — <code>pulls.get</code>, <code>pulls.listFiles</code></td></tr>
      <tr><td><strong>Read file at commit SHA</strong></td><td>GitHub</td><td class="ours">✅ <code>repos.getContent</code> with <code>ref</code> parameter</td></tr>
      <tr><td><strong>Submit review + line comments</strong></td><td>GitHub</td><td class="ours">✅ <code>pulls.createReview</code> (scoped to <code>COMMENT</code> state)</td></tr>
      <tr><td><strong>File follow-up tickets</strong></td><td>Linear</td><td class="ours">✅ OpenAPI adapter — <code>issues.create</code> only</td></tr>
      <tr><td><strong>Post summary</strong></td><td>Slack</td><td class="ours">✅ <a href="/integration/slack" style="color:var(--accent2)">/integration/slack</a></td></tr>
      <tr><td><strong>Look up ADR / standards</strong></td><td>Notion or repo /docs</td><td class="ours">✅ <a href="/integration/notion" style="color:var(--accent2)">/integration/notion</a> or generic fetch</td></tr>
    </tbody>
  </table>
</section>

<section id="code">
  <div class="section-label">Code</div>
  <h2>From PR webhook to line comments.</h2>
  <p class="section-sub">Python sketch. Receives a repo + PR number; emits a review with line-anchored comments. Never approves, never merges.</p>
  <pre><code><span class="k">import</span> os, httpx
<span class="k">from</span> anthropic <span class="k">import</span> Anthropic

client = Anthropic()
WMCP = <span class="s">"${origin}"</span>

<span class="k">def</span> tools_for(url):
    <span class="k">return</span> httpx.get(<span class="s">f"{WMCP}/api/v1/tools"</span>, params={<span class="s">"url"</span>: url}).json()[<span class="s">"tools"</span>]

tools = (
    tools_for(<span class="s">"https://api.github.com"</span>)
    + tools_for(<span class="s">"https://api.linear.app"</span>)
    + tools_for(<span class="s">"https://slack.com/api"</span>)
)

repo = os.environ[<span class="s">"REPO"</span>]     <span class="c"># e.g. "acme/api"</span>
pr   = os.environ[<span class="s">"PR_NUM"</span>]

msg = client.messages.create(
    model=<span class="s">"claude-sonnet-4-5"</span>,
    max_tokens=4096,
    tools=tools,
    messages=[{<span class="s">"role"</span>: <span class="s">"user"</span>,
        <span class="s">"content"</span>: <span class="s">f"Review PR {repo}#{pr}. Read the diff and related files. "</span>
                   <span class="s">"Submit a review (COMMENT state, never APPROVE). For non-blocking findings, "</span>
                   <span class="s">"file a Linear issue. Post a one-line summary to #eng-reviews."</span>}],
)

<span class="k">print</span>(msg.content)</code></pre>
</section>

<section id="wins">
  <div class="section-label">Where we win</div>
  <h2>Custom GitHub wrapper vs MCP gateway.</h2>
  <div class="wins-grid">
    <div class="wins-card">
      <h3>Hand-rolled GitHub client:</h3>
      <ul>
        <li>Tiny SDK that drifts when GitHub renames fields</li>
        <li>Auth + rate limit handling per repo</li>
        <li>No standard tool shape — model must be re-prompted</li>
        <li>Adding Linear means another adapter</li>
      </ul>
    </div>
    <div class="wins-card us">
      <h3>wmcp.sh tool gateway:</h3>
      <ul>
        <li>Schema-valid MCP tools for GitHub out of the box</li>
        <li>Scope to <code>pulls.*</code> and <code>repos.getContent</code> only</li>
        <li>Edge-cached tool listings, sub-50ms</li>
        <li>Add Linear or Jira by adding a URL</li>
      </ul>
    </div>
  </div>
</section>

<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions.</h2>
  <details><summary>What does an AI code review bot do?</summary><div class="answer">Fetches the diff, reads the changed files in context, leaves line-anchored comments, files follow-ups, posts a Slack summary. Never approves or merges.</div></details>
  <details><summary>Does it replace human review?</summary><div class="answer">No. Bot-first, human-final. The bot covers boring checks; the human focuses on architecture and intent.</div></details>
  <details><summary>How does it leave line-anchored comments?</summary><div class="answer">Via <code>pulls.createReviewComment</code>, which wmcp.sh exposes through <a href="/integration/github" style="color:var(--accent2)">/integration/github</a>.</div></details>
  <details><summary>What about secrets and IP exposure?</summary><div class="answer">Run the agent on your own runner. wmcp.sh proxies tool schemas, not code. /managed can deploy in your cloud account.</div></details>
  <details><summary>How is this different from Copilot PR review or CodeRabbit?</summary><div class="answer">Your model, your tools, your follow-up system. Portable across model providers.</div></details>
</section>

<section id="related">
  <div class="section-label">Related</div>
  <h2>Keep exploring.</h2>
  <p class="section-sub">
    <a href="/integration/github" style="color:var(--accent2);text-decoration:none">/integration/github</a> &middot;
    <a href="/integration/slack" style="color:var(--accent2);text-decoration:none">/integration/slack</a> &middot;
    <a href="/agent-ready" style="color:var(--accent2);text-decoration:none">/agent-ready</a> &middot;
    <a href="/use-case/research-agent" style="color:var(--accent2);text-decoration:none">/use-case/research-agent</a> &middot;
    <a href="/managed" style="color:var(--accent2);text-decoration:none">/managed</a>
  </p>
</section>

</div>

<section id="upgrade" style="margin-top:36px;background:linear-gradient(135deg,var(--card),rgba(255,158,44,0.08));border:1px solid rgba(255,158,44,0.35);border-radius:16px;padding:22px 26px">
  <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;justify-content:space-between">
    <div style="flex:1;min-width:240px">
      <div style="font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent2);font-weight:700;margin-bottom:6px">Need this built for you?</div>
      <h3 style="margin:0 0 4px;font-size:1.05rem;color:var(--text)">Hosted reviewer with your standards baked in.</h3>
      <p style="color:var(--muted);margin:0;font-size:.92rem">Custom rules + ADR adapter + hosted MCP at <code>mcp.yourbrand.com</code> + verified badge. <strong style="color:var(--text)">Starter $499 one-time</strong> · Managed Retainer $999/mo · Enterprise $4,999+/mo.</p>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <a href="/managed" style="display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#ff9e2c,#ffcf7a);color:#0c0c14;padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:700;font-size:.9rem">See /managed →</a>
      <a href="/directory/submit" style="display:inline-flex;align-items:center;gap:6px;background:#11111c;border:1px solid #26263a;color:var(--text);padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:600;font-size:.9rem">Submit (free)</a>
    </div>
  </div>
</section>

<footer>
  <a href="/">Home</a> · <a href="/agent-ready">Agent-ready</a> · <a href="/managed">Done for you</a> · <a href="/directory">Directory</a> · <a href="/directory/submit">Submit</a> · <a href="/blog">Blog</a> · <a href="/use-case/customer-support">Support</a> · <a href="/use-case/research-agent">Research</a> · <a href="/use-case/sales-assistant">Sales</a> · <a href="/use-case/data-pipeline">Data pipeline</a>
</footer>

</body>
</html>`;
}
