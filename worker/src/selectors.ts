// selectors.ts — server-driven add-to-cart selectors for the QuickCatch
// extension. THIS is where you fix a store when its markup drifts: edit the
// list, `wrangler deploy`, and every installed extension picks it up within
// ~hours (it fetches /api/v1/selectors and merges over its bundled defaults).
// No Chrome Web Store re-review needed.
//
// These are CSS selector strings (data, used in querySelector) — not code.
// Keep the extension's bundled copy (extension/content.js QC_HOST_SELECTORS)
// roughly in sync as the offline fallback.

export const SELECTOR_CONFIG = {
  version: "2026-06-02",
  hosts: {
    "amazon.com": ['#add-to-cart-button', 'input#add-to-cart-button', 'input[name="submit.add-to-cart"]', '#buy-now-button'],
    "walmart.com": ['button[data-automation-id="atc"]', '[data-seo-id="add-to-cart"]', 'button[data-testid="add-to-cart-section"] button'],
    "target.com": ['button[data-test="addToCartButton"]', 'button[data-test="orderPickupButton"]', 'button[data-test="shippingButton"]'],
    "bestbuy.com": ['button.add-to-cart-button', 'button[data-button-state="ADD_TO_CART"]'],
    "samsclub.com": ['button[data-testid="add-to-cart"]', 'button[aria-label*="Add to cart" i]'],
    "pokemoncenter.com": ['button[data-testid="add-to-cart"]', 'button[class*="addToCart" i]', 'button[aria-label*="Add to Cart" i]'],
    "gamestop.com": ['button.add-to-cart', '#add-to-cart', 'button[data-id*="addToCart" i]'],
    "costco.com": ['#add-to-cart-btn', 'input[id*="add-to-cart" i]', 'button[automation-id="addToCartButton"]'],
    "tcgplayer.com": ['button[data-testid*="add-to-cart" i]', 'button.add-to-cart', 'a[href*="add-to-cart" i]'],
  },
};
