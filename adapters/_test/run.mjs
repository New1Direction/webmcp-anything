// Minimal test harness for adapters. Zero deps — uses node:test.
//
// Run from repo root:
//   node adapters/_test/run.mjs
//
// Each case calls detect() against a synthetic input and (optionally) extract()
// against a captured fixture. We don't hit the live network in CI — fixtures
// only — so this is fast and deterministic.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(HERE, "..", "_fixtures");

async function fixture(name) {
  return await readFile(join(FIXTURES, name), "utf8");
}

// --- shopify ---
test("shopify detects /products/<handle>", async () => {
  const shopify = await import("../shopify.js");
  const ctx = shopify.detect({ url: "https://www.allbirds.com/products/mens-wool-runners", html: "" });
  assert.ok(ctx, "detect should return a context");
  assert.equal(ctx.adapter, "shopify");
  assert.equal(ctx.handle, "mens-wool-runners");
  assert.ok(ctx.productJsonUrl.endsWith("/products/mens-wool-runners.json"));
});

test("shopify ignores non-product URLs", async () => {
  const shopify = await import("../shopify.js");
  assert.equal(shopify.detect({ url: "https://www.allbirds.com/collections/mens", html: "" }), null);
  assert.equal(shopify.detect({ url: "https://example.com", html: "" }), null);
});

// --- jsonld ---
test("jsonld detects schema.org Product", async () => {
  const jsonld = await import("../jsonld.js");
  const ctx = jsonld.detect({
    jsonld: [
      {
        "@context": "https://schema.org",
        "@type": "Product",
        name: "Test Product",
        offers: { "@type": "Offer", price: "29.99", priceCurrency: "USD" },
      },
    ],
    meta: {},
    url: "https://example.com/p/123",
    title: "Test Product · Example",
  });
  assert.ok(ctx, "detect should return a context for a Product node");
});

test("jsonld ignores pages with no Product node", async () => {
  const jsonld = await import("../jsonld.js");
  assert.equal(
    jsonld.detect({
      jsonld: [{ "@type": "Article" }],
      meta: {},
      url: "https://blog.example.com/post",
      title: "A blog post",
    }),
    null
  );
});

// --- openapi ---
test("openapi detects openapi.json + swagger.json URLs", async () => {
  const openapi = await import("../openapi.js");
  assert.ok(openapi.detect({ url: "https://petstore3.swagger.io/api/v3/openapi.json" }));
  assert.ok(openapi.detect({ url: "https://api.example.com/swagger.json" }));
  assert.ok(openapi.detect({ url: "https://example.com/api-docs" }));
  assert.ok(openapi.detect({ url: "https://example.com/v2/swagger.json" }));
});

test("openapi rejects plain URLs", async () => {
  const openapi = await import("../openapi.js");
  assert.equal(openapi.detect({ url: "https://example.com" }), null);
  assert.equal(openapi.detect({ url: "https://allbirds.com/products/runner" }), null);
});

test("openapi exports an action handler", async () => {
  const openapi = await import("../openapi.js");
  assert.equal(typeof openapi.actions.openapi_request, "function");
});

// --- llm fallback ---
test("llm.detect needs an API key", async () => {
  const llm = await import("../llm.js");
  // No key → null
  assert.equal(llm.detect({ url: "https://example.com", title: "t" }), null);
  // No signals → null
  assert.equal(llm.detect({ url: "https://example.com", llmKey: "sk-test" }), null);
  // Has key + has signal → context
  const ctx = llm.detect({
    url: "https://example.com",
    title: "Some Product",
    llmKey: "sk-test",
  });
  assert.ok(ctx);
  assert.equal(ctx.adapter, "llm");
});

// --- template guard ---
// Make sure the _template/ file is still syntactically valid + exports the
// right shape, so contributors copying it don't start from broken code.
test("_template/adapter.js exports the required shape", async () => {
  const tmpl = await import("../_template/adapter.js");
  assert.equal(typeof tmpl.ID, "string");
  assert.equal(typeof tmpl.detect, "function");
  assert.equal(typeof tmpl.extract, "function");
});

// --- Adding your own ---
// When you add a new adapter:
//   1. Import it above.
//   2. Add at least one `test("yourname detects ...")` that exercises detect().
//   3. If you have a captured page in _fixtures/, exercise extract() too,
//      mocking globalThis.fetch where needed.
