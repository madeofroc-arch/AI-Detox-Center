/**
 * Schema migrations. Each migration lifts version n to n+1. Unknown or
 * corrupt input is NOT silently discarded — the repository backs it up and
 * reports a warning (no silent data loss, ever).
 */
import { defaultScoringConfig, sanitizeScoringConfig } from '../ai-detox/scoring/config';
import { isLocale } from '../i18n/types';
import type { AppData, LanguagePreference } from './schema';
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

/**
 * Registry: MIGRATIONS[n] migrates version n -> n+1.
 * Version 0 means "pre-versioning / unknown shape": we keep whatever arrays
 * look valid and fill the rest with defaults.
 */
const MIGRATIONS: Record<number, Migration> = {
  0: (data) => ({
    ...emptyAppData(),
    events: Array.isArray(data.events) ? data.events : [],
    gateSessions: Array.isArray(data.gateSessions) ? data.gateSessions : [],
    detoxSessions: Array.isArray(data.detoxSessions) ? data.detoxSessions : [],
    reflections: Array.isArray(data.reflections) ? data.reflections : [],
    challengeHistory: Array.isArray(data.challengeHistory) ? data.challengeHistory : [],
    adversaryRuns: Array.isArray(data.adversaryRuns) ? data.adversaryRuns : [],
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
    const settings =
      typeof data.settings === 'object' && data.settings !== null
        ? (data.settings as Record<string, unknown>)
        : {};
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

  // Post-migration hardening of the pieces core actively interprets.
  const result = data as unknown as AppData;
  // Scoring SEMANTICS are versioned separately from storage SHAPE: the stored
  // document's shape is unchanged when weights change meaning, so this is a
  // config-version concern, not a schemaVersion one. sanitizeScoringConfig
  // rejects any config whose version is not current, and rejection is exactly
  // how the upgrade reaches users who already have stored data — without this
  // step a recalibration would only ever apply to fresh installs (ADR-0005).
  const config = sanitizeScoringConfig(result.scoringConfig);
  // Structural guard for the collections. The v0 step validates these, but it
  // does not run when the stored document already claims the current schema —
  // so a hand-edited or partially-written blob could previously deliver a
  // non-array straight into the scoring path and white-screen every render.
  const asArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);
  return {
    ...emptyAppData(),
    ...result,
    schemaVersion: SCHEMA_VERSION,
    events: asArray(result.events),
    gateSessions: asArray(result.gateSessions),
    detoxSessions: asArray(result.detoxSessions),
    reflections: asArray(result.reflections),
    challengeHistory: asArray(result.challengeHistory),
    adversaryRuns: asArray(result.adversaryRuns),
    scoringConfig: config ?? defaultScoringConfig(),
    settings: {
      onboardingComplete: result.settings?.onboardingComplete === true,
      focusCategories: Array.isArray(result.settings?.focusCategories)
        ? result.settings.focusCategories
        : [],
      language: asLanguage(result.settings?.language),
    },
  };
}
