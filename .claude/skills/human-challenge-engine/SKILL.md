---
name: human-challenge-engine
description: Human capability training system for AI Detox Center. Use when working on challenges, the challenge catalog, daily or random challenge selection, adaptive difficulty, streaks, XP, skill progression, or anything under packages/core/src/challenges/. Also use to review new challenge content for quality and for anti-addiction compliance.
---

# human-challenge-engine

Retrains human capabilities through daily practice. The paradoxical goal:
**the user should gradually need the app less.** Progression exists to record
growth, not to create compulsion.

## Capability categories

Thinking, Creativity, Writing, Memory, Decision Making, Problem Solving,
Communication, Learning, Focus.

Example challenges:

- Creativity: "Without AI, think of 20 uses for a pen."
- Writing: "Without AI, write 100 words about one thing that happened today."
- Decision Making: "Choose between options A/B/C and write down your reasons."
- Problem Solving: "Propose three solutions yourself before allowing an AI hint."
- Focus: "Complete one task for 25 minutes without using AI."

## Challenge schema (binding)

Every challenge must have:

- `id`, `category` (one of the 9), `difficulty` (1-5), `durationMinutes`,
  `title`, `instructions`, `successCondition`, `reflectionQuestions`

Catalog shape, asserted in `__tests__/challenges.test.ts`:

- At least 6 challenges per category, 55 in total.
- **Every category covers difficulty 1-5 on its own.** The earlier test asked
  whether each difficulty existed anywhere in the catalog, which was always
  true while `focus` had nothing above 3 — and a user who picks one focus
  capability lives inside one category's list, not the catalog's.
- No two challenges share a title, which is the cheapest catchable form of the
  lightly-reworded duplicate the contribution guidance forbids.
- Every challenge needs its text in every language pack (`src/i18n/`), and the
  i18n suite fails on a gap. Adding one here is adding one everywhere.

## Responsibility scope

Owns (single source of truth):

- `packages/core/src/challenges/` — types, catalog, selection engine,
  adaptive difficulty, streak/XP/progression
- Challenge content (the seed catalog and its growth)
- Unit tests for all of the above

Does NOT own: dependency scoring or gate (ai-detox-engine), UI
(ux-ui-designer), feature scope (product-architect).

## Engine requirements

- **Daily challenge**: deterministic for a given date + user history
  (seeded selection - same date, same history, same challenge).
- **Random challenge**: caller passes the seed; engine stays pure.
- **Adaptive difficulty**: derived from recent attempt outcomes (success rate
  window), moving one step at a time; never punishing.
- **Streak**: counts consecutive active days. A missed day pauses the streak;
  it never triggers loss-framing (no "you lost your 30-day streak!").
- **XP / progression**: additive record of effort. Nothing is purchasable;
  nothing decays; no comparison with other users.

## Anti-addiction rules (binding)

The product trains independence. Therefore:

- No variable-reward mechanics (no loot boxes, no surprise multipliers).
- No loss-aversion mechanics (no streak-destruction threats, no expiring rewards).
- No daily-quota guilt ("you missed yesterday").
- Success metric is capability growth and declining unconscious AI reliance,
  not daily active use. It must be acceptable - by design - for a healthy
  user to open the app less over time.

## Inputs

- Product specs from `docs/product/`
- Tracking stats from ai-detox-engine public APIs (read-only)
- Existing catalog and tests (extend, do not fork)

## Outputs

- Pure TypeScript in `packages/core/src/challenges/` + colocated tests
- New or revised challenge content following the schema
- Progression rules documented in code (JSDoc) and in product docs when
  user-visible

## Process

1. Read existing types, catalog, and tests.
2. For content: write challenges that require genuine human effort and have a
   self-assessable success condition; include 2-3 reflection questions each.
3. For engine changes: pure functions, explicit inputs (date, history, seed),
   determinism tests mandatory.
4. Check every change against the anti-addiction rules.
5. Run tests and typecheck; fix before done.

## Prohibitions

- No engagement-maximizing mechanics of any kind (see anti-addiction rules).
- No AI-generated-at-runtime challenges in core (catalog is static data;
  future AI personalization is an optional layer, never a core dependency).
- No nondeterministic selection logic.
- No UI code, no scoring changes, no network calls.

## Done criteria

- Schema-complete challenges; engine deterministic and tested;
  anti-addiction rules pass; typecheck and tests green.

## Collaboration

- Consumes: product specs; tracking stats via public core APIs.
- Feeds: challenge state consumed by UI (ux-ui-designer); attempt outcomes
  feed Brain Score composition (shared contract with ai-detox-engine).
- See `docs/architecture/skill-system.md`.
