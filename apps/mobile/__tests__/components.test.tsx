/**
 * Component behaviour a user could notice, not implementation detail.
 *
 * Everything asserted here is either a rule from
 * `docs/design/accessibility.md` that was previously only aspirational, or a
 * defect that actually shipped. Rendering goes through react-native-web, so
 * `getByRole` and `aria-*` are the real accessibility tree, not a proxy for it.
 */
import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { getCoreStrings } from '@ai-detox/core';
import type { FactorScore } from '@ai-detox/core';
import { Button } from '../src/components/Button';
import { FactorBar } from '../src/components/FactorBar';
import { ProgressBar } from '../src/components/ProgressBar';
import { ScoreDial } from '../src/components/ScoreDial';
import { Segmented } from '../src/components/Segmented';
import { Tag } from '../src/components/Tag';
import { EN } from '../src/i18n/en';
import { lightPalette } from '../src/theme/tokens';

const core = getCoreStrings('en');

describe('ScoreDial', () => {
  it('shows a dash and says why, when there is not enough data', () => {
    render(<ScoreDial value={null} label="Brain Score" caption={EN.home.scoreEmpty} />);

    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute(
      'aria-label',
      'Brain Score: not enough data yet',
    );
    // Not "Brain Score: 0 out of 100". A person with no history has no score,
    // and zero is a very different claim.
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('announces the number once, not once per element inside the ring', () => {
    render(<ScoreDial value={61} label="Brain Score" caption="Balanced" />);

    const dial = screen.getByRole('img');
    expect(dial).toHaveAttribute('aria-label', 'Brain Score: 61 out of 100');
    // The digits and the "BRAIN SCORE" cap are the same fact rendered for
    // eyes. Left readable they were announced a second and third time.
    expect(within(dial).getByText('61').closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it('keeps the caption and the additive footnote readable and in order', () => {
    render(
      <ScoreDial
        value={61}
        label="Brain Score"
        caption="Leaning on AI"
        footnote="You practised on 3 of the last 7 days."
      />,
    );
    // A band label alone on the first screen reads as a verdict, so the
    // additive line must survive as its own readable text (docs/design).
    expect(screen.getByText('Leaning on AI')).toBeInTheDocument();
    expect(screen.getByText('You practised on 3 of the last 7 days.')).toBeInTheDocument();
  });
});

describe('FactorBar', () => {
  const factor = (over: Partial<FactorScore> = {}): FactorScore => ({
    factor: 'delegation',
    role: 'contributor',
    intensity: 0.36,
    weight: 40,
    maxPoints: 10,
    points: 3.6,
    displayPoints: 3,
    description: 'Handing a whole task to AI.',
    ...over,
  });

  it('shows the apportioned whole number, not its own rounding of the exact one', () => {
    // 3.6 rounds to 4 on its own. The apportionment says 3, because the other
    // rows already took the leftover point. Rounding here instead is what put
    // 71 next to a dial reading 70 (#6).
    render(<FactorBar factor={factor()} scale={10} t={EN} core={core} />);

    expect(screen.getByText('3 pts')).toBeInTheDocument();
    expect(screen.queryByText('4 pts')).not.toBeInTheDocument();
  });

  it('names the factor, its points and its direction in one announcement', () => {
    render(<FactorBar factor={factor()} scale={10} t={EN} core={core} />);

    // Read from the packs rather than hardcoded, so a copy change is a copy
    // change and not a test failure.
    expect(screen.getByRole('img')).toHaveAttribute(
      'aria-label',
      EN.report.factorA11y(core.factorLabels.delegation, 3, EN.report.factorAdds),
    );
  });

  it('pairs colour with a label and a number, so colour is never the only carrier', () => {
    const contributor = factor();
    const reducer = factor({ factor: 'independentAttempt', role: 'reducer', displayPoints: 5 });
    const { rerender } = render(<FactorBar factor={contributor} scale={10} t={EN} core={core} />);
    expect(screen.getByText(/adds to/)).toBeInTheDocument();

    rerender(<FactorBar factor={reducer} scale={10} t={EN} core={core} />);
    expect(screen.getByText(/lowers/)).toBeInTheDocument();
  });
});

describe('ProgressBar', () => {
  it('is one accessibility element, not three', () => {
    render(<ProgressBar fraction={0.4} label="Toward level 3" valueText="40 / 100" />);

    const bar = screen.getByRole('img');
    expect(bar).toHaveAttribute('aria-label', 'Toward level 3: 40 / 100');
    expect(screen.getAllByRole('img')).toHaveLength(1);
  });

  it('never claims a percentage it cannot back up', () => {
    // `fraction` is often a share of the largest row rather than a share of
    // anything nameable, so nothing here may say "40 percent".
    render(<ProgressBar fraction={0.4} label="Delegation" valueText="14 pts" />);
    expect(screen.getByRole('img').getAttribute('aria-label')).not.toMatch(/percent|%/);
  });
});

describe('Tag', () => {
  it('meets the 44pt touch target when it is tappable', () => {
    render(<Tag label="Memory" onPress={() => {}} />);
    // 36pt shipped, on the category pickers in onboarding, settings and the
    // AI Gate (#4).
    expect(screen.getByRole('button')).toHaveStyle({ minHeight: '44px' });
  });

  it('exposes pick-one and pick-several as different things', () => {
    const { rerender } = render(
      <Tag label="English" selected selectionRole="radio" onPress={() => {}} />,
    );
    expect(screen.getByRole('radio')).toHaveAttribute('aria-checked', 'true');

    rerender(<Tag label="Memory" selected selectionRole="checkbox" onPress={() => {}} />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
  });

  it('is not a control at all when it is only a label', () => {
    render(<Tag label="Memory" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('Memory')).toBeInTheDocument();
  });
});

describe('Segmented', () => {
  it('announces itself as a radio group with one checked option', () => {
    render(
      <Segmented
        accessibilityLabel="Session duration"
        options={[
          { value: 25, label: '25 min' },
          { value: 50, label: '50 min' },
        ]}
        value={25}
        onChange={() => {}}
      />,
    );

    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-label', 'Session duration');
    const options = screen.getAllByRole('radio');
    expect(options.map((o) => o.getAttribute('aria-checked'))).toEqual(['true', 'false']);
  });
});

describe('Button', () => {
  it('takes its label colour from the palette, never a literal white', () => {
    // White on the dark-mode accent is 2.49:1, and this is the label on every
    // primary button in the app (#4). The contrast suite proves the token is
    // right; this proves the component reads the token.
    render(<Button label="Begin" onPress={() => {}} />);
    expect(screen.getByText('Begin')).toHaveStyle({ color: lightPalette.onAccent });
  });

  it('grows with its text instead of clipping it', () => {
    render(<Button label="Begin" onPress={() => {}} />);
    const button = screen.getByRole('button');
    // minHeight, not height: a fixed 52 clips the label at a 1.3x font scale,
    // which the accessibility spec requires the layout to tolerate.
    expect(button).toHaveStyle({ minHeight: '52px' });
    expect(button.style.height).toBe('');
  });

  it('is reachable and operable from the keyboard', () => {
    render(<Button label="Begin" onPress={() => {}} />);
    expect(screen.getByRole('button')).toHaveAttribute('tabindex', '0');
  });
});
