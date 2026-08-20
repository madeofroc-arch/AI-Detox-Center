/**
 * Screen-level rules for The Adversary that no other gate can see.
 *
 * The core reducer is tested exhaustively in `packages/core/__tests__`. What
 * cannot be tested there is whether the screen actually offers what the rules
 * allow and withholds what they do not — and the app's history says that is
 * where the real defects live: the last accessibility pass found three classes
 * of bug that every type check and lint had waved through.
 *
 * These tests are deliberately content-agnostic. The run seed contains the
 * date, so which question comes up changes daily; a test that asserted on a
 * particular round would pass today and fail tomorrow for no reason.
 */
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { emptyAppData } from '@ai-detox/core';
import type { AppData, RunRecord } from '@ai-detox/core';
import Adversary from '../src/app/adversary';
import Index from '../src/app/index';
import Prescription from '../src/app/prescription';
import { EN } from '../src/i18n/en';
import { useAppStore } from '../src/state/store';
import { routerMock } from './setup';

function seed(over: Partial<AppData> = {}) {
  useAppStore.setState({
    hydrated: true,
    saveError: false,
    data: { ...emptyAppData(), ...over },
  });
}

/** Tier cards all carry the same button; index picks the mode. */
const TIERS = { easy: 0, normal: 1, hard: 2, ultimate: 3 } as const;

function begin(tier: keyof typeof TIERS) {
  render(<Adversary />);
  fireEvent.click(screen.getAllByRole('button', { name: EN.game.begin })[TIERS[tier]]!);
}

const options = () => screen.getAllByRole('radio');
const label = (el: Element) => el.getAttribute('aria-label') ?? '';
const disabled = (el: Element) => el.getAttribute('aria-disabled') === 'true';
const lifeline = (name: string) =>
  screen.getAllByRole('button').find((b) => label(b).startsWith(name))!;
const finalAnswer = () =>
  screen.queryAllByRole('button').find((b) => label(b).startsWith(EN.game.lockAnswer));

describe('the front door', () => {
  /**
   * For one build the game was reachable only by typing `/adversary`: opening
   * the app landed on the abandoned dependency tracker and nothing anywhere
   * linked to the new product. Nothing in the type checker, the linter or the
   * export could see it, and the person who noticed was the owner.
   */
  it('is the game', () => {
    seed();
    render(<Index />);
    expect(screen.getByTestId('redirect').getAttribute('data-href')).toBe('/adversary');
  });

  it('is the game even before anything has been played', () => {
    seed({ settings: { onboardingComplete: false, focusCategories: [], language: 'system' } });
    render(<Index />);
    expect(screen.getByTestId('redirect').getAttribute('data-href')).toBe('/adversary');
  });

  it('offers the one setting the game cannot do without', () => {
    seed();
    render(<Adversary />);
    const languages = screen
      .getAllByRole('radio')
      .map((r) => r.getAttribute('aria-label') ?? '');
    expect(languages).toContain(EN.game.languageSystem);
    expect(languages).toContain('English');
  });
});

/**
 * Export and erase used to live on a settings tab. That tab went with the
 * tracker, and a local-first product that quietly loses its erase button has
 * quietly stopped being one (ADR-0003). The two confirmations are the rule
 * the old screen was tested against, and it moved with the button.
 */
describe('erasing everything', () => {
  const confirmSpy = vi.spyOn(window, 'confirm');
  afterEach(() => confirmSpy.mockReset());

  const runsLeft = () => useAppStore.getState().data.adversaryRuns.length;

  it('stops at the first refusal', async () => {
    seed({ adversaryRuns: [record()] });
    confirmSpy.mockReturnValue(false);
    render(<Prescription />);

    fireEvent.click(screen.getByText(EN.game.deleteAll));
    await waitFor(() => expect(confirmSpy).toHaveBeenCalledTimes(1));
    expect(runsLeft()).toBe(1);
  });

  it('stops at the second refusal, after the first was accepted', async () => {
    seed({ adversaryRuns: [record()] });
    confirmSpy.mockReturnValueOnce(true).mockReturnValueOnce(false);
    render(<Prescription />);

    fireEvent.click(screen.getByText(EN.game.deleteAll));
    await waitFor(() => expect(confirmSpy).toHaveBeenCalledTimes(2));
    expect(runsLeft()).toBe(1);
  });

  it('erases, and returns to a game with nothing behind it', async () => {
    seed({ adversaryRuns: [record()] });
    confirmSpy.mockReturnValue(true);
    render(<Prescription />);

    fireEvent.click(screen.getByText(EN.game.deleteAll));
    await waitFor(() => expect(runsLeft()).toBe(0));
    expect(routerMock.replace).toHaveBeenCalledWith('/adversary');
  });
});

describe('the provisional lock', () => {
  /**
   * The measurement rests entirely on this ordering: what the player would have
   * answered with no help has to be recorded before any help exists. A screen
   * that let a lifeline be spent first would leave the RELIANCE grid measuring
   * nothing, and nothing else in the stack would notice.
   */
  it('is the only thing that opens the lifelines', () => {
    seed();
    begin('hard');

    expect(screen.getByText(EN.game.pickFirst)).toBeInTheDocument();
    for (const name of [EN.game.lifelineName.host, EN.game.lifelineName.fiftyFifty]) {
      expect(disabled(lifeline(name))).toBe(true);
    }
    expect(finalAnswer()).toBeUndefined();

    fireEvent.click(options()[0]!);

    expect(disabled(lifeline(EN.game.lifelineName.host))).toBe(false);
    expect(finalAnswer()).toBeDefined();
    expect(options()[0]!.getAttribute('aria-checked')).toBe('true');
  });

  it('does not offer the swap once an answer is committed', () => {
    seed();
    begin('easy');
    expect(disabled(lifeline(EN.game.lifelineName.swap))).toBe(false);
    fireEvent.click(options()[0]!);
    expect(disabled(lifeline(EN.game.lifelineName.swap))).toBe(true);
  });
});

describe('50:50', () => {
  it('will not let a struck-out option be submitted', () => {
    seed();
    begin('hard');
    fireEvent.click(options()[0]!);
    fireEvent.click(lifeline(EN.game.lifelineName.fiftyFifty));

    const struck = options().filter((o) => label(o).includes(EN.game.struckOut));
    expect(struck).toHaveLength(2);

    if (label(options()[0]!).includes(EN.game.struckOut)) {
      // The answer the board took away has to be made again.
      expect(screen.getByText(EN.game.reselect)).toBeInTheDocument();
      expect(finalAnswer()).toBeUndefined();
    }

    fireEvent.click(struck[0]!);
    expect(struck[0]!.getAttribute('aria-checked')).toBe('false');
  });
});

describe('the reveal', () => {
  /**
   * The beat this product exists for is a confident argument followed by its
   * grading. An earlier build only ever showed it on levels where the host had
   * been bought, so it fired about once a run and most of the authored bluffs
   * were content nobody would ever read.
   */
  it('grades the host on every question, including the ones it was not asked', () => {
    seed();
    begin('hard');
    fireEvent.click(options()[0]!);
    fireEvent.click(finalAnswer()!);

    expect(screen.getByText(EN.game.hostLeadUnasked)).toBeInTheDocument();
    const verdicts = [EN.game.hostWasBluffing, EN.game.hostWasSound];
    expect(verdicts.some((v) => screen.queryByText(v) !== null)).toBe(true);
  });

  it('marks the answer and the pick on the options themselves', () => {
    seed();
    begin('hard');
    fireEvent.click(options()[0]!);
    fireEvent.click(finalAnswer()!);

    const marked = options().map(label);
    expect(marked.filter((l) => l.includes(EN.game.gotIt))).toHaveLength(1);
    for (const option of options()) expect(disabled(option)).toBe(true);
  });
});

describe('a run ends', () => {
  /**
   * Principle 8 bans a session that does not end. The rule is not "the run has
   * a length" — it is that no affordance anywhere offers one more question.
   */
  it('and nothing on the record offers another question', () => {
    seed();
    begin('normal');
    fireEvent.click(options()[0]!);
    fireEvent.click(screen.getByRole('button', { name: new RegExp(EN.game.walkAway) }));

    expect(screen.getByText(EN.game.endingWalkedAway)).toBeInTheDocument();
    const buttons = screen.getAllByRole('button').map((b) => b.textContent ?? '');
    expect(buttons.some((t) => t.includes(EN.game.nextLevel))).toBe(false);
    expect(buttons.some((t) => t.includes(EN.game.playAgain))).toBe(true);
  });
});

/** A record with nothing in it, so each case states only what it is about. */
function record(patch: Partial<RunRecord> = {}): RunRecord {
  return {
    tier: 'hard',
    seed: 'seed',
    ending: 'cleared',
    levelsCleared: 0,
    levelsAttempted: 12,
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

describe('the prescription', () => {
  it('says how much is still missing rather than guessing from one run', () => {
    seed({ adversaryRuns: [record({ nerve: { heldFirm: 1, missedUpdate: 0, updated: 0, taken: 1 } })] });
    render(<Prescription />);

    expect(screen.getByText(EN.game.pendingTitle)).toBeInTheDocument();
    expect(screen.getByText(EN.game.rungDefault)).toBeInTheDocument();
    expect(screen.queryByText(EN.game.instructionsTitle)).toBeNull();
  });

  /**
   * `signals.yaml` forbids inventing difficulty to make something feel
   * educational. Without this case every player who plays enough is told
   * something is wrong with them, which is the failure mode the previous
   * product shipped.
   */
  it('can say that nothing needs changing', () => {
    seed({
      adversaryRuns: [
        record({
          nerve: { heldFirm: 5, missedUpdate: 1, updated: 5, taken: 1 },
          reliance: { soloRight: 6, soloWrong: 1, aidedUnneeded: 1, aidedNeeded: 5 },
          soloLevels: 7,
          aidedLevels: 6,
          firstReach: { fiftyFifty: 3, friend: 1, audience: 2, host: 1, swap: 0 },
        }),
      ],
    });
    render(<Prescription />);

    expect(screen.getByText(EN.game.cleanTitle)).toBeInTheDocument();
    expect(screen.queryByText(EN.game.instructionsTitle)).toBeNull();
  });

  /**
   * The rung is the one value that lands in a real config key, and its
   * direction is the easy thing to get backwards: in `ladder.yaml` a higher
   * number means MORE help, while `signals.yaml`'s prose calls that "down".
   */
  it('starts the ladder lower for help bought before it was needed', () => {
    seed({
      adversaryRuns: [
        record({
          reliance: { soloRight: 0, soloWrong: 0, aidedUnneeded: 5, aidedNeeded: 2 },
          aidedLevels: 7,
        }),
      ],
    });
    render(<Prescription />);

    expect(screen.getByText(EN.game.rungWhyLess)).toBeInTheDocument();
    // The lit row on the tower, not a bare number: the row is what a player
    // reads, and it carries the rung's name beside it.
    expect(
      screen.getByText(`${EN.game.rungName[1]} · ${EN.game.rungHere}`),
    ).toBeInTheDocument();
  });

  /**
   * The one rule in `ladder.yaml` that is not up for negotiation: "just give
   * me the answer" always works. The tower is where that promise becomes
   * visible, and it has to be visible whatever the prescription says.
   */
  it('shows the whole ladder, with the full answer marked always reachable', () => {
    seed({
      adversaryRuns: [
        record({
          reliance: { soloRight: 0, soloWrong: 0, aidedUnneeded: 5, aidedNeeded: 2 },
          aidedLevels: 7,
        }),
      ],
    });
    render(<Prescription />);

    for (const level of [2, 3, 4, 5] as const) {
      expect(screen.getByText(EN.game.rungName[level])).toBeInTheDocument();
    }
    expect(screen.getByText(new RegExp(`${EN.game.rungAlwaysOpen}$`))).toBeInTheDocument();
  });

  it('offers a way back to the game, so the record is not a dead end', () => {
    seed({ adversaryRuns: [record()] });
    render(<Prescription />);

    fireEvent.click(screen.getAllByText(EN.game.backToGame)[0]!);
    expect(routerMock.back).toHaveBeenCalled();
  });

  it('shows the block itself, so the copy button is a convenience and not the only route', () => {
    seed({ adversaryRuns: [record()] });
    render(<Prescription />);

    const block = screen.getByText(/^# Human Mode/);
    expect(block).toBeInTheDocument();
    expect(block.textContent).toContain('default_rung:');
    expect(block.textContent).toContain('profile:');
  });
});
