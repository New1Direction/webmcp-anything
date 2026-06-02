# Chrome Web Store submission — paste-in kit

Upload file: **`wmcp-extension-v0.1.0.zip`** (repo root). Privacy policy URL:
**https://wmcp.sh/privacy** (live).

Submit from https://chrome.google.com/webstore/devconsole → New item → upload the
zip → fill the tabs below.

---

## Store listing tab

**Name** (already in manifest): `WebMCP Anything`

**Summary** (≤132 chars, matches manifest):
> Never miss a Pokémon drop again. Your AI watches the page and grabs the restock for you — even on sites that block bots.

**Category:** Developer Tools  ·  **Language:** English

**Description:**
> Pokémon drops sell out in seconds — and the sites you buy from (Pokémon Center,
> Walmart, Sam's Club, Best Buy, Target) block bots hard. So the moment it matters,
> a normal AI assistant is locked out.
>
> WebMCP Anything is different: it runs right in your own browser, in your own
> session — so it works on the exact pages everyone else's bots get blocked from.
>
> Set it up BEFORE the drop:
> 1. Add the extension (free, one click).
> 2. Open the product page and arm it — "Watch this drop."
> 3. Walk away. The second it restocks, your AI grabs it and it's in your cart.
>    You just check out.
>
> No sitting on the page. No refresh-spamming. No racing to the checkout button.
> You set it up before the drop — and it's already handled when it goes live.
>
> Works on booster boxes, elite trainer boxes, special collections, and chase
> singles — anywhere a product page shows price and stock. Because it reads the
> page in your own browser, it reaches the bot-blocked sites no other tool can.
>
> You stay in control — it only ever acts on the page you point it at, and you
> complete the checkout yourself.
>
> Free to try. Open-source (MIT). Your data stays in your browser — nothing about
> the pages you visit leaves unless you explicitly turn it on.

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
