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
  /**
   * What is left of the shared vocabulary.
   *
   * It used to hold a dozen labels for a dozen screens. Two survive, and
   * both are the platform's word rather than the product's: they label the
   * buttons in a confirm dialog.
   */
  common: {
    continue: 'Continue',
    cancel: 'Cancel',
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
    /** The school level each mode draws from. The claim the mode makes. */
    tierLevel: {
      easy: 'Primary school',
      normal: 'Secondary school',
      hard: 'High school',
      ultimate: 'University',
    },
    tierBlurb: {
      easy: 'Things a curious ten-year-old has met, and the wrong answers sit a long way from the right one.',
      normal: 'General knowledge and one step of arithmetic — and the host starts arguing badly.',
      hard: 'You paid attention in science or social studies. A real chain of reasoning, and the answers sit closer together.',
      ultimate: 'Domain knowledge, or a careful multi-step estimate. The answers are close and the host lies half the time.',
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
    /**
     * One line per rung on the tower. Short enough to sit in a row, and
     * taken from the ladder's own `gives` rather than invented here — the
     * ladder is the source and this is a caption of it.
     */
    rungGives: {
      1: 'The shape of the problem, and where to look',
      2: 'One question or observation that unblocks you',
      3: 'The concept you need, not applied to your case',
      4: 'The whole method, step by step — you do the doing',
      5: 'The complete thing, with no reluctance',
    },
    rungHere: 'you start here',
    /** The bottom rung is the show's safe point: it can always be reached. */
    rungAlwaysOpen: 'always open',
    rungTowerLabel: (rung: number, name: string): string =>
      `The hint ladder, five rungs. Conversations start at rung ${rung}, ${name}. ` +
      'Rung 5, the full answer, is always reachable.',
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

    backToGame: 'Back to the game',

    // ── Data ────────────────────────────────────────────────────
    // Export and erase outlived the settings tab they used to live in. They
    // are the two things a local-first product owes the person whose device
    // it is (ADR-0003), so they moved onto the record rather than going with
    // the screens that were deleted.
    dataTitle: 'Your data',
    dataNote: 'Everything lives on this device. No account, no cloud, no analytics.',
    exportData: 'Export my data',
    deleteAll: 'Delete all data',
    deleteTitle1: 'Delete all data?',
    deleteBody1: 'This erases everything on this device. There is no cloud copy.',
    deleteTitle2: 'Really delete everything?',
    deleteBody2: 'Every run, every kept bluff, every setting. This cannot be undone.',

    whatIsThis: 'Why the game and the skill are one thing',
    whatIsThisBody:
      'Nobody installs an instruction set that makes their AI less immediately helpful without evidence that they need it — and self-report cannot supply that evidence, because someone who folds to fluent wrong reasoning is not aware of it at the time. The game supplies it instead: it wrote the argument, so it knows the ground truth. Nothing here asks you what you think of yourself.',
  },
  root: {
    corruptData: 'Stored data could not be read. A backup was kept on this device.',
    schemaTooNew: 'Data was written by a newer app version. Update the app to use it.',
  },

};

/**
 * The shape every language must satisfy. Derived rather than hand-written so
 * a key added to English cannot be forgotten in a translation.
 */
export type AppStrings = typeof EN;
