/**
 * AI Dependency Score — deterministic, transparent, config-driven.
 *
 * Conceptual model (see the ai-detox-engine skill):
 *
 *   score = + frequency + immediacy + delegation
 *           + lack_of_attempt + emotional_dependency
 *           - independent_attempt - reflection - deliberate_usage
 *
 * Every factor is a 0..1 intensity multiplied by its configured weight.
 * Same events + same config + same reference time => identical output.
 */
import { eventsInWindow, computeUsageStats } from '../tracking/tracking';
import type { AIUsageEvent } from '../tracking/types';
import type { ScoringConfig, ScoringFactor } from './config';
import { CONTRIBUTOR_FACTORS, REDUCER_FACTORS, FACTOR_DESCRIPTIONS } from './config';

export type ScoreBand = 'independent' | 'balanced' | 'leaning' | 'dependent';

export interface FactorScore {
  factor: ScoringFactor;
  role: 'contributor' | 'reducer';
  /** Raw intensity 0..1 before weighting. */
  intensity: number;
  weight: number;
  /** intensity * weight, sign-neutral (role carries the direction). */
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

export function bandForScore(score: number): ScoreBand {
  if (score <= 25) return 'independent';
  if (score <= 50) return 'balanced';
  if (score <= 75) return 'leaning';
  return 'dependent';
}

export const BAND_LABELS: Record<ScoreBand, string> = {
  independent: 'Independent',
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

  const intensities: Record<ScoringFactor, number> = {
    frequency: clamp01(stats.aiUsesPerDay / config.saturationUsesPerDay),
    immediacy: clamp01(stats.fractionImmediate),
    delegation: clamp01(stats.fractionDelegation),
    lackOfAttempt: clamp01(stats.fractionNoAttemptBeforeAI),
    emotionalDependency: clamp01(stats.fractionEmotional),
    independentAttempt: clamp01(stats.fractionAttemptedFirst),
    reflection: clamp01(stats.fractionWithReflection),
    deliberateUsage: clamp01(stats.fractionDeliberate),
  };

  const makeFactor = (factor: ScoringFactor, role: 'contributor' | 'reducer'): FactorScore => {
    const weight = config.weights[factor];
    const intensity = intensities[factor];
    return {
      factor,
      role,
      intensity,
      weight,
      points: intensity * weight,
      description: FACTOR_DESCRIPTIONS[factor],
    };
  };

  const factors: FactorScore[] = [
    ...CONTRIBUTOR_FACTORS.map((f) => makeFactor(f, 'contributor')),
    ...REDUCER_FACTORS.map((f) => makeFactor(f, 'reducer')),
  ];

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

  const raw = factors.reduce(
    (sum, f) => sum + (f.role === 'contributor' ? f.points : -f.points),
    0,
  );
  const score = Math.round(Math.min(100, Math.max(0, raw)));

  return { status: 'ok', score, band: bandForScore(score), ...base };
}

/**
 * Brain Score — the number on Home. Composed from independence (inverse of
 * dependency) and practice consistency. Additive framing: it grows with
 * healthy behavior; it is never a punishment meter.
 */
export interface BrainScoreInput {
  dependency: DependencyScoreResult;
  /** Days with challenge activity in the last 7 (0..7). */
  activePracticeDaysLast7: number;
}

export function computeBrainScore(input: BrainScoreInput): number | null {
  if (input.dependency.status !== 'ok' || input.dependency.score === null) return null;
  const independence = 100 - input.dependency.score;
  const consistency = clamp01(input.activePracticeDaysLast7 / 7) * 100;
  return Math.round(0.7 * independence + 0.3 * consistency);
}
