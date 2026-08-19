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
      // inkMuted, not a fainter shade: placeholder text is text, and the old
      // inkFaint sat at 1.94:1 inside this very field (#4).
      placeholderTextColor={colors.inkMuted}
      multiline={area}
      {...props}
      style={[
        type.body,
        {
          backgroundColor: colors.surfaceAlt,
          color: colors.ink,
          borderRadius: radius.sm,
          borderWidth: 1,
          // The border is what identifies this as a field — the fill is only
          // 1.17:1 against the card behind it — so it uses the strong line.
          borderColor: colors.lineStrong,
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
