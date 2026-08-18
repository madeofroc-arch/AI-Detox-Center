import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { BAND_LABELS, computeDependencyScore } from '@ai-detox/core';
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
            <FactorBar key={f.factor} factor={f} />
          ))}
        </View>
      </Card>

      <Text style={[type.heading, { color: colors.ink }]}>What lowers it</Text>
      <Card>
        <View style={{ gap: spacing.lg }}>
          {reducers.map((f) => (
            <FactorBar key={f.factor} factor={f} />
          ))}
        </View>
      </Card>

      <Card alt>
        <Text style={[type.caption, { color: colors.inkMuted }]}>
          How this works: each factor above is measured from your last {result.windowDays} days of
          recorded uses ({result.eventCount} moments, {result.aiUseCount} of them with AI). The
          factors that add up form your reliance; the ones that lower it can reduce that reliance
          by up to {Math.round(data.scoringConfig.reducerMaxDiscount * 100)}%, never erase it. The
          numbers above add up to exactly the score on the dial.
        </Text>
        <Text style={[type.caption, { color: colors.inkMuted, marginTop: spacing.md }]}>
          Nothing here judges how MUCH you use AI — only the patterns around it. Heavy, deliberate
          use where you think first scores low by design. Computed entirely on this device.
        </Text>
      </Card>
    </Screen>
  );
}
