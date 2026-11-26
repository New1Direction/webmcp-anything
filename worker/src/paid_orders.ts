// paid_orders.ts — operator-only queue for human-delivered paid services.
// No automatic Verified badge. An operator must review evidence and mark a
// completed Agent-Ready Fix after actually delivering it.
import type { Context } from "hono";

type Env = { KEYS: KVNamespace; ADMIN_TOKEN?: string; ENVIRONMENT?: string };

function isAdmin(c: Context<{ Bindings: Env }>) {
  const want = c.env.ADMIN_TOKEN || (c.env.ENVIRONMENT === "development" ? "devadmin" : null);
  return !!want && c.req.header("x-admin-token") === want;
}

export async function paidOrderQueue(c: Context<{ Bindings: Env }>) {
  if (!isAdmin(c)) return c.json({ error: "admin only" }, 401);
  c.header("Cache-Control", "no-store");
  const kinds = ["fix:", "deepaudit:"];
  const records = (await Promise.all(kinds.map(async (prefix) => {
    const index = await c.env.KEYS.list({ prefix, limit: 100 });
    return (await Promise.all(index.keys.slice(0, 50).map(async (key) => {
      const raw = await c.env.KEYS.get(key.name);
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw);
        return {
          order_key: key.name,
          kind: prefix === "fix:" ? "agent_ready_fix" : "deep_audit",
          received_at: Number(parsed.received_at) || 0,
          status: parsed.status || "unknown",
          site_url: String(parsed.site_url || parsed.target_url || "").slice(0, 500),
          email: String(parsed.email || "").slice(0, 200),
          slug: String(parsed.slug || "").slice(0, 80),
        };
      } catch { return null; }
    }))).filter(Boolean);
  }))).flat() as any[];
  records.sort((a, b) => b.received_at - a.received_at);
  return c.json({
    orders: records.slice(0, 50),
    pending_count: records.filter((r) => r.status === "paid_pending_fulfillment").length,
    note: "Most recent 50 records from each of two KV prefixes; inspect source records for exhaustive history.",
  });
}

export async function completePaidFix(c: Context<{ Bindings: Env }>) {
  if (!isAdmin(c)) return c.json({ error: "admin only" }, 401);
  c.header("Cache-Control", "no-store");
  const body = await c.req.json<{ order_key?: string; evidence_url?: string }>().catch(() => null);
  // Do not allow arbitrary KV writes through the admin endpoint.
  if (!body?.order_key || !/^fix:\d{16}:[a-f0-9]{8}$/.test(body.order_key))
    return c.json({ error: "invalid_order_key" }, 400);
  let evidence: URL;
  try { evidence = new URL(String(body.evidence_url || "")); }
  catch { return c.json({ error: "evidence_url_required" }, 400); }
  if (evidence.protocol !== "https:" || evidence.username || evidence.password)
    return c.json({ error: "https_evidence_required" }, 400);
  const raw = await c.env.KEYS.get(body.order_key);
  if (!raw) return c.json({ error: "order_not_found" }, 404);
  let order: any;
  try { order = JSON.parse(raw); } catch { return c.json({ error: "invalid_order" }, 409); }
  if (order.status === "fulfilled") return c.json({ ok: true, action: "already_fulfilled", slug: order.slug });
  if (order.status !== "paid_pending_fulfillment") return c.json({ error: "not_paid_pending" }, 409);
  const slug = String(order.slug || "").toLowerCase();
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return c.json({ error: "invalid_order_slug" }, 409);
  order.status = "fulfilled";
  order.fulfilled_at = Date.now();
  order.evidence_url = evidence.toString();
  await c.env.KEYS.put(body.order_key, JSON.stringify(order), {
    expirationTtl: 365 * 86400, metadata: { slug, email: order.email, status: "fulfilled" },
  });
  await c.env.KEYS.put(`verified:${slug}`, "1", {
    metadata: { ts: order.fulfilled_at, via: "paid_fix_fulfilled" },
  });
  return c.json({ ok: true, action: "fulfilled", slug, verified: true });
}
