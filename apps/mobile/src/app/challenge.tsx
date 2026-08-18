import React, { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import type { AttemptStatus } from '@ai-detox/core';
import {
  CHALLENGE_CATALOG,
  localizeChallenge,
  recommendedDifficulty,
  selectDailyChallenge,
  xpForAttempt,
} from '@ai-detox/core';
import { AppTextInput } from '../components/AppTextInput';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { Tag } from '../components/Tag';
import { useI18n } from '../i18n/useI18n';
import { newId } from '../lib/ids';
import { todayKey } from '../lib/clock';
import { useAppStore } from '../state/store';
import { useTheme } from '../theme/useTheme';
import { spacing, type } from '../theme/tokens';

export default function Challenge() {
  const { colors } = useTheme();
  const { t, core } = useI18n();
  const data = useAppStore((s) => s.data);
  const recordChallengeAttempt = useAppStore((s) => s.recordChallengeAttempt);

  const today = todayKey();
  // Selection runs on the canonical catalog and only then swaps the text:
  // the same person must get the same practice on the same day in either
  // language, so nothing language-dependent may reach selectDailyChallenge.
  const challenge = useMemo(
    () =>
      localizeChallenge(
        selectDailyChallenge(today, CHALLENGE_CATALOG, data.challengeHistory, {
          focusCategories: data.settings.focusCategories,
          targetDifficulty: recommendedDifficulty(data.challengeHistory),
        }),
        core,
      ),
    [today, data.challengeHistory, data.settings.focusCategories, core],
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
    <Screen title={t.challenge.title}>
      <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
        <Tag label={core.challengeCategories[challenge.category]} />
        <Text style={[type.caption, { color: colors.inkMuted }]}>
          {t.challenge.difficulty(challenge.difficulty, 5)} ·{' '}
          {t.common.minutesShort(challenge.durationMinutes)}
        </Text>
      </View>
      <Text style={[type.title, { color: colors.ink }]}>{challenge.title}</Text>
      <Text style={[type.body, { color: colors.ink }]}>{challenge.instructions}</Text>
      <Card alt>
        <Text style={[type.micro, { color: colors.inkMuted, textTransform: 'uppercase' }]}>
          {t.challenge.doneMeans}
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
          placeholder={t.challenge.workPlaceholder}
          accessibilityLabel={t.challenge.workA11y}
          style={{ minHeight: 160 }}
        />
      ) : null}

      {!choosing ? (
        <Button label={t.challenge.markOutcome} onPress={() => setChoosing(true)} />
      ) : (
        <View style={{ gap: spacing.md }}>
          <Text style={[type.caption, { color: colors.inkMuted, textAlign: 'center' }]}>
            {t.challenge.honestyNote}
          </Text>
          <Button
            label={t.challenge.completed}
            variant="secondary"
            onPress={() => void mark('completed')}
          />
          <Button
            label={t.challenge.attempted}
            variant="secondary"
            onPress={() => void mark('attempted')}
          />
          <Button
            label={t.challenge.skipped}
            variant="secondary"
            onPress={() => void mark('skipped')}
          />
        </View>
      )}
    </Screen>
  );
}
