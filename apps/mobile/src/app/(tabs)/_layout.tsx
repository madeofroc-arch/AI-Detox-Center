import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useI18n } from '../../i18n/useI18n';
import { useTheme } from '../../theme/useTheme';
import { decorative } from '../../theme/a11y';
import { type } from '../../theme/tokens';

/**
 * Tab icons are text characters, so a screen reader would otherwise read
 * "black circle, Home". Every tab already has a visible label; the glyph is
 * decoration and says so (#4).
 */
function Glyph({ symbol, color }: { symbol: string; color: import("react-native").ColorValue }) {
  return (
    <Text {...decorative} style={[type.heading, { color }]}>
      {symbol}
    </Text>
  );
}

export default function TabsLayout() {
  const { colors } = useTheme();
  const { t } = useI18n();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        // inkMuted, not a fainter shade: an inactive tab label is text, and
        // the token it used sat at 2.26:1 (#4).
        tabBarInactiveTintColor: colors.inkMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.line },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t.tabs.home,
          tabBarIcon: ({ color }) => <Glyph symbol="●" color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: t.tabs.progress,
          tabBarIcon: ({ color }) => <Glyph symbol="▲" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t.tabs.settings,
          tabBarIcon: ({ color }) => <Glyph symbol="■" color={color} />,
        }}
      />
    </Tabs>
  );
}
