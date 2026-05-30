// behavior.ts — observed behavioral telemetry from REAL proxied tool calls.
//
// The vertical moat (v2). A static scanner reads the label; the proxy tastes the
// food. Every tools/call that flows through /mcp/:provider contributes a tiny,
// non-blocking observation — which tool, did it succeed (transport), how long it
// took — accumulated per host in `behavior:<host>`. recordGrade then folds this
// into the trust grade: the Reliability dimension stops being a single synthetic
// probe and becomes "observed over N real calls (p50/p95, error rate)", and
// flaky/failing tools surface as behavioral findings. This is the half Anthropic
// can't commoditize from a spec conformance suite — it requires the traffic only
// the execution-path proxy sees. The dataset is uncloneable and compounds.
type Env = { CACHE: KVNamespace };

const KEY = (host: string) => `behavior:${host}`;
const TTL = 30 * 86400;            // rolling 30-day window
const MAX_LAT = 20;                // latency samples kept per scope (bounds KV size)
const MIN_CALLS_TO_SCORE = 5;      // don't grade behavior on near-zero data
const FLAKY_RATE = 0.25;           // a tool failing ≥25% of observed calls is flaky

export interface ToolStat { calls: number; errors: number; lat: number[]; last: number }
export interface BehaviorRecord {
  host: string;
  updated: number;
  since: number;
  total_calls: number;
  total_errors: number;
  lat: number[];
  tools: Record<string, ToolStat>;
}

export interface BehaviorSummary {
  host: string;
  observed_calls: number;
  tools_observed: number;
  error_rate: number;        // 0..1
  p50_ms: number | null;
  p95_ms: number | null;
  reliability_score: number; // 0..100, the observed Reliability sub-score
  since: number;
  flaky: { tool: string; calls: number; error_rate: number }[];
  per_tool: { tool: string; calls: number; error_rate: number; p95_ms: number | null }[];
}

function pct(samples: number[], p: number): number | null {
  if (!samples.length) return null;
  const s = [...samples].sort((a, b) => a - b);
  const i = Math.min(s.length - 1, Math.floor((p / 100) * s.length));
  return s[i];
}

/**
 * Record one observed tool call. Fire-and-forget from the proxy (ctx.waitUntil);
 * MUST NEVER throw into the proxy path. Approximate read-modify-write is fine —
 * this is a trust signal, not an accounting ledger.
 */
export async function recordToolCall(
  env: Env,
  host: string,
  ev: { tool?: string; ok: boolean; latency_ms: number }
): Promise<void> {
  try {
    const h = host.toLowerCase();
    const k = KEY(h);
    let rec: BehaviorRecord | null = null;
    try { const raw = await env.CACHE.get(k); rec = raw ? JSON.parse(raw) : null; } catch {}
    const now = Date.now();
    if (!rec) rec = { host: h, updated: now, since: now, total_calls: 0, total_errors: 0, lat: [], tools: {} };
    rec.total_calls++;
    if (!ev.ok) rec.total_errors++;
    rec.lat.push(ev.latency_ms);
    if (rec.lat.length > MAX_LAT) rec.lat = rec.lat.slice(-MAX_LAT);
    if (ev.tool) {
      const t = rec.tools[ev.tool] || { calls: 0, errors: 0, lat: [], last: 0 };
      t.calls++;
      if (!ev.ok) t.errors++;
      t.lat.push(ev.latency_ms);
      if (t.lat.length > MAX_LAT) t.lat = t.lat.slice(-MAX_LAT);
      t.last = now;
      rec.tools[ev.tool] = t;
    }
    rec.updated = now;
    await env.CACHE.put(k, JSON.stringify(rec), { expirationTtl: TTL });
  } catch {
    /* telemetry must never break the proxy */
  }
}

export async function readBehavior(env: Env, host: string): Promise<BehaviorRecord | null> {
  try {
    const raw = await env.CACHE.get(KEY(host.toLowerCase()));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Reduce raw observations to a scored summary. Returns null when we haven't seen
 * enough real traffic to say anything honest (so un-observed servers keep their
 * single-probe reliability rather than getting penalized for our blind spot).
 */
export function summarizeBehavior(rec: BehaviorRecord | null): BehaviorSummary | null {
  if (!rec || rec.total_calls < MIN_CALLS_TO_SCORE) return null;
  const error_rate = rec.total_calls ? rec.total_errors / rec.total_calls : 0;
  const p50 = pct(rec.lat, 50);
  const p95 = pct(rec.lat, 95);
  // Observed reliability: full marks, minus error rate, minus slow-p95 penalty.
  let rel = 100;
  rel -= Math.round(error_rate * 100);
  if (p95 != null) {
    if (p95 > 8000) rel -= 30;
    else if (p95 > 4000) rel -= 18;
    else if (p95 > 1500) rel -= 8;
  }
  rel = Math.max(0, Math.min(100, rel));
  const per_tool = Object.entries(rec.tools).map(([tool, t]) => ({
    tool,
    calls: t.calls,
    error_rate: t.calls ? t.errors / t.calls : 0,
    p95_ms: pct(t.lat, 95),
  }));
  const flaky = per_tool
    .filter((x) => x.calls >= MIN_CALLS_TO_SCORE && x.error_rate >= FLAKY_RATE)
    .map((x) => ({ tool: x.tool, calls: x.calls, error_rate: x.error_rate }));
  return {
    host: rec.host,
    observed_calls: rec.total_calls,
    tools_observed: Object.keys(rec.tools).length,
    error_rate,
    p50_ms: p50,
    p95_ms: p95,
    reliability_score: rel,
    since: rec.since,
    flaky,
    per_tool,
  };
}
