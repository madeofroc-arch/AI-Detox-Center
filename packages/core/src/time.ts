/**
 * Time enters the core as parameters (ISO strings / date keys) so that all
 * domain logic stays deterministic and testable (ADR-0004). Core never reads
 * the clock itself.
 *
 * What is left of that policy is one type. The tracker needed arithmetic on
 * dates — windows, streaks, days between sessions — and took its four helpers
 * with it. The Adversary reads the calendar once, to seed a run, and does it
 * in the app layer where the clock lives.
 */

/** A calendar day key, e.g. "2026-08-18". Caller decides the timezone. */
export type DateKey = string;
