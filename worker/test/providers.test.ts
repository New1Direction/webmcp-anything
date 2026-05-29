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
