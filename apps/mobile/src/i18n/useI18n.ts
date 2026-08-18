/**
 * The one place the app resolves a language.
 *
 * Layering: `packages/core` owns the domain strings (bands, factors, the usage
 * taxonomy, the challenge catalog) because those are data; this layer owns the
 * screen copy and, crucially, the platform bit — core never reads the device.
 */
import { useMemo } from 'react';
import { getLocales } from 'expo-localization';
import { getCoreStrings, matchLocale } from '@ai-detox/core';
import type { CoreStrings, LanguagePreference, Locale } from '@ai-detox/core';
import { useAppStore } from '../state/store';
import { EN } from './en';
import type { AppStrings } from './en';
import { ZH_TW } from './zh-TW';

const PACKS: Record<Locale, AppStrings> = {
  en: EN,
  'zh-TW': ZH_TW,
};

/** The device's preferred languages, most-preferred first. Never throws. */
export function deviceLocales(): string[] {
  try {
    return getLocales()
      .map((l) => l.languageTag)
      .filter((tag): tag is string => typeof tag === 'string' && tag.length > 0);
  } catch {
    // Some web/test environments have no localization module. English is a
    // usable answer; a crashed render is not.
    return [];
  }
}

/** Turn the stored preference into a concrete locale. */
export function resolveLocale(preference: LanguagePreference): Locale {
  return preference === 'system' ? matchLocale(deviceLocales()) : preference;
}

export interface I18n {
  locale: Locale;
  /** Screen copy. Complete by construction — the compiler enforces it. */
  t: AppStrings;
  /** Domain strings: bands, factors, categories, challenges, prompts. */
  core: CoreStrings;
}

export function useI18n(): I18n {
  const preference = useAppStore((s) => s.data.settings.language);
  return useMemo(() => {
    const locale = resolveLocale(preference);
    return { locale, t: PACKS[locale], core: getCoreStrings(locale) };
  }, [preference]);
}
