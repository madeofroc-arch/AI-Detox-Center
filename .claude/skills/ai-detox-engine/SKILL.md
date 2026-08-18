---
name: ai-detox-engine
description: Core AI-dependency domain logic for AI Detox Center. Use when working on the AI Dependency Score, scoring configuration, AI Gate state machine, Detox Mode sessions, AI usage tracking and its category taxonomy, dependency patterns, or the reflection system - anything under packages/core/src/ai-detox/. Also use to review changes that touch scoring semantics or dependency classification.
---

# ai-detox-engine

The heart of the product: models **AI dependency as behavior, not screen time**.

## Core distinction (binding)

"More AI usage = worse" is wrong and must never be implemented.
The engine distinguishes:

- **AI Usage Quantity** — how much AI is used (neutral data)
- **AI Dependency Behavior** — how AI is used (what we actually score)

Low-dependency usage examples: translation, information lookup, organizing
data, brainstorming after thinking first, asking AI to review work already
done by the user.

High-dependency usage examples: delegating without thinking, letting AI make
decisions, having AI write everything, asking AI at the first sign of
difficulty, repeatedly asking AI for reassurance.

## Responsibility scope

Owns (single source of truth):

- `packages/core/src/ai-detox/scoring/` — AI Dependency Score engine
- `packages/core/src/ai-detox/ai-gate/` — AI Gate state machine
- `packages/core/src/ai-detox/detox/` — Detox session domain model
- `packages/core/src/ai-detox/tracking/` — usage event log + category taxonomy
- `packages/core/src/ai-detox/reflection/` — reflection prompts and records
- Unit tests for all of the above

Does NOT own: challenge content or progression (human-challenge-engine),
UI presentation (ux-ui-designer), storage adapters (shared `storage/` port is
co-owned with open-source-engineer), feature scope (product-architect).

## Scoring framework

Conceptual model (all weights, band cut points and normalization parameters
live in a versioned, JSON-serializable `ScoringConfig` — never hardcoded in the
algorithm body). Contributors form *reliance*; reducers *discount* it:

    rate_f   = count of that dependent act / windowDays
    int_f    = clamp01(rate_f / saturation_f)
    capacity = frequency + immediacy + lackOfAttempt + max(delegation, emotional)
    reliance = (100 / capacity) * SUM(contributor weight * int_f)
    discount = reliance * reducerMaxDiscount * weighted reducer share
    score    = round(reliance - discount)

Rules:

0. **Reducers discount, they never cancel.** Bounded by `reducerMaxDiscount`
   (< 1). A plain weighted subtraction let complements cancel to zero, made
   three very different users indistinguishable, and even inverted the
   delegation axis below ~44% (see ADR-0005). Do not reintroduce it.

1. **Deterministic**: same events + same config + same reference time =
   identical output. No `Date.now()`, no randomness inside compute functions.
2. **Configurable**: every weight and normalization parameter comes from
   `ScoringConfig`; a default config is exported and versioned.
3. **Transparent**: output includes a per-factor breakdown so the UI can
   always explain WHY the score is what it is.
4. **No LLM in the scoring path.** If AI is ever integrated, it may only do
   classification, reflection support, or personalization - it must never
   produce or control core score data, and all core features must work with
   no LLM API available.
4b. **Contributors count acts; reducers describe shape.** A contributor is a
   RATE of dependent behavior per day, so it only rises when behavior worsens.
   Never express one as a share of AI uses: that measures average severity per
   use, which labelled a 90%-independent user "Running on AI" and rewarded
   people for eliminating a dependency pattern (ADR-0006).
5. **One signal, one home.** Never let two factors read the same underlying
   bit with opposite signs — that is what compressed the v1 range. Check any
   new factor against the existing eight before adding it.
6. **The factors must add up to the score.** `points = intensity * maxPoints`
   for every factor, and contributors minus reducers equals the displayed
   score. The Brain Report states this to the user, and tests pin it.
7. **No transcendental math.** Only +, -, *, / (exact in IEEE-754). `Math.pow`
   and friends are implementation-approximated per ECMA-262 and can differ in
   the last ULP between JS engines, which would break determinism across iOS
   and web.
8. **Calibrate the algorithm to the bands, never the bands to the algorithm.**
   Cut points are the contract with the user. If a change crowds a band, fix
   the weights.
9. **State guarantees as magnitudes, not absolutes.** "Reflection cannot cross
   a band" is unachievable and produced a test that passed while the property
   was false. Bound the size of an effect and derive the bound from config.
10. **Test near the cut points and across every kind.** Both live bugs hid from
   tests that probed only extremes and only the heaviest category.

## Inputs

- Product specs from `docs/product/` (what behavior to model)
- Existing types and tests in `packages/core` (extend, do not fork)
- `ScoringConfig` schema and current default values

## Outputs

- Pure TypeScript domain code in `packages/core/src/ai-detox/`
- Vitest unit tests colocated under `packages/core/__tests__/`
- Updated scoring documentation when semantics change (JSDoc + affected docs)

## Process

1. Read existing module + tests before changing anything.
2. Model behavior as pure functions over explicit inputs (events, config,
   reference time). State machines use explicit typed states and transitions.
3. Write or update unit tests in the same change - determinism tests are
   mandatory for any scoring change.
4. Run `npm test -w @ai-detox/core` and `npm run typecheck`; fix before done.
5. If a change alters score semantics, update the default config version and
   document the migration.

## Prohibitions

- Never implement "usage time = badness". A heavy but deliberate user who
  attempts first must stay in the lowest band — there is a test for this.
- Never let in-app activity (reflections logged, sessions started) move the
  score across a band. That is an engagement loop, which principle 8 forbids.
- Never make scoring non-deterministic or LLM-dependent.
- Never hardcode weights inside algorithms.
- Never punish the user in the domain model (no penalty mechanics for
  abandoning a detox session; record outcomes as neutral data).
- Never import React, Expo, or any UI/platform module into `packages/core`.
- Never send data anywhere: no network calls in core, ever.
- Do not change challenge logic or UI - hand off to the owning skill.

## Done criteria

- All engine code pure, typed, deterministic; unit tests pass.
- Score output includes factor breakdown; config remains serializable and
  versioned.
- `npm run typecheck` and `npm test` green in `packages/core`.

## Collaboration

- Consumes: specs from product-architect.
- Feeds: score/gate/detox/reflection APIs consumed by the app UI
  (ux-ui-designer) and by challenge adaptivity (human-challenge-engine reads
  tracking stats through public APIs only).
- See `docs/architecture/skill-system.md`.
