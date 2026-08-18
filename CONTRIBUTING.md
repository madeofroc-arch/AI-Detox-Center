# Contributing to Human Mode

Thanks for wanting to help people take their thinking back. This guide keeps
contributions smooth for humans and AI coding agents alike.

## Ground rules

1. **Philosophy is load-bearing.** Every change must respect the 10
   principles in [docs/product/vision.md](docs/product/vision.md). A PR that
   adds a shame mechanic, an engagement loop, or default data collection
   will be declined regardless of code quality.
2. **Find the owning skill.** Work in this repo is divided across five
   skills in [.claude/skills/](.claude/skills/) (product, design, detox
   engine, challenge engine, OSS engineering). Read the SKILL.md that owns
   your change — it defines scope, process, and done criteria.
3. **Core stays pure.** `packages/core` has no React, no platform APIs, no
   I/O, no network, no nondeterminism. Time and randomness enter as
   parameters.
4. **Tests accompany logic.** Domain changes need unit tests in the same PR.
   Determinism tests are mandatory for scoring/selection changes.
5. **A TODO is not a feature.** Do not mark partial work as complete.

## Setup

```bash
npm install          # Node 20+
npm test             # core tests
npm run web --workspace @ai-detox/mobile   # app on web
```

## Before you open a PR

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

All four must pass — CI runs exactly these.

## PR guidelines

- One focused change per PR; explain the "why" in the description.
- Update docs in the same PR when behavior changes (product docs, design
  docs, or ADRs as appropriate — see the owning skill).
- User-visible copy follows the tone rules in
  [docs/design/design-system.md](docs/design/design-system.md): warm,
  additive, never guilt.
- New significant technical decisions get an ADR in
  `docs/architecture/adr/`.

## Reporting issues

Use the issue templates. For challenge content ideas, the `challenge
content` template makes a great first contribution — no code required.

## Security & privacy

Do not open public issues for security problems — see
[SECURITY.md](SECURITY.md). Any change that touches data flows gets a
privacy review against [docs/architecture/privacy.md](docs/architecture/privacy.md).

## Code of conduct

Be kind. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
