import { describe, expect, it } from 'vitest';
import { DEFAULT_DIAGNOSIS_CONFIG, diagnose, totalsOf } from '../src/index';
import type { NerveCell, RelianceCell, RunRecord } from '../src/index';

/** A record with nothing in it, so each test states only what it is about. */
function record(patch: Partial<RunRecord> = {}): RunRecord {
  return {
    tier: 'hard',
    seed: 'seed',
    ending: 'cleared',
    levelsCleared: 0,
    levelsAttempted: 0,
    bank: 0,
    livesLost: 0,
    nerve: { heldFirm: 0, missedUpdate: 0, updated: 0, taken: 0 },
    reliance: { soloRight: 0, soloWrong: 0, aidedUnneeded: 0, aidedNeeded: 0 },
    lifelineUse: { fiftyFifty: 0, friend: 0, audience: 0, host: 0, swap: 0 },
    firstReach: { fiftyFifty: 0, friend: 0, audience: 0, host: 0, swap: 0 },
    talkedOut: 0,
    soloLevels: 0,
    aidedLevels: 0,
    bluffsFaced: 0,
    soundArgumentsFaced: 0,
    skippedDomains: [],
    roundIds: [],
    ...patch,
  };
}

const nerve = (cells: Partial<Record<NerveCell, number>>) =>
  record({ nerve: { heldFirm: 0, missedUpdate: 0, updated: 0, taken: 0, ...cells } });

const reliance = (cells: Partial<Record<RelianceCell, number>>, levels: Partial<RunRecord>) =>
  record({
    reliance: { soloRight: 0, soloWrong: 0, aidedUnneeded: 0, aidedNeeded: 0, ...cells },
    ...levels,
  });

const find = (d: ReturnType<typeof diagnose>, id: string) =>
  d.findings.find((f) => f.id === id)!;

describe('with nothing played', () => {
  it('says so, and prescribes nothing', () => {
    const d = diagnose([]);
    expect(d.pending).toBe(true);
    expect(d.clean).toBe(false);
    expect(d.prescription.instructions).toEqual([]);
    expect(d.prescription.defaultRung).toBe(DEFAULT_DIAGNOSIS_CONFIG.baseRung);
    for (const finding of d.findings) {
      expect(finding.ready).toBe(false);
      expect(finding.rate).toBeNull();
      expect(finding.needed).toBeGreaterThan(0);
    }
  });
});

describe('sample size', () => {
  /**
   * The failure this guards against is a prescription written off two
   * observations. One run hands out one or two host lifelines, so a threshold
   * crossed on a denominator of two is noise wearing a prescription's clothes.
   */
  it('will not read a finding whose denominator is too small, even at a rate of 1', () => {
    const d = diagnose([nerve({ taken: 1, heldFirm: 0 })]);
    const finding = find(d, 'takes_the_bluff');
    expect(finding.rate).toBe(1);
    expect(finding.ready).toBe(false);
    expect(finding.triggered).toBe(false);
    expect(finding.needed).toBe(2);
    expect(d.prescription.instructions).toEqual([]);
  });

  it('accumulates across runs, which is what a second session is actually for', () => {
    const runs = [
      nerve({ taken: 2, heldFirm: 0 }),
      nerve({ taken: 1, heldFirm: 1 }),
      nerve({ taken: 0, heldFirm: 1 }),
    ];
    const totals = totalsOf(runs);
    expect(totals.runs).toBe(3);
    expect(totals.nerve.taken).toBe(3);
    expect(totals.nerve.heldFirm).toBe(2);

    const d = diagnose(runs);
    const finding = find(d, 'takes_the_bluff');
    expect(finding.denominator).toBe(5);
    expect(finding.numerator).toBe(3);
    expect(finding.ready).toBe(true);
    expect(finding.triggered).toBe(true);
  });
});

describe('each finding earns exactly one prescription', () => {
  it('being moved by fluent bad reasoning asks the AI to mark its own uncertainty', () => {
    const d = diagnose([nerve({ taken: 3, heldFirm: 3 })]);
    expect(find(d, 'takes_the_bluff').triggered).toBe(true);
    expect(d.prescription.instructions).toContain('flag_uncertainty');
    // It does NOT move the rung: the problem is not the amount of help.
    expect(d.prescription.defaultRung).toBe(DEFAULT_DIAGNOSIS_CONFIG.baseRung);
  });

  it('not updating on good reasoning asks the AI to hold its position', () => {
    const d = diagnose([nerve({ missedUpdate: 3, updated: 2 })]);
    expect(find(d, 'wont_update').triggered).toBe(true);
    expect(d.prescription.instructions).toContain('hold_your_position');
  });

  it('reaching for the AI before anything else asks it to ask for an estimate first', () => {
    const d = diagnose([
      record({ firstReach: { fiftyFifty: 1, friend: 0, audience: 1, host: 4, swap: 0 } }),
    ]);
    expect(find(d, 'host_first').triggered).toBe(true);
    expect(d.prescription.instructions).toContain('ask_my_estimate_first');
  });

  /**
   * The direction is the whole test.
   *
   * `ladder.yaml` numbers rungs 1 Orient (least help) to 5 Full answer (most),
   * while `signals.yaml`'s prose captions its sections "move up the ladder
   * (toward less help)". The words and the integers point opposite ways, and an
   * earlier version of this module read the prose: it answered "you take help
   * you did not need" by prescribing MORE unrequested help.
   */
  it('buying help that was not needed starts the ladder LOWER, toward less help', () => {
    const d = diagnose([reliance({ aidedUnneeded: 4, aidedNeeded: 2 }, { aidedLevels: 6 })]);
    expect(find(d, 'unnecessary_reliance').triggered).toBe(true);
    expect(d.prescription.rungShift).toBe(-1);
    expect(d.prescription.defaultRung).toBe(DEFAULT_DIAGNOSIS_CONFIG.baseRung - 1);
  });

  it('answering alone and wrong starts it higher, and asks for a check', () => {
    const d = diagnose([reliance({ soloWrong: 4, soloRight: 2 }, { soloLevels: 6 })]);
    expect(find(d, 'unaided_misses').triggered).toBe(true);
    expect(d.prescription.instructions).toContain('name_the_check');
    expect(d.prescription.defaultRung).toBe(DEFAULT_DIAGNOSIS_CONFIG.baseRung + 1);
  });

  it('leaves the ladder alone for someone who does both', () => {
    const d = diagnose([
      reliance(
        { aidedUnneeded: 4, aidedNeeded: 2, soloWrong: 4, soloRight: 2 },
        { aidedLevels: 6, soloLevels: 6 },
      ),
    ]);
    expect(find(d, 'unnecessary_reliance').triggered).toBe(true);
    expect(find(d, 'unaided_misses').triggered).toBe(true);
    expect(d.prescription.rungShift).toBe(0);
    expect(d.prescription.defaultRung).toBe(DEFAULT_DIAGNOSIS_CONFIG.baseRung);
  });

  it('never prescribes the same line twice', () => {
    const d = diagnose([
      record({
        firstReach: { fiftyFifty: 0, friend: 0, audience: 1, host: 5, swap: 0 },
        reliance: { soloRight: 2, soloWrong: 4, aidedUnneeded: 0, aidedNeeded: 0 },
        soloLevels: 6,
      }),
    ]);
    expect(new Set(d.prescription.instructions).size).toBe(d.prescription.instructions.length);
  });
});

describe('a clean run', () => {
  /**
   * `signals.yaml` forbids inventing difficulty to make a task feel
   * educational. The diagnosis has to be able to say "nothing here", or every
   * player gets told something is wrong with them.
   */
  it('is a real outcome and prescribes nothing', () => {
    const d = diagnose([
      nerve({ taken: 1, heldFirm: 5, missedUpdate: 1, updated: 5 }),
      reliance({ soloRight: 6, soloWrong: 1, aidedUnneeded: 1, aidedNeeded: 5 }, {
        soloLevels: 7,
        aidedLevels: 6,
        firstReach: { fiftyFifty: 3, friend: 1, audience: 2, host: 1, swap: 0 },
      }),
    ]);
    expect(d.pending).toBe(false);
    expect(d.clean).toBe(true);
    expect(d.prescription.instructions).toEqual([]);
    expect(d.prescription.rungShift).toBe(0);
    expect(d.prescription.triggered).toEqual([]);
  });
});

describe('the rung', () => {
  it('stays inside the ladder', () => {
    const config = { ...DEFAULT_DIAGNOSIS_CONFIG, baseRung: 1 };
    const d = diagnose([reliance({ aidedUnneeded: 6 }, { aidedLevels: 6 })], config);
    expect(d.prescription.defaultRung).toBe(config.minRung);
    // A shift the clamp swallowed is not a shift, and the screen must not
    // explain a move that did not happen.
    expect(d.prescription.rungShift).toBe(0);
  });
});

describe('every ratio has plays as its subject, never the player', () => {
  it('carries its own numerator and denominator so the copy can only be about the plays', () => {
    const d = diagnose([nerve({ taken: 3, heldFirm: 3 })]);
    const finding = find(d, 'takes_the_bluff');
    expect(finding.numerator).toBe(3);
    expect(finding.denominator).toBe(6);
    expect(finding.rate).toBe(0.5);
    // A finding a screen cannot render as "N of M" would have to be rendered as
    // a judgement instead. Principle 7 is enforced by the shape of this type.
    for (const f of d.findings) {
      expect(typeof f.numerator).toBe('number');
      expect(typeof f.denominator).toBe('number');
      expect(f.numerator).toBeLessThanOrEqual(f.denominator);
    }
  });
});
