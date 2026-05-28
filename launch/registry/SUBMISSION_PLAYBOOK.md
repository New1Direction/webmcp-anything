# wmcp.sh — registry submission playbook

Pre-flight done:
- ✅ Repo flipped public: https://github.com/New1Direction/webmcp-anything
- ✅ Secret scan: zero hits
- ✅ /llms.txt + /llms-full.txt live
- ✅ Sitemap.xml current with 44+ URLs

## Order of operations (do top-to-bottom)

### TIER 1 — start today

#### 1. Bing IndexNow (5 min)

Key generated: `210a4c52878584d7ea9f50b95f8f58cd`

File already dropped at: `worker/public/210a4c52878584d7ea9f50b95f8f58cd.txt`

**After next `wrangler deploy`**, verify it's live:
```
curl https://wmcp.sh/210a4c52878584d7ea9f50b95f8f58cd.txt
# should return: 210a4c52878584d7ea9f50b95f8f58cd
```

Then ping IndexNow with your sitemap URLs (one-shot, post-deploy):
```bash
curl -X POST 'https://api.indexnow.org/IndexNow' \
  -H 'Content-Type: application/json' \
  -d '{
    "host": "wmcp.sh",
    "key": "210a4c52878584d7ea9f50b95f8f58cd",
    "keyLocation": "https://wmcp.sh/210a4c52878584d7ea9f50b95f8f58cd.txt",
    "urlList": [
      "https://wmcp.sh/",
      "https://wmcp.sh/agent-ready",
      "https://wmcp.sh/managed",
      "https://wmcp.sh/directory",
      "https://wmcp.sh/blog",
      "https://wmcp.sh/llms.txt",
      "https://wmcp.sh/llms-full.txt",
      "https://wmcp.sh/sitemap.xml"
    ]
  }'
```

This also feeds Yandex + Seznam.

#### 2. Bing Webmaster Tools (10 min)

1. Go to https://www.bing.com/webmasters
2. Add site → enter `https://wmcp.sh`
3. Verify: pick **XML file** option, drop `BingSiteAuth.xml` they give you into `worker/public/`, redeploy
4. Submit sitemap: `https://wmcp.sh/sitemap.xml`
5. Open AI Performance dashboard once it's verified — shows citations from Copilot/Bing AI.

#### 3. Google Search Console (10 min)

1. Go to https://search.google.com/search-console
2. Add property → Domain (root) → `wmcp.sh`
3. Verify via DNS TXT at Cloudflare. Add at zone `wmcp.sh`:
   ```
   Type: TXT
   Name: @
   Content: google-site-verification=<value-google-gives-you>
   TTL: Auto
   ```
4. Submit sitemap: `sitemap.xml`
5. Check Performance → Search type = Web — AI Overviews + AI Mode citations appear here since late 2025.

#### 4. Official MCP Registry — via GitHub OAuth (the repo is now public)

Since the repo is public, we can use the easier GitHub OAuth route instead of DNS TXT.

```bash
# Install the publisher CLI (first time only)
npm install -g @modelcontextprotocol/publisher
# or follow the install at https://modelcontextprotocol.io/registry/quickstart

mcp-publisher login github          # opens browser, oauth as New1Direction
mcp-publisher publish launch/registry/server.json
```

Server entry: `io.github.New1Direction/webmcp-anything` — namespace authenticated by your GitHub ownership.

ETA: same-day inclusion. PulseMCP auto-pulls within a week.

#### 5. Anthropic Connectors Directory (longest review — start NOW)

URL: https://claude.com/docs/connectors/building/submission

The form expects these fields — paste verbatim from `launch/registry/anthropic-form-payload.md`.

Before submitting, double-check:
- Every tool returned by `/api/v1/tools` has `readOnlyHint:true` or `destructiveHint:true` (Anthropic's #1 rejection reason)
- Privacy policy URL works
- 3+ usage examples in docs

Review window: ~2 weeks.

---

### TIER 2 — this week

| # | Registry | Mechanism | Time |
|---|---|---|---|
| 6 | Glama.ai | Form at https://glama.ai/mcp/servers (Add Server) | 5 min |
| 7 | MCP.Directory | Form at https://mcp.directory/submit | 5 min |
| 8 | Smithery.ai | CLI: `smithery auth login && smithery namespace create wmcp && smithery mcp publish https://wmcp.sh/api/v1/tools -n wmcp/anything` | 10 min |
| 9 | mcp.so | Form (check their submit page) | 5 min |
| 10 | Cursor Directory | Submit a plugin button at https://cursor.directory | 5 min |
| 11 | llmstxthub.com | Form at https://llmstxthub.com | 5 min |
| 12 | llmstxt.site | Form at https://llmstxt.site/submit | 5 min |
| 13 | awesome-mcp-servers PR | `gh repo fork punkpeye/awesome-mcp-servers` → add line → PR | 10 min |
| 14 | TensorBlock/awesome-mcp-servers PR | same pattern, faster merges | 10 min |
| 15 | thedaviddias/llms-txt-hub PR | YAML/JSON entry depending on repo format | 10 min |
| 16 | ChatGPT App Directory | https://platform.openai.com/apps-manage — identity verification + form | 30 min |

---

### TIER 3 — coordinated launch week

| # | Where | Notes |
|---|---|---|
| 17 | Show HN | Title: "Show HN: wmcp.sh – turn any URL into agent-callable MCP tools". Tues–Thurs 8–10am ET. Public repo + live demo URL in body. |
| 18 | Product Hunt | Tuesday launch, US-evening upvote push. Standard form (tagline + gallery + makers). |

---

### Tracking

After each submission, log it here. Update as inclusion is confirmed.

| Registry | Submitted | Status | URL once live |
|---|---|---|---|
| Bing IndexNow | | | |
| Bing Webmaster | | | |
| Google Search Console | | | |
| Official MCP Registry | | | |
| Anthropic Connectors | | | |
| Glama.ai | | | |
| MCP.Directory | | | |
| Smithery.ai | | | |
| mcp.so | | | |
| Cursor Directory | | | |
| llmstxthub | | | |
| llmstxt.site | | | |
| punkpeye PR | | | |
| TensorBlock PR | | | |
| llms-txt-hub PR | | | |
| ChatGPT Apps | | | |
| Show HN | | | |
| Product Hunt | | | |
