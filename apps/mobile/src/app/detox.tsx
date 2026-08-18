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
import { newId } from '../lib/ids';
import { nowIso } from '../lib/clock';
import { useAppStore } from '../state/store';
import { useTheme } from '../theme/useTheme';
import { spacing, type } from '../theme/tokens';

const DURATIONS = [
  { value: 25, label: '25 min' },
  { value: 50, label: '50 min' },
  { value: 90, label: '90 min' },
] as const;

export default function Detox() {
  const { colors } = useTheme();
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
      <Screen title="Session ended">
        <Card>
          <Text style={[type.heading, { color: colors.ink }]}>
            {ended.state === 'completed'
              ? `${focusedMin} focused minutes.`
              : `${focusedMin} minutes — noted.`}
          </Text>
          <Text style={[type.body, { color: colors.inkMuted, marginTop: spacing.sm }]}>
            {ended.state === 'completed'
              ? 'A full block of your own thinking.'
              : 'Ending early is data, not defeat. Every minute counted.'}
          </Text>
        </Card>
        <Button
          label="Add a reflection"
          variant="ghost"
          onPress={() =>
            router.replace({
              pathname: '/reflection',
              params: { context: 'detox', linkedId: ended.id },
            })
          }
        />
        <Button label="Done" onPress={() => router.back()} />
      </Screen>
    );
  }

  if (!session) {
    return (
      <Screen title="Detox" subtitle="A block of time for just you and the work.">
        <Segmented
          accessibilityLabel="Session duration"
          options={DURATIONS}
          value={minutes}
          onChange={setMinutes}
        />
        <AppTextInput
          value={intention}
          onChangeText={setIntentionText}
          placeholder="What will you do with this time?"
          accessibilityLabel="Session intention"
        />
        <Button
          label="Begin"
          onPress={() => setSession(startDetox(newId('detox'), minutes, intention, nowIso()))}
        />
      </Screen>
    );
  }

  const remaining = Math.ceil(remainingSeconds(session, nowIso()));
  const mm = Math.floor(remaining / 60);
  const ss = remaining % 60;
  const timeUp = isTimeUp(session, nowIso());

  return (
    <Screen title="Detox">
      <Card>
        <View style={{ alignItems: 'center', gap: spacing.lg, paddingVertical: spacing.xxl }}>
          <Text
            accessibilityLabel={`${mm} minutes ${ss} seconds remaining`}
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
        <Button label="Complete session" onPress={() => void finish(completeDetox)} />
      ) : (
        <>
          {session.state === 'running' ? (
            <Button
              label="Pause"
              variant="ghost"
              onPress={() => setSession(pauseDetox(session, nowIso()))}
            />
          ) : (
            <Button label="Resume" onPress={() => setSession(resumeDetox(session, nowIso()))} />
          )}
          <Button label="End session" variant="secondary" onPress={() => void finish(endDetoxEarly)} />
        </>
      )}
    </Screen>
  );
}
