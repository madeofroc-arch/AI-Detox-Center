/**
 * The numbers a user can actually read must add up to the number on the dial.
 *
 * The exact identity holds on unrounded points and always did — that is pinned
 * in scoring-calibration.test.ts. What shipped broken was the DISPLAY: the
 * report rendered `Math.round(points)` per row while the dial rendered
 * `Math.round(sum)`, and rounding a list is not the same operation as rounding
 * its sum. Over a sweep of realistic event mixes only about half the profiles
 * reconciled; a reachable one showed rows adding to 71 beside a dial reading
 * 70 (#6).
 *
 * So the sweep here is deliberately wide, and the last test in the file
 * asserts the sweep has teeth: it counts how many of these same profiles the
 * old naive rendering would have got wrong. If that count ever reaches zero,
 * this file has stopped testing anything and should be rewritten, not deleted.
 */
import { describe, expect, it } from 'vitest';
import { DEFAULT_SCORING_CONFIG, computeDependencyScore } from '../src/index';
import type { AIUsageCategory, AIUsageEvent, DependencyScoreResult } from '../src/index';

const NOW = '2026-08-18T18:00:00.000Z';
const AT = '2026-08-14T10:00:00.000Z';

let seq = 0;
function ev(
  category: AIUsageCategory,
  opts: { attemptedFirst?: boolean; usedAI?: boolean; immediate?: boolean } = {},
): AIUsageEvent {
  seq += 1;
  return {
    id: `d${seq}`,
    timestamp: AT,
    category,
    source: 'gate',
    attemptedFirst: opts.attemptedFirst ?? false,
    usedAI: opts.usedAI ?? true,
    proceededImmediately: opts.immediate ?? false,
  };
}
const rep = (n: number, make: () => AIUsageEvent): AIUsageEvent[] =>
  Array.from({ length: n }, make);

/**
 * A sweep over the shape of a fortnight, not a handful of fixtures. Each axis
 * moves one behavior the engine reads; the products are the profiles.
 */
const DELEGATION = [0, 1, 2, 3, 5, 8, 13, 21];
const DECISION = [0, 1, 3, 7];
const INSTANT = [0, 2, 5, 11];
const REASSURANCE = [0, 1, 4, 9];
const ATTEMPTED = [0, 3, 8];
const NO_AI = [0, 1, 2, 4, 7, 12];

function* profiles(): Generator<AIUsageEvent[]> {
  for (const delegation of DELEGATION)
    for (const decision of DECISION)
      for (const instant of INSTANT)
        for (const reassurance of REASSURANCE)
          for (const attempted of ATTEMPTED)
            for (const noAi of NO_AI)
              for (const immediate of [false, true])
                yield [
                  ...rep(delegation, () => ev('direct_delegation', { immediate })),
                  ...rep(decision, () => ev('decision_outsourcing', { immediate: true })),
                  ...rep(instant, () => ev('instant_help', { immediate: true })),
                  ...rep(reassurance, () => ev('reassurance_seeking', { immediate })),
                  ...rep(attempted, () => ev('lookup', { attemptedFirst: true })),
                  ...rep(noAi, () => ev('lookup', { attemptedFirst: true, usedAI: false })),
                ];
}

const score = (events: readonly AIUsageEvent[]): DependencyScoreResult =>
  computeDependencyScore(events, DEFAULT_SCORING_CONFIG, NOW);

/** What the report shows: what adds, minus what lowers. */
const shownTotal = (result: DependencyScoreResult): number =>
  result.factors.reduce(
    (total, f) => total + (f.role === 'contributor' ? f.displayPoints : -f.displayPoints),
    0,
  );

/** The same sum on exact values — the quantity the dial is rounded from. */
const exactTotal = (result: DependencyScoreResult): number =>
  Math.min(
    100,
    Math.max(
      0,
      result.factors.reduce(
        (total, f) => total + (f.role === 'contributor' ? f.points : -f.points),
        0,
      ),
    ),
  );

describe('the whole numbers in the report add up to the dial', () => {
  it('reconciles on every profile in the sweep, with none skipped', () => {
    let checked = 0;
    let scored = 0;
    for (const events of profiles()) {
      const result = score(events);
      checked += 1;
      // Apportioned in both branches: a report that starts disagreeing with
      // itself the moment the evidence gate opens is the same defect later.
      expect(shownTotal(result), JSON.stringify(summarize(result))).toBe(
        Math.round(exactTotal(result) + 1e-9),
      );
      if (result.status === 'ok') {
        scored += 1;
        expect(shownTotal(result)).toBe(result.score);
      }
    }
    // Guards the sweep itself: a generator bug that yielded nothing would make
    // every assertion above vacuously true.
    expect(checked).toBe(
      DELEGATION.length *
        DECISION.length *
        INSTANT.length *
        REASSURANCE.length *
        ATTEMPTED.length *
        NO_AI.length *
        2,
    );
    expect(checked).toBeGreaterThan(18_000);
    expect(scored).toBeGreaterThan(10_000);
  });

  it('never moves a row by a whole point, and never shows a negative one', () => {
    for (const events of profiles()) {
      for (const f of score(events).factors) {
        expect(Number.isInteger(f.displayPoints)).toBe(true);
        expect(f.displayPoints).toBeGreaterThanOrEqual(0);
        // Floor or ceil of the true value, never further. Strict: an
        // apportionment that "borrowed" two points from one row to balance the
        // books would still sum correctly and would still be a lie.
        expect(Math.abs(f.displayPoints - f.points), `${f.factor} ${f.points}`).toBeLessThan(1);
      }
    }
  });

  it('is deterministic: the same events give the same breakdown', () => {
    const sample = [
      ...rep(9, () => ev('direct_delegation', { immediate: true })),
      ...rep(4, () => ev('reassurance_seeking')),
      ...rep(6, () => ev('lookup', { attemptedFirst: true, usedAI: false })),
    ];
    expect(score(sample).factors).toEqual(score([...sample]).factors);
    expect(score(sample).factors.map((f) => f.displayPoints)).toEqual(
      score(sample.slice()).factors.map((f) => f.displayPoints),
    );
  });

  it('reconciles for a user with nothing recorded but the evidence gate open', () => {
    // All-independent: reliance 0, discount 0, dial 0, and every row 0. The
    // degenerate end is where an apportionment that assumes a positive total
    // would divide by zero or hand out a phantom point.
    const result = score(rep(12, () => ev('lookup', { attemptedFirst: true, usedAI: false })));
    expect(result.status).toBe('ok');
    expect(result.score).toBe(0);
    expect(result.factors.every((f) => f.displayPoints === 0)).toBe(true);
  });

  it('reconciles when reliance is pinned at the ceiling', () => {
    // Above the clamp the contributors are scaled down to land on exactly 100,
    // which puts several rows on near-identical fractional parts — the case
    // where a tie-break decides who gets the leftover point.
    const result = score(rep(60, () => ev('direct_delegation', { immediate: true })));
    expect(result.status).toBe('ok');
    expect(shownTotal(result)).toBe(result.score);
    expect(result.score).toBe(100);
  });
});

describe('the sweep has teeth', () => {
  it('catches profiles the old per-row rounding got wrong', () => {
    // Reproduces the defect this file exists to prevent: round each row on its
    // own, add them up, and compare with the dial.
    let disagreed = 0;
    let total = 0;
    let worst = 0;
    for (const events of profiles()) {
      const result = score(events);
      if (result.status !== 'ok') continue;
      total += 1;
      const naive = result.factors.reduce(
        (sum, f) =>
          sum + (f.role === 'contributor' ? Math.round(f.points) : -Math.round(f.points)),
        0,
      );
      const off = Math.abs(naive - result.score!);
      if (off > 0) disagreed += 1;
      worst = Math.max(worst, off);
    }
    // If this ever reaches zero the sweep has stopped exercising the fix.
    expect(disagreed).toBeGreaterThan(0);
    expect(worst).toBeGreaterThanOrEqual(1);
    // Documented so the size of the defect stays visible rather than becoming
    // folklore: it was never rare.
    expect(disagreed / total).toBeGreaterThan(0.1);
  });
});

function summarize(result: DependencyScoreResult) {
  return {
    score: result.score,
    status: result.status,
    rows: result.factors.map((f) => [f.factor, f.points.toFixed(4), f.displayPoints]),
  };
}
