# Skill System

This repository is developed through five Claude Code skills. Each skill has a
`SKILL.md` in `.claude/skills/<name>/` defining its responsibility, inputs,
outputs, process, prohibitions, and done criteria. Skills are designed so an
AI agent (or a human contributor) can pick one up independently without
overlapping another skill's ownership.

## Dependency chain

```
product-architect          "what are we building, and why"
        |
        v
ux-ui-designer             "how does a human experience it"
        |
        v
adversary-engine           "how does the game measure it"
        |
        v
open-source-engineer       "how does it become reliable OSS"
```

The arrow means "consumes the output of". In practice work iterates: an engine
constraint can push a spec revision upward, but the *authority* for each
question stays with its owning skill.

## Who defines what

| Question | Owner | Artifacts |
| --- | --- | --- |
| What problem, for whom, what scope | product-architect | `docs/product/*` |
| Flows, screens, tokens, tone, accessibility | ux-ui-designer | `docs/design/*`, `apps/mobile/src/theme`, `apps/mobile/src/components` |
| Rounds, boards, run reducer, diagnosis, localisation | adversary-engine | `packages/core/src/{adversary,i18n}/*` |
| Repo structure, CI, tests policy, community files, privacy architecture | open-source-engineer | root files, `.github/`, `docs/architecture/*` |

## Ownership rules

1. **One owner per file.** If a change touches another skill's files, that
   part of the change is done under that skill's rules (read its SKILL.md).
2. **Specs flow down, constraints flow up.** Engines never invent features;
   product never dictates algorithms; design never changes domain logic.
3. **Shared contracts** (the `packages/core` public API, the `StoragePort`
   interface, the design tokens) may only change with both affected owners'
   rules satisfied in the same change.
4. **Philosophy is global.** The 10 product principles in
   `docs/product/vision.md` bind every skill; any skill may veto a change
   that violates them.

## Typical workflows

- **New feature**: product-architect writes the spec, then ux-ui-designer
  designs flow/screens, then the owning engine implements domain logic with
  tests, then ux-ui-designer implements UI, then open-source-engineer
  verifies CI/docs/privacy.
- **Bug fix in the board or the reducer**: adversary-engine only (plus
  changelog by open-source-engineer conventions).
- **New round**: adversary-engine only — and it is not done until the
  arithmetic has been redone by hand in both languages.
- **Release**: open-source-engineer.

## For AI agents

Before working in this repo: read `CLAUDE.md`, identify which skill owns your
task, load that skill, and follow its process and done criteria. If a task
spans skills, sequence it per the workflows above rather than mixing
responsibilities in one step.
