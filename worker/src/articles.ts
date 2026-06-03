// articles.ts — long-form, genuinely-written buyer-intent articles at /blog.
//
// These are deliberately NOT templated (the templated bulk is what tripped
// Google's scaled-content dampener and left the site mostly un-indexed). Each
// article is unique editorial content targeting a high-commercial-intent query,
// with eBay affiliate buttons on the specific products it recommends, Article +
// FAQ schema, and internal links. The goal: pages that actually rank, earn
// affiliate clicks, and are worth linking to.

import { uiCss, uiNav } from "./ui";
import { affiliateButtons } from "./affiliate";

interface ArticleFaq { q: string; a: string }
interface Article {
  slug: string;
  title: string;       // <title> + og
  desc: string;        // meta description
  h1: string;
  dek: string;         // sub-headline under h1
  updated: string;     // human date, e.g. "June 2026"
  readMins: number;
  bodyHtml: string;    // the article body (trusted HTML, includes affiliate buttons)
  faqs: ArticleFaq[];
  related: string[];   // slugs of related articles
}

// ---- small helpers used while authoring (trusted, no escaping needed) -------
const buy = (q: string, label = "Check live prices on eBay:") => affiliateButtons(q, label);
const h2 = (t: string) => `<h2>${t}</h2>`;
const p = (t: string) => `<p>${t}</p>`;

export const ARTICLES: Article[] = [
  {
    slug: "best-pokemon-booster-boxes-2026",
    title: "Best Pokémon Booster Boxes to Buy in 2026 (Ranked by Value) | wmcp.sh",
    desc: "The Pokémon booster boxes actually worth buying in 2026, ranked by pull value and how well sealed product holds price — plus how to buy at retail instead of scalper prices.",
    h1: "Best Pokémon Booster Boxes to Buy in 2026",
    dek: "Ranked by what you actually pull and how well each box holds value sealed — not by hype.",
    updated: "June 2026",
    readMins: 7,
    bodyHtml:
      p(`Not every Pokémon set is worth buying by the box. Some are loaded with chase cards that make ripping packs genuinely +EV; others are best left sealed as a long-term hold; and a few are only worth singles. This list ranks the current Scarlet &amp; Violet-era boxes by the two things that matter to a buyer: <strong>pull value</strong> (what an average box returns in singles) and <strong>sealed appreciation</strong> (how well the sealed box holds or grows in price once it leaves print).`) +
      p(`Prices move weekly, so each pick links to live eBay listings — that's the fastest way to see what a box actually trades for today rather than what a retailer lists it at.`) +
      h2("1. Prismatic Evolutions — best overall") +
      p(`The Eevee-focused special set is the most demanded box of the era. The Eeveelution special-illustration rares (Umbreon ex, Sylveon ex, Espeon ex) carry the whole set, and even a flat box usually returns a respectable chunk of its cost in mid-tier hits. Sealed boxes have appreciated steadily since release because special sets print in shorter windows.`) +
      buy("Pokemon Prismatic Evolutions Booster Box") +
      h2("2. Pokémon 151 — best for nostalgia + stable demand") +
      p(`151 prints the original Kanto roster with modern illustration rares, and demand from lapsed collectors never really dips. The Ultra Premium Collection and the booster bundles are the most liquid SKUs. It's the safest "buy and forget" sealed hold on this list.`) +
      buy("Pokemon 151 Booster Box") +
      h2("3. Surging Sparks — best rip-for-value box") +
      p(`Surging Sparks carries Pikachu ex SIR, one of the most expensive chase cards in the modern era. That single card skews the expected value of opening high enough that it's the box most worth ripping if you're chasing a hit rather than holding sealed.`) +
      buy("Pokemon Surging Sparks Booster Box") +
      h2("4. Stellar Crown — best mid-budget pick") +
      p(`Quieter set, but Terapagos and the ace-spec cards keep singles demand healthy, and box prices sit below the marquee sets. A sensible entry if Prismatic and 151 are priced out of your range.`) +
      buy("Pokemon Stellar Crown Booster Box") +
      h2("How to actually buy these at retail") +
      p(`The catch: the boxes worth buying sell out at retail in seconds and only resurface at a markup. The cheapest way to get one is to catch the restock the moment it goes live rather than paying the resale price. Our free <a href="/drops">restock guides</a> cover where each set restocks, and <a href="/">QuickCatch</a> watches a product page and carts it the instant it's back. Before you buy at resale, run the numbers through the <a href="/tools/pokemon-resale-calculator">retail vs resale calculator</a> so you know what you're actually paying over retail.`) +
      h2("Sealed or singles?") +
      p(`If you want a specific card, singles are almost always cheaper than chasing it in packs — see <a href="/blog/sealed-vs-singles-pokemon">sealed vs singles</a> for the math. Buy boxes when you want the experience of ripping, or to hold sealed product through a print cycle.`),
    faqs: [
      { q: "Which Pokémon booster box has the best pull rates?", a: "Surging Sparks is the strongest rip-for-value box right now because Pikachu ex SIR pulls its expected value up. For holding sealed rather than ripping, Prismatic Evolutions and 151 hold price best." },
      { q: "Is it better to buy a booster box or singles?", a: "If you want one specific card, singles are cheaper. Buy a box for the experience of opening packs, or to hold sealed product through a print cycle as it appreciates." },
      { q: "Where can I buy Pokémon booster boxes at retail price?", a: "Pokémon Center, Walmart, Target, Best Buy and Costco carry them, but they sell out fast. Catching the restock the moment it goes live is the only reliable way to pay retail instead of resale." },
    ],
    related: ["is-prismatic-evolutions-worth-it", "sealed-vs-singles-pokemon", "best-pokemon-cards-to-invest-2026"],
  },

  {
    slug: "is-prismatic-evolutions-worth-it",
    title: "Is Prismatic Evolutions Worth Buying in 2026? (Pull Rates & Verdict) | wmcp.sh",
    desc: "An honest look at whether the Prismatic Evolutions Elite Trainer Box and booster boxes are worth buying in 2026 — chase cards, realistic pull rates, retail vs resale price, and the verdict.",
    h1: "Is Prismatic Evolutions Worth Buying?",
    dek: "Chase cards, the pull-rate reality, and whether to rip it or hold it sealed.",
    updated: "June 2026",
    readMins: 6,
    bodyHtml:
      p(`Prismatic Evolutions is the most hyped special set of the Scarlet &amp; Violet era, built around the Eeveelutions. The hype is real, but "hyped" and "worth your money" aren't the same thing. Here's the honest breakdown.`) +
      h2("The chase cards") +
      p(`The set lives and dies on its special-illustration rares: <strong>Umbreon ex</strong> (the headline card, consistently the most expensive), <strong>Sylveon ex</strong>, <strong>Espeon ex</strong>, and the gold/hyper-rare Eeveelutions. Umbreon ex alone drives most of the secondary-market demand — if you pull it, the box pays for itself several times over.`) +
      h2("The pull-rate reality") +
      p(`Special sets like this one have a higher density of hits than a normal expansion, which is exactly why boxes cost more. But the top chase cards are still rare — most boxes return solid mid-tier hits without landing the Umbreon SIR. Don't buy a box <em>expecting</em> the chase; buy it expecting a fair return of mid cards with a lottery ticket on top.`) +
      h2("Retail vs resale price") +
      p(`The Elite Trainer Box lists around $49.99 retail but rarely sits in stock at that price; resale runs well above it during shortages. The booster box is the better value per pack if you can catch it at retail. Run your specific listing through the <a href="/tools/pokemon-resale-calculator">retail vs resale calculator</a> before paying a markup — sometimes the premium is reasonable, sometimes it's not.`) +
      buy("Pokemon Prismatic Evolutions Elite Trainer Box") +
      h2("The verdict") +
      p(`<strong>Worth it</strong> — with a caveat. If you can buy at or near retail, Prismatic Evolutions is one of the few modern sets that's strong both to rip and to hold sealed, thanks to the Eeveelution demand. If you can only find it at a heavy resale markup, buy singles of the card you actually want instead, or wait and catch a <a href="/drops/prismatic-evolutions-restock">restock</a> at retail.`) +
      p(`To get it at retail, set up a watch on the product page so you're carted the instant it restocks — that's what <a href="/">QuickCatch</a> does.`),
    faqs: [
      { q: "What is the most valuable card in Prismatic Evolutions?", a: "Umbreon ex (special illustration rare) is consistently the most valuable card in the set and drives most of the secondary-market demand." },
      { q: "Should I buy the Elite Trainer Box or the booster box?", a: "The booster box is better value per pack if you can find it near retail. The ETB is fine for a single sealed item or as a gift, but you pay more per pack." },
      { q: "Will Prismatic Evolutions go up in value?", a: "Sealed special sets have historically appreciated after they leave print because of the short print window and the Eeveelution demand, but nothing is guaranteed. Buying near retail rather than at a markup is what protects your downside." },
    ],
    related: ["best-pokemon-booster-boxes-2026", "pokemon-151-vs-surging-sparks-vs-prismatic", "best-pokemon-cards-to-invest-2026"],
  },

  {
    slug: "pokemon-151-vs-surging-sparks-vs-prismatic",
    title: "Pokémon 151 vs Surging Sparks vs Prismatic Evolutions: Which to Buy? | wmcp.sh",
    desc: "A head-to-head comparison of Pokémon 151, Surging Sparks and Prismatic Evolutions — chase cards, value to rip, value to hold sealed, and which set to buy for your goal.",
    h1: "151 vs Surging Sparks vs Prismatic Evolutions",
    dek: "Three of the most-bought modern sets, compared by goal: rip, hold, or collect.",
    updated: "June 2026",
    readMins: 6,
    bodyHtml:
      p(`These are the three sets most buyers are deciding between right now. They're good at different things, so the right pick depends entirely on your goal. Here's the straight comparison.`) +
      h2("If you want to rip for a big hit → Surging Sparks") +
      p(`Surging Sparks has the highest single-card ceiling thanks to Pikachu ex SIR. That one card lifts the expected value of opening enough that this is the box to buy if you're chasing the thrill of a six-figure-population chase card rather than holding sealed.`) +
      buy("Pokemon Surging Sparks Booster Box") +
      h2("If you want to hold sealed → Prismatic Evolutions") +
      p(`As a special set built on the Eeveelutions, Prismatic Evolutions has the deepest collector demand and the shortest print window, which is the recipe for sealed appreciation. It's the strongest hold of the three — and still fun to rip.`) +
      buy("Pokemon Prismatic Evolutions Booster Box") +
      h2("If you want stable, broad demand → Pokémon 151") +
      p(`151 is the safest pick. Kanto nostalgia means demand never really dries up, the sealed SKUs are extremely liquid, and prices are less spiky than the special sets. It's the "buy and forget" option.`) +
      buy("Pokemon 151 Booster Box") +
      h2("Quick verdict table") +
      `<table class="tbl"><thead><tr><th>Goal</th><th>Best set</th><th>Why</th></tr></thead><tbody>` +
      `<tr><td>Rip for a big hit</td><td>Surging Sparks</td><td>Highest single-card ceiling (Pikachu ex SIR)</td></tr>` +
      `<tr><td>Hold sealed</td><td>Prismatic Evolutions</td><td>Special-set demand + short print window</td></tr>` +
      `<tr><td>Stable / liquid</td><td>Pokémon 151</td><td>Kanto nostalgia, broad evergreen demand</td></tr>` +
      `</tbody></table>` +
      h2("Whichever you pick, buy at retail") +
      p(`All three sell out fast and resurface at a markup. Compare your listing against retail with the <a href="/tools/pokemon-resale-calculator">resale calculator</a>, and catch restocks at retail with <a href="/">QuickCatch</a> instead of overpaying. See the per-set <a href="/drops">restock guides</a> for where each one comes back in stock.`),
    faqs: [
      { q: "Which set is the best investment?", a: "For sealed appreciation, Prismatic Evolutions has the strongest case (special set, short print window). For low-volatility liquidity, 151 is safer. Surging Sparks is more about ripping than holding." },
      { q: "Which set has the best pull rates?", a: "Surging Sparks has the highest expected value to open because of Pikachu ex SIR. Special sets like Prismatic also have a high hit density but cost more per box." },
    ],
    related: ["is-prismatic-evolutions-worth-it", "best-pokemon-booster-boxes-2026", "sealed-vs-singles-pokemon"],
  },

  {
    slug: "sealed-vs-singles-pokemon",
    title: "Sealed vs Singles: The Smarter Way to Buy Pokémon Cards | wmcp.sh",
    desc: "Should you buy sealed Pokémon product or singles? The real math on cost per card, when ripping makes sense, and how to avoid overpaying either way.",
    h1: "Sealed vs Singles: Which Should You Actually Buy?",
    dek: "The cost-per-card math most hype videos skip.",
    updated: "June 2026",
    readMins: 5,
    bodyHtml:
      p(`The single most common money mistake in this hobby is buying sealed product to chase one specific card. Here's the math that fixes it.`) +
      h2("The hard truth about ripping for a card") +
      p(`If there's one card you want, buying singles is almost always cheaper than opening packs to hit it. Pack odds mean you'll usually spend more on sealed product chasing a chase card than it would cost to just buy that card outright. The sealed market is priced by people who already know this.`) +
      h2("When sealed actually makes sense") +
      p(`Sealed is the right buy in three cases: (1) you want the <em>experience</em> of opening packs and you're fine with whatever you pull; (2) you're holding sealed product as a long-term store of value through a print cycle; or (3) the set is so hit-dense that expected value to open is genuinely close to box cost. Outside those, buy singles.`) +
      h2("How to not overpay either way") +
      p(`For singles, check live sold prices before you buy — listed prices and actual sold prices diverge a lot.`) +
      buy("Pokemon 151 single cards", "Compare single-card prices on eBay:") +
      p(`For sealed, compare against retail rather than the inflated resale "market price." Our <a href="/tools/pokemon-resale-calculator">retail vs resale calculator</a> tells you exactly how much over retail a sealed listing is asking, and the <a href="/drops">restock guides</a> help you buy at retail in the first place.`) +
      h2("The bottom line") +
      p(`Want a specific card? Buy the single. Want the lottery-ticket fun, or a sealed hold? Buy the box — at retail, not resale. <a href="/">QuickCatch</a> exists to make that retail buy actually possible when everything sells out in seconds.`),
    faqs: [
      { q: "Is it cheaper to buy singles or booster packs?", a: "For a specific card, singles are almost always cheaper. Pack odds mean chasing a card in sealed product usually costs more than just buying the card." },
      { q: "Why do people buy sealed Pokémon product then?", a: "For the experience of opening packs, to hold sealed product as it appreciates after a set leaves print, or when a set is hit-dense enough that opening is close to break-even." },
    ],
    related: ["best-pokemon-booster-boxes-2026", "best-pokemon-cards-to-invest-2026", "how-to-spot-fake-pokemon-booster-box"],
  },

  {
    slug: "how-to-spot-fake-pokemon-booster-box",
    title: "How to Spot a Fake Pokémon Booster Box Before You Buy | wmcp.sh",
    desc: "Counterfeit sealed Pokémon product is everywhere. Learn the weight, wrap, print and price tells that spot a fake booster box before you spend a cent — and how to buy safely.",
    h1: "How to Spot a Fake Pokémon Booster Box",
    dek: "The tells that separate a real sealed box from a convincing counterfeit.",
    updated: "June 2026",
    readMins: 6,
    bodyHtml:
      p(`As sealed Pokémon prices climbed, so did counterfeits — and modern fakes are convincing. Here's how to check a box before you buy, especially secondhand.`) +
      h2("1. Price that's too good") +
      p(`The number-one tell. If a sealed box of a hot set is priced well under the going rate, assume it's fake, resealed, or a weighed/searched box until proven otherwise. There are no real bargains on in-demand sealed product.`) +
      h2("2. Weight and feel") +
      p(`Counterfeit boxes are often noticeably lighter or heavier than genuine ones, and the cardboard feels thinner or glossier. If you can compare against a known-real box, weigh both.`) +
      h2("3. The shrink wrap") +
      p(`Factory wrap is tight, cleanly folded at the corners, and the seams sit flat. Loose wrap, doubled-up seams, visible re-taping, or a wrap that's slightly cloudy are resealing tells. Factory boxes also have consistent, machine-cut tear strips.`) +
      h2("4. Print quality and color") +
      p(`Hold the box to good light. Genuine print is crisp with accurate colors; fakes often show fuzzy text, off registration (colors slightly misaligned), or washed-out logos. Check the small legal text and set logo closely — that's where counterfeiters cut corners.`) +
      h2("5. Buy from sellers with protection") +
      p(`The safest secondhand route is a marketplace that backs you if the item's not as described, from a seller with a long history of genuine sealed sales and clear, original photos (not stock images). On eBay, filter for top-rated sellers and check feedback specifically on trading-card sales.`) +
      buy("Pokemon sealed booster box", "Browse vetted sellers on eBay:") +
      h2("Better yet — buy sealed at retail") +
      p(`Counterfeits exist because demand outstrips retail supply. The way around the whole problem is to buy sealed product directly from authorized retailers at restock. Our <a href="/drops">restock guides</a> show where each set restocks, and <a href="/">QuickCatch</a> carts it the instant it's live so you buy genuine product at retail instead of gambling on the secondhand market.`),
    faqs: [
      { q: "How can I tell if a Pokémon booster box is real?", a: "Check the price (too cheap = suspect), the weight and cardboard feel, the factory shrink wrap (tight, clean seams), and print quality (crisp text, aligned colors). Buy from sellers with buyer protection and a genuine sales history." },
      { q: "Are cheap Pokémon booster boxes online fake?", a: "Not always, but a hot set priced well below market is the single biggest red flag for a fake, resealed, or searched box. Treat suspiciously cheap sealed product as counterfeit until proven otherwise." },
    ],
    related: ["best-pokemon-booster-boxes-2026", "sealed-vs-singles-pokemon", "best-pokemon-cards-to-invest-2026"],
  },

  {
    slug: "best-pokemon-cards-to-invest-2026",
    title: "Best Pokémon Cards to Invest In Right Now (2026) | wmcp.sh",
    desc: "Where the smart money is in Pokémon cards for 2026 — sealed special sets, blue-chip singles, and graded slabs — plus how to buy without overpaying the resale premium.",
    h1: "Best Pokémon Cards to Invest In (2026)",
    dek: "Sealed, singles, and slabs — where value actually holds, and the risks nobody mentions.",
    updated: "June 2026",
    readMins: 7,
    bodyHtml:
      p(`"Investing" in Pokémon cards is real, but it's not a guaranteed up-and-to-the-right chart. Prices are volatile, liquidity varies, and the floor can drop on reprints. With that said, here's where value has held best and how to buy without handing your upside to a scalper on day one.`) +
      h2("1. Sealed special sets") +
      p(`Special sets (built around a popular theme, printed in shorter windows) have been the most consistent sealed performers. Prismatic Evolutions is the current flagship — Eeveelution demand plus a short print run is the classic appreciation setup.`) +
      buy("Pokemon Prismatic Evolutions Booster Box") +
      h2("2. Blue-chip nostalgia sealed") +
      p(`Sets tied to the original Kanto roster, like 151, behave like blue chips: lower volatility, deep and steady demand, very liquid. Less explosive upside than a hyped special set, but a more predictable store of value.`) +
      buy("Pokemon 151 Booster Box") +
      h2("3. Graded chase singles") +
      p(`For singles, the money is in graded (PSA/CGC) copies of marquee chase cards — top special-illustration rares from in-demand sets. A graded 10 of a flagship card is far more liquid and stable than raw copies. If you're buying raw to grade, factor grading cost and the risk of a 9 instead of a 10.`) +
      buy("PSA 10 Umbreon ex special illustration rare", "See graded comps on eBay:") +
      h2("The risks nobody puts in the thumbnail") +
      p(`Reprints can crater a card overnight. Sealed product can sit illiquid if a set falls out of favor. Grading is a gamble and a fee. And the resale premium you pay on day one is pure downside — if you buy a hyped box at 2x retail, it has to nearly double just to break even. The single biggest edge an investor has is <strong>buying at retail</strong>.`) +
      h2("How to buy at retail (the actual edge)") +
      p(`Run any listing through the <a href="/tools/pokemon-resale-calculator">retail vs resale calculator</a> so you never overpay the premium blindly. Use the <a href="/drops">restock guides</a> to know where sets restock, and let <a href="/">QuickCatch</a> catch them at retail the moment they're live. Buying at retail instead of resale is the difference between a position that's already up and one that's underwater on day one.`),
    faqs: [
      { q: "Are Pokémon cards a good investment in 2026?", a: "They can be, but they're volatile and not guaranteed. Sealed special sets and blue-chip nostalgia sets have held value best, and graded chase singles are the most liquid. The biggest edge is buying at retail instead of paying the resale premium." },
      { q: "What Pokémon cards hold value best?", a: "Sealed special sets (e.g. Prismatic Evolutions), blue-chip nostalgia sealed (e.g. 151), and graded 10s of marquee chase cards tend to hold value best. Reprints and illiquidity are the main risks." },
      { q: "Should I buy raw cards and grade them, or buy already-graded?", a: "Buying already-graded removes the grading gamble and fee but costs more. Buying raw to grade can be cheaper if the card grades a 10, but you risk a 9 and pay grading costs either way." },
    ],
    related: ["best-pokemon-booster-boxes-2026", "is-prismatic-evolutions-worth-it", "sealed-vs-singles-pokemon"],
  },
];

export const ARTICLE_SLUGS = ARTICLES.map((a) => a.slug);
const bySlug = new Map(ARTICLES.map((a) => [a.slug, a]));
export const getArticle = (slug: string): Article | undefined => bySlug.get(slug);

function articleSchema(origin: string, a: Article): string {
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.h1,
    description: a.desc,
    author: { "@type": "Organization", name: "wmcp.sh" },
    publisher: { "@type": "Organization", name: "wmcp.sh", url: origin },
    dateModified: a.updated,
    mainEntityOfPage: `${origin}/blog/${a.slug}`,
  };
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: a.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const crumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: origin },
      { "@type": "ListItem", position: 2, name: "Guides", item: `${origin}/blog` },
      { "@type": "ListItem", position: 3, name: a.h1, item: `${origin}/blog/${a.slug}` },
    ],
  };
  return [article, faq, crumbs]
    .map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`)
    .join("\n");
}

function relatedHtml(a: Article): string {
  const links = a.related
    .map((s) => bySlug.get(s))
    .filter((r): r is Article => !!r)
    .map((r) => `<li><a href="/blog/${r.slug}">${r.h1}</a></li>`)
    .join("");
  return links ? `<section class="related"><h2>Keep reading</h2><ul>${links}</ul></section>` : "";
}

export function articleHtml(origin: string, a: Article): string {
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8" />
<title>${a.title}</title>
<meta name="description" content="${a.desc}" />
<link rel="canonical" href="${origin}/blog/${a.slug}" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta property="og:type" content="article" />
<meta property="og:title" content="${a.h1}" />
<meta property="og:description" content="${a.desc}" />
<meta property="og:url" content="${origin}/blog/${a.slug}" />
<style>${uiCss(760)}
  article p{line-height:1.7;margin:14px 0;color:var(--text)}
  article h2{margin:34px 0 6px;font-size:1.35rem}
  .dek{color:var(--muted);font-size:1.1rem;margin:4px 0 10px}
  .ameta{color:var(--dim);font-size:.85rem;margin-bottom:8px}
  .buynow{margin:14px 0 6px}
  .related ul{line-height:2}
  table.tbl{margin:14px 0}
  .cta{margin:30px 0;padding:18px 20px;border:1px solid var(--border);border-radius:14px;background:var(--bg2)}
</style>
${articleSchema(origin, a)}
</head><body>
${uiNav(origin)}
<div class="wrap" style="padding-top:24px">
  <nav class="crumbs"><a href="/">Home</a> › <a href="/blog">Guides</a> › <span>${a.h1}</span></nav>
  <header>
    <h1>${a.h1}</h1>
    <p class="dek">${a.dek}</p>
    <p class="ameta">Updated ${a.updated} · ${a.readMins} min read</p>
  </header>
  <article>
    ${a.bodyHtml}
  </article>

  <div class="cta">
    <strong>Buy at retail, not resale.</strong> The sets worth buying sell out in seconds.
    <a href="/">QuickCatch</a> watches a product page and carts it the instant it restocks —
    and the <a href="/tools/pokemon-resale-calculator">resale calculator</a> tells you when a resale price is worth paying.
  </div>

  <section>
    <h2>FAQ</h2>
    ${a.faqs.map((f) => `<details><summary>${f.q}</summary><div class="a">${f.a}</div></details>`).join("\n    ")}
  </section>

  ${relatedHtml(a)}

  <footer>
    <a href="/blog">All guides</a> · <a href="/drops">Restock guides</a> · <a href="/tools">Free tools</a> · <a href="/">wmcp.sh</a>
  </footer>
</div>
</body></html>`;
}

export function articlesIndexHtml(origin: string): string {
  const cards = ARTICLES.map(
    (a) => `<a class="card" href="/blog/${a.slug}">
      <h3 style="margin:0 0 6px">${a.h1}</h3>
      <p class="muted" style="margin:0">${a.dek}</p>
      <p class="dim" style="margin:8px 0 0;font-size:.82rem">${a.readMins} min · updated ${a.updated}</p>
    </a>`
  ).join("\n");
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8" />
<title>Pokémon buying guides — what to buy, where, and for how much | wmcp.sh</title>
<meta name="description" content="Honest, in-depth Pokémon buying guides: which booster boxes and sets are worth it, sealed vs singles, spotting fakes, and what holds value — plus how to buy at retail." />
<link rel="canonical" href="${origin}/blog" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>${uiCss(820)}
  .grid{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));margin-top:18px}
  .card{display:block;text-decoration:none;color:inherit}
  .card:hover{border-color:var(--accent2)}
</style></head><body>
${uiNav(origin)}
<div class="wrap" style="padding-top:28px">
  <header>
    <h1>Pokémon buying guides</h1>
    <p class="lede">No-hype guides on what's actually worth buying, where to get it at retail, and how to avoid overpaying.</p>
  </header>
  <div class="grid">${cards}</div>
  <footer style="margin-top:40px">
    <a href="/drops">Restock guides</a> · <a href="/tools">Free tools</a> · <a href="/">wmcp.sh</a>
  </footer>
</div>
</body></html>`;
}
