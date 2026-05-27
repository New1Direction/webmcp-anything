// DexScreener adapter — turns DexScreener URLs into agent-callable MCP tools
// for on-chain DEX trading pair data (prices, liquidity, volume, txn counts)
// across 50+ EVM chains and Solana.
//
// Detection: dexscreener.com or api.dexscreener.com.
// Free public API, no auth, rate-limited per host (~300 req/min for /tokens).

export const ID = "dexscreener";

const URL_RE = /^https?:\/\/(www\.|api\.)?dexscreener\.com(\/|$|\?)/i;

const PUBLIC_API = "https://api.dexscreener.com";

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
      title: "DexScreener",
      name: "DexScreener on-chain DEX pair data",
      description:
        "Live trading pair data across 50+ chains: price, liquidity, 24h volume, " +
        "transaction counts, market cap. No auth.",
      version: "v1",
    },
    variants: [],
    tools: [
      {
        name: "get_token_pairs",
        description:
          "All trading pairs for a token contract across all DEXes/chains. " +
          "Returns up to 30 pairs sorted by liquidity. Address can be EVM (0x...) or Solana.",
        inputSchema: {
          type: "object",
          required: ["tokenAddress"],
          properties: {
            tokenAddress: {
              type: "string",
              description: "Token contract address (EVM hex or Solana base58).",
            },
          },
        },
        action: {
          kind: "dexscreener_get",
          path: "/latest/dex/tokens/{tokenAddress}",
          pathParams: ["tokenAddress"],
          params: [],
        },
      },
      {
        name: "get_pair",
        description:
          "Detail on one specific trading pair by chain + pair address.",
        inputSchema: {
          type: "object",
          required: ["chainId", "pairAddress"],
          properties: {
            chainId: {
              type: "string",
              description: "Chain ID (e.g. 'ethereum', 'bsc', 'solana', 'arbitrum', 'base').",
            },
            pairAddress: { type: "string", description: "Pair (pool) contract address." },
          },
        },
        action: {
          kind: "dexscreener_get",
          path: "/latest/dex/pairs/{chainId}/{pairAddress}",
          pathParams: ["chainId", "pairAddress"],
          params: [],
        },
      },
      {
        name: "search_pairs",
        description:
          "Free-text search across all tracked pairs. Useful for resolving a ticker " +
          "(e.g. 'PEPE') to specific pair addresses before calling get_pair.",
        inputSchema: {
          type: "object",
          required: ["q"],
          properties: {
            q: { type: "string", description: "Search query (ticker, name, or address)." },
          },
        },
        action: {
          kind: "dexscreener_get",
          path: "/latest/dex/search",
          params: ["q"],
        },
      },
      {
        name: "get_token_profiles_latest",
        description:
          "Latest token profiles submitted to DexScreener (paid promotions + community submits).",
        inputSchema: { type: "object", properties: {} },
        action: {
          kind: "dexscreener_get",
          path: "/token-profiles/latest/v1",
          params: [],
        },
      },
      {
        name: "get_token_boosts_latest",
        description:
          "Latest boosted tokens (paid promotion). Useful as a trending/momentum signal.",
        inputSchema: { type: "object", properties: {} },
        action: {
          kind: "dexscreener_get",
          path: "/token-boosts/latest/v1",
          params: [],
        },
      },
    ],
  };
}

export const actions = {
  dexscreener_get: async ({ path, pathParams = [], params = [], args }) => {
    const a = args || {};
    let resolved = path;
    for (const p of pathParams) {
      if (a[p] == null) throw new Error(`dexscreener: missing path param "${p}"`);
      resolved = resolved.replace(`{${p}}`, encodeURIComponent(String(a[p])));
    }
    const qs = new URLSearchParams();
    for (const p of params) {
      if (a[p] != null) qs.set(p, String(a[p]));
    }
    const url = PUBLIC_API + resolved + (qs.toString() ? `?${qs.toString()}` : "");
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
