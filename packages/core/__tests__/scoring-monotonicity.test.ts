/**
 * Exhaustive monotonicity sweep.
 *
 * Two successive models shipped with monotonicity breaks that their own tests
 * could not see, each blind in a different way: the first only ever worsened
 * behavior toward the single heaviest category; the second swept categories but
 * always from the same starting flags, so one channel never varied.
 *
 * This file exists to remove the guesswork. It enumerates every conversion
 * between categories, every flag combination, and both directions of adding and
 * removing dependent acts, in a range of bulk contexts and volumes. It is the
 * slowest test in the suite and that is the correct trade.
 */
import { describe, expect, it } from 'vitest';
import { CATEGORY_INFO, DEFAULT_SCORING_CONFIG, computeDependencyScore } from '../src/index';
import type { AIUsageCategory, AIUsageEvent, ScoringConfig } from '../src/index';

const NOW = '2026-08-19T12:00:00.000Z';
const config: ScoringConfig = DEFAULT_SCORING_CONFIG;
const daysAgo = (d: number): string =>
  new Date(Date.parse(NOW) - d * 86_400_000 - 3_600_000).toISOString();

/**
 * Severity ranking used ONLY to decide which direction counts as worse. It is
 * intentionally coarse: deliberate uses are 0, and the three dependency kinds
 * ascend from reaching instantly, through seeking reassurance, to handing over
 * a whole task.
 */
const SEVERITY: Record<string, number> = {
  translation: 0,
  lookup: 0,
  organize: 0,
  brainstorm_partner: 0,
  review_own_work: 0,
  instant_help: 1,
  reassurance_seeking: 2,
  decision_outsourcing: 3,
  direct_delegation: 3,
};
const CATEGORIES = CATEGORY_INFO.map((c) => c.category);

let seq = 0;
function ev(
  category: AIUsageCategory,
  i: number,
  o: { attempted?: boolean; usedAI?: boolean; immediate?: boolean; reflect?: boolean } = {},
): AIUsageEvent {
  seq += 1;
  const usedAI = o.usedAI ?? true;
  const attempted = o.attempted ?? false;
  return {
    id: `m${seq}`,
    timestamp: daysAgo(i % config.windowDays),
    category,
    source: 'gate',
    attemptedFirst: attempted,
    usedAI,
    proceededImmediately: usedAI ? (o.immediate ?? !attempted) : false,
    ...(o.reflect ? { reflectionId: `r${seq}` } : {}),
  };
}
/** A moment resolved with no AI at all, as the gate records it. */
const solo = (i: number): AIUsageEvent => ev('lookup', i, { attempted: true, usedAI: false });
const rep = (n: number, make: (i: number) => AIUsageEvent): AIUsageEvent[] =>
  Array.from({ length: n }, (_, i) => make(i));

const scoreOf = (events: readonly AIUsageEvent[]): number | null => {
  const r = computeDependencyScore(events, config, NOW);
  return r.status === 'ok' ? r.score : null;
};

describe('worsening behavior never lowers the score', () => {
  it('converting any act into a strictly worse category', () => {
    const failures: string[] = [];
    for (const from of CATEGORIES) {
      for (const to of CATEGORIES) {
        if (SEVERITY[to]! <= SEVERITY[from]!) continue;
        for (const bulkCat of ['direct_delegation', 'reassurance_seeking', 'lookup'] as const) {
          for (const bulkN of [0, 6, 14, 30]) {
            for (const convN of [4, 12, 25]) {
              for (const soloN of [0, 5, 20]) {
                const base = [...rep(soloN, solo), ...rep(bulkN, (i) => ev(bulkCat, i))];
                const before = scoreOf([...base, ...rep(convN, (i) => ev(from, i))]);
                const after = scoreOf([...base, ...rep(convN, (i) => ev(to, i))]);
                if (before === null || after === null) continue;
                if (after < before) {
                  failures.push(`${from}->${to} bulk=${bulkCat}x${bulkN} n=${convN} solo=${soloN}: ${before}->${after}`);
                }
              }
            }
          }
        }
      }
    }
    expect(failures.slice(0, 5)).toEqual([]);
  });

  it('converting an independently-resolved moment into any AI use', () => {
    // The shape of the issue-#5 break, and of the reducer-channel break that
    // followed it: reducers moving faster than reliance on a strictly worse change.
    const failures: string[] = [];
    for (const to of CATEGORIES) {
      for (const attempted of [true, false]) {
        for (const reflect of [true, false]) {
          for (const soloN of [3, 8, 20, 40]) {
            for (const bulkN of [0, 8, 20]) {
              const bulk = rep(bulkN, (i) => ev('direct_delegation', i));
              const before = scoreOf([...rep(soloN, solo), ...bulk]);
              const after = scoreOf([
                ...rep(soloN - 1, solo),
                ev(to, 0, { attempted, reflect }),
                ...bulk,
              ]);
              if (before === null || after === null) continue;
              if (after < before) {
                failures.push(`solo->${to} attempted=${attempted} reflect=${reflect} solo=${soloN} bulk=${bulkN}: ${before}->${after}`);
              }
            }
          }
        }
      }
    }
    expect(failures.slice(0, 5)).toEqual([]);
  });

  it('dropping the attempt before an AI use', () => {
    const failures: string[] = [];
    for (const cat of CATEGORIES) {
      for (const n of [6, 15, 30]) {
        for (const soloN of [0, 10]) {
          const base = rep(soloN, solo);
          const before = scoreOf([...base, ...rep(n, (i) => ev(cat, i, { attempted: true }))]);
          const after = scoreOf([...base, ...rep(n, (i) => ev(cat, i, { attempted: false }))]);
          if (before === null || after === null) continue;
          if (after < before) failures.push(`${cat} n=${n} solo=${soloN}: ${before}->${after}`);
        }
      }
    }
    expect(failures.slice(0, 5)).toEqual([]);
  });

  it('adding one more dependent act', () => {
    const failures: string[] = [];
    for (const cat of CATEGORIES) {
      if (SEVERITY[cat] === 0) continue;
      for (const n of [10, 20, 40]) {
        for (const soloN of [0, 10, 30]) {
          const base = [...rep(soloN, solo), ...rep(n, (i) => ev(cat, i))];
          const before = scoreOf(base);
          const after = scoreOf([...base, ev(cat, 0)]);
          if (before === null || after === null) continue;
          if (after < before) failures.push(`+1 ${cat} n=${n} solo=${soloN}: ${before}->${after}`);
        }
      }
    }
    expect(failures.slice(0, 5)).toEqual([]);
  });
});

describe('improving behavior never raises the score', () => {
  it('eliminating a whole dependency pattern', () => {
    // The headline symptom of #5: this moved a user 67 -> 96 and demoted them.
    const failures: string[] = [];
    for (const dropped of ['instant_help', 'reassurance_seeking', 'decision_outsourcing'] as const) {
      for (const kept of [5, 10, 20]) {
        for (const n of [5, 15, 27, 50]) {
          const withPattern = [...rep(kept, (i) => ev('direct_delegation', i)), ...rep(n, (i) => ev(dropped, i))];
          const without = rep(kept, (i) => ev('direct_delegation', i));
          const w = scoreOf(withPattern);
          const o = scoreOf(without);
          if (w === null || o === null) continue;
          if (o > w) failures.push(`drop ${n}x${dropped}, keep ${kept}: ${w}->${o}`);
        }
      }
    }
    expect(failures.slice(0, 5)).toEqual([]);
  });
});

describe('the breakdown always reconciles with the dial', () => {
  it('contributor points minus reducer points rounds to the score, unclamped', () => {
    const failures: string[] = [];
    for (const cat of CATEGORIES) {
      for (const cat2 of CATEGORIES) {
        for (const n of [10, 30, 60, 120, 300]) {
          const result = computeDependencyScore(
            [...rep(n, (i) => ev(cat, i)), ...rep(n, (i) => ev(cat2, i))],
            config,
            NOW,
          );
          if (result.status !== 'ok') continue;
          const sum = result.factors.reduce(
            (t, f) => t + (f.role === 'contributor' ? f.points : -f.points),
            0,
          );
          // Deliberately unclamped: clamping here is what hid a 14-point gap.
          if (Math.round(sum) !== result.score) {
            failures.push(`${cat}+${cat2} n=${n}: sum ${sum.toFixed(3)} vs dial ${result.score}`);
          }
          if (result.score! < 0 || result.score! > 100) {
            failures.push(`${cat}+${cat2} n=${n}: out of range ${result.score}`);
          }
        }
      }
    }
    expect(failures.slice(0, 5)).toEqual([]);
  });
});
