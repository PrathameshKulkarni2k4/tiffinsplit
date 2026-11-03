# CLAUDE.md

**Read [AGENTS.md](AGENTS.md) first**, then `DESIGN.md` in full. This file duplicates neither —
duplicated instructions drift, and drifted instructions are worse than none.

Claude Code specifics:

- Shared workflows live in `.agent/commands/*.md`, not `.claude/commands/`, so every tool can use
  them. `.claude/` is fine for Claude-only settings; shared content goes in `.agent/`.
- `.agent/verify.sh` mirrors `.github/workflows/ci.yml`. Do not invent commands from muscle memory
  — there is no `pnpm`, no `jest`, and no `yarn` here.
