import { msBetween } from '../../time';
import type { AIUsageEvent, UsageKind } from './types';
import { kindOf } from './types';

const MS_PER_DAY = 86_400_000;

/** Events whose timestamp falls within the last `windowDays` before `nowIso`. */
export function eventsInWindow(
  events: readonly AIUsageEvent[],
  nowIso: string,
  windowDays: number,
): AIUsageEvent[] {
  const windowMs = windowDays * MS_PER_DAY;
  return events.filter((e) => {
    const age = msBetween(e.timestamp, nowIso);
    return age >= 0 && age <= windowMs;
  });
}

export interface UsageStats {
  /** All recorded events (gate moments + manual logs). */
  totalEvents: number;
  /** Events where AI was actually used. */
  aiUseCount: number;
  /** Independent moments: gate resolved without using AI. */
  independentCount: number;
  aiUsesPerDay: number;
  byKind: Record<UsageKind, number>;
  /** Fractions are over aiUseCount unless noted; 0 when denominator is 0. */
  fractionImmediate: number;
  fractionDelegation: number;
  fractionEmotional: number;
  fractionDeliberate: number;
  fractionNoAttemptBeforeAI: number;
  /** Over ALL events. */
  fractionAttemptedFirst: number;
  fractionWithReflection: number;
}

export function computeUsageStats(
  events: readonly AIUsageEvent[],
  windowDays: number,
): UsageStats {
  const aiUses = events.filter((e) => e.usedAI);
  const byKind: Record<UsageKind, number> = {
    deliberate: 0,
    delegation: 0,
    immediate: 0,
    emotional: 0,
  };
  for (const e of aiUses) byKind[kindOf(e.category)] += 1;

  const total = events.length;
  const nAI = aiUses.length;
  const frac = (n: number, d: number): number => (d === 0 ? 0 : n / d);

  return {
    totalEvents: total,
    aiUseCount: nAI,
    independentCount: total - nAI,
    aiUsesPerDay: windowDays > 0 ? nAI / windowDays : 0,
    byKind,
    fractionImmediate: frac(
      aiUses.filter((e) => e.proceededImmediately || kindOf(e.category) === 'immediate').length,
      nAI,
    ),
    fractionDelegation: frac(byKind.delegation, nAI),
    fractionEmotional: frac(byKind.emotional, nAI),
    fractionDeliberate: frac(byKind.deliberate, nAI),
    fractionNoAttemptBeforeAI: frac(aiUses.filter((e) => !e.attemptedFirst).length, nAI),
    fractionAttemptedFirst: frac(events.filter((e) => e.attemptedFirst).length, total),
    fractionWithReflection: frac(
      events.filter((e) => e.reflectionId !== undefined).length,
      total,
    ),
  };
}
