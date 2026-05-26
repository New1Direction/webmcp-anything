# Adapters wanted

Sites and formats we'd love coverage for, with rough difficulty. PRs welcome — read [CONTRIBUTING.md](./CONTRIBUTING.md) first. Open an issue before starting anything marked **hard**.

Already shipped: Shopify, generic JSON-LD.

## Easy (a couple hours)

| Target | Why it matters | Approach |
|---|---|---|
| **WooCommerce** | Powers ~30% of online stores. Most expose `?wc-ajax=get_refreshed_fragments` and a JSON product feed. | URL pattern + REST probe |
| **BigCommerce** | Several hundred thousand stores, has a public `/products/<slug>.js` endpoint similar to Shopify. | Mirror the shopify.js adapter |
| **Squarespace Commerce** | Common for small-brand DTC. Server-rendered with predictable JSON-LD. | Extend `jsonld.js` or new file |
| **eBay listing pages** | Pricing + bid status is in the page meta. Reads only — no need for cart actions. | JSON-LD + a few OG meta tags |
| **YouTube video pages** | Title, channel, duration, view count — useful for agents that summarize or queue content. | OG meta + `ytInitialData` parse |
| **GitHub repo pages** | Stars, last commit, language, README excerpt. Agents researching libraries need this. | API call via `/repos/<owner>/<repo>` |

## Medium (a weekend)

| Target | Why | Notes |
|---|---|---|
| **Etsy** | Huge handcraft market, no Shopify-style adapter exists. | Has structured JSON-LD per listing but uses some lazy-loaded data |
| **Walmart** | Massive catalog. They run an internal API but the page exposes a `__NEXT_DATA__` blob with everything we need. | Watch for region-specific URLs |
| **Best Buy** | Already partially works via JSON-LD but missing add-to-cart parity. | Build on existing jsonld.js |
| **Booking.com / Airbnb listings** | Travel agents = enormous use case. | Heavy SPA hydration; may need extension-side extraction |
| **DoorDash / UberEats menu pages** | Food ordering agents. | Same SPA caveat |
| **Spotify track pages** | Public metadata is in the `<head>`, but auth required for play actions (so: read-only adapter for now). | OG + JSON-LD |

## Hard (open an issue first)

| Target | Why | What makes it hard |
|---|---|---|
| **Amazon** | Probably the most-requested integration. | Aggressive bot protection. Extension-side extraction only, no server-side. |
| **Instagram / TikTok** | Social agents are coming. | Aggressive auth, frequent ToS changes, fragile selectors. |
| **Twitter / X** | Public threads, profile data. | API is now paid and gated; scrape paths are heavily protected. |
| **Nike / Adidas / hype DTC** | Sneakerheads use agents. | Aggressive bot protection + bot-defeating raffles; legal grey area on cart automation. |

## Formats (not site-specific)

- **OpenAPI / Swagger spec → tools** — given an OpenAPI URL, produce a tool list of every documented endpoint. Huge unlock for B2B API integrations.
- **`text/llms.txt`** — emerging convention for sites to declare agent-callable surface. We should respect it.
- **MCP server URL → tools passthrough** — if a site already publishes an MCP server, just proxy it through wmcp.sh with our caching layer on top.

## Anti-features we're explicitly skipping

These would not be merged even with working code:

- Paywall bypass for news sites, paid newsletters, research databases
- Login wall circumvention of any kind
- CAPTCHA solving
- Scraping behind authentication for accounts that aren't the user's own

## Bounty notes

If you ship an adapter from the **Medium** column above, open an issue and we'll comp you a Pro plan. **Hard** adapters that materially work are worth a reseller plan + a shout-out on the launch thread.
