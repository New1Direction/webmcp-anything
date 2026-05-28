# OAuth app registration guide

You need to register an OAuth app (or get an API key) in each provider's developer console, then set the resulting `client_id` + `client_secret` as worker secrets. After that, the "Connect" buttons in `/dashboard` start working.

Common callback URL for all providers (substitute the provider id):

```
https://wmcp.sh/api/v1/providers/<provider_id>/callback
```

Examples:
- `https://wmcp.sh/api/v1/providers/github/callback`
- `https://wmcp.sh/api/v1/providers/stripe/callback`
- `https://wmcp.sh/api/v1/providers/google/callback`

The encryption key for stored tokens is set once for the whole vault:

```bash
# generate locally — SAVE IT IN 1PASSWORD BEFORE PASTING
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
cd <repo>/worker
./node_modules/.bin/wrangler secret put TOKEN_ENC_KEY
```

⚠️ If you lose TOKEN_ENC_KEY, every connected token in KV becomes unreadable. Treat it like a database backup key.

---

## 1. GitHub — easiest, do this first

Console: <https://github.com/settings/developers> (sign in as **New1Direction**)

Steps:
1. **OAuth Apps** → **New OAuth App**
2. Application name: `WebMCP Anything — Connector`
3. Homepage URL: `https://wmcp.sh`
4. Authorization callback URL: `https://wmcp.sh/api/v1/providers/github/callback`
5. Register → copy **Client ID**
6. Generate a new client secret → copy

Already used for sign-in (Phase A). If you registered the OAuth app earlier, the same client_id/secret work for both flows — just confirm the callback URL covers both.

Set:
```bash
./node_modules/.bin/wrangler secret put GITHUB_CLIENT_ID
./node_modules/.bin/wrangler secret put GITHUB_CLIENT_SECRET
```

---

## 2. Stripe Connect

Console: <https://dashboard.stripe.com/settings/connect>

Steps:
1. Activate **Stripe Connect** if not already (it's a one-click thing)
2. Settings → Connect → **OAuth settings**
3. Add redirect URI: `https://wmcp.sh/api/v1/providers/stripe/callback`
4. Copy the **Connect client ID** (looks like `ca_…`)
5. The Connect OAuth uses your existing `STRIPE_SECRET_KEY` as the secret — already set

Set:
```bash
./node_modules/.bin/wrangler secret put STRIPE_CONNECT_CLIENT_ID
# paste ca_…
```

---

## 3. Google Workspace

Console: <https://console.cloud.google.com/apis/credentials>

Steps:
1. Create or select a project
2. **OAuth consent screen** → External → fill in app name, support email, dev contact email → Save
3. Add scopes (it'll let you skip publishing, stays in "Testing" mode for first 100 users):
   - `openid`, `email`, `profile`
   - `https://www.googleapis.com/auth/gmail.modify`
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/drive`
   - `https://www.googleapis.com/auth/spreadsheets`
4. **Credentials** → Create credentials → OAuth client ID → Web application
5. Authorized redirect URI: `https://wmcp.sh/api/v1/providers/google/callback`
6. Copy **Client ID** + **Client secret**

Set:
```bash
./node_modules/.bin/wrangler secret put GOOGLE_CLIENT_ID
./node_modules/.bin/wrangler secret put GOOGLE_CLIENT_SECRET
```

⚠️ Google's "Testing" mode caps users at 100. To go past that you need verification (which takes weeks for sensitive scopes like Gmail). Plan accordingly.

---

## 4. Slack

Console: <https://api.slack.com/apps>

Steps:
1. **Create New App** → From scratch
2. App Name: `WebMCP Anything`
3. Workspace: pick yours
4. Once created, **OAuth & Permissions**
5. Redirect URLs: add `https://wmcp.sh/api/v1/providers/slack/callback`
6. Scopes → Bot Token Scopes: add `chat:write`, `channels:read`, `channels:history`, `users:read`
7. **Basic Information** → copy **Client ID** + **Client Secret**

Set:
```bash
./node_modules/.bin/wrangler secret put SLACK_CLIENT_ID
./node_modules/.bin/wrangler secret put SLACK_CLIENT_SECRET
```

---

## 5. Notion

Console: <https://www.notion.so/my-integrations>

Steps:
1. **New integration** → Public integration
2. Name: `WebMCP Anything`
3. Associated workspace: pick yours
4. Redirect URIs: `https://wmcp.sh/api/v1/providers/notion/callback`
5. Submit → copy **Client ID** + **Client Secret** + **OAuth domain** (you'll need to verify domain ownership of wmcp.sh later)

Set:
```bash
./node_modules/.bin/wrangler secret put NOTION_CLIENT_ID
./node_modules/.bin/wrangler secret put NOTION_CLIENT_SECRET
```

---

## 6. Linear

Console: <https://linear.app/settings/api/applications>

Steps:
1. **Create new application**
2. Application name: `WebMCP Anything`
3. Developer URL: `https://wmcp.sh`
4. Callback URL: `https://wmcp.sh/api/v1/providers/linear/callback`
5. Scopes: `read`, `write` (or `issues:create` if you only want issue scope)
6. Create → copy **Client ID** + **Client Secret**

Set:
```bash
./node_modules/.bin/wrangler secret put LINEAR_CLIENT_ID
./node_modules/.bin/wrangler secret put LINEAR_CLIENT_SECRET
```

---

## 7. Shopify (admin/per-shop)

Console: <https://partners.shopify.com> (Partner account; free)

Steps:
1. Apps → Create app → Public app
2. App URL: `https://wmcp.sh`
3. Allowed redirection URLs: `https://wmcp.sh/api/v1/providers/shopify/callback`
4. API access → request scopes: `read_products`, `write_products`, `read_orders`, `write_orders`
5. Copy **API key** (= client_id) and **API secret key** (= client_secret)

Set:
```bash
./node_modules/.bin/wrangler secret put SHOPIFY_API_KEY
./node_modules/.bin/wrangler secret put SHOPIFY_API_SECRET
```

Connecting in dashboard requires the user to pass their shop subdomain (`?shop=acme` → `acme.myshopify.com`). Per-shop OAuth — different from the public storefront adapter we already ship.

---

## 8. OpenAI / Codex — API key only

OpenAI doesn't expose a third-party OAuth flow for inference. The "Connect" button in the dashboard shows an API-key form instead. Each user pastes their own `sk-…` from <https://platform.openai.com/api-keys>.

Nothing to register on your side — the framework already handles user-pasted API keys (encrypted at rest with TOKEN_ENC_KEY).

---

## 9. Anthropic Console (org:create_api_key)

Console: not publicly self-serve. Anthropic OAuth client registration is via email.

Steps:
1. Email `support@anthropic.com` (or via the Console support form)
2. Request an OAuth client for `WebMCP Anything (wmcp.sh)` with scope `org:create_api_key user:profile`
3. Provide redirect URI: `https://wmcp.sh/api/v1/providers/anthropic/callback`
4. Wait. Expect days to weeks.

When approved, you'll get a `client_id` and `client_secret`.

Set:
```bash
./node_modules/.bin/wrangler secret put ANTHROPIC_CLIENT_ID
./node_modules/.bin/wrangler secret put ANTHROPIC_CLIENT_SECRET
```

This path lets us call inference billed to the user's Anthropic account by creating per-user API keys from their org. Fully legitimate.

---

## 10. Claude Max (user:inference) — experimental, ToS gray area

There is no public Anthropic OAuth client registration for the `user:inference` scope. This scope is what Claude Desktop uses to consume the user's Max subscription for inference inside the app.

Three paths:

**a) Wait for an official Anthropic OAuth program for `user:inference`.** None exists at time of writing. The framework is ready; you flip it on when Anthropic opens this up.

**b) Reuse Claude Desktop's client_id.** Recoverable from your existing RE artifacts:

```bash
python3 ~/claude-desktop-re-tools/extract_claude_asar.py --summary-json /tmp/asar-summary.json
# search /tmp/asar-summary.json for the client_id near the desktop redirect URI
```

Then set:
```bash
./node_modules/.bin/wrangler secret put CLAUDE_MAX_CLIENT_ID
./node_modules/.bin/wrangler secret put CLAUDE_MAX_CLIENT_SECRET   # if applicable; desktop is PKCE so may not need
```

⚠️ Using a first-party client_id outside the first-party app violates Anthropic ToS. Anthropic could:
- Revoke the client_id at any time (breaks the integration)
- Issue a takedown / cease-and-desist
- Ban your Anthropic account

Only acceptable as a research prototype on a sandbox account. Do not ship this to paying customers.

**c) Operate at the layer Anthropic does support.** Same `org:create_api_key` path as Anthropic Console (path 9). Users pay through Anthropic API billing instead of Max. Less ideal UX but no ToS risk.

---

## Verification

After setting any provider's secrets, hit `/dashboard` (signed in), and the corresponding "Connect" button should redirect to that provider's authorize page. After consent, you land back on `/dashboard?connected=<provider_id>` and the green ✓ Connected appears next to that provider.

To verify token storage worked:
```bash
# Without revealing the key, confirm the encrypted blob is in KV
./node_modules/.bin/wrangler kv:key list --binding=KEYS --prefix=ptok: | head
```

The format is `ptok:<user_id>:<provider_id>`. Values are encrypted; you'll only see the key names.
