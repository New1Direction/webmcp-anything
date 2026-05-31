// test/directory_rank.test.ts — per-host dedup + featured-pinning for /directory.
import { describe, it, expect } from "vitest";
import { rankDirectory, hostOf, type DirEntry } from "../src/directory_rank";

function e(url: string, ts: number, extra: Partial<DirEntry> = {}): DirEntry {
  return { url, adapter: "shopify", ts, title: null, slug: url, verified: false, featured_rank: null, ...extra };
}

describe("rankDirectory", () => {
  it("caps each host so one store can't flood (the aloyoga problem)", () => {
    const raw: DirEntry[] = [];
    for (let i = 0; i < 50; i++) raw.push(e(`https://aloyoga.com/products/p${i}`, 1000 + i));
    raw.push(e("https://gymshark.com/products/x", 900));
    raw.push(e("https://allbirds.com/products/y", 800));
    const { entries, distinct_hosts } = rankDirectory(raw, { perHost: 3, limit: 200 });
    const aloCount = entries.filter((x) => x.host === "aloyoga.com").length;
    expect(aloCount).toBe(3);                // capped, not 50
    expect(distinct_hosts).toBe(3);          // alo + gymshark + allbirds
    expect(entries.some((x) => x.host === "gymshark.com")).toBe(true);
    expect(entries.some((x) => x.host === "allbirds.com")).toBe(true);
  });

  it("keeps each host's NEWEST entries under the cap", () => {
    const raw = [
      e("https://aloyoga.com/products/old", 100),
      e("https://aloyoga.com/products/mid", 200),
      e("https://aloyoga.com/products/new", 300),
      e("https://aloyoga.com/products/oldest", 50),
    ];
    const { entries } = rankDirectory(raw, { perHost: 2 });
    const slugs = entries.map((x) => x.url.split("/").pop());
    expect(slugs).toEqual(["new", "mid"]); // newest two, in ts-desc order
  });

  it("featured entries bypass the cap and sort to the top", () => {
    const raw = [
      e("https://aloyoga.com/products/a", 1000),
      e("https://aloyoga.com/products/b", 999),
      e("https://aloyoga.com/products/c", 998),
      e("https://aloyoga.com/products/featured", 1, { featured_rank: 0 }), // old but featured
    ];
    const { entries } = rankDirectory(raw, { perHost: 2 });
    expect(entries[0].url.endsWith("/featured")).toBe(true); // featured pinned first
    // 4 entries survive: the featured one (bypasses cap) + 2 capped + ... actually
    // featured bypasses, then 2 non-featured under the cap = 3 total.
    expect(entries.filter((x) => x.host === "aloyoga.com").length).toBe(3);
  });

  it("per_host=0 disables the PER-HOST cap only (limit still applies)", () => {
    const raw = Array.from({ length: 10 }, (_, i) => e(`https://x.com/p${i}`, i));
    const { entries } = rankDirectory(raw, { perHost: 0 });
    expect(entries.length).toBe(10); // all 10 returned: cap off AND under default limit
    // but `limit` is NOT disabled by perHost=0 — it still truncates:
    const big = Array.from({ length: 600 }, (_, i) => e(`https://x.com/p${i}`, i));
    expect(rankDirectory(big, { perHost: 0, limit: 200 }).entries.length).toBe(200);
  });

  it("respects the overall limit after dedup", () => {
    const raw: DirEntry[] = [];
    for (let h = 0; h < 20; h++) for (let i = 0; i < 5; i++) raw.push(e(`https://h${h}.com/p${i}`, h * 10 + i));
    const { entries } = rankDirectory(raw, { perHost: 3, limit: 10 });
    expect(entries.length).toBe(10);
  });

  it("distinct_hosts counts the RETURNED rows, not the pre-truncation set", () => {
    // 20 hosts, 1 entry each survives the cap → deduped=20, but limit=10 returns
    // 10 rows from 10 hosts. The badge must say 10, not 20.
    const raw = Array.from({ length: 20 }, (_, h) => e(`https://h${h}.com/p`, h));
    const { entries, distinct_hosts } = rankDirectory(raw, { perHost: 1, limit: 10 });
    expect(entries.length).toBe(10);
    expect(distinct_hosts).toBe(10); // matches rows shown, not the 20 deduped
  });

  it("subdomains are counted as distinct hosts (documented limitation)", () => {
    // hostOf does not collapse to the registrable domain, so a multi-subdomain
    // store gets a per-host quota per subdomain. Locks in current behavior.
    const raw = [
      ...Array.from({ length: 4 }, (_, i) => e(`https://x.com/p${i}`, 100 + i)),
      ...Array.from({ length: 4 }, (_, i) => e(`https://shop.x.com/p${i}`, 200 + i)),
    ];
    const { entries } = rankDirectory(raw, { perHost: 3 });
    expect(entries.length).toBe(6); // 3 from x.com + 3 from shop.x.com
  });

  it("hostOf strips www + lowercases", () => {
    expect(hostOf("https://www.Allbirds.com/products/x")).toBe("allbirds.com");
    expect(hostOf("https://shop.gymshark.com/p")).toBe("shop.gymshark.com");
    expect(hostOf("not a url")).toBe("not a url");
  });
});
