// leads.ts — buyer-finding funnel. Turns KV account state into a RANKED list of
// real prospects, because the strategy red-team's #1 finding was "no buyer in
// the building": revenue is on, but no signup/usage signal was ever surfaced.
//
// The signal already exists in KEYS; this just reads + ranks it per account:
//   user:<id>                  → { keys, plan, email?, github_login? }  (the account)
//   email:<addr>               → <id>                                   (reverse email index)
//   key:<key>                  → { user_id, plan, status, created_at }
//   conn:<id>:<provider>       → managed-connection entitlement         (tools connected)
//   agentmeter:<id>:<day>      → proxied tool-call count                (REAL usage — warmest)
//   agentctl:<id>              → { killed, daily_cap }                  (governance configured)
//   audit:<id>                 → recent proxied calls                   (recency)
//
// Warmth = why you'd talk to them first: a free-plan account with real proxy
// traffic and a cap set is a hotter lead than a paid account that never called a
// tool. Output is sorted hottest-first with the email to reach them.

type Env = { KEYS: KVNamespace; USAGE?: KVNamespace; ADMIN_TOKEN?: string; ENVIRONMENT?: string };

export interface Lead {
  user_id: string;
  email: string | null;
  plan: string;
  keys: number;
  connections: string[];       // provider ids with an active managed connection
  calls_recent: number;        // proxied tool calls across the recent window
  active_days: number;         // distinct days with proxied traffic in the window
  cap_set: boolean;            // configured a daily cap (governance intent)
  killed: boolean;             // currently using the kill switch
  last_call_ts: number | null; // most recent proxied call
  score: number;               // warmth — higher = talk to first
  why: string[];               // human-readable reasons for the score
}

const DAY_MS = 86400000;

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

// Recent N day strings (UTC), based on an injected "now" so it's testable.
function recentDays(now: number, n: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < n; i++) out.push(new Date(now - i * DAY_MS).toISOString().slice(0, 10));
  return out;
}

function safeJson<T>(s: string | null): T | null {
  if (!s) return null;
  try { return JSON.parse(s) as T; } catch { return null; }
}

/**
 * Score a lead by warmth. The ranking encodes the buyer thesis: REAL proxy
 * traffic is the strongest "this is a live integration" signal, governance
 * configuration is the strongest "they care about control" (= the thing we
 * sell) signal, multi-tool breadth means a serious agent, and paid status is a
 * floor not a peak (a paid account that never calls a tool is at churn risk, not
 * a hot upsell). Pure function so the ranking is unit-testable.
 */
export function scoreLead(l: Omit<Lead, "score" | "why">): { score: number; why: string[] } {
  let score = 0;
  const why: string[] = [];
  if (l.calls_recent > 0) {
    const pts = Math.min(50, 10 + Math.round(Math.log10(l.calls_recent + 1) * 20));
    score += pts;
    why.push(`${l.calls_recent} proxied calls`);
  }
  if (l.active_days >= 2) { score += 15; why.push(`active ${l.active_days} days`); }
  if (l.cap_set) { score += 20; why.push("set a spend cap"); }
  if (l.killed) { score += 8; why.push("used the kill switch"); }
  if (l.connections.length >= 3) { score += 15; why.push(`${l.connections.length} tools connected`); }
  else if (l.connections.length > 0) { score += 8; why.push(`${l.connections.length} tool(s) connected`); }
  if (l.plan && l.plan !== "free") { score += 10; why.push(`on ${l.plan}`); }
  if (l.email) { score += 3; } else { why.push("no email on file"); }
  // Flag genuine idleness regardless of the small email bonus — an account with
  // no traffic, no tools, and no governance config is a cold lead even if it has
  // an email on file (so score may be 3, not 0).
  const idle = l.calls_recent === 0 && l.connections.length === 0 && !l.cap_set && !l.killed;
  if (idle) why.push("signed up, no activity yet");
  return { score, why };
}

/**
 * Scan accounts and return ranked leads. `nowMs` is injectable for tests.
 * windowDays bounds the proxy-traffic lookback (default 14).
 */
export async function getLeads(
  env: Env,
  opts: { windowDays?: number; nowMs?: number; limit?: number } = {}
): Promise<{ leads: Lead[]; scanned: number; window_days: number }> {
  const windowDays = opts.windowDays ?? 14;
  const now = opts.nowMs ?? Date.parse(todayUTC() + "T00:00:00Z");
  const limit = Math.min(500, opts.limit ?? 200);
  const days = recentDays(now, windowDays);

  // Enumerate accounts via user:<id>. Accounts are few; one list is cheap.
  const userList = await env.KEYS.list({ prefix: "user:", limit: 1000 });

  // Build a reverse email index (email:<addr> -> user_id) so we can attach the
  // contact address even when the user record doesn't carry it inline.
  const emailList = await env.KEYS.list({ prefix: "email:", limit: 1000 });
  const emailByUser: Record<string, string> = {};
  await Promise.all(
    emailList.keys.map(async (k: any) => {
      const addr = k.name.slice("email:".length);
      const uid = await env.KEYS.get(k.name);
      if (uid && !emailByUser[uid]) emailByUser[uid] = addr;
    })
  );

  const leads: Lead[] = [];
  await Promise.all(
    userList.keys.map(async (k: any) => {
      const user_id = k.name.slice("user:".length);
      const rec = safeJson<{ keys?: string[]; plan?: string; email?: string }>(
        await env.KEYS.get(k.name)
      ) || {};

      // Connections: conn:<user_id>:<provider>
      const connList = await env.KEYS.list({ prefix: `conn:${user_id}:`, limit: 100 });
      const connections = connList.keys
        .map((ck: any) => ck.name.slice(`conn:${user_id}:`.length))
        .filter(Boolean);

      // Proxy traffic across the window: agentmeter:<user_id>:<day>
      let calls_recent = 0;
      let active_days = 0;
      await Promise.all(
        days.map(async (d) => {
          const raw = await env.KEYS.get(`agentmeter:${user_id}:${d}`);
          const n = raw ? parseInt(raw, 10) || 0 : 0;
          if (n > 0) { calls_recent += n; active_days += 1; }
        })
      );

      // Governance config: agentctl:<user_id>
      const ctl = safeJson<{ killed?: boolean; daily_cap?: number }>(
        await env.KEYS.get(`agentctl:${user_id}`)
      );

      // Recency from the audit tail (cheap: last entry only matters).
      const audit = safeJson<Array<{ ts: number }>>(await env.KEYS.get(`audit:${user_id}`));
      const last_call_ts = audit && audit.length ? audit[audit.length - 1].ts : null;

      const base = {
        user_id,
        email: rec.email || emailByUser[user_id] || null,
        plan: rec.plan || "free",
        keys: (rec.keys || []).length,
        connections,
        calls_recent,
        active_days,
        cap_set: !!(ctl && ctl.daily_cap != null && ctl.daily_cap > 0),
        killed: !!(ctl && ctl.killed),
        last_call_ts,
      };
      const { score, why } = scoreLead(base);
      leads.push({ ...base, score, why });
    })
  );

  leads.sort((a, b) => (b.score - a.score) || ((b.last_call_ts || 0) - (a.last_call_ts || 0)));
  return { leads: leads.slice(0, limit), scanned: userList.keys.length, window_days: windowDays };
}

// GET /api/v1/admin/leads — admin-gated ranked prospect list.
export async function getLeadsResponse(c: any) {
  const header = c.req.header("x-admin-token");
  const want = c.env.ADMIN_TOKEN || (c.env.ENVIRONMENT === "development" ? "devadmin" : null);
  if (!want || header !== want) return c.json({ error: "admin only" }, 401);
  const windowDays = parseInt(c.req.query("window") || "14", 10) || 14;
  const out = await getLeads(c.env, { windowDays });
  // Headline counts the operator actually cares about.
  const hot = out.leads.filter((l) => l.score >= 30).length;
  const active = out.leads.filter((l) => l.calls_recent > 0).length;
  return c.json({ ...out, hot, active });
}
