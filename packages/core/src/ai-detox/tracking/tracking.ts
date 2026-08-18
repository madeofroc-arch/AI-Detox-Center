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

/**
 * Counts of dependent acts in the window. Scoring reads these rather than the
 * fractions below: a count only ever rises when behavior gets worse, whereas a
 * share of AI uses rises when you stop doing something else (ADR-0006).
 */
export interface DependentActCounts {
  /**
   * AI uses reached for with no pause. Counts the `proceededImmediately` FLAG
   * only. Counting the instant_help CATEGORY here too meant that converting
   * such an act into a whole-task delegation — strictly worse — removed it from
   * this axis, so worsening behavior could lower the score (ADR-0006).
   */
  immediacy: number;
  /** Whole tasks or decisions handed to AI. */
  delegation: number;
  /** AI uses with no attempt first. */
  lackOfAttempt: number;
  /** AI uses seeking reassurance. */
  emotionalDependency: number;
}

export interface UsageStats {
  /** All recorded events (gate moments + manual logs). */
  totalEvents: number;
  /** Absolute counts of each dependent behavior — what scoring is built on. */
  counts: DependentActCounts;
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
  /**
   * Moments resolved with no AI at all, over ALL events. This is the only
   * independence signal no contributor factor reads, which is why scoring
   * uses it rather than fractionAttemptedFirst (that one shares its source
   * bit with the lackOfAttempt contributor — see ADR-0005).
   */
  fractionResolvedWithoutAI: number;
  /** Reflections attached to AI uses, over AI USES (not all events). */
  fractionAIUsesWithReflection: number;
  /**
   * Deliberate, tool-like AI uses over ALL moments. Scoring uses this rather
   * than the share of AI uses: sharing a denominator with AI uses meant that
   * turning an independently-resolved moment into a deliberate AI use raised
   * the reducer and LOWERED the score (ADR-0006).
   */
  fractionMomentsDeliberate: number;
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

  const counts: DependentActCounts = {
    immediacy: aiUses.filter((e) => e.proceededImmediately).length,
    delegation: byKind.delegation,
    lackOfAttempt: aiUses.filter((e) => !e.attemptedFirst).length,
    emotionalDependency: byKind.emotional,
  };

  return {
    totalEvents: total,
    counts,
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
    fractionResolvedWithoutAI: frac(total - nAI, total),
    fractionMomentsDeliberate: frac(byKind.deliberate, total),
    fractionAIUsesWithReflection: frac(
      aiUses.filter((e) => e.reflectionId !== undefined).length,
      nAI,
    ),
  };
}
