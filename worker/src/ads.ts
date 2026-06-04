// ads.ts — tasteful display ads for the DEV / MCP pages ONLY.
//
// Deliberately NOT on the drops/tools buy-funnel pages: display ads there would
// cannibalize affiliate + Pro conversion (which pay far more per visitor). The
// dev pages (hub, leaderboard, WebMCP) carry an engaged developer audience that
// EthicalAds monetizes well without tracking and without cheapening the brand.
//
// HOW TO TURN ON: sign up at https://www.ethicalads.io/publishers/ , get your
// publisher id, paste it below. Ships DARK — nothing renders until it's set.
// (Carbon Ads / BuySellAds can be swapped in here later behind the same slot.)

export const EA_PUBLISHER = ""; // <-- your ethicalads.io publisher id

/** A single EthicalAds slot. Empty string until EA_PUBLISHER is set.
 *  Call once per page (the loader script is idempotent if a page has two). */
export function adSlot(type: "text" | "image" = "text"): string {
  if (!EA_PUBLISHER) return "";
  return `<div class="adslot" data-ea-publisher="${EA_PUBLISHER}" data-ea-type="${type}" style="margin:28px 0"></div>` +
    `<script async src="https://media.ethicalads.io/media/client/ethicalads.min.js"></script>`;
}

export const adsEnabled = (): boolean => !!EA_PUBLISHER;
