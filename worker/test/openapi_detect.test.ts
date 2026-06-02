// test/openapi_detect.test.ts — the OpenAPI read tier must catch real-world
// spec URLs, not just textbook /openapi.json naming. Regression guard for the
// dev-lane expansion: before this, Stripe/Twilio/DigitalOcean specs fell through
// to a 404 purely because of how their URLs are named.
import { describe, it, expect } from "vitest";
// Engine imports this same module at ../../adapters/openapi.js.
import * as openapi from "../../adapters/openapi.js";

describe("openapi detect() — real-world spec URLs", () => {
  it("catches specs that don't use /openapi.json naming", () => {
    const specUrls = [
      "https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.json",
      "https://raw.githubusercontent.com/twilio/twilio-oai/main/spec/json/twilio_messaging_v1.json",
      "https://raw.githubusercontent.com/digitalocean/openapi/main/specification/DigitalOcean-public.v2.yaml",
      "https://petstore3.swagger.io/api/v3/openapi.json",
      "https://petstore.swagger.io/v2/swagger.json",
      "https://example.com/v1/api-docs",
    ];
    for (const u of specUrls) {
      expect(openapi.detect({ url: u }), u).toBeTruthy();
    }
  });

  it("ignores unrelated URLs so the cascade isn't wasted", () => {
    const nonSpec = [
      "https://www.allbirds.com/products/mens-wool-runners",
      "https://example.com/data.json",
      "https://example.com/blog/openai-launch", // 'openai' != 'openapi'
      "https://shop.example.com/products.json",
    ];
    for (const u of nonSpec) {
      expect(openapi.detect({ url: u }), u).toBeNull();
    }
  });
});
