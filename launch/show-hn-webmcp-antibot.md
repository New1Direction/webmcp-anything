# Launch kit — the anti-bot wedge (June)

The wedge in one sentence: **the harder a site blocks bots, the more valuable WebMCP is**, because the extension acts as *you*, in *your* browser, with *your* logged-in session — so an agent can finally use the sites it's locked out of (LinkedIn, Amazon, Instagram, ticketing, airlines, real-estate portals).

Don't claim the hosted API does anti-bot sites — it doesn't (datacenter fetch gets 403'd). The anti-bot capability is the **extension**. Keep that honest in every post.

---

## Hacker News — "Show HN"

**Title (≤80 chars, no hype, no emoji):**
> Show HN: Let your AI agent use the websites that block bots (via your browser)

**Body:**
> AI agents can call APIs all day but go blind the moment a site blocks bots —
> which is most of the sites people actually live on (LinkedIn, Amazon,
> Instagram, ticketing, airlines, Zillow). You can't point an agent at them:
> datacenter IPs get a 403 or a captcha.
>
> wmcp.sh takes a different path. It's two parts:
>
> 1. A hosted MCP server that turns any *public* URL into agent-callable tools
>    (Shopify storefronts, OpenAPI specs, schema.org JSON-LD). `tools/list` is
>    free; paste one config line into Claude/Cursor/Codex.
>
> 2. A Chrome extension (WebMCP) that handles the sites the server can't reach —
>    by extracting tools from the *rendered page in your own browser, in your own
>    session*. It's not scraping from a server farm; it's your browser, already
>    logged in. So the bot wall that stops everyone else is exactly where this
>    works.
>
> One adapter layer powers both: it reads schema.org JSON-LD (Product, Article,
> Recipe, Movie, JobPosting, Event, LocalBusiness, …) plus OpenAPI specs, and
> emits MCP tools. The extension and the server share that code.
>
> It's MIT-licensed adapters, real MCP (JSON-RPC over Streamable HTTP), and the
> hosted demo needs no signup. Try pasting any URL: https://wmcp.sh
>
> Honest about limits: live execute on protected sites runs through the
> extension (your session), the hosted server only does public URLs, and yes —
> this lives in the grey of site ToS the same way browser automation and
> accessibility tooling do. It runs as the user, with the user's own access.
>
> Would love feedback on the extraction approach and which sites you'd want next.

**First follow-up comment (post yourself, 1 min after):**
> Tech notes: 5-tier extraction cascade (Shopify → OpenAPI → JSON-LD → crypto →
> LLM fallback), schemas cached + shared so repeat URLs are <100ms. The extension
> only reads what's already rendered for you — no headless farm, no proxy pool.
> Stack is a single Cloudflare Worker + KV. Ask me anything.

**Timing:** post Tue–Thu ~8:30am ET. Reply to every comment in the first 2 hours.

---

## Product Hunt (tagline + first comment)

**Name:** wmcp.sh — WebMCP for any site
**Tagline:** Give your AI agent the websites that block bots
**First comment:** Agents can hit APIs but get walled out of the sites people
actually use. wmcp.sh exposes any URL as MCP tools — and a browser extension
cracks the bot-blocked ones by running in your own session. One line into
Claude/Cursor/Codex. Free to try, no signup.

---

## X / thread (5 posts)

1. Your AI agent can call the Stripe API but can't read a LinkedIn profile,
   check an Amazon price, or grab a concert ticket. Because those sites block
   bots. We fixed that the only way that actually works: your own browser. 🧵
2. Most "agent + web" tools scrape from a server. Big sites 403 that instantly.
   WebMCP runs in *your* browser, in *your* logged-in session — so the bot wall
   is exactly where it shines. The harder the site blocks, the more it's the
   only thing that works.
3. It reads the structured data already on the page (schema.org JSON-LD: products,
   articles, recipes, movies, jobs, events, businesses) and turns it into
   agent-callable MCP tools. Plus any OpenAPI spec → instant tools.
4. Public URLs work from the hosted server with zero install — paste one line
   into Claude/Cursor/Codex. Protected sites work through the extension.
5. Free to try, no signup, MIT adapters: https://wmcp.sh — what site do you wish
   your agent could use? Reply and I'll add it.

---

## Reddit (r/LocalLLaMA, r/ChatGPTCoding, r/ClaudeAI) — softer, no link in title

**Title:** I made my AI agent use sites that block bots by running in my own browser
**Body:** short story version of the HN post; link in first comment, not the title.

---

## Sequencing for June

- Day 0: submit extension to Chrome Web Store (review runs in background).
- While in review: finalize landing's anti-bot section + 5–10 programmatic
  "use <site> with your AI agent" SEO pages.
- Extension approved → HN Show HN (Tue–Thu) → same day PH → X thread → Reddit
  over the following days. One channel/day, ride each wave, reply relentlessly.
