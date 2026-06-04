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
import { issueKey, revokeKey, resolveAuth, type Plan } from "./auth";
import { track } from "./metrics";
import { slugFromUrl } from "./slug";
import { PROVIDERS } from "./providers";
import { connKey, MANAGED_CONNECTION_KIND } from "./connections";

type Env = {
  KEYS: KVNamespace;
  USAGE: KVNamespace;
  ENVIRONMENT: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_PRICE_TO_PLAN?: string;
  // Non-plan SKUs (directory Verified subscription; one-time Agent-Ready Fix;
  // per-connection managed OAuth-proxy subscription).
  // Stripe price IDs; if unset the corresponding self-serve checkout 503s.
  STRIPE_PRICE_VERIFIED?: string;
  STRIPE_PRICE_FIX?: string;
  STRIPE_PRICE_CONNECTION?: string;
  // MCP trust-authority SKUs: one-time deep audit; recurring drift monitoring.
  STRIPE_PRICE_DEEP_AUDIT?: string;
  STRIPE_PRICE_MONITOR?: string;
  // Consumer QuickCatch tier ($12/mo): the cheap "catch the drop for yourself"
  // plan for collectors — auto-cart + anti-bot hard sites + unlimited watches in
  // the browser extension. A license key (not an API key) gates the extension.
  STRIPE_PRICE_QUICKCATCH?: string;
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
  // kind=plan lets the webhook tell API-plan checkouts apart from the non-plan
  // SKUs (directory Verified, Agent-Ready Fix) that must NOT mint an API key.
  form.set("metadata[kind]", "plan");
  form.set("subscription_data[metadata][plan]", body.plan);
  form.set("subscription_data[metadata][kind]", "plan");
  form.set("allow_promotion_codes", "true");
  form.set("success_url", `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`);
  form.set("cancel_url", `${origin}/dashboard?canceled=1`);

  track(c.env, c.executionCtx, "checkout_started");

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

  // Fail-closed: non-plan SKUs (directory Verified, Agent-Ready Fix) never mint
  // an API key here, even if their session_id is polled at this endpoint.
  const sessKind = session.metadata?.kind as string | undefined;
  if (sessKind && sessKind !== "plan") {
    return c.json({ ok: true, kind: sessKind, key: null });
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
    // In production, refuse unsigned webhooks outright — without the signing
    // secret a forged checkout.session.completed could mint a paid API key
    // (see the issueKey path below). Only the dev env tolerates it.
    if (c.env.ENVIRONMENT === "production") {
      return c.json({ error: "webhook_not_configured" }, 503);
    }
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
      if (isSession) track(c.env, c.executionCtx, "paid");

      // FAIL-CLOSED SKU GUARD. Any checkout whose metadata.kind is set and is
      // NOT "plan" (directory Verified, Agent-Ready Fix, or any future SKU) is
      // handled here and MUST return before the issueKey path below — otherwise
      // a $129 badge or one-time fix would silently mint a free Pro API key via
      // the plan="pro" fallthrough.
      const kind = obj.metadata?.kind as string | undefined;
      if (kind && kind !== "plan") {
        return await handleNonPlanCheckout(c, event.type, kind, obj);
      }
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
      // A cancelled directory Verified subscription removes the badge — it must
      // NOT touch API keys (those belong to plan subscriptions).
      const kind = sub.metadata?.kind as string | undefined;
      if (kind === "directory_verified") {
        const slug = sub.metadata?.slug as string | undefined;
        if (slug) {
          await c.env.KEYS.delete(`verified:${slug}`);
          await c.env.KEYS.delete(`featured:${slug}`);
        }
        return c.json({ ok: true, action: "verified_removed", slug });
      }
      if (kind === MANAGED_CONNECTION_KIND) {
        // Cancelled managed connection → revoke the proxy entitlement only.
        // Must NOT touch API keys.
        const provider = sub.metadata?.provider as string | undefined;
        const user_id = sub.metadata?.user_id as string | undefined;
        if (provider && user_id) await c.env.KEYS.delete(connKey(user_id, provider));
        return c.json({ ok: true, action: "connection_removed", provider, user_id });
      }
      if (kind === "grade_monitor") {
        const host = sub.metadata?.host as string | undefined;
        if (host) await c.env.KEYS.delete(`monitorsub:${host}:${sub.id}`);
        return c.json({ ok: true, action: "monitor_removed", host });
      }
      if (kind === QUICKCATCH_KIND) {
        // Cancelled consumer sub → deactivate the license (extension falls back
        // to free alerts on the next verify). Find the key via the sub→key map.
        const lic = await c.env.KEYS.get(`qcsub:${sub.id}`);
        if (lic) {
          const raw = await c.env.KEYS.get(`qclic:${lic}`);
          if (raw) {
            const rec = JSON.parse(raw);
            rec.status = "inactive";
            await c.env.KEYS.put(`qclic:${lic}`, JSON.stringify(rec), { metadata: { status: "inactive" } });
          }
        }
        return c.json({ ok: true, action: "quickcatch_deactivated" });
      }
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

// =================== non-plan SKU fulfillment (webhook) ===================
//
// Directory Verified (recurring) and Agent-Ready Fix (one-time). These write
// directory state / fulfillment records and NEVER issue an API key.

async function handleNonPlanCheckout(
  c: Context<{ Bindings: Env }>,
  eventType: string,
  kind: string,
  obj: any
): Promise<Response> {
  const slug = (obj.metadata?.slug as string | undefined) || "";

  if (kind === "directory_verified") {
    // Fires on checkout.session.completed + customer.subscription.created/updated.
    // Idempotent: presence of verified:<slug> = verified.
    if (slug) {
      await c.env.KEYS.put(`verified:${slug}`, "1", {
        metadata: { ts: Date.now(), via: "stripe_self_serve" },
      });
    }
    return c.json({ ok: true, action: "verified_set", slug });
  }

  if (kind === "agent_ready_fix") {
    // One-time mode=payment → only checkout.session.completed fires. Record the
    // fulfillment job for the operator and flip the badge to Verified now; the
    // human deliverable follows. NEVER issue an API key.
    if (eventType === "checkout.session.completed") {
      const now = Date.now();
      const reverseTs = (Number.MAX_SAFE_INTEGER - now).toString().padStart(16, "0");
      const rand = Array.from(crypto.getRandomValues(new Uint8Array(4)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      const email =
        obj.customer_email ||
        obj.customer_details?.email ||
        (obj.metadata?.email as string | undefined);
      await c.env.KEYS.put(
        `fix:${reverseTs}:${rand}`,
        JSON.stringify({
          received_at: now,
          received_at_iso: new Date(now).toISOString(),
          slug,
          site_url: obj.metadata?.site_url,
          email,
          amount_total: obj.amount_total,
          currency: obj.currency,
          status: "paid_pending_fulfillment",
        }),
        { expirationTtl: 365 * 86400, metadata: { slug, email, status: "paid_pending_fulfillment" } }
      );
      if (slug) {
        await c.env.KEYS.put(`verified:${slug}`, "1", {
          metadata: { ts: now, via: "agent_ready_fix" },
        });
      }
    }
    return c.json({ ok: true, action: "fix_recorded", slug });
  }

  if (kind === MANAGED_CONNECTION_KIND) {
    // Per-connection managed OAuth-proxy subscription. Fires on
    // checkout.session.completed + customer.subscription.created/updated.
    // Idempotent: entitlement conn:<user_id>:<provider> = active. NEVER a key.
    const provider = obj.metadata?.provider as string | undefined;
    const user_id =
      (obj.metadata?.user_id as string | undefined) ||
      (obj.client_reference_id as string | undefined);
    if (provider && user_id) {
      await c.env.KEYS.put(
        connKey(user_id, provider),
        JSON.stringify({ status: "active", provider, since: Date.now(), via: "stripe" })
      );
    }
    return c.json({ ok: true, action: "connection_active", provider, user_id });
  }

  if (kind === "deep_audit") {
    // One-time mode=payment → only checkout.session.completed fires. Record the
    // audit job for the operator; the human deliverable follows. NEVER a key.
    if (eventType === "checkout.session.completed") {
      const now = Date.now();
      const reverseTs = (Number.MAX_SAFE_INTEGER - now).toString().padStart(16, "0");
      const rand = Array.from(crypto.getRandomValues(new Uint8Array(4))).map((b) => b.toString(16).padStart(2, "0")).join("");
      await c.env.KEYS.put(
        `deepaudit:${reverseTs}:${rand}`,
        JSON.stringify({
          received_at: now, received_at_iso: new Date(now).toISOString(),
          host: obj.metadata?.host, target_url: obj.metadata?.target_url,
          email: obj.customer_email || obj.customer_details?.email || obj.metadata?.email,
          amount_total: obj.amount_total, currency: obj.currency, status: "paid_pending_fulfillment",
        }),
        { expirationTtl: 365 * 86400, metadata: { host: obj.metadata?.host, status: "paid_pending_fulfillment" } }
      );
    }
    return c.json({ ok: true, action: "deep_audit_recorded", host: obj.metadata?.host });
  }

  if (kind === "grade_monitor") {
    // Recurring. Subscriber pays to be alerted when a specific MCP server's
    // grade drops or its tools change (rug-pull). Store the subscription so the
    // cron's drift detector fans out to their webhook. NEVER a key.
    const host = obj.metadata?.host as string | undefined;
    const subId = (obj.id as string) || (obj.subscription as string) || "sub";
    const alertUrl = obj.metadata?.alert_url as string | undefined;
    if (host) {
      await c.env.KEYS.put(
        `monitorsub:${host}:${subId}`,
        JSON.stringify({ host, alert_url: alertUrl || "", since: Date.now(), email: obj.customer_email || obj.metadata?.email }),
        { expirationTtl: 400 * 86400 }
      );
    }
    return c.json({ ok: true, action: "monitor_active", host });
  }

  if (kind === QUICKCATCH_KIND) {
    // Recurring consumer tier. Activate (or reactivate) the buyer's license key
    // so the extension unlocks auto-cart + hard sites + unlimited watches.
    // Idempotent on email. NEVER an API key.
    const email = obj.customer_email || obj.customer_details?.email || (obj.metadata?.email as string | undefined);
    const sub_id = (obj.subscription as string) || (obj.id as string) || undefined;
    if (email) await issueQuickCatchLicense(c.env, email, sub_id);
    return c.json({ ok: true, action: "quickcatch_active", email });
  }

  // Unknown kind → fail-closed: acknowledge the webhook but provision NOTHING.
  return c.json({ ok: true, ignored_kind: kind });
}

// =================== self-serve SKU checkout creators ===================

// POST /api/v1/directory/verified/checkout  { url }
// Recurring "Agent-Ready Verified" badge. Gated on proven host ownership
// (owner:host:<hostname>, written by the claim flow in directory_claim.ts).
export async function createDirectoryVerifiedCheckout(c: Context<{ Bindings: Env }>) {
  const auth = await resolveAuth(c as any);
  if (auth.anonymous) {
    return c.json({ error: "sign_in_required", hint: "Sign in, then claim your site." }, 401);
  }
  const body = await c.req.json<{ url?: string }>().catch(() => null);
  if (!body?.url) return c.json({ error: "url_required" }, 400);
  let hostname: string;
  try {
    hostname = new URL(body.url).hostname.toLowerCase();
  } catch {
    return c.json({ error: "invalid_url" }, 400);
  }
  if (!c.env.STRIPE_SECRET_KEY || !c.env.STRIPE_PRICE_VERIFIED) {
    return c.json({ error: "verified_sku_not_configured" }, 503);
  }

  // Ownership gate — only a proven owner may buy a badge for their host.
  const ownerRaw = await c.env.KEYS.get(`owner:host:${hostname}`);
  const owner = ownerRaw ? safeJson(ownerRaw) : null;
  if (!owner || owner.user_id !== auth.user_id) {
    return c.json(
      {
        error: "ownership_required",
        hint: `Prove you control ${hostname} first: POST /api/v1/directory/claim/start, add the meta tag, then /claim/verify.`,
      },
      403
    );
  }

  const slug = slugFromUrl(body.url);
  const origin = new URL(c.req.url).origin;
  const form = new URLSearchParams();
  form.set("mode", "subscription");
  form.set("line_items[0][price]", c.env.STRIPE_PRICE_VERIFIED);
  form.set("line_items[0][quantity]", "1");
  form.set("client_reference_id", auth.user_id);
  form.set("allow_promotion_codes", "true");
  form.set("metadata[kind]", "directory_verified");
  form.set("metadata[slug]", slug);
  form.set("metadata[hostname]", hostname);
  form.set("subscription_data[metadata][kind]", "directory_verified");
  form.set("subscription_data[metadata][slug]", slug);
  form.set("success_url", `${origin}/u/${slug}?verified=ok`);
  form.set("cancel_url", `${origin}/directory?canceled=1`);
  return await createSessionResponse(c, form);
}

// POST /api/v1/agent-ready/fix/checkout  { url, email }
// One-time, mode=payment. Sold off the free probe. No ownership gate (you're
// buying a fix for your own site); fulfillment is recorded by the webhook.
export async function createFixCheckout(c: Context<{ Bindings: Env }>) {
  const body = await c.req.json<{ url?: string; email?: string }>().catch(() => null);
  if (!body?.url || !body?.email) return c.json({ error: "url_and_email_required" }, 400);
  let site_url: string;
  try {
    const u = new URL(body.url);
    if (u.protocol !== "http:" && u.protocol !== "https:") throw 0;
    site_url = u.toString();
  } catch {
    return c.json({ error: "invalid_url" }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return c.json({ error: "invalid_email" }, 400);
  }
  if (!c.env.STRIPE_SECRET_KEY || !c.env.STRIPE_PRICE_FIX) {
    return c.json({ error: "fix_sku_not_configured" }, 503);
  }

  const slug = slugFromUrl(site_url);
  const origin = new URL(c.req.url).origin;
  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("line_items[0][price]", c.env.STRIPE_PRICE_FIX);
  form.set("line_items[0][quantity]", "1");
  form.set("customer_email", body.email);
  form.set("metadata[kind]", "agent_ready_fix");
  form.set("metadata[slug]", slug);
  form.set("metadata[site_url]", site_url);
  form.set("metadata[email]", body.email);
  form.set("success_url", `${origin}/managed?fix=ok`);
  form.set("cancel_url", `${origin}/managed?canceled=1`);
  return await createSessionResponse(c, form);
}

// POST /api/v1/connections/checkout  { provider }
// Recurring per-connection subscription for a managed OAuth-proxy connection
// (the moat's revenue model). Sign-in required; NEVER mints an API key — the
// webhook just writes the conn:<user>:<provider> entitlement.
export async function createManagedConnectionCheckout(c: Context<{ Bindings: Env }>) {
  const auth = await resolveAuth(c as any);
  if (auth.anonymous) {
    return c.json({ error: "sign_in_required", hint: "Sign in, then subscribe to a managed connection." }, 401);
  }
  const body = await c.req.json<{ provider?: string }>().catch(() => null);
  const providerId = body?.provider;
  if (!providerId) return c.json({ error: "provider_required" }, 400);
  const provider = PROVIDERS[providerId];
  if (!provider || !provider.mcpProxy) {
    return c.json({ error: "unknown_or_unproxied_provider", provider: providerId }, 404);
  }
  if (!c.env.STRIPE_SECRET_KEY || !c.env.STRIPE_PRICE_CONNECTION) {
    return c.json({ error: "connection_sku_not_configured" }, 503);
  }

  const origin = new URL(c.req.url).origin;
  const form = new URLSearchParams();
  form.set("mode", "subscription");
  form.set("line_items[0][price]", c.env.STRIPE_PRICE_CONNECTION);
  form.set("line_items[0][quantity]", "1");
  form.set("client_reference_id", auth.user_id);
  form.set("allow_promotion_codes", "true");
  form.set("metadata[kind]", MANAGED_CONNECTION_KIND);
  form.set("metadata[provider]", providerId);
  form.set("metadata[user_id]", auth.user_id);
  form.set("subscription_data[metadata][kind]", MANAGED_CONNECTION_KIND);
  form.set("subscription_data[metadata][provider]", providerId);
  form.set("subscription_data[metadata][user_id]", auth.user_id);
  form.set("success_url", `${origin}/dashboard?connection=${encodeURIComponent(providerId)}`);
  form.set("cancel_url", `${origin}/dashboard?canceled=1`);
  return await createSessionResponse(c, form);
}

// POST /api/v1/mcp/deep-audit/checkout  { url, email }
// One-time deep audit report, sold off the grade page. mode=payment. No key.
export async function createDeepAuditCheckout(c: Context<{ Bindings: Env }>) {
  const body = await c.req.json<{ url?: string; email?: string }>().catch(() => null);
  if (!body?.url || !body?.email) return c.json({ error: "url_and_email_required" }, 400);
  let host: string;
  try { const u = new URL(body.url); if (u.protocol !== "https:" && u.protocol !== "http:") throw 0; host = u.host.toLowerCase(); } catch { return c.json({ error: "invalid_url" }, 400); }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) return c.json({ error: "invalid_email" }, 400);
  if (!c.env.STRIPE_SECRET_KEY || !c.env.STRIPE_PRICE_DEEP_AUDIT) return c.json({ error: "deep_audit_sku_not_configured" }, 503);

  const origin = new URL(c.req.url).origin;
  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("line_items[0][price]", c.env.STRIPE_PRICE_DEEP_AUDIT);
  form.set("line_items[0][quantity]", "1");
  form.set("customer_email", body.email);
  form.set("metadata[kind]", "deep_audit");
  form.set("metadata[host]", host);
  form.set("metadata[target_url]", body.url);
  form.set("metadata[email]", body.email);
  form.set("success_url", `${origin}/mcp/grade/${encodeURIComponent(host)}?audit=ok`);
  form.set("cancel_url", `${origin}/mcp/grade/${encodeURIComponent(host)}?canceled=1`);
  return await createSessionResponse(c, form);
}

// POST /api/v1/mcp/monitor/checkout  { url, alert_url?, email? }
// Recurring continuous-monitoring: alert this buyer when the server's grade
// drops or its tools change (rug-pull). Drift fan-out happens in the cron. No key.
export async function createMonitorCheckout(c: Context<{ Bindings: Env }>) {
  const body = await c.req.json<{ url?: string; alert_url?: string; email?: string }>().catch(() => null);
  if (!body?.url) return c.json({ error: "url_required" }, 400);
  let host: string;
  try { host = new URL(body.url).host.toLowerCase(); } catch { return c.json({ error: "invalid_url" }, 400); }
  if (body.alert_url) { try { const a = new URL(body.alert_url); if (a.protocol !== "https:") throw 0; } catch { return c.json({ error: "invalid_alert_url", hint: "alert_url must be an https webhook (Slack-compatible)." }, 400); } }
  if (!c.env.STRIPE_SECRET_KEY || !c.env.STRIPE_PRICE_MONITOR) return c.json({ error: "monitor_sku_not_configured" }, 503);

  const origin = new URL(c.req.url).origin;
  const form = new URLSearchParams();
  form.set("mode", "subscription");
  form.set("line_items[0][price]", c.env.STRIPE_PRICE_MONITOR);
  form.set("line_items[0][quantity]", "1");
  if (body.email) form.set("customer_email", body.email);
  form.set("allow_promotion_codes", "true");
  form.set("metadata[kind]", "grade_monitor");
  form.set("metadata[host]", host);
  if (body.alert_url) form.set("metadata[alert_url]", body.alert_url);
  form.set("subscription_data[metadata][kind]", "grade_monitor");
  form.set("subscription_data[metadata][host]", host);
  if (body.alert_url) form.set("subscription_data[metadata][alert_url]", body.alert_url);
  form.set("success_url", `${origin}/mcp/grade/${encodeURIComponent(host)}?monitor=ok`);
  form.set("cancel_url", `${origin}/mcp/grade/${encodeURIComponent(host)}?canceled=1`);
  return await createSessionResponse(c, form);
}

// =================== QuickCatch consumer tier ($12/mo) ===================
// The cheap collector plan: free = restock alerts; paid = auto-cart, the
// anti-bot hard sites (Pokémon Center / Walmart / SNKRS / Labubu), unlimited
// watches. Gated by a LICENSE KEY (qc_…) the browser extension verifies — NOT
// an API key, so it stays isolated from the developer plan ladder.

const QUICKCATCH_KIND = "quickcatch";

function newQcKey(): string {
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(18)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `qc_${rand}`;
}

// Idempotent on email: one active license per buyer. Writes the verify record
// (qclic:<key>), the email→key map (recovery + idempotency), and the
// sub→key map (so a cancellation can find and deactivate it).
async function issueQuickCatchLicense(
  env: Env,
  email: string,
  sub_id?: string
): Promise<string> {
  const lower = email.toLowerCase();
  const existing = await env.KEYS.get(`qcemail:${lower}`);
  if (existing) {
    // Reactivate in case it was previously cancelled, refresh the sub link.
    const recRaw = await env.KEYS.get(`qclic:${existing}`);
    if (recRaw) {
      const rec = JSON.parse(recRaw);
      rec.status = "active";
      if (sub_id) rec.sub_id = sub_id;
      await env.KEYS.put(`qclic:${existing}`, JSON.stringify(rec), { metadata: { status: "active" } });
      if (sub_id) await env.KEYS.put(`qcsub:${sub_id}`, existing);
      return existing;
    }
  }
  const key = newQcKey();
  await env.KEYS.put(
    `qclic:${key}`,
    JSON.stringify({ email: lower, sub_id, status: "active", created: Date.now() }),
    { metadata: { status: "active" } }
  );
  await env.KEYS.put(`qcemail:${lower}`, key);
  if (sub_id) await env.KEYS.put(`qcsub:${sub_id}`, key);
  return key;
}

// POST /api/v1/quickcatch/checkout  { email }
// $12/mo consumer subscription. Email required so we can issue + recover the
// license. 503 until STRIPE_PRICE_QUICKCATCH is set (fail-closed like every SKU).
export async function createQuickCatchCheckout(c: Context<{ Bindings: Env }>) {
  const body = await c.req.json<{ email?: string }>().catch(() => null);
  if (!body?.email || body.email.indexOf("@") < 1) return c.json({ error: "email_required" }, 400);
  if (!c.env.STRIPE_SECRET_KEY || !c.env.STRIPE_PRICE_QUICKCATCH) {
    return c.json({ error: "quickcatch_not_configured" }, 503);
  }
  const origin = new URL(c.req.url).origin;
  const form = new URLSearchParams();
  form.set("mode", "subscription");
  form.set("line_items[0][price]", c.env.STRIPE_PRICE_QUICKCATCH);
  form.set("line_items[0][quantity]", "1");
  form.set("customer_email", body.email);
  form.set("allow_promotion_codes", "true");
  form.set("metadata[kind]", QUICKCATCH_KIND);
  form.set("metadata[email]", body.email);
  form.set("subscription_data[metadata][kind]", QUICKCATCH_KIND);
  form.set("subscription_data[metadata][email]", body.email);
  form.set("success_url", `${origin}/quickcatch/activate?session_id={CHECKOUT_SESSION_ID}`);
  form.set("cancel_url", `${origin}/quickcatch?canceled=1`);
  return await createSessionResponse(c, form);
}

// GET /api/v1/quickcatch/verify?key=qc_…  → { active } for the extension to gate
// paid features. Unknown/old keys read inactive (fail-closed).
export async function verifyQuickCatch(c: Context<{ Bindings: Env }>) {
  const key = (c.req.query("key") || "").trim();
  if (!key.startsWith("qc_")) return c.json({ active: false, plan: QUICKCATCH_KIND });
  const raw = await c.env.KEYS.get(`qclic:${key}`);
  if (!raw) return c.json({ active: false, plan: QUICKCATCH_KIND });
  let active = false;
  try { active = JSON.parse(raw).status === "active"; } catch {}
  return c.json({ active, plan: QUICKCATCH_KIND });
}

// GET /quickcatch/activate?session_id=…  — post-checkout landing. Confirms the
// session is paid, issues/returns the license key (idempotent; mirrors
// keyByCheckout so it works even before the webhook lands), and shows the buyer
// their key + how to paste it into the extension.
export async function quickCatchActivate(c: Context<{ Bindings: Env }>) {
  const session_id = c.req.query("session_id");
  const esc = (s: string) => String(s).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" } as any)[ch]);
  const page = (inner: string) => c.html(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>QuickCatch — activate</title><body style="font-family:ui-sans-serif,system-ui,sans-serif;background:#13131a;color:#eee;max-width:560px;margin:8vh auto;padding:0 22px;line-height:1.55">${inner}</body>`);
  if (!session_id) return page(`<h1>QuickCatch</h1><p>Missing session. <a style="color:#ff9e2c" href="/quickcatch">Back</a></p>`);
  if (!c.env.STRIPE_SECRET_KEY) return page(`<h1>Almost there</h1><p>Billing isn't switched on yet — your subscription is safe; email support and we'll send your key.</p>`);
  const sRes = await fetch(`${STRIPE_API}/checkout/sessions/${encodeURIComponent(session_id)}`, { headers: { authorization: `Bearer ${c.env.STRIPE_SECRET_KEY}` } });
  const session: any = await sRes.json();
  if (!sRes.ok) return page(`<h1>Hmm</h1><p>Couldn't confirm that checkout. Email support with your receipt and we'll sort it.</p>`);
  if (session.payment_status !== "paid") return page(`<h1>Processing…</h1><p>Payment status: ${esc(session.payment_status || "pending")}. Refresh in a moment.</p>`);
  const email = session.customer_email || session.customer_details?.email || session.metadata?.email;
  if (!email) return page(`<h1>Paid ✓</h1><p>We couldn't read your email to issue the key — email support and we'll send it.</p>`);
  const key = await issueQuickCatchLicense(c.env, email, session.subscription);
  return page(`<h1>You're in 🎯</h1>
  <p>QuickCatch is active. Here's your license key — paste it into the extension's <b>Options</b> to unlock auto-cart, the bot-blocked stores, and unlimited watches:</p>
  <p style="background:#1d1d27;border:1px solid #ff9e2c55;border-radius:10px;padding:14px;font-family:ui-monospace,monospace;font-size:1.05rem;color:#ffcf7a;word-break:break-all">${esc(key)}</p>
  <p style="color:#9a9aae;font-size:.9rem">Don't have the extension yet? <a style="color:#ff9e2c" href="/">Install QuickCatch</a>, then open its Options and paste the key. Keep this key — you can re-open this page from your receipt anytime.</p>`);
}

async function createSessionResponse(
  c: Context<{ Bindings: Env }>,
  form: URLSearchParams
) {
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
    return c.json({ error: "stripe_error", detail: j?.error?.message || j }, 502);
  }
  return c.json({ url: j.url, id: j.id });
}

function safeJson(s: string): any {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
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
