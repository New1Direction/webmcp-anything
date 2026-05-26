// stripe.ts — Stripe Checkout + webhook + recovery.
//
// We deliberately do NOT pull in the Stripe SDK (heavy, unneeded for our scope).
// Direct REST calls via fetch + application/x-www-form-urlencoded.
//
// Env secrets expected:
//   STRIPE_SECRET_KEY       sk_test_... or sk_live_...
//   STRIPE_WEBHOOK_SECRET   whsec_...
//   STRIPE_PRICE_TO_PLAN    JSON, e.g. {"price_1ABC":"pro","price_1XYZ":"reseller"}

import type { Context } from "hono";
import { issueKey, revokeKey, type Plan } from "./auth";

type Env = {
  KEYS: KVNamespace;
  USAGE: KVNamespace;
  ENVIRONMENT: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_PRICE_TO_PLAN?: string;
};

const STRIPE_API = "https://api.stripe.com/v1";

// =================== Checkout Session creator ===================

export async function createCheckout(c: Context<{ Bindings: Env }>) {
  const body = await c.req
    .json<{ email: string; plan: Plan; origin?: string }>()
    .catch(() => null);
  if (!body?.email || !body?.plan) {
    return c.json({ error: "email and plan required" }, 400);
  }
  if (!c.env.STRIPE_SECRET_KEY) {
    return c.json({ error: "stripe_not_configured" }, 503);
  }

  const planToPrice = invertPriceMap(c.env.STRIPE_PRICE_TO_PLAN);
  const price_id = planToPrice[body.plan];
  if (!price_id) {
    return c.json({ error: `no_price_for_plan`, plan: body.plan }, 400);
  }

  const origin = body.origin || new URL(c.req.url).origin;
  const form = new URLSearchParams();
  form.set("mode", "subscription");
  form.set("line_items[0][price]", price_id);
  form.set("line_items[0][quantity]", "1");
  form.set("customer_email", body.email);
  form.set("client_reference_id", body.email);
  form.set("metadata[plan]", body.plan);
  form.set("subscription_data[metadata][plan]", body.plan);
  form.set("allow_promotion_codes", "true");
  form.set("success_url", `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`);
  form.set("cancel_url", `${origin}/dashboard?canceled=1`);

  const res = await fetch(`${STRIPE_API}/checkout/sessions`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${c.env.STRIPE_SECRET_KEY}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });
  const j: any = await res.json();
  if (!res.ok) {
    return c.json(
      { error: "stripe_error", detail: j?.error?.message || j },
      502
    );
  }
  return c.json({ url: j.url, id: j.id });
}

// =================== Key lookup by checkout session ===================
//
// Called by /dashboard after Stripe redirects with ?session_id=...
// Idempotently issues the key if the webhook hasn't landed yet.

export async function keyByCheckout(c: Context<{ Bindings: Env }>) {
  const session_id = c.req.query("session_id");
  if (!session_id) return c.json({ error: "session_id_required" }, 400);
  if (!c.env.STRIPE_SECRET_KEY) {
    return c.json({ error: "stripe_not_configured" }, 503);
  }

  const sRes = await fetch(
    `${STRIPE_API}/checkout/sessions/${encodeURIComponent(session_id)}`,
    { headers: { authorization: `Bearer ${c.env.STRIPE_SECRET_KEY}` } }
  );
  const session: any = await sRes.json();
  if (!sRes.ok) {
    return c.json(
      { error: "stripe_error", detail: session?.error?.message || session },
      502
    );
  }
  if (session.payment_status !== "paid") {
    return c.json({ pending: true, status: session.payment_status });
  }

  const customer_id: string | undefined = session.customer;
  const email: string | undefined =
    session.customer_email ||
    session.customer_details?.email ||
    session.client_reference_id;
  const user_id = customer_id ? `cust:${customer_id}` : `email:${email}`;
  const sub_id: string | undefined = session.subscription;

  // Already issued?
  const userRaw = await c.env.KEYS.get(`user:${user_id}`);
  if (userRaw) {
    const u = JSON.parse(userRaw);
    if (u.keys?.length) {
      if (email) {
        await c.env.KEYS.put(`email:${email.toLowerCase()}`, user_id);
      }
      return c.json({
        key: u.keys[u.keys.length - 1],
        plan: u.plan,
        user_id,
      });
    }
  }

  // Webhook hasn't fired yet — figure out the plan and issue ourselves.
  let plan: Plan =
    (session.metadata?.plan as Plan) ||
    (await resolvePlanFromSubscription(c.env, sub_id)) ||
    "pro";

  const key = await issueKey(c.env as any, user_id, plan, sub_id);
  if (email) {
    await c.env.KEYS.put(`email:${email.toLowerCase()}`, user_id);
  }
  return c.json({ key, plan, user_id });
}

async function resolvePlanFromSubscription(
  env: Env,
  sub_id?: string
): Promise<Plan | null> {
  if (!sub_id || !env.STRIPE_SECRET_KEY) return null;
  const res = await fetch(
    `${STRIPE_API}/subscriptions/${encodeURIComponent(sub_id)}`,
    { headers: { authorization: `Bearer ${env.STRIPE_SECRET_KEY}` } }
  );
  if (!res.ok) return null;
  const sub: any = await res.json();
  const meta_plan = sub.metadata?.plan as Plan | undefined;
  if (meta_plan) return meta_plan;
  const price_id = sub.items?.data?.[0]?.price?.id;
  if (!price_id) return null;
  const map = parsePriceMap(env.STRIPE_PRICE_TO_PLAN);
  return map[price_id] || null;
}

// =================== Recovery by email ===================

export async function recoverByEmail(c: Context<{ Bindings: Env }>) {
  const body = await c.req.json<{ email: string }>().catch(() => null);
  if (!body?.email) return c.json({ error: "email_required" }, 400);
  const email = body.email.toLowerCase().trim();
  const user_id = await c.env.KEYS.get(`email:${email}`);
  if (!user_id) return c.json({ error: "not_found" }, 404);
  const userRaw = await c.env.KEYS.get(`user:${user_id}`);
  if (!userRaw) return c.json({ error: "not_found" }, 404);
  const u = JSON.parse(userRaw);
  return c.json({ keys: u.keys || [], plan: u.plan, user_id });
}

// =================== Webhook ===================

export async function stripeWebhook(c: Context<{ Bindings: Env }>) {
  const sigHeader = c.req.header("stripe-signature");
  const secret = c.env.STRIPE_WEBHOOK_SECRET;

  const raw = await c.req.text();

  if (!secret) {
    console.warn(
      "STRIPE_WEBHOOK_SECRET unset — accepting unsigned webhook (dev only)"
    );
  } else {
    if (!sigHeader) return c.json({ error: "missing signature" }, 400);
    const ok = await verifyStripeSig(raw, sigHeader, secret);
    if (!ok) return c.json({ error: "invalid signature" }, 400);
  }

  let event: any;
  try {
    event = JSON.parse(raw);
  } catch {
    return c.json({ error: "invalid json" }, 400);
  }

  const priceToPlan = parsePriceMap(c.env.STRIPE_PRICE_TO_PLAN);

  switch (event.type) {
    case "checkout.session.completed":
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const obj = event.data.object;
      // Session vs Subscription discriminator.
      const isSession = event.type === "checkout.session.completed";
      const customer_id: string | undefined = obj.customer;
      const sub_id: string | undefined = isSession
        ? obj.subscription
        : obj.id;
      const email: string | undefined =
        obj.customer_email ||
        obj.customer_details?.email ||
        (isSession ? obj.client_reference_id : undefined);

      // Plan resolution:
      // - subscription event: items.data[0].price.id
      // - session event: from metadata, else fetch the subscription
      const meta_plan = obj.metadata?.plan as Plan | undefined;
      const price_id = obj.items?.data?.[0]?.price?.id;
      let plan: Plan =
        meta_plan ||
        (price_id ? priceToPlan[price_id] : undefined) ||
        (await resolvePlanFromSubscription(c.env, sub_id)) ||
        "pro";

      const status = obj.status || "active";
      const user_id = customer_id
        ? `cust:${customer_id}`
        : email
        ? `email:${email}`
        : `sub:${sub_id || obj.id}`;

      if (status === "canceled" || status === "unpaid") {
        await revokeUserKeys(c.env, user_id);
        return c.json({ ok: true, action: "revoked", user_id });
      }

      // Existing user → update plan on existing keys (idempotent).
      const userRaw = await c.env.KEYS.get(`user:${user_id}`);
      if (userRaw) {
        const u = JSON.parse(userRaw);
        if (u.keys?.length) {
          for (const k of u.keys) {
            const krRaw = await c.env.KEYS.get(`key:${k}`);
            if (krRaw) {
              const kr = JSON.parse(krRaw);
              kr.plan = plan;
              kr.status = "active";
              await c.env.KEYS.put(`key:${k}`, JSON.stringify(kr));
            }
          }
          if (email) {
            await c.env.KEYS.put(`email:${email.toLowerCase()}`, user_id);
          }
          return c.json({
            ok: true,
            action: "plan_updated",
            plan,
            user_id,
          });
        }
      }

      const key = await issueKey(c.env as any, user_id, plan, sub_id);
      if (email) {
        await c.env.KEYS.put(`email:${email.toLowerCase()}`, user_id);
      }
      return c.json({ ok: true, action: "key_issued", key, plan, user_id });
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object;
      const user_id = `cust:${sub.customer}`;
      await revokeUserKeys(c.env, user_id);
      return c.json({ ok: true, action: "revoked", user_id });
    }

    default:
      return c.json({ ok: true, ignored: event.type });
  }
}

async function revokeUserKeys(env: Env, user_id: string) {
  const userRaw = await env.KEYS.get(`user:${user_id}`);
  if (!userRaw) return;
  const u = JSON.parse(userRaw);
  for (const k of u.keys || []) await revokeKey(env as any, k);
}

// =================== helpers ===================

function parsePriceMap(s?: string): Record<string, Plan> {
  try {
    return JSON.parse(s || "{}");
  } catch {
    return {};
  }
}

function invertPriceMap(s?: string): Partial<Record<Plan, string>> {
  const m = parsePriceMap(s);
  const out: Partial<Record<Plan, string>> = {};
  for (const [price, plan] of Object.entries(m)) out[plan] = price;
  return out;
}

// Stripe signature verification — manual HMAC-SHA256.
async function verifyStripeSig(
  payload: string,
  header: string,
  secret: string
): Promise<boolean> {
  const parts = Object.fromEntries(
    header.split(",").map((s) => s.split("=") as [string, string])
  );
  const t = parts.t;
  const sig = parts.v1;
  if (!t || !sig) return false;
  if (Math.abs(Date.now() / 1000 - parseInt(t, 10)) > 300) return false;

  const signedPayload = `${t}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signedPayload)
  );
  const expected = Array.from(new Uint8Array(sigBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  }
  return diff === 0;
}
