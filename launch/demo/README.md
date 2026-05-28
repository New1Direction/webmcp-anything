# wmcp.sh launch demo videos

Four clips for the launch — three web-style UIs (Playwright) and two
terminal-style demos (VHS driving real Claude Code / Codex binaries).

## Output

```
out/wmcp-agent.mp4         18.6s   Claude.ai-style · Pokemon ETB restock watch
out/wmcp-claude-code.mp4   29.8s   REAL Claude Code binary · MCP query
out/wmcp-codex.mp4         40.2s   REAL Codex CLI · MCP query
out/wmcp-grok.mp4          12.8s   SuperGrok Heavy · 16-agent synthesis
```

All four are 1280×760-ish H.264 MP4 with `+faststart`, Twitter/HN/Substack-ready.

## Rebuild

### Web demos (Playwright + HTML mockups)

```bash
npm install
npm run record:all        # records all four web-style clips
# OR
node record_all.mjs grok  # one at a time
```

### Terminal demos (VHS + real binaries)

VHS drives a real ttyd terminal running the real `claude` / `codex` binaries.

Prerequisites:
- `brew install vhs ttyd ffmpeg`
- `claude` and `codex` installed + logged in
- `/tmp/wmcp-demo` exists (or trust the workspace dir Claude/Codex prompt for)

```bash
# Claude Code
cd vhs && vhs claude-real.tape
# Output: ../out/wmcp-claude-code.mp4 — then a precise ffmpeg drawbox masks
# the welcome-banner email line; the auth display fields are scrubbed in
# ~/.claude.json before recording (chflags uchg to make sticky) and the
# original is restored after.

# Codex
cd vhs && vhs codex-real.tape
# Uses HOME=/tmp/wmcp-demo-home with a minimal config to avoid plugin/skill
# spam in the Codex startup.
```

### Privacy notes baked into the recipes

- Workspace is `/tmp/wmcp-demo` (no username in cwd paths).
- Codex uses `HOME=/tmp/wmcp-demo-home` with a stripped config — no plugin
  / skill / hook errors print during startup.
- Claude: `~/.claude.json` `oauthAccount.{emailAddress,displayName,
  organizationName}` are scrubbed to "Demo" / "demo@wmcp.sh" before recording;
  `chflags uchg` keeps Claude from rewriting them mid-session. After
  recording, the original file is restored from `.live-bak`.
- Terminal prompt is set to `$ ` via `PS1` so no `user@host` is visible.

## Source layout

```
launch/demo/
├── README.md                this file
├── package.json             Playwright deps for web demos
├── record.mjs               legacy: page-scroll tour (kept as B-roll)
├── record_agent.mjs         legacy: agent demo single-clip recorder
├── record_all.mjs           current: records all four web clips
├── demo.html                Claude.ai-style · Pokemon ETB restock (Playwright)
├── demo-claude-code.html    Claude Code HTML mockup (legacy, replaced by VHS)
├── demo-codex.html          Codex HTML mockup (legacy, replaced by VHS)
├── demo-grok.html           SuperGrok Heavy · 16-agent (Playwright)
├── anim.js                  shared typing/scroll animation helpers
└── vhs/
    ├── claude-real.tape     drives real `claude` binary
    └── codex-real.tape      drives real `codex` binary
```
