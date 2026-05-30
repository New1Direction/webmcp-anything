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

  it("includes the entrenched-vault providers (move #3): linear, notion, atlassian, asana", () => {
    const ids = proxied.map((p) => p.id);
    for (const id of ["linear", "notion", "atlassian", "asana"]) {
      expect(ids).toContain(id);
    }
    // The vault is now at least 6 proxied providers (the 5–10 target).
    expect(proxied.length).toBeGreaterThanOrEqual(6);
  });

  it("every entrenched provider is zero-setup DCR (no operator client secret needed)", () => {
    for (const id of ["linear", "notion", "atlassian", "asana"]) {
      const p = PROVIDERS[id] as any;
      expect(p.dcrRegistrationUrl).toMatch(/^https:\/\//);
      expect(p.usePKCERedirect).toBe(true);
      // DCR self-registers — must not depend on a static operator app secret.
      expect(p.clientIdSecret).toBeUndefined();
      expect(p.clientSecretSecret).toBeUndefined();
    }
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
});
