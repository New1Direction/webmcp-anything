// token_vault.ts — encrypted per-user provider tokens.
//
// Storage:
//   ptok:<user_id>:<provider_id> = ProviderToken (JSON, with encrypted access/refresh fields)
//   conn:<user_id>               = JSON array of provider ids the user has connected
//
// Encryption: AES-GCM-256, key = SHA-256(TOKEN_ENC_KEY env). Random 12-byte IV per blob.
//   On-disk format: base64(iv ‖ ciphertext+tag).
//
// This isn't crypto-perfect — a worker secret compromise leaks all tokens — but
// it's strictly better than plaintext in KV, and matches the standard SaaS
// posture for token vaults of this scale.

export interface ProviderToken {
  access_token_enc: string;
  refresh_token_enc?: string;
  token_type?: string;
  scope?: string;
  expires_at?: number; // ms epoch
  metadata?: {
    account_id?: string;
    account_name?: string;
    [k: string]: any;
  };
  created_at: number;
  updated_at: number;
}

type Env = {
  KEYS: KVNamespace;
  TOKEN_ENC_KEY?: string;
};

// ---------- AES-GCM helpers ----------

async function deriveKey(env: Env): Promise<CryptoKey> {
  const secret = env.TOKEN_ENC_KEY;
  if (!secret) {
    throw new Error("TOKEN_ENC_KEY not configured — cannot encrypt/decrypt provider tokens.");
  }
  const raw = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(secret)
  );
  return crypto.subtle.importKey(
    "raw",
    raw,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

function b64encode(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

function b64decode(s: string): Uint8Array {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function encryptString(env: Env, plaintext: string): Promise<string> {
  const key = await deriveKey(env);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      new TextEncoder().encode(plaintext)
    )
  );
  const combined = new Uint8Array(iv.length + ct.length);
  combined.set(iv, 0);
  combined.set(ct, iv.length);
  return b64encode(combined);
}

export async function decryptString(env: Env, b64: string): Promise<string> {
  const key = await deriveKey(env);
  const combined = b64decode(b64);
  const iv = combined.slice(0, 12);
  const ct = combined.slice(12);
  const pt = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ct
  );
  return new TextDecoder().decode(pt);
}

// ---------- High-level API ----------

export interface RawTokenInput {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  scope?: string;
  expires_in?: number; // seconds
  metadata?: ProviderToken["metadata"];
}

export async function saveProviderToken(
  env: Env,
  user_id: string,
  provider_id: string,
  input: RawTokenInput
): Promise<void> {
  const now = Date.now();
  const rec: ProviderToken = {
    access_token_enc: await encryptString(env, input.access_token),
    refresh_token_enc: input.refresh_token
      ? await encryptString(env, input.refresh_token)
      : undefined,
    token_type: input.token_type,
    scope: input.scope,
    expires_at: input.expires_in ? now + input.expires_in * 1000 : undefined,
    metadata: input.metadata,
    created_at: now,
    updated_at: now,
  };
  await env.KEYS.put(
    `ptok:${user_id}:${provider_id}`,
    JSON.stringify(rec)
  );
  // Add provider to user's connections list
  await addUserConnection(env, user_id, provider_id);
}

export async function loadProviderToken(
  env: Env,
  user_id: string,
  provider_id: string
): Promise<{ access_token: string; refresh_token?: string; record: ProviderToken } | null> {
  const raw = await env.KEYS.get(`ptok:${user_id}:${provider_id}`);
  if (!raw) return null;
  let rec: ProviderToken;
  try {
    rec = JSON.parse(raw);
  } catch {
    return null;
  }
  const access_token = await decryptString(env, rec.access_token_enc);
  const refresh_token = rec.refresh_token_enc
    ? await decryptString(env, rec.refresh_token_enc)
    : undefined;
  return { access_token, refresh_token, record: rec };
}

export async function deleteProviderToken(
  env: Env,
  user_id: string,
  provider_id: string
): Promise<void> {
  await env.KEYS.delete(`ptok:${user_id}:${provider_id}`);
  await removeUserConnection(env, user_id, provider_id);
}

// ---------- Per-user connection list ----------

export async function listUserConnections(
  env: Env,
  user_id: string
): Promise<string[]> {
  const raw = await env.KEYS.get(`conn:${user_id}`);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function addUserConnection(env: Env, user_id: string, provider_id: string) {
  const list = await listUserConnections(env, user_id);
  if (!list.includes(provider_id)) {
    list.push(provider_id);
    await env.KEYS.put(`conn:${user_id}`, JSON.stringify(list));
  }
}

async function removeUserConnection(env: Env, user_id: string, provider_id: string) {
  const list = await listUserConnections(env, user_id);
  const next = list.filter((p) => p !== provider_id);
  await env.KEYS.put(`conn:${user_id}`, JSON.stringify(next));
}
