# Tool selection under a spending limit

The selection command uses a Rust statistics engine. Build it first from the repository root with `cargo build --locked --manifest-path tools/wmcp-stats/Cargo.toml`.

The [Lean count model](../tools/wmcp-stats/formal/Counts.lean) proves bounds on valid trial counts; shared cases test the Rust input checks. It does not prove the floating-point statistical computations.

`wmcp select` recommends a tool for one attempt from a supplied candidate set. It checks contract compatibility, required task outcomes, the spending ceiling, and service objectives before ranking the feasible tools. It returns the full trade-off frontier and a machine-readable reason for each rejection.

~~~sh
node examples/tool-selection/evaluate.mjs
node examples/tool-selection/evaluate.mjs --evidence > /tmp/wmcp-selection-evidence.json
node cli/wmcp.mjs select examples/tool-selection/task.json /tmp/wmcp-selection-evidence.json
~~~

The command reads local JSON and produces a planning report. Exit code `0` means a candidate was selected, `2` means no candidate met all constraints, and `1` means the inputs could not be used.

## Specify the decision

Use [the task fixture](../examples/tool-selection/task.json) as a starting point.

| Task field | Meaning |
| --- | --- |
| `schemaVersion` | `wmcp-selection-task/v1` |
| `profile` | Versioned identifier for the workload, evaluation checks, and measurement conditions |
| `input`, `outputSchema` | The proposed logical input and the schema the result must satisfy |
| `requiredChecks` | One or more named, independently evaluated correctness checks that each candidate must pass in conformance testing |
| `preferredChecks` | Optional outcome checks that make a correct response more useful |
| `limits` | Currency, maximum spend, maximum p95 latency, minimum trials, minimum correctness, minimum reliability, and simultaneous confidence |
| `prefer` | Optional ordered list of `price`, `latency`, `reliability`, `suitability`, and `correctness` |

Money is recorded in integer millionths of one currency unit. For example, `12000` USD micros is USD $0.012. Time is in integer milliseconds. Use probabilities between zero and one for confidence and rates. The default preference order is price, latency, reliability, suitability, then correctness. Any omitted dimensions follow the specified dimensions in that order. Equal candidates are ordered by ID.

The evidence document uses `wmcp-selection-evidence/v1` and the same `profile`. Each member of `candidates` has a stable `id`, a `contract`, a `quote` with `currency` and `maxMicros` or `null`, a `conformance` map of check IDs to booleans, and a list of `trials`. Each trial records `status` (`completed`, `failed`, or `timeout`), `latencyMs`, and `costMicros`. Completed trials also record a `checks` map of check IDs to booleans. [Tool contract format](tool-contract.md).

Use an evaluator you trust to validate outputs against the task schema and an independent oracle. The conformance map represents targeted cases, such as refunds and rounding boundaries, and should cover important outcomes that may be rare in routine trials. A conformance result passes only when the corresponding flag is explicitly true. Candidate contracts and measurements should correspond to the same deployed version and service conditions. For a live workload, populate the candidate set from tools the caller is allowed to use and supply a current, enforceable quote for the actual request, inclusive of fees and cost on failure. The result retains the documented authorization requirements for the execution layer to enforce.

## Eligibility and ranking

| Measure | Eligibility rule | Comparison after eligibility |
| --- | --- | --- |
| Contract | Candidate accepts the input and its supported output shape implies the task shape | — |
| Required outcomes | Every targeted correctness check passes | — |
| Spend | A same-currency ceiling covers the attempt, is within budget, and is consistent with recorded costs | Lower price ceiling |
| Correctness | Lower bound on the fraction of attempts that complete and pass all required trial checks meets `minCorrectness` | Higher lower bound |
| Reliability | Lower bound on the fraction of attempts that complete meets `minReliability` | Higher lower bound |
| Latency | Upper bound on end-to-end p95 meets `maxP95LatencyMs` | Lower upper bound |
| Suitability | Optional | Higher lower bound on the fraction of attempts that complete correctly and pass all preferred checks |
| Sample size | Every candidate must have at least `minTrials` recorded attempts | — |

The output implication check uses WMCP's conservative composition schema subset. An unavailable or unprovable output shape yields a rejection. Every failed attempt or timeout is included in the denominator and treated as infinite time to completion. A completed trial with a missing required check counts as incorrect. A missing measured bound fails an objective that requires it.

An eligible candidate is on the Pareto frontier if no other eligible candidate matches or improves on it in every dimension and improves on it in at least one. The selector orders this frontier using the user's preference order. If the frontier is empty, the spending and correctness constraints still apply and the selector returns `no-feasible-tool`. The report applies to one planned attempt. Each additional attempt would need its own budget and authorization decision.

## Uncertainty

For a requested simultaneous confidence `C`, WMCP uses a per-bound significance level of `(1 − C) / (candidate count × bound count per candidate)`. Bound count is three for correctness, reliability, and p95, or four when suitability is included. This Bonferroni correction covers the entire candidate set before ranking.

For `s` successes in `n` trials, the exact one-sided lower rate bound is zero if there are zero successes. For positive `s`, WMCP inverts the binomial upper-tail probability at the per-bound significance level. The report includes both the observed rate and the bound. [NIST exact binomial confidence limits](https://itl.nist.gov/div898/software/dataplot/refman2/auxillar/exacbici.htm).

For p95, WMCP orders the trial latencies and finds the first rank `k` where `P(Binomial(n, 0.95) ≥ k)` is at most the per-bound significance level. The observation at that rank is the distribution-free upper bound. An unavailable rank indicates too little data and an infinite observation means the bound is unbounded. Both appear as `upperMs: null` with different statuses. [JMP nonparametric one-sided tolerance limits](https://www.jmp.com/content/dam/jmp/documents/en/support/jmp182/basic-analysis.pdf).

Coverage assumes independent, representative trials within each candidate under a stable task profile, with a fixed evaluation and stopping plan. Separate profiles are needed when workload, region, concurrency, timeout configuration, or tool version materially changes. The bounds apply to the sampled distribution. The targeted conformance cases protect the specific critical outcomes they exercise.

## Reproducible evaluation

The included fixture uses local ledger calculators, an independent integer oracle, and simulated prices, timing, and timeouts. The task requires the exact settled total, including settled refunds. A correct breakdown is optional. It sets a 97% correct-result objective, a 97% completion objective, a 110 ms maximum p95, and 95% simultaneous confidence.

| Pareto option at $0.012 | Price ceiling | p95 upper bound | Reliability and correctness lower bounds | Suitability lower bound |
| --- | ---: | ---: | ---: | ---: |
| `budget-verified` | $0.006 | 91 ms | 98.77% | 0% |
| `balanced-verified` | $0.008 | 65 ms | 98.77% | 43.46% |
| `fast-verified` | $0.011 | 45 ms | 98.77% | 98.77% |

With latency first, a $0.012 limit selects `fast-verified`, $0.009 selects `balanced-verified`, and $0.007 selects `budget-verified`. With price first and a $0.012 limit, it selects `budget-verified`. At $0.001, the $0.0008 preview passes all 520 routine trials but misses the refund in the targeted check. The selector abstains. Other cases exercise missing quotes, sparse evidence, timeouts, and a dominated candidate.
