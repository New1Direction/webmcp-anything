// test/providers.test.ts — guards the MCP-proxy provider registry so a future
// edit can't silently break the generic /mcp/:provider proxy + DCR flow.
import { describe, it, expect } from "vitest";
import { PROVIDERS } from "../src/providers";

const proxied = Object.values(PROVIDERS).filter((p) => p.mcpProxy);

describe("MCP-proxy providers are well-formed", () => {
  it("includes defillama and the new sentry reference", () => {
    const ids = proxied.map((p) => p.id);
    expect(ids).toContain("defillama");
    expect(ids).toContain("sentry");
  });

  it("includes the entrenched-vault providers (move #3): linear, notion, atlassian, asana, paypal", () => {
    const ids = proxied.map((p) => p.id);
    for (const id of ["linear", "notion", "atlassian", "asana", "paypal"]) {
      expect(ids).toContain(id);
    }
    // The vault is now at least 7 proxied providers (the 5–10 target).
    expect(proxied.length).toBeGreaterThanOrEqual(7);
  });

  it("every entrenched provider is zero-setup DCR (no operator client secret needed)", () => {
    for (const id of ["linear", "notion", "atlassian", "asana", "paypal"]) {
      const p = PROVIDERS[id] as any;
      expect(p.dcrRegistrationUrl).toMatch(/^https:\/\//);
      expect(p.usePKCERedirect).toBe(true);
      // DCR self-registers — must not depend on a static operator app secret.
      expect(p.clientIdSecret).toBeUndefined();
      expect(p.clientSecretSecret).toBeUndefined();
    }
  });

  it("Square is intentionally NOT shipped (DCR redirect-allowlist 400s wmcp.sh)", () => {
    // The live adversarial probe confirmed Square gates DCR behind a redirect-URI
    // domain allowlist that excludes wmcp.sh — connect would 400. Hold until
    // Square partner onboarding allowlists the callback domain.
    expect(PROVIDERS.square).toBeUndefined();
  });

  it.each(proxied.map((p) => [p.id, p] as const))(
    "%s has the fields the generic proxy + DCR flow need",
    (_id, p: any) => {
      expect(p.mcpProxy).toBe(true);
      expect(p.authType).toBe("oauth2");
      expect(p.mcpUrl).toMatch(/^https:\/\//);
      expect(p.authUrl).toMatch(/^https:\/\//);
      expect(p.tokenUrl).toMatch(/^https:\/\//);
      expect(Array.isArray(p.apiHosts)).toBe(true);
      // DCR-based providers need no static client secret — they self-register
      // (RFC 7591) and must use PKCE-redirect.
      if (p.dcrRegistrationUrl) {
        expect(p.dcrRegistrationUrl).toMatch(/^https:\/\//);
        expect(p.usePKCERedirect).toBe(true);
      }
    }
  );

  it("sentry points at the verified Sentry MCP endpoints", () => {
    const s = PROVIDERS.sentry as any;
    expect(s.mcpUrl).toBe("https://mcp.sentry.dev/mcp");
    expect(s.dcrRegistrationUrl).toBe("https://mcp.sentry.dev/oauth/register");
    expect(s.authUrl).toBe("https://mcp.sentry.dev/oauth/authorize");
    expect(s.tokenUrl).toBe("https://mcp.sentry.dev/oauth/token");
    expect(s.usePKCERedirect).toBe(true);
  });

  // ---- horizontal expansion (2026-05-30): 7 → 25 proxied providers ----
  const EXPANSION_18 = [
    "stripe_mcp", "webflow", "wix", "canva", "monday", "fireflies", "zapier",
    "cloudinary", "cloudflare_bindings", "cloudflare_observability", "apify",
    "globalping", "neon", "posthog", "prisma", "grafana", "huggingface", "telnyx",
  ];

  it("includes all 18 connect-verified expansion providers (vault now 25)", () => {
    const ids = proxied.map((p) => p.id);
    for (const id of EXPANSION_18) expect(ids).toContain(id);
    expect(proxied.length).toBeGreaterThanOrEqual(25);
  });

  it("every expansion provider is zero-setup DCR (no static operator secret)", () => {
    for (const id of EXPANSION_18) {
      const p = PROVIDERS[id] as any;
      expect(p, id).toBeTruthy();
      expect(p.usePKCERedirect).toBe(true);
      expect(p.dcrRegistrationUrl).toMatch(/^https:\/\//);
      expect(p.clientIdSecret).toBeUndefined();
      expect(p.clientSecretSecret).toBeUndefined();
    }
  });

  it("HELD candidates stay unshipped (allowlist-blocked / no public DCR / unreachable)", () => {
    for (const id of ["square", "intercom", "vercel", "github_mcp", "box", "paddle", "plaid", "hubspot", "dialpad"]) {
      expect(PROVIDERS[id]).toBeUndefined();
    }
  });
});
