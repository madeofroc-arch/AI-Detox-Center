import type { PropsWithChildren } from 'react';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/useTheme';
import { layout, spacing, type } from '../theme/tokens';

interface ScreenProps extends PropsWithChildren {
  title?: string;
  subtitle?: string;
  /** Extra bottom padding for screens above the tab bar. */
  padBottom?: boolean;
}

/** Standard screen scaffold: bg, gutters, max content width, optional title. */
export function Screen({ title, subtitle, padBottom, children }: ScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + spacing.xl,
          paddingBottom: (padBottom ? 96 : spacing.section) + insets.bottom,
        },
      ]}
    >
      <View style={styles.inner}>
        {title ? (
          <Text accessibilityRole="header" style={[type.title, { color: colors.ink }]}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text style={[type.body, { color: colors.inkMuted, marginTop: spacing.xs }]}>
            {subtitle}
          </Text>
        ) : null}
        <View style={{ marginTop: title ? spacing.xxl : 0, gap: spacing.lg }}>{children}</View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: layout.gutter,
    flexGrow: 1,
  },
  inner: {
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
  },
});
