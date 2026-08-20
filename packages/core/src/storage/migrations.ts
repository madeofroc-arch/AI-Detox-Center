/**
 * Schema migrations. Each migration lifts version n to n+1. Unknown or
 * corrupt input is NOT silently discarded — the repository backs it up and
 * reports a warning (no silent data loss, ever).
 */
import { isLocale } from '../i18n/types';
import type { AppData, LanguagePreference, RetiredTrackerData } from './schema';
import { SCHEMA_VERSION, emptyAppData } from './schema';

export class SchemaTooNewError extends Error {
  constructor(found: number) {
    super(
      `Stored data has schema version ${found}, newer than supported ${SCHEMA_VERSION}. ` +
        'Update the app instead of migrating down.',
    );
    this.name = 'SchemaTooNewError';
  }
}

type Migration = (data: Record<string, unknown>) => Record<string, unknown>;

function asLanguage(value: unknown): LanguagePreference {
  return value === 'system' || isLocale(value) ? value : 'system';
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

/** The collections the tracker owned, in the order they appeared in the doc. */
const TRACKER_COLLECTIONS = [
  'events',
  'gateSessions',
  'detoxSessions',
  'reflections',
  'challengeHistory',
] as const;

/**
 * Pull the tracker's history out of a v3 document, or return undefined when
 * there is nothing worth keeping.
 *
 * "Nothing worth keeping" means every collection is empty or missing. A
 * `scoringConfig` on its own does not count: every v3 document had one whether
 * the person ever opened the tracker or not, so archiving it alone would give
 * a `retired` key to users who have no retired data.
 */
function collectRetired(data: Record<string, unknown>): RetiredTrackerData | undefined {
  const kept: Record<string, unknown> = {};
  let anyHistory = false;

  for (const key of TRACKER_COLLECTIONS) {
    const value = data[key];
    if (Array.isArray(value) && value.length > 0) {
      kept[key] = value;
      anyHistory = true;
    }
  }
  if (!anyHistory) return undefined;

  if (data.scoringConfig !== undefined) kept.scoringConfig = data.scoringConfig;

  // The two settings that belonged to the tracker rather than to the app.
  const settings = asRecord(data.settings);
  const trackerSettings: Record<string, unknown> = {};
  if (settings.onboardingComplete !== undefined) {
    trackerSettings.onboardingComplete = settings.onboardingComplete;
  }
  if (settings.focusCategories !== undefined) {
    trackerSettings.focusCategories = settings.focusCategories;
  }
  if (Object.keys(trackerSettings).length > 0) kept.settings = trackerSettings;

  return { retiredFrom: 3, ...kept };
}

/**
 * Registry: MIGRATIONS[n] migrates version n -> n+1.
 * Version 0 means "pre-versioning / unknown shape": we keep whatever arrays
 * look valid and fill the rest with defaults.
 */
const MIGRATIONS: Record<number, Migration> = {
  0: (data) => ({
    ...data,
    // The tracker's collections are carried forward RAW rather than dropped
    // here, because 3 -> 4 is what archives them. A v0 document that lost them
    // at this step would arrive at v4 with nothing to retire.
    ...Object.fromEntries(
      TRACKER_COLLECTIONS.map((key) => [key, Array.isArray(data[key]) ? data[key] : []]),
    ),
    adversaryRuns: Array.isArray(data.adversaryRuns) ? data.adversaryRuns : [],
    settings: asRecord(data.settings),
    schemaVersion: 1,
  }),
  // 1 -> 2: AppSettings gained `language`. Existing users follow their device
  // rather than being pinned to English, which is what they had implicitly.
  //
  // Fill, never overwrite. A v1 document is not supposed to carry a language,
  // but one that does is telling us something, and clobbering it is a silent
  // data loss of exactly the kind ADR-0003 forbids. (This is not theoretical:
  // it discarded the language on every migrated document during development.)
  1: (data) => {
    const settings = asRecord(data.settings);
    return {
      ...data,
      settings: { ...settings, language: asLanguage(settings.language) },
      schemaVersion: 2,
    };
  },
  // 2 -> 3: The Adversary keeps its finished runs. Nothing existed before, so
  // the migration is an empty list — but it still has to be a migration rather
  // than a default, because `migrateAppData` is what stamps the version and a
  // v2 document that never passes through here would keep claiming v2 forever.
  2: (data) => ({
    ...data,
    adversaryRuns: Array.isArray(data.adversaryRuns) ? data.adversaryRuns : [],
    schemaVersion: 3,
  }),
  // 3 -> 4: the dependency tracker is gone, and its data is archived rather
  // than deleted. See `RetiredTrackerData`.
  //
  // This is the first migration that REMOVES fields, and the shape of it is
  // the point: it builds the new document explicitly instead of spreading the
  // old one, so a field can only survive by being named. Spreading would have
  // carried every tracker collection into v4 untouched and made the archive a
  // duplicate rather than a move.
  3: (data) => {
    const retired = collectRetired(data);
    const settings = asRecord(data.settings);
    const next: Record<string, unknown> = {
      schemaVersion: 4,
      adversaryRuns: Array.isArray(data.adversaryRuns) ? data.adversaryRuns : [],
      settings: { language: asLanguage(settings.language) },
    };
    if (retired) next.retired = retired;
    return next;
  },
};

/**
 * Bring parsed (untrusted) data to the current schema version.
 * Throws SchemaTooNewError if the data is from a future app version.
 */
export function migrateAppData(raw: unknown): AppData {
  if (typeof raw !== 'object' || raw === null) return emptyAppData();

  let data = raw as Record<string, unknown>;
  let version = typeof data.schemaVersion === 'number' ? data.schemaVersion : 0;

  if (version > SCHEMA_VERSION) throw new SchemaTooNewError(version);

  while (version < SCHEMA_VERSION) {
    const migrate = MIGRATIONS[version];
    if (!migrate) {
      // Gap in the migration chain — treat as unknown shape via v0.
      data = MIGRATIONS[0]!(data);
      version = typeof data.schemaVersion === 'number' ? (data.schemaVersion as number) : 1;
      continue;
    }
    data = migrate(data);
    version = typeof data.schemaVersion === 'number' ? (data.schemaVersion as number) : version + 1;
  }

  // Post-migration hardening. The document is rebuilt field by field rather
  // than spread, so a hand-edited or partially-written blob already claiming
  // the current version cannot deliver a non-array into the diagnosis and
  // white-screen every render — the case the v0 step does not cover, because
  // it never runs for a document that already claims v4.
  const result = data as unknown as AppData;
  const hardened: AppData = {
    schemaVersion: SCHEMA_VERSION,
    adversaryRuns: Array.isArray(result.adversaryRuns) ? result.adversaryRuns : [],
    settings: { language: asLanguage(result.settings?.language) },
  };
  // Carried, never inspected. A v4 document's archive is whatever 3 -> 4 wrote.
  if (result.retired !== undefined) hardened.retired = result.retired;
  return hardened;
}
