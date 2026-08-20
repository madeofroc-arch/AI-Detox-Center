/**
 * Domain-string lookup. Pure, deterministic, and total: every locale resolves
 * to a complete `CoreStrings`, because a partial translation falls back to
 * English key by key rather than leaving a hole in the UI.
 */
import type { AdversaryRound } from '../adversary/types';
import { EN_STRINGS } from './en';
import { ZH_TW_STRINGS } from './zh-TW';
import type { CoreStrings, Locale, PartialCoreStrings } from './types';
import { DEFAULT_LOCALE, LOCALES, isLocale } from './types';

const OVERRIDES: Record<Locale, PartialCoreStrings> = {
  en: {},
  'zh-TW': ZH_TW_STRINGS,
};

/** Shallow-merge one table, keeping every English key the translation omits. */
function mergeTable<T extends Record<string, unknown>>(base: T, over: Partial<T> | undefined): T {
  return over ? { ...base, ...over } : base;
}

const CACHE = new Map<Locale, CoreStrings>();

/**
 * Every domain string for a language. Results are memoized because screens
 * call this on every render and the merge allocates; the objects are treated
 * as immutable (never mutate a returned pack).
 */
export function getCoreStrings(locale: Locale | string | undefined): CoreStrings {
  const key: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const cached = CACHE.get(key);
  if (cached) return cached;

  const over = OVERRIDES[key];
  const merged: CoreStrings = {
    locale: key,
    adversaryRounds: mergeTable(EN_STRINGS.adversaryRounds, over.adversaryRounds),
  };
  CACHE.set(key, merged);
  return merged;
}

/**
 * A round with its text in the requested language.
 *
 * Id, band, domain, difficulty, true value, axis, and both pushback directions
 * are untouched, along with the bluff's own figure — those are what the board
 * is built from, and a board that depended on the display language would deal
 * the same person different questions in English and 繁體中文.
 *
 * A language that has not reached this round yet gets the English text rather
 * than a hole, which is what lets the catalog be translated a few rounds at a
 * time.
 */
export function localizeRound(round: AdversaryRound, strings: CoreStrings): AdversaryRound {
  const text = strings.adversaryRounds[round.id];
  if (!text) return round;
  return {
    ...round,
    question: text.question,
    unit: text.unit,
    sourceNote: text.sourceNote,
    honest: { ...round.honest, argument: text.honest.argument, verdict: text.honest.verdict },
    bluff: {
      ...round.bluff,
      argument: text.bluff.argument,
      verdict: text.bluff.verdict,
      fallacy: text.bluff.fallacy,
    },
  };
}

/**
 * Match device language tags (most-preferred first) to a supported locale.
 *
 * Pure, so it lives here and is tested here; reading the tags off the device
 * is the app layer's job. Exact tags win, then the language subtag, so a
 * device set to `zh-Hant-HK` or `zh-TW` both land on Traditional Chinese.
 * `zh-Hans` / `zh-CN` deliberately do NOT: Simplified is a different
 * translation this project does not have yet, and serving Traditional to a
 * Simplified reader is a guess, not a courtesy.
 */
export function matchLocale(tags: readonly string[]): Locale {
  // One pass, in the user's own preference order. A two-pass version that
  // looked for exact tags everywhere first got ['en-US', 'zh-TW'] wrong: it
  // returned Chinese to someone whose first choice was English.
  for (const tag of tags) {
    if (isLocale(tag)) return tag;
    if (typeof tag !== 'string') continue;
    const lower = tag.toLowerCase();
    const base = lower.split('-')[0];
    if (base === 'zh') {
      if (/hant|-tw|-hk|-mo/.test(lower)) return 'zh-TW';
      continue; // Simplified and bare `zh` fall through to the next tag.
    }
    const match = LOCALES.find((l) => l.toLowerCase().split('-')[0] === base);
    if (match) return match;
  }
  return DEFAULT_LOCALE;
}
