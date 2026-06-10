import { describe, it, expect } from "vitest";
import { makeCtx, envMock } from "./helpers";
import {
  createDigitalCheckout,
  digitalUnlock,
  digitalRead,
  digitalSalesHtml,
} from "../src/digital";

describe("digital impulse products", () => {
  it("checkout is fail-closed without the Stripe price (503)", async () => {
    const c = makeCtx({ env: envMock(), method: "POST", body: {}, url: "https://wmcp.sh/api/v1/guide/checkout" });
    const r: any = await createDigitalCheckout(c, "guide");
    expect(r.status).toBe(503);
    expect(r.body.error).toBe("guide_not_configured");
  });

  it("unlock requires a session_id (400)", async () => {
    const c = makeCtx({ env: envMock({ STRIPE_SECRET_KEY: "sk_test" }), method: "GET", url: "https://wmcp.sh/guide/unlock" });
    const r: any = await digitalUnlock(c, "guide");
    expect(r.status).toBe(400);
  });

  it("read rejects an invalid token (403)", async () => {
    const c = makeCtx({ env: envMock(), method: "GET", query: { t: "bogus" }, url: "https://wmcp.sh/guide/read?t=bogus" });
    const r: any = await digitalRead(c, "guide");
    expect(r.status).toBe(403);
  });

  it("read serves the guide for a valid token", async () => {
    const env = envMock();
    await env.KEYS.put("dlg:goodtoken", JSON.stringify({ product: "guide", ts: 1 }));
    const c = makeCtx({ env, method: "GET", query: { t: "goodtoken" }, url: "https://wmcp.sh/guide/read?t=goodtoken" });
    const r: any = await digitalRead(c, "guide");
    expect(r.status).toBe(200);
    expect(String(r.body)).toContain("Drop-Day Playbook");
    expect(String(r.body)).toContain("/guide/read?t=goodtoken");
  });

  it("a token minted for the guide can't unlock a different product namespace", async () => {
    const env = envMock();
    await env.KEYS.put("dlg:wrongkind", JSON.stringify({ product: "other", ts: 1 }));
    const c = makeCtx({ env, method: "GET", query: { t: "wrongkind" }, url: "https://wmcp.sh/guide/read?t=wrongkind" });
    const r: any = await digitalRead(c, "guide");
    expect(r.status).toBe(403);
  });

  it("sales page renders a mobile buy button at the price", () => {
    const html = digitalSalesHtml("https://wmcp.sh", "guide", false);
    expect(html).toContain("$2.99");
    expect(html).toContain('data-product="guide"');
    expect(html).toContain("Get instant access");
    expect(html).toContain("no signup");
  });
});
