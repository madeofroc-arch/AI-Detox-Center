/**
 * Localization of DOMAIN language — band names, factor names, the usage
 * taxonomy, the challenge catalog, reflection prompts. Screen copy belongs to
 * the app layer; this file holds the words the domain itself owns, because a
 * challenge's instructions are data, not UI decoration.
 *
 * Everything here is pure data and pure lookup: no platform APIs, no locale
 * detection (that is the app's job), no `Intl`, no formatting. Core stays
 * deterministic — the same locale always yields the same strings.
 */
import type { ScoreBand } from '../ai-detox/scoring/scoring';
import type { ScoringFactor } from '../ai-detox/scoring/config';
import type { AIUsageCategory } from '../ai-detox/tracking/types';
import type { Challenge, ChallengeCategory } from '../challenges/types';

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

/** The translatable text of one challenge. Ids, difficulty and timing are not. */
export interface ChallengeText {
  title: string;
  instructions: string;
  successCondition: string;
  reflectionQuestions: string[];
}

export interface UsageCategoryText {
  label: string;
  description: string;
}

/** Every domain string, for one language. */
export interface CoreStrings {
  locale: Locale;
  bandLabels: Record<ScoreBand, string>;
  factorLabels: Record<ScoringFactor, string>;
  factorDescriptions: Record<ScoringFactor, string>;
  usageCategories: Record<AIUsageCategory, UsageCategoryText>;
  challengeCategories: Record<ChallengeCategory, string>;
  /** Keyed by ReflectionPrompt id. */
  reflectionPrompts: Record<string, string>;
  /** Keyed by Challenge id. */
  challenges: Record<string, ChallengeText>;
}

/**
 * A translation may be partial. Missing keys fall back to English rather than
 * rendering an id or an empty string, so a half-finished language is usable
 * and a contributor can ship one screen at a time.
 */
export type PartialCoreStrings = {
  [K in keyof Omit<CoreStrings, 'locale'>]?: Partial<CoreStrings[K]>;
};

/** A challenge with its text swapped for the requested language. */
export type LocalizedChallenge = Challenge;
