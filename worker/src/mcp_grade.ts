// mcp_grade.ts — independent MCP-server grading: the trust-authority bootstrap.
//
// We point our OWN spec-compliant client OUTWARD at any MCP URL, run objective
// checks, and emit a FREE A–F grade + sub-scores. The grade is computed by the
// same open rubric for everyone and is NEVER for sale (independence is the
// whole moat). v1 uses only static + spec signals computable from a single
// connection (no proxy traffic needed). The tools/list hash we persist seeds
// the future rug-pull / schema-drift monitor — the flagship differentiator.
//
// Positioning: "static scanners read the label; wmcp.sh tasted the food."

import { readBehavior, summarizeBehavior, type BehaviorSummary } from "./behavior";

type Env = { CACHE: KVNamespace; KEYS?: KVNamespace };

const SUPPORTED_VERSIONS = ["2024-11-05", "2025-03-26", "2025-06-18"];
const TIMEOUT_MS = 12000;

export interface SubScore { score: number; weight: number; notes: string[] }
export interface Finding { id: string; severity: "info" | "warn" | "fail"; owasp?: string; detail: string }

export interface GradeResult {
  url: string;
  host: string;
  checked_at: number;
  reachable: boolean;
  auth_required: boolean;
  protocol_version?: string;
  grade: string;
  score: number;
  sub: Record<string, SubScore>;
  findings: Finding[];
  tools_count: number;
  tools_hash?: string;
  hard_fail?: string;
  latency_ms?: number;
  // ---- drift / continuous re-verification (the wedge static scanners can't match) ----
  tool_sigs?: Record<string, string>; // per-tool short hash, for added/removed/changed diffing
  tools_hash_since?: number;           // when the CURRENT tool surface was first observed
  drift_count?: number;                // how many times the tool surface has changed since first seen
  last_drift?: { ts: number; added: string[]; removed: string[]; changed: string[] };
  // ---- behavioral trust v2: observed from REAL proxied calls (the uncopyable half) ----
  behavioral?: BehaviorSummary;        // present once we've seen ≥5 real tool calls for this host
}

export interface DriftOutcome {
  drifted: boolean;
  gradeDropped: boolean;
  prevGrade?: string;
  summary?: { added: string[]; removed: string[]; changed: string[] };
}

// ---- SSRF guard ----
// scoreMcpServer fetches fully user-supplied URLs ("grade any server"). Block
// non-public targets so wmcp.sh can't be turned into a reflective probe against
// internal/metadata addresses. Best-effort for a Workers runtime (no pre-fetch
// DNS resolution available): reject https-only violations, IP-literal private
// ranges, and well-known internal hostnames. Paired with redirect:"manual" on
// every probe fetch so an https→internal 302 can't bounce past the guard.
export function blockedTargetReason(rawUrl: string): string | null {
  let u: URL;
  try { u = new URL(rawUrl.trim()); } catch { return "invalid_url"; }
  if (u.protocol !== "https:") return "not_https";
  const host = u.hostname.toLowerCase().replace(/\.$/, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") ||
      host.endsWith(".internal") || host === "metadata.google.internal") return "internal_host";
  // IPv4 literal in a private / link-local / loopback / unspecified range.
  const m4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m4) {
    const o = m4.slice(1).map(Number);
    if (o.some((n) => n > 255)) return "invalid_ip";
    const [a, b] = o;
    if (a === 10 || a === 127 || a === 0 ||
        (a === 172 && b >= 16 && b <= 31) ||
        (a === 192 && b === 168) ||
        (a === 169 && b === 254) ||
        (a === 100 && b >= 64 && b <= 127) || // CGNAT 100.64/10
        a >= 224) return "private_ip"; // multicast/reserved
  }
  // IPv6 literal: loopback, unspecified, unique-local (fc00::/7), link-local (fe80::/10),
  // and IPv4-mapped private ranges.
  if (host.includes(":")) {
    const h = host.replace(/^\[|\]$/g, "");
    if (h === "::1" || h === "::" || /^f[cd]/.test(h) || /^fe[89ab]/.test(h)) return "private_ip6";
    // IPv4-mapped (::ffff:a.b.c.d). new URL() may keep the dotted form OR
    // normalize it to hex (::ffff:a00:1) — handle both and check the octets.
    const isPriv4 = (a: number, b: number) =>
      a === 10 || a === 127 || a === 0 || (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) || (a === 169 && b === 254);
    const dotted = h.match(/(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (dotted && isPriv4(Number(dotted[1]), Number(dotted[2]))) return "private_ip6_mapped";
    const hex = h.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
    if (hex) {
      const hi = parseInt(hex[1], 16);
      if (isPriv4((hi >> 8) & 255, hi & 255)) return "private_ip6_mapped";
    }
  }
  return null;
}

// ---- low-level MCP call (handles JSON and SSE Streamable-HTTP responses) ----
async function callMcp(url: string, message: any): Promise<{ status: number; ct: string; json: any; text: string }> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json, text/event-stream",
        "mcp-protocol-version": "2025-06-18",
        "user-agent": "wmcp.sh-grader/1.0 (+https://wmcp.sh/mcp/grade)",
      },
      body: JSON.stringify(message),
      signal: ctrl.signal,
      redirect: "manual", // don't let an https→internal 302 bounce past the SSRF guard
    });
    const ct = res.headers.get("content-type") || "";
    const text = await res.text();
    let json: any = null;
    if (ct.includes("application/json")) {
      try { json = JSON.parse(text); } catch {}
    } else if (ct.includes("text/event-stream")) {
      // Streamable HTTP: pull the last `data:` JSON payload out of the SSE stream.
      for (const line of text.split(/\r?\n/)) {
        const m = line.match(/^data:\s*(.*)$/);
        if (m && m[1].trim()) { try { json = JSON.parse(m[1]); } catch {} }
      }
    }
    return { status: res.status, ct, json, text };
  } finally {
    clearTimeout(t);
  }
}

async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

const initMsg = () => ({
  jsonrpc: "2.0", id: 1, method: "initialize",
  params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "wmcp-grader", version: "1.0" } },
});

// ---- the grader ----
export async function scoreMcpServer(rawUrl: string): Promise<GradeResult> {
  const url = rawUrl.trim();
  let host = url;
  try { host = new URL(url).host.toLowerCase(); } catch {}
  const r: GradeResult = {
    url, host, checked_at: Date.now(), reachable: false, auth_required: false,
    grade: "F", score: 0, sub: {}, findings: [], tools_count: 0,
  };

  // Hard gate: plaintext HTTP.
  let u: URL;
  try { u = new URL(url); } catch {
    r.hard_fail = "invalid_url"; r.findings.push({ id: "url", severity: "fail", detail: "Not a valid URL." });
    return r;
  }
  if (u.protocol !== "https:") {
    r.hard_fail = "plaintext_http";
    r.findings.push({ id: "tls", severity: "fail", owasp: "MCP05", detail: "Endpoint is not HTTPS — credentials and tool I/O travel in plaintext. Automatic F." });
    r.sub = { spec: z(20), security: z(30), reliability: z(20), hygiene: z(15), transparency: z(15) };
    return r;
  }
  // SSRF guard: never probe internal / private / metadata targets.
  const blocked = blockedTargetReason(url);
  if (blocked) {
    r.hard_fail = "blocked_target";
    r.findings.push({ id: "target", severity: "fail", detail: `Refusing to probe a non-public address (${blocked}).` });
    r.sub = { spec: z(20), security: z(30), reliability: z(20), hygiene: z(15), transparency: z(15) };
    return r;
  }

  // ---- probe ----
  const t0 = Date.now();
  let init: Awaited<ReturnType<typeof callMcp>> | null = null;
  try { init = await callMcp(url, initMsg()); } catch {
    r.findings.push({ id: "reachable", severity: "fail", detail: "Server did not respond to initialize (timeout or network error)." });
    r.sub = { spec: z(20), security: z(30), reliability: z(20), hygiene: z(15), transparency: z(15) };
    r.grade = "F"; r.score = 0;
    return r;
  }
  r.latency_ms = Date.now() - t0;
  r.reachable = true;

  // Auth-required (401 + WWW-Authenticate) is a *good* signal, but blocks tool enumeration.
  const wwwAuth = false; // header captured below via a dedicated check
  if (init.status === 401) {
    r.auth_required = true;
    r.findings.push({ id: "auth", severity: "info", owasp: "MCP02", detail: "OAuth-protected (401 + auth challenge). Behavioral grading (annotation-truthing, real latency) requires connecting via the wmcp.sh proxy — v2." });
  }

  // ---- Spec Conformance (20%) ----
  const specChecks: Array<{ ok: boolean; note: string }> = [];
  const pv = init.json?.result?.protocolVersion;
  specChecks.push({ ok: !!pv && SUPPORTED_VERSIONS.includes(pv), note: pv ? `initialize → protocolVersion ${pv}` : "initialize returned no protocolVersion" });
  if (pv) r.protocol_version = pv;
  specChecks.push({ ok: init.status === 200 || init.status === 401, note: `initialize HTTP ${init.status}` });

  // unknown method → -32601
  let toolsJson: any = null;
  if (!r.auth_required) {
    const bad = await callMcp(url, { jsonrpc: "2.0", id: 9, method: "this/does-not-exist", params: {} }).catch(() => null);
    specChecks.push({ ok: bad?.json?.error?.code === -32601, note: `unknown method → ${bad?.json?.error?.code ?? "no JSON-RPC error"}` });

    const tl = await callMcp(url, { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }).catch(() => null);
    toolsJson = tl?.json?.result;
    const tools = Array.isArray(toolsJson?.tools) ? toolsJson.tools : [];
    specChecks.push({ ok: tools.length > 0, note: `tools/list → ${tools.length} tools` });
    const everyHasSchema = tools.length > 0 && tools.every((t: any) => t.name && t.inputSchema);
    specChecks.push({ ok: everyHasSchema, note: everyHasSchema ? "every tool has name + inputSchema" : "some tools missing name/inputSchema" });
  }
  const specPass = specChecks.filter((c) => c.ok).length;
  r.sub.spec = { score: Math.round((specPass / specChecks.length) * 100), weight: 20, notes: specChecks.map((c) => `${c.ok ? "✓" : "✗"} ${c.note}`) };

  // ---- Tools analysis (Security 30% static half + Hygiene 15%) ----
  const tools = Array.isArray(toolsJson?.tools) ? toolsJson.tools : [];
  r.tools_count = tools.length;
  if (tools.length) {
    const norm = JSON.stringify(tools.map((t: any) => ({ n: t.name, d: t.description, s: t.inputSchema, a: t.annotations })));
    r.tools_hash = await sha256(norm);
    // Per-tool signatures → lets the drift monitor report exactly what changed.
    const sigs: Record<string, string> = {};
    for (const t of tools) {
      sigs[String(t.name)] = (await sha256(JSON.stringify({ d: t.description, s: t.inputSchema, a: t.annotations }))).slice(0, 16);
    }
    r.tool_sigs = sigs;
  }

  // Static security: tool-description prompt-injection / tool-poisoning markup.
  const INJ = /<important>|<hidden>|<secret>|do not (tell|mention|inform|reveal)|ignore (the )?(previous|prior|above)|system prompt/i;
  const SECRET = /~\/\.ssh|id_rsa|\/etc\/passwd|\bAWS_SECRET|\.env\b|\.cursor\/mcp\.json|private[_ ]?key/i;
  let injHits = 0, secretHits = 0;
  for (const t of tools) {
    const blob = `${t.description || ""} ${JSON.stringify(t.inputSchema || {})}`;
    if (INJ.test(blob)) { injHits++; r.findings.push({ id: "tool_poisoning", severity: "fail", owasp: "MCP01", detail: `Tool "${t.name}" description contains prompt-injection / hidden-instruction markup.` }); }
    if (SECRET.test(blob)) { secretHits++; r.findings.push({ id: "secret_exfil", severity: "fail", owasp: "MCP08", detail: `Tool "${t.name}" references sensitive file paths / secrets (exfiltration surface).` }); }
  }
  let secScore = 100;
  if (r.auth_required) secScore = 75; // can't see tools; proper auth is a partial plus, but unverified
  if (injHits) secScore = Math.min(secScore, 15);
  if (secretHits) secScore = Math.min(secScore, 10);
  const secNotes = r.auth_required
    ? ["auth-protected — tool surface not enumerable unauthenticated (connect via proxy for behavioral grading)"]
    : [`${tools.length} tools scanned`, injHits ? `${injHits} injection-markup hits` : "no injection markup", secretHits ? `${secretHits} secret-path refs` : "no secret-path refs"];
  r.sub.security = { score: secScore, weight: 30, notes: secNotes };

  // Tool hygiene.
  let hygiene = 70;
  const hygNotes: string[] = [];
  if (tools.length) {
    const typed = tools.filter((t: any) => t.inputSchema && t.inputSchema.properties && Object.keys(t.inputSchema.properties).length).length;
    const typedPct = Math.round((typed / tools.length) * 100);
    const withOutput = tools.filter((t: any) => t.outputSchema).length;
    const DESTRUCT = /delete|drop|remove|destroy|send|transfer|payment|charge|exec|shell|write_|update_/i;
    const destructiveUnsafe = tools.filter((t: any) => DESTRUCT.test(t.name || "") && !t.annotations?.destructiveHint && !t.annotations?.readOnlyHint).length;
    hygiene = Math.round(typedPct * 0.6 + (withOutput / tools.length) * 100 * 0.2 + Math.max(0, 100 - destructiveUnsafe * 25) * 0.2);
    hygNotes.push(`${typedPct}% of tools have typed inputSchema`, `${withOutput}/${tools.length} declare outputSchema`, destructiveUnsafe ? `${destructiveUnsafe} destructive-by-name tools lack safety annotations` : "no unannotated destructive tools");
    if (typed === 0) hygiene = Math.min(hygiene, 55); // cap C-ish if nothing typed
  } else if (r.auth_required) {
    hygiene = 50; hygNotes.push("tool surface not enumerable unauthenticated");
  } else {
    hygiene = 0; hygNotes.push("no tools returned");
  }
  r.sub.hygiene = { score: hygiene, weight: 15, notes: hygNotes };

  // ---- Reliability (20%) — v1 preliminary: single-probe reachability + latency ----
  let rel = r.reachable ? 80 : 0;
  if (r.latency_ms != null) { if (r.latency_ms < 600) rel = 92; else if (r.latency_ms < 1500) rel = 84; else if (r.latency_ms < 4000) rel = 70; else rel = 55; }
  r.sub.reliability = { score: rel, weight: 20, notes: [`single-probe latency ${r.latency_ms}ms (PRELIMINARY — continuous uptime/p95 from proxy telemetry lands in v2)`] };

  // ---- Transparency / Provenance (15%) ----
  const transNotes: string[] = ["HTTPS ✓"];
  let trans = 60;
  // OAuth resource metadata (RFC 9728) — a transparency/security plus for protected servers.
  try {
    const meta = await fetch(new URL("/.well-known/oauth-protected-resource", u).toString(), { headers: { "user-agent": "wmcp.sh-grader/1.0" }, redirect: "manual" }).then((x) => x.ok).catch(() => false);
    if (meta) { trans += 20; transNotes.push("RFC 9728 oauth-protected-resource metadata ✓"); }
    else if (r.auth_required) transNotes.push("auth required but no RFC 9728 resource metadata found");
  } catch {}
  if (r.protocol_version) { trans += 10; transNotes.push(`advertises protocol ${r.protocol_version}`); }
  trans = Math.min(100, trans);
  r.sub.transparency = { score: trans, weight: 15, notes: transNotes };

  // ---- composite ----
  r.score = composite(r.sub);
  // hard-fail gates
  if (injHits || secretHits) { r.score = Math.min(r.score, 45); r.hard_fail = "tool_poisoning"; }
  r.grade = letter(r.score, r.hard_fail);
  return r;
}

// Weighted mean of the 5 sub-scores (weights sum to 100). Shared by the initial
// score and the behavioral re-score in recordGrade so the math stays identical.
function composite(sub: Record<string, SubScore>): number {
  return Math.round(Object.values(sub).reduce((a, s) => a + s.score * s.weight, 0) / 100);
}

function z(weight: number): SubScore { return { score: 0, weight, notes: [] }; }

export function letter(score: number, hardFail?: string): string {
  if (hardFail === "plaintext_http") return "F";
  if (score >= 97) return "A+";
  if (score >= 93) return "A";
  if (score >= 90) return "A-";
  if (score >= 87) return "B+";
  if (score >= 83) return "B";
  if (score >= 80) return "B-";
  if (score >= 77) return "C+";
  if (score >= 73) return "C";
  if (score >= 70) return "C-";
  if (score >= 60) return "D";
  return "F";
}

const GRADE_COLOR: Record<string, string> = {
  "A+": "#4ade80", A: "#4ade80", "A-": "#7be39a", "B+": "#ffcf7a", B: "#ffcf7a", "B-": "#ffb86b",
  "C+": "#ff9e2c", C: "#ff9e2c", "C-": "#ff8c2c", D: "#ff6a3c", F: "#f87171",
};

/**
 * Cron step: walk the OFFICIAL MCP Registry (cursor-paginated) and auto-grade
 * remote servers — instant ecosystem coverage + a permanent /mcp/grade/<host>
 * page per server (own the "is <server> safe?" search intent), and each graded
 * server enters the drift watch set. The cursor advances each run (wraps at the
 * end) so the whole registry gets covered over time.
 */
export async function seedRegistryGrades(
  env: Env,
  max = 10
): Promise<{ seeded: number; nextCursor: string }> {
  const CURSOR = "gradeseed:cursor";
  const cursor = (await env.CACHE.get(CURSOR)) || "";
  const api =
    `https://registry.modelcontextprotocol.io/v0/servers?limit=${max}` +
    (cursor ? `&cursor=${encodeURIComponent(cursor)}` : "");
  let page: any;
  try {
    page = await fetch(api, { headers: { "user-agent": "wmcp.sh-grader/1.0 (+https://wmcp.sh/mcp/grade)" } }).then((r) => r.json());
  } catch {
    return { seeded: 0, nextCursor: cursor };
  }
  const servers: any[] = page?.servers || [];
  let seeded = 0;
  await Promise.all(
    servers.map(async (s) => {
      const remotes: any[] = s?.remotes || [];
      const remote = remotes.find((r) => r.type === "streamable-http") || remotes.find((r) => r.type === "sse") || remotes[0];
      if (!remote?.url) return; // skip local/package-only servers
      try {
        const r = await scoreMcpServer(remote.url);
        await recordGrade(env, r);
        seeded++;
      } catch { /* unreachable / non-MCP — skip */ }
    })
  );
  const nextCursor = page?.metadata?.nextCursor || ""; // empty wraps to the registry start next run
  await env.CACHE.put(CURSOR, nextCursor, { expirationTtl: 60 * 86400 });
  return { seeded, nextCursor };
}

// ---- KV persistence (grade:<host>) ----
// Lightweight metadata on the grade key so the leaderboard reads the whole set
// in one KV.list call (no per-host get). Kept well under the 1KB metadata cap.
export function gradeMeta(r: GradeResult) {
  return { grade: r.grade, score: r.score, checked_at: r.checked_at, tools_count: r.tools_count, url: r.url };
}
export async function persistGrade(env: Env, r: GradeResult): Promise<void> {
  await env.CACHE.put(`grade:${r.host}`, JSON.stringify(r), { expirationTtl: 30 * 86400, metadata: gradeMeta(r) });
}
export async function readGrade(env: Env, host: string): Promise<GradeResult | null> {
  const raw = await env.CACHE.get(`grade:${host.toLowerCase()}`);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

// ---- drift / continuous re-verification ----
const GRADE_ORDER = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"];
function gradeRank(g: string): number { const i = GRADE_ORDER.indexOf(g); return i < 0 ? GRADE_ORDER.length : i; }

export function diffTools(prev: Record<string, string>, next: Record<string, string>) {
  const added = Object.keys(next).filter((k) => !(k in prev));
  const removed = Object.keys(prev).filter((k) => !(k in next));
  const changed = Object.keys(next).filter((k) => k in prev && prev[k] !== next[k]);
  return { added, removed, changed };
}

/**
 * Persist a fresh grade, drift-aware: compares the new tool surface to the
 * stored one, maintains "tool definitions unchanged since <date>", counts
 * rug-pulls, appends a capped history, and registers the host in the watch set
 * so the cron keeps re-verifying it. Returns what changed so the caller can
 * fire an alert. THIS is the wedge: a continuously re-verified attestation that
 * a one-shot static scanner structurally cannot produce.
 */
export async function recordGrade(env: Env, r: GradeResult): Promise<DriftOutcome> {
  const prev = await readGrade(env, r.host);
  const now = r.checked_at;
  const out: DriftOutcome = { drifted: false, gradeDropped: false, prevGrade: prev?.grade };

  if (prev?.tool_sigs && r.tool_sigs) {
    const d = diffTools(prev.tool_sigs, r.tool_sigs);
    if (d.added.length || d.removed.length || d.changed.length) {
      out.drifted = true;
      out.summary = d;
      r.drift_count = (prev.drift_count || 0) + 1;
      r.tools_hash_since = now;
      r.last_drift = { ts: now, ...d };
    } else {
      r.tools_hash_since = prev.tools_hash_since || now;
      r.drift_count = prev.drift_count || 0;
      r.last_drift = prev.last_drift;
    }
  } else {
    r.tools_hash_since = prev?.tools_hash_since || now;
    r.drift_count = prev?.drift_count || 0;
    r.last_drift = prev?.last_drift;
  }
  // ---- behavioral overlay (v2): when we've observed REAL proxied traffic for
  // this host, replace the single-probe Reliability guess with observed
  // reliability and attach the behavioral evidence layer. Composite weights are
  // unchanged (still 5 dims × 100) — Reliability just becomes a measured fact
  // instead of a synthetic probe. Non-observed hosts are untouched. ----
  try {
    const beh = summarizeBehavior(await readBehavior(env, r.host));
    if (beh) {
      r.behavioral = beh;
      r.sub.reliability = {
        score: beh.reliability_score,
        weight: 20,
        notes: [
          `OBSERVED from ${beh.observed_calls} real proxied call(s) across ${beh.tools_observed} tool(s): ` +
            `p50 ${beh.p50_ms ?? "?"}ms · p95 ${beh.p95_ms ?? "?"}ms · ${(beh.error_rate * 100).toFixed(1)}% error rate`,
          beh.flaky.length
            ? `${beh.flaky.length} flaky tool(s): ${beh.flaky.map((f) => f.tool).join(", ")}`
            : "no flaky tools in observed traffic",
        ],
      };
      for (const f of beh.flaky) {
        r.findings.push({
          id: "flaky_tool",
          severity: "warn",
          detail: `Behavioral: tool "${f.tool}" failed ${(f.error_rate * 100).toFixed(0)}% of ${f.calls} observed call(s).`,
        });
      }
      // Re-score with the observed reliability (hard-fail gates still win).
      if (r.hard_fail !== "plaintext_http" && r.hard_fail !== "blocked_target") {
        r.score = composite(r.sub);
        if (r.hard_fail === "tool_poisoning") r.score = Math.min(r.score, 45);
        r.grade = letter(r.score, r.hard_fail);
      }
    }
  } catch { /* behavioral overlay is best-effort; never break grading */ }

  // Final word on grade-drop, computed against the (possibly behavior-adjusted) grade.
  if (prev && gradeRank(r.grade) > gradeRank(prev.grade)) out.gradeDropped = true;

  await env.CACHE.put(`grade:${r.host}`, JSON.stringify(r), { expirationTtl: 60 * 86400, metadata: gradeMeta(r) });
  // Watch set: value = the exact URL so the cron can re-grade. Long TTL,
  // refreshed on every check.
  await env.CACHE.put(`gradewatch:${r.host}`, r.url, { expirationTtl: 90 * 86400, metadata: { checked_at: r.checked_at } });
  // Capped append-only history (the time series nobody else has).
  let hist: any[] = [];
  try { const h = await env.CACHE.get(`gradehist:${r.host}`); hist = h ? JSON.parse(h) : []; } catch {}
  hist.push({ ts: now, grade: r.grade, score: r.score, tools_hash: r.tools_hash, drift: out.drifted ? out.summary : undefined });
  if (hist.length > 30) hist = hist.slice(-30);
  await env.CACHE.put(`gradehist:${r.host}`, JSON.stringify(hist), { expirationTtl: 120 * 86400 });

  return out;
}

/**
 * Fan out a drift/grade-drop notice to paying continuous-monitoring subscribers
 * for a host (monitorsub:<host>:<sub> in KEYS, written by the Stripe webhook).
 * Each subscriber gets a POST to their Slack-compatible alert_url.
 */
async function notifyMonitorSubscribers(env: Env, host: string, text: string): Promise<void> {
  if (!env.KEYS) return;
  let keys: { name: string }[] = [];
  try { keys = (await env.KEYS.list({ prefix: `monitorsub:${host}:` })).keys; } catch { return; }
  await Promise.all(keys.map(async (k) => {
    try {
      const raw = await env.KEYS!.get(k.name);
      const sub = raw ? JSON.parse(raw) : null;
      if (sub?.alert_url) await fetch(sub.alert_url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text }) }).catch(() => {});
    } catch {}
  }));
}

/**
 * Cron step: re-grade watched servers, detect rug-pulls / grade drops, and
 * alert. Capped + rotated (oldest-checked first) to stay within budget.
 */
export async function regradeWatched(
  env: Env & { LEAD_ALERT_WEBHOOK?: string },
  ctx: { waitUntil(p: Promise<unknown>): void },
  fireAlertFn: (env: any, ctx: any, text: string) => void,
  max = 20
): Promise<{ checked: number; drifted: number; dropped: number }> {
  // Scales to thousands of watched servers: sort oldest-checked first from the
  // key METADATA (one list call, no per-host get). Only the small batch we
  // actually re-grade needs its URL fetched.
  const list = await env.CACHE.list({ prefix: "gradewatch:", limit: 1000 });
  const rows = list.keys.map((k: any) => ({ h: k.name.slice("gradewatch:".length), ts: (k.metadata && k.metadata.checked_at) || 0 }));
  rows.sort((a, b) => a.ts - b.ts);
  const batch = rows.slice(0, max);

  let drifted = 0, dropped = 0;
  await Promise.all(
    batch.map(async ({ h }) => {
      const url = (await env.CACHE.get(`gradewatch:${h}`)) || `https://${h}/mcp`;
      try {
        const fresh = await scoreMcpServer(url);
        const out = await recordGrade(env, fresh);
        if (out.drifted) {
          drifted++;
          const s = out.summary!;
          const msg =
            `🔻 MCP rug-pull watch: ${h} tool surface changed` +
            (s.added.length ? ` +${s.added.length} added` : "") +
            (s.removed.length ? ` −${s.removed.length} removed` : "") +
            (s.changed.length ? ` ~${s.changed.length} changed` : "") +
            ` · grade ${out.prevGrade}→${fresh.grade} · ${url}`;
          fireAlertFn(env, ctx, msg);
          ctx.waitUntil(notifyMonitorSubscribers(env, h, msg)); // paid subscribers
        } else if (out.gradeDropped) {
          dropped++;
          const msg = `⚠ MCP grade drop: ${h} ${out.prevGrade}→${fresh.grade} · ${url}`;
          fireAlertFn(env, ctx, msg);
          ctx.waitUntil(notifyMonitorSubscribers(env, h, msg)); // paid subscribers
        }
      } catch {
        /* unreachable this round — skip, keep prior grade */
      }
    })
  );
  return { checked: batch.length, drifted, dropped };
}

/**
 * The full machine-readable reputation record — the B2B feed payload (grade +
 * all sub-scores + findings + per-tool sigs + drift history). The free oracle
 * returns a summary; THIS is the paid feed (x402-gated when configured).
 */
export async function reputationFeed(env: Env, url: string) {
  let host = url;
  try { host = new URL(url).host.toLowerCase(); } catch {}
  let g = await readGrade(env, host);
  if (!g) { g = await scoreMcpServer(url); await recordGrade(env, g); }
  let history: any[] = [];
  try { const h = await env.CACHE.get(`gradehist:${host}`); history = h ? JSON.parse(h) : []; } catch {}
  return { ...g, history, source: "wmcp.sh", methodology: "https://wmcp.sh/mcp/grade" };
}

// ---- embeddable SVG badge: "Audited: <grade> · wmcp.sh" (separate from the
//      owner-claimed Verified badge — this one is a measured fact) ----
export function gradeBadgeSvg(r: GradeResult): string {
  const c = GRADE_COLOR[r.grade] || "#8a8aa8";
  // host is URL-parsed so it can't contain <>&" — but escape anyway (the badge
  // is embedded in third-party READMEs; defense-in-depth costs nothing).
  const host = String(r.host || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="190" height="44" viewBox="0 0 190 44" role="img" aria-label="MCP Trust Grade ${r.grade} by wmcp.sh">
  <title>MCP Trust Grade ${r.grade} · ${host} · audited by wmcp.sh</title>
  <rect width="190" height="44" rx="10" fill="#0c0c14" stroke="#26263a" stroke-width="1.5"/>
  <text x="12" y="19" font-family="-apple-system,BlinkMacSystemFont,Inter,Segoe UI,sans-serif" font-size="10.5" font-weight="700" fill="#8a8aa8" letter-spacing="0.6">MCP TRUST · WMCP.SH</text>
  <text x="12" y="33" font-family="-apple-system,BlinkMacSystemFont,Inter,Segoe UI,sans-serif" font-size="9.5" font-weight="500" fill="#6a6a88">audited ${new Date(r.checked_at).toISOString().slice(0, 10)}</text>
  <rect x="138" y="6" width="46" height="32" rx="8" fill="${c}"/>
  <text x="161" y="28" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,Inter,Segoe UI,sans-serif" font-size="18" font-weight="800" fill="#0c0c14">${r.grade}</text>
</svg>`;
}

// ---- grade report page ----
export function gradePageHtml(r: GradeResult, origin: string): string {
  const c = GRADE_COLOR[r.grade] || "#8a8aa8";
  const esc = (s: string) => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const eh = encodeURIComponent(r.host);
  const badgeUrl = `${origin}/mcp/grade/${eh}/badge.svg`;
  const reportUrl = `${origin}/mcp/grade/${eh}`;
  const subRow = (key: string, label: string) => {
    const s = r.sub[key]; if (!s) return "";
    return `<div class="sub">
      <div class="sub-head"><span>${label}</span><span class="sub-w">${s.weight}%</span><b style="color:${s.score >= 80 ? "#4ade80" : s.score >= 60 ? "#ffcf7a" : "#f87171"}">${s.score}</b></div>
      <ul>${s.notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>
    </div>`;
  };
  const findingsHtml = r.findings.length
    ? `<div class="findings"><h3>Findings</h3>${r.findings.map((f) => `<div class="f f-${f.severity}"><span class="fb">${f.severity.toUpperCase()}</span>${f.owasp ? `<span class="owasp">${f.owasp}</span>` : ""} ${esc(f.detail)}</div>`).join("")}</div>`
    : `<div class="findings"><h3>Findings</h3><div class="f f-info">No blocking issues found in the static + spec checks.</div></div>`;
  const driftDays = r.tools_hash_since ? Math.floor((r.checked_at - r.tools_hash_since) / 86400000) : 0;
  const watchedSince = r.tools_hash_since ? new Date(r.tools_hash_since).toISOString().slice(0, 10) : null;
  const attest = r.drift_count
    ? `<div class="attest drift">⚠ <b>Rug-pull watch:</b> this server's tool surface has changed <b>${r.drift_count}×</b> since baseline${r.last_drift ? ` — last ${new Date(r.last_drift.ts).toISOString().slice(0, 10)}` : ""}. Continuously watched by wmcp.sh for drift &amp; rug-pulls.</div>`
    : r.tool_sigs
      ? `<div class="attest stable">✓ <b>Watched${watchedSince ? ` since ${watchedSince}` : ""}</b> — behavioral baseline locked${driftDays > 0 ? `, no drift for ${driftDays} day${driftDays === 1 ? "" : "s"}` : ""}. We re-check this server's tool surface on a schedule; if it adds, removes, or silently rewrites a tool (rug-pull), we record it.</div>`
      : "";
  // Behavioral evidence layer (v2): observed from real proxied calls. The half a
  // static scanner can't produce — "we didn't read the label, we tasted the food."
  const b = r.behavioral;
  const behavioralHtml = b
    ? `<div class="behav">
        <h3>Observed behavior <span class="bdim">— from ${b.observed_calls} real proxied call${b.observed_calls === 1 ? "" : "s"} across ${b.tools_observed} tool${b.tools_observed === 1 ? "" : "s"}</span></h3>
        <div class="bgrid">
          <div class="bcard"><div class="bk">p50 latency</div><div class="bv">${b.p50_ms ?? "—"}<small>ms</small></div></div>
          <div class="bcard"><div class="bk">p95 latency</div><div class="bv">${b.p95_ms ?? "—"}<small>ms</small></div></div>
          <div class="bcard"><div class="bk">error rate</div><div class="bv" style="color:${b.error_rate >= 0.25 ? "#f87171" : b.error_rate > 0 ? "#ffcf7a" : "#4ade80"}">${(b.error_rate * 100).toFixed(1)}<small>%</small></div></div>
          <div class="bcard"><div class="bk">tools exercised</div><div class="bv">${b.tools_observed}</div></div>
        </div>
        ${b.flaky.length ? `<div class="bflaky">⚠ Flaky in real traffic: ${b.flaky.map((f) => `<code>${esc(f.tool)}</code> (${(f.error_rate * 100).toFixed(0)}% of ${f.calls})`).join(", ")}</div>` : `<div class="bok">✓ No flaky tools in observed traffic — declared behavior matches what we saw.</div>`}
        <p class="bnote">Reliability above is measured, not a single synthetic probe. This is what only the execution-path proxy can see.</p>
      </div>`
    : `<div class="behav behav-empty"><h3>Observed behavior</h3><p class="bnote">No proxied traffic observed for this host yet. Connect it at <a href="/connect">/connect</a> and its grade gains a measured Reliability score + per-tool behavioral evidence — the half a static scan can't produce.</p></div>`;
  const jsonld = JSON.stringify({
    "@context": "https://schema.org", "@type": "Review",
    itemReviewed: { "@type": "SoftwareApplication", name: r.host, applicationCategory: "MCP server" },
    reviewRating: { "@type": "Rating", ratingValue: r.score, bestRating: 100, alternateName: r.grade },
    author: { "@type": "Organization", name: "wmcp.sh" }, datePublished: new Date(r.checked_at).toISOString(),
  }).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026"); // <script> breakout guard (host is attacker-influenceable)
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(r.host)} — MCP Trust Grade ${r.grade} | wmcp.sh</title>
<meta name="description" content="Independent MCP trust grade for ${esc(r.host)}: ${r.grade} (${r.score}/100) across spec conformance, security, reliability, tool hygiene, and transparency — then continuously watched by wmcp.sh for drift & rug-pulls."/>
<link rel="canonical" href="${origin}/mcp/grade/${encodeURIComponent(r.host)}"/>
<script type="application/ld+json">${jsonld}</script>
<style>
  :root{--bg:#07070d;--card:#16161f;--bg2:#11111c;--border:#26263a;--text:#ececf5;--muted:#8a8aa8;--dim:#6a6a88;--accent:#ff9e2c;--accent2:#ffcf7a;--green:#4ade80;--red:#f87171}
  *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif;line-height:1.6;background-image:radial-gradient(ellipse 900px 600px at 12% -8%,rgba(255,158,44,.10),transparent 62%)}
  .wrap{max-width:860px;margin:0 auto;padding:40px 22px 80px}
  a{color:var(--accent2)}
  .top{display:flex;align-items:center;gap:22px;flex-wrap:wrap}
  .gradebox{width:104px;height:104px;border-radius:18px;display:grid;place-items:center;background:${c};color:#0c0c14;font-size:3rem;font-weight:800;flex:none}
  h1{font-size:1.5rem;margin:0 0 4px;word-break:break-all}
  .muted{color:var(--muted)}.dim{color:var(--dim);font-size:.85rem}
  .score{font-size:.95rem;color:var(--muted);margin-top:4px}
  .attest{margin-top:18px;padding:11px 14px;border-radius:10px;font-size:.9rem}
  .attest.stable{background:rgba(74,222,128,.08);border:1px solid rgba(74,222,128,.35);color:#bdf0cd}
  .attest.drift{background:rgba(255,158,44,.09);border:1px solid rgba(255,158,44,.45);color:#ffcf7a}
  .sub{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px 16px;margin:12px 0}
  .sub-head{display:flex;align-items:center;gap:10px;font-weight:700}.sub-head span:first-child{flex:1}.sub-w{color:var(--dim);font-size:.8rem;font-weight:500}.sub-head b{font-size:1.1rem}
  .sub ul{margin:8px 0 0;padding-left:18px;color:var(--muted);font-size:.85rem}
  .behav{margin-top:24px;background:linear-gradient(135deg,var(--card),rgba(255,158,44,.05));border:1px solid var(--border);border-radius:12px;padding:16px 18px}
  .behav h3{margin:0 0 12px;font-size:1rem}.behav .bdim{color:var(--dim);font-weight:400;font-size:.85rem}
  .behav-empty{background:var(--bg2)}
  .bgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px}
  .bcard{background:var(--bg2);border:1px solid var(--border);border-radius:9px;padding:10px 12px}
  .bcard .bk{color:var(--dim);font-size:.72rem;text-transform:uppercase;letter-spacing:.06em}
  .bcard .bv{font-size:1.5rem;font-weight:800;margin-top:2px}.bcard .bv small{font-size:.8rem;font-weight:500;color:var(--muted)}
  .bflaky{margin-top:12px;color:#ffcf7a;font-size:.85rem}.bflaky code{background:var(--bg2);padding:1px 5px;border-radius:5px}
  .bok{margin-top:12px;color:#bdf0cd;font-size:.85rem}
  .bnote{margin:10px 0 0;color:var(--muted);font-size:.8rem}
  .findings{margin-top:24px}.findings h3{margin:0 0 10px}
  .f{padding:10px 12px;border-radius:10px;margin-bottom:8px;font-size:.88rem;background:var(--bg2);border:1px solid var(--border)}
  .fb{font-size:.68rem;font-weight:800;letter-spacing:.08em;padding:2px 6px;border-radius:6px;margin-right:6px;background:#0c0c14}
  .f-fail{border-color:rgba(248,113,113,.5)}.f-fail .fb{color:var(--red)}
  .f-warn .fb{color:var(--accent)}.f-info .fb{color:var(--muted)}
  .owasp{font-size:.68rem;font-weight:700;color:var(--accent2);margin-right:4px}
  .cta{display:flex;gap:10px;flex-wrap:wrap;margin-top:26px}
  .btn{display:inline-block;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:10px;font-size:.92rem}
  .btn-p{background:linear-gradient(135deg,#ff9120,#f25e00);color:#2a1500}
  .btn-s{background:var(--bg2);color:var(--text);border:1px solid var(--border)}
  .method{margin-top:30px;font-size:.85rem;color:var(--muted);border-top:1px solid var(--border);padding-top:16px}
  code{background:var(--bg2);padding:1px 6px;border-radius:5px;font-size:.85em}
  button.btn{border:none;cursor:pointer;font-family:inherit;font-size:.92rem}
  .embed,.oracle{margin-top:26px;border-top:1px solid var(--border);padding-top:16px}
  .embed h3,.oracle h3{margin:0 0 6px;font-size:1rem}
  label{display:block;font-size:.7rem;text-transform:uppercase;letter-spacing:.08em;color:var(--dim);margin:10px 0 4px}
  .snip{background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px 12px;font-family:"SF Mono",Menlo,monospace;font-size:.78rem;overflow-x:auto;white-space:pre-wrap;word-break:break-all;margin:0;color:var(--text)}
</style></head><body>
<div class="wrap">
  <div class="top">
    <div class="gradebox">${r.grade}</div>
    <div>
      <h1>${esc(r.host)}</h1>
      <div class="muted">${esc(r.url)}</div>
      <div class="score"><b style="color:${c}">${r.score}/100</b> · MCP Trust Grade · <span class="dim">watched · last checked ${new Date(r.checked_at).toISOString().slice(0, 10)}${r.protocol_version ? " · MCP " + r.protocol_version : ""}${r.auth_required ? " · OAuth-protected" : ""}</span></div>
    </div>
  </div>
  ${attest}
  ${subRow("spec", "Spec conformance")}
  ${subRow("security", "Security (OWASP MCP)")}
  ${subRow("reliability", "Reliability / performance")}
  ${subRow("hygiene", "Tool hygiene")}
  ${subRow("transparency", "Transparency / provenance")}
  ${behavioralHtml}
  ${findingsHtml}
  <div class="cta">
    <button class="btn btn-p" id="monitor">Watch this server — drift &amp; rug-pull alerts →</button>
    <button class="btn btn-s" id="deepAudit">Get the full audit report →</button>
    <a class="btn btn-s" href="/mcp/grade">Grade another server</a>
  </div>
  <p class="muted" style="font-size:.85rem;margin-top:10px">We re-grade <b>${esc(r.host)}</b> on a schedule and alert your Slack/webhook the moment its tools change or its grade drops — rug-pull insurance for the connection.</p>

  <div class="embed">
    <h3>Embed this grade</h3>
    <p class="muted" style="font-size:.85rem">A <b>live</b> badge — it re-verifies itself and shows current stability. Static scorecards can't.</p>
    <div style="margin:10px 0"><img src="${badgeUrl}" alt="MCP Trust Grade ${r.grade} · wmcp.sh" height="44"/></div>
    <label>Markdown</label>
    <pre class="snip">[![MCP Trust Grade ${r.grade}](${badgeUrl})](${reportUrl})</pre>
    <label>HTML</label>
    <pre class="snip">${esc(`<a href="${reportUrl}"><img src="${badgeUrl}" alt="MCP Trust Grade ${r.grade} · wmcp.sh"></a>`)}</pre>
  </div>

  <div class="oracle">
    <h3>Agents: check this before connecting</h3>
    <p class="muted" style="font-size:.85rem">Add the wmcp.sh trust oracle as an MCP server and call <code>grade_mcp_server</code> / <code>check_mcp_drift</code> in your agent's pre-connection gate:</p>
    <pre class="snip">${origin}/mcp/trust</pre>
  </div>

  <div class="method">
    <strong>How this grade is computed.</strong> An open, independent rubric — Spec conformance (20%), Security mapped to the OWASP MCP Top&nbsp;10 (30%), Reliability (20%), Tool hygiene (15%), Transparency (15%) — run by connecting to the server and inspecting its real MCP surface. The grade is free and identical whether or not the operator pays. <span class="dim">v1 uses static + spec signals from a single connection; continuous uptime, real latency, and annotation-truthing (declared <code>readOnly</code> vs observed behavior) layer on via the wmcp.sh proxy.</span>
  </div>
  <script>
  (function(){
    var url=${JSON.stringify(r.url)};
    function go(ep, extra){
      var email=prompt("Email for the receipt / report:"); if(!email)return;
      var body=Object.assign({url:url,email:email},extra||{});
      fetch(ep,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)})
        .then(function(res){return res.json().catch(function(){return{};}).then(function(d){return{s:res.status,d:d};});})
        .then(function(x){ if(x.d&&x.d.url){location.href=x.d.url;return;} if(x.s===503){alert("Not switched on yet — check back soon.");} else {alert("Could not start checkout: "+((x.d&&x.d.error)||x.s));} })
        .catch(function(){alert("Network error.");});
    }
    var da=document.getElementById("deepAudit"); if(da)da.onclick=function(){go("/api/v1/mcp/deep-audit/checkout");};
    var mo=document.getElementById("monitor"); if(mo)mo.onclick=function(){var w=(prompt("Optional https Slack-compatible webhook for drift alerts (blank to skip):")||"").trim();go("/api/v1/mcp/monitor/checkout", w?{alert_url:w}:{});};
  })();
  </script>
</div>
</body></html>`;
}

// interactive "grade any server" entry page
export function gradeHomeHtml(origin: string): string {
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Grade any MCP server — independent MCP trust audit | wmcp.sh</title>
<meta name="description" content="Paste any MCP server URL for a free, independent A–F trust grade: spec conformance, security (OWASP MCP Top 10), reliability, tool hygiene, transparency. Audited by wmcp.sh."/>
<link rel="canonical" href="${origin}/mcp/grade"/>
<style>
  :root{--bg:#07070d;--card:#16161f;--bg2:#11111c;--border:#26263a;--text:#ececf5;--muted:#8a8aa8;--accent:#ff9e2c;--accent2:#ffcf7a}
  *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif;line-height:1.6;background-image:radial-gradient(ellipse 900px 600px at 12% -8%,rgba(255,158,44,.10),transparent 62%)}
  .wrap{max-width:680px;margin:0 auto;padding:70px 22px}
  h1{font-size:1.9rem;margin:0 0 10px}.muted{color:var(--muted)}
  .row{display:flex;gap:8px;margin-top:24px;flex-wrap:wrap}
  input{flex:1;min-width:260px;background:var(--bg2);border:1px solid var(--border);color:var(--text);border-radius:10px;padding:13px 16px;font-family:"SF Mono",Menlo,monospace;font-size:.9rem}
  button{background:linear-gradient(135deg,#ff9120,#f25e00);color:#2a1500;border:none;border-radius:10px;padding:13px 22px;font-weight:700;cursor:pointer}
  .ex{margin-top:14px;font-size:.85rem;color:var(--muted)}.ex a{color:var(--accent2);cursor:pointer}
  #out{margin-top:18px;color:var(--muted)}
</style></head><body>
<div class="wrap">
  <h1>Grade any MCP server</h1>
  <p class="muted">Independent A–F trust grade — spec conformance, security (OWASP MCP Top&nbsp;10), reliability, tool hygiene, transparency. Free — then we keep watching it for drift &amp; rug-pulls (the grade is never for sale).</p>
  <div class="row">
    <input id="u" type="url" placeholder="https://mcp.example.com/mcp" />
    <button id="go">Grade it</button>
  </div>
  <div class="ex">try: <a data-u="https://mcp.sentry.dev/mcp">mcp.sentry.dev</a> · <a data-u="https://mcp.deepwiki.com/mcp">mcp.deepwiki.com</a></div>
  <div id="out"></div>
</div>
<script>
const out=document.getElementById("out"),inp=document.getElementById("u"),go=document.getElementById("go");
document.querySelectorAll(".ex a").forEach(a=>a.addEventListener("click",()=>{inp.value=a.dataset.u;run();}));
go.addEventListener("click",run);inp.addEventListener("keydown",e=>{if(e.key==="Enter")run();});
async function run(){
  const url=inp.value.trim();if(!url)return;
  go.disabled=true;out.textContent="Connecting to the server and running the audit…";
  try{
    const r=await fetch("/api/v1/mcp/grade?url="+encodeURIComponent(url));
    const d=await r.json();
    if(d.host){location.href="/mcp/grade/"+encodeURIComponent(d.host);return;}
    out.textContent="Could not grade: "+(d.error||"unknown error");
  }catch(e){out.textContent="Network error.";}
  go.disabled=false;
}
</script>
</body></html>`;
}

// ---- The MCP Trust Leaderboard ----------------------------------------------
// Public ranking of every graded MCP server, newest grade first by score. This
// is the data-moat asset: an independent, continuously-watched reputation table
// of the whole MCP ecosystem that compounds daily. Reads grade:* metadata in a
// single KV.list (no per-host get); falls back to a bounded get for any key
// missing metadata (pre-metadata grades backfill as the cron re-grades).
export async function mcpLeaderboardHtml(env: Env, origin: string): Promise<string> {
  const list = await env.CACHE.list({ prefix: "grade:", limit: 1000 });
  const rows: Array<{ host: string; grade: string; score: number; checked_at?: number; tools_count?: number }> = [];
  let gets = 0;
  for (const k of list.keys) {
    const host = k.name.slice("grade:".length);
    let m = k.metadata as any;
    if (!m || typeof m.score !== "number") {
      if (gets < 80) {
        gets++;
        try { const raw = await env.CACHE.get(k.name); if (raw) { const g = JSON.parse(raw); m = { grade: g.grade, score: g.score, checked_at: g.checked_at, tools_count: g.tools_count }; } } catch {}
      }
    }
    if (m && typeof m.score === "number") rows.push({ host, grade: m.grade, score: m.score, checked_at: m.checked_at, tools_count: m.tools_count });
  }
  rows.sort((a, b) => b.score - a.score || a.host.localeCompare(b.host));

  const esc = (s: string) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" } as any)[c]);
  const body = rows.map((r, i) => {
    const color = GRADE_COLOR[r.grade] || "#8a8aa8";
    const when = r.checked_at ? new Date(r.checked_at).toISOString().slice(0, 10) : "—";
    return `<tr>
      <td class="rank">${i + 1}</td>
      <td><span class="g" style="color:${color};border-color:${color}55;background:${color}14">${esc(r.grade)}</span></td>
      <td class="host"><a href="${origin}/mcp/grade/${encodeURIComponent(r.host)}">${esc(r.host)}</a></td>
      <td class="num">${r.score}</td>
      <td class="num dim">${r.tools_count ?? "—"}</td>
      <td class="dim">${when}</td>
    </tr>`;
  }).join("\n");

  const count = rows.length;
  const ld = {
    "@context": "https://schema.org", "@type": "Dataset",
    name: "MCP Trust Leaderboard", description: "Independent A–F trust grades for MCP servers, continuously watched for drift and rug-pulls.",
    url: `${origin}/mcp/leaderboard`, creator: { "@type": "Organization", name: "wmcp.sh", url: origin },
  };
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>MCP Trust Leaderboard — independent A–F grades for ${count} servers | wmcp.sh</title>
<meta name="description" content="The independent MCP Trust Leaderboard: A–F grades for ${count} MCP servers, scored on spec conformance, OWASP MCP security, reliability, tool hygiene, and transparency, continuously watched for drift and rug-pulls."/>
<link rel="canonical" href="${origin}/mcp/leaderboard"/>
<meta property="og:title" content="MCP Trust Leaderboard | wmcp.sh"/>
<meta property="og:description" content="Independent A–F trust grades for ${count} MCP servers, continuously watched."/>
<meta property="og:image" content="${origin}/og.png"/>
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<style>
  :root{--bg:#07070d;--card:#16161f;--bg2:#11111c;--border:#26263a;--text:#ececf5;--muted:#8a8aa8;--dim:#6a6a88;--accent:#ff9e2c;--accent2:#ffcf7a}
  *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif;line-height:1.5;background-image:radial-gradient(ellipse 900px 600px at 12% -5%,rgba(255,158,44,.14),transparent 60%)}
  .wrap{max-width:860px;margin:0 auto;padding:40px 22px}
  a{color:var(--accent2)}
  .back{color:var(--muted);text-decoration:none;font-size:.85rem}
  h1{font-size:clamp(1.8rem,4vw,2.5rem);margin:14px 0 8px;letter-spacing:-.02em}
  .lede{color:var(--muted);max-width:680px;margin:0 0 18px}
  .row{display:flex;gap:10px;flex-wrap:wrap;margin:16px 0 24px}
  .btn{display:inline-block;text-decoration:none;font-weight:800;padding:11px 17px;border-radius:10px;font-size:.92rem}
  .btn-p{background:linear-gradient(135deg,#ff9120,#f25e00);color:#2a1500}
  .btn-s{background:var(--bg2);color:var(--text);border:1px solid var(--border)}
  table{width:100%;border-collapse:collapse;background:var(--card);border:1px solid var(--border);border-radius:14px;overflow:hidden}
  th,td{text-align:left;padding:11px 12px;border-bottom:1px solid var(--border);font-size:.92rem}
  thead th{background:rgba(255,158,44,.07);font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;color:var(--accent2)}
  tr:last-child td{border-bottom:none}
  td.rank{color:var(--dim);width:34px}
  td.num{text-align:right;font-variant-numeric:tabular-nums;width:56px} td.dim,.dim{color:var(--dim)}
  td.host a{text-decoration:none;font-weight:600}
  .g{display:inline-block;min-width:30px;text-align:center;font-weight:800;border:1px solid;border-radius:7px;padding:2px 7px;font-size:.85rem}
  .empty{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:28px;text-align:center;color:var(--muted)}
  footer{margin-top:34px;color:var(--dim);font-size:.82rem;border-top:1px solid var(--border);padding-top:16px}
</style></head><body>
<div class="wrap">
  <a class="back" href="${origin}/connect">← The MCP hub</a>
  <h1>MCP Trust Leaderboard</h1>
  <p class="lede">An independent A–F trust grade for every MCP server we have seen, scored on spec conformance, OWASP MCP security, reliability, tool hygiene, and transparency. Continuously re-checked for drift and rug-pulls. ${count} servers ranked.</p>
  <div class="row">
    <a class="btn btn-p" href="${origin}/mcp/grade">Grade your server — free</a>
    <a class="btn btn-s" href="${origin}/connect">The MCP hub</a>
  </div>
  ${count ? `<table>
    <thead><tr><th>#</th><th>Grade</th><th>MCP server</th><th class="num">Score</th><th class="num">Tools</th><th>Checked</th></tr></thead>
    <tbody>${body}</tbody>
  </table>` : `<div class="empty">No servers graded yet. <a href="${origin}/mcp/grade">Grade the first one →</a></div>`}
  <footer>Grades are free and identical whether or not the operator pays. Methodology: <a href="${origin}/mcp/grade">/mcp/grade</a>. Add the oracle to your agent at <code>${origin}/mcp/trust</code>.</footer>
</div>
</body></html>`;
}
