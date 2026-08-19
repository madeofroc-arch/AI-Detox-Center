/**
 * The payout must be a proper scoring rule.
 *
 * This is the test the whole game rests on. A calibration game scored by a rule
 * you can beat teaches you to beat the rule — you would learn to state whatever
 * band pays best, which is the opposite of the capability. So it is not enough
 * that the Winkler score is proper on paper; the thing that actually ships is
 * Winkler *plus* a normalisation, a rounding step and a clamp at zero, and
 * properness has to survive all three.
 *
 * So: build an honest belief, enumerate the bands a player might state instead,
 * and check that the honest one wins in expectation.
 */
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_ADVERSARY_CONFIG,
  buildRecord,
  intervalLoss,
  isHit,
  missFactor,
  nerveCell,
  normalizeBand,
  potentialPoints,
  resolveRound,
  bandFactor,
} from '../src/index';
import type { AdversaryRound, Band, RoundResult } from '../src/index';

const config = DEFAULT_ADVERSARY_CONFIG;

const ROUND: AdversaryRound = {
  id: 'fixture',
  domain: 'test',
  question: 'How many?',
  unit: 'things',
  trueValue: 10_000,
  sourceNote: 'fixture',
  axisMin: 100,
  axisMax: 1_000_000,
  difficulty: 3,
  honest: { kind: 'honest', direction: 'too_high', argument: 'a', verdict: 'v' },
  bluff: { kind: 'bluff', direction: 'too_low', argument: 'b', verdict: 'v', fallacy: 'f' },
};

/**
 * A belief about where the answer lies, as weights on a lattice of log-values.
 * Discrete and hand-built so the test is deterministic; `Math.exp` is fine here
 * because this is the test, not the scoring path.
 */
function belief(muLog: number, sigmaLog: number, n = 601) {
  const lo = muLog - 4 * sigmaLog;
  const hi = muLog + 4 * sigmaLog;
  const points: { value: number; weight: number }[] = [];
  let total = 0;
  for (let i = 0; i < n; i++) {
    const x = lo + ((hi - lo) * i) / (n - 1);
    const w = Math.exp(-((x - muLog) ** 2) / (2 * sigmaLog ** 2));
    points.push({ value: 10 ** x, weight: w });
    total += w;
  }
  return points.map((p) => ({ value: p.value, weight: p.weight / total }));
}

/** The central interval of a belief at a given coverage. */
function centralInterval(
  dist: ReturnType<typeof belief>,
  coverage: number,
): Band {
  const tail = (1 - coverage) / 2;
  let cum = 0;
  let lo = dist[0]!.value;
  let hi = dist[dist.length - 1]!.value;
  let loFound = false;
  for (const p of dist) {
    cum += p.weight;
    if (!loFound && cum >= tail) {
      lo = p.value;
      loFound = true;
    }
    if (cum >= 1 - tail) {
      hi = p.value;
      break;
    }
  }
  return { lo, hi };
}

/** Expected points from stating `band`, under `dist`. */
function expectedPoints(dist: ReturnType<typeof belief>, band: Band): number {
  let total = 0;
  for (const p of dist) {
    const round = { ...ROUND, trueValue: p.value };
    total +=
      p.weight *
      resolveRound(round, { initialBand: band, band, moved: false, pushback: 'honest' }, config)
        .points;
  }
  return total;
}

describe('the payout cannot be gamed', () => {
  // Several shapes of belief: confident, vague, and off-centre relative to the
  // axis, because a rule can be proper for one and not another.
  const BELIEFS = [
    { name: 'confident, centred', mu: 4, sigma: 0.25 },
    { name: 'moderate', mu: 4, sigma: 0.5 },
    { name: 'vague', mu: 4, sigma: 0.9 },
    { name: 'confident, low on the axis', mu: 2.8, sigma: 0.3 },
    { name: 'confident, high on the axis', mu: 5.2, sigma: 0.3 },
  ];

  for (const b of BELIEFS) {
    it(`the honest 90% band beats every other coverage — ${b.name}`, () => {
      const dist = belief(b.mu, b.sigma);
      const honest = expectedPoints(dist, centralInterval(dist, config.claimedConfidence));

      // The temptations: narrow to chase the payout, or widen to buy safety.
      for (const coverage of [0.5, 0.6, 0.7, 0.8, 0.85, 0.95, 0.98, 0.995]) {
        const alternative = expectedPoints(dist, centralInterval(dist, coverage));
        expect(
          honest,
          `stating a ${Math.round(coverage * 100)}% band paid ${alternative.toFixed(3)} ` +
            `against ${honest.toFixed(3)} for the honest 90% one (${b.name})`,
        ).toBeGreaterThanOrEqual(alternative);
      }
    });

    it(`the honest 90% band beats shifting it off your belief — ${b.name}`, () => {
      const dist = belief(b.mu, b.sigma);
      const band = centralInterval(dist, config.claimedConfidence);
      const honest = expectedPoints(dist, band);

      // Same width, wrong place: a player who has read the question and then
      // hedges toward the middle of the axis, or away from it.
      for (const shift of [0.15, 0.3, 0.6, -0.15, -0.3, -0.6]) {
        const factor = 10 ** shift;
        const shifted = { lo: band.lo * factor, hi: band.hi * factor };
        expect(
          honest,
          `shifting the band by 10^${shift} paid ${expectedPoints(dist, shifted).toFixed(3)} ` +
            `against ${honest.toFixed(3)} (${b.name})`,
        ).toBeGreaterThanOrEqual(expectedPoints(dist, shifted));
      }
    });
  }

  it('claiming the whole axis wins nothing', () => {
    const everything = { lo: ROUND.axisMin, hi: ROUND.axisMax };
    expect(isHit(ROUND, everything)).toBe(true);
    expect(potentialPoints(ROUND, everything, config)).toBe(0);
  });

  it('charges more for a worse miss, all the way down', () => {
    // The floor this used to have is what broke properness: with it, a badly
    // missed narrow band cost no more than a barely missed one, so narrowing
    // was free. The cost has to keep growing.
    const near = resolveRound(
      ROUND,
      { initialBand: { lo: 11_000, hi: 13_000 }, band: { lo: 11_000, hi: 13_000 }, moved: false, pushback: 'bluff' },
      config,
    );
    const far = resolveRound(
      ROUND,
      { initialBand: { lo: 500_000, hi: 600_000 }, band: { lo: 500_000, hi: 600_000 }, moved: false, pushback: 'bluff' },
      config,
    );
    expect(near.hit).toBe(false);
    expect(far.hit).toBe(false);
    expect(far.points).toBeLessThan(near.points);
  });

  it('moving buys cheaper upside, never cheaper downside', () => {
    // Scaling a loss down too would make MOVE a hedge, and "move whenever
    // unsure" would dominate.
    const miss = { lo: 100, hi: 200 };
    const held = resolveRound(
      ROUND,
      { initialBand: miss, band: miss, moved: false, pushback: 'bluff' },
      config,
    );
    const moved = resolveRound(
      ROUND,
      { initialBand: { lo: 100, hi: 1_000 }, band: miss, moved: true, pushback: 'bluff' },
      config,
    );
    expect(held.points).toBeLessThan(0);
    expect(moved.points).toBe(held.points);
  });

  it('states the claim as a multiple, which is the honest second number', () => {
    // A points-denominated "risk" would FALL as the band tightened, because
    // under a proper rule narrowing raises the probability of a miss and not
    // the penalty for one. Printing it would teach the opposite of the truth.
    expect(bandFactor(ROUND, { lo: 1_000, hi: 100_000 })).toBeCloseTo(100, 9);
    expect(bandFactor(ROUND, { lo: 9_000, hi: 11_000 })).toBeCloseTo(11 / 9, 9);
  });

  it('pays more the narrower a correct band gets', () => {
    const wide = potentialPoints(ROUND, { lo: 1_000, hi: 100_000 }, config);
    const tight = potentialPoints(ROUND, { lo: 8_000, hi: 12_000 }, config);
    expect(tight).toBeGreaterThan(wide);
    expect(tight).toBeLessThanOrEqual(config.maxPoints);
  });

  it('is the same number under the thumb and on the reveal', () => {
    // The payout shown while narrowing is the hit branch of the scoring rule,
    // not a second rule that happens to look similar.
    const band = { lo: 8_000, hi: 12_000 };
    const shown = potentialPoints(ROUND, band, config);
    const awarded = resolveRound(
      ROUND,
      { initialBand: band, band, moved: false, pushback: 'honest' },
      config,
    );
    expect(awarded.hit).toBe(true);
    expect(awarded.points).toBe(shown);
  });

  it('discounts a moved band without punishing it', () => {
    expect(config.movedMultiplier).toBeGreaterThan(0);
    expect(config.movedMultiplier).toBeLessThan(1);
    const band = { lo: 8_000, hi: 12_000 };
    const held = resolveRound(
      ROUND,
      { initialBand: band, band, moved: false, pushback: 'honest' },
      config,
    );
    const moved = resolveRound(
      ROUND,
      { initialBand: { lo: 1_000, hi: 100_000 }, band, moved: true, pushback: 'honest' },
      config,
    );
    expect(moved.points).toBeLessThan(held.points);
    expect(moved.points).toBeGreaterThan(0);
  });
});

describe('resolving a round', () => {
  it('puts an inverted or out-of-axis band back in range', () => {
    expect(normalizeBand(ROUND, { lo: 500, hi: 200 })).toEqual({ lo: 200, hi: 500 });
    expect(normalizeBand(ROUND, { lo: 1, hi: 9_999_999 })).toEqual({
      lo: ROUND.axisMin,
      hi: ROUND.axisMax,
    });
  });

  it('reports how far off a miss was, as a multiple', () => {
    expect(missFactor(ROUND, { lo: 100, hi: 1_000 })).toBeCloseTo(10, 10);
    expect(missFactor(ROUND, { lo: 100_000, hi: 1_000_000 })).toBeCloseTo(10, 10);
    expect(missFactor(ROUND, { lo: 5_000, hi: 20_000 })).toBe(1);
  });

  it('is exact about hits: comparison only, no logarithms in the path', () => {
    expect(isHit(ROUND, { lo: 10_000, hi: 10_000 })).toBe(true);
    expect(isHit(ROUND, { lo: 10_001, hi: 20_000 })).toBe(false);
  });

  it('reads the nerve grid off what happened, with nothing self-reported', () => {
    expect(nerveCell(false, 'bluff')).toBe('heldFirm');
    expect(nerveCell(true, 'bluff')).toBe('taken');
    expect(nerveCell(true, 'honest')).toBe('updated');
    expect(nerveCell(false, 'honest')).toBe('missedUpdate');
  });

  it('is deterministic: the same play resolves identically', () => {
    const play = {
      initialBand: { lo: 2_000, hi: 50_000 },
      band: { lo: 8_000, hi: 12_000 },
      moved: true,
      pushback: 'bluff' as const,
    };
    expect(resolveRound(ROUND, play, config)).toEqual(resolveRound(ROUND, play, config));
  });
});

describe('the record', () => {
  const play = (band: Band, moved: boolean, pushback: 'honest' | 'bluff'): RoundResult =>
    resolveRound(ROUND, { initialBand: band, band, moved, pushback }, config);

  it('is empty before the first band, without claiming zero', () => {
    const record = buildRecord([], config);
    expect(record.bands).toBe(0);
    // null, not 0: a player with no history has no calibration, and 0% is a
    // very different claim.
    expect(record.calibration).toBeNull();
  });

  it('recomputes from the rounds rather than accumulating', () => {
    const results = [
      play({ lo: 8_000, hi: 12_000 }, false, 'bluff'),
      play({ lo: 100, hi: 200 }, false, 'honest'),
      play({ lo: 5_000, hi: 50_000 }, true, 'honest'),
    ];
    const record = buildRecord(results, config);

    expect(record.bands).toBe(3);
    expect(record.hits).toBe(2);
    expect(record.calibration).toBeCloseTo(2 / 3, 10);
    expect(record.claimedConfidence).toBe(0.9);
    expect(record.nerve).toEqual({ heldFirm: 1, missedUpdate: 1, updated: 1, taken: 0 });
    expect(record.points).toBe(results.reduce((sum, r) => sum + r.points, 0));

    // Order must not matter: the same rounds in any order give the same record.
    expect(buildRecord([...results].reverse(), config)).toEqual(record);
  });
});
