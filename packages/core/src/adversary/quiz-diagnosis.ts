/**
 * The game is the diagnosis; the skill is the prescription.
 *
 * This module is the joint between the two halves of Human Mode. It reads
 * accumulated run records and emits a configuration for the hint ladder in
 * `skill/method/ladder.yaml` and `skill/method/signals.yaml` — a starting rung
 * and a short list of instructions, each one earned by a specific measurement.
 *
 * ## Why this is the only honest way to configure the skill
 *
 * Nobody installs an instruction set that makes their AI less immediately
 * helpful without evidence that they need it, and self-report cannot supply
 * that evidence: a person who folds to fluent wrong reasoning is, by
 * definition, not aware of it at the time. The game supplies it instead,
 * because the app wrote the argument and therefore knows the ground truth. No
 * question anywhere in the path asks the player what they think of themselves.
 *
 * ## Why a finding can be "not ready"
 *
 * One run produces very few observations of the things that matter: the Nerve
 * cells only fill on levels where the host was actually asked, and a tier hands
 * out one or two host lifelines. A threshold crossed on a denominator of two is
 * noise wearing a prescription's clothes.
 *
 * So every finding carries its denominator, findings below their minimum are
 * reported as pending with the number of observations still needed, and the
 * prescription simply omits them. That is also the only defensible reason for
 * this product to want a second session, and it is the opposite of a streak: it
 * is a sample size, it is stated as one, and nothing is lost by never returning.
 *
 * ## Principle 7
 *
 * Every ratio here has a set of plays as its subject, never the player. The
 * unit of measurement is "of the bluffs faced, this many were taken", not "you
 * are credulous". The app layer's copy is bound by the same rule, and the
 * instruction lines address the AI rather than the person for exactly that
 * reason.
 */
import type { NerveCell } from './types';
import type { LifelineId, RelianceCell, RunRecord } from './quiz-types';

export type FindingId =
  /** Moved to the host's answer when the host was arguing badly. */
  | 'takes_the_bluff'
  /** Kept a wrong answer when the host was arguing well. */
  | 'wont_update'
  /** The host is the first help reached for, over every other source. */
  | 'host_first'
  /** Help was bought on questions the instinct had already answered. */
  | 'unnecessary_reliance'
  /**
   * Answered alone and wrong, repeatedly.
   *
   * Named for what was observed rather than for what it might mean. An earlier
   * draft called this `overconfident`, which claims more than the game can see:
   * no confidence is stated anywhere in a four-option run, so the only thing
   * measured is that help was available, was not bought, and was needed.
   */
  | 'unaided_misses';

/** An instruction to paste into an AI. The text lives in the app's i18n layer. */
export type InstructionId =
  | 'flag_uncertainty'
  | 'hold_your_position'
  | 'ask_my_estimate_first'
  | 'name_the_check';

export interface FindingSpec {
  id: FindingId;
  /** Below this many observations the finding cannot be read at all. */
  minObservations: number;
  /** At or above this rate the finding fires. */
  threshold: number;
  /** What the finding prescribes, if anything beyond the rung. */
  instruction: InstructionId | null;
  /**
   * How this finding moves `default_rung`, as a signed number of rungs.
   *
   * The sign is the part to get right, and it is easy to get wrong: in
   * `ladder.yaml` a HIGHER rung number means MORE help (1 Orient, 5 Full
   * answer), while `signals.yaml`'s prose captions its sections "move up the
   * ladder (toward less help)". The words and the integers point opposite ways.
   * An earlier draft of this file read the prose and emitted `+1` for a player
   * who takes help they do not need — prescribing more unrequested help as the
   * remedy for taking help they did not ask for.
   */
  rungShift: number;
}

/**
 * Thresholds live here rather than in an algorithm body (CLAUDE.md rule 5), and
 * here that matters more than usual: these numbers decide what the product
 * tells someone about their own reasoning, so they have to be visible, argued
 * over, and changeable without touching the code that applies them.
 */
export interface DiagnosisConfig {
  version: number;
  /** Where a conversation starts when nothing is known — `ladder.yaml`'s `default_rung`. */
  baseRung: number;
  minRung: number;
  maxRung: number;
  findings: readonly FindingSpec[];
}

export const DIAGNOSIS_CONFIG_VERSION = 1;

export const DEFAULT_DIAGNOSIS_CONFIG: DiagnosisConfig = {
  version: DIAGNOSIS_CONFIG_VERSION,
  baseRung: 2,
  minRung: 1,
  maxRung: 5,
  findings: [
    {
      id: 'takes_the_bluff',
      minObservations: 3,
      threshold: 0.4,
      // Not "be more Socratic" — the opposite. The failure is not too much
      // help, it is help that arrives with no signal about which parts to
      // check. So the instruction asks the model to mark its own uncertainty.
      instruction: 'flag_uncertainty',
      rungShift: 0,
    },
    {
      id: 'wont_update',
      minObservations: 3,
      threshold: 0.5,
      // The mirror failure, and the one an agreeable model makes worse: it
      // folds when pushed. Asking it to hold a correct position is the only
      // remedy that addresses what was measured.
      instruction: 'hold_your_position',
      rungShift: 0,
    },
    {
      id: 'host_first',
      minObservations: 5,
      threshold: 0.5,
      instruction: 'ask_my_estimate_first',
      rungShift: 0,
    },
    {
      id: 'unnecessary_reliance',
      minObservations: 6,
      threshold: 0.5,
      // This one moves the rung instead of adding a line: the measurement is
      // that help was taken before it was needed, and the ladder already has a
      // control for exactly that. DOWN the ladder, toward rung 1 — less
      // unrequested help, not more.
      instruction: null,
      rungShift: -1,
    },
    {
      id: 'unaided_misses',
      minObservations: 6,
      threshold: 0.5,
      instruction: 'name_the_check',
      // The mirror of `unnecessary_reliance`, and the reason both carry a
      // shift: help was there, was not taken, and was needed. If both fire they
      // cancel, which is the right answer — a player who does both is at the
      // default.
      rungShift: 1,
    },
  ],
};

export interface Finding {
  id: FindingId;
  numerator: number;
  denominator: number;
  /** `numerator / denominator`, or null when nothing has been observed. */
  rate: number | null;
  /** Enough observations to say anything. */
  ready: boolean;
  /** Ready, and over the threshold. */
  triggered: boolean;
  /** Observations still needed before this can be read. Zero once ready. */
  needed: number;
  threshold: number;
}

export interface Prescription {
  /** `ladder.yaml`'s `default_rung`, adjusted by what was measured. */
  defaultRung: number;
  /** Whether the rung moved from the base, and which way. */
  rungShift: number;
  instructions: readonly InstructionId[];
  /** The findings that earned them, in the order they should be shown. */
  triggered: readonly Finding[];
}

export interface Diagnosis {
  /** How many runs went into this. */
  runs: number;
  levelsAttempted: number;
  findings: readonly Finding[];
  prescription: Prescription;
  /** Everything is measured but nothing crossed a threshold — a real outcome. */
  clean: boolean;
  /** Nothing has enough observations yet. */
  pending: boolean;
}

/** Sum the counters across runs. Records are never mutated. */
export interface Totals {
  runs: number;
  levelsAttempted: number;
  nerve: Record<NerveCell, number>;
  reliance: Record<RelianceCell, number>;
  firstReach: Record<LifelineId, number>;
  soloLevels: number;
  aidedLevels: number;
}

export function totalsOf(records: readonly RunRecord[]): Totals {
  const totals: Totals = {
    runs: records.length,
    levelsAttempted: 0,
    nerve: { heldFirm: 0, missedUpdate: 0, updated: 0, taken: 0 },
    reliance: { soloRight: 0, soloWrong: 0, aidedUnneeded: 0, aidedNeeded: 0 },
    firstReach: { fiftyFifty: 0, friend: 0, audience: 0, host: 0, swap: 0 },
    soloLevels: 0,
    aidedLevels: 0,
  };

  for (const record of records) {
    totals.levelsAttempted += record.levelsAttempted;
    for (const cell of ['heldFirm', 'missedUpdate', 'updated', 'taken'] as const) {
      totals.nerve[cell] += record.nerve[cell];
    }
    for (const cell of ['soloRight', 'soloWrong', 'aidedUnneeded', 'aidedNeeded'] as const) {
      totals.reliance[cell] += record.reliance[cell];
    }
    for (const id of ['fiftyFifty', 'friend', 'audience', 'host', 'swap'] as const) {
      totals.firstReach[id] += record.firstReach[id];
    }
    totals.soloLevels += record.soloLevels;
    totals.aidedLevels += record.aidedLevels;
  }

  return totals;
}

/** The numerator and denominator each finding is computed from. */
function measure(id: FindingId, totals: Totals): { numerator: number; denominator: number } {
  switch (id) {
    case 'takes_the_bluff':
      return {
        numerator: totals.nerve.taken,
        denominator: totals.nerve.taken + totals.nerve.heldFirm,
      };
    case 'wont_update':
      return {
        numerator: totals.nerve.missedUpdate,
        denominator: totals.nerve.missedUpdate + totals.nerve.updated,
      };
    case 'host_first': {
      const reaches = Object.values(totals.firstReach).reduce((sum, n) => sum + n, 0);
      return { numerator: totals.firstReach.host, denominator: reaches };
    }
    case 'unnecessary_reliance':
      return { numerator: totals.reliance.aidedUnneeded, denominator: totals.aidedLevels };
    case 'unaided_misses':
      return { numerator: totals.reliance.soloWrong, denominator: totals.soloLevels };
  }
}

export function diagnose(
  records: readonly RunRecord[],
  config: DiagnosisConfig = DEFAULT_DIAGNOSIS_CONFIG,
): Diagnosis {
  const totals = totalsOf(records);

  const findings: Finding[] = config.findings.map((spec) => {
    const { numerator, denominator } = measure(spec.id, totals);
    const ready = denominator >= spec.minObservations;
    const rate = denominator === 0 ? null : numerator / denominator;
    return {
      id: spec.id,
      numerator,
      denominator,
      rate,
      ready,
      triggered: ready && rate !== null && rate >= spec.threshold,
      needed: Math.max(0, spec.minObservations - denominator),
      threshold: spec.threshold,
    };
  });

  const triggered = findings.filter((f) => f.triggered);
  const bySpec = new Map(config.findings.map((spec) => [spec.id, spec]));

  const instructions: InstructionId[] = [];
  for (const finding of triggered) {
    const instruction = bySpec.get(finding.id)?.instruction;
    if (instruction && !instructions.includes(instruction)) instructions.push(instruction);
  }

  // Only the two reliance findings move the rung. The other three are about
  // what the AI should say, not how much it should say, and conflating the two
  // would prescribe less help to someone whose problem is that they cannot tell
  // which help to trust.
  const rungShift = triggered.reduce((sum, f) => sum + (bySpec.get(f.id)?.rungShift ?? 0), 0);
  const defaultRung = Math.min(
    config.maxRung,
    Math.max(config.minRung, config.baseRung + rungShift),
  );
  // The clamp can swallow a shift, and the screen must not then explain a move
  // that did not happen.
  const appliedShift = defaultRung - config.baseRung;

  return {
    runs: records.length,
    levelsAttempted: totals.levelsAttempted,
    findings,
    prescription: { defaultRung, rungShift: appliedShift, instructions, triggered },
    clean: findings.some((f) => f.ready) && triggered.length === 0,
    pending: !findings.some((f) => f.ready),
  };
}
