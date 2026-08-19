import React from 'react';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import type { LanguagePreference } from '@ai-detox/core';
import { CHALLENGE_CATEGORIES, LOCALES, LOCALE_NAMES } from '@ai-detox/core';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { SectionHeading } from '../../components/SectionHeading';
import { Tag } from '../../components/Tag';
import { useI18n } from '../../i18n/useI18n';
import { confirmAsync } from '../../lib/confirm';
import { exportJsonToUser } from '../../lib/exportData';
import { useAppStore } from '../../state/store';
import { useTheme } from '../../theme/useTheme';
import { spacing, type } from '../../theme/tokens';

const LANGUAGE_OPTIONS: LanguagePreference[] = ['system', ...LOCALES];

export default function Settings() {
  const { colors } = useTheme();
  const { t, core } = useI18n();
  const focus = useAppStore((s) => s.data.settings.focusCategories);
  const language = useAppStore((s) => s.data.settings.language);
  const setFocusCategories = useAppStore((s) => s.setFocusCategories);
  const setLanguage = useAppStore((s) => s.setLanguage);
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
      t.settings.deleteTitle1,
      t.settings.deleteBody1,
      t.common.continue,
      t.common.cancel,
    );
    if (!first) return;
    const second = await confirmAsync(
      t.settings.deleteTitle2,
      t.settings.deleteBody2,
      t.settings.deleteAll,
      t.common.cancel,
    );
    if (!second) return;
    await deleteAllData();
    router.replace('/onboarding');
  };

  return (
    <Screen title={t.settings.title} padBottom>
      <SectionHeading>{t.settings.language}</SectionHeading>
      <Card>
        <Text style={[type.caption, { color: colors.inkMuted, marginBottom: spacing.md }]}>
          {t.settings.languageNote}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {LANGUAGE_OPTIONS.map((option) => (
            <Tag
              key={option}
              label={option === 'system' ? t.settings.languageSystem : LOCALE_NAMES[option]}
              selected={language === option}
              selectionRole="radio"
              onPress={() => void setLanguage(option)}
            />
          ))}
        </View>
      </Card>

      <SectionHeading>{t.settings.focus}</SectionHeading>
      <Card>
        <Text style={[type.caption, { color: colors.inkMuted, marginBottom: spacing.md }]}>
          {t.settings.focusNote}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {CHALLENGE_CATEGORIES.map((c) => (
            <Tag
              key={c}
              label={core.challengeCategories[c]}
              selected={focus.includes(c)}
              selectionRole="checkbox"
              onPress={() => toggleFocus(c)}
            />
          ))}
        </View>
      </Card>

      <SectionHeading>{t.settings.about}</SectionHeading>
      <Card>
        <Text style={[type.body, { color: colors.ink }]}>{t.settings.aboutBody}</Text>
        <Text style={[type.caption, { color: colors.inkMuted, marginTop: spacing.md }]}>
          {t.settings.version}
        </Text>
      </Card>

      <SectionHeading>{t.settings.dataPrivacy}</SectionHeading>
      <Card>
        <Text style={[type.caption, { color: colors.inkMuted, marginBottom: spacing.md }]}>
          {t.settings.dataNote}
        </Text>
        <View style={{ gap: spacing.md }}>
          <Button
            label={t.settings.exportData}
            variant="secondary"
            onPress={() => void exportJsonToUser(exportJson())}
          />
          <Button
            label={t.settings.resetScoring}
            variant="secondary"
            onPress={() => void resetScoringConfig()}
          />
          <Button
            label={t.settings.deleteAll}
            variant="danger"
            onPress={() => void onDelete()}
          />
        </View>
      </Card>
    </Screen>
  );
}
