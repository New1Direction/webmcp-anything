// providers.ts — registry of supported provider OAuth/API-key flows.
//
// Two auth types:
//   - "oauth2"  : standard OAuth 2.0 authorization-code flow (with refresh)
//   - "api_key" : user pastes their own API key; we store it encrypted
//
// New providers: add an entry below. The generic routes in provider_routes.ts
// pick up everything from this table — no per-provider code unless the flow
// is non-standard (token exchange body, refresh handling, etc.).

export type AuthType = "oauth2" | "api_key";

export interface Provider {
  id: string;
  name: string;
  description: string;
  authType: AuthType;

  // OAuth 2.0 — required for authType === "oauth2"
  authUrl?: string;
  tokenUrl?: string;
  scopes?: string; // space-separated
  // Some providers use comma-separated scopes (Slack); express it here
  scopeSeparator?: " " | ",";
  // For Anthropic / Claude Max which use a non-RFC-standard token body
  tokenAuthMethod?: "header" | "body"; // default body
  // User info endpoint for confirming connection + storing display name
  userInfoUrl?: string;
  userInfoHeaders?: Record<string, string>;
  // Optional PKCE — some providers require it (modern OAuth best practice)
  usePKCE?: boolean;

  // API key — required for authType === "api_key"
  apiKeyHint?: string; // e.g. "sk-…"
  apiKeyDocsUrl?: string;

  // Env var names where the OAuth client credentials live
  clientIdSecret?: string;
  clientSecretSecret?: string;

  // Hosts whose URLs this provider's tokens can authenticate.
  // Used by the openapi action handler to auto-inject the user's stored token
  // when their agent calls an API matching one of these hosts.
  apiHosts?: string[];

  // ---- MCP-proxy mode (for OAuth-protected upstream MCP servers) ----
  // If true, this provider hosts an MCP server we expose via /mcp/:id.
  // Agents connect to https://wmcp.sh/mcp/<id> instead of the upstream URL;
  // we inject the user's stored OAuth bearer token transparently.
  mcpProxy?: boolean;
  mcpUrl?: string; // upstream MCP endpoint (e.g. https://mcp.defillama.com/mcp)

  // ---- MCP-spec OAuth (DCR + PKCE-redirect) ----
  // Modern MCP servers register themselves under RFC 7591 (dynamic client
  // registration). Set dcrRegistrationUrl to enable auto-registration —
  // wmcp.sh calls /register once, caches { client_id, client_secret? } in
  // KV under `mcp_client:<provider_id>`, then reuses indefinitely.
  // When set, clientIdSecret / clientSecretSecret are ignored.
  dcrRegistrationUrl?: string;
  // RFC 7636 PKCE with redirect (NOT the OOB pattern used by Anthropic).
  // When true, the start handler generates a code_verifier + S256 challenge,
  // stashes the verifier in the oauth_state KV record, and the callback
  // handler pulls it back to exchange the code.
  usePKCERedirect?: boolean;
  // Marketing copy on connection success
  scopeNotice?: string;

  // Marketing
  category: "auth" | "comms" | "billing" | "dev" | "ai" | "productivity" | "data";
  status: "stable" | "experimental";
  notes?: string;
}

export const PROVIDERS: Record<string, Provider> = {
  // --- Identity / dev ---
  github: {
    id: "github",
    name: "GitHub",
    description: "Repo/issue/gist/workflow tools on the user's behalf.",
    authType: "oauth2",
    authUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    scopes: "read:user user:email repo gist read:org workflow",
    userInfoUrl: "https://api.github.com/user",
    userInfoHeaders: { "user-agent": "wmcp.sh" },
    clientIdSecret: "GITHUB_CLIENT_ID",
    clientSecretSecret: "GITHUB_CLIENT_SECRET",
    apiHosts: ["api.github.com", "uploads.github.com"],
    category: "dev",
    status: "stable",
  },

  // --- Google Workspace ---
  google: {
    id: "google",
    name: "Google",
    description: "Gmail, Calendar, Drive, Sheets, Docs on the user's account.",
    authType: "oauth2",
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scopes:
      "openid email profile " +
      "https://www.googleapis.com/auth/gmail.modify " +
      "https://www.googleapis.com/auth/calendar " +
      "https://www.googleapis.com/auth/drive " +
      "https://www.googleapis.com/auth/spreadsheets",
    userInfoUrl: "https://openidconnect.googleapis.com/v1/userinfo",
    clientIdSecret: "GOOGLE_CLIENT_ID",
    clientSecretSecret: "GOOGLE_CLIENT_SECRET",
    apiHosts: [
      "www.googleapis.com",
      "gmail.googleapis.com",
      "calendar-json.googleapis.com",
      "sheets.googleapis.com",
      "docs.googleapis.com",
      "drive.googleapis.com",
    ],
    category: "productivity",
    status: "stable",
    notes:
      "Google requires consent screen verification before public listing. " +
      "Stays in 'testing' mode for our first 100 users.",
  },

  // --- Billing ---
  stripe: {
    id: "stripe",
    name: "Stripe",
    description: "Manage customers, invoices, products on the user's Stripe account.",
    authType: "oauth2",
    authUrl: "https://connect.stripe.com/oauth/authorize",
    tokenUrl: "https://connect.stripe.com/oauth/token",
    scopes: "read_write",
    userInfoUrl: "https://api.stripe.com/v1/account",
    clientIdSecret: "STRIPE_CONNECT_CLIENT_ID",
    clientSecretSecret: "STRIPE_SECRET_KEY", // Stripe reuses your secret key as the OAuth secret
    apiHosts: ["api.stripe.com"],
    category: "billing",
    status: "stable",
  },

  // --- Comms ---
  slack: {
    id: "slack",
    name: "Slack",
    description: "Post messages, react, manage channels in a user's workspace.",
    authType: "oauth2",
    authUrl: "https://slack.com/oauth/v2/authorize",
    tokenUrl: "https://slack.com/api/oauth.v2.access",
    scopes: "chat:write channels:read channels:history users:read",
    scopeSeparator: ",",
    userInfoUrl: "https://slack.com/api/auth.test",
    clientIdSecret: "SLACK_CLIENT_ID",
    clientSecretSecret: "SLACK_CLIENT_SECRET",
    apiHosts: ["slack.com"],
    category: "comms",
    status: "stable",
  },

  // --- Productivity ---
  // Notion's official OAuth-protected remote MCP. Converted from static-OAuth to
  // MCP-proxy + DCR 2026-05-29 (endpoints verified live against mcp.notion.com
  // metadata: register auth method "none", PKCE S256). Zero operator setup —
  // wmcp.sh self-registers, so NOTION_CLIENT_ID/SECRET are no longer needed.
  notion: {
    id: "notion",
    name: "Notion",
    description:
      "Read/write pages and databases in a user's Notion workspace via Notion's official OAuth-protected remote MCP. Connect once; your agent gets the live Notion tools at /mcp/notion.",
    authType: "oauth2",
    authUrl: "https://mcp.notion.com/authorize",
    tokenUrl: "https://mcp.notion.com/token",
    scopes: "", // Notion advertises no scopes
    usePKCERedirect: true,
    dcrRegistrationUrl: "https://mcp.notion.com/register",
    mcpProxy: true,
    mcpUrl: "https://mcp.notion.com/mcp",
    apiHosts: ["api.notion.com", "mcp.notion.com"],
    category: "productivity",
    status: "experimental",
    scopeNotice:
      "Connect your own Notion workspace via Notion's official remote MCP (mcp.notion.com). wmcp.sh self-registers (RFC 7591 DCR), stores your token encrypted, and proxies tool calls at /mcp/notion — same flow as DefiLlama/Sentry.",
    notes:
      "Converted to MCP-proxy 2026-05-29: RFC 7591 DCR + PKCE (S256), endpoints verified live against mcp.notion.com OAuth metadata. Previously static-OAuth (NOTION_CLIENT_ID/SECRET — now unused).",
  },

  // Linear's official OAuth-protected remote MCP. Converted from static-OAuth to
  // MCP-proxy + DCR 2026-05-29. Note: authorization_endpoint is on linear.app,
  // token + register on the mcp.linear.app subdomain (verified live).
  linear: {
    id: "linear",
    name: "Linear",
    description:
      "Read/write issues, projects, comments in a user's Linear workspace via Linear's official OAuth-protected remote MCP. Connect once; your agent gets the live Linear tools at /mcp/linear.",
    authType: "oauth2",
    authUrl: "https://linear.app/oauth/authorize",
    tokenUrl: "https://mcp.linear.app/oauth/token",
    scopes: "read write issues:create comments:create app:assignable app:mentionable",
    usePKCERedirect: true,
    dcrRegistrationUrl: "https://mcp.linear.app/oauth/register",
    mcpProxy: true,
    mcpUrl: "https://mcp.linear.app/mcp",
    apiHosts: ["api.linear.app", "mcp.linear.app"],
    category: "dev",
    status: "experimental",
    scopeNotice:
      "Connect your own Linear workspace via Linear's official remote MCP (mcp.linear.app). wmcp.sh self-registers (RFC 7591 DCR) — no app setup — stores your token encrypted, and proxies tool calls at /mcp/linear.",
    notes:
      "Converted to MCP-proxy 2026-05-29: RFC 7591 DCR + PKCE (S256). Endpoints verified live against mcp.linear.app metadata (authorization_endpoint on linear.app; token + register on mcp.linear.app). Previously static-OAuth (LINEAR_CLIENT_ID/SECRET — now unused).",
  },

  // --- AI providers ---
  // One connection covers API key creation (org:create_api_key), profile
  // (user:profile), and Claude Pro/Max inference (user:inference). Uses the
  // public Claude Code client_id + PKCE + OOB (out-of-band) callback flow —
  // user copies a code from Anthropic's page, pastes it back into wmcp.sh.
  // Same pattern as Claude Code, OpenCode, pi-ai, Hermes.
  anthropic: {
    id: "anthropic",
    name: "Anthropic (Claude Code + Max)",
    description:
      "API key creation + Claude Pro/Max inference. One connection covers both.",
    authType: "oauth2",
    authUrl: "https://claude.ai/oauth/authorize",
    tokenUrl: "https://console.anthropic.com/v1/oauth/token",
    scopes: "org:create_api_key user:profile user:inference",
    apiHosts: ["api.anthropic.com", "platform.claude.com"],
    category: "ai",
    status: "experimental",
    notes:
      "Uses the Claude Code OAuth client_id with PKCE + OOB callback. " +
      "Gray area under Anthropic ToS — they could revoke client_id at any time. " +
      "OK for research/personal use; production wants a dedicated client_id.",
  },

  openai: {
    id: "openai",
    name: "OpenAI / Codex",
    description:
      "Use the user's OpenAI API for inference + Codex tooling. API-key based (no consumer OAuth available).",
    authType: "api_key",
    apiKeyHint: "sk-…",
    apiKeyDocsUrl: "https://platform.openai.com/api-keys",
    apiHosts: ["api.openai.com"],
    category: "ai",
    status: "stable",
    notes:
      "OpenAI does not expose a consumer OAuth flow for inference. Users paste their " +
      "API key once; we store it encrypted and use it on their behalf.",
  },

  // --- MCP-proxy providers (OAuth-protected upstream MCP servers) ---
  //
  // wmcp.sh acts as an OAuth-bearer-injecting proxy in front of these.
  // Agents point at https://wmcp.sh/mcp/<id> ; we forward to mcpUrl with
  // the user's stored bearer token. Dynamic Client Registration + PKCE
  // means zero per-app env config — wmcp.sh registers itself once.
  defillama: {
    id: "defillama",
    name: "DefiLlama MCP",
    description:
      "23 DeFi analytics tools (TVL, fees, yields, stablecoins, bridges, ETFs, hacks, raises, institutional holdings, etc.) via DefiLlama's official OAuth-protected MCP server. Requires a paid DefiLlama API subscription.",
    authType: "oauth2",
    authUrl: "https://mcp.defillama.com/authorize",
    tokenUrl: "https://mcp.defillama.com/token",
    scopes: "openid",
    usePKCERedirect: true,
    dcrRegistrationUrl: "https://mcp.defillama.com/register",
    mcpProxy: true,
    mcpUrl: "https://mcp.defillama.com/mcp",
    apiHosts: ["mcp.defillama.com"],
    category: "data",
    status: "experimental",
    scopeNotice:
      "Requires an active DefiLlama API subscription. Sign up at https://defillama.com/subscribe.",
    notes:
      "MCP-spec compliant. Uses Dynamic Client Registration (RFC 7591) + PKCE. " +
      "wmcp.sh stores your refresh token encrypted and auto-refreshes every 24h. " +
      "Agents connect to https://wmcp.sh/mcp/defillama instead of the upstream.",
  },

  // Sentry's official remote MCP. Second DCR-based MCP-proxy reference (after
  // defillama). Endpoints verified against mcp.sentry.dev RFC 8414 metadata
  // (registration_endpoint present, S256); /mcp returns 401 + WWW-Authenticate.
  sentry: {
    id: "sentry",
    name: "Sentry MCP",
    description:
      "Sentry's official OAuth-protected remote MCP server — query issues, errors, stack traces, releases, and project health across your Sentry organization (and triage with Seer). Connect once; your agent gets the live Sentry tools.",
    authType: "oauth2",
    authUrl: "https://mcp.sentry.dev/oauth/authorize",
    tokenUrl: "https://mcp.sentry.dev/oauth/token",
    scopes: "org:read project:write team:write event:write",
    usePKCERedirect: true,
    dcrRegistrationUrl: "https://mcp.sentry.dev/oauth/register",
    mcpProxy: true,
    mcpUrl: "https://mcp.sentry.dev/mcp",
    apiHosts: ["mcp.sentry.dev"],
    category: "dev",
    status: "experimental",
    scopeNotice:
      "Authorizes against your Sentry organization via Sentry's official remote MCP (mcp.sentry.dev). wmcp.sh stores your token encrypted and proxies tool calls — same DCR + PKCE flow as DefiLlama.",
    notes:
      "MCP-spec compliant — RFC 7591 Dynamic Client Registration + PKCE (S256), verified against mcp.sentry.dev OAuth metadata. " +
      "Agents connect to https://wmcp.sh/mcp/sentry instead of the upstream; wmcp.sh injects the user's bearer token. " +
      "Scopes are what the server advertises (org:read + project/team/event:write) — narrow to \"org:read\" here for read-only.",
  },

  // Atlassian's official remote MCP (Jira + Confluence). DCR + PKCE verified
  // live against mcp.atlassian.com metadata (offline_access → refresh tokens).
  // Using the streamable-http /v1/mcp endpoint (the /v1/sse variant also works).
  atlassian: {
    id: "atlassian",
    name: "Atlassian (Jira + Confluence)",
    description:
      "Search, read and update Jira issues and Confluence pages in a user's Atlassian site via Atlassian's official OAuth-protected remote MCP. Connect once; your agent gets the live Jira/Confluence tools at /mcp/atlassian.",
    authType: "oauth2",
    authUrl: "https://mcp.atlassian.com/v1/authorize",
    tokenUrl: "https://mcp.atlassian.com/v1/token",
    scopes:
      "read:jira-work read:jira-user write:jira-work read:confluence-content.all read:confluence-space.summary write:confluence-content manage:jira-project read:me read:account offline_access",
    usePKCERedirect: true,
    dcrRegistrationUrl: "https://mcp.atlassian.com/v1/register",
    mcpProxy: true,
    mcpUrl: "https://mcp.atlassian.com/v1/mcp",
    apiHosts: ["mcp.atlassian.com"],
    category: "productivity",
    status: "experimental",
    scopeNotice:
      "Connect your own Atlassian site via Atlassian's official remote MCP (mcp.atlassian.com). wmcp.sh self-registers (RFC 7591 DCR), stores your token encrypted, and proxies tool calls at /mcp/atlassian.",
    notes:
      "RFC 7591 DCR + PKCE (S256), endpoints verified live against mcp.atlassian.com OAuth metadata (offline_access present → refresh tokens). Jira + Confluence scopes as advertised.",
  },

  // Asana's official remote MCP. DCR + PKCE verified live against
  // mcp.asana.com metadata (registration_endpoint /auth/register, S256).
  asana: {
    id: "asana",
    name: "Asana",
    description:
      "Read and update tasks, projects and workspaces in a user's Asana account via Asana's official OAuth-protected remote MCP. Connect once; your agent gets the live Asana tools at /mcp/asana.",
    authType: "oauth2",
    authUrl: "https://mcp.asana.com/auth/authorize",
    tokenUrl: "https://mcp.asana.com/auth/token",
    scopes: "default",
    usePKCERedirect: true,
    dcrRegistrationUrl: "https://mcp.asana.com/auth/register",
    mcpProxy: true,
    mcpUrl: "https://mcp.asana.com/mcp",
    apiHosts: ["mcp.asana.com", "app.asana.com"],
    category: "productivity",
    status: "experimental",
    scopeNotice:
      "Connect your own Asana account via Asana's official remote MCP (mcp.asana.com). wmcp.sh self-registers (RFC 7591 DCR), stores your token encrypted, and proxies tool calls at /mcp/asana.",
    notes:
      "RFC 7591 DCR + PKCE (S256), endpoints verified live against mcp.asana.com OAuth metadata.",
  },

  // PayPal's official remote MCP. DCR + PKCE CONNECT-VERIFIED 2026-05-29: a live
  // POST to /register with wmcp.sh's real callback returned HTTP 201 + a public
  // client_id (no secret, PKCE S256) — the actual connect-time call, not just
  // metadata. Payment-capable provider: scopes are whatever the user authorizes
  // on their own PayPal account; wmcp.sh only custodies + proxies the token.
  // NOTE: Square was probed alongside but HELD — Square gates DCR behind a
  // redirect-URI domain allowlist and wmcp.sh's callback 400s ("domain not in
  // allowlist"); shipping it would fail at every connect. Add only after Square
  // partner onboarding allowlists wmcp.sh.
  paypal: {
    id: "paypal",
    name: "PayPal",
    description:
      "Manage invoices, orders, payments, subscriptions and disputes on a user's PayPal account via PayPal's official OAuth-protected remote MCP. Connect once; your agent gets the live PayPal tools at /mcp/paypal.",
    authType: "oauth2",
    authUrl: "https://mcp.paypal.com/authorize",
    tokenUrl: "https://mcp.paypal.com/token",
    scopes: "", // PayPal's AS metadata advertises no scopes_supported
    usePKCERedirect: true,
    dcrRegistrationUrl: "https://mcp.paypal.com/register",
    mcpProxy: true,
    mcpUrl: "https://mcp.paypal.com/mcp",
    apiHosts: ["mcp.paypal.com"],
    category: "billing",
    status: "experimental",
    scopeNotice:
      "Connect your own PayPal account via PayPal's official remote MCP (mcp.paypal.com). This is a PAYMENTS provider — your agent can move money on your behalf; review tool calls accordingly. wmcp.sh self-registers (RFC 7591 DCR), stores your token encrypted, and proxies tool calls at /mcp/paypal.",
    notes:
      "RFC 7591 DCR + PKCE (S256), CONNECT-VERIFIED live: /register returned 201 + a public client_id for wmcp.sh's real callback URL (not just metadata). PayPal mints a fresh client_id per registration and does not support CIMD, so the DCR-issued client_id is the only path (which is what wmcp.sh uses).",
  },

  // ============================================================================
  // Horizontal vault expansion (2026-05-30): 18 DCR MCP-proxy providers, each
  // CONNECT-VERIFIED by a live 26-candidate probe — a real RFC 7591 DCR POST
  // with wmcp.sh's actual callback returned 201/200 + a public client_id (the
  // Square-allowlist test). Endpoints are taken verbatim from each server's live
  // OAuth metadata, NOT guessed. All zero-setup (wmcp self-registers); category
  // + scopes as advertised. 2 candidates HELD (intercom, vercel — redirect
  // allowlist, like Square); 5 oauth_static (no public DCR: github_mcp, box,
  // paddle, plaid, hubspot); 1 unreachable (dialpad). See project-harden-and-
  // expansion memory for the full disposition.
  // ============================================================================

  // --- Billing ---
  stripe_mcp: {
    id: "stripe_mcp",
    name: "Stripe MCP",
    description: "Stripe's official remote MCP — manage payments, customers, invoices, products, and subscriptions on a user's Stripe account. Connect once; your agent gets the live Stripe tools at /mcp/stripe_mcp.",
    authType: "oauth2",
    authUrl: "https://access.stripe.com/mcp/oauth2/authorize",
    tokenUrl: "https://access.stripe.com/mcp/oauth2/token",
    scopes: "mcp",
    usePKCERedirect: true,
    dcrRegistrationUrl: "https://access.stripe.com/mcp/oauth2/register",
    mcpProxy: true,
    mcpUrl: "https://mcp.stripe.com",
    apiHosts: ["mcp.stripe.com", "access.stripe.com"],
    category: "billing",
    status: "experimental",
    scopeNotice: "Connect your own Stripe account via Stripe's official remote MCP. PAYMENTS provider — your agent can move money; review tool calls. wmcp.sh self-registers (RFC 7591 DCR) and proxies at /mcp/stripe_mcp.",
    notes: "DCR + PKCE (S256) CONNECT-VERIFIED 2026-05-30: /register → 201 + public client_id for wmcp.sh's callback. AS metadata at the path-inserted /.well-known/oauth-authorization-server/mcp; single coarse scope 'mcp'.",
  },

  // --- Productivity ---
  webflow: {
    id: "webflow",
    name: "Webflow",
    description: "Webflow's official remote MCP — manage sites, CMS collections, and content on a user's Webflow account. Connect once; your agent gets the live Webflow tools at /mcp/webflow.",
    authType: "oauth2",
    authUrl: "https://mcp.webflow.com/oauth/authorize",
    tokenUrl: "https://mcp.webflow.com/oauth/token",
    scopes: "",
    usePKCERedirect: true,
    dcrRegistrationUrl: "https://mcp.webflow.com/oauth/register",
    mcpProxy: true,
    mcpUrl: "https://mcp.webflow.com/mcp",
    apiHosts: ["mcp.webflow.com"],
    category: "productivity",
    status: "experimental",
    scopeNotice: "Connect your own Webflow account via Webflow's official remote MCP. wmcp.sh self-registers (RFC 7591 DCR) and proxies at /mcp/webflow.",
    notes: "DCR + PKCE (S256) CONNECT-VERIFIED 2026-05-30: /oauth/register → 201 + public client_id for wmcp.sh's callback.",
  },

  wix: {
    id: "wix",
    name: "Wix",
    description: "Wix's official remote MCP — manage sites, stores, bookings, and content on a user's Wix account. Connect once; your agent gets the live Wix tools at /mcp/wix.",
    authType: "oauth2",
    authUrl: "https://mcp.wix.com/authorize",
    tokenUrl: "https://mcp.wix.com/token",
    scopes: "offline_access",
    usePKCERedirect: true,
    dcrRegistrationUrl: "https://mcp.wix.com/register",
    mcpProxy: true,
    mcpUrl: "https://mcp.wix.com/mcp",
    apiHosts: ["mcp.wix.com"],
    category: "productivity",
    status: "experimental",
    scopeNotice: "Connect your own Wix account via Wix's official remote MCP. wmcp.sh self-registers (RFC 7591 DCR) and proxies at /mcp/wix.",
    notes: "DCR + PKCE (S256) CONNECT-VERIFIED 2026-05-30: /register → 201 + public client_id for wmcp.sh's callback.",
  },

  canva: {
    id: "canva",
    name: "Canva",
    description: "Canva's official remote MCP — search, create, and manage designs and assets on a user's Canva account. Connect once; your agent gets the live Canva tools at /mcp/canva.",
    authType: "oauth2",
    authUrl: "https://mcp.canva.com/authorize",
    tokenUrl: "https://mcp.canva.com/token",
    scopes: "",
    usePKCERedirect: true,
    dcrRegistrationUrl: "https://mcp.canva.com/register",
    mcpProxy: true,
    mcpUrl: "https://mcp.canva.com/mcp",
    apiHosts: ["mcp.canva.com"],
    category: "productivity",
    status: "experimental",
    scopeNotice: "Connect your own Canva account via Canva's official remote MCP. wmcp.sh self-registers (RFC 7591 DCR) and proxies at /mcp/canva.",
    notes: "DCR + PKCE (S256) CONNECT-VERIFIED 2026-05-30: /register → 201 + public client_id for wmcp.sh's callback.",
  },

  monday: {
    id: "monday",
    name: "monday.com",
    description: "monday.com's official remote MCP — read and update boards, items, and workspaces on a user's monday.com account. Connect once; your agent gets the live monday tools at /mcp/monday.",
    authType: "oauth2",
    authUrl: "https://mcp.monday.com/authorize",
    tokenUrl: "https://mcp.monday.com/token",
    scopes: "",
    usePKCERedirect: true,
    dcrRegistrationUrl: "https://mcp.monday.com/register",
    mcpProxy: true,
    mcpUrl: "https://mcp.monday.com/mcp",
    apiHosts: ["mcp.monday.com"],
    category: "productivity",
    status: "experimental",
    scopeNotice: "Connect your own monday.com account via its official remote MCP. wmcp.sh self-registers (RFC 7591 DCR) and proxies at /mcp/monday.",
    notes: "DCR + PKCE (S256) CONNECT-VERIFIED 2026-05-30: /register → 201 + public client_id for wmcp.sh's callback.",
  },

  fireflies: {
    id: "fireflies",
    name: "Fireflies",
    description: "Fireflies' official remote MCP — search meeting transcripts, summaries, and action items on a user's Fireflies account. Connect once; your agent gets the live Fireflies tools at /mcp/fireflies.",
    authType: "oauth2",
    authUrl: "https://api.fireflies.ai/authorize",
    tokenUrl: "https://api.fireflies.ai/token",
    scopes: "profile email",
    usePKCERedirect: true,
    dcrRegistrationUrl: "https://api.fireflies.ai/register",
    mcpProxy: true,
    mcpUrl: "https://api.fireflies.ai/mcp",
    apiHosts: ["api.fireflies.ai"],
    category: "productivity",
    status: "experimental",
    scopeNotice: "Connect your own Fireflies account via its official remote MCP. wmcp.sh self-registers (RFC 7591 DCR) and proxies at /mcp/fireflies.",
    notes: "DCR + PKCE (S256) CONNECT-VERIFIED 2026-05-30: /register → 201 + public client_id for wmcp.sh's callback.",
  },

  zapier: {
    id: "zapier",
    name: "Zapier",
    description: "Zapier's remote MCP — trigger and run automations across 8,000+ connected apps from a user's Zapier account. Connect once; your agent gets the live Zapier actions at /mcp/zapier.",
    authType: "oauth2",
    authUrl: "https://mcp.zapier.com/oauth/authorize",
    tokenUrl: "https://mcp.zapier.com/api/v1/oauth/token",
    scopes: "openid profile email",
    usePKCERedirect: true,
    dcrRegistrationUrl: "https://mcp.zapier.com/api/v1/oauth/register",
    mcpProxy: true,
    mcpUrl: "https://mcp.zapier.com/api/mcp/mcp",
    apiHosts: ["mcp.zapier.com"],
    category: "productivity",
    status: "experimental",
    scopeNotice: "Connect your own Zapier account via its remote MCP — a gateway to 8,000+ app integrations. wmcp.sh self-registers (RFC 7591 DCR) and proxies at /mcp/zapier.",
    notes: "DCR + PKCE (S256) CONNECT-VERIFIED 2026-05-30: /api/v1/oauth/register (note non-/oauth path) → 201 + public client_id for wmcp.sh's callback. Unlike Square, Zapier does NOT allowlist redirect URIs.",
  },

  cloudinary: {
    id: "cloudinary",
    name: "Cloudinary",
    description: "Cloudinary's official remote MCP — manage and transform media assets (DAM) on a user's Cloudinary account. Connect once; your agent gets the live Cloudinary tools at /mcp/cloudinary.",
    authType: "oauth2",
    authUrl: "https://asset-management.mcp.cloudinary.com/authorize",
    tokenUrl: "https://asset-management.mcp.cloudinary.com/token",
    scopes: "openid profile email offline_access asset_management upload",
    usePKCERedirect: true,
    dcrRegistrationUrl: "https://asset-management.mcp.cloudinary.com/register",
    mcpProxy: true,
    mcpUrl: "https://asset-management.mcp.cloudinary.com/sse",
    apiHosts: ["asset-management.mcp.cloudinary.com"],
    category: "productivity",
    status: "experimental",
    scopeNotice: "Connect your own Cloudinary account via its official remote MCP (asset-management). wmcp.sh self-registers (RFC 7591 DCR) and proxies at /mcp/cloudinary.",
    notes: "DCR + PKCE (S256) CONNECT-VERIFIED 2026-05-30: /register → 201 + public client_id for wmcp.sh's callback. SSE transport (the /mcp host is Akamai-edge-blocked; /sse is the working surface).",
  },

  // --- Dev / infra ---
  cloudflare_bindings: {
    id: "cloudflare_bindings",
    name: "Cloudflare (Workers Bindings)",
    description: "Cloudflare's official remote MCP for Workers bindings — manage KV, R2, D1, Durable Objects, and Workers on a user's Cloudflare account. Connect once; your agent gets the live tools at /mcp/cloudflare_bindings.",
    authType: "oauth2",
    authUrl: "https://bindings.mcp.cloudflare.com/oauth/authorize",
    tokenUrl: "https://bindings.mcp.cloudflare.com/token",
    scopes: "",
    usePKCERedirect: true,
    dcrRegistrationUrl: "https://bindings.mcp.cloudflare.com/register",
    mcpProxy: true,
    mcpUrl: "https://bindings.mcp.cloudflare.com/mcp",
    apiHosts: ["bindings.mcp.cloudflare.com"],
    category: "dev",
    status: "experimental",
    scopeNotice: "Connect your own Cloudflare account via the official Workers-bindings remote MCP. wmcp.sh self-registers (RFC 7591 DCR) and proxies at /mcp/cloudflare_bindings.",
    notes: "DCR + PKCE (S256) CONNECT-VERIFIED 2026-05-30: /register → 201 + public client_id for wmcp.sh's callback.",
  },

  cloudflare_observability: {
    id: "cloudflare_observability",
    name: "Cloudflare (Observability)",
    description: "Cloudflare's official remote MCP for observability — query Workers logs, analytics, and metrics on a user's Cloudflare account. Connect once; your agent gets the live tools at /mcp/cloudflare_observability.",
    authType: "oauth2",
    authUrl: "https://observability.mcp.cloudflare.com/oauth/authorize",
    tokenUrl: "https://observability.mcp.cloudflare.com/token",
    scopes: "",
    usePKCERedirect: true,
    dcrRegistrationUrl: "https://observability.mcp.cloudflare.com/register",
    mcpProxy: true,
    mcpUrl: "https://observability.mcp.cloudflare.com/mcp",
    apiHosts: ["observability.mcp.cloudflare.com"],
    category: "dev",
    status: "experimental",
    scopeNotice: "Connect your own Cloudflare account via the official observability remote MCP. wmcp.sh self-registers (RFC 7591 DCR) and proxies at /mcp/cloudflare_observability.",
    notes: "DCR + PKCE (S256) CONNECT-VERIFIED 2026-05-30: /register → 201 + public client_id for wmcp.sh's callback.",
  },

  apify: {
    id: "apify",
    name: "Apify",
    description: "Apify's official remote MCP — run Actors and scrapers and pull datasets from a user's Apify account. Connect once; your agent gets the live Apify tools at /mcp/apify.",
    authType: "oauth2",
    authUrl: "https://console.apify.com/authorize/oauth",
    tokenUrl: "https://console-backend.apify.com/oauth/apps/token",
    scopes: "full_api_access",
    usePKCERedirect: true,
    dcrRegistrationUrl: "https://console-backend.apify.com/oauth/apps",
    mcpProxy: true,
    mcpUrl: "https://mcp.apify.com",
    apiHosts: ["mcp.apify.com", "console.apify.com", "console-backend.apify.com"],
    category: "dev",
    status: "experimental",
    scopeNotice: "Connect your own Apify account via its official remote MCP. wmcp.sh self-registers (RFC 7591 DCR) and proxies at /mcp/apify.",
    notes: "DCR + PKCE (S256) CONNECT-VERIFIED 2026-05-30: /oauth/apps → 201 + public client_id for wmcp.sh's callback.",
  },

  globalping: {
    id: "globalping",
    name: "Globalping",
    description: "Globalping's official remote MCP — run network measurements (ping, traceroute, DNS, HTTP) from a global probe network. Connect once; your agent gets the live tools at /mcp/globalping.",
    authType: "oauth2",
    authUrl: "https://mcp.globalping.dev/authorize",
    tokenUrl: "https://mcp.globalping.dev/token",
    scopes: "measurements",
    usePKCERedirect: true,
    dcrRegistrationUrl: "https://mcp.globalping.dev/register",
    mcpProxy: true,
    mcpUrl: "https://mcp.globalping.dev/mcp",
    apiHosts: ["mcp.globalping.dev"],
    category: "dev",
    status: "experimental",
    scopeNotice: "Connect your own Globalping account via its official remote MCP. wmcp.sh self-registers (RFC 7591 DCR) and proxies at /mcp/globalping.",
    notes: "DCR + PKCE (S256) CONNECT-VERIFIED 2026-05-30: /register → 201 + public client_id for wmcp.sh's callback.",
  },

  // --- Data / analytics ---
  neon: {
    id: "neon",
    name: "Neon",
    description: "Neon's official remote MCP — manage Postgres projects, branches, and run SQL on a user's Neon account. Connect once; your agent gets the live Neon tools at /mcp/neon.",
    authType: "oauth2",
    authUrl: "https://mcp.neon.tech/api/authorize",
    tokenUrl: "https://mcp.neon.tech/api/token",
    scopes: "read write *",
    usePKCERedirect: true,
    dcrRegistrationUrl: "https://mcp.neon.tech/api/register",
    mcpProxy: true,
    mcpUrl: "https://mcp.neon.tech/mcp",
    apiHosts: ["mcp.neon.tech"],
    category: "data",
    status: "experimental",
    scopeNotice: "Connect your own Neon account via its official remote MCP. wmcp.sh self-registers (RFC 7591 DCR) and proxies at /mcp/neon.",
    notes: "DCR + PKCE (S256) CONNECT-VERIFIED 2026-05-30: /api/register → 200 + public client_id for wmcp.sh's callback.",
  },

  posthog: {
    id: "posthog",
    name: "PostHog",
    description: "PostHog's official remote MCP — query insights, dashboards, experiments, feature flags, and analytics on a user's PostHog project. Connect once; your agent gets the live tools at /mcp/posthog.",
    authType: "oauth2",
    authUrl: "https://oauth.posthog.com/oauth/authorize/",
    tokenUrl: "https://oauth.posthog.com/oauth/token/",
    scopes: "openid profile email insight:read dashboard:read query:read feature_flag:read project:read",
    usePKCERedirect: true,
    dcrRegistrationUrl: "https://oauth.posthog.com/oauth/register/",
    mcpProxy: true,
    mcpUrl: "https://mcp.posthog.com/mcp",
    apiHosts: ["mcp.posthog.com", "oauth.posthog.com"],
    category: "data",
    status: "experimental",
    scopeNotice: "Connect your own PostHog project via its official remote MCP. wmcp.sh self-registers (RFC 7591 DCR) and proxies at /mcp/posthog. Requested scopes are read-oriented; PostHog also offers :write scopes.",
    notes: "DCR + PKCE (S256) CONNECT-VERIFIED 2026-05-30: /oauth/register/ → 201 + public client_id for wmcp.sh's callback. AS host is oauth.posthog.com (distinct from the mcp.posthog.com resource).",
  },

  prisma: {
    id: "prisma",
    name: "Prisma",
    description: "Prisma's official remote MCP — manage Prisma Postgres databases and workspaces on a user's Prisma account. Connect once; your agent gets the live tools at /mcp/prisma.",
    authType: "oauth2",
    authUrl: "https://mcp.prisma.io/oauth/authorize",
    tokenUrl: "https://auth.prisma.io/token",
    scopes: "workspace:admin offline_access",
    usePKCERedirect: true,
    dcrRegistrationUrl: "https://auth.prisma.io/register",
    mcpProxy: true,
    mcpUrl: "https://mcp.prisma.io/mcp",
    apiHosts: ["mcp.prisma.io", "auth.prisma.io"],
    category: "data",
    status: "experimental",
    scopeNotice: "Connect your own Prisma account via its official remote MCP. wmcp.sh self-registers (RFC 7591 DCR) and proxies at /mcp/prisma.",
    notes: "DCR + PKCE (S256) CONNECT-VERIFIED 2026-05-30: auth.prisma.io/register → 201 + public client_id for wmcp.sh's callback. Authorize on mcp.prisma.io, token+register on auth.prisma.io.",
  },

  grafana: {
    id: "grafana",
    name: "Grafana",
    description: "Grafana's official remote MCP — query dashboards, datasources, and alerts on a user's Grafana instance. Connect once; your agent gets the live tools at /mcp/grafana.",
    authType: "oauth2",
    authUrl: "https://mcp.grafana.com/mcp/oauth/authorize",
    tokenUrl: "https://mcp.grafana.com/mcp/oauth/token",
    scopes: "grafana:read grafana:write",
    usePKCERedirect: true,
    dcrRegistrationUrl: "https://mcp.grafana.com/mcp/oauth/register",
    mcpProxy: true,
    mcpUrl: "https://mcp.grafana.com/mcp",
    apiHosts: ["mcp.grafana.com"],
    category: "data",
    status: "experimental",
    scopeNotice: "Connect your own Grafana instance via its official remote MCP. wmcp.sh self-registers (RFC 7591 DCR) and proxies at /mcp/grafana.",
    notes: "DCR + PKCE (S256) CONNECT-VERIFIED 2026-05-30: /mcp/oauth/register → 201 + public client_id for wmcp.sh's callback.",
  },

  // --- AI ---
  huggingface: {
    id: "huggingface",
    name: "Hugging Face",
    description: "Hugging Face's official remote MCP — search models/datasets/Spaces and run inference on a user's Hugging Face account. Connect once; your agent gets the live tools at /mcp/huggingface.",
    authType: "oauth2",
    authUrl: "https://huggingface.co/oauth/authorize",
    tokenUrl: "https://huggingface.co/oauth/token",
    scopes: "openid profile read-mcp read-repos inference-api",
    usePKCERedirect: true,
    dcrRegistrationUrl: "https://huggingface.co/oauth/register",
    mcpProxy: true,
    mcpUrl: "https://huggingface.co/mcp",
    apiHosts: ["huggingface.co", "hf.co"],
    category: "ai",
    status: "experimental",
    scopeNotice: "Connect your own Hugging Face account via its official remote MCP. wmcp.sh self-registers (RFC 7591 DCR) and proxies at /mcp/huggingface.",
    notes: "DCR + PKCE (S256) CONNECT-VERIFIED 2026-05-30: /oauth/register → 201 + public client_id for wmcp.sh's callback.",
  },

  // --- Comms ---
  telnyx: {
    id: "telnyx",
    name: "Telnyx",
    description: "Telnyx's official remote MCP — send messages, manage numbers, and run voice/messaging operations on a user's Telnyx account. Connect once; your agent gets the live tools at /mcp/telnyx.",
    authType: "oauth2",
    authUrl: "https://api.telnyx.com/v2/oauth/authorize",
    tokenUrl: "https://api.telnyx.com/v2/oauth/token",
    scopes: "admin",
    usePKCERedirect: true,
    dcrRegistrationUrl: "https://api.telnyx.com/v2/oauth/register",
    mcpProxy: true,
    mcpUrl: "https://api.telnyx.com/v2/mcp",
    apiHosts: ["api.telnyx.com"],
    category: "comms",
    status: "experimental",
    scopeNotice: "Connect your own Telnyx account via its official remote MCP. wmcp.sh self-registers (RFC 7591 DCR) and proxies at /mcp/telnyx. Default scope is 'admin'.",
    notes: "DCR + PKCE (S256) CONNECT-VERIFIED 2026-05-30: /v2/oauth/register → 201 + public client_id for wmcp.sh's callback. Registration is rate-limited (5/hr).",
  },

  // --- Shopify Admin (for Shopify reseller tier) ---
  shopify: {
    id: "shopify",
    name: "Shopify Admin",
    description:
      "Manage products, orders, inventory on a user's Shopify store (Admin API).",
    authType: "oauth2",
    // Shopify per-shop URL; we have to substitute {shop} at start time
    authUrl: "https://{shop}.myshopify.com/admin/oauth/authorize",
    tokenUrl: "https://{shop}.myshopify.com/admin/oauth/access_token",
    scopes: "read_products write_products read_orders write_orders",
    clientIdSecret: "SHOPIFY_API_KEY",
    clientSecretSecret: "SHOPIFY_API_SECRET",
    apiHosts: ["myshopify.com"], // matched as suffix
    category: "billing",
    status: "experimental",
    notes:
      "Per-shop OAuth — requires a `shop` query parameter at start. Different from the public storefront adapter.",
  },
};

export function listPublicProviders() {
  return Object.values(PROVIDERS).map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    authType: p.authType,
    category: p.category,
    status: p.status,
    apiKeyDocsUrl: p.apiKeyDocsUrl,
    // Proxied (OAuth-vault MCP-proxy) providers are billed per managed
    // connection — the dashboard shows a Subscribe CTA for these.
    mcpProxy: !!p.mcpProxy,
    scopeNotice: p.scopeNotice,
  }));
}
