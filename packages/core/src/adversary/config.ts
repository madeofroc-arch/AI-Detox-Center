/**
 * Adversary tuning. Every number the scoring rule uses lives here, never in an
 * algorithm body (CLAUDE.md rule 5) — and here it matters more than usual,
 * because `claimedConfidence` is not a knob: it is the α of the scoring rule,
 * and changing it changes what the game is eliciting.
 */

export const ADVERSARY_CONFIG_VERSION = 1;

export interface AdversaryConfig {
  version: number;
  /**
   * The confidence the player claims on every band, stated on screen. Fixed at
   * one level in v1 so the calibration number means exactly one thing; several
   * levels and a real reliability plot come later.
   *
   * This is `1 - α` in the Winkler interval score. It is not decoration.
   */
  claimedConfidence: number;
  /** Points for a band of zero width that contains the answer. Unreachable. */
  maxPoints: number;
  /**
   * Applied to the payout when the player moved. A DISCOUNT, never a penalty:
   * moving on a sound argument has to stay the right play, or the game teaches
   * stubbornness.
   */
  movedMultiplier: number;
  /** Rounds in a session. Stated before round one, and the session ends there. */
  roundsPerSession: number;
  /** How many recently-played round ids to avoid when selecting. */
  avoidRecentCount: number;
}

export const DEFAULT_ADVERSARY_CONFIG: AdversaryConfig = {
  version: ADVERSARY_CONFIG_VERSION,
  claimedConfidence: 0.9,
  maxPoints: 100,
  movedMultiplier: 0.6,
  roundsPerSession: 5,
  avoidRecentCount: 40,
};

/** A deep copy, so a reset cannot alias the shared default. */
export function defaultAdversaryConfig(): AdversaryConfig {
  return { ...DEFAULT_ADVERSARY_CONFIG };
}
