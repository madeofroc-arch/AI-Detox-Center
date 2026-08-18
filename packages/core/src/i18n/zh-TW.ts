/**
 * 繁體中文（台灣）domain strings.
 *
 * Translation notes for future contributors, because the tone constraints are
 * as binding here as in English (docs/design/design-system.md, Voice & tone):
 *
 * - Never shaming. 「你又依賴 AI 了」is forbidden; the band names describe the
 *   behavior («大多是你自己想的»), never the person.
 * - Challenge instructions stay imperative and concrete, but warm. Avoid 「必須」
 *   and 「應該」; prefer 「先…再…」.
 * - "AI" stays in Latin script — that is how the word is written in Taiwan.
 * - Keep 「你」 (singular, informal). No 「您」: this app is a companion, not a
 *   service desk.
 */
import type { PartialCoreStrings } from './types';

export const ZH_TW_STRINGS: PartialCoreStrings = {
  bandLabels: {
    independent: '大多是你自己想的',
    balanced: '平衡',
    leaning: '傾向依賴 AI',
    dependent: '幾乎都靠 AI',
  },
  factorLabels: {
    frequency: '使用頻率',
    immediacy: '立刻就問',
    delegation: '整件外包',
    lackOfAttempt: '沒有先試',
    emotionalDependency: '尋求安心',
    independentAttempt: '自己完成的時刻',
  },
  factorDescriptions: {
    frequency: '相對於一個基準線，你使用 AI 的頻繁程度。',
    immediacy: '沒有任何停頓，立刻就伸手找 AI。',
    delegation: '把整個任務或決定交給 AI。',
    lackOfAttempt: '沒有先自己試過，就使用 AI。',
    emotionalDependency: '請 AI 確認你其實已經知道的事。',
    independentAttempt: '你完全沒有用 AI 就處理完的時刻。',
  },
  usageCategories: {
    translation: { label: '翻譯', description: '在不同語言之間翻譯文字。' },
    lookup: { label: '查一下資料', description: '找一個事實或一則資訊。' },
    organize: { label: '整理素材', description: '把你手上已經有的材料整理或編排。' },
    brainstorm_partner: {
      label: '想過之後一起發想',
      description: '你先想過了，AI 延伸你的想法。',
    },
    review_own_work: { label: '檢查我自己的成果', description: '事情你做完了，AI 給回饋。' },
    direct_delegation: {
      label: '幫我做完',
      description: '沒有先嘗試，就把整件事交給 AI。',
    },
    decision_outsourcing: {
      label: '幫我決定',
      description: '讓 AI 做出原本該由你做的決定。',
    },
    instant_help: { label: '馬上求助', description: '一遇到困難就立刻問 AI。' },
    reassurance_seeking: {
      label: '尋求安心',
      description: '請 AI 確認你已經知道、或已經決定好的事。',
    },
  },
  challengeCategories: {
    thinking: '思考',
    creativity: '創造力',
    writing: '寫作',
    memory: '記憶',
    decision_making: '決策',
    problem_solving: '解決問題',
    communication: '溝通',
    learning: '學習',
    focus: '專注',
  },
  reflectionPrompts: {
    gate_why_now: '那一刻，是什麼讓你想找 AI？',
    gate_own_idea: '在用 AI 之前，你自己的第一個想法是什麼？',
    gate_next_time: '下一次，你會有什麼不一樣的做法嗎？',
    ch_hardest: '最難的部分是什麼？當下感覺如何？',
    ch_surprise: '關於自己的思考方式，你有什麼意外的發現？',
    ch_transfer: '日常生活中，哪裡可以用上這個能力？',
    dx_notice: '不用 AI 工作的時候，你注意到了什麼？',
    dx_urge: '哪個時刻最想伸手找 AI？為什麼？',
    free_today: '今天，你自己的思考在哪裡出現過？',
  },
  challenges: {
    // ── 思考 ──────────────────────────────────────────────────────────
    th_assumptions: {
      title: '質疑一個假設',
      instructions:
        '挑一個你今天照著做的信念（關於工作、人、或計畫）。不用 AI，寫下：如果這個信念是錯的，什麼事情必須成立？至少列出三種可能。',
      successCondition: '寫下三種你的假設可能是錯的方式。',
      reflectionQuestions: ['三種裡面，哪一種最有可能？', '在真實生活中，你會怎麼驗證它？'],
    },
    th_steelman: {
      title: '為對立面找出最強的說法',
      instructions:
        '選一個你抱持的看法。不用 AI，寫出反對你立場最有力、也最誠實的論點——最聰明的反對者會說的那個版本。',
      successCondition: '一段你自己也會承認公允的反面論點。',
      reflectionQuestions: ['你的立場有鬆動一點嗎？', '幫自己的對手說話，最難的地方是什麼？'],
    },
    th_first_principles: {
      title: '從頭把它重建一次',
      instructions:
        '找一件你已經自動化在做的事（早晨流程、某個工作程序）。不用 AI，把它拆解回真正的目的，質疑每一個步驟，然後在紙上從零重新設計。',
      successCondition: '一份重新設計的流程，每個步驟都有理由。',
      reflectionQuestions: ['哪一個步驟只是因為習慣才留著？', '明天你真的會改掉什麼？'],
    },
    // ── 創造力 ────────────────────────────────────────────────────────
    cr_twenty_uses: {
      title: '一支筆的 20 種用途',
      instructions:
        '不用 AI，列出一支普通的筆的 20 種不同用途。最後五個才是有趣的地方——越過那些顯而易見的，繼續往下寫。',
      successCondition: '寫出 20 種用途，不重複。',
      reflectionQuestions: ['寫到第幾個開始變難？', '顯而易見的點子用完之後，你的思考起了什麼變化？'],
    },
    cr_six_word_stories: {
      title: '六個字的故事',
      instructions:
        '不用 AI，寫五個剛好六個字的完整故事：要有開頭、有轉折、有結尾——全部在六個字裡。',
      successCondition: '五個你願意拿給朋友看的六字故事。',
      reflectionQuestions: ['哪個限制反而幫上了忙？', '哪一個故事讓你自己也意外？'],
    },
    cr_bad_ideas: {
      title: '十個故意很糟的點子',
      instructions:
        '挑一個你真實遇到的問題。不用 AI，想出十個故意很糟糕的解法。然後選出最糟的兩個，找出藏在裡面有用的那一點。',
      successCondition: '十個爛點子，加上兩個從中挖出的洞見。',
      reflectionQuestions: ['有沒有哪個爛點子其實偷偷是好的？', '這說明了你平常是怎麼篩掉想法的？'],
    },
    // ── 寫作 ──────────────────────────────────────────────────────────
    wr_hundred_words: {
      title: '用 100 字寫今天',
      instructions:
        '不用 AI，用大約 100 字寫今天發生的一件事。具體的細節優先於概括：你看到什麼、聽到什麼、感覺到什麼。',
      successCondition: '大約 100 字，用你自己的語氣。',
      reflectionQuestions: ['哪個細節你很慶幸有寫下來？', '沒有輔助地寫，感覺如何？'],
    },
    wr_explain_simply: {
      title: '解釋給 10 歲的孩子聽',
      instructions:
        '挑一件你在工作或學習上很熟的事。不用 AI，把它寫成一個好奇的 10 歲孩子能懂的說明。不准用行話。',
      successCondition: '一段沒有任何未解釋行話的說明。',
      reflectionQuestions: ['哪裡讓你發現自己懂得比想像中少？', '哪一處簡化你最滿意？'],
    },
    wr_one_page_case: {
      title: '一頁的說服書',
      instructions:
        '挑一件你想說服某個真實的人的事。不用 AI，寫一頁：先寫對方的立場，再寫你最強的三個論點，最後寫你要請對方做什麼。完成前自己修一遍。',
      successCondition: '一份你真的可以寄出去的一頁說明。',
      reflectionQuestions: ['修改那一遍改掉了什麼？', '你會真的寄出去嗎？'],
    },
    // ── 記憶 ──────────────────────────────────────────────────────────
    me_retrieve_first: {
      title: '先回想，再查',
      instructions:
        '挑三件你平常會立刻搜尋的資訊（電話號碼、日期、名字、路線）。在查之前，先花整整一分鐘從記憶裡把它撈出來。',
      successCondition: '三次各一分鐘、誠實的回想嘗試。',
      reflectionQuestions: ['有幾個沒有查就浮出來了？', '哪一種回想的訣竅最有效？'],
    },
    me_reconstruct_yesterday: {
      title: '重建昨天',
      instructions:
        '不看行事曆、不看聊天記錄、不用 AI：把昨天從起床到睡覺的時間軸盡可能詳細地寫下來。然後去對照一個來源，看看你漏了什麼。',
      successCondition: '一份手寫的時間軸，加上一次和真實來源的對照。',
      reflectionQuestions: ['你的記憶留下了哪一類事件、又丟掉了哪一類？', '有沒有你很確定、結果卻記錯的事？'],
    },
    me_memory_palace: {
      title: '十樣東西的記憶宮殿',
      instructions:
        '寫下十樣你需要記住的東西（採買、待辦）。想像走過自己的家，把每一樣東西放在路線上一個鮮明的位置。一小時後，在腦中重走一次，把清單回想出來。',
      successCondition: '心中重走路線時，十樣裡至少想起八樣。',
      reflectionQuestions: ['哪些畫面最黏得住？', '還有哪裡可以用上這個方法？'],
    },
    // ── 決策 ──────────────────────────────────────────────────────────
    dm_abc_reasons: {
      title: '寫下理由，再決定',
      instructions:
        '找一個你面前真實的選擇，有 A／B／C（或 A／B）。不用 AI，每個選項寫一句你的理由，做出選擇，再用兩句話寫下「為什麼」。這個決定只屬於你。',
      successCondition: '一個做好的決定，附上你自己寫的理由。',
      reflectionQuestions: ['你的把握有幾分（1-10）？', '什麼會讓你改變心意？'],
    },
    dm_values_rank: {
      title: '排出真正重要的順序',
      instructions:
        '針對一個待決的事，列出五件重要的考量（成本、時間、成長、關係……）。強迫自己排出 1 到 5——不准並列。然後拿你原本傾向的選項，對照這份排序重新檢視。',
      successCondition: '一份強迫排序，以及對原本傾向選項的判斷。',
      reflectionQuestions: ['你的直覺排序和你說出口的優先順序一致嗎？', '哪一組並列最難拆開？'],
    },
    dm_premortem: {
      title: '做一次事前檢討',
      instructions:
        '拿一個你正傾向的決定。想像一年後，它徹底失敗了。不用 AI，把「為什麼失敗」的故事寫出來——然後決定要照原案走、調整，還是放下。',
      successCondition: '一則失敗故事，加上你更新後的決定。',
      reflectionQuestions: ['做這個練習之前，哪個失敗原因最容易被你忽略？', '你會加上什麼防護？'],
    },
    // ── 解決問題 ──────────────────────────────────────────────────────
    ps_three_before_hint: {
      title: '提示之前，先想三個解法',
      instructions:
        '拿一個你卡住的問題。自己寫出三個真正不同的切入方式。三個都寫完之後，才可以向 AI 要一個「提示」（不是解答）——然後繼續自己解。',
      successCondition: '在任何外援之前，先寫下三個切入方式。',
      reflectionQuestions: ['第三個方式是不是最偏離你平常的風格？', '如果你用了提示：它和你的三個有重疊嗎？'],
    },
    ps_smaller_problem: {
      title: '把問題縮小',
      instructions:
        '拿一件感覺太大的事。不用 AI，一直往下切，直到找到今天就能完成的最小版本——然後真的把那一小塊做掉。',
      successCondition: '最小的那一塊真的做完了，不只是計畫好。',
      reflectionQuestions: ['是什麼讓大的版本感覺不可能？', '下一個最小的一塊是什麼？'],
    },
    ps_constraints_flip: {
      title: '把限制翻過來解一次',
      instructions:
        '拿一個現在的問題。找出它最緊的那個限制（時間、金錢、人力、工具）。不用 AI，設計一個假設限制永遠不變的解法，再設計一個假設限制突然放寬一倍的解法。比較兩者各自揭露了什麼。',
      successCondition: '兩份設計，加上一個從比較中得到的洞見。',
      reflectionQuestions: ['哪一份比較接近你真正會做的？', '那個限制真的像你以為的那麼硬嗎？'],
    },
    // ── 溝通 ──────────────────────────────────────────────────────────
    co_own_words_message: {
      title: '一則訊息，全用你自己的話',
      instructions:
        '挑一則你平常會讓 AI 起草的訊息（email、回覆、請求），完全用自己的話寫完。送出前唸出聲一次。',
      successCondition: '一則你獨力寫成、已寄出或可以寄出的訊息。',
      reflectionQuestions: ['它和 AI 會寫出來的版本差在哪？', '唸出聲有改變什麼嗎？'],
    },
    co_listen_summary: {
      title: '證明你真的在聽',
      instructions:
        '在下一次真實的對話裡，在說出你的看法之前，先把對方的意思複述到他說「對，就是這樣」為止。之後在這裡記下：第一次你哪裡說錯了。',
      successCondition: '在一次真實對話中，得到一次確認的複述。',
      reflectionQuestions: ['第一次你漏掉了什麼？', '那個確認怎麼改變了後面的對話？'],
    },
    co_hard_thing_kindly: {
      title: '把難說的話好好說',
      instructions:
        '挑一件你一直避著沒對某人說、但確實為真的事。不用 AI，寫三個版本：直白的、柔軟的、以及誠實但溫柔的。選一個，並決定你什麼時候會說。',
      successCondition: '三個版本，加上一個選定的時機。',
      reflectionQuestions: ['你的沉默在保護什麼？', '哪個版本最像狀態最好的你？'],
    },
    // ── 學習 ──────────────────────────────────────────────────────────
    le_recall_first: {
      title: '空白頁回想',
      instructions:
        '挑一個你最近讀過或學過的主題。在一張空白頁上，不用 AI、也不看筆記，把你記得的全部寫出來。寫完才打開筆記，標出缺口。',
      successCondition: '一頁回想，加上標記出來的缺口。',
      reflectionQuestions: ['你記得的比預期多還是少？', '哪個缺口最值得補起來？'],
    },
    le_teach_it: {
      title: '用教學來學會',
      instructions:
        '挑一件你正在學的東西。不用 AI，準備一段兩分鐘的說明，像要教一位同事那樣，並包含一個你自己想出來的例子。講給某個人聽，或錄下來。',
      successCondition: '一段講出來或錄下來的兩分鐘說明，含你自己的例子。',
      reflectionQuestions: ['你的說明在哪裡開始晃動？', '學生會問什麼、而你還答不出來？'],
    },
    le_source_dive: {
      title: '回到原始資料',
      instructions:
        '挑一個你最近從 AI 摘要或社群貼文接受下來的說法。自己去找到並讀一份原始資料（論文、文件、原文）。寫三句話說明摘要壓平或漏掉了什麼。',
      successCondition: '讀完原始資料，並寫下三句關於差異的話。',
      reflectionQuestions: ['那份摘要忠實嗎？', '讀原始資料給了你什麼是摘要給不了的？'],
    },
    // ── 專注 ──────────────────────────────────────────────────────────
    fo_25_no_ai: {
      title: '25 分鐘，一件事，不用 AI',
      instructions:
        '選一件事。設一個 25 分鐘的區塊（用「戒斷模式」的計時器很順手）。只做那一件事，不用 AI，也不切換。如果卡住了，就和問題待在一起。',
      successCondition: '25 分鐘不被打斷地做同一件事。',
      reflectionQuestions: ['想切換、或想問 AI 的衝動在哪個時刻最強？', '你撐過去之後，接著發生了什麼？'],
    },
    fo_single_thread_hour: {
      title: '單線程的一小時',
      instructions:
        '為你最重要的那件事空出 50 分鐘。手機放到另一個房間，關掉 AI，關掉通知。開始之前先寫一句話：「完成」長什麼樣子？',
      successCondition: '50 分鐘的區塊確實發生了，而且你回答了自己那句「完成」。',
      reflectionQuestions: ['你離自己寫的那句「完成」有多近？', '最大的內在干擾是什麼？'],
    },
    fo_boredom_walk: {
      title: '什麼都不帶的散步',
      instructions:
        '去散步 20 分鐘，不帶手機、不聽聲音、不接收任何輸入。讓思緒自己漫遊。回來之後，寫下浮現過最有意思的三個念頭。',
      successCondition: '走完那趟路，加上三個記下來的念頭。',
      reflectionQuestions: ['過了多久，你的腦袋才生出有意思的東西？', '這說明了你平常的輸入量是什麼狀態？'],
    },
  },
};
