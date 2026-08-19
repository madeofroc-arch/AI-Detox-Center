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
 *
 * The colour is a token, not the `color` the tab bar passes to this callback.
 * That argument is typed with react-navigation's copy of React Native's
 * `ColorValue`, and when the two copies disagree — as they did the moment
 * React Native 0.87 changed the internal shape of that type — the typecheck
 * breaks on a dependency bump that touched none of our code. Reading `focused`
 * and picking from the palette keeps the same two colours (they are exactly
 * what `tabBarActiveTintColor` and `tabBarInactiveTintColor` are set to below)
 * and owes nothing to another package's type.
 */
function Glyph({ symbol, color }: { symbol: string; color: string }) {
  return (
    <Text {...decorative} style={[type.heading, { color }]}>
      {symbol}
    </Text>
  );
}

export default function TabsLayout() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const tint = (focused: boolean): string => (focused ? colors.accent : colors.inkMuted);
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
          tabBarIcon: ({ focused }) => <Glyph symbol="●" color={tint(focused)} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: t.tabs.progress,
          tabBarIcon: ({ focused }) => <Glyph symbol="▲" color={tint(focused)} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t.tabs.settings,
          tabBarIcon: ({ focused }) => <Glyph symbol="■" color={tint(focused)} />,
        }}
      />
    </Tabs>
  );
}
