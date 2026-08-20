# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Human Mode** — an open-source, local-first quiz show about being argued out
of a correct answer, and an installable skill it configures. The game is the
diagnosis; the skill is the prescription. TypeScript + Expo monorepo (npm
workspaces): pure domain engine in `packages/core`, thin UI in `apps/mobile`,
the skill's method as YAML in `skill/`.

It began as an AI-dependency tracker. That product is gone — its screens in
one commit, its engines and its stored data in the next (schema v4). The
tracker's own history is archived rather than deleted; see `RetiredTrackerData`.

## Commands

All from the repo root:

```bash
npm install                                  # install all workspaces (Node 20+)
npm run lint                                 # lint all workspaces
npm run typecheck                            # tsc --noEmit all workspaces
npm test                                     # both workspaces (Vitest): core domain + app UI
npm run build                                # core tsc build + app web export
```

Scoped runs:

```bash
npm test -w @ai-detox/core                                   # just core tests
npm test -w @ai-detox/mobile                                 # just app UI tests
npx vitest run __tests__/quiz-board.test.ts                  # single test file (run in packages/core)
npm run web --workspace @ai-detox/mobile -- --port 8123      # app in browser
npm run start --workspace @ai-detox/mobile                   # Expo dev server (Expo Go)
```

CI (`.github/workflows/ci.yml`) runs lint + typecheck + test + build plus a
grep that fails on any `fetch(`/`XMLHttpRequest`/`axios` in source.

## Skill system (start here)

Work is divided across four skills in `.claude/skills/` — find the one that
owns your task and follow its process, prohibitions, and done criteria:

| Skill | Owns |
| --- | --- |
| product-architect | `docs/product/*` — scope, specs, philosophy checks |
| ux-ui-designer | `docs/design/*`, `apps/mobile/src/{theme,components}`, screen UI |
| adversary-engine | `packages/core/src/{adversary,i18n}/*` — catalog, board, run, diagnosis |
| open-source-engineer | root community files, `.github/`, `docs/architecture/*`, CI |

`adversary-engine` replaced two — `ai-detox-engine` and
`human-challenge-engine` — when the tracker was removed in schema v4.

Cross-skill rules live in `docs/architecture/skill-system.md`. The 10
product principles in `docs/product/vision.md` bind everything — no shame
mechanics, no engagement loops, no default data collection, and the app must
work fully without any LLM API.

## Architecture rules (violations = review failure)

1. **Dependency direction is app → core, never core → app.**
   `packages/core` imports no React, no Expo, no platform APIs.
2. **Core is deterministic.** No `Date.now()`, `new Date()`, or
   `Math.random()` inside `packages/core` domain logic — time enters as ISO
   strings/date keys, randomness as caller-provided seeds.
   `apps/mobile/src/lib/clock.ts` is the only clock, and there is no random
   source at all any more: a run of The Adversary is seeded by the calendar
   day, the tier and the run index, so the same person on the same day is
   dealt the same board and a bug report is a seed.
3. **No network calls anywhere.** Local-first privacy is structural
   (ADR-0003); core's ESLint bans `fetch` via `no-restricted-globals`, CI
   greps the rest.
4. **All persistence goes through `StoragePort`** (`packages/core/src/storage/`).
   The single `AppData` document is schema-versioned; changing its shape
   requires a migration in `migrations.ts` + tests. Corrupt data gets backed
   up, never silently dropped — and neither does data a REMOVED feature owned.
   The 3 -> 4 migration archives the tracker's history into `retired` instead
   of dropping it, so "export my data" still hands the person everything they
   ever put in. A migration that removes fields builds the new document
   explicitly rather than spreading the old one, so a field can only survive
   by being named.
5. **Tier parameters live in `quiz-config.ts`** — band, board width, lives,
   starting lifelines, safe points, bluff rate, ladder growth. Never hardcode
   them in an algorithm body. A board's option spacing is NOT a tier constant:
   it is derived from each round's own bluff displacement, so the option a
   bluffing host names is the figure its argument reasons to. An earlier
   per-tier constant had 26 of 30 bluffs naming an option their own closing
   sentence forbids.
6. **User-visible strings are data, and they live by layer.** Domain language
   — which now means the round catalog and nothing else — lives in
   `packages/core/src/i18n/`; screen copy lives in `apps/mobile/src/i18n/`.
   Core never reads the device: resolving a locale is the app's job. Never let
   behavior depend on the language. Selection and board construction run on the
   canonical catalog and only then swap the text, so the same seed deals the
   same board in either language. Adding a key to `apps/mobile/src/i18n/en.ts`
   breaks every other pack at compile time, which is the point; adding a round
   without 繁體中文 breaks `zh-catalog.test.ts`, which is the same point for
   content.
7. **Business rules never live in components.** Screens read the zustand
   store (`apps/mobile/src/state/store.ts`), call core functions, render.
   Styles come from theme tokens (`apps/mobile/src/theme/game.ts`), never
   inline hex values. One palette, dark only — the light/dark pair went with
   the tracker's screens.
8. **Tests accompany logic changes** — determinism tests are mandatory for
   board and selection changes (same seed ⇒ deep-equal outputs). The app has
   tests too: `apps/mobile/__tests__/` renders through react-native-web under
   Vitest, so `aria-*` assertions check the real accessibility tree. A new
   palette colour needs a pairing in `contrast.test.ts` — the suite fails on a
   token nothing covers. **Content has gates too, and they are the ones that
   have caught real defects**: `quiz-board.test.ts` on a repeated fallacy or a
   bluff naming an option its own arithmetic forbids, `zh-catalog.test.ts` on
   an untranslated round or Simplified characters, `legibility.test.ts` on a
   rule that beats reading the argument.

## Key entry points

- Core public API: `packages/core/src/index.ts` (everything is re-exported)
- A run: `adversary/quiz-selection.ts` (`planRun` picks the ladder from the
  tier's band) → `quiz-board.ts` (`buildLevel` spaces the four options by the
  bluff's own displacement) → `quiz-run.ts` (the reducer) → UI `adversary.tsx`
- The joint: `adversary/quiz-diagnosis.ts` (`diagnose` reads accumulated run
  records) → UI `prescription.tsx` → a YAML block → `skill/method/profile.yaml`
- App routes: `apps/mobile/src/app/` — `index` redirects to `adversary`, and
  `prescription` is the only other screen. The tracker's eleven screens
  (tabs, gate, detox, challenge, reflection, report, onboarding) are deleted.

`packages/core` still holds the tracker's engines — scoring, tracking, the AI
gate, detox, challenges, reflection — with their tests and their ADRs. Nothing
renders them. Removing them is a separate change, and it needs an `AppData`
migration.

## Tone in user-visible copy

Calm, warm, additive. Never "you failed / you gave in / streak lost". Red is
for destructive actions only. See `docs/design/design-system.md` (Voice &
tone) before writing any UI string.
