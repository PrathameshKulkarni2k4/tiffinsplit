# .agent/ — the repo's instruction layer

The shared, tool-agnostic counterpart to `.claude/`. One set of instructions serves every agent
instead of each tool growing its own drifted copy.

```
.agent/
  verify.sh            mirrors .github/workflows/ci.yml — the definition of done
  context/
    phase.md           what is built, what is next, what is deliberately not built
    testing-map.md     what is tested, what cannot be, where a new test belongs
    env.md             env vars, local Supabase, migrations, staging vs prod
  commands/            reusable recipes ("prompts as files")
    onboard.md  plan.md  review.md  fix-issue.md  ship.md
  decisions/           short ADRs: why it is this way
```

## What is deliberately not here

- **`architecture.md` and `gotchas.md`** — `DESIGN.md` already is both, and it is better than
  anything a second file would say. Duplicating it would create two records that drift apart.
- **A CI workflow** — `.github/workflows/ci.yml` already runs install, typecheck, lint, test and
  build on every PR. `verify.sh` mirrors it rather than adding a second, weaker gate.

## How each tool uses it

| `.claude/` concept | Here | Ports? |
|---|---|---|
| `CLAUDE.md` project memory | `AGENTS.md` + `CLAUDE.md` pointer | Yes — the important one |
| `.claude/commands/*.md` | `.agent/commands/*.md` | Yes — recipes are just text |
| `.claude/agents/*.md` subagents | a role spec in `commands/`, handed to a subagent | Partly |
| `settings.json` permissions | — | No. State prohibitions in `AGENTS.md` §6 |
| hooks (run on edit / stop) | — | No. `verify.sh` + CI are the enforcement point |
| `.claude/skills/` | — | No. Skill loading is host config, not repo content |

## The one rule that keeps this working

**Progressive disclosure.** `AGENTS.md` stays short and acts as an index; detail lives in
`DESIGN.md`, `README.md` and `context/`. Context is a budget — an agent that reads 3,000 lines of
preamble before seeing your code is a worse agent, not a better one.

Corollary: review this folder like code. An instruction that contradicts the code is a bug, and it
is more dangerous than no instruction, because an agent follows it with total confidence.
