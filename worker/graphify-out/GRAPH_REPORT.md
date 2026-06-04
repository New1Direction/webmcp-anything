# Graph Report - worker  (2026-06-03)

## Corpus Check
- 176 files · ~355,036 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 884 nodes · 1522 edges · 118 communities (115 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5ac95091`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 94|Community 94]]
- [[_COMMUNITY_Community 119|Community 119]]
- [[_COMMUNITY_Community 120|Community 120]]
- [[_COMMUNITY_Community 121|Community 121]]

## God Nodes (most connected - your core abstractions)
1. `integrationPageHtml()` - 20 edges
2. `recordGrade()` - 19 edges
3. `resolveAuth()` - 18 edges
4. `scoreMcpServer()` - 18 edges
5. `stripeWebhook()` - 16 edges
6. `dropPageHtml()` - 15 edges
7. `uiCss()` - 15 edges
8. `uiNav()` - 15 edges
9. `compilerOptions` - 14 edges
10. `readGrade()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `providerStart()` --calls--> `anthropicStart()`  [INFERRED]
  src/provider_routes.ts → src/anthropic_oauth.ts
- `mcpProxyHandler()` --calls--> `checkAgentAllowed()`  [INFERRED]
  src/mcp_proxy.ts → src/control.ts
- `oracleHandler()` --calls--> `verifyMcpServer()`  [INFERRED]
  src/mcp_oracle.ts → src/verify.ts
- `fire()` --calls--> `stripeWebhook()`  [EXTRACTED]
  test/connections.test.ts → src/stripe.ts
- `fire()` --calls--> `stripeWebhook()`  [EXTRACTED]
  test/mcp_skus.test.ts → src/stripe.ts

## Import Cycles
- None detected.

## Communities (118 total, 3 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (68): Action, AuthCtx, bearer(), Bindings, gate(), issueKey(), KeyRecord, Plan (+60 more)

### Community 1 - "Community 1"
Cohesion: 0.10
Nodes (31): consume(), cacheKey(), CRYPTO_ADAPTERS, EngineEnv, ExecResult, executeCapturedTool(), executeTool(), listCapturedTools() (+23 more)

### Community 2 - "Community 2"
Cohesion: 0.10
Nodes (32): CAT_LABEL, CATEGORY_NAMES, b64url(), ensureMcpClient(), Env, exchangePkceCode(), generatePkceVerifier(), McpClientRecord (+24 more)

### Community 3 - "Community 3"
Cohesion: 0.40
Nodes (13): deriveCategory(), letter(), clamp(), getJson(), getText(), ghFromUrls(), scanGitHubSource(), scoreMcpGitHubRepo() (+5 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (27): BEST_DEFS, BestDef, BESTOF, CAT_ORDER, COMBO_SETS, COMBO_STORES, COMBOS, CURATED (+19 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (24): blockedTargetReason(), callMcp(), CATEGORIES, composite(), DriftOutcome, Env, finalizeSseLimited(), Finding (+16 more)

### Community 6 - "Community 6"
Cohesion: 0.42
Nodes (9): checkAdmin(), deriveSlug(), Env, featureListing(), getDirectoryState(), listSubmissions(), unfeatureListing(), unverifyListing() (+1 more)

### Community 7 - "Community 7"
Cohesion: 0.09
Nodes (22): dependencies, hono, x402-hono, description, devDependencies, @cloudflare/workers-types, marked, typescript (+14 more)

### Community 8 - "Community 8"
Cohesion: 0.16
Nodes (13): integrationAirtableHtml(), integrationAnthropicHtml(), integrationDiscordHtml(), integrationGithubHtml(), integrationGoogleHtml(), integrationLinearHtml(), integrationNotionHtml(), integrationOpenaiHtml() (+5 more)

### Community 9 - "Community 9"
Cohesion: 0.17
Nodes (22): regradeWatched(), seedRegistryGrades(), addGradeServers(), addSeedStores(), cacheKey(), DEFAULT_STORES, Env, gradeManualSeed() (+14 more)

### Community 10 - "Community 10"
Cohesion: 0.21
Nodes (17): AgentControl, AUDIT(), AuditEntry, checkAgentAllowed(), CTL(), Env, getControl(), getUsage() (+9 more)

### Community 11 - "Community 11"
Cohesion: 0.10
Nodes (20): DE, EN, ES, FR, GenBlock, GenStrings, IT, JA (+12 more)

### Community 12 - "Community 12"
Cohesion: 0.11
Nodes (18): A) Buy the domain, A) Create a Stripe account, B) Add it as a zone, B) Create products + prices, C) Bind the worker to the domain, C) Configure the webhook, Cost estimate (real numbers), D) Set the secrets (+10 more)

### Community 13 - "Community 13"
Cohesion: 0.05
Nodes (50): adSlot(), AFFILIATE, affiliateButtons(), AffiliateNet, ebayUrl(), esc(), rawAndPsa(), Article (+42 more)

### Community 14 - "Community 14"
Cohesion: 0.29
Nodes (15): LOCALIZED_LANGS, alternates(), Calc, calcUrl(), css(), esc(), funnelScript(), gradingCalculatorHtml() (+7 more)

### Community 15 - "Community 15"
Cohesion: 0.29
Nodes (8): BehaviorRecord, Env, KEY(), pct(), readBehavior(), recordToolCall(), summarizeBehavior(), ToolStat

### Community 16 - "Community 16"
Cohesion: 0.12
Nodes (15): compilerOptions, allowJs, esModuleInterop, isolatedModules, lib, module, moduleResolution, noEmit (+7 more)

### Community 17 - "Community 17"
Cohesion: 0.25
Nodes (15): fill(), comparisonHtml(), conversionBlock(), dropPageHtml(), dropsIndexHtml(), dropsIndexUrl(), esc(), fieldsFor() (+7 more)

### Community 18 - "Community 18"
Cohesion: 0.14
Nodes (17): blogIndexHtml(), blogPostHtml(), escapeHtml(), escapeJson(), footerHtml(), navHtml(), BLOG_POSTS, BLOG_SLUGS (+9 more)

### Community 19 - "Community 19"
Cohesion: 0.31
Nodes (5): decide(), Env, gradeForVerify(), verifyMcpServer(), VerifyVerdict

### Community 20 - "Community 20"
Cohesion: 0.21
Nodes (11): Env, gradeFor(), gradeSummary(), jerr(), jrpc(), oracleHandler(), recommendation(), SUPPORTED (+3 more)

### Community 21 - "Community 21"
Cohesion: 0.18
Nodes (7): drafts, OUT, posts, ROOT, seen, stripFrontmatter(), synthDescription()

### Community 22 - "Community 22"
Cohesion: 0.29
Nodes (12): b64urlDecode(), b64urlEncode(), claimStart(), claimVerify(), ctEqual(), Env, extractVerifyTokens(), fetchHtml() (+4 more)

### Community 24 - "Community 24"
Cohesion: 0.24
Nodes (7): Env, getLeads(), getLeadsResponse(), Lead, recentDays(), scoreLead(), todayUTC()

### Community 25 - "Community 25"
Cohesion: 0.33
Nodes (6): agentReadyApiHtml(), agentReadyVerticalHtml(), VerticalChromeOpts, agentReadyDocsHtml(), agentReadySaasHtml(), agentReadyShopifyHtml()

### Community 28 - "Community 28"
Cohesion: 0.24
Nodes (9): BestLoc, BESTOF_I18N, GLOSS_I18N, GlossLoc, NEn, SHORT_LIST, WHAT_IS, FaqT (+1 more)

### Community 29 - "Community 29"
Cohesion: 0.29
Nodes (6): Architecture, Deploy, Endpoints, Local dev, Notes & limits, WebMCP Anything — Worker

### Community 31 - "Community 31"
Cohesion: 0.29
Nodes (6): LANGS, DROP_PAGES, DROP_SLUGS, dropUrl(), isLocalizable(), LOCALIZABLE_SLUGS

### Community 32 - "Community 32"
Cohesion: 0.17
Nodes (9): BehaviorSummary, diffTools(), gradeRank(), GradeResult, readGrade(), recordGrade(), reputationFeed(), goodTool (+1 more)

### Community 33 - "Community 33"
Cohesion: 0.60
Nodes (4): badgeHandler(), Env, PILL_INDEXED(), PILL_VERIFIED()

### Community 34 - "Community 34"
Cohesion: 0.60
Nodes (4): embedHtml(), Env, escapeHtml(), verifyEmbedHandler()

### Community 120 - "Community 120"
Cohesion: 0.12
Nodes (30): anthropicExchange(), anthropicStart(), bytesToBase64Url(), Env, generatePkce(), randomState(), requireUser(), Env (+22 more)

### Community 121 - "Community 121"
Cohesion: 0.19
Nodes (14): AlertEnv, fireAlert(), captureDirectorySubmission(), Env, sanitize(), SubmitBody, validEmail(), validUrl() (+6 more)

## Knowledge Gaps
- **200 isolated node(s):** `name`, `version`, `private`, `description`, `type` (+195 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `LOCALIZED_LANGS` connect `Community 14` to `Community 4`, `Community 9`, `Community 11`, `Community 18`, `Community 31`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `mcpProxyHandler()` connect `Community 2` to `Community 0`, `Community 32`, `Community 3`, `Community 10`, `Community 15`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `resolveAuth()` connect `Community 0` to `Community 120`, `Community 1`, `Community 22`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _200 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05418227215980025 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.09682539682539683 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.0975609756097561 - nodes in this community are weakly interconnected._