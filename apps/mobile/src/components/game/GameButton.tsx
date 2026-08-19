import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Pressable, Text, View } from 'react-native';
import { gamePalette, gameRadius, gameSpace, gameType } from '../../theme/game';
import { MIN_TOUCH_TARGET, selectionState } from '../../theme/a11y';

export type GameButtonTone = 'you' | 'plain' | 'quiet';

/**
 * Buttons for the game surface.
 *
 * `minHeight`, never a fixed height: the layout has to tolerate a 1.3x font
 * scale, and the old app shipped a fixed 52 that clipped.
 */
export function GameButton({
  label,
  onPress,
  tone = 'plain',
  style,
  accessibilityLabel,
  role = 'button',
  selected,
}: {
  label: string;
  onPress: () => void;
  tone?: GameButtonTone;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  /**
   * `radio` for one of a set of mutually exclusive choices. Colour alone
   * carries the current one otherwise, which is exactly the class of defect the
   * accessibility audit found shipped everywhere in the last product.
   */
  role?: 'button' | 'radio';
  selected?: boolean;
}) {
  const background =
    tone === 'you' ? gamePalette.you : tone === 'plain' ? gamePalette.surfaceAlt : 'transparent';
  const color =
    tone === 'you' ? gamePalette.onYou : tone === 'plain' ? gamePalette.ink : gamePalette.quiet;

  return (
    <Pressable
      accessibilityRole={role}
      accessibilityLabel={accessibilityLabel ?? label}
      {...(role === 'radio' ? selectionState(selected === true, 'radio') : {})}
      onPress={onPress}
      style={({ pressed }) => [
        {
          minHeight: 54,
          paddingVertical: gameSpace.md,
          paddingHorizontal: gameSpace.xl,
          borderRadius: gameRadius.md,
          backgroundColor: background,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: tone === 'quiet' ? 1 : 0,
          borderColor: gamePalette.lineStrong,
          opacity: pressed ? 0.82 : 1,
        },
        style,
      ]}
    >
      <Text style={[gameType.body, { color, fontWeight: '600', textAlign: 'center' }]}>
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * The keyboard- and screen-reader-operable route to a band.
 *
 * A two-thumb slider you can only drag is unusable without a pointer, and the
 * accessibility audit on the last product found exactly this class of defect
 * shipped everywhere. These also make a precise band possible for everyone,
 * which the drag does not.
 */
export function NudgeRow({
  onWider,
  onNarrower,
  widerLabel,
  narrowerLabel,
}: {
  onWider: () => void;
  onNarrower: () => void;
  widerLabel: string;
  narrowerLabel: string;
}) {
  return (
    <View style={{ flexDirection: 'row', gap: gameSpace.md }}>
      <GameButton
        label={narrowerLabel}
        tone="quiet"
        onPress={onNarrower}
        style={{ flex: 1, minHeight: MIN_TOUCH_TARGET }}
      />
      <GameButton
        label={widerLabel}
        tone="quiet"
        onPress={onWider}
        style={{ flex: 1, minHeight: MIN_TOUCH_TARGET }}
      />
    </View>
  );
}
