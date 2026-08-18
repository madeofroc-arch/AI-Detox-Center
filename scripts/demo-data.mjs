/**
 * Demo data for documentation screenshots. Plausible two weeks of a user who
 * is mid-journey: real dependency patterns, real practice, nothing perfect.
 * Never shipped in the app — this only ever runs in a browser dev session.
 *
 * `language` is a preference, not a locale: 'system' follows the device, which
 * is what a real first-run install has.
 */
export function buildDemoData(todayKey, language = 'system') {
  const day = (offset) =>
    new Date(Date.parse(todayKey) + offset * 86_400_000).toISOString().slice(0, 10);
  const at = (offset, hour) => `${day(offset)}T${String(hour).padStart(2, '0')}:20:00.000Z`;

  let n = 0;
  const event = (offset, hour, category, attemptedFirst, usedAI, immediate, reflection) => ({
    id: `demo_evt_${(n += 1)}`,
    timestamp: at(offset, hour),
    category,
    source: 'gate',
    attemptedFirst,
    usedAI,
    proceededImmediately: immediate,
    ...(reflection ? { reflectionId: `demo_ref_${n}` } : {}),
  });

  // A mid-journey user: practising daily, but still reaching for AI first
  // more often than not. Chosen to exercise every factor bar honestly.
  const events = [
    event(-13, 9, 'direct_delegation', false, true, true),
    event(-12, 10, 'instant_help', false, true, true),
    event(-12, 15, 'direct_delegation', false, true, true),
    event(-11, 11, 'reassurance_seeking', false, true, true),
    event(-10, 9, 'lookup', true, true, false, true),
    event(-10, 16, 'decision_outsourcing', false, true, true),
    event(-9, 14, 'instant_help', false, true, true),
    event(-8, 10, 'direct_delegation', false, true, false),
    event(-7, 13, 'translation', false, true, false),
    event(-6, 9, 'instant_help', false, true, true),
    event(-5, 15, 'reassurance_seeking', false, true, true),
    event(-4, 11, 'review_own_work', true, true, false, true),
    event(-3, 10, 'decision_outsourcing', false, true, true),
    event(-3, 17, 'direct_delegation', false, true, false),
    event(-2, 9, 'lookup', true, false, false),
    event(-1, 14, 'brainstorm_partner', true, true, false, true),
    event(0, 9, 'review_own_work', true, false, false, true),
    event(0, 13, 'instant_help', false, true, true),
  ];

  const attempt = (offset, challengeId, category, difficulty, status) => ({
    id: `demo_att_${challengeId}_${offset}`,
    challengeId,
    dateKey: day(offset),
    status,
    category,
    difficulty,
  });

  const challengeHistory = [
    attempt(-8, 'wr_hundred_words', 'writing', 1, 'completed'),
    attempt(-7, 'cr_twenty_uses', 'creativity', 1, 'completed'),
    attempt(-6, 'fo_25_no_ai', 'focus', 1, 'attempted'),
    attempt(-5, 'th_assumptions', 'thinking', 2, 'completed'),
    attempt(-4, 'me_retrieve_first', 'memory', 2, 'skipped'),
    attempt(-3, 'dm_abc_reasons', 'decision_making', 2, 'completed'),
    attempt(-2, 'wr_explain_simply', 'writing', 3, 'completed'),
    attempt(-1, 'ps_three_before_hint', 'problem_solving', 2, 'attempted'),
    attempt(0, 'co_own_words_message', 'communication', 1, 'completed'),
  ];

  const gateSessions = [
    {
      id: 'demo_gate_1',
      startedAt: at(0, 9),
      step: 'completed',
      question: 'Outline the retro doc',
      category: 'brainstorm_partner',
      triedFirst: true,
      attemptSeconds: 180,
      outcome: 'solved_myself',
      completedAt: at(0, 9),
    },
    {
      id: 'demo_gate_2',
      startedAt: at(-1, 14),
      step: 'completed',
      question: 'Check my argument',
      category: 'review_own_work',
      triedFirst: true,
      attemptSeconds: 240,
      outcome: 'hint_then_thinking',
      completedAt: at(-1, 14),
    },
    {
      id: 'demo_gate_3',
      startedAt: at(-3, 11),
      step: 'completed',
      question: 'Which vendor should we pick',
      category: 'decision_outsourcing',
      triedFirst: false,
      skippedAttempt: true,
      attemptSeconds: 0,
      outcome: 'proceeded_to_ai',
      completedAt: at(-3, 11),
    },
  ];

  const detoxSessions = [
    {
      id: 'demo_detox_1',
      plannedMinutes: 50,
      intention: 'Draft the memo myself',
      startedAt: at(-1, 8),
      state: 'completed',
      pausedTotalSeconds: 0,
      endedAt: `${day(-1)}T09:10:00.000Z`,
    },
    {
      id: 'demo_detox_2',
      plannedMinutes: 25,
      intention: 'Read the spec without summarizing it',
      startedAt: at(-4, 15),
      state: 'ended_early',
      pausedTotalSeconds: 0,
      endedAt: `${day(-4)}T15:38:00.000Z`,
    },
  ];

  const reflections = events
    .filter((e) => e.reflectionId)
    .map((e) => ({
      id: e.reflectionId,
      createdAt: e.timestamp,
      context: 'gate',
      linkedId: e.id,
      text: 'Noticed I wanted a shortcut. Tried my own version first.',
    }));

  return {
    // Deliberately the OLD schema version: the fixture doubles as a migration
    // exercise, so every screenshot run proves migrateAppData still lifts a
    // v1 document rather than only ever testing a freshly-written one.
    schemaVersion: 1,
    events,
    gateSessions,
    detoxSessions,
    reflections,
    challengeHistory,
    settings: {
      onboardingComplete: true,
      focusCategories: ['writing', 'thinking', 'focus'],
      language,
    },
  };
}
