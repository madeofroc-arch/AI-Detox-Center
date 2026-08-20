import type { DateKey } from '@ai-detox/core';

/**
 * The app layer is the only place that reads the clock.
 *
 * It is also, now, the only source of anything non-deterministic in the
 * product. `ids.ts` held the single call to `Math.random()` and it went with
 * the screens that used it: a run of The Adversary is seeded by the calendar
 * day, the tier, and how many runs came before, so the same person on the same
 * day is dealt the same board — which is what makes a bug report a seed.
 */

/** Local calendar day key (user's timezone), e.g. "2026-08-18". */
export function todayKey(): DateKey {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}
