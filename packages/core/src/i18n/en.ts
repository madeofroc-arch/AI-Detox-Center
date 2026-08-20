/**
 * English domain strings.
 *
 * There is one table and it is empty, which is the honest shape rather than a
 * placeholder: the round catalog is AUTHORED in English, so English has
 * nothing to overlay onto it. `localizeRound` falls through to the round
 * itself, and `getCoreStrings('en')` returns a complete pack all the same, so
 * every caller can treat the two languages identically.
 *
 * This file used to derive labels for score bands, scoring factors, the usage
 * taxonomy, the challenge catalog and reflection prompts from the canonical
 * data structures. Those structures are gone with the tracker.
 */
import type { CoreStrings } from './types';

export const EN_STRINGS: CoreStrings = {
  locale: 'en',
  adversaryRounds: {},
};
