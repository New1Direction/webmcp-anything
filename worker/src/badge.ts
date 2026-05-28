// badge.ts — /badge/:slug.svg
//
// Embeddable SVG badge for verified listings. Two variants:
//   /badge/<slug>.svg            — full pill badge ("Agent-ready Verified · wmcp.sh")
//   /badge/<slug>-mini.svg       — compact square (just "AR")
//
// Only emits "verified" styling if the slug is in the verified set (KV
// lookup: `verified:<slug>` -> "1"). Otherwise emits a neutral "indexed"
// badge so it can't be forged.

import type { Context } from "hono";

type Env = { KEYS: KVNamespace };

const PILL_VERIFIED = (slug: string) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="232" height="44" viewBox="0 0 232 44" role="img" aria-label="Agent-ready Verified by wmcp.sh">
  <title>Agent-ready Verified · wmcp.sh — ${slug}</title>
  <defs>
    <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#7c5cff"/>
      <stop offset="100%" stop-color="#00e5ff"/>
    </linearGradient>
    <linearGradient id="g2" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#16161f"/>
      <stop offset="100%" stop-color="#0c0c14"/>
    </linearGradient>
  </defs>
  <rect width="232" height="44" rx="10" fill="url(#g2)" stroke="url(#g1)" stroke-width="1.5"/>
  <g transform="translate(12,11)">
    <path d="M11 1.5 L17 4.5 L17 11 C17 15 14 18.5 11 20 C8 18.5 5 15 5 11 L5 4.5 Z" fill="none" stroke="url(#g1)" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M8.5 11 L10.5 13 L14 9" fill="none" stroke="#4ade80" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <text x="42" y="19" font-family="-apple-system,BlinkMacSystemFont,Inter,Segoe UI,sans-serif" font-size="11.5" font-weight="700" fill="#ececf5" letter-spacing="0.4">AGENT-READY VERIFIED</text>
  <text x="42" y="33" font-family="-apple-system,BlinkMacSystemFont,Inter,Segoe UI,sans-serif" font-size="10" font-weight="500" fill="#8a8aa8" letter-spacing="0.2">wmcp.sh · MCP-discoverable</text>
</svg>`;

const PILL_INDEXED = (slug: string) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="232" height="44" viewBox="0 0 232 44" role="img" aria-label="Indexed by wmcp.sh">
  <title>Indexed · wmcp.sh — ${slug}</title>
  <rect width="232" height="44" rx="10" fill="#11111c" stroke="#26263a" stroke-width="1.5"/>
  <g transform="translate(12,11)">
    <circle cx="11" cy="11" r="9" fill="none" stroke="#8a8aa8" stroke-width="1.6"/>
    <path d="M6 11 L10 15 L16 8" fill="none" stroke="#8a8aa8" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <text x="42" y="19" font-family="-apple-system,BlinkMacSystemFont,Inter,Segoe UI,sans-serif" font-size="11.5" font-weight="700" fill="#ececf5" letter-spacing="0.4">INDEXED</text>
  <text x="42" y="33" font-family="-apple-system,BlinkMacSystemFont,Inter,Segoe UI,sans-serif" font-size="10" font-weight="500" fill="#8a8aa8" letter-spacing="0.2">wmcp.sh · /managed → verify</text>
</svg>`;

const MINI_VERIFIED = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" role="img" aria-label="Agent-ready Verified">
  <defs>
    <linearGradient id="m1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7c5cff"/>
      <stop offset="100%" stop-color="#00e5ff"/>
    </linearGradient>
  </defs>
  <rect width="44" height="44" rx="10" fill="#0c0c14" stroke="url(#m1)" stroke-width="1.6"/>
  <path d="M22 7 L33 12 L33 22 C33 29 28 34.5 22 37 C16 34.5 11 29 11 22 L11 12 Z" fill="none" stroke="url(#m1)" stroke-width="2" stroke-linejoin="round"/>
  <path d="M17 22 L21 26 L28 18" fill="none" stroke="#4ade80" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const MINI_INDEXED = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" role="img" aria-label="Indexed">
  <rect width="44" height="44" rx="10" fill="#11111c" stroke="#26263a" stroke-width="1.6"/>
  <circle cx="22" cy="22" r="11" fill="none" stroke="#8a8aa8" stroke-width="2"/>
  <path d="M16 22 L20 26 L28 17" fill="none" stroke="#8a8aa8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export async function badgeHandler(c: Context<{ Bindings: Env }>) {
  const raw = c.req.param("slug") || "";
  if (!/^[a-z0-9-]{1,80}\.svg$/i.test(raw)) {
    return c.text("Bad badge slug", 400);
  }
  const base = raw.replace(/\.svg$/i, "");
  const isMini = base.endsWith("-mini");
  const slug = isMini ? base.slice(0, -5) : base;

  let verified = false;
  try {
    verified = (await c.env.KEYS.get(`verified:${slug}`)) === "1";
  } catch {
    verified = false;
  }

  const svg = isMini
    ? verified
      ? MINI_VERIFIED
      : MINI_INDEXED
    : verified
      ? PILL_VERIFIED(slug)
      : PILL_INDEXED(slug);

  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=600, s-maxage=3600",
      "x-wmcp-badge-status": verified ? "verified" : "indexed",
    },
  });
}
