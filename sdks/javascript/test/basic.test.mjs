// Quick smoke tests — no network.
// Run from sdks/javascript/: node --experimental-strip-types --test test/basic.test.mjs
// (or after `npm run typecheck`)

import { test } from "node:test";
import assert from "node:assert/strict";

// Use the .ts source directly — tests run via tsx or node 22+ with --experimental-strip-types
const { WmcpClient, WmcpError } = await import("../src/index.ts");
const { toAnthropicTools } = await import("../src/anthropic.ts");
const { toOpenAITools } = await import("../src/openai.ts");

test("client init trims trailing slash", () => {
  const c = new WmcpClient({ apiKey: "k", baseUrl: "https://wmcp.sh/" });
  // @ts-ignore — read internal for the test
  assert.equal(c["baseUrl"], "https://wmcp.sh");
});

test("anthropic conversion", () => {
  const out = toAnthropicTools([
    {
      name: "get_price",
      description: "Current price.",
      inputSchema: { type: "object", properties: {} },
    },
  ]);
  assert.equal(out.length, 1);
  assert.equal(out[0].name, "get_price");
  assert.equal(out[0].input_schema.type, "object");
});

test("openai conversion", () => {
  const out = toOpenAITools([
    {
      name: "get_price",
      description: "Current price.",
      inputSchema: { type: "object", properties: {} },
    },
  ]);
  assert.equal(out.length, 1);
  assert.equal(out[0].type, "function");
  assert.equal(out[0].function.name, "get_price");
});

test("WmcpError construction", () => {
  const e = new WmcpError(429, { error: "quota_exceeded" });
  assert.equal(e.status, 429);
  assert.equal(e.body.error, "quota_exceeded");
  assert.ok(e.message.includes("429"));
});
