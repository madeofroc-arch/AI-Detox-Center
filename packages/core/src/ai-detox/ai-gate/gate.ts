/**
 * AI Gate — a calm pause before reaching for AI, modeled as an explicit
 * finite state machine. The gate NEVER blocks: "proceed to AI" is a valid
 * resolution from every interactive step, by design (no shame, no walls).
 *
 *   intention -> attempt_check -> (attempt) -> outcome -> completed
 */
import type { AIUsageCategory, AIUsageEvent } from '../tracking/types';

export type GateStep = 'intention' | 'attempt_check' | 'attempt' | 'outcome' | 'completed';

export type GateOutcome =
  /** Solved it without AI. */
  | 'solved_myself'
  /** Got a small hint, still thinking. AI touched, brain in charge. */
  | 'hint_then_thinking'
  /** Went ahead and used AI for the task. A valid, recorded choice. */
  | 'proceeded_to_ai';

export interface GateSession {
  id: string;
  startedAt: string;
  step: GateStep;
  /** What the user was about to ask AI (kept local; may be empty). */
  question: string;
  category: AIUsageCategory;
  /** Answer to "have you tried it yourself yet?" */
  triedFirst?: boolean;
  /** Seconds spent in the in-gate attempt timer (0 if skipped). */
  attemptSeconds?: number;
  skippedAttempt?: boolean;
  outcome?: GateOutcome;
  completedAt?: string;
  reflectionId?: string;
}

export class GateTransitionError extends Error {
  constructor(from: GateStep, action: string) {
    super(`Invalid gate transition: cannot ${action} from step "${from}"`);
    this.name = 'GateTransitionError';
  }
}

function assertStep(session: GateSession, expected: GateStep[], action: string): void {
  if (!expected.includes(session.step)) {
    throw new GateTransitionError(session.step, action);
  }
}

/** Begin a gate session. Caller supplies the id and the current time. */
export function startGate(id: string, nowIso: string): GateSession {
  return {
    id,
    startedAt: nowIso,
    step: 'intention',
    question: '',
    category: 'lookup',
  };
}

/** Record what the user intended to ask and how they classify it. */
export function setIntention(
  session: GateSession,
  intention: { question: string; category: AIUsageCategory },
): GateSession {
  assertStep(session, ['intention'], 'set intention');
  return { ...session, ...intention, step: 'attempt_check' };
}

/** Answer "have you tried it yourself yet?". */
export function answerTriedFirst(session: GateSession, tried: boolean): GateSession {
  assertStep(session, ['attempt_check'], 'answer tried-first');
  // Already tried -> straight to outcome; not tried -> offer an attempt.
  return { ...session, triedFirst: tried, step: tried ? 'outcome' : 'attempt' };
}

/** User skips the offered attempt timer. Allowed, never penalized in copy. */
export function skipAttempt(session: GateSession): GateSession {
  assertStep(session, ['attempt'], 'skip attempt');
  return { ...session, skippedAttempt: true, attemptSeconds: 0, step: 'outcome' };
}

/** User finished (or stopped) the attempt timer after `seconds`. */
export function finishAttempt(session: GateSession, seconds: number): GateSession {
  assertStep(session, ['attempt'], 'finish attempt');
  if (seconds < 0 || !Number.isFinite(seconds)) {
    throw new RangeError('attempt seconds must be a non-negative finite number');
  }
  return { ...session, skippedAttempt: false, attemptSeconds: seconds, step: 'outcome' };
}

/** Resolve the gate with an outcome. */
export function resolveGate(
  session: GateSession,
  outcome: GateOutcome,
  nowIso: string,
): GateSession {
  assertStep(session, ['outcome'], 'resolve');
  return { ...session, outcome, completedAt: nowIso, step: 'completed' };
}

/** Attach a reflection to a completed gate. */
export function attachGateReflection(session: GateSession, reflectionId: string): GateSession {
  assertStep(session, ['completed'], 'attach reflection');
  return { ...session, reflectionId };
}

/**
 * Convert a completed gate session into a usage event for the score.
 * A gate resolved without AI still produces an event (usedAI=false) — the
 * independent attempt is precisely what the score should credit.
 */
export function gateToUsageEvent(session: GateSession, eventId: string): AIUsageEvent {
  if (session.step !== 'completed' || session.outcome === undefined) {
    throw new GateTransitionError(session.step, 'convert to usage event');
  }
  const attemptedFirst = session.triedFirst === true || (session.attemptSeconds ?? 0) > 0;
  const usedAI = session.outcome !== 'solved_myself';
  return {
    id: eventId,
    timestamp: session.completedAt ?? session.startedAt,
    category: session.category,
    source: 'gate',
    attemptedFirst,
    usedAI,
    proceededImmediately: usedAI && !attemptedFirst,
    reflectionId: session.reflectionId,
  };
}
