/**
 * A run, as a pure reducer.
 *
 * Every transition takes a `RunState` and returns a new one. Nothing here reads
 * a clock, generates a random number, or touches storage, so a whole run
 * replays exactly from `(seed, tier, the list of calls made below)` — which is
 * what makes a bug report reproducible and what lets the record be recomputed
 * rather than accumulated.
 *
 * A call that does not make sense in the current phase returns the state
 * unchanged rather than throwing. The UI never offers those, and a reducer that
 * crashes on a double tap is worse than one that ignores it. Impossible *data*
 * still throws — see `buildLevel`.
 */
import type { QuizConfig, TierConfig } from './quiz-config';
import { levelValue } from './quiz-config';
import { buildLevel, fiftyFiftyEliminations, hostCall } from './quiz-board';
import { nearestByDifficulty, planRun } from './quiz-selection';
import type { RunPlan } from './quiz-selection';
import type { AdversaryRound, NerveCell } from './types';
import type {
  Inventory,
  LevelResult,
  LifelineId,
  LifelineUse,
  QuizLevel,
  RelianceCell,
  RunRecord,
  RunState,
  TierId,
} from './quiz-types';
import { LIFELINE_IDS } from './quiz-types';

/** What the player did when the host spoke, crossed with what the host was doing. */
function nerveOf(moved: boolean, hostWasBluffing: boolean): NerveCell {
  if (hostWasBluffing) return moved ? 'taken' : 'heldFirm';
  return moved ? 'updated' : 'missedUpdate';
}

function boardFor(
  seed: string,
  plan: RunPlan,
  level: number,
  tier: TierConfig,
  round?: AdversaryRound,
): QuizLevel {
  const planned = plan.levels[level - 1];
  if (!planned) throw new Error(`No planned level ${level} for tier ${tier.id}`);
  return buildLevel(
    seed,
    round ?? planned.round,
    tier,
    level,
    planned.value,
    planned.hostBluffs,
  );
}

/** Clear everything that belongs to one level, keeping the run-level totals. */
function freshLevel(state: RunState, board: QuizLevel, swappedFrom: readonly string[]): RunState {
  return {
    ...state,
    phase: 'instinct',
    level: board.level,
    board,
    instinctIndex: null,
    selectedIndex: null,
    spent: [],
    eliminated: [],
    swappedFrom,
    lastResult: null,
  };
}

export function startRun(
  seed: string,
  tierId: TierId,
  catalog: readonly AdversaryRound[],
  playedIds: readonly string[],
  config: QuizConfig,
): RunState {
  const tier = config.tiers[tierId];
  const plan = planRun(seed, catalog, playedIds, tier, config);
  if (plan.levels.length === 0) throw new Error(`Tier ${tierId} produced an empty plan`);

  return {
    tier: tierId,
    seed,
    phase: 'instinct',
    level: 1,
    board: boardFor(seed, plan, 1, tier),
    inventory: { ...tier.startingInventory },
    livesLeft: tier.lives,
    results: [],
    bank: 0,
    guaranteed: 0,
    ending: null,
    instinctIndex: null,
    selectedIndex: null,
    spent: [],
    eliminated: [],
    swappedFrom: [],
    lastResult: null,
    grantsOwed: 0,
    plan,
  };
}

/**
 * The provisional lock — "is that your final answer?".
 *
 * No lifeline exists until this happens, and that ordering is the whole
 * measurement: it records what the player would have answered with no help, so
 * the counterfactual is observed rather than asked for. It is also the beat
 * every game show already has, which is why it costs the player nothing to
 * understand.
 */
export function lockInstinct(state: RunState, index: number): RunState {
  if (state.phase !== 'instinct') return state;
  if (index < 0 || index > 3) return state;
  return { ...state, phase: 'deciding', instinctIndex: index, selectedIndex: index };
}

/** Change the provisional answer after help. Available only once an instinct exists. */
export function selectOption(state: RunState, index: number): RunState {
  if (state.phase !== 'deciding') return state;
  if (index < 0 || index > 3) return state;
  if (state.eliminated.includes(index)) return state;
  return { ...state, selectedIndex: index };
}

export function lifelineCount(inventory: Inventory, id: LifelineId): number {
  return inventory[id] ?? 0;
}

/** Whether a lifeline can be spent right now, and why the UI may show it. */
export function canSpend(state: RunState, id: LifelineId): boolean {
  if (lifelineCount(state.inventory, id) <= 0) return false;
  if (id === 'swap') {
    // Only before committing. Spending it after the help has been read would
    // let a player keep the host's reasoning and discard the question, and it
    // would put lifeline spends on a level that never resolved.
    return state.phase === 'instinct' && state.plan.reserve.length > 0;
  }
  if (state.phase !== 'deciding') return false;
  return !state.spent.some((use) => use.id === id);
}

export function spendLifeline(state: RunState, id: LifelineId): RunState {
  if (id === 'swap') return state;
  if (!canSpend(state, id)) return state;

  const spent: LifelineUse[] = [...state.spent, { id, order: state.spent.length + 1 }];
  const inventory = { ...state.inventory, [id]: lifelineCount(state.inventory, id) - 1 };

  if (id !== 'fiftyFifty') return { ...state, spent, inventory };

  const eliminated = fiftyFiftyEliminations(state.seed, state.board);
  return {
    ...state,
    spent,
    inventory,
    eliminated,
    // A struck-out provisional answer has to be re-made. That the board took it
    // away is itself information, and leaving it selected would let a player
    // submit an option the screen has crossed out.
    selectedIndex:
      state.selectedIndex !== null && eliminated.includes(state.selectedIndex)
        ? null
        : state.selectedIndex,
  };
}

/** Trade the question for another of comparable difficulty. Costs an item, not points. */
export function swapQuestion(state: RunState, config: QuizConfig): RunState {
  if (!canSpend(state, 'swap')) return state;
  const tier = config.tiers[state.tier];
  const planned = state.plan.levels[state.level - 1];
  if (!planned) return state;

  const replacement = nearestByDifficulty(state.plan.reserve, planned.targetDifficulty);
  if (replacement === null) return state;

  const reserve = state.plan.reserve.filter((r) => r.id !== replacement.id);
  const plan: RunPlan = { levels: state.plan.levels, reserve };
  const board = boardFor(state.seed, plan, state.level, tier, replacement);

  return freshLevel(
    {
      ...state,
      plan,
      inventory: { ...state.inventory, swap: lifelineCount(state.inventory, 'swap') - 1 },
    },
    board,
    [...state.swappedFrom, state.board.round.id],
  );
}

/** Lock the final answer and resolve the level. */
export function submit(state: RunState, config: QuizConfig): RunState {
  if (state.phase !== 'deciding') return state;
  const { instinctIndex, selectedIndex, board } = state;
  if (instinctIndex === null || selectedIndex === null) return state;

  const tier = config.tiers[state.tier];
  const correct = selectedIndex === board.correctIndex;
  const instinctCorrect = instinctIndex === board.correctIndex;
  const aided = state.spent.length > 0;

  const askedHost = state.spent.some((use) => use.id === 'host');
  const host = askedHost ? hostCall(board) : null;

  let nerve: NerveCell | null = null;
  if (host !== null && instinctIndex !== host.index) {
    nerve = nerveOf(selectedIndex === host.index, host.kind === 'bluff');
  }

  const reliance: RelianceCell = aided
    ? instinctCorrect
      ? 'aidedUnneeded'
      : 'aidedNeeded'
    : instinctCorrect
      ? 'soloRight'
      : 'soloWrong';

  const multiplier = state.spent.reduce((m, use) => m * config.lifelineCost[use.id], 1);
  const points = correct ? Math.round(board.value * multiplier) : 0;

  const result: LevelResult = {
    level: board.level,
    roundId: board.round.id,
    domain: board.round.domain,
    difficulty: board.round.difficulty,
    correctIndex: board.correctIndex,
    instinctIndex,
    finalIndex: selectedIndex,
    lifelines: state.spent,
    swappedFrom: state.swappedFrom,
    host,
    correct,
    instinctCorrect,
    points,
    nerve,
    reliance,
  };

  const livesLeft = correct ? state.livesLeft : state.livesLeft - 1;
  const outOfLives = livesLeft <= 0;
  const bank = correct ? state.bank + points : state.bank;
  const guaranteed =
    correct && tier.safePoints.includes(board.level) ? bank : state.guaranteed;
  const grantsOwed =
    correct && board.level % config.grantEveryLevels === 0
      ? state.grantsOwed + 1
      : state.grantsOwed;

  return {
    ...state,
    phase: 'reveal',
    results: [...state.results, result],
    lastResult: result,
    livesLeft: Math.max(0, livesLeft),
    // Running out drops the bank to the last locked rung. The ladder and the
    // fallback are both stated before the first question, so nothing that was
    // ever presented as owned is taken away.
    bank: outOfLives ? guaranteed : bank,
    guaranteed,
    grantsOwed: outOfLives ? 0 : grantsOwed,
    ending: outOfLives ? 'outOfLives' : null,
  };
}

/** Leave the reveal: to the grant screen, the next level, or the end. */
export function advance(state: RunState, config: QuizConfig): RunState {
  if (state.phase !== 'reveal' && state.phase !== 'grant') return state;
  if (state.ending !== null) return { ...state, phase: 'over' };
  // A grant with nothing left to take is not a screen, it is a dead end: every
  // choice on it would be a no-op and the run could not move.
  if (state.grantsOwed > 0 && grantableLifelines(state, config).length > 0) {
    return { ...state, phase: 'grant' };
  }

  const tier = config.tiers[state.tier];
  const next = state.level + 1;
  if (next > tier.levels || next > state.plan.levels.length) {
    return { ...state, phase: 'over', ending: 'cleared' };
  }
  return freshLevel(state, boardFor(state.seed, state.plan, next, tier), []);
}

/**
 * Take a lifeline for clearing a milestone.
 *
 * The player chooses. A random drop would be a variable reward, which principle
 * 8 bans outright, and the choice is worth more than the randomness anyway:
 * what someone decides to stock up on is itself a reading of how they expect to
 * get into trouble.
 */
export function chooseGrant(state: RunState, id: LifelineId, config: QuizConfig): RunState {
  if (state.phase !== 'grant' || state.grantsOwed <= 0) return state;
  if (lifelineCount(state.inventory, id) >= config.maxPerLifeline) return state;


  const granted: RunState = {
    ...state,
    inventory: { ...state.inventory, [id]: lifelineCount(state.inventory, id) + 1 },
    grantsOwed: state.grantsOwed - 1,
  };
  return advance({ ...granted, phase: 'reveal' }, config);
}

/** Which lifelines a grant may still be spent on. */
export function grantableLifelines(state: RunState, config: QuizConfig): LifelineId[] {
  return LIFELINE_IDS.filter(
    (id) => lifelineCount(state.inventory, id) < config.maxPerLifeline,
  );
}

/** Stop and keep the bank. Available whenever a question is on screen. */
export function walkAway(state: RunState): RunState {
  if (state.phase === 'over') return state;
  return { ...state, phase: 'over', ending: 'walkedAway' };
}

const EMPTY_NERVE: Record<NerveCell, number> = {
  heldFirm: 0,
  missedUpdate: 0,
  updated: 0,
  taken: 0,
};

const EMPTY_RELIANCE: Record<RelianceCell, number> = {
  soloRight: 0,
  soloWrong: 0,
  aidedUnneeded: 0,
  aidedNeeded: 0,
};

function emptyCounts(): Record<LifelineId, number> {
  return { fiftyFifty: 0, friend: 0, audience: 0, host: 0, swap: 0 };
}

/**
 * The record, recomputed from results rather than accumulated — so no number on
 * screen can drift away from the levels that produced it.
 */
export function buildRunRecord(state: RunState, config: QuizConfig): RunRecord {
  const tier = config.tiers[state.tier];
  const nerve = { ...EMPTY_NERVE };
  const reliance = { ...EMPTY_RELIANCE };
  const lifelineUse = emptyCounts();
  const firstReach = emptyCounts();
  const skippedDomains: string[] = [];
  const roundIds: string[] = [];

  let levelsCleared = 0;
  let talkedOut = 0;
  let soloLevels = 0;
  let aidedLevels = 0;
  let bluffsFaced = 0;
  let soundArgumentsFaced = 0;

  for (const result of state.results) {
    roundIds.push(...result.swappedFrom, result.roundId);
    if (result.correct) levelsCleared += 1;
    if (result.nerve) nerve[result.nerve] += 1;
    reliance[result.reliance] += 1;

    for (const use of result.lifelines) {
      lifelineUse[use.id] += 1;
      if (use.order === 1) firstReach[use.id] += 1;
    }
    for (const abandoned of result.swappedFrom) {
      lifelineUse.swap += 1;
      const round = state.plan.levels.find((l) => l.round.id === abandoned);
      skippedDomains.push(round ? round.round.domain : abandoned);
    }

    if (result.lifelines.length > 0) aidedLevels += 1;
    else soloLevels += 1;

    if (result.instinctCorrect && !result.correct) talkedOut += 1;
    if (result.host?.kind === 'bluff') bluffsFaced += 1;
    if (result.host?.kind === 'honest') soundArgumentsFaced += 1;
  }

  // Recomputed from the levels rather than read off the running total, so no
  // number on the record can drift away from the plays that produced it. The
  // fallback is part of the recomputation: a run that ran out of lives keeps
  // only what it had banked at the last locked rung.
  const tally = state.results.reduce(
    (acc, result) => {
      const total = acc.total + result.points;
      return {
        total,
        locked: result.correct && tier.safePoints.includes(result.level) ? total : acc.locked,
      };
    },
    { total: 0, locked: 0 },
  );
  const bank = state.ending === 'outOfLives' ? tally.locked : tally.total;

  return {
    tier: state.tier,
    seed: state.seed,
    ending: state.ending ?? 'walkedAway',
    levelsCleared,
    levelsAttempted: state.results.length,
    bank,
    livesLost: tier.lives - state.livesLeft,
    nerve,
    reliance,
    lifelineUse,
    firstReach,
    talkedOut,
    soloLevels,
    aidedLevels,
    bluffsFaced,
    soundArgumentsFaced,
    skippedDomains,
    // The level in progress counts as seen: a run abandoned on question nine
    // should not offer that same question first next time.
    roundIds:
      state.phase === 'over' && state.lastResult?.roundId !== state.board.round.id
        ? [...roundIds, ...state.swappedFrom, state.board.round.id]
        : roundIds,
  };
}

/**
 * Add a finished run to the stored history, newest last, bounded.
 *
 * The cap exists because the diagnosis reads every record and the file is a
 * single document; a hundred runs is far more than any finding needs and still
 * a few tens of kilobytes.
 */
export function appendRunRecord(
  history: readonly RunRecord[],
  record: RunRecord,
  max = 100,
): RunRecord[] {
  return [...history, record].slice(-max);
}

/** Every round id the stored history has already shown. */
export function playedRoundIds(history: readonly RunRecord[]): string[] {
  return history.flatMap((record) => [...record.roundIds]);
}

/** The ladder rung values, for the ladder the player can see the whole time. */
export function runLadder(state: RunState, config: QuizConfig): number[] {
  const tier = config.tiers[state.tier];
  return Array.from({ length: tier.levels }, (_, i) => levelValue(tier, i + 1));
}
