import type { AIUsageEvent, AIUsageCategory } from '../src/index';
import type { ChallengeAttempt, ChallengeCategory, Difficulty, AttemptStatus } from '../src/index';

export const NOW = '2026-08-18T12:00:00.000Z';

let counter = 0;

export function makeEvent(overrides: Partial<AIUsageEvent> = {}): AIUsageEvent {
  counter += 1;
  return {
    id: `evt_${counter}`,
    timestamp: '2026-08-17T10:00:00.000Z',
    category: 'lookup' as AIUsageCategory,
    source: 'gate',
    attemptedFirst: false,
    usedAI: true,
    proceededImmediately: false,
    ...overrides,
  };
}

export function makeAttempt(overrides: Partial<ChallengeAttempt> = {}): ChallengeAttempt {
  counter += 1;
  return {
    id: `att_${counter}`,
    challengeId: 'cr_twenty_uses',
    dateKey: '2026-08-17',
    status: 'completed' as AttemptStatus,
    category: 'creativity' as ChallengeCategory,
    difficulty: 2 as Difficulty,
    ...overrides,
  };
}
