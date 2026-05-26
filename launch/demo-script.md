# Demo video script — 45s

The single highest-leverage launch asset. Without it the Show HN, Twitter thread, and Substack are all 5x weaker.

## Setup before recording

- Two browser windows side-by-side (or split-screen)
  - **Left:** Terminal + your agent of choice (Cursor, Claude desktop, or a quick `node` REPL using the Anthropic SDK)
  - **Right:** A Shopify product page — **Allbirds Wool Runners** is the canonical one (works for sure)
- Music: **none.** Silent + captions reads more "engineering" than "marketing"
- Resolution: 1080p minimum, 60fps preferred
- Code font: 16pt minimum (most viewers are on phones)
- Re-do the agent prompt 3–4 times offline beforehand so the cuts are tight — agents can be slow to think, and a real-time wait kills the video

## Beat-by-beat

```
0:00–0:03   COLD OPEN — no logo, no intro
            Black screen, white text only:
              "I gave an LLM the ability to add to cart on any Shopify store."
            (1.5s) cut.

0:03–0:08   Shot: Cursor / Claude UI. You type into chat:
              "Add the size 10 Allbirds Wool Runners to my cart."
            Caption (lower third): "no scraper, no custom code"

0:08–0:18   Tool-call panel appears showing the agent's calls:
              wmcp_get_tools(url="allbirds.com/products/mens-wool-runners")
              wmcp_execute(tool="add_to_cart", variant_id=...)
            Caption: "behind the scenes — wmcp.sh hands it the tool schema"

0:18–0:25   Cut to the actual Shopify cart page (right window).
            Item appears in the cart.
            Caption: "and it just… works"

0:25–0:35   Cut to your editor showing the one-line tool wiring:
              tools = await fetch('https://wmcp.sh/api/v1/tools?url='+url)
            Caption: "one endpoint. any URL. any Shopify."

0:35–0:42   Cut to /directory page.
            Scroll the list of cached URLs.
            Caption: "every install grows a shared cache.
                      more sites, faster for everyone."

0:42–0:45   End card: wmcp.sh (white on black, single line, no logo)
            Optional small text: "free tier · no signup"
```

## Description (Twitter / HN / Substack thumbnail copy)

> "MCP tools for any product URL. Live demo: agent adds to cart on Allbirds without a custom adapter."

## Recording tips

- **Cut every shot 20% shorter than feels right.** Demo videos die from lingering.
- **Zoom your code to 16pt+** before recording. Phones are unforgiving.
- **First 3 seconds carry the whole video.** If the cold-open text doesn't grab them, nothing after matters.
- **No mouse jitter.** Use a tablet/pen for clicks if your hand shakes on coffee.
- **Export both 16:9 (HN/YouTube/Substack) and 9:16 (Twitter cards work in both).**

## Tooling recs (no-frills)

- Recording: **QuickTime** (Mac built-in) or **OBS** (free, all platforms)
- Captions: do them in-app in **CapCut** or **DaVinci Resolve** (both free) — auto-generate then hand-edit
- Compression: **HandBrake** (free) → target ~5MB at 1080p for Twitter

## Upload targets

1. **YouTube** as Unlisted — gives you the canonical 1080p link to share in HN/Substack
2. **Twitter** native upload to tweet 1 of the thread
3. **Substack** embed at the very top of the post
