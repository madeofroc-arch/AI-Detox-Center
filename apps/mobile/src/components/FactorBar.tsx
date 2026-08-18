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
  reflection: 'Reflection',
  deliberateUsage: 'Deliberate use',
};

/** One scoring factor with its plain-language explanation. */
export function FactorBar({ factor }: { factor: FactorScore }) {
  const { colors } = useTheme();
  const label = FACTOR_LABELS[factor.factor] ?? factor.factor;
  const tone = factor.role === 'contributor' ? 'amber' : 'accent';
  const direction = factor.role === 'contributor' ? 'adds to' : 'lowers';
  const points = Math.round(factor.points);
  // Contributor intensity is a rate against a saturation rate, not a share of
  // anything the user could name, and it can exceed 1. Fill the bar by how much
  // of this factor's available points it actually claimed, and announce the
  // points rather than a percentage that means nothing (ADR-0006).
  const fill = factor.maxPoints > 0 ? factor.points / factor.maxPoints : 0;
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
