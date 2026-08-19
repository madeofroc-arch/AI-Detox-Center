import React, { useState } from 'react';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import type { ChallengeCategory, LanguagePreference } from '@ai-detox/core';
import { CHALLENGE_CATEGORIES, LOCALES, LOCALE_NAMES } from '@ai-detox/core';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { Tag } from '../components/Tag';
import { useI18n } from '../i18n/useI18n';
import { useAppStore } from '../state/store';
import { useTheme } from '../theme/useTheme';
import { spacing, type } from '../theme/tokens';

export default function Onboarding() {
  const { colors } = useTheme();
  const { t, core } = useI18n();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const language = useAppStore((s) => s.data.settings.language);
  const [panel, setPanel] = useState(0);
  const [picking, setPicking] = useState(false);
  const [focus, setFocus] = useState<ChallengeCategory[]>([]);

  const finish = async (categories: ChallengeCategory[]) => {
    await completeOnboarding(categories);
    router.replace('/(tabs)/home');
  };

  const panels = t.onboarding.panels;

  if (picking) {
    return (
      <Screen title={t.onboarding.focusTitle} subtitle={t.onboarding.focusSubtitle}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {CHALLENGE_CATEGORIES.map((c) => (
            <Tag
              key={c}
              label={core.challengeCategories[c]}
              selected={focus.includes(c)}
              selectionRole="checkbox"
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
        <Button label={t.common.begin} onPress={() => void finish(focus)} />
        <Button label={t.onboarding.skipForNow} variant="ghost" onPress={() => void finish([])} />
      </Screen>
    );
  }

  const current = panels[panel] ?? panels[0]!;
  const isLast = panel === panels.length - 1;

  return (
    <Screen>
      <View style={{ minHeight: 320, justifyContent: 'center', gap: spacing.lg }}>
        <Text style={[type.micro, { color: colors.inkMuted, textTransform: 'uppercase' }]}>
          {t.onboarding.step(panel + 1, panels.length)}
        </Text>
        <Text style={[type.title, { color: colors.ink }]}>{current.title}</Text>
        <Card>
          <Text style={[type.body, { color: colors.ink }]}>{current.body}</Text>
        </Card>
      </View>

      {/* Offered on the first panel only: someone who cannot read this screen
          should not have to finish it before they can change the language. */}
      {panel === 0 ? (
        <Card alt>
          <Text
            accessibilityRole="header"
            style={[type.micro, { color: colors.inkMuted, textTransform: 'uppercase' }]}
          >
            {t.onboarding.languageTitle}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: spacing.sm,
              marginTop: spacing.md,
            }}
          >
            {(['system', ...LOCALES] as LanguagePreference[]).map((option) => (
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
      ) : null}

      <Button
        label={isLast ? t.common.continue : t.common.next}
        onPress={() => (isLast ? setPicking(true) : setPanel((p) => p + 1))}
      />
      {panel > 0 ? (
        <Button label={t.common.back} variant="ghost" onPress={() => setPanel((p) => p - 1)} />
      ) : null}
    </Screen>
  );
}
