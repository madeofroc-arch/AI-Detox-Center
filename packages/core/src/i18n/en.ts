/**
 * English domain strings.
 *
 * Derived from the canonical data structures rather than duplicated: the
 * catalog, the taxonomy and the config descriptions ARE the English version.
 * Copying them here would let the two drift, and the drift would be silent.
 */
import { FACTOR_DESCRIPTIONS } from '../ai-detox/scoring/config';
import { BAND_LABELS } from '../ai-detox/scoring/scoring';
import { CATEGORY_INFO } from '../ai-detox/tracking/types';
import { REFLECTION_PROMPTS } from '../ai-detox/reflection/reflection';
import { CHALLENGE_CATALOG } from '../challenges/catalog';
import { CATEGORY_LABELS } from '../challenges/types';
import type { AIUsageCategory } from '../ai-detox/tracking/types';
import type { ScoringFactor } from '../ai-detox/scoring/config';
import type { ChallengeText, CoreStrings, UsageCategoryText } from './types';

/** Short names for the report rows. The descriptions live in ScoringConfig. */
const FACTOR_LABELS: Record<ScoringFactor, string> = {
  frequency: 'Frequency',
  immediacy: 'Immediacy',
  delegation: 'Delegation',
  lackOfAttempt: 'No attempt first',
  emotionalDependency: 'Reassurance',
  independentAttempt: 'Independent attempts',
};

export const EN_STRINGS: CoreStrings = {
  locale: 'en',
  bandLabels: BAND_LABELS,
  factorLabels: FACTOR_LABELS,
  factorDescriptions: FACTOR_DESCRIPTIONS,
  usageCategories: Object.fromEntries(
    CATEGORY_INFO.map((c) => [c.category, { label: c.label, description: c.description }]),
  ) as Record<AIUsageCategory, UsageCategoryText>,
  challengeCategories: CATEGORY_LABELS,
  reflectionPrompts: Object.fromEntries(REFLECTION_PROMPTS.map((p) => [p.id, p.question])),
  challenges: Object.fromEntries(
    CHALLENGE_CATALOG.map((c) => [
      c.id,
      {
        title: c.title,
        instructions: c.instructions,
        successCondition: c.successCondition,
        reflectionQuestions: [...c.reflectionQuestions],
      } satisfies ChallengeText,
    ]),
  ),
  /**
   * Empty on purpose. The round catalog is authored in English, so there is
   * nothing for English to overlay onto it — `localizeRound` falls through to
   * the round itself.
   */
  adversaryRounds: {},
};
