import React, { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import type { DetoxSession } from '@ai-detox/core';
import {
  completeDetox,
  elapsedFocusedSeconds,
  endDetoxEarly,
  isTimeUp,
  pauseDetox,
  remainingSeconds,
  resumeDetox,
  startDetox,
} from '@ai-detox/core';
import { AppTextInput } from '../components/AppTextInput';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { Segmented } from '../components/Segmented';
import { useI18n } from '../i18n/useI18n';
import { newId } from '../lib/ids';
import { nowIso } from '../lib/clock';
import { useAppStore } from '../state/store';
import { useTheme } from '../theme/useTheme';
import { spacing, type } from '../theme/tokens';

const DURATION_MINUTES = [25, 50, 90] as const;

export default function Detox() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const durations = DURATION_MINUTES.map((value) => ({
    value,
    label: t.common.minutesShort(value),
  }));
  const recordDetoxSession = useAppStore((s) => s.recordDetoxSession);

  const [minutes, setMinutes] = useState<number>(25);
  const [intention, setIntentionText] = useState('');
  const [session, setSession] = useState<DetoxSession | null>(null);
  const [ended, setEnded] = useState<DetoxSession | null>(null);
  const [, forceTick] = useState(0);

  // Re-render each second while running so the countdown moves.
  useEffect(() => {
    if (!session || session.state !== 'running') return;
    const interval = setInterval(() => forceTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [session]);

  const finish = async (ender: typeof completeDetox) => {
    if (!session) return;
    const done = ender(session, nowIso());
    await recordDetoxSession(done);
    setSession(null);
    setEnded(done);
  };

  if (ended) {
    const focusedMin = Math.round(elapsedFocusedSeconds(ended, nowIso()) / 60);
    return (
      <Screen title={t.detox.endedTitle}>
        <Card>
          <Text style={[type.heading, { color: colors.ink }]}>
            {ended.state === 'completed'
              ? t.detox.focusedMinutes(focusedMin)
              : t.detox.minutesNoted(focusedMin)}
          </Text>
          <Text style={[type.body, { color: colors.inkMuted, marginTop: spacing.sm }]}>
            {ended.state === 'completed' ? t.detox.completedBody : t.detox.endedEarlyBody}
          </Text>
        </Card>
        <Button
          label={t.common.addReflection}
          variant="ghost"
          onPress={() =>
            router.replace({
              pathname: '/reflection',
              params: { context: 'detox', linkedId: ended.id },
            })
          }
        />
        <Button label={t.common.done} onPress={() => router.back()} />
      </Screen>
    );
  }

  if (!session) {
    return (
      <Screen title={t.detox.title} subtitle={t.detox.subtitle}>
        <Segmented
          accessibilityLabel={t.detox.durationLabel}
          options={durations}
          value={minutes}
          onChange={setMinutes}
        />
        <AppTextInput
          value={intention}
          onChangeText={setIntentionText}
          placeholder={t.detox.intentionPlaceholder}
          accessibilityLabel={t.detox.intentionA11y}
        />
        <Button
          label={t.common.begin}
          onPress={() => setSession(startDetox(newId('detox'), minutes, intention, nowIso()))}
        />
      </Screen>
    );
  }

  const remaining = Math.ceil(remainingSeconds(session, nowIso()));
  const mm = Math.floor(remaining / 60);
  const ss = remaining % 60;
  const timeUp = isTimeUp(session, nowIso());
  // Coarse on purpose. This label used to carry mm:ss on a view that
  // re-renders every second, which is exactly what the accessibility spec
  // says a timer must not announce (#4). Minutes changes it 25 times a
  // session instead of 1,500, and still answers "how long left?".
  const spokenRemaining =
    remaining >= 60 ? t.common.minutesLeft(Math.round(remaining / 60)) : t.common.underAMinuteLeft;
  const status = timeUp
    ? t.detox.statusTimeUp
    : session.state === 'running'
      ? t.detox.statusRunning
      : t.detox.statusPaused;

  return (
    <Screen title={t.detox.title}>
      <Card>
        <View style={{ alignItems: 'center', gap: spacing.lg, paddingVertical: spacing.xxl }}>
          {/* The only thing here that changes at a human pace, so it is the
              only thing announced when it changes. Paused was previously
              legible only as "the digits stopped moving". */}
          <Text
            accessibilityLiveRegion="polite"
            style={[type.micro, { color: colors.inkMuted, textTransform: 'uppercase' }]}
          >
            {status}
          </Text>
          <Text
            accessibilityLabel={spokenRemaining}
            style={[type.display, { color: colors.ink, fontSize: 56, lineHeight: 64, fontVariant: ['tabular-nums'] }]}
          >
            {String(mm).padStart(2, '0')}:{String(ss).padStart(2, '0')}
          </Text>
          {session.intention ? (
            <Text style={[type.body, { color: colors.inkMuted, textAlign: 'center' }]}>
              {session.intention}
            </Text>
          ) : null}
        </View>
      </Card>
      {timeUp ? (
        <Button label={t.detox.completeSession} onPress={() => void finish(completeDetox)} />
      ) : (
        <>
          {session.state === 'running' ? (
            <Button
              label={t.detox.pause}
              variant="ghost"
              onPress={() => setSession(pauseDetox(session, nowIso()))}
            />
          ) : (
            <Button label={t.detox.resume} onPress={() => setSession(resumeDetox(session, nowIso()))} />
          )}
          <Button label={t.detox.endSession} variant="secondary" onPress={() => void finish(endDetoxEarly)} />
        </>
      )}
    </Screen>
  );
}
