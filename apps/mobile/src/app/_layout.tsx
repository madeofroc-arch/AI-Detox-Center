import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { useAppStore } from '../state/store';
import { useTheme } from '../theme/useTheme';
import { spacing, type } from '../theme/tokens';

export default function RootLayout() {
  const { colors, isDark } = useTheme();
  const hydrated = useAppStore((s) => s.hydrated);
  const loadWarning = useAppStore((s) => s.loadWarning);
  const hydrate = useAppStore((s) => s.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (!hydrated) {
    // Quiet loading state: theme background only, no spinners racing the splash.
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {loadWarning ? (
        <View
          accessibilityRole="alert"
          style={{ backgroundColor: colors.surfaceAlt, padding: spacing.md }}
        >
          <Text style={[type.caption, { color: colors.ink, textAlign: 'center' }]}>
            {loadWarning === 'corrupt_data_backed_up'
              ? 'Stored data could not be read. A backup was kept on this device.'
              : 'Data was written by a newer app version. Update the app to use it.'}
          </Text>
        </View>
      ) : null}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      />
    </>
  );
}
