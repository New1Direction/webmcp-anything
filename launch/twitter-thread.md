# Twitter / X launch thread

8-tweet thread. Attach the demo GIF/screenshot to tweet 1 (the connect-and-call moment). Each tweet is under 270 chars — count noted below each. Voice: technical, concrete, minimal emoji, no hype.

> Note: this thread reflects the current build — wmcp.sh is now a real MCP server (JSON-RPC 2.0 over Streamable HTTP), not just a JSON producer. The older 4-tweet "Shopify cart" cut is preserved at the bottom for reference.

---

## 1/ — the hook

```
you can add ANY website to Claude, Cursor, or Codex as
agent-callable MCP tools. one line of config. no per-server
build, no SDK.

paste a URL → it's a connectable MCP server.

live: wmcp.sh

[attach the connect→tools/call demo GIF]
```

`232 chars`

## 2/ — the config

```
every MCP server today is one-per-service and hand-built.
wmcp is one endpoint for the whole web.

drop this into Claude/Cursor/Codex and the page's tools show up:

{ "mcpServers": { "wmcp": {
  "type": "http",
  "url": "https://wmcp.sh/mcp/u/<base64url-of-any-url>"
}}}
```

`270 chars`

## 3/ — how it works (5-tier)

```
no LLM in the hot path. a 5-tier chain turns a URL into tools:

1 Shopify (storefront JSON)
2 JSON-LD (schema.org)
3 OpenAPI (any spec → tools)
4 provider table (Stripe, GitHub, Slack…)
5 Claude-Haiku fallback, cached

cache hit = sub-50ms.
```

`240 chars`

## 4/ — compose + toolsets

```
one URL is the simple case. you can also compose:

/mcp/url?url=a&url=b → several sites, ONE server, tools
namespaced per host (site_a__add_to_cart).

or save a bundle as a reusable toolset: /mcp/set/<id>.

your agent sees one clean tool list.
```

`243 chars`

## 5/ — the directory + REST

```
prefer raw JSON? there's a free REST API:

  GET /api/v1/tools?url=...

returns the same tool list in Claude tool_use / OpenAI
function_call / MCP shape.

and a public directory of everything the community has
already indexed: wmcp.sh/directory
```

`244 chars`

## 6/ — free vs paid

```
tools/list (discovery) is free, no signup.
tools/call (live execution) needs a paid key, passed as a
Bearer header.

Free $0 · Builder $39/mo · Pro $99/mo · Reseller $299/mo.

done-for-you adapters + white-label MCP start at $499 on
/managed. all the adapters are MIT.
```

`250 chars`

## 7/ — why it's different

```
the usual MCP server wraps one API you already have creds for.

wmcp goes the other way: arbitrary public URLs → tools, with
an OAuth-vault proxy (/mcp/<provider>) for the protected ones.

you stop writing a new server per site. the web becomes the
toolset.
```

`257 chars`

## 8/ — repo + CTA

```
open source, MIT, runs on Cloudflare Workers:
github.com/New1Direction/webmcp-anything

try it now — paste a URL, wire the one-line config, watch
your agent call it: wmcp.sh

SDKs: pip install wmcp / npm @wmcp/sdk (openai, langchain,
anthropic, vercel-ai adapters).
```

`265 chars`

---

## After-thread reply (optional, posted 2-3h later)

If the thread takes off, quote-RT tweet 1 with:

```
adapters are MIT and accepting PRs:
github.com/New1Direction/webmcp-anything

ship a non-trivial adapter (etsy, walmart, woocommerce…)
and I'll comp you a Pro plan. bigger ones get Reseller +
a shout-out here.
```

`209 chars`

## LinkedIn variant

LinkedIn audience is less dev-native. Reshape into one long post (no thread). Lead with the *business* angle: "AI agents are great at producing tokens, bad at acting on the actual web. Here's the open-source layer that turns any URL into agent-callable tools — one line of config, no per-server build." Same demo GIF. Same CTA. Keep the config snippet but explain MCP in one sentence first.

---

## Reference — original 4-tweet cut (pre-MCP-server build)

Kept for tone. Use only if leading with the Shopify add-to-cart story instead of the connect-to-client story.

### 1/4 — the hook

```
i gave an LLM agent the ability to add anything from any Shopify
store to a cart, in one API call.

paste the URL, get MCP tools back, agent calls them.

no scraper-per-site. live demo: wmcp.sh

[attach the 30–45s screen recording]
```

### 2/4 — the insight

```
the trick: there are really only ~3 patterns most product pages
use under the hood.

shopify exposes a json endpoint. most non-shopify sites have
schema.org JSON-LD. the long tail needs client-side extraction.

wmcp.sh routes between them automatically.
```

### 3/4 — the network effect

```
for bot-protected sites (akamai/incapsula), a chrome extension
extracts the schema client-side and pushes it back to the API.

every extension install adds to a shared cache. more users =
more sites work server-side for everyone.
```

### 4/4 — the ask

```
free tier is 100 reads/day no signup.
paid is $99 for live execute (Builder $39) + $299 for resellers.

if you're building an agent that needs to actually do things on
websites, try it: wmcp.sh

feedback on schema shape + adapter requests very welcome.
```
