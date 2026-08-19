/**
 * Number formatting for the game.
 *
 * `Intl` lives here and not in `packages/core`: core is deterministic and never
 * reads the environment, and compact notation is locale-dependent in a way that
 * matters — 130 billion is "130B" in English and 「1300億」 in 繁體中文, and a
 * player reading a log axis needs the landmarks in their own units.
 */

/** Compact values for axis ticks and answers: 1.2K, 130B, 0.8. */
export function compactFormatter(locale: string): (value: number) => string {
  try {
    const nf = new Intl.NumberFormat(locale, {
      notation: 'compact',
      maximumSignificantDigits: 3,
    });
    return (value) => nf.format(value);
  } catch {
    // Some runtimes ship without full ICU. A readable number beats a crash.
    return (value) => String(Number(value.toPrecision(3)));
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
