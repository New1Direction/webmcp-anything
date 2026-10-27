import { describe, it, expect } from "vitest";
import { assessRevenueReadiness, revenueReadiness } from "../src/revenue_readiness";
import { envMock, makeCtx } from "./helpers";

const configured = {
  ADMIN_TOKEN: "test-admin",
  STRIPE_SECRET_KEY: "sk_test_fake",
  STRIPE_WEBHOOK_SECRET: "whsec_fake",
  STRIPE_PRICE_TO_PLAN: JSON.stringify({ price_b: "builder", price_p: "pro", price_r: "reseller" }),
  STRIPE_PRICE_FIX: "price_fix",
  LEAD_ALERT_WEBHOOK: "https://example.com/alerts",
};

describe("paid revenue preflight", () => {
  it("remains admin-only even when Stripe settings exist", async () => {
    const env = envMock(configured);
    const unauth = await revenueReadiness(makeCtx({ env }) as any);
    expect(unauth.status).toBe(401);
    const permitted = await revenueReadiness(makeCtx({ env, headers: { "x-admin-token": "test-admin" } }) as any);
    expect(permitted.status).toBe(200);
    expect(permitted.body.agent_ready_fix_configured).toBe(true);
  });

  it("flags missing configuration without exposing secret values or claiming a live payment", () => {
    const incomplete = assessRevenueReadiness({ STRIPE_SECRET_KEY: "sk_test_secret_value", STRIPE_PRICE_TO_PLAN: "{}" });
    expect(incomplete.subscriptions_configured).toBe(false);
    expect(incomplete.agent_ready_fix_configured).toBe(false);
    expect(incomplete.warnings).toContain("Webhook signing secret missing; production will reject webhook events.");
    expect(incomplete.operational_status).toBe("configuration_only");
    expect(JSON.stringify(incomplete)).not.toContain("sk_test_secret_value");
  });

  it("reports fully configured core checkout and fulfillment with optional SKUs independent", () => {
    const result = assessRevenueReadiness(configured);
    expect(result.subscriptions_configured).toBe(true);
    expect(result.agent_ready_fix_configured).toBe(true);
    expect(result.checks.grade_monitor_price).toBe(false);
    expect(result.checks.email_delivery).toBe(false);
    expect(result.note).toContain("not Stripe prices");
  });
});
