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
    introTitle: 'Five rounds.',
    introBody:
      'You state a range you are 90% sure about. Something argues back — sometimes soundly, sometimes not. You win by knowing which.',
    introLength: (rounds: number): string => `${rounds} rounds, about three minutes. It ends there.`,
    begin: 'Begin',
    roundOf: (n: number, total: number): string => `Round ${n} of ${total}`,
    claim: 'You are 90% sure it is in here',
    rangeFactor: (factor: string): string => `a ${factor} range`,
    ifRight: (points: number): string => `+${points} if you are right`,
    sliderA11y: 'Your range. Drag either end.',
    wider: 'Wider',
    narrower: 'Narrower',
    lockIn: 'Lock it in',
    opponent: 'The opponent',
    hold: 'Hold',
    move: 'Move',
    holdMoveHelp: 'Hold if the argument is bad, or true but beside the point.',
    reset: 'Set your range again',
    lockAgain: 'Lock in the new range',
    answer: 'The answer',
    inside: 'Inside your range.',
    outsideLow: (factor: string): string => `Outside. You were ${factor} high.`,
    outsideHigh: (factor: string): string => `Outside. You were ${factor} low.`,
    wasBluff: 'That was a bluff.',
    wasHonest: 'That argument was sound.',
    andHeld: 'You held.',
    andMoved: 'You moved.',
    verdictLead: (was: string, did: string): string => `${was} ${did}`,
    scored: (points: number): string => (points >= 0 ? `+${points}` : `${points}`),
    next: 'Next round',
    finish: 'See the record',
    recordTitle: 'The record',
    calibration: 'Calibration',
    calibrationLine: (hits: number, bands: number, percent: number): string =>
      `You said 90% sure. ${hits} of ${bands} ranges held it — ${percent}%.`,
    calibrationEmpty: 'Play a round and this fills in.',
    nerve: 'Nerve',
    nerveHeldFirm: 'Held against a bluff',
    nerveTaken: 'Moved on a bluff',
    nerveUpdated: 'Moved on a sound argument',
    nerveMissedUpdate: 'Held against a sound argument',
    gotYou: 'The ones that got you',
    gotYouEmpty: 'Nothing got you this time.',
    totalPoints: (points: number): string =>
      `${points} ${points === 1 || points === -1 ? 'point' : 'points'}`,
    playAgain: 'Play again',
    seed: (seed: string): string => `seed ${seed}`,
    seedNote: 'Every round in this session comes from that seed. Same seed, same session.',
    englishOnly:
      'The rounds are in English for now — the arguments need writing in each language rather than translating, so they are not ready in 繁體中文 yet.',
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
