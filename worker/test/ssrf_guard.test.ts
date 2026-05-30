// test/ssrf_guard.test.ts — the SSRF guard on the URL-fetching grader.
import { describe, it, expect } from "vitest";
import { blockedTargetReason } from "../src/mcp_grade";

describe("blockedTargetReason — SSRF guard", () => {
  it("allows ordinary public https MCP servers", () => {
    for (const u of [
      "https://mcp.sentry.dev/mcp",
      "https://mcp.linear.app/mcp",
      "https://example.com/mcp",
      "https://1.1.1.1/mcp", // public IP literal
    ]) {
      expect(blockedTargetReason(u)).toBeNull();
    }
  });

  it("blocks non-https", () => {
    expect(blockedTargetReason("http://example.com/mcp")).toBe("not_https");
    expect(blockedTargetReason("file:///etc/passwd")).toBe("not_https");
  });

  it("blocks cloud metadata + loopback + internal hostnames", () => {
    expect(blockedTargetReason("https://169.254.169.254/latest/meta-data/")).toBe("private_ip");
    expect(blockedTargetReason("https://127.0.0.1/mcp")).toBe("private_ip");
    expect(blockedTargetReason("https://localhost/mcp")).toBe("internal_host");
    expect(blockedTargetReason("https://foo.internal/mcp")).toBe("internal_host");
    expect(blockedTargetReason("https://metadata.google.internal/")).toBe("internal_host");
  });

  it("blocks RFC1918 + CGNAT private ranges", () => {
    expect(blockedTargetReason("https://10.0.0.5/mcp")).toBe("private_ip");
    expect(blockedTargetReason("https://192.168.1.1/mcp")).toBe("private_ip");
    expect(blockedTargetReason("https://172.16.0.1/mcp")).toBe("private_ip");
    expect(blockedTargetReason("https://172.31.255.255/mcp")).toBe("private_ip");
    expect(blockedTargetReason("https://100.64.0.1/mcp")).toBe("private_ip");
    // 172.32 is public (outside 16-31)
    expect(blockedTargetReason("https://172.32.0.1/mcp")).toBeNull();
  });

  it("blocks IPv6 loopback / unique-local / link-local + mapped private", () => {
    expect(blockedTargetReason("https://[::1]/mcp")).toBe("private_ip6");
    expect(blockedTargetReason("https://[fc00::1]/mcp")).toBe("private_ip6");
    expect(blockedTargetReason("https://[fe80::1]/mcp")).toBe("private_ip6");
    expect(blockedTargetReason("https://[::ffff:10.0.0.1]/mcp")).toBe("private_ip6_mapped");
  });

  it("rejects invalid urls", () => {
    expect(blockedTargetReason("not a url")).toBe("invalid_url");
  });
});
