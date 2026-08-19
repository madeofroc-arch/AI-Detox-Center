import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { computeDependencyScore, computeUsageStats, eventsInWindow } from '@ai-detox/core';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { FactorBar } from '../components/FactorBar';
import { ScoreDial } from '../components/ScoreDial';
import { Screen } from '../components/Screen';
import { SectionHeading } from '../components/SectionHeading';
import { useI18n } from '../i18n/useI18n';
import { nowIso } from '../lib/clock';
import { useAppStore } from '../state/store';
import { useTheme } from '../theme/useTheme';
import { spacing, type } from '../theme/tokens';

export default function Report() {
  const { colors } = useTheme();
  const { t, core } = useI18n();
  const data = useAppStore((s) => s.data);

  const result = useMemo(
    () => computeDependencyScore(data.events, data.scoringConfig, nowIso()),
    [data.events, data.scoringConfig],
  );
  // Shape signals: shown, never scored. Rewarding them made adding one more AI
  // use LOWER the dial (ADR-0007), so they live here instead — with the
  // denominator each sentence actually claims.
  const stats = useMemo(() => {
    const windowDays = data.scoringConfig.windowDays;
    return computeUsageStats(eventsInWindow(data.events, nowIso(), windowDays), windowDays);
  }, [data.events, data.scoringConfig]);

  if (result.status === 'insufficient_data') {
    return (
      <Screen title={t.report.title}>
        <EmptyState
          heading={t.report.insufficientHeading}
          message={t.report.insufficientMessage(data.scoringConfig.minEventsForScore)}
        />
      </Screen>
    );
  }

  const contributors = result.factors.filter((f) => f.role === 'contributor');
  const reducers = result.factors.filter((f) => f.role === 'reducer');
  // One shared scale so a bar's length means the same on every row.
  const scale = Math.max(...result.factors.map((f) => f.points), 1);
  const percent = (n: number): number => Math.round(n * 100);

  return (
    <Screen title={t.report.title} subtitle={t.report.subtitle}>
      <Card>
        <ScoreDial
          value={result.score}
          label={t.report.reliance}
          caption={result.band ? core.bandLabels[result.band] : undefined}
        />
      </Card>

      <SectionHeading>{t.report.whatAdds}</SectionHeading>
      <Card>
        <View style={{ gap: spacing.lg }}>
          {contributors.map((f) => (
            <FactorBar key={f.factor} factor={f} scale={scale} t={t} core={core} />
          ))}
        </View>
      </Card>

      <SectionHeading>{t.report.whatLowers}</SectionHeading>
      <Card>
        <View style={{ gap: spacing.lg }}>
          {reducers.map((f) => (
            <FactorBar key={f.factor} factor={f} scale={scale} t={t} core={core} />
          ))}
        </View>
      </Card>

      <SectionHeading>{t.report.notCounted}</SectionHeading>
      <Card>
        <View style={{ gap: spacing.md }}>
          <Text style={[type.body, { color: colors.ink }]}>
            {t.report.reflectedLine(percent(stats.fractionAIUsesWithReflection))}
          </Text>
          <Text style={[type.body, { color: colors.ink }]}>
            {t.report.deliberateLine(percent(stats.fractionDeliberate))}
          </Text>
          <Text style={[type.caption, { color: colors.inkMuted }]}>
            {t.report.notCountedNote}
          </Text>
        </View>
      </Card>

      <Card alt>
        <Text style={[type.caption, { color: colors.inkMuted }]}>
          {t.report.howItWorks(
            result.windowDays,
            result.eventCount,
            result.aiUseCount,
            Math.round(data.scoringConfig.reducerMaxDiscount * 100),
          )}
        </Text>
        <Text style={[type.caption, { color: colors.inkMuted, marginTop: spacing.md }]}>
          {t.report.whatCounts(result.windowDays)}
        </Text>
      </Card>
    </Screen>
  );
}
