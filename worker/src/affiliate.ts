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
// Examples (replace YOURTAG / IDs with yours). {q} = url-encoded product query.
//   ebay:      https://www.ebay.com/sch/i.html?_nkw={q}&mkcid=1&mkrid=711-53200-19255-0&campid=YOURCAMPID&toolid=10001   (~3% trading cards; partnernetwork.ebay.com)
//   tcgplayer: your Impact tracking link with {q}   (3.5%/sale; apply: docs.tcgplayer.com/docs/tcgplayer-affiliate-program)
//   amazon:    https://www.amazon.com/s?k={q}&tag=YOURTAG-20   (~3% toys&games; needs 3 sales/180d to stay active)
//   whatnot:   your Whatnot Affiliates link — usually a FIXED referral URL (no {q}); renders the same on every page (whatnotaffiliates.com)
//   walmart:   your Impact/Walmart Creator deep-search link with {q}
//   stockx:    https://stockx.com/search?s={q}  with your affiliate params   (for the resale / vs-sneaker-bot pages)

export interface AffiliateNet { label: string; tmpl: string }

// Ordered best-fit first → that's the button order on the page. Each ships dark
// until you paste its tmpl, so leaving unused ones empty is safe.
export const AFFILIATE: AffiliateNet[] = [
  { label: "eBay", tmpl: "https://www.ebay.com/sch/i.html?_nkw={q}&mkcid=1&mkrid=711-53200-19255-0&siteid=0&campid=5339155495&customid=wmcp&toolid=10001&mkevt=1" },
  { label: "TCGplayer", tmpl: "" },
  { label: "Amazon", tmpl: "" },
  { label: "Whatnot", tmpl: "" },
  { label: "Walmart", tmpl: "" },
  { label: "StockX", tmpl: "" },
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

/** eBay affiliate URL for a query. cheapest=true sorts Price+Shipping lowest first (_sop=15). */
export function ebayUrl(query: string, cheapest = false): string {
  const ebay = AFFILIATE.find((a) => a.label === "eBay");
  if (!ebay || !ebay.tmpl) return "";
  let url = ebay.tmpl.replace(/\{q\}/g, encodeURIComponent(query));
  if (cheapest) url += "&_sop=15";
  return url;
}

/**
 * Two price-check buttons for ONE specific card: the cheapest raw (ungraded)
 * copy and the cheapest PSA 10, both eBay affiliate links sorted low→high.
 * Use on single-card content (e.g. the Rayquaza guides). Empty if eBay is dark.
 */
export function rawAndPsa(cardName: string, label = "Find this card on eBay:"): string {
  const raw = ebayUrl(`${cardName} -psa -cgc -bgs -graded`, true);
  const psa = ebayUrl(`${cardName} psa 10`, true);
  if (!raw && !psa) return "";
  return (
    `<div class="buynow"><span class="buynow-l">${esc(label)}</span><div class="row">` +
    `<a class="btn btn-ghost" rel="sponsored nofollow noopener" target="_blank" href="${esc(raw)}">Cheapest raw</a>` +
    `<a class="btn btn-ghost" rel="sponsored nofollow noopener" target="_blank" href="${esc(psa)}">PSA 10</a>` +
    `</div></div>`
  );
}
