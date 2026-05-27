// integration_price_data.ts — /price-data SEO landing page.
//
// Category page (not single-provider): groups all 5 oracle / price-data adapters
// (CoinGecko, DefiLlama, DexScreener, Pyth, Chainlink) under one MCP roof.
//
// SERP target query family: "crypto price mcp", "chainlink mcp", "pyth mcp",
// "coingecko mcp", "claude crypto price agent", "ai trading agent price feed",
// "mcp oracle". Owner-side competitors (Composio etc.) don't ship oracle/price-feed
// connectors at all — this is a near-greenfield SERP for 2026.

export function integrationPriceDataHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Price-data & Oracle MCP — CoinGecko, DefiLlama, DexScreener, Pyth, Chainlink | wmcp.sh</title>
<meta name="description" content="Live crypto prices + DeFi TVL + DEX pair data + Pyth pull-oracle + Chainlink feed registry, all exposed as MCP tools for Claude or any agent. Drop a URL, get the tools. No auth for free tiers." />
<link rel="canonical" href="${origin}/price-data" />
<meta property="og:title" content="Crypto Price-data & Oracle MCP — wmcp.sh" />
<meta property="og:description" content="5 hosted MCP adapters: CoinGecko + DefiLlama + DexScreener + Pyth + Chainlink. Free for public tiers." />
<meta property="og:url" content="${origin}/price-data" />
<meta property="og:image" content="${origin}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Crypto Price-data & Oracle MCP" />
<meta name="twitter:description" content="CoinGecko + DefiLlama + DexScreener + Pyth + Chainlink as MCP tools." />
<meta name="twitter:image" content="${origin}/og.png" />
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Price-data & Oracle MCP — wmcp.sh",
  "description": "5 hosted MCP adapters for crypto price + oracle data: CoinGecko, DefiLlama, DexScreener, Pyth, Chainlink.",
  "author": { "@type": "Organization", "name": "WebMCP Anything" },
  "publisher": { "@type": "Organization", "name": "WebMCP Anything", "url": "https://wmcp.sh" },
  "datePublished": "2026-05-27",
  "dateModified": "2026-05-27",
  "mainEntityOfPage": "${origin}/price-data"
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Which price-data and oracle sources does wmcp.sh expose as MCP?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Five today: CoinGecko (live crypto prices), DefiLlama (TVL, current prices, yields), DexScreener (DEX pair data across 50+ chains), Pyth Network (pull-oracle prices via free Hermes API, historical OHLCV via Benchmarks, plus paid Pyth Pro / Lazer at 50ms / 200ms / 1s channels), Chainlink (17 verified Ethereum mainnet price feed addresses with eth_call template). All free public endpoints work without auth; Pyth Pro and CoinGecko Pro accept your API key via the _auth pseudo-arg."
      }
    },
    {
      "@type": "Question",
      "name": "How is this different from Composio or Pipedream?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Composio and Pipedream don't expose oracle / price-feed providers — they focus on owner-side SaaS (CRM, email, calendar). wmcp.sh is shopper-side / data-side. If your agent needs live BTC price, DEX pair liquidity, or a Chainlink feed read, those connectors don't exist there. They exist here, today, free, no signup."
      }
    },
    {
      "@type": "Question",
      "name": "Does Chainlink work over HTTP, or do I still need an RPC?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Chainlink feeds are on-chain contracts, not REST endpoints. The wmcp.sh Chainlink adapter ships a verified catalog (17 mainnet pairs, all eth_call'd 2026-05-27 to confirm they're live and return current prices) + the exact eth_call template (selector 0xfeaf968c, return decoding). Your agent combines the address from get_feed_address with any public RPC (cloudflare-eth.com, ethereum-rpc.publicnode.com) to read the live price."
      }
    },
    {
      "@type": "Question",
      "name": "Pyth has both free (Hermes) and paid (Pyth Pro / Lazer) endpoints — how is that exposed?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Both. Hermes tools (list_price_feeds, get_latest_price, get_price_at_time, publisher_stake_caps) and Benchmarks tools (historical OHLCV at arbitrary intervals) are free, no auth. Pyth Pro tools (lazer_latest_price, lazer_price_at_timestamp, lazer_reduce_price) marked [PAID] in their tool descriptions; pass your Pyth Pro access token as args._auth (sent as Authorization: Bearer). Get a token at pyth.network/pricing."
      }
    },
    {
      "@type": "Question",
      "name": "Free CoinGecko rate limits — what happens at 30 req/min?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "wmcp.sh caches CoinGecko responses for 60 seconds, so most agent queries hit cache. If you need higher throughput, get a CoinGecko Pro key and pass it as args._auth — the adapter sends it as x-cg-pro-api-key. Same pattern for any rate-limited source."
      }
    },
    {
      "@type": "Question",
      "name": "What about historical chart data?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Two paths. Short-window: Hermes get_price_at_time covers a few weeks. Long-window OHLCV: Pyth Benchmarks get_historical_price_interval (timestamp + interval string like '1m','5m','1h','1d') goes back years. Both are free."
      }
    }
  ]
}
</script>
<style>
  :root { --bg:#07070d;--card:#16161f;--bg2:#11111c;--border:#26263a;--text:#ececf5;--muted:#8a8aa8;--dim:#6a6a88;--accent:#7c5cff;--accent2:#00e5ff;--green:#4ade80;--red:#f87171;--pink:#f0abfc;--gold:#fbbf24; }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin:0;min-height:100vh;color:var(--text);background:var(--bg);font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif;line-height:1.6;background-image:radial-gradient(ellipse 900px 600px at 10% -5%,rgba(124,92,255,.18),transparent 60%),radial-gradient(ellipse 700px 500px at 95% 10%,rgba(0,229,255,.10),transparent 60%); }
  .wrap { max-width: 980px; margin: 0 auto; padding: 0 24px; }
  nav { display:flex;justify-content:space-between;align-items:center;padding:22px 24px;max-width:1080px;margin:0 auto; }
  nav .brand { font-weight: 800; letter-spacing: -.02em; font-size: 1.05rem; }
  nav .brand span { color: var(--accent2); }
  nav .links { display: flex; gap: 22px; font-size: .9rem; }
  nav .links a { color: var(--muted); text-decoration: none; }
  nav .links a:hover { color: var(--text); }
  nav .cta { background: var(--bg2); border: 1px solid var(--border); padding: 7px 14px; border-radius: 8px; font-size: .85rem; color: var(--text); text-decoration: none; font-weight: 600; }
  header.hero { padding: 50px 0 30px; }
  .badge { display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;font-size:.7rem;letter-spacing:.15em;text-transform:uppercase;font-weight:700;background:linear-gradient(90deg,rgba(124,92,255,.18),rgba(0,229,255,.18));border:1px solid rgba(124,92,255,.35);margin-bottom:18px; }
  .dot { width:6px;height:6px;background:var(--accent2);border-radius:50%;box-shadow:0 0 8px var(--accent2); }
  h1 { font-size:clamp(2rem,4.5vw,3rem);margin:0 0 18px;background:linear-gradient(135deg,#fff 30%,var(--accent2) 100%);-webkit-background-clip:text;background-clip:text;color:transparent;line-height:1.05;font-weight:800;letter-spacing:-.02em; }
  .sub { color: var(--muted); font-size: 1.05rem; max-width: 720px; margin: 0 0 24px; }
  .hint { color: var(--dim); font-size: .85rem; margin-top: 8px; }
  section { padding: 36px 0; }
  .section-label { display:inline-block;font-size:.72rem;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--accent2);margin-bottom:10px; }
  h2 { font-size:clamp(1.4rem,3vw,1.9rem);margin:0 0 12px;font-weight:700;letter-spacing:-.02em; }
  .section-sub { color: var(--muted); max-width: 700px; margin: 0 0 24px; }
  pre { background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px 18px;overflow-x:auto;font-size:.82rem;color:var(--green);font-family:"SF Mono",Menlo,monospace;line-height:1.5;margin:14px 0; }
  pre .k { color: var(--accent2); } pre .s { color: var(--pink); } pre .c { color: var(--dim); }
  code { font-family: "SF Mono", Menlo, monospace; background: var(--bg2); padding: 1px 6px; border-radius: 4px; font-size: .85em; }
  .src-grid { display: grid; gap: 18px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); margin-top: 20px; }
  .src-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 22px; position: relative; }
  .src-card.paid { border-color: rgba(251,191,36,.4); }
  .src-card h3 { margin: 0 0 4px; font-size: 1.05rem; color: var(--text); }
  .src-card .tier { display:inline-block;font-size:.65rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:3px 8px;border-radius:6px;margin-bottom:10px; }
  .tier.free { background: rgba(74,222,128,.15); color: var(--green); }
  .tier.mixed { background: rgba(124,92,255,.15); color: var(--accent); }
  .tier.catalog { background: rgba(240,171,252,.15); color: var(--pink); }
  .src-card .desc { color: var(--muted); font-size: .88rem; margin: 0 0 12px; }
  .src-card .tools { color: var(--dim); font-size: .78rem; margin: 0; font-family: "SF Mono", Menlo, monospace; }
  .src-card .url { color: var(--accent2); font-size: .78rem; word-break: break-all; margin-top: 12px; font-family: "SF Mono", Menlo, monospace; }
  table { width: 100%; border-collapse: collapse; text-align: left; font-size: .9rem; margin-top: 16px; }
  th, td { padding: 14px 16px; border-bottom: 1px solid var(--border); vertical-align: top; }
  th { background: var(--bg2); font-weight: 700; color: var(--accent2); }
  tr:last-child td { border-bottom: none; }
  td strong { color: var(--text); }
  details { background:var(--card);border:1px solid var(--border);border-radius:12px;padding:18px 20px;margin-bottom:12px; }
  details summary { font-weight: 700; font-size: 1rem; color: var(--text); cursor: pointer; list-style: none; }
  details[open] summary { margin-bottom: 12px; }
  details .answer { color: var(--muted); font-size: .92rem; line-height: 1.65; }
  .verify { background: linear-gradient(135deg, rgba(74,222,128,.06), rgba(0,229,255,.04)); border: 1px solid rgba(74,222,128,.25); border-radius: 14px; padding: 22px; margin-top: 18px; }
  .verify h3 { margin: 0 0 8px; color: var(--green); font-size: 1rem; }
  .verify .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed var(--border); font-size: .88rem; font-family: "SF Mono", Menlo, monospace; }
  .verify .row:last-child { border-bottom: none; }
  .verify .row .ok { color: var(--green); }
  footer { border-top:1px solid var(--border);margin-top:40px;padding:30px 0;text-align:center;color:var(--muted);font-size:.85rem; }
  footer a { color: var(--accent2); text-decoration: none; margin: 0 8px; }
</style>
</head>
<body>

<nav>
  <div class="brand"><a href="/" style="color:inherit;text-decoration:none">wmcp<span>.sh</span></a></div>
  <div class="links">
    <a href="/agent-ready">Agent-ready</a>
    <a href="/managed">Done for you</a>
    <a href="/integration/openapi">OpenAPI</a>
    <a href="/price-data">Price data</a>
    <a href="/directory">Directory</a>
  </div>
  <a class="cta" href="/dashboard">Dashboard →</a>
</nav>

<div class="wrap">

<header class="hero">
  <div class="badge"><span class="dot"></span> category · price-data &amp; oracles</div>
  <h1>Live price-data &amp; on-chain oracles, MCP-ready.</h1>
  <p class="sub">Five hosted adapters covering the price-data stack agents actually need: CoinGecko spot prices, DefiLlama TVL + yields, DexScreener DEX pair liquidity, Pyth pull-oracle (free Hermes + paid Pyth Pro at 50ms / 200ms / 1s), and a verified Chainlink mainnet feed registry. Drop the URL, get the MCP tools. Free for every public tier.</p>
  <p class="hint">All endpoints verified live 2026-05-27 · Chainlink addresses confirmed via on-chain eth_call · Pyth Pro endpoints reverse-engineered from openapi.json</p>
</header>

<!-- ========== SOURCES ========== -->
<section id="sources">
  <div class="section-label">The five adapters</div>
  <h2>One category, five sources, twenty-eight tools.</h2>
  <p class="section-sub">Each box is one wmcp.sh adapter. Drop the canonical URL into <code>/api/v1/tools?url=…</code> and you get every tool listed — typed input schemas, agent-ready, no SDK.</p>

  <div class="src-grid">

    <div class="src-card">
      <span class="tier free">Free · no auth</span>
      <h3>CoinGecko</h3>
      <p class="desc">Live crypto prices, market caps, trending coins, global cap, free-text search. ~30 req/min on free tier; pass Pro key via <code>_auth</code> for higher.</p>
      <p class="tools">get_coin_price · get_coin_market_data · get_trending_coins · get_global_market_cap · search_coins</p>
      <p class="url">${origin}/api/v1/tools?url=https://api.coingecko.com/api/v3</p>
    </div>

    <div class="src-card">
      <span class="tier free">Free · no auth</span>
      <h3>DefiLlama</h3>
      <p class="desc">DeFi TVL across 7,500+ protocols, current prices for ~10k tokens, yield-pool APYs, historical chain TVL series, stablecoin breakdown by peg type.</p>
      <p class="tools">list_protocols · get_protocol · get_current_prices · list_yield_pools · get_chain_tvl · list_stablecoins</p>
      <p class="url">${origin}/api/v1/tools?url=https://api.llama.fi/</p>
    </div>

    <div class="src-card">
      <span class="tier free">Free · no auth</span>
      <h3>DexScreener</h3>
      <p class="desc">Real-time DEX pair data across 50+ chains: price, liquidity, 24h volume, transaction counts. Token-address lookup, pair detail, free-text search, trending boosts.</p>
      <p class="tools">get_token_pairs · get_pair · search_pairs · get_token_profiles_latest · get_token_boosts_latest</p>
      <p class="url">${origin}/api/v1/tools?url=https://api.dexscreener.com/</p>
    </div>

    <div class="src-card paid">
      <span class="tier mixed">OAuth proxy · BYO sub</span>
      <h3>DefiLlama MCP <span style="font-size:.7em;color:var(--dim)">(via wmcp.sh)</span></h3>
      <p class="desc">DefiLlama's official 23-tool MCP server (TVL, fees, yields, stablecoins, bridges, ETFs, hacks, raises, institutional holdings, token unlocks, oracle coverage, income statements). wmcp.sh handles the OAuth + token refresh so agents like Claude.ai / Cursor / Codex (which can't drive arbitrary OAuth flows) can connect with just a bearer token. Bring your own DefiLlama subscription.</p>
      <p class="tools">get_market_totals · get_protocol_metrics · get_chain_metrics · get_token_prices · get_yield_pools · get_stablecoin_supply · get_etf_flows · get_bridge_flows · get_events · get_dat_holdings · get_token_unlocks · get_oracle_metrics · resolve_entity · ...+10 more</p>
      <p class="url">Connect at <a href="/dashboard" style="color:var(--accent2);text-decoration:none">/dashboard</a>, then point your agent at:<br />${origin}/mcp/defillama</p>
    </div>

    <div class="src-card paid">
      <span class="tier mixed">Free + paid</span>
      <h3>Pyth Network</h3>
      <p class="desc">13 tools across the full Pyth surface. Hermes (free, ~400ms): list + latest + historical + publisher stakes. Benchmarks (free, historical OHLCV with intervals). Pyth Pro / Lazer (paid, Bearer token via <code>_auth</code>): 50ms / 200ms / 1s channels, payload-reduce.</p>
      <p class="tools">list_price_feeds · get_latest_price · get_price_at_time · get_publisher_stake_caps · list_benchmarks_feeds · get_benchmarks_feed · get_historical_price · get_historical_price_interval · get_price_differences · list_lazer_symbols · lazer_latest_price · lazer_price_at_timestamp · lazer_reduce_price</p>
      <p class="url">${origin}/api/v1/tools?url=https://hermes.pyth.network/</p>
    </div>

    <div class="src-card">
      <span class="tier catalog">Catalog · static</span>
      <h3>Chainlink</h3>
      <p class="desc">17 verified Ethereum mainnet price feed aggregator addresses (BTC, ETH, stablecoins, top L1/L2 tokens, FX, gold). All addresses eth_call'd 2026-05-27 — confirmed live, decimals match, recent updatedAt. Plus the canonical eth_call template so your agent reads live prices through any RPC.</p>
      <p class="tools">list_feeds_ethereum · get_feed_address · get_read_call_template</p>
      <p class="url">${origin}/api/v1/tools?url=https://data.chain.link/</p>
    </div>

  </div>
</section>

<!-- ========== VERIFICATION ========== -->
<section id="verify">
  <div class="section-label">Why you can trust these adapters</div>
  <h2>Endpoints reverse-engineered + verified, not guessed.</h2>
  <p class="section-sub">Most "AI tool platforms" ship connectors that wrap docs without testing. We ran live <code>curl</code> against every documented endpoint and <code>eth_call</code> against every Chainlink address before publishing.</p>

  <div class="verify">
    <h3>2026-05-27 verification run</h3>
    <div class="row"><span>Pyth Hermes /v2 + Benchmarks /v1 + Lazer Pro spec</span><span class="ok">RE'd from openapi.json ✓</span></div>
    <div class="row"><span>CoinGecko /simple/price · /search/trending · /global</span><span class="ok">live HTTP 200 ✓</span></div>
    <div class="row"><span>DefiLlama /protocols (7,576 entries) · /prices/current · TVL</span><span class="ok">live HTTP 200 ✓</span></div>
    <div class="row"><span>DexScreener /tokens · /pairs · /search · /token-boosts</span><span class="ok">live HTTP 200 ✓</span></div>
    <div class="row"><span>Chainlink — 17 mainnet addresses · eth_call latestRoundData</span><span class="ok">17/17 live, &lt;48h fresh ✓</span></div>
    <div class="row"><span>Bug caught + fixed: Pyth Hermes <code>asset_type</code> filter (Hermes rejects it)</span><span class="ok">use Benchmarks instead ✓</span></div>
    <div class="row"><span>Bug caught + fixed: Chainlink OP/USD (no mainnet contract)</span><span class="ok">removed from catalog ✓</span></div>
  </div>
</section>

<!-- ========== USAGE ========== -->
<section id="usage">
  <div class="section-label">Drop-in usage</div>
  <h2>Three lines, one URL, agent has live prices.</h2>

  <p class="section-sub"><strong style="color:var(--text)">Python — Claude agent gets live BTC + ETH prices</strong></p>
  <pre><code><span class="k">from</span> wmcp <span class="k">import</span> WmcpClient
<span class="k">from</span> wmcp.anthropic <span class="k">import</span> to_anthropic_tools, execute_tool_use
<span class="k">from</span> anthropic <span class="k">import</span> Anthropic

client = WmcpClient(api_key=<span class="s">"webmcp_live_…"</span>)
tools  = client.tools(<span class="s">"https://api.coingecko.com/api/v3"</span>)

anthropic = Anthropic()
msg = anthropic.messages.create(
    model=<span class="s">"claude-opus-4-7"</span>,
    max_tokens=1024,
    tools=to_anthropic_tools(tools),
    messages=[{<span class="s">"role"</span>:<span class="s">"user"</span>,<span class="s">"content"</span>:<span class="s">"What are BTC and ETH prices in USD right now?"</span>}],
)

<span class="k">for</span> block <span class="k">in</span> msg.content:
    <span class="k">if</span> block.type == <span class="s">"tool_use"</span>:
        <span class="k">print</span>(execute_tool_use(client, <span class="s">"https://api.coingecko.com/api/v3"</span>, block.model_dump()))</code></pre>

  <p class="section-sub" style="margin-top:24px"><strong style="color:var(--text)">cURL — direct execute against Pyth Hermes</strong></p>
  <pre><code><span class="k">curl</span> -X POST <span class="s">'${origin}/api/v1/tools/execute'</span> \\
  -H <span class="s">'content-type: application/json'</span> \\
  -d <span class="s">'{
    "url": "https://hermes.pyth.network/",
    "tool": "get_latest_price",
    "args": {
      "ids": ["e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43"],
      "parsed": true
    }
  }'</span></code></pre>

  <p class="section-sub" style="margin-top:24px"><strong style="color:var(--text)">cURL — Chainlink BTC/USD lookup + read template</strong></p>
  <pre><code><span class="c"># 1. Get the feed address</span>
<span class="k">curl</span> -X POST <span class="s">'${origin}/api/v1/tools/execute'</span> \\
  -H <span class="s">'content-type: application/json'</span> \\
  -d <span class="s">'{ "url":"https://data.chain.link/", "tool":"get_feed_address", "args":{"pair":"BTC/USD"} }'</span>

<span class="c"># 2. Read the live price via your favorite RPC (cloudflare-eth.com etc.)</span>
<span class="k">curl</span> -X POST <span class="s">'https://ethereum-rpc.publicnode.com'</span> \\
  -H <span class="s">'content-type: application/json'</span> \\
  -d <span class="s">'{ "jsonrpc":"2.0", "method":"eth_call", "params":[{"to":"0xF4030086…","data":"0xfeaf968c"},"latest"], "id":1 }'</span></code></pre>
</section>

<!-- ========== POSITIONING ========== -->
<section id="vs">
  <div class="section-label">Positioning</div>
  <h2>vs. wrapping the APIs yourself · vs. owner-side platforms</h2>

  <table>
    <thead>
      <tr>
        <th>Approach</th>
        <th>Pros</th>
        <th>Cons</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Roll your own per-API SDK</strong></td>
        <td>Full control</td>
        <td>5 SDKs to maintain · auth-token plumbing · MCP-shape wrappers · ~2 days of work</td>
      </tr>
      <tr>
        <td><strong>Composio / Pipedream</strong></td>
        <td>Curated commerce + SaaS connectors</td>
        <td><strong>No oracle / price-feed / DeFi connectors exist</strong> — these vendors are owner-side</td>
      </tr>
      <tr>
        <td><strong>Smithery / dev-mcp</strong></td>
        <td>Some MCP servers cataloged</td>
        <td>Each is a separately maintained third-party server, varying quality + uptime</td>
      </tr>
      <tr>
        <td><strong>wmcp.sh /price-data</strong></td>
        <td><strong>Single endpoint, 28 tools, all verified, all free for public tiers</strong></td>
        <td>Free CoinGecko rate-limited; agent UX for choosing across 5 sources is on you</td>
      </tr>
    </tbody>
  </table>
</section>

<!-- ========== FAQ ========== -->
<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Frequently asked</h2>

  <details><summary>Which adapters are actually free?</summary>
  <div class="answer">CoinGecko (free tier, 30 req/min), DefiLlama (no advertised limit), DexScreener (~300 req/min), Pyth Hermes + Benchmarks (free public). Pyth Pro / Lazer is paid — bring your own access token via <code>args._auth</code>. CoinGecko Pro key also supported via <code>_auth</code> for higher limits.</div>
  </details>

  <details><summary>What's the latency?</summary>
  <div class="answer">Hermes ~400ms publish-to-API. Pyth Pro: 50ms / 200ms / 1s channels (choose via the <code>channel</code> arg on lazer_latest_price). CoinGecko + DefiLlama + DexScreener: standard REST round-trip, plus wmcp.sh adds a 60s edge cache that hides repeat queries. Chainlink: bounded by whatever RPC your agent uses to eth_call — Cloudflare typically ~80-150ms.</div>
  </details>

  <details><summary>Why isn't Chainlink "just an HTTP call" like the others?</summary>
  <div class="answer">Chainlink price feeds live on-chain as smart contracts. There's no REST endpoint you can hit. We ship the verified catalog of addresses + the exact eth_call template your agent needs to read them. Future versions may proxy eth_call through wmcp.sh so the agent doesn't need a Web3 client of its own.</div>
  </details>

  <details><summary>The Pyth July 31 2026 upgrade — does that break the free Hermes tier?</summary>
  <div class="answer">Pyth has announced that the Hermes free tier will gate behind API keys at some point in their Pyth Core rollout. When that flips, agents passing a Pyth API key via <code>_auth</code> on the Hermes tools will continue to work — same pattern as CoinGecko Pro. Anonymous Hermes calls may rate-limit or 401. Our adapter is forward-compatible: <code>_auth</code> is already wired on every Pyth tool, even Hermes.</div>
  </details>

  <details><summary>Can I use this with Cursor / Claude Code / Codex / OpenAI agents?</summary>
  <div class="answer">Yes — every tool list returned from <code>/api/v1/tools?url=…</code> is shaped as both MCP <code>tool_use</code> and OpenAI <code>function_call</code> JSON. Drop it into whichever agent framework you're using. Examples for Anthropic SDK + OpenAI SDK at <a href="/integration/openapi" style="color:var(--accent2);text-decoration:none">/integration/openapi</a>.</div>
  </details>

  <details><summary>Will more sources be added?</summary>
  <div class="answer">On the deck: Coinbase Exchange (REST + WebSocket), Binance public market data, Uniswap Subgraph (GraphQL → MCP), Aave / Compound rate feeds, RWA oracles (Centrifuge, Pendle). Open an issue at github.com/New1Direction/webmcp-anything with the source + use case if you want it prioritized.</div>
  </details>
</section>

<footer>
  <a href="/">Home</a> · <a href="/agent-ready">Agent-ready</a> · <a href="/managed">Done for you</a> · <a href="/integration/openapi">OpenAPI</a> · <a href="/integration/stripe">Stripe</a> · <a href="/integration/shopify">Shopify</a> · <a href="/directory">Directory</a> · <a href="https://github.com/New1Direction/webmcp-anything">GitHub</a>
</footer>

</div>
</body>
</html>`;
}
