import React from 'react';
import { Text, View } from 'react-native';
import { gamePalette, gameRadius, gameSpace, gameType } from '../../theme/game';
import { decorative, group } from '../../theme/a11y';

/**
 * The hint ladder, drawn as the show's money tower.
 *
 * During a run the ladder is a row of pips, because a phone in portrait cannot
 * carry twelve values beside a question (`LadderRail`). The record has the
 * whole screen, so here it gets the tower: every rung listed, the one the
 * prescription lands on lit, the rest legible around it.
 *
 * ## Rung 1 is at the top, and the numbers count downward
 *
 * This is the trap documented in `quiz-diagnosis.ts`: in `ladder.yaml` a HIGHER
 * number means MORE help (1 Orient, 5 Full answer), while the prose everywhere
 * else calls the less-help direction "up". Numbering the rows 5-at-the-top
 * would make the picture agree with the integers and disagree with every
 * sentence around it; drawing 1 at the top makes climbing mean what the product
 * means by it — principle 4, the best outcome is needing this less.
 *
 * ## Rung 5 is the guaranteed rung, and it is gold for the same reason a safe
 * point is
 *
 * A show's safe point is the rung you cannot fall below. Here the bottom rung
 * is the one that can always be reached: "just give me the answer" works
 * instantly, every time, with no lecture (`ladder.yaml`, the one rule not up
 * for negotiation). Marking it gold is the same promise the mode screen makes
 * about 保底 — not decoration, the same fact.
 */
export interface RungRow {
  level: number;
  name: string;
  gives: string;
}

export function RungTower({
  rungs,
  current,
  hereLabel,
  alwaysOpenLabel,
  label,
}: {
  rungs: readonly RungRow[];
  /** Where this person's conversations start. */
  current: number;
  hereLabel: string;
  alwaysOpenLabel: string;
  /** One sentence for a screen reader, since the rows themselves are visual. */
  label: string;
}) {
  const bottom = rungs.length > 0 ? Math.max(...rungs.map((r) => r.level)) : 0;

  return (
    <View {...group(label)} style={{ gap: 3 }}>
      {rungs.map((rung) => {
        const here = rung.level === current;
        const guaranteed = rung.level === bottom;
        return (
          <View
            key={rung.level}
            {...decorative}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: gameSpace.md,
              paddingVertical: gameSpace.sm,
              paddingHorizontal: gameSpace.md,
              borderRadius: gameRadius.sm,
              backgroundColor: here ? gamePalette.surface : 'transparent',
              borderLeftWidth: 3,
              borderLeftColor: here
                ? gamePalette.gold
                : guaranteed
                  ? gamePalette.gold
                  : gamePalette.line,
            }}
          >
            <Text
              {...decorative}
              style={[
                gameType.figure,
                {
                  fontSize: 20,
                  lineHeight: 26,
                  width: 22,
                  textAlign: 'center',
                  color: here ? gamePalette.gold : gamePalette.quiet,
                },
              ]}
            >
              {rung.level}
            </Text>
            <View style={{ flex: 1, gap: 1 }}>
              <Text
                {...decorative}
                style={[
                  gameType.body,
                  {
                    fontWeight: '600',
                    color: here ? gamePalette.gold : gamePalette.ink,
                  },
                ]}
              >
                {rung.name}
                {here ? ` · ${hereLabel}` : ''}
              </Text>
              <Text
                {...decorative}
                style={[
                  gameType.caption,
                  { color: here ? gamePalette.inkMuted : gamePalette.quiet },
                ]}
              >
                {guaranteed ? `${rung.gives} · ${alwaysOpenLabel}` : rung.gives}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
