# _fixtures/

Captured copies of real pages used by `_test/run.mjs`. The harness reads these as static strings so tests run offline.

## Capturing a fixture

```bash
curl -sS \
  -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' \
  -o adapters/_fixtures/etsy_listing.html \
  'https://www.etsy.com/listing/123456789/example-product'
```

Pick a representative URL: a real product that won't disappear from the catalog.

## Sizes

Keep fixtures under ~200KB each. Strip large `<style>` blocks and tracking JS if needed — what matters is the structured data, not the visual chrome. A tool like `lynx --dump` can help if the raw HTML is too messy.

## Naming

`<adapter-id>_<short-description>.html` — e.g. `shopify_allbirds_runner.html`, `jsonld_bestbuy_sony.html`.

## Legal note

Fixtures contain page markup that's likely copyrighted by the source site. Keep snippets small (the structured-data blocks + a handful of surrounding tags is enough) and document the original URL inside the fixture as an HTML comment at the top:

```html
<!-- source: https://www.example.com/products/x  captured: 2026-05-26 -->
```

If a site sends a takedown request we'll honor it; don't include sensitive or personal data.
