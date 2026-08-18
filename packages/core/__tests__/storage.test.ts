import { describe, expect, it } from 'vitest';
import {
  AppRepository,
  BACKUP_KEY,
  DEFAULT_SCORING_CONFIG,
  MemoryStorage,
  SCHEMA_VERSION,
  STORAGE_KEY,
  emptyAppData,
  migrateAppData,
} from '../src/index';
import { SCORING_CONFIG_VERSION, defaultScoringConfig } from '../src/index';
import { makeEvent } from './helpers';

describe('migrateAppData', () => {
  it('returns empty data for null/invalid input', () => {
    expect(migrateAppData(null)).toEqual(emptyAppData());
    expect(migrateAppData('garbage')).toEqual(emptyAppData());
    expect(migrateAppData(42)).toEqual(emptyAppData());
  });

  it('migrates unversioned (v0) data, keeping valid arrays', () => {
    const legacy = { events: [makeEvent({ id: 'keep' })], junk: true };
    const migrated = migrateAppData(legacy);
    expect(migrated.schemaVersion).toBe(SCHEMA_VERSION);
    expect(migrated.events).toHaveLength(1);
    expect(migrated.events[0]!.id).toBe('keep');
    expect(migrated.challengeHistory).toEqual([]);
    expect(migrated.scoringConfig).toEqual(DEFAULT_SCORING_CONFIG);
  });

  it('repairs a corrupted scoring config with defaults', () => {
    const data = { ...emptyAppData(), scoringConfig: { totally: 'broken' } };
    const migrated = migrateAppData(data);
    expect(migrated.scoringConfig).toEqual(DEFAULT_SCORING_CONFIG);
  });

  it('upgrades a stored config from an older semantics version', () => {
    // The gap this closes: MIGRATIONS keys on schemaVersion, so before
    // ADR-0005 a stored config kept its old weights forever and a
    // recalibration reached new installs only.
    const stale = {
      ...emptyAppData(),
      scoringConfig: {
        ...defaultScoringConfig(),
        version: SCORING_CONFIG_VERSION - 1,
        weights: { ...defaultScoringConfig().weights, independentAttempt: 25 },
      },
    };
    const migrated = migrateAppData(stale);
    expect(migrated.scoringConfig.version).toBe(SCORING_CONFIG_VERSION);
    expect(migrated.scoringConfig).toEqual(DEFAULT_SCORING_CONFIG);
  });

  it('keeps user data while upgrading the config', () => {
    const stale = {
      ...emptyAppData(),
      events: [makeEvent({ id: 'survives' })],
      scoringConfig: { ...defaultScoringConfig(), version: SCORING_CONFIG_VERSION - 1 },
    };
    const migrated = migrateAppData(stale);
    expect(migrated.events).toHaveLength(1);
    expect(migrated.events[0]!.id).toBe('survives');
    expect(migrated.scoringConfig.version).toBe(SCORING_CONFIG_VERSION);
  });

  it('tolerates data with no scoringConfig at all', () => {
    const noConfig: Record<string, unknown> = { ...emptyAppData() };
    delete noConfig.scoringConfig;
    expect(migrateAppData(noConfig).scoringConfig).toEqual(DEFAULT_SCORING_CONFIG);
  });

  it('refuses to migrate down from a future schema', () => {
    const future = { ...emptyAppData(), schemaVersion: SCHEMA_VERSION + 1 };
    expect(() => migrateAppData(future)).toThrow(/newer/);
  });
});

describe('AppRepository', () => {
  it('round-trips data through save and load', async () => {
    const repo = new AppRepository(new MemoryStorage());
    const data = emptyAppData();
    data.events.push(makeEvent({ id: 'rt' }));
    data.settings.onboardingComplete = true;
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

  it('exports human-readable JSON containing the data', () => {
    const repo = new AppRepository(new MemoryStorage());
    const data = emptyAppData();
    data.events.push(makeEvent({ id: 'exp' }));
    const json = repo.exportJson(data);
    expect(JSON.parse(json)).toEqual(data);
    expect(json).toContain('\n');
  });
});

describe('structural guards on stored collections', () => {
  it('replaces a non-array collection instead of passing it into the scoring path', () => {
    // Regression: a blob already claiming the current schemaVersion skipped the
    // v0 validation, so `events: "oops"` reached computeDependencyScore and
    // threw during render on every launch.
    const corrupt = { ...emptyAppData(), schemaVersion: SCHEMA_VERSION, events: 'oops' };
    const migrated = migrateAppData(corrupt);
    expect(Array.isArray(migrated.events)).toBe(true);
    expect(migrated.events).toEqual([]);
  });

  it('guards every collection, not just events', () => {
    const corrupt = {
      ...emptyAppData(),
      schemaVersion: SCHEMA_VERSION,
      gateSessions: 42,
      detoxSessions: null,
      reflections: 'nope',
      challengeHistory: { not: 'an array' },
    };
    const migrated = migrateAppData(corrupt);
    for (const key of ['gateSessions', 'detoxSessions', 'reflections', 'challengeHistory'] as const) {
      expect(Array.isArray(migrated[key]), key).toBe(true);
      expect(migrated[key]).toEqual([]);
    }
  });
});
