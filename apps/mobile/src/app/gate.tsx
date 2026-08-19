import React, { useEffect, useMemo, useRef, useState } from 'react';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import type { AIUsageCategory, GateSession } from '@ai-detox/core';
import {
  answerTriedFirst,
  finishAttempt,
  localizeCategoryInfo,
  resolveGate,
  setIntention,
  skipAttempt,
  startGate,
} from '@ai-detox/core';
import { AppTextInput } from '../components/AppTextInput';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { SectionHeading } from '../components/SectionHeading';
import { Tag } from '../components/Tag';
import { useI18n } from '../i18n/useI18n';
import type { AppStrings } from '../i18n/en';
import { newId } from '../lib/ids';
import { nowIso } from '../lib/clock';
import { useAppStore } from '../state/store';
import { useTheme } from '../theme/useTheme';
import { spacing, type } from '../theme/tokens';

const ATTEMPT_SECONDS = 180;

export default function Gate() {
  const { colors } = useTheme();
  const { t, core } = useI18n();
  const recordGateSession = useAppStore((s) => s.recordGateSession);

  const [session, setSession] = useState<GateSession>(() => startGate(newId('gate'), nowIso()));
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState<AIUsageCategory>('lookup');
  const [secondsLeft, setSecondsLeft] = useState(ATTEMPT_SECONDS);
  const [timerRunning, setTimerRunning] = useState(false);
  const attemptStartRef = useRef<number | null>(null);

  const categories = useMemo(() => localizeCategoryInfo(core), [core]);

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
      params: { context: 'gate', linkedId: eventId, confirmation: confirmationFor(outcome, t) },
    });
  };

  return (
    <Screen title={t.gate.title} subtitle={t.gate.subtitle}>
      {session.step === 'intention' ? (
        <View style={{ gap: spacing.lg }}>
          <SectionHeading>{t.gate.askWhat}</SectionHeading>
          <AppTextInput
            area
            value={question}
            onChangeText={setQuestion}
            placeholder={t.gate.askPlaceholder}
            accessibilityLabel={t.gate.askWhat}
          />
          <Text style={[type.caption, { color: colors.inkMuted }]}>{t.gate.kindOfUse}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {categories.map((info) => (
              <Tag
                key={info.category}
                label={info.label}
                selected={category === info.category}
                selectionRole="radio"
                onPress={() => setCategory(info.category)}
              />
            ))}
          </View>
          <Button
            label={t.common.continue}
            onPress={() => setSession((s) => setIntention(s, { question, category }))}
          />
        </View>
      ) : null}

      {session.step === 'attempt_check' ? (
        <View style={{ gap: spacing.lg }}>
          <SectionHeading>{t.gate.triedYet}</SectionHeading>
          <Button
            label={t.gate.yesTried}
            onPress={() => setSession((s) => answerTriedFirst(s, true))}
          />
          <Button
            label={t.gate.notYet}
            variant="secondary"
            onPress={() => setSession((s) => answerTriedFirst(s, false))}
          />
        </View>
      ) : null}

      {session.step === 'attempt' ? (
        <View style={{ gap: spacing.lg }}>
          <Card>
            <View style={{ alignItems: 'center', gap: spacing.md }}>
              <Text style={[type.caption, { color: colors.inkMuted }]}>{t.gate.attemptBlurb}</Text>
              <Text
                // Minutes, not mm:ss: this text re-renders every second, and
                // a label that changes with it is announced every second (#4).
                accessibilityLabel={
                  secondsLeft >= 60
                    ? t.common.minutesLeft(Math.round(secondsLeft / 60))
                    : t.common.underAMinuteLeft
                }
                style={[type.display, { color: colors.ink, fontVariant: ['tabular-nums'] }]}
              >
                {String(Math.floor(secondsLeft / 60)).padStart(1, '0')}:
                {String(secondsLeft % 60).padStart(2, '0')}
              </Text>
              {!timerRunning ? (
                <Button
                  label={t.gate.startAttempt}
                  onPress={() => {
                    attemptStartRef.current = Date.now();
                    setTimerRunning(true);
                  }}
                />
              ) : (
                <Button
                  label={t.gate.doneAttempting}
                  onPress={() => {
                    setTimerRunning(false);
                    setSession((s) => finishAttempt(s, attemptElapsed()));
                  }}
                />
              )}
            </View>
          </Card>
          <Button
            label={t.gate.skipAndContinue}
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
          <SectionHeading>{t.gate.howDidItGo}</SectionHeading>
          <Button
            label={t.gate.solvedMyself}
            variant="secondary"
            onPress={() => void complete('solved_myself')}
          />
          <Button
            label={t.gate.hintThenThinking}
            variant="secondary"
            onPress={() => void complete('hint_then_thinking')}
          />
          <Button
            label={t.gate.proceedingToAI}
            variant="secondary"
            onPress={() => void complete('proceeded_to_ai')}
          />
        </View>
      ) : null}
    </Screen>
  );
}

function confirmationFor(outcome: string, t: AppStrings): string {
  switch (outcome) {
    case 'solved_myself':
      return t.gate.confirmSolved;
    case 'hint_then_thinking':
      return t.gate.confirmHint;
    default:
      return t.gate.confirmProceeded;
  }
}
