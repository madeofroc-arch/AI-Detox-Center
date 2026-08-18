import { describe, expect, it } from 'vitest';
import {
  activeDaysInLast,
  categorySpread,
  computeStreak,
  levelForXp,
  totalXp,
  xpForAttempt,
  xpThresholdForLevel,
} from '../src/index';
import { makeAttempt } from './helpers';

describe('XP', () => {
  it('rewards completion by difficulty and credits honest attempts', () => {
    expect(xpForAttempt('completed', 3)).toBe(30);
    expect(xpForAttempt('attempted', 3)).toBe(12);
    expect(xpForAttempt('skipped', 3)).toBe(0);
  });

  it('totals across history and never goes negative', () => {
    const history = [
      makeAttempt({ status: 'completed', difficulty: 2 }),
      makeAttempt({ status: 'attempted', difficulty: 5 }),
      makeAttempt({ status: 'skipped', difficulty: 5 }),
    ];
    expect(totalXp(history)).toBe(40);
    expect(totalXp([])).toBe(0);
  });
});

describe('levels', () => {
  it('has monotonically increasing thresholds starting at zero', () => {
    expect(xpThresholdForLevel(1)).toBe(0);
    for (let l = 1; l < 10; l++) {
      expect(xpThresholdForLevel(l + 1)).toBeGreaterThan(xpThresholdForLevel(l));
    }
  });

  it('maps XP to levels consistently with thresholds', () => {
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(xpThresholdForLevel(2))).toBe(2);
    expect(levelForXp(xpThresholdForLevel(3) - 1)).toBe(2);
    expect(levelForXp(xpThresholdForLevel(5))).toBe(5);
  });
});

describe('streak', () => {
  it('handles empty history', () => {
    expect(computeStreak([], '2026-08-18')).toEqual({
      current: 0,
      longest: 0,
      totalActiveDays: 0,
      state: 'none',
    });
  });

  it('counts consecutive active days ending today', () => {
    const history = ['2026-08-16', '2026-08-17', '2026-08-18'].map((dateKey) =>
      makeAttempt({ dateKey }),
    );
    const s = computeStreak(history, '2026-08-18');
    expect(s.current).toBe(3);
    expect(s.state).toBe('active');
  });

  it('stays active if the last activity was yesterday (today not over)', () => {
    const history = [makeAttempt({ dateKey: '2026-08-17' })];
    const s = computeStreak(history, '2026-08-18');
    expect(s.current).toBe(1);
    expect(s.state).toBe('active');
  });

  it('pauses (never erases) after a gap: longest and total remain', () => {
    const history = ['2026-08-10', '2026-08-11', '2026-08-12'].map((dateKey) =>
      makeAttempt({ dateKey }),
    );
    const s = computeStreak(history, '2026-08-18');
    expect(s.current).toBe(0);
    expect(s.state).toBe('paused');
    expect(s.longest).toBe(3);
    expect(s.totalActiveDays).toBe(3);
  });

  it('skipped days do not count as active', () => {
    const history = [makeAttempt({ dateKey: '2026-08-18', status: 'skipped' })];
    expect(computeStreak(history, '2026-08-18').state).toBe('none');
  });

  it('multiple attempts on one day count once', () => {
    const history = [
      makeAttempt({ dateKey: '2026-08-18' }),
      makeAttempt({ dateKey: '2026-08-18' }),
    ];
    expect(computeStreak(history, '2026-08-18').totalActiveDays).toBe(1);
  });
});

describe('categorySpread / activeDaysInLast', () => {
  it('counts practice per category, excluding skips', () => {
    const spread = categorySpread([
      makeAttempt({ category: 'writing' }),
      makeAttempt({ category: 'writing' }),
      makeAttempt({ category: 'focus', status: 'skipped' }),
    ]);
    expect(spread.writing).toBe(2);
    expect(spread.focus).toBe(0);
    expect(spread.memory).toBe(0);
  });

  it('counts active days in a trailing window', () => {
    const history = [
      makeAttempt({ dateKey: '2026-08-12' }),
      makeAttempt({ dateKey: '2026-08-18' }),
      makeAttempt({ dateKey: '2026-08-01' }),
    ];
    expect(activeDaysInLast(history, '2026-08-18', 7)).toBe(2);
  });
});
