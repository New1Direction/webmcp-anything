import { Hono } from "hono";
import { cors } from "hono/cors";
// shopify + jsonld are still used directly by /api/v1/debug; the full adapter
// cascade + CRYPTO_ADAPTERS now live in ./engine (shared with the MCP server).
import * as shopify from "../../adapters/shopify.js";
import * as jsonld from "../../adapters/jsonld.js";
import { fetchAndParse } from "./html";
import { landingHtml } from "./landing";
import { dashboardHtml } from "./dashboard";
import { directoryHtml } from "./directory";
import { ogSvg } from "./og";
import { scheduledHandler, runSeedNow, addSeedStores, submitSeoIndexNow } from "./scheduled";
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
import { gate, proxyExecuteGate, issueKey, revokeKey, type AuthCtx, type Plan } from "./auth";
import {
  stripeWebhook,
  createCheckout,
  keyByCheckout,
  recoverByEmail,
  createDirectoryVerifiedCheckout,
  createFixCheckout,
  createManagedConnectionCheckout,
  createDeepAuditCheckout,
  createMonitorCheckout,
} from "./stripe";
import { listManagedConnections } from "./connections";
import { track } from "./metrics";
import { resolveTools, executeTool, cacheKey, normalizeUrl, writeCache } from "./engine";

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
  LEAD_ALERT_WEBHOOK?: string;
};

type Variables = { auth: AuthCtx };

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();
// Scoped first so MCP clients' preflight (Authorization / MCP-Protocol-Version /
// Mcp-Session-Id) is allowed; the global rule below covers everything else.
app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization", "Accept", "Mcp-Session-Id", "MCP-Protocol-Version", "Last-Event-ID"],
  exposeHeaders: ["Mcp-Session-Id", "MCP-Protocol-Version"],
  maxAge: 86400,
}));

// --------------------- helpers ---------------------
// cacheKey / normalizeUrl / writeCache (and the extraction/execution cascade
// resolveTools/executeTool) are imported from ./engine — one source of truth
// shared by the REST API and the MCP server.

// --------------------- routes ---------------------

app.get("/", (c) => c.html(landingHtml(new URL(c.req.url).origin)));

// Privacy policy — required by the Chrome Web Store listing (host_permissions).
app.get("/privacy", async (c) => {
  const { privacyHtml } = await import("./privacy");
  return c.html(privacyHtml(new URL(c.req.url).origin));
});

// Server-driven add-to-cart selectors for the QuickCatch extension. Edit
// src/selectors.ts + deploy to fix a store without a Web Store update.
app.get("/api/v1/selectors", async (c) => {
  const { SELECTOR_CONFIG } = await import("./selectors");
  return c.json(SELECTOR_CONFIG, 200, { "cache-control": "public, max-age=3600, s-maxage=3600" });
});

// QuickCatch drop/restock SEO pages (programmatic) + built-in funnel.
// English at /drops + /drops/:slug; localized (es/fr/de/pt/it) at
// /drops/:lang + /drops/:lang/:slug. hreflang links the variants.
app.get("/drops", async (c) => {
  const { dropsIndexHtml } = await import("./drops_seo");
  return c.html(dropsIndexHtml(new URL(c.req.url).origin, "en"));
});
app.get("/drops/:a", async (c) => {
  const a = c.req.param("a");
  const { DROP_PAGES, dropPageHtml, dropsIndexHtml, LOCALIZED_LANGS } = await import("./drops_seo");
  const origin = new URL(c.req.url).origin;
  // /drops/<lang> → localized index
  if ((LOCALIZED_LANGS as readonly string[]).includes(a)) return c.html(dropsIndexHtml(origin, a as any));
  // /drops/<slug> → English page
  const page = DROP_PAGES.find((p) => p.slug === a);
  if (!page) return c.notFound();
  return c.html(dropPageHtml(origin, page, "en"));
});
app.get("/drops/:lang/:slug", async (c) => {
  const lang = c.req.param("lang");
  const slug = c.req.param("slug");
  const { DROP_PAGES, dropPageHtml, isLocalizable, LOCALIZED_LANGS } = await import("./drops_seo");
  if (!(LOCALIZED_LANGS as readonly string[]).includes(lang)) return c.notFound();
  const page = DROP_PAGES.find((p) => p.slug === slug);
  if (!page || !isLocalizable(page)) return c.notFound();
  return c.html(dropPageHtml(new URL(c.req.url).origin, page, lang as any));
});

// Free lead-gen tools (engineering-as-marketing) + built-in funnel.
app.get("/tools", async (c) => {
  const { toolsIndexHtml } = await import("./tools");
  return c.html(toolsIndexHtml(new URL(c.req.url).origin, "en"));
});
app.get("/tools/pokemon-resale-calculator", async (c) => {
  const { resaleCalculatorHtml } = await import("./tools");
  return c.html(resaleCalculatorHtml(new URL(c.req.url).origin, "en"));
});
app.get("/tools/pokemon-grading-calculator", async (c) => {
  const { gradingCalculatorHtml } = await import("./tools");
  return c.html(gradingCalculatorHtml(new URL(c.req.url).origin));
});
app.get("/tools/:lang/pokemon-resale-calculator", async (c) => {
  const lang = c.req.param("lang");
  const { resaleCalculatorHtml, LOCALIZED_LANGS } = await import("./tools");
  if (!(LOCALIZED_LANGS as readonly string[]).includes(lang)) return c.notFound();
  return c.html(resaleCalculatorHtml(new URL(c.req.url).origin, lang as any));
});
app.get("/tools/:lang", async (c) => {
  const lang = c.req.param("lang");
  const { toolsIndexHtml, LOCALIZED_LANGS } = await import("./tools");
  if (!(LOCALIZED_LANGS as readonly string[]).includes(lang)) return c.notFound();
  return c.html(toolsIndexHtml(new URL(c.req.url).origin, lang as any));
});

app.get("/api/v1/health", (c) =>
  c.json({ ok: true, version: "0.1.0", env: c.env.ENVIRONMENT })
);

// Browsers request /favicon.ico by default on every page → redirect to the SVG
// (served from public/) so it's never a 404.
app.get("/favicon.ico", (c) => c.redirect("/favicon.svg", 302));

app.get("/api/v1/stats/public", async (c) => {
  const raw = await c.env.CACHE.get("stats:total_cached");
  const cached_urls = raw ? parseInt(raw, 10) || 0 : 0;
  // Live count of graded MCP servers (grade:* keys) — social proof that grows
  // itself via the cron registry land-grab. Paginated + capped; response cached.
  let graded_servers = 0;
  try {
    let cursor: string | undefined;
    let pages = 0;
    do {
      const r: any = await c.env.CACHE.list({ prefix: "grade:", limit: 1000, cursor });
      graded_servers += r.keys.length;
      cursor = r.list_complete ? undefined : r.cursor;
      pages++;
    } while (cursor && pages < 5);
  } catch {}
  return c.json({ cached_urls, graded_servers }, 200, {
    "cache-control": "public, max-age=600, s-maxage=600",
  });
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

app.get("/directory", (c) => {
  track(c.env, c.executionCtx, "directory_view");
  return c.html(directoryHtml(new URL(c.req.url).origin));
});

// Public connect/discovery hub — the conversion destination registries +
// launch posts point at (graded + vaulted + metered, no sign-in wall).
app.get("/connect", async (c) => {
  const { connectHubHtml } = await import("./connect_hub");
  return new Response(connectHubHtml(new URL(c.req.url).origin), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=900, s-maxage=900",
    },
  });
});

// Discovery manifest — a crawlable list of the MCP servers wmcp.sh hosts
// (trust oracle + vaulted proxies), derived from PROVIDERS so it can't drift.
app.get("/.well-known/mcp", async (c) => {
  const { wellKnownMcpManifest } = await import("./connect_hub");
  return c.json(wellKnownMcpManifest(new URL(c.req.url).origin), 200, {
    "cache-control": "public, max-age=900, s-maxage=900",
  });
});

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
  const m = await import("./mcp_proxy");
  // Crawlers/browsers get an indexable HTML catalog (GEO); agents get JSON.
  const accept = c.req.header("accept") || "";
  if (c.req.query("format") !== "json" && accept.includes("text/html")) {
    return new Response(m.mcpIndexHtml(new URL(c.req.url).origin), {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=900, s-maxage=900",
      },
    });
  }
  return m.listMcpProxies(c as any);
});

// Real MCP server for wmcp.sh's OWN extracted tools (distinct from the
// /mcp/:provider OAuth proxy below). Registered BEFORE :provider so the static
// "u"/"url" segments win; POST does JSON-RPC, GET → 405 (no SSE). The 'u'/'url'
// words are not provider ids, so there is no collision with the proxy.
app.post("/mcp/url", async (c) => {
  const { mcpHandler } = await import("./mcp_server");
  return mcpHandler(c as any);
});
app.get("/mcp/url", async (c) => {
  const { mcpMethodNotAllowed } = await import("./mcp_server");
  return mcpMethodNotAllowed(c as any);
});
app.post("/mcp/u/:encoded", async (c) => {
  const { mcpHandler } = await import("./mcp_server");
  return mcpHandler(c as any);
});
app.get("/mcp/u/:encoded", async (c) => {
  const { mcpMethodNotAllowed } = await import("./mcp_server");
  return mcpMethodNotAllowed(c as any);
});
// Saved toolset → one composed MCP server. Resolves its stored URL bundle.
app.post("/mcp/set/:id", async (c) => {
  const { mcpHandler } = await import("./mcp_server");
  return mcpHandler(c as any);
});
app.get("/mcp/set/:id", async (c) => {
  const { mcpMethodNotAllowed } = await import("./mcp_server");
  return mcpMethodNotAllowed(c as any);
});

// ---- Independent MCP trust grade (free, public). Registered BEFORE the
// /mcp/:provider proxy so "grade" isn't swallowed as a provider id. ----
// The MCP Trust Leaderboard — public ranking of every graded server (the moat).
app.get("/mcp/leaderboard", async (c) => {
  const { mcpLeaderboardHtml } = await import("./mcp_grade");
  const html = await mcpLeaderboardHtml(c.env as any, new URL(c.req.url).origin);
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=900, s-maxage=900" } });
});

app.get("/mcp/grade", async (c) => {
  const { gradeHomeHtml } = await import("./mcp_grade");
  return c.html(gradeHomeHtml(new URL(c.req.url).origin));
});
// gate("read") draws anonymous callers down the 100/day-per-IP budget so the
// free CTA can't be looped into a reflective-probe / KV-write DoS. Both routes
// serve a cached grade (<6h) first and only do a live probe on a cold miss; a
// forced fresh re-probe (fresh=1) is restricted to authenticated callers.
app.get("/api/v1/mcp/grade", gate("read"), async (c) => {
  const url = c.req.query("url");
  if (!url) return c.json({ error: "url_required" }, 400);
  const { scoreMcpServer, recordGrade, readGrade } = await import("./mcp_grade");
  try {
    let host = url;
    try { host = new URL(url).host.toLowerCase(); } catch {}
    const allowFresh = c.req.query("fresh") === "1" && !c.var.auth?.anonymous;
    if (!allowFresh) {
      const cached = await readGrade(c.env as any, host);
      if (cached && Date.now() - cached.checked_at < 6 * 3600 * 1000) return c.json(cached);
    }
    const r = await scoreMcpServer(url); // SSRF-guarded inside
    await recordGrade(c.env as any, r); // drift-aware persist + registers the watch
    return c.json(r);
  } catch (e) {
    return c.json({ error: "grade_failed", detail: String(e).slice(0, 200) }, 502);
  }
});
// Verify-then-execute (liability transfer): one call that returns the watched
// trust grade + drift status + a connect/caution/avoid verdict for an MCP server.
// Free read-tier (the grade is never for sale). fresh=1 forces a live re-probe,
// authenticated callers only (anon gets the cached grade).
app.get("/api/v1/mcp/verify", gate("read"), async (c) => {
  const url = c.req.query("url");
  if (!url) return c.json({ error: "url query param required" }, 400);
  const fresh = c.req.query("fresh") === "1" && !c.var.auth?.anonymous;
  try {
    const { verifyMcpServer } = await import("./verify");
    return c.json(await verifyMcpServer(c.env as any, url, { fresh }));
  } catch (e) {
    return c.json({ error: "verify_failed", detail: String(e).slice(0, 200) }, 502);
  }
});
app.get("/mcp/grade/:host/badge.svg", async (c) => {
  const host = c.req.param("host");
  const { readGrade, gradeBadgeSvg } = await import("./mcp_grade");
  const r = await readGrade(c.env as any, host);
  const svg = r
    ? gradeBadgeSvg(r)
    : `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="190" height="44" role="img"><rect width="190" height="44" rx="10" fill="#11111c" stroke="#26263a"/><text x="12" y="27" font-family="sans-serif" font-size="11" fill="#8a8aa8">not yet graded · wmcp.sh</text></svg>`;
  return c.body(svg, 200, { "content-type": "image/svg+xml; charset=utf-8", "cache-control": "public, max-age=3600" });
});
app.get("/mcp/grade/:host", async (c) => {
  const host = c.req.param("host");
  const origin = new URL(c.req.url).origin;
  const { readGrade, scoreMcpServer, recordGrade, gradePageHtml } = await import("./mcp_grade");
  let r = await readGrade(c.env as any, host);
  if (!r) {
    // Not cached — grade the conventional endpoint (or an explicit ?url=).
    const url = c.req.query("url") || `https://${host}/mcp`;
    try { r = await scoreMcpServer(url); await recordGrade(c.env as any, r); } catch {}
  }
  if (!r) return c.html(gradePageHtml({ url: `https://${host}`, host, checked_at: Date.now(), reachable: false, auth_required: false, grade: "F", score: 0, sub: {}, findings: [{ id: "reachable", severity: "fail", detail: "Could not reach an MCP server at this host." }], tools_count: 0 } as any, origin), 200);
  return c.html(gradePageHtml(r, origin));
});

// Agent-callable MCP trust oracle (grade_mcp_server / check_mcp_drift). Free
// read-tier so agents can gate connections on our grade. BEFORE /mcp/:provider.
app.all("/mcp/trust", gate("read"), async (c) => {
  const { oracleHandler } = await import("./mcp_oracle");
  return oracleHandler(c as any);
});

// proxyExecuteGate (not gate("execute")): same paid-plan execute quota, PLUS the
// per-agent free tier when PROXY_FREE_CALLS_PER_DAY is set (default-off → free
// plan still 402s, identical to before). The pricing flip that lets agents
// activate before the paywall.
app.all("/mcp/:provider", proxyExecuteGate(), async (c) => {
  const { mcpProxyHandler } = await import("./mcp_proxy");
  return mcpProxyHandler(c as any);
});
// Match subpaths too (rare with MCP servers but harmless to support).
app.all("/mcp/:provider/*", proxyExecuteGate(), async (c) => {
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
// Funnel analytics rollup (x-admin-token gated) — totals + per-day + conversion.
app.get("/api/v1/admin/metrics", async (c) => {
  const m = await import("./metrics");
  return m.getMetrics(c as any);
});
// Buyer-finding funnel: ranked prospect list from real account/usage signals.
app.get("/api/v1/admin/leads", async (c) => {
  const m = await import("./leads");
  return m.getLeadsResponse(c as any);
});
app.get("/dashboard/leads", async (c) => {
  const m = await import("./leads_page");
  return c.html(m.leadsPageHtml());
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
  track(c.env, c.executionCtx, "u_view");
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
  track(c.env, c.executionCtx, "probe_run");
  const fresh = c.req.query("fresh") === "1";

  const r = await resolveTools(c.env, c.executionCtx, url, {
    fresh,
    authUserId: c.var.auth?.user_id,
  });
  if (!r.ok) return c.json(r.body, r.status as any);
  return c.json({
    ...r.payload,
    from: r.from,
    ...(r.cached_at !== undefined ? { cached_at: r.cached_at } : {}),
  });
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

  const r = await executeTool(
    c.env,
    { url: body.url, tool: body.tool, args: body.args },
    { userId: c.var.auth?.user_id }
  );
  if (r.ok) {
    // The activation that actually matters — a live tool call succeeded.
    track(c.env, c.executionCtx, "activated");
    return c.json({ ok: true, value: r.value });
  }
  return c.json(r.body, r.status as any);
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

// --------------------- self-serve directory Verified + Agent-Ready Fix ------
// Ownership claim (meta-tag) gates the Verified purchase; both SKUs are
// fulfilled by the fail-closed webhook branch — they never mint an API key.
app.get("/api/v1/directory/claim/start", async (c) => {
  const m = await import("./directory_claim");
  return m.claimStart(c as any);
});
app.post("/api/v1/directory/claim/verify", async (c) => {
  const m = await import("./directory_claim");
  return m.claimVerify(c as any);
});
app.post("/api/v1/directory/verified/checkout", async (c) => createDirectoryVerifiedCheckout(c as any));
app.post("/api/v1/agent-ready/fix/checkout", async (c) => createFixCheckout(c as any));
// Per-connection managed OAuth-proxy subscription (the moat's revenue model).
app.post("/api/v1/connections/checkout", async (c) => createManagedConnectionCheckout(c as any));
app.get("/api/v1/connections", async (c) => listManagedConnections(c as any));

// ---- Agent control plane: per-agent metering + budget caps + kill switch +
// audit, governing tool access across ALL proxied providers from one point.
// Auth = the account (API key or session); resolveAuth handles both.
app.get("/api/v1/agent/usage", async (c) => {
  const { resolveAuth } = await import("./auth");
  const auth = await resolveAuth(c as any);
  if (auth.anonymous) return c.json({ error: "sign_in_required" }, 401);
  const { getUsage } = await import("./control");
  return c.json(await getUsage(c.env as any, auth.user_id));
});
app.get("/api/v1/agent/audit", async (c) => {
  const { resolveAuth } = await import("./auth");
  const auth = await resolveAuth(c as any);
  if (auth.anonymous) return c.json({ error: "sign_in_required" }, 401);
  const limit = parseInt(c.req.query("limit") || "50", 10);
  const { readAudit } = await import("./control");
  return c.json({ user_id: auth.user_id, entries: await readAudit(c.env as any, auth.user_id, limit) });
});
// Set the kill switch and/or the daily tool-call cap. Body: {killed?, daily_cap?}.
// killed:true instantly 403s this account's tool access across every provider.
app.post("/api/v1/agent/control", async (c) => {
  const { resolveAuth } = await import("./auth");
  const auth = await resolveAuth(c as any);
  if (auth.anonymous) return c.json({ error: "sign_in_required", hint: "Sign in or pass your API key to govern your agent." }, 401);
  const body = await c.req.json<{ killed?: boolean; daily_cap?: number | null }>().catch(() => ({} as { killed?: boolean; daily_cap?: number | null }));
  const patch: { killed?: boolean; daily_cap?: number } = {};
  if (typeof body.killed === "boolean") patch.killed = body.killed;
  if (body.daily_cap === null) patch.daily_cap = 0; // 0 clears the cap (normalized in setControl)
  else if (typeof body.daily_cap === "number") patch.daily_cap = body.daily_cap;
  if (Object.keys(patch).length === 0) return c.json({ error: "nothing_to_set", hint: "Pass killed (bool) and/or daily_cap (number, null to clear)." }, 400);
  const { setControl } = await import("./control");
  const next = await setControl(c.env as any, auth.user_id, patch);
  return c.json({ ok: true, control: next });
});

// MCP trust-authority monetization SKUs (sold off the grade page).
app.post("/api/v1/mcp/deep-audit/checkout", async (c) => createDeepAuditCheckout(c as any));
app.post("/api/v1/mcp/monitor/checkout", async (c) => createMonitorCheckout(c as any));

// ===== WebMCP↔MCP dual-emit bridge — one extraction, BOTH protocols =====
// Free distribution wedge: every emitted shim routes its live tool-calls through
// the graded/metered /api/v1/tools/execute path. The "close the gap" deliverable.
app.get("/api/v1/webmcp", async (c) => {
  const url = c.req.query("url");
  if (!url) return c.json({ error: "url_required" }, 400);
  const { resolveTools } = await import("./engine");
  const r = await resolveTools(c.env as any, c.executionCtx as any, url, {});
  if (!r.ok) return c.json({ error: "extract_failed", url }, 502);
  const { bridgeDescriptor } = await import("./webmcp_bridge");
  return c.json(bridgeDescriptor(url, r.payload.tools || [], new URL(c.req.url).origin));
});
// The WebMCP hub — markets the one-line shim + frames wmcp.sh as the default
// WebMCP supplier (land-grab the in-browser side of the standard).
app.get("/webmcp", async (c) => {
  const { webmcpHubHtml } = await import("./webmcp_bridge");
  return new Response(webmcpHubHtml(new URL(c.req.url).origin), {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=900, s-maxage=900" },
  });
});
// Hosted WebMCP shim: <script src="/webmcp/<b64url>.js"> → navigator.modelContext.
app.get("/webmcp/:enc", async (c) => {
  const raw = c.req.param("enc");
  const enc = raw.endsWith(".js") ? raw.slice(0, -3) : raw;
  const { base64urlDecode } = await import("./u");
  let url: string;
  try { url = base64urlDecode(enc); new URL(url); } catch { return c.body("/* wmcp.sh: invalid url */", 400, { "content-type": "application/javascript; charset=utf-8" }); }
  const { resolveTools } = await import("./engine");
  const r = await resolveTools(c.env as any, c.executionCtx as any, url, {});
  const tools = r.ok ? (r.payload.tools || []) : [];
  const { webmcpShimJs } = await import("./webmcp_bridge");
  return c.body(webmcpShimJs(url, tools, new URL(c.req.url).origin), 200, {
    "content-type": "application/javascript; charset=utf-8",
    "cache-control": "public, max-age=1800",
  });
});

// Paid B2B reputation feed — agent-native pay-per-call via x402 (USDC on Base).
// The headline grade stays free (the oracle); THIS full record is metered.
// Config-gated: if X402_PAY_TO is unset, the feed is open (non-breaking); once
// set, each call requires an x402 USDC payment settled by the facilitator.
app.get("/api/v1/mcp/reputation", async (c) => {
  const url = c.req.query("url");
  if (!url) return c.json({ error: "url_required" }, 400);
  const env = c.env as any;
  const { reputationFeed } = await import("./mcp_grade");
  const serve = async () => c.json(await reputationFeed(env, url));

  const payTo = env.X402_PAY_TO;
  if (!payTo) return serve(); // x402 not configured → open, like the Stripe 503 pattern

  const { paymentMiddleware } = await import("x402-hono");
  const mw = paymentMiddleware(
    payTo,
    { "/api/v1/mcp/reputation": { price: env.X402_PRICE || "$0.01", network: (env.X402_NETWORK || "base-sepolia") as any } },
    { url: env.X402_FACILITATOR || "https://x402.org/facilitator" }
  );
  let served: Response | undefined;
  const gateRes = await mw(c as any, async () => { served = await serve(); });
  if (gateRes instanceof Response) return gateRes; // 402 payment required
  return served ?? c.json({ error: "x402_internal" }, 500);
});

// Pay-per-execute via x402 — agents execute ANY tool with a micro-USDC payment,
// no account/API key. The agent-native sibling of the plan-gated /api/v1/execute.
// Only exists when x402 is configured (X402_PAY_TO); otherwise use the plan path.
app.post("/api/v1/x402/execute", async (c) => {
  const env = c.env as any;
  if (!env.X402_PAY_TO) {
    return c.json({ error: "x402_not_configured", hint: "Pay-per-call execute needs X402_PAY_TO. Or use /api/v1/execute with a paid plan/API key." }, 503);
  }
  const body = await c.req.json<{ url?: string; tool?: string; args?: any }>().catch(() => null);
  if (!body?.url || !body?.tool) return c.json({ error: "url_and_tool_required" }, 400);

  const { executeTool } = await import("./engine");
  const serve = async () => {
    const r = await executeTool(env, { url: body.url!, tool: body.tool!, args: body.args }, { userId: "x402" });
    return r.ok ? c.json({ ok: true, value: r.value }) : c.json(r.body ?? { ok: false }, (r.status as any) || 500);
  };

  const { paymentMiddleware } = await import("x402-hono");
  const mw = paymentMiddleware(
    env.X402_PAY_TO,
    { "/api/v1/x402/execute": { price: env.X402_EXECUTE_PRICE || env.X402_PRICE || "$0.02", network: (env.X402_NETWORK || "base-sepolia") as any } },
    { url: env.X402_FACILITATOR || "https://x402.org/facilitator" }
  );
  let served: Response | undefined;
  const gateRes = await mw(c as any, async () => { served = await serve(); });
  if (gateRes instanceof Response) return gateRes; // 402 payment required
  return served ?? c.json({ error: "x402_internal" }, 500);
});

// Saved toolsets (composable MCP servers). Creating one is a paid feature;
// served at /mcp/set/<id>. CRUD here, the MCP endpoint is wired above.
app.post("/api/v1/toolsets", async (c) => {
  const m = await import("./toolsets");
  return m.createToolset(c as any);
});
app.get("/api/v1/toolsets", async (c) => {
  const m = await import("./toolsets");
  return m.listToolsets(c as any);
});
app.delete("/api/v1/toolsets/:id", async (c) => {
  const m = await import("./toolsets");
  return m.deleteToolset(c as any);
});

// Customer-facing UIs for the two self-serve SKUs + the operator metrics view.
app.get("/directory/claim", async (c) => {
  const { claimPageHtml } = await import("./claim_page");
  return c.html(claimPageHtml(new URL(c.req.url).origin));
});
app.get("/agent-ready/fix", async (c) => {
  const { fixPageHtml } = await import("./fix_page");
  return new Response(fixPageHtml(new URL(c.req.url).origin), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=900, s-maxage=900",
    },
  });
});
app.get("/dashboard/metrics", async (c) => {
  const { metricsPageHtml } = await import("./metrics_page");
  return c.html(metricsPageHtml(new URL(c.req.url).origin));
});

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
app.post("/api/v1/admin/seo-indexnow", (c) => submitSeoIndexNow(c as any));

// Default export — Cloudflare Workers expects `fetch` and (since we added
// crons) `scheduled` as named handlers on the default export.
export default {
  fetch: app.fetch,
  scheduled: scheduledHandler,
};
