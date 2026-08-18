import React, { useMemo } from 'react';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import {
  BAND_LABELS,
  CATEGORY_LABELS,
  CHALLENGE_CATALOG,
  activeDaysInLast,
  computeBrainScore,
  computeDependencyScore,
  recommendedDifficulty,
  selectDailyChallenge,
} from '@ai-detox/core';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ScoreDial } from '../../components/ScoreDial';
import { Screen } from '../../components/Screen';
import { Tag } from '../../components/Tag';
import { useAppStore } from '../../state/store';
import { useTheme } from '../../theme/useTheme';
import { nowIso, todayKey } from '../../lib/clock';
import { spacing, type } from '../../theme/tokens';

export default function Home() {
  const { colors } = useTheme();
  const data = useAppStore((s) => s.data);
  const saveError = useAppStore((s) => s.saveError);

  const today = todayKey();
  const dependency = useMemo(
    () => computeDependencyScore(data.events, data.scoringConfig, nowIso()),
    [data.events, data.scoringConfig],
  );
  const brainScore = useMemo(
    () =>
      computeBrainScore({
        dependency,
        activePracticeDaysLast7: activeDaysInLast(data.challengeHistory, today, 7),
      }),
    [dependency, data.challengeHistory, today],
  );
  const challenge = useMemo(
    () =>
      selectDailyChallenge(today, CHALLENGE_CATALOG, data.challengeHistory, {
        focusCategories: data.settings.focusCategories,
        targetDifficulty: recommendedDifficulty(data.challengeHistory),
      }),
    [today, data.challengeHistory, data.settings.focusCategories],
  );
  const doneToday = data.challengeHistory.some((a) => a.dateKey === today);

  // The band alone would read as a verdict on the very first screen. Pair it
  // with the strongest thing the user is already doing (docs/design:
  // "Additive framing only").
  //
  // This must ALWAYS resolve to something. The user with no positive signal yet
  // is exactly the one facing the highest band and the lowest headline, so a
  // reducer-only version of this would leave the bare verdict standing for the
  // people it was written to protect. When there is nothing to credit, the line
  // points at the next concrete step instead.
  const strongestStrength = useMemo(() => {
    const best = dependency.factors
      .filter((f) => f.role === 'reducer' && f.intensity > 0)
      .sort((a, b) => b.intensity - a.intensity)[0];
    if (best) {
      const percent = Math.round(best.intensity * 100);
      switch (best.factor) {
        case 'independentAttempt':
          return `You handled ${percent}% of these moments without AI.`;
        case 'reflection':
          return `You paused to reflect on ${percent}% of your AI uses.`;
        case 'deliberateUsage':
          return `${percent}% of your AI use was deliberate, tool-like work.`;
      }
    }
    const practiceDays = activeDaysInLast(data.challengeHistory, today, 7);
    if (practiceDays > 0) {
      return `You practised on ${practiceDays} of the last 7 days.`;
    }
    return 'One gate where you try first will start moving this.';
  }, [dependency.factors, data.challengeHistory, today]);

  return (
    <Screen title="Human Mode" subtitle="Your thinking, back in your hands." padBottom>
      {saveError ? (
        <Card alt>
          <Text style={[type.caption, { color: colors.ink }]}>
            Saving to this device failed. Recent changes are held in memory — freeing up
            storage space usually resolves this.
          </Text>
        </Card>
      ) : null}

      <Card onPress={() => router.push('/report')} accessibilityLabel="Open Brain Report">
        <ScoreDial
          value={brainScore}
          label="Brain Score"
          caption={
            brainScore === null
              ? 'Your score appears after your first few gates and challenges.'
              : dependency.band
                ? `AI reliance: ${BAND_LABELS[dependency.band]} — tap to see why`
                : 'Tap to see why'
          }
          footnote={brainScore === null ? undefined : strongestStrength}
        />
      </Card>

      <Card>
        <View style={{ gap: spacing.md }}>
          <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
            <Tag label={CATEGORY_LABELS[challenge.category]} />
            <Text style={[type.caption, { color: colors.inkMuted }]}>
              {'◆'.repeat(challenge.difficulty)}
              {'◇'.repeat(5 - challenge.difficulty)} · {challenge.durationMinutes} min
            </Text>
          </View>
          <Text style={[type.heading, { color: colors.ink }]}>{challenge.title}</Text>
          {doneToday ? (
            <Text style={[type.body, { color: colors.inkMuted }]}>
              Today&apos;s practice is in the books. See you tomorrow.
            </Text>
          ) : (
            <Button label="Open today's challenge" onPress={() => router.push('/challenge')} />
          )}
        </View>
      </Card>

      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <Button
          label="AI Gate"
          variant="secondary"
          style={{ flex: 1 }}
          onPress={() => router.push('/gate')}
          accessibilityLabel="Open AI Gate — pause before using AI"
        />
        <Button
          label="Detox"
          variant="secondary"
          style={{ flex: 1 }}
          onPress={() => router.push('/detox')}
          accessibilityLabel="Start a detox focus session"
        />
      </View>
    </Screen>
  );
}
