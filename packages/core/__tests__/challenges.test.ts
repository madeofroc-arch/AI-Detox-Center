import { describe, expect, it } from 'vitest';
import {
  CHALLENGE_CATALOG,
  CHALLENGE_CATEGORIES,
  DEFAULT_DIFFICULTY,
  recommendedDifficulty,
  selectDailyChallenge,
  selectRandomChallenge,
} from '../src/index';
import type { Difficulty } from '../src/index';
import { makeAttempt } from './helpers';

describe('challenge catalog', () => {
  it('has at least 6 challenges in every category', () => {
    for (const category of CHALLENGE_CATEGORIES) {
      const inCategory = CHALLENGE_CATALOG.filter((c) => c.category === category);
      expect(inCategory.length, category).toBeGreaterThanOrEqual(6);
    }
  });

  it('has 55+ challenges with unique ids and complete schemas', () => {
    expect(CHALLENGE_CATALOG.length).toBeGreaterThanOrEqual(55);
    const ids = new Set(CHALLENGE_CATALOG.map((c) => c.id));
    expect(ids.size).toBe(CHALLENGE_CATALOG.length);
    for (const c of CHALLENGE_CATALOG) {
      expect(c.title.length).toBeGreaterThan(0);
      expect(c.instructions.length).toBeGreaterThan(20);
      expect(c.successCondition.length).toBeGreaterThan(0);
      expect(c.reflectionQuestions.length).toBeGreaterThanOrEqual(2);
      expect(c.durationMinutes).toBeGreaterThan(0);
      expect(c.difficulty).toBeGreaterThanOrEqual(1);
      expect(c.difficulty).toBeLessThanOrEqual(5);
    }
  });

  it('covers difficulty 1-5 inside EVERY category, not merely somewhere', () => {
    // The old version of this test asked whether each difficulty existed
    // anywhere in the catalog, which it always did — while `focus` had nothing
    // above 3 and five other categories were missing their easy end. A user
    // who picks one focus capability lives inside one of these lists, so that
    // is the list the range has to cover (#1).
    for (const category of CHALLENGE_CATEGORIES) {
      const present = new Set(
        CHALLENGE_CATALOG.filter((c) => c.category === category).map((c) => c.difficulty),
      );
      for (const d of [1, 2, 3, 4, 5]) {
        expect(present.has(d as Difficulty), `${category} has no difficulty ${d}`).toBe(true);
      }
    }
  });

  it('has no two challenges wearing the same title', () => {
    // The cheapest catchable form of "duplicating or lightly rewording an
    // existing challenge", which the contribution guidance forbids.
    const titles = CHALLENGE_CATALOG.map((c) => c.title.trim().toLowerCase());
    const duplicated = titles.filter((t, i) => titles.indexOf(t) !== i);
    expect(duplicated).toEqual([]);
  });
});

describe('selectDailyChallenge', () => {
  it('is deterministic for the same date and history', () => {
    const history = [makeAttempt({ challengeId: 'th_steelman', dateKey: '2026-08-16' })];
    const a = selectDailyChallenge('2026-08-18', CHALLENGE_CATALOG, history);
    const b = selectDailyChallenge('2026-08-18', CHALLENGE_CATALOG, [...history]);
    expect(a.id).toBe(b.id);
  });

  it('varies across days', () => {
    const week = Array.from({ length: 7 }, (_, i) =>
      selectDailyChallenge(`2026-08-1${i + 1}`, CHALLENGE_CATALOG, []).id,
    );
    expect(new Set(week).size).toBeGreaterThan(1);
  });

  it('avoids recently attempted challenges when possible', () => {
    const today = selectDailyChallenge('2026-08-18', CHALLENGE_CATALOG, []);
    const history = [makeAttempt({ challengeId: today.id, dateKey: '2026-08-17' })];
    const next = selectDailyChallenge('2026-08-18', CHALLENGE_CATALOG, history);
    expect(next.id).not.toBe(today.id);
  });

  it('prefers focus categories when set', () => {
    const c = selectDailyChallenge('2026-08-18', CHALLENGE_CATALOG, [], {
      focusCategories: ['writing'],
    });
    expect(c.category).toBe('writing');
  });

  it('respects target difficulty within one step', () => {
    const c = selectDailyChallenge('2026-08-18', CHALLENGE_CATALOG, [], {
      targetDifficulty: 5,
    });
    expect(c.difficulty).toBeGreaterThanOrEqual(4);
  });

  it('relaxes constraints instead of failing when the pool empties', () => {
    // Focus on a category whose 3 challenges were all just attempted.
    const focus = CHALLENGE_CATALOG.filter((c) => c.category === 'memory');
    const history = focus.map((c, i) =>
      makeAttempt({ challengeId: c.id, dateKey: `2026-08-1${i + 5}` }),
    );
    const picked = selectDailyChallenge('2026-08-18', CHALLENGE_CATALOG, history, {
      focusCategories: ['memory'],
      avoidRecentCount: 7,
    });
    expect(picked).toBeDefined(); // fell back to the wider pool
  });

  it('throws on an empty catalog', () => {
    expect(() => selectDailyChallenge('2026-08-18', [], [])).toThrow();
  });
});

describe('selectRandomChallenge', () => {
  it('is pure: same seed, same pick', () => {
    const a = selectRandomChallenge('seed-1', CHALLENGE_CATALOG);
    const b = selectRandomChallenge('seed-1', CHALLENGE_CATALOG);
    expect(a.id).toBe(b.id);
  });

  it('can exclude the current challenge', () => {
    const current = selectRandomChallenge('s', CHALLENGE_CATALOG);
    const next = selectRandomChallenge('s', CHALLENGE_CATALOG, current.id);
    expect(next.id).not.toBe(current.id);
  });
});

describe('recommendedDifficulty', () => {
  it('returns the default with little history', () => {
    expect(recommendedDifficulty([])).toBe(DEFAULT_DIFFICULTY);
    expect(recommendedDifficulty([makeAttempt()])).toBe(DEFAULT_DIFFICULTY);
  });

  it('steps up after consistent completion', () => {
    const history = Array.from({ length: 5 }, (_, i) =>
      makeAttempt({ status: 'completed', difficulty: 2, dateKey: `2026-08-1${i + 1}` }),
    );
    expect(recommendedDifficulty(history)).toBe(3);
  });

  it('steps down gently after a hard stretch', () => {
    const history = Array.from({ length: 5 }, (_, i) =>
      makeAttempt({ status: 'attempted', difficulty: 3, dateKey: `2026-08-1${i + 1}` }),
    );
    expect(recommendedDifficulty(history)).toBe(2);
  });

  it('ignores skips (they never lower the estimate)', () => {
    const history = [
      ...Array.from({ length: 4 }, (_, i) =>
        makeAttempt({ status: 'completed', difficulty: 3, dateKey: `2026-08-1${i + 1}` }),
      ),
      ...Array.from({ length: 3 }, (_, i) =>
        makeAttempt({ status: 'skipped', difficulty: 3, dateKey: `2026-08-1${i + 5}` }),
      ),
    ];
    expect(recommendedDifficulty(history)).toBe(4);
  });

  it('clamps to the 1-5 range', () => {
    const high = Array.from({ length: 5 }, (_, i) =>
      makeAttempt({ status: 'completed', difficulty: 5, dateKey: `2026-08-1${i + 1}` }),
    );
    expect(recommendedDifficulty(high)).toBe(5);
    const low = Array.from({ length: 5 }, (_, i) =>
      makeAttempt({ status: 'attempted', difficulty: 1, dateKey: `2026-08-1${i + 1}` }),
    );
    expect(recommendedDifficulty(low)).toBe(1);
  });
});
