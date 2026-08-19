import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { MIN_TOUCH_TARGET, selectionState } from '../theme/a11y';
import { radius, spacing, type } from '../theme/tokens';

interface TagProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /**
   * What kind of choice this tag is part of. `radio` for pick-one (language),
   * `checkbox` for pick-several (focus capabilities). A plain button announces
   * "selected" inconsistently and never says how many you may pick.
   */
  selectionRole?: 'radio' | 'checkbox';
}

/** Pill tag; tappable variant used for category pickers. */
export function Tag({ label, selected, onPress, selectionRole }: TagProps) {
  const { colors } = useTheme();
  const content = (
    <Text
      style={[
        type.micro,
        {
          color: selected ? colors.onAccent : colors.accent,
          textTransform: 'uppercase',
          textAlign: 'center',
        },
      ]}
    >
      {label}
    </Text>
  );
  const baseStyle = {
    backgroundColor: selected ? colors.accent : colors.accentSoft,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    justifyContent: 'center' as const,
    alignSelf: 'flex-start' as const,
  };
  if (onPress) {
    const role = selectionRole ?? 'button';
    return (
      <Pressable
        accessibilityRole={role}
        {...selectionState(selected === true, role)}
        accessibilityLabel={label}
        onPress={onPress}
        style={({ pressed }) => [
          baseStyle,
          // 36pt was below the 44pt the design system promises, on the
          // category pickers in onboarding, settings and the AI Gate (#4).
          { minHeight: MIN_TOUCH_TARGET, opacity: pressed ? 0.8 : 1 },
        ]}
      >
        {content}
      </Pressable>
    );
  }
  return <View style={baseStyle}>{content}</View>;
}
