// CoinGecko adapter — turns CoinGecko URLs (and api.coingecko.com endpoints) into
// agent-callable MCP tools for crypto price + market data.
//
// Detection: any URL on coingecko.com, api.coingecko.com, or pro-api.coingecko.com.
// Extraction: hand-curated tool list (5 most-used endpoints) — not auto-spec-ingested,
// so the agent gets a clean tool surface instead of CoinGecko's full 60+ endpoint API.
// Free public API, no auth required (rate-limited to ~30 req/min). Pro key supported
// via args._auth -> x-cg-pro-api-key header.
//
// Why not delegate to openapi.js? The full spec gives the agent too many low-value
// endpoints. Curating to the 5 things shopper / trading / oracle agents actually
// ask reduces tool noise and first-message token burn.

export const ID = "coingecko";

const URL_RE = /^https?:\/\/(www\.|api\.|pro-api\.|docs\.)?coingecko\.com(\/|$|\?)/i;

const PUBLIC_API = "https://api.coingecko.com/api/v3";

const CHROME_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36";

export function detect({ url }) {
  if (!URL_RE.test(url)) return null;
  return { adapter: ID, baseUrl: PUBLIC_API, sourceUrl: url };
}

export async function extract(ctx) {
  return {
    product: {
      title: "CoinGecko",
      name: "CoinGecko crypto price + market data",
      description:
        "Live prices, market caps, trending coins, and global crypto stats. " +
        "Free public API — rate-limited to ~30 req/min. Pass a Pro key as _auth for higher limits.",
      version: "v3",
    },
    variants: [],
    tools: [
      {
        name: "get_coin_price",
        description:
          "Current price of one or more coins in one or more fiat/crypto currencies. " +
          "Example: ids='bitcoin,ethereum' vs_currencies='usd,eur'.",
        inputSchema: {
          type: "object",
          required: ["ids", "vs_currencies"],
          properties: {
            ids: {
              type: "string",
              description: "Comma-separated CoinGecko coin IDs (e.g. 'bitcoin,ethereum').",
            },
            vs_currencies: {
              type: "string",
              description: "Comma-separated target currencies (e.g. 'usd,eur').",
            },
            include_market_cap: { type: "boolean" },
            include_24hr_vol: { type: "boolean" },
            include_24hr_change: { type: "boolean" },
            include_last_updated_at: { type: "boolean" },
          },
        },
        action: {
          kind: "coingecko_get",
          path: "/simple/price",
          params: ["ids", "vs_currencies", "include_market_cap", "include_24hr_vol", "include_24hr_change", "include_last_updated_at"],
        },
      },
      {
        name: "get_coin_market_data",
        description:
          "Full market data for a single coin by CoinGecko ID: price, market cap, " +
          "supply, ATH, 7d/30d/1y change, links, etc.",
        inputSchema: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", description: "CoinGecko coin ID (e.g. 'bitcoin')." },
            localization: { type: "boolean", default: false },
            tickers: { type: "boolean", default: false },
            market_data: { type: "boolean", default: true },
            community_data: { type: "boolean", default: false },
            developer_data: { type: "boolean", default: false },
          },
        },
        action: {
          kind: "coingecko_get",
          path: "/coins/{id}",
          pathParams: ["id"],
          params: ["localization", "tickers", "market_data", "community_data", "developer_data"],
        },
      },
      {
        name: "get_trending_coins",
        description:
          "Top-7 trending coins on CoinGecko in the last 24 hours by search volume.",
        inputSchema: { type: "object", properties: {} },
        action: { kind: "coingecko_get", path: "/search/trending", params: [] },
      },
      {
        name: "get_global_market_cap",
        description:
          "Total global crypto market cap, 24h volume, BTC/ETH dominance, " +
          "active cryptocurrencies and markets count.",
        inputSchema: { type: "object", properties: {} },
        action: { kind: "coingecko_get", path: "/global", params: [] },
      },
      {
        name: "search_coins",
        description:
          "Search across coins, exchanges, NFTs, and categories by free-text query. " +
          "Use this to resolve a coin name (e.g. 'solana') to its CoinGecko ID before " +
          "calling get_coin_price.",
        inputSchema: {
          type: "object",
          required: ["query"],
          properties: { query: { type: "string", description: "Free-text search query." } },
        },
        action: { kind: "coingecko_get", path: "/search", params: ["query"] },
      },
    ],
  };
}

export const actions = {
  coingecko_get: async ({ path, pathParams = [], params = [], args }) => {
    const a = args || {};
    let resolved = path;
    for (const p of pathParams) {
      if (a[p] == null) throw new Error(`coingecko: missing path param "${p}"`);
      resolved = resolved.replace(`{${p}}`, encodeURIComponent(String(a[p])));
    }
    const qs = new URLSearchParams();
    for (const p of params) {
      if (a[p] != null) qs.set(p, String(a[p]));
    }
    const url = PUBLIC_API + resolved + (qs.toString() ? `?${qs.toString()}` : "");
    const headers = {
      accept: "application/json",
      "user-agent": CHROME_UA,
    };
    if (a._auth) headers["x-cg-pro-api-key"] = String(a._auth);
    const res = await fetch(url, { headers, credentials: "omit" });
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text.slice(0, 2000);
    }
    return { status: res.status, data };
  },
};
