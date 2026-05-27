// lead_capture.ts — POST /api/v1/leads
//
// Stores managed-service inbound from /managed contact form.
// KV key: lead:<reverse-ts>:<rand> — sorted newest-first by listing
//   the KV namespace.
// Honeypot field (hp) drops bot submissions silently.
// Lightweight per-IP rate limit to deter form-spam without breaking
//   legit submitters.
//
// Operator (you) reviews leads via:
//   wrangler kv:key list --binding=KEYS --prefix="lead:"
//   wrangler kv:key get  --binding=KEYS  "lead:..."
//
// v1 may add Slack webhook + email notification — for now KV-only so
// nothing depends on external config to ship.

import type { Context } from "hono";

type Env = {
  KEYS: KVNamespace;
  USAGE: KVNamespace;
};

interface LeadBody {
  name?: string;
  email?: string;
  site_url?: string;
  package?: string;
  use_case?: string;
  hp?: string; // honeypot — must be empty
}

const MAX_FIELD_LEN = 2000;
const MAX_LEADS_PER_IP_PER_HOUR = 5;

function sanitize(v: unknown, max = MAX_FIELD_LEN): string {
  if (typeof v !== "string") return "";
  return v.slice(0, max).replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, "");
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 200;
}

function isValidUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export async function captureLead(c: Context<{ Bindings: Env }>) {
  const ip = c.req.header("cf-connecting-ip") || "unknown";
  const ua = (c.req.header("user-agent") || "").slice(0, 240);
  const referer = (c.req.header("referer") || "").slice(0, 240);

  // Per-IP rate limit: 5 / hour. KV write per submission already, this is just
  // the gate. Uses USAGE namespace which has higher write budget than KEYS.
  const hourBucket = Math.floor(Date.now() / 3_600_000);
  const rlKey = `leadrl:${ip}:${hourBucket}`;
  const currentRaw = await c.env.USAGE.get(rlKey);
  const current = currentRaw ? parseInt(currentRaw, 10) : 0;
  if (current >= MAX_LEADS_PER_IP_PER_HOUR) {
    return c.json(
      {
        error: "rate_limited",
        hint: "Slow down — only " + MAX_LEADS_PER_IP_PER_HOUR + " submissions per hour per IP. Email audit@wmcp.sh directly if you need to send more.",
      },
      429
    );
  }

  const body = await c.req.json<LeadBody>().catch(() => null);
  if (!body || typeof body !== "object") {
    return c.json({ error: "invalid_body" }, 400);
  }

  // Honeypot: bots fill every field. Real humans see hidden field, leave empty.
  if (body.hp && body.hp.length > 0) {
    // Pretend success so the bot doesn't try again with a variant.
    return c.json({ ok: true, lead_id: "honeypot" });
  }

  const name = sanitize(body.name, 100);
  const email = sanitize(body.email, 200);
  const site_url = sanitize(body.site_url, 500);
  const pkg = sanitize(body.package, 50);
  const use_case = sanitize(body.use_case, MAX_FIELD_LEN);

  if (!name || !email || !site_url) {
    return c.json({ error: "missing_required_field" }, 400);
  }
  if (!isValidEmail(email)) {
    return c.json({ error: "invalid_email" }, 400);
  }
  if (!isValidUrl(site_url)) {
    return c.json({ error: "invalid_site_url" }, 400);
  }

  const now = Date.now();
  // Reverse timestamp so KV.list returns newest first naturally.
  const reverseTs = (Number.MAX_SAFE_INTEGER - now).toString().padStart(16, "0");
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(4)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const leadId = `${reverseTs}:${rand}`;
  const kvKey = `lead:${leadId}`;

  const record = {
    id: leadId,
    received_at: now,
    received_at_iso: new Date(now).toISOString(),
    ip,
    ua,
    referer,
    name,
    email,
    site_url,
    package: pkg,
    use_case,
  };

  await c.env.KEYS.put(kvKey, JSON.stringify(record), {
    // Leads live 1 year — operator should export to a real CRM before then.
    expirationTtl: 365 * 86400,
    metadata: { email, site_url, package: pkg },
  });

  // Increment rate-limit bucket (1h TTL).
  c.executionCtx.waitUntil(
    c.env.USAGE.put(rlKey, String(current + 1), { expirationTtl: 3600 })
  );

  return c.json({ ok: true, lead_id: leadId, message: "received" });
}
