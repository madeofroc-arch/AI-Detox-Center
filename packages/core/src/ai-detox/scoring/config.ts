/**
 * All scoring weights, band cut points, and normalization parameters live
 * here — never inside the algorithm (ADR-0004). The config is
 * JSON-serializable and versioned so it can be persisted, reset, and (later)
 * tuned by the user.
 *
 * Nested objects here (`weights`, `saturation`) must be cloned by
 * `defaultScoringConfig()`, which is the ONLY sanctioned way to make a copy.
 * A shallow spread elsewhere would let a persisted document alias the
 * module-level default and corrupt it for every other instance.
 */

/** Factors that raise the dependency score. */
export type ContributorFactor =
  | 'frequency'
  | 'immediacy'
  | 'delegation'
  | 'lackOfAttempt'
  | 'emotionalDependency';

/** Factors that lower the dependency score. */
export type ReducerFactor = 'independentAttempt' | 'reflection' | 'deliberateUsage';

export type ScoringFactor = ContributorFactor | ReducerFactor;

/**
 * Current config semantics version. Bump when the MEANING of the numbers
 * changes; `migrateAppData` upgrades stored configs below this version by
 * replacing them with the defaults (see ADR-0005).
 */
export const SCORING_CONFIG_VERSION = 3;

export interface ScoringConfig {
  /** Semantics version. Stored configs below SCORING_CONFIG_VERSION are replaced. */
  version: number;
  /** How many days of history the score looks at. */
  windowDays: number;
  /**
   * Rate per day at which each contributor is treated as fully saturated.
   *
   * Contributors count DEPENDENT ACTS PER DAY rather than shares of AI use, so
   * a count only ever rises when behavior gets worse. Measuring shares made the
   * model report average severity per AI use, which mislabelled a user with one
   * slip among nine independent moments and punished people for eliminating a
   * dependency pattern (ADR-0006).
   */
  saturation: Record<ContributorFactor, number>;
  /** Below this many events the score reports insufficient data. */
  minEventsForScore: number;
  /**
   * The largest share of measured reliance that reducers may discount, in
   * [0, 1). Strictly below 1 by design: at 1 a perfect reducer profile could
   * cancel reliance entirely, which is the blanket-cancellation pathology
   * ADR-0005 removes.
   */
  reducerMaxDiscount: number;
  /** Upper bound (inclusive) of the "Mostly your own" band. */
  bandIndependentMax: number;
  /** Upper bound (inclusive) of the "Balanced" band. */
  bandBalancedMax: number;
  /** Upper bound (inclusive) of the "Leaning on AI" band. */
  bandLeaningMax: number;
  /** Brain Score share carried by independence (1 - dependency). */
  brainIndependenceWeight: number;
  /** Brain Score share carried by recent practice consistency. */
  brainConsistencyWeight: number;
  /** Days of practice history the consistency term is measured over. */
  brainPracticeWindowDays: number;
  /**
   * Weight of each factor. Contributor weights are points out of the
   * attainable capacity (see computeDependencyScore); reducer weights are
   * relative shares of `reducerMaxDiscount`, so only their ratio matters.
   */
  weights: Record<ScoringFactor, number>;
}

export const DEFAULT_SCORING_CONFIG: ScoringConfig = {
  version: SCORING_CONFIG_VERSION,
  windowDays: 14,
  minEventsForScore: 10,
  reducerMaxDiscount: 0.3,
  // Stated so they can be argued with:
  //   delegation 1           handing over a whole task every day
  //   lackOfAttempt 2        two AI uses a day with no attempt first
  //   immediacy 3            reaching for AI instantly three times a day
  //   emotionalDependency 1  seeking reassurance daily
  //   frequency 8            sheer volume, deliberately the weakest axis
  // Intensities are NOT capped at these rates -- exceeding one keeps adding,
  // and only the total is bounded. See scoring.ts for why.
  saturation: {
    frequency: 8,
    immediacy: 3,
    delegation: 1,
    lackOfAttempt: 2,
    emotionalDependency: 1,
  },
  bandIndependentMax: 25,
  bandBalancedMax: 50,
  bandLeaningMax: 75,
  brainIndependenceWeight: 0.7,
  brainConsistencyWeight: 0.3,
  brainPracticeWindowDays: 7,
  weights: {
    // Contributors. Volume is deliberately the smallest: the product's claim
    // is that quantity is not the failure mode, so 8 AI uses a day of
    // healthy, attempted-first work buys only a handful of points.
    frequency: 4,
    immediacy: 14,
    delegation: 40,
    lackOfAttempt: 40,
    emotionalDependency: 22,
    // Reducers: relative shares of the discount, not absolute points.
    independentAttempt: 50,
    reflection: 20,
    deliberateUsage: 30,
  },
};

export const CONTRIBUTOR_FACTORS: readonly ContributorFactor[] = [
  'frequency',
  'immediacy',
  'delegation',
  'lackOfAttempt',
  'emotionalDependency',
] as const;

export const REDUCER_FACTORS: readonly ReducerFactor[] = [
  'independentAttempt',
  'reflection',
  'deliberateUsage',
] as const;

/** Plain-language descriptions used by the Brain Report UI. */
export const FACTOR_DESCRIPTIONS: Record<ScoringFactor, string> = {
  frequency: 'How often AI is used, relative to a saturation baseline.',
  immediacy: 'AI reached for instantly, with no pause before it.',
  delegation: 'Whole tasks or decisions handed over to AI.',
  lackOfAttempt: 'AI used without trying yourself first.',
  emotionalDependency: 'AI asked to reassure or confirm what you already know.',
  independentAttempt: 'Moments you resolved without using AI at all.',
  reflection: 'Uses you paused to reflect on.',
  deliberateUsage: 'Intentional, tool-like uses (translate, look up, review your own work).',
};

function isPositiveFinite(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n) && n > 0;
}

/**
 * Validate an untrusted (e.g. persisted) config; returns null if unusable.
 *
 * Returning null is load-bearing, not merely defensive: `migrateAppData`
 * falls back to DEFAULT_SCORING_CONFIG when this returns null, and that is
 * how a recalibration actually reaches users who already have stored data.
 * Do NOT "helpfully" default-fill missing fields — that would silently
 * preserve stale semantics forever (ADR-0005).
 */
export function sanitizeScoringConfig(raw: unknown): ScoringConfig | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const c = raw as Partial<ScoringConfig>;

  // Older semantics are not repaired, they are replaced.
  if (typeof c.version !== 'number' || c.version !== SCORING_CONFIG_VERSION) return null;

  if (
    !isPositiveFinite(c.windowDays) ||
    !isPositiveFinite(c.minEventsForScore) ||
    !isPositiveFinite(c.brainPracticeWindowDays) ||
    typeof c.reducerMaxDiscount !== 'number' ||
    !Number.isFinite(c.reducerMaxDiscount) ||
    c.reducerMaxDiscount < 0 ||
    c.reducerMaxDiscount >= 1 ||
    typeof c.weights !== 'object' ||
    c.weights === null
  ) {
    return null;
  }

  // Bands must be ordered and inside the scale.
  if (
    !isPositiveFinite(c.bandIndependentMax) ||
    !isPositiveFinite(c.bandBalancedMax) ||
    !isPositiveFinite(c.bandLeaningMax) ||
    !(c.bandIndependentMax < c.bandBalancedMax) ||
    !(c.bandBalancedMax < c.bandLeaningMax) ||
    !(c.bandLeaningMax < 100)
  ) {
    return null;
  }

  // Brain Score shares must not be able to exceed the scale.
  const bi = c.brainIndependenceWeight;
  const bc = c.brainConsistencyWeight;
  if (
    typeof bi !== 'number' ||
    typeof bc !== 'number' ||
    !Number.isFinite(bi) ||
    !Number.isFinite(bc) ||
    bi < 0 ||
    bc < 0 ||
    bi + bc > 1
  ) {
    return null;
  }

  // Every contributor needs a positive saturation rate, or its intensity would
  // divide by zero.
  if (typeof c.saturation !== 'object' || c.saturation === null) return null;
  const saturation = c.saturation as Record<string, unknown>;
  for (const f of CONTRIBUTOR_FACTORS) {
    if (!isPositiveFinite(saturation[f])) return null;
  }

  const allFactors: ScoringFactor[] = [...CONTRIBUTOR_FACTORS, ...REDUCER_FACTORS];
  const weights = c.weights as Record<string, unknown>;
  for (const f of allFactors) {
    const w = weights[f];
    if (typeof w !== 'number' || !Number.isFinite(w) || w < 0) return null;
  }

  // Structural invariant, not a preference: delegation and emotionalDependency
  // are mutually exclusive shares of one usage-kind partition, so scoring
  // normalizes by max(delegation, emotionalDependency). If reassurance were
  // weighted above whole-task handover, the top of the scale would silently
  // become unreachable for the heavier behavior.
  if ((weights.emotionalDependency as number) > (weights.delegation as number)) return null;

  return {
    version: c.version,
    windowDays: c.windowDays,
    minEventsForScore: c.minEventsForScore,
    reducerMaxDiscount: c.reducerMaxDiscount,
    bandIndependentMax: c.bandIndependentMax,
    bandBalancedMax: c.bandBalancedMax,
    bandLeaningMax: c.bandLeaningMax,
    brainIndependenceWeight: bi,
    brainConsistencyWeight: bc,
    brainPracticeWindowDays: c.brainPracticeWindowDays,
    saturation: Object.fromEntries(
      CONTRIBUTOR_FACTORS.map((f) => [f, saturation[f] as number]),
    ) as Record<ContributorFactor, number>,
    weights: Object.fromEntries(allFactors.map((f) => [f, weights[f] as number])) as Record<
      ScoringFactor,
      number
    >,
  };
}

/**
 * A fresh, independent copy of the defaults (safe to persist and mutate).
 * Every nested object must be cloned here — a shallow spread would let one
 * persisted document alias the module-level default and corrupt it for
 * everyone.
 */
export function defaultScoringConfig(): ScoringConfig {
  return {
    ...DEFAULT_SCORING_CONFIG,
    saturation: { ...DEFAULT_SCORING_CONFIG.saturation },
    weights: { ...DEFAULT_SCORING_CONFIG.weights },
  };
}
