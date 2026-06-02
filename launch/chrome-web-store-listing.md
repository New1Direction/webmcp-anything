# Chrome Web Store submission — paste-in kit

Upload file: **`wmcp-extension-v0.1.0.zip`** (repo root). Privacy policy URL:
**https://wmcp.sh/privacy** (live).

Submit from https://chrome.google.com/webstore/devconsole → New item → upload the
zip → fill the tabs below.

---

## Store listing tab

**Name** (already in manifest): `WebMCP Anything`

**Summary** (≤132 chars):
> Give your AI agent the websites that block bots — WebMCP turns any page into agent-callable tools, in your own browser.

**Category:** Developer Tools  ·  **Language:** English

**Description:**
> AI agents can call APIs but go blind the moment a site blocks bots — which is
> most of the sites people actually use (shopping, listings, profiles, tickets).
> WebMCP Anything fixes that by working where the agent can't reach on its own:
> the page you’re already looking at, in your own browser and your own session.
>
> It reads the structured data a page already publishes (schema.org JSON-LD, meta
> tags) and turns it into agent-callable WebMCP/MCP tools:
>
> • Products — price, stock, variants
> • Articles & blogs — headline, author, date, body
> • Recipes — ingredients, steps, time
> • Movies & TV — cast, rating, year
> • Jobs — company, salary, location
> • Events — date, venue, tickets
> • Local businesses — address, hours, rating
>
> Pairs with the free hosted server at wmcp.sh for public URLs (paste one line
> into Claude, Cursor, or Codex). The extension handles the sites a server fetch
> can’t — by running as you, on the page you choose.
>
> Open-source adapters (MIT). No account required to try.
>
> Privacy: extraction happens locally in your browser. Nothing about the pages
> you visit is sent anywhere unless you explicitly turn on the shared cache.

**Screenshots** (need 1–5, 1280×800 or 640×400 PNG/JPG). Best set:
1. The popup showing extracted tools on a real product/recipe page.
2. A page with the tool list panel open (get_price / get_recipe / get_job).
3. The options page (endpoint + API key + “share to cache” toggle).
4. The agent side: Claude/Cursor calling a tool that came from the extension.
   → Capture these from the loaded extension; I can also generate branded
   marketing tiles if you want a polished set.

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
