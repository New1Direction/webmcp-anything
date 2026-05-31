// directory_rank.ts — pure ranking + per-host dedup for /directory.
//
// The directory was reading as spam: the 2h Shopify cron seeds hundreds of
// products from a few stores, KV.list returns ~insertion order, so a single host
// (aloyoga) flooded the page before diverse hosts appeared. Fix = rank, then cap
// per host so no store dominates — diversity by host, not just raw count.
// Extracted as a pure function so the dedup logic is unit-testable without Hono.

export interface DirEntry {
  url: string;
  adapter: string;
  ts: number;
  title: string | null;
  slug: string;
  verified: boolean;
  featured_rank: number | null;
}

export interface RankedEntry extends DirEntry {
  host: string;
}

// Cap key = full host, lowercased, leading "www." stripped. NOTE: this does NOT
// collapse to the registrable domain, so shop.x.com and x.com count as two hosts
// and each gets its own per-host quota. That's intentional (sub-stores can be
// genuinely distinct, and eTLD+1 collapsing needs a public-suffix list to handle
// .co.uk etc.) — but it means a motivated multi-subdomain store can still split
// its flood. Acceptable for the cron-seeded directory; revisit if abuse shows up.
export function hostOf(u: string): string {
  try { return new URL(u).host.replace(/^www\./, "").toLowerCase(); } catch { return u; }
}

/**
 * Rank + diversify directory entries.
 *   • Sort: featured first (asc rank), then newest ts.
 *   • Cap each host to `perHost` entries (0 disables the PER-HOST cap only) so one
 *     store can't flood. `limit` ALWAYS applies on top — perHost=0 is not "full
 *     list", it still truncates to `limit`.
 *   • Featured entries bypass the per-host cap (hand-picked, always shown).
 *   • Truncate to `limit`.
 * Returns the ranked entries + the distinct-host count OF THE RETURNED entries
 * (counted after truncation, so the "N stores" badge matches the rows shown).
 */
export function rankDirectory(
  raw: DirEntry[],
  opts: { perHost?: number; limit?: number } = {}
): { entries: RankedEntry[]; distinct_hosts: number } {
  const perHost = opts.perHost ?? 3;
  const limit = opts.limit ?? 200;

  const all: RankedEntry[] = raw.map((e) => ({ ...e, host: hostOf(e.url) }));

  // Featured (asc rank) first, then newest ts — so the per-host cap keeps each
  // host's newest entries and featured always survives.
  all.sort((a, b) => {
    const ar = a.featured_rank ?? Number.POSITIVE_INFINITY;
    const br = b.featured_rank ?? Number.POSITIVE_INFINITY;
    if (ar !== br) return ar - br;
    return b.ts - a.ts;
  });

  const perHostCount: Record<string, number> = {};
  const deduped = perHost === 0 ? all : all.filter((e) => {
    if (e.featured_rank != null) return true; // featured bypasses the cap
    const n = (perHostCount[e.host] = (perHostCount[e.host] || 0) + 1);
    return n <= perHost;
  });

  // Count distinct hosts AFTER truncation so the "N stores" badge can't claim
  // more stores than the rows actually returned (deduped may exceed `limit`).
  const entries = deduped.slice(0, limit);
  const distinct_hosts = new Set(entries.map((e) => e.host)).size;
  return { entries, distinct_hosts };
}
