/**
 * Challenge selection — deterministic by design: the same date, catalog,
 * history, and options always produce the same challenge (ADR-0004).
 */
import type { DateKey } from '../time';
import type { Challenge, ChallengeAttempt, ChallengeCategory, Difficulty } from './types';

/** Small deterministic string hash (FNV-1a, 32-bit). */
export function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export interface SelectionOptions {
  /** Preferred capability focus (from Settings); may be empty. */
  focusCategories?: readonly ChallengeCategory[];
  /** Target difficulty (from adaptive difficulty); challenges within +-1 qualify. */
  targetDifficulty?: Difficulty;
  /** How many recent challenge ids to avoid repeating. */
  avoidRecentCount?: number;
}

/**
 * Pick the daily challenge for a date. Filtering narrows the pool
 * (difficulty fit, recency, focus); the date hash picks within the pool.
 */
export function selectDailyChallenge(
  dateKey: DateKey,
  catalog: readonly Challenge[],
  history: readonly ChallengeAttempt[],
  options: SelectionOptions = {},
): Challenge {
  if (catalog.length === 0) {
    throw new Error('Challenge catalog is empty');
  }
  const { focusCategories = [], targetDifficulty, avoidRecentCount = 7 } = options;

  const recentIds = new Set(
    [...history]
      .sort((a, b) => (a.dateKey < b.dateKey ? 1 : -1))
      .slice(0, avoidRecentCount)
      .map((a) => a.challengeId),
  );

  // Progressive relaxation: drop constraints until the pool is non-empty.
  const constraintSets: Array<(c: Challenge) => boolean> = [
    (c) =>
      !recentIds.has(c.id) &&
      fitsDifficulty(c, targetDifficulty) &&
      (focusCategories.length === 0 || focusCategories.includes(c.category)),
    (c) => !recentIds.has(c.id) && fitsDifficulty(c, targetDifficulty),
    (c) => !recentIds.has(c.id),
    () => true,
  ];

  let pool: Challenge[] = [];
  for (const fits of constraintSets) {
    pool = catalog.filter(fits);
    if (pool.length > 0) break;
  }

  const index = hashString(`daily:${dateKey}`) % pool.length;
  // Sort by id so pool order (and thus the pick) is stable across catalog
  // reorderings.
  const sorted = [...pool].sort((a, b) => (a.id < b.id ? -1 : 1));
  return sorted[index] as Challenge;
}

function fitsDifficulty(challenge: Challenge, target?: Difficulty): boolean {
  if (target === undefined) return true;
  return Math.abs(challenge.difficulty - target) <= 1;
}

/** Pick a random challenge; caller supplies the seed (core stays pure). */
export function selectRandomChallenge(
  seed: string,
  catalog: readonly Challenge[],
  exceptId?: string,
): Challenge {
  const pool = catalog.filter((c) => c.id !== exceptId);
  const usable = pool.length > 0 ? pool : [...catalog];
  if (usable.length === 0) throw new Error('Challenge catalog is empty');
  const sorted = [...usable].sort((a, b) => (a.id < b.id ? -1 : 1));
  return sorted[hashString(`random:${seed}`) % sorted.length] as Challenge;
}
