import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import {
  BAND_LABELS,
  computeDependencyScore,
  computeUsageStats,
  eventsInWindow,
} from '@ai-detox/core';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { FactorBar } from '../components/FactorBar';
import { ScoreDial } from '../components/ScoreDial';
import { Screen } from '../components/Screen';
import { nowIso } from '../lib/clock';
import { useAppStore } from '../state/store';
import { useTheme } from '../theme/useTheme';
import { spacing, type } from '../theme/tokens';

export default function Report() {
  const { colors } = useTheme();
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
      <Screen title="Brain Report">
        <EmptyState
          heading="Not enough data yet"
          message={`The report unlocks after about ${data.scoringConfig.minEventsForScore} recorded uses. Each AI Gate visit counts — including the ones you solve yourself.`}
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
    <Screen title="Brain Report" subtitle="Why your score is what it is.">
      <Card>
        <ScoreDial
          value={result.score}
          label="AI reliance"
          caption={result.band ? BAND_LABELS[result.band] : undefined}
        />
      </Card>

      <Text style={[type.heading, { color: colors.ink }]}>What adds to reliance</Text>
      <Card>
        <View style={{ gap: spacing.lg }}>
          {contributors.map((f) => (
            <FactorBar key={f.factor} factor={f} scale={scale} />
          ))}
        </View>
      </Card>

      <Text style={[type.heading, { color: colors.ink }]}>What lowers it</Text>
      <Card>
        <View style={{ gap: spacing.lg }}>
          {reducers.map((f) => (
            <FactorBar key={f.factor} factor={f} scale={scale} />
          ))}
        </View>
      </Card>

      <Text style={[type.heading, { color: colors.ink }]}>Not counted, worth knowing</Text>
      <Card>
        <View style={{ gap: spacing.md }}>
          <Text style={[type.body, { color: colors.ink }]}>
            You paused to reflect on {percent(stats.fractionAIUsesWithReflection)}% of your AI
            uses.
          </Text>
          <Text style={[type.body, { color: colors.ink }]}>
            {percent(stats.fractionDeliberate)}% of your AI use was deliberate, tool-like work.
          </Text>
          <Text style={[type.caption, { color: colors.inkMuted }]}>
            Neither of these moves the number. Anything you can do inside this app to lower your
            own score would make the score worth less, so reflecting is reported and never
            rewarded.
          </Text>
        </View>
      </Card>

      <Card alt>
        <Text style={[type.caption, { color: colors.inkMuted }]}>
          How this works: each factor above is measured from your last {result.windowDays} days of
          recorded uses ({result.eventCount} moments, {result.aiUseCount} of them with AI). The
          factors that add up form your reliance; moments you resolved without AI discount that
          reliance by up to {Math.round(data.scoringConfig.reducerMaxDiscount * 100)}%, never
          erase it. Each number is rounded to whole points, so reading them off and adding them up
          can land a point or two from the dial.
        </Text>
        <Text style={[type.caption, { color: colors.inkMuted, marginTop: spacing.md }]}>
          What counts is how much thinking you handed over, not how much you used AI. Heavy,
          deliberate use where you think first scores low by design, and handing over twice as
          many whole tasks counts as twice as much — until the scale runs out, above roughly two
          handed-over tasks a day, where the dial simply stays at 100. Early on the number reads
          low while the {result.windowDays} days fill up. Computed entirely on this device.
        </Text>
      </Card>
    </Screen>
  );
}
