import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { gamePalette, gameRadius, gameSpace, gameType } from '../../theme/game';
import { MIN_TOUCH_TARGET, decorative, selectionState } from '../../theme/a11y';

/**
 * One of the four answers.
 *
 * The row is the whole interaction now, so it carries every state a level can
 * be in and does not move between them: the options sit where they sat while
 * the answer lands on top of them. A reveal that replaces the board with a
 * summary loses the only physical beat a four-option game has.
 *
 * Nothing here is red. A wrong answer goes quiet, the right one lights up, and
 * the row that was chosen keeps its outline so the player can see what they did
 * next to what was true. Red is for destructive actions, and a claim about a
 * number is not a verdict on the person (principle 7).
 */
export type OptionState =
  /** Untouched. */
  | 'idle'
  /** Provisionally locked, or re-picked after help. What is at stake. */
  | 'selected'
  /** Struck out by 50:50. */
  | 'eliminated'
  /** After the reveal: this was the answer. */
  | 'correct'
  /** After the reveal: this is what was submitted, and it was not the answer. */
  | 'chosenWrong';

export interface OptionRowProps {
  letter: string;
  value: string;
  state: OptionState;
  onPress: () => void;
  disabled?: boolean;
  /** The host named this one. Shown only once the host has been asked. */
  hostPick?: boolean;
  /** The friend named this one. */
  friendPick?: boolean;
  /** Whole per cent, once the audience has been asked. */
  audience?: number;
  /** Everything a screen reader needs, since the state is carried by colour. */
  accessibilityLabel: string;
}

const FILL: Record<OptionState, string> = {
  idle: gamePalette.surface,
  selected: gamePalette.surface,
  eliminated: gamePalette.bg,
  correct: gamePalette.youSoft,
  chosenWrong: gamePalette.surface,
};

const BORDER: Record<OptionState, string> = {
  idle: gamePalette.line,
  selected: gamePalette.gold,
  eliminated: gamePalette.line,
  correct: gamePalette.you,
  chosenWrong: gamePalette.lineStrong,
};

const INK: Record<OptionState, string> = {
  idle: gamePalette.ink,
  selected: gamePalette.ink,
  eliminated: gamePalette.quiet,
  correct: gamePalette.you,
  chosenWrong: gamePalette.quiet,
};

export function OptionRow({
  letter,
  value,
  state,
  onPress,
  disabled,
  hostPick,
  friendPick,
  audience,
  accessibilityLabel,
}: OptionRowProps) {
  const struck = state === 'eliminated' || state === 'chosenWrong';
  const ink = INK[state];

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={accessibilityLabel}
      {...selectionState(state === 'selected' || state === 'correct', 'radio')}
      accessibilityState={{ disabled: disabled === true }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 58,
        borderRadius: gameRadius.md,
        borderWidth: state === 'selected' || state === 'correct' ? 2 : 1,
        borderColor: BORDER[state],
        backgroundColor: FILL[state],
        opacity: state === 'eliminated' ? 0.45 : pressed ? 0.85 : 1,
        overflow: 'hidden',
        justifyContent: 'center',
      })}
    >
      {/* The audience, drawn behind the row rather than beside it: the bar is
          the answer's own weight, not a separate chart to read across. */}
      {audience !== undefined ? (
        <View
          {...decorative}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${audience}%`,
            backgroundColor: gamePalette.surfaceAlt,
          }}
        />
      ) : null}

      <View
        {...decorative}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: gameSpace.md,
          paddingHorizontal: gameSpace.lg,
          paddingVertical: gameSpace.md,
          minHeight: MIN_TOUCH_TARGET,
        }}
      >
        <Text
          style={[
            gameType.body,
            {
              color: ink,
              fontWeight: '700',
              width: 20,
              opacity: state === 'idle' ? 0.7 : 1,
            },
          ]}
        >
          {letter}
        </Text>
        <Text
          style={[
            gameType.argument,
            {
              color: ink,
              flexShrink: 1,
              flexGrow: 1,
              textDecorationLine: struck ? 'line-through' : 'none',
            },
          ]}
        >
          {value}
        </Text>

        {friendPick ? <Pip tone={gamePalette.you} label="F" /> : null}
        {hostPick ? <Pip tone={gamePalette.opponent} label="H" /> : null}
        {audience !== undefined ? (
          <Text style={[gameType.caption, { color: gamePalette.quiet, minWidth: 34, textAlign: 'right' }]}>
            {audience}%
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

/** A one-letter marker for who named this option. Decorative — the row's label says it. */
function Pip({ tone, label }: { tone: string; label: string }) {
  return (
    <View
      {...decorative}
      style={{
        width: 22,
        height: 22,
        borderRadius: gameRadius.full,
        borderWidth: 1,
        borderColor: tone,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={[gameType.label, { color: tone, letterSpacing: 0 }]}>{label}</Text>
    </View>
  );
}
