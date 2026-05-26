// token_resolver.ts — turn (user_id, target URL) into an Authorization header.
//
// The openapi/llm adapters call into this so agent tool calls auto-authenticate
// against connected providers. If the user has connected the matching provider,
// we transparently inject their token; otherwise we return null and the action
// either uses an explicit args._auth or fails.

import { PROVIDERS } from "./providers";
import { loadProviderToken } from "./token_vault";

type Env = {
  KEYS: KVNamespace;
  TOKEN_ENC_KEY?: string;
};

/**
 * Find the provider whose apiHosts cover this URL's hostname (exact match,
 * or suffix match for "myshopify.com" wildcards).
 */
export function providerForUrl(url: string): string | null {
  let hostname: string;
  try {
    hostname = new URL(url).hostname;
  } catch {
    return null;
  }
  for (const p of Object.values(PROVIDERS)) {
    if (!p.apiHosts) continue;
    for (const h of p.apiHosts) {
      if (hostname === h || hostname.endsWith("." + h) || hostname.endsWith(h)) {
        return p.id;
      }
    }
  }
  return null;
}

/**
 * Look up the user's stored token for the provider matching `url`. Returns
 * the raw access_token (no scheme prefix) or null if not connected.
 */
export async function resolveTokenForUrl(
  env: Env,
  user_id: string | undefined,
  url: string
): Promise<{ provider_id: string; access_token: string } | null> {
  if (!user_id || user_id.startsWith("anon:")) return null;
  const provider_id = providerForUrl(url);
  if (!provider_id) return null;
  try {
    const tok = await loadProviderToken(env, user_id, provider_id);
    if (!tok) return null;
    return { provider_id, access_token: tok.access_token };
  } catch {
    return null;
  }
}
