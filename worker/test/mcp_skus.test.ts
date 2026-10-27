// test/mcp_skus.test.ts — the trust-authority monetization SKUs
// (one-time deep audit + recurring continuous monitoring).
import { describe, it, expect, vi, afterEach } from "vitest";
vi.mock("../src/metrics", () => ({ track: () => {} }));

import { createDeepAuditCheckout, createMonitorCheckout, stripeWebhook } from "../src/stripe";
import { envMock, makeCtx, signStripe, checkoutCompleted } from "./helpers";

const WHSEC = "whsec_test_secret";
afterEach(() => vi.unstubAllGlobals());

function stubStripe() {
  let sent = "";
  vi.stubGlobal("fetch", vi.fn(async (_u: string, init: any) => {
    sent = init.body;
    return { ok: true, json: async () => ({ url: "https://stripe/c", id: "cs_x" }) };
  }));
  return () => sent;
}

describe("Deep Audit SKU (one-time)", () => {
  it("400 without url+email; 400 on invalid email", async () => {
    const env = envMock({ STRIPE_SECRET_KEY: "sk", STRIPE_PRICE_DEEP_AUDIT: "price_da" });
    expect((await createDeepAuditCheckout(makeCtx({ env, body: { url: "https://x.com/mcp" } }))).status).toBe(400);
    expect((await createDeepAuditCheckout(makeCtx({ env, body: { url: "https://x.com/mcp", email: "nope" } }))).status).toBe(400);
  });
  it("503 when price unset", async () => {
    const env = envMock({ STRIPE_SECRET_KEY: "sk" });
    const res = await createDeepAuditCheckout(makeCtx({ env, body: { url: "https://x.com/mcp", email: "a@b.com" } }));
    expect(res.status).toBe(503);
    expect(res.body.error).toBe("deep_audit_sku_not_configured");
  });
  it("creates a payment-mode deep_audit checkout with host metadata", async () => {
    const env = envMock({ STRIPE_SECRET_KEY: "sk", STRIPE_PRICE_DEEP_AUDIT: "price_da" });
    const sent = stubStripe();
    const res = await createDeepAuditCheckout(makeCtx({ env, body: { url: "https://mcp.x.com/mcp", email: "a@b.com" } }));
    expect(res.body.url).toContain("stripe");
    const d = decodeURIComponent(sent());
    expect(d).toContain("mode=payment");
    expect(d).toContain("metadata[kind]=deep_audit");
    expect(d).toContain("metadata[host]=mcp.x.com");
  });
});

describe("Continuous Monitoring SKU (recurring)", () => {
  it("400 without url; 400 on non-https alert_url", async () => {
    const env = envMock({ STRIPE_SECRET_KEY: "sk", STRIPE_PRICE_MONITOR: "price_m" });
    expect((await createMonitorCheckout(makeCtx({ env, body: {} }))).status).toBe(400);
    expect((await createMonitorCheckout(makeCtx({ env, body: { url: "https://x.com/mcp", alert_url: "http://insecure" } }))).status).toBe(400);
  });
  it("503 when price unset", async () => {
    const env = envMock({ STRIPE_SECRET_KEY: "sk" });
    const res = await createMonitorCheckout(makeCtx({ env, body: { url: "https://x.com/mcp" } }));
    expect(res.status).toBe(503);
    expect(res.body.error).toBe("monitor_sku_not_configured");
  });
  it("creates a subscription grade_monitor checkout carrying host + alert_url", async () => {
    const env = envMock({ STRIPE_SECRET_KEY: "sk", STRIPE_PRICE_MONITOR: "price_m" });
    const sent = stubStripe();
    const res = await createMonitorCheckout(makeCtx({ env, body: { url: "https://mcp.x.com/mcp", alert_url: "https://hooks.slack.com/x" } }));
    expect(res.body.url).toContain("stripe");
    const d = decodeURIComponent(sent());
    expect(d).toContain("mode=subscription");
    expect(d).toContain("metadata[kind]=grade_monitor");
    expect(d).toContain("metadata[host]=mcp.x.com");
    expect(d).toContain("subscription_data[metadata][kind]=grade_monitor");
  });
});

describe("trust-SKU webhooks are fail-closed (never mint a key)", () => {
  async function fire(raw: string) {
    const env = envMock({ STRIPE_WEBHOOK_SECRET: WHSEC });
    const c = makeCtx({ env, body: raw, headers: { "stripe-signature": signStripe(raw, WHSEC) } });
    return { env, res: await stripeWebhook(c) };
  }
  it("deep_audit → records a job, no key", async () => {
    const { env, res } = await fire(checkoutCompleted({ kind: "deep_audit", host: "mcp.x.com", target_url: "https://mcp.x.com/mcp" }));
    expect(res.body.action).toBe("deep_audit_recorded");
    expect(env.KEYS.__keys("deepaudit:").length).toBe(1);
    expect(env.KEYS.__keys("key:").length).toBe(0);
  });
  it("grade_monitor → writes a monitor subscription, no key", async () => {
    const { env, res } = await fire(checkoutCompleted({ kind: "grade_monitor", host: "mcp.x.com", alert_url: "https://hooks.slack.com/x" }));
    expect(res.body.action).toBe("monitor_active");
    expect(env.KEYS.__keys("monitorsub:mcp.x.com:").length).toBe(1);
    expect(env.KEYS.__keys("key:").length).toBe(0);
  });
  it("subscription.deleted grade_monitor → removes the subscription", async () => {
    const env = envMock({ STRIPE_WEBHOOK_SECRET: WHSEC });
    await env.KEYS.put("monitorsub:mcp.x.com:sub_test_1", JSON.stringify({ host: "mcp.x.com" }));
    const raw = JSON.stringify({ type: "customer.subscription.deleted", data: { object: { id: "sub_test_1", customer: "cus_1", status: "canceled", metadata: { kind: "grade_monitor", host: "mcp.x.com" } } } });
    const c = makeCtx({ env, body: raw, headers: { "stripe-signature": signStripe(raw, WHSEC) } });
    const res = await stripeWebhook(c);
    expect(res.body.action).toBe("monitor_removed");
    expect(env.KEYS.__keys("monitorsub:").length).toBe(0);
  });
});

// ───────────── fulfillment: the trust SKUs actually deliver ─────────────
import { captureLead } from "../src/lead_capture";
import { regradeWatched } from "../src/mcp_grade";
import { notifyMonitorSubscribers } from "../src/trust_delivery";

const GRADE = {
  url: "https://mcp.x.com/mcp", host: "mcp.x.com", checked_at: Date.UTC(2026, 9, 1), reachable: true, auth_required: false,
  grade: "F", score: 31, tools_count: 2,
  sub: { security: { score: 10, weight: 30, notes: [] }, hygiene: { score: 40, weight: 15, notes: [] } },
  findings: [{ id: "tool_poisoning", severity: "fail", owasp: "MCP01", detail: 'Tool "fetch" description contains prompt-injection / hidden-instruction markup.' }],
};

function mailEnv(over: Record<string, any> = {}) {
  const env = envMock({ STRIPE_WEBHOOK_SECRET: WHSEC, RESEND_API_KEY: "re_x", CACHE: envMock().KEYS, ...over });
  return env;
}

function captureFetch() {
  const calls: { url: string; body: any }[] = [];
  vi.stubGlobal("fetch", vi.fn(async (url: string, init: any) => {
    let body: any = init?.body;
    try { body = JSON.parse(body); } catch {}
    calls.push({ url: String(url), body });
    return { ok: true, status: 200, json: async () => ({}), text: async () => "" };
  }));
  return calls;
}

async function fireOn(env: any, obj: any, type = "checkout.session.completed") {
  const paidSession = type.startsWith("checkout.session.") ? { payment_status: "paid", ...obj } : obj;
  const raw = JSON.stringify({ type, created: Math.floor(Date.now() / 1000), data: { object: paidSession } });
  const c = makeCtx({ env, body: raw, headers: { "stripe-signature": signStripe(raw, WHSEC) } });
  const res = await stripeWebhook(c);
  await Promise.all(c.__waited);
  return res;
}

describe("Monitoring fulfillment", () => {
  const meta = { kind: "grade_monitor", host: "mcp.x.com" };

  it("checkout + subscription events share one record keyed by subscription id, and cancellation removes it", async () => {
    const env = mailEnv();
    await env.CACHE.put("grade:mcp.x.com", JSON.stringify(GRADE));
    captureFetch();
    await fireOn(env, { id: "cs_1", subscription: "sub_9", customer_email: "ops@x.com", metadata: meta });
    await fireOn(env, { id: "sub_9", status: "active", metadata: meta }, "customer.subscription.created");
    expect(env.KEYS.__keys("monitorsub:")).toEqual(["monitorsub:mcp.x.com:sub_9"]);
    expect(JSON.parse(await env.KEYS.get("monitorsub:mcp.x.com:sub_9")).email).toBe("ops@x.com");

    await fireOn(env, { id: "sub_9", status: "canceled", metadata: meta }, "customer.subscription.deleted");
    expect(env.KEYS.__keys("monitorsub:").length).toBe(0);
  });

  it("a subscription that goes unpaid stops alerting", async () => {
    const env = mailEnv();
    captureFetch();
    await fireOn(env, { id: "cs_1", subscription: "sub_9", customer_email: "ops@x.com", metadata: meta });
    await fireOn(env, { id: "sub_9", status: "unpaid", metadata: meta }, "customer.subscription.updated");
    expect(env.KEYS.__keys("monitorsub:").length).toBe(0);
  });

  it("new subscribers get a welcome email with the current grade, once", async () => {
    const env = mailEnv();
    await env.CACHE.put("grade:mcp.x.com", JSON.stringify(GRADE));
    const calls = captureFetch();
    await fireOn(env, { id: "cs_1", subscription: "sub_9", customer_email: "ops@x.com", metadata: meta });
    await fireOn(env, { id: "sub_9", status: "active", metadata: { ...meta, email: "ops@x.com" } }, "customer.subscription.updated");
    const mails = calls.filter((x) => x.url.includes("resend.com"));
    expect(mails).toHaveLength(1);
    expect(mails[0].body.to).toEqual(["ops@x.com"]);
    expect(mails[0].body.html).toContain("Grade F");
  });

  it("drift alerts reach email-only subscribers, not just webhooks", async () => {
    const env = mailEnv();
    await env.KEYS.put("monitorsub:mcp.x.com:sub_a", JSON.stringify({ host: "mcp.x.com", email: "ops@x.com", alert_url: "" }));
    await env.KEYS.put("monitorsub:mcp.x.com:sub_b", JSON.stringify({ host: "mcp.x.com", alert_url: "https://hooks.slack.com/x" }));
    const calls = captureFetch();
    const n = await notifyMonitorSubscribers(env, "mcp.x.com", "grade drop B→F");
    expect(n).toBe(2);
    expect(calls.find((x) => x.url.includes("resend.com"))?.body.to).toEqual(["ops@x.com"]);
    expect(calls.find((x) => x.url.includes("hooks.slack.com"))?.body.text).toBe("grade drop B→F");
  });

  it("paid hosts are re-checked every cron run, ahead of the free rotation", async () => {
    const env = mailEnv();
    // 30 free hosts all checked LONG before the paid one → rotation alone would skip it.
    for (let i = 0; i < 30; i++) await env.CACHE.put(`gradewatch:free${i}.example.org`, `https://free${i}.example.org/mcp`, { metadata: { checked_at: i } } as any);
    await env.CACHE.put("gradewatch:paid.example.org", "https://paid.example.org/mcp", { metadata: { checked_at: Date.now() } } as any);
    await env.KEYS.put("monitorsub:paid.example.org:sub_1", JSON.stringify({ host: "paid.example.org" }));
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("offline"); }));
    const out = await regradeWatched(env, { waitUntil: () => {} }, () => {}, 20);
    const probed = (globalThis.fetch as any).mock.calls.map((c: any[]) => String(c[0]));
    expect(probed.some((u: string) => u.includes("paid.example.org"))).toBe(true);
    expect(out.checked).toBe(21);
  });
});

describe("Deep Audit + grade-page lead deliver immediately", () => {
  it("holds an unpaid audit and fulfills a later signed async settlement only once", async () => {
    const env = mailEnv();
    await env.CACHE.put("grade:mcp.x.com", JSON.stringify(GRADE));
    const calls = captureFetch();
    const metadata = { kind: "deep_audit", host: "mcp.x.com", target_url: "https://mcp.x.com/mcp" };
    const session = { id: "cs_async_audit", customer_email: "buyer@x.com", metadata };
    const pending = await fireOn(env, { ...session, payment_status: "unpaid" });
    expect(pending.body.action).toBe("payment_pending");
    expect(env.KEYS.__keys("deepaudit:")).toHaveLength(0);
    const paid = await fireOn(env, { ...session, payment_status: "paid" }, "checkout.session.async_payment_succeeded");
    expect(paid.body.action).toBe("deep_audit_recorded");
    const retry = await fireOn(env, { ...session, payment_status: "paid" }, "checkout.session.async_payment_succeeded");
    expect(retry.body.action).toBe("deep_audit_already_recorded");
    expect(env.KEYS.__keys("deepaudit:")).toHaveLength(1);
    const emails = calls.filter(c => c.url.includes("resend.com"));
    expect(emails).toHaveLength(1);
    expect(env.KEYS.__keys("key:")).toHaveLength(0);
  });

  it("a paid Deep Audit emails the machine audit to the buyer", async () => {
    const env = mailEnv();
    await env.CACHE.put("grade:mcp.x.com", JSON.stringify(GRADE));
    const calls = captureFetch();
    await fireOn(env, { id: "cs_2", customer_email: "cto@x.com", metadata: { kind: "deep_audit", host: "mcp.x.com", target_url: "https://mcp.x.com/mcp" } });
    const mail = calls.find((x) => x.url.includes("resend.com"));
    expect(mail?.body.to).toEqual(["cto@x.com"]);
    expect(mail?.body.subject).toContain("Your MCP audit");
    expect(env.KEYS.__keys("deepaudit:").length).toBe(1);
  });

  it("the grade-page capture sends findings from the STORED grade, not the form text, once per day", async () => {
    const env = mailEnv();
    await env.CACHE.put("grade:mcp.x.com", JSON.stringify(GRADE));
    const calls = captureFetch();
    const body = { email: "ops@x.com", package: "grade-audit", site_url: "https://mcp.x.com/mcp", use_case: "<a href=https://phish.example>click</a>" };
    for (let i = 0; i < 2; i++) {
      const c = makeCtx({ env, body, ip: `10.0.0.${i}` });
      await captureLead(c);
      await Promise.all(c.__waited);
    }
    const mails = calls.filter((x) => x.url.includes("resend.com"));
    expect(mails).toHaveLength(1);
    expect(mails[0].body.html).toContain("prompt-injection");
    expect(mails[0].body.html).toContain("Fix path");
    expect(mails[0].body.html).not.toContain("phish.example");
  });
});
