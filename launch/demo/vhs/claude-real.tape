# claude-real.tape — drives the REAL claude binary inside a real terminal.
#
# Flow:
#   1. Open clean workspace (trusted via prior use)
#   2. Run `claude` — full TUI opens
#   3. Type a wmcp.sh-related prompt
#   4. Real Claude responds, uses its Bash tool to curl wmcp.sh
#   5. Real response rendered in real terminal
#
# This is the 100%-authentic Claude Code recording the user signed off on.

Output ../out/wmcp-claude-code.mp4

Set Shell "bash"
Set FontSize 16
Set FontFamily "JetBrains Mono"
Set Width 1280
Set Height 760
Set Theme "Catppuccin Mocha"
Set Padding 18
Set TypingSpeed 18ms
Set Framerate 30

# Set up the environment off-camera
#   - Neutral path /tmp/wmcp-demo (no username in cwd)
#   - Neutral PS1 (no user@host in the shell prompt)
Hide
Type "export PS1='$ '"
Enter
Type "cd /tmp/wmcp-demo"
Enter
Type "clear"
Enter
Show

# Launch the real Claude Code TUI. We use the user's real HOME because
# Claude's auth lives in macOS Keychain, not in HOME — so HOME override
# breaks auth. Instead we mask the email/org line via ffmpeg post-process
# (see vhs/postprocess.sh).
Type "claude --permission-mode bypassPermissions"
Enter

# Claude TUI ramps up + may show a "trust this folder?" dialog for /tmp/wmcp-demo.
# Default selection is "Yes, I trust this folder" — Enter accepts.
Sleep 3s
Enter
Sleep 2s

# Short prompt → quick tool call → terse response. Keeping the demo brief
# means the welcome banner stays put (doesn't scroll up + move the email
# line to a different y position, which breaks the post-process mask).
Type "Curl https://wmcp.sh/api/v1/tools?url=https://api.llama.fi/protocols. How many MCP tools? One sentence."
Sleep 600ms
Enter

# 20s is enough for one tool call + a short answer
Sleep 22s
