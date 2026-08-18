import React, { useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import type { AIUsageCategory, GateSession } from '@ai-detox/core';
import {
  CATEGORY_INFO,
  answerTriedFirst,
  finishAttempt,
  resolveGate,
  setIntention,
  skipAttempt,
  startGate,
} from '@ai-detox/core';
import { AppTextInput } from '../components/AppTextInput';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { Tag } from '../components/Tag';
import { newId } from '../lib/ids';
import { nowIso } from '../lib/clock';
import { useAppStore } from '../state/store';
import { useTheme } from '../theme/useTheme';
import { spacing, type } from '../theme/tokens';

const ATTEMPT_SECONDS = 180;

export default function Gate() {
  const { colors } = useTheme();
  const recordGateSession = useAppStore((s) => s.recordGateSession);

  const [session, setSession] = useState<GateSession>(() => startGate(newId('gate'), nowIso()));
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState<AIUsageCategory>('lookup');
  const [secondsLeft, setSecondsLeft] = useState(ATTEMPT_SECONDS);
  const [timerRunning, setTimerRunning] = useState(false);
  const attemptStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  const attemptElapsed = () =>
    attemptStartRef.current === null
      ? 0
      : Math.round((Date.now() - attemptStartRef.current) / 1000);

  const complete = async (outcome: Parameters<typeof resolveGate>[1], base?: GateSession) => {
    const resolved = resolveGate(base ?? session, outcome, nowIso());
    const eventId = await recordGateSession(resolved);
    router.replace({
      pathname: '/reflection',
      params: { context: 'gate', linkedId: eventId, confirmation: confirmationFor(outcome) },
    });
  };

  return (
    <Screen title="AI Gate" subtitle="A moment of intention before AI.">
      {session.step === 'intention' ? (
        <View style={{ gap: spacing.lg }}>
          <Text style={[type.heading, { color: colors.ink }]}>
            What are you about to ask AI?
          </Text>
          <AppTextInput
            area
            value={question}
            onChangeText={setQuestion}
            placeholder="One line is enough. Stays on this device."
            accessibilityLabel="What are you about to ask AI"
          />
          <Text style={[type.caption, { color: colors.inkMuted }]}>
            What kind of use is it?
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {CATEGORY_INFO.map((info) => (
              <Tag
                key={info.category}
                label={info.label}
                selected={category === info.category}
                onPress={() => setCategory(info.category)}
              />
            ))}
          </View>
          <Button
            label="Continue"
            onPress={() => setSession((s) => setIntention(s, { question, category }))}
          />
        </View>
      ) : null}

      {session.step === 'attempt_check' ? (
        <View style={{ gap: spacing.lg }}>
          <Text style={[type.heading, { color: colors.ink }]}>
            Have you tried it yourself yet?
          </Text>
          <Button
            label="Yes, I tried"
            onPress={() => setSession((s) => answerTriedFirst(s, true))}
          />
          <Button
            label="Not yet"
            variant="secondary"
            onPress={() => setSession((s) => answerTriedFirst(s, false))}
          />
        </View>
      ) : null}

      {session.step === 'attempt' ? (
        <View style={{ gap: spacing.lg }}>
          <Card>
            <View style={{ alignItems: 'center', gap: spacing.md }}>
              <Text style={[type.caption, { color: colors.inkMuted }]}>
                Three minutes with just your own head. Hints and AI will still be there after.
              </Text>
              <Text
                accessibilityLabel={`${Math.floor(secondsLeft / 60)} minutes ${secondsLeft % 60} seconds remaining`}
                style={[type.display, { color: colors.ink, fontVariant: ['tabular-nums'] }]}
              >
                {String(Math.floor(secondsLeft / 60)).padStart(1, '0')}:
                {String(secondsLeft % 60).padStart(2, '0')}
              </Text>
              {!timerRunning ? (
                <Button
                  label="Start 3-minute attempt"
                  onPress={() => {
                    attemptStartRef.current = Date.now();
                    setTimerRunning(true);
                  }}
                />
              ) : (
                <Button
                  label="Done attempting"
                  onPress={() => {
                    setTimerRunning(false);
                    setSession((s) => finishAttempt(s, attemptElapsed()));
                  }}
                />
              )}
            </View>
          </Card>
          <Button
            label="Skip and continue"
            variant="ghost"
            onPress={() => {
              setTimerRunning(false);
              setSession((s) =>
                attemptStartRef.current === null ? skipAttempt(s) : finishAttempt(s, attemptElapsed()),
              );
            }}
          />
        </View>
      ) : null}

      {session.step === 'outcome' ? (
        <View style={{ gap: spacing.md }}>
          <Text style={[type.heading, { color: colors.ink }]}>How did it go?</Text>
          <Button label="Solved it myself" variant="secondary" onPress={() => void complete('solved_myself')} />
          <Button
            label="Got a hint, thinking more"
            variant="secondary"
            onPress={() => void complete('hint_then_thinking')}
          />
          <Button
            label="Proceeding to AI"
            variant="secondary"
            onPress={() => void complete('proceeded_to_ai')}
          />
        </View>
      ) : null}
    </Screen>
  );
}

function confirmationFor(outcome: string): string {
  switch (outcome) {
    case 'solved_myself':
      return 'That was all you. Noted.';
    case 'hint_then_thinking':
      return 'A hint, then your own thinking. Noted.';
    default:
      return 'Noted. Nice pause.';
  }
}
