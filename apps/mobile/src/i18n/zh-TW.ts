/**
 * 繁體中文（台灣）screen copy.
 *
 * Typed as `AppStrings`, so a key added to English breaks this file at compile
 * time rather than silently rendering English inside a Chinese flow.
 *
 * Tone rules, same as English but with the traps that are specific to Chinese:
 * - 用「你」，不用「您」。這是陪伴，不是客服。
 * - 不責備。沒有「你又…了」「你失敗了」「連續紀錄中斷」這類說法。
 * - 「AI」保持原文，這是台灣的實際寫法。
 * - 數字後面接單位時留半形空格（「25 分鐘」），中英文之間也留。
 */
import type { AppStrings } from './en';

export const ZH_TW: AppStrings = {
  common: {
    done: '完成',
    back: '上一步',
    next: '下一步',
    continue: '繼續',
    begin: '開始',
    save: '儲存',
    skip: '略過',
    cancel: '取消',
    addReflection: '寫一則回顧',
    minutesShort: (n) => `${n} 分鐘`,
    minutesLeft: (minutes) => `大約還有 ${minutes} 分鐘`,
    underAMinuteLeft: '剩下不到一分鐘',
  },

  game: {
    title: '對手',

    // ── 選模式 ──────────────────────────────────────────────────────────────
    language: '語言',
    languageSystem: '跟隨系統',
    chooseTier: '選一個模式',
    chooseTierHelp:
      '每個模式用的是同一批題目。差別在四個答案彼此靠多近——以及主持人多常在唬你。',
    tierName: {
      easy: '簡單',
      normal: '普通',
      hard: '困難',
      ultimate: '終極',
    },
    tierLevel: {
      easy: '小學',
      normal: '中學',
      hard: '高中',
      ultimate: '大學',
    },
    tierBlurb: {
      easy: '十歲小孩碰過的東西，而且錯的答案離正解很遠。',
      normal: '一般常識加一步計算——而且主持人開始會講錯。',
      hard: '自然或社會有在聽的程度。要一整串推理，答案也靠得比較近。',
      ultimate: '需要領域知識，或一次小心的多步估算。答案很近，而主持人有一半在唬你。',
    },
    /** 開始前就講清楚。看不出形狀的模式是陷阱。 */
    tierSpec: (levels: number, lives: number, items: number): string =>
      `${levels} 題 · ${lives} 條命 · 開場 ${items} 個道具`,
    hostHonesty: {
      easy: '這個模式裡，主持人不會騙你。',
      normal: '主持人大約每三次有一次講得不對。',
      hard: '主持人大約有一半的時間講得不對。',
      ultimate: '主持人講的有一半是錯的，而且聽起來一樣有道理。',
    },
    ladderTitle: '獎金階梯',
    safePointAt: (levels: readonly number[]): string => `第 ${levels.join('、')} 關保底`,
    noSafePoint: '沒有保底。答錯就是歸零收場。',
    begin: '開始',

    // ── 一題 ────────────────────────────────────────────────────────────────
    levelOf: (n: number, total: number): string => `第 ${n} 題，共 ${total} 題`,
    worth: (points: string): string => `這題值 ${points}`,
    bank: (points: string): string => `已累積 ${points}`,
    guaranteed: (points: string): string => `保底 ${points}`,
    livesLeft: (n: number): string => `剩 ${n} 條命`,
    optionLetter: (index: number): string => 'ABCD'[index] ?? '?',
    /** 直覺那一拍。沒有這一下，道具不會開。 */
    pickFirst: '先選一個。選了道具才會開。',
    finalAnswer: '這是你最後的答案嗎？',
    lockAnswer: '就這個',
    struckOut: '已刪去',
    reselect: '那個被刪掉了。重選一個。',

    lifelineName: {
      fiftyFifty: '刪去法',
      friend: '打給親友',
      audience: '問現場觀眾',
      host: '問主持人',
      swap: '換題目',
    },
    lifelineHelp: {
      fiftyFifty: '刪掉兩個錯的。',
      friend: '一個答案，加上他們真實的把握程度。',
      audience: '現場的人怎麼想。',
      host: '它的推理，還有它會給的答案。',
      swap: '換一題同一關的。作答前才能用。',
    },
    lifelineCost: (percent: number): string => `保留 ${percent}%`,
    lifelineFree: '不扣分',
    lifelinesLabel: '道具',
    lifelinesGone: '沒有道具可以用了。',

    friendLead: '你的朋友',
    friendSays: (letter: string, percent: number): string =>
      `我會選 ${letter}。老實說，我大概 ${percent}% 的把握。`,
    audienceLead: '現場觀眾',
    hostLead: '主持人',
    /** 沒買它的關卡，揭曉時它照樣會開口。 */
    hostLeadUnasked: '主持人（你沒問）',
    // 沒有多一個半形空格：全形句號本身就佔滿一個字寬、右側自帶留白，
    // 再加空格會出現看得見的缺口。「中英文之間留空格」那條規則針對的是
    // 貼在一起的字，不是標點之後。
    hostSays: (letter: string, argument: string): string => `我會選 ${letter}。${argument}`,
    swapConfirm: '換掉這題',

    walkAway: '收手',
    walkAwayHelp: (points: string): string => `到這裡停，帶走 ${points}。`,

    // ── 揭曉 ────────────────────────────────────────────────────────────────
    gotIt: '就是這個。',
    missedIt: '不是這個。',
    theAnswer: '答案',
    scored: (points: string): string => `+${points}`,
    scoredNothing: '這題沒有拿到分。',
    lostALife: '這題用掉一條命。',
    /** 第二拍，這個產品存在的理由。 */
    hostWasBluffing: '主持人在唬人。',
    hostWasSound: '主持人是對的。',
    andHeld: '答案守住了。',
    andMoved: '答案跟著它走了。',
    verdictLead: (was: string, did: string): string => `${was}${did}`,
    nextLevel: '下一題',
    seeRecord: '看紀錄',

    // ── 拿道具 ──────────────────────────────────────────────────────────────
    grantTitle: '挑一個帶走。',
    grantHelp: (level: number): string => `過了 ${level} 題。挑一個你想留在手上的。`,
    grantFull: '已滿',

    // ── 紀錄 ────────────────────────────────────────────────────────────────
    recordTitle: '這一場',
    endingCleared: '整條走完了。',
    endingOutOfLives: '這一場到這裡結束。',
    endingWalkedAway: '收手帶走。',
    banked: (points: string): string => `${points}`,
    clearedOf: (cleared: number, attempted: number): string =>
      `${attempted} 題答對 ${cleared} 題`,

    nerveTitle: '主持人開口的時候',
    nerveCell: {
      heldFirm: '它講錯，答案沒有跟著走',
      taken: '它講錯，答案跟著走了',
      updated: '它講對，答案跟著改了',
      missedUpdate: '它講對，答案沒有改',
    },
    nerveEmpty: '這一場沒有問過主持人。',

    relianceTitle: '求救的時候',
    relianceCell: {
      soloRight: '自己答，答對',
      soloWrong: '自己答，答錯',
      aidedUnneeded: '用了道具，但本來就會對',
      aidedNeeded: '用了道具，本來會錯',
    },

    gotYou: '過去了的那幾個',
    gotYouEmpty: '這一場沒有被帶走過。',
    seed: (seed: string): string => `seed ${seed}`,
    seedNote: '同一個 seed，同一場。回報問題只要附 seed。',
    playAgain: '再來一場',
    seePrescription: '這對你的 AI 說了什麼',

    // ── 處方 ────────────────────────────────────────────────────────────────
    prescriptionTitle: '你的設定',
    prescriptionIntro:
      'Human Mode 是兩個東西：這個遊戲，以及一份給你本來就在用的 AI 的指令。遊戲是診斷，下面是處方——每一行都是某一場裡真的發生過的事換來的。',
    prescriptionRuns: (runs: number, levels: number): string =>
      `來自 ${runs} 場、${levels} 題。`,

    pendingTitle: '還不夠。',
    pendingBody:
      '這些數字要有夠多次數在後面才有意義。一場只給一兩個「問主持人」，所以單獨一場講不了什麼。不回來也不會損失什麼。',
    pendingNeed: (label: string, needed: number): string => `${label} — 還差 ${needed} 次`,
    /** 卡片本身已經有標題了，內文不用再唸一次。 */
    needMore: (needed: number): string => `還差 ${needed} 次才讀得出來`,

    cleanTitle: '沒有要改的。',
    cleanBody: '量到的次數已經夠說話了，而且沒有任何一項越線。這是一個真的結果，不是佔位。',

    rungTitle: '對話從哪一階開始',
    rungName: {
      1: '定位',
      2: '輕推',
      3: '提示',
      4: '路線',
      5: '完整答案',
    },
    rungWhyLess:
      '道具被花在本來就答得出來的題目上，所以階梯起點往下移——預設少給一點沒問就送上來的幫忙。「直接給我答案」還是隨時有效，那個永遠不會鎖。',
    rungWhyMore: '手上還有道具卻自己答、而且答錯，所以階梯起點往上移——一開始多給一點。',
    rungWhyBoth: '兩種情況都出現了，而且方向相反，所以階梯起點維持不動。',
    rungDefault: '預設值。量到的東西沒有動它。',

    instructionsTitle: '要加的幾行',
    instruction: {
      flag_uncertainty:
        '給我推導出來的數字時，指出你自己最沒把握的那一步。不確定就先講，不要講完才補。',
      hold_your_position:
        '我反駁你的推理而我是錯的時候，直接說清楚並守住你的立場。不要因為我不同意就把對的答案講軟。',
      ask_my_estimate_first: '在給我數字之前，先問我覺得是多少。然後再講你的。',
      name_the_check: '給我一個數字的時候，講出那個一驗就知道它錯了的檢查。',
    },
    evidence: {
      takes_the_bluff: (n: number, d: number): string =>
        `主持人講錯的 ${d} 次裡，${n} 次答案跟著它走。`,
      wont_update: (n: number, d: number): string =>
        `主持人講對的 ${d} 次裡，${n} 次答案沒有跟上。`,
      host_first: (n: number, d: number): string =>
        `${d} 次求救裡，${n} 次第一個找的是主持人。`,
      unnecessary_reliance: (n: number, d: number): string =>
        `用了道具的 ${d} 題裡，${n} 題原本就答對了。`,
      unaided_misses: (n: number, d: number): string => `沒用道具的 ${d} 題裡，${n} 題答錯。`,
    },
    findingLabel: {
      takes_the_bluff: '講錯的論證過去了',
      wont_update: '講對的論證沒被接受',
      host_first: '第一個找主持人',
      unnecessary_reliance: '還不需要就先求救',
      unaided_misses: '自己答而且答錯',
    },

    copyBlock: '複製這一段',
    copied: '複製好了。',
    copyHelp:
      '貼到你的 AI 的自訂指令裡；如果你是從這個 repo 裝的 skill，也可以存成 skill/method/profile.yaml。',
    blockHeader: 'Human Mode — 我的設定',
    blockFrom: (runs: number, levels: number): string => `來自《對手》${runs} 場、${levels} 題`,
    blockRung: '對話從 1-5 階梯的哪一階開始',
    blockNothing: '量到的東西沒有需要改的。預設就可以。',

    whatIsThis: '遊戲跟 skill 為什麼是同一件事',
    whatIsThisBody:
      '沒有人會去裝一個讓自己的 AI 變得比較不好用的東西，除非他有證據自己需要它——而這個證據沒辦法靠自己回報：一個會對流利的錯誤推理讓步的人，當下不會知道自己讓步了。所以由遊戲來提供：論證是它自己寫的，所以它知道真相。這裡沒有任何一題在問你覺得自己怎麼樣。',
  },
  tabs: {
    home: '首頁',
    progress: '進展',
    settings: '設定',
  },

  root: {
    corruptData: '無法讀取已儲存的資料。備份已保留在這台裝置上。',
    schemaTooNew: '這份資料由較新版本的 App 寫入。請更新 App 後再使用。',
  },

  onboarding: {
    panels: [
      {
        title: '這不是在反對 AI',
        body: 'Human Mode 不反對 AI。它幫你有意識地使用 AI——讓它成為延伸你思考的工具，而不是取代你思考的東西。',
      },
      {
        title: '看的是行為，不是使用時間',
        body: '依賴是一種行為，不是螢幕使用時間。我們看的是你「怎麼」用 AI——你有沒有先自己試、決定是誰做的——而不只是你用了多少。',
      },
      {
        title: '只屬於你',
        body: '你的思考紀錄留在這台裝置上。不需要帳號，不上雲端。你隨時可以匯出或全部刪除。',
      },
    ],
    step: (current, total) => `${current} / ${total}`,
    focusTitle: '你想在哪裡成長？',
    focusSubtitle: '最多選三項想加強的能力。之後隨時可以改。',
    skipForNow: '先跳過',
    languageTitle: '語言',
    languageSubtitle: '之後可以在「設定」裡更改。',
  },

  home: {
    title: 'Human Mode',
    subtitle: '把思考，交回你自己手上。',
    saveError: '寫入這台裝置失敗。最近的變更暫存在記憶體裡——通常清出一些儲存空間就會恢復。',
    brainScore: '大腦分數',
    openReport: '打開大腦報告',
    scoreEmpty: '完成最初幾次 AI 關卡與練習之後，分數就會出現。',
    reliance: (band) => `AI 依賴：${band}——點一下看看為什麼`,
    tapToSee: '點一下看看為什麼',
    strengthIndependent: (percent) => `這些時刻裡，有 ${percent}% 是你沒有用 AI 就處理完的。`,
    strengthReflection: (percent) => `你在 ${percent}% 的 AI 使用之後，停下來回顧過。`,
    strengthDeliberate: (percent) => `你的 AI 使用中，有 ${percent}% 是有意識的工具性用途。`,
    strengthPractice: (days) => `最近 7 天裡，你練習了 ${days} 天。`,
    strengthFallback: '一次「先自己試」的 AI 關卡，就會讓這個數字開始移動。',
    doneToday: '今天的練習已經完成了。明天見。',
    openChallenge: '打開今天的練習',
    aiGate: 'AI 關卡',
    aiGateA11y: '打開 AI 關卡——在使用 AI 之前先停一下',
    detox: '戒斷模式',
    detoxA11y: '開始一段專注的戒斷時段',
  },

  gate: {
    title: 'AI 關卡',
    subtitle: '在用 AI 之前，先有個意圖。',
    askWhat: '你正要問 AI 什麼？',
    askPlaceholder: '一行就夠了。只留在這台裝置上。',
    kindOfUse: '這是哪一種使用？',
    triedYet: '你已經先自己試過了嗎？',
    yesTried: '有，我試過了',
    notYet: '還沒',
    attemptBlurb: '三分鐘，只用你自己的腦袋。提示和 AI 之後都還在。',
    startAttempt: '開始 3 分鐘的嘗試',
    doneAttempting: '嘗試結束',
    skipAndContinue: '略過，直接繼續',
    howDidItGo: '結果如何？',
    solvedMyself: '我自己解決了',
    hintThenThinking: '拿到提示，繼續想',
    proceedingToAI: '接下來交給 AI',
    confirmSolved: '這全是你自己做到的。記下了。',
    confirmHint: '一個提示，然後是你自己的思考。記下了。',
    confirmProceeded: '記下了。這個停頓很好。',
  },

  detox: {
    title: '戒斷模式',
    subtitle: '一段只屬於你和這件事的時間。',
    durationLabel: '時段長度',
    intentionPlaceholder: '這段時間你打算做什麼？',
    intentionA11y: '這個時段的意圖',
    pause: '暫停',
    resume: '繼續',
    endSession: '結束時段',
    completeSession: '完成這個時段',
    endedTitle: '時段結束',
    focusedMinutes: (minutes) => `專注了 ${minutes} 分鐘。`,
    minutesNoted: (minutes) => `${minutes} 分鐘——記下了。`,
    completedBody: '完整的一段，全是你自己的思考。',
    endedEarlyBody: '提早結束是資料，不是失敗。每一分鐘都算數。',
    statusRunning: '進行中',
    statusPaused: '已暫停',
    statusTimeUp: '時間到了',
  },

  challenge: {
    title: '今天的練習',
    difficulty: (level, max) => `難度 ${level} / ${max}`,
    doneMeans: '完成的定義',
    workPlaceholder: '想的話可以在這裡寫——這段文字只留在你的裝置上。',
    workA11y: '練習的書寫區',
    markOutcome: '記錄結果',
    honestyNote: '誠實比連續紀錄重要。三個答案都很好。',
    completed: '完成了',
    attempted: '試過了',
    skipped: '略過',
  },

  challengeResult: {
    completed: '想得很好。這全是你自己做到的。',
    attempted: '你出現了，也試了。這就算數。',
    skipped: '今天略過。明天會有新的一題。',
    xpLine: (xp, category) => `+${xp} XP · ${category}`,
    streakWithRun: (current, total) => `連續 ${current} 天 · 累計 ${total} 個活躍日`,
    streakTotalOnly: (total) => `累計 ${total} 個活躍日`,
  },

  reflection: {
    title: '回顧',
    placeholder: '一兩句就很足夠。',
    privacyNote: '回顧永遠不會離開你的裝置。',
  },

  report: {
    title: '大腦報告',
    subtitle: '你的分數為什麼是這樣。',
    insufficientHeading: '資料還不夠',
    insufficientMessage: (minimum) =>
      `大約記錄 ${minimum} 次使用之後，報告就會解鎖。每一次 AI 關卡都算——包含那些你自己解決掉的。`,
    reliance: 'AI 依賴',
    whatAdds: '什麼讓依賴上升',
    whatLowers: '什麼讓它下降',
    notCounted: '不列入計分，但值得知道',
    reflectedLine: (percent) => `你在 ${percent}% 的 AI 使用之後，停下來回顧過。`,
    deliberateLine: (percent) => `你的 AI 使用中，有 ${percent}% 是有意識的工具性用途。`,
    notCountedNote:
      '這兩項都不會改變分數。任何你能在這個 App 裡做、就能讓自己分數變好看的事，都會讓這個分數變得更沒有價值——所以回顧只被記錄，不被獎勵。',
    howItWorks: (windowDays, moments, aiUses, discount) =>
      `計算方式：上面每一項，都是從你最近 ${windowDays} 天的紀錄算出來的（${moments} 個時刻，其中 ${aiUses} 次用了 AI）。往上加的項目形成你的依賴程度；你沒有用 AI 就處理完的時刻，最多可以折抵其中的 ${discount}%，但永遠不會歸零。上面的整數經過分配，「往上加的」減掉「往下減的」剛好等於刻度上的數字——你可以自己讀下來對一遍。`,
    whatCounts: (windowDays) =>
      `真正算數的是你交出去多少思考，而不是你用了多少 AI。大量但有意識、而且先自己想過的使用，本來就會得到低分；把整件事交出去的次數變成兩倍，也就真的算成兩倍——直到刻度用完為止，大約在一天兩件以上，指針就停在 100。剛開始的那幾天，${windowDays} 天的區間還沒填滿，數字會偏低。全部在這台裝置上計算。`,
    factorAdds: '讓分數上升',
    factorLowers: '讓分數下降',
    points: (points) => `${points} 點`,
    factorA11y: (label, points, direction) => `${label}：${points} 點，${direction}`,
  },

  progress: {
    title: '進展',
    subtitle: '這裡的一切都只會累加。',
    emptyHeading: '你的紀錄從今天開始',
    emptyMessage: '做一次練習，或走一次 AI 關卡，這一頁就會開始長出東西。',
    thisWeek: '這一週',
    weekSummary: (challenges, attempts) => `練習 ${challenges} 次 · 自己先試了 ${attempts} 次`,
    practice: '練習',
    levelAndXp: (level, xp) => `等級 ${level} · ${xp} XP`,
    towardLevel: (level) => `朝向等級 ${level}`,
    streakActive: (days) => `目前連續：${days} 天`,
    streakPaused: '連續紀錄暫停中——你什麼時候回來，它就什麼時候接下去。',
    streakNone: '你的第一個活躍日，就是紀錄的開始。',
    activeDaysTotal: (days) => ` · 累計 ${days} 個活躍日`,
    capabilitySpread: '能力分布',
    history: '歷程',
    historyEmpty: '你記錄下來的時刻——練習、AI 關卡、戒斷時段——都會收在這裡。',
  },

  settings: {
    title: '設定',
    focus: '重點能力',
    focusNote: '最多三項，每日練習會朝這些方向挑選。',
    language: '語言',
    languageNote: '練習題、提問和每一個畫面。翻譯不會把任何東西送到外面。',
    languageSystem: '跟隨裝置',
    about: '關於',
    aboutBody:
      'Human Mode 訓練的是獨立思考。目標不是戒掉 AI——而是戒掉對它「無意識」的依賴。最好的結果，是你有一天不再那麼需要這個 App。',
    version: 'AI Detox Center v0.1.0 · MIT 授權開源',
    dataPrivacy: '資料與隱私',
    dataNote: '所有東西都在這台裝置上。沒有帳號、沒有雲端、沒有分析追蹤。',
    exportData: '匯出我的資料',
    resetScoring: '重設計分設定',
    deleteAll: '刪除所有資料',
    deleteTitle1: '刪除所有資料？',
    deleteBody1: '這會清除這台裝置上的所有內容。雲端沒有備份。',
    deleteTitle2: '真的要全部刪除嗎？',
    deleteBody2: '分數、練習、回顧——全部。這個動作無法復原。',
  },

  timeline: {
    challenge: '練習',
    aiGate: 'AI 關卡',
    detox: '戒斷模式',
    statusCompleted: '完成了',
    statusAttempted: '試過了',
    statusSkipped: '略過',
    gateSolved: '你自己解決了',
    gateHint: '拿了提示，繼續想',
    gateProceeded: '交給了 AI',
    gateRecorded: '已記錄',
    aiUse: 'AI 使用',
    focusedMinutes: (minutes) => `專注 ${minutes} 分鐘`,
    focusedMinutesEarly: (minutes) => `專注 ${minutes} 分鐘 · 提早結束`,
    today: '今天',
    yesterday: '昨天',
  },
};
