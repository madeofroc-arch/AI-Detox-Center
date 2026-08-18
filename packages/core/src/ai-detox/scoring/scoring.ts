/**
 * AI Dependency Score — deterministic, transparent, config-driven.
 *
 * Shape of the model (ADR-0005 established the frame, ADR-0006 fixed what it
 * measures):
 *
 *   rate_f    = count of that dependent act / windowDays
 *   reliance  = 100 * (weighted rate intensities / attainable capacity)
 *   discount  = reliance * reducerMaxDiscount * (weighted reducer signals)
 *   score     = reliance - discount
 *
 * Four properties follow, and each is a fix for a measured defect:
 *
 * 1. CONTRIBUTORS COUNT ACTS, NOT SHARES. Intensity is the RATE of a dependent
 *    behavior per day, so it only ever rises when behavior gets worse. Measuring
 *    each behavior as a share of AI uses reported average severity per AI use,
 *    which produced three confirmed absurdities: nine gate sessions solved alone
 *    plus one delegated use scored 77 "Running on AI"; eliminating an entire
 *    dependency pattern moved a user 67 -> 96 and demoted them a band; and
 *    converting an independent moment into an AI use LOWERED the score, because
 *    a lower-weight kind diluted a higher-weight one.
 *
 * 2. NORMALIZED BY ATTAINABLE CAPACITY. Any given AI use is either delegation or
 *    reassurance, never both, so the ceiling counts only the larger of the two.
 *    Summing both would make 100 reachable only by someone exhibiting every
 *    pattern at once — a dead top band, which is the bug ADR-0005 fixed and
 *    which reappears the moment this is written as a plain sum.
 *
 * 3. REDUCERS DISCOUNT, THEY DO NOT SUBTRACT. A bounded multiplicative discount
 *    can shrink reliance but never cancel it, never drive the score negative,
 *    and never invert a contributor's marginal effect.
 *
 * 4. EVERY SIGNAL HAS ONE HOME. `independentAttempt` reads moments resolved with
 *    no AI at all, not the complement of `lackOfAttempt`.
 *
 * Reducers remain proportional on purpose: they describe the SHAPE of what you
 * did, while contributors measure the AMOUNT. Their influence is bounded well
 * below a band width so in-app activity cannot buy a better label.
 *
 * Determinism: same (events, config, referenceTime) => identical output. No
 * clock reads, no randomness, and no transcendental math anywhere in the path
 * (only +, -, *, / which are exact IEEE-754 operations, so results are
 * identical across JS engines).
 */
import { eventsInWindow, computeUsageStats } from '../tracking/tracking';
import type { AIUsageEvent } from '../tracking/types';
import type { ScoringConfig, ScoringFactor } from './config';
import {
  CONTRIBUTOR_FACTORS,
  DEFAULT_SCORING_CONFIG,
  FACTOR_DESCRIPTIONS,
  REDUCER_FACTORS,
} from './config';

export type ScoreBand = 'independent' | 'balanced' | 'leaning' | 'dependent';

export interface FactorScore {
  factor: ScoringFactor;
  role: 'contributor' | 'reducer';
  /**
   * How far this factor has gone, 0..1. For contributors that is the rate of
   * the behavior against its saturation rate (0.5 = half the daily rate that
   * counts as saturated); for reducers it is the observed share.
   */
  intensity: number;
  /** The configured weight, unchanged from ScoringConfig. */
  weight: number;
  /** Points this factor could reach at intensity 1, given the rest of the picture. */
  maxPoints: number;
  /** intensity * maxPoints. Sign-neutral; `role` carries the direction. */
  points: number;
  description: string;
}

export interface DependencyScoreResult {
  status: 'ok' | 'insufficient_data';
  /** 0-100; present only when status is "ok". */
  score: number | null;
  band: ScoreBand | null;
  factors: FactorScore[];
  eventCount: number;
  aiUseCount: number;
  windowDays: number;
  configVersion: number;
}

export function bandForScore(
  score: number,
  config: ScoringConfig = DEFAULT_SCORING_CONFIG,
): ScoreBand {
  if (score <= config.bandIndependentMax) return 'independent';
  if (score <= config.bandBalancedMax) return 'balanced';
  if (score <= config.bandLeaningMax) return 'leaning';
  return 'dependent';
}

/**
 * Band captions. Deliberately behavior-descriptive and present-tense: the
 * bottom band describes what the person is doing ("Mostly your own"), not the
 * kind of person they are — an identity compliment there would make losing it
 * feel like a demotion (see ADR-0005).
 */
export const BAND_LABELS: Record<ScoreBand, string> = {
  independent: 'Mostly your own',
  balanced: 'Balanced',
  leaning: 'Leaning on AI',
  dependent: 'Running on AI',
};

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

export function computeDependencyScore(
  events: readonly AIUsageEvent[],
  config: ScoringConfig,
  nowIso: string,
): DependencyScoreResult {
  const windowed = eventsInWindow(events, nowIso, config.windowDays);
  const stats = computeUsageStats(windowed, config.windowDays);
  const w = config.weights;

  // Every contributor is independently saturable now that they are rates, so
  // the ceiling is the full sum. Using max(delegation, emotionalDependency) was
  // correct while those were shares of one partition; as rates a user can be
  // saturated on both at once, and reliance reached 122.
  const capacity = CONTRIBUTOR_FACTORS.reduce((sum, f) => sum + w[f], 0);
  const scale = capacity > 0 ? 100 / capacity : 0;

  // The denominator is the FIXED window, never the observed span. A span-based
  // denominator is not a function of behavior: removing events shrinks the span
  // and therefore RAISES every rate, so a user who stopped doing something
  // could score worse. Monotonicity is a correctness property and wins; the
  // cost is that a brand-new user's number starts conservative and converges
  // upward as the window fills, which the report copy states plainly.
  const observedDays = config.windowDays;

  /**
   * A dependent act's rate per day against its saturation rate. Deliberately
   * NOT clamped per factor: clamping each axis broke monotonicity, because once
   * the heavier axis pinned at 1.0 a conversion into it gained nothing while
   * the lighter axis lost its whole weight. The total is clamped instead, which
   * is monotone.
   */
  const rate = (count: number, factor: keyof typeof config.saturation): number =>
    count / observedDays / config.saturation[factor];

  const intensities: Record<ScoringFactor, number> = {
    // Contributors: how MUCH dependent behavior there was.
    frequency: rate(stats.aiUseCount, 'frequency'),
    immediacy: rate(stats.counts.immediacy, 'immediacy'),
    delegation: rate(stats.counts.delegation, 'delegation'),
    lackOfAttempt: rate(stats.counts.lackOfAttempt, 'lackOfAttempt'),
    emotionalDependency: rate(stats.counts.emotionalDependency, 'emotionalDependency'),
    // Reducers: the SHAPE of what you did, all over the same denominator (all
    // moments). Mixing denominators let a strictly worse change -- turning an
    // independently-resolved moment into a deliberate AI use -- raise a reducer
    // faster than it raised reliance, and so lower the score.
    independentAttempt: clamp01(stats.fractionResolvedWithoutAI),
    reflection: clamp01(stats.fractionWithReflection),
    deliberateUsage: clamp01(stats.fractionMomentsDeliberate),
  };

  // Scale every contributor by the same factor when the raw total exceeds the
  // scale, so the breakdown still sums to the dial after clamping.
  const rawReliance = CONTRIBUTOR_FACTORS.reduce(
    (sum, f) => sum + scale * w[f] * intensities[f],
    0,
  );
  const clampFactor = rawReliance > 100 ? 100 / rawReliance : 1;

  const contributors: FactorScore[] = CONTRIBUTOR_FACTORS.map((factor) => {
    const maxPoints = scale * w[factor] * clampFactor;
    return {
      factor,
      role: 'contributor' as const,
      intensity: intensities[factor],
      weight: w[factor],
      maxPoints,
      points: intensities[factor] * maxPoints,
      description: FACTOR_DESCRIPTIONS[factor],
    };
  });

  // Everything downstream derives from the SUMMED points, never from a
  // separately-computed total: adding the same quantities in a different
  // association order differs in the last bits, which was enough to make the
  // dial disagree with its own breakdown by a point near a .5 boundary.
  const reliance = contributors.reduce((sum, f) => sum + f.points, 0);

  // Reducer weights are relative shares of the allowed discount.
  const reducerWeightTotal = REDUCER_FACTORS.reduce((sum, f) => sum + w[f], 0);
  const reducers: FactorScore[] = REDUCER_FACTORS.map((factor) => {
    const maxPoints =
      reducerWeightTotal > 0
        ? (reliance * config.reducerMaxDiscount * w[factor]) / reducerWeightTotal
        : 0;
    return {
      factor,
      role: 'reducer' as const,
      intensity: intensities[factor],
      weight: w[factor],
      maxPoints,
      points: intensities[factor] * maxPoints,
      description: FACTOR_DESCRIPTIONS[factor],
    };
  });

  const factors = [...contributors, ...reducers];
  const base = {
    factors,
    eventCount: stats.totalEvents,
    aiUseCount: stats.aiUseCount,
    windowDays: config.windowDays,
    configVersion: config.version,
  };

  if (stats.totalEvents < config.minEventsForScore) {
    return { status: 'insufficient_data', score: null, band: null, ...base };
  }

  const discount = reducers.reduce((sum, f) => sum + f.points, 0);
  // reliance <= 100 by the clamp factor above, and discount < reliance because
  // reducerMaxDiscount < 1, so this stays in range; the clamp guards a
  // hand-edited config.
  const score = Math.round(Math.min(100, Math.max(0, reliance - discount)));

  return { status: 'ok', score, band: bandForScore(score, config), ...base };
}

/**
 * Brain Score — the number on Home. Composed from independence (the inverse of
 * dependency) and recent practice consistency.
 *
 * Additive framing: it grows with healthy behavior and is never a punishment
 * meter. Two properties keep that honest rather than aspirational, and both
 * are asserted in the test suite: adding an attempted-first moment never
 * lowers it, and adding a practice day never lowers it.
 */
export interface BrainScoreInput {
  dependency: DependencyScoreResult;
  /** Days with challenge activity in the recent practice window. */
  activePracticeDaysLast7: number;
}

export function computeBrainScore(
  input: BrainScoreInput,
  config: ScoringConfig = DEFAULT_SCORING_CONFIG,
): number | null {
  if (input.dependency.status !== 'ok' || input.dependency.score === null) return null;
  const independence = 100 - input.dependency.score;
  const consistency =
    clamp01(input.activePracticeDaysLast7 / config.brainPracticeWindowDays) * 100;
  const score =
    config.brainIndependenceWeight * independence + config.brainConsistencyWeight * consistency;
  return Math.round(Math.min(100, Math.max(0, score)));
}
