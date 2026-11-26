# QuickCatch browser extension

This Chrome Manifest V3 extension provides retailer-specific product and restock tools and an optional in-tab WebMCP integration. The repository contains the packaged service-worker bundle, so it can be loaded from a checkout.

## Load locally

1. Open `chrome://extensions` in Chrome or a compatible Chromium browser.
2. Enable **Developer mode**, choose **Load unpacked**, and select this `extension/` directory.
3. Open a supported retail page and use the extension popup. For another HTTP(S) site, open the popup and choose **Enable WMCP on this tab**.

Retail sites listed in [manifest.json](manifest.json) have automatic content-script access. On other sites, activation uses the existing `activeTab` and `scripting` permissions for the current tab. Native site tools require a compatible browser and stay in the tab; calling a tool is initiated in the popup. The [browser integration guide](../docs/BROWSER_WEBMCP.md) describes permissions, privacy, and limitations.

## Develop and test

The manifest loads `background.bundle.js`. After changing `background.js` or a shared adapter it imports, run `./scripts/build_extension.sh` from the repository root and include the updated bundle. The extension also has tests in `worker/test/`; run `cd worker && npm install && npm run verify` from a fresh checkout.
