import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { radius, spacing, type } from '../theme/tokens';

interface TagProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

/** Pill tag; tappable variant used for category pickers. */
export function Tag({ label, selected, onPress }: TagProps) {
  const { colors } = useTheme();
  const content = (
    <Text
      style={[
        type.micro,
        {
          color: selected ? '#FFFFFF' : colors.accent,
          textTransform: 'uppercase',
        },
      ]}
    >
      {label}
    </Text>
  );
  const baseStyle = {
    backgroundColor: selected ? colors.accent : colors.accentSoft,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: 'center' as const,
    alignSelf: 'flex-start' as const,
  };
  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: selected === true }}
        accessibilityLabel={label}
        onPress={onPress}
        style={({ pressed }) => [baseStyle, { minHeight: 36, opacity: pressed ? 0.8 : 1 }]}
      >
        {content}
      </Pressable>
    );
  }
  return <View style={baseStyle}>{content}</View>;
}
