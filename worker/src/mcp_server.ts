// mcp_server.ts — spec-compliant MCP server (JSON-RPC 2.0 over Streamable HTTP)
// that exposes wmcp.sh's extracted tools so ANY MCP client (Claude Desktop /
// Code, Cursor, Codex, Cline, VS Code, mcp-remote) can connect and call them.
//
// Endpoints (registered POST-only in index.ts, before /mcp/:provider):
//   POST /mcp/u/<base64url-of-url>   — one site (stable, addressable server)
//   POST /mcp/url?url=a&url=b        — compose several sites into one server
//
// Stateless: no Mcp-Session-Id, no SSE, always application/json. Identity is in
// the URL. All gating is emitted as JSON-RPC errors at HTTP 200 (NEVER 401/403/
// 402/429 — Claude treats 401/403 as an OAuth trigger and 404 as session loss).
// Tool extraction/execution reuse ./engine (one source of truth with the REST
// API). See the spec rationale baked into the inline notes below.

import type { Context } from "hono";
import { resolveAuth, consume, PLAN_LIMITS, type AuthCtx } from "./auth";
import { base64urlDecode } from "./u";
import { resolveTools, executeTool, type EngineEnv } from "./engine";
import { loadToolsetUrls } from "./toolsets";

type McpEnv = EngineEnv & { USAGE: KVNamespace; ENVIRONMENT: string };
type McpCtx = Context<{ Bindings: McpEnv; Variables: { auth: AuthCtx } }>;

const SUPPORTED = ["2024-11-05", "2025-03-26", "2025-06-18", "2025-11-25"];
const DEFAULT_VERSION = "2025-06-18";

const UPGRADE = "https://wmcp.sh/dashboard";

function rpcResult(id: any, result: any) {
  return { jsonrpc: "2.0", id, result };
}
function rpcError(id: any, code: number, message: string, data?: any) {
  return { jsonrpc: "2.0", id: id ?? null, error: { code, message, ...(data ? { data } : {}) } };
}

// MCP tool names: ^[A-Za-z0-9_.-]{1,128}$. Web-extracted labels often contain
// spaces/slashes/colons/emoji — sanitize + truncate, never emit empty.
function sanitizeName(s: string): string {
  const cleaned = (s || "").replace(/[^A-Za-z0-9_.-]/g, "_").slice(0, 128);
  return cleaned || "tool";
}
function hostToken(url: string): string {
  try {
    return sanitizeName(new URL(url).hostname.replace(/\./g, "_")).slice(0, 24);
  } catch {
    return "site";
  }
}

async function targetUrls(c: McpCtx): Promise<string[] | null> {
  const enc = c.req.param("encoded");
  if (enc) {
    try {
      return [base64urlDecode(enc)];
    } catch {
      return null;
    }
  }
  // Saved toolset: /mcp/set/:id — resolve its stored URL bundle.
  const setId = c.req.param("id");
  if (setId) {
    return await loadToolsetUrls(c.env, setId);
  }
  const q = c.req.queries("url");
  return q && q.length ? q : null;
}

type ToolEntry = { url: string; originalName: string };

// Resolve all target URLs and build (a) the MCP tool list and (b) a
// name→{url,originalName} routing map. Deterministic, so tools/call can
// re-derive the same mapping statelessly. Failed sources are skipped in
// discovery rather than hard-erroring.
async function buildToolIndex(
  c: McpCtx,
  urls: string[],
  authUserId?: string
): Promise<{ tools: any[]; index: Map<string, ToolEntry> }> {
  const multi = urls.length > 1;
  const tools: any[] = [];
  const index = new Map<string, ToolEntry>();
  const used = new Set<string>();

  for (const url of urls) {
    const r = await resolveTools(c.env, c.executionCtx, url, { authUserId });
    if (!r.ok) continue;
    const prefix = multi ? hostToken(url) + "__" : "";
    for (const t of r.payload.tools || []) {
      if (!t || typeof t.name !== "string") continue;
      const base = sanitizeName(prefix + t.name);
      let name = base;
      let n = 2;
      while (used.has(name)) name = sanitizeName(base.slice(0, 124) + "_" + n++);
      used.add(name);
      index.set(name, { url, originalName: t.name });
      const tool: any = { name, inputSchema: t.inputSchema ?? { type: "object", properties: {} } };
      if (t.description) tool.description = String(t.description);
      tools.push(tool);
    }
  }
  return { tools, index };
}

async function handleOne(c: McpCtx, msg: any): Promise<Response> {
  // Notification (method present, no id) — ack only, do no work.
  if (msg && typeof msg === "object" && typeof msg.method === "string" && msg.id === undefined) {
    return new Response(null, { status: 202 });
  }
  // Must be a valid JSON-RPC 2.0 request.
  if (!msg || typeof msg !== "object" || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") {
    return c.json(rpcError(msg?.id ?? null, -32600, "Invalid Request"));
  }
  const id = msg.id;
  const method = msg.method;

  const urls = await targetUrls(c);
  if (!urls) {
    return c.json(rpcError(id, -32602, "Invalid params: missing/undecodable target URL or unknown toolset"));
  }

  const auth = await resolveAuth(c as any);

  switch (method) {
    case "initialize": {
      const requested = msg.params?.protocolVersion;
      const negotiated = SUPPORTED.includes(requested) ? requested : DEFAULT_VERSION;
      return c.json(
        rpcResult(id, {
          protocolVersion: negotiated,
          capabilities: { tools: {} },
          serverInfo: { name: "wmcp.sh", version: "1.0.0" },
          instructions:
            "Tools are extracted live from the target website(s) by wmcp.sh. Call tools/list to discover the site's agent-callable actions, then tools/call to run them.",
        }),
        200,
        { "MCP-Protocol-Version": negotiated }
      );
    }

    case "ping":
      return c.json(rpcResult(id, {}));

    case "tools/list": {
      // Discovery is free/anonymous-friendly; still meters one read for accounting.
      const usage = await consume(c as any, auth, "reads");
      if (!usage.allowed) {
        return c.json(rpcError(id, -32000, "quota_exceeded", { plan: auth.plan, limit: usage.limit, upgrade: UPGRADE }));
      }
      const { tools } = await buildToolIndex(c, urls, auth.user_id);
      return c.json(rpcResult(id, { tools }));
    }

    case "tools/call": {
      const params = msg.params;
      const argsOk = params?.arguments === undefined ||
        (typeof params.arguments === "object" && params.arguments !== null && !Array.isArray(params.arguments));
      if (!params || typeof params.name !== "string" || !argsOk) {
        return c.json(rpcError(id, -32602, "Invalid params: 'name' (string) required; 'arguments' must be an object"));
      }
      // Paid gate — as JSON-RPC errors, never HTTP 402/429/401/403.
      if (!PLAN_LIMITS[auth.plan].can_execute_paid) {
        return c.json(rpcError(id, -32002, "payment_required: live tool calls require a paid plan", { plan: auth.plan, upgrade: UPGRADE }));
      }
      const usage = await consume(c as any, auth, "executes");
      if (!usage.allowed) {
        return c.json(rpcError(id, -32000, "quota_exceeded", { plan: auth.plan, limit: usage.limit, upgrade: UPGRADE }));
      }
      const { index } = await buildToolIndex(c, urls, auth.user_id);
      const target = index.get(params.name);
      if (!target) {
        return c.json(rpcError(id, -32602, `Unknown tool: ${params.name}`));
      }
      const r = await executeTool(
        c.env,
        { url: target.url, tool: target.originalName, args: params.arguments ?? {} },
        { userId: auth.user_id }
      );
      if (r.ok) {
        const text = typeof r.value === "string" ? r.value : JSON.stringify(r.value);
        const result: any = { content: [{ type: "text", text }], isError: false };
        if (r.value !== null && typeof r.value === "object") result.structuredContent = r.value;
        return c.json(rpcResult(id, result));
      }
      // Tool execution failure → isError:true (NOT a top-level JSON-RPC error),
      // so the model can self-correct. Surface the hint when present.
      const errText = [r.body?.error, r.body?.hint].filter(Boolean).join(" — ") || "tool execution failed";
      return c.json(rpcResult(id, { content: [{ type: "text", text: errText }], isError: true }));
    }

    default:
      return c.json(rpcError(id, -32601, `Method not found: ${method}`));
  }
}

export async function mcpHandler(c: McpCtx): Promise<Response> {
  const msg = await c.req.json().catch(() => null);
  if (msg === null) return c.json(rpcError(null, -32700, "Parse error"));
  if (Array.isArray(msg)) {
    // JSON-RPC batching was removed in MCP 2025-06-18. Accept a single-element
    // array for legacy 2024-11-05 clients; reject larger batches.
    if (msg.length === 1) return handleOne(c, msg[0]);
    return c.json(rpcError(null, -32600, "Batch requests are not supported"));
  }
  return handleOne(c, msg);
}

// GET on an MCP endpoint: 405 (we offer no server-initiated SSE stream). Must
// be 405 not 404 — mcp-remote falls back to legacy SSE on 404 and Claude treats
// 404 as session expiry.
export function mcpMethodNotAllowed(c: McpCtx): Response {
  return c.body(null, 405, { Allow: "POST" });
}
