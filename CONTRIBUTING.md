# Contributing to WebMCP Anything

Thanks for wanting to make the agentic web bigger. Most contributions land as **new adapters** — code that teaches the system how to turn a specific kind of URL into agent tools. This guide walks through that. Other contributions (bugfixes, docs, the worker itself) are welcome too — same PR process, less ceremony.

## Quick start (new adapter, 10 minutes)

1. **Pick a site.** Check [ADAPTERS_WANTED.md](./ADAPTERS_WANTED.md) for ideas, or scratch your own itch. Open an issue first if it's a big one ("Amazon", anything requiring auth) so we don't duplicate work.
2. **Fork + branch.**
   ```bash
   git clone https://github.com/YOUR-FORK/webmcp-anything
   cd webmcp-anything
   git checkout -b adapter/etsy
   ```
3. **Copy the template.**
   ```bash
   cp -r adapters/_template adapters/etsy
   ```
   Rename the file inside to `etsy.js` and update the `ID`.
4. **Implement `detect()` + `extract()`.** Read [adapters/CONTRACT.md](./adapters/CONTRACT.md) for the exact interface. Keep the file dependency-free.
5. **Capture a fixture.**
   ```bash
   curl -sS 'https://www.etsy.com/listing/123456/something' > adapters/_fixtures/etsy_listing.html
   ```
6. **Add a test.** Open `adapters/_test/run.mjs` and add a case for your adapter pointing at the fixture. Run:
   ```bash
   node adapters/_test/run.mjs
   ```
   It should print `ok 1 - etsy` (or your adapter ID).
7. **Wire it into the worker.** Add an import + push to `ADAPTERS` in `worker/src/index.ts`. The order matters — most-specific adapters first, generic fallbacks last.
8. **PR.** Reference the issue if one exists. Include:
   - What sites it covers (URL patterns)
   - What tools it produces (`get_price`, `add_to_cart`, etc.)
   - Whether `actions` are live or stubbed
   - Anything weird about the site (bot protection, regional pages, etc.)

We'll review within a few days, run the test suite, and merge.

## What we will and won't accept

**Will:**
- Adapters for any publicly accessible site that doesn't require auth to browse
- Generic adapters for formats (RSS, OpenAPI, `text/llms.txt`, etc.)
- Test fixtures + harness improvements
- Performance fixes, security fixes, docs

**Won't (for now):**
- Adapters that circumvent paywalls, bypass login walls, or violate a site's ToS in a non-trivial way
- Adapters with npm dependencies (we keep the runtime tight — Cloudflare Workers free tier)
- Anything that requires shipping a credential
- Refactors-for-refactor's-sake on the worker. Open an issue first.

## Coding style

- ES modules. No CommonJS, no TypeScript in `adapters/` (the worker is TS, the adapters are plain JS so they run in both Worker and extension contexts).
- No semicolons or with semicolons — match the existing files in `adapters/`. Don't reformat someone else's adapter.
- Two-space indent, double quotes for strings, no trailing comma policy enforced.
- Comments explain *why* not *what*. Don't write "// loop over variants" — write "// Variants come back unsorted; we sort by available-then-price to match what shoppers see."

## License

By contributing you agree your code is released under the [MIT License](./LICENSE) along with the rest of the project.

## What you get out of it

- Your GitHub handle in the credits and on the [directory](https://wmcp.sh/directory) for every URL your adapter handles
- A Pro plan key on the house if you ship a non-trivial adapter (open an issue and we'll DM)
- The petty satisfaction of having taught a thousand AI agents to interact with the site you cared about

## Questions

Open a GitHub Discussion, or ping the email in the repo's `package.json`.
