// email.ts — transactional + broadcast email via Resend. Ships DARK: with no
// RESEND_API_KEY set, every send is a no-op. Turns the captured lead list into a
// real channel: confirmation on subscribe + an owner broadcast (the report
// newsletter → Monitor-SKU funnel).
//
// Turn on: sign up at resend.com, verify the wmcp.sh sending domain, then
//   printf '%s' 're_...' | npx wrangler secret put RESEND_API_KEY
//   printf '%s' 'wmcp.sh <updates@wmcp.sh>' | npx wrangler secret put RESEND_FROM

export const emailEnabled = (env: any): boolean => !!env.RESEND_API_KEY;
const FROM = (env: any): string => env.RESEND_FROM || "wmcp.sh <updates@wmcp.sh>";

export async function sendEmail(env: any, msg: { to: string; subject: string; html: string }): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  if (!env.RESEND_API_KEY) return { ok: false, skipped: true };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ from: FROM(env), to: [msg.to], subject: msg.subject, html: msg.html }),
    });
    if (!res.ok) return { ok: false, error: `resend ${res.status}` };
    return { ok: true };
  } catch (e: any) { return { ok: false, error: String(e?.message || e) }; }
}

// Broadcast to captured leads via Resend's batch endpoint (one request, ≤100
// messages — stays under the rate limit). Optionally filter by capture package.
export async function broadcastToLeads(env: any, subject: string, html: string, opts: { pkg?: string; max?: number } = {}): Promise<{ sent: number; total: number; skipped?: boolean; error?: string }> {
  if (!env.RESEND_API_KEY) return { sent: 0, total: 0, skipped: true };
  if (!env.KEYS) return { sent: 0, total: 0, error: "no KEYS namespace" };
  const seen = new Set<string>();
  const emails: string[] = [];
  let cursor: string | undefined, pages = 0;
  do {
    const r: any = await env.KEYS.list({ prefix: "lead:", limit: 1000, cursor });
    for (const k of r.keys) {
      const m = k.metadata as any;
      const e = m?.email;
      if (e && !seen.has(e) && (!opts.pkg || m.package === opts.pkg)) { seen.add(e); emails.push(e); }
    }
    cursor = r.list_complete ? undefined : r.cursor; pages++;
  } while (cursor && pages < 10);
  const batch = emails.slice(0, Math.min(opts.max || 100, 100));
  if (!batch.length) return { sent: 0, total: emails.length };
  try {
    const res = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify(batch.map((to) => ({ from: FROM(env), to: [to], subject, html }))),
    });
    if (!res.ok) return { sent: 0, total: emails.length, error: `resend ${res.status}` };
    return { sent: batch.length, total: emails.length };
  } catch (e: any) { return { sent: 0, total: emails.length, error: String(e?.message || e) }; }
}

// Confirmation for someone who subscribed from the report/leaderboard. Delivers
// value immediately + a soft Monitor-SKU upsell.
export function subscribeConfirmHtml(): string {
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;color:#16161f;line-height:1.6">
  <h2 style="margin:0 0 10px;font-size:20px">You're on the list ✓</h2>
  <p style="margin:0 0 14px">You'll get the monthly <b>State of MCP Security</b> report — and an alert the moment a server you care about drops a grade or ships a rug-pull.</p>
  <p style="margin:0 0 14px">If you run an MCP server: <a href="https://wmcp.sh/mcp/grade" style="color:#d97706;font-weight:600">grade it free</a>, then turn on <a href="https://wmcp.sh/mcp/badges" style="color:#d97706;font-weight:600">continuous monitoring</a> so you're first to know if your grade slips.</p>
  <p style="margin:0 0 14px"><a href="https://wmcp.sh/reports/state-of-mcp-security-2026" style="color:#d97706;font-weight:600">Read the latest report →</a></p>
  <p style="color:#8a8aa8;font-size:13px;margin:18px 0 0">— wmcp.sh · the independent MCP trust authority</p>
</div>`;
}
