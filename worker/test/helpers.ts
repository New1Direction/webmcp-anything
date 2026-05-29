// test/helpers.ts — lightweight mocks for testing the money-path handlers
// without the workerd pool. In-memory KV, a minimal Hono Context, and a real
// Stripe-format HMAC signer so webhook signature verification is exercised
// end-to-end.
import { createHmac } from "node:crypto";

/** In-memory KVNamespace mock. Exposes `__map` for assertions. */
export function kvMock() {
  const map = new Map<string, { value: string; metadata?: any }>();
  return {
    __map: map,
    async get(key: string) {
      const e = map.get(key);
      return e ? e.value : null;
    },
    async getWithMetadata(key: string) {
      const e = map.get(key);
      return e ? { value: e.value, metadata: e.metadata ?? null } : { value: null, metadata: null };
    },
    async put(key: string, value: string, opts?: { metadata?: any; expirationTtl?: number }) {
      map.set(key, { value, metadata: opts?.metadata });
    },
    async delete(key: string) {
      map.delete(key);
    },
    async list(opts?: { prefix?: string }) {
      const prefix = opts?.prefix ?? "";
      const keys = [...map.entries()]
        .filter(([k]) => k.startsWith(prefix))
        .map(([name, e]) => ({ name, metadata: e.metadata }));
      return { keys, list_complete: true, cursor: "" };
    },
    /** test convenience: keys starting with prefix */
    __keys(prefix = "") {
      return [...map.keys()].filter((k) => k.startsWith(prefix));
    },
  };
}

export type EnvOverrides = Record<string, any>;

export function envMock(overrides: EnvOverrides = {}) {
  return {
    KEYS: kvMock(),
    USAGE: kvMock(),
    ENVIRONMENT: "production",
    ...overrides,
  } as any;
}

interface CtxOpts {
  env: any;
  headers?: Record<string, string>;
  body?: any; // object or string
  query?: Record<string, string>;
  url?: string;
  ip?: string;
  params?: Record<string, string>; // route params, e.g. { provider: "sentry" }
  method?: string;
  auth?: any; // pre-populate c.var.auth (for handlers that read it directly)
}

/** Minimal Hono Context supporting only what the money-path handlers touch. */
export function makeCtx(opts: CtxOpts) {
  const h: Record<string, string> = {};
  for (const [k, v] of Object.entries(opts.headers ?? {})) h[k.toLowerCase()] = v;
  if (opts.ip) h["cf-connecting-ip"] = opts.ip;
  const query = opts.query ?? {};
  const params = opts.params ?? {};
  const url = opts.url ?? "https://wmcp.sh/api/v1/webhook";
  const vars: Record<string, any> = {};
  if (opts.auth) vars.auth = opts.auth;
  const waited: Promise<any>[] = [];
  const bodyStr = () =>
    typeof opts.body === "string" ? opts.body : JSON.stringify(opts.body ?? {});

  const ctx: any = {
    env: opts.env,
    var: vars,
    executionCtx: {
      waitUntil: (p: Promise<any>) => {
        waited.push(Promise.resolve(p));
      },
      passThroughOnException: () => {},
    },
    req: {
      url,
      method: opts.method ?? "POST",
      raw: { headers: new Headers(h) },
      param: (name: string) => params[name],
      header: (name?: string) => (name === undefined ? h : h[name.toLowerCase()]),
      query: (name: string) => query[name],
      text: async () => bodyStr(),
      json: async () => (typeof opts.body === "string" ? JSON.parse(opts.body) : opts.body),
      arrayBuffer: async () => new TextEncoder().encode(bodyStr()).buffer,
    },
    json: (obj: any, status = 200) => ({ status, body: obj }),
    header: (_k: string, _v?: string) => {},
    set: (k: string, v: any) => {
      vars[k] = v;
    },
    get: (k: string) => vars[k],
    __waited: waited,
  };
  return ctx;
}

/** Produce a valid Stripe-Signature header: t=<unix>,v1=<hmac-sha256(`t.payload`)>. */
export function signStripe(payload: string, secret: string, t = Math.floor(Date.now() / 1000)) {
  const sig = createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex");
  return `t=${t},v1=${sig}`;
}

/** A checkout.session.completed event with the given metadata. */
export function checkoutCompleted(metadata: Record<string, string>, extra: any = {}) {
  return JSON.stringify({
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_test_123",
        customer: "cus_test_1",
        customer_email: "buyer@example.com",
        subscription: "sub_test_1",
        amount_total: 12900,
        currency: "usd",
        metadata,
        ...extra,
      },
    },
  });
}
