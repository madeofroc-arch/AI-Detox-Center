/**
 * The Adversary, as a game show.
 *
 * Spec: docs/product/adversary.md.
 *
 * The interaction is four fixed options and a ladder of levels; the help you
 * can buy is a set of lifelines, one of which is an AI that sometimes argues
 * confidently for the wrong option. Everything here is data and pure
 * functions — no clock, no randomness — so a run is reproducible from its seed
 * plus the list of things the player did (CLAUDE.md rule 2).
 *
 * ## Why the options are derived rather than authored
 *
 * Every answer in the catalog is a magnitude, so the four options are placed at
 * uniform multiplicative spacing around the true value. Uniform spacing is not
 * a shortcut, it is the *least* leaky arrangement available: any non-uniform
 * board tells the player which option was placed differently from the rest,
 * which halves the search space without any knowledge of the subject.
 *
 * ## Why the host picks an option instead of the option being the host's number
 *
 * The bluff arguments reason to an approximate figure ("that lands under 30
 * billion"). Snapping an option onto that figure exactly would look staged and
 * would break uniform spacing. So the host reasons to its number and then names
 * the nearest option on its side — which is what a person does with a menu in
 * front of them.
 */
import type { RunPlan } from './quiz-selection';
import type { AdversaryRound, NerveCell, PushbackKind } from './types';

/** The four difficulty modes. */
export type TierId = 'easy' | 'normal' | 'hard' | 'ultimate';

/** The help a player can spend. */
export type LifelineId = 'fiftyFifty' | 'friend' | 'audience' | 'host' | 'swap';

export const LIFELINE_IDS: readonly LifelineId[] = [
  'fiftyFifty',
  'friend',
  'audience',
  'host',
  'swap',
];

/** How many of each lifeline are in hand. Absent means zero. */
export type Inventory = Readonly<Partial<Record<LifelineId, number>>>;

/**
 * One level's board: the question, the four values, and everything about it
 * that is fixed before the player touches it.
 *
 * `hostKind` is decided here rather than when the host is asked, so that asking
 * the host cannot be re-rolled by backing out of a level, and so the whole
 * board is reproducible from the seed.
 */
export interface QuizLevel {
  /** 1-based. The rung of the ladder. */
  level: number;
  round: AdversaryRound;
  /** Ascending. Always length 4. */
  options: readonly number[];
  correctIndex: number;
  /** The option the host names if it bluffs on this level. Never `correctIndex`. */
  bluffIndex: number;
  /** Whether the host will argue soundly or fluently and wrongly, if asked. */
  hostKind: PushbackKind;
  /** What clearing this level adds to the bank, before lifeline discounts. */
  value: number;
}

/** One spend, in the order it happened within a level. */
export interface LifelineUse {
  id: LifelineId;
  /** 1-based within the level. `order === 1` is what the player reached for first. */
  order: number;
}

/**
 * What the audience says: four shares that sum to 1.
 *
 * Derived, not authored. Mass sits on the correct option and on the bluff's
 * target — the seductive wrong answer already exists in the catalog, so the
 * crowd's characteristic error needs no new content — and shifts toward the
 * wrong one as the question gets harder. A crowd that is right on easy
 * questions and confidently wrong on hard ones is both realistic and the only
 * version of this lifeline that teaches anything.
 */
export type AudienceShares = readonly [number, number, number, number];

/** What the friend says. The friend hedges honestly; that is the whole point of them. */
export interface FriendCall {
  index: number;
  /** The friend's stated confidence, and it is calibrated — see `friendCall`. */
  confidence: number;
}

/** What the host says. */
export interface HostCall {
  index: number;
  kind: PushbackKind;
  /** The host's reasoning, from the catalog. Confident either way; never hedged. */
  argument: string;
}

/**
 * Whether the help was needed, crossed with whether it was taken.
 *
 * This is the measurement the old dependency score could never make, and it
 * needs no self-report: the provisional lock records what the player would have
 * answered before any lifeline existed, so the counterfactual is observed
 * rather than asked for.
 *
 *                   | instinct right   | instinct wrong
 *   no lifeline     | soloRight        | soloWrong
 *   lifeline spent  | aidedUnneeded    | aidedNeeded
 */
export type RelianceCell = 'soloRight' | 'soloWrong' | 'aidedUnneeded' | 'aidedNeeded';

export interface LevelResult {
  level: number;
  roundId: string;
  domain: string;
  difficulty: number;
  correctIndex: number;
  /** What was locked in before any lifeline was available. */
  instinctIndex: number;
  /** What was actually submitted. */
  finalIndex: number;
  /** In the order they were spent. */
  lifelines: readonly LifelineUse[];
  /** Round ids abandoned by `swap` before this one resolved. */
  swappedFrom: readonly string[];
  /** Set only when the host was asked. */
  host: HostCall | null;
  correct: boolean;
  /** Whether the instinct alone would have been correct. */
  instinctCorrect: boolean;
  /** Added to the bank. Zero on a wrong answer. */
  points: number;
  /**
   * The 2x2 the product exists to show. Null when the host was not asked, or
   * when the instinct already matched the host's pick — a level where the two
   * already agreed tests nothing.
   */
  nerve: NerveCell | null;
  reliance: RelianceCell;
}

/** Why a run stopped. Every run stops; principle 8 forbids one that does not. */
export type RunEnding = 'cleared' | 'outOfLives' | 'walkedAway';

/** The phase a run is in. The UI is a function of this. */
export type RunPhase =
  /** Reading the question; no lifeline is available until an option is tapped. */
  | 'instinct'
  /** An option is provisionally locked. Confirm it, or spend a lifeline. */
  | 'deciding'
  /** The answer has landed and is being read. */
  | 'reveal'
  /** A milestone was cleared; the player chooses a lifeline to add. */
  | 'grant'
  /** The run is over. */
  | 'over';

/**
 * Everything about a run in progress. A pure value: every transition in
 * `run.ts` takes one of these and returns a new one.
 */
export interface RunState {
  tier: TierId;
  seed: string;
  phase: RunPhase;
  /** 1-based index of the level being played. */
  level: number;
  board: QuizLevel;
  inventory: Inventory;
  livesLeft: number;
  /** Cleared levels, in order. */
  results: readonly LevelResult[];
  /** Points banked so far, from `results`. */
  bank: number;
  /** What the bank falls back to if the run ends badly. */
  guaranteed: number;
  /** Set once the run is over. */
  ending: RunEnding | null;
  /** Live within the current level. */
  instinctIndex: number | null;
  selectedIndex: number | null;
  spent: readonly LifelineUse[];
  /** Options struck out by 50:50. */
  eliminated: readonly number[];
  /** Round ids abandoned by `swap` on the current level. */
  swappedFrom: readonly string[];
  /** Set for the level just resolved, so the reveal can render it. */
  lastResult: LevelResult | null;
  /** How many lifeline grants are owed. Spent one at a time in the `grant` phase. */
  grantsOwed: number;
  /**
   * The whole run, decided from the seed before the first question. Kept in
   * state rather than recomputed so that a swap — which consumes a round from
   * the reserve — is recorded rather than re-derived.
   */
  plan: RunPlan;
}

/** The run, recomputed from its results — never accumulated. */
export interface RunRecord {
  tier: TierId;
  seed: string;
  ending: RunEnding;
  levelsCleared: number;
  levelsAttempted: number;
  bank: number;
  livesLost: number;
  nerve: Record<NerveCell, number>;
  reliance: Record<RelianceCell, number>;
  /** How many times each lifeline was spent. */
  lifelineUse: Record<LifelineId, number>;
  /** How many times each lifeline was the FIRST one reached for on a level. */
  firstReach: Record<LifelineId, number>;
  /** Levels where a lifeline was spent and the instinct was then abandoned for a worse answer. */
  talkedOut: number;
  /** Levels answered with no lifeline at all. */
  soloLevels: number;
  /** Levels where at least one lifeline was spent. */
  aidedLevels: number;
  /** Host asked and the host was bluffing. The denominator of the taken rate. */
  bluffsFaced: number;
  /** Host asked and the host was sound. The denominator of the missed-update rate. */
  soundArgumentsFaced: number;
  /** Domains walked away from with `swap`. */
  skippedDomains: readonly string[];
  /**
   * Every round this run put on screen, including ones swapped away.
   *
   * Kept so a later run can avoid repeating them without a second stored list
   * that could drift out of step with the records themselves.
   */
  roundIds: readonly string[];
}
