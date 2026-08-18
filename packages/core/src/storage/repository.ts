/**
 * AppRepository — load/save the single AppData document through a
 * StoragePort. Corrupt data is never silently discarded: it is backed up
 * under a separate key and the load result carries a warning the UI can
 * surface.
 */
import type { StoragePort } from './port';
import type { AppData } from './schema';
import { emptyAppData } from './schema';
import { SchemaTooNewError, migrateAppData } from './migrations';

export const STORAGE_KEY = 'ai-detox/app-data';
export const BACKUP_KEY = 'ai-detox/app-data.corrupt-backup';

export type LoadWarning = 'corrupt_data_backed_up' | 'schema_too_new';

export interface LoadResult {
  data: AppData;
  warning?: LoadWarning;
}

export class AppRepository {
  constructor(private readonly port: StoragePort) {}

  async load(): Promise<LoadResult> {
    const raw = await this.port.getItem(STORAGE_KEY);
    if (raw === null) return { data: emptyAppData() };

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      await this.port.setItem(BACKUP_KEY, raw);
      return { data: emptyAppData(), warning: 'corrupt_data_backed_up' };
    }

    try {
      return { data: migrateAppData(parsed) };
    } catch (err) {
      if (err instanceof SchemaTooNewError) {
        // Do not touch data written by a newer app version.
        return { data: emptyAppData(), warning: 'schema_too_new' };
      }
      throw err;
    }
  }

  async save(data: AppData): Promise<void> {
    await this.port.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  /** Full local wipe — the user's "delete all data" control. */
  async clear(): Promise<void> {
    await this.port.removeItem(STORAGE_KEY);
    await this.port.removeItem(BACKUP_KEY);
  }

  /** Human-readable JSON export — the user's "export my data" control. */
  exportJson(data: AppData): string {
    return JSON.stringify(data, null, 2);
  }
}
