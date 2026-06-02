# Chrome Web Store submission — paste-in kit

Upload file: **`wmcp-extension-v0.1.0.zip`** (repo root). Privacy policy URL:
**https://wmcp.sh/privacy** (live).

Submit from https://chrome.google.com/webstore/devconsole → New item → upload the
zip → fill the tabs below.

---

## Store listing tab

**Name** (already in manifest): `WebMCP Anything`

**Summary** (≤132 chars):
> Your AI agent on the sites that block bots — catch restocks & limited drops, read any page, in your own browser.

**Category:** Developer Tools  ·  **Language:** English

**Description:**
> The stuff worth having sells out in seconds — Pokémon boxes, sneaker launches,
> console & GPU restocks — and those sites block bots hardest. AI agents go blind
> there. WebMCP Anything fixes that by working where a server can’t reach: the
> page you’re already on, in your own browser and your own session. You stay in
> control — it acts only on the page you choose, when you choose.
>
> It reads the structured data a page already publishes (schema.org JSON-LD, meta
> tags) and turns it into agent-callable WebMCP/MCP tools your agent can use:
>
> • Stock & price — check_stock, get_price (watch a drop, know the instant it flips)
> • Cart — add_to_cart, list_variants (grab your size/qty when it opens)
> • Articles, recipes, movies, jobs, events, local businesses — full read tools
>
> So your agent can poll check_stock on a hyped drop and fire add_to_cart the
> moment it restocks — on a site no datacenter bot can even load.
>
> Pairs with the free hosted server at wmcp.sh for public URLs (paste one line
> into Claude, Cursor, or Codex). The extension handles the sites a server fetch
> can’t — by running as you, on the page you choose.
>
> Open-source adapters (MIT). No account required to try.
>
> Privacy: extraction happens locally in your browser. Nothing about the pages
> you visit is sent anywhere unless you explicitly turn on the shared cache.

**Screenshots** (1280×800, in `launch/store-assets/` — upload in this order):
1. `wmcp-store-1-hero.png` — "Let your AI agent cop the drop" (the hook).
2. `wmcp-store-howto.png` — "So easy it feels like cheating": 3 steps + the key message (arm it BEFORE the drop, no racing to checkout).
3. `wmcp-store-2-pokemoncenter.png` — Pokémon Center: Ascended Heroes ETB ($59.99) restocks → in your cart.
4. `wmcp-store-3-walmart.png` — Walmart: 151 Ultra-Premium ($119.99) back in stock → in your cart.
5. `wmcp-store-4-samsclub.png` — Sam's Club: Prismatic Evolutions ETB ($49.99), beat the 50+ carts.
   Real store chrome + real product photos + real MSRP; popups are plain-English (no code/JSON).
   (Source: launch/store-assets/scenes.html — regenerate via a local server + 1280×800 headless shot.)

---

## Privacy practices tab (the part that gets people rejected — answer all)

**Single purpose** (one sentence):
> Turn the web page the user is viewing into agent-callable WebMCP/MCP tools.

**Permission justifications:**

- **storage** —
  > Stores the user’s own settings and (optionally) their wmcp.sh API key locally
  > on their device, so preferences persist between sessions.

- **host permissions (`<all_urls>`)** —
  > The extension’s single purpose is to turn whatever page the user is viewing
  > into agent-callable tools. Because the user can invoke it on any site they
  > choose, it needs to read the structured data (schema.org JSON-LD and meta
  > tags) of the current page on any host. It reads only the page the user is
  > actively viewing, on demand — it does not run in the background or read other
  > tabs.

- **Remote code:** No — all logic is bundled in the package; no remote scripts,
  no eval.

**Data usage — disclose honestly (check these):**
- ☑ **Website content** — read from the current page to extract tools. Processed
  locally; transmitted off-device only if the user opts into the shared cache
  (off by default), and then only the extracted tool schema (e.g. a price or a
  headline), never browsing history.
- ☑ **Authentication information** — only if the user adds a wmcp.sh API key; it’s
  stored locally and sent to wmcp.sh to authenticate their own cache pushes.
- ☐ Everything else (PII, health, financial, location, web history, personal
  communications, user activity) — **not collected.**

**Certifications (check all three — all true):**
- ☑ I do not sell or transfer user data to third parties outside the approved use cases.
- ☑ I do not use or transfer user data for purposes unrelated to the single purpose.
- ☑ I do not use or transfer user data to determine creditworthiness / for lending.

**Privacy policy URL:** `https://wmcp.sh/privacy`

---

## Heads-up on review

Broad `<all_urls>` host access gets extra scrutiny — the justification above is
the strong, honest version, but Google may reply asking for more detail; answer
with the single-purpose framing. If they reject the broad scope outright, the
fallback is an `activeTab` + on-click injection model (a small refactor) — ping
me and I’ll do it. Expect ~1–3 business days.
