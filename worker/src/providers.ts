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

  // Marketing
  category: "auth" | "comms" | "billing" | "dev" | "ai" | "productivity";
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
  notion: {
    id: "notion",
    name: "Notion",
    description: "Read/write pages and databases in a user's Notion workspace.",
    authType: "oauth2",
    authUrl: "https://api.notion.com/v1/oauth/authorize",
    tokenUrl: "https://api.notion.com/v1/oauth/token",
    scopes: "", // Notion doesn't use scopes
    tokenAuthMethod: "header",
    userInfoUrl: "https://api.notion.com/v1/users/me",
    userInfoHeaders: { "notion-version": "2022-06-28" },
    clientIdSecret: "NOTION_CLIENT_ID",
    clientSecretSecret: "NOTION_CLIENT_SECRET",
    apiHosts: ["api.notion.com"],
    category: "productivity",
    status: "stable",
  },

  linear: {
    id: "linear",
    name: "Linear",
    description: "Read/write issues, projects, comments in a user's Linear workspace.",
    authType: "oauth2",
    authUrl: "https://linear.app/oauth/authorize",
    tokenUrl: "https://api.linear.app/oauth/token",
    scopes: "read write",
    userInfoUrl: "https://api.linear.app/graphql", // GraphQL: viewer { id name email }
    clientIdSecret: "LINEAR_CLIENT_ID",
    clientSecretSecret: "LINEAR_CLIENT_SECRET",
    apiHosts: ["api.linear.app"],
    category: "dev",
    status: "stable",
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
  }));
}
