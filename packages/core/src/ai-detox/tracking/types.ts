/**
 * Usage tracking distinguishes AI usage QUANTITY (neutral) from AI dependency
 * BEHAVIOR (what we score). The category taxonomy is the heart of that
 * distinction — see docs/product/vision.md and the ai-detox-engine skill.
 */

export type AIUsageCategory =
  // deliberate / low-dependency usage
  | 'translation'
  | 'lookup'
  | 'organize'
  | 'brainstorm_partner'
  | 'review_own_work'
  // high-dependency usage patterns
  | 'direct_delegation'
  | 'decision_outsourcing'
  | 'instant_help'
  | 'reassurance_seeking';

/** Behavioral kind of a category — drives scoring factors. */
export type UsageKind = 'deliberate' | 'delegation' | 'immediate' | 'emotional';

export interface CategoryInfo {
  category: AIUsageCategory;
  kind: UsageKind;
  label: string;
  description: string;
}

export const CATEGORY_INFO: readonly CategoryInfo[] = [
  {
    category: 'translation',
    kind: 'deliberate',
    label: 'Translate',
    description: 'Translating text between languages.',
  },
  {
    category: 'lookup',
    kind: 'deliberate',
    label: 'Look something up',
    description: 'Finding a fact or piece of information.',
  },
  {
    category: 'organize',
    kind: 'deliberate',
    label: 'Organize material',
    description: 'Structuring or cleaning up material you already have.',
  },
  {
    category: 'brainstorm_partner',
    kind: 'deliberate',
    label: 'Brainstorm after thinking',
    description: 'You thought first; AI extends your ideas.',
  },
  {
    category: 'review_own_work',
    kind: 'deliberate',
    label: 'Review my own work',
    description: 'You did the work; AI gives feedback.',
  },
  {
    category: 'direct_delegation',
    kind: 'delegation',
    label: 'Do it for me',
    description: 'Handing the whole task to AI without attempting it.',
  },
  {
    category: 'decision_outsourcing',
    kind: 'delegation',
    label: 'Decide for me',
    description: 'Letting AI make a decision that is yours to make.',
  },
  {
    category: 'instant_help',
    kind: 'immediate',
    label: 'Instant help',
    description: 'Asking AI at the first sign of difficulty.',
  },
  {
    category: 'reassurance_seeking',
    kind: 'emotional',
    label: 'Reassurance',
    description: 'Asking AI to confirm something you already know or decided.',
  },
] as const;

const KIND_BY_CATEGORY: Record<AIUsageCategory, UsageKind> = Object.fromEntries(
  CATEGORY_INFO.map((c) => [c.category, c.kind]),
) as Record<AIUsageCategory, UsageKind>;

export function kindOf(category: AIUsageCategory): UsageKind {
  return KIND_BY_CATEGORY[category];
}

/**
 * One recorded "AI moment". Not every event is an AI use: a gate session the
 * user resolved alone is recorded with usedAI=false — that independent
 * attempt is exactly what the score should credit.
 */
export interface AIUsageEvent {
  id: string;
  /** ISO timestamp (device local time serialized to ISO). */
  timestamp: string;
  category: AIUsageCategory;
  source: 'gate' | 'manual';
  /** Did the user try it themselves before (considering) AI? */
  attemptedFirst: boolean;
  /** Did AI end up being used? */
  usedAI: boolean;
  /** AI was used with no pause or attempt beforehand. */
  proceededImmediately: boolean;
  /** Optional link to a reflection entry. */
  reflectionId?: string;
}
