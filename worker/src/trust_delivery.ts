// trust_delivery.ts — fulfillment for the MCP trust SKUs and the grade-page
// lead capture. The grade page promises "findings are on the way" and the
// Monitoring subscription promises alerts; this module is what actually sends
// them (email via Resend — dark until RESEND_API_KEY is set — plus the
// subscriber's own webhook).
//
// Every email is rendered from the STORED grade (CACHE grade:<host>), never
// from caller-supplied text, so the lead form can't be used to mail arbitrary
// content to a third party.

import type { GradeResult, Finding } from "./mcp_grade";
import { sendEmail, emailEnabled } from "./email";

type Env = { CACHE: KVNamespace; KEYS?: KVNamespace; USAGE?: KVNamespace; RESEND_API_KEY?: string; RESEND_FROM?: string };

const ORIGIN = "https://wmcp.sh";

const FIX_BY_FINDING: Record<string, string> = {
  tls: "Serve the endpoint over HTTPS only (and redirect or refuse plain HTTP). This finding alone caps the grade at F.",
  reachable:
    "Nothing answered an MCP initialize at the conventional endpoints. If your server lives at a different path, reply with the exact URL; otherwise check that POST <endpoint> with an initialize request returns a JSON-RPC result over Streamable HTTP.",
  tool_poisoning:
    "Strip hidden/instructional markup from tool descriptions (e.g. <IMPORTANT>, 'ignore previous', invisible text). Descriptions should state what the tool does, nothing the model should obey.",
  secret_exfil:
    "Remove references to credential files and secret paths (~/.ssh, .env, tokens) from tool names, descriptions and schemas, and make sure no tool can read them.",
  auth: "OAuth-protected servers can't be fully exercised anonymously. Connect it through the wmcp.sh proxy (/connect) so reliability is measured from real calls.",
  sse_limited: "Move from the legacy HTTP+SSE transport to Streamable HTTP (the current MCP spec transport) so every tool can be audited.",
  flaky_tool: "The named tool errors frequently in real traffic. Check its upstream dependency, timeouts and argument validation.",
};

const FIX_BY_SUBSCORE: Record<string, [string, string]> = {
  spec: ["Spec conformance", "Negotiate a current protocolVersion, return serverInfo, and answer tools/list with valid JSON Schemas."],
  security: ["Security (OWASP MCP)", "Resolve the failing security findings above; each maps to an OWASP MCP Top 10 item."],
  reliability: ["Reliability", "Reduce cold-start latency and make sure every advertised tool answers without error."],
  hygiene: ["Tool hygiene", "Give every tool a clear name, a one-sentence description, typed input schemas, and readOnlyHint/destructiveHint annotations."],
  transparency: ["Transparency", "Publish serverInfo name + version and link a homepage/repository so users can see who runs the server."],
};

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" } as any)[ch]);

export function fixPlan(r: GradeResult): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const ordered = [...(r.findings || [])].sort((a, b) => sevRank(a) - sevRank(b));
  for (const f of ordered) {
    const fix = FIX_BY_FINDING[f.id];
    if (fix && !seen.has(f.id)) {
      seen.add(f.id);
      out.push(fix);
    }
  }
  for (const [key, [label, fix]] of Object.entries(FIX_BY_SUBSCORE)) {
    const s = r.sub?.[key];
    if (s && s.score < 60 && !(key === "security" && out.length)) out.push(`${label} (${s.score}/100): ${fix}`);
  }
  return out;
}

function sevRank(f: Finding): number {
  return f.severity === "fail" ? 0 : f.severity === "warn" ? 1 : 2;
}

export type FindingsVariant = "lead" | "audit" | "monitor_welcome";

export function findingsEmail(r: GradeResult, variant: FindingsVariant): { subject: string; html: string } {
  const report = `${ORIGIN}/mcp/grade/${encodeURIComponent(r.host)}`;
  const graded = r.grade !== "?";
  const subject =
    variant === "audit"
      ? `Your MCP audit: ${r.host} — grade ${r.grade} (${r.score}/100)`
      : variant === "monitor_welcome"
      ? `Monitoring is on for ${r.host}`
      : `${r.host}: grade ${r.grade} (${r.score}/100) — findings + fix path`;
  const intro =
    variant === "audit"
      ? `Thanks for ordering the Deep Audit. Here is the full machine audit for <b>${esc(r.host)}</b> right now; a human review of these findings follows by email.`
      : variant === "monitor_welcome"
      ? `We now re-check <b>${esc(r.host)}</b> every 2 hours and email you the moment its tools change (added, removed or silently rewritten) or its grade drops. This is where it stands today.`
      : `Here are the findings for <b>${esc(r.host)}</b> you asked for, with what to change to clear them.`;
  const findings = (r.findings || []).length
    ? (r.findings || [])
        .slice()
        .sort((a, b) => sevRank(a) - sevRank(b))
        .slice(0, 12)
        .map((f) => `<li><b>${esc(f.severity.toUpperCase())}</b>${f.owasp ? ` · ${esc(f.owasp)}` : ""} — ${esc(f.detail)}</li>`)
        .join("")
    : "<li>No blocking issues in the static + spec checks.</li>";
  const subs = Object.entries(r.sub || {})
    .map(([k, s]) => `<tr><td style="padding:2px 12px 2px 0">${esc(FIX_BY_SUBSCORE[k]?.[0] || k)}</td><td><b>${esc(s.score)}</b>/100</td></tr>`)
    .join("");
  const fixes = fixPlan(r);
  const fixHtml = fixes.length ? `<h3 style="font-size:15px;margin:18px 0 6px">Fix path</h3><ol>${fixes.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>` : "";
  const offer =
    variant === "lead"
      ? `<p>Want it cleared and proven? The <b>Deep Audit</b> walks through every finding with you, and <b>Monitoring</b> re-checks the server every 2 hours so anyone who looks sees the current grade: <a href="${report}#act">${report}#act</a></p>`
      : variant === "audit"
      ? `<p>After you ship fixes, <b>Monitoring</b> keeps the grade current and alerts you on drift: <a href="${report}#act">${report}#act</a></p>`
      : `<p>Manage or cancel anytime from your Stripe receipt.</p>`;
  const html = `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:600px;color:#16161f;line-height:1.55">
<p>${intro}</p>
<p style="font-size:18px;margin:14px 0"><b>${graded ? `Grade ${esc(r.grade)} · ${esc(r.score)}/100` : "Not graded yet"}</b> <span style="color:#666;font-size:13px">checked ${esc(new Date(r.checked_at).toISOString().slice(0, 16).replace("T", " "))} UTC</span></p>
${subs ? `<table style="font-size:14px;border-collapse:collapse">${subs}</table>` : ""}
<h3 style="font-size:15px;margin:18px 0 6px">Findings</h3><ul>${findings}</ul>
${fixHtml}
${offer}
<p>Full report: <a href="${report}">${report}</a></p>
<p style="color:#777;font-size:12px">The grade is independent and free, and identical whether or not you pay. wmcp.sh · reply to this email with questions.</p></div>`;
  return { subject, html };
}

async function readGrade(env: Env, host: string): Promise<GradeResult | null> {
  const raw = await env.CACHE.get(`grade:${host.toLowerCase()}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function digest(s: string): Promise<string> {
  const b = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)));
  return Array.from(b.slice(0, 12)).map((x) => x.toString(16).padStart(2, "0")).join("");
}

// One findings email per (recipient, host, variant) per day — the lead form is
// public, so this caps how often it can be pointed at the same inbox.
export async function sendFindingsEmail(
  env: Env,
  to: string,
  host: string,
  variant: FindingsVariant
): Promise<{ sent: boolean; reason?: string }> {
  if (!emailEnabled(env)) return { sent: false, reason: "email_disabled" };
  const r = await readGrade(env, host);
  if (!r) return { sent: false, reason: "no_grade" };
  if (env.USAGE) {
    const k = `findmail:${await digest(`${to.toLowerCase()}|${host}|${variant}`)}:${new Date().toISOString().slice(0, 10)}`;
    if (await env.USAGE.get(k)) return { sent: false, reason: "already_sent_today" };
    await env.USAGE.put(k, "1", { expirationTtl: 2 * 86400 });
  }
  const { subject, html } = findingsEmail(r, variant);
  const res = await sendEmail(env, { to, subject, html });
  return { sent: res.ok, reason: res.error };
}

// Hosts with at least one live Monitoring subscription (monitorsub:<host>:<sub>).
export async function monitoredHosts(env: { KEYS?: KVNamespace }): Promise<string[]> {
  if (!env.KEYS) return [];
  const hosts = new Set<string>();
  let cursor: string | undefined;
  let pages = 0;
  do {
    const r: any = await env.KEYS.list({ prefix: "monitorsub:", limit: 1000, cursor });
    for (const k of r.keys) {
      const rest = k.name.slice("monitorsub:".length);
      const i = rest.lastIndexOf(":");
      if (i > 0) hosts.add(rest.slice(0, i));
    }
    cursor = r.list_complete ? undefined : r.cursor;
    pages++;
  } while (cursor && pages < 5);
  return [...hosts];
}

// Drift / grade-drop alert to every paying subscriber of `host`: their webhook
// (Slack-compatible {text}) and their email.
export async function notifyMonitorSubscribers(env: Env, host: string, text: string): Promise<number> {
  if (!env.KEYS) return 0;
  let keys: { name: string }[] = [];
  try {
    keys = (await env.KEYS.list({ prefix: `monitorsub:${host}:` })).keys;
  } catch {
    return 0;
  }
  const report = `${ORIGIN}/mcp/grade/${encodeURIComponent(host)}`;
  let delivered = 0;
  await Promise.all(
    keys.map(async (k) => {
      try {
        const raw = await env.KEYS!.get(k.name);
        const sub = raw ? JSON.parse(raw) : null;
        if (!sub) return;
        if (sub.alert_url) {
          await fetch(sub.alert_url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text }) })
            .then(() => delivered++)
            .catch(() => {});
        }
        if (sub.email && emailEnabled(env)) {
          const res = await sendEmail(env, {
            to: sub.email,
            subject: `Alert: ${host} changed`,
            html: `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:600px;color:#16161f;line-height:1.55"><p>${esc(text)}</p><p>Current report: <a href="${report}">${report}</a></p><p style="color:#777;font-size:12px">You're receiving this because you subscribed to wmcp.sh Monitoring for ${esc(host)}.</p></div>`,
          });
          if (res.ok) delivered++;
        }
      } catch {}
    })
  );
  return delivered;
}
