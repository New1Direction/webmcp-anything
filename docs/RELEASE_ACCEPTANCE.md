# Browser and Stripe release acceptance

This document separates automated simulation from actual external-system acceptance.
**Do not claim production readiness from mocked Chrome or Stripe results.**

## Automated tests

- `cd worker && npm run verify`: TypeScript, Vitest, signed Stripe-webhook/unit checks, checkout-to-fulfillment simulation, malicious page-message rejection, and URL/origin controls.
- GitHub Actions `browser-acceptance`: headless Chromium executes the actual `extension/content.js` and `extension/injected.js` and tests discovery, browser-local tool execution, same-tab navigation and forged write blocking using a simulated `document.modelContext`.
- Also loads the real unpacked MV3 extension in headless Chromium using a **temporary localhost-only host permission in the test fixture**, without changing the shipped extension permissions.
- The separate `webmcp-native` CI job runs `worker/test/webmcp_native.test.ts` in Chrome with native WebMCP enabled. The tool-lab workflow also checks native browser contracts. These tests do not replace the manual checks below or use a real Stripe account.

## Manual native-WebMCP acceptance (still required)

Use a supported browser/build with the native WebMCP feature enabled on a controlled HTTPS test domain.
1. Register a harmless read-only test tool using the specification's `document.modelContext.registerTool`.
2. Open the extension and choose **Enable WMCP on this tab**, if not already enabled. Confirm the native tool appears and inferred read-only tools appear without duplicate names.
3. Execute the native read tool from the extension popup and verify the site's current UI changes.
4. Register a consequential tool and verify a deliberate popup Run action **and** an additional confirmation are required. Never submit a purchase, transfer or real credential in the acceptance environment.
5. From the page console, attempt to spoof `window.postMessage` containing `type: "EXECUTE"`. Verify no privileged extension `EXECUTE_TOOL` background message fires.
6. Change routes via `history.pushState` and unregister the previously exposed tool. Confirm stale tools are no longer executable.
7. Test without native WebMCP support. The extension may expose inferred read snapshots, but it must not claim there is a native API.
8. Regression-test allowlisted QuickCatch product pages, paid/free watch states, and the extension popup.

Record browser version, enabled flags/origin trial, build SHA and outcome. Native availability is a product/browser setting, not inferred from the CI shim.

## Real Stripe **test-mode** acceptance (still required)

Use a separate Stripe test account or test-mode API keys (`sk_test_...` only). Never enter credentials in a GitHub PR, chat or source file.

1. In an isolated development Worker, configure `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_FIX`, `ADMIN_TOKEN`, `LEAD_ALERT_WEBHOOK` (a test destination) and KV bindings. Never point the staging webhook at production KV.
2. Start a **test-mode** Agent-Ready Fix checkout through `POST /api/v1/agent-ready/fix/checkout`. Inspect that Stripe creates a **payment** session, not a subscription, with the correct `metadata.kind`, slug and site URL.
3. Use Stripe's documented test-payment method in the test checkout UI. Do **not** use a real card or switch to live mode.
4. Deliver the signed Stripe event to the isolated Worker via a test-mode webhook endpoint or Stripe CLI. Verify invalid signatures are rejected, and unsigned webhooks are rejected when `ENVIRONMENT=production`.
5. Confirm no unpaid checkout creates a `fix:` order or Verified badge. For asynchronous test methods, confirm the later settlement event is processed.
6. Confirm one pending `fix:` order, a best-effort alert, and no API key minting. Retry the webhook and confirm sequential replay is idempotent. KV is **eventually consistent**: cross-region concurrent exactly-once delivery needs a transactional/durable ledger before strict financial guarantees.
7. As an authenticated admin, open `/dashboard/metrics` in the isolated environment. Confirm the order appears pending and the readiness panel reports only configuration presence.
8. Provide an HTTPS link to a delivered test artifact, mark the order fulfilled, and verify only **then** does `verified:<slug>` appear. Retry completion and verify it is idempotent.
9. Compare Stripe's actual test payment status with internal purchase and fulfillment records. Check refunds/cancel flows against policy before taking live customers.

Do not claim "real Stripe test-mode validated" unless you possess the appropriate account/test credentials and capture the event/Checkout IDs privately in the test record.

## Current release policy

- Branch/PR automated tests passing: necessary but not sufficient.
- Record the outcome of the manual native-browser and QuickCatch packaged-extension checks for each release.
- Record the outcome of a Stripe test-account checkout and webhook before claiming external Stripe validation.
- Production promotion is a separate action; merging code is not the same as deploying Cloudflare Worker or publishing a Chrome Web Store extension.

Record external acceptance results before promoting a release that depends on them.
