import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { radius, spacing, type } from '../theme/tokens';

interface ScoreDialProps {
  /** 0-100, or null when there is not enough data yet. */
  value: number | null;
  label: string;
  caption?: string;
  size?: number;
}

/**
 * Circular score display. Kept dependency-free (no SVG): a ring whose border
 * color deepens with the value; the number carries the information
 * (color-independence, see docs/design/accessibility.md).
 */
export function ScoreDial({ value, label, caption, size = 160 }: ScoreDialProps) {
  const { colors } = useTheme();
  const hasValue = value !== null;
  return (
    <View style={{ alignItems: 'center', gap: spacing.md }}>
      <View
        accessibilityLabel={hasValue ? `${label}: ${value} out of 100` : `${label}: not enough data yet`}
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
        <Text style={[type.display, { color: colors.ink }]}>{hasValue ? value : '—'}</Text>
        <Text style={[type.micro, { color: colors.inkMuted, textTransform: 'uppercase' }]}>
          {label}
        </Text>
      </View>
      {caption ? (
        <Text style={[type.caption, { color: colors.inkMuted, textAlign: 'center' }]}>
          {caption}
        </Text>
      ) : null}
    </View>
  );
}
