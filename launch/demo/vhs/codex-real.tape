# codex-real.tape — drives the REAL codex binary inside a real terminal.
#
# Same approach as claude-real.tape:
#   1. Clean workspace, real codex TUI
#   2. Real model receives our wmcp.sh prompt
#   3. Real Bash/exec tool calls wmcp.sh
#   4. Real response in the real Codex UI
#
# Run:  vhs codex-real.tape

Output ../out/wmcp-codex.mp4

Set Shell "bash"
Set FontSize 16
Set FontFamily "JetBrains Mono"
Set Width 1400
Set Height 820
Set Theme "tokyonight"
Set Padding 20
Set TypingSpeed 18ms
Set Framerate 30

# Off-camera setup
#   - Neutral workspace path (no personal username)
#   - HOME=/tmp/wmcp-demo-home: clean config with just auth.json + empty
#     config.toml, so codex doesn't print plugin/skill/hook errors
#   - Custom PS1 so the shell prompt doesn't reveal user/host
Hide
Type "export HOME=/tmp/wmcp-demo-home"
Enter
Type "export PS1='$ '"
Enter
Type "cd /tmp/wmcp-demo"
Enter
Type "clear"
Enter
Show

# Launch real Codex with the clean HOME
Type "codex --ask-for-approval never --sandbox danger-full-access"
Enter

# Codex TUI ramps up. /tmp/wmcp-demo is pre-trusted in the clean config,
# so no trust dialog appears.
Sleep 4s

# Real demo prompt
Type "Use curl to fetch https://wmcp.sh/api/v1/tools?url=https://api.llama.fi/protocols and tell me what MCP tools wmcp.sh exposes for DefiLlama. One paragraph answer."
Sleep 800ms
Enter

# Wait for real model + real tool call + real response
Sleep 32s
