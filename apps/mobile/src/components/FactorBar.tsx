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
  return (
    <View style={{ gap: spacing.xs }}>
      <ProgressBar
        fraction={factor.intensity}
        label={label}
        valueText={`${Math.round(factor.points)} pts`}
        tone={tone}
      />
      <Text style={[type.caption, { color: colors.inkMuted }]}>
        {factor.description} ({direction} the score)
      </Text>
    </View>
  );
}
