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
    timeRemaining: (minutes, seconds) => `還剩 ${minutes} 分 ${seconds} 秒`,
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
    timeRemaining: (minutes, seconds) => `還剩 ${minutes} 分 ${seconds} 秒`,
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
      `計算方式：上面每一項，都是從你最近 ${windowDays} 天的紀錄算出來的（${moments} 個時刻，其中 ${aiUses} 次用了 AI）。往上加的項目形成你的依賴程度；你沒有用 AI 就處理完的時刻，最多可以折抵其中的 ${discount}%，但永遠不會歸零。每個數字都取整到整數點，所以把它們讀出來相加，可能會和刻度差個一兩點。`,
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
