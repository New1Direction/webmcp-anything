# Show HN: Add any website to Claude/Cursor as MCP tools with one line of config

I kept wanting to give a coding agent the ability to act on a specific
website — read a product, hit an OpenAPI endpoint, call a documented
action — and every time it meant writing and hosting a one-off MCP server
for that one service. MCP standardizes the protocol but somebody still has
to build the adapter per site. wmcp.sh is a hosted MCP server that skips
that step: you point a client at a URL and it exposes that page's
extractable actions as tools.

The novel part is the addressing. You base64url-encode any URL into the
endpoint and that becomes a real, connectable MCP server — no per-service
code, no SDK. In Claude Code, Cursor, Codex, Cline, or VS Code it's one
block:

    { "mcpServers": { "wmcp": { "type": "http",
      "url": "https://wmcp.sh/mcp/u/<base64url-of-any-url>" } } }

You can also pass `?url=a&url=b` to compose several sites into one server
(tool names get host-namespaced), or proxy an OAuth-protected upstream
where wmcp.sh holds the token in an encrypted vault.

How it works: it's a genuine JSON-RPC 2.0 server over Streamable HTTP
(stateless — identity lives in the URL, gating is returned as JSON-RPC
errors rather than HTTP 401/402 so clients don't misread them as auth or
session loss). Behind that is a five-tier extraction chain — Shopify JSON,
then OpenAPI specs, then schema.org JSON-LD, then a known-provider table,
and finally a Claude Haiku fallback that produces best-effort tools and
caches them on Cloudflare KV. `tools/list` (discovery) is free and
anonymous; live `tools/call` needs a paid key passed as a Bearer header.
Self-serve API is Free / Builder $39/mo / Pro $99/mo / Reseller $299/mo; there's a separate
done-for-you tier ($499 one-time and up) if you want a custom adapter
hand-built and verified.

What it's not: it doesn't run a headless browser, so sites behind
Akamai/Incapsula or that hydrate client-side from authed APIs (Amazon is
the obvious one) don't work server-side — there's a Chrome extension that
extracts those client-side and caches the schema back, but it's a separate
path. The Haiku fallback is best-effort, not guaranteed-correct tool
shapes. Stripe billing is wired but not yet fully self-serve in the
dashboard. And the optional Anthropic-account proxy reuses Claude Code's
public OAuth client_id, which is a ToS gray area I wouldn't build a
business on. Repo is MIT and you can self-host it.

https://wmcp.sh — repo: https://github.com/New1Direction/webmcp-anything

## Title (<=80 chars)

`Show HN: Add any website to Claude/Cursor as MCP tools with one line of config`

(78 chars. Alternates, if the lead reads too long:
- `Show HN: Turn any URL into a connectable MCP server, no per-service code`
- `Show HN: wmcp.sh – one hosted MCP server that exposes any URL as agent tools`)

## Rules before posting

- **Don't start with "Hi HN".** Cliché, drops engagement.
- **No marketing words** — "revolutionize", "powerful", "seamless", "game-changer". HN downvotes them.
- **Post Tue–Thu, 8–10am US Pacific.** Avoid Fri afternoons and weekends.
- **Be there for the first 2 hours.** HN ranks on early comment velocity — reply to every top-level comment quickly.
- **Don't reply defensively to criticism.** Acknowledge → say what you'll do about it → move on.

## Prepared answers for likely questions

> "Isn't this just scraping with extra steps?"

A scraper outputs unstructured data. This outputs MCP tools with explicit input schemas, descriptions, and live actions an agent can call (`add_to_cart`, an OpenAPI operation, etc.). The whole point is that an LLM has to *decide* which tool to call and with what arguments, and that needs a real tool schema, not a blob of HTML.

> "Why not Browserbase / Playwright in the cloud?"

Most pages don't need a real browser — Shopify exposes JSON, schema.org sites embed JSON-LD, OpenAPI specs are already machine-readable. Headless browsers are slow and expensive, so wmcp.sh uses the cheap path first and leaves the bot-protected long tail to the Chrome extension.

> "Does it work on Amazon?"

Not server-side, on purpose — its bot protection would burn a hosted fetcher fast. The extension path can extract client-side, but that adapter isn't shipped yet.

> "What about Terms of Service?"

The hosted server only hits public, unauthenticated endpoints — Shopify's documented `/products/<slug>.json`, JSON-LD that sites embed *for* automated consumers, published OpenAPI specs. It doesn't bypass paywalls, login walls, or rate limits. The OAuth-proxy path only touches upstreams you've explicitly connected.

> "How accurate is the LLM fallback?"

Best-effort. The first four tiers are deterministic; the Haiku tier is a last resort for sites with no structured data, and its output is cached so it's not re-guessed every call. If a site matters to you, the done-for-you tier hand-builds and verifies the adapter.

## What I'd love feedback on

- Does the tool/schema shape actually match what your agents want to call?
- Which sites/categories should get a deterministic adapter next?
- Does the cache-back model (extension installs make the shared cache better for everyone) feel reasonable or sketchy?

## URL to submit

`https://wmcp.sh` (the live server + demo; not the GitHub repo). After posting, note the HN item URL so Twitter/Substack can link to it for the next 48h.
