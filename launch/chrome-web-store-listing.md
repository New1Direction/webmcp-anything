# Chrome Web Store submission — paste-in kit

Upload file: **`wmcp-extension-v0.1.0.zip`** (repo root). Privacy policy URL:
**https://wmcp.sh/privacy** (live).

Submit from https://chrome.google.com/webstore/devconsole → New item → upload the
zip → fill the tabs below.

---

## Store listing tab

**Name** (already in manifest): `QuickCatch`

**Summary** (≤132 chars, matches manifest):
> Never miss a Pokémon drop again. Your AI watches the page and grabs the restock for you, even on sites that block bots.

**Category:** Developer Tools  ·  **Language:** English

**Description:**
> Pokémon drops sell out in seconds. The stores that carry them, like Pokémon
> Center, Walmart, and Sam's Club, block bots, so a normal AI assistant can't
> reach the page when a box restocks.
>
> This extension runs inside your own browser, in your own logged-in session, so
> it reaches pages that block other tools.
>
> Set it up before the drop:
> 1. Add the extension. Free, one click.
> 2. Open the product page and tap "Watch this drop."
> 3. Leave it running and walk away.
>
> When the box restocks, your AI adds it to your cart. You open the cart and check
> out. You skip the refreshing and the scramble for the buy button.
>
> It works on booster boxes, elite trainer boxes, and special collections, on any
> product page that shows a price and stock.
>
> You stay in control. It acts only on the page you point it at, and you finish
> checkout yourself.
>
> Free to try. The code is open source. Your browsing stays on your machine, and
> nothing about the pages you visit leaves your browser unless you turn that on.

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

**Single purpose** (one field):
> QuickCatch turns the product page you are viewing into tools an AI agent can use: check stock, get the price, and add the item to your cart when it comes back in stock.

**Permission justifications:**

- **storage:**
  > QuickCatch saves your settings, and an optional wmcp.sh API key, on your own device so they persist between sessions.

- **host permissions (all sites):**
  > You can run QuickCatch on any product page you choose, so it needs to read the current page on any site. It reads the page's structured data (schema.org JSON-LD and meta tags) only while you are on that page, on demand. It does not run in the background, and it does not read your other tabs.

- **Remote code:** No. All code ships inside the package. No remote scripts, no eval.

**Data usage — check these two, leave the rest unchecked:**
- ☑ **Website content:**
  > QuickCatch reads the current product page (title, price, stock) to build its tools. This happens in your browser. It leaves your device only if you turn on the shared cache, and then only the extracted tool data, never your browsing history.
- ☑ **Authentication information:**
  > Only if you add a wmcp.sh API key. It is stored on your device and sent to wmcp.sh to authenticate your own requests.
- ☐ Personally identifiable info, health, financial, location, web history, personal communications, user activity: not collected.

**Certifications (check all three, all true):**
- ☑ I do not sell or transfer user data to third parties, outside of the approved use cases.
- ☑ I do not use or transfer user data for purposes unrelated to my item's single purpose.
- ☑ I do not use or transfer user data to determine creditworthiness or for lending purposes.

**Privacy policy URL:** `https://wmcp.sh/privacy`

---

## Heads-up on review

Broad `<all_urls>` host access gets extra scrutiny — the justification above is
the strong, honest version, but Google may reply asking for more detail; answer
with the single-purpose framing. If they reject the broad scope outright, the
fallback is an `activeTab` + on-click injection model (a small refactor) — ping
me and I’ll do it. Expect ~1–3 business days.
