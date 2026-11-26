# GitHub launch for WMCP Doctor

The last public baseline checked on November 25, 2026 was **8 stars and 2 forks**. Use the WebMCP CI check as the launch story. It gives site owners a problem they can reproduce and a GitHub Action they can adopt.

## GitHub About

**Description**

> Catch WebMCP tool regressions in Chrome and MCP contract drift in CI. Compare saved reports offline.

**Topics** — `webmcp`, `mcp`, `model-context-protocol`, `github-actions`, `chrome-devtools-protocol`, `typescript`, `effect-ts`, `rust`, `openapi`, `cloudflare-workers`

Keep `wmcp.sh` as the website. Use the same one-sentence description and missing-tool example in release notes, the demo, and directory entries.

## Launch draft

**Title**

> WMCP Doctor catches missing WebMCP tools before merge

**Copy**

> A shim update on our test taskboard caused Chrome to report zero WebMCP tools. WMCP Doctor compared the preview with the reviewed baseline, reported that `list_tasks` had disappeared, and failed the check. With the fixed shim, Chrome saw `list_tasks` again.
>
> The GitHub Action checks browser registrations and remote MCP tool listings without invoking any tools. If your preview and baseline run in separate jobs, you can compare the saved JSON offline with a TypeScript/Effect 4 CLI and a Rust diff engine.
>
> Run the fixture or try the Action on a preview: https://github.com/New1Direction/webmcp-anything
>
> I’d like to hear which changes you want a check to flag on your own WebMCP page.

Use the draft as a release announcement or technical post. If submitting to Show HN, check its [guidelines](https://news.ycombinator.com/showhn.html) and link directly to the runnable demo.

## Release and follow-up

1. Land the reviewed change after CI. Run the missing-tool fixture from a clean clone and check the native Chrome regression before cutting the release. Link the runnable fixture and the standalone HTML demo. The hosted demo returned HTTP 404 on November 25, 2026, so check it before putting that URL in release copy.
2. Update GitHub About and open two focused starter issues. Ask for a browser-registration regression fixture and a saved MCP report that should compare cleanly after a backwards-compatible change. Link the setup and what a passing test looks like.
3. Share the release with communities that accept project demos. Once an independent project uses the check, link that public example and submit a concise entry to a relevant curated list that accepts additions.
4. Track weekly new stars, unique clones, external Action adoptions you can verify, and first-time contributor PRs. Keep a short log of which links and demos led people to try the Action.
