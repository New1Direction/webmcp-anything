// paywall.ts — one shape for every plan gate (REST 402/429, proxy 402, MCP
// JSON-RPC error data), so a blocked agent or developer always gets the exact
// next step: which plan unlocks the call, what it costs, and a link that lands
// on /dashboard with that plan pre-selected for checkout.
//
// Prices are the LOCKED self-serve API ladder (AGENTS.md §3.7.2). The upgrade
// link carries only `upgrade` (plan), `reason` and `source` — low-cardinality
// labels that page-view + checkout attribution can count without any PII.

import type { Plan } from "./auth";

export type PaywallReason =
  | "execute_required"
  | "quota_reads"
  | "quota_executes"
  | "quota_push"
  | "free_tier_exhausted";

export const PLAN_ORDER: Plan[] = ["free", "builder", "pro", "reseller"];

export const PLAN_PRICE_USD: Record<Plan, number> = {
  free: 0,
  builder: 39,
  pro: 99,
  reseller: 299,
};

export function planRank(p: Plan): number {
  const i = PLAN_ORDER.indexOf(p);
  return i < 0 ? 0 : i;
}

export function isPaidPlan(p: unknown): p is Exclude<Plan, "free"> {
  return p === "builder" || p === "pro" || p === "reseller";
}

export function nextPlan(p: Plan): Plan | null {
  const i = planRank(p);
  return i + 1 < PLAN_ORDER.length ? PLAN_ORDER[i + 1] : null;
}

export interface UpgradeInfo {
  reason: PaywallReason;
  current_plan: Plan;
  recommended_plan: Plan | null;
  price: string | null;
  upgrade_url: string;
}

// Never let a malformed request URL turn a paywall into a 500.
export function requestOrigin(url: string): string {
  try {
    return new URL(url).origin;
  } catch {
    return "https://wmcp.sh";
  }
}

export function upgradeInfo(origin: string, plan: Plan, reason: PaywallReason): UpgradeInfo {
  const rec = nextPlan(plan);
  if (!rec) {
    // Top self-serve tier exhausted → the done-for-you / Enterprise ladder.
    return {
      reason,
      current_plan: plan,
      recommended_plan: null,
      price: null,
      upgrade_url: `${origin}/managed?source=paywall_${reason}`,
    };
  }
  const q = new URLSearchParams({ upgrade: rec, reason, source: `paywall_${reason}` });
  return {
    reason,
    current_plan: plan,
    recommended_plan: rec,
    price: `$${PLAN_PRICE_USD[rec]}/mo`,
    upgrade_url: `${origin}/dashboard?${q.toString()}#plans`,
  };
}

export function upgradeHint(u: UpgradeInfo): string {
  if (!u.recommended_plan) return `You're on the top self-serve plan. For higher volume see ${u.upgrade_url}`;
  const label = u.recommended_plan[0].toUpperCase() + u.recommended_plan.slice(1);
  return `Upgrade to ${label} (${u.price}) in one step: ${u.upgrade_url}`;
}
