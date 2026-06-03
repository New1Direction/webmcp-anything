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

**Tagline (≤60):** `Turn any URL into tools your AI agent can use`

**Topics:** Developer Tools · Artificial Intelligence · API · Open Source (if applicable)

**Links:** Website = https://wmcp.sh

**Description (~260 chars):**
```
wmcp.sh turns any website into agent-callable MCP tools, no MCP server to build.
Drop in a URL, get a JSON tool list (read price, add to cart, call an API) for
Claude, OpenAI, or any agent. Free read tier; governed paid actions.
```

**Maker's first comment:**
```
Hey Product Hunt 👋

Every MCP server I touched was hand-built, one per service. It felt backwards.
So I built wmcp.sh: drop in any URL and get back agent-callable tools as
MCP / tool-use JSON. One endpoint, any site.

Reading is the easy part, so it's free. The useful part is acting, so the paid
layer holds the credentials and proxies the action with governance on top:
kill switch, spend caps, audit.

One thing I learned: server-side fetch is blocked or JS-gated on a lot of big
sites, so a browser extension reads the rendered page client-side and shares the
same adapters as the worker. Built on Cloudflare Workers.

Free tier is live, would love feedback from anyone building agents.
```

**Gallery:** the API call → tool-list JSON; the directory; a vs-Composio comparison; the governance dashboard.

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
