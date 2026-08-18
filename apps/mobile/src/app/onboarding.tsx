import React, { useState } from 'react';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import type { ChallengeCategory } from '@ai-detox/core';
import { CATEGORY_LABELS, CHALLENGE_CATEGORIES } from '@ai-detox/core';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { Tag } from '../components/Tag';
import { useAppStore } from '../state/store';
import { useTheme } from '../theme/useTheme';
import { spacing, type } from '../theme/tokens';

const PANELS = [
  {
    title: 'Not anti-AI',
    body: 'Human Mode is not anti-AI. It helps you use AI on purpose — as a tool that extends your thinking instead of replacing it.',
  },
  {
    title: 'Behavior, not screen time',
    body: 'Dependency is behavior, not screen time. We look at how you use AI — did you try first, who made the decision — never just how much.',
  },
  {
    title: 'Yours alone',
    body: 'Your thinking data stays on your device. No account. No cloud. You can export or erase everything at any time.',
  },
] as const;

export default function Onboarding() {
  const { colors } = useTheme();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const [panel, setPanel] = useState(0);
  const [picking, setPicking] = useState(false);
  const [focus, setFocus] = useState<ChallengeCategory[]>([]);

  const finish = async (categories: ChallengeCategory[]) => {
    await completeOnboarding(categories);
    router.replace('/(tabs)/home');
  };

  if (picking) {
    return (
      <Screen
        title="Where do you want to grow?"
        subtitle="Pick up to three capabilities to focus on. You can change this anytime."
      >
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {CHALLENGE_CATEGORIES.map((c) => (
            <Tag
              key={c}
              label={CATEGORY_LABELS[c]}
              selected={focus.includes(c)}
              onPress={() =>
                setFocus((prev) =>
                  prev.includes(c)
                    ? prev.filter((x) => x !== c)
                    : prev.length < 3
                      ? [...prev, c]
                      : prev,
                )
              }
            />
          ))}
        </View>
        <Button label="Begin" onPress={() => void finish(focus)} />
        <Button label="Skip for now" variant="ghost" onPress={() => void finish([])} />
      </Screen>
    );
  }

  const current = PANELS[panel] ?? PANELS[0];
  const isLast = panel === PANELS.length - 1;

  return (
    <Screen>
      <View style={{ minHeight: 320, justifyContent: 'center', gap: spacing.lg }}>
        <Text style={[type.micro, { color: colors.inkMuted, textTransform: 'uppercase' }]}>
          {`${panel + 1} / ${PANELS.length}`}
        </Text>
        <Text style={[type.title, { color: colors.ink }]}>{current.title}</Text>
        <Card>
          <Text style={[type.body, { color: colors.ink }]}>{current.body}</Text>
        </Card>
      </View>
      <Button
        label={isLast ? 'Continue' : 'Next'}
        onPress={() => (isLast ? setPicking(true) : setPanel((p) => p + 1))}
      />
      {panel > 0 ? (
        <Button label="Back" variant="ghost" onPress={() => setPanel((p) => p - 1)} />
      ) : null}
    </Screen>
  );
}
