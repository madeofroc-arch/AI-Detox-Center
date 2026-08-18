/**
 * Time enters the core as parameters (ISO strings / date keys) so that all
 * domain logic stays deterministic and testable (ADR-0004). Core never reads
 * the clock itself.
 */

/** A calendar day key, e.g. "2026-08-18". Caller decides the timezone. */
export type DateKey = string;

/** Extract the date key from an ISO timestamp (uses the string's date part). */
export function dateKeyFromIso(iso: string): DateKey {
  return iso.slice(0, 10);
}

/** Milliseconds between two ISO timestamps (b - a). */
export function msBetween(aIso: string, bIso: string): number {
  return new Date(bIso).getTime() - new Date(aIso).getTime();
}

/** Whole days between two date keys (b - a). */
export function daysBetween(a: DateKey, b: DateKey): number {
  const MS_PER_DAY = 86_400_000;
  return Math.round((Date.parse(b) - Date.parse(a)) / MS_PER_DAY);
}

/** The date key n days before the given one. */
export function shiftDateKey(key: DateKey, days: number): DateKey {
  const d = new Date(Date.parse(key) + days * 86_400_000);
  return d.toISOString().slice(0, 10);
}
