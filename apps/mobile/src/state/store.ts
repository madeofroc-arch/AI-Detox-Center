/**
 * App state — a thin persistence-aware wrapper around core's AppData.
 * All business rules live in @ai-detox/core; this store only loads, applies
 * core functions, and saves.
 */
import { create } from 'zustand';
import type {
  AppData,
  ChallengeAttempt,
  ChallengeCategory,
  DetoxSession,
  GateSession,
  LoadWarning,
  ReflectionEntry,
} from '@ai-detox/core';
import {
  AppRepository,
  DEFAULT_SCORING_CONFIG,
  emptyAppData,
  gateToUsageEvent,
} from '@ai-detox/core';
import { asyncStoragePort } from '../storage/asyncStorage';
import { newId } from '../lib/ids';

const repository = new AppRepository(asyncStoragePort);

interface AppStore {
  hydrated: boolean;
  loadWarning?: LoadWarning;
  saveError: boolean;
  data: AppData;

  hydrate: () => Promise<void>;
  /** Apply a pure update to AppData, persist, and update state. */
  update: (fn: (data: AppData) => AppData) => Promise<void>;

  completeOnboarding: (focusCategories: ChallengeCategory[]) => Promise<void>;
  setFocusCategories: (focusCategories: ChallengeCategory[]) => Promise<void>;
  /** Records the session + its usage event; returns the event id (for reflection linking). */
  recordGateSession: (session: GateSession) => Promise<string>;
  recordDetoxSession: (session: DetoxSession) => Promise<void>;
  recordChallengeAttempt: (attempt: ChallengeAttempt) => Promise<void>;
  addReflection: (entry: ReflectionEntry) => Promise<void>;
  resetScoringConfig: () => Promise<void>;
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

  completeOnboarding: (focusCategories) =>
    get().update((data) => ({
      ...data,
      settings: { ...data.settings, onboardingComplete: true, focusCategories },
    })),

  setFocusCategories: (focusCategories) =>
    get().update((data) => ({
      ...data,
      settings: { ...data.settings, focusCategories },
    })),

  recordGateSession: async (session) => {
    const eventId = newId('evt');
    await get().update((data) => ({
      ...data,
      gateSessions: [...data.gateSessions, session],
      events: [...data.events, gateToUsageEvent(session, eventId)],
    }));
    return eventId;
  },

  recordDetoxSession: (session) =>
    get().update((data) => ({
      ...data,
      detoxSessions: [...data.detoxSessions, session],
    })),

  recordChallengeAttempt: (attempt) =>
    get().update((data) => ({
      ...data,
      challengeHistory: [...data.challengeHistory, attempt],
    })),

  addReflection: (entry) =>
    get().update((data) => {
      const next: AppData = { ...data, reflections: [...data.reflections, entry] };
      // Link back onto the source record so the score can credit reflection.
      if (entry.context === 'gate' && entry.linkedId) {
        next.events = data.events.map((e) =>
          e.id === entry.linkedId ? { ...e, reflectionId: entry.id } : e,
        );
      }
      if (entry.context === 'challenge' && entry.linkedId) {
        next.challengeHistory = data.challengeHistory.map((a) =>
          a.id === entry.linkedId ? { ...a, reflectionId: entry.id } : a,
        );
      }
      if (entry.context === 'detox' && entry.linkedId) {
        next.detoxSessions = data.detoxSessions.map((s) =>
          s.id === entry.linkedId ? { ...s, reflectionId: entry.id } : s,
        );
      }
      return next;
    }),

  resetScoringConfig: () =>
    get().update((data) => ({
      ...data,
      scoringConfig: {
        ...DEFAULT_SCORING_CONFIG,
        weights: { ...DEFAULT_SCORING_CONFIG.weights },
      },
    })),

  deleteAllData: async () => {
    await repository.clear();
    set({ data: emptyAppData(), loadWarning: undefined, saveError: false });
  },

  exportJson: () => repository.exportJson(get().data),
}));
