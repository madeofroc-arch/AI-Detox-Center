import React from 'react';
import { Text, View } from 'react-native';
import type { CoreStrings, FactorScore } from '@ai-detox/core';
import type { AppStrings } from '../i18n/en';
import { useTheme } from '../theme/useTheme';
import { spacing, type } from '../theme/tokens';
import { ProgressBar } from './ProgressBar';

/**
 * One scoring factor with its plain-language explanation.
 *
 * `scale` is the largest point value among the rows shown together. Bars are
 * filled against it so that bar length means the same thing as the number
 * printed beside it. Filling by `points / maxPoints` -- which is algebraically
 * just the factor's intensity -- rendered every saturated factor as an
 * identical full bar, so a row worth 61 points and one worth 31 looked the
 * same (ADR-0007).
 *
 * Both string packs are passed in: the label and description are domain
 * language (core), the direction words and the points unit are screen copy.
 */
export function FactorBar({
  factor,
  scale,
  t,
  core,
}: {
  factor: FactorScore;
  scale: number;
  t: AppStrings;
  core: CoreStrings;
}) {
  const { colors } = useTheme();
  const label = core.factorLabels[factor.factor] ?? factor.factor;
  const tone = factor.role === 'contributor' ? 'amber' : 'accent';
  const direction =
    factor.role === 'contributor' ? t.report.factorAdds : t.report.factorLowers;
  const points = Math.round(factor.points);
  const fill = scale > 0 ? factor.points / scale : 0;
  return (
    <View style={{ gap: spacing.xs }}>
      <ProgressBar
        fraction={fill}
        label={label}
        valueText={t.report.points(points)}
        tone={tone}
        announce={t.report.factorA11y(label, points, direction)}
      />
      <Text style={[type.caption, { color: colors.inkMuted }]}>
        {core.factorDescriptions[factor.factor] ?? factor.description} ({direction})
      </Text>
    </View>
  );
}
