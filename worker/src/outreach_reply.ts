// outreach_reply.ts — hands-off reply triage for the trust-grade campaign.
//
// The cold-email platform (Smartlead/Instantly/AgentMail) POSTs each reply to
// the webhook below. We classify it and act so the operator barely touches it:
//   optout  → auto-suppress (added to the suppression list, never contacted again)
//   bounce  → log, ignore
//   ooo     → log, ignore (auto-reply / out of office)
//   cold    → log, mark declined
//   hot     → notify the operator (Slack/webhook) WITH a pre-drafted reply
//   unknown → notify too (a real human reply we can't bucket is worth a look)
//
// Only hot/unknown ever surface. Everything else is handled automatically.
// Copy is plain: no em-dashes, no AI tells.
import { fireAlert } from "./alerts";
import { sendEmail, emailEnabled } from "./email";

type Env = {
  KEYS: KVNamespace; ADMIN_TOKEN?: string;
  // Hot leads go to whichever of these is set (you need neither a Slack nor a
  // Discord): OPERATOR_EMAIL = your inbox (via Resend), LEAD_ALERT_WEBHOOK = a
  // chat webhook. Email is the zero-new-app option.
  OPERATOR_EMAIL?: string; LEAD_ALERT_WEBHOOK?: string;
  RESEND_API_KEY?: string; RESEND_FROM?: string;
};

// Order of checks matters: bounce, then opt-out, then OOO, then cold (so
// "not interested" beats the "interested" substring), then hot, else unknown.
const BOUNCE = /(mailer-daemon|delivery (status|has )?(failed|failure)|undeliverable|address not found|550 5\.|recipient address rejected|message could not be delivered)/i;
const OPTOUT = /\b(unsubscribe|opt[\s-]?out|remove me|take me off|stop emailing|do ?n['o]?t (contact|email|message) me|do not (contact|email)|leave me alone|lose my (email|address))\b/i;
const OOO = /\b(out of (the )?office|on (vacation|leave|holiday|pto|sabbatical)|away (until|from|this)|annual leave|auto[\s-]?reply|automatic reply|currently unavailable)\b/i;
const COLD = /\b(not interested|no,? thank|no thanks|we'?re (all )?(good|set)|already (have|use|using|got)|we pass|i'?ll pass|not (right now|at this time|for us|a (fit|priority))|no need|please don'?t)\b/i;
const HOT = /\b(interested|how much|pricing|price|cost|tell me more|learn more|send (me )?(the|it|more|over)|book|call|demo|schedule|fix (this|it)|how (do|can) (i|we)|what.*(cost|need|next)|happy to|sounds (good|great)|let'?s (talk|chat|do)|set (up|something)|set a time|grab (15|a|some)|yes\b|sure\b)/i;

export function classifyReply(subject: string, text: string): { intent: string; reason: string } {
  const s = `${subject}\n${text}`;
  if (BOUNCE.test(s)) return { intent: "bounce", reason: "delivery failure" };
  if (OPTOUT.test(s)) return { intent: "optout", reason: "unsubscribe / opt-out" };
  if (OOO.test(s)) return { intent: "ooo", reason: "out of office / auto-reply" };
  if (COLD.test(s)) return { intent: "cold", reason: "declined" };
  if (HOT.test(s) || /\?\s*$/.test(text.trim())) return { intent: "hot", reason: "buying signal / question" };
  return { intent: "unknown", reason: "human reply, unclassified" };
}

// Pre-drafted response so the operator copies and sends. Plain, no dashes.
function suggestReply(intent: string): string {
  if (intent === "cold") {
    return [
      "Hi,",
      "No problem, thanks for the reply. The grade and report stay free and public regardless, and we keep re-checking the server, so if anything changes you can always grab the audit later. Appreciate the look.",
    ].join("\n\n");
  }
  return [
    "Hi,",
    "Thanks for getting back. Your full report is on the grade page (the link in my last note) with every failing check broken out.",
    "The Deep Audit gives you the exact fixes, and Monitoring re-checks you on a schedule so the grade stays current and you are alerted if anything slips. Want me to send the audit link, or is it easier to grab 15 minutes this week?",
  ].join("\n\n");
}

function authed(c: any): boolean {
  const env: Env = c.env;
  const token = c.req.query("token") || c.req.header("x-admin-token");
  return !!env.ADMIN_TOKEN && token === env.ADMIN_TOKEN;
}

// POST /api/v1/admin/outreach/reply?token=<ADMIN_TOKEN>
// Body (flexible): { from|email, subject, text|body|message }
export async function handleOutreachReply(c: any): Promise<Response> {
  if (!authed(c)) return c.json({ error: "unauthorized" }, 401);
  const env: Env = c.env;
  const b = (await c.req.json().catch(() => null)) || {};
  const from = String(b.from || b.email || b.from_email || b.sender || "").toLowerCase().trim();
  const subject = String(b.subject || "");
  const text = String(b.text || b.body || b.reply_text || b.message || b.content || "");
  if (!from) return c.json({ error: "from_required" }, 400);

  const { intent, reason } = classifyReply(subject, text);
  const now = Date.now();
  const rev = (Number.MAX_SAFE_INTEGER - now).toString().padStart(16, "0");
  await env.KEYS.put(
    `reply:${rev}`,
    JSON.stringify({ from, subject, intent, reason, snippet: text.slice(0, 300), ts: now }),
    { expirationTtl: 180 * 86400, metadata: { intent, from } }
  );

  if (intent === "optout") {
    await env.KEYS.put(`optout:${from}`, String(now), { metadata: { ts: now } });
    return c.json({ ok: true, intent, action: "suppressed" });
  }
  if (intent === "bounce" || intent === "ooo" || intent === "cold") {
    return c.json({ ok: true, intent, action: "logged" });
  }
  // hot or unknown → surface to the operator with a ready-to-send draft.
  // Goes to email if OPERATOR_EMAIL is set, the chat webhook if that is set, or
  // both. No chat app required.
  const draft = suggestReply(intent);
  const ctx = c.executionCtx || { waitUntil() {} };
  if (env.OPERATOR_EMAIL && emailEnabled(env)) {
    const esc = (s: string) => String(s).replace(/[&<>]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" } as any)[ch]);
    const html =
      `<p><strong>HOT reply (${intent})</strong> from <a href="mailto:${esc(from)}">${esc(from)}</a></p>` +
      `<p>Subject: ${esc(subject) || "(none)"}</p>` +
      `<blockquote style="border-left:3px solid #ff9e2c;padding-left:10px;color:#555">${esc(text.slice(0, 600))}</blockquote>` +
      `<p><strong>Suggested reply (copy, paste, send):</strong></p>` +
      `<pre style="white-space:pre-wrap;background:#f6f6f6;padding:12px;border-radius:8px;font-family:inherit">${esc(draft)}</pre>`;
    ctx.waitUntil(sendEmail(env, { to: env.OPERATOR_EMAIL, subject: `HOT lead: ${from}`, html }).then(() => {}).catch(() => {}));
  }
  fireAlert(env, ctx, `HOT reply (${intent}) from ${from}\nsubject: ${subject}\n"${text.slice(0, 220)}"\n\nsuggested reply:\n${draft}`);
  return c.json({ ok: true, intent, action: "notified", draft });
}

// GET /api/v1/admin/outreach/suppression?token=<ADMIN_TOKEN>
// The opt-out list, for the send platform to import so nobody is re-contacted.
export async function outreachSuppression(c: any): Promise<Response> {
  if (!authed(c)) return c.json({ error: "unauthorized" }, 401);
  const env: Env = c.env;
  const emails: string[] = [];
  let cursor: string | undefined, pages = 0;
  do {
    const r: any = await env.KEYS.list({ prefix: "optout:", limit: 1000, cursor });
    for (const k of r.keys) emails.push(k.name.slice("optout:".length));
    cursor = r.list_complete ? undefined : r.cursor;
    pages++;
  } while (cursor && pages < 10);
  return c.json({ count: emails.length, emails });
}
