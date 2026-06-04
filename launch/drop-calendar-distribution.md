# Drop-Calendar Distribution Plan — QuickCatch ($12/mo)

**The product to sell:** QuickCatch $12/mo — watches a product page and auto-adds the
restock to your cart, in your own browser, on the sites that block bots. The wedge:
*reseller bots (Valor, etc.) cost $300–3000 + proxies + a $50/mo cook group. You just
want the one drop, for yourself. $12, your browser, no setup.*

**The core idea — ride waves, don't post into the void.** Demand for "catch the drop"
spikes the day a hyped set/product releases or restocks. That's when casuals are
frantically searching "X restock" and "how do I get X at retail." Be in those threads,
that week, with the free tool. Each wave = a burst of high-intent traffic you funnel:
free `/drops/<slug>` alerts → **$12 QuickCatch** upgrade.

---

## 2026 Pokémon wave calendar (the anchors)

| Date | Set | Why it's a wave | Pre-seed by |
|---|---|---|---|
| **Jul 17** | **Pitch Black (ME05)** | Mega Evolution era, dark theme, ETB + booster hype | Jul 10 |
| **Sep 1** | **Storm Emerald (ME06)** | ME-era set, back-to-school spend | Aug 25 |
| **Sep 18** | **30th Celebration** | All-foil **anniversary** set — biggest of the year, will sell out instantly + restock for months | Sep 8 |

**Evergreen waves (always running, no fixed date):**
- **Prismatic Evolutions / 151 / Surging Sparks restocks** — perennial sellouts; restocks land weekly-ish at Pokémon Center / Walmart / Target. These are your steady funnel (you already have `/drops` pages for them).
- **Pop Mart / Labubu drops** — typically mid-week online drops, sell out in seconds, huge resale. r/Labubu + TikTok are rabid. QuickCatch's anti-bot client-side angle is perfect here.
- **Sneakers** — SNKRS / Shopify hyped releases have a weekly calendar; r/sneakers + restock X accounts.

**Per-wave cadence (T = drop day):**
- **T−7:** publish/refresh the `/drops/<set>` page; seed value content (guides, "where it restocks").
- **T−1:** prime the communities — "drop is tomorrow, here's how to not miss it at retail."
- **T0 (drop day):** be present in the live threads in real time. Reply, don't spam. This is the spike.
- **T+1 → T+14:** the restock window — "missed the drop? it restocks at PokeCenter/Walmart — watch it instead of paying resale." This is where most $12 conversions happen (the FOMO is hottest right after a sellout).

> **Funnel prerequisite:** make sure a `/drops/<slug>` page exists per wave (e.g. `pitch-black-restock`, `storm-emerald-restock`, `30th-celebration-restock`). I can add these to `drops_seo.ts` before each pre-seed date — say the word.

---

## Channels (where the $10–20 casual actually is)

| Channel | Who | The angle | Self-promo rule |
|---|---|---|---|
| **r/PokemonTCGDeals, r/pkmntcgdeals** | deal-hunters | free retail-vs-resale calc + restock watch | value-first, link the free tool, never the paywall |
| **r/PokeInvesting, r/PokemonTCG** | collectors/flippers | "catch at retail vs pay resale" | read sidebar; some have promo days |
| **r/Labubu, r/funkopop, r/PopMart** | toy droppers | anti-bot client-side catch on Pop Mart | very promo-sensitive — lead with helping |
| **r/sneakers, r/MschfSneakers** | sneakerheads | "$12 vs a $500 bot you don't need" | strict; comment-help first, link sparingly |
| **TikTok / YT Shorts** | the mass casual market | "POV: you caught the drop at retail" 15s demo | platform loves it; this is the #1 volume channel |
| **X / Twitter** | restock-alert orbit | reply in drop threads + your own thread | fine to self-post; don't brand-boost |
| **Discord drop servers** | serious droppers | cheap alternative to the $50/mo cook group | respect each server's rules; ask mods |

**TikTok/Shorts is the highest-leverage channel for this audience** — short, visual, "watch me catch it" content goes further than any Reddit post for the casual $12 buyer. Prioritize it.

---

## Paste-ready posts (templated — swap {SET} / {DATE} / {SLUG} per wave)

### Reddit — value-first (T−1 or T+1)
**Title:**
```
{SET} drops {DATE} and sells out in seconds — here's how I catch these at retail instead of paying resale
```
**Body:**
```
Every hyped set I've wanted lately is gone in seconds at retail, then 2-3x on the
secondary market. I stopped refreshing 10 tabs and started letting a watcher do it.

Free retail-vs-resale calculator (no signup) so you know if a resale price is even
worth it: https://wmcp.sh/tools/pokemon-resale-calculator

And a free restock watcher (browser extension, runs in your own session so it works
on Pokémon Center / Walmart where server bots get blocked): https://wmcp.sh/drops/{SLUG}

Not a $500 reseller bot — just a thing that carts the one you want when it's back.
Curious how everyone else is handling {SET} — camping the page or winging it?
```

### TikTok / Shorts — script (the volume play)
```
HOOK (0-2s): "Stop refreshing for the {SET} drop. Watch this."
DEMO (2-12s): screen-record arming QuickCatch on the product page → "it watches in
  the background" → cut to the restock notification → item in cart.
PAYOFF (12-15s): "Retail, not resale. $12/mo, your own browser, no $500 bot.
  Link in bio → wmcp.sh"
CAPTION: catch the {SET} restock at retail 🎯 #pokemontcg #{SET_HASHTAG} #restock #pokemoncards
```

### X / Twitter — drop-day thread
```
{SET} drops {DATE}. it'll be gone in seconds at retail and 2x on the secondary same day.

if you just want ONE at retail (not a reseller running 50 checkouts) you don't need a
$500 bot. here's the $12 way 🧵
```
```
arm a watcher on the product page before the drop. it runs in YOUR browser/session, so
it reaches the pages that block server bots (Pokémon Center, Walmart). on restock it
carts it and pings you. you check out.

free to try: wmcp.sh/drops/{SLUG}
```

### The wedge post (vs the bots) — for r/sneakers / discord
```
PSA for casuals: you don't need a $300-1000 bot + proxies + a $50/mo cook group to grab
ONE drop for yourself. those are built for resellers running volume. if you just want
the pair/box at retail, a $12 browser watcher that carts it on restock does the job.
Not shilling a flip operation — the opposite. wmcp.sh
```

---

## Drop-day playbook (per wave)
1. **T−7:** `/drops/{SLUG}` page live + a TikTok/Short teasing "the {SET} drop is coming — here's how to be ready."
2. **T−1:** post the Reddit value post + X thread. Pin/refresh the TikTok.
3. **T0:** be in the live drop threads (r/PokemonTCGDeals megathread, X) answering "is it in stock?" in real time — drop the free tool only where it genuinely helps.
4. **T+1–14:** restock-FOMO content ("missed it? it restocks — watch it instead of paying $X resale"). This window converts the most $12 subs.
5. After each wave: note which channel/post drove signups (UTM the links: `?utm_source=reddit&utm_campaign={SET}`), double down on the winner next wave.

---

## Rules of the road (so this doesn't backfire)
- **Lead with the free tool / genuine help, never the $12 paywall.** The calculator + free alerts are the door; $12 is the upgrade once they trust it.
- **Never boost your own posts with the brand/other accounts** (vote manipulation = bans). One honest voice per post.
- **Respect each sub/server's self-promo rules** — read the sidebar, use promo days, don't drive-by spam. A burned subreddit is gone for good.
- **UTM every link** so you actually learn which wave + channel pays, and stop guessing.
