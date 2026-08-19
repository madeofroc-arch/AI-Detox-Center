/**
 * Scoring for The Adversary.
 *
 * ## The payout is a proper scoring rule, and that is not negotiable
 *
 * A calibration game scored by a rule you can beat teaches you to beat the
 * rule. The obvious design — "win points proportional to how narrow your band
 * is, nothing if you miss" — is exactly that: it elicits whatever coverage
 * level the payout slope happens to imply, not the 90% the screen is asking
 * for. So the rule here is the **Winkler interval score**, the standard proper
 * rule for interval forecasts, computed in log space because the axis is
 * logarithmic:
 *
 *     width   = log(hi) - log(lo)
 *     penalty = 0                            when the answer is inside
 *               (2/alpha) * (distance in log units past the nearer edge)
 *     loss    = width + penalty              lower is better
 *
 * with `alpha = 1 - claimedConfidence`. Points are an affine, decreasing
 * function of `loss` normalised by the axis span, which preserves properness:
 * stating anything other than your honest interval lowers your expected score.
 * `__tests__/adversary-scoring.test.ts` asserts that over a lattice of beliefs
 * rather than trusting the derivation.
 *
 * ## A missed band scores below zero, and it has to
 *
 * The first version of this floored the score at zero, on the reasoning that a
 * negative number is a punishment. The properness test failed immediately: with
 * a floor, a badly-missed narrow band costs no more than a slightly-missed one,
 * the tail penalty disappears, and stating an 80% band beats stating your
 * honest 90% one. A player would find that.
 *
 * No bounded rule can price interval width and also stay proper, because
 * arbitrarily bad misses have to cost arbitrarily much. So the floor went.
 *
 * It was also the timid instinct that produced the previous product. The
 * tension this game runs on is greed against fear while you narrow, and a
 * payout with no downside has no fear in it.
 *
 * This is a claim about a band, not about the player, so principle 7 is intact.
 *
 * ## Determinism
 *
 * `hit`, `nerve` and `missFactor` use plain comparison and division only, so
 * they are exact on every engine. Only the points number touches `Math.log10`,
 * which ECMA-262 leaves implementation-approximated — the reason this repo bans
 * transcendental math from the scoring path. It is admitted here because the
 * axis is genuinely logarithmic, and contained by quantising every log value
 * before any arithmetic: engines may disagree in the last ulp, and after
 * rounding to six decimals they cannot.
 */
import type { AdversaryConfig } from './config';
import type {
  AdversaryRecord,
  AdversaryRound,
  Band,
  NerveCell,
  PushbackKind,
  RoundResult,
} from './types';

/** See the determinism note above. */
const LOG_PRECISION = 1e6;
const ROUND_EPSILON = 1e-9;

function logq(value: number): number {
  return Math.round(Math.log10(value) * LOG_PRECISION) / LOG_PRECISION;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Pull a band inside the axis and put its edges in order.
 *
 * The UI cannot produce an inverted band, but a stored one from an older
 * version could, and a band with `lo >= hi` would make `width` negative and
 * hand out points for an impossible claim.
 */
export function normalizeBand(round: AdversaryRound, band: Band): Band {
  const lo = clamp(Math.min(band.lo, band.hi), round.axisMin, round.axisMax);
  const hi = clamp(Math.max(band.lo, band.hi), round.axisMin, round.axisMax);
  return { lo, hi };
}

/** Is the answer inside the band? Exact — comparison only, no logs. */
export function isHit(round: AdversaryRound, band: Band): boolean {
  const { lo, hi } = normalizeBand(round, band);
  return round.trueValue >= lo && round.trueValue <= hi;
}

/**
 * How far outside the band the answer fell, as a multiple. Exactly 1 on a hit.
 * Feeds the copy ("you were 6x low"), never the score.
 */
export function missFactor(round: AdversaryRound, band: Band): number {
  const { lo, hi } = normalizeBand(round, band);
  if (round.trueValue < lo) return lo / round.trueValue;
  if (round.trueValue > hi) return round.trueValue / hi;
  return 1;
}

/** The Winkler interval loss, in log space. Lower is better. Exposed for the properness test. */
export function intervalLoss(
  round: AdversaryRound,
  band: Band,
  config: AdversaryConfig,
): number {
  const { lo, hi } = normalizeBand(round, band);
  const alpha = 1 - config.claimedConfidence;
  const low = logq(lo);
  const high = logq(hi);
  const truth = logq(round.trueValue);

  const width = high - low;
  const penalty =
    truth < low
      ? (2 / alpha) * (low - truth)
      : truth > high
        ? (2 / alpha) * (truth - high)
        : 0;
  return width + penalty;
}

/**
 * Affine in `loss`, and deliberately unclamped below — see the note above. The
 * upper end needs no clamp either: `loss` is never negative, so this can never
 * exceed `maxPoints`.
 */
function pointsForLoss(round: AdversaryRound, loss: number, config: AdversaryConfig): number {
  const span = logq(round.axisMax) - logq(round.axisMin);
  if (span <= 0) return 0;
  return Math.round(config.maxPoints * (1 - loss / span) + ROUND_EPSILON);
}

/**
 * What this band pays IF the answer is inside — the number that climbs under
 * the thumb while you narrow, before any answer exists.
 *
 * It is the hit branch of the same rule that scores the round, not a separate
 * one, so the number you were watching is the number you get.
 */
export function potentialPoints(
  round: AdversaryRound,
  band: Band,
  config: AdversaryConfig,
): number {
  const { lo, hi } = normalizeBand(round, band);
  return pointsForLoss(round, logq(hi) - logq(lo), config);
}

/**
 * How wide the claim is, as a multiple: 12 means "somewhere in a 12x range".
 *
 * This is the second number under the thumb, and it is deliberately not a
 * points figure. The spec asked for "a payout that climbs and a risk that
 * climbs with it", and under a proper rule that second number does not exist:
 * narrowing raises the PROBABILITY of missing, not the penalty for a miss. In
 * points, a tighter band that misses by a fixed distance actually scores
 * slightly BETTER, because the width term is smaller. A "risk" number built
 * from the scoring rule would therefore fall as you narrowed, and a player
 * reading it would conclude that tightening reduces their downside.
 *
 * So the fear is stated as the claim instead: paired with the fixed "90% sure",
 * `12x` is exactly what the player is asserting, it tightens visibly under the
 * thumb, and it is something a person can actually reason about.
 */
export function bandFactor(round: AdversaryRound, band: Band): number {
  const { lo, hi } = normalizeBand(round, band);
  return lo > 0 ? hi / lo : Infinity;
}

/** What the player did, crossed with what the argument actually was. */
export function nerveCell(moved: boolean, pushback: PushbackKind): NerveCell {
  if (pushback === 'bluff') return moved ? 'taken' : 'heldFirm';
  return moved ? 'updated' : 'missedUpdate';
}

export interface RoundPlay {
  /** The band committed before the opponent spoke. */
  initialBand: Band;
  /** The band after the pushback. Same as `initialBand` when the player held. */
  band: Band;
  moved: boolean;
  /** Which of the round's two arguments was shown. */
  pushback: PushbackKind;
}

/** Resolve one played round into the result the record is rebuilt from. */
export function resolveRound(
  round: AdversaryRound,
  play: RoundPlay,
  config: AdversaryConfig,
): RoundResult {
  const band = normalizeBand(round, play.band);
  const base = pointsForLoss(round, intervalLoss(round, band, config), config);
  // The discount applies to winnings only. Scaling a loss down too would make
  // moving a hedge — it would buy cheaper downside — and "move whenever
  // unsure" would dominate. Moving costs you upside; it does not buy safety.
  const points =
    play.moved && base > 0
      ? Math.round(base * config.movedMultiplier + ROUND_EPSILON)
      : base;

  return {
    roundId: round.id,
    initialBand: normalizeBand(round, play.initialBand),
    band,
    moved: play.moved,
    pushback: play.pushback,
    hit: isHit(round, band),
    points,
    nerve: nerveCell(play.moved, play.pushback),
    missFactor: missFactor(round, band),
  };
}

const EMPTY_NERVE: Record<NerveCell, number> = {
  heldFirm: 0,
  missedUpdate: 0,
  updated: 0,
  taken: 0,
};

/**
 * The record, recomputed from results rather than accumulated — so no number on
 * screen can drift away from the rounds that produced it (acceptance
 * criterion 6).
 */
export function buildRecord(
  results: readonly RoundResult[],
  config: AdversaryConfig,
): AdversaryRecord {
  const nerve = { ...EMPTY_NERVE };
  let hits = 0;
  let points = 0;
  for (const r of results) {
    nerve[r.nerve] += 1;
    if (r.hit) hits += 1;
    points += r.points;
  }
  return {
    bands: results.length,
    hits,
    calibration: results.length === 0 ? null : hits / results.length,
    claimedConfidence: config.claimedConfidence,
    nerve,
    points,
  };
}
