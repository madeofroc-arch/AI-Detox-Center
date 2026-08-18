/**
 * Property-based tests for the dependency score.
 *
 * The example-based tests pin behavior we thought to check. These pin
 * properties that must hold for *every* input, fuzzed over a deterministic
 * pseudo-random corpus — the seed is fixed so a failure is always reproducible.
 */
import { describe, expect, it } from 'vitest';
import {
  CATEGORY_INFO,
  DEFAULT_SCORING_CONFIG,
  computeDependencyScore,
  defaultScoringConfig,
} from '../src/index';
import type { AIUsageCategory, AIUsageEvent, ScoringConfig } from '../src/index';

const NOW = '2026-08-19T12:00:00.000Z';
const config: ScoringConfig = DEFAULT_SCORING_CONFIG;
const CATEGORIES: AIUsageCategory[] = CATEGORY_INFO.map((c) => c.category);

/** Fixed-seed LCG: the corpus is identical on every machine and every run. */
function makeRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

const daysAgo = (days: number): string =>
  new Date(Date.parse(NOW) - days * 86_400_000 - 3_600_000).toISOString();

function randomEvents(rnd: () => number, count: number): AIUsageEvent[] {
  return Array.from({ length: count }, (_, i) => {
    const attemptedFirst = rnd() < 0.5;
    const usedAI = rnd() < 0.85;
    return {
      id: `f${i}`,
      timestamp: daysAgo(Math.floor(rnd() * config.windowDays)),
      category: CATEGORIES[Math.floor(rnd() * CATEGORIES.length)]!,
      source: rnd() < 0.5 ? 'gate' : 'manual',
      attemptedFirst,
      usedAI,
      proceededImmediately: usedAI && !attemptedFirst && rnd() < 0.7,
      ...(rnd() < 0.3 ? { reflectionId: `r${i}` } : {}),
    };
  });
}

const delegatedEvents = (count: number, over: Partial<AIUsageEvent> = {}): AIUsageEvent[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `d${i}`,
    timestamp: daysAgo(i % config.windowDays),
    category: 'direct_delegation' as AIUsageCategory,
    source: 'gate' as const,
    attemptedFirst: false,
    usedAI: true,
    proceededImmediately: true,
    ...over,
  }));

describe('properties that hold for every input', () => {
  it('is deterministic across repeats, JSON round-trips and deep clones', () => {
    const rnd = makeRandom(12_345);
    for (let trial = 0; trial < 200; trial += 1) {
      const events = randomEvents(rnd, 1 + Math.floor(rnd() * 60));
      const a = computeDependencyScore(events, config, NOW);
      const b = computeDependencyScore(
        [...events],
        JSON.parse(JSON.stringify(config)) as ScoringConfig,
        NOW,
      );
      const c = computeDependencyScore(events, structuredClone(config), NOW);
      expect(b).toEqual(a);
      expect(c).toEqual(a);
    }
  });

  it('never produces a score outside 0-100, and never NaN', () => {
    const rnd = makeRandom(999);
    for (let trial = 0; trial < 1000; trial += 1) {
      const result = computeDependencyScore(randomEvents(rnd, Math.floor(rnd() * 80)), config, NOW);
      if (result.status === 'ok') {
        expect(Number.isFinite(result.score!)).toBe(true);
        expect(result.score!).toBeGreaterThanOrEqual(0);
        expect(result.score!).toBeLessThanOrEqual(100);
      }
      for (const factor of result.factors) {
        expect(Number.isFinite(factor.points)).toBe(true);
        expect(Number.isFinite(factor.intensity)).toBe(true);
        expect(Number.isFinite(factor.maxPoints)).toBe(true);
      }
    }
  });

  it('always reports a breakdown that adds up to the score', () => {
    const rnd = makeRandom(4_242);
    for (let trial = 0; trial < 1000; trial += 1) {
      const result = computeDependencyScore(
        randomEvents(rnd, config.minEventsForScore + Math.floor(rnd() * 60)),
        config,
        NOW,
      );
      if (result.status !== 'ok') continue;
      const sum = result.factors.reduce(
        (total, f) => total + (f.role === 'contributor' ? f.points : -f.points),
        0,
      );
      expect(Math.round(Math.min(100, Math.max(0, sum)))).toBe(result.score);
      for (const factor of result.factors) {
        expect(factor.points).toBeCloseTo(factor.intensity * factor.maxPoints, 9);
      }
    }
  });

  it('is monotone toward EVERY dependent kind, not just the heaviest', () => {
    // This test previously only ever worsened toward direct_delegation, the
    // maximum-weight kind, so it was structurally incapable of observing the
    // monotonicity break in issue #5 -- which needed a LOWER-weight kind to
    // dilute a higher-weight one. It now sweeps every dependent category.
    const worseKinds: AIUsageCategory[] = [
      'direct_delegation',
      'decision_outsourcing',
      'instant_help',
      'reassurance_seeking',
    ];
    const rnd = makeRandom(7_777);
    for (const kind of worseKinds) {
      for (let trial = 0; trial < 10; trial += 1) {
        const count = config.minEventsForScore + Math.floor(rnd() * 30);
        const healthy: AIUsageEvent[] = Array.from({ length: count }, (_, i) => ({
          id: `h${i}`,
          timestamp: daysAgo(i % config.windowDays),
          category: 'lookup',
          source: 'gate',
          attemptedFirst: true,
          usedAI: true,
          proceededImmediately: false,
        }));
        let previous = computeDependencyScore(healthy, config, NOW).score!;
        for (let worsened = 0; worsened < count; worsened += 1) {
          const events = healthy.map((e, i) =>
            i <= worsened
              ? { ...e, category: kind, attemptedFirst: false, proceededImmediately: true }
              : e,
          );
          const current = computeDependencyScore(events, config, NOW).score!;
          expect(current, `${kind} at step ${worsened}`).toBeGreaterThanOrEqual(previous);
          previous = current;
        }
      }
    }
  });

  it('converting an independently-resolved moment into any AI use never lowers the score', () => {
    // The exact shape of the #5 monotonicity break: strictly worse behavior
    // that the old model rewarded, because adding a lower-weight AI use
    // diluted the share held by a higher-weight one.
    const kinds: AIUsageCategory[] = [
      'direct_delegation',
      'decision_outsourcing',
      'instant_help',
      'reassurance_seeking',
      'lookup',
    ];
    const solo = (i: number): AIUsageEvent => ({
      id: `s${i}`,
      timestamp: daysAgo(i % config.windowDays),
      category: 'lookup',
      source: 'gate',
      attemptedFirst: true,
      usedAI: false,
      proceededImmediately: false,
    });
    for (const other of kinds) {
      for (const soloCount of [4, 8, 15]) {
        for (const otherCount of [6, 12]) {
          const before = [
            ...Array.from({ length: soloCount }, (_, i) => solo(i)),
            ...delegatedEvents(otherCount, { category: other }),
          ];
          const after = [
            ...Array.from({ length: soloCount - 1 }, (_, i) => solo(i)),
            ...delegatedEvents(otherCount, { category: other }),
            { ...delegatedEvents(1, { category: 'instant_help' })[0]!, id: 'converted' },
          ];
          const b = computeDependencyScore(before, config, NOW);
          const a = computeDependencyScore(after, config, NOW);
          if (b.status !== 'ok' || a.status !== 'ok') continue;
          expect(a.score!, `${other} ${soloCount}/${otherCount}`).toBeGreaterThanOrEqual(b.score!);
        }
      }
    }
  });

  it('eliminating a whole dependency pattern never raises the score', () => {
    // The headline defect: dropping 27 instant-help reaches moved a user
    // 67 -> 96 and demoted them a band, because it concentrated the shares.
    for (const kept of [5, 10, 20]) {
      for (const dropped of [5, 15, 27, 50]) {
        const withPattern = [
          ...delegatedEvents(kept),
          ...delegatedEvents(dropped, { category: 'instant_help' }),
        ];
        const without = delegatedEvents(kept);
        const w = computeDependencyScore(withPattern, config, NOW);
        const o = computeDependencyScore(without, config, NOW);
        if (w.status !== 'ok' || o.status !== 'ok') continue;
        expect(o.score!, `kept ${kept}, dropped ${dropped}`).toBeLessThanOrEqual(w.score!);
      }
    }
  });
});

describe('degenerate inputs stay safe', () => {
  const cases: Array<[string, AIUsageEvent[]]> = [
    ['empty', []],
    ['duplicate ids', delegatedEvents(12, { id: 'same' })],
    [
      'timestamps exactly on the window boundary',
      delegatedEvents(12, {
        timestamp: new Date(Date.parse(NOW) - config.windowDays * 86_400_000).toISOString(),
      }),
    ],
    ['future timestamps', delegatedEvents(12, { timestamp: '2099-01-01T00:00:00.000Z' })],
    [
      'a category the taxonomy does not know',
      delegatedEvents(12, { category: 'not_a_real_category' as AIUsageCategory }),
    ],
  ];

  for (const [name, events] of cases) {
    it(name, () => {
      const result = computeDependencyScore(events, config, NOW);
      if (result.score !== null) {
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(100);
      }
      expect(result.factors.every((f) => Number.isFinite(f.points))).toBe(true);
    });
  }

  it('a fully zeroed config scores 0 rather than dividing by zero', () => {
    const zeroed = defaultScoringConfig();
    for (const factor of Object.keys(zeroed.weights) as Array<keyof typeof zeroed.weights>) {
      zeroed.weights[factor] = 0;
    }
    expect(computeDependencyScore(delegatedEvents(12), zeroed, NOW).score).toBe(0);
  });

  it('zero reducer weights simply means no discount', () => {
    const noReducers = defaultScoringConfig();
    noReducers.weights.independentAttempt = 0;
    noReducers.weights.reflection = 0;
    noReducers.weights.deliberateUsage = 0;
    const result = computeDependencyScore(delegatedEvents(12), noReducers, NOW);
    expect(Number.isFinite(result.score!)).toBe(true);
    expect(result.factors.filter((f) => f.role === 'reducer').every((f) => f.points === 0)).toBe(
      true,
    );
  });
});

describe('self-reported signals are bounded', () => {
  const reducerTotal =
    config.weights.independentAttempt + config.weights.reflection + config.weights.deliberateUsage;

  it('padding the log with independent moments is capped well below a band', () => {
    // NOT "cannot cross a band". That phrasing is unachievable and was itself an
    // overclaim: any factor with non-zero influence can cross a cut point if the
    // user happens to be standing on one. What IS guaranteeable, and what
    // actually protects the number, is the MAGNITUDE of the swing.
    //
    // independentAttempt reads self-reported non-AI moments, so it is the most
    // gameable input in the model. Its ceiling is reducerMaxDiscount x its share
    // of the reducer weights, i.e. at most that percentage of a 100-point scale
    // -- comfortably less than one 25-point band, however much a user pads.
    const base = delegatedEvents(28);
    const baseline = computeDependencyScore(base, config, NOW);
    const ceiling =
      100 * config.reducerMaxDiscount * (config.weights.independentAttempt / reducerTotal);
    const bandWidth = config.bandBalancedMax - config.bandIndependentMax;
    expect(ceiling).toBeLessThan(bandWidth);

    for (const padding of [10, 200, 2000]) {
      const padded = [
        ...base,
        ...Array.from({ length: padding }, (_, i) => ({
          id: `pad${i}`,
          timestamp: daysAgo(i % config.windowDays),
          category: 'lookup' as AIUsageCategory,
          source: 'manual' as const,
          attemptedFirst: true,
          usedAI: false,
          proceededImmediately: false,
        })),
      ];
      const swing = baseline.score! - computeDependencyScore(padded, config, NOW).score!;
      expect(swing).toBeGreaterThanOrEqual(0);
      expect(swing).toBeLessThanOrEqual(ceiling + 1);
    }
  });

  it('reflecting on every AI use is capped tighter still', () => {
    // Principle 8: in-app activity must not be a route to a better number.
    const none = delegatedEvents(28);
    const all = delegatedEvents(28, { reflectionId: 'r' });
    const swing =
      computeDependencyScore(none, config, NOW).score! -
      computeDependencyScore(all, config, NOW).score!;
    expect(swing).toBeGreaterThan(0);
    expect(swing).toBeLessThanOrEqual(
      100 * config.reducerMaxDiscount * (config.weights.reflection / reducerTotal) + 1,
    );
  });
});
