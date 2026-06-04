# Distribution pack — "WebMCP & Me" (alexishearts persona)

**Source post (canonical):** https://alexishearts.substack.com/p/webmcp-and-me
**Persona:** Alexis (@alexishearts) — independent writer. Keep walled off from the wmcp.sh brand.

## ⚠ Persona-opsec rules (read once)
- Distribute as **Alexis only**. The post links to wmcp.sh (fine). The brand cites it as "coverage" in the wmcp.sh footer (one link, agreed) — that's the *only* brand→persona link.
- **Never** have the wmcp.sh / New1Direction / brand accounts upvote, comment-boost, or co-sign these. A single author sharing their own post = normal. Multiple accounts manufacturing consensus = vote manipulation → shadowban. This is the one way this backfires.
- Use Alexis's own accounts/emails everywhere below. Don't reuse anything tied to the brand.

---

## 1) dev.to — BEST fit (republish w/ canonical)
Devs read dev.to, it welcomes cross-posts, and the canonical tag protects your Substack's SEO.
- New post → paste the body in §6 → **Settings → "Canonical URL"** = `https://alexishearts.substack.com/p/webmcp-and-me`
- Tags: `ai`, `mcp`, `agents`, `webdev`
- Title: `WebMCP & Me — giving AI agents the keys to the web`

## 2) Hashnode / Medium — same republish
Same body + same canonical URL (Medium: "Import a story" auto-sets canonical; Hashnode has a canonical field). Tags: AI, LLM, Developer Tools, Web Scraping.

## 3) Reddit — share, value-first (follow each sub's self-promo rule)
Subs that fit: **r/mcp**, **r/LLMDevs**, **r/AI_agents**, r/LangChain. Lead with the problem, not the product. Read each sidebar; some require a "Self-promo Saturday" or a ratio.

**Title:**
```
Wrote up how I stopped writing brittle scrapers for every site my agent touches (MCP/WebMCP)
```
**Body:**
```
Every agent project I touched reinvented the same scraping logic — and the same Shopify
cart endpoints got rediscovered weekly. I finally wrote up the approach that got me out of
it: hand a URL to a universal MCP layer, get typed tools back, no per-site integration.

Covers the shopper-side vs admin-side distinction, the ~3-line drop-in, and the bit I found
clever — a client-side browser extractor for bot-blocked sites that warms a shared cache so
everyone's agent gets the schema fast after the first hit.

Full write-up (no paywall): https://alexishearts.substack.com/p/webmcp-and-me

Curious how others are handling agent→web access right now — still rolling your own?
```

## 4) X / Twitter — thread (@alexishearts)
```
1/ if you're building AI agents you know the wall: the model reasons fine, then you ask it
to check a price or add to cart and it hallucinates, gets bot-blocked, or you write yet
another brittle scraper.

wrote up how I stopped doing that 🧵
```
```
2/ the fix that clicked for me: a universal MCP translation layer. hand it a URL, get back
typed tools your agent can call. no per-site integration. works on public storefronts (4M+
Shopify, JSON-LD, OpenAPI) with no credentials — shopper-side, not admin-side.
```
```
3/ the part I think is underrated: for bot-blocked sites, a browser extension extracts the
schema client-side and pushes it to a shared cache. next agent asking for that URL gets it
in <100ms. every install makes it faster for everyone — even non-installers.
```
```
4/ full write-up, no paywall 👇
https://alexishearts.substack.com/p/webmcp-and-me
```

## 5) HN — DON'T submit this post here
HN flags promo-y Substack posts and undisclosed-affiliation submissions fast. Instead use the
existing **Show HN for the tool itself** (`launch/post-today.md` / `show-hn-trust.md`) under
whatever account you launch with — that's the right HN surface. Keep this blog piece to
dev.to / Reddit / X. (lobste.rs is invite-only + strict on self-promo — skip unless you have
standing there.)

## 6) Republish body (paste into dev.to / Medium / Hashnode)
> Canonical: https://alexishearts.substack.com/p/webmcp-and-me

```markdown
If you are building or experimenting with AI agents right now, you know the frustration.

We have these incredibly smart models that can write code and reason through complex logic,
but the second you ask them to interact with the actual internet — checking a product price,
comparing variants, or adding an item to a cart — they hit a wall.

They either hallucinate, get blocked by bot protection like Cloudflare or Akamai, or require
you to spend hours writing custom, brittle scrapers for every single website. Every framework
reinvents the same scraping logic, and the same Shopify cart endpoints get rediscovered weekly.

It shouldn't be this hard to let an agent browse a store. That is exactly the problem
[wmcp.sh](https://wmcp.sh) solves.

Think of it as a universal translation layer for the web, built on the Model Context Protocol
(MCP). Instead of writing a custom integration for every site, you just hand a URL to wmcp.sh.
It instantly returns a typed, ready-to-use list of tools your AI can understand and call.

- **Shopper-Side, Not Admin-Side:** Most e-commerce AI tools are built for merchants and
  require admin API keys. WebMCP is built for the shopper. It works on public storefronts
  (over 4 million Shopify stores, JSON-LD sites, and OpenAPI specs) without needing credentials.
- **Drop-In Integration:** Whether you're using the Anthropic SDK, OpenAI function calling,
  LangChain, or Cursor, it takes about three lines to drop into your stack. The AI gets the
  tools, decides what to call, and the call returns real data.
- **The Bot-Block Bypass:** For heavily protected sites that block standard server requests,
  the WebMCP Chrome extension extracts the schema client-side in a real browser.

Here's the best part: it gets faster the more people use it. When the extension extracts a
schema from a blocked site, it pushes it back to a shared global cache. The next time anyone's
agent asks for that URL, the cached schema is served in under 100ms. Every install makes the
API better for everyone — even users who never install the extension.

We're moving past chatbots just talking to us. We need them to act.

If you're tired of agents getting bounced by basic web firewalls or want to stop writing
custom scrapers, head over to [wmcp.sh](https://wmcp.sh) — paste a product URL into the live
demo and see the tools it generates.
```
