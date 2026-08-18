/**
 * Reflection — converts experience into awareness. Entries are short,
 * optional, and by architecture never leave the device (ADR-0003).
 */

export type ReflectionContext = 'gate' | 'challenge' | 'detox' | 'free';

export interface ReflectionPrompt {
  id: string;
  context: ReflectionContext;
  question: string;
}

export interface ReflectionEntry {
  id: string;
  createdAt: string;
  context: ReflectionContext;
  /** Id of the gate session / challenge attempt / detox session, if any. */
  linkedId?: string;
  promptId?: string;
  text: string;
}

export const REFLECTION_PROMPTS: readonly ReflectionPrompt[] = [
  // gate
  { id: 'gate_why_now', context: 'gate', question: 'What made you reach for AI at that moment?' },
  { id: 'gate_own_idea', context: 'gate', question: 'What was your own first idea, before AI?' },
  { id: 'gate_next_time', context: 'gate', question: 'Would you do anything differently next time?' },
  // challenge
  { id: 'ch_hardest', context: 'challenge', question: 'What was the hardest part, and how did it feel?' },
  { id: 'ch_surprise', context: 'challenge', question: 'What surprised you about your own thinking?' },
  { id: 'ch_transfer', context: 'challenge', question: 'Where in daily life could you use this ability?' },
  // detox
  { id: 'dx_notice', context: 'detox', question: 'What did you notice while working without AI?' },
  { id: 'dx_urge', context: 'detox', question: 'When did you most want to reach for AI, and why?' },
  // free
  { id: 'free_today', context: 'free', question: 'Where did your own thinking show up today?' },
] as const;

/** Deterministic prompt selection for a context (stable order, max n). */
export function promptsFor(context: ReflectionContext, max = 2): ReflectionPrompt[] {
  return REFLECTION_PROMPTS.filter((p) => p.context === context).slice(0, max);
}

export function createReflection(input: {
  id: string;
  nowIso: string;
  context: ReflectionContext;
  text: string;
  linkedId?: string;
  promptId?: string;
}): ReflectionEntry {
  return {
    id: input.id,
    createdAt: input.nowIso,
    context: input.context,
    linkedId: input.linkedId,
    promptId: input.promptId,
    text: input.text,
  };
}
