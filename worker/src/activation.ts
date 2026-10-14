import type { Context } from "hono";
import { resolveTools, type EngineEnv } from "./engine";
import { blockedTargetReason } from "./mcp_grade";
import { base64urlEncode } from "./u";
import { track } from "./metrics";
import type { AuthCtx } from "./auth";

type Env = EngineEnv & { USAGE: KVNamespace; ENVIRONMENT: string };
export const PREVIEW_BUDGET_MS = 12000;

export function activationUrl(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 2048) return null;
  try {
    const u = new URL(value.trim());
    // Public discovery is cached/indexed. Never accept signed URLs or credentials.
    if (u.username || u.password || u.search || u.hash || blockedTargetReason(u.href)) return null;
    return u.href;
  } catch { return null; }
}

export async function previewActivation(c: Context<{ Bindings: Env; Variables: { auth: AuthCtx } }>) {
  c.header("Cache-Control", "no-store");
  const body = await c.req.json().catch(() => null);
  const url = activationUrl(body?.url);
  if (!url || body?.public !== true) {
    return c.json({ error: "public_url_required", hint: "Use a public HTTPS URL without credentials, query parameters or fragments. Confirm that it may be cached and listed publicly. Connect private credentials in Dashboard instead." }, 400);
  }
  const started = Date.now();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const pending = resolveTools(c.env, c.executionCtx, url);
  // Adapters own their fetches; this bounds response latency, not upstream work.
  c.executionCtx.waitUntil(pending.catch(() => {}));
  try {
    const result = await Promise.race([
      pending,
      new Promise<null>(resolve => { timer = setTimeout(() => resolve(null), PREVIEW_BUDGET_MS); }),
    ]);
    const elapsed = Date.now() - started;
    const outcome = !result ? "timeout" : !result.ok ? "unsupported" : !result.payload.tools?.length ? "empty" : "ready";
    if (c.req.header("dnt") !== "1" && c.req.header("sec-gpc") !== "1") {
      track(c.env, c.executionCtx, "activation_preview", { outcome, latency: elapsed < 2000 ? "under_2s" : elapsed < 6000 ? "under_6s" : "over_6s" });
    }
    if (!result) return c.json({ error: "preview_timeout", hint: "This site took longer than 12 seconds. Retry, or use a direct public OpenAPI JSON URL. No tool action was executed." }, 504);
    if (!result.ok || !result.payload.tools?.length) {
      return c.json({ error: "unsupported_site", hint: "No tools were found. Try a direct OpenAPI JSON spec or a product page with structured data. For login-only or blocked sites, use the browser extension or request a managed adapter." }, 422);
    }
    return c.json({
      url,
      endpoint: `${new URL(c.req.url).origin}/mcp/u/${base64urlEncode(url)}`,
      adapter: result.payload.adapter,
      count: result.payload.tools.length,
      tools: result.payload.tools.slice(0, 50).map((tool: { name?: string; description?: string }) => ({
        name: String(tool.name || "tool").slice(0, 128),
        description: String(tool.description || "No description supplied").slice(0, 500),
      })),
    });
  } catch {
    return c.json({ error: "preview_failed", hint: "The source could not be read. Retry with a direct public OpenAPI JSON URL, or use the extension for a blocked website." }, 502);
  } finally { if (timer !== undefined) clearTimeout(timer); }
}
