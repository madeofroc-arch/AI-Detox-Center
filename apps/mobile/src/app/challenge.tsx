import React, { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import type { AttemptStatus } from '@ai-detox/core';
import {
  CATEGORY_LABELS,
  CHALLENGE_CATALOG,
  recommendedDifficulty,
  selectDailyChallenge,
  xpForAttempt,
} from '@ai-detox/core';
import { AppTextInput } from '../components/AppTextInput';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { Tag } from '../components/Tag';
import { newId } from '../lib/ids';
import { todayKey } from '../lib/clock';
import { useAppStore } from '../state/store';
import { useTheme } from '../theme/useTheme';
import { spacing, type } from '../theme/tokens';

export default function Challenge() {
  const { colors } = useTheme();
  const data = useAppStore((s) => s.data);
  const recordChallengeAttempt = useAppStore((s) => s.recordChallengeAttempt);

  const today = todayKey();
  const challenge = useMemo(
    () =>
      selectDailyChallenge(today, CHALLENGE_CATALOG, data.challengeHistory, {
        focusCategories: data.settings.focusCategories,
        targetDifficulty: recommendedDifficulty(data.challengeHistory),
      }),
    [today, data.challengeHistory, data.settings.focusCategories],
  );

  const [workText, setWorkText] = useState('');
  const [choosing, setChoosing] = useState(false);

  const mark = async (status: AttemptStatus) => {
    const attemptId = newId('att');
    await recordChallengeAttempt({
      id: attemptId,
      challengeId: challenge.id,
      dateKey: today,
      status,
      category: challenge.category,
      difficulty: challenge.difficulty,
      workText: workText.trim() === '' ? undefined : workText,
    });
    router.replace({
      pathname: '/challenge-result',
      params: {
        status,
        attemptId,
        xp: String(xpForAttempt(status, challenge.difficulty)),
        category: challenge.category,
      },
    });
  };

  return (
    <Screen title="Today's challenge">
      <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
        <Tag label={CATEGORY_LABELS[challenge.category]} />
        <Text style={[type.caption, { color: colors.inkMuted }]}>
          Difficulty {challenge.difficulty} of 5 · {challenge.durationMinutes} min
        </Text>
      </View>
      <Text style={[type.title, { color: colors.ink }]}>{challenge.title}</Text>
      <Text style={[type.body, { color: colors.ink }]}>{challenge.instructions}</Text>
      <Card alt>
        <Text style={[type.micro, { color: colors.inkMuted, textTransform: 'uppercase' }]}>
          Done means
        </Text>
        <Text style={[type.body, { color: colors.ink, marginTop: spacing.xs }]}>
          {challenge.successCondition}
        </Text>
      </Card>
      {challenge.hasWorkArea ? (
        <AppTextInput
          area
          value={workText}
          onChangeText={setWorkText}
          placeholder="Work here if you like — this text stays on your device."
          accessibilityLabel="Challenge work area"
          style={{ minHeight: 160 }}
        />
      ) : null}

      {!choosing ? (
        <Button label="Mark outcome" onPress={() => setChoosing(true)} />
      ) : (
        <View style={{ gap: spacing.md }}>
          <Text style={[type.caption, { color: colors.inkMuted, textAlign: 'center' }]}>
            Honesty beats streaks. All three are fine answers.
          </Text>
          <Button label="Completed" variant="secondary" onPress={() => void mark('completed')} />
          <Button label="Attempted" variant="secondary" onPress={() => void mark('attempted')} />
          <Button label="Skipped" variant="secondary" onPress={() => void mark('skipped')} />
        </View>
      )}
    </Screen>
  );
}
