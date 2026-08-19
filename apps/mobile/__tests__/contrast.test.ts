/**
 * The contrast half of the accessibility checklist, as a gate rather than a
 * ritual.
 *
 * `docs/design/accessibility.md` has asked for a "contrast spot-check on new
 * colour pairs" since the design system was written. Nobody had ever run it,
 * and when it was finally run against the built app it found four real
 * failures — including white text on the dark-mode accent at 2.49:1, which was
 * the label on every primary button in the app (#4).
 *
 * A spot-check performed by a person once is worth less than this file, which
 * performs it on every commit. Adding a colour to the palette without adding
 * it here is the failure mode; the last test in the file catches that.
 */
import { describe, expect, it } from 'vitest';
import { darkPalette, lightPalette } from '../src/theme/tokens';
import type { Palette } from '../src/theme/tokens';

/** WCAG 2.x relative luminance. */
function luminance(hex: string): number {
  const channels = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
}

function ratio(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

type Pair = {
  fg: keyof Palette;
  bg: keyof Palette;
  /** 4.5 for body text, 3 for large text and for non-text UI (WCAG 1.4.11). */
  min: 3 | 4.5;
  where: string;
};

/**
 * Every pairing the app actually renders. `where` is not decoration: a failure
 * has to tell the next person which screen breaks, not just which two hex
 * values disagree.
 */
const PAIRS: Pair[] = [
  { fg: 'ink', bg: 'bg', min: 4.5, where: 'body text on the screen background' },
  { fg: 'ink', bg: 'surface', min: 4.5, where: 'body text inside a card' },
  { fg: 'ink', bg: 'surfaceAlt', min: 4.5, where: 'body text inside an alt card / work area' },
  { fg: 'inkMuted', bg: 'bg', min: 4.5, where: 'screen subtitle' },
  { fg: 'inkMuted', bg: 'surface', min: 4.5, where: 'caption inside a card' },
  {
    fg: 'inkMuted',
    bg: 'surfaceAlt',
    min: 4.5,
    where: 'caption in an alt card, text-field placeholder, inactive tab label',
  },
  { fg: 'accent', bg: 'surface', min: 4.5, where: 'ghost button, Home additive line' },
  { fg: 'accent', bg: 'bg', min: 4.5, where: 'ghost button on the screen background' },
  { fg: 'accent', bg: 'accentSoft', min: 4.5, where: 'unselected tag label' },
  { fg: 'accent', bg: 'surfaceAlt', min: 4.5, where: 'list row glyph' },
  { fg: 'onAccent', bg: 'accent', min: 4.5, where: 'primary button label, selected tag label' },
  { fg: 'onDanger', bg: 'danger', min: 4.5, where: '"Delete all data" button label' },
  { fg: 'amber', bg: 'line', min: 3, where: 'contributor bar fill against its track' },
  { fg: 'accent', bg: 'line', min: 3, where: 'reducer / XP bar fill against its track' },
  { fg: 'lineStrong', bg: 'surface', min: 3, where: 'text-field border on a card' },
  { fg: 'lineStrong', bg: 'surfaceAlt', min: 3, where: 'text-field border, field fill behind it' },
  { fg: 'lineStrong', bg: 'bg', min: 3, where: 'text-field border on the screen background' },
  { fg: 'accent', bg: 'surfaceAlt', min: 3, where: 'selected segment border in Segmented' },
];

const PALETTES: [string, Palette][] = [
  ['light', lightPalette],
  ['dark', darkPalette],
];

describe('every colour pair the app renders clears WCAG AA', () => {
  for (const [name, palette] of PALETTES) {
    describe(name, () => {
      for (const pair of PAIRS) {
        it(`${pair.fg} on ${pair.bg} — ${pair.where}`, () => {
          const r = ratio(palette[pair.fg], palette[pair.bg]);
          expect(
            Number(r.toFixed(2)),
            `${name}: ${pair.fg} (${palette[pair.fg]}) on ${pair.bg} (${palette[pair.bg]}) ` +
              `is ${r.toFixed(2)}:1, below the ${pair.min}:1 needed for ${pair.where}`,
          ).toBeGreaterThanOrEqual(pair.min);
        });
      }
    });
  }

  it('covers every token in the palette, so a new colour cannot slip in untested', () => {
    // Backgrounds and fills appear as `bg`; inks and fills appear as `fg`.
    const covered = new Set<string>([...PAIRS.map((p) => p.fg), ...PAIRS.map((p) => p.bg)]);
    const declared = Object.keys(lightPalette) as (keyof Palette)[];
    const uncovered = declared.filter((token) => !covered.has(token));
    expect(
      uncovered,
      `these palette tokens are in no contrast pair: ${uncovered.join(', ')}. ` +
        'Add the pairing the app actually renders, or delete the token.',
    ).toEqual([]);
  });

  it('keeps both palettes on the same token set', () => {
    expect(Object.keys(darkPalette).sort()).toEqual(Object.keys(lightPalette).sort());
  });
});
