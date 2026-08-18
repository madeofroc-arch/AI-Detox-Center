/**
 * Calibration invariants for the dependency score (ADR-0005).
 *
 * The old model passed every test it had while calling someone who delegated
 * 42% of their tasks "Independent". These tests exist so that cannot happen
 * again: they pin the MIDDLE of the range and the philosophy guarantees, not
 * just the extremes.
 */
import { describe, expect, it } from 'vitest';
import {
  BAND_LABELS,
  CONTRIBUTOR_FACTORS,
  DEFAULT_SCORING_CONFIG,
  REDUCER_FACTORS,
  computeBrainScore,
  computeDependencyScore,
} from '../src/index';
import type { AIUsageCategory, AIUsageEvent, ScoringConfig } from '../src/index';

const NOW = '2026-08-18T18:00:00.000Z';
const config: ScoringConfig = DEFAULT_SCORING_CONFIG;

let seq = 0;
function ev(
  category: AIUsageCategory,
  opts: { attemptedFirst?: boolean; usedAI?: boolean; immediate?: boolean; reflect?: boolean } = {},
): AIUsageEvent {
  seq += 1;
  return {
    id: `c${seq}`,
    timestamp: '2026-08-14T10:00:00.000Z',
    category,
    source: 'gate',
    attemptedFirst: opts.attemptedFirst ?? false,
    usedAI: opts.usedAI ?? true,
    proceededImmediately: opts.immediate ?? false,
    ...(opts.reflect ? { reflectionId: `r${seq}` } : {}),
  };
}
const rep = (n: number, make: (i: number) => AIUsageEvent): AIUsageEvent[] =>
  Array.from({ length: n }, (_, i) => make(i));

const score = (events: readonly AIUsageEvent[], cfg: ScoringConfig = config) =>
  computeDependencyScore(events, cfg, NOW);

// ── Behavioral anchors ─────────────────────────────────────────────────────
// Each anchor is the plain-language definition of a band from
// docs/design/screens.md. The algorithm is calibrated to these, never the
// reverse: if one lands in the wrong band, the weights are wrong.

/** Attempts first, uses AI as a tool, resolves plenty alone. */
const SELF_DIRECTED: AIUsageEvent[] = [
  ...rep(8, (i) => ev(i % 2 ? 'lookup' : 'translation', { attemptedFirst: true, reflect: i < 3 })),
  ...rep(8, () => ev('lookup', { attemptedFirst: true, usedAI: false })),
];

/** Hands over whole tasks on ~4 of 10 uses and skips attempting on ~7 of 10. */
const MODERATE: AIUsageEvent[] = [
  ...rep(10, (i) => ev('direct_delegation', { immediate: i < 4 })),
  ...rep(4, () => ev('decision_outsourcing', { immediate: true })),
  ...rep(7, () => ev('instant_help', { immediate: true })),
  ...rep(2, () => ev('reassurance_seeking', { immediate: true })),
  ...rep(6, (i) => ev('lookup', { attemptedFirst: true, reflect: i < 5 })),
  ...rep(4, () => ev('review_own_work', { attemptedFirst: true, reflect: true })),
  ...rep(2, () => ev('lookup', { attemptedFirst: true, usedAI: false })),
];

/** AI is the first and only move, on whole tasks. */
const TOTAL_OUTSOURCING: AIUsageEvent[] = rep(28, () =>
  ev('direct_delegation', { immediate: true }),
);

/** Heavy AI use, but deliberate and always attempted first. */
const HEAVY_BUT_HEALTHY: AIUsageEvent[] = rep(56, (i) =>
  ev(i % 2 ? 'lookup' : 'review_own_work', { attemptedFirst: true }),
);

describe('behavioral anchors land in their intended bands', () => {
  it('self-directed use reads as mostly your own', () => {
    const result = score(SELF_DIRECTED);
    expect(result.band).toBe('independent');
    expect(result.score!).toBeLessThanOrEqual(config.bandIndependentMax);
  });

  it('MODERATE dependency is visibly moderate, not "independent"', () => {
    const result = score(MODERATE);
    // The regression this whole ADR exists for: the old model scored this
    // behavior 23 and captioned it "Independent".
    expect(result.score!).toBeGreaterThan(config.bandBalancedMax);
    expect(result.band).toBe('leaning');
  });

  it('total outsourcing reaches the top band', () => {
    const result = score(TOTAL_OUTSOURCING);
    expect(result.band).toBe('dependent');
    expect(result.score!).toBeGreaterThan(config.bandLeaningMax);
  });

  it('heavy but healthy use stays in the lowest band, far from moderate', () => {
    const healthy = score(HEAVY_BUT_HEALTHY);
    const moderate = score(MODERATE);
    expect(healthy.band).toBe('independent');
    // The separation is the whole point: volume must not masquerade as reliance.
    expect(moderate.score! - healthy.score!).toBeGreaterThan(30);
  });

  it('the top of the scale is actually reachable', () => {
    // Worst possible behavior at the saturation rate. Two earlier models each
    // capped below 100 for different structural reasons, leaving a dead band.
    const worst = rep(Math.ceil(config.saturation.frequency * config.windowDays), () =>
      ev('direct_delegation', { immediate: true }),
    );
    expect(score(worst).score).toBe(100);
  });

  it('total outsourcing at low volume reads as serious but not maximal', () => {
    // One whole task handed over every day, never attempted first. The pattern
    // is total but the amount is not, and the model now grades the amount: this
    // sits in "Leaning on AI", below someone doing the same thing eight times a
    // day. Under ADR-0005 it scored 96, indistinguishable from the latter.
    const lowVolume = rep(config.windowDays, () => ev('direct_delegation', { immediate: true }));
    const result = score(lowVolume);
    expect(result.band).toBe('leaning');
    const heavy = rep(config.windowDays * 8, () => ev('direct_delegation', { immediate: true }));
    expect(score(heavy).score!).toBeGreaterThan(result.score! + 15);
  });
});

describe('volume of DEPENDENT acts is reliance; volume of healthy use is not', () => {
  it('the same pattern at half the volume scores lower', () => {
    // This inverts an assertion from ADR-0005, deliberately. That model measured
    // the SHAPE of AI use, so halving the volume of an unchanged pattern left the
    // score alone. Measuring shape is what made it punish a user for eliminating
    // a dependency pattern (issue #5), so ADR-0006 measures the AMOUNT instead:
    // half as many tasks handed over is half as much outsourced thinking, and
    // the number should say so.
    const half = MODERATE.filter((_, i) => i % 2 === 0);
    expect(score(half).score!).toBeLessThan(score(MODERATE).score!);
  });

  it('cutting out a whole dependency pattern lowers the score', () => {
    // The headline defect of #5: this pair moved 67 -> 96 and demoted the user
    // a band for eliminating 27 instant-help reaches.
    const withInstantHelp = [
      ...rep(10, () => ev('direct_delegation', { immediate: true })),
      ...rep(27, () => ev('instant_help', { immediate: true })),
    ];
    const withoutInstantHelp = rep(10, () => ev('direct_delegation', { immediate: true }));
    expect(score(withoutInstantHelp).score!).toBeLessThan(score(withInstantHelp).score!);
  });

  it('one slip among nine independent moments is not "Running on AI"', () => {
    // The P0. Nine gate sessions resolved without AI, one delegated use: the
    // previous model saturated every fraction on a denominator of 1 and scored
    // this 77, printing "You handled 90% of these moments without AI" directly
    // beneath the caption "Running on AI".
    const mostlyIndependent = [
      ...rep(9, () => ev('lookup', { attemptedFirst: true, usedAI: false })),
      ev('direct_delegation', { immediate: true }),
    ];
    const result = score(mostlyIndependent);
    expect(result.band).toBe('independent');
    expect(result.score!).toBeLessThanOrEqual(config.bandIndependentMax);
  });

  it('frequency alone cannot lift a healthy user out of the lowest band', () => {
    const veryHeavy = rep(200, () => ev('lookup', { attemptedFirst: true }));
    expect(score(veryHeavy).band).toBe('independent');
  });

  it('occasional slips are not punished', () => {
    const mostlyHealthy = [
      ...rep(30, () => ev('lookup', { attemptedFirst: true })),
      ...rep(3, () => ev('direct_delegation', { immediate: true })),
    ];
    expect(score(mostlyHealthy).band).toBe('independent');
  });

  it('claiming an attempt cannot buy the lowest band while delegating everything', () => {
    // attemptedFirst is self-reported, so it must not be able to launder a
    // profile of pure whole-task handover into the friendliest caption.
    const contradiction = rep(28, () => ev('direct_delegation', { attemptedFirst: true }));
    expect(score(contradiction).band).not.toBe('independent');
  });
});

describe('reducers discount but never cancel', () => {
  it('a perfect reducer profile cannot erase measured reliance', () => {
    // Delegates everything AND reflects on everything AND resolves half alone.
    const mixed = [
      ...rep(20, () => ev('direct_delegation', { immediate: true, reflect: true })),
      ...rep(20, () => ev('lookup', { attemptedFirst: true, usedAI: false, reflect: true })),
    ];
    const result = score(mixed);
    expect(result.score!).toBeGreaterThan(0);
  });

  it('the discount is bounded by reducerMaxDiscount', () => {
    const events = rep(28, () => ev('direct_delegation', { immediate: true, reflect: true }));
    const result = score(events);
    const reliance = result.factors
      .filter((f) => f.role === 'contributor')
      .reduce((sum, f) => sum + f.points, 0);
    const discount = result.factors
      .filter((f) => f.role === 'reducer')
      .reduce((sum, f) => sum + f.points, 0);
    expect(discount).toBeLessThanOrEqual(reliance * config.reducerMaxDiscount + 1e-9);
  });

  it('reflection alone cannot move a user across a band (no engagement loop)', () => {
    // Principle 8: using the app more must not improve your number materially.
    // The old model moved this fixture a full band (71 -> 56) on reflection alone.
    const none = rep(42, () => ev('direct_delegation', { immediate: true }));
    const all = rep(42, () => ev('direct_delegation', { immediate: true, reflect: true }));
    const a = score(none);
    const b = score(all);
    expect(b.score!).toBeLessThan(a.score!); // it still counts for something
    expect(a.band).toBe(b.band); // but never buys a band
  });

  it('attempting first remains the most responsive lever (the north-star)', () => {
    const at = (attemptedPct: number) => {
      const attempted = Math.round((28 * attemptedPct) / 100);
      return score([
        ...rep(attempted, () => ev('direct_delegation', { attemptedFirst: true })),
        ...rep(28 - attempted, () => ev('direct_delegation', { immediate: true })),
      ]).score!;
    };
    const swing = at(0) - at(100);
    // Visible and monotone, but not so violent that one flipped bit rewrites
    // the verdict: metrics.md names this the north-star metric.
    expect(swing).toBeGreaterThan(config.bandIndependentMax);
    expect(at(0)).toBeGreaterThan(at(50));
    expect(at(50)).toBeGreaterThan(at(100));
  });
});

describe('monotonicity', () => {
  it('trading a deliberate use for a delegated one never lowers the score', () => {
    let previous = -1;
    for (let delegated = 0; delegated <= 30; delegated += 1) {
      const events = [
        ...rep(delegated, () => ev('direct_delegation', { immediate: true })),
        ...rep(30 - delegated, () => ev('lookup', { attemptedFirst: true })),
      ];
      const current = score(events).score!;
      expect(current).toBeGreaterThanOrEqual(previous);
      previous = current;
    }
  });

  it('adding an independently resolved moment never raises the score', () => {
    const base = rep(20, () => ev('direct_delegation', { immediate: true }));
    const withIndependent = [...base, ev('lookup', { attemptedFirst: true, usedAI: false })];
    expect(score(withIndependent).score!).toBeLessThanOrEqual(score(base).score!);
  });
});

describe('the report can honestly say the factors add up', () => {
  it('contributor points minus reducer points equals the score', () => {
    for (const fixture of [MODERATE, TOTAL_OUTSOURCING, SELF_DIRECTED, HEAVY_BUT_HEALTHY]) {
      const result = score(fixture);
      const sum = result.factors.reduce(
        (total, f) => total + (f.role === 'contributor' ? f.points : -f.points),
        0,
      );
      expect(Math.round(Math.min(100, Math.max(0, sum)))).toBe(result.score);
    }
  });

  it('every factor reports points = intensity * maxPoints', () => {
    for (const f of score(MODERATE).factors) {
      expect(f.points).toBeCloseTo(f.intensity * f.maxPoints, 10);
    }
  });

  it('keeps the eight-factor breakdown the UI renders', () => {
    const result = score(MODERATE);
    expect(result.factors).toHaveLength(
      CONTRIBUTOR_FACTORS.length + REDUCER_FACTORS.length,
    );
    expect(result.factors.every((f) => f.description.length > 0)).toBe(true);
  });
});

describe('evidence gate', () => {
  it('a handful of delegated events is not enough for a confident verdict', () => {
    // The old model scored 6 delegated events 66 — outranking a user with 56
    // recorded uses of near-total outsourcing.
    const thin = rep(6, () => ev('direct_delegation', { immediate: true }));
    const result = score(thin);
    expect(result.status).toBe('insufficient_data');
    expect(result.score).toBeNull();
    expect(result.band).toBeNull();
  });
});

describe('band captions', () => {
  it('describes behavior rather than claiming an identity', () => {
    // "Independent" was an identity compliment; losing it reads as demotion.
    expect(BAND_LABELS.independent).toBe('Mostly your own');
    expect(Object.values(BAND_LABELS).every((label) => !/^you\b/i.test(label))).toBe(true);
  });
});

describe('Brain Score stays additive', () => {
  it('never drops when a practice day is added', () => {
    const dependency = score(MODERATE);
    for (let days = 0; days < config.brainPracticeWindowDays; days += 1) {
      const lower = computeBrainScore({ dependency, activePracticeDaysLast7: days }, config)!;
      const higher = computeBrainScore({ dependency, activePracticeDaysLast7: days + 1 }, config)!;
      expect(higher).toBeGreaterThanOrEqual(lower);
    }
  });

  it('never drops when an attempted-first moment is added', () => {
    const base = rep(20, () => ev('direct_delegation', { immediate: true }));
    const improved = [...base, ev('lookup', { attemptedFirst: true, usedAI: false })];
    const before = computeBrainScore(
      { dependency: score(base), activePracticeDaysLast7: 3 },
      config,
    )!;
    const after = computeBrainScore(
      { dependency: score(improved), activePracticeDaysLast7: 3 },
      config,
    )!;
    expect(after).toBeGreaterThanOrEqual(before);
  });

  it('someone practising every day never sees a single-digit headline', () => {
    const worst = rep(200, () => ev('direct_delegation', { immediate: true }));
    const headline = computeBrainScore(
      {
        dependency: score(worst),
        activePracticeDaysLast7: config.brainPracticeWindowDays,
      },
      config,
    )!;
    expect(headline).toBeGreaterThanOrEqual(10);
  });
});
