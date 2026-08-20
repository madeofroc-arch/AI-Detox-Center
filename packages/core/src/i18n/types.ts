/**
 * Localization of DOMAIN language.
 *
 * Screen copy belongs to the app layer; this file holds the words the domain
 * itself owns — which, since the tracker was removed, means one thing: the
 * text of a round of The Adversary. A round's question and arguments are data,
 * not UI decoration, and they have to travel with the catalog that computes on
 * them.
 *
 * Everything here is pure data and pure lookup: no platform APIs, no locale
 * detection (that is the app's job), no `Intl`, no formatting. Core stays
 * deterministic — the same locale always yields the same strings.
 */
import type { AdversaryRound } from '../adversary/types';

export const LOCALES = ['en', 'zh-TW'] as const;
export type Locale = (typeof LOCALES)[number];

/**
 * How each language names ITSELF. A language picker that lists "Chinese
 * (Traditional)" in English is useless to the person who cannot read the
 * English it is written in.
 */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  'zh-TW': '繁體中文',
};

export const DEFAULT_LOCALE: Locale = 'en';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/**
 * The translatable text of one round of The Adversary.
 *
 * Everything the game computes with — the true value, the axis, the band, the
 * bluff's figure and its direction — is deliberately absent. Selection, board
 * construction and scoring must run on the canonical catalog and only then swap
 * the words, or the same seed would deal different questions to the same person
 * in two languages (CLAUDE.md rule 6).
 *
 * `fallacy` is here because it is a phrase, not a key: it is shown to the
 * player after the reveal.
 */
export interface RoundText {
  question: string;
  unit: string;
  sourceNote: string;
  honest: { argument: string; verdict: string };
  bluff: { argument: string; verdict: string; fallacy: string };
}

/** Every domain string, for one language. */
export interface CoreStrings {
  locale: Locale;
  /**
   * Keyed by AdversaryRound id.
   *
   * Empty for English: the catalog IS the English text, so there is nothing to
   * overlay. Any other language supplies what it has, and a round it has not
   * reached yet renders in English rather than as a hole.
   */
  adversaryRounds: Record<string, RoundText>;
}

/**
 * A translation may be partial. Missing keys fall back to English rather than
 * rendering an id or an empty string, so a half-finished language is usable
 * and a contributor can ship one round at a time.
 */
export type PartialCoreStrings = {
  [K in keyof Omit<CoreStrings, 'locale'>]?: Partial<CoreStrings[K]>;
};

/** A round with its text swapped. Everything computable about it is unchanged. */
export type LocalizedRound = AdversaryRound;
