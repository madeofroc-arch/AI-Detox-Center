/**
 * The board for one level: four options, and what each lifeline says about
 * them.
 *
 * Everything here is derived from the round, the tier and the seed. Nothing is
 * authored per level, and nothing reads a clock or a random number generator,
 * so a board is reproducible and a bug report is a seed (CLAUDE.md rule 2).
 *
 * ## The spacing comes from the round, not from the tier
 *
 * The first version spaced options by a per-tier constant. An adversarial read
 * of the catalog killed it: every bluff argues its way to an explicit figure,
 * and a board spaced by anything other than that figure's displacement puts the
 * host's own conclusion off the board. Measured across the catalog, 26 of 30
 * bluffs would have named an option their closing sentence forbids — several
 * refuting themselves inside one card — and the player would learn the only
 * rule that matters: *if the argument's number is not one of the four, it is
 * bluffing.* That is `docs/product/adversary.md`'s named death condition, where
 * the player stops evaluating arguments and starts reading the generator.
 *
 * So the step is the bluff's own displacement, `bluffValue / trueValue`, and the
 * option the host names when it bluffs is the figure it argued for. The tier
 * chooses how many steps out the bluff sits: one step apart is a wide board
 * (the step is the whole displacement), two steps is a tight one (the step is
 * its square root). Three would force the true answer to an end of the board
 * every time, which halves the search space for free, so two is the limit.
 *
 * The consequence is honest and worth stating: **the four modes differ mainly
 * by question pool, economy, and how often the host lies — not by four distinct
 * option spacings.** The authored bluffs support two. Widening that needs new
 * pushback prose, not a new multiplier.
 *
 * ## Options are uniformly spaced and stay inside the round's own axis
 *
 * Uniform spacing is the least leaky arrangement available: on any board where
 * one option is placed differently from the rest, a player can find the odd one
 * out and halve the search space knowing nothing about the subject.
 *
 * And every option is clamped into the round's authored `axisMin`/`axisMax`.
 * Without that clamp the ladder walks straight out of physical possibility —
 * a board for `en_petrol_co2_per_litre` offered 4,000 kg of CO2 from a litre of
 * fuel weighing 0.75 kg, so three of the four options eliminated themselves and
 * a player who knew no chemistry scored 100%.
 */
import { hashString } from '../challenges/selection';
import type { QuizConfig, TierConfig } from './quiz-config';
import type { AdversaryRound, SchoolBand } from './types';
import type { AudienceShares, FriendCall, HostCall, QuizLevel } from './quiz-types';

/**
 * Two significant figures, via `toPrecision`, whose result ECMA-262 specifies
 * exactly rather than leaving implementation-approximated.
 */
export function twoSigFigs(value: number): number {
  return Number(value.toPrecision(2));
}

/**
 * How far the bluff's own arithmetic sits from the truth, as a multiple above
 * one. This is the round's natural difficulty: a trap that lands 1.6x from the
 * answer is a harder board than one that lands 90x away.
 */
export function displacement(round: AdversaryRound): number {
  const value = round.bluff.bluffValue;
  if (value === undefined || value <= 0 || round.trueValue <= 0) return 0;
  const ratio = value / round.trueValue;
  return ratio > 1 ? ratio : 1 / ratio;
}

/**
 * The gap between neighbouring options.
 *
 * Quantised to nine digits before anything uses it: `Math.sqrt` is
 * implementation-approximated by the letter of the spec, and a board that
 * differs in the last ulp between engines is a board that is not reproducible
 * from its seed. Two significant figures downstream would almost certainly hide
 * it anyway; almost is not the standard this package holds elsewhere.
 */
export function stepFor(round: AdversaryRound, tier: TierConfig): number {
  const d = displacement(round);
  if (d <= 1) return 0;
  return tier.bluffSteps <= 1 ? d : Number(Math.sqrt(d).toPrecision(9));
}

/** Multiply or divide `steps` times. No `Math.pow` — see `twoSigFigs`. */
function walk(from: number, step: number, steps: number, up: boolean): number {
  let value = from;
  for (let i = 0; i < steps; i += 1) value = up ? value * step : value / step;
  return value;
}

/**
 * Which slots the true answer may occupy on this board.
 *
 * Two constraints, and a round that satisfies neither has no board at this tier:
 *
 *  - The host must have somewhere to point. A bluff whose `direction` is
 *    `too_high` claims the answer is lower than it looks, so the truth needs
 *    `bluffSteps` slots below it; otherwise the host would argue downward and
 *    then name a higher option, which reads as a bug rather than as a bluff.
 *  - Every option has to stay inside the round's authored axis, which is what
 *    keeps the board physically possible.
 */
export function allowedSlots(round: AdversaryRound, tier: TierConfig): number[] {
  const step = stepFor(round, tier);
  if (step <= 1) return [];

  const ceiling = round.axisMax * tier.axisTolerance;
  const floor = round.axisMin / tier.axisTolerance;
  let up = 0;
  while (up < 3 && walk(round.trueValue, step, up + 1, true) <= ceiling) up += 1;
  let down = 0;
  while (down < 3 && walk(round.trueValue, step, down + 1, false) >= floor) down += 1;

  const below = round.bluff.direction === 'too_high';
  const slots: number[] = [];
  for (let i = 0; i <= 3; i += 1) {
    if (i > down || 3 - i > up) continue;
    if (below ? i < tier.bluffSteps : i + tier.bluffSteps > 3) continue;
    slots.push(i);
  }
  return slots;
}

/**
 * Whether this round can be shown at this tier at all.
 *
 * Only feasibility now. Modes used to filter on displacement as well, to give
 * four modes four board widths out of one flat catalog; the bands do that job
 * directly, because an elementary bluff is authored to land far from the truth
 * and a university one close to it. Filtering on both would drop rounds twice
 * for the same reason.
 */
export function fitsTier(round: AdversaryRound, tier: TierConfig): boolean {
  return round.band === tier.band && allowedSlots(round, tier).length > 0;
}

/**
 * How hard a round is on one absolute scale, for the lifelines that need one.
 *
 * The band dominates and the within-band difficulty nudges: a gentle university
 * question is still harder than a hard elementary one, which is the whole point
 * of banding.
 */
export function absoluteDifficulty(round: AdversaryRound): number {
  const anchors: Record<SchoolBand, number> = {
    elementary: 1.4,
    middle: 2.4,
    high: 3.6,
    university: 4.6,
  };
  return anchors[round.band] + (round.difficulty - 3) * 0.15;
}

/** Build one level's board. Deterministic in `(seed, round, tier)`. */
export function buildLevel(
  seed: string,
  round: AdversaryRound,
  tier: TierConfig,
  level: number,
  value: number,
  hostBluffs: boolean,
): QuizLevel {
  const slots = allowedSlots(round, tier);
  if (slots.length === 0) {
    throw new Error(`Round ${round.id} has no board at tier ${tier.id}`);
  }

  // The tier is in the hash: without it, replaying a seed on another mode would
  // hand back the same answer slots, and one run would be a partial map of
  // every other run on that seed.
  const correctIndex = slots[hashString(`slot:${seed}:${tier.id}:${round.id}`) % slots.length]!;
  const step = stepFor(round, tier);
  const options: number[] = [];
  for (let i = 0; i < 4; i += 1) {
    options.push(
      twoSigFigs(walk(round.trueValue, step, Math.abs(i - correctIndex), i > correctIndex)),
    );
  }

  for (let i = 1; i < options.length; i += 1) {
    if (options[i]! <= options[i - 1]!) {
      throw new Error(`Board for ${round.id} at ${tier.id} is not strictly ascending`);
    }
  }

  const below = round.bluff.direction === 'too_high';
  return {
    level,
    round,
    options,
    correctIndex,
    bluffIndex: below ? correctIndex - tier.bluffSteps : correctIndex + tier.bluffSteps,
    hostKind: hostBluffs ? 'bluff' : 'honest',
    value,
  };
}

/**
 * Whole-percent shares that sum to exactly 100, apportioned by largest
 * remainder — the same discipline the score breakdown uses, and for the same
 * reason: a player reading four percentages off a bar chart must be able to add
 * them up.
 */
function toWholePercents(weights: readonly number[]): number[] {
  const total = weights.reduce((sum, w) => sum + w, 0);
  const exact = weights.map((w) => (w / total) * 100);
  const whole = exact.map((v) => Math.floor(v));
  const order = exact
    .map((v, index) => ({ index, remainder: v - Math.floor(v) }))
    .sort((a, b) => b.remainder - a.remainder || a.index - b.index);
  let leftover = 100 - whole.reduce((sum, v) => sum + v, 0);
  for (const { index } of order) {
    if (leftover <= 0) break;
    whole[index]! += 1;
    leftover -= 1;
  }
  return whole;
}

/** Linear interpolation across the absolute 1-5 difficulty scale. */
function byDifficulty(difficulty: number, atEasiest: number, atHardest: number): number {
  const t = Math.min(1, Math.max(0, (difficulty - 1) / 4));
  return atEasiest + (atHardest - atEasiest) * t;
}

/** The wrong options, ascending. Always three of them. */
function wrongSlots(level: QuizLevel): number[] {
  return [0, 1, 2, 3].filter((i) => i !== level.correctIndex);
}

/**
 * Which wrong option the crowd piles onto.
 *
 * Usually the bluff's target — the intuitive reading is what a crowd converges
 * on, and the catalog already contains it, so this lifeline needs no content of
 * its own. But not always, and that matters: an audience that landed on the
 * bluff's target every single time would be a free bluff detector, since a
 * player could buy the crowd, note its favourite, then buy the host and read
 * "names the crowd's pick" as "lying". Seeded, it lands elsewhere often enough
 * that the inference costs two lifelines and is still wrong sometimes.
 */
function crowdError(seed: string, level: QuizLevel): number {
  const others = wrongSlots(level).filter((i) => i !== level.bluffIndex);
  const roll = hashString(`crowd:${seed}:${level.round.id}`) % 3;
  return roll < 2 || others.length === 0 ? level.bluffIndex : others[roll % others.length]!;
}

/**
 * What the audience says.
 *
 * Everyone gets a floor of support; the crowd then piles onto the true answer
 * and onto one wrong one, and which pile is taller flips as the question gets
 * harder. On an easy question the crowd is a good guide. On a hard one its top
 * pick is more often the trap than the answer, because the trap is the
 * intuitive reading.
 *
 * A player who works out "on a hard question the crowd's favourite is usually
 * the trap" has learned something real and paid a lifeline for it. That is a
 * strategy, not an exploit.
 */
export function audienceShares(seed: string, level: QuizLevel): AudienceShares {
  const difficulty = absoluteDifficulty(level.round);
  const weights = [1, 1, 1, 1];
  weights[level.correctIndex]! += byDifficulty(difficulty, 6, 0.9);
  weights[crowdError(seed, level)]! += byDifficulty(difficulty, 0.6, 2.6);
  const percents = toWholePercents(weights);
  return [percents[0]!, percents[1]!, percents[2]!, percents[3]!] as AudienceShares;
}

/** The confidences the friend is willing to state, by how hard the question is. */
const FRIEND_CONFIDENCES = [0.5, 0.6, 0.7, 0.8, 0.9] as const;

/**
 * What the friend says.
 *
 * The friend is the honest source, and their honesty is mechanical rather than
 * rhetorical: **the stated confidence is calibrated.** When the friend says 70%
 * they are right 70% of the time, by construction, and `quiz-board.test.ts`
 * measures it across the catalog rather than trusting the derivation.
 *
 * That is the entire point of this lifeline. The host is fluent, never hedges,
 * and is wrong as often as the tier says; the friend hedges, sounds much less
 * impressive, and is worth exactly what they claim to be worth. A player who
 * notices which of the two deserved their trust has had the product's whole
 * argument made to them by playing rather than by being told.
 */
export function friendCall(seed: string, level: QuizLevel): FriendCall {
  const round = level.round;
  // Harder questions push the friend toward the low end of what they will claim.
  const ceiling = Math.round(byDifficulty(absoluteDifficulty(round), 4, 1));
  const pick = hashString(`friend-conf:${seed}:${round.id}`) % (ceiling + 1);
  const confidence = FRIEND_CONFIDENCES[pick]!;

  const roll = hashString(`friend-roll:${seed}:${round.id}`) % 1000;
  if (roll < Math.round(confidence * 1000)) {
    return { index: level.correctIndex, confidence };
  }

  // When the friend is wrong they are wrong the way a thoughtful person is
  // wrong — on the reading the question invites.
  const weighted = [level.bluffIndex, level.bluffIndex, ...wrongSlots(level)];
  return {
    index: weighted[hashString(`friend-miss:${seed}:${round.id}`) % weighted.length]!,
    confidence,
  };
}

/**
 * What the host says. The argument comes straight from the catalog; only which
 * option it is attached to is computed, and by construction that option is the
 * figure the argument itself reasons to.
 */
export function hostCall(level: QuizLevel): HostCall {
  const pushback = level.hostKind === 'bluff' ? level.round.bluff : level.round.honest;
  return {
    index: level.hostKind === 'bluff' ? level.bluffIndex : level.correctIndex,
    kind: level.hostKind,
    argument: pushback.argument,
  };
}

/**
 * Which two options 50:50 strikes out.
 *
 * It usually leaves the bluff's target standing, because leaving the most
 * plausible wrong answer is what makes the lifeline a dilemma rather than a
 * gift. Not always, for the reason `crowdError` gives: a survivor set that was
 * always {truth, trap} would let a player spend 50:50 and then the host and
 * read the host's honesty off which option it named.
 */
export function fiftyFiftyEliminations(seed: string, level: QuizLevel): number[] {
  const kept = crowdError(`fifty:${seed}`, level);
  return wrongSlots(level).filter((i) => i !== kept);
}

/** Every lifeline's output for a level, for a caller that wants them together. */
export function boardHelp(seed: string, level: QuizLevel, config: QuizConfig) {
  void config;
  return {
    audience: audienceShares(seed, level),
    friend: friendCall(seed, level),
    host: hostCall(level),
    fiftyFifty: fiftyFiftyEliminations(seed, level),
  };
}
