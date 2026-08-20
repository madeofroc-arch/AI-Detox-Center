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
    continue: '繼續',
    cancel: '取消',
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
    rungGives: {
      1: '這題是什麼形狀，以及該從哪裡看起',
      2: '一個問題或一個觀察，把卡住的地方送一下',
      3: '需要的那個概念，但不幫你套到你的例子上',
      4: '整套方法，一步一步——做還是你做',
      5: '完整的東西，而且不拖泥帶水',
    },
    rungHere: '你從這裡開始',
    rungAlwaysOpen: '永遠開著',
    rungTowerLabel: (rung: number, name: string): string =>
      `提示階梯，共五階。對話從第 ${rung} 階「${name}」開始。` +
      '第 5 階的完整答案隨時都拿得到。',
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

    backToGame: '回到遊戲',

    dataTitle: '你的資料',
    dataNote: '所有東西都在這台裝置上。沒有帳號，沒有雲端，沒有分析工具。',
    exportData: '匯出我的資料',
    deleteAll: '刪除所有資料',
    deleteTitle1: '刪除所有資料？',
    deleteBody1: '這會抹掉這台裝置上的所有東西。雲端沒有備份。',
    deleteTitle2: '真的要全部刪掉？',
    deleteBody2: '每一場、每一則留下來的唬人論證、每一個設定。這個沒辦法復原。',

    whatIsThis: '遊戲跟 skill 為什麼是同一件事',
    whatIsThisBody:
      '沒有人會去裝一個讓自己的 AI 變得比較不好用的東西，除非他有證據自己需要它——而這個證據沒辦法靠自己回報：一個會對流利的錯誤推理讓步的人，當下不會知道自己讓步了。所以由遊戲來提供：論證是它自己寫的，所以它知道真相。這裡沒有任何一題在問你覺得自己怎麼樣。',
  },
  root: {
    corruptData: '無法讀取已儲存的資料。備份已保留在這台裝置上。',
    schemaTooNew: '這份資料由較新版本的 App 寫入。請更新 App 後再使用。',
  },

};
