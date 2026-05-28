import { Hono } from "hono";
import { cors } from "hono/cors";
import * as shopify from "../../adapters/shopify.js";
import * as jsonld from "../../adapters/jsonld.js";
import * as openapi from "../../adapters/openapi.js";
import * as llm from "../../adapters/llm.js";
import * as coingecko from "../../adapters/coingecko.js";
import * as defillama from "../../adapters/defillama.js";
import * as dexscreener from "../../adapters/dexscreener.js";
import * as pyth from "../../adapters/pyth.js";
import * as chainlink from "../../adapters/chainlink.js";

// Crypto/data adapters share the same structure: detect → extract → action.
// They sit after openapi and before the HTML fetch in the /api/v1/tools chain.
const CRYPTO_ADAPTERS = [
  { name: "coingecko", mod: coingecko, ttl: 60 },        // prices change fast
  { name: "dexscreener", mod: dexscreener, ttl: 60 },    // pair data changes fast
  { name: "pyth", mod: pyth, ttl: 60 },                  // oracle prices
  { name: "defillama", mod: defillama, ttl: 600 },       // TVL changes slowly
  { name: "chainlink", mod: chainlink, ttl: 86400 },     // catalog only — daily cache fine
];
import { fetchAndParse } from "./html";
import { landingHtml } from "./landing";
import { dashboardHtml } from "./dashboard";
import { directoryHtml } from "./directory";
import { ogSvg } from "./og";
import { scheduledHandler, runSeedNow, addSeedStores } from "./scheduled";
import { githubStart, githubCallback, logout, me, issueOwnKey } from "./oauth";
import {
  getProviders,
  getMyConnections,
  providerStart,
  providerCallback,
  providerSaveApiKey,
  providerDisconnect,
} from "./provider_routes";
import { resolveTokenForUrl, providerForUrl } from "./token_resolver";
import { loadProviderToken } from "./token_vault";
import { gate, issueKey, revokeKey, type AuthCtx, type Plan } from "./auth";
import {
  stripeWebhook,
  createCheckout,
  keyByCheckout,
  recoverByEmail,
} from "./stripe";

type Bindings = {
  CACHE: KVNamespace;
  KEYS: KVNamespace;
  USAGE: KVNamespace;
  ENVIRONMENT: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_PRICE_TO_PLAN?: string;
  ADMIN_TOKEN?: string;
  ANTHROPIC_API_KEY?: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
};

type Variables = { auth: AuthCtx };

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();
app.use("*", cors({ origin: "*", allowMethods: ["GET", "POST", "OPTIONS"] }));

// --------------------- helpers ---------------------

const cacheKey = (url: string) => `v1:${normalizeUrl(url)}`;

function normalizeUrl(u: string): string {
  try {
    const x = new URL(u);
    // Drop common tracking params
    for (const p of [...x.searchParams.keys()]) {
      if (/^(utm_|gclid|fbclid|mc_|ref|source)/i.test(p)) x.searchParams.delete(p);
    }
    return x.toString().replace(/\/$/, "");
  } catch {
    return u;
  }
}

async function readCache(env: Bindings, url: string, maxAgeSec: number) {
  const raw = await env.CACHE.get(cacheKey(url));
  if (!raw) return null;
  try {
    const entry = JSON.parse(raw);
    if (Date.now() - entry.ts > maxAgeSec * 1000) return null;
    return entry;
  } catch {
    return null;
  }
}

async function writeCache(env: Bindings, url: string, payload: any, ttlSec: number) {
  await env.CACHE.put(
    cacheKey(url),
    JSON.stringify({ payload, ts: Date.now() }),
    { expirationTtl: ttlSec }
  );
  // First-time-only directory entry + counter.
  // KV metadata is returned by list(), so the /directory endpoint can render
  // without one get-per-entry.
  const normalized = normalizeUrl(url);
  const seenKey = `seen:${normalized}`;
  const already = await env.CACHE.get(seenKey);
  const adapter = payload?.adapter || "other";
  const title =
    payload?.product?.title ||
    payload?.product?.name ||
    undefined;
  // Always refresh metadata — KV consistency / earlier schema versions can
  // leave entries without metadata, which would hide them from /directory.
  await env.CACHE.put(seenKey, normalized, {
    metadata: { url: normalized, adapter, ts: Date.now(), title },
  });
  if (!already) {
    const raw = await env.CACHE.get("stats:total_cached");
    const n = raw ? parseInt(raw, 10) || 0 : 0;
    await env.CACHE.put("stats:total_cached", String(n + 1));
  }
}

// --------------------- routes ---------------------

app.get("/", (c) => c.html(landingHtml(new URL(c.req.url).origin)));

app.get("/api/v1/health", (c) =>
  c.json({ ok: true, version: "0.1.0", env: c.env.ENVIRONMENT })
);

app.get("/api/v1/stats/public", async (c) => {
  const raw = await c.env.CACHE.get("stats:total_cached");
  const cached_urls = raw ? parseInt(raw, 10) || 0 : 0;
  return c.json({ cached_urls });
});

app.get("/api/v1/directory", async (c) => {
  const limit = Math.min(500, parseInt(c.req.query("limit") || "200", 10));
  const { slugFromUrl } = await import("./slug");

  // Parallel: directory entries + verified set + featured ranks.
  const [list, vList, fList] = await Promise.all([
    c.env.CACHE.list({ prefix: "seen:", limit }),
    c.env.KEYS.list({ prefix: "verified:", limit: 1000 }),
    c.env.KEYS.list({ prefix: "featured:", limit: 1000 }),
  ]);

  const verifiedSet = new Set<string>(
    vList.keys.map((k: any) => k.name.slice("verified:".length))
  );
  const featuredKeys = fList.keys.map((k: any) => k.name.slice("featured:".length));
  // Featured ranks need values (KV.list doesn't include the value, only metadata).
  // For ≤1000 featured entries this is one batched fetch per slug. Featured
  // listings will be a small handful in practice — under 50.
  const featuredRanks: Record<string, number> = {};
  await Promise.all(
    featuredKeys.map(async (slug) => {
      const v = await c.env.KEYS.get(`featured:${slug}`);
      if (v) featuredRanks[slug] = parseInt(v, 10);
    })
  );

  const entries = list.keys
    .map((k: any) => k.metadata)
    .filter((m: any) => m && m.url)
    .map((m: any) => {
      const slug = slugFromUrl(m.url);
      return {
        url: m.url,
        adapter: m.adapter || "other",
        ts: m.ts || 0,
        title: m.title || null,
        slug,
        verified: verifiedSet.has(slug),
        featured_rank: featuredRanks[slug] ?? null,
      };
    });

  // Sort: featured first (asc by rank), then by ts desc.
  entries.sort((a: any, b: any) => {
    const ar = a.featured_rank ?? Number.POSITIVE_INFINITY;
    const br = b.featured_rank ?? Number.POSITIVE_INFINITY;
    if (ar !== br) return ar - br;
    return b.ts - a.ts;
  });

  return c.json({ entries, list_complete: list.list_complete });
});

app.get("/directory", (c) => c.html(directoryHtml(new URL(c.req.url).origin)));

app.get("/connect/anthropic", async (c) => {
  const { connectAnthropicHtml } = await import("./connect_anthropic");
  return c.html(connectAnthropicHtml());
});

// --------------------- integration SEO pages ---------------------

app.get("/integration/openapi", async (c) => {
  const { integrationOpenapiHtml } = await import("./integration_openapi");
  return new Response(integrationOpenapiHtml(new URL(c.req.url).origin), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=900, s-maxage=900",
    },
  });
});

// ---------- MCP proxy (OAuth-bearer-injecting front for upstream MCP) ----------
// Generic — works for any provider with mcpProxy:true in providers.ts.
// Agents point at /mcp/<provider>; wmcp.sh injects the user's stored OAuth
// bearer token transparently, refreshing as needed.
app.get("/mcp", async (c) => {
  const { listMcpProxies } = await import("./mcp_proxy");
  return listMcpProxies(c as any);
});
app.all("/mcp/:provider", gate("execute"), async (c) => {
  const { mcpProxyHandler } = await import("./mcp_proxy");
  return mcpProxyHandler(c as any);
});
// Match subpaths too (rare with MCP servers but harmless to support).
app.all("/mcp/:provider/*", gate("execute"), async (c) => {
  const { mcpProxyHandler } = await import("./mcp_proxy");
  return mcpProxyHandler(c as any);
});

// ---------- agent-ready cornerstone + managed-service landing ----------
// SEO funnel: /agent-ready is the cornerstone for "how to make my site
// AI-ready" queries; /managed is the paid done-for-you offer. Leads
// land in KV via POST /api/v1/leads.
app.get("/agent-ready", async (c) => {
  const { agentReadyHtml } = await import("./agent_ready");
  return new Response(agentReadyHtml(new URL(c.req.url).origin), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=900, s-maxage=900",
    },
  });
});

app.get("/managed", async (c) => {
  const { managedHtml } = await import("./managed");
  return new Response(managedHtml(new URL(c.req.url).origin), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=900, s-maxage=900",
    },
  });
});

// /agent-ready/* — vertical-specific SEO pages keyed off the cornerstone.
// Each targets a distinct buyer persona (Shopify operator, API team,
// docs author, SaaS founder).
app.get("/agent-ready/shopify", async (c) => {
  const { agentReadyShopifyHtml } = await import("./agent_ready_shopify");
  return new Response(agentReadyShopifyHtml(new URL(c.req.url).origin), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=900, s-maxage=900",
    },
  });
});

app.get("/agent-ready/api", async (c) => {
  const { agentReadyApiHtml } = await import("./agent_ready_api");
  return new Response(agentReadyApiHtml(new URL(c.req.url).origin), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=900, s-maxage=900",
    },
  });
});

app.get("/agent-ready/docs", async (c) => {
  const { agentReadyDocsHtml } = await import("./agent_ready_docs");
  return new Response(agentReadyDocsHtml(new URL(c.req.url).origin), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=900, s-maxage=900",
    },
  });
});

app.get("/agent-ready/saas", async (c) => {
  const { agentReadySaasHtml } = await import("./agent_ready_saas");
  return new Response(agentReadySaasHtml(new URL(c.req.url).origin), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=900, s-maxage=900",
    },
  });
});

// /vs/* comparison pages — SEO target: "<competitor> alternative",
// "wmcp.sh vs <competitor>". High CTR, branded-search capture.
app.get("/vs/composio", async (c) => {
  const { vsComposioHtml } = await import("./vs_composio");
  return new Response(vsComposioHtml(new URL(c.req.url).origin), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=900, s-maxage=900",
    },
  });
});

app.get("/vs/pipedream", async (c) => {
  const { vsPipedreamHtml } = await import("./vs_pipedream");
  return new Response(vsPipedreamHtml(new URL(c.req.url).origin), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=900, s-maxage=900",
    },
  });
});

app.get("/vs/zapier", async (c) => {
  const { vsZapierHtml } = await import("./vs_zapier");
  return new Response(vsZapierHtml(new URL(c.req.url).origin), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=900, s-maxage=900",
    },
  });
});

// /vs/* (round 2) and /alternatives/* — competitor comparison surface,
// expanded from 3 to 8 pages for broader SERP capture.
app.get("/vs/make-com", async (c) => {
  const { vsMakeComHtml } = await import("./vs_make_com");
  return new Response(vsMakeComHtml(new URL(c.req.url).origin), {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=900, s-maxage=900" },
  });
});
app.get("/vs/n8n", async (c) => {
  const { vsN8nHtml } = await import("./vs_n8n");
  return new Response(vsN8nHtml(new URL(c.req.url).origin), {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=900, s-maxage=900" },
  });
});
app.get("/vs/smithery", async (c) => {
  const { vsSmitheryHtml } = await import("./vs_smithery");
  return new Response(vsSmitheryHtml(new URL(c.req.url).origin), {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=900, s-maxage=900" },
  });
});
app.get("/alternatives/composio", async (c) => {
  const { alternativesComposioHtml } = await import("./alternatives_composio");
  return new Response(alternativesComposioHtml(new URL(c.req.url).origin), {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=900, s-maxage=900" },
  });
});
app.get("/alternatives/pipedream", async (c) => {
  const { alternativesPipedreamHtml } = await import("./alternatives_pipedream");
  return new Response(alternativesPipedreamHtml(new URL(c.req.url).origin), {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=900, s-maxage=900" },
  });
});

// /integration/* — 4 new provider pages, all using integration_template.
app.get("/integration/airtable", async (c) => {
  const { integrationAirtableHtml } = await import("./integration_airtable");
  return new Response(integrationAirtableHtml(new URL(c.req.url).origin), {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=900, s-maxage=900" },
  });
});
app.get("/integration/anthropic", async (c) => {
  const { integrationAnthropicHtml } = await import("./integration_anthropic");
  return new Response(integrationAnthropicHtml(new URL(c.req.url).origin), {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=900, s-maxage=900" },
  });
});
app.get("/integration/discord", async (c) => {
  const { integrationDiscordHtml } = await import("./integration_discord");
  return new Response(integrationDiscordHtml(new URL(c.req.url).origin), {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=900, s-maxage=900" },
  });
});
app.get("/integration/openai", async (c) => {
  const { integrationOpenaiHtml } = await import("./integration_openai");
  return new Response(integrationOpenaiHtml(new URL(c.req.url).origin), {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=900, s-maxage=900" },
  });
});

// /use-case/* — narrative pages targeting buyer-intent queries.
app.get("/use-case/agent-commerce", async (c) => {
  const { useCaseAgentCommerceHtml } = await import("./use_case_agent_commerce");
  return new Response(useCaseAgentCommerceHtml(new URL(c.req.url).origin), {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=900, s-maxage=900" },
  });
});
app.get("/use-case/yield-watcher", async (c) => {
  const { useCaseYieldWatcherHtml } = await import("./use_case_yield_watcher");
  return new Response(useCaseYieldWatcherHtml(new URL(c.req.url).origin), {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=900, s-maxage=900" },
  });
});

// /blog (index) + /blog/<slug> + /blog/rss.xml — long-form content surface,
// 24 posts seeded from the Gemini-daemon substack pipeline. Re-run
// `node scripts/build_blog_posts.mjs` after new drafts land, then redeploy.
app.get("/blog", async (c) => {
  const { blogIndexHtml } = await import("./blog");
  return new Response(blogIndexHtml(new URL(c.req.url).origin), {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=600, s-maxage=600" },
  });
});

app.get("/blog/rss.xml", async (c) => {
  const { blogRssXml } = await import("./blog");
  return new Response(blogRssXml(new URL(c.req.url).origin), {
    headers: { "content-type": "application/rss+xml; charset=utf-8", "cache-control": "public, max-age=600, s-maxage=600" },
  });
});

app.get("/blog/:slug", async (c) => {
  const slug = (c.req.param("slug") || "").toLowerCase();
  if (!/^[a-z0-9-]{1,120}$/.test(slug)) return c.text("Not found", 404);
  const { BLOG_POSTS } = await import("./blog_posts");
  const post = BLOG_POSTS[slug];
  if (!post) return c.text("Not found", 404);
  const { blogPostHtml } = await import("./blog");
  return new Response(blogPostHtml(new URL(c.req.url).origin, post), {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=900, s-maxage=900" },
  });
});

// ---------- 30-page SEO drop: integrations + use-cases + MCP-servers + vs/roundups ----------
// All standalone pages, lazy-imported per route. 15-min CDN cache.
const HTML_HEADERS = {
  "content-type": "text/html; charset=utf-8",
  "cache-control": "public, max-age=900, s-maxage=900",
} as const;

// /integration/<framework> — 8 framework integration pages
app.get("/integration/nextjs", async (c) => {
  const { integrationNextjsHtml } = await import("./integration_nextjs");
  return new Response(integrationNextjsHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/integration/astro", async (c) => {
  const { integrationAstroHtml } = await import("./integration_astro");
  return new Response(integrationAstroHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/integration/svelte", async (c) => {
  const { integrationSvelteHtml } = await import("./integration_svelte");
  return new Response(integrationSvelteHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/integration/remix", async (c) => {
  const { integrationRemixHtml } = await import("./integration_remix");
  return new Response(integrationRemixHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/integration/django", async (c) => {
  const { integrationDjangoHtml } = await import("./integration_django");
  return new Response(integrationDjangoHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/integration/rails", async (c) => {
  const { integrationRailsHtml } = await import("./integration_rails");
  return new Response(integrationRailsHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/integration/fastapi", async (c) => {
  const { integrationFastapiHtml } = await import("./integration_fastapi");
  return new Response(integrationFastapiHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/integration/express", async (c) => {
  const { integrationExpressHtml } = await import("./integration_express");
  return new Response(integrationExpressHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});

// /use-case/<slug> — 7 use-case narrative pages
app.get("/use-case/customer-support", async (c) => {
  const { useCaseCustomerSupportHtml } = await import("./use_case_customer_support");
  return new Response(useCaseCustomerSupportHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/use-case/research-agent", async (c) => {
  const { useCaseResearchAgentHtml } = await import("./use_case_research_agent");
  return new Response(useCaseResearchAgentHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/use-case/sales-assistant", async (c) => {
  const { useCaseSalesAssistantHtml } = await import("./use_case_sales_assistant");
  return new Response(useCaseSalesAssistantHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/use-case/code-review-bot", async (c) => {
  const { useCaseCodeReviewBotHtml } = await import("./use_case_code_review_bot");
  return new Response(useCaseCodeReviewBotHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/use-case/data-pipeline", async (c) => {
  const { useCaseDataPipelineHtml } = await import("./use_case_data_pipeline");
  return new Response(useCaseDataPipelineHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/use-case/content-moderation", async (c) => {
  const { useCaseContentModerationHtml } = await import("./use_case_content_moderation");
  return new Response(useCaseContentModerationHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/use-case/personal-assistant", async (c) => {
  const { useCasePersonalAssistantHtml } = await import("./use_case_personal_assistant");
  return new Response(useCasePersonalAssistantHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});

// /mcp-server/<tool> — 8 tool-specific MCP server pages.
// IMPORTANT: prefix is `/mcp-server/` NOT `/mcp/` — the latter is the
// live OAuth-proxy runtime, already defined above.
app.get("/mcp-server/postgres", async (c) => {
  const { mcpServerPostgresHtml } = await import("./mcp_server_postgres");
  return new Response(mcpServerPostgresHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/mcp-server/redis", async (c) => {
  const { mcpServerRedisHtml } = await import("./mcp_server_redis");
  return new Response(mcpServerRedisHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/mcp-server/elasticsearch", async (c) => {
  const { mcpServerElasticsearchHtml } = await import("./mcp_server_elasticsearch");
  return new Response(mcpServerElasticsearchHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/mcp-server/snowflake", async (c) => {
  const { mcpServerSnowflakeHtml } = await import("./mcp_server_snowflake");
  return new Response(mcpServerSnowflakeHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/mcp-server/sentry", async (c) => {
  const { mcpServerSentryHtml } = await import("./mcp_server_sentry");
  return new Response(mcpServerSentryHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/mcp-server/datadog", async (c) => {
  const { mcpServerDatadogHtml } = await import("./mcp_server_datadog");
  return new Response(mcpServerDatadogHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/mcp-server/cloudflare", async (c) => {
  const { mcpServerCloudflareHtml } = await import("./mcp_server_cloudflare");
  return new Response(mcpServerCloudflareHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/mcp-server/vercel", async (c) => {
  const { mcpServerVercelHtml } = await import("./mcp_server_vercel");
  return new Response(mcpServerVercelHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});

// /vs/* (round 3) — 4 more competitor comparisons
app.get("/vs/langchain-tools", async (c) => {
  const { vsLangchainToolsHtml } = await import("./vs_langchain_tools");
  return new Response(vsLangchainToolsHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/vs/arcade-ai", async (c) => {
  const { vsArcadeAiHtml } = await import("./vs_arcade_ai");
  return new Response(vsArcadeAiHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/vs/mcp-toolkit", async (c) => {
  const { vsMcpToolkitHtml } = await import("./vs_mcp_toolkit");
  return new Response(vsMcpToolkitHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/vs/anthropic-skills", async (c) => {
  const { vsAnthropicSkillsHtml } = await import("./vs_anthropic_skills");
  return new Response(vsAnthropicSkillsHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});

// /roundup/* — 3 listicle / category roundup pages
app.get("/roundup/mcp-servers-2026", async (c) => {
  const { roundupMcpServers2026Html } = await import("./roundup_mcp_servers_2026");
  return new Response(roundupMcpServers2026Html(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/roundup/agent-frameworks", async (c) => {
  const { roundupAgentFrameworksHtml } = await import("./roundup_agent_frameworks");
  return new Response(roundupAgentFrameworksHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/roundup/oauth-providers-mcp", async (c) => {
  const { roundupOauthProvidersMcpHtml } = await import("./roundup_oauth_providers_mcp");
  return new Response(roundupOauthProvidersMcpHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});

// ---------- 25-page round-2 SEO drop: verticals + how-tos + glossary + frameworks ----------
// /for/<vertical> — 7 industry pages
app.get("/for/healthcare", async (c) => {
  const { forHealthcareHtml } = await import("./for_healthcare");
  return new Response(forHealthcareHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/for/fintech", async (c) => {
  const { forFintechHtml } = await import("./for_fintech");
  return new Response(forFintechHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/for/legal", async (c) => {
  const { forLegalHtml } = await import("./for_legal");
  return new Response(forLegalHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/for/real-estate", async (c) => {
  const { forRealEstateHtml } = await import("./for_real_estate");
  return new Response(forRealEstateHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/for/media", async (c) => {
  const { forMediaHtml } = await import("./for_media");
  return new Response(forMediaHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/for/marketing", async (c) => {
  const { forMarketingHtml } = await import("./for_marketing");
  return new Response(forMarketingHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/for/hr", async (c) => {
  const { forHrHtml } = await import("./for_hr");
  return new Response(forHrHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});

// /how-to/<task> — 8 tutorial pages
app.get("/how-to/install-claude-desktop-mcp", async (c) => {
  const { howToInstallClaudeDesktopMcpHtml } = await import("./how_to_install_claude_desktop_mcp");
  return new Response(howToInstallClaudeDesktopMcpHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/how-to/expose-shopify-as-mcp", async (c) => {
  const { howToExposeShopifyMcpHtml } = await import("./how_to_expose_shopify_mcp");
  return new Response(howToExposeShopifyMcpHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/how-to/build-stripe-mcp-agent", async (c) => {
  const { howToBuildStripeAgentHtml } = await import("./how_to_build_stripe_agent");
  return new Response(howToBuildStripeAgentHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/how-to/secure-mcp-oauth", async (c) => {
  const { howToSecureMcpOauthHtml } = await import("./how_to_secure_mcp_oauth");
  return new Response(howToSecureMcpOauthHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/how-to/debug-mcp-tool-calls", async (c) => {
  const { howToDebugMcpToolCallsHtml } = await import("./how_to_debug_mcp_tool_calls");
  return new Response(howToDebugMcpToolCallsHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/how-to/deploy-mcp-on-cloudflare-workers", async (c) => {
  const { howToDeployMcpCloudflareHtml } = await import("./how_to_deploy_mcp_cloudflare");
  return new Response(howToDeployMcpCloudflareHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/how-to/test-mcp-tools-locally", async (c) => {
  const { howToTestMcpToolsLocallyHtml } = await import("./how_to_test_mcp_tools_locally");
  return new Response(howToTestMcpToolsLocallyHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/how-to/claim-verified-mcp-badge", async (c) => {
  const { howToClaimVerifiedBadgeHtml } = await import("./how_to_claim_verified_badge");
  return new Response(howToClaimVerifiedBadgeHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});

// /glossary/<term> — 6 glossary pages
app.get("/glossary/mcp", async (c) => {
  const { glossaryMcpHtml } = await import("./glossary_mcp");
  return new Response(glossaryMcpHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/glossary/tool-use", async (c) => {
  const { glossaryToolUseHtml } = await import("./glossary_tool_use");
  return new Response(glossaryToolUseHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/glossary/function-calling", async (c) => {
  const { glossaryFunctionCallingHtml } = await import("./glossary_function_calling");
  return new Response(glossaryFunctionCallingHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/glossary/json-ld", async (c) => {
  const { glossaryJsonLdHtml } = await import("./glossary_json_ld");
  return new Response(glossaryJsonLdHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/glossary/oauth-pkce", async (c) => {
  const { glossaryOauthPkceHtml } = await import("./glossary_oauth_pkce");
  return new Response(glossaryOauthPkceHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/glossary/openapi-spec", async (c) => {
  const { glossaryOpenapiSpecHtml } = await import("./glossary_openapi_spec");
  return new Response(glossaryOpenapiSpecHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});

// /integration/<framework> — 4 more frameworks
app.get("/integration/laravel", async (c) => {
  const { integrationLaravelHtml } = await import("./integration_laravel");
  return new Response(integrationLaravelHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/integration/spring-boot", async (c) => {
  const { integrationSpringbootHtml } = await import("./integration_springboot");
  return new Response(integrationSpringbootHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/integration/nestjs", async (c) => {
  const { integrationNestjsHtml } = await import("./integration_nestjs");
  return new Response(integrationNestjsHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});
app.get("/integration/hono", async (c) => {
  const { integrationHonoHtml } = await import("./integration_hono");
  return new Response(integrationHonoHtml(new URL(c.req.url).origin), { headers: HTML_HEADERS });
});

app.post("/api/v1/leads", async (c) => {
  const { captureLead } = await import("./lead_capture");
  return captureLead(c as any);
});

// ---------- directory monetization: submit form + verified badge ----------
// /directory/submit  — free listing form. Cross-files to /managed lead vault
//                      if managed_interest box ticked.
// /api/v1/directory/submit — JSON POST endpoint. Rate-limited, honeypot.
// /badge/:slug.svg   — embeddable SVG badge. KV `verified:<slug>=1` controls
//                      whether the verified variant is served.
app.get("/directory/submit", async (c) => {
  const { directorySubmitHtml } = await import("./directory_submit");
  return new Response(directorySubmitHtml(new URL(c.req.url).origin), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=900, s-maxage=900",
    },
  });
});

app.post("/api/v1/directory/submit", async (c) => {
  const { captureDirectorySubmission } = await import("./directory_capture");
  return captureDirectorySubmission(c as any);
});

app.get("/badge/:slug", async (c) => {
  const { badgeHandler } = await import("./badge");
  return badgeHandler(c as any);
});

// /verify/<slug> — embed-snippet page. Renders preview + copy-paste blocks.
app.get("/verify/:slug", async (c) => {
  const { verifyEmbedHandler } = await import("./verify_embed");
  return verifyEmbedHandler(c as any);
});

// Admin: directory verification + featuring + submissions inbox.
// All gated by x-admin-token. Match existing /api/v1/keys pattern.
app.post("/api/v1/admin/directory/verify", async (c) => {
  const m = await import("./directory_admin");
  return m.verifyListing(c as any);
});
app.post("/api/v1/admin/directory/unverify", async (c) => {
  const m = await import("./directory_admin");
  return m.unverifyListing(c as any);
});
app.post("/api/v1/admin/directory/feature", async (c) => {
  const m = await import("./directory_admin");
  return m.featureListing(c as any);
});
app.post("/api/v1/admin/directory/unfeature", async (c) => {
  const m = await import("./directory_admin");
  return m.unfeatureListing(c as any);
});
app.get("/api/v1/admin/directory/submissions", async (c) => {
  const m = await import("./directory_admin");
  return m.listSubmissions(c as any);
});
app.get("/api/v1/admin/directory/state", async (c) => {
  const m = await import("./directory_admin");
  return m.getDirectoryState(c as any);
});

// Category landing — groups all 5 oracle / price-data adapters under one URL.
// Distinct from /integration/* (single-provider pages) — this is a category.
app.get("/price-data", async (c) => {
  const { integrationPriceDataHtml } = await import("./integration_price_data");
  return new Response(integrationPriceDataHtml(new URL(c.req.url).origin), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=900, s-maxage=900",
    },
  });
});

app.get("/integration/shopify", async (c) => {
  const { integrationShopifyHtml } = await import("./integration_shopify");
  return new Response(integrationShopifyHtml(new URL(c.req.url).origin), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=900, s-maxage=900",
    },
  });
});

app.get("/integration/stripe", async (c) => {
  const { integrationStripeHtml } = await import("./integration_stripe");
  return new Response(integrationStripeHtml(new URL(c.req.url).origin), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=900, s-maxage=900",
    },
  });
});

app.get("/integration/github", async (c) => {
  const { integrationGithubHtml } = await import("./integration_github");
  return new Response(integrationGithubHtml(new URL(c.req.url).origin), {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=900, s-maxage=900" },
  });
});

app.get("/integration/google", async (c) => {
  const { integrationGoogleHtml } = await import("./integration_google");
  return new Response(integrationGoogleHtml(new URL(c.req.url).origin), {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=900, s-maxage=900" },
  });
});

app.get("/integration/slack", async (c) => {
  const { integrationSlackHtml } = await import("./integration_slack");
  return new Response(integrationSlackHtml(new URL(c.req.url).origin), {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=900, s-maxage=900" },
  });
});

app.get("/integration/notion", async (c) => {
  const { integrationNotionHtml } = await import("./integration_notion");
  return new Response(integrationNotionHtml(new URL(c.req.url).origin), {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=900, s-maxage=900" },
  });
});

app.get("/integration/linear", async (c) => {
  const { integrationLinearHtml } = await import("./integration_linear");
  return new Response(integrationLinearHtml(new URL(c.req.url).origin), {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=900, s-maxage=900" },
  });
});

// --------------------- SEO pages ---------------------

app.get("/u/:encoded", async (c) => {
  const { uHtml, notFoundHtml, base64urlDecode } = await import("./u");
  const enc = c.req.param("encoded");
  let sourceUrl: string;
  try {
    sourceUrl = base64urlDecode(enc);
  } catch {
    return new Response(notFoundHtml("(invalid URL)", new URL(c.req.url).origin), {
      status: 400,
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
    });
  }
  const origin = new URL(c.req.url).origin;

  // Primary: full cache entry (tools, product, variants)
  const raw = await c.env.CACHE.get(cacheKey(sourceUrl));
  if (raw) {
    try {
      const entry = JSON.parse(raw);
      return new Response(uHtml(sourceUrl, entry, origin), {
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "public, max-age=300, s-maxage=300",
        },
      });
    } catch {}
  }

  // Fallback: seen: metadata (adapter, title, ts) — we know about this URL
  // even if the rich cache has expired. Render a minimal page that still
  // helps Google index AND triggers a fresh fetch in the background.
  const seenList = await c.env.CACHE.list({
    prefix: `seen:${normalizeUrl(sourceUrl)}`,
    limit: 1,
  });
  const meta: any = seenList.keys[0]?.metadata;
  if (meta?.url) {
    // Best-effort refresh of the cache for next request
    c.executionCtx.waitUntil(
      fetch(`${origin}/api/v1/tools?url=${encodeURIComponent(sourceUrl)}`).catch(() => {})
    );
    const minimalEntry = {
      payload: {
        adapter: meta.adapter || "other",
        tools: [],
        product: { title: meta.title || hostnameOf(sourceUrl) },
      },
      ts: meta.ts || Date.now(),
    };
    return new Response(uHtml(sourceUrl, minimalEntry, origin), {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=60, s-maxage=60",
      },
    });
  }

  return new Response(notFoundHtml(sourceUrl, origin), {
    status: 404,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
});

function hostnameOf(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
}

app.get("/robots.txt", async (c) => {
  const { robotsTxt } = await import("./u");
  return new Response(robotsTxt(new URL(c.req.url).origin), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
});

// /llms.txt — agent-readable site index following llmstxt.org convention.
// We're the agent-readiness company — eat our own dog food.
app.get("/llms-full.txt", async (c) => {
  const { llmsFullTxt } = await import("./u");
  return new Response(llmsFullTxt(new URL(c.req.url).origin), {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=900, s-maxage=900",
    },
  });
});

app.get("/llms.txt", async (c) => {
  const { llmsTxt } = await import("./u");
  return new Response(llmsTxt(new URL(c.req.url).origin), {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
});

app.get("/sitemap.xml", async (c) => {
  const { sitemapXml } = await import("./u");
  const xml = await sitemapXml(c.env, new URL(c.req.url).origin);
  return new Response(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
});

app.get("/og.svg", (c) =>
  new Response(ogSvg(), {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  })
);

app.get("/og.png", async (c) => {
  const { OG_PNG_B64 } = await import("./og_png");
  // atob → binary string → Uint8Array. Standard pattern in Workers.
  const bin = atob(OG_PNG_B64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Response(bytes, {
    headers: {
      "content-type": "image/png",
      "cache-control": "public, max-age=86400, s-maxage=86400",
    },
  });
});

app.get("/api/v1/debug", async (c) => {
  const url = c.req.query("url") || "https://www.allbirds.com/products/mens-wool-runners";
  const result: any = { url, steps: [] };

  // 1. Imports
  result.imports = {
    shopify: typeof shopify.detect,
    jsonld: typeof jsonld.detect,
    shopify_id: shopify.ID,
    jsonld_id: jsonld.ID,
  };

  // 2. Shopify detect
  try {
    const ctx = shopify.detect({ url, html: "" });
    result.steps.push({ step: "shopify.detect", result: ctx });
    if (ctx) {
      try {
        const data = await shopify.extract(ctx);
        result.steps.push({
          step: "shopify.extract",
          ok: true,
          tools_count: data.tools.length,
          product_title: data.product?.title,
        });
      } catch (e: any) {
        result.steps.push({ step: "shopify.extract", ok: false, error: String(e?.message || e) });
      }
    }
  } catch (e: any) {
    result.steps.push({ step: "shopify.detect", error: String(e?.message || e) });
  }

  // 3. fetchAndParse
  try {
    const page = await fetchAndParse(url);
    result.steps.push({
      step: "fetchAndParse",
      status: page.status,
      jsonld_count: page.jsonld.length,
      jsonld_types: page.jsonld.map((j: any) => j["@type"]),
      jsonld_first: page.jsonld[0],
      meta_keys: Object.keys(page.meta),
      title: page.title?.slice(0, 80),
    });

    const jc = jsonld.detect({ jsonld: page.jsonld, meta: page.meta, url, title: page.title });
    result.steps.push({ step: "jsonld.detect", result: jc ? { kind: jc.kind } : null });
    if (jc) {
      try {
        const data = await jsonld.extract(jc);
        result.steps.push({
          step: "jsonld.extract",
          ok: true,
          tools_count: data.tools.length,
          product_name: data.product?.name,
        });
      } catch (e: any) {
        result.steps.push({ step: "jsonld.extract", ok: false, error: String(e?.message || e) });
      }
    }
  } catch (e: any) {
    result.steps.push({ step: "fetchAndParse", error: String(e?.message || e) });
  }

  return c.json(result);
});

/**
 * GET /api/v1/tools?url=<product-url>&fresh=1
 * Returns WebMCP-compatible tool schema for the URL.
 *
 * Routing:
 *   1. Cache hit (60s for live, 7d for pushed)
 *   2. Shopify direct API (works server-side)
 *   3. Fetch HTML + run JSON-LD adapter
 *   4. Cache miss / blocked → 404 with hint
 */
app.get("/api/v1/tools", gate("read"), async (c) => {
  const url = c.req.query("url");
  if (!url) return c.json({ error: "url query param required" }, 400);
  const fresh = c.req.query("fresh") === "1";

  // 1) cache
  if (!fresh) {
    const hit = await readCache(c.env, url, 60);
    if (hit) {
      return c.json({ ...hit.payload, from: "cache", cached_at: hit.ts });
    }
  }

  // 2) shopify direct
  const shopCtx = shopify.detect({ url, html: "" });
  if (shopCtx) {
    try {
      const data = await shopify.extract(shopCtx);
      const payload = {
        adapter: "shopify",
        tools: data.tools,
        product: data.product,
        variants: data.variants,
      };
      // 1h TTL — Shopify product data is stable enough; longer also gives /u/
      // SEO pages cached content to render server-side.
      c.executionCtx.waitUntil(writeCache(c.env, url, payload, 3600));
      return c.json({ ...payload, from: "live" });
    } catch (err: any) {
      // fall through
    }
  }

  // 2b) openapi — URL pattern: openapi.json, swagger.json, /api-docs, etc.
  const openapiCtx = openapi.detect({ url });
  if (openapiCtx) {
    try {
      const data = await openapi.extract(openapiCtx);
      const payload = {
        adapter: "openapi",
        tools: data.tools,
        product: data.product,
      };
      // 24h — OpenAPI specs rarely change between versions
      c.executionCtx.waitUntil(writeCache(c.env, url, payload, 24 * 3600));
      return c.json({ ...payload, from: "live" });
    } catch (err: any) {
      // fall through to jsonld
    }
  }

  // 2c) crypto / data adapters — hand-curated tool catalogs for CoinGecko,
  // DefiLlama, DexScreener, Pyth, Chainlink. extract() is synchronous on
  // these (no spec fetch), so this loop is cheap.
  for (const { name, mod, ttl } of CRYPTO_ADAPTERS) {
    const ctx = (mod as any).detect({ url });
    if (!ctx) continue;
    try {
      const data = await (mod as any).extract(ctx);
      const payload = {
        adapter: name,
        tools: data.tools,
        product: data.product,
      };
      c.executionCtx.waitUntil(writeCache(c.env, url, payload, ttl));
      return c.json({ ...payload, from: "live" });
    } catch (err: any) {
      // fall through to next adapter (extract() may throw on unsupported nested paths)
    }
  }

  // 3) html + jsonld
  let page;
  try {
    page = await fetchAndParse(url);
  } catch (err: any) {
    return c.json(
      {
        error: "fetch_failed",
        hint: "Site likely blocks server-side fetches (Incapsula/Akamai). Install the Chrome extension to extract tools client-side.",
        url,
        message: String(err?.message || err),
      },
      502
    );
  }

  const jsonldCtx = jsonld.detect({
    jsonld: page.jsonld,
    meta: page.meta,
    url: page.finalUrl || url,
    title: page.title,
  });
  if (jsonldCtx) {
    try {
      const data = await jsonld.extract(jsonldCtx);
      const payload = {
        adapter: "jsonld",
        tools: data.tools,
        product: data.product,
        variants: data.variants,
      };
      // 6h — JSON-LD product data is fairly stable
      c.executionCtx.waitUntil(writeCache(c.env, url, payload, 6 * 3600));
      return c.json({ ...payload, from: "live" });
    } catch (err: any) {
      // fall through to LLM fallback
    }
  }

  // 4) LLM fallback — last resort. Sends already-extracted signals to Haiku.
  // Prefer the calling user's own Claude Max / Anthropic Console OAuth token
  // if they've connected one. This shifts inference cost to their account.
  let userOauthToken: string | undefined;
  const auth_user = c.var.auth?.user_id;
  if (auth_user && !auth_user.startsWith("anon:")) {
    for (const pid of ["claude_max", "anthropic"]) {
      try {
        const tok = await loadProviderToken(c.env, auth_user, pid);
        if (tok) {
          userOauthToken = tok.access_token;
          break;
        }
      } catch {}
    }
  }

  const llmCtx = llm.detect({
    url: page.finalUrl || url,
    title: page.title,
    meta: page.meta,
    jsonld: page.jsonld,
    llmKey: userOauthToken ? undefined : c.env.ANTHROPIC_API_KEY,
    oauthToken: userOauthToken,
  });
  if (llmCtx) {
    try {
      const data = await llm.extract(llmCtx);
      if (data.tools?.length) {
        const payload = {
          adapter: "llm",
          tools: data.tools,
          product: data.product,
        };
        // 30-day cache: LLM calls are expensive, amortize aggressively.
        c.executionCtx.waitUntil(writeCache(c.env, url, payload, 30 * 86400));
        return c.json({ ...payload, from: "llm" });
      }
    } catch (err: any) {
      // fall through to no_tools
    }
  }

  return c.json(
    {
      error: "no_tools_extracted",
      hint: "No matching adapter and LLM fallback couldn't extract tools. Install the Chrome extension for client-side extraction.",
      url,
    },
    404
  );
});

/**
 * POST /api/v1/tools/execute
 * { url, tool, args }
 * Currently supports live Shopify actions; jsonld returns static results.
 */
app.post("/api/v1/tools/execute", gate("execute"), async (c) => {
  const body = await c.req.json<{ url: string; tool: string; args?: any }>().catch(() => null);
  if (!body?.url || !body.tool)
    return c.json({ error: "url and tool required" }, 400);

  const ctx = shopify.detect({ url: body.url, html: "" });
  if (ctx) {
    try {
      const data = await shopify.extract(ctx);
      const tool = data.tools.find((t: any) => t.name === body.tool);
      if (!tool) return c.json({ error: `tool ${body.tool} not found` }, 404);
      if (tool.result !== undefined) return c.json({ ok: true, value: tool.result });
      const kind = tool.action?.kind;
      if (!kind) return c.json({ error: "static result tool — no action to execute" }, 400);
      const handler = (shopify.actions as any)[kind];
      if (!handler) return c.json({ error: "no action handler" }, 500);
      const value = await handler({ ...tool.action, args: body.args || {} });
      return c.json({ ok: true, value });
    } catch (err: any) {
      return c.json({ ok: false, error: String(err?.message || err) }, 500);
    }
  }

  // Crypto/data adapter execute. Each adapter has a single action kind that
  // dispatches based on path/params carried in the tool definition.
  for (const { name, mod } of CRYPTO_ADAPTERS) {
    const cctx = (mod as any).detect({ url: body.url });
    if (!cctx) continue;
    try {
      const data = await (mod as any).extract(cctx);
      const tool = data.tools.find((t: any) => t.name === body.tool);
      if (!tool) return c.json({ error: `tool ${body.tool} not found` }, 404);
      if (tool.result !== undefined) return c.json({ ok: true, value: tool.result });
      const kind = tool.action?.kind;
      if (!kind) return c.json({ error: "static result tool — no action to execute" }, 400);
      const handler = (mod as any).actions?.[kind];
      if (!handler) return c.json({ error: `no action handler for ${kind}` }, 500);
      const value = await handler({ ...tool.action, args: body.args || {} });
      return c.json({ ok: true, value });
    } catch (err: any) {
      return c.json({ ok: false, error: String(err?.message || err), adapter: name }, 500);
    }
  }

  const oaCtx = openapi.detect({ url: body.url });
  if (oaCtx) {
    try {
      const data = await openapi.extract(oaCtx);
      const tool = data.tools.find((t: any) => t.name === body.tool);
      if (!tool) return c.json({ error: `tool ${body.tool} not found` }, 404);
      const kind = tool.action?.kind;
      const handler = (openapi.actions as any)[kind];
      if (!handler) return c.json({ error: "no action handler" }, 500);
      // Inject a token resolver bound to (env, user_id) so the openapi action
      // can auto-authenticate against the calling user's connected providers.
      const user_id = c.var.auth?.user_id;
      const resolveToken = async (host: string) => {
        // Build a dummy URL from the host so we can reuse the resolver.
        const target = `https://${host}`;
        const r = await resolveTokenForUrl(c.env, user_id, target);
        return r?.access_token || null;
      };
      const value = await handler({
        ...tool.action,
        args: body.args || {},
        resolveToken,
      });
      return c.json({ ok: true, value });
    } catch (err: any) {
      return c.json({ ok: false, error: String(err?.message || err) }, 500);
    }
  }

  // JSON-LD path: re-fetch, find tool, return static result
  try {
    const page = await fetchAndParse(body.url);
    const jc = jsonld.detect({
      jsonld: page.jsonld,
      meta: page.meta,
      url: body.url,
      title: page.title,
    });
    if (!jc) return c.json({ error: "no tools for url" }, 404);
    const data = await jsonld.extract(jc);
    const tool = data.tools.find((t: any) => t.name === body.tool);
    if (!tool) return c.json({ error: `tool ${body.tool} not found` }, 404);
    return c.json({ ok: true, value: tool.result });
  } catch (err: any) {
    return c.json({ ok: false, error: String(err?.message || err) }, 502);
  }
});

/**
 * POST /api/v1/cache
 * { url, payload }
 * Extension pushes a pre-extracted schema for sites we can't fetch server-side.
 * v0 is unauthenticated for local dev; add a shared secret before public deploy.
 */
app.post("/api/v1/cache", gate("push"), async (c) => {
  const body = await c.req.json<{ url: string; payload: any }>().catch(() => null);
  if (!body?.url || !body.payload) return c.json({ error: "url and payload required" }, 400);
  await writeCache(c.env, body.url, body.payload, 7 * 86400);
  return c.json({ ok: true, key: cacheKey(body.url), pushed_by: c.var.auth.user_id });
});

// --------------------- key management ---------------------

/** Issue a key (admin only). For local dev use ADMIN_TOKEN=devadmin. */
app.post("/api/v1/keys", async (c) => {
  const adminHeader = c.req.header("x-admin-token");
  const adminEnv = c.env.ADMIN_TOKEN || (c.env.ENVIRONMENT === "development" ? "devadmin" : null);
  if (!adminEnv || adminHeader !== adminEnv) return c.json({ error: "admin only" }, 401);
  const body = await c.req.json<{ user_id: string; plan: Plan; stripe_sub_id?: string }>();
  if (!body?.user_id || !body.plan) return c.json({ error: "user_id and plan required" }, 400);
  const key = await issueKey(c.env, body.user_id, body.plan, body.stripe_sub_id);
  return c.json({ ok: true, key, plan: body.plan });
});

app.post("/api/v1/keys/revoke", async (c) => {
  const adminHeader = c.req.header("x-admin-token");
  const adminEnv = c.env.ADMIN_TOKEN || (c.env.ENVIRONMENT === "development" ? "devadmin" : null);
  if (!adminEnv || adminHeader !== adminEnv) return c.json({ error: "admin only" }, 401);
  const body = await c.req.json<{ key: string }>();
  const ok = await revokeKey(c.env, body.key);
  return c.json({ ok });
});

app.get("/api/v1/keys/me", gate("read"), async (c) => {
  const a = c.var.auth;
  return c.json({
    key: a.anonymous ? null : a.key,
    plan: a.plan,
    user_id: a.user_id,
    anonymous: a.anonymous,
  });
});

// --------------------- stripe ---------------------

app.post("/api/v1/stripe/webhook", async (c) => stripeWebhook(c as any));
app.post("/api/v1/stripe/checkout", async (c) => createCheckout(c as any));
app.get("/api/v1/keys/by-checkout", async (c) => keyByCheckout(c as any));
app.post("/api/v1/keys/recover", async (c) => recoverByEmail(c as any));

// --------------------- dashboard ---------------------

app.get("/dashboard", (c) => c.html(dashboardHtml(new URL(c.req.url).origin)));

// /dashboard/submissions — admin inbox for directory submissions.
// Page itself is public (noindex); actions gated by x-admin-token entered
// in the UI + persisted to localStorage.
app.get("/dashboard/submissions", async (c) => {
  const { submissionsInboxHtml } = await import("./submissions_inbox");
  return c.html(submissionsInboxHtml(new URL(c.req.url).origin));
});

// --------------------- oauth (Phase A: sign-in) ---------------------

app.get("/api/v1/auth/github/start", async (c) => githubStart(c as any));
app.get("/api/v1/auth/github/callback", async (c) => githubCallback(c as any));
app.post("/api/v1/auth/logout", async (c) => logout(c as any));
app.get("/api/v1/me", async (c) => me(c as any));
app.post("/api/v1/me/keys", async (c) => issueOwnKey(c as any));

// --------------------- providers (Phase B: per-provider OAuth + API key) ---------------------

app.get("/api/v1/providers", async (c) => getProviders(c as any));
app.get("/api/v1/me/connections", async (c) => getMyConnections(c as any));
app.get("/api/v1/providers/:id/start", async (c) => providerStart(c as any));
app.get("/api/v1/providers/:id/callback", async (c) => providerCallback(c as any));
app.post("/api/v1/providers/:id/api-key", async (c) => providerSaveApiKey(c as any));
app.post("/api/v1/providers/:id/disconnect", async (c) => providerDisconnect(c as any));

// Anthropic-specific OOB PKCE exchange (after user pastes the code from claude.ai)
app.post("/api/v1/providers/anthropic/exchange", async (c) => {
  const { anthropicExchange } = await import("./anthropic_oauth");
  return anthropicExchange(c as any);
});

// --------------------- admin: manual seed trigger ---------------------
// Same code path as the cron — but on-demand. Useful for verifying after
// updating the seed_stores:list KV or for one-off pushes before a launch.
app.post("/api/v1/admin/seed-now", (c) => runSeedNow(c as any));
app.post("/api/v1/admin/seed-stores", (c) => addSeedStores(c as any));

// Default export — Cloudflare Workers expects `fetch` and (since we added
// crons) `scheduled` as named handlers on the default export.
export default {
  fetch: app.fetch,
  scheduled: scheduledHandler,
};
