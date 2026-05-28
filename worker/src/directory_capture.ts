// directory_capture.ts — POST /api/v1/directory/submit
//
// Saves a directory submission to KV. Optionally:
//   - Triggers a /api/v1/tools probe to verify wmcp.sh can extract tools
//   - Cross-files a lead in the lead_capture KV space if managed_interest
//
// KV keys:
//   dirsub:<reverse-ts>:<rand>  — full submission record
//   dirsubrl:<ip>:<hour>        — rate limit counter (in USAGE namespace)

import type { Context } from "hono";
import { slugFromUrl } from "./slug";
import { fireAlert } from "./alerts";

type Env = {
  KEYS: KVNamespace;
  USAGE: KVNamespace;
  LEAD_ALERT_WEBHOOK?: string;
};

interface SubmitBody {
  name?: string;
  email?: string;
  site_url?: string;
  category?: string;
  blurb?: string;
  managed_interest?: boolean;
  hp?: string;
}

const MAX_PER_IP_PER_HOUR = 5;

function sanitize(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  return v.slice(0, max).replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, "");
}
function validEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 200;
}
function validUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export async function captureDirectorySubmission(c: Context<{ Bindings: Env }>) {
  const ip = c.req.header("cf-connecting-ip") || "unknown";
  const ua = (c.req.header("user-agent") || "").slice(0, 240);
  const referer = (c.req.header("referer") || "").slice(0, 240);

  // Rate limit
  const hour = Math.floor(Date.now() / 3_600_000);
  const rlKey = `dirsubrl:${ip}:${hour}`;
  const cur = parseInt((await c.env.USAGE.get(rlKey)) || "0", 10);
  if (cur >= MAX_PER_IP_PER_HOUR) {
    return c.json(
      {
        error: "rate_limited",
        hint: `${MAX_PER_IP_PER_HOUR} submissions per hour per IP. Email audit@wmcp.sh if you need more.`,
      },
      429
    );
  }

  const body = await c.req.json<SubmitBody>().catch(() => null);
  if (!body || typeof body !== "object") return c.json({ error: "invalid_body" }, 400);

  // Honeypot
  if (body.hp && body.hp.length > 0) {
    return c.json({ ok: true, listing_url: "honeypot" });
  }

  const name = sanitize(body.name, 100);
  const email = sanitize(body.email, 200);
  const site_url = sanitize(body.site_url, 500);
  const category = sanitize(body.category, 32);
  const blurb = sanitize(body.blurb, 280);
  const managed_interest = !!body.managed_interest;

  if (!name || !email || !site_url) {
    return c.json({ error: "missing_required_field" }, 400);
  }
  if (!validEmail(email)) return c.json({ error: "invalid_email" }, 400);
  if (!validUrl(site_url)) return c.json({ error: "invalid_site_url" }, 400);

  const slug = slugFromUrl(site_url);
  const now = Date.now();
  const reverseTs = (Number.MAX_SAFE_INTEGER - now).toString().padStart(16, "0");
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(4)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const subId = `${reverseTs}:${rand}`;
  const kvKey = `dirsub:${subId}`;

  const record = {
    id: subId,
    received_at: now,
    received_at_iso: new Date(now).toISOString(),
    ip,
    ua,
    referer,
    name,
    email,
    site_url,
    slug,
    category,
    blurb,
    managed_interest,
    status: "pending_probe",
  };

  await c.env.KEYS.put(kvKey, JSON.stringify(record), {
    expirationTtl: 365 * 86400,
    metadata: { email, site_url, slug, category, managed_interest },
  });

  // If they ticked managed_interest, ALSO file a lead in the lead vault.
  // Same record shape as /managed contact form so a single workflow handles both.
  if (managed_interest) {
    const leadKey = `lead:${reverseTs}:${rand}-dir`;
    await c.env.KEYS.put(
      leadKey,
      JSON.stringify({
        id: subId,
        received_at: now,
        received_at_iso: new Date(now).toISOString(),
        source: "directory_submit",
        ip,
        ua,
        referer,
        name,
        email,
        site_url,
        package: "audit_only",
        use_case: `Directory submission · category=${category} · blurb=${blurb || "(none)"}`,
      }),
      {
        expirationTtl: 365 * 86400,
        metadata: { email, site_url, package: "managed_interest", source: "directory" },
      }
    );
  }

  // Increment rate limit
  c.executionCtx.waitUntil(
    c.env.USAGE.put(rlKey, String(cur + 1), { expirationTtl: 3600 })
  );

  // Best-effort alert — managed-interest submissions are the high-intent signal.
  fireAlert(
    c.env,
    c.executionCtx,
    `🟢 New directory submission: ${name} <${email}> · ${site_url}${category ? ` · ${category}` : ""}${managed_interest ? " · ⭐ MANAGED INTEREST" : ""}`
  );

  // Best-effort: kick off an async probe of /api/v1/tools to pre-warm the cache
  // for this URL. Doesn't block the response.
  const origin = new URL(c.req.url).origin;
  c.executionCtx.waitUntil(
    fetch(`${origin}/api/v1/tools?url=${encodeURIComponent(site_url)}`).catch(() => {})
  );

  return c.json({
    ok: true,
    submission_id: subId,
    slug,
    listing_url: `${origin}/u/${slug}`,
    managed_interest_filed: managed_interest,
  });
}
