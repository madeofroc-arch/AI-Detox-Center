import React from 'react';
import { Text, View } from 'react-native';
import type { AdversaryRound, Band } from '@ai-detox/core';
import { gamePalette, gameRadius, gameSpace, gameType } from '../../theme/game';
import { decorative } from '../../theme/a11y';

/**
 * The reveal: your band, and where the answer actually was, on the same axis.
 *
 * Deliberately the same axis you were just dragging on, not a summary of it.
 * The answer arriving in the coordinate system you committed in is what makes
 * the result physical rather than reported — the old product resolved nothing,
 * ever, and its only moving parts were two countdowns you watched.
 *
 * A hit lights the band; a miss greys it. Never red: the band is a claim, not a
 * verdict on the person (principle 7), and the marker's position already says
 * everything the colour would.
 */

const toFraction = (value: number, min: number, max: number): number => {
  const lo = Math.log10(min);
  const span = Math.log10(max) - lo;
  if (span <= 0) return 0;
  return Math.min(1, Math.max(0, (Math.log10(value) - lo) / span));
};

export function AxisReveal({
  round,
  band,
  hit,
  format,
  label,
}: {
  round: AdversaryRound;
  band: Band;
  hit: boolean;
  format: (value: number) => string;
  /** Screen-reader text for the whole reveal, since none of this is text. */
  label: string;
}) {
  const lo = toFraction(band.lo, round.axisMin, round.axisMax);
  const hi = toFraction(band.hi, round.axisMin, round.axisMax);
  const answer = toFraction(round.trueValue, round.axisMin, round.axisMax);
  const bandColor = hit ? gamePalette.you : gamePalette.quiet;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={label}
      style={{ paddingTop: gameSpace.xl, paddingBottom: gameSpace.md }}
    >
      <View {...decorative} style={{ height: 44, justifyContent: 'center' }}>
        <View
          style={{ height: 4, borderRadius: gameRadius.full, backgroundColor: gamePalette.line }}
        />
        <View
          style={{
            position: 'absolute',
            left: `${lo * 100}%`,
            width: `${Math.max(0, hi - lo) * 100}%`,
            height: 6,
            borderRadius: gameRadius.full,
            backgroundColor: bandColor,
          }}
        />
        {/* The answer. A line rather than a dot: it has to read as a position
            on the axis, not as another object sitting near it. */}
        <View
          style={{
            position: 'absolute',
            left: `${answer * 100}%`,
            marginLeft: -1.5,
            width: 3,
            height: 34,
            borderRadius: gameRadius.full,
            backgroundColor: gamePalette.gold,
          }}
        />
      </View>
      <View {...decorative} style={{ height: 18 }}>
        <Text
          style={[
            gameType.label,
            {
              position: 'absolute',
              left: `${answer * 100}%`,
              marginLeft: -40,
              width: 80,
              textAlign: 'center',
              color: gamePalette.gold,
            },
          ]}
        >
          {format(round.trueValue)}
        </Text>
      </View>
    </View>
  );
}
