import { describe, expect, it } from 'vitest';
import { ADVERSARY_CATALOG, SCHOOL_BANDS, getCoreStrings, localizeRound } from '../src/index';
import type { AdversaryRound, SchoolBand } from '../src/index';

/**
 * The catalog's named death condition, as a gate.
 *
 * `catalog.ts` says it in words: the failure mode to design against is
 * LEGIBILITY — the player stops evaluating the argument and starts reading the
 * generator. Every other gate in this repo watches the arithmetic. This one
 * watches the prose, because the worst defect this content ever shipped was
 * invisible to all of them.
 *
 * ## The rule a player would actually form
 *
 * A reader checking the 繁體中文 localisation found that honest arguments open
 * by correcting where to anchor — "Anchor on people, not on shops", "Count the
 * cycle, not the crank" — far more often than bluffs do. Measured over the
 * catalog as it then stood, that opener fronted 12 honest arguments and 0
 * bluffs: a rule that won twelve rounds and lost none, available to someone who
 * never read past the first sentence.
 *
 * ## Why the detector is deliberately crude
 *
 * It is a substring match on a handful of words, which will over-fire on an
 * idiom (「規模遠遠不是運算能比的」 is a comparison, not a corrective anchor) and
 * under-fire on a construction nobody listed. That is the point: it is the rule
 * a PLAYER would form after a dozen rounds, not a linguistic analysis. A
 * detector precise enough to be fair would be measuring something else.
 *
 * Because it is noisy, the assertion is about the NET result rather than any
 * single round. The heuristic must not pay: across the catalog, in either
 * language, it must not win more often than it loses. Per band it gets one
 * round of slack, which absorbs the noise without absorbing a real drift.
 *
 * ## What this cannot check
 *
 * Only one shape, the one that was found. Another tell — the self-licensing
 * clause, a difference in sentence length, a register that shifts when the host
 * is lying — would pass this file untouched. The defence against those is a
 * reader whose only job is to find a rule, which is how this one was found.
 */

const EN_CORRECTIVE = /\b(not|rather than|instead of|do not|don't|no one|never)\b/i;

/**
 * The 繁體中文 set is wider because Chinese spreads this shape over more forms:
 * 不必 and 不管 do the same work as "rather than" and "does not care about",
 * and a list that held only 不是 would score the two languages differently for
 * the same sentence.
 */
const ZH_CORRECTIVE = /(而不是|不是|不要|不必|不管|而非|並非|從來不|沒有人|絕不)/;

const enFirstSentence = (text: string): string => text.split(/(?<=[.?])\s/)[0] ?? '';
const zhFirstSentence = (text: string): string => text.split(/(?<=[。？])/)[0] ?? '';

interface Tally {
  honest: number;
  bluff: number;
  rounds: number;
}

function count(
  rounds: readonly AdversaryRound[],
  fires: (argument: string) => boolean,
): Record<SchoolBand, Tally> {
  const tally = Object.fromEntries(
    SCHOOL_BANDS.map((band) => [band, { honest: 0, bluff: 0, rounds: 0 }]),
  ) as Record<SchoolBand, Tally>;

  for (const round of rounds) {
    const cell = tally[round.band];
    cell.rounds += 1;
    if (fires(round.honest.argument)) cell.honest += 1;
    if (fires(round.bluff.argument)) cell.bluff += 1;
  }
  return tally;
}

const zhStrings = getCoreStrings('zh-TW');
const LANGUAGES = [
  {
    name: 'English',
    rounds: ADVERSARY_CATALOG,
    fires: (argument: string) => EN_CORRECTIVE.test(enFirstSentence(argument)),
  },
  {
    name: '繁體中文',
    rounds: ADVERSARY_CATALOG.map((round) => localizeRound(round, zhStrings)),
    fires: (argument: string) => ZH_CORRECTIVE.test(zhFirstSentence(argument)),
  },
] as const;

describe('no rule beats reading the argument', () => {
  for (const language of LANGUAGES) {
    describe(language.name, () => {
      const tally = count(language.rounds, language.fires);
      const total = SCHOOL_BANDS.reduce(
        (sum, band) => ({
          honest: sum.honest + tally[band].honest,
          bluff: sum.bluff + tally[band].bluff,
        }),
        { honest: 0, bluff: 0 },
      );

      it('does not let "pick the corrective opener" win more than it loses', () => {
        expect(
          total.honest,
          `the corrective opener fronts ${total.honest} honest arguments and ` +
            `${total.bluff} bluffs. A player who never reads past the first ` +
            'sentence wins on net, which is the death condition catalog.ts names. ' +
            'Move the shape onto some bluffs — they are themselves wrong anchors — ' +
            'or off some honest openings.',
        ).toBeLessThanOrEqual(total.bluff);
      });

      for (const band of SCHOOL_BANDS) {
        it(`keeps ${band} within one round of even`, () => {
          const { honest, bluff, rounds } = tally[band];
          expect(
            honest - bluff,
            `${band}: ${honest} honest and ${bluff} bluff openings correct an ` +
              `anchor, over ${rounds} rounds. One round of slack absorbs the ` +
              'detector being crude; two is a drift.',
          ).toBeLessThanOrEqual(1);
        });
      }

      it('has teeth — the detector fires on both sides somewhere', () => {
        // A regex that matched nothing would pass every assertion above while
        // measuring nothing at all.
        expect(total.honest, 'the detector never fired on an honest opening').toBeGreaterThan(0);
        expect(total.bluff, 'the detector never fired on a bluff opening').toBeGreaterThan(0);
      });
    });
  }

  it('measures every round in both languages', () => {
    // localizeRound falls back to English for an untranslated round, which
    // would quietly halve the 繁體中文 sample rather than fail.
    const untranslated = ADVERSARY_CATALOG.filter(
      (round) => zhStrings.adversaryRounds[round.id] === undefined,
    );
    expect(untranslated.map((r) => r.id)).toEqual([]);
  });
});
