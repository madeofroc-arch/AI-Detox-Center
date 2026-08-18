import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useI18n } from '../../i18n/useI18n';
import { useTheme } from '../../theme/useTheme';
import { type } from '../../theme/tokens';

function Glyph({ symbol, color }: { symbol: string; color: import("react-native").ColorValue }) {
  return <Text style={[type.heading, { color }]}>{symbol}</Text>;
}

export default function TabsLayout() {
  const { colors } = useTheme();
  const { t } = useI18n();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.inkFaint,
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
