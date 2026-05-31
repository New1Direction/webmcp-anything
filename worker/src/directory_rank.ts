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

export function hostOf(u: string): string {
  try { return new URL(u).host.replace(/^www\./, "").toLowerCase(); } catch { return u; }
}

/**
 * Rank + diversify directory entries.
 *   • Sort: featured first (asc rank), then newest ts.
 *   • Cap each host to `perHost` entries (0 = no cap) so one store can't flood.
 *   • Featured entries bypass the cap (hand-picked, always shown).
 *   • Truncate to `limit`.
 * Returns the ranked entries + the distinct-host count (for the "N stores" badge).
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

  const distinct_hosts = new Set(deduped.map((e) => e.host)).size;
  return { entries: deduped.slice(0, limit), distinct_hosts };
}
