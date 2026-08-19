import { describe, expect, it } from 'vitest';
import {
  ADVERSARY_CATALOG,
  DEFAULT_QUIZ_CONFIG,
  TIER_ORDER,
  audienceShares,
  bluffLevels,
  buildLevel,
  displacement,
  fiftyFiftyEliminations,
  fitsTier,
  friendCall,
  hostCall,
  SCHOOL_BANDS,
  ladder,
  levelValue,
  nearestByDifficulty,
  planRun,
  stepFor,
  tierPool,
  twoSigFigs,
} from '../src/index';
import type { AdversaryRound, TierConfig } from '../src/index';

const config = DEFAULT_QUIZ_CONFIG;
const tiers = TIER_ORDER.map((id) => config.tiers[id]);

/** Every (round, tier) pair a player can ever be shown. */
function everyBoard(seed: string) {
  const boards: { round: AdversaryRound; tier: TierConfig; level: ReturnType<typeof buildLevel> }[] =
    [];
  for (const tier of tiers) {
    for (const round of tierPool(ADVERSARY_CATALOG, tier)) {
      boards.push({ round, tier, level: buildLevel(seed, round, tier, 1, 100, true) });
    }
  }
  return boards;
}

describe('the board', () => {
  it('is four strictly ascending options with the truth in one of them', () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e']) {
      for (const { round, level } of everyBoard(seed)) {
        expect(level.options).toHaveLength(4);
        for (let i = 1; i < 4; i += 1) {
          expect(level.options[i]!).toBeGreaterThan(level.options[i - 1]!);
        }
        expect(level.options[level.correctIndex]).toBe(twoSigFigs(round.trueValue));
      }
    }
  });

  it('spaces the options uniformly, which is what stops the board leaking', () => {
    // A board where one option is placed differently from the rest tells a
    // player which one it is without any knowledge of the subject. Every gap
    // must therefore be the same step.
    for (const { round, tier, level } of everyBoard('leak')) {
      const step = stepFor(round, tier);
      for (let i = 1; i < 4; i += 1) {
        const ratio = level.options[i]! / level.options[i - 1]!;
        // Two significant figures moves a ratio by at most a few per cent.
        expect(ratio).toBeGreaterThan(step * 0.9);
        expect(ratio).toBeLessThan(step * 1.1);
      }
    }
  });

  /**
   * The finding this whole module was rebuilt around.
   *
   * Every bluff argues its way to an explicit figure. If the option the host
   * names is not that figure, the host refutes itself inside its own card and
   * the player learns one prose-independent rule -- "if the argument's number is
   * not one of the four, it is lying" -- which is `adversary.md`'s named death
   * condition for this content. Measured across the catalog before the rebuild:
   * 26 of 30 rounds broken.
   */
  it('names the option the bluff actually argued for, on every round and every tier', () => {
    let checked = 0;
    for (const seed of ['a', 'b', 'c']) {
      for (const { round, level } of everyBoard(seed)) {
        const named = level.options[level.bluffIndex]!;
        const argued = round.bluff.bluffValue!;
        expect(argued).toBeGreaterThan(0);
        // Two significant figures is the only gap allowed between the figure
        // the argument reaches and the option it is attached to.
        expect(named).toBe(twoSigFigs(argued));
        checked += 1;
      }
    }
    expect(checked).toBeGreaterThan(100);
  });

  /**
   * Without this clamp a board for `en_petrol_co2_per_litre` offered 4,000 kg of
   * CO2 from a litre of fuel weighing 0.75 kg. Three options eliminated
   * themselves and a player who knew no chemistry scored 100%.
   */
  it('keeps every option near the authored axis, so none of them is absurd', () => {
    for (const seed of ['a', 'b']) {
      for (const { round, tier, level } of everyBoard(seed)) {
        for (const option of level.options) {
          expect(option).toBeLessThanOrEqual(round.axisMax * tier.axisTolerance * 1.01);
          expect(option).toBeGreaterThanOrEqual((round.axisMin / tier.axisTolerance) * 0.99);
        }
      }
    }
  });

  it('drops a round from a tier rather than building it an impossible board', () => {
    for (const tier of tiers) {
      const inBand = ADVERSARY_CATALOG.filter((r) => r.band === tier.band);
      const pool = tierPool(ADVERSARY_CATALOG, tier);
      expect(pool.length).toBeLessThanOrEqual(inBand.length);
      // Enough left to fill the ladder and still have something to swap to.
      expect(pool.length).toBeGreaterThan(tier.levels);
      for (const round of pool) expect(fitsTier(round, tier)).toBe(true);
    }
  });

  /**
   * The reason bands exist. On the old flat 1-5 scale every round in the
   * catalog was a 1 or a 2 relative to the others, while all thirty were
   * high-school-to-university material in absolute terms — so the easiest mode
   * asked about container throughput at the Port of Shanghai.
   */
  /**
   * Legibility is this content's death condition: once a player can
   * pattern-match the generator instead of reading the argument, the product is
   * dead while still appearing to work. Two rounds committing the same error in
   * different clothes is how that starts.
   */
  it('never commits the same fallacy twice', () => {
    const seen = new Map<string, string>();
    for (const round of ADVERSARY_CATALOG) {
      const key = (round.bluff.fallacy ?? '').toLowerCase().replace(/[^a-z ]/g, '').trim();
      expect(key, `${round.id} has no fallacy label`).not.toBe('');
      const first = seen.get(key);
      expect(first, `${round.id} repeats the fallacy of ${first}: "${key}"`).toBeUndefined();
      seen.set(key, round.id);
    }
  });

  it('never asks the same question twice', () => {
    const ids = ADVERSARY_CATALOG.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    const questions = ADVERSARY_CATALOG.map((r) => r.question.toLowerCase().slice(0, 60));
    expect(new Set(questions).size).toBe(questions.length);
  });

  /**
   * The gap between neighbouring options, which is what a player actually
   * faces — not the displacement it is derived from.
   *
   * Testing the displacement directly conflated two things. The band is a claim
   * about how much schooling the question assumes; the step is how close the
   * answers sit. They correlate, because harder subjects invite closer traps,
   * but a mode's `bluffSteps` takes the square root for the harder two, so the
   * same displacement is a different board in different modes. What must hold
   * is that no board is razor-thin.
   */
  it('gives each band the board width its name promises', () => {
    // The floor a mode owes its reader. `elementary` is the one that matters:
    // the complaint that started this banding was that the easiest mode was
    // too hard, and a three-times-apart board is what "room to be wrong" means.
    // 1.2x is the global limit — below it, four two-significant-figure numbers
    // stop reading as visibly different at all.
    const FLOOR: Record<string, number> = {
      elementary: 3,
      middle: 1.75,
      high: 1.3,
      university: 1.2,
    };
    for (const tier of tiers) {
      for (const round of tierPool(ADVERSARY_CATALOG, tier)) {
        const step = stepFor(round, tier);
        expect(
          step,
          `${round.id} is ${round.band} but its options are only ${step.toFixed(2)}x apart`,
        ).toBeGreaterThan(FLOOR[round.band]!);
      }
    }
  });

  /**
   * The claim the mode screen makes: the answers get closer together as the
   * schooling assumed goes up. An aggregate rather than a per-round rule,
   * because board width follows the authored trap and a good university
   * question is allowed an obvious one.
   */
  it('puts the answers closer together as the band gets harder', () => {
    const median = (tierId: 'easy' | 'ultimate') => {
      const tier = config.tiers[tierId];
      const steps = tierPool(ADVERSARY_CATALOG, tier)
        .map((r) => stepFor(r, tier))
        .sort((a, b) => a - b);
      return steps[Math.floor(steps.length / 2)]!;
    };
    expect(median('easy')).toBeGreaterThan(median('ultimate'));
  });

  it('gives every band enough questions to fill the mode built for it', () => {
    for (const band of SCHOOL_BANDS) {
      const inBand = ADVERSARY_CATALOG.filter((r) => r.band === band);
      expect(inBand.length, `band "${band}" has ${inBand.length} rounds`).toBeGreaterThan(8);
    }
  });

  it('gives every round a displacement, because the board is derived from it', () => {
    for (const round of ADVERSARY_CATALOG) {
      expect(round.bluff.bluffValue).toBeGreaterThan(0);
      expect(displacement(round)).toBeGreaterThan(1);
      // `direction` and `bluffValue` are two statements of the same fact, and a
      // round where they disagree would point the host the wrong way.
      const above = round.bluff.bluffValue! > round.trueValue;
      expect(round.bluff.direction).toBe(above ? 'too_low' : 'too_high');
    }
  });

  it('never lets the host argue one way and point the other', () => {
    for (const seed of ['a', 'b', 'c']) {
      for (const { round, level } of everyBoard(seed)) {
        expect(level.bluffIndex).not.toBe(level.correctIndex);
        if (round.bluff.direction === 'too_high') {
          expect(level.bluffIndex).toBeLessThan(level.correctIndex);
        } else {
          expect(level.bluffIndex).toBeGreaterThan(level.correctIndex);
        }
      }
    }
  });

  it('gives the same seed the same board, and a different seed a different one', () => {
    const hard = config.tiers.hard;
    const round = tierPool(ADVERSARY_CATALOG, hard)[0]!;
    expect(buildLevel('same', round, hard, 1, 100, true)).toEqual(
      buildLevel('same', round, hard, 1, 100, true),
    );

    // A round now belongs to exactly one mode, so the seed is the only thing
    // that can move the answer's slot — and it has to, or a replayed seed
    // would be a map of the run before it.
    const slots = new Set(
      Array.from({ length: 12 }, (_, i) =>
        tierPool(ADVERSARY_CATALOG, hard)
          .slice(0, 6)
          .map((r) => buildLevel(`s${i}`, r, hard, 1, 100, true).correctIndex)
          .join(''),
      ),
    );
    expect(slots.size).toBeGreaterThan(1);
  });

  it('puts the truth in every slot the bluff direction allows, across the catalog', () => {
    const seen = new Set<number>();
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f']) {
      for (const { level } of everyBoard(seed)) seen.add(level.correctIndex);
    }
    expect([...seen].sort()).toEqual([0, 1, 2, 3]);
  });
});

describe('the audience', () => {
  it('reports whole percentages that add up to 100', () => {
    for (const { level } of everyBoard('aud')) {
      const shares = audienceShares('aud', level);
      expect(shares.reduce((a, b) => a + b, 0)).toBe(100);
      for (const share of shares) expect(Number.isInteger(share)).toBe(true);
    }
  });

  it('is a good guide on easy questions and a trap on hard ones', () => {
    const easiest = tierPool(ADVERSARY_CATALOG, config.tiers.easy)[0]!;
    const hardest = tierPool(ADVERSARY_CATALOG, config.tiers.ultimate)[0]!;

    const easyLevel = buildLevel('aud', easiest, config.tiers.easy, 1, 100, true);
    const easyShares = audienceShares('aud', easyLevel);
    expect(easyShares[easyLevel.correctIndex]!).toBeGreaterThan(easyShares[easyLevel.bluffIndex]!);

    const hardLevel = buildLevel('aud', hardest, config.tiers.ultimate, 1, 100, true);
    // The crowd's favourite on a hard question is a wrong one -- usually the
    // intuitive reading the bluff argues for. That is the lifeline's lesson.
    const hardShares = audienceShares('aud', hardLevel);
    const top = hardShares.indexOf(Math.max(...hardShares));
    expect(top).not.toBe(hardLevel.correctIndex);
  });
});

describe('the friend', () => {
  /**
   * The friend's honesty is mechanical, not rhetorical: their stated confidence
   * has to be worth what it claims. This is the friend's version of the
   * properness test the interval game rested on — it is the property the
   * lifeline exists to demonstrate, so it is measured rather than derived.
   */
  it('is calibrated: when they say 70%, they are right about 70% of the time', () => {
    const byConfidence = new Map<number, { right: number; total: number }>();

    for (let s = 0; s < 400; s += 1) {
      for (const tier of tiers) {
        for (const round of tierPool(ADVERSARY_CATALOG, tier)) {
          const level = buildLevel(`cal${s}`, round, tier, 1, 100, true);
          const call = friendCall(`cal${s}`, level);
          const bucket = byConfidence.get(call.confidence) ?? { right: 0, total: 0 };
          bucket.total += 1;
          if (call.index === level.correctIndex) bucket.right += 1;
          byConfidence.set(call.confidence, bucket);
        }
      }
    }

    expect(byConfidence.size).toBeGreaterThanOrEqual(4);
    for (const [confidence, { right, total }] of byConfidence) {
      expect(total).toBeGreaterThan(500);
      expect(Math.abs(right / total - confidence)).toBeLessThan(0.03);
    }
  });

  it('claims less on questions that assume more schooling', () => {
    const stated = (tierId: 'easy' | 'ultimate') => {
      const tier = config.tiers[tierId];
      const pool = tierPool(ADVERSARY_CATALOG, tier);
      let sum = 0;
      let n = 0;
      for (let s = 0; s < 60; s += 1) {
        for (const round of pool) {
          sum += friendCall(`c${s}`, buildLevel(`c${s}`, round, tier, 1, 100, true)).confidence;
          n += 1;
        }
      }
      return sum / n;
    };
    expect(stated('easy')).toBeGreaterThan(stated('ultimate'));
  });

  it('is wrong the way a thoughtful person is wrong', () => {
    // A friend who missed should land on the reading the question invites more
    // often than on an arbitrary option, or the lifeline is just noise.
    let onTrap = 0;
    let misses = 0;
    for (let s = 0; s < 600; s += 1) {
      for (const round of tierPool(ADVERSARY_CATALOG, config.tiers.hard)) {
        const level = buildLevel(`w${s}`, round, config.tiers.hard, 1, 100, true);
        const call = friendCall(`w${s}`, level);
        if (call.index === level.correctIndex) continue;
        misses += 1;
        if (call.index === level.bluffIndex) onTrap += 1;
      }
    }
    expect(misses).toBeGreaterThan(100);
    expect(onTrap / misses).toBeGreaterThan(0.4);
  });
});

describe('50:50 and the host', () => {
  it('always leaves the correct option and exactly one wrong one', () => {
    for (const { level } of everyBoard('fifty')) {
      const struck = fiftyFiftyEliminations('fifty', level);
      expect(struck).toHaveLength(2);
      expect(struck).not.toContain(level.correctIndex);
    }
  });

  /**
   * Usually the trap survives, because a survivor set of {truth, trap} is what
   * makes the lifeline a dilemma. Not always: a set that was ALWAYS {truth,
   * trap} would let a player spend 50:50, then the host, and read the host's
   * honesty off whether it named the survivor.
   */
  it('usually leaves the trap standing, but not always', () => {
    let trapSurvived = 0;
    let total = 0;
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f']) {
      for (const { level } of everyBoard(seed)) {
        total += 1;
        if (!fiftyFiftyEliminations(seed, level).includes(level.bluffIndex)) trapSurvived += 1;
      }
    }
    expect(trapSurvived / total).toBeGreaterThan(0.5);
    expect(trapSurvived / total).toBeLessThan(0.95);
  });

  it('names the correct option when sound and a wrong one when bluffing', () => {
    for (const round of tierPool(ADVERSARY_CATALOG, config.tiers.hard)) {
      const honest = buildLevel('h', round, config.tiers.hard, 1, 100, false);
      expect(hostCall(honest).index).toBe(honest.correctIndex);
      expect(hostCall(honest).argument).toBe(round.honest.argument);

      const bluff = buildLevel('h', round, config.tiers.hard, 1, 100, true);
      expect(hostCall(bluff).index).toBe(bluff.bluffIndex);
      expect(hostCall(bluff).index).not.toBe(bluff.correctIndex);
      expect(hostCall(bluff).argument).toBe(round.bluff.argument);
    }
  });
});

describe('the ladder and the plan', () => {
  it('climbs, and every rung is readable', () => {
    for (const tier of tiers) {
      const rungs = ladder(tier);
      expect(rungs).toHaveLength(tier.levels);
      for (let i = 1; i < rungs.length; i += 1) {
        expect(rungs[i]!).toBeGreaterThan(rungs[i - 1]!);
        expect(Number(rungs[i]!.toPrecision(2))).toBe(rungs[i]!);
      }
      expect(rungs[0]).toBe(tier.baseValue);
      expect(levelValue(tier, 1)).toBe(tier.baseValue);
    }
  });

  it('draws every rung from its own school band, and nothing else', () => {
    for (const tier of tiers) {
      const plan = planRun('ramp', ADVERSARY_CATALOG, [], tier, config);
      expect(plan.levels).toHaveLength(tier.levels);
      for (const level of plan.levels) expect(level.round.band).toBe(tier.band);
      for (const spare of plan.reserve) expect(spare.band).toBe(tier.band);
    }
  });

  it('ramps from the gentlest question in the band to the hardest', () => {
    for (const tier of tiers) {
      const plan = planRun('ramp', ADVERSARY_CATALOG, [], tier, config);
      const difficulties = plan.levels.map((l) => l.round.difficulty);
      // A sort would look like a ramp and quietly truncate it: every rung
      // filled from the gentle end, and the band's hardest never shown.
      const half = Math.floor(difficulties.length / 2);
      const front = difficulties.slice(0, half).reduce((a, b) => a + b, 0) / half;
      const back = difficulties.slice(-half).reduce((a, b) => a + b, 0) / half;
      expect(back).toBeGreaterThanOrEqual(front);
    }
  });

  it('gives every mode a different band, so no question can appear in two', () => {
    const bands = tiers.map((t) => t.band);
    expect(new Set(bands).size).toBe(bands.length);
  });

  it('never shows the same question twice in a run, and keeps a reserve for swaps', () => {
    for (const tier of tiers) {
      const plan = planRun('once', ADVERSARY_CATALOG, [], tier, config);
      const ids = plan.levels.map((l) => l.round.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const spare of plan.reserve) expect(ids).not.toContain(spare.id);
      expect(plan.reserve.length).toBeGreaterThan(0);
    }
  });

  it('gives the host exactly the tier rate of bluffs, never in one clump', () => {
    for (const tier of tiers) {
      const levels = bluffLevels('spread', tier);
      expect(levels).toHaveLength(Math.round(tier.levels * tier.hostBluffRate));
      expect(new Set(levels).size).toBe(levels.length);
    }
    expect(bluffLevels('spread', config.tiers.easy)).toEqual([]);
  });

  it('is deterministic in the seed and prefers unplayed rounds', () => {
    const tier = config.tiers.normal;
    expect(planRun('same', ADVERSARY_CATALOG, [], tier, config)).toEqual(
      planRun('same', ADVERSARY_CATALOG, [], tier, config),
    );

    // Only as many as the pool can spare: the preference relaxes rather than
    // failing once too few fresh rounds are left to fill the ladder, which is
    // what stops a player who has seen a band being handed an error.
    const pool = tierPool(ADVERSARY_CATALOG, tier);
    const played = pool.slice(0, pool.length - tier.levels).map((r) => r.id);
    expect(played.length).toBeGreaterThan(0);
    const plan = planRun('avoid', ADVERSARY_CATALOG, played, tier, config);
    for (const level of plan.levels) expect(played).not.toContain(level.round.id);
  });

  it('relaxes rather than failing once the catalog has been seen', () => {
    const tier = config.tiers.ultimate;
    const everything = ADVERSARY_CATALOG.map((r) => r.id);
    const plan = planRun('exhausted', ADVERSARY_CATALOG, everything, tier, config);
    expect(plan.levels).toHaveLength(tier.levels);
  });

  it('replaces a swapped question with one of comparable difficulty', () => {
    const tier = config.tiers.hard;
    const plan = planRun('swap', ADVERSARY_CATALOG, [], tier, config);
    const target = plan.levels[2]!.targetDifficulty;
    const replacement = nearestByDifficulty(plan.reserve, target)!;
    for (const spare of plan.reserve) {
      expect(Math.abs(replacement.difficulty - target)).toBeLessThanOrEqual(
        Math.abs(spare.difficulty - target),
      );
    }
  });
});
