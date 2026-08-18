/**
 * All scoring weights and normalization parameters live here — never inside
 * the algorithm (ADR-0004). The config is JSON-serializable and versioned so
 * it can be persisted, reset, and (later) tuned by the user.
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

export interface ScoringConfig {
  /** Bump when semantics of weights change; migrations key off this. */
  version: number;
  /** How many days of history the score looks at. */
  windowDays: number;
  /** AI uses per day at which the frequency factor saturates to 1. */
  saturationUsesPerDay: number;
  /** Below this many events the score reports insufficient data. */
  minEventsForScore: number;
  /** Weight (in score points) each factor contributes at full strength. */
  weights: Record<ScoringFactor, number>;
}

export const DEFAULT_SCORING_CONFIG: ScoringConfig = {
  version: 1,
  windowDays: 14,
  saturationUsesPerDay: 8,
  minEventsForScore: 5,
  weights: {
    frequency: 15,
    immediacy: 20,
    delegation: 25,
    lackOfAttempt: 20,
    emotionalDependency: 20,
    independentAttempt: 25,
    reflection: 15,
    deliberateUsage: 20,
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
  independentAttempt: 'Moments where you tried yourself first.',
  reflection: 'Uses you paused to reflect on.',
  deliberateUsage: 'Intentional, tool-like uses (translate, look up, review your own work).',
};

/** Validate an untrusted (e.g. persisted) config; returns null if unusable. */
export function sanitizeScoringConfig(raw: unknown): ScoringConfig | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const c = raw as Partial<ScoringConfig>;
  if (
    typeof c.version !== 'number' ||
    typeof c.windowDays !== 'number' ||
    c.windowDays <= 0 ||
    typeof c.saturationUsesPerDay !== 'number' ||
    c.saturationUsesPerDay <= 0 ||
    typeof c.minEventsForScore !== 'number' ||
    typeof c.weights !== 'object' ||
    c.weights === null
  ) {
    return null;
  }
  const allFactors: ScoringFactor[] = [...CONTRIBUTOR_FACTORS, ...REDUCER_FACTORS];
  const weights = c.weights as Record<string, unknown>;
  for (const f of allFactors) {
    const w = weights[f];
    if (typeof w !== 'number' || !Number.isFinite(w) || w < 0) return null;
  }
  return {
    version: c.version,
    windowDays: c.windowDays,
    saturationUsesPerDay: c.saturationUsesPerDay,
    minEventsForScore: c.minEventsForScore,
    weights: Object.fromEntries(allFactors.map((f) => [f, weights[f] as number])) as Record<
      ScoringFactor,
      number
    >,
  };
}
