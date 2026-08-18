import { describe, expect, it } from 'vitest';
import { computeUsageStats, eventsInWindow, kindOf } from '../src/index';
import { NOW, makeEvent } from './helpers';

describe('eventsInWindow', () => {
  it('includes events inside and at the boundary, excludes older and future', () => {
    const events = [
      makeEvent({ id: 'now', timestamp: NOW }),
      makeEvent({ id: 'edge', timestamp: '2026-08-04T12:00:00.000Z' }), // exactly 14 days
      makeEvent({ id: 'old', timestamp: '2026-08-04T11:59:59.000Z' }),
      makeEvent({ id: 'future', timestamp: '2026-08-19T12:00:00.000Z' }),
    ];
    const result = eventsInWindow(events, NOW, 14).map((e) => e.id);
    expect(result).toEqual(['now', 'edge']);
  });
});

describe('computeUsageStats', () => {
  it('separates AI uses from independent moments', () => {
    const events = [
      makeEvent({ usedAI: true, category: 'direct_delegation' }),
      makeEvent({ usedAI: true, category: 'lookup', attemptedFirst: true }),
      makeEvent({ usedAI: false, attemptedFirst: true }), // solved alone via gate
    ];
    const stats = computeUsageStats(events, 14);
    expect(stats.totalEvents).toBe(3);
    expect(stats.aiUseCount).toBe(2);
    expect(stats.independentCount).toBe(1);
    expect(stats.fractionDelegation).toBe(0.5);
    expect(stats.fractionAttemptedFirst).toBeCloseTo(2 / 3);
  });

  it('returns zero fractions when there are no events (no division by zero)', () => {
    const stats = computeUsageStats([], 14);
    expect(stats.fractionDelegation).toBe(0);
    expect(stats.fractionImmediate).toBe(0);
    expect(stats.aiUsesPerDay).toBe(0);
  });

  it('counts instant_help category as immediate even without the flag', () => {
    const stats = computeUsageStats(
      [makeEvent({ category: 'instant_help', proceededImmediately: false })],
      14,
    );
    expect(stats.fractionImmediate).toBe(1);
  });
});

describe('kindOf', () => {
  it('classifies the taxonomy as documented', () => {
    expect(kindOf('translation')).toBe('deliberate');
    expect(kindOf('review_own_work')).toBe('deliberate');
    expect(kindOf('direct_delegation')).toBe('delegation');
    expect(kindOf('decision_outsourcing')).toBe('delegation');
    expect(kindOf('instant_help')).toBe('immediate');
    expect(kindOf('reassurance_seeking')).toBe('emotional');
  });
});
