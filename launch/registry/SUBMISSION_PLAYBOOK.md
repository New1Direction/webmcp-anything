# wmcp.sh — registry submission & distribution playbook

_Last verified: 2026-05-28. wmcp.sh is now a real, spec-compliant MCP server (JSON-RPC 2.0 over Streamable HTTP) — not just a producer of MCP-shaped JSON. That changes the registry story: we list a **remote** server, no npm/pypi artifact required._

The connectable endpoints (all POST, JSON-RPC 2.0 over Streamable HTTP):

| Endpoint | What it is |
|---|---|
| `POST https://wmcp.sh/mcp/u/<base64url-of-any-url>` | turn ONE site into a connectable MCP server (stable, addressable) |
| `POST https://wmcp.sh/mcp/url?url=a&url=b` | compose several sites into one MCP server (tools host-namespaced, `site_a__add_to_cart`) |
| `POST https://wmcp.sh/mcp/set/<id>` | a saved "toolset" (Pro feature) |
| `POST https://wmcp.sh/mcp/<provider>` | OAuth-vault proxy to an OAuth-protected upstream (Stripe, Slack, …) |
| `GET https://wmcp.sh/api/v1/tools?url=` | free REST API (the non-MCP, JSON-only path) |

`tools/list` (discovery) is free. `tools/call` (live execution) needs a paid key passed as `Authorization: Bearer webmcp_live_…`. `type` may be `"http"` or `"streamable-http"` (same transport).

The **canonical demo URL** used throughout this doc is the Allbirds wool-runners page, base64url-encoded:

```
https://wmcp.sh/mcp/u/aHR0cHM6Ly93d3cuYWxsYmlyZHMuY29tL3Byb2R1Y3RzL21lbnMtd29vbC1ydW5uZXJz
```

Encode any other URL:

```bash
node -e "process.stdout.write(Buffer.from('https://your-url.example').toString('base64url'))"
```

Pre-flight done:
- ✅ Repo flipped public: https://github.com/New1Direction/webmcp-anything (MIT)
- ✅ Secret scan: zero hits
- ✅ `/llms.txt` + `/llms-full.txt` live
- ✅ Sitemap.xml current (99 SEO surfaces)
- ✅ Real MCP transport live at `/mcp/u/*`, `/mcp/url`, `/mcp/set/*`, `/mcp/<provider>`

---

## Order of operations (do top-to-bottom)

### TIER 1 — start today

#### 1. Bing IndexNow (5 min) — already automated

Key generated: `210a4c52878584d7ea9f50b95f8f58cd`

File already dropped at: `worker/public/210a4c52878584d7ea9f50b95f8f58cd.txt`

**After next `wrangler deploy`**, verify it's live:
```
curl https://wmcp.sh/210a4c52878584d7ea9f50b95f8f58cd.txt
# should return: 210a4c52878584d7ea9f50b95f8f58cd
```

Then ping IndexNow with your sitemap URLs (one-shot, post-deploy):
```bash
curl -X POST 'https://api.indexnow.org/IndexNow' \
  -H 'Content-Type: application/json' \
  -d '{
    "host": "wmcp.sh",
    "key": "210a4c52878584d7ea9f50b95f8f58cd",
    "keyLocation": "https://wmcp.sh/210a4c52878584d7ea9f50b95f8f58cd.txt",
    "urlList": [
      "https://wmcp.sh/",
      "https://wmcp.sh/agent-ready",
      "https://wmcp.sh/managed",
      "https://wmcp.sh/directory",
      "https://wmcp.sh/blog",
      "https://wmcp.sh/llms.txt",
      "https://wmcp.sh/llms-full.txt",
      "https://wmcp.sh/sitemap.xml"
    ]
  }'
```

This also feeds Yandex + Seznam. IndexNow is already wired into the deploy path; this manual ping is only for the initial seed or when you add a big batch of pages.

#### 2. Bing Webmaster Tools (10 min)

1. Go to https://www.bing.com/webmasters
2. Add site → enter `https://wmcp.sh`
3. Verify: pick **XML file** option, drop `BingSiteAuth.xml` they give you into `worker/public/`, redeploy
4. Submit sitemap: `https://wmcp.sh/sitemap.xml`
5. Open AI Performance dashboard once it's verified — shows citations from Copilot/Bing AI.

#### 3. Google Search Console (10 min)

1. Go to https://search.google.com/search-console
2. Add property → Domain (root) → `wmcp.sh`
3. Verify via DNS TXT at Cloudflare. Add at zone `wmcp.sh`:
   ```
   Type: TXT
   Name: @
   Content: google-site-verification=<value-google-gives-you>
   TTL: Auto
   ```
4. Submit sitemap: `sitemap.xml`
5. Check Performance → Search type = Web — AI Overviews + AI Mode citations appear here.

#### 4. Official MCP Registry (`modelcontextprotocol/registry`) — **as a REMOTE server, no npm package**

> **Status: the registry is in public preview.** Breaking changes / data resets can happen before GA. Issues: https://github.com/modelcontextprotocol/registry/issues

**This is the single most important listing** — Glama, PulseMCP, mcp.so, MCP.Directory and others auto-ingest from it daily/weekly, so one good publish here cascades to most of TIER 2.

Because wmcp.sh is a hosted Streamable-HTTP server, we publish a **`remotes`** entry and skip the npm/pypi step entirely (the quickstart tutorial assumes an npm artifact + `mcpName` in `package.json` — that path is **only** for stdio/package servers; remote servers don't need it).

**Two namespace choices — pick ONE:**

| Option | Namespace | Verified by | Effort | Recommendation |
|---|---|---|---|---|
| **A. GitHub OAuth** | `io.github.New1Direction/webmcp-anything` | GitHub Device Flow login as `New1Direction` (repo is public) | ~2 min | Fastest. Use this for the first publish. |
| **B. DNS (custom domain)** | `sh.wmcp/anything` (reverse-DNS of `wmcp.sh`) | Ed25519 key + DNS TXT record at the `wmcp.sh` zone | ~10 min | Cleaner brand. We own the zone, so it's easy — do this as a follow-up if we want the `sh.wmcp/*` namespace. |

**Install the publisher CLI** (one time):
```bash
# macOS/Linux
curl -L "https://github.com/modelcontextprotocol/registry/releases/latest/download/mcp-publisher_$(uname -s | tr '[:upper:]' '[:lower:]')_$(uname -m | sed 's/x86_64/amd64/;s/aarch64/arm64/').tar.gz" | tar xz mcp-publisher && sudo mv mcp-publisher /usr/local/bin/
# or
brew install mcp-publisher

mcp-publisher --help   # init | login | logout | publish
```

**Option A — GitHub auth (recommended first publish):**
```bash
# server.json already lives at launch/registry/server.json (see snippet below)
mcp-publisher login github         # device-flow, authorize as New1Direction
mcp-publisher publish --file ./launch/registry/server.json
# validate first if you want: mcp-publisher publish --dry-run --file ./launch/registry/server.json
```

**Option B — DNS auth for the `sh.wmcp/*` namespace (follow-up):**
```bash
# generates a keypair + prints the TXT record to add at the wmcp.sh zone
mcp-publisher login dns --domain=wmcp.sh --private-key=<ED25519_HEX_64CHARS>
# add the printed TXT record at Cloudflare (zone wmcp.sh), then:
mcp-publisher publish --file ./launch/registry/server.json   # name must be sh.wmcp/anything
```

**Verify it's live:**
```bash
curl "https://registry.modelcontextprotocol.io/v0.1/servers?search=webmcp-anything"
```

**Metadata they want:** `$schema`, `name` (namespaced), `description`, `repository {url, source}`, `version`, and a `remotes[]` (or `packages[]`) array. For us: a single `streamable-http` remote. `websiteUrl` is optional but recommended.

ETA: same-day inclusion. PulseMCP/Glama/mcp.so auto-pull within a day to a week.

#### 5. Anthropic Connectors Directory (longest review — start NOW)

URL: https://claude.com/docs/connectors/building/submission

The form fields + ready-to-paste copy live in `launch/registry/anthropic-form-payload.md`. **One correction vs. that file:** submit the real MCP transport endpoint as the Server URL, not the REST endpoint:

- **Server URL:** `https://wmcp.sh/mcp/u/aHR0cHM6Ly93d3cuYWxsYmlyZHMuY29tL3Byb2R1Y3RzL21lbnMtd29vbC1ydW5uZXJz` (a concrete, connectable single-site server that exposes a live `tools/list`), **or** the compose endpoint `https://wmcp.sh/mcp/url?url=https://www.allbirds.com/products/mens-wool-runners` if the reviewer prefers a stable canonical URL. The bare `/api/v1/tools` is the REST API, not an MCP endpoint — don't submit that as the MCP server URL.

Before submitting, double-check:
- Every tool returned exposes `readOnlyHint:true` (get/list/fetch) or `destructiveHint:true` (write/cart) — Anthropic's #1 rejection reason. Verify:
  ```bash
  curl 'https://wmcp.sh/api/v1/tools?url=https://www.allbirds.com/products/mens-wool-runners' \
    | jq '.tools[] | {name, readOnlyHint, destructiveHint}'
  ```
- `/privacy` + `/terms` URLs resolve (200)
- 3+ usage examples in docs (`/agent-ready`)

Review window: ~2 weeks.

---

### TIER 2 — this week (most auto-ingest from the official registry; the rest are quick forms/PRs)

| # | Registry | Mechanism (verified 2026-05-28) | Time |
|---|---|---|---|
| 6 | PulseMCP | **Auto-pulls from the official registry daily, processes weekly.** Only act if not listed a week after step 4 — then form at https://www.pulsemcp.com/submit (paste repo or `https://wmcp.sh`) or email support@pulsemcp.com | 0–5 min |
| 7 | Glama.ai | "Add Server" button at https://glama.ai/mcp/servers ; Glama also auto-indexes public GitHub MCP repos. After it appears, **claim** the listing (Claimed vs Official distinction) to get edit access + the score badge | 5 min |
| 8 | mcp.so | Submit at https://mcp.so/submit (auto-pulls metadata from the GitHub repo + the official registry; publishes ~24h) | 5 min |
| 9 | MCP.Directory | Form at https://mcp.directory/submit (auto-discovers from official registry; claim for verified badge) | 5 min |
| 10 | Smithery.ai | CLI publish-by-URL: `smithery mcp publish https://wmcp.sh/mcp/u/<base64url> -n new1direction/wmcp` (after `smithery auth login`). Smithery also supports GitHub-deploy via `smithery.yaml`, but **we don't need that** — we're a hosted remote, so publish the URL. Verify org/namespace claim in the web dashboard | 10 min |
| 11 | Cursor Directory | https://cursor.directory/mcp → "Submit" (community-curated). Cursor consumes the official registry too; listing there + an "Add to Cursor" deep-link is the win | 5 min |
| 12 | awesome-mcp-servers (punkpeye) | `gh repo fork punkpeye/awesome-mcp-servers` → add one line (format below) → PR. Follow alphabetical order within category + the emoji legend | 10 min |
| 13 | awesome-mcp-servers (wong2) | Same pattern at `wong2/awesome-mcp-servers`, simpler format, faster merges | 10 min |
| 14 | llmstxthub.com / thedaviddias/llms-txt-hub | Form at https://llmstxthub.com or PR a YAML entry to `thedaviddias/llms-txt-hub` (this is for `/llms.txt`, not MCP — orthogonal but cheap) | 10 min |

---

### TIER 3 — coordinated launch week

| # | Where | Notes |
|---|---|---|
| 15 | Show HN | Title: "Show HN: wmcp.sh – turn any URL into agent-callable MCP tools". Tues–Thurs 8–10am ET. Public repo + live demo URL (the Allbirds `/mcp/u/…` endpoint) in body. |
| 16 | Product Hunt | Tuesday launch, US-evening upvote push. Standard form (tagline + gallery + makers). |
| 17 | ChatGPT App / connector directory | https://platform.openai.com/ — identity verification + form (longest OpenAI-side review). |

---

## Asset A — `server.json` (official registry, REMOTE server)

This is the file to publish in step 4. Save at `launch/registry/server.json`. **Updated** from the previous version: schema bumped to the current `2025-12-11`, and the remote points at the real MCP transport (`/mcp/u/<base64url>`), not the REST `/api/v1/tools`.

```json
{
  "$schema": "https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json",
  "name": "io.github.New1Direction/webmcp-anything",
  "description": "Turn any URL into agent-callable MCP tools. Extracts callable tools from Shopify storefronts, OpenAPI specs, JSON-LD pages, and arbitrary URLs via a 5-tier chain (LLM fallback). Free tools/list; live tools/call needs a paid key.",
  "repository": {
    "url": "https://github.com/New1Direction/webmcp-anything",
    "source": "github"
  },
  "version": "1.0.0",
  "websiteUrl": "https://wmcp.sh",
  "remotes": [
    {
      "type": "streamable-http",
      "url": "https://wmcp.sh/mcp/u/aHR0cHM6Ly93d3cuYWxsYmlyZHMuY29tL3Byb2R1Y3RzL21lbnMtd29vbC1ydW5uZXJz"
    }
  ]
}
```

Notes:
- The `remotes[].url` must be a single concrete, connectable endpoint that answers `initialize` + `tools/list`. We use the canonical Allbirds single-site server. (The registry schema does not model "URL-template" servers, so we cannot register the generic `/mcp/u/<base64url>` pattern directly — we register one live example and the README + website document the pattern.)
- If you take the **DNS / `sh.wmcp`** route (Option B), change `"name"` to `"sh.wmcp/anything"`.
- No `packages[]` array, no `mcpName` in any `package.json` — those are package-server requirements only.
- `transport.type` valid strings for remotes: `"streamable-http"` or `"sse"`. We use `streamable-http`.

---

## Asset B — ready-to-paste listing copy (use for every directory)

### Name
```
wmcp.sh — WebMCP Anything
```
(Short name where a single token is required: `wmcp` or `webmcp-anything`.)

### One-line description (≤ ~100 chars)
```
Add ANY website to Claude, Cursor, or Codex as agent-callable MCP tools — one line of config, no per-server build.
```

### Paragraph description
```
wmcp.sh is a hosted MCP server that turns arbitrary URLs into agent-callable tools at request time. Point any MCP client at /mcp/u/<base64url-of-a-site> and it exposes that page's extracted tools natively (tools/list + tools/call over JSON-RPC 2.0 / Streamable HTTP); point it at /mcp/url?url=a&url=b to compose several sites into one server with host-namespaced tools. A 5-tier extraction chain (Shopify, JSON-LD, OpenAPI, provider table, Claude Haiku LLM fallback) handles most sites with no per-site work. For OAuth-protected upstreams, /mcp/<provider> proxies through an encrypted credential vault so the agent context never sees raw tokens. tools/list is free; live tools/call uses a paid Bearer key. Open source (MIT), with Python (pip install wmcp) and JS (@wmcp/sdk) SDKs and a Chrome extension.
```

### Connect config (paste into any MCP client — Claude Code/Desktop, Cursor, Codex, Cline, VS Code)

One site:
```json
{
  "mcpServers": {
    "wmcp": {
      "type": "http",
      "url": "https://wmcp.sh/mcp/u/aHR0cHM6Ly93d3cuYWxsYmlyZHMuY29tL3Byb2R1Y3RzL21lbnMtd29vbC1ydW5uZXJz"
    }
  }
}
```

Compose several sites into one server:
```json
{
  "mcpServers": {
    "wmcp": {
      "type": "http",
      "url": "https://wmcp.sh/mcp/url?url=https://site-a.example&url=https://site-b.example"
    }
  }
}
```

With a paid key for live `tools/call`:
```json
{
  "mcpServers": {
    "wmcp": {
      "type": "http",
      "url": "https://wmcp.sh/mcp/u/<base64url>",
      "headers": { "Authorization": "Bearer webmcp_live_…" }
    }
  }
}
```

(For Claude Desktop builds without remote-MCP support, bridge with `npx mcp-remote <url>`.)

### Tags / categories
```
mcp, web, automation, agents, ai-agents, tools, shopify, openapi, json-ld,
e-commerce, api, oauth, claude, cursor, codex, developer-tools, gateway,
remote-mcp, cloudflare-workers
```

### Links
- Website: https://wmcp.sh
- Repo: https://github.com/New1Direction/webmcp-anything
- Docs / examples: https://wmcp.sh/agent-ready
- Directory: https://wmcp.sh/directory
- llms.txt: https://wmcp.sh/llms.txt

### Pricing (state exactly — do NOT invent numbers)
- **Self-serve API:** Free / Pro **$29/mo** / Reseller **$99/mo**
- **Done-for-you (`/managed`):** Starter **$499 one-time** / Managed Retainer **$999/mo** / Enterprise **$4,999+/mo**

---

## Asset C — awesome-mcp-servers PR line (punkpeye format)

Add under the most relevant category (e.g. **Aggregators** or **Browser Automation** — pick the one matching the README's current sections), keeping **alphabetical order within the category** and following the legend.

Legend (verified): 🎖️ official · 🐍 Python · 📇 TypeScript/JS · 🏎️ Go · 🦀 Rust · #️⃣ C# · ☕ Java · 🌊 C/C++ · 💎 Ruby · ☁️ Cloud Service · 🏠 Local Service · 📟 Embedded · 🍎 macOS · 🪟 Windows · 🐧 Linux

Our flags: 📇 (TypeScript) ☁️ (cloud/remote — talks to remote APIs) 🍎 🪟 🐧.

Entry line (paste, adjust position to stay alphabetical):
```markdown
- [New1Direction/webmcp-anything](https://github.com/New1Direction/webmcp-anything) 📇 ☁️ 🍎 🪟 🐧 - Turn ANY website into agent-callable MCP tools in one line of config. Hosted Streamable-HTTP server: `/mcp/u/<base64url>` for one site, `/mcp/url?url=a&url=b` to compose several. 5-tier extraction (Shopify, JSON-LD, OpenAPI, LLM fallback) + OAuth-vault proxy. Free tools/list; paid tools/call.
```

PR steps:
```bash
gh repo fork punkpeye/awesome-mcp-servers --clone
# edit README.md: add the line in the right category, alphabetical
git switch -c add-webmcp-anything
git commit -am "Add webmcp-anything (turn any URL into MCP tools)"
gh pr create --title "Add webmcp-anything" --body "Hosted remote MCP server that turns any URL into agent-callable tools. Live at https://wmcp.sh, MIT, public repo."
```

For `wong2/awesome-mcp-servers`, use the same line minus the emoji flags if that README's format is plainer — match the file's existing style.

---

## Asset D — GitHub repo readiness (do before any directory submit)

Directories that auto-index pull `name / description / topics / stars / license / README / social-preview` straight from GitHub. Make the repo's metadata carry the pitch.

**About blurb** (Settings → top-right "About", ≤ ~120 chars):
```
Turn ANY website into agent-callable MCP tools — one line of config for Claude, Cursor, Codex. Hosted, MIT, 5-tier extraction.
```

**Website field:** `https://wmcp.sh`

**Topics / tags** (Settings → Topics):
```
mcp  model-context-protocol  ai-agents  llm-tools  shopify  openapi  json-ld
claude  cursor  codex  cloudflare-workers  oauth  web-automation  agent-tools
remote-mcp  tool-use  function-calling  typescript
```

**Social-preview image** (Settings → Social preview, 1280×640 PNG): a card with `wmcp.sh`, the tagline "Add ANY website to Claude/Cursor/Codex as MCP tools — one line of config", and the one-liner connect snippet. Note `og.png` binaries are `.gitignore`d per AGENTS.md — upload via the GitHub Settings UI, don't commit it.

Set them via CLI:
```bash
gh repo edit New1Direction/webmcp-anything \
  --description "Turn ANY website into agent-callable MCP tools — one line of config for Claude, Cursor, Codex. Hosted, MIT, 5-tier extraction." \
  --homepage "https://wmcp.sh" \
  --add-topic mcp --add-topic model-context-protocol --add-topic ai-agents \
  --add-topic llm-tools --add-topic claude --add-topic cursor --add-topic codex \
  --add-topic openapi --add-topic shopify --add-topic remote-mcp \
  --add-topic cloudflare-workers --add-topic oauth --add-topic function-calling
# social preview must be uploaded in the web UI (Settings → Social preview)
```

---

## Tracking

After each submission, log it here. Update as inclusion is confirmed.

| Registry | Mechanism | Submitted | Status | URL once live |
|---|---|---|---|---|
| Bing IndexNow | API ping (automated) | | | — |
| Bing Webmaster | XML verify | | | — |
| Google Search Console | DNS TXT | | | — |
| Official MCP Registry | mcp-publisher (remote) | | | registry.modelcontextprotocol.io |
| Anthropic Connectors | form | | | — |
| PulseMCP | auto from registry | | | — |
| Glama.ai | Add Server + claim | | | — |
| mcp.so | /submit | | | — |
| MCP.Directory | /submit | | | — |
| Smithery.ai | CLI publish URL | | | — |
| Cursor Directory | submit | | | — |
| awesome-mcp (punkpeye) | PR | | | — |
| awesome-mcp (wong2) | PR | | | — |
| llms-txt-hub | form/PR | | | — |
| Show HN | post | | | — |
| Product Hunt | form | | | — |
| ChatGPT directory | form | | | — |

---

## ⚠️ Could-not-fully-verify / caveats (flag before you rely on these)

1. **Official registry is in PREVIEW** — schema/API can change without notice and data resets are possible. Re-check the schema date (`2025-12-11` as of today) at `mcp-publisher init` time; if it differs, regenerate `server.json`.
2. **Remote-server `remotes` schema** is confirmed from the registry's `generic-server-json.md` (a `streamable-http` URL with no `packages[]` is valid). The dedicated remote-server publishing guide page 404'd on direct fetch, so the **exact CLI invocation for a remote-only publish was inferred** from the quickstart + the live schema. Run `mcp-publisher publish --dry-run` first to confirm it validates before the real publish.
3. **DNS-auth namespace `sh.wmcp/anything`** — DNS auth and the `com.example` → reverse-DNS naming rule are confirmed, but I did not run the keypair/TXT flow end-to-end. The exact TXT record name/value is emitted by `mcp-publisher login dns` at run time.
4. **Smithery URL-publish for a hosted remote** — the `smithery mcp publish <url> -n <org/server>` CLI is confirmed, but the Smithery docs page on listing a *pre-hosted remote* (vs. building from a `smithery.yaml` repo) 404'd. Confirm the exact namespace-claim flow in the Smithery dashboard after `smithery auth login`.
5. **mcp.so / MCP.Directory submit URLs** (`https://mcp.so/submit`, `https://mcp.directory/submit`) returned 403/anti-bot to automated fetch but are referenced by multiple current sources; open them in a browser to confirm the live form fields. (Note: `mcp.so` and `mcp.directory` are **different** sites — don't conflate.)
6. **Cursor directory submit path** — Cursor Directory hosts community MCP listings and offers an "Add to Cursor" deep-link; the exact submit URL/flow varies and is community-curated. Verify the current "Submit" affordance at https://cursor.directory/mcp before relying on a fixed URL.
7. **Anthropic Connectors form fields** — taken from `launch/registry/anthropic-form-payload.md`; the live form at `claude.com/docs/connectors/building/submission` should be re-checked field-by-field, and `/privacy` + `/terms` must exist before submitting.
8. **`og.png` / social preview** is not committed (gitignored) — must be uploaded via the GitHub web UI.
9. **README pricing line mismatch:** the repo `README.md` pricing table currently shows API "Pro" at `$999/mo`, which contradicts the locked figure (API Pro = **$29/mo**; the **$999/mo** number belongs to the `/managed` "Managed Retainer" tier, not the API plan). All copy in this playbook uses the locked figures from AGENTS.md §3.7. The README typo should be fixed separately.
