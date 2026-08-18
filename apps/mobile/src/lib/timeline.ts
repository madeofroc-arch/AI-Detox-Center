/**
 * Timeline view model — merges the three kinds of recorded moments into one
 * reverse-chronological list for the Progress screen.
 *
 * Presentation only: it labels and orders records the core engine produced,
 * and computes nothing the domain does not already know. Tone follows
 * docs/design/design-system.md — every line is neutral or additive; a
 * skipped challenge and an early-ended session read as data, never defeat.
 *
 * Strings arrive as arguments rather than being imported: this file is
 * language-agnostic, which is also what keeps it testable.
 */
import type {
  AppData,
  ChallengeAttempt,
  CoreStrings,
  DetoxSession,
  GateSession,
  AIUsageCategory,
} from '@ai-detox/core';
import { elapsedFocusedSeconds, usageCategoryLabel } from '@ai-detox/core';
import type { AppStrings } from '../i18n/en';

export type TimelineKind = 'challenge' | 'gate' | 'detox';

export interface TimelineEntry {
  id: string;
  kind: TimelineKind;
  glyph: string;
  kindLabel: string;
  title: string;
  /** Sortable ISO-ish timestamp; challenges land at end of their day. */
  sortKey: string;
  dateKey: string;
}

function challengeStatusTitle(status: string, t: AppStrings): string {
  switch (status) {
    case 'completed':
      return t.timeline.statusCompleted;
    case 'attempted':
      return t.timeline.statusAttempted;
    case 'skipped':
      return t.timeline.statusSkipped;
    default:
      return status;
  }
}

function gateOutcomeTitle(outcome: string, t: AppStrings): string {
  switch (outcome) {
    case 'solved_myself':
      return t.timeline.gateSolved;
    case 'hint_then_thinking':
      return t.timeline.gateHint;
    case 'proceeded_to_ai':
      return t.timeline.gateProceeded;
    default:
      return t.timeline.gateRecorded;
  }
}

function fromChallenge(attempt: ChallengeAttempt, t: AppStrings, core: CoreStrings): TimelineEntry {
  return {
    id: attempt.id,
    kind: 'challenge',
    glyph: '◆',
    kindLabel: t.timeline.challenge,
    title: `${challengeStatusTitle(attempt.status, t)} · ${
      core.challengeCategories[attempt.category] ?? attempt.category
    }`,
    // No clock time is recorded for challenges; place them at day's end so
    // ordering stays stable rather than pretending to a precision we lack.
    sortKey: `${attempt.dateKey}T23:59:59.999Z`,
    dateKey: attempt.dateKey,
  };
}

function fromGate(
  session: GateSession,
  t: AppStrings,
  core: CoreStrings,
): TimelineEntry | null {
  if (session.outcome === undefined) return null; // abandoned mid-flow
  const when = session.completedAt ?? session.startedAt;
  const usage = session.category
    ? usageCategoryLabel(session.category as AIUsageCategory, core)
    : t.timeline.aiUse;
  return {
    id: session.id,
    kind: 'gate',
    glyph: '◈',
    kindLabel: t.timeline.aiGate,
    title: `${gateOutcomeTitle(session.outcome, t)} · ${usage}`,
    sortKey: when,
    dateKey: when.slice(0, 10),
  };
}

function fromDetox(session: DetoxSession, t: AppStrings): TimelineEntry | null {
  if (session.endedAt === undefined) return null; // still running
  const minutes = Math.round(elapsedFocusedSeconds(session, session.endedAt) / 60);
  return {
    id: session.id,
    kind: 'detox',
    glyph: '◉',
    kindLabel: t.timeline.detox,
    title:
      session.state === 'completed'
        ? t.timeline.focusedMinutes(minutes)
        : t.timeline.focusedMinutesEarly(minutes),
    sortKey: session.endedAt,
    dateKey: session.endedAt.slice(0, 10),
  };
}

/** Newest first. `limit` keeps the screen calm rather than infinite. */
export function buildTimeline(
  data: AppData,
  t: AppStrings,
  core: CoreStrings,
  limit = 20,
): TimelineEntry[] {
  const entries: TimelineEntry[] = [
    ...data.challengeHistory.map((a) => fromChallenge(a, t, core)),
    ...data.gateSessions
      .map((s) => fromGate(s, t, core))
      .filter((e): e is TimelineEntry => e !== null),
    ...data.detoxSessions
      .map((s) => fromDetox(s, t))
      .filter((e): e is TimelineEntry => e !== null),
  ];
  return entries.sort((a, b) => (a.sortKey < b.sortKey ? 1 : -1)).slice(0, limit);
}

/** Warm relative day label: Today / Yesterday / Mon, 18 Aug (in the app's language). */
export function dayLabel(
  dateKey: string,
  todayKey: string,
  t: AppStrings,
  locale: string,
): string {
  if (dateKey === todayKey) return t.timeline.today;
  const yesterday = new Date(Date.parse(todayKey) - 86_400_000).toISOString().slice(0, 10);
  if (dateKey === yesterday) return t.timeline.yesterday;
  return new Date(`${dateKey}T00:00:00Z`).toLocaleDateString(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
}
