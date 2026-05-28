// slug.ts — canonical slug derivation for directory listings.
//
// MUST stay in lockstep across:
//   - directory_capture.ts (slug stored on submission)
//   - badge.ts             (verified lookup keyed by slug)
//   - directory.ts API     (bulk verified/featured lookup)
//   - verify_embed.ts      (/verify/<slug> embed page)
//
// Length: 64 chars max — KV key suffix headroom is generous, but cap so
// pathological URLs don't blow out logs.

export function slugFromUrl(url: string): string {
  try {
    const u = new URL(url);
    return (u.hostname + u.pathname)
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase()
      .slice(0, 64);
  } catch {
    return "submission";
  }
}
