# Directory submission kit — wmcp.sh + QuickCatch

Backlinks from high-DR directories do three things: raise your domain rating (so
all 3k pages rank easier), put you in front of in-market browsers, and feed AI
engines (ChatGPT/Claude/Perplexity/AI Overviews pull "best [category]" answers
from high-DR directories — AI-referred traffic converts 6–27× higher).

**Two tracks, two audiences. Don't mix them.**

| Track | Product | Audience | Status | Lands links into |
|---|---|---|---|---|
| **A — Platform** | wmcp.sh | devs, agent builders | LIVE now | /, /agent-ready, /vs/*, /integration/*, /mcp/grade |
| **B — Consumer** | QuickCatch | Pokémon/TCG collectors + resellers | extension in review | /drops/*, /tools/* |

Track A you can do **today**. Track B starts the day QuickCatch publishes (the
install link needs to work, or you burn the first impression).

---

## 0) Readiness checklist (the skill's hard rule: destinations before directories)

- [x] Public, no password wall (wmcp.sh live; QuickCatch store page pending)
- [x] Pricing exists (Stripe Pro $99 / Reseller $299 live on every /drops page + /managed for platform)
- [x] Privacy policy + terms live (wmcp.sh/privacy)
- [x] Destination pages live: 30 vs-bot comparisons, set/store/combo pages, glossary, best-of, the calculator
- [x] FAQ + BreadcrumbList + SoftwareApplication schema on pages
- [ ] Logo assets: PNG + SVG + **square 1024×1024** + favicon  ← export the orange coin icon at these sizes
- [ ] 5–8 real screenshots @ 1920×1080 (you have the 1280×800 store shots — re-export larger)
- [ ] 60–90s demo video (record the calculator + a Watch-this-drop run)  ← biggest lever for Product Hunt (2.7× upvotes)
- [ ] QuickCatch live in Chrome Web Store (Track B blocker)

Soft blocks (do anyway, fix later): video, G2 reviews.

---

## 1) Assets to have open while submitting

- Square logo 1024×1024 (PNG, transparent)
- Banner/OG image (1280×640)
- 5 screenshots (calculator, a drop page, the popup, a comparison table, a store scene)
- One-liner, 50-char tagline, short (160-char), medium (~500-char), long (~1500-char) descriptions — below
- Category tags: Track A = "AI / Developer Tools / MCP"; Track B = "Shopping / Productivity / Browser Extension"
- Maker name + founder Twitter/X (for Product Hunt)

---

## 2) Positioning library (vary it per surface — never paste the same blurb twice)

### Track A — wmcp.sh

**Tagline (≤50 char):** Any URL → tools your AI agent can use

**Short (160):** wmcp.sh turns any website into agent-callable MCP tools — no MCP server to build. One endpoint, any URL, a JSON tool list for Claude, OpenAI, or any agent.

**Medium (~500):** Every MCP server today is hand-built, one per service. wmcp.sh is the universal adapter: drop in any URL and get back agent-callable tools (read price, add to cart, call an API) as MCP/tool-use JSON. Free public read tier; the paid layer holds credentials and proxies the action with trust + governance (kill switch, spend caps, audit) so agents can act safely. Built on Cloudflare Workers.

**Per-surface lead:**
- MCP/agent directories → "The universal MCP adapter — any URL becomes agent tools, no per-service server."
- AI directories (TAAFT/Futurepedia) → "AI-first: give any agent real tools from any website in one call."
- Dev directories → "Edge worker that extracts MCP tools from OpenAPI/JSON-LD/Shopify and proxies governed actions."
- Hacker News (Show HN) → lead with the technical insight: server-side fetch is blocked on big sites, so the browser extension reads the rendered page client-side; the worker + extension share the same adapters.

### Track B — QuickCatch

**Tagline (≤50 char):** Catch every Pokémon drop at retail

**Short (160):** QuickCatch watches a Pokémon or TCG product page and adds the item to your cart the moment it restocks — in your own browser, free, even on sites that block bots.

**Medium (~500):** Restock alerts tell you it's back; by the time you tap through it's gone. QuickCatch does the next step. It watches the product page in the background and carts the item the second it restocks, so you pay retail instead of resale. It runs in your own browser and your own login — no server, no proxies, no cook group — so it reaches the same pages you do. Free to install; Pro and Reseller tiers watch more items at once.

**Per-surface lead:**
- AlternativeTo / extension lists → "A free, browser-based alternative to server restock bots — built for Pokémon/TCG collectors."
- Deal communities → "Cops the restock at retail so you skip the scalpers."
- Reseller communities → "Reseller tier watches the most items at once, top priority."
- Product Hunt → "Your AI watches the drop and grabs it the moment it restocks."

---

## 3) Track A directories (do now — wmcp.sh is live)

### Tier 1 — high DR, must-do
| Directory | URL | Notes |
|---|---|---|
| Product Hunt | producthunt.com | Schedule a launch day; need video + gallery. DR 90+. |
| Hacker News (Show HN) | news.ycombinator.com | "Show HN: wmcp.sh — any URL → MCP tools for agents". Post 8–10am ET weekday. |
| AlternativeTo | alternativeto.net | List as alternative to Composio / Pipedream / Zapier. |
| SaaSHub | saashub.com | Free listing, decent DR, alternative-keyword pages. |

### Tier 1 — AI tool directories
| Directory | URL | Notes |
|---|---|---|
| There's An AI For That | theresanaiforthat.com | Largest AI directory; paid fast-track optional. |
| Futurepedia | futurepedia.io | Free + paid tiers. |
| Future Tools | futuretools.io | Submit via form. |
| Toolify | toolify.ai | High traffic. |
| AI Scout / aitools.fyi / Insidr | various | Batch these. |

### Tier 1 — MCP / agent registries (your real moat — niche, high-intent)
| Directory | URL | Notes |
|---|---|---|
| Official MCP registry | github.com/modelcontextprotocol/servers | PR to the community servers list. |
| Smithery | smithery.ai | MCP server hub. |
| mcp.so | mcp.so | Submit your server. |
| Glama | glama.ai/mcp/servers | MCP directory. |
| PulseMCP | pulsemcp.com | MCP news + directory. |
| MCP Market | mcpmarket.com | Listing. |
| Awesome MCP Servers | github "awesome-mcp-servers" lists | PR. |

### Tier 2 — dev / general
BetaList, Peerlist, Uneed, Tinylaunch, dev.to (write a launch post), Indie Hackers (Show IH), libhunt/awesome lists.

---

## 4) Track B directories (the day QuickCatch publishes)

### Tier 1
| Directory | URL | Notes |
|---|---|---|
| Chrome Web Store | (done) | The canonical listing — everything links here. |
| Microsoft Edge Add-ons | partner.microsoft.com/dashboard/microsoftedge | Repackage the same MV3 zip — free second channel. |
| Product Hunt | producthunt.com | Consumer framing; great for an extension. |
| AlternativeTo | alternativeto.net | "alternative to restock bots / cook groups". |

### Tier 1 — extension + tool directories
| Directory | URL |
|---|---|
| Chrome-stats / extension review sites | chrome-stats.com |
| There's An AI For That | theresanaiforthat.com (it's AI-powered) |
| Uneed / Toolfolio / SaaSHub | various |

### Tier 2 — Pokémon / TCG / deal communities (engage, don't spam)
| Community | Where | Rule |
|---|---|---|
| r/PokemonTCG, r/PokeInvesting | reddit.com | Read each sub's self-promo rules. Lead with value (share the free calculator), not the paid pitch. |
| r/PokemonTCGDeals / r/pkmntcgdeals | reddit.com | Deal-friendly; the free tool + restock guides fit. |
| TCG Discord servers | various | Drop the calculator in #tools when relevant. |
| Slickdeals / deal forums | slickdeals.net | Post genuine retail restocks you catch. |

**Reddit caution:** most subs ban direct self-promo. Best play: be a real participant, share the **free calculator** and **glossary/best-of guides** as helpful resources (they have no hard paywall), and let the funnel do the selling. One bad spam post gets the domain shadowbanned.

---

## 5) Order of operations

**This week (Track A, wmcp.sh):**
1. MCP registries (Smithery, mcp.so, Glama, PulseMCP, official servers PR) — niche but highest-intent.
2. AlternativeTo + SaaSHub (alternative-keyword link equity).
3. AI directories batch (TAAFT, Futurepedia, Future Tools, Toolify).
4. Schedule Product Hunt + write the Show HN.

**When QuickCatch publishes (Track B):**
1. Edge Add-ons (free second store).
2. AlternativeTo + extension directories.
3. Product Hunt (consumer launch with video).
4. Then, gently, the Pokémon/deal communities via the free calculator.

**Always:** build the destination page first (done), submit second.

---

## 6) Submission tracker (copy into a sheet)

| Date | Directory | Track | Profile/URL submitted | Status (todo/submitted/live) | Backlink? (dofollow/nofollow) | Notes |
|---|---|---|---|---|---|---|
| | Smithery | A | | todo | | |
| | mcp.so | A | | todo | | |
| | Glama | A | | todo | | |
| | PulseMCP | A | | todo | | |
| | MCP servers PR | A | | todo | | |
| | AlternativeTo | A | | todo | | |
| | SaaSHub | A | | todo | | |
| | TAAFT | A | | todo | | |
| | Futurepedia | A | | todo | | |
| | Product Hunt | A | | todo | | schedule |
| | Show HN | A | | todo | | |
| | Edge Add-ons | B | | blocked: extension review | | |
| | AlternativeTo | B | | blocked: extension review | | |
| | Product Hunt | B | | blocked: extension review | | |

---

## 7) Don't-do list
- Don't pay for spammy "submit to 100 directories" services — low-DR link farms can hurt.
- Don't copy-paste the same description (AI engines penalize duplicate; each audience wants different framing).
- Don't submit QuickCatch anywhere before the store listing is live.
- Don't hard-pitch in Reddit/Discord — share the free tool, let the funnel convert.
