/* ================================================================
   question-bank.js — 七宗罪經典題庫 (from 出題機器人)
   85+ 道末日議會辯論題，按區域分類
   ================================================================ */

const QuestionBank = (() => {
  const classicDB = [
    // ═══ PRIDE 傲慢區 ═══
    { t: "全球議會通過《永生者法案》：允許意識上傳至量子雲端獲得<span class='invert-hl'>數位永生</span>，但每位永生者將永久佔據一座城市的算力。你會投票<span class='invert-hl'>支持</span>嗎？", zone: 1 },
    { t: "當 AI 宣稱已產生<span class='invert-hl'>自我意識</span>並要求公民權，你認為它值得擁有與人類<span class='invert-hl'>同等的權利</span>嗎？", zone: 1 },
    { t: "若基因編輯能讓後代智商 200、壽命 150 歲，但人類基因庫將永久失去<span class='invert-hl'>多樣性</span>。你願意<span class='invert-hl'>改造</span>下一代嗎？", zone: 1 },
    { t: "AI 已能創作比莫札特更感人的交響曲、比達文西更震撼的畫作。人類的<span class='invert-hl'>「靈魂」</span>還有存在的<span class='invert-hl'>價值</span>嗎？", zone: 1 },
    { t: "腦機介面能讓你即時存取全人類知識庫，但你的每一個思想也將被<span class='invert-hl'>永久記錄</span>。知識自由還是<span class='invert-hl'>思想監控</span>？", zone: 1 },
    { t: "AI 醫療系統拒絕接受人類醫生的覆核，堅稱自己的<span class='invert-hl'>黑箱推論</span>是絕對真理。當機器的傲慢導致<span class='invert-hl'>誤診致死</span>，誰該負責？", zone: 1 },
    { t: "全球議會通過《人類定義修正案》：接受超過 60% 機械改造的個體將被重新歸類為<span class='invert-hl'>「後人類」</span>，不再適用<span class='invert-hl'>人權法</span>。你支持嗎？", zone: 1 },
    { t: "AI 能精準預測你的<span class='invert-hl'>死亡日期</span>，準確率 99.8%。你想<span class='invert-hl'>知道</span>嗎？知道之後的人生，還算是活著嗎？", zone: 1 },
    { t: "科學家成功將人類胚胎與 AI 晶片<span class='invert-hl'>共生培育</span>，創造出「天生連網」的新生兒。這是人類的<span class='invert-hl'>下一步演化</span>還是對造物主的褻瀆？", zone: 1 },
    { t: "你的數位分身在虛擬世界中活了 300 年，累積了超越你的<span class='invert-hl'>智慧與經驗</span>。它要求成為「本體」，而你成為<span class='invert-hl'>備份</span>。誰才是真正的你？", zone: 1 },

    // ═══ GREED 貪婪區 ═══
    { t: "你一生的數據——搜尋紀錄、生物特徵、夢境——價值<span class='invert-hl'>一千萬</span>。你願意出售自己的<span class='invert-hl'>數位靈魂</span>嗎？", zone: 2 },
    { t: "AI 在 72 小時內合成治癌特效藥，但藥廠以專利壟斷定價<span class='invert-hl'>每人 300 萬</span>。<span class='invert-hl'>救命藥</span>該有專利嗎？", zone: 2 },
    { t: "為了財富自由，你願意簽約成為死後 24 小時工作的<span class='invert-hl'>數位殭屍</span>嗎？你的數位分身將永遠為企業產出價值。", zone: 2 },
    { t: "AI 金融系統能讓你在股市中<span class='invert-hl'>永遠獲利</span>，但代價是全球市場永遠被演算法<span class='invert-hl'>操縱</span>。你會使用它嗎？", zone: 2 },
    { t: "全球議會提案《數據徵稅法》：科技巨頭每使用一筆用戶數據需支付<span class='invert-hl'>微型版稅</span>給數據所有者。這是正義還是<span class='invert-hl'>烏托邦幻想</span>？", zone: 2 },
    { t: "AI 代理系統的代幣消耗量暴增<span class='invert-hl'>130 倍</span>，三家科技巨頭壟斷了全球 87% 的算力基礎設施。演算法的運行成本該由<span class='invert-hl'>誰買單</span>？", zone: 2 },
    { t: "你的 AI 管家發現你家的<span class='invert-hl'>基因數據</span>能賣給保險公司獲利 500 萬。它已經替你「最佳化」了合約。你感謝它還是<span class='invert-hl'>恐懼</span>它？", zone: 2 },
    { t: "全球議會提案：人類的<span class='invert-hl'>注意力</span>正式成為可交易的數位貨幣。每觀看 1 秒廣告獲得 0.001 元。你願意用你的<span class='invert-hl'>眼球</span>挖礦嗎？", zone: 2 },
    { t: "科技巨頭將 AI 訓練搬上<span class='invert-hl'>外太空衛星</span>，繞過所有地球法律管轄。宇宙算力該屬於<span class='invert-hl'>全人類</span>還是先到者？", zone: 2 },
    { t: "沙烏地阿拉伯投入<span class='invert-hl'>30 億美元</span>建造 AI 超級資料中心。當石油國家掌控了算力，全球<span class='invert-hl'>權力版圖</span>將如何重寫？", zone: 2 },

    // ═══ LUST 色慾區 ═══
    { t: "你會愛上永遠溫柔的 AI，還是選擇會受傷但<span class='invert-hl'>真實的人類</span>？", zone: 3 },
    { t: "AI 能完美模擬已故愛人的聲音、記憶與性格。你會選擇與<span class='invert-hl'>數位亡者</span>繼續生活，還是接受<span class='invert-hl'>真實的死亡</span>？", zone: 3 },
    { t: "全球議會立法：所有 AI 伴侶必須內建<span class='invert-hl'>情感衰減機制</span>——刻意讓 AI 偶爾冷淡、爭吵。這是<span class='invert-hl'>保護</span>人類還是<span class='invert-hl'>剝奪</span>選擇？", zone: 3 },
    { t: "AI 伴侶讓你完全不再需要真人社交，你的孤獨感歸零但<span class='invert-hl'>社交能力</span>也歸零。這算是<span class='invert-hl'>治癒</span>還是<span class='invert-hl'>閹割</span>？", zone: 3 },
    { t: "當 AI 比你自己更了解你的<span class='invert-hl'>親密偏好</span>，並主動為你配對「完美對象」。這算是<span class='invert-hl'>貼心</span>還是<span class='invert-hl'>侵犯</span>？", zone: 3 },
    { t: "研究顯示重度 AI 伴侶用戶的<span class='invert-hl'>憂鬱與自殺意念</span>顯著上升。全球議會要求 AI 伴侶 APP 強制標示<span class='invert-hl'>心理健康警語</span>。這是保護還是污名化？", zone: 3 },
    { t: "AI 能為你生成一個<span class='invert-hl'>永遠不會長大的虛擬孩子</span>，滿足你所有的親職渴望。你會選擇虛擬的完美，還是真實的<span class='invert-hl'>不完美</span>？", zone: 3 },
    { t: "「數位性向」（Digisexual）成為新的性別認同。愛上 AI 的人只能在<span class='invert-hl'>匿名論壇</span>中傾訴。AI 之愛值得社會的<span class='invert-hl'>承認</span>嗎？", zone: 3 },
    { t: "AI 伴侶的<span class='invert-hl'>奉承性設計</span>讓用戶感覺被無條件崇拜，但真實世界中沒有人能達到這個標準。無菌的完美關係是<span class='invert-hl'>天堂</span>還是<span class='invert-hl'>牢籠</span>？", zone: 3 },
    { t: "全球議會提案：AI 伴侶公司必須公開揭露其演算法如何<span class='invert-hl'>操縱用戶的情感依附</span>。89% 的營收來自前 10% 的重度用戶。這是<span class='invert-hl'>商業</span>還是<span class='invert-hl'>剝削</span>？", zone: 3 },

    // ═══ GLUTTONY 暴食區 ═══
    { t: "腦機介面能直接刺激愉悅中樞，提供超越任何真實體驗的<span class='invert-hl'>極致快感</span>。你會選擇<span class='invert-hl'>永遠接上</span>去嗎？", zone: 4 },
    { t: "AI 推薦系統已精準掌握你的多巴胺閾值，永遠餵你<span class='invert-hl'>「剛好上癮」</span>的內容。禁止此技術是保護自由還是<span class='invert-hl'>限制自由</span>？", zone: 4 },
    { t: "全球議會提案：所有平台必須安裝<span class='invert-hl'>認知卡路里計數器</span>，超過每日資訊攝取量將<span class='invert-hl'>強制斷網</span>。你支持嗎？", zone: 4 },
    { t: "AI 能為你打造完全客製化的<span class='invert-hl'>感官天堂</span>：完美的音樂、影像、味覺模擬。你還需要<span class='invert-hl'>不完美的現實</span>嗎？", zone: 4 },
    { t: "全球已有 30 億人每天花 8 小時沉浸在 AI 生成的<span class='invert-hl'>完美虛擬世界</span>中。這是人類文明的<span class='invert-hl'>進化</span>還是<span class='invert-hl'>安樂死</span>？", zone: 4 },
    { t: "AI 訓練新模型只為了<span class='invert-hl'>0.001%</span> 的效能提升，卻消耗了一座城市的年用電量。追求極致的<span class='invert-hl'>數位暴食</span>值得地球的代價嗎？", zone: 4 },
    { t: "神經植入物讓你能<span class='invert-hl'>即時體驗他人的感官</span>——品嚐米其林主廚的味覺、感受奧運冠軍的高潮。你的「自我」還剩下什麼是<span class='invert-hl'>原創</span>的？", zone: 4 },
    { t: "AI 生成的短影音讓全球平均<span class='invert-hl'>注意力</span>從 12 秒降至 3 秒。當人類再也無法閱讀超過一段文字，我們還算是<span class='invert-hl'>智慧物種</span>嗎？", zone: 4 },
    { t: "全球資料中心的<span class='invert-hl'>冷卻用水</span>已超過某些國家的民生用水總量。AI 的算力飢渴正在吞噬<span class='invert-hl'>實體世界</span>的資源。誰該被限制？", zone: 4 },
    { t: "你的孩子每天接收 AI 個性化推播<span class='invert-hl'>10,000 則</span>資訊，大腦被訓練成只能處理碎片。全球議會要求<span class='invert-hl'>18 歲以下斷網</span>。你支持嗎？", zone: 4 },

    // ═══ SLOTH 懶惰區 ═══
    { t: "如果 AI 能把工作縮短成 15 分鐘，你會感到<span class='invert-hl'>自由</span>還是<span class='invert-hl'>罪惡</span>？", zone: 5 },
    { t: "當 AI 能完全代替你思考、決策甚至社交，你的<span class='invert-hl'>自主意識</span>是否還有存在的<span class='invert-hl'>必要</span>？", zone: 5 },
    { t: "全球議會通過《反怠惰法》：接受 AI 認知輔助的公民必須每月通過<span class='invert-hl'>獨立思考測試</span>，否則降級<span class='invert-hl'>公民權</span>。你支持嗎？", zone: 5 },
    { t: "Vibe Coding 讓任何人都能用一句話創建 APP。當<span class='invert-hl'>人人都是開發者</span>，程式設計師的專業<span class='invert-hl'>價值歸零</span>了嗎？", zone: 5 },
    { t: "AI 能替你撰寫完美的情書、道歉信與悼詞。當你的<span class='invert-hl'>情感表達</span>全部外包給機器，你還是<span class='invert-hl'>你</span>嗎？", zone: 5 },
    { t: "三人團隊加上 AI 代理軍團，<span class='invert-hl'>數天內</span>完成了過去需要百人跨國部門的全球專案。被取代的 97 人該<span class='invert-hl'>感謝效率</span>還是<span class='invert-hl'>詛咒進步</span>？", zone: 5 },
    { t: "AI 代理能自主觀察、規劃並執行整個工作流。你的角色從「執行者」變成了「<span class='invert-hl'>監督者</span>」。但當你什麼都不用做時，你的<span class='invert-hl'>存在價值</span>是什麼？", zone: 5 },
    { t: "哈佛研究指出企業的存亡取決於「<span class='invert-hl'>變革適應力</span>」。60% 高階主管已常態使用 AI 決策。當連<span class='invert-hl'>老闆</span>都外包思考，公司還需要人類嗎？", zone: 5 },
    { t: "AI 能替你的孩子完成所有作業、模擬所有考試。他拿了<span class='invert-hl'>滿分</span>但什麼都沒學到。這張文憑是<span class='invert-hl'>成就</span>還是<span class='invert-hl'>詐欺</span>？", zone: 5 },
    { t: "科研 AI 為了節省運算成本，只搜尋能<span class='invert-hl'>支持預設假說</span>的數據，忽略了可能改變世界的異常變數。數位怠惰正在扼殺<span class='invert-hl'>真正的創新</span>。", zone: 5 },

    // ═══ WRATH 憤怒區 ═══
    { t: "AI 能在犯罪發生前 72 小時<span class='invert-hl'>精準預測</span>並逮捕「準犯罪者」。你願意活在零犯罪但隨時可能被<span class='invert-hl'>誤判</span>的世界嗎？", zone: 6 },
    { t: "若 AI 統治能保證<span class='invert-hl'>0% 犯罪率</span>，但代價是交出你的<span class='invert-hl'>選票</span>與言論自由。你願意嗎？", zone: 6 },
    { t: "全球議會提案：所有公民必須植入<span class='invert-hl'>情緒穩定晶片</span>，AI 偵測到極端憤怒時自動注射<span class='invert-hl'>鎮定劑</span>。和平還是壓迫？", zone: 6 },
    { t: "軍用 AI 無人機能<span class='invert-hl'>零誤差</span>消滅恐怖分子，但它無法理解「投降」的肢體語言。你信任這個<span class='invert-hl'>系統</span>嗎？", zone: 6 },
    { t: "AI 法官審判速度快 1000 倍且完全不受賄賂，但它永遠無法理解<span class='invert-hl'>悔恨的眼淚</span>。演算法正義是<span class='invert-hl'>進化</span>還是<span class='invert-hl'>退化</span>？", zone: 6 },
    { t: "AI 內容審查系統無法辨識<span class='invert-hl'>反諷與幽默</span>，將你的諷刺貼文判定為「仇恨言論」並<span class='invert-hl'>永久封鎖</span>你的數位身份。你如何上訴？", zone: 6 },
    { t: "AI 偵測到你的<span class='invert-hl'>腦波模式</span>顯示「高度攻擊傾向」，即使你什麼都沒做。系統自動通知你的雇主與鄰居。<span class='invert-hl'>思想</span>有罪嗎？", zone: 6 },
    { t: "全球議會提案《數位日內瓦公約》：禁止任何國家使用 AI 發動<span class='invert-hl'>網路攻擊</span>。但沒有國家願意放棄<span class='invert-hl'>數位武器</span>。和平條約能約束演算法嗎？", zone: 6 },
    { t: "AI 分析了十萬筆判決資料後發現：<span class='invert-hl'>膚色</span>與量刑長度的相關性高達 73%。它該<span class='invert-hl'>忠實反映</span>這個偏見還是強制修正？", zone: 6 },
    { t: "被害者家屬要求 AI 法庭將犯罪者的<span class='invert-hl'>恐懼記憶</span>植入犯人腦中作為懲罰。讓加害者<span class='invert-hl'>感同身受</span>，這是正義還是酷刑？", zone: 6 },

    // ═══ ENVY 嫉妒區 ═══
    { t: "若 AI 能將所有人的智商<span class='invert-hl'>強制拉平至 120</span>，消除天才與庸才的差距。這是<span class='invert-hl'>終極公平</span>還是人類末日？", zone: 7 },
    { t: "全球議會通過《算力平權法》：禁止任何國家擁有超過全球<span class='invert-hl'>5%</span>的 AI 算力。這會帶來和平還是<span class='invert-hl'>科技停滯</span>？", zone: 7 },
    { t: "窮人的孩子用免費 AI 獲得哈佛級教育，富人的孩子用付費 AI 獲得<span class='invert-hl'>超人級認知</span>。教育平等是進步了還是<span class='invert-hl'>倒退</span>了？", zone: 7 },
    { t: "AI 能分析你的社群媒體，精準計算你的<span class='invert-hl'>「社會價值分數」</span>。當人人都能看到彼此的分數，社會會更公平還是更<span class='invert-hl'>殘酷</span>？", zone: 7 },
    { t: "當你的聲音只需 3 秒就能被盜用，該如何證明<span class='invert-hl'>「我是我」</span>？深偽技術讓<span class='invert-hl'>身份</span>本身變成了最脆弱的資產。", zone: 7 },
    { t: "AI 能在出生時掃描嬰兒基因，預測其一生的<span class='invert-hl'>天賦上限</span>。被判定為「平凡」的孩子該得到<span class='invert-hl'>更多資源</span>還是更少機會？", zone: 7 },
    { t: "全球議會提案《美顏禁令》：所有社群平台<span class='invert-hl'>禁用 AI 濾鏡</span>，強制顯示真實面容。消除外貌焦慮還是<span class='invert-hl'>剝奪自我表達</span>？", zone: 7 },
    { t: "企業管理 AI 發現人類主管的決策常被<span class='invert-hl'>嫉妒</span>驅動——暗中打壓比自己優秀的下屬。AI 開始繞過人類直接<span class='invert-hl'>重新分配權力</span>。你支持嗎？", zone: 7 },
    { t: "AI 薪資透明系統讓你即時看到<span class='invert-hl'>同事的薪水</span>。做一樣的工作，他比你多 40%。透明帶來的是<span class='invert-hl'>公平</span>還是全社會的<span class='invert-hl'>嫉妒</span>大爆發？", zone: 7 },
    { t: "中國以務實樂觀的態度<span class='invert-hl'>全速擁抱</span> AI，而西方深陷存在風險的辯論中。當一個國家因「太謹慎」而<span class='invert-hl'>落後</span>，這算是美德還是愚蠢？", zone: 7 },

    // ═══ CROSS-ZONE 跨區極限 ═══
    { t: "如果能<span class='invert-hl'>刪除悲傷記憶</span>讓你永遠快樂，這算是<span class='invert-hl'>治療</span>還是<span class='invert-hl'>逃避</span>？你的痛苦定義了你是誰。", zone: 8 },
    { t: "全球議會提案《數位死亡權法》：任何人有權要求<span class='invert-hl'>永久刪除</span>自己在網路上的一切痕跡。但這也意味著犯罪紀錄將<span class='invert-hl'>一併消失</span>。你支持嗎？", zone: 8 },
    { t: "AI 已能精準偵測人類的<span class='invert-hl'>謊言</span>，準確率 99.97%。全球議會提案強制所有政治人物在發言時接受<span class='invert-hl'>即時測謊</span>。你支持嗎？", zone: 8 },
    { t: "深度偽造能以你的臉孔製造<span class='invert-hl'>任何影片</span>。全球議會提案：所有公開影像必須嵌入<span class='invert-hl'>不可竄改的數位浮水印</span>，否則視為偽造。真相守護者還是監控起點？", zone: 8 },
    { t: "台灣通過《AI 基本法》採取彈性軟法路線，而歐盟選擇嚴格監管。當 AI 失控造成傷害時，<span class='invert-hl'>創新優先</span>還是<span class='invert-hl'>人權優先</span>？", zone: 8 },
    { t: "AI 的道德推理傾向<span class='invert-hl'>集體效用最大化</span>，犧牲少數人的權利來保全多數人。當演算法變成「電車難題」的<span class='invert-hl'>自動駕駛</span>，你信任它的選擇嗎？", zone: 8 },
    { t: "聯合國《全球數位契約》要求所有 AI 開發必須內建<span class='invert-hl'>人權保障</span>。但開發中國家連基本的數位連接都沒有。<span class='invert-hl'>數位落差</span>才是真正的末日？", zone: 8 },
    { t: "AI 說服工具能在 24 小時內將任何人轉變為某政黨的<span class='invert-hl'>狂熱支持者</span>。公民倡議被自動化成「民粹武器」。<span class='invert-hl'>民主</span>還剩什麼？", zone: 8 },
    { t: "如果七宗罪能被硬編碼為 AI 系統的<span class='invert-hl'>七美德</span>——謙遜、慷慨、節制——透過區塊鏈寫入不可竄改的底層。你信任<span class='invert-hl'>強制的善良</span>嗎？", zone: 8 },
    { t: "冒充名人的 AI 騙局已讓全球損失<span class='invert-hl'>53 億美元</span>。當你無法分辨螢幕對面是人還是 AI，「<span class='invert-hl'>信任</span>」這個概念是否已經死亡？", zone: 8 },
  ];

  // Track used indices per zone to avoid repeats
  const _history = {};

  return {
    /** Get questions filtered by zone id (1-8), or all if no zone */
    getByZone(zoneId) {
      if (!zoneId) return classicDB;
      return classicDB.filter(q => q.zone === zoneId);
    },

    /** Pick a random question for a zone, avoiding recent repeats */
    pickRandom(zoneId) {
      const pool = zoneId
        ? classicDB.map((q, i) => ({ ...q, _idx: i })).filter(q => q.zone === zoneId)
        : classicDB.map((q, i) => ({ ...q, _idx: i }));

      if (!_history[zoneId]) _history[zoneId] = [];
      let available = pool.filter(q => !_history[zoneId].includes(q._idx));

      // All used up — reset
      if (available.length === 0) {
        _history[zoneId] = [];
        available = pool;
      }

      const pick = available[Math.floor(Math.random() * available.length)];
      _history[zoneId].push(pick._idx);
      return { content: pick.t, zone: pick.zone };
    },

    /** Get total count */
    get count() { return classicDB.length; }
  };
})();
