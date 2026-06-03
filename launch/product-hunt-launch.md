# Product Hunt launch kit

Two launches. **Launch A (QuickCatch)** is the one you want, but it needs the
Chrome Web Store link live first — a dead "Get it" link kills a PH launch. Fire
it the day the extension is approved. **Launch B (wmcp.sh)** is live and
deliverable now if you want to launch this week regardless.

Rule of thumb: PH resets at **12:01am Pacific**. Launch Tue/Wed/Thu. Reply to
every single comment within minutes for the first 4 hours. Don't buy upvotes
(PH detects it and demotes you).

---

## LAUNCH A — QuickCatch (fire when the extension is approved)

**Name:** QuickCatch

**Tagline (≤60 chars, pick one):**
- `Your AI grabs the Pokémon drop the second it restocks`
- `Catch every Pokémon drop at retail, right in your browser`

**Topics:** Chrome Extensions · E-Commerce · Artificial Intelligence · Productivity

**Links:** Website = https://wmcp.sh/drops · Get it = your Chrome Web Store URL

**Description (PH description field, ~260 chars):**
```
QuickCatch watches a Pokémon or TCG product page and adds the item to your cart
the moment it restocks, right in your own browser. No server, no proxies, no
cook group. Pay retail instead of resale, even on sites that block bots.
```

**Maker's first comment (paste the second the post goes live):**
```
Hey Product Hunt 👋

Restock alerts always drove me nuts. They tell you a set is back, and by the
time you tap through it's gone and a reseller already has it listed for triple.

So I built QuickCatch. You open the product page, hit "Watch this drop," and it
watches the page in the background. The second it restocks, it opens the page
and drops the item in your cart, so you go straight to checkout. You pay retail
instead of resale.

The part I'm proud of: it runs in your own browser and your own logged-in
session. No datacenter server, no proxies, no $50/mo cook group. That's also why
it reaches pages that block server-side bots, because to the store it just looks
like you, because it is you. You finish checkout yourself.

It's free to install. There are paid tiers if you want to watch a bunch of items
at once, but the core catch-it-at-retail flow is free.

While building it I also made two free calculators, no signup:
- Retail vs resale: https://wmcp.sh/tools/pokemon-resale-calculator
- Grading ROI (PSA/CGC): https://wmcp.sh/tools/pokemon-grading-calculator

Would love your feedback, especially which stores you want supported next.
```

**Gallery (5 images, 1270×760):**
1. Hero: tagline over the popup on a real Pokémon Center / Walmart product page.
2. "So easy it feels like cheating" — the 3 steps (add it, arm the page, it carts it).
3. The "Watch this drop" popup armed on a real store, plain English (no JSON/terminal).
4. The free retail-vs-resale calculator (it's pretty + shareable).
5. The vs-bots comparison: QuickCatch (free, your browser) vs AIO bots (servers, proxies, monthly).

A 30–60s screen-recording of arming a watch + the cart firing beats any image. PH posts with video get ~2.7× the upvotes.

**Seed these replies (have them ready for the obvious questions):**
- *"Is this a bot / will I get banned?"* → "It acts as you, in your own session, on the page you opened, and you complete checkout. It doesn't run from a server or auto-pay, which is the part stores flag. It's a shopping assistant, not a checkout bot."
- *"Does it work on [store]?"* → "Today: Pokémon Center, Walmart, Target, Best Buy, Sam's Club, Costco, GameStop, Amazon, TCGplayer. Tell me what else you want and I'll add it (the selectors are server-driven, so I can add a store without a new release)."
- *"How is it different from a restock alert?"* → "Alerts ping you and leave the race to you. QuickCatch does the cart step for you the moment stock returns."
- *"Is it really free?"* → "Yes, install and watch is free. Pro/Reseller just add watching more items at once."

---

## LAUNCH B — wmcp.sh (live now, launch any day)

**Name:** wmcp.sh

**Tagline (≤60, pick one):**
- `The hub for the Model Context Protocol`
- `Connect, grade & build any MCP server, one hub`

**Topics:** Developer Tools · Artificial Intelligence · API · Open Source (if applicable)

**Links:** Website = https://wmcp.sh/connect

**Description (~260 chars):**
```
wmcp.sh is the MCP hub: connect any MCP server with OAuth handled and an
independent A–F trust grade, or turn any URL into agent-callable MCP tools, no
server to build. One endpoint for Claude, Cursor, Codex, or any agent.
```

**Maker's first comment:**
```
Hey Product Hunt 👋

MCP is taking off but it's fragmented: every server is hand-built one per
service, you paste OAuth tokens by hand, and you have no real way to know which
third-party servers are safe to point an agent at.

So I built wmcp.sh as the MCP hub — three things in one place:

1. Connect — hook up an MCP server with one OAuth click. The token is vaulted
   (encrypted, never in tool args) and auto-refreshed. Your agent just calls
   wmcp.sh/mcp/<provider>.
2. Grade — an independent A–F trust grade for any MCP server, continuously
   watched for drift and rug-pulls. Free, and your agent can gate on it before
   it executes.
3. Build — drop in any URL and get agent-callable MCP tools back, no server to
   write. The read tier is free; the paid layer proxies real actions with
   governance (kill switch, spend caps, audit).

Built on Cloudflare Workers. Free tier is live: https://wmcp.sh/connect
Would love feedback from anyone building or shipping MCP servers.
```

**Gallery:** the /connect hub (connect + grade + build pillars); a trust-grade report with the A–F badge; the API call → tool-list JSON; the directory of servers; the governance dashboard.

---

## Launch-day checklist (either launch)
- [ ] Post at 12:01am PT, Tue–Thu.
- [ ] Paste the maker's first comment immediately.
- [ ] Post your gallery + a video.
- [ ] Tell your email list / X followers it's live (link the PH post, ask for honest feedback — never "please upvote", PH penalizes that).
- [ ] Reply to every comment within minutes for the first 4 hours.
- [ ] Drop the free calculator link in replies where it's genuinely helpful.
- [ ] Have the buy path warm — the install (or signup) link must work on the first click.

## Don't
- Don't launch QuickCatch until the Chrome Web Store listing is live and the link works.
- Don't ask for upvotes anywhere. Ask for feedback.
- Don't launch on Fri/Sat/Sun or a US holiday.
