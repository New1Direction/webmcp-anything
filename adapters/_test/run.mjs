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

// --- llms.txt ---
test("llmstxt detects direct llms.txt URLs only", async () => {
  const llmstxt = await import("../llmstxt.js");
  assert.ok(llmstxt.detect({ url: "https://example.com/llms.txt" }));
  assert.ok(llmstxt.detect({ url: "https://example.com/llms-full.txt?raw=1" }));
  assert.equal(llmstxt.detect({ url: "file:///tmp/llms.txt" }), null);
  assert.equal(llmstxt.detect({ url: "ftp://example.com/llms.txt" }), null);
  assert.equal(llmstxt.detect({ url: "https://example.com/docs" }), null);
  assert.equal(llmstxt.detect({ url: "https://example.com/not-llms.txt.backup" }), null);
});

test("llmstxt extract parses sections and declared links into tools", async () => {
  const llmstxt = await import("../llmstxt.js");
  const body = await fixture("llmstxt_example.txt");
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, opts) => {
    assert.equal(String(url), "https://example.com/llms.txt");
    assert.equal(opts.credentials, "omit");
    return new Response(body, {
      status: 200,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  };
  try {
    const data = await llmstxt.extract({ adapter: "llmstxt", sourceUrl: "https://example.com/llms.txt" });
    assert.equal(data.product.title, "Example Agent Surface");
    assert.equal(data.product.summary, "A compact map of agent-readable documentation and APIs.");
    assert.equal(data.product.description, "Use the stable docs before the API reference when bootstrapping an integration.");
    assert.equal(data.product.section_count, 3);
    assert.equal(data.product.link_count, 4);
    const names = data.tools.map((t) => t.name);
    assert.deepEqual(names, ["list_sections", "get_section", "fetch_link"]);
    const list = data.tools.find((t) => t.name === "list_sections");
    assert.equal(list.result.sections[0].name, "Docs");
    assert.equal(list.result.sections[0].links[0].url, "https://example.com/docs/quickstart.md");
    const optional = list.result.sections.find((section) => section.name === "Optional");
    assert.equal(optional.optional, true);
    assert.equal(optional.links[0].optional, true);
    assert.equal(optional.links[0].url, "https://example.com/releases");
    const fetchTool = data.tools.find((t) => t.name === "fetch_link");
    assert.equal(fetchTool.inputSchema.required[0], "url");
    assert.equal(fetchTool.action.kind, "llmstxt_fetch_link");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("llmstxt action returns declared sections by name", async () => {
  const llmstxt = await import("../llmstxt.js");
  const section = await llmstxt.actions.llmstxt_get_section({
    sections: [{ name: "Docs", links: [{ name: "Quickstart", url: "https://example.com/docs" }] }],
    args: { section: "docs" },
  });
  assert.equal(section.name, "Docs");
  await assert.rejects(
    llmstxt.actions.llmstxt_get_section({ sections: [], args: { section: "Docs" } }),
    /not declared/
  );
});

test("llmstxt action fetches only declared links", async () => {
  const llmstxt = await import("../llmstxt.js");
  const links = [
    { name: "Quickstart", url: "https://example.com/docs/quickstart.md", description: "Start here." },
  ];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, opts) => {
    assert.equal(String(url), "https://example.com/docs/quickstart.md");
    assert.equal(opts.credentials, "omit");
    return new Response("# Quickstart\n\nHello agents.", {
      status: 200,
      headers: { "content-type": "text/markdown" },
    });
  };
  try {
    const value = await llmstxt.actions.llmstxt_fetch_link({
      links,
      args: { url: "https://example.com/docs/quickstart.md" },
    });
    assert.equal(value.status, 200);
    assert.equal(value.url, "https://example.com/docs/quickstart.md");
    assert.match(value.body, /Hello agents/);
    await assert.rejects(
      llmstxt.actions.llmstxt_fetch_link({ links, args: { url: "https://other.example.com/" } }),
      /not declared/
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("llmstxt rejects non-http declared links", async () => {
  const llmstxt = await import("../llmstxt.js");
  let fetchCalls = 0;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    fetchCalls++;
    return new Response(
      "# Example\n\n## Docs\n\n- [Safe](https://example.com/docs)\n- [Mail](mailto:docs@example.com)\n- [Local](http://127.0.0.1/admin)\n- [Metadata](http://169.254.169.254/latest)",
      { status: 200 }
    );
  };
  try {
    const data = await llmstxt.extract({ adapter: "llmstxt", sourceUrl: "https://example.com/llms.txt" });
    const fetchTool = data.tools.find((t) => t.name === "fetch_link");
    assert.deepEqual(fetchTool.inputSchema.properties.url.enum, ["https://example.com/docs"]);
    await assert.rejects(
      llmstxt.actions.llmstxt_fetch_link({
        links: [{ name: "Local", url: "file:///etc/passwd" }],
        args: { url: "file:///etc/passwd" },
      }),
      /unsupported URL/
    );
    assert.equal(fetchCalls, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("llmstxt action truncates large declared-link responses", async () => {
  const llmstxt = await import("../llmstxt.js");
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response("x".repeat(20005), { status: 200 });
  try {
    const value = await llmstxt.actions.llmstxt_fetch_link({
      links: [{ name: "Large", url: "https://example.com/large.md" }],
      args: { url: "https://example.com/large.md" },
    });
    assert.equal(value.body.length, 20000);
    assert.equal(value.truncated, true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("llmstxt full context files can produce a bounded context tool without links", async () => {
  const llmstxt = await import("../llmstxt.js");
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response("# Full Context\n\nThis file contains complete documentation for agents.", {
      status: 200,
      headers: { "content-type": "text/plain" },
    });
  try {
    const data = await llmstxt.extract(llmstxt.detect({ url: "https://example.com/llms-full.txt" }));
    assert.equal(data.product.title, "Full Context");
    assert.equal(data.product.link_count, 0);
    assert.deepEqual(data.tools.map((t) => t.name), ["get_full_context"]);
    assert.match(data.tools[0].result.body, /complete documentation/);
    assert.equal(data.tools[0].result.truncated, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("llmstxt rejects malformed files without declared links", async () => {
  const llmstxt = await import("../llmstxt.js");
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response("# Empty\n\nNo links here.", { status: 200 });
  try {
    await assert.rejects(
      llmstxt.extract({ adapter: "llmstxt", sourceUrl: "https://example.com/llms.txt" }),
      /no declared links/
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
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

// --- coingecko ---
test("coingecko detects all canonical hosts", async () => {
  const cg = await import("../coingecko.js");
  assert.ok(cg.detect({ url: "https://www.coingecko.com/en/coins/bitcoin" }));
  assert.ok(cg.detect({ url: "https://api.coingecko.com/api/v3/simple/price" }));
  assert.ok(cg.detect({ url: "https://pro-api.coingecko.com/api/v3" }));
  assert.ok(cg.detect({ url: "https://docs.coingecko.com/" }));
});

test("coingecko ignores unrelated URLs", async () => {
  const cg = await import("../coingecko.js");
  assert.equal(cg.detect({ url: "https://coinmarketcap.com" }), null);
  assert.equal(cg.detect({ url: "https://example.com" }), null);
});

test("coingecko extract returns hand-curated tool list", async () => {
  const cg = await import("../coingecko.js");
  const data = await cg.extract({ adapter: "coingecko", baseUrl: "x", sourceUrl: "x" });
  assert.equal(data.tools.length, 5);
  assert.ok(data.tools.find((t) => t.name === "get_coin_price"));
  assert.ok(data.tools.find((t) => t.name === "search_coins"));
  assert.equal(typeof cg.actions.coingecko_get, "function");
});

// --- defillama ---
test("defillama detects llama hosts", async () => {
  const dl = await import("../defillama.js");
  assert.ok(dl.detect({ url: "https://defillama.com/" }));
  assert.ok(dl.detect({ url: "https://api.llama.fi/protocols" }));
  assert.ok(dl.detect({ url: "https://coins.llama.fi/prices/current/ethereum:0x..." }));
  assert.ok(dl.detect({ url: "https://yields.llama.fi/pools" }));
  assert.ok(dl.detect({ url: "https://stablecoins.llama.fi/stablecoins" }));
});

test("defillama ignores unrelated", async () => {
  const dl = await import("../defillama.js");
  assert.equal(dl.detect({ url: "https://llama.com" }), null);
  assert.equal(dl.detect({ url: "https://example.com" }), null);
});

test("defillama extract returns curated tools", async () => {
  const dl = await import("../defillama.js");
  const data = await dl.extract({ adapter: "defillama", sourceUrl: "x" });
  assert.equal(data.tools.length, 6);
  assert.ok(data.tools.find((t) => t.name === "list_protocols"));
  assert.ok(data.tools.find((t) => t.name === "get_current_prices"));
  assert.equal(typeof dl.actions.defillama_get, "function");
});

// --- dexscreener ---
test("dexscreener detects canonical hosts", async () => {
  const ds = await import("../dexscreener.js");
  assert.ok(ds.detect({ url: "https://dexscreener.com/ethereum/0x..." }));
  assert.ok(ds.detect({ url: "https://api.dexscreener.com/latest/dex/tokens/0x..." }));
  assert.ok(ds.detect({ url: "https://www.dexscreener.com" }));
});

test("dexscreener extract has token + pair + search tools", async () => {
  const ds = await import("../dexscreener.js");
  const data = await ds.extract({ adapter: "dexscreener", sourceUrl: "x" });
  assert.ok(data.tools.find((t) => t.name === "get_token_pairs"));
  assert.ok(data.tools.find((t) => t.name === "get_pair"));
  assert.ok(data.tools.find((t) => t.name === "search_pairs"));
  assert.equal(typeof ds.actions.dexscreener_get, "function");
});

// --- pyth ---
test("pyth detects pyth.network hosts", async () => {
  const py = await import("../pyth.js");
  assert.ok(py.detect({ url: "https://pyth.network/price-feeds" }));
  assert.ok(py.detect({ url: "https://hermes.pyth.network/v2/price_feeds" }));
  assert.ok(py.detect({ url: "https://docs.pyth.network" }));
});

test("pyth ignores unrelated", async () => {
  const py = await import("../pyth.js");
  assert.equal(py.detect({ url: "https://example.com" }), null);
});

test("pyth extract has hermes + benchmarks + lazer-pro tools", async () => {
  const py = await import("../pyth.js");
  const data = await py.extract({ adapter: "pyth", sourceUrl: "x" });
  // Hermes (free): list_price_feeds, get_latest_price, get_price_at_time, get_publisher_stake_caps
  // Benchmarks (free): list_benchmarks_feeds, get_benchmarks_feed, get_historical_price, get_historical_price_interval, get_price_differences
  // Lazer symbols (free): list_lazer_symbols
  // Lazer Pro (paid): lazer_latest_price, lazer_price_at_timestamp, lazer_reduce_price
  assert.equal(data.tools.length, 13);
  const names = data.tools.map((t) => t.name);
  for (const n of [
    "list_price_feeds", "get_latest_price", "get_price_at_time", "get_publisher_stake_caps",
    "list_benchmarks_feeds", "get_benchmarks_feed", "get_historical_price", "get_historical_price_interval", "get_price_differences",
    "list_lazer_symbols",
    "lazer_latest_price", "lazer_price_at_timestamp", "lazer_reduce_price",
  ]) {
    assert.ok(names.includes(n), `tool ${n} missing`);
  }
  assert.equal(typeof py.actions.pyth_call, "function");
});

test("pyth lazer tools mark paid + require bearer auth", async () => {
  const py = await import("../pyth.js");
  const data = await py.extract({ adapter: "pyth", sourceUrl: "x" });
  const paid = data.tools.filter((t) => t.name.startsWith("lazer_"));
  for (const t of paid) {
    assert.ok(t.description.includes("[PAID"), `${t.name} should flag PAID`);
    assert.equal(t.action.auth, "bearer", `${t.name} should require bearer`);
  }
  // calling a Lazer action without _auth should throw, not silently 401
  await assert.rejects(
    py.actions.pyth_call({ ...paid[0].action, args: { channel: "real_time", formats: ["evm"], properties: ["price"] } }),
    /requires a Pyth Pro Bearer/
  );
});

test("pyth detects app.pyth.network + dourolabs hosts", async () => {
  const py = await import("../pyth.js");
  assert.ok(py.detect({ url: "https://app.pyth.network/explore" }));
  assert.ok(py.detect({ url: "https://benchmarks.pyth.network/v1/price_feeds/" }));
  assert.ok(py.detect({ url: "https://pyth.dourolabs.app/v1/symbols" }));
  assert.ok(py.detect({ url: "https://pyth-lazer.dourolabs.app/v1/latest_price" }));
  assert.ok(py.detect({ url: "https://pyth-lazer-0.dourolabs.app/v1/stream" }));
  assert.ok(py.detect({ url: "https://history.pyth-lazer.dourolabs.app/v1/state" }));
});

// --- chainlink ---
test("chainlink detects chain.link domains", async () => {
  const cl = await import("../chainlink.js");
  assert.ok(cl.detect({ url: "https://chain.link/" }));
  assert.ok(cl.detect({ url: "https://data.chain.link/feeds" }));
  assert.ok(cl.detect({ url: "https://docs.chain.link/data-feeds/price-feeds" }));
  assert.ok(cl.detect({ url: "https://chainlinklabs.com" }));
});

test("chainlink ignores chainlink-adjacent fake domains", async () => {
  const cl = await import("../chainlink.js");
  assert.equal(cl.detect({ url: "https://example.com" }), null);
  assert.equal(cl.detect({ url: "https://chainlink-sucks.com" }), null);
});

test("chainlink extract returns static feed catalog", async () => {
  const cl = await import("../chainlink.js");
  const data = await cl.extract({ adapter: "chainlink", sourceUrl: "x" });
  assert.ok(data.tools.find((t) => t.name === "list_feeds_ethereum"));
  assert.ok(data.tools.find((t) => t.name === "get_feed_address"));
  assert.ok(data.tools.find((t) => t.name === "get_read_call_template"));
  // lookup action resolves a real pair
  const v = await cl.actions.chainlink_lookup({ args: { pair: "BTC/USD" } });
  assert.ok(v && v.address.startsWith("0x"));
  // unknown pair returns null
  const miss = await cl.actions.chainlink_lookup({ args: { pair: "XYZ/USD" } });
  assert.equal(miss, null);
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
