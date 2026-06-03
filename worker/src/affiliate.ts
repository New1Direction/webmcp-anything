// affiliate.ts — monetize the content pages with affiliate "Buy now" links.
//
// Most readers of a /drops or set page won't install the extension — affiliate
// links capture revenue from them when they buy the product anyway. Primary CTA
// stays QuickCatch (free) + Pro; these are the secondary "or buy it now" row.
//
// HOW TO TURN ON: paste your affiliate SEARCH-URL template per network below,
// using {q} where the url-encoded product name goes. Use the EXACT link format
// your program gives you (so commission tracks). Empty tmpl = that button hides.
// Nothing renders until at least one tmpl is set, so this is safe to ship dark.
//
// Examples (replace YOURTAG / IDs with yours):
//   amazon:    https://www.amazon.com/s?k={q}&tag=YOURTAG-20
//   ebay:      https://www.ebay.com/sch/i.html?_nkw={q}&mkcid=1&mkrid=711-53200-19255-0&campid=YOURCAMPID&toolid=10001
//   tcgplayer: https://www.tcgplayer.com/search/all/product?q={q}&utm_source=YOURPARTNER  (use your Impact tracking link)
//   walmart:   your Impact/affiliate deep-search link with {q}

export interface AffiliateNet { label: string; tmpl: string }

export const AFFILIATE: AffiliateNet[] = [
  { label: "Amazon", tmpl: "" },
  { label: "eBay", tmpl: "" },
  { label: "TCGplayer", tmpl: "" },
  { label: "Walmart", tmpl: "" },
];

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Buy-now affiliate buttons for a product query. Empty string if none configured. */
export function affiliateButtons(query: string, buyLabel = "Buy it now:"): string {
  const q = encodeURIComponent(query);
  const live = AFFILIATE.filter((a) => a.tmpl);
  if (!live.length) return "";
  const links = live
    .map((a) => `<a class="btn btn-ghost" rel="sponsored nofollow noopener" target="_blank" href="${esc(a.tmpl.replace(/\{q\}/g, q))}">${esc(a.label)}</a>`)
    .join("");
  return `<div class="buynow"><span class="buynow-l">${esc(buyLabel)}</span><div class="row">${links}</div></div>`;
}

export const anyAffiliate = (): boolean => AFFILIATE.some((a) => a.tmpl);
