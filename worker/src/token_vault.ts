// token_vault.ts — encrypted per-user provider tokens.
//
// Storage:
//   ptok:<user_id>:<provider_id> = ProviderToken (JSON, with encrypted access/refresh fields)
//   conn:<user_id>               = JSON array of provider ids the user has connected
//
// Encryption: AES-GCM-256, random 12-byte IV per blob.
//   Legacy format:  base64(iv ‖ ct)          key = SHA-256(TOKEN_ENC_KEY)
//   v2 format:      "2:" + base64(iv ‖ ct)   key = SHA-256(TOKEN_ENC_KEY ‖ ":" ‖ user_id)
//
// Per-user key derivation (v2) shrinks the blast radius: leaking one user's
// derived key does not unlock others', and there is no single key whose
// rotation bricks every token. The change is BACKWARD-COMPATIBLE — blobs
// written before v2 (no prefix) still decrypt with the global key, and get
// rewritten as v2 on the next save/refresh. A worker-secret compromise is still
// bad (the secret derives every per-user key), but blob-level isolation is now
// in place for when key rotation / HSM-backed material lands.

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

const V2_PREFIX = "2:";

async function deriveKey(env: Env, userId?: string): Promise<CryptoKey> {
  const secret = env.TOKEN_ENC_KEY;
  if (!secret) {
    throw new Error("TOKEN_ENC_KEY not configured — cannot encrypt/decrypt provider tokens.");
  }
  // Per-user material when userId is provided (v2); global otherwise (legacy).
  const material = userId ? `${secret}:${userId}` : secret;
  const raw = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(material)
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

// userId present → v2 (per-user key, "2:" prefix); absent → legacy global key.
export async function encryptString(
  env: Env,
  plaintext: string,
  userId?: string
): Promise<string> {
  const key = await deriveKey(env, userId);
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
  const b64 = b64encode(combined);
  return userId ? V2_PREFIX + b64 : b64;
}

export async function decryptString(
  env: Env,
  blob: string,
  userId?: string
): Promise<string> {
  // v2 blobs ("2:") use the per-user key; legacy blobs use the global key.
  const isV2 = blob.startsWith(V2_PREFIX);
  const payload = isV2 ? blob.slice(V2_PREFIX.length) : blob;
  const key = await deriveKey(env, isV2 ? userId : undefined);
  const combined = b64decode(payload);
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
    access_token_enc: await encryptString(env, input.access_token, user_id),
    refresh_token_enc: input.refresh_token
      ? await encryptString(env, input.refresh_token, user_id)
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
  const access_token = await decryptString(env, rec.access_token_enc, user_id);
  const refresh_token = rec.refresh_token_enc
    ? await decryptString(env, rec.refresh_token_enc, user_id)
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
