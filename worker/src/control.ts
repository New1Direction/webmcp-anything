// control.ts — the per-agent control plane for tool access (the request-path layer).
//
// wmcp sits in the path of every /mcp/:provider call, so it can do the one thing
// the raw first-party servers structurally cannot: meter and govern an agent's
// tool use ACROSS all 25 providers from a single point. This module is that one
// primitive — per-agent call metering — and three product surfaces fall out of it:
//   • budget cap   = a ceiling on the meter (spend safety)
//   • usage pricing = a ceiling at a free-tier limit (the funnel)
//   • audit log     = the meter recorded with no ceiling (observability)
// plus the kill switch — a cheap enforcement flag that instantly 403s an agent's
// tool access everywhere. Caps are what devs pay for; the kill switch is what
// makes them get it in five seconds: "one button kills all your agents' tool
// access across every provider."
//
// "Agent" = the wmcp account (user_id) here in v1; per-API-key sub-agent scoping
// is a later refinement. All state lives in KEYS alongside conn:/provider_token:.
type Env = { KEYS: KVNamespace };

const CTL = (u: string) => `agentctl:${u}`;            // control state (cap + killed)
const METER = (u: string, day: string) => `agentmeter:${u}:${day}`; // per-day call count
const AUDIT = (u: string) => `audit:${u}`;             // capped recent-call log
const AUDIT_MAX = 100;
const AUDIT_TTL = 30 * 86400;
const METER_TTL = 35 * 86400;

export interface AgentControl {
  killed?: boolean;
  daily_cap?: number; // max proxied tool calls/day; undefined = no cap
  updated?: number;
}

export interface AuditEntry {
  ts: number;
  provider: string;
  tool?: string;
  status: number;
  ok: boolean;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getControl(env: Env, user_id: string): Promise<AgentControl | null> {
  try {
    const raw = await env.KEYS.get(CTL(user_id));
    return raw ? (JSON.parse(raw) as AgentControl) : null;
  } catch {
    return null;
  }
}

export async function setControl(
  env: Env,
  user_id: string,
  patch: Partial<AgentControl>
): Promise<AgentControl> {
  const cur = (await getControl(env, user_id)) || {};
  const next: AgentControl = { ...cur, ...patch, updated: Date.now() };
  // Normalize: a null/0/negative cap clears the cap.
  if (next.daily_cap != null && !(next.daily_cap > 0)) delete next.daily_cap;
  await env.KEYS.put(CTL(user_id), JSON.stringify(next));
  return next;
}

async function meterCount(env: Env, user_id: string): Promise<number> {
  try {
    const raw = await env.KEYS.get(METER(user_id, today()));
    return raw ? parseInt(raw, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

/**
 * Hot-path gate, called BEFORE the proxy forwards. Returns {allowed:false,...}
 * when the agent is killed or over its self-set daily cap; otherwise allowed.
 *
 * Cheap by design: one KV read (the control doc). The per-day meter is only read
 * when a cap is actually set. No control set → one get → allowed (non-breaking).
 * Fails OPEN: a KV blip must not take down everyone's proxying — the kill switch
 * is a spend/runaway control, not a security boundary (auth+billing still gate).
 */
export async function checkAgentAllowed(
  env: Env,
  user_id: string
): Promise<{ allowed: true } | { allowed: false; status: number; body: any }> {
  const ctl = await getControl(env, user_id);
  if (!ctl) return { allowed: true };
  if (ctl.killed) {
    return {
      allowed: false,
      status: 403,
      body: {
        error: "agent_killed",
        hint: "This agent's tool access is paused by your kill switch. Re-enable at POST /api/v1/agent/control {\"killed\":false}.",
      },
    };
  }
  if (ctl.daily_cap != null) {
    const used = await meterCount(env, user_id);
    if (used >= ctl.daily_cap) {
      return {
        allowed: false,
        status: 429,
        body: {
          error: "budget_exceeded",
          hint: `Daily tool-call cap reached (${used}/${ctl.daily_cap}). Raise it at POST /api/v1/agent/control or wait for the daily reset (UTC).`,
          used,
          daily_cap: ctl.daily_cap,
        },
      };
    }
  }
  return { allowed: true };
}

/**
 * Record one proxied call: bump the per-day meter + append to the audit log.
 * Fire-and-forget from the proxy (ctx.waitUntil) — MUST NEVER throw into the
 * request path. Approximate read-modify-write is fine (a few lost increments
 * under concurrency don't matter for a budget signal).
 */
export async function recordProxyCall(
  env: Env,
  user_id: string,
  ev: { provider: string; tool?: string; status: number }
): Promise<void> {
  try {
    const day = today();
    // meter
    const mk = METER(user_id, day);
    let n = 0;
    try { const raw = await env.KEYS.get(mk); n = raw ? parseInt(raw, 10) || 0 : 0; } catch {}
    await env.KEYS.put(mk, String(n + 1), { expirationTtl: METER_TTL });
    // audit
    const ak = AUDIT(user_id);
    let log: AuditEntry[] = [];
    try { const raw = await env.KEYS.get(ak); log = raw ? JSON.parse(raw) : []; } catch {}
    log.push({
      ts: Date.now(),
      provider: ev.provider,
      tool: ev.tool,
      status: ev.status,
      ok: ev.status >= 200 && ev.status < 400,
    });
    if (log.length > AUDIT_MAX) log = log.slice(-AUDIT_MAX);
    await env.KEYS.put(ak, JSON.stringify(log), { expirationTtl: AUDIT_TTL });
  } catch {
    /* metering must never break the proxy */
  }
}

export async function getUsage(env: Env, user_id: string) {
  const ctl = (await getControl(env, user_id)) || {};
  const used_today = await meterCount(env, user_id);
  return {
    user_id,
    today: today(),
    used_today,
    daily_cap: ctl.daily_cap ?? null,
    killed: !!ctl.killed,
    remaining: ctl.daily_cap != null ? Math.max(0, ctl.daily_cap - used_today) : null,
  };
}

export async function readAudit(env: Env, user_id: string, limit = 50): Promise<AuditEntry[]> {
  try {
    const raw = await env.KEYS.get(AUDIT(user_id));
    const log: AuditEntry[] = raw ? JSON.parse(raw) : [];
    return log.slice(-Math.max(1, Math.min(AUDIT_MAX, limit))).reverse();
  } catch {
    return [];
  }
}
