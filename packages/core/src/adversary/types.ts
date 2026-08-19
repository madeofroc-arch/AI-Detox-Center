/**
 * The Adversary's authored content: a round, and the two arguments a host can
 * make about it.
 *
 * Spec: docs/product/adversary.md.
 *
 * Everything here is static data. How a round becomes a board of four options
 * lives in `quiz-board.ts`; how a run is played lives in `quiz-run.ts`. Nothing
 * in any of them reads a clock or a random number generator, so a run is
 * reproducible from its seed and a bug report is a seed (CLAUDE.md rule 2).
 */

/** Whether the opponent's argument was sound, or fluent and structurally wrong. */
export type PushbackKind = 'honest' | 'bluff';

/** Which way the argument pushes: that the answer is lower, or that it is higher. */
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
  /**
   * The figure this bluff's own arithmetic reaches. Bluffs only.
   *
   * Load-bearing rather than decorative: the option board is spaced so that
   * this figure IS one of the four, which is the only arrangement in which the
   * host can state its reasoning and then name an option without contradicting
   * itself. Optional in the type because the field was added after the catalog
   * was authored; `quiz-board.test.ts` requires every shipped round to carry
   * one, and a round without it has no board.
   *
   * It is never scored and never shown.
   */
  bluffValue?: number;
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
  /**
   * The range of values this quantity could plausibly take.
   *
   * Authored generously — a narrow bound is a hint — and load-bearing: the
   * option board is clamped to within a tolerance of it, which is what stops a
   * generated option being physically impossible and eliminating itself. A
   * round whose board cannot be built inside these bounds at a given mode is
   * dropped from that mode's pool rather than shown broken.
   */
  axisMin: number;
  axisMax: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  honest: Pushback;
  bluff: Pushback;
}

/**
 * What the player did when the host spoke, crossed with what the host was
 * doing.
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
