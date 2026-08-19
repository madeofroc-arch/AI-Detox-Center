/**
 * The round catalog.
 *
 * Static data. The shipped product performs no inference and needs no key —
 * that half of ADR-0004 is load-bearing and CI proves it. The other half (that
 * the content was authored without a model) was never claimed and is not:
 * candidates are generated, hand-graded, and shipped as the static set below.
 *
 * Two bars every bluff clears, and the second is the hard one:
 *   1. plausible enough to catch a smart, awake person;
 *   2. the reveal lands as "damn, got me" — never "that's a gotcha" or
 *      "that's ambiguous".
 *
 * The failure mode to design against is LEGIBILITY: templated rhetoric passes
 * bar 1 and fails bar 2 within about thirty rounds, because the player stops
 * reading the argument and starts reading the generator. Every authoring pass
 * is reviewed by someone whose only job is to find a rule like "whenever it
 * cites a total count, it is the constraint-that-does-not-bind template".
 *
 * See docs/product/adversary.md.
 */
import type { AdversaryRound } from './types';

export const ADVERSARY_CATALOG: readonly AdversaryRound[] = [
  {
    id: 'tr_daily_flights',
    domain: 'transport',
    question:
      'Roughly how many scheduled commercial passenger flights take off worldwide on an average day?',
    unit: 'flights per day',
    trueValue: 100_000,
    sourceNote: 'Scheduled departures tracked by OAG/IATA, mid-2020s; ~100,000 a day.',
    axisMin: 1_000,
    axisMax: 1_000_000,
    difficulty: 2,
    honest: {
      kind: 'honest',
      direction: 'too_high',
      argument:
        'The whole world has only about 5,000 commercial passenger aircraft in the air at any moment. Even at four or five flights per aircraft per day, that ceiling is a lot lower than most people guess.',
      verdict:
        'Sound. Fleet size times flights-per-aircraft-per-day really does bound this, and it lands in the right neighbourhood.',
    },
    bluff: {
      kind: 'bluff',
      direction: 'too_low',
      argument:
        'There are about 40,000 airports worldwide. Even a handful of departures each puts you well above your range — and that is before the major hubs, which run a departure a minute.',
      verdict:
        'A bluff. The airport count does not constrain the flight count in the direction it needs to: the great majority of those 40,000 are small fields with almost no scheduled traffic, and air travel is hub-concentrated by design.',
      fallacy: 'a real count applied where it does not bind',
    },
  },
  {
    id: 'en_beef_water',
    domain: 'energy',
    question:
      'Roughly how many litres of fresh water go into producing one kilogram of beef, counting the feed the animal ate?',
    unit: 'litres per kg',
    trueValue: 15_400,
    sourceNote: 'Water Footprint Network global average, ~15,400 L/kg including feed.',
    axisMin: 10,
    axisMax: 1_000_000,
    difficulty: 3,
    honest: {
      kind: 'honest',
      direction: 'too_low',
      argument:
        'Almost none of this is water the animal drinks. It is the water the feed crops took to grow, over the two or three years the animal is alive, and feed conversion for cattle is poor — several kilograms of grain per kilogram of meat.',
      verdict:
        'Sound. The feed dominates the total by orders of magnitude, and it is the part people leave out.',
    },
    bluff: {
      kind: 'bluff',
      direction: 'too_high',
      argument:
        'A cow drinks around 50 litres a day and lives about three years, so the animal itself accounts for something like 50,000 litres. Spread across the several hundred kilograms of meat it yields, the per-kilogram figure has to be modest.',
      verdict:
        'A bluff, and the arithmetic in it is fine — that is what makes it work. Drinking water is a rounding error here; the number is dominated by the water the feed crops consumed, which the argument quietly drops.',
      fallacy: 'a correct sub-total offered as the whole',
    },
  },
];
