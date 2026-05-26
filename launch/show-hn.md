# Show HN

## Title (pick one)

Title options, sharpest first. **Title is 80% of click-through on HN.**

1. `Show HN: wmcp.sh – Drop any product URL into your agent's toolset` **← recommended**
2. `Show HN: A hosted MCP server that turns any e-commerce URL into agent tools`
3. `Show HN: wmcp.sh – One API to give LLM agents live shopping tools`

## Body

```
This started because I wanted to give a Claude agent the ability to add
something to a Shopify cart without writing a custom scraper for every
store. WebMCP/MCP solves the schema side, but somebody still has to write
the adapter per site. So I built a hosted version.

You paste a URL, you get back a WebMCP-shaped tool list:

  curl 'https://wmcp.sh/api/v1/tools?url=https://www.allbirds.com/products/mens-wool-runners'

Two adapters work server-side today:
- Shopify (live: read product, variants, add_to_cart actually fires)
- Generic JSON-LD (any site with schema.org Product markup)

For sites behind Akamai/Incapsula there's a Chrome extension that
extracts client-side and pushes the schema back. Cached schemas are shared
across users — so every install makes the API faster for everyone.

Stack: Hono + Cloudflare Workers + KV. The whole worker is ~10KB, deploys
in 3 seconds. Free tier is 100 reads/day, paid plans for live executes.

What I'd love feedback on:
- The schema shape (does it actually match what LangChain/CrewAI/Claude
  agents want as tools?)
- Which sites/categories you'd want adapters for next
- Whether the cache-back model feels reasonable or sketchy

Demo on the page is live, paste any allbirds/everlane/outdoorvoices URL
and it works without a key.

https://wmcp.sh
```

## Rules before posting

- **Don't start with "Hi HN".** Cliché. Drops engagement.
- **No marketing words** — "revolutionize", "powerful", "seamless". HN downvotes them.
- **Post Tue–Thu, 8–10am US Pacific.** Avoid Fri afternoons and weekends.
- **Be there for the first 2 hours.** HN ranks heavily on early comment velocity — reply to every top-level comment within ~10 min.
- **Don't reply defensively to criticism.** Acknowledge → state what you'll do about it → move on. The audience watches how you handle pushback.

## Prepared answers for likely questions

> "Why not just use Browserbase / Playwright in the cloud?"

Because most product pages don't need a real browser — Shopify exposes JSON, schema.org sites embed JSON-LD, and the long tail can be cached client-side via the extension. Headless browsers are expensive and slow. We use the cheap path first and fall back to the extension for the bot-protected long tail.

> "Does this work on Amazon?"

Not today, on purpose. Amazon's bot protection is aggressive and a hosted scraper would get burned fast. The extension can extract client-side and push the schema back, but I haven't shipped that adapter yet. If you're building an Amazon agent, the extension path is the way.

> "Isn't this just scraping with extra steps?"

A scraper outputs unstructured data. We output MCP-shaped tools an agent can call — with explicit input schemas, descriptions, and live actions like `add_to_cart`. The difference matters when you're handing them to an LLM that has to *decide* which to call.

> "What about Terms of Service?"

We only hit public, unauthenticated endpoints. The Shopify `/products/<slug>.json` is documented public API. JSON-LD is what sites embed *for* automated consumers (Google, Bing, you). We don't bypass paywalls, login walls, or rate limits.

## URL to submit

`https://wmcp.sh` (not the GitHub repo — the live demo converts better)

After posting, note the HN submission URL — Twitter and Substack should link to it for the next 48h.
