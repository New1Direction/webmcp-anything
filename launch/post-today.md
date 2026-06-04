# Post today — ready-to-paste traffic for the buy path

Money path is verified live (checkout returns cs_live). The job today is eyeballs.
Copy-paste these. Order them top to bottom; each takes ~5 minutes.

---

## 1) Show HN (Hacker News) — biggest same-day dev traffic

Go to news.ycombinator.com/submit. Post 8–10am ET on a weekday for best reach.

**Title:**
```
Show HN: wmcp.sh – turn any URL into MCP tools an AI agent can use
```

**URL:** `https://wmcp.sh`

**First comment (paste right after posting):**
```
I kept hand-building one MCP server per service and got tired of it. wmcp.sh is
the universal adapter: drop in any URL and it returns agent-callable tools
(read price, add to cart, call an API) as MCP / tool-use JSON for Claude,
OpenAI, or any agent. One endpoint, any site.

The read tier is free. Reading is the easy part though — the useful part is
acting, so the paid layer holds the credentials and proxies the action with
governance on top (kill switch, spend caps, audit).

One thing I learned: server-side fetch is blocked or JS-gated on a lot of big
sites, so a browser extension reads the rendered page client-side and shares the
same adapters as the worker. Built on Cloudflare Workers.

Happy to answer anything.
```

---

## 2) Reddit — the free calculator (value-first, no hard sell)

Subs: r/PokemonTCGDeals, r/pkmntcgdeals, r/PokeInvesting. **Read each sub's
self-promo rules first** — lead with the free tool, never the paywall.

**Title:**
```
I made a free retail vs resale calculator for Pokémon (no signup)
```

**Body:**
```
I kept eyeballing whether a set was worth grabbing at retail vs just buying it
resold, so I built a quick calculator. Pick a product (or punch in your own
numbers) and it shows what you save buying at retail and the margin if you flip
it. Free, no login.

https://wmcp.sh/tools/pokemon-resale-calculator

Resale prices move daily so you edit that field to today's number. Hope it helps
someone decide on the next drop.
```

---

## 3) X / Twitter — quick thread

```
built a free tool: retail vs resale calculator for Pokémon drops

pick a set, see what you save at retail and your margin if you flip it

no signup, just useful 👇
https://wmcp.sh/tools/pokemon-resale-calculator
```
```
the bigger thing it's part of: QuickCatch watches a drop and adds it to your
cart the second it restocks, in your own browser, even on sites that block bots

retail instead of resale, no proxies, no cook group
```

---

## 4) Top 5 directory submissions (Track A, wmcp.sh, live now)

For each: paste the tagline + short description, category = AI / Developer Tools / MCP.

**Tagline (all):** `Any URL → tools your AI agent can use`

**Short description (all):**
```
wmcp.sh turns any website into agent-callable MCP tools — no MCP server to
build. Drop in a URL, get a JSON tool list (read price, add to cart, call an
API) for Claude, OpenAI, or any agent. Free read tier; governed paid actions.
```

| # | Directory | Submit at | Notes |
|---|---|---|---|
| 1 | Smithery | smithery.ai | MCP server hub — highest intent |
| 2 | mcp.so | mcp.so | submit your server |
| 3 | Glama | glama.ai/mcp/servers | MCP directory |
| 4 | PulseMCP | pulsemcp.com | MCP news + directory |
| 5 | AlternativeTo | alternativeto.net | list as alternative to Composio, Pipedream, Zapier |

(Full ranked list + per-surface variants: launch/directory-submission-kit.md)

---

## 5) The one paid push that's deliverable today

The platform plans (Builder/Pro/Reseller) mint a real wmcp.sh API key on
purchase, so a dev who buys gets a working product immediately. The Show HN +
MCP directories above point that audience straight at the buy path. That is the
cleanest same-day sale.
