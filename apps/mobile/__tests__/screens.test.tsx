/**
 * Screen-level rules that no other gate can see.
 *
 * Each of these is a rule written down in `docs/design/` that the type
 * checker, the linter and `expo export` are all blind to — and one of them
 * (the Home additive line) shipped broken and was found by opening the app,
 * which is the gap issue #2 was opened about.
 */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  computeUsageStats,
  emptyAppData,
  eventsInWindow,
  DEFAULT_SCORING_CONFIG,
} from '@ai-detox/core';
import type { AIUsageCategory, AIUsageEvent, AppData } from '@ai-detox/core';
import Home from '../src/app/(tabs)/home';
import Report from '../src/app/report';
import Settings from '../src/app/(tabs)/settings';
import { EN } from '../src/i18n/en';
import { useAppStore } from '../src/state/store';
import { routerMock } from './setup';

let seq = 0;
const daysAgo = (days: number): string =>
  new Date(Date.now() - days * 86_400_000).toISOString();

function ev(
  category: AIUsageCategory,
  opts: { attemptedFirst?: boolean; usedAI?: boolean; immediate?: boolean } = {},
): AIUsageEvent {
  seq += 1;
  return {
    id: `s${seq}`,
    timestamp: daysAgo(2),
    category,
    source: 'gate',
    attemptedFirst: opts.attemptedFirst ?? false,
    usedAI: opts.usedAI ?? true,
    proceededImmediately: opts.immediate ?? false,
  };
}
const rep = (n: number, make: () => AIUsageEvent): AIUsageEvent[] =>
  Array.from({ length: n }, make);

function seed(over: Partial<AppData> = {}) {
  useAppStore.setState({
    hydrated: true,
    saveError: false,
    data: { ...emptyAppData(), ...over },
  });
}

describe('Home never leaves a band standing alone', () => {
  it('still says something additive when there is nothing yet to credit', () => {
    // The exact user the rule exists to protect: heavy dependent use, nothing
    // resolved alone, no reflection, no practice. The first version of this
    // line was reducer-only, so it rendered NOTHING here — leaving a bare
    // "Running on AI" verdict for the person facing the worst headline.
    seed({ events: rep(14, () => ev('direct_delegation', { immediate: true })) });

    render(<Home />);

    expect(screen.getByText(EN.home.strengthFallback)).toBeInTheDocument();
  });

  it('credits practice when there is practice but no reducer signal', () => {
    const today = new Date().toISOString().slice(0, 10);
    seed({
      events: rep(14, () => ev('direct_delegation', { immediate: true })),
      challengeHistory: [
        {
          id: 'a1',
          challengeId: 'th_steelman',
          dateKey: today,
          status: 'completed',
          category: 'thinking',
          difficulty: 3,
        },
      ],
    });

    render(<Home />);

    expect(screen.getByText(EN.home.strengthPractice(1))).toBeInTheDocument();
  });

  it('reads the share the sentence actually claims, not a different denominator', () => {
    // "% of your AI uses" once rendered reflections over ALL moments, so it
    // could say 63% when the true figure was 0%. The line about moments
    // handled without AI has its own denominator too.
    const events = [
      ...rep(12, () => ev('direct_delegation', { immediate: true })),
      ...rep(6, () => ev('lookup', { attemptedFirst: true, usedAI: false })),
    ];
    seed({ events });

    const windowDays = DEFAULT_SCORING_CONFIG.windowDays;
    const stats = computeUsageStats(
      eventsInWindow(events, new Date().toISOString(), windowDays),
      windowDays,
    );
    const expected = Math.round(stats.fractionResolvedWithoutAI * 100);

    render(<Home />);

    expect(screen.getByText(EN.home.strengthIndependent(expected))).toBeInTheDocument();
    expect(expected).toBe(33); // 6 of 18, not 6 of 12 and not 6 of 6
  });

  it('shows a dash rather than a verdict before the evidence gate opens', () => {
    seed({ events: rep(3, () => ev('direct_delegation')) });

    render(<Home />);

    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.getByText(EN.home.scoreEmpty)).toBeInTheDocument();
  });
});

describe('the Brain Report adds up on screen', () => {
  it('the numbers a user can read off equal the number on the dial', () => {
    // The end-to-end form of #6: parse what the screen actually says, the way
    // a person would, and check the arithmetic they were invited to check.
    seed({
      events: [
        ...rep(9, () => ev('direct_delegation', { immediate: true })),
        ...rep(4, () => ev('reassurance_seeking')),
        ...rep(3, () => ev('instant_help', { immediate: true })),
        ...rep(6, () => ev('lookup', { attemptedFirst: true, usedAI: false })),
      ],
    });

    render(<Report />);

    const labels = screen
      .getAllByRole('img')
      .map((el) => el.getAttribute('aria-label') ?? '');

    const dial = labels.find((l) => /out of 100$/.test(l));
    expect(dial, `no dial among: ${labels.join(' | ')}`).toBeDefined();
    const shown = Number(/(-?\d+) out of 100$/.exec(dial!)![1]);

    let sum = 0;
    let rows = 0;
    for (const label of labels) {
      // `points?` — a row worth exactly one point reads "1 point", not "1 points".
      const match = /: (-?\d+) points?, (adds to|lowers) the score$/.exec(label);
      if (!match) continue;
      rows += 1;
      sum += match[2] === 'adds to' ? Number(match[1]) : -Number(match[1]);
    }

    expect(rows).toBe(6); // five contributors and the one reducer
    expect(sum, `rows summed to ${sum}, dial reads ${shown}`).toBe(shown);
  });

  it('reports reflection and deliberate use without letting them move the dial', () => {
    seed({ events: rep(14, () => ev('direct_delegation', { immediate: true })) });

    render(<Report />);

    expect(screen.getByText(EN.report.notCounted)).toBeInTheDocument();
    expect(screen.getByText(EN.report.notCountedNote)).toBeInTheDocument();
  });
});

describe('deleting everything', () => {
  const clickDelete = () => fireEvent.click(screen.getByLabelText(EN.settings.deleteAll));

  it('takes two confirmations, and stops at either one', async () => {
    const deleteAllData = vi.fn(async () => {});
    seed();
    useAppStore.setState({ deleteAllData });
    const confirmSpy = vi.spyOn(window, 'confirm');

    render(<Settings />);

    // Backing out of the first prompt.
    confirmSpy.mockReturnValue(false);
    clickDelete();
    await waitFor(() => expect(confirmSpy).toHaveBeenCalledTimes(1));
    expect(deleteAllData).not.toHaveBeenCalled();

    // Backing out of the second.
    confirmSpy.mockReset().mockReturnValueOnce(true).mockReturnValueOnce(false);
    clickDelete();
    await waitFor(() => expect(confirmSpy).toHaveBeenCalledTimes(2));
    expect(deleteAllData).not.toHaveBeenCalled();

    // Through both.
    confirmSpy.mockReset().mockReturnValue(true);
    clickDelete();
    await waitFor(() => expect(deleteAllData).toHaveBeenCalledTimes(1));
    expect(routerMock.replace).toHaveBeenCalledWith('/onboarding');

    confirmSpy.mockRestore();
  });

  it('offers the language choice before anything else on the screen', () => {
    // Someone who cannot read this screen should not have to scroll past
    // three sections to change it.
    seed();
    render(<Settings />);

    // The screen title is a heading too, so this pins the whole order rather
    // than just the first section.
    expect(screen.getAllByRole('heading').map((h) => h.textContent)).toEqual([
      EN.settings.title,
      EN.settings.language,
      EN.settings.focus,
      EN.settings.about,
      EN.settings.dataPrivacy,
    ]);
  });
});
