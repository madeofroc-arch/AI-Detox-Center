/**
 * Seed challenge catalog: 3 per category x 9 categories, difficulties 1-5
 * represented across each category's spread. Static data by design — no
 * runtime AI generation in core (ADR-0004).
 */
import type { Challenge } from './types';

export const CHALLENGE_CATALOG: readonly Challenge[] = [
  // ── Thinking ──────────────────────────────────────────────────────────
  {
    id: 'th_assumptions',
    category: 'thinking',
    difficulty: 2,
    durationMinutes: 10,
    title: 'Question one assumption',
    instructions:
      'Pick a belief you acted on today (about work, people, or plans). Without AI, write down: what would have to be true for this belief to be wrong? List at least three possibilities.',
    successCondition: 'Three written ways your assumption could be wrong.',
    reflectionQuestions: [
      'Which of the three feels most plausible?',
      'How would you check it in real life?',
    ],
    hasWorkArea: true,
  },
  {
    id: 'th_steelman',
    category: 'thinking',
    difficulty: 3,
    durationMinutes: 15,
    title: 'Steelman the other side',
    instructions:
      'Choose an opinion you hold. Without AI, write the strongest honest argument AGAINST your position — the version its smartest supporter would give.',
    successCondition: 'A counter-argument you would accept as fair.',
    reflectionQuestions: [
      'Did your own position shift at all?',
      'What was hardest about arguing against yourself?',
    ],
    hasWorkArea: true,
  },
  {
    id: 'th_first_principles',
    category: 'thinking',
    difficulty: 5,
    durationMinutes: 25,
    title: 'Rebuild it from first principles',
    instructions:
      'Take something you do on autopilot (your morning routine, a work process). Without AI, break it down to its actual goals, question every step, and redesign it from scratch on paper.',
    successCondition: 'A redesigned process with a reason attached to every step.',
    reflectionQuestions: [
      'Which step survived only out of habit?',
      'What will you actually change tomorrow?',
    ],
    hasWorkArea: true,
  },
  // ── Creativity ────────────────────────────────────────────────────────
  {
    id: 'cr_twenty_uses',
    category: 'creativity',
    difficulty: 1,
    durationMinutes: 10,
    title: '20 uses for a pen',
    instructions:
      'Without AI, list 20 different uses for an ordinary pen. The last five are where it gets interesting — keep going past the obvious.',
    successCondition: '20 written uses, no repeats.',
    reflectionQuestions: [
      'At which number did it get hard?',
      'What changed in your thinking after the obvious ideas ran out?',
    ],
    hasWorkArea: true,
  },
  {
    id: 'cr_six_word_stories',
    category: 'creativity',
    difficulty: 3,
    durationMinutes: 15,
    title: 'Six-word stories',
    instructions:
      'Without AI, write five complete stories of exactly six words each: a beginning, a turn, an ending — in six words.',
    successCondition: 'Five six-word stories you would show a friend.',
    reflectionQuestions: [
      'Which constraint helped rather than hurt?',
      'Which story surprised you?',
    ],
    hasWorkArea: true,
  },
  {
    id: 'cr_bad_ideas',
    category: 'creativity',
    difficulty: 4,
    durationMinutes: 20,
    title: 'Ten deliberately bad ideas',
    instructions:
      'Pick a real problem you have. Without AI, generate ten deliberately terrible solutions. Then pick the two worst and find the useful insight hiding inside each.',
    successCondition: 'Ten bad ideas plus two extracted insights.',
    reflectionQuestions: [
      'Did any bad idea turn out to be secretly good?',
      'What does this say about how you usually filter ideas?',
    ],
    hasWorkArea: true,
  },
  // ── Writing ───────────────────────────────────────────────────────────
  {
    id: 'wr_hundred_words',
    category: 'writing',
    difficulty: 1,
    durationMinutes: 10,
    title: '100 words on today',
    instructions:
      'Without AI, write about one thing that happened today in about 100 words. Concrete details over generalities: what you saw, heard, felt.',
    successCondition: 'Roughly 100 words, in your own voice.',
    reflectionQuestions: [
      'What detail are you glad you captured?',
      'How did writing without assistance feel?',
    ],
    hasWorkArea: true,
  },
  {
    id: 'wr_explain_simply',
    category: 'writing',
    difficulty: 3,
    durationMinutes: 15,
    title: 'Explain it to a 10-year-old',
    instructions:
      'Take something you know well from your work or studies. Without AI, explain it in writing so a curious 10-year-old would get it. No jargon allowed.',
    successCondition: 'An explanation with zero unexplained jargon.',
    reflectionQuestions: [
      'Where did you discover you understood less than you thought?',
      'Which simplification are you proudest of?',
    ],
    hasWorkArea: true,
  },
  {
    id: 'wr_one_page_case',
    category: 'writing',
    difficulty: 5,
    durationMinutes: 30,
    title: 'The one-page case',
    instructions:
      'Pick something you want to convince a real person of. Without AI, write a one-page case: their perspective first, your strongest three points, and the ask. Edit it once before finishing.',
    successCondition: 'A finished one-pager you could actually send.',
    reflectionQuestions: ['What did the edit pass change?', 'Will you send it?'],
    hasWorkArea: true,
  },
  // ── Memory ────────────────────────────────────────────────────────────
  {
    id: 'me_retrieve_first',
    category: 'memory',
    difficulty: 2,
    durationMinutes: 10,
    title: 'Retrieve before you look up',
    instructions:
      'Pick three facts you would normally instantly search for (a phone number, a date, a name, a route). Spend a full minute trying to retrieve each from memory before checking.',
    successCondition: 'Three honest retrieval attempts of a minute each.',
    reflectionQuestions: [
      'How many surfaced without looking?',
      'What retrieval trick worked best?',
    ],
  },
  {
    id: 'me_reconstruct_yesterday',
    category: 'memory',
    difficulty: 3,
    durationMinutes: 15,
    title: 'Reconstruct yesterday',
    instructions:
      'Without any calendar, chat log, or AI: write a timeline of yesterday from waking to sleeping, as detailed as you can. Then check one source and see what you missed.',
    successCondition: 'A written timeline plus one comparison against a real source.',
    reflectionQuestions: [
      'What kind of events did your memory keep — and drop?',
      'Did anything you were sure about turn out wrong?',
    ],
    hasWorkArea: true,
  },
  {
    id: 'me_memory_palace',
    category: 'memory',
    difficulty: 4,
    durationMinutes: 20,
    title: 'A ten-item memory palace',
    instructions:
      'Write a list of ten items you need to remember (shopping, tasks). Place each item somewhere vivid along an imagined walk through your home. An hour later, walk the route mentally and recall the list.',
    successCondition: 'At least 8 of 10 recalled on the mental walk.',
    reflectionQuestions: [
      'Which images stuck best?',
      'Where else could you use this technique?',
    ],
  },
  // ── Decision Making ───────────────────────────────────────────────────
  {
    id: 'dm_abc_reasons',
    category: 'decision_making',
    difficulty: 2,
    durationMinutes: 10,
    title: 'Decide with written reasons',
    instructions:
      'Take a real choice you face with options A/B/C (or A/B). Without AI, write one sentence of reasoning per option, choose, and write down WHY in two sentences. The decision is yours alone.',
    successCondition: 'A made decision with your written reasons.',
    reflectionQuestions: ['How confident do you feel, 1-10?', 'What would change your mind?'],
    hasWorkArea: true,
  },
  {
    id: 'dm_values_rank',
    category: 'decision_making',
    difficulty: 3,
    durationMinutes: 15,
    title: 'Rank what actually matters',
    instructions:
      'For a pending decision, list the five things that matter (cost, time, growth, relationships...). Force-rank them 1-5 — no ties. Then re-examine your leading option against your own ranking.',
    successCondition: 'A forced ranking and a verdict on your leading option.',
    reflectionQuestions: [
      'Did your gut ranking match your stated priorities?',
      'What tie did you find hardest to break?',
    ],
    hasWorkArea: true,
  },
  {
    id: 'dm_premortem',
    category: 'decision_making',
    difficulty: 4,
    durationMinutes: 20,
    title: 'Run a premortem',
    instructions:
      'Take a decision you are leaning toward. Imagine it is one year later and it failed badly. Without AI, write the story of why it failed — then decide whether to proceed, adjust, or drop it.',
    successCondition: 'A failure story plus your updated decision.',
    reflectionQuestions: [
      'Which failure cause was easiest to ignore before this exercise?',
      'What safeguard will you add?',
    ],
    hasWorkArea: true,
  },
  // ── Problem Solving ───────────────────────────────────────────────────
  {
    id: 'ps_three_before_hint',
    category: 'problem_solving',
    difficulty: 2,
    durationMinutes: 15,
    title: 'Three solutions before any hint',
    instructions:
      'Take a problem you are stuck on. Write three genuinely different approaches yourself. Only after all three may you ask AI for a HINT (not a solution) — then keep solving yourself.',
    successCondition: 'Three written approaches before any outside help.',
    reflectionQuestions: [
      'Did the third approach differ most from your usual style?',
      'If you took the hint: did it match any of your three?',
    ],
    hasWorkArea: true,
  },
  {
    id: 'ps_smaller_problem',
    category: 'problem_solving',
    difficulty: 3,
    durationMinutes: 15,
    title: 'Shrink the problem',
    instructions:
      'Take something that feels too big. Without AI, split it until you find the smallest version you could finish today — then actually do that smallest piece.',
    successCondition: 'The smallest piece is done, not just planned.',
    reflectionQuestions: [
      'What made the big version feel impossible?',
      'What is the next smallest piece?',
    ],
  },
  {
    id: 'ps_constraints_flip',
    category: 'problem_solving',
    difficulty: 5,
    durationMinutes: 25,
    title: 'Solve it with the constraint flipped',
    instructions:
      'Take a current problem. Identify its tightest constraint (time, money, people, tools). Without AI, design one solution assuming the constraint is fixed forever, and one assuming it magically doubled. Compare what each design reveals.',
    successCondition: 'Two designs plus one insight from comparing them.',
    reflectionQuestions: [
      'Which design is closer to what you will actually do?',
      'Was the constraint as hard as you assumed?',
    ],
    hasWorkArea: true,
  },
  // ── Communication ─────────────────────────────────────────────────────
  {
    id: 'co_own_words_message',
    category: 'communication',
    difficulty: 1,
    durationMinutes: 10,
    title: 'One message, your words',
    instructions:
      'Write one message you would normally have AI draft (an email, a reply, a request) entirely in your own words. Read it aloud once before sending.',
    successCondition: 'A sent (or ready-to-send) message written by you alone.',
    reflectionQuestions: [
      'How does it differ from what AI would have written?',
      'Did reading aloud change anything?',
    ],
    hasWorkArea: true,
  },
  {
    id: 'co_listen_summary',
    category: 'communication',
    difficulty: 3,
    durationMinutes: 15,
    title: 'Prove you listened',
    instructions:
      'In your next real conversation, before giving your view, summarize the other person\u2019s point until they say "yes, that\u2019s it". Afterwards, note here what you got wrong on the first try.',
    successCondition: 'One confirmed summary in a real conversation.',
    reflectionQuestions: [
      'What did you miss on the first attempt?',
      'How did the confirmation change the conversation?',
    ],
  },
  {
    id: 'co_hard_thing_kindly',
    category: 'communication',
    difficulty: 4,
    durationMinutes: 20,
    title: 'Say the hard thing kindly',
    instructions:
      'Pick something true that you have been avoiding saying to someone. Without AI, draft it three ways: blunt, soft, and honest-but-kind. Choose one and decide when you will say it.',
    successCondition: 'Three drafts and a chosen moment.',
    reflectionQuestions: [
      'What were you protecting by staying silent?',
      'Which draft sounds most like you at your best?',
    ],
    hasWorkArea: true,
  },
  // ── Learning ──────────────────────────────────────────────────────────
  {
    id: 'le_recall_first',
    category: 'learning',
    difficulty: 2,
    durationMinutes: 10,
    title: 'Blank-page recall',
    instructions:
      'Take a topic you studied or read recently. On a blank page, without AI or notes, write everything you remember. Only then open your notes and mark the gaps.',
    successCondition: 'A recall page plus marked gaps.',
    reflectionQuestions: [
      'Was your recall more or less than expected?',
      'Which gap matters most to close?',
    ],
    hasWorkArea: true,
  },
  {
    id: 'le_teach_it',
    category: 'learning',
    difficulty: 3,
    durationMinutes: 20,
    title: 'Learn by teaching',
    instructions:
      'Take something you are currently learning. Without AI, prepare a two-minute explanation as if teaching a colleague, including one example you invented yourself. Deliver it to someone or record it.',
    successCondition: 'A delivered or recorded two-minute explanation with your own example.',
    reflectionQuestions: [
      'Where did your explanation wobble?',
      'What question would a student ask that you cannot yet answer?',
    ],
  },
  {
    id: 'le_source_dive',
    category: 'learning',
    difficulty: 5,
    durationMinutes: 30,
    title: 'Go to the source',
    instructions:
      'Pick a claim you recently accepted from an AI summary or social post. Find and read a primary source yourself (paper, documentation, original text). Write three sentences on what the summary flattened or missed.',
    successCondition: 'Primary source read; three sentences on the difference.',
    reflectionQuestions: [
      'Was the summary faithful?',
      'What did reading the source give you that the summary could not?',
    ],
    hasWorkArea: true,
  },
  // ── Focus ─────────────────────────────────────────────────────────────
  {
    id: 'fo_25_no_ai',
    category: 'focus',
    difficulty: 1,
    durationMinutes: 25,
    title: '25 minutes, one task, no AI',
    instructions:
      'Choose one task. Set a 25-minute block (the Detox timer works well). Work on only that task, without AI and without switching. If you get stuck, stay with the problem.',
    successCondition: '25 unbroken minutes on one task.',
    reflectionQuestions: [
      'When did the urge to switch or ask AI peak?',
      'What happened right after you stayed with it?',
    ],
  },
  {
    id: 'fo_single_thread_hour',
    category: 'focus',
    difficulty: 3,
    durationMinutes: 50,
    title: 'The single-thread hour',
    instructions:
      'Block 50 minutes for your most important task. Phone in another room, AI closed, notifications off. Before starting, write one sentence: what does "done" look like?',
    successCondition: 'The 50-minute block happened; your "done" sentence answered.',
    reflectionQuestions: [
      'How close did you get to your "done" sentence?',
      'What was the biggest internal interruption?',
    ],
  },
  {
    id: 'fo_boredom_walk',
    category: 'focus',
    difficulty: 2,
    durationMinutes: 20,
    title: 'A walk with nothing',
    instructions:
      'Take a 20-minute walk with no phone, no audio, no input. Let your mind wander. When you return, write down the three most interesting thoughts that appeared.',
    successCondition: 'The walk plus three captured thoughts.',
    reflectionQuestions: [
      'How long before your mind produced something interesting?',
      'What does this say about your default input level?',
    ],
    hasWorkArea: true,
  },
] as const;
