import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { useI18n } from '../i18n/useI18n';
import { useAppStore } from '../state/store';
import { installFocusRing } from '../theme/focusRing';
import { gamePalette, gameSpace, gameType } from '../theme/game';

// Once, at module load, before anything renders. No-op on native.
installFocusRing();

/**
 * The shell.
 *
 * There is no light mode any more. `tokens.ts` carried a light and a dark
 * palette because the tracker was a calm paper-and-ink surface that had to work
 * at a desk at 10am; the game is one surface, dark, built for 22:40 on a sofa,
 * and it says so in `theme/game.ts`. A theme hook that can only ever return one
 * theme is a hook that has already been deleted, so it was.
 */
export default function RootLayout() {
  const { t } = useI18n();
  const hydrated = useAppStore((s) => s.hydrated);
  const loadWarning = useAppStore((s) => s.loadWarning);
  const hydrate = useAppStore((s) => s.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (!hydrated) {
    // Quiet loading state: background only, no spinners racing the splash.
    return <View style={{ flex: 1, backgroundColor: gamePalette.bg }} />;
  }

  return (
    <>
      <StatusBar style="light" />
      {loadWarning ? (
        <View
          accessibilityRole="alert"
          style={{ backgroundColor: gamePalette.surfaceAlt, padding: gameSpace.md }}
        >
          <Text style={[gameType.caption, { color: gamePalette.ink, textAlign: 'center' }]}>
            {loadWarning === 'corrupt_data_backed_up' ? t.root.corruptData : t.root.schemaTooNew}
          </Text>
        </View>
      ) : null}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: gamePalette.bg },
        }}
      />
    </>
  );
}
