/**
 * Human Challenge system — retrains human capabilities through practice.
 * Progression records growth; it must never become a compulsion loop
 * (see the human-challenge-engine skill's anti-addiction rules).
 */
import type { DateKey } from '../time';

export const CHALLENGE_CATEGORIES = [
  'thinking',
  'creativity',
  'writing',
  'memory',
  'decision_making',
  'problem_solving',
  'communication',
  'learning',
  'focus',
] as const;

export type ChallengeCategory = (typeof CHALLENGE_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<ChallengeCategory, string> = {
  thinking: 'Thinking',
  creativity: 'Creativity',
  writing: 'Writing',
  memory: 'Memory',
  decision_making: 'Decision Making',
  problem_solving: 'Problem Solving',
  communication: 'Communication',
  learning: 'Learning',
  focus: 'Focus',
};

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export interface Challenge {
  id: string;
  category: ChallengeCategory;
  difficulty: Difficulty;
  durationMinutes: number;
  title: string;
  instructions: string;
  successCondition: string;
  reflectionQuestions: string[];
  /** Show an in-app text work area (writing-type challenges). */
  hasWorkArea?: boolean;
}

export type AttemptStatus = 'completed' | 'attempted' | 'skipped';

export interface ChallengeAttempt {
  id: string;
  challengeId: string;
  /** Local calendar day of the attempt. */
  dateKey: DateKey;
  status: AttemptStatus;
  /** Snapshots so history survives catalog changes. */
  category: ChallengeCategory;
  difficulty: Difficulty;
  /** Optional local-only work text (writing challenges). */
  workText?: string;
  reflectionId?: string;
}
