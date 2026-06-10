// test/sitemap_u_filter.test.ts — the sitemap must only list /u pages that are
// actually indexable: pages with a KNOWN tool count > 0. 0-tool pages render
// noindex (sitemap+noindex is a Search Console contradiction) and unknown-n
// legacy entries can't be trusted either way.
import { describe, it, expect } from "vitest";
import { sitemapXml } from "../src/u";
import { kvMock } from "./helpers";

describe("sitemapXml /u filter", () => {
  it("lists only seen: entries with a known tool count > 0", async () => {
    const env: any = { CACHE: kvMock() };
    const put = (url: string, n: number | undefined) =>
      env.CACHE.put(`seen:${url}`, url, { metadata: { url, ts: Date.now(), n } });
    await put("https://store.acmelabs.io/products/good", 4);
    await put("https://store.acmelabs.io/products/empty", 0);
    await put("https://store.acmelabs.io/products/legacy-unknown", undefined);

    const xml = await sitemapXml(env, "https://wmcp.sh");
    expect(xml).toContain(Buffer.from("https://store.acmelabs.io/products/good").toString("base64url"));
    expect(xml).not.toContain(Buffer.from("https://store.acmelabs.io/products/empty").toString("base64url"));
    expect(xml).not.toContain(Buffer.from("https://store.acmelabs.io/products/legacy-unknown").toString("base64url"));
  });
});
