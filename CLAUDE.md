# CLAUDE.md

## STANDING RULES (non-negotiable â€” added 2026-06-26)
1. RESPONSIVENESS via SUBAGENTS: Run EVERY task through a subagent so the main thread stays free to reply to the user the INSTANT they message. Never block the main thread on long-running work. Acknowledge the user immediately, every time, and timestamp every message.
2. ZERO SHELL SYNTAX ERRORS: Never produce a terminal/PowerShell/bash command with a syntax or quoting error. No inline nested quotes, no pipes-inside-grep-patterns, no `< /dev/null` on the receiving end of a pipe, no `$(...)` inside double-quoted ssh remote args, no unquoted parens. Put non-trivial commands in a script FILE and run it by path; trace the full PowerShell->WSL->bash->ssh->remote parse chain before running.
