function logAdd(a, b) {
  const high = Math.max(a, b);
  return high + Math.log1p(Math.exp(Math.min(a, b) - high));
}

// Inclusive P(X >= successes). Accumulate terms in log space near either endpoint.
function binomialTail(trials, successes, probability) {
  if (successes <= 0) return 1;
  if (successes > trials || probability === 0) return 0;
  if (probability === 1) return 1;
  const p = Math.log(probability);
  const q = Math.log1p(-probability);
  let choose = 0;
  for (let i = 1; i <= Math.min(successes, trials - successes); i++) choose += Math.log(trials + 1 - i) - Math.log(i);
  let term = choose + successes * p + (trials - successes) * q;
  let tail = term;
  for (let i = successes; i < trials; i++) {
    term += Math.log(trials - i) - Math.log(i + 1) + p - q;
    tail = logAdd(tail, term);
  }
  return Math.min(1, Math.exp(tail));
}

export function lowerRate(successes, trials, alpha) {
  if (!trials) return { successes, trials, estimate: null, lower: null };
  let lower = 0;
  let upper = 1;
  if (successes > 0) {
    for (let i = 0; i < 48; i++) {
      const mid = (lower + upper) / 2;
      if (binomialTail(trials, successes, mid) <= alpha) lower = mid;
      else upper = mid;
    }
  }
  return { successes, trials, estimate: successes / trials, lower };
}

export function upperP95(latencies, alpha) {
  const ordered = [...latencies].sort((a, b) => a - b);
  const count = ordered.length;
  const represent = (value) => Number.isFinite(value) ? value : null;
  const estimate = represent(ordered[Math.ceil(0.95 * count) - 1]);
  if (!count || binomialTail(count, count, 0.95) > alpha) {
    return { estimateMs: estimate, upperMs: null, rank: null, status: "insufficient-sample" };
  }
  let first = 1;
  let last = count;
  while (first < last) {
    const mid = Math.floor((first + last) / 2);
    if (binomialTail(count, mid, 0.95) <= alpha) last = mid;
    else first = mid + 1;
  }
  const upperMs = represent(ordered[first - 1]);
  return { estimateMs: estimate, upperMs, rank: first, status: upperMs === null ? "unbounded" : "bounded" };
}
