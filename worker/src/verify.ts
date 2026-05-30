// verify.ts — the verify-then-execute primitive (liability transfer).
//
// One reusable call an agent (or our own proxy / REST surface) makes BEFORE it
// runs a tool against a third-party MCP server: read the continuously-watched
// trust grade (cached <6h, else score fresh), surface behavioral DRIFT (tools
// added / removed / silently rewritten since the baseline = the rug-pull class),
// record the verification event to accumulate the proprietary drift dataset, and
// return a connect/caution/avoid-style verdict.
//
// Composes mcp_grade directly (NOT mcp_oracle — that would be circular, since the
// oracle now imports this for its verify_before_execute tool). Zero new scoring
// or diff logic lives here: scoreMcpServer / recordGrade / readGrade stay the one
// source of truth in mcp_grade.ts.
import { scoreMcpServer, recordGrade, readGrade, type GradeResult } from "./mcp_grade";

type Env = { CACHE: KVNamespace; KEYS?: KVNamespace };

// Mirrors the oracle's cached-grade window: re-probe only if older than this.
export const FRESH_MS = 6 * 60 * 60 * 1000;
const DRIFT_RECENT_MS = 24 * 60 * 60 * 1000;

export interface VerifyVerdict {
  host: string;
  url: string;
  letter: string;
  score: number;
  reachable: boolean;
  auth_required: boolean;
  drift: {
    drifted: boolean;
    count: number;
    last_drift: { ts: number; added: string[]; removed: string[]; changed: string[] } | null;
    added: string[];
    removed: string[];
  };
  watched_since: number | null;
  verdict: "ok" | "caution" | "drifted" | "failing" | "ungraded";
  reason: string;
  checked_at: number;
  report_url: string;
}

// Cached-<6h-else-score, reusing recordGrade so gradewatch/gradehist stay warm.
async function gradeForVerify(env: Env, url: string, fresh: boolean): Promise<GradeResult> {
  let host = url;
  try { host = new URL(url).host.toLowerCase(); } catch {}
  if (!fresh) {
    const cached = await readGrade(env, host);
    if (cached && Date.now() - cached.checked_at < FRESH_MS) return cached;
  }
  const r = await scoreMcpServer(url);
  await recordGrade(env, r);
  return r;
}

function decide(r: GradeResult): { verdict: VerifyVerdict["verdict"]; reason: string } {
  if (r.hard_fail === "plaintext_http") return { verdict: "failing", reason: "Endpoint is not HTTPS." };
  if (r.hard_fail === "tool_poisoning") return { verdict: "failing", reason: "Tool descriptions contain prompt-injection / poisoning markup." };
  if (!r.reachable) return { verdict: "failing", reason: "Server did not respond." };
  if (r.grade === "F" || r.grade.startsWith("D")) return { verdict: "failing", reason: `Low trust grade (${r.grade}).` };
  const driftedRecently = !!(r.last_drift && Date.now() - r.last_drift.ts < DRIFT_RECENT_MS);
  if (driftedRecently) return { verdict: "drifted", reason: "Tool surface changed in the last 24h — re-review before executing." };
  if (r.grade.startsWith("C")) return { verdict: "caution", reason: `Moderate trust grade (${r.grade}).` };
  if (!r.grade) return { verdict: "ungraded", reason: "No grade could be produced." };
  return { verdict: "ok", reason: `Trust grade ${r.grade}; no recent drift.` };
}

/**
 * Verify an MCP server before executing against it. Free, read-tier.
 * opts.fresh  — force a live re-probe instead of the cached (<6h) grade.
 * opts.record — append a verification event to verifyhist:<host> (default true).
 */
export async function verifyMcpServer(
  env: Env,
  url: string,
  opts: { fresh?: boolean; record?: boolean } = {}
): Promise<VerifyVerdict> {
  const r = await gradeForVerify(env, url, !!opts.fresh);
  const drifted = (r.drift_count ?? 0) > 0;
  const { verdict, reason } = decide(r);

  // Proprietary verification-event ledger (purely additive; read by nothing
  // existing). A KV hiccup must never break the verdict.
  if (opts.record !== false) {
    try {
      const k = `verifyhist:${r.host}`;
      let hist: any[] = [];
      try { const raw = await env.CACHE.get(k); hist = raw ? JSON.parse(raw) : []; } catch {}
      hist.push({ ts: Date.now(), host: r.host, grade: r.grade, score: r.score, drifted, drift_count: r.drift_count ?? 0, verdict, source: "verify" });
      if (hist.length > 50) hist = hist.slice(-50);
      await env.CACHE.put(k, JSON.stringify(hist), { expirationTtl: 120 * 86400 });
    } catch { /* never block on the ledger write */ }
  }

  return {
    host: r.host,
    url: r.url,
    letter: r.grade,
    score: r.score,
    reachable: r.reachable,
    auth_required: r.auth_required,
    drift: {
      drifted,
      count: r.drift_count ?? 0,
      last_drift: r.last_drift ?? null,
      added: r.last_drift?.added ?? [],
      removed: r.last_drift?.removed ?? [],
    },
    watched_since: r.tools_hash_since ?? null,
    verdict,
    reason,
    checked_at: r.checked_at,
    report_url: `https://wmcp.sh/mcp/grade/${encodeURIComponent(r.host)}`,
  };
}
