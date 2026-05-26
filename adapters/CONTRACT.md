# Adapter contract

Every adapter is a plain ES module that exports three things.

```js
export const ID = "mysite";              // short, lowercase, unique
export function detect(ctx) { ... }      // returns null OR a detection context
export async function extract(ctx) { ... } // returns { tools, product, variants? }
export const actions = { /* optional */ }; // handlers for live execute
```

That's it. No classes, no framework, no build step. The file must run unmodified in a Cloudflare Worker **and** in a Chrome extension service worker, so:

- ES modules only (`import` / `export`)
- No Node-only APIs (`fs`, `path`, `process`, etc.)
- No top-level `await` of network calls
- No npm dependencies. The standard `fetch`, `URL`, `crypto`, `DOMParser` (worker has it via global), and `JSON` are enough for anything we've needed so far.

## `detect(ctx) → null | DetectionContext`

Given an input context, decide whether this adapter applies. Return `null` if not — the next adapter in the chain will be tried.

The input shape:

```ts
{
  url: string;          // always present
  html?: string;        // may be empty (e.g. when called pre-fetch)
  jsonld?: any[];       // pre-parsed schema.org blocks, if available
  meta?: Record<string, string>;  // open-graph + twitter meta
  title?: string;       // <title>
}
```

Return any object that's useful to `extract()` — typically a parsed identifier and a URL to fetch. Use `adapter: ID` as the first key so downstream logs are readable.

```js
return {
  adapter: ID,
  productId: m[1],
  apiUrl: `${origin}/api/products/${m[1]}.json`,
};
```

`detect()` must be **synchronous and side-effect-free.** No `fetch()` calls. If you need network to confirm, fall through to `extract()`.

## `extract(ctx) → { tools, product, variants? }`

`ctx` is whatever `detect()` returned. This is where network calls happen.

Return shape:

```ts
{
  product: { title?: string; name?: string; ...arbitrary };
  variants?: Array<{ id: string; price?: string; available?: boolean; ...arbitrary }>;
  tools: Array<{
    name: string;                  // snake_case
    description?: string;
    result?: any;                  // static return (no action needed)
    action?: { kind: string; ...arbitrary };  // for live execute
  }>;
}
```

A tool is either **static** (has `result`) or **actionable** (has `action`). Mix freely.

- **Static tools** are useful for read-only data — `get_price`, `get_availability`, `get_reviews`.
- **Actionable tools** trigger a handler in `actions` when executed. Used for `add_to_cart`, `subscribe`, `submit_form`, etc.

If your adapter only does static extraction, omit `actions` entirely.

## `actions` (optional)

Object keyed by `action.kind`. Each handler receives the merged action + user args:

```js
export const actions = {
  mysite_add_to_cart: async ({ productId, args }) => {
    const res = await fetch(`https://mysite.com/cart`, {
      method: "POST",
      body: JSON.stringify({ productId, qty: args.quantity ?? 1 }),
    });
    return await res.json();
  },
};
```

Handlers should be idempotent where possible and return JSON-serializable data.

## Headers / fetch etiquette

Many retailers block server-side fetches without a realistic User-Agent. Set one:

```js
const CHROME_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36";
```

Use `credentials: "omit"` to avoid leaking user cookies when running in the extension.

## What "good" looks like

A merged adapter:

1. **Detects sharply** — no false positives on other sites. If you can't disambiguate from URL alone, return `null` and rely on `html`/`jsonld` hints.
2. **Has at least one static tool** (`get_price` is the floor) and ideally one actionable one.
3. **Ships with a fixture** in `_fixtures/` and a test in `_test/`.
4. **Handles failure gracefully** — throw clear errors, don't swallow.
5. **Never logs secrets** — assume PRs run in production.
