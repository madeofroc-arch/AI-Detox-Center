/**
 * The challenge catalog: 55 challenges, at least 6 per capability across the 9
 * categories, and every category covers the full difficulty range 1-5. That
 * last property is asserted in the tests, not just intended — a category
 * missing its easy end sends a beginner steered toward it straight to a
 * difficulty the adaptive selector has to compromise on (#1).
 *
 * Static data by design: no runtime AI generation in core (ADR-0004). Every
 * entry needs a matching translation in every language pack, and the i18n
 * tests fail on a gap, so adding one here is adding one everywhere.
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
  {
    id: 'th_three_questions',
    category: 'thinking',
    difficulty: 1,
    durationMinutes: 10,
    title: 'Three questions, no answers',
    instructions:
      'Pick something you read or heard today and, without AI, write three questions about it you cannot answer yet. Not rhetorical ones — questions you would actually want answered. Then leave them unanswered: looking anything up is not part of this one.',
    successCondition: 'Three written questions you genuinely cannot answer yet, left open.',
    reflectionQuestions: [
      'Which one would change the most if you found the answer?',
      'How often do you finish reading something without asking anything of it?',
    ],
    hasWorkArea: true,
  },
  {
    id: 'th_five_whys',
    category: 'thinking',
    difficulty: 2,
    durationMinutes: 10,
    title: 'Ask why five times',
    instructions:
      'Pick one small thing from today that did not go the way you wanted. Without AI, write your answer to "why did that happen?" — then ask why of your own answer, and keep going until you have five answers in a chain. Stay inside your own life; you are not solving the world here.',
    successCondition: 'Five whys written down, each one answering the line above it.',
    reflectionQuestions: [
      'Which link in the chain was hardest to answer honestly?',
      'Where did the chain start to feel like guessing rather than remembering?',
    ],
    hasWorkArea: true,
  },
  {
    id: 'th_define_and_break',
    category: 'thinking',
    difficulty: 3,
    durationMinutes: 15,
    title: 'Define it, then break it',
    instructions:
      'Choose an everyday word with fuzzy edges — friend, furniture, game, a meal. Without AI, write your own one-sentence definition. Then find three real cases that break it: things that fit your definition but should not count, or do not fit but clearly should. Rewrite the definition once so it survives all three.',
    successCondition: 'One rewritten definition plus the three edge cases that forced the rewrite.',
    reflectionQuestions: [
      'Which edge case was hardest to argue with?',
      'What other words do you use daily whose edges you have never checked?',
    ],
    hasWorkArea: true,
  },
  {
    id: 'th_fermi_estimate',
    category: 'thinking',
    difficulty: 4,
    durationMinutes: 20,
    title: 'Put a number on it',
    instructions:
      'Pick a question that has a real number but no easy answer — how many people in your city get a haircut in one day, how many keys are being pressed in the building you are sitting in right now. Without AI and without searching, break it into factors you can estimate one by one, multiply them out, and commit to a single number plus a range you believe it falls inside.',
    successCondition: 'A written chain of estimates ending in one number and a range, with nothing looked up.',
    reflectionQuestions: [
      'Which factor in your chain are you least sure about?',
      'How did it feel to commit to a number you could not check?',
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
  {
    id: 'cr_forced_combination',
    category: 'creativity',
    difficulty: 2,
    durationMinutes: 10,
    title: 'Two things that do not belong',
    instructions:
      'Look around you and pick two objects that have nothing to do with each other. Without AI, invent three things that could only exist if those two were combined. Give each invention a name and one sentence saying what it does.',
    successCondition: 'Three named inventions, each with one sentence on what it does.',
    reflectionQuestions: [
      'Which came first for you — the name or the idea?',
      'Were the second and third easier or harder than the first?',
    ],
    hasWorkArea: true,
  },
  {
    id: 'cr_one_rule_changed',
    category: 'creativity',
    difficulty: 3,
    durationMinutes: 15,
    title: 'Change one rule of the world',
    instructions:
      'Pick one rule that quietly holds your daily life together — people sleep at night, objects stay where you put them, money can be saved, strangers keep their distance. Without AI, change that one rule and leave everything else alone. Then write six consequences that follow, in order: three that are obvious, then three more that only appear once you have thought past the obvious ones. Finish with the one thing that would surprisingly stay exactly as it is.',
    successCondition: 'One changed rule, six consequences in order, and one thing that stays exactly as it is.',
    reflectionQuestions: [
      'At which consequence did you have to stop and actually work it out?',
      'What was it like holding the whole world steady while one thing moved?',
    ],
    hasWorkArea: true,
  },
  {
    id: 'cr_invent_a_game',
    category: 'creativity',
    difficulty: 5,
    durationMinutes: 30,
    title: 'Invent a game and play it',
    instructions:
      'Without AI, invent a small game one person can play using only what is already within reach — paper, a pen, your hands, the room around you. Write the rules clearly enough that a stranger could follow them, play one full round yourself, then change exactly one rule and play a second round.',
    successCondition: 'Written rules, two rounds actually played, and the one rule you changed between them.',
    reflectionQuestions: [
      'What did playing show you that writing the rules did not?',
      'Which was harder: inventing the rules or holding yourself to them?',
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
  {
    id: 'wr_one_sentence',
    category: 'writing',
    difficulty: 2,
    durationMinutes: 10,
    title: 'Down to one sentence',
    instructions:
      'Find something you wrote recently that runs at least 150 words — a note, a message you sent, a paragraph of a document. Without AI, cut it down to a single sentence: the one a reader who saw nothing else would still act on correctly. Not a summary of the topic — the sentence that does the work. Then write underneath it the one thing that sentence loses, and decide whether losing it is acceptable.',
    successCondition: 'One sentence standing in for the whole piece, plus the thing it loses and your call on whether that is acceptable.',
    reflectionQuestions: [
      'How many versions did the sentence go through before one held?',
      'What was it like having to decide what the piece was actually for?',
    ],
    hasWorkArea: true,
  },
  {
    id: 'wr_no_delete_draft',
    category: 'writing',
    difficulty: 3,
    durationMinutes: 20,
    title: 'Draft with no delete key',
    instructions:
      'Pick a question you have been going back and forth on — something still unsettled, not a fact you could look up. Without AI, write toward an answer for a full 15 minutes and delete nothing: pen on paper, or typing with your hands off the backspace key. Repetition, dead ends and sentences that go nowhere all stay standing. At the end, choose the one sentence closest to what you actually think and copy it out on its own at the bottom.',
    successCondition: 'Fifteen minutes of writing with nothing deleted, plus the one chosen sentence written out on its own.',
    reflectionQuestions: [
      'When was the urge to go back and fix something strongest?',
      'What was it like leaving the messy parts standing?',
    ],
    hasWorkArea: true,
  },
  {
    id: 'wr_no_vague_words',
    category: 'writing',
    difficulty: 4,
    durationMinutes: 20,
    title: 'Write it without the vague words',
    instructions:
      'Pick an opinion you actually hold and write about 200 words defending it. One rule: no vague filler — interesting, important, very, really, things, a lot, somehow. Those seven, and only those — every other word stays legal. Wherever one of them would have gone, put a specific noun, a number, or an example instead. When you finish, read it back, mark any of the seven that slipped through, and replace them.',
    successCondition: 'About 200 words defending your view, with none of the seven words in it, and a specific noun, number, or example wherever one would have gone.',
    reflectionQuestions: [
      'Which word did you keep reaching for without noticing?',
      'Where did having to be specific make you work something out?',
    ],
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
  {
    id: 'me_everyday_detail',
    category: 'memory',
    difficulty: 1,
    durationMinutes: 10,
    title: 'Describe it before you look',
    instructions:
      'Pick something you see every day and never really look at: your front door, the coins in your pocket, the face of your watch, the shelf you walk past each morning. Without looking at it, write down ten specific details from memory — shapes, positions, wear, colour, what is next to what. Only then go and look. Mark which details were really there, and write one line about the detail you had been most certain of — whether or not it survived the look.',
    successCondition: 'Ten details written from memory, checked against the real thing, plus one line on the detail you were most certain of.',
    reflectionQuestions: [
      'How did it feel to reach for something you have seen a thousand times?',
      'Did your memory fill anything in that turned out not to be there?',
    ],
    hasWorkArea: true,
  },
  {
    id: 'me_no_reminder_day',
    category: 'memory',
    difficulty: 3,
    durationMinutes: 15,
    title: 'Three things, no reminders',
    instructions:
      'Choose three small things you want to do in the next few hours — send a message, bring something with you when you go out, ask someone a question. Pick three where forgetting costs nothing: nothing with a deadline, nothing another person is waiting on. Set no alarm, no reminder, no list. Instead tie each one in your head to a moment you are certain to meet: closing your laptop, putting on your shoes, the first sip of your next drink. Setting the three takes a few minutes now and carrying them costs nothing while the hours pass; look back once at the end of the stretch to see which ones surfaced.',
    successCondition: 'Three cues set and carried with no external reminder, plus one look back at which ones surfaced — however many that is.',
    reflectionQuestions: [
      'Did carrying them take up background attention, or did they stay quiet until the cue?',
      'Which of the three cues did your mind actually hook onto?',
    ],
  },
  {
    id: 'me_by_heart',
    category: 'memory',
    difficulty: 5,
    durationMinutes: 35,
    title: 'Learn something by heart',
    instructions:
      'Choose a poem or a passage you already like, roughly 100 to 150 words — anything already within reach counts: a book on your shelf, something saved on your phone, a text you have kept. Loving it helps, but liking it is enough. Without AI and without a recording, learn it by heart: read it through once, then work line by line, covering everything you have already learned and rebuilding it from the very start each time you add a line. Finish by saying the whole piece out loud with the text covered.',
    successCondition: 'You can say the whole piece through from memory without looking — stumbles allowed.',
    reflectionQuestions: [
      'Which line refused to stay, and what finally made it stick?',
      'Which line do you now hear differently from the first time you read it?',
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
  {
    id: 'dm_settle_five',
    category: 'decision_making',
    difficulty: 1,
    durationMinutes: 15,
    title: 'Settle five small things',
    instructions:
      'Write down five small things sitting undecided — a reply you have not sent, what to eat, which task goes first, something you keep going back to look at again. Only things where being wrong costs nothing: if deciding it in a minute would be reckless, it does not belong on this list. Without AI, give each one a minute at most: decide, then immediately take the smallest first step that closes it — send it (only the kind of message you would normally send without a second read), put it in your calendar, move it out of your way. Once a thing is settled, do not go back and check it again.',
    successCondition: 'Five things settled, each with a first step already taken.',
    reflectionQuestions: [
      'Which one turned out to be already decided, once you actually looked at it?',
      'What felt different about deciding with a one-minute limit?',
    ],
    hasWorkArea: true,
  },
  {
    id: 'dm_process_vs_outcome',
    category: 'decision_making',
    difficulty: 3,
    durationMinutes: 20,
    title: 'Grade the thinking, not the result',
    instructions:
      'Pick three decisions you made in the past year whose results you already know. Without AI, judge each one twice, separately: with only what you knew at the time, was the thinking sound? And did it turn out well? These are two different questions — luck counts as luck, on both sides. When all three are done, name one pattern that shows up across them.',
    successCondition: 'Three decisions, each judged twice — thinking and outcome — plus one pattern you named.',
    reflectionQuestions: [
      'For which one was it hardest to keep the known result out of your judgement?',
      'How did it feel to call a good outcome lucky, or a bad outcome a fair call?',
    ],
    hasWorkArea: true,
  },
  {
    id: 'dm_standing_rule',
    category: 'decision_making',
    difficulty: 5,
    durationMinutes: 30,
    title: 'Write your own decision rule',
    instructions:
      'Pick a decision you face over and over — taking on extra work, saying yes to invitations, when to stop researching something. Without AI, write it as one standing rule containing something countable: a limit, a count, a length of time. Then write one exception to it, also in words. Now test the rule against three real times this came up: does it give the answer you would stand behind? Revise the rule once, then keep it.',
    successCondition: 'A written rule with a number in it, tested against three real past cases and revised once.',
    reflectionQuestions: [
      'What made it hard to put an actual number on it?',
      'How does it feel to have decided this before it happens?',
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
  {
    id: 'ps_ten_minute_fix',
    category: 'problem_solving',
    difficulty: 1,
    durationMinutes: 10,
    title: 'Fix a friction you stopped noticing',
    instructions:
      'Find one small friction you have stopped noticing: a move you redo every day, an item you always have to hunt for, a step that keeps going slightly wrong. Without AI, work out for yourself what actually causes it, then remove that cause in ten minutes using only what you already have around you. A workaround does not count — the cause has to go.',
    successCondition: 'The friction is gone at its cause, not worked around.',
    reflectionQuestions: [
      'What made it easy to walk past?',
      'Where else are you running the workaround instead of the fix?',
    ],
  },
  {
    id: 'ps_draw_the_problem',
    category: 'problem_solving',
    difficulty: 3,
    durationMinutes: 15,
    title: 'Draw the problem, no sentences',
    instructions:
      'Pick a problem you have only ever thought about in sentences. Take paper and, without AI, draw it instead: a box for every person or moving part, an arrow for every thing that affects another thing. Labels of two or three words at most — no sentence anywhere on the page. When the picture is finished, find the arrow that causes the most trouble and circle it.',
    successCondition: 'A page with no sentences on it, and one arrow circled.',
    reflectionQuestions: [
      'What showed up on the page that never showed up while you were thinking?',
      'When were you most tempted to fall back into sentences?',
    ],
  },
  {
    id: 'ps_borrowed_solution',
    category: 'problem_solving',
    difficulty: 4,
    durationMinutes: 20,
    title: 'Borrow a solution from another field',
    instructions:
      'Take a problem you are working on and say its shape in one sentence, deliberately avoiding its own vocabulary — no names, no professional terms (for example: "too much arrives at once and only one thing can be handled at a time"). Without AI, find three completely different fields that already deal with that same shape — nature, kitchens, traffic, hospitals, games all count. Write down how each one handles it, then take one of those mechanisms and adapt it into a step you could actually try this week.',
    successCondition: 'An abstract one-sentence shape, three borrowed mechanisms, and one adapted step.',
    reflectionQuestions: [
      'Which of the three fields took longest to arrive?',
      'Did stripping out the vocabulary change how the problem felt?',
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
  {
    id: 'co_no_followup',
    category: 'communication',
    difficulty: 2,
    durationMinutes: 10,
    title: 'The message that needs no reply-back',
    instructions:
      'Take a request you actually need to send. Without AI, write it the way you normally would. Then write the three questions the reader could reasonably send back — what by when, what if I can\'t, what exactly do you want from me — and rewrite the message until each one is already answered inside it. Send that version.',
    successCondition: 'A sent message plus the three reply-back questions it already answers.',
    reflectionQuestions: [
      'Which of the three did you assume they already knew?',
      'What did answering them in advance cost you in length?',
    ],
    hasWorkArea: true,
  },
  {
    id: 'co_three_second_pause',
    category: 'communication',
    difficulty: 3,
    durationMinutes: 15,
    title: 'Three seconds before you answer',
    instructions:
      'Three times today — or however many the day offers; the rest carry to tomorrow — when someone is speaking to you, do not answer the moment there is room. Let them reach the end of their whole thought — no finishing their sentence for them — then count three slow seconds in your head, then reply. If they start speaking again inside those three seconds, let them: the gap belongs to them too. A phone call counts, and so does the pause before you answer a voice message. This one runs in the background of your day rather than in one block.',
    successCondition: 'Pauses you held instead of filled — three if the day gave you three, and the rest carried forward.',
    reflectionQuestions: [
      'What did you most want to do with that silence?',
      'Did anyone put something into the gap that would not have been said otherwise?',
    ],
  },
  {
    id: 'co_predict_conversation',
    category: 'communication',
    difficulty: 5,
    durationMinutes: 25,
    title: 'Predict the conversation',
    instructions:
      'Pick a conversation you expect to have — today, or in the next few days: a call, a meeting, something waiting to be said at home. Now, without AI, write four predictions: what the other person most wants out of it, what they are quietly worried about, the first objection they will raise, and one sentence you think they will say almost word for word. The four predictions are the work, and the time here is the writing, not the conversation. When it happens, hold the conversation without steering it to make yourself right; afterwards come back, mark each prediction hit, missed, or half, and write down what you had wrong about them.',
    successCondition: 'Four predictions written down in advance, ready to mark honestly when the conversation happens.',
    reflectionQuestions: [
      'Which prediction were you most confident about, and how did it feel to check it?',
      'What was harder: predicting them, or resisting the pull to steer the conversation?',
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
  {
    id: 'le_guess_first',
    category: 'learning',
    difficulty: 1,
    durationMinutes: 10,
    title: 'Guess before you open it',
    instructions:
      'Pick something short you are about to read, watch, or study in the next hour — an article, a chapter, a tutorial. Before you open it, and without AI, write down three things you expect it to say, plus one question you hope it answers. Writing the guesses is the exercise; then go and read it, and come back to mark each guess: right, wrong, or never mentioned.',
    successCondition: 'Three guesses and one question written down before you opened it.',
    reflectionQuestions: [
      'How did it feel to commit to a guess before you knew?',
      'Did reading feel different once you had something at stake?',
    ],
    hasWorkArea: true,
  },
  {
    id: 'le_take_it_apart',
    category: 'learning',
    difficulty: 3,
    durationMinutes: 20,
    title: 'Work out how it works',
    instructions:
      'Pick something ordinary you use without thinking — a zip, a door lock, a bicycle brake, an app\'s settings screen. Without searching and without AI, spend fifteen minutes working out how it actually works: look closely, use it in ways you normally would not, make a guess and test it. Then write your explanation, plus the one question looking could not answer.',
    successCondition: 'An explanation built only from your own observation, plus one open question.',
    reflectionQuestions: [
      'When did you first want to look it up, and what did you do instead?',
      'After fifteen minutes of attention, did the thing look different to you?',
    ],
    hasWorkArea: true,
  },
  {
    id: 'le_own_test',
    category: 'learning',
    difficulty: 4,
    durationMinutes: 20,
    title: 'Write the questions that find the edges',
    instructions:
      'Take a topic you have been learning. Without AI and without notes, write five questions only someone past the surface could answer — application and judgement, not definitions. Under each one, write the plausible-but-wrong answer a surface understanding would produce: the answer that question is built to expose. Then answer the two you find hardest yourself.',
    successCondition: 'Five questions of your own, each with the plausible wrong answer it is built to expose, plus your own answer to the two hardest.',
    reflectionQuestions: [
      'Which was harder to produce — the questions or the wrong answers?',
      'How did it feel to go looking for the places your own understanding is not yet solid?',
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
  {
    id: 'fo_single_touch',
    category: 'focus',
    difficulty: 3,
    durationMinutes: 20,
    title: 'Three things, one touch each',
    instructions:
      'Pick three small things you actually need to do today — three you could each finish in about five minutes. The point is the handoff, not the task: before you move to the next one, write a single line saying what state you left it in and what the next step is. Do them one at a time, in order, touching each one only once; nothing gets reopened until all three have their line.',
    successCondition: 'Three things handled in order, each touched once, with three closing lines written.',
    reflectionQuestions: [
      'Which one kept pulling you back while you were on the next?',
      'What did writing the closing line change about the switch?',
    ],
    hasWorkArea: true,
  },
  {
    id: 'fo_unskimmed_read',
    category: 'focus',
    difficulty: 4,
    durationMinutes: 35,
    title: 'Read it without skipping',
    instructions:
      'Take something long you have been meaning to read properly — an article, a chapter, a report. Read it for 30 minutes with no AI, no summary, no search, and no skipping ahead. Every time you notice your attention has left the page, put a small tick in the margin as a bookmark and go back to the last line you actually took in. However many ticks the page collects, they only mark where you resumed — the 30 minutes count either way. When the 30 minutes are up, close the text and write the spine of what you read in five lines from memory, plus the one sentence you would argue with.',
    successCondition: 'Thirty minutes with one text, nothing skipped, plus five lines of the spine written from memory and the one sentence you would argue with.',
    reflectionQuestions: [
      'Which five lines survived into the spine, and what did you leave out?',
      'How did the last ten minutes compare with the first ten?',
    ],
    hasWorkArea: true,
  },
  {
    id: 'fo_stuck_sit',
    category: 'focus',
    difficulty: 5,
    durationMinutes: 40,
    title: 'Forty minutes with the stuck part',
    instructions:
      'Pick the task you have been putting off because you do not know how to start it. Work on it for 40 minutes with no AI, no search, no new tabs. Each time you hit something you do not know, write down the question you would have typed into AI — then write your own best answer underneath it and carry on. Stop when the 40 minutes are up, finished or not.',
    successCondition: '40 minutes on the avoided task, with every question you would have outsourced written down and answered in your own words.',
    reflectionQuestions: [
      'How long did the not-knowing stay uncomfortable?',
      'Which question did you most want to hand over?',
    ],
    hasWorkArea: true,
  },
] as const;
