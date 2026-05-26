// LLM-fallback adapter — last resort when no structured adapter matches.
//
// Sends the page's already-extracted signals (jsonld blocks, meta tags, title,
// URL) to Claude Haiku with a forced tool_use schema. Caches the result for
// 30 days so the cost per URL amortizes across all future requests.
//
// Why signals-only (not raw HTML)? Three reasons:
//   1. Cheaper — usually fits in ~1-2K input tokens vs 20K+ for stripped HTML.
//   2. Faster — Haiku 4.5 returns in <1s for small inputs.
//   3. More reliable — the LLM doesn't get lost in nav/footer/script soup.
//
// Pages with truly no structured data are rare in 2026; even custom SPAs ship
// OG tags so the social cards work. When we hit one of those, we'll add raw
// text extraction as a v2.

export const ID = "llm";

const MODEL = "claude-haiku-4-5-20251001";
const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";

// Either an API key (sk-ant-…) OR an OAuth bearer token (user:inference scope
// from Claude Max / Anthropic Console). The worker decides which to pass based
// on the calling user's connected providers.
export function detect({ url, title, meta, jsonld, llmKey, oauthToken }) {
  if (!llmKey && !oauthToken) return null;
  if (!url) return null;
  const hasJsonld = Array.isArray(jsonld) && jsonld.length > 0;
  const hasMeta = meta && Object.keys(meta).length > 0;
  if (!title && !hasMeta && !hasJsonld) return null;
  return { adapter: ID, url, title, meta, jsonld, llmKey, oauthToken };
}

// Forced output shape. Anthropic's tool_use API enforces this on the response.
const SCHEMA_TOOL = {
  name: "publish_tools",
  description:
    "Publish the WebMCP/MCP tool schema extracted from a web page. " +
    "If the page is not a product or otherwise has no useful tools, set not_a_product=true.",
  input_schema: {
    type: "object",
    required: ["product", "tools"],
    properties: {
      product: {
        type: "object",
        properties: {
          title: { type: "string", description: "Product or page title" },
          description: { type: "string", description: "Brief description" },
          price: { type: "string", description: "Displayed price, e.g. '$110.00'" },
        },
      },
      tools: {
        type: "array",
        description: "List of agent-callable tools derived from page data.",
        items: {
          type: "object",
          required: ["name", "description"],
          properties: {
            name: {
              type: "string",
              description: "snake_case identifier, e.g. get_price, get_availability",
            },
            description: { type: "string" },
            result: {
              description:
                "Static result value (string, number, or object). All LLM-fallback tools are static — no live actions.",
            },
          },
        },
      },
      not_a_product: {
        type: "boolean",
        description:
          "Set true and return tools: [] if this page isn't a product / has no useful agent tools.",
      },
    },
  },
};

export async function extract(ctx) {
  const signals = {
    url: ctx.url,
    title: ctx.title || undefined,
    meta: ctx.meta && Object.keys(ctx.meta).length ? ctx.meta : undefined,
    jsonld: (ctx.jsonld || [])
      .map((j) => ({
        type: j["@type"],
        name: j.name || j.headline,
        description:
          typeof j.description === "string" ? j.description.slice(0, 300) : undefined,
        offers: j.offers
          ? {
              price: j.offers.price || j.offers.priceSpecification?.price,
              availability: j.offers.availability,
            }
          : undefined,
      }))
      .slice(0, 5),
  };

  const prompt =
    "Given the structured signals from a web page, decide if it's a product " +
    "page or contains product-like data an AI agent might want as tools. If so, " +
    "produce a tool schema via publish_tools.\n\n" +
    "Common tools to emit (static, with `result` from the page):\n" +
    "  - get_title (string)\n" +
    "  - get_price (string, with currency symbol)\n" +
    "  - get_availability ('in_stock' | 'out_of_stock' | 'unknown')\n" +
    "  - get_description (short string)\n" +
    "  - get_url (the canonical URL)\n\n" +
    "If the page is not a product (article, search results, home page, login, etc.), " +
    "set not_a_product=true and return tools: [].\n\n" +
    "Signals:\n" +
    JSON.stringify(signals, null, 2);

  // Build auth headers depending on credential type.
  // API key: x-api-key header (standard Anthropic API auth)
  // OAuth bearer: Authorization header (Max user:inference scope)
  const authHeaders = ctx.oauthToken
    ? { authorization: `Bearer ${ctx.oauthToken}` }
    : { "x-api-key": ctx.llmKey };

  const res = await fetch(ANTHROPIC_API, {
    method: "POST",
    headers: {
      ...authHeaders,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      // cache_control on the tool def makes the tool schema cached across
      // calls — the signals payload changes per URL but the tool stays stable.
      tools: [{ ...SCHEMA_TOOL, cache_control: { type: "ephemeral" } }],
      tool_choice: { type: "tool", name: "publish_tools" },
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`anthropic ${res.status}: ${err.slice(0, 240)}`);
  }
  const data = await res.json();
  const block = data.content?.find(
    (b) => b.type === "tool_use" && b.name === "publish_tools"
  );
  if (!block) throw new Error("llm: no publish_tools call in response");

  const result = block.input || {};
  if (
    result.not_a_product ||
    !Array.isArray(result.tools) ||
    result.tools.length === 0
  ) {
    throw new Error("llm: not a product page");
  }

  const tools = result.tools.map((t) => ({
    name: t.name,
    description: t.description,
    result: t.result,
  }));

  return {
    product: result.product || { title: ctx.title },
    variants: [],
    tools,
  };
}

// No live actions — LLM-fallback only produces static tools.
export const actions = {};
