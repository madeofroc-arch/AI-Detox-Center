import React from 'react';
import { Text, View } from 'react-native';
import type { FactorScore } from '@ai-detox/core';
import { useTheme } from '../theme/useTheme';
import { spacing, type } from '../theme/tokens';
import { ProgressBar } from './ProgressBar';

const FACTOR_LABELS: Record<string, string> = {
  frequency: 'Frequency',
  immediacy: 'Immediacy',
  delegation: 'Delegation',
  lackOfAttempt: 'No attempt first',
  emotionalDependency: 'Reassurance',
  independentAttempt: 'Independent attempts',
};

/**
 * One scoring factor with its plain-language explanation.
 *
 * `scale` is the largest point value among the rows shown together. Bars are
 * filled against it so that bar length means the same thing as the number
 * printed beside it. Filling by `points / maxPoints` -- which is algebraically
 * just the factor's intensity -- rendered every saturated factor as an
 * identical full bar, so a row worth 61 points and one worth 31 looked the
 * same (ADR-0007).
 */
export function FactorBar({ factor, scale }: { factor: FactorScore; scale: number }) {
  const { colors } = useTheme();
  const label = FACTOR_LABELS[factor.factor] ?? factor.factor;
  const tone = factor.role === 'contributor' ? 'amber' : 'accent';
  const direction = factor.role === 'contributor' ? 'adds to' : 'lowers';
  const points = Math.round(factor.points);
  const fill = scale > 0 ? factor.points / scale : 0;
  return (
    <View style={{ gap: spacing.xs }}>
      <ProgressBar
        fraction={fill}
        label={label}
        valueText={`${points} pts`}
        tone={tone}
        announce={`${label}: ${points} points, ${direction} the score`}
      />
      <Text style={[type.caption, { color: colors.inkMuted }]}>
        {factor.description} ({direction} the score)
      </Text>
    </View>
  );
}
