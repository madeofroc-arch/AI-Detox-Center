import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { MIN_TOUCH_TARGET, selectionState } from '../theme/a11y';
import { radius, spacing, type } from '../theme/tokens';

interface SegmentedProps<T extends string | number> {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
}

/**
 * Pick-one control, announced as a radio group because that is what it is.
 *
 * The selected state used to be carried entirely by a background change worth
 * 1.17:1, which tells a screen-reader user nothing and a sighted user very
 * little. It now carries an accent border as well (#4).
 */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedProps<T>) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={{
        flexDirection: 'row',
        backgroundColor: colors.surfaceAlt,
        borderRadius: radius.md,
        padding: spacing.xs,
        gap: spacing.xs,
      }}
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={String(opt.value)}
            accessibilityRole="radio"
            {...selectionState(selected, 'radio')}
            accessibilityLabel={opt.label}
            onPress={() => onChange(opt.value)}
            style={{
              flex: 1,
              minHeight: MIN_TOUCH_TARGET,
              paddingVertical: spacing.sm,
              borderRadius: radius.sm,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: selected ? colors.surface : 'transparent',
              borderWidth: selected ? 1 : 0,
              borderColor: colors.accent,
            }}
          >
            <Text style={[type.bodyStrong, { color: selected ? colors.ink : colors.inkMuted }]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
