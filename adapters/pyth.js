// Pyth Network adapter — full Pyth oracle surface across 4 host families:
//
//   FREE PUBLIC
//   - hermes.pyth.network        — pull-oracle prices (~400ms), v2 API
//   - benchmarks.pyth.network    — historical OHLCV + TradingView shims
//   - pyth.dourolabs.app         — public symbols catalog (Lazer↔Hermes mapping)
//
//   PAID (Pyth Pro / formerly Lazer — Bearer token required via _auth)
//   - pyth-lazer.dourolabs.app   — low-latency price router (real-time / 50ms / 200ms / 1s)
//
// Pass a Pyth Pro access token as args._auth on Lazer tools (handler sends it as
// `Authorization: Bearer <token>`). Public Hermes + Benchmarks endpoints take
// no auth (note: Pyth Core July 31 2026 upgrade will gate Hermes too — flagged
// in tool descriptions).
//
// Detection: any URL on pyth.network, pyth.dourolabs.app, or pyth-lazer.dourolabs.app.

export const ID = "pyth";

const URL_RE =
  /^https?:\/\/(www\.|hermes\.|docs\.|benchmarks\.|app\.)?pyth\.network(\/|$|\?)|^https?:\/\/(pyth|pyth-lazer(-[0-9])?|history\.pyth-lazer)\.dourolabs\.app(\/|$|\?)/i;

const HERMES = "https://hermes.pyth.network";
const BENCHMARKS = "https://benchmarks.pyth.network";
const LAZER_SYMBOLS_HOST = "https://pyth.dourolabs.app";
const LAZER_ROUTER = "https://pyth-lazer.dourolabs.app";

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
      title: "Pyth Network",
      name: "Pyth Network — pull-oracle prices, historical OHLCV, and Pyth Pro router",
      description:
        "Free Hermes API for live pull-oracle prices (~400ms, 600+ feeds), free " +
        "Benchmarks API for historical OHLCV, and paid Pyth Pro (formerly Lazer) for " +
        "low-latency feeds (50ms/200ms/1s channels). Pyth Pro tools require a Bearer " +
        "access token via _auth — request at pyth.network/pricing.",
      version: "hermes-v2 / benchmarks-v1 / pyth-pro-v1",
    },
    variants: [],
    tools: [
      // ─────────────────────────────────────────────────────────────────────
      // HERMES (free, public, ~400ms latency)
      // ─────────────────────────────────────────────────────────────────────
      {
        name: "list_price_feeds",
        description:
          "All available Hermes price feeds (~600 across crypto, FX, equities, metals). " +
          "Each entry: { id: 64-char hex, attributes: { asset_type, base, display_symbol, " +
          "symbol, quote_currency, schedule, ... } }. Use the `query` filter to narrow by " +
          "substring (matches symbol + asset name). Unfiltered result is ~1.2MB.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description:
                "Substring filter across symbol + asset name. Matches across all asset " +
                "types — filter result by `attributes.asset_type` client-side if needed. " +
                "Note: Hermes does NOT support an asset_type query param — use " +
                "list_benchmarks_feeds for server-side asset_type filtering.",
            },
          },
        },
        action: { kind: "pyth_call", host: HERMES, method: "GET", path: "/v2/price_feeds", params: ["query"] },
      },
      {
        name: "get_latest_price",
        description:
          "Latest price for one or more Hermes feeds. ids is an array of 64-char hex feed " +
          "IDs (no 0x prefix). Returns { binary: { encoding, data: [VAA-hex...] }, parsed: " +
          "[{ id, price: { price, conf, expo, publish_time }, ema_price, metadata: { slot, " +
          "prev_publish_time } }] }. Price is integer scaled by `expo` (expo=-8 → /10^8).",
        inputSchema: {
          type: "object",
          required: ["ids"],
          properties: {
            ids: { type: "array", items: { type: "string" } },
            parsed: { type: "boolean", default: true },
            encoding: { type: "string", description: "hex | base64", default: "hex" },
          },
        },
        action: {
          kind: "pyth_call",
          host: HERMES,
          method: "GET",
          path: "/v2/updates/price/latest",
          arrayParams: ["ids"],
          params: ["parsed", "encoding"],
        },
      },
      {
        name: "get_price_at_time",
        description:
          "Historical price snapshot at a specific Unix timestamp (seconds). Same return " +
          "shape as get_latest_price.",
        inputSchema: {
          type: "object",
          required: ["publish_time", "ids"],
          properties: {
            publish_time: { type: "integer", description: "Unix timestamp (seconds)." },
            ids: { type: "array", items: { type: "string" } },
            parsed: { type: "boolean", default: true },
            encoding: { type: "string", default: "hex" },
          },
        },
        action: {
          kind: "pyth_call",
          host: HERMES,
          method: "GET",
          path: "/v2/updates/price/{publish_time}",
          pathParams: ["publish_time"],
          arrayParams: ["ids"],
          params: ["parsed", "encoding"],
        },
      },
      {
        name: "get_publisher_stake_caps",
        description:
          "Latest publisher stake cap update — the on-chain governance signal for which " +
          "publishers can contribute to each feed.",
        inputSchema: {
          type: "object",
          properties: {
            parsed: { type: "boolean", default: true },
            encoding: { type: "string", default: "hex" },
          },
        },
        action: {
          kind: "pyth_call",
          host: HERMES,
          method: "GET",
          path: "/v2/updates/publisher_stake_caps/latest",
          params: ["parsed", "encoding"],
        },
      },

      // ─────────────────────────────────────────────────────────────────────
      // BENCHMARKS (free, public, historical OHLCV)
      // ─────────────────────────────────────────────────────────────────────
      {
        name: "list_benchmarks_feeds",
        description:
          "Catalog of feeds available in the Benchmarks historical API. Supports both " +
          "`query` substring filter AND server-side `asset_type` filter (crypto, fx, " +
          "equity, metal, rates) — the latter is NOT available on Hermes.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string" },
            asset_type: {
              type: "string",
              description: "crypto | fx | equity | metal | rates",
            },
          },
        },
        action: {
          kind: "pyth_call",
          host: BENCHMARKS,
          method: "GET",
          path: "/v1/price_feeds/",
          params: ["query", "asset_type"],
        },
      },
      {
        name: "get_benchmarks_feed",
        description: "Metadata + recent history for a single Benchmarks feed by ID.",
        inputSchema: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string", description: "64-char hex feed ID." } },
        },
        action: {
          kind: "pyth_call",
          host: BENCHMARKS,
          method: "GET",
          path: "/v1/price_feeds/{id}",
          pathParams: ["id"],
        },
      },
      {
        name: "get_historical_price",
        description:
          "Historical price update at a single Unix timestamp from the Benchmarks API. " +
          "Like Hermes get_price_at_time but goes back further (Hermes retains weeks; " +
          "Benchmarks retains years).",
        inputSchema: {
          type: "object",
          required: ["timestamp", "ids"],
          properties: {
            timestamp: { type: "integer", description: "Unix timestamp (seconds)." },
            ids: {
              type: "string",
              description: "Comma-separated 64-char hex feed IDs.",
            },
            encoding: { type: "string", default: "hex" },
            parsed: { type: "boolean", default: true },
          },
        },
        action: {
          kind: "pyth_call",
          host: BENCHMARKS,
          method: "GET",
          path: "/v1/updates/price/{timestamp}",
          pathParams: ["timestamp"],
          params: ["ids", "encoding", "parsed"],
        },
      },
      {
        name: "get_historical_price_interval",
        description:
          "Historical price updates across an interval — OHLCV-style series. Useful for " +
          "backtesting and charting. `interval` is a duration string (e.g. '1m', '5m', " +
          "'1h', '1d'). `unique=true` returns one update per interval boundary.",
        inputSchema: {
          type: "object",
          required: ["timestamp", "interval", "ids"],
          properties: {
            timestamp: { type: "integer" },
            interval: { type: "string", description: "e.g. '1m', '5m', '1h', '1d'" },
            ids: { type: "string", description: "Comma-separated feed IDs." },
            encoding: { type: "string", default: "hex" },
            parsed: { type: "boolean", default: true },
            unique: { type: "boolean", default: false },
          },
        },
        action: {
          kind: "pyth_call",
          host: BENCHMARKS,
          method: "GET",
          path: "/v1/updates/price/{timestamp}/{interval}",
          pathParams: ["timestamp", "interval"],
          params: ["ids", "encoding", "parsed", "unique"],
        },
      },
      {
        name: "get_price_differences",
        description:
          "Cross-source price differences for a feed (helps detect oracle divergence " +
          "vs benchmark venues).",
        inputSchema: { type: "object", properties: {} },
        action: {
          kind: "pyth_call",
          host: BENCHMARKS,
          method: "GET",
          path: "/v1/price_differences/",
        },
      },

      // ─────────────────────────────────────────────────────────────────────
      // PYTH PRO / LAZER SYMBOLS (free, public — maps Lazer IDs ↔ Hermes IDs)
      // ─────────────────────────────────────────────────────────────────────
      {
        name: "list_lazer_symbols",
        description:
          "Public Pyth Pro / Lazer symbols catalog at pyth.dourolabs.app. Each entry " +
          "links pyth_lazer_id (integer) ↔ Hermes hermes_id (hex) ↔ symbol with market " +
          "schedule, exponent, min publishers, instrument type. Response ~3.7MB.",
        inputSchema: { type: "object", properties: {} },
        action: {
          kind: "pyth_call",
          host: LAZER_SYMBOLS_HOST,
          method: "GET",
          path: "/v1/symbols",
        },
      },

      // ─────────────────────────────────────────────────────────────────────
      // PYTH PRO ROUTER (PAID — requires Bearer access token via args._auth)
      // ─────────────────────────────────────────────────────────────────────
      {
        name: "lazer_latest_price",
        description:
          "[PAID — Pyth Pro] Fetch the latest price from the Pyth Pro router. Channels: " +
          "real_time | fixed_rate@50ms | fixed_rate@200ms | fixed_rate@1000ms. " +
          "Properties pick which fields to return (price, bestBidPrice, bestAskPrice, " +
          "confidence, exponent, emaPrice, marketSession, etc.). Pass access token as " +
          "args._auth (sent as `Authorization: Bearer <token>`). Get a token at " +
          "pyth.network/pricing.",
        inputSchema: {
          type: "object",
          required: ["channel", "formats", "properties"],
          properties: {
            channel: {
              type: "string",
              enum: ["real_time", "fixed_rate@50ms", "fixed_rate@200ms", "fixed_rate@1000ms"],
            },
            formats: {
              type: "array",
              items: { type: "string", enum: ["evm", "solana", "leEcdsa", "leUnsigned"] },
              description: "Payload format(s) for on-chain submission.",
            },
            properties: {
              type: "array",
              items: {
                type: "string",
                enum: [
                  "price", "bestBidPrice", "bestAskPrice", "publisherCount", "exponent",
                  "confidence", "fundingRate", "fundingTimestamp", "fundingRateInterval",
                  "marketSession", "emaPrice", "emaConfidence", "feedUpdateTimestamp",
                ],
              },
            },
            priceFeedIds: { type: "array", items: { type: "integer" } },
            symbols: { type: "array", items: { type: "string" } },
            jsonBinaryEncoding: { type: "string", enum: ["base64", "hex"] },
            parsed: { type: "boolean" },
            _auth: { type: "string", description: "Pyth Pro Bearer access token." },
          },
        },
        action: {
          kind: "pyth_call",
          host: LAZER_ROUTER,
          method: "POST",
          path: "/v1/latest_price",
          auth: "bearer",
          bodyKeys: ["channel", "formats", "properties", "priceFeedIds", "symbols", "jsonBinaryEncoding", "parsed"],
        },
      },
      {
        name: "lazer_price_at_timestamp",
        description:
          "[PAID — Pyth Pro] Fetch price at a specific timestamp from the Pyth Pro " +
          "router. Same channel/format/property options as lazer_latest_price, plus " +
          "required `timestamp` (Unix microseconds).",
        inputSchema: {
          type: "object",
          required: ["timestamp", "channel", "formats", "properties"],
          properties: {
            timestamp: {
              type: "integer",
              description: "Unix timestamp (microseconds, NOT seconds).",
            },
            channel: {
              type: "string",
              enum: ["real_time", "fixed_rate@50ms", "fixed_rate@200ms", "fixed_rate@1000ms"],
            },
            formats: { type: "array", items: { type: "string", enum: ["evm", "solana", "leEcdsa", "leUnsigned"] } },
            properties: { type: "array", items: { type: "string" } },
            priceFeedIds: { type: "array", items: { type: "integer" } },
            symbols: { type: "array", items: { type: "string" } },
            jsonBinaryEncoding: { type: "string", enum: ["base64", "hex"] },
            parsed: { type: "boolean" },
            _auth: { type: "string", description: "Pyth Pro Bearer access token." },
          },
        },
        action: {
          kind: "pyth_call",
          host: LAZER_ROUTER,
          method: "POST",
          path: "/v1/price",
          auth: "bearer",
          bodyKeys: ["timestamp", "channel", "formats", "properties", "priceFeedIds", "symbols", "jsonBinaryEncoding", "parsed"],
        },
      },
      {
        name: "lazer_reduce_price",
        description:
          "[PAID — Pyth Pro] Reduce on-chain payload size — strip non-requested feeds " +
          "from a previously fetched WebSocket or REST update. Useful when an agent " +
          "wants to submit only one feed's update on-chain to minimize gas.",
        inputSchema: {
          type: "object",
          required: ["payload", "priceFeedIds"],
          properties: {
            payload: {
              type: "object",
              description: "JsonUpdate previously received from WebSocket or REST endpoints.",
            },
            priceFeedIds: {
              type: "array",
              items: { type: "integer" },
              description: "Feed IDs to preserve in the reduced output.",
            },
            _auth: { type: "string", description: "Pyth Pro Bearer access token." },
          },
        },
        action: {
          kind: "pyth_call",
          host: LAZER_ROUTER,
          method: "POST",
          path: "/v1/reduce_price",
          auth: "bearer",
          bodyKeys: ["payload", "priceFeedIds"],
        },
      },
    ],
  };
}

export const actions = {
  // Unified caller: GET (path/array/query params) or POST (JSON body). Supports
  // Bearer auth via args._auth when action.auth === "bearer".
  pyth_call: async ({
    host,
    method = "GET",
    path,
    pathParams = [],
    arrayParams = [],
    params = [],
    bodyKeys = [],
    auth,
    args,
  }) => {
    const a = args || {};
    let resolved = path;
    for (const p of pathParams) {
      if (a[p] == null) throw new Error(`pyth: missing path param "${p}"`);
      resolved = resolved.replace(`{${p}}`, encodeURIComponent(String(a[p])));
    }

    const headers = {
      accept: "application/json",
      "user-agent": CHROME_UA,
    };
    if (auth === "bearer") {
      if (!a._auth) {
        throw new Error(
          "pyth: this endpoint requires a Pyth Pro Bearer access token via args._auth. " +
          "Get one at pyth.network/pricing."
        );
      }
      headers.authorization = `Bearer ${a._auth}`;
    }

    let url = host + resolved;
    const fetchOpts = { method, headers, credentials: "omit" };

    if (method === "GET") {
      const qs = new URLSearchParams();
      for (const p of arrayParams) {
        const v = a[p];
        if (Array.isArray(v)) {
          for (const item of v) qs.append(`${p}[]`, String(item));
        } else if (v != null) {
          qs.append(`${p}[]`, String(v));
        }
      }
      for (const p of params) {
        if (a[p] != null) qs.set(p, String(a[p]));
      }
      const s = qs.toString();
      if (s) url += `?${s}`;
    } else {
      const body = {};
      for (const k of bodyKeys) {
        if (a[k] !== undefined) body[k] = a[k];
      }
      headers["content-type"] = "application/json";
      fetchOpts.body = JSON.stringify(body);
    }

    const res = await fetch(url, fetchOpts);
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
