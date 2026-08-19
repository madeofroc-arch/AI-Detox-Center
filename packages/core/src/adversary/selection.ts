/**
 * Session composition — deterministic from the seed.
 *
 * The same seed and the same play history always produce the same five rounds,
 * shown in the same order, each with the same argument. That is what makes a
 * bug report a seed, and what would let a shared daily round exist without a
 * server.
 */
import { hashString } from '../challenges/selection';
import type { AdversaryConfig } from './config';
import type { AdversaryRound, PushbackKind } from './types';

export interface SessionRound {
  round: AdversaryRound;
  /** Which of the round's two arguments this session shows. */
  pushback: PushbackKind;
}

/**
 * Pick the rounds for a session.
 *
 * Unplayed rounds are preferred and the constraint relaxes rather than failing,
 * the same progressive-relaxation shape the challenge selector uses — a player
 * who has seen the whole catalog gets repeats, not an error.
 */
export function selectSession(
  seed: string,
  catalog: readonly AdversaryRound[],
  playedIds: readonly string[],
  config: AdversaryConfig,
): SessionRound[] {
  if (catalog.length === 0) throw new Error('Adversary catalog is empty');

  const recent = new Set(playedIds.slice(-config.avoidRecentCount));
  const fresh = catalog.filter((r) => !recent.has(r.id));
  const pool = fresh.length >= config.roundsPerSession ? fresh : [...catalog];

  // Sorted by id first, so the pick depends on the seed and not on the order
  // the catalog file happens to be written in.
  const ordered = [...pool].sort((a, b) => (a.id < b.id ? -1 : 1));

  // Deterministic sample without replacement: score every candidate by a hash
  // of (seed, id) and take the lowest. Stable, order-independent, and it does
  // not need a shuffle whose semantics drift between implementations.
  const picked = ordered
    .map((round) => ({ round, key: hashString(`round:${seed}:${round.id}`) }))
    .sort((a, b) => a.key - b.key || (a.round.id < b.round.id ? -1 : 1))
    .slice(0, Math.min(config.roundsPerSession, ordered.length))
    .map((entry) => entry.round);

  // Ramp the session: easy first. Ties keep the seeded order.
  const ramped = [...picked].sort((a, b) => a.difficulty - b.difficulty);

  return assignPushbacks(seed, ramped);
}

/**
 * Decide which argument each round shows, balanced across the session.
 *
 * Balance is the point, not decoration. If bluffs were even slightly more
 * common than sound arguments, "always hold" would be the dominant strategy and
 * the Nerve grid would stop measuring anything. A per-round coin flip is
 * deterministic but can hand out five bluffs in a row; this splits the session
 * as evenly as its length allows and lets the seed decide who gets the odd one.
 */
export function assignPushbacks(
  seed: string,
  rounds: readonly AdversaryRound[],
): SessionRound[] {
  const n = rounds.length;
  const extraToBluff = hashString(`split:${seed}`) % 2 === 0;
  const bluffCount = Math.floor(n / 2) + (n % 2 === 1 && extraToBluff ? 1 : 0);

  // The bluffs go to the rounds with the lowest seeded key, so which rounds
  // bluff is unpredictable to the player but fixed for the seed.
  const bluffIds = new Set(
    rounds
      .map((round) => ({ id: round.id, key: hashString(`kind:${seed}:${round.id}`) }))
      .sort((a, b) => a.key - b.key || (a.id < b.id ? -1 : 1))
      .slice(0, bluffCount)
      .map((entry) => entry.id),
  );

  return rounds.map((round) => ({
    round,
    pushback: bluffIds.has(round.id) ? 'bluff' : 'honest',
  }));
}

/**
 * The band the slider opens at: the whole axis.
 *
 * Deliberately not a helpful default. A band pre-narrowed toward the answer
 * would be a hint, and one centred on the axis midpoint would quietly teach
 * that the midpoint is a reasonable guess — on a log axis it usually is not.
 */
export function openingBand(round: AdversaryRound): { lo: number; hi: number } {
  return { lo: round.axisMin, hi: round.axisMax };
}
