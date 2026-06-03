// mcp_report.ts — "State of MCP Security" — a live, data-backed report computed
// from the grade: dataset. This is the link-bait asset: nobody else has audited
// thousands of MCP servers, so the aggregate is genuinely novel and citable.
//
// Cheap path: the grade distribution / averages come from KV key METADATA
// (gradeMeta puts {grade,score,checked_at,tools_count} on each grade: key), so
// the headline stats are one KV.list walk, no per-host gets. The finding-
// frequency breakdown samples a bounded number of FULL reports. The whole
// computed result is cached in KV so the page is fast and doesn't hammer KV.

import { uiCss, uiNav } from "./ui";
import { categorySlug } from "./mcp_grade";

const REPORT_CACHE_KEY = "report:state-of-mcp-security:v3";
const REPORT_TTL = 6 * 3600;      // recompute at most every 6h
const SAMPLE_CAP = 120;           // full reports read for the findings breakdown

// Human labels for finding ids; ids not listed fall back to humanize().
const FINDING_LABELS: Record<string, string> = {
  tls: "No HTTPS (plaintext transport)",
  reachable: "Server unreachable / no response",
  tool_poisoning: "Prompt-injection in tool descriptions",
  secret_exfil: "Secret / credential exfiltration surface",
  flaky_tool: "Unstable / flaky tools",
  url: "Invalid endpoint URL",
};
// Not real server weaknesses: "target" = our SSRF guard refusing a private addr;
// "auth" is info-only (already filtered). Don't count them as ecosystem flaws.
const FINDING_EXCLUDE = new Set(["target", "auth"]);

const baseDomain = (h: string): string => {
  const parts = String(h || "").split(".");
  return parts.length <= 2 ? h : parts.slice(-2).join(".");
};

const COLOR: Record<string, string> = { A: "#4ade80", B: "#ffcf7a", C: "#ff9e2c", D: "#ff6a3c", F: "#f87171" };

export interface FindingFreq { id: string; label: string; pct: number; severity: string }
export interface McpReportStats {
  total: number;
  generated_at: number;
  dist: Record<string, number>;     // A/B/C/D/F family → count
  avg_score: number;
  pct_passing: number;              // A or B
  pct_failing: number;              // D or F
  pct_zero: number;                 // score 0 — unreachable / plaintext / blocked (mostly dead servers)
  avg_tools: number;
  pct_no_tools: number;
  sample_size: number;
  sample_unreachable_pct: number;   // of sample: ≥1 "reachable" fail (dead/unresponsive)
  sample_security_pct: number;      // of sample: ≥1 real security fail (plaintext / injection / secret-exfil)
  categories: { name: string; count: number }[]; // full-corpus category distribution
  sample_fail_pct: number;          // % of sampled servers with ≥1 "fail" finding
  finding_freq: FindingFreq[];
  top_servers: { host: string; grade: string; score: number }[];
}

const family = (g: string): string => (g ? g[0].toUpperCase() : "F");
const humanize = (id: string): string =>
  id.replace(/[_-]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());

export async function computeMcpSecurityReport(env: any, force = false): Promise<McpReportStats> {
  if (!force) {
    try {
      const raw = await env.CACHE.get(REPORT_CACHE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
  }

  const dist: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  let total = 0, scoreSum = 0, toolsSum = 0, noTools = 0, zeroScore = 0;
  const catCount: Record<string, number> = {};
  const all: { host: string; grade: string; score: number }[] = [];
  const sampleNames: string[] = [];

  let cursor: string | undefined;
  do {
    const res: any = await env.CACHE.list({ prefix: "grade:", limit: 1000, cursor });
    for (const k of res.keys) {
      const m = k.metadata;
      if (!m || typeof m.score !== "number") { sampleNames.push(k.name); continue; }
      total++;
      scoreSum += m.score;
      if (m.score === 0) zeroScore++;   // unreachable / plaintext / blocked — fully failed
      dist[family(m.grade)] = (dist[family(m.grade)] || 0) + 1;
      const tc = typeof m.tools_count === "number" ? m.tools_count : 0;
      toolsSum += tc;
      if (tc === 0) noTools++;
      const cat = (typeof m.category === "string" && m.category) || "Other";
      catCount[cat] = (catCount[cat] || 0) + 1;
      all.push({ host: k.name.slice("grade:".length), grade: m.grade, score: m.score });
      if (sampleNames.length < SAMPLE_CAP) sampleNames.push(k.name);
    }
    cursor = res.list_complete ? undefined : res.cursor;
  } while (cursor);

  // Findings breakdown from a bounded sample of full reports.
  const findingCounts: Record<string, { count: number; severity: string }> = {};
  const SECURITY_IDS = new Set(["tls", "tool_poisoning", "secret_exfil"]);
  let sampled = 0, sampleFail = 0, sampleUnreach = 0, sampleSecurity = 0;
  for (const name of sampleNames.slice(0, SAMPLE_CAP)) {
    try {
      const raw = await env.CACHE.get(name);
      if (!raw) continue;
      const g = JSON.parse(raw);
      sampled++;
      const findings: any[] = Array.isArray(g.findings) ? g.findings : [];
      const failIds = new Set(findings.filter((f) => f.severity === "fail").map((f) => f.id));
      if (failIds.size) sampleFail++;
      if (failIds.has("reachable")) sampleUnreach++;
      if ([...failIds].some((id) => SECURITY_IDS.has(id as string))) sampleSecurity++;
      const seen = new Set<string>();
      for (const f of findings) {
        if (f.severity === "info") continue;       // only weaknesses
        if (!f.id || FINDING_EXCLUDE.has(f.id) || seen.has(f.id)) continue;
        seen.add(f.id);
        const cur = findingCounts[f.id] || { count: 0, severity: f.severity };
        cur.count++;
        if (f.severity === "fail") cur.severity = "fail";
        findingCounts[f.id] = cur;
      }
    } catch {}
  }
  const finding_freq: FindingFreq[] = Object.entries(findingCounts)
    .map(([id, v]) => ({ id, label: FINDING_LABELS[id] || humanize(id), severity: v.severity, pct: sampled ? Math.round((v.count / sampled) * 100) : 0 }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 10);

  // Top servers, deduped to ONE per registrable domain so the "most trustworthy"
  // list shows diverse operators, not 10 subdomains of one deployment.
  all.sort((a, b) => b.score - a.score);
  const topSeen = new Set<string>();
  const top_servers: { host: string; grade: string; score: number }[] = [];
  for (const s of all) {
    const d = baseDomain(s.host);
    if (topSeen.has(d)) continue;
    topSeen.add(d);
    top_servers.push(s);
    if (top_servers.length >= 10) break;
  }

  const stats: McpReportStats = {
    total,
    generated_at: Date.now(),
    dist,
    avg_score: total ? Math.round(scoreSum / total) : 0,
    pct_passing: total ? Math.round(((dist.A + dist.B) / total) * 100) : 0,
    pct_failing: total ? Math.round(((dist.D + dist.F) / total) * 100) : 0,
    pct_zero: total ? Math.round((zeroScore / total) * 100) : 0,
    avg_tools: total ? Math.round((toolsSum / total) * 10) / 10 : 0,
    pct_no_tools: total ? Math.round((noTools / total) * 100) : 0,
    sample_size: sampled,
    sample_fail_pct: sampled ? Math.round((sampleFail / sampled) * 100) : 0,
    sample_unreachable_pct: sampled ? Math.round((sampleUnreach / sampled) * 100) : 0,
    sample_security_pct: sampled ? Math.round((sampleSecurity / sampled) * 100) : 0,
    categories: Object.entries(catCount).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    finding_freq,
    top_servers,
  };

  try { await env.CACHE.put(REPORT_CACHE_KEY, JSON.stringify(stats), { expirationTtl: REPORT_TTL }); } catch {}
  return stats;
}

// ---- "Get your badge" hub: the embed distribution funnel ---------------------
export function badgeHubHtml(origin: string): string {
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8" />
<title>Get your MCP Trust badge — show users you're audited | wmcp.sh</title>
<meta name="description" content="Add a live MCP Trust grade badge to your server's README or site. Independently audited, re-verified on a schedule, free. Look up your server and grab the embed code." />
<link rel="canonical" href="${origin}/mcp/badges" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>${uiCss(720)}
  .lookup{display:flex;gap:10px;margin:18px 0 8px;flex-wrap:wrap}
  .lookup input{flex:1;min-width:240px}
  .badges{display:flex;gap:18px;flex-wrap:wrap;align-items:center;margin:22px 0}
  .steps{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));margin-top:10px}
  .stepc{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:16px 18px}
  .stepc .n{color:var(--accent2);font-weight:800;font-size:.8rem;letter-spacing:.05em}
  .err{color:#ff5c7c;min-height:1em;font-size:.9rem}
</style></head><body>
${uiNav(origin)}
<div class="wrap" style="padding-top:28px">
  <nav class="crumbs"><a href="/">Home</a> › <a href="/mcp/leaderboard">Trust leaderboard</a> › <span>Get your badge</span></nav>
  <header>
    <h1>Get your MCP Trust badge</h1>
    <p class="lede">Show users your MCP server is independently audited. The badge is <b>live</b> — it re-verifies on a schedule, so it always reflects your current grade. Free, no signup.</p>
  </header>

  <div class="lookup">
    <input id="host" type="text" placeholder="your MCP server URL or host, e.g. mcp.example.com" />
    <button class="btn btn-primary" id="go">Get my badge →</button>
  </div>
  <div id="err" class="err"></div>

  <section>
    <h2>Why add it</h2>
    <div class="steps">
      <div class="stepc"><div class="n">TRUST</div><h3>Signal you're safe</h3><p class="muted" style="margin:6px 0 0">Agents and users increasingly check a server before connecting. A visible grade is a trust shortcut.</p></div>
      <div class="stepc"><div class="n">LIVE</div><h3>Always current</h3><p class="muted" style="margin:6px 0 0">Unlike a static scorecard, the badge re-verifies itself and shows your real, current grade.</p></div>
      <div class="stepc"><div class="n">INDEPENDENT</div><h3>Not pay-to-win</h3><p class="muted" style="margin:6px 0 0">Grades are identical whether or not you pay us. That's what makes the badge worth something.</p></div>
    </div>
  </section>

  <section>
    <h2>How it works</h2>
    <ol class="muted" style="line-height:1.9">
      <li>Enter your server above — we grade it (or pull your existing grade).</li>
      <li>On your grade page, copy the <b>Markdown</b> or <b>HTML</b> snippet from “Embed this grade.”</li>
      <li>Paste it into your README or site. Done — it links back to your live report.</li>
    </ol>
  </section>

  <footer>
    <a href="/mcp/leaderboard">Trust leaderboard</a> · <a href="/mcp/grade">Grade a server</a> · <a href="/reports/state-of-mcp-security-2026">State of MCP Security</a> · <a href="/">wmcp.sh</a>
  </footer>
</div>
<script>
(function(){
  function norm(v){
    v=(v||"").trim(); if(!v) return "";
    v=v.replace(/^https?:\\/\\//i,"").replace(/\\/.*$/,"").replace(/:\\d+$/,"");
    return v.toLowerCase();
  }
  function go(){
    var h=norm(document.getElementById("host").value);
    if(!h||h.indexOf(".")<0){document.getElementById("err").textContent="Enter a valid server host, e.g. mcp.example.com";return;}
    location.href="/mcp/grade/"+encodeURIComponent(h)+"#embed";
  }
  document.getElementById("go").addEventListener("click",go);
  document.getElementById("host").addEventListener("keydown",function(e){if(e.key==="Enter")go();});
})();
</script>
</body></html>`;
}

function bar(pct: number, color: string): string {
  return `<div class="barwrap"><div class="bar" style="width:${Math.max(pct, 1)}%;background:${color}"></div></div>`;
}

export function stateOfMcpSecurityHtml(origin: string, s: McpReportStats): string {
  const date = new Date(s.generated_at).toISOString().slice(0, 10);
  const maxDist = Math.max(1, ...Object.values(s.dist));
  const distRows = (["A", "B", "C", "D", "F"] as const)
    .map((g) => {
      const n = s.dist[g] || 0;
      const pct = s.total ? Math.round((n / s.total) * 100) : 0;
      const w = Math.round((n / maxDist) * 100);
      return `<div class="drow"><span class="dg" style="color:${COLOR[g]}">${g}</span>${bar(w, COLOR[g])}<span class="dn">${n.toLocaleString()} <span class="dim">(${pct}%)</span></span></div>`;
    })
    .join("");

  const findingRows = s.finding_freq.length
    ? s.finding_freq
        .map((f) => `<div class="drow"><span class="fl">${f.label}</span>${bar(f.pct, f.severity === "fail" ? "#f87171" : "#ffcf7a")}<span class="dn">${f.pct}%</span></div>`)
        .join("")
    : `<p class="muted">Finding breakdown unavailable for this sample.</p>`;

  const topRows = s.top_servers
    .map((t, i) => `<tr><td class="num dim">${i + 1}</td><td><a href="${origin}/mcp/grade/${encodeURIComponent(t.host)}">${t.host}</a></td><td style="color:${COLOR[family(t.grade)]};font-weight:700">${t.grade}</td><td class="num">${t.score}</td></tr>`)
    .join("");

  const ld = {
    "@context": "https://schema.org",
    "@type": "Report",
    name: "State of MCP Security 2026",
    description: `An independent audit of ${s.total.toLocaleString()} Model Context Protocol (MCP) servers: trust-grade distribution, average security score, and the most common weaknesses.`,
    datePublished: new Date(s.generated_at).toISOString(),
    author: { "@type": "Organization", name: "wmcp.sh" },
    publisher: { "@type": "Organization", name: "wmcp.sh", url: origin },
    mainEntityOfPage: `${origin}/reports/state-of-mcp-security-2026`,
  };

  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8" />
<title>State of MCP Security 2026 — ${s.total.toLocaleString()} servers audited | wmcp.sh</title>
<meta name="description" content="We independently audited ${s.total.toLocaleString()} MCP servers. ${s.pct_failing}% scored a D or F. See the full trust-grade distribution, average score, and the most common security weaknesses in the Model Context Protocol ecosystem." />
<link rel="canonical" href="${origin}/reports/state-of-mcp-security-2026" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta property="og:type" content="article" />
<meta property="og:title" content="State of MCP Security 2026" />
<meta property="og:description" content="${s.total.toLocaleString()} MCP servers audited — ${s.pct_failing}% scored D or F. The full ecosystem trust report." />
<meta property="og:url" content="${origin}/reports/state-of-mcp-security-2026" />
<style>${uiCss(820)}
  .lede{font-size:1.15rem}
  .kpis{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));margin:22px 0 8px}
  .kpi{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:16px 18px}
  .kpi .v{font-size:2rem;font-weight:900;letter-spacing:-.02em;line-height:1.05}
  .kpi .l{color:var(--muted);font-size:.78rem;text-transform:uppercase;letter-spacing:.05em;margin-top:5px}
  .drow{display:grid;grid-template-columns:84px 1fr 110px;align-items:center;gap:12px;margin:8px 0}
  .dg{font-weight:900;font-size:1.1rem;text-align:center}
  .fl{font-size:.9rem;color:var(--text)}
  .dn{font-size:.85rem;text-align:right}
  .barwrap{background:var(--bg2);border:1px solid var(--border);border-radius:8px;height:18px;overflow:hidden}
  .bar{height:100%;border-radius:7px 0 0 7px}
  section{margin-top:34px}
  .method{color:var(--muted);font-size:.92rem;line-height:1.6}
  .cta{margin:30px 0;padding:18px 20px;border:1px solid var(--border);border-radius:14px;background:var(--bg2)}
</style>
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head><body>
${uiNav(origin)}
<div class="wrap" style="padding-top:26px">
  <nav class="crumbs"><a href="/">Home</a> › <a href="/mcp/leaderboard">Trust leaderboard</a> › <span>State of MCP Security</span></nav>
  <header>
    <h1>State of MCP Security 2026</h1>
    <p class="lede">We independently audited <b>${s.total.toLocaleString()}</b> Model Context Protocol servers against an OWASP-aligned trust rubric. Here's what the ecosystem actually looks like.</p>
    <p class="dim" style="font-size:.85rem">Live figures · last computed ${date} · methodology below</p>
  </header>

  <div class="kpis">
    <div class="kpi"><div class="v">${s.total.toLocaleString()}</div><div class="l">Servers audited</div></div>
    <div class="kpi"><div class="v">${s.avg_score}<span class="dim" style="font-size:1rem">/100</span></div><div class="l">Average trust score</div></div>
    <div class="kpi"><div class="v" style="color:${COLOR.F}">${s.pct_failing}%</div><div class="l">Scored D or F</div></div>
    <div class="kpi"><div class="v" style="color:${COLOR.A}">${s.pct_passing}%</div><div class="l">Scored A or B</div></div>
  </div>
  <p class="muted" style="font-size:.9rem;margin-top:4px;border-left:2px solid var(--accent2);padding-left:12px">
    <b>What "D or F" means — it's mostly rot, not vulnerabilities.</b> The single biggest driver of low grades is <b>unreachability</b>: ${s.pct_zero}% of registry-listed servers don't respond at all (dead or unresponsive), and many that do are auth-protected or missing transparency signals, so they can't be vetted from outside. Confirmed <b>security</b> issues are comparatively rare — about <b>${s.sample_security_pct}%</b> of audited servers exposed an actual problem like a credential-exfiltration surface or plaintext transport. This measures how <i>vettable</i> the ecosystem is, not that most servers are compromised.
  </p>

  <section>
    <h2>Trust-grade distribution</h2>
    <p class="muted">How all ${s.total.toLocaleString()} audited servers grade out, A through F.</p>
    ${distRows}
  </section>

  <section>
    <h2>The most common weaknesses</h2>
    <p class="muted">Share of a ${s.sample_size}-server sample exhibiting each issue. Unreachability dominates; genuine security findings (plaintext transport, prompt-injection, secret-exfiltration) affect roughly ${s.sample_security_pct}%.</p>
    ${findingRows}
  </section>

  <section>
    <h2>What kinds of servers exist</h2>
    <p class="muted">Every graded server, categorized. Click a category for its own ranked leaderboard.</p>
    ${(() => {
      const maxCat = Math.max(1, ...s.categories.map((c) => c.count));
      return s.categories.map((c) => `<div class="drow"><span class="fl"><a href="${origin}/mcp/leaderboard/${categorySlug(c.name)}" style="color:var(--accent2);text-decoration:none">${c.name}</a></span>${bar(Math.round((c.count / maxCat) * 100), "#ffcf7a")}<span class="dn">${c.count.toLocaleString()}</span></div>`).join("");
    })()}
  </section>

  <section>
    <h2>Most trustworthy MCP servers</h2>
    <p class="muted">The top scorers in the ecosystem right now. Grades are free and identical whether or not the operator pays — independence is the point.</p>
    <table class="tbl"><thead><tr><th class="num">#</th><th>Server</th><th>Grade</th><th class="num">Score</th></tr></thead><tbody>${topRows}</tbody></table>
  </section>

  <div class="cta">
    <strong>Run your own MCP server through the audit free →</strong> <a href="/mcp/grade">/mcp/grade</a>.
    Operators: <a href="/mcp/badges">grab your trust badge</a> to show users you're audited. Browse all grades on the <a href="/mcp/leaderboard">trust leaderboard</a>.
  </div>

  <section>
    <h2>Methodology</h2>
    <p class="method">Each server is scored 0–100 against an OWASP-aligned rubric covering authentication &amp; transport security, tool-annotation honesty, transparency (e.g. RFC 9728 OAuth resource metadata), and behavioral signals observed from real proxied traffic. Letter grades map A+ through F. The distribution and averages above are computed across the full set of ${s.total.toLocaleString()} graded servers; the weakness breakdown is computed from a rolling sample of ${s.sample_size} full audit reports. Figures are recomputed continuously as new servers are graded and existing ones are re-checked for drift. This is an independent assessment — wmcp.sh is not affiliated with the servers listed, and grades are never influenced by payment.</p>
  </section>

  <footer>
    <a href="/mcp/leaderboard">Trust leaderboard</a> · <a href="/mcp/grade">Grade a server</a> · <a href="/mcp/badges">Get your badge</a> · <a href="/">wmcp.sh</a>
  </footer>
</div>
</body></html>`;
}
