/**
 * Timeline view model — merges the three kinds of recorded moments into one
 * reverse-chronological list for the Progress screen.
 *
 * Presentation only: it labels and orders records the core engine produced,
 * and computes nothing the domain does not already know. Tone follows
 * docs/design/design-system.md — every line is neutral or additive; a
 * skipped challenge and an early-ended session read as data, never defeat.
 */
import type {
  AppData,
  ChallengeAttempt,
  DetoxSession,
  GateSession,
  AIUsageCategory,
} from '@ai-detox/core';
import { CATEGORY_INFO, CATEGORY_LABELS, elapsedFocusedSeconds } from '@ai-detox/core';

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

const USAGE_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORY_INFO.map((c) => [c.category, c.label]),
);

const CHALLENGE_STATUS_TITLES: Record<string, string> = {
  completed: 'Completed',
  attempted: 'Attempted',
  skipped: 'Skipped',
};

const GATE_OUTCOME_TITLES: Record<string, string> = {
  solved_myself: 'Solved it yourself',
  hint_then_thinking: 'Took a hint, kept thinking',
  proceeded_to_ai: 'Went to AI',
};

function fromChallenge(attempt: ChallengeAttempt): TimelineEntry {
  return {
    id: attempt.id,
    kind: 'challenge',
    glyph: '◆',
    kindLabel: 'Challenge',
    title: `${CHALLENGE_STATUS_TITLES[attempt.status] ?? attempt.status} · ${
      CATEGORY_LABELS[attempt.category]
    }`,
    // No clock time is recorded for challenges; place them at day's end so
    // ordering stays stable rather than pretending to a precision we lack.
    sortKey: `${attempt.dateKey}T23:59:59.999Z`,
    dateKey: attempt.dateKey,
  };
}

function fromGate(session: GateSession): TimelineEntry | null {
  if (session.outcome === undefined) return null; // abandoned mid-flow
  const when = session.completedAt ?? session.startedAt;
  const usage = USAGE_LABELS[session.category as AIUsageCategory] ?? 'AI use';
  return {
    id: session.id,
    kind: 'gate',
    glyph: '◈',
    kindLabel: 'AI Gate',
    title: `${GATE_OUTCOME_TITLES[session.outcome] ?? 'Recorded'} · ${usage}`,
    sortKey: when,
    dateKey: when.slice(0, 10),
  };
}

function fromDetox(session: DetoxSession): TimelineEntry | null {
  if (session.endedAt === undefined) return null; // still running
  const minutes = Math.round(elapsedFocusedSeconds(session, session.endedAt) / 60);
  return {
    id: session.id,
    kind: 'detox',
    glyph: '◉',
    kindLabel: 'Detox',
    title:
      session.state === 'completed'
        ? `${minutes} focused minutes`
        : `${minutes} focused minutes · ended early`,
    sortKey: session.endedAt,
    dateKey: session.endedAt.slice(0, 10),
  };
}

/** Newest first. `limit` keeps the screen calm rather than infinite. */
export function buildTimeline(data: AppData, limit = 20): TimelineEntry[] {
  const entries: TimelineEntry[] = [
    ...data.challengeHistory.map(fromChallenge),
    ...data.gateSessions.map(fromGate).filter((e): e is TimelineEntry => e !== null),
    ...data.detoxSessions.map(fromDetox).filter((e): e is TimelineEntry => e !== null),
  ];
  return entries.sort((a, b) => (a.sortKey < b.sortKey ? 1 : -1)).slice(0, limit);
}

/** Warm relative day label: Today / Yesterday / Mon, 18 Aug. */
export function dayLabel(dateKey: string, todayKey: string): string {
  if (dateKey === todayKey) return 'Today';
  const yesterday = new Date(Date.parse(todayKey) - 86_400_000).toISOString().slice(0, 10);
  if (dateKey === yesterday) return 'Yesterday';
  return new Date(`${dateKey}T00:00:00Z`).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
}
