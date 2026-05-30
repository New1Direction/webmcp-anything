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

// In-isolate cache of user_ids we've observed as KILLED. This exists so the kill
// switch FAILS CLOSED: once any request in this isolate has seen a user killed,
// a later KV read error can never resurrect them — we keep denying. It is only
// cleared by an AUTHORITATIVE (successful) read showing not-killed, so KV is
// still the source of truth on the happy path; the cache only governs the
// read-error path. (Per-isolate, ephemeral — the correct "local cache" scope.)
const KILLED_LOCAL = new Set<string>();

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
  // Keep the local fail-closed cache in step in THIS isolate immediately (other
  // isolates converge via the authoritative-read path in checkAgentAllowed).
  if (next.killed) KILLED_LOCAL.add(user_id);
  else KILLED_LOCAL.delete(user_id);
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

const KILLED_BODY = {
  error: "agent_killed",
  hint: "This agent's tool access is paused by your kill switch. Re-enable at POST /api/v1/agent/control {\"killed\":false}.",
};

/**
 * Hot-path gate, called BEFORE the proxy forwards. One KV read (the control doc);
 * the per-day meter is only read when a cap is set; no control set → allowed
 * (non-breaking).
 *
 * SPLIT FAIL CONTRACTS — these are two different trust promises and must fail in
 * opposite directions:
 *   • KILL SWITCH = safety. FAILS CLOSED. We positioned it as "one button kills
 *     all your agents," so it must not silently no-op exactly when someone's
 *     panic-hitting it. On a KV read error we deny any user we've ever observed
 *     killed (KILLED_LOCAL, the in-isolate cache) — a blip cannot resurrect a
 *     killed agent. The cache is only cleared by an authoritative not-killed read.
 *   • BUDGET CAP = spend control. FAILS OPEN. A KV blip must not take down
 *     everyone's proxying for an overage we can reconcile later.
 */
export async function checkAgentAllowed(
  env: Env,
  user_id: string
): Promise<{ allowed: true } | { allowed: false; status: number; body: any }> {
  let ctl: AgentControl | null = null;
  let readOk = true;
  try {
    const raw = await env.KEYS.get(CTL(user_id));
    ctl = raw ? (JSON.parse(raw) as AgentControl) : null;
  } catch {
    readOk = false;
  }

  if (!readOk) {
    // Control state unreadable. Kill = safety → fail CLOSED for anyone we've seen
    // killed in this isolate; cap = spend → fail OPEN for everyone else.
    if (KILLED_LOCAL.has(user_id)) {
      return { allowed: false, status: 403, body: { ...KILLED_BODY, degraded: true } };
    }
    return { allowed: true };
  }

  // Authoritative read: KV is the source of truth, sync the fail-closed cache.
  if (ctl?.killed) {
    KILLED_LOCAL.add(user_id);
    return { allowed: false, status: 403, body: KILLED_BODY };
  }
  KILLED_LOCAL.delete(user_id);

  if (ctl?.daily_cap != null) {
    const used = await meterCount(env, user_id); // meterCount fails OPEN (returns 0)
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

// Test-only: reset the in-isolate fail-closed cache between cases.
export function __resetKilledCache(): void {
  KILLED_LOCAL.clear();
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
