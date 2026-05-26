# Substack post

## Title (pick one)

1. **Your AI agent can talk to ChatGPT but not to Allbirds. Here's why.** ← recommended
2. Giving LLM agents hands instead of just a mouth
3. The missing layer between LLM agents and the actual web

## Subtitle / preview text

> A hosted MCP server, a Chrome extension, and a small bet on shared infrastructure.

## Body (~1100 words — paste as-is into Substack)

---

For the last six months I've been building agents — the LangChain kind, the Claude tool-calling kind, the "give an LLM a Python REPL and watch it suffer" kind. They've gotten startlingly good at one thing: producing tokens. They're still startlingly bad at the thing I actually wanted them to do, which is *interact with the parts of the internet I use every day.*

Here's a specific example. I asked Claude:

> "Watch the Allbirds Wool Runners in size 10, and add them to my cart when the price drops below $90."

The model knew exactly what I wanted. It could write a beautiful explanation of how it would do this — scrape the page, parse the price, schedule a check, fire a cart request. What it could not do was the thing.

There are two reasons for that. One is the obvious one: web pages are not structured for agents. The other is more interesting: even when an agent *could* parse a page, no shared layer exists that turns the parsing into a callable tool. Every framework reinvents this. Every developer writes a scraper for the specific site they care about. The same Shopify cart endpoint gets rediscovered a thousand times a week.

I spent a weekend looking at this problem and noticed something. The "thousand different websites" framing is wrong. There are really only **three patterns** under the hood:

1. **Shopify** — about 4 million stores. They all expose `/products/<slug>.js` and `/cart/add.js` as plain JSON. If you know the URL, you already know the API.
2. **schema.org JSON-LD** — Best Buy, Walmart, REI, most news sites with reviews, most e-commerce that isn't Shopify. They embed structured product data in a `<script type="application/ld+json">` tag because Google rewards it.
3. **Everything else** — the long tail of bespoke sites, the bot-protected ones (Amazon, Nike), the SPAs that hydrate from a private API.

If you write *two* good adapters, plus a way to handle the third bucket, you cover the majority of the consumer web.

So I built that. It's at [wmcp.sh](https://wmcp.sh). You paste a URL, you get back a list of agent-callable tools.

```bash
curl 'https://wmcp.sh/api/v1/tools?url=https://www.allbirds.com/products/mens-wool-runners'
```

```json
{
  "adapter": "shopify",
  "product": { "title": "Men's Wool Runner — Natural Grey" },
  "variants": [ { "id": "...", "size": "10", "price": "$110.00" } ],
  "tools": [
    { "name": "get_price", "result": "$110.00" },
    { "name": "add_to_cart", "action": { "kind": "shopify_add", ... } }
  ]
}
```

Those tools are MCP-shaped. You can hand them straight to Claude, Cursor, an OpenAI function-call loop, a LangChain agent, whatever you're building. No per-site adapter, no scraping code, no Selenium-driving-Chrome hellscape. For Shopify, `add_to_cart` is **live** — the API actually fires the request and your agent gets a real cart token back.

For the long-tail sites where a server-side fetch gets blocked by Akamai or Incapsula, there's a Chrome extension. It extracts the schema client-side, in your browser, where bot protection doesn't fire, and pushes it back to the hosted API. The next time anyone — including a totally different developer in a totally different agent — asks `wmcp.sh` for that URL, the cached schema is already there. Instantly. Server-side. No extension required.

That last part is the part I'm most interested in. **The product gets better the more people use it.** Not in a vague "more data = better model" way, but in a literal "each Chrome install adds N more sites to the shared registry" way. Today there's a directory at [wmcp.sh/directory](https://wmcp.sh/directory) showing exactly which URLs have working tools. Right now it's a handful, seeded by me. In a month I want it to be in the thousands. In a year, in the hundreds of thousands, including every site any AI agent might want to act on.

This is the part nobody talks about with MCP. The protocol is good. The Anthropic launch was great. But "MCP" by itself solves the *plumbing* of agent-tool conversation. It doesn't solve the *content* — who actually writes the tools for each website? If every framework, every agent app, every solo developer has to wire up their own Shopify adapter, you don't have an ecosystem. You have a thousand parallel reinventions of the same wheel.

I think the answer is shared, hosted, cache-backed adapters. One layer everyone benefits from, with a network effect baked in.

A few honest disclaimers about what doesn't work yet:

- **Amazon** is hard. Bot protection on AWS-routed scrapes is brutal. The extension works because it runs in your real browser. The hosted API doesn't, today.
- **Search** isn't done. You can extract product tools from a specific URL but not "search Allbirds for runners under $100." That's the next adapter.
- **Stripe Checkout / Shopify checkout completion** are scoped out for now. We can add to cart. Actually completing payment requires real session handoff that I haven't designed yet.
- The free tier (100 reads/day, no live execute) is generous enough to try. Pro is $29/month and unlocks live execute. If you're building something commercial, get in early — pricing will only go up as the directory fills out.

If you build agents and want to give them hands, try it. If you have a site you want indexed and it doesn't work today, tell me — I'll write the adapter, or accept your PR. If you've thought about the "MCP needs an adapter ecosystem" problem from a different angle, I'd love to compare notes.

The launch is on Hacker News this week. If you want to be early, the API is already live and the directory grows every time someone hits it.

---

*If this resonated, the next post is about the surprisingly small surface area of "act on the web" — three patterns, two adapters, and the long tail.*

---

## Pre-publish checklist

- [ ] Replace the Allbirds price/title with whatever's accurate at publish time (prices drift)
- [ ] Embed the demo video at the top, before the first paragraph
- [ ] Cross-post / link the HN thread as the canonical reference link
- [ ] Send to 3–5 friends for typo + flow review before publishing
- [ ] Schedule for Tue 10am ET (same window as the HN post — traffic compounds)
- [ ] Add a "Subscribe" CTA at the bottom (Substack's default is fine)

## SEO

Substack handles most of this automatically, but worth double-checking:
- Custom slug: `agent-hands-allbirds` or similar (avoid the title's full sentence)
- Featured image: a frame from the demo video, or the 3D cube render from the landing
- Tags: `AI agents`, `MCP`, `Claude`, `LLM tools`, `Open source`
