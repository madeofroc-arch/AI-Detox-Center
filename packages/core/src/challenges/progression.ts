/**
 * Progression — an additive record of effort, never a compulsion mechanic.
 * XP only grows; nothing decays, nothing is purchasable, nothing is lost.
 * Streaks pause (never "break with punishment"); total active days always
 * count, so no effort is ever erased.
 */
import type { DateKey } from '../time';
import { shiftDateKey } from '../time';
import type { AttemptStatus, ChallengeAttempt, ChallengeCategory, Difficulty } from './types';
import { CHALLENGE_CATEGORIES } from './types';

/** XP for one attempt. Trying earns; skipping simply earns nothing. */
export function xpForAttempt(status: AttemptStatus, difficulty: Difficulty): number {
  switch (status) {
    case 'completed':
      return difficulty * 10;
    case 'attempted':
      return difficulty * 4;
    case 'skipped':
      return 0;
  }
}

export function totalXp(history: readonly ChallengeAttempt[]): number {
  return history.reduce((sum, a) => sum + xpForAttempt(a.status, a.difficulty), 0);
}

/** Cumulative XP required to REACH a level (level 1 = 0). */
export function xpThresholdForLevel(level: number): number {
  return 50 * (level - 1) * level;
}

export function levelForXp(xp: number): number {
  let level = 1;
  while (xpThresholdForLevel(level + 1) <= xp) level += 1;
  return level;
}

export interface StreakInfo {
  /** Length of the run ending today or yesterday (0 if paused/none). */
  current: number;
  longest: number;
  totalActiveDays: number;
  /** paused = there was a run, but not active today/yesterday. */
  state: 'active' | 'paused' | 'none';
}

/** A day counts as active if any non-skipped attempt happened. */
export function computeStreak(
  history: readonly ChallengeAttempt[],
  todayKey: DateKey,
): StreakInfo {
  const activeDays = [
    ...new Set(history.filter((a) => a.status !== 'skipped').map((a) => a.dateKey)),
  ].sort();

  if (activeDays.length === 0) {
    return { current: 0, longest: 0, totalActiveDays: 0, state: 'none' };
  }

  let longest = 1;
  let run = 1;
  for (let i = 1; i < activeDays.length; i++) {
    const prev = activeDays[i - 1] as DateKey;
    const cur = activeDays[i] as DateKey;
    run = shiftDateKey(prev, 1) === cur ? run + 1 : 1;
    if (run > longest) longest = run;
  }

  const lastActive = activeDays[activeDays.length - 1] as DateKey;
  const endsRecently = lastActive === todayKey || shiftDateKey(lastActive, 1) === todayKey;

  return {
    current: endsRecently ? run : 0,
    longest,
    totalActiveDays: activeDays.length,
    state: endsRecently ? 'active' : 'paused',
  };
}

/** Per-category practice counts (for the Progress capability spread). */
export function categorySpread(
  history: readonly ChallengeAttempt[],
): Record<ChallengeCategory, number> {
  const spread = Object.fromEntries(CHALLENGE_CATEGORIES.map((c) => [c, 0])) as Record<
    ChallengeCategory,
    number
  >;
  for (const a of history) {
    if (a.status !== 'skipped') spread[a.category] += 1;
  }
  return spread;
}

/** Days with challenge activity within the last `days` ending at todayKey. */
export function activeDaysInLast(
  history: readonly ChallengeAttempt[],
  todayKey: DateKey,
  days: number,
): number {
  const cutoff = shiftDateKey(todayKey, -(days - 1));
  const activeDays = new Set(
    history
      .filter((a) => a.status !== 'skipped' && a.dateKey >= cutoff && a.dateKey <= todayKey)
      .map((a) => a.dateKey),
  );
  return activeDays.size;
}
