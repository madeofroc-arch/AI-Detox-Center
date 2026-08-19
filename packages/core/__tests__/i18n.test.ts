/**
 * The point of these tests is completeness, not spot-checking a few strings.
 * A translation that silently loses half the challenge catalog still renders
 * (English falls through), so nothing would fail — which is exactly why the
 * coverage has to be asserted rather than eyeballed.
 */
import { describe, expect, it } from 'vitest';
import {
  CATEGORY_INFO,
  ADVERSARY_CATALOG,
  CHALLENGE_CATALOG,
  CHALLENGE_CATEGORIES,
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_NAMES,
  REFLECTION_PROMPTS,
  SCHEMA_VERSION,
  getCoreStrings,
  isLocale,
  localizeCategoryInfo,
  localizeChallenge,
  localizeRound,
  localizePrompt,
  matchLocale,
  migrateAppData,
  usageCategoryLabel,
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
    describe(locale, () => {
      const strings = getCoreStrings(locale);

      it('translates every scoring band and factor', () => {
        for (const band of ['independent', 'balanced', 'leaning', 'dependent'] as const) {
          expect(strings.bandLabels[band]).toBeTruthy();
        }
        for (const factor of Object.keys(strings.factorLabels)) {
          expect(strings.factorLabels[factor as never]).toBeTruthy();
          expect(strings.factorDescriptions[factor as never]).toBeTruthy();
        }
      });

      it('translates every usage category, label and description', () => {
        for (const info of CATEGORY_INFO) {
          const text = strings.usageCategories[info.category];
          expect(text?.label, `${locale} label for ${info.category}`).toBeTruthy();
          expect(text?.description, `${locale} description for ${info.category}`).toBeTruthy();
        }
      });

      it('translates every challenge category', () => {
        for (const category of CHALLENGE_CATEGORIES) {
          expect(strings.challengeCategories[category], `${locale}/${category}`).toBeTruthy();
        }
      });

      it('translates every reflection prompt', () => {
        for (const prompt of REFLECTION_PROMPTS) {
          expect(strings.reflectionPrompts[prompt.id], `${locale}/${prompt.id}`).toBeTruthy();
        }
      });

      it('translates every challenge, including each reflection question', () => {
        for (const challenge of CHALLENGE_CATALOG) {
          const text = strings.challenges[challenge.id];
          expect(text, `${locale} is missing challenge ${challenge.id}`).toBeDefined();
          expect(text!.title).toBeTruthy();
          expect(text!.instructions).toBeTruthy();
          expect(text!.successCondition).toBeTruthy();
          expect(
            text!.reflectionQuestions,
            `${locale}/${challenge.id} reflection questions`,
          ).toHaveLength(challenge.reflectionQuestions.length);
          for (const q of text!.reflectionQuestions) expect(q).toBeTruthy();
        }
      });
    });
  }
});

describe('translations are actually translated', () => {
  // Guards the failure mode where a new key is added to en and copy-pasted
  // into zh-TW untranslated: the tests above would still pass.
  const en = getCoreStrings('en');
  const zh = getCoreStrings('zh-TW');

  it('shares no challenge title or instruction text with English', () => {
    for (const challenge of CHALLENGE_CATALOG) {
      const a = en.challenges[challenge.id]!;
      const b = zh.challenges[challenge.id]!;
      expect(b.title, `zh-TW title for ${challenge.id}`).not.toBe(a.title);
      expect(b.instructions, `zh-TW instructions for ${challenge.id}`).not.toBe(a.instructions);
    }
  });

  it('shares no band, factor, category or prompt with English', () => {
    for (const key of Object.keys(en.bandLabels) as (keyof typeof en.bandLabels)[]) {
      expect(zh.bandLabels[key]).not.toBe(en.bandLabels[key]);
    }
    for (const info of CATEGORY_INFO) {
      expect(zh.usageCategories[info.category]!.label).not.toBe(
        en.usageCategories[info.category]!.label,
      );
    }
    for (const prompt of REFLECTION_PROMPTS) {
      expect(zh.reflectionPrompts[prompt.id]).not.toBe(en.reflectionPrompts[prompt.id]);
    }
  });
});

describe('localization never touches behavior', () => {
  const zh = getCoreStrings('zh-TW');

  it('keeps a challenge selectable and scoreable: id, category, difficulty, duration', () => {
    for (const challenge of CHALLENGE_CATALOG) {
      const localized = localizeChallenge(challenge, zh);
      expect(localized.id).toBe(challenge.id);
      expect(localized.category).toBe(challenge.category);
      expect(localized.difficulty).toBe(challenge.difficulty);
      expect(localized.durationMinutes).toBe(challenge.durationMinutes);
      expect(localized.hasWorkArea).toBe(challenge.hasWorkArea);
    }
  });

  it('keeps the usage taxonomy order and every kind', () => {
    const localized = localizeCategoryInfo(zh);
    expect(localized.map((c) => c.category)).toEqual(CATEGORY_INFO.map((c) => c.category));
    expect(localized.map((c) => c.kind)).toEqual(CATEGORY_INFO.map((c) => c.kind));
  });

  it('leaves an unknown challenge or prompt untouched instead of blanking it', () => {
    const unknown = { ...CHALLENGE_CATALOG[0]!, id: 'not_in_any_pack' };
    expect(localizeChallenge(unknown, zh).title).toBe(unknown.title);
    const prompt = { id: 'nope', context: 'free' as const, question: 'Original?' };
    expect(localizePrompt(prompt, zh).question).toBe('Original?');
  });

  it('labels a usage category, falling back to the raw value', () => {
    expect(usageCategoryLabel('direct_delegation', zh)).toBe('幫我做完');
    expect(usageCategoryLabel('nonsense' as never, zh)).toBe('nonsense');
  });

  it('returns a stable object per locale (safe to use as a memo dependency)', () => {
    expect(getCoreStrings('zh-TW')).toBe(getCoreStrings('zh-TW'));
  });
});

describe('the language setting survives storage', () => {
  it('defaults to following the device', () => {
    expect(migrateAppData({}).settings.language).toBe('system');
  });

  it('upgrades a v1 document without touching its data', () => {
    const v1 = {
      schemaVersion: 1,
      events: [],
      gateSessions: [],
      detoxSessions: [],
      reflections: [],
      challengeHistory: [{ id: 'a', challengeId: 'th_steelman', dateKey: '2026-08-01' }],
      settings: { onboardingComplete: true, focusCategories: ['thinking'] },
    };
    const migrated = migrateAppData(v1);
    // The point of the test is that a v1 document arrives intact at whatever
    // the current schema is, not that the current schema is any given number.
    expect(migrated.schemaVersion).toBe(SCHEMA_VERSION);
    expect(migrated.settings.language).toBe('system');
    expect(migrated.settings.onboardingComplete).toBe(true);
    expect(migrated.settings.focusCategories).toEqual(['thinking']);
    expect(migrated.challengeHistory).toHaveLength(1);
  });

  it('fills the language on a v1 document without clobbering one that is there', () => {
    // Regression: the 1 -> 2 migration set 'system' unconditionally, so every
    // migrated document lost its language. Caught because the zh-TW
    // screenshots came out byte-identical to the English ones.
    const v1 = (language?: unknown): unknown => ({
      schemaVersion: 1,
      settings: { onboardingComplete: true, focusCategories: [], ...(language ? { language } : {}) },
    });
    expect(migrateAppData(v1()).settings.language).toBe('system');
    expect(migrateAppData(v1('zh-TW')).settings.language).toBe('zh-TW');
    expect(migrateAppData(v1('klingon')).settings.language).toBe('system');
  });

  it('keeps a valid stored language and replaces a nonsensical one', () => {
    const withLocale = (language: unknown): unknown => ({
      ...migrateAppData({}),
      settings: { onboardingComplete: false, focusCategories: [], language },
    });
    for (const locale of LOCALES) {
      expect(migrateAppData(withLocale(locale)).settings.language).toBe(locale as Locale);
    }
    for (const bad of ['klingon', 42, null, {}, 'zh-CN']) {
      expect(migrateAppData(withLocale(bad)).settings.language).toBe('system');
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

