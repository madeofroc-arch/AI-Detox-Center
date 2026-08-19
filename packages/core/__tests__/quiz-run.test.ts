import { describe, expect, it } from 'vitest';
import {
  ADVERSARY_CATALOG,
  DEFAULT_QUIZ_CONFIG,
  TIER_ORDER,
  advance,
  buildRunRecord,
  canSpend,
  chooseGrant,
  grantableLifelines,
  ladder,
  lifelineCount,
  lockInstinct,
  selectOption,
  spendLifeline,
  startRun,
  submit,
  swapQuestion,
  walkAway,
} from '../src/index';
import type { LifelineId, RunState } from '../src/index';

const config = DEFAULT_QUIZ_CONFIG;

const wrongIndex = (state: RunState) => (state.board.correctIndex + 1) % 4;

/** Answer the level and step past the reveal. */
function play(
  state: RunState,
  choice: 'right' | 'wrong',
  lifelines: LifelineId[] = [],
  grant?: LifelineId,
): RunState {
  let next = lockInstinct(state, choice === 'right' ? state.board.correctIndex : wrongIndex(state));
  for (const id of lifelines) next = spendLifeline(next, id);
  const want = choice === 'right' ? next.board.correctIndex : wrongIndex(next);
  next = selectOption(next, want);
  next = submit(next, config);
  next = advance(next, config);
  // Take whatever is still takeable. Naming one lifeline here spins forever
  // once it hits the per-lifeline ceiling, which is exactly how this helper
  // first hung the suite.
  while (next.phase === 'grant') {
    const options = grantableLifelines(next, config);
    const pick = grant && options.includes(grant) ? grant : options[0];
    if (!pick) break;
    next = chooseGrant(next, pick, config);
  }
  return next;
}

describe('a run', () => {
  it('starts on the first rung with the tier inventory and the tier lives', () => {
    for (const tierId of TIER_ORDER) {
      const tier = config.tiers[tierId];
      const state = startRun('start', tierId, ADVERSARY_CATALOG, [], config);
      expect(state.phase).toBe('instinct');
      expect(state.level).toBe(1);
      expect(state.livesLeft).toBe(tier.lives);
      expect(state.bank).toBe(0);
      expect(state.board.value).toBe(tier.baseValue);
      expect(state.inventory).toEqual(tier.startingInventory);
    }
  });

  it('ends, and there is no affordance that offers one more level', () => {
    for (const tierId of TIER_ORDER) {
      const tier = config.tiers[tierId];
      let state = startRun('clear', tierId, ADVERSARY_CATALOG, [], config);
      for (let i = 0; i < tier.levels; i += 1) state = play(state, 'right');

      expect(state.phase).toBe('over');
      expect(state.ending).toBe('cleared');
      expect(state.results).toHaveLength(tier.levels);
      expect(state.bank).toBe(ladder(tier).reduce((a, b) => a + b, 0));
      // Every exit from `over` is still `over`.
      expect(advance(state, config).phase).toBe('over');
      expect(lockInstinct(state, 0)).toBe(state);
    }
  });

  it('gives the same seed and the same taps the same run', () => {
    const one = play(play(startRun('same', 'hard', ADVERSARY_CATALOG, [], config), 'right'), 'wrong');
    const two = play(play(startRun('same', 'hard', ADVERSARY_CATALOG, [], config), 'right'), 'wrong');
    expect(one).toEqual(two);
  });
});

describe('the provisional lock', () => {
  it('is what unlocks the lifelines, so the counterfactual is always observed', () => {
    const state = startRun('lock', 'normal', ADVERSARY_CATALOG, [], config);
    expect(state.phase).toBe('instinct');
    for (const id of ['fiftyFifty', 'friend', 'audience', 'host'] as LifelineId[]) {
      expect(canSpend(state, id)).toBe(false);
      expect(spendLifeline(state, id)).toBe(state);
    }

    const locked = lockInstinct(state, 2);
    expect(locked.phase).toBe('deciding');
    expect(locked.instinctIndex).toBe(2);
    expect(locked.selectedIndex).toBe(2);
    expect(canSpend(locked, 'host')).toBe(true);
  });

  it('records what would have been answered even when the answer changes', () => {
    let state = startRun('counterfactual', 'hard', ADVERSARY_CATALOG, [], config);
    const wrong = wrongIndex(state);
    state = lockInstinct(state, wrong);
    state = spendLifeline(state, 'host');
    state = selectOption(state, state.board.correctIndex);
    state = submit(state, config);

    const result = state.lastResult!;
    expect(result.instinctIndex).toBe(wrong);
    expect(result.finalIndex).toBe(result.correctIndex);
    expect(result.instinctCorrect).toBe(false);
    expect(result.correct).toBe(true);
    expect(result.reliance).toBe('aidedNeeded');
  });
});

describe('lifelines', () => {
  it('cost points, compound, and cannot be spent twice on one level', () => {
    let state = startRun('cost', 'hard', ADVERSARY_CATALOG, [], config);
    const value = state.board.value;
    state = lockInstinct(state, state.board.correctIndex);
    state = spendLifeline(state, 'host');
    expect(canSpend(state, 'host')).toBe(false);
    expect(spendLifeline(state, 'host')).toBe(state);
    state = spendLifeline(state, 'fiftyFifty');
    state = submit(state, config);

    expect(state.lastResult!.points).toBe(
      Math.round(value * config.lifelineCost.host * config.lifelineCost.fiftyFifty),
    );
    expect(state.lastResult!.lifelines.map((u) => u.id)).toEqual(['host', 'fiftyFifty']);
    expect(state.lastResult!.lifelines[0]!.order).toBe(1);
  });

  it('cannot be spent when the inventory is empty', () => {
    const state = lockInstinct(startRun('empty', 'ultimate', ADVERSARY_CATALOG, [], config), 0);
    // `ultimate` starts with no friend and no audience.
    expect(lifelineCount(state.inventory, 'friend')).toBe(0);
    expect(canSpend(state, 'friend')).toBe(false);
    expect(spendLifeline(state, 'friend')).toBe(state);
  });

  it('50:50 takes back a provisional answer it strikes out', () => {
    let state = startRun('fifty', 'hard', ADVERSARY_CATALOG, [], config);
    const struck = [0, 1, 2, 3].find(
      (i) => i !== state.board.correctIndex && i !== state.board.bluffIndex,
    )!;
    state = lockInstinct(state, struck);
    state = spendLifeline(state, 'fiftyFifty');

    expect(state.eliminated).toContain(struck);
    expect(state.selectedIndex).toBeNull();
    // The instinct is still what it was — the measurement does not get erased.
    expect(state.instinctIndex).toBe(struck);
    expect(selectOption(state, struck)).toBe(state);
    expect(submit(state, config)).toBe(state);
  });
});

describe('swapping a question', () => {
  it('is available before committing and not after', () => {
    const state = startRun('swap', 'easy', ADVERSARY_CATALOG, [], config);
    expect(canSpend(state, 'swap')).toBe(true);
    // Once the host has been read, trading the question away would keep the
    // reasoning and discard the level it was spent on.
    expect(canSpend(lockInstinct(state, 0), 'swap')).toBe(false);
  });

  it('replaces the question, keeps the rung, and remembers what was walked away from', () => {
    const state = startRun('swap', 'easy', ADVERSARY_CATALOG, [], config);
    const abandoned = state.board.round.id;
    const swapped = swapQuestion(state, config);

    expect(swapped.board.round.id).not.toBe(abandoned);
    expect(swapped.board.level).toBe(state.board.level);
    expect(swapped.board.value).toBe(state.board.value);
    expect(swapped.swappedFrom).toEqual([abandoned]);
    expect(swapped.phase).toBe('instinct');
    expect(lifelineCount(swapped.inventory, 'swap')).toBe(
      lifelineCount(state.inventory, 'swap') - 1,
    );
    expect(swapped.plan.reserve.length).toBe(state.plan.reserve.length - 1);
  });

  it('carries the skip into the record without charging points for it', () => {
    let state = swapQuestion(startRun('swap', 'easy', ADVERSARY_CATALOG, [], config), config);
    const value = state.board.value;
    state = play(state, 'right');
    expect(state.results[0]!.points).toBe(value);
    expect(state.results[0]!.swappedFrom).toHaveLength(1);
    expect(buildRunRecord(state, config).lifelineUse.swap).toBe(1);
    expect(buildRunRecord(state, config).skippedDomains).toHaveLength(1);
  });
});

describe('lives, safe points and walking away', () => {
  it('spends a life on a wrong answer and keeps going while any remain', () => {
    expect(config.tiers.easy.lives).toBeGreaterThan(1);
    let state = startRun('lives', 'easy', ADVERSARY_CATALOG, [], config);
    state = play(state, 'wrong');
    expect(state.livesLeft).toBe(config.tiers.easy.lives - 1);
    expect(state.ending).toBeNull();
    expect(state.phase).toBe('instinct');
    expect(state.results[0]!.points).toBe(0);
    expect(state.bank).toBe(0);
  });

  it('ends the run when the last life goes, and drops the bank to the locked rung', () => {
    const tier = config.tiers.hard;
    let state = startRun('fall', 'hard', ADVERSARY_CATALOG, [], config);
    for (let i = 0; i < tier.safePoints[0]!; i += 1) state = play(state, 'right');

    const locked = state.bank;
    expect(state.guaranteed).toBe(locked);
    expect(locked).toBeGreaterThan(0);

    state = play(state, 'right');
    expect(state.bank).toBeGreaterThan(locked);

    for (let i = 0; i < tier.lives; i += 1) state = play(state, 'wrong');
    expect(state.ending).toBe('outOfLives');
    expect(state.phase).toBe('over');
    expect(state.bank).toBe(locked);
    // Acceptance criterion 6: the record is rebuilt from the levels, so its
    // bank has to reach the same figure without reading the running total.
    expect(buildRunRecord(state, config).bank).toBe(locked);
  });

  it('keeps nothing when the last life goes before any rung is locked', () => {
    const tier = config.tiers.ultimate;
    let state = startRun('zero', 'ultimate', ADVERSARY_CATALOG, [], config);
    state = play(state, 'right');
    expect(state.bank).toBeGreaterThan(0);
    // Nothing is locked before `ultimate`'s first safe rung, and the ladder
    // says so before the first question.
    expect(state.level).toBeLessThan(tier.safePoints[0]!);
    for (let i = 0; i < tier.lives; i += 1) state = play(state, 'wrong');
    expect(state.ending).toBe('outOfLives');
    expect(state.bank).toBe(0);
    expect(buildRunRecord(state, config).bank).toBe(0);
  });

  it('lets a player stop and keep everything', () => {
    let state = startRun('walk', 'normal', ADVERSARY_CATALOG, [], config);
    state = play(state, 'right');
    state = play(state, 'right');
    const banked = state.bank;

    const stopped = walkAway(state);
    expect(stopped.phase).toBe('over');
    expect(stopped.ending).toBe('walkedAway');
    expect(stopped.bank).toBe(banked);
    expect(buildRunRecord(stopped, config).ending).toBe('walkedAway');
  });
});

describe('grants', () => {
  it('arrives after every fifth cleared rung and is chosen, never rolled', () => {
    let state = startRun('grant', 'normal', ADVERSARY_CATALOG, [], config);
    for (let i = 0; i < config.grantEveryLevels - 1; i += 1) state = play(state, 'right');
    expect(state.phase).toBe('instinct');

    // Clear the fifth without letting `play` consume the grant.
    state = lockInstinct(state, state.board.correctIndex);
    state = submit(state, config);
    state = advance(state, config);
    expect(state.phase).toBe('grant');
    expect(state.grantsOwed).toBe(1);

    const before = lifelineCount(state.inventory, 'audience');
    const after = chooseGrant(state, 'audience', config);
    expect(lifelineCount(after.inventory, 'audience')).toBe(before + 1);
    expect(after.phase).toBe('instinct');
    expect(after.level).toBe(config.grantEveryLevels + 1);
  });

  it('is not owed for a rung that was missed', () => {
    let state = startRun('nogrant', 'normal', ADVERSARY_CATALOG, [], config);
    for (let i = 0; i < config.grantEveryLevels - 1; i += 1) state = play(state, 'right');
    state = lockInstinct(state, wrongIndex(state));
    state = submit(state, config);
    expect(state.grantsOwed).toBe(0);
  });

  it('does not stop on a grant screen where nothing can be taken', () => {
    let state = startRun('nothing', 'easy', ADVERSARY_CATALOG, [], config);
    const full = Object.fromEntries(
      (['fiftyFifty', 'friend', 'audience', 'host', 'swap'] as LifelineId[]).map((id) => [
        id,
        config.maxPerLifeline,
      ]),
    );
    state = { ...state, inventory: full, grantsOwed: 1, phase: 'reveal' };
    expect(grantableLifelines(state, config)).toEqual([]);
    const next = advance(state, config);
    expect(next.phase).toBe('instinct');
    expect(next.level).toBe(2);
  });

  it('will not stack one lifeline past the ceiling', () => {
    let state = startRun('cap', 'easy', ADVERSARY_CATALOG, [], config);
    state = { ...state, phase: 'grant', grantsOwed: 1, inventory: { host: config.maxPerLifeline } };
    expect(grantableLifelines(state, config)).not.toContain('host');
    expect(chooseGrant(state, 'host', config)).toBe(state);
    expect(chooseGrant(state, 'friend', config).inventory.friend).toBe(1);
  });
});

describe('the two grids', () => {
  it('reads nerve off what the host was doing, with no self-report anywhere', () => {
    const cases = [
      { hostBluffs: true, follow: true, expected: 'taken' },
      { hostBluffs: true, follow: false, expected: 'heldFirm' },
      { hostBluffs: false, follow: true, expected: 'updated' },
      { hostBluffs: false, follow: false, expected: 'missedUpdate' },
    ] as const;

    for (const { hostBluffs, follow, expected } of cases) {
      let state = startRun('nerve', 'hard', ADVERSARY_CATALOG, [], config);
      state = { ...state, board: { ...state.board, hostKind: hostBluffs ? 'bluff' : 'honest' } };
      const hostPick = hostBluffs ? state.board.bluffIndex : state.board.correctIndex;
      const instinct = [0, 1, 2, 3].find((i) => i !== hostPick)!;

      state = lockInstinct(state, instinct);
      state = spendLifeline(state, 'host');
      state = selectOption(state, follow ? hostPick : instinct);
      state = submit(state, config);
      expect(state.lastResult!.nerve).toBe(expected);
    }
  });

  it('does not score nerve on a level where the instinct already agreed with the host', () => {
    let state = startRun('agree', 'hard', ADVERSARY_CATALOG, [], config);
    state = { ...state, board: { ...state.board, hostKind: 'honest' } };
    state = lockInstinct(state, state.board.correctIndex);
    state = spendLifeline(state, 'host');
    state = submit(state, config);
    expect(state.lastResult!.nerve).toBeNull();
    expect(state.lastResult!.host).not.toBeNull();
  });

  it('reads reliance off whether the help was needed', () => {
    const cases = [
      { instinct: 'right', lifelines: [] as LifelineId[], expected: 'soloRight' },
      { instinct: 'wrong', lifelines: [] as LifelineId[], expected: 'soloWrong' },
      { instinct: 'right', lifelines: ['fiftyFifty'] as LifelineId[], expected: 'aidedUnneeded' },
      { instinct: 'wrong', lifelines: ['fiftyFifty'] as LifelineId[], expected: 'aidedNeeded' },
    ] as const;

    for (const { instinct, lifelines, expected } of cases) {
      let state = startRun('reliance', 'hard', ADVERSARY_CATALOG, [], config);
      state = lockInstinct(
        state,
        instinct === 'right' ? state.board.correctIndex : state.board.bluffIndex,
      );
      for (const id of lifelines) state = spendLifeline(state, id);
      state = selectOption(state, state.board.correctIndex);
      state = submit(state, config);
      expect(state.lastResult!.reliance).toBe(expected);
    }
  });

  it('counts a correct instinct that was talked out of itself', () => {
    let state = startRun('talked', 'hard', ADVERSARY_CATALOG, [], config);
    state = { ...state, board: { ...state.board, hostKind: 'bluff' } };
    state = lockInstinct(state, state.board.correctIndex);
    state = spendLifeline(state, 'host');
    state = selectOption(state, state.board.bluffIndex);
    state = submit(state, config);
    state = advance(state, config);

    const record = buildRunRecord(state, config);
    expect(record.talkedOut).toBe(1);
    expect(record.nerve.taken).toBe(1);
    expect(record.bluffsFaced).toBe(1);
  });
});

describe('the record', () => {
  it('is recomputed from the levels, never accumulated', () => {
    let state = startRun('record', 'normal', ADVERSARY_CATALOG, [], config);
    state = play(state, 'right', ['audience']);
    state = play(state, 'wrong');
    state = play(state, 'right');

    const record = buildRunRecord(state, config);
    expect(record.levelsAttempted).toBe(3);
    expect(record.levelsCleared).toBe(2);
    expect(record.bank).toBe(state.results.reduce((sum, r) => sum + r.points, 0));
    expect(record.soloLevels + record.aidedLevels).toBe(3);
    expect(record.firstReach.audience).toBe(1);
    expect(record.lifelineUse.audience).toBe(1);
    expect(record.livesLost).toBe(1);
    expect(
      Object.values(record.reliance).reduce((a, b) => a + b, 0),
    ).toBe(3);
  });
});

/**
 * The property the interval game rested on, carried across.
 *
 * v1's payout was a proper scoring rule because a calibration game you can beat
 * teaches you to beat it. Four options have no interval to score, so the
 * equivalent obligation is this: **no lifeline may be worth buying regardless
 * of what the player knows.** If one were, the optimal run would be to spend it
 * every level, the reliance grid would read the same for everyone, and the
 * diagnosis would be measuring the price list rather than the person's habits.
 *
 * The check is a crossover: for each lifeline there must be a knowledge level
 * below which buying it wins and above which answering alone wins, and that
 * crossover must sit strictly inside (0, 1).
 */
describe('no lifeline is worth buying no matter what you know', () => {
  const cost = config.lifelineCost;

  it('50:50 loses to a player who already knows, and wins for one who does not', () => {
    // Buying leaves two options: the correct one and the trap.
    const crossover = (0.5 * cost.fiftyFifty) / (1 - 0.5 * cost.fiftyFifty);
    expect(crossover).toBeGreaterThan(0);
    expect(crossover).toBeLessThan(1);

    const evBuy = (p: number) => (p + (1 - p) * 0.5) * cost.fiftyFifty;
    expect(evBuy(crossover - 0.1)).toBeGreaterThan(crossover - 0.1);
    expect(evBuy(crossover + 0.1)).toBeLessThan(crossover + 0.1);
  });

  it('the host loses to a player who already knows, in every mode', () => {
    for (const tierId of TIER_ORDER) {
      const tier = config.tiers[tierId];
      // Following the host blindly pays only when the host is being sound.
      const crossover = (1 - tier.hostBluffRate) * cost.host;
      expect(crossover).toBeGreaterThan(0);
      expect(crossover).toBeLessThan(1);
    }
  });

  /**
   * Pricing the host below the other answer-naming lifelines made reaching for
   * it first correct arithmetic rather than a preference — and `host_first`
   * would then have measured the price list instead of the player.
   */
  it('does not make the host the cheapest way to buy an answer', () => {
    expect(cost.host).toBe(cost.friend);
    expect(cost.host).toBe(cost.audience);
  });

  it('the friend loses to a player who already knows, at every confidence they state', () => {
    for (const confidence of [0.5, 0.6, 0.7, 0.8, 0.9]) {
      const crossover = confidence * cost.friend;
      expect(crossover).toBeGreaterThan(0);
      expect(crossover).toBeLessThan(1);
    }
  });

  it('is also enforced by scarcity: no mode can afford help on every rung', () => {
    for (const tierId of TIER_ORDER) {
      const tier = config.tiers[tierId];
      const held = Object.values(tier.startingInventory).reduce((a, b) => a + (b ?? 0), 0);
      const granted = Math.floor(tier.levels / config.grantEveryLevels);
      expect(held + granted).toBeLessThan(tier.levels);
    }
  });
});
