/**
 * The single persisted document. Versioned from day one so migrations are
 * routine, not emergencies (ADR-0003).
 */
import type { GateSession } from '../ai-detox/ai-gate/gate';
import type { DetoxSession } from '../ai-detox/detox/detox';
import type { ReflectionEntry } from '../ai-detox/reflection/reflection';
import type { ScoringConfig } from '../ai-detox/scoring/config';
import { defaultScoringConfig } from '../ai-detox/scoring/config';
import type { AIUsageEvent } from '../ai-detox/tracking/types';
import type { ChallengeAttempt, ChallengeCategory } from '../challenges/types';
import type { Locale } from '../i18n/types';

export const SCHEMA_VERSION = 2;

/**
 * 'system' means "follow the device", which is the honest default: guessing a
 * language once at install and freezing it is wrong the moment the user
 * changes their phone. Resolving 'system' to a concrete locale is the app
 * layer's job — core never reads the platform.
 */
export type LanguagePreference = Locale | 'system';

export interface AppSettings {
  onboardingComplete: boolean;
  focusCategories: ChallengeCategory[];
  language: LanguagePreference;
}

export interface AppData {
  schemaVersion: number;
  events: AIUsageEvent[];
  gateSessions: GateSession[];
  detoxSessions: DetoxSession[];
  reflections: ReflectionEntry[];
  challengeHistory: ChallengeAttempt[];
  scoringConfig: ScoringConfig;
  settings: AppSettings;
}

export function emptyAppData(): AppData {
  return {
    schemaVersion: SCHEMA_VERSION,
    events: [],
    gateSessions: [],
    detoxSessions: [],
    reflections: [],
    challengeHistory: [],
    scoringConfig: defaultScoringConfig(),
    settings: { onboardingComplete: false, focusCategories: [], language: 'system' },
  };
}
