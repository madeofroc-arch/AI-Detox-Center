import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import type { ChallengeCategory } from '@ai-detox/core';
import { computeStreak } from '@ai-detox/core';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { useI18n } from '../i18n/useI18n';
import { todayKey } from '../lib/clock';
import { useAppStore } from '../state/store';
import { useTheme } from '../theme/useTheme';
import { spacing, type } from '../theme/tokens';

export default function ChallengeResult() {
  const { colors } = useTheme();
  const { t, core } = useI18n();
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
  const affirmations: Record<string, string> = {
    completed: t.challengeResult.completed,
    attempted: t.challengeResult.attempted,
    skipped: t.challengeResult.skipped,
  };

  return (
    <Screen>
      <Card>
        <Text style={[type.title, { color: colors.ink }]}>
          {affirmations[status] ?? t.challengeResult.completed}
        </Text>
        {xp > 0 ? (
          <Text style={[type.body, { color: colors.inkMuted, marginTop: spacing.md }]}>
            {t.challengeResult.xpLine(xp, core.challengeCategories[category] ?? category)}
          </Text>
        ) : null}
        {streak.totalActiveDays > 0 ? (
          <Text style={[type.caption, { color: colors.inkMuted, marginTop: spacing.sm }]}>
            {streak.current > 1
              ? t.challengeResult.streakWithRun(streak.current, streak.totalActiveDays)
              : t.challengeResult.streakTotalOnly(streak.totalActiveDays)}
          </Text>
        ) : null}
      </Card>
      {status !== 'skipped' && params.attemptId ? (
        <Button
          label={t.common.addReflection}
          variant="ghost"
          onPress={() =>
            router.replace({
              pathname: '/reflection',
              params: { context: 'challenge', linkedId: params.attemptId },
            })
          }
        />
      ) : null}
      <Button label={t.common.done} onPress={() => router.dismissTo('/(tabs)/home')} />
    </Screen>
  );
}
