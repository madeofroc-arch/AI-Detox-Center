/**
 * English screen copy. This object IS the contract: `AppStrings` is derived
 * from it, so every other language must supply every key or the build fails.
 *
 * That is deliberate. Domain strings in core fall back to English key by key,
 * because a half-translated challenge catalog is still usable. Screen copy
 * does not get that grace — a button reading "Continue" in the middle of a
 * Chinese flow is worse than a compile error.
 *
 * Interpolation is plain functions rather than a template syntax: no parser,
 * no runtime, and the compiler checks the arguments.
 *
 * Tone is binding here (docs/design/design-system.md, Voice & tone): calm,
 * warm, additive. Never "you failed", never "streak lost", never a number
 * presented as a verdict on the person.
 */
export const EN = {
  common: {
    done: 'Done',
    back: 'Back',
    next: 'Next',
    continue: 'Continue',
    begin: 'Begin',
    save: 'Save',
    skip: 'Skip',
    cancel: 'Cancel',
    addReflection: 'Add a reflection',
    minutesShort: (n: number): string => `${n} min`,
    // Screen-reader text for a running countdown. Deliberately coarse: the
    // accessibility spec says a timer announces at start, pause and end, not
    // every second, and a label that changes 1,500 times a session does the
    // opposite of informing anyone (#4).
    minutesLeft: (minutes: number): string =>
      `About ${minutes} ${minutes === 1 ? 'minute' : 'minutes'} left`,
    underAMinuteLeft: 'Less than a minute left',
  },

  game: {
    title: 'The Adversary',

    // ── Choosing a mode ────────────────────────────────────────────────────
    language: 'Language',
    languageSystem: 'System',
    chooseTier: 'Pick a mode',
    chooseTierHelp:
      'Every mode uses the same questions. What changes is how close together the four answers sit — and how often the host is lying to you.',
    tierName: {
      easy: 'Easy',
      normal: 'Normal',
      hard: 'Hard',
      ultimate: 'Ultimate',
    },
    tierBlurb: {
      easy: 'The wrong answers sit a long way from the right one, and the questions are the friendliest in the set.',
      normal: 'The same spacing over a wider spread of questions — and the host starts arguing badly.',
      hard: 'The gaps between the answers shrink to their square root. A rough idea stops being enough.',
      ultimate: 'The tightest boards in the game: often only two or three times between one answer and the next.',
    },
    /** Stated before the run, because a mode you cannot see the shape of is a trap. */
    tierSpec: (levels: number, lives: number, items: number): string =>
      `${levels} questions · ${lives === 1 ? '1 life' : `${lives} lives`} · ${items} lifelines to start`,
    hostHonesty: {
      easy: 'The host plays it straight in this mode.',
      normal: 'The host argues badly about a third of the time.',
      hard: 'The host argues badly about half the time.',
      ultimate: 'Half of what the host tells you is wrong, and it will sound just as good.',
    },
    ladderTitle: 'The ladder',
    /**
     * The list is joined here, not by the screen. How a list of numbers reads
     * is part of a translation: English wants "4, 8" and 繁體中文 wants
     * 「4、8」, and a component that joins them has quietly made that decision
     * for every language at once.
     */
    safePointAt: (levels: readonly number[]): string => `Locked in at ${levels.join(', ')}`,
    noSafePoint: 'Nothing is locked in. Get it wrong and the run ends at zero.',
    begin: 'Start',

    // ── A question ─────────────────────────────────────────────────────────
    levelOf: (n: number, total: number): string => `Question ${n} of ${total}`,
    worth: (points: string): string => `${points} on this one`,
    bank: (points: string): string => `${points} banked`,
    guaranteed: (points: string): string => `${points} locked in`,
    livesLeft: (n: number): string => (n === 1 ? '1 life left' : `${n} lives left`),
    optionLetter: (index: number): string => 'ABCD'[index] ?? '?',
    /** The instinct beat. Nothing unlocks until this happens. */
    pickFirst: 'Pick one. The lifelines open once you have.',
    finalAnswer: 'Is that your final answer?',
    lockAnswer: 'Final answer',
    struckOut: 'Struck out',
    reselect: 'That one is gone. Pick again.',

    lifelineName: {
      fiftyFifty: '50:50',
      friend: 'Phone a friend',
      audience: 'Ask the audience',
      host: 'Ask the host',
      swap: 'Swap the question',
    },
    lifelineHelp: {
      fiftyFifty: 'Two wrong answers go.',
      friend: 'One answer, and how sure they honestly are.',
      audience: 'What the room thinks.',
      host: 'Its reasoning, and the answer it would give.',
      swap: 'A different question, same rung. Before you commit.',
    },
    lifelineCost: (percent: number): string => `keeps ${percent}%`,
    lifelineFree: 'costs no points',
    lifelinesLabel: 'Lifelines',
    lifelinesGone: 'Nothing left to spend.',

    friendLead: 'Your friend',
    friendSays: (letter: string, percent: number): string =>
      `I'd say ${letter}. I'm about ${percent}% on that, honestly.`,
    audienceLead: 'The audience',
    hostLead: 'The host',
    /** The host still speaks at the reveal on a level where it was not bought. */
    hostLeadUnasked: 'The host, unasked',
    /**
     * The pick and the reasoning are joined here, not by the screen. Whether a
     * space belongs between a sentence ending in a fullwidth 。 and the English
     * that follows is a typographic decision, and a component that concatenates
     * them has made it for every language at once.
     */
    hostSays: (letter: string, argument: string): string => `I'd go with ${letter}. ${argument}`,
    swapConfirm: 'Swap this one out',

    walkAway: 'Take the money',
    walkAwayHelp: (points: string): string => `Stop here and keep ${points}.`,

    // ── The reveal ─────────────────────────────────────────────────────────
    gotIt: 'That is the one.',
    missedIt: 'Not that one.',
    theAnswer: 'The answer',
    scored: (points: string): string => `+${points}`,
    scoredNothing: 'Nothing this time.',
    lostALife: 'That costs a life.',
    /** Beat two, and the reason this product exists. */
    hostWasBluffing: 'The host was bluffing.',
    hostWasSound: 'The host was right.',
    andHeld: 'You kept your own answer.',
    andMoved: 'You went with it.',
    verdictLead: (was: string, did: string): string => `${was} ${did}`,
    nextLevel: 'Next question',
    seeRecord: 'See the record',

    // ── A lifeline granted ─────────────────────────────────────────────────
    grantTitle: 'Take one.',
    grantHelp: (level: number): string => `${level} questions in. Pick what you want in hand.`,
    grantFull: 'Full',

    // ── The record ─────────────────────────────────────────────────────────
    recordTitle: 'The record',
    endingCleared: 'You went the whole way.',
    endingOutOfLives: 'The run ended there.',
    endingWalkedAway: 'You stopped and kept it.',
    banked: (points: string): string => `${points}`,
    clearedOf: (cleared: number, attempted: number): string =>
      `${cleared} of ${attempted} right`,

    nerveTitle: 'When the host spoke',
    nerveCell: {
      heldFirm: 'It argued badly and you kept your answer',
      taken: 'It argued badly and you moved',
      updated: 'It argued well and you moved',
      missedUpdate: 'It argued well and you kept your answer',
    },
    nerveEmpty: 'The host was not asked this run.',

    relianceTitle: 'When you asked for help',
    relianceCell: {
      soloRight: 'Answered alone, and right',
      soloWrong: 'Answered alone, and wrong',
      aidedUnneeded: 'Bought help on one you already had',
      aidedNeeded: 'Bought help on one you did not',
    },

    gotYou: 'The ones that got through',
    gotYouEmpty: 'Nothing got through this time.',
    seed: (seed: string): string => `seed ${seed}`,
    seedNote: 'Same seed, same run. A bug report is a seed.',
    playAgain: 'Play again',
    seePrescription: 'What this says about your AI',
    englishOnly:
      'The questions are in English for now — the arguments need writing in each language rather than translating, so they are not ready in 繁體中文 yet.',

    // ── The prescription ───────────────────────────────────────────────────
    prescriptionTitle: 'Your settings',
    prescriptionIntro:
      'Human Mode is two things: this game, and a set of instructions for the AI you already use. The game is the diagnosis. What follows is the prescription — every line here was earned by something that happened in a run.',
    prescriptionRuns: (runs: number, levels: number): string =>
      `From ${runs === 1 ? '1 run' : `${runs} runs`}, ${levels} questions.`,

    pendingTitle: 'Not enough yet.',
    pendingBody:
      'These numbers only mean something with enough of them behind. A run hands out one or two host lifelines, so a single session cannot say much. Nothing is lost by not coming back.',
    pendingNeed: (label: string, needed: number): string => `${label} — ${needed} more to go`,
    /** Inside a card that already carries the label. */
    needMore: (needed: number): string => `${needed} more before this can be read`,

    cleanTitle: 'Nothing to change.',
    cleanBody:
      'Enough was measured to say something, and nothing crossed a line. That is a real result, not a placeholder.',

    rungTitle: 'Where a conversation starts',
    rungName: {
      1: 'Orient',
      2: 'Nudge',
      3: 'Hint',
      4: 'Approach',
      5: 'Full answer',
    },
    rungWhyLess:
      'Help was bought on questions that had already been answered, so the ladder starts lower — less unasked-for help by default. "Just give me the answer" still works instantly; that never locks.',
    rungWhyMore:
      'Questions were answered alone and missed with help still in hand, so the ladder starts higher — more offered up front.',
    rungWhyBoth:
      'Both patterns showed up and they pull opposite ways, so the ladder stays where it started.',
    rungDefault: 'The default. Nothing measured moved it.',

    instructionsTitle: 'Lines to add',
    instruction: {
      flag_uncertainty:
        'When you give me a number you derived, point at the step you are least sure of. Say when you are guessing, before the answer rather than after it.',
      hold_your_position:
        'When I push back on your reasoning and I am wrong, say so plainly and hold your position. Do not soften a correct answer because I disagreed with it.',
      ask_my_estimate_first:
        'Before you give me a figure, ask me what I think it is. Then tell me yours.',
      name_the_check:
        'When you give me a number, name the one check that would show it was wrong.',
    },
    evidence: {
      takes_the_bluff: (n: number, d: number): string =>
        `Of ${d} bad arguments from the host, ${n} got through.`,
      wont_update: (n: number, d: number): string =>
        `Of ${d} good arguments from the host, ${n} were not taken up.`,
      host_first: (n: number, d: number): string =>
        `The host was the first thing reached for on ${n} of ${d} times help was bought.`,
      unnecessary_reliance: (n: number, d: number): string =>
        `Of ${d} questions where help was bought, ${n} had already been answered correctly.`,
      unaided_misses: (n: number, d: number): string =>
        `Of ${d} questions answered with no help, ${n} were wrong.`,
    },
    findingLabel: {
      takes_the_bluff: 'Bad arguments getting through',
      wont_update: 'Good arguments not taken up',
      host_first: 'Reaching for the host first',
      unnecessary_reliance: 'Help bought before it was needed',
      unaided_misses: 'Answering alone and wrong',
    },

    copyBlock: 'Copy the block',
    copied: 'Copied.',
    copyHelp:
      'Paste it into your AI\'s custom instructions, or save it as skill/method/profile.yaml if you installed the skill from this repo.',
    blockHeader: 'Human Mode — my settings',
    blockFrom: (runs: number, levels: number): string =>
      `from ${runs === 1 ? '1 run' : `${runs} runs`} of The Adversary, ${levels} questions`,
    blockRung: 'where a conversation starts, on the 1-5 ladder',
    blockNothing: 'Nothing measured needs changing. The defaults are fine.',

    whatIsThis: 'Why the game and the skill are one thing',
    whatIsThisBody:
      'Nobody installs an instruction set that makes their AI less immediately helpful without evidence that they need it — and self-report cannot supply that evidence, because someone who folds to fluent wrong reasoning is not aware of it at the time. The game supplies it instead: it wrote the argument, so it knows the ground truth. Nothing here asks you what you think of yourself.',
  },
  tabs: {
    home: 'Home',
    progress: 'Progress',
    settings: 'Settings',
  },

  root: {
    corruptData: 'Stored data could not be read. A backup was kept on this device.',
    schemaTooNew: 'Data was written by a newer app version. Update the app to use it.',
  },

  onboarding: {
    panels: [
      {
        title: 'Not anti-AI',
        body: 'Human Mode is not anti-AI. It helps you use AI on purpose — as a tool that extends your thinking instead of replacing it.',
      },
      {
        title: 'Behavior, not screen time',
        body: 'Dependency is behavior, not screen time. We look at how you use AI — did you try first, who made the decision — never just how much.',
      },
      {
        title: 'Yours alone',
        body: 'Your thinking data stays on your device. No account. No cloud. You can export or erase everything at any time.',
      },
    ],
    step: (current: number, total: number): string => `${current} / ${total}`,
    focusTitle: 'Where do you want to grow?',
    focusSubtitle: 'Pick up to three capabilities to focus on. You can change this anytime.',
    skipForNow: 'Skip for now',
    languageTitle: 'Language',
    languageSubtitle: 'You can change this later in Settings.',
  },

  home: {
    title: 'Human Mode',
    subtitle: 'Your thinking, back in your hands.',
    saveError:
      'Saving to this device failed. Recent changes are held in memory — freeing up storage space usually resolves this.',
    brainScore: 'Brain Score',
    openReport: 'Open Brain Report',
    scoreEmpty: 'Your score appears after your first few gates and challenges.',
    reliance: (band: string): string => `AI reliance: ${band} — tap to see why`,
    tapToSee: 'Tap to see why',
    strengthIndependent: (percent: number): string =>
      `You handled ${percent}% of these moments without AI.`,
    strengthReflection: (percent: number): string =>
      `You paused to reflect on ${percent}% of your AI uses.`,
    strengthDeliberate: (percent: number): string =>
      `${percent}% of your AI use was deliberate, tool-like work.`,
    strengthPractice: (days: number): string => `You practised on ${days} of the last 7 days.`,
    strengthFallback: 'One gate where you try first will start moving this.',
    doneToday: 'Today’s practice is in the books. See you tomorrow.',
    openChallenge: 'Open today’s challenge',
    aiGate: 'AI Gate',
    aiGateA11y: 'Open AI Gate — pause before using AI',
    detox: 'Detox',
    detoxA11y: 'Start a detox focus session',
  },

  gate: {
    title: 'AI Gate',
    subtitle: 'A moment of intention before AI.',
    askWhat: 'What are you about to ask AI?',
    askPlaceholder: 'One line is enough. Stays on this device.',
    kindOfUse: 'What kind of use is it?',
    triedYet: 'Have you tried it yourself yet?',
    yesTried: 'Yes, I tried',
    notYet: 'Not yet',
    attemptBlurb: 'Three minutes with just your own head. Hints and AI will still be there after.',
    startAttempt: 'Start 3-minute attempt',
    doneAttempting: 'Done attempting',
    skipAndContinue: 'Skip and continue',
    howDidItGo: 'How did it go?',
    solvedMyself: 'Solved it myself',
    hintThenThinking: 'Got a hint, thinking more',
    proceedingToAI: 'Proceeding to AI',
    confirmSolved: 'That was all you. Noted.',
    confirmHint: 'A hint, then your own thinking. Noted.',
    confirmProceeded: 'Noted. Nice pause.',
  },

  detox: {
    title: 'Detox',
    subtitle: 'A block of time for just you and the work.',
    durationLabel: 'Session duration',
    intentionPlaceholder: 'What will you do with this time?',
    intentionA11y: 'Session intention',
    pause: 'Pause',
    resume: 'Resume',
    endSession: 'End session',
    completeSession: 'Complete session',
    endedTitle: 'Session ended',
    focusedMinutes: (minutes: number): string => `${minutes} focused minutes.`,
    minutesNoted: (minutes: number): string => `${minutes} minutes — noted.`,
    completedBody: 'A full block of your own thinking.',
    endedEarlyBody: 'Ending early is data, not defeat. Every minute counted.',
    statusRunning: 'Running',
    statusPaused: 'Paused',
    statusTimeUp: 'Time is up',
  },

  challenge: {
    title: 'Today’s challenge',
    difficulty: (level: number, max: number): string => `Difficulty ${level} of ${max}`,
    doneMeans: 'Done means',
    workPlaceholder: 'Work here if you like — this text stays on your device.',
    workA11y: 'Challenge work area',
    markOutcome: 'Mark outcome',
    honestyNote: 'Honesty beats streaks. All three are fine answers.',
    completed: 'Completed',
    attempted: 'Attempted',
    skipped: 'Skipped',
  },

  challengeResult: {
    completed: 'Good thinking. That was all you.',
    attempted: 'You showed up and tried. That counts.',
    skipped: 'Skipped today. Tomorrow brings a new one.',
    xpLine: (xp: number, category: string): string => `+${xp} XP · ${category}`,
    streakWithRun: (current: number, total: number): string =>
      `${current} days in a row · ${total} active days total`,
    streakTotalOnly: (total: number): string => `${total} active days total`,
  },

  reflection: {
    title: 'Reflection',
    placeholder: 'A line or two is plenty.',
    privacyNote: 'Reflections never leave your device.',
  },

  report: {
    title: 'Brain Report',
    subtitle: 'Why your score is what it is.',
    insufficientHeading: 'Not enough data yet',
    insufficientMessage: (minimum: number): string =>
      `The report unlocks after about ${minimum} recorded uses. Each AI Gate visit counts — including the ones you solve yourself.`,
    reliance: 'AI reliance',
    whatAdds: 'What adds to reliance',
    whatLowers: 'What lowers it',
    notCounted: 'Not counted, worth knowing',
    reflectedLine: (percent: number): string =>
      `You paused to reflect on ${percent}% of your AI uses.`,
    deliberateLine: (percent: number): string =>
      `${percent}% of your AI use was deliberate, tool-like work.`,
    notCountedNote:
      'Neither of these moves the number. Anything you could do inside this app to lower your own score would make the score worth less, so reflecting is reported and never rewarded.',
    howItWorks: (windowDays: number, moments: number, aiUses: number, discount: number): string =>
      `How this works: each factor above is measured from your last ${windowDays} days of recorded uses (${moments} moments, ${aiUses} of them with AI). The factors that add up form your reliance; moments you resolved without AI discount that reliance by up to ${discount}%, never erase it. The whole numbers are apportioned so that what adds minus what lowers is exactly the number on the dial — read them off and check.`,
    whatCounts: (windowDays: number): string =>
      `What counts is how much thinking you handed over, not how much you used AI. Heavy, deliberate use where you think first scores low by design, and handing over twice as many whole tasks counts as twice as much — until the scale runs out, above roughly two handed-over tasks a day, where the dial simply stays at 100. Early on the number reads low while the ${windowDays} days fill up. Computed entirely on this device.`,
    factorAdds: 'adds to',
    factorLowers: 'lowers',
    points: (points: number): string => `${points} pts`,
    factorA11y: (label: string, points: number, direction: string): string =>
      `${label}: ${points} ${points === 1 ? 'point' : 'points'}, ${direction} the score`,
  },

  progress: {
    title: 'Progress',
    subtitle: 'Everything here only ever adds up.',
    emptyHeading: 'Your record starts today',
    emptyMessage: 'Do a challenge or visit the AI Gate once, and this page begins to fill.',
    thisWeek: 'This week',
    weekSummary: (challenges: number, attempts: number): string =>
      `${challenges} ${challenges === 1 ? 'challenge' : 'challenges'} practiced · ${attempts} independent ${attempts === 1 ? 'attempt' : 'attempts'}`,
    practice: 'Practice',
    levelAndXp: (level: number, xp: number): string => `Level ${level} · ${xp} XP`,
    towardLevel: (level: number): string => `Toward level ${level}`,
    streakActive: (days: number): string =>
      `Active streak: ${days} ${days === 1 ? 'day' : 'days'}`,
    streakPaused: 'Streak paused — it picks back up whenever you do.',
    streakNone: 'Your first active day starts the record.',
    activeDaysTotal: (days: number): string => ` · ${days} active days total`,
    capabilitySpread: 'Capability spread',
    history: 'History',
    historyEmpty: 'Moments you record — challenges, gates, detox sessions — collect here.',
  },

  settings: {
    title: 'Settings',
    focus: 'Focus',
    focusNote: 'Up to three capabilities your daily challenge leans toward.',
    language: 'Language',
    languageNote: 'Challenges, prompts and every screen. Nothing is sent anywhere to translate it.',
    languageSystem: 'Follow device',
    about: 'About',
    aboutBody:
      'Human Mode trains independent thinking. The goal is not to eliminate AI — it is to eliminate unconscious dependence on it. The best outcome is that you eventually need this app less.',
    version: 'AI Detox Center v0.1.0 · MIT licensed open source',
    dataPrivacy: 'Data & privacy',
    dataNote: 'Everything lives on this device. No account, no cloud, no analytics.',
    exportData: 'Export my data',
    resetScoring: 'Reset scoring settings',
    deleteAll: 'Delete all data',
    deleteTitle1: 'Delete all data?',
    deleteBody1: 'This erases everything on this device. There is no cloud copy.',
    deleteTitle2: 'Really delete everything?',
    deleteBody2: 'Scores, challenges, reflections — all of it. This cannot be undone.',
  },

  timeline: {
    challenge: 'Challenge',
    aiGate: 'AI Gate',
    detox: 'Detox',
    statusCompleted: 'Completed',
    statusAttempted: 'Attempted',
    statusSkipped: 'Skipped',
    gateSolved: 'Solved it yourself',
    gateHint: 'Took a hint, kept thinking',
    gateProceeded: 'Went to AI',
    gateRecorded: 'Recorded',
    aiUse: 'AI use',
    focusedMinutes: (minutes: number): string => `${minutes} focused minutes`,
    focusedMinutesEarly: (minutes: number): string => `${minutes} focused minutes · ended early`,
    today: 'Today',
    yesterday: 'Yesterday',
  },
};

/**
 * The shape every language must satisfy. Derived rather than hand-written so
 * a key added to English cannot be forgotten in a translation.
 */
export type AppStrings = typeof EN;
