/**
 * The single persisted document. Versioned from day one so migrations are
 * routine, not emergencies (ADR-0003).
 */
import type { RunRecord } from '../adversary/quiz-types';
import type { Locale } from '../i18n/types';

export const SCHEMA_VERSION = 4;

/**
 * 'system' means "follow the device", which is the honest default: guessing a
 * language once at install and freezing it is wrong the moment the user
 * changes their phone. Resolving 'system' to a concrete locale is the app
 * layer's job — core never reads the platform.
 */
export type LanguagePreference = Locale | 'system';

export interface AppSettings {
  language: LanguagePreference;
}

/**
 * What the dependency tracker left behind.
 *
 * v4 removed the tracker: its usage events, gate sessions, detox sessions,
 * reflections, challenge attempts and scoring configuration, along with the
 * engines that read them. Deleting a person's history because the product
 * changed direction is exactly the silent data loss ADR-0003 forbids, so the
 * 3 -> 4 migration moves it here instead.
 *
 * Nothing reads this. It is deliberately untyped beyond "some JSON that was
 * once ours": typing it would mean keeping the tracker's types alive to
 * describe data no code interprets, which is most of what was just deleted.
 * It exists so that "export my data" still hands the person everything they
 * ever put in, and it is removed by "delete all data" along with the rest.
 *
 * A document with no tracker history at all — the common case, and every fresh
 * install — gets no `retired` key. An archive of five empty arrays is clutter,
 * not custody.
 */
export interface RetiredTrackerData {
  /** The schema version this was archived out of. Always 3. */
  retiredFrom: number;
  [key: string]: unknown;
}

export interface AppData {
  schemaVersion: number;
  /**
   * Finished runs of The Adversary, newest last and bounded by
   * `appendRunRecord`.
   *
   * This is the only history in the document whose absence would change what
   * the product can say: one run produces too few observations for any finding
   * to be readable, so the diagnosis is a function of the accumulated records
   * rather than of the last one.
   */
  adversaryRuns: RunRecord[];
  settings: AppSettings;
  retired?: RetiredTrackerData;
}

export function emptyAppData(): AppData {
  return {
    schemaVersion: SCHEMA_VERSION,
    adversaryRuns: [],
    settings: { language: 'system' },
  };
}
