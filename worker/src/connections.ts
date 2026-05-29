// connections.ts — managed OAuth-connection entitlements (the moat's per-
// connection billing).
//
// An entitlement key `conn:<user_id>:<provider>` means the user holds an active
// managed-connection subscription for that proxied provider. It is WRITTEN by
// the Stripe webhook (kind="managed_connection", see stripe.ts) and READ here +
// by the /mcp/:provider proxy gate (mcp_proxy.ts). Enforcement only activates
// once STRIPE_PRICE_CONNECTION is configured — until then the proxy keeps its
// execute-only gate so nobody is locked out before billing exists.
import type { Context } from "hono";
import { resolveAuth } from "./auth";
import { PROVIDERS } from "./providers";

export const MANAGED_CONNECTION_KIND = "managed_connection";

type Env = { KEYS: KVNamespace; USAGE: KVNamespace; ENVIRONMENT: string };

export function connKey(user_id: string, provider: string): string {
  return `conn:${user_id}:${provider}`;
}

function isActive(raw: string | null): boolean {
  if (!raw) return false;
  try {
    return JSON.parse(raw).status === "active";
  } catch {
    return raw === "active" || raw === "1";
  }
}

/** True if the user holds an active managed-connection subscription for the provider. */
export async function hasManagedConnection(
  env: { KEYS: KVNamespace },
  user_id: string,
  provider: string
): Promise<boolean> {
  return isActive(await env.KEYS.get(connKey(user_id, provider)));
}

// GET /api/v1/connections — list the caller's active managed connections.
export async function listManagedConnections(c: Context<{ Bindings: Env }>) {
  const auth = await resolveAuth(c as any);
  if (auth.anonymous) {
    return c.json({ error: "sign_in_required", hint: "Sign in to see your managed connections." }, 401);
  }
  const prefix = `conn:${auth.user_id}:`;
  const list = await c.env.KEYS.list({ prefix });
  const connections: Array<{ provider: string; name: string; since?: number }> = [];
  for (const k of list.keys) {
    const raw = await c.env.KEYS.get(k.name);
    if (!isActive(raw)) continue;
    const provider = k.name.slice(prefix.length);
    let since: number | undefined;
    try {
      since = JSON.parse(raw as string).since;
    } catch {}
    connections.push({ provider, name: PROVIDERS[provider]?.name || provider, since });
  }
  return c.json({ connections });
}
