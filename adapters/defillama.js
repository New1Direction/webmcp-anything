// DefiLlama adapter — turns DefiLlama URLs (api.llama.fi / coins.llama.fi /
// yields.llama.fi / defillama.com) into agent-callable MCP tools for DeFi data:
// TVL, protocols, current prices, yields.
//
// Three public hosts each with their own base URL:
//   api.llama.fi      — protocols, TVL, chains
//   coins.llama.fi    — current + historical prices for ~10k tokens
//   yields.llama.fi   — DeFi pool APY snapshots
//
// All free, no auth, no rate limit advertised (be reasonable).

export const ID = "defillama";

// Match either defillama.com (with optional www/docs) or any of the canonical
// llama.fi service subdomains. llama.com / llama.fi alone are NOT DefiLlama.
const URL_RE = /^https?:\/\/(?:(?:www|docs)\.)?defillama\.com(?:\/|$|\?)|^https?:\/\/(?:api|coins|yields|stablecoins|docs)\.llama\.fi(?:\/|$|\?)/i;

const CHROME_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36";

export function detect({ url }) {
  if (!URL_RE.test(url)) return null;
  return { adapter: ID, sourceUrl: url };
}

export async function extract(ctx) {
  return {
    product: {
      title: "DefiLlama",
      name: "DefiLlama TVL + DeFi data",
      description:
        "Total value locked across protocols/chains, current token prices, " +
        "and DeFi pool yields. Three public hosts: api.llama.fi (TVL), " +
        "coins.llama.fi (prices), yields.llama.fi (APY).",
      version: "v1",
    },
    variants: [],
    tools: [
      {
        name: "list_protocols",
        description:
          "List all DeFi protocols with TVL, chain breakdown, category, and 24h/7d/30d change.",
        inputSchema: { type: "object", properties: {} },
        action: { kind: "defillama_get", host: "api.llama.fi", path: "/protocols", params: [] },
      },
      {
        name: "get_protocol",
        description:
          "Full TVL history + chain breakdown for one protocol. Use the slug returned " +
          "by list_protocols (e.g. 'aave', 'lido', 'uniswap').",
        inputSchema: {
          type: "object",
          required: ["protocol"],
          properties: {
            protocol: { type: "string", description: "Protocol slug (lowercase)." },
          },
        },
        action: {
          kind: "defillama_get",
          host: "api.llama.fi",
          path: "/protocol/{protocol}",
          pathParams: ["protocol"],
          params: [],
        },
      },
      {
        name: "get_current_prices",
        description:
          "Current USD price for one or more tokens. Coins are specified as " +
          "'{chain}:{address}' (e.g. 'ethereum:0xdac17f958d2ee523a2206206994597c13d831ec7' for USDT) " +
          "or 'coingecko:{id}' (e.g. 'coingecko:bitcoin').",
        inputSchema: {
          type: "object",
          required: ["coins"],
          properties: {
            coins: {
              type: "string",
              description: "Comma-separated coin keys (e.g. 'ethereum:0x...,coingecko:bitcoin').",
            },
            searchWidth: { type: "string", default: "6h" },
          },
        },
        action: {
          kind: "defillama_get",
          host: "coins.llama.fi",
          path: "/prices/current/{coins}",
          pathParams: ["coins"],
          params: ["searchWidth"],
        },
      },
      {
        name: "list_yield_pools",
        description:
          "Snapshot of all tracked DeFi yield pools with APY, TVL, project, chain. " +
          "Returns ~10k pools — filter the response client-side or use list_protocols first.",
        inputSchema: { type: "object", properties: {} },
        action: { kind: "defillama_get", host: "yields.llama.fi", path: "/pools", params: [] },
      },
      {
        name: "get_chain_tvl",
        description:
          "Historical TVL series for a chain (e.g. 'Ethereum', 'Arbitrum', 'Solana').",
        inputSchema: {
          type: "object",
          required: ["chain"],
          properties: {
            chain: {
              type: "string",
              description: "Chain name in DefiLlama capitalization (e.g. 'Ethereum').",
            },
          },
        },
        action: {
          kind: "defillama_get",
          host: "api.llama.fi",
          path: "/v2/historicalChainTvl/{chain}",
          pathParams: ["chain"],
          params: [],
        },
      },
      {
        name: "list_stablecoins",
        description:
          "All tracked stablecoins with market cap, peg type, chain breakdown.",
        inputSchema: {
          type: "object",
          properties: {
            includePrices: { type: "boolean", default: true },
          },
        },
        action: {
          kind: "defillama_get",
          host: "stablecoins.llama.fi",
          path: "/stablecoins",
          params: ["includePrices"],
        },
      },
    ],
  };
}

export const actions = {
  defillama_get: async ({ host, path, pathParams = [], params = [], args }) => {
    const a = args || {};
    let resolved = path;
    for (const p of pathParams) {
      if (a[p] == null) throw new Error(`defillama: missing path param "${p}"`);
      resolved = resolved.replace(`{${p}}`, encodeURIComponent(String(a[p])));
    }
    const qs = new URLSearchParams();
    for (const p of params) {
      if (a[p] != null) qs.set(p, String(a[p]));
    }
    const url = `https://${host}${resolved}${qs.toString() ? `?${qs.toString()}` : ""}`;
    const res = await fetch(url, {
      headers: { accept: "application/json", "user-agent": CHROME_UA },
      credentials: "omit",
    });
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
