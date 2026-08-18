import React, { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import type { ReflectionContext } from '@ai-detox/core';
import { createReflection, localizePrompt, promptsFor } from '@ai-detox/core';
import { AppTextInput } from '../components/AppTextInput';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { useI18n } from '../i18n/useI18n';
import { newId } from '../lib/ids';
import { nowIso } from '../lib/clock';
import { useAppStore } from '../state/store';
import { useTheme } from '../theme/useTheme';
import { spacing, type } from '../theme/tokens';

export default function Reflection() {
  const { colors } = useTheme();
  const { t, core } = useI18n();
  const params = useLocalSearchParams<{
    context?: string;
    linkedId?: string;
    confirmation?: string;
  }>();
  const addReflection = useAppStore((s) => s.addReflection);

  const context = (params.context ?? 'free') as ReflectionContext;
  const prompts = promptsFor(context, 2).map((p) => localizePrompt(p, core));
  const [answers, setAnswers] = useState<string[]>(prompts.map(() => ''));

  const save = async () => {
    const filled = prompts
      .map((prompt, i) => ({ prompt, text: (answers[i] ?? '').trim() }))
      .filter((a) => a.text !== '');
    for (const { prompt, text } of filled) {
      await addReflection(
        createReflection({
          id: newId('ref'),
          nowIso: nowIso(),
          context,
          text,
          linkedId: params.linkedId,
          promptId: prompt.id,
        }),
      );
    }
    router.dismissTo('/(tabs)/home');
  };

  return (
    <Screen title={t.reflection.title} subtitle={params.confirmation}>
      {prompts.map((prompt, i) => (
        <View key={prompt.id} style={{ gap: spacing.sm }}>
          <Text style={[type.heading, { color: colors.ink }]}>{prompt.question}</Text>
          <AppTextInput
            area
            value={answers[i] ?? ''}
            onChangeText={(text) =>
              setAnswers((prev) => prev.map((a, j) => (j === i ? text : a)))
            }
            placeholder={t.reflection.placeholder}
            accessibilityLabel={prompt.question}
          />
        </View>
      ))}
      <Card alt>
        <Text style={[type.caption, { color: colors.inkMuted }]}>
          {t.reflection.privacyNote}
        </Text>
      </Card>
      <Button label={t.common.save} onPress={() => void save()} />
      <Button
        label={t.common.skip}
        variant="ghost"
        onPress={() => router.dismissTo('/(tabs)/home')}
      />
    </Screen>
  );
}
