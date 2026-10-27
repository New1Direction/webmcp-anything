# WMCP — First 10 paying customers
October 2026 · Operator playbook · Hypotheses, not revenue forecasts

## What we sell
The proposed browser WebMCP API and script injection are becoming infrastructure.
Cloudflare published an example with Commerce.com on 2026-10-21:
https://blog.cloudflare.com/webmcp-commerce/

Do not sell "one script tag makes agents transact". It does not authorize actions. Sell delivery and demonstrated results:
- **Free proof**: show a specific public URL's discovered tools and what is not verified. Run an actual agent task, where permitted, and keep evidence.
- **Starter / $499 one-time**: fixed-scope 5-page agent-readiness audit, structured-data work, validation/handoff and 30-day support, aligned with /managed. Do not imply unlimited API development or guaranteed agent traffic.
- **Managed Retainer / $999/mo**: ongoing adapter maintenance, support and monitoring for a client whose recurring workflows justify it.
- **API Builder / $39/mo**, Pro / $99/mo and Reseller / $299/mo: authenticated, metered backend tool execution for developers. Browser-embedded JavaScript does not carry these entitlements automatically.
- **Enterprise / $4,999+/mo**: custom scope and SLA; do not promise an SLA or deployment before agreement.

## Best initial buyers
1. Small SaaS teams with a complex, frequently used authenticated workflow where native page tools are useful and a human can demonstrate completion.
2. Independent e-commerce brands with nonstandard catalog, inventory, configuration or returns workflows that a simple edge shim does not solve.
3. Agencies running several customer websites; one repeatable integration template and monthly maintenance may justify the retainer.

Avoid pitching generic WebMCP enablement to every Shopify shop. Cloudflare and platform vendors may ship that cheaply or free. Choose a broken, valuable user workflow, not a website category alone.

## Minimum proof before asking for money
For each prospect:
- Public site URL and an exact task the customer actually values.
- Before: screenshot/recording of failure, unsupported tool or slow workflow, not inferred from a generic badge.
- After: same task completed in a supported browser or a verified test environment; clear success/failure records.
- Auth and approval boundary: what stays in the customer's browser, what needs an authenticated server, what needs human confirmation.
- Outcome: success rate across repeat runs, steps eliminated or time saved, measured rather than promised.

Never say "works everywhere", "boosts traffic", "increase conversion", or "agent-ready" without an evidence-backed scope.

## Revenue funnel
1. Send 10 personalized technical audits to qualified prospects. Mention one observed issue, with a screenshot or short demo; don't send a generic mass pitch.
2. Offer a free 15-minute scoping call or the /agent-ready/fix preview. Ask what action is commercially important to them.
3. Quote Starter if the five-page scope truly solves the problem; otherwise write a custom managed proposal. Do not force every requirement into $499.
4. Use Stripe Checkout only after the operator dashboard indicates all required settings are present and a test-mode payment→signed webhook→paid job alert→fulfillment flow has passed.
5. Deliver, record an HTTPS evidence link, and **only then** mark a paid fix complete in /dashboard/metrics. That action grants the Verified badge.
6. Offer the $999/mo retainer only after evidence demonstrates ongoing maintenance or monitoring value.

## Sales tracking: one week
Use a simple sheet with company/site, target workflow, observed problem, demo evidence URL, contact, date contacted, reply, call, proposal, paid, fulfilled, and next step.
Track: audited sites → personalized outreach → replies → qualified calls → paid orders → fulfilled orders. Revenue is actual Stripe payments, not web traffic or theoretical ARR.
Initial target is 10 real conversations and 1 paid, fully fulfilled pilot. These are goals, not predictions.

## Reusable outreach draft
Subject: One specific agent workflow on [company site]

I tried [exact task] on [public URL] and observed [specific failure or limitation]. I can show the trace and a small browser-level integration that addresses [measurable task]. I run wmcp.sh and offer a fixed-scope agent-readiness setup from $499.

Would a short before/after demo of [task] be useful? No need to share credentials for the first public-page scan.

Only use the failure claim after actually testing it; otherwise ask permission to audit instead.

## Operational gates before taking live payments
At /dashboard/metrics, the **Revenue readiness** panel must show the relevant settings present:
- Stripe secret and signed webhook, relevant price IDs
- Paid order alert webhook
- Email delivery if promising emailed results

These are configuration-only tests, NOT proof of valid Stripe Price objects, live charges or alert delivery. Run an end-to-end **Stripe test-mode** checkout and verify webhook signature, one paid fulfillment order, one operator alert, and idempotent replay. Confirm customer support contact and capacity. Then promote settings deliberately to live mode.
The **Paid fulfillment** panel lists pending orders; it requires an HTTPS evidence URL and explicit admin confirmation before marking a fix fulfilled / Verified.

## What NOT to prioritize yet
- Generic "WebMCP enabled" badges without proof of functioning tasks
- A fully autonomous remote browser relay before consent/auth/revocation are proven
- More SKUs or discounts before a single paying customer can be fulfilled
- Mass cold outreach without audited evidence
