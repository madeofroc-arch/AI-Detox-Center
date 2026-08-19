/**
 * Number formatting for the game.
 *
 * `Intl` lives here and not in `packages/core`: core is deterministic and never
 * reads the environment, and compact notation is locale-dependent in a way that
 * matters — 130 billion is "130B" in English and 「1300億」 in 繁體中文, and a
 * player reading a log axis needs the landmarks in their own units.
 */

/**
 * Compact values for the four options and the revealed answer: 130B, 1300億.
 *
 * This is where the locale earns its keep. Written out in full, four magnitudes
 * an order apart are four rows of zeros to count — 28,000,000,000 against
 * 290,000,000,000 — which is cognitive work with nothing to do with the
 * reasoning the game is about. And the grouping a reader thinks in is not the
 * same everywhere: English groups by thousands and Chinese by 萬 and 億, so the
 * same number is 130B in one and 1300億 in the other.
 *
 * `digits` is how many significant figures survive. Three is right for options,
 * which are two-significant-figure values anyway; four is right for the
 * revealed answer, where the extra digit is the difference between "about the
 * same as option C" and "the actual figure".
 */
export function compactFormatter(locale: string, digits = 3): (value: number) => string {
  try {
    const nf = new Intl.NumberFormat(locale, {
      notation: 'compact',
      maximumSignificantDigits: digits,
    });
    return (value) => nf.format(value);
  } catch {
    // Some runtimes ship without full ICU. A readable number beats a crash.
    return (value) => String(Number(value.toPrecision(digits)));
  }
}

/** Exact values for the reveal, where the actual figure is the point. */
export function exactFormatter(locale: string): (value: number) => string {
  try {
    const nf = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
    return (value) => nf.format(value);
  } catch {
    return (value) => String(Number(value.toPrecision(4)));
  }
}

/**
 * A multiple, for "a 12x range" and "you were 6x low".
 *
 * Rounded hard on purpose: "11.7x" reads as a measurement of the player, and
 * the number only has to convey scale.
 */
export function formatFactor(factor: number): string {
  if (!Number.isFinite(factor)) return '∞×';
  if (factor < 10) return `${Math.round(factor * 10) / 10}×`;
  if (factor < 100) return `${Math.round(factor)}×`;
  if (factor < 1000) return `${Math.round(factor / 10) * 10}×`;
  return `${Number(factor.toPrecision(2)).toLocaleString()}×`;
}
