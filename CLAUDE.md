# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**AI Detox Center / Human Mode** — an open-source, local-first app for AI
dependency management and independent thinking training. TypeScript + Expo
monorepo (npm workspaces): pure domain engine in `packages/core`, thin UI in
`apps/mobile`.

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
npx vitest run __tests__/scoring.test.ts                     # single test file (run in packages/core)
npm run web --workspace @ai-detox/mobile -- --port 8123      # app in browser
npm run start --workspace @ai-detox/mobile                   # Expo dev server (Expo Go)
```

CI (`.github/workflows/ci.yml`) runs lint + typecheck + test + build plus a
grep that fails on any `fetch(`/`XMLHttpRequest`/`axios` in source.

## Skill system (start here)

Work is divided across five skills in `.claude/skills/` — find the one that
owns your task and follow its process, prohibitions, and done criteria:

| Skill | Owns |
| --- | --- |
| product-architect | `docs/product/*` — scope, specs, philosophy checks |
| ux-ui-designer | `docs/design/*`, `apps/mobile/src/{theme,components}`, screen UI |
| ai-detox-engine | `packages/core/src/ai-detox/*` — scoring, gate, detox, tracking, reflection |
| human-challenge-engine | `packages/core/src/challenges/*` — catalog, selection, difficulty, progression |
| open-source-engineer | root community files, `.github/`, `docs/architecture/*`, CI |

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
   up, never silently dropped.
5. **Scoring weights, band cut points, and Brain Score shares all live in
   `ScoringConfig`** — never hardcode them in algorithm bodies. Score output
   must keep its per-factor breakdown, and the breakdown must sum exactly to
   the displayed score — in unrounded points via `points`, AND in whole numbers
   via `displayPoints`, which core apportions by largest remainder so the rows
   a user reads off always reconcile with the dial (ADR-0005; #6). Render
   `displayPoints`, never `Math.round(points)`.
   There is exactly ONE reducer and adding an AI use must never raise it: a
   reducer an AI use can raise inverts that use's marginal effect and makes the
   dial fall when reliance rises (ADR-0007). It discounts reliance by at most
   `reducerMaxDiscount` and never subtracts freely. Changing scoring
   semantics means bumping `SCORING_CONFIG_VERSION` — `sanitizeScoringConfig`
   rejects stale versions, which is how the change reaches existing users.
6. **User-visible strings are data, and they live by layer.** Domain language
   (score bands, factor names, the usage taxonomy, the challenge catalog,
   reflection prompts) lives in `packages/core/src/i18n/`; screen copy lives in
   `apps/mobile/src/i18n/`. Core never reads the device — resolving a locale is
   the app's job. Never let behavior depend on the language: challenge
   selection runs on the canonical catalog and only then swaps the text.
   Adding a key to `apps/mobile/src/i18n/en.ts` breaks every other pack at
   compile time, which is the point.
7. **Business rules never live in components.** Screens read the zustand
   store (`apps/mobile/src/state/store.ts`), call core functions, render.
   Styles come from theme tokens (`apps/mobile/src/theme/game.ts`), never
   inline hex values. One palette, dark only — the light/dark pair went with
   the tracker's screens.
8. **Tests accompany logic changes** — determinism tests are mandatory for
   scoring/selection changes (same inputs ⇒ deep-equal outputs). The app has
   tests too: `apps/mobile/__tests__/` renders through react-native-web under
   Vitest, so `aria-*` assertions check the real accessibility tree. A new
   palette colour needs a pairing in `contrast.test.ts` — the suite fails on a
   token nothing covers.

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
