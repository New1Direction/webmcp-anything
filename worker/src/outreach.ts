// outreach.ts — admin generator. Turns the live grade graph into a ready-to-send
// outreach campaign: pulls a segment (audit = low-graded commercial servers,
// verified = A-tier commercial servers), fetches each server's real top finding,
// and emits personalized rows (JSON or CSV) to drop into a cold-email platform.
// Regenerates from live grades, so the campaign is always current.
//
// The email copy is written PLAIN on purpose: no em-dashes, no AI tells, short
// human sentences. It has to read like an auditor wrote it, not a model.
//
// GET /api/v1/admin/outreach?segment=audit|verified&max=30&format=csv|json
//   header: x-admin-token

type Env = { CACHE: KVNamespace; ADMIN_TOKEN?: string };

const THROWAWAY = /(trycloudflare|vercel\.app|onrender|ngrok|railway\.app|herokuapp|glitch\.me|repl\.co|fly\.dev|run\.app|workers\.dev|supabase\.co|koyeb|googleapis\.com|^npm:|^pypi:|^gh:|localhost)/;
function isCommercial(host: string): boolean {
  const parts = host.split(".");
  return !THROWAWAY.test(host) && host.includes(".") && parts.length >= 2 && parts.length <= 4;
}
function regDomain(host: string): string {
  const p = host.split(".");
  return p.length <= 2 ? host : p.slice(-2).join(".");
}
function isPayments(cat: string, host: string, finding: string): boolean {
  return /finance|crypto|pay/i.test(cat) || /pay|wallet|crypto|fin|bank|exchange/i.test(host) || /payment|wallet/i.test(finding);
}
function isSecurityVendor(cat: string, host: string): boolean {
  return /security/i.test(host) || /security|pentest/i.test(cat);
}

function topFinding(g: any): { detail: string; owasp: string } {
  const fs: any[] = Array.isArray(g?.findings) ? g.findings : [];
  const fail = fs.find((f) => f.severity === "fail") || fs.find((f) => f.severity === "warn") || fs[0];
  if (!fail) return { detail: "", owasp: "" };
  return { detail: String(fail.detail || "").replace(/\s+/g, " ").trim(), owasp: String(fail.owasp || "") };
}

// Plain copy. No em-dashes, no AI filler.
function auditBody(host: string, grade: string, score: number, finding: string, owasp: string, url: string, cat: string): { subject: string; body: string } {
  const payments = isPayments(cat, host, finding);
  const sec = isSecurityVendor(cat, host);
  let subject = `${host} scored ${grade} on the independent MCP trust audit`;
  if (payments) subject = `your payment MCP tool is flagged for a security issue`;
  if (sec) subject = `heads up: ${host} scores ${grade} on security`;
  const open = sec
    ? `Friendly heads up from one security shop to another. Your MCP server ${host} scores ${grade} on the independent wmcp.sh trust audit, and the flag is an awkward one given what you do.`
    : payments
    ? `Your MCP server ${host} scores ${grade} on the independent wmcp.sh trust audit, and the specific flag is the one a payments product cannot have.`
    : `I run wmcp.sh, an independent trust audit for MCP servers. We score them A to F on security (OWASP MCP Top 10), spec conformance, reliability, and transparency, and re-check on a schedule.`;
  const body = [
    "Hi,",
    "",
    open,
    "",
    `${host} currently scores ${grade} (${score}/100). The flag: ${finding}${owasp ? ` (${owasp}).` : "."}`,
    `Full report: ${url}`,
    "",
    "Anyone evaluating your server sees that grade before they connect. If you want it cleared, the Deep Audit lays out exactly what to change, and Monitoring re-checks you on a schedule and proves the fix to your users.",
    "",
    "The grade is free and the same whether or not you pay. Happy to walk you through the report either way.",
  ].join("\n");
  return { subject, body };
}

function verifiedBody(host: string, grade: string, percentile: string, total: number, url: string): { subject: string; body: string } {
  const subject = `${host} passed the independent MCP trust audit (grade ${grade})`;
  const body = [
    "Hi,",
    "",
    "wmcp.sh runs an independent trust audit for MCP servers: security (OWASP MCP Top 10), spec conformance, reliability, tool hygiene, and transparency, scored A to F.",
    "",
    `${host} scored ${grade}, which puts it in roughly the top ${percentile} of the ${total.toLocaleString()} servers we have graded. Most do not pass cleanly, so it is worth showing the developers who are deciding whether to connect you.`,
    "",
    `You can embed the live badge today for free. It re-checks itself, so it shows your current grade instead of a screenshot: ${url}`,
    "",
    "If it helps, Verified adds claimed ownership plus continuous monitoring, so the grade stays provably current and you get an alert the moment anything slips.",
    "",
    `The grade is free and independent either way. Report: ${url}`,
  ].join("\n");
  return { subject, body };
}

interface Row {
  email: string; host: string; domain: string; grade: string; score: number;
  category: string; owasp: string; finding: string; report_url: string;
  subject: string; body: string;
}

export async function generateOutreach(
  env: Env, segment: "audit" | "verified", max: number, origin: string
): Promise<{ segment: string; total_graded: number; candidates: number; rows: Row[] }> {
  // One pass: collect all graded servers' metadata + grade distribution.
  const all: Array<{ host: string; grade: string; score: number; cat: string; tc: number }> = [];
  const dist: Record<string, number> = {};
  let cursor: string | undefined, pages = 0;
  do {
    const list: any = await env.CACHE.list({ prefix: "grade:", limit: 1000, cursor });
    for (const k of list.keys) {
      const m = (k.metadata || {}) as any;
      if (typeof m.score !== "number") continue;
      dist[m.grade] = (dist[m.grade] || 0) + 1;
      all.push({ host: k.name.slice("grade:".length), grade: m.grade, score: m.score, cat: m.category || "Other", tc: m.tools_count || 0 });
    }
    cursor = list.list_complete ? undefined : list.cursor; pages++;
  } while (cursor && pages < 10);
  const total = all.length;

  const A = new Set(["A+", "A", "A-"]);
  let cands = all.filter((r) =>
    isCommercial(r.host) && r.tc >= 1 &&
    (segment === "audit" ? r.score < 60 : A.has(r.grade))
  );
  // audit: worst first, payments/finance prioritized. verified: best first, most tools.
  const rank = (g: string) => ({ "A+": 6, A: 5, "A-": 4, "B+": 3, B: 2 } as any)[g] || 1;
  if (segment === "audit") cands.sort((a, b) => (isPayments(b.cat, b.host, "") ? 1 : 0) - (isPayments(a.cat, a.host, "") ? 1 : 0) || a.score - b.score || b.tc - a.tc);
  else cands.sort((a, b) => rank(b.grade) - rank(a.grade) || b.tc - a.tc);
  const candidates = cands.length;
  cands = cands.slice(0, Math.min(max, 60));

  // Percentile per grade from the live distribution (verified copy uses it).
  const order = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"];
  const atOrAbove = (grade: string) => {
    const i = order.indexOf(grade);
    let n = 0;
    for (let j = 0; j <= i; j++) n += dist[order[j]] || 0;
    return total ? Math.max(1, Math.round((n / total) * 100)) : 0;
  };

  const rows: Row[] = [];
  for (const c of cands) {
    let g: any = null;
    try { const raw = await env.CACHE.get(`grade:${c.host}`); if (raw) g = JSON.parse(raw); } catch {}
    const { detail, owasp } = topFinding(g);
    const url = `${origin}/mcp/grade/${encodeURIComponent(c.host)}`;
    const copy = segment === "audit"
      ? auditBody(c.host, c.grade, c.score, detail || "security checks failed", owasp, url, c.cat)
      : verifiedBody(c.host, c.grade, `${atOrAbove(c.grade)}%`, total, url);
    rows.push({ email: "", host: c.host, domain: regDomain(c.host), grade: c.grade, score: c.score, category: c.cat, owasp, finding: detail, report_url: url, subject: copy.subject, body: copy.body });
  }
  return { segment, total_graded: total, candidates, rows };
}

function csvCell(v: string | number): string {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function toCsv(rows: Row[]): string {
  const cols: (keyof Row)[] = ["email", "host", "domain", "grade", "score", "category", "owasp", "finding", "report_url", "subject", "body"];
  const head = cols.join(",");
  const lines = rows.map((r) => cols.map((c) => csvCell(r[c])).join(","));
  return [head, ...lines].join("\n");
}

// GET /api/v1/admin/outreach?segment=audit|verified&max=30&format=csv|json
export async function outreachCampaign(c: any): Promise<Response> {
  const env: Env = c.env;
  if (!env.ADMIN_TOKEN || c.req.header("x-admin-token") !== env.ADMIN_TOKEN) {
    return c.json({ error: "admin only" }, 401);
  }
  const segment = c.req.query("segment") === "verified" ? "verified" : "audit";
  const max = Math.min(Math.max(parseInt(c.req.query("max") || "30", 10) || 30, 1), 60);
  const format = c.req.query("format") === "csv" ? "csv" : "json";
  const origin = new URL(c.req.url).origin;
  const out = await generateOutreach(env, segment, max, origin);
  if (format === "csv") {
    return new Response(toCsv(out.rows), {
      headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="outreach-${segment}.csv"` },
    });
  }
  return c.json(out);
}
