/**
 * Tuning for the four modes.
 *
 * Every number the run uses lives here and never in an algorithm body
 * (CLAUDE.md rule 5). The tier table is the difficulty curve, and it is meant
 * to be read as one: each row is a claim about what that mode asks of a player.
 */
import type { Inventory, LifelineId, TierId } from './quiz-types';

export const QUIZ_CONFIG_VERSION = 1;

export interface TierConfig {
  id: TierId;
  /** Rounds are drawn from this slice of the catalog's difficulty scale. */
  minDifficulty: number;
  maxDifficulty: number;
  /**
   * How many option-slots separate the truth from the figure the bluff argues
   * for, which is what sets the gap between neighbouring options.
   *
   * One slot means the step IS the bluff's displacement — a wide board. Two
   * means the step is its square root — a tight one. Three is not available:
   * it would force the true answer to an end of the board on every round,
   * which halves the search space for a player who noticed.
   *
   * See `quiz-board.ts` for why the spacing comes from the round rather than
   * from a per-tier constant, and for the honest consequence: these four modes
   * differ mainly by pool, economy and how often the host lies.
   */
  bluffSteps: 1 | 2;
  /**
   * Bounds on the round's own displacement, so a mode can prefer boards whose
   * trap sits far from the truth or close to it. `easy` takes only the wide
   * ones; `ultimate` only the tight ones.
   */
  minDisplacement: number;
  maxDisplacement: number;
  /**
   * How far outside the round's authored axis an option may sit.
   *
   * The axis exists to keep options physically possible — without it a board
   * offered four thousand kilograms of CO2 from a litre of fuel weighing less
   * than one, and three options eliminated themselves. But the axes were
   * authored to bracket a draggable band, not to bracket a four-rung ladder,
   * and applied literally they reject most of the catalog. A factor of a few is
   * the margin that keeps the absurd out while leaving the boards buildable;
   * the failure it guards against was two orders of magnitude past the axis,
   * not a factor of three.
   */
  axisTolerance: number;
  /** Rungs on the ladder. Stated before the run starts, and the run ends there. */
  levels: number;
  /** Wrong answers survived. Running out ends the run. */
  lives: number;
  startingInventory: Inventory;
  /**
   * Clearing one of these locks the bank at whatever it held at that moment.
   *
   * This is not loss aversion in the sense principle 8 bans. Nothing is taken
   * away that was ever presented as owned: the ladder is stated in full before
   * the first question, the fallback level is stated with it, and there is no
   * escalating threat, no timer, and nothing to lose by walking away. It is the
   * shape that makes "keep going or bank it" a real decision, and that decision
   * is the only calibration signal a four-option game has.
   */
  safePoints: readonly number[];
  /**
   * The share of levels on which the host argues fluently for the wrong option.
   *
   * The escalation across tiers is the curriculum. In `easy` the host is a
   * genuine help and the player learns to use it; by `ultimate` it is a coin
   * flip whether the help is poison. Each tier states its own rate in words
   * before the run — not to make the host avoidable, but because the finding
   * this game exists to produce is that people take fluent confident prose
   * even when they have been told it is unreliable. That is exactly the
   * situation with a real model, and hiding the rate would make the game a
   * trick rather than a mirror.
   */
  hostBluffRate: number;
  /** The first rung's value. */
  baseValue: number;
  /** Each rung is worth this multiple of the one below, rounded to 2 significant figures. */
  ladderGrowth: number;
}

export interface QuizConfig {
  version: number;
  tiers: Record<TierId, TierConfig>;
  /**
   * What each lifeline costs, as a multiplier on the level's value. Compounds
   * when several are spent on one level.
   *
   * Everything that names an answer costs the same. An earlier draft made the
   * host the cheapest on the argument that the most fluent help should also be
   * the most tempting — true about the world, and fatal to the measurement:
   * with the host strictly cheapest, reaching for it first is simply correct
   * arithmetic, and `host_first` would fire for every player who read the price
   * list. The temptation has to come from what the host says.
   */
  lifelineCost: Record<LifelineId, number>;
  /** A lifeline is granted after every this-many cleared levels. */
  grantEveryLevels: number;
  /** Ceiling on any one lifeline, so a grant cannot become 50:50 spam. */
  maxPerLifeline: number;
  /** How many recently played round ids to avoid across runs. */
  avoidRecentCount: number;
}

export const DEFAULT_QUIZ_CONFIG: QuizConfig = {
  version: QUIZ_CONFIG_VERSION,
  tiers: {
    easy: {
      id: 'easy',
      minDifficulty: 1,
      maxDifficulty: 3,
      bluffSteps: 1,
      minDisplacement: 2.5,
      maxDisplacement: Infinity,
      axisTolerance: 4,
      levels: 8,
      lives: 3,
      startingInventory: { fiftyFifty: 1, friend: 1, host: 2, swap: 1 },
      safePoints: [4],
      hostBluffRate: 0,
      baseValue: 100,
      ladderGrowth: 1.35,
    },
    normal: {
      id: 'normal',
      minDifficulty: 1,
      maxDifficulty: 4,
      bluffSteps: 1,
      minDisplacement: 1,
      maxDisplacement: Infinity,
      axisTolerance: 4,
      levels: 10,
      lives: 2,
      startingInventory: { fiftyFifty: 1, friend: 1, audience: 1, host: 2 },
      safePoints: [4, 8],
      hostBluffRate: 0.3,
      baseValue: 200,
      ladderGrowth: 1.45,
    },
    hard: {
      id: 'hard',
      minDifficulty: 2,
      maxDifficulty: 5,
      bluffSteps: 2,
      minDisplacement: 1,
      maxDisplacement: Infinity,
      axisTolerance: 4,
      levels: 12,
      lives: 2,
      startingInventory: { fiftyFifty: 1, audience: 1, host: 2 },
      safePoints: [6],
      hostBluffRate: 0.5,
      baseValue: 500,
      ladderGrowth: 1.5,
    },
    ultimate: {
      id: 'ultimate',
      minDifficulty: 2,
      maxDifficulty: 5,
      bluffSteps: 2,
      minDisplacement: 1,
      // Only rounds whose trap lands close to the truth, which is what makes
      // the board tight enough that a rough idea cannot survive it.
      maxDisplacement: 8,
      axisTolerance: 4,
      levels: 12,
      lives: 1,
      startingInventory: { fiftyFifty: 1, host: 2 },
      // One rung is locked. A mode with none and a single life is a
      // thirty-second run that ends at zero, which is not a hard game.
      safePoints: [5],
      hostBluffRate: 0.5,
      baseValue: 1000,
      ladderGrowth: 1.6,
    },
  },
  lifelineCost: {
    // 50:50 leaves two options rather than naming one, so it buys less and
    // costs less.
    fiftyFifty: 0.6,
    // The three that name an answer are priced identically, and that is a
    // correction rather than a tidy-up. Pricing the host cheapest made it the
    // arithmetically correct first reach for every player, which turned the
    // `host_first` finding into a reading of the price list rather than of the
    // person. The host should be tempting because of what it says, not because
    // of what it costs.
    friend: 0.7,
    audience: 0.7,
    host: 0.7,
    // Swapping costs an item and a question, not points. Charging for it too
    // would make skipping a domain you do not know strictly worse than guessing
    // in it, and the domains a person walks away from are worth measuring.
    swap: 1,
  },
  grantEveryLevels: 5,
  maxPerLifeline: 3,
  avoidRecentCount: 40,
};

export const TIER_ORDER: readonly TierId[] = ['easy', 'normal', 'hard', 'ultimate'];

/** A deep copy, so a reset cannot alias the shared default. */
export function defaultQuizConfig(): QuizConfig {
  return {
    ...DEFAULT_QUIZ_CONFIG,
    tiers: {
      easy: { ...DEFAULT_QUIZ_CONFIG.tiers.easy },
      normal: { ...DEFAULT_QUIZ_CONFIG.tiers.normal },
      hard: { ...DEFAULT_QUIZ_CONFIG.tiers.hard },
      ultimate: { ...DEFAULT_QUIZ_CONFIG.tiers.ultimate },
    },
    lifelineCost: { ...DEFAULT_QUIZ_CONFIG.lifelineCost },
  };
}

/**
 * What a rung is worth. Growth is compounded by repeated multiplication rather
 * than `Math.pow`, which ECMA-262 leaves implementation-approximated; two
 * significant figures then makes the result identical on every engine and
 * readable on a ladder.
 */
export function levelValue(tier: TierConfig, level: number): number {
  let value = tier.baseValue;
  for (let n = 1; n < level; n += 1) value *= tier.ladderGrowth;
  return Number(value.toPrecision(2));
}

/** The whole ladder, which the player can see before starting. */
export function ladder(tier: TierConfig): number[] {
  return Array.from({ length: tier.levels }, (_, i) => levelValue(tier, i + 1));
}
