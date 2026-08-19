/**
 * The Adversary — a calibration game where a confident opponent argues against
 * the range you just committed to, and you win by knowing when to hold.
 *
 * Spec: docs/product/adversary.md.
 *
 * Everything here is data and pure functions. Rounds are static content; the
 * player's band is an input; nothing reads a clock or a random number
 * generator, so a session is reproducible from its seed and a bug report is a
 * seed (CLAUDE.md rule 2).
 */

/** Whether the opponent's argument was sound, or fluent and structurally wrong. */
export type PushbackKind = 'honest' | 'bluff';

/** What the argument claims about the player's band. */
export type PushbackDirection = 'too_high' | 'too_low';

export interface Pushback {
  kind: PushbackKind;
  direction: PushbackDirection;
  /**
   * The opponent speaking. Two or three sentences, confident, in its own voice.
   * A bluff is a FALLACY, not a wrong number: a real constraint applied where
   * it does not bind, a stock read as a flow, an average hiding a skew.
   */
  argument: string;
  /**
   * Shown after the reveal. For a bluff it must name where the reasoning broke
   * precisely enough that the player agrees rather than argues — a verdict that
   * only asserts "that was a bluff" fails the bar this content exists to clear.
   */
  verdict: string;
  /** Short label for the failure mode. Bluffs only. */
  fallacy?: string;
}

export interface AdversaryRound {
  id: string;
  domain: string;
  /** One line, every dimension pinned. Ambiguity here breaks the reveal. */
  question: string;
  unit: string;
  trueValue: number;
  /** Where the number comes from, and roughly when. Shown at the reveal. */
  sourceNote: string;
  /** Log-axis bounds. Generous on purpose: a narrow axis is a hint. */
  axisMin: number;
  axisMax: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  honest: Pushback;
  bluff: Pushback;
}

/** The range the player claims, at the fixed confidence in the config. */
export interface Band {
  lo: number;
  hi: number;
}

/**
 * What the player did when pushed, crossed with what the argument actually was.
 *
 * The whole measurement, and it needs no self-report: the app knows the ground
 * truth because the app wrote the argument. That is the property the old
 * dependency score never had — its input stream depended on the user's honesty
 * and discipline at the worst possible moment.
 */
export type NerveCell =
  /** Held against a bluff. The good one. */
  | 'heldFirm'
  /** Held against a sound argument — an update you should have made. */
  | 'missedUpdate'
  /** Moved on a sound argument. Also the good one. */
  | 'updated'
  /** Moved on a bluff. */
  | 'taken';

export interface RoundResult {
  roundId: string;
  /** The band before the opponent spoke. */
  initialBand: Band;
  /** The band that was scored — same as `initialBand` unless the player moved. */
  band: Band;
  moved: boolean;
  pushback: PushbackKind;
  hit: boolean;
  points: number;
  nerve: NerveCell;
  /**
   * How far outside the band the answer fell, as a multiple: 6 means "you were
   * 6x off". Exactly 1 on a hit. Used for copy, never for scoring.
   */
  missFactor: number;
}

/**
 * Everything the record shows, recomputed from stored results rather than kept
 * as a running total — acceptance criterion 6, so no number can drift away from
 * the rounds that produced it.
 */
export interface AdversaryRecord {
  bands: number;
  hits: number;
  /** hits / bands, or null before the first band. Compare against `claimedConfidence`. */
  calibration: number | null;
  claimedConfidence: number;
  nerve: Record<NerveCell, number>;
  points: number;
}
