import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { decorative, group } from '../theme/a11y';
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
   * What a screen reader should say for the whole row. Defaults to the label
   * and value as written, which is only honest when both are present; a bare
   * percentage of the bar is not, because `fraction` is often a share of the
   * largest row rather than a share of anything nameable.
   */
  announce?: string;
}

/**
 * Label, value and bar, announced as ONE thing.
 *
 * Before the audit each part was its own accessibility element, so a factor
 * row read "Delegation", then "14 pts", then "Delegation: 14 points, adds to
 * the score" — the same fact three times, and the third one only because a
 * label had been put on a `View` that was not `accessible` and so was ignored
 * anyway (#4).
 */
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
  const spoken =
    announce ??
    [label, valueText].filter((part) => part !== undefined && part !== '').join(': ');
  return (
    <View {...(spoken === '' ? {} : group(spoken))} style={{ gap: spacing.xs }}>
      {label !== undefined || valueText !== undefined ? (
        <View {...decorative} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm }}>
          {label !== undefined ? (
            <Text style={[type.caption, { color: colors.ink, flexShrink: 1 }]}>{label}</Text>
          ) : (
            <View />
          )}
          {valueText !== undefined ? (
            <Text style={[type.caption, { color: colors.inkMuted }]}>{valueText}</Text>
          ) : null}
        </View>
      ) : null}
      <View
        {...decorative}
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
