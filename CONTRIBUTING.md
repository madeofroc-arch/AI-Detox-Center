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
   Determinism tests are mandatory for scoring/selection changes. UI changes
   go in `apps/mobile/__tests__/` — a new colour needs a pairing in
   `contrast.test.ts`, and a screen rule that only a person could catch needs
   a test in `screens.test.tsx`.
5. **A TODO is not a feature.** Do not mark partial work as complete.

## Setup

```bash
npm install          # Node 20+
npm test             # both workspaces: core domain tests + app UI tests
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

## Adding a language

A language is two data files. There is no engineering project behind it, and
the compiler will tell you when you are done.

1. **Add the tag.** `packages/core/src/i18n/types.ts` — add it to `LOCALES`
   and give it a name **in that language** in `LOCALE_NAMES`. A picker that
   says "Chinese (Traditional)" in English is useless to the person who needs
   it.
2. **Domain strings** — copy `packages/core/src/i18n/zh-TW.ts` and translate:
   score bands, factor names, the AI-usage taxonomy, the reflection prompts,
   and all 55 challenges. Register it in the `OVERRIDES` map in
   `packages/core/src/i18n/i18n.ts`. This file may be **partial**; anything
   you leave out falls back to English key by key, so you can ship one
   section at a time.
3. **Screen copy** — copy `apps/mobile/src/i18n/zh-TW.ts` and translate.
   This file may **not** be partial: it is typed as `AppStrings`, so a missing
   key is a build error. A "Continue" button in the middle of an otherwise
   translated flow is worse than a red CI run.
4. Add it to the `PACKS` map in `apps/mobile/src/i18n/useI18n.ts`.

`npm test` then checks the pack for completeness — every band, factor,
category, prompt and challenge, including that each challenge kept the same
number of reflection questions — and that no string was left identical to the
English one (the failure mode where a new key is copy-pasted and never
translated).

Three things that are easy to get wrong:

- **Tone is part of the translation.** The rules in
  [docs/design/design-system.md](docs/design/design-system.md) bind in every
  language: never shaming, never "you failed", never a number presented as a
  verdict on the person. A literal translation that is colder than the
  original is a mistranslation.
- **Challenge instructions are content, not labels.** They are the product.
  Translate the intent; adapt an example if the original does not travel.
- **Never make behavior depend on the language.** Challenge selection runs on
  the canonical catalog and only then swaps the text, so the same person gets
  the same practice on the same day in any language. There is a test for it.

Regional matching is handled for you: `matchLocale` maps device tags to the
closest supported language. Note that Simplified Chinese deliberately does
*not* fall back to Traditional — serving one to a reader of the other is a
guess, not a courtesy.

## Reporting issues

Use the issue templates. For challenge content ideas, the `challenge
content` template makes a great first contribution — no code required.

## Security & privacy

Do not open public issues for security problems — see
[SECURITY.md](SECURITY.md). Any change that touches data flows gets a
privacy review against [docs/architecture/privacy.md](docs/architecture/privacy.md).

## Code of conduct

Be kind. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
