import type { PropsWithChildren } from 'react';
import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Pressable, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { radius, spacing } from '../theme/tokens';

interface CardProps extends PropsWithChildren {
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  /** Use the secondary surface (wells inside cards, subdued blocks). */
  alt?: boolean;
}

export function Card({ onPress, accessibilityLabel, style, alt, children }: CardProps) {
  const { colors } = useTheme();
  const base: ViewStyle = {
    backgroundColor: alt ? colors.surfaceAlt : colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.xl,
  };
  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={({ pressed }) => [base, { opacity: pressed ? 0.85 : 1 }, style]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[base, style]}>{children}</View>;
}
