import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import type { ChallengeCategory } from '@ai-detox/core';
import { CATEGORY_LABELS, computeStreak } from '@ai-detox/core';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { todayKey } from '../lib/clock';
import { useAppStore } from '../state/store';
import { useTheme } from '../theme/useTheme';
import { spacing, type } from '../theme/tokens';

const AFFIRMATIONS: Record<string, string> = {
  completed: 'Good thinking. That was all you.',
  attempted: 'You showed up and tried. That counts.',
  skipped: 'Skipped today. Tomorrow brings a new one.',
};

export default function ChallengeResult() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{
    status?: string;
    attemptId?: string;
    xp?: string;
    category?: string;
  }>();
  const history = useAppStore((s) => s.data.challengeHistory);

  const status = params.status ?? 'completed';
  const xp = Number(params.xp ?? 0);
  const category = (params.category ?? 'thinking') as ChallengeCategory;
  const streak = computeStreak(history, todayKey());

  return (
    <Screen>
      <Card>
        <Text style={[type.title, { color: colors.ink }]}>
          {AFFIRMATIONS[status] ?? AFFIRMATIONS.completed}
        </Text>
        {xp > 0 ? (
          <Text style={[type.body, { color: colors.inkMuted, marginTop: spacing.md }]}>
            +{xp} XP · {CATEGORY_LABELS[category]}
          </Text>
        ) : null}
        {streak.totalActiveDays > 0 ? (
          <Text style={[type.caption, { color: colors.inkMuted, marginTop: spacing.sm }]}>
            {streak.current > 1
              ? `${streak.current} days in a row · ${streak.totalActiveDays} active days total`
              : `${streak.totalActiveDays} active days total`}
          </Text>
        ) : null}
      </Card>
      {status !== 'skipped' && params.attemptId ? (
        <Button
          label="Add a reflection"
          variant="ghost"
          onPress={() =>
            router.replace({
              pathname: '/reflection',
              params: { context: 'challenge', linkedId: params.attemptId },
            })
          }
        />
      ) : null}
      <Button label="Done" onPress={() => router.dismissTo('/(tabs)/home')} />
    </Screen>
  );
}
