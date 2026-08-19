import React, { useState } from 'react';
import type { GestureResponderEvent, LayoutChangeEvent } from 'react-native';
import { Text, View } from 'react-native';
import type { AdversaryRound, Band } from '@ai-detox/core';
import { gamePalette, gameRadius, gameSpace, gameType } from '../../theme/game';
import { decorative } from '../../theme/a11y';

/**
 * The band you commit to, on a log axis.
 *
 * This is the whole interaction. Everything else in a round is reading and two
 * buttons; this is the part with a thumb on it, and the tension the game runs
 * on lives here — the payout climbing while the claim narrows, before any
 * answer exists.
 *
 * Log, not linear: the answers span decades, and on a linear axis every
 * interesting band would be a sliver at the left edge.
 *
 * ## Why the responder sits on the track, not on the thumbs
 *
 * The first version gave each thumb a `PanResponder` and tracked cumulative
 * `dx` from a ref. It worked, and it fought the linter the whole way: gesture
 * handlers built during render either capture stale props or touch refs while
 * React is rendering, and `react-hooks/refs` is right to flag both.
 *
 * One responder on the track, reading `locationX` — a coordinate already
 * relative to the responding view — removes the problem instead of arguing
 * with it. No refs, handlers rebuilt fresh every render with current props,
 * and the thumb tracks the finger absolutely rather than accumulating deltas,
 * so a slow drag cannot drift.
 *
 * A touch grabs whichever thumb is nearer, and either may pass the other: the
 * band is whatever range they enclose, so dragging past yourself gives a band
 * rather than a jam.
 */

const THUMB = 34;

const toFraction = (value: number, min: number, max: number): number => {
  const lo = Math.log10(min);
  const span = Math.log10(max) - lo;
  return span <= 0 ? 0 : (Math.log10(value) - lo) / span;
};

const toValue = (fraction: number, min: number, max: number): number => {
  const lo = Math.log10(min);
  const span = Math.log10(max) - lo;
  return 10 ** (lo + Math.min(1, Math.max(0, fraction)) * span);
};

export interface BandSliderProps {
  round: AdversaryRound;
  band: Band;
  onChange: (band: Band) => void;
  /** Locked once the band is committed. */
  disabled?: boolean;
  /** Formats a value for a tick label. */
  format: (value: number) => string;
  /** Screen-reader label for the whole control. */
  label: string;
}

export function BandSlider({
  round,
  band,
  onChange,
  disabled,
  format,
  label,
}: BandSliderProps) {
  const [width, setWidth] = useState(0);
  /** Which thumb the current touch grabbed. Null between gestures. */
  const [holding, setHolding] = useState<'lo' | 'hi' | null>(null);

  const loFraction = toFraction(band.lo, round.axisMin, round.axisMax);
  const hiFraction = toFraction(band.hi, round.axisMin, round.axisMax);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const fractionAt = (e: GestureResponderEvent): number =>
    width <= 0 ? 0 : Math.min(1, Math.max(0, e.nativeEvent.locationX / width));

  const moveTo = (edge: 'lo' | 'hi', fraction: number) => {
    const value = toValue(fraction, round.axisMin, round.axisMax);
    const other = edge === 'lo' ? band.hi : band.lo;
    const otherFraction = edge === 'lo' ? hiFraction : loFraction;
    // Either thumb may cross the other; the band is what they enclose.
    onChange(fraction <= otherFraction ? { lo: value, hi: other } : { lo: other, hi: value });
  };

  const grab = (e: GestureResponderEvent) => {
    if (disabled) return;
    const at = fractionAt(e);
    const edge = Math.abs(at - loFraction) <= Math.abs(at - hiFraction) ? 'lo' : 'hi';
    setHolding(edge);
    moveTo(edge, at);
  };

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      style={{ paddingVertical: gameSpace.xl }}
    >
      <View
        onLayout={onLayout}
        onStartShouldSetResponder={() => !disabled}
        onMoveShouldSetResponder={() => !disabled}
        onResponderGrant={grab}
        onResponderMove={(e) => {
          if (disabled || !holding) return;
          moveTo(holding, fractionAt(e));
        }}
        onResponderRelease={() => setHolding(null)}
        onResponderTerminate={() => setHolding(null)}
        // The touch area is taller than the 4pt line it draws: a hairline is
        // not a target, and the design system's floor is 44.
        style={{ height: 44, justifyContent: 'center' }}
      >
        <View
          {...decorative}
          style={{ height: 4, borderRadius: gameRadius.full, backgroundColor: gamePalette.line }}
        />
        <View
          {...decorative}
          style={{
            position: 'absolute',
            left: `${loFraction * 100}%`,
            width: `${Math.max(0, hiFraction - loFraction) * 100}%`,
            height: 6,
            borderRadius: gameRadius.full,
            backgroundColor: gamePalette.you,
          }}
        />
        {width > 0
          ? (['lo', 'hi'] as const).map((edge) => (
              <View
                key={edge}
                {...decorative}
                style={{
                  position: 'absolute',
                  left: (edge === 'lo' ? loFraction : hiFraction) * width - THUMB / 2,
                  width: THUMB,
                  height: THUMB,
                  borderRadius: gameRadius.full,
                  backgroundColor: gamePalette.you,
                  borderWidth: 3,
                  borderColor: gamePalette.bg,
                  opacity: disabled ? 0.55 : 1,
                  transform: holding === edge ? [{ scale: 1.15 }] : undefined,
                }}
              />
            ))
          : null}
      </View>

      <View {...decorative} style={{ height: 20, marginTop: gameSpace.sm }}>
        {ticks(round).map((tick) => (
          <Text
            key={tick.value}
            style={[
              gameType.label,
              {
                position: 'absolute',
                left: `${tick.fraction * 100}%`,
                marginLeft: -20,
                width: 40,
                textAlign: 'center',
                color: gamePalette.quiet,
              },
            ]}
          >
            {format(tick.value)}
          </Text>
        ))}
      </View>
    </View>
  );
}

/**
 * One tick per power of ten. On a log scale these are the only landmarks;
 * without them the slider is a guess with no units on it.
 */
function ticks(round: AdversaryRound): { value: number; fraction: number }[] {
  const out: { value: number; fraction: number }[] = [];
  const first = Math.ceil(Math.log10(round.axisMin));
  const last = Math.floor(Math.log10(round.axisMax));
  const step = last - first > 6 ? 2 : 1;
  for (let e = first; e <= last; e += step) {
    out.push({ value: 10 ** e, fraction: toFraction(10 ** e, round.axisMin, round.axisMax) });
  }
  return out;
}
