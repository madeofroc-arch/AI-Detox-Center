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
