/**
 * The point of these tests is completeness, not spot-checking a few strings.
 * A translation that silently loses half the catalog still renders (English
 * falls through), so nothing would fail — which is exactly why the coverage
 * has to be asserted rather than eyeballed.
 *
 * The domain's only translatable data is now the round catalog. What used to
 * be here — band names, scoring factors, the usage taxonomy, challenge text,
 * reflection prompts — went with the tracker.
 */
import { describe, expect, it } from 'vitest';
import {
  ADVERSARY_CATALOG,
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_NAMES,
  SCHEMA_VERSION,
  getCoreStrings,
  isLocale,
  localizeRound,
  matchLocale,
  migrateAppData,
} from '../src/index';
import type { Locale } from '../src/index';

describe('locale identity', () => {
  it('names every language in that language', () => {
    for (const locale of LOCALES) {
      expect(LOCALE_NAMES[locale]).toBeTruthy();
    }
    // A picker labelled "Chinese (Traditional)" in English is unreadable to
    // the person who needs it.
    expect(LOCALE_NAMES['zh-TW']).toBe('繁體中文');
  });

  it('rejects anything that is not a supported locale', () => {
    expect(isLocale('en')).toBe(true);
    expect(isLocale('zh-TW')).toBe(true);
    for (const bad of ['zh', 'zh-CN', 'EN', '', null, undefined, 7, {}]) {
      expect(isLocale(bad)).toBe(false);
    }
  });

  it('falls back to the default locale rather than throwing', () => {
    for (const bad of [undefined, 'fr', 'zh-CN', '']) {
      expect(getCoreStrings(bad).locale).toBe(DEFAULT_LOCALE);
    }
  });

  it('returns a stable object per locale (safe to use as a memo dependency)', () => {
    expect(getCoreStrings('zh-TW')).toBe(getCoreStrings('zh-TW'));
  });
});

describe('matching a device language', () => {
  it('takes an exact supported tag', () => {
    expect(matchLocale(['zh-TW'])).toBe('zh-TW');
    expect(matchLocale(['en'])).toBe('en');
  });

  it('reads Traditional Chinese from script or region, not from bare zh', () => {
    for (const tag of ['zh-Hant', 'zh-Hant-HK', 'zh-TW', 'ZH-HANT-TW', 'zh-MO']) {
      expect(matchLocale([tag]), tag).toBe('zh-TW');
    }
    // Simplified is a translation this project does not have. Serving
    // Traditional to a Simplified reader is a guess, not a courtesy.
    for (const tag of ['zh-Hans', 'zh-CN', 'zh-SG', 'zh']) {
      expect(matchLocale([tag]), tag).toBe('en');
    }
  });

  it('matches on the language subtag for regional English', () => {
    expect(matchLocale(['en-GB'])).toBe('en');
    expect(matchLocale(['en-US', 'zh-TW'])).toBe('en');
  });

  it('walks the preference list in order and falls back rather than throwing', () => {
    expect(matchLocale(['fr-FR', 'de', 'zh-Hant-TW'])).toBe('zh-TW');
    expect(matchLocale(['fr', 'de'])).toBe('en');
    expect(matchLocale([])).toBe('en');
    expect(matchLocale([undefined as never, 'zh-TW'])).toBe('zh-TW');
  });
});

describe('every locale is complete', () => {
  for (const locale of LOCALES) {
    it(`${locale} has text for every round in the catalog`, () => {
      const strings = getCoreStrings(locale);
      if (locale === DEFAULT_LOCALE) {
        // English is the catalog itself, so its overlay is empty by design and
        // `localizeRound` falls through. Asserting the overlay is populated
        // would be asserting a duplicate that must not exist.
        expect(strings.adversaryRounds).toEqual({});
        return;
      }
      for (const round of ADVERSARY_CATALOG) {
        const text = strings.adversaryRounds[round.id];
        expect(text, `${locale} is missing round ${round.id}`).toBeDefined();
        expect(text!.question).toBeTruthy();
        expect(text!.unit).toBeTruthy();
        expect(text!.sourceNote).toBeTruthy();
        expect(text!.honest.argument).toBeTruthy();
        expect(text!.honest.verdict).toBeTruthy();
        expect(text!.bluff.argument).toBeTruthy();
        expect(text!.bluff.verdict).toBeTruthy();
        expect(text!.bluff.fallacy).toBeTruthy();
      }
    });
  }
});

describe('translations are actually translated', () => {
  // Guards the failure mode where a round is added to the catalog and
  // copy-pasted into zh-TW untranslated: the coverage test above would pass.
  const zh = getCoreStrings('zh-TW');

  it('shares no question or argument with the English original', () => {
    for (const round of ADVERSARY_CATALOG) {
      const text = zh.adversaryRounds[round.id]!;
      expect(text.question, `zh-TW question for ${round.id}`).not.toBe(round.question);
      expect(text.honest.argument, `zh-TW honest for ${round.id}`).not.toBe(
        round.honest.argument,
      );
      expect(text.bluff.argument, `zh-TW bluff for ${round.id}`).not.toBe(round.bluff.argument);
    }
  });
});

describe('a translated round', () => {
  /**
   * The load-bearing rule of a translated catalog: everything the game computes
   * with has to survive the swap. If a translation could move a true value, an
   * axis, a band or the bluff's own figure, the same seed would deal a
   * different board to the same person in two languages — and the record they
   * are comparing across runs would stop meaning one thing.
   */
  it('changes words and nothing a board is built from', () => {
    for (const locale of LOCALES) {
      const strings = getCoreStrings(locale);
      for (const round of ADVERSARY_CATALOG) {
        const localized = localizeRound(round, strings);
        expect(localized.id).toBe(round.id);
        expect(localized.band).toBe(round.band);
        expect(localized.domain).toBe(round.domain);
        expect(localized.difficulty).toBe(round.difficulty);
        expect(localized.trueValue).toBe(round.trueValue);
        expect(localized.axisMin).toBe(round.axisMin);
        expect(localized.axisMax).toBe(round.axisMax);
        expect(localized.honest.direction).toBe(round.honest.direction);
        expect(localized.bluff.direction).toBe(round.bluff.direction);
        expect(localized.bluff.bluffValue).toBe(round.bluff.bluffValue);
      }
    }
  });

  it('falls back to English for a round a language has not reached', () => {
    const strings = getCoreStrings('zh-TW');
    const round = ADVERSARY_CATALOG[0]!;
    const missing = { ...round, id: 'not_translated_yet' };
    expect(localizeRound(missing, strings).question).toBe(round.question);
  });

  it('swaps every visible field when the text is there', () => {
    const round = ADVERSARY_CATALOG[0]!;
    const strings = {
      ...getCoreStrings('en'),
      adversaryRounds: {
        [round.id]: {
          question: 'Q',
          unit: 'U',
          sourceNote: 'S',
          honest: { argument: 'HA', verdict: 'HV' },
          bluff: { argument: 'BA', verdict: 'BV', fallacy: 'BF' },
        },
      },
    };
    const localized = localizeRound(round, strings);
    expect(localized.question).toBe('Q');
    expect(localized.unit).toBe('U');
    expect(localized.sourceNote).toBe('S');
    expect(localized.honest.argument).toBe('HA');
    expect(localized.honest.verdict).toBe('HV');
    expect(localized.bluff.argument).toBe('BA');
    expect(localized.bluff.verdict).toBe('BV');
    expect(localized.bluff.fallacy).toBe('BF');
  });
});

describe('the language setting survives storage', () => {
  it('defaults to following the device', () => {
    expect(migrateAppData({}).settings.language).toBe('system');
  });

  it('carries a v1 language all the way to the current schema', () => {
    // The point is that a v1 document arrives intact at whatever the current
    // schema is, not that the current schema is any given number.
    const v1 = (language?: unknown): unknown => ({
      schemaVersion: 1,
      settings: { onboardingComplete: true, focusCategories: [], ...(language ? { language } : {}) },
    });
    expect(migrateAppData(v1()).schemaVersion).toBe(SCHEMA_VERSION);
    // Regression: the 1 -> 2 migration set 'system' unconditionally, so every
    // migrated document lost its language. Caught because the zh-TW
    // screenshots came out byte-identical to the English ones.
    expect(migrateAppData(v1()).settings.language).toBe('system');
    expect(migrateAppData(v1('zh-TW')).settings.language).toBe('zh-TW');
    expect(migrateAppData(v1('klingon')).settings.language).toBe('system');
  });

  it('keeps a valid stored language and replaces a nonsensical one', () => {
    const withLocale = (language: unknown): unknown => ({
      ...migrateAppData({}),
      settings: { language },
    });
    for (const locale of LOCALES) {
      expect(migrateAppData(withLocale(locale)).settings.language).toBe(locale as Locale);
    }
    for (const bad of ['klingon', 42, null, {}, 'zh-CN']) {
      expect(migrateAppData(withLocale(bad)).settings.language).toBe('system');
    }
  });
});
