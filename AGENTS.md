# AGENTS.md

Workspace rules for AI coding agents (Claude Code, Cursor, Cline, Gemini CLI, Aider, etc.). Read this **first** before modifying anything in this repo.

This file is the single source of truth. If `CLAUDE.md`, `.cursorrules`, or any other IDE-specific file contradicts it, this file wins — fix the other file.

---

## 1. What this project is

**wmcp.sh** — a hosted Cloudflare Worker that turns any URL into agent-callable MCP tools, plus a Chrome extension, plus open-source adapters, plus SDKs.

- Production worker: `https://wmcp.sh` (Cloudflare account `aisle9angel@gmail.com`, zone `0284dbcc5d7326bc016b28e3295f4dca`)
- Public repo: `https://github.com/New1Direction/webmcp-anything` (private during pre-launch, will flip public)
- Stack: Hono + Cloudflare Workers + KV. TypeScript in `worker/`, plain ES modules in `adapters/`.

---

## 2. Repo layout

```
.
├── adapters/                canonical adapter library (shared by worker + extension)
│   ├── shopify.js           live Shopify (read + add_to_cart)
│   ├── jsonld.js            generic schema.org Product
│   ├── openapi.js           any OpenAPI 3.x / Swagger 2.0 spec → tools
│   ├── llm.js               last-resort LLM-fallback via Haiku
│   ├── CONTRACT.md          the detect() / extract() / actions interface
│   ├── _template/           starter scaffold for new adapters
│   ├── _fixtures/           captured pages for offline tests
│   └── _test/run.mjs        node:test harness, zero deps
├── worker/                  hosted API
│   ├── src/*.ts             Hono routes, OAuth, billing, SEO pages, token vault
│   ├── wrangler.toml        CF Worker config + KV bindings
│   └── tsconfig.json
├── extension/               Chrome MV3 extension (cache-back path)
├── sdks/
│   ├── python/wmcp/         Python SDK (pip install wmcp)
│   └── javascript/src/      TypeScript SDK (@wmcp/sdk)
├── scripts/seed_directory.py  pre-cache URLs to populate /u/* SEO pages
├── launch/                  launch-day assets (show-hn, twitter, substack, demo)
└── ADAPTERS_WANTED.md       sites where PRs are welcome
```

---

## 3. Hard rules

These have all bitten us this week. Follow them.

### 3.1 Don't change the adapter contract without updating `adapters/CONTRACT.md`

Adapters export exactly `ID`, `detect`, `extract`, and optionally `actions`. Both the worker AND the Chrome extension import from `adapters/*.js`. If you change the contract, both consumers break and so do third-party PRs.

### 3.2 Adapter files stay **plain ES modules with zero npm deps**

`adapters/*.js` must run unmodified in:
- Cloudflare Workers
- Chrome MV3 service workers
- Node 18+ (for tests)

No `import` of npm packages. No `require`. No TypeScript types in `.js` files. The standard `fetch`, `URL`, `crypto`, `DOMParser`, `JSON` are enough. If you absolutely need a util, inline it.

### 3.3 Worker imports adapters with `.js` extensions

```ts
// worker/src/index.ts
import * as shopify from "../../adapters/shopify.js";  // ✓ correct
import * as shopify from "../../adapters/shopify";     // ✗ breaks under ESM bundling
```

### 3.4 Never commit secrets

Worker secrets live in Cloudflare via `wrangler secret put`, never in code, never in `wrangler.toml`. Current secrets (do not duplicate elsewhere):

```
ADMIN_TOKEN, ANTHROPIC_API_KEY,
STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_TO_PLAN,
TOKEN_ENC_KEY,
GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET,
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
SLACK_CLIENT_ID, SLACK_CLIENT_SECRET,
NOTION_CLIENT_ID, NOTION_CLIENT_SECRET,
LINEAR_CLIENT_ID, LINEAR_CLIENT_SECRET,
STRIPE_CONNECT_CLIENT_ID, SHOPIFY_API_KEY, SHOPIFY_API_SECRET
ANTHROPIC_CLIENT_ID, ANTHROPIC_CLIENT_SECRET, CLAUDE_MAX_CLIENT_ID, CLAUDE_MAX_CLIENT_SECRET

# Optional, added 2026-05-28. Unset = the feature 503s (SKUs) or no-ops (alerts):
STRIPE_PRICE_VERIFIED   # price_… for the self-serve directory Verified subscription
STRIPE_PRICE_FIX        # price_… for the one-time Agent-Ready Fix (mode=payment)
LEAD_ALERT_WEBHOOK      # Slack-compatible incoming webhook for lead/submission alerts
```

The `TOKEN_ENC_KEY` is *load-bearing* — losing it makes every encrypted provider token in KV unreadable.

### 3.5 Never push to `origin/main` without explicit user approval

User reviews commits before push. Make commits freely, push only when asked. `gh repo edit … --visibility public` is irreversible-feeling and must be user-triggered.

### 3.6 Don't reformat someone else's adapter

Match existing style in the file you're touching. The codebase has no monolithic prettier config because the adapter files have to stay diff-clean for PR contributors.

### 3.7 SEO page constraints (worker/src/{vs_*,alternatives_*,integration_*,use_case_*,mcp_server_*,roundup_*,for_*,how_to_*,glossary_*}.ts)

These pages are public + indexed. They have legal/SEO/credibility surface area and have to clear all of these. Mistakes from the 2026-05-28 audit are catalogued here so they don't recur:

1. **Zero PII.** Never use "Alex Hearts", "alexhearts", "connordochuk99", any real person's name, real email, or absolute path containing `/Users/alexhearts/`. Use only `Acme Corp`, `support@example.com`, `<repo>`, etc.
2. **Pricing tiers are LOCKED — and there are TWO separate ladders; never conflate them.** (a) **Done-for-you service** (`/managed`): Starter $499 one-time / **Managed Retainer** $999/mo / Enterprise $4,999+/mo. The $999 tier was renamed from "Pro" → "Managed Retainer" on 2026-05-28 because "Pro" collided with the API plan — **never call the $999 tier "Pro" again.** (b) **Self-serve API plans** (`/dashboard`): Free / Builder $39/mo / Pro $99/mo / Reseller $299/mo (switched CAD→USD + Builder tier added 2026-06-03; this SUPERSEDES the old "Pro $29 / Reseller $99" figures — live site + Stripe now charge $39/$99/$299). So `$99/mo Pro` and `$299/mo Reseller` are CORRECT for the API plans; **NEVER invent** other numbers ($9/mo, $19/mo, $49/mo, free trials, "first month free"). This includes integration/use-case/comparison pages.
3. **No fabricated URLs.** Before citing any third-party GitHub repo, docs URL, or OpenAPI spec URL, WebFetch and confirm 200. Wrong orgs caught in prior audit: `anthropic/anthropic-openapi` (correct: `anthropics/anthropic-sdk-python`), `Airtable/airtable-openapi` (does not exist).
4. **No libel.** Don't claim competitors are "broken", "insecure", "dying", or store data "in plain-text." Comparative claims must be factual + neutral. Prior audit flagged a "plain-text" claim about Composio's token storage — that was reverted.
5. **Affiliation disclaimers.** Any page naming Anthropic/OpenAI/Google/Apple/Microsoft/Vercel/Cloudflare/Stripe/Slack/Notion/Linear/Discord/GitHub must include "wmcp.sh is not affiliated with `<Org>`" in hero subtitle or FAQ.
6. **Required body sections** (all 6): hero badge → wedge → code example (real, runnable) → capability table → FAQ details → upgrade CTA section (the one with `$499 one-time setup`) → footer.
7. **`/managed` body CTA + `/directory/submit` footer link.** Both required. Footer-only `/managed` mention is not enough.
8. **`integration_template.ts § VERTICAL_BY_PROVIDER`.** When you add a new `/integration/<provider>` page, ALSO add the provider entry to this map — otherwise the template's `see-also` block (which contains the `/managed ($499+)` CTA cross-link) silently disappears.
9. **Latency claims scoped right.** Cold-start ≠ per-call. Don't quote `500ms-1.5s` for a registry/installer; quote `2-30s first launch, then warm`.
10. **PKCE terminology.** PKCE is an OAuth flow extension. Use it only for actual OAuth flows (Google, GitHub, Slack, Notion, Linear, Discord OAuth). For static API keys + bot tokens use "encrypted credentials vault."
11. **`datePublished` in JSON-LD is `2026-05-28`** for everything in this current SEO drop. Bump when re-running.

When the writer agent (Gemini daemon, etc.) produces new pages, run this audit grep before wiring:

```bash
# PII — must be empty
git ls-files | xargs grep -lEi "alex ?hearts|alexhearts|connordochuk99" 2>/dev/null

# Forbidden lower-tier pricing — must be empty
xargs -a <(ls worker/src/<new-pattern>*.ts) /usr/bin/grep -nE '\$(9|19|29|49|99)/mo'

# /managed body CTA + /directory/submit on every new page
for f in worker/src/<new-pattern>*.ts; do
  /usr/bin/grep -q 'Need this done for you' "$f" || echo "MISSING /managed CTA: $f"
  /usr/bin/grep -q '/directory/submit' "$f" || echo "MISSING /directory/submit: $f"
done
```

---

## 4. Workflows — exact commands

### 4.1 After modifying an adapter

```bash
# from repo root
node adapters/_test/run.mjs    # all 9 tests must pass
```

### 4.2 After modifying anything under `worker/src/`

```bash
cd worker
npm run typecheck              # tsc --noEmit, must be clean
./node_modules/.bin/wrangler deploy
```

`wrangler deploy` ships to production. Pre-deploy: verify typecheck passes. Post-deploy: smoke test the affected route with `curl -i`.

### 4.3 After adding cached URLs (for SEO)

```bash
python3 scripts/seed_directory.py                  # built-in curated list
python3 scripts/seed_directory.py < urls.txt       # stdin
python3 scripts/seed_directory.py --rate 3         # slower for politeness
```

Each successful URL becomes one new `/u/<base64url-encoded-source>` page in the sitemap.

### 4.4 Inspecting / debugging

```bash
# Tail live worker logs
cd worker && ./node_modules/.bin/wrangler tail --format=pretty

# List KV keys (debug only — production data)
./node_modules/.bin/wrangler kv:key list --binding=CACHE --prefix=v1:
./node_modules/.bin/wrangler kv:key list --binding=KEYS --prefix=ptok:

# Inspect a specific key
./node_modules/.bin/wrangler kv:key get --binding=CACHE 'v1:https://www.allbirds.com/products/mens-wool-runners'
```

### 4.5 Output filtering — beware `rtk`

This workspace has a token-killer shim (`rtk`) that truncates bash output to save tokens. It **also corrupts files piped to disk**. If a curl/fetch produces unexpected `... (N more lines)` truncation in a file you wrote, prefix with `rtk proxy`:

```bash
rtk proxy curl -sS https://wmcp.sh/sitemap.xml > /tmp/x.xml     # uncorrupted
```

---

## 5. Architecture quirks (non-obvious)

### 5.1 Two caches under different prefixes

- `v1:<normalized_url>` — full payload (tools, product, variants), with TTL (shopify 1h, jsonld 6h, openapi 24h, llm 30d). Expires.
- `seen:<normalized_url>` — permanent first-time-seen index, with KV metadata `{adapter, ts, title}`. Used by `/directory` and `/sitemap.xml`. Never expires.

When the v1 cache misses but `seen` hits, `/u/<encoded>` renders a degraded page from metadata + triggers a background re-fetch.

### 5.2 SEO page URLs are base64url-encoded source URLs

`https://wmcp.sh/u/aHR0cHM6Ly93d3cuYWxsYmlyZHMuY29tL3Byb2R1Y3RzL21lbnMtd29vbC1ydW5uZXJz` decodes to `https://www.allbirds.com/products/mens-wool-runners`. Use the `base64urlEncode` / `base64urlDecode` helpers in `worker/src/u.ts`.

### 5.3 GitHub OAuth — one app, two flows

The GitHub OAuth App has **one** callback URL registered: `/api/v1/auth/github/callback` (sign-in). The "Connect GitHub" button in the dashboard funnels through the same flow, because GitHub OAuth Apps only allow one redirect URI. Don't try to register a second App — instead, the sign-in callback saves the token as a `github` provider connection so both needs are served by one OAuth round.

### 5.4 Anthropic OAuth uses Claude Code's public client_id

`9d1c250a-e61b-44d9-88ed-5944d1962f5e` — same one Claude Code, OpenCode, pi-ai, Hermes use. PKCE + OOB callback (Anthropic's page shows code, user pastes back). Custom `/connect/anthropic` page handles the dance. **ToS gray area**: Anthropic could revoke this client_id at any moment. Don't ship this as a load-bearing feature to paying customers until Anthropic offers an official third-party OAuth program.

### 5.5 Token vault is AES-GCM-256, key derived from `TOKEN_ENC_KEY`

`worker/src/token_vault.ts`. Random 12-byte IV per blob. Base64 of `iv ‖ ciphertext`. If `TOKEN_ENC_KEY` is rotated, every previously stored token becomes garbage. Treat the env value like a database backup key.

### 5.6 Cloudflare zone intercepts `/robots.txt`

The CF zone has AI Audit / Manage robots.txt enabled. Our worker's `/robots.txt` route exists and is correct, but the edge serves Cloudflare's `content-signals` version instead. To fix: dashboard → wmcp.sh → Bots → AI Audit → disable. Non-blocking for indexing (sitemap is fully usable).

### 5.7 Hosted worker secrets, not env vars

`wrangler.toml` only contains the non-sensitive `ENVIRONMENT = "production"`. Everything secret comes from `wrangler secret put`. There's no `.env` file in `worker/`.

---

## 6. Style

- **Comments:** default to none. Add a comment only when *why* is non-obvious (workaround, hidden constraint, surprising design choice). Never describe *what* the code does.
- **Filenames:** `snake_case.ts` in `worker/src/`, `kebab-case.md` for docs.
- **TypeScript:** strict mode, no `any` unless interfacing with adapter JS or external APIs that warrant it.
- **HTML in templates:** the `landing.ts` / `dashboard.ts` / `connect_anthropic.ts` files return HTML via template literals. **Watch for backticks inside the template** — they close the outer literal. Escape with `\`` or rephrase to avoid (we got bit by `\`tools\`` in `u.ts`).
- **Commit messages:** lowercase prefix (`oauth:`, `seo:`, `adapter:`, `launch:`, `chore:`) + tight summary. Include a `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>` footer when AI-generated.

---

## 7. Useful pre-loaded knowledge

When asked about architecture, **don't re-derive** these from scratch:

- The 4-adapter pipeline order in `/api/v1/tools`: shopify → openapi → jsonld → llm-fallback. Adapter detection is URL-pattern-first; only the LLM adapter requires HTML signals.
- The OAuth model: **Phase A** (`/api/v1/auth/github/*` → sessions) for sign-in, **Phase B** (`/api/v1/providers/<id>/*` → token vault) for per-provider connectors. They share the `oauth_state:` machinery in `worker/src/session.ts`.
- Token injection: when an OpenAPI tool's action handler runs, the worker passes a `resolveToken(host)` closure. The adapter calls it before falling back to `args._auth`. See `worker/src/token_resolver.ts`.

---

## 8. Don't do

- Don't reformat existing adapter files
- Don't add npm deps to `adapters/` files
- Don't push to `origin/main` without user approval
- Don't run `wrangler secret put` for a secret the user hasn't explicitly authorized
- Don't commit `__pycache__/`, `node_modules/`, `.wrangler/`, `dist/`, or `og.png` binaries (already in `.gitignore`)
- Don't introduce a build step in the worker (`wrangler deploy` handles TS bundling)
- Don't change the GitHub OAuth callback URL — `/api/v1/auth/github/callback` is what's registered on the app
- Don't store unencrypted tokens in KV — always go through `token_vault.ts`
- Don't add a second redirect URI to a provider OAuth App when one will do (we got bit by this with GitHub)

---

## 9. Quick task index

| Task | Where to start |
|---|---|
| Add a new adapter | `cp -r adapters/_template adapters/<name>`; read `adapters/CONTRACT.md` |
| Wire a new OAuth provider | Add entry to `worker/src/providers.ts`; the framework picks it up |
| Add a new dashboard section | `worker/src/dashboard.ts` (HTML in template literal) |
| Add a new landing section | `worker/src/landing.ts` |
| Add a worker route | `worker/src/index.ts` |
| Add an SDK helper | `sdks/python/wmcp/<file>.py` or `sdks/javascript/src/<file>.ts` |
| Bulk-seed SEO pages | `scripts/seed_directory.py` + curated URLs |
| Update launch copy | `launch/*.md` |

---

## 10. Knowledge graph

This project doesn't ship with a graphify graph at the moment. If you add one, document the regeneration command here so other agents keep it fresh after edits.

Reach out via the GitHub repo issues for anything ambiguous.
