// revenue_readiness.ts — config-only revenue launch preflight.
// Admin-only, no Stripe API calls, no token/price ID disclosure. An OK here means
// required settings are present, NOT that payment processing is validated.
import type { Context } from "hono";
import { parsePriceMap } from "./billing";

export type RevenueEnv = {
  ADMIN_TOKEN?: string;
  ENVIRONMENT?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_PRICE_TO_PLAN?: string;
  STRIPE_PRICE_FIX?: string;
  STRIPE_PRICE_VERIFIED?: string;
  STRIPE_PRICE_DEEP_AUDIT?: string;
  STRIPE_PRICE_MONITOR?: string;
  LEAD_ALERT_WEBHOOK?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM?: string;
};

export function assessRevenueReadiness(env: RevenueEnv) {
  const mapped = parsePriceMap(env.STRIPE_PRICE_TO_PLAN);
  const pricePlans = new Set(Object.values(mapped));
  const has = (v?: string) => typeof v === "string" && v.trim().length > 0;
  const items = {
    stripe_secret: has(env.STRIPE_SECRET_KEY),
    stripe_webhook_signature: has(env.STRIPE_WEBHOOK_SECRET),
    builder_price: pricePlans.has("builder"),
    pro_price: pricePlans.has("pro"),
    reseller_price: pricePlans.has("reseller"),
    agent_ready_fix_price: has(env.STRIPE_PRICE_FIX),
    directory_verified_price: has(env.STRIPE_PRICE_VERIFIED),
    deep_audit_price: has(env.STRIPE_PRICE_DEEP_AUDIT),
    grade_monitor_price: has(env.STRIPE_PRICE_MONITOR),
    paid_order_alerts: has(env.LEAD_ALERT_WEBHOOK),
    email_delivery: has(env.RESEND_API_KEY) && has(env.RESEND_FROM),
  };
  return {
    operational_status: "configuration_only",
    note: "This validates presence of settings, not Stripe prices, webhook delivery, successful payments or fulfillments.",
    checks: items,
    subscriptions_configured: items.stripe_secret && items.stripe_webhook_signature &&
      items.builder_price && items.pro_price && items.reseller_price,
    agent_ready_fix_configured: items.stripe_secret && items.stripe_webhook_signature &&
      items.agent_ready_fix_price && items.paid_order_alerts,
    warnings: [
      ...(!items.stripe_secret ? ["Stripe secret missing; checkout will not work."] : []),
      ...(!items.stripe_webhook_signature ? ["Webhook signing secret missing; production will reject webhook events."] : []),
      ...(!items.builder_price ? ["Builder plan price ID missing."] : []),
      ...(!items.pro_price ? ["Pro plan price ID missing."] : []),
      ...(!items.reseller_price ? ["Reseller plan price ID missing."] : []),
      ...(!items.agent_ready_fix_price ? ["One-time Agent-Ready Fix checkout is not configured."] : []),
      ...(!items.paid_order_alerts ? ["No paid-order webhook alert; review fulfillment queue manually."] : []),
      ...(!items.email_delivery ? ["Email delivery not configured; buyer correspondence may not be delivered."] : []),
    ],
  };
}

export async function revenueReadiness(c: Context<{ Bindings: RevenueEnv }>) {
  const want = c.env.ADMIN_TOKEN || (c.env.ENVIRONMENT === "development" ? "devadmin" : null);
  if (!want || c.req.header("x-admin-token") !== want) {
    return c.json({ error: "admin only" }, 401);
  }
  c.header("Cache-Control", "no-store");
  return c.json(assessRevenueReadiness(c.env));
}
