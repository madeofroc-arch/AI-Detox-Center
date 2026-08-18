import { describe, expect, it } from 'vitest';
import {
  CONTRIBUTOR_FACTORS,
  DEFAULT_SCORING_CONFIG,
  REDUCER_FACTORS,
  computeBrainScore,
  computeDependencyScore,
  bandForScore,
} from '../src/index';
import type { ScoringConfig } from '../src/index';
import { NOW, makeEvent } from './helpers';

const config: ScoringConfig = DEFAULT_SCORING_CONFIG;

describe('computeDependencyScore', () => {
  it('is deterministic: identical inputs produce identical output', () => {
    const events = [
      makeEvent({ id: 'a', category: 'direct_delegation' }),
      makeEvent({ id: 'b', category: 'lookup', attemptedFirst: true }),
      makeEvent({ id: 'c', category: 'reassurance_seeking', proceededImmediately: true }),
      makeEvent({ id: 'd', category: 'instant_help' }),
      makeEvent({ id: 'e', category: 'review_own_work', attemptedFirst: true, reflectionId: 'r1' }),
    ];
    const a = computeDependencyScore(events, config, NOW);
    const b = computeDependencyScore([...events], { ...config, weights: { ...config.weights } }, NOW);
    expect(a).toEqual(b);
  });

  it('reports insufficient data below the minimum event count', () => {
    const events = Array.from({ length: config.minEventsForScore - 1 }, () => makeEvent());
    const result = computeDependencyScore(events, config, NOW);
    expect(result.status).toBe('insufficient_data');
    expect(result.score).toBeNull();
    expect(result.band).toBeNull();
    expect(result.factors).toHaveLength(CONTRIBUTOR_FACTORS.length + REDUCER_FACTORS.length);
  });

  it('scores dependent behavior higher than deliberate behavior', () => {
    const dependent = Array.from({ length: 10 }, (_, i) =>
      makeEvent({
        id: `dep_${i}`,
        category: i % 2 === 0 ? 'direct_delegation' : 'decision_outsourcing',
        attemptedFirst: false,
        proceededImmediately: true,
      }),
    );
    const deliberate = Array.from({ length: 10 }, (_, i) =>
      makeEvent({
        id: `del_${i}`,
        category: i % 2 === 0 ? 'lookup' : 'review_own_work',
        attemptedFirst: true,
        reflectionId: `r${i}`,
      }),
    );
    const depScore = computeDependencyScore(dependent, config, NOW);
    const delScore = computeDependencyScore(deliberate, config, NOW);
    expect(depScore.score).not.toBeNull();
    expect(delScore.score).not.toBeNull();
    expect(depScore.score!).toBeGreaterThan(delScore.score!);
  });

  it('quantity alone does not raise the score when behavior is healthy', () => {
    const few = Array.from({ length: 12 }, (_, i) =>
      makeEvent({ id: `f${i}`, category: 'lookup', attemptedFirst: true, reflectionId: `r${i}` }),
    );
    const many = Array.from({ length: 60 }, (_, i) =>
      makeEvent({ id: `m${i}`, category: 'lookup', attemptedFirst: true, reflectionId: `r${i}` }),
    );
    const fewResult = computeDependencyScore(few, config, NOW);
    const manyResult = computeDependencyScore(many, config, NOW);
    // Band-level invariant, not merely numeric: heavy healthy use must stay in
    // the lowest band. This is the codified form of "quantity is not the
    // failure mode" (docs/product/vision.md).
    expect(manyResult.band).toBe('independent');
    expect(manyResult.score!).toBeLessThanOrEqual(config.bandIndependentMax);
    expect(manyResult.score! - fewResult.score!).toBeLessThanOrEqual(config.weights.frequency);
  });

  it('ignores events outside the scoring window', () => {
    const inWindow = Array.from({ length: 12 }, (_, i) =>
      makeEvent({ id: `in${i}`, timestamp: '2026-08-17T10:00:00.000Z' }),
    );
    const old = Array.from({ length: 20 }, (_, i) =>
      makeEvent({
        id: `old${i}`,
        timestamp: '2025-01-01T10:00:00.000Z',
        category: 'direct_delegation',
      }),
    );
    const withOld = computeDependencyScore([...inWindow, ...old], config, NOW);
    const withoutOld = computeDependencyScore(inWindow, config, NOW);
    expect(withOld.score).toBe(withoutOld.score);
    expect(withOld.eventCount).toBe(12);
  });

  it('respects configured weights (zero weights produce zero score)', () => {
    const zeroConfig: ScoringConfig = {
      ...config,
      weights: {
        frequency: 0,
        immediacy: 0,
        delegation: 0,
        lackOfAttempt: 0,
        emotionalDependency: 0,
        independentAttempt: 0,
      },
    };
    const events = Array.from({ length: 12 }, (_, i) =>
      makeEvent({ id: `z${i}`, category: 'direct_delegation', proceededImmediately: true }),
    );
    // No division by zero, no NaN — a fully zeroed config scores 0.
    expect(computeDependencyScore(events, zeroConfig, NOW).score).toBe(0);
  });

  it('clamps to the 0-100 range', () => {
    const worst = Array.from({ length: 200 }, (_, i) =>
      makeEvent({
        id: `w${i}`,
        category: 'direct_delegation',
        attemptedFirst: false,
        proceededImmediately: true,
      }),
    );
    const result = computeDependencyScore(worst, config, NOW);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.score).toBeGreaterThanOrEqual(0);
  });
});

describe('bandForScore', () => {
  it('maps scores to bands at the documented boundaries', () => {
    expect(bandForScore(0)).toBe('independent');
    expect(bandForScore(25)).toBe('independent');
    expect(bandForScore(26)).toBe('balanced');
    expect(bandForScore(50)).toBe('balanced');
    expect(bandForScore(51)).toBe('leaning');
    expect(bandForScore(75)).toBe('leaning');
    expect(bandForScore(76)).toBe('dependent');
    expect(bandForScore(100)).toBe('dependent');
  });
});

describe('computeBrainScore', () => {
  it('is null without a dependency score', () => {
    const dep = computeDependencyScore([], config, NOW);
    expect(computeBrainScore({ dependency: dep, activePracticeDaysLast7: 3 })).toBeNull();
  });

  it('rewards independence and practice consistency', () => {
    const events = Array.from({ length: 12 }, (_, i) =>
      makeEvent({ id: `b${i}`, category: 'lookup', attemptedFirst: true }),
    );
    const dep = computeDependencyScore(events, config, NOW);
    const low = computeBrainScore({ dependency: dep, activePracticeDaysLast7: 0 })!;
    const high = computeBrainScore({ dependency: dep, activePracticeDaysLast7: 7 })!;
    expect(high).toBeGreaterThan(low);
    expect(high).toBeLessThanOrEqual(100);
  });
});
