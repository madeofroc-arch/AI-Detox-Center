import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { decorative, group } from '../theme/a11y';
import { radius, spacing, type } from '../theme/tokens';

interface ScoreDialProps {
  /** 0-100, or null when there is not enough data yet. */
  value: number | null;
  label: string;
  caption?: string;
  /** An additive fact shown under the caption, so a band never stands alone. */
  footnote?: string;
  /** Screen-reader text for the dial. Defaults to a literal reading of the number. */
  announce?: string;
  size?: number;
}

/**
 * Circular score display. Kept dependency-free (no SVG): a ring whose border
 * color deepens with the value; the number carries the information
 * (color-independence, see docs/design/accessibility.md).
 *
 * The ring is one accessibility element and its digits are hidden inside it —
 * otherwise a screen reader reads "61", then "BRAIN SCORE", then the label
 * that was supposed to replace them. Caption and footnote stay separate and
 * come after, which is the order they are read in and the order they mean:
 * number, then what it means, then what you are already doing well.
 */
export function ScoreDial({
  value,
  label,
  caption,
  footnote,
  announce,
  size = 160,
}: ScoreDialProps) {
  const { colors } = useTheme();
  const hasValue = value !== null;
  return (
    <View style={{ alignItems: 'center', gap: spacing.md }}>
      <View
        {...group(
          announce ??
            (hasValue ? `${label}: ${value} out of 100` : `${label}: not enough data yet`),
        )}
        style={{
          width: size,
          height: size,
          borderRadius: radius.full,
          borderWidth: 10,
          borderColor: hasValue ? colors.accent : colors.line,
          backgroundColor: colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View {...decorative} style={{ alignItems: 'center' }}>
          <Text style={[type.display, { color: colors.ink }]}>{hasValue ? value : '—'}</Text>
          <Text style={[type.micro, { color: colors.inkMuted, textTransform: 'uppercase' }]}>
            {label}
          </Text>
        </View>
      </View>
      {caption ? (
        <Text style={[type.caption, { color: colors.inkMuted, textAlign: 'center' }]}>
          {caption}
        </Text>
      ) : null}
      {footnote ? (
        <Text style={[type.caption, { color: colors.accent, textAlign: 'center' }]}>
          {footnote}
        </Text>
      ) : null}
    </View>
  );
}
