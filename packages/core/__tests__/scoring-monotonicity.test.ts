/**
 * Exhaustive monotonicity sweep.
 *
 * THREE successive models shipped with monotonicity breaks that their own
 * tests could not see, and each was blind in a different way:
 *
 *   1. the first only ever worsened behavior toward the single heaviest
 *      category;
 *   2. the second swept categories but built every event with the same flags,
 *      so `attemptedFirst` and `proceededImmediately` never varied;
 *   3. the third swept categories AND flags but only ever CONVERTED one act
 *      into another, never ADDED one alongside — which is where the
 *      `deliberateUsage` reducer was handing back more discount than the added
 *      act cost in reliance (ADR-0007).
 *
 * So this file does not hand-pick the changes it tests. It enumerates every
 * distinguishable event variant, derives "strictly worse" from a dominance
 * relation over the counts the engine actually reads, and sweeps every ordered
 * pair — conversions and additions both. The comparison count is asserted so
 * the figure quoted in the ADR cannot drift away from the code.
 *
 * It is the slowest test in the suite and that is the correct trade.
 */
import { describe, expect, it } from 'vitest';
import {
  CATEGORY_INFO,
  DEFAULT_SCORING_CONFIG,
  bandForScore,
  computeDependencyScore,
  kindOf,
} from '../src/index';
import type { AIUsageCategory, AIUsageEvent, ScoringConfig } from '../src/index';

const NOW = '2026-08-19T12:00:00.000Z';
const config: ScoringConfig = DEFAULT_SCORING_CONFIG;
const daysAgo = (d: number): string =>
  new Date(Date.parse(NOW) - (d % config.windowDays) * 86_400_000 - 3_600_000).toISOString();

interface Variant {
  category: AIUsageCategory;
  usedAI: boolean;
  attemptedFirst: boolean;
  immediate: boolean;
  reflect: boolean;
}

/** Every event the taxonomy can distinguish: 9 categories x flags. */
const VARIANTS: Variant[] = [];
for (const { category } of CATEGORY_INFO) {
  for (const usedAI of [true, false]) {
    for (const attemptedFirst of [true, false]) {
      for (const immediate of usedAI ? [true, false] : [false]) {
        for (const reflect of [true, false]) {
          VARIANTS.push({ category, usedAI, attemptedFirst, immediate, reflect });
        }
      }
    }
  }
}

let seq = 0;
function ev(v: Variant, i: number): AIUsageEvent {
  seq += 1;
  return {
    id: `m${seq}`,
    timestamp: daysAgo(i),
    category: v.category,
    source: 'gate',
    attemptedFirst: v.attemptedFirst,
    usedAI: v.usedAI,
    proceededImmediately: v.usedAI && v.immediate,
    ...(v.reflect ? { reflectionId: `r${seq}` } : {}),
  };
}

/**
 * The five counts scoring raises on, plus the one signal it discounts on.
 * Derived from the engine's own definitions rather than from a hand-written
 * severity ladder, so "strictly worse" is not a judgement call.
 */
function indicators(v: Variant): number[] {
  const ai = v.usedAI;
  return [
    ai ? 1 : 0, // frequency
    ai && v.immediate ? 1 : 0, // immediacy
    ai && kindOf(v.category) === 'delegation' ? 1 : 0, // delegation
    ai && !v.attemptedFirst ? 1 : 0, // lackOfAttempt
    ai && kindOf(v.category) === 'emotional' ? 1 : 0, // emotionalDependency
    ai ? 0 : -1, // resolved without AI — the only reducer, so sign-flipped
  ];
}
/** b is at least as dependent as a on every axis, and strictly worse on one. */
function dominates(a: Variant, b: Variant): boolean {
  const [x, y] = [indicators(a), indicators(b)];
  return x.every((n, i) => y[i]! >= n) && x.some((n, i) => y[i]! > n);
}

const WORSE_PAIRS: Array<[Variant, Variant]> = [];
for (const a of VARIANTS) for (const b of VARIANTS) if (dominates(a, b)) WORSE_PAIRS.push([a, b]);

const rep = (n: number, v: Variant): AIUsageEvent[] =>
  Array.from({ length: n }, (_, i) => ev(v, i));
const V = (
  category: AIUsageCategory,
  o: Partial<Omit<Variant, 'category'>> = {},
): Variant => ({
  category,
  usedAI: o.usedAI ?? true,
  attemptedFirst: o.attemptedFirst ?? false,
  immediate: o.immediate ?? false,
  reflect: o.reflect ?? false,
});

const SOLO = V('lookup', { usedAI: false, attemptedFirst: true });
const DELEGATED = V('direct_delegation', { immediate: true });
const DELIBERATE = V('lookup', { attemptedFirst: true });
const REASSURANCE = V('reassurance_seeking', { immediate: true });

/** Backdrops a change can happen against: independent, dependent, and mixed. */
const CONTEXTS: AIUsageEvent[][] = [];
for (const solo of [0, 12, 40])
  for (const delegated of [0, 6, 24])
    for (const deliberate of [0, 10])
      CONTEXTS.push([
        ...rep(solo, SOLO),
        ...rep(delegated, DELEGATED),
        ...rep(deliberate, DELIBERATE),
        ...rep(delegated ? 4 : 0, REASSURANCE),
      ]);

const scoreOf = (events: readonly AIUsageEvent[]): number | null => {
  const r = computeDependencyScore(events, config, NOW);
  return r.status === 'ok' ? r.score : null;
};
const name = (v: Variant): string =>
  `${v.category}${v.usedAI ? '' : '/solo'}${v.attemptedFirst ? '+attempt' : ''}${
    v.immediate ? '+instant' : ''
  }${v.reflect ? '+reflected' : ''}`;

/** Every failure carries its band change, because that is the user-visible harm. */
function record(failures: string[], label: string, before: number, after: number): void {
  const crossed = bandForScore(before, config) !== bandForScore(after, config);
  failures.push(`${label}: ${before} -> ${after}${crossed ? ' (BAND CHANGED)' : ''}`);
}

describe('the dominance relation itself', () => {
  it('enumerates the whole variant space', () => {
    expect(VARIANTS).toHaveLength(CATEGORY_INFO.length * 12);
    expect(WORSE_PAIRS.length).toBeGreaterThan(4000);
  });
});

describe('worsening behavior never lowers the score', () => {
  it('converting acts into strictly more dependent ones', () => {
    const failures: string[] = [];
    let comparisons = 0;
    for (const [from, to] of WORSE_PAIRS) {
      for (const ctx of [CONTEXTS[0]!, CONTEXTS[10]!, CONTEXTS[16]!]) {
        for (const n of [1, 12]) {
          const before = scoreOf([...ctx, ...rep(n, from)]);
          const after = scoreOf([...ctx, ...rep(n, to)]);
          comparisons += 1;
          if (before === null || after === null) continue;
          if (after < before) record(failures, `${name(from)} -> ${name(to)} x${n}`, before, after);
        }
      }
    }
    expect(comparisons).toBeGreaterThan(24_000);
    expect(failures.slice(0, 5)).toEqual([]);
  });

  it('ADDING an AI use, of any kind, under any flags', () => {
    // The defect this case exists for: `deliberateUsage` was a reducer over all
    // moments, so one more deliberate attempted-first lookup handed back ~0.24
    // points of discount while adding ~0.03 points of reliance. 18 reassurance
    // uses scored 51 "Leaning on AI"; the same 18 plus one honest lookup scored
    // 50 "Balanced". Logging AI use was the cheapest way to a better label.
    const failures: string[] = [];
    let comparisons = 0;
    for (const v of VARIANTS.filter((x) => x.usedAI)) {
      for (const ctx of CONTEXTS) {
        for (const k of [1, 3]) {
          const before = scoreOf(ctx);
          const after = scoreOf([...ctx, ...rep(k, v)]);
          comparisons += 1;
          if (before === null || after === null) continue;
          if (after < before) record(failures, `+${k} ${name(v)} on ${ctx.length}`, before, after);
        }
      }
    }
    expect(comparisons).toBeGreaterThan(2_500);
    expect(failures.slice(0, 5)).toEqual([]);
  });
});

describe('improving behavior never raises the score', () => {
  it('doing less of a dependent pattern, down to none of it', () => {
    // The headline symptom of #5: eliminating a pattern moved a user 67 -> 96.
    const failures: string[] = [];
    for (const v of [DELEGATED, REASSURANCE, V('instant_help', { immediate: true }), V('decision_outsourcing')]) {
      for (const ctx of CONTEXTS) {
        for (const n of [6, 15, 27, 50]) {
          for (const kept of [Math.floor(n / 3), Math.floor(n / 10), 0]) {
            const before = scoreOf([...ctx, ...rep(n, v)]);
            const after = scoreOf([...ctx, ...rep(kept, v)]);
            if (before === null || after === null) continue;
            if (after > before) {
              record(failures, `${name(v)} ${n} -> ${kept} on ${ctx.length}`, before, after);
            }
          }
        }
      }
    }
    expect(failures.slice(0, 5)).toEqual([]);
  });

  it('resolving more moments alone, and never by more than the configured discount', () => {
    const failures: string[] = [];
    const ceiling = 100 * config.reducerMaxDiscount;
    for (const ctx of CONTEXTS) {
      for (const k of [1, 5, 50, 2000]) {
        const before = scoreOf(ctx);
        const after = scoreOf([...ctx, ...rep(k, SOLO)]);
        if (before === null || after === null) continue;
        if (after > before) record(failures, `+${k} solo on ${ctx.length}`, before, after);
        if (before - after > ceiling + 1) {
          failures.push(`+${k} solo on ${ctx.length}: ${before} -> ${after} exceeds ${ceiling}`);
        }
      }
    }
    expect(failures.slice(0, 5)).toEqual([]);
  });
});

describe('the breakdown always reconciles with the dial', () => {
  it('contributor points minus reducer points rounds to the score, unclamped', () => {
    const failures: string[] = [];
    for (const v of VARIANTS) {
      for (const n of [10, 30, 120, 300]) {
        for (const ctx of [CONTEXTS[0]!, CONTEXTS[16]!]) {
          const result = computeDependencyScore([...ctx, ...rep(n, v)], config, NOW);
          if (result.status !== 'ok') continue;
          const sum = result.factors.reduce(
            (t, f) => t + (f.role === 'contributor' ? f.points : -f.points),
            0,
          );
          // Deliberately unclamped: clamping here is what hid a 14-point gap.
          // The epsilon matches the engine's own rounding nudge (scoring.ts).
          if (Math.round(sum + 1e-9) !== result.score) {
            failures.push(`${name(v)} x${n}: sum ${sum.toFixed(3)} vs dial ${result.score}`);
          }
          if (result.score! < 0 || result.score! > 100) {
            failures.push(`${name(v)} x${n}: out of range ${result.score}`);
          }
        }
      }
    }
    expect(failures.slice(0, 5)).toEqual([]);
  });

  it('above the clamp, mathematically equal scores round the same way', () => {
    // Reliance pins to 100 within an ulp once raw reliance exceeds the scale,
    // so worsening moves the true score by 0.0 and a naive Math.round sent two
    // identical values to different integers whenever the score landed on x.5 —
    // reading, to the user, as the worse behavior scoring lower.
    const failures: string[] = [];
    for (let delegations = 20; delegations <= 40; delegations += 1) {
      for (let lookups = 1; lookups <= 40; lookups += 1) {
        const base = rep(delegations, DELEGATED);
        const before = scoreOf([...base, ...rep(lookups, DELIBERATE)]);
        const after = scoreOf([
          ...base,
          ...rep(1, V('lookup', { attemptedFirst: true, immediate: true })),
          ...rep(lookups - 1, DELIBERATE),
        ]);
        if (before === null || after === null) continue;
        if (after < before) {
          record(failures, `instant flip at D=${delegations} L=${lookups}`, before, after);
        }
      }
    }
    expect(failures.slice(0, 5)).toEqual([]);
  });
});
