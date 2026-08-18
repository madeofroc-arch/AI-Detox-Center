import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { radius, spacing, type } from '../theme/tokens';

interface ProgressBarProps {
  /** 0..1 */
  fraction: number;
  label?: string;
  /** Right-aligned value text (e.g. "4"). */
  valueText?: string;
  /** amber for contributing factors, accent (default) for positives. */
  tone?: 'accent' | 'amber';
  /**
   * What a screen reader should say. Defaults to a percentage of the bar, which
   * is only honest when `fraction` really is a share of something nameable.
   */
  announce?: string;
}

export function ProgressBar({
  fraction,
  label,
  valueText,
  tone = 'accent',
  announce,
}: ProgressBarProps) {
  const { colors } = useTheme();
  const clamped = Math.min(1, Math.max(0, fraction));
  const fill = tone === 'amber' ? colors.amber : colors.accent;
  return (
    <View style={{ gap: spacing.xs }}>
      {label !== undefined || valueText !== undefined ? (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {label !== undefined ? (
            <Text style={[type.caption, { color: colors.ink }]}>{label}</Text>
          ) : (
            <View />
          )}
          {valueText !== undefined ? (
            <Text style={[type.caption, { color: colors.inkMuted }]}>{valueText}</Text>
          ) : null}
        </View>
      ) : null}
      <View
        accessibilityLabel={
          announce ?? (label ? `${label}: ${Math.round(clamped * 100)} percent` : undefined)
        }
        style={{
          height: 8,
          borderRadius: radius.full,
          backgroundColor: colors.line,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${clamped * 100}%`,
            height: '100%',
            borderRadius: radius.full,
            backgroundColor: fill,
          }}
        />
      </View>
    </View>
  );
}
