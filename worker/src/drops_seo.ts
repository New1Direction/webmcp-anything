// drops_seo.ts — programmatic SEO for Pokémon / TCG drop, restock, and sniping
// intent. One template + data lists. Every page carries the same funnel:
//   1. Install QuickCatch (free)        → Chrome Web Store
//   2. Free restock alerts (email)      → POST /api/v1/leads  (your leads list)
//   3. QuickCatch Pro (founding)        → Stripe Payment Link (set PRO_URL)
// No page ships without a way to capture or sell.
//
// Pages are grouped into four categories (cat): "TCG sets", "Stores",
// "vs Bots", "Guides". Adding a row here auto-wires the route (/drops/:slug
// loops DROP_PAGES) and the sitemap (sitemapXml loops DROP_SLUGS).
//
// Localization: English pages use their hand-written copy. The localizable
// categories (sets, stores, vs-bots, combos) are also served in es/fr/de/pt/it
// at /drops/<lang>/<slug>, generated from the per-locale templates in
// drops_i18n.ts, with hreflang alternates. See dropUrl() / isLocalizable().

import { type Lang, type L, LANGS, LANG_LABEL, T, fill, PRICING } from "./drops_i18n";
import { WHAT_IS, SHORT_LIST, GLOSS_I18N, BESTOF_I18N } from "./drops_i18n_content";
import { affiliateButtons } from "./affiliate";

export { LANGS, LOCALIZED_LANGS } from "./drops_i18n";
export type { Lang } from "./drops_i18n";

const STORE_URL = "https://chromewebstore.google.com/detail/quickcatch/bglmmkpaofofjnpkabfneeemgnjpjejl";
// Paste a Stripe Payment Link here to turn the Pro button into a real sale.
// Until then the Pro button falls back to the founding-email capture.
const PRO_URL = "";

// Stores the extension actually runs on (manifest content_scripts). Keep store
// pages honest: only promise a store QuickCatch can act on.
const SUPPORTED_STORES = "Pokémon Center, Walmart, Target, Best Buy, Sam's Club, Costco, GameStop, Amazon, and TCGplayer";

export type DropCat = "TCG sets" | "Stores" | "vs Bots" | "Guides";

export interface DropPage {
  slug: string;
  cat: DropCat;
  title: string;       // <title> / SERP
  desc: string;        // meta description
  h1: string;
  lede: string;        // one-paragraph intro
  topic: string;       // used in the alert label ("alerts for X")
  kind?: "versus" | "set" | "store" | "guide" | "combo" | "glossary" | "bestof";
  product?: { name: string; price?: string; store: string };
  comparison?: { themLabel: string; rows: Array<[string, string, string]> };
  combo?: { name: string; store: string };  // set × store long-tail pages
  term?: string;  // glossary term (with English article), for the "What is X?" pattern
  extraHtml?: string;  // rendered after the product callout
  faqs: Array<{ q: string; a: string }>;
}

// ---------------------------------------------------------------------------
// 1) Curated cornerstone pages (hand-written).
// ---------------------------------------------------------------------------
const CURATED: DropPage[] = [
  {
    slug: "pokemon-restock-tracker",
    cat: "Guides",
    kind: "guide",
    title: "Pokémon Restock Tracker — Catch Drops With AI | QuickCatch",
    desc: "QuickCatch watches Pokémon product pages and adds the item to your cart the second it restocks, in your own browser, even on sites that block bots.",
    h1: "A Pokémon restock tracker that actually grabs it",
    lede: "Restock alerts tell you it is back. By the time you tap through, it is gone. QuickCatch watches the page for you and adds the item to your cart the moment it restocks, so you are not racing the whole internet to the buy button.",
    topic: "Pokémon restocks",
    faqs: [
      { q: "How is this different from a restock alert?", a: "An alert pings you and leaves the rest to you. QuickCatch adds the item to your cart on the restock, then you check out. You skip the part where everyone refreshes at once." },
      { q: "Does it work on sites that block bots?", a: "Yes. QuickCatch runs in your own browser and your own logged-in session, so it reaches the same pages you do. That is why it works where server-side bots get blocked." },
      { q: "Is it free?", a: "Installing QuickCatch is free. Watching a page and adding to cart is included. Pro adds auto-cop on more items at once." },
    ],
  },
  {
    slug: "prismatic-evolutions-restock",
    cat: "TCG sets",
    kind: "set",
    title: "Prismatic Evolutions Restock Alert & Auto-Cart | QuickCatch",
    desc: "Catch the Prismatic Evolutions Elite Trainer Box restock. QuickCatch watches the page and adds it to your cart the instant it is back in stock.",
    h1: "Catch the Prismatic Evolutions restock",
    lede: "The Prismatic Evolutions Elite Trainer Box sells out in seconds and resells for several times retail. QuickCatch watches the product page and adds it to your cart the moment it restocks, so you pay retail instead of scalper prices.",
    topic: "Prismatic Evolutions restocks",
    product: { name: "Prismatic Evolutions Elite Trainer Box", price: "$49.99 retail", store: "Pokémon Center, Walmart, Target" },
    faqs: [
      { q: "Where does the Prismatic Evolutions ETB restock?", a: "Pokémon Center, Walmart, Target, Best Buy and Sam's Club all carry it. QuickCatch works on any product page that shows price and stock." },
      { q: "What does retail cost vs resale?", a: "Retail is about $49.99. Resale runs well above that during shortages, which is why catching it at retail matters." },
      { q: "Can it buy more than one?", a: "Most stores limit one per customer. QuickCatch respects the page, adds to your cart, and you complete checkout." },
    ],
  },
  {
    slug: "151-ultra-premium-restock",
    cat: "TCG sets",
    kind: "set",
    title: "151 Ultra-Premium Collection Restock | QuickCatch",
    desc: "Catch the Scarlet & Violet 151 Ultra-Premium Collection restock. QuickCatch watches the page and carts it the instant it is back.",
    h1: "Catch the 151 Ultra-Premium Collection restock",
    lede: "The Scarlet and Violet 151 Ultra-Premium Collection is one of the hardest sets to buy at retail. QuickCatch watches the page and adds it to your cart the moment stock flips, so you are not stuck paying a reseller.",
    topic: "151 Ultra-Premium restocks",
    product: { name: "Scarlet & Violet 151 Ultra-Premium Collection", price: "$119.99 retail", store: "Pokémon Center, Walmart" },
    faqs: [
      { q: "What is the retail price of the 151 UPC?", a: "About $119.99. Resellers list it far higher when it is out of stock." },
      { q: "Which stores should I watch?", a: "Pokémon Center and Walmart are the main ones. Open the product page on the store where you want to buy, then arm QuickCatch." },
      { q: "Do I have to sit on the page?", a: "No. Arm it before the drop and leave it running. QuickCatch watches in the background so you do not have to." },
    ],
  },
  {
    slug: "pokemon-center-restock",
    cat: "Stores",
    kind: "store",
    title: "Pokémon Center Restock — Catch It With AI | QuickCatch",
    desc: "Pokémon Center sells out in seconds. QuickCatch watches the product page and adds the item to your cart the moment it restocks.",
    h1: "Catch a Pokémon Center restock",
    lede: "Pokémon Center marks the hottest sets unavailable within minutes. QuickCatch watches the product page in your own browser and adds the item to your cart the instant it comes back, so you check out before it sells out again.",
    topic: "Pokémon Center restocks",
    faqs: [
      { q: "Does QuickCatch work on pokemoncenter.com?", a: "Yes. It reads the product page you are on and adds the item to your cart when stock returns. You complete checkout in your own account." },
      { q: "Will it get my account flagged?", a: "QuickCatch acts as you, in your own session, on the page you opened. It does not create accounts or run from a server." },
      { q: "What about the purchase limit?", a: "It follows the page. If the limit is one, it carts one." },
    ],
  },
  {
    slug: "walmart-pokemon-restock",
    cat: "Stores",
    kind: "store",
    title: "Walmart Pokémon Restock Tracker | QuickCatch",
    desc: "Catch Walmart Pokémon restocks. QuickCatch watches the listing and adds the card box to your cart the second it is back in stock.",
    h1: "Catch a Walmart Pokémon restock",
    lede: "Walmart restocks Pokémon boxes in waves and they vanish fast. QuickCatch watches the listing and adds it to your cart the moment it flips back to in stock, so you are first in line instead of refreshing.",
    topic: "Walmart Pokémon restocks",
    faqs: [
      { q: "Does it work with Walmart pickup and delivery?", a: "QuickCatch carts the item. You pick your fulfillment and finish checkout the way you normally would." },
      { q: "Third-party sellers vs Walmart?", a: "QuickCatch reads whichever listing you open. Open the seller you want to buy from, then arm it." },
      { q: "Is there a fee?", a: "Installing and watching is free. Pro adds watching several items at once." },
    ],
  },
  {
    slug: "pokemon-30th-anniversary-drops",
    cat: "Guides",
    kind: "guide",
    title: "Pokémon 30th Anniversary Drops — Catch Them | QuickCatch",
    desc: "The Pokémon 30th anniversary brings the year's biggest drops. QuickCatch watches the page and carts the set the instant it restocks.",
    h1: "Catch the Pokémon 30th anniversary drops",
    lede: "The 30th anniversary brings the biggest Pokémon releases of the year, and demand is brutal. QuickCatch watches the product page and adds the set to your cart the moment it restocks, so the anniversary box ends up in your collection instead of a reseller's.",
    topic: "Pokémon 30th anniversary drops",
    faqs: [
      { q: "Which anniversary sets should I watch?", a: "Open the product page for any anniversary set or special collection on your store of choice and arm QuickCatch. It works on any page that shows price and stock." },
      { q: "When do anniversary sets restock?", a: "Restocks land without warning. That is the point of QuickCatch: arm it before the drop and it watches around the clock so you do not miss the window." },
      { q: "Does it cost anything?", a: "Free to install and watch. Pro adds auto-cop across several items at once." },
    ],
  },
  {
    slug: "how-to-catch-pokemon-drops",
    cat: "Guides",
    kind: "guide",
    title: "How to Catch Pokémon Drops With AI | QuickCatch",
    desc: "A simple way to catch Pokémon drops: install QuickCatch, arm the product page, and let your AI add it to your cart the moment it restocks.",
    h1: "How to catch Pokémon drops with AI",
    lede: "You do not need a scalper setup to catch a drop. Install QuickCatch, open the product page before the drop, and let it watch the page and add the item to your cart the second stock returns.",
    topic: "Pokémon drops",
    faqs: [
      { q: "Do I need any technical setup?", a: "No. Add the extension, open the product page, and tap Watch this drop. That is the whole setup." },
      { q: "Can I close the tab?", a: "Yes. QuickCatch watches in the background. Keep Chrome running and it opens the page and carts the item when stock returns." },
      { q: "Is this against the rules?", a: "QuickCatch runs in your own browser and your own session, on the page you opened. It acts as you, the way a shopping assistant does." },
    ],
  },
  {
    slug: "pokemon-restock-bot-alternative",
    cat: "vs Bots",
    kind: "guide",
    title: "Pokémon Restock Bot Alternative That Works | QuickCatch",
    desc: "Restock bots get blocked and banned. QuickCatch runs in your own browser instead, so it reaches the pages bots cannot and carts the item for you.",
    h1: "A Pokémon restock bot alternative that actually works",
    lede: "Server-side restock bots get blocked, flagged and banned, because stores detect them. QuickCatch takes the opposite approach: it runs in your own browser and your own session, so it reaches the same pages you do and adds the item to your cart on the restock.",
    topic: "Pokémon restocks",
    faqs: [
      { q: "Why do restock bots get blocked?", a: "Stores detect datacenter traffic and automated checkout, then block or ban it. A bot running from a server stands out." },
      { q: "Why does QuickCatch get through?", a: "It is not a server. It runs in your browser, in your logged-in session, on the page you opened. To the store it looks like you, because it is you." },
      { q: "Is it safe to use?", a: "It only acts on the page you point it at, and you complete checkout yourself. It does not store your payment details or run from a server." },
    ],
  },
];

// ---------------------------------------------------------------------------
// 2) vs Bots — comparison pages. One honest table, reused across competitors.
//    The "them" column describes the server-side AIO/checkout-bot category,
//    which is accurate for every product named here. The named product is used
//    in the title/H1 (search intent) and described in prose, not invented.
// ---------------------------------------------------------------------------
const VS_ROWS: Array<[string, string, string]> = [
  ["Price", "Free to install", "Paid license, often renewed each season"],
  ["Where it runs", "Your own browser and your own login", "Datacenter servers behind paid proxies"],
  ["Proxies", "None needed", "Required, billed separately"],
  ["Built for", "Collectors who want one at retail", "Resellers buying in bulk"],
  ["Block risk", "Acts as you, in the session you opened", "Datacenter traffic gets IP-flagged"],
  ["Setup", "Add to Chrome, open the page, tap Watch", "Cook group, server, proxy list, task config"],
  ["Checkout", "You finish checkout yourself", "Auto-checkout, often against store terms"],
  ["Learning curve", "One button", "Steep — guides and a community required"],
];

function vsFaqs(name: string): Array<{ q: string; a: string }> {
  return [
    { q: `Is QuickCatch a good ${name} alternative for Pokémon?`, a: `Yes. ${name} is built for server-side checkout at scale. QuickCatch runs in your own browser for a single collector, costs nothing to install, and watches Pokémon and TCG pages so you grab one at retail.` },
    { q: `Do I need proxies or a server like ${name} uses?`, a: "No. QuickCatch runs in the tab you already have open, in your own session. There are no proxies to rent and no server to configure." },
    { q: "Will I get banned?", a: "QuickCatch acts as you, on the page you opened, and you complete checkout. It does not run from a datacenter, which is the traffic stores flag first." },
  ];
}

function vsPage(name: string, slug: string, what: string): DropPage {
  return {
    slug,
    cat: "vs Bots",
    kind: "versus",
    title: `${name} alternative for Pokémon drops — QuickCatch`,
    desc: `Looking for a ${name} alternative? QuickCatch is the free, browser-based way to catch Pokémon and TCG restocks — no server, no proxies, no monthly fee. QuickCatch vs ${name}, head to head.`,
    h1: `QuickCatch vs ${name}`,
    lede: `${what} QuickCatch goes the other way: it runs in your own browser and your own login, costs nothing to install, and watches the Pokémon or TCG page you care about so you cart it the moment it restocks.`,
    topic: "Pokémon restocks",
    comparison: { themLabel: name, rows: VS_ROWS },
    faqs: vsFaqs(name),
  };
}

const NAMED_BOTS: Array<[string, string, string]> = [
  ["Valor AIO", "quickcatch-vs-valor", "Valor is an all-in-one sneaker bot built to check out limited shoe releases at scale from datacenter servers, behind a paid license and proxies."],
  ["Cybersole", "quickcatch-vs-cybersole", "Cybersole is one of the best-known all-in-one sneaker bots, run on servers with proxies to hit Shopify and Footsite drops for resellers."],
  ["Kodai", "quickcatch-vs-kodai", "Kodai is a premium sneaker AIO bot focused on Shopify and Supreme drops, rented per season and run from servers."],
  ["Wrath", "quickcatch-vs-wrath", "Wrath is a Footsites-focused sneaker bot built for high-volume reselling from datacenter setups."],
  ["GaneshBot", "quickcatch-vs-ganeshbot", "GaneshBot is a retail checkout bot known for Amazon and big-box automation aimed at resellers buying in bulk."],
  ["Stellar AIO", "quickcatch-vs-stellar-aio", "Stellar AIO automates Amazon, Target, and other retail checkouts from servers, behind a paid license and proxy setup."],
  ["Nike Shoe Bot", "quickcatch-vs-nike-shoe-bot", "Nike Shoe Bot (NSB) is a long-running sneaker bot for Nike, Shopify, and Footsites, run by resellers on servers."],
  ["EVE AIO", "quickcatch-vs-eve-aio", "EVE AIO is an all-in-one sneaker bot covering Shopify, Footsites, and select retail sites for resellers."],
  ["Prism AIO", "quickcatch-vs-prism-aio", "Prism is a sneaker AIO bot for Shopify and Footsite drops, run from servers with proxies."],
  ["MEK AIO", "quickcatch-vs-mekaio", "MEK AIO is an all-in-one bot covering retail and sneaker sites for bulk checkout."],
  ["Balko", "quickcatch-vs-balko", "Balko is a retail bot known for Walmart and Target checkout automation aimed at resellers."],
  ["Hayha Bot", "quickcatch-vs-hayha", "Hayha Bot is a retail bot for Pokémon, collectibles, and electronics, run on servers with proxies and a paid plan."],
  ["Project Enigma", "quickcatch-vs-project-enigma", "Project Enigma is a Footsites and Shopify sneaker bot run by resellers from datacenter setups."],
  ["Adept", "quickcatch-vs-adept", "Adept is a sneaker AIO bot for Shopify and Footsites, behind a paid license and proxy lists."],
  ["Polaris", "quickcatch-vs-polaris", "Polaris is a retail and sneaker checkout bot built for resellers running tasks at scale."],
  ["Splashforce", "quickcatch-vs-splashforce", "Splashforce is a sneaker bot for Shopify drops, run from servers with proxies."],
  ["Phantom", "quickcatch-vs-phantom", "Phantom is an all-in-one sneaker bot for Shopify and Footsite releases, aimed at resellers."],
  ["AIO Bot", "quickcatch-vs-aio-bot", "AIO Bot is one of the oldest sneaker bots, server-run with proxies and a renewed license."],
  ["Soul AIO", "quickcatch-vs-soul-aio", "Soul AIO is an all-in-one sneaker bot for Shopify and Footsite drops, run from servers behind proxies."],
  ["Refract", "quickcatch-vs-refract", "Refract is a sneaker AIO bot focused on Shopify releases, rented per season and run on servers."],
  ["Tohru", "quickcatch-vs-tohru", "Tohru is a sneaker bot for Shopify and Footsites, built for resellers running tasks at scale."],
  ["Velox", "quickcatch-vs-velox", "Velox is an all-in-one sneaker bot for Shopify drops, run from datacenter setups with proxies."],
  ["Dashe", "quickcatch-vs-dashe", "Dashe is a retail checkout bot for Amazon, Walmart, and big-box drops, aimed at resellers buying in bulk."],
  ["The Kick Station", "quickcatch-vs-the-kick-station", "The Kick Station is a monitor and bot group for sneaker and retail drops, billed monthly to its members."],
  ["Estock", "quickcatch-vs-estock", "Estock is a retail checkout bot for big-box sites, run on servers by resellers buying in bulk."],
  ["Trickle", "quickcatch-vs-trickle", "Trickle is a sneaker AIO bot for Shopify and Footsite drops, run from servers with proxies."],
];

const VS_NAMED: DropPage[] = NAMED_BOTS.map(([name, slug, what]) => vsPage(name, slug, what));

const VS_CATEGORY: DropPage[] = [
  {
    slug: "quickcatch-vs-sneaker-bots",
    cat: "vs Bots",
    kind: "versus",
    title: "Pokémon Drops vs Sneaker Bots — Why a Browser Wins | QuickCatch",
    desc: "Sneaker bots run on servers and proxies and get IP-flagged on retail. QuickCatch runs in your browser, free, and catches Pokémon and TCG restocks.",
    h1: "Catching Pokémon drops without a sneaker bot",
    lede: "Sneaker bots are built for one job: check out limited shoes in bulk from datacenter servers. On Pokémon and TCG retail they stand out and get blocked. QuickCatch runs in your own browser and your own login, costs nothing to install, and watches the page so you cart it the moment it restocks.",
    topic: "Pokémon restocks",
    comparison: { themLabel: "Sneaker / AIO bots", rows: VS_ROWS },
    faqs: vsFaqs("a sneaker bot"),
  },
  {
    slug: "quickcatch-vs-cook-groups",
    cat: "vs Bots",
    kind: "versus",
    title: "Do You Need a Cook Group for Pokémon Drops? | QuickCatch",
    desc: "Cook groups charge monthly for monitors, bots, and proxies built for resellers. QuickCatch is a free browser catcher for collectors who want one at retail.",
    h1: "QuickCatch vs a cook group",
    lede: "A cook group sells access to monitors, bots, proxies, and server guides, billed monthly and aimed at resellers. QuickCatch replaces the part a collector needs: it runs in your own browser, watches the Pokémon page you opened, and carts it on the restock. No subscription, no proxies, no group required.",
    topic: "Pokémon restocks",
    comparison: { themLabel: "Cook group stack", rows: VS_ROWS },
    faqs: vsFaqs("a cook group"),
  },
  {
    slug: "quickcatch-vs-restock-monitor",
    cat: "vs Bots",
    kind: "versus",
    title: "Restock Monitor vs Auto-Cart — Catch the Drop | QuickCatch",
    desc: "A Discord restock monitor pings you, then you race everyone to the button. QuickCatch watches the page and adds it to your cart the moment it restocks.",
    h1: "QuickCatch vs a Discord restock monitor",
    lede: "A restock monitor sends a ping when stock returns, then leaves the race to you. By the time you tap the link, the page is mobbed. QuickCatch watches the page itself and adds the item to your cart the second stock flips, so you skip the part everyone else loses.",
    topic: "Pokémon restocks",
    comparison: { themLabel: "Restock monitor", rows: VS_ROWS },
    faqs: [
      { q: "What does a restock monitor do?", a: "It checks a page or feed and pings a Discord or app when stock returns. The buying is still on you, against everyone who got the same ping." },
      { q: "How is QuickCatch different?", a: "It does the next step. When the page restocks, QuickCatch opens it and adds the item to your cart, so you go straight to checkout." },
      { q: "Can I use both?", a: "Yes. Keep your monitor for awareness and arm QuickCatch on the product page so the cart step is handled the moment it comes back." },
    ],
  },
  {
    slug: "quickcatch-vs-brickseek",
    cat: "vs Bots",
    kind: "versus",
    title: "BrickSeek for Pokémon vs QuickCatch | QuickCatch",
    desc: "BrickSeek shows in-store inventory. QuickCatch watches the online product page and adds the item to your cart the moment it restocks.",
    h1: "QuickCatch vs BrickSeek",
    lede: "BrickSeek surfaces local store inventory so you know where to drive. QuickCatch handles the online drop: it watches the product page you opened and adds the item to your cart the moment it restocks, so you check out before it sells out again.",
    topic: "Pokémon restocks",
    comparison: { themLabel: "Inventory lookup", rows: VS_ROWS },
    faqs: [
      { q: "Does QuickCatch show in-store stock?", a: "No. It watches online product pages and carts the item when it restocks. Use a stock-lookup tool for in-store and QuickCatch for the online drop." },
      { q: "Which stores does it cover?", a: `It runs on ${SUPPORTED_STORES}.` },
      { q: "Is it free?", a: "Free to install and watch. Pro adds watching several items at once." },
    ],
  },
  {
    slug: "buy-pokemon-at-retail-not-resale",
    cat: "vs Bots",
    kind: "versus",
    title: "Buy Pokémon at Retail, Not Resale | QuickCatch",
    desc: "Resale marketplaces charge multiples of retail. QuickCatch watches the store page and carts the set at retail the moment it restocks.",
    h1: "Buy at retail instead of paying resale",
    lede: "Resale marketplaces exist because the set sold out before you got one. QuickCatch closes that gap: it watches the store page and adds the item to your cart at retail the moment stock returns, so you pay the sticker price instead of a reseller's markup.",
    topic: "Pokémon restocks",
    comparison: { themLabel: "Buying resale", rows: [
      ["Price", "Retail sticker", "Multiples of retail"],
      ["Where you buy", "The official store page", "A reseller marketplace"],
      ["Who you pay", "The retailer", "A flipper plus fees"],
      ["How QuickCatch helps", "Carts it the second it restocks", "—"],
    ] },
    faqs: [
      { q: "Why do sets cost so much on resale?", a: "They sell out at retail in seconds, so resellers list them higher. Catching the retail restock is how you skip the markup." },
      { q: "How does QuickCatch get me retail price?", a: "It watches the official store page and adds the item to your cart the moment it restocks, before it sells out again." },
      { q: "Is it free?", a: "Free to install and watch. Pro adds watching several items at once." },
    ],
  },
];

// ---------------------------------------------------------------------------
// 3) Stores — one page per store QuickCatch actually runs on.
// ---------------------------------------------------------------------------
function storePage(store: string, slug: string, host: string, blurb: string, faqA: string): DropPage {
  return {
    slug,
    cat: "Stores",
    kind: "store",
    title: `${store} Pokémon Restock Tracker | QuickCatch`,
    desc: `Catch ${store} Pokémon restocks. QuickCatch watches the ${host} product page and adds the item to your cart the moment it is back in stock.`,
    h1: `Catch a ${store} Pokémon restock`,
    lede: blurb,
    topic: `${store} Pokémon restocks`,
    product: { name: `${store} Pokémon drops`, store },
    faqs: [
      { q: `Does QuickCatch work on ${host}?`, a: faqA },
      { q: "Do I have to keep the page open?", a: "No. Arm Watch this drop and QuickCatch watches in the background. Keep Chrome running and it opens the page and carts the item when stock returns." },
      { q: "Is there a fee?", a: "Installing and watching is free. Pro adds watching several items at once." },
    ],
  };
}

const STORES: DropPage[] = [
  storePage("Target", "target-pokemon-restock", "target.com", "Target drops Pokémon boxes in waves and they clear out fast. QuickCatch watches the listing and adds it to your cart the moment it flips back to in stock, so you are at checkout while everyone else is still refreshing.", "Yes. QuickCatch reads the product page on target.com and adds the item to your cart when stock returns. Pick shipping or pickup and finish checkout yourself."),
  storePage("Best Buy", "bestbuy-pokemon-restock", "bestbuy.com", "Best Buy restocks Pokémon sets without much warning. QuickCatch watches the product page and adds the item to your cart the instant it is available, so you do not lose the window to a refresh.", "Yes. QuickCatch reads the product page on bestbuy.com and carts the item when stock returns. You complete checkout in your own account."),
  storePage("Sam's Club", "samsclub-pokemon-restock", "samsclub.com", "Sam's Club carries Pokémon collections at sharp prices and they sell out quickly. QuickCatch watches the listing and adds it to your cart the moment it restocks.", "Yes. QuickCatch reads the product page on samsclub.com and adds the item to your cart when it is back. A membership may be required to check out."),
  storePage("Costco", "costco-pokemon-restock", "costco.com", "Costco posts Pokémon bundles online that move fast when they land. QuickCatch watches the product page and carts the bundle the moment it restocks.", "Yes. QuickCatch reads the product page on costco.com and carts the item when stock returns. A membership may be required to check out."),
  storePage("GameStop", "gamestop-pokemon-restock", "gamestop.com", "GameStop runs Pokémon drops and exclusives that vanish in minutes. QuickCatch watches the product page and adds it to your cart the second it is back in stock.", "Yes. QuickCatch reads the product page on gamestop.com and adds the item to your cart when stock returns. You finish checkout yourself."),
  storePage("Amazon", "amazon-pokemon-restock", "amazon.com", "Amazon listings for hot Pokémon sets flip in and out of stock without warning. QuickCatch watches the product page and adds the item to your cart the moment it is buyable.", "Yes. QuickCatch reads the product page on amazon.com and adds the item to your cart when stock returns. Open the listing you want to buy from, then arm it."),
  storePage("TCGplayer", "tcgplayer-pokemon-restock", "tcgplayer.com", "TCGplayer listings for sealed product and singles move quickly when a seller restocks. QuickCatch watches the page and adds the item to your cart the moment it is back.", "Yes. QuickCatch reads the product page on tcgplayer.com and adds the item to your cart when stock returns. Open the seller listing you want, then arm it."),
];

// ---------------------------------------------------------------------------
// 4) TCG sets / products — one page per set. Unique lede per row; FAQs vary by
//    index so pages are not carbon copies. Prices only where well established.
// ---------------------------------------------------------------------------
const SET_FAQ_MID = [
  "Restocks land without warning. Arm QuickCatch before the drop and it watches around the clock so you do not have to sit on the page.",
  "Open the product page on the store you want to buy from, tap Watch this drop, and leave it. QuickCatch handles the cart step when stock returns.",
  "QuickCatch follows the page. If the store sets a one-per-customer limit, it carts one and you complete checkout.",
  "Keep Chrome running and you can close the tab. QuickCatch watches in the background and opens the page when it restocks.",
];

interface SetDef { name: string; slug: string; where: string; price?: string; blurb: string; }

function setPage(s: SetDef, i: number): DropPage {
  return {
    slug: s.slug,
    cat: "TCG sets",
    kind: "set",
    title: `${s.name} Restock | QuickCatch`,
    desc: `Catch the ${s.name} restock. QuickCatch watches the product page and adds it to your cart the moment it is back in stock.`,
    h1: `Catch the ${s.name} restock`,
    lede: s.blurb,
    topic: `${s.name} restocks`,
    product: { name: s.name, price: s.price, store: s.where },
    faqs: [
      { q: `Where does the ${s.name} restock?`, a: `${s.where}. QuickCatch works on any of those product pages — it reads price and stock and carts the item when it returns.` },
      { q: "Do I have to watch the page myself?", a: SET_FAQ_MID[i % SET_FAQ_MID.length] },
      { q: "Is QuickCatch free?", a: "Free to install and watch. Pro adds watching several items at once, which helps when a set drops across multiple stores." },
    ],
  };
}

const POKEMON_STORES = "Pokémon Center, Walmart, Target, Best Buy and Costco";
const SET_DEFS: SetDef[] = [
  { name: "Surging Sparks Elite Trainer Box", slug: "surging-sparks-restock", where: POKEMON_STORES, blurb: "Surging Sparks runs hot for its chase cards, and the Elite Trainer Box sells through fast. QuickCatch watches the product page and adds it to your cart the moment it restocks, so you grab it at retail." },
  { name: "Stellar Crown Elite Trainer Box", slug: "stellar-crown-restock", where: POKEMON_STORES, blurb: "Stellar Crown Elite Trainer Boxes clear out at every restock. QuickCatch watches the page and carts the box the second stock returns, so you are at checkout before it sells out again." },
  { name: "Shrouded Fable", slug: "shrouded-fable-restock", where: POKEMON_STORES, blurb: "Shrouded Fable is a special set with a small print feel and quick sellouts. QuickCatch watches the product page and adds it to your cart the moment it is back in stock." },
  { name: "Twilight Masquerade", slug: "twilight-masquerade-restock", where: POKEMON_STORES, blurb: "Twilight Masquerade sealed product moves fast when it restocks. QuickCatch watches the page and carts the item the instant stock flips back to available." },
  { name: "Temporal Forces", slug: "temporal-forces-restock", where: POKEMON_STORES, blurb: "Temporal Forces boxes sell through quickly on restock days. QuickCatch watches the product page and adds the item to your cart the moment it returns, so you pay retail." },
  { name: "Paradox Rift", slug: "paradox-rift-restock", where: POKEMON_STORES, blurb: "Paradox Rift sealed product still draws collectors and restocks vanish fast. QuickCatch watches the page and carts it the second it is back in stock." },
  { name: "Obsidian Flames", slug: "obsidian-flames-restock", where: POKEMON_STORES, blurb: "Obsidian Flames is a chase-card favorite that sells out when it restocks. QuickCatch watches the product page and adds it to your cart the moment stock returns." },
  { name: "Paldea Evolved", slug: "paldea-evolved-restock", where: POKEMON_STORES, blurb: "Paldea Evolved sealed product is still in demand and restocks clear quickly. QuickCatch watches the page and carts the item the instant it is back in stock." },
  { name: "Paldean Fates", slug: "paldean-fates-restock", where: POKEMON_STORES, blurb: "Paldean Fates is a shiny-heavy special set, and its boxes and tins sell out fast. QuickCatch watches the product page and adds it to your cart the moment it restocks." },
  { name: "Crown Zenith", slug: "crown-zenith-restock", where: POKEMON_STORES, blurb: "Crown Zenith stays popular for its Galarian Gallery cards, and restocks go quickly. QuickCatch watches the page and carts it the second stock returns." },
  { name: "Journey Together", slug: "journey-together-restock", where: POKEMON_STORES, blurb: "Journey Together sealed product sells through fast on restock. QuickCatch watches the product page and adds the item to your cart the moment it is back in stock." },
  { name: "Destined Rivals", slug: "destined-rivals-restock", where: POKEMON_STORES, blurb: "Destined Rivals draws strong demand and its boxes clear quickly. QuickCatch watches the page and carts the item the instant it restocks." },
  { name: "Black Bolt", slug: "black-bolt-restock", where: POKEMON_STORES, blurb: "Black Bolt is a special-set release that sells out at every wave. QuickCatch watches the product page and adds it to your cart the moment stock returns." },
  { name: "White Flare", slug: "white-flare-restock", where: POKEMON_STORES, blurb: "White Flare runs hot alongside its counterpart set and restocks vanish fast. QuickCatch watches the page and carts the item the second it is back in stock." },
  { name: "Prismatic Evolutions Booster Bundle", slug: "prismatic-evolutions-booster-bundle-restock", where: "Pokémon Center, Walmart, Target", blurb: "The Prismatic Evolutions Booster Bundle is the cheapest sealed entry into the set, which is why it sells out first. QuickCatch watches the page and adds it to your cart the moment it restocks." },
  { name: "Prismatic Evolutions Super Premium Collection", slug: "prismatic-evolutions-spc-restock", where: "Pokémon Center, Best Buy", blurb: "The Prismatic Evolutions Super Premium Collection is one of the hardest pieces of the set to land at retail. QuickCatch watches the product page and carts it the instant stock returns." },
  { name: "151 Booster Bundle", slug: "151-booster-bundle-restock", where: "Pokémon Center, Walmart, Target", blurb: "The Scarlet & Violet 151 Booster Bundle restocks in waves and clears fast every time. QuickCatch watches the page and adds it to your cart the moment it is back in stock." },
  { name: "151 Elite Trainer Box", slug: "151-elite-trainer-box-restock", where: "Pokémon Center, Walmart, Target, Best Buy", price: "$49.99 retail", blurb: "The 151 Elite Trainer Box stays in demand long after release and restocks vanish quickly. QuickCatch watches the product page and carts it the second stock returns, so you pay around retail instead of a reseller premium." },
  { name: "Charizard ex Super Premium Collection", slug: "charizard-ex-super-premium-collection-restock", where: "Pokémon Center, Best Buy, GameStop", blurb: "The Charizard ex Super Premium Collection is a perennial sellout thanks to the Charizard pull. QuickCatch watches the page and adds it to your cart the moment it restocks." },
  { name: "Pokémon Booster Box", slug: "pokemon-booster-box-restock", where: POKEMON_STORES, blurb: "Sealed booster boxes are the format collectors and investors fight over, and they sell out fast at retail. QuickCatch watches the product page and carts the box the moment stock returns." },
  { name: "Pokémon Elite Trainer Box", slug: "pokemon-elite-trainer-box-restock", where: POKEMON_STORES, blurb: "Elite Trainer Boxes are the most-watched sealed product for every set, and restocks clear in minutes. QuickCatch watches the page and adds the ETB to your cart the instant it is back." },
  { name: "Pokémon Booster Bundle", slug: "pokemon-booster-bundle-restock", where: POKEMON_STORES, blurb: "Booster Bundles are the low-cost way into a set, which is why they sell out first. QuickCatch watches the product page and carts the bundle the moment it restocks." },
  { name: "Pokémon Ultra-Premium Collection", slug: "pokemon-ultra-premium-collection-restock", where: "Pokémon Center, Walmart, Best Buy", blurb: "Ultra-Premium Collections are the top-tier sealed product for a set and the hardest to land at retail. QuickCatch watches the page and adds it to your cart the second stock returns." },
  { name: "Pokémon Center exclusive", slug: "pokemon-center-exclusive-restock", where: "Pokémon Center", blurb: "Pokémon Center exclusives, from promo bundles to special collections, sell out within minutes of going live. QuickCatch watches the product page and carts the item the moment it restocks." },
  { name: "Pokémon Tin", slug: "pokemon-tin-restock", where: POKEMON_STORES, blurb: "Collector tins and mini tins restock in waves and clear quickly, especially when they carry a chase promo. QuickCatch watches the page and adds the tin to your cart the moment it is back in stock." },
  { name: "Pokémon Build & Battle Box", slug: "pokemon-build-battle-box-restock", where: POKEMON_STORES, blurb: "Build & Battle boxes sell out fast around prerelease and restock windows. QuickCatch watches the product page and carts it the second stock returns." },
  // Broader TCG intent — funnels into the same extension.
  { name: "One Piece Card Game booster box", slug: "one-piece-card-game-restock", where: "Walmart, Target, GameStop, Amazon and TCGplayer", blurb: "One Piece Card Game booster boxes sell out the moment they restock, and resale climbs fast. QuickCatch watches the product page and adds the box to your cart the second stock returns." },
  { name: "Disney Lorcana", slug: "disney-lorcana-restock", where: "Walmart, Target, Best Buy, GameStop and Amazon", blurb: "Disney Lorcana booster boxes, gift sets, and Illumineer's Troves clear out fast on restock. QuickCatch watches the page and carts the item the moment it is back in stock." },
  { name: "Magic: The Gathering booster box", slug: "magic-the-gathering-restock", where: "Walmart, Target, Best Buy, Amazon and TCGplayer", blurb: "The most popular Magic: The Gathering sets sell through quickly at retail and restock without notice. QuickCatch watches the product page and adds the box to your cart the moment stock returns." },
  { name: "Yu-Gi-Oh! sealed product", slug: "yugioh-restock", where: "Walmart, Target, GameStop, Amazon and TCGplayer", blurb: "Yu-Gi-Oh! boxes, tins, and structure decks move fast when they restock. QuickCatch watches the page and carts the item the second it is back in stock." },
  { name: "Surging Sparks Booster Bundle", slug: "surging-sparks-booster-bundle-restock", where: "Pokémon Center, Walmart, Target", blurb: "The Surging Sparks Booster Bundle is the cheapest sealed way into the set, so it clears out first on every restock. QuickCatch watches the page and adds it to your cart the moment stock returns." },
  { name: "Stellar Crown Booster Bundle", slug: "stellar-crown-booster-bundle-restock", where: "Pokémon Center, Walmart, Target", blurb: "Stellar Crown Booster Bundles sell through fast whenever they restock. QuickCatch watches the product page and carts the bundle the second it is back in stock." },
  { name: "Pokémon Premium Collection", slug: "pokemon-premium-collection-restock", where: POKEMON_STORES, blurb: "Premium Collections pair a chase promo with sealed packs, which makes them a fast sellout. QuickCatch watches the product page and adds it to your cart the moment it restocks." },
  { name: "Pokémon Collector Chest", slug: "pokemon-collector-chest-restock", where: POKEMON_STORES, blurb: "The Pokémon Collector Chest is a seasonal favorite that disappears quickly once it lands. QuickCatch watches the page and carts it the instant stock returns." },
  { name: "Pokémon Mini Tin", slug: "pokemon-mini-tin-restock", where: POKEMON_STORES, blurb: "Mini Tins move in bulk and sell out fast, especially when collectors are chasing a full display. QuickCatch watches the product page and adds the tin to your cart the moment it is back." },
  { name: "Pokémon 3-Pack Blister", slug: "pokemon-3-pack-blister-restock", where: POKEMON_STORES, blurb: "3-Pack Blisters carry a promo card and clear out quickly at every restock. QuickCatch watches the page and carts the blister the second stock returns." },
  { name: "Pokémon Special Collection", slug: "pokemon-special-collection-restock", where: POKEMON_STORES, blurb: "Special Collections bundle a figure or promo with packs and sell out within minutes. QuickCatch watches the product page and adds it to your cart the moment it restocks." },
  { name: "Mega Evolution set", slug: "mega-evolution-restock", where: POKEMON_STORES, blurb: "The Mega Evolution era is one of the most anticipated Pokémon releases in years, and demand is heavy from day one. QuickCatch watches the product page and carts the set the moment it is back in stock." },
  { name: "Lorcana Illumineer's Trove", slug: "lorcana-illumineers-trove-restock", where: "Walmart, Target, Best Buy, GameStop and Amazon", blurb: "The Disney Lorcana Illumineer's Trove is a top sealed product and a quick sellout each chapter. QuickCatch watches the product page and adds it to your cart the moment it restocks." },
  { name: "Magic: The Gathering Final Fantasy", slug: "mtg-final-fantasy-restock", where: "Walmart, Target, Best Buy, Amazon and TCGplayer", blurb: "The Magic: The Gathering Final Fantasy set is one of the highest-demand crossovers ever, and sealed product vanishes fast. QuickCatch watches the page and carts the box the second stock returns." },
  { name: "MTG Secret Lair drop", slug: "mtg-secret-lair-restock", where: "the official store page", blurb: "Magic: The Gathering Secret Lair drops are limited-window releases that sell out before most fans reach checkout. QuickCatch watches the drop page and adds it to your cart the moment it goes live." },
  { name: "One Piece booster box", slug: "one-piece-booster-box-restock", where: "Walmart, Target, GameStop, Amazon and TCGplayer", blurb: "One Piece Card Game booster boxes are some of the fastest sellouts in the hobby right now. QuickCatch watches the product page and carts the box the moment it restocks." },
  { name: "Twilight Masquerade Booster Box", slug: "twilight-masquerade-booster-box-restock", where: POKEMON_STORES, blurb: "Twilight Masquerade booster boxes give the best odds at the set's chase cards, so they clear out fast on restock. QuickCatch watches the product page and adds the box to your cart the moment stock returns." },
  { name: "Temporal Forces Booster Box", slug: "temporal-forces-booster-box-restock", where: POKEMON_STORES, blurb: "Temporal Forces booster boxes are still in demand for their hits, and restocks vanish quickly. QuickCatch watches the page and carts the box the second it is back in stock." },
  { name: "Stellar Crown Booster Box", slug: "stellar-crown-booster-box-restock", where: POKEMON_STORES, blurb: "Stellar Crown booster boxes sell through fast every time they restock. QuickCatch watches the product page and adds the box to your cart the moment it returns, so you pay retail." },
  { name: "Surging Sparks Booster Box", slug: "surging-sparks-booster-box-restock", where: POKEMON_STORES, blurb: "Surging Sparks booster boxes run hot for their chase cards and clear out on every restock. QuickCatch watches the page and carts the box the instant stock flips back to available." },
  { name: "Obsidian Flames Booster Box", slug: "obsidian-flames-booster-box-restock", where: POKEMON_STORES, blurb: "Obsidian Flames booster boxes still draw collectors and investors, so restocks go quickly. QuickCatch watches the product page and adds the box to your cart the moment it is back." },
  { name: "Paradox Rift Booster Box", slug: "paradox-rift-booster-box-restock", where: POKEMON_STORES, blurb: "Paradox Rift booster boxes remain a chase for the set's pulls, and restocks sell out fast. QuickCatch watches the page and carts the box the second stock returns." },
  { name: "Paldea Evolved Booster Box", slug: "paldea-evolved-booster-box-restock", where: POKEMON_STORES, blurb: "Paldea Evolved booster boxes are still wanted for their hits, and restocks clear quickly. QuickCatch watches the product page and adds the box to your cart the moment it restocks." },
  { name: "Pokémon Surprise Box", slug: "pokemon-surprise-box-restock", where: POKEMON_STORES, blurb: "The Pokémon Surprise Box bundles a stack of sealed product at a sharp price, which makes it a fast holiday sellout. QuickCatch watches the page and carts it the moment it restocks." },
  { name: "Pokémon Holiday Calendar", slug: "pokemon-holiday-calendar-restock", where: POKEMON_STORES, blurb: "The Pokémon holiday advent calendar lands once a year and sells out within days. QuickCatch watches the product page and adds it to your cart the moment stock returns." },
  { name: "Pokémon Battle Academy", slug: "pokemon-battle-academy-restock", where: POKEMON_STORES, blurb: "Pokémon Battle Academy is the go-to gift box for new players and restocks fast around the holidays. QuickCatch watches the page and carts it the second it is back in stock." },
  { name: "Pokémon Trick or Trade", slug: "pokemon-trick-or-trade-restock", where: POKEMON_STORES, blurb: "The Pokémon Trick or Trade Halloween booster bundle lands once a year and sells out fast. QuickCatch watches the product page and adds it to your cart the moment it restocks." },
  { name: "Scarlet & Violet Base Elite Trainer Box", slug: "scarlet-violet-base-etb-restock", where: POKEMON_STORES, blurb: "The Scarlet & Violet base Elite Trainer Box is a staple that restocks in waves and clears fast. QuickCatch watches the page and carts the ETB the second stock returns." },
  { name: "Pokémon Paldea Adventure Chest", slug: "pokemon-paldea-adventure-chest-restock", where: POKEMON_STORES, blurb: "The Paldea Adventure Chest packs sealed product and accessories into a sharp-value box that sells out quickly. QuickCatch watches the page and adds it to your cart the moment it restocks." },
  { name: "Pokémon ex Deluxe Battle Deck", slug: "pokemon-ex-deluxe-battle-deck-restock", where: POKEMON_STORES, blurb: "Pokémon ex Deluxe Battle Decks are popular ready-to-play products that restock fast. QuickCatch watches the product page and carts it the second it is back in stock." },
  { name: "Pokémon V Battle Deck", slug: "pokemon-v-battle-deck-restock", where: POKEMON_STORES, blurb: "Pokémon V Battle Decks are a cheap entry that moves quickly on restock. QuickCatch watches the page and adds it to your cart the moment stock returns." },
  { name: "Charizard ex Premium Collection", slug: "charizard-ex-premium-collection-restock", where: "Pokémon Center, Walmart, Best Buy, GameStop", blurb: "The Charizard ex Premium Collection sells out on the Charizard pull alone. QuickCatch watches the product page and adds it to your cart the moment it restocks." },
  { name: "Paldean Fates Premium Collection", slug: "paldean-fates-premium-collection-restock", where: POKEMON_STORES, blurb: "Paldean Fates Premium Collections are a shiny-set favorite and clear out fast. QuickCatch watches the page and carts it the second it is back in stock." },
  { name: "Pokémon GO Elite Trainer Box", slug: "pokemon-go-etb-restock", where: POKEMON_STORES, blurb: "The Pokémon GO Elite Trainer Box stays in demand for its crossover cards and restocks vanish quickly. QuickCatch watches the page and adds it to your cart the moment it returns." },
  { name: "Crown Zenith Elite Trainer Box", slug: "crown-zenith-etb-restock", where: POKEMON_STORES, blurb: "The Crown Zenith Elite Trainer Box remains a top seller for its Galarian Gallery cards. QuickCatch watches the product page and carts the ETB the second stock returns." },
  { name: "Pokémon Booster Box Case", slug: "pokemon-booster-box-case-restock", where: "Pokémon Center, Costco, Sam's Club", blurb: "A booster box case (multiple sealed boxes) is the bulk buy distributors and serious collectors chase. QuickCatch watches the product page and adds it to your cart the moment it restocks." },
  // 2026 Mega Evolution era waves — pre-seeded ahead of release so they rank for
  // "<set> restock" before the drop. Dates: Pitch Black Jul 17, Storm Emerald
  // Sep 1, 30th Celebration Sep 18 (see launch/drop-calendar-distribution.md).
  { name: "Pitch Black Elite Trainer Box", slug: "pitch-black-restock", where: POKEMON_STORES, blurb: "Pitch Black (ME05) drops July 17, 2026 — a dark-themed Mega Evolution set whose Elite Trainer Box will sell out the day it lands. QuickCatch watches the product page and adds it to your cart the moment it restocks, so you grab it at retail instead of resale." },
  { name: "Storm Emerald Elite Trainer Box", slug: "storm-emerald-restock", where: POKEMON_STORES, blurb: "Storm Emerald (ME06) lands September 1, 2026 in the Mega Evolution era, and the Elite Trainer Box will clear out at every restock. QuickCatch watches the page and carts the box the second stock returns, so you are at checkout before it sells out again." },
  { name: "30th Celebration", slug: "30th-celebration-restock", where: POKEMON_STORES, blurb: "The 30th Celebration set (September 18, 2026) is the all-foil anniversary release — the biggest, most chased product of the year, gone in seconds and restocking for months. QuickCatch watches the product page and adds it to your cart the instant it is back, so you pay retail, not anniversary-hype resale." },
];

const SETS: DropPage[] = SET_DEFS.map(setPage);

// ---------------------------------------------------------------------------
// 5) Guides — sniping / how-to / concept pages (hand-written, evergreen).
// ---------------------------------------------------------------------------
function guide(slug: string, title: string, desc: string, h1: string, lede: string, topic: string, faqs: Array<{ q: string; a: string }>): DropPage {
  return { slug, cat: "Guides", kind: "guide", title, desc, h1, lede, topic, faqs };
}

const GUIDES: DropPage[] = [
  guide(
    "how-to-snipe-pokemon-drops",
    "How to Snipe a Pokémon Drop | QuickCatch",
    "Sniping a Pokémon drop means catching the restock the instant it lands. Here is how to do it in your own browser, free, with QuickCatch.",
    "How to snipe a Pokémon drop",
    "Sniping a drop means being on the buy button the instant stock returns, before the page fills with refreshers. You do not need a server or a cook group to do it. Install QuickCatch, open the product page before the drop, and let it watch the page and add the item to your cart the moment it restocks.",
    "Pokémon drops",
    [
      { q: "What does sniping a drop mean?", a: "Catching the restock the moment it happens, instead of finding out after it sold out. The win is in the seconds right after stock returns." },
      { q: "Do I need a bot?", a: "No. QuickCatch runs in your own browser and your own session, watches the page, and carts the item on the restock. No server, no proxies." },
      { q: "How early should I arm it?", a: "Arm it before the drop window. QuickCatch watches in the background, so earlier is better and there is no cost to leaving it running." },
    ],
  ),
  guide(
    "what-is-a-restock-bot",
    "What Is a Restock Bot? (And a Safer Option) | QuickCatch",
    "A restock bot watches stores and auto-buys when stock returns. Here is how they work, why they get blocked, and a browser-based alternative.",
    "What is a restock bot?",
    "A restock bot is software that watches a store for stock and tries to check out the moment it returns. Most run from datacenter servers behind proxies, which is exactly the traffic stores detect and block. QuickCatch does the same watch-and-cart job from inside your own browser, in your own session, so it reaches the pages a server cannot.",
    "Pokémon restocks",
    [
      { q: "How does a restock bot work?", a: "It polls a page or feed for stock, then fires a checkout when the item returns. Server-side bots add proxies to spread that traffic across many IPs." },
      { q: "Why do they get blocked?", a: "Stores flag datacenter traffic and automated checkout patterns. A bot running from a server stands out from a normal shopper." },
      { q: "What does QuickCatch do instead?", a: "It runs in your browser, in your logged-in session, on the page you opened. It watches for the restock and adds the item to your cart, and you complete checkout." },
    ],
  ),
  guide(
    "how-to-buy-pokemon-cards-at-retail",
    "How to Buy Pokémon Cards at Retail Price | QuickCatch",
    "Hot Pokémon sets sell out before you reach checkout. Here is how to land them at retail instead of paying resale, using QuickCatch.",
    "How to buy Pokémon cards at retail",
    "The sets worth buying sell out in seconds, which pushes everyone to resale at a markup. The way around it is to be at checkout the instant the store restocks. QuickCatch watches the product page and adds the item to your cart the moment stock returns, so you pay the retail price instead of a reseller's.",
    "Pokémon restocks",
    [
      { q: "Why is retail so hard to get?", a: "Demand far outruns supply at launch and on restocks, so the item is gone before most shoppers reach the buy button." },
      { q: "How does QuickCatch help?", a: "It watches the official store page and carts the item the moment it restocks, so you reach checkout before it sells out again." },
      { q: "Is it free?", a: "Free to install and watch. Pro adds watching several items at once." },
    ],
  ),
  guide(
    "how-to-beat-scalpers-pokemon",
    "How to Beat Scalpers on Pokémon Drops | QuickCatch",
    "Scalpers win by being first to the cart. QuickCatch watches the page and carts the set the moment it restocks, so collectors get one at retail.",
    "How to beat scalpers on a Pokémon drop",
    "Scalpers win by being at the cart first, then relisting at a markup. The counter is to be at the cart first yourself. QuickCatch watches the product page and adds the item to your cart the moment it restocks, so a collector gets one at retail instead of feeding the resale market.",
    "Pokémon restocks",
    [
      { q: "How do scalpers buy so fast?", a: "Many run server-side bots and monitors. Their edge is speed at the buy button, not access you cannot get." },
      { q: "How does a collector compete?", a: "Match the speed at the cart step. QuickCatch carts the item the instant it restocks, from your own browser, so you are not out-clicked." },
      { q: "Does QuickCatch buy in bulk?", a: "No. It carts the item on the page you opened and follows the store's per-customer limit. It is built for one collector, not a reseller." },
    ],
  ),
  guide(
    "restock-alerts-vs-auto-cart",
    "Restock Alerts vs Auto-Cart — What Actually Works | QuickCatch",
    "Restock alerts tell you it is back, then leave the race to you. Auto-cart does the next step. Here is the difference and when each one matters.",
    "Restock alerts vs auto-cart",
    "A restock alert tells you the item is back and stops there, which means you join the race late. Auto-cart does the next step for you. QuickCatch watches the page and adds the item to your cart the moment stock returns, so the alert turns into a cart instead of a missed window.",
    "Pokémon restocks",
    [
      { q: "Are restock alerts useless?", a: "No. They are good for awareness. The gap is the seconds after the alert, when everyone races the same link. That is the part QuickCatch handles." },
      { q: "Can I use alerts and QuickCatch together?", a: "Yes. Keep your alerts and arm QuickCatch on the product page so the cart step is automatic when stock returns." },
      { q: "Does it cost anything?", a: "Free to install and watch. Pro adds watching several items at once." },
    ],
  ),
  guide(
    "how-to-get-pokemon-cards-without-a-bot",
    "How to Get Pokémon Cards Without a Bot | QuickCatch",
    "You do not need a server bot or a cook group to land a Pokémon drop. Here is the browser-based way to catch restocks with QuickCatch.",
    "How to catch a drop without a bot",
    "Server bots are expensive, technical, and get blocked on retail. You do not need one. QuickCatch runs in your own browser, watches the product page you opened, and adds the item to your cart the moment it restocks. That is the whole setup: add the extension and tap Watch this drop.",
    "Pokémon drops",
    [
      { q: "What is the catch with server bots?", a: "They cost a license plus proxies, take real setup, and get IP-flagged on retail sites. For a single collector, that is a lot of overhead." },
      { q: "What does QuickCatch need?", a: "Chrome and one click. Open the product page, tap Watch this drop, and keep Chrome running. There is nothing to configure." },
      { q: "Will it get me banned?", a: "It acts as you, on the page you opened, and you complete checkout. It does not run from a datacenter, which is the traffic stores flag." },
    ],
  ),
  guide(
    "pokemon-drop-checklist",
    "Pokémon Drop Checklist — Be Ready Before It Lands | QuickCatch",
    "A short checklist to be ready for a Pokémon drop: account logged in, payment saved, page open, and QuickCatch armed.",
    "Your Pokémon drop checklist",
    "Most missed drops come down to small things: logged out, payment not saved, on the wrong page. Run this checklist before the window, then arm QuickCatch so the cart step is handled the moment stock returns.",
    "Pokémon drops",
    [
      { q: "What should I do before a drop?", a: "Log into the store, save your payment and address, open the exact product page, and arm QuickCatch on it. Keep Chrome running." },
      { q: "Does QuickCatch replace the checklist?", a: "It handles the cart step. You still want to be logged in with payment saved so checkout is fast once it carts the item." },
      { q: "How early should I set up?", a: "Before the drop window opens. QuickCatch watches in the background, so there is no downside to arming it early." },
    ],
  ),
  guide(
    "how-to-watch-multiple-pokemon-drops",
    "How to Watch Multiple Pokémon Drops at Once | QuickCatch",
    "A set often drops across several stores at once. Here is how to watch multiple product pages so you catch whichever restocks first.",
    "How to watch multiple drops at once",
    "A hot set usually restocks across several stores in the same window, and you cannot watch them all by hand. Arm QuickCatch on each product page and it watches them in the background at the same time, then carts whichever one restocks first. Pro raises how many you can run at once.",
    "Pokémon restocks",
    [
      { q: "Can QuickCatch watch more than one page?", a: "Yes. Arm it on each product page you care about. It watches them in the background and carts the first one to restock." },
      { q: "What does Pro add?", a: "Pro raises the number of items you can watch at once, which helps when a set drops across Pokémon Center, Walmart, and Target together." },
      { q: "Do the tabs need to stay open?", a: "No. Keep Chrome running and QuickCatch handles the watching in the background." },
    ],
  ),
  guide(
    "black-friday-pokemon-restock",
    "Black Friday & Cyber Week Pokémon Restocks | QuickCatch",
    "Black Friday brings the year's heaviest Pokémon restocks and the fastest sellouts. QuickCatch watches the page and carts the set the moment it is back.",
    "Catch Black Friday Pokémon restocks",
    "Black Friday and Cyber Week bring the heaviest Pokémon restocks of the year, and the deals sell out in seconds. QuickCatch watches the product pages you care about and adds the item to your cart the moment it restocks, so a doorbuster ends up in your cart instead of gone.",
    "Black Friday Pokémon restocks",
    [
      { q: "Why are holiday restocks so hard?", a: "Stores restock heavily and price aggressively, so traffic spikes and items clear in seconds. Speed at the cart is everything." },
      { q: "How does QuickCatch help on Black Friday?", a: "Arm it on each deal page ahead of time. It watches in the background and carts whichever one restocks first." },
      { q: "Is it free?", a: "Free to install and watch. Pro adds watching several items at once, which is useful during a heavy restock week." },
    ],
  ),
  guide(
    "how-quickcatch-works",
    "How QuickCatch Works — Watch, Catch, Cart | QuickCatch",
    "QuickCatch watches a product page in the background and adds the item to your cart the moment it restocks. Here is exactly how it works.",
    "How QuickCatch works",
    "QuickCatch is a Chrome extension that watches a product page for you. You open the page and tap Watch this drop. It then checks the page in the background on a short interval, and when stock returns it opens the page, adds the item to your cart, and sends you a notification. You complete checkout. Everything runs in your own browser and your own session.",
    "Pokémon restocks",
    [
      { q: "Does it run when the tab is closed?", a: "Yes. Once armed, QuickCatch watches in the background. Keep Chrome running and you can close the tab." },
      { q: "Does it store my payment details?", a: "No. It adds the item to your cart and you complete checkout in your own account. It does not handle payment." },
      { q: "Which stores does it support?", a: `It runs on ${SUPPORTED_STORES}.` },
    ],
  ),
  guide(
    "is-a-pokemon-bot-worth-it",
    "Is a Pokémon Bot Worth It? | QuickCatch",
    "Server bots cost a license plus proxies and get blocked on retail. For a single collector, a free browser catcher does the job. Here is the math.",
    "Is a Pokémon bot worth it?",
    "For a reseller running hundreds of checkouts, a server bot can pay for itself. For a collector who wants one set at retail, the license, the proxies, and the setup are overhead you do not need. QuickCatch does the watch-and-cart job from your own browser for free, which is the part a collector actually needs.",
    "Pokémon restocks",
    [
      { q: "When is a server bot worth it?", a: "When you are buying in volume to resell and can absorb the license and proxy costs. That is a reseller's tool, not a collector's." },
      { q: "What does a collector need instead?", a: "Speed at the cart for one item. QuickCatch carts the item the moment it restocks, from your browser, with no recurring cost." },
      { q: "Is QuickCatch really free?", a: "Installing and watching is free. Pro adds watching several items at once if you want it." },
    ],
  ),
  guide(
    "pokemon-2026-set-watch-list",
    "Pokémon 2026 Drops — Build Your Watch List | QuickCatch",
    "2026 is the 30th anniversary year, with the biggest Pokémon drops yet. Build a watch list and let QuickCatch cart each set when it restocks.",
    "Build your 2026 Pokémon watch list",
    "2026 is the 30th anniversary year, and the releases are the most fought-over yet. The play is to build a watch list now: open each product page you care about and arm QuickCatch on it. It watches every page in the background and carts whichever restocks first, so the anniversary sets land in your collection at retail.",
    "Pokémon 2026 drops",
    [
      { q: "Which 2026 sets should I watch?", a: "Open the product page for any anniversary set, special collection, or ETB on your store of choice and arm QuickCatch. It works on any page that shows price and stock." },
      { q: "How do I track several at once?", a: "Arm QuickCatch on each page. It watches them all in the background and carts the first to restock. Pro raises how many you can run." },
      { q: "Is it free?", a: "Free to install and watch. Pro adds watching several items at once." },
    ],
  ),
  guide(
    "why-pokemon-cards-sell-out-so-fast",
    "Why Pokémon Cards Sell Out So Fast | QuickCatch",
    "Demand outruns supply, resellers buy in bulk, and restocks land without notice. Here is why sets vanish in seconds and how to catch the next one.",
    "Why Pokémon cards sell out so fast",
    "Three things stack up: demand outruns the print run, resellers buy in bulk to flip, and restocks land without warning. The result is a set that clears in seconds. You cannot fix supply, but you can be at the cart first. QuickCatch watches the product page and adds the item to your cart the moment it restocks.",
    "Pokémon restocks",
    [
      { q: "Is it really resellers buying it all?", a: "Resellers take a chunk, but raw demand for the popular sets is the bigger driver. Either way, speed at the cart is what decides who gets one." },
      { q: "Will restocks fix it?", a: "Restocks help, but they sell out as fast as launches. The edge is being on the buy button the instant stock returns, which is what QuickCatch does." },
      { q: "Is QuickCatch free?", a: "Free to install and watch. Pro adds watching several items at once." },
    ],
  ),
  guide(
    "how-to-set-up-pokemon-restock-alerts",
    "How to Set Up Pokémon Restock Alerts | QuickCatch",
    "Set up restock alerts the right way, then add the step that wins the drop: QuickCatch carts the item the moment stock returns.",
    "How to set up Pokémon restock alerts",
    "Restock alerts are worth setting up, but an alert only tells you the race started. To win it, you want the cart step handled too. Set your alerts, then open the product page and arm QuickCatch on it. When stock returns, QuickCatch adds the item to your cart while everyone else is still reading the alert.",
    "Pokémon restocks",
    [
      { q: "Where do I get restock alerts?", a: "Store apps, Discord monitors, and stock-tracking sites all offer them. They are good for awareness of when a drop is coming." },
      { q: "Why pair them with QuickCatch?", a: "An alert leaves the buying to you, against everyone who got the same ping. QuickCatch carts the item automatically the moment it restocks." },
      { q: "Is it free?", a: "Free to install and watch. Pro adds watching several items at once." },
    ],
  ),
  guide(
    "pokemon-presale-vs-restock",
    "Pokémon Presale vs Restock — Which to Chase | QuickCatch",
    "Presales sell future stock; restocks return sold-out stock. Here is which to chase for each set and how QuickCatch helps with both.",
    "Pokémon presale vs restock",
    "A presale sells stock before release, so you reserve a copy early. A restock returns a set that already sold out. Both move fast. QuickCatch helps with each: arm it on the presale page so it carts the item the moment the listing opens, or on a sold-out page so it carts the item the moment stock returns.",
    "Pokémon drops",
    [
      { q: "Should I chase the presale or wait for a restock?", a: "Presale is the surer bet for a guaranteed copy. Restocks are the fallback once a set sells out. QuickCatch works on either page." },
      { q: "Can QuickCatch catch a presale going live?", a: "Yes. Arm it on the product page and it adds the item to your cart the moment the listing flips to buyable." },
      { q: "Is it free?", a: "Free to install and watch. Pro adds watching several items at once." },
    ],
  ),
  guide(
    "how-to-cop-pokemon-center-drops",
    "How to Cop Pokémon Center Drops | QuickCatch",
    "Pokémon Center drops sell out in minutes. Here is how to be ready and let QuickCatch cart the item the moment it restocks.",
    "How to cop a Pokémon Center drop",
    "Pokémon Center is the hardest store to land a drop on, because the exclusives go fast and demand is global. Get set up before the window: log in, save payment, open the product page, and arm QuickCatch. When stock returns, it opens the page and adds the item to your cart, so you go straight to checkout.",
    "Pokémon Center restocks",
    [
      { q: "Why is Pokémon Center so hard?", a: "Exclusives and the most-wanted sets land there first, so demand is highest and stock clears in minutes." },
      { q: "How does QuickCatch help on Pokémon Center?", a: "Arm it on the product page ahead of the drop. It watches in the background and carts the item the moment stock returns." },
      { q: "Will it flag my account?", a: "It acts as you, in your own session, on the page you opened, and you complete checkout. It does not run from a server." },
    ],
  ),
];

// ---------------------------------------------------------------------------
// 6) Combos — set × store long-tail ("{set} restock at {store}"). High-intent
//    and template-friendly, so they localize cleanly too. Only stores the
//    extension runs on.
// ---------------------------------------------------------------------------
const COMBO_SETS: Array<[string, string]> = [
  ["Prismatic Evolutions", "prismatic-evolutions"],
  ["Scarlet & Violet 151", "151"],
  ["Surging Sparks", "surging-sparks"],
  ["Stellar Crown", "stellar-crown"],
  ["Destined Rivals", "destined-rivals"],
  ["Mega Evolution", "mega-evolution"],
  ["Journey Together", "journey-together"],
  ["Paldean Fates", "paldean-fates"],
  ["Crown Zenith", "crown-zenith"],
  ["Black Bolt", "black-bolt"],
  ["Twilight Masquerade", "twilight-masquerade"],
  ["White Flare", "white-flare"],
];
const COMBO_STORES: Array<[string, string]> = [
  ["Pokémon Center", "pokemon-center"],
  ["Walmart", "walmart"],
  ["Target", "target"],
  ["Best Buy", "best-buy"],
  ["GameStop", "gamestop"],
  ["Sam's Club", "sams-club"],
  ["Amazon", "amazon"],
  ["Costco", "costco"],
];

function comboPage(name: string, setSlug: string, store: string, storeSlug: string): DropPage {
  return {
    slug: `${setSlug}-restock-${storeSlug}`,
    cat: "TCG sets",
    kind: "combo",
    combo: { name, store },
    title: `${name} Restock at ${store} | QuickCatch`,
    desc: `Catch the ${name} restock at ${store}. QuickCatch watches the ${store} page and adds it to your cart the moment it is back in stock.`,
    h1: `Catch the ${name} restock at ${store}`,
    lede: `When ${name} restocks at ${store}, it sells out fast. QuickCatch watches the ${store} product page and adds it to your cart the moment stock returns, so you pay retail instead of a reseller's markup.`,
    topic: name,
    product: { name, store },
    faqs: [
      { q: `When does ${name} restock at ${store}?`, a: `Restocks land without warning. Arm QuickCatch on the ${store} product page and it watches in the background until stock returns.` },
      { q: `Does QuickCatch work on ${store}?`, a: `Yes. It reads the ${store} product page and adds ${name} to your cart when it is back. You complete checkout yourself.` },
      { q: "Is it free?", a: "Free to install and watch. Pro adds watching several items at once." },
    ],
  };
}

const COMBOS: DropPage[] = COMBO_SETS.flatMap(([name, setSlug]) =>
  COMBO_STORES.map(([store, storeSlug]) => comboPage(name, setSlug, store, storeSlug))
);

// ---------------------------------------------------------------------------
// 7) Glossary — "what is X" definition pages. The lede is a 40-60 word answer
//    block (AI engines extract these for citations). English, cat Guides.
// ---------------------------------------------------------------------------
interface GlossDef { slug: string; term: string; desc: string; def: string; faqs: Array<{ q: string; a: string }>; }

function glossaryPage(g: GlossDef): DropPage {
  return {
    slug: g.slug, cat: "Guides", kind: "glossary", term: g.term,
    title: `What is ${g.term}? | QuickCatch`,
    desc: g.desc,
    h1: `What is ${g.term}?`,
    lede: g.def,
    topic: "Pokémon",
    faqs: g.faqs,
  };
}

const GLOSS_DEFS: GlossDef[] = [
  { slug: "what-is-an-elite-trainer-box", term: "an Elite Trainer Box", desc: "An Elite Trainer Box (ETB) is a Pokémon TCG bundle with booster packs, sleeves, dice, energy, and a storage box.",
    def: "An Elite Trainer Box, or ETB, is a Pokémon TCG product that bundles eight or nine booster packs with accessories like card sleeves, dice, energy cards, and a storage box. ETBs are the most-watched sealed product for every set, and they sell out fast on restock.",
    faqs: [
      { q: "How many packs are in an ETB?", a: "Most Elite Trainer Boxes hold eight or nine booster packs, plus sleeves, dice, energy, and a storage box." },
      { q: "Why do ETBs sell out so fast?", a: "They are the go-to sealed product for collectors and players, so demand outruns supply on every restock." },
      { q: "How do I catch an ETB restock?", a: "Open the product page on your store of choice and arm QuickCatch. It adds the ETB to your cart the moment stock returns." },
    ] },
  { slug: "what-is-a-booster-box", term: "a Booster Box", desc: "A booster box is a sealed case of Pokémon TCG booster packs, usually 36 packs from a single set.",
    def: "A booster box is a sealed case of Pokémon TCG booster packs, usually thirty-six packs from a single set. Collectors and investors chase booster boxes because they give the best odds at a set's chase cards, which is why they sell out at retail.",
    faqs: [
      { q: "How many packs are in a booster box?", a: "A modern Pokémon booster box usually holds thirty-six booster packs from one set." },
      { q: "Are booster boxes a good deal?", a: "Per pack they are usually cheaper than singles and give the best shot at chase cards, so they sell out quickly." },
      { q: "How do I catch a booster box restock?", a: "Arm QuickCatch on the product page and it adds the box to your cart the moment it restocks." },
    ] },
  { slug: "what-is-an-ultra-premium-collection", term: "an Ultra-Premium Collection", desc: "An Ultra-Premium Collection (UPC) is the top-tier sealed Pokémon set bundle, with the most packs and premium extras.",
    def: "An Ultra-Premium Collection, or UPC, is the top-tier sealed product for a Pokémon set. It packs in the most booster packs plus premium extras like metal cards, a pin, and a collector's box. UPCs are the hardest pieces to buy at retail.",
    faqs: [
      { q: "What comes in a UPC?", a: "The most booster packs of any set product, plus premium extras like metal cards, a pin, and a display box." },
      { q: "Why is the UPC so hard to get?", a: "It is the flagship sealed item for a set, so demand is highest and stock clears in minutes." },
      { q: "How do I catch a UPC restock?", a: "Arm QuickCatch on the product page and it carts the UPC the moment stock returns." },
    ] },
  { slug: "what-is-a-booster-bundle", term: "a Booster Bundle", desc: "A booster bundle is a small, low-cost Pokémon TCG pack of six boosters — the cheapest sealed entry into a set.",
    def: "A booster bundle is a small Pokémon TCG product with six booster packs and no extras. It is the cheapest sealed way into a set, which is exactly why bundles sell out first on every restock.",
    faqs: [
      { q: "How many packs are in a booster bundle?", a: "A booster bundle holds six booster packs with no accessories." },
      { q: "Why are bundles a fast sellout?", a: "They are the cheapest sealed entry into a set, so they clear out first when stock drops." },
      { q: "How do I catch a bundle restock?", a: "Arm QuickCatch on the product page and it adds the bundle to your cart the moment it restocks." },
    ] },
  { slug: "what-is-a-cook-group", term: "a Cook Group", desc: "A cook group is a paid community that sells access to restock monitors, bots, and proxies for buying limited drops.",
    def: "A cook group is a paid community, usually on Discord, that sells access to restock monitors, checkout bots, proxies, and guides for buying limited drops. They are built for resellers, bill monthly, and take real setup.",
    faqs: [
      { q: "Do I need a cook group to catch a drop?", a: "No. A cook group is built for resellers. QuickCatch handles the catch step from your own browser, free, with no monthly fee." },
      { q: "What does a cook group cost?", a: "Most bill monthly and add the cost of bots and proxies on top, which only pays off if you buy in volume." },
      { q: "What is the simpler option?", a: "Install QuickCatch, arm the product page, and it carts the item on the restock. No group, no proxies." },
    ] },
  { slug: "what-is-sniping-a-drop", term: "Sniping a Drop", desc: "Sniping a drop means catching a restock the instant it goes live, before the page fills with refreshers.",
    def: "Sniping a drop means being on the buy button the instant stock returns, before everyone else reaches it. You do not need a server bot to snipe a drop. A browser catcher like QuickCatch watches the page and carts the item the moment it restocks.",
    faqs: [
      { q: "Is sniping a drop against the rules?", a: "Buying fast is not against the rules. QuickCatch acts as you, in your own session, and you complete checkout." },
      { q: "Do I need a bot to snipe?", a: "No. QuickCatch watches the page from your browser and carts the item on the restock." },
      { q: "How early should I set up?", a: "Arm QuickCatch before the drop window. It watches in the background until stock returns." },
    ] },
  { slug: "what-is-an-aio-bot", term: "an AIO Bot", desc: "An AIO (all-in-one) bot is server software that auto-checks-out limited drops across many sites for resellers.",
    def: "An AIO, or all-in-one, bot is software that automatically checks out limited drops across many sites. It runs from datacenter servers behind proxies and is built for resellers buying in bulk, which is exactly the traffic stores detect and block.",
    faqs: [
      { q: "Why do AIO bots get blocked?", a: "Stores flag datacenter traffic and automated checkout, then block or ban it." },
      { q: "What is the alternative for a collector?", a: "QuickCatch runs in your own browser and your own session, so it reaches the same pages you do, and it is free." },
      { q: "Does QuickCatch buy in bulk?", a: "No. It carts the item on the page you opened and follows the store's per-customer limit." },
    ] },
  { slug: "what-is-retail-vs-resale", term: "Retail vs Resale", desc: "Retail is the store's sticker price; resale is the higher price a flipper charges after a set sells out.",
    def: "Retail is the price the store charges. Resale is the higher price a reseller charges after a set sells out. The gap exists because hot sets vanish in seconds, so catching the retail restock is how you skip the markup.",
    faqs: [
      { q: "Why is resale so much higher?", a: "Sets sell out at retail in seconds, so resellers list them higher. Catching the retail restock avoids the markup." },
      { q: "How do I pay retail instead of resale?", a: "Arm QuickCatch on the official store page and it carts the item the moment it restocks, at retail." },
      { q: "Is QuickCatch free?", a: "Free to install and watch. Pro adds watching several items at once." },
    ] },
];

const GLOSSARY: DropPage[] = GLOSS_DEFS.map(glossaryPage);

// ---------------------------------------------------------------------------
// 8) Curation — "best [category]" listicles (programmatic-SEO playbook). Honest
//    ranked lists with QuickCatch positioned on merit. English, cat Guides.
// ---------------------------------------------------------------------------
interface BestDef { slug: string; title: string; desc: string; h1: string; intro: string; items: Array<[string, string]>; faqs: Array<{ q: string; a: string }>; }

function bestPage(b: BestDef): DropPage {
  const list = `
  <section>
    <h2>The short list</h2>
    <ol class="bestlist">
      ${b.items.map(([n, note]) => `<li><strong>${esc(n)}</strong> — ${esc(note)}</li>`).join("\n      ")}
    </ol>
  </section>`;
  return {
    slug: b.slug, cat: "Guides", kind: "bestof",
    title: b.title, desc: b.desc, h1: b.h1, lede: b.intro, topic: "Pokémon",
    extraHtml: list, faqs: b.faqs,
  };
}

const BEST_DEFS: BestDef[] = [
  { slug: "best-pokemon-restock-trackers", title: "Best Pokémon Restock Trackers | QuickCatch",
    desc: "The best ways to track Pokémon restocks, from Discord monitors to QuickCatch, which carts the item for you.",
    h1: "The best Pokémon restock trackers", intro: "A restock tracker tells you the moment a set is back. The best ones go further and help you actually buy it. Here are the main options, with honest pros and cons.",
    items: [
      ["QuickCatch", "Watches the page in your own browser and adds the item to your cart on the restock. Free, no proxies. Best when you want the catch handled, not just an alert."],
      ["Discord restock monitors", "Fast alerts for a community, but the buying is on you against everyone who got the same ping."],
      ["Store apps and stock pages", "Official and reliable for awareness, but no auto-cart."],
      ["Stock-lookup sites", "Good for finding in-store inventory, less useful for online drops."],
    ],
    faqs: [
      { q: "What is the best Pokémon restock tracker?", a: "For catching the item, QuickCatch — it watches the page and carts it on the restock. For awareness only, a Discord monitor or store app works." },
      { q: "Do restock trackers buy the item for me?", a: "Most only alert you. QuickCatch is the one that adds the item to your cart the moment it restocks." },
      { q: "Are they free?", a: "QuickCatch is free to install and watch. Many monitors and cook groups charge monthly." },
    ] },
  { slug: "best-stores-to-buy-pokemon-cards", title: "Best Stores to Buy Pokémon Cards | QuickCatch",
    desc: "Where to buy Pokémon cards at retail and catch restocks: Pokémon Center, Walmart, Target, Best Buy and more.",
    h1: "The best stores to buy Pokémon cards at retail", intro: "Buying at retail means watching the right stores. These are the ones that carry the hottest sets and restock them, with QuickCatch ready on each.",
    items: [
      ["Pokémon Center", "First-party exclusives and the newest sets, but the hardest sellouts."],
      ["Walmart", "Frequent restocks in waves, sharp prices, pickup and delivery."],
      ["Target", "Regular Pokémon drops; carts quickly with QuickCatch."],
      ["Best Buy", "Restocks bigger sealed product like UPCs and SPCs."],
      ["Costco and Sam's Club", "Bundles at sharp prices when they land online."],
      ["GameStop", "Exclusives and trade-in deals on sealed product."],
    ],
    faqs: [
      { q: "Where is the best place to buy Pokémon cards at retail?", a: "Pokémon Center for exclusives, Walmart and Target for frequent restocks, Best Buy for big sealed product. QuickCatch works on all of them." },
      { q: "How do I get retail price?", a: "Be at the cart first. Arm QuickCatch on the store page and it carts the item the moment it restocks." },
      { q: "Is QuickCatch free?", a: "Free to install and watch. Pro adds watching several items at once." },
    ] },
  { slug: "best-pokemon-restock-bot-alternatives", title: "Best Pokémon Restock Bot Alternatives | QuickCatch",
    desc: "The best alternatives to server-side restock bots for Pokémon — browser-based, free, and harder to block.",
    h1: "The best restock bot alternatives for Pokémon", intro: "Server bots get blocked and banned on retail. These alternatives reach the page the way a real shopper does.",
    items: [
      ["QuickCatch", "Runs in your own browser and session, watches the page, and carts the item on the restock. Free, no proxies, no server."],
      ["Store apps with saved payment", "Be logged in with one-tap checkout so you are fast when stock returns."],
      ["Discord monitors plus a fast checkout", "Awareness from the monitor, speed from your own saved details."],
      ["Stock-lookup tools for in-store", "Drive to local stock instead of fighting the online queue."],
    ],
    faqs: [
      { q: "Why not just use a restock bot?", a: "Server bots run from datacenters and get IP-flagged on retail. A browser catcher like QuickCatch reaches the page as you do." },
      { q: "What is the best alternative?", a: "QuickCatch — it does the watch-and-cart job from your browser, free, with no proxies or setup." },
      { q: "Will it get me banned?", a: "It acts as you, on the page you opened, and you complete checkout. It does not run from a server." },
    ] },
  { slug: "best-tcg-restock-trackers", title: "Best TCG Restock Trackers | QuickCatch",
    desc: "The best restock trackers across TCGs — Pokémon, One Piece, Lorcana, Magic — that help you actually buy.",
    h1: "The best TCG restock trackers", intro: "Pokémon is not the only TCG that sells out in seconds. These trackers cover the hobby, and QuickCatch carts the item on the restock.",
    items: [
      ["QuickCatch", "Watches any supported product page and carts the item on the restock — Pokémon, One Piece, Lorcana, Magic, Yu-Gi-Oh."],
      ["Discord monitors per game", "Community alerts, but the buying race is still on you."],
      ["Retailer apps", "Official awareness for each store, no auto-cart."],
      ["TCGplayer alerts", "Useful for singles and sellers restocking sealed product."],
    ],
    faqs: [
      { q: "Does QuickCatch work for One Piece and Lorcana?", a: "Yes. It works on any supported store product page that shows price and stock, across TCGs." },
      { q: "What is the best TCG restock tracker?", a: "QuickCatch for catching the item; a per-game Discord monitor for awareness only." },
      { q: "Is it free?", a: "Free to install and watch. Pro adds watching several items at once." },
    ] },
  { slug: "best-ways-to-catch-pokemon-drops", title: "Best Ways to Catch Pokémon Drops | QuickCatch",
    desc: "The best ways to catch a Pokémon drop at retail, ranked — from arming QuickCatch to presales and multi-store watching.",
    h1: "The best ways to catch a Pokémon drop", intro: "Catching a drop comes down to speed at the cart. These are the highest-leverage moves, in order.",
    items: [
      ["Arm QuickCatch before the drop", "It watches the page in the background and carts the item the moment stock returns."],
      ["Be logged in with payment saved", "Cut checkout to seconds once the item is in your cart."],
      ["Chase the presale when there is one", "A presale reserves a copy before the set sells out."],
      ["Watch several stores at once", "A set drops across stores in the same window; watch them all and catch the first."],
    ],
    faqs: [
      { q: "What is the single best way to catch a drop?", a: "Arm QuickCatch on the product page before the drop. It carts the item the moment it restocks while you do anything else." },
      { q: "Can I watch more than one store?", a: "Yes. Arm QuickCatch on each page; Pro raises how many you can run at once." },
      { q: "Is it free?", a: "Free to install and watch. Pro adds watching several items at once." },
    ] },
  { slug: "best-apps-for-pokemon-restocks", title: "Best Apps for Pokémon Restocks | QuickCatch",
    desc: "The best apps and extensions for Pokémon restocks, from store apps to QuickCatch, which carts the item for you.",
    h1: "The best apps for Pokémon restocks", intro: "The right app is the difference between an alert and a cart. Here is what is worth installing.",
    items: [
      ["QuickCatch (Chrome extension)", "Watches the page and adds the item to your cart on the restock. Free, runs in your browser."],
      ["Retailer apps", "Pokémon Center, Walmart, Target, Best Buy — official alerts and fast checkout."],
      ["Discord (with a monitor)", "Community restock pings, awareness only."],
      ["Stock-lookup apps", "Find in-store inventory near you."],
    ],
    faqs: [
      { q: "What is the best app for Pokémon restocks?", a: "QuickCatch for catching the item, paired with retailer apps for fast checkout and a monitor for awareness." },
      { q: "Is there an app that buys it for me?", a: "QuickCatch adds the item to your cart on the restock; you complete checkout in your own account." },
      { q: "Is it free?", a: "Free to install and watch. Pro adds watching several items at once." },
    ] },
];

const BESTOF: DropPage[] = BEST_DEFS.map(bestPage);

// ---------------------------------------------------------------------------
// 9) Grading / card-terms cluster — high-intent, evergreen definitions that
//    tie into the resale + grading-ROI calculators. English guides.
// ---------------------------------------------------------------------------
const GRADING_GUIDES: DropPage[] = [
  guide("what-is-a-graded-pokemon-card", "What is a Graded Pokémon Card? | QuickCatch",
    "A graded Pokémon card is one a company like PSA or CGC has authenticated and scored 1–10 for condition, then sealed in a slab.",
    "What is a graded Pokémon card?",
    "A graded Pokémon card has been sent to a grading company (PSA, CGC, or BGS), authenticated as genuine, scored on a 1 to 10 scale for centering, corners, edges, and surface, then sealed in a tamper-evident case. The grade sets the card's market value.",
    "Pokémon", [
      { q: "Why grade a card?", a: "Grading authenticates the card and can multiply its value — a PSA 10 often sells for several times the raw price." },
      { q: "Which company should I use?", a: "PSA has the largest market and population data; CGC and BGS are strong alternatives. Weigh turnaround and fees for your card's value." },
      { q: "How do I buy the raw card cheap first?", a: "Grading only pays if you buy the raw card at retail. QuickCatch carts it the moment it restocks; check the math with the grading ROI calculator." },
    ]),
  guide("psa-vs-cgc-vs-bgs", "PSA vs CGC vs BGS: Which Grader? | QuickCatch",
    "PSA, CGC, and BGS all grade Pokémon cards 1–10. PSA has the biggest market, CGC is strong on modern cards, BGS is known for subgrades.",
    "PSA vs CGC vs BGS: which grading company?",
    "PSA, CGC, and BGS all authenticate and grade cards on a 1 to 10 scale. PSA has the deepest resale demand and population database, CGC is popular for modern cards and turnaround, and BGS is known for subgrades and the Black Label 10. The right pick depends on the card and your budget.",
    "Pokémon", [
      { q: "Which grader gets the highest resale?", a: "For most Pokémon, PSA carries the strongest resale demand and the largest pop database. CGC and BGS can match or beat it for specific cards." },
      { q: "Which is cheapest or fastest?", a: "Fees and turnaround change often, so check current tiers. CGC and lower-value PSA tiers are usually the most affordable." },
      { q: "Is grading worth it for my card?", a: "Run the numbers in the grading ROI calculator: raw price, expected graded value, and grading cost." },
    ]),
  guide("what-is-a-chase-card", "What is a Chase Card? | QuickCatch",
    "A chase card is the rare, most-wanted card in a Pokémon set — the one collectors open packs hoping to pull.",
    "What is a chase card?",
    "A chase card is the standout rare in a Pokémon set, usually a special-art or hyper-rare version of a popular Pokémon, that collectors open packs chasing. Chase cards drive demand for the whole set and command the highest singles prices.",
    "Pokémon", [
      { q: "What makes a card a chase?", a: "A low pull rate plus high demand, usually a special illustration rare or alt art of a fan-favorite Pokémon." },
      { q: "Should I pull it or buy the single?", a: "Pulling is a gamble; buying the single is certain. Sealed product is the bet, singles are the sure thing." },
      { q: "How do I get sealed product at retail?", a: "Arm QuickCatch on the product page; it carts the box the moment it restocks." },
    ]),
  guide("what-is-an-alt-art-card", "What is an Alt Art Card? | QuickCatch",
    "An alt art (alternate art) card is a special full-art Pokémon card with unique artwork and a rarer pull rate.",
    "What is an alt art card?",
    "An alternate art card, or alt art, is a special full-art version of a card with unique artwork that differs from the standard print. Alt arts have low pull rates and are among the most valuable and chased cards in modern Pokémon sets.",
    "Pokémon", [
      { q: "How rare are alt arts?", a: "They sit near the top of the rarity ladder with low pull rates, which is why their singles command premium prices." },
      { q: "Are alt arts worth grading?", a: "A near-mint alt art that grades a 10 can multiply in value. Check it in the grading ROI calculator first." },
      { q: "How do I land the set at retail?", a: "Arm QuickCatch on the product page and it carts the item the moment it restocks." },
    ]),
  guide("what-is-a-secret-rare", "What is a Secret Rare? | QuickCatch",
    "A secret rare is a Pokémon card numbered beyond the set's printed total — a bonus rare like a gold or rainbow card.",
    "What is a secret rare?",
    "A secret rare is a card whose number exceeds the set's official count, like 201/200. They are bonus rares, often gold, rainbow, or special-texture versions, with low pull rates and strong collector demand.",
    "Pokémon", [
      { q: "How do I spot a secret rare?", a: "Its collector number is higher than the set's total printed count, so it sits past the last numbered card." },
      { q: "Are secret rares valuable?", a: "Often yes, thanks to low pull rates and demand, though value varies by the Pokémon and finish." },
      { q: "How do I buy the set at retail?", a: "Arm QuickCatch on the product page and it carts it the moment it restocks." },
    ]),
  guide("what-is-a-special-illustration-rare", "What is a Special Illustration Rare? | QuickCatch",
    "A Special Illustration Rare (SIR) is a premium full-art Pokémon card with unique illustrated artwork and a very low pull rate.",
    "What is a Special Illustration Rare?",
    "A Special Illustration Rare, or SIR, is a premium full-art card in Scarlet & Violet sets featuring unique character illustration art. SIRs sit near the top of the rarity ladder and are among the most valuable chase cards in a set.",
    "Pokémon", [
      { q: "How is an SIR different from an alt art?", a: "SIR is the current name for the special full-art illustration tier; collectors often use alt art and SIR interchangeably for these cards." },
      { q: "Why are SIRs so expensive?", a: "Very low pull rates plus high demand for the artwork push their single prices to the top of the set." },
      { q: "How do I get the set at retail?", a: "Arm QuickCatch on the product page and it carts the box the moment it restocks." },
    ]),
  guide("what-is-pull-rate", "What is a Pull Rate? | QuickCatch",
    "A pull rate is how often a specific Pokémon card appears per pack or box — the odds of pulling it.",
    "What is a pull rate?",
    "A pull rate is the probability of finding a specific card in a pack or box, often expressed as one in N packs. Chase cards like alt arts and special illustration rares have the lowest pull rates, which is why their singles cost the most.",
    "Pokémon", [
      { q: "What is a good pull rate?", a: "It depends on the card tier. Common rares hit often; chase alt arts and SIRs can be one in dozens of boxes." },
      { q: "Does buying a box guarantee a chase?", a: "No. A box improves your odds but guarantees nothing. Singles are the only sure way to get a specific card." },
      { q: "How do I buy boxes at retail?", a: "Arm QuickCatch on the product page; it carts the box the moment it restocks." },
    ]),
  guide("what-is-a-psa-population-report", "What is a PSA Population Report? | QuickCatch",
    "A PSA population report shows how many copies of a card PSA has graded at each grade — a scarcity signal for collectors.",
    "What is a PSA population report?",
    "A PSA population report, or pop report, shows how many copies of a card PSA has graded at each grade. A low population at PSA 10 signals scarcity and supports a higher price; a high pop means the grade is common. Collectors use it to judge true rarity.",
    "Pokémon", [
      { q: "Why does the pop report matter?", a: "It reveals real scarcity at a given grade, which drives price more than the print run alone." },
      { q: "Does a low pop guarantee value?", a: "Not on its own — demand matters too. Low pop plus high demand is what pushes price." },
      { q: "How do I buy raw cards at retail?", a: "QuickCatch carts sealed product the moment it restocks, so you start at retail, not resale." },
    ]),
  guide("is-grading-pokemon-cards-worth-it", "Is Grading Pokémon Cards Worth It? | QuickCatch",
    "Grading pays when the graded value beats the raw price plus grading and shipping. Here's how to decide, with a free calculator.",
    "Is grading Pokémon cards worth it?",
    "Grading is worth it when the graded value clears the raw price plus grading and shipping, and when the card has a realistic shot at a high grade. For low-value or played cards, the fees usually eat the upside. Run your numbers before you send.",
    "Pokémon", [
      { q: "How do I calculate if it's worth it?", a: "Use the grading ROI calculator: enter the raw price, the value at the grade you expect, and grading cost to see profit and margin." },
      { q: "Which cards are worth grading?", a: "High-value chase cards in near-mint condition, where a PSA 10 multiplies the price. Bulk and played cards usually are not." },
      { q: "Where do I buy the raw card at retail?", a: "QuickCatch carts sealed product and listings the moment they restock, so you start at retail not resale." },
    ]),
  guide("best-pokemon-cards-to-grade", "Best Pokémon Cards to Grade | QuickCatch",
    "The best Pokémon cards to grade are high-demand chase cards in near-mint condition where a high grade multiplies value.",
    "The best Pokémon cards to grade",
    "The cards worth grading are the ones where a high grade multiplies the price: modern alt arts and special illustration rares of popular Pokémon, vintage holos in clean condition, and key chase cards from hyped sets. Condition is everything, so grade near-mint or better.",
    "Pokémon", [
      { q: "How do I know a card will profit from grading?", a: "Compare the raw price to the graded value minus grading cost in the grading ROI calculator." },
      { q: "Is it worth grading bulk?", a: "Rarely. Grading fees outweigh the value of common cards; focus on chase cards and clean vintage." },
      { q: "How do I source raw cards at retail?", a: "Arm QuickCatch on the product page and it carts the item the moment it restocks." },
    ]),
];

// ---------------------------------------------------------------------------
// Assemble. Order controls the index grouping fallback.
// ---------------------------------------------------------------------------
export const DROP_PAGES: DropPage[] = [
  ...CURATED,
  ...SETS,
  ...COMBOS,
  ...STORES,
  ...VS_NAMED,
  ...VS_CATEGORY,
  ...GUIDES,
  ...GLOSSARY,
  ...BESTOF,
  ...GRADING_GUIDES,
];

// Sets/stores/vs/combos exist in every locale; guides are English only.
export function isLocalizable(p: DropPage): boolean {
  return p.kind === "set" || p.kind === "store" || p.kind === "versus" || p.kind === "combo"
    || p.kind === "glossary" || p.kind === "bestof";
}
export const LOCALIZABLE_SLUGS = DROP_PAGES.filter(isLocalizable).map((p) => p.slug);

// URL for a page in a given locale. English keeps the bare /drops/<slug>.
export function dropUrl(lang: Lang, slug: string): string {
  return lang === "en" ? `/drops/${slug}` : `/drops/${lang}/${slug}`;
}
export function dropsIndexUrl(lang: Lang): string {
  return lang === "en" ? `/drops` : `/drops/${lang}`;
}

export const DROP_SLUGS = DROP_PAGES.map((p) => p.slug);

const CAT_ORDER: DropCat[] = ["TCG sets", "Stores", "vs Bots", "Guides"];

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function shell(origin: string, head: string, body: string, L: L, lang: Lang): string {
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
${head}
<style>
  :root { --bg:#07070d;--card:#16161f;--bg2:#11111c;--border:#26263a;--text:#ececf5;--muted:#9a9ab0;--accent:#ff9e2c;--accent2:#ffcf7a;--green:#4ade80;--red:#ff5470; }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin:0; color:var(--text); background:var(--bg); font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif; line-height:1.6;
    background-image:radial-gradient(ellipse 900px 600px at 12% -5%,rgba(255,158,44,.16),transparent 60%); }
  .wrap { max-width: 820px; margin: 0 auto; padding: 0 22px; }
  nav { display:flex; justify-content:space-between; align-items:center; padding:20px 22px; max-width:1080px; margin:0 auto; }
  nav .brand { font-weight:800; display:flex; align-items:center; gap:8px; text-decoration:none; color:var(--text); }
  nav .coin { width:22px;height:22px;border-radius:50%;background:#f97316;border:2px solid #2a1500;position:relative; }
  nav .coin::after{content:"$";position:absolute;inset:0;display:grid;place-items:center;color:#2a1500;font-size:11px;font-weight:900;}
  nav .get { background:linear-gradient(135deg,var(--accent),var(--accent2)); color:#2a1500; padding:8px 15px; border-radius:9px; font-weight:800; text-decoration:none; font-size:.9rem; }
  header.hero { padding: 40px 0 14px; }
  h1 { font-size:clamp(2rem,4.4vw,2.9rem); margin:0 0 14px; line-height:1.08; letter-spacing:-.02em; }
  .lede { color:var(--muted); font-size:1.12rem; margin:0 0 22px; }
  section { padding: 26px 0; }
  h2 { font-size:1.5rem; margin:0 0 14px; letter-spacing:-.01em; }
  h3 { font-size:1.05rem; margin:0 0 6px; }
  .steps { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
  @media (max-width:680px){ .steps{ grid-template-columns:1fr; } }
  .stepc { background:var(--card); border:1px solid var(--border); border-radius:14px; padding:18px; }
  .stepc .n { color:var(--accent2); font-weight:800; font-size:.8rem; letter-spacing:.1em; }
  details { background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px 18px; margin-bottom:10px; }
  details summary { font-weight:700; cursor:pointer; list-style:none; }
  details .a { color:var(--muted); margin-top:10px; }
  /* comparison table */
  .cmp { width:100%; border-collapse:collapse; background:var(--card); border:1px solid var(--border); border-radius:14px; overflow:hidden; }
  .cmp th, .cmp td { text-align:left; padding:12px 14px; border-bottom:1px solid var(--border); font-size:.94rem; vertical-align:top; }
  .cmp thead th { background:rgba(255,158,44,.08); font-size:.82rem; letter-spacing:.04em; text-transform:uppercase; color:var(--accent2); }
  .cmp td.qc { color:var(--green); font-weight:600; }
  .cmp td.them { color:var(--muted); }
  .cmp tr:last-child td { border-bottom:none; }
  .cmp .feat { color:var(--text); font-weight:600; white-space:nowrap; }
  @media (max-width:560px){ .cmp .feat{ white-space:normal; } .cmp th,.cmp td{ padding:10px; font-size:.86rem; } }
  /* conversion block */
  .cta { background:linear-gradient(135deg,var(--card),rgba(255,158,44,.07)); border:1px solid var(--accent); border-radius:18px; padding:24px; margin:14px 0; }
  .cta h2 { margin:0 0 6px; }
  .cta p { color:var(--muted); margin:0 0 16px; }
  .row { display:flex; gap:10px; flex-wrap:wrap; }
  .btn { display:inline-flex; align-items:center; gap:8px; padding:13px 20px; border-radius:11px; font-weight:800; text-decoration:none; border:none; cursor:pointer; font-size:.95rem; font-family:inherit; }
  .btn-primary { background:linear-gradient(135deg,var(--accent),var(--accent2)); color:#2a1500; }
  .btn-ghost { background:var(--bg2); color:var(--text); border:1px solid var(--border); }
  .buynow { margin-top:14px; }
  .buynow-l { display:block; color:var(--muted); font-size:.85rem; margin-bottom:8px; }
  /* pricing */
  .plans { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-top:6px; }
  @media (max-width:600px){ .plans{ grid-template-columns:1fr; } }
  .plan { position:relative; background:var(--card); border:1px solid var(--border); border-radius:16px; padding:20px; display:flex; flex-direction:column; gap:8px; }
  .plan.featured { border-color:var(--accent); box-shadow:0 0 0 1px var(--accent) inset; }
  .plan .pname { font-weight:800; font-size:1.05rem; }
  .plan .pprice { font-size:2rem; font-weight:900; letter-spacing:-.02em; }
  .plan .pprice span { font-size:.9rem; font-weight:600; color:var(--muted); }
  .plan .pdesc { color:var(--muted); font-size:.92rem; flex:1; margin:0; }
  .plan .buy { width:100%; justify-content:center; margin-top:6px; }
  .plan .badge2 { position:absolute; top:-10px; right:14px; background:linear-gradient(135deg,var(--accent),var(--accent2)); color:#2a1500; font-size:.7rem; font-weight:800; padding:3px 10px; border-radius:999px; text-transform:uppercase; letter-spacing:.06em; }
  .pfoot { color:var(--muted); font-size:.82rem; margin-top:10px; text-align:center; }
  .capture { margin-top:16px; }
  .capture .f { display:flex; gap:8px; flex-wrap:wrap; }
  .capture input { flex:1; min-width:200px; background:var(--bg2); border:1px solid var(--border); color:var(--text); border-radius:10px; padding:12px 14px; font-family:inherit; font-size:.95rem; }
  .capture .hp { position:absolute; left:-9999px; }
  .capture .msg { color:var(--green); font-size:.9rem; margin-top:8px; min-height:1em; }
  .related a { color:var(--accent2); text-decoration:none; }
  .catnav { margin:8px 0 0; color:var(--muted); font-size:.9rem; }
  .catnav a { color:var(--accent2); text-decoration:none; }
  .crumbs { padding-top:10px; color:var(--muted); font-size:.85rem; }
  .crumbs a { color:var(--accent2); text-decoration:none; }
  .crumbs span { color:var(--accent2); }
  .bestlist { padding-left:20px; margin:0; }
  .bestlist li { margin-bottom:10px; }
  .bestlist strong { color:var(--text); }
  footer { border-top:1px solid var(--border); margin-top:34px; padding:26px 0; color:var(--muted); font-size:.85rem; }
  footer a { color:var(--accent2); text-decoration:none; }
</style>
</head>
<body>
<nav>
  <a class="brand" href="${origin}/"><span class="coin"></span> QuickCatch</a>
  <a class="get" href="${STORE_URL}" target="_blank" rel="noopener">${esc(L.ui.getFree)}</a>
</nav>
<div class="wrap">
${body}
</div>
<script>
(function(){
  var STORE = ${JSON.stringify(STORE_URL)};
  var PRO = ${JSON.stringify(PRO_URL)};
  var MSG = ${JSON.stringify({ ...L.msg, emailPrompt: PRICING[lang].emailPrompt, checkoutErr: PRICING[lang].checkoutErr })};
  // Plan buy buttons → live Stripe checkout. Uses the email already typed in
  // the capture field, else prompts. Redirects to the returned cs_live URL.
  document.querySelectorAll("button.buy").forEach(function(b){
    b.addEventListener("click", async function(){
      var plan = b.getAttribute("data-plan");
      var ein = document.querySelector("input[type=email]");
      var email = (ein && ein.value.trim()) || "";
      if (!email || email.indexOf("@") < 0) { email = (window.prompt(MSG.emailPrompt) || "").trim(); }
      if (!email || email.indexOf("@") < 0) return;
      var orig = b.textContent; b.disabled = true; b.textContent = "…";
      // QuickCatch consumer tier ($12) → its own checkout; API plans → the plan checkout.
      var ep = (plan === "quickcatch") ? "/api/v1/quickcatch/checkout" : "/api/v1/stripe/checkout";
      var payload = (plan === "quickcatch") ? { email: email } : { email: email, plan: plan, origin: location.origin };
      try {
        var r = await fetch(ep, { method:"POST", headers:{"content-type":"application/json"},
          body: JSON.stringify(payload) });
        var j = await r.json();
        if (j && j.url) { window.location.href = j.url; return; }
        throw new Error((j && j.error) || "err");
      } catch(e){ b.disabled = false; b.textContent = orig; alert(MSG.checkoutErr); }
    });
  });
  document.querySelectorAll("form.lead").forEach(function(f){
    f.addEventListener("submit", async function(e){
      e.preventDefault();
      var email = f.querySelector("input[type=email]").value.trim();
      var topic = f.getAttribute("data-topic") || "Pokémon";
      var pkg = f.getAttribute("data-pkg") || "alerts";
      var msg = f.querySelector(".msg");
      if (!email || email.indexOf("@") < 0) { msg.style.color="#ff5470"; msg.textContent=MSG.invalidEmail; return; }
      if (f.querySelector(".hp").value) { msg.textContent="✓"; return; }
      try {
        var r = await fetch("/api/v1/leads", { method:"POST", headers:{"content-type":"application/json"},
          body: JSON.stringify({ name: email.split("@")[0], email: email, site_url: location.href, package: pkg, use_case: "QuickCatch "+pkg+" · "+topic }) });
        if (r.ok) { msg.style.color="#4ade80"; msg.textContent = pkg==="pro" ? MSG.alertPro : MSG.alertDone.replace("{topic}", topic); f.querySelector("input[type=email]").value=""; }
        else { msg.style.color="#ff5470"; msg.textContent=MSG.retry; }
      } catch(err){ msg.style.color="#ff5470"; msg.textContent=MSG.netErr; }
    });
  });
  document.querySelectorAll("a.pro").forEach(function(a){ if (PRO) { a.setAttribute("href", PRO); a.setAttribute("target","_blank"); } });
})();
</script>
</body>
</html>`;
}

// Strip a trailing "restocks"/"drops" so "Catch the next ${topic} drop" and the
// alert copy never double up ("Pokémon drops drop").
function topicNoun(t: string): string {
  return t.replace(/\s+(restocks?|drops?)$/i, "").trim() || t;
}

function conversionBlock(topic: string, ui: L["ui"]): string {
  const t = topicNoun(topic);
  return `
  <div class="cta">
    <h2>${esc(fill(ui.ctaHeading, { topic: t }))}</h2>
    <p>${esc(ui.ctaSub)}</p>
    <div class="row">
      <a class="btn btn-primary" href="${STORE_URL}" target="_blank" rel="noopener">🛒 ${esc(ui.getFree)}</a>
      <a class="btn btn-ghost pro" href="#pro">⚡ ${esc(ui.proBtn)}</a>
    </div>
    <form class="lead capture" id="alerts" data-topic="${esc(t)}" data-pkg="alerts">
      <p style="color:var(--muted);margin:16px 0 8px">${esc(ui.notReady)}</p>
      <div class="f">
        <input type="email" placeholder="${esc(ui.emailPh)}" aria-label="email" />
        <input class="hp" tabindex="-1" autocomplete="off" aria-hidden="true" />
        <button class="btn btn-primary" type="submit">${esc(ui.getAlerts)}</button>
      </div>
      <div class="msg"></div>
    </form>
  </div>`;
}

// Live consumer block. The collector funnel sells the $12/mo QuickCatch tier
// (NOT the developer API plans) — the button POSTs /api/v1/quickcatch/checkout
// {email} and redirects to the cs_live URL. Free restock alerts live in the
// capture above; this is the "actually catch it" upgrade. Positioned against the
// $500–3000 reseller bots: same catch, a fraction of the price, your own browser.
function pricingBlock(lang: Lang): string {
  const P = PRICING[lang];
  return `
  <section id="pro">
    <h2>${esc(P.pricingH)}</h2>
    <div class="plans">
      <div class="plan featured">
        <div class="badge2">${esc(P.popular)}</div>
        <div class="pname">QuickCatch</div>
        <div class="pprice">$12<span>${esc(P.perMo)}</span></div>
        <p class="pdesc">${esc(P.proDesc)}</p>
        <button class="btn btn-primary buy" type="button" data-plan="quickcatch">${esc(P.proCta)}</button>
      </div>
    </div>
    <p class="pfoot">${esc(P.planFoot)}</p>
  </section>`;
}

function comparisonHtml(c: NonNullable<DropPage["comparison"]>): string {
  const rows = c.rows.map(([feat, qc, them]) =>
    `<tr><td class="feat">${esc(feat)}</td><td class="qc">${esc(qc)}</td><td class="them">${esc(them)}</td></tr>`
  ).join("");
  return `
  <section>
    <h2>QuickCatch vs ${esc(c.themLabel)}</h2>
    <table class="cmp">
      <thead><tr><th></th><th>QuickCatch</th><th>${esc(c.themLabel)}</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </section>`;
}

function whySection(kind: DropPage["kind"], ui: L["ui"]): string {
  const h = kind === "versus" ? ui.whyVersusH : ui.whyRefreshH;
  const b = kind === "versus" ? ui.whyVersusB : ui.whyRefreshB;
  return `
  <section>
    <h2>${esc(h)}</h2>
    <p>${esc(b)}</p>
  </section>`;
}

// Localized field set for a page. English uses the page's own copy; other
// locales generate copy from the per-kind templates in drops_i18n.
interface LocFields { title: string; desc: string; h1: string; lede: string; topic: string; faqs: Array<{ q: string; a: string }>; comparison?: DropPage["comparison"]; product?: DropPage["product"]; extraHtml?: string; }

function fieldsFor(p: DropPage, lang: Lang): LocFields {
  if (lang === "en") {
    return { title: p.title, desc: p.desc, h1: p.h1, lede: p.lede, topic: p.topic, faqs: p.faqs, comparison: p.comparison, product: p.product, extraHtml: p.extraHtml };
  }
  const g = T[lang].gen!;
  const mapFaqs = (arr: Array<{ q: string; a: string }>, v: Record<string, string>) => arr.map((f) => ({ q: fill(f.q, v), a: fill(f.a, v) }));
  if (p.kind === "set") {
    const name = p.product?.name || p.h1, where = p.product?.store || "";
    const v = { name, where };
    return { title: fill(g.set.title, v), desc: fill(g.set.desc, v), h1: fill(g.set.h1, v), lede: fill(g.set.lede, v), topic: name, faqs: mapFaqs(g.set.faqs, v), product: p.product };
  }
  if (p.kind === "store") {
    const store = p.product?.store || p.topic;
    const v = { store };
    return { title: fill(g.store.title, v), desc: fill(g.store.desc, v), h1: fill(g.store.h1, v), lede: fill(g.store.lede, v), topic: store, faqs: mapFaqs(g.store.faqs, v), product: p.product };
  }
  if (p.kind === "versus") {
    const them = p.comparison?.themLabel || p.h1;
    const v = { them };
    return { title: fill(g.vs.title, v), desc: fill(g.vs.desc, v), h1: fill(g.vs.h1, v), lede: fill(g.vs.lede, v), topic: "Pokémon", faqs: mapFaqs(g.vs.faqs, v), comparison: { themLabel: them, rows: g.vs.rows } };
  }
  if (p.kind === "glossary") {
    const gl = GLOSS_I18N[p.slug]?.[lang as Exclude<Lang, "en">];
    const termBare = (p.term || p.h1).replace(/^(an? )/i, "");
    const h1 = fill(WHAT_IS[lang], { term: termBare });
    const def = gl?.def || p.lede;
    return { title: `${h1} | QuickCatch`, desc: def.slice(0, 155), h1, lede: def, topic: "Pokémon", faqs: gl?.faqs || p.faqs };
  }
  if (p.kind === "bestof") {
    const b = BESTOF_I18N[p.slug]?.[lang as Exclude<Lang, "en">];
    if (!b) return { title: p.title, desc: p.desc, h1: p.h1, lede: p.lede, topic: p.topic, faqs: p.faqs, extraHtml: p.extraHtml };
    const list = `
  <section>
    <h2>${esc(SHORT_LIST[lang])}</h2>
    <ol class="bestlist">
      ${b.items.map((i) => `<li>${esc(i)}</li>`).join("\n      ")}
    </ol>
  </section>`;
    return { title: `${b.h1} | QuickCatch`, desc: b.intro.slice(0, 155), h1: b.h1, lede: b.intro, topic: "Pokémon", faqs: b.faqs, extraHtml: list };
  }
  // combo
  const name = p.combo?.name || "", store = p.combo?.store || "";
  const v = { name, store };
  return { title: fill(g.combo.title, v), desc: fill(g.combo.desc, v), h1: fill(g.combo.h1, v), lede: fill(g.combo.lede, v), topic: name, faqs: mapFaqs(g.combo.faqs, v), product: p.product };
}

function relatedFor(p: DropPage, origin: string, lang: Lang): string {
  const pool = lang === "en" ? DROP_PAGES : DROP_PAGES.filter(isLocalizable);
  const sameCat = pool.filter((x) => x.slug !== p.slug && x.cat === p.cat).slice(0, 4);
  const rest = pool.filter((x) => x.slug !== p.slug && x.cat !== p.cat).slice(0, Math.max(0, 4 - sameCat.length));
  return [...sameCat, ...rest]
    .map((x) => `<a href="${origin}${dropUrl(lang, x.slug)}">${esc(lang === "en" ? x.h1 : fieldsFor(x, lang).h1)}</a>`).join(" · ");
}

// hreflang alternates for a localizable page (or the index when slug is null).
function hreflangTags(origin: string, slug: string | null): string {
  const url = (l: Lang) => origin + (slug === null ? dropsIndexUrl(l) : dropUrl(l, slug));
  const links = LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${url(l)}" />`);
  links.push(`<link rel="alternate" hreflang="x-default" href="${url("en")}" />`);
  return links.join("\n");
}

function langSwitcher(origin: string, slug: string | null, current: Lang): string {
  const url = (l: Lang) => origin + (slug === null ? dropsIndexUrl(l) : dropUrl(l, slug));
  const items = LANGS.map((l) => l === current
    ? `<strong style="color:var(--accent2)">${esc(LANG_LABEL[l])}</strong>`
    : `<a href="${url(l)}">${esc(LANG_LABEL[l])}</a>`).join(" · ");
  return `<p class="catnav" style="margin-top:10px">${items}</p>`;
}

export function dropPageHtml(origin: string, p: DropPage, lang: Lang = "en"): string {
  const L = T[lang];
  const ui = L.ui;
  const localizable = isLocalizable(p);
  // A non-localizable page (a guide) only exists in English.
  const useLang: Lang = localizable ? lang : "en";
  const f = fieldsFor(p, useLang);
  const url = `${origin}${dropUrl(useLang, p.slug)}`;

  const faqLd = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: f.faqs.map((q) => ({ "@type": "Question", name: q.q, acceptedAnswer: { "@type": "Answer", text: q.a } })),
  };
  const artLd = {
    "@context": "https://schema.org", "@type": "Article", headline: f.h1, description: f.desc, inLanguage: useLang,
    author: { "@type": "Organization", name: "QuickCatch" }, publisher: { "@type": "Organization", name: "QuickCatch", url: origin },
    datePublished: "2026-06-02", dateModified: "2026-06-02", mainEntityOfPage: url,
  };
  const catSlug = p.cat.replace(/\s+/g, "-").toLowerCase();
  const crumbLd = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "QuickCatch", item: `${origin}/` },
      { "@type": "ListItem", position: 2, name: ui.allDropGuides, item: `${origin}${dropsIndexUrl(useLang)}` },
      { "@type": "ListItem", position: 3, name: L.cats[p.cat] || p.cat, item: `${origin}${dropsIndexUrl(useLang)}#${catSlug}` },
      { "@type": "ListItem", position: 4, name: f.h1, item: url },
    ],
  };
  const appLd = {
    "@context": "https://schema.org", "@type": "SoftwareApplication", name: "QuickCatch",
    applicationCategory: "BrowserApplication", operatingSystem: "Chrome", url: STORE_URL,
    offers: [
      { "@type": "Offer", price: "0", priceCurrency: "USD", name: "QuickCatch (free) — restock alerts" },
      { "@type": "Offer", price: "12", priceCurrency: "USD", name: "QuickCatch — auto-cart + bot-blocked stores" },
    ],
  };
  const head = `<title>${esc(f.title)}</title>
<meta name="description" content="${esc(f.desc)}" />
<link rel="canonical" href="${url}" />
${localizable ? hreflangTags(origin, p.slug) + "\n" : ""}<meta property="og:title" content="${esc(f.h1)}" />
<meta property="og:description" content="${esc(f.desc)}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${origin}/og.png" />
<meta name="twitter:card" content="summary_large_image" />
<script type="application/ld+json">${JSON.stringify(artLd)}</script>
<script type="application/ld+json">${JSON.stringify(faqLd)}</script>
<script type="application/ld+json">${JSON.stringify(crumbLd)}</script>
<script type="application/ld+json">${JSON.stringify(appLd)}</script>`;

  const productCallout = f.product
    ? `<section><div class="stepc"><h3>${esc(f.product.name)}</h3><p style="color:var(--muted);margin:6px 0 0">${f.product.price ? `${esc(ui.retailLabel)} ${esc(f.product.price)} · ` : ""}${esc(ui.watchAtLabel)} ${esc(f.product.store)}</p></div></section>`
    : "";

  const body = `
  <nav class="crumbs"><a href="${origin}/">QuickCatch</a> › <a href="${origin}${dropsIndexUrl(useLang)}">${esc(ui.allGuides)}</a> › <span>${esc(L.cats[p.cat] || p.cat)}</span></nav>
  <header class="hero">
    <h1>${esc(f.h1)}</h1>
    <p class="lede">${esc(f.lede)}</p>
  </header>

  ${conversionBlock(f.topic, ui)}

  <section>
    <h2>${esc(ui.howItWorks)}</h2>
    <div class="steps">
      <div class="stepc"><div class="n">${esc(ui.stepWord)} 1</div><h3>${esc(ui.step1T)}</h3><p style="color:var(--muted)">${esc(ui.step1D)}</p></div>
      <div class="stepc"><div class="n">${esc(ui.stepWord)} 2</div><h3>${esc(ui.step2T)}</h3><p style="color:var(--muted)">${esc(ui.step2D)}</p></div>
      <div class="stepc"><div class="n">${esc(ui.stepWord)} 3</div><h3>${esc(ui.step3T)}</h3><p style="color:var(--muted)">${esc(ui.step3D)}</p></div>
    </div>
  </section>

  ${f.comparison ? comparisonHtml(f.comparison) : ""}
  ${productCallout}
  ${(() => {
    // Maximize affiliate coverage: any page with a product → buy that product;
    // best-of lists + buying guides → search the topic. Definitional pages skip.
    const q = f.product?.name || ((p.kind === "bestof" || p.kind === "guide") ? f.topic : "");
    return q ? affiliateButtons(q) : "";
  })()}
  ${f.extraHtml || ""}

  ${whySection(p.kind, ui)}

  ${pricingBlock(useLang)}

  <section>
    <h2>${esc(ui.faqH)}</h2>
    ${f.faqs.map((q) => `<details><summary>${esc(q.q)}</summary><div class="a">${esc(q.a)}</div></details>`).join("\n    ")}
  </section>

  ${conversionBlock(f.topic, ui)}

  <footer>
    <p class="related">${esc(ui.more)} ${relatedFor(p, origin, useLang)}</p>
    ${localizable ? langSwitcher(origin, p.slug, useLang) : ""}
    <p><a href="${origin}/">QuickCatch</a> · <a href="${origin}${dropsIndexUrl(useLang)}">${esc(ui.allDropGuides)}</a> · <a href="${origin}/privacy">${esc(ui.privacy)}</a></p>
  </footer>`;

  return shell(origin, head, body, L, useLang);
}

export function dropsIndexHtml(origin: string, lang: Lang = "en"): string {
  const L = T[lang];
  const ui = L.ui;
  const url = `${origin}${dropsIndexUrl(lang)}`;
  // English index lists every page; localized indexes list the localizable set.
  const pool = lang === "en" ? DROP_PAGES : DROP_PAGES.filter(isLocalizable);

  const head = `<title>${esc(L.index.title)}</title>
<meta name="description" content="${esc(L.index.desc)}" />
<link rel="canonical" href="${url}" />
${hreflangTags(origin, null)}
<meta property="og:title" content="${esc(L.index.h1)}" />
<meta property="og:image" content="${origin}/og.png" />`;

  const catId = (cat: string) => esc(cat.replace(/\s+/g, "-").toLowerCase());
  const sections = CAT_ORDER.map((cat) => {
    const pages = pool.filter((p) => p.cat === cat);
    if (!pages.length) return "";
    const cards = pages.map((p) => {
      const f = fieldsFor(p, lang);
      return `<a class="stepc" style="text-decoration:none;color:inherit;display:block;margin-bottom:12px" href="${origin}${dropUrl(lang, p.slug)}"><h3 style="color:var(--accent2)">${esc(f.h1)}</h3><p style="color:var(--muted);margin:6px 0 0">${esc(f.desc)}</p></a>`;
    }).join("\n    ");
    return `<section id="${catId(cat)}"><h2>${esc(L.cats[cat] || cat)} <span style="color:var(--muted);font-weight:400;font-size:1rem">(${pages.length})</span></h2>\n    ${cards}\n  </section>`;
  }).join("\n");

  const jump = CAT_ORDER.filter((c) => pool.some((p) => p.cat === c))
    .map((c) => `<a href="#${catId(c)}">${esc(L.cats[c] || c)}</a>`).join(" · ");

  const body = `
  <header class="hero">
    <h1>${esc(L.index.h1)}</h1>
    <p class="lede">${esc(L.index.lede)}</p>
    <div class="row"><a class="btn btn-primary" href="${STORE_URL}" target="_blank" rel="noopener">🛒 ${esc(ui.getFree)}</a></div>
    <p class="catnav" style="margin-top:14px">${esc(ui.jumpTo)} ${jump}</p>
    ${langSwitcher(origin, null, lang)}
  </header>
  ${pricingBlock(lang)}
  ${sections}
  <footer><p><a href="${origin}/">QuickCatch</a> · <a href="${origin}/tools/pokemon-resale-calculator">Calculator</a> · <a href="${origin}/privacy">${esc(ui.privacy)}</a></p></footer>`;
  return shell(origin, head, body, L, lang);
}
