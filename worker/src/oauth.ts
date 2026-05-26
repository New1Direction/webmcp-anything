// oauth.ts — Phase A: GitHub OAuth for wmcp.sh sign-in.
//
// Flow:
//   GET  /api/v1/auth/github/start   → 302 to github.com/login/oauth/authorize
//   GET  /api/v1/auth/github/callback?code&state → exchange code, create session
//   POST /api/v1/auth/logout         → clear session
//
// Identity model:
//   - First GH sign-in for an email: create user `gh:<github_id>` (or link to
//     existing `cust:<stripe_id>` / `email:<email>` if email matches).
//   - Sessions stored server-side in KEYS KV (see session.ts).
//
// Phase B will reuse the same `oauth_state` machinery + token storage for the
// per-provider connector framework.

import type { Context } from "hono";
import {
  createSession,
  createOauthState,
  consumeOauthState,
  readSessionCookie,
  deleteSession,
  clearCookieHeader,
} from "./session";
import { issueKey } from "./auth";

type Env = {
  KEYS: KVNamespace;
  USAGE: KVNamespace;
  ENVIRONMENT: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
};

// ====================== GitHub sign-in ======================

export async function githubStart(c: Context<{ Bindings: Env }>) {
  const client_id = c.env.GITHUB_CLIENT_ID;
  if (!client_id) {
    return c.json({ error: "github_oauth_not_configured" }, 503);
  }
  const redirect_to = c.req.query("redirect_to") || "/dashboard";
  const state = await createOauthState(c.env, { provider: "github", redirect_to });
  const origin = new URL(c.req.url).origin;
  const params = new URLSearchParams({
    client_id,
    redirect_uri: `${origin}/api/v1/auth/github/callback`,
    scope: "read:user user:email",
    state,
    allow_signup: "true",
  });
  return c.redirect(
    `https://github.com/login/oauth/authorize?${params.toString()}`,
    302
  );
}

export async function githubCallback(c: Context<{ Bindings: Env }>) {
  const code = c.req.query("code");
  const state = c.req.query("state");
  if (!code || !state) return c.json({ error: "missing_code_or_state" }, 400);
  if (!c.env.GITHUB_CLIENT_ID || !c.env.GITHUB_CLIENT_SECRET) {
    return c.json({ error: "github_oauth_not_configured" }, 503);
  }

  const statePayload = await consumeOauthState(c.env, state);
  if (!statePayload || statePayload.provider !== "github") {
    return c.json({ error: "invalid_state" }, 400);
  }

  // 1. Exchange code for access token
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      client_id: c.env.GITHUB_CLIENT_ID,
      client_secret: c.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });
  if (!tokenRes.ok) {
    return c.json({ error: "github_token_exchange_failed" }, 502);
  }
  const tokenJson = (await tokenRes.json()) as {
    access_token?: string;
    error?: string;
  };
  if (!tokenJson.access_token) {
    return c.json(
      { error: "github_no_access_token", detail: tokenJson.error },
      502
    );
  }

  // 2. Fetch the user profile + emails
  const [userRes, emailsRes] = await Promise.all([
    fetch("https://api.github.com/user", {
      headers: {
        authorization: `Bearer ${tokenJson.access_token}`,
        accept: "application/vnd.github+json",
        "user-agent": "wmcp.sh",
      },
    }),
    fetch("https://api.github.com/user/emails", {
      headers: {
        authorization: `Bearer ${tokenJson.access_token}`,
        accept: "application/vnd.github+json",
        "user-agent": "wmcp.sh",
      },
    }),
  ]);
  if (!userRes.ok) {
    return c.json({ error: "github_user_fetch_failed" }, 502);
  }
  const ghUser = (await userRes.json()) as {
    id: number;
    login: string;
    name?: string;
    email?: string;
    avatar_url?: string;
  };
  let primaryEmail = ghUser.email;
  if (emailsRes.ok) {
    const emails = (await emailsRes.json()) as Array<{
      email: string;
      primary: boolean;
      verified: boolean;
    }>;
    const pri = emails.find((e) => e.primary && e.verified);
    if (pri) primaryEmail = pri.email;
  }

  // 3. Resolve to a wmcp user_id (link by email if a customer record exists)
  const user_id = await resolveOrCreateUser(c.env, {
    github_id: ghUser.id,
    github_login: ghUser.login,
    email: primaryEmail,
    name: ghUser.name,
  });

  // 4. Create session + set cookie + redirect
  const { cookie } = await createSession(c.env, {
    user_id,
    email: primaryEmail,
    github_id: ghUser.id,
    github_login: ghUser.login,
  });

  const target = statePayload.redirect_to || "/dashboard";
  return new Response(null, {
    status: 302,
    headers: {
      "set-cookie": cookie,
      location: target,
    },
  });
}

export async function logout(c: Context<{ Bindings: Env }>) {
  const sid = readSessionCookie(c);
  if (sid) await deleteSession(c.env, sid);
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "set-cookie": clearCookieHeader(),
      "content-type": "application/json",
    },
  });
}

// /api/v1/me — who am I? Reads cookie session and returns the user view.
export async function me(c: Context<{ Bindings: Env }>) {
  const sid = readSessionCookie(c);
  if (!sid) return c.json({ authenticated: false });
  const raw = await c.env.KEYS.get(`session:${sid}`);
  if (!raw) return c.json({ authenticated: false });
  const sess = JSON.parse(raw);
  // Look up the user record for keys + plan
  const userRaw = await c.env.KEYS.get(`user:${sess.user_id}`);
  const user = userRaw ? JSON.parse(userRaw) : null;
  return c.json({
    authenticated: true,
    user_id: sess.user_id,
    email: sess.email,
    github_login: sess.github_login,
    plan: user?.plan || "free",
    keys: user?.keys || [],
    connections: sess.connections || [],
  });
}

// /api/v1/me/keys — issue a new key for the logged-in user (free tier ok).
export async function issueOwnKey(c: Context<{ Bindings: Env }>) {
  const sid = readSessionCookie(c);
  if (!sid) return c.json({ error: "not_authenticated" }, 401);
  const raw = await c.env.KEYS.get(`session:${sid}`);
  if (!raw) return c.json({ error: "session_expired" }, 401);
  const sess = JSON.parse(raw);
  const userRaw = await c.env.KEYS.get(`user:${sess.user_id}`);
  const user = userRaw ? JSON.parse(userRaw) : { plan: "free", keys: [] };
  const key = await issueKey(c.env as any, sess.user_id, user.plan || "free");
  return c.json({ key, plan: user.plan || "free" });
}

// ====================== helpers ======================

async function resolveOrCreateUser(
  env: Env,
  who: {
    github_id: number;
    github_login: string;
    email?: string;
    name?: string;
  }
): Promise<string> {
  // 1. If we've seen this github_id before, reuse the same user_id.
  const ghKey = `gh:${who.github_id}`;
  const existingGhUserId = await env.KEYS.get(`gh_user:${who.github_id}`);
  if (existingGhUserId) return existingGhUserId;

  // 2. If email matches a Stripe customer or email-indexed user, link to it.
  if (who.email) {
    const byEmail = await env.KEYS.get(`email:${who.email.toLowerCase()}`);
    if (byEmail) {
      // Backfill the gh → user link so future logins are fast.
      await env.KEYS.put(`gh_user:${who.github_id}`, byEmail);
      // Annotate the user record with github info.
      const userRaw = await env.KEYS.get(`user:${byEmail}`);
      if (userRaw) {
        const u = JSON.parse(userRaw);
        u.github_id = who.github_id;
        u.github_login = who.github_login;
        if (!u.email) u.email = who.email;
        await env.KEYS.put(`user:${byEmail}`, JSON.stringify(u));
      }
      return byEmail;
    }
  }

  // 3. New user. Create a fresh user record keyed by GitHub.
  const user_id = ghKey;
  await env.KEYS.put(
    `user:${user_id}`,
    JSON.stringify({
      plan: "free",
      keys: [],
      email: who.email,
      github_id: who.github_id,
      github_login: who.github_login,
      name: who.name,
      created_at: Date.now(),
    })
  );
  await env.KEYS.put(`gh_user:${who.github_id}`, user_id);
  if (who.email) {
    await env.KEYS.put(`email:${who.email.toLowerCase()}`, user_id);
  }
  return user_id;
}
