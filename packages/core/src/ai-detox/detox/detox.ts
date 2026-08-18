/**
 * Detox Mode — a focused block of time working without AI.
 * Pure domain model: the UI owns the ticking clock; core owns the rules.
 * Ending early is recorded neutrally — it is data, never defeat.
 */
import { msBetween } from '../../time';

export type DetoxState = 'running' | 'paused' | 'completed' | 'ended_early';

export interface DetoxSession {
  id: string;
  plannedMinutes: number;
  /** What the user intends to do with this time (kept local). */
  intention: string;
  startedAt: string;
  state: DetoxState;
  /** Set while paused. */
  pausedAt?: string;
  /** Accumulated paused time in seconds. */
  pausedTotalSeconds: number;
  endedAt?: string;
  reflectionId?: string;
}

export class DetoxTransitionError extends Error {
  constructor(from: DetoxState, action: string) {
    super(`Invalid detox transition: cannot ${action} from state "${from}"`);
    this.name = 'DetoxTransitionError';
  }
}

export function startDetox(
  id: string,
  plannedMinutes: number,
  intention: string,
  nowIso: string,
): DetoxSession {
  if (plannedMinutes <= 0 || !Number.isFinite(plannedMinutes)) {
    throw new RangeError('plannedMinutes must be a positive finite number');
  }
  return {
    id,
    plannedMinutes,
    intention,
    startedAt: nowIso,
    state: 'running',
    pausedTotalSeconds: 0,
  };
}

export function pauseDetox(session: DetoxSession, nowIso: string): DetoxSession {
  if (session.state !== 'running') throw new DetoxTransitionError(session.state, 'pause');
  return { ...session, state: 'paused', pausedAt: nowIso };
}

export function resumeDetox(session: DetoxSession, nowIso: string): DetoxSession {
  if (session.state !== 'paused' || session.pausedAt === undefined) {
    throw new DetoxTransitionError(session.state, 'resume');
  }
  const pausedSeconds = Math.max(0, msBetween(session.pausedAt, nowIso) / 1000);
  return {
    ...session,
    state: 'running',
    pausedAt: undefined,
    pausedTotalSeconds: session.pausedTotalSeconds + pausedSeconds,
  };
}

function end(session: DetoxSession, state: DetoxState, nowIso: string): DetoxSession {
  // Ending from paused is fine; close the pause first.
  const s = session.state === 'paused' ? resumeDetox(session, nowIso) : session;
  return { ...s, state, endedAt: nowIso };
}

export function completeDetox(session: DetoxSession, nowIso: string): DetoxSession {
  if (session.state !== 'running' && session.state !== 'paused') {
    throw new DetoxTransitionError(session.state, 'complete');
  }
  return end(session, 'completed', nowIso);
}

/** Ending early is a first-class, unpunished outcome. */
export function endDetoxEarly(session: DetoxSession, nowIso: string): DetoxSession {
  if (session.state !== 'running' && session.state !== 'paused') {
    throw new DetoxTransitionError(session.state, 'end early');
  }
  return end(session, 'ended_early', nowIso);
}

export function attachDetoxReflection(session: DetoxSession, reflectionId: string): DetoxSession {
  if (session.state !== 'completed' && session.state !== 'ended_early') {
    throw new DetoxTransitionError(session.state, 'attach reflection');
  }
  return { ...session, reflectionId };
}

/** Focused seconds so far (excludes paused time). */
export function elapsedFocusedSeconds(session: DetoxSession, nowIso: string): number {
  const reference = session.endedAt ?? (session.state === 'paused' ? session.pausedAt : undefined) ?? nowIso;
  const gross = Math.max(0, msBetween(session.startedAt, reference) / 1000);
  return Math.max(0, gross - session.pausedTotalSeconds);
}

export function remainingSeconds(session: DetoxSession, nowIso: string): number {
  return Math.max(0, session.plannedMinutes * 60 - elapsedFocusedSeconds(session, nowIso));
}

export function isTimeUp(session: DetoxSession, nowIso: string): boolean {
  return remainingSeconds(session, nowIso) === 0;
}
