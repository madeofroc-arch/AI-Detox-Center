import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import {
  CHALLENGE_CATEGORIES,
  categorySpread,
  computeStreak,
  computeUsageStats,
  eventsInWindow,
  levelForXp,
  totalXp,
  xpThresholdForLevel,
} from '@ai-detox/core';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { ListItem } from '../../components/ListItem';
import { ProgressBar } from '../../components/ProgressBar';
import { Screen } from '../../components/Screen';
import { useI18n } from '../../i18n/useI18n';
import { buildTimeline, dayLabel } from '../../lib/timeline';
import { nowIso, todayKey } from '../../lib/clock';
import { useAppStore } from '../../state/store';
import { useTheme } from '../../theme/useTheme';
import { spacing, type } from '../../theme/tokens';

export default function Progress() {
  const { colors } = useTheme();
  const { t, core, locale } = useI18n();
  const data = useAppStore((s) => s.data);
  const today = todayKey();

  const weekStats = useMemo(() => {
    const weekEvents = eventsInWindow(data.events, nowIso(), 7);
    const stats = computeUsageStats(weekEvents, 7);
    const challengesThisWeek = data.challengeHistory.filter(
      (a) => a.status !== 'skipped' && a.dateKey > shift(today, -7),
    ).length;
    const attemptsFirst = weekEvents.filter((e) => e.attemptedFirst).length;
    return { stats, challengesThisWeek, attemptsFirst };
  }, [data.events, data.challengeHistory, today]);

  const streak = computeStreak(data.challengeHistory, today);
  const xp = totalXp(data.challengeHistory);
  const level = levelForXp(xp);
  const nextThreshold = xpThresholdForLevel(level + 1);
  const currentThreshold = xpThresholdForLevel(level);
  const spread = categorySpread(data.challengeHistory);
  const maxSpread = Math.max(1, ...Object.values(spread));
  const timeline = useMemo(() => buildTimeline(data, t, core), [data, t, core]);

  const empty = data.challengeHistory.length === 0 && data.events.length === 0;

  return (
    <Screen title={t.progress.title} subtitle={t.progress.subtitle} padBottom>
      {empty ? (
        <EmptyState heading={t.progress.emptyHeading} message={t.progress.emptyMessage} />
      ) : (
        <>
          <Card>
            <Text style={[type.micro, { color: colors.inkMuted, textTransform: 'uppercase' }]}>
              {t.progress.thisWeek}
            </Text>
            <Text style={[type.heading, { color: colors.ink, marginTop: spacing.xs }]}>
              {t.progress.weekSummary(weekStats.challengesThisWeek, weekStats.attemptsFirst)}
            </Text>
          </Card>

          <Card>
            <Text style={[type.micro, { color: colors.inkMuted, textTransform: 'uppercase' }]}>
              {t.progress.practice}
            </Text>
            <Text style={[type.heading, { color: colors.ink, marginTop: spacing.xs }]}>
              {t.progress.levelAndXp(level, xp)}
            </Text>
            <View style={{ marginTop: spacing.md }}>
              <ProgressBar
                fraction={(xp - currentThreshold) / Math.max(1, nextThreshold - currentThreshold)}
                label={t.progress.towardLevel(level + 1)}
                valueText={`${xp - currentThreshold} / ${nextThreshold - currentThreshold}`}
              />
            </View>
            <Text style={[type.caption, { color: colors.inkMuted, marginTop: spacing.md }]}>
              {streak.state === 'active' && streak.current > 0
                ? t.progress.streakActive(streak.current)
                : streak.state === 'paused'
                  ? t.progress.streakPaused
                  : t.progress.streakNone}
              {streak.totalActiveDays > 0
                ? t.progress.activeDaysTotal(streak.totalActiveDays)
                : ''}
            </Text>
          </Card>

          <Card>
            <Text
              style={[
                type.micro,
                { color: colors.inkMuted, textTransform: 'uppercase', marginBottom: spacing.md },
              ]}
            >
              {t.progress.capabilitySpread}
            </Text>
            <View style={{ gap: spacing.md }}>
              {CHALLENGE_CATEGORIES.map((c) => (
                <ProgressBar
                  key={c}
                  fraction={spread[c] / maxSpread}
                  label={core.challengeCategories[c]}
                  valueText={String(spread[c])}
                />
              ))}
            </View>
          </Card>

          <Card>
            <Text
              style={[
                type.micro,
                { color: colors.inkMuted, textTransform: 'uppercase', marginBottom: spacing.md },
              ]}
            >
              {t.progress.history}
            </Text>
            {timeline.length === 0 ? (
              <Text style={[type.body, { color: colors.inkMuted }]}>
                {t.progress.historyEmpty}
              </Text>
            ) : (
              <View style={{ gap: spacing.sm }}>
                {timeline.map((entry) => (
                  <ListItem
                    key={entry.id}
                    glyph={entry.glyph}
                    kindLabel={entry.kindLabel}
                    title={entry.title}
                    meta={dayLabel(entry.dateKey, today, t, locale)}
                  />
                ))}
              </View>
            )}
          </Card>
        </>
      )}
    </Screen>
  );
}

function shift(dateKey: string, days: number): string {
  return new Date(Date.parse(dateKey) + days * 86_400_000).toISOString().slice(0, 10);
}
