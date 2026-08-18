import React from 'react';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { CATEGORY_LABELS, CHALLENGE_CATEGORIES } from '@ai-detox/core';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { Tag } from '../../components/Tag';
import { confirmAsync } from '../../lib/confirm';
import { exportJsonToUser } from '../../lib/exportData';
import { useAppStore } from '../../state/store';
import { useTheme } from '../../theme/useTheme';
import { spacing, type } from '../../theme/tokens';

export default function Settings() {
  const { colors } = useTheme();
  const focus = useAppStore((s) => s.data.settings.focusCategories);
  const setFocusCategories = useAppStore((s) => s.setFocusCategories);
  const resetScoringConfig = useAppStore((s) => s.resetScoringConfig);
  const deleteAllData = useAppStore((s) => s.deleteAllData);
  const exportJson = useAppStore((s) => s.exportJson);

  const toggleFocus = (category: (typeof CHALLENGE_CATEGORIES)[number]) => {
    const next = focus.includes(category)
      ? focus.filter((c) => c !== category)
      : focus.length < 3
        ? [...focus, category]
        : focus;
    void setFocusCategories(next);
  };

  const onDelete = async () => {
    const first = await confirmAsync(
      'Delete all data?',
      'This erases everything on this device. There is no cloud copy.',
      'Continue',
    );
    if (!first) return;
    const second = await confirmAsync(
      'Really delete everything?',
      'Scores, challenges, reflections — all of it. This cannot be undone.',
      'Delete all data',
    );
    if (!second) return;
    await deleteAllData();
    router.replace('/onboarding');
  };

  return (
    <Screen title="Settings" padBottom>
      <Text style={[type.heading, { color: colors.ink }]}>Focus</Text>
      <Card>
        <Text style={[type.caption, { color: colors.inkMuted, marginBottom: spacing.md }]}>
          Up to three capabilities your daily challenge leans toward.
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {CHALLENGE_CATEGORIES.map((c) => (
            <Tag
              key={c}
              label={CATEGORY_LABELS[c]}
              selected={focus.includes(c)}
              onPress={() => toggleFocus(c)}
            />
          ))}
        </View>
      </Card>

      <Text style={[type.heading, { color: colors.ink }]}>About</Text>
      <Card>
        <Text style={[type.body, { color: colors.ink }]}>
          Human Mode trains independent thinking. The goal is not to eliminate AI — it is to
          eliminate unconscious dependence on it. The best outcome is that you eventually need
          this app less.
        </Text>
        <Text style={[type.caption, { color: colors.inkMuted, marginTop: spacing.md }]}>
          AI Detox Center v0.1.0 · MIT licensed open source
        </Text>
      </Card>

      <Text style={[type.heading, { color: colors.ink }]}>Data &amp; privacy</Text>
      <Card>
        <Text style={[type.caption, { color: colors.inkMuted, marginBottom: spacing.md }]}>
          Everything lives on this device. No account, no cloud, no analytics.
        </Text>
        <View style={{ gap: spacing.md }}>
          <Button
            label="Export my data"
            variant="secondary"
            onPress={() => void exportJsonToUser(exportJson())}
          />
          <Button
            label="Reset scoring settings"
            variant="secondary"
            onPress={() => void resetScoringConfig()}
          />
          <Button label="Delete all data" variant="danger" onPress={() => void onDelete()} />
        </View>
      </Card>
    </Screen>
  );
}
