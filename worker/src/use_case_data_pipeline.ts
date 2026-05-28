// /use-case/data-pipeline — use-case page. SERP target: "how to build an ai data pipeline agent",
// "ai etl agent", "sql ai agent mcp", "ai snowflake agent", "warehouse ai pipeline tools".

export function useCaseDataPipelineHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>How to Build an AI Data Pipeline Agent — SQL, S3, Warehouse Tools — wmcp.sh</title>
<meta name="description" content="Build an AI data pipeline agent that schedules extracts, transforms, and loads into Snowflake or BigQuery. Wire SQL, S3, R2, and warehouse APIs as MCP tools, schema-first." />
<link rel="canonical" href="${origin}/use-case/data-pipeline" />
<meta property="og:title" content="How to Build an AI Data Pipeline Agent — SQL + S3 + Warehouse Tools" />
<meta property="og:description" content="Schedule → extract → transform → load. SQL, object storage, and warehouse APIs as schema-valid MCP tools." />
<meta property="og:url" content="${origin}/use-case/data-pipeline" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="How to Build an AI Data Pipeline Agent" />
<meta name="twitter:description" content="An ETL agent loop over SQL, S3, and your warehouse — without writing four drivers." />
<meta name="twitter:image" content="${origin}/og.png" />
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article","headline":"How to Build an AI Data Pipeline Agent with SQL, S3, and Warehouse Tools","description":"Wire SQL execution, object storage, and Snowflake or BigQuery into a schedule-extract-transform-load loop using MCP tools.","author":{"@type":"Organization","name":"WebMCP Anything"},"publisher":{"@type":"Organization","name":"WebMCP Anything","url":"https://wmcp.sh"},"datePublished":"2026-05-28","dateModified":"2026-05-28","mainEntityOfPage":"${origin}/use-case/data-pipeline"}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
  {"@type":"Question","name":"What is an AI data pipeline agent?","acceptedAnswer":{"@type":"Answer","text":"An AI agent that runs scheduled ETL: extracts from sources (databases, APIs, files), transforms via SQL or code, and loads into a warehouse like Snowflake or BigQuery. Unlike a static dbt job, it can self-correct on schema drift, write new staging models when sources change, and explain failures in plain English."}},
  {"@type":"Question","name":"Should an agent really be running ETL?","acceptedAnswer":{"@type":"Answer","text":"For triage, dry-run validation, and schema-drift fixes — yes. For the actual production load — usually still a deterministic job. The pattern most teams use: the agent proposes SQL and a transform plan; a human (or an automated check) approves; the deterministic runner executes. wmcp.sh exposes execute and dry-run as separate MCP tools."}},
  {"@type":"Question","name":"What warehouses are supported?","acceptedAnswer":{"@type":"Answer","text":"Snowflake and BigQuery both expose REST APIs with OpenAPI specs, so they work through /integration/openapi. Redshift via the Data API works the same way. Postgres and MySQL via their REST gateways (PostgREST, Hasura) are also straightforward."}},
  {"@type":"Question","name":"How do I keep an agent from running a 10TB query?","acceptedAnswer":{"@type":"Answer","text":"Three guardrails. First, run EXPLAIN before any execute. Second, cap bytes-scanned at the warehouse level via query tags or BigQuery maximum_bytes_billed. Third, scope the agent's MCP tools to dry-run only, with execute gated behind a human-approval step. The tool schema makes this trivially enforceable."}},
  {"@type":"Question","name":"Is this a replacement for dbt or Airflow?","acceptedAnswer":{"@type":"Answer","text":"No. It's a complementary layer. dbt and Airflow are great deterministic runners. The agent sits above them, handling the discovery, drift, and ad-hoc analysis work that humans do today. wmcp.sh is not affiliated with dbt Labs or Apache Airflow."}}
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
  <div class="badge"><span class="dot"></span> Use Case &middot; data-pipeline</div>
  <h1>How to build an AI data pipeline agent.</h1>
  <p class="sub">Every data team has the same long tail: a CSV showed up in a new bucket, an upstream schema added a column, a vendor changed an enum value. Each one needs a human to diagnose and patch a staging model. That work is a tool-using loop in disguise — list, sample, EXPLAIN, propose SQL, dry-run, commit — and the limiting factor is whether your agent can call SQL, object storage, and the warehouse with consistent typed tools.</p>
</header>

<section id="wedge">
  <div class="section-label">The gap</div>
  <h2>Four drivers, four auth models, four shapes.</h2>
  <p class="section-sub">Postgres has its protocol. S3 has its signing flavor. Snowflake has a JSON-over-HTTPS API. BigQuery has its own. Build a generic agent and you&rsquo;re writing four drivers before you write a single useful prompt. Each one has its own error envelope the model has to learn to parse.</p>
  <p class="section-sub">The pragmatic path: put a thin REST surface in front of each (PostgREST, S3 REST, native Snowflake/BigQuery REST), point a tool gateway at them, and let the agent call uniformly-shaped MCP tools. The bytes that flow between agent and tool are the same shape across systems — the model spends its attention on the data problem, not the SDK problem.</p>
  <p class="section-sub">wmcp.sh is that gateway. <code>/api/v1/tools?url=...</code> turns each REST surface into schema-valid MCP tools, scoped to whatever methods you whitelist. wmcp.sh is not affiliated with Snowflake, Google Cloud, Amazon Web Services, or any data vendor.</p>
</section>

<section id="architecture">
  <div class="section-label">Architecture</div>
  <h2>Schedule → extract → transform → load.</h2>
  <div class="arch">
    <p style="margin:0 0 10px"><strong>1. Scheduler.</strong> A cron or workflow runner (Airflow, Dagster, Cloudflare Cron) kicks the agent for a specific pipeline ID with a bounded turn budget and a bytes-scanned cap.</p>
    <p style="margin:0 0 10px"><strong>2. Tool gateway (wmcp.sh).</strong> The agent materializes tools for SQL (Postgres via PostgREST, or your warehouse REST endpoint), object storage (S3, R2, or GCS via their REST APIs), and the destination warehouse — Snowflake or BigQuery — through <a href="/integration/openapi" style="color:var(--accent2)">/integration/openapi</a>.</p>
    <p style="margin:0 0 10px"><strong>3. Reasoning loop.</strong> The agent inspects the source schema, lists new files in the staging bucket, drafts a transform SQL, runs <code>EXPLAIN</code> to check cost, then either dry-runs the load or queues the SQL for human approval depending on policy.</p>
    <p style="margin:0"><strong>4. Audit + observability.</strong> Every tool call lands in your warehouse&rsquo;s audit table. /managed wires this into a dashboard so you can see which pipelines self-healed and which escalated.</p>
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
      <tr><td><strong>Read source schema</strong></td><td>Postgres / MySQL</td><td class="ours">✅ PostgREST or Hasura REST via <a href="/integration/openapi" style="color:var(--accent2)">/integration/openapi</a></td></tr>
      <tr><td><strong>List + read bucket objects</strong></td><td>S3 / R2 / GCS</td><td class="ours">✅ Native REST OpenAPI, scoped to <code>list</code> + <code>get</code></td></tr>
      <tr><td><strong>Run EXPLAIN / dry-run SQL</strong></td><td>Snowflake / BigQuery</td><td class="ours">✅ Warehouse REST adapter, scoped to dry-run methods</td></tr>
      <tr><td><strong>Execute SQL (gated)</strong></td><td>Snowflake / BigQuery</td><td class="ours">✅ Separate MCP tool, gated behind human approval</td></tr>
      <tr><td><strong>Inspect a public spec or vendor docs</strong></td><td>Any URL</td><td class="ours">✅ Generic <code>/api/v1/tools?url=...</code></td></tr>
      <tr><td><strong>Audit log + replay</strong></td><td>Your warehouse</td><td class="ours">✅ Included on <a href="/managed" style="color:var(--accent2)">/managed</a></td></tr>
    </tbody>
  </table>
</section>

<section id="code">
  <div class="section-label">Code</div>
  <h2>A schema-drift agent loop.</h2>
  <p class="section-sub">Python sketch. The agent receives a pipeline ID, inspects source and target schemas, drafts a patch, and dry-runs it. Execute is left to a separate approved runner.</p>
  <pre><code><span class="k">import</span> os, httpx
<span class="k">from</span> anthropic <span class="k">import</span> Anthropic

client = Anthropic()
WMCP = <span class="s">"${origin}"</span>

<span class="k">def</span> tools_for(url):
    <span class="k">return</span> httpx.get(<span class="s">f"{WMCP}/api/v1/tools"</span>, params={<span class="s">"url"</span>: url}).json()[<span class="s">"tools"</span>]

tools = (
    tools_for(<span class="s">"https://postgrest.acme.internal"</span>)              <span class="c"># source DB via REST</span>
    + tools_for(<span class="s">"https://s3.us-east-1.amazonaws.com"</span>)         <span class="c"># raw bucket</span>
    + tools_for(<span class="s">"https://acme.snowflakecomputing.com/api/v2"</span>) <span class="c"># warehouse</span>
)

pipeline = os.environ[<span class="s">"PIPELINE_ID"</span>]

msg = client.messages.create(
    model=<span class="s">"claude-sonnet-4-5"</span>,
    max_tokens=2048,
    tools=tools,
    messages=[{<span class="s">"role"</span>: <span class="s">"user"</span>,
        <span class="s">"content"</span>: <span class="s">f"Pipeline {pipeline} failed last run. Compare source and target schemas, "</span>
                   <span class="s">"list new files in the staging bucket, draft a transform SQL, run EXPLAIN, "</span>
                   <span class="s">"and emit a dry-run plan. Do NOT call any execute tool."</span>}],
)

<span class="k">print</span>(msg.content)  <span class="c"># proposed SQL + EXPLAIN cost</span></code></pre>
</section>

<section id="wins">
  <div class="section-label">Where we win</div>
  <h2>Hand-rolled drivers vs MCP gateway.</h2>
  <div class="wins-grid">
    <div class="wins-card">
      <h3>Four-driver stack:</h3>
      <ul>
        <li>Per-system auth, retries, and error envelopes</li>
        <li>Model relearns each tool&rsquo;s quirks</li>
        <li>Bytes-scanned caps rolled by hand</li>
        <li>Adding a new source means a new driver</li>
      </ul>
    </div>
    <div class="wins-card us">
      <h3>wmcp.sh tool gateway:</h3>
      <ul>
        <li>One <code>/api/v1/tools</code> shape across SQL, storage, warehouse</li>
        <li>Scope dry-run vs execute as separate MCP tools</li>
        <li>Edge-cached schemas, sub-50ms tool listing</li>
        <li>New source = new URL, not new driver</li>
      </ul>
    </div>
  </div>
</section>

<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions.</h2>
  <details><summary>What is an AI data pipeline agent?</summary><div class="answer">A loop that extracts, transforms, and loads — with self-correction on schema drift and plain-English failure explanations.</div></details>
  <details><summary>Should an agent run production ETL?</summary><div class="answer">For triage and drift fixes, yes. For the live load, usually a deterministic runner is still the right answer; the agent proposes, a human or check approves, the runner executes.</div></details>
  <details><summary>What warehouses are supported?</summary><div class="answer">Snowflake, BigQuery, Redshift via Data API — anything with a REST surface and OpenAPI spec.</div></details>
  <details><summary>How do I stop a 10TB query?</summary><div class="answer">EXPLAIN before execute, bytes-scanned caps at the warehouse, dry-run-only MCP scoping.</div></details>
  <details><summary>Does this replace dbt or Airflow?</summary><div class="answer">No. It sits above them, handling discovery and drift work.</div></details>
</section>

<section id="related">
  <div class="section-label">Related</div>
  <h2>Keep exploring.</h2>
  <p class="section-sub">
    <a href="/integration/openapi" style="color:var(--accent2);text-decoration:none">/integration/openapi</a> &middot;
    <a href="/agent-ready" style="color:var(--accent2);text-decoration:none">/agent-ready</a> &middot;
    <a href="/use-case/research-agent" style="color:var(--accent2);text-decoration:none">/use-case/research-agent</a> &middot;
    <a href="/use-case/content-moderation" style="color:var(--accent2);text-decoration:none">/use-case/content-moderation</a> &middot;
    <a href="/managed" style="color:var(--accent2);text-decoration:none">/managed</a>
  </p>
</section>

</div>

<section id="upgrade" style="margin-top:36px;background:linear-gradient(135deg,var(--card),rgba(124,92,255,0.08));border:1px solid rgba(124,92,255,0.35);border-radius:16px;padding:22px 26px">
  <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;justify-content:space-between">
    <div style="flex:1;min-width:240px">
      <div style="font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent2);font-weight:700;margin-bottom:6px">Need this built for you?</div>
      <h3 style="margin:0 0 4px;font-size:1.05rem;color:var(--text)">Hosted pipeline agent with audit + cost caps.</h3>
      <p style="color:var(--muted);margin:0;font-size:.92rem">Custom warehouse adapter + hosted MCP at <code>mcp.yourbrand.com</code> + verified badge. <strong style="color:var(--text)">Starter $499 one-time</strong> · Pro $999/mo · Enterprise $4,999+/mo.</p>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <a href="/managed" style="display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#7c5cff,#00e5ff);color:#0c0c14;padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:700;font-size:.9rem">See /managed →</a>
      <a href="/directory/submit" style="display:inline-flex;align-items:center;gap:6px;background:#11111c;border:1px solid #26263a;color:var(--text);padding:10px 18px;border-radius:9px;text-decoration:none;font-weight:600;font-size:.9rem">Submit (free)</a>
    </div>
  </div>
</section>

<footer>
  <a href="/">Home</a> · <a href="/agent-ready">Agent-ready</a> · <a href="/managed">Done for you</a> · <a href="/directory">Directory</a> · <a href="/directory/submit">Submit</a> · <a href="/blog">Blog</a> · <a href="/use-case/customer-support">Support</a> · <a href="/use-case/research-agent">Research</a> · <a href="/use-case/code-review-bot">Code review</a> · <a href="/use-case/content-moderation">Moderation</a>
</footer>

</body>
</html>`;
}
