import React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { LifelineId } from '@ai-detox/core';
import { gamePalette, gameRadius, gameSpace, gameType } from '../../theme/game';
import { MIN_TOUCH_TARGET, decorative } from '../../theme/a11y';

/**
 * The lifelines, with what is left of each.
 *
 * They are shown even when unavailable, greyed rather than removed: the shape
 * of what you have is part of the decision, and a bar that reflows every time
 * something is spent makes the run harder to read, not simpler.
 *
 * The host sits with the others and is not marked as dangerous. It costs the
 * same as the other two that name an answer, and the mode screen says in words
 * how often it lies before the run starts. Flagging it here would turn the
 * measurement into a warning label — and pricing it below the others, which an
 * earlier draft did, made reaching for it first correct arithmetic rather than
 * a preference.
 */
export interface LifelineButtonProps {
  id: LifelineId;
  label: string;
  count: number;
  available: boolean;
  spent: boolean;
  onPress: () => void;
  accessibilityLabel: string;
}

export function LifelineBar({ items }: { items: readonly LifelineButtonProps[] }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: gameSpace.sm }}>
      {items.map((item) => (
        <LifelineButton key={item.id} {...item} />
      ))}
    </View>
  );
}

function LifelineButton({
  label,
  count,
  available,
  spent,
  onPress,
  accessibilityLabel,
}: LifelineButtonProps) {
  const dimmed = !available;
  const ink = spent ? gamePalette.quiet : dimmed ? gamePalette.quiet : gamePalette.ink;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !available }}
      disabled={!available}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: MIN_TOUCH_TARGET,
        flexGrow: 1,
        flexBasis: '30%',
        paddingHorizontal: gameSpace.md,
        paddingVertical: gameSpace.sm,
        borderRadius: gameRadius.sm,
        borderWidth: 1,
        borderColor: available ? gamePalette.lineStrong : gamePalette.line,
        backgroundColor: available ? gamePalette.surface : 'transparent',
        opacity: pressed ? 0.85 : 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      })}
    >
      <Text
        {...decorative}
        style={[gameType.caption, { color: ink, fontWeight: '600', textAlign: 'center' }]}
      >
        {label}
      </Text>
      <Text {...decorative} style={[gameType.label, { color: gamePalette.quiet, letterSpacing: 0 }]}>
        {spent ? '—' : `×${count}`}
      </Text>
    </Pressable>
  );
}

/**
 * The ladder, as pips.
 *
 * A game show has the ladder on screen the whole time and it is most of the
 * tension; a phone in portrait cannot carry twelve money values beside a
 * question. So the rung values live on the mode screen and on the record, and
 * during play the ladder is a row of pips with the current rung filled and the
 * locked ones ringed — enough to see how far up you are and what is behind you.
 */
export function LadderRail({
  levels,
  current,
  safePoints,
  label,
}: {
  levels: number;
  current: number;
  safePoints: readonly number[];
  label: string;
}) {
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 1, max: levels, now: current }}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
    >
      {Array.from({ length: levels }, (_, i) => i + 1).map((level) => {
        const passed = level < current;
        const here = level === current;
        const safe = safePoints.includes(level);
        return (
          <View
            key={level}
            {...decorative}
            style={{
              flexGrow: 1,
              height: here ? 8 : 5,
              borderRadius: gameRadius.full,
              // `line` here read at 1.45:1 against the background, which is
              // to say the rungs still ahead were invisible and the ladder
              // could not be counted. A ladder you cannot count is a number in
              // a spec, not a game show.
              backgroundColor: here
                ? gamePalette.gold
                : passed
                  ? gamePalette.you
                  : gamePalette.lineStrong,
              borderWidth: safe ? 1 : 0,
              borderColor: gamePalette.gold,
            }}
          />
        );
      })}
    </View>
  );
}
