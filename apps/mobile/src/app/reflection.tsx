import React, { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import type { ReflectionContext } from '@ai-detox/core';
import { createReflection, promptsFor } from '@ai-detox/core';
import { AppTextInput } from '../components/AppTextInput';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { newId } from '../lib/ids';
import { nowIso } from '../lib/clock';
import { useAppStore } from '../state/store';
import { useTheme } from '../theme/useTheme';
import { spacing, type } from '../theme/tokens';

export default function Reflection() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{
    context?: string;
    linkedId?: string;
    confirmation?: string;
  }>();
  const addReflection = useAppStore((s) => s.addReflection);

  const context = (params.context ?? 'free') as ReflectionContext;
  const prompts = promptsFor(context, 2);
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
    <Screen title="Reflection" subtitle={params.confirmation}>
      {prompts.map((prompt, i) => (
        <View key={prompt.id} style={{ gap: spacing.sm }}>
          <Text style={[type.heading, { color: colors.ink }]}>{prompt.question}</Text>
          <AppTextInput
            area
            value={answers[i] ?? ''}
            onChangeText={(text) =>
              setAnswers((prev) => prev.map((a, j) => (j === i ? text : a)))
            }
            placeholder="A line or two is plenty."
            accessibilityLabel={prompt.question}
          />
        </View>
      ))}
      <Card alt>
        <Text style={[type.caption, { color: colors.inkMuted }]}>
          Reflections never leave your device.
        </Text>
      </Card>
      <Button label="Save" onPress={() => void save()} />
      <Button label="Skip" variant="ghost" onPress={() => router.dismissTo('/(tabs)/home')} />
    </Screen>
  );
}
