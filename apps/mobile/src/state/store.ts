/**
 * App state — a thin persistence-aware wrapper around core's AppData.
 * All business rules live in @ai-detox/core; this store only loads, applies
 * core functions, and saves.
 *
 * It used to carry a writer for every surface the tracker had: onboarding,
 * focus categories, gate sessions, detox sessions, challenge attempts,
 * reflections, a scoring-config reset. Those screens are gone, so the writers
 * went with them — an action nothing calls is a claim the product still does
 * something it does not.
 *
 * `AppData` still has the fields they wrote to, and core still has the engines
 * behind them. Removing those is a separate change with a migration in it.
 */
import { create } from 'zustand';
import type { AppData, LanguagePreference, LoadWarning, RunRecord } from '@ai-detox/core';
import { AppRepository, appendRunRecord, emptyAppData } from '@ai-detox/core';
import { asyncStoragePort } from '../storage/asyncStorage';

const repository = new AppRepository(asyncStoragePort);

interface AppStore {
  hydrated: boolean;
  loadWarning?: LoadWarning;
  saveError: boolean;
  data: AppData;

  hydrate: () => Promise<void>;
  /** Apply a pure update to AppData, persist, and update state. */
  update: (fn: (data: AppData) => AppData) => Promise<void>;

  setLanguage: (language: LanguagePreference) => Promise<void>;
  /** Keep a finished run of The Adversary. The diagnosis reads all of them. */
  recordAdversaryRun: (record: RunRecord) => Promise<void>;
  deleteAllData: () => Promise<void>;
  exportJson: () => string;
}

export const useAppStore = create<AppStore>((set, get) => ({
  hydrated: false,
  saveError: false,
  data: emptyAppData(),

  hydrate: async () => {
    const { data, warning } = await repository.load();
    set({ data, loadWarning: warning, hydrated: true });
  },

  update: async (fn) => {
    const next = fn(get().data);
    set({ data: next });
    try {
      await repository.save(next);
      if (get().saveError) set({ saveError: false });
    } catch {
      // Keep the in-memory state; surface the problem instead of hiding it.
      set({ saveError: true });
    }
  },

  setLanguage: (language) =>
    get().update((data) => ({
      ...data,
      settings: { ...data.settings, language },
    })),

  recordAdversaryRun: (record) =>
    get().update((data) => ({
      ...data,
      adversaryRuns: appendRunRecord(data.adversaryRuns, record),
    })),

  deleteAllData: async () => {
    await repository.clear();
    set({ data: emptyAppData(), loadWarning: undefined, saveError: false });
  },

  exportJson: () => repository.exportJson(get().data),
}));
