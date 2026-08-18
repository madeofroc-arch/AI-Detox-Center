# Human Mode — AI Detox Center

> Detoxing from AI is not about not using AI.
> It is about not letting AI replace your brain.

**Human Mode** is an open-source app for **AI dependency management and
independent thinking training**. AI should augment human thinking, not
replace it.

## What is Human Mode?

Most tools treat "too much AI" as a screen-time problem and reach for
blockers. Human Mode disagrees: the problem is not how *much* you use AI —
it is the quiet behavioral shift from

```
Think -> Try -> Get Stuck -> Hint -> Think Again -> Solve -> Reflect
```

to

```
Question -> AI -> Copy -> Next Question
```

Human Mode measures that shift honestly, inserts a calm moment of intention
before you reach for AI, and retrains the human capabilities that atrophy
first — thinking, writing, memory, decision making, focus.

## Why does it exist?

Because the people who use AI the most are the first to notice their own
thinking getting outsourced — and the tools they are offered are either
abstinence apps or engagement machines. Human Mode is neither. It is built
to make itself less necessary.

## Core philosophy

1. The goal is not to eliminate AI.
2. The goal is to eliminate unconscious dependence on AI.
3. AI should augment human intelligence, not replace human thinking.
4. The best outcome is that users eventually need the app less.
5. Privacy comes before personalization.
6. Local-first by default.
7. No shame-based design.
8. No manipulative engagement loops.
9. No fear-based messaging.
10. The product should train independence, not create another dependency.

## Features (MVP)

- **AI Dependency Score** — deterministic, transparent, config-driven; built
  from behavior patterns (did you try first? who decided?), never from raw
  usage time. Every score comes with a per-factor explanation.
- **AI Gate** — a self-directed pause before using AI: name your intention,
  optionally attempt first for three minutes, then choose. The gate never
  blocks and never shames.
- **Detox Mode** — focused work blocks without AI. Ending early is data,
  not defeat.
- **Daily Human Challenge** — one challenge per day across nine
  capabilities (Thinking, Creativity, Writing, Memory, Decision Making,
  Problem Solving, Communication, Learning, Focus), with adaptive
  difficulty.
- **Reflection** — short optional prompts that turn experience into
  awareness.
- **Progress & Brain Report** — additive progress records and a score
  breakdown that always explains itself.
- **Privacy controls** — one-tap JSON export and full deletion.

## Privacy

**Your thinking data stays on your device by default.** No account, no
backend, no analytics, no network calls anywhere in the MVP codebase. Any
future cloud feature will be explicit opt-in and must leave the local-only
mode fully functional. See
[docs/architecture/privacy.md](docs/architecture/privacy.md).

## Architecture

```
apps/mobile        Expo app (Android / iOS / Web) — thin UI layer
packages/core      @ai-detox/core — pure TypeScript domain engine
docs/              product, design, and architecture documentation
.claude/skills/    5 development skills for AI coding agents
```

The core engine is deterministic and works with **no LLM API at all**:
scoring, gate, detox, challenges, XP, progress, reflection, and storage are
all AI-independent by architecture (see
[ADR-0004](docs/architecture/adr/0004-deterministic-scoring-no-llm-core.md)).

More: [docs/architecture/technical-decisions.md](docs/architecture/technical-decisions.md)
· [skill system](docs/architecture/skill-system.md)

## Screenshots

The calm, paper-and-ink "Quiet Mind" design system — see
[docs/design/design-system.md](docs/design/design-system.md). Screenshot
assets: coming with the first release.

## Getting started

```bash
git clone <repo-url>
cd ai-detox-center
npm install

# run the app (web)
npm run web --workspace @ai-detox/mobile

# run on a device
npm run start --workspace @ai-detox/mobile   # scan with Expo Go
```

Requires Node 20+.

## Development

```bash
npm run lint         # all workspaces
npm run typecheck    # all workspaces
npm test             # core unit tests (Vitest)
npm run build        # core tsc build + app web export
```

Read [CLAUDE.md](CLAUDE.md) (works for humans too) for architecture rules,
and [docs/architecture/skill-system.md](docs/architecture/skill-system.md)
for how work is divided.

## Testing

Domain logic lives in `packages/core` and is fully unit-tested — scoring
determinism, gate/detox state machines, challenge selection, streak/XP, and
storage migrations. UI-level tests are a Phase 2 roadmap item.

## Contributing

Contributions welcome — see [CONTRIBUTING.md](CONTRIBUTING.md). Good first
issues are labeled `good first issue`. The short version: read the owning
skill in `.claude/skills/`, follow its done criteria, keep CI green.

## Roadmap

See [docs/product/roadmap.md](docs/product/roadmap.md). Highlights: richer
reports, i18n (zh-TW first), opt-in OS-level gate entry points, community
challenge packs. Never on the roadmap: ads, data sales, engagement
mechanics, surveillance features.

## License

[MIT](LICENSE)
