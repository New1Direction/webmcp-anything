# Browser WebMCP integration (October 2026 draft)

This integration has **two separate execution environments**. Treat them as distinct security boundaries.

## What works on this branch

- worker/src/webmcp_bridge.ts: one extraction emits remote MCP tools and a site-owner-installed browser shim. The shim prefers document.modelContext and supports older navigator.modelContext previews, with abort-based registration cleanup.
- extension/injected.js: discovers tools registered by the currently open website via document.modelContext.getTools(). Site-owned native tools take precedence over WMCP-inferred tools with the same name.
- extension/content.js: transfers only native tool **metadata** into the extension and relays explicit user-triggered calls back into the same page via document.modelContext.executeTool(registeredTool, args). It never transfers executable JS functions or site cookies.
- extension/popup.js: shows both native and inferred tools; runs native tools in the tab after the user clicks Run. Non-read-only tools require an additional confirmation. Annotations come from the website and are **not** proof that a tool is harmless.
- Retail allowlisted sites load automatically. Other HTTP(S) sites can be activated using **Enable WMCP on this tab**. This uses the existing activeTab and scripting permissions, without blanket access to every site.

**Privacy:** The browser-native tool definitions and results stay inside that tab and the extension. No new server endpoint uploads native tool metadata or performs remote native execution. Existing optional inferred-schema cache uploads and the separate API-capture feature still behave according to their existing settings.

## Manual acceptance test

1. Open a website registering a harmless WebMCP test tool, in a supported browser with the feature enabled.
2. Open the extension popup; click **Enable WMCP on this tab** if needed.
3. Verify the website's native tool appears alongside any inferred tools.
4. Run a read-only tool and verify the website's own callback executes, with the current result displayed in the popup.
5. Run an action lacking readOnlyHint: the popup must ask for confirmation first.
6. Navigate the tab to another route or site. No stale native tools should remain invokable.
7. In an unsupported browser, test local inferred tools; the window.webmcp test helper is **not** a native API.
8. Verify older Shopify and QuickCatch flows still work on allowlisted sites.

Automated tests: cd worker && npm run verify.

## Not yet implemented: browser-native → remote MCP relay

Do not expose native page tools as remotely executable MCP operations until the session bridge is security reviewed. A production implementation needs:

- Explicit per-tab **Enable remote access** consent distinct from local discovery, showing which tools are shared and a visible Stop control.
- Short-lived authenticated pairing for one user, one browser, one tab and one origin; revoked on navigation, tab close, logout or timeout.
- Narrowly scoped session grants instead of sharing the main WMCP API key with pages. No cookies, access tokens, scripts or arbitrary HTML uploaded.
- Read-only calls initially, guarded by independent policy because website-supplied readOnlyHint is untrusted. Consequential actions require per-call human approval.
- A durable request/result queue with request IDs, expiry, replay protection, cancellation and rate limits. Cloudflare KV is eventually consistent; Durable Objects are a stronger fit for interactive request queues.
- Strict cross-account and cross-origin isolation, response byte limits, auditing and kill-switch integration.
- Tests for tab navigation, revoked permissions, browser restarts, duplicate calls and spoofed page bridge messages.

Keep remote execution in a **separate reviewed change**. This branch deliberately stops at local user-triggered browser execution.

## References

- https://webmachinelearning.github.io/webmcp/
- https://developer.chrome.com/docs/ai/webmcp/imperative-api
