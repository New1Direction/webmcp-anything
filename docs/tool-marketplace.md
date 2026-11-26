# A marketplace for reusable agent tools

Start with one recurring job, one shared outcome contract, and two independent implementations. The buyer can switch providers without changing their workflow. The developer can publish their own release, see which cases it must pass, and reconcile each fulfilled purchase against a disclosed payout. WMCP’s role is discovery, compatibility evidence, and settlement records.

## What to reuse

| Layer | Existing interface | WMCP’s role |
| --- | --- | --- |
| Publisher identity and releases | MCP Registry `server.json`, authenticated namespace, package or remote location | Import and preserve the upstream release identity. Treat ownership evidence and compatibility findings as distinct fields. |
| Invocation | MCP `tools/list` and `tools/call`, with schemas for the request and structured result | Index individual tools by outcome. Bind results to the pinned tool version and check the task contract before counting a fulfillment. |
| Discovery | Registry APIs distribute server metadata. WMCP already has a directory, tool fingerprints, and an outcome index. | Keep listings portable and searchable by intent. Let callers compare tools using their own budget and required service objectives. |
| Compensation | x402 and MPP both have payment specifications. WMCP already has a configurable x402 paid-execution route. | Keep one quote and fulfillment receipt model. Reconcile those records with the payment rail and developer payout records. |
| Pricing precedent | Apify offers pay-per-event and usage pricing, with computation costs affecting creator margin. | Quote one accepted outcome and include every buyer-facing charge in the ceiling. Model developer margin after failed attempts and maintenance. |

[MCP Registry publishing requirements](https://github.com/modelcontextprotocol/registry/blob/main/docs/reference/server-json/official-registry-requirements.md) · [Registry aggregator guidance](https://github.com/modelcontextprotocol/registry/blob/main/docs/modelcontextprotocol-io/registry-aggregators.mdx) · [MCP tool specification](https://modelcontextprotocol.io/specification/2025-11-25/server/tools) · [x402 specification and schemes](https://github.com/x402-foundation/x402) · [MPP specifications](https://paymentauth.org/) · [Apify pay-per-event economics](https://docs.apify.com/actors/monetize/pay-per-event).

The official registry supplies authenticated server identity and metadata for downstream aggregators. Ownership, trust, runtime compatibility, and user authorization each need their own evidence. A listing should carry the release fingerprint, observed structured-result contract, the exact outcome version, probe timestamp, and support horizon. Preserve source references when aggregating catalogs so two mirrors of the same tool appear as one release. [MCP Registry aggregator guidance](https://github.com/modelcontextprotocol/registry/blob/main/docs/modelcontextprotocol-io/registry-aggregators.mdx) · [MCP tool specification](https://modelcontextprotocol.io/specification/2025-11-25/server/tools).

## Smallest working prototype

The local marketplace sells one outcome, `mcp-tool-drift/v1`. Given two complete WMCP Doctor snapshots from the same endpoint, it returns sorted lists of added, removed, and changed tool definitions. A CI client can use the same request and result shape for either seller. Each known change is a reason to review a release. Fingerprints by themselves cannot distinguish breaking changes from revised descriptions.

~~~sh
node examples/tool-marketplace/demo.mjs --list --goal "compare MCP snapshots"
node examples/tool-marketplace/demo.mjs --max-credits 10
node examples/tool-marketplace/demo.mjs --max-credits 20 --release 'com.dev-two/releases@1.0.0#review_release'
node examples/tool-marketplace/demo.mjs before.json after.json --max-credits 10
~~~

Use Doctor’s JSON output as the last command’s input. The catalog lists the typed contract, version, support expiry, probe expiry, and quoted fee split. The purchase returns the diff, a fulfillment receipt, and a seller statement. A ceiling of 9 produces `no-feasible-offer` with exit code 2. The prototype runs on Node with in-memory test credits, fixture publishers, and operator-bound implementations. Public registry imports, remote MCP calls, and real settlement are integration work.

### Publisher and buyer workflow

1. The publisher supplies a `wmcp-tool-offer/v1` with `server`, `contract`, `outcome`, `priceCredits`, `maintainer`, and `maintenance`. The local operator config maps authenticated publisher identities in the fixture to namespaces and binds a trusted implementation to `server@version#tool`. The server descriptor uses the name, description, and version fields from `server.json`. The existing WMCP tool contract describes typed inputs and outputs, authorization, effects, and failure behavior.
2. Admission requires a public implementation with no declared external effects. Every request admitted by the shared outcome must fit the provider input schema, and every provider output must fit the outcome schema within WMCP’s supported subset. An independent evaluator checks added, removed, changed, unchanged, and empty-side cases. The release and its terms are immutable, and listings expire after seven days of stale proof or at the support deadline. Publishers can rerun probes or retire releases.
3. A buyer searches an exact outcome ID or a phrase from the outcome vocabulary and sees offers within the credit ceiling. The trial catalog uses price order after conformance. A live catalog should feed representative correctness, completion, and latency evidence to the existing WMCP tool selector before applying the buyer’s ranking preferences.
4. The quote binds buyer, release, inputs, amount, and expiry. The buyer’s approved ceiling and balance are checked before invocation. A typed result also has to satisfy the outcome verifier before a charge or payout is recorded. A parseable but false result receives a zero-charge failure receipt. The same buyer retrying an already consumed quote receives the same receipt.
5. The seller statement joins fulfillment records on the quote ID and release and includes the split, timestamp, and support-cost forecast. The receipt includes hashes of the offer, input, and any accepted result. Seller statements omit the buyer’s input and result payloads.

[Tool contract format](tool-contract.md) · [WMCP tool selector and service objectives](tool-selection.md).

## Maintenance and compensation

Set `P` to the all-in quoted price and `f` to a fee in basis points. In the prototype, the platform receives `floor(P × f / 10000)` on fulfillment and the seller receives the remainder. A failure creates zero payable credits. A live settlement record also needs currency, external fees, refunds or adjustments, and the payout reference. A payment receipt proves the payment event, and verification of the delivered output establishes fulfillment separately.

The developer models expected margin per attempt as `seller share × fulfillment rate − variable attempt cost`. Failed attempts consume compute and count toward variable cost. Fixed monthly costs include support, dependency updates, release validation, and any minimum hosting or licensing costs. When per-attempt margin is positive, monthly break-even attempts are fixed costs divided by that margin and rounded up. When it is zero or negative, increasing volume cannot cover positive fixed costs.

The two offers assume the same 98% fulfillment rate, 100 attempts per month, and a 10% fee. These are illustrative test-credit assumptions, including the fee.

| Offer | Buyer pays | Seller / platform | Monthly fixed / variable per attempt | Break-even attempts | Net at 100 attempts |
| --- | ---: | ---: | ---: | ---: | ---: |
| `compare_surface` | 10 | 9 / 1 | 450 / 2 | 66 | 232 |
| `review_release` | 20 | 18 / 2 | 800 / 4 | 59 | 564 |

The higher-priced offer breaks even sooner at the same volume and fulfillment rate. Demand can move to the lower-priced seller, so compare cost forecasts at multiple volumes and fulfillment rates. In a pilot, track marketplace verification, support, refunds, and payment processing costs separately from seller costs. A tool that requires an oracle as expensive as execution may have little margin for a middle layer.

## Where incentive problems show up

| Risk | Observable signal | Policy to test |
| --- | --- | --- |
| Paying for calls rewards retries, partial answers, and invalid output | Cost per accepted outcome rises while calls per outcome rise | Charge once per independently accepted outcome. Bind retry to the same quote and make failure charges visible. |
| Commission steers buyers toward expensive or affiliated suppliers | Ranking changes with commission under identical buyer preferences | Keep payouts outside relevance scoring. Publish ranking factors and let buyers pin a provider. |
| Sellers train to shallow checks, manufacture usage, or flood the catalog with aliases | Self-funded traffic, duplicate provenance, good published scores with poor holdout results | Give separately sourced probe outcomes and repeat independent buyers more weight than raw call volume. Review exact and near-duplicate offers under the same namespace. |
| Low prices starve maintenance or shift cost onto buyer retries | Stale proof, slow fixes, falling seller margin, repeat abandonment | Show support dates and sample freshness. Age out stale offers and let publishers model downside before setting prices. |
| Provider-defined dialects and names fragment demand | A provider change requires a new caller adapter or credentials | Publish versioned outcome profiles with shared I/O and contract tests. Preserve upstream identities. Use portable quote and receipt fields across catalogs and rails. |
| Marketplace exclusivity and mandatory accounts trap developers | A listing or client stops working when the distributor changes | Keep standard MCP access and independent publication. Export catalog and receipt data, preserve retired release references, and document migration conditions. |
| Payment and fulfillment diverge | Processor reports settlement while the result is missing, invalid, or delivered twice | Use a durable ledger keyed by the buyer and quote. Reconcile payment events and fulfillment before releasing proceeds, with defined compensation for any charge collected before a failed delivery. |

## Pilot decision

Compare the prototype outcome to the existing free Doctor workflow. Doctor already computes drift, so the paid offer needs to save setup time across clients, provide meaningful maintained compatibility evidence, or supply a richer independently checked migration report. The working demo establishes interoperability and accounting. Willingness to pay and developer viability need a real cohort.

Trial one outcome with two independent sellers, two client integrations, and five teams already running release checks. Set provisional gates before recruiting. Require both integrations to switch between both sellers without input or output changes. Track setup time, total cost per accepted result, accepted-result quality, replay and failure accounting, seller contribution margin, and support hours. Continue only if buyers repeat without subsidy and both sellers can reach positive contribution margin at observed prices and workload. Measure platform contribution after verification and settlement costs before expanding. Share aggregate numbers without buyer payloads.

For a live pilot, use one payment integration and keep the outcome contract independent of it. Pin package or deployed artifact provenance alongside the release. Replace the in-memory debit with durable spend reservations, verified fulfillment, payout reconciliation, and explicit handling of unknown outcomes. Require the caller’s authorized budget and enforce the tool’s own access policy at execution. The existing WMCP x402 route has a configured payee. The marketplace would need separate quote-bound receipts and seller accounting before reusing that route for third-party sales. [x402 settlement schemes](https://github.com/x402-foundation/x402) · [MPP specifications](https://paymentauth.org/).
