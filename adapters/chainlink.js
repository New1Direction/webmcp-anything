// Chainlink adapter — static catalog of Chainlink price feed addresses on
// Ethereum mainnet, plus a hint at how an agent reads them.
//
// Chainlink price feeds are on-chain contracts, not REST endpoints. Reading
// them requires an Ethereum RPC call to `latestRoundData()` on the aggregator
// address. This adapter exposes the canonical addresses + decimals so an
// agent (with its own RPC tool) knows *which* contract to read for a given pair.
//
// v0 is read-only catalog. v1 will add a `get_latest_price` action that calls a
// public RPC (e.g. cloudflare-eth.com) via eth_call. Skipping for now to keep
// the adapter dependency-free (no ABI encoding helper).
//
// Detection: chain.link / data.chain.link / docs.chain.link / chainlinklabs.com.

export const ID = "chainlink";

const URL_RE = /^https?:\/\/(www\.|data\.|docs\.|blog\.)?chain\.link(\/|$|\?)|^https?:\/\/(www\.|docs\.)?chainlinklabs\.com(\/|$|\?)/i;

const CHROME_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36";

// Canonical Ethereum mainnet price feed addresses.
// Source: https://docs.chain.link/data-feeds/price-feeds/addresses?network=ethereum
// All 17 addresses below were verified 2026-05-27 via eth_call against publicnode.com
// — each contract responds to decimals() with 8 and latestRoundData() returns a
// price update less than 24h old. Verification script: /tmp/verify_chainlink.py.
//
// NOTE: OP/USD is intentionally absent. Chainlink does not publish an OP/USD feed
// on Ethereum mainnet (OP is native to Optimism L2 — feeds live there instead).
// Future versions may expose per-L2 catalogs.
const ETHEREUM_FEEDS = [
  { pair: "BTC/USD", address: "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c", decimals: 8 },
  { pair: "ETH/USD", address: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419", decimals: 8 },
  { pair: "USDC/USD", address: "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6", decimals: 8 },
  { pair: "USDT/USD", address: "0x3E7d1eAB13ad0104d2750B8863b489D65364e32D", decimals: 8 },
  { pair: "DAI/USD", address: "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9", decimals: 8 },
  { pair: "LINK/USD", address: "0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c", decimals: 8 },
  { pair: "SOL/USD", address: "0x4ffC43a60e009B551865A93d232E33Fce9f01507", decimals: 8 },
  { pair: "MATIC/USD", address: "0x7bAC85A8a13A4BcD8abb3eB7d6b4d632c5a57676", decimals: 8 },
  { pair: "AVAX/USD", address: "0xFF3EEb22B5E3dE6e705b44749C2559d704923FD7", decimals: 8 },
  { pair: "BNB/USD", address: "0x14e613AC84a31f709eadbdF89C6CC390fDc9540A", decimals: 8 },
  { pair: "ARB/USD", address: "0x31697852a68433DbCc2Ff612c516d69E3D9bd08F", decimals: 8 },
  { pair: "STETH/USD", address: "0xCfE54B5cD566aB89272946F602D76Ea879CAb4a8", decimals: 8 },
  { pair: "WBTC/BTC", address: "0xfdFD9C85aD200c506Cf9e21F1FD8dd01932FBB23", decimals: 8 },
  { pair: "EUR/USD", address: "0xb49f677943BC038e9857d61E7d053CaA2C1734C1", decimals: 8 },
  { pair: "GBP/USD", address: "0x5c0Ab2d9b5a7ed9f470386e82BB36A3613cDd4b5", decimals: 8 },
  { pair: "JPY/USD", address: "0xBcE206caE7f0ec07b545EddE332A47C2F75bbeb3", decimals: 8 },
  { pair: "XAU/USD", address: "0x214eD9Da11D2fbe465a6fc601a91E62EbEc1a0D6", decimals: 8 },
];

export function detect({ url }) {
  if (!URL_RE.test(url)) return null;
  return { adapter: ID, sourceUrl: url };
}

export async function extract(ctx) {
  return {
    product: {
      title: "Chainlink Price Feeds",
      name: "Chainlink on-chain price feed catalog (Ethereum mainnet)",
      description:
        "Canonical addresses for Chainlink price feed aggregators on Ethereum mainnet. " +
        "Feeds live on-chain — call latestRoundData() via RPC to read. v0 is catalog-only; " +
        "future versions will add a get_latest_price action via public RPC.",
      version: "v0",
    },
    variants: [],
    tools: [
      {
        name: "list_feeds_ethereum",
        description:
          "All cataloged Chainlink price feed aggregators on Ethereum mainnet " +
          "(BTC, ETH, stablecoins, top L1/L2 tokens, FX, gold). " +
          "Returns array of { pair, address, decimals }.",
        result: ETHEREUM_FEEDS,
      },
      {
        name: "get_feed_address",
        description:
          "Look up the Chainlink aggregator address for a specific pair on Ethereum mainnet " +
          "(e.g. 'BTC/USD'). Returns { pair, address, decimals } or null. To read the live " +
          "price, call latestRoundData() on the address via an Ethereum RPC.",
        inputSchema: {
          type: "object",
          required: ["pair"],
          properties: {
            pair: {
              type: "string",
              description: "Pair string, e.g. 'BTC/USD'. Case-insensitive.",
            },
          },
        },
        action: { kind: "chainlink_lookup", network: "ethereum" },
      },
      {
        name: "get_read_call_template",
        description:
          "Returns the JSON-RPC call template an agent should send to read a Chainlink " +
          "price feed: method='eth_call', selector for latestRoundData() = 0xfeaf968c, " +
          "result decoding (roundId uint80, answer int256, startedAt uint256, updatedAt " +
          "uint256, answeredInRound uint80). Combine with the address from get_feed_address " +
          "and any Ethereum RPC URL (e.g. https://cloudflare-eth.com).",
        result: {
          method: "eth_call",
          selector: "0xfeaf968c",
          function: "latestRoundData()",
          returns: [
            { name: "roundId", type: "uint80" },
            { name: "answer", type: "int256", note: "price scaled by feed decimals" },
            { name: "startedAt", type: "uint256" },
            { name: "updatedAt", type: "uint256" },
            { name: "answeredInRound", type: "uint80" },
          ],
          example_payload: {
            jsonrpc: "2.0",
            method: "eth_call",
            params: [{ to: "<feed-address>", data: "0xfeaf968c" }, "latest"],
            id: 1,
          },
          public_rpcs: [
            "https://cloudflare-eth.com",
            "https://ethereum.publicnode.com",
            "https://eth.llamarpc.com",
          ],
        },
      },
    ],
  };
}

export const actions = {
  chainlink_lookup: async ({ args }) => {
    const pair = String(args?.pair || "").toUpperCase();
    if (!pair) throw new Error("chainlink: pair argument required");
    const match = ETHEREUM_FEEDS.find((f) => f.pair === pair);
    return match || null;
  },
};
