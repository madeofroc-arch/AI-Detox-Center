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
npm test                                     # core unit tests (Vitest)
npm run build                                # core tsc build + app web export
```

Scoped runs:

```bash
npm test -w @ai-detox/core                                   # just core tests
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
   strings/date keys, randomness as caller-provided seeds/ids
   (`apps/mobile/src/lib/{clock,ids}.ts` are the only clock/random sources).
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
   the displayed score in unrounded points (ADR-0005 pins both; note the
   rounded values shown in the UI do not always reconcile — see issue #5). Reducers discount reliance by at
   most `reducerMaxDiscount`; they never subtract freely. Changing scoring
   semantics means bumping `SCORING_CONFIG_VERSION` — `sanitizeScoringConfig`
   rejects stale versions, which is how the change reaches existing users.
6. **Business rules never live in components.** Screens read the zustand
   store (`apps/mobile/src/state/store.ts`), call core functions, render.
   Styles come from theme tokens (`apps/mobile/src/theme/tokens.ts`), never
   inline hex values.
7. **Tests accompany logic changes** — determinism tests are mandatory for
   scoring/selection changes (same inputs ⇒ deep-equal outputs).

## Key entry points

- Core public API: `packages/core/src/index.ts` (everything is re-exported)
- Score pipeline: `tracking/types.ts` (event taxonomy) → `tracking.ts`
  (stats) → `scoring/scoring.ts` (weighted factors) → UI `report.tsx`
- Gate flow: `ai-gate/gate.ts` FSM → `gateToUsageEvent` → store
  `recordGateSession` (returns event id for reflection linking)
- Daily challenge: `challenges/selection.ts` (`selectDailyChallenge` is
  seeded by date — same day + history ⇒ same challenge)
- App routes: `apps/mobile/src/app/` (expo-router; tabs: home/progress/
  settings; stack: gate/detox/challenge/challenge-result/reflection/report)

## Tone in user-visible copy

Calm, warm, additive. Never "you failed / you gave in / streak lost". Red is
for destructive actions only. See `docs/design/design-system.md` (Voice &
tone) before writing any UI string.
