/**
 * Demo data for documentation screenshots.
 *
 * Four finished runs of The Adversary — enough observations that the record
 * screen has something to say rather than showing five "not enough yet" rows.
 * Never shipped in the app; this only ever runs in a browser dev session.
 *
 * The player it describes is the one this product exists for: they answer
 * alone and get it right more often than not, they rarely buy help they do not
 * need — and when the host argues badly, they move to the host's answer about
 * half the time. That last one is the finding you cannot self-report, because
 * someone who folds to fluent wrong reasoning does not know it at the time.
 *
 * `language` is a preference, not a locale: 'system' follows the device, which
 * is what a real first-run install has.
 */

const LIFELINES = ['fiftyFifty', 'friend', 'audience', 'host', 'swap'];

const counts = (over = {}) =>
  Object.fromEntries(LIFELINES.map((id) => [id, over[id] ?? 0]));

/**
 * One finished run. The shape is `RunRecord` in
 * `packages/core/src/adversary/quiz-types.ts`; anything omitted here is a zero.
 */
function run(over) {
  return {
    tier: 'normal',
    seed: 'demo',
    ending: 'finished',
    levelsCleared: 0,
    levelsAttempted: 0,
    bank: 0,
    livesLost: 0,
    nerve: { heldFirm: 0, missedUpdate: 0, updated: 0, taken: 0 },
    reliance: { soloRight: 0, soloWrong: 0, aidedUnneeded: 0, aidedNeeded: 0 },
    lifelineUse: counts(),
    firstReach: counts(),
    talkedOut: 0,
    soloLevels: 0,
    aidedLevels: 0,
    bluffsFaced: 0,
    soundArgumentsFaced: 0,
    skippedDomains: [],
    roundIds: [],
    ...over,
  };
}

export function buildDemoData(todayKey, language = 'system') {
  const day = (offset) =>
    new Date(Date.parse(todayKey) + offset * 86_400_000).toISOString().slice(0, 10);

  return {
    // Written at schema version 3 on purpose: every capture run then
    // exercises the 3 -> 4 migration rather than only ever testing a
    // freshly-written document. It is not theoretical — the 1 -> 2 migration
    // was caught discarding the stored language exactly this way, when the
    // zh-TW screenshots came out byte-identical to the English ones. The
    // tracker collections below are here so the run also exercises the
    // archive: after migration they are in `retired`, not on the document.
    schemaVersion: 3,
    events: [
      {
        id: 'demo_evt_1',
        timestamp: `${day(-9)}T09:20:00.000Z`,
        category: 'lookup',
        source: 'gate',
        attemptedFirst: true,
        usedAI: true,
        proceededImmediately: false,
      },
    ],
    gateSessions: [],
    detoxSessions: [],
    reflections: [],
    challengeHistory: [],
    scoringConfig: { version: 3 },
    adversaryRuns: [
      run({
        tier: 'normal',
        seed: `${day(-6)}#normal#0`,
        levelsCleared: 6,
        levelsAttempted: 8,
        bank: 880,
        livesLost: 2,
        // Two bluffs faced, one taken. Over four runs this is the finding that
        // fires, and it is the one no questionnaire could have found.
        nerve: { heldFirm: 1, missedUpdate: 0, updated: 1, taken: 1 },
        reliance: { soloRight: 4, soloWrong: 2, aidedUnneeded: 0, aidedNeeded: 2 },
        lifelineUse: counts({ fiftyFifty: 1, host: 2 }),
        firstReach: counts({ host: 2 }),
        soloLevels: 6,
        aidedLevels: 2,
        bluffsFaced: 2,
        soundArgumentsFaced: 1,
      }),
      run({
        tier: 'normal',
        seed: `${day(-4)}#normal#0`,
        ending: 'walkedAway',
        levelsCleared: 7,
        levelsAttempted: 8,
        bank: 1300,
        livesLost: 1,
        nerve: { heldFirm: 2, missedUpdate: 1, updated: 0, taken: 1 },
        reliance: { soloRight: 5, soloWrong: 1, aidedUnneeded: 1, aidedNeeded: 1 },
        lifelineUse: counts({ friend: 1, host: 2 }),
        firstReach: counts({ host: 1, friend: 1 }),
        soloLevels: 6,
        aidedLevels: 2,
        bluffsFaced: 2,
        soundArgumentsFaced: 2,
      }),
      run({
        tier: 'hard',
        seed: `${day(-2)}#hard#0`,
        levelsCleared: 5,
        levelsAttempted: 7,
        bank: 2500,
        livesLost: 2,
        nerve: { heldFirm: 1, missedUpdate: 0, updated: 1, taken: 1 },
        reliance: { soloRight: 3, soloWrong: 2, aidedUnneeded: 1, aidedNeeded: 1 },
        lifelineUse: counts({ fiftyFifty: 1, audience: 1, host: 2 }),
        firstReach: counts({ host: 2 }),
        soloLevels: 5,
        aidedLevels: 2,
        bluffsFaced: 2,
        soundArgumentsFaced: 1,
      }),
      run({
        tier: 'hard',
        seed: `${day(0)}#hard#0`,
        levelsCleared: 8,
        levelsAttempted: 9,
        bank: 8500,
        livesLost: 1,
        nerve: { heldFirm: 2, missedUpdate: 0, updated: 1, taken: 1 },
        reliance: { soloRight: 6, soloWrong: 1, aidedUnneeded: 1, aidedNeeded: 1 },
        lifelineUse: counts({ fiftyFifty: 1, audience: 1, host: 2 }),
        firstReach: counts({ host: 1, audience: 1 }),
        soloLevels: 7,
        aidedLevels: 2,
        bluffsFaced: 2,
        soundArgumentsFaced: 2,
      }),
    ],
    settings: { onboardingComplete: true, focusCategories: [], language },
  };
}
