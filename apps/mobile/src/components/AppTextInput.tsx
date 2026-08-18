import React from 'react';
import type { TextInputProps } from 'react-native';
import { TextInput } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { radius, spacing, type } from '../theme/tokens';

interface AppTextInputProps extends TextInputProps {
  /** Grow into a multi-line work area. */
  area?: boolean;
}

export function AppTextInput({ area, style, ...props }: AppTextInputProps) {
  const { colors } = useTheme();
  return (
    <TextInput
      placeholderTextColor={colors.inkFaint}
      multiline={area}
      {...props}
      style={[
        type.body,
        {
          backgroundColor: colors.surfaceAlt,
          color: colors.ink,
          borderRadius: radius.sm,
          borderWidth: 1,
          borderColor: colors.line,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          minHeight: area ? 120 : 48,
          textAlignVertical: area ? 'top' : 'center',
        },
        style,
      ]}
    />
  );
}
