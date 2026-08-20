/**
 * What a run is made of, decided up front and deterministically.
 *
 * The whole plan — which questions, in which order, on which levels the host
 * lies, and what each rung is worth — is fixed by the seed before the first
 * question is shown. Nothing about it responds to how the player is doing.
 * That is not a limitation: a ladder whose difficulty adapts to the player is a
 * ladder whose score means something different for every player, and the record
 * at the end has to be comparable to itself across runs or the diagnosis is
 * worthless.
 */
import { hashString } from '../hash';
import { fitsTier } from './quiz-board';
import type { QuizConfig, TierConfig } from './quiz-config';
import { levelValue } from './quiz-config';
import type { AdversaryRound } from './types';

export interface PlannedLevel {
  /** 1-based. */
  level: number;
  round: AdversaryRound;
  /**
   * Where this rung sits on the catalog's 1-5 scale. Kept after planning so a
   * swapped question can be replaced by one of comparable difficulty rather
   * than by whatever happens to be left.
   */
  targetDifficulty: number;
  /** Whether the host will bluff here, if asked. Fixed to the LEVEL, not the round. */
  hostBluffs: boolean;
  value: number;
}

export interface RunPlan {
  levels: readonly PlannedLevel[];
  /** Unused eligible rounds, ordered, available to `swap`. */
  reserve: readonly AdversaryRound[];
}

/**
 * Rounds this tier is allowed to draw.
 *
 * Two filters, and the second is not a formality: `fitsTier` rejects any round
 * whose option ladder would walk outside the authored axis at this tier's
 * spacing. That is what stops a board offering four thousand kilograms of CO2
 * from a litre of fuel — three self-eliminating options and a free answer for
 * a player who knows no chemistry.
 */
export function tierPool(
  catalog: readonly AdversaryRound[],
  tier: TierConfig,
): AdversaryRound[] {
  return catalog.filter((r) => r.band === tier.band && fitsTier(r, tier));
}

/**
 * Which levels the host bluffs on.
 *
 * Balanced rather than rolled per level, for the reason the v1 session splitter
 * gave: a per-level coin flip is deterministic but can hand out five bluffs in
 * a row, and once "the host is always lying" is true for a run, the Nerve grid
 * stops measuring anything. The count is exact for the tier's rate; which
 * levels get them is unpredictable to the player and fixed for the seed.
 */
export function bluffLevels(seed: string, tier: TierConfig): number[] {
  const count = Math.round(tier.levels * tier.hostBluffRate);
  if (count <= 0) return [];
  return Array.from({ length: tier.levels }, (_, i) => i + 1)
    .map((level) => ({ level, key: hashString(`bluff:${seed}:${tier.id}:${level}`) }))
    .sort((a, b) => a.key - b.key || a.level - b.level)
    .slice(0, count)
    .map((entry) => entry.level)
    .sort((a, b) => a - b);
}

/**
 * Plan a run.
 *
 * Every mode draws from exactly one school band, so the ramp runs across that
 * band's own 1-5 spread rather than across the catalog's: each rung takes the
 * unplayed round nearest its target, gentlest first. Sorting the pool instead
 * would look like a ramp and quietly truncate it — a twelve-rung mode would
 * fill every rung from the gentlest end and the hardest questions in the band
 * would never appear in it.
 *
 * Unplayed rounds are preferred and the constraint relaxes rather than failing
 * — a player who has seen the whole catalog gets repeats, not an error.
 */
export function planRun(
  seed: string,
  catalog: readonly AdversaryRound[],
  playedIds: readonly string[],
  tier: TierConfig,
  config: QuizConfig,
): RunPlan {
  const eligible = tierPool(catalog, tier);
  if (eligible.length === 0) {
    throw new Error(
      `No catalog rounds can produce a board for tier ${tier.id} ` +
        `(band ${tier.band}, ${tier.bluffSteps} bluff step(s))`,
    );
  }

  const recent = new Set(playedIds.slice(-config.avoidRecentCount));
  const fresh = eligible.filter((r) => !recent.has(r.id));
  const pool = fresh.length >= tier.levels ? fresh : eligible;

  // Sorted by id first so the pick depends on the seed and not on the order the
  // catalog file happens to be written in.
  const remaining = [...pool]
    .sort((a, b) => (a.id < b.id ? -1 : 1))
    .map((round) => ({ round, key: hashString(`run:${seed}:${tier.id}:${round.id}`) }))
    .sort((a, b) => a.key - b.key || (a.round.id < b.round.id ? -1 : 1))
    .map((entry) => entry.round);

  const bluffs = new Set(bluffLevels(seed, tier));
  const levels: PlannedLevel[] = [];
  const span = tier.levels > 1 ? tier.levels - 1 : 1;

  for (let i = 0; i < tier.levels; i += 1) {
    // The ramp runs across the band's own 1-5 spread: gentlest question in the
    // band first, hardest last.
    const targetDifficulty = 1 + (4 * i) / span;
    const chosen = nearestByDifficulty(remaining, targetDifficulty);
    if (chosen === null) break;
    remaining.splice(remaining.indexOf(chosen), 1);
    levels.push({
      level: i + 1,
      round: chosen,
      targetDifficulty,
      hostBluffs: bluffs.has(i + 1),
      value: levelValue(tier, i + 1),
    });
  }

  return { levels, reserve: remaining };
}

/**
 * The unplayed round closest to a target difficulty. Ties keep the seeded
 * order, so this stays deterministic.
 */
export function nearestByDifficulty(
  rounds: readonly AdversaryRound[],
  target: number,
): AdversaryRound | null {
  if (rounds.length === 0) return null;
  return rounds.reduce((best, candidate) =>
    Math.abs(candidate.difficulty - target) < Math.abs(best.difficulty - target) ? candidate : best,
  );
}
