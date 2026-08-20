import { describe, expect, it } from 'vitest';
import {
  AppRepository,
  BACKUP_KEY,
  MemoryStorage,
  SCHEMA_VERSION,
  STORAGE_KEY,
  emptyAppData,
  migrateAppData,
} from '../src/index';

/**
 * The document is the only thing in this product that outlives a session, so
 * the migration chain is the only place where a mistake is not recoverable by
 * relaunching. Every test here is about something that can be lost.
 */

/** A v3 document as the tracker actually wrote them. */
function v3(over: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    schemaVersion: 3,
    events: [],
    gateSessions: [],
    detoxSessions: [],
    reflections: [],
    challengeHistory: [],
    adversaryRuns: [],
    scoringConfig: { version: 3, weights: { frequency: 20 } },
    settings: { onboardingComplete: true, focusCategories: ['creativity'], language: 'zh-TW' },
    ...over,
  };
}

const aRun = { tier: 'hard', seed: 's', bank: 12 };
const anEvent = { id: 'evt_1', timestamp: '2026-08-17T10:00:00.000Z', category: 'lookup' };

describe('migrateAppData', () => {
  it('returns empty data for null/invalid input', () => {
    expect(migrateAppData(null)).toEqual(emptyAppData());
    expect(migrateAppData('garbage')).toEqual(emptyAppData());
    expect(migrateAppData(42)).toEqual(emptyAppData());
  });

  it('refuses to migrate down from a future schema', () => {
    const future = { ...emptyAppData(), schemaVersion: SCHEMA_VERSION + 1 };
    expect(() => migrateAppData(future)).toThrow(/newer/);
  });

  it('gives a v2 document an empty run history rather than leaving it undefined', () => {
    // A v2 document predates The Adversary keeping its runs. The diagnosis
    // reads this list on every render, so `undefined` here is a white screen.
    const migrated = migrateAppData({ schemaVersion: 2, settings: { language: 'en' } });
    expect(migrated.schemaVersion).toBe(SCHEMA_VERSION);
    expect(migrated.adversaryRuns).toEqual([]);
  });

  it('carries a language preference all the way from v1', () => {
    // Regression: 1 -> 2 used to overwrite rather than fill, and discarded the
    // language on every migrated document.
    const migrated = migrateAppData({ schemaVersion: 1, settings: { language: 'zh-TW' } });
    expect(migrated.settings.language).toBe('zh-TW');
  });

  it('keeps a run history that is already there', () => {
    expect(migrateAppData(v3({ adversaryRuns: [aRun] })).adversaryRuns).toHaveLength(1);
  });
});

/**
 * v4 removed the dependency tracker. Deleting somebody's history because the
 * product changed direction is the silent data loss ADR-0003 forbids, so the
 * migration moves it into `retired` rather than dropping it — and the export
 * button still hands it back.
 */
describe('retiring the tracker (3 -> 4)', () => {
  it('drops the tracker fields off the live document', () => {
    const migrated = migrateAppData(v3({ events: [anEvent] })) as unknown as Record<string, unknown>;
    for (const key of [
      'events',
      'gateSessions',
      'detoxSessions',
      'reflections',
      'challengeHistory',
      'scoringConfig',
    ]) {
      expect(migrated[key], `${key} is still on the live document`).toBeUndefined();
    }
    expect(Object.keys(migrated.settings as object)).toEqual(['language']);
  });

  it('keeps the history it dropped, so the export is still complete', () => {
    const migrated = migrateAppData(
      v3({ events: [anEvent], challengeHistory: [{ id: 'att_1' }] }),
    );
    expect(migrated.retired).toBeDefined();
    expect(migrated.retired!.retiredFrom).toBe(3);
    expect(migrated.retired!.events).toEqual([anEvent]);
    expect(migrated.retired!.challengeHistory).toEqual([{ id: 'att_1' }]);
    expect(migrated.retired!.scoringConfig).toEqual({ version: 3, weights: { frequency: 20 } });
    expect(migrated.retired!.settings).toEqual({
      onboardingComplete: true,
      focusCategories: ['creativity'],
    });
  });

  it('archives nothing when there was no tracker history', () => {
    // Every v3 document carried a scoringConfig whether the person ever opened
    // the tracker or not. Archiving that alone would hand a `retired` key to
    // users who have nothing retired, which is clutter rather than custody.
    expect(migrateAppData(v3()).retired).toBeUndefined();
  });

  it('does not lose the tracker history of an unversioned document', () => {
    // v0 -> 1 has to carry the collections forward RAW. A version of it that
    // dropped them would arrive at v4 with nothing to archive, which is the
    // same data loss taking a longer route.
    const migrated = migrateAppData({ events: [anEvent], junk: true });
    expect(migrated.schemaVersion).toBe(SCHEMA_VERSION);
    expect(migrated.retired!.events).toEqual([anEvent]);
  });

  it('survives a v3 document whose settings are missing entirely', () => {
    const bare = v3({ events: [anEvent] });
    delete bare.settings;
    const migrated = migrateAppData(bare);
    expect(migrated.settings.language).toBe('system');
    expect(migrated.retired!.settings).toBeUndefined();
  });

  it('leaves an archive alone once it exists', () => {
    const v4 = { ...emptyAppData(), retired: { retiredFrom: 3, events: [anEvent] } };
    expect(migrateAppData(v4).retired).toEqual({ retiredFrom: 3, events: [anEvent] });
  });
});

describe('structural guards on stored collections', () => {
  it('replaces a non-array run history instead of passing it into the diagnosis', () => {
    // Regression: a blob already claiming the current schemaVersion skipped the
    // v0 validation, so a string reached the reader and threw on every launch.
    const corrupt = { ...emptyAppData(), schemaVersion: SCHEMA_VERSION, adversaryRuns: 'oops' };
    expect(migrateAppData(corrupt).adversaryRuns).toEqual([]);
  });

  it('falls back to following the device for an unknown language', () => {
    const corrupt = { ...emptyAppData(), settings: { language: 'klingon' } };
    expect(migrateAppData(corrupt).settings.language).toBe('system');
  });

  it('drops junk a hand-edited document brought with it', () => {
    const junk = { ...emptyAppData(), somethingElse: true } as Record<string, unknown>;
    expect(Object.keys(migrateAppData(junk)).sort()).toEqual([
      'adversaryRuns',
      'schemaVersion',
      'settings',
    ]);
  });
});

describe('AppRepository', () => {
  it('round-trips data through save and load', async () => {
    const repo = new AppRepository(new MemoryStorage());
    const data = emptyAppData();
    data.adversaryRuns.push(aRun as never);
    data.settings.language = 'zh-TW';
    await repo.save(data);
    const loaded = await repo.load();
    expect(loaded.warning).toBeUndefined();
    expect(loaded.data).toEqual(data);
  });

  it('returns empty data on first launch', async () => {
    const repo = new AppRepository(new MemoryStorage());
    const { data, warning } = await repo.load();
    expect(warning).toBeUndefined();
    expect(data).toEqual(emptyAppData());
  });

  it('backs up corrupt JSON instead of silently discarding it', async () => {
    const port = new MemoryStorage();
    await port.setItem(STORAGE_KEY, '{not valid json');
    const repo = new AppRepository(port);
    const { data, warning } = await repo.load();
    expect(warning).toBe('corrupt_data_backed_up');
    expect(data).toEqual(emptyAppData());
    expect(await port.getItem(BACKUP_KEY)).toBe('{not valid json');
  });

  it('surfaces a warning (and does not overwrite) for future-schema data', async () => {
    const port = new MemoryStorage();
    const future = JSON.stringify({ ...emptyAppData(), schemaVersion: SCHEMA_VERSION + 5 });
    await port.setItem(STORAGE_KEY, future);
    const repo = new AppRepository(port);
    const { warning } = await repo.load();
    expect(warning).toBe('schema_too_new');
    expect(await port.getItem(STORAGE_KEY)).toBe(future);
  });

  it('clear removes data and backup (delete-all-data control)', async () => {
    const port = new MemoryStorage();
    const repo = new AppRepository(port);
    await repo.save(emptyAppData());
    await port.setItem(BACKUP_KEY, 'x');
    await repo.clear();
    expect(await port.getItem(STORAGE_KEY)).toBeNull();
    expect(await port.getItem(BACKUP_KEY)).toBeNull();
  });

  it('exports the archive too, which is the point of keeping it', async () => {
    const port = new MemoryStorage();
    await port.setItem(STORAGE_KEY, JSON.stringify(v3({ events: [anEvent] })));
    const repo = new AppRepository(port);
    const { data } = await repo.load();

    const exported = JSON.parse(repo.exportJson(data));
    expect(exported.retired.events).toEqual([anEvent]);
    expect(repo.exportJson(data)).toContain('\n');
  });
});
