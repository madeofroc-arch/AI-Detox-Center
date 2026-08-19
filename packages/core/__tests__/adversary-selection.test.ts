/**
 * A session is reproducible from its seed. That is what makes a bug report a
 * seed, and what would let a shared daily round exist with no server.
 */
import { describe, expect, it } from 'vitest';
import {
  ADVERSARY_CATALOG,
  DEFAULT_ADVERSARY_CONFIG,
  assignPushbacks,
  openingBand,
  selectSession,
} from '../src/index';
import type { AdversaryRound } from '../src/index';

const config = DEFAULT_ADVERSARY_CONFIG;

/** A catalog big enough to select from, with a spread of difficulties. */
const CATALOG: AdversaryRound[] = Array.from({ length: 24 }, (_, i) => ({
  id: `fx_${String(i).padStart(2, '0')}`,
  domain: ['transport', 'energy', 'human', 'tech'][i % 4]!,
  question: `Question ${i}?`,
  unit: 'things',
  trueValue: 1_000 * (i + 1),
  sourceNote: 'fixture',
  axisMin: 10,
  axisMax: 1_000_000,
  difficulty: ((i % 5) + 1) as 1 | 2 | 3 | 4 | 5,
  honest: { kind: 'honest', direction: 'too_high', argument: 'a', verdict: 'v' },
  bluff: { kind: 'bluff', direction: 'too_low', argument: 'b', verdict: 'v', fallacy: 'f' },
}));

const ids = (session: ReturnType<typeof selectSession>) => session.map((s) => s.round.id);

describe('selecting a session', () => {
  it('is reproducible from the seed, down to which argument each round shows', () => {
    const a = selectSession('2026-08-19', CATALOG, [], config);
    const b = selectSession('2026-08-19', [...CATALOG], [], config);
    expect(a.map((s) => [s.round.id, s.pushback])).toEqual(
      b.map((s) => [s.round.id, s.pushback]),
    );
  });

  it('does not depend on the order the catalog file happens to be written in', () => {
    const shuffled = [...CATALOG].reverse();
    expect(ids(selectSession('seed-1', CATALOG, [], config))).toEqual(
      ids(selectSession('seed-1', shuffled, [], config)),
    );
  });

  it('gives different seeds different sessions', () => {
    const a = ids(selectSession('seed-1', CATALOG, [], config));
    const b = ids(selectSession('seed-2', CATALOG, [], config));
    expect(a).not.toEqual(b);
  });

  it('runs exactly the configured number of rounds, with no repeats inside one', () => {
    const session = selectSession('seed-1', CATALOG, [], config);
    expect(session).toHaveLength(config.roundsPerSession);
    expect(new Set(ids(session)).size).toBe(config.roundsPerSession);
  });

  it('prefers rounds the player has not seen', () => {
    const played = CATALOG.slice(0, 20).map((r) => r.id);
    const session = selectSession('seed-1', CATALOG, played, config);
    // Four unplayed remain, fewer than a session, so it falls back to the full
    // catalog rather than failing — but with 20 played and 24 total it must
    // still reach for the fresh ones first when there are enough.
    const enoughFresh = selectSession('seed-1', CATALOG, CATALOG.slice(0, 10).map((r) => r.id), config);
    expect(ids(enoughFresh).some((id) => CATALOG.slice(0, 10).some((r) => r.id === id))).toBe(false);
    expect(session).toHaveLength(config.roundsPerSession);
  });

  it('ramps: easier rounds come first', () => {
    const difficulties = selectSession('seed-1', CATALOG, [], config).map(
      (s) => s.round.difficulty,
    );
    expect([...difficulties].sort((a, b) => a - b)).toEqual(difficulties);
  });

  it('throws rather than guessing when there is nothing to select from', () => {
    expect(() => selectSession('seed-1', [], [], config)).toThrow();
  });

  it('ships a real catalog that a session can be drawn from', () => {
    expect(ADVERSARY_CATALOG.length).toBeGreaterThan(0);
    for (const round of ADVERSARY_CATALOG) {
      expect(round.axisMin, round.id).toBeGreaterThan(0);
      expect(round.axisMax, round.id).toBeGreaterThan(round.axisMin);
      // The answer has to be reachable on the axis, or the round is unplayable.
      expect(round.trueValue, round.id).toBeGreaterThan(round.axisMin);
      expect(round.trueValue, round.id).toBeLessThan(round.axisMax);
      expect(round.honest.kind, round.id).toBe('honest');
      expect(round.bluff.kind, round.id).toBe('bluff');
      // A verdict that only asserts "that was a bluff" fails the bar this
      // content exists to clear, so at minimum it has to say something.
      expect(round.bluff.verdict.length, round.id).toBeGreaterThan(40);
      expect(round.bluff.fallacy, round.id).toBeTruthy();
    }
    expect(new Set(ADVERSARY_CATALOG.map((r) => r.id)).size).toBe(ADVERSARY_CATALOG.length);
  });
});

describe('which argument you get', () => {
  it('splits a session as evenly as its length allows', () => {
    // If bluffs were even slightly more common, "always hold" would be the
    // dominant strategy and the nerve grid would stop measuring anything.
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
      const session = selectSession(seed, CATALOG, [], config);
      const bluffs = session.filter((s) => s.pushback === 'bluff').length;
      expect(Math.abs(bluffs - (session.length - bluffs)), seed).toBeLessThanOrEqual(1);
    }
  });

  it('does not always hand the odd argument to the same side', () => {
    const counts = new Set(
      ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'].map(
        (seed) => selectSession(seed, CATALOG, [], config).filter((s) => s.pushback === 'bluff').length,
      ),
    );
    expect(counts.size).toBeGreaterThan(1);
  });

  it('is stable for a seed', () => {
    const first = assignPushbacks('seed-1', CATALOG.slice(0, 5));
    const again = assignPushbacks('seed-1', CATALOG.slice(0, 5));
    expect(first.map((s) => s.pushback)).toEqual(again.map((s) => s.pushback));
  });
});

describe('the opening band', () => {
  it('opens on the whole axis rather than somewhere helpful', () => {
    // A pre-narrowed band would be a hint, and one centred on the axis midpoint
    // would quietly teach that the midpoint is a reasonable guess. On a log
    // axis it usually is not.
    const round = CATALOG[0]!;
    expect(openingBand(round)).toEqual({ lo: round.axisMin, hi: round.axisMax });
  });
});
