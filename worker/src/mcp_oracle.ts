// mcp_oracle.ts — the agent-callable MCP TRUST ORACLE.
//
// A spec-compliant MCP server (JSON-RPC 2.0 / Streamable HTTP) that exposes
// wmcp.sh's trust grade as TOOLS an agent calls BEFORE connecting to a third-
// party MCP server. This puts wmcp.sh inside the agent's decision loop — the
// deepest lock-in: agents gate tool adoption on our grade + rug-pull signal.
//
//   tools:
//     grade_mcp_server({ url, fresh? })  → letter grade, sub-scores, verdict
//     check_mcp_drift({ url })           → rug-pull / schema-drift status
//
// Connect at  https://wmcp.sh/mcp/trust  (no upstream OAuth; it's our own data).
import type { Context } from "hono";
import { scoreMcpServer, recordGrade, readGrade, type GradeResult } from "./mcp_grade";

type Env = { CACHE: KVNamespace };

const SUPPORTED = ["2024-11-05", "2025-03-26", "2025-06-18"];
const DEFAULT_VERSION = "2025-06-18";
const FRESH_MS = 6 * 3600 * 1000; // re-probe if the cached grade is older than this

const TOOLS = [
  {
    name: "grade_mcp_server",
    description:
      "Independently grade an MCP server (A–F) BEFORE connecting an agent to it. Returns spec-conformance, security (OWASP MCP Top 10), reliability, tool-hygiene and transparency sub-scores plus a connect/caution/avoid recommendation. Audited by wmcp.sh; the grade is free and never for sale.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "The MCP server endpoint URL to grade (e.g. https://mcp.example.com/mcp)." },
        fresh: { type: "boolean", description: "Force a live re-probe instead of returning a recent cached grade." },
      },
      required: ["url"],
    },
  },
  {
    name: "check_mcp_drift",
    description:
      "Check whether an MCP server's tool definitions have changed since it was last trusted (rug-pull / schema-drift detection, the CVE-2025-54136 class). Returns how long the tool surface has been stable, how many times it has changed, and the last change. Use after approval to detect post-trust mutation.",
    inputSchema: {
      type: "object",
      properties: { url: { type: "string", description: "The MCP server endpoint URL to check." } },
      required: ["url"],
    },
  },
];

function recommendation(r: GradeResult): { recommendation: string; reason: string } {
  if (r.hard_fail === "plaintext_http") return { recommendation: "avoid", reason: "Endpoint is not HTTPS." };
  if (r.hard_fail === "tool_poisoning") return { recommendation: "avoid", reason: "Tool descriptions contain prompt-injection / poisoning markup." };
  if (!r.reachable) return { recommendation: "avoid", reason: "Server did not respond." };
  if (r.grade === "F" || r.grade === "D") return { recommendation: "avoid", reason: `Low trust grade (${r.grade}).` };
  const driftedRecently = r.last_drift && Date.now() - r.last_drift.ts < 24 * 3600 * 1000;
  if (driftedRecently) return { recommendation: "caution", reason: "Tool definitions changed in the last 24h — re-review before use." };
  if (r.grade.startsWith("C")) return { recommendation: "caution", reason: `Moderate trust grade (${r.grade}).` };
  return { recommendation: "ok", reason: `Trust grade ${r.grade}.` };
}

function gradeSummary(r: GradeResult) {
  const days = r.tools_hash_since ? Math.floor((Date.now() - r.tools_hash_since) / 86400000) : 0;
  return {
    host: r.host,
    url: r.url,
    grade: r.grade,
    score: r.score,
    ...recommendation(r),
    auth_required: r.auth_required,
    sub_scores: Object.fromEntries(Object.entries(r.sub).map(([k, v]) => [k, v.score])),
    findings: r.findings.filter((f) => f.severity !== "info").length,
    attestation: r.drift_count
      ? `tool definitions changed ${r.drift_count}× since first audit`
      : r.tool_sigs
      ? `tool definitions unchanged ${days} day(s)`
      : "tool surface not enumerable (auth-protected)",
    checked_at: new Date(r.checked_at).toISOString(),
    report_url: `https://wmcp.sh/mcp/grade/${encodeURIComponent(r.host)}`,
  };
}

async function gradeFor(env: Env, url: string, fresh: boolean): Promise<GradeResult> {
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

const jrpc = (id: any, result: any) => ({ jsonrpc: "2.0", id, result });
const jerr = (id: any, code: number, message: string) => ({ jsonrpc: "2.0", id, error: { code, message } });
const textResult = (id: any, obj: any) => jrpc(id, { content: [{ type: "text", text: JSON.stringify(obj, null, 2) }], isError: false });

export async function oracleHandler(c: Context<{ Bindings: Env }>) {
  if (c.req.method.toUpperCase() === "GET") {
    return c.json({ jsonrpc: "2.0", error: { code: -32000, message: "Use POST (Streamable HTTP). This is the wmcp.sh MCP trust oracle." } }, 405);
  }
  let msg: any;
  try { msg = await c.req.json(); } catch { return c.json(jerr(null, -32700, "Parse error"), 200); }
  const { id, method, params } = msg || {};
  if (id === undefined || id === null) return c.body(null, 202); // notification

  if (method === "initialize") {
    const want = params?.protocolVersion;
    const protocolVersion = SUPPORTED.includes(want) ? want : DEFAULT_VERSION;
    return c.json(jrpc(id, { protocolVersion, capabilities: { tools: {} }, serverInfo: { name: "wmcp.sh MCP trust oracle", version: "1.0.0" } }));
  }
  if (method === "tools/list") return c.json(jrpc(id, { tools: TOOLS }));
  if (method === "tools/call") {
    const name = params?.name;
    const args = params?.arguments || {};
    const url = typeof args.url === "string" ? args.url.trim() : "";
    if (!url) return c.json(jerr(id, -32602, "Missing required argument: url"));
    try {
      if (name === "grade_mcp_server") {
        const r = await gradeFor(c.env, url, !!args.fresh);
        return c.json(textResult(id, gradeSummary(r)));
      }
      if (name === "check_mcp_drift") {
        let host = url; try { host = new URL(url).host.toLowerCase(); } catch {}
        const r = (await readGrade(c.env, host)) || (await gradeFor(c.env, url, false));
        const days = r.tools_hash_since ? Math.floor((Date.now() - r.tools_hash_since) / 86400000) : 0;
        return c.json(textResult(id, {
          host: r.host, grade: r.grade,
          tool_surface_stable_days: days,
          drift_count: r.drift_count || 0,
          last_drift: r.last_drift || null,
          rug_pull_recent: !!(r.last_drift && Date.now() - r.last_drift.ts < 24 * 3600 * 1000),
          report_url: `https://wmcp.sh/mcp/grade/${encodeURIComponent(r.host)}`,
        }));
      }
      return c.json(jerr(id, -32601, `Unknown tool: ${name}`));
    } catch (e) {
      return c.json(jrpc(id, { content: [{ type: "text", text: `grading error: ${String(e).slice(0, 200)}` }], isError: true }));
    }
  }
  return c.json(jerr(id, -32601, `Method not found: ${method}`));
}
