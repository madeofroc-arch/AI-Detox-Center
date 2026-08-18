/**
 * Adaptive difficulty — one gentle step at a time, based on recent outcomes.
 * Never punishing: skips do not lower ability estimates, they just do not
 * raise them.
 */
import type { ChallengeAttempt, Difficulty } from './types';

export interface DifficultyOptions {
  /** How many most-recent attempts to consider. */
  windowSize?: number;
  /** Minimum attempts in window before adapting away from the default. */
  minAttempts?: number;
  raiseThreshold?: number;
  lowerThreshold?: number;
}

export const DEFAULT_DIFFICULTY: Difficulty = 2;

/**
 * Recommend the next difficulty from recent history.
 * - completion rate >= raiseThreshold -> one step up
 * - completion rate <= lowerThreshold (counting only real attempts) -> one step down
 * - otherwise stay at the recent median difficulty.
 */
export function recommendedDifficulty(
  history: readonly ChallengeAttempt[],
  options: DifficultyOptions = {},
): Difficulty {
  const { windowSize = 7, minAttempts = 3, raiseThreshold = 0.8, lowerThreshold = 0.4 } = options;

  const recent = [...history]
    .sort((a, b) => (a.dateKey < b.dateKey ? 1 : -1))
    .slice(0, windowSize)
    .filter((a) => a.status !== 'skipped');

  if (recent.length < minAttempts) return DEFAULT_DIFFICULTY;

  const completions = recent.filter((a) => a.status === 'completed').length;
  const rate = completions / recent.length;

  const difficulties = recent.map((a) => a.difficulty).sort((a, b) => a - b);
  const median = difficulties[Math.floor(difficulties.length / 2)] ?? DEFAULT_DIFFICULTY;

  if (rate >= raiseThreshold) return clampDifficulty(median + 1);
  if (rate <= lowerThreshold) return clampDifficulty(median - 1);
  return clampDifficulty(median);
}

export function clampDifficulty(n: number): Difficulty {
  return Math.min(5, Math.max(1, Math.round(n))) as Difficulty;
}
