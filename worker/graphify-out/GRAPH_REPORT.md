# Graph Report - worker  (2026-06-03)

## Corpus Check
- 176 files · ~313,382 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 880 nodes · 1509 edges · 121 communities (118 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `04bc93eb`
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
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 94|Community 94]]
- [[_COMMUNITY_Community 119|Community 119]]
- [[_COMMUNITY_Community 120|Community 120]]

## God Nodes (most connected - your core abstractions)
1. `integrationPageHtml()` - 20 edges
2. `recordGrade()` - 19 edges
3. `resolveAuth()` - 18 edges
4. `scoreMcpServer()` - 18 edges
5. `stripeWebhook()` - 16 edges
6. `dropPageHtml()` - 15 edges
7. `compilerOptions` - 14 edges
8. `readGrade()` - 13 edges
9. `uiCss()` - 13 edges
10. `uiNav()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `oracleHandler()` --calls--> `verifyMcpServer()`  [INFERRED]
  src/mcp_oracle.ts → src/verify.ts
- `fire()` --calls--> `stripeWebhook()`  [EXTRACTED]
  test/connections.test.ts → src/stripe.ts
- `fire()` --calls--> `stripeWebhook()`  [EXTRACTED]
  test/mcp_skus.test.ts → src/stripe.ts
- `fireSigned()` --calls--> `stripeWebhook()`  [EXTRACTED]
  test/money-path.test.ts → src/stripe.ts
- `post()` --calls--> `makeCtx()`  [EXTRACTED]
  test/mcp_oracle.test.ts → test/helpers.ts

## Import Cycles
- None detected.

## Communities (121 total, 3 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (60): Action, AuthCtx, Bindings, consume(), gate(), issueKey(), KeyRecord, Plan (+52 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (51): bearer(), resolveAuth(), b64urlDecode(), b64urlEncode(), claimStart(), claimVerify(), ctEqual(), Env (+43 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (59): anthropicExchange(), anthropicStart(), bytesToBase64Url(), Env, generatePkce(), randomState(), requireUser(), b64url() (+51 more)

### Community 3 - "Community 3"
Cohesion: 0.40
Nodes (13): deriveCategory(), letter(), clamp(), getJson(), getText(), ghFromUrls(), scanGitHubSource(), scoreMcpGitHubRepo() (+5 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (27): BEST_DEFS, BestDef, BESTOF, CAT_ORDER, COMBO_SETS, COMBO_STORES, COMBOS, CURATED (+19 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (25): blockedTargetReason(), callMcp(), CATEGORIES, composite(), DriftOutcome, Env, finalizeSseLimited(), Finding (+17 more)

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
Cohesion: 0.09
Nodes (35): AlertEnv, fireAlert(), captureDirectorySubmission(), Env, sanitize(), SubmitBody, validEmail(), validUrl() (+27 more)

### Community 10 - "Community 10"
Cohesion: 0.20
Nodes (18): AgentControl, AUDIT(), AuditEntry, checkAgentAllowed(), CTL(), Env, getControl(), getUsage() (+10 more)

### Community 11 - "Community 11"
Cohesion: 0.10
Nodes (20): DE, EN, ES, FR, GenBlock, GenStrings, IT, JA (+12 more)

### Community 12 - "Community 12"
Cohesion: 0.11
Nodes (18): A) Buy the domain, A) Create a Stripe account, B) Add it as a zone, B) Create products + prices, C) Bind the worker to the domain, C) Configure the webhook, Cost estimate (real numbers), D) Set the secrets (+10 more)

### Community 13 - "Community 13"
Cohesion: 0.14
Nodes (12): AFFILIATE, affiliateButtons(), AffiliateNet, esc(), Article, ArticleFaq, articleHtml(), ARTICLES (+4 more)

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
Cohesion: 0.21
Nodes (9): ARTICLE_SLUGS, baseCss(), CacheEntry, escapeHtml(), hostnameOf(), notFoundHtml(), PROVIDER_BADGE, relTime() (+1 more)

### Community 19 - "Community 19"
Cohesion: 0.19
Nodes (9): gradeRank(), readGrade(), recordGrade(), reputationFeed(), decide(), Env, gradeForVerify(), verifyMcpServer() (+1 more)

### Community 20 - "Community 20"
Cohesion: 0.21
Nodes (11): Env, gradeFor(), gradeSummary(), jerr(), jrpc(), oracleHandler(), recommendation(), SUPPORTED (+3 more)

### Community 21 - "Community 21"
Cohesion: 0.18
Nodes (7): drafts, OUT, posts, ROOT, seen, stripFrontmatter(), synthDescription()

### Community 22 - "Community 22"
Cohesion: 0.33
Nodes (8): articlesIndexHtml(), directoryHtml(), badgeHubHtml(), stateOfMcpSecurityHtml(), metricsPageHtml(), emailCapture(), uiCss(), uiNav()

### Community 23 - "Community 23"
Cohesion: 0.32
Nodes (9): blogIndexHtml(), blogPostHtml(), escapeHtml(), escapeJson(), footerHtml(), navHtml(), BLOG_POSTS, BLOG_SLUGS (+1 more)

### Community 24 - "Community 24"
Cohesion: 0.24
Nodes (7): Env, getLeads(), getLeadsResponse(), Lead, recentDays(), scoreLead(), todayUTC()

### Community 25 - "Community 25"
Cohesion: 0.33
Nodes (6): agentReadyApiHtml(), agentReadyVerticalHtml(), VerticalChromeOpts, agentReadyDocsHtml(), agentReadySaasHtml(), agentReadyShopifyHtml()

### Community 26 - "Community 26"
Cohesion: 0.22
Nodes (8): baseDomain(), COLOR, computeMcpSecurityReport(), family(), FINDING_EXCLUDE, FINDING_LABELS, FindingFreq, McpReportStats

### Community 27 - "Community 27"
Cohesion: 0.33
Nodes (7): base64urlEncode(), bridgeDescriptor(), slim(), SlimTool, webmcpHubHtml(), webmcpShimJs(), tools

### Community 28 - "Community 28"
Cohesion: 0.24
Nodes (9): BestLoc, BESTOF_I18N, GLOSS_I18N, GlossLoc, NEn, SHORT_LIST, WHAT_IS, FaqT (+1 more)

### Community 29 - "Community 29"
Cohesion: 0.29
Nodes (6): Architecture, Deploy, Endpoints, Local dev, Notes & limits, WebMCP Anything — Worker

### Community 30 - "Community 30"
Cohesion: 0.27
Nodes (6): adSlot(), CAT_LABEL, connectHubHtml(), CATEGORY_NAMES, categorySlug(), mcpLeaderboardHtml()

### Community 31 - "Community 31"
Cohesion: 0.29
Nodes (6): LANGS, DROP_PAGES, DROP_SLUGS, dropUrl(), isLocalizable(), LOCALIZABLE_SLUGS

### Community 32 - "Community 32"
Cohesion: 0.22
Nodes (5): BehaviorSummary, diffTools(), GradeResult, goodTool, MockOpts

### Community 33 - "Community 33"
Cohesion: 0.60
Nodes (4): badgeHandler(), Env, PILL_INDEXED(), PILL_VERIFIED()

### Community 34 - "Community 34"
Cohesion: 0.60
Nodes (4): embedHtml(), Env, escapeHtml(), verifyEmbedHandler()

### Community 120 - "Community 120"
Cohesion: 0.43
Nodes (6): Flow, inferSchema(), safeJson(), synthesizeFromFlows(), SynthResult, templatePath()

## Knowledge Gaps
- **200 isolated node(s):** `name`, `version`, `private`, `description`, `type` (+195 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `LOCALIZED_LANGS` connect `Community 14` to `Community 4`, `Community 9`, `Community 11`, `Community 18`, `Community 31`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `mcpProxyHandler()` connect `Community 10` to `Community 0`, `Community 2`, `Community 3`, `Community 15`, `Community 19`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `resolveAuth()` connect `Community 1` to `Community 0`, `Community 2`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _200 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.060126582278481014 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06253652834599649 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06086956521739131 - nodes in this community are weakly interconnected._