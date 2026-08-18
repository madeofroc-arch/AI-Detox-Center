/**
 * StoragePort — the only door between core and persistence (ADR-0003).
 * Core never touches platform storage APIs; the app injects an adapter
 * (AsyncStorage on native, localStorage on web, in-memory in tests).
 */
export interface StoragePort {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

/** In-memory adapter for tests and previews. */
export class MemoryStorage implements StoragePort {
  private store = new Map<string, string>();

  getItem(key: string): Promise<string | null> {
    return Promise.resolve(this.store.get(key) ?? null);
  }

  setItem(key: string, value: string): Promise<void> {
    this.store.set(key, value);
    return Promise.resolve();
  }

  removeItem(key: string): Promise<void> {
    this.store.delete(key);
    return Promise.resolve();
  }
}
