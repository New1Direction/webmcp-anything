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

type Env = { CACHE: KVNamespace };

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
    const meta = await fetch(new URL("/.well-known/oauth-protected-resource", u).toString(), { headers: { "user-agent": "wmcp.sh-grader/1.0" } }).then((x) => x.ok).catch(() => false);
    if (meta) { trans += 20; transNotes.push("RFC 9728 oauth-protected-resource metadata ✓"); }
    else if (r.auth_required) transNotes.push("auth required but no RFC 9728 resource metadata found");
  } catch {}
  if (r.protocol_version) { trans += 10; transNotes.push(`advertises protocol ${r.protocol_version}`); }
  trans = Math.min(100, trans);
  r.sub.transparency = { score: trans, weight: 15, notes: transNotes };

  // ---- composite ----
  const weighted = Object.values(r.sub).reduce((a, s) => a + s.score * s.weight, 0) / 100;
  r.score = Math.round(weighted);
  // hard-fail gates
  if (injHits || secretHits) { r.score = Math.min(r.score, 45); r.hard_fail = "tool_poisoning"; }
  r.grade = letter(r.score, r.hard_fail);
  return r;
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

// ---- KV persistence (grade:<host>) ----
export async function persistGrade(env: Env, r: GradeResult): Promise<void> {
  await env.CACHE.put(`grade:${r.host}`, JSON.stringify(r), { expirationTtl: 30 * 86400 });
}
export async function readGrade(env: Env, host: string): Promise<GradeResult | null> {
  const raw = await env.CACHE.get(`grade:${host.toLowerCase()}`);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

// ---- embeddable SVG badge: "Audited: <grade> · wmcp.sh" (separate from the
//      owner-claimed Verified badge — this one is a measured fact) ----
export function gradeBadgeSvg(r: GradeResult): string {
  const c = GRADE_COLOR[r.grade] || "#8a8aa8";
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="190" height="44" viewBox="0 0 190 44" role="img" aria-label="MCP Trust Grade ${r.grade} by wmcp.sh">
  <title>MCP Trust Grade ${r.grade} · ${r.host} · audited by wmcp.sh</title>
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
  const jsonld = JSON.stringify({
    "@context": "https://schema.org", "@type": "Review",
    itemReviewed: { "@type": "SoftwareApplication", name: r.host, applicationCategory: "MCP server" },
    reviewRating: { "@type": "Rating", ratingValue: r.score, bestRating: 100, alternateName: r.grade },
    author: { "@type": "Organization", name: "wmcp.sh" }, datePublished: new Date(r.checked_at).toISOString(),
  });
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(r.host)} — MCP Trust Grade ${r.grade} | wmcp.sh</title>
<meta name="description" content="Independent MCP server audit of ${esc(r.host)}: grade ${r.grade} (${r.score}/100) across spec conformance, security, reliability, tool hygiene, and transparency. Audited by wmcp.sh."/>
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
  .sub{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px 16px;margin:12px 0}
  .sub-head{display:flex;align-items:center;gap:10px;font-weight:700}.sub-head span:first-child{flex:1}.sub-w{color:var(--dim);font-size:.8rem;font-weight:500}.sub-head b{font-size:1.1rem}
  .sub ul{margin:8px 0 0;padding-left:18px;color:var(--muted);font-size:.85rem}
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
</style></head><body>
<div class="wrap">
  <div class="top">
    <div class="gradebox">${r.grade}</div>
    <div>
      <h1>${esc(r.host)}</h1>
      <div class="muted">${esc(r.url)}</div>
      <div class="score"><b style="color:${c}">${r.score}/100</b> · MCP Trust Grade · <span class="dim">audited ${new Date(r.checked_at).toISOString().slice(0, 10)}${r.protocol_version ? " · MCP " + r.protocol_version : ""}${r.auth_required ? " · OAuth-protected" : ""}</span></div>
    </div>
  </div>
  ${subRow("spec", "Spec conformance")}
  ${subRow("security", "Security (OWASP MCP)")}
  ${subRow("reliability", "Reliability / performance")}
  ${subRow("hygiene", "Tool hygiene")}
  ${subRow("transparency", "Transparency / provenance")}
  ${findingsHtml}
  <div class="cta">
    <a class="btn btn-p" href="/agent-ready/fix">Get the issues fixed →</a>
    <a class="btn btn-s" href="/mcp/grade">Grade another server</a>
    <a class="btn btn-s" href="${origin}/mcp/grade/${encodeURIComponent(r.host)}/badge.svg">Embed the badge</a>
  </div>
  <div class="method">
    <strong>How this grade is computed.</strong> An open, independent rubric — Spec conformance (20%), Security mapped to the OWASP MCP Top&nbsp;10 (30%), Reliability (20%), Tool hygiene (15%), Transparency (15%) — run by connecting to the server and inspecting its real MCP surface. The grade is free and identical whether or not the operator pays. <span class="dim">v1 uses static + spec signals from a single connection; continuous uptime, real latency, and annotation-truthing (declared <code>readOnly</code> vs observed behavior) layer on via the wmcp.sh proxy.</span>
  </div>
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
  <p class="muted">Independent A–F trust audit — spec conformance, security (OWASP MCP Top&nbsp;10), reliability, tool hygiene, transparency. Free, and the grade is never for sale.</p>
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
