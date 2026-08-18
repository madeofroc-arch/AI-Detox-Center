import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import {
  CATEGORY_LABELS,
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
import { buildTimeline, dayLabel } from '../../lib/timeline';
import { nowIso, todayKey } from '../../lib/clock';
import { useAppStore } from '../../state/store';
import { useTheme } from '../../theme/useTheme';
import { spacing, type } from '../../theme/tokens';

export default function Progress() {
  const { colors } = useTheme();
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
  const timeline = useMemo(() => buildTimeline(data), [data]);

  const empty = data.challengeHistory.length === 0 && data.events.length === 0;

  return (
    <Screen title="Progress" subtitle="Everything here only ever adds up." padBottom>
      {empty ? (
        <EmptyState
          heading="Your record starts today"
          message="Do a challenge or visit the AI Gate once, and this page begins to fill."
        />
      ) : (
        <>
          <Card>
            <Text style={[type.micro, { color: colors.inkMuted, textTransform: 'uppercase' }]}>
              This week
            </Text>
            <Text style={[type.heading, { color: colors.ink, marginTop: spacing.xs }]}>
              {weekStats.challengesThisWeek} challenge
              {weekStats.challengesThisWeek === 1 ? '' : 's'} practiced ·{' '}
              {weekStats.attemptsFirst} independent attempt
              {weekStats.attemptsFirst === 1 ? '' : 's'}
            </Text>
          </Card>

          <Card>
            <Text style={[type.micro, { color: colors.inkMuted, textTransform: 'uppercase' }]}>
              Practice
            </Text>
            <Text style={[type.heading, { color: colors.ink, marginTop: spacing.xs }]}>
              Level {level} · {xp} XP
            </Text>
            <View style={{ marginTop: spacing.md }}>
              <ProgressBar
                fraction={(xp - currentThreshold) / Math.max(1, nextThreshold - currentThreshold)}
                label={`Toward level ${level + 1}`}
                valueText={`${xp - currentThreshold} / ${nextThreshold - currentThreshold}`}
              />
            </View>
            <Text style={[type.caption, { color: colors.inkMuted, marginTop: spacing.md }]}>
              {streak.state === 'active' && streak.current > 0
                ? `Active streak: ${streak.current} day${streak.current === 1 ? '' : 's'}`
                : streak.state === 'paused'
                  ? 'Streak paused — it picks back up whenever you do.'
                  : 'Your first active day starts the record.'}
              {streak.totalActiveDays > 0 ? ` · ${streak.totalActiveDays} active days total` : ''}
            </Text>
          </Card>

          <Card>
            <Text
              style={[
                type.micro,
                { color: colors.inkMuted, textTransform: 'uppercase', marginBottom: spacing.md },
              ]}
            >
              Capability spread
            </Text>
            <View style={{ gap: spacing.md }}>
              {CHALLENGE_CATEGORIES.map((c) => (
                <ProgressBar
                  key={c}
                  fraction={spread[c] / maxSpread}
                  label={CATEGORY_LABELS[c]}
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
              History
            </Text>
            {timeline.length === 0 ? (
              <Text style={[type.body, { color: colors.inkMuted }]}>
                Moments you record — challenges, gates, detox sessions — collect here.
              </Text>
            ) : (
              <View style={{ gap: spacing.sm }}>
                {timeline.map((entry) => (
                  <ListItem
                    key={entry.id}
                    glyph={entry.glyph}
                    kindLabel={entry.kindLabel}
                    title={entry.title}
                    meta={dayLabel(entry.dateKey, today)}
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
